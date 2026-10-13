// Pure cart maths — no DB access, so it is easy to test and reuse at checkout.
// All amounts are integer paise.

export type PricedLine = {
  lineTotal: number;
  productIds: string[]; // products contained in the line (for coupon scope)
  bundleId: string | null;
  categoryIds?: string[]; // single products only (for automatic-discount scope)
  qty?: number; // units in the line (default 1)
};

export type CouponRule = {
  code: string;
  type: "PERCENT" | "FLAT";
  value: number; // percent, or paise for FLAT
  minOrder: number;
  firstOrderOnly: boolean;
  scope: { productIds?: string[]; bundleIds?: string[] } | null;
  usageLimit: number | null;
  perUserLimit: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
  isActive: boolean;
};

export type CouponContext = {
  now: Date;
  userId: string | null;
  usesTotal: number;
  usesByUser: number;
  priorOrders: number; // the user's non-cancelled orders
};

export type CouponResult = { ok: true; discount: number; description: string } | { ok: false; reason: string };

const rupees = (paise: number) => `₹${new Intl.NumberFormat("en-IN").format(Math.round(paise / 100))}`;

export function evaluateCoupon(coupon: CouponRule, lines: PricedLine[], ctx: CouponContext): CouponResult {
  if (!coupon.isActive) return { ok: false, reason: "This code isn't active" };
  if (coupon.startsAt && ctx.now < coupon.startsAt) return { ok: false, reason: "This code isn't active yet" };
  if (coupon.endsAt && ctx.now > coupon.endsAt) return { ok: false, reason: "This code has expired" };
  if (coupon.usageLimit !== null && ctx.usesTotal >= coupon.usageLimit) return { ok: false, reason: "This code has been fully used" };
  if (coupon.firstOrderOnly && !ctx.userId) return { ok: false, reason: "Sign in to use this code" };
  if (coupon.firstOrderOnly && ctx.priorOrders > 0) return { ok: false, reason: "This code is for your first order" };
  // Per-customer limits need to know the customer; guests are checked again at checkout, which requires login.
  if (ctx.userId && coupon.perUserLimit !== null && ctx.usesByUser >= coupon.perUserLimit) {
    return { ok: false, reason: "You've already used this code" };
  }

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  if (subtotal < coupon.minOrder) {
    return { ok: false, reason: `Add ${rupees(coupon.minOrder - subtotal)} more to use this code` };
  }

  const productScope = coupon.scope?.productIds ?? [];
  const bundleScope = coupon.scope?.bundleIds ?? [];
  const scoped = productScope.length > 0 || bundleScope.length > 0;
  const eligible = scoped
    ? lines
        .filter((l) => (l.bundleId && bundleScope.includes(l.bundleId)) || l.productIds.some((id) => productScope.includes(id)))
        .reduce((s, l) => s + l.lineTotal, 0)
    : subtotal;
  if (eligible === 0) return { ok: false, reason: "This code doesn't apply to anything in your cart" };

  const discount =
    coupon.type === "PERCENT"
      ? Math.min(eligible, Math.round((eligible * coupon.value) / 100 / 100) * 100)
      : Math.min(eligible, coupon.value);
  const description = coupon.type === "PERCENT" ? `${coupon.value}% off` : `${rupees(coupon.value)} off`;
  return { ok: true, discount, description: scoped ? `${description} selected items` : description };
}

// ── Automatic discounts (no code) ─────────────────────────────────────────

export type AutoRule = {
  name: string;
  type: "PERCENT" | "FLAT" | "BUY_X_GET_Y" | "FREE_SHIPPING";
  value: number; // percent (PERCENT, BUY_X_GET_Y) or paise (FLAT)
  buyQty: number;
  getQty: number;
  minQty: number;
  minAmount: number; // paise
  scope: { productIds?: string[]; categoryIds?: string[]; bundleIds?: string[] } | null;
  startsAt: Date | null;
  endsAt: Date | null;
  isActive: boolean;
};

export type AutoResult = {
  discount: number;
  freeShipping: boolean;
  applied: { label: string; amount: number }[];
  nudge: string | null; // e.g. "Add 1 more ornament to get 1 free"
};

const roundRupee = (paise: number) => Math.round(paise / 100) * 100;

function inScope(rule: AutoRule, l: PricedLine) {
  const p = rule.scope?.productIds ?? [];
  const c = rule.scope?.categoryIds ?? [];
  const b = rule.scope?.bundleIds ?? [];
  if (!p.length && !c.length && !b.length) return true;
  if (l.bundleId) return b.includes(l.bundleId);
  return l.productIds.some((id) => p.includes(id)) || (l.categoryIds ?? []).some((id) => c.includes(id));
}

/** The best single money-off offer, plus free shipping if any free-shipping offer qualifies. Offers don't stack with each other. */
export function evaluateAutoDiscounts(rules: AutoRule[], lines: PricedLine[], now: Date): AutoResult {
  let best: { label: string; amount: number } | null = null;
  let freeShip: string | null = null;
  let nudge: string | null = null;

  for (const r of rules) {
    if (!r.isActive || (r.startsAt && now < r.startsAt) || (r.endsAt && now > r.endsAt)) continue;
    const eligible = lines.filter((l) => inScope(r, l));
    const qty = eligible.reduce((n, l) => n + (l.qty ?? 1), 0);
    const amount = eligible.reduce((n, l) => n + l.lineTotal, 0);
    if (qty === 0) continue;

    if (r.type === "BUY_X_GET_Y") {
      const group = r.buyQty + r.getQty;
      if (r.buyQty < 1 || r.getQty < 1) continue;
      // Every unit, priciest first; in each group of buy+get the cheapest `get` units are discounted.
      const units = eligible.flatMap((l) => Array(Math.min(l.qty ?? 1, 100)).fill(l.lineTotal / (l.qty ?? 1)) as number[]).sort((x, y) => y - x);
      const groups = Math.floor(units.length / group);
      if (groups === 0 || amount < r.minAmount) {
        if (!nudge && groups === 0 && units.length >= r.buyQty - 1) nudge = `Add ${group - units.length} more to unlock “${r.name}”`;
        continue;
      }
      let off = 0;
      for (let g = 0; g < groups; g++) for (let k = r.buyQty; k < group; k++) off += (units[g * group + k] * r.value) / 100;
      off = roundRupee(off);
      if (off > 0 && (!best || off > best.amount)) best = { label: r.name, amount: off };
      continue;
    }

    if (qty < r.minQty || amount < r.minAmount) {
      if (!nudge && r.minAmount > amount && r.minAmount - amount <= r.minAmount / 2) nudge = `Add ${rupees(r.minAmount - amount)} more to unlock “${r.name}”`;
      else if (!nudge && r.minQty > qty && r.minQty - qty <= 2) nudge = `Add ${r.minQty - qty} more to unlock “${r.name}”`;
      continue;
    }
    if (r.type === "FREE_SHIPPING") {
      freeShip ??= r.name;
      continue;
    }
    const off = r.type === "PERCENT" ? Math.min(amount, roundRupee((amount * r.value) / 100)) : Math.min(amount, r.value);
    if (off > 0 && (!best || off > best.amount)) best = { label: r.name, amount: off };
  }

  const applied = [...(best ? [best] : []), ...(freeShip ? [{ label: freeShip, amount: 0 }] : [])];
  return { discount: best?.amount ?? 0, freeShipping: Boolean(freeShip), applied, nudge: best || freeShip ? null : nudge };
}

export type TotalsSettings = { freeShippingThreshold: number; shippingFee: number; giftWrapPrice: number };

export function cartTotals(lines: PricedLine[], discount: number, giftWrap: boolean, s: TotalsSettings, freeShipping = false) {
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  discount = Math.min(discount, subtotal);
  const afterDiscount = subtotal - discount;
  const empty = lines.length === 0;
  const shipping = empty || freeShipping || afterDiscount >= s.freeShippingThreshold ? 0 : s.shippingFee;
  const giftWrapFee = !empty && giftWrap ? s.giftWrapPrice : 0;
  return {
    subtotal,
    discount,
    shipping,
    giftWrapFee,
    total: afterDiscount + shipping + giftWrapFee,
    freeShippingRemaining: empty ? s.freeShippingThreshold : freeShipping ? 0 : Math.max(0, s.freeShippingThreshold - afterDiscount),
  };
}

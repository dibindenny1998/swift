// Pure cart maths — no DB access, so it is easy to test and reuse at checkout.
// All amounts are integer paise.

export type PricedLine = {
  lineTotal: number;
  productIds: string[]; // products contained in the line (for coupon scope)
  bundleId: string | null;
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

export type TotalsSettings = { freeShippingThreshold: number; shippingFee: number; giftWrapPrice: number };

export function cartTotals(lines: PricedLine[], discount: number, giftWrap: boolean, s: TotalsSettings) {
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const afterDiscount = subtotal - discount;
  const empty = lines.length === 0;
  const shipping = empty || afterDiscount >= s.freeShippingThreshold ? 0 : s.shippingFee;
  const giftWrapFee = !empty && giftWrap ? s.giftWrapPrice : 0;
  return {
    subtotal,
    discount,
    shipping,
    giftWrapFee,
    total: afterDiscount + shipping + giftWrapFee,
    freeShippingRemaining: empty ? s.freeShippingThreshold : Math.max(0, s.freeShippingThreshold - afterDiscount),
  };
}

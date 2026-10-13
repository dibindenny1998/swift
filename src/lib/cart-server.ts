import "server-only";
import type { Prisma } from "@prisma/client";
import { cartTotals, evaluateAutoDiscounts, evaluateCoupon, type AutoRule, type CouponRule, type PricedLine } from "./cart-pricing";
import { db } from "./db";
import { bundlePrice, byoPrice } from "./pricing";
import { clearCartSession, getCartSessionId, getSession, newCartSessionId } from "./session";
import { getSettings } from "./settings-server";

export const MAX_LINE_QTY = 10;
const FALLBACK_IMAGE = "/placeholders/gifts.svg";

export class CartError extends Error {}

type ByoSelection = { picks: Record<string, number>; message?: string };

const itemInclude = {
  variant: {
    include: {
      product: {
        include: { images: { orderBy: { sortOrder: "asc" as const }, take: 1 }, _count: { select: { variants: true } } },
      },
    },
  },
  bundle: {
    include: {
      tiers: true,
      items: {
        include: {
          variant: { include: { product: { include: { images: { orderBy: { sortOrder: "asc" as const }, take: 1 } } } } },
        },
      },
    },
  },
} satisfies Prisma.CartItemInclude;

type CartItemRow = Prisma.CartItemGetPayload<{ include: typeof itemInclude }>;

export type CartLineView = {
  id: string;
  kind: "variant" | "bundle" | "byo";
  title: string;
  detail: string | null;
  image: string;
  href: string;
  unitPrice: number;
  qty: number;
  lineTotal: number;
  maxQty: number;
  issue: string | null;
};

export type CartView = {
  items: CartLineView[];
  count: number;
  subtotal: number;
  discount: number;
  shipping: number;
  giftWrapFee: number;
  total: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  coupon: { code: string; description: string } | null;
  couponError: string | null;
  /** Each saving, in order: automatic offers first, then the coupon. Free-shipping offers have amount 0. */
  discounts: { label: string; amount: number }[];
  /** Hint towards the nearest offer, e.g. "Add 1 more to unlock “Buy 2, get 1 free”". */
  offerNudge: string | null;
  giftWrap: boolean;
  giftWrapPrice: number;
  giftMessage: string | null;
  hasIssues: boolean;
};

// ── Finding the cart ──────────────────────────────────────────────────────

async function findCart(create: boolean) {
  const session = await getSession();
  if (session) {
    const cart = await db.cart.findFirst({ where: { userId: session.uid }, orderBy: { updatedAt: "desc" } });
    if (cart || !create) return cart;
    return db.cart.create({ data: { userId: session.uid } });
  }
  const sid = await getCartSessionId();
  if (sid) {
    const cart = await db.cart.findUnique({ where: { sessionId: sid } });
    if (cart || !create) return cart;
  }
  if (!create) return null;
  return db.cart.create({ data: { sessionId: await newCartSessionId() } });
}

async function touch(cartId: string) {
  await db.cart.update({ where: { id: cartId }, data: { updatedAt: new Date() } });
}

// ── Pricing every line from current DB data ───────────────────────────────

function readSelection(json: Prisma.JsonValue | null): ByoSelection | null {
  if (!json || typeof json !== "object" || Array.isArray(json)) return null;
  const picks = (json as { picks?: unknown }).picks;
  if (!picks || typeof picks !== "object") return null;
  const message = (json as { message?: unknown }).message;
  return { picks: picks as Record<string, number>, message: typeof message === "string" ? message : undefined };
}

export type Component = { variantId: string; qty: number };

function priceItem(row: CartItemRow): { view: CartLineView; priced: PricedLine; components: Component[] } {
  const qty = row.qty;

  if (row.variant) {
    const v = row.variant;
    const p = v.product;
    const live = p.isLive;
    const issue = !live ? "No longer available" : v.stock <= 0 ? "Sold out" : qty > v.stock ? `Only ${v.stock} left` : null;
    return {
      view: {
        id: row.id,
        kind: "variant",
        title: p.title,
        detail: p._count.variants > 1 ? v.name : null,
        image: p.images[0]?.url ?? FALLBACK_IMAGE,
        href: `/products/${p.slug}`,
        unitPrice: v.price,
        qty,
        lineTotal: v.price * qty,
        maxQty: Math.max(1, Math.min(MAX_LINE_QTY, v.stock)),
        issue,
      },
      priced: { lineTotal: v.price * qty, productIds: [p.id], bundleId: null, categoryIds: [p.categoryId], qty },
      components: [{ variantId: v.id, qty: 1 }],
    };
  }

  const b = row.bundle!;
  if (b.type === "FIXED") {
    const { price } = bundlePrice(
      b.items.map((i) => ({ price: i.variant.price, qty: i.qty })),
      b.discountType,
      b.discountValue,
    );
    const maxByStock = Math.min(...b.items.map((i) => Math.floor(i.variant.stock / i.qty)));
    const issue = !b.isLive ? "No longer available" : maxByStock <= 0 ? "Sold out" : qty > maxByStock ? `Only ${maxByStock} left` : null;
    return {
      view: {
        id: row.id,
        kind: "bundle",
        title: b.title,
        detail: b.description || null,
        image: b.imageUrl ?? FALLBACK_IMAGE,
        href: `/bundles/${b.slug}`,
        unitPrice: price,
        qty,
        lineTotal: price * qty,
        maxQty: Math.max(1, Math.min(MAX_LINE_QTY, maxByStock)),
        issue,
      },
      priced: { lineTotal: price * qty, productIds: b.items.map((i) => i.variant.productId), bundleId: b.id, qty },
      components: b.items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
    };
  }

  // Build-your-own box: re-price the picks against today's prices and tiers.
  const sel = readSelection(row.byoSelection);
  const eligible = new Map(b.items.map((i) => [i.variantId, i.variant]));
  const picks = Object.entries(sel?.picks ?? {}).filter(([, n]) => Number.isInteger(n) && n > 0);
  const missing = picks.some(([id]) => !eligible.get(id) || !eligible.get(id)!.product.isLive);
  const short = picks.find(([id, n]) => (eligible.get(id)?.stock ?? 0) < n * qty);
  const count = picks.reduce((s, [, n]) => s + n, 0);
  const subtotal = picks.reduce((s, [id, n]) => s + (eligible.get(id)?.price ?? 0) * n, 0);
  const { total } = byoPrice(subtotal, count, b.tiers);
  const names = picks.map(([id, n]) => `${n > 1 ? `${n} × ` : ""}${eligible.get(id)?.product.title ?? "Unavailable item"}`);
  const firstImage = picks.map(([id]) => eligible.get(id)?.product.images[0]?.url).find(Boolean);
  const issue = !b.isLive || missing || count === 0 ? "Some pieces are no longer available" : short ? "A piece in this box is low on stock" : null;
  return {
    view: {
      id: row.id,
      kind: "byo",
      title: `Gift box · ${count} piece${count === 1 ? "" : "s"}`,
      detail: [names.join(", "), sel?.message ? `Note: “${sel.message}”` : null].filter(Boolean).join(" · "),
      image: firstImage ?? b.imageUrl ?? FALLBACK_IMAGE,
      href: "/gift-box",
      unitPrice: total,
      qty,
      lineTotal: total * qty,
      maxQty: MAX_LINE_QTY,
      issue,
    },
    priced: {
      lineTotal: total * qty,
      productIds: picks.map(([id]) => eligible.get(id)?.productId).filter((x): x is string => Boolean(x)),
      bundleId: b.id,
      qty,
    },
    components: picks.map(([id, n]) => ({ variantId: id, qty: n })),
  };
}

export async function couponFor(code: string, userId: string | null, lines: PricedLine[]) {
  const coupon = await db.coupon.findUnique({ where: { code } });
  if (!coupon) return { ok: false as const, reason: "That code isn't valid" };
  const [usesTotal, usesByUser, priorOrders] = await Promise.all([
    db.couponUse.count({ where: { couponId: coupon.id } }),
    userId ? db.couponUse.count({ where: { couponId: coupon.id, userId } }) : 0,
    userId
      ? db.order.count({
          // Unpaid online attempts don't count as a previous order.
          where: { userId, OR: [{ status: { notIn: ["PENDING", "CANCELLED"] } }, { status: "PENDING", paymentMethod: "COD" }] },
        })
      : 0,
  ]);
  const rule: CouponRule = { ...coupon, scope: (coupon.scope as CouponRule["scope"]) ?? null };
  return evaluateCoupon(rule, lines, { now: new Date(), userId, usesTotal, usesByUser, priorOrders });
}

async function buildView(cart: { id: string; userId: string | null; couponCode: string | null; giftWrap: boolean; giftMessage: string | null } | null): Promise<CartView> {
  const settings = await getSettings();
  const rows = cart
    ? await db.cartItem.findMany({ where: { cartId: cart.id }, include: itemInclude, orderBy: { id: "asc" } })
    : [];
  const priced = rows.map(priceItem);
  const lines = priced.map((p) => p.priced);

  const auto = lines.length ? evaluateAutoDiscounts(await activeAutoRules(), lines, new Date()) : { discount: 0, freeShipping: false, applied: [], nudge: null };
  let coupon: CartView["coupon"] = null;
  let couponError: string | null = null;
  let couponDiscount = 0;
  if (cart?.couponCode && lines.length) {
    const r = await couponFor(cart.couponCode, cart.userId, lines);
    if (r.ok) {
      couponDiscount = r.discount;
      coupon = { code: cart.couponCode, description: r.description };
    } else {
      coupon = { code: cart.couponCode, description: "" };
      couponError = r.reason;
    }
  }

  const totals = cartTotals(lines, auto.discount + couponDiscount, cart?.giftWrap ?? true, settings, auto.freeShipping);
  const discounts = [...auto.applied, ...(coupon && !couponError && couponDiscount ? [{ label: `Code ${coupon.code}`, amount: couponDiscount }] : [])];
  return {
    items: priced.map((p) => p.view),
    count: priced.reduce((n, p) => n + p.view.qty, 0),
    ...totals,
    freeShippingThreshold: settings.freeShippingThreshold,
    coupon,
    couponError,
    discounts,
    offerNudge: auto.nudge,
    giftWrap: cart?.giftWrap ?? true,
    giftWrapPrice: settings.giftWrapPrice,
    giftMessage: cart?.giftMessage ?? null,
    hasIssues: priced.some((p) => p.view.issue !== null),
  };
}

/** Automatic discounts that are switched on (dates are checked when evaluating). */
async function activeAutoRules(): Promise<AutoRule[]> {
  const rows = await db.autoDiscount.findMany({ where: { isActive: true } });
  return rows.map((r) => ({ ...r, scope: (r.scope as AutoRule["scope"]) ?? null }));
}

export async function getCartView() {
  return buildView(await findCart(false));
}

// ── Mutations ─────────────────────────────────────────────────────────────

export type AddInput =
  | { variantId: string; qty: number }
  | { bundleId: string; qty: number }
  | { byo: { bundleId: string; picks: Record<string, number>; message?: string } };

function sameSelection(a: Prisma.JsonValue | null, b: ByoSelection) {
  const x = readSelection(a);
  if (!x) return false;
  const norm = (s: ByoSelection) =>
    JSON.stringify([Object.entries(s.picks).sort(([p], [q]) => p.localeCompare(q)), s.message?.trim() || ""]);
  return norm(x) === norm(b);
}

export async function addItem(input: AddInput) {
  const cart = (await findCart(true))!;
  const existing = await db.cartItem.findMany({ where: { cartId: cart.id } });

  if ("variantId" in input) {
    const v = await db.variant.findUnique({ where: { id: input.variantId }, include: { product: true } });
    if (!v || !v.product.isLive) throw new CartError("This item isn't available");
    if (v.stock <= 0) throw new CartError("Sorry, this just sold out");
    const line = existing.find((i) => i.variantId === v.id);
    const qty = Math.min((line?.qty ?? 0) + input.qty, MAX_LINE_QTY, v.stock);
    if (line) await db.cartItem.update({ where: { id: line.id }, data: { qty } });
    else await db.cartItem.create({ data: { cartId: cart.id, variantId: v.id, qty } });
  } else if ("bundleId" in input) {
    const b = await db.bundle.findUnique({ where: { id: input.bundleId }, include: { items: { include: { variant: true } } } });
    if (!b || !b.isLive || b.type !== "FIXED") throw new CartError("This kit isn't available");
    const maxByStock = Math.min(...b.items.map((i) => Math.floor(i.variant.stock / i.qty)));
    if (maxByStock <= 0) throw new CartError("Sorry, this kit just sold out");
    const line = existing.find((i) => i.bundleId === b.id && !i.byoSelection);
    const qty = Math.min((line?.qty ?? 0) + input.qty, MAX_LINE_QTY, maxByStock);
    if (line) await db.cartItem.update({ where: { id: line.id }, data: { qty } });
    else await db.cartItem.create({ data: { cartId: cart.id, bundleId: b.id, qty } });
  } else {
    const { bundleId, picks, message } = input.byo;
    const b = await db.bundle.findUnique({ where: { id: bundleId }, include: { items: { include: { variant: true } } } });
    if (!b || !b.isLive || b.type !== "BUILD_YOUR_OWN") throw new CartError("The gift box isn't available");
    const eligible = new Map(b.items.map((i) => [i.variantId, i.variant]));
    const clean: Record<string, number> = {};
    for (const [id, n] of Object.entries(picks)) {
      const v = eligible.get(id);
      if (!v) throw new CartError("One of those pieces can't go in a gift box");
      if (!Number.isInteger(n) || n < 1) continue;
      if (v.stock < n) throw new CartError("One of your pieces is low on stock — please pick fewer");
      clean[id] = n;
    }
    const count = Object.values(clean).reduce((a, c) => a + c, 0);
    if (count === 0) throw new CartError("Pick at least one piece");
    if (count > MAX_LINE_QTY) throw new CartError(`A box holds up to ${MAX_LINE_QTY} pieces`);
    const selection: ByoSelection = { picks: clean, ...(message?.trim() ? { message: message.trim().slice(0, 200) } : {}) };
    const line = existing.find((i) => i.bundleId === b.id && sameSelection(i.byoSelection, selection));
    if (line) await db.cartItem.update({ where: { id: line.id }, data: { qty: Math.min(line.qty + 1, MAX_LINE_QTY) } });
    else await db.cartItem.create({ data: { cartId: cart.id, bundleId: b.id, qty: 1, byoSelection: selection } });
  }
  await touch(cart.id);
  return buildView(cart);
}

export async function updateItem(itemId: string, qty: number) {
  const cart = await findCart(false);
  if (!cart) throw new CartError("Your cart is empty");
  const item = await db.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
  if (!item) throw new CartError("That item isn't in your cart");
  if (qty <= 0) await db.cartItem.delete({ where: { id: item.id } });
  else await db.cartItem.update({ where: { id: item.id }, data: { qty: Math.min(qty, MAX_LINE_QTY) } });
  await touch(cart.id);
  return buildView(cart);
}

export async function setCoupon(code: string | null) {
  const cart = await findCart(code !== null);
  if (!cart) return buildView(null);
  if (code) {
    const rows = await db.cartItem.findMany({ where: { cartId: cart.id }, include: itemInclude });
    const r = await couponFor(code, cart.userId, rows.map((row) => priceItem(row).priced));
    if (!r.ok) throw new CartError(r.reason);
  }
  const updated = await db.cart.update({ where: { id: cart.id }, data: { couponCode: code } });
  return buildView(updated);
}

export async function setGift(giftWrap: boolean, giftMessage: string | null) {
  const cart = (await findCart(true))!;
  const updated = await db.cart.update({
    where: { id: cart.id },
    data: { giftWrap, giftMessage: giftMessage?.trim().slice(0, 200) || null },
  });
  return buildView(updated);
}

/** On login: move the guest cart's lines into the user's cart, then drop the guest cart. */
export async function mergeGuestCart(userId: string) {
  const sid = await getCartSessionId();
  if (!sid) return;
  const guest = await db.cart.findUnique({ where: { sessionId: sid }, include: { items: true } });
  await clearCartSession();
  if (!guest) return;

  const userCart =
    (await db.cart.findFirst({ where: { userId }, orderBy: { updatedAt: "desc" }, include: { items: true } })) ??
    (await db.cart.create({ data: { userId }, include: { items: true } }));

  await db.$transaction(async (tx) => {
    for (const g of guest.items) {
      const match = userCart.items.find((u) =>
        g.byoSelection
          ? u.bundleId === g.bundleId && sameSelection(u.byoSelection, readSelection(g.byoSelection)!)
          : (g.variantId && u.variantId === g.variantId) || (g.bundleId && u.bundleId === g.bundleId && !u.byoSelection),
      );
      if (match) {
        await tx.cartItem.update({ where: { id: match.id }, data: { qty: Math.min(match.qty + g.qty, MAX_LINE_QTY) } });
      } else {
        await tx.cartItem.update({ where: { id: g.id }, data: { cartId: userCart.id } });
      }
    }
    await tx.cart.update({
      where: { id: userCart.id },
      data: {
        updatedAt: new Date(),
        couponCode: userCart.couponCode ?? guest.couponCode,
        giftMessage: userCart.giftMessage ?? guest.giftMessage,
      },
    });
    await tx.cart.delete({ where: { id: guest.id } });
  });
}

// ── Checkout ──────────────────────────────────────────────────────────────

export type OrderLine = {
  variantId: string | null;
  bundleId: string | null;
  title: string;
  detail: string | null;
  unitPrice: number;
  qty: number;
  components: Component[];
};

/** The signed-in user's cart, priced, plus everything needed to write order lines. */
export async function loadCheckout(userId: string) {
  const cart = await db.cart.findFirst({ where: { userId }, orderBy: { updatedAt: "desc" } });
  if (!cart) return null;
  const rows = await db.cartItem.findMany({ where: { cartId: cart.id }, include: itemInclude, orderBy: { id: "asc" } });
  const priced = rows.map(priceItem);
  const view = await buildView(cart);
  const lines: OrderLine[] = rows.map((row, i) => ({
    variantId: row.variantId,
    bundleId: row.bundleId,
    title: priced[i].view.title,
    detail: priced[i].view.detail,
    unitPrice: priced[i].view.unitPrice,
    qty: row.qty,
    components: priced[i].components,
  }));
  const couponId = cart.couponCode && view.coupon && !view.couponError
    ? (await db.coupon.findUnique({ where: { code: cart.couponCode }, select: { id: true } }))?.id ?? null
    : null;
  return { cart, view, lines, couponId };
}

// ── Abandoned carts (admin) ───────────────────────────────────────────────

/** Signed-in customers' carts with items that haven't been touched for `idleHours`. Guest carts have no contact details, so they're left out. */
export async function abandonedCarts(idleHours = 1, maxDays = 30) {
  const now = Date.now();
  const carts = await db.cart.findMany({
    where: {
      userId: { not: null },
      items: { some: {} },
      updatedAt: { lt: new Date(now - idleHours * 36e5), gt: new Date(now - maxDays * 864e5) },
    },
    include: { user: { select: { id: true, name: true, phone: true, email: true } } },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  return Promise.all(
    carts.map(async (c) => {
      const view = await buildView(c);
      return { id: c.id, updatedAt: c.updatedAt, remindedAt: c.remindedAt, user: c.user!, view };
    }),
  );
}

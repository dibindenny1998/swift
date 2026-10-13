import "server-only";
import type { Prisma } from "@prisma/client";
import { loadCheckout } from "./cart-server";
import { db } from "./db";
import { orderEmailHtml, sendEmail, type EmailOrder } from "./email";
import { isForward, paymentLabel, statusLabel, type PaymentMethod, type Status } from "./order-status";
import { orderLabel, readComponents, stockNeeds } from "./order-utils";
import { createRazorpayOrder, razorpayConfigured } from "./razorpay";
import { getSettings } from "./settings-server";

export class CheckoutError extends Error {
  constructor(
    message: string,
    public status = 409,
  ) {
    super(message);
  }
}

type Tx = Prisma.TransactionClient;

export type AddressSnapshot = {
  name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  email?: string | null;
};

export const formatAddress = (a: AddressSnapshot) =>
  [a.name, a.line1, a.line2, `${a.city}, ${a.state} ${a.pincode}`].filter(Boolean).join(", ");

/** Take stock for every variant, all-or-nothing. Returns the variants that were short. */
export async function takeStock(tx: Tx, needs: Map<string, number>) {
  const short: string[] = [];
  for (const [variantId, qty] of needs) {
    const r = await tx.variant.updateMany({ where: { id: variantId, stock: { gte: qty } }, data: { stock: { decrement: qty } } });
    if (r.count === 0) short.push(variantId);
  }
  return short;
}

function orderNeeds(items: { qty: number; components: Prisma.JsonValue | null }[]) {
  return stockNeeds(items.map((i) => ({ qty: i.qty, components: readComponents(i.components) })));
}

async function clearCart(tx: Tx, cartId: string) {
  await tx.cartItem.deleteMany({ where: { cartId } });
  await tx.cart.update({ where: { id: cartId }, data: { couponCode: null, giftMessage: null, giftWrap: true } });
}

// ── Placing an order ──────────────────────────────────────────────────────

export async function placeOrder(input: {
  userId: string;
  addressId: string;
  paymentMethod: "RAZORPAY" | "COD";
  email: string | null;
}) {
  const settings = await getSettings();
  const checkout = await loadCheckout(input.userId);
  if (!checkout || checkout.lines.length === 0) throw new CheckoutError("Your cart is empty");
  const { view, lines, cart, couponId } = checkout;
  if (view.hasIssues) throw new CheckoutError("Some items in your cart need attention — please review your cart");
  if (view.couponError) throw new CheckoutError(`${view.couponError}. Remove the code to continue.`);

  const address = await db.address.findFirst({ where: { id: input.addressId, userId: input.userId } });
  if (!address) throw new CheckoutError("Please choose a delivery address", 400);

  if (input.paymentMethod === "COD" && !settings.codEnabled) throw new CheckoutError("Cash on delivery isn't available right now", 400);
  if (input.paymentMethod === "RAZORPAY" && !razorpayConfigured()) {
    throw new CheckoutError("Online payment isn't set up yet — please choose cash on delivery", 503);
  }

  const codFee = input.paymentMethod === "COD" ? settings.codFee : 0;
  const total = view.total + codFee;
  const snapshot: AddressSnapshot = {
    name: address.name,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    email: input.email,
  };
  if (input.email) {
    // Remember the email for next time, unless another account already uses it.
    const taken = await db.user.findFirst({ where: { email: input.email, NOT: { id: input.userId } }, select: { id: true } });
    if (!taken) await db.user.update({ where: { id: input.userId }, data: { email: input.email } });
  }

  const data: Prisma.OrderCreateInput = {
    user: { connect: { id: input.userId } },
    events: { create: { status: "PENDING", note: input.paymentMethod === "COD" ? "Cash on delivery order placed" : "Awaiting online payment" } },
    addressSnapshot: snapshot,
    paymentMethod: input.paymentMethod,
    subtotal: view.subtotal,
    discount: view.discount,
    discountNote: view.discounts.length ? view.discounts.map((d) => (d.amount ? `${d.label} (₹${Math.round(d.amount / 100)})` : d.label)).join(" · ") : null,
    shipping: view.shipping,
    codFee,
    giftWrap: view.giftWrapFee,
    giftWrapped: view.giftWrap,
    total,
    coupon: couponId ? { connect: { id: couponId } } : undefined,
    giftMessage: view.giftWrap ? view.giftMessage : null,
    items: {
      create: lines.map((l) => ({
        variantId: l.variantId,
        bundleId: l.bundleId,
        titleSnapshot: l.title,
        detailSnapshot: l.detail,
        priceSnapshot: l.unitPrice,
        qty: l.qty,
        components: l.components,
      })),
    },
  };

  if (input.paymentMethod === "COD") {
    // COD: reserve stock now, all-or-nothing, and clear the cart.
    const order = await db.$transaction(async (tx) => {
      const order = await tx.order.create({ data, include: { items: true } });
      const short = await takeStock(tx, orderNeeds(order.items));
      if (short.length) throw new CheckoutError("Sorry — something in your cart just sold out. Please review your cart.");
      if (couponId) await tx.couponUse.create({ data: { couponId, userId: input.userId, orderId: order.id } });
      await clearCart(tx, cart.id);
      return order;
    });
    void sendOrderEmails(order.id, "placed");
    return { order: { id: order.id, label: orderLabel(order.number) }, razorpay: null };
  }

  // Online: create the order, then a Razorpay order for the same amount. Stock is taken when payment succeeds.
  const order = await db.order.create({ data });
  const label = orderLabel(order.number);
  let razorpayOrderId: string;
  try {
    razorpayOrderId = await createRazorpayOrder(total, label, { orderId: order.id, label });
    await db.payment.create({ data: { orderId: order.id, razorpayOrderId, status: "created", amount: total } });
  } catch (e) {
    // Don't leave an unpayable order behind.
    await db.order.delete({ where: { id: order.id } }).catch(() => {});
    console.error(e);
    throw new CheckoutError("We couldn't reach the payment gateway. Please try again.", 502);
  }
  const user = await db.user.findUnique({ where: { id: input.userId }, select: { phone: true, email: true, name: true } });
  return {
    order: { id: order.id, label },
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID!,
      orderId: razorpayOrderId,
      amount: total,
      currency: "INR",
      prefill: { name: address.name, contact: user?.phone ?? address.phone, email: input.email ?? user?.email ?? undefined },
    },
  };
}

// ── Payment success (checkout handler + webhook; safe to call twice) ──────

export async function markOrderPaid(razorpayOrderId: string, razorpayPaymentId: string, raw: unknown) {
  const payment = await db.payment.findUnique({ where: { razorpayOrderId }, include: { order: { include: { items: true } } } });
  if (!payment) return { ok: false as const, reason: "unknown order" };
  const order = payment.order;
  if (order.status !== "PENDING") return { ok: true as const, orderId: order.id, already: true };

  const shortVariants = await db.$transaction(async (tx) => {
    // Lock in the transition first so a concurrent webhook can't double-process.
    const moved = await tx.order.updateMany({ where: { id: order.id, status: "PENDING" }, data: { status: "PAID" } });
    if (moved.count === 0) return null;
    const short = await takeStock(tx, orderNeeds(order.items));
    await tx.orderEvent.create({ data: { orderId: order.id, status: "PAID", note: "Payment received" } });
    await tx.payment.update({
      where: { id: payment.id },
      data: { razorpayPaymentId, status: "captured", raw: (raw ?? {}) as Prisma.InputJsonValue },
    });
    if (order.couponId) {
      await tx.couponUse.upsert({
        where: { orderId: order.id },
        update: {},
        create: { couponId: order.couponId, userId: order.userId, orderId: order.id },
      });
    }
    const cart = await tx.cart.findFirst({ where: { userId: order.userId }, orderBy: { updatedAt: "desc" } });
    if (cart) await clearCart(tx, cart.id);
    return short;
  });
  if (shortVariants === null) return { ok: true as const, orderId: order.id, already: true };

  void sendOrderEmails(order.id, "paid", shortVariants);
  return { ok: true as const, orderId: order.id, already: false };
}

export async function markPaymentFailed(razorpayOrderId: string, raw: unknown) {
  await db.payment.updateMany({
    where: { razorpayOrderId, status: { not: "captured" } },
    data: { status: "failed", raw: (raw ?? {}) as Prisma.InputJsonValue },
  });
}

/** Put stock back when an order is cancelled or returned (used by admin). */
export async function releaseStock(orderId: string) {
  const items = await db.orderItem.findMany({ where: { orderId } });
  const needs = orderNeeds(items);
  await db.$transaction(
    [...needs].map(([variantId, qty]) => db.variant.updateMany({ where: { id: variantId }, data: { stock: { increment: qty } } })),
  );
}

// ── Status changes (admin, courier webhook) ───────────────────────────────

/** Whether this order currently holds stock (COD from placement; online only once paid). */
function holdsStock(o: { status: Status; paymentMethod: PaymentMethod }) {
  if (o.status === "CANCELLED" || o.status === "RETURNED") return false;
  return o.paymentMethod !== "RAZORPAY" || o.status !== "PENDING";
}

export async function setOrderStatus(
  orderId: string,
  to: Status,
  opts: { note?: string; force?: boolean; restock?: boolean } = {},
) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw new CheckoutError("Order not found", 404);
  const from = order.status as Status;
  if (from === to) return { changed: false };

  if (to === "CANCELLED") {
    if (!opts.force && !["PENDING", "PAID", "PACKED"].includes(from)) throw new CheckoutError("This order has already shipped", 409);
  } else if (to === "RETURNED") {
    if (from !== "DELIVERED" && !opts.force) throw new CheckoutError("Only delivered orders can be marked returned", 409);
  } else if (!opts.force && !isForward(from, to)) {
    return { changed: false };
  }

  const releasing = (to === "CANCELLED" || (to === "RETURNED" && opts.restock)) && holdsStock(order);
  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: to, ...(to === "DELIVERED" ? { deliveredAt: new Date() } : {}) },
    });
    await tx.orderEvent.create({ data: { orderId, status: to, note: opts.note } });
  });
  if (releasing) await releaseStock(orderId);
  if (["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].includes(to)) void sendStatusEmail(orderId, to);
  return { changed: true };
}

async function sendStatusEmail(orderId: string, status: Status) {
  try {
    const order = await db.order.findUnique({ where: { id: orderId }, include: { user: true, shipments: true } });
    if (!order) return;
    const address = order.addressSnapshot as AddressSnapshot;
    const to = address.email ?? order.user.email;
    if (!to) return;
    const label = orderLabel(order.number);
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const ship = order.shipments.at(-1);
    const lines: Record<string, string> = {
      SHIPPED: `Your order is on its way${ship?.courier ? ` with ${ship.courier}` : ""}${ship?.awb ? ` (AWB ${ship.awb})` : ""}.`,
      OUT_FOR_DELIVERY: "Your order is out for delivery today. Keep your phone handy!",
      DELIVERED: "Your order has been delivered. Merry Christmas from all of us at swift.in!",
      CANCELLED: "Your order has been cancelled. If you paid online, the refund is on its way to your original payment method.",
    };
    const tracking = ship?.trackingUrl ? `<p><a href="${ship.trackingUrl}">Track your parcel</a></p>` : "";
    await sendEmail(
      to,
      `${statusLabel(status, order.paymentMethod)} · swift.in order ${label}`,
      `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#FBF7EE;padding:24px;color:#1F1B14">
<div style="max-width:520px;margin:auto;background:#fff;border:1px solid #ECE3CF;border-radius:16px;padding:24px">
<p style="font-family:Georgia,serif;font-size:24px;color:#C21F31;margin:0 0 12px">swift<i>.in</i></p>
<h1 style="font-family:Georgia,serif;font-weight:normal;color:#0A3D29;font-size:22px">${statusLabel(status, order.paymentMethod)} — ${label}</h1>
<p>${lines[status] ?? ""}</p>${tracking}
<p><a href="${site}/account/orders/${label}" style="color:#0B5E3E;font-weight:bold">View your order</a></p></div></body></html>`,
    );
  } catch (e) {
    console.error("status email failed", e);
  }
}

// ── Emails ────────────────────────────────────────────────────────────────

export async function sendOrderEmails(orderId: string, kind: "placed" | "paid", shortVariants: string[] = [], opts: { notifyAdmin?: boolean } = {}) {
  try {
    const settings = await getSettings();
    const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true, user: true } });
    if (!order) return;
    const address = order.addressSnapshot as AddressSnapshot;
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const label = orderLabel(order.number);
    const data: EmailOrder = {
      label,
      name: address.name,
      items: order.items.map((i) => ({ title: i.titleSnapshot, detail: i.detailSnapshot, qty: i.qty, price: i.priceSnapshot })),
      subtotal: order.subtotal,
      discount: order.discount,
      shipping: order.shipping,
      codFee: order.codFee,
      giftWrap: order.giftWrap,
      total: order.total,
      paymentMethod: order.paymentMethod,
      address: formatAddress(address),
      url: `${site}/account/orders/${label}`,
    };

    const customerEmail = address.email ?? order.user.email;
    if (customerEmail) {
      const heading = kind === "paid" ? "Payment received — thank you!" : "We've got your order!";
      const intro =
        order.paymentMethod === "COD"
          ? "We'll confirm your cash-on-delivery order shortly and let you know when it ships."
          : "Your order is confirmed. We'll let you know when it ships.";
      await sendEmail(customerEmail, `Your swift.in order ${label}`, orderEmailHtml(data, heading, intro));
    }

    const adminTo = opts.notifyAdmin === false ? null : settings.orderNotifyEmail || process.env.ADMIN_SEED_EMAIL;
    if (adminTo) {
      const warn = shortVariants.length ? `⚠️ Paid but stock was short for ${shortVariants.length} variant(s) — please check. ` : "";
      await sendEmail(
        adminTo,
        `${warn ? "⚠️ " : ""}New order ${label} · ${order.paymentMethod === "COD" ? "COD" : "Paid"} · ₹${Math.round(order.total / 100)}`,
        orderEmailHtml(data, `New order ${label}`, `${warn}${order.paymentMethod === "COD" ? "Cash on delivery — confirm with the customer." : `${paymentLabel(order.paymentMethod)}.`} Phone: ${address.phone}`),
      );
    }
  } catch (e) {
    console.error("order email failed", e);
  }
}

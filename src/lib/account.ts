import "server-only";
import { db } from "./db";
import { canRequestReturn, statusLabel, timeline, type Status } from "./order-status";
import { orderLabel, readComponents } from "./order-utils";
import type { AddressSnapshot } from "./orders";

const FALLBACK_IMAGE = "/placeholders/gifts.svg";

export async function getAccountOrders(userId: string) {
  const orders = await db.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      items: {
        take: 3,
        include: {
          variant: { include: { product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } } } },
          bundle: { select: { imageUrl: true } },
        },
      },
      _count: { select: { items: true } },
    },
  });
  return orders.map((o) => ({
    label: orderLabel(o.number),
    createdAt: o.createdAt,
    status: o.status as Status,
    statusText: statusLabel(o.status as Status, o.paymentMethod),
    total: o.total,
    itemCount: o._count.items,
    titles: o.items.map((i) => i.titleSnapshot),
    images: o.items.map((i) => i.variant?.product.images[0]?.url ?? i.bundle?.imageUrl ?? FALLBACK_IMAGE),
  }));
}

export type AccountOrder = NonNullable<Awaited<ReturnType<typeof getAccountOrder>>>;

export async function getAccountOrder(userId: string, number: number) {
  const o = await db.order.findFirst({
    where: { userId, number },
    include: {
      items: { include: { variant: { include: { product: { select: { slug: true, images: { take: 1, orderBy: { sortOrder: "asc" } } } } } }, bundle: true } },
      events: { orderBy: { createdAt: "asc" } },
      shipments: { orderBy: { id: "desc" } },
      returns: { orderBy: { createdAt: "desc" } },
      payments: { where: { status: "captured" }, take: 1 },
    },
  });
  if (!o) return null;
  const status = o.status as Status;
  const openReturn = o.returns.some((r) => r.status === "REQUESTED" || r.status === "APPROVED" || r.status === "RECEIVED");

  // Products the customer can review: anything in a delivered order (incl. kit and gift-box pieces).
  let reviewable: { productId: string; slug: string; title: string; reviewed: boolean }[] = [];
  if (status === "DELIVERED") {
    const variantIds = new Set<string>();
    for (const i of o.items) {
      if (i.variantId) variantIds.add(i.variantId);
      for (const c of readComponents(i.components)) variantIds.add(c.variantId);
    }
    const variants = await db.variant.findMany({
      where: { id: { in: [...variantIds] } },
      select: { product: { select: { id: true, slug: true, title: true } } },
    });
    const products = new Map(variants.map((v) => [v.product.id, v.product]));
    const reviewed = await db.review.findMany({ where: { userId, productId: { in: [...products.keys()] } }, select: { productId: true } });
    const done = new Set(reviewed.map((r) => r.productId));
    reviewable = [...products.values()].map((p) => ({ productId: p.id, slug: p.slug, title: p.title, reviewed: done.has(p.id) }));
  }

  return {
    id: o.id,
    label: orderLabel(o.number),
    createdAt: o.createdAt,
    status,
    statusText: statusLabel(status, o.paymentMethod),
    paymentMethod: o.paymentMethod,
    paid: o.paymentMethod === "RAZORPAY" ? o.payments.length > 0 : status === "DELIVERED",
    address: o.addressSnapshot as AddressSnapshot,
    giftMessage: o.giftMessage,
    totals: { subtotal: o.subtotal, discount: o.discount, shipping: o.shipping, codFee: o.codFee, giftWrap: o.giftWrap, total: o.total },
    items: o.items.map((i) => ({
      id: i.id,
      title: i.titleSnapshot,
      detail: i.detailSnapshot,
      qty: i.qty,
      price: i.priceSnapshot,
      image: i.variant?.product.images[0]?.url ?? i.bundle?.imageUrl ?? FALLBACK_IMAGE,
      href: i.variant ? `/products/${i.variant.product.slug}` : i.bundle?.type === "FIXED" ? `/bundles/${i.bundle.slug}` : null,
    })),
    timeline: timeline(status, o.createdAt, o.events.map((e) => ({ status: e.status as Status, createdAt: e.createdAt }))),
    shipment: o.shipments[0]
      ? { courier: o.shipments[0].courier, awb: o.shipments[0].awb, trackingUrl: o.shipments[0].trackingUrl, status: o.shipments[0].status }
      : null,
    returns: o.returns.map((r) => ({ id: r.id, status: r.status, reason: r.reason, createdAt: r.createdAt, adminNote: r.adminNote })),
    canReturn: canRequestReturn({ status, deliveredAt: o.deliveredAt }, openReturn),
    deliveredAt: o.deliveredAt,
    reviewable,
  };
}

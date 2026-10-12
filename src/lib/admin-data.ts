import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { IST_OFFSET_MS } from "./ist";

/** Orders that represent real sales: not cancelled/returned, and online ones only once paid. */
export const salesWhere: Prisma.OrderWhereInput = {
  status: { notIn: ["CANCELLED", "RETURNED"] },
  NOT: { status: "PENDING", paymentMethod: "RAZORPAY" },
};

function startOfTodayIST(now = new Date()) {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - IST_OFFSET_MS);
}

export async function getDashboard(lowStockThreshold: number) {
  const today = startOfTodayIST();
  const weekAgo = new Date(Date.now() - 7 * 864e5);
  const monthAgo = new Date(Date.now() - 30 * 864e5);

  const [todayOrders, week, lowStock, top, recent, pendingCod, openReturns, pendingReviews] = await Promise.all([
    db.order.count({ where: { ...salesWhere, createdAt: { gte: today } } }),
    db.order.aggregate({ where: { ...salesWhere, createdAt: { gte: weekAgo } }, _sum: { total: true }, _count: true }),
    db.variant.findMany({
      where: { stock: { lte: lowStockThreshold }, product: { isLive: true } },
      include: { product: { select: { title: true, id: true } } },
      orderBy: { stock: "asc" },
      take: 8,
    }),
    db.orderItem.groupBy({
      by: ["titleSnapshot"],
      where: { order: { ...salesWhere, createdAt: { gte: monthAgo } } },
      _sum: { qty: true },
      orderBy: { _sum: { qty: "desc" } },
      take: 5,
    }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { user: { select: { phone: true, name: true } } } }),
    db.order.count({ where: { status: "PENDING", paymentMethod: "COD" } }),
    db.returnRequest.count({ where: { status: "REQUESTED" } }),
    db.review.count({ where: { isApproved: false } }),
  ]);
  const lowStockCount = await db.variant.count({ where: { stock: { lte: lowStockThreshold }, product: { isLive: true } } });

  return {
    todayOrders,
    weekRevenue: week._sum.total ?? 0,
    weekOrders: week._count,
    lowStockCount,
    lowStock: lowStock.map((v) => ({ id: v.id, productId: v.product.id, title: v.product.title, variant: v.name, stock: v.stock })),
    top: top.map((t) => ({ title: t.titleSnapshot, qty: t._sum.qty ?? 0 })),
    recent,
    pendingCod,
    openReturns,
    pendingReviews,
  };
}

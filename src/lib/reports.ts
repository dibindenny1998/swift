import "server-only";
import { salesWhere } from "./admin-data";
import { db } from "./db";
import { IST_OFFSET_MS, istDate } from "./ist";

const DAY = 864e5;
export const RANGES = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "ytd", label: "This year" },
] as const;
export type RangeKey = (typeof RANGES)[number]["key"] | "custom";

/** YYYY-MM-DD of an instant, in IST. */
export function istDay(d: Date) {
  return new Date(d.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Resolve a preset or custom from/to (IST days, inclusive) into [start, end) instants. */
export function resolveRange(range?: string, from?: string, to?: string) {
  const today = istDay(new Date());
  let key: RangeKey = "30d";
  let first: string;
  let last = today;
  if (range === "custom" && from && to && DATE.test(from) && DATE.test(to)) {
    key = "custom";
    [first, last] = from <= to ? [from, to] : [to, from];
  } else {
    key = RANGES.some((r) => r.key === range) ? (range as RangeKey) : "30d";
    const back = { today: 0, "7d": 6, "30d": 29, "90d": 89 }[key as string];
    first = key === "ytd" ? `${today.slice(0, 4)}-01-01` : istDay(new Date(istDate(today).getTime() - (back ?? 29) * DAY));
  }
  const start = istDate(first);
  const end = new Date(istDate(last).getTime() + DAY);
  const days = Math.round((end.getTime() - start.getTime()) / DAY);
  return { key, first, last, start, end, days, prevStart: new Date(start.getTime() - days * DAY), prevEnd: start };
}

export type Range = ReturnType<typeof resolveRange>;

function summarize(orders: { total: number; discount: number; items: { qty: number }[] }[]) {
  const sales = orders.reduce((s, o) => s + o.total, 0);
  return {
    sales,
    orders: orders.length,
    aov: orders.length ? Math.round(sales / orders.length) : 0,
    items: orders.reduce((s, o) => s + o.items.reduce((n, i) => n + i.qty, 0), 0),
    discounts: orders.reduce((s, o) => s + o.discount, 0),
  };
}

function rank<T extends { revenue: number }>(m: Map<string, T>, take = 8) {
  return [...m.values()].sort((a, b) => b.revenue - a.revenue).slice(0, take);
}

export async function getReport(r: Range) {
  const orderSelect = {
    id: true,
    userId: true,
    createdAt: true,
    total: true,
    discount: true,
    paymentMethod: true,
    addressSnapshot: true,
    coupon: { select: { code: true } },
    items: {
      select: {
        qty: true,
        priceSnapshot: true,
        titleSnapshot: true,
        bundleId: true,
        variant: { select: { product: { select: { id: true, title: true, category: { select: { name: true } } } } } },
      },
    },
  } as const;

  const [orders, prev, cancelled, refunds] = await Promise.all([
    db.order.findMany({ where: { ...salesWhere, createdAt: { gte: r.start, lt: r.end } }, select: orderSelect, orderBy: { createdAt: "asc" } }),
    db.order.findMany({ where: { ...salesWhere, createdAt: { gte: r.prevStart, lt: r.prevEnd } }, select: { total: true, discount: true, items: { select: { qty: true } } } }),
    db.order.aggregate({ where: { status: { in: ["CANCELLED", "RETURNED"] }, createdAt: { gte: r.start, lt: r.end } }, _count: true, _sum: { total: true } }),
    db.payment.aggregate({ where: { refundedAmount: { gt: 0 }, order: { createdAt: { gte: r.start, lt: r.end } } }, _sum: { refundedAmount: true } }),
  ]);

  // Sales over time: one bar per IST day, or per 7-day block for long ranges.
  const step = r.days > 62 ? 7 : 1;
  const buckets: { from: string; to: string; sales: number; orders: number }[] = [];
  for (let t = r.start.getTime(); t < r.end.getTime(); t += step * DAY) {
    buckets.push({ from: istDay(new Date(t)), to: istDay(new Date(Math.min(t + step * DAY, r.end.getTime()) - 1)), sales: 0, orders: 0 });
  }
  for (const o of orders) {
    const b = buckets[Math.floor((o.createdAt.getTime() - r.start.getTime()) / (step * DAY))];
    if (b) {
      b.sales += o.total;
      b.orders += 1;
    }
  }

  const products = new Map<string, { name: string; units: number; revenue: number }>();
  const categories = new Map<string, { name: string; units: number; revenue: number }>();
  const payments = new Map<string, { name: string; orders: number; revenue: number }>();
  const states = new Map<string, { name: string; orders: number; revenue: number }>();
  const coupons = new Map<string, { name: string; orders: number; revenue: number; discount: number }>();

  for (const o of orders) {
    const pay = o.paymentMethod === "COD" ? "Cash on delivery" : "Paid online";
    const p = payments.get(pay) ?? { name: pay, orders: 0, revenue: 0 };
    p.orders += 1;
    p.revenue += o.total;
    payments.set(pay, p);

    const state = (o.addressSnapshot as { state?: string } | null)?.state || "Unknown";
    const s = states.get(state) ?? { name: state, orders: 0, revenue: 0 };
    s.orders += 1;
    s.revenue += o.total;
    states.set(state, s);

    if (o.coupon) {
      const c = coupons.get(o.coupon.code) ?? { name: o.coupon.code, orders: 0, revenue: 0, discount: 0 };
      c.orders += 1;
      c.revenue += o.total;
      c.discount += o.discount;
      coupons.set(o.coupon.code, c);
    }

    for (const i of o.items) {
      const line = i.priceSnapshot * i.qty;
      const product = i.variant?.product;
      const key = product?.id ?? `t:${i.titleSnapshot}`;
      const pr = products.get(key) ?? { name: product?.title ?? i.titleSnapshot, units: 0, revenue: 0 };
      pr.units += i.qty;
      pr.revenue += line;
      products.set(key, pr);

      const cat = i.bundleId ? "Kits & gift boxes" : (product?.category.name ?? "Other");
      const ca = categories.get(cat) ?? { name: cat, units: 0, revenue: 0 };
      ca.units += i.qty;
      ca.revenue += line;
      categories.set(cat, ca);
    }
  }

  // New vs returning: a customer is new if their first-ever sale falls inside the range.
  const buyers = [...new Set(orders.map((o) => o.userId))];
  const firsts = buyers.length
    ? await db.order.groupBy({ by: ["userId"], where: { ...salesWhere, userId: { in: buyers } }, _min: { createdAt: true } })
    : [];
  const newBuyers = firsts.filter((f) => f._min.createdAt && f._min.createdAt >= r.start).length;

  return {
    now: summarize(orders),
    prev: summarize(prev),
    buckets,
    step,
    products: rank(products),
    categories: rank(categories),
    payments: rank(payments),
    states: rank(states),
    coupons: rank(coupons),
    customers: { total: buyers.length, new: newBuyers, returning: buyers.length - newBuyers },
    cancelled: { count: cancelled._count, value: cancelled._sum.total ?? 0 },
    refunded: refunds._sum.refundedAmount ?? 0,
  };
}

export type Report = Awaited<ReturnType<typeof getReport>>;

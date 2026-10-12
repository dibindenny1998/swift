import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { Suspense } from "react";
import { AdminSkeleton, adminBtn, Empty, PageHeader, Pill, Table, orderStatusTone } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { istDate } from "@/lib/ist";
import { formatINR } from "@/lib/money";
import { statusLabel, type Status } from "@/lib/order-status";
import { orderLabel, parseOrderLabel } from "@/lib/order-utils";
import { normalizeIndianMobile } from "@/lib/phone";

export const metadata = { title: "Orders" };

export default function OrdersPage(props: PageProps<"/admin/orders">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Orders searchParams={props.searchParams} />
    </Suspense>
  );
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const STATUSES: Status[] = ["PENDING", "PAID", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"];
const when = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });
const PAGE = 50;

async function Orders({ searchParams }: Pick<PageProps<"/admin/orders">, "searchParams">) {
  await requireAdmin("/admin/orders");
  const sp = await searchParams;
  const status = one(sp.status);
  const payment = one(sp.payment);
  const q = one(sp.q).trim();
  const from = one(sp.from);
  const to = one(sp.to);
  const returns = one(sp.returns);
  const page = Math.max(1, Number(one(sp.page)) || 1);

  const where: Prisma.OrderWhereInput = {
    ...(STATUSES.includes(status as Status) ? { status: status as Status } : {}),
    ...(payment === "COD" || payment === "RAZORPAY" ? { paymentMethod: payment } : {}),
    ...(from || to ? { createdAt: { ...(from ? { gte: istDate(from) } : {}), ...(to ? { lt: new Date(istDate(to).getTime() + 864e5) } : {}) } } : {}),
    ...(returns === "open" ? { returns: { some: { status: { in: ["REQUESTED", "APPROVED", "RECEIVED"] } } } } : {}),
  };
  if (q) {
    const n = parseOrderLabel(q) ?? (/^\d{4,9}$/.test(q) ? Number(q) : null);
    const phone = normalizeIndianMobile(q);
    where.OR = [
      ...(n ? [{ number: n }] : []),
      ...(phone ? [{ user: { phone } }] : []),
      { user: { name: { contains: q, mode: "insensitive" as const } } },
    ];
  }
  const [orders, count] = await Promise.all([
    db.order.findMany({
      where,
      include: { user: { select: { name: true, phone: true } }, _count: { select: { items: true } }, returns: { select: { status: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE,
      take: PAGE,
    }),
    db.order.count({ where }),
  ]);
  const qs = (patch: Record<string, string>) => {
    const p = new URLSearchParams({ ...(status && { status }), ...(payment && { payment }), ...(q && { q }), ...(from && { from }), ...(to && { to }), ...(returns && { returns }), ...patch });
    return `/admin/orders?${p}`;
  };

  return (
    <>
      <PageHeader title="Orders" description={`${count} order${count === 1 ? "" : "s"}`} />
      <form className="mb-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6" role="search">
        <input name="q" defaultValue={q} placeholder="SW1042, phone or name" aria-label="Search" className="h-11 rounded-full border border-border bg-white px-4 text-sm lg:col-span-2" />
        <select name="status" defaultValue={status} aria-label="Status" className="h-11 rounded-full border border-border bg-white px-4 text-sm">
          <option value="">Any status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ").toLowerCase()}
            </option>
          ))}
        </select>
        <select name="payment" defaultValue={payment} aria-label="Payment" className="h-11 rounded-full border border-border bg-white px-4 text-sm">
          <option value="">Any payment</option>
          <option value="RAZORPAY">Online</option>
          <option value="COD">COD</option>
        </select>
        <input type="date" name="from" defaultValue={from} aria-label="From date" className="h-11 rounded-full border border-border bg-white px-4 text-sm" />
        <input type="date" name="to" defaultValue={to} aria-label="To date" className="h-11 rounded-full border border-border bg-white px-4 text-sm" />
        {returns && <input type="hidden" name="returns" value={returns} />}
        <button type="submit" className={adminBtn("secondary", "sm:col-span-3 lg:col-span-6 lg:justify-self-end")}>
          Filter
        </button>
      </form>

      {orders.length === 0 ? (
        <Empty>No orders match.</Empty>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Placed</th>
              <th>Payment</th>
              <th>Status</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-ivory">
                <td>
                  <Link href={`/admin/orders/${o.id}`} className="font-semibold">
                    {orderLabel(o.number)}
                  </Link>
                  <span className="block text-xs text-muted">{o._count.items} items</span>
                </td>
                <td>
                  {o.user.name ?? "—"}
                  <span className="block text-xs text-muted">{o.user.phone}</span>
                </td>
                <td className="text-xs">{when.format(o.createdAt)}</td>
                <td>{o.paymentMethod === "COD" ? "COD" : "Online"}</td>
                <td className="flex flex-wrap gap-1">
                  <Pill tone={orderStatusTone(o.status)}>{statusLabel(o.status as Status, o.paymentMethod)}</Pill>
                  {o.returns.some((r) => r.status === "REQUESTED") && <Pill tone="red">Return</Pill>}
                </td>
                <td className="text-right tabular-nums">{formatINR(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {count > PAGE && (
        <div className="mt-4 flex justify-between text-sm">
          {page > 1 ? <Link href={qs({ page: String(page - 1) })}>← Newer</Link> : <span />}
          {page * PAGE < count && <Link href={qs({ page: String(page + 1) })}>Older →</Link>}
        </div>
      )}
    </>
  );
}

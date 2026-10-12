import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminSkeleton, Empty, PageHeader, Panel, Pill, Stat, Table, orderStatusTone } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { salesWhere } from "@/lib/admin-data";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { statusLabel, type Status } from "@/lib/order-status";
import { orderLabel } from "@/lib/order-utils";

export const metadata = { title: "Customer" };

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function CustomerPage(props: PageProps<"/admin/customers/[id]">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Customer params={props.params} />
    </Suspense>
  );
}

const day = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

async function Customer({ params }: Pick<PageProps<"/admin/customers/[id]">, "params">) {
  const { id } = await params;
  await requireAdmin(`/admin/customers/${id}`);
  const [u, totals] = await Promise.all([
    db.user.findUnique({ where: { id }, include: { orders: { orderBy: { createdAt: "desc" } }, addresses: true, _count: { select: { reviews: true, wishlist: true } } } }),
    db.order.aggregate({ where: { ...salesWhere, userId: id }, _sum: { total: true }, _count: true }),
  ]);
  if (!u) notFound();
  return (
    <>
      <Link href="/admin/customers" className="text-sm font-semibold text-muted">
        ← Customers
      </Link>
      <PageHeader title={u.name ?? u.phone ?? "Customer"} description={`${u.phone ?? ""}${u.email ? ` · ${u.email}` : ""} · joined ${day.format(u.createdAt)}`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Orders" value={totals._count} />
        <Stat label="Total spend" value={formatINR(totals._sum.total ?? 0)} />
        <Stat label="Reviews · wishlist" value={`${u._count.reviews} · ${u._count.wishlist}`} />
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div>
          {u.orders.length === 0 ? (
            <Empty>No orders yet.</Empty>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {u.orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/orders/${o.id}`} className="font-semibold">
                        {orderLabel(o.number)}
                      </Link>
                    </td>
                    <td className="text-xs">{day.format(o.createdAt)}</td>
                    <td>
                      <Pill tone={orderStatusTone(o.status)}>{statusLabel(o.status as Status, o.paymentMethod)}</Pill>
                    </td>
                    <td className="text-right tabular-nums">{formatINR(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
        <Panel title="Saved addresses">
          {u.addresses.length === 0 ? (
            <p className="text-sm text-muted">None.</p>
          ) : (
            <ul className="flex flex-col gap-3 text-sm">
              {u.addresses.map((a) => (
                <li key={a.id}>
                  <strong>{a.name}</strong>
                  {a.isDefault && <span className="text-xs text-green-300"> · default</span>}
                  <span className="block text-muted">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}

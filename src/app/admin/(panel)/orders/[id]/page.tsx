import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RefundAction, ReturnActions, ShipmentActions, StatusActions } from "@/components/admin/OrderActions";
import { AdminSkeleton, adminBtn, PageHeader, Panel, Pill, orderStatusTone } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { paymentLabel, statusLabel, type Status } from "@/lib/order-status";
import { orderLabel } from "@/lib/order-utils";
import { formatAddress, type AddressSnapshot } from "@/lib/orders";
import { shiprocketConfigured } from "@/lib/shiprocket";
import { OrderNotes } from "@/components/admin/OrderNotes";

export const metadata = { title: "Order" };

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function AdminOrderPage(props: PageProps<"/admin/orders/[id]">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <AdminOrder params={props.params} />
    </Suspense>
  );
}

const when = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

async function AdminOrder({ params }: Pick<PageProps<"/admin/orders/[id]">, "params">) {
  const { id } = await params;
  await requireAdmin(`/admin/orders/${id}`);
  const o = await db.order.findUnique({
    where: { id },
    include: {
      user: { include: { _count: { select: { orders: true } } } },
      items: true,
      events: { orderBy: { createdAt: "desc" } },
      payments: { orderBy: { id: "desc" } },
      shipments: { orderBy: { id: "desc" } },
      returns: { orderBy: { createdAt: "desc" } },
      coupon: { select: { code: true } },
      notes: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!o) notFound();
  const status = o.status as Status;
  const a = o.addressSnapshot as AddressSnapshot;
  const captured = o.payments.find((p) => ["captured", "partially_refunded", "refunded"].includes(p.status));
  const canShip = o.shipments.length === 0 && (["PAID", "PACKED"].includes(status) || (status === "PENDING" && o.paymentMethod === "COD"));
  const itemTitle = new Map(o.items.map((i) => [i.id, `${i.titleSnapshot}${i.qty > 1 ? ` × ${i.qty}` : ""}`]));

  return (
    <>
      <Link href="/admin/orders" className="text-sm font-semibold text-muted">
        ← Orders
      </Link>
      <PageHeader
        title={orderLabel(o.number)}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Pill tone={orderStatusTone(status)}>{statusLabel(status, o.paymentMethod)}</Pill>
            <span>{when.format(o.createdAt)}</span>
            <span>· {paymentLabel(o.paymentMethod)}</span>
            {o.source === "MANUAL" && <Pill tone="gold">Manual order</Pill>}
          </span>
        }
        actions={
          <>
            <Link href={`/admin/packing-slips?ids=${o.id}`} target="_blank" className={adminBtn("secondary")}>
              Packing slip ↗
            </Link>
            <Link href={`/admin/invoice/${o.id}`} target="_blank" className={adminBtn("secondary")}>
              GST invoice ↗
            </Link>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-5">
          <Panel title="Items">
            <ul className="divide-y divide-divider text-sm">
              {o.items.map((i) => (
                <li key={i.id} className="flex justify-between gap-3 py-2">
                  <span>
                    <strong>{i.titleSnapshot}</strong>
                    {i.qty > 1 && <span className="text-muted"> × {i.qty}</span>}
                    {i.detailSnapshot && <span className="block text-xs text-muted">{i.detailSnapshot}</span>}
                  </span>
                  <span className="tabular-nums">{formatINR(i.priceSnapshot * i.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 grid gap-1 border-t border-divider pt-3 text-sm">
              {[
                ["Subtotal", formatINR(o.subtotal)],
                ...(o.discount ? [[`Discount${o.discountNote ? ` · ${o.discountNote}` : o.coupon ? ` (${o.coupon.code})` : ""}`, `−${formatINR(o.discount)}`]] : []),
                ["Shipping", o.shipping ? formatINR(o.shipping) : "Free"],
                ...(o.giftWrap ? [["Gift wrap", formatINR(o.giftWrap)]] : []),
                ...(o.codFee ? [["COD fee", formatINR(o.codFee)]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-muted">{k}</dt>
                  <dd className="tabular-nums">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between font-bold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatINR(o.total)}</dd>
              </div>
            </dl>
            {o.giftWrapped && <p className="mt-3 text-sm font-semibold">🎁 Gift wrap requested</p>}
            {o.giftMessage && <p className="mt-3 rounded-sm bg-ivory px-3 py-2 text-sm">Gift note: “{o.giftMessage}”</p>}
          </Panel>

          <OrderNotes orderId={o.id} notes={o.notes.map((n) => ({ id: n.id, authorName: n.authorName, text: n.text, createdAt: n.createdAt.toISOString() }))} />

          {o.returns.length > 0 && (
            <Panel title="Return requests">
              {o.returns.map((r) => (
                <div key={r.id} className="border-b border-divider pb-4 last:border-0">
                  <p className="text-sm">
                    <strong>{r.reason}</strong> · {when.format(r.createdAt)}
                  </p>
                  {r.details && <p className="text-sm text-muted">“{r.details}”</p>}
                  <p className="text-xs text-muted">Items: {(r.itemIds as string[]).map((x) => itemTitle.get(x) ?? "?").join(", ")}</p>
                  <ReturnActions returnId={r.id} status={r.status} adminNote={r.adminNote} />
                </div>
              ))}
            </Panel>
          )}

          <Panel title="History">
            <ol className="flex flex-col gap-2 text-sm">
              {o.events.map((e) => (
                <li key={e.id} className="flex gap-3">
                  <span className="w-36 flex-none text-xs text-muted">{when.format(e.createdAt)}</span>
                  <span>
                    <strong>{statusLabel(e.status as Status, o.paymentMethod)}</strong>
                    {e.note && <span className="text-muted"> — {e.note}</span>}
                  </span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="flex flex-col gap-5">
          <StatusActions orderId={o.id} status={status} paymentMethod={o.paymentMethod} />
          <ShipmentActions orderId={o.id} canShip={canShip} shiprocket={shiprocketConfigured()} />
          {o.shipments.map((s) => (
            <Panel key={s.id} title="Shipment">
              <p className="text-sm">
                {s.courier ?? "Courier pending"} · AWB {s.awb ?? "pending"}
                <span className="block text-xs text-muted">{s.status}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-sm font-semibold">
                {s.trackingUrl && (
                  <a href={s.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-green-300">
                    Track ↗
                  </a>
                )}
                {s.labelUrl && (
                  <a href={s.labelUrl} target="_blank" rel="noopener noreferrer" className="text-green-300">
                    Print label ↗
                  </a>
                )}
              </div>
            </Panel>
          ))}
          {captured && (
            <RefundAction orderId={o.id} refundable={captured.amount - captured.refundedAmount} refunded={captured.refundedAmount} />
          )}
          <Panel title="Customer">
            <p className="text-sm">
              <Link href={`/admin/customers/${o.userId}`} className="font-semibold text-green-300">
                {o.user.name ?? a.name}
              </Link>
              <span className="block text-muted">{o.user.phone}</span>
              {(a.email ?? o.user.email) && <span className="block text-muted">{a.email ?? o.user.email}</span>}
              <span className="block text-xs text-muted">{o.user._count.orders} order(s) in total</span>
            </p>
            <h3 className="mt-4 text-[13px] font-semibold">Ship to</h3>
            <p className="text-sm text-muted">{formatAddress(a)}</p>
            <p className="text-sm text-muted">{a.phone}</p>
          </Panel>
          <Panel title="Payment">
            {o.payments.length === 0 ? (
              <p className="text-sm text-muted">{o.paymentMethod === "COD" ? `Collect ${formatINR(o.total)} on delivery.` : o.paymentMethod === "OFFLINE" ? `${formatINR(o.total)} received offline.` : "No payment yet."}</p>
            ) : (
              o.payments.map((p) => (
                <p key={p.id} className="text-sm">
                  {formatINR(p.amount)} · <strong>{p.status}</strong>
                  <span className="block break-all text-xs text-muted">
                    {p.razorpayOrderId}
                    {p.razorpayPaymentId && ` / ${p.razorpayPaymentId}`}
                  </span>
                </p>
              ))
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}

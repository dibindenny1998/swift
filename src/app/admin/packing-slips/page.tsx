import { Suspense } from "react";
import { PrintButton } from "@/components/admin/PrintButton";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { paymentLabel } from "@/lib/order-status";
import { orderLabel } from "@/lib/order-utils";
import type { AddressSnapshot } from "@/lib/orders";
import { getSettings } from "@/lib/settings-server";

export const metadata = { title: "Packing slips", robots: { index: false } };

export default function PackingSlipsPage(props: PageProps<"/admin/packing-slips">) {
  return (
    <Suspense>
      <Slips searchParams={props.searchParams} />
    </Suspense>
  );
}

const day = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

/** One printable A4 page per order: a big ship-to label, what to pack, and the gift note. */
async function Slips({ searchParams }: Pick<PageProps<"/admin/packing-slips">, "searchParams">) {
  await requireAdmin("/admin/packing-slips");
  const raw = (await searchParams).ids;
  const ids = (Array.isArray(raw) ? raw.join(",") : (raw ?? "")).split(",").filter(Boolean).slice(0, 100);
  const [orders, s] = await Promise.all([
    db.order.findMany({ where: { id: { in: ids } }, include: { items: true, user: { select: { phone: true } } }, orderBy: { number: "asc" } }),
    getSettings(),
  ]);

  return (
    <main className="mx-auto max-w-3xl bg-white p-8 text-[13px] text-text print:p-0">
      <style>{`@page { size: A4; margin: 12mm } @media print { body { background: #fff } }`}</style>
      <div className="mb-6 flex items-center justify-between print:hidden">
        <p className="text-sm text-muted">
          {orders.length} packing slip{orders.length === 1 ? "" : "s"} · one per page
        </p>
        <PrintButton />
      </div>
      {orders.length === 0 && <p>No orders selected.</p>}
      {orders.map((o, i) => {
        const a = o.addressSnapshot as AddressSnapshot;
        const units = o.items.reduce((n, it) => n + it.qty, 0);
        return (
          <section key={o.id} className={i < orders.length - 1 ? "mb-10 border-b border-dashed border-border pb-10 print:mb-0 print:border-0 print:pb-0 [break-after:page]" : ""}>
            <header className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-[22px] font-semibold text-red-700">
                  swift<em className="font-medium">.in</em>
                </p>
                <p className="text-xs text-muted">Packing slip · {day.format(o.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-[28px] leading-none">{orderLabel(o.number)}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em]">{paymentLabel(o.paymentMethod)}</p>
              </div>
            </header>

            <div className="mt-5 grid grid-cols-[1.4fr_1fr] gap-4">
              <div className="rounded-md border-2 border-text p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Ship to</p>
                <p className="mt-1 text-[18px] font-semibold leading-snug">{a.name}</p>
                <p className="text-[15px] leading-snug">
                  {a.line1}
                  {a.line2 && (
                    <>
                      <br />
                      {a.line2}
                    </>
                  )}
                  <br />
                  {a.city}, {a.state}
                  <br />
                  <span className="text-[20px] font-bold tracking-[0.08em]">{a.pincode}</span>
                </p>
                <p className="mt-2 text-[15px] font-semibold">📞 {a.phone}</p>
              </div>
              <div className="flex flex-col gap-3">
                {o.paymentMethod === "COD" ? (
                  <div className="rounded-md bg-text p-4 text-ivory">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Collect on delivery</p>
                    <p className="mt-1 text-[24px] font-bold">{formatINR(o.total)}</p>
                  </div>
                ) : (
                  <div className="rounded-md border border-border p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Prepaid</p>
                    <p className="mt-1 text-[15px] font-semibold">Nothing to collect</p>
                  </div>
                )}
                <div className="rounded-md border border-border p-4 text-xs">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">From</p>
                  <p className="mt-1 font-semibold">{s.businessName}</p>
                  <p className="whitespace-pre-line">{s.businessAddress}</p>
                </div>
              </div>
            </div>

            <table className="mt-5 w-full text-left [&_td]:border-t [&_td]:border-divider [&_td]:py-2 [&_th]:pb-2 [&_th]:text-[11px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.1em] [&_th]:text-muted">
              <thead>
                <tr>
                  <th className="w-8">✓</th>
                  <th>Item</th>
                  <th className="w-16 text-right">Qty</th>
                </tr>
              </thead>
              <tbody>
                {o.items.map((it) => (
                  <tr key={it.id}>
                    <td>
                      <span className="inline-block size-4 rounded-[3px] border border-text" />
                    </td>
                    <td>
                      <span className="font-semibold">{it.titleSnapshot}</span>
                      {it.detailSnapshot && <span className="block text-xs text-muted">{it.detailSnapshot}</span>}
                    </td>
                    <td className="text-right text-[15px] font-semibold">{it.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-right text-xs text-muted">{units} piece{units === 1 ? "" : "s"} in total</p>

            {(o.giftWrapped || o.giftMessage) && (
              <div className="mt-4 rounded-md border border-gold-line bg-gold-light/20 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-ink">🎁 {o.giftWrapped ? `Gift wrap${o.giftMessage ? " + note" : ""}` : "Note"}</p>
                {o.giftMessage && <p className="mt-1 font-display text-[16px] italic">“{o.giftMessage}”</p>}
              </div>
            )}
          </section>
        );
      })}
    </main>
  );
}

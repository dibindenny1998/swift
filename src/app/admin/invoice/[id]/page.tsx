import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PrintButton } from "@/components/admin/PrintButton";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { gstBreakdown } from "@/lib/gst";
import { formatINR } from "@/lib/money";
import { orderLabel } from "@/lib/order-utils";
import { formatAddress, type AddressSnapshot } from "@/lib/orders";
import { getSettings } from "@/lib/settings-server";

export const metadata = { title: "Tax invoice", robots: { index: false } };

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function InvoicePage(props: PageProps<"/admin/invoice/[id]">) {
  return (
    <Suspense>
      <Invoice params={props.params} />
    </Suspense>
  );
}

const day = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

async function Invoice({ params }: Pick<PageProps<"/admin/invoice/[id]">, "params">) {
  const { id } = await params;
  await requireAdmin(`/admin/invoice/${id}`);
  const [o, s] = await Promise.all([db.order.findUnique({ where: { id }, include: { items: true, user: true } }), getSettings()]);
  if (!o) notFound();
  const a = o.addressSnapshot as AddressSnapshot;
  const intra = a.state.trim().toLowerCase() === s.businessState.trim().toLowerCase();
  const rate = s.gstRatePercent;

  // Line values are GST-inclusive; discount is spread across goods, fees are taxed as services at the same rate.
  const goods = o.items.map((i) => ({ title: i.titleSnapshot, detail: i.detailSnapshot, qty: i.qty, amount: i.priceSnapshot * i.qty }));
  const goodsTotal = goods.reduce((t, g) => t + g.amount, 0);
  const lines = [
    ...goods.map((g) => ({ ...g, amount: goodsTotal ? g.amount - Math.round((o.discount * g.amount) / goodsTotal) : g.amount })),
    ...(o.shipping ? [{ title: "Shipping", detail: null, qty: 1, amount: o.shipping }] : []),
    ...(o.giftWrap ? [{ title: "Gift wrap", detail: null, qty: 1, amount: o.giftWrap }] : []),
    ...(o.codFee ? [{ title: "Cash on delivery fee", detail: null, qty: 1, amount: o.codFee }] : []),
  ];
  // Put any rounding remainder on the first line so the invoice total equals the order total.
  const diff = o.total - lines.reduce((t, l) => t + l.amount, 0);
  if (lines[0]) lines[0].amount += diff;
  const rows = lines.map((l) => ({ ...l, ...gstBreakdown(l.amount, rate, intra) }));
  const sum = (k: "taxable" | "cgst" | "sgst" | "igst") => rows.reduce((t, r) => t + r[k], 0);

  return (
    <main className="mx-auto max-w-3xl bg-white p-8 text-[13px] text-text print:p-0">
      <style>{`@page { size: A4; margin: 14mm } @media print { body { background: #fff } }`}</style>
      <div className="mb-6 flex items-center justify-between print:hidden">
        <p className="text-sm text-muted">Use “Save as PDF” in the print dialog to download.</p>
        <PrintButton />
      </div>
      <header className="flex items-start justify-between border-b border-divider pb-4">
        <div>
          <p className="font-display text-[26px] font-semibold text-red-200">
            {s.businessName === "swift.in" ? (
              <>
                swift<em className="text-gold-dark">.in</em>
              </>
            ) : (
              s.businessName
            )}
          </p>
          <p className="whitespace-pre-line text-muted">{s.businessAddress}</p>
          {s.gstin ? <p>GSTIN: {s.gstin}</p> : <p className="text-red-sale print:hidden">Add your GSTIN in Site settings</p>}
        </div>
        <div className="text-right">
          <h1 className="text-lg font-bold uppercase tracking-[0.1em]">Tax invoice</h1>
          <p>Invoice no. {orderLabel(o.number)}</p>
          <p>Date {day.format(o.createdAt)}</p>
          <p>{o.paymentMethod === "COD" ? "Cash on delivery" : "Paid online"}</p>
        </div>
      </header>
      <section className="grid grid-cols-2 gap-6 py-4">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Bill & ship to</h2>
          <p className="mt-1">{formatAddress(a)}</p>
          <p>{a.phone}</p>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Place of supply</h2>
          <p className="mt-1">{a.state}</p>
        </div>
      </section>
      <table className="w-full border-collapse text-left [&_td]:border-b [&_td]:border-divider [&_td]:py-2 [&_th]:border-b [&_th]:border-text [&_th]:py-2">
        <thead>
          <tr>
            <th>Item</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Taxable</th>
            {intra ? (
              <>
                <th className="text-right">CGST {rate / 2}%</th>
                <th className="text-right">SGST {rate / 2}%</th>
              </>
            ) : (
              <th className="text-right">IGST {rate}%</th>
            )}
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>
                {r.title}
                {r.detail && <span className="block text-xs text-muted">{r.detail}</span>}
              </td>
              <td className="text-right">{r.qty}</td>
              <td className="text-right tabular-nums">{formatINR(r.taxable)}</td>
              {intra ? (
                <>
                  <td className="text-right tabular-nums">{formatINR(r.cgst)}</td>
                  <td className="text-right tabular-nums">{formatINR(r.sgst)}</td>
                </>
              ) : (
                <td className="text-right tabular-nums">{formatINR(r.igst)}</td>
              )}
              <td className="text-right tabular-nums">{formatINR(r.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="font-bold">
          <tr>
            <td colSpan={2}>Total</td>
            <td className="text-right tabular-nums">{formatINR(sum("taxable"))}</td>
            {intra ? (
              <>
                <td className="text-right tabular-nums">{formatINR(sum("cgst"))}</td>
                <td className="text-right tabular-nums">{formatINR(sum("sgst"))}</td>
              </>
            ) : (
              <td className="text-right tabular-nums">{formatINR(sum("igst"))}</td>
            )}
            <td className="text-right tabular-nums">{formatINR(o.total)}</td>
          </tr>
        </tfoot>
      </table>
      {o.discount > 0 && <p className="mt-2 text-xs text-muted">Includes a discount of {formatINR(o.discount)}, applied before tax.</p>}
      <p className="mt-8 text-xs text-muted">This is a computer-generated invoice and does not require a signature.</p>
    </main>
  );
}

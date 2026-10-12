import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ReturnForm, ReviewForm } from "@/components/account/AccountForms";
import { BackToAccount, whatsappLink } from "@/components/account/AccountNav";
import { ProductImage } from "@/components/product/ProductImage";
import { getAccountOrder, type AccountOrder } from "@/lib/account";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/money";
import { parseOrderLabel } from "@/lib/order-utils";
import { formatAddress } from "@/lib/orders";
import { RETURN_WINDOW_DAYS } from "@/lib/order-status";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/settings-server";

export const metadata: Metadata = { title: "Order details", robots: { index: false } };

// Private, per-customer pages: nothing to prerender beyond a placeholder for route validation.
export function generateStaticParams() {
  return [{ number: "SW0" }];
}

export default function OrderPage(props: PageProps<"/account/orders/[number]">) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6">
      <BackToAccount />
      <Suspense fallback={<div aria-hidden className="mt-4 h-[60vh] animate-pulse rounded-lg bg-divider/40" />}>
        <OrderDetail params={props.params} />
      </Suspense>
    </div>
  );
}

const when = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });
const day = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

async function OrderDetail({ params }: Pick<PageProps<"/account/orders/[number]">, "params">) {
  const { number: label } = await params;
  const number = parseOrderLabel(label);
  if (!number) notFound();
  const session = await getSession();
  if (!session) redirect(`/login?next=/account/orders/${label}`);
  const [order, settings] = await Promise.all([getAccountOrder(session.uid, number), getSettings()]);
  if (!order) notFound();
  const help = whatsappLink(settings.whatsappNumber, `Hi swift.in, I need help with order ${order.label}`);
  const ended = order.status === "CANCELLED" || order.status === "RETURNED";

  return (
    <>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-[32px] font-medium text-green-heading">{order.label}</h1>
        <p className="text-[13px] text-muted">Placed {day.format(order.createdAt)}</p>
      </div>

      {ended ? (
        <p className="mt-4 rounded-lg border border-border bg-white p-4 text-[15px]">
          This order was <strong>{order.statusText.toLowerCase()}</strong>.
          {order.paymentMethod === "RAZORPAY" && order.paid && " Your refund goes back to the original payment method within 5–7 working days."}
        </p>
      ) : (
        <Timeline order={order} />
      )}

      {order.shipment && (
        <section className="mt-5 rounded-lg border border-border bg-white p-5 text-[15px]">
          <h2 className="font-semibold">Shipment</h2>
          <p className="mt-1 text-muted">
            {order.shipment.courier ?? "Courier"}
            {order.shipment.awb && <> · AWB {order.shipment.awb}</>}
          </p>
          {order.shipment.trackingUrl && (
            <a href={order.shipment.trackingUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center font-semibold text-green-300">
              Track on the courier&apos;s site →
            </a>
          )}
        </section>
      )}

      <section className="mt-5 rounded-lg border border-border bg-white p-5" aria-labelledby="items-h">
        <h2 id="items-h" className="text-[15px] font-semibold">
          Items
        </h2>
        <ul className="mt-2 divide-y divide-divider">
          {order.items.map((i) => (
            <li key={i.id} className="flex gap-3 py-3">
              <span className="relative size-16 flex-none overflow-hidden rounded-sm bg-[#F1E9D6]">
                <ProductImage src={i.image} alt="" fill sizes="64px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1 text-[15px]">
                {i.href ? (
                  <Link href={i.href} className="font-semibold">
                    {i.title}
                  </Link>
                ) : (
                  <span className="font-semibold">{i.title}</span>
                )}
                {i.qty > 1 && <span className="text-muted"> × {i.qty}</span>}
                {i.detail && <span className="block text-[13px] text-muted">{i.detail}</span>}
              </span>
              <span className="text-[15px] tabular-nums">{formatINR(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-2 flex flex-col gap-1 border-t border-divider pt-3 text-[15px]">
          <Row label="Subtotal" value={formatINR(order.totals.subtotal)} />
          {order.totals.discount > 0 && <Row label="Discount" value={`−${formatINR(order.totals.discount)}`} />}
          <Row label="Shipping" value={order.totals.shipping ? formatINR(order.totals.shipping) : "Free"} />
          {order.totals.giftWrap > 0 && <Row label="Gift wrap" value={formatINR(order.totals.giftWrap)} />}
          {order.totals.codFee > 0 && <Row label="Cash on delivery fee" value={formatINR(order.totals.codFee)} />}
          <div className="flex justify-between border-t border-divider pt-2 font-bold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatINR(order.totals.total)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-[13px] text-muted">
          {order.paymentMethod === "COD" ? "Cash on delivery" : order.paid ? "Paid online" : "Awaiting online payment"} · prices include GST
        </p>
      </section>

      <section className="mt-5 rounded-lg border border-border bg-white p-5 text-[15px]">
        <h2 className="font-semibold">Delivering to</h2>
        <p className="mt-1 text-muted">{formatAddress(order.address)}</p>
        <p className="text-[13px] text-muted">{order.address.phone}</p>
        {order.giftMessage && <p className="mt-2 text-[13px] text-muted">Gift note: “{order.giftMessage}”</p>}
      </section>

      {order.returns.length > 0 && (
        <section className="mt-5 rounded-lg border border-border bg-white p-5 text-[15px]">
          <h2 className="font-semibold">Returns</h2>
          {order.returns.map((r) => (
            <p key={r.id} className="mt-1 text-muted">
              {r.reason} · <strong className="text-text">{r.status.charAt(0) + r.status.slice(1).toLowerCase()}</strong>
              {r.adminNote && <span className="block text-[13px]">{r.adminNote}</span>}
            </p>
          ))}
        </section>
      )}

      {order.reviewable.length > 0 && (
        <section className="mt-5 rounded-lg border border-border bg-white p-5" aria-labelledby="rev-h">
          <h2 id="rev-h" className="text-[15px] font-semibold">
            How was everything?
          </h2>
          <ul className="mt-2 divide-y divide-divider">
            {order.reviewable.map((p) => (
              <li key={p.productId} className="py-3">
                <p className="text-[15px]">{p.title}</p>
                {p.reviewed ? <p className="text-sm text-muted">Thanks for your review!</p> : <ReviewForm productId={p.productId} title={p.title} />}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {order.canReturn && (
          <div className="flex-1">
            <ReturnForm orderLabel={order.label} items={order.items.map((i) => ({ id: i.id, title: i.title, qty: i.qty }))} />
            <p className="mt-2 text-xs text-muted">Returns are accepted within {RETURN_WINDOW_DAYS} days of delivery.</p>
          </div>
        )}
        {help && (
          <a
            href={help}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 flex-1 items-center justify-center rounded-full bg-green-300 px-6 text-[15px] font-semibold text-ivory"
          >
            Get help on WhatsApp
          </a>
        )}
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

function Timeline({ order }: { order: AccountOrder }) {
  return (
    <section className="mt-4 rounded-lg border border-border bg-white p-5" aria-labelledby="track-h">
      <div className="flex items-center justify-between gap-2">
        <h2 id="track-h" className="text-[15px] font-semibold">
          Tracking
        </h2>
        <span className="rounded-full bg-gold-light/50 px-2.5 py-1 text-xs font-semibold text-gold-ink">{order.statusText}</span>
      </div>
      <ol className="mt-4">
        {order.timeline.map((s, i) => (
          <li key={s.key} className="relative flex gap-4 pb-6 last:pb-0" aria-current={s.current ? "step" : undefined}>
            {i < order.timeline.length - 1 && (
              <span aria-hidden className={cn("absolute left-[11px] top-6 h-[calc(100%-24px)] w-0.5", order.timeline[i + 1].done ? "bg-green-300" : "bg-divider")} />
            )}
            <span
              aria-hidden
              className={cn(
                "relative z-[1] flex size-6 flex-none items-center justify-center rounded-full border-2",
                s.done ? "border-green-300 bg-green-300 text-ivory" : "border-divider bg-white",
                s.current && "ring-4 ring-green-300/15",
              )}
            >
              {s.done && (
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 7.5 5.5 10.5 11.5 3.5" />
                </svg>
              )}
            </span>
            <span className="-mt-0.5">
              <span className={cn("block text-[15px]", s.done ? "font-semibold text-text" : "text-muted")}>
                {s.label}
                <span className="sr-only">{s.done ? " — done" : " — not yet"}</span>
              </span>
              {s.at && <span className="block text-[13px] text-muted">{when.format(s.at)}</span>}
              {s.key === "shipped" && s.done && order.shipment?.awb && (
                <span className="block text-[13px] text-muted">
                  {order.shipment.courier} · AWB {order.shipment.awb}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>
      {order.status === "PENDING" && (
        <p className="mt-4 text-[13px] text-muted">
          {order.paymentMethod === "COD" ? "We'll call you shortly to confirm this order." : "We're waiting for your payment to be confirmed."}
        </p>
      )}
    </section>
  );
}

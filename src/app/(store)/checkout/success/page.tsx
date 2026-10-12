import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Confetti } from "@/components/checkout/Confetti";
import { PendingRefresh } from "@/components/checkout/PendingRefresh";
import { Mascot } from "@/components/mascot/Mascot";
import { db } from "@/lib/db";
import { estimateDelivery } from "@/lib/delivery";
import { formatINR } from "@/lib/money";
import { parseOrderLabel } from "@/lib/order-utils";
import { formatAddress, type AddressSnapshot } from "@/lib/orders";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/settings-server";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

export default function SuccessPage(props: PageProps<"/checkout/success">) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-16 pt-8">
      <Suspense fallback={<div aria-hidden className="h-[60vh] animate-pulse rounded-lg bg-divider/40" />}>
        <OrderConfirmation searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

function addBusinessDays(from: Date, days: number) {
  const d = new Date(from);
  for (let added = 0; added < days; ) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) added++;
  }
  return d;
}

async function OrderConfirmation({ searchParams }: Pick<PageProps<"/checkout/success">, "searchParams">) {
  const sp = await searchParams;
  const label = typeof sp.order === "string" ? sp.order : "";
  const number = parseOrderLabel(label);
  if (!number) notFound();

  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(`/checkout/success?order=${label}`)}`);

  const [order, settings] = await Promise.all([
    db.order.findFirst({ where: { number, userId: session.uid }, include: { items: true } }),
    getSettings(),
  ]);
  if (!order) notFound();

  const address = order.addressSnapshot as AddressSnapshot;
  const awaitingPayment = order.paymentMethod === "RAZORPAY" && order.status === "PENDING";
  const { minDays, maxDays } = estimateDelivery(settings.pickupPincode, address.pincode);
  const fmt = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
  const from = new Date(order.createdAt);
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://swift.in";
  const share = `https://wa.me/?text=${encodeURIComponent(`I just wrapped up my Christmas shopping at swift.in 🎄✨ ${site}`)}`;

  return (
    <>
      {!awaitingPayment && <Confetti />}
      {awaitingPayment && <PendingRefresh />}
      <div className="flex flex-col items-center text-center">
        <Mascot width={130} greeting="Merry Christmas!" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold-ink">
          {awaitingPayment ? "Almost there" : "Thank you"}
        </p>
        <h1 className="mt-2 font-display text-[32px] font-medium leading-[1.15] text-green-heading">
          {awaitingPayment ? (
            "Confirming your payment…"
          ) : (
            <>
              Your Christmas is <em className="text-gold-dark">on its way</em>
            </>
          )}
        </h1>
        <p className="mt-3 text-[15px] text-muted">
          {awaitingPayment
            ? "This usually takes a few seconds. If money left your account, your order is safe — we'll confirm it automatically."
            : order.paymentMethod === "COD"
              ? "We'll call you shortly to confirm your cash-on-delivery order."
              : "Payment received. We'll text you when it ships."}
        </p>
      </div>

      <section className="mt-8 rounded-lg border border-border bg-white p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[13px] text-muted">Order number</p>
          <p className="font-display text-[22px] tracking-wide text-green-heading">{label.toUpperCase()}</p>
        </div>
        {!awaitingPayment && (
          <p className="mt-2 text-[15px] font-semibold text-green-300">
            Arrives {fmt.format(addBusinessDays(from, minDays))} – {fmt.format(addBusinessDays(from, maxDays))}
          </p>
        )}
        <ul className="mt-4 divide-y divide-divider border-t border-divider">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3 py-3 text-[15px]">
              <span>
                {i.titleSnapshot}
                {i.qty > 1 && <span className="text-muted"> × {i.qty}</span>}
                {i.detailSnapshot && <span className="block text-[13px] text-muted">{i.detailSnapshot}</span>}
              </span>
              <span className="tabular-nums">{formatINR(i.priceSnapshot * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="flex flex-col gap-1 border-t border-divider pt-3 text-[15px]">
          {order.discount > 0 && (
            <div className="flex justify-between text-green-300">
              <dt>Discount</dt>
              <dd>−{formatINR(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd>{order.shipping ? formatINR(order.shipping) : "Free"}</dd>
          </div>
          {order.codFee > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted">Cash on delivery fee</dt>
              <dd>{formatINR(order.codFee)}</dd>
            </div>
          )}
          <div className="flex justify-between text-[17px] font-bold">
            <dt>{order.paymentMethod === "COD" ? "To pay on delivery" : "Total paid"}</dt>
            <dd>{formatINR(order.total)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-[13px] text-muted">Delivering to {formatAddress(address)}</p>
        {order.giftMessage && <p className="mt-1 text-[13px] text-muted">Gift note: “{order.giftMessage}”</p>}
      </section>

      <div className="mt-6 flex flex-col gap-3">
        <a
          href={share}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-green-300 text-[15px] font-semibold text-ivory active:scale-[0.98]"
        >
          Share on WhatsApp
        </a>
        <Link href="/shop" className="flex h-[52px] items-center justify-center rounded-full border border-green-300 text-[15px] font-semibold text-green-300">
          Keep shopping
        </Link>
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { refreshCart, useCart, type CartView } from "@/lib/cart-store";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/money";
import { useSessionUser } from "@/lib/session-store";
import { AddressForm, type Address } from "./AddressForm";

type Method = "UPI" | "CARD" | "COD";
type Settings = { codEnabled: boolean; codFee: number };
type RazorpayInit = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  prefill: { name?: string; contact?: string; email?: string };
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function CheckoutView() {
  const router = useRouter();
  const user = useSessionUser();
  const { cart } = useCart();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [method, setMethod] = useState<Method>("UPI");
  const [email, setEmail] = useState("");
  const [eta, setEta] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Guests go through phone login first.
  useEffect(() => {
    if (user === null) router.replace("/login?next=/checkout");
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((s: Settings) => setSettings(s))
      .catch(() => {});
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((d: { addresses: Address[] }) => {
        setAddresses(d.addresses);
        setAddressId(d.addresses.find((a) => a.isDefault)?.id ?? d.addresses[0]?.id ?? null);
        setAdding(d.addresses.length === 0);
      })
      .catch(() => setAddresses([]));
  }, [user]);

  const selected = addresses?.find((a) => a.id === addressId) ?? null;

  // Delivery estimate for the chosen address.
  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    fetch("/api/pincode-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pincode: selected.pincode }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (!d.serviceable) return setEta("Sorry, we can't deliver to this pincode yet");
        const by = new Date(Date.now() + d.maxDays * 864e5);
        setEta(`Arrives by ${new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" }).format(by)}`);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const codFee = method === "COD" && settings ? settings.codFee : 0;
  const payable = (cart?.total ?? 0) + codFee;

  const placeOrder = useCallback(async () => {
    if (!addressId) return setError("Choose or add a delivery address");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId, paymentMethod: method === "COD" ? "COD" : "RAZORPAY", email }),
      });
      const data = (await res.json()) as { error?: string; order?: { label: string }; razorpay?: RazorpayInit | null };
      if (!res.ok || !data.order) throw new Error(data.error ?? "Couldn't place your order");

      if (!data.razorpay) {
        await refreshCart();
        router.replace(`/checkout/success?order=${data.order.label}`);
        return;
      }

      const label = data.order.label;
      const rp = data.razorpay;
      if (!(await loadRazorpay()) || !window.Razorpay) throw new Error("Couldn't load the payment window — check your connection");
      const checkout = new window.Razorpay({
        key: rp.keyId,
        order_id: rp.orderId,
        amount: rp.amount,
        currency: rp.currency,
        name: "swift.in",
        description: `Order ${label}`,
        prefill: { ...rp.prefill, method: method === "UPI" ? "upi" : "card" },
        theme: { color: "#0B5E3E" },
        handler: async (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const v = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(r),
          });
          await refreshCart();
          router.replace(`/checkout/success?order=${label}${v.ok ? "" : "&pending=1"}`);
        },
        modal: {
          ondismiss: () => {
            setBusy(false);
            setError("Payment was cancelled. Your cart is still here — try again whenever you're ready.");
          },
        },
      });
      checkout.on("payment.failed", () => setError("That payment didn't go through. Please try again or pick another method."));
      checkout.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't place your order");
      setBusy(false);
    }
  }, [addressId, method, email, router]);

  if (user === undefined || (user && (!cart || !addresses))) return <CheckoutSkeleton />;
  if (!user) return null;
  if (cart && cart.items.length === 0) {
    return (
      <div className="mt-10 text-center">
        <p className="text-[15px] text-muted">Your cart is empty.</p>
        <Link href="/shop" className="mt-4 inline-flex h-12 items-center rounded-full bg-green-300 px-7 font-semibold text-ivory">
          Browse the collection
        </Link>
      </div>
    );
  }

  const step = "rounded-lg border border-border bg-white p-5";
  return (
    <div className="mt-6 grid grid-cols-1 gap-5 pb-28 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:pb-0">
      <div className="flex flex-col gap-5">
        {/* 1. Address */}
        <section className={step} aria-labelledby="addr-h">
          <h2 id="addr-h" className="flex items-center gap-3 text-[17px] font-semibold">
            <StepNo n={1} /> Delivery address
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {addresses!.map((a) => (
              <label
                key={a.id}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-sm border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-deep",
                  a.id === addressId ? "border-green-300 bg-green-300/5" : "border-border",
                )}
              >
                <input type="radio" name="address" checked={a.id === addressId} onChange={() => setAddressId(a.id)} className="mt-1 size-5 accent-[#0B5E3E]" />
                <span className="text-[15px]">
                  <strong className="block">{a.name}</strong>
                  <span className="text-muted">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
                  </span>
                  <span className="block text-[13px] text-muted">{a.phone}</span>
                </span>
              </label>
            ))}
            {adding ? (
              <div className={addresses!.length ? "rounded-sm border border-dashed border-divider p-4" : ""}>
                <AddressForm
                  defaultPhone={user.phone ?? undefined}
                  onSaved={(a) => {
                    setAddresses((prev) => [...(a.isDefault ? (prev ?? []).map((x) => ({ ...x, isDefault: false })) : prev ?? []), a]);
                    setAddressId(a.id);
                    setAdding(false);
                  }}
                  onCancel={addresses!.length ? () => setAdding(false) : undefined}
                />
              </div>
            ) : (
              <button type="button" onClick={() => setAdding(true)} className="min-h-11 self-start text-[15px] font-semibold text-green-300">
                + Add a new address
              </button>
            )}
            {selected && eta && (
              <p className="text-sm font-semibold text-green-300" aria-live="polite">
                {eta}
              </p>
            )}
          </div>
        </section>

        {/* 2. Payment */}
        <section className={step} aria-labelledby="pay-h">
          <h2 id="pay-h" className="flex items-center gap-3 text-[17px] font-semibold">
            <StepNo n={2} /> Payment
          </h2>
          <div className="mt-4 flex flex-col gap-3" role="radiogroup" aria-labelledby="pay-h">
            <PayOption checked={method === "UPI"} onSelect={() => setMethod("UPI")} title="UPI" sub="GPay, PhonePe, Paytm or any UPI app" />
            <PayOption checked={method === "CARD"} onSelect={() => setMethod("CARD")} title="Card or netbanking" sub="Visa, Mastercard, RuPay · all major banks" />
            {settings?.codEnabled && (
              <PayOption
                checked={method === "COD"}
                onSelect={() => setMethod("COD")}
                title="Cash on delivery"
                sub={settings.codFee > 0 ? `${formatINR(settings.codFee)} handling fee · we'll call to confirm` : "We'll call to confirm"}
              />
            )}
          </div>
          <div className="mt-5 flex flex-col gap-1.5">
            <label htmlFor="receipt-email" className="text-[13px] font-semibold">
              Email for your receipt <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="receipt-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              placeholder="you@example.com"
              className="h-12 rounded-sm border border-border bg-white px-4 text-[15px] outline-none focus:border-green-200"
            />
          </div>
        </section>
      </div>

      {/* Summary */}
      <aside className={cn(step, "lg:sticky lg:top-20")} aria-labelledby="sum-h">
        <h2 id="sum-h" className="text-[17px] font-semibold">
          Order summary
        </h2>
        <ul className="mt-3 flex flex-col gap-3">
          {cart!.items.map((i) => (
            <li key={i.id} className="flex items-center gap-3">
              <span className="relative size-14 flex-none overflow-hidden rounded-sm bg-[#F1E9D6]">
                <ProductImage src={i.image} alt="" fill sizes="56px" className="object-cover" />
                {i.qty > 1 && (
                  <span className="absolute right-1 top-1 rounded-full bg-green-300 px-1.5 text-xs font-bold text-ivory">{i.qty}</span>
                )}
              </span>
              <span className="min-w-0 flex-1 text-sm">
                <span className="block truncate font-semibold">{i.title}</span>
                {i.detail && <span className="block truncate text-xs text-muted">{i.detail}</span>}
              </span>
              <span className="text-sm tabular-nums">{formatINR(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <Totals cart={cart!} codFee={codFee} payable={payable} />
        {cart!.hasIssues && (
          <p className="mt-3 text-sm text-red-sale">
            Some items need attention. <Link href="/cart" className="font-semibold underline">Review cart</Link>
          </p>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-sale">
            {error}
          </p>
        )}
        <PlaceButton busy={busy} disabled={!addressId || cart!.hasIssues} method={method} payable={payable} onClick={placeOrder} className="mt-4 hidden lg:flex" />
        <p className="mt-3 text-center text-xs text-muted">Secure payments by Razorpay · 7-day easy returns</p>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-divider bg-ivory/95 shadow-[0_-8px_24px_rgba(10,61,41,.08)] backdrop-blur lg:hidden">
        <div className="mx-auto max-w-6xl px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-2.5">
          <PlaceButton busy={busy} disabled={!addressId || cart!.hasIssues} method={method} payable={payable} onClick={placeOrder} />
        </div>
      </div>
    </div>
  );
}

function StepNo({ n }: { n: number }) {
  return <span className="flex size-7 items-center justify-center rounded-full bg-green-300 text-sm font-bold text-ivory">{n}</span>;
}

function PayOption({ checked, onSelect, title, sub }: { checked: boolean; onSelect: () => void; title: string; sub: string }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-sm border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-deep",
        checked ? "border-green-300 bg-green-300/5" : "border-border",
      )}
    >
      <input type="radio" name="payment" checked={checked} onChange={onSelect} className="size-5 accent-[#0B5E3E]" />
      <span>
        <strong className="block text-[15px]">{title}</strong>
        <span className="text-[13px] text-muted">{sub}</span>
      </span>
    </label>
  );
}

function Totals({ cart, codFee, payable }: { cart: CartView; codFee: number; payable: number }) {
  const row = "flex justify-between gap-3";
  return (
    <dl className="mt-4 flex flex-col gap-2 border-t border-divider pt-4 text-[15px]">
      <div className={row}>
        <dt className="text-muted">Subtotal</dt>
        <dd className="tabular-nums">{formatINR(cart.subtotal)}</dd>
      </div>
      {cart.discount > 0 && (
        <div className={cn(row, "text-green-300")}>
          <dt>Discount · {cart.coupon?.code}</dt>
          <dd className="tabular-nums">−{formatINR(cart.discount)}</dd>
        </div>
      )}
      <div className={row}>
        <dt className="text-muted">Shipping</dt>
        <dd className="tabular-nums">{cart.shipping ? formatINR(cart.shipping) : "Free"}</dd>
      </div>
      {cart.giftWrap && (
        <div className={row}>
          <dt className="text-muted">Gold gift wrap</dt>
          <dd className="tabular-nums">{cart.giftWrapFee ? formatINR(cart.giftWrapFee) : "Complimentary"}</dd>
        </div>
      )}
      {codFee > 0 && (
        <div className={row}>
          <dt className="text-muted">Cash on delivery fee</dt>
          <dd className="tabular-nums">{formatINR(codFee)}</dd>
        </div>
      )}
      <div className={cn(row, "border-t border-divider pt-3 text-[17px] font-bold")}>
        <dt>To pay</dt>
        <dd className="tabular-nums">{formatINR(payable)}</dd>
      </div>
      <p className="text-xs text-muted">Prices include GST.</p>
    </dl>
  );
}

function PlaceButton({
  busy,
  disabled,
  method,
  payable,
  onClick,
  className,
}: {
  busy: boolean;
  disabled: boolean;
  method: Method;
  payable: number;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      className={cn(
        "flex h-[54px] w-full items-center justify-center rounded-full bg-[image:var(--grad-gold-btn)] text-[15px] font-bold text-gold-on shadow-[inset_0_1px_0_rgba(255,255,255,.5)] transition-transform active:scale-[0.98] disabled:opacity-50",
        className,
      )}
    >
      {busy ? "Please wait…" : method === "COD" ? `Place order · ${formatINR(payable)}` : `Pay ${formatINR(payable)}`}
    </button>
  );
}

function CheckoutSkeleton() {
  return (
    <div aria-hidden className="mt-6 grid animate-pulse grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex flex-col gap-5">
        <div className="h-48 rounded-lg bg-divider/60" />
        <div className="h-56 rounded-lg bg-divider/60" />
      </div>
      <div className="h-80 rounded-lg bg-divider/60" />
    </div>
  );
}

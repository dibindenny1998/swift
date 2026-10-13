"use client";

import { useEffect, useState, type FormEvent } from "react";
import { applyCoupon, removeCoupon, setGift, useCart, type CartView } from "@/lib/cart-store";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/money";
import { CartLines, EmptyCart, FreeShippingBar } from "./CartLines";
import { CheckoutLink } from "./CheckoutLink";

export function CartPage() {
  const { cart } = useCart();

  if (!cart) {
    return (
      <div aria-hidden className="mt-8 flex animate-pulse flex-col gap-4">
        <div className="h-24 rounded-sm bg-divider/60" />
        <div className="h-24 rounded-sm bg-divider/60" />
      </div>
    );
  }
  if (cart.items.length === 0) return <EmptyCart />;

  return (
    <div className="mt-6 grid grid-cols-1 gap-8 pb-28 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:pb-0">
      <div>
        <FreeShippingBar remaining={cart.freeShippingRemaining} threshold={cart.freeShippingThreshold} />
        {cart.offerNudge && <p className="mt-2 rounded-sm bg-gold-light/40 px-3 py-2 text-[13px] font-semibold text-gold-ink">{cart.offerNudge}</p>}
        <div className="mt-2">
          <CartLines items={cart.items} />
        </div>
        <GiftOptions cart={cart} />
      </div>
      <aside className="flex flex-col gap-5 rounded-lg border border-border bg-white p-5 lg:sticky lg:top-20">
        <CouponField cart={cart} />
        <Summary cart={cart} />
        {cart.hasIssues && <p className="text-[13px] text-red-sale">Please update the items marked in your cart to continue.</p>}
        <CheckoutLink disabled={cart.hasIssues} className="hidden lg:flex" />
        <p className="text-center text-xs text-muted">UPI, cards, netbanking or cash on delivery at the next step.</p>
      </aside>

      {/* Mobile sticky checkout */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-divider bg-ivory/95 shadow-[0_-8px_24px_rgba(10,61,41,.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-2.5">
          <div className="flex flex-col">
            <span className="text-xs text-muted">Total</span>
            <strong className="text-base font-bold tabular-nums">{formatINR(cart.total)}</strong>
          </div>
          <CheckoutLink disabled={cart.hasIssues} className="h-[50px] flex-1" />
        </div>
      </div>
    </div>
  );
}

function Summary({ cart }: { cart: CartView }) {
  const row = "flex justify-between gap-3";
  return (
    <dl className="flex flex-col gap-2 border-t border-divider pt-4 text-[15px]">
      <div className={row}>
        <dt className="text-muted">Subtotal</dt>
        <dd className="tabular-nums">{formatINR(cart.subtotal)}</dd>
      </div>
      {cart.discounts.map((d) => (
        <div key={d.label} className={cn(row, "text-green-300")}>
          <dt>{d.label}</dt>
          <dd className="tabular-nums">{d.amount ? `−${formatINR(d.amount)}` : "Free shipping"}</dd>
        </div>
      ))}
      <div className={row}>
        <dt className="text-muted">Shipping</dt>
        <dd className="tabular-nums">{cart.shipping > 0 ? formatINR(cart.shipping) : "Free"}</dd>
      </div>
      {cart.giftWrap && (
        <div className={row}>
          <dt className="text-muted">Gold gift wrap</dt>
          <dd className="tabular-nums">{cart.giftWrapFee > 0 ? formatINR(cart.giftWrapFee) : "Complimentary"}</dd>
        </div>
      )}
      <div className={cn(row, "border-t border-divider pt-3 text-[17px] font-bold")}>
        <dt>Total</dt>
        <dd className="tabular-nums">{formatINR(cart.total)}</dd>
      </div>
      <p className="text-xs text-muted">Prices include GST.</p>
    </dl>
  );
}

function CouponField({ cart }: { cart: CartView }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError("");
    try {
      await applyCoupon(code);
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't apply that code");
    } finally {
      setBusy(false);
    }
  }

  if (cart.coupon) {
    return (
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold">
            Code <span className="rounded-full bg-ivory px-2 py-0.5 tracking-[0.08em]">{cart.coupon.code}</span>
          </p>
          <p className={cn("mt-1 text-[13px]", cart.couponError ? "text-red-sale" : "text-green-300")} role={cart.couponError ? "alert" : undefined}>
            {cart.couponError ?? `${cart.coupon.description} applied`}
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await removeCoupon().catch(() => {});
            setBusy(false);
          }}
          className="min-h-11 text-[13px] font-semibold text-muted underline-offset-4 hover:underline"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor="coupon" className="text-[13px] font-semibold">
        Coupon code
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          id="coupon"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          autoCapitalize="characters"
          autoComplete="off"
          placeholder="e.g. MERRY10"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "coupon-error" : undefined}
          className="h-11 min-w-0 flex-1 rounded-full border border-border bg-ivory px-4 text-[15px] tracking-[0.06em] outline-none focus:border-green-200"
        />
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className="h-11 rounded-full border border-green-300 px-5 text-sm font-semibold text-green-300 hover:bg-green-300/5 active:scale-[0.98] disabled:opacity-50"
        >
          {busy ? "Applying…" : "Apply"}
        </button>
      </div>
      {error && (
        <p id="coupon-error" role="alert" className="mt-1.5 text-xs text-red-sale">
          {error}
        </p>
      )}
    </form>
  );
}

function GiftOptions({ cart }: { cart: CartView }) {
  const [message, setMessage] = useState(cart.giftMessage ?? "");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 1500);
    return () => clearTimeout(t);
  }, [saved]);

  const save = async (wrap: boolean, msg: string) => {
    await setGift(wrap, msg || null).catch(() => {});
    setSaved(true);
  };

  return (
    <section className="mt-6 rounded-lg border border-border bg-white p-5" aria-labelledby="gift-heading">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 id="gift-heading" className="text-[15px] font-semibold">
            Gold gift wrap
          </h2>
          <p className="text-[13px] text-muted">
            {cart.giftWrapPrice > 0 ? `${formatINR(cart.giftWrapPrice)} · ` : "Complimentary · "}hand-tied with a gold ribbon
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={cart.giftWrap}
          aria-labelledby="gift-heading"
          onClick={() => save(!cart.giftWrap, message)}
          className={cn("relative h-8 w-14 flex-none rounded-full transition-colors", cart.giftWrap ? "bg-green-300" : "bg-divider")}
        >
          <span className={cn("absolute top-1 size-6 rounded-full bg-white shadow transition-[left] duration-200", cart.giftWrap ? "left-7" : "left-1")} />
        </button>
      </div>
      {cart.giftWrap && (
        <div className="mt-4">
          <label htmlFor="gift-note" className="text-[13px] font-semibold">
            Gift note <span className="font-normal text-muted">(optional, handwritten)</span>
          </label>
          <textarea
            id="gift-note"
            value={message}
            maxLength={200}
            rows={2}
            onChange={(e) => setMessage(e.target.value)}
            onBlur={() => message !== (cart.giftMessage ?? "") && save(true, message)}
            placeholder="Merry Christmas, with love…"
            className="mt-1.5 w-full rounded-sm border border-border bg-ivory p-3 text-[15px] outline-none focus:border-green-200"
          />
          <p className="text-right text-xs text-muted" aria-live="polite">
            {saved ? "Saved" : `${message.length}/200`}
          </p>
        </div>
      )}
    </section>
  );
}

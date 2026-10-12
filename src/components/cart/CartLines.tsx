"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { removeItem, updateQty, type CartLineView } from "@/lib/cart-store";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/money";

export function CartLines({ items, compact, onNavigate }: { items: CartLineView[]; compact?: boolean; onNavigate?: () => void }) {
  return (
    <ul className="divide-y divide-divider">
      {items.map((item) => (
        <CartLine key={item.id} item={item} compact={compact} onNavigate={onNavigate} />
      ))}
    </ul>
  );
}

function CartLine({ item, compact, onNavigate }: { item: CartLineView; compact?: boolean; onNavigate?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't update");
    } finally {
      setBusy(false);
    }
  };

  const size = compact ? "size-[72px]" : "size-24";
  return (
    <li className={cn("flex gap-3 py-4 transition-opacity", busy && "opacity-60")} aria-busy={busy}>
      <Link href={item.href} onClick={onNavigate} className={cn("relative flex-none overflow-hidden rounded-sm bg-[#F1E9D6]", size)}>
        <ProductImage src={item.image} alt="" fill sizes="96px" className="object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={item.href} onClick={onNavigate} className="text-[15px] font-semibold leading-snug">
            {item.title}
          </Link>
          <span className="flex-none text-[15px] font-semibold tabular-nums">{formatINR(item.lineTotal)}</span>
        </div>
        {item.detail && <p className={cn("text-[13px] text-muted", compact && "line-clamp-2")}>{item.detail}</p>}
        {item.issue && (
          <p role="alert" className="text-[13px] font-semibold text-red-sale">
            {item.issue}
          </p>
        )}
        <div className="mt-1 flex items-center justify-between gap-2">
          {item.kind === "byo" ? (
            <span className="text-[13px] text-muted">{item.qty > 1 ? `${item.qty} boxes` : "1 box"}</span>
          ) : (
            <QtyStepper
              size="sm"
              value={item.qty}
              min={1}
              max={Math.max(item.qty, item.maxQty)}
              label={`${item.title} quantity`}
              onChange={(n) => run(() => updateQty(item.id, n))}
            />
          )}
          <button
            type="button"
            onClick={() => run(() => removeItem(item.id))}
            className="min-h-11 px-1 text-[13px] font-semibold text-muted underline-offset-4 hover:text-text hover:underline"
            aria-label={`Remove ${item.title}`}
          >
            Remove
          </button>
        </div>
        {error && <p className="text-xs text-red-sale">{error}</p>}
      </div>
    </li>
  );
}

export function FreeShippingBar({ remaining, threshold }: { remaining: number; threshold: number }) {
  const progress = threshold > 0 ? Math.min(1, (threshold - remaining) / threshold) : 1;
  return (
    <div>
      <p className="text-[13px]" aria-live="polite">
        {remaining > 0 ? (
          <>
            You&apos;re <strong>{formatINR(remaining)}</strong> away from free shipping
          </>
        ) : (
          <strong className="text-green-300">You&apos;ve unlocked free shipping</strong>
        )}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-divider" aria-hidden>
        <div className="h-full rounded-full bg-green-300 transition-[width] duration-500 ease-calm" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}

export function EmptyCart({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand art */}
      <img src="/mascot.png" alt="" width={110} height={146} className="h-auto w-[110px]" />
      <p className="font-display text-[22px] text-green-heading">Your cart is empty</p>
      <p className="max-w-[260px] text-[15px] text-muted">Trees, lights and gifts are waiting — and gold gift wrap is on us.</p>
      <Link href="/shop" onClick={onNavigate} className="flex h-12 items-center rounded-full bg-green-300 px-7 text-[15px] font-semibold text-ivory active:scale-[0.98]">
        Start shopping
      </Link>
    </div>
  );
}

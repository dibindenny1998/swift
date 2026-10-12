"use client";

import { useMemo, useState } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { addToCart } from "@/lib/cart-store";
import type { GiftBoxBuilderData } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/money";
import { byoPrice } from "@/lib/pricing";

const MAX_ITEMS = 10;
const MAX_MESSAGE = 200;

export function GiftBoxBuilder({ builder }: { builder: GiftBoxBuilderData }) {
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [message, setMessage] = useState("");
  const [added, setAdded] = useState(false);

  const count = Object.values(picks).reduce((a, b) => a + b, 0);
  const subtotal = builder.options.reduce((sum, o) => sum + (picks[o.variantId] ?? 0) * o.price, 0);
  const price = byoPrice(subtotal, count, builder.tiers);
  const topTier = builder.tiers.at(-1)!;
  const progress = Math.min(1, count / topTier.minItems);

  const tiersText = useMemo(
    () => builder.tiers.map((t) => `${t.minItems} pieces → ${t.percentOff}% off`).join(" · "),
    [builder.tiers],
  );

  const set = (variantId: string, n: number) => {
    setAdded(false);
    setPicks((prev) => {
      const next = { ...prev };
      if (n <= 0) delete next[variantId];
      else next[variantId] = n;
      return next;
    });
  };

  const addBox = () => {
    if (count === 0) return;
    const signature = Object.entries(picks)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, n]) => `${id}x${n}`)
      .join(",");
    addToCart({
      key: `byo:${builder.id}:${signature}:${message.trim()}`,
      title: `Gift box · ${count} piece${count === 1 ? "" : "s"}`,
      image: builder.options.find((o) => picks[o.variantId])?.image ?? "/placeholders/gifts.svg",
      price: price.total,
      meta: { byo: { bundleId: builder.id, picks, message: message.trim() || undefined } },
    });
    setAdded(true);
  };

  return (
    <>
      <p className="mt-3 max-w-xl text-[15px] text-muted">{builder.description}</p>
      <p className="mt-2 text-sm font-semibold text-green-300">{tiersText}</p>

      {/* Tier progress */}
      <div className="mt-6 rounded-lg border border-border bg-white p-4">
        <div className="relative h-2 rounded-full bg-divider">
          <div className="absolute inset-y-0 left-0 rounded-full bg-green-300 transition-[width] duration-500 ease-calm" style={{ width: `${progress * 100}%` }} />
          {builder.tiers.map((t) => (
            <span
              key={t.minItems}
              aria-hidden
              className={cn(
                "absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white",
                count >= t.minItems ? "bg-gold" : "bg-divider",
              )}
              style={{ left: `${(t.minItems / topTier.minItems) * 100}%` }}
            />
          ))}
        </div>
        <p className="mt-3 text-sm" aria-live="polite">
          {price.next ? (
            <>
              Add <strong>{price.itemsToNext}</strong> more to unlock <strong className="text-green-300">{price.next.percentOff}% off</strong>
            </>
          ) : (
            <strong className="text-green-300">Best price unlocked — {price.current?.percentOff}% off</strong>
          )}
        </p>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-4">
        {builder.options.map((o) => {
          const n = picks[o.variantId] ?? 0;
          const soldOut = o.stock <= 0;
          return (
            <li key={o.variantId} className="flex flex-col gap-2.5">
              <div className={cn("relative aspect-square overflow-hidden rounded-sm bg-[#F1E9D6] ring-2 ring-transparent transition", n > 0 && "ring-gold-line")}>
                <ProductImage src={o.image} alt={o.title} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
                {n > 0 && (
                  <span className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-gold text-xs font-bold text-gold-on">
                    {n}
                  </span>
                )}
              </div>
              <div>
                <p className="text-[14.5px] font-semibold leading-snug">{o.title}</p>
                <p className="text-sm text-muted">
                  {o.variantName} · {formatINR(o.price)}
                </p>
              </div>
              {soldOut ? (
                <p className="text-sm text-muted">Sold out</p>
              ) : n === 0 ? (
                <button
                  type="button"
                  onClick={() => set(o.variantId, 1)}
                  disabled={count >= MAX_ITEMS}
                  className="h-11 rounded-full border border-green-300 text-sm font-semibold text-green-300 hover:bg-green-300/5 active:scale-[0.98] disabled:opacity-40"
                  aria-label={`Add ${o.title} to your box`}
                >
                  Add to box
                </button>
              ) : (
                <QtyStepper
                  value={n}
                  onChange={(v) => set(o.variantId, v)}
                  min={0}
                  max={Math.min(o.stock, n + MAX_ITEMS - count)}
                  label={`${o.title} quantity`}
                  className="self-start"
                />
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-8 max-w-xl">
        <label htmlFor="gift-message" className="text-[13px] font-semibold">
          Your note <span className="font-normal text-muted">(handwritten on a gold card)</span>
        </label>
        <textarea
          id="gift-message"
          value={message}
          maxLength={MAX_MESSAGE}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Merry Christmas, with love…"
          className="mt-1.5 w-full rounded-sm border border-border bg-white p-4 text-[15px] outline-none focus:border-green-200"
        />
        <p className="text-right text-xs text-muted">
          {message.length}/{MAX_MESSAGE}
        </p>
      </div>

      {/* Sticky summary */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-divider bg-ivory/95 shadow-[0_-8px_24px_rgba(10,61,41,.08)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-2.5">
          <div className="flex flex-1 flex-col" aria-live="polite">
            <span className="text-xs text-muted">
              {count} piece{count === 1 ? "" : "s"}
              {price.discount > 0 && <span className="text-red-sale"> · you save {formatINR(price.discount)}</span>}
            </span>
            <span className="flex items-baseline gap-2">
              <strong className="text-base font-bold">{formatINR(price.total)}</strong>
              {price.discount > 0 && <s className="text-xs text-muted">{formatINR(price.subtotal)}</s>}
            </span>
          </div>
          <button
            type="button"
            onClick={addBox}
            disabled={count === 0}
            className={cn(
              "flex h-[50px] items-center rounded-full px-6 text-[15px] font-semibold text-ivory transition-[transform,background-color] active:scale-[0.98] disabled:bg-divider disabled:text-muted",
              added ? "bg-green-200" : "bg-green-300",
            )}
          >
            {added ? "Added to cart" : "Add box to cart"}
          </button>
        </div>
      </div>
    </>
  );
}

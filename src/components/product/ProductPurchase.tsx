"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { PriceTag } from "@/components/ui/PriceTag";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { addToCart } from "@/lib/cart-store";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/money";
import { PincodeCheck } from "./PincodeCheck";
import { WishlistButton } from "./WishlistButton";

type Variant = { id: string; name: string; price: number; mrp: number; stock: number; weightGrams: number };

export function ProductPurchase({
  product,
  variantLabel,
  lowStockThreshold,
  christmas,
}: {
  product: { id: string; title: string; image: string; variants: Variant[] };
  variantLabel: string;
  lowStockThreshold: number;
  christmas: string;
}) {
  const firstInStock = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
  const [variantId, setVariantId] = useState(firstInStock.id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const mainButton = useRef<HTMLButtonElement>(null);

  const variant = product.variants.find((v) => v.id === variantId) ?? firstInStock;
  const maxQty = Math.max(1, Math.min(10, variant.stock));
  const soldOut = variant.stock <= 0;

  useEffect(() => {
    const el = mainButton.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setShowBar(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(t);
  }, [added]);

  const title = product.variants.length > 1 ? `${product.title} — ${variant.name}` : product.title;
  const add = () => {
    if (soldOut) return;
    addToCart({ key: `v:${variant.id}`, title, image: product.image, price: variant.price }, qty);
    setAdded(true);
  };

  const addLabel = soldOut ? "Sold out" : added ? "Added to cart" : "Add to cart";

  return (
    <div className="flex flex-col gap-5">
      <div>
        <PriceTag price={variant.price} mrp={variant.mrp} showPercent size="lg" />
        <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>
      </div>

      <p className="text-sm font-semibold" aria-live="polite">
        {soldOut ? (
          <span className="text-muted">Sold out — back soon</span>
        ) : variant.stock <= lowStockThreshold ? (
          <span className="text-red-sale">Only {variant.stock} left</span>
        ) : (
          <span className="text-green-300">In stock · ships from Bangalore</span>
        )}
      </p>

      {product.variants.length > 1 && (
        <fieldset>
          <legend className="text-[13px] font-semibold">
            {variantLabel}: <span className="font-normal text-muted">{variant.name}</span>
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <label
                key={v.id}
                className={cn(
                  "relative inline-flex h-11 min-w-16 cursor-pointer items-center justify-center rounded-full border px-4 text-sm font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-deep",
                  v.id === variantId ? "border-green-300 bg-green-300 text-ivory" : "border-border bg-white text-text hover:border-green-300/40",
                  v.stock <= 0 && "text-muted line-through",
                )}
              >
                <input
                  type="radio"
                  name="variant"
                  value={v.id}
                  checked={v.id === variantId}
                  onChange={() => {
                    setVariantId(v.id);
                    setQty(1);
                  }}
                  className="sr-only"
                />
                {v.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex items-center gap-3">
        <QtyStepper value={qty} onChange={setQty} max={maxQty} />
        <WishlistButton productId={product.id} title={product.title} tone="plain" />
      </div>

      <button
        ref={mainButton}
        type="button"
        onClick={add}
        disabled={soldOut}
        className={cn(
          "flex h-[54px] w-full items-center justify-center rounded-full text-[15px] font-bold transition-[transform,background-color] active:scale-[0.98] disabled:bg-divider disabled:text-muted",
          added ? "bg-green-200 text-ivory" : "bg-green-300 text-ivory",
        )}
      >
        {addLabel}
        {!soldOut && !added && <span className="ml-2 font-semibold opacity-80">· {formatINR(variant.price * qty)}</span>}
      </button>

      <PincodeCheck weightGrams={variant.weightGrams * qty} christmas={christmas} />

      <AnimatePresence>
        {showBar && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.35 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-divider bg-ivory/95 shadow-[0_-8px_24px_rgba(10,61,41,.08)] backdrop-blur"
          >
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-2.5">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-xs text-muted">{title}</span>
                <strong className="text-base font-bold">{formatINR(variant.price)}</strong>
              </div>
              <button
                type="button"
                onClick={add}
                disabled={soldOut}
                className="flex h-[50px] items-center rounded-full bg-green-300 px-7 text-[15px] font-semibold text-ivory active:scale-[0.98] disabled:bg-divider disabled:text-muted"
              >
                {addLabel}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { addToCart, type CartLine } from "@/lib/cart-store";
import { cn } from "@/lib/cn";

export function AddButton({ line, label = "Add", className }: { line: Omit<CartLine, "qty">; label?: string; className?: string }) {
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(t);
  }, [added]);

  return (
    <button
      type="button"
      onClick={() => {
        addToCart(line);
        setAdded(true);
      }}
      aria-label={`Add ${line.title} to cart`}
      className={cn(
        "inline-flex h-11 min-w-[76px] items-center justify-center gap-1.5 rounded-full bg-green-300 px-5 text-sm font-semibold text-ivory transition-[transform,background-color] duration-150 active:scale-[0.98]",
        added && "bg-green-200",
        className,
      )}
    >
      {added ? (
        <>
          <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 7.5 5.5 10.5 11.5 3.5" />
          </svg>
          Added
        </>
      ) : (
        label
      )}
    </button>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { formatINR } from "@/lib/money";

/** Bottom bar that appears once the cart has items. A spacer keeps it from covering the footer. */
export function StickyCartBar() {
  const { count, total } = useCart();
  return (
    <>
      {count > 0 && <div aria-hidden className="h-[76px]" />}
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-divider bg-ivory/95 shadow-[0_-8px_24px_rgba(10,61,41,.08)] backdrop-blur"
          >
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-2.5">
              <div className="flex flex-1 flex-col" aria-live="polite">
                <span className="text-xs text-muted">
                  {count} item{count === 1 ? "" : "s"} in your cart
                </span>
                <strong className="text-base font-bold">{formatINR(total)}</strong>
              </div>
              <Link
                href="/cart"
                className="flex h-[50px] items-center rounded-full bg-green-300 px-7 text-[15px] font-semibold text-ivory transition-transform active:scale-[0.98]"
              >
                View cart
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

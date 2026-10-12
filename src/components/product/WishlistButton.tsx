"use client";

import { cn } from "@/lib/cn";
import { toggleWishlist, useWishlist } from "@/lib/wishlist-store";

export function WishlistButton({ productId, title, className, tone = "overlay" }: { productId: string; title: string; className?: string; tone?: "overlay" | "plain" }) {
  const saved = useWishlist().includes(productId);
  return (
    <button
      type="button"
      onClick={() => toggleWishlist(productId)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from wishlist` : `Save ${title} to wishlist`}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full transition-transform active:scale-[0.92]",
        tone === "overlay" ? "bg-ivory/85 backdrop-blur-sm" : "border border-border bg-white",
        className,
      )}
    >
      <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" strokeWidth="1.6" stroke={saved ? "#A3192B" : "#1F1B14"} fill={saved ? "#A3192B" : "none"} className="transition-colors">
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

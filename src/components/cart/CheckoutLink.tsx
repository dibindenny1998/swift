"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { useSessionUser } from "@/lib/session-store";

/** Gold checkout button; guests are sent through phone login first. */
export function CheckoutLink({ disabled, className, onNavigate }: { disabled?: boolean; className?: string; onNavigate?: () => void }) {
  const user = useSessionUser();
  const href = user ? "/checkout" : "/login?next=/checkout";
  const cls = cn(
    "flex h-[54px] w-full items-center justify-center rounded-full bg-[image:var(--grad-gold-btn)] text-[15px] font-bold text-gold-on shadow-[inset_0_1px_0_rgba(255,255,255,.5)] transition-transform active:scale-[0.98]",
    className,
  );
  if (disabled) {
    return (
      <span aria-disabled="true" className={cn(cls, "cursor-not-allowed opacity-50")}>
        Checkout
      </span>
    );
  }
  return (
    <Link href={href} onClick={onNavigate} className={cls}>
      Checkout
    </Link>
  );
}

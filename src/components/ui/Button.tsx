import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "gold" | "green" | "outline" | "outline-light" | "ghost";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-sans font-semibold whitespace-nowrap select-none " +
  "transition-[transform,box-shadow,background-color] duration-150 ease-calm active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  // Gold primary — gold is an accent, so keep one per view.
  gold:
    "bg-[image:var(--grad-gold-btn)] text-gold-on shadow-[inset_0_1px_0_rgba(255,255,255,.5),0_6px_16px_-8px_rgba(169,126,32,.7)]",
  green: "bg-[image:var(--grad-green-btn)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.18)]",
  outline: "border border-green-heading/25 text-green-heading bg-transparent hover:bg-green-heading/5",
  "outline-light": "border border-gold-line/60 text-white bg-transparent hover:bg-white/5",
  ghost: "text-green-heading hover:bg-green-heading/5",
};

const sizes: Record<Size, string> = {
  md: "h-12 px-7 text-[15px]",
  sm: "h-11 px-5 text-sm", // still ≥ 44px tall
};

type CommonProps = { variant?: Variant; size?: Size; className?: string; children: ReactNode };

export function buttonClass({ variant = "gold", size = "md", className }: Omit<CommonProps, "children">) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({ variant, size, className, ...props }: CommonProps & ComponentProps<"button">) {
  return <button type="button" className={buttonClass({ variant, size, className })} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: CommonProps & ComponentProps<typeof Link>) {
  return <Link className={buttonClass({ variant, size, className })} {...props} />;
}

/** Round icon-only button. Always pass an aria-label. */
export function IconButton({
  className,
  ...props
}: ComponentProps<"button"> & { "aria-label": string }) {
  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex size-11 items-center justify-center rounded-full transition-transform active:scale-[0.98]",
        className,
      )}
      {...props}
    />
  );
}

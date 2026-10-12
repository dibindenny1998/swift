import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Eyebrow({ onDark, className, children }: { onDark?: boolean; className?: string; children: ReactNode }) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.2em]",
        onDark ? "text-gold-line" : "text-gold-ink",
        className,
      )}
    >
      {children}
    </p>
  );
}

const headingSizes = {
  1: "text-[44px] leading-[1.05]",
  2: "text-[30px] leading-[1.15] sm:text-[34px]",
  3: "text-[22px] leading-[1.25]",
} as const;

export function Heading({
  level = 2,
  onDark,
  className,
  ...props
}: ComponentProps<"h2"> & { level?: 1 | 2 | 3; onDark?: boolean }) {
  const Tag = `h${level}` as const;
  return (
    <Tag
      className={cn(
        "font-display font-medium tracking-[-0.01em] [&_em]:italic",
        headingSizes[level],
        onDark ? "text-white" : "text-green-heading",
        className,
      )}
      {...props}
    />
  );
}

/** Thin gold rule with a centred four-point star. */
export function StarDivider({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("flex items-center gap-3 text-gold-line", className)}>
      <span className="h-px flex-1 bg-current opacity-60" />
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 0 7.2 4.8 12 6 7.2 7.2 6 12 4.8 7.2 0 6 4.8 4.8Z" />
      </svg>
      <span className="h-px flex-1 bg-current opacity-60" />
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("font-display text-[26px] font-semibold leading-none tracking-tight", className)}>
      <span className="text-gold">swift</span>
      <em className="font-medium text-ivory">.in</em>
    </span>
  );
}

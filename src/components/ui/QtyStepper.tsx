"use client";

import { cn } from "@/lib/cn";

export function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  label = "Quantity",
  size = "md",
  className,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label?: string;
  size?: "md" | "sm";
  className?: string;
}) {
  const btn =
    "inline-flex items-center justify-center rounded-full text-green-heading transition-[transform,background-color] hover:bg-green-heading/5 active:scale-[0.92] disabled:opacity-30 disabled:pointer-events-none";
  const dim = size === "md" ? "size-11" : "size-9";
  return (
    <div role="group" aria-label={label} className={cn("inline-flex items-center rounded-full border border-border bg-white", className)}>
      <button type="button" className={cn(btn, dim)} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Decrease ${label.toLowerCase()}`}>
        <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M3 7h8" />
        </svg>
      </button>
      <output aria-live="polite" className="min-w-8 text-center text-[15px] font-semibold tabular-nums">
        {value}
      </output>
      <button type="button" className={cn(btn, dim)} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`Increase ${label.toLowerCase()}`}>
        <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M3 7h8M7 3v8" />
        </svg>
      </button>
    </div>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "sale" | "gold" | "green" | "neutral" | "on-dark";

const tones: Record<Tone, string> = {
  sale: "bg-red-sale text-white",
  gold: "border border-gold-line text-gold-ink bg-white/70",
  green: "bg-green-200 text-white",
  neutral: "bg-ivory border border-border text-muted",
  "on-dark": "border border-gold-line/50 text-gold-light bg-white/5",
};

export function Pill({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold leading-none tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

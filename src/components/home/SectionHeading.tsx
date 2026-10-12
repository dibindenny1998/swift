import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 px-1">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-ink">{eyebrow}</span>
        <h2 className="font-display text-[32px] font-medium leading-[1.1] text-green-heading">{title}</h2>
      </div>
      {action}
    </div>
  );
}

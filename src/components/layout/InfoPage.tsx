import type { ReactNode } from "react";

export const POLICY_UPDATED = "12 October 2026";

/** Shared layout for About, Contact, FAQ and policy pages — readable prose on ivory. */
export function InfoPage({ eyebrow, title, updated, intro, children }: { eyebrow: string; title: ReactNode; updated?: boolean; intro?: ReactNode; children: ReactNode }) {
  return (
    <article className="mx-auto w-full max-w-2xl px-4 pb-20 pt-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-ink">{eyebrow}</p>
      <h1 className="mt-2 font-display text-[34px] font-medium leading-[1.1] text-green-heading [&_em]:italic">{title}</h1>
      {updated && <p className="mt-2 text-xs text-muted">Last updated {POLICY_UPDATED}</p>}
      {intro && <div className="mt-4 text-[17px] leading-relaxed text-muted">{intro}</div>}
      <div
        className="mt-8 text-[15px] leading-relaxed text-text [&_a]:font-semibold [&_a]:text-green-300 [&_a]:underline-offset-4 hover:[&_a]:underline [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-[24px] [&_h2]:font-medium [&_h2]:text-green-heading [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-semibold [&_li]:mt-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mt-3 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5"
      >
        {children}
      </div>
    </article>
  );
}

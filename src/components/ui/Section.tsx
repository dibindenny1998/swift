import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Tone = "ivory" | "hero" | "giftbox" | "footer";

const tones: Record<Tone, string> = {
  ivory: "bg-ivory text-text",
  hero: "bg-grad-hero text-white",
  giftbox: "bg-grad-giftbox text-white",
  footer: "bg-grad-footer text-white",
};

/** Page section. `framed` adds the thin gold frame inset 12px (hero + gift box only). */
export function Section({
  tone = "ivory",
  framed,
  className,
  children,
  ...props
}: ComponentProps<"section"> & { tone?: Tone; framed?: boolean }) {
  return (
    <section className={cn("relative px-4 py-12 sm:px-6 sm:py-14", tones[tone], className)} {...props}>
      {framed && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-3 rounded-lg border border-gold-line/40"
        />
      )}
      <div className="relative mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

import Link from "next/link";
import { GiftBoxAnim } from "@/components/effects/GiftBox";
import { Reveal } from "@/components/effects/Reveal";
import { ProductImage } from "@/components/product/ProductImage";
import type { GiftBoxData } from "@/lib/catalog";
import { byoTier } from "@/lib/pricing";

const words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const word = (n: number) => words[n] ?? String(n);

export function GiftBoxSection({ giftBox }: { giftBox: GiftBoxData }) {
  if (!giftBox || giftBox.tiers.length === 0) return null;
  const [first, second] = giftBox.tiers;
  const filled = giftBox.samples.slice(0, 2);
  const { next, itemsToNext } = byoTier(giftBox.tiers, filled.length);

  return (
    <section id="giftbox" className="relative scroll-mt-16 bg-grad-giftbox px-6 py-14 text-ivory">
      <span aria-hidden className="pointer-events-none absolute inset-3 rounded-lg border border-gold-line/35" />
      <Reveal className="relative mx-auto flex max-w-md flex-col items-center gap-3.5 text-center">
        <GiftBoxAnim />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-line">Make it personal</span>
        <h2 className="font-display text-[34px] font-medium leading-[1.1]">
          Build your own
          <br />
          <em className="text-gold">gift box</em>
        </h2>
        <p className="max-w-[290px] text-[15px] leading-relaxed text-on-green-muted">
          Choose {word(first.minItems)} pieces for {first.percentOff}% off
          {second && (
            <>
              , or {word(second.minItems)} for {second.percentOff}% off
            </>
          )}
          . Tied in gold ribbon, with your handwritten note.
        </p>
        <div className="mt-2.5 grid w-full grid-cols-3 gap-2.5">
          {filled.map((s) => (
            <div key={s.title} className="relative aspect-square overflow-hidden rounded-sm bg-ivory">
              <ProductImage src={s.image} alt={s.title} fill sizes="120px" className="object-cover" />
            </div>
          ))}
          <Link
            href={`/gift-box`}
            aria-label="Add another item to your gift box"
            className="flex aspect-square items-center justify-center rounded-sm border border-dashed border-gold-line/80 text-[30px] font-light text-gold transition-[transform,background-color] hover:bg-white/5 active:scale-[0.98]"
          >
            +
          </Link>
        </div>
        {next && (
          <span className="mt-1 text-sm text-on-green-muted">
            Add {word(itemsToNext)} more to unlock {next.percentOff}% off
          </span>
        )}
        <Link
          href="/gift-box"
          className="mt-1.5 flex h-[54px] w-full items-center justify-center rounded-full bg-[image:var(--grad-gold-btn)] text-[15px] font-bold text-gold-on shadow-[inset_0_1px_0_rgba(255,255,255,.5)] transition-transform active:scale-[0.98]"
        >
          Start building
        </Link>
      </Reveal>
    </section>
  );
}

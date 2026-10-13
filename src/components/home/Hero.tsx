import Link from "next/link";
import { ArchArt } from "@/components/effects/ArchArt";
import { Countdown } from "@/components/effects/Countdown";
import { Bokeh, Garland } from "@/components/effects/Garland";
import { Santa } from "@/components/effects/Santa";
import { ProductImage } from "@/components/product/ProductImage";

export function Hero({ countdownEnd, showSanta, image, imageAlt = "" }: { countdownEnd: string; showSanta: boolean; image?: string; imageAlt?: string }) {
  return (
    <section className="relative overflow-hidden bg-grad-hero px-4 pb-12 pt-4 text-ivory">
      <span aria-hidden className="pointer-events-none absolute inset-3 rounded-lg border border-gold-line/40" />
      <Bokeh />
      <Garland />

      <div className="relative z-[3] mx-auto flex max-w-6xl flex-col items-center pt-[84px] text-center lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 lg:pb-8 lg:text-left">
        <div className="flex w-full flex-col items-center lg:items-start">
          <span className="fx-rise text-xs font-semibold tracking-[0.24em] text-gold-light">CHRISTMAS 2026</span>
          <div className="relative mt-24 w-full max-w-[358px] lg:max-w-none">
            {showSanta && <Santa className="bottom-[calc(100%-10px)] right-3.5 z-[4] lg:left-[150px] lg:right-auto" />}
            <h1 className="fx-rise font-display text-[44px] font-medium leading-[1.05] tracking-[-0.01em] [animation-delay:.1s] lg:text-[60px]">
              Christmas,
              <br />
              wrapped in <em className="text-gold-shimmer pr-1">gold</em>
            </h1>
          </div>
          <p className="fx-rise mt-4 max-w-[300px] text-base leading-relaxed text-on-red-muted [animation-delay:.2s] lg:max-w-[420px]">
            Heirloom trees, warm lights and gifts worth keeping — beautifully boxed, at your door before the big night.
          </p>

          <div className="fx-rise mt-7 hidden [animation-delay:.4s] lg:block">
            <Countdown target={countdownEnd} />
          </div>
          <div className="fx-rise mt-8 hidden w-full max-w-[360px] flex-col gap-4 [animation-delay:.5s] lg:flex lg:items-start">
            <HeroCtas />
          </div>
        </div>

        <div className="fx-rise mt-7 h-[360px] w-[290px] rounded-[145px_145px_24px_24px] border border-gold-line/70 p-2 [animation-delay:.3s] lg:mt-0 lg:h-[460px] lg:w-[370px] lg:justify-self-center">
          <div className="relative size-full overflow-hidden rounded-[137px_137px_16px_16px] lg:rounded-[177px_177px_16px_16px]">
            {image ? <ProductImage src={image} alt={imageAlt} fill priority sizes="(min-width: 1024px) 370px, 290px" className="object-cover" /> : <ArchArt />}
          </div>
        </div>

        <div className="fx-rise mt-7 [animation-delay:.4s] lg:hidden">
          <Countdown target={countdownEnd} />
        </div>
        <div className="fx-rise mt-[30px] flex w-full flex-col items-center gap-4 px-3 [animation-delay:.5s] lg:hidden">
          <HeroCtas />
        </div>
      </div>
    </section>
  );
}

function HeroCtas() {
  return (
    <>
      <Link
        href="#shop"
        className="flex h-[54px] w-full items-center justify-center rounded-full bg-[image:var(--grad-gold-btn)] text-[15px] font-bold tracking-[0.02em] text-gold-on shadow-[inset_0_1px_0_rgba(255,255,255,.5),0_10px_24px_-12px_rgba(0,0,0,.5)] transition-transform active:scale-[0.98]"
      >
        Shop the collection
      </Link>
      <Link
        href="#giftbox"
        className="flex min-h-11 items-center gap-2 border-b border-gold-line/60 text-[15px] font-semibold text-[#F4ECD8]"
      >
        Build a gift box <span aria-hidden>→</span>
      </Link>
    </>
  );
}

"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { ProductImage } from "./ProductImage";

/** Swipeable image gallery (scroll-snap) with dot navigation. */
export function Gallery({ images }: { images: { url: string; alt: string }[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-lg [scrollbar-width:none]"
        aria-roledescription="carousel"
        aria-label="Product images"
      >
        {images.map((img, i) => (
          <div
            key={img.url + i}
            className="relative aspect-[4/5] w-full flex-none snap-center bg-[#F1E9D6]"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${images.length}`}
          >
            <ProductImage src={img.url} alt={img.alt} fill priority={i === 0} sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index}
              className="flex size-6 items-center justify-center"
            >
              <span className={cn("block h-1.5 rounded-full bg-ivory transition-all", i === index ? "w-5" : "w-1.5 opacity-60")} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

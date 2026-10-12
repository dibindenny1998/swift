import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/components/effects/Reveal";
import { ProductImage } from "@/components/product/ProductImage";
import type { CategoryData } from "@/lib/catalog";
import { SectionHeading } from "./SectionHeading";

export function Categories({ categories }: { categories: CategoryData[] }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-2 pt-12">
      <Reveal>
        <SectionHeading eyebrow="Shop by category" title="Dress the house" />
      </Reveal>
      <RevealGroup className="mt-[22px] grid grid-cols-2 gap-3 md:auto-cols-fr md:grid-flow-col md:grid-cols-none">
        {categories.map((c) => (
          <RevealItem key={c.slug}>
            <Link
              href={`/shop?category=${c.slug}`}
              className="group flex flex-col gap-2.5 text-text transition-transform duration-150 active:scale-[0.98]"
            >
              <span className="relative block h-[170px] overflow-hidden rounded-sm md:h-[220px]">
                <ProductImage
                  src={c.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-calm group-hover:scale-[1.03]"
                />
              </span>
              <span className="text-[15px] font-semibold">
                {c.name} <span aria-hidden className="font-medium text-[#8A8373] transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}

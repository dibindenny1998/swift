import Link from "next/link";
import { HangingOrnament } from "@/components/effects/Symbols";
import { Reveal, RevealGroup, RevealItem } from "@/components/effects/Reveal";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductCardData } from "@/lib/catalog";
import { SectionHeading } from "./SectionHeading";

export function Bestsellers({ products, lowStockThreshold }: { products: ProductCardData[]; lowStockThreshold: number }) {
  return (
    <section id="shop" className="relative mx-auto w-full max-w-6xl scroll-mt-16 px-4 pb-14 pt-12">
      <HangingOrnament kind="red" thread={46} size={24} delay={-1} threadColor="#D9C48E" className="right-[30px] top-0" />
      <HangingOrnament kind="gold" thread={24} size={18} delay={-3.5} threadColor="#D9C48E" className="right-[70px] top-0" />
      <Reveal>
        <SectionHeading eyebrow="Most loved" title="Bestsellers" />
      </Reveal>
      <RevealGroup className="mt-[22px] grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-4">
        {products.map((p) => (
          <RevealItem key={p.id}>
            <ProductCard product={p} lowStockThreshold={lowStockThreshold} />
          </RevealItem>
        ))}
      </RevealGroup>
      <Reveal>
        <Link
          href="/shop"
          className="mx-auto mt-7 flex h-[52px] max-w-md items-center justify-center rounded-full border border-green-300 text-[15px] font-semibold text-green-300 transition-[transform,background-color] hover:bg-green-300/5 active:scale-[0.98]"
        >
          View all products
        </Link>
      </Reveal>
    </section>
  );
}

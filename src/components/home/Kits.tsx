import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/components/effects/Reveal";
import { BundleCard } from "@/components/product/BundleCard";
import type { BundleCardData } from "@/lib/catalog";
import { SectionHeading } from "./SectionHeading";

export function Kits({ bundles }: { bundles: BundleCardData[] }) {
  if (bundles.length === 0) return null;
  return (
    <section id="bundles" className="mx-auto w-full max-w-6xl pb-2 pt-12">
      <Reveal className="px-5">
        <SectionHeading
          eyebrow="Signature kits"
          title="Boxed & ready"
          action={
            <Link href="/bundles" className="flex min-h-11 items-center text-sm font-semibold text-green-300 hover:text-green-500">
              See all
            </Link>
          }
        />
      </Reveal>
      <RevealGroup className="mt-[22px] flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1 [scrollbar-width:none] md:grid md:grid-cols-3 md:overflow-visible">
        {bundles.map((b) => (
          <RevealItem key={b.id} className="flex snap-start md:[&>article]:w-full">
            <BundleCard bundle={b} />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}

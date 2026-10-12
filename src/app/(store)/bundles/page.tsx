import type { Metadata } from "next";
import Link from "next/link";
import { RevealGroup, RevealItem } from "@/components/effects/Reveal";
import { BundleCard } from "@/components/product/BundleCard";
import { getBundles, getGiftBoxBuilder } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Signature kits",
  description: "Boxed Christmas kits — tree, lights and ornaments together, for less.",
};

export default async function BundlesPage() {
  const [kits, giftBox] = await Promise.all([getBundles(), getGiftBoxBuilder()]);
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-ink">Signature kits</p>
      <h1 className="mt-2 font-display text-[34px] font-medium leading-[1.1] text-green-heading">Boxed &amp; ready</h1>
      <p className="mt-3 max-w-xl text-[15px] text-muted">Everything for a finished look in one box — and always for less than buying the pieces on their own.</p>

      <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kits.map((k) => (
          <RevealItem key={k.id} className="flex [&>article]:w-full">
            <BundleCard bundle={k} />
          </RevealItem>
        ))}
      </RevealGroup>

      {giftBox && (
        <Link
          href="/gift-box"
          className="mt-10 flex items-center justify-between gap-4 rounded-lg bg-grad-giftbox p-6 text-ivory transition-transform active:scale-[0.99]"
        >
          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-gold-line">Make it personal</span>
            <span className="mt-1 block font-display text-[24px]">
              Build your own <em className="text-gold">gift box</em>
            </span>
          </span>
          <span aria-hidden className="text-2xl text-gold">
            →
          </span>
        </Link>
      )}
    </div>
  );
}

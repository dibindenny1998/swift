import type { Metadata } from "next";
import { GiftBoxBuilder } from "@/components/giftbox/GiftBoxBuilder";
import { getGiftBoxBuilder } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Build your own gift box",
  description: "Pick your favourite pieces — the more you add, the more you save. Tied in gold ribbon with your note.",
};

export default async function GiftBoxPage() {
  const builder = await getGiftBoxBuilder();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-36 pt-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-ink">Make it personal</p>
      <h1 className="mt-2 font-display text-[34px] font-medium leading-[1.1] text-green-heading">
        Build your own <em className="text-gold-dark">gift box</em>
      </h1>
      {builder && builder.tiers.length > 0 && builder.options.length > 0 ? (
        <GiftBoxBuilder builder={builder} />
      ) : (
        <p className="mt-6 text-[15px] text-muted">The gift box builder opens soon.</p>
      )}
    </div>
  );
}

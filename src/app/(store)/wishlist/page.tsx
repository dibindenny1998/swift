import type { Metadata } from "next";
import { WishlistView } from "@/components/shop/WishlistView";
import { getSettings } from "@/lib/settings-server";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default async function WishlistPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-ink">Saved for later</p>
      <h1 className="mt-2 font-display text-[34px] font-medium leading-[1.1] text-green-heading">Your wishlist</h1>
      <WishlistView lowStockThreshold={settings.lowStockThreshold} />
    </div>
  );
}

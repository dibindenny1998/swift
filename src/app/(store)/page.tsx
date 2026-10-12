import { Bestsellers } from "@/components/home/Bestsellers";
import { Categories } from "@/components/home/Categories";
import { GiftBoxSection } from "@/components/home/GiftBoxSection";
import { Hero } from "@/components/home/Hero";
import { Kits } from "@/components/home/Kits";
import { Promises } from "@/components/home/Promises";
import { getFeaturedReview, getHomeData } from "@/lib/catalog";
import { getSettings } from "@/lib/settings-server";

export default async function HomePage() {
  const [settings, home, review] = await Promise.all([getSettings(), getHomeData(), getFeaturedReview()]);
  return (
    <>
      <Hero countdownEnd={settings.countdownEnd} showSanta={settings.effects.santa} />
      <Categories categories={home.categories} />
      <Kits bundles={home.bundles} />
      <Bestsellers products={home.bestsellers} lowStockThreshold={settings.lowStockThreshold} />
      <GiftBoxSection giftBox={home.giftBox} />
      <Promises
        review={review}
        lastOrderDate={settings.lastOrderDate}
        freeShippingThreshold={settings.freeShippingThreshold}
        codEnabled={settings.codEnabled}
      />
    </>
  );
}

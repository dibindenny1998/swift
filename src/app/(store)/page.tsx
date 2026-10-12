import type { Metadata } from "next";
import { Bestsellers } from "@/components/home/Bestsellers";
import { Categories } from "@/components/home/Categories";
import { GiftBoxSection } from "@/components/home/GiftBoxSection";
import { Hero } from "@/components/home/Hero";
import { Kits } from "@/components/home/Kits";
import { Promises } from "@/components/home/Promises";
import { getFeaturedReview, getHomeData } from "@/lib/catalog";
import { getSettings } from "@/lib/settings-server";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://swift.in";

export default async function HomePage() {
  const [settings, home, review] = await Promise.all([getSettings(), getHomeData(), getFeaturedReview()]);
  const sameAs = Object.values(settings.social).filter((u): u is string => Boolean(u));
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "OnlineStore",
      name: settings.businessName,
      url: SITE,
      logo: `${SITE}/opengraph-image`,
      email: settings.supportEmail,
      address: { "@type": "PostalAddress", streetAddress: settings.businessAddress, addressRegion: settings.businessState, addressCountry: "IN" },
      ...(sameAs.length ? { sameAs } : {}),
    },
    { "@context": "https://schema.org", "@type": "WebSite", name: "swift.in", url: SITE },
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
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

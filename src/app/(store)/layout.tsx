import { CartDrawer } from "@/components/cart/CartDrawer";
import { SvgSymbols } from "@/components/effects/Symbols";
import { Snow } from "@/components/effects/Snow";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { StickyCartBar } from "@/components/layout/StickyCartBar";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings-server";
import { cacheLife, cacheTag } from "next/cache";
import { CATALOG_TAG } from "@/lib/catalog";

async function getNavCategories() {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  const rows = await db.category.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map((c) => ({ href: `/shop?category=${c.slug}`, label: c.name }));
}

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const [settings, categories] = await Promise.all([getSettings(), getNavCategories()]);
  return (
    <>
      <SvgSymbols />
      <AnnouncementBar text={settings.announcement} lastOrderDate={settings.lastOrderDate} />
      <Header categories={categories} whatsapp={settings.whatsappNumber} />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer lastOrderDate={settings.lastOrderDate} showMascot={settings.effects.mascot} />
      <StickyCartBar />
      <CartDrawer />
      {settings.effects.snow && <Snow />}
    </>
  );
}

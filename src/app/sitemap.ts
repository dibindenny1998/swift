import type { MetadataRoute } from "next";
import { getBundleSlugs, getCategories, getLiveProductSlugs } from "@/lib/catalog";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://swift.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, bundles, categories] = await Promise.all([getLiveProductSlugs(), getBundleSlugs(), getCategories()]);
  const page = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly" = "weekly") => ({
    url: `${SITE}${path}`,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1, "daily"),
    page("/shop", 0.9, "daily"),
    page("/bundles", 0.8),
    page("/gift-box", 0.8),
    ...categories.map((c) => page(`/shop?category=${c.slug}`, 0.7)),
    ...products.map((slug) => page(`/products/${slug}`, 0.8)),
    ...bundles.map((slug) => page(`/bundles/${slug}`, 0.7)),
    ...["/about", "/contact", "/faq", "/shipping-policy", "/refund-policy", "/privacy-policy", "/terms"].map((p) => page(p, 0.3, "monthly")),
  ];
}

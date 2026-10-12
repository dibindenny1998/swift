import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";
import { bundlePrice } from "./pricing";

export const CATALOG_TAG = "catalog";

export type ProductCardData = {
  id: string;
  slug: string;
  title: string;
  image: string;
  badge: "NONE" | "NEW" | "BESTSELLER";
  price: number; // lowest variant price, paise
  mrp: number;
  stock: number; // total across variants
  defaultVariantId: string;
};

export type BundleCardData = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  price: number;
  compareAt: number;
};

export type CategoryData = { slug: string; name: string; image: string };

export type GiftBoxData = {
  slug: string;
  tiers: { minItems: number; percentOff: number }[];
  samples: { title: string; image: string }[];
} | null;

const FALLBACK_IMAGE = "/placeholders/gifts.svg";

export async function getHomeData() {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");

  const [categories, products, kits, byo] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
    db.product.findMany({
      where: { isLive: true },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, variants: { orderBy: { price: "asc" } } },
      orderBy: { createdAt: "asc" },
    }),
    db.bundle.findMany({
      where: { isLive: true, type: "FIXED" },
      include: { items: { include: { variant: true } } },
      orderBy: { createdAt: "asc" },
    }),
    db.bundle.findFirst({
      where: { isLive: true, type: "BUILD_YOUR_OWN" },
      include: {
        tiers: { orderBy: { minItems: "asc" } },
        items: { take: 2, include: { variant: { include: { product: { include: { images: { take: 1 } } } } } } },
      },
    }),
  ]);

  const cards: ProductCardData[] = products
    .filter((p) => p.variants.length > 0)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      image: p.images[0]?.url ?? FALLBACK_IMAGE,
      badge: p.badge,
      price: p.variants[0].price,
      mrp: p.variants[0].mrp,
      stock: p.variants.reduce((s, v) => s + v.stock, 0),
      defaultVariantId: p.variants[0].id,
    }));

  // Bestsellers first, then everything else in catalogue order.
  const bestsellers = [...cards].sort((a, b) => Number(b.badge === "BESTSELLER") - Number(a.badge === "BESTSELLER")).slice(0, 4);

  const bundles: BundleCardData[] = kits.map((k) => {
    const { price, compareAt } = bundlePrice(
      k.items.map((i) => ({ price: i.variant.price, qty: i.qty })),
      k.discountType,
      k.discountValue,
    );
    return {
      id: k.id,
      slug: k.slug,
      title: k.title,
      description: k.description,
      image: k.imageUrl ?? FALLBACK_IMAGE,
      price,
      compareAt,
    };
  });

  const giftBox: GiftBoxData = byo
    ? {
        slug: byo.slug,
        tiers: byo.tiers.map((t) => ({ minItems: t.minItems, percentOff: t.percentOff })),
        samples: byo.items.map((i) => ({
          title: i.variant.product.title,
          image: i.variant.product.images[0]?.url ?? FALLBACK_IMAGE,
        })),
      }
    : null;

  return {
    categories: categories.map((c) => ({ slug: c.slug, name: c.name, image: c.imageUrl ?? FALLBACK_IMAGE })),
    bestsellers,
    bundles,
    giftBox,
  };
}

/** One approved 5-star review to feature, or null. Never invent one (spec §9). */
export async function getFeaturedReview() {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  const review = await db.review.findFirst({
    where: { isApproved: true, rating: 5 },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });
  if (!review) return null;
  return { text: review.text, name: review.user.name ?? "A happy customer" };
}

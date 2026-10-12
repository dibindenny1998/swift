import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Prisma } from "@prisma/client";
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

// ── Phase 3: shop, product, bundles, gift box ─────────────────────────────

export type SortKey = "popular" | "price-asc" | "price-desc" | "new";
export const SORTS: { key: SortKey; label: string }[] = [
  { key: "popular", label: "Popular" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "new", label: "Newest" },
];

const productCardInclude = {
  images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
  variants: { orderBy: { price: "asc" as const } },
};

type ProductWithCardBits = Awaited<ReturnType<typeof findCardProducts>>[number];

function findCardProducts(where: object) {
  return db.product.findMany({ where: { isLive: true, ...where }, include: productCardInclude });
}

function toCard(p: ProductWithCardBits): ProductCardData | null {
  if (p.variants.length === 0) return null;
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    image: p.images[0]?.url ?? FALLBACK_IMAGE,
    badge: p.badge,
    price: p.variants[0].price,
    mrp: p.variants[0].mrp,
    stock: p.variants.reduce((s, v) => s + v.stock, 0),
    defaultVariantId: p.variants[0].id,
  };
}

/** Units sold per product from real, non-cancelled orders — drives "Popular" sorting. */
async function soldCounts(): Promise<Map<string, number>> {
  const rows = await db.orderItem.groupBy({
    by: ["variantId"],
    where: { variantId: { not: null }, order: { status: { notIn: ["PENDING", "CANCELLED"] } } },
    _sum: { qty: true },
  });
  if (rows.length === 0) return new Map();
  const variants = await db.variant.findMany({
    where: { id: { in: rows.map((r) => r.variantId!) } },
    select: { id: true, productId: true },
  });
  const productOf = new Map(variants.map((v) => [v.id, v.productId]));
  const sold = new Map<string, number>();
  for (const r of rows) {
    const pid = productOf.get(r.variantId!);
    if (pid) sold.set(pid, (sold.get(pid) ?? 0) + (r._sum.qty ?? 0));
  }
  return sold;
}

export async function getCategories(): Promise<CategoryData[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  const rows = await db.category.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map((c) => ({ slug: c.slug, name: c.name, image: c.imageUrl ?? FALLBACK_IMAGE }));
}

export async function getShopProducts(category: string | null, sort: SortKey): Promise<ProductCardData[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("minutes");
  const [rows, sold] = await Promise.all([
    findCardProducts(category ? { category: { slug: category } } : {}),
    sort === "popular" ? soldCounts() : Promise.resolve(new Map<string, number>()),
  ]);
  const created = new Map(rows.map((r) => [r.id, r.createdAt.getTime()]));
  const cards = rows.map(toCard).filter((c): c is ProductCardData => c !== null);
  const byNew = (a: ProductCardData, b: ProductCardData) => created.get(b.id)! - created.get(a.id)!;
  switch (sort) {
    case "price-asc":
      return cards.sort((a, b) => a.price - b.price);
    case "price-desc":
      return cards.sort((a, b) => b.price - a.price);
    case "new":
      return cards.sort(byNew);
    case "popular":
      return cards.sort(
        (a, b) =>
          (sold.get(b.id) ?? 0) - (sold.get(a.id) ?? 0) ||
          Number(b.badge === "BESTSELLER") - Number(a.badge === "BESTSELLER") ||
          created.get(a.id)! - created.get(b.id)!,
      );
  }
}

export async function getProductsByIds(ids: string[]): Promise<ProductCardData[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("minutes");
  const rows = await findCardProducts({ id: { in: ids } });
  const order = new Map(ids.map((id, i) => [id, i]));
  return rows
    .map(toCard)
    .filter((c): c is ProductCardData => c !== null)
    .sort((a, b) => order.get(a.id)! - order.get(b.id)!);
}

export async function getLiveProductSlugs(): Promise<string[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  const rows = await db.product.findMany({ where: { isLive: true }, select: { slug: true } });
  return rows.map((r) => r.slug);
}

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProduct>>>;

export async function getProduct(slug: string) {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("minutes");
  const p = await db.product.findFirst({
    where: { slug, isLive: true },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { price: "asc" } },
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });
  if (!p || p.variants.length === 0) return null;

  const variantIds = p.variants.map((v) => v.id);
  const [kits, related] = await Promise.all([
    db.bundle.findMany({
      where: { isLive: true, type: "FIXED", items: { some: { variantId: { in: variantIds } } } },
      include: { items: { include: { variant: true } } },
      take: 2,
    }),
    findCardProducts({ categoryId: p.categoryId, id: { not: p.id } }),
  ]);

  const ratings = p.reviews.map((r) => r.rating);
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    badge: p.badge,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    category: { slug: p.category.slug, name: p.category.name },
    images: p.images.length
      ? p.images.map((i) => ({ url: i.url, alt: i.alt || p.title }))
      : [{ url: FALLBACK_IMAGE, alt: p.title }],
    variants: p.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price,
      mrp: v.mrp,
      stock: v.stock,
      weightGrams: v.weightGrams,
    })),
    rating: ratings.length ? { average: ratings.reduce((a, b) => a + b, 0) / ratings.length, count: ratings.length } : null,
    reviews: p.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      text: r.text,
      name: r.user.name ?? "Verified buyer",
      photos: Array.isArray(r.photos) ? (r.photos as string[]) : [],
      reply: r.reply,
      date: r.createdAt.toISOString(),
    })),
    kits: kits.map((k) => toBundleCard(k)),
    related: related.map(toCard).filter((c): c is ProductCardData => c !== null).slice(0, 4),
  };
}

type BundleWithItems = Prisma.BundleGetPayload<{ include: { items: { include: { variant: true } } } }>;

function toBundleCard(k: BundleWithItems): BundleCardData {
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
}

export async function getBundles(): Promise<BundleCardData[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("minutes");
  const kits = await db.bundle.findMany({
    where: { isLive: true, type: "FIXED" },
    include: { items: { include: { variant: true } } },
    orderBy: { createdAt: "asc" },
  });
  return kits.map(toBundleCard);
}

export async function getBundleSlugs(): Promise<string[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  const rows = await db.bundle.findMany({ where: { isLive: true, type: "FIXED" }, select: { slug: true } });
  return rows.map((r) => r.slug);
}

export async function getBundle(slug: string) {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("minutes");
  const k = await db.bundle.findFirst({
    where: { slug, isLive: true, type: "FIXED" },
    include: {
      items: {
        include: { variant: { include: { product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } } } } },
      },
    },
  });
  if (!k) return null;
  return {
    ...toBundleCard(k),
    // A kit is only available while every piece in it is in stock.
    inStock: k.items.every((i) => i.variant.stock >= i.qty),
    items: k.items.map((i) => ({
      qty: i.qty,
      variantName: i.variant.name,
      price: i.variant.price,
      title: i.variant.product.title,
      slug: i.variant.product.slug,
      image: i.variant.product.images[0]?.url ?? FALLBACK_IMAGE,
    })),
  };
}

export type GiftBoxBuilderData = NonNullable<Awaited<ReturnType<typeof getGiftBoxBuilder>>>;

export async function getGiftBoxBuilder() {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("minutes");
  const b = await db.bundle.findFirst({
    where: { isLive: true, type: "BUILD_YOUR_OWN" },
    include: {
      tiers: { orderBy: { minItems: "asc" } },
      items: {
        include: { variant: { include: { product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } } } } },
      },
    },
  });
  if (!b) return null;
  return {
    id: b.id,
    slug: b.slug,
    title: b.title,
    description: b.description,
    tiers: b.tiers.map((t) => ({ minItems: t.minItems, percentOff: t.percentOff })),
    options: b.items
      .filter((i) => i.variant.product.isLive)
      .map((i) => ({
        variantId: i.variant.id,
        title: i.variant.product.title,
        variantName: i.variant.name,
        price: i.variant.price,
        stock: i.variant.stock,
        image: i.variant.product.images[0]?.url ?? FALLBACK_IMAGE,
      })),
  };
}

// Seeds an admin, 4 categories, 10 sample products (placeholder prices) and 3 bundles (2 fixed kits + build-your-own).
// Safe to re-run: everything is upserted by a stable key.
import { PrismaClient, type Badge } from "@prisma/client";
import bcrypt from "bcryptjs";
import { defaultSettings } from "../src/lib/settings";

const db = new PrismaClient();
const r = (rupees: number) => rupees * 100;

const categories = [
  { name: "Trees", slug: "trees", sortOrder: 1 },
  { name: "Lights", slug: "lights", sortOrder: 2 },
  { name: "Ornaments", slug: "ornaments", sortOrder: 3 },
  { name: "Gifts", slug: "gifts", sortOrder: 4 },
];

type SeedProduct = {
  slug: string;
  title: string;
  category: string;
  badge?: Badge;
  description: string;
  variants: { name: string; sku: string; price: number; mrp: number; stock: number; weightGrams?: number }[];
};

const products: SeedProduct[] = [
  {
    slug: "nordic-pine-tree",
    title: "Nordic Pine Tree",
    category: "trees",
    badge: "BESTSELLER",
    description: "Full, layered tips with a natural two-tone green. Hinged branches, sturdy metal stand.",
    variants: [
      { name: "4 ft", sku: "TRE-NP-4", price: r(3499), mrp: r(4299), stock: 18, weightGrams: 4000 },
      { name: "5 ft", sku: "TRE-NP-5", price: r(4999), mrp: r(5999), stock: 12, weightGrams: 5500 },
      { name: "6 ft", sku: "TRE-NP-6", price: r(6999), mrp: r(8499), stock: 4, weightGrams: 7000 },
    ],
  },
  {
    slug: "frosted-fir-tree",
    title: "Frosted Fir Tree",
    category: "trees",
    badge: "NEW",
    description: "Snow-dusted tips that catch warm light beautifully.",
    variants: [
      { name: "5 ft", sku: "TRE-FF-5", price: r(5499), mrp: r(6499), stock: 10, weightGrams: 5500 },
      { name: "6 ft", sku: "TRE-FF-6", price: r(7499), mrp: r(8999), stock: 8, weightGrams: 7000 },
    ],
  },
  {
    slug: "warm-fairy-lights",
    title: "Warm Fairy Lights, 10 m",
    category: "lights",
    badge: "BESTSELLER",
    description: "100 warm-white micro LEDs on soft copper wire. 8 modes, plug-in.",
    variants: [{ name: "10 m", sku: "LGT-FL-10", price: r(799), mrp: r(999), stock: 60, weightGrams: 300 }],
  },
  {
    slug: "gold-curtain-lights",
    title: "Gold Curtain Lights",
    category: "lights",
    description: "A shimmering curtain of golden light for windows and walls.",
    variants: [{ name: "3 × 2 m", sku: "LGT-CU-32", price: r(1299), mrp: r(1599), stock: 25, weightGrams: 600 }],
  },
  {
    slug: "star-tree-topper",
    title: "Gold Star Tree Topper",
    category: "ornaments",
    badge: "NEW",
    description: "Hand-finished gold star with a soft LED glow.",
    variants: [{ name: "One size", sku: "ORN-ST-1", price: r(899), mrp: r(1099), stock: 3, weightGrams: 250 }],
  },
  {
    slug: "royal-bauble-set",
    title: "Royal Bauble Set",
    category: "ornaments",
    badge: "BESTSELLER",
    description: "Shatterproof baubles in royal red, emerald and gold. Matte, gloss and glitter finishes.",
    variants: [
      { name: "12 pieces", sku: "ORN-BB-12", price: r(699), mrp: r(899), stock: 40, weightGrams: 400 },
      { name: "24 pieces", sku: "ORN-BB-24", price: r(1199), mrp: r(1499), stock: 22, weightGrams: 750 },
    ],
  },
  {
    slug: "velvet-bow-pack",
    title: "Velvet Bow Pack",
    category: "ornaments",
    description: "Six deep-red velvet bows with gold wired edges.",
    variants: [{ name: "6 bows", sku: "ORN-VB-6", price: r(499), mrp: r(599), stock: 35, weightGrams: 200 }],
  },
  {
    slug: "plaid-tree-skirt",
    title: "Plaid Tree Skirt",
    category: "gifts",
    description: "Soft red-and-cream plaid with a faux-fur border.",
    variants: [{ name: "120 cm", sku: "GFT-TS-120", price: r(1099), mrp: r(1399), stock: 15, weightGrams: 700 }],
  },
  {
    slug: "cinnamon-candle",
    title: "Cinnamon & Pine Candle",
    category: "gifts",
    badge: "NEW",
    description: "Soy wax in a gold-lidded glass jar. Around 40 hours of burn time.",
    variants: [{ name: "200 g", sku: "GFT-CC-200", price: r(649), mrp: r(799), stock: 30, weightGrams: 450 }],
  },
  {
    slug: "christmas-stocking",
    title: "Embroidered Stocking",
    category: "gifts",
    description: "Velvet stocking with gold embroidery. Add a name at checkout.",
    variants: [{ name: "One size", sku: "GFT-SK-1", price: r(549), mrp: r(699), stock: 50, weightGrams: 180 }],
  },
];

async function main() {
  // Hosted deploys run this on every build; only seed a brand-new, empty database.
  if (process.env.SEED_ONLY_IF_EMPTY === "true" && (await db.category.count()) > 0) {
    console.log("database already has data — skipping seed");
    return;
  }
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (email && password) {
    const passwordHash = await bcrypt.hash(password, 12);
    await db.user.upsert({
      where: { email },
      update: { role: "ADMIN", passwordHash },
      create: { email, name: "swift.in admin", role: "ADMIN", passwordHash },
    });
    console.log(`admin: ${email}`);
  } else {
    console.warn("ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD not set — skipping admin user");
  }

  const categoryIds: Record<string, string> = {};
  for (const c of categories) {
    const row = await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, sortOrder: c.sortOrder },
      create: { ...c, imageUrl: `/placeholders/${c.slug}.svg` },
    });
    categoryIds[c.slug] = row.id;
  }

  const variantIds: Record<string, string> = {};
  for (const p of products) {
    const data = {
      title: p.title,
      description: p.description,
      badge: p.badge ?? "NONE",
      categoryId: categoryIds[p.category],
    };
    const product = await db.product.upsert({ where: { slug: p.slug }, update: data, create: { slug: p.slug, ...data } });
    await db.productImage.deleteMany({ where: { productId: product.id } });
    await db.productImage.create({
      data: { productId: product.id, url: `/placeholders/${p.category}.svg`, alt: p.title, sortOrder: 0 },
    });
    for (const v of p.variants) {
      const row = await db.variant.upsert({
        where: { sku: v.sku },
        update: { ...v, productId: product.id },
        create: { ...v, productId: product.id },
      });
      variantIds[v.sku] = row.id;
    }
  }

  // Fixed kit: tree + lights + baubles + topper at 15% off.
  const kit = await db.bundle.upsert({
    where: { slug: "the-classic-kit" },
    update: {},
    create: {
      slug: "the-classic-kit",
      title: "The Classic Kit",
      description: "5 ft tree · fairy lights · 12 baubles · gold star",
      type: "FIXED",
      discountType: "PERCENT",
      discountValue: 15,
      imageUrl: "/placeholders/trees.svg",
    },
  });
  await db.bundleItem.deleteMany({ where: { bundleId: kit.id } });
  await db.bundleItem.createMany({
    data: ["TRE-NP-5", "LGT-FL-10", "ORN-BB-12", "ORN-ST-1"].map((sku) => ({
      bundleId: kit.id,
      variantId: variantIds[sku],
      qty: 1,
    })),
  });

  // Second fixed kit: flat ₹300 off.
  const cosy = await db.bundle.upsert({
    where: { slug: "the-cosy-corner-kit" },
    update: {},
    create: {
      slug: "the-cosy-corner-kit",
      title: "The Cosy Corner Kit",
      description: "Gold curtain lights · cinnamon candle · velvet stocking",
      type: "FIXED",
      discountType: "FLAT",
      discountValue: r(300),
      imageUrl: "/placeholders/lights.svg",
    },
  });
  await db.bundleItem.deleteMany({ where: { bundleId: cosy.id } });
  await db.bundleItem.createMany({
    data: ["LGT-CU-32", "GFT-CC-200", "GFT-SK-1"].map((sku) => ({ bundleId: cosy.id, variantId: variantIds[sku], qty: 1 })),
  });

  // Build-your-own gift box: 3 items → 10%, 5 items → 15%.
  const byo = await db.bundle.upsert({
    where: { slug: "build-your-own-gift-box" },
    update: {},
    create: {
      slug: "build-your-own-gift-box",
      title: "Build Your Own Gift Box",
      description: "Pick your favourites — the more you add, the more you save.",
      type: "BUILD_YOUR_OWN",
      imageUrl: "/placeholders/gifts.svg",
    },
  });
  await db.bYOTier.deleteMany({ where: { bundleId: byo.id } });
  await db.bYOTier.createMany({
    data: [
      { bundleId: byo.id, minItems: 3, percentOff: 10 },
      { bundleId: byo.id, minItems: 5, percentOff: 15 },
    ],
  });
  // Eligible items for BYO are the small gift-able variants.
  await db.bundleItem.deleteMany({ where: { bundleId: byo.id } });
  await db.bundleItem.createMany({
    data: ["LGT-FL-10", "ORN-BB-12", "ORN-ST-1", "ORN-VB-6", "GFT-CC-200", "GFT-SK-1"].map((sku) => ({
      bundleId: byo.id,
      variantId: variantIds[sku],
      qty: 1,
    })),
  });

  // Sample coupons (edit or disable in admin).
  const coupons = [
    { code: "MERRY10", type: "PERCENT" as const, value: 10, minOrder: r(999), firstOrderOnly: false },
    { code: "WELCOME200", type: "FLAT" as const, value: r(200), minOrder: r(1499), firstOrderOnly: true },
  ];
  for (const c of coupons) {
    await db.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: { ...c, perUserLimit: 1, endsAt: new Date("2026-12-31T23:59:59+05:30") },
    });
  }

  // Settings: only insert missing keys so admin edits are never overwritten by a re-seed.
  for (const [key, value] of Object.entries(defaultSettings)) {
    await db.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  console.log(`seeded ${categories.length} categories, ${products.length} products, 3 bundles`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

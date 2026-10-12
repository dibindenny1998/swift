import "server-only";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "./db";

const slug = z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes");
const imageUrl = z
  .string()
  .trim()
  .max(500)
  .refine((u) => u.startsWith("/") || /^https:\/\//.test(u), "Images must be https:// or an uploaded file");

export const variantInput = z
  .object({
    id: z.string().optional(),
    name: z.string().trim().min(1, "Variant name is required").max(60),
    sku: z.string().trim().min(2, "SKU is required").max(40).regex(/^[A-Za-z0-9._-]+$/, "SKU: letters, numbers, . _ -"),
    price: z.number().int().min(100, "Price must be at least ₹1"),
    mrp: z.number().int().min(100),
    stock: z.number().int().min(0).max(100000),
    weightGrams: z.number().int().min(1).max(50000),
  })
  .refine((v) => v.mrp >= v.price, { message: "MRP can't be lower than the price", path: ["mrp"] });

export const productInput = z.object({
  title: z.string().trim().min(2, "Title is required").max(120),
  slug,
  description: z.string().max(5000).default(""),
  categoryId: z.string().min(1, "Choose a category"),
  badge: z.enum(["NONE", "NEW", "BESTSELLER"]),
  isLive: z.boolean(),
  seoTitle: z.string().trim().max(70).nullable().optional(),
  seoDescription: z.string().trim().max(170).nullable().optional(),
  images: z.array(z.object({ url: imageUrl, alt: z.string().max(140).default("") })).max(12),
  variants: z.array(variantInput).min(1, "Add at least one variant").max(30),
});
export type ProductInput = z.infer<typeof productInput>;

export function uniqueError(e: unknown): string | null {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    const target = String((e.meta as { target?: string[] | string })?.target ?? "");
    if (target.includes("sku")) return "That SKU is already used by another product";
    if (target.includes("slug")) return "That URL slug is already taken";
    if (target.includes("code")) return "That code already exists";
    return "That value must be unique";
  }
  return null;
}

/** Create or fully replace a product's fields, images and variants. */
export async function saveProduct(id: string | null, input: ProductInput) {
  const dupSku = input.variants.map((v) => v.sku.toUpperCase()).find((s, i, a) => a.indexOf(s) !== i);
  if (dupSku) throw new Error(`SKU ${dupSku} is used twice`);

  return db.$transaction(async (tx) => {
    const data = {
      title: input.title,
      slug: input.slug,
      description: input.description,
      categoryId: input.categoryId,
      badge: input.badge,
      isLive: input.isLive,
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
    };
    const product = id ? await tx.product.update({ where: { id }, data }) : await tx.product.create({ data });

    await tx.productImage.deleteMany({ where: { productId: product.id } });
    if (input.images.length) {
      await tx.productImage.createMany({
        data: input.images.map((img, i) => ({ productId: product.id, url: img.url, alt: img.alt || input.title, sortOrder: i })),
      });
    }

    const keep = input.variants.filter((v) => v.id).map((v) => v.id!);
    await tx.variant.deleteMany({ where: { productId: product.id, id: { notIn: keep } } });
    for (const v of input.variants) {
      const vd = { name: v.name, sku: v.sku, price: v.price, mrp: v.mrp, stock: v.stock, weightGrams: v.weightGrams };
      if (v.id) await tx.variant.update({ where: { id: v.id, productId: product.id }, data: vd });
      else await tx.variant.create({ data: { ...vd, productId: product.id } });
    }
    return product;
  });
}

import "server-only";
import { z } from "zod";
import { db } from "./db";

export const bundleInput = z
  .object({
    title: z.string().trim().min(2, "Title is required").max(80),
    slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes"),
    description: z.string().max(300).default(""),
    type: z.enum(["FIXED", "BUILD_YOUR_OWN"]),
    discountType: z.enum(["PERCENT", "FLAT", "FIXED_PRICE"]),
    discountValue: z.number().int().min(0),
    isLive: z.boolean(),
    imageUrl: z.string().max(500).nullable(),
    items: z.array(z.object({ variantId: z.string().min(1), qty: z.number().int().min(1).max(20) })).max(60),
    tiers: z.array(z.object({ minItems: z.number().int().min(2).max(20), percentOff: z.number().int().min(1).max(90) })).max(6),
  })
  .superRefine((b, ctx) => {
    if (b.type === "FIXED" && b.items.length < 2) ctx.addIssue({ code: "custom", message: "A kit needs at least two items", path: ["items"] });
    if (b.type === "FIXED" && b.discountType === "PERCENT" && b.discountValue > 90) ctx.addIssue({ code: "custom", message: "Percent off must be 90 or less", path: ["discountValue"] });
    if (b.type === "BUILD_YOUR_OWN" && b.items.length < 2) ctx.addIssue({ code: "custom", message: "Choose at least two eligible pieces", path: ["items"] });
    if (b.type === "BUILD_YOUR_OWN" && b.tiers.length === 0) ctx.addIssue({ code: "custom", message: "Add at least one discount tier", path: ["tiers"] });
    if (new Set(b.tiers.map((t) => t.minItems)).size !== b.tiers.length) ctx.addIssue({ code: "custom", message: "Two tiers have the same item count", path: ["tiers"] });
    if (new Set(b.items.map((i) => i.variantId)).size !== b.items.length) ctx.addIssue({ code: "custom", message: "An item is listed twice", path: ["items"] });
  });
export type BundleInput = z.infer<typeof bundleInput>;

export async function saveBundle(id: string | null, b: BundleInput) {
  return db.$transaction(async (tx) => {
    const data = {
      title: b.title,
      slug: b.slug,
      description: b.description,
      type: b.type,
      discountType: b.type === "FIXED" ? b.discountType : "PERCENT",
      discountValue: b.type === "FIXED" ? b.discountValue : 0,
      isLive: b.isLive,
      imageUrl: b.imageUrl || null,
    } as const;
    const bundle = id ? await tx.bundle.update({ where: { id }, data }) : await tx.bundle.create({ data });
    await tx.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
    await tx.bundleItem.createMany({ data: b.items.map((i) => ({ bundleId: bundle.id, variantId: i.variantId, qty: b.type === "FIXED" ? i.qty : 1 })) });
    await tx.bYOTier.deleteMany({ where: { bundleId: bundle.id } });
    if (b.type === "BUILD_YOUR_OWN") await tx.bYOTier.createMany({ data: b.tiers.map((t) => ({ bundleId: bundle.id, ...t })) });
    return bundle;
  });
}

export const couponInput = z
  .object({
    code: z
      .string()
      .trim()
      .min(3)
      .max(32)
      .regex(/^[A-Za-z0-9_-]+$/, "Code: letters, numbers, - and _")
      .transform((s) => s.toUpperCase()),
    type: z.enum(["PERCENT", "FLAT"]),
    value: z.number().int().min(1),
    minOrder: z.number().int().min(0),
    firstOrderOnly: z.boolean(),
    scope: z.object({ productIds: z.array(z.string()).max(200), bundleIds: z.array(z.string()).max(50) }).nullable(),
    usageLimit: z.number().int().min(1).nullable(),
    perUserLimit: z.number().int().min(1).nullable(),
    startsAt: z.coerce.date().nullable(),
    endsAt: z.coerce.date().nullable(),
    isActive: z.boolean(),
  })
  .refine((c) => c.type !== "PERCENT" || c.value <= 90, { message: "Percent off must be 90 or less", path: ["value"] })
  .refine((c) => !c.startsAt || !c.endsAt || c.endsAt > c.startsAt, { message: "End date must be after the start date", path: ["endsAt"] });

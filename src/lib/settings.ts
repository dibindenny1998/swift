import { z } from "zod";

// Site settings live in the Setting table (key → JSON) so admin edits go live without a redeploy.
export const settingsSchema = z.object({
  announcement: z.string().default("Complimentary gold gift wrap ✦ Free shipping over ₹999"),
  countdownEnd: z.string().default("2026-12-24T00:00"), // IST wall-clock
  lastOrderDate: z.string().default("2026-12-18"), // IST date
  lowStockThreshold: z.number().int().min(0).default(5),
  freeShippingThreshold: z.number().int().min(0).default(99900), // paise
  shippingFee: z.number().int().min(0).default(7900), // paise
  codEnabled: z.boolean().default(true),
  codFee: z.number().int().min(0).default(4900), // paise
  giftWrapPrice: z.number().int().min(0).default(0), // paise — complimentary by default
  effects: z
    .object({ snow: z.boolean(), santa: z.boolean(), mascot: z.boolean() })
    .default({ snow: true, santa: true, mascot: true }),
  social: z
    .object({ instagram: z.string(), facebook: z.string(), youtube: z.string() })
    .partial()
    .default({}),
  whatsappNumber: z.string().default(""),
  gstin: z.string().default(""),
});

export type SiteSettings = z.infer<typeof settingsSchema>;

export const defaultSettings: SiteSettings = settingsSchema.parse({});

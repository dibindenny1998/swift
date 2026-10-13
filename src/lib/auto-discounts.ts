import { z } from "zod";
import { formatINR } from "./money";

export const autoDiscountInput = z
  .object({
    name: z.string().trim().min(3, "Give the offer a name customers will see").max(80),
    type: z.enum(["PERCENT", "FLAT", "BUY_X_GET_Y", "FREE_SHIPPING"]),
    value: z.number().int().min(0),
    buyQty: z.number().int().min(0).max(20),
    getQty: z.number().int().min(0).max(20),
    minQty: z.number().int().min(0).max(100),
    minAmount: z.number().int().min(0),
    scope: z.object({ productIds: z.array(z.string()).max(200), categoryIds: z.array(z.string()).max(50), bundleIds: z.array(z.string()).max(50) }).nullable(),
    startsAt: z.coerce.date().nullable(),
    endsAt: z.coerce.date().nullable(),
    isActive: z.boolean(),
  })
  .refine((d) => d.type !== "PERCENT" || (d.value >= 1 && d.value <= 90), { message: "Percent off must be between 1 and 90", path: ["value"] })
  .refine((d) => d.type !== "FLAT" || d.value >= 100, { message: "Enter the amount off", path: ["value"] })
  .refine((d) => d.type !== "BUY_X_GET_Y" || (d.buyQty >= 1 && d.getQty >= 1 && d.value >= 1 && d.value <= 100), {
    message: "Set how many to buy, how many they get, and the % off those (100 = free)",
    path: ["buyQty"],
  })
  .refine((d) => !d.startsAt || !d.endsAt || d.endsAt > d.startsAt, { message: "End date must be after the start date", path: ["endsAt"] });

export type AutoDiscountShape = { type: "PERCENT" | "FLAT" | "BUY_X_GET_Y" | "FREE_SHIPPING"; value: number; buyQty: number; getQty: number; minQty: number; minAmount: number };

/** "Buy 2, get 1 free · on 3 categories", for lists and the editor preview. */
export function describeOffer(d: AutoDiscountShape, scopeCount = 0) {
  const what =
    d.type === "PERCENT"
      ? `${d.value}% off`
      : d.type === "FLAT"
        ? `${formatINR(d.value)} off`
        : d.type === "FREE_SHIPPING"
          ? "Free shipping"
          : `Buy ${d.buyQty}, get ${d.getQty} ${d.value >= 100 ? "free" : `at ${d.value}% off`}`;
  const when = [d.minQty ? `${d.minQty}+ items` : null, d.minAmount ? `over ${formatINR(d.minAmount)}` : null].filter(Boolean).join(", ");
  return [what, when && `when ${when}`, scopeCount ? "on selected items" : null].filter(Boolean).join(" · ");
}

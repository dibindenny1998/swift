import type { DiscountType } from "@prisma/client";

export type BundleLine = { price: number; qty: number };

/** Customer price for a fixed kit, in paise. Never below zero, never above the item total. */
export function bundlePrice(
  lines: BundleLine[],
  discountType: DiscountType,
  discountValue: number,
): { price: number; compareAt: number } {
  const compareAt = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  let price: number;
  switch (discountType) {
    case "PERCENT":
      // Whole rupees — a % discount should never produce a ₹6,286.60 price tag.
      price = Math.round((compareAt * (1 - discountValue / 100)) / 100) * 100;
      break;
    case "FLAT":
      price = compareAt - discountValue;
      break;
    case "FIXED_PRICE":
      price = discountValue;
      break;
  }
  return { price: Math.max(0, Math.min(price, compareAt)), compareAt };
}

export type Tier = { minItems: number; percentOff: number };

/** Best build-your-own tier unlocked for an item count, and the next one to aim for. */
export function byoTier(tiers: Tier[], count: number) {
  const sorted = [...tiers].sort((a, b) => a.minItems - b.minItems);
  const current = sorted.filter((t) => count >= t.minItems).at(-1) ?? null;
  const next = sorted.find((t) => count < t.minItems) ?? null;
  return { current, next, itemsToNext: next ? next.minItems - count : 0 };
}

/** Rough delivery window by distance when live courier data isn't available.
    Indian pincodes: first digit = postal region, first two = sub-region. */
export function estimateDelivery(pickup: string, delivery: string): { minDays: number; maxDays: number } {
  if (pickup.slice(0, 3) === delivery.slice(0, 3)) return { minDays: 1, maxDays: 2 };
  if (pickup.slice(0, 2) === delivery.slice(0, 2)) return { minDays: 2, maxDays: 3 };
  if (pickup[0] === delivery[0]) return { minDays: 3, maxDays: 5 };
  // North-east (78, 79) and J&K/Ladakh (18, 19) take longer.
  if (/^(78|79|18|19|744)/.test(delivery)) return { minDays: 6, maxDays: 9 };
  return { minDays: 4, maxDays: 7 };
}

export const PINCODE_RE = /^[1-9]\d{5}$/;

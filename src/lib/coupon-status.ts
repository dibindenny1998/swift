export type CouponStatus = "active" | "scheduled" | "expired" | "disabled" | "used up";

export function couponStatus(
  c: { isActive: boolean; startsAt: Date | null; endsAt: Date | null; usageLimit: number | null },
  uses: number,
  now = new Date(),
): CouponStatus {
  if (!c.isActive) return "disabled";
  if (c.endsAt && now > c.endsAt) return "expired";
  if (c.usageLimit !== null && uses >= c.usageLimit) return "used up";
  if (c.startsAt && now < c.startsAt) return "scheduled";
  return "active";
}

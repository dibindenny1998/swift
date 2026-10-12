import { describe, expect, it } from "vitest";
import { formatINR, percentOff, rupees } from "@/lib/money";
import { bundlePrice, byoTier } from "@/lib/pricing";
import { countdown, istDate } from "@/lib/ist";

describe("formatINR", () => {
  it("uses Indian digit grouping", () => {
    expect(formatINR(rupees(124999))).toBe("₹1,24,999");
    expect(formatINR(rupees(999))).toBe("₹999");
  });
  it("shows paise only when present", () => {
    expect(formatINR(12345)).toBe("₹123.45");
  });
});

describe("percentOff", () => {
  it("floors and guards bad input", () => {
    expect(percentOff(85000, 100000)).toBe(15);
    expect(percentOff(100000, 100000)).toBe(0);
    expect(percentOff(100, 0)).toBe(0);
  });
});

describe("bundlePrice", () => {
  const lines = [
    { price: 100000, qty: 1 },
    { price: 50000, qty: 2 },
  ];
  it("applies each discount type", () => {
    expect(bundlePrice(lines, "PERCENT", 15)).toEqual({ price: 170000, compareAt: 200000 });
    expect(bundlePrice(lines, "FLAT", 30000).price).toBe(170000);
    expect(bundlePrice(lines, "FIXED_PRICE", 149900).price).toBe(149900);
  });
  it("clamps to [0, compareAt]", () => {
    expect(bundlePrice(lines, "FLAT", 999999).price).toBe(0);
    expect(bundlePrice(lines, "FIXED_PRICE", 999999).price).toBe(200000);
  });
});

describe("byoTier", () => {
  const tiers = [
    { minItems: 5, percentOff: 15 },
    { minItems: 3, percentOff: 10 },
  ];
  it("finds current and next tier", () => {
    expect(byoTier(tiers, 2)).toEqual({ current: null, next: tiers[1], itemsToNext: 1 });
    expect(byoTier(tiers, 4).current).toEqual(tiers[1]);
    expect(byoTier(tiers, 6)).toEqual({ current: tiers[0], next: null, itemsToNext: 0 });
  });
});

describe("IST countdown", () => {
  it("targets midnight IST, i.e. 18:30 UTC the day before", () => {
    expect(istDate("2026-12-24").toISOString()).toBe("2026-12-23T18:30:00.000Z");
  });
  it("splits into d/h/m/s and stops at zero", () => {
    const target = istDate("2026-12-24");
    const now = new Date(target.getTime() - (86400 + 3600 + 60 + 1) * 1000);
    expect(countdown(target, now)).toEqual({ days: 1, hours: 1, mins: 1, secs: 1, done: false });
    expect(countdown(target, new Date(target.getTime() + 5000)).done).toBe(true);
  });
});

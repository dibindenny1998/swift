import { describe, expect, it } from "vitest";
import { cartTotals, evaluateCoupon, type CouponRule, type PricedLine } from "@/lib/cart-pricing";

const lines: PricedLine[] = [
  { lineTotal: 349900, productIds: ["tree"], bundleId: null },
  { lineTotal: 79900, productIds: ["lights"], bundleId: null },
];
const base: CouponRule = {
  code: "MERRY10",
  type: "PERCENT",
  value: 10,
  minOrder: 0,
  firstOrderOnly: false,
  scope: null,
  usageLimit: null,
  perUserLimit: null,
  startsAt: null,
  endsAt: null,
  isActive: true,
};
const ctx = { now: new Date("2026-11-20T10:00:00Z"), userId: "u1", usesTotal: 0, usesByUser: 0, priorOrders: 0 };

describe("evaluateCoupon", () => {
  it("applies a percentage to the whole cart, rounded to rupees", () => {
    expect(evaluateCoupon(base, lines, ctx)).toEqual({ ok: true, discount: 43000, description: "10% off" });
  });
  it("caps flat discounts at the eligible amount", () => {
    const r = evaluateCoupon({ ...base, type: "FLAT", value: 100000, scope: { productIds: ["lights"] } }, lines, ctx);
    expect(r).toMatchObject({ ok: true, discount: 79900 });
  });
  it("only discounts scoped items", () => {
    const r = evaluateCoupon({ ...base, scope: { productIds: ["lights"] } }, lines, ctx);
    expect(r).toMatchObject({ ok: true, discount: 8000 });
  });
  it("enforces dates, limits, minimum and first-order rules", () => {
    expect(evaluateCoupon({ ...base, endsAt: new Date("2026-11-01") }, lines, ctx)).toMatchObject({ ok: false, reason: "This code has expired" });
    expect(evaluateCoupon({ ...base, startsAt: new Date("2026-12-01") }, lines, ctx)).toMatchObject({ ok: false });
    expect(evaluateCoupon({ ...base, usageLimit: 5 }, lines, { ...ctx, usesTotal: 5 })).toMatchObject({ ok: false });
    expect(evaluateCoupon({ ...base, perUserLimit: 1 }, lines, { ...ctx, usesByUser: 1 })).toMatchObject({ ok: false });
    expect(evaluateCoupon({ ...base, minOrder: 500000 }, lines, ctx)).toMatchObject({ ok: false, reason: "Add ₹702 more to use this code" });
    expect(evaluateCoupon({ ...base, firstOrderOnly: true }, lines, { ...ctx, priorOrders: 1 })).toMatchObject({ ok: false });
    expect(evaluateCoupon({ ...base, firstOrderOnly: true }, lines, { ...ctx, userId: null })).toMatchObject({ ok: false, reason: "Sign in to use this code" });
    expect(evaluateCoupon({ ...base, scope: { bundleIds: ["kit"] } }, lines, ctx)).toMatchObject({ ok: false });
    // per-user limits can't be judged for guests; checkout (signed in) enforces them
    expect(evaluateCoupon({ ...base, perUserLimit: 1 }, lines, { ...ctx, userId: null, usesByUser: 0 })).toMatchObject({ ok: true });
  });
});

describe("cartTotals", () => {
  const s = { freeShippingThreshold: 99900, shippingFee: 7900, giftWrapPrice: 0 };
  it("ships free over the threshold after discount", () => {
    expect(cartTotals(lines, 43000, true, s)).toMatchObject({ subtotal: 429800, shipping: 0, total: 386800, freeShippingRemaining: 0 });
  });
  it("charges shipping below the threshold and reports the gap", () => {
    const small = [{ lineTotal: 69900, productIds: ["b"], bundleId: null }];
    expect(cartTotals(small, 0, false, s)).toMatchObject({ shipping: 7900, total: 77800, freeShippingRemaining: 30000 });
  });
  it("adds a gift wrap fee only when chosen and the cart has items", () => {
    expect(cartTotals(lines, 0, true, { ...s, giftWrapPrice: 4900 }).giftWrapFee).toBe(4900);
    expect(cartTotals([], 0, true, { ...s, giftWrapPrice: 4900 })).toMatchObject({ giftWrapFee: 0, shipping: 0, total: 0 });
  });
});

import { normalizeIndianMobile } from "@/lib/phone";

describe("normalizeIndianMobile", () => {
  it("accepts common formats", () => {
    expect(normalizeIndianMobile("98765 43210")).toBe("+919876543210");
    expect(normalizeIndianMobile("+91-98765-43210")).toBe("+919876543210");
    expect(normalizeIndianMobile("09876543210")).toBe("+919876543210");
  });
  it("rejects landlines and short numbers", () => {
    expect(normalizeIndianMobile("5876543210")).toBeNull();
    expect(normalizeIndianMobile("98765")).toBeNull();
  });
});

import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { orderLabel, parseOrderLabel, readComponents, stockNeeds } from "@/lib/order-utils";
import { verifyPaymentSignature, verifyWebhookSignature } from "@/lib/razorpay";

describe("order labels", () => {
  it("round-trips SW numbers", () => {
    expect(orderLabel(1001)).toBe("SW1001");
    expect(parseOrderLabel("sw1042")).toBe(1042);
    expect(parseOrderLabel("1042")).toBeNull();
  });
});

describe("stockNeeds", () => {
  it("multiplies per-unit components by line quantity and sums shared variants", () => {
    const needs = stockNeeds([
      { qty: 2, components: [{ variantId: "tree", qty: 1 }] },
      { qty: 1, components: [{ variantId: "tree", qty: 1 }, { variantId: "lights", qty: 2 }] },
    ]);
    expect(Object.fromEntries(needs)).toEqual({ tree: 3, lights: 2 });
  });
  it("ignores malformed component JSON", () => {
    expect(readComponents([{ variantId: "a", qty: 1 }, { foo: 1 }, null])).toEqual([{ variantId: "a", qty: 1 }]);
    expect(readComponents("nope")).toEqual([]);
  });
});

describe("Razorpay signatures", () => {
  const secret = "test_secret";
  it("verifies checkout signatures", () => {
    const sig = createHmac("sha256", secret).update("order_1|pay_1").digest("hex");
    expect(verifyPaymentSignature("order_1", "pay_1", sig, secret)).toBe(true);
    expect(verifyPaymentSignature("order_1", "pay_2", sig, secret)).toBe(false);
    expect(verifyPaymentSignature("order_1", "pay_1", sig, "")).toBe(false);
  });
  it("verifies webhook signatures over the raw body", () => {
    const body = JSON.stringify({ event: "payment.captured" });
    const sig = createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyWebhookSignature(body, sig, secret)).toBe(true);
    expect(verifyWebhookSignature(body + " ", sig, secret)).toBe(false);
    expect(verifyWebhookSignature(body, "", secret)).toBe(false);
  });
});

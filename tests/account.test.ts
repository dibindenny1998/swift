import { describe, expect, it } from "vitest";
import { canRequestReturn, fromShiprocket, isForward, statusLabel, timeline } from "@/lib/order-status";

const t0 = new Date("2026-12-01T10:00:00Z");
const at = (h: number) => new Date(t0.getTime() + h * 3600e3);

describe("timeline", () => {
  it("marks steps done up to the current status with event times", () => {
    const steps = timeline("SHIPPED", t0, [
      { status: "PACKED", createdAt: at(5) },
      { status: "SHIPPED", createdAt: at(20) },
    ]);
    expect(steps.map((s) => [s.key, s.done, s.current])).toEqual([
      ["placed", true, false],
      ["packed", true, false],
      ["shipped", true, true],
      ["out", false, false],
      ["delivered", false, false],
    ]);
    expect(steps[2].at).toEqual(at(20));
  });
  it("shows only 'placed' for pending, paid and cancelled orders", () => {
    expect(timeline("PENDING", t0, []).filter((s) => s.done)).toHaveLength(1);
    expect(timeline("PAID", t0, []).filter((s) => s.done)).toHaveLength(1);
    expect(timeline("CANCELLED", t0, []).some((s) => s.current)).toBe(false);
  });
});

describe("status rules", () => {
  it("labels pending by payment method", () => {
    expect(statusLabel("PENDING", "COD")).toBe("Awaiting confirmation");
    expect(statusLabel("PENDING", "RAZORPAY")).toBe("Awaiting payment");
  });
  it("only moves forward", () => {
    expect(isForward("PACKED", "SHIPPED")).toBe(true);
    expect(isForward("DELIVERED", "SHIPPED")).toBe(false);
    expect(isForward("CANCELLED", "SHIPPED")).toBe(false);
  });
  it("maps Shiprocket statuses", () => {
    expect(fromShiprocket("IN TRANSIT")).toBe("SHIPPED");
    expect(fromShiprocket("Out For Delivery")).toBe("OUT_FOR_DELIVERY");
    expect(fromShiprocket("DELIVERED")).toBe("DELIVERED");
    expect(fromShiprocket("PICKUP SCHEDULED")).toBe("PACKED");
    expect(fromShiprocket("RTO INITIATED")).toBeNull();
    expect(fromShiprocket("something odd")).toBeNull();
  });
});

describe("canRequestReturn", () => {
  it("allows returns within 7 days of delivery, once", () => {
    const delivered = { status: "DELIVERED" as const, deliveredAt: t0 };
    expect(canRequestReturn(delivered, false, at(24 * 6))).toBe(true);
    expect(canRequestReturn(delivered, false, at(24 * 8))).toBe(false);
    expect(canRequestReturn(delivered, true, at(24))).toBe(false);
    expect(canRequestReturn({ status: "SHIPPED", deliveredAt: null }, false, at(1))).toBe(false);
  });
});

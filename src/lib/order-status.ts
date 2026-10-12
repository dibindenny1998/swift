// Pure order-status rules shared by the account pages, webhooks and admin.

export type Status = "PENDING" | "PAID" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "RETURNED";
export type PaymentMethod = "RAZORPAY" | "COD";

const RANK: Record<Status, number> = {
  PENDING: 0,
  PAID: 1,
  PACKED: 2,
  SHIPPED: 3,
  OUT_FOR_DELIVERY: 4,
  DELIVERED: 5,
  CANCELLED: -1,
  RETURNED: -1,
};

export function statusLabel(status: Status, method: PaymentMethod): string {
  switch (status) {
    case "PENDING":
      return method === "COD" ? "Awaiting confirmation" : "Awaiting payment";
    case "PAID":
      return "Confirmed";
    case "PACKED":
      return "Packed";
    case "SHIPPED":
      return "Shipped";
    case "OUT_FOR_DELIVERY":
      return "Out for delivery";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    case "RETURNED":
      return "Returned";
  }
}

/** Couriers can send events out of order; only ever move forward (cancel/return are handled separately). */
export function isForward(from: Status, to: Status) {
  return RANK[from] >= 0 && RANK[to] > RANK[from];
}

export type TimelineStep = { key: string; label: string; done: boolean; current: boolean; at: Date | null };

/** The five customer-facing steps. "Placed" also covers COD confirmation / online payment. */
export function timeline(status: Status, createdAt: Date, events: { status: Status; createdAt: Date }[]): TimelineStep[] {
  const firstAt = (s: Status) => events.find((e) => e.status === s)?.createdAt ?? null;
  const rank = RANK[status];
  const steps: { key: string; label: string; reached: number; at: Date | null }[] = [
    { key: "placed", label: "Order placed", reached: 0, at: createdAt },
    { key: "packed", label: "Packed", reached: RANK.PACKED, at: firstAt("PACKED") },
    { key: "shipped", label: "Shipped", reached: RANK.SHIPPED, at: firstAt("SHIPPED") },
    { key: "out", label: "Out for delivery", reached: RANK.OUT_FOR_DELIVERY, at: firstAt("OUT_FOR_DELIVERY") },
    { key: "delivered", label: "Delivered", reached: RANK.DELIVERED, at: firstAt("DELIVERED") },
  ];
  const doneCount = rank < 0 ? 1 : steps.filter((s) => rank >= s.reached).length;
  return steps.map((s, i) => ({
    key: s.key,
    label: s.label,
    done: i < doneCount,
    current: rank >= 0 && i === doneCount - 1,
    at: i < doneCount ? s.at : null,
  }));
}

export const RETURN_WINDOW_DAYS = 7;

export function canRequestReturn(order: { status: Status; deliveredAt: Date | null }, hasOpenReturn: boolean, now = new Date()) {
  if (order.status !== "DELIVERED" || !order.deliveredAt || hasOpenReturn) return false;
  return now.getTime() - order.deliveredAt.getTime() <= RETURN_WINDOW_DAYS * 864e5;
}

/** Map a Shiprocket tracking status to our order status (null = informational only). */
export function fromShiprocket(raw: string): Status | null {
  const s = raw.trim().toUpperCase().replace(/[_-]+/g, " ");
  if (s.startsWith("RTO")) return null; // returning to origin — admin handles it
  if (s === "DELIVERED") return "DELIVERED";
  if (s.includes("OUT FOR DELIVERY")) return "OUT_FOR_DELIVERY";
  if (["SHIPPED", "PICKED UP", "IN TRANSIT", "REACHED AT DESTINATION HUB", "REACHED DESTINATION HUB"].some((k) => s.includes(k))) return "SHIPPED";
  if (s.includes("PICKUP SCHEDULED") || s.includes("MANIFEST") || s.includes("READY TO SHIP")) return "PACKED";
  return null;
}

import { Pill } from "./Pill";

export type BadgeKind = "NEW" | "BESTSELLER" | "LOW_STOCK";

/** Small product-image badge. "Only X left" must come from real stock (spec §9). */
export function Badge({ kind, stock }: { kind: BadgeKind; stock?: number }) {
  if (kind === "LOW_STOCK") return <Pill tone="sale">{stock} left</Pill>;
  if (kind === "NEW") return <Pill tone="green">New</Pill>;
  return <Pill tone="gold">Bestseller</Pill>;
}

/** Decide which badge (if any) a product card shows. Real stock always wins over marketing badges. */
export function pickBadge(
  badge: "NONE" | "NEW" | "BESTSELLER",
  stock: number,
  lowStockThreshold: number,
): { kind: BadgeKind; stock?: number } | null {
  if (stock > 0 && stock <= lowStockThreshold) return { kind: "LOW_STOCK", stock };
  if (badge === "NONE") return null;
  return { kind: badge };
}

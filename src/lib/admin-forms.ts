import "server-only";
import { db } from "./db";
import { IST_OFFSET_MS } from "./ist";

/** All variants as "Product — Variant" options for kit/box pickers. */
export async function variantOptions() {
  const vs = await db.variant.findMany({
    include: { product: { select: { title: true, isLive: true, _count: { select: { variants: true } } } } },
    orderBy: [{ product: { title: "asc" } }, { price: "asc" }],
  });
  return vs.map((v) => ({
    id: v.id,
    label: `${v.product.title}${v.product._count.variants > 1 ? ` — ${v.name}` : ""}${v.product.isLive ? "" : " (hidden)"}`,
    price: v.price,
    stock: v.stock,
  }));
}

/** Date → "YYYY-MM-DDTHH:mm" in IST for datetime-local inputs. */
export function toIstLocal(d: Date | null) {
  if (!d) return "";
  return new Date(d.getTime() + IST_OFFSET_MS).toISOString().slice(0, 16);
}

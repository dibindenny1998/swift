import { adminApi } from "@/lib/admin";
import { salesWhere } from "@/lib/admin-data";
import { db } from "@/lib/db";
import { IST_OFFSET_MS } from "@/lib/ist";
import { orderLabel } from "@/lib/order-utils";
import { resolveRange } from "@/lib/reports";

const cell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const rupees = (paise: number) => (paise / 100).toFixed(2);
const ist = (d: Date | null | undefined) => (d ? new Date(d.getTime() + IST_OFFSET_MS).toISOString().slice(0, 16).replace("T", " ") : "");

function csv(name: string, header: string[], rows: unknown[][]) {
  // BOM so Excel reads names in UTF-8.
  const body = "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
  return new Response(body, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "no-store" },
  });
}

/** CSV exports for the Reports page: orders or products sold in a date range, or all customers. */
export async function GET(request: Request) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const p = new URL(request.url).searchParams;
  const type = p.get("type");
  const r = resolveRange(p.get("range") ?? undefined, p.get("from") ?? undefined, p.get("to") ?? undefined);
  const suffix = `${r.first}_to_${r.last}`;

  if (type === "orders") {
    const orders = await db.order.findMany({
      where: { createdAt: { gte: r.start, lt: r.end } },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { name: true, phone: true, email: true } },
        coupon: { select: { code: true } },
        items: { select: { titleSnapshot: true, detailSnapshot: true, qty: true } },
        shipments: { select: { awb: true, courier: true }, take: 1 },
      },
    });
    return csv(
      `swift-orders_${suffix}.csv`,
      ["Order", "Placed (IST)", "Status", "Payment", "Customer", "Phone", "Email", "Ship to", "City", "State", "Pincode", "Items", "Units", "Subtotal", "Discount", "Coupon", "Shipping", "COD fee", "Gift wrap", "Total", "Courier", "AWB", "Gift message"],
      orders.map((o) => {
        const a = (o.addressSnapshot ?? {}) as Record<string, string>;
        return [
          orderLabel(o.number),
          ist(o.createdAt),
          o.status,
          o.paymentMethod === "COD" ? "COD" : "Online",
          o.user.name ?? "",
          o.user.phone ?? "",
          o.user.email ?? "",
          a.name ?? "",
          a.city ?? "",
          a.state ?? "",
          a.pincode ?? "",
          o.items.map((i) => `${i.qty} × ${i.titleSnapshot}${i.detailSnapshot ? ` (${i.detailSnapshot})` : ""}`).join("; "),
          o.items.reduce((n, i) => n + i.qty, 0),
          rupees(o.subtotal),
          rupees(o.discount),
          o.coupon?.code ?? "",
          rupees(o.shipping),
          rupees(o.codFee),
          rupees(o.giftWrap),
          rupees(o.total),
          o.shipments[0]?.courier ?? "",
          o.shipments[0]?.awb ?? "",
          o.giftMessage ?? "",
        ];
      }),
    );
  }

  if (type === "products") {
    const items = await db.orderItem.findMany({
      where: { order: { ...salesWhere, createdAt: { gte: r.start, lt: r.end } } },
      select: {
        titleSnapshot: true,
        bundleId: true,
        qty: true,
        priceSnapshot: true,
        variant: { select: { sku: true, name: true, product: { select: { category: { select: { name: true } } } } } },
      },
    });
    const lines = new Map<string, { row: unknown[]; units: number; value: number }>();
    for (const i of items) {
      const k = `${i.titleSnapshot}|${i.variant?.sku ?? i.bundleId}`;
      const l = lines.get(k) ?? {
        row: [i.titleSnapshot, i.variant?.name ?? (i.bundleId ? "Kit / gift box" : ""), i.variant?.sku ?? "", i.bundleId ? "Kits & gift boxes" : (i.variant?.product.category.name ?? "")],
        units: 0,
        value: 0,
      };
      l.units += i.qty;
      l.value += i.qty * i.priceSnapshot;
      lines.set(k, l);
    }
    const out = [...lines.values()].sort((x, y) => y.value - x.value).map((l) => [...l.row, l.units, rupees(l.value)]);
    return csv(`swift-products-sold_${suffix}.csv`, ["Product", "Variant", "SKU", "Category", "Units sold", "Sales (before order discounts)"], out);
  }

  if (type === "customers") {
    const users = await db.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, phone: true, email: true, createdAt: true, addresses: { where: { isDefault: true }, select: { city: true, state: true }, take: 1 } },
    });
    const stats = await db.order.groupBy({ by: ["userId"], where: salesWhere, _count: true, _sum: { total: true }, _min: { createdAt: true }, _max: { createdAt: true } });
    const byUser = new Map(stats.map((s) => [s.userId, s]));
    return csv(
      `swift-customers_${r.last}.csv`,
      ["Name", "Phone", "Email", "City", "State", "Orders", "Total spent", "First order (IST)", "Last order (IST)", "Signed up (IST)"],
      users.map((u) => {
        const s = byUser.get(u.id);
        return [u.name ?? "", u.phone ?? "", u.email ?? "", u.addresses[0]?.city ?? "", u.addresses[0]?.state ?? "", s?._count ?? 0, rupees(s?._sum.total ?? 0), ist(s?._min.createdAt), ist(s?._max.createdAt), ist(u.createdAt)];
      }),
    );
  }

  return new Response("Unknown export", { status: 400 });
}

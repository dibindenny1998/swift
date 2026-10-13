import { z } from "zod";
import { adminApi, adminName } from "@/lib/admin";
import { db } from "@/lib/db";
import { error, json, readJson } from "@/lib/http";
import { orderLabel, readComponents, stockNeeds } from "@/lib/order-utils";
import { setOrderStatus, type AddressSnapshot } from "@/lib/orders";
import { getSettings } from "@/lib/settings-server";
import { createShipment, shiprocketConfigured } from "@/lib/shiprocket";

const schema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("shiprocket") }),
  z.object({
    mode: z.literal("manual"),
    courier: z.string().trim().min(2).max(60),
    awb: z.string().trim().min(4).max(40),
    trackingUrl: z.union([z.url().max(500), z.literal("")]).optional(),
  }),
]);

export async function POST(request: Request, ctx: RouteContext<"/api/admin/orders/[id]/shipment">) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Check the shipment details");
  const { id } = await ctx.params;
  const order = await db.order.findUnique({ where: { id }, include: { items: true, user: true } });
  if (!order) return error("Order not found", 404);
  if (["PENDING", "CANCELLED", "RETURNED", "DELIVERED"].includes(order.status) && !(order.status === "PENDING" && order.paymentMethod === "COD")) {
    return error("Confirm the order (or wait for payment) before shipping it", 409);
  }
  const by = adminName(auth.admin);

  if (parsed.data.mode === "manual") {
    const s = await db.shipment.create({
      data: { orderId: id, courier: parsed.data.courier, awb: parsed.data.awb, trackingUrl: parsed.data.trackingUrl || null, status: "SHIPPED" },
    }).catch(() => null);
    if (!s) return error("That AWB is already used on another shipment", 409);
    if (order.status === "PENDING") await setOrderStatus(id, "PAID", { note: `COD confirmed (by ${by})` });
    await setOrderStatus(id, "SHIPPED", { note: `${parsed.data.courier} · AWB ${parsed.data.awb} (by ${by})`, force: true });
    return json({ ok: true });
  }

  if (!shiprocketConfigured()) return error("Shiprocket isn't connected yet — add SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD, or enter the AWB manually.", 503);
  const settings = await getSettings();
  const address = order.addressSnapshot as AddressSnapshot;
  const needs = stockNeeds(order.items.map((i) => ({ qty: i.qty, components: readComponents(i.components) })));
  const variants = await db.variant.findMany({ where: { id: { in: [...needs.keys()] } }, select: { id: true, weightGrams: true } });
  const grams = variants.reduce((s, v) => s + v.weightGrams * (needs.get(v.id) ?? 0), 0);

  try {
    const sr = await createShipment({
      orderLabel: orderLabel(order.number),
      orderDate: order.createdAt,
      pickupLocation: settings.shiprocketPickupLocation,
      customer: { ...address, line2: address.line2 ?? null, email: address.email ?? order.user.email },
      items: order.items.map((i, n) => ({ name: i.titleSnapshot, sku: `${orderLabel(order.number)}-${n + 1}`, units: i.qty, sellingPrice: i.priceSnapshot / 100 })),
      subTotal: (order.total - order.shipping - order.codFee) / 100,
      cod: order.paymentMethod === "COD",
      weightKg: grams / 1000,
      dims: settings.packageCm,
    });
    await db.shipment.create({
      data: { orderId: id, shiprocketOrderId: sr.shiprocketOrderId, awb: sr.awb, courier: sr.courier, trackingUrl: sr.trackingUrl, labelUrl: sr.labelUrl, status: "AWB_ASSIGNED" },
    });
    if (order.status === "PENDING") await setOrderStatus(id, "PAID", { note: `COD confirmed (by ${by})` });
    await setOrderStatus(id, "PACKED", { note: `Shiprocket ${sr.courier ?? ""} · AWB ${sr.awb ?? "pending"}` });
    return json({ ok: true, shipment: sr });
  } catch (e) {
    return error(e instanceof Error ? e.message : "Shiprocket request failed", 502);
  }
}

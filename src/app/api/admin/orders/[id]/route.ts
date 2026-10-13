import { z } from "zod";
import { adminApi, adminName, refreshCatalog } from "@/lib/admin";
import { db } from "@/lib/db";
import { error, json, readJson } from "@/lib/http";
import { CheckoutError, setOrderStatus } from "@/lib/orders";

const schema = z.object({
  status: z.enum(["PENDING", "PAID", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"]),
  note: z.string().trim().max(300).optional(),
  restock: z.boolean().optional(),
  force: z.boolean().optional(),
});

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/orders/[id]">) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return error("Invalid status");
  const { id } = await ctx.params;
  const current = await db.order.findUnique({ where: { id }, select: { status: true, paymentMethod: true } });
  if (!current) return error("Order not found", 404);
  // An online order that hasn't been paid can only be cancelled — never confirmed, packed or shipped.
  if (current.status === "PENDING" && current.paymentMethod === "RAZORPAY" && parsed.data.status !== "CANCELLED" && !parsed.data.force) {
    return error("Still waiting for online payment", 409);
  }
  try {
    const r = await setOrderStatus(id, parsed.data.status, {
      note: parsed.data.note ? `${parsed.data.note} (by ${adminName(auth.admin)})` : `Updated by ${adminName(auth.admin)}`,
      restock: parsed.data.restock ?? true,
      force: parsed.data.force,
    });
    if (r.changed && (parsed.data.status === "CANCELLED" || parsed.data.status === "RETURNED")) refreshCatalog();
    if (!r.changed) return error("No change — orders only move forward. Tick “override” to correct a mistake.", 409);
    return json({ ok: true });
  } catch (e) {
    if (e instanceof CheckoutError) return error(e.message, e.status);
    throw e;
  }
}

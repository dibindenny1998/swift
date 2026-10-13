import { z } from "zod";
import { adminApi, adminName } from "@/lib/admin";
import { db } from "@/lib/db";
import { error, json, readJson } from "@/lib/http";
import { orderLabel } from "@/lib/order-utils";
import { razorpayConfigured, refundPayment } from "@/lib/razorpay";

const schema = z.object({ amount: z.number().int().min(100, "Refund at least ₹1"), reason: z.string().trim().max(200).optional() });

export async function POST(request: Request, ctx: RouteContext<"/api/admin/orders/[id]/refund">) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Invalid amount");
  const { id } = await ctx.params;
  const payment = await db.payment.findFirst({ where: { orderId: id, status: { in: ["captured", "partially_refunded"] } }, include: { order: true } });
  if (!payment?.razorpayPaymentId) return error("No captured online payment on this order (COD refunds are made outside the site)", 409);
  const remaining = payment.amount - payment.refundedAmount;
  if (parsed.data.amount > remaining) return error(`You can refund up to ₹${remaining / 100}`, 400);
  if (!razorpayConfigured()) return error("Razorpay keys aren't set", 503);

  try {
    const r = await refundPayment(payment.razorpayPaymentId, parsed.data.amount, {
      order: orderLabel(payment.order.number),
      reason: parsed.data.reason ?? "",
      by: adminName(auth.admin),
    });
    const refunded = payment.refundedAmount + parsed.data.amount;
    await db.payment.update({
      where: { id: payment.id },
      data: { refundedAmount: refunded, status: refunded >= payment.amount ? "refunded" : "partially_refunded" },
    });
    await db.orderEvent.create({
      data: { orderId: id, status: payment.order.status, note: `Refund ₹${parsed.data.amount / 100} (${r.id})${parsed.data.reason ? ` — ${parsed.data.reason}` : ""}` },
    });
    return json({ ok: true, refund: r });
  } catch (e) {
    return error(e instanceof Error ? e.message : "Refund failed", 502);
  }
}

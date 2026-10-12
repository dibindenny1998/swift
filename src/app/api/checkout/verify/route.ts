import { z } from "zod";
import { db } from "@/lib/db";
import { error, json, readJson, sameOrigin } from "@/lib/http";
import { orderLabel } from "@/lib/order-utils";
import { markOrderPaid } from "@/lib/orders";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { getSession } from "@/lib/session";

const schema = z.object({
  razorpay_order_id: z.string().min(1).max(64),
  razorpay_payment_id: z.string().min(1).max(64),
  razorpay_signature: z.string().min(1).max(256),
});

/** Called by the browser right after Razorpay Checkout succeeds. The webhook is the backstop. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Forbidden", 403);
  const session = await getSession();
  if (!session) return error("Please sign in", 401);
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return error("Invalid payment details");
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return error("We couldn't verify this payment. If money was deducted, it will be confirmed shortly.", 400);
  }
  const payment = await db.payment.findUnique({ where: { razorpayOrderId: razorpay_order_id }, include: { order: true } });
  if (!payment || payment.order.userId !== session.uid) return error("Order not found", 404);

  await markOrderPaid(razorpay_order_id, razorpay_payment_id, { source: "checkout", ...parsed.data });
  return json({ order: { label: orderLabel(payment.order.number) } });
}

import { markOrderPaid, markPaymentFailed } from "@/lib/orders";
import { verifyWebhookSignature } from "@/lib/razorpay";

type Event = {
  event: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string; status?: string } };
    order?: { entity?: { id?: string } };
  };
};

/** Razorpay → us. Signature-checked over the raw body; idempotent, so retries are harmless. */
export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifyWebhookSignature(raw, request.headers.get("x-razorpay-signature") ?? "")) {
    return Response.json({ error: "invalid signature" }, { status: 400 });
  }
  let event: Event;
  try {
    event = JSON.parse(raw) as Event;
  } catch {
    return Response.json({ error: "invalid body" }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  const orderId = payment?.order_id ?? event.payload?.order?.entity?.id;
  if (!orderId) return Response.json({ ok: true, ignored: true });

  switch (event.event) {
    case "payment.captured":
    case "order.paid":
      if (payment?.id) await markOrderPaid(orderId, payment.id, event);
      break;
    case "payment.failed":
      await markPaymentFailed(orderId, event);
      break;
  }
  return Response.json({ ok: true });
}

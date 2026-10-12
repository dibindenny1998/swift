import { z } from "zod";
import { getAccountOrder } from "@/lib/account";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { error, json, readJson, sameOrigin } from "@/lib/http";
import { parseOrderLabel } from "@/lib/order-utils";
import { RETURN_REASONS } from "@/lib/returns";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/settings-server";

const schema = z.object({
  itemIds: z.array(z.string().min(1).max(64)).min(1, "Choose at least one item").max(50),
  reason: z.enum(RETURN_REASONS),
  details: z.string().trim().max(1000).optional(),
});

export async function POST(request: Request, ctx: RouteContext<"/api/orders/[id]/return">) {
  if (!sameOrigin(request)) return error("Forbidden", 403);
  const session = await getSession();
  if (!session) return error("Sign in first", 401);
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Invalid request");

  const number = parseOrderLabel((await ctx.params).id);
  const order = number ? await getAccountOrder(session.uid, number) : null;
  if (!order) return error("Order not found", 404);
  if (!order.canReturn) return error("This order isn't eligible for a return", 409);
  const valid = new Set(order.items.map((i) => i.id));
  if (!parsed.data.itemIds.every((id) => valid.has(id))) return error("Choose items from this order");
  if (parsed.data.reason === "Other" && !parsed.data.details) return error("Tell us a little about the problem");

  const ret = await db.returnRequest.create({
    data: {
      orderId: order.id,
      userId: session.uid,
      reason: parsed.data.reason,
      details: parsed.data.details || null,
      itemIds: parsed.data.itemIds,
    },
  });

  const settings = await getSettings();
  const adminTo = settings.orderNotifyEmail || process.env.ADMIN_SEED_EMAIL;
  if (adminTo) {
    void sendEmail(
      adminTo,
      `Return requested · ${order.label}`,
      `<p>Return requested for <b>${order.label}</b> (${parsed.data.itemIds.length} item(s)).</p><p>Reason: ${parsed.data.reason}</p>`,
    ).catch(() => {});
  }
  return json({ return: { id: ret.id, status: ret.status } }, 201);
}

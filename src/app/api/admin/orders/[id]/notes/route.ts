import { z } from "zod";
import { adminApi, adminName } from "@/lib/admin";
import { db } from "@/lib/db";
import { error, json, readJson } from "@/lib/http";

const schema = z.object({ text: z.string().trim().min(1, "Write a note first").max(1000) });

/** Add a private staff note to an order. */
export async function POST(request: Request, ctx: RouteContext<"/api/admin/orders/[id]/notes">) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Invalid note");
  const { id } = await ctx.params;
  const order = await db.order.findUnique({ where: { id }, select: { id: true } });
  if (!order) return error("Order not found", 404);
  const note = await db.orderNote.create({ data: { orderId: id, text: parsed.data.text, authorName: adminName(auth.admin) } });
  return json({ note }, 201);
}

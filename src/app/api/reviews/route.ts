import { z } from "zod";
import { db } from "@/lib/db";
import { error, json, readJson, sameOrigin } from "@/lib/http";
import { readComponents } from "@/lib/order-utils";
import { getSession } from "@/lib/session";

const schema = z.object({
  productId: z.string().min(1).max(64),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(10, "Tell us a little more (10+ characters)").max(1000),
});

/** Only customers with a delivered order containing the product can review it. Reviews go live after approval. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Forbidden", 403);
  const session = await getSession();
  if (!session) return error("Sign in first", 401);
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Invalid review");
  const { productId, rating, text } = parsed.data;

  const items = await db.orderItem.findMany({
    where: { order: { userId: session.uid, status: "DELIVERED" } },
    select: { variantId: true, components: true },
  });
  const variantIds = new Set<string>();
  for (const i of items) {
    if (i.variantId) variantIds.add(i.variantId);
    for (const c of readComponents(i.components)) variantIds.add(c.variantId);
  }
  const bought = await db.variant.count({ where: { id: { in: [...variantIds] }, productId } });
  if (!bought) return error("You can review this once your order has been delivered", 403);

  const existing = await db.review.findFirst({ where: { userId: session.uid, productId } });
  if (existing) return error("You've already reviewed this — thank you!", 409);

  await db.review.create({ data: { productId, userId: session.uid, rating, text, isApproved: false } });
  return json({ ok: true, message: "Thanks! Your review will appear once it's approved." }, 201);
}

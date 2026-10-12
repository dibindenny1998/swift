import { z } from "zod";
import { db } from "@/lib/db";
import { error, json, readJson, sameOrigin } from "@/lib/http";
import { getSession } from "@/lib/session";

const ids = z.array(z.string().min(1).max(64)).max(200);

async function list(userId: string) {
  const rows = await db.wishlist.findMany({ where: { userId }, select: { productId: true }, orderBy: { id: "desc" } });
  return rows.map((r) => r.productId);
}

export async function GET() {
  const session = await getSession();
  if (!session) return error("Sign in to see your wishlist", 401);
  return json({ productIds: await list(session.uid) });
}

/** Add one or many products (used to sync the on-device wishlist after login). Returns the merged list. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Forbidden", 403);
  const session = await getSession();
  if (!session) return error("Sign in to save your wishlist", 401);
  const parsed = z.object({ productIds: ids }).safeParse(await readJson(request));
  if (!parsed.success) return error("Invalid products");
  const existing = await db.product.findMany({ where: { id: { in: parsed.data.productIds } }, select: { id: true } });
  await db.wishlist.createMany({
    data: existing.map((p) => ({ userId: session.uid, productId: p.id })),
    skipDuplicates: true,
  });
  return json({ productIds: await list(session.uid) });
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return error("Forbidden", 403);
  const session = await getSession();
  if (!session) return error("Sign in first", 401);
  const parsed = z.object({ productId: z.string().min(1).max(64) }).safeParse(await readJson(request));
  if (!parsed.success) return error("Invalid product");
  await db.wishlist.deleteMany({ where: { userId: session.uid, productId: parsed.data.productId } });
  return json({ productIds: await list(session.uid) });
}

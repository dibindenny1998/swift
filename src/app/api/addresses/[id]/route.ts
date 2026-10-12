import { addressSchema } from "@/lib/address-schema";
import { db } from "@/lib/db";
import { error, json, readJson, sameOrigin } from "@/lib/http";
import { getSession } from "@/lib/session";

export async function PATCH(request: Request, ctx: RouteContext<"/api/addresses/[id]">) {
  if (!sameOrigin(request)) return error("Forbidden", 403);
  const session = await getSession();
  if (!session) return error("Sign in first", 401);
  const { id } = await ctx.params;
  const parsed = addressSchema.partial().safeParse(await readJson(request));
  if (!parsed.success) return json({ error: parsed.error.issues[0]?.message, fields: parsed.error.flatten().fieldErrors }, 400);
  const existing = await db.address.findFirst({ where: { id, userId: session.uid } });
  if (!existing) return error("Address not found", 404);
  const address = await db.$transaction(async (tx) => {
    if (parsed.data.isDefault) await tx.address.updateMany({ where: { userId: session.uid }, data: { isDefault: false } });
    return tx.address.update({ where: { id }, data: parsed.data });
  });
  return json({ address });
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/addresses/[id]">) {
  if (!sameOrigin(request)) return error("Forbidden", 403);
  const session = await getSession();
  if (!session) return error("Sign in first", 401);
  const { id } = await ctx.params;
  const existing = await db.address.findFirst({ where: { id, userId: session.uid } });
  if (!existing) return error("Address not found", 404);
  await db.address.delete({ where: { id } });
  if (existing.isDefault) {
    const next = await db.address.findFirst({ where: { userId: session.uid }, orderBy: { id: "desc" } });
    if (next) await db.address.update({ where: { id: next.id }, data: { isDefault: true } });
  }
  return json({ ok: true });
}

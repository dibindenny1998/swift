import { z } from "zod";
import { adminApi, refreshCatalog } from "@/lib/admin";
import { db } from "@/lib/db";
import { error, json, readJson } from "@/lib/http";

const schema = z.object({ isApproved: z.boolean().optional(), reply: z.string().trim().max(600).nullable().optional() });

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/reviews/[id]">) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return error("Invalid update");
  const { id } = await ctx.params;
  await db.review.update({ where: { id }, data: { ...parsed.data, reply: parsed.data.reply === undefined ? undefined : parsed.data.reply || null } });
  refreshCatalog();
  return json({ ok: true });
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/admin/reviews/[id]">) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  await db.review.delete({ where: { id } }).catch(() => null);
  refreshCatalog();
  return json({ ok: true });
}

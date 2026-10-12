import { z } from "zod";
import { adminApi, refreshCatalog } from "@/lib/admin";
import { db } from "@/lib/db";
import { error, json, readJson } from "@/lib/http";

const schema = z.object({
  name: z.string().trim().min(2).max(40).optional(),
  imageUrl: z.string().max(500).nullable().optional(),
  sortOrder: z.number().int().min(0).max(1000).optional(),
});

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/categories/[id]">) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return error("Invalid category");
  const { id } = await ctx.params;
  await db.category.update({ where: { id }, data: parsed.data });
  refreshCatalog();
  return json({ ok: true });
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/admin/categories/[id]">) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  const n = await db.product.count({ where: { categoryId: id } });
  if (n) return error(`Move its ${n} product(s) to another category first`, 409);
  await db.category.delete({ where: { id } });
  refreshCatalog();
  return json({ ok: true });
}

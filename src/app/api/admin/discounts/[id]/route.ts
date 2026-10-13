import { Prisma } from "@prisma/client";
import { adminApi } from "@/lib/admin";
import { autoDiscountInput } from "@/lib/auto-discounts";
import { db } from "@/lib/db";
import { error, json, readJson } from "@/lib/http";

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/discounts/[id]">) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const parsed = autoDiscountInput.safeParse(await readJson(request));
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Check the form");
  const { id } = await ctx.params;
  const { scope, ...rest } = parsed.data;
  const hasScope = scope && (scope.productIds.length || scope.categoryIds.length || scope.bundleIds.length);
  await db.autoDiscount.update({ where: { id }, data: { ...rest, scope: hasScope ? scope : Prisma.DbNull } });
  return json({ ok: true });
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/admin/discounts/[id]">) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  await db.autoDiscount.delete({ where: { id } }).catch(() => null);
  return json({ ok: true });
}

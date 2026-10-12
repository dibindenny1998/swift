import { Prisma } from "@prisma/client";
import { adminApi } from "@/lib/admin";
import { couponInput } from "@/lib/admin-bundles";
import { uniqueError } from "@/lib/admin-products";
import { db } from "@/lib/db";
import { error, json, readJson } from "@/lib/http";

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/coupons/[id]">) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  const parsed = couponInput.safeParse(await readJson(request));
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Check the form");
  const { scope, ...rest } = parsed.data;
  const hasScope = scope && (scope.productIds.length || scope.bundleIds.length);
  try {
    await db.coupon.update({ where: { id }, data: { ...rest, scope: hasScope ? scope : Prisma.DbNull } });
    return json({ ok: true });
  } catch (e) {
    return error(uniqueError(e) ?? "Couldn't save", 409);
  }
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/admin/coupons/[id]">) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  const used = await db.couponUse.count({ where: { couponId: id } });
  if (used) {
    await db.coupon.update({ where: { id }, data: { isActive: false } });
    return json({ ok: true, disabled: true });
  }
  await db.coupon.delete({ where: { id } }).catch(() => null);
  return json({ ok: true });
}

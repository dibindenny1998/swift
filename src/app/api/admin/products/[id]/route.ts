import { adminApi, refreshCatalog } from "@/lib/admin";
import { productInput, saveProduct, uniqueError } from "@/lib/admin-products";
import { db } from "@/lib/db";
import { error, json, readJson } from "@/lib/http";

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/products/[id]">) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  if (!(await db.product.findUnique({ where: { id }, select: { id: true } }))) return error("Product not found", 404);
  const parsed = productInput.safeParse(await readJson(request));
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Check the form");
  try {
    await saveProduct(id, parsed.data);
    refreshCatalog();
    return json({ ok: true });
  } catch (e) {
    return error(uniqueError(e) ?? (e instanceof Error ? e.message : "Couldn't save"), 409);
  }
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/admin/products/[id]">) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  const sold = await db.orderItem.count({ where: { variant: { productId: id } } });
  if (sold > 0) return error("This product has orders — switch it off (hide) instead of deleting it.", 409);
  await db.product.delete({ where: { id } }).catch(() => null);
  refreshCatalog();
  return json({ ok: true });
}

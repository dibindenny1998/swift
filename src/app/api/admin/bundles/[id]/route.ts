import { adminApi, refreshCatalog } from "@/lib/admin";
import { bundleInput, saveBundle } from "@/lib/admin-bundles";
import { uniqueError } from "@/lib/admin-products";
import { db } from "@/lib/db";
import { error, json, readJson } from "@/lib/http";

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/bundles/[id]">) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  const parsed = bundleInput.safeParse(await readJson(request));
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Check the form");
  try {
    await saveBundle(id, parsed.data);
    refreshCatalog();
    return json({ ok: true });
  } catch (e) {
    return error(uniqueError(e) ?? (e instanceof Error ? e.message : "Couldn't save"), 409);
  }
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/admin/bundles/[id]">) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  if (await db.orderItem.count({ where: { bundleId: id } })) return error("This kit has orders — switch it off instead of deleting it.", 409);
  await db.bundle.delete({ where: { id } }).catch(() => null);
  refreshCatalog();
  return json({ ok: true });
}

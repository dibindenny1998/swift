import { adminApi, refreshCatalog } from "@/lib/admin";
import { productInput, saveProduct, uniqueError } from "@/lib/admin-products";
import { error, json, readJson } from "@/lib/http";

export async function POST(request: Request) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const parsed = productInput.safeParse(await readJson(request));
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Check the form");
  try {
    const product = await saveProduct(null, parsed.data);
    refreshCatalog();
    return json({ product: { id: product.id } }, 201);
  } catch (e) {
    return error(uniqueError(e) ?? (e instanceof Error ? e.message : "Couldn't save"), 409);
  }
}

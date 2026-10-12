import { adminApi, refreshCatalog } from "@/lib/admin";
import { bundleInput, saveBundle } from "@/lib/admin-bundles";
import { uniqueError } from "@/lib/admin-products";
import { error, json, readJson } from "@/lib/http";

export async function POST(request: Request) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const parsed = bundleInput.safeParse(await readJson(request));
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Check the form");
  try {
    const bundle = await saveBundle(null, parsed.data);
    refreshCatalog();
    return json({ bundle: { id: bundle.id } }, 201);
  } catch (e) {
    return error(uniqueError(e) ?? (e instanceof Error ? e.message : "Couldn't save"), 409);
  }
}

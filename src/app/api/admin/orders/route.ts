import { adminApi, adminName, refreshCatalog } from "@/lib/admin";
import { error, json, readJson } from "@/lib/http";
import { createManualOrder, manualOrderSchema } from "@/lib/manual-orders";
import { CheckoutError } from "@/lib/orders";

/** Create a manual order (taken on WhatsApp / phone). */
export async function POST(request: Request) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const parsed = manualOrderSchema.safeParse(await readJson(request));
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Check the order details");
  try {
    const order = await createManualOrder(parsed.data, adminName(auth.admin));
    refreshCatalog(); // stock changed
    return json({ order }, 201);
  } catch (e) {
    if (e instanceof CheckoutError) return error(e.message, e.status);
    throw e;
  }
}

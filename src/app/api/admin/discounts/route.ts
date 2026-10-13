import { adminApi } from "@/lib/admin";
import { autoDiscountInput } from "@/lib/auto-discounts";
import { db } from "@/lib/db";
import { error, json, readJson } from "@/lib/http";

/** Create an automatic discount (applied in the cart without a code). */
export async function POST(request: Request) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const parsed = autoDiscountInput.safeParse(await readJson(request));
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Check the form");
  const { scope, ...rest } = parsed.data;
  const hasScope = scope && (scope.productIds.length || scope.categoryIds.length || scope.bundleIds.length);
  const d = await db.autoDiscount.create({ data: { ...rest, scope: hasScope ? scope : undefined } });
  return json({ discount: { id: d.id } }, 201);
}

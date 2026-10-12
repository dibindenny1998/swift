import { adminApi } from "@/lib/admin";
import { couponInput } from "@/lib/admin-bundles";
import { uniqueError } from "@/lib/admin-products";
import { db } from "@/lib/db";
import { error, json, readJson } from "@/lib/http";

export async function POST(request: Request) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const parsed = couponInput.safeParse(await readJson(request));
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Check the form");
  const { scope, ...rest } = parsed.data;
  const hasScope = scope && (scope.productIds.length || scope.bundleIds.length);
  try {
    const coupon = await db.coupon.create({ data: { ...rest, scope: hasScope ? scope : undefined } });
    return json({ coupon: { id: coupon.id } }, 201);
  } catch (e) {
    return error(uniqueError(e) ?? "Couldn't save", 409);
  }
}

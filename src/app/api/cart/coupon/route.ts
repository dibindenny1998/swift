import { z } from "zod";
import { CartError, setCoupon } from "@/lib/cart-server";
import { error, json, readJson, sameOrigin } from "@/lib/http";

const schema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Enter a code")
    .max(32)
    .transform((s) => s.toUpperCase()),
});

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Forbidden", 403);
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Enter a code");
  try {
    return json({ cart: await setCoupon(parsed.data.code) });
  } catch (e) {
    if (e instanceof CartError) return error(e.message, 422);
    throw e;
  }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return error("Forbidden", 403);
  return json({ cart: await setCoupon(null) });
}

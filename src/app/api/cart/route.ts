import { z } from "zod";
import { addItem, CartError, getCartView, MAX_LINE_QTY, setGift, updateItem } from "@/lib/cart-server";
import { error, json, readJson, sameOrigin } from "@/lib/http";

const id = z.string().min(1).max(64);
const qty = z.number().int().min(1).max(MAX_LINE_QTY).default(1);

const addSchema = z.union([
  z.object({ variantId: id, qty }),
  z.object({ bundleId: id, qty }),
  z.object({
    byo: z.object({
      bundleId: id,
      picks: z.record(id, z.number().int().min(0).max(MAX_LINE_QTY)),
      message: z.string().max(200).optional(),
    }),
  }),
]);

const patchSchema = z.union([
  z.object({ itemId: id, qty: z.number().int().min(0).max(MAX_LINE_QTY) }),
  z.object({ giftWrap: z.boolean(), giftMessage: z.string().max(200).nullable().optional() }),
]);

async function handle(fn: () => Promise<unknown>) {
  try {
    return json({ cart: await fn() });
  } catch (e) {
    if (e instanceof CartError) return error(e.message, 409);
    throw e;
  }
}

export async function GET() {
  return json({ cart: await getCartView() });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Forbidden", 403);
  const parsed = addSchema.safeParse(await readJson(request));
  if (!parsed.success) return error("Invalid item");
  return handle(() => addItem(parsed.data));
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return error("Forbidden", 403);
  const parsed = patchSchema.safeParse(await readJson(request));
  if (!parsed.success) return error("Invalid update");
  const d = parsed.data;
  return handle(() => ("itemId" in d ? updateItem(d.itemId, d.qty) : setGift(d.giftWrap, d.giftMessage ?? null)));
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return error("Forbidden", 403);
  const parsed = z.object({ itemId: id }).safeParse(await readJson(request));
  if (!parsed.success) return error("Invalid item");
  return handle(() => updateItem(parsed.data.itemId, 0));
}

import { z } from "zod";
import { error, json, readJson, sameOrigin } from "@/lib/http";
import { CheckoutError, placeOrder } from "@/lib/orders";
import { getSession } from "@/lib/session";

const schema = z.object({
  addressId: z.string().min(1).max(64),
  paymentMethod: z.enum(["RAZORPAY", "COD"]),
  email: z.union([z.email().max(254), z.literal("")]).optional(),
});

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Forbidden", 403);
  const session = await getSession();
  if (!session) return error("Please sign in to check out", 401);
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Invalid checkout details");
  try {
    const result = await placeOrder({
      userId: session.uid,
      addressId: parsed.data.addressId,
      paymentMethod: parsed.data.paymentMethod,
      email: parsed.data.email ? parsed.data.email.toLowerCase() : null,
    });
    return json(result, 201);
  } catch (e) {
    if (e instanceof CheckoutError) return error(e.message, e.status);
    throw e;
  }
}

import { getAccountOrder } from "@/lib/account";
import { error, json } from "@/lib/http";
import { parseOrderLabel } from "@/lib/order-utils";
import { getSession } from "@/lib/session";

// [id] is the customer-facing order number, e.g. SW1042.
export async function GET(_request: Request, ctx: RouteContext<"/api/orders/[id]">) {
  const session = await getSession();
  if (!session) return error("Sign in first", 401);
  const number = parseOrderLabel((await ctx.params).id);
  const order = number ? await getAccountOrder(session.uid, number) : null;
  if (!order) return error("Order not found", 404);
  return json({ order });
}

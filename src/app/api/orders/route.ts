import { getAccountOrders } from "@/lib/account";
import { error, json } from "@/lib/http";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return error("Sign in first", 401);
  return json({ orders: await getAccountOrders(session.uid) });
}

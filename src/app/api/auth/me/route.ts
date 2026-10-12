import { db } from "@/lib/db";
import { json } from "@/lib/http";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return json({ user: null });
  const user = await db.user.findUnique({ where: { id: session.uid }, select: { id: true, phone: true, name: true, role: true } });
  return json({ user });
}

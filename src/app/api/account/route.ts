import { z } from "zod";
import { db } from "@/lib/db";
import { error, json, readJson, sameOrigin } from "@/lib/http";
import { getSession } from "@/lib/session";

const schema = z.object({ name: z.string().trim().min(1, "Enter your name").max(80) });

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return error("Forbidden", 403);
  const session = await getSession();
  if (!session) return error("Sign in first", 401);
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Invalid name");
  const user = await db.user.update({ where: { id: session.uid }, data: { name: parsed.data.name }, select: { id: true, phone: true, name: true, role: true } });
  return json({ user });
}

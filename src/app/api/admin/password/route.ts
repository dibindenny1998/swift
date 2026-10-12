import bcrypt from "bcryptjs";
import { z } from "zod";
import { adminApi } from "@/lib/admin";
import { db } from "@/lib/db";
import { error, json, readJson } from "@/lib/http";

const schema = z.object({
  current: z.string().min(1),
  next: z.string().min(10, "Use at least 10 characters").max(200),
});

export async function POST(request: Request) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Invalid password");
  const user = await db.user.findUnique({ where: { id: auth.admin.id } });
  if (!user?.passwordHash || !(await bcrypt.compare(parsed.data.current, user.passwordHash))) return error("Current password is incorrect", 401);
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(parsed.data.next, 12) } });
  return json({ ok: true });
}

import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { clientIp, error, json, readJson, sameOrigin } from "@/lib/http";
import { startSession } from "@/lib/session";

const WINDOW_MS = 15 * 60 * 1000;
const schema = z.object({ email: z.email().max(254), password: z.string().min(1).max(200) });
// A real hash to compare against when the email is unknown, so timing doesn't reveal which emails exist.
const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEeO0Ws7GyBqB5U4ndJvgWh/T3IiYbqA7cG";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Forbidden", 403);
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return error("Enter your email and password");
  const email = parsed.data.email.toLowerCase();
  const ip = clientIp(request);

  const since = new Date(Date.now() - WINDOW_MS);
  const [byEmail, byIp] = await Promise.all([
    db.adminLoginAttempt.count({ where: { email, success: false, createdAt: { gte: since } } }),
    db.adminLoginAttempt.count({ where: { ip, success: false, createdAt: { gte: since } } }),
  ]);
  if (byEmail >= 5 || byIp >= 20) return error("Too many attempts. Please wait 15 minutes and try again.", 429);

  const user = await db.user.findUnique({ where: { email } });
  const ok = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  const success = Boolean(ok && user && user.role === "ADMIN");
  await db.adminLoginAttempt.create({ data: { email, ip, success } });
  if (!success) return error("Email or password is incorrect", 401);

  await startSession(user!.id, "ADMIN");
  return json({ ok: true });
}

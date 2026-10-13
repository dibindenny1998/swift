import bcrypt from "bcryptjs";
import { z } from "zod";
import { AREA_KEYS } from "@/lib/admin-access";
import { adminApi } from "@/lib/admin";
import { db } from "@/lib/db";
import { error, json, readJson } from "@/lib/http";

const staffSchema = z.object({
  name: z.string().trim().min(2, "Enter their name").max(60),
  email: z.email("Enter a valid email").max(254),
  password: z.string().min(10, "Password needs at least 10 characters").max(200),
  areas: z.array(z.enum(AREA_KEYS as [string, ...string[]])).min(1, "Choose at least one area"),
});

/** Owner only (gated in admin-access): add a staff account. */
export async function POST(request: Request) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const parsed = staffSchema.safeParse(await readJson(request));
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Check the details");
  const { name, password, areas } = parsed.data;
  const email = parsed.data.email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return error(existing.role === "CUSTOMER" ? "A customer already uses this email — use a different one" : "There's already an account with this email", 409);
  const user = await db.user.create({
    data: { name, email, role: "STAFF", permissions: areas, passwordHash: await bcrypt.hash(password, 12) },
    select: { id: true },
  });
  return json({ id: user.id }, 201);
}

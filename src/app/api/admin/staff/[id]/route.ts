import bcrypt from "bcryptjs";
import { z } from "zod";
import { AREA_KEYS } from "@/lib/admin-access";
import { adminApi } from "@/lib/admin";
import { db } from "@/lib/db";
import { error, json, readJson } from "@/lib/http";

const schema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  areas: z.array(z.enum(AREA_KEYS as [string, ...string[]])).min(1, "Choose at least one area").optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(10, "Password needs at least 10 characters").max(200).optional(),
});

/** Owner only: change a staff member's areas, switch them off/on, or set a new password. */
export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/staff/[id]">) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Check the details");
  const { id } = await ctx.params;
  const staff = await db.user.findFirst({ where: { id, role: "STAFF" } });
  if (!staff) return error("Staff member not found", 404);
  const { name, areas, isActive, password } = parsed.data;
  await db.user.update({
    where: { id },
    data: {
      ...(name ? { name } : {}),
      ...(areas ? { permissions: areas } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
    },
  });
  return json({ ok: true });
}

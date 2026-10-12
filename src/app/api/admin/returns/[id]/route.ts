import { z } from "zod";
import { adminApi } from "@/lib/admin";
import { db } from "@/lib/db";
import { error, json, readJson } from "@/lib/http";

const schema = z.object({ status: z.enum(["REQUESTED", "APPROVED", "REJECTED", "RECEIVED", "REFUNDED"]), adminNote: z.string().trim().max(500).optional() });

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/returns/[id]">) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return error("Invalid update");
  const { id } = await ctx.params;
  await db.returnRequest.update({ where: { id }, data: { status: parsed.data.status, adminNote: parsed.data.adminNote || null } });
  return json({ ok: true });
}

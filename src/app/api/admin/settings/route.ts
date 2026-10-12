import type { Prisma } from "@prisma/client";
import { adminApi, refreshSettings } from "@/lib/admin";
import { db } from "@/lib/db";
import { error, json, readJson } from "@/lib/http";
import { settingsSchema } from "@/lib/settings";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function PUT(request: Request) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const parsed = settingsSchema.safeParse(await readJson(request));
  if (!parsed.success) return error(`${parsed.error.issues[0]?.path.join(".")}: ${parsed.error.issues[0]?.message}`);
  const s = parsed.data;
  if (!DATE.test(s.lastOrderDate)) return error("Last order date must be YYYY-MM-DD");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s.countdownEnd)) return error("Countdown end must be a date and time");
  if (s.gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(s.gstin)) return error("That GSTIN doesn't look right (15 characters, e.g. 29ABCDE1234F1Z5)");

  await db.$transaction(
    Object.entries(s).map(([key, value]) =>
      db.setting.upsert({ where: { key }, update: { value: value as Prisma.InputJsonValue }, create: { key, value: value as Prisma.InputJsonValue } }),
    ),
  );
  refreshSettings();
  return json({ ok: true });
}

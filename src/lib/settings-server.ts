import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";
import { settingsSchema, type SiteSettings } from "./settings";

export const SETTINGS_TAG = "settings";

/** Site settings from the DB, falling back to defaults for any missing key. Admin saves call revalidateTag(SETTINGS_TAG). */
export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  cacheLife("hours");
  const rows = await db.setting.findMany();
  const raw = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const parsed = settingsSchema.safeParse(raw);
  return parsed.success ? parsed.data : settingsSchema.parse({});
}

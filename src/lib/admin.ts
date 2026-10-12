import "server-only";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CATALOG_TAG } from "./catalog";
import { db } from "./db";
import { error } from "./http";
import { getSession } from "./session";
import { SETTINGS_TAG } from "./settings-server";

/** For admin pages: the signed-in admin, or a redirect to the admin login. Role is re-checked in the DB. */
export async function requireAdmin(next = "/admin") {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect(`/admin/login?next=${encodeURIComponent(next)}`);
  const user = await db.user.findUnique({ where: { id: session.uid }, select: { id: true, email: true, name: true, role: true } });
  if (!user || user.role !== "ADMIN") redirect(`/admin/login?next=${encodeURIComponent(next)}`);
  return user;
}

/** For /api/admin/*: returns the admin, or a ready-made 401/403 Response. */
export async function adminApi(request?: Request): Promise<{ admin: { id: string; email: string | null } } | { response: Response }> {
  if (request && request.method !== "GET") {
    const origin = request.headers.get("origin");
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (origin && (() => { try { return new URL(origin).host !== host; } catch { return true; } })()) {
      return { response: error("Forbidden", 403) };
    }
  }
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { response: error("Admin sign-in required", 401) };
  const user = await db.user.findUnique({ where: { id: session.uid }, select: { id: true, email: true, role: true } });
  if (!user || user.role !== "ADMIN") return { response: error("Not allowed", 403) };
  return { admin: { id: user.id, email: user.email } };
}

/** Make storefront pages pick up admin edits on the very next request. */
export function refreshCatalog() {
  revalidateTag(CATALOG_TAG, { expire: 0 });
}
export function refreshSettings() {
  revalidateTag(SETTINGS_TAG, { expire: 0 });
}

/** "₹1,249.50" / "1249.5" → 124950 paise. Returns NaN for junk. */
export function rupeesToPaise(input: string | number): number {
  const n = typeof input === "number" ? input : Number(String(input).replace(/[₹,\s]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}

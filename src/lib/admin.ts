import "server-only";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CATALOG_TAG } from "./catalog";
import { allowed, AREA_KEYS, gateFor, readAreas, type Access } from "./admin-access";
import { db } from "./db";
import { error } from "./http";
import { getSession } from "./session";
import { SETTINGS_TAG } from "./settings-server";

export type AdminUser = { id: string; email: string | null; name: string | null; owner: boolean; access: Access };

/** The signed-in owner or active staff member, re-checked in the DB on every request. */
async function currentAdmin(): Promise<AdminUser | null> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  const user = await db.user.findUnique({ where: { id: session.uid }, select: { id: true, email: true, name: true, role: true, permissions: true, isActive: true } });
  if (!user || !user.isActive || (user.role !== "ADMIN" && user.role !== "STAFF")) return null;
  const owner = user.role === "ADMIN";
  return { id: user.id, email: user.email, name: user.name, owner, access: { owner, areas: owner ? AREA_KEYS : readAreas(user.permissions) } };
}

/** For admin pages: the signed-in admin, a redirect to the admin login, or to the dashboard if this area isn't theirs. */
export async function requireAdmin(next = "/admin") {
  const admin = await currentAdmin();
  if (!admin) redirect(`/admin/login?next=${encodeURIComponent(next)}`);
  if (!allowed(admin.access, gateFor(next))) redirect("/admin?denied=1");
  return admin;
}

/** For /api/admin/*: returns the admin, or a ready-made 401/403 Response. Staff are limited to their areas. */
export async function adminApi(request?: Request): Promise<{ admin: AdminUser } | { response: Response }> {
  if (request && request.method !== "GET") {
    const origin = request.headers.get("origin");
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (origin && (() => { try { return new URL(origin).host !== host; } catch { return true; } })()) {
      return { response: error("Forbidden", 403) };
    }
  }
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { response: error("Admin sign-in required", 401) };
  const admin = await currentAdmin();
  if (!admin) return { response: error("Not allowed", 403) };
  if (request && !allowed(admin.access, gateFor(new URL(request.url).pathname))) {
    return { response: error("Your account doesn't have access to this", 403) };
  }
  return { admin };
}

/** Name to show in notes and the activity trail. */
export const adminName = (a: AdminUser) => a.name || a.email || "Admin";

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

// Which part of the admin each page / API belongs to, and who may open it. Pure, so the menu can use it too.

export const AREAS = [
  { key: "orders", label: "Orders", hint: "Orders, packing, shipping, returns, manual orders and abandoned carts" },
  { key: "catalog", label: "Products & offers", hint: "Products, categories, kits, coupons and automatic discounts" },
  { key: "customers", label: "Customers", hint: "Customer list and order history" },
  { key: "reviews", label: "Reviews", hint: "Approve and reply to reviews" },
  { key: "reports", label: "Reports", hint: "Sales figures, charts and CSV exports" },
] as const;

export type Area = (typeof AREAS)[number]["key"];
/** "owner" = the shop owner only (site settings, staff accounts). */
export type Gate = Area | "owner";
export const AREA_KEYS = AREAS.map((a) => a.key) as Area[];

const RULES: [prefix: string, gate: Gate][] = [
  ["/admin/settings", "owner"],
  ["/admin/staff", "owner"],
  ["/api/admin/settings", "owner"],
  ["/api/admin/staff", "owner"],
  ["/admin/reports", "reports"],
  ["/api/admin/reports", "reports"],
  ["/admin/orders", "orders"],
  ["/admin/carts", "orders"],
  ["/admin/invoice", "orders"],
  ["/admin/packing-slips", "orders"],
  ["/api/admin/orders", "orders"],
  ["/api/admin/returns", "orders"],
  ["/api/admin/carts", "orders"],
  ["/api/admin/variants", "orders"], // item search for manual orders
  ["/admin/products", "catalog"],
  ["/admin/bundles", "catalog"],
  ["/admin/coupons", "catalog"],
  ["/admin/discounts", "catalog"],
  ["/api/admin/products", "catalog"],
  ["/api/admin/categories", "catalog"],
  ["/api/admin/bundles", "catalog"],
  ["/api/admin/coupons", "catalog"],
  ["/api/admin/discounts", "catalog"],
  ["/admin/customers", "customers"],
  ["/api/admin/customers", "customers"],
  ["/admin/reviews", "reviews"],
  ["/api/admin/reviews", "reviews"],
];

/** The gate for a path, or null when any admin user may open it (dashboard, own password, sign-out). */
export function gateFor(pathname: string): Gate | null {
  const path = pathname.split("?")[0];
  for (const [prefix, gate] of RULES) if (path === prefix || path.startsWith(prefix + "/")) return gate;
  return null;
}

export type Access = { owner: boolean; areas: Area[] };

export function allowed(access: Access, gate: Gate | null) {
  if (gate === null || access.owner) return true;
  return gate !== "owner" && access.areas.includes(gate);
}

/** Clean a stored permissions value into a list of known areas. */
export function readAreas(json: unknown): Area[] {
  return Array.isArray(json) ? AREA_KEYS.filter((k) => json.includes(k)) : [];
}

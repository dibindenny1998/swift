import { z } from "zod";
import { getProductsByIds, getShopProducts, SORTS, type SortKey } from "@/lib/catalog";

const querySchema = z.object({
  category: z.string().regex(/^[a-z0-9-]+$/).optional(),
  sort: z.enum(SORTS.map((s) => s.key) as [SortKey, ...SortKey[]]).default("popular"),
  ids: z
    .string()
    .transform((s) => s.split(",").filter(Boolean).slice(0, 100))
    .optional(),
});

export async function GET(request: Request) {
  const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return Response.json({ error: "Invalid query" }, { status: 400 });
  const { category, sort, ids } = parsed.data;
  const products = ids ? await getProductsByIds(ids) : await getShopProducts(category ?? null, sort);
  return Response.json({ products });
}

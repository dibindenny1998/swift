import { z } from "zod";
import { adminApi, refreshCatalog } from "@/lib/admin";
import { uniqueError } from "@/lib/admin-products";
import { slugify } from "@/lib/csv";
import { db } from "@/lib/db";
import { error, json, readJson } from "@/lib/http";

const schema = z.object({ name: z.string().trim().min(2).max(40), imageUrl: z.string().max(500).optional() });

export async function POST(request: Request) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return error("Enter a category name");
  const max = await db.category.aggregate({ _max: { sortOrder: true } });
  try {
    const category = await db.category.create({
      data: { name: parsed.data.name, slug: slugify(parsed.data.name), imageUrl: parsed.data.imageUrl || null, sortOrder: (max._max.sortOrder ?? 0) + 1 },
    });
    refreshCatalog();
    return json({ category }, 201);
  } catch (e) {
    return error(uniqueError(e) ?? "Couldn't save", 409);
  }
}

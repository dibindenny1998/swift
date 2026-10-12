import { adminApi, refreshCatalog, rupeesToPaise } from "@/lib/admin";
import { variantInput } from "@/lib/admin-products";
import { csvObjects, slugify } from "@/lib/csv";
import { db } from "@/lib/db";
import { error, json } from "@/lib/http";

/*
  Columns (one row per variant; rows with the same slug form one product):
  slug, title, category, description, badge (NONE|NEW|BESTSELLER), live (yes/no),
  variant_name, sku, price, mrp, stock, weight_grams, image_urls (separated by |)
  Prices are in rupees. Products are matched by slug and variants by SKU, so re-importing updates them.
*/
type Row = Record<string, string>;
const MAX_ROWS = 2000;

export async function POST(request: Request) {
  const auth = await adminApi(request);
  if ("response" in auth) return auth.response;
  const text = await request.text();
  if (!text.trim()) return error("The file is empty");
  const rows = csvObjects(text);
  if (rows.length > MAX_ROWS) return error(`Import up to ${MAX_ROWS} rows at a time`);
  const required = ["title", "category", "variant_name", "sku", "price"];
  const missing = required.filter((k) => !(k in (rows[0] ?? {})));
  if (missing.length) return error(`Missing column(s): ${missing.join(", ")}`);

  const errors: { row: number; message: string }[] = [];
  const products = new Map<string, { rows: Row[]; line: number }>();
  rows.forEach((r, i) => {
    const slug = r.slug || slugify(r.title);
    if (!slug) errors.push({ row: i + 2, message: "Missing title/slug" });
    const entry = products.get(slug) ?? { rows: [], line: i + 2 };
    entry.rows.push(r);
    products.set(slug, entry);
  });

  // Validate everything before writing anything.
  const plans: { slug: string; head: Row; variants: ReturnType<typeof variantInput.parse>[]; images: string[] }[] = [];
  const seenSkus = new Set<string>();
  for (const [slug, { rows: group, line }] of products) {
    const head = group[0];
    const variants = [];
    for (const [j, r] of group.entries()) {
      const price = rupeesToPaise(r.price);
      const v = variantInput.safeParse({
        name: r.variant_name,
        sku: r.sku,
        price,
        mrp: r.mrp ? rupeesToPaise(r.mrp) : price,
        stock: Number(r.stock || 0),
        weightGrams: Number(r.weight_grams || 500),
      });
      if (!v.success) errors.push({ row: line + j, message: `${r.sku || "row"}: ${v.error.issues[0]?.message}` });
      else if (seenSkus.has(v.data.sku.toUpperCase())) errors.push({ row: line + j, message: `SKU ${v.data.sku} appears twice` });
      else {
        seenSkus.add(v.data.sku.toUpperCase());
        variants.push(v.data);
      }
    }
    const badge = (head.badge || "NONE").toUpperCase();
    if (!["NONE", "NEW", "BESTSELLER"].includes(badge)) errors.push({ row: line, message: `Unknown badge "${head.badge}"` });
    const images = (head.image_urls || "").split("|").map((u) => u.trim()).filter(Boolean);
    if (images.some((u) => !u.startsWith("https://") && !u.startsWith("/"))) errors.push({ row: line, message: "Image URLs must start with https://" });
    plans.push({ slug, head: { ...head, badge }, variants, images });
  }
  if (errors.length) return json({ ok: false, errors: errors.slice(0, 50) }, 422);

  let created = 0;
  let updated = 0;
  let variantCount = 0;
  await db.$transaction(
    async (tx) => {
      const categories = await tx.category.findMany();
      for (const p of plans) {
        const catKey = p.head.category.trim().toLowerCase();
        let cat = categories.find((c) => c.slug === slugify(catKey) || c.name.toLowerCase() === catKey);
        if (!cat) {
          cat = await tx.category.create({ data: { name: p.head.category.trim(), slug: slugify(p.head.category), sortOrder: categories.length + 1 } });
          categories.push(cat);
        }
        const data = {
          title: p.head.title,
          description: p.head.description ?? "",
          categoryId: cat.id,
          badge: p.head.badge as "NONE" | "NEW" | "BESTSELLER",
          isLive: !/^(no|false|0|hidden)$/i.test(p.head.live ?? ""),
        };
        const existing = await tx.product.findUnique({ where: { slug: p.slug } });
        const product = existing ? await tx.product.update({ where: { id: existing.id }, data }) : await tx.product.create({ data: { ...data, slug: p.slug } });
        if (existing) updated++;
        else created++;
        if (p.images.length) {
          await tx.productImage.deleteMany({ where: { productId: product.id } });
          await tx.productImage.createMany({ data: p.images.map((url, i) => ({ productId: product.id, url, alt: p.head.title, sortOrder: i })) });
        }
        for (const v of p.variants) {
          const other = await tx.variant.findUnique({ where: { sku: v.sku } });
          if (other && other.productId !== product.id) throw new Error(`SKU ${v.sku} belongs to another product`);
          const vd = { name: v.name, price: v.price, mrp: v.mrp, stock: v.stock, weightGrams: v.weightGrams };
          await tx.variant.upsert({ where: { sku: v.sku }, update: vd, create: { ...vd, sku: v.sku, productId: product.id } });
          variantCount++;
        }
      }
    },
    { timeout: 60_000 },
  ).catch((e) => {
    errors.push({ row: 0, message: e instanceof Error ? e.message : "Import failed" });
  });
  if (errors.length) return json({ ok: false, errors }, 422);

  refreshCatalog();
  return json({ ok: true, created, updated, variants: variantCount });
}

import Link from "next/link";
import { Suspense } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { AdminSkeleton, adminBtn, Empty, PageHeader, Pill, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { getSettings } from "@/lib/settings-server";

export const metadata = { title: "Products" };

export default function ProductsPage(props: PageProps<"/admin/products">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Products searchParams={props.searchParams} />
    </Suspense>
  );
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

async function Products({ searchParams }: Pick<PageProps<"/admin/products">, "searchParams">) {
  await requireAdmin("/admin/products");
  const sp = await searchParams;
  const q = one(sp.q).trim();
  const category = one(sp.category);
  const status = one(sp.status);
  const settings = await getSettings();

  const [categories, products] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
    db.product.findMany({
      where: {
        ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { variants: { some: { sku: { contains: q, mode: "insensitive" } } } }] } : {}),
        ...(category ? { categoryId: category } : {}),
        ...(status === "live" ? { isLive: true } : status === "hidden" ? { isLive: false } : {}),
        ...(status === "low" ? { variants: { some: { stock: { lte: settings.lowStockThreshold } } } } : {}),
      },
      include: { category: true, images: { take: 1, orderBy: { sortOrder: "asc" } }, variants: { orderBy: { price: "asc" } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Products"
        description={`${products.length} product${products.length === 1 ? "" : "s"}`}
        actions={
          <>
            <Link href="/admin/products/categories" className={adminBtn("secondary")}>
              Categories
            </Link>
            <Link href="/admin/products/import" className={adminBtn("secondary")}>
              Import CSV
            </Link>
            <Link href="/admin/products/new" className={adminBtn("primary")}>
              + Add product
            </Link>
          </>
        }
      />
      <form className="mb-4 flex flex-wrap gap-2" role="search">
        <label className="sr-only" htmlFor="q">
          Search
        </label>
        <input id="q" name="q" defaultValue={q} placeholder="Search title or SKU" className="h-11 min-w-0 flex-1 rounded-full border border-border bg-white px-4 text-sm" />
        <label className="sr-only" htmlFor="category">
          Category
        </label>
        <select id="category" name="category" defaultValue={category} className="h-11 rounded-full border border-border bg-white px-4 text-sm">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="status">
          Status
        </label>
        <select id="status" name="status" defaultValue={status} className="h-11 rounded-full border border-border bg-white px-4 text-sm">
          <option value="">Any status</option>
          <option value="live">Live</option>
          <option value="hidden">Hidden</option>
          <option value="low">Low stock</option>
        </select>
        <button type="submit" className={adminBtn("secondary")}>
          Filter
        </button>
      </form>

      {products.length === 0 ? (
        <Empty>No products match.</Empty>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const stock = p.variants.reduce((s, v) => s + v.stock, 0);
              const low = p.variants.some((v) => v.stock <= settings.lowStockThreshold);
              const prices = p.variants.map((v) => v.price);
              return (
                <tr key={p.id} className="hover:bg-ivory">
                  <td>
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 font-semibold">
                      <span className="relative size-11 flex-none overflow-hidden rounded-sm bg-ivory">
                        {p.images[0] && <ProductImage src={p.images[0].url} alt="" fill sizes="44px" className="object-cover" />}
                      </span>
                      <span>
                        {p.title}
                        <span className="block text-xs font-normal text-muted">
                          {p.variants.length} variant{p.variants.length === 1 ? "" : "s"}
                          {p.badge !== "NONE" && ` · ${p.badge === "NEW" ? "New" : "Bestseller"}`}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td>{p.category.name}</td>
                  <td className="tabular-nums">
                    {prices.length ? (Math.min(...prices) === Math.max(...prices) ? formatINR(prices[0]) : `${formatINR(Math.min(...prices))}–${formatINR(Math.max(...prices))}`) : "—"}
                  </td>
                  <td className="tabular-nums">{low ? <Pill tone={stock === 0 ? "red" : "gold"}>{stock} · low</Pill> : stock}</td>
                  <td>{p.isLive ? <Pill tone="green">Live</Pill> : <Pill>Hidden</Pill>}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </>
  );
}

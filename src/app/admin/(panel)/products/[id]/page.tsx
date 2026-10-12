import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { AdminSkeleton, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export const metadata = { title: "Edit product" };

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function EditProductPage(props: PageProps<"/admin/products/[id]">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <EditProduct params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function EditProduct({ params, searchParams }: Pick<PageProps<"/admin/products/[id]">, "params" | "searchParams">) {
  const { id } = await params;
  await requireAdmin(`/admin/products/${id}`);
  const created = (await searchParams).created === "1";
  const [p, categories] = await Promise.all([
    db.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } }, variants: { orderBy: { price: "asc" } } } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!p) notFound();
  return (
    <>
      <Link href="/admin/products" className="text-sm font-semibold text-muted">
        ← Products
      </Link>
      <PageHeader
        title={p.title}
        description={
          <>
            {created && <span className="font-semibold text-green-300">Created. </span>}
            <Link href={`/products/${p.slug}`} target="_blank" className="text-green-300">
              View on store ↗
            </Link>
          </>
        }
      />
      <ProductEditor
        key={p.id}
        categories={categories}
        initial={{
          id: p.id,
          title: p.title,
          slug: p.slug,
          description: p.description,
          categoryId: p.categoryId,
          badge: p.badge,
          isLive: p.isLive,
          seoTitle: p.seoTitle ?? "",
          seoDescription: p.seoDescription ?? "",
          images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
          variants: p.variants.map((v) => ({ id: v.id, name: v.name, sku: v.sku, price: v.price, mrp: v.mrp, stock: v.stock, weightGrams: v.weightGrams })),
        }}
      />
    </>
  );
}

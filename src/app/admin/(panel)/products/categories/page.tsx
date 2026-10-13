import Link from "next/link";
import { Suspense } from "react";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { AdminSkeleton, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export const metadata = { title: "Categories" };

export default function CategoriesPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Categories />
    </Suspense>
  );
}

async function Categories() {
  await requireAdmin("/admin/products/categories");
  const cats = await db.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } });
  return (
    <>
      <Link href="/admin/products" className="text-sm font-semibold text-muted">
        ← Products
      </Link>
      <PageHeader title="Categories" description="Shown as filter chips on the shop and photo tiles on the home page, in this order. Square or 4:5 photos work best." />
      <CategoryManager categories={cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug, sortOrder: c.sortOrder, count: c._count.products, imageUrl: c.imageUrl }))} />
    </>
  );
}

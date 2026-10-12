import { Suspense } from "react";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { AdminSkeleton, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export const metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <NewProduct />
    </Suspense>
  );
}

async function NewProduct() {
  await requireAdmin("/admin/products/new");
  const categories = await db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } });
  return (
    <>
      <PageHeader title="New product" />
      <ProductEditor
        categories={categories}
        initial={{
          title: "",
          slug: "",
          description: "",
          categoryId: categories[0]?.id ?? "",
          badge: "NONE",
          isLive: false,
          seoTitle: "",
          seoDescription: "",
          images: [],
          variants: [{ name: "One size", sku: "", price: 0, mrp: 0, stock: 0, weightGrams: 500 }],
        }}
      />
    </>
  );
}

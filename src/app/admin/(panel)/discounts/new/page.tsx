import Link from "next/link";
import { Suspense } from "react";
import { DiscountEditor } from "@/components/admin/DiscountEditor";
import { AdminSkeleton, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export const metadata = { title: "New automatic discount" };

export default function NewDiscountPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <NewDiscount />
    </Suspense>
  );
}

async function NewDiscount() {
  await requireAdmin("/admin/discounts/new");
  const [products, categories, bundles] = await Promise.all([
    db.product.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
    db.category.findMany({ select: { id: true, name: true }, orderBy: { sortOrder: "asc" } }),
    db.bundle.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);
  return (
    <>
      <Link href="/admin/bundles" className="text-sm font-semibold text-muted">
        ← Bundles & offers
      </Link>
      <PageHeader title="New automatic discount" description="Applied in the cart automatically — no code to type." />
      <DiscountEditor
        products={products}
        categories={categories.map((c) => ({ id: c.id, title: c.name }))}
        bundles={bundles}
        initial={{ name: "", type: "BUY_X_GET_Y", value: 100, buyQty: 2, getQty: 1, minQty: 0, minAmount: 0, scope: null, startsAt: "", endsAt: "", isActive: true }}
      />
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DiscountEditor } from "@/components/admin/DiscountEditor";
import { AdminSkeleton, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { toIstLocal } from "@/lib/admin-forms";
import { db } from "@/lib/db";

export const metadata = { title: "Edit automatic discount" };

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function EditDiscountPage(props: PageProps<"/admin/discounts/[id]">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <EditDiscount params={props.params} />
    </Suspense>
  );
}

async function EditDiscount({ params }: Pick<PageProps<"/admin/discounts/[id]">, "params">) {
  const { id } = await params;
  await requireAdmin(`/admin/discounts/${id}`);
  const [d, products, categories, bundles] = await Promise.all([
    db.autoDiscount.findUnique({ where: { id } }),
    db.product.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
    db.category.findMany({ select: { id: true, name: true }, orderBy: { sortOrder: "asc" } }),
    db.bundle.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);
  if (!d) notFound();
  const scope = d.scope as { productIds?: string[]; categoryIds?: string[]; bundleIds?: string[] } | null;
  return (
    <>
      <Link href="/admin/bundles" className="text-sm font-semibold text-muted">
        ← Bundles & offers
      </Link>
      <PageHeader title={d.name} description="Automatic discount" />
      <DiscountEditor
        key={d.id}
        products={products}
        categories={categories.map((c) => ({ id: c.id, title: c.name }))}
        bundles={bundles}
        initial={{
          id: d.id,
          name: d.name,
          type: d.type,
          value: d.value,
          buyQty: d.buyQty,
          getQty: d.getQty,
          minQty: d.minQty,
          minAmount: d.minAmount,
          scope: scope ? { productIds: scope.productIds ?? [], categoryIds: scope.categoryIds ?? [], bundleIds: scope.bundleIds ?? [] } : null,
          startsAt: toIstLocal(d.startsAt),
          endsAt: toIstLocal(d.endsAt),
          isActive: d.isActive,
        }}
      />
    </>
  );
}

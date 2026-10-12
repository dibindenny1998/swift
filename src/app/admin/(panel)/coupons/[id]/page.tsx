import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CouponEditor } from "@/components/admin/CouponEditor";
import { AdminSkeleton, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { toIstLocal } from "@/lib/admin-forms";
import { db } from "@/lib/db";

export const metadata = { title: "Edit coupon" };

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function EditCouponPage(props: PageProps<"/admin/coupons/[id]">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <EditCoupon params={props.params} />
    </Suspense>
  );
}

async function EditCoupon({ params }: Pick<PageProps<"/admin/coupons/[id]">, "params">) {
  const { id } = await params;
  await requireAdmin(`/admin/coupons/${id}`);
  const [c, products, bundles] = await Promise.all([
    db.coupon.findUnique({ where: { id }, include: { _count: { select: { uses: true } } } }),
    db.product.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
    db.bundle.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);
  if (!c) notFound();
  const scope = c.scope as { productIds?: string[]; bundleIds?: string[] } | null;
  return (
    <>
      <Link href="/admin/bundles" className="text-sm font-semibold text-muted">
        ← Bundles & offers
      </Link>
      <PageHeader title={c.code} />
      <CouponEditor
        key={c.id}
        products={products}
        bundles={bundles}
        uses={c._count.uses}
        initial={{
          id: c.id,
          code: c.code,
          type: c.type,
          value: c.value,
          minOrder: c.minOrder,
          firstOrderOnly: c.firstOrderOnly,
          scope: scope ? { productIds: scope.productIds ?? [], bundleIds: scope.bundleIds ?? [] } : null,
          usageLimit: c.usageLimit,
          perUserLimit: c.perUserLimit,
          startsAt: toIstLocal(c.startsAt),
          endsAt: toIstLocal(c.endsAt),
          isActive: c.isActive,
        }}
      />
    </>
  );
}

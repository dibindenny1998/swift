import { Suspense } from "react";
import { CouponEditor } from "@/components/admin/CouponEditor";
import { AdminSkeleton, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export const metadata = { title: "New coupon" };

export default function NewCouponPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <NewCoupon />
    </Suspense>
  );
}

async function NewCoupon() {
  await requireAdmin("/admin/coupons/new");
  const [products, bundles] = await Promise.all([
    db.product.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
    db.bundle.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);
  return (
    <>
      <PageHeader title="New coupon" />
      <CouponEditor
        products={products}
        bundles={bundles}
        uses={0}
        initial={{ code: "", type: "PERCENT", value: 10, minOrder: 0, firstOrderOnly: false, scope: null, usageLimit: null, perUserLimit: 1, startsAt: "", endsAt: "", isActive: true }}
      />
    </>
  );
}

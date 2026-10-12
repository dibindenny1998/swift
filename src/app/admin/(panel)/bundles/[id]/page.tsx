import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BundleEditor } from "@/components/admin/BundleEditor";
import { AdminSkeleton, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { variantOptions } from "@/lib/admin-forms";
import { db } from "@/lib/db";

export const metadata = { title: "Edit bundle" };

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function EditBundlePage(props: PageProps<"/admin/bundles/[id]">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <EditBundle params={props.params} />
    </Suspense>
  );
}

async function EditBundle({ params }: Pick<PageProps<"/admin/bundles/[id]">, "params">) {
  const { id } = await params;
  await requireAdmin(`/admin/bundles/${id}`);
  const [b, variants] = await Promise.all([db.bundle.findUnique({ where: { id }, include: { items: true, tiers: { orderBy: { minItems: "asc" } } } }), variantOptions()]);
  if (!b) notFound();
  return (
    <>
      <Link href="/admin/bundles" className="text-sm font-semibold text-muted">
        ← Bundles & offers
      </Link>
      <PageHeader title={b.title} />
      <BundleEditor
        key={b.id}
        variants={variants}
        initial={{
          id: b.id,
          title: b.title,
          slug: b.slug,
          description: b.description,
          type: b.type,
          discountType: b.discountType,
          discountValue: b.discountValue,
          isLive: b.isLive,
          imageUrl: b.imageUrl,
          items: b.items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
          tiers: b.tiers.map((t) => ({ minItems: t.minItems, percentOff: t.percentOff })),
        }}
      />
    </>
  );
}

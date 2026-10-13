import Link from "next/link";
import { Suspense } from "react";
import { ManualOrderForm, type Pickable } from "@/components/admin/ManualOrderForm";
import { AdminSkeleton, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { bundlePrice } from "@/lib/pricing";
import { getSettings } from "@/lib/settings-server";

export const metadata = { title: "New manual order" };

export default function NewOrderPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <NewOrder />
    </Suspense>
  );
}

async function NewOrder() {
  await requireAdmin("/admin/orders/new");
  const [settings, products, kits] = await Promise.all([
    getSettings(),
    db.product.findMany({ where: { isLive: true }, orderBy: { title: "asc" }, include: { variants: { orderBy: { price: "asc" } } } }),
    db.bundle.findMany({ where: { isLive: true, type: "FIXED" }, orderBy: { title: "asc" }, include: { items: { include: { variant: true } } } }),
  ]);
  const items: Pickable[] = [
    ...products.flatMap((p) =>
      p.variants.map((v) => ({ key: `v:${v.id}`, variantId: v.id, title: p.title, detail: p.variants.length > 1 ? v.name : null, sku: v.sku, price: v.price, stock: v.stock })),
    ),
    ...kits.map((k) => ({
      key: `b:${k.id}`,
      bundleId: k.id,
      title: k.title,
      detail: "Kit",
      sku: "",
      price: bundlePrice(k.items.map((i) => ({ price: i.variant.price, qty: i.qty })), k.discountType, k.discountValue).price,
      stock: k.items.length ? Math.min(...k.items.map((i) => Math.floor(i.variant.stock / i.qty))) : 0,
    })),
  ];
  return (
    <>
      <Link href="/admin/orders" className="text-sm font-semibold text-muted">
        ← Orders
      </Link>
      <PageHeader title="New manual order" description="For orders taken on WhatsApp, phone or in person. Stock is reserved and the order is confirmed straight away." />
      <ManualOrderForm
        items={items}
        settings={{ freeShippingThreshold: settings.freeShippingThreshold, shippingFee: settings.shippingFee, codFee: settings.codFee, giftWrapPrice: settings.giftWrapPrice }}
      />
    </>
  );
}

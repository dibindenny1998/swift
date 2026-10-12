import Link from "next/link";
import { Suspense } from "react";
import { CsvImport } from "@/components/admin/CsvImport";
import { AdminSkeleton, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";

export const metadata = { title: "Import products" };

export default function ImportPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Gate />
    </Suspense>
  );
}

async function Gate() {
  await requireAdmin("/admin/products/import");
  return (
    <>
      <Link href="/admin/products" className="text-sm font-semibold text-muted">
        ← Products
      </Link>
      <PageHeader title="Import products from CSV" />
      <CsvImport />
    </>
  );
}

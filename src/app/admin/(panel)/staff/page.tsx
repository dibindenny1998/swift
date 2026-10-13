import { Suspense } from "react";
import { StaffManager } from "@/components/admin/StaffManager";
import { AdminSkeleton, PageHeader } from "@/components/admin/ui";
import { readAreas } from "@/lib/admin-access";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export const metadata = { title: "Staff" };

export default function StaffPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Staff />
    </Suspense>
  );
}

async function Staff() {
  await requireAdmin("/admin/staff");
  const staff = await db.user.findMany({ where: { role: "STAFF" }, orderBy: { createdAt: "asc" } });
  return (
    <>
      <PageHeader title="Staff" description="Give packers and helpers their own login, limited to the parts of the admin they need." />
      <StaffManager
        staff={staff.map((s) => ({ id: s.id, name: s.name ?? "", email: s.email ?? "", areas: readAreas(s.permissions), isActive: s.isActive, createdAt: s.createdAt.toISOString() }))}
      />
    </>
  );
}

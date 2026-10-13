import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { Suspense } from "react";
import { AdminSkeleton, adminBtn, Empty, PageHeader, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { salesWhere } from "@/lib/admin-data";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";

export const metadata = { title: "Customers" };

export default function CustomersPage(props: PageProps<"/admin/customers">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Customers searchParams={props.searchParams} />
    </Suspense>
  );
}

const day = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

async function Customers({ searchParams }: Pick<PageProps<"/admin/customers">, "searchParams">) {
  await requireAdmin("/admin/customers");
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
  const where: Prisma.UserWhereInput = {
    role: "CUSTOMER",
    ...(q ? { OR: [{ phone: { contains: q.replace(/\D/g, "") || q } }, { name: { contains: q } }, { email: { contains: q } }] } : {}),
  };
  const users = await db.user.findMany({ where, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, name: true, phone: true, email: true, createdAt: true } });
  const spend = await db.order.groupBy({
    by: ["userId"],
    where: { ...salesWhere, userId: { in: users.map((u) => u.id) } },
    _sum: { total: true },
    _count: true,
  });
  const byUser = new Map(spend.map((s) => [s.userId, s]));

  return (
    <>
      <PageHeader title="Customers" description="Most recent 100 sign-ups" />
      <form className="mb-4 flex gap-2" role="search">
        <input name="q" defaultValue={q} placeholder="Phone, name or email" aria-label="Search customers" className="h-11 min-w-0 flex-1 rounded-full border border-border bg-white px-4 text-sm" />
        <button type="submit" className={adminBtn("secondary")}>
          Search
        </button>
      </form>
      {users.length === 0 ? (
        <Empty>No customers found.</Empty>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Joined</th>
              <th className="text-right">Orders</th>
              <th className="text-right">Total spend</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const s = byUser.get(u.id);
              return (
                <tr key={u.id} className="hover:bg-ivory">
                  <td>
                    <Link href={`/admin/customers/${u.id}`} className="font-semibold">
                      {u.name ?? u.phone}
                    </Link>
                    <span className="block text-xs text-muted">
                      {u.phone}
                      {u.email && ` · ${u.email}`}
                    </span>
                  </td>
                  <td className="text-xs">{day.format(u.createdAt)}</td>
                  <td className="text-right tabular-nums">{s?._count ?? 0}</td>
                  <td className="text-right tabular-nums">{formatINR(s?._sum.total ?? 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </>
  );
}

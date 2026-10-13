import Link from "next/link";
import { Suspense } from "react";
import { AdminSkeleton, Empty, PageHeader, Panel, Pill, Stat, orderStatusTone } from "@/components/admin/ui";
import { allowed, type Area } from "@/lib/admin-access";
import { requireAdmin } from "@/lib/admin";
import { getDashboard } from "@/lib/admin-data";
import { formatINR } from "@/lib/money";
import { statusLabel, type Status } from "@/lib/order-status";
import { orderLabel } from "@/lib/order-utils";
import { getSettings } from "@/lib/settings-server";

export const metadata = { title: "Dashboard" };

export default function DashboardPage(props: PageProps<"/admin">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Dashboard searchParams={props.searchParams} />
    </Suspense>
  );
}

const when = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

async function Dashboard({ searchParams }: Pick<PageProps<"/admin">, "searchParams">) {
  const admin = await requireAdmin("/admin");
  const denied = (await searchParams).denied === "1";
  const settings = await getSettings();
  const d = await getDashboard(settings.lowStockThreshold);
  const can = (area: Area) => allowed(admin.access, area);

  const todo = [
    can("orders") && d.pendingCod > 0 && { href: "/admin/orders?status=PENDING&payment=COD", text: `${d.pendingCod} COD order${d.pendingCod === 1 ? "" : "s"} to confirm` },
    can("orders") && d.openReturns > 0 && { href: "/admin/orders?returns=open", text: `${d.openReturns} return request${d.openReturns === 1 ? "" : "s"}` },
    can("orders") && d.abandoned > 0 && { href: "/admin/carts", text: `${d.abandoned} abandoned cart${d.abandoned === 1 ? "" : "s"} to follow up` },
    can("reviews") && d.pendingReviews > 0 && { href: "/admin/reviews", text: `${d.pendingReviews} review${d.pendingReviews === 1 ? "" : "s"} to approve` },
  ].filter(Boolean) as { href: string; text: string }[];

  return (
    <>
      <PageHeader title={`Welcome back${admin.name ? `, ${admin.name.split(" ")[0]}` : ""}`} description={`Signed in as ${admin.email ?? "admin"} · here's how the shop is doing.`} />
      {denied && (
        <p role="alert" className="mb-6 rounded-lg border border-gold-line bg-gold-light/30 px-4 py-3 text-sm">
          Your account can&apos;t open that page. Ask the shop owner if you need access.
        </p>
      )}

      {todo.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {todo.map((t) => (
            <Link key={t.href} href={t.href} className="rounded-full bg-gold-light/50 px-4 py-2 text-sm font-semibold text-gold-ink hover:bg-gold-light">
              {t.text} →
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Orders today" value={d.todayOrders} />
        {can("reports") && <Stat label="Revenue, last 7 days" value={formatINR(d.weekRevenue)} hint={`${d.weekOrders} orders · paid online, COD + offline`} />}
        <Stat label="Low stock" value={d.lowStockCount} hint={`Variants at or below ${settings.lowStockThreshold}`} />
        {can("reports") && <Stat label="Avg. order, 7 days" value={d.weekOrders ? formatINR(Math.round(d.weekRevenue / d.weekOrders / 100) * 100) : "—"} />}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        {can("orders") ? (
          <Panel title="Recent orders" actions={<Link href="/admin/orders" className="text-sm font-semibold text-green-300">All orders →</Link>}>
            {d.recent.length === 0 ? (
              <Empty>No orders yet.</Empty>
            ) : (
              <ul className="divide-y divide-divider">
                {d.recent.map((o) => (
                  <li key={o.id}>
                    <Link href={`/admin/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm hover:bg-ivory">
                      <span>
                        <strong>{orderLabel(o.number)}</strong> <span className="text-muted">· {o.user.name ?? o.user.phone}</span>
                        <span className="block text-xs text-muted">{when.format(o.createdAt)}</span>
                      </span>
                      <span className="flex items-center gap-3">
                        <Pill tone={orderStatusTone(o.status)}>{statusLabel(o.status as Status, o.paymentMethod)}</Pill>
                        <span className="w-20 text-right tabular-nums">{formatINR(o.total)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        ) : (
          <div />
        )}

        <div className="flex flex-col gap-4">
          <Panel title="Top products · 30 days">
            {d.top.length === 0 ? (
              <p className="text-sm text-muted">No sales yet.</p>
            ) : (
              <ol className="flex flex-col gap-2 text-sm">
                {d.top.map((t, i) => (
                  <li key={t.title} className="flex justify-between gap-2">
                    <span>
                      {i + 1}. {t.title}
                    </span>
                    <span className="tabular-nums text-muted">{t.qty} sold</span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
          <Panel title="Low stock">
            {d.lowStock.length === 0 ? (
              <p className="text-sm text-muted">Everything is well stocked.</p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {d.lowStock.map((v) => (
                  <li key={v.id}>
                    <Link href={`/admin/products/${v.productId}`} className="flex justify-between gap-2 hover:text-green-300">
                      <span>
                        {v.title} <span className="text-muted">· {v.variant}</span>
                      </span>
                      <Pill tone={v.stock === 0 ? "red" : "gold"}>{v.stock === 0 ? "Sold out" : `${v.stock} left`}</Pill>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}


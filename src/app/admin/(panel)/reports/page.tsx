import Link from "next/link";
import { Suspense } from "react";
import { SalesChart } from "@/components/admin/SalesChart";
import { AdminSkeleton, adminBtn, PageHeader, Panel } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/money";
import { getReport, RANGES, resolveRange, type Range } from "@/lib/reports";

export const metadata = { title: "Reports" };

export default function ReportsPage(props: PageProps<"/admin/reports">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Reports searchParams={props.searchParams} />
    </Suspense>
  );
}

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const dayFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const day = (iso: string) => dayFmt.format(new Date(`${iso}T00:00:00Z`));

function rangeQuery(r: Range) {
  return r.key === "custom" ? `range=custom&from=${r.first}&to=${r.last}` : `range=${r.key}`;
}

async function Reports({ searchParams }: Pick<PageProps<"/admin/reports">, "searchParams">) {
  await requireAdmin("/admin/reports");
  const sp = await searchParams;
  const r = resolveRange(one(sp.range), one(sp.from), one(sp.to));
  const d = await getReport(r);
  const q = rangeQuery(r);
  const period = r.first === r.last ? day(r.first) : `${day(r.first)} – ${day(r.last)}`;

  return (
    <>
      <PageHeader
        title="Reports"
        description={`${period} · paid online + COD orders, excluding cancelled and returned`}
        actions={
          <>
            <a href={`/api/admin/reports/export?type=orders&${q}`} className={adminBtn("secondary")}>
              Export orders
            </a>
            <a href={`/api/admin/reports/export?type=products&${q}`} className={adminBtn("secondary")}>
              Export products sold
            </a>
            <a href={`/api/admin/reports/export?type=customers`} className={adminBtn("secondary")}>
              Export customers
            </a>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-end gap-2">
        {RANGES.map((x) => (
          <Link
            key={x.key}
            href={`/admin/reports?range=${x.key}`}
            aria-current={r.key === x.key ? "page" : undefined}
            className={cn(
              "flex h-10 items-center rounded-full border px-4 text-sm font-semibold",
              r.key === x.key ? "border-green-300 bg-green-300 text-ivory" : "border-border bg-white text-text hover:border-green-300/40",
            )}
          >
            {x.label}
          </Link>
        ))}
        <form action="/admin/reports" className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="range" value="custom" />
          <label className="text-xs font-semibold text-muted">
            From
            <input type="date" name="from" defaultValue={r.first} required className="mt-1 block h-10 rounded-sm border border-border bg-white px-2 text-sm text-text" />
          </label>
          <label className="text-xs font-semibold text-muted">
            To
            <input type="date" name="to" defaultValue={r.last} required className="mt-1 block h-10 rounded-sm border border-border bg-white px-2 text-sm text-text" />
          </label>
          <button type="submit" className={cn(adminBtn(r.key === "custom" ? "primary" : "secondary"), "h-10")}>
            Apply
          </button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Sales" value={formatINR(d.now.sales)} now={d.now.sales} prev={d.prev.sales} />
        <Kpi label="Orders" value={d.now.orders.toLocaleString("en-IN")} now={d.now.orders} prev={d.prev.orders} />
        <Kpi label="Average order" value={d.now.orders ? formatINR(Math.round(d.now.aov / 100) * 100) : "—"} now={d.now.aov} prev={d.prev.aov} />
        <Kpi label="Items sold" value={d.now.items.toLocaleString("en-IN")} now={d.now.items} prev={d.prev.items} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Small label="Discounts given" value={formatINR(d.now.discounts)} />
        <Small label="Refunded" value={formatINR(d.refunded)} />
        <Small label="Cancelled / returned" value={`${d.cancelled.count} · ${formatINR(d.cancelled.value)}`} />
        <Small label="Customers" value={`${d.customers.total}`} hint={`${d.customers.new} new · ${d.customers.returning} returning`} />
      </div>

      <Panel title={d.step === 1 ? "Sales per day" : "Sales per week"} className="mt-6">
        {d.now.orders === 0 ? <p className="py-10 text-center text-sm text-muted">No sales in this period.</p> : <SalesChart buckets={d.buckets} unit={d.step === 1 ? "day" : "week"} />}
      </Panel>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Breakdown title="Top products" rows={d.products.map((p) => ({ name: p.name, value: p.revenue, note: `${p.units} sold` }))} hint="Item value before order-level discounts" />
        <Breakdown title="Sales by category" rows={d.categories.map((c) => ({ name: c.name, value: c.revenue, note: plural(c.units, "item") }))} hint="Item value before order-level discounts" />
        <Breakdown title="Payment method" rows={d.payments.map((p) => ({ name: p.name, value: p.revenue, note: plural(p.orders, "order") }))} />
        <Breakdown title="Top states" rows={d.states.map((s) => ({ name: s.name, value: s.revenue, note: plural(s.orders, "order") }))} />
        <Breakdown
          title="Coupons used"
          rows={d.coupons.map((c) => ({ name: c.name, value: c.revenue, note: `${plural(c.orders, "order")} · ${formatINR(c.discount)} off` }))}
          empty="No coupons used in this period."
        />
      </div>
    </>
  );
}

function Kpi({ label, value, now, prev }: { label: string; value: string; now: number; prev: number }) {
  const change = prev ? Math.round(((now - prev) / prev) * 100) : null;
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-2 font-display text-[30px] leading-none text-green-heading">{value}</p>
      <p className="mt-2 text-xs text-muted">
        {change === null ? (
          "No sales in the previous period"
        ) : (
          <>
            <span className={cn("font-semibold", change > 0 ? "text-green-300" : change < 0 ? "text-red-sale" : "text-muted")}>
              <span aria-hidden>{change > 0 ? "▲ " : change < 0 ? "▼ " : ""}</span>
              {change > 0 ? "+" : ""}
              {change}%
            </span>{" "}
            vs previous period
          </>
        )}
      </p>
    </div>
  );
}

function Small({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-white px-5 py-4">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

/** Ranked horizontal bars, one hue, value at the bar's end. */
function Breakdown({ title, rows, hint, empty = "No sales in this period." }: { title: string; rows: { name: string; value: number; note: string }[]; hint?: string; empty?: string }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <Panel title={title}>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((r) => (
            <li key={r.name} className="text-sm">
              <div className="flex justify-between gap-3">
                <span className="min-w-0 truncate font-medium">{r.name}</span>
                <span className="shrink-0 tabular-nums">
                  {formatINR(r.value)} <span className="text-xs text-muted">· {r.note}</span>
                </span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-divider">
                <div className="h-2 rounded-full bg-green-300" style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
      {hint && rows.length > 0 && <p className="mt-4 text-xs text-muted">{hint}</p>}
    </Panel>
  );
}

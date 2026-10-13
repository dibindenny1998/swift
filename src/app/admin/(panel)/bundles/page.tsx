import Link from "next/link";
import { Suspense } from "react";
import { AdminSkeleton, adminBtn, Empty, PageHeader, Panel, Pill, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { describeOffer } from "@/lib/auto-discounts";
import { couponStatus } from "@/lib/coupon-status";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { bundlePrice } from "@/lib/pricing";

export const metadata = { title: "Bundles & offers" };

export default function BundlesPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Bundles />
    </Suspense>
  );
}

const day = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
const tone = { active: "green", scheduled: "gold", expired: "grey", disabled: "grey", "used up": "grey" } as const;

async function Bundles() {
  await requireAdmin("/admin/bundles");
  const [bundles, coupons, offers] = await Promise.all([
    db.bundle.findMany({ include: { items: { include: { variant: true } }, tiers: { orderBy: { minItems: "asc" } } }, orderBy: { createdAt: "asc" } }),
    db.coupon.findMany({ include: { _count: { select: { uses: true } } }, orderBy: { createdAt: "desc" } }),
    db.autoDiscount.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  const kits = bundles.filter((b) => b.type === "FIXED");
  const byo = bundles.find((b) => b.type === "BUILD_YOUR_OWN");

  return (
    <>
      <PageHeader title="Bundles & offers" />
      <div className="flex flex-col gap-6">
        <Panel
          title="Signature kits"
          actions={
            <Link href="/admin/bundles/new?type=FIXED" className={adminBtn("primary")}>
              + New kit
            </Link>
          }
        >
          {kits.length === 0 ? (
            <Empty>No kits yet.</Empty>
          ) : (
            <ul className="divide-y divide-divider">
              {kits.map((k) => {
                const { price, compareAt } = bundlePrice(k.items.map((i) => ({ price: i.variant.price, qty: i.qty })), k.discountType, k.discountValue);
                return (
                  <li key={k.id}>
                    <Link href={`/admin/bundles/${k.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm hover:bg-ivory">
                      <span>
                        <strong>{k.title}</strong>
                        <span className="block text-xs text-muted">{k.items.length} items</span>
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="tabular-nums">
                          {formatINR(price)} <s className="text-muted">{formatINR(compareAt)}</s>
                        </span>
                        {k.isLive ? <Pill tone="green">Live</Pill> : <Pill>Hidden</Pill>}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel
          title="Build-your-own gift box"
          actions={
            byo ? (
              <Link href={`/admin/bundles/${byo.id}`} className={adminBtn("secondary")}>
                Edit
              </Link>
            ) : (
              <Link href="/admin/bundles/new?type=BUILD_YOUR_OWN" className={adminBtn("primary")}>
                Set up
              </Link>
            )
          }
        >
          {byo ? (
            <p className="text-sm">
              {byo.items.length} pieces to choose from · {byo.tiers.map((t) => `${t.minItems} → ${t.percentOff}% off`).join(" · ")} · {byo.isLive ? <Pill tone="green">Live</Pill> : <Pill>Hidden</Pill>}
            </p>
          ) : (
            <p className="text-sm text-muted">Not set up.</p>
          )}
        </Panel>

        <Panel
          title="Automatic discounts"
          actions={
            <Link href="/admin/discounts/new" className={adminBtn("primary")}>
              + New offer
            </Link>
          }
        >
          {offers.length === 0 ? (
            <Empty>No automatic discounts yet. Try “Buy 2 ornaments, get 1 free” or free shipping on trees.</Empty>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Offer</th>
                  <th>What it does</th>
                  <th>Dates</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((o) => {
                  const sc = o.scope as { productIds?: string[]; categoryIds?: string[]; bundleIds?: string[] } | null;
                  const n = sc ? (sc.productIds?.length ?? 0) + (sc.categoryIds?.length ?? 0) + (sc.bundleIds?.length ?? 0) : 0;
                  const st = couponStatus({ ...o, usageLimit: null }, 0);
                  return (
                    <tr key={o.id} className="hover:bg-ivory">
                      <td>
                        <Link href={`/admin/discounts/${o.id}`} className="font-semibold">
                          {o.name}
                        </Link>
                      </td>
                      <td className="text-xs text-muted">{describeOffer(o, n)}</td>
                      <td className="text-xs text-muted">
                        {o.startsAt ? day.format(o.startsAt) : "now"} – {o.endsAt ? day.format(o.endsAt) : "no end"}
                      </td>
                      <td>
                        <Pill tone={tone[st]}>{st}</Pill>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Panel>

        <Panel
          title="Coupons"
          actions={
            <Link href="/admin/coupons/new" className={adminBtn("primary")}>
              + New coupon
            </Link>
          }
        >
          {coupons.length === 0 ? (
            <Empty>No coupons yet.</Empty>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Rules</th>
                  <th>Used</th>
                  <th>Dates</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const st = couponStatus(c, c._count.uses);
                  return (
                    <tr key={c.id} className="hover:bg-ivory">
                      <td>
                        <Link href={`/admin/coupons/${c.id}`} className="font-semibold tracking-[0.06em]">
                          {c.code}
                        </Link>
                      </td>
                      <td>{c.type === "PERCENT" ? `${c.value}%` : formatINR(c.value)} off</td>
                      <td className="text-xs text-muted">
                        {[c.minOrder ? `min ${formatINR(c.minOrder)}` : null, c.firstOrderOnly ? "first order" : null, c.perUserLimit ? `${c.perUserLimit}/customer` : null, c.scope ? "selected items" : null]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </td>
                      <td className="tabular-nums">
                        {c._count.uses}
                        {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                      </td>
                      <td className="text-xs text-muted">
                        {c.startsAt ? day.format(c.startsAt) : "now"} – {c.endsAt ? day.format(c.endsAt) : "no end"}
                      </td>
                      <td>
                        <Pill tone={tone[st]}>{st}</Pill>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Panel>
      </div>
    </>
  );
}

import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { CartRemind } from "@/components/admin/CartRemind";
import { AdminSkeleton, Empty, PageHeader, Panel, Pill } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { abandonedCarts } from "@/lib/cart-server";
import { reminderText, whatsappLink } from "@/lib/cart-reminder";
import { formatINR } from "@/lib/money";
import { getSettings } from "@/lib/settings-server";

export const metadata = { title: "Abandoned carts" };

export default function CartsPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Carts />
    </Suspense>
  );
}

const ago = (d: Date) => {
  const h = Math.floor((Date.now() - d.getTime()) / 36e5);
  return h < 1 ? "just now" : h < 24 ? `${h} h ago` : `${Math.floor(h / 24)} d ago`;
};
const dayMonth = (iso: string) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

async function Carts() {
  await requireAdmin("/admin/carts");
  await connection(); // "last active … ago" depends on the current time
  const [carts, settings] = await Promise.all([abandonedCarts(), getSettings()]);
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const value = carts.reduce((s, c) => s + c.view.total, 0);

  return (
    <>
      <Link href="/admin/orders" className="text-sm font-semibold text-muted">
        ← Orders
      </Link>
      <PageHeader
        title="Abandoned carts"
        description={`${carts.length} signed-in customer${carts.length === 1 ? "" : "s"} left items in their cart in the last 30 days${carts.length ? ` · ${formatINR(value)} in total` : ""}. Guests who never signed in can't be contacted, so they aren't listed.`}
      />
      {carts.length === 0 ? (
        <Empty>No abandoned carts right now.</Empty>
      ) : (
        <Panel>
          <ul className="-m-5 divide-y divide-divider">
            {carts.map((c) => {
              const items = c.view.items.map((i) => `${i.qty > 1 ? `${i.qty} × ` : ""}${i.title}`);
              const text = reminderText({ name: c.user.name, items: c.view.items.map((i) => i.title), site, lastOrderDate: dayMonth(settings.lastOrderDate) });
              return (
                <li key={c.id} className="flex flex-wrap items-start justify-between gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      <Link href={`/admin/customers/${c.user.id}`} className="hover:text-green-300">
                        {c.user.name ?? "Customer"}
                      </Link>{" "}
                      <span className="text-sm font-normal text-muted">
                        · {c.user.phone}
                        {c.user.email && ` · ${c.user.email}`}
                      </span>
                    </p>
                    <p className="mt-1 text-sm">{items.join(", ")}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span className="text-sm font-semibold text-text">{formatINR(c.view.total)}</span>
                      <span>· last active {ago(c.updatedAt)}</span>
                      {c.view.coupon && <span>· code {c.view.coupon.code}</span>}
                      {c.remindedAt && <Pill tone="green">Reminded {ago(c.remindedAt)}</Pill>}
                      {c.view.hasIssues && <Pill tone="gold">Some items low / sold out</Pill>}
                    </p>
                  </div>
                  <CartRemind cartId={c.id} waLink={c.user.phone ? whatsappLink(c.user.phone, text) : null} hasEmail={Boolean(c.user.email)} />
                </li>
              );
            })}
          </ul>
        </Panel>
      )}
    </>
  );
}

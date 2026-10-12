import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LogoutButton, NameForm } from "@/components/account/AccountForms";
import { whatsappLink } from "@/components/account/AccountNav";
import { ProductImage } from "@/components/product/ProductImage";
import { getAccountOrders } from "@/lib/account";
import { cn } from "@/lib/cn";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/settings-server";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default function AccountPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10">
      <Suspense fallback={<div aria-hidden className="h-[60vh] animate-pulse rounded-lg bg-divider/40" />}>
        <Account />
      </Suspense>
    </div>
  );
}

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

function statusTone(status: string) {
  if (status === "DELIVERED") return "bg-green-300/10 text-green-300";
  if (status === "CANCELLED" || status === "RETURNED") return "bg-divider text-muted";
  return "bg-gold-light/50 text-gold-ink";
}

async function Account() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");
  const [user, orders, settings] = await Promise.all([
    db.user.findUnique({ where: { id: session.uid }, select: { name: true, phone: true } }),
    getAccountOrders(session.uid),
    getSettings(),
  ]);
  if (!user) redirect("/login?next=/account");
  const help = whatsappLink(settings.whatsappNumber, "Hi swift.in, I need help with my order");

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-ink">My account</p>
      <h1 className="mt-2 font-display text-[34px] font-medium leading-[1.1] text-green-heading">
        {user.name ? (
          <>
            Hello, <em>{user.name.split(" ")[0]}</em>
          </>
        ) : (
          "Hello!"
        )}
      </h1>
      <p className="mt-1 text-[15px] text-muted">{user.phone}</p>
      <NameForm initial={user.name} />

      <nav aria-label="Account" className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: "/account/addresses", label: "Addresses" },
          { href: "/wishlist", label: "Wishlist" },
          ...(help ? [{ href: help, label: "WhatsApp help", external: true }] : []),
          { href: "/shop", label: "Shop" },
        ].map((l) => (
          <Link
            key={l.label}
            href={l.href}
            {...("external" in l ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="flex min-h-14 items-center justify-center rounded-lg border border-border bg-white px-3 text-center text-[15px] font-semibold text-text transition-transform active:scale-[0.98]"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <section className="mt-10" aria-labelledby="orders-h">
        <h2 id="orders-h" className="font-display text-[26px] font-medium text-green-heading">
          Your orders
        </h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-[15px] text-muted">
            No orders yet.{" "}
            <Link href="/shop" className="font-semibold text-green-300">
              Find something lovely →
            </Link>
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {orders.map((o) => (
              <li key={o.label}>
                <Link href={`/account/orders/${o.label}`} className="flex gap-4 rounded-lg border border-border bg-white p-4 transition-transform active:scale-[0.99]">
                  <span className="flex -space-x-4">
                    {o.images.slice(0, 2).map((src, i) => (
                      <span key={i} className="relative size-14 overflow-hidden rounded-sm border-2 border-white bg-[#F1E9D6]">
                        <ProductImage src={src} alt="" fill sizes="56px" className="object-cover" />
                      </span>
                    ))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <strong className="text-[15px]">{o.label}</strong>
                      <span className={cn("flex-none whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", statusTone(o.status))}>{o.statusText}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-muted">{o.titles.join(", ")}</span>
                    <span className="mt-0.5 block text-[13px] text-muted">
                      {dateFmt.format(o.createdAt)} · {o.itemCount} item{o.itemCount === 1 ? "" : "s"} · {formatINR(o.total)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-10 border-t border-divider pt-4">
        <LogoutButton />
      </div>
    </>
  );
}

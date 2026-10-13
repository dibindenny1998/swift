"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";
import { allowed, gateFor } from "@/lib/admin-access";
import { cn } from "@/lib/cn";
import { resetAdminMe, useAdminMe } from "./admin-me";

const NAV: { href: string; label: string; exact?: boolean; also?: string[] }[] = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/carts", label: "Abandoned carts" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/bundles", label: "Bundles & offers", also: ["/admin/coupons", "/admin/discounts"] },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/settings", label: "Site settings" },
];

/** Menu entries this user can open (all of them while we're still finding out). */
function useNav() {
  const me = useAdminMe();
  return me ? NAV.filter((n) => allowed(me, gateFor(n.href))) : NAV;
}

function NavLinks({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const nav = useNav();
  return (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {nav.map((n) => {
        const active = n.exact ? pathname === n.href : pathname.startsWith(n.href) || (n.also?.some((a) => pathname.startsWith(a)) ?? false);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={cn(
              "flex min-h-11 items-center rounded-sm px-4 text-[15px] font-semibold transition-colors",
              active ? "bg-white/10 text-gold-light" : "text-on-green-muted hover:bg-white/5 hover:text-ivory",
            )}
          >
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Same links without the active state, shown while the pathname streams in. */
function NavLinksStatic() {
  const nav = useNav();
  return (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {nav.map((n) => (
        <Link key={n.href} href={n.href} className="flex min-h-11 items-center rounded-sm px-4 text-[15px] font-semibold text-on-green-muted">
          {n.label}
        </Link>
      ))}
    </nav>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const me = useAdminMe();
  const [open, setOpen] = useState(false);
  const nav = (
    <Suspense fallback={<NavLinksStatic />}>
      <NavLinks onNavigate={() => setOpen(false)} />
    </Suspense>
  );

  const footer = (
    <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-4">
      {me && (
        <p className="px-4 pb-1 text-xs text-on-green-muted">
          Signed in as <span className="font-semibold text-ivory">{me.name || me.email}</span>
          {!me.owner && " · staff"}
        </p>
      )}
      <Link href="/" target="_blank" className="flex min-h-11 items-center px-4 text-sm text-on-green-muted hover:text-ivory">
        View store ↗
      </Link>
      <button
        type="button"
        onClick={async () => {
          await fetch("/api/admin/auth/logout", { method: "POST" });
          resetAdminMe();
          router.replace("/admin/login");
        }}
        className="flex min-h-11 items-center px-4 text-left text-sm text-on-green-muted hover:text-ivory"
      >
        Log out
      </button>
    </div>
  );

  const logo = (
    <Link href="/admin" className="font-display text-[24px] font-semibold text-gold-light">
      swift<em className="font-medium text-ivory">.in</em> <span className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-on-green-muted">admin</span>
    </Link>
  );

  return (
    <div className="flex min-h-screen bg-ivory">
      <aside className="sticky top-0 hidden h-screen w-60 flex-none flex-col gap-6 bg-green-600 px-3 py-6 lg:flex">
        <div className="px-4">{logo}</div>
        {nav}
        {footer}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between bg-green-600 px-3 py-2 lg:hidden">
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="flex size-11 items-center justify-center text-ivory"
          >
            <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
          {logo}
          <span className="size-11" />
        </header>
        {open && (
          <div className="fixed inset-x-0 top-[60px] bottom-0 z-30 flex flex-col gap-4 overflow-y-auto bg-green-600 px-3 py-4 lg:hidden">
            {nav}
            {footer}
          </div>
        )}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

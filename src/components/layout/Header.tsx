"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { cn } from "@/lib/cn";
import { openCartDrawer, refreshCart, useCart } from "@/lib/cart-store";
import { setSessionUser, useSessionUser } from "@/lib/session-store";

type NavLink = { href: string; label: string };

export function Header({ categories, whatsapp }: { categories: NavLink[]; whatsapp: string }) {
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count } = useCart();
  const user = useSessionUser();

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links: NavLink[] = [
    { href: "/shop", label: "Shop all" },
    ...categories,
    { href: "/bundles", label: "Signature kits" },
    { href: "/gift-box", label: "Build a gift box" },
    { href: "/wishlist", label: "Wishlist" },
    { href: "/account", label: "Track my order" },
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b border-gold-light/30 bg-grad-header transition-shadow duration-300",
          compact && "shadow-[0_6px_20px_-10px_rgba(78,8,18,.55)]",
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-6xl items-center justify-between px-2 transition-[padding] duration-300 ease-calm",
            compact ? "py-0.5" : "py-2",
          )}
        >
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="inline-flex size-11 items-center justify-center rounded-full active:scale-[0.98]"
          >
            <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F4ECD8" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 8h16M4 16h16" />
            </svg>
          </button>
          <Link
            href="/"
            className={cn(
              "font-display font-semibold tracking-[0.01em] text-gold-light transition-[font-size] duration-300 ease-calm",
              compact ? "text-[23px]" : "text-[27px]",
            )}
          >
            swift<em className="font-medium text-ivory">.in</em>
          </Link>
          <button
            type="button"
            onClick={openCartDrawer}
            aria-label={count > 0 ? `Open cart, ${count} item${count === 1 ? "" : "s"}` : "Open cart"}
            className="relative inline-flex size-11 items-center justify-center rounded-full active:scale-[0.98]"
          >
            <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F4ECD8" strokeWidth="1.5" strokeLinejoin="round">
              <path d="M5 8h14l-1.2 12H6.2z" />
              <path d="M9 8a3 3 0 0 1 6 0" />
            </svg>
            {count > 0 && (
              <span className="absolute right-0.5 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-xs font-bold leading-none text-green-500">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>
        </div>
      </header>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" side="left">
        <nav aria-label="Main">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href} className="border-b border-divider last:border-0">
                <Link
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center justify-between text-[16px] font-semibold text-text"
                >
                  {l.label}
                  <span aria-hidden className="text-muted">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6 rounded-lg border border-border bg-white p-4">
          {user ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted">Signed in as</p>
                <p className="text-[15px] font-semibold">{user.name ?? user.phone}</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
                  setSessionUser(null);
                  await refreshCart();
                  setMenuOpen(false);
                }}
                className="min-h-11 rounded-full border border-border px-4 text-sm font-semibold text-text"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex min-h-11 items-center justify-between text-[15px] font-semibold text-green-300"
            >
              Sign in with your phone <span aria-hidden>→</span>
            </Link>
          )}
        </div>
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex min-h-12 items-center justify-center rounded-full border border-green-300/30 text-[15px] font-semibold text-green-300"
          >
            Chat with us on WhatsApp
          </a>
        )}
      </Drawer>
    </>
  );
}

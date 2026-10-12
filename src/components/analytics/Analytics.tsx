"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { analyticsConfigured, loadAnalytics, readConsent, trackPageView, writeConsent, type Consent } from "@/lib/analytics";

function PageViews() {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    // GA4 tracks SPA navigations itself (enhanced measurement); the Pixel needs a nudge.
    if (first.current) {
      first.current = false;
      return;
    }
    trackPageView();
  }, [pathname]);
  return null;
}

/** Consent banner + loader. Renders nothing when no analytics IDs are configured. */
export function Analytics() {
  const [consent, setConsent] = useState<Consent | "unknown">("unknown");

  useEffect(() => {
    if (!analyticsConfigured) return;
    const c = readConsent();
    if (c === "granted") loadAnalytics();
    // Reading localStorage must wait until after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(c);
  }, []);

  if (!analyticsConfigured) return null;

  return (
    <>
      {consent === "granted" && (
        <Suspense fallback={null}>
          <PageViews />
        </Suspense>
      )}
      {consent === null && (
        <div role="region" aria-label="Cookie consent" className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-lg rounded-lg border border-border bg-white p-4 shadow-2xl sm:bottom-5">
          <p className="text-sm text-text">
            We use cookies to understand what shoppers like and to improve our ads. Essential cookies (cart, sign-in) are always on.{" "}
            <Link href="/privacy-policy" className="font-semibold text-green-300">
              Privacy policy
            </Link>
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                writeConsent("granted");
                loadAnalytics();
                setConsent("granted");
              }}
              className="h-11 flex-1 rounded-full bg-green-300 text-sm font-semibold text-ivory"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => {
                writeConsent("denied");
                setConsent("denied");
              }}
              className="h-11 flex-1 rounded-full border border-border text-sm font-semibold text-text"
            >
              Decline
            </button>
          </div>
        </div>
      )}
    </>
  );
}

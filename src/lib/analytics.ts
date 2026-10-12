"use client";

// Consent-gated analytics. Nothing is loaded or sent until the visitor accepts.
export const GA_ID = process.env.NEXT_PUBLIC_GA4_ID ?? "";
export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
export const analyticsConfigured = Boolean(GA_ID || PIXEL_ID);

const CONSENT_KEY = "swift-consent-v1";
export type Consent = "granted" | "denied" | null;

type Gtag = (...args: unknown[]) => void;
type Fbq = ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown };
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

export function readConsent(): Consent {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function writeConsent(v: "granted" | "denied") {
  try {
    localStorage.setItem(CONSENT_KEY, v);
  } catch {
    // storage blocked: choice lasts for this visit only
  }
}

let loaded = false;

export function loadAnalytics() {
  if (loaded || !analyticsConfigured || typeof window === "undefined") return;
  loaded = true;
  if (GA_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { currency: "INR" });
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    document.head.appendChild(s);
  }
  if (PIXEL_ID) {
    // Same queueing stub as Meta's official snippet: calls are buffered until fbevents.js loads.
    const fbq = ((...args: unknown[]) => {
      if (fbq.callMethod) (fbq.callMethod as (...a: unknown[]) => void)(...args);
      else fbq.queue!.push(args);
    }) as Fbq;
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.push = fbq;
    window.fbq = window._fbq = fbq;
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
    fbq("init", PIXEL_ID);
    fbq("track", "PageView");
  }
}

export type Item = { id: string; name: string; price: number; qty: number }; // price in paise

const META_EVENT: Record<string, string> = {
  view_item: "ViewContent",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
};

/** Standard e-commerce events for GA4 and Meta Pixel. No-op without consent. */
export function track(event: "view_item" | "add_to_cart" | "begin_checkout" | "purchase", data: { items: Item[]; value: number; transactionId?: string }) {
  if (!loaded) return;
  const value = data.value / 100;
  window.gtag?.("event", event, {
    currency: "INR",
    value,
    ...(data.transactionId ? { transaction_id: data.transactionId } : {}),
    items: data.items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price / 100, quantity: i.qty })),
  });
  window.fbq?.("track", META_EVENT[event], {
    currency: "INR",
    value,
    content_type: "product",
    content_ids: data.items.map((i) => i.id),
    contents: data.items.map((i) => ({ id: i.id, quantity: i.qty })),
    num_items: data.items.reduce((n, i) => n + i.qty, 0),
  }, data.transactionId ? { eventID: data.transactionId } : undefined);
}

export function trackPageView() {
  if (!loaded) return;
  window.fbq?.("track", "PageView");
}

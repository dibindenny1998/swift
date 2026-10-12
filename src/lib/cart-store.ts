"use client";

import { useEffect, useSyncExternalStore } from "react";
import { track } from "./analytics";
import type { CartView } from "./cart-server";

// Client mirror of the server cart (/api/cart). The server prices everything; this only caches the latest view.
export type { CartView, CartLineView } from "./cart-server";

export type AddInput =
  | { variantId: string; qty?: number }
  | { bundleId: string; qty?: number }
  | { byo: { bundleId: string; picks: Record<string, number>; message?: string } };

type State = { cart: CartView | null; drawerOpen: boolean };
let state: State = { cart: null, drawerOpen: false };
let fetching: Promise<void> | null = null;
const listeners = new Set<() => void>();

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const SERVER_STATE: State = { cart: null, drawerOpen: false };

async function call(method: string, url: string, body?: unknown): Promise<CartView> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as { cart?: CartView; error?: string };
  if (!res.ok || !data.cart) throw new Error(data.error ?? "Something went wrong — please try again");
  set({ cart: data.cart });
  return data.cart;
}

// One-time move of carts saved by the earlier on-device version into the server cart.
const LEGACY_KEY = "swift-cart-v1";
async function migrateLegacy() {
  type LegacyLine = { key?: string; qty?: number; meta?: { byo?: { bundleId: string; picks: Record<string, number>; message?: string } } };
  let legacy: LegacyLine[] = [];
  try {
    legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) ?? "[]");
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    return;
  }
  for (const l of Array.isArray(legacy) ? legacy : []) {
    const qty = Math.max(1, Math.min(10, Number(l.qty) || 1));
    try {
      if (l.key?.startsWith("v:")) await call("POST", "/api/cart", { variantId: l.key.slice(2), qty });
      else if (l.key?.startsWith("b:")) await call("POST", "/api/cart", { bundleId: l.key.slice(2), qty });
      else if (l.key?.startsWith("byo:") && l.meta?.byo) await call("POST", "/api/cart", { byo: l.meta.byo });
    } catch {
      // item no longer available — skip it
    }
  }
}

export function refreshCart() {
  fetching ??= (async () => {
    try {
      await migrateLegacy();
      await call("GET", "/api/cart");
    } catch {
      // keep the last known cart
    } finally {
      fetching = null;
    }
  })();
  return fetching;
}

export function useCart() {
  const s = useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
  useEffect(() => {
    if (!state.cart) void refreshCart();
  }, []);
  return {
    cart: s.cart,
    count: s.cart?.count ?? 0,
    total: s.cart?.total ?? 0,
    ready: s.cart !== null,
  };
}

export function useCartDrawer() {
  const open = useSyncExternalStore(subscribe, () => state.drawerOpen, () => false);
  return { open, setOpen: (drawerOpen: boolean) => set({ drawerOpen }) };
}

export const openCartDrawer = () => set({ drawerOpen: true });

export async function addToCart(input: AddInput, { openDrawer = true } = {}) {
  const body = "byo" in input ? input : { ...input, qty: input.qty ?? 1 };
  const before = new Map((state.cart?.items ?? []).map((i) => [i.id, i.qty]));
  const cart = await call("POST", "/api/cart", body);
  const added = cart.items.find((i) => i.qty > (before.get(i.id) ?? 0));
  if (added) {
    const qty = added.qty - (before.get(added.id) ?? 0);
    track("add_to_cart", { items: [{ id: added.id, name: added.title, price: added.unitPrice, qty }], value: added.unitPrice * qty });
  }
  if (openDrawer) set({ drawerOpen: true });
  return cart;
}

export const updateQty = (itemId: string, qty: number) => call("PATCH", "/api/cart", { itemId, qty });
export const removeItem = (itemId: string) => call("DELETE", "/api/cart", { itemId });
export const setGift = (giftWrap: boolean, giftMessage: string | null) => call("PATCH", "/api/cart", { giftWrap, giftMessage });
export const applyCoupon = (code: string) => call("POST", "/api/cart/coupon", { code });
export const removeCoupon = () => call("DELETE", "/api/cart/coupon");

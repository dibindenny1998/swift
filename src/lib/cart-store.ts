"use client";

import { useSyncExternalStore } from "react";

// Guest cart kept in localStorage. Phase 4 swaps this for the server cart (/api/cart) and
// re-prices everything server-side; prices here are for display only.
export type CartLine = {
  key: string; // "v:<variantId>" or "b:<bundleId>"
  title: string;
  image: string;
  price: number; // paise, display only
  qty: number;
};

const KEY = "swift-cart-v1";
const EMPTY: CartLine[] = [];
let lines: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as CartLine[]) : [];
    lines = Array.isArray(parsed) ? parsed : [];
  } catch {
    lines = [];
  }
}

function commit(next: CartLine[]) {
  lines = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage blocked (private mode) — keep the in-memory cart
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    loaded = false;
    load();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  load();
  return lines;
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  const count = items.reduce((n, l) => n + l.qty, 0);
  const total = items.reduce((n, l) => n + l.qty * l.price, 0);
  return { items, count, total };
}

export function addToCart(line: Omit<CartLine, "qty">, qty = 1) {
  load();
  const existing = lines.find((l) => l.key === line.key);
  commit(
    existing
      ? lines.map((l) => (l.key === line.key ? { ...l, qty: l.qty + qty } : l))
      : [...lines, { ...line, qty }],
  );
}

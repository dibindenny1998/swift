"use client";

import { useSyncExternalStore } from "react";

// Wishlist kept on the device; mirrored to the Wishlist table once signed in.
const KEY = "swift-wishlist-v1";
const EMPTY: string[] = [];
let ids: string[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    ids = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    ids = [];
  }
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
  return ids;
}

export function useWishlist() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

function save(next: string[]) {
  ids = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // storage blocked — keep in memory
  }
  listeners.forEach((l) => l());
}

export function toggleWishlist(productId: string) {
  load();
  const removing = ids.includes(productId);
  save(removing ? ids.filter((id) => id !== productId) : [productId, ...ids]);
  // Mirror to the account when signed in; a 401 for guests is expected and ignored.
  void fetch("/api/wishlist", {
    method: removing ? "DELETE" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(removing ? { productId } : { productIds: [productId] }),
  }).catch(() => {});
}

/** After login: push on-device items to the account and adopt the merged list. */
export async function syncWishlist() {
  load();
  try {
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: ids }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { productIds: string[] };
    save(data.productIds);
  } catch {
    // offline — try again next login
  }
}

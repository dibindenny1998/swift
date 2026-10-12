"use client";

import { useSyncExternalStore } from "react";

// Wishlist kept on the device until login (phase 4 syncs it to the Wishlist table).
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

export function toggleWishlist(productId: string) {
  load();
  ids = ids.includes(productId) ? ids.filter((id) => id !== productId) : [productId, ...ids];
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // storage blocked — keep in memory
  }
  listeners.forEach((l) => l());
}

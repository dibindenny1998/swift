"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { Area } from "@/lib/admin-access";

export type AdminMe = { name: string | null; email: string | null; owner: boolean; areas: Area[] };

let me: AdminMe | null | undefined; // undefined = not loaded yet
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

function load() {
  loading ??= fetch("/api/admin/me")
    .then((r) => (r.ok ? r.json() : null))
    .then((d: AdminMe | null) => {
      me = d;
      listeners.forEach((l) => l());
    })
    .catch(() => {});
  return loading;
}

/** The signed-in admin user (for the menu); undefined while loading. */
export function useAdminMe() {
  const value = useSyncExternalStore(subscribe, () => me, () => undefined);
  useEffect(() => {
    if (me === undefined) void load();
  }, []);
  return value;
}

/** Forget the signed-in user (after logging out) so the next sign-in loads afresh. */
export function resetAdminMe() {
  me = undefined;
  loading = null;
  listeners.forEach((l) => l());
}

"use client";

import { useEffect, useSyncExternalStore } from "react";

export type SessionUser = { id: string; phone: string | null; name: string | null; role: "CUSTOMER" | "ADMIN" };

let user: SessionUser | null | undefined; // undefined = not loaded yet
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const emit = () => listeners.forEach((l) => l());

export function loadSession(force = false) {
  if (force) loading = null;
  loading ??= fetch("/api/auth/me")
    .then((r) => r.json())
    .then((d: { user: SessionUser | null }) => {
      user = d.user;
      emit();
    })
    .catch(() => {});
  return loading;
}

export function useSessionUser() {
  const u = useSyncExternalStore(subscribe, () => user, () => undefined);
  useEffect(() => {
    if (user === undefined) void loadSession();
  }, []);
  return u;
}

export function setSessionUser(next: SessionUser | null) {
  user = next;
  loading = Promise.resolve();
  emit();
}

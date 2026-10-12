"use client";

import { useEffect } from "react";
import { track, type Item } from "@/lib/analytics";

/** Fire one analytics event when mounted. `once` dedupes across reloads (e.g. purchase per order). */
export function TrackEvent({ event, items, value, transactionId, once }: { event: "view_item" | "purchase"; items: Item[]; value: number; transactionId?: string; once?: string }) {
  useEffect(() => {
    if (once) {
      try {
        if (localStorage.getItem(`tracked:${once}`)) return;
        localStorage.setItem(`tracked:${once}`, "1");
      } catch {
        // fall through and track
      }
    }
    // Consent may still be loading on first paint; give the loader a moment.
    const t = setTimeout(() => track(event, { items, value, transactionId }), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

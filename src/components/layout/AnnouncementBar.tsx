"use client";

import { useSyncExternalStore } from "react";
import { istDate } from "@/lib/ist";

const noopSubscribe = () => () => {};

/** Top strip. After the Christmas cut-off (end of lastOrderDate, IST) it switches to the New Year notice (§9). */
export function AnnouncementBar({ text, lastOrderDate }: { text: string; lastOrderDate: string }) {
  // Read the clock on the client only; the static shell always renders the normal announcement.
  const pastCutoff = useSyncExternalStore(
    noopSubscribe,
    () => Date.now() > istDate(`${lastOrderDate}T23:59:59`).getTime(),
    () => false,
  );

  const parts = (pastCutoff ? "Christmas delivery cut-off has passed — order now for New Year" : text).split("✦");

  return (
    <div className="bg-grad-announce px-4 py-[9px] text-center text-xs font-medium tracking-[0.04em] text-[#F6DDE0]">
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && (
            <span aria-hidden className="mx-1.5 text-gold-line">
              ✦
            </span>
          )}
          {p.trim()}
        </span>
      ))}
    </div>
  );
}

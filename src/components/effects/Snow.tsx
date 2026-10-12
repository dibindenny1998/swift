"use client";

import { useEffect, useRef } from "react";

// Deterministic so server and client render the same flakes.
function flakes(count: number) {
  let s = 19;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: count }, () => {
    const dur = 16 + rnd() * 14;
    return {
      left: `${(2 + rnd() * 94).toFixed(1)}%`,
      opacity: +(0.55 + rnd() * 0.4).toFixed(2),
      dur: `${dur.toFixed(1)}s`,
      delay: `${(-rnd() * dur).toFixed(1)}s`,
      sway: `${(7 + rnd() * 5).toFixed(1)}s`,
      size: Math.round(10 + rnd() * 10),
    };
  });
}

const FLAKES = flakes(26);

/** Six-armed snow crystals drifting down the viewport. Pauses while the tab is hidden. */
export function Snow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => el.toggleAttribute("data-paused", document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return (
    <div ref={ref} data-ambient aria-hidden className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {FLAKES.map((f, i) => (
        <span
          key={i}
          className="snow-flake"
          style={{ left: f.left, opacity: f.opacity, animationDuration: f.dur, animationDelay: f.delay }}
        >
          <span style={{ animationDuration: f.sway }}>
            <svg width={f.size} height={f.size}>
              <use href="#sFlake" />
            </svg>
          </span>
        </span>
      ))}
    </div>
  );
}

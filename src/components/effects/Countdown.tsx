"use client";

import { useEffect, useState } from "react";
import { countdown, istDate, type Countdown as CountdownValue } from "@/lib/ist";

const pad = (n: number) => String(n).padStart(2, "0");

/** Live countdown to an IST wall-clock time. Renders dashes until mounted so the static shell never shows stale numbers. */
export function Countdown({ target, label = "Christmas Eve in" }: { target: string; label?: string }) {
  const [value, setValue] = useState<CountdownValue | null>(null);

  useEffect(() => {
    const end = istDate(target);
    const tick = () => setValue(countdown(end));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (value?.done) {
    return <p className="font-display text-[22px] italic text-gold-light">Merry Christmas from swift.in</p>;
  }

  const cells: [string, string][] = [
    [value ? String(value.days) : "–", "days"],
    [value ? pad(value.hours) : "–", "hours"],
    [value ? pad(value.mins) : "–", "mins"],
    [value ? pad(value.secs) : "–", "secs"],
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F6C6CB]">{label}</span>
      <div
        className="flex items-stretch"
        role="timer"
        aria-label={value ? `${value.days} days, ${value.hours} hours and ${value.mins} minutes to go` : label}
      >
        {cells.map(([n, unit], i) => (
          <div key={unit} className="flex items-stretch">
            {i > 0 && <span aria-hidden className="w-px bg-gold-line/45" />}
            <div className="flex w-[74px] flex-col items-center gap-1" aria-hidden>
              <strong
                className={`font-display text-[34px] font-medium leading-none tabular-nums ${i === 3 ? "text-gold" : "text-ivory"}`}
              >
                {n}
              </strong>
              <span className="text-xs text-[#F6C6CB]">{unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

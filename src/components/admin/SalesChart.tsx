"use client";

import { useState } from "react";
import { formatINR } from "@/lib/money";

type Bucket = { from: string; to: string; sales: number; orders: number };

const dayFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const day = (iso: string) => dayFmt.format(new Date(`${iso}T00:00:00Z`));
const span = (b: Bucket) =>
  b.from === b.to ? day(b.from) : `${day(b.from)} – ${day(b.to)}`;

/** Round the axis top up to a clean rupee value (1, 2, 2.5 or 5 × 10ⁿ). */
function niceMax(paise: number) {
  const rupees = Math.max(paise / 100, 100);
  const p = 10 ** Math.floor(Math.log10(rupees));
  const m = [1, 2, 2.5, 5, 10].find((x) => x * p >= rupees) ?? 10;
  return m * p * 100;
}
const compact = (paise: number) => {
  const r = paise / 100;
  if (r >= 1e7) return `₹${+(r / 1e7).toFixed(1)}Cr`;
  if (r >= 1e5) return `₹${+(r / 1e5).toFixed(1)}L`;
  if (r >= 1e3) return `₹${+(r / 1e3).toFixed(1)}K`;
  return `₹${r}`;
};

/** Single-series column chart of sales per day (or week), with hover tooltips and a table view. */
export function SalesChart({
  buckets,
  unit,
}: {
  buckets: Bucket[];
  unit: "day" | "week";
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const max = niceMax(Math.max(...buckets.map((b) => b.sales), 0));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const labelAt = new Set([
    0,
    Math.floor((buckets.length - 1) / 2),
    buckets.length - 1,
  ]);
  const best = buckets.reduce(
    (bi, b, i) => (b.sales > buckets[bi].sales ? i : bi),
    0,
  );

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => setTable((t) => !t)}
          className="text-xs font-semibold text-green-300"
          aria-pressed={table}
        >
          {table ? "Show chart" : "Show as table"}
        </button>
      </div>

      {table ? (
        <div className="max-h-[320px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.1em] text-muted">
                <th className="py-2 font-semibold">
                  {unit === "day" ? "Day" : "Week"}
                </th>
                <th className="py-2 text-right font-semibold">Orders</th>
                <th className="py-2 text-right font-semibold">Sales</th>
              </tr>
            </thead>
            <tbody>
              {buckets.map((b) => (
                <tr key={b.from} className="border-t border-divider">
                  <td className="py-2">{span(b)}</td>
                  <td className="py-2 text-right tabular-nums">{b.orders}</td>
                  <td className="py-2 text-right tabular-nums">
                    {formatINR(b.sales)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-2">
          {/* y-axis */}
          <div
            className="relative h-[220px] w-11 shrink-0 text-right text-[11px] tabular-nums text-muted"
            aria-hidden
          >
            {ticks.map((t) => (
              <span
                key={t}
                className="absolute right-0 translate-y-1/2 leading-none"
                style={{ bottom: `${(t / max) * 100}%` }}
              >
                {compact(t)}
              </span>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="relative h-[220px]"
              role="img"
              aria-label={`Sales per ${unit}. Highest: ${span(buckets[best])}, ${formatINR(buckets[best].sales)}.`}
            >
              {ticks.map((t) => (
                <span
                  key={t}
                  aria-hidden
                  className="absolute inset-x-0 h-px bg-divider"
                  style={{ bottom: `${(t / max) * 100}%` }}
                />
              ))}
              <div
                className="absolute inset-0 flex items-end gap-[2px]"
                onMouseLeave={() => setHover(null)}
              >
                {buckets.map((b, i) => (
                  <div
                    key={b.from}
                    className="relative flex h-full min-w-0 flex-1 items-end justify-center"
                    onMouseEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    tabIndex={0}
                    aria-label={`${span(b)}: ${formatINR(b.sales)}, ${b.orders} order${b.orders === 1 ? "" : "s"}`}
                  >
                    <span
                      className={`relative block w-full max-w-6 rounded-t-[4px] transition-opacity ${hover !== null && hover !== i ? "opacity-50" : ""} ${b.sales ? "bg-green-300" : ""}`}
                      style={{
                        height: b.sales
                          ? `max(2px, ${(b.sales / max) * 100}%)`
                          : 0,
                      }}
                    >
                      {hover === i && (
                        <span
                          className={`pointer-events-none absolute bottom-full z-10 mb-1.5 whitespace-nowrap rounded-md bg-text px-3 py-2 text-xs text-ivory shadow-lg ${i > buckets.length / 2 ? "right-0" : "left-0"}`}
                        >
                          <span className="block font-semibold">{span(b)}</span>
                          <span className="block tabular-nums">
                            {formatINR(b.sales)} · {b.orders} order
                            {b.orders === 1 ? "" : "s"}
                          </span>
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="relative mt-2 h-4 text-[11px] text-muted"
              aria-hidden
            >
              {buckets.map((b, i) =>
                labelAt.has(i) ? (
                  <span
                    key={b.from}
                    className="absolute whitespace-nowrap"
                    style={
                      i === 0
                        ? { left: 0 }
                        : i === buckets.length - 1
                          ? { right: 0 }
                          : {
                              left: `${((i + 0.5) / buckets.length) * 100}%`,
                              transform: "translateX(-50%)",
                            }
                    }
                  >
                    {day(b.from)}
                  </span>
                ) : null,
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

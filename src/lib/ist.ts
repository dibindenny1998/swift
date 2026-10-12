// India Standard Time is UTC+05:30 with no DST, so a fixed offset is exact.
export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Parse "2026-12-24" or "2026-12-24T00:00" as a wall-clock time in IST. */
export function istDate(local: string): Date {
  const [d, t = "00:00"] = local.split("T");
  return new Date(`${d}T${t.length === 5 ? `${t}:00` : t}+05:30`);
}

export type Countdown = { days: number; hours: number; mins: number; secs: number; done: boolean };

export function countdown(target: Date, now: Date = new Date()): Countdown {
  const ms = Math.max(0, target.getTime() - now.getTime());
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    mins: Math.floor((s % 3600) / 60),
    secs: s % 60,
    done: ms === 0,
  };
}

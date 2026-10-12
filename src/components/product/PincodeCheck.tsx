"use client";

import { useState, type FormEvent } from "react";
import { istDate } from "@/lib/ist";

type Result =
  | { serviceable: false }
  | { serviceable: true; minDays: number; maxDays: number; cod: boolean; source: "courier" | "estimate" };

const fmt = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

function addBusinessDays(from: Date, days: number) {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) added++; // couriers don't deliver on Sundays
  }
  return d;
}

export function PincodeCheck({ weightGrams, christmas }: { weightGrams: number; christmas: string }) {
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<(Result & { checked: string }) | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!/^[1-9]\d{5}$/.test(pincode)) {
      setState("error");
      setError("Enter a valid 6-digit pincode");
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/pincode-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode, weightGrams }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't check that pincode");
      setResult({ ...(data as Result), checked: pincode });
      setState("idle");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Couldn't check that pincode");
    }
  }

  let message: React.ReactNode = null;
  if (result && !result.serviceable) {
    message = <p className="text-sm text-red-sale">Sorry, we can&apos;t deliver to {result.checked} yet.</p>;
  } else if (result?.serviceable) {
    const now = new Date();
    const by = addBusinessDays(now, result.maxDays);
    const beforeChristmas = by.getTime() < istDate(christmas).getTime();
    message = (
      <div className="flex flex-col gap-1 text-sm">
        <p className="font-semibold text-green-300">
          {result.source === "courier" ? "Delivery by " : "Usually arrives by "}
          {fmt.format(by)}
          {beforeChristmas && <span className="font-normal text-muted"> · in time for Christmas</span>}
        </p>
        <p className="text-muted">
          {result.minDays}–{result.maxDays} business days to {result.checked}
          {result.cod ? " · Cash on delivery available" : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-2" noValidate>
        <label htmlFor="pincode" className="text-[13px] font-semibold">
          Check delivery date
        </label>
        <div className="flex gap-2">
          <input
            id="pincode"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            placeholder="Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            aria-invalid={state === "error" || undefined}
            aria-describedby={state === "error" ? "pincode-error" : undefined}
            className="h-11 min-w-0 flex-1 rounded-full border border-border bg-ivory px-4 text-[15px] tracking-[0.08em] outline-none focus:border-green-200"
          />
          <button
            type="submit"
            disabled={state === "loading"}
            className="h-11 rounded-full border border-green-300 px-5 text-sm font-semibold text-green-300 hover:bg-green-300/5 active:scale-[0.98] disabled:opacity-60"
          >
            {state === "loading" ? "Checking…" : "Check"}
          </button>
        </div>
        {state === "error" && (
          <p id="pincode-error" className="text-xs text-red-sale">
            {error}
          </p>
        )}
      </form>
      <div aria-live="polite" className={message ? "mt-3" : undefined}>
        {message}
      </div>
    </div>
  );
}

"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const box = "w-full rounded-sm border border-border bg-white px-3 text-[15px] outline-none transition-colors focus:border-green-200";

function Wrap({ label, hint, error, id, children, className }: { label: string; hint?: ReactNode; error?: string; id: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[13px] font-semibold">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-red-sale">{error}</p> : hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

type Base = { label: string; hint?: ReactNode; error?: string; className?: string };

export function TextField({ label, hint, error, className, ...props }: Base & ComponentProps<"input">) {
  const id = useId();
  return (
    <Wrap label={label} hint={hint} error={error} id={id} className={className}>
      <input id={id} className={cn(box, "h-11")} {...props} />
    </Wrap>
  );
}

export function TextArea({ label, hint, error, className, ...props }: Base & ComponentProps<"textarea">) {
  const id = useId();
  return (
    <Wrap label={label} hint={hint} error={error} id={id} className={className}>
      <textarea id={id} className={cn(box, "py-2.5")} rows={4} {...props} />
    </Wrap>
  );
}

export function SelectField({ label, hint, error, className, children, ...props }: Base & ComponentProps<"select">) {
  const id = useId();
  return (
    <Wrap label={label} hint={hint} error={error} id={id} className={className}>
      <select id={id} className={cn(box, "h-11")} {...props}>
        {children}
      </select>
    </Wrap>
  );
}

/** Rupee input that reads/writes paise. */
export function MoneyField({ label, hint, error, className, value, onChange, ...props }: Base & { value: number; onChange: (paise: number) => void } & Omit<ComponentProps<"input">, "value" | "onChange">) {
  const id = useId();
  return (
    <Wrap label={label} hint={hint} error={error} id={id} className={className}>
      <div className={cn(box, "flex h-11 items-center gap-1")}>
        <span className="text-muted">₹</span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          value={Number.isFinite(value) ? value / 100 : ""}
          onChange={(e) => onChange(Math.round(Number(e.target.value) * 100))}
          className="h-full w-full bg-transparent outline-none"
          {...props}
        />
      </div>
    </Wrap>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: ReactNode }) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p id={id} className="text-[15px] font-semibold">
          {label}
        </p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={id}
        onClick={() => onChange(!checked)}
        className={cn("relative h-8 w-14 flex-none rounded-full transition-colors", checked ? "bg-green-300" : "bg-divider")}
      >
        <span className={cn("absolute top-1 size-6 rounded-full bg-white shadow transition-[left]", checked ? "left-7" : "left-1")} />
      </button>
    </div>
  );
}

export async function adminFetch<T = unknown>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  return data as T;
}

export function SaveBar({ busy, message, error, onSave, label = "Save changes", extra }: { busy: boolean; message?: string; error?: string; onSave: () => void; label?: string; extra?: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-divider bg-ivory/95 px-4 py-3 backdrop-blur lg:-mx-8 lg:px-8">
      <p className={cn("mr-auto text-sm", error ? "text-red-sale" : "text-green-300")} role={error ? "alert" : "status"}>
        {error || message}
      </p>
      {extra}
      <button
        type="button"
        onClick={onSave}
        disabled={busy}
        className="inline-flex h-11 items-center rounded-full bg-green-300 px-6 text-sm font-semibold text-ivory transition-transform active:scale-[0.98] disabled:opacity-50"
      >
        {busy ? "Saving…" : label}
      </button>
    </div>
  );
}

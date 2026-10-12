"use client";

import { useState, type FormEvent } from "react";
import { INDIAN_STATES } from "@/lib/india";

export type Address = {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

const field = "h-12 w-full rounded-sm border bg-white px-4 text-[15px] outline-none transition-colors focus:border-green-200";

export function AddressForm({ defaultPhone, onSaved, onCancel }: { defaultPhone?: string; onSaved: (a: Address) => void; onCancel?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [formError, setFormError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = Object.fromEntries(["name", "phone", "line1", "line2", "city", "state", "pincode"].map((k) => [k, String(f.get(k) ?? "")]));
    setBusy(true);
    setErrors({});
    setFormError("");
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, isDefault: f.get("isDefault") === "on" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.fields ?? {});
        setFormError(data.error ?? "Please check the address");
        return;
      }
      onSaved(data.address as Address);
    } catch {
      setFormError("Couldn't save — check your connection");
    } finally {
      setBusy(false);
    }
  }

  const err = (k: string) => errors[k]?.[0];
  const input = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`addr-${name}`} className="text-[13px] font-semibold">
        {label}
      </label>
      <input
        id={`addr-${name}`}
        name={name}
        aria-invalid={err(name) ? true : undefined}
        aria-describedby={err(name) ? `addr-${name}-err` : undefined}
        className={`${field} ${err(name) ? "border-red-sale" : "border-border"}`}
        {...props}
      />
      {err(name) && (
        <p id={`addr-${name}-err`} className="text-xs text-red-sale">
          {err(name)}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {input("name", "Full name", { autoComplete: "name", required: true })}
      {input("phone", "Mobile number", { autoComplete: "tel-national", inputMode: "tel", defaultValue: defaultPhone?.replace(/^\+91/, ""), required: true })}
      {input("line1", "House / flat, street", { autoComplete: "address-line1", required: true })}
      {input("line2", "Area, landmark (optional)", { autoComplete: "address-line2" })}
      <div className="grid grid-cols-2 gap-3">
        {input("pincode", "Pincode", { autoComplete: "postal-code", inputMode: "numeric", maxLength: 6, required: true })}
        {input("city", "City", { autoComplete: "address-level2", required: true })}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="addr-state" className="text-[13px] font-semibold">
          State
        </label>
        <select
          id="addr-state"
          name="state"
          defaultValue="Karnataka"
          autoComplete="address-level1"
          className={`${field} ${err("state") ? "border-red-sale" : "border-border"}`}
        >
          {INDIAN_STATES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <label className="flex min-h-11 items-center gap-3 text-[15px]">
        <input type="checkbox" name="isDefault" defaultChecked className="size-5 accent-[#0B5E3E]" />
        Make this my default address
      </label>
      {formError && (
        <p role="alert" className="text-sm text-red-sale">
          {formError}
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={busy}
          className="h-12 flex-1 rounded-full bg-green-300 text-[15px] font-semibold text-ivory active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save address"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="h-12 rounded-full border border-border px-6 text-[15px] font-semibold">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

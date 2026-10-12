"use client";

import { useEffect, useState } from "react";
import { AddressForm, type Address } from "@/components/checkout/AddressForm";

export function AddressBook({ phone }: { phone: string | null }) {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [error, setError] = useState("");

  const load = () =>
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((d: { addresses: Address[] }) => setAddresses(d.addresses))
      .catch(() => setError("Couldn't load your addresses"));

  useEffect(() => {
    void load();
  }, []);

  const act = async (url: string, method: string, body?: unknown) => {
    setError("");
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    if (!res.ok) setError(((await res.json().catch(() => ({}))) as { error?: string }).error ?? "Something went wrong");
    await load();
  };

  if (!addresses) return <div aria-hidden className="mt-6 h-40 animate-pulse rounded-lg bg-divider/60" />;

  return (
    <div className="mt-6 flex flex-col gap-3">
      {error && (
        <p role="alert" className="text-sm text-red-sale">
          {error}
        </p>
      )}
      {addresses.length === 0 && editing !== "new" && <p className="text-[15px] text-muted">No saved addresses yet.</p>}
      {addresses.map((a) =>
        editing === a.id ? (
          <div key={a.id} className="rounded-lg border border-border bg-white p-5">
            <AddressForm initial={a} onSaved={() => (setEditing(null), load())} onCancel={() => setEditing(null)} />
          </div>
        ) : (
          <div key={a.id} className="rounded-lg border border-border bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[15px]">
                <strong className="block">
                  {a.name}
                  {a.isDefault && <span className="ml-2 rounded-full bg-green-300/10 px-2 py-0.5 text-xs font-semibold text-green-300">Default</span>}
                </strong>
                <span className="text-muted">
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
                </span>
                <span className="block text-[13px] text-muted">{a.phone}</span>
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5">
              <button type="button" onClick={() => setEditing(a.id)} className="min-h-11 text-sm font-semibold text-green-300">
                Edit
              </button>
              {!a.isDefault && (
                <button type="button" onClick={() => act(`/api/addresses/${a.id}`, "PATCH", { isDefault: true })} className="min-h-11 text-sm font-semibold text-green-300">
                  Make default
                </button>
              )}
              <button
                type="button"
                onClick={() => confirm("Delete this address?") && act(`/api/addresses/${a.id}`, "DELETE")}
                className="min-h-11 text-sm font-semibold text-muted hover:text-red-sale"
              >
                Delete
              </button>
            </div>
          </div>
        ),
      )}
      {editing === "new" ? (
        <div className="rounded-lg border border-border bg-white p-5">
          <AddressForm defaultPhone={phone ?? undefined} onSaved={() => (setEditing(null), load())} onCancel={() => setEditing(null)} />
        </div>
      ) : (
        <button type="button" onClick={() => setEditing("new")} className="flex h-12 items-center justify-center rounded-full border border-green-300 text-[15px] font-semibold text-green-300">
          + Add a new address
        </button>
      )}
    </div>
  );
}

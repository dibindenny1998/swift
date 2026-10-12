"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFetch, MoneyField, SaveBar, SelectField, TextField, Toggle } from "./fields";
import { adminBtn, Panel } from "./ui";

export type CouponForm = {
  id?: string;
  code: string;
  type: "PERCENT" | "FLAT";
  value: number;
  minOrder: number;
  firstOrderOnly: boolean;
  scope: { productIds: string[]; bundleIds: string[] } | null;
  usageLimit: number | null;
  perUserLimit: number | null;
  startsAt: string; // datetime-local in IST
  endsAt: string;
  isActive: boolean;
};

// <input type="datetime-local"> has no zone; we treat it as IST.
const toIso = (local: string) => (local ? new Date(`${local}:00+05:30`).toISOString() : null);

export function CouponEditor({ initial, products, bundles, uses }: { initial: CouponForm; products: { id: string; title: string }[]; bundles: { id: string; title: string }[]; uses: number }) {
  const router = useRouter();
  const [c, setC] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const set = <K extends keyof CouponForm>(k: K, v: CouponForm[K]) => setC((x) => ({ ...x, [k]: v }));
  const scoped = c.scope !== null;
  const toggleIn = (list: "productIds" | "bundleIds", id: string) => {
    const s = c.scope ?? { productIds: [], bundleIds: [] };
    set("scope", { ...s, [list]: s[list].includes(id) ? s[list].filter((x) => x !== id) : [...s[list], id] });
  };

  async function save() {
    setBusy(true);
    setMessage("");
    setError("");
    const body = { ...c, startsAt: toIso(c.startsAt), endsAt: toIso(c.endsAt) };
    try {
      if (c.id) {
        await adminFetch("PATCH", `/api/admin/coupons/${c.id}`, body);
        setMessage("Saved.");
        router.refresh();
      } else {
        const { coupon } = await adminFetch<{ coupon: { id: string } }>("POST", "/api/admin/coupons", body);
        router.replace(`/admin/coupons/${coupon.id}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Code & discount">
          <div className="grid gap-4">
            <TextField label="Code" value={c.code} onChange={(e) => set("code", e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))} hint="Customers type this at checkout" />
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Type" value={c.type} onChange={(e) => setC((x) => ({ ...x, type: e.target.value as CouponForm["type"], value: 0 }))}>
                <option value="PERCENT">% off</option>
                <option value="FLAT">Flat ₹ off</option>
              </SelectField>
              {c.type === "PERCENT" ? (
                <TextField label="Percent" type="number" min={1} max={90} value={c.value} onChange={(e) => set("value", Math.floor(Number(e.target.value)))} />
              ) : (
                <MoneyField label="Amount" value={c.value} onChange={(n) => set("value", n)} />
              )}
            </div>
            <MoneyField label="Minimum order" value={c.minOrder} onChange={(n) => set("minOrder", n)} hint="₹0 for no minimum" />
          </div>
        </Panel>
        <Panel title="Rules">
          <div className="grid gap-4">
            <Toggle label="Active" checked={c.isActive} onChange={(v) => set("isActive", v)} />
            <Toggle label="First order only" checked={c.firstOrderOnly} onChange={(v) => set("firstOrderOnly", v)} hint="Customers must sign in to use it" />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Total uses" type="number" min={1} placeholder="Unlimited" value={c.usageLimit ?? ""} onChange={(e) => set("usageLimit", e.target.value ? Math.floor(Number(e.target.value)) : null)} hint={`${uses} used so far`} />
              <TextField label="Uses per customer" type="number" min={1} placeholder="Unlimited" value={c.perUserLimit ?? ""} onChange={(e) => set("perUserLimit", e.target.value ? Math.floor(Number(e.target.value)) : null)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Starts (IST)" type="datetime-local" value={c.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
              <TextField label="Ends (IST)" type="datetime-local" value={c.endsAt} onChange={(e) => set("endsAt", e.target.value)} hint="Shown as a real end date — never a fake timer" />
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Applies to">
        <Toggle label="Only selected products / kits" checked={scoped} onChange={(v) => set("scope", v ? { productIds: [], bundleIds: [] } : null)} hint={scoped ? "Discount applies only to these lines" : "Whole cart"} />
        {scoped && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <fieldset>
              <legend className="text-[13px] font-semibold">Products</legend>
              <div className="mt-2 max-h-64 overflow-y-auto rounded-sm border border-divider p-2">
                {products.map((p) => (
                  <label key={p.id} className="flex min-h-10 items-center gap-2 text-sm">
                    <input type="checkbox" checked={c.scope!.productIds.includes(p.id)} onChange={() => toggleIn("productIds", p.id)} className="size-4 accent-[#0B5E3E]" />
                    {p.title}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-[13px] font-semibold">Kits & gift box</legend>
              <div className="mt-2 max-h-64 overflow-y-auto rounded-sm border border-divider p-2">
                {bundles.map((b) => (
                  <label key={b.id} className="flex min-h-10 items-center gap-2 text-sm">
                    <input type="checkbox" checked={c.scope!.bundleIds.includes(b.id)} onChange={() => toggleIn("bundleIds", b.id)} className="size-4 accent-[#0B5E3E]" />
                    {b.title}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}
      </Panel>

      <SaveBar
        busy={busy}
        message={message}
        error={error}
        onSave={save}
        label={c.id ? "Save changes" : "Create coupon"}
        extra={
          c.id ? (
            <button
              type="button"
              className={adminBtn("danger")}
              onClick={async () => {
                if (!confirm(`Delete ${c.code}? (Used codes are disabled instead.)`)) return;
                await adminFetch("DELETE", `/api/admin/coupons/${c.id}`).catch(() => {});
                router.replace("/admin/bundles");
              }}
            >
              Delete
            </button>
          ) : null
        }
      />
    </div>
  );
}

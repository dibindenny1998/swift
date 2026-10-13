"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { describeOffer } from "@/lib/auto-discounts";
import { adminFetch, MoneyField, SaveBar, SelectField, TextField, Toggle } from "./fields";
import { adminBtn, Panel } from "./ui";

type Scope = { productIds: string[]; categoryIds: string[]; bundleIds: string[] };
export type DiscountForm = {
  id?: string;
  name: string;
  type: "PERCENT" | "FLAT" | "BUY_X_GET_Y" | "FREE_SHIPPING";
  value: number;
  buyQty: number;
  getQty: number;
  minQty: number;
  minAmount: number;
  scope: Scope | null;
  startsAt: string; // datetime-local, IST
  endsAt: string;
  isActive: boolean;
};
type Option = { id: string; title: string };

const toIso = (local: string) => (local ? new Date(`${local}:00+05:30`).toISOString() : null);
const num = (v: string) => Math.max(0, Math.floor(Number(v) || 0));

export function DiscountEditor({ initial, products, categories, bundles }: { initial: DiscountForm; products: Option[]; categories: Option[]; bundles: Option[] }) {
  const router = useRouter();
  const [d, setD] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const set = <K extends keyof DiscountForm>(k: K, v: DiscountForm[K]) => setD((x) => ({ ...x, [k]: v }));
  const scoped = d.scope !== null;
  const toggleIn = (list: keyof Scope, id: string) => {
    const s = d.scope ?? { productIds: [], categoryIds: [], bundleIds: [] };
    set("scope", { ...s, [list]: s[list].includes(id) ? s[list].filter((x) => x !== id) : [...s[list], id] });
  };
  const scopeCount = d.scope ? d.scope.productIds.length + d.scope.categoryIds.length + d.scope.bundleIds.length : 0;

  async function save() {
    setBusy(true);
    setMessage("");
    setError("");
    const body = { ...d, startsAt: toIso(d.startsAt), endsAt: toIso(d.endsAt) };
    try {
      if (d.id) {
        await adminFetch("PATCH", `/api/admin/discounts/${d.id}`, body);
        setMessage("Saved — carts pick it up straight away.");
        router.refresh();
      } else {
        const { discount } = await adminFetch<{ discount: { id: string } }>("POST", "/api/admin/discounts", body);
        router.replace(`/admin/discounts/${discount.id}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setBusy(false);
    }
  }

  const list = (title: string, key: keyof Scope, options: Option[]) => (
    <fieldset>
      <legend className="text-[13px] font-semibold">{title}</legend>
      <div className="mt-2 max-h-64 overflow-y-auto rounded-sm border border-divider p-2">
        {options.map((o) => (
          <label key={o.id} className="flex min-h-10 items-center gap-2 text-sm">
            <input type="checkbox" checked={d.scope![key].includes(o.id)} onChange={() => toggleIn(key, o.id)} className="size-4 accent-[#0B5E3E]" />
            {o.title}
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Offer">
          <div className="grid gap-4">
            <TextField label="Name" value={d.name} maxLength={80} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Buy 2 ornaments, get 1 free" hint="Shown to customers in the cart and at checkout" />
            <SelectField label="Type" value={d.type} onChange={(e) => setD((x) => ({ ...x, type: e.target.value as DiscountForm["type"], value: e.target.value === "BUY_X_GET_Y" ? 100 : e.target.value === "PERCENT" ? 10 : 0 }))}>
              <option value="BUY_X_GET_Y">Buy X, get Y free (or % off)</option>
              <option value="PERCENT">% off</option>
              <option value="FLAT">Flat ₹ off</option>
              <option value="FREE_SHIPPING">Free shipping</option>
            </SelectField>
            {d.type === "BUY_X_GET_Y" && (
              <div className="grid grid-cols-3 gap-3">
                <TextField label="Buy" type="number" min={1} max={20} value={d.buyQty} onChange={(e) => set("buyQty", num(e.target.value))} />
                <TextField label="Get" type="number" min={1} max={20} value={d.getQty} onChange={(e) => set("getQty", num(e.target.value))} />
                <TextField label="% off those" type="number" min={1} max={100} value={d.value} onChange={(e) => set("value", num(e.target.value))} hint="100 = free" />
              </div>
            )}
            {d.type === "PERCENT" && <TextField label="Percent off" type="number" min={1} max={90} value={d.value} onChange={(e) => set("value", num(e.target.value))} />}
            {d.type === "FLAT" && <MoneyField label="Amount off" value={d.value} onChange={(n) => set("value", n)} />}
            {d.type === "BUY_X_GET_Y" && <p className="text-xs text-muted">The cheapest items in each group are the discounted ones. It repeats: buy 2 get 1 on 6 items gives 2 free.</p>}
          </div>
        </Panel>
        <Panel title="When it applies">
          <div className="grid gap-4">
            <Toggle label="Active" checked={d.isActive} onChange={(v) => set("isActive", v)} />
            {d.type !== "BUY_X_GET_Y" && (
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Minimum items" type="number" min={0} value={d.minQty} onChange={(e) => set("minQty", num(e.target.value))} hint="0 for no minimum" />
                <MoneyField label="Minimum spend" value={d.minAmount} onChange={(n) => set("minAmount", n)} hint="On the eligible items" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Starts (IST)" type="datetime-local" value={d.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
              <TextField label="Ends (IST)" type="datetime-local" value={d.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
            </div>
            <p className="rounded-sm bg-ivory px-3 py-2 text-sm">
              <span className="font-semibold">Preview:</span> {describeOffer(d, scopeCount)}
            </p>
            <p className="text-xs text-muted">If several offers qualify, the customer gets the biggest one (plus any free-shipping offer). Coupons still work on top.</p>
          </div>
        </Panel>
      </div>

      <Panel title="Applies to">
        <Toggle
          label="Only selected categories / products / kits"
          checked={scoped}
          onChange={(v) => set("scope", v ? { productIds: [], categoryIds: [], bundleIds: [] } : null)}
          hint={scoped ? "Only these count towards the offer" : "Everything in the cart"}
        />
        {scoped && (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {list("Categories", "categoryIds", categories)}
            {list("Products", "productIds", products)}
            {list("Kits & gift box", "bundleIds", bundles)}
          </div>
        )}
      </Panel>

      <SaveBar
        busy={busy}
        message={message}
        error={error}
        onSave={save}
        label={d.id ? "Save changes" : "Create offer"}
        extra={
          d.id ? (
            <button
              type="button"
              className={adminBtn("danger")}
              onClick={async () => {
                if (!confirm(`Delete “${d.name}”?`)) return;
                await adminFetch("DELETE", `/api/admin/discounts/${d.id}`).catch(() => {});
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

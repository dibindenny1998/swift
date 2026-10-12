"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { slugify } from "@/lib/csv";
import { formatINR, percentOff } from "@/lib/money";
import { bundlePrice } from "@/lib/pricing";
import { adminFetch, MoneyField, SaveBar, SelectField, TextArea, TextField, Toggle } from "./fields";
import { ImageManager } from "./ImageManager";
import { adminBtn, Panel } from "./ui";

export type VariantOption = { id: string; label: string; price: number; stock: number };
export type BundleForm = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  type: "FIXED" | "BUILD_YOUR_OWN";
  discountType: "PERCENT" | "FLAT" | "FIXED_PRICE";
  discountValue: number;
  isLive: boolean;
  imageUrl: string | null;
  items: { variantId: string; qty: number }[];
  tiers: { minItems: number; percentOff: number }[];
};

export function BundleEditor({ initial, variants }: { initial: BundleForm; variants: VariantOption[] }) {
  const router = useRouter();
  const [b, setB] = useState(initial);
  const [pick, setPick] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const set = <K extends keyof BundleForm>(k: K, v: BundleForm[K]) => setB((x) => ({ ...x, [k]: v }));
  const byId = useMemo(() => new Map(variants.map((v) => [v.id, v])), [variants]);
  const isKit = b.type === "FIXED";

  const preview = bundlePrice(
    b.items.map((i) => ({ price: byId.get(i.variantId)?.price ?? 0, qty: i.qty })),
    b.discountType,
    b.discountValue,
  );

  async function save() {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      if (b.id) {
        await adminFetch("PATCH", `/api/admin/bundles/${b.id}`, b);
        setMessage("Saved — live on the store now.");
        router.refresh();
      } else {
        const { bundle } = await adminFetch<{ bundle: { id: string } }>("POST", "/api/admin/bundles", b);
        router.replace(`/admin/bundles/${bundle.id}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <Panel title="Details">
          <div className="grid gap-4">
            <TextField label="Title" value={b.title} onChange={(e) => setB((x) => ({ ...x, title: e.target.value, slug: x.id ? x.slug : slugify(e.target.value) }))} />
            <TextField label="URL slug" value={b.slug} onChange={(e) => set("slug", slugify(e.target.value))} hint={isKit ? `swift.in/bundles/${b.slug || "…"}` : "Shown at swift.in/gift-box"} />
            <TextArea label={isKit ? "One-line contents" : "Description"} rows={2} maxLength={300} value={b.description} onChange={(e) => set("description", e.target.value)} />
          </div>
        </Panel>
        <Panel title="Status">
          <Toggle label="Live on the store" checked={b.isLive} onChange={(v) => set("isLive", v)} />
        </Panel>
      </div>

      <Panel title="Image">
        <ImageManager max={1} images={b.imageUrl ? [{ url: b.imageUrl, alt: b.title }] : []} onChange={(imgs) => set("imageUrl", imgs[0]?.url ?? null)} />
      </Panel>

      <Panel title={isKit ? "What's in the kit" : "Pieces customers can choose"}>
        <div className="flex flex-col gap-2">
          {b.items.map((it, i) => {
            const v = byId.get(it.variantId);
            return (
              <div key={it.variantId} className="flex flex-wrap items-center gap-3 rounded-sm border border-divider px-3 py-2 text-sm">
                <span className="min-w-0 flex-1">
                  {v?.label ?? "Removed variant"} <span className="text-muted">· {formatINR(v?.price ?? 0)} · {v?.stock ?? 0} in stock</span>
                </span>
                {isKit && (
                  <label className="flex items-center gap-2">
                    Qty
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={it.qty}
                      onChange={(e) => set("items", b.items.map((x, j) => (j === i ? { ...x, qty: Math.max(1, Number(e.target.value) || 1) } : x)))}
                      className="h-9 w-16 rounded-sm border border-border px-2"
                    />
                  </label>
                )}
                <button type="button" onClick={() => set("items", b.items.filter((_, j) => j !== i))} className="text-xs font-semibold text-red-sale">
                  Remove
                </button>
              </div>
            );
          })}
          <div className="flex gap-2">
            <label htmlFor="add-variant" className="sr-only">
              Add a product
            </label>
            <select id="add-variant" value={pick} onChange={(e) => setPick(e.target.value)} className="h-11 min-w-0 flex-1 rounded-sm border border-border bg-white px-3 text-sm">
              <option value="">Add a product…</option>
              {variants
                .filter((v) => !b.items.some((i) => i.variantId === v.id))
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label} · {formatINR(v.price)}
                  </option>
                ))}
            </select>
            <button
              type="button"
              disabled={!pick}
              onClick={() => {
                set("items", [...b.items, { variantId: pick, qty: 1 }]);
                setPick("");
              }}
              className={adminBtn("secondary")}
            >
              Add
            </button>
          </div>
        </div>
      </Panel>

      {isKit ? (
        <Panel title="Kit price">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Discount type" value={b.discountType} onChange={(e) => setB((x) => ({ ...x, discountType: e.target.value as BundleForm["discountType"], discountValue: 0 }))}>
              <option value="PERCENT">% off the items</option>
              <option value="FLAT">Flat ₹ off</option>
              <option value="FIXED_PRICE">Fixed kit price</option>
            </SelectField>
            {b.discountType === "PERCENT" ? (
              <TextField label="Percent off" type="number" min={0} max={90} value={b.discountValue} onChange={(e) => set("discountValue", Math.max(0, Math.floor(Number(e.target.value))))} />
            ) : (
              <MoneyField label={b.discountType === "FLAT" ? "Amount off" : "Kit price"} value={b.discountValue} onChange={(n) => set("discountValue", n)} />
            )}
          </div>
          <p className="mt-4 rounded-sm bg-ivory px-4 py-3 text-[15px]" aria-live="polite">
            Customer pays <strong>{formatINR(preview.price)}</strong> instead of <s className="text-muted">{formatINR(preview.compareAt)}</s>
            {preview.compareAt > preview.price && <span className="ml-2 font-semibold text-red-sale">Save {percentOff(preview.price, preview.compareAt)}%</span>}
          </p>
        </Panel>
      ) : (
        <Panel
          title="Discount tiers"
          actions={
            <button type="button" className={adminBtn("secondary")} onClick={() => set("tiers", [...b.tiers, { minItems: (b.tiers.at(-1)?.minItems ?? 1) + 2, percentOff: (b.tiers.at(-1)?.percentOff ?? 5) + 5 }])}>
              + Add tier
            </button>
          }
        >
          <div className="flex flex-col gap-2">
            {b.tiers.map((t, i) => (
              <div key={i} className="flex flex-wrap items-center gap-3 text-sm">
                <label className="flex items-center gap-2">
                  Pick
                  <input type="number" min={2} max={20} value={t.minItems} onChange={(e) => set("tiers", b.tiers.map((x, j) => (j === i ? { ...x, minItems: Number(e.target.value) } : x)))} className="h-10 w-16 rounded-sm border border-border px-2" />
                  pieces →
                </label>
                <label className="flex items-center gap-2">
                  <input type="number" min={1} max={90} value={t.percentOff} onChange={(e) => set("tiers", b.tiers.map((x, j) => (j === i ? { ...x, percentOff: Number(e.target.value) } : x)))} className="h-10 w-16 rounded-sm border border-border px-2" />% off
                </label>
                <button type="button" onClick={() => set("tiers", b.tiers.filter((_, j) => j !== i))} className="text-xs font-semibold text-red-sale">
                  Remove
                </button>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <SaveBar
        busy={busy}
        message={message}
        error={error}
        onSave={save}
        label={b.id ? "Save changes" : isKit ? "Create kit" : "Create gift box"}
        extra={
          b.id ? (
            <button
              type="button"
              className={adminBtn("danger")}
              onClick={async () => {
                if (!confirm(`Delete “${b.title}”?`)) return;
                try {
                  await adminFetch("DELETE", `/api/admin/bundles/${b.id}`);
                  router.replace("/admin/bundles");
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Couldn't delete");
                }
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

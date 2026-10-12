"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { slugify } from "@/lib/csv";
import { formatINR, percentOff } from "@/lib/money";
import { adminFetch, MoneyField, SaveBar, SelectField, TextArea, TextField, Toggle } from "./fields";
import { ImageManager, type Img } from "./ImageManager";
import { adminBtn, Panel } from "./ui";

type Variant = { id?: string; name: string; sku: string; price: number; mrp: number; stock: number; weightGrams: number };
export type ProductForm = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  badge: "NONE" | "NEW" | "BESTSELLER";
  isLive: boolean;
  seoTitle: string;
  seoDescription: string;
  images: Img[];
  variants: Variant[];
};

export function ProductEditor({ initial, categories }: { initial: ProductForm; categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [p, setP] = useState<ProductForm>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const set = <K extends keyof ProductForm>(k: K, v: ProductForm[K]) => setP((x) => ({ ...x, [k]: v }));
  const setVariant = (i: number, patch: Partial<Variant>) => set("variants", p.variants.map((v, j) => (j === i ? { ...v, ...patch } : v)));

  async function save() {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const body = { ...p, seoTitle: p.seoTitle || null, seoDescription: p.seoDescription || null };
      if (p.id) {
        await adminFetch("PATCH", `/api/admin/products/${p.id}`, body);
        setMessage("Saved — live on the store now.");
        router.refresh();
      } else {
        const { product } = await adminFetch<{ product: { id: string } }>("POST", "/api/admin/products", body);
        router.replace(`/admin/products/${product.id}?created=1`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!p.id || !confirm(`Delete “${p.title}”? This can't be undone.`)) return;
    try {
      await adminFetch("DELETE", `/api/admin/products/${p.id}`);
      router.replace("/admin/products");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't delete");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <Panel title="Details">
          <div className="grid gap-4">
            <TextField
              label="Title"
              value={p.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
            />
            <TextField
              label="URL slug"
              value={p.slug}
              hint={`swift.in/products/${p.slug || "…"}`}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", slugify(e.target.value));
              }}
            />
            <TextArea label="Description" rows={6} value={p.description} onChange={(e) => set("description", e.target.value)} />
          </div>
        </Panel>
        <Panel title="Status">
          <div className="grid gap-4">
            <Toggle label="Live on the store" checked={p.isLive} onChange={(v) => set("isLive", v)} hint={p.isLive ? "Customers can see and buy this" : "Hidden from customers"} />
            <SelectField label="Category" value={p.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
              <option value="">Choose…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectField>
            <SelectField label="Badge" value={p.badge} onChange={(e) => set("badge", e.target.value as ProductForm["badge"])} hint="“X left” shows automatically when stock is low.">
              <option value="NONE">None</option>
              <option value="NEW">New</option>
              <option value="BESTSELLER">Bestseller</option>
            </SelectField>
          </div>
        </Panel>
      </div>

      <Panel title="Images">
        <ImageManager images={p.images} onChange={(imgs) => set("images", imgs)} />
      </Panel>

      <Panel
        title="Variants, prices & stock"
        actions={
          <button
            type="button"
            className={adminBtn("secondary")}
            onClick={() =>
              set("variants", [...p.variants, { name: "", sku: "", price: 0, mrp: 0, stock: 0, weightGrams: p.variants.at(-1)?.weightGrams ?? 500 }])
            }
          >
            + Add variant
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          {p.variants.map((v, i) => (
            <fieldset key={v.id ?? `new-${i}`} className="rounded-sm border border-divider p-4">
              <legend className="px-1 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Variant {i + 1}</legend>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <TextField label="Name" placeholder="e.g. 5 ft" value={v.name} onChange={(e) => setVariant(i, { name: e.target.value })} />
                <TextField label="SKU" value={v.sku} onChange={(e) => setVariant(i, { sku: e.target.value.toUpperCase() })} />
                <MoneyField label="Price (incl. GST)" value={v.price} onChange={(n) => setVariant(i, { price: n })} />
                <MoneyField label="MRP" value={v.mrp} onChange={(n) => setVariant(i, { mrp: n })} hint={v.mrp > v.price ? `${percentOff(v.price, v.mrp)}% off` : undefined} />
                <TextField label="Stock" type="number" min={0} value={v.stock} onChange={(e) => setVariant(i, { stock: Math.max(0, Math.floor(Number(e.target.value))) })} />
                <TextField label="Weight (g)" type="number" min={1} value={v.weightGrams} onChange={(e) => setVariant(i, { weightGrams: Math.max(1, Math.floor(Number(e.target.value))) })} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted">
                <span>Customer pays {formatINR(v.price || 0)}</span>
                {p.variants.length > 1 && (
                  <button type="button" onClick={() => set("variants", p.variants.filter((_, j) => j !== i))} className="font-semibold text-red-sale">
                    Remove variant
                  </button>
                )}
              </div>
            </fieldset>
          ))}
        </div>
      </Panel>

      <Panel title="Search engines (optional)">
        <div className="grid gap-4">
          <TextField label="SEO title" maxLength={70} value={p.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} hint={`${p.seoTitle.length}/70 · defaults to the product title`} />
          <TextArea label="SEO description" rows={2} maxLength={170} value={p.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} hint={`${p.seoDescription.length}/170`} />
        </div>
      </Panel>

      <SaveBar
        busy={busy}
        message={message}
        error={error}
        onSave={save}
        label={p.id ? "Save changes" : "Create product"}
        extra={
          p.id ? (
            <button type="button" onClick={remove} className={adminBtn("danger")}>
              Delete
            </button>
          ) : null
        }
      />
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { adminFetch } from "./fields";
import { adminBtn } from "./ui";
import { uploadImage } from "./upload";

type Cat = { id: string; name: string; slug: string; sortOrder: number; count: number; imageUrl: string | null };

/** Category tile photo (home page "Shop by category"): upload to replace, or remove to fall back to the placeholder. */
function CategoryPhoto({ cat, run }: { cat: Cat; run: (fn: () => Promise<unknown>) => Promise<void> }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex w-[150px] shrink-0 items-center gap-2">
      <span className="relative block size-14 shrink-0 overflow-hidden rounded-sm border border-border bg-ivory">
        {cat.imageUrl ? <ProductImage src={cat.imageUrl} alt="" fill sizes="56px" className="object-cover" /> : <span className="flex size-full items-center justify-center text-[10px] text-muted">No photo</span>}
      </span>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        aria-label={`Photo for ${cat.name}`}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          setBusy(true);
          await run(async () => adminFetch("PATCH", `/api/admin/categories/${cat.id}`, { imageUrl: await uploadImage(f) }));
          setBusy(false);
        }}
      />
      <span className="flex flex-col items-start">
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className="text-xs font-semibold text-green-300 disabled:opacity-50">
          {busy ? "Uploading…" : cat.imageUrl ? "Change photo" : "Add photo"}
        </button>
        {cat.imageUrl && !busy && (
          <button type="button" onClick={() => run(() => adminFetch("PATCH", `/api/admin/categories/${cat.id}`, { imageUrl: null }))} className="text-xs text-muted">
            Remove
          </button>
        )}
      </span>
    </div>
  );
}

export function CategoryManager({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const run = async (fn: () => Promise<unknown>) => {
    setError("");
    try {
      await fn();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  };
  const swap = (i: number, j: number) =>
    run(async () => {
      await adminFetch("PATCH", `/api/admin/categories/${categories[i].id}`, { sortOrder: categories[j].sortOrder });
      await adminFetch("PATCH", `/api/admin/categories/${categories[j].id}`, { sortOrder: categories[i].sortOrder });
    });

  return (
    <div className="flex flex-col gap-4">
      <ul className="divide-y divide-divider rounded-lg border border-border bg-white">
        {categories.map((c, i) => (
          <li key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <CategoryPhoto cat={c} run={run} />
            <input
              defaultValue={c.name}
              aria-label={`Name for ${c.name}`}
              onBlur={(e) => e.target.value.trim() !== c.name && run(() => adminFetch("PATCH", `/api/admin/categories/${c.id}`, { name: e.target.value.trim() }))}
              className="h-10 min-w-0 flex-1 rounded-sm border border-transparent px-2 text-[15px] font-semibold hover:border-border focus:border-green-200"
            />
            <span className="text-xs text-muted">
              /{c.slug} · {c.count} product{c.count === 1 ? "" : "s"}
            </span>
            <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => swap(i, i - 1)} className="size-10 disabled:opacity-30">
              ↑
            </button>
            <button type="button" aria-label="Move down" disabled={i === categories.length - 1} onClick={() => swap(i, i + 1)} className="size-10 disabled:opacity-30">
              ↓
            </button>
            <button type="button" onClick={() => confirm(`Delete ${c.name}?`) && run(() => adminFetch("DELETE", `/api/admin/categories/${c.id}`))} className="text-xs font-semibold text-red-sale">
              Delete
            </button>
          </li>
        ))}
      </ul>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) run(async () => (await adminFetch("POST", "/api/admin/categories", { name }), setName("")));
        }}
      >
        <label htmlFor="new-cat" className="sr-only">
          New category
        </label>
        <input id="new-cat" value={name} onChange={(e) => setName(e.target.value)} placeholder="New category, e.g. Decor" className="h-11 min-w-0 flex-1 rounded-full border border-border bg-white px-4 text-sm" />
        <button type="submit" className={adminBtn("primary")}>
          Add
        </button>
      </form>
      {error && <p className="text-sm text-red-sale">{error}</p>}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { adminBtn } from "./ui";
import { uploadImage } from "./upload";

export type Img = { url: string; alt: string };

export function ImageManager({ images, onChange, max = 12 }: { images: Img[]; onChange: (imgs: Img[]) => void; max?: number }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");

  const move = (i: number, d: -1 | 1) => {
    const next = [...images];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };

  return (
    <div>
      {images.length > 0 && (
        <ul className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img, i) => (
            <li key={img.url + i} className="rounded-sm border border-border p-2">
              <div className="relative aspect-square overflow-hidden rounded-sm bg-ivory">
                <ProductImage src={img.url} alt={img.alt} fill sizes="200px" className="object-cover" />
                {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-green-300 px-2 py-0.5 text-xs font-semibold text-ivory">Cover</span>}
              </div>
              <label className="sr-only" htmlFor={`alt-${i}`}>
                Alt text for image {i + 1}
              </label>
              <input
                id={`alt-${i}`}
                value={img.alt}
                onChange={(e) => onChange(images.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))}
                placeholder="Describe the photo (alt text)"
                className="mt-2 h-9 w-full rounded-sm border border-border px-2 text-xs"
              />
              <div className="mt-1 flex justify-between">
                <span className="flex">
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move left" className="size-9 text-muted disabled:opacity-30">
                    ←
                  </button>
                  <button type="button" disabled={i === images.length - 1} onClick={() => move(i, 1)} aria-label="Move right" className="size-9 text-muted disabled:opacity-30">
                    →
                  </button>
                </span>
                <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} className="px-2 text-xs font-semibold text-red-sale">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="sr-only"
          aria-label="Upload images"
          onChange={async (e) => {
            const files = [...(e.target.files ?? [])].slice(0, max - images.length);
            e.target.value = "";
            if (!files.length) return;
            setBusy(true);
            setError("");
            try {
              const added: Img[] = [];
              for (const f of files) added.push({ url: await uploadImage(f), alt: "" });
              onChange([...images, ...added]);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Upload failed");
            } finally {
              setBusy(false);
            }
          }}
        />
        <button type="button" disabled={busy || images.length >= max} onClick={() => input.current?.click()} className={adminBtn("secondary")}>
          {busy ? "Uploading…" : "Upload images"}
        </button>
        <span className="text-xs text-muted">or</span>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… image URL" className="h-11 min-w-0 flex-1 rounded-sm border border-border px-3 text-sm" aria-label="Image URL" />
        <button
          type="button"
          disabled={!/^https:\/\//.test(url) || images.length >= max}
          onClick={() => {
            onChange([...images, { url: url.trim(), alt: "" }]);
            setUrl("");
          }}
          className={adminBtn("secondary")}
        >
          Add URL
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-sale">{error}</p>}
      <p className="mt-2 text-xs text-muted">The first image is the cover. Square or 4:5 photos work best.</p>
    </div>
  );
}

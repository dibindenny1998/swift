"use client";

import { useState } from "react";
import { adminBtn, Panel } from "./ui";

const SAMPLE = `slug,title,category,description,badge,live,variant_name,sku,price,mrp,stock,weight_grams,image_urls
nordic-pine-tree,Nordic Pine Tree,Trees,"Full, layered tips.",BESTSELLER,yes,5 ft,TRE-NP-5,4999,5999,12,5500,https://res.cloudinary.com/demo/image/upload/tree.jpg
nordic-pine-tree,Nordic Pine Tree,Trees,,,,6 ft,TRE-NP-6,6999,8499,4,7000,
`;

type Result = { ok: boolean; created?: number; updated?: number; variants?: number; errors?: { row: number; message: string }[]; error?: string };

export function CsvImport() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <Panel title="1. Prepare your file">
        <p className="text-sm text-muted">
          One row per variant. Rows with the same <code>slug</code> become one product. Prices are in rupees including GST. Products are matched by slug and variants by SKU, so
          re-importing a file updates them.
        </p>
        <a href={`data:text/csv;charset=utf-8,${encodeURIComponent(SAMPLE)}`} download="swift-products-template.csv" className={adminBtn("secondary", "mt-4")}>
          Download template
        </a>
      </Panel>
      <Panel title="2. Upload">
        <input
          type="file"
          accept=".csv,text/csv"
          aria-label="CSV file"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setResult(null);
          }}
          className="block text-sm"
        />
        <button
          type="button"
          disabled={!file || busy}
          className={adminBtn("primary", "mt-4")}
          onClick={async () => {
            if (!file) return;
            setBusy(true);
            try {
              const res = await fetch("/api/admin/products/import", { method: "POST", headers: { "Content-Type": "text/csv" }, body: await file.text() });
              setResult((await res.json()) as Result);
            } catch {
              setResult({ ok: false, error: "Upload failed" });
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Importing…" : "Import"}
        </button>
        {result && (
          <div className="mt-4 text-sm" role="status">
            {result.ok ? (
              <p className="font-semibold text-green-300">
                Done — {result.created} created, {result.updated} updated, {result.variants} variants.
              </p>
            ) : (
              <>
                <p className="font-semibold text-red-sale">{result.error ?? "Nothing was imported. Fix these rows and try again:"}</p>
                <ul className="mt-2 list-disc pl-5 text-red-sale">
                  {result.errors?.map((e, i) => (
                    <li key={i}>
                      {e.row ? `Row ${e.row}: ` : ""}
                      {e.message}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}

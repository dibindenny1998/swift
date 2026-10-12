"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { SortKey } from "@/lib/catalog";

export function SortSelect({ value, options }: { value: SortKey; options: { key: SortKey; label: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  return (
    <label className="relative inline-flex h-11 items-center gap-2 rounded-full border border-border bg-white pl-4 pr-9 text-sm font-semibold text-text">
      <span className="text-muted">Sort</span>
      <select
        value={value}
        aria-busy={pending}
        onChange={(e) => {
          const next = new URLSearchParams(params);
          next.set("sort", e.target.value);
          next.delete("page");
          startTransition(() => router.replace(`${pathname}?${next}`, { scroll: false }));
        }}
        className="appearance-none bg-transparent font-semibold outline-none"
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
      <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" className="pointer-events-none absolute right-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="m3 4.5 3 3 3-3" />
      </svg>
    </label>
  );
}

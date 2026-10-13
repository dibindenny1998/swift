"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFetch } from "./fields";
import { adminBtn, Pill, Table } from "./ui";

export type OrderRow = {
  id: string;
  label: string;
  items: number;
  name: string | null;
  phone: string | null;
  placed: string;
  payment: string;
  statusText: string;
  tone: string;
  returnOpen: boolean;
  total: string;
};

type Action = { key: string; label: string; run: (id: string) => Promise<unknown> };

/** Orders list with checkboxes and bulk actions (confirm, pack, ship via Shiprocket, print packing slips). */
export function OrdersTable({ rows, shiprocket }: { rows: OrderRow[]; shiprocket: boolean }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<{ ok: number; failed: { label: string; reason: string }[] } | null>(null);
  const all = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const actions: Action[] = [
    { key: "confirm", label: "Confirm COD", run: (id) => adminFetch("PATCH", `/api/admin/orders/${id}`, { status: "PAID", note: "Confirmed (bulk)" }) },
    { key: "pack", label: "Mark packed", run: (id) => adminFetch("PATCH", `/api/admin/orders/${id}`, { status: "PACKED", note: "Packed (bulk)" }) },
    ...(shiprocket ? [{ key: "ship", label: "Create Shiprocket shipments", run: (id: string) => adminFetch("POST", `/api/admin/orders/${id}/shipment`, { mode: "shiprocket" }) }] : []),
  ];

  async function runAll(a: Action) {
    setBusy(a.key);
    setResult(null);
    const failed: { label: string; reason: string }[] = [];
    let ok = 0;
    // One at a time: keeps the courier API and the database happy, and each order is checked on its own.
    for (const r of rows.filter((x) => selected.has(x.id))) {
      try {
        await a.run(r.id);
        ok++;
      } catch (e) {
        failed.push({ label: r.label, reason: e instanceof Error ? e.message : "Failed" });
      }
    }
    setResult({ ok, failed });
    setBusy(null);
    setSelected(new Set());
    router.refresh();
  }

  return (
    <>
      {selected.size > 0 && (
        <div className="sticky top-[60px] z-20 mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-green-300/30 bg-white p-3 shadow-md lg:top-2">
          <span className="mr-2 text-sm font-semibold">{selected.size} selected</span>
          {actions.map((a) => (
            <button key={a.key} type="button" disabled={busy !== null} onClick={() => runAll(a)} className={adminBtn("secondary", "h-10")}>
              {busy === a.key ? "Working…" : a.label}
            </button>
          ))}
          <a href={`/admin/packing-slips?ids=${[...selected].join(",")}`} target="_blank" rel="noopener" className={adminBtn("primary", "h-10")}>
            Print packing slips ↗
          </a>
          <button type="button" onClick={() => setSelected(new Set())} className="ml-auto text-sm text-muted">
            Clear
          </button>
        </div>
      )}
      {result && (
        <div role="status" className="mb-3 rounded-lg border border-border bg-white p-3 text-sm">
          <p className="font-semibold">
            {result.ok} order{result.ok === 1 ? "" : "s"} updated{result.failed.length ? ` · ${result.failed.length} skipped` : ""}
          </p>
          {result.failed.length > 0 && (
            <ul className="mt-1 text-xs text-muted">
              {result.failed.map((f) => (
                <li key={f.label}>
                  {f.label}: {f.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <Table>
        <thead>
          <tr>
            <th className="w-10">
              <input
                type="checkbox"
                aria-label="Select all orders on this page"
                checked={all}
                onChange={() => setSelected(all ? new Set() : new Set(rows.map((r) => r.id)))}
                className="size-4 accent-[var(--color-green-300)]"
              />
            </th>
            <th>Order</th>
            <th>Customer</th>
            <th>Placed</th>
            <th>Payment</th>
            <th>Status</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.id} className={selected.has(o.id) ? "bg-green-300/5" : "hover:bg-ivory"}>
              <td>
                <input type="checkbox" aria-label={`Select ${o.label}`} checked={selected.has(o.id)} onChange={() => toggle(o.id)} className="size-4 accent-[var(--color-green-300)]" />
              </td>
              <td>
                <Link href={`/admin/orders/${o.id}`} className="font-semibold">
                  {o.label}
                </Link>
                <span className="block text-xs text-muted">{o.items} items</span>
              </td>
              <td>
                {o.name ?? "—"}
                <span className="block text-xs text-muted">{o.phone}</span>
              </td>
              <td className="text-xs">{o.placed}</td>
              <td>{o.payment}</td>
              <td className="flex flex-wrap gap-1">
                <Pill tone={o.tone}>{o.statusText}</Pill>
                {o.returnOpen && <Pill tone="red">Return</Pill>}
              </td>
              <td className="text-right tabular-nums">{o.total}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatINR } from "@/lib/money";
import { adminFetch, MoneyField, SelectField, TextField } from "./fields";
import { adminBtn, Panel } from "./ui";
import type { PaymentMethod } from "@/lib/order-status";

type Status = "PENDING" | "PAID" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "RETURNED";

function useAction() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg({ ok: true, text: ok });
      router.refresh();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Something went wrong" });
    } finally {
      setBusy(false);
    }
  };
  const note = msg && (
    <p role={msg.ok ? "status" : "alert"} className={`mt-3 text-sm ${msg.ok ? "text-green-300" : "text-red-sale"}`}>
      {msg.text}
    </p>
  );
  return { busy, run, note };
}

const NEXT: Partial<Record<Status, { to: Status; label: string }>> = {
  PENDING: { to: "PAID", label: "Confirm COD order" },
  PAID: { to: "PACKED", label: "Mark packed" },
  PACKED: { to: "SHIPPED", label: "Mark shipped" },
  SHIPPED: { to: "OUT_FOR_DELIVERY", label: "Mark out for delivery" },
  OUT_FOR_DELIVERY: { to: "DELIVERED", label: "Mark delivered" },
};

export function StatusActions({ orderId, status, paymentMethod }: { orderId: string; status: Status; paymentMethod: PaymentMethod }) {
  const { busy, run, note } = useAction();
  const [target, setTarget] = useState<Status>("CANCELLED");
  const [restock, setRestock] = useState(true);
  const [force, setForce] = useState(false);
  const [why, setWhy] = useState("");
  const next = NEXT[status];
  const awaitingPayment = status === "PENDING" && paymentMethod === "RAZORPAY";
  const send = (to: Status, extra: Record<string, unknown> = {}) =>
    run(() => adminFetch("PATCH", `/api/admin/orders/${orderId}`, { status: to, note: why || undefined, ...extra }), "Status updated");

  return (
    <Panel title="Status">
      {awaitingPayment ? (
        <p className="text-sm text-muted">Waiting for online payment. It will confirm automatically when Razorpay reports the payment.</p>
      ) : (
        next && (
          <button type="button" disabled={busy} onClick={() => send(next.to)} className={adminBtn("primary", "w-full")}>
            {next.label}
          </button>
        )
      )}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold text-muted">Cancel, return or correct…</summary>
        <div className="mt-3 grid gap-3">
          <SelectField label="Set status to" value={target} onChange={(e) => setTarget(e.target.value as Status)}>
            {["CANCELLED", "RETURNED", "PAID", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ").toLowerCase()}
              </option>
            ))}
          </SelectField>
          <TextField label="Note (shown in the order history)" value={why} onChange={(e) => setWhy(e.target.value)} />
          {(target === "CANCELLED" || target === "RETURNED") && (
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" checked={restock} onChange={(e) => setRestock(e.target.checked)} className="size-4 accent-[#0B5E3E]" />
              Put the items back in stock
            </label>
          )}
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} className="size-4 accent-[#0B5E3E]" />
            Override (allow moving backwards to fix a mistake)
          </label>
          {target === "CANCELLED" && paymentMethod === "RAZORPAY" && <p className="text-xs text-muted">Cancelling doesn&apos;t refund automatically — use Refund below.</p>}
          <button
            type="button"
            disabled={busy}
            onClick={() => (target !== "CANCELLED" || confirm("Cancel this order? The customer will be emailed.")) && send(target, { restock, force })}
            className={adminBtn(target === "CANCELLED" ? "danger" : "secondary")}
          >
            Apply
          </button>
        </div>
      </details>
      {note}
    </Panel>
  );
}

export function ShipmentActions({ orderId, canShip, shiprocket }: { orderId: string; canShip: boolean; shiprocket: boolean }) {
  const { busy, run, note } = useAction();
  const [courier, setCourier] = useState("");
  const [awb, setAwb] = useState("");
  const [url, setUrl] = useState("");
  if (!canShip) return null;
  return (
    <Panel title="Create shipment">
      <button
        type="button"
        disabled={busy || !shiprocket}
        onClick={() => run(() => adminFetch("POST", `/api/admin/orders/${orderId}/shipment`, { mode: "shiprocket" }), "Shipment created — AWB assigned")}
        className={adminBtn("primary", "w-full")}
      >
        {busy ? "Working…" : "Create Shiprocket shipment"}
      </button>
      {!shiprocket && <p className="mt-2 text-xs text-muted">Connect Shiprocket (env keys) to book couriers here. Meanwhile, enter an AWB manually:</p>}
      <details className="mt-4" open={!shiprocket}>
        <summary className="cursor-pointer text-sm font-semibold text-muted">Enter courier & AWB manually</summary>
        <div className="mt-3 grid gap-3">
          <TextField label="Courier" value={courier} onChange={(e) => setCourier(e.target.value)} placeholder="Delhivery" />
          <TextField label="AWB / tracking number" value={awb} onChange={(e) => setAwb(e.target.value)} />
          <TextField label="Tracking link (optional)" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
          <button
            type="button"
            disabled={busy || !courier || !awb}
            onClick={() => run(() => adminFetch("POST", `/api/admin/orders/${orderId}/shipment`, { mode: "manual", courier, awb, trackingUrl: url }), "Marked as shipped")}
            className={adminBtn("secondary")}
          >
            Save & mark shipped
          </button>
        </div>
      </details>
      {note}
    </Panel>
  );
}

export function RefundAction({ orderId, refundable, refunded }: { orderId: string; refundable: number; refunded: number }) {
  const { busy, run, note } = useAction();
  const [amount, setAmount] = useState(refundable);
  const [reason, setReason] = useState("");
  return (
    <Panel title="Refund">
      <p className="mb-3 text-sm text-muted">
        {refunded > 0 && <>Refunded so far: {formatINR(refunded)}. </>}Up to {formatINR(refundable)} can be refunded to the customer&apos;s original payment method.
      </p>
      {refundable > 0 && (
        <div className="grid gap-3">
          <MoneyField label="Amount" value={amount} onChange={setAmount} />
          <TextField label="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <button
            type="button"
            disabled={busy || amount <= 0}
            onClick={() => confirm(`Refund ${formatINR(amount)}? This can't be undone.`) && run(() => adminFetch("POST", `/api/admin/orders/${orderId}/refund`, { amount, reason }), "Refund started")}
            className={adminBtn("danger")}
          >
            Refund {formatINR(amount)}
          </button>
        </div>
      )}
      {note}
    </Panel>
  );
}

export function ReturnActions({ returnId, status, adminNote }: { returnId: string; status: string; adminNote: string | null }) {
  const { busy, run, note } = useAction();
  const [s, setS] = useState(status);
  const [n, setN] = useState(adminNote ?? "");
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
      <SelectField label="Return status" value={s} onChange={(e) => setS(e.target.value)}>
        {["REQUESTED", "APPROVED", "REJECTED", "RECEIVED", "REFUNDED"].map((x) => (
          <option key={x} value={x}>
            {x.toLowerCase()}
          </option>
        ))}
      </SelectField>
      <TextField label="Note to customer" value={n} onChange={(e) => setN(e.target.value)} />
      <button type="button" disabled={busy} onClick={() => run(() => adminFetch("PATCH", `/api/admin/returns/${returnId}`, { status: s, adminNote: n }), "Return updated")} className={adminBtn("secondary")}>
        Save
      </button>
      <div className="sm:col-span-3">{note}</div>
    </div>
  );
}

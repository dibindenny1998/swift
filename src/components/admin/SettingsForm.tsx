"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { INDIAN_STATES } from "@/lib/india";
import type { SiteSettings } from "@/lib/settings";
import { adminFetch, MoneyField, SaveBar, SelectField, TextArea, TextField, Toggle } from "./fields";
import { adminBtn, Panel } from "./ui";

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setS((x) => ({ ...x, [k]: v }));

  async function save() {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await adminFetch("PUT", "/api/admin/settings", s);
      setMessage("Saved — the store updates on the next page load.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Store">
        <div className="grid gap-4">
          <TextField label="Announcement bar" value={s.announcement} maxLength={120} onChange={(e) => set("announcement", e.target.value)} hint="Use ✦ to separate two messages" />
          <TextField label="WhatsApp number" value={s.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} placeholder="+91 98765 43210" hint="Turns on WhatsApp help links" />
          <TextField label="New-order email" type="email" value={s.orderNotifyEmail} onChange={(e) => set("orderNotifyEmail", e.target.value)} hint="Where new orders and return requests are sent" />
          <div className="grid gap-3 sm:grid-cols-3">
            <TextField label="Instagram URL" value={s.social.instagram ?? ""} onChange={(e) => set("social", { ...s.social, instagram: e.target.value })} />
            <TextField label="Facebook URL" value={s.social.facebook ?? ""} onChange={(e) => set("social", { ...s.social, facebook: e.target.value })} />
            <TextField label="YouTube URL" value={s.social.youtube ?? ""} onChange={(e) => set("social", { ...s.social, youtube: e.target.value })} />
          </div>
        </div>
      </Panel>

      <Panel title="Christmas dates (IST)">
        <div className="grid gap-4">
          <TextField label="Countdown ends" type="datetime-local" value={s.countdownEnd} onChange={(e) => set("countdownEnd", e.target.value)} hint="Hero countdown target" />
          <TextField label="Last order date for Christmas delivery" type="date" value={s.lastOrderDate} onChange={(e) => set("lastOrderDate", e.target.value)} hint="After this day the banner switches to the New Year message" />
        </div>
      </Panel>

      <Panel title="Pricing, shipping & payments">
        <div className="grid gap-4 sm:grid-cols-2">
          <MoneyField label="Free shipping over" value={s.freeShippingThreshold} onChange={(n) => set("freeShippingThreshold", n)} />
          <MoneyField label="Shipping fee below that" value={s.shippingFee} onChange={(n) => set("shippingFee", n)} />
          <MoneyField label="Gift wrap price" value={s.giftWrapPrice} onChange={(n) => set("giftWrapPrice", n)} hint="₹0 = complimentary" />
          <TextField label="Low-stock threshold" type="number" min={0} value={s.lowStockThreshold} onChange={(e) => set("lowStockThreshold", Math.max(0, Math.floor(Number(e.target.value))))} hint="“Only X left” shows at or below this" />
          <div className="sm:col-span-2">
            <Toggle label="Cash on delivery" checked={s.codEnabled} onChange={(v) => set("codEnabled", v)} />
          </div>
          {s.codEnabled && <MoneyField label="COD fee" value={s.codFee} onChange={(n) => set("codFee", n)} />}
        </div>
      </Panel>

      <Panel title="Effects">
        <div className="grid gap-4">
          <Toggle label="Falling snow" checked={s.effects.snow} onChange={(v) => set("effects", { ...s.effects, snow: v })} />
          <Toggle label="Santa landing in the hero" checked={s.effects.santa} onChange={(v) => set("effects", { ...s.effects, santa: v })} />
          <Toggle label="Snowman in the footer" checked={s.effects.mascot} onChange={(v) => set("effects", { ...s.effects, mascot: v })} />
          <p className="text-xs text-muted">All motion is switched off automatically for visitors who prefer reduced motion.</p>
        </div>
      </Panel>

      <Panel title="GST invoice">
        <div className="grid gap-4">
          <TextField label="Business name" value={s.businessName} onChange={(e) => set("businessName", e.target.value)} />
          <TextArea label="Business address" rows={3} value={s.businessAddress} onChange={(e) => set("businessAddress", e.target.value)} />
          <div className="grid gap-3 sm:grid-cols-3">
            <TextField label="GSTIN" value={s.gstin} onChange={(e) => set("gstin", e.target.value.toUpperCase())} maxLength={15} />
            <SelectField label="Registered state" value={s.businessState} onChange={(e) => set("businessState", e.target.value)}>
              {INDIAN_STATES.map((st) => (
                <option key={st}>{st}</option>
              ))}
            </SelectField>
            <TextField label="GST rate %" type="number" min={0} max={28} value={s.gstRatePercent} onChange={(e) => set("gstRatePercent", Number(e.target.value))} />
          </div>
        </div>
      </Panel>

      <Panel title="Shipping (Shiprocket)">
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Warehouse pincode" value={s.pickupPincode} maxLength={6} onChange={(e) => set("pickupPincode", e.target.value.replace(/\D/g, ""))} hint="For delivery estimates" />
            <TextField label="Shiprocket pickup location name" value={s.shiprocketPickupLocation} onChange={(e) => set("shiprocketPickupLocation", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(["length", "breadth", "height"] as const).map((d) => (
              <TextField key={d} label={`Box ${d} (cm)`} type="number" min={1} value={s.packageCm[d]} onChange={(e) => set("packageCm", { ...s.packageCm, [d]: Math.max(1, Number(e.target.value)) })} />
            ))}
          </div>
        </div>
      </Panel>

      <div className="lg:col-span-2">
        <SaveBar busy={busy} message={message} error={error} onSave={save} />
      </div>
    </div>
  );
}

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <Panel title="Change admin password">
      <form
        className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await adminFetch("POST", "/api/admin/password", { current, next });
            setMsg({ ok: true, text: "Password changed." });
            setCurrent("");
            setNext("");
          } catch (err) {
            setMsg({ ok: false, text: err instanceof Error ? err.message : "Failed" });
          }
        }}
      >
        <TextField label="Current password" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <TextField label="New password (10+ characters)" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
        <button type="submit" className={adminBtn("secondary")}>
          Change
        </button>
      </form>
      {msg && <p className={`mt-2 text-sm ${msg.ok ? "text-green-300" : "text-red-sale"}`}>{msg.text}</p>}
    </Panel>
  );
}

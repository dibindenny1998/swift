"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { INDIAN_STATES } from "@/lib/india";
import { formatINR } from "@/lib/money";
import { adminFetch, MoneyField, SelectField, TextArea, TextField, Toggle } from "./fields";
import { adminBtn, Panel } from "./ui";

export type Pickable = { key: string; variantId?: string; bundleId?: string; title: string; detail: string | null; sku: string; price: number; stock: number };
type Settings = { freeShippingThreshold: number; shippingFee: number; codFee: number; giftWrapPrice: number };
type Address = { name: string; phone: string; line1: string; line2: string; city: string; state: string; pincode: string };
type Found = { name: string | null; email: string | null; orders: number; addresses: Address[] };

const emptyAddress: Address = { name: "", phone: "", line1: "", line2: "", city: "", state: "Karnataka", pincode: "" };

export function ManualOrderForm({ items, settings }: { items: Pickable[]; settings: Settings }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [found, setFound] = useState<Found | null | "none">(null);
  const [query, setQuery] = useState("");
  const [lines, setLines] = useState<{ key: string; qty: number }[]>([]);
  const [payment, setPayment] = useState<"COD" | "OFFLINE">("OFFLINE");
  const [paymentRef, setPaymentRef] = useState("");
  const [discount, setDiscount] = useState(0);
  const [shippingMode, setShippingMode] = useState<"auto" | "free" | "custom">("auto");
  const [shippingCustom, setShippingCustom] = useState(settings.shippingFee);
  const [codFee, setCodFee] = useState(true);
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const byKey = useMemo(() => new Map(items.map((i) => [i.key, i])), [items]);
  const matches = query.trim()
    ? items.filter((i) => `${i.title} ${i.detail ?? ""} ${i.sku}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
    : [];

  const subtotal = lines.reduce((s, l) => s + (byKey.get(l.key)?.price ?? 0) * l.qty, 0);
  const disc = Math.min(discount || 0, subtotal);
  const shipping = shippingMode === "free" ? 0 : shippingMode === "custom" ? shippingCustom || 0 : subtotal - disc >= settings.freeShippingThreshold ? 0 : lines.length ? settings.shippingFee : 0;
  const cod = payment === "COD" && codFee ? settings.codFee : 0;
  const wrap = giftWrap ? settings.giftWrapPrice : 0;
  const total = subtotal - disc + shipping + cod + wrap;

  const add = (key: string) => {
    setLines((ls) => (ls.some((l) => l.key === key) ? ls.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l)) : [...ls, { key, qty: 1 }]));
    setQuery("");
  };
  const setQty = (key: string, qty: number) => setLines((ls) => (qty <= 0 ? ls.filter((l) => l.key !== key) : ls.map((l) => (l.key === key ? { ...l, qty } : l))));

  async function lookup() {
    if (phone.replace(/\D/g, "").length < 10) return;
    try {
      const { customer } = await adminFetch<{ customer: Found | null }>("GET", `/api/admin/orders/lookup?phone=${encodeURIComponent(phone)}`);
      setFound(customer ?? "none");
      if (customer) {
        if (customer.name && !name) setName(customer.name);
        if (customer.email && !email) setEmail(customer.email);
        if (customer.addresses[0] && !address.line1) setAddress(customer.addresses[0]);
      } else if (!address.phone) setAddress((a) => ({ ...a, phone }));
    } catch {
      setFound(null);
    }
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const { order } = await adminFetch<{ order: { id: string } }>("POST", "/api/admin/orders", {
        phone,
        name,
        email,
        address: { ...address, name: address.name || name, phone: address.phone || phone },
        items: lines.map((l) => {
          const i = byKey.get(l.key)!;
          return i.variantId ? { variantId: i.variantId, qty: l.qty } : { bundleId: i.bundleId, qty: l.qty };
        }),
        payment,
        paymentRef,
        discount: disc,
        shipping: shippingMode === "auto" ? "auto" : shipping,
        codFee,
        giftWrap,
        giftMessage,
      });
      router.push(`/admin/orders/${order.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't create the order");
      setBusy(false);
    }
  }

  const setA = (k: keyof Address, v: string) => setAddress((a) => ({ ...a, [k]: v }));

  return (
    <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">
      <div className="flex flex-col gap-5">
        <Panel title="Customer">
          <div className="grid gap-3 sm:grid-cols-3">
            <TextField label="Mobile number" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} onBlur={lookup} placeholder="98765 43210" hint="We'll look them up" />
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField label="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} hint="For the order confirmation" />
          </div>
          {found === "none" && <p className="mt-2 text-sm text-muted">New customer — they can sign in later with this number to see the order.</p>}
          {found && found !== "none" && (
            <div className="mt-3 text-sm">
              <p className="text-green-300">
                Returning customer · {found.orders} previous order{found.orders === 1 ? "" : "s"}
              </p>
              {found.addresses.length > 1 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {found.addresses.map((a, i) => (
                    <button key={i} type="button" onClick={() => setAddress(a)} className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-green-300">
                      {a.line1}, {a.city}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </Panel>

        <Panel title="Deliver to">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Recipient name" value={address.name} onChange={(e) => setA("name", e.target.value)} placeholder={name || "Same as customer"} />
            <TextField label="Recipient phone" inputMode="tel" value={address.phone} onChange={(e) => setA("phone", e.target.value)} placeholder={phone || "Same as customer"} />
            <TextField label="House / flat and street" value={address.line1} onChange={(e) => setA("line1", e.target.value)} className="sm:col-span-2" />
            <TextField label="Area / landmark (optional)" value={address.line2} onChange={(e) => setA("line2", e.target.value)} className="sm:col-span-2" />
            <TextField label="City" value={address.city} onChange={(e) => setA("city", e.target.value)} />
            <TextField label="Pincode" inputMode="numeric" maxLength={6} value={address.pincode} onChange={(e) => setA("pincode", e.target.value.replace(/\D/g, ""))} />
            <SelectField label="State" value={address.state} onChange={(e) => setA("state", e.target.value)} className="sm:col-span-2">
              {INDIAN_STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </SelectField>
          </div>
        </Panel>

        <Panel title="Items">
          <div className="relative">
            <TextField label="Add an item" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or SKU" autoComplete="off" />
            {matches.length > 0 && (
              <ul className="absolute inset-x-0 top-full z-10 mt-1 max-h-72 overflow-y-auto rounded-sm border border-border bg-white shadow-lg">
                {matches.map((m) => (
                  <li key={m.key}>
                    <button type="button" disabled={m.stock <= 0} onClick={() => add(m.key)} className="flex w-full justify-between gap-3 px-3 py-2.5 text-left text-sm hover:bg-ivory disabled:opacity-40">
                      <span>
                        <strong>{m.title}</strong>
                        {m.detail && <span className="text-muted"> · {m.detail}</span>}
                        <span className="block text-xs text-muted">{m.stock > 0 ? `${m.stock} in stock` : "Sold out"}</span>
                      </span>
                      <span className="tabular-nums">{formatINR(m.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {lines.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No items yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-divider">
              {lines.map((l) => {
                const i = byKey.get(l.key)!;
                return (
                  <li key={l.key} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="min-w-0">
                      <strong>{i.title}</strong>
                      {i.detail && <span className="text-muted"> · {i.detail}</span>}
                      <span className="block text-xs text-muted">
                        {formatINR(i.price)} each{l.qty > i.stock ? ` · only ${i.stock} in stock` : ""}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <button type="button" aria-label={`One less ${i.title}`} onClick={() => setQty(l.key, l.qty - 1)} className="size-9 rounded-full border border-border">
                        −
                      </button>
                      <span className="w-6 text-center tabular-nums">{l.qty}</span>
                      <button type="button" aria-label={`One more ${i.title}`} onClick={() => setQty(l.key, l.qty + 1)} className="size-9 rounded-full border border-border">
                        +
                      </button>
                      <span className="w-20 text-right tabular-nums">{formatINR(i.price * l.qty)}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <div className="flex flex-col gap-5">
        <Panel title="Payment">
          <fieldset className="grid gap-2">
            <legend className="sr-only">Payment</legend>
            {(
              [
                ["OFFLINE", "Already paid", "UPI, bank transfer or cash"],
                ["COD", "Cash on delivery", "Courier collects the amount"],
              ] as const
            ).map(([v, label, hint]) => (
              <label key={v} className="flex cursor-pointer gap-3 rounded-sm border border-border p-3 text-sm has-[:checked]:border-green-300 has-[:checked]:bg-green-300/5">
                <input type="radio" name="payment" checked={payment === v} onChange={() => setPayment(v)} className="mt-0.5 accent-[var(--color-green-300)]" />
                <span>
                  <span className="block font-semibold">{label}</span>
                  <span className="text-xs text-muted">{hint}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <div className="mt-3 grid gap-3">
            {payment === "OFFLINE" ? (
              <TextField label="Payment reference (optional)" value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} placeholder="UPI ref no., “cash”, bank txn id" />
            ) : (
              <Toggle label={`Charge COD fee (${formatINR(settings.codFee)})`} checked={codFee} onChange={setCodFee} />
            )}
            <MoneyField label="Discount" value={discount} onChange={setDiscount} hint="Optional, in rupees" />
            <SelectField label="Shipping" value={shippingMode} onChange={(e) => setShippingMode(e.target.value as typeof shippingMode)}>
              <option value="auto">Usual rule ({formatINR(settings.shippingFee)}, free over {formatINR(settings.freeShippingThreshold)})</option>
              <option value="free">Free</option>
              <option value="custom">Custom amount</option>
            </SelectField>
            {shippingMode === "custom" && <MoneyField label="Shipping charge" value={shippingCustom} onChange={setShippingCustom} />}
            <Toggle label={`Gift wrap${settings.giftWrapPrice ? ` (${formatINR(settings.giftWrapPrice)})` : " (complimentary)"}`} checked={giftWrap} onChange={setGiftWrap} />
            {giftWrap && <TextArea label="Gift note (optional)" rows={2} maxLength={200} value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} />}
          </div>
        </Panel>

        <Panel title="Summary">
          <dl className="grid gap-1 text-sm">
            {[
              ["Items", formatINR(subtotal)],
              ...(disc ? [["Discount", `−${formatINR(disc)}`]] : []),
              ["Shipping", shipping ? formatINR(shipping) : "Free"],
              ...(cod ? [["COD fee", formatINR(cod)]] : []),
              ...(wrap ? [["Gift wrap", formatINR(wrap)]] : []),
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <dt className="text-muted">{k}</dt>
                <dd className="tabular-nums">{v}</dd>
              </div>
            ))}
            <div className="mt-1 flex justify-between border-t border-divider pt-2 text-base font-bold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatINR(total)}</dd>
            </div>
          </dl>
          <button type="button" disabled={busy || lines.length === 0} onClick={submit} className={adminBtn("primary", "mt-4 w-full")}>
            {busy ? "Creating…" : `Create order · ${formatINR(total)}`}
          </button>
          {error && (
            <p role="alert" className="mt-2 text-sm text-red-sale">
              {error}
            </p>
          )}
          <p className="mt-2 text-xs text-muted">The order is confirmed straight away and stock is reserved. If the customer has an email, they get the usual confirmation.</p>
        </Panel>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AREAS, type Area } from "@/lib/admin-access";
import { adminFetch, TextField } from "./fields";
import { adminBtn, Panel, Pill } from "./ui";

type Staff = { id: string; name: string; email: string; areas: Area[]; isActive: boolean; createdAt: string };

function AreaPicker({ value, onChange, idPrefix }: { value: Area[]; onChange: (a: Area[]) => void; idPrefix: string }) {
  return (
    <fieldset className="grid gap-2 sm:grid-cols-2">
      <legend className="mb-2 text-sm font-semibold">Can open</legend>
      {AREAS.map((a) => (
        <label key={a.key} htmlFor={`${idPrefix}-${a.key}`} className="flex cursor-pointer gap-3 rounded-sm border border-border p-3 text-sm has-[:checked]:border-green-300 has-[:checked]:bg-green-300/5">
          <input
            id={`${idPrefix}-${a.key}`}
            type="checkbox"
            checked={value.includes(a.key)}
            onChange={(e) => onChange(e.target.checked ? [...value, a.key] : value.filter((x) => x !== a.key))}
            className="mt-0.5 size-4 accent-[var(--color-green-300)]"
          />
          <span>
            <span className="block font-semibold">{a.label}</span>
            <span className="text-xs text-muted">{a.hint}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}

function StaffRow({ s }: { s: Staff }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [areas, setAreas] = useState(s.areas);
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const save = async (body: object, done: string) => {
    setMsg(null);
    try {
      await adminFetch("PATCH", `/api/admin/staff/${s.id}`, body);
      setMsg({ ok: true, text: done });
      setPassword("");
      router.refresh();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Couldn't save" });
    }
  };
  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">
            {s.name} {!s.isActive && <Pill tone="grey">Switched off</Pill>}
          </p>
          <p className="text-sm text-muted">{s.email}</p>
          <p className="mt-1 text-xs text-muted">{s.areas.map((k) => AREAS.find((a) => a.key === k)?.label).join(" · ")}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setEditing((e) => !e)} className={adminBtn("secondary")} aria-expanded={editing}>
            {editing ? "Close" : "Edit"}
          </button>
          <button
            type="button"
            onClick={() => save({ isActive: !s.isActive }, s.isActive ? "Switched off — they're signed out on their next click." : "Switched back on.")}
            className={adminBtn(s.isActive ? "danger" : "secondary")}
          >
            {s.isActive ? "Switch off" : "Switch on"}
          </button>
        </div>
      </div>
      {editing && (
        <div className="mt-4 grid gap-4 rounded-sm bg-ivory p-4">
          <AreaPicker value={areas} onChange={setAreas} idPrefix={`edit-${s.id}`} />
          <button type="button" onClick={() => save({ areas }, "Access updated.")} className={adminBtn("primary", "justify-self-start")}>
            Save access
          </button>
          <div className="flex flex-wrap items-end gap-2 border-t border-divider pt-4">
            <TextField label="Set a new password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} hint="10+ characters. Share it with them privately." className="min-w-[240px]" />
            <button type="button" disabled={password.length < 10} onClick={() => save({ password }, "Password changed.")} className={adminBtn("secondary", "mb-6")}>
              Set password
            </button>
          </div>
        </div>
      )}
      {msg && <p className={`mt-2 text-sm ${msg.ok ? "text-green-300" : "text-red-sale"}`}>{msg.text}</p>}
    </li>
  );
}

export function StaffManager({ staff }: { staff: Staff[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", areas: ["orders"] as Area[] });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="grid gap-5">
      <Panel title="Staff">
        {staff.length === 0 ? (
          <p className="text-sm text-muted">No staff accounts yet. Add one below — each person gets their own login.</p>
        ) : (
          <ul className="-mx-5 -mb-5 divide-y divide-divider border-t border-divider">
            {staff.map((s) => (
              <StaffRow key={s.id + s.areas.join() + s.isActive} s={s} />
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Add a staff member">
        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              await adminFetch("POST", "/api/admin/staff", form);
              setForm({ name: "", email: "", password: "", areas: ["orders"] });
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Couldn't add");
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <TextField label="Email (their login)" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <TextField label="Password" type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} hint="10+ characters" required />
          </div>
          <AreaPicker value={form.areas} onChange={(areas) => setForm({ ...form, areas })} idPrefix="new" />
          <p className="text-xs text-muted">Only you (the owner) can open Site settings and this Staff page.</p>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={busy} className={adminBtn("primary")}>
              {busy ? "Adding…" : "Add staff member"}
            </button>
            {error && <p className="text-sm text-red-sale">{error}</p>}
          </div>
        </form>
      </Panel>
    </div>
  );
}

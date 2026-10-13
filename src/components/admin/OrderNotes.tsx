"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFetch } from "./fields";
import { adminBtn, Panel } from "./ui";

type Note = { id: string; authorName: string; text: string; createdAt: string };
const when = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

/** Private notes between staff ("customer asked for evening delivery", "packed by Ravi"). Never shown to the customer. */
export function OrderNotes({ orderId, notes }: { orderId: string; notes: Note[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <Panel title="Staff notes">
      {notes.length > 0 && (
        <ul className="mb-4 flex flex-col gap-3">
          {notes.map((n) => (
            <li key={n.id} className="rounded-sm bg-ivory px-3 py-2 text-sm">
              <p className="whitespace-pre-line">{n.text}</p>
              <p className="mt-1 text-xs text-muted">
                {n.authorName} · {when.format(new Date(n.createdAt))}
              </p>
            </li>
          ))}
        </ul>
      )}
      <form
        className="flex flex-col gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await adminFetch("POST", `/api/admin/orders/${orderId}/notes`, { text });
            setText("");
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't save");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label htmlFor="note" className="sr-only">
          Add a note
        </label>
        <textarea
          id="note"
          rows={2}
          maxLength={1000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a note for the team — only staff can see it"
          className="rounded-sm border border-border px-3 py-2 text-sm"
        />
        <div className="flex items-center gap-3">
          <button type="submit" disabled={busy || !text.trim()} className={adminBtn("secondary")}>
            {busy ? "Saving…" : "Add note"}
          </button>
          {error && <p className="text-sm text-red-sale">{error}</p>}
        </div>
      </form>
    </Panel>
  );
}

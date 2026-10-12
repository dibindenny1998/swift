"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFetch } from "./fields";
import { adminBtn } from "./ui";

export function ReviewModeration({ id, approved, reply }: { id: string; approved: boolean; reply: string | null }) {
  const router = useRouter();
  const [text, setText] = useState(reply ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const act = async (body: unknown, method = "PATCH") => {
    setBusy(true);
    setError("");
    try {
      await adminFetch(method, `/api/admin/reviews/${id}`, method === "DELETE" ? undefined : body);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mt-3 flex flex-col gap-2">
      <label className="sr-only" htmlFor={`reply-${id}`}>
        Reply
      </label>
      <textarea id={`reply-${id}`} rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Public reply from swift.in (optional)" className="rounded-sm border border-border p-2 text-sm" />
      <div className="flex flex-wrap gap-2">
        {approved ? (
          <button type="button" disabled={busy} onClick={() => act({ isApproved: false })} className={adminBtn("secondary")}>
            Hide
          </button>
        ) : (
          <button type="button" disabled={busy} onClick={() => act({ isApproved: true, reply: text || null })} className={adminBtn("primary")}>
            Approve{text ? " & reply" : ""}
          </button>
        )}
        {(text || "") !== (reply ?? "") && (
          <button type="button" disabled={busy} onClick={() => act({ reply: text || null })} className={adminBtn("secondary")}>
            Save reply
          </button>
        )}
        <button type="button" disabled={busy} onClick={() => confirm("Delete this review permanently?") && act(null, "DELETE")} className={adminBtn("danger")}>
          Delete
        </button>
      </div>
      {error && <p className="text-xs text-red-sale">{error}</p>}
    </div>
  );
}

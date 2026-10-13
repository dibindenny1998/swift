"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFetch } from "./fields";
import { adminBtn } from "./ui";

/** WhatsApp (opens wa.me with the message filled in) and email reminder buttons for one cart. */
export function CartRemind({ cartId, waLink, hasEmail }: { cartId: string; waLink: string | null; hasEmail: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const mark = async (channel: "email" | "whatsapp") => {
    setMsg("");
    try {
      const r = await adminFetch<{ note?: string }>("POST", `/api/admin/carts/${cartId}/remind`, { channel });
      setMsg(r.note ?? (channel === "email" ? "Email sent." : ""));
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    }
  };
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-2">
        {waLink && (
          <a href={waLink} target="_blank" rel="noopener noreferrer" onClick={() => void mark("whatsapp")} className={adminBtn("primary", "h-10")}>
            WhatsApp
          </a>
        )}
        <button type="button" disabled={!hasEmail} title={hasEmail ? undefined : "No email on file"} onClick={() => mark("email")} className={adminBtn("secondary", "h-10")}>
          Email
        </button>
      </div>
      {msg && <p className="max-w-[260px] text-right text-xs text-muted">{msg}</p>}
    </div>
  );
}

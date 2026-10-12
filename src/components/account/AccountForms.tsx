"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { refreshCart } from "@/lib/cart-store";
import { cn } from "@/lib/cn";
import { RETURN_REASONS } from "@/lib/returns";
import { setSessionUser } from "@/lib/session-store";

async function send(method: string, url: string, body?: unknown) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Something went wrong");
  return data;
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await send("POST", "/api/auth/logout").catch(() => {});
        setSessionUser(null);
        await refreshCart();
        router.replace("/");
        router.refresh();
      }}
      className="flex min-h-11 items-center text-[15px] font-semibold text-muted hover:text-text"
    >
      Log out
    </button>
  );
}

export function NameForm({ initial }: { initial: string | null }) {
  const router = useRouter();
  const [editing, setEditing] = useState(!initial);
  const [name, setName] = useState(initial ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!editing) {
    return (
      <button type="button" onClick={() => setEditing(true)} className="min-h-11 text-sm font-semibold text-green-300">
        Edit name
      </button>
    );
  }
  return (
    <form
      className="mt-3 flex flex-col gap-2"
      onSubmit={async (e: FormEvent) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          const { user } = await send("PATCH", "/api/account", { name });
          setSessionUser(user);
          setEditing(false);
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Couldn't save");
        } finally {
          setBusy(false);
        }
      }}
    >
      <label htmlFor="acct-name" className="text-[13px] font-semibold">
        Your name
      </label>
      <div className="flex gap-2">
        <input
          id="acct-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className="h-11 min-w-0 flex-1 rounded-full border border-border bg-white px-4 text-[15px] outline-none focus:border-green-200"
        />
        <button type="submit" disabled={busy} className="h-11 rounded-full bg-green-300 px-5 text-sm font-semibold text-ivory disabled:opacity-60">
          Save
        </button>
      </div>
      {error && <p className="text-xs text-red-sale">{error}</p>}
    </form>
  );
}

export function ReturnForm({ orderLabel, items }: { orderLabel: string; items: { id: string; title: string; qty: number }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>(items.length === 1 ? [items[0].id] : []);
  const [reason, setReason] = useState<(typeof RETURN_REASONS)[number]>(RETURN_REASONS[0]);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="flex h-12 items-center justify-center rounded-full border border-green-300 px-6 text-[15px] font-semibold text-green-300">
        Request a return
      </button>
    );
  }
  return (
    <form
      className="flex flex-col gap-4 rounded-lg border border-border bg-white p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          await send("POST", `/api/orders/${orderLabel}/return`, { itemIds: picked, reason, details: details || undefined });
          setOpen(false);
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Couldn't submit");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3 className="text-[17px] font-semibold">Request a return</h3>
      <fieldset>
        <legend className="text-[13px] font-semibold">Which items?</legend>
        <div className="mt-2 flex flex-col gap-1">
          {items.map((i) => (
            <label key={i.id} className="flex min-h-11 items-center gap-3 text-[15px]">
              <input
                type="checkbox"
                checked={picked.includes(i.id)}
                onChange={(e) => setPicked((p) => (e.target.checked ? [...p, i.id] : p.filter((x) => x !== i.id)))}
                className="size-5 accent-[#0B5E3E]"
              />
              {i.title}
              {i.qty > 1 && <span className="text-muted">× {i.qty}</span>}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ret-reason" className="text-[13px] font-semibold">
          Reason
        </label>
        <select
          id="ret-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value as (typeof RETURN_REASONS)[number])}
          className="h-12 rounded-sm border border-border bg-white px-4 text-[15px]"
        >
          {RETURN_REASONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ret-details" className="text-[13px] font-semibold">
          Details {reason !== "Other" && <span className="font-normal text-muted">(optional)</span>}
        </label>
        <textarea
          id="ret-details"
          rows={3}
          maxLength={1000}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="What went wrong? Photos help — you can share them with us on WhatsApp."
          className="rounded-sm border border-border bg-white p-3 text-[15px] outline-none focus:border-green-200"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-sale">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <button type="submit" disabled={busy || picked.length === 0} className="h-12 flex-1 rounded-full bg-green-300 text-[15px] font-semibold text-ivory disabled:opacity-50">
          {busy ? "Sending…" : "Submit request"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="h-12 rounded-full border border-border px-5 text-[15px] font-semibold">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function ReviewForm({ productId, title }: { productId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");

  if (state === "done") return <p className="text-sm text-green-300">Thanks! Your review will appear once it&apos;s approved.</p>;
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="min-h-11 text-sm font-semibold text-green-300">
        Write a review
      </button>
    );
  }
  return (
    <form
      className="mt-2 flex flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("busy");
        setError("");
        try {
          await send("POST", "/api/reviews", { productId, rating, text });
          setState("done");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Couldn't submit");
          setState("idle");
        }
      }}
    >
      <fieldset>
        <legend className="text-[13px] font-semibold">Your rating for {title}</legend>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer">
              <input type="radio" name={`rating-${productId}`} value={n} checked={rating === n} onChange={() => setRating(n)} className="peer sr-only" />
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-full text-[22px] peer-focus-visible:outline-2 peer-focus-visible:outline-gold-deep",
                  n <= rating ? "text-gold-deep" : "text-divider",
                )}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
              >
                ★
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <label htmlFor={`rv-${productId}`} className="sr-only">
        Your review
      </label>
      <textarea
        id={`rv-${productId}`}
        rows={3}
        maxLength={1000}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="How did it look in your home?"
        className="rounded-sm border border-border bg-white p-3 text-[15px] outline-none focus:border-green-200"
      />
      {error && <p className="text-xs text-red-sale">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={state === "busy"} className="h-11 rounded-full bg-green-300 px-6 text-sm font-semibold text-ivory disabled:opacity-50">
          Submit review
        </button>
        <button type="button" onClick={() => setOpen(false)} className="h-11 rounded-full px-4 text-sm font-semibold text-muted">
          Cancel
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState, type FormEvent } from "react";

export function SignupForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const contact = String(new FormData(e.currentTarget).get("contact") ?? "").trim();
    setState("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setState("done");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (state === "done") {
    return (
      <p role="status" className="font-display text-[18px] italic text-gold-light">
        You&apos;re on the list — early-bird offers are on their way.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2.5" noValidate>
      <label htmlFor="footer-contact" className="text-sm text-on-green-muted">
        Early-bird offers on WhatsApp or email
      </label>
      <div className="flex gap-2">
        <input
          id="footer-contact"
          name="contact"
          required
          autoComplete="email"
          placeholder="Email or phone"
          aria-invalid={state === "error" || undefined}
          aria-describedby={state === "error" ? "footer-contact-error" : undefined}
          className="h-[52px] min-w-0 flex-1 rounded-full border border-gold-line/45 bg-transparent px-5 text-[15px] font-medium text-ivory outline-none placeholder:text-on-green-muted/70 focus:border-gold-line"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="h-[52px] rounded-full bg-[image:var(--grad-gold-btn)] px-[22px] text-[15px] font-bold text-gold-on shadow-[inset_0_1px_0_rgba(255,255,255,.5)] transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          Join
        </button>
      </div>
      {state === "error" && (
        <p id="footer-contact-error" className="text-xs text-gold-light">
          {message}
        </p>
      )}
    </form>
  );
}

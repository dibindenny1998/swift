"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { refreshCart } from "@/lib/cart-store";
import { setSessionUser, type SessionUser } from "@/lib/session-store";
import { syncWishlist } from "@/lib/wishlist-store";

const RESEND_SECONDS = 30;

/** Only allow same-site relative redirects after login. */
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

/** Digits only; drops a pasted +91 / 0 prefix and caps at 10 (spaces don't count). */
function cleanPhone(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (d.length > 10 && d.startsWith("91")) d = d.slice(2);
  else if (d.length > 10 && d.startsWith("0")) d = d.slice(1);
  return d.slice(0, 10);
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Something went wrong");
  return data as T;
}

export function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const codeInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (step === "code") codeInput.current?.focus();
  }, [step]);

  async function sendCode(e?: FormEvent) {
    e?.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await post<{ devCode?: string }>("/api/auth/otp/send", { phone });
      setDevCode(r.devCode ?? null);
      setStep("code");
      setCode("");
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send the code");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e?: FormEvent) {
    e?.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { user } = await post<{ user: Omit<SessionUser, "role"> }>("/api/auth/otp/verify", { phone, code });
      setSessionUser({ ...user, role: "CUSTOMER" });
      await Promise.all([refreshCart(), syncWishlist()]);
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't verify the code");
      setBusy(false);
    }
  }

  const inputCls =
    "h-14 w-full rounded-full border bg-white px-5 text-[18px] tracking-[0.08em] outline-none transition-colors focus:border-green-200";

  if (step === "phone") {
    return (
      <form onSubmit={sendCode} className="mt-8 flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="phone" className="text-[13px] font-semibold">
            Mobile number
          </label>
          <div className={`mt-1.5 flex items-center ${inputCls} ${error ? "border-red-sale" : "border-border"}`}>
            <span className="mr-3 text-muted">+91</span>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={phone}
              onChange={(e) => setPhone(cleanPhone(e.target.value))}
              placeholder="98765 43210"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "login-error" : "phone-hint"}
              className="h-full min-w-0 flex-1 bg-transparent outline-none"
              autoFocus
            />
          </div>
          <p id="phone-hint" className="mt-1.5 text-xs text-muted">
            We&apos;ll text you a 6-digit code. No passwords.
          </p>
        </div>
        {error && (
          <p id="login-error" role="alert" className="text-sm text-red-sale">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="h-[54px] rounded-full bg-[image:var(--grad-gold-btn)] text-[15px] font-bold text-gold-on shadow-[inset_0_1px_0_rgba(255,255,255,.5)] active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? "Sending…" : "Send code"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verify} className="mt-8 flex flex-col gap-4" noValidate>
      <p className="text-[15px] text-muted">
        Enter the code sent to <strong className="text-text">+91 {phone.slice(0, 5)} {phone.slice(5)}</strong>{" "}
        <button
          type="button"
          onClick={() => {
            setStep("phone");
            setError("");
          }}
          className="min-h-11 font-semibold text-green-300 underline-offset-4 hover:underline"
        >
          Change
        </button>
      </p>
      {devCode && (
        <p className="rounded-sm border border-dashed border-gold-line bg-white px-4 py-2 text-[13px] text-gold-ink">
          Test mode (no SMS provider yet) — your code is <strong className="tracking-[0.1em]">{devCode}</strong>
        </p>
      )}
      <div>
        <label htmlFor="otp" className="text-[13px] font-semibold">
          6-digit code
        </label>
        <input
          ref={codeInput}
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 6);
            setCode(v);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "login-error" : undefined}
          className={`mt-1.5 text-center text-[24px] tracking-[0.5em] ${inputCls} ${error ? "border-red-sale" : "border-border"}`}
        />
      </div>
      {error && (
        <p id="login-error" role="alert" className="text-sm text-red-sale">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || code.length !== 6}
        className="h-[54px] rounded-full bg-[image:var(--grad-gold-btn)] text-[15px] font-bold text-gold-on shadow-[inset_0_1px_0_rgba(255,255,255,.5)] active:scale-[0.98] disabled:opacity-60"
      >
        {busy ? "Verifying…" : "Verify & continue"}
      </button>
      <button
        type="button"
        onClick={() => sendCode()}
        disabled={cooldown > 0 || busy}
        className="min-h-11 text-sm font-semibold text-green-300 disabled:text-muted"
      >
        {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
      </button>
    </form>
  );
}

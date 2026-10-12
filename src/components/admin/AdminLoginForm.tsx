"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { adminFetch, TextField } from "./fields";

export function AdminLoginForm() {
  const router = useRouter();
  const nextParam = useSearchParams().get("next");
  const next = nextParam && nextParam.startsWith("/admin") ? nextParam : "/admin";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await adminFetch("POST", "/api/admin/auth/login", { email: f.get("email"), password: f.get("password") });
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't sign in");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
      <TextField label="Email" name="email" type="email" autoComplete="username" required autoFocus />
      <TextField label="Password" name="password" type="password" autoComplete="current-password" required />
      {error && (
        <p role="alert" className="text-sm text-red-sale">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className="h-12 rounded-full bg-green-300 text-[15px] font-semibold text-ivory disabled:opacity-60">
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

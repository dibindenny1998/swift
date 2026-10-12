import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-md px-6 pb-20 pt-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-ink">Welcome</p>
      <h1 className="mt-2 font-display text-[34px] font-medium leading-[1.1] text-green-heading">
        Sign in with your <em>phone</em>
      </h1>
      <p className="mt-3 text-[15px] text-muted">Track orders, save addresses and keep your wishlist on every device.</p>
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="mt-8 text-xs text-muted">
        By continuing you agree to our terms and privacy policy. We only text you about your account and orders.
      </p>
    </div>
  );
}

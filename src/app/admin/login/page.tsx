import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

export default function AdminLogin() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-grad-footer px-4">
      <div className="w-full max-w-sm rounded-lg bg-ivory p-8 shadow-2xl">
        <p className="text-center font-display text-[28px] font-semibold text-gold-dark">
          swift<em className="font-medium text-green-heading">.in</em>
        </p>
        <h1 className="mt-1 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted">Admin</h1>
        <Suspense>
          <AdminLoginForm />
        </Suspense>
      </div>
    </main>
  );
}

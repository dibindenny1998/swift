import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AddressBook } from "@/components/account/AddressBook";
import { BackToAccount } from "@/components/account/AccountNav";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Addresses", robots: { index: false } };

export default function AddressesPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-6">
      <BackToAccount />
      <h1 className="mt-2 font-display text-[32px] font-medium text-green-heading">Saved addresses</h1>
      <Suspense fallback={<div aria-hidden className="mt-6 h-40 animate-pulse rounded-lg bg-divider/60" />}>
        <Book />
      </Suspense>
    </div>
  );
}

async function Book() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/addresses");
  const user = await db.user.findUnique({ where: { id: session.uid }, select: { phone: true } });
  return <AddressBook phone={user?.phone ?? null} />;
}

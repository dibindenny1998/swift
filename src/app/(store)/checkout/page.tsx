import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/CheckoutView";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10">
      <h1 className="font-display text-[34px] font-medium leading-[1.1] text-green-heading">Checkout</h1>
      <CheckoutView />
    </div>
  );
}

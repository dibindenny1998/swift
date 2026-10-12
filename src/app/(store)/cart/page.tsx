import type { Metadata } from "next";
import { CartPage } from "@/components/cart/CartPage";

export const metadata: Metadata = { title: "Your cart", robots: { index: false } };

export default function Cart() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10">
      <h1 className="font-display text-[34px] font-medium leading-[1.1] text-green-heading">Your cart</h1>
      <CartPage />
    </div>
  );
}

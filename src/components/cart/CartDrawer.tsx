"use client";

import Link from "next/link";
import { Drawer } from "@/components/ui/Drawer";
import { useCart, useCartDrawer } from "@/lib/cart-store";
import { formatINR } from "@/lib/money";
import { CartLines, EmptyCart, FreeShippingBar } from "./CartLines";
import { CheckoutLink } from "./CheckoutLink";

export function CartDrawer() {
  const { cart } = useCart();
  const { open, setOpen } = useCartDrawer();
  const close = () => setOpen(false);

  return (
    <Drawer open={open} onClose={close} title={cart && cart.count > 0 ? `Your cart (${cart.count})` : "Your cart"} side="right">
      {!cart ? (
        <div aria-hidden className="flex animate-pulse flex-col gap-4">
          <div className="h-20 rounded-sm bg-divider/60" />
          <div className="h-20 rounded-sm bg-divider/60" />
        </div>
      ) : cart.items.length === 0 ? (
        <EmptyCart onNavigate={close} />
      ) : (
        <div className="flex min-h-full flex-col">
          <FreeShippingBar remaining={cart.freeShippingRemaining} threshold={cart.freeShippingThreshold} />
          <div className="mt-2 flex-1">
            <CartLines items={cart.items} compact onNavigate={close} />
          </div>
          <div className="sticky bottom-0 -mx-5 -mb-5 mt-4 border-t border-divider bg-ivory px-5 pb-5 pt-4">
            <dl className="flex flex-col gap-1 text-[15px]">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums">{formatINR(cart.subtotal)}</dd>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-green-300">
                  <dt>Discount ({cart.coupon?.code})</dt>
                  <dd className="tabular-nums">−{formatINR(cart.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between font-bold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatINR(cart.total)}</dd>
              </div>
            </dl>
            <p className="mt-1 text-xs text-muted">{cart.shipping > 0 ? `Includes ${formatINR(cart.shipping)} shipping` : "Free shipping"} · prices include GST</p>
            {cart.hasIssues && <p className="mt-2 text-[13px] text-red-sale">Please update the items marked above.</p>}
            <div className="mt-3 flex flex-col gap-2">
              <CheckoutLink disabled={cart.hasIssues} onNavigate={close} />
              <Link href="/cart" onClick={close} className="flex min-h-11 items-center justify-center text-[15px] font-semibold text-green-300">
                View cart, gift wrap &amp; coupons
              </Link>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}

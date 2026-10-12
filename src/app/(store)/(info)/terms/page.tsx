import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/layout/InfoPage";
import { businessInfo } from "@/lib/business";

export const metadata: Metadata = { title: "Terms of use", description: "Terms for using swift.in and buying from us.", alternates: { canonical: "/terms" } };

export default async function Terms() {
  const b = await businessInfo();
  return (
    <InfoPage eyebrow="Policies" title="Terms of use" updated intro={`These terms apply when you use swift.in, operated by ${b.name}, ${b.address.replace(/\n/g, ", ")}. By placing an order you agree to them.`}>
      <h2>Products and prices</h2>
      <ul>
        <li>All prices are in Indian Rupees and include GST. Shipping and any cash-on-delivery fee are shown before you pay.</li>
        <li>We describe and photograph products as accurately as we can; small differences in colour or finish can occur.</li>
        <li>If a price is shown incorrectly because of an obvious error, we&apos;ll contact you before shipping and you may cancel for a full refund.</li>
      </ul>
      <h2>Orders</h2>
      <p>
        An order is confirmed when payment succeeds or, for cash on delivery, when we confirm it with you. We may cancel an order (with a full refund) if an item is unavailable or we
        can&apos;t deliver to your address.
      </p>
      <h2>Offers and coupons</h2>
      <p>Coupons have the conditions shown with them (minimum order, dates, one per customer and so on). Only one coupon applies per order. Countdowns and stock levels on the site are always real.</p>
      <h2>Your account</h2>
      <p>You sign in with a one-time code sent to your phone. Keep your phone secure, and tell us straight away if you think someone else has accessed your account.</p>
      <h2>Shipping, returns and refunds</h2>
      <p>
        See our <Link href="/shipping-policy">shipping policy</Link> and <Link href="/refund-policy">returns &amp; refunds policy</Link>.
      </p>
      <h2>Liability</h2>
      <p>
        Use electrical items such as lights as instructed on their packaging. Our liability for any order is limited to the amount you paid for it, except where the law does not allow
        this limit.
      </p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India. Courts in Bengaluru, Karnataka have jurisdiction.</p>
      <h2>Contact</h2>
      <p>
        <Link href="/contact">Contact us</Link> at <a href={`mailto:${b.email}`}>{b.email}</a>.
      </p>
    </InfoPage>
  );
}

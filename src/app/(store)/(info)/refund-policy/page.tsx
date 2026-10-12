import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/layout/InfoPage";
import { businessInfo } from "@/lib/business";

export const metadata: Metadata = { title: "Returns & refunds", description: "How to return an item and get a refund from swift.in — 7-day easy returns.", alternates: { canonical: "/refund-policy" } };

export default async function RefundPolicy() {
  const b = await businessInfo();
  return (
    <InfoPage eyebrow="Policies" title="Returns & refunds" updated>
      <h2>7-day easy returns</h2>
      <p>If something isn&apos;t right, you can request a return within 7 days of delivery. Items must be unused, with all parts and in their original packaging.</p>
      <h3>Not returnable</h3>
      <ul>
        <li>Personalised items (for example stockings with a name added) and handwritten gift notes.</li>
        <li>Candles and other consumables once the seal is opened.</li>
        <li>Items damaged through misuse after delivery.</li>
      </ul>
      <h2>How to request a return</h2>
      <ol>
        <li>
          Sign in and open the order in <Link href="/account">My account</Link>.
        </li>
        <li>Tap “Request a return”, choose the items and tell us what went wrong.</li>
        <li>We&apos;ll review it within 2 working days and arrange a pickup where available, or share the return address.</li>
      </ol>
      <h2>Damaged, defective or wrong items</h2>
      <p>Please contact us within 48 hours of delivery with photos. We&apos;ll replace the item or refund you in full, including any shipping you paid, at no cost to you.</p>
      <h2>Refunds</h2>
      <ul>
        <li>Once we receive and check the returned item, we refund within 2 working days.</li>
        <li>Online payments are refunded to the original payment method (UPI, card or bank); banks usually take 5–7 working days to show it.</li>
        {b.codEnabled && <li>Cash on delivery orders are refunded by bank transfer or UPI to an account you share with us.</li>}
        <li>Shipping and cash-on-delivery fees are refunded only when the return is due to our error.</li>
      </ul>
      <h2>Cancellations</h2>
      <p>You can cancel any order before it ships — contact us on WhatsApp or by email. Paid orders are refunded in full to the original payment method.</p>
      <p>
        Questions? <Link href="/contact">Contact us</Link> at <a href={`mailto:${b.email}`}>{b.email}</a>.
      </p>
    </InfoPage>
  );
}

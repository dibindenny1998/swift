import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/layout/InfoPage";
import { businessInfo } from "@/lib/business";

export const metadata: Metadata = { title: "Shipping policy", description: "Delivery areas, timelines, charges and tracking for swift.in orders.", alternates: { canonical: "/shipping-policy" } };

export default async function ShippingPolicy() {
  const b = await businessInfo();
  return (
    <InfoPage eyebrow="Policies" title="Shipping policy" updated>
      <h2>Where we deliver</h2>
      <p>We ship across India through trusted courier partners. Enter your pincode on any product page to confirm delivery to your address before you order.</p>
      <h2>Dispatch and delivery times</h2>
      <ul>
        <li>Orders are packed and dispatched from Bengaluru within 1–2 working days.</li>
        <li>Delivery usually takes 1–3 working days within Karnataka and 3–7 working days elsewhere; the north-east, Jammu &amp; Kashmir and Ladakh can take up to 9 working days.</li>
        <li>
          <strong>Christmas cut-off:</strong> order by {b.lastOrder} for delivery before Christmas. Orders after this date are delivered as quickly as possible but may arrive after 25 December.
        </li>
      </ul>
      <h2>Shipping charges</h2>
      <p>
        Shipping is free on orders over {b.freeShipping} (after discounts). Below that, a flat {b.shippingFee} applies.
        {b.codEnabled && b.codFee && ` Cash on delivery orders carry a ${b.codFee} handling fee.`} All charges are shown before you pay.
      </p>
      <h2>Tracking</h2>
      <p>
        You&apos;ll get your courier name and tracking number by email as soon as your order ships, and live tracking is always available in <Link href="/account">My account</Link>.
      </p>
      <h2>Delays and failed deliveries</h2>
      <p>
        Courier delays caused by weather, strikes or other events outside our control are rare but possible — we&apos;ll keep you informed. If a delivery fails because the address is
        incorrect or nobody is available after several attempts, the parcel returns to us and we&apos;ll contact you to arrange re-delivery (re-shipping charges may apply).
      </p>
      <h2>Damaged parcels</h2>
      <p>If your parcel arrives damaged, please take photos and contact us within 48 hours of delivery — we&apos;ll arrange a replacement or refund.</p>
    </InfoPage>
  );
}

import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";
import { businessInfo } from "@/lib/business";

export const metadata: Metadata = { title: "Privacy policy", description: "What personal data swift.in collects, why, and how we protect it.", alternates: { canonical: "/privacy-policy" } };

export default async function PrivacyPolicy() {
  const b = await businessInfo();
  return (
    <InfoPage eyebrow="Policies" title="Privacy policy" updated intro={`${b.name} (“we”) respects your privacy. This policy explains what we collect when you use swift.in and how we use it, in line with the Digital Personal Data Protection Act, 2023.`}>
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account:</strong> your mobile number (to sign you in with a one-time code), and your name and email if you add them.
        </li>
        <li>
          <strong>Orders:</strong> delivery addresses, items ordered, gift notes and order history.
        </li>
        <li>
          <strong>Payments:</strong> handled by Razorpay. We never see or store your card, UPI PIN or bank details — only a payment reference and status.
        </li>
        <li>
          <strong>Site usage:</strong> if you accept analytics cookies, anonymous usage data through Google Analytics and Meta Pixel. If you decline, these never load.
        </li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To process, deliver and support your orders, and to send order and delivery updates.</li>
        <li>To prevent fraud and keep your account secure.</li>
        <li>To send offers only if you sign up for them — you can unsubscribe at any time.</li>
      </ul>
      <h2>Who we share it with</h2>
      <p>
        Only the service providers needed to run the shop: Razorpay (payments), our courier partners via Shiprocket (deliveries), MSG91 (login SMS), our email provider (order emails) and our hosting
        provider. We never sell your personal data.
      </p>
      <h2>How long we keep it</h2>
      <p>We keep order records for as long as tax law requires (currently 8 years). You can ask us to delete your account and other data at any time.</p>
      <h2>Your rights</h2>
      <p>
        You can ask to see, correct or delete your personal data, or withdraw consent, by emailing <a href={`mailto:${b.email}`}>{b.email}</a>
        {b.grievance ? ` (attention: ${b.grievance}, grievance officer)` : ""}. We respond within 30 days.
      </p>
      <h2>Cookies</h2>
      <p>
        We use essential cookies to keep you signed in and remember your cart. Analytics cookies load only after you accept them in the banner; you can change your choice by clearing your
        browser&apos;s site data.
      </p>
      <h2>Security</h2>
      <p>Data is sent over HTTPS, login codes are stored only as one-way hashes, and access to customer data is limited to our team.</p>
    </InfoPage>
  );
}

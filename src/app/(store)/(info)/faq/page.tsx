import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";
import { businessInfo } from "@/lib/business";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Delivery dates, payment options, gift wrap, returns and more — answers to common questions about shopping at swift.in.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const b = await businessInfo();
  const faqs: { q: string; a: string }[] = [
    { q: "Will my order arrive before Christmas?", a: `Yes, if you order by ${b.lastOrder}. Check the delivery date for your pincode on any product page — it uses live courier estimates.` },
    { q: "How much is shipping?", a: `Shipping is free on orders over ${b.freeShipping}. Below that it's ${b.shippingFee} anywhere we deliver in India.` },
    {
      q: "Which payment methods do you accept?",
      a: `UPI (GPay, PhonePe, Paytm and others), credit and debit cards, and netbanking through Razorpay.${b.codEnabled ? ` Cash on delivery is available${b.codFee ? ` for a ${b.codFee} handling fee` : ""}.` : ""}`,
    },
    { q: "Do prices include GST?", a: "Yes. Every price on the site includes GST, and you'll get a GST invoice with your order." },
    { q: "Is gift wrapping really free?", a: "Yes — every order comes in our gold gift wrap. Add a note in your cart and we'll handwrite it on a gold card." },
    { q: "What is the build-your-own gift box?", a: "Pick your favourite pieces from the gift box collection. The more you add, the bigger the discount — the tiers are shown as you build." },
    { q: "How do I track my order?", a: "Sign in with your phone number and open My account. You'll see live tracking once your parcel ships, and we'll also email you at each step." },
    { q: "Can I return something?", a: "Yes, within 7 days of delivery for unused items in their original packaging. Request a return from your order in My account." },
    { q: "Do you deliver everywhere in India?", a: "We deliver to most pincodes through our courier partners. Enter your pincode on a product page to check." },
    { q: "Do I need an account to order?", a: "You sign in with your mobile number and a one-time code at checkout — no passwords. Your cart and wishlist are kept when you sign in." },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <InfoPage eyebrow="Help" title="Questions, answered">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="divide-y divide-divider border-y border-divider">
        {faqs.map((f) => (
          <details key={f.q} className="group">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-[16px] font-semibold [&::-webkit-details-marker]:hidden">
              {f.q}
              <span aria-hidden className="text-xl text-gold-dark transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="!mt-0 pb-5 text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </InfoPage>
  );
}

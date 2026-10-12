import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/layout/InfoPage";
import { businessInfo } from "@/lib/business";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Questions about an order, delivery or returns? Reach swift.in on WhatsApp or email.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const b = await businessInfo();
  const card = "flex flex-col gap-1 rounded-lg border border-border bg-white p-5 no-underline";
  return (
    <InfoPage eyebrow="We're here to help" title="Contact us" intro={`Our customer care team is available ${b.hours}.`}>
      <div className="not-prose grid gap-3 sm:grid-cols-2">
        {b.whatsapp && (
          <a href={b.whatsapp.href} target="_blank" rel="noopener noreferrer" className={card}>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">WhatsApp</span>
            <span className="text-[17px] text-green-300">{b.whatsapp.display}</span>
            <span className="text-[13px] font-normal text-muted">Fastest for order questions</span>
          </a>
        )}
        <a href={`mailto:${b.email}`} className={card}>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Email</span>
          <span className="text-[17px] text-green-300">{b.email}</span>
          <span className="text-[13px] font-normal text-muted">We reply within one working day</span>
        </a>
        <Link href="/account" className={card}>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Track an order</span>
          <span className="text-[17px] text-green-300">My account →</span>
          <span className="text-[13px] font-normal text-muted">Live tracking, returns and invoices</span>
        </Link>
      </div>

      <h2>Registered business</h2>
      <p>
        <strong>{b.name}</strong>
        <br />
        <span className="whitespace-pre-line">{b.address}</span>
        {b.gstin && (
          <>
            <br />
            GSTIN: {b.gstin}
          </>
        )}
      </p>

      <h2>Grievance officer</h2>
      <p>
        In line with the Consumer Protection (E-Commerce) Rules, 2020, complaints can be sent to our grievance officer
        {b.grievance ? (
          <>
            , <strong>{b.grievance}</strong>,
          </>
        ) : null}{" "}
        at <a href={`mailto:${b.email}`}>{b.email}</a>. We acknowledge complaints within 48 hours and resolve them within one month.
      </p>
    </InfoPage>
  );
}

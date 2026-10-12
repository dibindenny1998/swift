import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/layout/InfoPage";
import { businessInfo } from "@/lib/business";

export const metadata: Metadata = {
  title: "About us",
  description: "swift.in is a Bangalore-based Christmas shop: heirloom trees, warm lights and gifts, wrapped in gold and delivered across India.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const b = await businessInfo();
  return (
    <InfoPage eyebrow="Our story" title={<>Christmas, made <em>simple</em> and beautiful</>} intro="We started swift.in in Bangalore with one idea: finding a Christmas tree, lights and gifts that feel special shouldn't take a dozen shops and a lot of guesswork.">
      <p>
        Every piece in our collection is chosen to last more than one season — full, natural-looking trees; warm lights that don&apos;t look harsh;
        ornaments in royal red, emerald and gold. We test what we sell in our own homes first.
      </p>
      <h2>What we promise</h2>
      <ul>
        <li>
          <strong>Delivered before Christmas</strong> — order by {b.lastOrder} for delivery anywhere we ship in India.
        </li>
        <li>
          <strong>Gold gift wrap</strong> on every order, with a handwritten note if you&apos;d like one.
        </li>
        <li>
          <strong>Honest prices</strong> — every price includes GST, and shipping is free over {b.freeShipping}. Stock counts and countdowns on the site are always real.
        </li>
        <li>
          <strong>Easy returns</strong> within 7 days of delivery. See our <Link href="/refund-policy">return policy</Link>.
        </li>
      </ul>
      <h2>Say hello</h2>
      <p>
        We&apos;re a small team and we read every message. <Link href="/contact">Get in touch</Link> — we usually reply within a working day.
      </p>
    </InfoPage>
  );
}

import Link from "next/link";
import { Mascot } from "@/components/mascot/Mascot";
import { SignupForm } from "./SignupForm";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/account", label: "Track order" },
  { href: "/shipping-policy", label: "Shipping" },
  { href: "/refund-policy", label: "Returns" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

function formatDayMonth(isoDate: string) {
  return new Intl.DateTimeFormat("en-IN", { month: "long", day: "numeric", timeZone: "Asia/Kolkata" }).format(
    new Date(`${isoDate}T12:00:00+05:30`),
  );
}

export function Footer({ lastOrderDate, showMascot, social = {} }: { lastOrderDate: string; showMascot: boolean; social?: { instagram?: string; facebook?: string; youtube?: string } }) {
  const socials = (["instagram", "facebook", "youtube"] as const).filter((k) => social[k]);
  return (
    <footer className="relative overflow-hidden bg-grad-footer text-on-green-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-10 pt-[52px] md:grid md:grid-cols-2 md:gap-x-16">
        <div className="flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-line">Before the sleigh leaves</p>
          <h2 className="font-display text-[30px] font-medium leading-[1.15] text-ivory">
            Last order for Christmas delivery is <em className="text-gold">{formatDayMonth(lastOrderDate)}</em>
          </h2>
          <SignupForm />
          <div className="h-px bg-gold-line/25" />
          <nav aria-label="Footer" className="grid grid-cols-2">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="flex min-h-11 items-center text-[14.5px] hover:text-ivory">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {showMascot && (
          <div className="relative -mr-6 mt-2 flex h-[230px] items-end justify-end md:mr-0 md:self-end">
            <div aria-hidden className="absolute -right-16 bottom-0 h-12 w-[300px] rounded-[50%] bg-ivory" />
            <div aria-hidden className="absolute -right-2.5 bottom-3 h-[30px] w-[200px] rounded-[50%] bg-[#EFE7D4]" />
            <Mascot scene width={132} className="mb-5 mr-6" />
          </div>
        )}

        <div className="flex flex-col items-center gap-1.5 pt-3 md:col-span-2">
          <span className="font-display text-[30px] font-semibold text-gold">
            swift<em className="font-medium text-ivory">.in</em>
          </span>
          {socials.length > 0 && (
            <ul className="flex gap-4 text-sm">
              {socials.map((k) => (
                <li key={k}>
                  <a href={social[k]} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center capitalize hover:text-ivory">
                    {k}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <span className="text-xs text-[#9CC3AF]">© 2026 swift.in · Bangalore</span>
        </div>
      </div>
    </footer>
  );
}

import { Reveal } from "@/components/effects/Reveal";
import { Star } from "@/components/effects/Symbols";
import { formatINR } from "@/lib/money";

type Review = { text: string; name: string } | null;

function formatDayMonth(isoDate: string) {
  return new Intl.DateTimeFormat("en-IN", { month: "short", day: "numeric", timeZone: "Asia/Kolkata" }).format(
    new Date(`${isoDate}T12:00:00+05:30`),
  );
}

const icon = "flex size-11 flex-none items-center justify-center rounded-full border border-[#D9C48E]";

export function Promises({
  review,
  lastOrderDate,
  freeShippingThreshold,
  codEnabled,
}: {
  review: Review;
  lastOrderDate: string;
  freeShippingThreshold: number;
  codEnabled: boolean;
}) {
  const rows = [
    {
      title: "Delivered before Christmas",
      sub: `Order by ${formatDayMonth(lastOrderDate)} · free over ${formatINR(freeShippingThreshold)}`,
      path: (
        <>
          <path d="M3 7h11v9H3z" />
          <path d="M14 10h4l3 3v3h-7" />
          <circle cx="7" cy="18" r="1.6" />
          <circle cx="17" cy="18" r="1.6" />
        </>
      ),
    },
    {
      title: "Gold gift wrap, on us",
      sub: "With a handwritten note",
      path: (
        <>
          <rect x="4" y="10" width="16" height="11" rx="1" />
          <rect x="3" y="7" width="18" height="3.5" rx="1" />
          <path d="M12 7v14" />
        </>
      ),
    },
    {
      title: codEnabled ? "UPI, cards or cash on delivery" : "UPI, cards & netbanking",
      sub: "7-day easy returns",
      path: (
        <>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18" />
        </>
      ),
    },
  ];

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-9 px-6 py-14">
      {/* Only a real, approved review is ever shown here. */}
      {review && (
        <Reveal>
          <figure className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
            <div className="flex gap-1" role="img" aria-label="Rated 5 out of 5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} />
              ))}
            </div>
            <blockquote className="font-display text-[22px] font-medium italic leading-[1.45] text-green-heading">
              “{review.text}”
            </blockquote>
            <figcaption className="text-[13px] text-muted">{review.name}</figcaption>
          </figure>
          <div className="mt-9 h-px bg-divider" />
        </Reveal>
      )}
      <Reveal className="grid gap-5 md:grid-cols-3">
        {rows.map((r) => (
          <div key={r.title} className="flex items-center gap-4">
            <span className={icon}>
              <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B5E3E" strokeWidth="1.5">
                {r.path}
              </svg>
            </span>
            <div>
              <strong className="block text-[15px] font-semibold">{r.title}</strong>
              <span className="text-[13.5px] text-muted">{r.sub}</span>
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

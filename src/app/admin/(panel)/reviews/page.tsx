import Link from "next/link";
import { Suspense } from "react";
import { ReviewModeration } from "@/components/admin/ReviewModeration";
import { AdminSkeleton, Empty, PageHeader, Pill } from "@/components/admin/ui";
import { Stars } from "@/components/ui/Stars";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export const metadata = { title: "Reviews" };

export default function ReviewsPage(props: PageProps<"/admin/reviews">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Reviews searchParams={props.searchParams} />
    </Suspense>
  );
}

const day = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

async function Reviews({ searchParams }: Pick<PageProps<"/admin/reviews">, "searchParams">) {
  await requireAdmin("/admin/reviews");
  const show = (await searchParams).show === "approved" ? "approved" : "pending";
  const reviews = await db.review.findMany({
    where: { isApproved: show === "approved" },
    include: { product: { select: { title: true, slug: true } }, user: { select: { name: true, phone: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <>
      <PageHeader title="Reviews" description="Only approved reviews appear on the store. Reviews come only from customers whose order was delivered." />
      <div className="mb-4 flex gap-2">
        {(["pending", "approved"] as const).map((s) => (
          <Link key={s} href={`/admin/reviews?show=${s}`} aria-current={s === show ? "page" : undefined} className={`rounded-full px-4 py-2 text-sm font-semibold ${s === show ? "bg-green-300 text-ivory" : "border border-border bg-white"}`}>
            {s === "pending" ? "Waiting for approval" : "Approved"}
          </Link>
        ))}
      </div>
      {reviews.length === 0 ? (
        <Empty>{show === "pending" ? "Nothing waiting — all caught up." : "No approved reviews yet."}</Empty>
      ) : (
        <ul className="flex flex-col gap-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-lg border border-border bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Stars rating={r.rating} />
                  <Link href={`/products/${r.product.slug}`} target="_blank" className="text-sm font-semibold">
                    {r.product.title}
                  </Link>
                </span>
                <span className="text-xs text-muted">
                  {r.user.name ?? r.user.phone} · {day.format(r.createdAt)} {r.isApproved && <Pill tone="green">Live</Pill>}
                </span>
              </div>
              <p className="mt-2 text-[15px]">{r.text}</p>
              <ReviewModeration id={r.id} approved={r.isApproved} reply={r.reply} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

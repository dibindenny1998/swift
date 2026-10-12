import Link from "next/link";
import type { BundleCardData } from "@/lib/catalog";
import { formatINR, percentOff } from "@/lib/money";
import { AddButton } from "./AddButton";
import { ProductImage } from "./ProductImage";

export function BundleCard({ bundle }: { bundle: BundleCardData }) {
  const save = percentOff(bundle.price, bundle.compareAt);
  return (
    <article className="flex w-[286px] flex-none snap-start flex-col overflow-hidden rounded-lg border border-border bg-card shadow-[0_10px_30px_-22px_rgba(31,27,20,.35)] md:w-auto">
      <Link href={`/bundles/${bundle.slug}`} className="relative block h-[200px] bg-[#E6EDE7]" tabIndex={-1} aria-hidden>
        <ProductImage src={bundle.image} alt="" fill sizes="286px" className="object-cover" />
        {save > 0 && (
          <span className="absolute left-3.5 top-3.5 rounded-full bg-ivory px-3 py-1.5 text-xs font-bold text-red-sale">
            Save {save}%
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-[18px]">
        <h3 className="font-display text-[22px] font-medium text-green-heading">
          <Link href={`/bundles/${bundle.slug}`}>{bundle.title}</Link>
        </h3>
        <p className="text-[13.5px] leading-normal text-muted">{bundle.description}</p>
        <div className="mt-auto flex items-center justify-between pt-1.5">
          <p className="flex items-baseline gap-2">
            <strong className="text-lg font-bold">{formatINR(bundle.price)}</strong>
            {bundle.compareAt > bundle.price && (
              <s className="text-[13px] text-[#8C8270]">
                <span className="sr-only">MRP </span>
                {formatINR(bundle.compareAt)}
              </s>
            )}
          </p>
          <AddButton line={{ key: `b:${bundle.id}`, title: bundle.title, image: bundle.image, price: bundle.price }} />
        </div>
      </div>
    </article>
  );
}

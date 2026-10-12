import { cn } from "@/lib/cn";
import { formatINR, percentOff } from "@/lib/money";

/** Price (paise) with optional MRP strike-through and % off. Prices are GST-inclusive. */
export function PriceTag({
  price,
  mrp,
  showPercent,
  size = "md",
  className,
}: {
  price: number;
  mrp?: number;
  showPercent?: boolean;
  size?: "md" | "lg";
  className?: string;
}) {
  const off = mrp ? percentOff(price, mrp) : 0;
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      <span className={cn("font-bold text-text", size === "lg" ? "text-[22px]" : "text-base")}>
        {formatINR(price)}
      </span>
      {off > 0 && (
        <>
          <s className="text-[13px] text-muted">
            <span className="sr-only">MRP </span>
            {formatINR(mrp!)}
          </s>
          {showPercent && <span className="text-[13px] font-semibold text-red-sale">{off}% off</span>}
        </>
      )}
    </p>
  );
}

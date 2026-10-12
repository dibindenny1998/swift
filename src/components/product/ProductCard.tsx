import Link from "next/link";
import { Pill } from "@/components/ui/Pill";
import type { ProductCardData } from "@/lib/catalog";
import { formatINR } from "@/lib/money";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product, lowStockThreshold }: { product: ProductCardData; lowStockThreshold: number }) {
  // Real stock only — "X left" appears only at or below the admin threshold (§9).
  const lowStock = product.stock > 0 && product.stock <= lowStockThreshold;
  const soldOut = product.stock === 0;
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col gap-2.5 text-text transition-transform duration-150 active:scale-[0.98]"
    >
      <span className="relative block aspect-[4/5] overflow-hidden rounded-sm bg-[#F1E9D6]">
        <ProductImage
          src={product.image}
          alt={product.title}
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          className="object-cover transition-transform duration-700 ease-calm group-hover:scale-[1.03]"
        />
        <span className="absolute bottom-2.5 left-2.5">
          {soldOut ? (
            <Pill className="bg-ivory text-muted">Sold out</Pill>
          ) : lowStock ? (
            <Pill className="bg-ivory text-red-sale">{product.stock} left</Pill>
          ) : product.badge === "NEW" ? (
            <Pill className="bg-ivory text-green-300">New</Pill>
          ) : null}
        </span>
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-[14.5px] font-semibold leading-snug">{product.title}</span>
        <span className="text-sm text-muted">
          {formatINR(product.price)}
          {product.mrp > product.price && (
            <s className="ml-2 text-[13px] text-[#8C8270]">
              <span className="sr-only">MRP </span>
              {formatINR(product.mrp)}
            </s>
          )}
        </span>
      </span>
    </Link>
  );
}

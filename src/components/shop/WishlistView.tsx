"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Mascot } from "@/components/mascot/Mascot";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductCardData } from "@/lib/catalog";
import { useWishlist } from "@/lib/wishlist-store";

export function WishlistView({ lowStockThreshold }: { lowStockThreshold: number }) {
  const ids = useWishlist();
  const [products, setProducts] = useState<ProductCardData[] | null>(null);
  const key = ids.join(",");

  useEffect(() => {
    if (!key) return;
    const ctrl = new AbortController();
    fetch(`/api/products?ids=${encodeURIComponent(key)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: { products: ProductCardData[] }) => setProducts(d.products))
      .catch(() => {});
    return () => ctrl.abort();
  }, [key]);

  if (!key) {
    return (
      <div className="mt-10 flex flex-col items-center gap-4 text-center">
        <Mascot width={120} greeting="Tap the heart on anything you love!" />
        <p className="max-w-xs text-[15px] text-muted">Nothing saved yet. Tap the heart on any piece to keep it here.</p>
        <Link href="/shop" className="flex h-12 items-center rounded-full bg-green-300 px-7 text-[15px] font-semibold text-ivory active:scale-[0.98]">
          Browse the collection
        </Link>
      </div>
    );
  }

  // Items removed via the heart disappear immediately; the fetch only fills in details.
  const visible = (products ?? []).filter((p) => ids.includes(p.id));

  return (
    <>
      <p className="mt-2 text-sm text-muted">Saved on this device — sign in at checkout to keep it everywhere.</p>
      {products === null ? (
        <div aria-hidden className="mt-6 grid animate-pulse grid-cols-2 gap-3 md:grid-cols-4">
          {ids.slice(0, 4).map((id) => (
            <div key={id} className="aspect-[4/5] rounded-sm bg-divider/60" />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} lowStockThreshold={lowStockThreshold} />
          ))}
        </div>
      )}
    </>
  );
}

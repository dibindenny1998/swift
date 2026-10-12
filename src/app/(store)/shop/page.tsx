import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RevealGroup, RevealItem } from "@/components/effects/Reveal";
import { ProductCard } from "@/components/product/ProductCard";
import { SortSelect } from "@/components/shop/SortSelect";
import { getCategories, getShopProducts, SORTS, type SortKey } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { getSettings } from "@/lib/settings-server";

export const metadata: Metadata = {
  alternates: { canonical: "/shop" },
  title: "Shop the collection",
  description: "Christmas trees, lights, ornaments and gifts — delivered across India before Christmas.",
};

const PAGE_SIZE = 12;

export default function ShopPage(props: PageProps<"/shop">) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-ink">The collection</p>
      <h1 className="mt-2 font-display text-[34px] font-medium leading-[1.1] text-green-heading">Shop Christmas</h1>
      <Suspense fallback={<ShopSkeleton />}>
        <ShopResults searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

async function ShopResults({ searchParams }: Pick<PageProps<"/shop">, "searchParams">) {
  const sp = await searchParams;
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);

  const categoryParam = first(sp.category);
  const category = categories.some((c) => c.slug === categoryParam) ? categoryParam! : null;
  const sortParam = first(sp.sort);
  const sort: SortKey = SORTS.some((s) => s.key === sortParam) ? (sortParam as SortKey) : "popular";
  const page = Math.max(1, Math.min(50, Number(first(sp.page)) || 1));

  const products = await getShopProducts(category, sort);
  const visible = products.slice(0, page * PAGE_SIZE);

  const href = (next: { category?: string | null; page?: number }) => {
    const q = new URLSearchParams();
    const cat = next.category === undefined ? category : next.category;
    if (cat) q.set("category", cat);
    if (sort !== "popular") q.set("sort", sort);
    if (next.page && next.page > 1) q.set("page", String(next.page));
    const s = q.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  const chips = [{ slug: null as string | null, name: "All" }, ...categories];

  return (
    <>
      <nav aria-label="Categories" className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {chips.map((c) => {
          const active = c.slug === category;
          return (
            <Link
              key={c.slug ?? "all"}
              href={href({ category: c.slug, page: 1 })}
              aria-current={active ? "page" : undefined}
              scroll={false}
              className={cn(
                "inline-flex h-11 flex-none items-center rounded-full border px-5 text-sm font-semibold transition-colors active:scale-[0.98]",
                active ? "border-green-300 bg-green-300 text-ivory" : "border-border bg-white text-text hover:border-green-300/40",
              )}
            >
              {c.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </p>
        <SortSelect value={sort} options={SORTS} />
      </div>

      {visible.length === 0 ? (
        <p className="mt-16 text-center text-[15px] text-muted">Nothing here yet — new pieces arrive soon.</p>
      ) : (
        <RevealGroup key={`${category}-${sort}`} className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((p, i) => (
            <RevealItem key={p.id}>
              <ProductCard product={p} lowStockThreshold={settings.lowStockThreshold} priority={i < 2} />
            </RevealItem>
          ))}
        </RevealGroup>
      )}

      {visible.length < products.length && (
        <Link
          href={href({ page: page + 1 })}
          scroll={false}
          className="mx-auto mt-10 flex h-[52px] max-w-md items-center justify-center rounded-full border border-green-300 text-[15px] font-semibold text-green-300 hover:bg-green-300/5 active:scale-[0.98]"
        >
          Show {Math.min(PAGE_SIZE, products.length - visible.length)} more
        </Link>
      )}
    </>
  );
}

function ShopSkeleton() {
  return (
    <div aria-hidden className="mt-6 animate-pulse">
      <div className="flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className="h-11 w-20 rounded-full bg-divider/60" />
        ))}
      </div>
      <div className="mt-[70px] grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i}>
            <div className="aspect-[4/5] rounded-sm bg-divider/60" />
            <div className="mt-3 h-4 w-3/4 rounded-full bg-divider/60" />
          </div>
        ))}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TrackEvent } from "@/components/analytics/TrackEvent";
import { Reveal } from "@/components/effects/Reveal";
import { BundleCard } from "@/components/product/BundleCard";
import { Gallery } from "@/components/product/Gallery";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { Stars } from "@/components/ui/Stars";
import { getLiveProductSlugs, getProduct, type ProductDetail } from "@/lib/catalog";
import { formatINR } from "@/lib/money";
import { getSettings } from "@/lib/settings-server";

export async function generateStaticParams() {
  const slugs = await getLiveProductSlugs();
  // Cache Components needs at least one param to validate the route.
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: "Not found" };
  const description = p.seoDescription ?? p.description.slice(0, 160);
  return {
    title: p.seoTitle ?? p.title,
    description,
    alternates: { canonical: `/products/${p.slug}` },
    // Real photos become the share image; SVG placeholders fall back to the brand image.
    openGraph: { title: p.title, description, images: p.images[0]?.url.endsWith(".svg") ? ["/opengraph-image"] : [p.images[0].url] },
  };
}

export default function ProductPage(props: PageProps<"/products/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductView params={props.params} />
    </Suspense>
  );
}

async function ProductView({ params }: Pick<PageProps<"/products/[slug]">, "params">) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProduct(slug), getSettings()]);
  if (!product) notFound();

  const variantLabel = product.category.slug === "trees" ? "Height" : product.variants.length > 1 ? "Size" : "Option";

  return (
    <article className="mx-auto w-full max-w-6xl px-4 pb-16 pt-4">
      <JsonLd product={product} />
      <TrackEvent event="view_item" items={[{ id: product.slug, name: product.title, price: product.variants[0].price, qty: 1 }]} value={product.variants[0].price} />
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-muted">
        <Link href="/shop" className="hover:text-text">
          Shop
        </Link>
        <span aria-hidden className="mx-1.5">
          /
        </span>
        <Link href={`/shop?category=${product.category.slug}`} className="hover:text-text">
          {product.category.name}
        </Link>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <Gallery images={product.images} />
        </div>

        <div className="flex flex-col gap-5">
          <div>
            {product.badge !== "NONE" && (
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-ink">
                {product.badge === "NEW" ? "New this season" : "Bestseller"}
              </p>
            )}
            <h1 className="font-display text-[32px] font-medium leading-[1.1] text-green-heading">{product.title}</h1>
            {product.rating && (
              <a href="#reviews" className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm text-muted">
                <Stars rating={product.rating.average} />
                <span>
                  {product.rating.average.toFixed(1)} · {product.rating.count} review{product.rating.count === 1 ? "" : "s"}
                </span>
              </a>
            )}
          </div>

          <ProductPurchase
            product={{ id: product.id, title: product.title, variants: product.variants }}
            variantLabel={variantLabel}
            lowStockThreshold={settings.lowStockThreshold}
            christmas={settings.countdownEnd}
          />

          <div className="divide-y divide-divider border-y border-divider">
            <Accordion title="Details" open>
              <p className="whitespace-pre-line">{product.description || "Details coming soon."}</p>
            </Accordion>
            {product.category.slug === "trees" && (
              <Accordion title="Size guide">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs uppercase tracking-[0.12em] text-muted">
                      <th className="py-2 font-semibold">Tree</th>
                      <th className="py-2 font-semibold">Best for</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-divider">
                    <tr>
                      <td className="py-2 font-semibold">4 ft</td>
                      <td className="py-2">Tabletops, corners, apartments</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold">5 ft</td>
                      <td className="py-2">Living rooms with ceilings up to 8 ft</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold">6 ft</td>
                      <td className="py-2">Ceilings of 9 ft and above</td>
                    </tr>
                  </tbody>
                </table>
                <p className="mt-2 text-xs">Allow about 30 cm above the tree for the star topper.</p>
              </Accordion>
            )}
            <Accordion title="Delivery & returns">
              <p>
                Ships from Bangalore in gold gift wrap. Free shipping over {formatINR(settings.freeShippingThreshold)}. Easy returns
                within 7 days of delivery on unused items in original packaging.
              </p>
            </Accordion>
          </div>
        </div>
      </div>

      {product.kits.length > 0 && (
        <Reveal className="mt-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-ink">Complete the look</p>
          <h2 className="mt-2 font-display text-[28px] font-medium text-green-heading">Save with a kit</h2>
          <div className="-mx-4 mt-5 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:grid md:grid-cols-3">
            {product.kits.map((k) => (
              <BundleCard key={k.id} bundle={k} />
            ))}
          </div>
        </Reveal>
      )}

      <section id="reviews" className="mt-14 scroll-mt-20">
        <h2 className="font-display text-[28px] font-medium text-green-heading">Reviews</h2>
        {product.reviews.length === 0 ? (
          <p className="mt-3 text-[15px] text-muted">No reviews yet. Bought this? You can review it from your orders once it arrives.</p>
        ) : (
          <ul className="mt-5 flex flex-col divide-y divide-divider">
            {product.reviews.map((r) => (
              <li key={r.id} className="py-5">
                <div className="flex items-center justify-between gap-3">
                  <Stars rating={r.rating} />
                  <time className="text-xs text-muted" dateTime={r.date}>
                    {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(r.date))}
                  </time>
                </div>
                <p className="mt-2 text-[15px] leading-relaxed">{r.text}</p>
                <p className="mt-1 text-xs font-semibold text-muted">{r.name} · Verified buyer</p>
                {r.photos.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {r.photos.slice(0, 4).map((src) => (
                      // eslint-disable-next-line @next/next/no-img-element -- customer uploads, arbitrary hosts
                      <img key={src} src={src} alt="Customer photo" className="size-20 rounded-sm object-cover" loading="lazy" />
                    ))}
                  </div>
                )}
                {r.reply && (
                  <p className="mt-3 rounded-sm bg-white px-4 py-3 text-sm text-muted">
                    <strong className="text-text">swift.in:</strong> {r.reply}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {product.related.length > 0 && (
        <Reveal className="mt-14">
          <h2 className="font-display text-[28px] font-medium text-green-heading">You may also like</h2>
          <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4">
            {product.related.map((p) => (
              <ProductCard key={p.id} product={p} lowStockThreshold={settings.lowStockThreshold} />
            ))}
          </div>
        </Reveal>
      )}
    </article>
  );
}

function Accordion({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="group">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
        {title}
        <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" className="transition-transform group-open:rotate-45">
          <path d="M7 2v10M2 7h10" />
        </svg>
      </summary>
      <div className="pb-5 text-[15px] leading-relaxed text-muted">{children}</div>
    </details>
  );
}

function JsonLd({ product }: { product: ProductDetail }) {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://swift.in";
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.map((i) => (i.url.startsWith("http") ? i.url : `${site}${i.url}`)),
    sku: product.variants[0].sku,
    brand: { "@type": "Brand", name: "swift.in" },
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      sku: v.sku,
      price: (v.price / 100).toFixed(2),
      priceCurrency: "INR",
      availability: v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${site}/products/${product.slug}`,
    })),
    ...(product.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating.average.toFixed(1),
        reviewCount: product.rating.count,
      },
    }),
  };
  return (
    <script
      type="application/ld+json"
      // Escape "<" so product text can never close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

function ProductSkeleton() {
  return (
    <div aria-hidden className="mx-auto grid w-full max-w-6xl animate-pulse gap-6 px-4 pb-16 pt-10 lg:grid-cols-2">
      <div className="aspect-[4/5] rounded-lg bg-divider/60" />
      <div className="flex flex-col gap-4">
        <div className="h-9 w-3/4 rounded-full bg-divider/60" />
        <div className="h-6 w-1/3 rounded-full bg-divider/60" />
        <div className="mt-6 h-[54px] rounded-full bg-divider/60" />
      </div>
    </div>
  );
}

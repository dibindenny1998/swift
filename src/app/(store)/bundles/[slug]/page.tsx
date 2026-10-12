import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddButton } from "@/components/product/AddButton";
import { ProductImage } from "@/components/product/ProductImage";
import { getBundle, getBundleSlugs } from "@/lib/catalog";
import { formatINR, percentOff } from "@/lib/money";

export async function generateStaticParams() {
  const slugs = await getBundleSlugs();
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/bundles/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const kit = await getBundle(slug);
  return kit ? { title: kit.title, description: kit.description, alternates: { canonical: `/bundles/${kit.slug}` } } : { title: "Not found" };
}

export default function BundlePage(props: PageProps<"/bundles/[slug]">) {
  return (
    <Suspense fallback={<div className="mx-auto h-[70vh] w-full max-w-6xl animate-pulse px-4 pt-10" aria-hidden />}>
      <BundleView params={props.params} />
    </Suspense>
  );
}

async function BundleView({ params }: Pick<PageProps<"/bundles/[slug]">, "params">) {
  const { slug } = await params;
  const kit = await getBundle(slug);
  if (!kit) notFound();
  const save = percentOff(kit.price, kit.compareAt);

  return (
    <article className="mx-auto w-full max-w-6xl px-4 pb-16 pt-4">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-muted">
        <Link href="/bundles" className="hover:text-text">
          Signature kits
        </Link>
      </nav>
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[#E6EDE7] lg:sticky lg:top-20 lg:self-start">
          <ProductImage src={kit.image} alt={kit.title} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          {save > 0 && (
            <span className="absolute left-4 top-4 rounded-full bg-ivory px-3 py-1.5 text-xs font-bold text-red-sale">Save {save}%</span>
          )}
        </div>
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-ink">Signature kit</p>
            <h1 className="mt-2 font-display text-[32px] font-medium leading-[1.1] text-green-heading">{kit.title}</h1>
            <p className="mt-2 text-[15px] text-muted">{kit.description}</p>
          </div>
          <div>
            <p className="flex flex-wrap items-baseline gap-x-2">
              <strong className="text-[22px] font-bold">{formatINR(kit.price)}</strong>
              {kit.compareAt > kit.price && (
                <>
                  <s className="text-[13px] text-muted">
                    <span className="sr-only">Bought separately </span>
                    {formatINR(kit.compareAt)}
                  </s>
                  <span className="text-[13px] font-semibold text-red-sale">You save {formatINR(kit.compareAt - kit.price)}</span>
                </>
              )}
            </p>
            <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>
          </div>

          <div>
            <h2 className="text-[13px] font-semibold">In the box</h2>
            <ul className="mt-2 divide-y divide-divider rounded-lg border border-border bg-white">
              {kit.items.map((i) => (
                <li key={i.slug + i.variantName}>
                  <Link href={`/products/${i.slug}`} className="flex items-center gap-3 p-3">
                    <span className="relative size-14 flex-none overflow-hidden rounded-sm">
                      <ProductImage src={i.image} alt="" fill sizes="56px" className="object-cover" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-[15px] font-semibold">
                        {i.qty > 1 && `${i.qty} × `}
                        {i.title}
                      </span>
                      <span className="text-xs text-muted">{i.variantName}</span>
                    </span>
                    <span className="text-sm text-muted">{formatINR(i.price * i.qty)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {kit.inStock ? (
            <div className="[&>span]:flex [&>span]:w-full">
              <AddButton input={{ bundleId: kit.id }} title={kit.title} label="Add kit to cart" className="h-[54px] w-full text-[15px]" />
            </div>
          ) : (
            <p className="flex h-[54px] items-center justify-center rounded-full bg-divider text-[15px] font-semibold text-muted">
              Sold out — back soon
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

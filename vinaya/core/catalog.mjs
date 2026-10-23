// Products added or hidden in the admin panel (stored on the server as products.json) are
// merged into the built-in catalogue here, before the site is rendered.
//
//   catalog = {
//     hidden: ['gift-set'],                       built-in products taken off the site
//     custom: [{ slug, category, name, variant, short, description,
//                highlights: ['…'], specs: { ingredients, size, usage, shelfLife, packaging } }]
//   }

export const SPEC_KEYS = ['ingredients', 'size', 'usage', 'shelfLife', 'packaging'];

export function applyCatalog({ copy, products, imageSlots }, catalog = {}) {
  const builtIn = new Set(products.map((p) => p.slug));
  const hidden = new Set(catalog.hidden || []);
  const custom = (catalog.custom || []).filter((c) => c && c.slug && !builtIn.has(c.slug));

  const merged = structuredClone(copy);
  const slots = { ...imageSlots };
  for (const c of custom) {
    const highlights = (c.highlights || []).filter(Boolean);
    merged.products.items[c.slug] = {
      name: c.name,
      variant: c.variant,
      short: c.short || c.variant,
      description: [c.description || c.variant],
      highlights: highlights.length ? highlights : [c.variant],
      specs: Object.fromEntries(SPEC_KEYS.filter((k) => c.specs?.[k]).map((k) => [k, c.specs[k]])),
    };
    merged.images[`products/${c.slug}`] = `${c.name}, ${c.variant}`;
    slots[`products/${c.slug}`] = { file: `product-${c.slug}.jpg`, width: 1200, height: 1500, page: `Product: ${c.name}` };
  }

  const list = [
    ...products,
    ...custom.map((c) => ({ slug: c.slug, category: c.category, specs: SPEC_KEYS.filter((k) => c.specs?.[k]) })),
  ].filter((p) => !hidden.has(p.slug));

  return { copy: merged, products: list, imageSlots: slots };
}

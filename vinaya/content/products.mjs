// The product catalogue. To add a product:
//   1. Add an entry below (the slug becomes its URL: /products/<slug>/).
//   2. Add its copy under "products.items.<slug>" in content/en.json (and fr.json).
//   3. Drop its photo in static/assets/img/products/<slug>.jpg (or .webp / .png).
// Grid order follows this list. `specs` lists which detail rows the product page shows,
// in order; each one needs a matching text in the translation file.

export default [
  {
    slug: 'hair-oil',
    category: 'hair',
    featured: true,
    specs: ['ingredients', 'size', 'shelfLife', 'usage', 'packaging', 'origin'],
  },
  {
    slug: 'gift-set',
    category: 'gift',
    specs: ['contents', 'ingredients', 'size', 'shelfLife', 'usage', 'packaging', 'origin'],
  },
];

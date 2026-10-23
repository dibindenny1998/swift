// The product catalogue. To add a product:
//   1. Add an entry below (the slug becomes its URL: /products/<slug>/).
//   2. Add its copy under "products.items.<slug>" in content/en.json.
//   3. Add its photo as static/images/product-<slug>.jpg and an image slot in content/images.mjs.
// Grid order follows this list. `specs` lists which detail rows the product page shows,
// in order; each one needs a matching text in content/en.json.

export default [
  {
    slug: 'hair-oil',
    category: 'hair',
    featured: true,
    goodness: true, // shows "The goodness within" ingredient orbit on its page
    specs: ['ingredients', 'size', 'method', 'usage', 'shelfLife', 'packaging'],
  },
  {
    slug: 'gift-set',
    category: 'gift',
    specs: ['contents', 'ingredients', 'size', 'usage', 'shelfLife', 'packaging'],
  },
];

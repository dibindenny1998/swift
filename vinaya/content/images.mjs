// Every image slot on the site. Put a file named after the slot in static/assets/img/
// (any of .webp, .jpg, .jpeg, .png) and it replaces the placeholder box on the next build.
// Alt text lives in the translation files under "images.<slot>".
// `ratio` is width / height of the frame the image is cropped into.

export default {
  'home-hero': { ratio: 4 / 5 },
  'story-hero': { ratio: 16 / 9 },
  'story-garden': { ratio: 4 / 5 },
  'story-hands': { ratio: 3 / 2 },
  'export-hero': { ratio: 3 / 2 },
  // Product photos: static/assets/img/products/<slug>.jpg
  'products/hair-oil': { ratio: 4 / 5 },
  'products/gift-set': { ratio: 4 / 5 },
};

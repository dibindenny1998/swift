// Every image slot on the site.
//   src      → photo in static/assets/img/ without extension (.webp, .jpg, .jpeg or .png).
//              A smaller "<src>-640" version next to it is used on phones when present.
//   ratio    → width / height of the frame the photo is cropped into.
//   position → which part of the photo stays in view when cropped (CSS object-position).
//   fit      → 'contain' shows the whole picture (for cut-out illustrations) instead of cropping.
// If a file is missing, the site shows a labelled placeholder box instead.
// Alt text lives in content/en.json under "images.<slot>".

export default {
  'home-hero': { src: 'photos/hair-oil-coconut', ratio: 4 / 5, position: '50% 40%' },
  'home-source': { src: 'photos/hair-oil-flatlay', ratio: 16 / 9, position: '50% 50%' },
  'approach-1': { src: 'photos/hair-oil-stone', ratio: 4 / 3, position: '50% 58%' },
  'approach-2': { src: 'ingredients/brass-bowl', ratio: 4 / 3, fit: 'contain' },
  'approach-3': { src: 'photos/kerala-backwaters', ratio: 4 / 3, position: '50% 50%' },
  'story-hero': { src: 'photos/kerala-backwaters', ratio: 16 / 9, position: '50% 55%' },
  'story-coconut': { src: 'photos/hair-oil-coconut', ratio: 4 / 5, position: '92% 45%' },
  'story-stone': { src: 'photos/hair-oil-stone', ratio: 3 / 2, position: '50% 62%' },
  'export-hero': { src: 'photos/gift-set-pouch', ratio: 16 / 9, position: '50% 55%' },
  // Product photos (slot name = products/<slug>)
  'products/hair-oil': { src: 'photos/hair-oil-stone', ratio: 4 / 5, position: '50% 45%' },
  'products/gift-set': { src: 'photos/gift-set-pouch', ratio: 4 / 5, position: '50% 55%' },
};

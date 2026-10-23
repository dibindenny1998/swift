// Every image on the site lives in ONE folder: static/images/ (on the server: public_html/images/).
// To change a picture, replace the file with one of the same name. Any size works: the site
// crops it to the frame automatically, keeping the `focus` point in view. For the sharpest,
// fastest result use the recommended size below. The guide at /images/guide.html lists them all.
//
//   file     → file name in the images folder
//   width,
//   height   → recommended size in pixels (also sets the frame's shape)
//   page     → where it appears (shown in the guide)
//   focus    → which part stays in view when a differently shaped photo is cropped (CSS position)
// Alt text lives in content/en.json under "images.<slot>".

export default {
  'home-hero': { file: 'home-hero.jpg', width: 1920, height: 1080, page: 'Home: top banner (desktop and tablet)' },
  'home-hero-mobile': { file: 'home-hero-mobile.jpg', width: 1024, height: 1536, page: 'Home: top banner on phones (portrait)' },
  'tale-nature': { file: 'tale-nature.jpg', width: 1145, height: 1374, page: 'Home: Nature card (words are part of the picture)' },
  'tale-tradition': { file: 'tale-tradition.jpg', width: 1145, height: 1374, page: 'Home: Tradition card (words are part of the picture)' },
  'tale-you': { file: 'tale-you.jpg', width: 1145, height: 1374, page: 'Home: You card (words are part of the picture)' },
  'col-hair': { file: 'collection-hair.jpg', width: 1145, height: 1374, page: 'Home: Hair Care card (keep the upper left light for the title)' },
  'col-face': { file: 'collection-skin.jpg', width: 1145, height: 1374, page: 'Home: Face Care card (keep the upper left light for the title)' },
  'col-body': { file: 'collection-body.jpg', width: 1145, height: 1374, page: 'Home: Body Care card (keep the upper left light for the title)' },
  'col-gift': { file: 'collection-gift.jpg', width: 1145, height: 1374, page: 'Home: Care Kits & Gifts card (keep the upper left light for the title)' },
  'story-hero': { file: 'story-hero.jpg', width: 1920, height: 1080, page: 'Our Story: top banner (desktop and tablet)' },
  'story-hero-mobile': { file: 'story-hero-mobile.jpg', width: 1024, height: 1536, page: 'Our Story: top banner on phones (portrait)' },
  'story-heritage': { file: 'story-heritage.jpg', width: 1122, height: 1402, page: 'Our Story: I Nature inspires us' },
  'story-change': { file: 'story-change.jpg', width: 1122, height: 1402, page: 'Our Story: II Tradition guides us (arch)' },
  'story-reconnect': { file: 'story-reconnect.jpg', width: 1122, height: 1402, page: 'Our Story: III You are at the heart of what we do' },
  'story-value': { file: 'story-value.jpg', width: 1920, height: 1080, page: 'Our Story: full-width quote background' },
  'approach-1': { file: 'approach-simplicity.jpg', width: 1448, height: 1086, page: 'Our Story: Thoughtful Simplicity card' },
  'approach-2': { file: 'approach-care.jpg', width: 1448, height: 1086, page: 'Our Story: Conscious Care card' },
  'approach-3': { file: 'approach-purpose.jpg', width: 1448, height: 1086, page: 'Our Story: Our Purpose card' },
  'export-hero': { file: 'export-hero.jpg', width: 1920, height: 1080, page: 'Partner With Us: top image' },
  // Product photos (slot name = products/<slug>)
  'products/hair-oil': { file: 'product-hair-oil.jpg', width: 1200, height: 1500, page: 'Hair Oil: product photo and cards' },
  'products/gift-set': { file: 'product-gift-set.jpg', width: 1200, height: 1500, page: 'Gift Set: product photo and cards' },
};

// Blog posts name their own image in their front matter (image: blog-<slug>.jpg), at this size.
export const BLOG_IMAGE = { width: 1500, height: 1000 };

// Ingredient illustrations for "The goodness within": transparent PNG, square.
export const INGREDIENT_IMAGE = { width: 400, height: 400 };

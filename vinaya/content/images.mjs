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
  'home-hero': { file: 'home-hero.jpg', width: 1920, height: 1080, page: 'Home: top banner' },
  'col-hair': { file: 'collection-hair.jpg', width: 800, height: 1000, page: 'Home: collections, Hair Care' },
  'col-skin': { file: 'collection-skin.jpg', width: 800, height: 1000, page: 'Home: collections, Skin Care' },
  'col-body': { file: 'collection-body.jpg', width: 800, height: 1000, page: 'Home: collections, Body Care' },
  'col-gift': { file: 'collection-gift.jpg', width: 800, height: 1000, page: 'Home: collections, Gifting' },
  'tale-nature': { file: 'tale-nature.jpg', width: 1000, height: 1250, page: 'Home scroll story: 01 Nature' },
  'tale-tradition': { file: 'tale-tradition.jpg', width: 1000, height: 1250, page: 'Home scroll story: 02 Tradition' },
  'tale-you': { file: 'tale-you.jpg', width: 1000, height: 1250, page: 'Home scroll story: 03 You' },
  'approach-1': { file: 'approach-simplicity.jpg', width: 1200, height: 900, page: 'Home: Thoughtful Simplicity card' },
  'approach-2': { file: 'approach-care.jpg', width: 1200, height: 900, page: 'Home: Conscious Care card' },
  'approach-3': { file: 'approach-purpose.jpg', width: 1200, height: 900, page: 'Home: Our Purpose card' },
  'story-hero': { file: 'story-hero.jpg', width: 1920, height: 1080, page: 'Our Story: top image' },
  'story-coconut': { file: 'story-1.jpg', width: 800, height: 1000, page: 'Our Story: image pair, left (arch)' },
  'story-stone': { file: 'story-2.jpg', width: 1200, height: 800, page: 'Our Story: image pair, right' },
  'export-hero': { file: 'export-hero.jpg', width: 1920, height: 1080, page: 'Partner With Us: top image' },
  // Product photos (slot name = products/<slug>)
  'products/hair-oil': { file: 'product-hair-oil.jpg', width: 1200, height: 1500, page: 'Hair Oil: product photo and cards' },
  'products/gift-set': { file: 'product-gift-set.jpg', width: 1200, height: 1500, page: 'Gift Set: product photo and cards' },
};

// Blog posts name their own image in their front matter (image: blog-<slug>.jpg), at this size.
export const BLOG_IMAGE = { width: 1500, height: 1000 };

// Ingredient illustrations for "The goodness within": transparent PNG, square.
export const INGREDIENT_IMAGE = { width: 400, height: 400 };

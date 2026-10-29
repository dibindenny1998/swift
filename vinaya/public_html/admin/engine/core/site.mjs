// The site renderer, shared by `node build.mjs` and the admin panel's Publish button (which
// runs it in the browser). Pure: everything it needs is passed in, it returns the files.
//
//   copy         content/en.json (possibly edited in the admin)
//   config       site.config.mjs merged with the admin's contact settings
//   products     content/products.mjs
//   imageSlots   content/images.mjs (not modified)
//   blogSources  [{ slug, source }] — the raw text of each content/blog/*.md
//   imageFiles   names of the files present in the images folder
//   versions     { 'images/x.jpg': 'a1b2c3d4e5', 'assets/css/main.css': … } content fingerprints
//   today        YYYY-MM-DD for the sitemap

import { BLOG_IMAGE } from '../content/images.mjs';
import { esc, rich, stripPlaceholders } from '../templates/lib.mjs';
import home from '../templates/pages/home.mjs';
import story from '../templates/pages/story.mjs';
import productsPage from '../templates/pages/products.mjs';
import product from '../templates/pages/product.mjs';
import exportPage from '../templates/pages/export.mjs';
import contact from '../templates/pages/contact.mjs';
import notFound from '../templates/pages/not-found.mjs';
import blog from '../templates/pages/blog.mjs';
import postPage from '../templates/pages/post.mjs';
import { parsePost, renderMarkdown } from '../templates/markdown.mjs';

const dig = (obj, key) => key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
const empty = (v) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);

export function renderSite({ copy, config, products, imageSlots, blogSources, imageFiles, versions, today }) {
  const warnings = [];
  const files = {};
  const present = new Set(imageFiles);

  function lookup(key) {
    const value = dig(copy, key);
    if (empty(value)) throw new Error(`Missing text "${key}"`);
    return value;
  }

  // Blog: every post is a page; newest first. Its image becomes the slot blog/<slug>.
  const slots = Object.fromEntries(Object.entries(imageSlots).map(([k, v]) => [k, { ...v }]));
  const posts = blogSources
    .map(({ slug, source }) => {
      const post = parsePost(source);
      for (const key of ['title', 'excerpt', 'category', 'date', 'image']) {
        if (!post.meta[key]) throw new Error(`Blog post "${slug}": missing "${key}" in front matter`);
      }
      slots[`blog/${slug}`] = { file: post.meta.image, ...BLOG_IMAGE, focus: post.meta.focus, page: `Blog: ${post.meta.title}` };
      return { slug, ...post, html: renderMarkdown(post.body) };
    })
    .sort((a, b) => b.meta.date.localeCompare(a.meta.date));

  for (const def of Object.values(slots)) {
    def.exists = present.has(def.file);
    if (!def.exists) warnings.push(`image missing (placeholder shown): images/${def.file}`);
  }

  const pages = [
    { id: 'home', section: 'home', path: '', render: home, schema: organizationSchema() },
    { id: 'story', section: 'story', path: 'our-story/', render: story },
    { id: 'products', section: 'products', path: 'products/', render: productsPage },
    ...products.map((p) => ({ id: `product-${p.slug}`, section: 'products', path: `products/${p.slug}/`, render: (ctx) => product(ctx, p) })),
    { id: 'blog', section: 'blog', path: 'blog/', render: blog },
    ...posts.map((p) => ({ id: `post-${p.slug}`, section: 'blog', path: `blog/${p.slug}/`, render: (ctx) => postPage(ctx, p) })),
    { id: 'export', section: 'export', path: 'export/', render: exportPage },
    { id: 'contact', section: 'contact', path: 'contact/', render: contact },
  ];

  function organizationSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Vinaya',
      url: `${config.siteUrl}/`,
      slogan: copy.site.slogan,
      logo: `${config.siteUrl}/apple-touch-icon.png`,
      sameAs: ['instagram', 'youtube', 'x'].map((k) => config[k]).filter((u) => /^https:\/\//.test(u || '')),
    };
  }

  function makeContext(page, { absolute = false } = {}) {
    const depth = page.path.split('/').filter(Boolean).length;
    const base = absolute ? '/' : '../'.repeat(depth);
    const rel = (target) => base + target || './';
    return {
      page,
      config,
      products,
      posts,
      images: slots,
      t: (key) => rich(lookup(key)),
      tx: (key) => esc(lookup(key)),
      raw: (key) => lookup(key),
      opt: (key) => dig(copy, key) || '', // optional text: empty or missing is fine
      filled: (key) => stripPlaceholders(dig(copy, key)) !== '', // false while only a placeholder
      list: (key) => lookup(key).map(rich),
      link: (path) => rel(path),
      // Fingerprints (?v=…) make browsers fetch a changed file instead of a saved copy.
      asset: (file, versioned = false) => rel(file) + (versioned && versions[file] ? `?v=${versions[file]}` : ''),
      absUrl: () => `${config.siteUrl}/${page.path}`,
    };
  }

  for (const page of pages) files[`${page.path}index.html`] = page.render(makeContext(page));

  // 404 uses root-absolute links because Apache serves it from any depth.
  files['404.html'] = notFound(makeContext({ id: '404', section: null, path: '', noindex: true }, { absolute: true }));

  files['sitemap.xml'] = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url>\n    <loc>${config.siteUrl}/${page.path}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join('\n')}
</urlset>
`;

  return { files, pages, posts, slots, warnings };
}

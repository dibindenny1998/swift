#!/usr/bin/env node
// Builds the static Vinaya website into ./public_html (upload that folder's contents to
// Hostinger). No dependencies: run with `node build.mjs`.

import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import config from './site.config.mjs';
import products from './content/products.mjs';
import imageSlots from './content/images.mjs';
import { esc, isPlaceholder, rich } from './templates/lib.mjs';
import home from './templates/pages/home.mjs';
import story from './templates/pages/story.mjs';
import productsPage from './templates/pages/products.mjs';
import product from './templates/pages/product.mjs';
import exportPage from './templates/pages/export.mjs';
import contact from './templates/pages/contact.mjs';
import notFound from './templates/pages/not-found.mjs';
import blog from './templates/pages/blog.mjs';
import postPage from './templates/pages/post.mjs';
import { parsePost, renderMarkdown } from './templates/markdown.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'public_html');
const STATIC = join(ROOT, 'static');
const IMAGE_EXTS = ['webp', 'jpg', 'jpeg', 'png', 'avif'];

const warnings = new Set();
const warn = (msg) => warnings.add(msg);

// ---------------------------------------------------------------- copy

const copy = JSON.parse(readFileSync(join(ROOT, 'content', 'en.json'), 'utf8'));

const dig = (obj, key) => key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
const empty = (v) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);

function lookup(key) {
  const value = dig(copy, key);
  if (empty(value)) throw new Error(`Missing text "${key}" in content/en.json`);
  return value;
}

// ---------------------------------------------------------------- blog
// Every content/blog/*.md file is a post; newest first. Its image becomes the slot blog/<slug>.

const BLOG = join(ROOT, 'content', 'blog');
const posts = (existsSync(BLOG) ? readdirSync(BLOG) : [])
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const slug = f.replace(/\.md$/, '');
    const post = parsePost(readFileSync(join(BLOG, f), 'utf8'));
    for (const key of ['title', 'excerpt', 'category', 'date', 'image']) {
      if (!post.meta[key]) throw new Error(`content/blog/${f}: missing "${key}" in front matter`);
    }
    imageSlots[`blog/${slug}`] = { src: post.meta.image, ratio: 3 / 2, position: post.meta.position };
    return { slug, ...post, html: renderMarkdown(post.body) };
  })
  .sort((a, b) => b.meta.date.localeCompare(a.meta.date));

// ---------------------------------------------------------------- images

const findImage = (name) => {
  const ext = IMAGE_EXTS.find((e) => existsSync(join(STATIC, 'assets/img', `${name}.${e}`)));
  return ext ? `assets/img/${name}.${ext}` : null;
};
for (const [slot, def] of Object.entries(imageSlots)) {
  const name = def.src ?? slot;
  def.file = findImage(name);
  def.small = def.file ? findImage(`${name}-640`) : null;
  if (!def.file) warn(`image placeholder in use: static/assets/img/${name}.jpg`);
}

// ---------------------------------------------------------------- pages

const pages = [
  { id: 'home', section: 'home', path: '', render: home, schema: organizationSchema() },
  { id: 'story', section: 'story', path: 'our-story/', render: story },
  { id: 'products', section: 'products', path: 'products/', render: productsPage },
  ...products.map((p) => ({
    id: `product-${p.slug}`,
    section: 'products',
    path: `products/${p.slug}/`,
    render: (ctx) => product(ctx, p),
  })),
  { id: 'blog', section: 'blog', path: 'blog/', render: blog },
  ...posts.map((p) => ({
    id: `post-${p.slug}`,
    section: 'blog',
    path: `blog/${p.slug}/`,
    render: (ctx) => postPage(ctx, p),
  })),
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
  };
}

// Asset fingerprints so browsers pick up new CSS/JS after an upload.
const fingerprint = (file) =>
  createHash('sha1').update(readFileSync(join(STATIC, file))).digest('hex').slice(0, 10);
const versions = {
  'assets/css/main.css': fingerprint('assets/css/main.css'),
  'assets/js/main.js': fingerprint('assets/js/main.js'),
};

function makeContext(page, { absolute = false } = {}) {
  const depth = page.path.split('/').filter(Boolean).length;
  const base = absolute ? '/' : '../'.repeat(depth);
  const rel = (target) => base + target || './';

  return {
    page,
    config,
    products,
    posts,
    images: imageSlots,
    t: (key) => rich(lookup(key)),
    tx: (key) => esc(lookup(key)),
    raw: (key) => lookup(key),
    list: (key) => lookup(key).map(rich),
    link: (path) => rel(path),
    asset: (file, versioned = false) => rel(file) + (versioned && versions[file] ? `?v=${versions[file]}` : ''),
    absUrl: () => `${config.siteUrl}/${page.path}`,
  };
}

// ---------------------------------------------------------------- build

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(STATIC, OUT, { recursive: true, filter: (src) => !src.endsWith('README.md') });

const write = (rel, content) => {
  const file = join(OUT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
};

for (const page of pages) {
  write(`${page.path}index.html`, page.render(makeContext(page)));
}

// 404 uses root-absolute links because Apache serves it from any depth.
const notFoundPage = { id: '404', section: null, path: '', noindex: true };
write('404.html', notFound(makeContext(notFoundPage, { absolute: true })));

// Enquiry form handler: inject the settings.
const php = readFileSync(join(STATIC, 'contact.php'), 'utf8')
  .replaceAll('__CONTACT_EMAIL__', config.contactEmail)
  .replaceAll('__FROM_EMAIL__', config.fromEmail);
write('contact.php', php);

// Sitemap
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url>\n    <loc>${config.siteUrl}/${page.path}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join('\n')}
</urlset>
`;
write('sitemap.xml', sitemap);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`);

// ---------------------------------------------------------------- report

for (const [key, value] of Object.entries(config)) {
  if (typeof value === 'string' && isPlaceholder(value)) warn(`site.config.mjs: "${key}" is still a placeholder (${value})`);
}

const count = pages.length + 1;
console.log(`Built ${count} pages into public_html/`);
if (warnings.size) {
  console.log(`\nTo do before launch (${warnings.size}):`);
  for (const w of [...warnings].sort()) console.log(`  - ${w}`);
}

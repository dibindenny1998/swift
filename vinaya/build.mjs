#!/usr/bin/env node
// Builds the static Vinaya website into ./public_html (upload that folder's contents to
// Hostinger). No dependencies: run with `node build.mjs`.

import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'public_html');
const STATIC = join(ROOT, 'static');
const IMAGE_EXTS = ['webp', 'jpg', 'jpeg', 'png', 'avif'];

const warnings = new Set();
const warn = (msg) => warnings.add(msg);

// ---------------------------------------------------------------- translations

const dicts = Object.fromEntries(
  config.languages.map((l) => [l, JSON.parse(readFileSync(join(ROOT, 'content', `${l}.json`), 'utf8'))]),
);
const defaultLang = config.languages[0];

const dig = (obj, key) => key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
const empty = (v) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);

function lookup(lang, key) {
  let value = dig(dicts[lang], key);
  if (empty(value) && lang !== defaultLang) {
    warn(`[${lang}] missing translation "${key}" (using ${defaultLang})`);
    value = dig(dicts[defaultLang], key);
  }
  if (empty(value)) throw new Error(`Missing text "${key}" in content/${defaultLang}.json`);
  return value;
}

// ---------------------------------------------------------------- images

for (const [slot, def] of Object.entries(imageSlots)) {
  const ext = IMAGE_EXTS.find((e) => existsSync(join(STATIC, 'assets/img', `${slot}.${e}`)));
  def.file = ext ? `assets/img/${slot}.${ext}` : null;
  if (!ext) warn(`image placeholder in use: static/assets/img/${slot}.jpg`);
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
  { id: 'export', section: 'export', path: 'export/', render: exportPage },
  { id: 'contact', section: 'contact', path: 'contact/', render: contact },
];

function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Vinaya',
    url: `${config.siteUrl}/`,
    slogan: dicts[defaultLang].site.slogan,
    logo: `${config.siteUrl}/apple-touch-icon.png`,
  };
}

const langPrefix = (lang) => (lang === defaultLang ? '' : `${lang}/`);

// Asset fingerprints so browsers pick up new CSS/JS after an upload.
const fingerprint = (file) =>
  createHash('sha1').update(readFileSync(join(STATIC, file))).digest('hex').slice(0, 10);
const versions = {
  'assets/css/main.css': fingerprint('assets/css/main.css'),
  'assets/js/main.js': fingerprint('assets/js/main.js'),
};

function makeContext(lang, page, { absolute = false } = {}) {
  const outPath = langPrefix(lang) + page.path;
  const depth = outPath.split('/').filter(Boolean).length;
  const base = absolute ? '/' : '../'.repeat(depth);
  const rel = (target) => base + target || './';

  return {
    lang,
    langs: config.languages,
    page,
    config,
    products,
    images: imageSlots,
    t: (key) => rich(lookup(lang, key)),
    tx: (key) => esc(lookup(lang, key)),
    txIn: (l, key) => esc(lookup(l, key)),
    raw: (key) => lookup(lang, key),
    rawIn: (l, key) => lookup(l, key),
    list: (key) => lookup(lang, key).map(rich),
    link: (path) => rel(langPrefix(lang) + path),
    linkIn: (l, path) => rel(langPrefix(l) + path),
    asset: (file, versioned = false) => rel(file) + (versioned && versions[file] ? `?v=${versions[file]}` : ''),
    absUrl: (l) => `${config.siteUrl}/${langPrefix(l)}${page.path}`,
    alternates: () => config.languages.map((l) => ({ lang: l, href: `${config.siteUrl}/${langPrefix(l)}${page.path}` })),
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

for (const lang of config.languages) {
  for (const page of pages) {
    write(`${langPrefix(lang)}${page.path}index.html`, page.render(makeContext(lang, page)));
  }
}

// 404 uses root-absolute links because Apache serves it from any depth.
const notFoundPage = { id: '404', section: null, path: '', noindex: true };
write('404.html', notFound(makeContext(defaultLang, notFoundPage, { absolute: true })));

// Enquiry form handler: inject the settings.
const php = readFileSync(join(STATIC, 'contact.php'), 'utf8')
  .replaceAll('__CONTACT_EMAIL__', config.contactEmail)
  .replaceAll('__FROM_EMAIL__', config.fromEmail)
  .replaceAll('__LANGS__', config.languages.join(','));
write('contact.php', php);

// Sitemap with language alternates.
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${config.languages
  .flatMap((lang) =>
    pages.map((page) => {
      const alts = config.languages
        .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${config.siteUrl}/${langPrefix(l)}${page.path}"/>`)
        .join('\n');
      return `  <url>\n    <loc>${config.siteUrl}/${langPrefix(lang)}${page.path}</loc>\n    <lastmod>${today}</lastmod>\n${alts}\n  </url>`;
    }),
  )
  .join('\n')}
</urlset>
`;
write('sitemap.xml', sitemap);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`);

// ---------------------------------------------------------------- report

for (const [key, value] of Object.entries(config)) {
  if (typeof value === 'string' && isPlaceholder(value)) warn(`site.config.mjs: "${key}" is still a placeholder (${value})`);
}

const count = config.languages.length * pages.length + 1;
console.log(`Built ${count} pages into public_html/`);
if (warnings.size) {
  console.log(`\nTo do before launch (${warnings.size}):`);
  for (const w of [...warnings].sort()) console.log(`  - ${w}`);
}

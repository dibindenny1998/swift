#!/usr/bin/env node
// Builds the static Vinaya website into ./public_html (upload that folder's contents to
// Hostinger). No dependencies: run with `node build.mjs`.

import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import config from './site.config.mjs';
import products from './content/products.mjs';
import imageSlots, { BLOG_IMAGE, INGREDIENT_IMAGE } from './content/images.mjs';
import { esc, isPlaceholder, rich, stripPlaceholders } from './templates/lib.mjs';
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
    imageSlots[`blog/${slug}`] = { file: post.meta.image, ...BLOG_IMAGE, focus: post.meta.focus, page: `Blog: ${post.meta.title}` };
    return { slug, ...post, html: renderMarkdown(post.body) };
  })
  .sort((a, b) => b.meta.date.localeCompare(a.meta.date));

// ---------------------------------------------------------------- images

for (const [slot, def] of Object.entries(imageSlots)) {
  def.exists = existsSync(join(STATIC, 'images', def.file));
  if (!def.exists) warn(`image missing (placeholder shown): static/images/${def.file}`);
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

// Asset fingerprints (?v=…) so browsers pick up a changed CSS, JS or image file after an
// upload instead of showing the copy they saved earlier.
const fingerprint = (file) =>
  existsSync(join(STATIC, file)) ? createHash('sha1').update(readFileSync(join(STATIC, file))).digest('hex').slice(0, 10) : '';
const versions = {};
const version = (file) => (versions[file] ??= fingerprint(file));

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
    opt: (key) => dig(copy, key) || '', // optional text: empty or missing is fine
    filled: (key) => stripPlaceholders(dig(copy, key)) !== '', // false while only a placeholder
    list: (key) => lookup(key).map(rich),
    link: (path) => rel(path),
    asset: (file, versioned = false) => rel(file) + (versioned && version(file) ? `?v=${version(file)}` : ''),
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

// Image guide: public_html/images/guide.html lists every image file, where it is used and its
// recommended size, and checks the uploaded files live in the browser. Plus a plain README.txt.
const ingredientFiles = readdirSync(join(STATIC, 'images')).filter((f) => f.startsWith('ingredient-'));
const guideRows = [
  ...Object.values(imageSlots).map((d) => ({ file: d.file, page: d.page, w: d.width, h: d.height })),
  ...ingredientFiles.map((f) => ({ file: f, page: 'Hair Oil page: rotating ingredient circle (transparent PNG)', w: INGREDIENT_IMAGE.width, h: INGREDIENT_IMAGE.height })),
  { file: 'share-image.jpg', page: 'Preview when the site is shared on WhatsApp, Facebook, LinkedIn', w: 1200, h: 630 },
];
const uniqueRows = [...new Map(guideRows.map((r) => [r.file, r])).values()];
write('images/README.txt', `VINAYA WEBSITE IMAGES
======================
Replace any image by uploading a new file with EXACTLY the same name into this folder.
Any size works: the website crops it to the frame automatically. For the sharpest and
fastest result, use the recommended size and keep each file under 400 KB (JPG, quality ~80).
Open https://YOUR-SITE/images/guide.html to see every image and check your uploads.

${uniqueRows.map((r) => `${r.file.padEnd(42)} ${`${r.w} x ${r.h} px`.padEnd(16)} ${r.page}`).join('\n')}
`);
write('images/guide.html', `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Vinaya · Image guide</title>
<style>
:root{--g:#1f4a2e;--ink:#1b2e22;--soft:#4b5a4f;--line:rgba(27,46,34,.15);--gold:#85601b}
*{box-sizing:border-box}body{margin:0;background:#fbf6ec;color:var(--ink);font:15px/1.6 system-ui,-apple-system,Segoe UI,sans-serif}
header{padding:32px 20px 8px;max-width:1200px;margin:auto}h1{font:500 28px/1.2 Georgia,serif;margin:0 0 8px}
p{margin:6px 0;color:var(--soft);max-width:70ch}code{background:#fff;padding:1px 6px;border-radius:4px;border:1px solid var(--line)}
.grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));padding:20px;max-width:1200px;margin:auto}
.card{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden}
.thumb{aspect-ratio:var(--r);background:#efe6d3 center/cover no-repeat}
.thumb.png{background-size:contain;background-color:#f6ecd8}
.body{padding:12px 14px 14px}.file{font-weight:600;word-break:break-all}.page{color:var(--soft);font-size:13px}
.meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;font-size:12px}
.tag{padding:2px 8px;border-radius:99px;background:#f2ead8;color:var(--gold)}
.ok{background:#e3efe5;color:var(--g)}.warn{background:#fbecd2;color:#8a5a00}.bad{background:#f6dcd8;color:#9a2f22}
</style></head><body>
<header><h1>Vinaya · Image guide</h1>
<p>Every picture on the website is a file in this folder (<code>public_html/images/</code>). To change one, upload a new file with the <b>same name</b> in Hostinger File Manager and overwrite the old one.</p>
<p>Any size works: the site crops to the frame automatically. The labels below compare each current file with its recommended size. Keep files under 400 KB for a fast site.</p></header>
<div class="grid">
${uniqueRows.map((r) => `<div class="card" data-file="${r.file}" data-w="${r.w}" data-h="${r.h}"><div class="thumb${r.file.endsWith('.png') ? ' png' : ''}" style="--r:${r.w}/${r.h};background-image:url('${r.file}?t=${Date.now()}')"></div><div class="body"><div class="file">${r.file}</div><div class="page">${esc(r.page)}</div><div class="meta"><span class="tag">Recommended ${r.w} × ${r.h}</span><span class="tag" data-status>Checking…</span></div></div></div>`).join('\n')}
</div>
<script>
document.querySelectorAll('.card').forEach(function (card) {
  var f = card.dataset.file, w = +card.dataset.w, h = +card.dataset.h, s = card.querySelector('[data-status]');
  var img = new Image();
  img.onload = function () {
    var iw = img.naturalWidth, ih = img.naturalHeight, same = Math.abs(iw / ih - w / h) < 0.02;
    var msg = iw + ' × ' + ih + ' · ', cls = 'ok';
    if (iw < w * 0.6) { msg += 'too small, may look soft'; cls = 'bad'; }
    else if (!same) { msg += 'different shape, auto-cropped'; cls = 'warn'; }
    else msg += 'good';
    fetch(f, { method: 'HEAD' }).then(function (r) {
      var kb = Math.round((+r.headers.get('content-length') || 0) / 1024);
      if (kb > 600) { msg += ' · ' + kb + ' KB, compress it'; if (cls === 'ok') cls = 'warn'; } else if (kb) msg += ' · ' + kb + ' KB';
      s.textContent = msg; s.className = 'tag ' + cls;
    }).catch(function () { s.textContent = msg; s.className = 'tag ' + cls; });
  };
  img.onerror = function () { s.textContent = 'missing: placeholder shown'; s.className = 'tag bad'; };
  img.src = f + '?t=' + Date.now();
});
</script></body></html>
`);

// Sitemap
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url>\n    <loc>${config.siteUrl}/${page.path}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join('\n')}
</urlset>
`;
write('sitemap.xml', sitemap);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /images/guide.html\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`);

// ---------------------------------------------------------------- report

// Facts still marked [PLACEHOLDER] in en.json: hidden on the site, listed here to ask the client.
(function scan(node, path) {
  if (typeof node === 'string') {
    if (/\[PLACEHOLDER/.test(node)) warn(`ask the client (hidden for now): ${path}`);
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) scan(v, path ? `${path}.${k}` : k);
  }
})(copy, '');

for (const [key, value] of Object.entries(config)) {
  if (typeof value === 'string' && isPlaceholder(value)) warn(`site.config.mjs: "${key}" is still a placeholder (${value})`);
}

const count = pages.length + 1;
console.log(`Built ${count} pages into public_html/`);
if (warnings.size) {
  console.log(`\nTo do before launch (${warnings.size}):`);
  for (const w of [...warnings].sort()) console.log(`  - ${w}`);
}

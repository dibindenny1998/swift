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
import { esc, isPlaceholder } from './templates/lib.mjs';
import { renderSite } from './core/site.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'public_html');
const STATIC = join(ROOT, 'static');

const warnings = new Set();
const warn = (msg) => warnings.add(msg);

// ---------------------------------------------------------------- inputs

const copy = JSON.parse(readFileSync(join(ROOT, 'content', 'en.json'), 'utf8'));

const BLOG = join(ROOT, 'content', 'blog');
const blogSources = (existsSync(BLOG) ? readdirSync(BLOG) : [])
  .filter((f) => f.endsWith('.md'))
  .map((f) => ({ slug: f.replace(/\.md$/, ''), source: readFileSync(join(BLOG, f), 'utf8') }));

// Content fingerprints for every image and the CSS/JS, so browsers fetch changed files.
const fingerprint = (rel) => createHash('sha1').update(readFileSync(join(STATIC, rel))).digest('hex').slice(0, 10);
const imageFiles = readdirSync(join(STATIC, 'images')).filter((f) => /\.(jpe?g|png|webp|svg)$/i.test(f));
const versions = Object.fromEntries(
  [...imageFiles.map((f) => `images/${f}`), 'assets/css/main.css', 'assets/js/main.js'].map((rel) => [rel, fingerprint(rel)]),
);

const site = renderSite({
  copy,
  config,
  products,
  imageSlots,
  blogSources,
  imageFiles,
  versions,
  today: new Date().toISOString().slice(0, 10),
});
const { pages } = site;
for (const w of site.warnings) warn(w);

// ---------------------------------------------------------------- build

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(STATIC, OUT, { recursive: true, filter: (src) => !src.endsWith('README.md') });

const write = (rel, content) => {
  const file = join(OUT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
};

for (const [rel, content] of Object.entries(site.files)) write(rel, content);

// Admin panel engine: the same renderer and content, so Publish in the admin rebuilds the
// pages exactly as this script does.
for (const dir of ['core', 'templates', 'content']) cpSync(join(ROOT, dir), join(OUT, 'admin', 'engine', dir), { recursive: true });
cpSync(join(ROOT, 'site.config.mjs'), join(OUT, 'admin', 'engine', 'site.config.mjs'));
// Lets the admin notice a fresh upload and re-apply the client's saved edits.
write('admin/engine/build.json', JSON.stringify({ builtAt: Math.floor(Date.now() / 1000) }));

// Enquiry form handler: inject the settings.
const php = readFileSync(join(STATIC, 'contact.php'), 'utf8')
  .replaceAll('__CONTACT_EMAIL__', config.contactEmail)
  .replaceAll('__FROM_EMAIL__', config.fromEmail);
write('contact.php', php);

// Image guide: public_html/images/guide.html lists every image file, where it is used and its
// recommended size, and checks the uploaded files live in the browser. Plus a plain README.txt.
const ingredientFiles = readdirSync(join(STATIC, 'images')).filter((f) => f.startsWith('ingredient-'));
const guideRows = [
  ...Object.values(site.slots).map((d) => ({ file: d.file, page: d.page, w: d.width, h: d.height })),
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

write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /images/guide.html\nDisallow: /admin/\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`);

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

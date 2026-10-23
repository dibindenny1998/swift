// VINAYA admin editor. Loads the site's own renderer (engine/), lets the client edit text,
// photos and contact details, and on Publish regenerates every page in the browser and
// sends them to api.php, exactly as `node build.mjs` would build them.

import { renderSite } from './engine/core/site.mjs';
import baseConfig from './engine/site.config.mjs';
import products from './engine/content/products.mjs';
import imageSlots, { INGREDIENT_IMAGE } from './engine/content/images.mjs';
import { SPEC_KEYS, applyCatalog } from './engine/core/catalog.mjs';

const csrf = document.querySelector('meta[name="csrf"]').content;
const app = document.getElementById('app');

// ---------------------------------------------------------------- helpers

const h = (tag, attrs = {}, ...children) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'html') el.innerHTML = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : String(c));
  return el;
};

async function api(action, { method = 'GET', json, form } = {}) {
  const res = await fetch(`api.php?action=${action}`, {
    method,
    headers: { 'X-CSRF': csrf, ...(json ? { 'Content-Type': 'application/json' } : {}) },
    body: json ? JSON.stringify(json) : form,
    credentials: 'same-origin',
  });
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`The server answered unexpectedly (${res.status}).`);
  }
  if (res.status === 401) location.reload();
  if (!data.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

const isObj = (v) => v && typeof v === 'object';
const dig = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
function setPath(obj, path, value) {
  const parts = path.split('.');
  const last = parts.pop();
  const parent = parts.reduce((o, k) => o?.[k], obj);
  if (parent && typeof parent[last] === 'string') parent[last] = value;
}

// Every editable text: string leaves, minus identifiers the site relies on.
const SKIP = new Set(['key', 'link', 'slug']);
function leaves(obj, prefix = '', out = []) {
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') {
      if (!SKIP.has(k)) out.push(path);
    } else if (isObj(v)) leaves(v, path, out);
  }
  return out;
}

const GROUPS = {
  home: 'Home page',
  story: 'Our Story page',
  products: 'Products and product pages',
  ingredients: 'Ingredients',
  goodness: 'Ingredient circle (Hair Oil page)',
  blog: 'Blog page',
  export: 'Partner With Us page',
  contact: 'Contact page and form',
  band: 'Importers band (bottom of pages)',
  footer: 'Footer',
  nav: 'Menu',
  cta: 'Buttons',
  site: 'Brand and tagline',
  meta: 'Google titles and descriptions',
  images: 'Photo descriptions (for Google and screen readers)',
  notFound: 'Page not found (404)',
  placeholder: 'Missing-photo label',
};
const words = (s) => s.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ').replace(/^./, (c) => c.toUpperCase());
const label = (path) =>
  path
    .split('.')
    .slice(1)
    .map((p) => (/^\d+$/.test(p) ? `#${Number(p) + 1}` : words(p)))
    .join(' › ') || words(path);

const SETTINGS = [
  { key: 'contactEmail', label: 'Enquiry emails go to', hint: 'Messages from the contact form are delivered to this address. The form goes live once this is filled in.', type: 'email' },
  { key: 'publicEmail', label: 'Email shown on the website', hint: 'Shown on the contact page and in the footer. Leave empty to hide it.', type: 'email' },
  { key: 'whatsapp', label: 'WhatsApp number', hint: 'With country code, digits only, e.g. 919876543210. Leave empty to hide WhatsApp.', type: 'tel' },
  { key: 'fromEmail', label: 'Send form emails from (optional)', hint: 'An address on your own domain (e.g. noreply@yourdomain.com) helps the emails arrive. Leave empty to use the enquiry address.', type: 'email' },
];

// ---------------------------------------------------------------- state

const state = {
  defaults: null, // en.json as built
  content: null, // defaults + saved edits
  settings: {},
  catalog: { hidden: [], custom: [] },
  images: [],
  versions: {},
  blog: [],
  dirty: false,
  tab: 'text',
  group: 'home',
  search: '',
  busy: false,
};

function applyOverrides(base, overrides) {
  const copy = structuredClone(base);
  for (const [path, value] of Object.entries(overrides || {})) setPath(copy, path, value);
  return copy;
}

function overrides() {
  const out = {};
  for (const path of leaves(state.defaults)) {
    const v = dig(state.content, path);
    if (v !== dig(state.defaults, path)) out[path] = v;
  }
  return out;
}

function siteConfig() {
  const cfg = { ...baseConfig };
  for (const { key } of SETTINGS) if (state.settings[key]) cfg[key] = state.settings[key];
  return cfg;
}

function render() {
  const merged = applyCatalog({ copy: state.content, products, imageSlots }, state.catalog);
  return renderSite({
    copy: merged.copy,
    config: siteConfig(),
    products: merged.products,
    imageSlots: merged.imageSlots,
    blogSources: state.blog,
    imageFiles: state.images.map((i) => i.file),
    versions: state.versions,
    today: new Date().toISOString().slice(0, 10),
  });
}

// ---------------------------------------------------------------- publish

async function publish({ quiet = false } = {}) {
  if (state.busy) return false;
  state.busy = true;
  setStatus('Publishing…', 'busy');
  await new Promise(requestAnimationFrame);
  try {
    let site;
    try {
      site = render();
    } catch (e) {
      const m = /Missing text "([^"]+)"/.exec(e.message);
      throw new Error(m ? `"${label(m[1])}" in ${GROUPS[m[1].split('.')[0]] || words(m[1].split('.')[0])} can't be empty.` : e.message);
    }
    const res = await api('publish', { method: 'POST', json: { overrides: overrides(), settings: state.settings, catalog: state.catalog, files: site.files } });
    state.dirty = false;
    state.lastPublish = res.lastPublish;
    setStatus(quiet ? 'Your changes were re-applied to the website.' : 'Published. The website is updated.', 'ok');
    return true;
  } catch (e) {
    setStatus(e.message, 'error');
    return false;
  } finally {
    state.busy = false;
    updateBar();
  }
}

// ---------------------------------------------------------------- layout

let statusEl, publishBtn, mainEl;

function setStatus(text, kind = '') {
  statusEl.textContent = text;
  statusEl.className = `status status--${kind}`;
}

function markDirty() {
  if (!state.dirty) {
    state.dirty = true;
    setStatus('Unsaved changes. Press Publish to update the website.', 'warn');
  }
  updateBar();
}

function updateBar() {
  publishBtn.disabled = state.busy || !state.dirty;
  publishBtn.textContent = state.busy ? 'Publishing…' : 'Publish';
}

const TABS = [
  ['text', 'Text'],
  ['products', 'Products'],
  ['photos', 'Photos'],
  ['contact', 'Contact details'],
  ['account', 'Account'],
];

function shell() {
  statusEl = h('p', { class: 'status', role: 'status' });
  publishBtn = h('button', { class: 'btn', type: 'button', onclick: () => publish() }, 'Publish');
  mainEl = h('main', { class: 'panel' });
  const nav = h(
    'nav',
    { class: 'tabs', 'aria-label': 'Sections' },
    TABS.map(([id, name]) =>
      h('button', { type: 'button', class: 'tab', 'data-tab': id, 'aria-current': state.tab === id ? 'page' : false, onclick: () => go(id) }, name),
    ),
  );
  app.replaceChildren(
    h(
      'header',
      { class: 'bar' },
      h('div', { class: 'bar__brand' }, h('img', { src: '../assets/img/logo-full.svg', alt: '', width: 44, height: 41 }), h('span', {}, 'Website admin')),
      nav,
      h(
        'div',
        { class: 'bar__actions' },
        h('a', { class: 'link', href: '../', target: '_blank', rel: 'noopener' }, 'View site ↗'),
        publishBtn,
        h('button', { class: 'link', type: 'button', onclick: logout }, 'Log out'),
      ),
    ),
    statusEl,
    mainEl,
  );
  app.removeAttribute('aria-busy');
  updateBar();
}

function go(tab) {
  state.tab = tab;
  document.querySelectorAll('.tab').forEach((b) => b.toggleAttribute('aria-current', b.dataset.tab === tab));
  ({ text: textTab, products: productsTab, photos: photosTab, contact: contactTab, account: accountTab })[tab]();
}

// ---------------------------------------------------------------- text

function textTab() {
  const all = leaves(state.defaults);
  const order = Object.keys(GROUPS);
  const rank = (g) => (order.includes(g) ? order.indexOf(g) : order.length);
  const groups = [...new Set(all.map((p) => p.split('.')[0]))].sort((a, b) => rank(a) - rank(b));
  const list = h('div', { class: 'fields' });

  function fill() {
    const q = state.search.trim().toLowerCase();
    const paths = all.filter((p) =>
      q ? p.toLowerCase().includes(q) || String(dig(state.content, p)).toLowerCase().includes(q) : p.split('.')[0] === state.group,
    );
    list.replaceChildren(
      ...(paths.length ? paths.map(field) : [h('p', { class: 'empty' }, 'Nothing matches that search.')]),
    );
  }

  function field(path) {
    const original = dig(state.defaults, path);
    const value = dig(state.content, path);
    const hidden = /\[PLACEHOLDER/.test(value);
    const area = h('textarea', { rows: 1, spellcheck: 'true' });
    area.value = value;
    const reset = h('button', { type: 'button', class: 'link small', hidden: value === original, onclick: () => {
      area.value = original;
      update();
    } }, 'Undo change');
    const size = () => {
      area.style.height = 'auto';
      area.style.height = `${area.scrollHeight + 2}px`;
    };
    function update() {
      setPath(state.content, path, area.value);
      reset.hidden = area.value === original;
      wrap.classList.toggle('field--changed', area.value !== original);
      size();
      markDirty();
    }
    area.addEventListener('input', update);
    requestAnimationFrame(size);
    const wrap = h(
      'label',
      { class: `field${value !== original ? ' field--changed' : ''}` },
      h('span', { class: 'field__label' }, state.search ? `${GROUPS[path.split('.')[0]] || words(path.split('.')[0])} › ${label(path)}` : label(path)),
      area,
      h(
        'span',
        { class: 'field__foot' },
        hidden ? h('span', { class: 'note' }, 'Hidden on the website until the [PLACEHOLDER] is replaced with the real detail.') : null,
        reset,
      ),
    );
    return wrap;
  }

  const search = h('input', { type: 'search', class: 'search', placeholder: 'Search all text…', value: state.search });
  search.addEventListener('input', () => {
    state.search = search.value;
    side.querySelectorAll('button').forEach((b) => b.toggleAttribute('aria-current', !state.search && b.dataset.group === state.group));
    fill();
  });
  const side = h(
    'aside',
    { class: 'groups' },
    search,
    groups.map((g) =>
      h('button', { type: 'button', 'data-group': g, 'aria-current': !state.search && g === state.group, onclick: () => {
        state.group = g;
        state.search = '';
        search.value = '';
        side.querySelectorAll('button').forEach((b) => b.toggleAttribute('aria-current', b.dataset.group === g));
        fill();
        window.scrollTo({ top: 0 });
      } }, GROUPS[g] || words(g)),
    ),
  );

  mainEl.replaceChildren(
    h('div', { class: 'text-layout' }, side, h('section', {}, h('p', { class: 'tip' }, 'Wrap words in *stars* to show them in gold italics. A new line in the box starts a new line on the page.'), list)),
  );
  fill();
}

// ---------------------------------------------------------------- products

const SPEC_LABELS = { ingredients: 'Ingredients', size: 'Size', usage: 'How to use', shelfLife: 'Shelf life', packaging: 'Packaging' };
const slugify = (name) =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) || 'product';

function productsTab() {
  const cats = state.content.products.categories;
  const all = [
    ...products.map((p) => ({ slug: p.slug, builtIn: true, category: p.category, name: state.content.products.items[p.slug]?.name, variant: state.content.products.items[p.slug]?.variant })),
    ...state.catalog.custom.map((c) => ({ ...c, builtIn: false })),
  ];
  const list = h('div', { class: 'products' });
  for (const item of all) {
    const hidden = state.catalog.hidden.includes(item.slug);
    const file = `product-${item.slug}.jpg`;
    const v = state.versions[`images/${file}`];
    list.append(
      h(
        'article',
        { class: `product-row${hidden ? ' product-row--hidden' : ''}` },
        h('div', { class: 'product-row__thumb' }, v ? h('img', { src: `../images/${file}?v=${v}`, alt: '' }) : h('span', {}, 'No photo')),
        h(
          'div',
          { class: 'product-row__body' },
          h('h3', {}, item.name || item.slug),
          h('p', {}, `${cats[item.category] || item.category} · ${item.variant || ''}`),
          hidden ? h('p', { class: 'note' }, 'Hidden from the website') : null,
        ),
        h(
          'div',
          { class: 'product-row__actions' },
          item.builtIn
            ? h('button', { type: 'button', class: 'link', onclick: () => {
                state.search = `products.items.${item.slug}`;
                go('text');
              } }, 'Edit text')
            : h('button', { type: 'button', class: 'link', onclick: () => productForm(item) }, 'Edit'),
          h('button', { type: 'button', class: 'link', onclick: () => {
            state.catalog.hidden = hidden ? state.catalog.hidden.filter((s) => s !== item.slug) : [...state.catalog.hidden, item.slug];
            markDirty();
            productsTab();
          } }, hidden ? 'Show on website' : 'Hide'),
          item.builtIn
            ? null
            : h('button', { type: 'button', class: 'link danger', onclick: () => {
                if (!confirm(`Delete "${item.name}"? Its page will be removed from the website when you publish.`)) return;
                state.catalog.custom = state.catalog.custom.filter((c) => c.slug !== item.slug);
                markDirty();
                productsTab();
              } }, 'Delete'),
        ),
      ),
    );
  }
  mainEl.replaceChildren(
    h('div', { class: 'row-head' }, h('h2', {}, 'Products'), h('button', { class: 'btn', type: 'button', onclick: () => productForm(null) }, '+ Add product')),
    h('p', { class: 'tip' }, 'New products get their own page, appear on the Products page and in the enquiry form. Press Publish after adding, editing or hiding.'),
    list,
  );
}

function productForm(existing) {
  const cats = state.content.products.categories;
  const data = existing || { category: 'face', specs: {}, highlights: [] };
  const input = (value, attrs = {}) => {
    const el = h('input', attrs);
    el.value = value || '';
    return el;
  };
  const area = (value, rows = 3) => {
    const el = h('textarea', { rows });
    el.value = value || '';
    el.style.overflow = 'auto';
    return el;
  };
  const f = {
    name: input(data.name, { required: true, maxlength: 120 }),
    variant: input(data.variant, { required: true, maxlength: 160 }),
    category: h('select', {}, Object.entries(cats).map(([k, v]) => h('option', { value: k, selected: k === data.category }, v))),
    short: input(data.short, { maxlength: 300 }),
    description: area(data.description, 4),
    highlights: area((data.highlights || []).join('\n'), 4),
    specs: Object.fromEntries(SPEC_KEYS.map((k) => [k, area(data.specs?.[k], 2)])),
  };
  const photo = h('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp,image/heic' });
  const preview = h('img', { class: 'product-form__preview', alt: '', hidden: true });
  if (existing && state.versions[`images/product-${existing.slug}.jpg`]) {
    preview.src = `../images/product-${existing.slug}.jpg?v=${state.versions[`images/product-${existing.slug}.jpg`]}`;
    preview.hidden = false;
  }
  photo.addEventListener('change', () => {
    if (photo.files[0]) {
      preview.src = URL.createObjectURL(photo.files[0]);
      preview.hidden = false;
    }
  });
  const msg = h('p', { role: 'alert' });
  const row = (labelText, el, hint) => h('label', { class: 'field' }, h('span', { class: 'field__label' }, labelText), el, hint ? h('span', { class: 'field__hint' }, hint) : null);
  const save = h('button', { class: 'btn', type: 'submit' }, existing ? 'Save product' : 'Add product');

  const form = h(
    'form',
    { class: 'form form--wide', onsubmit: async (e) => {
      e.preventDefault();
      const name = f.name.value.trim();
      const variant = f.variant.value.trim();
      if (!name || !variant) return (msg.textContent = 'Please fill in the name and the subtitle.'), (msg.className = 'alert alert--error');
      if (!existing && !photo.files[0]) return (msg.textContent = 'Please choose a photo for the new product.'), (msg.className = 'alert alert--error');
      let slug = existing?.slug;
      if (!slug) {
        const taken = new Set([...products.map((p) => p.slug), ...state.catalog.custom.map((c) => c.slug)]);
        const base = slugify(name);
        slug = base;
        for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
      }
      const item = {
        slug,
        category: f.category.value,
        name,
        variant,
        short: f.short.value.trim(),
        description: f.description.value.trim(),
        highlights: f.highlights.value.split('\n').map((x) => x.trim()).filter(Boolean),
        specs: Object.fromEntries(SPEC_KEYS.map((k) => [k, f.specs[k].value.trim()]).filter(([, v]) => v)),
      };
      save.disabled = true;
      save.textContent = 'Saving…';
      try {
        if (photo.files[0]) {
          const blob = await prepare(photo.files[0], { file: `product-${slug}.jpg`, w: 1200, h: 1500 });
          if (!blob) throw new Error('This photo could not be read. Try a JPG or PNG.');
          const form = new FormData();
          form.append('target', `product-${slug}.jpg`);
          form.append('photo', blob, `product-${slug}.jpg`);
          const res = await api('upload', { method: 'POST', form });
          state.versions[`images/${res.file}`] = res.version;
          state.images = [...state.images.filter((i) => i.file !== res.file), { file: res.file, w: res.w, h: res.h, kb: res.kb }];
        }
        const before = state.catalog.custom;
        state.catalog.custom = existing ? before.map((c) => (c.slug === slug ? item : c)) : [...before, item];
        state.dirty = true;
        if (!(await publish())) {
          state.catalog.custom = before;
          throw new Error(statusEl.textContent);
        }
        productsTab();
      } catch (err) {
        msg.textContent = err.message;
        msg.className = 'alert alert--error';
        save.disabled = false;
        save.textContent = existing ? 'Save product' : 'Add product';
      }
    } },
    row('Product name *', f.name, 'e.g. Face Oil'),
    row('Subtitle *', f.variant, 'Shown under the name, e.g. Kumkumadi & Saffron'),
    row('Category', f.category),
    row('Photo' + (existing ? '' : ' *'), h('div', { class: 'product-form__photo' }, preview, photo), 'Upright (portrait) photos look best; the site crops to fit.'),
    row('Description', f.description, 'One or two sentences about the product.'),
    row('At a glance', f.highlights, 'Short tags, one per line, e.g. 50 ml · 100% Botanical'),
    h('h3', { class: 'form__sub' }, 'Product details (optional, empty ones are not shown)'),
    SPEC_KEYS.map((k) => row(SPEC_LABELS[k], f.specs[k])),
    row('Search description (optional)', f.short, 'One line for Google and link previews.'),
    msg,
    h('div', { class: 'form__actions' }, save, h('button', { type: 'button', class: 'link', onclick: productsTab }, 'Cancel')),
  );
  mainEl.replaceChildren(h('h2', {}, existing ? `Edit ${existing.name}` : 'Add a product'), h('p', { class: 'tip' }, 'The product is published as soon as you save.'), form);
  window.scrollTo({ top: 0 });
  f.name.focus();
}

// ---------------------------------------------------------------- photos

function photoList() {
  let slots = {};
  try {
    slots = render().slots;
  } catch {
    slots = imageSlots;
  }
  const rows = Object.values(slots).map((d) => ({ file: d.file, page: d.page, w: d.width, h: d.height }));
  for (const img of state.images) {
    if (img.file.startsWith('ingredient-')) rows.push({ file: img.file, page: 'Hair Oil page: ingredient circle (transparent PNG)', w: INGREDIENT_IMAGE.width, h: INGREDIENT_IMAGE.height });
  }
  rows.push({ file: 'share-image.jpg', page: 'Preview when the site is shared on WhatsApp, Facebook, LinkedIn', w: 1200, h: 630 });
  return [...new Map(rows.map((r) => [r.file, r])).values()].filter((r) => /\.(jpg|png)$/.test(r.file));
}

// Resize in the browser so uploads are small and fast; the site crops to each frame by itself.
async function prepare(file, row) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const maxW = Math.max(row.w, 400);
  const scale = Math.min(1, maxW / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const png = row.file.endsWith('.png');
  return new Promise((resolve) => canvas.toBlob(resolve, png ? 'image/png' : 'image/jpeg', png ? undefined : 0.84));
}

function photosTab() {
  const grid = h('div', { class: 'photos' });
  for (const row of photoList()) {
    const current = state.images.find((i) => i.file === row.file);
    const thumb = h('img', { src: `../images/${row.file}?v=${state.versions[`images/${row.file}`] || ''}`, alt: '', loading: 'lazy' });
    const info = h('p', { class: 'photo__info' });
    const showInfo = (img) => {
      if (!img) return (info.textContent = 'No photo yet');
      const small = img.w && img.w < row.w * 0.6;
      info.textContent = `Now ${img.w} × ${img.h} · ${img.kb} KB${small ? ' · small, may look soft' : ''}`;
      info.classList.toggle('bad', !!small);
    };
    showInfo(current);
    const input = h('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp,image/heic', hidden: true });
    const btn = h('button', { type: 'button', class: 'btn btn--small', onclick: () => input.click() }, 'Replace photo');
    input.addEventListener('change', async () => {
      const file = input.files[0];
      input.value = '';
      if (!file || state.busy) return;
      btn.disabled = true;
      btn.textContent = 'Uploading…';
      try {
        const blob = await prepare(file, row);
        if (!blob) throw new Error('This photo could not be read. Try a JPG or PNG.');
        const form = new FormData();
        form.append('target', row.file);
        form.append('photo', blob, row.file);
        const res = await api('upload', { method: 'POST', form });
        state.versions[`images/${res.file}`] = res.version;
        const entry = { file: res.file, w: res.w, h: res.h, kb: res.kb };
        state.images = [...state.images.filter((i) => i.file !== res.file), entry];
        thumb.src = `../images/${res.file}?v=${res.version}`;
        showInfo(entry);
        state.dirty = true;
        await publish();
      } catch (e) {
        setStatus(e.message, 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Replace photo';
      }
    });
    grid.append(
      h(
        'article',
        { class: 'photo' },
        h('div', { class: `photo__thumb${row.file.endsWith('.png') ? ' photo__thumb--png' : ''}`, style: `aspect-ratio:${row.w}/${row.h}` }, thumb),
        h('div', { class: 'photo__body' }, h('h3', {}, row.page), h('p', { class: 'photo__meta' }, `${row.file} · best at ${row.w} × ${row.h}`), info, btn, input),
      ),
    );
  }
  mainEl.replaceChildren(
    h('p', { class: 'tip' }, 'Pick any photo from your phone or computer. It is resized automatically and the website crops it to fit each frame. The website updates as soon as the upload finishes.'),
    grid,
  );
}

// ---------------------------------------------------------------- contact details

function contactTab() {
  const form = h('form', { class: 'form', onsubmit: (e) => e.preventDefault() });
  for (const s of SETTINGS) {
    const input = h('input', { type: s.type, value: state.settings[s.key] || '', autocomplete: 'off' });
    input.addEventListener('input', () => {
      // WhatsApp links need digits only (country code first).
      state.settings[s.key] = s.key === 'whatsapp' ? input.value.replace(/\D+/g, '') : input.value.trim();
      markDirty();
    });
    form.append(h('label', { class: 'field' }, h('span', { class: 'field__label' }, s.label), input, h('span', { class: 'field__hint' }, s.hint)));
  }
  mainEl.replaceChildren(h('h2', {}, 'Contact details'), h('p', { class: 'tip' }, 'Press Publish after changing these to update the website.'), form);
}

// ---------------------------------------------------------------- account

function accountTab() {
  const current = h('input', { type: 'password', autocomplete: 'current-password', required: true });
  const next = h('input', { type: 'password', autocomplete: 'new-password', minlength: 10, required: true });
  const again = h('input', { type: 'password', autocomplete: 'new-password', required: true });
  const msg = h('p', { role: 'status' });
  const form = h(
    'form',
    { class: 'form', onsubmit: async (e) => {
      e.preventDefault();
      if (next.value !== again.value) return (msg.textContent = 'The new passwords do not match.'), (msg.className = 'alert alert--error');
      try {
        await api('password', { method: 'POST', json: { current: current.value, new: next.value } });
        form.reset();
        msg.textContent = 'Password changed. Use the new one next time you log in.';
        msg.className = 'alert alert--ok';
      } catch (err) {
        msg.textContent = err.message;
        msg.className = 'alert alert--error';
      }
    } },
    h('label', { class: 'field' }, h('span', { class: 'field__label' }, 'Current password'), current),
    h('label', { class: 'field' }, h('span', { class: 'field__label' }, 'New password (at least 10 characters)'), next),
    h('label', { class: 'field' }, h('span', { class: 'field__label' }, 'New password again'), again),
    msg,
    h('button', { class: 'btn', type: 'submit' }, 'Change password'),
  );
  mainEl.replaceChildren(h('h2', {}, 'Account'), h('p', { class: 'tip' }, `Logged in as ${state.user}.`), form);
}

async function logout() {
  if (state.dirty && !confirm('You have unpublished changes. Log out anyway?')) return;
  state.dirty = false;
  try {
    await api('logout', { method: 'POST' });
  } finally {
    location.reload();
  }
}

// ---------------------------------------------------------------- start

window.addEventListener('beforeunload', (e) => {
  if (state.dirty) e.preventDefault();
});

try {
  const [data, defaults] = await Promise.all([
    api('state'),
    fetch(`engine/content/en.json?t=${Date.now()}`).then((r) => r.json()),
  ]);
  Object.assign(state, {
    user: data.user,
    defaults,
    content: applyOverrides(defaults, data.overrides),
    settings: { ...data.settings },
    catalog: { hidden: data.catalog?.hidden || [], custom: data.catalog?.custom || [] },
    images: data.images,
    versions: data.versions,
    blog: data.blog,
    lastPublish: data.lastPublish,
  });
  shell();
  go('text');
  if (data.needsRepublish) {
    state.dirty = true;
    await publish({ quiet: true });
  } else if (typeof data.lastPublish?.at === 'number') {
    setStatus(`Last published ${new Date(data.lastPublish.at * 1000).toLocaleString()}.`);
  } else {
    setStatus('Edit anything, then press Publish to update the website.');
  }
} catch (e) {
  app.replaceChildren(h('p', { class: 'alert alert--error' }, `The editor could not load: ${e.message}`));
}

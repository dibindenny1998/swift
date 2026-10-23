import { esc, html } from './lib.mjs';

// An image slot from content/images.mjs. Renders the real image when a file exists in
// static/assets/img/, otherwise a clearly labelled placeholder box of the same shape.
// `arch` gives the frame a rounded, temple-arch top.
// `mobile` names a second slot (a portrait crop) that phones load instead.
export function image(ctx, slot, { eager = false, sizes = '100vw', className = '', arch = false, decorative = false, alt: altText, mobile } = {}) {
  const def = ctx.images[slot];
  if (!def) throw new Error(`Unknown image slot "${slot}" (add it to content/images.mjs)`);
  const alt = decorative ? '' : altText !== undefined ? esc(altText) : ctx.tx(`images.${slot}`);
  const ratio = def.width / def.height;
  const style = `--ratio:${ratio.toFixed(4)}${def.focus ? `;--pos:${def.focus}` : ''}`;
  const cls = `media${arch ? ' media--arch' : ''} ${className}`;

  if (def.exists) {
    const m = mobile && ctx.images[mobile]?.exists ? ctx.images[mobile] : null;
    const source = m ? `<source media="(max-width: 767px)" srcset="${ctx.asset(`images/${m.file}`)}" width="${m.width}" height="${m.height}">` : '';
    return html`<div class="${cls}" style="${style}">
  ${m ? '<picture>' : ''}${source}<img src="${ctx.asset(`images/${def.file}`)}" alt="${alt}" width="${def.width}" height="${def.height}" sizes="${sizes}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">${m ? '</picture>' : ''}
</div>`;
  }

  return html`<div class="${cls} media--placeholder" style="${style}" role="img" aria-label="${alt}">
  <div class="placeholder" aria-hidden="true">
    <span class="placeholder__tag">${ctx.t('placeholder.image')}</span>
    <span class="placeholder__alt">${alt}</span>
    <span class="placeholder__file">images/${esc(def.file)}</span>
  </div>
</div>`;
}

// A product card for grids. The heading link stretches over the whole card.
export function productCard(ctx, product, { headingLevel = 2, delay = 0 } = {}) {
  const key = `products.items.${product.slug}`;
  const h = `h${headingLevel}`;
  return html`<article class="card" data-reveal style="--delay:${delay}ms">
  ${image(ctx, `products/${product.slug}`, { arch: true, sizes: '(min-width: 768px) 45vw, 92vw', className: 'card__media' })}
  <div class="card__body">
    <p class="eyebrow">${ctx.t(`products.categories.${product.category}`)}</p>
    <${h} class="card__title"><a class="card__link" href="${ctx.link(`products/${product.slug}/`)}">${ctx.t(`${key}.name`)}</a></${h}>
    <p class="card__variant">${ctx.t(`${key}.variant`)}</p>
    <span class="link" aria-hidden="true">${ctx.t('cta.viewDetails')}</span>
  </div>
</article>`;
}

export function highlights(ctx, product) {
  return html`<ul class="specs">
${ctx.list(`products.items.${product.slug}.highlights`).map((item, i) => `  <li style="--n:${i}">${item}</li>\n`)}</ul>`;
}

export function pageHero(ctx, { eyebrow, title, intro, align = 'left' }) {
  return html`<section class="page-hero page-hero--${align}">
  <div class="container">
    <p class="eyebrow hero-in" style="--i:0">${eyebrow}</p>
    <h1 class="page-hero__title hero-in" style="--i:1">${title}</h1>
    ${intro ? `<p class="lead hero-in" style="--i:2">${intro}</p>` : ''}
  </div>
</section>`;
}

// "The goodness within" on the product page: each ingredient's icon, name and one line.
export function ingredientGrid(ctx) {
  const items = ctx.raw('ingredients');
  return html`<section class="section goodness-list" aria-labelledby="goodness-title">
  <div class="container">
    <header class="section-head center">
      <p class="eyebrow eyebrow--center" data-reveal>${ctx.t('goodness.eyebrow')}</p>
      <h2 class="h2" id="goodness-title" data-reveal>${ctx.t('goodness.title')}</h2>
    </header>
    <ul class="ing-grid">
${items.map(
    (item, i) => `      <li class="ing-card" data-reveal style="--delay:${(i % 4) * 120}ms">
        <span class="ing-card__icon"><img src="${ctx.asset(`images/ingredient-${item.key}.png`)}" alt="" width="400" height="400" loading="lazy" decoding="async"></span>
        <h3 class="ing-card__name">${esc(item.name)}</h3>
        <p class="ing-card__text">${esc(item.text)}</p>
      </li>\n`,
  )}    </ul>
  </div>
</section>`;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const formatDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

// A blog post card. `feature` = the large horizontal card at the top of the blog.
export function postCard(ctx, post, { feature = false, headingLevel = 2, delay = 0 } = {}) {
  const h = `h${headingLevel}`;
  const m = post.meta;
  return html`<article class="post-card${feature ? ' post-card--feature' : ''}" data-reveal data-category="${esc(m.category)}" style="--delay:${delay}ms">
  ${image(ctx, `blog/${post.slug}`, { alt: m.alt, className: 'post-card__media', eager: feature, sizes: feature ? '(min-width: 960px) 55vw, 92vw' : '(min-width: 960px) 30vw, 92vw' })}
  <div class="post-card__body">
    <p class="post-card__meta"><span class="chip">${esc(m.category)}</span><span>${formatDate(m.date)} · ${post.minutes} ${ctx.t('blog.minRead')}</span></p>
    <${h} class="post-card__title"><a class="card__link" href="${ctx.link(`blog/${post.slug}/`)}">${esc(m.title)}</a></${h}>
    <p class="post-card__excerpt">${esc(m.excerpt)}</p>
    <span class="link" aria-hidden="true">${ctx.t('cta.readMore')}</span>
  </div>
</article>`;
}

// Words that rise one by one as the line scrolls into view.
export const words = (text) =>
  text
    .split(' ')
    .map((w, i) => `<span class="w" style="--w:${i}">${w}</span>`)
    .join(' ');

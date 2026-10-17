import { esc, html } from './lib.mjs';

// An image slot from content/images.mjs. Renders the real image when a file exists in
// static/assets/img/, otherwise a clearly labelled placeholder box of the same shape.
// `arch` gives the frame a rounded, temple-arch top.
export function image(ctx, slot, { eager = false, sizes = '100vw', className = '', arch = false, decorative = false, alt: altText } = {}) {
  const def = ctx.images[slot];
  if (!def) throw new Error(`Unknown image slot "${slot}" (add it to content/images.mjs)`);
  const alt = decorative ? '' : altText !== undefined ? esc(altText) : ctx.tx(`images.${slot}`);
  const ratio = def.width / def.height;
  const style = `--ratio:${ratio.toFixed(4)}${def.focus ? `;--pos:${def.focus}` : ''}`;
  const cls = `media${arch ? ' media--arch' : ''} ${className}`;

  if (def.exists) {
    return html`<div class="${cls}" style="${style}">
  <img src="${ctx.asset(`images/${def.file}`)}" alt="${alt}" width="${def.width}" height="${def.height}" sizes="${sizes}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">
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
    <p class="card__text">${ctx.t(`${key}.short`)}</p>
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

// "The goodness within": the ingredients orbiting slowly around coconut oil. Each ingredient is
// a button; the panel beside it shows the one selected (it cycles on its own until someone picks).
// Without JavaScript every ingredient's text is simply listed.
export function goodness(ctx, { headingLevel = 2, copy = 'goodness' } = {}) {
  const items = ctx.raw('ingredients');
  const [core, ...ring] = items;
  const h = `h${headingLevel}`;
  const icon = (item) => `<img src="${ctx.asset(`images/ingredient-${item.key}.png`)}" alt="" width="400" height="400" loading="lazy" decoding="async">`;
  const step = 360 / ring.length;
  return html`<section class="section goodness" aria-labelledby="goodness-title">
  <div class="container goodness__grid">
    <header class="goodness__head">
      <p class="eyebrow" data-reveal>${ctx.t(`${copy}.eyebrow`)}</p>
      <${h} class="h2" id="goodness-title" data-reveal>${ctx.t(`${copy}.title`)}</${h}>
      <p class="lead" data-reveal>${ctx.t(`${copy}.text`)}</p>
      <p class="goodness__hint" data-reveal><span class="goodness__tap" aria-hidden="true"></span>${ctx.t('goodness.hint')}</p>
    </header>
    <div class="orbit" data-orbit data-reveal>
      <span class="orbit__ring" aria-hidden="true"></span>
      <ul class="orbit__nodes">
${ring.map(
    (item, i) => `        <li class="orbit__slot" style="--a:${(i * step).toFixed(1)}deg"><button class="orbit__node" type="button" data-ing="${i + 1}" aria-controls="ing-${i + 1}" aria-pressed="false"><span class="orbit__icon">${icon(item)}<span class="orbit__plus" aria-hidden="true">+</span></span><span class="visually-hidden">${esc(item.name)}</span></button></li>\n`,
  )}      </ul>
      <button class="orbit__core" type="button" data-ing="0" aria-controls="ing-0" aria-pressed="true">${icon(core)}<span class="visually-hidden">${esc(core.name)}</span></button>
    </div>
    <div class="goodness__panel" data-reveal>
${items.map(
    (item, i) => `      <article class="ing${i === 0 ? ' is-active' : ''}" id="ing-${i}" data-ing-panel="${i}">
        <p class="ing__tagline">${esc(item.tagline)}</p>
        <h3 class="ing__name">${esc(item.name)}</h3>
        <p class="ing__text">${esc(item.text)}</p>
      </article>\n`,
  )}      <div class="goodness__controls" aria-hidden="true" hidden data-ing-controls>
        <button type="button" class="goodness__arrow" data-ing-prev tabindex="-1" aria-label="${ctx.tx('goodness.prev')}">&larr;</button>
        <span class="goodness__count" data-ing-count>1 / ${items.length}</span>
        <button type="button" class="goodness__arrow" data-ing-next tabindex="-1" aria-label="${ctx.tx('goodness.next')}">&rarr;</button>
      </div>
    </div>
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

import { esc, html } from './lib.mjs';

// An image slot from content/images.mjs. Renders the real image when a file exists in
// static/assets/img/, otherwise a clearly labelled placeholder box of the same shape.
export function image(ctx, slot, { eager = false, sizes = '100vw', className = '' } = {}) {
  const def = ctx.images[slot];
  if (!def) throw new Error(`Unknown image slot "${slot}" (add it to content/images.mjs)`);
  const alt = ctx.tx(`images.${slot}`);
  const ratio = def.ratio;
  const style = `--ratio:${ratio.toFixed(4)}`;

  if (def.file) {
    const w = 1600;
    const h = Math.round(w / ratio);
    return html`<div class="media ${className}" style="${style}">
  <img src="${ctx.asset(def.file)}" alt="${alt}" width="${w}" height="${h}" sizes="${sizes}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">
</div>`;
  }

  return html`<div class="media media--placeholder ${className}" style="${style}" role="img" aria-label="${alt}">
  <div class="placeholder" aria-hidden="true">
    <span class="placeholder__tag">${ctx.t('placeholder.image')}</span>
    <span class="placeholder__alt">${alt}</span>
    <span class="placeholder__file">assets/img/${esc(slot)}.jpg</span>
  </div>
</div>`;
}

// A product card for grids. The heading link stretches over the whole card.
export function productCard(ctx, product, { headingLevel = 2, delay = 0 } = {}) {
  const key = `products.items.${product.slug}`;
  const h = `h${headingLevel}`;
  return html`<article class="card" data-reveal style="--delay:${delay}ms">
  ${image(ctx, `products/${product.slug}`, { sizes: '(min-width: 768px) 45vw, 100vw', className: 'card__media' })}
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
${ctx.list(`products.items.${product.slug}.highlights`).map((item) => `  <li>${item}</li>\n`)}</ul>`;
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

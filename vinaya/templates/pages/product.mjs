import { esc, html } from '../lib.mjs';
import { band, layout } from '../layout.mjs';
import { highlights, image, productCard } from '../components.mjs';

export default function product(ctx, p) {
  const key = `products.items.${p.slug}`;
  const others = ctx.products.filter((o) => o.slug !== p.slug);
  const name = ctx.raw(`${key}.name`);
  const variant = ctx.raw(`${key}.variant`);

  const body = html`
<nav class="breadcrumb container" aria-label="${ctx.tx('nav.breadcrumb')}">
  <ol>
    <li><a href="${ctx.link('')}">${ctx.t('nav.home')}</a></li>
    <li><a href="${ctx.link('products/')}">${ctx.t('nav.products')}</a></li>
    <li><span aria-current="page">${ctx.t(`${key}.name`)}</span></li>
  </ol>
</nav>

<article class="product">
  <div class="container product__grid">
    <div class="product__media hero-in" style="--i:1">
      ${image(ctx, `products/${p.slug}`, { eager: true, sizes: '(min-width: 960px) 45vw, 100vw' })}
    </div>

    <div class="product__info">
      <p class="eyebrow hero-in" style="--i:0">${ctx.t(`products.categories.${p.category}`)}</p>
      <h1 class="product__title hero-in" style="--i:1">${ctx.t(`${key}.name`)}</h1>
      <p class="variant hero-in" style="--i:2">${ctx.t(`${key}.variant`)}</p>
      <div class="product__desc hero-in" style="--i:3">
${ctx.raw(`${key}.description`).map((_, i) => `        <p>${ctx.t(`${key}.description.${i}`)}</p>\n`)}      </div>

      <section class="product__block" aria-labelledby="highlights-title" data-reveal>
        <h2 class="eyebrow" id="highlights-title">${ctx.t('products.page.highlightsTitle')}</h2>
        ${highlights(ctx, p)}
      </section>

      <div class="product__cta" data-reveal>
        <a class="btn btn--solid" href="${ctx.link('contact/')}?product=${esc(p.slug)}#enquiry">${ctx.t('products.page.enquire')}</a>
        <p class="small">${ctx.t('products.page.enquireNote')} <a href="${ctx.link('export/')}">${ctx.t('products.page.exportLink')}</a></p>
      </div>

      <section class="product__block" aria-labelledby="details-title" data-reveal>
        <h2 class="eyebrow" id="details-title">${ctx.t('products.page.detailsTitle')}</h2>
        <dl class="details">
${p.specs.map(
    (spec) => html`          <div>
            <dt>${ctx.t(`products.labels.${spec}`)}</dt>
            <dd>${ctx.t(`${key}.specs.${spec}`)}</dd>
          </div>
`,
  )}        </dl>
      </section>
    </div>
  </div>
</article>

${others.length ? html`<section class="section more" aria-labelledby="more-title">
  <div class="container">
    <header class="section-head">
      <h2 class="h2" id="more-title" data-reveal>${ctx.t('products.page.more')}</h2>
    </header>
    <div class="product-grid product-grid--${Math.min(others.length, 3)}">
${others.slice(0, 3).map((o, i) => productCard(ctx, o, { headingLevel: 3, delay: i * 180 }))}
    </div>
    <p style="margin-top:4rem" data-reveal><a class="link" href="${ctx.link('products/')}">${ctx.t('cta.allProducts')}</a></p>
  </div>
</section>` : ''}

${band(ctx)}
`;

  return layout(ctx, {
    title: `${name}, ${variant} | Vinaya`,
    description: ctx.raw(`${key}.short`),
    body,
    bodyClass: 'page-product',
  });
}

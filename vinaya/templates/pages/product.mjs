import { esc, html, pad } from '../lib.mjs';
import { band, layout } from '../layout.mjs';
import { goodness, highlights, image, productCard } from '../components.mjs';

export default function product(ctx, p) {
  const key = `products.items.${p.slug}`;
  const others = ctx.products.filter((o) => o.slug !== p.slug);
  const name = ctx.raw(`${key}.name`);
  const variant = ctx.raw(`${key}.variant`);
  const data = ctx.raw(key);

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
      ${image(ctx, `products/${p.slug}`, { eager: true, arch: true, sizes: '(min-width: 960px) 45vw, 92vw' })}
    </div>

    <div class="product__info">
      <p class="eyebrow hero-in" style="--i:0">${ctx.t(`products.categories.${p.category}`)}</p>
      <h1 class="product__title hero-in" style="--i:1">${ctx.t(`${key}.name`)}</h1>
      <p class="variant hero-in" style="--i:2">${ctx.t(`${key}.variant`)}</p>
      <div class="product__desc hero-in" style="--i:3">
        <p>${ctx.t(`${key}.description.0`)}</p>
      </div>

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

${p.goodness ? goodness(ctx) : ''}

${data.ritual ? html`<section class="section section--sand ritual" aria-labelledby="ritual-title">
  <div class="container">
    <header class="section-head center">
      <p class="eyebrow eyebrow--center" data-reveal>${ctx.t('products.page.ritualSub')}</p>
      <h2 class="h2" id="ritual-title" data-reveal>${ctx.t('products.page.ritualTitle')}</h2>
    </header>
    <ol class="steps" data-reveal>
${data.ritual.map(
    (_, i) => `      <li class="step" data-reveal style="--delay:${i * 200}ms"><span class="step__num" aria-hidden="true">${pad(i + 1)}</span><h3 class="step__title">${ctx.t(`${key}.ritual.${i}.title`)}</h3><p class="step__text">${ctx.t(`${key}.ritual.${i}.text`)}</p></li>\n`,
  )}    </ol>
    ${data.patch ? `<aside class="patch" data-reveal><h3 class="patch__title">${ctx.t(`${key}.patch.title`)}</h3><p>${ctx.t(`${key}.patch.text`)}</p></aside>` : ''}
  </div>
</section>` : ''}

${data.method ? html`<section class="section section--green method" aria-labelledby="method-title">
  <div class="container">
    <header class="section-head center">
      <h2 class="h2" id="method-title" data-reveal>${ctx.t('products.page.methodTitle')}</h2>
    </header>
    <ol class="method__steps">
${data.method.map(
    (_, i) => `      <li data-reveal style="--delay:${i * 200}ms"><span class="method__num">${pad(i + 1)}</span><span class="method__title">${ctx.t(`${key}.method.${i}.title`)}</span></li>\n`,
  )}    </ol>
  </div>
</section>` : ''}

${data.faq ? html`<section class="section faq" aria-labelledby="faq-title">
  <div class="container container--narrow">
    <header class="section-head center">
      <h2 class="h2" id="faq-title" data-reveal>${ctx.t('products.page.faqTitle')}</h2>
    </header>
    <div class="faq__list" data-reveal>
${data.faq.map(
    (_, i) => `      <details class="faq__item"${i === 0 ? ' open' : ''}><summary>${ctx.t(`${key}.faq.${i}.q`)}</summary><p>${ctx.t(`${key}.faq.${i}.a`)}</p></details>\n`,
  )}    </div>
  </div>
</section>` : ''}

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

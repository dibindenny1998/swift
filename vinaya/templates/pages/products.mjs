import { html } from '../lib.mjs';
import { band, layout } from '../layout.mjs';
import { pageHero, productCard } from '../components.mjs';

export default function productsPage(ctx) {
  const cols = Math.min(ctx.products.length, 3);
  const body = html`
${pageHero(ctx, {
    eyebrow: ctx.t('products.page.eyebrow'),
    title: ctx.t('products.page.title'),
    intro: ctx.t('products.page.intro'),
  })}

<section class="section" style="padding-top:0" aria-label="${ctx.tx('products.page.eyebrow')}">
  <div class="container">
    <div class="product-grid product-grid--${cols}">
${ctx.products.map((p, i) => productCard(ctx, p, { delay: (i % cols) * 180 }))}
    </div>
    <aside class="coming-soon" data-reveal>
      <p class="eyebrow">${ctx.t('products.page.comingSoonTitle')}</p>
      <p class="coming-soon__text">${ctx.t('products.page.comingSoon')}</p>
    </aside>
  </div>
</section>

${band(ctx)}
`;

  return layout(ctx, {
    title: ctx.raw('meta.products.title'),
    description: ctx.raw('meta.products.description'),
    body,
    bodyClass: 'page-products',
  });
}

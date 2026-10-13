import { html, pad } from '../lib.mjs';
import { band, layout } from '../layout.mjs';
import { highlights, image } from '../components.mjs';

export default function home(ctx) {
  const featured = ctx.products.find((p) => p.featured) ?? ctx.products[0];
  const gift = ctx.products.find((p) => p.slug === 'gift-set');
  const fKey = `products.items.${featured.slug}`;

  const body = html`
<section class="hero" aria-labelledby="hero-title">
  <div class="container hero__grid">
    <div class="hero__text">
      <p class="eyebrow hero-in" style="--i:0">${ctx.t('home.hero.eyebrow')}</p>
      <h1 class="hero__title hero-in" id="hero-title" style="--i:1">${ctx.t('home.hero.title')}</h1>
      <p class="lead hero-in" style="--i:2">${ctx.t('home.hero.text')}</p>
      <div class="actions hero-in" style="--i:3">
        <a class="btn" href="${ctx.link('products/')}">${ctx.t('cta.discover')}</a>
        <a class="link" href="${ctx.link('export/')}">${ctx.t('cta.partner')}</a>
      </div>
    </div>
    <div class="hero__media hero-in" style="--i:2">
      ${image(ctx, 'home-hero', { eager: true, sizes: '(min-width: 960px) 42vw, 100vw' })}
    </div>
  </div>
</section>

<section class="section belief" aria-labelledby="belief-title">
  <div class="container container--narrow center">
    <h2 class="eyebrow" id="belief-title" data-reveal>${ctx.t('home.belief.eyebrow')}</h2>
    <blockquote class="belief__quote" data-reveal style="--delay:150ms">
      <p>${ctx.t('home.belief.quote')}</p>
    </blockquote>
    <p class="belief__text" data-reveal style="--delay:300ms">${ctx.t('home.belief.text')}</p>
    <p data-reveal style="--delay:400ms"><a class="link" href="${ctx.link('our-story/')}">${ctx.t('cta.readStory')}</a></p>
  </div>
</section>

<section class="section section--tone feature" aria-labelledby="featured-title">
  <div class="container split">
    <div class="split__media" data-reveal>
      ${image(ctx, `products/${featured.slug}`, { sizes: '(min-width: 960px) 45vw, 100vw' })}
    </div>
    <div class="split__text">
      <p class="eyebrow" data-reveal>${ctx.t('home.featured.eyebrow')} · ${ctx.t(`products.categories.${featured.category}`)}</p>
      <h2 class="h2" id="featured-title" data-reveal>${ctx.t(`${fKey}.name`)}</h2>
      <p class="variant" data-reveal>${ctx.t(`${fKey}.variant`)}</p>
      <p class="measure" data-reveal>${ctx.t(`${fKey}.short`)}</p>
      <div data-reveal>${highlights(ctx, featured)}</div>
      <p data-reveal><a class="link" href="${ctx.link(`products/${featured.slug}/`)}">${ctx.t('cta.viewDetails')}</a></p>
    </div>
  </div>
</section>

<section class="section source" aria-labelledby="source-title">
  <div class="container">
    <header class="section-head center">
      <p class="eyebrow" data-reveal>${ctx.t('home.source.eyebrow')}</p>
      <h2 class="h2" id="source-title" data-reveal>${ctx.t('home.source.title')}</h2>
      <p class="lead lead--center" data-reveal>${ctx.t('home.source.intro')}</p>
    </header>
    <ol class="steps" data-reveal data-steps>
${ctx.raw('home.source.steps').map(
    (_, i) => html`      <li class="step" data-reveal style="--delay:${i * 220}ms">
        <span class="step__num" aria-hidden="true">${pad(i + 1)}</span>
        <h3 class="step__title">${ctx.t(`home.source.steps.${i}.title`)}</h3>
        <p class="step__text">${ctx.t(`home.source.steps.${i}.text`)}</p>
      </li>
`,
  )}    </ol>
    <p class="closing" data-reveal>${ctx.t('home.source.closing')}</p>
  </div>
</section>

<section class="section section--tone approach" aria-labelledby="approach-title">
  <div class="container">
    <header class="section-head">
      <p class="eyebrow" data-reveal>${ctx.t('home.approach.eyebrow')}</p>
      <h2 class="h2" id="approach-title" data-reveal>${ctx.t('home.approach.title')}</h2>
      <p class="lead" data-reveal>${ctx.t('home.approach.intro')}</p>
    </header>
    <ul class="pillars">
${ctx.raw('home.approach.pillars').map(
    (_, i) => html`      <li class="pillar" data-reveal style="--delay:${i * 180}ms">
        <h3 class="pillar__title">${ctx.t(`home.approach.pillars.${i}.title`)}</h3>
        <p>${ctx.t(`home.approach.pillars.${i}.text`)}</p>
      </li>
`,
  )}    </ul>
  </div>
</section>

${gift ? html`<section class="section gift" aria-labelledby="gift-title">
  <div class="container split split--reverse">
    <div class="split__media" data-reveal>
      ${image(ctx, `products/${gift.slug}`, { sizes: '(min-width: 960px) 45vw, 100vw' })}
    </div>
    <div class="split__text">
      <p class="eyebrow" data-reveal>${ctx.t('home.gift.eyebrow')}</p>
      <h2 class="h2" id="gift-title" data-reveal>${ctx.t('home.gift.title')}</h2>
      <p class="measure" data-reveal>${ctx.t('home.gift.text')}</p>
      <div data-reveal>${highlights(ctx, gift)}</div>
      <p data-reveal><a class="link" href="${ctx.link(`products/${gift.slug}/`)}">${ctx.t('cta.viewDetails')}</a></p>
    </div>
  </div>
</section>` : ''}

${band(ctx)}
`;

  return layout(ctx, {
    title: ctx.raw('meta.home.title'),
    description: ctx.raw('meta.home.description'),
    body,
    bodyClass: 'page-home',
  });
}

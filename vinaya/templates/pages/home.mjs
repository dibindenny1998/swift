import { LEAF, MARK, esc, html, pad } from '../lib.mjs';
import { band, layout } from '../layout.mjs';
import { highlights, image } from '../components.mjs';

// Circular badge with slowly rotating text around the leaf mark.
function badge(ctx) {
  const text = esc(ctx.raw('home.hero.badge'));
  return html`<div class="badge" aria-hidden="true">
  <svg class="badge__ring" viewBox="0 0 200 200">
    <defs><path id="badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"/></defs>
    <text><textPath href="#badge-circle" textLength="486" lengthAdjust="spacingAndGlyphs">${text}</textPath></text>
  </svg>
  <span class="badge__mark">${MARK}</span>
</div>`;
}

// A slow, endless strip of product facts. The list is repeated so the loop is seamless;
// the copy is hidden from screen readers because the same facts appear in the page itself.
function ticker(ctx) {
  const items = ctx.list('home.ticker').map((t) => `<li>${t}</li>`).join('');
  return html`<div class="ticker" aria-hidden="true">
  <div class="ticker__track">
    <ul>${items}</ul><ul>${items}</ul>
  </div>
</div>`;
}

export default function home(ctx) {
  const featured = ctx.products.find((p) => p.featured) ?? ctx.products[0];
  const gift = ctx.products.find((p) => p.slug === 'gift-set');
  const fKey = `products.items.${featured.slug}`;

  const body = html`
<section class="hero" aria-labelledby="hero-title">
  <span class="drift drift--1" data-parallax="-0.25" aria-hidden="true">${LEAF}</span>
  <span class="drift drift--2" data-parallax="0.18" aria-hidden="true">${LEAF}</span>
  <span class="drift drift--3" data-parallax="-0.12" aria-hidden="true">${LEAF}</span>
  <div class="container hero__grid">
    <div class="hero__text">
      <p class="eyebrow hero-in" style="--i:0">${ctx.t('home.hero.eyebrow')}</p>
      <h1 class="hero__title" id="hero-title">${ctx
        .t('home.hero.title')
        .split('<br>')
        .map((line, i) => `<span class="line"><span style="--l:${i}">${line}</span></span>`)
        .join('')}</h1>
      <p class="lead hero-in" style="--i:2">${ctx.t('home.hero.text')}</p>
      <div class="actions hero-in" style="--i:3">
        <a class="btn btn--solid" href="${ctx.link('products/')}">${ctx.t('cta.discover')}</a>
        <a class="link" href="${ctx.link('export/')}">${ctx.t('cta.partner')}</a>
      </div>
    </div>
    <div class="hero__visual hero-in" style="--i:2" data-parallax="-0.08">
      ${image(ctx, 'home-hero', { eager: true, arch: true, sizes: '(min-width: 960px) 40vw, 92vw' })}
      ${badge(ctx)}
    </div>
  </div>
</section>

${ticker(ctx)}

<section class="section belief" aria-labelledby="belief-title">
  <div class="container container--narrow center">
    <span class="ornament" data-reveal>${LEAF}</span>
    <h2 class="eyebrow eyebrow--center" id="belief-title" data-reveal>${ctx.t('home.belief.eyebrow')}</h2>
    <blockquote class="belief__quote" data-reveal style="--delay:150ms">
      <p>${ctx.t('home.belief.quote')}</p>
    </blockquote>
    <p class="belief__text" data-reveal style="--delay:300ms">${ctx.t('home.belief.text')}</p>
    <p data-reveal style="--delay:400ms"><a class="link" href="${ctx.link('our-story/')}">${ctx.t('cta.readStory')}</a></p>
  </div>
</section>

<section class="section section--green feature" aria-labelledby="featured-title">
  <div class="container split">
    <div class="split__media" data-reveal>
      ${image(ctx, `products/${featured.slug}`, { arch: true, sizes: '(min-width: 960px) 40vw, 92vw' })}
    </div>
    <div class="split__text">
      <p class="eyebrow" data-reveal>${ctx.t('home.featured.eyebrow')} · ${ctx.t(`products.categories.${featured.category}`)}</p>
      <h2 class="h2" id="featured-title" data-reveal>${ctx.t(`${fKey}.name`)}</h2>
      <p class="variant" data-reveal>${ctx.t(`${fKey}.variant`)}</p>
      <p class="measure" data-reveal>${ctx.t(`${fKey}.short`)}</p>
      <div data-reveal>${highlights(ctx, featured)}</div>
      <div class="actions" data-reveal>
        <a class="btn btn--gold" href="${ctx.link(`products/${featured.slug}/`)}">${ctx.t('cta.viewDetails')}</a>
        <a class="link" href="${ctx.link('contact/')}?product=${esc(featured.slug)}#enquiry">${ctx.t('cta.enquire')}</a>
      </div>
    </div>
  </div>
</section>

<section class="section section--photo source" aria-labelledby="source-title">
  <div class="section__bg" data-parallax="0.12">${image(ctx, 'home-source', { decorative: true, sizes: '100vw' })}</div>
  <div class="container">
    <header class="section-head center">
      <p class="eyebrow eyebrow--center" data-reveal>${ctx.t('home.source.eyebrow')}</p>
      <h2 class="h2" id="source-title" data-reveal>${ctx.t('home.source.title')}</h2>
      <p class="lead lead--center" data-reveal>${ctx.t('home.source.intro')}</p>
    </header>
    <ol class="steps" data-reveal>
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

<section class="section section--sand approach" aria-labelledby="approach-title">
  <div class="container">
    <header class="section-head center">
      <p class="eyebrow eyebrow--center" data-reveal>${ctx.t('home.approach.eyebrow')}</p>
      <h2 class="h2" id="approach-title" data-reveal>${ctx.t('home.approach.title')}</h2>
      <p class="lead lead--center" data-reveal>${ctx.t('home.approach.intro')}</p>
    </header>
    <ul class="cards">
${ctx.raw('home.approach.pillars').map(
    (_, i) => html`      <li class="tile" data-reveal style="--delay:${i * 180}ms">
        <span class="tile__icon" style="--turn:${i * 40 - 40}deg">${LEAF}</span>
        <h3 class="tile__title">${ctx.t(`home.approach.pillars.${i}.title`)}</h3>
        <p>${ctx.t(`home.approach.pillars.${i}.text`)}</p>
      </li>
`,
  )}    </ul>
  </div>
</section>

${gift ? html`<section class="section gift" aria-labelledby="gift-title">
  <div class="container split split--reverse">
    <div class="split__media" data-reveal>
      ${image(ctx, `products/${gift.slug}`, { arch: true, sizes: '(min-width: 960px) 40vw, 92vw' })}
    </div>
    <div class="split__text">
      <p class="eyebrow" data-reveal>${ctx.t('home.gift.eyebrow')}</p>
      <h2 class="h2" id="gift-title" data-reveal>${ctx.t('home.gift.title')}</h2>
      <p class="measure" data-reveal>${ctx.t('home.gift.text')}</p>
      <div data-reveal>${highlights(ctx, gift)}</div>
      <div class="actions" data-reveal>
        <a class="btn" href="${ctx.link(`products/${gift.slug}/`)}">${ctx.t('cta.viewDetails')}</a>
      </div>
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

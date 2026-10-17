import { LEAF, MARK, esc, html, pad } from '../lib.mjs';
import { band, layout } from '../layout.mjs';
import { goodness, highlights, image, postCard } from '../components.mjs';

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

// "Our collections": every category of the brand, live ones linked, future ones marked.
function collections(ctx) {
  const items = ctx.raw('home.collections.items');
  return html`<section class="section collections" aria-labelledby="collections-title">
  <div class="container">
    <header class="section-head center">
      <p class="eyebrow eyebrow--center" data-reveal>${ctx.t('home.collections.eyebrow')}</p>
      <h2 class="h2" id="collections-title" data-reveal>${ctx.t('home.collections.title')}</h2>
      <p class="lead lead--center" data-reveal>${ctx.t('home.collections.intro')}</p>
    </header>
    <ul class="collection-grid">
${items.map(
    (item, i) => html`      <li class="collection${item.link ? '' : ' collection--soon'}" data-reveal style="--delay:${i * 140}ms">
        ${image(ctx, `col-${item.key}`, { className: 'collection__media', sizes: '(min-width: 960px) 24vw, (min-width: 600px) 46vw, 92vw' })}
        <div class="collection__body">
          ${item.link ? '' : `<span class="collection__soon">${ctx.t('home.collections.soon')}</span>`}
          <h3 class="collection__title">${item.link ? `<a class="card__link" href="${ctx.link(item.link)}">${ctx.t(`home.collections.items.${i}.title`)}</a>` : ctx.t(`home.collections.items.${i}.title`)}</h3>
          <p>${ctx.t(`home.collections.items.${i}.text`)}</p>
          ${item.link ? `<span class="link" aria-hidden="true">${ctx.t('home.collections.explore')}</span>` : ''}
        </div>
      </li>
`,
  )}    </ul>
  </div>
</section>`;
}

// Latest three blog posts.
function journal(ctx) {
  if (!ctx.posts.length) return '';
  return html`<section class="section section--sand journal" aria-labelledby="journal-title">
  <div class="container">
    <header class="section-head journal__head">
      <div>
        <p class="eyebrow" data-reveal>${ctx.t('home.journal.eyebrow')}</p>
        <h2 class="h2" id="journal-title" data-reveal>${ctx.t('home.journal.title')}</h2>
      </div>
      <a class="link" href="${ctx.link('blog/')}" data-reveal>${ctx.t('home.journal.all')}</a>
    </header>
    <div class="post-grid">
${ctx.posts.slice(0, 3).map((p, i) => postCard(ctx, p, { headingLevel: 3, delay: i * 150 }))}
    </div>
  </div>
</section>`;
}

export default function home(ctx) {
  const featured = ctx.products.find((p) => p.featured) ?? ctx.products[0];
  const fKey = `products.items.${featured.slug}`;

  const body = html`
<section class="hero hero--brand" aria-labelledby="hero-title">
  <div class="hero__bg" data-parallax="0.15">${image(ctx, 'home-hero', { eager: true, decorative: true, sizes: '100vw' })}</div>
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
        <a class="btn btn--gold" href="${ctx.link('products/')}">${ctx.t('cta.discover')}</a>
        <a class="link" href="${ctx.link('our-story/')}">${ctx.t('cta.readStory')}</a>
      </div>
    </div>
  </div>
  <div class="hero__badge hero-in" style="--i:4">${badge(ctx)}</div>
</section>

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

${collections(ctx)}

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

${goodness(ctx, { copy: 'home.goodness' })}

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
    </header>
    <ul class="cards">
${ctx.raw('home.approach.pillars').map(
    (_, i) => html`      <li class="tile" data-reveal style="--delay:${i * 180}ms">
        ${image(ctx, `approach-${i + 1}`, { className: 'tile__media', sizes: '(min-width: 768px) 30vw, 92vw' })}
        <div class="tile__body">
          <h3 class="tile__title">${ctx.t(`home.approach.pillars.${i}.title`)}</h3>
          ${ctx.raw('home.approach.pillars')[i].subtitle ? `<p class="tile__sub">${ctx.t(`home.approach.pillars.${i}.subtitle`)}</p>` : ''}
          <p>${ctx.t(`home.approach.pillars.${i}.text`)}</p>
        </div>
      </li>
`,
  )}    </ul>
  </div>
</section>

${journal(ctx)}

${band(ctx)}
`;

  return layout(ctx, {
    title: ctx.raw('meta.home.title'),
    description: ctx.raw('meta.home.description'),
    body,
    bodyClass: 'page-home',
  });
}

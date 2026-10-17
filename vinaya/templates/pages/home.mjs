import { LEAF, MARK, esc, html, pad } from '../lib.mjs';
import { band, layout } from '../layout.mjs';
import { goodness, image } from '../components.mjs';

// Home tells the story in pictures: few words, big images, colour and slow motion.

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

// Words that rise one by one as the line scrolls into view.
const words = (text) =>
  text
    .split(' ')
    .map((w, i) => `<span class="w" style="--w:${i}">${w}</span>`)
    .join(' ');

// "From the source to you": the screen pins while three images crossfade as you scroll.
function tale(ctx) {
  const steps = ctx.raw('home.tale.steps');
  const slots = ['tale-nature', 'tale-tradition', 'tale-you'];
  return html`<section class="tale" aria-labelledby="tale-title" data-tale style="--steps:${steps.length}">
  <div class="tale__sticky">
    <div class="tale__media">
${slots.map((s, i) => `      <div class="tale__img${i === 0 ? ' is-active' : ''}" data-step="${i}">${image(ctx, s, { sizes: '(min-width: 960px) 50vw, 100vw' })}</div>\n`)}    </div>
    <div class="tale__text">
      <h2 class="eyebrow" id="tale-title">${ctx.t('home.tale.eyebrow')}</h2>
      <ol class="tale__steps">
${steps.map(
    (_, i) => `        <li class="tale__step${i === 0 ? ' is-active' : ''}" data-step="${i}"><span class="tale__num">${pad(i + 1)}</span><h3 class="tale__word">${ctx.t(`home.tale.steps.${i}.word`)}</h3><p class="tale__line">${ctx.t(`home.tale.steps.${i}.line`)}</p></li>\n`,
  )}      </ol>
      <div class="tale__dots" aria-hidden="true">${steps.map((_, i) => `<span${i === 0 ? ' class="is-active"' : ''} data-step="${i}"></span>`).join('')}</div>
    </div>
  </div>
</section>`;
}

// Collections: image and name only. Live ones link, future ones are marked.
function collections(ctx) {
  const items = ctx.raw('home.collections.items');
  return html`<section class="section collections" aria-labelledby="collections-title">
  <div class="container">
    <header class="section-head center">
      <p class="eyebrow eyebrow--center" data-reveal>${ctx.t('home.collections.eyebrow')}</p>
      <h2 class="h2" id="collections-title" data-reveal>${ctx.t('home.collections.title')}</h2>
    </header>
    <ul class="collection-grid">
${items.map(
    (item, i) => html`      <li class="collection${item.link ? '' : ' collection--soon'}" data-reveal style="--delay:${i * 140}ms">
        ${image(ctx, `col-${item.key}`, { className: 'collection__media', sizes: '(min-width: 1024px) 24vw, (min-width: 600px) 46vw, 92vw' })}
        <div class="collection__body">
          ${item.link ? '' : `<span class="collection__soon">${ctx.t('home.collections.soon')}</span>`}
          <h3 class="collection__title">${item.link ? `<a class="card__link" href="${ctx.link(item.link)}">${ctx.t(`home.collections.items.${i}.title`)}</a>` : ctx.t(`home.collections.items.${i}.title`)}</h3>
        </div>
      </li>
`,
  )}    </ul>
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
        <a class="btn btn--gold" href="${ctx.link('products/')}">${ctx.t('home.hero.cta')}</a>
      </div>
    </div>
  </div>
  <div class="hero__badge hero-in" style="--i:4">${badge(ctx)}</div>
  <span class="scroll-cue" aria-hidden="true"></span>
</section>

<section class="section statement" aria-label="${ctx.tx('home.belief.eyebrow')}">
  <div class="container container--narrow center">
    <span class="ornament" data-reveal>${LEAF}</span>
    <p class="statement__quote words" data-reveal>${words(ctx.raw('home.belief.quote'))}</p>
  </div>
</section>

${tale(ctx)}

${collections(ctx)}

<section class="section section--green feature" aria-labelledby="featured-title">
  <div class="container split">
    <div class="split__media" data-reveal>
      ${image(ctx, `products/${featured.slug}`, { arch: true, sizes: '(min-width: 960px) 40vw, 92vw' })}
    </div>
    <div class="split__text">
      <p class="eyebrow" data-reveal>${ctx.t('home.featured.eyebrow')}</p>
      <h2 class="h2 feature__title" id="featured-title" data-reveal>${ctx.t(`${fKey}.name`)}</h2>
      <p class="variant" data-reveal>${ctx.t(`${fKey}.variant`)}</p>
      <div class="actions" data-reveal>
        <a class="btn btn--gold" href="${ctx.link(`products/${featured.slug}/`)}">${ctx.t('home.hero.cta')}</a>
      </div>
    </div>
  </div>
</section>

${goodness(ctx, { copy: 'home.goodness' })}

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
          <p>${ctx.t(`home.approach.pillars.${i}.text`)}</p>
        </div>
      </li>
`,
  )}    </ul>
  </div>
</section>

${band(ctx, { secondary: false, text: null })}
`;

  return layout(ctx, {
    title: ctx.raw('meta.home.title'),
    description: ctx.raw('meta.home.description'),
    body,
    bodyClass: 'page-home',
  });
}

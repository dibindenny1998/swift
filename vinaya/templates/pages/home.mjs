import { DROPLET, LEAF, MARK, SEED, VINE, esc, html } from '../lib.mjs';
import { band, layout } from '../layout.mjs';
import { flora, image, words } from '../components.mjs';

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

// "From the source to you": three tall cards. With a journey-* photo the words sit on the picture;
// without one, the card shows the words with a fine line drawing (no borrowed photos, no repeats).
function journey(ctx) {
  const steps = ctx.raw('home.tale.steps');
  const keys = ['nature', 'tradition', 'you'];
  const art = [SEED, LEAF, DROPLET];
  return html`<section class="section journey has-flora" aria-labelledby="journey-title">
  ${flora([
    ['seed', 5, 8, 2.6, -20, 15, 0.35],
    ['droplet', 92, 6, 2.2, 0, 13, 0.4],
  ])}
  <div class="container">
    <header class="section-head center">
      <h2 class="eyebrow eyebrow--center" id="journey-title" data-reveal>${ctx.t('home.tale.eyebrow')}</h2>
    </header>
    <ol class="journey__grid">
${steps.map((_, i) => {
    const slot = `journey-${keys[i]}`;
    const photo = ctx.images[slot]?.exists;
    const heading = `${ctx.t(`home.tale.steps.${i}.word`)} <span class="journey__line">${ctx.t(`home.tale.steps.${i}.line`)}</span>`;
    return html`      <li class="journey__card ${photo ? `journey__card--text${ctx.images[slot].tone === 'dark' ? ' journey__card--dark' : ''}` : 'journey__card--art'}" data-reveal style="--delay:${i * 180}ms">
        ${photo ? image(ctx, slot, { className: 'journey__media', sizes: '(min-width: 768px) 31vw, 92vw' }) : `<span class="journey__art" aria-hidden="true">${art[i]}</span>`}
        <h3 class="journey__word">${heading}</h3>
      </li>
`;
  })}    </ol>
  </div>
</section>`;
}

// Collections: four bright pictures, each with its name and one line over the light upper corner.
function collections(ctx) {
  const items = ctx.raw('home.collections.items');
  return html`<section class="section collections has-flora" aria-labelledby="collections-title">
  ${flora([
    ['leaf', 6, 4, 3, 25, 15, 0.45],
    ['loop', 90, 2, 4.4, 0, 18, 0.35, false],
  ])}
  <div class="container">
    <header class="section-head center">
      <p class="eyebrow eyebrow--center" data-reveal>${ctx.t('home.collections.eyebrow')}</p>
      <h2 class="h2" id="collections-title" data-reveal>${ctx.t('home.collections.title')}</h2>
    </header>
    <ul class="collection-grid">
${items.map(
    (item, i) => html`      <li class="collection" data-reveal style="--delay:${(i % 2) * 160}ms">
        ${image(ctx, `col-${item.key}`, { className: 'collection__media', sizes: '(min-width: 768px) 46vw, 92vw' })}
        <div class="collection__body">
          <h3 class="collection__title"><a class="card__link" href="${ctx.link(item.link)}">${ctx.t(`home.collections.items.${i}.title`)}</a></h3>
          <p class="collection__text">${ctx.t(`home.collections.items.${i}.text`)}</p>
          <span class="collection__rule" aria-hidden="true"></span>
        </div>
      </li>
`,
  )}    </ul>
  </div>
</section>`;
}

export default function home(ctx) {
  const body = html`
<section class="hero hero--brand" aria-labelledby="hero-title">
  <div class="hero__bg">${image(ctx, 'home-hero', { eager: true, decorative: true, sizes: '100vw', mobile: 'home-hero-mobile' })}</div>
  <span class="hero__rays hero__rays--right" aria-hidden="true"></span>
  ${flora([
    ['loop', 70, 18, 6, 0, 20, 0.4, false],
    ['droplet', 88, 26, 2.2, 0, 14, 0.5],
  ], { tone: 'light' })}
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

<section class="section statement has-flora" aria-label="${ctx.tx('home.belief.eyebrow')}">
  ${flora([
    ['leaf', 8, 22, 3, 20, 14, 0.5],
    ['seed', 86, 56, 2.8, -15, 16, 0.45, false],
  ])}
  <div class="container container--narrow center">
    <span class="ornament ornament--vine" data-reveal>${VINE}</span>
    <p class="statement__quote words" data-reveal>${words(ctx.raw('home.belief.quote'))}</p>
  </div>
</section>

${journey(ctx)}

${collections(ctx)}

${band(ctx)}
`;

  return layout(ctx, {
    title: ctx.raw('meta.home.title'),
    description: ctx.raw('meta.home.description'),
    body,
    bodyClass: 'page-home has-cover',
  });
}

import { LEAF, MARK, esc, html } from '../lib.mjs';
import { band, layout } from '../layout.mjs';
import { image, words } from '../components.mjs';

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

// "From the source to you": three tall pictures side by side. Their words are part of the pictures.
function journey(ctx) {
  const steps = ctx.raw('home.tale.steps');
  const slots = ['tale-nature', 'tale-tradition', 'tale-you'];
  return html`<section class="section section--green journey" aria-labelledby="journey-title">
  <div class="container">
    <header class="section-head center">
      <h2 class="eyebrow eyebrow--center" id="journey-title" data-reveal>${ctx.t('home.tale.eyebrow')}</h2>
    </header>
    <ol class="journey__grid">
${steps.map(
    (_, i) => html`      <li class="journey__card" data-reveal style="--delay:${i * 180}ms">
        ${image(ctx, slots[i], { className: 'journey__media', sizes: '(min-width: 768px) 31vw, 92vw' })}
        <h3 class="visually-hidden">${ctx.t(`home.tale.steps.${i}.word`)}: ${ctx.t(`home.tale.steps.${i}.line`)}</h3>
      </li>
`,
  )}    </ol>
  </div>
</section>`;
}

// Collections: four bright pictures, each with its name and one line over the light upper corner.
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

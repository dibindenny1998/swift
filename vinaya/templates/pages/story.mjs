import { VINE, html, roman } from '../lib.mjs';
import { band, layout } from '../layout.mjs';
import { flora, image, words } from '../components.mjs';

// Our Story is told like Home: a full-screen picture, a line that rises word by word, then
// three scenes of one picture and a few words each.

// One scene: a tall picture beside its numeral, heading, short line and text. Scenes alternate sides.
function scene(ctx, key, n, slot) {
  const data = ctx.raw(key);
  return html`<section class="section scene${n % 2 ? '' : ' section--sand'}" aria-labelledby="scene-${n}">
  <div class="container split${n % 2 ? '' : ' split--reverse'}">
    <div class="split__media" data-reveal>
      ${image(ctx, slot, { arch: n === 2, sizes: '(min-width: 960px) 40vw, 92vw' })}
    </div>
    <div class="split__text scene__text">
      <span class="scene__num" aria-hidden="true" data-reveal><span>${roman(n)}</span></span>
      <h2 class="h2 scene__title" id="scene-${n}" data-reveal>${ctx.t(`${key}.label`)}</h2>
      <p class="scene__sub" data-reveal>${ctx.t(`${key}.title`)}</p>
${data.paragraphs.map((_, i) => `      <p class="scene__p" data-reveal style="--delay:${150 + i * 150}ms">${ctx.t(`${key}.paragraphs.${i}`)}</p>\n`)}    </div>
  </div>
</section>`;
}

export default function story(ctx) {
  const slots = ['story-heritage', 'story-change', 'story-reconnect'];

  const body = html`
<section class="hero hero--brand hero--cover" aria-labelledby="hero-title">
  <div class="hero__bg">${image(ctx, 'story-hero', { eager: true, decorative: true, sizes: '100vw', mobile: 'story-hero-mobile' })}</div>
  <span class="hero__rays hero__rays--left" aria-hidden="true"></span>
  ${flora([
    ['jasmine', 62, 14, 2.8, 0, 12, 0.5, false],
    ['curry', 84, 58, 4.4, -15, 15, 0.4, false],
    ['petal', 88, 18, 2.2, 20, 11, 0.45],
  ], { tone: 'light' })}
  <div class="container hero__grid">
    <div class="hero__text">
      <p class="eyebrow hero-in" style="--i:0">${ctx.t('story.eyebrow')}</p>
      <h1 class="hero__title" id="hero-title"><span class="line"><span style="--l:0">${ctx.t('story.title')}</span></span></h1>
    </div>
  </div>
</section>

<section class="section statement has-flora" aria-label="${ctx.tx('story.eyebrow')}">
  ${flora([
    ['curry', 6, 20, 4.4, 10, 15, 0.4],
    ['jasmine', 88, 55, 3, 0, 12, 0.5],
  ])}
  <div class="container container--narrow center">
    <span class="ornament ornament--vine" data-reveal>${VINE}</span>
    <p class="statement__quote words" data-reveal>${words(ctx.raw('story.lead'))}</p>
  </div>
</section>

${slots.map((slot, i) => scene(ctx, `story.chapters.${i}`, i + 1, slot))}

<section class="section section--photo section--green story-value" aria-label="${ctx.tx('story.eyebrow')}">
  <div class="section__bg">${image(ctx, 'story-value', { decorative: true, sizes: '100vw' })}</div>
  <div class="container container--narrow center">
    <span class="rule" aria-hidden="true"></span>
    <blockquote class="quote" data-reveal><p>${ctx.t('story.value')}</p></blockquote>
  </div>
</section>

<section class="section approach has-flora" aria-labelledby="approach-title">
  ${flora([
    ['petal', 6, 6, 2.6, -20, 12, 0.4],
    ['jasmine', 91, 4, 2.6, 0, 11, 0.5],
  ])}
  <div class="container">
    <header class="section-head center">
      <p class="eyebrow eyebrow--center" data-reveal>${ctx.t('story.approachSection.eyebrow')}</p>
      <h2 class="h2" id="approach-title" data-reveal>${ctx.t('story.approachSection.title')}</h2>
    </header>
    <ul class="cards">
${ctx.raw('story.approachSection.pillars').map(
    (p, i) => html`      <li class="tile" data-reveal style="--delay:${i * 180}ms">
        ${image(ctx, `approach-${i + 1}`, { className: 'tile__media', sizes: '(min-width: 768px) 30vw, 92vw' })}
        <div class="tile__body">
          <h3 class="tile__title">${ctx.t(`story.approachSection.pillars.${i}.title`)}</h3>
          ${p.subtitle ? `<p class="tile__sub">${ctx.t(`story.approachSection.pillars.${i}.subtitle`)}</p>` : ''}
          <p>${ctx.t(`story.approachSection.pillars.${i}.text`)}</p>
        </div>
      </li>
`,
  )}    </ul>
  </div>
</section>

<section class="section section--sand story-closing" aria-label="${ctx.tx('site.slogan')}">
  <div class="container center">
    <span class="ornament ornament--vine" data-reveal>${VINE}</span>
    <p class="story-closing__line" data-reveal>${ctx.t('story.closing')}</p>
    <div class="actions actions--center" data-reveal style="--delay:200ms">
      <a class="btn" href="${ctx.link('products/')}">${ctx.t('cta.discover')}</a>
    </div>
  </div>
</section>

${band(ctx)}
`;

  return layout(ctx, {
    title: ctx.raw('meta.story.title'),
    description: ctx.raw('meta.story.description'),
    body,
    bodyClass: 'page-story has-cover',
  });
}

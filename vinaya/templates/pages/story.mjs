import { LEAF, html, roman } from '../lib.mjs';
import { band, layout } from '../layout.mjs';
import { image, words } from '../components.mjs';

// Our Story is told like Home: a full-screen picture, a line that rises word by word, then
// three scenes of one picture and a few words each.

// One scene: a tall picture beside its numeral, label and short text. Scenes alternate sides.
function scene(ctx, key, n, slot) {
  const data = ctx.raw(key);
  return html`<section class="section scene${n % 2 ? '' : ' section--sand'}" aria-labelledby="scene-${n}">
  <div class="container split${n % 2 ? '' : ' split--reverse'}">
    <div class="split__media" data-reveal>
      ${image(ctx, slot, { arch: n === 2, sizes: '(min-width: 960px) 40vw, 92vw' })}
    </div>
    <div class="split__text scene__text">
      <h2 class="scene__label" id="scene-${n}" data-reveal><span class="scene__num" aria-hidden="true">${roman(n)}</span><span class="eyebrow">${ctx.t(`${key}.label`)}</span></h2>
${data.paragraphs.map((_, i) => `      <p class="prose-lg" data-reveal style="--delay:${150 + i * 150}ms">${ctx.t(`${key}.paragraphs.${i}`)}</p>\n`)}${data.quote ? `      <blockquote class="pull" data-reveal style="--delay:300ms"><p>${ctx.t(`${key}.quote`)}</p></blockquote>\n` : ''}    </div>
  </div>
</section>`;
}

export default function story(ctx) {
  const slots = ['story-heritage', 'story-change', 'story-reconnect'];
  const pair = [
    { key: 'story.source', slot: 'story-source' },
    { key: 'story.approach', slot: 'story-approach' },
  ];

  const body = html`
<section class="hero hero--brand hero--cover" aria-labelledby="hero-title">
  <div class="hero__bg">${image(ctx, 'story-hero', { eager: true, decorative: true, sizes: '100vw' })}</div>
  <div class="container hero__grid">
    <div class="hero__text">
      <p class="eyebrow hero-in" style="--i:0">${ctx.t('story.eyebrow')}</p>
      <h1 class="hero__title" id="hero-title"><span class="line"><span style="--l:0">${ctx.t('story.title')}</span></span></h1>
    </div>
  </div>
</section>

<section class="section statement" aria-label="${ctx.tx('story.eyebrow')}">
  <div class="container container--narrow center">
    <span class="ornament" data-reveal>${LEAF}</span>
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

<section class="section" aria-label="${ctx.tx('story.approach.label')}">
  <div class="container">
    <ul class="cards cards--two">
${pair.map(
    ({ key, slot }, i) => html`      <li class="tile" data-reveal style="--delay:${i * 180}ms">
        ${image(ctx, slot, { className: 'tile__media', sizes: '(min-width: 768px) 46vw, 92vw' })}
        <div class="tile__body">
          <h2 class="tile__title">${ctx.t(`${key}.label`)}</h2>
          <p>${ctx.t(`${key}.paragraphs.0`)}</p>
        </div>
      </li>
`,
  )}    </ul>
  </div>
</section>

<section class="section section--sand story-closing" aria-label="${ctx.tx('site.slogan')}">
  <div class="container center">
    <span class="ornament" data-reveal>${LEAF}</span>
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

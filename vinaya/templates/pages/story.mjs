import { html, roman } from '../lib.mjs';
import { band, layout } from '../layout.mjs';
import { image, pageHero } from '../components.mjs';

// One chapter: numeral + label on the left, large serif text on the right, optional pull quote.
function chapter(ctx, key, n) {
  const data = ctx.raw(key);
  return html`<section class="chapter" aria-labelledby="chapter-${n}">
  <div class="container chapter__grid">
    <h2 class="chapter__label" id="chapter-${n}" data-reveal>
      <span class="chapter__num" aria-hidden="true">${roman(n)}</span>
      <span class="eyebrow">${ctx.t(`${key}.label`)}</span>
    </h2>
    <div class="chapter__body">
${data.paragraphs.map((_, i) => `      <p class="prose-lg" data-reveal style="--delay:${150 + i * 150}ms">${ctx.t(`${key}.paragraphs.${i}`)}</p>\n`)}${data.quote ? `      <blockquote class="pull" data-reveal><p>${ctx.t(`${key}.quote`)}</p></blockquote>\n` : ''}    </div>
  </div>
</section>`;
}

export default function story(ctx) {
  const chapters = ctx.raw('story.chapters');
  let n = 0;

  const body = html`
${pageHero(ctx, { eyebrow: ctx.t('story.eyebrow'), title: ctx.t('story.title') })}

<div class="story-image">
  <div class="container hero-in" style="--i:2">
    ${image(ctx, 'story-hero', { eager: true, sizes: '100vw' })}
  </div>
</div>

<section class="section" aria-label="${ctx.tx('story.eyebrow')}">
  <div class="container center">
    <span class="rule" aria-hidden="true"></span>
    <p class="quote story-lead" data-reveal>${ctx.t('story.lead')}</p>
  </div>
</section>

${chapters.slice(0, 2).map((_, i) => chapter(ctx, `story.chapters.${i}`, ++n))}

<div class="section">
  <div class="container story-figures">
    <div data-reveal>${image(ctx, 'story-garden', { sizes: '(min-width: 960px) 32vw, 100vw' })}</div>
    <div data-reveal style="--delay:200ms">${image(ctx, 'story-hands', { sizes: '(min-width: 960px) 48vw, 100vw' })}</div>
  </div>
</div>

${chapters.slice(2).map((_, i) => chapter(ctx, `story.chapters.${i + 2}`, ++n))}

<section class="section section--tone" aria-label="${ctx.tx('story.eyebrow')}">
  <div class="container center">
    <span class="rule" aria-hidden="true"></span>
    <blockquote class="quote story-value" data-reveal><p>${ctx.t('story.value')}</p></blockquote>
  </div>
</section>

${chapter(ctx, 'story.source', ++n)}
${chapter(ctx, 'story.approach', ++n)}

<section class="section" aria-label="${ctx.tx('site.slogan')}">
  <div class="container center">
    <span class="rule" aria-hidden="true"></span>
    <p class="quote" data-reveal>${ctx.t('story.closing')}</p>
    <div class="actions actions--center" data-reveal style="--delay:200ms; margin-top:3rem">
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
    bodyClass: 'page-story',
  });
}

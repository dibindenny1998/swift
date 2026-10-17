import { html, pad } from '../lib.mjs';
import { band, layout } from '../layout.mjs';
import { image, pageHero } from '../components.mjs';

export default function exportPage(ctx) {
  // Trade facts still to come from the client are hidden; the section appears once one is filled.
  const trade = ctx.raw('export.details.items').map((_, i) => i).filter((i) => ctx.filled(`export.details.items.${i}.text`));
  const body = html`
${pageHero(ctx, {
    eyebrow: ctx.t('export.eyebrow'),
    title: ctx.t('export.title'),
    intro: ctx.t('export.intro'),
  })}

<div class="story-image">
  <div class="container hero-in" style="--i:3">
    ${image(ctx, 'export-hero', { eager: true, sizes: '100vw' })}
  </div>
</div>

<section class="section" style="padding-top:0" aria-labelledby="who-title">
  <div class="container">
    <header class="section-head">
      <h2 class="h2" id="who-title" data-reveal>${ctx.t('export.who.title')}</h2>
    </header>
    <ul class="pillars">
${ctx.raw('export.who.items').map(
    (_, i) => html`      <li class="pillar" data-reveal style="--delay:${i * 180}ms">
        <span class="pillar__num" aria-hidden="true">${pad(i + 1)}</span>
        <h3 class="pillar__title">${ctx.t(`export.who.items.${i}.title`)}</h3>
        <p>${ctx.t(`export.who.items.${i}.text`)}</p>
      </li>
`,
  )}    </ul>
  </div>
</section>

${trade.length ? html`<section class="section section--sand" aria-labelledby="trade-title">
  <div class="container">
    <header class="section-head">
      <h2 class="h2" id="trade-title" data-reveal>${ctx.t('export.details.title')}</h2>
      <p class="note" data-reveal>${ctx.t('export.details.note')}</p>
    </header>
    <dl class="trade">
${trade.map(
    (i) => html`      <div data-reveal style="--delay:${(i % 2) * 150}ms">
        <dt>${ctx.t(`export.details.items.${i}.title`)}</dt>
        <dd>${ctx.t(`export.details.items.${i}.text`)}</dd>
      </div>
`,
  )}    </dl>
  </div>
</section>` : ''}

<section class="section" aria-labelledby="begin-title">
  <div class="container">
    <header class="section-head">
      <h2 class="h2" id="begin-title" data-reveal>${ctx.t('export.steps.title')}</h2>
    </header>
    <ol class="steps" data-reveal>
${ctx.raw('export.steps.items').map(
    (_, i) => html`      <li class="step" data-reveal style="--delay:${i * 220}ms">
        <span class="step__num" aria-hidden="true">${pad(i + 1)}</span>
        <h3 class="step__title">${ctx.t(`export.steps.items.${i}.title`)}</h3>
        <p class="step__text">${ctx.t(`export.steps.items.${i}.text`)}</p>
      </li>
`,
  )}    </ol>
  </div>
</section>

${band(ctx, { secondary: false, title: 'export.cta.title', text: 'export.cta.text' })}
`;

  return layout(ctx, {
    title: ctx.raw('meta.export.title'),
    description: ctx.raw('meta.export.description'),
    body,
    bodyClass: 'page-export',
  });
}

import { html } from '../lib.mjs';
import { layout } from '../layout.mjs';

export default function notFound(ctx) {
  const body = html`
<section class="page-hero not-found">
  <div class="container">
    <p class="eyebrow hero-in" style="--i:0">${ctx.t('notFound.eyebrow')}</p>
    <h1 class="page-hero__title hero-in" style="--i:1">${ctx.t('notFound.title')}</h1>
    <p class="lead hero-in" style="--i:2">${ctx.t('notFound.text')}</p>
    <div class="actions hero-in" style="--i:3; margin-top:2.75rem">
      <a class="btn" href="${ctx.link('')}">${ctx.t('notFound.home')}</a>
      <a class="link" href="${ctx.link('contact/')}">${ctx.t('nav.contact')}</a>
    </div>
  </div>
</section>
`;

  return layout(ctx, {
    title: ctx.raw('meta.notFound.title'),
    description: ctx.raw('meta.notFound.description'),
    body,
  });
}

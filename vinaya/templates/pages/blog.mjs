import { esc, html } from '../lib.mjs';
import { band, layout } from '../layout.mjs';
import { pageHero, postCard } from '../components.mjs';

export default function blog(ctx) {
  const posts = ctx.posts;
  const feature = posts.find((p) => p.meta.featured) ?? posts[0];
  const rest = posts.filter((p) => p !== feature);
  const categories = [...new Set(posts.map((p) => p.meta.category))];

  const body = html`
${pageHero(ctx, { eyebrow: ctx.t('blog.eyebrow'), title: ctx.t('blog.title'), intro: ctx.t('blog.intro') })}

<section class="section blog" style="padding-top:0" aria-label="${ctx.tx('blog.eyebrow')}">
  <div class="container">
    <div class="blog-filters hero-in" style="--i:3" role="group" aria-label="Filter articles by category" data-blog-filters>
      <button type="button" class="blog-filter" data-filter="all" aria-pressed="true">${ctx.t('blog.all')}</button>
${categories.map((c) => `      <button type="button" class="blog-filter" data-filter="${esc(c)}" aria-pressed="false">${esc(c)}</button>\n`)}    </div>
    ${postCard(ctx, feature, { feature: true })}
    <div class="post-grid">
${rest.map((p, i) => postCard(ctx, p, { delay: (i % 3) * 150 }))}
    </div>
  </div>
</section>

${band(ctx)}
`;

  return layout(ctx, {
    title: ctx.raw('meta.blog.title'),
    description: ctx.raw('meta.blog.description'),
    body,
    bodyClass: 'page-blog',
  });
}

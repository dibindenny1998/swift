import { esc, html } from '../lib.mjs';
import { band, layout } from '../layout.mjs';
import { formatDate, image, postCard } from '../components.mjs';

export default function post(ctx, p) {
  const m = p.meta;
  const url = encodeURIComponent(ctx.absUrl());
  const text = encodeURIComponent(m.title);
  const related = [
    ...ctx.posts.filter((o) => o !== p && o.meta.category === m.category),
    ...ctx.posts.filter((o) => o !== p && o.meta.category !== m.category),
  ].slice(0, 3);

  const body = html`
<nav class="breadcrumb container" aria-label="${ctx.tx('nav.breadcrumb')}">
  <ol>
    <li><a href="${ctx.link('')}">${ctx.t('nav.home')}</a></li>
    <li><a href="${ctx.link('blog/')}">${ctx.t('nav.blog')}</a></li>
    <li><span aria-current="page">${esc(m.title)}</span></li>
  </ol>
</nav>

<article class="post">
  <header class="post__head container container--narrow">
    <p class="post__meta hero-in" style="--i:0"><span class="chip">${esc(m.category)}</span><span>${formatDate(m.date)} · ${p.minutes} ${ctx.t('blog.minRead')}</span></p>
    <h1 class="post__title hero-in" style="--i:1">${esc(m.title)}</h1>
    <p class="post__excerpt hero-in" style="--i:2">${esc(m.excerpt)}</p>
    <p class="post__by hero-in" style="--i:2">${ctx.t('blog.by')}</p>
  </header>
  <div class="container post__media hero-in" style="--i:3">
    ${image(ctx, `blog/${p.slug}`, { alt: m.alt, eager: true, sizes: '(min-width: 1248px) 1248px, 100vw' })}
  </div>
  <div class="container post__layout">
    <aside class="post__share" aria-label="${ctx.tx('blog.share')}">
      <p class="post__share-title">${ctx.t('blog.share')}</p>
      <a href="https://wa.me/?text=${text}%20${url}" target="_blank" rel="noopener">WhatsApp</a>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=${url}" target="_blank" rel="noopener">LinkedIn</a>
      <a href="https://www.facebook.com/sharer/sharer.php?u=${url}" target="_blank" rel="noopener">Facebook</a>
      <button type="button" data-copy-link data-copied="${ctx.tx('blog.copied')}">${ctx.t('blog.copy')}</button>
    </aside>
    <div class="prose" data-reveal>
${p.html}
    </div>
  </div>
</article>

<section class="section more" aria-labelledby="related-title">
  <div class="container">
    <header class="section-head">
      <h2 class="h2" id="related-title" data-reveal>${ctx.t('blog.related')}</h2>
    </header>
    <div class="post-grid">
${related.map((o, i) => postCard(ctx, o, { headingLevel: 3, delay: i * 150 }))}
    </div>
    <p style="margin-top:3.5rem" data-reveal><a class="link" href="${ctx.link('blog/')}">${ctx.t('blog.back')}</a></p>
  </div>
</section>

${band(ctx)}
`;

  return layout(ctx, {
    title: `${m.title} | Vinaya Blog`,
    description: m.excerpt,
    body,
    bodyClass: 'page-post',
  });
}

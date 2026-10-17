import { MARK, esc, html, rich } from './lib.mjs';

const NAV = [
  { id: 'story', path: 'our-story/' },
  { id: 'products', path: 'products/' },
  { id: 'blog', path: 'blog/' },
  { id: 'export', path: 'export/' },
  { id: 'contact', path: 'contact/' },
];

function head(ctx, { title, description, image }) {
  const { config } = ctx;
  const ogImage = image ?? `${config.siteUrl}/images/share-image.jpg`;
  return html`<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${ctx.page.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${esc(ctx.absUrl())}">`}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Vinaya">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(ctx.absUrl())}">
<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#fbf6ec">
<link rel="icon" href="${ctx.asset('favicon.ico')}" sizes="32x32">
<link rel="icon" href="${ctx.asset('favicon.svg')}" type="image/svg+xml">
<link rel="apple-touch-icon" href="${ctx.asset('apple-touch-icon.png')}">
<link rel="manifest" href="${ctx.asset('site.webmanifest')}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Jost:wght@400;500&display=swap">
<link rel="stylesheet" href="${ctx.asset('assets/css/main.css', true)}">
<script>document.documentElement.classList.replace('no-js','js')</script>
<script src="${ctx.asset('assets/js/main.js', true)}" defer></script>
${ctx.page.schema ? `<script type="application/ld+json">${JSON.stringify(ctx.page.schema)}</script>` : ''}
</head>`;
}


function header(ctx) {
  return html`<a class="skip-link" href="#main">${ctx.t('nav.skip')}</a>
<header class="site-header" data-header>
  <div class="container site-header__inner">
    <a class="brand" href="${ctx.link('')}" aria-label="Vinaya, ${ctx.tx('nav.home')}">${MARK}<span class="wordmark">Vinaya</span></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" data-menu-toggle>
      <span class="menu-toggle__open">${ctx.t('nav.menu')}</span>
      <span class="menu-toggle__close">${ctx.t('nav.close')}</span>
    </button>
    <nav class="site-nav" id="site-nav" aria-label="${ctx.tx('nav.primary')}" data-nav>
      <ul class="site-nav__list">
${NAV.map(
    (item) => `        <li><a class="site-nav__link${item.id === 'contact' ? ' site-nav__link--cta' : ''}" href="${ctx.link(item.path)}"${ctx.page.section === item.id ? ' aria-current="page"' : ''}>${ctx.t(`nav.${item.id}`)}</a></li>\n`,
  )}      </ul>
    </nav>
  </div>
</header>`;
}

export function contactLinks(ctx) {
  const { publicEmail, whatsapp } = ctx.config;
  return {
    email: { href: `mailto:${publicEmail}`, text: rich(publicEmail) },
    whatsapp: { href: `https://wa.me/${whatsapp}`, text: rich(`+${whatsapp}`.replace('+[', '[')) },
  };
}

function footer(ctx) {
  const links = contactLinks(ctx);
  return html`<footer class="site-footer">
  <div class="container">
    <div class="site-footer__grid">
      <div class="site-footer__brand">
        <a class="site-footer__logo" href="${ctx.link('')}"><img src="${ctx.asset('assets/img/logo-full-light.svg')}" alt="Vinaya, A Way of Being. People, Purpose, Progress" width="196" height="183" loading="lazy" decoding="async"></a>
        <p class="site-footer__tagline">${ctx.t('footer.tagline')}</p>
      </div>
      <nav class="site-footer__col" aria-labelledby="footer-explore">
        <h2 class="site-footer__title" id="footer-explore">${ctx.t('footer.explore')}</h2>
        <ul>
          <li><a href="${ctx.link('')}">${ctx.t('nav.home')}</a></li>
${NAV.map((item) => `          <li><a href="${ctx.link(item.path)}">${ctx.t(`nav.${item.id}`)}</a></li>\n`)}        </ul>
      </nav>
      <div class="site-footer__col">
        <h2 class="site-footer__title">${ctx.t('footer.reach')}</h2>
        <ul>
          <li><a href="${esc(links.email.href)}">${links.email.text}</a></li>
          <li><a href="${esc(links.whatsapp.href)}" rel="noopener" target="_blank">${ctx.t('contact.direct.whatsapp')}</a></li>
          <li><a href="${ctx.link('contact/')}">${ctx.t('cta.enquire')}</a></li>
        </ul>
      </div>
    </div>
    <div class="site-footer__bottom">
      <p>&copy; ${new Date().getFullYear()} Vinaya. ${ctx.t('footer.rights')}</p>
      <p>${ctx.t('site.motto')}</p>
    </div>
  </div>
</footer>`;
}

// The export call-to-action band that closes most pages.
export function band(ctx, { secondary = true, title = 'band.title', text = 'band.text' } = {}) {
  return html`<section class="band" aria-labelledby="band-title">
  <div class="container band__inner">
    <p class="eyebrow" data-reveal>${ctx.t('band.eyebrow')}</p>
    <h2 class="band__title" id="band-title" data-reveal>${ctx.t(title)}</h2>
    <p class="band__text" data-reveal>${ctx.t(text)}</p>
    <div class="actions actions--center" data-reveal>
      <a class="btn btn--solid" href="${ctx.link('contact/')}">${ctx.t('band.primary')}</a>
      ${secondary ? `<a class="link" href="${ctx.link('export/')}">${ctx.t('band.secondary')}</a>` : ''}
    </div>
  </div>
</section>`;
}

export function layout(ctx, { title, description, body, bodyClass = '' }) {
  return html`<!doctype html>
<html lang="en" class="no-js">
${head(ctx, { title, description })}
<body class="${bodyClass}">
${header(ctx)}
<main id="main" tabindex="-1">
${body}
</main>
${ctx.page.section === 'contact' || ctx.page.noindex ? '' : `<a class="float-cta" href="${ctx.link('contact/')}" data-float-cta>${ctx.t('cta.enquireShort')}</a>`}
${footer(ctx)}
</body>
</html>
`;
}

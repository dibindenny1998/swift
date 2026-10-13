import { esc, html } from '../lib.mjs';
import { contactLinks, layout } from '../layout.mjs';
import { pageHero } from '../components.mjs';

// One labelled form field with its hint and error slots wired up for screen readers.
function field(ctx, { name, type = 'text', required = false, autocomplete, full = false, hint, control }) {
  const id = `f-${name}`;
  const described = [hint ? `${id}-hint` : null, `${id}-error`].filter(Boolean).join(' ');
  const attrs = `id="${id}" name="${name}"${required ? ' required aria-required="true"' : ''}${autocomplete ? ` autocomplete="${autocomplete}"` : ''} aria-describedby="${described}"`;
  const input =
    control?.(attrs) ??
    (type === 'textarea'
      ? `<textarea ${attrs} rows="6" maxlength="5000"></textarea>`
      : `<input ${attrs} type="${type}" maxlength="200"${type === 'tel' ? ' inputmode="tel"' : ''}>`);

  return html`<div class="field${full ? ' field--full' : ''}">
        <label for="${id}">${ctx.t(`contact.form.${name}`)}${required ? '' : ` <span class="field__opt">${ctx.t('contact.form.optional')}</span>`}</label>
        ${input}
        ${hint ? `<p class="field__hint" id="${id}-hint">${hint}</p>` : ''}
        <p class="field__error" id="${id}-error" hidden></p>
      </div>`;
}

export default function contact(ctx) {
  const links = contactLinks(ctx);
  const messages = {
    required: ctx.raw('contact.errors.required'),
    email: ctx.raw('contact.errors.email'),
    phone: ctx.raw('contact.errors.phone'),
    summary: ctx.raw('contact.errors.summary'),
    server: ctx.raw('contact.errors.server'),
    notConfigured: ctx.raw('contact.errors.notConfigured'),
    sending: ctx.raw('contact.form.sending'),
  };

  // Option values are the product names, so enquiries arrive readable.
  const interest = (attrs) => html`<select ${attrs}>
          <option value="">${ctx.t('contact.form.interestPlaceholder')}</option>
${ctx.products.map(
    (p) =>
      `          <option value="${esc(ctx.raw(`products.items.${p.slug}.name`))}" data-slug="${esc(p.slug)}">${ctx.t(`products.items.${p.slug}.name`)}</option>\n`,
  )}          <option value="All products">${ctx.t('contact.form.interestAll')}</option>
          <option value="Private label">${ctx.t('contact.form.interestPrivateLabel')}</option>
          <option value="Other">${ctx.t('contact.form.interestOther')}</option>
        </select>`;

  const body = html`
${pageHero(ctx, {
    eyebrow: ctx.t('contact.eyebrow'),
    title: ctx.t('contact.title'),
    intro: ctx.t('contact.intro'),
  })}

<section class="contact" aria-label="${ctx.tx('contact.eyebrow')}">
  <div class="container contact__grid">
    <div class="contact__form hero-in" style="--i:3" id="enquiry">
      <div class="notice notice--success" id="enquiry-sent" tabindex="-1" role="status">
        <h2>${ctx.t('contact.success.title')}</h2>
        <p>${ctx.t('contact.success.text')}</p>
        <a class="link" href="${ctx.link('contact/')}" data-enquiry-again>${ctx.t('contact.success.again')}</a>
      </div>

      <div class="notice notice--error" id="enquiry-error" tabindex="-1" role="alert">
        <p><span data-error-text>${ctx.t('contact.errors.server')}</span> <a href="${esc(links.email.href)}">${links.email.text}</a></p>
      </div>

      <form action="${ctx.asset('contact.php')}" method="post" novalidate data-enquiry-form data-messages="${esc(JSON.stringify(messages))}">
        <h2 class="visually-hidden">${ctx.t('contact.formTitle')}</h2>
        <div class="form__hp" aria-hidden="true">
          <label for="f-website">Website</label>
          <input id="f-website" name="website" type="text" tabindex="-1" autocomplete="off">
        </div>

        <div class="form__grid">
      ${field(ctx, { name: 'name', required: true, autocomplete: 'name' })}
      ${field(ctx, { name: 'company', required: true, autocomplete: 'organization' })}
      ${field(ctx, { name: 'country', required: true, autocomplete: 'country-name' })}
      ${field(ctx, { name: 'email', type: 'email', required: true, autocomplete: 'email' })}
      ${field(ctx, { name: 'phone', type: 'tel', autocomplete: 'tel', hint: ctx.t('contact.form.phoneHint') })}
      ${field(ctx, { name: 'interest', control: interest })}
      ${field(ctx, { name: 'quantity', full: true, hint: ctx.t('contact.form.quantityHint') })}
      ${field(ctx, { name: 'message', type: 'textarea', required: true, full: true })}
        </div>

        <p class="form__summary" role="alert" data-form-summary hidden></p>

        <div class="form__footer">
          <button class="btn btn--solid" type="submit">${ctx.t('contact.form.submit')}</button>
          <p class="form__privacy">${ctx.t('contact.form.privacy')}</p>
        </div>
      </form>
    </div>

    <aside class="direct hero-in" style="--i:4" aria-labelledby="direct-title">
      <h2 id="direct-title">${ctx.t('contact.direct.title')}</h2>
      <dl>
        <div>
          <dt>${ctx.t('contact.direct.email')}</dt>
          <dd><a href="${esc(links.email.href)}">${links.email.text}</a></dd>
        </div>
        <div>
          <dt>${ctx.t('contact.direct.whatsapp')}</dt>
          <dd><a href="${esc(links.whatsapp.href)}" target="_blank" rel="noopener">${ctx.t('contact.direct.whatsappText')}</a><br><span class="small">${links.whatsapp.text}</span></dd>
        </div>
        <div>
          <dt>${ctx.t('contact.direct.location')}</dt>
          <dd>${ctx.t('contact.direct.locationText')}</dd>
        </div>
      </dl>
    </aside>
  </div>
</section>
`;

  return layout(ctx, {
    title: ctx.raw('meta.contact.title'),
    description: ctx.raw('meta.contact.description'),
    body,
    bodyClass: 'page-contact',
  });
}

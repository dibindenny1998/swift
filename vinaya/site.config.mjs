// Site-wide settings. Edit these, then run `node build.mjs`.
// Anything still in [BRACKETS] is a placeholder and the build will remind you about it.

export default {
  // Final address of the website, without a trailing slash. Used for canonical URLs,
  // Open Graph tags and the sitemap.
  siteUrl: 'https://[YOUR-DOMAIN]',

  // Where enquiry-form messages are delivered.
  contactEmail: '[EMAIL]',

  // A mailbox on your own domain (create it in hPanel → Emails). Hostinger only delivers
  // form mail reliably when it is sent "from" an address on the site's domain.
  // Leave as is to send from contactEmail instead.
  fromEmail: '[NOREPLY@YOUR-DOMAIN]',

  // Public email shown on the site (often the same as contactEmail).
  publicEmail: '[EMAIL]',

  // WhatsApp number in international format, digits only (e.g. 919876543210).
  whatsapp: '[WHATSAPP-NUMBER]',

  // Languages. The first one is served at the site root, the others under /<code>/.
  languages: ['en', 'fr'],
};

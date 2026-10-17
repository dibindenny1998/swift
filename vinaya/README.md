# Vinaya website

Showcase website for **Vinaya**, natural personal care from India.
*The Best of Nature, for the Best of You.*

This is a static site (HTML, CSS and a small script) plus one PHP file for the enquiry form.
It runs on any Hostinger web hosting plan: no Node.js app, database or build step on the server.

> This folder is independent of the rest of the repository (the swift.in shop). It shares no code or settings with it.

## Folder structure

```
vinaya/
├── build.mjs              ← turns content + templates into the finished site (node build.mjs)
├── site.config.mjs        ← domain, form email, WhatsApp number, languages
├── content/
│   ├── en.json            ← ALL the copy (every word on the site)
│   ├── products.mjs       ← product list (add products here)
│   └── images.mjs         ← image slots and their crop ratios
├── templates/
│   ├── layout.mjs         ← <head> / SEO tags, header, footer, export band
│   ├── components.mjs     ← image / placeholder, product card, page header
│   ├── lib.mjs            ← small helpers
│   └── pages/             ← home, story, products, product, export, contact, 404
├── static/                ← copied as-is into the site
│   ├── assets/css/main.css   ← all styles; colours and fonts are tokens at the top
│   ├── assets/js/main.js     ← menu, slow reveal animations, form validation
│   ├── assets/img/           ← put photos here (see below)
│   ├── contact.php           ← enquiry form handler (sends the email)
│   ├── .htaccess             ← clean URLs, 404 page, caching, compression
│   └── favicon.svg, *.png, favicon.ico, site.webmanifest
└── public_html/           ← THE FINISHED WEBSITE. Upload the contents of this folder.
```

Pages:

| Page | URL |
|---|---|
| Home | `/` |
| Our Story | `/our-story/` |
| Products | `/products/` |
| Product detail | `/products/hair-oil/`, `/products/gift-set/` |
| Export / Partner With Us | `/export/` |
| Contact | `/contact/` |

## Editing

1. Change text in `content/en.json`, settings in `site.config.mjs`.
2. Run `node build.mjs` (Node 18 or newer, no `npm install` needed).
3. Upload `public_html/` again.

The build prints a **"To do before launch"** list: placeholder settings and missing photos.

Unknown facts are written as `[PLACEHOLDER]` or `[PLACEHOLDER: what is needed]` in the content
files. They show on the site as small highlighted tags so nothing invented goes live. Replace
them with real values when you have them.

### Adding a product

1. Add an entry to `content/products.mjs` (slug, category, which detail rows to show).
2. Add its copy under `products.items.<slug>` in `en.json`. Copy an existing product
   as a template. New categories go under `products.categories`.
3. Add an image slot `'products/<slug>': { file: 'product-<slug>.jpg', width: 1200, height: 1500, page: '…' }`
   to `content/images.mjs`, plus its alt text under `images` in `en.json`.
4. Add the photo as `static/images/product-<slug>.jpg` (1200 × 1500), then build.

The product grid, product page, sitemap, footer and the contact form's "Product interest" list
update automatically.

### Changing images

Every photo and illustration is one file in `static/images/` (on the server:
`public_html/images/`), with a fixed name such as `home-hero.jpg` or `product-hair-oil.jpg`.

- **On the live site, no rebuild needed:** in Hostinger File Manager open `public_html/images/`,
  upload a new picture with exactly the same file name and overwrite the old one.
- **Any size works:** the site crops each picture to its frame automatically, keeping the
  centre (or the slot's `focus` point) in view.
- **Recommended sizes:** listed in `content/images.mjs`, in `public_html/images/README.txt`, and
  on the image guide page **`/images/guide.html`**. The guide shows every image, where it appears,
  and checks each uploaded file: good / different shape (auto-cropped) / too small / file too heavy.
- Keep each file under ~400 KB (JPG, quality about 80) so pages stay fast.
- Copy the replaced file into `static/images/` here too, or the next build will put the old one back.

Alt text (the description for screen readers and Google) is in `en.json` under `images`.

### Logo and favicon

The leaf "V" mark in the header, footer and favicon is recreated from the product label
(`MARK` in `templates/lib.mjs`, plus `static/favicon.svg` and the PNG icons). Replace it with
the original logo file when available. The share image for social media is `static/assets/img/og-image.jpg`
(1200 × 630).

### Colours and fonts

All colours, fonts, sizes and spacing are CSS variables at the top of
`static/assets/css/main.css`. The palette comes from the product photos: leaf green, sunlit
sand, the gold of the cap and the peach dot of the logo. Gradients are single-colour,
tone-on-tone only.
Fonts: Cormorant Garamond (headings) and Jost (text), from Google Fonts.

## Uploading to Hostinger

1. In `site.config.mjs` set `siteUrl` (your domain), `contactEmail`, `fromEmail`, `publicEmail`
   and `whatsapp`, then run `node build.mjs`.
2. **hPanel → Emails**: create the mailbox you put in `fromEmail` (for example
   `noreply@yourdomain.com`). Form mail is only delivered reliably when it is sent from an address
   on your own domain.
3. **hPanel → Websites → your site → File Manager** → open `public_html`. Delete the default
   `default.php` / `index.php` if present.
4. Upload **the contents** of the `public_html/` folder (not the folder itself). The easiest way is
   to zip the contents, upload the zip and use **Extract**. Make sure the hidden `.htaccess` file
   is included.
5. **hPanel → Security → SSL**: install the free SSL certificate and turn on **Force HTTPS**.
6. Test: open the site and send a test enquiry from `/contact/`.
7. Submit `https://yourdomain.com/sitemap.xml` in Google Search Console.

### How the enquiry form works

- With JavaScript: fields are validated in the browser, the form posts to `contact.php` in the
  background, and a "Thank you" message replaces the form.
- Without JavaScript: the form posts normally and the visitor is sent back to the contact page with
  the same success or error message.
- `contact.php` validates again on the server, blocks spam with a hidden honeypot field, limits
  each visitor to one message every 30 seconds, and sends a plain-text email to `contactEmail`.
  Its Reply-To is the visitor's address, so you can answer directly.
- Until `contactEmail` is set, the form shows "The form is not active yet. Please email us directly."

## Previewing locally

```bash
node build.mjs
cd public_html && php -S localhost:8000     # then open http://localhost:8000
```

(Any static server works for browsing; PHP is only needed to try the form.)

# swift.in — Christmas Shop: Build Spec for Claude Code

> **How to use this file:** Put this file, `mascot.png` and `home-design-reference.html` in the root of an empty project folder, then tell Claude Code:
> *"Read SWIFT_BUILD_SPEC.md and build swift.in phase by phase. Stop after each phase, show me what's done, and wait for my OK before the next phase."*

---

## 0. Context

- **Business:** swift.in — a premium Christmas e-commerce shop in India (owner based in Bangalore).
- **Catalogue:** starts with ~10 products plus bundles. Products are **not finalised yet**, so everything (products, prices, bundles, offers) must be editable from the admin panel. Seed the database with sample products using placeholder prices.
- **Timeline:** live by **10 Nov 2026**. Last order for Christmas delivery: **18 Dec 2026**. Countdown target: **24 Dec 2026, 00:00 IST**.
- **Audience:** mostly mobile shoppers. **Design and build mobile-first (390px wide)**, then scale up to tablet and desktop.
- **Currency/locale:** INR (₹), Indian number formatting (₹1,24,999), IST timezone, Indian pincodes.

---

## 1. Tech stack (defaults — keep unless there is a strong reason)

| Layer | Choice |
|---|---|
| Framework | **Next.js (latest stable, App Router, TypeScript)** — one app for storefront, `/admin`, and API routes |
| Styling | **Tailwind CSS** with the design tokens in §3 defined in the Tailwind config + CSS variables |
| Animation | CSS keyframes for ambient effects; **Framer Motion** for scroll reveals and drawers |
| Database | **PostgreSQL** + **Prisma** ORM |
| Auth (customers) | **Phone OTP** via MSG91 (no passwords). Sessions in httpOnly cookies |
| Auth (admin) | Email + password (hashed with bcrypt/argon2) + role `ADMIN`; all `/admin` and `/api/admin/*` routes protected |
| Payments | **Razorpay** (UPI, cards, netbanking) + **Cash on Delivery** |
| Shipping | **Shiprocket** API (create shipment, AWB, tracking) |
| Images | **Cloudinary** (upload from admin, auto-format, responsive sizes) |
| Email | **Resend** or **Brevo** (order confirmation, shipped, delivered) |
| Validation | **Zod** on every API input |
| Hosting | Vercel (app) + Supabase/Neon (Postgres), **or** a Hostinger VPS running Node + Postgres. Do **not** use Hostinger shared hosting (no Node). |

---

## 2. Reference files in this folder

- `home-design-reference.html` — the approved **mobile home page design** (built in a design-canvas format, so it uses a small templating runtime — read it for layout, colours, copy, SVG artwork and keyframes; do not ship it as-is). Re-implement it as React components faithfully.
- `mascot.png` — the brand **snowman mascot** (transparent background, 328×440). Used in the footer, empty states, order success and 404.

---

## 3. Design system

### 3.1 Colour rules (important)
- **Gradients only within one colour family.** Red → darker red, green → darker green, gold → darker gold. **Never mix red and green in one gradient.**
- **Gold is an accent, ~5% of the screen:** logo, primary buttons, thin frame lines, star dividers, the seconds digit. Not every badge.
- Red appears as the **hero/header** colour and as small **sale accents** (e.g. "Save 15%", "4 left").
- Shopping sections are **calm ivory**. Feature sections (gift box) and footer are **royal green**.

### 3.2 Tokens

```
/* Royal red */
--red-50:  #EC3F51;  --red-100: #DA2E40;  --red-200: #C21F31;
--red-300: #9C1626;  --red-400: #740E1C;  --red-500: #4E0812;
--red-sale: #A3192B;

/* Royal green */
--green-50:  #19A26A; --green-100: #13895A; --green-200: #0F7A4E;
--green-300: #0B5E3E; --green-400: #0A5537; --green-500: #073D29;
--green-600: #05301F; --green-700: #04261A;
--green-heading: #0A3D29;

/* Gold */
--gold-light: #F3DC98; --gold-btn-top: #F0D88E; --gold: #E9C76A;
--gold-line: #D9B45A;  --gold-btn-bottom: #CFA13E; --gold-deep: #C4952E;
--gold-dark: #A97E20;  --gold-text-on-ivory: #8A6A1E;

/* Neutrals */
--ivory: #FBF7EE; --card: #FFFFFF; --border: #ECE3CF; --divider: #E6DCC4;
--text: #1F1B14;  --muted: #6B6352; --on-dark-muted: #CFE3D8 (on green) / #F8DADD (on red);
```

Key gradients:
- **Header:** `linear-gradient(180deg, #EC3F51, #DA2E40)`
- **Hero:** `linear-gradient(180deg, #DA2E40 0%, #C21F31 22%, #9C1626 50%, #740E1C 76%, #4E0812 100%)`
- **Announcement bar:** `linear-gradient(90deg, #8E1422, #B71C2C, #8E1422)`
- **Gift box section:** `linear-gradient(180deg, #19A26A 0%, #0F7A4E 35%, #0A5537 70%, #05301F 100%)`
- **Footer:** `linear-gradient(180deg, #13895A 0%, #0B5E3E 45%, #04261A 100%)`
- **Gold button:** `linear-gradient(180deg, #F0D88E, #CFA13E)` + `inset 0 1px 0 rgba(255,255,255,.5)`, text `#2E2208`

### 3.3 Typography
- **Display:** Playfair Display — weights 500/600, *italic* for emphasis words (e.g. "wrapped in *gold*").
- **Body/UI:** Manrope — 400/500/600/700.
- Section eyebrows: 12px, 600, letter-spacing 0.2em, uppercase, gold (`--gold-line` on dark, `--gold-text-on-ivory` on ivory).
- H1 44px / H2 30–34px / card titles 22px / body 15–16px / **minimum text size 12px anywhere.**

### 3.4 Shape & spacing
- Radii: **12px** (small tiles, product images), **24px** (cards, framed sections), **999px** (buttons, pills). Nothing else.
- Touch targets ≥ 44×44px. Section padding 48–56px vertical on mobile, 16–24px horizontal.
- Thin gold frame inset 12px inside hero and gift box sections: `1px solid rgba(217,180,90,.4)`, radius 24px.

### 3.5 Accessibility
- Real `<button>`, `<a>`, `<label>`/`<input>`. Icon buttons get `aria-label`. Decorative SVGs `aria-hidden`.
- Text contrast ≥ 4.5:1.
- **Respect `prefers-reduced-motion`: disable all ambient animation** (snow, Santa, mascot, shimmer, bokeh).

---

## 4. Ambient effects & animation (match the reference)

Build each as its own component with an on/off toggle controlled from **Admin → Site settings**.

1. **Snow (whole page):** ~26 small six-armed snow-crystal SVGs (white, with a faint green drop-shadow so they show on ivory), random x, falling the full page height over 48–84s each, gentle horizontal sway, slow spin. Pointer-events none. Use a fixed overlay on the viewport (not page height) in production for performance. Pause when the tab is hidden.
2. **Hero gold garland:** an SVG swag across the top of the hero with 6 twinkling gold beads, a gold bow in the centre, and **two** hanging ornaments (one gold, one emerald) swaying gently (7s).
3. **Floating gold light (bokeh):** 3 blurred gold dots drifting slowly in the hero.
4. **Shimmering "gold":** the word *gold* in the H1 has a gold-only gradient text sweep (4.5s loop).
5. **Santa landing (hero):** on page load, a soft-shaded Santa (red coat, white fur trim, fluffy beard) in an emerald-and-gold sleigh with a brown reindeer (glowing red nose, galloping legs) flies in from the top-left along an arc and **lands on top of the H1**, with a small bounce and a snow puff. Then he stays, bobbing gently and waving. **Plays once per page load** (the reference loops it for preview only). Timeline ≈ 7s. Exact SVG artwork and keyframes are in the reference file (`.land`, `@keyframes land`, `puff`).
6. **Countdown:** live to 24 Dec 00:00 IST — days / hours / mins / secs, Playfair digits, thin gold dividers, seconds digit in gold. Server and client must agree (compute from IST).
7. **Gift box (gift section):** red box with gold ribbon; lid bounces open every ~4s and three gold stars burst out.
8. **Snowman mascot (footer, bottom-right):** `mascot.png` on a snow mound, 14s loop:
   - hops up twice to bounce a falling snowflake off his head,
   - sways side-to-side while a speech bubble says **"Hi! Merry Christmas"**,
   - crouches, jumps, falls backwards into the snow and wiggles (making a snow angel), then pops back up — a snow-angel imprint with two gold sparkles fades in where he lay,
   - proud little hop.
9. **Scroll reveals:** sections and product cards fade-and-rise in once as they enter the viewport (Framer Motion, 16px, 0.6s, stagger 60ms). Subtle — no bouncing.
10. **Press feedback:** buttons and cards scale to 0.98 on press.

**Rules:** nothing pulses, blinks or spins for attention. Motion should feel calm and expensive. Keep the main thread free: CSS transforms/opacity only.

---

## 5. Storefront pages (mobile-first; reuse the design system everywhere)

### 5.1 Home (match the reference exactly)
Sections in order:
1. **Announcement bar** — "Complimentary gold gift wrap ✦ Free shipping over ₹999" (text editable in admin).
2. **Header** — menu button, centred gold **swift.in** logo (Playfair, ".in" in ivory italic), cart icon with gold count badge. Sticky on scroll (compact on scroll down).
3. **Hero (red velvet)** — garland + ornaments, eyebrow "CHRISTMAS 2026", Santa landing on H1 "Christmas, / wrapped in *gold*", subtext, gold-framed **arch photo** (290×360, radius 145/145/24/24), countdown, gold CTA "Shop the collection", text link "Build a gift box →".
4. **Shop by category** (ivory) — 2×2 photo tiles: Trees, Lights, Ornaments, Gifts.
5. **Signature kits** (ivory) — horizontal snap carousel of bundle cards (photo, "Save X%" pill, title, one-line contents, price + MRP strike, green "Add" button).
6. **Bestsellers** (ivory) — 2-column product grid (photo, small badge e.g. "4 left"/"New", name, price), hanging ornaments over the heading, "View all products" outline button.
7. **Build your own gift box** (royal green) — animated gift box, copy, 3 slots (2 filled, 1 "+"), progress hint "Add one more to unlock X% off", gold CTA.
8. **Review + promises** (ivory) — 5 gold stars, one real review quote, then 3 promise rows (delivery before Christmas, gold gift wrap, UPI/cards/COD + 7-day returns).
9. **Footer** (royal green) — "Last order for Christmas delivery is *December 18*", WhatsApp/email early-bird signup, links, mascot scene, logo, ©.
10. **Sticky bottom cart bar** — appears once cart has items: "2 items in your cart · ₹total" + green "View cart" button.

### 5.2 Other storefront pages (same design language — restyle, don't invent a new look)
- **Shop / category listing** — filter chips (All, Decor, Lights, Gifts), sort (Popular, Price ↑↓, New), product grid, infinite scroll or pagination.
- **Product page** — swipeable image gallery, name, rating, price + MRP + % off, real stock indicator ("Only 4 left" only when stock ≤ admin threshold), variants (e.g. height 4/5/6 ft), quantity, **pincode delivery check** (Shiprocket serviceability + ETA), "Complete the look" bundle upsell, details & size guide accordion, reviews with photos, sticky "Add to cart" bar.
- **Bundles page** — all kits.
- **Build-your-own box** — pick N items from eligible products, live price with tiered discount (rules from admin), gift message.
- **Cart drawer + cart page** — line items with qty steppers, free-shipping progress bar, gift wrap toggle + gift message, coupon field, summary (subtotal, discount, shipping, total).
- **Checkout** — phone OTP login (if guest), address (with saved addresses), delivery estimate, payment: UPI / Card (Razorpay) / COD (with small COD fee, configurable), place order.
- **Order success** — mascot + gentle gold confetti, order number, ETA, "Share on WhatsApp".
- **Login** — phone number → 6-digit OTP. Rate-limited.
- **My account** — order list, order detail with **tracking timeline** (placed → packed → shipped (AWB, courier) → out for delivery → delivered), saved addresses, wishlist, returns request, WhatsApp support link, logout.
- **Static pages** — About, Contact, FAQ, Shipping policy, Refund/Return policy, Privacy policy, Terms. (Razorpay requires these before approval.)
- **404 + empty cart** — mascot illustration with friendly copy.

---

## 6. Admin panel (`/admin`, desktop-first but usable on mobile)

Layout: dark green sidebar (Dashboard, Products, Bundles & offers, Orders, Customers, Reviews, Site settings), content on ivory.

- **Dashboard** — today's orders, revenue this week, low-stock count, top products, recent orders.
- **Products** — list (search, filter by category/status), **unlimited products**: add/edit with title, slug, description, category, images (Cloudinary upload, reorder), variants (name, SKU, price, MRP, stock), badge (None/New/Bestseller), live toggle, SEO title/description. CSV import.
- **Bundles & offers**
  - **Fixed kit**: name, products (+ variant + qty), discount type (% off / flat ₹ off / fixed price), live preview "Customer pays ₹X instead of ₹Y".
  - **Build-your-own rules**: eligible products, tiers (e.g. 3 items → 10%, 5 items → 15%).
  - **Coupons**: code, type (% / flat), value, min order, first-order-only, product/bundle scope, usage limit, per-user limit, start/end dates, status (active/scheduled/expired).
- **Orders** — list with filters (status, payment, date), detail view, change status, print GST invoice (PDF), "Create shipment" → Shiprocket (AWB + label), cancel/refund (Razorpay refund API).
- **Customers** — list, order history, total spend.
- **Reviews** — approve/hide, reply.
- **Site settings** — announcement text, countdown end date, last order date, low-stock threshold, free-shipping threshold, COD on/off + fee, gift-wrap price, toggles for snow / Santa / mascot, social links, WhatsApp number.

All admin changes go live without redeploy.

---

## 7. Data model (Prisma — adjust names as needed)

```
User        id, phone (unique), name, email?, role (CUSTOMER|ADMIN), passwordHash? (admin only), createdAt
Address     id, userId, name, phone, line1, line2, city, state, pincode, isDefault
Category    id, name, slug, sortOrder
Product     id, title, slug, description, categoryId, badge, isLive, seoTitle, seoDescription, createdAt
ProductImage id, productId, url, alt, sortOrder
Variant     id, productId, name, sku, price, mrp, stock, weightGrams
Bundle      id, title, slug, description, type (FIXED|BUILD_YOUR_OWN), discountType (PERCENT|FLAT|FIXED_PRICE), discountValue, isLive, imageUrl
BundleItem  id, bundleId, variantId, qty
BYOTier     id, bundleId, minItems, percentOff
Cart        id, userId?, sessionId?, updatedAt
CartItem    id, cartId, variantId?, bundleId?, qty, byoSelection (JSON)?
Wishlist    id, userId, productId
Coupon      id, code (unique), type, value, minOrder, firstOrderOnly, scope (JSON), usageLimit, perUserLimit, startsAt, endsAt, isActive
CouponUse   id, couponId, userId, orderId
Order       id, number (e.g. SW1042), userId, addressSnapshot (JSON), status (PENDING|PAID|PACKED|SHIPPED|OUT_FOR_DELIVERY|DELIVERED|CANCELLED|RETURNED),
            paymentMethod (RAZORPAY|COD), subtotal, discount, shipping, codFee, giftWrap, total, couponId?, giftMessage?, createdAt
OrderItem   id, orderId, variantId?, bundleId?, titleSnapshot, priceSnapshot, qty
Payment     id, orderId, razorpayOrderId, razorpayPaymentId, status, amount, raw (JSON)
Shipment    id, orderId, shiprocketOrderId, awb, courier, status, trackingUrl, events (JSON)
Review      id, productId, userId, rating, text, photos (JSON), isApproved, createdAt
Setting     key (unique), value (JSON)
OtpRequest  id, phone, codeHash, expiresAt, attempts
```

Money stored as **integer paise**. All prices, discounts and totals are **calculated on the server** — never trust the client.

---

## 8. API (route handlers)

- **Public:** `GET /api/products`, `GET /api/products/[slug]`, `GET /api/bundles`, `GET /api/categories`, `GET /api/settings/public`, `POST /api/pincode-check`.
- **Auth:** `POST /api/auth/otp/send` (rate-limit: 3 per 10 min per phone + per IP), `POST /api/auth/otp/verify`, `POST /api/auth/logout`.
- **Cart:** `GET/POST/PATCH/DELETE /api/cart` (guest cart by cookie; **merge into user cart on login**), `POST /api/cart/coupon`.
- **Checkout:** `POST /api/checkout` (validate stock + prices → create Order + Razorpay order or COD order), `POST /api/webhooks/razorpay` (**verify signature**; mark paid; decrement stock in a DB transaction; send confirmation).
- **Account:** `GET /api/orders`, `GET /api/orders/[id]`, addresses CRUD, wishlist CRUD, `POST /api/reviews`.
- **Shipping:** `POST /api/webhooks/shiprocket` (tracking updates → Shipment.events + Order.status).
- **Admin (role-protected):** CRUD for products, variants, images, bundles, BYO tiers, coupons, orders (status, shipment, refund), customers, reviews, settings; `POST /api/admin/upload` (Cloudinary signed upload).

---

## 9. Business rules

- **FOMO must be real** (India's 2023 dark-patterns guidelines ban false urgency):
  - "Only X left" shown only when real stock ≤ low-stock threshold.
  - Countdown counts to a real date; "sale ends" timers only for real coupon/offer end dates.
  - "Sold this week" (if shown) comes from real orders. **No fake "X people viewing" popups.**
- Free shipping above the admin threshold (default ₹999).
- COD: optional fee (default ₹49), can be disabled; COD orders start as `PENDING` and are confirmed by admin or WhatsApp.
- Stock is reserved only when payment succeeds (Razorpay) or the COD order is placed; release on cancel.
- After 18 Dec, show a banner "Christmas delivery cut-off has passed — order now for New Year".
- GST: show prices inclusive of GST; invoice shows GST breakdown (GSTIN from settings).
- Order numbers: `SW` + incrementing number starting at 1001.

---

## 10. Notifications

- Email + (phase 2) WhatsApp: order placed, payment received, shipped (with tracking link), out for delivery, delivered.
- Abandoned cart reminder (phase 2): 2 hours after last cart update, for logged-in users with items.
- Admin email on every new order.

---

## 11. SEO, analytics, performance

- Metadata per page, Open Graph images, product JSON-LD (`Product`, `Offer`, `AggregateRating`), sitemap.xml, robots.txt, canonical URLs.
- Meta Pixel + GA4 with standard e-commerce events (view_item, add_to_cart, begin_checkout, purchase). Load after consent banner where required.
- Lighthouse mobile target: Performance ≥ 85, Accessibility ≥ 95. Use `next/image`, preload Playfair/Manrope via `next/font`, lazy-load below-the-fold SVG effects.

---

## 12. Environment variables (`.env.example`)

```
DATABASE_URL=
NEXT_PUBLIC_SITE_URL=https://swift.in
SESSION_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
SHIPROCKET_EMAIL=
SHIPROCKET_PASSWORD=
MSG91_AUTH_KEY=
MSG91_TEMPLATE_ID=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
ADMIN_SEED_EMAIL=
ADMIN_SEED_PASSWORD=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_GA4_ID=
```

Never commit real keys. Use Razorpay/Shiprocket **test mode** until launch.

---

## 13. Build phases (stop after each one for review)

1. **Setup & design system** — Next.js + Tailwind + Prisma + Postgres; tokens, fonts, base components (Button, Pill, Card, Section, Eyebrow, PriceTag, Badge, Drawer, Input). Seed script with admin user, 4 categories, 10 sample products (placeholder prices) and 2 bundles. ✅ *Check: a `/styleguide` page shows every component.*
2. **Home page** — pixel-faithful to `home-design-reference.html` on a 390px viewport, including all effects in §4 with admin toggles stubbed. ✅ *Check: side-by-side with the reference on mobile; reduced-motion works.*
3. **Catalogue** — shop listing, product page, bundles page, build-your-own box, wishlist (local until login).
4. **Cart & auth** — cart drawer/page, guest cart, OTP login, cart merge, coupons.
5. **Checkout & payments** — address, Razorpay (test mode) + COD, webhook, order success, stock handling, confirmation email.
6. **Account** — orders, tracking timeline, addresses, returns request.
7. **Admin** — dashboard, products, bundles & offers, coupons, orders (+ Shiprocket shipment, invoice PDF, refunds), customers, reviews, site settings.
8. **Polish & launch** — static/policy pages, SEO, analytics, 404/empty states with mascot, Lighthouse pass, desktop layouts, deploy, connect domain swift.in, switch payment/shipping to live keys.

At the end of every phase: run type-check, lint and tests; list what's done, what's stubbed, and anything that needs the owner's input (keys, policy text, GSTIN, product photos).

---

## 14. Things the owner still has to provide

- Final 10 products: names, photos (ideally shot on red/green velvet in warm light), prices, stock.
- Razorpay, Shiprocket, MSG91, Cloudinary, email-provider accounts and keys.
- GSTIN (if registered), business address, return policy details.
- Confirmation of rights to use `mascot.png` commercially.

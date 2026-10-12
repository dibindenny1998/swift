# swift.in

Premium Christmas shop for India. Next.js 16 (App Router) + Tailwind v4 + Prisma/Postgres.
The full product spec is in [`SWIFT_BUILD_SPEC.md`](./SWIFT_BUILD_SPEC.md); design references live in `docs/reference/`.
**Going live?** Follow [`docs/LAUNCH.md`](./docs/LAUNCH.md). Uploading a zip to Hostinger? See [`HOSTINGER_UPLOAD.md`](./HOSTINGER_UPLOAD.md).

## Local setup

```bash
cp .env.example .env              # fill in DATABASE_URL, ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD
npm install
npm run db:migrate                # creates tables (order numbers start at SW1001)
npm run db:seed                   # admin user, 4 categories, 10 sample products, 2 bundles, default settings
npm run dev
```

Open http://localhost:3000/styleguide to see every design token and base component.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests (`tests/`) |
| `npm run db:migrate` / `db:seed` | Prisma migrate / seed (seed is safe to re-run) |

## Conventions

- Money is **integer paise** everywhere; format with `formatINR` from `src/lib/money.ts`.
- Dates that matter to customers (countdown, cut-off) are IST; use `src/lib/ist.ts`.
- Design tokens are Tailwind utilities defined in `src/app/globals.css` (`bg-red-200`, `text-gold-ink`, `bg-grad-hero`, …).
- Base components: `src/components/ui` (Button, Pill, Badge, Card, Section, Eyebrow/Heading, PriceTag, Drawer, Input, Mascot).
- Site settings are stored in the `Setting` table (`src/lib/settings.ts`) so admin edits go live without a redeploy.

## Mascot

`src/components/mascot/Mascot.tsx` is a rigged snowman built from layers in `public/mascot/`
(body + left/right arms that pivot at the shoulders, plus SVG eyelids for blinking). `scene` plays the
14s footer routine; otherwise he idles. Tapping him waves hello. To swap the artwork, regenerate the layers:

```bash
pip install numpy scipy pillow
python3 scripts/mascot/cutout.py docs/reference/mascot-source.png public/mascot.png
python3 scripts/mascot/split.py public/mascot.png public/mascot /tmp
```

Arm pivots and eye positions are hard-coded for this artwork (see `mascot.css` / `Mascot.tsx`).

## Deploying to a Hostinger VPS

Shared/“Premium” hosting can't run Node — use a Hostinger **VPS** (Ubuntu 22.04/24.04).

1. On the fresh VPS, as root:
   ```bash
   curl -fsSLO https://raw.githubusercontent.com/dibindenny1998/swift/<branch>/deploy/setup-vps.sh
   DOMAIN=srvXXXXXX.hstgr.cloud EMAIL=you@example.com \
   REPO_URL=git@github.com:dibindenny1998/swift.git BRANCH=<branch> \
   ADMIN_EMAIL=admin@swift.in ADMIN_PASSWORD='strong-password' bash setup-vps.sh
   ```
   `DOMAIN` can be Hostinger's temporary hostname (shown in hPanel → VPS → Overview). For a private repo the
   script prints a deploy key to add under GitHub → Settings → Deploy keys, then re-run it.
2. Auto-deploy on push: add repo secrets `VPS_HOST` and `VPS_SSH_KEY` (a key authorised for the `swift` user),
   and the repo variable `DEPLOY_ENABLED=true`. `.github/workflows/deploy.yml` then runs `deploy/deploy.sh` over SSH.
3. When swift.in is ready: point its A record at the VPS, change `server_name` in `/etc/nginx/sites-available/swift`,
   run `certbot --nginx -d swift.in -d www.swift.in`, update `NEXT_PUBLIC_SITE_URL`, set `ALLOW_INDEXING=true`, redeploy.

`robots.txt` blocks all indexing until `ALLOW_INDEXING=true`, so the temporary domain stays out of search results.

## Payments, webhooks & email

- **Razorpay (test mode first):** set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`. In the Razorpay dashboard add a webhook to
  `https://<your-domain>/api/webhooks/razorpay` for `payment.captured`, `order.paid` and `payment.failed`, and put its
  secret in `RAZORPAY_WEBHOOK_SECRET`. Payment is confirmed by the browser (signature-checked) and again by the webhook;
  both paths are idempotent, so stock is only taken once.
- **Cash on delivery:** stock is reserved and the cart cleared when the order is placed; the order stays `PENDING`
  until you confirm it.
- **Email:** set `RESEND_API_KEY` and `EMAIL_FROM` (a verified sender domain). New-order alerts go to the
  `orderNotifyEmail` site setting, or `ADMIN_SEED_EMAIL` if that's empty. Without a key, emails are only logged.

## Shipping updates (Shiprocket)

In Shiprocket → Settings → API → Webhooks, set the URL to `https://<your-domain>/api/webhooks/shiprocket` and a token;
put the same token in `SHIPROCKET_WEBHOOK_TOKEN`. Tracking pushes update the shipment scans and move the order forward
(packed → shipped → out for delivery → delivered; late or out-of-order scans never move it back). Customers get an email
on shipped / out for delivery / delivered.

## Admin panel (`/admin`)

Sign in with `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` (change the password under **Site settings** right away).
Login is rate-limited (5 failed tries per email per 15 minutes) and every admin page/API re-checks the role.

| Section | What you can do |
|---|---|
| Dashboard | Orders today, 7-day revenue, low stock, top products, recent orders, to-dos (COD to confirm, returns, reviews) |
| Products | Search/filter, add/edit (images, variants with SKU/price/MRP/stock/weight, badge, live toggle, SEO), CSV import, categories |
| Bundles & offers | Fixed kits with live price preview, build-your-own box (eligible pieces + tiers), coupons (all rules) |
| Orders | Filter by status/payment/date, confirm COD, create Shiprocket shipment or enter an AWB, status changes with restock, refunds (Razorpay), returns, GST invoice (print → PDF) |
| Customers | Search, order history, total spend, addresses |
| Reviews | Approve/hide, public reply, delete |
| Site settings | Announcement, Christmas dates, shipping/COD/gift wrap, effects toggles, GST + invoice details, Shiprocket pickup, notifications |

Every change goes live on the next page load — no redeploy. Images upload to Cloudinary when its keys are set; otherwise they are
stored on the server in `storage/uploads/` (set `UPLOAD_DIR` to move it, and back it up).

## Analytics & consent

Set `NEXT_PUBLIC_GA4_ID` and/or `NEXT_PUBLIC_META_PIXEL_ID` and rebuild. A consent banner appears; nothing loads until the visitor
accepts. Events sent: `view_item`, `add_to_cart`, `begin_checkout`, `purchase` (GA4) / ViewContent, AddToCart, InitiateCheckout,
Purchase (Pixel), with INR values. Without IDs there is no banner and no tracking.

## Backups

`deploy/backup.sh` dumps Postgres and archives `storage/uploads` to `/home/swift/backups` nightly (cron installed by `setup-vps.sh`, 14-day retention).
Restore with `pg_restore --clean --no-owner -d "$DATABASE_URL" db_YYYY-MM-DD_HHMM.dump`.

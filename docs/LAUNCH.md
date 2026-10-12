# swift.in — launch checklist

Target: live by **10 Nov 2026**. Work through this top to bottom; each item says who does it.

## 1. Accounts & keys (owner)

| Service | What to get | Where it goes (`/var/www/swift/.env` on the VPS) |
|---|---|---|
| Hostinger VPS | Ubuntu 22.04/24.04 VPS, root SSH | run `deploy/setup-vps.sh` (see README) |
| Razorpay | Complete KYC + website approval (needs the policy pages below to be live). Test keys first, then live keys | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` |
| Razorpay webhook | Dashboard → Webhooks → `https://swift.in/api/webhooks/razorpay`, events `payment.captured`, `order.paid`, `payment.failed` | secret → `RAZORPAY_WEBHOOK_SECRET` |
| MSG91 | Auth key + an OTP template approved on DLT (TRAI requirement for Indian SMS) | `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID` |
| Shiprocket | Account, pickup address (note its *name*), API user | `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`; webhook `https://swift.in/api/webhooks/shiprocket` with a token → `SHIPROCKET_WEBHOOK_TOKEN` |
| Resend | Verify the `swift.in` sending domain (DNS records) | `RESEND_API_KEY`, `EMAIL_FROM="swift.in <orders@swift.in>"` |
| Cloudinary (optional) | Cloud name + API key/secret | `CLOUDINARY_*` (without it, uploads are stored on the VPS) |
| Google Analytics 4 / Meta Pixel (optional) | Measurement ID / Pixel ID | `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID` — **rebuild after setting** (`bash deploy/deploy.sh`) |

## 2. Content (owner, in `/admin`)

- [ ] Change the admin password (Site settings → Change admin password).
- [ ] Site settings: business name, **registered address, GSTIN, GST rate**, customer care email & hours, **grievance officer name**, WhatsApp number, new-order email, social links, warehouse pincode, Shiprocket pickup location name, box size.
- [ ] Check Christmas dates: countdown (24 Dec 00:00), last order date (18 Dec).
- [ ] Replace the 10 sample products with the real ones (or import a CSV) — real photos, prices, stock, weights. Delete or hide samples.
- [ ] Review kits, the build-your-own box tiers and coupons (sample codes `MERRY10`, `WELCOME200`).
- [ ] Read every policy page (About, Contact, FAQ, Shipping, Returns, Privacy, Terms) and confirm the wording matches how you actually operate. Ask a lawyer/CA to review if possible.
- [ ] Replace the hero arch illustration with a real photo when you have one (`src/components/effects/ArchArt.tsx`).

## 3. Going live (developer)

- [ ] Point `swift.in` and `www.swift.in` A records at the VPS IP.
- [ ] On the VPS: set `server_name swift.in www.swift.in;` in `/etc/nginx/sites-available/swift`, then `certbot --nginx -d swift.in -d www.swift.in`.
- [ ] In `.env`: `NEXT_PUBLIC_SITE_URL=https://swift.in`, `ALLOW_INDEXING=true`, **`OTP_DEV_ECHO=false`**, swap Razorpay/Shiprocket test keys for live keys.
- [ ] `sudo -u swift bash /var/www/swift/deploy/deploy.sh` (rebuilds with the new values).
- [ ] Submit `https://swift.in/sitemap.xml` in Google Search Console.
- [ ] Turn on GitHub auto-deploy: repo secrets `VPS_HOST`, `VPS_SSH_KEY`, variable `DEPLOY_ENABLED=true`.

## 4. Smoke test on the live site (owner + developer)

- [ ] Sign in with your phone (real SMS arrives).
- [ ] Place a small real order with a live UPI payment → order shows **Confirmed**, stock goes down, confirmation email arrives, admin email arrives. Refund it from admin.
- [ ] Place a COD order → confirm it in admin → create a Shiprocket shipment → label prints → cancel it in Shiprocket and admin (stock goes back).
- [ ] Check the GST invoice for an in-state and an out-of-state address.
- [ ] Open the site on a phone over mobile data; check the countdown, Santa and snowman, and add-to-cart.

## 5. Running the shop

- Backups run nightly at 03:15 IST to `/home/swift/backups` (database + uploaded images, 14 days). Copy them off the server weekly (e.g. to Google Drive).
- Daily: confirm COD orders, create shipments, answer return requests and approve reviews from the dashboard to-do chips.
- After 18 Dec the announcement bar automatically switches to the New Year message.

## Not built yet (spec "phase 2")

- WhatsApp order notifications and abandoned-cart reminders.
- Review photo uploads by customers.

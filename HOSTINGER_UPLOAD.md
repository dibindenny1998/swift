# Uploading swift.in to Hostinger (zip / File Manager)

This zip is the **source code**. It is a Next.js (Node.js) app with a **PostgreSQL** database, so it needs:

1. A Hostinger plan that can run **Node.js apps** — Business or Cloud web hosting (hPanel → *Websites → Add website → Node.js app*), or a VPS.
   Premium/Single shared hosting (PHP only) **cannot** run it — uploading the files there will just show a blank or 403 page.
2. A **PostgreSQL** database. Hostinger web hosting only offers MySQL, so create a free Postgres database at
   **Neon** (neon.tech) or **Supabase** (supabase.com) — choose the **Mumbai (ap-south-1)** region — and copy its connection string.
   (On a VPS you can use the included `deploy/setup-vps.sh`, which installs Postgres for you — see README.)

## Steps (Business / Cloud plan, Node.js app)

1. **Create the database** at Neon/Supabase and copy the connection string. It looks like
   `postgresql://user:password@host/dbname?sslmode=require`.
2. In hPanel, create a **Node.js app** and choose **Upload files**, then upload `swift-in.zip`
   (or open File Manager, go to the app folder, upload the zip and *Extract*).
3. Settings:
   | Setting | Value |
   |---|---|
   | Node.js version | **22** (20 also works) |
   | Install command | `npm install` |
   | Build command | `npm run build:hosted` |
   | Start command | `npm start` |
4. **Environment variables** (hPanel → your app → Environment variables). Required:
   ```
   DATABASE_URL=postgresql://…your Neon/Supabase string…
   NEXT_PUBLIC_SITE_URL=https://your-temporary-domain.hostingersite.com
   SESSION_SECRET=<any random 64 characters>
   ADMIN_SEED_EMAIL=you@example.com
   ADMIN_SEED_PASSWORD=<a strong password>
   ALLOW_INDEXING=false
   OTP_DEV_ECHO=true
   ```
   - `SESSION_SECRET`: generate one at https://generate-secret.vercel.app/64 or run `openssl rand -hex 32`.
   - `OTP_DEV_ECHO=true` shows the login code on screen while there is no SMS provider — **only for testing on the temporary domain;
     set it to `false` before real customers use the site** (otherwise anyone could sign in as any phone number).
   - Everything else (Razorpay, MSG91, Shiprocket, Resend, Cloudinary, analytics) is optional for now — see `.env.example` and `docs/LAUNCH.md`.
5. **Deploy / Build.** The build creates the database tables and, on the first run only, loads the sample products, settings and your
   admin login. Later deploys never overwrite your products or settings.
6. Open the temporary domain → the store. Open `/admin` → sign in with `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`,
   then change the password under **Site settings**.

## Good to know

- **Product photos:** on hosted Node.js apps, files written to the server can be lost on redeploy. Add free **Cloudinary** keys
  (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) before uploading real photos in the admin.
- **After changing environment variables**, redeploy/rebuild the app so they take effect.
- **Webhooks** (Razorpay, Shiprocket) need the public URL: `https://<domain>/api/webhooks/razorpay` and `/api/webhooks/shiprocket`.
- If the build fails with *Can't reach database server*, check `DATABASE_URL` (Neon/Supabase need `?sslmode=require`).
- Full go-live list: `docs/LAUNCH.md`.

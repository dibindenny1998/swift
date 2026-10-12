# swift.in

Premium Christmas shop for India. Next.js 16 (App Router) + Tailwind v4 + Prisma/Postgres.
The full product spec is in [`SWIFT_BUILD_SPEC.md`](./SWIFT_BUILD_SPEC.md); design references live in `docs/reference/`.

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

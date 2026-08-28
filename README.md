# Tasneem

A water bottle & delivery essentials e-commerce site for the Saudi market:
phone + name signup (no password, no OTP — see `src/lib/session.ts` for the
trade-off), a delivery service-area check against admin-drawn map zones,
category/product browsing, cart & checkout, online payment via Moyasar
(mada/cards/Apple Pay) or cash on delivery, order tracking, and an admin
workflow where order status + delivery proof photos are managed straight
from a Google Sheet.

**Start here: [SETUP.md](SETUP.md)** — this repo is code-complete but needs
real accounts (Supabase, Mapbox, Moyasar, Google Cloud, Vercel) wired up via
environment variables before anything works. Nothing renders correctly until
you've gone through it.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind) — see `AGENTS.md`, this
  version has notable breaking changes vs. older Next.js (e.g.
  `middleware.ts` → `proxy.ts`).
- **Supabase** — Postgres only; auth is a lightweight custom session cookie
  (`src/lib/session.ts`), not Supabase Auth.
- **Moyasar** — KSA payment gateway.
- **Mapbox GL** (+ Mapbox GL Draw for admin zone drawing) — location picking
  and the polygon service-area check (`src/lib/geo.ts`).
- **Google Sheets API** — admins manage order status and proof-of-delivery
  photos directly in a spreadsheet; a polling job syncs it back into the DB.

## Local development

```bash
cp .env.example .env.local   # fill in values — see SETUP.md
npm install
npm run dev
```

## Project layout

- `supabase/migrations/0001_init.sql` — full DB schema, RLS policies, seed data.
- `src/lib/actions/` — server actions (auth, cart, address, checkout, admin zones).
- `src/lib/{geo,sheets,moyasar,phone}.ts` — the non-trivial integration logic.
- `src/app/api/payments/` — Moyasar link/callback/webhook routes.
- `src/app/api/cron/sync-sheet` — pulls admin edits from the Google Sheet into the DB.
- `src/app/admin/zones` — internal tool for drawing delivery-area polygons.
- `.github/workflows/sync-sheet.yml` — free alternative to Vercel Cron (Hobby
  plan only allows daily cron; this hits the sync endpoint every 2 minutes).

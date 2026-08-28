# Setup guide

This project is code-complete for the core flows (signup, service-area check,
shop/cart/checkout, Moyasar payment, order tracking, Google Sheets admin
sync) but needs real accounts wired up before it does anything live. None of
these accounts can be created on your behalf — work through them in order.

## 1. Supabase (database only)

Auth here is deliberately lightweight for the MVP: an account is just a name
+ phone number, no password, no SMS/OTP verification (see
`src/lib/session.ts` for the trade-off that implies — anyone who knows a
phone number can "log in" as that account). So Supabase is used purely as
the database — no Supabase Auth provider needs configuring.

1. Create a free project at https://supabase.com/dashboard.
2. In **Project Settings → API Keys**, copy the **Project URL** and
   **Publishable key** (`sb_publishable_...`) into `.env.local` as
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Copy the
   **Secret key** (`sb_secret_...`) into `SUPABASE_SERVICE_ROLE_KEY` — this
   one bypasses all database security rules, so never expose it to the
   browser or commit it.
3. Generate a `SESSION_SECRET` (signs the login cookie):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. In the **SQL Editor**, run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   This creates every table and RLS policy, and seeds three sample
   categories/products you can edit or delete later.
5. Promote yourself to admin (needed for `/admin/zones`) once you've signed
   up through the app once:
   ```sql
   update profiles set is_admin = true where phone = '+9665XXXXXXXX';
   ```

## 2. Mapbox (maps for location picking + zone drawing)

1. Create a free account at https://account.mapbox.com.
2. Copy your default public token into `NEXT_PUBLIC_MAPBOX_TOKEN`.
3. Free tier covers generous map-load volume for a small/medium business.

## 3. Moyasar (KSA payments)

1. Create an account at https://dashboard.moyasar.com and switch to **Test
   mode** first.
2. Copy the test **Secret key** and **Publishable key** into
   `MOYASAR_SECRET_KEY` and `NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY`.
3. Create a webhook so payment confirmations reach the site even if a
   customer closes their browser mid-payment:
   ```bash
   curl https://api.moyasar.com/v1/webhooks \
     -u sk_test_XXXX: \
     -d "url=https://<your-deployed-domain>/api/payments/webhook" \
     -d "http_method=post" \
     -d "shared_secret=<make up a long random string>" \
     -d "events[]=payment_paid" \
     -d "events[]=payment_failed"
   ```
   Put the same `shared_secret` value into `MOYASAR_WEBHOOK_SECRET`.
4. Test with Moyasar's published test card numbers before going live. Switch
   to live keys (and register a new live webhook) once ready for real money —
   go through Moyasar's KYC/business verification first.

## 4. Google Sheets (admin order sync)

1. Create a Google Sheet, name the first tab exactly `Orders`.
2. In Google Cloud Console, create a project (or use an existing one),
   enable the **Google Sheets API**, then create a **Service Account**.
3. Create a JSON key for that service account. From it, copy:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (keep the `\n`
     characters as literal two-character sequences — don't turn them into
     real line breaks in `.env.local`)
4. Open your Google Sheet's share dialog and share it with the service
   account's email (the `client_email` value) as **Editor**.
5. Copy the Sheet's ID from its URL
   (`https://docs.google.com/spreadsheets/d/<THIS_PART>/edit`) into
   `GOOGLE_SHEET_ID`.
6. The app writes the header row and every new order automatically — you
   don't need to set up columns by hand. Admins only ever edit column **H
   (Status)** — use one of: `Pending`, `Confirmed`, `Out for Delivery`,
   `Completed`, `Cancelled` — and column **I (Proof Photo URL)**, pasting a
   link to a photo uploaded anywhere public (Google Drive share link set to
   "Anyone with the link", Imgur, etc.).

### Keeping the sheet in sync

Generate a long random string for `CRON_SECRET` (used to authenticate calls
to `/api/cron/sync-sheet`).

Vercel's free Hobby plan only allows cron jobs that fire once a day, which
is too slow for admin edits to show up promptly. Instead, this repo includes
[`.github/workflows/sync-sheet.yml`](.github/workflows/sync-sheet.yml), which
calls the same endpoint from GitHub Actions every 5 minutes for free (the
fastest interval GitHub's scheduler reliably supports). After
you push this repo to GitHub, add two repository secrets (**Settings →
Secrets and variables → Actions**):
- `SITE_URL` — your deployed URL, e.g. `https://your-project.vercel.app`
- `CRON_SECRET` — the same value you put in Vercel's env vars

If you'd rather pay for Vercel Pro, you can instead add a `vercel.json` with
a `crons` entry pointing at `/api/cron/sync-sheet?secret=...` on a 1-2 minute
schedule and drop the GitHub Actions workflow.

## 5. Deploying

1. Push this repo to GitHub (`git init` already ran locally — set your
   identity first: `git config user.name "..." && git config user.email "..."`,
   commit, then create a GitHub repo and push).
2. Import the repo at https://vercel.com/new.
3. Add every variable from `.env.example` to the Vercel project's
   **Environment Variables** settings (Production + Preview).
4. Deploy. You'll get a free `your-project.vercel.app` URL immediately — a
   custom domain can be attached later from a registrar of your choice.

## 6. Local development

```bash
cp .env.example .env.local   # then fill in the values above
npm run dev
```

Until `.env.local` is filled in, pages show a clear
"Missing Supabase config" error instead of a crash — that's expected.

## Known gaps / things to verify once you have real test accounts

- **Moyasar `Moyasar.init()` metadata passthrough** (used to tag a payment
  with our order number) isn't confirmed in Moyasar's public docs at the
  time this was built. The `/api/payments/link` call right after
  `on_completed` is the real source of truth for linking a payment to an
  order — metadata is a best-effort extra. Test a full card payment in
  Moyasar's test mode and confirm `orders.moyasar_payment_id` gets set.
- **No phone verification**: signup only checks that a number is *shaped*
  like a Saudi mobile number, not that whoever typed it owns it. Fine for an
  MVP; revisit (real OTP, or at least rate-limiting) before this handles
  anything where impersonating a phone number is a real risk.
- **Service zones must exist** before any address can pass the delivery
  check — draw at least one at `/admin/zones` before testing checkout.

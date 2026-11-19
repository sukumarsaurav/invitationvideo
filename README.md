# invitationvideos.com

Template-based video invitations. Customers fill in names, dates and photos, watch a free watermarked
preview, and download an HD MP4 that is rendered **in their own browser** with Remotion.

## Stack

| Part | Tool |
| --- | --- |
| App | React 19 + Vite + Tailwind CSS v4, mobile-first app shell |
| Templates | Remotion compositions in `src/templates/<slug>/` |
| Preview | `@remotion/player` (watermarked) |
| Music | `@remotion/media` `<Audio>`, tracks in `public/music/` (listed in `src/templates/music.ts`) |
| HD render | `@remotion/web-renderer` (`renderMediaOnWeb`) in the customer's browser |
| Database / auth | Supabase, `invites` schema (`supabase/migrations`) |
| Files | Cloudflare R2 (MinIO locally) — not wired yet |
| Payments | Razorpay Checkout + Supabase Edge Functions (`supabase/functions/razorpay-*`), coupons |

## Run locally

Needs Node 22.6+.

```bash
npm install
cp .env.example .env.local   # then paste the publishable key
npm run dev                  # app on http://localhost:5173
```

There is no local database: `npm run dev` talks to the hosted Supabase project (`invitation-videos`).
Anything you do while developing is real: drafts land in the live database, sign-in codes go to real
inboxes, and admin changes (prices, publishing, settings) show on the live site straight away.

**Schema changes:** add a migration in `supabase/migrations/`, then `npm run db:push` (link once with
`supabase link --project-ref clhfqyyqjwcrgpfrplyy`). Test risky changes on a Supabase branch first.

## Build and deploy (Vercel)

`npm run build` runs four steps: sitemap + robots.txt → typecheck → `vite build` → pre-render.
Pre-rendering (`scripts/prerender.ts`) writes an HTML file per public page (`dist/tags/hindu-wedding.html`
etc.) with that page's title, description, canonical URL, social preview tags, structured data and
its text and links, so search engines and WhatsApp previews see real content. React replaces it on load.

`vercel.json` holds the hosting rules (framework Vite, build `npm run build`, output `dist`):
- `cleanUrls`: `/tags/hindu-wedding` is served from `tags/hindu-wedding.html` with no redirect.
- Private routes (`/editor/*`, `/render/*`, `/p/*`, `/account`, `/my-videos`) and unknown URLs are
  rewritten to `spa.html`, a plain non-indexed app shell.
- Long-term caching for hashed files in `/assets/`, plus basic security headers.

Node 24 is pinned in `package.json` (`engines`): the build scripts run TypeScript directly.
Check the output locally with `npm run preview:static` (serves `dist/` following `vercel.json`).

### Vercel environment variables

Set these in Vercel → Project → Settings → Environment Variables (Production and Preview).
They override `.env.production`.

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://clhfqyyqjwcrgpfrplyy.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | the project's publishable key (`sb_publishable_…`, Supabase → Project Settings → API Keys) |
| `VITE_GOOGLE_AUTH_ENABLED` | `false` (set `true` once Google sign-in is configured in Supabase) |
| `VITE_SUPPORT_WHATSAPP` | optional: support number, digits with country code, e.g. `919876543210` |
| `VITE_FREE_HD` | leave unset. `true` lets anyone download HD without paying (e.g. a launch promotion) |

**HD downloads need payment in production.** `/render/:id` only makes the HD file when the server says the
video is `paid` or `rendered` (status is set only by the server, after a payment). See **Payments** below. Because the video is rendered in the
customer's browser, this stops ordinary customers, not someone editing the app's JavaScript.

All are public (`VITE_` values are built into the browser bundle). Never put the Supabase
service-role/secret key or a Razorpay secret in a `VITE_` variable.

## Before going live

- **Sign-in email must include the code.** Customers sign in with a 6-digit code (links often open in
  the wrong browser on phones). Locally the template is `supabase/templates/magic_link.html`. On the
  hosted project, paste the same template into *Authentication → Email Templates → Magic Link* — the
  hosted default only contains a link.
- **Hosted project:** `invitation-videos` (`clhfqyyqjwcrgpfrplyy`). Migrations and the seed are applied
  (18 Nov 2026); the old `public` tables from the earlier version were removed. `.env.production`
  points the build at it. Later schema changes: add a migration file, then `supabase db push`
  (link once with `supabase link --project-ref clhfqyyqjwcrgpfrplyy`), and re-run `supabase/seed.sql`.
- **Legacy storage buckets** (`template-assets`, `generated-videos`, `order-uploads`) are empty, private and
  have no access policies (18 Nov 2026). Supabase blocks deleting buckets with SQL: delete them in
  *Storage* in the dashboard. Don't add storage policies without a `bucket_id` filter.
- **`invites` schema is exposed to the API** (done 18 Nov 2026 with
  `alter role authenticator set pgrst.db_schemas = 'public, graphql_public, invites'; notify pgrst, 'reload config';`).
  If someone later saves *Project Settings → Data API → Exposed schemas* without `invites`, the API
  answers `PGRST106 Invalid schema: invites` and the app can't load data: add `invites` there, or re-run the SQL.
- **Auth URLs:** Authentication → URL Configuration → Site URL `https://invitationvideos.com`,
  redirect URLs `https://invitationvideos.com/**`, `http://localhost:5173/**`, and your Vercel
  preview URLs, e.g. `https://invitationvideo-*-<your-vercel-team>.vercel.app/**`. Avoid
  `https://*.vercel.app/**`: it would let any Vercel site receive sign-in redirects.

## Adding a template

1. Create `src/templates/<slug>/meta.ts` and `index.tsx` (one React component per clip).
   - `schema.details`: the personal facts (names, date, venue, photo) asked once on the first editor step.
   - `schema.clips[].fields`: wording specific to a clip. Mark generic wording `keep: true` so it starts
     filled in; everything else starts empty and the video shows the example until the customer types.
   - `holdFrame`: the frame where all of a clip's text is visible (shown while editing).
   - `schema.title`: e.g. `'{bride} & {groom}'`, used in My Videos and share links.
   - `music`: the track a new video starts with (an id from `src/templates/music.ts`); customers can
     change it or pick "No music" on the editor's Finish step.
2. Add its meta to `src/templates/metas.ts` and its definition to `src/templates/registry.ts`.
   Give it `tags` (from `src/templates/taxonomy.ts`), and optionally `trending` / `popularity`.
   These are only starting values: once seeded, the admin panel owns price, name, copy, tags and flags.
3. Run `npm run seed:generate`.
4. Deploy, then apply `supabase/seed.sql` to the hosted project. The template arrives **hidden**: open
   `/admin/templates`, set its price and copy, check the preview, and press **Publish**. Re-running the
   seed later only updates code-owned fields (size, fps, duration, schema), never admin edits.

## Payments

Customers pay on `/render/:id` (the download page). The database prices every video
(`invites._quote`: the template's current price, less any coupon), so the browser never decides
what is charged. Two modes, switched by the admin setting **Test payments**:

- **On** (the starting state): "Pay" completes a test payment that charges nothing and records a paid
  order with source `test`. Coupons work as usual. Good for trying the whole flow.
- **Off:** customers pay with Razorpay Checkout (UPI, cards, netbanking, wallets):
  1. `razorpay-order` (edge function) records a pending order and opens a Razorpay order for the amount.
  2. Checkout takes the payment in a Razorpay window.
  3. `razorpay-verify` checks Razorpay's signature, captures the payment if needed and marks the video paid.
  4. `razorpay-webhook` does the same from Razorpay's side, for customers who close the page too early.
  Settling is idempotent, so steps 3 and 4 can both happen. A 100% coupon skips Razorpay (source `coupon`).

**Set up Razorpay** (test mode first: test keys start with `rzp_test_` and charge nothing):

1. Apply the migrations (`npm run db:push`) **before** deploying the app: the download page calls
   `quote_price` and the new `pay_test(video, coupon)`.
2. Add the secrets (Razorpay Dashboard → Account & Settings → API Keys). Run this yourself so the
   secret never passes through anything else:
   `supabase secrets set RAZORPAY_KEY_ID=rzp_test_… RAZORPAY_KEY_SECRET=… RAZORPAY_WEBHOOK_SECRET=…`
   (the webhook secret is any long random string; use the same one in step 4).
3. Deploy the functions: `supabase functions deploy razorpay-order razorpay-verify razorpay-webhook`
   (`supabase/config.toml` turns off the gateway's JWT check for them; each checks the session or the
   webhook signature itself).
4. Razorpay Dashboard → Webhooks → Add: URL
   `https://clhfqyyqjwcrgpfrplyy.supabase.co/functions/v1/razorpay-webhook`, the secret from step 2,
   events `payment.captured` and `order.paid`.
5. `/admin/settings` → turn **Test payments** off. Pay for a video with a
   [Razorpay test card or UPI id](https://razorpay.com/docs/payments/payments/test-card-details/), and
   check the order in `/admin/customers`.
6. To go live, repeat steps 2 and 4 with live keys (`rzp_live_…`) from an activated Razorpay account.

**Coupons** (`/admin/coupons`, managers): percent or rupees off, an optional limit on paid uses and
an optional last day. Customers type the code under "Have a coupon code?". Coupons can't be deleted
because orders refer to them: switch one off instead. Discounts are whole rupees, and a discount never
leaves less than ₹1 to pay (Razorpay's minimum) unless it is 100%.

## Admin panel

`/admin` manages templates (price, copy, tags, order, publish/hide), customers (search, videos,
orders, support notes), coupons, site settings (announcement, support WhatsApp, maintenance notice, test payments) and shows
a dashboard and an append-only audit log. It is a separate bundle that customers never download. The
plan, with later phases (payments, refunds, coupons, analytics), is the Admin Panel Plan doc.

- **Access:** a row in `invites.admins` (role `viewer`, `support`, `manager` or `owner`) plus two-step
  sign-in with an authenticator app, set up on first visit. The database checks both on every query
  (`invites.is_admin()`), so the panel's own screens are not the security boundary. `/admin` has its
  own sign-in (emailed code, existing accounts only). Sessions end after 30 minutes without activity.
- **Make someone an admin** (SQL editor; Phase 4 adds a screen for this):
  `insert into invites.admins (user_id, role) select id, 'owner' from auth.users where email = 'you@example.com';`
  They must have signed in to the store once first.
- **Backup authenticator:** Supabase has no recovery codes. Each admin should add a second
  authenticator (another phone, or a password manager) under `/admin/security`, and there should be
  at least two owners.
- **Locked out** (every authenticator lost): in the Supabase dashboard, Authentication → Users → the
  admin → delete their MFA factors (or SQL editor:
  `delete from auth.mfa_factors where user_id = (select id from auth.users where email = 'you@example.com');`).
  The next visit to `/admin` sets up a new authenticator. Check the audit log afterwards.
- **Store rebuilds:** prices and copy reach the app on the next page load. Pre-rendered search pages,
  the sitemap and the price in Google's structured data are built at deploy time, so a database job
  (`invites.fire_store_rebuild`, every minute) calls a Vercel deploy hook about 2 minutes after the
  last store-visible template edit. To turn it on, create a deploy hook (Vercel → Project → Settings →
  Git → Deploy Hooks, branch `main`) and store its URL in Vault (SQL editor):
  `select vault.create_secret('https://api.vercel.com/v1/integrations/deploy/…', 'vercel_deploy_hook');`
  The Templates page shows whether it is set up and when the last rebuild started.
- **Money:** order amounts (`invites.orders.amount`, refunds, fees) are in paise, as Razorpay sends
  them; template prices (`price_inr`) are whole rupees.
- **Security headers** (`vercel.json`): the site can't be framed, and scripts load only from the
  site itself, which limits what an injected script could do with a signed-in admin's session.
  `npm run preview:static` serves `dist/` with the same headers.
- **While developing:** `localhost` uses the same hosted project, so the same admin accounts and
  authenticator codes work there, and every change is live. Add `http://localhost:5173/**` to the
  project's redirect URLs (Authentication → URL Configuration) if sign-in links should return to it.

## Music

`src/templates/music.ts` lists the tracks and which occasions each suits (suggested ones show first in
the editor). The four starting tracks are synthesised by `node scripts/generate-music.ts` (needs ffmpeg),
so they are our own work with nothing to license. To use a licensed recording instead, replace the
`.m4a` in `public/music/` with an AAC file of the same name, ideally 30 seconds or longer (shorter
tracks loop). The music fades in and out with the video and is mixed into the HD MP4; videos with
"No music" are rendered without an audio track.

Template rules for the browser renderer: use text, SVG, linear gradients, transforms, shadows and
images. Avoid radial gradients. Load fonts through `src/templates/shared/fonts.ts`.

## Where things are

| Path | What |
| --- | --- |
| `src/components/AppShell.tsx` | Top bar, bottom tabs (phone), top nav (desktop), drawer |
| `src/pages/EditorPage.tsx` | Full-screen editor: pinned preview, clip strip, fields, sticky actions |
| `src/pages/RenderPage.tsx` | HD render with progress (payment skipped in development) |
| `src/lib/drafts.ts` | Drafts in localStorage until Supabase sync is wired |
| `src/templates/` | Template types, data helpers, shared pieces, templates |
| `src/templates/catalogue.ts` | Lays the admin panel's published values over the code templates (app and build) |
| `src/lib/catalogue.ts`, `src/lib/siteSettings.ts` | Load the published catalogue and public settings in the browser |
| `src/admin/` | Admin panel (lazy-loaded at `/admin`) |
| `scripts/catalogue-build.ts` | Published catalogue for the sitemap and pre-rendered pages |
| `supabase/migrations/` | Schema + RLS |

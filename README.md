# invitationvideos.com

Template-based video invitations. Customers fill in names, dates and photos, watch a free watermarked
preview, and download an HD MP4 that is rendered **in their own browser** with Remotion.

## Stack

| Part | Tool |
| --- | --- |
| App | React 19 + Vite + Tailwind CSS v4, mobile-first app shell |
| Templates | Remotion compositions in `src/templates/<slug>/` |
| Preview | `@remotion/player` (watermarked) |
| HD render | `@remotion/web-renderer` (`renderMediaOnWeb`) in the customer's browser |
| Database / auth | Supabase, `invites` schema (`supabase/migrations`) |
| Files | Cloudflare R2 (MinIO locally) — not wired yet |
| Payments | Razorpay — not wired yet |

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
video is `paid` or `rendered` (status is set only by the service role). Until Razorpay is wired, production
shows "HD download opens soon". Development always allows it. Because the video is rendered in the
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
2. Add its meta to `src/templates/metas.ts` and its definition to `src/templates/registry.ts`.
   Give it `tags` (from `src/templates/taxonomy.ts`), and optionally `trending` / `popularity`.
   These are only starting values: once seeded, the admin panel owns price, name, copy, tags and flags.
3. Run `npm run seed:generate`.
4. Deploy, then apply `supabase/seed.sql` to the hosted project. The template arrives **hidden**: open
   `/admin/templates`, set its price and copy, check the preview, and press **Publish**. Re-running the
   seed later only updates code-owned fields (size, fps, duration, schema), never admin edits.

## Admin panel

`/admin` manages templates (price, copy, tags, order, publish/hide), customers (search, videos,
orders, support notes), site settings (announcement, support WhatsApp, maintenance notice) and shows
a dashboard and an append-only audit log. It is a separate bundle that customers never download. The
plan, with later phases (payments, refunds, coupons, analytics), is the Admin Panel Plan doc.

- **Access:** a row in `invites.admins` (role `viewer`, `support`, `manager` or `owner`) plus two-step
  sign-in with an authenticator app, set up on first visit. The database checks both on every query
  (`invites.is_admin()`), so the panel's own screens are not the security boundary.
- **Make someone an admin** (SQL editor; Phase 4 adds a screen for this):
  `insert into invites.admins (user_id, role) select id, 'owner' from auth.users where email = 'you@example.com';`
  They must have signed in to the store once first.
- **Store changes** reach visitors on their next page load. Pre-rendered search pages and the sitemap
  read the published catalogue at build time, so they update on the next deploy.
- **Locally:** two-step sign-in is enabled in `supabase/config.toml`; sign-in codes arrive in Mailpit
  (http://localhost:54324).

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

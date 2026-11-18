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

Needs Node 22.6+ and Docker.

```bash
npm install
npm run dev            # app on http://localhost:5173
```

Local database (first start downloads Docker images):

```bash
npm run db:start       # Postgres, Auth, Studio (http://localhost:54323), email inbox (http://localhost:54324)
npm run db:reset       # re-apply migrations + seed
```

Then copy `.env.example` to `.env.local` and paste the anon key printed by `supabase status`.

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
3. Run `npm run seed:generate` then `npm run db:reset`. The sitemap and pre-rendered pages pick it
   up automatically on the next build.

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
| `supabase/migrations/` | Schema + RLS |

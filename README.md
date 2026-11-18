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

## Build and deploy (Cloudflare Pages)

`npm run build` runs four steps: sitemap + robots.txt → typecheck → `vite build` → pre-render.
Pre-rendering (`scripts/prerender.ts`) writes an HTML file per public page (`dist/tags/hindu-wedding.html`
etc.) with that page's title, description, canonical URL, social preview tags, structured data and
its text and links, so search engines and WhatsApp previews see real content. React replaces it on load.

Cloudflare Pages settings: build command `npm run build`, output directory `dist`. `dist/_redirects`
sends private routes (`/editor/*`, `/render/*`, `/p/*`, `/account`, `/my-videos`) to a plain,
non-indexed shell. Check locally with `npm run preview:static` (serves `dist/` the way Pages does).
After the first deploy, confirm `/editor/anything` shows the app (not the home page) — that verifies
the `_redirects` rewrite.

## Before going live

- **Sign-in email must include the code.** Customers sign in with a 6-digit code (links often open in
  the wrong browser on phones). Locally the template is `supabase/templates/magic_link.html`. On the
  hosted project, paste the same template into *Authentication → Email Templates → Magic Link* — the
  hosted default only contains a link.
- **Hosted project:** `invitation-videos` (`clhfqyyqjwcrgpfrplyy`). Migrations and the seed are applied
  (18 Nov 2026); the old `public` tables from the earlier version were removed. `.env.production`
  points the build at it. Later schema changes: add a migration file, then `supabase db push`
  (link once with `supabase link --project-ref clhfqyyqjwcrgpfrplyy`), and re-run `supabase/seed.sql`.
- **`invites` schema is exposed to the API** (done 18 Nov 2026 with
  `alter role authenticator set pgrst.db_schemas = 'public, graphql_public, invites'; notify pgrst, 'reload config';`).
  If someone later saves *Project Settings → Data API → Exposed schemas* without `invites`, the API
  answers `PGRST106 Invalid schema: invites` and the app can't load data: add `invites` there, or re-run the SQL.
- **Auth URLs:** Authentication → URL Configuration → Site URL `https://invitationvideos.com`,
  redirect URLs `https://invitationvideos.com/**` and `http://localhost:5173/**`.

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

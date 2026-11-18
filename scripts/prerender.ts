// Build-time pre-rendering for search engines and link previews (WhatsApp, Facebook, X).
//
// After `vite build`, writes one HTML file per public page (dist/<path>.html) with:
//   - the page's <title>, description, canonical URL, Open Graph tags and JSON-LD in <head>
//   - the page's real text and links inside #root, so crawlers that don't run JavaScript see content
// When the app loads, React replaces #root with the full interactive page, so visitors get the
// same page as before, just with content painted sooner.
//
// Private pages (editor, download, shared previews, account) and unknown URLs get a plain app shell
// instead (dist/spa.html, wired up by the rewrites in vercel.json) so they never show home content.
//
// Run with: node scripts/prerender.ts   (part of `npm run build`)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getFaq } from '../src/content/faq.ts';
import { showPrices } from '../src/lib/pricing.ts';
import {
  byPopularity,
  categoryLabel,
  helpMeta,
  homeMeta,
  listingMeta,
  SITE_NAME,
  similarTo,
  tagMeta,
  templateMeta,
  usedTags,
  type PageMeta,
} from '../src/lib/pageMeta.ts';
import { BUILD_TEMPLATES } from './catalogue-build.ts';
import { CATEGORIES, getCategory, getTag, inCategory, SITE_URL } from '../src/templates/taxonomy.ts';
import type { TemplateMeta } from '../src/templates/types';

// Published templates only, with the admin panel's prices and copy.
const TEMPLATES: TemplateMeta[] = BUILD_TEMPLATES;

const dist = (p: string) => fileURLToPath(new URL(`../dist/${p}`, import.meta.url));
const shell = readFileSync(dist('index.html'), 'utf8');
if (!shell.includes('<div id="root"></div>')) throw new Error('dist/index.html has no empty #root: run vite build first');

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
/** "₹499 for HD", or "free HD" while downloads are free (src/lib/pricing.ts). */
const hdPrice = (n: number) => (showPrices() ? `${inr(n)} for HD` : 'free HD');

const head = (m: PageMeta) => {
  const title = `${m.title} | ${SITE_NAME}`;
  const url = `${SITE_URL}${m.path}`;
  const ld = m.jsonLd.length ? JSON.stringify(m.jsonLd.length === 1 ? m.jsonLd[0] : m.jsonLd).replace(/</g, '\\u003c') : '';
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(m.description)}" />`,
    `<meta name="robots" content="${m.noindex ? 'noindex, nofollow' : 'index, follow'}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${SITE_URL}/icons/icon-512.png" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    ld ? `<script type="application/ld+json" id="seo-jsonld">${ld}</script>` : '',
  ]
    .filter(Boolean)
    .join('\n    ');
};

/** Swaps the shell's <title> and description for the page's, and fills #root. */
const page = (m: PageMeta, body: string) =>
  shell
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*>\s*/, '')
    .replace('</head>', `    ${head(m)}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);

const link = (href: string, text: string, cls = 'text-primary underline') => `<a href="${href}" class="${cls}">${esc(text)}</a>`;

const templateList = (list: TemplateMeta[]) =>
  `<ul class="mt-3 space-y-2">${list
    .map(
      (t) =>
        `<li>${link(`/t/${t.slug}`, t.name, 'font-semibold text-primary underline')} <span class="text-sm text-muted">· ${esc(categoryLabel(t.category))} invitation video · ${hdPrice(t.priceInr)}</span></li>`,
    )
    .join('')}</ul>`;

const tagLinks = (slugs: string[]) =>
  `<ul class="mt-3 flex flex-wrap gap-2">${slugs
    .map((s) => getTag(s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .map((t) => `<li>${link(`/tags/${t.slug}`, `#${t.name}`, 'rounded-full border border-border px-3 py-1 text-sm')}</li>`)
    .join('')}</ul>`;

const section = (title: string, inner: string) => `<section class="mt-8"><h2 class="font-display text-xl font-semibold">${esc(title)}</h2>${inner}</section>`;

const occasions = () => CATEGORIES.filter((c) => TEMPLATES.some((t) => inCategory(t.category, c.slug)));

/** Same header and footer links as the app, so every page links to every other public page. */
const layout = (main: string) => `
<header class="border-b border-border px-4 py-4">
  <a href="/" class="font-display text-xl font-semibold text-ink">invitation<span class="italic text-primary">videos</span></a>
  <nav class="mt-2 flex flex-wrap gap-4 text-sm">${link('/', 'Home')} ${link('/templates', 'Templates')} ${link('/help', 'How it works')}</nav>
</header>
<main class="mx-auto max-w-6xl px-4 py-6">${main}</main>
<footer class="border-t border-border px-4 py-8 text-sm">
  <p class="font-semibold">Occasions</p>
  <ul>${occasions().map((c) => `<li>${link(`/invitations/${c.slug}`, `${c.name} invitations`)}</li>`).join('')}</ul>
  <p class="mt-4 font-semibold">Popular searches</p>
  <ul>${usedTags(TEMPLATES).map((t) => `<li>${link(`/tags/${t.slug}`, t.title)}</li>`).join('')}</ul>
  <p class="mt-4 text-muted">© ${new Date().getFullYear()} invitationvideos.com</p>
</footer>`;

const faqHtml = (faq: Array<[string, string]>) =>
  faq.map(([q, a]) => `<details class="mt-3"><summary class="font-semibold">${esc(q)}</summary><p class="text-muted">${esc(a)}</p></details>`).join('');

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

type Out = { path: string; meta: PageMeta; body: string };
const pages: Out[] = [];

// Home
{
  const faq = getFaq().slice(0, 4);
  pages.push({
    path: '/',
    meta: homeMeta(TEMPLATES, faq),
    body: layout(`
      <p class="text-xs font-semibold uppercase tracking-widest text-accent-ink">Personalised video invitations</p>
      <h1 class="mt-2 font-display text-4xl font-semibold text-primary-dark">Your celebration, <em class="text-accent-ink">beautifully announced</em></h1>
      <p class="mt-3 text-muted">Pick a design, add your names and photos, and watch your invitation come to life. Share it on WhatsApp in minutes.</p>
      <p class="mt-4">${link('/templates', 'Explore designs →', 'inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white')}</p>
      ${section('Trending now', templateList(TEMPLATES.filter((t) => t.trending)))}
      ${section('Browse by occasion', `<ul class="mt-3">${occasions().map((c) => `<li>${link(`/invitations/${c.slug}`, `${c.name} invitations`)} <span class="text-sm text-muted">· ${esc(c.blurb)}</span></li>`).join('')}</ul>`)}
      ${section('Popular templates', templateList(byPopularity(TEMPLATES)))}
      ${section('Popular searches', tagLinks(usedTags(TEMPLATES).map((t) => t.slug)))}
      ${section('Questions', faqHtml(faq))}`),
  });
}

// All templates + each occasion with templates
for (const slug of [null, ...occasions().map((c) => c.slug)]) {
  const category = getCategory(slug ?? undefined);
  const list = category ? TEMPLATES.filter((t) => inCategory(t.category, category.slug)) : TEMPLATES;
  const meta = listingMeta(TEMPLATES, slug);
  pages.push({
    path: meta.path,
    meta,
    body: layout(`
      <h1 class="font-display text-3xl font-semibold">${esc(category ? `${category.name} invitations` : 'All templates')}</h1>
      ${category ? `<p class="mt-2 text-muted">${esc(category.blurb)}</p>` : ''}
      ${templateList(list)}
      ${section('Popular searches', tagLinks(usedTags(list).map((t) => t.slug)))}`),
  });
}

// Tags with templates
for (const tag of usedTags(TEMPLATES)) {
  const list = TEMPLATES.filter((t) => t.tags.includes(tag.slug));
  const related = usedTags(list)
    .map((t) => t.slug)
    .filter((s) => s !== tag.slug);
  pages.push({
    path: `/tags/${tag.slug}`,
    meta: tagMeta(TEMPLATES, tag.slug),
    body: layout(`
      <nav class="text-xs text-muted">${link('/', 'Home', '')} › ${link('/templates', 'Templates', '')} › ${esc(tag.name)}</nav>
      <h1 class="mt-1 font-display text-3xl font-semibold">${esc(tag.title)}</h1>
      <p class="mt-2 text-muted">${esc(tag.blurb)}</p>
      ${templateList(list)}
      ${related.length ? section('Related searches', tagLinks(related)) : ''}`),
  });
}

// Each template
for (const t of TEMPLATES) {
  const fields = t.schema.details.filter((f) => f.type === 'text').map((f) => f.label);
  const similar = similarTo(t, TEMPLATES);
  pages.push({
    path: `/t/${t.slug}`,
    meta: templateMeta(t, t.slug),
    body: layout(`
      <nav class="text-xs text-muted">${link('/', 'Home', '')} › ${link(`/invitations/${t.category}`, `${categoryLabel(t.category)} invitations`, '')} › ${esc(t.name)}</nav>
      <h1 class="mt-1 font-display text-3xl font-semibold">${esc(t.name)}</h1>
      <p class="mt-2 text-muted">${esc(t.description)}</p>
      <p class="mt-2 font-semibold">Preview free · ${showPrices() ? `${inr(t.priceInr)} for the HD video` : 'HD video free'}</p>
      ${section('What you can change', `<p class="mt-2 text-muted">${esc(fields.join(' · '))}${t.schema.details.some((f) => f.type === 'photo') ? ' · your photo' : ''}</p>`)}
      ${section('Clips in this video', `<ol class="mt-2 list-decimal pl-5">${t.schema.clips.map((c) => `<li>${esc(c.name)}${c.optional ? ' (optional)' : ''}</li>`).join('')}</ol>`)}
      ${tagLinks(t.tags)}
      ${similar.length ? section('Similar templates', templateList(similar)) : ''}`),
  });
}

// Help
pages.push({
  path: '/help',
  meta: helpMeta(getFaq()),
  body: layout(`
    <h1 class="font-display text-3xl font-semibold">How it works</h1>
    <ol class="mt-3 list-decimal pl-5">
      <li>Pick a design: browse templates and tap one you like.</li>
      <li>Add your details: names, date, venue and a photo. You see the video change as you type.</li>
      <li>Preview and share: watch it free and send the preview link to family.</li>
      <li>Download in HD: pay once and send the video on WhatsApp.</li>
    </ol>
    ${section('Questions', faqHtml(getFaq()))}`),
});

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

// Plain shell for private, per-customer routes: never indexed, never shows another page's content.
const spa = shell
  .replace(/<title>[\s\S]*?<\/title>/, `<title>${SITE_NAME}</title>`)
  .replace('</head>', '    <meta name="robots" content="noindex, nofollow" />\n  </head>');

// Pages are written as <path>.html: with "cleanUrls" (vercel.json) /tags/x is served from tags/x.html
// with no redirect, matching the canonical URL.
for (const p of pages) {
  const file = p.path === '/' ? dist('index.html') : dist(`${p.path.slice(1)}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page(p.meta, p.body));
}
writeFileSync(dist('spa.html'), spa);

// Same rules for Cloudflare Pages, in case the site is ever hosted there (Vercel ignores this file).
writeFileSync(
  dist('_redirects'),
  ['/editor/*  /spa.html  200', '/render/*  /spa.html  200', '/p/*  /spa.html  200', '/account  /spa.html  200', '/my-videos  /spa.html  200', ''].join('\n'),
);

console.log(`prerendered ${pages.length} pages + spa.html + _redirects`);

// Writes public/sitemap.xml and public/robots.txt from the template, category and tag data.
// Runs before every production build (npm run build), so new templates and tags are listed automatically.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { TEMPLATE_METAS } from '../src/templates/metas.ts';
import { CATEGORIES, SITE_URL, TAGS } from '../src/templates/taxonomy.ts';

const TEMPLATES = TEMPLATE_METAS;
const today = new Date().toISOString().slice(0, 10);

type Entry = { path: string; priority: number; changefreq: 'daily' | 'weekly' | 'monthly' };

const entries: Entry[] = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/templates', priority: 0.9, changefreq: 'daily' },
  { path: '/help', priority: 0.5, changefreq: 'monthly' },
  // Only pages that have templates: empty category/tag pages are not worth indexing.
  ...CATEGORIES.filter((c) => TEMPLATES.some((t) => t.category === c.slug)).map(
    (c): Entry => ({ path: `/invitations/${c.slug}`, priority: 0.8, changefreq: 'weekly' }),
  ),
  ...TAGS.filter((tag) => TEMPLATES.some((t) => t.tags.includes(tag.slug))).map(
    (tag): Entry => ({ path: `/tags/${tag.slug}`, priority: 0.7, changefreq: 'weekly' }),
  ),
  ...TEMPLATES.map((t): Entry => ({ path: `/t/${t.slug}`, priority: 0.8, changefreq: 'monthly' })),
];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries.map(
    (e) =>
      `  <url><loc>${SITE_URL}${e.path}</loc><lastmod>${today}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority.toFixed(1)}</priority></url>`,
  ),
  '</urlset>',
  '',
].join('\n');

const robots = [
  'User-agent: *',
  'Allow: /',
  '# Private, per-customer pages',
  'Disallow: /editor/',
  'Disallow: /render/',
  'Disallow: /p/',
  'Disallow: /account',
  'Disallow: /my-videos',
  '',
  `Sitemap: ${SITE_URL}/sitemap.xml`,
  '',
].join('\n');

const pub = (name: string) => fileURLToPath(new URL(`../public/${name}`, import.meta.url));
writeFileSync(pub('sitemap.xml'), xml);
writeFileSync(pub('robots.txt'), robots);
console.log(`sitemap.xml: ${entries.length} URLs · robots.txt written`);

// Build-time catalogue for the sitemap and pre-rendered pages: the code templates with the admin
// panel's published values laid over them (see src/templates/catalogue.ts).
//
// Reads VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY from the environment (Vercel sets them) or, for a
// local `npm run build`, from .env.production. If the database can't be reached the build carries on
// with the code values and prints a warning, so a database outage never blocks a deploy.
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { applyCatalogue, fetchCatalogue } from '../src/templates/catalogue.ts';
import { TEMPLATE_METAS } from '../src/templates/metas.ts';
import type { TemplateMeta } from '../src/templates/types';

const readEnvFile = (name: string): Record<string, string> => {
  const path = fileURLToPath(new URL(`../${name}`, import.meta.url));
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
  return out;
};

const fileEnv = readEnvFile('.env.production');
// The pricing switch (src/lib/pricing.ts) reads process.env during pre-rendering; a local build gets it from .env.production.
if (!process.env.VITE_FREE_HD && fileEnv.VITE_FREE_HD) process.env.VITE_FREE_HD = fileEnv.VITE_FREE_HD;
const url = process.env.VITE_SUPABASE_URL || fileEnv.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || fileEnv.VITE_SUPABASE_ANON_KEY;

const load = async (): Promise<TemplateMeta[]> => {
  const all = TEMPLATE_METAS.map((t) => ({ ...t, tags: [...t.tags] }));
  if (!url || !key) {
    console.warn('catalogue: no Supabase URL/key, using the code values for every template');
    return all;
  }
  try {
    const rows = await fetchCatalogue(url, key, AbortSignal.timeout(10_000));
    const listed = applyCatalogue(all, rows);
    console.log(`catalogue: ${listed.length} of ${all.length} templates published`);
    return listed;
  } catch (e) {
    console.warn(`catalogue: database unreachable (${e instanceof Error ? e.message : e}); using the code values`);
    return all;
  }
};

/** Published templates in store order, with database prices, names and SEO text. */
export const BUILD_TEMPLATES: TemplateMeta[] = await load();

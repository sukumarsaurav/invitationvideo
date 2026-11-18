/**
 * The selling side of the catalogue lives in the database (edited in the admin panel); the animation
 * lives in code. This lays published database rows over the code templates.
 *
 * Used by the app (src/lib/catalogue.ts) and by the build scripts (prerender, sitemap), so it imports
 * types only and runs in Node as well as the browser.
 */
import type { TemplateMeta } from './types';

/** One published template as the public Data API returns it. */
export type CatalogueRow = {
  slug: string;
  name: string;
  description: string;
  price_inr: number;
  tags: string[];
  is_trending: boolean;
  popularity: number;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  categories: { slug: string } | null;
};

const SELECT = 'slug,name,description,price_inr,tags,is_trending,popularity,sort_order,seo_title,seo_description,categories(slug)';

/**
 * Published templates, read as a signed-out visitor so the store shows exactly what customers see.
 * Throws when the database can't be reached; callers then keep the code values.
 */
export const fetchCatalogue = async (url: string, key: string, signal?: AbortSignal): Promise<CatalogueRow[]> => {
  const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/templates?select=${SELECT}&is_active=eq.true`, {
    headers: { apikey: key, 'Accept-Profile': 'invites' },
    signal,
  });
  if (!res.ok) throw new Error(`Catalogue request failed: ${res.status} ${await res.text()}`);
  const rows = (await res.json()) as unknown;
  if (!Array.isArray(rows)) throw new Error('Catalogue response is not a list');
  return rows as CatalogueRow[];
};

/**
 * Copies database values onto the matching code templates (in place) and returns the ones customers
 * may see, in store order. A template with no published row is hidden from listings; it still renders
 * for customers who already have a video on it.
 */
export const applyCatalogue = <T extends TemplateMeta>(all: T[], rows: CatalogueRow[]): T[] => {
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  for (const t of all) {
    const r = bySlug.get(t.slug);
    if (!r) continue;
    t.name = r.name;
    t.description = r.description;
    t.priceInr = r.price_inr;
    t.tags = r.tags ?? [];
    t.trending = r.is_trending;
    t.popularity = r.popularity;
    t.sortOrder = r.sort_order;
    t.seoTitle = r.seo_title || undefined;
    t.seoDescription = r.seo_description || undefined;
    if (r.categories?.slug) t.category = r.categories.slug;
  }
  // Stable sort: equal sort_order keeps the code order.
  return all.filter((t) => bySlug.has(t.slug)).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
};

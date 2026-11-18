/**
 * Titles, descriptions and structured data for every public page.
 * Pure data (no React, no browser APIs, relative `.ts` imports) so the same output is used
 * by the app at runtime (useSeo) and by the build-time pre-renderer (scripts/prerender.ts).
 */
import { CATEGORIES, getCategory, getTag, SITE_URL, TAGS } from '../templates/taxonomy.ts';
import type { TemplateMeta } from '../templates/types';

export type PageMeta = {
  /** Without the site name; it is appended. */
  title: string;
  description: string;
  path: string;
  jsonLd: object[];
  noindex?: boolean;
};

export const SITE_NAME = 'Invitation Videos';

// ---------------------------------------------------------------------------
// schema.org builders
// ---------------------------------------------------------------------------

export const breadcrumbLd = (crumbs: Array<{ name: string; path: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: `${SITE_URL}${c.path}` })),
});

export const itemListLd = (name: string, items: Array<{ name: string; path: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}${it.path}`, name: it.name })),
});

export const faqLd = (faq: Array<[string, string]>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});

// ---------------------------------------------------------------------------
// Shared helpers (also used by the registry)
// ---------------------------------------------------------------------------

export const categoryLabel = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;

export const byPopularity = <T extends TemplateMeta>(list: T[]) => [...list].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));

/** Templates most like this one: shared tags count, same category counts double. */
export const similarTo = <T extends TemplateMeta>(def: TemplateMeta, all: T[], limit = 6): T[] =>
  all
    .filter((t) => t.slug !== def.slug)
    .map((t) => ({ t, score: t.tags.filter((tag) => def.tags.includes(tag)).length + (t.category === def.category ? 2 : 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.t);

const tplItem = (t: TemplateMeta) => ({ name: t.name, path: `/t/${t.slug}` });

// ---------------------------------------------------------------------------
// Page meta
// ---------------------------------------------------------------------------

export const homeMeta = (templates: TemplateMeta[], faq: Array<[string, string]>): PageMeta => ({
  title: 'Video invitation maker for weddings, birthdays and more',
  description:
    'Make a personalised video invitation in minutes. Add names, date, venue and photo, preview free, and download HD for WhatsApp. Wedding, birthday, griha pravesh and more.',
  path: '/',
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: { '@type': 'SearchAction', target: `${SITE_URL}/templates?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
    },
    itemListLd('Popular invitation video templates', byPopularity(templates).map(tplItem)),
    faqLd(faq),
  ],
});

/** /templates (all) or /invitations/<category>. */
export const listingMeta = (templates: TemplateMeta[], categorySlug: string | null): PageMeta => {
  const category = getCategory(categorySlug ?? undefined);
  const list = category ? templates.filter((t) => t.category === category.slug) : templates;
  return {
    title: category ? `${category.name} invitation video templates` : 'All invitation video templates',
    description: category
      ? `${category.blurb} Preview free and download HD.`
      : 'Browse personalised video invitation templates for weddings, birthdays, griha pravesh and more. Preview free, download HD for WhatsApp.',
    path: category ? `/invitations/${category.slug}` : '/templates',
    noindex: categorySlug !== null && !category,
    jsonLd: [
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Templates', path: '/templates' },
        ...(category ? [{ name: `${category.name} invitations`, path: `/invitations/${category.slug}` }] : []),
      ]),
      itemListLd(category ? `${category.name} invitations` : 'All templates', list.map(tplItem)),
    ],
  };
};

export const tagMeta = (templates: TemplateMeta[], tagSlug: string | undefined): PageMeta => {
  const tag = getTag(tagSlug);
  const list = tag ? templates.filter((t) => t.tags.includes(tag.slug)) : [];
  return {
    title: tag ? tag.title : 'Tag not found',
    description: tag ? `${tag.blurb} Preview free and download HD for WhatsApp.` : '',
    path: `/tags/${tagSlug ?? ''}`,
    noindex: !tag || list.length === 0,
    jsonLd: tag
      ? [
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: 'Templates', path: '/templates' },
            { name: tag.title, path: `/tags/${tag.slug}` },
          ]),
          itemListLd(tag.title, list.map(tplItem)),
        ]
      : [],
  };
};

export const templateMeta = (def: TemplateMeta | undefined, slug: string | undefined): PageMeta => {
  if (!def) return { title: 'Template not found', description: '', path: `/t/${slug ?? ''}`, noindex: true, jsonLd: [] };
  const category = categoryLabel(def.category);
  return {
    title: `${def.name} – ${category} invitation video`,
    description: `${def.description} Personalise with your names, date and photo, preview free, and download HD for ₹${def.priceInr}.`,
    path: `/t/${def.slug}`,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: `${def.name} invitation video`,
        description: def.description,
        category: `${category} invitations`,
        image: `${SITE_URL}/icons/icon-512.png`,
        brand: { '@type': 'Brand', name: SITE_NAME },
        offers: { '@type': 'Offer', price: def.priceInr, priceCurrency: 'INR', availability: 'https://schema.org/InStock', url: `${SITE_URL}/t/${def.slug}` },
      },
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: `${category} invitations`, path: `/invitations/${def.category}` },
        { name: def.name, path: `/t/${def.slug}` },
      ]),
    ],
  };
};

export const helpMeta = (faq: Array<[string, string]>): PageMeta => ({
  title: 'How it works and FAQ',
  description: 'How to make a video invitation: pick a design, add your details, preview free, share with family and download HD for WhatsApp.',
  path: '/help',
  jsonLd: [faqLd(faq)],
});

/** Tag slugs used by at least one of these templates, most used first. */
export const usedTags = (templates: TemplateMeta[]) =>
  TAGS.map((tag) => ({ ...tag, count: templates.filter((t) => t.tags.includes(tag.slug)).length }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);

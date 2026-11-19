import { blushFloralWedding } from './blush-floral-wedding';
import { bohoMehndi } from './boho-mehndi';
import { calendarSaveTheDate } from './calendar-save-the-date';
import { champagneReception } from './champagne-reception';
import { dholBeatsSangeet } from './dhol-beats-sangeet';
import { discoNightSangeet } from './disco-night-sangeet';
import { floralArchEngagement } from './floral-arch-engagement';
import { gardenLightsReception } from './garden-lights-reception';
import { hennaMandalaMehndi } from './henna-mandala-mehndi';
import { ivoryMinimalEngagement } from './ivory-minimal-engagement';
import { kalashHaldi } from './kalash-haldi';
import { marigoldHaldi } from './marigold-haldi';
import { marqueeSangeet } from './marquee-sangeet';
import { midnightGoldReception } from './midnight-gold-reception';
import { pastelBirthday } from './pastel-birthday';
import { peacockMehndi } from './peacock-mehndi';
import { polaroidSaveTheDate } from './polaroid-save-the-date';
import { roseGoldRingEngagement } from './rose-gold-ring-engagement';
import { royalWedding } from './royal-wedding';
import { templeBellsWedding } from './temple-bells-wedding';
import { turmericSplashHaldi } from './turmeric-splash-haldi';
import { watercolourSaveTheDate } from './watercolour-save-the-date';
import { byPopularity, similarTo, usedTags } from '../lib/pageMeta.ts';
import { CATEGORIES, inCategory, MAIN_CATEGORIES } from './taxonomy';
import type { TemplateDefinition } from './types';

export { CATEGORIES, TAGS, getCategory, getTag, SITE_URL } from './taxonomy';

/** Every template in the code, published or not: existing drafts and paid videos always render. */
export const ALL_TEMPLATES: TemplateDefinition[] = [
  royalWedding,
  blushFloralWedding,
  templeBellsWedding,
  roseGoldRingEngagement,
  ivoryMinimalEngagement,
  floralArchEngagement,
  calendarSaveTheDate,
  polaroidSaveTheDate,
  watercolourSaveTheDate,
  marigoldHaldi,
  turmericSplashHaldi,
  kalashHaldi,
  hennaMandalaMehndi,
  peacockMehndi,
  bohoMehndi,
  discoNightSangeet,
  dholBeatsSangeet,
  marqueeSangeet,
  midnightGoldReception,
  champagneReception,
  gardenLightsReception,
  pastelBirthday,
];

/**
 * Templates customers can find in the store, in store order. Starts as every code template and is
 * replaced in place by src/lib/catalogue.ts with what the admin panel has published.
 */
export const TEMPLATES: TemplateDefinition[] = [...ALL_TEMPLATES];

export const getTemplate = (slug: string | undefined): TemplateDefinition | undefined =>
  ALL_TEMPLATES.find((t) => t.slug === slug);

/** Published and visible in the store (hidden templates still open in the editor for their owners). */
export const isListed = (slug: string | undefined): boolean => TEMPLATES.some((t) => t.slug === slug);

export const categoryName = (slug: string): string =>
  CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;

import { TAGS } from './taxonomy';
export const tagName = (slug: string): string => TAGS.find((t) => t.slug === slug)?.name ?? slug;

/**
 * Main categories that have at least one template, with counts that include their sub-categories.
 * Empty ones are hidden until templates exist.
 */
export const categoriesWithTemplates = () =>
  MAIN_CATEGORIES.map((c) => ({ ...c, count: TEMPLATES.filter((t) => inCategory(t.category, c.slug)).length })).filter((c) => c.count > 0);

/** Templates on a category's page: its own and, for a main category, its sub-categories'. */
export const templatesIn = (category: string, list: TemplateDefinition[] = TEMPLATES) => list.filter((t) => inCategory(t.category, category));

/** Does the design have a photo slot (in the details or any clip)? */
export const hasPhotoSlot = (def: TemplateDefinition) =>
  def.schema.details.some((f) => f.type === 'photo') || def.schema.clips.some((c) => c.fields.some((f) => f.type === 'photo'));

export type SortKey = 'popular' | 'newest' | 'price-asc' | 'price-desc';

/** A sorted copy. Ties keep store order (the admin panel's sort order). */
export const sortTemplates = (list: TemplateDefinition[], sort: SortKey): TemplateDefinition[] => {
  const copy = [...list];
  if (sort === 'popular') return copy.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
  if (sort === 'newest') return copy.sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
  if (sort === 'price-asc') return copy.sort((a, b) => a.priceInr - b.priceInr);
  return copy.sort((a, b) => b.priceInr - a.priceInr);
};

/** Tags used by at least one template, most used first. */
export const tagsWithTemplates = () => usedTags(TEMPLATES);

export const templatesWithTag = (tag: string) => TEMPLATES.filter((t) => t.tags.includes(tag));

export const trendingTemplates = () => TEMPLATES.filter((t) => t.trending);

export const popularTemplates = () => byPopularity(TEMPLATES);

/** Templates most like this one (shared tags, same category). */
export const similarTemplates = (def: TemplateDefinition, limit = 6) => similarTo(def, TEMPLATES, limit);

/** Simple search across name, category, tags and description; every word must match. */
export const searchTemplates = (query: string, list: TemplateDefinition[] = TEMPLATES) => {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return list;
  return list.filter((t) => {
    const hay = `${t.name} ${categoryName(t.category)} ${t.tags.map(tagName).join(' ')} ${t.description}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
};

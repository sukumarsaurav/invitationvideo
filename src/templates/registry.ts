import { pastelBirthday } from './pastel-birthday';
import { royalWedding } from './royal-wedding';
import { byPopularity, similarTo, usedTags } from '../lib/pageMeta.ts';
import { CATEGORIES } from './taxonomy';
import type { TemplateDefinition } from './types';

export { CATEGORIES, TAGS, getCategory, getTag, SITE_URL } from './taxonomy';

export const TEMPLATES: TemplateDefinition[] = [royalWedding, pastelBirthday];

export const getTemplate = (slug: string | undefined): TemplateDefinition | undefined =>
  TEMPLATES.find((t) => t.slug === slug);

export const categoryName = (slug: string): string =>
  CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;

import { TAGS } from './taxonomy';
export const tagName = (slug: string): string => TAGS.find((t) => t.slug === slug)?.name ?? slug;

/** Categories that have at least one template, with counts. Empty ones are hidden until templates exist. */
export const categoriesWithTemplates = () =>
  CATEGORIES.map((c) => ({ ...c, count: TEMPLATES.filter((t) => t.category === c.slug).length })).filter((c) => c.count > 0);

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

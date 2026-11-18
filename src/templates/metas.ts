/**
 * Data-only list of every template, in catalogue order. Imported by the app's registry and by the
 * Node build scripts (seed, sitemap, prerender), so a new template is added in one place.
 * Relative `.ts` imports keep it runnable in Node.
 */
import { pastelBirthdayMeta } from './pastel-birthday/meta.ts';
import { royalWeddingMeta } from './royal-wedding/meta.ts';
import type { TemplateMeta } from './types';

export const TEMPLATE_METAS: TemplateMeta[] = [royalWeddingMeta, pastelBirthdayMeta];

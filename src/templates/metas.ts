/**
 * Data-only list of every template, in catalogue order. Imported by the app's registry and by the
 * Node build scripts (seed, sitemap, prerender), so a new template is added in one place.
 * Relative `.ts` imports keep it runnable in Node.
 */
import { blushFloralWeddingMeta } from './blush-floral-wedding/meta.ts';
import { calendarSaveTheDateMeta } from './calendar-save-the-date/meta.ts';
import { floralArchEngagementMeta } from './floral-arch-engagement/meta.ts';
import { ivoryMinimalEngagementMeta } from './ivory-minimal-engagement/meta.ts';
import { kalashHaldiMeta } from './kalash-haldi/meta.ts';
import { marigoldHaldiMeta } from './marigold-haldi/meta.ts';
import { pastelBirthdayMeta } from './pastel-birthday/meta.ts';
import { polaroidSaveTheDateMeta } from './polaroid-save-the-date/meta.ts';
import { roseGoldRingEngagementMeta } from './rose-gold-ring-engagement/meta.ts';
import { royalWeddingMeta } from './royal-wedding/meta.ts';
import { templeBellsWeddingMeta } from './temple-bells-wedding/meta.ts';
import { turmericSplashHaldiMeta } from './turmeric-splash-haldi/meta.ts';
import { watercolourSaveTheDateMeta } from './watercolour-save-the-date/meta.ts';
import type { TemplateMeta } from './types';

export const TEMPLATE_METAS: TemplateMeta[] = [
  royalWeddingMeta,
  blushFloralWeddingMeta,
  templeBellsWeddingMeta,
  roseGoldRingEngagementMeta,
  ivoryMinimalEngagementMeta,
  floralArchEngagementMeta,
  calendarSaveTheDateMeta,
  polaroidSaveTheDateMeta,
  watercolourSaveTheDateMeta,
  marigoldHaldiMeta,
  turmericSplashHaldiMeta,
  kalashHaldiMeta,
  pastelBirthdayMeta,
];

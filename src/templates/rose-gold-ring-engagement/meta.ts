import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const roseGoldRingEngagementMeta: TemplateMeta = {
  slug: 'rose-gold-ring-engagement',
  name: 'Rose Gold Rings Engagement',
  category: 'engagement',
  description: 'Plum and rose gold engagement invitation where two rings draw themselves in, with twinkling sparkles.',
  priceInr: 399,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#3A1B2B', '#EBB8A3'],
  tags: ['modern', 'with-photo', 'whatsapp-invite'],
  popularity: 66,
  schema: eventSchema({
    wording: {
      blessing: 'TOGETHER WITH THEIR FAMILIES',
      line1: 'Engagement',
      line2: 'CEREMONY',
      connector: '&',
      tagline: 'are getting engaged',
      event: 'Ring Ceremony',
      invite: 'Please join us as we exchange rings',
    },
    dateLabel: 'Engagement date',
    examples: { venue: 'The Orchid Banquet', city: 'Lucknow, Uttar Pradesh' },
    photo: { shape: 'circle', aspectRatio: 1 },
  }),
};

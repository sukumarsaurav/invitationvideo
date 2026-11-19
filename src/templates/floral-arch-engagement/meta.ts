import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const floralArchEngagementMeta: TemplateMeta = {
  slug: 'floral-arch-engagement',
  name: 'Floral Arch Engagement',
  category: 'engagement',
  description: 'Sage green engagement invitation framed by a leafy floral arch, with an arch-shaped couple photo.',
  priceInr: 399,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#E6EDE2', '#6F8A69'],
  tags: ['floral', 'pastel', 'with-photo', 'whatsapp-invite'],
  popularity: 64,
  schema: eventSchema({
    wording: {
      blessing: 'SAGAI',
      line1: 'Engagement',
      line2: 'CEREMONY',
      connector: '&',
      tagline: 'are getting engaged',
      event: 'Ring Ceremony',
      invite: 'With love, please celebrate with',
    },
    dateLabel: 'Engagement date',
    examples: { venue: 'Green Leaf Lawns', city: 'Indore, Madhya Pradesh', time: '6:00 PM onwards' },
    photo: { shape: 'arch', aspectRatio: 0.8 },
  }),
};

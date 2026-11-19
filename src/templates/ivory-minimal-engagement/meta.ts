import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const ivoryMinimalEngagementMeta: TemplateMeta = {
  slug: 'ivory-minimal-engagement',
  name: 'Ivory Minimal Engagement',
  category: 'engagement',
  description: 'Clean ivory engagement invitation with fine lines, classic serif type and a framed photo.',
  priceInr: 349,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#F7F3EC', '#B79C6B'],
  tags: ['modern', 'with-photo', 'whatsapp-invite'],
  popularity: 60,
  schema: eventSchema({
    wording: {
      blessing: 'YOU ARE INVITED TO THE',
      line1: 'Engagement',
      line2: 'CELEBRATION',
      connector: 'AND',
      event: 'The Engagement',
      invite: 'Kindly join us for the celebration',
    },
    dateLabel: 'Engagement date',
    examples: { venue: 'The Courtyard, Taj', city: 'Mumbai, Maharashtra', time: '7:30 PM' },
    photo: { shape: 'rect', aspectRatio: 0.8 },
  }),
};

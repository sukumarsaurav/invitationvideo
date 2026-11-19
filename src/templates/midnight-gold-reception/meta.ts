import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const midnightGoldReceptionMeta: TemplateMeta = {
  slug: 'midnight-gold-reception',
  name: 'Midnight Navy Reception',
  category: 'reception',
  description: 'Elegant navy and gold reception invitation with art-deco fans and a starry sky.',
  priceInr: 449,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#0B1D3A', '#D4AF6A'],
  tags: ['royal', 'modern', 'with-photo', 'whatsapp-invite'],
  popularity: 66,
  schema: eventSchema({
    wording: {
      blessing: 'TOGETHER WITH THEIR FAMILIES',
      line1: 'Reception',
      line2: 'DINNER & CELEBRATION',
      connector: '&',
      event: 'Wedding Reception',
      invite: 'With love, your hosts',
    },
    dateLabel: 'Reception date',
    examples: { date: 'Monday, 15 February 2027', time: '8:00 PM onwards', venue: 'The Leela Ballroom', city: 'Bengaluru, Karnataka' },
    photo: { shape: 'arch', aspectRatio: 0.8 },
  }),
};

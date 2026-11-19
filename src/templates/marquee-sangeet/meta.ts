import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const marqueeSangeetMeta: TemplateMeta = {
  slug: 'marquee-sangeet',
  name: 'Bollywood Marquee Sangeet',
  category: 'sangeet',
  description: 'Filmi sangeet invitation: red curtains part to reveal a marquee sign with chasing bulbs, and your names star.',
  priceInr: 399,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#6A040F', '#F4C430'],
  tags: ['party', 'royal', 'with-photo', 'whatsapp-invite'],
  popularity: 66,
  schema: eventSchema({
    wording: {
      blessing: 'PRESENTING',
      line1: 'SANGEET',
      line2: 'A BOLLYWOOD NIGHT',
      connector: '&',
      tagline: 'in their biggest blockbuster',
      event: 'Showtime',
      note: 'Dress code: Bollywood glam',
      invite: 'Proudly presented by',
    },
    dateLabel: 'Sangeet date',
    examples: { date: 'Friday, 12 February 2027', time: '8:00 PM onwards', venue: 'Regal Theatre Lawns', city: 'Mumbai, Maharashtra', families: 'The Malhotra & Khanna Families' },
    photo: { shape: 'rect', aspectRatio: 0.8 },
  }),
};

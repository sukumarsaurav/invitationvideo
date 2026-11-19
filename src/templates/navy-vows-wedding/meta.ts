import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const navyVowsWeddingMeta: TemplateMeta = {
  slug: 'navy-vows-wedding',
  name: 'Classic Navy Vows',
  category: 'wedding',
  description: 'Formal navy and gold Christian wedding invitation with a filigree frame, a small cross and classic wording.',
  priceInr: 449,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#14213D', '#D4AF6A'],
  tags: ['christian-wedding', 'royal', 'with-photo', 'whatsapp-invite'],
  popularity: 58,
  schema: eventSchema({
    wording: {
      blessing: 'THE HONOUR OF YOUR PRESENCE',
      line1: 'Wedding',
      line2: 'HOLY MATRIMONY',
      connector: 'AND',
      tagline: 'joined in marriage',
      event: 'Nuptial Mass',
      invite: 'Requested by',
    },
    dateLabel: 'Wedding date',
    examples: {
      bride: 'Rachel',
      groom: 'Samuel',
      date: 'Saturday, 11 December 2027',
      time: '11:00 AM',
      venue: "St. Mary's Church",
      city: 'Kochi, Kerala',
      families: 'The Thomas & Mathew Families',
    },
    photo: { shape: 'rect', aspectRatio: 0.8 },
  }),
};

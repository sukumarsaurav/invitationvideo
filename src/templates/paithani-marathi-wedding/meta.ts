import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const paithaniMarathiWeddingMeta: TemplateMeta = {
  slug: 'paithani-marathi-wedding',
  name: 'Paithani Shubhmangal',
  category: 'wedding',
  description: 'Marathi wedding invitation in paithani purple and green, with a gold zari border of peacocks and lotus.',
  priceInr: 449,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#4A1A5C', '#E3B04B'],
  tags: ['marathi-wedding', 'hindu-wedding', 'traditional', 'with-photo', 'whatsapp-invite'],
  popularity: 64,
  schema: eventSchema({
    wording: {
      blessing: 'SHUBHMANGAL SAVDHAN',
      line1: 'Lagna',
      line2: 'WEDDING INVITATION',
      connector: '&',
      event: 'Shubh Vivah',
      invite: 'With warm regards, the families of',
    },
    dateLabel: 'Wedding date',
    examples: {
      bride: 'Gauri',
      groom: 'Aditya',
      date: 'Sunday, 14 February 2027',
      time: 'Muhurta 12:35 PM',
      venue: 'Shivaji Mandir Hall',
      city: 'Pune, Maharashtra',
      families: 'The Deshpande & Kulkarni Families',
    },
    photo: { shape: 'arch', aspectRatio: 0.8 },
  }),
};

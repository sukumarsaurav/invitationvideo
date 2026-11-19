import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const roseJaaliNikahMeta: TemplateMeta = {
  slug: 'rose-jaali-nikah',
  name: 'Rose Jaali Nikah',
  category: 'wedding',
  description: 'Soft blush nikah invitation with a rose-gold jaali screen, arched window and roses.',
  priceInr: 399,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#F9ECE8', '#B76E79'],
  tags: ['muslim-wedding', 'floral', 'pastel', 'with-photo', 'whatsapp-invite'],
  popularity: 58,
  schema: eventSchema({
    wording: {
      blessing: 'IN THE NAME OF ALLAH',
      line1: 'Nikah',
      line2: 'INVITATION',
      connector: '&',
      tagline: 'are getting married',
      event: 'Nikah Ceremony',
      invite: 'With love and duas from',
    },
    dateLabel: 'Nikah date',
    examples: {
      bride: 'Zoya',
      groom: 'Faizan',
      date: 'Saturday, 6 March 2027',
      time: 'After Asr prayers',
      venue: 'Noor Mahal Banquets',
      city: 'Lucknow, Uttar Pradesh',
      families: 'The Qureshi & Ansari Families',
    },
    photo: { shape: 'arch', aspectRatio: 0.8 },
  }),
};

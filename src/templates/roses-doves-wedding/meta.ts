import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const rosesDovesWeddingMeta: TemplateMeta = {
  slug: 'roses-doves-wedding',
  name: 'White Roses & Doves',
  category: 'wedding',
  description: 'Garden Christian wedding invitation with white roses, eucalyptus and two doves that meet in a heart.',
  priceInr: 399,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#EEF2EC', '#7D9A82'],
  tags: ['christian-wedding', 'floral', 'pastel', 'with-photo', 'whatsapp-invite'],
  popularity: 60,
  schema: eventSchema({
    wording: {
      blessing: 'TWO HEARTS, ONE LOVE',
      line1: 'Wedding',
      line2: 'CELEBRATION',
      connector: '&',
      tagline: 'are getting married',
      event: 'The Wedding',
      invite: 'With joy, the families of',
    },
    dateLabel: 'Wedding date',
    examples: {
      bride: 'Maria',
      groom: 'Daniel',
      date: 'Saturday, 15 May 2027',
      time: '5:00 PM',
      venue: 'Our Lady of Fatima Church',
      city: 'Goa',
      families: 'The Pereira & Rodrigues Families',
    },
    photo: { shape: 'circle', aspectRatio: 1 },
  }),
};

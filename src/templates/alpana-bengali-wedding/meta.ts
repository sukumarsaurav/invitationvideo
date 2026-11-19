import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const alpanaBengaliWeddingMeta: TemplateMeta = {
  slug: 'alpana-bengali-wedding',
  name: 'Alpana Shubho Bibaho',
  category: 'wedding',
  description: 'Bengali wedding invitation in lal-paar red and white, with an alpana that draws itself and conch shells.',
  priceInr: 449,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#FFF8F0', '#B71C1C'],
  tags: ['bengali-wedding', 'hindu-wedding', 'traditional', 'with-photo', 'whatsapp-invite'],
  popularity: 66,
  schema: eventSchema({
    wording: {
      blessing: 'SHUBHO BIBAHO',
      line1: 'Wedding',
      line2: 'INVITATION',
      connector: '&',
      event: 'Shubho Bibaho',
      invite: 'With blessings, the families of',
    },
    dateLabel: 'Wedding date',
    examples: {
      bride: 'Ananya',
      groom: 'Arnab',
      date: 'Friday, 5 March 2027',
      time: 'Lagna 7:30 PM',
      venue: 'Rabindra Bhavan',
      city: 'Kolkata, West Bengal',
      families: 'The Banerjee & Sen Families',
    },
    photo: { shape: 'arch', aspectRatio: 0.8 },
  }),
};

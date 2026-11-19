import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const mundavalyaMarathiWeddingMeta: TemplateMeta = {
  slug: 'mundavalya-marathi-wedding',
  name: 'Mundavalya Lagna',
  category: 'wedding',
  description: 'Marathi lagna invitation with swaying mundavalya pearl strings, a mango-leaf toran and green bangles.',
  priceInr: 399,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#FFF6E6', '#0F6B3E'],
  tags: ['marathi-wedding', 'hindu-wedding', 'traditional', 'with-photo', 'whatsapp-invite'],
  popularity: 60,
  schema: eventSchema({
    wording: {
      blessing: 'SHREE GANESHAY NAMAH',
      line1: 'Shubh Vivah',
      line2: 'LAGNA PATRIKA',
      connector: '&',
      tagline: 'are tying the knot',
      event: 'Lagna Sohala',
      invite: 'With love, the families of',
    },
    dateLabel: 'Wedding date',
    examples: {
      bride: 'Sayali',
      groom: 'Omkar',
      date: 'Saturday, 20 February 2027',
      time: 'Muhurta 11:45 AM',
      venue: 'Sahyadri Mangal Karyalay',
      city: 'Nashik, Maharashtra',
      families: 'The Patil & Jadhav Families',
    },
    photo: { shape: 'circle', aspectRatio: 1 },
  }),
};

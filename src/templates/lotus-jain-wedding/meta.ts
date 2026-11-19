import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const lotusJainWeddingMeta: TemplateMeta = {
  slug: 'lotus-jain-wedding',
  name: 'Jai Jinendra Lotus',
  category: 'wedding',
  description: 'Serene Jain wedding invitation in white and saffron, where a lotus opens on still water.',
  priceInr: 449,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#FFF9F0', '#E8833A'],
  tags: ['jain-wedding', 'traditional', 'pastel', 'with-photo', 'whatsapp-invite'],
  popularity: 60,
  schema: eventSchema({
    wording: {
      blessing: 'JAI JINENDRA',
      line1: 'Wedding',
      line2: 'INVITATION',
      connector: 'WEDS',
      event: 'Lagna Vidhi',
      invite: 'With blessings, the families of',
    },
    dateLabel: 'Wedding date',
    examples: {
      bride: 'Khushi',
      groom: 'Parth',
      date: 'Sunday, 21 February 2027',
      time: '11:00 AM onwards',
      venue: 'Jain Bhawan',
      city: 'Ahmedabad, Gujarat',
      families: 'The Shah & Mehta Families',
    },
    photo: { shape: 'circle', aspectRatio: 1 },
  }),
};

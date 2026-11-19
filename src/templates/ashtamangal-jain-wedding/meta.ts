import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const ashtamangalJainWeddingMeta: TemplateMeta = {
  slug: 'ashtamangal-jain-wedding',
  name: 'Mangal Kalash Jain Wedding',
  category: 'wedding',
  description: 'Rich red and gold Jain wedding invitation framed by auspicious signs: kalash, twin fish, mirror and lotus.',
  priceInr: 499,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#7A0F1E', '#E9C46A'],
  tags: ['jain-wedding', 'royal', 'traditional', 'with-photo', 'whatsapp-invite'],
  popularity: 56,
  schema: eventSchema({
    wording: {
      blessing: 'JAI JINENDRA',
      line1: 'Wedding',
      line2: 'INVITATION',
      connector: 'WEDS',
      event: 'Pheras & Lagna',
      invite: 'Awaiting your blessings,',
    },
    dateLabel: 'Wedding date',
    examples: {
      bride: 'Disha',
      groom: 'Siddharth',
      date: 'Thursday, 11 February 2027',
      time: '7:00 PM onwards',
      venue: 'Shanti Lawns',
      city: 'Indore, Madhya Pradesh',
      families: 'The Jain & Lodha Families',
    },
    photo: { shape: 'circle', aspectRatio: 1 },
  }),
};

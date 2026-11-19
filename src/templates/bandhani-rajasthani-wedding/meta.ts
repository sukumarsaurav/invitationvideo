import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const bandhaniRajasthaniWeddingMeta: TemplateMeta = {
  slug: 'bandhani-rajasthani-wedding',
  name: 'Bandhani Leheriya',
  category: 'wedding',
  description: 'Rajasthani wedding invitation in bandhani red with tie-dye dot flowers and rippling leheriya stripes.',
  priceInr: 449,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#B3122E', '#F9C80E'],
  tags: ['rajasthani-wedding', 'hindu-wedding', 'traditional', 'with-photo', 'whatsapp-invite'],
  popularity: 62,
  schema: eventSchema({
    wording: {
      blessing: 'SHREE GANESHAYA NAMAH',
      line1: 'Shubh Vivah',
      line2: 'WEDDING INVITATION',
      connector: '&',
      event: 'Pheras',
      invite: 'With love, the families of',
    },
    dateLabel: 'Wedding date',
    examples: {
      bride: 'Pooja',
      groom: 'Kunal',
      date: 'Sunday, 28 February 2027',
      time: '9:00 PM onwards',
      venue: 'Umaid Bhawan Lawns',
      city: 'Jodhpur, Rajasthan',
      families: 'The Agarwal & Maheshwari Families',
    },
    photo: { shape: 'circle', aspectRatio: 1 },
  }),
};

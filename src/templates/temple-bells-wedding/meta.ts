import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const templeBellsWeddingMeta: TemplateMeta = {
  slug: 'temple-bells-wedding',
  name: 'Temple Bells South Indian Wedding',
  category: 'wedding',
  description: 'Emerald and gold South Indian wedding invitation with swinging temple bells, a gopuram and kolam border.',
  priceInr: 499,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#0F4A39', '#D9B45A'],
  tags: ['south-indian-wedding', 'traditional', 'with-photo', 'whatsapp-invite'],
  popularity: 68,
  schema: eventSchema({
    wording: {
      blessing: 'SHUBHA MUHURTHAM',
      line1: 'Wedding',
      line2: 'INVITATION',
      connector: 'WEDS',
      event: 'Muhurtham',
      invite: 'With the blessings of our elders',
    },
    dateLabel: 'Wedding date',
    examples: {
      bride: 'Meenakshi',
      groom: 'Karthik',
      date: 'Sunday, 7 March 2027',
      time: '9:30 AM onwards',
      venue: 'Sri Kalyana Mandapam',
      city: 'Chennai, Tamil Nadu',
      families: 'The Iyer & Reddy Families',
    },
    photo: { shape: 'arch', aspectRatio: 0.8 },
  }),
};

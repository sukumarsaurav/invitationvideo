import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const lanternWalimaMeta: TemplateMeta = {
  slug: 'lantern-walima',
  name: 'Lantern Night Walima',
  category: 'reception',
  description: 'Walima reception invitation under a midnight sky of glowing, swaying lanterns and a crescent moon.',
  priceInr: 449,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#121A3A', '#F2B950'],
  tags: ['muslim-wedding', 'royal', 'with-photo', 'whatsapp-invite'],
  popularity: 62,
  schema: eventSchema({
    wording: {
      blessing: 'ALHAMDULILLAH',
      line1: 'Walima',
      line2: 'DINNER RECEPTION',
      connector: '&',
      event: 'Dawat-e-Walima',
      invite: 'Your presence is our honour.',
    },
    dateLabel: 'Walima date',
    examples: {
      bride: 'Ayesha',
      groom: 'Imran',
      date: 'Sunday, 28 February 2027',
      time: '8:00 PM onwards',
      venue: 'Falaknuma Lawns',
      city: 'Hyderabad, Telangana',
      families: 'The Khan & Siddiqui Families',
    },
    photo: { shape: 'arch', aspectRatio: 0.8 },
  }),
};

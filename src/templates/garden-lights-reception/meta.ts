import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const gardenLightsReceptionMeta: TemplateMeta = {
  slug: 'garden-lights-reception',
  name: 'Garden Lights Reception',
  category: 'reception',
  description: 'Evening garden reception invitation with twinkling string lights, fireflies and hanging greenery.',
  priceInr: 399,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#0E2A1F', '#F6D28B'],
  tags: ['floral', 'modern', 'with-photo', 'whatsapp-invite'],
  popularity: 62,
  schema: eventSchema({
    wording: {
      blessing: 'AN EVENING UNDER THE STARS',
      line1: 'Reception',
      line2: 'GARDEN PARTY',
      connector: '&',
      event: 'Wedding Reception',
      invite: 'With love and best wishes from',
    },
    dateLabel: 'Reception date',
    examples: { date: 'Monday, 15 February 2027', time: '7:00 PM onwards', venue: 'The Orchard Gardens', city: 'Chandigarh' },
    photo: { shape: 'circle', aspectRatio: 1 },
  }),
};

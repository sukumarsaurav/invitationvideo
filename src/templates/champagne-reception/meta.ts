import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const champagneReceptionMeta: TemplateMeta = {
  slug: 'champagne-reception',
  name: 'Champagne Toast Reception',
  category: 'reception',
  description: 'Champagne-gold reception invitation that opens with two glasses clinking, with rising bubbles throughout.',
  priceInr: 399,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#F5E9D7', '#9C7A3C'],
  tags: ['modern', 'with-photo', 'whatsapp-invite'],
  popularity: 60,
  schema: eventSchema({
    wording: {
      blessing: 'PLEASE JOIN US FOR THE',
      line1: 'Reception',
      line2: 'TO CELEBRATE LOVE',
      connector: '&',
      event: 'Reception Dinner',
      invite: 'Cheers to love! Hosted by',
    },
    dateLabel: 'Reception date',
    examples: { date: 'Monday, 15 February 2027', time: '7:30 PM onwards', venue: 'The Westin Grand', city: 'Hyderabad, Telangana' },
    photo: { shape: 'circle', aspectRatio: 1 },
  }),
};

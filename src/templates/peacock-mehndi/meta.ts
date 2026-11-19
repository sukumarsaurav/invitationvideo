import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const peacockMehndiMeta: TemplateMeta = {
  slug: 'peacock-mehndi',
  name: 'Peacock Mehndi Night',
  category: 'mehndi',
  description: 'Teal and gold mehndi night invitation where a fan of peacock feathers opens under your names.',
  priceInr: 349,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#0A3D4F', '#E9C46A'],
  tags: ['royal', 'traditional', 'with-photo', 'whatsapp-invite'],
  popularity: 64,
  schema: eventSchema({
    wording: {
      blessing: 'YOU ARE INVITED TO A',
      line1: 'Mehndi',
      line2: 'NIGHT',
      connector: '&',
      event: 'Mehndi Night',
      note: 'Dress code: peacock blues & greens',
      invite: 'With love and colour from',
    },
    dateLabel: 'Mehndi date',
    hostsLabel: 'Hosted by (family names)',
    groomOptional: true,
    examples: { date: 'Thursday, 11 February 2027', time: '7:00 PM onwards', venue: 'Mayur Mahal', city: 'Jodhpur, Rajasthan', families: 'The Rathore Family' },
    photo: { shape: 'arch', aspectRatio: 0.8 },
  }),
};

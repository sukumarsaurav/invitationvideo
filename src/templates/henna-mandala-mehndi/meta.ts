import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const hennaMandalaMehndiMeta: TemplateMeta = {
  slug: 'henna-mandala-mehndi',
  name: 'Henna Mandala Mehndi',
  category: 'mehndi',
  description: 'Deep green mehndi invitation with a slowly turning henna mandala and paisley corners in gold.',
  priceInr: 299,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#123F30', '#C8743A'],
  tags: ['hindu-wedding', 'traditional', 'with-photo', 'whatsapp-invite'],
  popularity: 66,
  schema: eventSchema({
    wording: {
      blessing: 'SHUBH VIVAH',
      line1: 'Mehndi',
      line2: 'CEREMONY',
      connector: '&',
      event: 'Mehndi Ceremony',
      note: 'Dress code: shades of green',
      invite: 'Join us for henna, music & love',
    },
    dateLabel: 'Mehndi date',
    hostsLabel: 'Hosted by (family names)',
    groomOptional: true,
    examples: { date: 'Thursday, 11 February 2027', time: '4:00 PM onwards', venue: 'Rose Garden Lawns', families: 'The Sharma Family' },
    photo: { shape: 'circle', aspectRatio: 1 },
  }),
};

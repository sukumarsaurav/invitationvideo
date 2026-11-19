import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const kalashHaldiMeta: TemplateMeta = {
  slug: 'kalash-haldi',
  name: 'Kalash & Rangoli Haldi',
  category: 'haldi',
  description: 'Traditional haldi invitation with a mango-leaf toran, a turning rangoli and a kalash, in turmeric and maroon.',
  priceInr: 299,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#FFF1C1', '#7A1F2B'],
  tags: ['hindu-wedding', 'traditional', 'with-photo', 'whatsapp-invite'],
  popularity: 60,
  schema: eventSchema({
    wording: {
      blessing: 'SHREE GANESHAYA NAMAH',
      line1: 'Haldi',
      line2: 'CEREMONY',
      connector: '&',
      event: 'Haldi Rasam',
      note: 'Dress code: yellow & green',
      invite: 'With warm wishes and blessings from',
    },
    dateLabel: 'Haldi date',
    hostsLabel: 'Hosted by (family names)',
    groomOptional: true,
    examples: { date: 'Friday, 12 February 2027', time: '9:00 AM onwards', venue: 'Verma Bhawan', city: 'Varanasi, Uttar Pradesh', families: 'The Verma Family' },
    photo: { shape: 'arch', aspectRatio: 0.8 },
  }),
};

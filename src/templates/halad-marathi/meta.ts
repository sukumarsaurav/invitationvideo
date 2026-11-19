import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const haladMarathiMeta: TemplateMeta = {
  slug: 'halad-marathi',
  name: 'Halad Kunku',
  category: 'haldi',
  description: 'Marathi halad invitation in turmeric yellow with kunku-red dots, a brass ghangal and green chuda.',
  priceInr: 299,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#FFD54F', '#B71C1C'],
  tags: ['marathi-wedding', 'hindu-wedding', 'traditional', 'with-photo', 'whatsapp-invite'],
  popularity: 56,
  schema: eventSchema({
    wording: {
      blessing: 'SHUBH VIVAH',
      line1: 'Halad',
      line2: 'SAMARAMBH',
      connector: '&',
      event: 'Haldi Samarambh',
      note: 'Dress code: yellow & green',
      invite: 'Come, apply some halad! With love,',
    },
    dateLabel: 'Haldi date',
    hostsLabel: 'Hosted by (family names)',
    groomOptional: true,
    examples: {
      bride: 'Sayali',
      groom: 'Omkar',
      date: 'Friday, 19 February 2027',
      time: '9:00 AM onwards',
      venue: 'Patil Wada',
      city: 'Kolhapur, Maharashtra',
      families: 'The Patil Family',
    },
    photo: { shape: 'circle', aspectRatio: 1 },
  }),
};

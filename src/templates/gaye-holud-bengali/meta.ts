import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const gayeHoludBengaliMeta: TemplateMeta = {
  slug: 'gaye-holud-bengali',
  name: 'Gaye Holud',
  category: 'haldi',
  description: 'Bengali gaye holud invitation in turmeric yellow and red, with a pair of auspicious fish and swaying rajnigandha.',
  priceInr: 299,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#FFD44D', '#C62828'],
  tags: ['bengali-wedding', 'hindu-wedding', 'traditional', 'with-photo', 'whatsapp-invite'],
  popularity: 58,
  schema: eventSchema({
    wording: {
      blessing: 'SHUBHO',
      line1: 'Gaye Holud',
      line2: 'TURMERIC CEREMONY',
      connector: '&',
      event: 'Gaye Holud',
      note: 'Dress code: yellow & red',
      invite: 'Come smear some holud! With love,',
    },
    dateLabel: 'Haldi date',
    hostsLabel: 'Hosted by (family names)',
    groomOptional: true,
    examples: {
      bride: 'Ananya',
      groom: 'Arnab',
      date: 'Thursday, 4 March 2027',
      time: '10:00 AM onwards',
      venue: 'Banerjee Bari',
      city: 'Kolkata, West Bengal',
      families: 'The Banerjee Family',
    },
    photo: { shape: 'circle', aspectRatio: 1 },
  }),
};

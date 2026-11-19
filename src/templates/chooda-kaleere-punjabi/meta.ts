import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const choodaKaleerePunjabiMeta: TemplateMeta = {
  slug: 'chooda-kaleere-punjabi',
  name: 'Chooda & Kaleere',
  category: 'mehndi',
  description: 'Punjabi chooda and mehndi invitation with stacked red bangles and golden kaleere that swing and shimmer.',
  priceInr: 349,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#FDEBEA', '#C8102E'],
  tags: ['punjabi-wedding', 'traditional', 'with-photo', 'whatsapp-invite'],
  popularity: 60,
  schema: eventSchema({
    wording: {
      blessing: 'SHAGNA DA VELA',
      line1: 'Chooda',
      line2: 'CEREMONY & MEHNDI',
      connector: '&',
      event: 'Chooda & Mehndi',
      note: 'Dress code: pinks & greens',
      invite: 'With love and laughter from',
    },
    dateLabel: 'Ceremony date',
    hostsLabel: 'Hosted by (family names)',
    groomOptional: true,
    examples: {
      bride: 'Simran',
      groom: 'Harpreet',
      date: 'Saturday, 13 March 2027',
      time: '9:00 AM onwards',
      venue: 'Sandhu Haveli',
      city: 'Jalandhar, Punjab',
      families: 'The Sandhu Family',
    },
    photo: { shape: 'arch', aspectRatio: 0.8 },
  }),
};

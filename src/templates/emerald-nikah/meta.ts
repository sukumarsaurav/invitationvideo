import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const emeraldNikahMeta: TemplateMeta = {
  slug: 'emerald-nikah',
  name: 'Emerald Nikah',
  category: 'wedding',
  description: 'Nikah invitation in emerald and gold, framed by a Mughal arch with a crescent moon and glowing lanterns.',
  priceInr: 449,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#0B4D3B', '#E2C275'],
  tags: ['muslim-wedding', 'royal', 'traditional', 'with-photo', 'whatsapp-invite'],
  popularity: 66,
  schema: eventSchema({
    wording: {
      blessing: 'BISMILLAHIR RAHMANIR RAHEEM',
      line1: 'Nikah',
      line2: 'CEREMONY',
      connector: '&',
      tagline: "Insha'Allah",
      event: 'Nikah',
      invite: 'With duas, you are invited by',
    },
    dateLabel: 'Nikah date',
    examples: {
      bride: 'Ayesha',
      groom: 'Imran',
      date: 'Friday, 26 February 2027',
      time: 'After Isha prayers',
      venue: 'Taj Banquet Hall',
      city: 'Hyderabad, Telangana',
      families: 'The Khan & Siddiqui Families',
    },
    photo: { shape: 'arch', aspectRatio: 0.8 },
  }),
};

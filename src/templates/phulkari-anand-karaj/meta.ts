import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const phulkariAnandKarajMeta: TemplateMeta = {
  slug: 'phulkari-anand-karaj',
  name: 'Phulkari Anand Karaj',
  category: 'wedding',
  description: 'Anand Karaj invitation in phulkari colours: embroidered borders of bright geometric flowers on deep red.',
  priceInr: 449,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#8C1022', '#F6A623'],
  tags: ['punjabi-wedding', 'traditional', 'with-photo', 'whatsapp-invite'],
  popularity: 66,
  schema: eventSchema({
    wording: {
      blessing: 'BY THE GRACE OF WAHEGURU',
      line1: 'Anand Karaj',
      line2: 'WEDDING CEREMONY',
      connector: '&',
      event: 'Anand Karaj',
      invite: 'With love and blessings from',
    },
    dateLabel: 'Wedding date',
    examples: {
      bride: 'Simran',
      groom: 'Harpreet',
      date: 'Sunday, 14 March 2027',
      time: '10:00 AM onwards',
      venue: 'Gurudwara Singh Sabha',
      city: 'Ludhiana, Punjab',
      families: 'The Gill & Sandhu Families',
    },
    photo: { shape: 'arch', aspectRatio: 0.8 },
  }),
};

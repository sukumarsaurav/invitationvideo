import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const blushFloralWeddingMeta: TemplateMeta = {
  slug: 'blush-floral-wedding',
  name: 'Blush Floral Wedding',
  category: 'wedding',
  description: 'Soft blush wedding invitation with painted flowers, drifting petals and a round couple photo.',
  priceInr: 499,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#FBE3E6', '#C76D7E'],
  tags: ['hindu-wedding', 'floral', 'pastel', 'with-photo', 'whatsapp-invite'],
  popularity: 72,
  schema: eventSchema({
    wording: {
      blessing: 'SHUBH VIVAH',
      line1: 'Wedding',
      line2: 'INVITATION',
      connector: '&',
      event: 'Wedding Ceremony',
      invite: 'With love and blessings from',
    },
    dateLabel: 'Wedding date',
    photo: { shape: 'circle', aspectRatio: 1 },
  }),
};

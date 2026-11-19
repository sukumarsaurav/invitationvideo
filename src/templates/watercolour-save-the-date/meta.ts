import { saveTheDateSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const watercolourSaveTheDateMeta: TemplateMeta = {
  slug: 'watercolour-save-the-date',
  name: 'Watercolour Blue Save the Date',
  category: 'save-the-date',
  description: 'Dreamy dusty-blue watercolour save the date with drifting washes, gold sparkle and a round photo.',
  priceInr: 299,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#DCE6F0', '#5B7FA6'],
  tags: ['pastel', 'modern', 'with-photo', 'whatsapp-invite'],
  popularity: 56,
  schema: saveTheDateSchema({
    wording: {
      blessing: 'PLEASE SAVE THE DATE',
      line1: 'Save the Date',
      line2: 'WE ARE GETTING MARRIED',
      connector: '&',
      event: 'Wedding Day',
      invite: 'Formal invitation to follow',
    },
    examples: { city: 'Udaipur, Rajasthan' },
    photo: { shape: 'circle', aspectRatio: 1 },
  }),
};

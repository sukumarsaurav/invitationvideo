import { saveTheDateSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const polaroidSaveTheDateMeta: TemplateMeta = {
  slug: 'polaroid-save-the-date',
  name: 'Polaroid Save the Date',
  category: 'save-the-date',
  description: 'Playful save the date on kraft paper: your photo drops in as a taped polaroid with your names written below.',
  priceInr: 299,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#D9C3A5', '#A8432F'],
  tags: ['modern', 'with-photo', 'whatsapp-invite'],
  popularity: 58,
  schema: saveTheDateSchema({
    wording: {
      blessing: 'MARK YOUR CALENDARS',
      line1: 'Save the Date',
      line2: 'FOR OUR WEDDING',
      connector: '&',
      tagline: 'are getting married!',
      event: 'Our Wedding',
      invite: 'Formal invitation to follow',
    },
    examples: { date: '13 . 02 . 2027', city: 'Goa' },
    photo: { shape: 'rect', aspectRatio: 1 },
  }),
};

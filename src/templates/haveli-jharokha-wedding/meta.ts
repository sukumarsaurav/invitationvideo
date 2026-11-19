import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const haveliJharokhaWeddingMeta: TemplateMeta = {
  slug: 'haveli-jharokha-wedding',
  name: 'Haveli Jharokha',
  category: 'wedding',
  description: 'Rajasthani wedding invitation framed by a pink-city haveli: carved jharokhas, chhatri domes and marigolds.',
  priceInr: 499,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#E8A598', '#7A2E3A'],
  tags: ['rajasthani-wedding', 'hindu-wedding', 'royal', 'with-photo', 'whatsapp-invite'],
  popularity: 66,
  schema: eventSchema({
    wording: {
      blessing: 'PADHARO MHARE DES',
      line1: 'Shubh Vivah',
      line2: 'WEDDING INVITATION',
      connector: 'WEDS',
      event: 'Pheras',
      invite: 'With warm manuhar, the families of',
    },
    dateLabel: 'Wedding date',
    examples: {
      bride: 'Rajnandini',
      groom: 'Vikram',
      date: 'Saturday, 27 February 2027',
      time: '8:00 PM onwards',
      venue: 'Samode Haveli',
      city: 'Jaipur, Rajasthan',
      families: 'The Rathore & Shekhawat Families',
    },
    photo: { shape: 'arch', aspectRatio: 0.8 },
  }),
};

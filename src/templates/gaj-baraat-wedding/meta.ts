import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const gajBaraatWeddingMeta: TemplateMeta = {
  slug: 'gaj-baraat-wedding',
  name: 'Royal Gaj Baraat',
  category: 'wedding',
  description: 'Royal Rajasthani wedding invitation: a procession of caparisoned elephants with chhatras walks beneath a night sky.',
  priceInr: 499,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#1A1F4D', '#E7B54A'],
  tags: ['rajasthani-wedding', 'hindu-wedding', 'royal', 'with-photo', 'whatsapp-invite'],
  popularity: 64,
  schema: eventSchema({
    wording: {
      blessing: 'KHAMMA GHANI',
      line1: 'Royal Wedding',
      line2: 'INVITATION',
      connector: 'WEDS',
      event: 'Baraat & Pheras',
      invite: 'With royal regards, the families of',
    },
    dateLabel: 'Wedding date',
    examples: {
      bride: 'Rajnandini',
      groom: 'Vikram',
      date: 'Saturday, 27 February 2027',
      time: 'Baraat 7:00 PM',
      venue: 'City Palace',
      city: 'Udaipur, Rajasthan',
      families: 'The Rathore & Sisodia Families',
    },
    photo: { shape: 'arch', aspectRatio: 0.8 },
  }),
};

import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const toporBengaliWeddingMeta: TemplateMeta = {
  slug: 'topor-bengali-wedding',
  name: 'Shola Topor Bengali Wedding',
  category: 'wedding',
  description: 'Deep red Bengali wedding invitation with a white shola topor and mukut, kalka paisleys and gold.',
  priceInr: 499,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#8E0E1C', '#F5E6C8'],
  tags: ['bengali-wedding', 'hindu-wedding', 'royal', 'with-photo', 'whatsapp-invite'],
  popularity: 64,
  schema: eventSchema({
    wording: {
      blessing: 'PRAJAPATAYE NAMAH',
      line1: 'Bibaho',
      line2: 'WEDDING INVITATION',
      connector: 'WEDS',
      event: 'Wedding Ceremony',
      invite: 'With love and ashirbad from',
    },
    dateLabel: 'Wedding date',
    examples: {
      bride: 'Rupsha',
      groom: 'Soumik',
      date: 'Sunday, 7 March 2027',
      time: 'Lagna 8:15 PM',
      venue: 'Swabhumi Heritage Plaza',
      city: 'Kolkata, West Bengal',
      families: 'The Chatterjee & Bose Families',
    },
    photo: { shape: 'arch', aspectRatio: 0.8 },
  }),
};

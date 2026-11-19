import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const derasarJainWeddingMeta: TemplateMeta = {
  slug: 'derasar-jain-wedding',
  name: 'Marble Derasar',
  category: 'wedding',
  description: 'Jain wedding invitation with a white marble derasar, fluttering dhwaja flags and saffron light.',
  priceInr: 449,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#F7EFE3', '#B23A1E'],
  tags: ['jain-wedding', 'traditional', 'with-photo', 'whatsapp-invite'],
  popularity: 58,
  schema: eventSchema({
    wording: {
      blessing: 'JAI JINENDRA',
      line1: 'Shubh Vivah',
      line2: 'WEDDING INVITATION',
      connector: '&',
      event: 'Wedding Ceremony',
      invite: 'With folded hands, the families of',
    },
    dateLabel: 'Wedding date',
    examples: {
      bride: 'Riddhi',
      groom: 'Vatsal',
      date: 'Monday, 8 February 2027',
      time: '10:30 AM onwards',
      venue: 'Mahavir Vatika',
      city: 'Udaipur, Rajasthan',
      families: 'The Jain & Kothari Families',
    },
    photo: { shape: 'arch', aspectRatio: 0.8 },
  }),
};

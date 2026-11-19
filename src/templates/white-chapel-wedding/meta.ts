import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const whiteChapelWeddingMeta: TemplateMeta = {
  slug: 'white-chapel-wedding',
  name: 'White Chapel Wedding',
  category: 'wedding',
  description: 'Christian church wedding invitation with a glowing stained-glass window, ringing bells and doves in flight.',
  priceInr: 449,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#F8F6F1', '#2E4A7D'],
  tags: ['christian-wedding', 'modern', 'with-photo', 'whatsapp-invite'],
  popularity: 64,
  schema: eventSchema({
    wording: {
      blessing: 'TOGETHER WITH THEIR FAMILIES',
      line1: 'Holy Matrimony',
      line2: 'WEDDING INVITATION',
      connector: '&',
      tagline: 'invite you to celebrate',
      event: 'Wedding Service',
      invite: 'Reception to follow. With love,',
    },
    dateLabel: 'Wedding date',
    examples: {
      bride: 'Sarah',
      groom: 'Joel',
      date: 'Saturday, 24 April 2027',
      time: '4:00 PM',
      venue: "St. Thomas' Cathedral",
      city: 'Mumbai, Maharashtra',
      families: 'The D’Souza & Fernandes Families',
    },
    photo: { shape: 'arch', aspectRatio: 0.8 },
  }),
};

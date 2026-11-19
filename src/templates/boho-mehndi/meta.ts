import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const bohoMehndiMeta: TemplateMeta = {
  slug: 'boho-mehndi',
  name: 'Boho Mehndi',
  category: 'mehndi',
  description: 'Earthy boho mehndi invitation with terracotta rainbow arches, a rising sun and swaying pampas.',
  priceInr: 299,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#F3E6D8', '#C66B3D'],
  tags: ['modern', 'with-photo', 'whatsapp-invite'],
  popularity: 58,
  schema: eventSchema({
    wording: {
      blessing: 'COME CELEBRATE THE',
      line1: 'Mehndi',
      line2: 'OF',
      connector: '&',
      event: 'Mehndi Brunch',
      note: 'Dress code: earthy tones',
      invite: 'Good vibes and henna, hosted by',
    },
    dateLabel: 'Mehndi date',
    hostsLabel: 'Hosted by (family names)',
    groomOptional: true,
    examples: { date: 'Thursday, 11 February 2027', time: '12:00 PM onwards', venue: 'The Terrace Café', city: 'Pune, Maharashtra', families: 'The Joshi Family' },
    photo: { shape: 'arch', aspectRatio: 0.8 },
  }),
};

import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const discoNightSangeetMeta: TemplateMeta = {
  slug: 'disco-night-sangeet',
  name: 'Disco Night Sangeet',
  category: 'sangeet',
  description: 'Neon sangeet invitation with a spinning disco ball, sweeping lights and glowing type.',
  priceInr: 349,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#1A0B2E', '#FF4FD8'],
  tags: ['party', 'modern', 'with-photo', 'whatsapp-invite'],
  popularity: 68,
  schema: eventSchema({
    wording: {
      blessing: "LET'S DANCE AT THE",
      line1: 'Sangeet',
      line2: 'NIGHT',
      connector: '&',
      event: 'Sangeet Night',
      note: 'Dress code: bling & sparkle',
      invite: 'Come dance the night away with',
    },
    dateLabel: 'Sangeet date',
    examples: { date: 'Friday, 12 February 2027', time: '8:00 PM onwards', venue: 'Club Royale', city: 'Delhi' },
    photo: { shape: 'circle', aspectRatio: 1 },
  }),
};

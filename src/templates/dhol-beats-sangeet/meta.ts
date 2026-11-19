import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const dholBeatsSangeetMeta: TemplateMeta = {
  slug: 'dhol-beats-sangeet',
  name: 'Dhol Beats Sangeet',
  category: 'sangeet',
  description: 'Bright magenta and orange sangeet invitation with bunting, confetti and rings that pulse to a dhol beat.',
  priceInr: 349,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#B5179E', '#F77F00'],
  tags: ['party', 'hindu-wedding', 'with-photo', 'whatsapp-invite'],
  popularity: 64,
  schema: eventSchema({
    wording: {
      blessing: 'DHOL, DANCE & DHAMAAL',
      line1: 'SANGEET',
      line2: 'ONE NIGHT OF MUSIC',
      connector: '&',
      event: 'Sangeet Night',
      note: 'Dress code: colourful & festive',
      invite: 'Bring your dancing shoes! Hosted by',
    },
    dateLabel: 'Sangeet date',
    examples: { date: 'Friday, 12 February 2027', time: '7:30 PM onwards', venue: 'Rangmahal Banquet', city: 'Amritsar, Punjab', families: 'The Gill & Sandhu Families' },
    photo: { shape: 'circle', aspectRatio: 1 },
  }),
};

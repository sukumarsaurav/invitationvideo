import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const jaagoNightPunjabiMeta: TemplateMeta = {
  slug: 'jaago-night-punjabi',
  name: 'Jaago Night',
  category: 'sangeet',
  description: 'Punjabi jaago invitation: a decorated gaggar of flickering diyas lights up the night, with sparks rising.',
  priceInr: 349,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#1B0F2E', '#FFB13B'],
  tags: ['punjabi-wedding', 'party', 'traditional', 'with-photo', 'whatsapp-invite'],
  popularity: 62,
  schema: eventSchema({
    wording: {
      blessing: 'JAAGO AAYI AA!',
      line1: 'Jaago',
      line2: 'NIGHT',
      connector: '&',
      event: 'Jaago Night',
      note: 'Bring your dancing shoes',
      invite: 'Come dance till dawn with',
    },
    dateLabel: 'Jaago date',
    examples: {
      bride: 'Simran',
      groom: 'Harpreet',
      date: 'Friday, 12 March 2027',
      time: '9:00 PM till late',
      venue: 'Gill Farmhouse',
      city: 'Ludhiana, Punjab',
      families: 'The Gill Family',
    },
    photo: { shape: 'circle', aspectRatio: 1 },
  }),
};

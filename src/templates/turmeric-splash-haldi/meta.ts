import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const turmericSplashHaldiMeta: TemplateMeta = {
  slug: 'turmeric-splash-haldi',
  name: 'Turmeric Splash Haldi',
  category: 'haldi',
  description: 'Fun, modern haldi invitation with bold type and turmeric splashes that burst across the screen.',
  priceInr: 299,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#FFF8E7', '#F2B705'],
  tags: ['modern', 'party', 'with-photo', 'whatsapp-invite'],
  popularity: 62,
  schema: eventSchema({
    wording: {
      blessing: "IT'S TIME FOR",
      line1: 'HALDI',
      line2: 'GET READY TO GET MESSY',
      connector: '&',
      event: 'Haldi Party',
      note: 'Wear yellow. Bring smiles.',
      invite: 'See you there, all in yellow!',
    },
    dateLabel: 'Haldi date',
    hostsLabel: 'Hosted by (family names)',
    groomOptional: true,
    examples: { date: 'Friday, 12 February 2027', time: '11:00 AM onwards', venue: 'The Courtyard', families: 'The Kapoor Family' },
    photo: { shape: 'circle', aspectRatio: 1 },
  }),
};

import { eventSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const marigoldHaldiMeta: TemplateMeta = {
  slug: 'marigold-haldi',
  name: 'Marigold Haldi',
  category: 'haldi',
  description: 'Sunny haldi invitation with swaying marigold strings, a dress-code line and an optional photo.',
  priceInr: 299,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#FFD54A', '#E07A00'],
  tags: ['hindu-wedding', 'traditional', 'floral', 'with-photo', 'whatsapp-invite'],
  popularity: 70,
  schema: eventSchema({
    wording: {
      blessing: 'SHUBH VIVAH',
      line1: 'Haldi',
      line2: 'CEREMONY',
      connector: '&',
      event: 'Haldi Ceremony',
      note: 'Dress code: shades of yellow',
      invite: 'Come shower them with haldi and love',
    },
    dateLabel: 'Haldi date',
    hostsLabel: 'Hosted by (family names)',
    groomOptional: true,
    examples: { date: 'Friday, 12 February 2027', time: '10:00 AM onwards', venue: 'Sharma Niwas', families: 'The Sharma Family' },
    photo: { shape: 'circle', aspectRatio: 1 },
  }),
};

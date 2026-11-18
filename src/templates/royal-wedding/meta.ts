import type { TemplateMeta } from '../types';

/** Data-only part of the template: shared by the app and the database seed script. */
export const royalWeddingMeta: TemplateMeta = {
  slug: 'royal-maroon-wedding',
  name: 'Royal Maroon Wedding',
  category: 'wedding',
  description: 'Maroon and gold Indian wedding invitation with your names, photo and event details.',
  priceInr: 499,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#7A1F3D', '#E3C27A'],
  tags: ['hindu-wedding', 'traditional', 'royal', 'maroon-and-gold', 'with-photo', 'whatsapp-invite'],
  trending: true,
  popularity: 95,
  schema: {
    title: '{bride} & {groom}',
    details: [
      { key: 'bride', type: 'text', label: "Bride's name", default: 'Aanya', maxLength: 16, casing: 'title', group: 'The couple' },
      { key: 'groom', type: 'text', label: "Groom's name", default: 'Vivaan', maxLength: 16, casing: 'title', group: 'The couple' },
      { key: 'photo', type: 'photo', label: 'Couple photo', aspectRatio: 0.8, shape: 'arch', optional: true, group: 'The couple' },
      { key: 'date', type: 'text', label: 'Wedding date', default: 'Saturday, 13 February 2027', maxLength: 32, group: 'When & where' },
      { key: 'time', type: 'text', label: 'Time', default: '7:00 PM onwards', maxLength: 24, casing: 'upper', group: 'When & where' },
      { key: 'venue', type: 'text', label: 'Venue', default: 'The Grand Palace', maxLength: 32, group: 'When & where' },
      { key: 'city', type: 'text', label: 'City', default: 'Jaipur, Rajasthan', maxLength: 32, optional: true, group: 'When & where' },
      { key: 'families', type: 'text', label: 'Invited by (family names)', default: 'The Sharma & Verma Families', maxLength: 40, group: 'Invited by' },
    ],
    clips: [
      {
        id: 'intro',
        name: 'Opening',
        durationInFrames: 120,
        holdFrame: 70,
        fields: [
          { key: 'blessing', type: 'text', label: 'Blessing line', default: 'SHUBH VIVAH', maxLength: 28, casing: 'upper', optional: true, keep: true },
          { key: 'line1', type: 'text', label: 'Title', default: 'Wedding', maxLength: 12, keep: true },
          { key: 'line2', type: 'text', label: 'Subtitle', default: 'INVITATION', maxLength: 14, casing: 'upper', keep: true },
        ],
      },
      {
        id: 'couple',
        name: 'The couple',
        durationInFrames: 150,
        holdFrame: 90,
        uses: ['bride', 'groom', 'photo'],
        fields: [{ key: 'connector', type: 'text', label: 'Word between the names', default: 'WEDS', maxLength: 8, casing: 'upper', keep: true }],
      },
      {
        id: 'details',
        name: 'Ceremony details',
        durationInFrames: 165,
        holdFrame: 110,
        uses: ['date', 'time', 'venue', 'city'],
        fields: [{ key: 'event', type: 'text', label: 'Event name', default: 'Wedding Ceremony', maxLength: 24, keep: true }],
      },
      {
        id: 'closing',
        name: 'With love from',
        durationInFrames: 135,
        holdFrame: 90,
        uses: ['families'],
        optional: true,
        fields: [
          { key: 'invite', type: 'text', label: 'Invitation line', default: 'With love and blessings from', maxLength: 36, keep: true },
          { key: 'rsvp', type: 'text', label: 'RSVP phone (optional)', default: 'RSVP: +91 98765 43210', maxLength: 32, optional: true, inputMode: 'tel' },
        ],
      },
    ],
  },
};

import type { TemplateMeta } from '../types';

/** Data-only part of the template: shared by the app and the database seed script. */
export const pastelBirthdayMeta: TemplateMeta = {
  slug: 'pastel-balloon-birthday',
  name: 'Pastel Balloon Birthday',
  category: 'birthday',
  music: 'party-pop',
  description: 'Light, playful birthday invitation with floating balloons and a round photo.',
  priceInr: 299,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#F7A8C0', '#C4B5F4'],
  tags: ['kids-birthday', 'pastel', 'with-photo', 'whatsapp-invite'],
  trending: true,
  popularity: 80,
  schema: {
    title: "{name}'s birthday",
    details: [
      { key: 'name', type: 'text', label: 'Birthday name', default: 'Myra', maxLength: 14, casing: 'title', group: 'Birthday star' },
      { key: 'turning', type: 'text', label: 'Age line', default: 'is turning 5!', maxLength: 20, group: 'Birthday star' },
      { key: 'photo', type: 'photo', label: 'Birthday photo', aspectRatio: 1, shape: 'circle', optional: true, group: 'Birthday star' },
      { key: 'date', type: 'text', label: 'Party date', default: 'Sunday, 21 March 2027', maxLength: 30, group: 'When & where' },
      { key: 'time', type: 'text', label: 'Time', default: '5:00 PM', maxLength: 20, group: 'When & where' },
      { key: 'venue', type: 'text', label: 'Venue', default: 'Sunshine Banquet, Pune', maxLength: 32, group: 'When & where' },
    ],
    clips: [
      {
        id: 'hello',
        name: 'Birthday star',
        durationInFrames: 120,
        holdFrame: 70,
        uses: ['name', 'turning'],
        fields: [{ key: 'intro', type: 'text', label: 'Opening line', default: "YOU'RE INVITED TO", maxLength: 24, casing: 'upper', keep: true }],
      },
      {
        id: 'photo',
        name: 'Photo',
        durationInFrames: 105,
        holdFrame: 60,
        uses: ['photo'],
        optional: true,
        fields: [{ key: 'caption', type: 'text', label: 'Caption', default: 'Come celebrate with us', maxLength: 28, keep: true }],
      },
      {
        id: 'party',
        name: 'Party details',
        durationInFrames: 135,
        holdFrame: 80,
        uses: ['date', 'time', 'venue'],
        fields: [{ key: 'title', type: 'text', label: 'Heading', default: 'Party Time', maxLength: 16, keep: true }],
      },
    ],
  },
};

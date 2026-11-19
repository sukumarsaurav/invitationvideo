import { saveTheDateSchema } from '../shared/schemas.ts';
import type { TemplateMeta } from '../types';

export const calendarSaveTheDateMeta: TemplateMeta = {
  slug: 'calendar-save-the-date',
  name: 'Calendar Save the Date',
  category: 'save-the-date',
  description: 'Terracotta save the date with a real calendar page for your month and a heart drawn around the day.',
  priceInr: 299,
  fps: 30,
  width: 1080,
  height: 1920,
  swatch: ['#FBF3EA', '#B5543A'],
  tags: ['modern', 'with-photo', 'whatsapp-invite'],
  popularity: 62,
  schema: saveTheDateSchema({
    calendar: true,
    wording: {
      blessing: 'MARK YOUR CALENDARS',
      line1: 'Save the Date',
      line2: 'FOR THE WEDDING OF',
      connector: '&',
      tagline: 'are getting married',
      event: 'The Wedding',
      invite: 'Formal invitation to follow',
    },
    photo: { shape: 'arch', aspectRatio: 0.8 },
    durations: { details: 170 },
  }),
};

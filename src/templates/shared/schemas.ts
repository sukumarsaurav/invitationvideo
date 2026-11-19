/**
 * Schema builders for wedding-family templates (wedding, engagement, haldi, mehndi, sangeet,
 * reception, save the date). Every design in a family shares the same field keys and clip ids, so the
 * shared clips in kit.tsx can draw any of them and a customer's details carry over between designs.
 * Each template's meta.ts picks the wording; plain data, runnable from Node scripts (seed, sitemap).
 */
import type { ClipDef, Field, TemplateSchema } from '../types';

type Shape = 'rect' | 'circle' | 'arch';

export type EventWording = {
  /** Small line above the title, e.g. "SHUBH VIVAH". Omit to leave the field out. */
  blessing?: string;
  /** Big opening word, e.g. "Haldi". */
  line1: string;
  /** Second opening line, e.g. "CEREMONY". */
  line2: string;
  /** Word between the names, e.g. "WEDS" or "&". */
  connector: string;
  /** Line under the names, e.g. "are getting engaged". Omit to leave the field out. */
  tagline?: string;
  /** Heading on the details clip, e.g. "Mehndi Night". */
  event: string;
  /** First line of the closing clip, e.g. "Join us for an evening of music & dance". */
  invite: string;
  /** Optional dress-code line on the details clip, e.g. "Dress code: shades of yellow". */
  note?: string;
};

export type EventOptions = {
  wording: EventWording;
  /** Example details drawn in previews. */
  examples?: Partial<Record<'bride' | 'groom' | 'date' | 'time' | 'venue' | 'city' | 'families' | 'rsvp', string>>;
  dateLabel?: string;
  hostsLabel?: string;
  /** Haldi and mehndi are often one side's event: the groom's name may be left empty. */
  groomOptional?: boolean;
  /** Photo slot for the couple clip; null for designs without one. */
  photo?: { shape: Shape; aspectRatio: number } | null;
  /** Clip lengths in frames (30 fps). */
  durations?: Partial<Record<'intro' | 'couple' | 'details' | 'closing', number>>;
};

const EXAMPLES = {
  bride: 'Aanya',
  groom: 'Vivaan',
  date: 'Saturday, 13 February 2027',
  time: '7:00 PM onwards',
  venue: 'The Grand Palace',
  city: 'Jaipur, Rajasthan',
  families: 'The Sharma & Verma Families',
  rsvp: 'RSVP: +91 98765 43210',
};

const keepText = (key: string, label: string, value: string, maxLength: number, extra: Partial<Field> = {}): Field =>
  ({ key, type: 'text', label, default: value, maxLength, keep: true, ...extra }) as Field;

/** Names, photo, when & where, and who is inviting: the facts every wedding-family event shares. */
const coupleDetails = (o: EventOptions, withTime = true): Field[] => {
  const ex = { ...EXAMPLES, ...o.examples };
  const photo = o.photo === undefined ? { shape: 'arch' as Shape, aspectRatio: 0.8 } : o.photo;
  const fields: Field[] = [
    { key: 'bride', type: 'text', label: "Bride's name", default: ex.bride, maxLength: 16, casing: 'title', group: 'The couple' },
    o.groomOptional
      ? { key: 'groom', type: 'text', label: "Groom's name (optional)", default: ex.groom, maxLength: 16, casing: 'title', optional: true, group: 'The couple' }
      : { key: 'groom', type: 'text', label: "Groom's name", default: ex.groom, maxLength: 16, casing: 'title', group: 'The couple' },
  ];
  if (photo) fields.push({ key: 'photo', type: 'photo', label: 'Couple photo', aspectRatio: photo.aspectRatio, shape: photo.shape, optional: true, group: 'The couple' });
  fields.push({ key: 'date', type: 'text', label: o.dateLabel ?? 'Event date', default: ex.date, maxLength: 32, group: 'When & where' });
  if (withTime) fields.push({ key: 'time', type: 'text', label: 'Time', default: ex.time, maxLength: 24, casing: 'upper', group: 'When & where' });
  if (withTime) fields.push({ key: 'venue', type: 'text', label: 'Venue', default: ex.venue, maxLength: 32, group: 'When & where' });
  fields.push({ key: 'city', type: 'text', label: 'City', default: ex.city, maxLength: 32, optional: true, group: 'When & where' });
  fields.push({ key: 'families', type: 'text', label: o.hostsLabel ?? 'Invited by (family names)', default: ex.families, maxLength: 40, group: 'Invited by' });
  return fields;
};

const introClip = (w: EventWording, duration = 120): ClipDef => ({
  id: 'intro',
  name: 'Opening',
  durationInFrames: duration,
  holdFrame: Math.round(duration * 0.6),
  fields: [
    ...(w.blessing !== undefined ? [keepText('blessing', 'Blessing line', w.blessing, 28, { casing: 'upper', optional: true })] : []),
    keepText('line1', 'Title', w.line1, 14),
    keepText('line2', 'Subtitle', w.line2, 22, { casing: 'upper' }),
  ],
});

const coupleClip = (w: EventWording, hasPhoto: boolean, duration = 150): ClipDef => ({
  id: 'couple',
  name: 'The couple',
  durationInFrames: duration,
  holdFrame: Math.round(duration * 0.6),
  uses: hasPhoto ? ['bride', 'groom', 'photo'] : ['bride', 'groom'],
  fields: [
    keepText('connector', 'Word between the names', w.connector, 8, { casing: 'upper' }),
    ...(w.tagline !== undefined ? [keepText('tagline', 'Line under the names', w.tagline, 28, { optional: true })] : []),
  ],
});

const closingClip = (w: EventWording, duration = 135): ClipDef => ({
  id: 'closing',
  name: 'With love from',
  durationInFrames: duration,
  holdFrame: Math.round(duration * 0.65),
  uses: ['families'],
  optional: true,
  fields: [
    keepText('invite', 'Invitation line', w.invite, 40),
    { key: 'rsvp', type: 'text', label: 'RSVP phone (optional)', default: EXAMPLES.rsvp, maxLength: 32, optional: true, inputMode: 'tel' },
  ],
});

/** Wedding, engagement, haldi, mehndi, sangeet and reception: opening, couple, details, closing. */
export const eventSchema = (o: EventOptions): TemplateSchema => {
  const w = o.wording;
  const d = o.durations ?? {};
  const details = coupleDetails(o);
  return {
    title: '{bride} & {groom}',
    details,
    clips: [
      introClip(w, d.intro),
      coupleClip(w, details.some((f) => f.key === 'photo'), d.couple),
      {
        id: 'details',
        name: 'Event details',
        durationInFrames: d.details ?? 165,
        holdFrame: Math.round((d.details ?? 165) * 0.66),
        uses: ['date', 'time', 'venue', 'city'],
        fields: [
          keepText('event', 'Event name', w.event, 24),
          ...(w.note !== undefined ? [keepText('note', 'Dress code (optional)', w.note, 36, { optional: true })] : []),
        ],
      },
      closingClip(w, d.closing),
    ],
  };
};

/**
 * Save the date: names, the date and the city only (venue and time come with the invitation).
 * `calendar` swaps the free-text date for day, month and year, so a real calendar page can be drawn.
 */
export const saveTheDateSchema = (o: EventOptions & { calendar?: boolean }): TemplateSchema => {
  const w = o.wording;
  const d = o.durations ?? {};
  let details = coupleDetails({ ...o, dateLabel: o.dateLabel ?? 'Wedding date' }, false);
  if (o.calendar) {
    const at = details.findIndex((f) => f.key === 'date');
    details = [
      ...details.slice(0, at),
      { key: 'day', type: 'text', label: 'Day of the month', default: '13', maxLength: 2, inputMode: 'numeric', group: 'When & where' },
      { key: 'month', type: 'text', label: 'Month', default: 'February', maxLength: 12, casing: 'title', group: 'When & where' },
      { key: 'year', type: 'text', label: 'Year', default: '2027', maxLength: 4, inputMode: 'numeric', group: 'When & where' },
      ...details.slice(at + 1),
    ];
  }
  // Families are optional here: many couples send a save the date in their own names.
  details = details.map((f) => (f.key === 'families' ? { ...f, optional: true, label: 'Hosted by (family names)' } : f));
  return {
    title: '{bride} & {groom}',
    details,
    clips: [
      introClip(w, d.intro),
      coupleClip(w, details.some((f) => f.key === 'photo'), d.couple),
      {
        id: 'details',
        name: 'The date',
        durationInFrames: d.details ?? 150,
        holdFrame: Math.round((d.details ?? 150) * 0.66),
        uses: o.calendar ? ['day', 'month', 'year', 'city'] : ['date', 'city'],
        fields: [keepText('event', 'Event name', w.event, 24)],
      },
      {
        id: 'closing',
        name: 'Closing',
        durationInFrames: d.closing ?? 120,
        holdFrame: Math.round((d.closing ?? 120) * 0.65),
        uses: ['families'],
        optional: true,
        fields: [keepText('invite', 'Closing line', w.invite, 40)],
      },
    ],
  };
};

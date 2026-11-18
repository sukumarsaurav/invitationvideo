import type { Casing, ClipDef, ClipValues, Field, TemplateMeta, TextField, VideoData } from './types';

export const applyCasing = (value: string, casing: Casing | undefined): string => {
  switch (casing) {
    case 'upper':
      return value.toUpperCase();
    case 'lower':
      return value.toLowerCase();
    case 'title':
      return value.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    default:
      return value;
  }
};

/** Starting value for a field: generic wording is filled in, personal details start empty. */
const initialValue = (f: Field) => (f.type === 'text' && f.keep ? f.default : '');

/** Fresh data for a template: every clip included, personal details empty. */
export const makeDefaultData = (def: TemplateMeta): VideoData => ({
  details: Object.fromEntries(def.schema.details.map((f) => [f.key, initialValue(f)])),
  clips: Object.fromEntries(
    def.schema.clips.map((clip) => [
      clip.id,
      { included: true, values: Object.fromEntries(clip.fields.map((f) => [f.key, initialValue(f)])) },
    ]),
  ),
});

/** Data with every example drawn in, used for catalogue thumbnails and template previews. */
export const makeExampleData = (def: TemplateMeta): VideoData => {
  const data = makeDefaultData(def);
  for (const f of def.schema.details) if (f.type === 'text') data.details[f.key] = f.default;
  for (const c of def.schema.clips)
    for (const f of c.fields) if (f.type === 'text') data.clips[c.id].values[f.key] = f.default;
  return data;
};

type SavedData = Partial<VideoData> & { clips?: VideoData['clips'] };

/**
 * Merge saved data over a fresh draft, so templates can gain fields without breaking old drafts.
 * Drafts saved before `details` existed kept those values inside clips; they are lifted out here.
 */
export const normaliseData = (def: TemplateMeta, data: SavedData | null | undefined): VideoData => {
  const base = makeDefaultData(def);
  if (!data) return base;
  const savedClips = data.clips ?? {};
  for (const f of def.schema.details) {
    let v = data.details?.[f.key];
    if (typeof v !== 'string') {
      v = Object.values(savedClips)
        .map((c) => c?.values?.[f.key])
        .find((x): x is string => typeof x === 'string');
    }
    if (typeof v === 'string') base.details[f.key] = v;
  }
  for (const clip of def.schema.clips) {
    const saved = savedClips[clip.id];
    if (!saved) continue;
    base.clips[clip.id].included = clip.optional ? saved.included !== false : true;
    for (const field of clip.fields) {
      const v = saved.values?.[field.key];
      if (typeof v === 'string') base.clips[clip.id].values[field.key] = v;
    }
  }
  return base;
};

export const getIncludedClips = (def: TemplateMeta, data: VideoData): ClipDef[] =>
  def.schema.clips.filter((c) => data.clips[c.id]?.included !== false);

export const getDurationInFrames = (def: TemplateMeta, data: VideoData): number =>
  Math.max(
    1,
    getIncludedClips(def, data).reduce((sum, c) => sum + c.durationInFrames, 0),
  );

/** A text value as it will be drawn: empty required fields show their example. */
const resolveText = (f: TextField, raw: string | undefined) => {
  const v = (raw ?? '').trim();
  return applyCasing(v === '' && !f.optional ? f.default : v, f.casing);
};

const resolveFields = (fields: Field[], values: Record<string, string>): ClipValues => {
  const out: ClipValues = {};
  for (const f of fields) out[f.key] = f.type === 'text' ? resolveText(f, values[f.key]) : (values[f.key] ?? '');
  return out;
};

/** Values for one clip: the template's details plus the clip's own wording, defaulted and cased. */
export const resolveClipValues = (def: TemplateMeta, clip: ClipDef, data: VideoData): ClipValues => ({
  ...resolveFields(def.schema.details, data.details),
  ...resolveFields(clip.fields, data.clips[clip.id]?.values ?? {}),
});

export type ExampleInUse = { step: 'details' | string; label: string; key: string };

/**
 * Personal fields (names, date, venue) that are still empty, so the video would show example text.
 * The HD download is blocked until these are filled.
 */
export const findExamplesInUse = (def: TemplateMeta, data: VideoData): ExampleInUse[] => {
  const out: ExampleInUse[] = [];
  const check = (step: string, fields: Field[], values: Record<string, string>) => {
    for (const f of fields) {
      if (f.type !== 'text' || f.keep || f.optional) continue;
      if ((values[f.key] ?? '').trim() === '') out.push({ step, label: f.label, key: f.key });
    }
  };
  check('details', def.schema.details, data.details);
  for (const c of getIncludedClips(def, data)) check(c.id, c.fields, data.clips[c.id].values);
  return out;
};

/** "Priya & Vivaan" from the template's title pattern, or the template name if details are missing. */
export const videoTitle = (def: TemplateMeta, data: VideoData): string => {
  let missing = false;
  const title = def.schema.title.replace(/\{(\w+)\}/g, (_, key: string) => {
    const field = def.schema.details.find((f) => f.key === key);
    const v = (data.details[key] ?? '').trim();
    if (!v) missing = true;
    return field?.type === 'text' ? applyCasing(v, field.casing) : v;
  });
  return missing ? def.name : title;
};

/** The frame (in the whole video) where a clip's text is fully on screen. */
export const holdFrameOf = (def: TemplateMeta, data: VideoData, clipId: string): number | null => {
  let start = 0;
  for (const c of getIncludedClips(def, data)) {
    if (c.id === clipId) return start + (c.holdFrame ?? Math.round(c.durationInFrames * 0.6));
    start += c.durationInFrames;
  }
  return null;
};

/** The first clip in the video that shows a detail field (e.g. the couple clip for "bride"), or null. */
export const clipShowingDetail = (def: TemplateMeta, data: VideoData, key: string): ClipDef | null =>
  getIncludedClips(def, data).find((c) => c.uses?.includes(key)) ?? null;

/** First frame of a clip in the whole video, or null if the clip is dropped. */
export const startFrameOf = (def: TemplateMeta, data: VideoData, clipId: string): number | null => {
  let start = 0;
  for (const c of getIncludedClips(def, data)) {
    if (c.id === clipId) return start;
    start += c.durationInFrames;
  }
  return null;
};

/** Every editable field of a template, for "what you can change" summaries. */
export const allFields = (def: TemplateMeta): Field[] => [
  ...def.schema.details,
  ...def.schema.clips.flatMap((c) => c.fields),
];

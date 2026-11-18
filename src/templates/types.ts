import type { ComponentType } from 'react';

/** How a text value is transformed before it is drawn. */
export type Casing = 'none' | 'upper' | 'lower' | 'title';

export type TextField = {
  key: string;
  type: 'text';
  label: string;
  /** Example text. Shown greyed in the field and drawn in the preview until the customer types. */
  default: string;
  maxLength: number;
  casing?: Casing;
  optional?: boolean;
  /**
   * Generic wording most people keep ("Wedding", "WEDS"): starts filled in.
   * Fields without `keep` are personal (names, dates, venue) and start empty,
   * so example text can never end up in a paid video by accident.
   */
  keep?: boolean;
  /** Keyboard to show on phones. */
  inputMode?: 'text' | 'numeric' | 'tel';
  /** Small heading shown above the first field of each group, e.g. "When & where". */
  group?: string;
};

export type PhotoField = {
  key: string;
  type: 'photo';
  label: string;
  /** width / height of the slot, used by the cropper. */
  aspectRatio: number;
  shape?: 'rect' | 'circle' | 'arch';
  optional?: boolean;
  group?: string;
};

export type Field = TextField | PhotoField;

export type ClipDef = {
  id: string;
  name: string;
  durationInFrames: number;
  /** The customer may drop this clip from the video. */
  optional?: boolean;
  /** Frame (inside the clip) where every line is visible; the editor shows it. Defaults to 60%. */
  holdFrame?: number;
  /** Keys from `TemplateSchema.details` this clip shows, so the editor can jump to it when one is edited. */
  uses?: string[];
  /** Wording specific to this clip. Personal details live in `TemplateSchema.details`. */
  fields: Field[];
};

/** Data-only description of a template: drives the editor form and is stored in `templates.schema`. */
export type TemplateSchema = {
  /** The key facts, filled once on the first editor step and used by every clip. */
  details: Field[];
  clips: ClipDef[];
  /** Name for the customer's video, e.g. "{bride} & {groom}". Keys refer to `details`. */
  title: string;
};

/** What the customer has entered. Photo values are image URLs (data: or signed R2 URLs). */
export type VideoData = {
  details: Record<string, string>;
  clips: Record<string, { included: boolean; values: Record<string, string> }>;
};

export type TemplateProps = {
  data: VideoData;
  watermark: boolean;
};

/** Values handed to one clip component: the template's details merged with the clip's own fields. */
export type ClipValues = Record<string, string>;

export type ClipComponent = ComponentType<{ values: ClipValues; durationInFrames: number }>;

/** Everything about a template except its React clip components. */
export type TemplateMeta = Omit<TemplateDefinition, 'clips'>;

export type TemplateDefinition = {
  slug: string;
  name: string;
  category: string;
  description: string;
  priceInr: number;
  fps: number;
  width: number;
  height: number;
  schema: TemplateSchema;
  clips: Record<string, ClipComponent>;
  /** Colours used for the thumbnail card before a real preview image exists. */
  swatch: [string, string];
  /** Slugs from taxonomy.TAGS; each tag has its own landing page. */
  tags: string[];
  /** Shown in "Trending now". Set by hand until real usage data drives it. */
  trending?: boolean;
  /** Sort order for "Popular" (higher first). Replace with real render counts later. */
  popularity?: number;
  /** Store order set in the admin panel (lower first). */
  sortOrder?: number;
  /** Search-result title and description set in the admin panel; fall back to name and description. */
  seoTitle?: string;
  seoDescription?: string;
};

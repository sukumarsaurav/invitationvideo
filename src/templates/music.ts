/**
 * Background music the customer can put under their video. The files live in public/music/ and are
 * made by scripts/generate-music.ts (our own synthesised tracks, nothing to license). To use a
 * licensed recording instead, drop an .m4a (AAC) with the same name into public/music/; tracks of
 * about 30 seconds or longer avoid looping. Plain data, importable from Node scripts too.
 */
export type MusicTrack = {
  id: string;
  name: string;
  /** One or two words on the feel, shown under the name. */
  mood: string;
  src: string;
  /** Occasions (category slugs) this track is suggested for, listed first in the picker. */
  occasions: string[];
};

export const MUSIC: MusicTrack[] = [
  {
    id: 'santoor-shubh',
    name: 'Shubh Aarambh',
    mood: 'Santoor & tabla · traditional',
    src: '/music/santoor-shubh.m4a',
    occasions: ['wedding', 'engagement', 'griha-pravesh', 'save-the-date', 'anniversary', 'baby-shower'],
  },
  {
    id: 'dhol-baaraat',
    name: 'Baaraat Beats',
    mood: 'Dhol & tumbi · festive',
    src: '/music/dhol-baaraat.m4a',
    occasions: ['wedding', 'engagement', 'save-the-date'],
  },
  {
    id: 'party-pop',
    name: 'Party Time',
    mood: 'Upbeat pop · fun',
    src: '/music/party-pop.m4a',
    occasions: ['birthday'],
  },
  {
    id: 'golden-bells',
    name: 'Golden Moments',
    mood: 'Bells & soft chords · gentle',
    src: '/music/golden-bells.m4a',
    occasions: ['anniversary', 'baby-shower', 'birthday', 'griha-pravesh'],
  },
];

export const getTrack = (id: string | undefined) => (id ? MUSIC.find((m) => m.id === id) : undefined);

/** Tracks suggested for an occasion first, then the rest. */
export const tracksFor = (category: string): { suggested: MusicTrack[]; others: MusicTrack[] } => ({
  suggested: MUSIC.filter((m) => m.occasions.includes(category)),
  others: MUSIC.filter((m) => !m.occasions.includes(category)),
});

/** The track a new video starts with: the template's own choice, else the first one suggested for its occasion. */
export const defaultTrackFor = (def: { music?: string; category: string }): string =>
  getTrack(def.music)?.id ?? tracksFor(def.category).suggested[0]?.id ?? '';

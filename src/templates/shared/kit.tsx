/**
 * Shared clips for the wedding-family templates. A design supplies a Look (backdrop, colours, type,
 * divider, photo frame and how text enters) and gets the four standard clips that match
 * shared/schemas.ts: intro, couple, details, closing. A design can replace any clip with its own
 * signature scene and still use Txt, Stack and enter() so it moves like the rest.
 */
import type React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { useClipFade, useEnter } from './anim';
import { FitText } from './FitText';
import { PhotoFrame } from './PhotoFrame';
import type { ClipComponent } from '../types';

export type ClipId = 'intro' | 'couple' | 'details' | 'closing';

/** How text and photos arrive on screen. */
export type Motion = 'rise' | 'zoom' | 'blur' | 'slide' | 'drop';

/** One kind of text in a design. */
export type Role = {
  family: string;
  weight?: number;
  /** Letter spacing in px. */
  spacing?: number;
  color?: string;
  /** Multiplies the default size: wide faces (Monoton) want less, condensed ones (Bebas) more. */
  scale?: number;
  style?: React.CSSProperties;
};

export type RoleName = 'title' | 'subtitle' | 'names' | 'heading' | 'body' | 'caps';

export type Look = {
  Backdrop: React.FC<{ durationInFrames: number; clip: ClipId }>;
  /** Main text colour (date, venue, invitation lines). */
  ink: string;
  /** Names and titles. */
  accent: string;
  /** Small spaced capitals and quieter lines. */
  soft: string;
  /** Text shadow for every line, for designs on busy or dark backgrounds. */
  shadow?: string;
  roles: Record<RoleName, Role>;
  /** Drawn above and below headings. */
  Divider?: React.FC<{ width: number; flip?: boolean; style?: React.CSSProperties }>;
  photo: { shape: 'rect' | 'circle' | 'arch'; width: number; height: number; border?: string; style?: React.CSSProperties };
  motion: Motion;
  /** A card behind the text column, for light text on busy art (or the reverse). */
  panel?: React.CSSProperties;
  /** Width text may take; keeps clear of the backdrop's frame. */
  textWidth?: number;
  /** Moves the text column down (positive) or up, clear of garlands or skylines. */
  offsetY?: number;
};

const ROLE_SIZE: Record<RoleName, number> = { title: 180, subtitle: 88, names: 160, heading: 64, body: 52, caps: 44 };

/** Style for an element entering with progress `p` (0 → 1). `i` alternates slide direction. */
export const enter = (motion: Motion, p: number, i = 0): React.CSSProperties => {
  const q = Math.min(1, Math.max(0, p));
  switch (motion) {
    case 'zoom':
      return { opacity: q, transform: `scale(${0.82 + 0.18 * q})` };
    case 'blur':
      return { opacity: q, filter: `blur(${(1 - q) * 14}px)`, transform: `translateY(${(1 - q) * 16}px)` };
    case 'slide':
      return { opacity: q, transform: `translateX(${(1 - q) * (i % 2 ? 70 : -70)}px)` };
    case 'drop':
      return { opacity: q, transform: `translateY(${(1 - q) * -50}px)` };
    default:
      return { opacity: q, transform: `translateY(${(1 - q) * 44}px)` };
  }
};

const roleColor = (look: Look, role: RoleName) =>
  look.roles[role].color ?? (role === 'title' || role === 'names' ? look.accent : role === 'caps' ? look.soft : look.ink);

/** One fitted line of text in a role's typeface. `size` is the largest it may be drawn. */
export const Txt: React.FC<{ look: Look; role: RoleName; text: string; size?: number; width?: number; color?: string; style?: React.CSSProperties }> = ({
  look,
  role,
  text,
  size,
  width,
  color,
  style,
}) => {
  if (!text) return null;
  const r = look.roles[role];
  return (
    <FitText
      text={text}
      width={width ?? look.textWidth ?? 820}
      maxFontSize={Math.round((size ?? ROLE_SIZE[role]) * (r.scale ?? 1))}
      fontFamily={r.family}
      fontWeight={r.weight}
      style={{ color: color ?? roleColor(look, role), letterSpacing: r.spacing, textShadow: look.shadow, ...r.style, ...style }}
    />
  );
};

/** Centred column (inside the design's panel, if it has one), faded in and out with the clip. */
export const Stack: React.FC<{ look: Look; durationInFrames: number; clip: ClipId; gap?: number; children: React.ReactNode }> = ({
  look,
  durationInFrames,
  clip,
  gap = 28,
  children,
}) => {
  const fade = useClipFade(durationInFrames);
  const { Backdrop } = look;
  const column = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap, ...look.panel }}>{children}</div>
  );
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Backdrop durationInFrames={durationInFrames} clip={clip} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: look.offsetY ? `translateY(${look.offsetY}px)` : undefined }}>
        {column}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Staggered entrance progress for `n` items, `step` frames apart. */
export const useStagger = (n: number, start = 6, step = 11): number[] => {
  const frame = useCurrentFrame();
  return Array.from({ length: n }, (_, i) =>
    interpolate(frame, [start + i * step, start + i * step + 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
  );
};

const Divider: React.FC<{ look: Look; width?: number; flip?: boolean; style?: React.CSSProperties }> = ({ look, width = 400, flip, style }) =>
  look.Divider ? <look.Divider width={width} flip={flip} style={style} /> : null;

/** Customer photo in the design's frame (nothing when no photo was added). */
export const LookPhoto: React.FC<{ look: Look; src: string; scale?: number }> = ({ look, src, scale = 1 }) => (
  <PhotoFrame
    src={src}
    width={Math.round(look.photo.width * scale)}
    height={Math.round(look.photo.height * scale)}
    shape={look.photo.shape}
    borderColor={look.photo.border}
    style={look.photo.style}
  />
);

export const makeIntro =
  (look: Look): ClipComponent =>
  ({ values, durationInFrames }) => {
    const p = useStagger(5);
    return (
      <Stack look={look} durationInFrames={durationInFrames} clip="intro" gap={22}>
        <div style={enter(look.motion, p[0], 0)}>
          <Txt look={look} role="caps" text={values.blessing} />
        </div>
        <div style={enter(look.motion, p[1], 1)}>
          <Divider look={look} />
        </div>
        <div style={enter(look.motion, p[2], 0)}>
          <Txt look={look} role="title" text={values.line1} />
        </div>
        <div style={enter(look.motion, p[3], 1)}>
          <Txt look={look} role="subtitle" text={values.line2} />
        </div>
        <div style={enter(look.motion, p[4], 0)}>
          <Divider look={look} flip />
        </div>
      </Stack>
    );
  };

export const makeCouple =
  (look: Look): ClipComponent =>
  ({ values, durationInFrames }) => {
    const photo = useEnter(4);
    const p = useStagger(4, 14, 12);
    const hasPhoto = Boolean(values.photo);
    const nameSize = hasPhoto ? 130 : 170;
    return (
      <Stack look={look} durationInFrames={durationInFrames} clip="couple" gap={hasPhoto ? 14 : 30}>
        {hasPhoto ? (
          <div style={{ ...enter(look.motion, photo), marginBottom: 26 }}>
            <LookPhoto look={look} src={values.photo} />
          </div>
        ) : null}
        <div style={enter(look.motion, p[0], 0)}>
          <Txt look={look} role="names" text={values.bride} size={nameSize} />
        </div>
        {values.groom ? (
          <>
            <div style={enter(look.motion, p[1], 1)}>
              <Txt look={look} role="caps" text={values.connector} size={50} />
            </div>
            <div style={enter(look.motion, p[2], 0)}>
              <Txt look={look} role="names" text={values.groom} size={nameSize} />
            </div>
          </>
        ) : null}
        <div style={{ ...enter(look.motion, p[3], 1), marginTop: 10 }}>
          <Txt look={look} role="body" text={values.tagline} size={54} />
        </div>
      </Stack>
    );
  };

/** Ordered lines of the details clip: the event name, then whichever of these the design's schema has. */
const DETAIL_LINES: Array<{ key: string; role: RoleName; size: number }> = [
  { key: 'event', role: 'title', size: 104 },
  { key: 'date', role: 'heading', size: 64 },
  { key: 'time', role: 'caps', size: 46 },
  { key: 'venue', role: 'heading', size: 66 },
  { key: 'city', role: 'body', size: 48 },
  { key: 'note', role: 'body', size: 42 },
];

export const makeDetails =
  (look: Look, lines = DETAIL_LINES): ClipComponent =>
  ({ values, durationInFrames }) => {
    const shown = lines.filter((l) => values[l.key]);
    const p = useStagger(shown.length + 2, 4, 9);
    return (
      <Stack look={look} durationInFrames={durationInFrames} clip="details" gap={30}>
        <div style={enter(look.motion, p[0])}>
          <Divider look={look} width={360} />
        </div>
        {shown.map((l, i) => (
          <div key={l.key} style={enter(look.motion, p[i + 1], i)}>
            <Txt
              look={look}
              role={l.role}
              text={values[l.key]}
              size={l.size}
              color={l.key === 'note' ? look.soft : undefined}
              style={l.key === 'note' ? { fontStyle: 'italic' } : undefined}
            />
          </div>
        ))}
        <div style={enter(look.motion, p[shown.length + 1])}>
          <Divider look={look} width={360} flip />
        </div>
      </Stack>
    );
  };

export const makeClosing =
  (look: Look): ClipComponent =>
  ({ values, durationInFrames }) => {
    const p = useStagger(4, 6, 12);
    return (
      <Stack look={look} durationInFrames={durationInFrames} clip="closing" gap={30}>
        <div style={enter(look.motion, p[0], 0)}>
          <Txt look={look} role="body" text={values.invite} size={56} />
        </div>
        <div style={enter(look.motion, p[1], 1)}>
          <Divider look={look} width={360} />
        </div>
        <div style={enter(look.motion, p[2], 0)}>
          <Txt look={look} role="names" text={values.families} size={104} />
        </div>
        <div style={{ ...enter(look.motion, p[3], 1), marginTop: 30 }}>
          <Txt look={look} role="body" text={values.rsvp} size={44} />
        </div>
      </Stack>
    );
  };

/** The four standard clips for a look; spread over this to swap in a signature scene. */
export const makeClips = (look: Look): Record<ClipId, ClipComponent> => ({
  intro: makeIntro(look),
  couple: makeCouple(look),
  details: makeDetails(look),
  closing: makeClosing(look),
});


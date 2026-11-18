import type React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { riseIn, useClipFade, useEnter, useSlowZoom } from '../shared/anim';
import { FitText } from '../shared/FitText';
import { fonts } from '../shared/fonts';
import { Corner, DoubleFrame, Flourish } from '../shared/Ornaments';
import { PhotoFrame } from '../shared/PhotoFrame';
import type { ClipComponent, TemplateDefinition } from '../types';
import { royalWeddingMeta } from './meta';

const GOLD = '#E3C27A';
const GOLD_SOFT = 'rgba(227,194,122,0.55)';
const CREAM = '#FFF3DE';
const TEXT_W = 820;

const goldText: React.CSSProperties = {
  color: GOLD,
  textShadow: '0 3px 12px rgba(0,0,0,0.35)',
};

/** Maroon backdrop with a slowly zooming motif pattern, double frame and corner ornaments. */
const Backdrop: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const zoom = useSlowZoom(durationInFrames, 1.06);
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #4A0F24 0%, #7A1F3D 45%, #4A0F24 100%)' }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, opacity: 0.16 }}>
        <svg width="100%" height="100%" viewBox="0 0 1080 1920">
          {Array.from({ length: 12 }, (_, r) =>
            Array.from({ length: 7 }, (_, c) => {
              const x = c * 170 + (r % 2 ? 85 : 0);
              const y = r * 170;
              return (
                <g key={`${r}-${c}`} transform={`translate(${x} ${y})`} fill="none" stroke={GOLD} strokeWidth={2}>
                  <circle r={22} />
                  <path d="M0 -38 C10 -24 10 -14 0 0 C-10 -14 -10 -24 0 -38 Z" />
                  <path d="M0 38 C10 24 10 14 0 0 C-10 14 -10 24 0 38 Z" />
                </g>
              );
            }),
          )}
        </svg>
      </AbsoluteFill>
      <DoubleFrame inset={44} color={GOLD} opacity={0.9} />
      <Corner size={150} color={GOLD} style={{ position: 'absolute', left: 70, top: 70 }} />
      <Corner size={150} color={GOLD} rotate={90} style={{ position: 'absolute', right: 70, top: 70 }} />
      <Corner size={150} color={GOLD} rotate={270} style={{ position: 'absolute', left: 70, bottom: 70 }} />
      <Corner size={150} color={GOLD} rotate={180} style={{ position: 'absolute', right: 70, bottom: 70 }} />
    </AbsoluteFill>
  );
};

const Column: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 28 }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap }}>
    {children}
  </AbsoluteFill>
);

const Intro: ClipComponent = ({ values, durationInFrames }) => {
  const fade = useClipFade(durationInFrames);
  const a = useEnter(6);
  const b = useEnter(16);
  const c = useEnter(26);
  const d = useEnter(36);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Backdrop durationInFrames={durationInFrames} />
      <Column>
        <div style={riseIn(a)}>
          <FitText text={values.blessing} width={TEXT_W} maxFontSize={46} fontFamily={fonts.serif} fontWeight={600} style={{ color: CREAM, letterSpacing: 4 }} />
        </div>
        <Flourish width={420} color={GOLD} style={{ ...riseIn(b), marginTop: 30 }} />
        <div style={riseIn(c, 60)}>
          <FitText text={values.line1} width={TEXT_W} maxFontSize={190} fontFamily={fonts.script} style={goldText} />
        </div>
        <div style={riseIn(d, 60)}>
          <FitText text={values.line2} width={TEXT_W} maxFontSize={92} fontFamily={fonts.display} fontWeight={600} style={{ ...goldText, letterSpacing: 10 }} />
        </div>
        <Flourish width={420} color={GOLD} style={{ ...riseIn(d), transform: `${riseIn(d).transform} rotate(180deg)` }} />
      </Column>
    </AbsoluteFill>
  );
};

const Couple: ClipComponent = ({ values, durationInFrames }) => {
  const fade = useClipFade(durationInFrames);
  const photo = useEnter(4);
  const bride = useEnter(14);
  const weds = useEnter(26);
  const groom = useEnter(38);
  const hasPhoto = Boolean(values.photo);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Backdrop durationInFrames={durationInFrames} />
      <Column gap={hasPhoto ? 18 : 36}>
        {hasPhoto ? (
          <div style={{ ...riseIn(photo, 30), marginBottom: 30 }}>
            <PhotoFrame src={values.photo} width={520} height={650} shape="arch" borderColor={GOLD} />
          </div>
        ) : null}
        <div style={riseIn(bride, 50)}>
          <FitText text={values.bride} width={TEXT_W} maxFontSize={hasPhoto ? 140 : 180} fontFamily={fonts.script} style={goldText} />
        </div>
        <div style={{ ...riseIn(weds), color: CREAM, fontFamily: fonts.serif, fontWeight: 600, fontSize: 52, letterSpacing: 12 }}>
          {values.connector}
        </div>
        <div style={riseIn(groom, 50)}>
          <FitText text={values.groom} width={TEXT_W} maxFontSize={hasPhoto ? 140 : 180} fontFamily={fonts.script} style={goldText} />
        </div>
      </Column>
    </AbsoluteFill>
  );
};

const Details: ClipComponent = ({ values, durationInFrames }) => {
  const fade = useClipFade(durationInFrames);
  const frame = useCurrentFrame();
  const lines: Array<{ key: string; size: number; family: string; weight?: number; color: string; spacing?: number }> = [
    { key: 'event', size: 96, family: fonts.script, color: GOLD },
    { key: 'date', size: 64, family: fonts.display, weight: 600, color: CREAM },
    { key: 'time', size: 48, family: fonts.serif, weight: 600, color: GOLD, spacing: 3 },
    { key: 'venue', size: 66, family: fonts.display, weight: 600, color: CREAM },
    { key: 'city', size: 48, family: fonts.serif, weight: 500, color: CREAM, spacing: 3 },
  ];
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Backdrop durationInFrames={durationInFrames} />
      <Column gap={34}>
        <Flourish width={380} color={GOLD} />
        {lines.map((l, i) => {
          const p = interpolate(frame, [8 + i * 9, 26 + i * 9], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          if (!values[l.key]) return null;
          return (
            <div key={l.key} style={riseIn(p, 30)}>
              <FitText
                text={values[l.key]}
                width={TEXT_W}
                maxFontSize={l.size}
                fontFamily={l.family}
                fontWeight={l.weight}
                style={{ color: l.color, letterSpacing: l.spacing, textShadow: '0 3px 12px rgba(0,0,0,0.3)' }}
              />
            </div>
          );
        })}
        <Flourish width={380} color={GOLD_SOFT} style={{ transform: 'rotate(180deg)' }} />
      </Column>
    </AbsoluteFill>
  );
};

const Closing: ClipComponent = ({ values, durationInFrames }) => {
  const fade = useClipFade(durationInFrames);
  const a = useEnter(6);
  const b = useEnter(18);
  const c = useEnter(32);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Backdrop durationInFrames={durationInFrames} />
      <Column gap={30}>
        <div style={riseIn(a)}>
          <FitText text={values.invite} width={TEXT_W} maxFontSize={58} fontFamily={fonts.serif} fontWeight={600} style={{ color: CREAM, letterSpacing: 4 }} />
        </div>
        <Flourish width={360} color={GOLD} style={riseIn(a)} />
        <div style={riseIn(b, 50)}>
          <FitText text={values.families} width={TEXT_W} maxFontSize={110} fontFamily={fonts.script} style={goldText} />
        </div>
        {values.rsvp ? (
          <div style={{ ...riseIn(c), marginTop: 40 }}>
            <FitText text={values.rsvp} width={TEXT_W} maxFontSize={44} fontFamily={fonts.serif} fontWeight={600} style={{ color: CREAM, letterSpacing: 2 }} />
          </div>
        ) : null}
      </Column>
    </AbsoluteFill>
  );
};

export const royalWedding: TemplateDefinition = {
  ...royalWeddingMeta,
  clips: { intro: Intro, couple: Couple, details: Details, closing: Closing },
};

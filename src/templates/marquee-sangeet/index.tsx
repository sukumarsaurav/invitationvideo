import type React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fonts } from '../shared/fonts';
import { enter, type Look, makeClips, Stack, Txt, useStagger } from '../shared/kit';
import { Glow, lineDivider, Sparkles } from '../shared/motifs';
import type { ClipComponent, TemplateDefinition } from '../types';
import { marqueeSangeetMeta } from './meta';

const GOLD = '#F4C430';

/** Bulbs round a rectangle, chasing: every third one is bright and the pattern steps along. */
const Bulbs: React.FC<{ x: number; y: number; w: number; h: number; gap: number; r: number }> = ({ x, y, w, h, gap, r }) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / 4);
  const pts: Array<[number, number]> = [];
  for (let d = 0; d < w; d += gap) pts.push([x + d, y]);
  for (let d = 0; d < h; d += gap) pts.push([x + w, y + d]);
  for (let d = 0; d < w; d += gap) pts.push([x + w - d, y + h]);
  for (let d = 0; d < h; d += gap) pts.push([x, y + h - d]);
  return (
    <g>
      {pts.map(([px, py], i) => {
        const lit = (i + step) % 3 === 0;
        return (
          <g key={i}>
            {lit ? <circle cx={px} cy={py} r={r * 2.4} fill="rgba(255,220,120,0.35)" /> : null}
            <circle cx={px} cy={py} r={r} fill={lit ? '#FFF6D0' : '#C9962A'} />
          </g>
        );
      })}
    </g>
  );
};

/** Velvet curtain half: vertical folds, gold trim at the inner edge. */
const Curtain: React.FC<{ side: 'left' | 'right'; shift: number }> = ({ side, shift }) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 580,
      [side]: 0,
      transform: `translateX(${side === 'left' ? -shift : shift}px)`,
      background: 'repeating-linear-gradient(90deg, #5A030C 0px, #9D0208 34px, #C1121F 52px, #9D0208 70px, #5A030C 96px)',
      boxShadow: side === 'left' ? 'inset -14px 0 0 #D4A017, 10px 0 30px rgba(0,0,0,0.5)' : 'inset 14px 0 0 #D4A017, -10px 0 30px rgba(0,0,0,0.5)',
    }}
  />
);

const Backdrop: React.FC<{ clip: string }> = ({ clip }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const open = clip === 'intro' ? spring({ frame: frame - 6, fps, config: { damping: 20, mass: 1.4 } }) : 1;
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, #3A0A10 0%, #1A0306 70%)' }}>
      <Glow x={540} y={900} r={620} color="rgba(255,214,120,0.22)" />
      <AbsoluteFill style={{ top: 1500, background: 'linear-gradient(180deg, #4A1A0A 0%, #2A0E05 100%)' }} />
      <Sparkles color={GOLD} count={18} seed="marquee" maxSize={20} opacity={0.7} />
      <Curtain side="left" shift={interpolate(open, [0, 1], [0, 430])} />
      <Curtain side="right" shift={interpolate(open, [0, 1], [0, 430])} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 150,
          background: 'repeating-radial-gradient(circle at 50% -40px, #9D0208 0 90px, #6A040F 90px 100px)',
          borderBottom: `10px solid ${GOLD}`,
          boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
        }}
      />
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        <Bulbs x={30} y={190} w={1020} h={1700} gap={68} r={9} />
      </svg>
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#FFF4D6',
  accent: GOLD,
  soft: '#F7A072',
  shadow: '0 4px 18px rgba(0,0,0,0.6)',
  roles: {
    title: { family: fonts.poster, scale: 1.25, spacing: 14 },
    subtitle: { family: fonts.caps, weight: 700, spacing: 8, scale: 0.6 },
    names: { family: fonts.fun, scale: 0.75 },
    heading: { family: fonts.poster, scale: 1.3, spacing: 4 },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.caps, weight: 700, spacing: 10, scale: 0.85 },
  },
  Divider: lineDivider(GOLD, 'diamond', 3),
  photo: { shape: 'rect', width: 460, height: 575, border: GOLD },
  motion: 'zoom',
  textWidth: 720,
  offsetY: 60,
};

/** Opening: the curtains part on a lit marquee sign. */
const Intro: ClipComponent = ({ values, durationInFrames }) => {
  const sign = useStagger(1, 18, 0)[0];
  const p = useStagger(3, 26, 9);
  return (
    <Stack look={look} durationInFrames={durationInFrames} clip="intro" gap={0}>
      <div style={{ position: 'relative', width: 880, height: 640, ...enter('zoom', sign) }}>
        <div style={{ position: 'absolute', inset: 0, background: '#2B0A0E', border: `8px solid ${GOLD}`, borderRadius: 36, boxShadow: '0 0 60px rgba(244,196,48,0.35)' }} />
        <svg width={880} height={640} style={{ position: 'absolute', inset: 0 }}>
          <Bulbs x={28} y={28} w={824} h={584} gap={56} r={10} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <div style={enter('rise', p[0])}>
            <Txt look={look} role="caps" text={values.blessing} width={700} />
          </div>
          <div style={enter('zoom', p[1])}>
            <Txt look={look} role="title" text={values.line1} width={700} />
          </div>
          <div style={enter('rise', p[2])}>
            <Txt look={look} role="subtitle" text={values.line2} width={700} />
          </div>
        </div>
      </div>
    </Stack>
  );
};

export const marqueeSangeet: TemplateDefinition = { ...marqueeSangeetMeta, clips: { ...makeClips(look), intro: Intro } };

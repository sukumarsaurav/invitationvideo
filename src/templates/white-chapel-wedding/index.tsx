import type React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { archPath, Dove, Glow, lineDivider, Petals } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { whiteChapelWeddingMeta } from './meta';

const NAVY = '#2E4A7D';
const GOLD = '#C9A85C';
const PANES = ['#BFD7EA', '#F4D6E0', '#F8E9B0', '#CDE5C8', '#D9CFF0'];

/** A gothic window of stained glass whose panes glow softly in turn. */
const Window: React.FC = () => {
  const frame = useCurrentFrame();
  const outline = archPath(540, 1500, 640, 1160, 'pointed');
  return (
    <g>
      <defs>
        <clipPath id="chapelWindow">
          <path d={outline} />
        </clipPath>
      </defs>
      <g clipPath="url(#chapelWindow)" opacity={0.42}>
        {Array.from({ length: 10 }, (_, r) =>
          Array.from({ length: 6 }, (_, c) => {
            const k = (r * 6 + c) % PANES.length;
            const glow = 0.6 + 0.4 * Math.sin(frame / 20 + r + c * 1.7);
            return <rect key={`${r}-${c}`} x={220 + c * 107} y={340 + r * 118} width={105} height={116} fill={PANES[k]} opacity={glow} />;
          }),
        )}
        {Array.from({ length: 7 }, (_, c) => (
          <path key={c} d={`M${220 + c * 107} 300 V1520`} stroke="#FFFFFF" strokeWidth={6} />
        ))}
        {Array.from({ length: 11 }, (_, r) => (
          <path key={r} d={`M200 ${340 + r * 118} H880`} stroke="#FFFFFF" strokeWidth={6} />
        ))}
      </g>
      <path d={outline} fill="none" stroke={GOLD} strokeWidth={6} />
      <path d={archPath(540, 1500, 600, 1120, 'pointed')} fill="none" stroke={GOLD} strokeWidth={2} />
    </g>
  );
};

/** A bell that swings and rings. */
const Bell: React.FC<{ x: number; phase: number }> = ({ x, phase }) => {
  const frame = useCurrentFrame();
  const swing = Math.sin(frame / 9 + phase) * 14;
  return (
    <g transform={`translate(${x} 120) rotate(${swing})`}>
      <path d="M0 0 V30" stroke={GOLD} strokeWidth={4} />
      <path d="M-10 32 C-12 50 -40 60 -44 100 L-52 112 H52 L44 100 C40 60 12 50 10 32 Z" fill={GOLD} />
      <circle cy={118} r={9} fill="#A8863E" />
    </g>
  );
};

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const fly = interpolate(frame, [0, 160], [-200, 1300]);
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #FDFCF9 0%, #F3F0E8 100%)' }}>
      <Glow x={540} y={900} r={560} color="rgba(255,240,200,0.6)" />
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        <Window />
        <Bell x={440} phase={0} />
        <Bell x={640} phase={1.6} />
        <path d="M60 1660 H1020" stroke={GOLD} strokeWidth={2} />
        <g transform={`translate(${fly} ${1760 - fly * 0.12})`}>
          <Dove size={90} flap={Math.sin(frame / 4)} />
        </g>
        <g transform={`translate(${fly - 160} ${1820 - fly * 0.12})`}>
          <Dove size={70} flap={Math.sin(frame / 4 + 1)} />
        </g>
      </svg>
      <Petals colors={['#FFFFFF', '#F4D6E0']} count={10} size={22} speed={0.5} seed="chapel" opacity={0.9} />
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#22324F',
  accent: NAVY,
  soft: '#8A7343',
  roles: {
    title: { family: fonts.script, scale: 0.85 },
    subtitle: { family: fonts.elegant, spacing: 10, scale: 0.55 },
    names: { family: fonts.script },
    heading: { family: fonts.display, weight: 600, scale: 0.9 },
    body: { family: fonts.serif, weight: 600, scale: 0.9 },
    caps: { family: fonts.elegant, spacing: 6, scale: 0.75 },
  },
  Divider: lineDivider(GOLD, 'diamond', 1.5),
  photo: { shape: 'arch', width: 420, height: 525, border: '#FFFFFF' },
  motion: 'blur',
  textWidth: 560,
  offsetY: -20,
};

export const whiteChapelWedding: TemplateDefinition = { ...whiteChapelWeddingMeta, clips: makeClips(look) };

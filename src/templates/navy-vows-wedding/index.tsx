import type React from 'react';
import { AbsoluteFill } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Glow, lineDivider, Sparkles, useProgress } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { navyVowsWeddingMeta } from './meta';

const GOLD = '#D4AF6A';

/** Filigree scroll in a corner, drawn on with a stroke. */
const Filigree: React.FC<{ x: number; y: number; sx: number; sy: number; draw: number }> = ({ x, y, sx, sy, draw }) => (
  <g transform={`translate(${x} ${y}) scale(${sx} ${sy})`} fill="none" stroke={GOLD} strokeWidth={3} strokeLinecap="round">
    {[
      'M0 0 C80 0 120 40 120 100 C120 140 90 160 64 150 C40 140 44 110 66 108',
      'M0 0 C0 80 40 120 100 120 C140 120 160 90 150 64 C140 40 110 44 108 66',
      'M30 30 C120 40 200 20 260 0',
      'M30 30 C40 120 20 200 0 260',
      'M160 10 C180 -10 210 -6 214 18',
      'M10 160 C-10 180 -6 210 18 214',
    ].map((d) => (
      <path key={d} d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
    ))}
    <circle cx={30} cy={30} r={7} fill={GOLD} opacity={draw} />
  </g>
);

const Backdrop: React.FC<{ clip: string }> = ({ clip }) => {
  const d = useProgress(0, 45);
  const draw = clip === 'intro' ? d : 1;
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, #1F3159 0%, #14213D 60%, #0B1428 100%)' }}>
      <Glow x={540} y={900} r={560} color="rgba(212,175,106,0.12)" />
      <Sparkles color="#EBD9A8" count={18} seed="vows" maxSize={14} opacity={0.6} />
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        <rect x={70} y={70} width={940} height={1780} fill="none" stroke={GOLD} strokeWidth={2} opacity={0.8} />
        <rect x={86} y={86} width={908} height={1748} fill="none" stroke={GOLD} strokeWidth={1} opacity={0.6} />
        <Filigree x={86} y={86} sx={1} sy={1} draw={draw} />
        <Filigree x={994} y={86} sx={-1} sy={1} draw={draw} />
        <Filigree x={86} y={1834} sx={1} sy={-1} draw={draw} />
        <Filigree x={994} y={1834} sx={-1} sy={-1} draw={draw} />
        <g transform="translate(540 170)" fill={GOLD} opacity={draw}>
          <rect x={-5} y={-40} width={10} height={80} rx={2} />
          <rect x={-26} y={-20} width={52} height={10} rx={2} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#F2EBDD',
  accent: GOLD,
  soft: '#B9C2D6',
  shadow: '0 2px 12px rgba(0,0,0,0.4)',
  roles: {
    title: { family: fonts.script, scale: 1.05 },
    subtitle: { family: fonts.caps, weight: 600, spacing: 12, scale: 0.6 },
    names: { family: fonts.script },
    heading: { family: fonts.caps, weight: 600, scale: 0.85 },
    body: { family: fonts.serif, weight: 500, style: { fontStyle: 'italic' } },
    caps: { family: fonts.caps, weight: 600, spacing: 6, scale: 0.72 },
  },
  Divider: lineDivider(GOLD, 'dot', 1.5),
  photo: { shape: 'rect', width: 480, height: 600, border: GOLD, style: { borderRadius: 6 } },
  motion: 'rise',
  textWidth: 760,
};

export const navyVowsWedding: TemplateDefinition = { ...navyVowsWeddingMeta, clips: makeClips(look) };

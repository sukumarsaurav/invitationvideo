import type React from 'react';
import { AbsoluteFill } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Leaf, lineDivider, Marigold, useSway } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { mundavalyaMarathiWeddingMeta } from './meta';

const GREEN = '#0F6B3E';
const MAROON = '#8B1E2D';

/** A mundavalya string: pearls with a gold bead every few, swaying from (x, top). */
const PearlString: React.FC<{ x: number; n: number; phase: number }> = ({ x, n, phase }) => {
  const sway = useSway(3, 60, phase);
  return (
    <g transform={`translate(${x} 70) rotate(${sway})`}>
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cy={18 + i * 26} r={i % 4 === 3 ? 10 : 11} fill={i % 4 === 3 ? '#E0B65A' : '#FFFDF6'} stroke="#D9CBA8" strokeWidth={1.5} />
      ))}
      <circle cy={18 + n * 26 + 6} r={14} fill={MAROON} />
    </g>
  );
};

/** A stack of green glass bangles (hirva chuda), seen edge-on. */
const Bangles: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: 9 }, (_, i) => (
      <ellipse key={i} cy={-i * 16} rx={110} ry={34} fill="none" stroke={i % 3 === 1 ? '#E0B65A' : GREEN} strokeWidth={12} />
    ))}
  </g>
);

const Backdrop: React.FC = () => (
  <AbsoluteFill style={{ background: 'linear-gradient(180deg, #FFF6E6 0%, #FCEBD0 100%)' }}>
    <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
      <rect width={1080} height={70} fill={MAROON} />
      {Array.from({ length: 22 }, (_, i) => (
        <g key={i} transform={`translate(${25 + i * 50} 70)`}>
          <Leaf len={i % 2 ? 110 : 90} color={i % 2 ? GREEN : '#2E8B57'} vein="#0A4A2A" rotate={180} />
        </g>
      ))}
      {[150, 250, 350, 730, 830, 930].map((x, i) => (
        <PearlString key={x} x={x} n={[12, 9, 6, 6, 9, 12][i]} phase={i * 0.7} />
      ))}
      <Bangles x={170} y={1820} />
      <Bangles x={910} y={1820} />
      <g transform="translate(540 1850)">
        <Marigold r={60} />
      </g>
      <rect x={50} y={50} width={980} height={1820} rx={30} fill="none" stroke={MAROON} strokeWidth={3} opacity={0.4} />
    </svg>
  </AbsoluteFill>
);

const look: Look = {
  Backdrop,
  ink: '#3C2416',
  accent: MAROON,
  soft: GREEN,
  roles: {
    title: { family: fonts.script, scale: 0.95 },
    subtitle: { family: fonts.caps, weight: 700, spacing: 12, scale: 0.7, color: GREEN },
    names: { family: fonts.script },
    heading: { family: fonts.display, weight: 600 },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.caps, weight: 700, spacing: 6, scale: 0.85 },
  },
  Divider: lineDivider(GREEN, 'leaf'),
  photo: { shape: 'circle', width: 480, height: 480, border: GREEN },
  motion: 'drop',
  textWidth: 760,
  offsetY: 60,
};

export const mundavalyaMarathiWedding: TemplateDefinition = { ...mundavalyaMarathiWeddingMeta, clips: makeClips(look) };

import type React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { archPath, Glow, lineDivider } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { derasarJainWeddingMeta } from './meta';

const RED = '#B23A1E';
const MARBLE = '#FBF7F0';
const LINE = '#D9C8AE';

/** A shikhar (temple spire) of stacked, narrowing bands, drawn from its base centre. */
const Shikhar: React.FC<{ x: number; base: number; w: number; h: number }> = ({ x, base, w, h }) => (
  <g>
    <path d={`M${x - w / 2} ${base} C${x - w / 2} ${base - h * 0.6} ${x - w * 0.1} ${base - h * 0.95} ${x} ${base - h} C${x + w * 0.1} ${base - h * 0.95} ${x + w / 2} ${base - h * 0.6} ${x + w / 2} ${base} Z`} fill={MARBLE} stroke={LINE} strokeWidth={3} />
    {Array.from({ length: 6 }, (_, i) => {
      const yy = base - (h * (i + 1)) / 7;
      const half = (w / 2) * (1 - ((i + 1) / 7) ** 1.6);
      return <path key={i} d={`M${x - half} ${yy} H${x + half}`} stroke={LINE} strokeWidth={2} />;
    })}
    <circle cx={x} cy={base - h - 10} r={12} fill="#E0B65A" />
  </g>
);

/** A dhwaja (temple flag) rippling from a pole at (x, y). */
const Flag: React.FC<{ x: number; y: number; phase: number }> = ({ x, y, phase }) => {
  const frame = useCurrentFrame();
  const w = (k: number) => Math.sin(frame / 6 + phase + k) * 10;
  return (
    <g>
      <path d={`M${x} ${y} V${y - 120}`} stroke="#8D6E3F" strokeWidth={4} />
      <path d={`M${x} ${y - 120} Q${x + 40} ${y - 120 + w(0)} ${x + 90} ${y - 110 + w(1)} L${x + 80} ${y - 85 + w(2)} Q${x + 40} ${y - 90 + w(1)} ${x} ${y - 80} Z`} fill={RED} />
      <path d={`M${x} ${y - 95} Q${x + 40} ${y - 100 + w(1)} ${x + 84} ${y - 97 + w(2)}`} stroke="#F2C14E" strokeWidth={6} fill="none" />
    </g>
  );
};

const Backdrop: React.FC = () => (
  <AbsoluteFill style={{ background: 'linear-gradient(180deg, #FFE7CC 0%, #FDF4E8 40%, #F7EFE3 100%)' }}>
    <Glow x={540} y={260} r={520} color="rgba(232,131,58,0.25)" />
    <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
      <g opacity={0.95}>
        <Shikhar x={540} base={1700} w={280} h={280} />
        <Shikhar x={340} base={1720} w={160} h={190} />
        <Shikhar x={740} base={1720} w={160} h={190} />
        <Shikhar x={170} base={1740} w={110} h={160} />
        <Shikhar x={910} base={1740} w={110} h={160} />
        <rect x={60} y={1700} width={960} height={220} fill={MARBLE} stroke={LINE} strokeWidth={3} />
        {[180, 340, 540, 740, 900].map((x) => (
          <path key={x} d={archPath(x, 1880, 90, 150, 'round')} fill="#EDE2D0" stroke={LINE} strokeWidth={2} />
        ))}
      </g>
      <Flag x={540} y={1410} phase={0} />
      <Flag x={340} y={1520} phase={1.5} />
      <Flag x={740} y={1520} phase={3} />
      <path d="M0 60 H1080 M0 72 H1080" stroke={RED} strokeWidth={4} opacity={0.6} />
    </svg>
  </AbsoluteFill>
);

const look: Look = {
  Backdrop,
  ink: '#4A2A14',
  accent: RED,
  soft: '#A0682E',
  roles: {
    title: { family: fonts.script, scale: 1 },
    subtitle: { family: fonts.caps, weight: 600, spacing: 10, scale: 0.55 },
    names: { family: fonts.script },
    heading: { family: fonts.display, weight: 600 },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.caps, weight: 700, spacing: 8, scale: 0.9 },
  },
  Divider: lineDivider('#D08A4A', 'diamond'),
  photo: { shape: 'arch', width: 400, height: 500, border: RED },
  motion: 'rise',
  textWidth: 780,
  offsetY: -200,
};

export const derasarJainWedding: TemplateDefinition = { ...derasarJainWeddingMeta, clips: makeClips(look) };

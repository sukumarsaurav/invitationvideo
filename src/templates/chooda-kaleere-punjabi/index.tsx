import type React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { lineDivider, Sparkles } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { choodaKaleerePunjabiMeta } from './meta';

const RED = '#C8102E';
const GOLD = '#E3B04B';

/** A chooda stack: red and ivory bangles, seen edge-on, with gold bands. */
const Chooda: React.FC<{ x: number; y: number; rotate: number }> = ({ x, y, rotate }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    {Array.from({ length: 12 }, (_, i) => (
      <ellipse key={i} cy={-i * 15} rx={120} ry={36} fill="none" stroke={i % 4 === 0 ? GOLD : i % 4 === 2 ? '#FFF4E8' : RED} strokeWidth={13} />
    ))}
  </g>
);

/** A kalira: chains ending in a golden umbrella with dangling drops, swinging. */
const Kalira: React.FC<{ x: number; len: number; phase: number }> = ({ x, len, phase }) => {
  const frame = useCurrentFrame();
  const swing = Math.sin(frame / 15 + phase) * 6;
  return (
    <g transform={`translate(${x} 0) rotate(${swing})`}>
      {[-12, 0, 12].map((d) => (
        <path key={d} d={`M${d} 0 Q${d * 2} ${len / 2} ${d} ${len}`} stroke={GOLD} strokeWidth={3} fill="none" />
      ))}
      <g transform={`translate(0 ${len})`}>
        <path d="M-70 40 C-60 0 -30 -14 0 -16 C30 -14 60 0 70 40 Q35 30 0 40 Q-35 30 -70 40 Z" fill={GOLD} stroke="#B07D22" strokeWidth={2} />
        {Array.from({ length: 7 }, (_, i) => {
          const dx = -60 + i * 20;
          const l = 40 + (i % 2) * 22;
          return (
            <g key={i}>
              <path d={`M${dx} 36 V${36 + l}`} stroke={GOLD} strokeWidth={2} />
              <path d={`M${dx} ${36 + l} l-7 8 l7 12 l7 -12 Z`} fill={i % 2 ? '#FFF4E8' : GOLD} />
            </g>
          );
        })}
        <circle r={10} cy={-4} fill="#B5172F" />
      </g>
    </g>
  );
};

const Backdrop: React.FC = () => (
  <AbsoluteFill style={{ background: 'linear-gradient(180deg, #FFF3F1 0%, #FDE3E1 100%)' }}>
    <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
      {Array.from({ length: 12 }, (_, r) =>
        Array.from({ length: 8 }, (_, c) => <circle key={`${r}-${c}`} cx={c * 150 + (r % 2 ? 75 : 0)} cy={r * 170} r={5} fill={RED} opacity={0.12} />),
      )}
      <Kalira x={120} len={260} phase={0} />
      <Kalira x={260} len={140} phase={1.2} />
      <Kalira x={820} len={140} phase={2.1} />
      <Kalira x={960} len={260} phase={0.6} />
      <Chooda x={190} y={1840} rotate={-10} />
      <Chooda x={890} y={1840} rotate={10} />
    </svg>
    <Sparkles color={GOLD} count={16} seed="chooda" maxSize={18} opacity={0.7} />
  </AbsoluteFill>
);

const look: Look = {
  Backdrop,
  ink: '#4D1420',
  accent: RED,
  soft: '#B07D22',
  roles: {
    title: { family: fonts.fun, scale: 0.85 },
    subtitle: { family: fonts.caps, weight: 700, spacing: 8, scale: 0.6, color: '#4D1420' },
    names: { family: fonts.script },
    heading: { family: fonts.display, weight: 700 },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.caps, weight: 700, spacing: 8, scale: 0.9 },
  },
  Divider: lineDivider(GOLD, 'diamond'),
  photo: { shape: 'arch', width: 440, height: 550, border: RED },
  motion: 'zoom',
  textWidth: 760,
  offsetY: 70,
};

export const choodaKaleerePunjabi: TemplateDefinition = { ...choodaKaleerePunjabiMeta, clips: makeClips(look) };

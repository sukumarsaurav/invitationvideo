import type React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { lineDivider, useProgress } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { alpanaBengaliWeddingMeta } from './meta';

const RED = '#B71C1C';

/** Alpana: rings of petals and dotted loops that draw themselves on, in sindoor red. */
const Alpana: React.FC<{ r: number; draw: number }> = ({ r, draw }) => {
  const frame = useCurrentFrame();
  const ring = (n: number, rad: number, len: number, w: number, k: number) =>
    Array.from({ length: n }, (_, i) => (
      <path
        key={`${k}-${i}`}
        transform={`rotate(${(360 / n) * i})`}
        d={`M0 ${-rad} C${w} ${-rad - len * 0.4} ${w * 0.6} ${-rad - len * 0.9} 0 ${-rad - len} C${-w * 0.6} ${-rad - len * 0.9} ${-w} ${-rad - len * 0.4} 0 ${-rad} Z`}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - Math.min(1, Math.max(0, draw * 1.6 - k * 0.2))}
      />
    ));
  return (
    <g transform={`rotate(${frame * 0.08})`} fill="none" stroke={RED} strokeWidth={3} strokeLinecap="round">
      <circle r={r * 0.08} fill={RED} />
      {ring(8, r * 0.12, r * 0.2, r * 0.08, 0)}
      <circle r={r * 0.36} strokeDasharray="2 12" />
      {ring(16, r * 0.4, r * 0.22, r * 0.06, 1)}
      <circle r={r * 0.66} />
      {ring(24, r * 0.68, r * 0.3, r * 0.05, 2)}
      {Array.from({ length: 48 }, (_, i) => (
        <circle key={i} cx={Math.cos((i / 48) * Math.PI * 2) * r} cy={Math.sin((i / 48) * Math.PI * 2) * r} r={4} fill={RED} stroke="none" opacity={draw} />
      ))}
    </g>
  );
};

/** Shankha (conch shell), drawn at the origin pointing right. */
const Conch: React.FC<{ x: number; y: number; rotate: number; scale: number }> = ({ x, y, rotate, scale }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
    <path d="M-70 0 C-60 -40 0 -50 60 -18 C80 -8 80 8 60 18 C0 50 -60 40 -70 0 Z" fill="#FFFDF8" stroke={RED} strokeWidth={4} />
    <path d="M-40 -20 C-10 -10 -10 10 -40 20 M-10 -26 C14 -12 14 12 -10 26 M20 -22 C38 -10 38 10 20 22" fill="none" stroke={RED} strokeWidth={3} />
    <path d="M60 -18 L86 -6 L86 6 L60 18" fill={RED} />
  </g>
);

/** Lal-paar border: a red band with a white running motif, like a red-bordered white saree. */
const Border: React.FC<{ y: number }> = ({ y }) => (
  <g transform={`translate(0 ${y})`}>
    <rect width={1080} height={90} fill={RED} />
    <rect y={96} width={1080} height={8} fill={RED} />
    {Array.from({ length: 27 }, (_, i) => (
      <path key={i} d={`M${i * 40 + 20} 20 L${i * 40 + 34} 45 L${i * 40 + 20} 70 L${i * 40 + 6} 45 Z`} fill="#FFF8F0" opacity={0.9} />
    ))}
  </g>
);

const Backdrop: React.FC<{ clip: string }> = ({ clip }) => {
  const d = useProgress(0, 60);
  return (
    <AbsoluteFill style={{ background: '#FFF8F0' }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        <g transform="translate(540 960)" opacity={0.18}>
          <Alpana r={480} draw={clip === 'intro' ? d : 1} />
        </g>
        <Border y={0} />
        <g transform="translate(0 1920) scale(1 -1)">
          <Border y={0} />
        </g>
        <Conch x={140} y={1720} rotate={-20} scale={1.1} />
        <Conch x={940} y={1720} rotate={200} scale={1.1} />
      </svg>
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#4A1010',
  accent: RED,
  soft: '#A0522D',
  roles: {
    title: { family: fonts.script, scale: 1.05 },
    subtitle: { family: fonts.caps, weight: 700, spacing: 14, scale: 0.8 },
    names: { family: fonts.script },
    heading: { family: fonts.display, weight: 600 },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.caps, weight: 700, spacing: 8, scale: 0.9 },
  },
  Divider: lineDivider(RED, 'diamond'),
  photo: { shape: 'arch', width: 480, height: 600, border: RED },
  motion: 'rise',
  textWidth: 780,
};

export const alpanaBengaliWedding: TemplateDefinition = { ...alpanaBengaliWeddingMeta, clips: makeClips(look) };

import type React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Glow, lineDivider, Sparkles } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { jaagoNightPunjabiMeta } from './meta';

const FLAME = '#FFB13B';

/** A diya flame that flickers. */
const Flame: React.FC<{ x: number; y: number; seed: number }> = ({ x, y, seed }) => {
  const frame = useCurrentFrame();
  const f = 1 + Math.sin(frame / 2.5 + seed) * 0.12 + Math.sin(frame / 1.7 + seed * 2) * 0.06;
  return (
    <g transform={`translate(${x} ${y}) scale(1 ${f})`}>
      <circle cy={-20} r={34} fill="rgba(255,177,59,0.25)" />
      <path d="M0 -44 C14 -24 12 -6 0 0 C-12 -6 -14 -24 0 -44 Z" fill="#FFD36B" />
      <path d="M0 -30 C6 -18 5 -8 0 -4 C-5 -8 -6 -18 0 -30 Z" fill="#FFF4C7" />
    </g>
  );
};

/** The jaago gaggar: a brass pot crowned with diyas, carried high and bobbing. */
const Gaggar: React.FC<{ x: number; y: number; scale: number }> = ({ x, y, scale }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 10) * 10;
  return (
    <g transform={`translate(${x} ${y + bob}) rotate(${Math.sin(frame / 14) * 3}) scale(${scale})`}>
      <path d="M-70 -70 H70 L56 -50 H-56 Z" fill="#C88A2A" />
      <path d="M-56 -50 C-160 -10 -160 120 -60 150 H60 C160 120 160 -10 56 -50 Z" fill="#D9A441" />
      <path d="M-120 30 C-50 50 50 50 120 30" stroke="#B5172F" strokeWidth={14} fill="none" />
      <path d="M-116 70 C-50 90 50 90 116 70" stroke="#2E7D32" strokeWidth={8} fill="none" />
      {[-60, -30, 0, 30, 60].map((d) => (
        <g key={d}>
          <ellipse cx={d} cy={-74} rx={16} ry={7} fill="#8D5A2B" />
          <Flame x={d} y={-78} seed={d} />
        </g>
      ))}
      <g transform="translate(0 -150)">
        <ellipse rx={18} ry={8} fill="#8D5A2B" />
        <Flame x={0} y={-4} seed={99} />
      </g>
    </g>
  );
};

/** Embers rising from the gaggar. */
const Embers: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: 26 }, (_, i) => {
        const t = ((frame * (1.5 + random(`es${i}`) * 1.5) + random(`eo${i}`) * 900) % 900) / 900;
        const ex = x + (random(`ex${i}`) - 0.5) * 320 + Math.sin(frame / 10 + i) * 20;
        return <circle key={i} cx={ex} cy={y - t * 900} r={3 + random(`er${i}`) * 4} fill={FLAME} opacity={1 - t} />;
      })}
    </g>
  );
};

const Backdrop: React.FC = () => (
  <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0D0820 0%, #1B0F2E 60%, #3A1A2E 100%)' }}>
    <Sparkles color="#FFFFFF" count={30} seed="jaago" maxSize={10} opacity={0.7} />
    <Glow x={540} y={1690} r={460} color="rgba(255,177,59,0.32)" />
    <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
      <Embers x={540} y={1600} />
      <Gaggar x={540} y={1700} scale={1.1} />
      {Array.from({ length: 24 }, (_, i) => (
        <path key={i} d={`M${i * 46} 0 L${i * 46 + 23} 40 L${i * 46 + 46} 0 Z`} fill={['#FF7A2F', '#F25C8E', '#FFD447', '#3FB8AF'][i % 4]} />
      ))}
    </svg>
  </AbsoluteFill>
);

const look: Look = {
  Backdrop,
  ink: '#FFF3DD',
  accent: FLAME,
  soft: '#F7A8C4',
  shadow: '0 3px 16px rgba(0,0,0,0.6)',
  roles: {
    title: { family: fonts.fun, scale: 0.95 },
    subtitle: { family: fonts.poster, spacing: 20, scale: 1.3, color: '#FFF3DD' },
    names: { family: fonts.fun, scale: 0.72 },
    heading: { family: fonts.poster, scale: 1.3, spacing: 3 },
    body: { family: fonts.sans, weight: 500, scale: 0.8 },
    caps: { family: fonts.sans, weight: 700, spacing: 8, scale: 0.75 },
  },
  Divider: lineDivider(FLAME, 'diamond', 3),
  photo: { shape: 'circle', width: 460, height: 460, border: FLAME },
  motion: 'zoom',
  textWidth: 780,
  offsetY: -170,
};

export const jaagoNightPunjabi: TemplateDefinition = { ...jaagoNightPunjabiMeta, clips: makeClips(look) };

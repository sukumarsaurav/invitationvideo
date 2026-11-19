import type React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Glow, Leaf, lineDivider, Marigold } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { haladMarathiMeta } from './meta';

const KUNKU = '#B71C1C';
const GREEN = '#1B7F45';

/** A brass ghangal (water pot) of haldi with a mango-leaf crown. */
const Ghangal: React.FC<{ x: number; y: number; scale: number }> = ({ x, y, scale }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {[-50, -20, 20, 50].map((a) => (
      <Leaf key={a} y={-120} len={90} color={GREEN} vein="#0E4F2A" rotate={a} />
    ))}
    <ellipse cy={-118} rx={56} ry={12} fill="#F9A825" />
    <path d="M-50 -120 H50 L40 -100 H-40 Z" fill="#C8902E" />
    <path d="M-40 -100 C-130 -70 -130 50 -50 80 H50 C130 50 130 -70 40 -100 Z" fill="#D9A441" />
    <path d="M-90 -20 C-40 -4 40 -4 90 -20" stroke={KUNKU} strokeWidth={8} fill="none" />
    {[-60, -30, 0, 30, 60].map((d) => (
      <circle key={d} cx={d} cy={20} r={7} fill={KUNKU} />
    ))}
  </g>
);

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #FFE38A 0%, #FFD54F 55%, #FFC233 100%)' }}>
      <Glow x={540} y={950} r={620} color="rgba(255,252,230,0.8)" />
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        {Array.from({ length: 70 }, (_, i) => {
          const x = random(`kx${i}`) * 1080;
          const y = random(`ky${i}`) * 1920;
          const edge = Math.min(x, 1080 - x, y, 1920 - y);
          if (edge > 220) return null;
          const pulse = 0.7 + 0.3 * Math.sin(frame / 12 + i);
          return <circle key={i} cx={x} cy={y} r={(5 + random(`kr${i}`) * 9) * pulse} fill={KUNKU} opacity={0.75} />;
        })}
        <Ghangal x={200} y={1790} scale={0.9} />
        <Ghangal x={880} y={1790} scale={0.9} />
        {[[120, 140], [960, 140], [540, 120]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${frame * (i % 2 ? -0.6 : 0.6)})`}>
            <Marigold r={i === 2 ? 60 : 50} />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#4A2A00',
  accent: KUNKU,
  soft: GREEN,
  roles: {
    title: { family: fonts.fun, scale: 0.85 },
    subtitle: { family: fonts.caps, weight: 700, spacing: 14, scale: 0.8, color: GREEN },
    names: { family: fonts.script },
    heading: { family: fonts.display, weight: 700 },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.caps, weight: 700, spacing: 8 },
  },
  Divider: lineDivider(GREEN, 'leaf'),
  photo: { shape: 'circle', width: 500, height: 500, border: KUNKU },
  motion: 'zoom',
  textWidth: 740,
};

export const haladMarathi: TemplateDefinition = { ...haladMarathiMeta, clips: makeClips(look) };

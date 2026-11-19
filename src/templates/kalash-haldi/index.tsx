import type React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Leaf, lineDivider, Marigold, useSway } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { kalashHaldiMeta } from './meta';

const MAROON = '#7A1F2B';
const MANGO = ['#2F6A2C', '#3F7D3A', '#4C8C3A'];

/** A turning rangoli: rings of petals and dots in festival colours. */
const Rangoli: React.FC<{ x: number; y: number; r: number; opacity: number }> = ({ x, y, r, opacity }) => {
  const frame = useCurrentFrame();
  const rings = [
    { n: 24, rad: 1, color: '#E8590C', w: 0.1 },
    { n: 18, rad: 0.8, color: '#C2185B', w: 0.12 },
    { n: 12, rad: 0.58, color: '#2E7D32', w: 0.15 },
    { n: 8, rad: 0.36, color: '#F59F00', w: 0.2 },
  ];
  return (
    <g transform={`translate(${x} ${y}) rotate(${frame * 0.15})`} opacity={opacity}>
      {rings.map((ring, k) => (
        <g key={k} transform={`rotate(${k % 2 ? -frame * 0.3 : 0})`}>
          {Array.from({ length: ring.n }, (_, i) => (
            <g key={i} transform={`rotate(${(360 / ring.n) * i})`}>
              <ellipse cy={-r * ring.rad * 0.82} rx={r * ring.w} ry={r * ring.rad * 0.2} fill={ring.color} />
              <circle cy={-r * ring.rad} r={r * 0.018} fill="#FFFFFF" />
            </g>
          ))}
          <circle r={r * ring.rad * 0.62} fill="none" stroke={ring.color} strokeWidth={3} strokeDasharray="4 10" />
        </g>
      ))}
      <circle r={r * 0.12} fill="#F59F00" />
    </g>
  );
};

/** A brass kalash with mango leaves and a coconut. */
const Kalash: React.FC<{ x: number; y: number; scale: number }> = ({ x, y, scale }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {[-60, -30, 0, 30, 60].map((a, i) => (
      <Leaf key={a} y={-150} len={110} color={MANGO[i % 3]} vein="#1E4A1C" rotate={a} />
    ))}
    <ellipse cy={-190} rx={48} ry={58} fill="#8D5A2B" />
    <path d="M-20 -236 C-10 -250 10 -250 20 -236" stroke="#5C3A1A" strokeWidth={5} fill="none" />
    <path d="M-60 -150 H60 L50 -130 H-50 Z" fill="#D49B2A" />
    <path d="M-50 -130 C-140 -100 -140 40 -60 70 H60 C140 40 140 -100 50 -130 Z" fill="#E0A82E" />
    <path d="M-110 -40 H110" stroke={MAROON} strokeWidth={10} />
    <path d="M-104 -10 H104" stroke="#F5D06F" strokeWidth={4} />
    <g transform="translate(0 20)" fill={MAROON}>
      <circle r={16} />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} r={6} transform={`rotate(${a}) translate(0 -30)`} />
      ))}
    </g>
    <path d="M-70 70 H70 L80 96 H-80 Z" fill="#C88B22" />
  </g>
);

const Backdrop: React.FC = () => {
  const sway = useSway(1.5, 90);
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, #FFF6D6 0%, #FFE9A3 60%, #F7D46B 100%)' }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        <Rangoli x={540} y={960} r={520} opacity={0.16} />
        <g transform={`rotate(${sway} 540 0)`}>
          <path d="M-20 34 H1100" stroke={MAROON} strokeWidth={8} />
          {Array.from({ length: 22 }, (_, i) => (
            <g key={i} transform={`translate(${12 + i * 50} 34)`}>
              <Leaf len={i % 2 ? 120 : 96} color={MANGO[i % 3]} vein="#1E4A1C" rotate={180} />
              {i % 4 === 1 ? (
                <g transform="translate(0 20)">
                  <Marigold r={22} />
                </g>
              ) : null}
            </g>
          ))}
        </g>
        <Kalash x={540} y={1800} scale={0.9} />
        <g transform="translate(150 1830)">
          <Marigold r={56} />
        </g>
        <g transform="translate(930 1830)">
          <Marigold r={56} />
        </g>
        <rect x={50} y={180} width={980} height={1500} rx={490} fill="none" stroke={MAROON} strokeWidth={3} opacity={0.35} />
      </svg>
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#5A3410',
  accent: MAROON,
  soft: '#A0522D',
  roles: {
    title: { family: fonts.script, scale: 1.05 },
    subtitle: { family: fonts.caps, weight: 700, spacing: 14, scale: 0.8 },
    names: { family: fonts.script },
    heading: { family: fonts.display, weight: 600 },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.caps, weight: 600, spacing: 5, scale: 0.85 },
  },
  Divider: lineDivider(MAROON, 'diamond'),
  photo: { shape: 'arch', width: 460, height: 575, border: MAROON },
  motion: 'rise',
  textWidth: 720,
  offsetY: -20,
};

export const kalashHaldi: TemplateDefinition = { ...kalashHaldiMeta, clips: makeClips(look) };

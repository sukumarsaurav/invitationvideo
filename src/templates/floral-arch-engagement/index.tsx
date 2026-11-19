import type React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Bloom, Leaf, lineDivider, Petals } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { floralArchEngagementMeta } from './meta';

const LEAF = ['#7E9A78', '#A3B99C', '#5F7B5A'];
const BLUSH: [string, string, string] = ['#FFFFFF', '#F7DDE2', '#EDBAC4'];
const CREAM: [string, string, string] = ['#FFFDF7', '#F6EEDB', '#EBDDBC'];

// The arch: straight sides from y=1640 up to y=720, a half circle of radius 350 on top.
const LEFT = 190;
const RIGHT = 890;
const SPRING = 720;
const BASE = 1640;
const R = (RIGHT - LEFT) / 2;

/** Points along the arch with the outward direction (degrees) at each. */
const archPoints = (n: number) => {
  const pts: Array<{ x: number; y: number; out: number }> = [];
  const side = BASE - SPRING;
  const arc = Math.PI * R;
  const total = side * 2 + arc;
  for (let i = 0; i < n; i++) {
    const d = (i / (n - 1)) * total;
    if (d < side) pts.push({ x: LEFT, y: BASE - d, out: -90 });
    else if (d < side + arc) {
      const a = Math.PI - (d - side) / R;
      pts.push({ x: 540 + Math.cos(a) * R, y: SPRING - Math.sin(a) * R, out: -((a * 180) / Math.PI) });
    } else pts.push({ x: RIGHT, y: SPRING + (d - side - arc), out: 90 });
  }
  return pts;
};

const POINTS = archPoints(46);

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #EEF2EA 0%, #E2EADD 100%)' }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        <path d={`M${LEFT} ${BASE} V${SPRING} A${R} ${R} 0 0 1 ${RIGHT} ${SPRING} V${BASE} Z`} fill="#FBFCF8" opacity={0.85} />
        <path d={`M${LEFT} ${BASE} V${SPRING} A${R} ${R} 0 0 1 ${RIGHT} ${SPRING} V${BASE}`} fill="none" stroke="#B9C9B2" strokeWidth={3} />
        {POINTS.map((p, i) => {
          const sway = Math.sin(frame / 30 + i) * 6;
          const lean = (i % 2 ? 35 : -35) + sway;
          return (
            <Leaf key={i} x={p.x} y={p.y} len={70 + (i % 3) * 18} color={LEAF[i % 3]} vein="#4E6649" rotate={p.out + 90 + lean} />
          );
        })}
        {[
          { x: LEFT, y: SPRING - 10, r: 62, c: BLUSH },
          { x: 300, y: 450, r: 48, c: CREAM },
          { x: 540, y: 368, r: 70, c: BLUSH },
          { x: 780, y: 450, r: 48, c: CREAM },
          { x: RIGHT, y: SPRING - 10, r: 62, c: BLUSH },
          { x: LEFT, y: BASE - 20, r: 80, c: BLUSH },
          { x: LEFT + 70, y: BASE + 20, r: 52, c: CREAM },
          { x: RIGHT, y: BASE - 20, r: 80, c: BLUSH },
          { x: RIGHT - 70, y: BASE + 20, r: 52, c: CREAM },
        ].map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${b.y}) scale(${1 + Math.sin(frame / 40 + i) * 0.03})`}>
            <Bloom r={b.r} colors={b.c} center="#E7C27A" turn={i * 23} />
          </g>
        ))}
      </svg>
      <Petals colors={['#FFFFFF', '#F7DDE2']} count={10} size={26} speed={0.6} opacity={0.8} seed="arch" />
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#3E4A3D',
  accent: '#A85C70',
  soft: '#6F8A69',
  roles: {
    title: { family: fonts.script, scale: 0.85 },
    subtitle: { family: fonts.elegant, spacing: 12, scale: 0.7 },
    names: { family: fonts.script, scale: 0.9 },
    heading: { family: fonts.elegant, scale: 0.85 },
    body: { family: fonts.serif, weight: 600, scale: 0.9 },
    caps: { family: fonts.elegant, spacing: 6, scale: 0.85 },
  },
  Divider: lineDivider('#8FA888', 'leaf'),
  photo: { shape: 'arch', width: 420, height: 525, border: '#FFFFFF' },
  motion: 'rise',
  textWidth: 600,
  offsetY: 50,
};

export const floralArchEngagement: TemplateDefinition = { ...floralArchEngagementMeta, clips: makeClips(look) };

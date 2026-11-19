import type React from 'react';
import { AbsoluteFill, random, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { lineDivider } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { turmericSplashHaldiMeta } from './meta';

/** A smooth wobbly blob path around the origin. */
const blobPath = (r: number, seed: string, t: number): string => {
  const n = 10;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + (random(`${seed}${i}`) - 0.5) * 0.45 + Math.sin(t / 18 + i) * 0.04;
    return [Math.cos(a) * r * k, Math.sin(a) * r * k];
  });
  const mid = (p: number[], q: number[]) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  let d = `M${mid(pts[n - 1], pts[0]).join(' ')}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const m = mid(p, pts[(i + 1) % n]);
    d += ` Q${p[0]} ${p[1]} ${m[0]} ${m[1]}`;
  }
  return `${d} Z`;
};

/** A splash that bursts in with a spring, with droplets thrown outwards. */
const Splash: React.FC<{ x: number; y: number; r: number; color: string; seed: string; delay: number }> = ({ x, y, r, color, seed, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 11, mass: 0.7 } });
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={blobPath(r * s, seed, frame)} fill={color} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = random(`${seed}a${i}`) * Math.PI * 2;
        const dist = r * (1.1 + random(`${seed}d${i}`) * 0.7) * s;
        return <circle key={i} cx={Math.cos(a) * dist} cy={Math.sin(a) * dist} r={(6 + random(`${seed}r${i}`) * 16) * s} fill={color} />;
      })}
    </g>
  );
};

const Backdrop: React.FC = () => (
  <AbsoluteFill style={{ background: '#FFF8E7' }}>
    <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
      <Splash x={60} y={120} r={260} color="#F2B705" seed="a" delay={0} />
      <Splash x={1030} y={360} r={150} color="#FFD23F" seed="b" delay={6} />
      <Splash x={980} y={1800} r={280} color="#F2B705" seed="c" delay={3} />
      <Splash x={90} y={1560} r={120} color="#FFD23F" seed="d" delay={9} />
      <Splash x={170} y={1820} r={70} color="#E8890C" seed="e" delay={12} />
      <Splash x={880} y={160} r={60} color="#E8890C" seed="f" delay={10} />
    </svg>
  </AbsoluteFill>
);

const look: Look = {
  Backdrop,
  ink: '#2D2A26',
  accent: '#1E6B45',
  soft: '#C7790A',
  roles: {
    title: { family: fonts.poster, scale: 1.6, color: '#E8890C', style: { letterSpacing: 6 } },
    subtitle: { family: fonts.sans, weight: 700, spacing: 6, scale: 0.5, color: '#2D2A26' },
    names: { family: fonts.fun, scale: 0.7 },
    heading: { family: fonts.sans, weight: 700, scale: 0.85 },
    body: { family: fonts.sans, weight: 500, scale: 0.8 },
    caps: { family: fonts.sans, weight: 700, spacing: 8, scale: 0.75 },
  },
  Divider: lineDivider('#E8890C', 'dot', 3),
  photo: { shape: 'circle', width: 540, height: 540, border: '#F2B705' },
  motion: 'zoom',
  textWidth: 800,
};

export const turmericSplashHaldi: TemplateDefinition = { ...turmericSplashHaldiMeta, clips: makeClips(look) };

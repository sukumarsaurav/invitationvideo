import type React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Confetti, lineDivider, useSway } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { dholBeatsSangeetMeta } from './meta';

const FLAGS = ['#FFD23F', '#06D6A0', '#FF5D8F', '#3A86FF', '#FFFFFF', '#FB5607'];
const BEAT = 15; // frames per beat: 120 bpm at 30 fps

/** A string of triangle flags hanging in a curve, swaying. */
const Bunting: React.FC<{ y: number; sag: number; phase: number; flip?: boolean }> = ({ y, sag, phase, flip }) => {
  const sway = useSway(1.2, 60, phase);
  const n = 16;
  const point = (t: number) => ({ x: -40 + t * 1160, y: y + Math.sin(t * Math.PI) * sag });
  return (
    <g transform={`rotate(${sway} 540 ${y})${flip ? ` translate(0 ${2 * y}) scale(1 -1)` : ''}`}>
      <path d={`M-40 ${y} Q540 ${y + sag * 2} 1120 ${y}`} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.85} />
      {Array.from({ length: n }, (_, i) => {
        const a = point(i / n);
        const b = point((i + 0.8) / n);
        const tip = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + 70 };
        return <path key={i} d={`M${a.x} ${a.y} L${b.x} ${b.y} L${tip.x} ${tip.y} Z`} fill={FLAGS[i % FLAGS.length]} />;
      })}
    </g>
  );
};

/** A dhol drum on its side, bouncing on the beat. */
const Dhol: React.FC<{ x: number; y: number; scale: number; rotate: number }> = ({ x, y, scale, rotate }) => {
  const frame = useCurrentFrame();
  const bounce = Math.max(0, 1 - (frame % BEAT) / 6) * 14;
  return (
    <g transform={`translate(${x} ${y - bounce}) rotate(${rotate}) scale(${scale})`}>
      <rect x={-150} y={-90} width={300} height={180} rx={60} fill="#8B2E0B" />
      {Array.from({ length: 7 }, (_, i) => (
        <path key={i} d={`M${-130 + i * 43} -88 L${-108 + i * 43} 88`} stroke="#FFD23F" strokeWidth={6} />
      ))}
      <ellipse cx={-150} rx={36} ry={92} fill="#F4E3C1" stroke="#5C1E06" strokeWidth={8} />
      <ellipse cx={150} rx={36} ry={92} fill="#F4E3C1" stroke="#5C1E06" strokeWidth={8} />
      <path d="M-150 -100 Q0 -190 150 -100" stroke="#FFFFFF" strokeWidth={6} fill="none" />
    </g>
  );
};

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const beat = (frame % BEAT) / BEAT;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(160deg, #B5179E 0%, #E5383B 55%, #F77F00 100%)' }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        {[0, 1, 2].map((k) => {
          const t = (beat + k / 3) % 1;
          return <circle key={k} cx={540} cy={960} r={260 + t * 700} fill="none" stroke="#FFFFFF" strokeWidth={10 * (1 - t)} opacity={0.35 * (1 - t)} />;
        })}
        <Bunting y={30} sag={70} phase={0} />
        <Bunting y={150} sag={50} phase={1.4} />
        <Dhol x={200} y={1780} scale={0.7} rotate={-12} />
        <Dhol x={880} y={1790} scale={0.6} rotate={14} />
      </svg>
      <Confetti colors={FLAGS} count={50} seed="dhol" />
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#FFFFFF',
  accent: '#FFE066',
  soft: '#FFE3F1',
  shadow: '0 4px 0 rgba(90,10,40,0.35), 0 6px 20px rgba(0,0,0,0.3)',
  roles: {
    title: { family: fonts.poster, scale: 1.45, spacing: 10 },
    subtitle: { family: fonts.fun, scale: 0.7, color: '#FFFFFF' },
    names: { family: fonts.fun, scale: 0.75 },
    heading: { family: fonts.poster, scale: 1.35, spacing: 3 },
    body: { family: fonts.sans, weight: 700, scale: 0.8 },
    caps: { family: fonts.sans, weight: 700, spacing: 8, scale: 0.75 },
  },
  Divider: lineDivider('#FFFFFF', 'diamond', 3),
  photo: { shape: 'circle', width: 520, height: 520, border: '#FFE066' },
  motion: 'zoom',
  textWidth: 820,
  offsetY: 40,
};

export const dholBeatsSangeet: TemplateDefinition = { ...dholBeatsSangeetMeta, clips: makeClips(look) };

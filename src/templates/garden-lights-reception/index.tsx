import type React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Bubbles, Glow, Leaf, lineDivider } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { gardenLightsReceptionMeta } from './meta';

const WARM = '#F6D28B';
const LEAVES = ['#2D6A4F', '#40916C', '#1B4332', '#52B788'];

/** A string of bulbs drooping between two points, each twinkling on its own. */
const LightString: React.FC<{ x1: number; y1: number; x2: number; y2: number; sag: number; n: number; seed: string }> = ({ x1, y1, x2, y2, sag, n, seed }) => {
  const frame = useCurrentFrame();
  const at = (t: number) => ({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * sag });
  const mid = at(0.5);
  return (
    <g>
      <path d={`M${x1} ${y1} Q${mid.x} ${mid.y + sag} ${x2} ${y2}`} stroke="#0A1A12" strokeWidth={3} fill="none" />
      {Array.from({ length: n }, (_, i) => {
        const p = at((i + 0.5) / n);
        const tw = 0.65 + 0.35 * Math.sin(frame / (6 + random(`${seed}${i}`) * 6) + random(`${seed}p${i}`) * 6);
        return (
          <g key={i} transform={`translate(${p.x} ${p.y})`}>
            <circle cy={18} r={30} fill={`rgba(246,210,139,${0.28 * tw})`} />
            <rect x={-5} y={0} width={10} height={8} fill="#333" />
            <ellipse cy={18} rx={9} ry={12} fill={`rgba(255,236,190,${tw})`} />
          </g>
        );
      })}
    </g>
  );
};

/** Greenery hanging down from the top edge at x, swaying. */
const Vine: React.FC<{ x: number; len: number; phase: number }> = ({ x, len, phase }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 45 + phase) * 3;
  const n = Math.floor(len / 40);
  return (
    <g transform={`translate(${x} -10) rotate(${sway})`}>
      <path d={`M0 0 Q12 ${len / 2} 0 ${len}`} stroke="#1B4332" strokeWidth={3} fill="none" />
      {Array.from({ length: n }, (_, i) => (
        <Leaf key={i} y={i * 40 + 20} len={44 - (i / n) * 14} color={LEAVES[i % 4]} rotate={i % 2 ? 130 : 230} />
      ))}
    </g>
  );
};

const Backdrop: React.FC = () => (
  <AbsoluteFill style={{ background: 'linear-gradient(180deg, #081C14 0%, #0E2A1F 40%, #1B4332 100%)' }}>
    <Glow x={540} y={1000} r={600} color="rgba(246,210,139,0.12)" />
    <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
      {[40, 110, 190, 900, 980, 1050].map((x, i) => (
        <Vine key={x} x={x} len={[520, 360, 240, 260, 380, 540][i]} phase={i} />
      ))}
      <LightString x1={-20} y1={120} x2={1100} y2={120} sag={120} n={14} seed="a" />
      <LightString x1={-20} y1={260} x2={1100} y2={200} sag={90} n={12} seed="b" />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i} transform={`translate(${i * 135 - 20} 1930)`}>
          {[-50, -20, 10, 40].map((a, k) => (
            <Leaf key={a} len={180 + ((i + k) % 3) * 50} color={LEAVES[(i + k) % 4]} rotate={a} />
          ))}
        </g>
      ))}
    </svg>
    <Bubbles color={WARM} count={22} seed="firefly" maxSize={12} filled />
  </AbsoluteFill>
);

const look: Look = {
  Backdrop,
  ink: '#F4EEDC',
  accent: WARM,
  soft: '#A7D7B8',
  shadow: '0 3px 14px rgba(0,0,0,0.5)',
  roles: {
    title: { family: fonts.script, scale: 1 },
    subtitle: { family: fonts.sans, weight: 500, spacing: 14, scale: 0.55 },
    names: { family: fonts.script },
    heading: { family: fonts.elegant },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.sans, weight: 500, spacing: 8, scale: 0.72 },
  },
  Divider: lineDivider(WARM, 'leaf', 1.5),
  photo: { shape: 'circle', width: 520, height: 520, border: WARM },
  motion: 'blur',
  textWidth: 780,
  offsetY: 70,
};

export const gardenLightsReception: TemplateDefinition = { ...gardenLightsReceptionMeta, clips: makeClips(look) };

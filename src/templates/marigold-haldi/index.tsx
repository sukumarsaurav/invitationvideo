import type React from 'react';
import { AbsoluteFill } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Glow, Leaf, lineDivider, Marigold, Petals, useSway } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { marigoldHaldiMeta } from './meta';

const GREEN = '#1F5E3B';
const MAROON = '#8A1C2B';

/** A string (ladi) of marigolds hanging from the top edge, swaying. */
const Ladi: React.FC<{ x: number; count: number; phase: number; size?: number }> = ({ x, count, phase, size = 30 }) => {
  const sway = useSway(2.2, 80, phase);
  const gap = size * 1.7;
  return (
    <g transform={`translate(${x} -10) rotate(${sway})`}>
      <path d={`M0 0 V${count * gap}`} stroke="#6B4E16" strokeWidth={2} />
      {Array.from({ length: count }, (_, i) => (
        <g key={i} transform={`translate(0 ${gap * (i + 0.6)}) rotate(${i * 27})`}>
          <Marigold r={size} outer={i % 3 === 2 ? '#F97316' : '#F59E0B'} inner={i % 3 === 2 ? '#FB923C' : '#FCD34D'} center="#9A3412" />
        </g>
      ))}
      <g transform={`translate(0 ${gap * (count + 0.3)})`}>
        <Leaf len={50} color="#3F7D3A" rotate={160} />
        <Leaf len={50} color="#2F6A2C" rotate={200} />
      </g>
    </g>
  );
};

const STRINGS = [
  { x: 70, n: 9 },
  { x: 170, n: 6 },
  { x: 270, n: 4 },
  { x: 370, n: 3 },
  { x: 710, n: 3 },
  { x: 810, n: 4 },
  { x: 910, n: 6 },
  { x: 1010, n: 9 },
];

const Backdrop: React.FC = () => (
  <AbsoluteFill style={{ background: 'linear-gradient(180deg, #FFE27A 0%, #FFD54A 45%, #FDBA2C 100%)' }}>
    <Glow x={540} y={1000} r={600} color="rgba(255,250,220,0.75)" />
    <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
      <path d="M0 18 Q540 110 1080 18" stroke="#2F6A2C" strokeWidth={6} fill="none" />
      {Array.from({ length: 19 }, (_, i) => {
        const x = 30 + i * 56;
        const y = 18 + Math.sin((x / 1080) * Math.PI) * 46;
        return <Leaf key={i} x={x} y={y} len={66} color={i % 2 ? '#2F6A2C' : '#3F7D3A'} vein="#1E4A1C" rotate={180 + (i % 2 ? 14 : -14)} />;
      })}
      {STRINGS.map((s, i) => (
        <Ladi key={s.x} x={s.x} count={s.n} phase={i * 0.8} />
      ))}
      {[
        { x: 80, y: 1850, r: 70 },
        { x: 190, y: 1880, r: 52 },
        { x: 1000, y: 1850, r: 70 },
        { x: 890, y: 1880, r: 52 },
      ].map((m, i) => (
        <g key={i} transform={`translate(${m.x} ${m.y})`}>
          <Marigold r={m.r} />
        </g>
      ))}
    </svg>
    <Petals colors={['#F59E0B', '#F97316', '#FCD34D']} count={14} size={24} speed={0.8} seed="haldi" />
  </AbsoluteFill>
);

const look: Look = {
  Backdrop,
  ink: GREEN,
  accent: MAROON,
  soft: '#9A5B0F',
  roles: {
    title: { family: fonts.fun, scale: 0.9 },
    subtitle: { family: fonts.caps, weight: 700, spacing: 14, color: GREEN, scale: 0.8 },
    names: { family: fonts.script },
    heading: { family: fonts.display, weight: 700 },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.caps, weight: 700, spacing: 6 },
  },
  Divider: lineDivider(GREEN, 'leaf'),
  photo: { shape: 'circle', width: 520, height: 520, border: '#F97316' },
  motion: 'zoom',
  textWidth: 640,
  offsetY: 110,
};

export const marigoldHaldi: TemplateDefinition = { ...marigoldHaldiMeta, clips: makeClips(look) };

import type React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Bloom, Dove, Leaf, lineDivider, useSway } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { rosesDovesWeddingMeta } from './meta';

const SAGE = '#7D9A82';
const ROSE: [string, string, string] = ['#FFFFFF', '#F6F3EC', '#ECE6D8'];

/** A spray of eucalyptus: round grey-green leaves along a curved stem. */
const Eucalyptus: React.FC<{ x: number; y: number; rotate: number; len: number; phase: number }> = ({ x, y, rotate, len, phase }) => {
  const sway = useSway(2, 80, phase);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate + sway})`}>
      <path d={`M0 0 Q20 ${-len / 2} 0 ${-len}`} stroke="#6F8A74" strokeWidth={3} fill="none" />
      {Array.from({ length: 9 }, (_, i) => (
        <ellipse key={i} cx={i % 2 ? 24 : -24} cy={-len * (0.12 + i * 0.1)} rx={22} ry={18} fill={i % 3 ? '#A9BDA9' : '#93AB95'} />
      ))}
    </g>
  );
};

const Corner: React.FC<{ x: number; y: number; flip: number }> = ({ x, y, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip * 1.5} ${flip * 1.5})`}>
    <Eucalyptus x={0} y={0} rotate={120} len={420} phase={0} />
    <Eucalyptus x={0} y={0} rotate={160} len={360} phase={1} />
    <Leaf x={40} y={20} len={140} color={SAGE} rotate={100} />
    <g transform="translate(80 70)">
      <Bloom r={90} colors={ROSE} petals={7} center="#E8D9A8" />
    </g>
    <g transform="translate(190 30)">
      <Bloom r={60} colors={ROSE} petals={6} center="#E8D9A8" turn={20} />
    </g>
    <g transform="translate(40 170)">
      <Bloom r={56} colors={ROSE} petals={6} center="#E8D9A8" turn={40} />
    </g>
  </g>
);

const Backdrop: React.FC<{ clip: string }> = ({ clip }) => {
  const frame = useCurrentFrame();
  // On the opening the two doves fly in from either side and meet; afterwards they hover together.
  const meet = clip === 'intro' ? interpolate(frame, [0, 60], [0, 1], { extrapolateRight: 'clamp' }) : 1;
  const bob = Math.sin(frame / 12) * 6;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #F4F7F2 0%, #E6ECE3 100%)' }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        <Corner x={10} y={10} flip={1} />
        <Corner x={1070} y={1910} flip={-1} />
        <g transform={`translate(${interpolate(meet, [0, 1], [-100, 470])} ${400 + bob})`}>
          <Dove size={110} flap={Math.sin(frame / 4)} />
        </g>
        <g transform={`translate(${interpolate(meet, [0, 1], [1180, 610])} ${400 - bob}) scale(-1 1)`}>
          <Dove size={110} flap={Math.sin(frame / 4 + 1)} />
        </g>
        <path d="M540 300 C520 270 480 280 490 310 C500 330 540 350 540 350 C540 350 580 330 590 310 C600 280 560 270 540 300 Z" fill="#E7A4B4" opacity={meet > 0.95 ? 1 : 0} transform="translate(0 10)" />
      </svg>
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#3A4A3E',
  accent: '#56705C',
  soft: '#8A9A8C',
  roles: {
    title: { family: fonts.scriptAlt, scale: 1.05 },
    subtitle: { family: fonts.elegant, spacing: 14, scale: 0.7 },
    names: { family: fonts.scriptAlt },
    heading: { family: fonts.elegant },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.elegant, spacing: 8, scale: 0.8 },
  },
  Divider: lineDivider('#A9BDA9', 'leaf'),
  photo: { shape: 'circle', width: 520, height: 520, border: '#FFFFFF' },
  motion: 'blur',
  textWidth: 780,
  offsetY: 60,
};

export const rosesDovesWedding: TemplateDefinition = { ...rosesDovesWeddingMeta, clips: makeClips(look) };

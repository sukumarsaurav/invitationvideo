import type React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Glow, lineDivider, Sparkles } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { gajBaraatWeddingMeta } from './meta';

const GOLD = '#E7B54A';
const NIGHT = '#1A1F4D';

/** A caparisoned elephant walking right, with a jhool cloth and a chhatra (umbrella) on top. */
const Elephant: React.FC<{ step: number }> = ({ step }) => {
  const leg = (dx: number, phase: number) => {
    const a = Math.sin(step + phase) * 8;
    return <rect key={dx} x={dx - 16} y={0} width={32} height={90} rx={10} fill="#2A2F63" transform={`rotate(${a} ${dx} 0)`} />;
  };
  return (
    <g>
      {leg(-80, 0)}
      {leg(-40, Math.PI)}
      {leg(50, Math.PI)}
      {leg(90, 0)}
      <path d="M-120 10 C-130 -90 -40 -130 40 -120 C110 -114 150 -80 150 -20 C150 10 130 20 110 20 H-110 Z" fill="#2A2F63" />
      <path d="M120 -100 C190 -110 210 -40 190 30 C185 50 200 70 214 80 C196 86 176 70 172 40 C168 10 160 -20 140 -30 Z" fill="#2A2F63" />
      <path d="M140 -80 C160 -100 180 -60 160 -40 Z" fill="#232853" />
      <circle cx={176} cy={-60} r={4} fill={GOLD} />
      <path d="M-90 -100 C-40 -116 40 -116 90 -100 L100 0 C40 20 -40 20 -100 0 Z" fill="#B3122E" />
      <path d="M-100 0 C-40 20 40 20 100 0" stroke={GOLD} strokeWidth={6} fill="none" />
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={i} cx={-84 + i * 24} cy={10} r={6} fill={GOLD} />
      ))}
      <path d="M150 -100 C170 -116 196 -110 200 -90 C190 -96 170 -96 150 -86 Z" fill={GOLD} />
      <rect x={-50} y={-150} width={100} height={36} rx={8} fill={GOLD} />
      <path d="M0 -150 V-250" stroke={GOLD} strokeWidth={5} />
      <path d="M-80 -240 Q0 -300 80 -240 Z" fill="#B3122E" stroke={GOLD} strokeWidth={4} />
      {Array.from({ length: 7 }, (_, i) => (
        <path key={i} d={`M${-72 + i * 24} -240 v14`} stroke={GOLD} strokeWidth={4} />
      ))}
    </g>
  );
};

/** A firework burst that blooms and fades every few seconds. */
const Firework: React.FC<{ x: number; y: number; delay: number; color: string }> = ({ x, y, delay, color }) => {
  const frame = useCurrentFrame();
  const t = ((frame - delay + 600) % 75) / 75;
  return (
    <g transform={`translate(${x} ${y})`} opacity={1 - t}>
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const r = 20 + t * 130;
        return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r + t * t * 40} r={5 * (1 - t) + 1} fill={color} />;
      })}
    </g>
  );
};

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const walk = (frame * 2.2) % 1500;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #0C0F2E 0%, ${NIGHT} 55%, #3A2A5A 100%)` }}>
      <Sparkles color="#FFFFFF" count={34} seed="baraat" maxSize={12} opacity={0.7} />
      <Glow x={540} y={1760} r={620} color="rgba(231,181,74,0.22)" />
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        <Firework x={200} y={260} delay={0} color={GOLD} />
        <Firework x={880} y={220} delay={30} color="#F25C8E" />
        <Firework x={560} y={150} delay={55} color="#7FD3F7" />
        <path d="M0 1880 Q540 1830 1080 1880 V1920 H0 Z" fill="#14183D" />
        {[0, 1, 2].map((k) => (
          <g key={k} transform={`translate(${((walk + k * 500) % 1500) - 300} 1710) scale(0.75)`}>
            <Elephant step={frame / 6 + k} />
          </g>
        ))}
        <rect x={40} y={40} width={1000} height={1840} rx={20} fill="none" stroke={GOLD} strokeWidth={3} opacity={0.6} />
      </svg>
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#FBF0D9',
  accent: GOLD,
  soft: '#C7C9F0',
  shadow: '0 3px 14px rgba(0,0,0,0.5)',
  roles: {
    title: { family: fonts.script, scale: 0.95 },
    subtitle: { family: fonts.caps, weight: 700, spacing: 16, scale: 0.8 },
    names: { family: fonts.script },
    heading: { family: fonts.caps, weight: 600, scale: 0.85 },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.caps, weight: 700, spacing: 10, scale: 0.85 },
  },
  Divider: lineDivider(GOLD, 'diamond'),
  photo: { shape: 'arch', width: 440, height: 550, border: GOLD },
  motion: 'rise',
  textWidth: 780,
  offsetY: -130,
};

export const gajBaraatWedding: TemplateDefinition = { ...gajBaraatWeddingMeta, clips: makeClips(look) };

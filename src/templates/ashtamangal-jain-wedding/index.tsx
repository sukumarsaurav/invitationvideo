import type React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useSlowZoom } from '../shared/anim';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Glow, Leaf, lineDivider, Lotus, Sparkles } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { ashtamangalJainWeddingMeta } from './meta';

const GOLD = '#E9C46A';

/** Purna kalash: pot with leaves and coconut. */
const Kalash: React.FC = () => (
  <g fill={GOLD}>
    {[-40, -15, 15, 40].map((a) => (
      <Leaf key={a} y={-70} len={60} color="#7FB069" rotate={a} />
    ))}
    <ellipse cy={-86} rx={24} ry={30} fill="#A9743A" />
    <path d="M-30 -70 H30 L24 -58 H-24 Z" />
    <path d="M-24 -58 C-74 -40 -74 34 -30 50 H30 C74 34 74 -40 24 -58 Z" />
    <path d="M-56 -6 H56" stroke="#7A0F1E" strokeWidth={6} />
  </g>
);

/** Meen yugal: two fish curved toward each other. */
const TwinFish: React.FC = () => (
  <g fill="none" stroke={GOLD} strokeWidth={5} strokeLinecap="round">
    <path d="M-10 -60 C-60 -40 -60 30 -10 50 L-30 70 M-10 50 L10 70" />
    <path d="M10 -60 C60 -40 60 30 10 50" />
    <circle cx={-24} cy={-40} r={4} fill={GOLD} />
    <circle cx={24} cy={-40} r={4} fill={GOLD} />
  </g>
);

/** Darpan: a hand mirror. */
const Mirror: React.FC = () => (
  <g>
    <circle cy={-20} r={44} fill="none" stroke={GOLD} strokeWidth={6} />
    <circle cy={-20} r={30} fill="rgba(233,196,106,0.25)" />
    <path d="M0 24 V70" stroke={GOLD} strokeWidth={10} strokeLinecap="round" />
  </g>
);

const Sign: React.FC<{ x: number; y: number; kind: number }> = ({ x, y, kind }) => {
  const frame = useCurrentFrame();
  const s = 1 + Math.sin(frame / 25 + kind) * 0.04;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={88} fill="rgba(0,0,0,0.18)" stroke={GOLD} strokeWidth={3} />
      {kind === 0 ? <Kalash /> : kind === 1 ? <TwinFish /> : kind === 2 ? <Mirror /> : <g transform="translate(0 40)"><Lotus size={90} colors={['#F7C6D0', '#EE8FA6']} stroke={GOLD} /></g>}
    </g>
  );
};

const Backdrop: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const zoom = useSlowZoom(durationInFrames, 1.04);
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, #9C1426 0%, #7A0F1E 55%, #4D0812 100%)' }}>
      <Glow x={540} y={960} r={560} color="rgba(233,196,106,0.14)" />
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
          <rect x={40} y={40} width={1000} height={1840} rx={20} fill="none" stroke={GOLD} strokeWidth={4} />
          <rect x={58} y={58} width={964} height={1804} rx={14} fill="none" stroke={GOLD} strokeWidth={1.5} opacity={0.7} />
          <Sign x={180} y={200} kind={0} />
          <Sign x={900} y={200} kind={1} />
          <Sign x={180} y={1720} kind={2} />
          <Sign x={900} y={1720} kind={3} />
          <Sign x={540} y={170} kind={3} />
          <Sign x={540} y={1750} kind={0} />
        </svg>
      </AbsoluteFill>
      <Sparkles color="#F7DFA0" count={18} seed="mangal" maxSize={16} opacity={0.6} />
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#FFF2DA',
  accent: GOLD,
  soft: '#F2C9A0',
  shadow: '0 3px 14px rgba(0,0,0,0.4)',
  roles: {
    title: { family: fonts.script, scale: 1.05 },
    subtitle: { family: fonts.caps, weight: 700, spacing: 14, scale: 0.75 },
    names: { family: fonts.script },
    heading: { family: fonts.display, weight: 600 },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.caps, weight: 700, spacing: 8, scale: 0.9 },
  },
  Divider: lineDivider(GOLD, 'diamond'),
  photo: { shape: 'circle', width: 480, height: 480, border: GOLD },
  motion: 'zoom',
  textWidth: 760,
};

export const ashtamangalJainWedding: TemplateDefinition = { ...ashtamangalJainWeddingMeta, clips: makeClips(look) };

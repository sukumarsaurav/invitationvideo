import type React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useSlowZoom } from '../shared/anim';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Glow, lineDivider, Sparkles } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { hennaMandalaMehndiMeta } from './meta';

const HENNA = '#C8743A';
const GOLD = '#E6C27A';

/** A henna mandala: petal rings, scallops and dots drawn in fine lines. */
const Mandala: React.FC<{ r: number; color: string }> = ({ r, color }) => (
  <g fill="none" stroke={color} strokeWidth={3} strokeLinecap="round">
    <circle r={r * 0.1} />
    <circle r={r * 0.16} strokeDasharray="2 9" />
    {Array.from({ length: 8 }, (_, i) => (
      <path key={`a${i}`} transform={`rotate(${i * 45})`} d={`M0 ${-r * 0.18} C${r * 0.09} ${-r * 0.25} ${r * 0.09} ${-r * 0.36} 0 ${-r * 0.42} C${-r * 0.09} ${-r * 0.36} ${-r * 0.09} ${-r * 0.25} 0 ${-r * 0.18} Z`} />
    ))}
    <circle r={r * 0.45} />
    {Array.from({ length: 16 }, (_, i) => (
      <g key={`b${i}`} transform={`rotate(${i * 22.5})`}>
        <path d={`M${-r * 0.08} ${-r * 0.47} Q0 ${-r * 0.66} ${r * 0.08} ${-r * 0.47}`} />
        <path d={`M0 ${-r * 0.5} V${-r * 0.58}`} />
        <circle cy={-r * 0.62} r={r * 0.012} fill={color} />
      </g>
    ))}
    <circle r={r * 0.7} />
    <circle r={r * 0.73} strokeDasharray="1 12" strokeWidth={5} />
    {Array.from({ length: 24 }, (_, i) => (
      <g key={`c${i}`} transform={`rotate(${i * 15})`}>
        <path d={`M0 ${-r * 0.75} C${r * 0.07} ${-r * 0.82} ${r * 0.05} ${-r * 0.93} 0 ${-r} C${-r * 0.05} ${-r * 0.93} ${-r * 0.07} ${-r * 0.82} 0 ${-r * 0.75} Z`} />
        <path d={`M0 ${-r * 0.79} V${-r * 0.93}`} strokeWidth={1.5} />
      </g>
    ))}
  </g>
);

/** A paisley (mango) motif with an inner swirl and dotted outline. */
const Paisley: React.FC<{ x: number; y: number; scale: number; rotate: number }> = ({ x, y, scale, rotate }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`} fill="none" stroke={GOLD} strokeWidth={3} strokeLinecap="round">
    <path d="M0 80 C-70 80 -90 0 -50 -50 C-20 -90 40 -100 60 -140 C70 -80 70 -20 50 30 C38 62 22 80 0 80 Z" />
    <path d="M0 52 C-40 52 -54 6 -30 -24 C-12 -46 22 -56 34 -80 C40 -44 40 -10 28 18 C20 38 12 52 0 52 Z" />
    <path d="M-6 20 C-20 0 0 -20 14 -6 C22 4 10 18 -6 20 Z" fill={GOLD} />
    {Array.from({ length: 12 }, (_, i) => (
      <circle key={i} cx={Math.cos((i / 12) * Math.PI * 2) * 104} cy={Math.sin((i / 12) * Math.PI * 2) * 104 - 20} r={4} fill={GOLD} stroke="none" />
    ))}
  </g>
);

const Backdrop: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const zoom = useSlowZoom(durationInFrames, 1.06);
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, #1D5C45 0%, #123F30 60%, #0A2A20 100%)' }}>
      <Glow x={540} y={960} r={560} color="rgba(200,116,58,0.18)" />
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute', transform: `scale(${zoom})` }}>
        <g transform={`translate(540 960) rotate(${frame * 0.12})`} opacity={0.45}>
          <Mandala r={500} color={HENNA} />
        </g>
        <Paisley x={130} y={190} scale={0.9} rotate={-30} />
        <Paisley x={950} y={190} scale={0.9} rotate={30} />
        <Paisley x={130} y={1740} scale={0.9} rotate={-150} />
        <Paisley x={950} y={1740} scale={0.9} rotate={150} />
      </svg>
      <div style={{ position: 'absolute', inset: 40, border: `3px solid ${GOLD}`, borderRadius: 24, opacity: 0.55 }} />
      <Sparkles color={GOLD} count={14} seed="henna" maxSize={18} opacity={0.6} />
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#F7EBD3',
  accent: GOLD,
  soft: '#E3A36D',
  shadow: '0 3px 14px rgba(0,0,0,0.45)',
  roles: {
    title: { family: fonts.script, scale: 1.05 },
    subtitle: { family: fonts.caps, weight: 700, spacing: 14, scale: 0.8 },
    names: { family: fonts.script },
    heading: { family: fonts.display, weight: 600 },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.caps, weight: 600, spacing: 6, scale: 0.9 },
  },
  Divider: lineDivider(GOLD, 'leaf'),
  photo: { shape: 'circle', width: 540, height: 540, border: GOLD },
  motion: 'blur',
  textWidth: 780,
};

export const hennaMandalaMehndi: TemplateDefinition = { ...hennaMandalaMehndiMeta, clips: makeClips(look) };

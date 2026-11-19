import type React from 'react';
import { AbsoluteFill } from 'remotion';
import { useSlowZoom } from '../shared/anim';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Glow, lineDivider, Sparkles, useSway } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { templeBellsWeddingMeta } from './meta';

const GOLD = '#D9B45A';
const GOLD_LIGHT = '#F1D88E';

/** A temple bell on its chain, swinging from (x, 0). */
const Bell: React.FC<{ x: number; chain: number; size: number; phase: number }> = ({ x, chain, size, phase }) => {
  const swing = useSway(5, 48, phase);
  return (
    <g transform={`translate(${x} 0) rotate(${swing})`}>
      {Array.from({ length: Math.floor(chain / 22) }, (_, i) => (
        <ellipse key={i} cx={0} cy={11 + i * 22} rx={5} ry={10} fill="none" stroke={GOLD} strokeWidth={3} />
      ))}
      <g transform={`translate(0 ${chain}) scale(${size / 100})`}>
        <circle cy={6} r={9} fill={GOLD_LIGHT} />
        <path d="M-10 12 C-14 30 -36 40 -40 80 L-48 92 H48 L40 80 C36 40 14 30 10 12 Z" fill={GOLD} />
        <path d="M-44 86 H44" stroke="#8C6A1E" strokeWidth={4} />
        <path d="M-28 50 C-20 44 20 44 28 50" stroke="#8C6A1E" strokeWidth={3} fill="none" />
        <circle cy={100} r={9} fill={GOLD_LIGHT} />
      </g>
    </g>
  );
};

/** Tiered temple tower, drawn from its base centre. */
const Gopuram: React.FC<{ x: number; y: number; scale: number; opacity: number }> = ({ x, y, scale, opacity }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} fill={GOLD}>
    {Array.from({ length: 6 }, (_, i) => {
      const w = 420 - i * 58;
      const top = -(i + 1) * 70;
      return (
        <g key={i}>
          <path d={`M${-w / 2} ${top + 70} L${-w / 2 + 14} ${top} H${w / 2 - 14} L${w / 2} ${top + 70} Z`} />
          {Array.from({ length: 5 - Math.floor(i / 2) }, (_, k) => {
            const step = w / (6 - Math.floor(i / 2));
            return <path key={k} d={`M${-w / 2 + step * (k + 1) - 9} ${top + 58} V${top + 30} A9 9 0 0 1 ${-w / 2 + step * (k + 1) + 9} ${top + 30} V${top + 58} Z`} fill="#0B3528" />;
          })}
        </g>
      );
    })}
    <path d="M-80 -420 C-80 -500 80 -500 80 -420 Z" />
    {[-50, 0, 50].map((k) => (
      <g key={k} transform={`translate(${k} -470)`}>
        <ellipse cy={-12} rx={10} ry={16} />
        <path d="M0 -40 V-26" stroke={GOLD} strokeWidth={4} />
      </g>
    ))}
  </g>
);

/** A row of temple-border triangles, like a silk saree edge. */
const TempleBorder: React.FC<{ y: number; flip?: boolean }> = ({ y, flip }) => (
  <g transform={`translate(0 ${y}) scale(1 ${flip ? -1 : 1})`}>
    <rect x={0} y={0} width={1080} height={10} fill={GOLD} />
    {Array.from({ length: 28 }, (_, i) => (
      <path key={i} d={`M${i * 40} 10 L${i * 40 + 20} 44 L${i * 40 + 40} 10 Z`} fill={GOLD} opacity={0.85} />
    ))}
    {Array.from({ length: 27 }, (_, i) => (
      <circle key={i} cx={i * 40 + 40} cy={22} r={4} fill={GOLD_LIGHT} />
    ))}
  </g>
);

const Backdrop: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const zoom = useSlowZoom(durationInFrames, 1.04);
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0B2E24 0%, #145A43 50%, #0B2E24 100%)' }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute', opacity: 0.12 }}>
          {Array.from({ length: 22 }, (_, r) =>
            Array.from({ length: 13 }, (_, c) => <circle key={`${r}-${c}`} cx={c * 90 + (r % 2 ? 45 : 0)} cy={r * 90} r={4} fill={GOLD_LIGHT} />),
          )}
        </svg>
        <Glow x={540} y={960} r={620} color="rgba(241,216,142,0.16)" />
      </AbsoluteFill>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        <Gopuram x={540} y={1876} scale={0.75} opacity={0.14} />
        <TempleBorder y={0} />
        <TempleBorder y={1920} flip />
        <Bell x={150} chain={170} size={130} phase={0} />
        <Bell x={310} chain={100} size={100} phase={1.3} />
        <Bell x={770} chain={100} size={100} phase={2.1} />
        <Bell x={930} chain={170} size={130} phase={0.7} />
      </svg>
      <Sparkles color={GOLD_LIGHT} count={16} seed="temple" maxSize={22} opacity={0.6} />
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#FBF1D6',
  accent: GOLD_LIGHT,
  soft: GOLD,
  shadow: '0 3px 12px rgba(0,0,0,0.35)',
  roles: {
    title: { family: fonts.script },
    subtitle: { family: fonts.caps, weight: 700, spacing: 12 },
    names: { family: fonts.scriptAlt },
    heading: { family: fonts.elegant },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.caps, weight: 600, spacing: 6 },
  },
  Divider: lineDivider(GOLD, 'diamond'),
  photo: { shape: 'arch', width: 500, height: 625, border: GOLD },
  motion: 'rise',
  textWidth: 800,
  offsetY: 40,
};

export const templeBellsWedding: TemplateDefinition = { ...templeBellsWeddingMeta, clips: makeClips(look) };

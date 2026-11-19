import type React from 'react';
import { AbsoluteFill } from 'remotion';
import { useSlowZoom } from '../shared/anim';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Glow, lineDivider, Sparkles, useSway } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { toporBengaliWeddingMeta } from './meta';

const SHOLA = '#F5E6C8';
const GOLD = '#E0B65A';

/** The groom's topor: a tall conical pith crown with cut-work bands and a crest. */
const Topor: React.FC<{ x: number; y: number; scale: number }> = ({ x, y, scale }) => {
  const sway = useSway(1.2, 90);
  return (
    <g transform={`translate(${x} ${y}) rotate(${sway}) scale(${scale})`} fill={SHOLA} stroke="#C9A86A" strokeWidth={2}>
      <path d="M-120 0 L-40 -420 C-30 -460 30 -460 40 -420 L120 0 Z" />
      {[0.15, 0.35, 0.55, 0.75].map((t) => {
        const yy = -420 * t - 20;
        const half = 120 - 80 * t;
        return <path key={t} d={`M${-half} ${yy} H${half}`} stroke="#B98A3E" strokeWidth={4} strokeDasharray="10 8" />;
      })}
      {Array.from({ length: 5 }, (_, i) => (
        <path key={i} d={`M${-80 + i * 40} -40 Q${-60 + i * 40} -110 ${-40 + i * 40} -40`} fill="none" stroke="#B98A3E" strokeWidth={3} />
      ))}
      <path d="M0 -440 C-60 -520 -40 -580 0 -600 C40 -580 60 -520 0 -440 Z" />
      <circle cy={-530} r={14} fill={GOLD} />
      <path d="M-140 0 H140 L120 26 H-120 Z" fill={GOLD} />
    </g>
  );
};

/** The bride's mukut: a fanned crown of scalloped shola petals. */
const Mukut: React.FC<{ x: number; y: number; scale: number }> = ({ x, y, scale }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} fill={SHOLA} stroke="#C9A86A" strokeWidth={2}>
    {[-60, -40, -20, 0, 20, 40, 60].map((a) => (
      <path key={a} transform={`rotate(${a})`} d="M-22 0 C-30 -80 -14 -140 0 -170 C14 -140 30 -80 22 0 Z" />
    ))}
    <path d="M-150 0 Q0 -40 150 0 L140 26 Q0 -10 -140 26 Z" fill={GOLD} />
    <circle cy={-60} r={12} fill={GOLD} />
  </g>
);

/** A kalka (Bengali paisley) in gold line. */
const Kalka: React.FC<{ x: number; y: number; rotate: number }> = ({ x, y, rotate }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`} fill="none" stroke={GOLD} strokeWidth={3}>
    <path d="M0 70 C-60 70 -76 0 -42 -40 C-18 -70 32 -80 50 -120 C58 -70 58 -20 40 22 C30 50 18 70 0 70 Z" />
    <path d="M0 44 C-32 44 -44 6 -24 -18 C-10 -36 18 -44 28 -64 C32 -36 32 -8 22 14 C16 30 10 44 0 44 Z" />
    <circle r={8} cy={10} fill={GOLD} />
  </g>
);

const Backdrop: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const zoom = useSlowZoom(durationInFrames, 1.04);
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, #B3122A 0%, #8E0E1C 55%, #5C0712 100%)' }}>
      <Glow x={540} y={960} r={560} color="rgba(245,230,200,0.12)" />
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
          <Topor x={180} y={1890} scale={0.62} />
          <Mukut x={900} y={1880} scale={0.95} />
          <Kalka x={120} y={180} rotate={-30} />
          <Kalka x={960} y={180} rotate={30} />
          <rect x={46} y={46} width={988} height={1828} rx={26} fill="none" stroke={GOLD} strokeWidth={3} opacity={0.7} />
        </svg>
      </AbsoluteFill>
      <Sparkles color="#F7DFA0" count={16} seed="topor" maxSize={18} opacity={0.6} />
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#FFF4E0',
  accent: '#F7D88E',
  soft: SHOLA,
  shadow: '0 3px 14px rgba(0,0,0,0.4)',
  roles: {
    title: { family: fonts.script, scale: 1.1 },
    subtitle: { family: fonts.caps, weight: 700, spacing: 10, scale: 0.55 },
    names: { family: fonts.script },
    heading: { family: fonts.display, weight: 600 },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.caps, weight: 600, spacing: 8, scale: 0.85 },
  },
  Divider: lineDivider(GOLD, 'leaf'),
  photo: { shape: 'arch', width: 460, height: 575, border: GOLD },
  motion: 'blur',
  textWidth: 780,
  offsetY: -60,
};

export const toporBengaliWedding: TemplateDefinition = { ...toporBengaliWeddingMeta, clips: makeClips(look) };

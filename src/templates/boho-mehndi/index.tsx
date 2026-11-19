import type React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { lineDivider, useProgress } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { bohoMehndiMeta } from './meta';

const TERRA = '#C66B3D';
const BANDS = ['#C66B3D', '#E4A15B', '#D9B99B', '#9AA58A', '#E8C7B8'];

/** Rainbow arches: thick concentric half rings that grow up into place. */
const Rainbow: React.FC<{ x: number; y: number; r: number; rotate: number; grow: number }> = ({ x, y, r, rotate, grow }) => {
  const band = r / 6.5;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      {BANDS.map((c, i) => {
        const rad = r - i * band * 1.15;
        const len = Math.PI * rad;
        return (
          <path
            key={c}
            d={`M${-rad} 0 A${rad} ${rad} 0 0 1 ${rad} 0`}
            fill="none"
            stroke={c}
            strokeWidth={band}
            strokeDasharray={len}
            strokeDashoffset={(1 - grow) * len}
          />
        );
      })}
    </g>
  );
};

/** A pampas plume: a stem with soft feathery strokes, swaying. */
const Pampas: React.FC<{ x: number; y: number; h: number; lean: number; phase: number }> = ({ x, y, h, lean, phase }) => {
  const frame = useCurrentFrame();
  const sway = lean + Math.sin(frame / 32 + phase) * 3;
  return (
    <g transform={`translate(${x} ${y}) rotate(${sway})`} stroke="#B9946B" strokeLinecap="round">
      <path d={`M0 0 Q8 ${-h * 0.5} 0 ${-h}`} strokeWidth={3} fill="none" />
      {Array.from({ length: 26 }, (_, i) => {
        const t = 0.4 + (i / 26) * 0.6;
        const yy = -h * t;
        const len = 46 * Math.sin(Math.PI * ((t - 0.4) / 0.6)) + 10;
        return <path key={i} d={`M0 ${yy} q${i % 2 ? len : -len} ${-len * 0.6} ${i % 2 ? len * 1.2 : -len * 1.2} ${-len * 1.4}`} strokeWidth={2} fill="none" opacity={0.7} />;
      })}
    </g>
  );
};

const Backdrop: React.FC<{ clip: string }> = ({ clip }) => {
  const g = useProgress(0, 40);
  const grow = clip === 'intro' ? g : 1;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #F7EDE2 0%, #F0E0CF 100%)' }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        <circle cx={860} cy={260} r={120} fill="#E4A15B" opacity={0.55} />
        <Rainbow x={180} y={1920} r={380} rotate={0} grow={grow} />
        <Rainbow x={1080} y={0} r={300} rotate={180} grow={grow} />
        <Pampas x={880} y={1930} h={520} lean={-12} phase={0} />
        <Pampas x={960} y={1930} h={440} lean={-4} phase={1.2} />
        <Pampas x={1030} y={1930} h={380} lean={8} phase={2.3} />
        <Pampas x={40} y={10} h={360} lean={170} phase={0.6} />
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={(i * 197) % 1080} cy={(i * 331) % 1920} r={3} fill={TERRA} opacity={0.25} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#4A3428',
  accent: TERRA,
  soft: '#8C7A5E',
  roles: {
    title: { family: fonts.scriptAlt, scale: 1.1 },
    subtitle: { family: fonts.elegant, spacing: 14, scale: 0.75 },
    names: { family: fonts.scriptAlt },
    heading: { family: fonts.elegant },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.elegant, spacing: 8, scale: 0.85 },
  },
  Divider: lineDivider('#B9946B', 'dot', 1.5),
  photo: { shape: 'arch', width: 480, height: 600, border: '#FFFFFF' },
  motion: 'rise',
  textWidth: 780,
};

export const bohoMehndi: TemplateDefinition = { ...bohoMehndiMeta, clips: makeClips(look) };

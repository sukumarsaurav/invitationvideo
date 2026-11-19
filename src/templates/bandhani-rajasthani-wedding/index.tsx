import type React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Glow, lineDivider } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { bandhaniRajasthaniWeddingMeta } from './meta';

const RED = '#B3122E';
const YELLOW = '#F9C80E';

/** One bandhani flower: a ring of tie-dye dots round a centre dot. */
const DotFlower: React.FC<{ x: number; y: number; s: number; color: string }> = ({ x, y, s, color }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
    <circle r={7} />
    {Array.from({ length: 8 }, (_, i) => (
      <circle key={i} cx={Math.cos((i / 8) * Math.PI * 2) * 20} cy={Math.sin((i / 8) * Math.PI * 2) * 20} r={6} />
    ))}
  </g>
);

/** Leheriya: diagonal wave stripes in festival colours that slowly ripple. */
const Leheriya: React.FC<{ y: number; h: number }> = ({ y, h }) => {
  const frame = useCurrentFrame();
  const colors = [YELLOW, '#2E9E5B', '#FF6F3C', '#E83F6F', '#1E88E5'];
  return (
    <g>
      <defs>
        <clipPath id={`leh${y}`}>
          <rect x={0} y={y} width={1080} height={h} />
        </clipPath>
      </defs>
      <g clipPath={`url(#leh${y})`}>
        <rect x={0} y={y} width={1080} height={h} fill={RED} />
        {Array.from({ length: 34 }, (_, i) => {
          const x0 = -400 + i * 50 + ((frame * 0.8) % 50);
          return (
            <path
              key={i}
              d={`M${x0} ${y + h} q 20 ${-h / 4} 40 ${-h / 2} t 40 ${-h / 2}`}
              transform={`translate(${-h * 0.0} 0) skewX(-30)`}
              stroke={colors[i % colors.length]}
              strokeWidth={12}
              fill="none"
            />
          );
        })}
      </g>
      <path d={`M0 ${y} H1080 M0 ${y + h} H1080`} stroke={YELLOW} strokeWidth={6} />
    </g>
  );
};

const Backdrop: React.FC = () => (
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, #C8203C 0%, #B3122E 55%, #7E0B1F 100%)' }}>
    <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
      {Array.from({ length: 13 }, (_, r) =>
        Array.from({ length: 8 }, (_, c) => (
          <DotFlower key={`${r}-${c}`} x={c * 150 + (r % 2 ? 75 : 0)} y={260 + r * 110} s={0.9} color={r % 3 === 0 ? YELLOW : '#FFF3D6'} />
        )),
      )}
      <Leheriya y={0} h={200} />
      <Leheriya y={1720} h={200} />
    </svg>
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(126,11,31,0.95) 0%, rgba(126,11,31,0.85) 40%, transparent 72%)' }} />
    <Glow x={540} y={960} r={420} color="rgba(249,200,14,0.1)" />
  </AbsoluteFill>
);

const look: Look = {
  Backdrop,
  ink: '#FFF3D6',
  accent: YELLOW,
  soft: '#FFC7A8',
  shadow: '0 3px 14px rgba(0,0,0,0.45)',
  roles: {
    title: { family: fonts.script, scale: 1 },
    subtitle: { family: fonts.caps, weight: 700, spacing: 10, scale: 0.55 },
    names: { family: fonts.script },
    heading: { family: fonts.display, weight: 700 },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.caps, weight: 700, spacing: 6, scale: 0.8 },
  },
  Divider: lineDivider(YELLOW, 'diamond'),
  photo: { shape: 'circle', width: 480, height: 480, border: YELLOW },
  motion: 'zoom',
  textWidth: 760,
};

export const bandhaniRajasthaniWedding: TemplateDefinition = { ...bandhaniRajasthaniWeddingMeta, clips: makeClips(look) };

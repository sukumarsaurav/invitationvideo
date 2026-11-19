import type React from 'react';
import { AbsoluteFill } from 'remotion';
import { useSlowZoom } from '../shared/anim';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Bloom, Glow, Leaf, lineDivider, Petals, useSway } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { blushFloralWeddingMeta } from './meta';

const ROSE = '#B4495E';
const PINKS: [string, string, string] = ['#F4B6C2', '#EE93A6', '#E0738A'];
const PEACH: [string, string, string] = ['#FAD4C0', '#F5B79C', '#EE9C7C'];
const SAGE = '#9DB59A';

/** A corner bouquet: three blooms over a spray of leaves, breathing gently. */
const Bouquet: React.FC<{ x: number; y: number; rotate: number; phase: number; scale?: number }> = ({ x, y, rotate, phase, scale = 1 }) => {
  const sway = useSway(2.5, 90, phase);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate + sway}) scale(${scale})`}>
      {[-70, -35, 0, 35, 70, 105].map((a, i) => (
        <Leaf key={a} len={150 + (i % 2) * 40} color={i % 2 ? SAGE : '#B9CDB5'} vein="#7E9A7B" rotate={a - 20} />
      ))}
      <Bloom r={95} colors={PINKS} turn={phase * 20} />
      <g transform="translate(120 40)">
        <Bloom r={70} colors={PEACH} turn={15} />
      </g>
      <g transform="translate(30 120)">
        <Bloom r={55} colors={PINKS} petals={5} turn={40} />
      </g>
    </g>
  );
};

const Backdrop: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const zoom = useSlowZoom(durationInFrames, 1.05);
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(170deg, #FFF7F5 0%, #FCE8EA 55%, #F8DCE0 100%)' }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Glow x={180} y={260} r={420} color="rgba(244,182,194,0.55)" />
        <Glow x={920} y={1650} r={460} color="rgba(250,212,192,0.6)" />
        <Glow x={900} y={420} r={260} color="rgba(238,147,166,0.18)" />
        <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
          <Bouquet x={70} y={110} rotate={160} phase={0} scale={2.1} />
          <Bouquet x={1010} y={1810} rotate={-20} phase={2} scale={2.1} />
          <Bouquet x={1040} y={80} rotate={200} phase={4} scale={1.1} />
          <Bouquet x={40} y={1850} rotate={20} phase={1} scale={1.1} />
        </svg>
      </AbsoluteFill>
      <div style={{ position: 'absolute', inset: 56, border: '2px solid rgba(213,138,154,0.55)', borderRadius: 40 }} />
      <Petals colors={['#F4B6C2', '#FAD4C0', '#EE93A6']} count={16} size={30} speed={0.7} opacity={0.75} />
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#5B2A36',
  accent: ROSE,
  soft: '#9E6B74',
  roles: {
    title: { family: fonts.script },
    subtitle: { family: fonts.serif, weight: 600, spacing: 14, color: '#5B2A36' },
    names: { family: fonts.script },
    heading: { family: fonts.display, weight: 600 },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.serif, weight: 600, spacing: 6 },
  },
  Divider: lineDivider('#D58A9A', 'heart'),
  photo: { shape: 'circle', width: 560, height: 560, border: '#FFFFFF' },
  motion: 'blur',
  textWidth: 800,
};

export const blushFloralWedding: TemplateDefinition = { ...blushFloralWeddingMeta, clips: makeClips(look) };

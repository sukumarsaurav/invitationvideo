import type React from 'react';
import { AbsoluteFill } from 'remotion';
import { useSlowZoom } from '../shared/anim';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { lineDivider, Sparkles, useProgress } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { midnightGoldReceptionMeta } from './meta';

const GOLD = '#D4AF6A';

/** An art-deco sunburst fan: nested arcs and rays that draw outward. */
const Fan: React.FC<{ x: number; y: number; r: number; flip?: boolean; grow: number }> = ({ x, y, r, flip, grow }) => (
  <g transform={`translate(${x} ${y}) scale(1 ${flip ? -1 : 1})`} fill="none" stroke={GOLD} strokeWidth={2.5}>
    {[1, 0.8, 0.6, 0.4].map((k) => {
      const rad = r * k;
      const len = Math.PI * rad;
      return <path key={k} d={`M${-rad} 0 A${rad} ${rad} 0 0 1 ${rad} 0`} strokeDasharray={len} strokeDashoffset={(1 - grow) * len} />;
    })}
    {Array.from({ length: 13 }, (_, i) => {
      const a = Math.PI + (i / 12) * Math.PI;
      return <path key={i} d={`M${Math.cos(a) * r * 0.4} ${Math.sin(a) * r * 0.4} L${Math.cos(a) * r * (0.4 + 0.6 * grow)} ${Math.sin(a) * r * (0.4 + 0.6 * grow)}`} opacity={0.7} />;
    })}
    <path d={`M${-r * 1.4} 0 H${r * 1.4}`} strokeWidth={3} />
  </g>
);

const Backdrop: React.FC<{ durationInFrames: number; clip: string }> = ({ durationInFrames, clip }) => {
  const zoom = useSlowZoom(durationInFrames, 1.04);
  const g = useProgress(0, 40);
  const grow = clip === 'intro' ? g : 1;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #07142A 0%, #13294B 50%, #07142A 100%)' }}>
      <Sparkles color="#F3E2B5" count={40} seed="midnight" maxSize={16} opacity={0.85} />
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
          <Fan x={540} y={200} r={210} flip grow={grow} />
          <Fan x={540} y={1740} r={210} grow={grow} />
          <g stroke={GOLD} strokeWidth={2} opacity={0.6}>
            <path d="M90 300 V1620 M110 340 V1580 M990 300 V1620 M970 340 V1580" />
          </g>
          <path d="M540 90 L560 110 L540 130 L520 110 Z M540 1790 L560 1810 L540 1830 L520 1810 Z" fill={GOLD} />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#F3EAD7',
  accent: GOLD,
  soft: '#B9C4D8',
  shadow: '0 3px 14px rgba(0,0,0,0.45)',
  roles: {
    title: { family: fonts.script, scale: 1 },
    subtitle: { family: fonts.caps, weight: 600, spacing: 10, scale: 0.55 },
    names: { family: fonts.script },
    heading: { family: fonts.caps, weight: 600, scale: 0.85 },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.caps, weight: 600, spacing: 6, scale: 0.75 },
  },
  Divider: lineDivider(GOLD, 'diamond', 1.5),
  photo: { shape: 'arch', width: 460, height: 575, border: GOLD },
  motion: 'rise',
  textWidth: 780,
};

export const midnightGoldReception: TemplateDefinition = { ...midnightGoldReceptionMeta, clips: makeClips(look) };

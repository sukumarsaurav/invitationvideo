import type React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useSlowZoom } from '../shared/anim';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { archPath, Crescent, Glow, Lantern, lineDivider, Sparkles } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { emeraldNikahMeta } from './meta';

const GOLD = '#E2C275';

/** An eight-point star tile for the Islamic geometric pattern. */
const Star8: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g transform={`translate(${x} ${y})`} fill="none" stroke={GOLD} strokeWidth={1.5}>
    <rect x={-r * 0.7} y={-r * 0.7} width={r * 1.4} height={r * 1.4} />
    <rect x={-r * 0.7} y={-r * 0.7} width={r * 1.4} height={r * 1.4} transform="rotate(45)" />
  </g>
);

const Backdrop: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const zoom = useSlowZoom(durationInFrames, 1.04);
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, #136B52 0%, #0B4D3B 55%, #062E23 100%)' }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute', opacity: 0.16 }}>
          {Array.from({ length: 16 }, (_, r) => Array.from({ length: 9 }, (_, c) => <Star8 key={`${r}-${c}`} x={c * 130 + 25} y={r * 130 + 25} r={44} />))}
        </svg>
      </AbsoluteFill>
      <Glow x={540} y={980} r={520} color="rgba(226,194,117,0.16)" />
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        <path d={archPath(540, 1800, 860, 1560, 'onion')} fill="rgba(6,46,35,0.55)" stroke={GOLD} strokeWidth={6} />
        <path d={archPath(540, 1780, 820, 1520, 'onion')} fill="none" stroke={GOLD} strokeWidth={2} opacity={0.7} />
        <g transform="translate(540 190)">
          <Crescent r={46} color={GOLD} />
        </g>
        {[[150, 0], [930, 1.4]].map(([x, p]) => (
          <g key={x} transform={`translate(${x} 0) rotate(${Math.sin(frame / 50 + p) * 3})`}>
            <Lantern chain={260} h={150} color={GOLD} glow={0.6 + 0.4 * Math.sin(frame / 8 + p)} />
          </g>
        ))}
        <path d="M60 1800 H1020" stroke={GOLD} strokeWidth={3} />
      </svg>
      <Sparkles color="#F3DFA2" count={18} seed="nikah" maxSize={16} opacity={0.6} />
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#FBF3DD',
  accent: GOLD,
  soft: '#A8D5C2',
  shadow: '0 3px 14px rgba(0,0,0,0.45)',
  roles: {
    title: { family: fonts.script, scale: 1.1 },
    subtitle: { family: fonts.caps, weight: 700, spacing: 16, scale: 0.8 },
    names: { family: fonts.script },
    heading: { family: fonts.display, weight: 600 },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.caps, weight: 600, spacing: 4, scale: 0.75 },
  },
  Divider: lineDivider(GOLD, 'diamond'),
  photo: { shape: 'arch', width: 420, height: 525, border: GOLD },
  motion: 'blur',
  textWidth: 680,
  offsetY: 90,
};

export const emeraldNikah: TemplateDefinition = { ...emeraldNikahMeta, clips: makeClips(look) };

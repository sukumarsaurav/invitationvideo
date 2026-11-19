import type React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Crescent, Glow, Lantern, lineDivider, Sparkles } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { lanternWalimaMeta } from './meta';

const AMBER = '#F2B950';
const LANTERNS = [
  { x: 90, chain: 120, h: 120 },
  { x: 200, chain: 260, h: 150 },
  { x: 320, chain: 80, h: 100 },
  { x: 760, chain: 90, h: 100 },
  { x: 880, chain: 250, h: 150 },
  { x: 990, chain: 140, h: 120 },
];

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0B1028 0%, #121A3A 50%, #1E2550 100%)' }}>
      <Sparkles color="#FFFFFF" count={40} seed="walima" maxSize={12} opacity={0.8} />
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        <g transform="translate(540 230)">
          <circle r={90} fill="rgba(242,185,80,0.12)" />
          <Crescent r={60} color="#F7D58C" star={false} />
        </g>
        {LANTERNS.map((l, i) => (
          <g key={l.x} transform={`translate(${l.x} 0) rotate(${Math.sin(frame / 45 + i) * 3})`}>
            <Lantern chain={l.chain} h={l.h} color={AMBER} glow={0.6 + 0.4 * Math.sin(frame / 7 + i * 1.3)} />
          </g>
        ))}
        {LANTERNS.map((l, i) => (
          <g key={`b${l.x}`} transform={`translate(${l.x} 1920) scale(1 -1) rotate(${Math.sin(frame / 45 + i + 2) * 3})`}>
            <Lantern chain={l.chain * 0.6} h={l.h * 0.9} color={AMBER} glow={0.6 + 0.4 * Math.sin(frame / 7 + i)} />
          </g>
        ))}
      </svg>
      <Glow x={540} y={960} r={480} color="rgba(242,185,80,0.1)" />
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#F6EEDB',
  accent: '#F7D58C',
  soft: '#AAB4E0',
  shadow: '0 3px 14px rgba(0,0,0,0.5)',
  roles: {
    title: { family: fonts.scriptAlt, scale: 1.15 },
    subtitle: { family: fonts.caps, weight: 600, spacing: 10, scale: 0.6 },
    names: { family: fonts.scriptAlt },
    heading: { family: fonts.elegant },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.caps, weight: 600, spacing: 10, scale: 0.85 },
  },
  Divider: lineDivider(AMBER, 'diamond', 1.5),
  photo: { shape: 'arch', width: 440, height: 550, border: AMBER },
  motion: 'blur',
  textWidth: 760,
};

export const lanternWalima: TemplateDefinition = { ...lanternWalimaMeta, clips: makeClips(look) };

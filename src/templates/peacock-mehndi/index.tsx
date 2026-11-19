import type React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Glow, lineDivider, Sparkles } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { peacockMehndiMeta } from './meta';

const GOLD = '#E9C46A';

/** One peacock feather pointing up from the origin, `len` long. */
const Feather: React.FC<{ len: number }> = ({ len }) => (
  <g>
    <path d={`M0 0 V${-len}`} stroke="#C9B26A" strokeWidth={4} />
    {Array.from({ length: 22 }, (_, i) => {
      const y = -len * (0.15 + (i / 22) * 0.7);
      const w = 26 + i * 2.2;
      return (
        <g key={i} stroke="#2A9D8F" strokeWidth={2} opacity={0.75}>
          <path d={`M0 ${y} Q${w * 0.6} ${y - 10} ${w} ${y - 34}`} fill="none" />
          <path d={`M0 ${y} Q${-w * 0.6} ${y - 10} ${-w} ${y - 34}`} fill="none" />
        </g>
      );
    })}
    <g transform={`translate(0 ${-len * 0.9})`}>
      <ellipse rx={62} ry={78} fill="#2A9D8F" />
      <ellipse rx={48} ry={60} cy={6} fill="#E9C46A" />
      <ellipse rx={36} ry={46} cy={10} fill="#1B7F79" />
      <ellipse rx={24} ry={30} cy={14} fill="#0B3C78" />
      <ellipse rx={12} ry={15} cy={16} fill="#06204A" />
    </g>
  </g>
);

const FAN = [-64, -48, -32, -16, 0, 16, 32, 48, 64];

const Backdrop: React.FC<{ clip: string }> = ({ clip }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // The fan opens on the first clip and stays open afterwards.
  const open = clip === 'intro' ? spring({ frame: frame - 4, fps, config: { damping: 14, mass: 1.1 } }) : 1;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #06283A 0%, #0A3D4F 45%, #0E6E7E 100%)' }}>
      <Glow x={540} y={1800} r={700} color="rgba(233,196,106,0.22)" />
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        {FAN.map((a, i) => (
          <g key={a} transform={`translate(540 1990) rotate(${a * open + Math.sin(frame / 40 + i) * 1.2}) scale(${0.6 + 0.4 * open})`}>
            <Feather len={Math.abs(a) > 40 ? 500 : 560} />
          </g>
        ))}
        {FAN.map((a, i) => (
          <g key={`top${a}`} transform={`translate(540 -70) rotate(${180 + a * 0.7 * open + Math.sin(frame / 40 + i) * 1.2}) scale(${0.45 * open})`}>
            <Feather len={600} />
          </g>
        ))}
      </svg>
      <Sparkles color={GOLD} count={22} seed="peacock" maxSize={24} opacity={0.75} />
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#F1FAEE',
  accent: GOLD,
  soft: '#8FD3C9',
  shadow: '0 3px 16px rgba(0,0,0,0.5)',
  roles: {
    title: { family: fonts.scriptAlt, scale: 1.1 },
    subtitle: { family: fonts.caps, weight: 700, spacing: 20, scale: 0.85 },
    names: { family: fonts.scriptAlt },
    heading: { family: fonts.elegant },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.caps, weight: 600, spacing: 6, scale: 0.85 },
  },
  Divider: lineDivider(GOLD, 'diamond'),
  photo: { shape: 'arch', width: 440, height: 550, border: GOLD },
  motion: 'zoom',
  textWidth: 780,
  offsetY: -170,
};

export const peacockMehndi: TemplateDefinition = { ...peacockMehndiMeta, clips: makeClips(look) };

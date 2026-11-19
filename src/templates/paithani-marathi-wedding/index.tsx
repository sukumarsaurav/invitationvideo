import type React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Glow, lineDivider, Lotus, Sparkles } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { paithaniMarathiWeddingMeta } from './meta';

const ZARI = '#E3B04B';
const GREEN = '#1F7A4D';

/** A paithani peacock in profile, facing right, about 120 wide. */
const Peacock: React.FC<{ fill: string }> = ({ fill }) => (
  <g fill={fill}>
    <path d="M-50 20 C-60 -10 -40 -30 -10 -24 C10 -20 20 -4 30 -30 C34 -44 46 -50 52 -40 C56 -34 52 -26 46 -22 C40 4 30 26 0 30 C-20 32 -40 30 -50 20 Z" />
    <path d="M-50 20 C-80 10 -100 -20 -96 -40 C-80 -20 -64 -6 -46 4 Z" opacity={0.8} />
    <path d="M52 -40 L64 -36 L52 -34 Z" />
    <path d="M48 -48 L44 -62 M52 -50 L54 -64 M56 -48 L62 -60" stroke={fill} strokeWidth={3} />
    <circle cx={46} cy={-40} r={3} fill={GREEN} />
  </g>
);

/** The zari border: a gold band with alternating peacocks and lotus buds, edged in green. */
const ZariBorder: React.FC<{ y: number; flip?: boolean }> = ({ y, flip }) => {
  const frame = useCurrentFrame();
  const shimmer = 0.85 + 0.15 * Math.sin(frame / 10);
  return (
    <g transform={`translate(0 ${y}) scale(1 ${flip ? -1 : 1})`}>
      <rect width={1080} height={210} fill={ZARI} opacity={shimmer} />
      <rect y={0} width={1080} height={16} fill={GREEN} />
      <rect y={194} width={1080} height={16} fill={GREEN} />
      {Array.from({ length: 13 }, (_, i) => (
        <path key={i} d={`M${i * 90} 210 L${i * 90 + 45} 240 L${i * 90 + 90} 210 Z`} fill={ZARI} />
      ))}
      {Array.from({ length: 6 }, (_, i) =>
        i % 2 ? (
          <g key={i} transform={`translate(${90 + i * 180} 150) scale(0.55)`}>
            <Lotus size={150} colors={['#7A2A8C', '#4A1A5C']} stroke="#4A1A5C" />
          </g>
        ) : (
          <g key={i} transform={`translate(${90 + i * 180} 110) scale(${i % 4 ? -1 : 1} 1)`}>
            <Peacock fill="#4A1A5C" />
          </g>
        ),
      )}
    </g>
  );
};

const Backdrop: React.FC = () => (
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, #6A2A80 0%, #4A1A5C 60%, #2E0F3A 100%)' }}>
    <Glow x={540} y={960} r={520} color="rgba(227,176,75,0.14)" />
    <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
      {Array.from({ length: 14 }, (_, r) =>
        Array.from({ length: 9 }, (_, c) => (
          <path key={`${r}-${c}`} transform={`translate(${c * 130 + (r % 2 ? 65 : 0)} ${300 + r * 100})`} d="M0 -10 L8 0 L0 10 L-8 0 Z" fill={ZARI} opacity={0.18} />
        )),
      )}
      <ZariBorder y={0} />
      <ZariBorder y={1920} flip />
    </svg>
    <Sparkles color="#F5D58A" count={14} seed="paithani" maxSize={16} opacity={0.6} />
  </AbsoluteFill>
);

const look: Look = {
  Backdrop,
  ink: '#FFF3DC',
  accent: ZARI,
  soft: '#B7E0C4',
  shadow: '0 3px 14px rgba(0,0,0,0.4)',
  roles: {
    title: { family: fonts.script, scale: 1.1 },
    subtitle: { family: fonts.caps, weight: 700, spacing: 10, scale: 0.55 },
    names: { family: fonts.script },
    heading: { family: fonts.display, weight: 600 },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.caps, weight: 700, spacing: 8, scale: 0.9 },
  },
  Divider: lineDivider(ZARI, 'leaf'),
  photo: { shape: 'arch', width: 440, height: 550, border: ZARI },
  motion: 'rise',
  textWidth: 780,
};

export const paithaniMarathiWedding: TemplateDefinition = { ...paithaniMarathiWeddingMeta, clips: makeClips(look) };

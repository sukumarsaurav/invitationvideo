import type React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Glow, lineDivider, Sparkles } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { discoNightSangeetMeta } from './meta';

const PINK = '#FF4FD8';
const CYAN = '#3DF2FF';
const neon = (c: string) => `0 0 8px ${c}, 0 0 24px ${c}, 0 0 48px ${c}`;

/** A mirror ball: a grid of tiles whose brightness rolls round as it spins. */
const DiscoBall: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => {
  const frame = useCurrentFrame();
  const rows = 10;
  const cols = 14;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M0 ${-r - 200} V${-r}`} stroke="#B8B8C8" strokeWidth={4} />
      <defs>
        <clipPath id="ball">
          <circle r={r} />
        </clipPath>
        <radialGradient id="ballShade" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.25} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0.55} />
        </radialGradient>
      </defs>
      <g clipPath="url(#ball)">
        <circle r={r} fill="#6B6B80" />
        {Array.from({ length: rows }, (_, row) => {
          const lat = -Math.PI / 2 + ((row + 0.5) / rows) * Math.PI;
          const y0 = Math.sin(lat) * r;
          const ring = Math.cos(lat) * r;
          const h = (Math.PI / rows) * r * Math.cos(lat) * 0.9 + 4;
          return Array.from({ length: cols }, (_, col) => {
            const lon = ((col / cols) * Math.PI * 2 + frame * 0.05) % (Math.PI * 2);
            if (lon > Math.PI) return null;
            const x0 = -Math.cos(lon) * ring;
            const w = Math.max(2, Math.sin(lon) * ((Math.PI * 2 * ring) / cols) * 0.9);
            const lit = 0.35 + 0.65 * Math.abs(Math.sin(lon * 3 + row + frame * 0.2));
            return <rect key={`${row}-${col}`} x={x0 - w / 2} y={y0 - h / 2} width={w} height={h} fill={`rgba(235,235,255,${lit})`} stroke="#3A3A4A" strokeWidth={1} />;
          });
        })}
        <circle r={r} fill="url(#ballShade)" />
      </g>
    </g>
  );
};

/** Coloured beams sweeping out from the ball. */
const Beams: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const frame = useCurrentFrame();
  const colors = [PINK, CYAN, '#FFD23F', '#9B5DE5', PINK, CYAN];
  return (
    <g transform={`translate(${x} ${y})`} style={{ mixBlendMode: 'screen' }}>
      {colors.map((c, i) => {
        const a = 90 + Math.sin(frame / 28 + i * 1.3) * 60 + (i - 2.5) * 12;
        return <path key={i} d="M0 0 L-110 2200 L110 2200 Z" fill={c} opacity={0.16} transform={`rotate(${a - 90})`} />;
      })}
    </g>
  );
};

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 20%, #3B1660 0%, #1A0B2E 55%, #0B0616 100%)' }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        <Beams x={540} y={260} />
        <g opacity={0.35}>
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M${-200 + i * 180} 1920 L540 1500`} stroke={i % 2 ? PINK : CYAN} strokeWidth={2} />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <path key={`h${i}`} d={`M0 ${1560 + i * i * 22} H1080`} stroke={CYAN} strokeWidth={2} opacity={0.6} />
          ))}
        </g>
        <DiscoBall x={540} y={260} r={130} />
      </svg>
      <Glow x={540} y={260} r={260 + Math.sin(frame / 8) * 20} color="rgba(255,255,255,0.12)" />
      <Sparkles color="#FFFFFF" count={30} seed="disco" maxSize={20} />
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#FFFFFF',
  accent: PINK,
  soft: CYAN,
  roles: {
    title: { family: fonts.neon, scale: 0.6, style: { textShadow: neon(PINK) } },
    subtitle: { family: fonts.poster, spacing: 24, scale: 1.4, color: CYAN, style: { textShadow: neon(CYAN) } },
    names: { family: fonts.fun, scale: 0.72, style: { textShadow: neon(PINK) } },
    heading: { family: fonts.sans, weight: 700, scale: 0.85 },
    body: { family: fonts.sans, weight: 500, scale: 0.8 },
    caps: { family: fonts.sans, weight: 700, spacing: 8, scale: 0.75, style: { textShadow: neon(CYAN) } },
  },
  Divider: lineDivider(CYAN, 'diamond', 3),
  photo: { shape: 'circle', width: 500, height: 500, border: PINK, style: { boxShadow: neon(PINK) } },
  motion: 'zoom',
  textWidth: 820,
  offsetY: 150,
};

export const discoNightSangeet: TemplateDefinition = { ...discoNightSangeetMeta, clips: makeClips(look) };

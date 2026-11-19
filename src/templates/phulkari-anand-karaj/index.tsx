import type React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Glow, lineDivider, useProgress } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { phulkariAnandKarajMeta } from './meta';

const THREADS = ['#F6A623', '#F25C8E', '#FFD447', '#FF7A2F', '#3FB8AF'];

/** One phulkari bagh motif: a nested diamond flower of satin-stitch lines. */
const Bagh: React.FC<{ x: number; y: number; s: number; k: number }> = ({ x, y, s, k }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[1, 0.7, 0.42].map((t, i) => (
      <path key={t} d={`M0 ${-50 * t} L${50 * t} 0 L0 ${50 * t} L${-50 * t} 0 Z`} fill={THREADS[(k + i) % THREADS.length]} />
    ))}
    {Array.from({ length: 8 }, (_, i) => (
      <path key={i} transform={`rotate(${i * 45})`} d="M0 -50 L0 -64" stroke={THREADS[(k + 3) % THREADS.length]} strokeWidth={6} strokeLinecap="round" />
    ))}
    <circle r={6} fill="#8C1022" />
  </g>
);

/** A phulkari band that stitches itself in from the left on the opening. */
const Band: React.FC<{ y: number; reveal: number; offset: number }> = ({ y, reveal, offset }) => {
  const n = 9;
  return (
    <g>
      <rect x={0} y={y - 70} width={1080} height={140} fill="#6E0C1A" />
      {Array.from({ length: n }, (_, i) =>
        i / n < reveal ? <Bagh key={i} x={60 + i * 120} y={y} s={0.95} k={i + offset} /> : null,
      )}
      <path d={`M0 ${y - 70} H1080 M0 ${y + 70} H1080`} stroke="#FFD447" strokeWidth={4} strokeDasharray="14 8" />
    </g>
  );
};

const Backdrop: React.FC<{ clip: string }> = ({ clip }) => {
  const frame = useCurrentFrame();
  const r = useProgress(0, 40);
  const reveal = clip === 'intro' ? r : 1;
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, #A81530 0%, #8C1022 55%, #5A0815 100%)' }}>
      <Glow x={540} y={960} r={560} color="rgba(246,166,35,0.14)" />
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        <Band y={110} reveal={reveal} offset={0} />
        <Band y={1810} reveal={reveal} offset={2} />
        {Array.from({ length: 10 }, (_, i) => (
          <g key={i} opacity={0.22} transform={`translate(${i % 2 ? 980 : 100} ${330 + i * 140}) rotate(${frame * 0.4})`}>
            <Bagh x={0} y={0} s={0.6} k={i} />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#FFF1DC',
  accent: '#FFC94A',
  soft: '#F7A8C4',
  shadow: '0 3px 14px rgba(0,0,0,0.4)',
  roles: {
    title: { family: fonts.script, scale: 0.95 },
    subtitle: { family: fonts.caps, weight: 700, spacing: 10, scale: 0.6 },
    names: { family: fonts.script },
    heading: { family: fonts.display, weight: 600 },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.caps, weight: 700, spacing: 6, scale: 0.85 },
  },
  Divider: lineDivider('#FFC94A', 'diamond'),
  photo: { shape: 'arch', width: 440, height: 550, border: '#FFC94A' },
  motion: 'zoom',
  textWidth: 740,
};

export const phulkariAnandKaraj: TemplateDefinition = { ...phulkariAnandKarajMeta, clips: makeClips(look) };

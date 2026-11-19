import type React from 'react';
import { AbsoluteFill } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { archPath, Bloom, Leaf, lineDivider, Petals, useProgress } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { roseJaaliNikahMeta } from './meta';

const ROSEGOLD = '#B76E79';
const ROSES: [string, string, string] = ['#F6C9CF', '#EBA3AE', '#D9808E'];

/** Jaali lattice: interlocking circles clipped to the screen shape, revealed bottom-up on the opening. */
const Jaali: React.FC<{ reveal: number }> = ({ reveal }) => (
  <g>
    <defs>
      <clipPath id="jaaliClip">
        <rect x={0} y={1920 * (1 - reveal)} width={1080} height={1920} />
      </clipPath>
    </defs>
    <g clipPath="url(#jaaliClip)" fill="none" stroke={ROSEGOLD} strokeWidth={2} opacity={0.35}>
      {Array.from({ length: 22 }, (_, r) =>
        Array.from({ length: 13 }, (_, c) => <circle key={`${r}-${c}`} cx={c * 90} cy={r * 90} r={64} />),
      )}
    </g>
  </g>
);

const Cluster: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-60, -10, 40, 100].map((a, i) => (
      <Leaf key={a} len={120} color={i % 2 ? '#9DB59A' : '#B9CDB5'} rotate={a} />
    ))}
    <Bloom r={70} colors={ROSES} petals={7} center="#F3D58C" />
    <g transform="translate(90 30)">
      <Bloom r={48} colors={ROSES} petals={6} center="#F3D58C" turn={20} />
    </g>
    <g transform="translate(-70 50)">
      <Bloom r={40} colors={ROSES} petals={6} center="#F3D58C" turn={30} />
    </g>
  </g>
);

const Backdrop: React.FC<{ clip: string }> = ({ clip }) => {
  const r = useProgress(0, 45);
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #FCF3F0 0%, #F6E1DC 100%)' }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        <Jaali reveal={clip === 'intro' ? r : 1} />
        <path d={archPath(540, 1700, 760, 1380, 'onion')} fill="#FFF9F7" stroke={ROSEGOLD} strokeWidth={5} />
        <path d={archPath(540, 1680, 720, 1340, 'onion')} fill="none" stroke={ROSEGOLD} strokeWidth={1.5} />
        <Cluster x={170} y={1700} s={1.1} />
        <Cluster x={910} y={1700} s={1.1} />
        <Cluster x={540} y={1760} s={0.8} />
      </svg>
      <Petals colors={ROSES} count={10} size={24} speed={0.5} seed="jaali" />
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#5A2E36',
  accent: ROSEGOLD,
  soft: '#A07A80',
  roles: {
    title: { family: fonts.script, scale: 1.05 },
    subtitle: { family: fonts.elegant, spacing: 14, scale: 0.7 },
    names: { family: fonts.script },
    heading: { family: fonts.elegant },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.elegant, spacing: 6, scale: 0.8 },
  },
  Divider: lineDivider(ROSEGOLD, 'heart'),
  photo: { shape: 'arch', width: 400, height: 500, border: '#FFFFFF' },
  motion: 'blur',
  textWidth: 640,
  offsetY: 40,
};

export const roseJaaliNikah: TemplateDefinition = { ...roseJaaliNikahMeta, clips: makeClips(look) };

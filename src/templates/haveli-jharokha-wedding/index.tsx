import type React from 'react';
import { AbsoluteFill } from 'remotion';
import { useSlowZoom } from '../shared/anim';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { archPath, lineDivider, Marigold, Petals, useSway } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { haveliJharokhaWeddingMeta } from './meta';

const STONE = '#E8A598';
const CARVE = '#B5655A';
const MAROON = '#7A2E3A';

/** A chhatri: a small domed pavilion on four pillars. */
const Chhatri: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={STONE} stroke={CARVE} strokeWidth={3}>
    <path d="M-60 0 C-60 -70 60 -70 60 0 Z" />
    <path d="M0 -62 V-86" />
    <circle cy={-90} r={6} fill={CARVE} />
    <rect x={-70} y={0} width={140} height={14} />
    {[-50, -17, 17, 50].map((d) => (
      <rect key={d} x={d - 5} y={14} width={10} height={70} />
    ))}
    <rect x={-74} y={84} width={148} height={12} />
  </g>
);

/** A small jharokha window: onion arch, latticed, with a tiny awning. */
const Window: React.FC<{ x: number; base: number }> = ({ x, base }) => (
  <g>
    <path d={archPath(x, base, 90, 150, 'onion')} fill="#5A2A30" stroke={CARVE} strokeWidth={4} />
    <path d={`M${x - 45} ${base - 40} H${x + 45} M${x - 45} ${base - 80} H${x + 45} M${x} ${base - 140} V${base}`} stroke={STONE} strokeWidth={2} opacity={0.6} />
    <path d={`M${x - 62} ${base} H${x + 62} L${x + 52} ${base + 16} H${x - 52} Z`} fill={STONE} stroke={CARVE} strokeWidth={3} />
  </g>
);

/** A toran of marigolds strung across the big arch. */
const Toran: React.FC = () => {
  const sway = useSway(1.5, 70);
  return (
    <g transform={`rotate(${sway} 540 470)`}>
      {Array.from({ length: 13 }, (_, i) => {
        const t = i / 12;
        const x = 250 + t * 580;
        const y = 470 + Math.sin(t * Math.PI) * 70;
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <Marigold r={20} />
            {i % 3 === 0 ? (
              <g transform="translate(0 46)">
                <Marigold r={14} outer="#F97316" inner="#FB923C" />
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

const Backdrop: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const zoom = useSlowZoom(durationInFrames, 1.03);
  const arch = archPath(540, 1720, 640, 1340, 'onion');
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #F6C9A8 0%, #F3B8A2 100%)' }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
          <path d={`M0 0 H1080 V1920 H0 Z ${arch}`} fillRule="evenodd" fill={STONE} />
          <path d={arch} fill="#FFF5EC" stroke={CARVE} strokeWidth={8} />
          <path d={archPath(540, 1720, 600, 1300, 'onion')} fill="none" stroke={CARVE} strokeWidth={2} />
          {[160, 920].map((x) => (
            <g key={x}>
              <Window x={x} base={560} />
              <Window x={x} base={900} />
              <Window x={x} base={1240} />
              <Window x={x} base={1580} />
            </g>
          ))}
          <Chhatri x={160} y={150} s={1} />
          <Chhatri x={920} y={150} s={1} />
          <Chhatri x={540} y={100} s={0.8} />
          <rect x={0} y={1720} width={1080} height={200} fill="#D98E80" />
          {Array.from({ length: 18 }, (_, i) => (
            <path key={i} d={`M${i * 60} 1720 l30 -26 l30 26 Z`} fill={CARVE} />
          ))}
          <Toran />
        </svg>
      </AbsoluteFill>
      <Petals colors={['#F59E0B', '#F97316', '#E11D48']} count={10} size={22} speed={0.6} seed="haveli" />
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#4A1E24',
  accent: MAROON,
  soft: '#A0522D',
  roles: {
    title: { family: fonts.script, scale: 0.85 },
    subtitle: { family: fonts.caps, weight: 700, spacing: 8, scale: 0.5 },
    names: { family: fonts.script, scale: 0.9 },
    heading: { family: fonts.display, weight: 600, scale: 0.9 },
    body: { family: fonts.serif, weight: 600, scale: 0.9 },
    caps: { family: fonts.caps, weight: 700, spacing: 6, scale: 0.8 },
  },
  Divider: lineDivider(CARVE, 'diamond'),
  photo: { shape: 'arch', width: 380, height: 475, border: MAROON },
  motion: 'rise',
  textWidth: 540,
  offsetY: 120,
};

export const haveliJharokhaWedding: TemplateDefinition = { ...haveliJharokhaWeddingMeta, clips: makeClips(look) };

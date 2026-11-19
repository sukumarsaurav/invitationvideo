import type React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Glow, Leaf, lineDivider, Petals } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { gayeHoludBengaliMeta } from './meta';

const RED = '#C62828';

/** A stylised rui fish facing right, as painted on Bengali wedding tattva. */
const Fish: React.FC<{ flip?: boolean }> = ({ flip }) => (
  <g transform={flip ? 'scale(-1 1)' : undefined}>
    <path d="M-120 0 C-80 -60 40 -70 100 -10 L140 -40 L130 0 L140 40 L100 10 C40 70 -80 60 -120 0 Z" fill="#E65100" stroke={RED} strokeWidth={4} />
    {Array.from({ length: 5 }, (_, i) => (
      <path key={i} d={`M${-60 + i * 28} -26 q14 26 0 52`} fill="none" stroke="#FFE082" strokeWidth={4} />
    ))}
    <circle cx={-86} cy={-8} r={9} fill="#FFFFFF" />
    <circle cx={-86} cy={-8} r={4} fill="#222" />
    <path d="M-20 -48 C0 -80 30 -80 40 -52" fill="#FFB300" stroke={RED} strokeWidth={3} />
  </g>
);

/** A rajnigandha stem: white tuberose buds up a green stalk, swaying. */
const Rajnigandha: React.FC<{ x: number; h: number; phase: number }> = ({ x, h, phase }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 36 + phase) * 3;
  return (
    <g transform={`translate(${x} 1930) rotate(${sway})`}>
      <path d={`M0 0 Q6 ${-h / 2} 0 ${-h}`} stroke="#558B2F" strokeWidth={5} fill="none" />
      <Leaf len={h * 0.45} color="#7CB342" rotate={-20} />
      <Leaf len={h * 0.4} color="#689F38" rotate={24} />
      {Array.from({ length: 9 }, (_, i) => (
        <ellipse key={i} cx={i % 2 ? 9 : -9} cy={-h * (0.5 + i * 0.055)} rx={9} ry={16} fill="#FFFDF5" stroke="#E0D6B8" transform={`rotate(${i % 2 ? 25 : -25} ${i % 2 ? 9 : -9} ${-h * (0.5 + i * 0.055)})`} />
      ))}
    </g>
  );
};

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const swim = Math.sin(frame / 20) * 10;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #FFE27A 0%, #FFD44D 55%, #FFC107 100%)' }}>
      <Glow x={540} y={980} r={620} color="rgba(255,250,225,0.8)" />
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        <rect x={0} y={0} width={1080} height={40} fill={RED} />
        <rect x={0} y={1880} width={1080} height={40} fill={RED} />
        <g transform={`translate(330 ${210 + swim}) scale(0.95)`}>
          <Fish />
        </g>
        <g transform={`translate(750 ${210 - swim}) scale(0.95)`}>
          <Fish flip />
        </g>
        {[60, 140, 220, 860, 940, 1020].map((x, i) => (
          <Rajnigandha key={x} x={x} h={[420, 330, 250, 250, 330, 420][i]} phase={i} />
        ))}
      </svg>
      <Petals colors={['#FFFFFF', '#FF8F00', RED]} count={12} size={22} speed={0.7} seed="holud" />
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#5D2A00',
  accent: RED,
  soft: '#8D4E00',
  roles: {
    title: { family: fonts.fun, scale: 0.72 },
    subtitle: { family: fonts.caps, weight: 700, spacing: 8, scale: 0.6, color: '#5D2A00' },
    names: { family: fonts.script },
    heading: { family: fonts.display, weight: 700 },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.caps, weight: 700, spacing: 10 },
  },
  Divider: lineDivider(RED, 'dot', 3),
  photo: { shape: 'circle', width: 500, height: 500, border: RED },
  motion: 'zoom',
  textWidth: 740,
  offsetY: 40,
};

export const gayeHoludBengali: TemplateDefinition = { ...gayeHoludBengaliMeta, clips: makeClips(look) };

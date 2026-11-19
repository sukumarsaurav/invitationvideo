import type React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { Glow, Leaf, lineDivider, Lotus, Sparkles, useProgress } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { lotusJainWeddingMeta } from './meta';

const SAFFRON = '#E8833A';

const Backdrop: React.FC<{ clip: string }> = ({ clip }) => {
  const frame = useCurrentFrame();
  const o = useProgress(0, 50);
  const open = clip === 'intro' ? 0.25 + 0.75 * o : 1;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #FFFBF4 0%, #FFF1E0 70%, #F9E2C6 100%)' }}>
      <Glow x={540} y={1640} r={520} color="rgba(232,131,58,0.22)" />
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        <rect x={0} y={1700} width={1080} height={220} fill="#E9F2F1" />
        {[0, 1, 2, 3].map((k) => {
          const t = ((frame / 90 + k / 4) % 1);
          return <ellipse key={k} cx={540} cy={1730} rx={140 + t * 480} ry={18 + t * 40} fill="none" stroke="#A9CFCB" strokeWidth={3} opacity={1 - t} />;
        })}
        <ellipse cx={330} cy={1760} rx={130} ry={30} fill="#7FB38A" />
        <ellipse cx={780} cy={1780} rx={110} ry={26} fill="#6FA57C" />
        <g transform="translate(540 1720)">
          <Lotus size={300} open={open} colors={['#FFF4EA', '#FBC9A4']} stroke="#E8833A" />
        </g>
        <g transform="translate(250 1730)">
          <Lotus size={150} open={open} colors={['#FFF4EA', '#FBC9A4']} stroke="#E8833A" />
        </g>
        <g transform="translate(840 1740)">
          <Lotus size={130} open={open} colors={['#FFF4EA', '#FBC9A4']} stroke="#E8833A" />
        </g>
        {[[-60, 0], [60, 1]].map(([a, i]) => (
          <Leaf key={i} x={540} y={1730} len={160} color="#7FB38A" rotate={a * 1.3} />
        ))}
        <rect x={60} y={60} width={960} height={1600} rx={480} fill="none" stroke={SAFFRON} strokeWidth={2} opacity={0.45} />
      </svg>
      <Sparkles color="#F2B36B" count={14} seed="jain" maxSize={18} opacity={0.55} />
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#4E2E14',
  accent: '#C25A16',
  soft: '#B07A45',
  roles: {
    title: { family: fonts.script, scale: 1.05 },
    subtitle: { family: fonts.caps, weight: 600, spacing: 14, scale: 0.75 },
    names: { family: fonts.script },
    heading: { family: fonts.elegant },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.caps, weight: 600, spacing: 8, scale: 0.9 },
  },
  Divider: lineDivider(SAFFRON, 'leaf'),
  photo: { shape: 'circle', width: 440, height: 440, border: '#FFFFFF' },
  motion: 'blur',
  textWidth: 760,
  offsetY: -170,
};

export const lotusJainWedding: TemplateDefinition = { ...lotusJainWeddingMeta, clips: makeClips(look) };

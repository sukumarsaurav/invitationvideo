import type React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { fonts } from '../shared/fonts';
import { enter, type Look, makeClips, Stack, Txt, useStagger } from '../shared/kit';
import { Glow, lineDivider, Sparkles, useProgress } from '../shared/motifs';
import type { ClipComponent, TemplateDefinition } from '../types';
import { roseGoldRingEngagementMeta } from './meta';

const ROSE_GOLD = '#EBB8A3';

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, #5A2A40 0%, #3A1B2B 55%, #22101A 100%)' }}>
      <Glow x={540 + Math.sin(frame / 50) * 60} y={700} r={520} color="rgba(235,184,163,0.18)" />
      <Sparkles color="#F7D9CB" count={34} seed="rosegold" maxSize={28} />
      <div style={{ position: 'absolute', inset: 50, border: `2px solid ${ROSE_GOLD}`, borderRadius: 540, opacity: 0.35 }} />
    </AbsoluteFill>
  );
};

/** Two interlocking rings that draw themselves on, with a solitaire on the first. */
const Rings: React.FC<{ progress: number; size: number }> = ({ progress, size }) => {
  const r = 100;
  const c = 2 * Math.PI * r;
  const ring = (cx: number, delay: number) => {
    const p = Math.min(1, Math.max(0, (progress - delay) / (1 - delay)));
    return (
      <circle cx={cx} cy={160} r={r} fill="none" stroke="url(#rg)" strokeWidth={18} strokeDasharray={c} strokeDashoffset={(1 - p) * c} strokeLinecap="round" transform={`rotate(-90 ${cx} 160)`} />
    );
  };
  const gem = Math.min(1, Math.max(0, (progress - 0.7) / 0.3));
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 400 270">
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FBE1D6" />
          <stop offset="50%" stopColor="#C98B76" />
          <stop offset="100%" stopColor="#F2C4B0" />
        </linearGradient>
      </defs>
      {ring(140, 0)}
      {ring(260, 0.2)}
      <g transform={`translate(140 40) scale(${gem})`} opacity={gem}>
        <path d="M-26 0 L-14 -16 H14 L26 0 L0 30 Z" fill="#FFFFFF" stroke="#F7D9CB" strokeWidth={3} />
        <path d="M-26 0 H26 M-14 -16 L-6 0 L0 30 M14 -16 L6 0" stroke="#E8C3B5" strokeWidth={2} fill="none" />
      </g>
    </svg>
  );
};

const look: Look = {
  Backdrop,
  ink: '#F8E6DE',
  accent: ROSE_GOLD,
  soft: '#D6A898',
  shadow: '0 2px 14px rgba(0,0,0,0.35)',
  roles: {
    title: { family: fonts.scriptAlt },
    subtitle: { family: fonts.sans, weight: 500, spacing: 16, scale: 0.7 },
    names: { family: fonts.scriptAlt },
    heading: { family: fonts.elegant },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.sans, weight: 500, spacing: 8, scale: 0.8 },
  },
  Divider: lineDivider(ROSE_GOLD, 'diamond'),
  photo: { shape: 'circle', width: 540, height: 540, border: ROSE_GOLD },
  motion: 'zoom',
  textWidth: 800,
};

/** Opening: the rings draw on above the title. */
const Intro: ClipComponent = ({ values, durationInFrames }) => {
  const draw = useProgress(4, 50);
  const p = useStagger(4, 20, 10);
  return (
    <Stack look={look} durationInFrames={durationInFrames} clip="intro" gap={22}>
      <Rings progress={draw} size={540} />
      <div style={enter('zoom', p[0])}>
        <Txt look={look} role="caps" text={values.blessing} size={38} />
      </div>
      <div style={enter('zoom', p[1])}>
        <Txt look={look} role="title" text={values.line1} />
      </div>
      <div style={enter('zoom', p[2])}>
        <Txt look={look} role="subtitle" text={values.line2} />
      </div>
    </Stack>
  );
};

export const roseGoldRingEngagement: TemplateDefinition = { ...roseGoldRingEngagementMeta, clips: { ...makeClips(look), intro: Intro } };

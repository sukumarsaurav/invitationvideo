import type React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fonts } from '../shared/fonts';
import { enter, type Look, makeClips, Stack, Txt, useStagger } from '../shared/kit';
import { Bubbles, lineDivider } from '../shared/motifs';
import type { ClipComponent, TemplateDefinition } from '../types';
import { champagneReceptionMeta } from './meta';

const GOLD = '#B8924A';

const Backdrop: React.FC = () => (
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, #FBF4E8 0%, #F2E4CC 60%, #E6D1AE 100%)' }}>
    <Bubbles color="#C9A55A" count={34} seed="champ" maxSize={34} />
    <div style={{ position: 'absolute', inset: 48, border: `3px solid ${GOLD}`, opacity: 0.7 }} />
    <div style={{ position: 'absolute', inset: 62, border: `1px solid ${GOLD}`, opacity: 0.6 }} />
  </AbsoluteFill>
);

/** A coupe-free flute: bowl, stem and foot, filled with fizz. Drawn from the foot. */
const Flute: React.FC = () => (
  <g>
    <path d="M-40 -330 L-30 -150 C-26 -110 26 -110 30 -150 L40 -330 Z" fill="rgba(255,255,255,0.55)" stroke={GOLD} strokeWidth={4} />
    <path d="M-34 -270 L-29 -152 C-25 -118 25 -118 29 -152 L34 -270 Z" fill="#EBC774" opacity={0.85} />
    {[0, 1, 2, 3, 4].map((i) => (
      <circle key={i} cx={-14 + i * 7} cy={-170 - i * 20} r={3} fill="#FFF7DE" />
    ))}
    <path d="M0 -118 V-10" stroke={GOLD} strokeWidth={6} />
    <ellipse cy={-6} rx={46} ry={10} fill="none" stroke={GOLD} strokeWidth={5} />
  </g>
);

/** Two flutes swing together and clink; a burst of sparkle at the touch. */
const Toast: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tilt = spring({ frame: frame - 6, fps, config: { damping: 9, mass: 0.6 } });
  const burst = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <svg width={520} height={420} viewBox="-260 -400 520 420">
      <g transform={`translate(${-150 + 40 * tilt} 0) rotate(${14 * tilt})`}>
        <Flute />
      </g>
      <g transform={`translate(${150 - 40 * tilt} 0) rotate(${-14 * tilt})`}>
        <Flute />
      </g>
      <g transform="translate(0 -320)" opacity={burst > 0 ? 1 - burst : 0}>
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <path key={i} d={`M${Math.cos(a) * 20} ${Math.sin(a) * 20} L${Math.cos(a) * (30 + burst * 60)} ${Math.sin(a) * (30 + burst * 60)}`} stroke={GOLD} strokeWidth={4} strokeLinecap="round" />;
        })}
      </g>
    </svg>
  );
};

const look: Look = {
  Backdrop,
  ink: '#4A3B28',
  accent: '#8C6A2E',
  soft: GOLD,
  roles: {
    title: { family: fonts.scriptAlt, scale: 1.05 },
    subtitle: { family: fonts.elegant, spacing: 12, scale: 0.6 },
    names: { family: fonts.scriptAlt },
    heading: { family: fonts.elegant },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.elegant, spacing: 8, scale: 0.8 },
  },
  Divider: lineDivider(GOLD, 'dot', 1.5),
  photo: { shape: 'circle', width: 540, height: 540, border: '#FFFFFF' },
  motion: 'blur',
  textWidth: 800,
};

/** Opening: the toast, then the title. */
const Intro: ClipComponent = ({ values, durationInFrames }) => {
  const p = useStagger(3, 26, 10);
  return (
    <Stack look={look} durationInFrames={durationInFrames} clip="intro" gap={20}>
      <Toast />
      <div style={enter('blur', p[0])}>
        <Txt look={look} role="caps" text={values.blessing} />
      </div>
      <div style={enter('blur', p[1])}>
        <Txt look={look} role="title" text={values.line1} />
      </div>
      <div style={enter('blur', p[2])}>
        <Txt look={look} role="subtitle" text={values.line2} />
      </div>
    </Stack>
  );
};

export const champagneReception: TemplateDefinition = { ...champagneReceptionMeta, clips: { ...makeClips(look), intro: Intro } };

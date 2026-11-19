import type React from 'react';
import { AbsoluteFill, Img, random } from 'remotion';
import { useEnter } from '../shared/anim';
import { fonts } from '../shared/fonts';
import { enter, type Look, makeClips, Stack, Txt, useStagger } from '../shared/kit';
import { Confetti, lineDivider } from '../shared/motifs';
import type { ClipComponent, TemplateDefinition } from '../types';
import { polaroidSaveTheDateMeta } from './meta';

const BRICK = '#A8432F';
const INK = '#3B2F2A';

/** Washi tape strip. */
const Tape: React.FC<{ color: string; rotate: number; style?: React.CSSProperties }> = ({ color, rotate, style }) => (
  <div
    style={{
      position: 'absolute',
      width: 220,
      height: 56,
      background: `repeating-linear-gradient(45deg, ${color}, ${color} 14px, rgba(255,255,255,0.35) 14px, rgba(255,255,255,0.35) 22px)`,
      opacity: 0.85,
      transform: `rotate(${rotate}deg)`,
      boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
      ...style,
    }}
  />
);

/** Kraft paper with fibres, a few stray hearts and soft confetti. */
const Backdrop: React.FC = () => (
  <AbsoluteFill style={{ background: 'linear-gradient(160deg, #E3CFB2 0%, #D6BE9D 100%)' }}>
    <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute', opacity: 0.35 }}>
      {Array.from({ length: 260 }, (_, i) => (
        <path
          key={i}
          d={`M${random(`fx${i}`) * 1080} ${random(`fy${i}`) * 1920} l${(random(`fl${i}`) - 0.5) * 40} ${(random(`fm${i}`) - 0.5) * 12}`}
          stroke={i % 2 ? '#B89A74' : '#F1E4D0'}
          strokeWidth={2}
        />
      ))}
    </svg>
    <Confetti colors={['#F0B8A8', '#FFFFFF', '#E9D27E', '#B9CBB0']} count={26} seed="kraft" />
    <Tape color="#E7A9A0" rotate={-35} style={{ left: -40, top: 90 }} />
    <Tape color="#A9C4D8" rotate={-35} style={{ right: -40, bottom: 110 }} />
  </AbsoluteFill>
);

const look: Look = {
  Backdrop,
  ink: INK,
  accent: BRICK,
  soft: '#8A6A55',
  roles: {
    title: { family: fonts.fun, scale: 0.8 },
    subtitle: { family: fonts.sans, weight: 700, spacing: 10, scale: 0.55 },
    names: { family: fonts.fun, scale: 0.7 },
    heading: { family: fonts.display, weight: 700, scale: 1.35 },
    body: { family: fonts.serif, weight: 600, scale: 1.15 },
    caps: { family: fonts.sans, weight: 500, spacing: 8, scale: 0.9 },
  },
  Divider: lineDivider(BRICK, 'heart'),
  photo: { shape: 'rect', width: 640, height: 640 },
  motion: 'drop',
  panel: { background: '#FFFDF8', padding: '90px 50px', boxShadow: '0 22px 50px rgba(59,47,42,0.25)', transform: 'rotate(-1.5deg)', borderRadius: 6 },
  textWidth: 820,
};

/** The couple: a polaroid drops in, settles at a tilt, names handwritten under the photo. */
const Couple: ClipComponent = ({ values, durationInFrames }) => {
  const drop = useEnter(2, 14);
  const p = useStagger(3, 20, 10);
  return (
    <Stack look={{ ...look, panel: undefined }} durationInFrames={durationInFrames} clip="couple" gap={0}>
      <div
        style={{
          position: 'relative',
          background: '#FFFFFF',
          padding: '40px 40px 0',
          width: 720,
          boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
          transform: `translateY(${(1 - drop) * -900}px) rotate(${-4 + (1 - drop) * 12}deg)`,
        }}
      >
        <Tape color="#E7A9A0" rotate={-6} style={{ left: 250, top: -26 }} />
        {values.photo ? (
          <Img src={values.photo} style={{ width: 640, height: 640, objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: 640, height: 640, background: 'linear-gradient(140deg, #F4D3C8, #C9DAE6)', display: 'grid', placeItems: 'center' }}>
            <svg width={220} height={200} viewBox="-60 -50 120 100">
              <path d="M0 40 C-60 0 -56 -46 -22 -48 C-8 -49 0 -38 0 -30 C0 -38 8 -49 22 -48 C56 -46 60 0 0 40 Z" fill="#FFFFFF" opacity={0.85} />
            </svg>
          </div>
        )}
        <div style={{ height: 230, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <div style={enter('rise', p[0])}>
            <Txt look={look} role="names" text={[values.bride, values.groom].filter(Boolean).join(` ${values.connector} `)} size={150} width={640} />
          </div>
          <div style={enter('rise', p[1])}>
            <Txt look={look} role="body" text={values.tagline} size={46} width={640} color={INK} />
          </div>
        </div>
      </div>
    </Stack>
  );
};

export const polaroidSaveTheDate: TemplateDefinition = { ...polaroidSaveTheDateMeta, clips: { ...makeClips(look), couple: Couple } };

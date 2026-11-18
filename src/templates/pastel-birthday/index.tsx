import type React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { riseIn, useClipFade, useEnter } from '../shared/anim';
import { FitText } from '../shared/FitText';
import { fonts } from '../shared/fonts';
import { PhotoFrame } from '../shared/PhotoFrame';
import type { ClipComponent, TemplateDefinition } from '../types';
import { pastelBirthdayMeta } from './meta';

const INK = '#3B2A4A';
const PINK = '#E86A92';
const TEXT_W = 860;

const BALLOONS = [
  { x: 120, color: '#F7A8C0', delay: 0, size: 150 },
  { x: 820, color: '#A8D8F7', delay: 10, size: 170 },
  { x: 300, color: '#F9D77E', delay: 22, size: 120 },
  { x: 680, color: '#C4B5F4', delay: 30, size: 140 },
];

/** Soft pastel backdrop with balloons drifting upward. */
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(160deg, #FFF1F5 0%, #F3ECFF 55%, #E8F6FF 100%)' }}>
      {BALLOONS.map((b) => {
        const y = interpolate(frame - b.delay, [0, 300], [1950, -400]);
        return (
          <svg
            key={b.x}
            width={b.size}
            height={b.size * 1.9}
            viewBox="0 0 100 190"
            style={{ position: 'absolute', left: b.x, top: y, opacity: 0.85 }}
          >
            <ellipse cx="50" cy="55" rx="44" ry="54" fill={b.color} />
            <path d="M50 109 L44 118 H56 Z" fill={b.color} />
            <path d="M50 118 C40 140 60 160 50 188" stroke="#9C8AA8" strokeWidth="1.5" fill="none" />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

const Hello: ClipComponent = ({ values, durationInFrames }) => {
  const fade = useClipFade(durationInFrames);
  const a = useEnter(4);
  const b = useEnter(16);
  const c = useEnter(28);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
        <div style={riseIn(a)}>
          <FitText text={values.intro} width={TEXT_W} maxFontSize={56} fontFamily={fonts.serif} fontWeight={600} style={{ color: INK, letterSpacing: 6 }} />
        </div>
        <div style={riseIn(b, 60)}>
          <FitText text={values.name} width={TEXT_W} maxFontSize={210} fontFamily={fonts.script} style={{ color: PINK }} />
        </div>
        <div style={riseIn(c)}>
          <FitText text={values.turning} width={TEXT_W} maxFontSize={84} fontFamily={fonts.display} fontWeight={700} style={{ color: INK }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Photo: ClipComponent = ({ values, durationInFrames }) => {
  const fade = useClipFade(durationInFrames);
  const a = useEnter(4);
  const b = useEnter(18);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 50 }}>
        <div style={riseIn(a, 30)}>
          {values.photo ? (
            <PhotoFrame src={values.photo} width={620} height={620} shape="circle" borderColor="#FFFFFF" />
          ) : (
            <div style={{ width: 620, height: 620, borderRadius: '50%', background: 'linear-gradient(135deg, #F7A8C0, #C4B5F4)', border: '6px solid #fff' }} />
          )}
        </div>
        <div style={riseIn(b)}>
          <FitText text={values.caption} width={TEXT_W} maxFontSize={72} fontFamily={fonts.display} fontWeight={600} style={{ color: INK }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Party: ClipComponent = ({ values, durationInFrames }) => {
  const fade = useClipFade(durationInFrames);
  const frame = useCurrentFrame();
  const rows = ['date', 'time', 'venue'] as const;
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 36 }}>
        <FitText text={values.title} width={TEXT_W} maxFontSize={130} fontFamily={fonts.script} style={{ color: PINK }} />
        {rows.map((key, i) => {
          const p = interpolate(frame, [10 + i * 10, 28 + i * 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return values[key] ? (
            <div key={key} style={riseIn(p, 30)}>
              <FitText text={values[key]} width={TEXT_W} maxFontSize={64} fontFamily={fonts.display} fontWeight={600} style={{ color: INK }} />
            </div>
          ) : null;
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const pastelBirthday: TemplateDefinition = {
  ...pastelBirthdayMeta,
  clips: { hello: Hello, photo: Photo, party: Party },
};

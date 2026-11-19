import type React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { lineDivider, Sparkles } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { watercolourSaveTheDateMeta } from './meta';

const WASHES = [
  { x: 140, y: 220, r: 420, color: 'rgba(122,156,196,0.55)', dx: 40, dy: 20, p: 0 },
  { x: 1000, y: 380, r: 340, color: 'rgba(178,160,214,0.45)', dx: -30, dy: 30, p: 1.5 },
  { x: 900, y: 1700, r: 460, color: 'rgba(122,156,196,0.5)', dx: -40, dy: -20, p: 3 },
  { x: 120, y: 1560, r: 300, color: 'rgba(196,214,232,0.8)', dx: 30, dy: -30, p: 4.2 },
  { x: 540, y: 960, r: 520, color: 'rgba(230,238,246,0.65)', dx: 0, dy: 0, p: 0 },
];

/** Soft watercolour washes that drift and breathe, with a fine gold frame. */
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#F7F9FC' }}>
      <AbsoluteFill style={{ filter: 'blur(36px)' }}>
        {WASHES.map((w, i) => {
          const t = Math.sin(frame / 60 + w.p);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: w.x - w.r + w.dx * t,
                top: w.y - w.r + w.dy * t,
                width: w.r * 2,
                height: w.r * 1.7,
                borderRadius: '46% 54% 42% 58% / 52% 44% 56% 48%',
                background: w.color,
                transform: `rotate(${i * 37 + t * 6}deg) scale(${1 + 0.04 * t})`,
              }}
            />
          );
        })}
      </AbsoluteFill>
      <div style={{ position: 'absolute', inset: 64, border: '2px solid #C9A85C', borderRadius: 8, opacity: 0.7 }} />
      <div style={{ position: 'absolute', inset: 78, border: '1px solid #C9A85C', borderRadius: 4, opacity: 0.5 }} />
      <Sparkles color="#D4B565" count={18} seed="wc" maxSize={22} opacity={0.75} />
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: '#2E4460',
  accent: '#3F6390',
  soft: '#8A9DB5',
  roles: {
    title: { family: fonts.script, scale: 0.9 },
    subtitle: { family: fonts.elegant, spacing: 10, scale: 0.55 },
    names: { family: fonts.script },
    heading: { family: fonts.elegant, scale: 1.05 },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.elegant, spacing: 8, scale: 0.85 },
  },
  Divider: lineDivider('#C9A85C', 'diamond', 1.5),
  photo: { shape: 'circle', width: 560, height: 560, border: '#FFFFFF' },
  motion: 'blur',
  textWidth: 800,
};

export const watercolourSaveTheDate: TemplateDefinition = { ...watercolourSaveTheDateMeta, clips: makeClips(look) };

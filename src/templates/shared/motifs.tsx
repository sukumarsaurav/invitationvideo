/**
 * Animated decorations shared by the wedding-family designs. Positions come from Remotion's seeded
 * random(), so every render of a frame is identical (previews, thumbnails and the HD file match).
 */
import type React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';

const W = 1080;
const H = 1920;

/** Four-point stars that twinkle in place. */
export const Sparkles: React.FC<{ color: string; count?: number; seed?: string; maxSize?: number; opacity?: number }> = ({
  color,
  count = 28,
  seed = 'sparkle',
  maxSize = 34,
  opacity = 0.9,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        {Array.from({ length: count }, (_, i) => {
          const x = random(`${seed}x${i}`) * W;
          const y = random(`${seed}y${i}`) * H;
          const s = (0.35 + random(`${seed}s${i}`) * 0.65) * maxSize;
          const phase = random(`${seed}p${i}`) * Math.PI * 2;
          const tw = 0.5 + 0.5 * Math.sin(frame / 9 + phase);
          return (
            <path
              key={i}
              transform={`translate(${x} ${y}) scale(${(s / 20) * (0.6 + 0.4 * tw)})`}
              d="M0 -20 C2 -4 4 -2 20 0 C4 2 2 4 0 20 C-2 4 -4 2 -20 0 C-4 -2 -2 -4 0 -20 Z"
              fill={color}
              opacity={opacity * tw}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** Petals drifting down and turning. */
export const Petals: React.FC<{ colors: string[]; count?: number; seed?: string; size?: number; speed?: number; opacity?: number }> = ({
  colors,
  count = 18,
  seed = 'petal',
  size = 34,
  speed = 1,
  opacity = 0.85,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        {Array.from({ length: count }, (_, i) => {
          const r = (k: string) => random(`${seed}${k}${i}`);
          const fall = (frame * (2.2 + r('v') * 2) * speed + r('o') * (H + 300)) % (H + 300);
          const y = fall - 150;
          const x = r('x') * W + Math.sin(frame / 22 + r('w') * 6) * 40;
          const rot = frame * (1 + r('r') * 2) + r('a') * 360;
          const s = size * (0.6 + r('s') * 0.6);
          return (
            <ellipse
              key={i}
              cx={0}
              cy={0}
              rx={s * 0.45}
              ry={s * 0.8}
              fill={colors[i % colors.length]}
              opacity={opacity}
              transform={`translate(${x} ${y}) rotate(${rot}) scale(1 ${0.4 + 0.6 * Math.abs(Math.cos(rot / 40))})`}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** Bubbles rising from the bottom (champagne, soap, light orbs). */
export const Bubbles: React.FC<{ color: string; count?: number; seed?: string; maxSize?: number; filled?: boolean }> = ({
  color,
  count = 26,
  seed = 'bubble',
  maxSize = 40,
  filled = false,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        {Array.from({ length: count }, (_, i) => {
          const r = (k: string) => random(`${seed}${k}${i}`);
          const rise = (frame * (2 + r('v') * 3) + r('o') * (H + 200)) % (H + 200);
          const y = H + 100 - rise;
          const x = r('x') * W + Math.sin(frame / 15 + r('w') * 6) * 14;
          const s = maxSize * (0.25 + r('s') * 0.75);
          return filled ? (
            <circle key={i} cx={x} cy={y} r={s / 2} fill={color} opacity={0.25 + r('a') * 0.4} />
          ) : (
            <g key={i} opacity={0.35 + r('a') * 0.45}>
              <circle cx={x} cy={y} r={s / 2} fill="none" stroke={color} strokeWidth={2} />
              <circle cx={x - s * 0.15} cy={y - s * 0.15} r={s * 0.08} fill={color} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** Paper confetti tumbling down. */
export const Confetti: React.FC<{ colors: string[]; count?: number; seed?: string }> = ({ colors, count = 60, seed = 'confetti' }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        {Array.from({ length: count }, (_, i) => {
          const r = (k: string) => random(`${seed}${k}${i}`);
          const y = ((frame * (4 + r('v') * 4) + r('o') * (H + 200)) % (H + 200)) - 100;
          const x = r('x') * W + Math.sin(frame / 10 + r('w') * 6) * 30;
          const rot = frame * (4 + r('r') * 6);
          const flip = Math.cos((frame + r('f') * 60) / 6);
          return (
            <rect
              key={i}
              x={-9}
              y={-5}
              width={18}
              height={10}
              rx={2}
              fill={colors[i % colors.length]}
              transform={`translate(${x} ${y}) rotate(${rot}) scale(1 ${flip})`}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** A soft coloured glow, for lighting a backdrop. */
export const Glow: React.FC<{ x: number; y: number; r: number; color: string; opacity?: number }> = ({ x, y, r, color, opacity = 1 }) => (
  <div
    style={{
      position: 'absolute',
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      opacity,
    }}
  />
);

/** A marigold head: rings of ruffled petals, drawn at the origin with radius `r`. */
export const Marigold: React.FC<{ r: number; outer?: string; inner?: string; center?: string }> = ({
  r,
  outer = '#F59E0B',
  inner = '#FBBF24',
  center = '#B45309',
}) => (
  <g>
    {[
      { n: 16, rad: r, fill: outer, w: 0.34 },
      { n: 12, rad: r * 0.72, fill: inner, w: 0.36 },
      { n: 9, rad: r * 0.45, fill: outer, w: 0.4 },
    ].map((ring, k) => (
      <g key={k}>
        {Array.from({ length: ring.n }, (_, i) => (
          <ellipse
            key={i}
            cx={0}
            cy={-ring.rad * 0.55}
            rx={ring.rad * ring.w}
            ry={ring.rad * 0.5}
            fill={ring.fill}
            stroke={center}
            strokeOpacity={0.25}
            strokeWidth={1}
            transform={`rotate(${(360 / ring.n) * i + k * 11})`}
          />
        ))}
      </g>
    ))}
    <circle r={r * 0.18} fill={center} />
  </g>
);

/** A pointed leaf from the origin to (0, -len). */
export const Leaf: React.FC<{ len: number; color: string; vein?: string; rotate?: number; x?: number; y?: number }> = ({
  len,
  color,
  vein,
  rotate = 0,
  x = 0,
  y = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <path d={`M0 0 C${len * 0.32} ${-len * 0.3} ${len * 0.28} ${-len * 0.75} 0 ${-len} C${-len * 0.28} ${-len * 0.75} ${-len * 0.32} ${-len * 0.3} 0 0 Z`} fill={color} />
    {vein ? <path d={`M0 0 L0 ${-len * 0.92}`} stroke={vein} strokeWidth={Math.max(1, len / 40)} /> : null}
  </g>
);

/** Gentle back-and-forth sway in degrees, for hanging things. */
export const useSway = (amplitude = 3, period = 70, phase = 0): number => {
  const frame = useCurrentFrame();
  return Math.sin((frame / period) * Math.PI * 2 + phase) * amplitude;
};

/** 0 → 1 over `[from, to]` frames, clamped: for drawing strokes on and opening curtains. */
export const useProgress = (from: number, to: number): number => {
  const frame = useCurrentFrame();
  return interpolate(frame, [from, to], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
};

/** A layered open flower (peony, rose from above), drawn at the origin with radius `r`. */
export const Bloom: React.FC<{ r: number; colors: [string, string, string]; center?: string; petals?: number; turn?: number }> = ({
  r,
  colors,
  center = '#F6D27A',
  petals = 6,
  turn = 0,
}) => (
  <g transform={`rotate(${turn})`}>
    {[1, 0.74, 0.48].map((k, layer) => (
      <g key={layer} transform={`rotate(${layer * (180 / petals)})`}>
        {Array.from({ length: petals }, (_, i) => (
          <ellipse
            key={i}
            cx={0}
            cy={-r * k * 0.52}
            rx={r * k * 0.4}
            ry={r * k * 0.52}
            fill={colors[layer]}
            transform={`rotate(${(360 / petals) * i})`}
          />
        ))}
      </g>
    ))}
    <circle r={r * 0.14} fill={center} />
  </g>
);

type DividerGlyph = 'dot' | 'diamond' | 'heart' | 'leaf' | 'none';

const glyphPath = (g: DividerGlyph): string | null => {
  if (g === 'diamond') return 'M0 -12 L12 0 L0 12 L-12 0 Z';
  if (g === 'heart') return 'M0 10 C-14 0 -12 -12 -4 -12 C-1 -12 0 -9 0 -8 C0 -9 1 -12 4 -12 C12 -12 14 0 0 10 Z';
  if (g === 'leaf') return 'M-16 0 C-8 -10 8 -10 16 0 C8 10 -8 10 -16 0 Z';
  return null;
};

/** A plain line divider with a small centre mark, in the shape kit.tsx's Look.Divider expects. */
export const lineDivider =
  (color: string, glyph: DividerGlyph = 'dot', strokeWidth = 2): React.FC<{ width: number; flip?: boolean; style?: React.CSSProperties }> =>
  ({ width, flip, style }) => {
    const path = glyphPath(glyph);
    return (
      <svg width={width} height={30} viewBox="-200 -15 400 30" style={{ transform: flip ? 'rotate(180deg)' : undefined, ...style }}>
        <path d="M-190 0 H-30 M30 0 H190" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        {path ? <path d={path} fill={color} /> : glyph === 'dot' ? <circle r={6} fill={color} /> : null}
        <circle cx={-190} r={3} fill={color} />
        <circle cx={190} r={3} fill={color} />
      </svg>
    );
  };

import type React from 'react';

/** A symmetrical gold flourish used above and below headings. */
export const Flourish: React.FC<{ width: number; color: string; style?: React.CSSProperties }> = ({
  width,
  color,
  style,
}) => (
  <svg width={width} height={width * 0.12} viewBox="0 0 400 48" style={style}>
    <g fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round">
      <path d="M20 24 H150" />
      <path d="M250 24 H380" />
      <path d="M150 24 C165 6 185 6 200 24 C215 42 235 42 250 24" />
      <path d="M150 24 C165 42 185 42 200 24 C215 6 235 6 250 24" />
      <path d="M60 24 C70 14 82 14 90 24 C82 34 70 34 60 24 Z" />
      <path d="M310 24 C318 14 330 14 340 24 C330 34 318 34 310 24 Z" />
    </g>
    <circle cx="200" cy="24" r="5" fill={color} />
    <circle cx="20" cy="24" r="3" fill={color} />
    <circle cx="380" cy="24" r="3" fill={color} />
  </svg>
);

/** A paisley-like corner motif; rotate it for each corner. */
export const Corner: React.FC<{ size: number; color: string; rotate?: number; style?: React.CSSProperties }> = ({
  size,
  color,
  rotate = 0,
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    style={{ transform: `rotate(${rotate}deg)`, ...style }}
  >
    <g fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round">
      <path d="M6 114 V40 C6 20 20 6 40 6 H114" />
      <path d="M18 114 V46 C18 30 30 18 46 18 H114" />
      <path d="M30 60 C30 40 40 30 60 30 C52 40 46 50 46 64 C46 74 38 78 30 72 Z" />
      <path d="M60 30 C80 30 92 38 96 52" />
      <path d="M30 60 C30 80 38 92 52 96" />
    </g>
    <circle cx="40" cy="40" r="5" fill={color} />
  </svg>
);

/** Thin double frame inset from the edges of the video. */
export const DoubleFrame: React.FC<{ inset: number; color: string; opacity?: number }> = ({
  inset,
  color,
  opacity = 1,
}) => (
  <>
    <div
      style={{
        position: 'absolute',
        inset,
        border: `4px solid ${color}`,
        borderRadius: 28,
        opacity,
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: inset + 16,
        border: `1.5px solid ${color}`,
        borderRadius: 20,
        opacity: opacity * 0.8,
      }}
    />
  </>
);

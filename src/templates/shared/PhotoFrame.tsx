import type React from 'react';
import { Img } from 'remotion';

type Props = {
  src: string;
  width: number;
  height: number;
  shape?: 'rect' | 'circle' | 'arch';
  borderColor?: string;
  style?: React.CSSProperties;
};

const radiusFor = (shape: Props['shape'], width: number): string => {
  if (shape === 'circle') return '50%';
  if (shape === 'arch') return `${width / 2}px ${width / 2}px 24px 24px`;
  return '24px';
};

/** A customer photo cropped into a shaped frame. Renders nothing when no photo was given. */
export const PhotoFrame: React.FC<Props> = ({ src, width, height, shape = 'rect', borderColor, style }) => {
  if (!src) return null;
  const radius = radiusFor(shape, width);
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        border: borderColor ? `6px solid ${borderColor}` : undefined,
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
        ...style,
      }}
    >
      <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  );
};

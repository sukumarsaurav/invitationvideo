import type React from 'react';
import { AbsoluteFill } from 'remotion';

const band: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  height: 96,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(90deg, rgba(0,0,0,0.0), rgba(0,0,0,0.38), rgba(0,0,0,0.0))',
  color: 'rgba(255,255,255,0.85)',
  fontFamily: 'Inter, sans-serif',
  fontWeight: 700,
  fontSize: 34,
  letterSpacing: 6,
  whiteSpace: 'nowrap',
};

/**
 * Free-preview mark. Kept to the edges plus one faint diagonal word, so customers can still
 * read and check their names, dates and venue in the middle of the frame.
 */
export const Watermark: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
    <div style={{ ...band, top: 150 }}>PREVIEW · invitationvideos.com</div>
    <div style={{ ...band, bottom: 150 }}>PREVIEW · invitationvideos.com</div>
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <span
        style={{
          transform: 'rotate(-32deg)',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 800,
          fontSize: 230,
          letterSpacing: 24,
          color: 'rgba(255,255,255,0.10)',
          WebkitTextStroke: '2px rgba(255,255,255,0.18)',
          whiteSpace: 'nowrap',
        }}
      >
        PREVIEW
      </span>
    </AbsoluteFill>
  </AbsoluteFill>
);

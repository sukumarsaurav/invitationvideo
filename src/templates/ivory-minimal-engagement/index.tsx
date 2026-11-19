import type React from 'react';
import { AbsoluteFill } from 'remotion';
import { fonts } from '../shared/fonts';
import { type Look, makeClips } from '../shared/kit';
import { lineDivider, useProgress } from '../shared/motifs';
import type { TemplateDefinition } from '../types';
import { ivoryMinimalEngagementMeta } from './meta';

const GOLD = '#B79C6B';
const INK = '#2B2724';

/** Ivory paper, a fine frame whose lines grow in from the corners, and one large gold circle drawing on. */
const Backdrop: React.FC = () => {
  const grow = useProgress(0, 30);
  const circle = useProgress(6, 70);
  const c = 2 * Math.PI * 420;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #FBF8F2 0%, #F4EEE3 100%)' }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        <circle cx={540} cy={960} r={420} fill="none" stroke={GOLD} strokeWidth={1.5} opacity={0.5} strokeDasharray={c} strokeDashoffset={(1 - circle) * c} transform="rotate(-90 540 960)" />
        <g stroke={INK} strokeWidth={2} opacity={0.75}>
          <path d={`M80 80 H${80 + 920 * grow}`} />
          <path d={`M80 80 V${80 + 1760 * grow}`} />
          <path d={`M1000 1840 H${1000 - 920 * grow}`} />
          <path d={`M1000 1840 V${1840 - 1760 * grow}`} />
        </g>
        <g stroke={GOLD} strokeWidth={1.2} opacity={0.8}>
          <path d={`M100 100 H${100 + 880 * grow}`} />
          <path d={`M980 1820 H${980 - 880 * grow}`} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const look: Look = {
  Backdrop,
  ink: INK,
  accent: '#1F1B18',
  soft: GOLD,
  roles: {
    title: { family: fonts.display, weight: 600, scale: 0.72, style: { fontStyle: 'italic' } },
    subtitle: { family: fonts.sans, weight: 500, spacing: 20, scale: 0.6 },
    names: { family: fonts.display, weight: 600, scale: 0.8 },
    heading: { family: fonts.display, weight: 600, scale: 0.9 },
    body: { family: fonts.serif, weight: 500 },
    caps: { family: fonts.sans, weight: 500, spacing: 10, scale: 0.72 },
  },
  Divider: lineDivider(GOLD, 'none', 1.5),
  photo: { shape: 'rect', width: 520, height: 650, border: '#FFFFFF', style: { borderRadius: 4, boxShadow: '0 18px 40px rgba(43,39,36,0.25)' } },
  motion: 'slide',
  textWidth: 760,
};

export const ivoryMinimalEngagement: TemplateDefinition = { ...ivoryMinimalEngagementMeta, clips: makeClips(look) };

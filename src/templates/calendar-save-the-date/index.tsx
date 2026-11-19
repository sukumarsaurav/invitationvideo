import type React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { fonts } from '../shared/fonts';
import { enter, type Look, makeClips, Stack, Txt, useStagger } from '../shared/kit';
import { Leaf, lineDivider, useProgress } from '../shared/motifs';
import type { ClipComponent, TemplateDefinition } from '../types';
import { calendarSaveTheDateMeta } from './meta';

const TERRA = '#B5543A';
const INK = '#3D2A22';
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#FBF3EA' }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
        <circle cx={980} cy={180} r={300} fill="#F1C9AE" opacity={0.6} />
        <circle cx={980} cy={180} r={200} fill="#E9A987" opacity={0.45} />
        <circle cx={60} cy={1820} r={260} fill="#F1C9AE" opacity={0.5} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <g key={i} transform={`translate(${120 + i * 22} 1900) rotate(${-40 + i * 12 + Math.sin(frame / 35 + i) * 3})`}>
            <path d={`M0 0 C${30} -80 ${20} -180 0 ${-(260 - i * 18)}`} stroke="#7E8F6A" strokeWidth={4} fill="none" />
            {[0.3, 0.5, 0.7, 0.85].map((t) => (
              <Leaf key={t} y={-(260 - i * 18) * t} len={46} color="#9AAA84" rotate={t * 100 > 50 ? 40 : -40} />
            ))}
          </g>
        ))}
        <rect x={60} y={60} width={960} height={1800} rx={30} fill="none" stroke={TERRA} strokeWidth={2} opacity={0.35} />
      </svg>
    </AbsoluteFill>
  );
};

/** A calendar page for the customer's month with the day ringed by a hand-drawn heart. */
const CalendarPage: React.FC<{ day: number; month: number; year: number; monthName: string; draw: number; reveal: number }> = ({
  day,
  month,
  year,
  monthName,
  draw,
  reveal,
}) => {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cell = 108;
  const rows = Math.ceil((first + days) / 7);
  const heart = 'M0 34 C-50 0 -48 -44 -18 -46 C-6 -47 0 -38 0 -30 C0 -38 6 -47 18 -46 C48 -44 50 0 0 34 Z';
  return (
    <div style={{ background: '#FFFDF9', borderRadius: 28, padding: '40px 46px 46px', boxShadow: '0 24px 60px rgba(61,42,34,0.18)', width: 7 * cell + 92 }}>
      <div style={{ textAlign: 'center', fontFamily: fonts.sans, fontWeight: 700, fontSize: 46, letterSpacing: 10, color: TERRA }}>
        {`${monthName} ${year}`.toUpperCase()}
      </div>
      <svg width={7 * cell} height={(rows + 1) * cell * 0.86} viewBox={`0 0 ${7 * cell} ${(rows + 1) * cell * 0.86}`} style={{ marginTop: 18 }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <text key={i} x={i * cell + cell / 2} y={50} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={32} fill="#C9876F">
            {d}
          </text>
        ))}
        {Array.from({ length: days }, (_, i) => {
          const slot = first + i;
          const x = (slot % 7) * cell + cell / 2;
          const y = (Math.floor(slot / 7) + 1) * cell * 0.86 + 40;
          const isDay = i + 1 === day;
          const show = interpolate(reveal * (days + 6) - i, [0, 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <g key={i} opacity={show}>
              {isDay ? (
                <path d={heart} transform={`translate(${x} ${y - 14}) scale(1.25)`} fill="none" stroke={TERRA} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
              ) : null}
              <text x={x} y={y} textAnchor="middle" fontFamily={fonts.sans} fontWeight={isDay ? 700 : 500} fontSize={isDay ? 44 : 38} fill={isDay ? TERRA : INK}>
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const look: Look = {
  Backdrop,
  ink: INK,
  accent: TERRA,
  soft: '#B97A62',
  roles: {
    title: { family: fonts.script, scale: 0.85 },
    subtitle: { family: fonts.sans, weight: 500, spacing: 10, scale: 0.55 },
    names: { family: fonts.scriptAlt },
    heading: { family: fonts.elegant },
    body: { family: fonts.serif, weight: 600 },
    caps: { family: fonts.sans, weight: 500, spacing: 8, scale: 0.75 },
  },
  Divider: lineDivider('#D69A80', 'heart'),
  photo: { shape: 'arch', width: 500, height: 625, border: '#FFFDF9' },
  motion: 'drop',
  textWidth: 820,
};

/** The date: the calendar page fills in, then the heart is drawn around the day. */
const Details: ClipComponent = ({ values, durationInFrames }) => {
  const p = useStagger(3, 4, 10);
  const reveal = useProgress(10, 50);
  const draw = useProgress(55, 90);
  const m = MONTHS.indexOf(values.month.trim().slice(0, 3).toLowerCase());
  const year = Number.parseInt(values.year, 10);
  const day = Number.parseInt(values.day, 10);
  const valid = m >= 0 && year > 1900 && year < 2200 && day >= 1 && day <= 31;
  return (
    <Stack look={look} durationInFrames={durationInFrames} clip="details" gap={34}>
      <div style={enter('drop', p[0])}>
        <Txt look={look} role="title" text={values.event} size={120} />
      </div>
      <div style={enter('rise', p[1])}>
        {valid ? (
          <CalendarPage day={day} month={m} year={year} monthName={values.month} draw={draw} reveal={reveal} />
        ) : (
          <Txt look={look} role="heading" text={[values.day, values.month, values.year].filter(Boolean).join(' ')} size={90} />
        )}
      </div>
      <div style={enter('rise', p[2])}>
        <Txt look={look} role="caps" text={values.city} size={48} />
      </div>
    </Stack>
  );
};

export const calendarSaveTheDate: TemplateDefinition = { ...calendarSaveTheDateMeta, clips: { ...makeClips(look), details: Details } };

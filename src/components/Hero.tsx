import { Player, Thumbnail } from '@remotion/player';
import { useCatalogue } from '@/lib/catalogue';
import { ArrowRight, Eye, Send, Timer } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { getDurationInFrames, makeExampleData } from '@/templates/data';
import { trendingTemplates } from '@/templates/registry';
import { bindTemplate } from '@/templates/TemplateVideo';
import type { TemplateDefinition } from '@/templates/types';
import { Ornament } from './Ornament';

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** One template inside a framed "card", playing (or a still for reduced motion). */
const FramedVideo = ({ def, play, className }: { def: TemplateDefinition; play: boolean; className?: string }) => {
  const component = useMemo(() => bindTemplate(def), [def]);
  const props = useMemo(() => ({ data: makeExampleData(def), watermark: false }), [def]);
  // Start on a finished frame (the second clip's hold frame, usually the names), not the fade-in from black.
  const showFrame = def.schema.clips[1] ? def.schema.clips[0].durationInFrames + (def.schema.clips[1].holdFrame ?? 60) : 60;
  const common = {
    component,
    inputProps: props,
    compositionWidth: def.width,
    compositionHeight: def.height,
    durationInFrames: getDurationInFrames(def, props.data),
    fps: def.fps,
    style: { width: '100%', height: '100%' },
  };
  return (
    <div className={className}>
      <div className="h-full overflow-hidden rounded-[22px] border-[3px] border-accent/80 bg-ink shadow-[0_24px_60px_-20px_rgba(74,15,36,0.55)]">
        {play ? (
          <Player {...common} autoPlay loop initiallyMuted initialFrame={showFrame} acknowledgeRemotionLicense style={{ ...common.style, pointerEvents: 'none' }} />
        ) : (
          <Thumbnail {...common} frameToDisplay={showFrame} />
        )}
      </div>
    </div>
  );
};

/** Landing hero: headline, divider, call to action, three promises and a live template. */
export const Hero = () => {
  const { t } = useI18n();
  useCatalogue(); // re-render when the admin-published catalogue arrives
  const [main, side] = trendingTemplates();
  const motion = !reducedMotion();
  const promises = [
    { icon: Eye, text: 'Free preview' },
    { icon: Timer, text: 'Ready in minutes' },
    { icon: Send, text: 'Send on WhatsApp' },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="px-4 pb-6 pt-8 text-center md:px-6 md:pt-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-ink md:text-xs md:tracking-[0.28em]">
          {t('Personalised video invitations')}
        </p>
        <h1 className="mt-4 font-display text-[40px] font-semibold leading-[1.05] text-primary-dark md:text-6xl">
          {t('Your celebration,')}
          <br />
          <span className="font-medium italic text-accent-ink">{t('beautifully announced')}</span>
        </h1>
        <Ornament className="mx-auto mt-5" />
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted md:text-lg">
          {t('Pick a design, add your names and photos, and watch your invitation come to life. Share it on WhatsApp in minutes.')}
        </p>
        <Link
          to="/templates"
          className="mt-7 inline-flex min-h-14 items-center gap-3 rounded-full bg-primary px-8 font-display text-xl text-white shadow-[0_14px_30px_-12px_rgba(122,31,61,0.7)] transition-transform active:scale-[0.97]"
        >
          {t('Explore designs')} <ArrowRight className="size-5" />
        </Link>
        <ul className="mx-auto mt-7 flex max-w-lg flex-wrap justify-center gap-x-5 gap-y-3 text-sm text-ink">
          {promises.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2">
              <Icon className="size-5 text-accent-ink" strokeWidth={1.6} /> {t(text)}
            </li>
          ))}
        </ul>
      </div>

      {/* Stage: soft backdrop, arches, and the templates themselves */}
      {main ? (
        <div className="relative mx-auto h-[440px] max-w-3xl md:h-[520px]">
          {/* Fades out at the sides so the backdrop has no hard edges on wide screens. */}
          <div
            className="absolute inset-x-0 bottom-0 top-10 bg-gradient-to-b from-transparent via-[#F6E3D4] to-[#EFD2C0] [mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]"
            aria-hidden
          />
          <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-[85%] w-full text-accent/35" aria-hidden>
            <g fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 300V150a60 60 0 0 1 120 0v150" />
              <path d="M34 300V154a46 46 0 0 1 92 0v146" />
              <path d="M260 300V150a60 60 0 0 1 120 0v150" />
              <path d="M274 300V154a46 46 0 0 1 92 0v146" />
            </g>
          </svg>
          {side ? (
            <FramedVideo def={side} play={false} className="absolute bottom-10 left-[6%] h-[250px] w-[141px] -rotate-6 opacity-95 md:left-[16%] md:h-[300px] md:w-[169px]" />
          ) : null}
          <FramedVideo def={main} play={motion} className="absolute bottom-6 left-1/2 h-[380px] w-[214px] -translate-x-1/2 rotate-2 md:h-[460px] md:w-[259px]" />
          <span className="absolute right-[10%] top-16 text-2xl text-accent motion-safe:animate-pulse" aria-hidden>✦</span>
          <span className="absolute left-[12%] top-24 text-lg text-accent/70 motion-safe:animate-pulse" aria-hidden>✦</span>
        </div>
      ) : null}
    </section>
  );
};

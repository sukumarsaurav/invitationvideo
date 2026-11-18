import { Player, Thumbnail } from '@remotion/player';
import { Heart, Play } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useIsActiveCard, useNearScreen } from '@/lib/activeCard';
import { cn, formatInr } from '@/lib/cn';
import { showPrices } from '@/lib/pricing';
import { useI18n } from '@/lib/i18n';
import { toggleShortlist, useShortlist } from '@/lib/shortlist';
import { getDurationInFrames, makeExampleData } from '@/templates/data';
import { categoryName } from '@/templates/registry';
import { bindTemplate } from '@/templates/TemplateVideo';
import type { TemplateDefinition } from '@/templates/types';

const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

/**
 * Framed 9:16 card: format badge and length on the picture, a shortlist heart, the name and price
 * below. Off screen: just the colour swatch (cheap). Near the screen: a real still frame. In the
 * middle of a phone screen (one card at a time) or under the mouse: plays a muted loop.
 */
export const TemplateCard = ({ def, order = 0 }: { def: TemplateDefinition; order?: number }) => {
  const { t } = useI18n();
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const near = useNearScreen(el);
  const centred = useIsActiveCard(def.slug, order, canHover() ? null : el);
  const play = !reducedMotion() && (hovered || centred);

  const component = useMemo(() => bindTemplate(def), [def]);
  const props = useMemo(() => ({ data: makeExampleData(def), watermark: false }), [def]);
  const duration = getDurationInFrames(def, props.data);
  const frame = def.schema.clips[0].holdFrame ?? 60;
  const shortlisted = useShortlist().includes(def.slug);

  return (
    <div className="group relative rounded-card border border-border bg-surface p-1.5 shadow-sm transition-shadow hover:shadow-md sm:p-2">
    <Link to={`/t/${def.slug}`} className="block" onPointerEnter={() => canHover() && setHovered(true)} onPointerLeave={() => setHovered(false)}>
      <div
        ref={setEl}
        className="relative aspect-[9/16] overflow-hidden rounded-[12px] transition-transform group-active:scale-[0.98]"
        style={{ background: `linear-gradient(160deg, ${def.swatch[0]}, ${def.swatch[1]})` }}
      >
        {near ? (
          play ? (
            <Player
              component={component}
              inputProps={props}
              compositionWidth={def.width}
              compositionHeight={def.height}
              durationInFrames={duration}
              fps={def.fps}
              autoPlay
              loop
              initiallyMuted
              // Start where the still thumbnail was, not on the intro's black first frames.
              initialFrame={Math.min(frame, duration - 1)}
              acknowledgeRemotionLicense
              style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
            />
          ) : (
            <Thumbnail
              component={component}
              inputProps={props}
              compositionWidth={def.width}
              compositionHeight={def.height}
              durationInFrames={duration}
              fps={def.fps}
              frameToDisplay={frame}
              style={{ width: '100%', height: '100%' }}
            />
          )
        ) : null}
        {/* Play hint while the card shows a still. */}
        {!play ? (
          <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-surface/90 text-ink shadow-md transition-transform group-hover:scale-110" aria-hidden>
            <Play className="ml-0.5 size-5" fill="currentColor" />
          </span>
        ) : null}
        <span className="absolute bottom-2 left-2 rounded-full bg-surface/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink shadow-sm">{t('Video')}</span>
        <span className="absolute bottom-2 right-2 rounded-full bg-ink/75 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white">
          {clock(Math.round(duration / def.fps))}
        </span>
      </div>
      <div className="px-1 pb-1 pt-2.5 text-center">
        <p className="line-clamp-2 font-display text-[15px] leading-snug text-ink sm:text-base">{def.name}</p>
        <p className="mt-0.5 text-xs text-muted">{t(categoryName(def.category))}</p>
        {showPrices() ? <p className="mt-1 text-sm font-semibold text-primary">{formatInr(def.priceInr)}</p> : null}
      </div>
    </Link>
      {/* Beside the link, not inside it: a button can't sit inside a link. */}
      <button
        type="button"
        onClick={() => toggleShortlist(def.slug)}
        aria-pressed={shortlisted}
        aria-label={shortlisted ? t('Remove {name} from shortlist', { name: def.name }) : t('Add {name} to shortlist', { name: def.name })}
        className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-surface/95 shadow-md transition-transform active:scale-90 sm:right-4 sm:top-4"
      >
        <Heart className={cn('size-5', shortlisted ? 'fill-primary text-primary' : 'text-ink')} strokeWidth={1.8} />
      </button>
    </div>
  );
};

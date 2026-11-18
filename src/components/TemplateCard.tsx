import { Player, Thumbnail } from '@remotion/player';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useIsActiveCard, useNearScreen } from '@/lib/activeCard';
import { formatInr } from '@/lib/cn';
import { useI18n } from '@/lib/i18n';
import { getDurationInFrames, makeExampleData } from '@/templates/data';
import { categoryName } from '@/templates/registry';
import { bindTemplate } from '@/templates/TemplateVideo';
import type { TemplateDefinition } from '@/templates/types';

const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * 9:16 card. Off screen: just the colour swatch (cheap). Near the screen: a real still frame.
 * In the middle of a phone screen (one card at a time) or under the mouse: plays a muted loop.
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

  return (
    <Link to={`/t/${def.slug}`} className="group block" onPointerEnter={() => canHover() && setHovered(true)} onPointerLeave={() => setHovered(false)}>
      <div
        ref={setEl}
        className="relative aspect-[9/16] overflow-hidden rounded-card border border-border shadow-sm transition-transform group-active:scale-[0.98]"
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
        <span className="absolute right-2 top-2 rounded-full bg-ink/70 px-2 py-0.5 text-xs font-semibold text-white">
          {Math.round(duration / def.fps)}s
        </span>
      </div>
      <div className="px-1 pt-2">
        <p className="line-clamp-2 text-sm font-semibold leading-snug">{def.name}</p>
        <p className="mt-0.5 flex items-center justify-between text-xs text-muted">
          <span>{t(categoryName(def.category))}</span>
          <span className="font-semibold text-accent-ink">{formatInr(def.priceInr)}</span>
        </p>
      </div>
    </Link>
  );
};

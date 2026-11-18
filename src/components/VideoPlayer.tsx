import { Player, type PlayerRef } from '@remotion/player';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { cn } from '@/lib/cn';
import { useI18n } from '@/lib/i18n';
import { getDurationInFrames } from '@/templates/data';
import { bindTemplate } from '@/templates/TemplateVideo';
import type { TemplateMeta, TemplateDefinition, VideoData } from '@/templates/types';

type Props = {
  def: TemplateDefinition;
  data: VideoData;
  watermark: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  initialFrame?: number;
  /** Play/loop only this range of frames (a single clip). */
  inFrame?: number;
  outFrame?: number;
  /** Show a "Tap for sound" pill while playing muted. */
  soundHint?: boolean;
  playerRef?: RefObject<PlayerRef | null>;
  style?: CSSProperties;
  className?: string;
};

/**
 * Remotion Player with large, thumb-friendly controls:
 * tap anywhere to play/pause, a 44px mute button and a progress bar you can tap to seek.
 */
export const VideoPlayer = ({ def, data, watermark, autoPlay, loop, initialFrame, inFrame, outFrame, soundHint, playerRef, style, className }: Props) => {
  const { t } = useI18n();
  const ownRef = useRef<PlayerRef>(null);
  const ref = playerRef ?? ownRef;
  const component = useMemo(() => bindTemplate(def), [def]);
  const inputProps = useMemo(() => ({ data, watermark }), [data, watermark]);
  const duration = getDurationInFrames(def as TemplateMeta, data);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [frame, setFrame] = useState(initialFrame ?? 0);
  const [hintDismissed, setHintDismissed] = useState(false);

  useEffect(() => {
    const p = ref.current;
    if (!p) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onMute = (e: { detail: { isMuted: boolean } }) => setMuted(e.detail.isMuted);
    const onFrame = (e: { detail: { frame: number } }) => setFrame(e.detail.frame);
    p.addEventListener('play', onPlay);
    p.addEventListener('pause', onPause);
    p.addEventListener('ended', onPause);
    p.addEventListener('mutechange', onMute);
    p.addEventListener('frameupdate', onFrame);
    setPlaying(p.isPlaying());
    setMuted(p.isMuted());
    return () => {
      p.removeEventListener('play', onPlay);
      p.removeEventListener('pause', onPause);
      p.removeEventListener('ended', onPause);
      p.removeEventListener('mutechange', onMute);
      p.removeEventListener('frameupdate', onFrame);
    };
  }, [ref, component]);

  const toggleMute = () => {
    const p = ref.current;
    if (!p) return;
    if (p.isMuted()) p.unmute();
    else p.mute();
    setHintDismissed(true);
  };

  const seekFromBar = (clientX: number, el: HTMLElement) => {
    const b = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - b.left) / b.width));
    ref.current?.seekTo(Math.round(ratio * (duration - 1)));
  };

  return (
    <div className={cn('relative select-none', className)} style={style}>
      <Player
        ref={ref}
        component={component}
        inputProps={inputProps}
        durationInFrames={duration}
        compositionWidth={def.width}
        compositionHeight={def.height}
        fps={def.fps}
        autoPlay={autoPlay}
        loop={loop}
        initiallyMuted
        initialFrame={initialFrame}
        inFrame={inFrame ?? null}
        outFrame={outFrame ?? null}
        acknowledgeRemotionLicense
        style={{ width: '100%', height: '100%' }}
      />

      {/* Whole-video tap target */}
      <button
        className="absolute inset-0 grid place-items-center"
        onClick={(e) => ref.current?.toggle(e)}
        aria-label={playing ? t('Pause') : t('Play')}
      >
        {!playing ? (
          <span className="grid size-16 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm">
            <Play className="ml-1 size-8" fill="currentColor" />
          </span>
        ) : null}
      </button>

      {soundHint && playing && muted && !hintDismissed ? (
        <button
          onClick={toggleMute}
          className="absolute left-1/2 top-3 flex min-h-11 -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-black/55 px-4 text-sm font-medium text-white backdrop-blur-sm"
        >
          <Volume2 className="size-4" /> {t('Tap for sound')}
        </button>
      ) : null}

      {/* Bottom controls */}
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-black/50 to-transparent px-1 pt-6">
        <button
          onClick={(e) => ref.current?.toggle(e)}
          className="grid size-11 shrink-0 place-items-center text-white"
          aria-label={playing ? t('Pause') : t('Play')}
        >
          {playing ? <Pause className="size-5" fill="currentColor" /> : <Play className="size-5" fill="currentColor" />}
        </button>
        <div
          role="slider"
          aria-label={t('Seek')}
          aria-valuemin={0}
          aria-valuemax={duration - 1}
          aria-valuenow={frame}
          tabIndex={0}
          className="relative flex h-11 flex-1 cursor-pointer items-center"
          onPointerDown={(e) => {
            const el = e.currentTarget;
            el.setPointerCapture(e.pointerId);
            seekFromBar(e.clientX, el);
          }}
          onPointerMove={(e) => {
            if (e.buttons) seekFromBar(e.clientX, e.currentTarget);
          }}
          onKeyDown={(e) => {
            const step = def.fps;
            if (e.key === 'ArrowRight') ref.current?.seekTo(Math.min(duration - 1, frame + step));
            if (e.key === 'ArrowLeft') ref.current?.seekTo(Math.max(0, frame - step));
          }}
        >
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/35">
            <div className="h-full rounded-full bg-white" style={{ width: `${(frame / Math.max(1, duration - 1)) * 100}%` }} />
          </div>
        </div>
        <button onClick={toggleMute} className="grid size-11 shrink-0 place-items-center text-white" aria-label={muted ? t('Unmute') : t('Mute')}>
          {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
        </button>
      </div>
    </div>
  );
};

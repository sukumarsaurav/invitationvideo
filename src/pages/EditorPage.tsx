import type { PlayerRef } from '@remotion/player';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  ImagePlus,
  Loader2,
  Pencil,
  Play,
  RotateCw,
  Share2,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/Button';
import { PhotoCropper } from '@/components/PhotoCropper';
import { Sheet } from '@/components/Sheet';
import { useToast } from '@/components/Toast';
import { VideoPlayer } from '@/components/VideoPlayer';
import { useAuth } from '@/lib/auth';
import { cn, formatInr } from '@/lib/cn';
import { showPrices } from '@/lib/pricing';
import { createDraft, createShareLink, saveDraftData, useDraft } from '@/lib/drafts';
import { tap } from '@/lib/haptics';
import { useI18n } from '@/lib/i18n';
import { estimateRenderSeconds } from '@/lib/render';
import { useSeo } from '@/lib/seo';
import { useBack } from '@/lib/useBack';
import { clipShowingDetail, findExamplesInUse, getDurationInFrames, holdFrameOf, makeDefaultData, normaliseData, startFrameOf, videoTitle } from '@/templates/data';
import { getTemplate } from '@/templates/registry';
import type { Field, PhotoField, TemplateDefinition, TextField, VideoData } from '@/templates/types';
import { NotFoundPage } from './NotFoundPage';

/** `/editor/:draftId` edits a saved draft; `/editor/new/:slug` starts one that is only saved on the first change. */
export const EditorPage = () => {
  const { draftId, slug } = useParams();
  const { draft, loading } = useDraft(draftId);

  if (slug) {
    const def = getTemplate(slug);
    if (!def) return <NotFoundPage />;
    return <Editor key={`new-${slug}`} def={def} draftId={null} initial={makeDefaultData(def)} />;
  }
  const def = getTemplate(draft?.templateSlug);
  if (loading) return <LoadingScreen />;
  if (!draft || !def) return <NotFoundPage />;
  return <Editor key={draft.id} def={def} draftId={draft.id} initial={draft.data} />;
};

export const LoadingScreen = () => (
  <div className="grid min-h-dvh place-items-center bg-background text-muted">
    <Loader2 className="size-6 animate-spin" aria-label="Loading" />
  </div>
);

type SaveState = 'idle' | 'saved' | 'saving' | 'error';
const SIGN_IN_PROMPT_KEY = 'iv.signInPrompted';

const Editor = ({ def, draftId: initialDraftId, initial }: { def: TemplateDefinition; draftId: string | null; initial: VideoData }) => {
  const { t } = useI18n();
  const toast = useToast();
  const navigate = useNavigate();
  const back = useBack(`/t/${def.slug}`);
  useSeo({ title: 'Edit your invitation', description: '', path: '/editor', noindex: true });
  const { user, available: authAvailable } = useAuth();
  const playerRef = useRef<PlayerRef>(null);

  const [draftId, setDraftId] = useState<string | null>(initialDraftId);
  const [data, setData] = useState<VideoData>(() => normaliseData(def, initial));
  const [step, setStep] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>(initialDraftId ? 'saved' : 'idle');
  const [signInSheet, setSignInSheet] = useState(false);
  const [shareSheet, setShareSheet] = useState<{ url: string } | null>(null);
  const [sharing, setSharing] = useState(false);
  // Clip "Preview" loops just that clip; null = whole video.
  const [range, setRange] = useState<{ inFrame: number; outFrame: number } | null>(null);
  // Direction of the last step change, for the slide animation.
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd');
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const [retry, setRetry] = useState(0);

  // Keep the current step's chip in view on narrow screens (e.g. "Finish" sits off the right edge).
  // Scrolls the strip sideways only, never the page.
  const stripRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const strip = stripRef.current;
    const chip = strip?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!strip || !chip) return;
    const s = strip.getBoundingClientRect();
    const c = chip.getBoundingClientRect();
    const gap = 12;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    if (c.left < s.left + gap) strip.scrollBy({ left: c.left - s.left - gap, behavior });
    else if (c.right > s.right - gap) strip.scrollBy({ left: c.right - s.right + gap, behavior });
  }, [step]);

  // Steps: 0 = your details, 1..n = clips, n+1 = finish.
  const clips = def.schema.clips;
  const finalStep = clips.length + 1;
  const isDetails = step === 0;
  const isFinal = step === finalStep;
  const clip = !isDetails && !isFinal ? clips[step - 1] : undefined;
  const duration = getDurationInFrames(def, data);
  const examples = useMemo(() => findExamplesInUse(def, data), [def, data]);

  // While a text field has focus the phone keyboard is up: shrink the preview, hide the action bar.
  const [typing, setTyping] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const syncTyping = () =>
    setTimeout(() => {
      const el = document.activeElement;
      setTyping(Boolean(el && formRef.current?.contains(el) && el.matches('input:not([type=checkbox]):not([type=file]), textarea')));
    }, 0);

  // Save: the first change creates the draft (so browsing never leaves empty drafts), later changes autosave.
  // Compare with the starting data (not a "first run" flag, which StrictMode's double effects defeat).
  const initialData = useRef(data);
  const creating = useRef<Promise<string> | null>(null);
  useEffect(() => {
    if (data === initialData.current && retry === 0) return;
    setSaveState('saving');
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        let id = draftId;
        if (!id) {
          creating.current ??= createDraft(def.slug, data).then((d) => d.id);
          id = await creating.current;
          // Swap the URL to the real draft without remounting the editor.
          window.history.replaceState(window.history.state, '', `/editor/${id}`);
          if (!cancelled) setDraftId(id);
          if (!cancelled) setSaveState('saved');
          return;
        }
        const ok = await saveDraftData(id, data);
        if (!cancelled) setSaveState(ok ? 'saved' : 'error');
      } catch {
        if (!cancelled) setSaveState('error');
      }
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [data, draftId, def.slug, retry]);

  /** Pause on the frame where a clip's text is fully on screen. */
  const showClip = (clipId: string | undefined) => {
    const p = playerRef.current;
    if (!p || !clipId) return;
    setRange(null);
    const hold = holdFrameOf(def, data, clipId);
    if (hold === null) return;
    p.pause();
    p.seekTo(Math.min(hold, duration - 1));
  };

  /** The clip a step is about: a clip step's own clip, or for details the clip showing the first detail. */
  const clipForStep = (s: number) => {
    if (s >= 1 && s < finalStep) return clips[s - 1].id;
    const first = def.schema.details[0];
    return (first && clipShowingDetail(def, data, first.key)?.id) ?? clips.find((x) => data.clips[x.id].included)?.id;
  };

  const seekToStep = (s: number, play: boolean) => {
    const p = playerRef.current;
    if (!p) return;
    const c = s >= 1 && s < finalStep ? clips[s - 1] : null;
    if (!play) {
      showClip(clipForStep(s));
      return;
    }
    if (c) {
      // Loop just this clip, so "Preview" shows what was edited instead of running on to the end.
      const start = startFrameOf(def, data, c.id);
      if (start === null) return;
      setRange({ inFrame: start, outFrame: start + c.durationInFrames - 1 });
      setTimeout(() => {
        p.seekTo(start);
        p.play();
      }, 0);
      return;
    }
    setRange(null);
    setTimeout(() => {
      p.seekTo(0);
      p.play();
    }, 0);
  };

  /** Focusing a detail field jumps the preview to the clip that shows it. */
  const focusDetail = (key: string) => showClip(clipShowingDetail(def, data, key)?.id);
  const goTo = (s: number) => {
    const next = Math.max(0, Math.min(finalStep, s));
    // Guests: offer to save to an account once, right after their first real edits.
    if (step === 0 && next !== 0 && !user && authAvailable && draftId) {
      let prompted = false;
      try {
        prompted = sessionStorage.getItem(SIGN_IN_PROMPT_KEY) === '1';
        sessionStorage.setItem(SIGN_IN_PROMPT_KEY, '1');
      } catch {
        prompted = true;
      }
      if (!prompted) setSignInSheet(true);
    }
    tap();
    setDir(next >= step ? 'fwd' : 'back');
    setVisited((v) => new Set(v).add(step).add(next));
    setStep(next);
    setTimeout(() => seekToStep(next, false), 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** From the details step straight to the finished video, playing. */
  const seeVideo = () => {
    goTo(finalStep);
    setTimeout(() => seekToStep(finalStep, true), 50);
  };

  /** Done = visited with no example text left; todo = still shows example text. */
  const stepStatus = (s: number): 'done' | 'todo' | undefined => {
    const key = s === 0 ? 'details' : clips[s - 1]?.id;
    if (examples.some((e) => e.step === key)) return visited.has(s) || s === 0 ? 'todo' : undefined;
    return visited.has(s) && s !== step ? 'done' : undefined;
  };

  const setDetail = (key: string, value: string) => {
    setData((d) => ({ ...d, details: { ...d.details, [key]: value } }));
    // A new photo: show it in its clip.
    if (value && def.schema.details.find((f) => f.key === key)?.type === 'photo') setTimeout(() => focusDetail(key), 50);
  };
  const setValue = (clipId: string, key: string, value: string) =>
    setData((d) => ({
      ...d,
      clips: { ...d.clips, [clipId]: { ...d.clips[clipId], values: { ...d.clips[clipId].values, [key]: value } } },
    }));
  const setIncluded = (clipId: string, included: boolean) =>
    setData((d) => ({ ...d, clips: { ...d.clips, [clipId]: { ...d.clips[clipId], included } } }));

  const goToDownload = () => {
    if (!draftId) return;
    tap(15);
    if (!user && authAvailable) navigate(`/account?next=${encodeURIComponent(`/render/${draftId}`)}&reason=download`);
    else navigate(`/render/${draftId}`);
  };

  const share = async () => {
    if (!draftId) return;
    if (!user) {
      navigate(`/account?next=${encodeURIComponent(`/editor/${draftId}`)}&reason=share`);
      return;
    }
    setSharing(true);
    try {
      // Make sure the latest text is saved before others see it.
      await saveDraftData(draftId, data);
      const url = await createShareLink(draftId);
      const title = videoTitle(def, data);
      const text = t('Please check our invitation video: {title}', { title });
      if (navigator.share) {
        try {
          await navigator.share({ title, text, url });
          return;
        } catch (e) {
          if (e instanceof DOMException && e.name === 'AbortError') return;
        }
      }
      setShareSheet({ url });
    } catch (e) {
      toast({ message: e instanceof Error ? e.message : t('Could not create a link'), tone: 'error' });
    } finally {
      setSharing(false);
    }
  };

  const stepTitle = isDetails ? t('Your details') : isFinal ? t('Final step') : t('Clip {n} of {total}', { n: step, total: clips.length });

  return (
    <div className="flex min-h-dvh flex-col bg-background md:h-dvh md:overflow-hidden">
      <header className="safe-top sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
        <div className="flex h-14 w-full items-center gap-2 px-2 md:px-6 lg:px-10 2xl:px-16">
          <button onClick={back} className="grid size-11 place-items-center rounded-full" aria-label={t('Back')}>
            <ArrowLeft className="size-5" />
          </button>
          <div className="min-w-0 flex-1 text-center md:text-left">
            <p className="truncate text-[15px] font-semibold">{videoTitle(def, data)}</p>
            <p className="text-xs font-medium uppercase tracking-wider text-muted">{stepTitle}</p>
          </div>
          <SaveIndicator state={saveState} />
        </div>
        {saveState === 'error' ? (
          <div role="alert" className="slide-down flex items-center gap-2 border-t border-error/30 bg-error/10 px-4 py-2 text-sm text-error">
            <span className="flex-1">{t("Your last changes aren't saved.")}</span>
            <button onClick={() => setRetry((r) => r + 1)} className="flex min-h-11 items-center gap-1 px-2 font-semibold">
              <RotateCw className="size-4" /> {t('Retry')}
            </button>
          </div>
        ) : null}
      </header>

      <div className="flex w-full flex-1 flex-col md:min-h-0 md:flex-row md:justify-center md:gap-8 md:px-6 md:py-6 lg:gap-12 lg:px-10 2xl:px-16">
        <div className="sticky top-14 z-10 flex justify-center bg-ink md:static md:shrink-0 md:items-start md:bg-transparent">
          <VideoPlayer
            def={def}
            data={data}
            watermark
            playerRef={playerRef}
            centerPlay={false}
            loop={range !== null}
            inFrame={range?.inFrame}
            outFrame={range?.outFrame}
            initialFrame={holdFrameOf(def, data, clipForStep(0) ?? clips[0].id) ?? 0}
            // Desktop: fill the height under the header; width follows at 9:16 (was a fixed 380px column, which letterboxed the video).
            className="md:!h-[min(calc(100dvh-140px),720px)] md:!w-auto md:overflow-hidden md:rounded-card"
            style={{
              aspectRatio: '9 / 16',
              height: typing ? '22dvh' : '40dvh',
              maxWidth: '100%',
              transition: 'height 160ms ease-out',
            }}
          />
        </div>

        {/* Form stays at a readable width on wide screens; the preview + form pair is centred. */}
        <div className="flex min-w-0 flex-1 flex-col md:min-h-0 md:max-w-3xl md:overflow-y-auto">
          {/* Step strip */}
          <div ref={stripRef} className="no-scrollbar flex gap-2 overflow-x-auto border-b border-border bg-surface px-3 py-2 md:rounded-card md:border">
            <StripButton active={isDetails} onClick={() => goTo(0)} label={t('Your details')} status={stepStatus(0)}>
              <UserRound className="size-4" /> <span className="text-sm">{t('Details')}</span>
            </StripButton>
            {clips.map((c, i) => {
              const off = !data.clips[c.id].included;
              return (
                <StripButton
                  key={c.id}
                  active={step === i + 1}
                  onClick={() => goTo(i + 1)}
                  label={`${t('Clip {n}', { n: i + 1 })}: ${c.name}${off ? ` (${t('skipped')})` : ''}`}
                  square
                  off={off}
                  status={stepStatus(i + 1)}
                >
                  {i + 1}
                </StripButton>
              );
            })}
            <StripButton active={isFinal} onClick={() => goTo(finalStep)} label={t('Finish')}>
              <Sparkles className="size-4" /> <span className="text-sm">{t('Finish')}</span>
            </StripButton>
          </div>

          <div
            ref={formRef}
            onFocus={syncTyping}
            onBlur={syncTyping}
            className={cn('flex-1 px-4 pt-5 md:px-1 md:pb-6', typing ? 'pb-8' : 'pb-32')}
          >
            <div key={step} className={dir === 'fwd' ? 'step-in-fwd' : 'step-in-back'}>
            {isDetails ? (
              <FieldsForm
                key="details"
                title={t('Your details')}
                hint={t('Fill these once — they appear throughout the video.')}
                fields={def.schema.details}
                values={data.details}
                onChange={setDetail}
                onFocusField={focusDetail}
                onDone={seeVideo}
              />
            ) : clip ? (
              <FieldsForm
                key={clip.id}
                title={clip.name}
                hint={clip.fields.length ? t('Optional: change the wording in this clip.') : undefined}
                fields={clip.fields}
                values={data.clips[clip.id].values}
                onChange={(k, v) => setValue(clip.id, k, v)}
                onDone={() => goTo(step + 1)}
                optional={clip.optional ? { included: data.clips[clip.id].included, onIncluded: (v) => setIncluded(clip.id, v) } : undefined}
              />
            ) : (
              <FinalStep
                def={def}
                data={data}
                examples={examples}
                seconds={Math.round(duration / def.fps)}
                saved={Boolean(draftId)}
                sharing={sharing}
                onFix={(stepKey) => goTo(stepKey === 'details' ? 0 : clips.findIndex((c) => c.id === stepKey) + 1)}
                onPreview={() => seekToStep(finalStep, true)}
                onShare={share}
                onDownload={goToDownload}
                onEditClip={(i) => goTo(i + 1)}
              />
            )}
            </div>
          </div>

          <div
            className={cn(
              'safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur md:static md:mt-auto md:rounded-card md:border',
              typing && 'max-md:hidden',
            )}
          >
            <div className="flex items-center gap-2 p-3">
              <Button variant="outline" onClick={() => goTo(step - 1)} disabled={step === 0} className="w-11 shrink-0 px-0 sm:w-auto sm:px-4" aria-label={t('Back')}>
                <ChevronLeft className="size-4" /> <span className="max-sm:sr-only">{t('Back')}</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => seekToStep(step, true)}
                disabled={Boolean(clip && !data.clips[clip.id].included)}
                className="flex-1 px-3"
              >
                <Play className="size-4" /> {isFinal || isDetails ? t('Play all') : t('Play clip')}
              </Button>
              {isFinal ? (
                <Button onClick={goToDownload} disabled={examples.length > 0 || !draftId} className="px-4">
                  <Download className="size-4" /> HD
                </Button>
              ) : isDetails ? (
                <Button onClick={seeVideo} className="flex-1 px-3">
                  {t('See my video')} <ChevronRight className="size-4" />
                </Button>
              ) : (
                <Button onClick={() => goTo(step + 1)} className="px-4">
                  {t('Next')} <ChevronRight className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Sheet
        open={signInSheet}
        onOpenChange={setSignInSheet}
        title={t('Save your invite')}
        description={t("It's only saved on this phone right now. Sign in to keep it safe and open it anywhere.")}
      >
        <div className="grid gap-2">
          <Button onClick={() => navigate(`/account?next=${encodeURIComponent(`/editor/${draftId}`)}&reason=save`)}>{t('Sign in — takes 5 seconds')}</Button>
          <Button variant="ghost" onClick={() => setSignInSheet(false)}>
            {t('Not now')}
          </Button>
        </div>
      </Sheet>

      <Sheet open={shareSheet !== null} onOpenChange={(o) => !o && setShareSheet(null)} title={t('Share the preview')} description={t('Family can watch it with a watermark. They cannot download it.')}>
        {shareSheet ? <ShareOptions url={shareSheet.url} text={t('Please check our invitation video: {title}', { title: videoTitle(def, data) })} /> : null}
      </Sheet>
    </div>
  );
};

const StripButton = ({
  active,
  onClick,
  label,
  square,
  off,
  status,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  square?: boolean;
  off?: boolean;
  /** done = tick; todo = gold dot (example text still showing). */
  status?: 'done' | 'todo';
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    aria-label={status === 'done' ? `${label} ✓` : status === 'todo' ? `${label} •` : label}
    aria-current={active ? 'step' : undefined}
    className={cn(
      'relative flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-[10px] border font-semibold transition-transform duration-100 active:scale-[0.96]',
      square ? 'w-11 text-base' : 'px-3',
      active ? 'border-primary bg-primary/10 text-primary' : 'border-border text-ink',
      off && 'text-muted line-through',
    )}
  >
    {children}
    {status === 'done' ? (
      <span className="pop absolute -right-1.5 -top-1.5 grid size-4 place-items-center rounded-full bg-success text-white">
        <Check className="size-3" strokeWidth={3} />
      </span>
    ) : status === 'todo' ? (
      <span className="pop absolute -right-1 -top-1 size-3 rounded-full border-2 border-surface bg-accent" />
    ) : null}
  </button>
);

/** Header save state: a pulsing dot while saving, a tick that pops in when saved. */
const SaveIndicator = ({ state }: { state: SaveState }) => {
  const { t } = useI18n();
  return (
    <span className={cn('flex w-20 items-center justify-end gap-1 text-xs', state === 'error' ? 'text-error' : 'text-muted')} aria-live="polite">
      {state === 'saving' ? (
        <>
          <span className="save-pulse size-1.5 rounded-full bg-muted" /> {t('Saving…')}
        </>
      ) : state === 'saved' ? (
        <>
          <Check key="tick" className="pop size-3.5 text-success" strokeWidth={3} /> {t('Saved')}
        </>
      ) : state === 'error' ? (
        t('Not saved')
      ) : null}
    </span>
  );
};

export const ShareOptions = ({ url, text }: { url: string; text: string }) => {
  const { t } = useI18n();
  const toast = useToast();
  return (
    <div className="grid gap-2">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-12 items-center justify-center gap-2 rounded-button bg-[#1F8F4E] font-semibold text-white"
      >
        {t('Send on WhatsApp')}
      </a>
      <Button
        variant="outline"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            toast({ message: t('Link copied') });
          } catch {
            toast({ message: url });
          }
        }}
      >
        {t('Copy link')}
      </Button>
    </div>
  );
};

const FieldsForm = ({
  title,
  hint,
  fields,
  values,
  onChange,
  onDone,
  onFocusField,
  optional,
}: {
  title: string;
  hint?: string;
  fields: Field[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  /** Enter on the last text field. */
  onDone: () => void;
  /** A field got focus (the preview jumps to where it appears). */
  onFocusField?: (key: string) => void;
  optional?: { included: boolean; onIncluded: (v: boolean) => void };
}) => {
  const { t } = useI18n();
  const textKeys = fields.filter((f) => f.type === 'text').map((f) => f.key);
  const onEnter = (key: string, input: HTMLInputElement) => {
    const i = textKeys.indexOf(key);
    if (i < textKeys.length - 1) input.form?.querySelector<HTMLInputElement>(`input[name="${textKeys[i + 1]}"]`)?.focus();
    else {
      input.blur();
      onDone();
    }
  };
  const included = optional?.included ?? true;

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="mb-1 flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {optional ? (
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
            <span>{t('Show in video')}</span>
            <span className="relative inline-flex">
              <input
                type="checkbox"
                role="switch"
                checked={optional.included}
                onChange={(e) => optional.onIncluded(e.target.checked)}
                className="peer sr-only"
              />
              <span className="h-7 w-12 rounded-full bg-border transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40" />
              <span className="absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
            </span>
          </label>
        ) : null}
      </div>
      {hint ? <p className="mb-4 text-sm text-muted">{hint}</p> : <div className="mb-4" />}

      {!included ? (
        <p className="rounded-card bg-surface p-4 text-sm text-muted">{t('This clip is left out of your video. Switch it on to add it back.')}</p>
      ) : fields.length === 0 ? (
        <p className="rounded-card bg-surface p-4 text-sm text-muted">{t('Nothing to change here — this clip uses your details.')}</p>
      ) : (
        <div className="space-y-4">
          {fields.map((f, i) => (
            <div key={f.key} onFocusCapture={() => onFocusField?.(f.key)}>
              {f.group && f.group !== fields[i - 1]?.group ? (
                <p className={cn('mb-2 text-xs font-semibold uppercase tracking-wider text-accent-ink', i > 0 && 'mt-6')}>{t(f.group)}</p>
              ) : null}
              {f.type === 'text' ? (
                <TextInput
                  field={f}
                  value={values[f.key] ?? ''}
                  onChange={(v) => onChange(f.key, v)}
                  isLast={textKeys.at(-1) === f.key}
                  onEnter={(input) => onEnter(f.key, input)}
                />
              ) : (
                <PhotoInput field={f} value={values[f.key] ?? ''} onChange={(v) => onChange(f.key, v)} />
              )}
            </div>
          ))}
        </div>
      )}
    </form>
  );
};

const TextInput = ({
  field,
  value,
  onChange,
  isLast,
  onEnter,
}: {
  field: TextField;
  value: string;
  onChange: (v: string) => void;
  isLast: boolean;
  onEnter: (input: HTMLInputElement) => void;
}) => {
  const { t } = useI18n();
  const left = field.maxLength - value.length;
  const showsExample = value.trim() === '' && !field.keep && !field.optional;
  return (
    <label className="block">
      <span className="mb-1.5 flex min-h-6 items-center justify-between gap-2 text-sm font-semibold text-ink">
        <span className="flex items-center gap-1.5">
          {t(field.label)}
          {field.optional ? <span className="font-normal text-muted"> · {t('optional')}</span> : null}
          {!field.keep && value.trim() !== '' ? <Check className="pop size-4 text-success" strokeWidth={3} aria-label={t('Done')} /> : null}
        </span>
        {left <= 5 ? (
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', left <= 2 ? 'bg-error/10 text-error' : 'bg-background text-muted')}>
            {t('{n} left', { n: left })}
          </span>
        ) : null}
      </span>
      <input
        name={field.key}
        value={value}
        maxLength={field.maxLength}
        placeholder={field.default}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            e.preventDefault();
            onEnter(e.currentTarget);
          }
        }}
        className={cn(
          'h-12 w-full rounded-button border bg-surface px-4 outline-none transition-colors placeholder:text-muted/60 focus:border-primary',
          showsExample ? 'border-accent border-dashed' : 'border-border',
        )}
        autoComplete="off"
        autoCapitalize={field.casing === 'upper' ? 'characters' : field.inputMode === 'tel' ? 'off' : 'words'}
        inputMode={field.inputMode ?? 'text'}
        enterKeyHint={isLast ? 'done' : 'next'}
        aria-describedby={showsExample ? `${field.key}-example` : undefined}
      />
      {showsExample ? (
        <span id={`${field.key}-example`} className="mt-1 flex items-center gap-1 text-xs text-accent-ink">
          <Pencil className="size-3" /> {t('Example shown in the video — type yours')}
        </span>
      ) : null}
    </label>
  );
};

const PhotoInput = ({ field, value, onChange }: { field: PhotoField; value: string; onChange: (v: string) => void }) => {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shapeCls = field.shape === 'circle' ? 'rounded-full' : field.shape === 'arch' ? 'rounded-t-full rounded-b-xl' : 'rounded-xl';
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold">
        {t(field.label)}
        {field.optional ? <span className="font-normal text-muted"> · {t('optional')}</span> : null}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn('relative grid h-28 w-24 shrink-0 place-items-center overflow-hidden border-2 border-dashed border-border bg-surface text-muted', shapeCls)}
          aria-label={value ? t('Change photo') : t('Add photo')}
        >
          {value ? <img src={value} alt="" className="absolute inset-0 size-full object-cover" /> : <ImagePlus className="size-7" />}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            e.target.value = '';
          }}
        />
        <div className="space-y-1 text-sm">
          {value ? (
            <>
              <p className="flex items-center gap-1 text-success">
                <Check className="size-4" /> {t('Photo added')}
              </p>
              <div className="flex gap-1">
                <button type="button" onClick={() => inputRef.current?.click()} className="min-h-11 px-1 font-semibold text-primary">
                  {t('Change')}
                </button>
                <button type="button" onClick={() => onChange('')} className="flex min-h-11 items-center gap-1 px-1 text-muted">
                  <X className="size-4" /> {t('Remove')}
                </button>
              </div>
            </>
          ) : (
            <p className="text-muted">{t('Tap to add a photo. You can move and zoom it to fit.')}</p>
          )}
        </div>
      </div>
      <PhotoCropper
        file={file}
        aspectRatio={field.aspectRatio}
        shape={field.shape}
        onCancel={() => setFile(null)}
        onDone={(url) => {
          onChange(url);
          setFile(null);
        }}
      />
    </div>
  );
};

const FinalStep = ({
  def,
  data,
  examples,
  seconds,
  saved,
  sharing,
  onFix,
  onPreview,
  onShare,
  onDownload,
  onEditClip,
}: {
  def: TemplateDefinition;
  data: VideoData;
  examples: ReturnType<typeof findExamplesInUse>;
  seconds: number;
  saved: boolean;
  sharing: boolean;
  onFix: (step: string) => void;
  onPreview: () => void;
  onShare: () => void;
  onDownload: () => void;
  onEditClip: (index: number) => void;
}) => {
  const { t } = useI18n();
  const estimate = estimateRenderSeconds(getDurationInFrames(def, data), '720p');
  return (
    <div>
      <h2 className="font-display text-xl font-semibold">{t('Check and download')}</h2>
      <p className="mt-1 text-sm text-muted">{t('Your video is {n} seconds long.', { n: seconds })}</p>

      {examples.length > 0 ? (
        <div className="mt-4 rounded-card border border-accent bg-accent/10 p-4">
          <p className="flex items-center gap-2 font-semibold">
            <AlertCircle className="size-5 text-accent-ink" /> {t('{n} lines still show example text', { n: examples.length })}
          </p>
          <ul className="mt-2 space-y-1">
            {examples.map((e) => (
              <li key={`${e.step}-${e.key}`}>
                <button onClick={() => onFix(e.step)} className="flex min-h-11 w-full items-center justify-between rounded-button bg-surface px-3 text-left text-sm">
                  <span>{t(e.label)}</span>
                  <span className="font-semibold text-primary">{t('Fill in')}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <ol className="mt-4 space-y-3">
        <li className="rounded-card border border-border bg-surface p-4">
          <p className="font-semibold">1. {t('Watch the free preview')}</p>
          <p className="text-sm text-muted">{t('Low quality with a watermark, so you can check names and dates.')}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onPreview}>
              <Play className="size-4" /> {t('Play')}
            </Button>
            <Button variant="outline" onClick={onShare} disabled={!saved || sharing}>
              {sharing ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />} {t('Share preview')}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted">{t(showPrices() ? 'Send it to family to check before you pay.' : 'Send it to family to check before you download.')}</p>
        </li>
        <li className="rounded-card border border-accent/60 bg-surface p-4">
          <p className="font-semibold">
            2. {t('Download in HD')} · {showPrices() ? formatInr(def.priceInr) : t('Free')}
          </p>
          <p className="text-sm text-muted">{t('No watermark, ready for WhatsApp.')}</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted">
            <Clock className="size-4" /> {t('Your phone makes the video in about {n} seconds.', { n: estimate })}
          </p>
          <Button onClick={onDownload} disabled={examples.length > 0 || !saved} className="mt-3 w-full">
            <Download className="size-4" /> {t('Download HD video')}
          </Button>
        </li>
      </ol>
      <details className="group mt-4 rounded-card border border-border bg-surface">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 font-semibold">
          {t('Fine-tune each clip (optional)')}
          <ChevronRight className="size-4 text-muted transition-transform group-open:rotate-90" />
        </summary>
        <ul className="divide-y divide-border border-t border-border">
          {def.schema.clips.map((c, i) => (
            <li key={c.id}>
              <button onClick={() => onEditClip(i)} className="flex min-h-12 w-full items-center justify-between px-4 text-left text-sm active:bg-background">
                <span>
                  {i + 1}. {c.name}
                  {!data.clips[c.id].included ? <span className="text-muted"> · {t('skipped')}</span> : null}
                </span>
                <Pencil className="size-4 text-muted" />
              </button>
            </li>
          ))}
        </ul>
      </details>
      <p className="mt-4 text-xs text-muted">
        <Link to="/help" className="underline">
          {t('How does this work?')}
        </Link>
      </p>
    </div>
  );
};

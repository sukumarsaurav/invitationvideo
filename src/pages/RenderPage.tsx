import { AlertTriangle, ArrowLeft, CheckCircle2, ChevronDown, Clock, Download, Loader2, Lock, Send } from 'lucide-react';
import { useSeo } from '@/lib/seo';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/Button';
import { INSTALL_MOMENT } from '@/components/InstallPrompt';
import { useToast } from '@/components/Toast';
import { cn } from '@/lib/cn';
import { fetchServerStatus, markRendered, useDraft } from '@/lib/drafts';
import { tap } from '@/lib/haptics';
import { useI18n } from '@/lib/i18n';
import {
  checkCanRender,
  defaultQuality,
  downloadBlob,
  FREE_HD,
  estimateRenderSeconds,
  renderVideo,
  type RenderCheck,
  type RenderQuality,
} from '@/lib/render';
import { useWakeLock } from '@/lib/wakeLock';
import { getDurationInFrames, normaliseData, videoTitle } from '@/templates/data';
import { getTemplate } from '@/templates/registry';
import { LoadingScreen } from './EditorPage';
import { NotFoundPage } from './NotFoundPage';

type Phase =
  | { kind: 'idle' }
  | { kind: 'rendering'; progress: number; encoded: number; startedAt: number }
  | { kind: 'done'; file: File; ms: number }
  | { kind: 'error'; message: string };

/** Can this browser hand a video file to WhatsApp & co. through the share sheet? */
const canShareFile = (file: File) => {
  try {
    return typeof navigator !== 'undefined' && !!navigator.canShare && navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
};

export const RenderPage = () => {
  const { t } = useI18n();
  const toast = useToast();
  const { draftId } = useParams();
  const { draft, loading } = useDraft(draftId);
  const def = getTemplate(draft?.templateSlug);
  const data = useMemo(() => (def && draft ? normaliseData(def, draft.data) : null), [def, draft]);

  const [quality, setQuality] = useState<RenderQuality>(defaultQuality);
  const [showOptions, setShowOptions] = useState(false);
  const [check, setCheck] = useState<RenderCheck | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const [now, setNow] = useState(() => Date.now());
  const abortRef = useRef<AbortController | null>(null);
  const wake = useWakeLock(phase.kind === 'rendering');
  useSeo({ title: 'Download HD video', description: '', path: '/render', noindex: true });

  // Who may make the HD file: everyone when FREE_HD, otherwise only videos the server marks as paid.
  // The status is read fresh from the server; a guest's local status is never trusted.
  const [access, setAccess] = useState<'checking' | 'allowed' | 'locked'>(FREE_HD ? 'allowed' : 'checking');
  const draftKey = draft?.id;
  useEffect(() => {
    if (FREE_HD || loading || !draftKey) return;
    let active = true;
    setAccess('checking');
    fetchServerStatus(draftKey).then((s) => {
      if (active) setAccess(s === 'paid' || s === 'rendered' ? 'allowed' : 'locked');
    });
    return () => {
      active = false;
    };
  }, [loading, draftKey]);

  useEffect(() => {
    if (!def) return;
    setCheck(null);
    checkCanRender(def, quality).then(setCheck);
  }, [def, quality]);

  useEffect(() => {
    if (phase.kind !== 'rendering') return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [phase.kind]);

  useEffect(() => {
    if (phase.kind !== 'rendering') return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [phase.kind]);

  if (loading) return <LoadingScreen />;
  if (!draft || !def || !data) return <NotFoundPage />;

  const totalFrames = getDurationInFrames(def, data);
  const title = videoTitle(def, data);
  const filename = `${title.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase() || def.slug}-invitation.mp4`;
  const estimate = estimateRenderSeconds(totalFrames, quality);

  const start = async () => {
    if (access !== 'allowed') return;
    const controller = new AbortController();
    abortRef.current = controller;
    const startedAt = Date.now();
    tap(15);
    setPhase({ kind: 'rendering', progress: 0, encoded: 0, startedAt });
    try {
      const blob = await renderVideo({
        def,
        data,
        quality,
        signal: controller.signal,
        onProgress: (p) => setPhase({ kind: 'rendering', progress: p.progress, encoded: p.encodedFrames, startedAt }),
      });
      const file = new File([blob], filename, { type: 'video/mp4' });
      setPhase({ kind: 'done', file, ms: Date.now() - startedAt });
      tap(40);
      markRendered(draft.id);
      // Phones that can share the file get the share button; others download straight away.
      if (!canShareFile(file)) downloadBlob(blob, filename);
      setTimeout(() => window.dispatchEvent(new Event(INSTALL_MOMENT)), 4000);
    } catch (e) {
      if (controller.signal.aborted) setPhase({ kind: 'idle' });
      else setPhase({ kind: 'error', message: e instanceof Error ? e.message : String(e) });
    }
  };

  const shareFile = async (file: File) => {
    try {
      await navigator.share({ files: [file], title, text: t('Our invitation: {title}', { title }) });
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      downloadBlob(file, filename);
      toast({ message: t("Couldn't open sharing, so the video was downloaded instead.") });
    }
  };

  const elapsed = phase.kind === 'rendering' ? (now - phase.startedAt) / 1000 : 0;
  const fps = phase.kind === 'rendering' && elapsed > 0 ? phase.encoded / elapsed : 0;
  const remaining = fps > 0 && phase.kind === 'rendering' ? (totalFrames - phase.encoded) / fps : null;

  return (
    <div className="min-h-dvh bg-background">
      <header className="safe-top sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-xl items-center gap-2 px-2">
          <Link to={`/editor/${draft.id}`} className="grid size-11 place-items-center rounded-full" aria-label={t('Back to editor')}>
            <ArrowLeft className="size-5" />
          </Link>
          <p className="min-w-0 flex-1 truncate font-semibold">{t('Download HD video')}</p>
        </div>
      </header>

      <div className="mx-auto max-w-xl space-y-4 px-4 py-5">
        {import.meta.env.DEV ? (
          <div className="rounded-card border border-accent/60 bg-accent/10 p-3 text-sm">
            <strong>{t('Development mode:')}</strong> {t('payment is skipped. Razorpay is added in Phase 3.')}
          </div>
        ) : null}

        {phase.kind === 'done' ? (
          <section className="relative overflow-hidden rounded-card border border-success/40 bg-surface p-5 text-center">
            <Celebration />
            <CheckCircle2 className="mx-auto size-12 text-success" />
            <p className="mt-2 font-display text-2xl font-semibold">{t('Your video is ready!')}</p>
            <p className="mt-1 text-sm text-muted">{title}</p>
            {canShareFile(phase.file) ? (
              <>
                <Button className="mt-5 w-full bg-[#1F8F4E] active:bg-[#18733e]" onClick={() => shareFile(phase.file)}>
                  <Send className="size-4" /> {t('Send on WhatsApp')}
                </Button>
                <p className="mt-2 text-xs text-muted">{t('Choose WhatsApp, or "Save video" to keep it in your photos.')}</p>
                <Button variant="outline" className="mt-3 w-full" onClick={() => downloadBlob(phase.file, filename)}>
                  <Download className="size-4" /> {t('Download file')}
                </Button>
              </>
            ) : (
              <>
                <p className="mt-4 text-sm">{t('The video was saved to your Downloads folder.')}</p>
                <Button variant="outline" className="mt-3 w-full" onClick={() => downloadBlob(phase.file, filename)}>
                  <Download className="size-4" /> {t('Download again')}
                </Button>
              </>
            )}
            <Link to="/my-videos" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary">
              {t('Go to My Videos')}
            </Link>
          </section>
        ) : phase.kind === 'rendering' ? (
          <section className="rounded-card border border-border bg-surface p-5">
            <div className="flex items-baseline justify-between">
              <p className="font-semibold">{t('Making your video…')}</p>
              <p className="text-2xl font-bold tabular-nums text-primary">{Math.round(phase.progress * 100)}%</p>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-background" role="progressbar" aria-valuenow={Math.round(phase.progress * 100)} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${phase.progress * 100}%` }} />
            </div>
            <p className="mt-2 text-sm text-muted tabular-nums">
              {remaining !== null ? t('About {n} seconds left', { n: Math.max(1, Math.ceil(remaining)) }) : t('Starting…')}
            </p>
            <p className="mt-3 text-sm font-medium">
              {t('Keep this page open until it finishes.')} {wake.supported ? t('The screen will stay on.') : t("Don't let your screen turn off.")}
            </p>
            {wake.wasHidden ? (
              <p className="mt-2 rounded-button bg-accent/15 p-2 text-sm">{t('You left this page, so making the video paused. It continues while this page is open.')}</p>
            ) : null}
            <Button variant="outline" className="mt-4 w-full" onClick={() => abortRef.current?.abort()}>
              {t('Cancel')}
            </Button>
          </section>
        ) : (
          <section className="rounded-card border border-border bg-surface p-5">
            <p className="font-display text-xl font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted">{t('{n} seconds · no watermark · MP4', { n: Math.round(totalFrames / def.fps) })}</p>
            <p className="mt-3 flex items-center gap-2 text-sm">
              <Clock className="size-4 text-primary" /> {t('Takes about {n} seconds on this device.', { n: estimate })}
            </p>

            {check && !check.ok ? (
              <div className="mt-4 rounded-button bg-error/10 p-3 text-sm text-error">
                <p className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="size-4" /> {t("This browser can't make the video.")}
                </p>
                <p className="mt-1">{t('Open this page in the latest Chrome on your phone or computer.')}</p>
              </div>
            ) : null}

            {phase.kind === 'error' ? (
              <div className="mt-4 rounded-button bg-error/10 p-3 text-sm text-error">
                <p className="font-semibold">{t('Something went wrong while making the video. Please try again.')}</p>
                <p className="mt-1 break-words text-xs opacity-80">{phase.message}</p>
              </div>
            ) : null}

            {access === 'locked' ? (
              <>
                <div className="mt-4 rounded-button bg-accent/15 p-3 text-sm">
                  <p className="flex items-center gap-2 font-semibold">
                    <Lock className="size-4" /> {t('HD download opens soon')}
                  </p>
                  <p className="mt-1">{t('Online payment is being set up. Until then, share the free preview with family from the editor.')}</p>
                </div>
                <Link
                  to={`/editor/${draft.id}`}
                  className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-button bg-primary font-semibold text-white"
                >
                  <ArrowLeft className="size-4" /> {t('Back to editor')}
                </Link>
              </>
            ) : (
              <Button className="mt-5 w-full" onClick={start} disabled={!check?.ok || access !== 'allowed'}>
                {check === null || access === 'checking' ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}{' '}
                {t('Make my HD video')}
              </Button>
            )}

            <button
              hidden={access === 'locked'}
              onClick={() => setShowOptions((v) => !v)}
              className="mt-2 flex min-h-11 w-full items-center justify-center gap-1 text-sm text-muted"
              aria-expanded={showOptions}
            >
              {t('More options')} <ChevronDown className={cn('size-4 transition-transform', showOptions && 'rotate-180')} />
            </button>
            {showOptions && access !== 'locked' ? (
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t('Quality')}>
                {(['1080p', '720p'] as const).map((q) => (
                  <button
                    key={q}
                    role="radio"
                    aria-checked={quality === q}
                    onClick={() => setQuality(q)}
                    className={cn('min-h-14 rounded-button border px-3 text-left', quality === q ? 'border-primary bg-primary/5' : 'border-border')}
                  >
                    <span className="block font-semibold">{q === '1080p' ? t('Full HD 1080p') : t('HD 720p')}</span>
                    <span className="block text-xs text-muted">{q === '1080p' ? t('Sharper, takes longer') : t('Faster, great for WhatsApp')}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </section>
        )}
      </div>
    </div>
  );
};

/** A short burst of gold and maroon confetti; skipped for people who prefer reduced motion. */
const Celebration = () => {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: (i * 37) % 100,
        delay: (i % 7) * 60,
        color: ['#C9A54C', '#7A1F3D', '#E86A92', '#2E7D4F'][i % 4],
        rotate: (i * 47) % 360,
      })),
    [],
  );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 motion-reduce:hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti absolute top-0 h-3 w-1.5 rounded-sm"
          style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}ms`, transform: `rotate(${p.rotate}deg)` }}
        />
      ))}
    </div>
  );
};

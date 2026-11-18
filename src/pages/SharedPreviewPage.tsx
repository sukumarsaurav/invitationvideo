import { Loader2, Sparkles } from 'lucide-react';
import { useSeo } from '@/lib/seo';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { VideoPlayer } from '@/components/VideoPlayer';
import { fetchSharedVideo, type SharedVideo } from '@/lib/drafts';
import { useI18n } from '@/lib/i18n';
import { normaliseData, videoTitle } from '@/templates/data';
import { getTemplate } from '@/templates/registry';

/** What family sees when a customer shares their preview: watermarked, view only. */
export const SharedPreviewPage = () => {
  const { token } = useParams();
  const { t } = useI18n();
  useSeo({ title: 'Invitation preview', description: '', path: '/p', noindex: true });
  const [state, setState] = useState<{ kind: 'loading' } | { kind: 'missing' } | { kind: 'error'; message: string } | { kind: 'ok'; video: SharedVideo }>({
    kind: 'loading',
  });

  useEffect(() => {
    if (!token) return;
    fetchSharedVideo(token)
      .then((video) => setState(video ? { kind: 'ok', video } : { kind: 'missing' }))
      .catch((e) => setState({ kind: 'error', message: e instanceof Error ? e.message : String(e) }));
  }, [token]);

  const def = state.kind === 'ok' ? getTemplate(state.video.templateSlug) : undefined;
  const data = state.kind === 'ok' && def ? normaliseData(def, state.video.data) : null;
  const title = def && data ? videoTitle(def, data) : '';

  useEffect(() => {
    if (title) document.title = `${title} · ${t('Invitation preview')}`;
  }, [title, t]);

  return (
    <div className="min-h-dvh bg-ink text-white">
      <header className="safe-top flex h-14 items-center justify-between px-3">
        <div className="rounded-full bg-background px-2">
          <Logo />
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">{t('Preview')}</span>
      </header>

      {state.kind === 'loading' ? (
        <div className="grid h-[70dvh] place-items-center">
          <Loader2 className="size-6 animate-spin" aria-label={t('Loading')} />
        </div>
      ) : state.kind !== 'ok' || !def || !data ? (
        <div className="mx-auto max-w-sm px-6 py-20 text-center">
          <p className="font-display text-2xl font-semibold">{t('This preview is not available')}</p>
          <p className="mt-2 text-white/70">
            {state.kind === 'error' ? state.message : t('The link may be wrong, or the video was deleted.')}
          </p>
        </div>
      ) : (
        <main className="mx-auto flex max-w-md flex-col items-center px-4 pb-10">
          <h1 className="mb-3 text-center font-display text-2xl font-semibold">{title}</h1>
          <VideoPlayer
            def={def}
            data={data}
            watermark
            autoPlay
            loop
            soundHint
            className="w-full overflow-hidden rounded-card"
            style={{ aspectRatio: '9 / 16', maxHeight: '72dvh' }}
          />
          <p className="mt-3 text-center text-sm text-white/70">{t('This is a preview. The final video has no watermark.')}</p>
          <Link
            to={`/t/${def.slug}`}
            className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-button bg-accent font-semibold text-ink"
          >
            <Sparkles className="size-4" /> {t('Make your own invitation video')}
          </Link>
        </main>
      )}
    </div>
  );
};

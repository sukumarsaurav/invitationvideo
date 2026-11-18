import { Thumbnail } from '@remotion/player';
import { useSeo } from '@/lib/seo';
import { Clapperboard, CloudOff, Loader2, Trash2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Sheet } from '@/components/Sheet';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/cn';
import { deleteDraft, useDrafts, type Draft, type DraftStatus } from '@/lib/drafts';
import { useI18n } from '@/lib/i18n';
import { getDurationInFrames, holdFrameOf, normaliseData, videoTitle } from '@/templates/data';
import { getTemplate } from '@/templates/registry';
import { bindTemplate } from '@/templates/TemplateVideo';

const STATUS: Record<DraftStatus, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-border text-ink' },
  paid: { label: 'Paid · ready to download', cls: 'bg-accent/20 text-ink' },
  rendered: { label: 'Downloaded', cls: 'bg-success/15 text-success' },
};

const UNDO_MS = 5000;

export const MyVideosPage = () => {
  const { t } = useI18n();
  const toast = useToast();
  const { drafts, loaded, error, signedIn } = useDrafts();
  useSeo({ title: 'My Videos', description: '', path: '/my-videos', noindex: true });
  const { available } = useAuth();
  const [confirming, setConfirming] = useState<Draft | null>(null);
  // Drafts hidden while their Undo window is open; deleted for real when it closes.
  const [pending, setPending] = useState<Set<string>>(new Set());
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const remove = (draft: Draft) => {
    setConfirming(null);
    setPending((p) => new Set(p).add(draft.id));
    const timer = setTimeout(async () => {
      timers.current.delete(draft.id);
      const { error: e } = await deleteDraft(draft.id);
      setPending((p) => {
        const next = new Set(p);
        next.delete(draft.id);
        return next;
      });
      if (e) toast({ message: t("Couldn't delete: {error}", { error: e }), tone: 'error' });
    }, UNDO_MS);
    timers.current.set(draft.id, timer);
    toast({
      message: t('Video deleted'),
      durationMs: UNDO_MS,
      action: {
        label: t('Undo'),
        onClick: () => {
          clearTimeout(timers.current.get(draft.id));
          timers.current.delete(draft.id);
          setPending((p) => {
            const next = new Set(p);
            next.delete(draft.id);
            return next;
          });
        },
      },
    });
  };

  const visible = drafts.filter((d) => !pending.has(d.id));

  return (
    <div className="pt-4 md:px-6 md:pt-8">
      <h1 className="px-4 font-display text-2xl font-semibold md:px-0">{t('My Videos')}</h1>

      {!signedIn && available ? (
        <Link to="/account?reason=save" className="mx-4 mt-3 flex items-center gap-3 rounded-card border border-accent/60 bg-accent/10 p-3 text-sm md:mx-0">
          <CloudOff className="size-5 shrink-0 text-primary" />
          <span>
            <strong>{t('Saved on this device only.')}</strong> {t('Sign in to keep your videos safe and open them on any phone or computer.')}
          </span>
        </Link>
      ) : null}

      {error ? <p className="mx-4 mt-3 rounded-button bg-error/10 p-3 text-sm text-error md:mx-0">{error}</p> : null}

      {!loaded ? (
        <div className="grid place-items-center py-16 text-muted">
          <Loader2 className="size-6 animate-spin" aria-label={t('Loading')} />
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<Clapperboard className="size-6" />}
            title={t('No videos yet')}
            body={t('Pick a template and start personalising. Your work saves automatically.')}
            action={
              <Link to="/templates" className="inline-flex min-h-11 items-center rounded-button bg-primary px-5 font-semibold text-white">
                {t('Browse templates')}
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="mt-4 space-y-2 px-4 md:px-0">
          {visible.map((d) => (
            <VideoRow key={d.id} draft={d} canDelete={d.status === 'draft' || !signedIn} onDelete={() => setConfirming(d)} />
          ))}
        </ul>
      )}

      <Sheet
        open={confirming !== null}
        onOpenChange={(o) => !o && setConfirming(null)}
        title={t('Delete this video?')}
        description={t('Your details and photos for this video will be removed.')}
      >
        <div className="grid gap-2">
          <Button className="bg-error active:bg-error/90" onClick={() => confirming && remove(confirming)}>
            <Trash2 className="size-4" /> {t('Delete')}
          </Button>
          <Button variant="ghost" onClick={() => setConfirming(null)}>
            {t('Keep it')}
          </Button>
        </div>
      </Sheet>
    </div>
  );
};

/** One saved video: a frame of the customer's own design, their title, and status. */
const VideoRow = ({ draft, canDelete, onDelete }: { draft: Draft; canDelete: boolean; onDelete: () => void }) => {
  const { t } = useI18n();
  const def = getTemplate(draft.templateSlug);
  const data = useMemo(() => (def ? normaliseData(def, draft.data) : null), [def, draft.data]);
  const component = useMemo(() => (def ? bindTemplate(def) : null), [def]);
  const s = STATUS[draft.status];
  // The clip that shows the names, so each video is recognisable at a glance.
  const showClip = def?.schema.clips[1]?.id ?? def?.schema.clips[0]?.id;

  return (
    <li className="flex items-center gap-3 rounded-card border border-border bg-surface p-3">
      <Link to={`/editor/${draft.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="h-24 w-[54px] shrink-0 overflow-hidden rounded-lg" style={{ background: def ? `linear-gradient(160deg, ${def.swatch[0]}, ${def.swatch[1]})` : '#ddd' }}>
          {def && data && component && showClip ? (
            <Thumbnail
              component={component}
              inputProps={{ data, watermark: false }}
              compositionWidth={def.width}
              compositionHeight={def.height}
              durationInFrames={getDurationInFrames(def, data)}
              fps={def.fps}
              frameToDisplay={holdFrameOf(def, data, showClip) ?? 0}
              style={{ width: '100%', height: '100%' }}
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{def && data ? videoTitle(def, data) : t('Unknown template')}</p>
          <p className="truncate text-xs text-muted">{def?.name}</p>
          <p className="text-xs text-muted">
            {t('Edited {when}', { when: new Date(draft.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) })}
          </p>
          <span className={cn('mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold', s.cls)}>{t(s.label)}</span>
        </div>
      </Link>
      {canDelete ? (
        <button onClick={onDelete} className="grid size-11 shrink-0 place-items-center rounded-full text-muted active:bg-background" aria-label={t('Delete video')}>
          <Trash2 className="size-5" />
        </button>
      ) : null}
    </li>
  );
};

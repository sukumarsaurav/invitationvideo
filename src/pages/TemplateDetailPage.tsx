import { Thumbnail } from '@remotion/player';
import { useCatalogue } from '@/lib/catalogue';
import { ArrowLeft, ChevronRight, Clock, Film, Image, Pencil } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/Button';
import { TagChips } from '@/components/TagChips';
import { TemplateCard } from '@/components/TemplateCard';
import { SectionHeader } from '@/components/TemplateRail';
import { VideoPlayer } from '@/components/VideoPlayer';
import { formatInr } from '@/lib/cn';
import { tap } from '@/lib/haptics';
import { useI18n } from '@/lib/i18n';
import { templateMeta } from '@/lib/pageMeta';
import { useSeo } from '@/lib/seo';
import { useBack } from '@/lib/useBack';
import { allFields, getDurationInFrames, holdFrameOf, makeExampleData } from '@/templates/data';
import { categoryName, getTemplate, isListed, similarTemplates } from '@/templates/registry';
import { bindTemplate } from '@/templates/TemplateVideo';
import { NotFoundPage } from './NotFoundPage';

export const TemplateDetailPage = () => {
  const { t } = useI18n();
  useCatalogue(); // re-render when the admin-published catalogue arrives
  const { slug } = useParams();
  const navigate = useNavigate();
  const back = useBack('/templates');
  const def = getTemplate(slug);
  const data = useMemo(() => (def ? makeExampleData(def) : null), [def]);
  const component = useMemo(() => (def ? bindTemplate(def) : null), [def]);
  // A hidden template reads as "not found" to search engines too (noindex).
  useSeo(templateMeta(isListed(slug) ? def : undefined, slug));
  // Hidden in the admin panel: gone from the store (owners of existing videos still use the editor).
  if (!def || !data || !component || !isListed(slug)) return <NotFoundPage />;

  const duration = getDurationInFrames(def, data);
  const fields = allFields(def);
  const photoSlots = fields.filter((f) => f.type === 'photo').length;
  // "What you can change": the personal details, in plain words.
  const similar = similarTemplates(def);
  const personal = def.schema.details.filter((f) => f.type === 'text').map((f) => t(f.label));

  const personalise = () => {
    tap();
    // The draft is only created once the customer types something.
    navigate(`/editor/new/${def.slug}`);
  };

  return (
    <>
      <div className="safe-top sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur md:hidden">
        <div className="flex h-14 items-center gap-1 px-1">
          <button onClick={back} className="grid size-11 place-items-center rounded-full" aria-label={t('Back')}>
            <ArrowLeft className="size-5" />
          </button>
          <p className="min-w-0 flex-1 truncate pr-3 font-semibold">{def.name}</p>
        </div>
      </div>

      <div className="md:grid md:grid-cols-[minmax(0,380px)_1fr] md:gap-10 md:px-6 md:pt-8 xl:grid-cols-[minmax(0,440px)_1fr] xl:gap-14">
        {/* self-start: don't stretch to the text column's height (that letterboxed the video in a tall dark box). */}
        <div className="flex justify-center bg-ink md:sticky md:top-24 md:w-fit md:self-start md:overflow-hidden md:rounded-card">
          <VideoPlayer
            def={def}
            data={data}
            watermark
            autoPlay
            loop
            soundHint
            style={{ aspectRatio: '9 / 16', height: '62dvh', maxWidth: '100%' }}
            // Desktop: as tall as fits under the header (max the column width at 9:16); width follows the height.
            className="md:!h-[min(calc(100dvh-8rem),675px)] md:!w-auto xl:!h-[min(calc(100dvh-8rem),782px)]"
          />
        </div>

        <div className="px-4 pb-safe-28 pt-5 md:px-0 md:pb-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-ink">{t(categoryName(def.category))}</p>
          <h1 className="mt-1 font-display text-[26px] font-semibold leading-tight md:text-3xl">{def.name}</h1>
          <p className="mt-2 text-[15px] text-muted">{def.description}</p>

          <ul className="mt-4 flex flex-wrap gap-2 text-sm">
            <li className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5"><Clock className="size-4 text-primary" /> {t('{n} seconds', { n: Math.round(duration / def.fps) })}</li>
            <li className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5"><Film className="size-4 text-primary" /> {t('{n} clips', { n: def.schema.clips.length })}</li>
            {photoSlots > 0 ? (
              <li className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5"><Image className="size-4 text-primary" /> {t('{n} photo', { n: photoSlots })}</li>
            ) : null}
          </ul>

          <section className="mt-5 rounded-card border border-border bg-surface p-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <Pencil className="size-4 text-primary" /> {t('What you can change')}
            </h2>
            <p className="mt-1 text-sm text-muted">{personal.join(' · ')}</p>
            {photoSlots > 0 ? <p className="mt-1 text-sm text-muted">{t('Plus your photo, and the wording in every clip.')}</p> : null}
          </section>

          <TagChips tags={def.tags} className="mt-4" />

          <section className="mt-5">
            <h2 className="mb-2 font-semibold">{t('Clips in this video')}</h2>
            <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
              {def.schema.clips.map((c) => (
                <li key={c.id} className="w-24 shrink-0">
                  <div className="aspect-[9/16] overflow-hidden rounded-xl border border-border" style={{ background: def.swatch[0] }}>
                    <Thumbnail
                      component={component}
                      inputProps={{ data, watermark: false }}
                      compositionWidth={def.width}
                      compositionHeight={def.height}
                      durationInFrames={duration}
                      fps={def.fps}
                      frameToDisplay={holdFrameOf(def, data, c.id) ?? 0}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">
                    {c.name}
                    {c.optional ? ` · ${t('optional')}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {similar.length ? (
            <section className="mt-8">
              <SectionHeader title={t('Similar templates')} href={`/invitations/${def.category}`} />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {similar.map((tpl, i) => (
                  <TemplateCard key={tpl.slug} def={tpl} order={i} />
                ))}
              </div>
            </section>
          ) : null}

          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/70 bg-surface/95 px-4 pt-3 pb-safe-3 shadow-[0_-8px_24px_-12px_rgba(42,26,31,0.25)] backdrop-blur md:static md:mt-8 md:border-0 md:bg-transparent md:px-0 md:pt-0 md:pb-0 md:shadow-none">
            <div className="mx-auto flex max-w-md items-center gap-4 md:mx-0 md:max-w-none">
              <div className="shrink-0 md:hidden">
                <p className="text-xl font-bold leading-tight">{formatInr(def.priceInr)}</p>
                <p className="text-xs text-muted">{t('for the HD video')}</p>
              </div>
              <Button onClick={personalise} className="min-h-12 flex-1 md:flex-none md:px-10">
                {t('Personalise free')} <ChevronRight className="size-4" />
              </Button>
            </div>
            <p className="mt-2 hidden text-sm text-muted md:block">
              {t('Preview is free. HD download without watermark:')} <strong className="text-ink">{formatInr(def.priceInr)}</strong>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

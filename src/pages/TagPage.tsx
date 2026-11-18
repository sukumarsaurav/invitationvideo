import { ChevronRight } from 'lucide-react';
import { useCatalogue } from '@/lib/catalogue';
import { Link, useParams } from 'react-router-dom';
import { TagChips } from '@/components/TagChips';
import { TemplateCard } from '@/components/TemplateCard';
import { useI18n } from '@/lib/i18n';
import { tagMeta } from '@/lib/pageMeta';
import { useSeo } from '@/lib/seo';
import { getTag, tagsWithTemplates, TEMPLATES, templatesWithTag } from '@/templates/registry';
import { NotFoundPage } from './NotFoundPage';

/** Landing page for one tag, e.g. /tags/hindu-wedding. Written to rank for that search. */
export const TagPage = () => {
  const { t } = useI18n();
  useCatalogue(); // re-render when the admin-published catalogue arrives
  const { tag: slug } = useParams();
  const tag = getTag(slug);
  const list = tag ? templatesWithTag(tag.slug) : [];
  // Related tags: other tags used by the same templates.
  const related = tag
    ? tagsWithTemplates()
        .filter((x) => x.slug !== tag.slug && list.some((tpl) => tpl.tags.includes(x.slug)))
        .map((x) => x.slug)
    : [];

  useSeo(tagMeta(TEMPLATES, slug));

  if (!tag) return <NotFoundPage />;

  return (
    <div className="px-4 pt-4 md:px-6 md:pt-8">
      <nav aria-label={t('Breadcrumb')} className="flex items-center gap-1 text-xs text-muted">
        <Link to="/" className="inline-flex min-h-9 items-center hover:text-primary">{t('Home')}</Link>
        <ChevronRight className="size-3" />
        <Link to="/templates" className="inline-flex min-h-9 items-center hover:text-primary">{t('Templates')}</Link>
        <ChevronRight className="size-3" />
        <span className="text-ink">{t(tag.name)}</span>
      </nav>
      <h1 className="mt-1 font-display text-[28px] font-semibold leading-tight md:text-4xl">{t(tag.title)}</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-muted">{t(tag.blurb)}</p>
      <p className="mt-1 text-sm text-muted">{t('{n} designs', { n: list.length })}</p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
        {list.map((tpl, i) => (
          <TemplateCard key={tpl.slug} def={tpl} order={i} />
        ))}
      </div>

      {related.length ? (
        <section className="mt-10">
          <h2 className="mb-3 font-display text-xl font-semibold">{t('Related searches')}</h2>
          <TagChips tags={related} />
        </section>
      ) : null}
    </div>
  );
};

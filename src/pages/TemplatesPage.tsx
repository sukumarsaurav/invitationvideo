import { Search, SearchX, X } from 'lucide-react';
import { useCatalogue } from '@/lib/catalogue';
import { useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CategoryChips } from '@/components/CategoryChips';
import { TagChips } from '@/components/TagChips';
import { EmptyState } from '@/components/EmptyState';
import { TemplateCard } from '@/components/TemplateCard';
import { cn } from '@/lib/cn';
import { useI18n } from '@/lib/i18n';
import { listingMeta } from '@/lib/pageMeta';
import { useSeo } from '@/lib/seo';
import { categoriesWithTemplates, categoryName, getCategory, searchTemplates, tagsWithTemplates, TEMPLATES } from '@/templates/registry';

export const TemplatesPage = () => {
  const { t } = useI18n();
  useCatalogue(); // re-render when the admin-published catalogue arrives
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  // Category pages live at /invitations/<slug> (crawlable); ?category= still works for old links.
  const { category: pathCategory } = useParams();
  const active = pathCategory ?? params.get('category');
  const category = getCategory(active ?? undefined);
  const query = params.get('q') ?? '';
  const searchRef = useRef<HTMLInputElement>(null);

  // The header search icon links here with ?search=1: focus the box so the keyboard opens.
  useEffect(() => {
    if (params.get('search') === '1') searchRef.current?.focus();
  }, [params]);

  const byCategory = active ? TEMPLATES.filter((tpl) => tpl.category === active) : TEMPLATES;
  const list = searchTemplates(query, byCategory);

  const update = (patch: { category?: string | null; q?: string }) => {
    const nextCategory = patch.category !== undefined ? patch.category : active;
    const q = patch.q !== undefined ? patch.q : query;
    const search = q ? `?q=${encodeURIComponent(q)}` : '';
    if (patch.category !== undefined) {
      navigate(`${nextCategory ? `/invitations/${nextCategory}` : '/templates'}${search}`, { replace: true });
      return;
    }
    const next = new URLSearchParams();
    if (!pathCategory && nextCategory) next.set('category', nextCategory);
    if (q) next.set('q', q);
    setParams(next, { replace: true });
  };

  const relatedTags = tagsWithTemplates()
    .filter((tag) => byCategory.some((tpl) => tpl.tags.includes(tag.slug)))
    .map((tag) => tag.slug);

  const meta = listingMeta(TEMPLATES, active);
  // Search result pages are not indexed; category pages are.
  useSeo({ ...meta, noindex: meta.noindex || Boolean(query) });

  return (
    <div className="pt-4 lg:flex lg:gap-8 lg:px-6 lg:pt-8">
      <aside className="hidden w-52 shrink-0 lg:block">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{t('Categories')}</p>
        <ul className="space-y-1">
          {[{ slug: null, name: 'All templates', count: TEMPLATES.length }, ...categoriesWithTemplates()].map((c) => (
            <li key={c.slug ?? 'all'}>
              <button
                onClick={() => update({ category: c.slug })}
                className={cn(
                  'flex min-h-11 w-full items-center justify-between rounded-[10px] px-3 text-left text-sm',
                  active === c.slug ? 'bg-primary text-white' : 'hover:bg-surface',
                )}
              >
                {t(c.name)} <span className="text-xs opacity-70">{c.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="px-4 md:px-6 lg:px-0">
          <h1 className="font-display text-[26px] font-semibold leading-tight md:text-3xl">
            {active ? t('{category} invitations', { category: t(categoryName(active)) }) : t('All templates')}
          </h1>
          {category ? <p className="mt-1 max-w-2xl text-sm text-muted">{t(category.blurb)}</p> : null}
          <label className="relative mt-3 block">
            <span className="sr-only">{t('Search templates')}</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => update({ q: e.target.value })}
              placeholder={t('Search: wedding, maroon, birthday…')}
              enterKeyHint="search"
              className="h-12 w-full rounded-button border border-border bg-surface pl-11 pr-11 outline-none focus:border-primary"
            />
            {query ? (
              <button onClick={() => update({ q: '' })} className="absolute right-0.5 top-1/2 grid size-11 -translate-y-1/2 place-items-center text-muted" aria-label={t('Clear search')}>
                <X className="size-5" />
              </button>
            ) : null}
          </label>
        </div>
        <CategoryChips active={active} onSelect={(slug) => update({ category: slug })} className="mt-3 md:px-6 lg:hidden" />

        {list.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<SearchX className="size-6" />}
              title={t('No templates match')}
              body={t('Try another word, or clear the search to see everything.')}
              action={
                <button onClick={() => update({ q: '', category: null })} className="inline-flex min-h-11 items-center rounded-button bg-primary px-5 font-semibold text-white">
                  {t('Show all templates')}
                </button>
              }
            />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 px-4 sm:grid-cols-3 md:px-6 lg:grid-cols-4 lg:px-0 xl:grid-cols-5 2xl:grid-cols-6">
            {list.map((tpl, i) => (
              <TemplateCard key={tpl.slug} def={tpl} order={i} />
            ))}
          </div>
        )}

        {relatedTags.length ? (
          <section className="mt-10 px-4 md:px-6 lg:px-0">
            <h2 className="mb-3 font-display text-xl font-semibold">{t('Popular searches')}</h2>
            <TagChips tags={relatedTags} />
          </section>
        ) : null}
      </div>
    </div>
  );
};

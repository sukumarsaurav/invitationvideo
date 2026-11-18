import { Heart, Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { useCatalogue } from '@/lib/catalogue';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CategoryChips } from '@/components/CategoryChips';
import { EmptyState } from '@/components/EmptyState';
import { Sheet } from '@/components/Sheet';
import { TagChips } from '@/components/TagChips';
import { TemplateCard } from '@/components/TemplateCard';
import { cn } from '@/lib/cn';
import { useI18n } from '@/lib/i18n';
import { listingMeta } from '@/lib/pageMeta';
import { useSeo } from '@/lib/seo';
import { useShortlist } from '@/lib/shortlist';
import {
  categoriesWithTemplates,
  getCategory,
  hasPhotoSlot,
  searchTemplates,
  sortTemplates,
  tagsWithTemplates,
  templatesIn,
  TEMPLATES,
  type SortKey,
} from '@/templates/registry';
import { mainCategoryOf, subCategoriesOf, TAGS, type TagGroup } from '@/templates/taxonomy';
import type { TemplateDefinition } from '@/templates/types';

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: 'popular', label: 'Most popular' },
  { key: 'newest', label: 'Newest' },
  { key: 'price-asc', label: 'Price: low to high' },
  { key: 'price-desc', label: 'Price: high to low' },
];

const TAG_GROUPS: Array<{ group: TagGroup; label: string }> = [
  { group: 'community', label: 'Community' },
  { group: 'style', label: 'Style' },
];

const listParam = (v: string | null) => (v ? v.split(',').filter(Boolean) : []);

const pill = (on: boolean) =>
  cn(
    'inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm transition-colors',
    on ? 'border-primary bg-primary font-semibold text-white' : 'border-border bg-surface text-ink hover:border-primary/50',
  );

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-ink">{children}</p>
);

const Check = ({ checked, onChange, label, count }: { checked: boolean; onChange: () => void; label: string; count: number }) => (
  <label className="flex min-h-10 cursor-pointer items-center gap-3 rounded-[10px] px-1 text-[15px] hover:bg-surface">
    <input type="checkbox" checked={checked} onChange={onChange} className="size-[18px] shrink-0 accent-[var(--color-primary)]" />
    <span className="flex-1">{label}</span>
    <span className="text-xs tabular-nums text-muted">{count}</span>
  </label>
);

/**
 * Listing pages: /templates (everything), /invitations/<main> (an occasion and its sub-occasions),
 * /invitations/<sub> (one sub-occasion) and the shortlist (?shortlist=1).
 * Main category → sub-category → tag filters, plus photo, format, sort and search. Every filter lives
 * in the URL, so filtered views can be shared and Back works; filtered views are not indexed.
 */
export const TemplatesPage = () => {
  const { t } = useI18n();
  useCatalogue(); // re-render when the admin-published catalogue arrives
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const shortlistSlugs = useShortlist();
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Category pages live at /invitations/<slug> (crawlable); ?category= still works for old links.
  const { category: pathCategory } = useParams();
  const active = pathCategory ?? params.get('category');
  const category = getCategory(active ?? undefined);
  const main = category ? getCategory(mainCategoryOf(category.slug)) : undefined;
  const isMainPage = Boolean(category && !category.parent);
  const shortlistView = params.get('shortlist') === '1';

  const query = params.get('q') ?? '';
  const subs = listParam(params.get('sub'));
  const tags = listParam(params.get('tags'));
  const photo = params.get('photo'); // 'with' | 'without' | null
  const format = params.get('format'); // 'video' | 'card' | null
  const sort = (SORTS.find((s) => s.key === params.get('sort'))?.key ?? 'popular') as SortKey;
  const searchRef = useRef<HTMLInputElement>(null);

  // The header search icon links here with ?search=1: focus the box so the keyboard opens.
  useEffect(() => {
    if (params.get('search') === '1') searchRef.current?.focus();
  }, [params]);

  /**
   * Changes some filters, keeping the rest. Empty values remove the parameter. Works from the latest
   * URL, so quick successive clicks don't undo each other.
   */
  const set = (patch: Record<string, string | string[] | null> | ((prev: URLSearchParams) => Record<string, string | string[] | null>)) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('search');
        for (const [k, v] of Object.entries(typeof patch === 'function' ? patch(prev) : patch)) {
          const value = Array.isArray(v) ? v.join(',') : v;
          if (value) next.set(k, value);
          else next.delete(k);
        }
        return next;
      },
      { replace: true },
    );
  };
  const toggleIn = (key: 'sub' | 'tags', _list: string[], value: string) =>
    set((prev) => {
      const current = listParam(prev.get(key));
      return { [key]: current.includes(value) ? current.filter((x) => x !== value) : [...current, value] };
    });
  const clearFilters = () => set({ sub: null, tags: null, photo: null, format: null, q: null });

  // The designs this page is about, before any filter.
  const base: TemplateDefinition[] = shortlistView
    ? shortlistSlugs.map((s) => TEMPLATES.find((tpl) => tpl.slug === s)).filter((x): x is TemplateDefinition => Boolean(x))
    : active
      ? templatesIn(active)
      : TEMPLATES;

  const selectedTagsIn = (group: TagGroup) => tags.filter((slug) => TAGS.find((tag) => tag.slug === slug)?.group === group);
  const filtered = searchTemplates(query, base).filter((tpl) => {
    if (isMainPage && subs.length && !subs.includes(tpl.category)) return false;
    // Within a group any ticked tag matches; across groups every group must match.
    for (const { group } of TAG_GROUPS) {
      const picked = selectedTagsIn(group);
      if (picked.length && !picked.some((slug) => tpl.tags.includes(slug))) return false;
    }
    if (photo === 'with' && !hasPhotoSlot(tpl)) return false;
    if (photo === 'without' && hasPhotoSlot(tpl)) return false;
    if (format === 'card') return false; // Digital cards are coming; every design today is a video.
    return true;
  });
  // The shortlist keeps the order things were added (newest first) unless a sort is picked.
  const list = shortlistView && !params.get('sort') ? filtered : sortTemplates(filtered, sort);

  const activeFilterCount = subs.length + tags.length + (photo ? 1 : 0) + (format ? 1 : 0);
  const anyFilter = activeFilterCount > 0 || Boolean(query);

  const relatedTags = tagsWithTemplates()
    .filter((tag) => base.some((tpl) => tpl.tags.includes(tag.slug)))
    .map((tag) => tag.slug);

  const meta = listingMeta(TEMPLATES, active);
  // Filtered, searched and shortlist views are not indexed; plain category pages are.
  useSeo(shortlistView ? { title: 'Shortlist', description: '', path: '/templates', noindex: true } : { ...meta, noindex: meta.noindex || anyFilter || Boolean(params.get('sort')) });

  const title = shortlistView
    ? t('Your shortlist')
    : category
      ? t('{category} invitations', { category: t(category.name) })
      : t('All invitation templates');
  const crumbs: Array<{ to: string; label: string }> = [
    { to: '/', label: t('Home') },
    { to: '/templates', label: t('Invitations') },
    ...(shortlistView ? [{ to: '/templates?shortlist=1', label: t('Shortlist') }] : []),
    ...(main && main.slug !== category?.slug ? [{ to: `/invitations/${main.slug}`, label: t(main.name) }] : []),
    ...(category ? [{ to: `/invitations/${category.slug}`, label: t(category.name) }] : []),
  ];

  // ---------------------------------------------------------------------------
  // Filters (sidebar on big screens, bottom sheet on phones)
  // ---------------------------------------------------------------------------
  const filters = (
    <div className="space-y-6">
      {!category && !shortlistView ? (
        <section>
          <SectionLabel>{t('Occasion')}</SectionLabel>
          <ul>
            {categoriesWithTemplates().map((c) => (
              <li key={c.slug}>
                <Link to={`/invitations/${c.slug}`} className="flex min-h-10 items-center justify-between rounded-[10px] px-1 text-[15px] hover:bg-surface">
                  {t(c.name)} <span className="text-xs tabular-nums text-muted">{c.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {main && subCategoriesOf(main.slug).length > 1 ? (
        <section>
          <SectionLabel>{t('Refine {name}', { name: t(main.name) })}</SectionLabel>
          {isMainPage ? (
            subCategoriesOf(main.slug).map((c) => (
              <Check
                key={c.slug}
                checked={subs.includes(c.slug)}
                onChange={() => toggleIn('sub', subs, c.slug)}
                label={t(c.subLabel ?? c.name)}
                count={base.filter((tpl) => tpl.category === c.slug).length}
              />
            ))
          ) : (
            // On a sub-occasion page the siblings are links (each has its own page).
            <ul>
              {subCategoriesOf(main.slug).map((c) => (
                <li key={c.slug}>
                  <Link
                    to={`/invitations/${c.slug}`}
                    aria-current={c.slug === category?.slug ? 'page' : undefined}
                    className={cn(
                      'flex min-h-10 items-center justify-between rounded-[10px] px-2 text-[15px]',
                      c.slug === category?.slug ? 'bg-primary/10 font-semibold text-primary' : 'hover:bg-surface',
                    )}
                  >
                    {t(c.subLabel ?? c.name)}
                    <span className="text-xs tabular-nums text-muted">{templatesIn(c.slug).filter((tpl) => tpl.category === c.slug).length}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {TAG_GROUPS.map(({ group, label }) => {
        const options = TAGS.filter((tag) => tag.group === group && base.some((tpl) => tpl.tags.includes(tag.slug)));
        if (!options.length) return null;
        return (
          <section key={group}>
            <SectionLabel>{t(label)}</SectionLabel>
            {options.map((tag) => (
              <Check
                key={tag.slug}
                checked={tags.includes(tag.slug)}
                onChange={() => toggleIn('tags', tags, tag.slug)}
                label={t(tag.name)}
                count={base.filter((tpl) => tpl.tags.includes(tag.slug)).length}
              />
            ))}
          </section>
        );
      })}

      <section>
        <SectionLabel>{t('Photo')}</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['with', 'With photo'],
              ['without', 'Without photo'],
            ] as const
          ).map(([key, label]) => (
            <button key={key} type="button" aria-pressed={photo === key} onClick={() => set({ photo: photo === key ? null : key })} className={pill(photo === key)}>
              {t(label)}
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>{t('Format')}</SectionLabel>
        <div className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={!format} onClick={() => set({ format: null })} className={pill(!format)}>
            {t('All')}
          </button>
          <button type="button" aria-pressed={format === 'video'} onClick={() => set({ format: format === 'video' ? null : 'video' })} className={pill(format === 'video')}>
            {t('Video')}
          </button>
          <button type="button" disabled className={cn(pill(false), 'cursor-not-allowed opacity-60')} title={t('Digital cards are coming soon')}>
            {t('Card')} <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">{t('Soon')}</span>
          </button>
        </div>
      </section>

      {anyFilter ? (
        <button type="button" onClick={clearFilters} className="min-h-10 text-sm font-semibold text-primary underline underline-offset-4">
          {t('Clear all filters')}
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="pb-6">
      {/* Page header: breadcrumbs, title, what the occasion is about. */}
      <header className="border-b border-border/70 bg-gradient-to-b from-[#F8EDE4] to-transparent px-4 pb-6 pt-5 text-center md:px-6 md:pb-8 md:pt-8 lg:-mx-4 lg:px-10">
        <nav aria-label={t('Breadcrumb')}>
          <ol className="flex flex-wrap items-center justify-center gap-x-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-ink">
            {crumbs.map((c, i) => (
              <li key={c.to} className="flex items-center gap-2">
                {i > 0 ? <span className="text-muted/60" aria-hidden>/</span> : null}
                {i === crumbs.length - 1 ? (
                  <span className="text-muted" aria-current="page">
                    {c.label}
                  </span>
                ) : (
                  <Link to={c.to} className="hover:text-primary">
                    {c.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="mt-3 font-display text-[30px] font-semibold leading-tight text-primary-dark md:text-5xl">{title}</h1>
        {shortlistView ? (
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted md:text-base">{t('Designs you hearted on this device.')}</p>
        ) : category ? (
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted md:text-base">{t(category.blurb)}</p>
        ) : (
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted md:text-base">{t('Personalised video invitations for every celebration. Preview free, then download in HD.')}</p>
        )}
      </header>

      <div className="mt-5 lg:mt-8 lg:flex lg:gap-10 lg:px-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-28 max-h-[calc(100dvh-8rem)] overflow-y-auto pb-4 pr-2">{filters}</div>
        </aside>

        <div className="min-w-0 flex-1 lg:border-l lg:border-border lg:pl-10">
          {/* Toolbar: search, count, sort (and the Filters button on phones). */}
          <div className="px-4 md:px-6 lg:px-0">
            <label className="relative block">
              <span className="sr-only">{t('Search templates')}</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => set({ q: e.target.value })}
                placeholder={t('Search: wedding, maroon, birthday…')}
                enterKeyHint="search"
                className="h-12 w-full rounded-full border border-border bg-surface pl-11 pr-11 outline-none focus:border-primary"
              />
              {query ? (
                <button onClick={() => set({ q: null })} className="absolute right-0.5 top-1/2 grid size-11 -translate-y-1/2 place-items-center text-muted" aria-label={t('Clear search')}>
                  <X className="size-5" />
                </button>
              ) : null}
            </label>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-b border-border pb-4">
              <p className="font-display text-xl text-ink" aria-live="polite">
                {t(list.length === 1 ? '{n} design' : '{n} designs', { n: list.length })}
              </p>
              <div className="ml-auto flex items-center gap-2">
                {/* Phones and tablets: filters in a sheet, sort in a menu. */}
                <button type="button" onClick={() => setFiltersOpen(true)} className={cn(pill(activeFilterCount > 0), 'lg:hidden')}>
                  <SlidersHorizontal className="size-4" /> {t('Filters')}
                  {activeFilterCount ? <span className="rounded-full bg-white/25 px-1.5 text-xs">{activeFilterCount}</span> : null}
                </button>
                <label className="lg:hidden">
                  <span className="sr-only">{t('Sort')}</span>
                  <select
                    value={sort}
                    onChange={(e) => set({ sort: e.target.value === 'popular' ? null : e.target.value })}
                    className="h-10 rounded-full border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
                  >
                    {SORTS.map((s) => (
                      <option key={s.key} value={s.key}>
                        {t(s.label)}
                      </option>
                    ))}
                  </select>
                </label>
                {/* Big screens: sort as pills. */}
                <div className="hidden items-center gap-2 lg:flex" role="radiogroup" aria-label={t('Sort')}>
                  <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-ink">{t('Sort')}</span>
                  {SORTS.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      role="radio"
                      aria-checked={sort === s.key}
                      onClick={() => set({ sort: s.key === 'popular' ? null : s.key })}
                      className={pill(sort === s.key)}
                    >
                      {t(s.label)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Phones and tablets: jump between occasions. */}
          {!shortlistView ? (
            <CategoryChips
              active={main?.slug ?? null}
              onSelect={(slug) => navigate(slug ? `/invitations/${slug}` : '/templates')}
              className="mt-4 md:px-6 lg:hidden"
            />
          ) : null}

          {list.length === 0 ? (
            <div className="mt-6">
              {shortlistView && base.length === 0 ? (
                <EmptyState
                  icon={<Heart className="size-6" />}
                  title={t('Your shortlist is empty')}
                  body={t('Tap the heart on any design to keep it here.')}
                  action={
                    <Link to="/templates" className="inline-flex min-h-11 items-center rounded-button bg-primary px-5 font-semibold text-white">
                      {t('Browse designs')}
                    </Link>
                  }
                />
              ) : (
                <EmptyState
                  icon={<SearchX className="size-6" />}
                  title={anyFilter ? t('No designs match these filters') : t('New designs are on their way')}
                  body={anyFilter ? t('Try removing a filter, or clear them all.') : t('We are adding designs for this occasion. Meanwhile, browse all templates.')}
                  action={
                    anyFilter ? (
                      <button onClick={clearFilters} className="inline-flex min-h-11 items-center rounded-button bg-primary px-5 font-semibold text-white">
                        {t('Clear all filters')}
                      </button>
                    ) : (
                      <button onClick={() => navigate('/templates')} className="inline-flex min-h-11 items-center rounded-button bg-primary px-5 font-semibold text-white">
                        {t('Show all templates')}
                      </button>
                    )
                  }
                />
              )}
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3 px-4 sm:grid-cols-3 md:gap-4 md:px-6 lg:px-0 xl:grid-cols-4 xl:gap-5">
              {list.map((tpl, i) => (
                <TemplateCard key={tpl.slug} def={tpl} order={i} />
              ))}
            </div>
          )}

          {relatedTags.length && !shortlistView ? (
            <section className="mt-10 px-4 md:px-6 lg:px-0">
              <h2 className="mb-3 font-display text-xl font-semibold">{t('Popular searches')}</h2>
              <TagChips tags={relatedTags} />
            </section>
          ) : null}
        </div>
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen} title={t('Filters')}>
        <div className="max-h-[60dvh] overflow-y-auto pr-1">{filters}</div>
        <button
          type="button"
          onClick={() => setFiltersOpen(false)}
          className="mt-4 flex min-h-12 w-full items-center justify-center rounded-button bg-primary font-semibold text-white"
        >
          {t(list.length === 1 ? 'Show {n} design' : 'Show {n} designs', { n: list.length })}
        </button>
      </Sheet>
    </div>
  );
};

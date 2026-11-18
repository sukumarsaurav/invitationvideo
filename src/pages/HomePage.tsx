import { ChevronDown, Download, Eye, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Hero } from '@/components/Hero';
import { TemplateCard } from '@/components/TemplateCard';
import { TagChips } from '@/components/TagChips';
import { SectionHeader, TemplateRail } from '@/components/TemplateRail';
import { FAQ } from '@/content/faq';
import { useI18n } from '@/lib/i18n';
import { homeMeta } from '@/lib/pageMeta';
import { useSeo } from '@/lib/seo';
import { categoriesWithTemplates, popularTemplates, tagsWithTemplates, TEMPLATES, trendingTemplates } from '@/templates/registry';

const STEPS = [
  { icon: PenLine, title: 'Personalise', body: 'Add names, dates and photos' },
  { icon: Eye, title: 'Preview free', body: 'Send it to family to check' },
  { icon: Download, title: 'Download HD', body: 'Share it on WhatsApp' },
];

export const HomePage = () => {
  const { t } = useI18n();
  const trending = trendingTemplates();
  const popular = popularTemplates();
  const occasions = categoriesWithTemplates();
  const tags = tagsWithTemplates();
  const faq = FAQ.slice(0, 4);

  useSeo(homeMeta(TEMPLATES, faq));

  return (
    <div className="pb-6">
      <Hero />

      {trending.length ? (
        <section className="mt-10 px-4 md:px-6" aria-labelledby="trending">
          <SectionHeader title={t('Trending now')} eyebrow={t('Most loved this week')} href="/templates" />
          <span id="trending" className="sr-only">{t('Trending now')}</span>
          <TemplateRail templates={trending} />
        </section>
      ) : null}

      <section className="mt-10 px-4 md:px-6">
        <SectionHeader title={t('Browse by occasion')} />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {occasions.map((c) => {
            const sample = TEMPLATES.find((tpl) => tpl.category === c.slug);
            return (
              <li key={c.slug}>
                <Link
                  to={`/invitations/${c.slug}`}
                  className="relative flex h-24 flex-col justify-end overflow-hidden rounded-card p-3 text-white shadow-sm transition-transform active:scale-[0.98]"
                  style={{ background: `linear-gradient(150deg, ${sample?.swatch[0] ?? '#7A1F3D'}, ${sample?.swatch[1] ?? '#C9A54C'})` }}
                >
                  <span className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" aria-hidden />
                  <span className="relative font-display text-lg font-semibold leading-tight">{t(c.name)}</span>
                  <span className="relative text-xs text-white/85">{t('{n} designs', { n: c.count })}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10 px-4 md:px-6">
        <SectionHeader title={t('Popular templates')} eyebrow={t('Chosen most often')} href="/templates" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {popular.map((tpl, i) => (
            <TemplateCard key={tpl.slug} def={tpl} order={trending.length + i} />
          ))}
        </div>
      </section>

      {tags.length ? (
        <section className="mt-10 px-4 md:px-6">
          <SectionHeader title={t('Popular searches')} />
          <TagChips tags={tags.map((tag) => tag.slug)} />
        </section>
      ) : null}

      <section className="mt-10 px-4 md:px-6">
        <SectionHeader title={t('How it works')} />
        <ol className="divide-y divide-border rounded-card border border-border bg-surface md:grid md:grid-cols-3 md:divide-x md:divide-y-0">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="flex items-center gap-3 p-4">
              <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-[15px] font-semibold">
                  {i + 1}. {t(title)}
                </p>
                <p className="text-sm text-muted">{t(body)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10 px-4 md:px-6">
        <SectionHeader title={t('Questions')} href="/help" />
        <div className="divide-y divide-border rounded-card border border-border bg-surface">
          {faq.map(([q, a]) => (
            <details key={q} className="group px-4">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 font-semibold">
                {t(q)}
                <ChevronDown className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" />
              </summary>
              <p className="pb-4 text-sm text-muted">{t(a)}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
};

import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useI18n } from '@/lib/i18n';
import type { TemplateDefinition } from '@/templates/types';
import { TemplateCard } from './TemplateCard';

/** Section title with an optional "See all" link. */
export const SectionHeader = ({ title, eyebrow, href, className }: { title: string; eyebrow?: ReactNode; href?: string; className?: string }) => {
  const { t } = useI18n();
  return (
    <div className={cn('mb-3 flex items-end justify-between gap-3', className)}>
      <div>
        {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-ink">{eyebrow}</p> : null}
        <h2 className="font-display text-[22px] font-semibold leading-tight md:text-2xl">{title}</h2>
      </div>
      {href ? (
        <Link to={href} className="-mr-2 inline-flex min-h-11 shrink-0 items-center gap-0.5 px-2 text-sm font-semibold text-primary">
          {t('See all')} <ChevronRight className="size-4" />
        </Link>
      ) : null}
    </div>
  );
};

/** Horizontal, swipeable row of templates on phones; a grid from tablet up. */
export const TemplateRail = ({ templates, startOrder = 0 }: { templates: TemplateDefinition[]; startOrder?: number }) => (
  <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
    {templates.map((tpl, i) => (
      <div key={tpl.slug} className="w-[44%] shrink-0 snap-start sm:w-auto">
        <TemplateCard def={tpl} order={startOrder + i} />
      </div>
    ))}
  </div>
);

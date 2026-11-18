import { cn } from '@/lib/cn';
import { useI18n } from '@/lib/i18n';
import { categoriesWithTemplates, TEMPLATES } from '@/templates/registry';

type Props = { active: string | null; onSelect: (slug: string | null) => void; className?: string };

/** Horizontally scrolling category filter. Only categories that have templates, with counts. */
export const CategoryChips = ({ active, onSelect, className }: Props) => {
  const { t } = useI18n();
  const chips = [{ slug: null, name: 'All', count: TEMPLATES.length }, ...categoriesWithTemplates()];
  return (
    <div className={cn('no-scrollbar flex gap-2 overflow-x-auto px-4', className)}>
      {chips.map((c) => {
        const on = active === c.slug;
        return (
          <button
            key={c.slug ?? 'all'}
            onClick={() => onSelect(c.slug)}
            aria-pressed={on}
            className={cn(
              'flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors',
              on ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-ink',
            )}
          >
            {t(c.name)}
            <span className={cn('text-xs', on ? 'text-white/80' : 'text-muted')}>{c.count}</span>
          </button>
        );
      })}
    </div>
  );
};

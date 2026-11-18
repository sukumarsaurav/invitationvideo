import { Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useI18n } from '@/lib/i18n';
import { tagName } from '@/templates/registry';

/** Wrapping list of tag links (each tag has its own page). */
export const TagChips = ({ tags, className }: { tags: string[]; className?: string }) => {
  const { t } = useI18n();
  return (
    <ul className={cn('flex flex-wrap gap-2', className)}>
      {tags.map((slug) => (
        <li key={slug}>
          <Link
            to={`/tags/${slug}`}
            className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border bg-surface px-3.5 text-sm text-ink transition-colors hover:border-primary hover:text-primary active:scale-[0.97]"
          >
            <Hash className="size-3.5 text-accent-ink" /> {t(tagName(slug))}
          </Link>
        </li>
      ))}
    </ul>
  );
};

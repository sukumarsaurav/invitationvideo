import { Link } from 'react-router-dom';
import { TAGLINE } from '@/config';
import { cn } from '@/lib/cn';
import { useI18n } from '@/lib/i18n';

/** Wordmark with a small tagline underneath (tagline hides on very small screens). */
export const Logo = ({ className, tagline = true }: { className?: string; tagline?: boolean }) => {
  const { t } = useI18n();
  return (
    <Link to="/" className={cn('flex min-h-11 items-center gap-2.5', className)} aria-label="Invitation Videos home">
      <span className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-primary font-display text-base font-semibold italic text-accent shadow-sm">
        iv
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[20px] font-semibold tracking-tight text-ink">
          invitation<span className="italic text-primary">videos</span>
        </span>
        {tagline ? (
          <span className="mt-1 whitespace-nowrap text-[10.5px] font-semibold uppercase tracking-[0.16em] text-accent-ink max-[340px]:hidden">{t(TAGLINE)}</span>
        ) : null}
      </span>
    </Link>
  );
};

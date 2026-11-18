import { Search } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useI18n } from '@/lib/i18n';

/** Big screens: a real search box in the header. Submitting shows the results on the templates page. */
export const HeaderSearch = ({ className }: { className?: string }) => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const [q, setQ] = useState('');

  // Mirror the query when the templates page is showing results, and clear it elsewhere.
  useEffect(() => {
    setQ(pathname === '/templates' || pathname.startsWith('/invitations/') ? (new URLSearchParams(search).get('q') ?? '') : '');
  }, [pathname, search]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    navigate(query ? `/templates?q=${encodeURIComponent(query)}` : '/templates');
  };

  return (
    <form role="search" onSubmit={submit} className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('Search designs or occasions…')}
        aria-label={t('Search templates')}
        enterKeyHint="search"
        className="h-11 w-full rounded-full border border-border bg-surface pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-muted focus:border-primary"
      />
    </form>
  );
};

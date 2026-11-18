import { AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useBlocker } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { supabase } from '@/lib/supabase';

export const inputCls =
  'h-11 w-full rounded-button border border-border bg-surface px-3 text-[15px] outline-none focus:border-primary disabled:bg-background disabled:text-muted';

export const PageHeader = ({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="font-display text-2xl font-semibold md:text-3xl">{title}</h1>
      {description ? <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p> : null}
    </div>
    {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
  </div>
);

export const Card = ({ title, children, className }: { title?: string; children: ReactNode; className?: string }) => (
  <section className={cn('rounded-card border border-border bg-surface p-4 md:p-5', className)}>
    {title ? <h2 className="mb-3 font-semibold">{title}</h2> : null}
    {children}
  </section>
);

export const Field = ({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-semibold">{label}</span>
    {children}
    {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
  </label>
);

export const Loading = () => (
  <div className="grid place-items-center py-16">
    <Loader2 className="size-6 animate-spin text-muted" aria-label="Loading" />
  </div>
);

export const ErrorNote = ({ message }: { message: string }) => (
  <p role="alert" className="flex items-start gap-2 rounded-button bg-error/10 p-3 text-sm text-error">
    <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {message}
  </p>
);

export const Badge = ({ tone = 'neutral', children }: { tone?: 'neutral' | 'good' | 'warn' | 'bad'; children: ReactNode }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
      tone === 'good' && 'bg-success/15 text-success',
      tone === 'warn' && 'bg-accent/20 text-accent-ink',
      tone === 'bad' && 'bg-error/10 text-error',
      tone === 'neutral' && 'bg-background text-muted',
    )}
  >
    {children}
  </span>
);

export const formatDateTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }) : '—';

export const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { dateStyle: 'medium', timeZone: 'Asia/Kolkata' }) : '—';

/** Order money is stored in paise (like Razorpay); template prices are whole rupees. */
export const formatPaise = (paise: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(paise / 100);

/**
 * Asks before leaving a page with unsaved edits: in-app links (React Router) and closing or
 * reloading the tab.
 */
export const useUnsavedGuard = (dirty: boolean) => {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname);
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm('You have unsaved changes. Leave without saving?')) blocker.proceed();
    else blocker.reset();
  }, [blocker]);
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);
};

/** Emails for admin ids (audit log, notes, history). Unknown ids show a short id. */
export const usePeople = (ids: Array<string | null | undefined>) => {
  const [people, setPeople] = useState<Record<string, string>>({});
  const key = [...new Set(ids.filter((x): x is string => Boolean(x)))].sort().join(',');
  useEffect(() => {
    if (!key) return;
    let active = true;
    void supabase!.rpc('admin_people', { p_ids: key.split(',') }).then(({ data }) => {
      if (!active || !data) return;
      setPeople((prev) => ({ ...prev, ...Object.fromEntries((data as Array<{ user_id: string; email: string }>).map((p) => [p.user_id, p.email])) }));
    });
    return () => {
      active = false;
    };
  }, [key]);
  return (id: string | null | undefined) => (id ? (people[id] ?? id.slice(0, 8)) : 'system');
};

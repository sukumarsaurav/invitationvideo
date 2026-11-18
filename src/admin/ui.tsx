import { AlertTriangle, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

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

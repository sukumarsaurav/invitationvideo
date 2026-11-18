import type { ReactNode } from 'react';

export const EmptyState = ({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) => (
  <div className="mx-4 flex flex-col items-center rounded-card border border-dashed border-border bg-surface px-6 py-12 text-center">
    <div className="mb-3 grid size-14 place-items-center rounded-full bg-primary/10 text-primary">{icon}</div>
    <p className="font-display text-lg font-semibold">{title}</p>
    <p className="mt-1 max-w-xs text-sm text-muted">{body}</p>
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

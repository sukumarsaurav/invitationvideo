import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { cn } from '@/lib/cn';
import { supabase } from '@/lib/supabase';
import { Badge, ErrorNote, formatDateTime, Loading, PageHeader } from './ui';

type Entry = {
  id: number;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  reason: string | null;
  created_at: string;
};

const TYPES = [
  { value: '', label: 'Everything' },
  { value: 'templates', label: 'Templates' },
  { value: 'site_settings', label: 'Settings' },
  { value: 'admins', label: 'Admins' },
];

const IGNORED = new Set(['updated_at', 'updated_by']);
const PAGE = 50;

const describe = (e: Entry) => {
  if (e.action === 'insert') return 'Created';
  if (e.action === 'delete') return 'Deleted';
  if (!e.before || !e.after) return e.action;
  const keys = Object.keys(e.after).filter((k) => !IGNORED.has(k) && JSON.stringify(e.before![k]) !== JSON.stringify(e.after![k]));
  if (keys.length === 0) return 'Saved with no visible change';
  return keys
    .map((k) => {
      const from = e.before![k];
      const to = e.after![k];
      const short = (v: unknown) => {
        const s = typeof v === 'string' ? v : JSON.stringify(v);
        return s && s.length > 40 ? `${s.slice(0, 40)}…` : s;
      };
      return `${k}: ${short(from)} → ${short(to)}`;
    })
    .join('; ');
};

/** Every recorded change, newest first. Nobody can edit or delete these rows, owners included. */
export const AuditLogPage = () => {
  const [type, setType] = useState('');
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setRows(null);
    let q = supabase!.from('audit_log').select('*').order('created_at', { ascending: false }).range(page * PAGE, page * PAGE + PAGE - 1);
    if (type) q = q.eq('entity_type', type);
    q.then(({ data, error: e }) => {
      if (!active) return;
      if (e) setError(e.message);
      else setRows((data ?? []) as Entry[]);
    });
    return () => {
      active = false;
    };
  }, [type, page]);

  return (
    <>
      <PageHeader title="Audit log" description="Who changed what, and when. Append-only: no one can edit or delete an entry." />
      <div className="mb-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Filter">
        {TYPES.map((t) => (
          <button
            key={t.value}
            role="radio"
            aria-checked={type === t.value}
            onClick={() => {
              setType(t.value);
              setPage(0);
            }}
            className={cn('min-h-9 rounded-full border px-3 text-sm', type === t.value ? 'border-primary bg-primary/10 font-semibold text-primary' : 'border-border')}
          >
            {t.label}
          </button>
        ))}
      </div>
      {error ? <ErrorNote message={error} /> : null}
      {!rows && !error ? <Loading /> : null}
      {rows ? (
        <>
          <div className="overflow-x-auto rounded-card border border-border bg-surface">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">When</th>
                  <th className="px-4 py-3 font-semibold">What</th>
                  <th className="px-4 py-3 font-semibold">Change</th>
                  <th className="px-4 py-3 font-semibold">By</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-muted">
                      Nothing recorded yet.
                    </td>
                  </tr>
                ) : null}
                {rows.map((e) => (
                  <tr key={e.id} className="border-b border-border align-top last:border-0">
                    <td className="whitespace-nowrap px-4 py-3">{formatDateTime(e.created_at)}</td>
                    <td className="px-4 py-3">
                      <Badge>{e.entity_type}</Badge>
                      <span className="block pt-1 text-xs text-muted">{e.entity_id}</span>
                    </td>
                    <td className="px-4 py-3">
                      {describe(e)}
                      {e.reason ? <span className="block text-xs text-muted">Reason: {e.reason}</span> : null}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">{e.actor_id ? e.actor_id.slice(0, 8) : 'system'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
              Newer
            </Button>
            <Button variant="outline" disabled={rows.length < PAGE} onClick={() => setPage(page + 1)}>
              Older
            </Button>
          </div>
        </>
      ) : null}
    </>
  );
};

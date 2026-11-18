import { ArrowLeft, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/Button';
import { useToast } from '@/components/Toast';
import { formatInr } from '@/lib/cn';
import { supabase } from '@/lib/supabase';
import { normaliseData, videoTitle } from '@/templates/data';
import { getTemplate } from '@/templates/registry';
import { atLeast, useAdmin } from './access';
import { Badge, Card, ErrorNote, formatDate, formatDateTime, inputCls, Loading, PageHeader } from './ui';

type CustomerRow = {
  user_id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  videos: number;
  paid_orders: number;
  lifetime_spend: number;
  total: number;
};

const PAGE = 50;

// ---------------------------------------------------------------------------
// List + search
// ---------------------------------------------------------------------------

export const CustomersPage = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const page = Math.max(0, Number(params.get('page') ?? 0) || 0);
  const [draft, setDraft] = useState(q);
  const [rows, setRows] = useState<CustomerRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setRows(null);
    supabase!.rpc('admin_customers', { p_search: q, p_limit: PAGE, p_offset: page * PAGE }).then(({ data, error: e }) => {
      if (!active) return;
      if (e) setError(e.message);
      else setRows((data ?? []) as CustomerRow[]);
    });
    return () => {
      active = false;
    };
  }, [q, page]);

  const total = rows?.[0]?.total ?? 0;

  return (
    <>
      <PageHeader title="Customers" description="Search by email, account id, order id or Razorpay payment id. Guests are not listed: their drafts stay in their own browser." />
      <form
        className="mb-4 flex max-w-xl gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setParams(draft.trim() ? { q: draft.trim() } : {});
        }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input className={`${inputCls} pl-9`} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="name@example.com, order id…" aria-label="Search customers" />
        </div>
        <Button type="submit">Search</Button>
      </form>
      {error ? <ErrorNote message={error} /> : null}
      {!rows && !error ? <Loading /> : null}
      {rows ? (
        rows.length === 0 ? (
          <p className="text-muted">{q ? 'No customer matches that search.' : 'No customers yet.'}</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-card border border-border bg-surface">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Signed up</th>
                    <th className="px-4 py-3 font-semibold">Last sign-in</th>
                    <th className="px-4 py-3 text-right font-semibold">Videos</th>
                    <th className="px-4 py-3 text-right font-semibold">Paid orders</th>
                    <th className="px-4 py-3 text-right font-semibold">Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.user_id} className="border-b border-border last:border-0 hover:bg-background">
                      <td className="px-4 py-3">
                        <Link to={`/admin/customers/${r.user_id}`} className="font-semibold text-primary hover:underline">
                          {r.email}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{formatDate(r.created_at)}</td>
                      <td className="px-4 py-3">{formatDateTime(r.last_sign_in_at)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{r.videos}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{r.paid_orders}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatInr(r.lifetime_spend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-muted">
              <span>
                {page * PAGE + 1}–{page * PAGE + rows.length} of {total}
              </span>
              <span className="flex gap-2">
                <Button variant="outline" disabled={page === 0} onClick={() => setParams({ ...(q ? { q } : {}), page: String(page - 1) })}>
                  Previous
                </Button>
                <Button variant="outline" disabled={(page + 1) * PAGE >= total} onClick={() => setParams({ ...(q ? { q } : {}), page: String(page + 1) })}>
                  Next
                </Button>
              </span>
            </div>
          </>
        )
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------------------
// One customer
// ---------------------------------------------------------------------------

type Account = { user_id: string; email: string; created_at: string; last_sign_in_at: string | null; provider: string };
type Video = { id: string; template_id: string; data: unknown; status: string; share_token: string | null; created_at: string; updated_at: string };
type Order = { id: string; amount: number; status: string; source: string; created_at: string; paid_at: string | null; razorpay_payment_id: string | null; refunded_amount: number };
type Note = { id: string; body: string; created_by: string; created_at: string };

export const CustomerPage = () => {
  const { id } = useParams();
  const { role } = useAdmin();
  const toast = useToast();
  const canSupport = atLeast(role, 'support');
  const [account, setAccount] = useState<Account | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [slugById, setSlugById] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    const { data, error: e } = await supabase!.rpc('admin_customer', { p_user_id: id });
    if (e) return setError(e.code === '42501' ? 'Your role cannot open customer details.' : e.message);
    const acc = (data as Account[] | null)?.[0];
    if (!acc) return setError('Customer not found.');
    setAccount(acc);
    const [v, o, n, t] = await Promise.all([
      supabase!.from('user_videos').select('id, template_id, data, status, share_token, created_at, updated_at').eq('user_id', id!).order('updated_at', { ascending: false }),
      supabase!.from('orders').select('id, amount, status, source, created_at, paid_at, razorpay_payment_id, refunded_amount').eq('user_id', id!).order('created_at', { ascending: false }),
      supabase!.from('customer_notes').select('id, body, created_by, created_at').eq('user_id', id!).order('created_at', { ascending: false }),
      supabase!.from('templates').select('id, slug'),
    ]);
    setVideos((v.data ?? []) as Video[]);
    setOrders((o.data ?? []) as Order[]);
    setNotes((n.data ?? []) as Note[]);
    setSlugById(Object.fromEntries(((t.data ?? []) as Array<{ id: string; slug: string }>).map((x) => [x.id, x.slug])));
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const addNote = async () => {
    const body = note.trim();
    if (!body) return;
    const { error: e } = await supabase!.from('customer_notes').insert({ user_id: id, body });
    if (e) return toast({ message: e.message, tone: 'error' });
    setNote('');
    toast({ message: 'Note added.' });
    void load();
  };

  if (error) return <ErrorNote message={error} />;
  if (!account) return <Loading />;

  const titleOf = (v: Video) => {
    const def = getTemplate(slugById[v.template_id]);
    return def ? videoTitle(def, normaliseData(def, v.data as never)) : 'Unknown template';
  };

  return (
    <>
      <Link to="/admin/customers" className="mb-3 inline-flex min-h-10 items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Customers
      </Link>
      <PageHeader title={account.email} description={`Signed up ${formatDate(account.created_at)} · last sign-in ${formatDateTime(account.last_sign_in_at)} · ${account.provider}`} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card title={`Videos (${videos.length})`}>
            {videos.length === 0 ? <p className="text-sm text-muted">No saved videos.</p> : null}
            <ul className="divide-y divide-border">
              {videos.map((v) => (
                <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                  <span>
                    <span className="font-semibold">{titleOf(v)}</span>
                    <span className="block text-xs text-muted">
                      {slugById[v.template_id] ?? '—'} · edited {formatDateTime(v.updated_at)}
                    </span>
                  </span>
                  <span className="flex gap-1">
                    <Badge tone={v.status === 'draft' ? 'neutral' : 'good'}>{v.status}</Badge>
                    {v.share_token ? <Badge tone="warn">share link on</Badge> : null}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <Card title={`Orders (${orders.length})`}>
            {orders.length === 0 ? <p className="text-sm text-muted">No orders.</p> : null}
            <ul className="divide-y divide-border">
              {orders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                  <span>
                    <span className="font-semibold tabular-nums">{formatInr(o.amount)}</span>
                    {o.refunded_amount ? <span className="ml-2 text-xs text-error">refunded {formatInr(o.refunded_amount)}</span> : null}
                    <span className="block text-xs text-muted">
                      {formatDateTime(o.paid_at ?? o.created_at)} · {o.source}
                      {o.razorpay_payment_id ? ` · ${o.razorpay_payment_id}` : ''}
                    </span>
                  </span>
                  <Badge tone={o.status === 'paid' ? 'good' : o.status === 'failed' ? 'bad' : 'neutral'}>{o.status}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card title="Support notes">
          {canSupport ? (
            <div className="mb-4">
              <textarea className={`${inputCls} h-20 py-2`} value={note} onChange={(e) => setNote(e.target.value)} maxLength={4000} placeholder="What happened, what you did" aria-label="New note" />
              <Button className="mt-2 w-full" variant="outline" onClick={addNote} disabled={!note.trim()}>
                Add note
              </Button>
            </div>
          ) : null}
          {notes.length === 0 ? <p className="text-sm text-muted">No notes yet.</p> : null}
          <ul className="space-y-3 text-sm">
            {notes.map((n) => (
              <li key={n.id} className="border-b border-border pb-3 last:border-0">
                <p className="whitespace-pre-wrap">{n.body}</p>
                <span className="text-xs text-muted">{formatDateTime(n.created_at)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
};

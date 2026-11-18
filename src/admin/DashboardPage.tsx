import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useSiteSettings } from '@/lib/siteSettings';
import { supabase } from '@/lib/supabase';
import { Card, ErrorNote, formatPaise, Loading, PageHeader } from './ui';

/** Money from the server is in paise. */

type Period = { new_customers: number; drafts_created: number; share_links: number; paid_orders: number; gross_revenue: number; refunds: number };
type Dashboard = {
  current: Period;
  previous: Period;
  totals: { customers: number; videos: number; published_templates: number };
  by_template: Array<{ slug: string; name: string; is_active: boolean; drafts: number; paid_orders: number; revenue: number }>;
};

const RANGES = [
  { days: 1, label: 'Today' },
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
] as const;

/** Start of today in India time, as an instant. */
const startOfTodayIst = () => {
  const ist = new Date(Date.now() + 5.5 * 3600e3);
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) - 5.5 * 3600e3);
};

const Change = ({ now, before }: { now: number; before: number }) => {
  if (before === 0 && now === 0) return <span className="text-xs text-muted">no change</span>;
  if (before === 0) return <span className="text-xs text-success">new</span>;
  const pct = Math.round(((now - before) / before) * 100);
  return <span className={cn('text-xs font-semibold', pct > 0 ? 'text-success' : pct < 0 ? 'text-error' : 'text-muted')}>{pct > 0 ? '+' : ''}{pct}% vs previous</span>;
};

const Kpi = ({ label, now, before, money }: { label: string; now: number; before: number; money?: boolean }) => (
  <div className="rounded-card border border-border bg-surface p-4">
    <p className="text-sm text-muted">{label}</p>
    <p className="mt-1 font-display text-3xl font-semibold tabular-nums">{money ? formatPaise(now) : now.toLocaleString('en-IN')}</p>
    <Change now={now} before={before} />
  </div>
);

export const DashboardPage = () => {
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const testPayments = useSiteSettings().test_payments.enabled;

  useEffect(() => {
    let active = true;
    setData(null);
    setError(null);
    const to = new Date();
    const from = days === 1 ? startOfTodayIst() : new Date(startOfTodayIst().getTime() - (days - 1) * 864e5);
    supabase!.rpc('admin_dashboard', { p_from: from.toISOString(), p_to: to.toISOString() }).then(({ data: d, error: e }) => {
      if (!active) return;
      if (e) setError(e.message);
      else setData(d as Dashboard);
    });
    return () => {
      active = false;
    };
  }, [days]);

  const c = data?.current;
  const p = data?.previous;
  const conversion = (x?: Period) => (x && x.drafts_created ? Math.round((x.paid_orders / x.drafts_created) * 1000) / 10 : 0);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="India time. Each number is compared with the period of the same length just before. Net revenue is payments in the period minus refunds made in it. Admin accounts are not counted as customers."
        actions={
          <div className="flex rounded-button border border-border bg-surface p-0.5" role="radiogroup" aria-label="Date range">
            {RANGES.map((r) => (
              <button
                key={r.days}
                role="radio"
                aria-checked={days === r.days}
                onClick={() => setDays(r.days)}
                className={cn('min-h-9 rounded-[10px] px-3 text-sm font-semibold', days === r.days ? 'bg-primary text-white' : 'text-muted')}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />
      {error ? <ErrorNote message={error} /> : null}
      {!data && !error ? <Loading /> : null}
      {c && p && data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6">
            <Kpi label="Net revenue" now={c.gross_revenue - c.refunds} before={p.gross_revenue - p.refunds} money />
            <Kpi label="Paid orders" now={c.paid_orders} before={p.paid_orders} />
            <Kpi label="Drafts created" now={c.drafts_created} before={p.drafts_created} />
            <Kpi label="Previews shared" now={c.share_links} before={p.share_links} />
            <Kpi label="New customers" now={c.new_customers} before={p.new_customers} />
            <div className="rounded-card border border-border bg-surface p-4">
              <p className="text-sm text-muted">Conversion</p>
              <p className="mt-1 font-display text-3xl font-semibold tabular-nums">{conversion(c)}%</p>
              <span className="text-xs text-muted">paid orders / drafts in the period</span>
            </div>
          </div>

          {testPayments ? (
            <p className="rounded-button bg-accent/15 p-3 text-sm">
              Test payments are on (Settings): revenue and orders include test payments, which charge no money.
            </p>
          ) : null}
          {c.paid_orders === 0 && p.paid_orders === 0 && !testPayments ? (
            <p className="rounded-button bg-accent/10 p-3 text-sm">Revenue, orders and conversion fill in once online payment launches (Phase 2 of the plan).</p>
          ) : null}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Card title="By template">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-muted">
                    <tr>
                      <th className="py-2 font-semibold">Template</th>
                      <th className="py-2 text-right font-semibold">Drafts</th>
                      <th className="py-2 text-right font-semibold">Paid orders</th>
                      <th className="py-2 text-right font-semibold">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.by_template.map((t) => (
                      <tr key={t.slug} className="border-t border-border">
                        <td className="py-2">
                          <Link to={`/admin/templates/${t.slug}`} className="text-primary hover:underline">
                            {t.name}
                          </Link>
                          {t.is_active ? null : <span className="ml-2 text-xs text-muted">hidden</span>}
                        </td>
                        <td className="py-2 text-right tabular-nums">{t.drafts}</td>
                        <td className="py-2 text-right tabular-nums">{t.paid_orders}</td>
                        <td className="py-2 text-right tabular-nums">{formatPaise(t.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <Card title="All time">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Customers (admins excluded)</dt>
                  <dd className="font-semibold tabular-nums">{data.totals.customers.toLocaleString('en-IN')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Saved videos (signed-in)</dt>
                  <dd className="font-semibold tabular-nums">{data.totals.videos.toLocaleString('en-IN')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Published templates</dt>
                  <dd className="font-semibold tabular-nums">{data.totals.published_templates}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-muted">Guests' drafts stay in their own browser and are not counted.</p>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
};

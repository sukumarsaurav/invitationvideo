import { Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';
import { atLeast, useAdmin } from './access';
import { Badge, Card, ErrorNote, Field, formatDate, inputCls, Loading, PageHeader, useUnsavedGuard } from './ui';

type Coupon = {
  id: string;
  code: string;
  description: string;
  kind: 'percent' | 'flat';
  value: number;
  max_redemptions: number | null;
  redeemed_count: number;
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
  created_at: string;
};

const COLUMNS = 'id, code, description, kind, value, max_redemptions, redeemed_count, starts_at, ends_at, active, created_at';

const discountLabel = (c: Pick<Coupon, 'kind' | 'value'>) => (c.kind === 'percent' ? `${c.value}% off` : `₹${c.value} off`);

/** What a customer would see if they typed the code now. */
const state = (c: Coupon): { label: string; tone: 'good' | 'warn' | 'bad' | 'neutral' } => {
  const now = Date.now();
  if (!c.active) return { label: 'Off', tone: 'neutral' };
  if (c.ends_at && new Date(c.ends_at).getTime() <= now) return { label: 'Expired', tone: 'bad' };
  if (c.max_redemptions !== null && c.redeemed_count >= c.max_redemptions) return { label: 'Used up', tone: 'bad' };
  if (c.starts_at && new Date(c.starts_at).getTime() > now) return { label: 'Scheduled', tone: 'warn' };
  return { label: 'Live', tone: 'good' };
};

const EMPTY = { code: '', kind: 'percent' as Coupon['kind'], value: '', max: '', ends: '', description: '' };

/**
 * Coupon codes customers type on the download page. Prices and checks are worked out by the
 * database (invites._quote), so a code works the same for Razorpay and test payments. Coupons are
 * never deleted (orders point at them): switch one off instead. Every change is in the audit log.
 */
export const CouponsPage = () => {
  const { role } = useAdmin();
  const canEdit = atLeast(role, 'manager');
  const toast = useToast();
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const dirty = JSON.stringify(form) !== JSON.stringify(EMPTY);
  useUnsavedGuard(dirty);

  const load = useCallback(async () => {
    const { data, error: e } = await supabase!.from('coupons').select(COLUMNS).order('created_at', { ascending: false });
    if (e) setError(e.message);
    else setCoupons(data as Coupon[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const value = Number(form.value);
  const max = form.max ? Number(form.max) : null;
  const invalid =
    form.code.length < 3
      ? 'Codes need 3 to 24 letters, digits, - or _.'
      : !Number.isInteger(value) || value < 1 || (form.kind === 'percent' && value > 100)
        ? form.kind === 'percent'
          ? 'Percent off must be a whole number from 1 to 100.'
          : 'Rupees off must be a whole number of at least 1.'
        : max !== null && (!Number.isInteger(max) || max < 1)
          ? 'Uses must be a whole number of at least 1, or empty for no limit.'
          : null;

  const create = async () => {
    if (invalid) return toast({ message: invalid, tone: 'error' });
    setBusy(true);
    const { data, error: e } = await supabase!
      .from('coupons')
      .insert({
        code: form.code,
        kind: form.kind,
        value,
        max_redemptions: max,
        // The last day counts in full, Indian time.
        ends_at: form.ends ? `${form.ends}T23:59:59+05:30` : null,
        description: form.description.trim(),
      })
      .select(COLUMNS)
      .single();
    setBusy(false);
    if (e) {
      toast({ message: e.code === '23505' ? `${form.code} already exists.` : e.message, tone: 'error' });
      return;
    }
    setCoupons((cs) => [data as Coupon, ...(cs ?? [])]);
    setForm(EMPTY);
    toast({ message: `${form.code} created.` });
  };

  const setActive = async (c: Coupon, active: boolean) => {
    setBusyId(c.id);
    const { data, error: e } = await supabase!.from('coupons').update({ active }).eq('id', c.id).select(COLUMNS).single();
    setBusyId(null);
    if (e) return toast({ message: e.message, tone: 'error' });
    setCoupons((cs) => cs?.map((x) => (x.id === c.id ? (data as Coupon) : x)) ?? null);
    toast({ message: active ? `${c.code} switched on.` : `${c.code} switched off.` });
  };

  return (
    <div>
      <PageHeader
        title="Coupons"
        description="Codes customers type on the download page. A 100% coupon makes the video free. Coupons can't be deleted because orders refer to them; switch one off instead."
      />

      {canEdit ? (
        <Card title="New coupon" className="mb-6">
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              void create();
            }}
          >
            <Field label="Code" hint="Customers can type it in any case.">
              <input
                className={`${inputCls} uppercase tracking-wider`}
                value={form.code}
                maxLength={24}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') })}
                placeholder="DIWALI20"
                autoComplete="off"
              />
            </Field>
            <Field label="Discount">
              <div className="flex gap-2">
                <select className={`${inputCls} w-36`} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as Coupon['kind'] })}>
                  <option value="percent">Percent off</option>
                  <option value="flat">Rupees off</option>
                </select>
                <input
                  className={inputCls}
                  inputMode="numeric"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value.replace(/\D/g, '') })}
                  placeholder={form.kind === 'percent' ? '20' : '50'}
                  aria-label={form.kind === 'percent' ? 'Percent off' : 'Rupees off'}
                />
              </div>
            </Field>
            <Field label="Limit (optional)" hint="Paid orders allowed in total. Empty: no limit.">
              <input className={inputCls} inputMode="numeric" value={form.max} onChange={(e) => setForm({ ...form, max: e.target.value.replace(/\D/g, '') })} placeholder="100" />
            </Field>
            <Field label="Last day (optional)" hint="Works until the end of this day, Indian time.">
              <input className={inputCls} type="date" value={form.ends} onChange={(e) => setForm({ ...form, ends: e.target.value })} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Note for admins (optional)">
                <input className={inputCls} maxLength={140} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Diwali offer on Instagram" />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={busy || !dirty}>
                <Plus className="size-4" /> Create coupon
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {error ? <ErrorNote message={error} /> : coupons === null ? <Loading /> : coupons.length === 0 ? (
        <p className="text-sm text-muted">No coupons yet.</p>
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {coupons.map((c) => {
              const s = state(c);
              return (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-semibold tracking-wider">{c.code}</span>
                      <Badge tone={s.tone}>{s.label}</Badge>
                    </p>
                    <p className="mt-0.5 text-sm text-muted">
                      {discountLabel(c)} · used {c.redeemed_count}
                      {c.max_redemptions !== null ? ` of ${c.max_redemptions}` : ''}
                      {c.ends_at ? ` · until ${formatDate(c.ends_at)}` : ''}
                    </p>
                    {c.description ? <p className="text-xs text-muted">{c.description}</p> : null}
                  </div>
                  {canEdit ? (
                    <Button variant="outline" className="min-h-10 px-4 text-sm" disabled={busyId === c.id} onClick={() => void setActive(c, !c.active)}>
                      {c.active ? 'Switch off' : 'Switch on'}
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
};

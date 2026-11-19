import { Save } from 'lucide-react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/Button';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';
import { isSiteLink, loadSiteSettings, sanitizeSettings, type SiteSettings } from '@/lib/siteSettings';
import { atLeast, useAdmin } from './access';
import { Card, ErrorNote, Field, formatDateTime, inputCls, Loading, PageHeader, useUnsavedGuard } from './ui';

type Key = keyof SiteSettings;
type Row = { key: Key; value: SiteSettings[Key]; updated_at: string };

/** Settings as the store reads them: a row's value laid over the code defaults, field by field. */
const fromRow = <K extends Key>(k: K, row?: Row): SiteSettings[K] => sanitizeSettings(row ? [{ key: k, value: row.value }] : [])[k];

/**
 * Each setting saves on its own, so one change can't overwrite another admin's edit to a different
 * one; and only if nobody else saved this one since it was loaded here.
 */
const SettingCard = <K extends Key>({
  title,
  description,
  settingKey,
  row,
  canEdit,
  validate,
  onDirtyChange,
  children,
}: {
  title: string;
  description: string;
  settingKey: K;
  row?: Row;
  canEdit: boolean;
  /** An error message for a value that can't be saved, or null. */
  validate?: (v: SiteSettings[K]) => string | null;
  onDirtyChange: (key: Key, dirty: boolean) => void;
  children: (value: SiteSettings[K], set: (v: SiteSettings[K]) => void) => ReactNode;
}) => {
  const toast = useToast();
  const [value, setValue] = useState(() => fromRow(settingKey, row));
  const [saved, setSaved] = useState(() => fromRow(settingKey, row));
  const [updatedAt, setUpdatedAt] = useState(row?.updated_at);
  const [conflict, setConflict] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(value) !== JSON.stringify(saved);
  const invalid = validate?.(value) ?? null;

  useEffect(() => {
    onDirtyChange(settingKey, dirty);
  }, [dirty, settingKey, onDirtyChange]);

  const save = async () => {
    if (invalid) return toast({ message: invalid, tone: 'error' });
    setBusy(true);
    let q = supabase!.from('site_settings').update({ value }).eq('key', settingKey);
    if (updatedAt) q = q.eq('updated_at', updatedAt);
    const { data, error } = await q.select('key, value, updated_at').maybeSingle();
    if (error) {
      setBusy(false);
      return toast({ message: error.message.includes('site_settings_value_valid') ? 'Not saved: check the values in this setting.' : error.message, tone: 'error' });
    }
    if (!data) {
      // Nothing updated: someone saved in between, or this role can't change settings (RLS).
      const { data: latest } = await supabase!.from('site_settings').select('key, value, updated_at').eq('key', settingKey).maybeSingle();
      setBusy(false);
      const fresh = latest as Row | null;
      if (fresh && fresh.updated_at !== updatedAt) setConflict(fresh);
      else toast({ message: 'Not saved: your role cannot change settings.', tone: 'error' });
      return;
    }
    setBusy(false);
    const next = data as Row;
    setSaved(value);
    setUpdatedAt(next.updated_at);
    setConflict(null);
    toast({ message: `${title} saved. Visitors see it on their next page load.` });
    void loadSiteSettings(true);
  };

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-sm text-muted">{description}</p>
        </div>
        {canEdit ? (
          <Button onClick={save} disabled={busy || !dirty || Boolean(invalid)} className="min-h-10 px-4">
            <Save className="size-4" /> Save
          </Button>
        ) : null}
      </div>
      {conflict ? (
        <div className="mb-3 rounded-button border border-error/30 bg-error/10 p-3 text-sm">
          <p className="font-semibold text-error">Not saved: someone else changed this setting at {formatDateTime(conflict.updated_at)}.</p>
          <Button
            variant="outline"
            className="mt-2 min-h-10"
            onClick={() => {
              const theirs = fromRow(settingKey, conflict);
              setValue(theirs);
              setSaved(theirs);
              setUpdatedAt(conflict.updated_at);
              setConflict(null);
            }}
          >
            Load their version
          </Button>
        </div>
      ) : null}
      <fieldset disabled={!canEdit} className="grid gap-4">
        {children(value, setValue)}
      </fieldset>
      {invalid && dirty ? (
        <p role="alert" className="mt-2 text-sm text-error">
          {invalid}
        </p>
      ) : null}
      <p className="mt-3 text-xs text-muted">Last changed {formatDateTime(updatedAt)}</p>
    </Card>
  );
};

const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
  <label className="flex min-h-11 items-center gap-3">
    <input type="checkbox" className="size-5 accent-[var(--color-primary)]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span className="text-sm font-semibold">{label}</span>
  </label>
);

export const SettingsPage = () => {
  const { role } = useAdmin();
  const canEdit = atLeast(role, 'manager');
  const [rows, setRows] = useState<Record<string, Row> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dirtyKeys, setDirtyKeys] = useState<ReadonlySet<Key>>(new Set());
  const onDirtyChange = useCallback((key: Key, dirty: boolean) => {
    setDirtyKeys((prev) => {
      if (prev.has(key) === dirty) return prev;
      const next = new Set(prev);
      if (dirty) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);
  useUnsavedGuard(dirtyKeys.size > 0);

  useEffect(() => {
    supabase!
      .from('site_settings')
      .select('key, value, updated_at')
      .then(({ data, error: e }) => {
        if (e) setError(e.message);
        else setRows(Object.fromEntries(((data ?? []) as Row[]).map((r) => [r.key, r])));
      });
  }, []);

  if (error) return <ErrorNote message={error} />;
  if (!rows) return <Loading />;

  const common = { canEdit, onDirtyChange };

  return (
    <>
      <PageHeader title="Settings" description="Site content and switches. Changes reach visitors on their next page load, and every save is recorded in the audit log." />
      {!canEdit ? <p className="mb-4 rounded-button bg-background p-3 text-sm text-muted">Your role can view settings but not change them.</p> : null}
      <div className="grid max-w-3xl gap-4">
        <SettingCard title="Announcement bar" description="The maroon strip above the header." settingKey="announcement"
          row={rows.announcement}
          {...common}
          validate={(v) => (v.enabled && !v.text.trim() ? 'Add the announcement text, or turn it off.' : v.link && !isSiteLink(v.link) ? 'The link must be a page on this site, starting with “/”, e.g. /templates.' : null)}
        >
          {(v, set) => (
            <>
              <Toggle checked={v.enabled} onChange={(enabled) => set({ ...v, enabled })} label="Show the announcement" />
              <Field label="Text" hint={`Keep it short: it is one line on phones (${v.text.length} characters).`}>
                <input className={inputCls} value={v.text} onChange={(e) => set({ ...v, text: e.target.value })} maxLength={80} />
              </Field>
              <Field label="Link (optional)" hint="A page on this site, e.g. /templates or /tags/royal.">
                <input className={inputCls} value={v.link ?? ''} onChange={(e) => set({ ...v, link: e.target.value.trim() || null })} placeholder="/templates" />
              </Field>
            </>
          )}
        </SettingCard>

        <SettingCard title="Support WhatsApp" description="Shown as “Help on WhatsApp” in the menu and footer." settingKey="support_whatsapp"
          row={rows.support_whatsapp}
          {...common}
          validate={(v) => (v.number && (v.number.length < 10 || v.number.length > 15) ? 'Enter 10 to 15 digits, with the country code (e.g. 919876543210).' : null)}
        >
          {(v, set) => (
            <Field label="Number" hint="Digits with country code, e.g. 919876543210. Empty hides the link.">
              <input className={inputCls} inputMode="numeric" value={v.number} onChange={(e) => set({ number: e.target.value.replace(/\D/g, '') })} maxLength={15} />
            </Field>
          )}
        </SettingCard>

        <SettingCard title="Maintenance notice" description="A gold banner at the top of every store page." settingKey="maintenance"
          row={rows.maintenance}
          {...common}
          validate={(v) => (v.enabled && !v.text.trim() ? 'Add the notice text, or turn it off.' : null)}
        >
          {(v, set) => (
            <>
              <Toggle checked={v.enabled} onChange={(enabled) => set({ ...v, enabled })} label="Show the notice" />
              <Field label="Text">
                <input className={inputCls} value={v.text} onChange={(e) => set({ ...v, text: e.target.value })} maxLength={140} placeholder="Downloads are slow right now; we're on it." />
              </Field>
            </>
          )}
        </SettingCard>

        <SettingCard title="Payments" description="Pause checkout during a payment-provider incident. Takes effect when online payment launches (Phase 2)." settingKey="payments_enabled" row={rows.payments_enabled} {...common}>
          {(v, set) => (
            <>
              <Toggle checked={v.enabled} onChange={(enabled) => set({ ...v, enabled })} label="Accept payments" />
              <Field label="Message while paused">
                <input className={inputCls} value={v.message} onChange={(e) => set({ ...v, message: e.target.value })} maxLength={140} placeholder="Payments are paused for a few minutes. Your video is saved." />
              </Field>
            </>
          )}
        </SettingCard>
        <SettingCard
          title="Test payments"
          description="On: Download’s “Pay” button completes a test payment that charges nothing and records a paid order (source “test”), with coupons applied as usual. Off: customers pay with Razorpay. Turn this off once the Razorpay keys are set up (see README → Payments)."
          settingKey="test_payments"
          row={rows.test_payments}
          {...common}
        >
          {(v, set) => <Toggle checked={v.enabled} onChange={(enabled) => set({ enabled })} label="Test payments on" />}
        </SettingCard>
      </div>
    </>
  );
};

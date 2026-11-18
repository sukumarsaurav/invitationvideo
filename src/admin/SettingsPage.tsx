import { Save } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/Button';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';
import { DEFAULT_SETTINGS, loadSiteSettings, type SiteSettings } from '@/lib/siteSettings';
import { atLeast, useAdmin } from './access';
import { Card, ErrorNote, Field, formatDateTime, inputCls, Loading, PageHeader } from './ui';

type Key = keyof SiteSettings;
type Row = { key: Key; value: SiteSettings[Key]; updated_at: string };

/** Each setting saves on its own, so one change can't overwrite another admin's edit to a different one. */
const SettingCard = <K extends Key>({
  title,
  description,
  settingKey,
  initial,
  updatedAt,
  canEdit,
  children,
}: {
  title: string;
  description: string;
  settingKey: K;
  initial: SiteSettings[K];
  updatedAt?: string;
  canEdit: boolean;
  children: (value: SiteSettings[K], set: (v: SiteSettings[K]) => void) => ReactNode;
}) => {
  const toast = useToast();
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(value) !== JSON.stringify(saved);

  const save = async () => {
    setBusy(true);
    const { data, error } = await supabase!.from('site_settings').update({ value }).eq('key', settingKey).select('key').maybeSingle();
    setBusy(false);
    if (error || !data) return toast({ message: error?.message ?? 'Not saved: your role cannot change settings.', tone: 'error' });
    setSaved(value);
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
          <Button onClick={save} disabled={busy || !dirty} className="min-h-10 px-4">
            <Save className="size-4" /> Save
          </Button>
        ) : null}
      </div>
      <fieldset disabled={!canEdit} className="grid gap-4">
        {children(value, setValue)}
      </fieldset>
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

  const initial = <K extends Key>(k: K): SiteSettings[K] => ({ ...DEFAULT_SETTINGS[k], ...((rows[k]?.value ?? {}) as object) }) as SiteSettings[K];

  return (
    <>
      <PageHeader title="Settings" description="Site content and switches. Changes reach visitors on their next page load, and every save is recorded in the audit log." />
      {!canEdit ? <p className="mb-4 rounded-button bg-background p-3 text-sm text-muted">Your role can view settings but not change them.</p> : null}
      <div className="grid max-w-3xl gap-4">
        <SettingCard title="Announcement bar" description="The maroon strip above the header." settingKey="announcement" initial={initial('announcement')} updatedAt={rows.announcement?.updated_at} canEdit={canEdit}>
          {(v, set) => (
            <>
              <Toggle checked={v.enabled} onChange={(enabled) => set({ ...v, enabled })} label="Show the announcement" />
              <Field label="Text" hint={`Keep it short: it is one line on phones (${v.text.length} characters).`}>
                <input className={inputCls} value={v.text} onChange={(e) => set({ ...v, text: e.target.value })} maxLength={80} />
              </Field>
              <Field label="Link (optional)" hint="A page on this site, e.g. /templates or /tags/royal.">
                <input className={inputCls} value={v.link ?? ''} onChange={(e) => set({ ...v, link: e.target.value || undefined })} placeholder="/templates" />
              </Field>
            </>
          )}
        </SettingCard>

        <SettingCard title="Support WhatsApp" description="Shown as “Help on WhatsApp” in the menu and footer." settingKey="support_whatsapp" initial={initial('support_whatsapp')} updatedAt={rows.support_whatsapp?.updated_at} canEdit={canEdit}>
          {(v, set) => (
            <Field label="Number" hint="Digits with country code, e.g. 919876543210. Empty hides the link.">
              <input className={inputCls} inputMode="numeric" value={v.number} onChange={(e) => set({ number: e.target.value.replace(/\D/g, '') })} maxLength={15} />
            </Field>
          )}
        </SettingCard>

        <SettingCard title="Maintenance notice" description="A gold banner at the top of every store page." settingKey="maintenance" initial={initial('maintenance')} updatedAt={rows.maintenance?.updated_at} canEdit={canEdit}>
          {(v, set) => (
            <>
              <Toggle checked={v.enabled} onChange={(enabled) => set({ ...v, enabled })} label="Show the notice" />
              <Field label="Text">
                <input className={inputCls} value={v.text} onChange={(e) => set({ ...v, text: e.target.value })} maxLength={140} placeholder="Downloads are slow right now; we're on it." />
              </Field>
            </>
          )}
        </SettingCard>

        <SettingCard title="Payments" description="Pause checkout during a payment-provider incident. Takes effect when online payment launches (Phase 2)." settingKey="payments_enabled" initial={initial('payments_enabled')} updatedAt={rows.payments_enabled?.updated_at} canEdit={canEdit}>
          {(v, set) => (
            <>
              <Toggle checked={v.enabled} onChange={(enabled) => set({ ...v, enabled })} label="Accept payments" />
              <Field label="Message while paused">
                <input className={inputCls} value={v.message} onChange={(e) => set({ ...v, message: e.target.value })} maxLength={140} placeholder="Payments are paused for a few minutes. Your video is saved." />
              </Field>
            </>
          )}
        </SettingCard>
      </div>
    </>
  );
};

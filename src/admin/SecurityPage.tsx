import { Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';
import { useAdmin } from './access';
import { IDLE_MINUTES } from './idle';
import { TotpEnroll } from './MfaScreen';
import { Badge, Card, ErrorNote, Field, formatDateTime, inputCls, Loading, PageHeader } from './ui';

type Factor = { id: string; friendly_name?: string; created_at: string };

/**
 * The signed-in admin's own two-step sign-in. Supabase has no recovery codes, so a second
 * authenticator (another phone, or a password manager) is the way back in if a phone is lost.
 */
export const SecurityPage = () => {
  const { email } = useAdmin();
  const toast = useToast();
  const [factors, setFactors] = useState<Factor[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [name, setName] = useState('Backup authenticator');

  const load = useCallback(async () => {
    const { data, error: e } = await supabase!.auth.mfa.listFactors();
    if (e) return setError(e.message);
    setFactors(data.totp.filter((f) => f.status === 'verified'));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (f: Factor) => {
    if (!factors || factors.length < 2) return;
    if (!window.confirm(`Remove "${f.friendly_name ?? 'Authenticator'}"? Its codes stop working straight away.`)) return;
    const { error: e } = await supabase!.auth.mfa.unenroll({ factorId: f.id });
    if (e) return toast({ message: e.message, tone: 'error' });
    toast({ message: 'Authenticator removed.' });
    void load();
  };

  if (error) return <ErrorNote message={error} />;
  if (!factors) return <Loading />;

  return (
    <>
      <PageHeader title="Security" description={`Two-step sign-in for ${email}.`} />
      <div className="grid max-w-3xl gap-4">
        {factors.length < 2 ? (
          <ErrorNote message="You have one authenticator. If you lose that phone you are locked out of the admin panel: add a backup below (a second phone, or a password manager such as 1Password)." />
        ) : null}

        <Card title="Authenticators">
          <ul className="divide-y divide-border">
            {factors.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span>
                  <span className="font-semibold">{f.friendly_name ?? 'Authenticator'}</span>
                  <span className="block text-xs text-muted">Added {formatDateTime(f.created_at)}</span>
                </span>
                {factors.length > 1 ? (
                  <Button variant="ghost" className="min-h-9 px-3 text-error" onClick={() => void remove(f)}>
                    <Trash2 className="size-4" /> Remove
                  </Button>
                ) : (
                  <Badge>Only one</Badge>
                )}
              </li>
            ))}
          </ul>

          {adding ? (
            <div className="mt-4 border-t border-border pt-4">
              <p className="font-semibold">Add "{adding}"</p>
              <TotpEnroll
                name={adding}
                onDone={() => {
                  setAdding(null);
                  toast({ message: 'Backup authenticator added.' });
                  void load();
                }}
              />
              <Button variant="ghost" className="mt-2 w-full" onClick={() => setAdding(null)}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-border pt-4">
              <div className="min-w-48 flex-1">
                <Field label="Name for the new authenticator">
                  <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
                </Field>
              </div>
              <Button onClick={() => setAdding(name.trim() || 'Backup authenticator')}>
                <Plus className="size-4" /> Add authenticator
              </Button>
            </div>
          )}
        </Card>

        <Card title="Sessions">
          <p className="text-sm text-muted">
            The panel signs you out after {IDLE_MINUTES} minutes without activity, including when you come back to a tab left open. Sign out when you finish on a shared computer.
          </p>
        </Card>
      </div>
    </>
  );
};

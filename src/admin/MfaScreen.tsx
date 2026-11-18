import { Loader2, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { supabase } from '@/lib/supabase';

type State =
  | { kind: 'loading' }
  | { kind: 'enroll'; factorId: string; qr: string; secret: string }
  | { kind: 'verify'; factorId: string }
  | { kind: 'error'; message: string };

/**
 * The admin panel needs a second factor (authenticator app). First visit: scan a QR code and confirm
 * a code. Later visits: just the 6-digit code. Success upgrades the session to aal2, which the
 * database's is_admin() requires.
 */
export const MfaScreen = ({ onDone }: { onDone: () => void }) => {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Start exactly once: a second run (React's development double-effect, or a re-render) would enrol a
  // second factor and swap the QR code under the admin's feet.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      const { data, error: listError } = await supabase!.auth.mfa.listFactors();
      if (listError) return setState({ kind: 'error', message: listError.message });
      const verified = data.totp.find((f) => f.status === 'verified');
      if (verified) return setState({ kind: 'verify', factorId: verified.id });
      // Clear a half-finished enrolment (QR shown but never confirmed) before starting again.
      for (const f of data.all.filter((x) => x.status === 'unverified')) await supabase!.auth.mfa.unenroll({ factorId: f.id });
      const { data: enrolled, error: enrollError } = await supabase!.auth.mfa.enroll({ factorType: 'totp', friendlyName: `Admin panel ${new Date().toISOString()}` });
      if (enrollError || !enrolled) return setState({ kind: 'error', message: enrollError?.message ?? 'Could not start set-up' });
      setState({ kind: 'enroll', factorId: enrolled.id, qr: enrolled.totp.qr_code, secret: enrolled.totp.secret });
    })();
  }, []);

  useEffect(() => {
    if (state.kind === 'enroll' || state.kind === 'verify') inputRef.current?.focus();
  }, [state.kind]);

  const submit = async (value: string) => {
    if (state.kind !== 'enroll' && state.kind !== 'verify') return;
    setBusy(true);
    setError(null);
    const { error: verifyError } = await supabase!.auth.mfa.challengeAndVerify({ factorId: state.factorId, code: value });
    setBusy(false);
    if (verifyError) {
      setError(verifyError.message.includes('Invalid') ? 'That code is wrong or expired. Try the current one.' : verifyError.message);
      setCode('');
      inputRef.current?.focus();
      return;
    }
    onDone();
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-card border border-border bg-surface p-6">
        <ShieldCheck className="size-8 text-primary" />
        <h1 className="mt-3 font-display text-2xl font-semibold">{state.kind === 'enroll' ? 'Set up two-step sign-in' : 'Two-step sign-in'}</h1>

        {state.kind === 'loading' ? <Loader2 className="mt-6 size-6 animate-spin text-muted" aria-label="Loading" /> : null}
        {state.kind === 'error' ? <p className="mt-4 rounded-button bg-error/10 p-3 text-sm text-error">{state.message}</p> : null}

        {state.kind === 'enroll' ? (
          <>
            <p className="mt-2 text-sm text-muted">
              The admin panel can move money and see customers' photos, so it needs a code from an authenticator app (Google Authenticator, 1Password, Authy) as well as your email.
            </p>
            <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm">
              <li>Scan this QR code with the app.</li>
              <li>Type the 6-digit code it shows.</li>
            </ol>
            <img src={state.qr} alt="QR code for your authenticator app" className="mx-auto mt-4 size-48 rounded-button bg-white p-2" />
            <p className="mt-2 text-center text-xs text-muted">
              Can't scan? Enter this key: <code className="break-all font-mono">{state.secret}</code>
            </p>
          </>
        ) : null}
        {state.kind === 'verify' ? <p className="mt-2 text-sm text-muted">Open your authenticator app and type the 6-digit code for invitationvideos.com.</p> : null}

        {state.kind === 'enroll' || state.kind === 'verify' ? (
          <form
            className="mt-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (code.length === 6) submit(code);
            }}
          >
            <input
              ref={inputRef}
              value={code}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(v);
                if (v.length === 6) submit(v);
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              aria-label="6-digit code"
              placeholder="••••••"
              disabled={busy}
              className="h-14 w-full rounded-button border border-border bg-background text-center font-mono text-2xl tracking-[0.5em] outline-none focus:border-primary"
            />
            {error ? <p role="alert" className="mt-2 text-sm text-error">{error}</p> : null}
            <Button type="submit" className="mt-4 w-full" disabled={busy || code.length !== 6}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null} {state.kind === 'enroll' ? 'Confirm and continue' : 'Continue'}
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
};

import { Loader2, LogOut, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { supabase } from '@/lib/supabase';

/** 6-digit code box that submits by itself once six digits are in. */
export const CodeForm = ({ onSubmit, label }: { onSubmit: (code: string) => Promise<string | null>; label: string }) => {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async (value: string) => {
    if (busy || value.length !== 6) return;
    setBusy(true);
    setError(null);
    const err = await onSubmit(value);
    setBusy(false);
    if (err) {
      setError(err);
      setCode('');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  return (
    <form
      className="mt-5"
      onSubmit={(e) => {
        e.preventDefault();
        void submit(code);
      }}
    >
      <input
        ref={inputRef}
        value={code}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '').slice(0, 6);
          setCode(v);
          if (v.length === 6) void submit(v);
        }}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        aria-label="6-digit code"
        placeholder="••••••"
        disabled={busy}
        className="h-14 w-full rounded-button border border-border bg-background text-center font-mono text-2xl tracking-[0.5em] outline-none focus:border-primary"
      />
      {error ? (
        <p role="alert" className="mt-2 text-sm text-error">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="mt-4 w-full" disabled={busy || code.length !== 6}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : null} {label}
      </Button>
    </form>
  );
};

const friendlyError = (message: string) => (/invalid/i.test(message) ? 'That code is wrong or expired. Try the current one.' : message);

/**
 * Adds an authenticator app: QR code (or key), then a code from the app to confirm it.
 * Used for the first set-up and for adding a backup authenticator on the Security page.
 */
export const TotpEnroll = ({ name, onDone }: { name: string; onDone: () => void }) => {
  const [state, setState] = useState<{ kind: 'loading' } | { kind: 'ready'; factorId: string; qr: string; secret: string } | { kind: 'error'; message: string }>({
    kind: 'loading',
  });

  // Start exactly once: a second run (React's development double-effect, or a re-render) would enrol a
  // second factor and swap the QR code under the admin's feet.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      const { data, error: listError } = await supabase!.auth.mfa.listFactors();
      if (listError) return setState({ kind: 'error', message: listError.message });
      // Clear a half-finished enrolment (QR shown but never confirmed) before starting again.
      for (const f of data.all.filter((x) => x.status === 'unverified')) await supabase!.auth.mfa.unenroll({ factorId: f.id });
      const taken = new Set(data.all.map((f) => f.friendly_name));
      const friendlyName = taken.has(name) ? `${name} (${new Date().toISOString().slice(0, 16).replace('T', ' ')})` : name;
      const { data: enrolled, error: enrollError } = await supabase!.auth.mfa.enroll({ factorType: 'totp', friendlyName });
      if (enrollError || !enrolled) return setState({ kind: 'error', message: enrollError?.message ?? 'Could not start set-up' });
      setState({ kind: 'ready', factorId: enrolled.id, qr: enrolled.totp.qr_code, secret: enrolled.totp.secret });
    })();
  }, [name]);

  if (state.kind === 'loading') return <Loader2 className="mt-6 size-6 animate-spin text-muted" aria-label="Loading" />;
  if (state.kind === 'error') return <p className="mt-4 rounded-button bg-error/10 p-3 text-sm text-error">{state.message}</p>;
  return (
    <>
      <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm">
        <li>Scan this QR code with the app.</li>
        <li>Type the 6-digit code it shows.</li>
      </ol>
      <img src={state.qr} alt="QR code for your authenticator app" className="mx-auto mt-4 size-48 rounded-button bg-white p-2" />
      <p className="mt-2 text-center text-xs text-muted">
        Can't scan? Enter this key: <code className="break-all font-mono">{state.secret}</code>
      </p>
      <CodeForm
        label="Confirm and continue"
        onSubmit={async (code) => {
          const { error } = await supabase!.auth.mfa.challengeAndVerify({ factorId: state.factorId, code });
          if (error) return friendlyError(error.message);
          onDone();
          return null;
        }}
      />
    </>
  );
};

/**
 * The admin panel needs a second factor (authenticator app). First visit: scan a QR code and confirm
 * a code. Later visits: just the 6-digit code from any of the admin's authenticators. Success
 * upgrades the session to aal2, which the database's is_admin() requires.
 */
export const MfaScreen = ({ onDone, onSignOut, email }: { onDone: () => void; onSignOut: () => void; email: string }) => {
  const [factors, setFactors] = useState<Array<{ id: string }> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void supabase!.auth.mfa.listFactors().then(({ data, error: e }) => {
      if (e) setError(e.message);
      else setFactors(data.totp.filter((f) => f.status === 'verified'));
    });
  }, []);

  const enrolling = factors !== null && factors.length === 0;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-card border border-border bg-surface p-6">
        <ShieldCheck className="size-8 text-primary" />
        <h1 className="mt-3 font-display text-2xl font-semibold">{enrolling ? 'Set up two-step sign-in' : 'Two-step sign-in'}</h1>
        <p className="mt-1 truncate text-xs text-muted">{email}</p>

        {error ? <p className="mt-4 rounded-button bg-error/10 p-3 text-sm text-error">{error}</p> : null}
        {!factors && !error ? <Loader2 className="mt-6 size-6 animate-spin text-muted" aria-label="Loading" /> : null}

        {enrolling ? (
          <>
            <p className="mt-2 text-sm text-muted">
              The admin panel can change prices and see customers' details, so it needs a code from an authenticator app (Google Authenticator, 1Password, Authy) as well as your email.
            </p>
            <TotpEnroll name="Authenticator app" onDone={onDone} />
          </>
        ) : null}

        {factors && factors.length > 0 ? (
          <>
            <p className="mt-2 text-sm text-muted">Open your authenticator app and type the 6-digit code for invitationvideos.com.</p>
            <CodeForm
              label="Continue"
              onSubmit={async (code) => {
                // Any of the admin's authenticators will do (main or backup).
                let last = '';
                for (const f of factors) {
                  const { error: e } = await supabase!.auth.mfa.challengeAndVerify({ factorId: f.id, code });
                  if (!e) {
                    onDone();
                    return null;
                  }
                  last = e.message;
                }
                return friendlyError(last);
              }}
            />
          </>
        ) : null}

        <Button variant="ghost" onClick={onSignOut} className="mt-2 w-full text-muted">
          <LogOut className="size-4" /> Sign out or use another account
        </Button>
      </div>
    </div>
  );
};

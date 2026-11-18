import { Mail, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/Button';
import { useAuth } from '@/lib/auth';
import { CodeForm } from './MfaScreen';
import { inputCls } from './ui';

/**
 * Admin sign-in: an emailed 6-digit code for an existing account (never creates one), then the
 * authenticator code on the next screen. Kept apart from the store's /account page, which creates
 * accounts and moves this device's drafts into them.
 */
export const AdminSignIn = ({ notice }: { notice?: string | null }) => {
  const { sendMagicLink, verifyCode } = useAuth();
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const address = email.trim().toLowerCase();
    if (!address) return;
    setBusy(true);
    setError(null);
    const { error: err } = await sendMagicLink(address, { createUser: false });
    setBusy(false);
    // An unknown email gets the same screen as a known one, so the form doesn't reveal who has an account.
    if (err && !/signups not allowed|user not found/i.test(err)) return setError(err);
    setSentTo(address);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-card border border-border bg-surface p-6">
        <ShieldCheck className="size-8 text-primary" />
        <h1 className="mt-3 font-display text-2xl font-semibold">Admin sign-in</h1>
        {notice ? <p className="mt-3 rounded-button bg-accent/15 p-3 text-sm">{notice}</p> : null}

        {sentTo ? (
          <>
            <p className="mt-2 text-sm text-muted">
              If {sentTo} has an account, a 6-digit code is on its way. Then you'll need your authenticator app.
            </p>
            <CodeForm
              label="Continue"
              onSubmit={async (code) => {
                const { error: err } = await verifyCode(sentTo, code);
                return err ? "That code didn't work. Check the latest email, or send a new code." : null;
              }}
            />
            <Button
              variant="ghost"
              className="mt-1 w-full"
              onClick={() => {
                setSentTo(null);
                setError(null);
              }}
            >
              Use a different email
            </Button>
          </>
        ) : (
          <form onSubmit={send} className="mt-4 space-y-2">
            <label className="block text-sm font-semibold" htmlFor="admin-email">
              Admin email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputCls}
            />
            <Button type="submit" className="w-full" disabled={busy || !email.trim()}>
              <Mail className="size-4" /> {busy ? 'Sending…' : 'Email me a code'}
            </Button>
          </form>
        )}
        {error ? (
          <p role="alert" className="mt-3 text-sm text-error">
            {error}
          </p>
        ) : null}
        <Link to="/" className="mt-4 block text-center text-sm text-muted hover:text-ink">
          Back to the store
        </Link>
      </div>
    </div>
  );
};

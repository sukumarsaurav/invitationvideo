import { CheckCircle2, LogOut, Mail } from 'lucide-react';
import { useSeo } from '@/lib/seo';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/Button';
import { useAuth } from '@/lib/auth';
import { useDrafts } from '@/lib/drafts';
import { useI18n } from '@/lib/i18n';

const GoogleMark = () => (
  <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

/** Only same-site paths, so a crafted link can't send people elsewhere after sign-in. */
const safeNext = (next: string | null) => (next && next.startsWith('/') && !next.startsWith('//') ? next : null);

const REASONS: Record<string, string> = {
  download: 'Sign in to download. Your HD video stays in My Videos so you can download it again.',
  share: 'Sign in to share your preview with family.',
  save: 'Sign in to keep your invite safe and open it on any device.',
};

export const AccountPage = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const reason = params.get('reason');
  const { ready, user, available, googleEnabled, sendMagicLink, verifyCode, signInWithGoogle, signOut } = useAuth();
  const { drafts, loaded } = useDrafts();
  useSeo({ title: 'Account', description: '', path: '/account', noindex: true });
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  // Signed in and drafts moved to the account: continue where the customer was going.
  useEffect(() => {
    if (user && loaded && next) navigate(next, { replace: true });
  }, [user, loaded, next, navigate]);

  useEffect(() => {
    if (sentTo) codeRef.current?.focus();
  }, [sentTo]);

  const sendCode = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await sendMagicLink(email.trim());
    setBusy(false);
    if (err) setError(err);
    else setSentTo(email.trim());
  };

  const submitCode = async (value: string) => {
    if (!sentTo || value.length !== 6) return;
    setBusy(true);
    setError(null);
    const { error: err } = await verifyCode(sentTo, value);
    setBusy(false);
    if (err) {
      setError(t("That code didn't work. Check the latest email, or send a new code."));
      setCode('');
    }
  };

  const google = async () => {
    setError(null);
    const { error: err } = await signInWithGoogle();
    if (err) setError(err);
  };

  return (
    <div className="px-4 pt-6 md:px-6 md:pt-10">
      <h1 className="font-display text-2xl font-semibold">{t('Account')}</h1>

      <div className="mt-4 max-w-md rounded-card border border-border bg-surface p-5">
        {!available ? (
          <p className="text-sm text-muted">{t("Sign-in isn't set up on this copy of the app.")}</p>
        ) : !ready ? (
          <p className="text-sm text-muted">{t('Checking sign-in…')}</p>
        ) : user ? (
          <>
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-lg font-semibold uppercase text-primary">
                {(user.email ?? '?').charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{user.email}</p>
                <p className="flex items-center gap-1 text-sm text-success">
                  <CheckCircle2 className="size-4" /> {t('Your videos are saved to your account')}
                </p>
              </div>
            </div>
            <Link to="/my-videos" className="mt-4 flex min-h-11 items-center justify-between rounded-button border border-border px-4 text-sm font-semibold">
              {t('My Videos')} <span className="text-muted">{drafts.length}</span>
            </Link>
            <Button variant="ghost" onClick={signOut} className="mt-2 w-full text-error">
              <LogOut className="size-4" /> {t('Log out')}
            </Button>
          </>
        ) : sentTo ? (
          <div>
            <Mail className="size-9 text-primary" />
            <p className="mt-2 font-semibold">{t('Enter the 6-digit code')}</p>
            <p className="mt-1 text-sm text-muted">{t('We sent it to {email}.', { email: sentTo })}</p>
            <input
              ref={codeRef}
              value={code}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(v);
                if (v.length === 6) submitCode(v);
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              aria-label={t('6-digit code')}
              placeholder="••••••"
              disabled={busy}
              className="mt-4 h-14 w-full rounded-button border border-border bg-surface text-center font-mono text-2xl tracking-[0.5em] outline-none focus:border-primary"
            />
            <Button className="mt-3 w-full" disabled={busy || code.length !== 6} onClick={() => submitCode(code)}>
              {busy ? t('Checking…') : t('Sign in')}
            </Button>
            {import.meta.env.DEV ? (
              <a href="http://localhost:54324" target="_blank" rel="noreferrer" className="mt-3 block text-center text-sm font-semibold text-primary">
                {t('Open local email inbox')}
              </a>
            ) : null}
            <Button variant="ghost" onClick={() => { setSentTo(null); setCode(''); setError(null); }} className="mt-1 w-full">
              {t('Use a different email')}
            </Button>
          </div>
        ) : (
          <>
            <p className="font-semibold">{t('Sign in to keep your videos')}</p>
            <p className="mt-1 text-sm text-muted">{t(reason && REASONS[reason] ? REASONS[reason] : 'Drafts on this device move to your account automatically.')}</p>

            {googleEnabled ? (
              <>
                <Button variant="outline" className="mt-4 w-full" onClick={google}>
                  <GoogleMark /> {t('Continue with Google')}
                </Button>
                <div className="my-4 flex items-center gap-3 text-xs text-muted">
                  <span className="h-px flex-1 bg-border" /> {t('or')} <span className="h-px flex-1 bg-border" />
                </div>
              </>
            ) : <div className="mt-4" />}

            <form onSubmit={sendCode} className="space-y-2">
              <label className="block text-sm font-semibold" htmlFor="email">
                {t('Email')}
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-12 w-full rounded-button border border-border bg-surface px-4 outline-none focus:border-primary"
              />
              <Button type="submit" className="w-full" disabled={busy || !email.trim()}>
                <Mail className="size-4" /> {busy ? t('Sending…') : t('Email me a code')}
              </Button>
            </form>
          </>
        )}
        {error ? <p className="mt-3 text-sm text-error" role="alert">{error}</p> : null}
      </div>
    </div>
  );
};

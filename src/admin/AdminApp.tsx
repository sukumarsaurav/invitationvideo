import { ArrowLeft, KeyRound, LayoutDashboard, Loader2, LogOut, ScrollText, Settings, ShieldAlert, Shapes, Users } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/cn';
import { useSeo } from '@/lib/seo';
import { supabase } from '@/lib/supabase';
import { AdminContext, atLeast, ROLE_LABEL, type AdminRole } from './access';
import { AdminSignIn } from './AdminSignIn';
import { AuditLogPage } from './AuditLogPage';
import { CustomerPage, CustomersPage } from './CustomersPage';
import { DashboardPage } from './DashboardPage';
import { IDLE_MINUTES, idleExpired, markActive, useIdleSignOut } from './idle';
import { MfaScreen } from './MfaScreen';
import { SecurityPage } from './SecurityPage';
import { SettingsPage } from './SettingsPage';
import { TemplateEditorPage, TemplatesPage } from './TemplatesPage';

type Gate = { kind: 'loading' } | { kind: 'signed-out' } | { kind: 'no-access' } | { kind: 'mfa' } | { kind: 'ok'; role: AdminRole } | { kind: 'error'; message: string };

const NAV: Array<{ to: string; label: string; icon: typeof LayoutDashboard; end?: boolean; min: AdminRole }> = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true, min: 'viewer' },
  { to: '/admin/templates', label: 'Templates', icon: Shapes, min: 'viewer' },
  { to: '/admin/customers', label: 'Customers', icon: Users, min: 'viewer' },
  { to: '/admin/settings', label: 'Settings', icon: Settings, min: 'viewer' },
  { to: '/admin/audit', label: 'Audit log', icon: ScrollText, min: 'manager' },
  { to: '/admin/security', label: 'Security', icon: KeyRound, min: 'viewer' },
];

const IDLE_NOTICE = `You were signed out after ${IDLE_MINUTES} minutes without activity.`;

/**
 * /admin: lazy-loaded, so customers never download it. Three gates before anything shows:
 * signed in (admin sign-in, existing accounts only) → listed in invites.admins → second factor
 * (aal2). The database checks the same things on every query; these gates only decide what to
 * show. Sessions end after IDLE_MINUTES without activity.
 */
export const AdminApp = () => {
  const { ready, user, signOut } = useAuth();
  const [gate, setGate] = useState<Gate>({ kind: 'loading' });
  const [notice, setNotice] = useState<string | null>(null);
  useSeo({ title: 'Admin', description: '', path: '/admin', noindex: true });

  // signOut is a new function on every render; a ref keeps endIdleSession (and so check) stable,
  // or the gate effect below would re-run the whole check on every render.
  const signOutRef = useRef(signOut);
  signOutRef.current = signOut;
  const endIdleSession = useCallback(() => {
    setNotice(IDLE_NOTICE);
    void signOutRef.current();
  }, []);

  const check = useCallback(async () => {
    if (!supabase) return setGate({ kind: 'error', message: 'Supabase is not configured.' });
    const { data: role, error } = await supabase.rpc('my_admin_role');
    if (error) return setGate({ kind: 'error', message: error.message });
    if (!role) return setGate({ kind: 'no-access' });
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel !== 'aal2') return setGate({ kind: 'mfa' });
    // A fully signed-in session left unused too long (e.g. a tab reopened the next day) ends here.
    if (idleExpired()) return endIdleSession();
    setGate({ kind: 'ok', role: role as AdminRole });
  }, [endIdleSession]);

  useIdleSignOut(gate.kind === 'ok', endIdleSession);

  // Keyed on the user's id, not the user object: Supabase hands out a new object on every token
  // refresh and tab focus, which would restart the gate (and a half-done two-step set-up) for nothing.
  const userId = user?.id ?? null;
  useEffect(() => {
    if (!ready) return;
    if (!userId) {
      setGate({ kind: 'signed-out' });
      return;
    }
    setGate({ kind: 'loading' });
    void check();
  }, [ready, userId, check]);

  if (gate.kind === 'loading') {
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted" aria-label="Loading" />
      </div>
    );
  }
  if (gate.kind === 'signed-out') return <AdminSignIn notice={notice} />;
  if (gate.kind === 'mfa') {
    return (
      <MfaScreen
        email={user?.email ?? ''}
        onSignOut={() => void signOut()}
        onDone={() => {
          markActive();
          setNotice(null);
          void check();
        }}
      />
    );
  }
  if (gate.kind !== 'ok') {
    const message = gate.kind === 'no-access' ? `${user?.email ?? 'This account'} is not an admin.` : gate.message;
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <ShieldAlert className="mx-auto size-8 text-primary" />
        <h1 className="mt-3 font-display text-2xl font-semibold">Admin panel</h1>
        <p className="mt-2 text-muted">{message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={() => void signOut()} className="inline-flex min-h-11 items-center gap-2 rounded-button bg-primary px-5 font-semibold text-white">
            <LogOut className="size-4" /> Sign out
          </button>
          <Link to="/" className="inline-flex min-h-11 items-center rounded-button border border-border px-5 font-semibold">
            Back to the store
          </Link>
        </div>
      </div>
    );
  }

  const role = gate.role;
  return (
    <AdminContext.Provider value={{ role, email: user?.email ?? '' }}>
      <div className="min-h-dvh bg-background md:flex">
        <aside className="safe-top border-b border-border bg-surface md:sticky md:top-0 md:flex md:h-dvh md:w-60 md:shrink-0 md:flex-col md:border-b-0 md:border-r">
          <div className="flex h-14 items-center gap-2 px-4 md:h-16">
            <span className="grid size-8 place-items-center rounded-[10px] bg-primary font-display text-sm italic text-accent">iv</span>
            <span className="font-semibold">Admin</span>
            <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary md:ml-2">{ROLE_LABEL[role]}</span>
            {/* Phones: the sidebar footer is hidden, so the store link and sign-out live here. */}
            <Link to="/" aria-label="Back to the store" className="grid size-10 place-items-center rounded-button text-muted hover:bg-background md:hidden">
              <ArrowLeft className="size-5" />
            </Link>
            <button onClick={() => void signOut()} aria-label={`Sign out ${user?.email ?? ''}`} className="grid size-10 place-items-center rounded-button text-muted hover:bg-background md:hidden">
              <LogOut className="size-5" />
            </button>
          </div>
          <nav aria-label="Admin" className="no-scrollbar flex gap-1 overflow-x-auto px-2 pb-2 md:flex-1 md:flex-col md:overflow-visible md:pb-0">
            {NAV.filter((n) => atLeast(role, n.min)).map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-10 shrink-0 items-center gap-2 rounded-button px-3 text-sm font-medium',
                    isActive ? 'bg-primary text-white' : 'text-ink hover:bg-background',
                  )
                }
              >
                <Icon className="size-4" /> {label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden border-t border-border p-2 md:block">
            <p className="truncate px-3 py-1 text-xs text-muted">{user?.email}</p>
            <Link to="/" className="flex min-h-10 items-center gap-2 rounded-button px-3 text-sm hover:bg-background">
              <ArrowLeft className="size-4" /> Back to the store
            </Link>
            <button onClick={() => void signOut()} className="flex min-h-10 w-full items-center gap-2 rounded-button px-3 text-sm hover:bg-background">
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 lg:px-10">
          <Routes>
            <Route index element={<DashboardPage />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="templates/:slug" element={<TemplateEditorPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="customers/:id" element={<CustomerPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="security" element={<SecurityPage />} />
            {atLeast(role, 'manager') ? <Route path="audit" element={<AuditLogPage />} /> : null}
            <Route path="*" element={<p className="text-muted">Page not found.</p>} />
          </Routes>
        </main>
      </div>
    </AdminContext.Provider>
  );
};

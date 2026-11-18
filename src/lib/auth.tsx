import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { setDraftUser } from './drafts';
import { supabase } from './supabase';

type AuthState = {
  /** False until the saved session has been read on page load. */
  ready: boolean;
  user: User | null;
  /** Supabase is configured (.env.local filled in). */
  available: boolean;
  googleEnabled: boolean;
  /** createUser: false only signs in existing accounts (the admin panel). */
  sendMagicLink: (email: string, options?: { createUser?: boolean }) => Promise<{ error: string | null }>;
  /** Signs in with the 6-digit code from the email (works even if the link opens in another browser). */
  verifyCode: (email: string, code: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const googleEnabled = import.meta.env.VITE_GOOGLE_AUTH_ENABLED === 'true';

/** The admin panel never moves this device's guest drafts into the signed-in account. */
const draftOptions = () => ({ moveLocal: !window.location.pathname.startsWith('/admin') });

/** Where sign-in links return to: the page the person was on. */
const redirectTo = () => `${window.location.origin}${window.location.pathname}${window.location.search}`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!supabase);

  useEffect(() => {
    if (!supabase) {
      setDraftUser(null);
      return;
    }
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setReady(true);
      setDraftUser(data.session?.user.id ?? null, draftOptions());
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      // Token refreshes keep the same user; only react to real sign-in / sign-out.
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') setDraftUser(next?.user.id ?? null, draftOptions());
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value: AuthState = {
    ready,
    user: session?.user ?? null,
    available: Boolean(supabase),
    googleEnabled,
    sendMagicLink: async (email, options) => {
      if (!supabase) return { error: 'Sign-in is not configured' };
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo(), shouldCreateUser: options?.createUser ?? true },
      });
      return { error: error?.message ?? null };
    },
    verifyCode: async (email, code) => {
      if (!supabase) return { error: 'Sign-in is not configured' };
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
      return { error: error?.message ?? null };
    },
    signInWithGoogle: async () => {
      if (!supabase) return { error: 'Sign-in is not configured' };
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectTo() },
      });
      return { error: error?.message ?? null };
    },
    signOut: async () => {
      await supabase?.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

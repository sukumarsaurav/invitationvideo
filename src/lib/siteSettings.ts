import { useSyncExternalStore } from 'react';
import { ANNOUNCEMENT } from '@/config';

/**
 * Public site settings edited in the admin panel (invites.site_settings, public rows only).
 * Same pattern as the catalogue: last-seen values from localStorage first, then a fresh read.
 * Until anything arrives, the code defaults below apply, so the site never waits on the database.
 */
export type SiteSettings = {
  /** link: a page on this site; null means no link (an admin cleared it). */
  announcement: { enabled: boolean; text: string; link?: string | null };
  support_whatsapp: { number: string };
  payments_enabled: { enabled: boolean; message: string };
  maintenance: { enabled: boolean; text: string };
  /** "Pay" completes a test payment that charges nothing; off, customers pay with Razorpay. */
  test_payments: { enabled: boolean };
};

const ENV_SUPPORT = (import.meta.env.VITE_SUPPORT_WHATSAPP as string | undefined) ?? '';

export const DEFAULT_SETTINGS: SiteSettings = {
  announcement: ANNOUNCEMENT ? { enabled: true, text: ANNOUNCEMENT.text, link: ANNOUNCEMENT.link } : { enabled: false, text: '' },
  support_whatsapp: { number: ENV_SUPPORT },
  payments_enabled: { enabled: true, message: '' },
  maintenance: { enabled: false, text: '' },
  test_payments: { enabled: false },
};

const CACHE_KEY = 'iv.settings.v1';
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let settings: SiteSettings = DEFAULT_SETTINGS;
const listeners = new Set<() => void>();

/** A page on this site ("/templates"), never another site ("//x", "/\\x", "https://x"). Same rule as the database. */
export const isSiteLink = (link: string) => /^\/([^/\\\s]\S*)?$/.test(link);

type Raw = Record<string, unknown>;
const isObj = (v: unknown): v is Raw => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown, fallback: string) => (typeof v === 'string' ? v : fallback);
const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);

/**
 * Settings from the database (or this browser's cache), field by field: anything missing or of the
 * wrong type falls back to the code default, so a bad value can never break a page.
 */
export const sanitizeSettings = (rows: Array<{ key: string; value: unknown }>): SiteSettings => {
  const raw: Record<string, Raw> = {};
  for (const r of rows) if (r && typeof r.key === 'string' && isObj(r.value)) raw[r.key] = r.value;
  const d = DEFAULT_SETTINGS;
  const a = raw.announcement ?? {};
  const link = 'link' in a ? (typeof a.link === 'string' && isSiteLink(a.link) ? a.link : null) : d.announcement.link;
  const w = raw.support_whatsapp ?? {};
  const p = raw.payments_enabled ?? {};
  const m = raw.maintenance ?? {};
  const tp = raw.test_payments ?? {};
  const digits = str(w.number, d.support_whatsapp.number).replace(/\D/g, '');
  return {
    announcement: { enabled: bool(a.enabled, d.announcement.enabled), text: str(a.text, d.announcement.text), link },
    support_whatsapp: { number: digits },
    payments_enabled: { enabled: bool(p.enabled, d.payments_enabled.enabled), message: str(p.message, d.payments_enabled.message) },
    maintenance: { enabled: bool(m.enabled, d.maintenance.enabled), text: str(m.text, d.maintenance.text) },
    test_payments: { enabled: bool(tp.enabled, d.test_payments.enabled) },
  };
};

const apply = (rows: Array<{ key: string; value: unknown }>) => {
  settings = sanitizeSettings(rows);
  listeners.forEach((l) => l());
};

try {
  const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as unknown;
  if (Array.isArray(cached)) apply(cached as Array<{ key: string; value: unknown }>);
} catch {
  // Code defaults.
}

/** Reads public settings once per page load (force = true to refresh after an admin edit). */
let loading: Promise<void> | null = null;
export const loadSiteSettings = (force = false): Promise<void> => {
  if (!url || !key) return Promise.resolve();
  if (loading && !force) return loading;
  loading = fetch(`${url.replace(/\/$/, '')}/rest/v1/site_settings?select=key,value&public=eq.true`, {
    headers: { apikey: key, 'Accept-Profile': 'invites' },
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(String(res.status));
      const rows = (await res.json()) as Array<{ key: string; value: unknown }>;
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(rows));
      } catch {
        // Not cached.
      }
      apply(rows);
    })
    .catch(() => {
      // Keep cached or default values.
    });
  return loading;
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useSiteSettings = (): SiteSettings => useSyncExternalStore(subscribe, () => settings);

/** WhatsApp support number as digits with country code, or null when none is set. */
export const useSupportWhatsapp = (): string | null => {
  const s = useSiteSettings();
  return (s.support_whatsapp.number || ENV_SUPPORT).replace(/\D/g, '') || null;
};

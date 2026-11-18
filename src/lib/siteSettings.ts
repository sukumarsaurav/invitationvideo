import { useSyncExternalStore } from 'react';
import { ANNOUNCEMENT } from '@/config';

/**
 * Public site settings edited in the admin panel (invites.site_settings, public rows only).
 * Same pattern as the catalogue: last-seen values from localStorage first, then a fresh read.
 * Until anything arrives, the code defaults below apply, so the site never waits on the database.
 */
export type SiteSettings = {
  announcement: { enabled: boolean; text: string; link?: string };
  support_whatsapp: { number: string };
  payments_enabled: { enabled: boolean; message: string };
  maintenance: { enabled: boolean; text: string };
};

const ENV_SUPPORT = (import.meta.env.VITE_SUPPORT_WHATSAPP as string | undefined) ?? '';

export const DEFAULT_SETTINGS: SiteSettings = {
  announcement: ANNOUNCEMENT ? { enabled: true, text: ANNOUNCEMENT.text, link: ANNOUNCEMENT.link } : { enabled: false, text: '' },
  support_whatsapp: { number: ENV_SUPPORT },
  payments_enabled: { enabled: true, message: '' },
  maintenance: { enabled: false, text: '' },
};

const CACHE_KEY = 'iv.settings.v1';
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let settings: SiteSettings = DEFAULT_SETTINGS;
const listeners = new Set<() => void>();

const apply = (rows: Array<{ key: string; value: unknown }>) => {
  const next = { ...DEFAULT_SETTINGS } as Record<string, unknown>;
  for (const r of rows) if (r.key in next && r.value && typeof r.value === 'object') next[r.key] = { ...(next[r.key] as object), ...(r.value as object) };
  settings = next as SiteSettings;
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

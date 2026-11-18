import { useSyncExternalStore } from 'react';
import { applyCatalogue, fetchCatalogue, type CatalogueRow } from '@/templates/catalogue';
import { ALL_TEMPLATES, TEMPLATES } from '@/templates/registry';

/**
 * Keeps the store's template list in step with the admin panel.
 * - On start: the last list this browser saw (localStorage), so prices don't jump on load.
 * - Then: a fresh read of published templates. On failure the code values stay.
 * Components that list templates call useCatalogue() so they re-render when it changes.
 */
const CACHE_KEY = 'iv.catalogue.v1';
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let version = 0;
const listeners = new Set<() => void>();

const apply = (rows: CatalogueRow[]) => {
  const listed = applyCatalogue(ALL_TEMPLATES, rows);
  TEMPLATES.splice(0, TEMPLATES.length, ...listed);
  version += 1;
  listeners.forEach((l) => l());
};

try {
  const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as unknown;
  if (Array.isArray(cached)) apply(cached as CatalogueRow[]);
} catch {
  // No cache, or storage blocked: start from the code values.
}

let loading: Promise<void> | null = null;

/** Fetches the published catalogue once per page load (call again to refresh, e.g. after an admin edit). */
export const loadCatalogue = (force = false): Promise<void> => {
  if (!url || !key) return Promise.resolve();
  if (loading && !force) return loading;
  loading = fetchCatalogue(url, key)
    .then((rows) => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(rows));
      } catch {
        // Not cached; it still applies for this visit.
      }
      apply(rows);
    })
    .catch(() => {
      // Database unreachable: keep what we have (cache or code).
    });
  return loading;
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Re-renders the caller when the catalogue changes; returns a number that changes with it. */
export const useCatalogue = () => useSyncExternalStore(subscribe, () => version);

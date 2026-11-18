import { useSyncExternalStore } from 'react';

/**
 * Shortlisted designs (the heart on template cards), kept in this browser so guests can use it too.
 * A list of template slugs, most recent first.
 */
const KEY = 'iv.shortlist.v1';

const read = (): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]') as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
};

let slugs = read();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const write = (next: string[]) => {
  slugs = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Kept for this visit only.
  }
  emit();
};

// Another tab changed the shortlist.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    slugs = read();
    emit();
  });
}

export const toggleShortlist = (slug: string) => write(slugs.includes(slug) ? slugs.filter((s) => s !== slug) : [slug, ...slugs]);

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useShortlist = (): string[] => useSyncExternalStore(subscribe, () => slugs);

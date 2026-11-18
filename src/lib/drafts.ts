import { useSyncExternalStore } from 'react';
import type { VideoData } from '@/templates/types';
import { supabase } from './supabase';

/**
 * Drafts live in two places:
 * - guests: localStorage on this device;
 * - signed-in users: `invites.user_videos` in Supabase (RLS limits rows to the owner).
 * On sign-in, local drafts are moved into the account with the same ids, so open links keep working.
 */
export type DraftStatus = 'draft' | 'paid' | 'rendered';

export type Draft = {
  id: string;
  templateSlug: string;
  data: VideoData;
  status: DraftStatus;
  createdAt: string;
  updatedAt: string;
  /** Set once the owner creates a share link (signed-in drafts only). */
  shareToken?: string | null;
};

type State = {
  /** null = guest (local drafts). */
  userId: string | null;
  drafts: Draft[];
  /** False while the session or the remote list is still loading. */
  loaded: boolean;
  /** Set when a sync step failed; shown on My Videos. */
  error: string | null;
};

// ---------------------------------------------------------------------------
// Local storage (guests)
// ---------------------------------------------------------------------------

const KEY = 'iv.drafts.v1';

const readLocal = (): Draft[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Draft[]) : [];
  } catch {
    return [];
  }
};

const writeLocal = (drafts: Draft[]): boolean => {
  try {
    localStorage.setItem(KEY, JSON.stringify(drafts));
    return true;
  } catch {
    // Quota exceeded (large photos) or storage blocked.
    return false;
  }
};

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

let state: State = {
  userId: null,
  drafts: supabase ? [] : readLocal(),
  // With Supabase configured we wait for the saved session before showing anything.
  loaded: !supabase,
  error: null,
};
const listeners = new Set<() => void>();

const setState = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY && state.userId === null) setState({ drafts: readLocal() });
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener('storage', onStorage);
  };
};

const useStore = () => useSyncExternalStore(subscribe, () => state);

const upsertInState = (draft: Draft) => {
  const others = state.drafts.filter((d) => d.id !== draft.id);
  setState({ drafts: [draft, ...others] });
};

// ---------------------------------------------------------------------------
// Supabase mapping
// ---------------------------------------------------------------------------

type Row = {
  id: string;
  template_id: string;
  data: VideoData;
  status: DraftStatus;
  created_at: string;
  updated_at: string;
  share_token: string | null;
};

let templateIds: Promise<{ bySlug: Map<string, string>; byId: Map<string, string> }> | null = null;

/** slug ↔ id for templates, fetched once per page load. */
const getTemplateIds = () => {
  if (!templateIds) {
    templateIds = (async () => {
      const { data, error } = await supabase!.from('templates').select('id, slug');
      if (error) {
        templateIds = null;
        throw new Error(error.message);
      }
      const rows = (data ?? []) as Array<{ id: string; slug: string }>;
      return {
        bySlug: new Map(rows.map((r) => [r.slug, r.id])),
        byId: new Map(rows.map((r) => [r.id, r.slug])),
      };
    })();
  }
  return templateIds;
};

const fromRow = (row: Row, slugById: Map<string, string>): Draft => ({
  id: row.id,
  templateSlug: slugById.get(row.template_id) ?? 'unknown',
  data: row.data,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  shareToken: row.share_token,
});

const ROW_COLUMNS = 'id, template_id, data, status, created_at, updated_at, share_token';

const fetchRemote = async (): Promise<Draft[]> => {
  const { byId } = await getTemplateIds();
  const { data, error } = await supabase!
    .from('user_videos')
    .select(ROW_COLUMNS)
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map((r) => fromRow(r, byId));
};

/** Copies this device's guest drafts into the account, then clears them locally. */
const moveLocalDraftsToAccount = async (userId: string) => {
  const local = readLocal();
  if (local.length === 0) return;
  const { bySlug } = await getTemplateIds();
  const rows = local
    .filter((d) => bySlug.has(d.templateSlug))
    .map((d) => ({
      id: d.id,
      user_id: userId,
      template_id: bySlug.get(d.templateSlug)!,
      data: d.data,
      // Status is owned by the server (payments), so everything arrives as a draft.
    }));
  if (rows.length > 0) {
    const { error } = await supabase!.from('user_videos').upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
    if (error) throw new Error(error.message);
  }
  writeLocal([]);
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

let switchToken = 0;

/** Called by AuthProvider whenever the signed-in user changes. */
export const setDraftUser = async (userId: string | null) => {
  const token = ++switchToken;
  if (!supabase || userId === null) {
    setState({ userId: null, drafts: readLocal(), loaded: true, error: null });
    return;
  }
  setState({ userId, drafts: [], loaded: false, error: null });
  let error: string | null = null;
  try {
    await moveLocalDraftsToAccount(userId);
  } catch (e) {
    error = `Couldn't move this device's drafts to your account: ${e instanceof Error ? e.message : e}`;
  }
  try {
    const drafts = await fetchRemote();
    if (token === switchToken) setState({ drafts, loaded: true, error });
  } catch (e) {
    if (token === switchToken) setState({ drafts: [], loaded: true, error: `Couldn't load your videos: ${e instanceof Error ? e.message : e}` });
  }
};

/** All drafts for the current user (or this device), newest first. */
export const useDrafts = () => {
  const s = useStore();
  const drafts = [...s.drafts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return { drafts, loaded: s.loaded, error: s.error, signedIn: s.userId !== null };
};

/** One draft by id; `loading` stays true until the session and list have loaded. */
export const useDraft = (id: string | undefined) => {
  const s = useStore();
  return { draft: s.drafts.find((d) => d.id === id), loading: !s.loaded };
};

export const createDraft = async (templateSlug: string, data: VideoData): Promise<Draft> => {
  const now = new Date().toISOString();
  const draft: Draft = { id: newId(), templateSlug, data, status: 'draft', createdAt: now, updatedAt: now };

  if (state.userId && supabase) {
    const { bySlug } = await getTemplateIds();
    const templateId = bySlug.get(templateSlug);
    if (!templateId) throw new Error(`Template "${templateSlug}" is not in the database. Apply supabase/seed.sql to the Supabase project.`);
    const { data: row, error } = await supabase
      .from('user_videos')
      .insert({ id: draft.id, template_id: templateId, data })
      .select(ROW_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    const saved = fromRow(row as Row, (await getTemplateIds()).byId);
    upsertInState(saved);
    return saved;
  }

  if (!writeLocal([draft, ...readLocal()])) throw new Error('This device is out of storage space for drafts.');
  upsertInState(draft);
  return draft;
};

/** Saves the editor's data. Resolves false if the save failed. */
export const saveDraftData = async (id: string, data: VideoData): Promise<boolean> => {
  const existing = state.drafts.find((d) => d.id === id);
  if (!existing) return false;
  const updated: Draft = { ...existing, data, updatedAt: new Date().toISOString() };

  if (state.userId && supabase) {
    const { error } = await supabase.from('user_videos').update({ data }).eq('id', id);
    if (error) return false;
    upsertInState(updated);
    return true;
  }

  const all = readLocal().map((d) => (d.id === id ? updated : d));
  if (!writeLocal(all)) return false;
  upsertInState(updated);
  return true;
};

/**
 * Records a finished download. Guests: stored locally.
 * Signed-in: status is owned by the server and is set by the payment flow (Phase 3), so this is a no-op.
 */
export const markRendered = (id: string) => {
  if (state.userId) return;
  const all = readLocal().map((d) => (d.id === id ? { ...d, status: 'rendered' as const } : d));
  if (writeLocal(all)) setState({ drafts: all });
};

/**
 * A view-only, watermarked link to this video for family to check before paying.
 * Needs a signed-in account (the draft must live in Supabase). Reuses an existing link.
 */
export const createShareLink = async (id: string): Promise<string> => {
  if (!state.userId || !supabase) throw new Error('SIGN_IN_REQUIRED');
  const draft = state.drafts.find((d) => d.id === id);
  if (!draft) throw new Error('Video not found');
  let token = draft.shareToken ?? null;
  if (!token) {
    token = newId();
    const { error } = await supabase.from('user_videos').update({ share_token: token }).eq('id', id);
    if (error) throw new Error(error.message);
    upsertInState({ ...draft, shareToken: token });
  }
  return `${window.location.origin}/p/${token}`;
};

/**
 * The payment status stored on the server for this video, read fresh (not from the cached list).
 * Null for guests, when Supabase isn't configured, or when the row can't be read.
 */
export const fetchServerStatus = async (id: string): Promise<DraftStatus | null> => {
  if (!state.userId || !supabase) return null;
  const { data, error } = await supabase.from('user_videos').select('status').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return (data as { status: DraftStatus }).status;
};

export type SharedVideo ={ templateSlug: string; data: VideoData; updatedAt: string };

/** Reads a shared video by its link token. Works signed out. */
export const fetchSharedVideo = async (token: string): Promise<SharedVideo | null> => {
  if (!supabase) throw new Error('Sharing is not configured');
  const { data, error } = await supabase.rpc('get_shared_video', { p_token: token });
  if (error) {
    // An invalid uuid in the link is simply "not found".
    if (error.code === '22P02') return null;
    throw new Error(error.message);
  }
  const row = (data as Array<{ template_slug: string; data: VideoData; updated_at: string }> | null)?.[0];
  return row ? { templateSlug: row.template_slug, data: row.data, updatedAt: row.updated_at } : null;
};

export const deleteDraft = async (id: string): Promise<{ error: string | null }> => {
  if (state.userId && supabase) {
    const { error } = await supabase.from('user_videos').delete().eq('id', id);
    if (error) return { error: error.message };
    setState({ drafts: state.drafts.filter((d) => d.id !== id) });
    return { error: null };
  }
  const all = readLocal().filter((d) => d.id !== id);
  writeLocal(all);
  setState({ drafts: all });
  return { error: null };
};

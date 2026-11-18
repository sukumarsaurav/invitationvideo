import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Supabase client scoped to the `invites` schema, or null until `.env.local` is filled in.
 * The app keeps working on local drafts while this is null.
 */
export const supabase: SupabaseClient<any, 'invites'> | null =
  url && anonKey
    ? createClient<any, 'invites'>(url, anonKey, {
        db: { schema: 'invites' },
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null;

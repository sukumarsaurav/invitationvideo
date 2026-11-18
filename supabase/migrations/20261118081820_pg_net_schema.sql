-- pg_net belongs in the extensions schema, not public (Supabase security advisor). Its functions
-- live in the "net" schema either way, so invites.fire_store_rebuild() is unaffected.
drop extension if exists pg_net;
create extension pg_net schema extensions;

-- invites.store_rebuild has row-level security on and no policies on purpose: only the
-- security-definer functions in admin_hardening read or write it.
comment on table invites.store_rebuild is 'Store rebuild queue (one row). No policies: read and written only by security-definer functions.';

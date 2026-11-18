-- Removes the storage policies left over from the earlier Invitation Videos setup.
-- Two of them had no bucket filter:
--   "Public Access Template Assets imhohi_0"   let anyone read every file in every bucket (incl. private order-uploads);
--   "Users can upload order assets 17rzor7_0" let any signed-in user upload into any bucket (incl. public ones).
-- The app does not use Supabase Storage (files go to Cloudflare R2), so every legacy policy is dropped.
-- With no policies, only the service role can read or write storage.
-- Safe on a fresh database: everything is "if exists".

drop policy if exists "Public Access Template Assets" on storage.objects;
drop policy if exists "Public Access Template Assets imhohi_0" on storage.objects;
drop policy if exists "Public Access Generated Videos" on storage.objects;
drop policy if exists "Service can upload generated videos" on storage.objects;
drop policy if exists "Users can upload order assets" on storage.objects;
drop policy if exists "Users can upload order assets 17rzor7_0" on storage.objects;
drop policy if exists "Users view own order uploads" on storage.objects;
drop policy if exists "Users view own order uploads 17rzor7_0" on storage.objects;
drop policy if exists "Users delete own order uploads" on storage.objects;

-- Public buckets serve files by URL without any policy check; make the legacy ones private.
-- (Buckets can't be deleted with SQL on the hosted project; delete the empty ones in the dashboard.)
update storage.buckets
set public = false
where id in ('template-assets', 'generated-videos', 'order-uploads');

-- Shareable, watermarked preview links ("send to family before paying").
-- The owner sets a random token on their video; anyone with the link can read
-- that one video's template and data through a narrow function, never the table.

alter table invites.user_videos
  add column share_token uuid unique;

create or replace function invites.get_shared_video(p_token uuid)
returns table (template_slug text, data jsonb, updated_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select t.slug, v.data, v.updated_at
  from invites.user_videos v
  join invites.templates t on t.id = v.template_id
  where v.share_token = p_token
    and p_token is not null
  limit 1;
$$;

revoke all on function invites.get_shared_video(uuid) from public;
grant execute on function invites.get_shared_video(uuid) to anon, authenticated;

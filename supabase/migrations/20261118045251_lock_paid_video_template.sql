-- A video's template is fixed once it has been paid for.
-- Without this, a customer could pay for a cheaper template and then switch the paid video
-- to a more expensive one. Wording, photos and details stay editable (typo fixes after payment).
-- The service role (Edge Functions, dashboard) can still change anything.

create or replace function invites.protect_video_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    if tg_op = 'INSERT' and new.status <> 'draft' then
      raise exception 'status can only be set by the server';
    end if;
    if tg_op = 'UPDATE' and new.status is distinct from old.status then
      raise exception 'status can only be set by the server';
    end if;
    if tg_op = 'UPDATE' and old.status <> 'draft' and new.template_id is distinct from old.template_id then
      raise exception 'the template of a paid video cannot be changed';
    end if;
  end if;
  return new;
end;
$$;

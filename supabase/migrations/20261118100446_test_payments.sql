-- Test payments: while Razorpay isn't integrated, "Download" asks for payment and a test "Pay"
-- button completes it. The server records a real order (source 'test', status 'paid') and marks
-- the video paid, the same way the Razorpay webhook will, so the rest of the app (HD download,
-- My Videos, admin dashboard and customer pages) works exactly as it will with real payments.
-- An admin switch (site setting "test_payments") turns it on and off; turn it off before launch.

-- Orders can come from test payments.
alter table invites.orders
  drop constraint orders_source_check,
  add constraint orders_source_check check (source in ('razorpay', 'manual', 'test'));

-- Server functions (security definer, so current_user is the function owner) may set a video's
-- status as well as the service role. Customers' own requests still can't.
create or replace function invites.protect_video_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' and current_user not in ('postgres', 'supabase_admin') then
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

-- The switch. Public, so the app knows to show the test "Pay" button.
insert into invites.site_settings (key, value, public)
values ('test_payments', '{"enabled": true}', true)
on conflict (key) do nothing;

create or replace function invites.site_setting_is_valid(k text, v jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(jsonb_typeof(v) = 'object' and case k
    when 'announcement' then
      jsonb_typeof(v -> 'enabled') = 'boolean'
      and jsonb_typeof(v -> 'text') = 'string' and length(v ->> 'text') <= 80
      -- Optional link: a page on this site ("/..."), never another site ("//...", "/\...", "https:").
      and (not v ? 'link' or jsonb_typeof(v -> 'link') = 'null'
           or (jsonb_typeof(v -> 'link') = 'string' and (v ->> 'link') ~ '^/([^/\\[:space:]][^[:space:]]*)?$'))
    when 'support_whatsapp' then
      jsonb_typeof(v -> 'number') = 'string' and (v ->> 'number') ~ '^[0-9]{0,15}$'
    when 'payments_enabled' then
      jsonb_typeof(v -> 'enabled') = 'boolean'
      and jsonb_typeof(v -> 'message') = 'string' and length(v ->> 'message') <= 140
    when 'maintenance' then
      jsonb_typeof(v -> 'enabled') = 'boolean'
      and jsonb_typeof(v -> 'text') = 'string' and length(v ->> 'text') <= 140
    when 'test_payments' then
      jsonb_typeof(v -> 'enabled') = 'boolean'
    else true
  end, false);
$$;

-- "Pay" with the test button: the signed-in owner's draft becomes paid, with a test order at the
-- template's current price (in paise, like Razorpay). Paying twice is harmless: a video that is
-- already paid is returned as it is.
create or replace function invites.pay_test(p_video_id uuid)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  v invites.user_videos;
  price int;
begin
  if uid is null then
    raise exception 'Sign in to pay.' using errcode = '42501';
  end if;
  if not coalesce((select (s.value ->> 'enabled')::boolean from invites.site_settings s where s.key = 'test_payments'), false) then
    raise exception 'Test payments are turned off.' using errcode = '42501';
  end if;
  if not coalesce((select (s.value ->> 'enabled')::boolean from invites.site_settings s where s.key = 'payments_enabled'), true) then
    raise exception 'Payments are paused. Please try again in a few minutes.' using errcode = 'P0001';
  end if;

  select * into v from invites.user_videos where id = p_video_id and user_id = uid for update;
  if not found then
    raise exception 'Video not found.' using errcode = 'P0002';
  end if;
  if v.status <> 'draft' then
    return v.status;
  end if;

  select t.price_inr into price from invites.templates t where t.id = v.template_id;

  insert into invites.orders (user_id, user_video_id, amount, currency, status, source, template_id, list_price, customer_email, paid_at)
  select uid, v.id, price * 100, 'INR', 'paid', 'test', v.template_id, price * 100, u.email, now()
  from auth.users u where u.id = uid;

  update invites.user_videos set status = 'paid' where id = v.id;
  return 'paid';
end;
$$;

revoke all on function invites.pay_test(uuid) from public;
grant execute on function invites.pay_test(uuid) to authenticated;

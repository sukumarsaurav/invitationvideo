-- Admin panel hardening, from the audit of Phase 1.
--   - Row rules: one policy per table and action, the admin check run once per query, not per row.
--   - Missing foreign-key indexes.
--   - Guard rails: template price range, valid site settings (a bad value can't break the store),
--     refunds no larger than the payment.
--   - Dashboard accuracy: refund and share-link dates, paid-only revenue per template, admins and
--     test accounts not counted as customers. Money stays in paise (smallest unit) everywhere.
--   - Customer search: viewers (masked emails) may only search an exact email or id, so they can't
--     piece an address together from partial matches; wildcards in searches are literal.
--   - Audit: opening a customer's details is logged; the log can't be updated, deleted or
--     truncated, not even with the service key.
--   - Names for admin ids (audit log, notes, history).
--   - Store rebuild queue: price, copy and visibility edits rebuild the pre-rendered pages (and the
--     price Google sees) through a Vercel deploy hook kept in Vault as "vercel_deploy_hook".

-- ---------------------------------------------------------------------------
-- Row rules: merged, and is_admin() wrapped in a sub-select so Postgres runs it once per query
-- ---------------------------------------------------------------------------

drop policy "active templates are public" on invites.templates;
drop policy "admins read every template" on invites.templates;
create policy "published templates are public; admins read all"
on invites.templates for select
to anon, authenticated
using (is_active or (select invites.is_admin('viewer')));

drop policy "managers edit templates" on invites.templates;
create policy "managers edit templates"
on invites.templates for update
to authenticated
using ((select invites.is_admin('manager')))
with check ((select invites.is_admin('manager')));

drop policy "owners read their videos" on invites.user_videos;
drop policy "support reads videos" on invites.user_videos;
create policy "owners and support read videos"
on invites.user_videos for select
to authenticated
using (user_id = (select auth.uid()) or (select invites.is_admin('support')));

drop policy "owners read their uploads" on invites.uploads;
drop policy "support reads uploads" on invites.uploads;
create policy "owners and support read uploads"
on invites.uploads for select
to authenticated
using (user_id = (select auth.uid()) or (select invites.is_admin('support')));

drop policy "owners read their orders" on invites.orders;
drop policy "admins read orders" on invites.orders;
create policy "owners and admins read orders"
on invites.orders for select
to authenticated
using (user_id = (select auth.uid()) or (select invites.is_admin('viewer')));

drop policy "owners read their renders" on invites.renders;
drop policy "admins read renders" on invites.renders;
create policy "owners and admins read renders"
on invites.renders for select
to authenticated
using (
  (select invites.is_admin('viewer'))
  or exists (select 1 from invites.user_videos v where v.id = renders.user_video_id and v.user_id = (select auth.uid()))
);

drop policy "admins see themselves; owners see all" on invites.admins;
create policy "admins see themselves; owners see all"
on invites.admins for select
to authenticated
using (user_id = (select auth.uid()) or (select invites.is_admin('owner')));

drop policy "managers read the audit log" on invites.audit_log;
create policy "managers read the audit log"
on invites.audit_log for select
to authenticated
using ((select invites.is_admin('manager')));

drop policy "public settings are public" on invites.site_settings;
create policy "public settings are public"
on invites.site_settings for select
to anon, authenticated
using (public or (select invites.is_admin('viewer')));

drop policy "managers edit settings" on invites.site_settings;
create policy "managers edit settings"
on invites.site_settings for update
to authenticated
using ((select invites.is_admin('manager')))
with check ((select invites.is_admin('manager')));

drop policy "support reads notes" on invites.customer_notes;
create policy "support reads notes"
on invites.customer_notes for select
to authenticated
using ((select invites.is_admin('support')));

drop policy "support adds notes" on invites.customer_notes;
create policy "support adds notes"
on invites.customer_notes for insert
to authenticated
with check ((select invites.is_admin('support')) and created_by = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Foreign-key indexes
-- ---------------------------------------------------------------------------

create index if not exists admins_created_by_idx on invites.admins (created_by);
create index if not exists customer_notes_created_by_idx on invites.customer_notes (created_by);
create index if not exists orders_template_idx on invites.orders (template_id);
create index if not exists site_settings_updated_by_idx on invites.site_settings (updated_by);
create index if not exists templates_category_idx on invites.templates (category_id);
create index if not exists templates_updated_by_idx on invites.templates (updated_by);
create index if not exists uploads_user_idx on invites.uploads (user_id);
create index if not exists uploads_user_video_idx on invites.uploads (user_video_id);

-- ---------------------------------------------------------------------------
-- Guard rails
-- ---------------------------------------------------------------------------

-- Whole rupees, ₹1 to ₹50,000: a typo can't make a template free or absurdly priced.
alter table invites.templates
  add constraint templates_price_range check (price_inr between 1 and 50000);

-- Money on orders is in paise (smallest currency unit), like Razorpay.
comment on column invites.orders.amount is 'Paise. What the customer paid.';
comment on column invites.orders.list_price is 'Paise. The template price at the time of the order.';
comment on column invites.orders.discount_amount is 'Paise.';
comment on column invites.orders.tax_amount is 'Paise.';
comment on column invites.orders.razorpay_fee is 'Paise.';
comment on column invites.orders.fee_tax is 'Paise.';
comment on column invites.orders.refunded_amount is 'Paise. Total refunded so far.';

alter table invites.orders
  add column refunded_at timestamptz,
  add constraint orders_refund_le_amount check (refunded_amount between 0 and amount);

-- Site settings: each key has a fixed shape, so a bad save can't crash every visitor's page.
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
    else true
  end, false);
$$;

alter table invites.site_settings
  add constraint site_settings_value_valid check (invites.site_setting_is_valid(key, value));

-- ---------------------------------------------------------------------------
-- Share links get a date, so the dashboard counts links made in a period (not later edits)
-- ---------------------------------------------------------------------------

alter table invites.user_videos add column share_created_at timestamptz;
update invites.user_videos set share_created_at = updated_at where share_token is not null;

create or replace function invites.user_videos_share_stamp()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.share_token is null then
    new.share_created_at := null;
  elsif tg_op = 'INSERT' or old.share_token is distinct from new.share_token then
    new.share_created_at := now();
  else
    new.share_created_at := old.share_created_at;
  end if;
  return new;
end;
$$;

create trigger user_videos_share_stamp
before insert or update on invites.user_videos
for each row execute function invites.user_videos_share_stamp();

-- ---------------------------------------------------------------------------
-- Audit log: truly append-only
-- ---------------------------------------------------------------------------

revoke update, delete, truncate on invites.audit_log from service_role;

create trigger audit_log_no_truncate
before truncate on invites.audit_log
for each statement execute function invites.audit_log_is_append_only();

-- ---------------------------------------------------------------------------
-- Customer search
-- ---------------------------------------------------------------------------

drop function invites.admin_customers(text, int, int);

-- Customers matching a search, newest first. Support and up: any part of an email. Viewers see
-- masked emails, so they may only search a whole email, an account id or an order/payment id.
create function invites.admin_customers(p_search text default '', p_limit int default 50, p_offset int default 0)
returns table (
  user_id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  is_admin boolean,
  videos bigint,
  paid_orders bigint,
  lifetime_spend bigint,
  total bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  can_see_email boolean := invites.is_admin('support');
  q text := lower(trim(coalesce(p_search, '')));
  -- Search text is literal: % and _ don't act as wildcards.
  pattern text := '%' || replace(replace(replace(q, '\', '\\'), '%', '\%'), '_', '\_') || '%';
begin
  if not invites.is_admin('viewer') then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return query
  with matched as (
    select u.id, u.email::text as email, u.created_at, u.last_sign_in_at
    from auth.users u
    where q = ''
      or (can_see_email and lower(u.email) like pattern escape '\')
      or lower(u.email) = q
      or u.id::text = q
      or exists (
        select 1 from invites.orders o
        where o.user_id = u.id and (o.id::text = q or lower(coalesce(o.razorpay_payment_id, '')) = q or lower(coalesce(o.razorpay_order_id, '')) = q)
      )
  ),
  page as (
    select m.*, count(*) over () as total
    from matched m
    order by m.created_at desc
    limit least(greatest(p_limit, 1), 200) offset greatest(p_offset, 0)
  )
  select
    p.id,
    case when can_see_email then p.email else invites.mask_email(p.email) end,
    p.created_at,
    p.last_sign_in_at,
    exists (select 1 from invites.admins a where a.user_id = p.id),
    (select count(*) from invites.user_videos v where v.user_id = p.id),
    (select count(*) from invites.orders o where o.user_id = p.id and o.status in ('paid', 'refunded', 'partially_refunded')),
    (select coalesce(sum(o.amount - o.refunded_amount), 0) from invites.orders o where o.user_id = p.id and o.status in ('paid', 'refunded', 'partially_refunded'))::bigint,
    p.total
  from page p
  order by p.created_at desc;
end;
$$;

revoke all on function invites.admin_customers(text, int, int) from public;
grant execute on function invites.admin_customers(text, int, int) to authenticated;

-- One customer's account details (support and up). Each opening is logged, at most once per
-- admin and customer every 10 minutes, so there is a record of who looked at whom.
create or replace function invites.admin_customer(p_user_id uuid)
returns table (user_id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz, provider text)
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if not invites.is_admin('support') then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if not exists (
    select 1 from invites.audit_log l
    where l.entity_type = 'customer' and l.entity_id = p_user_id::text and l.actor_id = auth.uid()
      and l.action = 'view' and l.created_at > now() - interval '10 minutes'
  ) then
    insert into invites.audit_log (actor_id, action, entity_type, entity_id)
    values (auth.uid(), 'view', 'customer', p_user_id::text);
  end if;
  return query
  select u.id, u.email::text, u.created_at, u.last_sign_in_at, coalesce(u.raw_app_meta_data ->> 'provider', 'email')
  from auth.users u where u.id = p_user_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Dashboard
-- ---------------------------------------------------------------------------

-- Numbers for [p_from, p_to) and the same-length period before. Money in paise.
-- Admin accounts are not customers and are left out of customer counts.
create or replace function invites.admin_dashboard(p_from timestamptz, p_to timestamptz)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  span interval := p_to - p_from;
  result jsonb;
begin
  if not invites.is_admin('viewer') then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  with periods (name, f, t) as (values ('current', p_from, p_to), ('previous', p_from - span, p_from))
  select jsonb_object_agg(p.name, jsonb_build_object(
    'new_customers', (select count(*) from auth.users u where u.created_at >= p.f and u.created_at < p.t
                        and not exists (select 1 from invites.admins a where a.user_id = u.id)),
    'drafts_created', (select count(*) from invites.user_videos v where v.created_at >= p.f and v.created_at < p.t),
    'share_links', (select count(*) from invites.user_videos v where v.share_created_at >= p.f and v.share_created_at < p.t),
    'paid_orders', (select count(*) from invites.orders o where o.paid_at >= p.f and o.paid_at < p.t and o.status in ('paid', 'refunded', 'partially_refunded')),
    'gross_revenue', (select coalesce(sum(o.amount), 0) from invites.orders o where o.paid_at >= p.f and o.paid_at < p.t and o.status in ('paid', 'refunded', 'partially_refunded')),
    'refunds', (select coalesce(sum(o.refunded_amount), 0) from invites.orders o where o.refunded_at >= p.f and o.refunded_at < p.t)
  ))
  into result
  from periods p;

  return result || jsonb_build_object(
    'totals', jsonb_build_object(
      'customers', (select count(*) from auth.users u where not exists (select 1 from invites.admins a where a.user_id = u.id)),
      'videos', (select count(*) from invites.user_videos),
      'published_templates', (select count(*) from invites.templates where is_active)
    ),
    'by_template', (
      select coalesce(jsonb_agg(row_to_json(x) order by x.drafts desc, x.name), '[]'::jsonb) from (
        select t.slug, t.name, t.is_active,
          (select count(*) from invites.user_videos v where v.template_id = t.id and v.created_at >= p_from and v.created_at < p_to) as drafts,
          (select count(*) from invites.orders o where o.template_id = t.id and o.paid_at >= p_from and o.paid_at < p_to
             and o.status in ('paid', 'refunded', 'partially_refunded')) as paid_orders,
          (select coalesce(sum(o.amount), 0) from invites.orders o where o.template_id = t.id and o.paid_at >= p_from and o.paid_at < p_to
             and o.status in ('paid', 'refunded', 'partially_refunded')) as revenue
        from invites.templates t
      ) x
    )
  );
end;
$$;

-- Drafts per template since p_from, for the templates list (cheaper than the whole dashboard).
create or replace function invites.admin_template_drafts(p_from timestamptz)
returns table (slug text, drafts bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not invites.is_admin('viewer') then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return query
  select t.slug, count(v.id)
  from invites.templates t
  left join invites.user_videos v on v.template_id = t.id and v.created_at >= p_from
  group by t.slug;
end;
$$;

revoke all on function invites.admin_template_drafts(timestamptz) from public;
grant execute on function invites.admin_template_drafts(timestamptz) to authenticated;

-- ---------------------------------------------------------------------------
-- Admin names: emails for ids that are, or acted as, admins (audit log, notes, history)
-- ---------------------------------------------------------------------------

create or replace function invites.admin_people(p_ids uuid[])
returns table (user_id uuid, email text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not invites.is_admin('viewer') then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return query
  select u.id, u.email::text
  from auth.users u
  where u.id = any (p_ids)
    and (
      exists (select 1 from invites.admins a where a.user_id = u.id)
      or exists (select 1 from invites.audit_log l where l.actor_id = u.id)
      or exists (select 1 from invites.customer_notes n where n.created_by = u.id)
    );
end;
$$;

revoke all on function invites.admin_people(uuid[]) from public;
grant execute on function invites.admin_people(uuid[]) to authenticated;

-- ---------------------------------------------------------------------------
-- Store rebuild queue
-- ---------------------------------------------------------------------------
-- The store's pre-rendered pages and sitemap (and the price in Google's structured data) are built
-- at deploy time. An edit to a store-visible template field queues a rebuild; a minute-by-minute
-- job sends it once edits have been quiet for 2 minutes, so a burst of saves makes one deploy.
-- Without the Vault secret "vercel_deploy_hook" nothing is sent and the panel says so.

create extension if not exists pg_net;

create table invites.store_rebuild (
  id int primary key default 1 check (id = 1),
  requested_at timestamptz,
  sent_at timestamptz
);
insert into invites.store_rebuild (id) values (1) on conflict do nothing;
alter table invites.store_rebuild enable row level security;
grant all on invites.store_rebuild to service_role;

create or replace function invites.templates_request_rebuild()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if row (new.name, new.description, new.price_inr, new.is_active, new.tags, new.category_id, new.sort_order,
          new.seo_title, new.seo_description, new.is_trending, new.popularity)
     is distinct from
     row (old.name, old.description, old.price_inr, old.is_active, old.tags, old.category_id, old.sort_order,
          old.seo_title, old.seo_description, old.is_trending, old.popularity)
  then
    update invites.store_rebuild set requested_at = now() where id = 1;
  end if;
  return null;
end;
$$;

create trigger templates_request_rebuild
after update on invites.templates
for each row execute function invites.templates_request_rebuild();

create or replace function invites.fire_store_rebuild()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  r invites.store_rebuild;
  hook text;
begin
  select * into r from invites.store_rebuild where id = 1 for update;
  if r.requested_at is null or (r.sent_at is not null and r.sent_at >= r.requested_at) then return; end if;
  if r.requested_at > now() - interval '2 minutes' then return; end if;
  select s.decrypted_secret into hook from vault.decrypted_secrets s where s.name = 'vercel_deploy_hook' limit 1;
  if hook is null or hook = '' then return; end if;
  perform net.http_post(url := hook, body := '{}'::jsonb);
  update invites.store_rebuild set sent_at = now() where id = 1;
end;
$$;

revoke all on function invites.fire_store_rebuild() from public, anon, authenticated;

select cron.schedule('store-rebuild', '* * * * *', 'select invites.fire_store_rebuild()');

-- For the panel: is a deploy hook set up, and is a rebuild waiting or sent.
create or replace function invites.admin_store_rebuild()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not invites.is_admin('viewer') then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return (
    select jsonb_build_object(
      'configured', exists (select 1 from vault.secrets s where s.name = 'vercel_deploy_hook'),
      'requested_at', r.requested_at,
      'sent_at', r.sent_at
    )
    from invites.store_rebuild r where r.id = 1
  );
end;
$$;

revoke all on function invites.admin_store_rebuild() from public;
grant execute on function invites.admin_store_rebuild() to authenticated;

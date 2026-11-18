-- Admin panel, Phase 1 foundations (see the Admin Panel Plan).
--   admins + roles, is_admin() (requires a second-factor session), append-only audit_log,
--   site_settings, customer_notes, admin-editable template fields, order fixes for payments,
--   admin read policies, and server functions for customer search and the dashboard.

-- ---------------------------------------------------------------------------
-- Admins and roles
-- ---------------------------------------------------------------------------

-- Declaration order is the rank: viewer < support < manager < owner.
create type invites.admin_role as enum ('viewer', 'support', 'manager', 'owner');

create table invites.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role invites.admin_role not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table invites.admins enable row level security;

-- True when the caller is an admin of at least min_role AND signed in with a second factor (aal2).
create or replace function invites.is_admin(min_role invites.admin_role default 'viewer')
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
    and exists (
      select 1 from invites.admins a
      where a.user_id = (select auth.uid()) and a.role >= min_role
    );
$$;

-- The caller's admin role whatever their sign-in level, so the panel knows to ask for the second factor.
create or replace function invites.my_admin_role()
returns invites.admin_role
language sql
stable
security definer
set search_path = ''
as $$
  select a.role from invites.admins a where a.user_id = (select auth.uid());
$$;

revoke all on function invites.is_admin(invites.admin_role) from public;
revoke all on function invites.my_admin_role() from public;
-- anon too: policies shared with signed-out visitors call it (it is simply false for them).
grant execute on function invites.is_admin(invites.admin_role) to anon, authenticated;
grant execute on function invites.my_admin_role() to authenticated;

create policy "admins see themselves; owners see all"
on invites.admins for select
to authenticated
using (user_id = (select auth.uid()) or invites.is_admin('owner'));

grant select on invites.admins to authenticated;

-- ---------------------------------------------------------------------------
-- Audit log: append-only for everyone, owners included
-- ---------------------------------------------------------------------------

create table invites.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text,
  before jsonb,
  after jsonb,
  reason text,
  created_at timestamptz not null default now()
);

create index audit_log_created_idx on invites.audit_log (created_at desc);
create index audit_log_entity_idx on invites.audit_log (entity_type, entity_id, created_at desc);

alter table invites.audit_log enable row level security;

create policy "managers read the audit log"
on invites.audit_log for select
to authenticated
using (invites.is_admin('manager'));

grant select on invites.audit_log to authenticated;

create or replace function invites.audit_log_is_append_only()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'audit_log is append-only';
end;
$$;

create trigger audit_log_no_update
before update or delete on invites.audit_log
for each statement execute function invites.audit_log_is_append_only();

-- Generic row audit: who changed which row, before and after.
create or replace function invites.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_new jsonb := case when tg_op = 'DELETE' then null else to_jsonb(new) end;
  row_old jsonb := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
begin
  insert into invites.audit_log (actor_id, action, entity_type, entity_id, before, after)
  values (
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    coalesce(row_new ->> 'slug', row_old ->> 'slug', row_new ->> 'key', row_old ->> 'key',
             row_new ->> 'id', row_old ->> 'id', row_new ->> 'user_id', row_old ->> 'user_id'),
    row_old,
    row_new
  );
  return coalesce(new, old);
end;
$$;

create trigger admins_audit
after insert or update or delete on invites.admins
for each row execute function invites.audit_row_change();

-- ---------------------------------------------------------------------------
-- Templates: fields admins own
-- ---------------------------------------------------------------------------

alter table invites.templates
  add column sort_order int not null default 0,
  add column seo_title text,
  add column seo_description text,
  add column published_at timestamptz,
  add column updated_by uuid references auth.users (id) on delete set null,
  add column code_hash text;

-- Already-live templates count as published.
update invites.templates set published_at = created_at where is_active and published_at is null;

create or replace function invites.templates_stamp()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_by := coalesce(auth.uid(), new.updated_by);
  if new.is_active and not coalesce(old.is_active, false) and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger templates_stamp
before update on invites.templates
for each row execute function invites.templates_stamp();

create trigger templates_audit
after insert or update or delete on invites.templates
for each row execute function invites.audit_row_change();

create policy "admins read every template"
on invites.templates for select
to authenticated
using (invites.is_admin('viewer'));

create policy "managers edit templates"
on invites.templates for update
to authenticated
using (invites.is_admin('manager'))
with check (invites.is_admin('manager'));

-- Managers may change selling fields only; animation fields (fps, size, schema) belong to the code.
grant update (
  name, description, category_id, price_inr, is_active, tags, is_trending, popularity, sort_order,
  seo_title, seo_description, preview_url, thumbnail_url
) on invites.templates to authenticated;

-- ---------------------------------------------------------------------------
-- Site settings (announcement, support number, switches)
-- ---------------------------------------------------------------------------

create table invites.site_settings (
  key text primary key,
  value jsonb not null,
  public boolean not null default false,
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table invites.site_settings enable row level security;

create or replace function invites.site_settings_stamp()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := coalesce(auth.uid(), new.updated_by);
  return new;
end;
$$;

create trigger site_settings_stamp
before update on invites.site_settings
for each row execute function invites.site_settings_stamp();

create trigger site_settings_audit
after insert or update or delete on invites.site_settings
for each row execute function invites.audit_row_change();

create policy "public settings are public"
on invites.site_settings for select
to anon, authenticated
using (public or invites.is_admin('viewer'));

create policy "managers edit settings"
on invites.site_settings for update
to authenticated
using (invites.is_admin('manager'))
with check (invites.is_admin('manager'));

grant select on invites.site_settings to anon, authenticated;
grant update (value) on invites.site_settings to authenticated;

insert into invites.site_settings (key, value, public) values
  ('announcement', '{"enabled": true, "text": "Free preview · Pay only for HD", "link": "/templates"}', true),
  ('support_whatsapp', '{"number": ""}', true),
  ('payments_enabled', '{"enabled": true, "message": ""}', true),
  ('maintenance', '{"enabled": false, "text": ""}', true)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Customer notes (support)
-- ---------------------------------------------------------------------------

create table invites.customer_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (length(body) between 1 and 4000),
  created_by uuid not null default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index customer_notes_user_idx on invites.customer_notes (user_id, created_at desc);

alter table invites.customer_notes enable row level security;

create policy "support reads notes"
on invites.customer_notes for select
to authenticated
using (invites.is_admin('support'));

create policy "support adds notes"
on invites.customer_notes for insert
to authenticated
with check (invites.is_admin('support') and created_by = (select auth.uid()));

grant select, insert on invites.customer_notes to authenticated;

-- ---------------------------------------------------------------------------
-- Orders: keep payment records when a customer is deleted; fields for Phase 2
-- ---------------------------------------------------------------------------

alter table invites.orders
  alter column user_id drop not null,
  drop constraint orders_user_id_fkey,
  add constraint orders_user_id_fkey foreign key (user_id) references auth.users (id) on delete set null,
  drop constraint orders_amount_check,
  add constraint orders_amount_check check (amount >= 0),
  drop constraint orders_status_check,
  add constraint orders_status_check check (status in ('created', 'paid', 'failed', 'refunded', 'partially_refunded')),
  add column customer_email text,
  add column source text not null default 'razorpay' check (source in ('razorpay', 'manual')),
  add column template_id uuid references invites.templates (id),
  add column list_price int,
  add column discount_amount int not null default 0,
  add column tax_amount int not null default 0,
  add column razorpay_fee int,
  add column fee_tax int,
  add column paid_at timestamptz,
  add column refunded_amount int not null default 0;

-- The order's video may be deleted with its owner; the order itself stays.
alter table invites.orders
  alter column user_video_id drop not null,
  drop constraint orders_user_video_id_fkey,
  add constraint orders_user_video_id_fkey foreign key (user_video_id) references invites.user_videos (id) on delete set null;

create index orders_user_idx on invites.orders (user_id);
create index orders_created_idx on invites.orders (created_at desc);
create index user_videos_template_idx on invites.user_videos (template_id);

-- ---------------------------------------------------------------------------
-- Admin read access to customer data
-- ---------------------------------------------------------------------------

create policy "admins read orders"
on invites.orders for select
to authenticated
using (invites.is_admin('viewer'));

create policy "admins read renders"
on invites.renders for select
to authenticated
using (invites.is_admin('viewer'));

create policy "support reads videos"
on invites.user_videos for select
to authenticated
using (invites.is_admin('support'));

create policy "support reads uploads"
on invites.uploads for select
to authenticated
using (invites.is_admin('support'));

-- ---------------------------------------------------------------------------
-- Server functions: customer search and dashboard numbers (auth.users is not exposed)
-- ---------------------------------------------------------------------------

create or replace function invites.mask_email(e text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case when e is null or position('@' in e) = 0 then e
    else left(e, 1) || '***' || substr(e, position('@' in e)) end;
$$;

-- Customers matching an email, user id or order id. Viewers get masked emails.
create or replace function invites.admin_customers(p_search text default '', p_limit int default 50, p_offset int default 0)
returns table (
  user_id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
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
begin
  if not invites.is_admin('viewer') then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return query
  with matched as (
    select u.id, u.email::text as email, u.created_at, u.last_sign_in_at
    from auth.users u
    where q = ''
      or lower(u.email) like '%' || q || '%'
      or u.id::text = q
      or exists (
        select 1 from invites.orders o
        where o.user_id = u.id and (o.id::text = q or lower(coalesce(o.razorpay_payment_id, '')) = q or lower(coalesce(o.razorpay_order_id, '')) = q)
      )
  )
  select
    m.id,
    case when can_see_email then m.email else invites.mask_email(m.email) end,
    m.created_at,
    m.last_sign_in_at,
    (select count(*) from invites.user_videos v where v.user_id = m.id),
    (select count(*) from invites.orders o where o.user_id = m.id and o.status in ('paid', 'refunded', 'partially_refunded')),
    (select coalesce(sum(o.amount - o.refunded_amount), 0) from invites.orders o where o.user_id = m.id and o.status in ('paid', 'refunded', 'partially_refunded'))::bigint,
    count(*) over ()
  from matched m
  order by m.created_at desc
  limit least(greatest(p_limit, 1), 200) offset greatest(p_offset, 0);
end;
$$;

-- One customer's account details (support and up).
create or replace function invites.admin_customer(p_user_id uuid)
returns table (user_id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz, provider text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not invites.is_admin('support') then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return query
  select u.id, u.email::text, u.created_at, u.last_sign_in_at, coalesce(u.raw_app_meta_data ->> 'provider', 'email')
  from auth.users u where u.id = p_user_id;
end;
$$;

-- Dashboard numbers for [p_from, p_to), plus the same-length period before for comparison.
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
    'new_customers', (select count(*) from auth.users u where u.created_at >= p.f and u.created_at < p.t),
    'drafts_created', (select count(*) from invites.user_videos v where v.created_at >= p.f and v.created_at < p.t),
    'share_links', (select count(*) from invites.user_videos v where v.share_token is not null and v.updated_at >= p.f and v.updated_at < p.t),
    'paid_orders', (select count(*) from invites.orders o where o.paid_at >= p.f and o.paid_at < p.t and o.status in ('paid', 'refunded', 'partially_refunded')),
    'gross_revenue', (select coalesce(sum(o.amount), 0) from invites.orders o where o.paid_at >= p.f and o.paid_at < p.t and o.status in ('paid', 'refunded', 'partially_refunded')),
    'refunds', (select coalesce(sum(o.refunded_amount), 0) from invites.orders o where o.paid_at >= p.f and o.paid_at < p.t)
  ))
  into result
  from periods p;

  return result || jsonb_build_object(
    'totals', jsonb_build_object(
      'customers', (select count(*) from auth.users),
      'videos', (select count(*) from invites.user_videos),
      'published_templates', (select count(*) from invites.templates where is_active)
    ),
    'by_template', (
      select coalesce(jsonb_agg(row_to_json(x) order by x.drafts desc), '[]'::jsonb) from (
        select t.slug, t.name, t.is_active,
          (select count(*) from invites.user_videos v where v.template_id = t.id and v.created_at >= p_from and v.created_at < p_to) as drafts,
          (select count(*) from invites.orders o where o.template_id = t.id and o.paid_at >= p_from and o.paid_at < p_to) as paid_orders,
          (select coalesce(sum(o.amount), 0) from invites.orders o where o.template_id = t.id and o.paid_at >= p_from and o.paid_at < p_to) as revenue
        from invites.templates t
      ) x
    )
  );
end;
$$;

revoke all on function invites.admin_customers(text, int, int) from public;
revoke all on function invites.admin_customer(uuid) from public;
revoke all on function invites.admin_dashboard(timestamptz, timestamptz) from public;
grant execute on function invites.admin_customers(text, int, int) to authenticated;
grant execute on function invites.admin_customer(uuid) to authenticated;
grant execute on function invites.admin_dashboard(timestamptz, timestamptz) to authenticated;

grant all on invites.admins, invites.audit_log, invites.site_settings, invites.customer_notes to service_role;

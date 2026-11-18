-- invitationvideos.com core schema.
-- Lives in its own `invites` schema so it can share an existing Supabase project safely.

create schema if not exists invites;

grant usage on schema invites to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function invites.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Catalogue (public read, admin write via service role / dashboard)
-- ---------------------------------------------------------------------------

create table invites.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order int not null default 0
);

create table invites.templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category_id uuid not null references invites.categories (id),
  name text not null,
  description text not null default '',
  fps int not null default 30,
  width int not null default 1080,
  height int not null default 1920,
  duration_frames int not null,
  price_inr int not null check (price_inr >= 0),
  price_usd numeric(10, 2),
  preview_url text,
  thumbnail_url text,
  schema jsonb not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger templates_updated_at
before update on invites.templates
for each row execute function invites.set_updated_at();

-- ---------------------------------------------------------------------------
-- Customer data
-- ---------------------------------------------------------------------------

create table invites.user_videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  template_id uuid not null references invites.templates (id),
  data jsonb not null default '{}'::jsonb,
  music_key text,
  status text not null default 'draft' check (status in ('draft', 'paid', 'rendered')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_videos_user_updated_idx on invites.user_videos (user_id, updated_at desc);

create trigger user_videos_updated_at
before update on invites.user_videos
for each row execute function invites.set_updated_at();

-- Only server code (service role, i.e. Edge Functions) may move a video past "draft".
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
  end if;
  return new;
end;
$$;

create trigger user_videos_protect_status
before insert or update on invites.user_videos
for each row execute function invites.protect_video_status();

create table invites.uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  user_video_id uuid references invites.user_videos (id) on delete cascade,
  r2_key text not null,
  kind text not null check (kind in ('photo', 'music')),
  created_at timestamptz not null default now()
);

create table invites.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  user_video_id uuid not null references invites.user_videos (id) on delete cascade,
  amount int not null check (amount > 0), -- smallest currency unit (paise)
  currency text not null default 'INR',
  razorpay_order_id text unique,
  razorpay_payment_id text,
  status text not null default 'created' check (status in ('created', 'paid', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_video_idx on invites.orders (user_video_id);

create trigger orders_updated_at
before update on invites.orders
for each row execute function invites.set_updated_at();

create table invites.renders (
  id uuid primary key default gen_random_uuid(),
  user_video_id uuid not null references invites.user_videos (id) on delete cascade,
  r2_key text not null,
  resolution text not null,
  size_bytes bigint,
  expires_at timestamptz not null default now() + interval '30 days',
  created_at timestamptz not null default now()
);

create index renders_user_video_idx on invites.renders (user_video_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table invites.categories enable row level security;
alter table invites.templates enable row level security;
alter table invites.user_videos enable row level security;
alter table invites.uploads enable row level security;
alter table invites.orders enable row level security;
alter table invites.renders enable row level security;

create policy "categories are public"
on invites.categories for select
to anon, authenticated
using (true);

create policy "active templates are public"
on invites.templates for select
to anon, authenticated
using (is_active);

create policy "owners read their videos"
on invites.user_videos for select
to authenticated
using (user_id = (select auth.uid()));

create policy "owners create their videos"
on invites.user_videos for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "owners edit their videos"
on invites.user_videos for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "owners delete their drafts"
on invites.user_videos for delete
to authenticated
using (user_id = (select auth.uid()) and status = 'draft');

create policy "owners read their uploads"
on invites.uploads for select
to authenticated
using (user_id = (select auth.uid()));

create policy "owners add uploads"
on invites.uploads for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "owners delete uploads"
on invites.uploads for delete
to authenticated
using (user_id = (select auth.uid()));

-- Orders and renders are written only by Edge Functions (service role bypasses RLS).
create policy "owners read their orders"
on invites.orders for select
to authenticated
using (user_id = (select auth.uid()));

create policy "owners read their renders"
on invites.renders for select
to authenticated
using (
  exists (
    select 1 from invites.user_videos v
    where v.id = renders.user_video_id and v.user_id = (select auth.uid())
  )
);

-- ---------------------------------------------------------------------------
-- Table privileges (RLS still decides which rows)
-- ---------------------------------------------------------------------------

grant select on invites.categories, invites.templates to anon, authenticated;
grant select, insert, update, delete on invites.user_videos to authenticated;
grant select, insert, delete on invites.uploads to authenticated;
grant select on invites.orders, invites.renders to authenticated;
grant all on all tables in schema invites to service_role;

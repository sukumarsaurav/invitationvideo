-- Razorpay payments and coupons.
--
-- The price is always worked out here, never by the browser: invites._quote() takes the template's
-- current price and an optional coupon. Edge functions (supabase/functions/razorpay-*) hold the
-- Razorpay secret and call the service-role-only functions below:
--   razorpay-order   -> create_order()             a pending order (or a free one, for 100% coupons)
--                    -> attach_razorpay_order()     the Razorpay order id it was paid against
--   razorpay-verify  -> settle_razorpay_order()     after checking Razorpay's signature
--   razorpay-webhook -> settle_razorpay_order()     the same, if the customer closed the page first
-- Settling is idempotent: the browser and the webhook can both report the same payment.
-- Test payments (site setting "test_payments") use the same pricing and coupons through pay_test().

-- ---------------------------------------------------------------------------
-- Coupons
-- ---------------------------------------------------------------------------

create table invites.coupons (
  id uuid primary key default gen_random_uuid(),
  -- Stored upper case; customers may type any case.
  code text not null unique check (code ~ '^[A-Z0-9_-]{3,24}$'),
  description text not null default '' check (length(description) <= 140),
  kind text not null check (kind in ('percent', 'flat')),
  -- percent: 1-100. flat: whole rupees off.
  value int not null check (value > 0),
  max_redemptions int check (max_redemptions is null or max_redemptions > 0),
  -- Paid orders that used the coupon. Set by the server only.
  redeemed_count int not null default 0 check (redeemed_count >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (kind <> 'percent' or value <= 100),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create trigger coupons_updated_at
before update on invites.coupons
for each row execute function invites.set_updated_at();

-- Admin edits are audited; a sale bumping redeemed_count is not (orders already record it).
create trigger coupons_audit_insert_delete
after insert or delete on invites.coupons
for each row execute function invites.audit_row_change();

create trigger coupons_audit_update
after update on invites.coupons
for each row
when ((to_jsonb(old) - 'redeemed_count' - 'updated_at') is distinct from (to_jsonb(new) - 'redeemed_count' - 'updated_at'))
execute function invites.audit_row_change();

alter table invites.coupons enable row level security;

create policy "admins read coupons"
on invites.coupons for select
to authenticated
using ((select invites.is_admin('viewer')));

create policy "managers add coupons"
on invites.coupons for insert
to authenticated
with check ((select invites.is_admin('manager')));

create policy "managers edit coupons"
on invites.coupons for update
to authenticated
using ((select invites.is_admin('manager')))
with check ((select invites.is_admin('manager')));

-- No deletes (orders point at coupons): switch a coupon off instead.
grant select on invites.coupons to authenticated;
grant insert (code, description, kind, value, max_redemptions, starts_at, ends_at, active) on invites.coupons to authenticated;
grant update (description, max_redemptions, starts_at, ends_at, active) on invites.coupons to authenticated;
grant all on invites.coupons to service_role;

-- Orders remember the coupon. 'coupon' orders are ones a 100% coupon made free.
alter table invites.orders
  add column coupon_id uuid references invites.coupons (id) on delete set null,
  add column coupon_code text,
  drop constraint orders_source_check,
  add constraint orders_source_check check (source in ('razorpay', 'manual', 'test', 'coupon'));

create index orders_coupon_idx on invites.orders (coupon_id) where coupon_id is not null;
create index orders_video_status_idx on invites.orders (user_video_id, status);

comment on column invites.orders.coupon_code is 'The code as it was when used (coupons can be edited later).';

-- ---------------------------------------------------------------------------
-- Pricing
-- ---------------------------------------------------------------------------

-- The price of one video for one customer, with an optional coupon. Amounts in paise.
-- A bad coupon doesn't fail the quote: it comes back at full price with coupon_error set, so the
-- page can say what's wrong. Razorpay's smallest charge is Rs 1, so a discount never leaves less
-- than that (only a 100% coupon makes a video free).
create or replace function invites._quote(p_user uuid, p_video_id uuid, p_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v invites.user_videos;
  t invites.templates;
  c invites.coupons;
  v_code text := upper(nullif(btrim(coalesce(p_code, '')), ''));
  list_price int;
  discount int := 0;
  amount int;
  coupon_error text;
begin
  select * into v from invites.user_videos where id = p_video_id and user_id = p_user;
  if not found then
    raise exception 'Video not found.' using errcode = 'P0002';
  end if;
  select * into t from invites.templates where id = v.template_id;
  list_price := t.price_inr * 100;

  if v_code is not null then
    select * into c from invites.coupons where coupons.code = v_code;
    if not found or not c.active then
      coupon_error := 'This coupon code isn''t valid.';
    elsif c.starts_at is not null and now() < c.starts_at then
      coupon_error := 'This coupon isn''t active yet.';
    elsif c.ends_at is not null and now() >= c.ends_at then
      coupon_error := 'This coupon has expired.';
    elsif c.max_redemptions is not null and c.redeemed_count >= c.max_redemptions then
      coupon_error := 'This coupon has been fully used.';
    else
      discount := case c.kind
        -- Whole rupees, so prices never show paise.
        when 'percent' then (round(t.price_inr * c.value / 100.0) * 100)::int
        else least(c.value * 100, list_price)
      end;
    end if;
  end if;

  amount := list_price - discount;
  if amount > 0 and amount < 100 then
    amount := 100;
    discount := list_price - 100;
  end if;

  return jsonb_build_object(
    'status', v.status,
    'template_id', t.id,
    'template_name', t.name,
    'list_price', list_price,
    'discount', discount,
    'amount', amount,
    'currency', 'INR',
    'coupon_id', case when coupon_error is null and v_code is not null then c.id end,
    'coupon_code', case when coupon_error is null and v_code is not null then c.code end,
    'coupon_error', coupon_error
  );
end;
$$;

revoke all on function invites._quote(uuid, uuid, text) from public, anon, authenticated;
grant execute on function invites._quote(uuid, uuid, text) to service_role;

-- What the download page shows before paying: the signed-in owner's price, with a coupon if given.
create or replace function invites.quote_price(p_video_id uuid, p_code text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in to pay.' using errcode = '42501';
  end if;
  return invites._quote(auth.uid(), p_video_id, p_code);
end;
$$;

revoke all on function invites.quote_price(uuid, text) from public;
grant execute on function invites.quote_price(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------

-- Marks an order paid, its video paid and its coupon used. Safe to call again for the same order.
create or replace function invites._settle_order(p_order_id uuid, p_payment_id text, p_fee int, p_fee_tax int)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  o invites.orders;
begin
  select * into o from invites.orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found.' using errcode = 'P0002';
  end if;
  if o.status in ('paid', 'refunded', 'partially_refunded') then
    -- Already settled (the browser and the webhook both report it). Fill in fees if they arrived later.
    update invites.orders
      set razorpay_fee = coalesce(razorpay_fee, p_fee), fee_tax = coalesce(fee_tax, p_fee_tax)
      where id = o.id and (razorpay_fee is null or fee_tax is null);
    return o.status;
  end if;

  update invites.orders
    set status = 'paid', paid_at = now(), razorpay_payment_id = coalesce(p_payment_id, razorpay_payment_id),
        razorpay_fee = p_fee, fee_tax = p_fee_tax
    where id = o.id;
  update invites.user_videos set status = 'paid' where id = o.user_video_id and status = 'draft';
  if o.coupon_id is not null then
    update invites.coupons set redeemed_count = redeemed_count + 1 where id = o.coupon_id;
  end if;
  return 'paid';
end;
$$;

revoke all on function invites._settle_order(uuid, text, int, int) from public, anon, authenticated;
grant execute on function invites._settle_order(uuid, text, int, int) to service_role;

-- A new order at the quoted price. Returns the quote plus order_id and the order's status:
-- 'created' (pay with Razorpay next), 'paid' (a 100% coupon, or a video that was already paid:
-- then order_id is null). A bad coupon is an error here, so nobody pays full price by surprise.
create or replace function invites.create_order(p_user uuid, p_video_id uuid, p_code text, p_source text default 'razorpay')
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  q jsonb;
  order_id uuid;
  v_email text;
begin
  if p_source not in ('razorpay', 'test') then
    raise exception 'Unknown payment source.';
  end if;
  if not coalesce((select (s.value ->> 'enabled')::boolean from invites.site_settings s where s.key = 'payments_enabled'), true) then
    raise exception 'Payments are paused. Please try again in a few minutes.' using errcode = 'P0001';
  end if;

  -- Lock the video so two taps on Pay can't make two free orders.
  perform 1 from invites.user_videos where id = p_video_id and user_id = p_user for update;
  q := invites._quote(p_user, p_video_id, p_code);
  if q ->> 'status' <> 'draft' then
    return q || jsonb_build_object('order_id', null, 'order_status', 'paid');
  end if;
  if q ->> 'coupon_error' is not null then
    raise exception '%', q ->> 'coupon_error' using errcode = 'P0001';
  end if;

  select u.email into v_email from auth.users u where u.id = p_user;
  insert into invites.orders (user_id, user_video_id, amount, currency, status, source, template_id, list_price,
                              discount_amount, coupon_id, coupon_code, customer_email)
  values (p_user, p_video_id, (q ->> 'amount')::int, 'INR', 'created',
          case when (q ->> 'amount')::int = 0 then 'coupon' else p_source end,
          (q ->> 'template_id')::uuid, (q ->> 'list_price')::int, (q ->> 'discount')::int,
          (q ->> 'coupon_id')::uuid, q ->> 'coupon_code', v_email)
  returning id into order_id;

  if (q ->> 'amount')::int = 0 then
    perform invites._settle_order(order_id, null, 0, 0);
    return q || jsonb_build_object('order_id', order_id, 'order_status', 'paid', 'email', v_email);
  end if;
  return q || jsonb_build_object('order_id', order_id, 'order_status', 'created', 'email', v_email);
end;
$$;

revoke all on function invites.create_order(uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function invites.create_order(uuid, uuid, text, text) to service_role;

create or replace function invites.attach_razorpay_order(p_order_id uuid, p_razorpay_order_id text)
returns void
language sql
security definer
set search_path = ''
as $$
  update invites.orders set razorpay_order_id = p_razorpay_order_id where id = p_order_id and status = 'created';
$$;

revoke all on function invites.attach_razorpay_order(uuid, text) from public, anon, authenticated;
grant execute on function invites.attach_razorpay_order(uuid, text) to service_role;

-- A Razorpay payment for one of our orders went through. The caller has already checked Razorpay's
-- signature. The amount must match the order, so a payment for a different price can't settle it.
create or replace function invites.settle_razorpay_order(
  p_razorpay_order_id text, p_payment_id text, p_amount int, p_fee int default null, p_fee_tax int default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  o invites.orders;
begin
  select * into o from invites.orders where razorpay_order_id = p_razorpay_order_id;
  if not found then
    raise exception 'Order not found.' using errcode = 'P0002';
  end if;
  if p_amount is not null and p_amount <> o.amount then
    raise exception 'Paid amount % does not match the order amount %.', p_amount, o.amount;
  end if;
  return invites._settle_order(o.id, p_payment_id, p_fee, p_fee_tax);
end;
$$;

revoke all on function invites.settle_razorpay_order(text, text, int, int, int) from public, anon, authenticated;
grant execute on function invites.settle_razorpay_order(text, text, int, int, int) to service_role;

-- ---------------------------------------------------------------------------
-- Test payments: the same price and coupons, settled straight away
-- ---------------------------------------------------------------------------

drop function invites.pay_test(uuid);

create or replace function invites.pay_test(p_video_id uuid, p_code text default null)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  r jsonb;
begin
  if uid is null then
    raise exception 'Sign in to pay.' using errcode = '42501';
  end if;
  if not coalesce((select (s.value ->> 'enabled')::boolean from invites.site_settings s where s.key = 'test_payments'), false) then
    raise exception 'Test payments are turned off.' using errcode = '42501';
  end if;
  r := invites.create_order(uid, p_video_id, p_code, 'test');
  if r ->> 'order_status' = 'created' then
    perform invites._settle_order((r ->> 'order_id')::uuid, null, null, null);
  end if;
  return 'paid';
end;
$$;

revoke all on function invites.pay_test(uuid, text) from public;
grant execute on function invites.pay_test(uuid, text) to authenticated;

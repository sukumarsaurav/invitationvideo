-- Removed the earlier Invitation Videos setup from the public schema of the hosted project
-- (replaced by the `invites` schema). Objects are named one by one; storage buckets, their
-- policies and auth users are kept. Safe on a fresh database: everything is "if exists".

do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'cron') then
    perform cron.unschedule(jobname)
    from cron.job
    where jobname in ('cleanup-expired-drafts', 'cleanup-old-analytics', 'reset-daily-sequences');
  end if;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

drop table if exists
  public.ticket_messages, public.support_tickets, public.order_uploads, public.renders, public.orders,
  public.draft_orders, public.promo_codes, public.campaigns, public.page_views, public.visitors,
  public.wishlist, public.template_field_mapping, public.template_fields, public.template_images,
  public.template_thumbnails, public.field_presets, public.templates, public.categories,
  public.blog_posts, public.settings, public.user_profiles
cascade;

drop function if exists
  public.anonymize_ip(text), public.anonymize_visitor_ip(), public.classify_traffic_source(text, text, text),
  public.cleanup_expired_drafts(), public.cleanup_old_analytics(), public.generate_order_number(),
  public.generate_ticket_number(), public.get_setting(text), public.get_table_sizes(), public.handle_new_user(),
  public.is_admin(), public.reset_daily_sequences(), public.set_order_number(), public.set_published_at(),
  public.set_ticket_number(), public.update_updated_at_column(), public.validate_promo_code(text, numeric)
cascade;

drop sequence if exists public.order_daily_counter, public.ticket_daily_counter;

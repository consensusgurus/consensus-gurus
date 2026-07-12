-- Egress fix (2026-07-12): /api/visitors previously pulled the ENTIRE views and
-- quiz_views tables out of Supabase on every cache miss just to add up their
-- count columns. Sum in SQL instead so only one number leaves the database.
create or replace function public.site_view_total()
returns bigint
language sql
stable
as $$
  select coalesce((select sum(count) from public.views), 0)
       + coalesce((select sum(count) from public.quiz_views), 0);
$$;

grant execute on function public.site_view_total() to anon, authenticated, service_role;

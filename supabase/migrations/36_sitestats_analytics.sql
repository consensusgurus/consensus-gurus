-- =========================================================================
-- Migration 36: /sitestats quick-reference analytics
--
-- Powers the public mobile stats page at /sitestats. Two SQL-side aggregates
-- so the route ships only a handful of numbers out of Supabase instead of the
-- raw view-event tables (the same egress discipline as site_view_total(),
-- migration 34, and visitor_active_counts(), migration 30).
--
-- Quiz-player metrics are computed in-process from the existing quiz_results
-- cache, so they need NO database function. These two functions cover the
-- SITE-VIEWER half (distinct visitors + raw page views), unioning both view
-- streams (list pages -> view_events, quiz pages -> quiz_view_events).
--
-- "Site viewer" here follows the same definition as visitor_active_counts():
-- a distinct browser is one non-null visitor_id (written server-side from the
-- sot_vid cookie). Historical rows with a NULL visitor_id still count toward
-- raw page views but not toward distinct visitors.
--
-- Run this whole file in your Supabase project's SQL Editor.
-- =========================================================================

-- -------------------------------------------------------------------------
-- Trailing-window traffic: distinct visitors + raw page views for the
-- current and immediately-preceding day / week / month, so the page can show
-- Day-over-Day, Week-over-Week and Month-over-Month % change. All twelve
-- numbers come back in ONE row.
--   *_d  = last 24h        *_dp = the 24h before that
--   *_w  = last 7 days     *_wp = the 7 days before that
--   *_m  = last 30 days    *_mp = the 30 days before that
-- -------------------------------------------------------------------------
create or replace function site_view_trends()
returns table (
  viewers_d  bigint, viewers_dp bigint,
  viewers_w  bigint, viewers_wp bigint,
  viewers_m  bigint, viewers_mp bigint,
  views_d    bigint, views_dp   bigint,
  views_w    bigint, views_wp   bigint,
  views_m    bigint, views_mp   bigint
)
language sql
stable
as $$
  with ev as (
    select visitor_id, created_at
      from view_events
     where created_at >= now() - interval '60 days'
    union all
    select visitor_id, created_at
      from quiz_view_events
     where created_at >= now() - interval '60 days'
  )
  select
    count(distinct visitor_id) filter (where created_at >= now() - interval '1 day'),
    count(distinct visitor_id) filter (where created_at <  now() - interval '1 day'  and created_at >= now() - interval '2 days'),
    count(distinct visitor_id) filter (where created_at >= now() - interval '7 days'),
    count(distinct visitor_id) filter (where created_at <  now() - interval '7 days'  and created_at >= now() - interval '14 days'),
    count(distinct visitor_id) filter (where created_at >= now() - interval '30 days'),
    count(distinct visitor_id) filter (where created_at <  now() - interval '30 days' and created_at >= now() - interval '60 days'),
    count(*) filter (where created_at >= now() - interval '1 day'),
    count(*) filter (where created_at <  now() - interval '1 day'  and created_at >= now() - interval '2 days'),
    count(*) filter (where created_at >= now() - interval '7 days'),
    count(*) filter (where created_at <  now() - interval '7 days'  and created_at >= now() - interval '14 days'),
    count(*) filter (where created_at >= now() - interval '30 days'),
    count(*) filter (where created_at <  now() - interval '30 days' and created_at >= now() - interval '60 days')
  from ev;
$$;

grant execute on function site_view_trends() to anon;

-- -------------------------------------------------------------------------
-- Today's page views bucketed by hour-of-day, in the site's display timezone
-- (US Eastern by default), for the time-of-day distribution chart. Returns one
-- row per hour that had activity: the distinct-visitor count (chart's total
-- "viewers" outer bar) and the raw page-view count. "Today" is the local
-- calendar day in p_tz.
-- -------------------------------------------------------------------------
create or replace function site_view_hourly_today(p_tz text default 'America/New_York')
returns table (hour int, viewers bigint, views bigint)
language sql
stable
as $$
  with ev as (
    select visitor_id, created_at
      from view_events
     where created_at >= (date_trunc('day', now() at time zone p_tz)) at time zone p_tz
    union all
    select visitor_id, created_at
      from quiz_view_events
     where created_at >= (date_trunc('day', now() at time zone p_tz)) at time zone p_tz
  )
  select
    extract(hour from (created_at at time zone p_tz))::int as hour,
    count(distinct visitor_id)::bigint                     as viewers,
    count(*)::bigint                                       as views
  from ev
  group by 1
  order by 1;
$$;

grant execute on function site_view_hourly_today(text) to anon;

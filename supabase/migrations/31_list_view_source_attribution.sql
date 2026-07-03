-- =========================================================================
-- Migration 31: traffic-source attribution for list page views
-- Extends view_events (migrations 04 + 26 + 30) with best-effort, NULLABLE
-- columns so the admin Views panel can break a list's traffic down by source:
-- bot vs human, channel, referrer host, UTM campaign tags, and city. (country
-- and region already exist from migration 26.)
--
-- is_bot        : true when the user-agent is a known crawler/bot (isbot).
-- channel       : direct | organic | social | referral | internal.
-- referrer_host : bare host of the browser's document.referrer (e.g. google.com),
--                 sent in the view body; NULL for direct.
-- utm_source/medium/campaign : landing-URL UTM tags, sent in the view body.
-- city          : Vercel x-vercel-ip-city edge header (free on all plans).
--
-- /api/views tolerates these columns being absent (it tiers the insert down to
-- the previously-applied column set, then to the bare row), so the code is safe
-- to deploy before this runs. Run it in the Supabase SQL Editor after
-- 30_visitor_active_users.sql; the new columns simply start filling in.
-- =========================================================================

alter table view_events add column if not exists is_bot        boolean;
alter table view_events add column if not exists channel       text;
alter table view_events add column if not exists referrer_host text;
alter table view_events add column if not exists utm_source    text;
alter table view_events add column if not exists utm_medium    text;
alter table view_events add column if not exists utm_campaign  text;
alter table view_events add column if not exists city          text;

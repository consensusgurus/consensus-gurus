-- =========================================================================
-- Migration 40: offline / print campaign attribution (?c=<code>)
--
-- Powers the QR-code and print-ad measurement. A campaign link looks like
--   https://sourceoftruths.com/tally?c=qr-tally-sun
-- and is DELIBERATELY a different parameter from the player-referral ?ref=
-- (migration 38). ?ref= credits one registered player for inviting another;
-- ?c= measures a marketing placement and must never consume a visitor's
-- one-and-only referral slot.
--
-- Flow:
--   1. Any landing page runs captureCampaign() (lib/campaigns.js, mounted once
--      via VisitorBeacon), which POSTs /api/campaign, stores the code in the
--      first-party 'sot_camp' cookie, and strips ?c= back out of the URL.
--   2. /api/campaign writes ONE campaign_hits row per landing. That row IS the
--      scan: a person who scans the QR and bounces still counts.
--   3. On any later finished game, /api/quiz/result stamps quiz_results.campaign
--      from that cookie, so scans can be followed through to real plays.
--
-- Both are best-effort: the API and the result route tolerate this migration
-- not being applied yet, so the code is safe to deploy before this runs.
-- Run this whole file in your Supabase project's SQL Editor.
-- =========================================================================

create table if not exists campaign_hits (
  id            bigint generated always as identity primary key,
  campaign      text not null,
  path          text,                 -- landing path, e.g. /tally
  visitor_id    text,                 -- sot_vid cookie: distinct browser
  referrer_host text,                 -- normally null for a QR scan (no referrer)
  country       text,
  region        text,
  city          text,
  ua_browser    text,
  ua_os         text,
  is_mobile     boolean,
  is_bot        boolean,
  created_at    timestamptz not null default now()
);

create index if not exists campaign_hits_campaign on campaign_hits (campaign, created_at desc);
create index if not exists campaign_hits_created  on campaign_hits (created_at desc);
-- One landing row per browser per campaign per day keeps a curious scanner who
-- reloads the page from inflating the scan count, while still showing repeat
-- interest on later days.
create unique index if not exists campaign_hits_daily_unique
  on campaign_hits (campaign, visitor_id, (created_at at time zone 'America/New_York')::date)
  where visitor_id is not null;

alter table campaign_hits enable row level security;

-- Campaign stamped on every completed game played by a visitor who arrived on a
-- campaign link (30-day cookie window), so scans -> plays is a real join.
alter table quiz_results add column if not exists campaign text;
create index if not exists quiz_results_campaign
  on quiz_results (campaign) where campaign is not null;

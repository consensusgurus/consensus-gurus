-- Consensus change tracking: snapshots of each list's consensus top 10,
-- plus alerts when a new item enters the top 10 or top 3 (needs research:
-- a description for top-10 entrants, a hero photo for top-3 entrants).
-- Run in the Supabase SQL Editor.

create table if not exists consensus_snapshots (
  list_id text primary key,
  top10 jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists consensus_alerts (
  id bigint generated always as identity primary key,
  list_id text not null,
  item_name text not null,
  change_type text not null check (change_type in ('entered_top10', 'entered_top3')),
  rank integer,
  detected_at timestamptz not null default now(),
  resolved boolean not null default false
);

create index if not exists consensus_alerts_unresolved
  on consensus_alerts (resolved, detected_at desc);

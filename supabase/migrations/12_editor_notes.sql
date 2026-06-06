-- =========================================================================
-- Migration: editor's notes on a list's activity feed
--
-- Free-standing notes an admin posts to a list (e.g. when adding/removing a
-- source or re-researching). They render in the list Activity feed and the
-- site-wide /feed as "Editor's Note: <note>". Managed from the admin Notes tab
-- (/api/admin/notes). Reads/writes go through the service-role key, so no anon
-- policy is required.
--
-- Run this in your Supabase SQL Editor.
-- =========================================================================

create table if not exists public.list_editor_notes (
  id          bigint generated always as identity primary key,
  list_id     text not null,
  note        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists list_editor_notes_idx
  on public.list_editor_notes (list_id, created_at desc);

alter table public.list_editor_notes enable row level security;

-- Run this once in the Supabase SQL editor to enable the
-- "Complain / Request New Research" button + admin Notices tab.

create table if not exists public.complaints (
  id          bigint generated always as identity primary key,
  list_id     text not null,
  list_title  text,
  message     text,
  created_at  timestamptz not null default now()
);

alter table public.complaints enable row level security;

-- Readers (anon key) may file a complaint, nothing else.
create policy "anon can insert complaints"
  on public.complaints
  for insert
  to anon
  with check (true);

-- Reads and dismissals run through the service-role key in the admin
-- API routes, which bypass RLS — so no select/delete policy is needed.

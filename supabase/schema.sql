-- =========================================================================
-- Consensus Gurus database schema
-- Run this entire file in your Supabase project's SQL Editor.
-- =========================================================================

-- VOTES: one row per (list_id, item_name), score is the aggregate
create table if not exists votes (
  list_id text not null,
  item_name text not null,
  score integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (list_id, item_name)
);

-- VIEWS: one row per list_id, count is the total
create table if not exists views (
  list_id text primary key,
  count integer not null default 0,
  updated_at timestamptz not null default now()
);

-- EXTRAS: user-added vote items, one row per (list_id, item_name)
create table if not exists extras (
  list_id text not null,
  item_name text not null,
  added_at timestamptz not null default now(),
  primary key (list_id, item_name)
);

-- USER_LISTS: lists submitted by readers (require moderation before going public)
create table if not exists user_lists (
  id text primary key,
  title text not null,
  category text,
  type text,
  link_type text default 'search',
  blurb text,
  default_source text default 'ai',
  sources jsonb not null,
  vote_items jsonb not null,
  links jsonb,
  published boolean not null default false,
  submitted_at timestamptz not null default now()
);

-- =========================================================================
-- RPC function: apply a vote delta atomically. Avoids race conditions
-- when multiple users vote at the same time.
-- =========================================================================
create or replace function apply_vote(p_list_id text, p_item_name text, p_delta int)
returns int
language plpgsql
security definer
as $$
declare
  new_score int;
begin
  insert into votes (list_id, item_name, score, updated_at)
  values (p_list_id, p_item_name, p_delta, now())
  on conflict (list_id, item_name)
  do update set score = votes.score + p_delta, updated_at = now()
  returning score into new_score;
  return new_score;
end;
$$;

-- =========================================================================
-- RPC function: increment view count atomically
-- =========================================================================
create or replace function increment_view(p_list_id text)
returns int
language plpgsql
security definer
as $$
declare
  new_count int;
begin
  insert into views (list_id, count, updated_at)
  values (p_list_id, 1, now())
  on conflict (list_id)
  do update set count = views.count + 1, updated_at = now()
  returning count into new_count;
  return new_count;
end;
$$;

-- =========================================================================
-- Row Level Security
-- Public can read everything. Writes are restricted but the anon key
-- can call the RPCs above (security definer bypasses RLS).
-- Submissions and extras are inserted directly with constraints below.
-- =========================================================================
alter table votes enable row level security;
alter table views enable row level security;
alter table extras enable row level security;
alter table user_lists enable row level security;

-- Anyone can read
create policy "votes are public" on votes for select using (true);
create policy "views are public" on views for select using (true);
create policy "extras are public" on extras for select using (true);
create policy "published user_lists are public" on user_lists for select using (published = true);

-- Anyone can insert extras (with length cap on item_name)
create policy "anyone can add extras" on extras
  for insert with check (
    length(item_name) > 0
    and length(item_name) <= 100
    and length(list_id) <= 100
  );

-- Anyone can submit a list (with length caps)
create policy "anyone can submit lists" on user_lists
  for insert with check (
    length(id) <= 100
    and length(title) <= 100
    and length(coalesce(category, '')) <= 50
    and length(coalesce(blurb, '')) <= 250
  );

-- Grant execute on RPCs to anon role (for browser-side calls via supabase-js)
grant execute on function apply_vote(text, text, int) to anon;
grant execute on function increment_view(text) to anon;

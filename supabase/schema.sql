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

-- =========================================================================
-- RPC function: rename a user-submitted extra item, moving any aggregated
-- vote score across (and merging if the new name already has votes).
-- Called by the admin /api/admin/extras/rename route via the service-role
-- key. NOT granted to anon.
-- =========================================================================
create or replace function rename_extra(
  p_list_id text,
  p_old_name text,
  p_new_name text
)
returns void
language plpgsql
security definer
as $$
declare
  v_old_score int;
  v_new_score int;
begin
  if p_list_id is null or p_old_name is null or p_new_name is null then
    raise exception 'rename_extra: arguments cannot be null';
  end if;
  if length(p_new_name) = 0 or length(p_new_name) > 100 then
    raise exception 'rename_extra: new name length must be 1-100';
  end if;
  if p_old_name = p_new_name then
    return;
  end if;

  -- Move vote score across.
  select score into v_old_score from votes
    where list_id = p_list_id and item_name = p_old_name;
  if v_old_score is not null then
    select score into v_new_score from votes
      where list_id = p_list_id and item_name = p_new_name;
    if v_new_score is not null then
      update votes set score = score + v_old_score, updated_at = now()
        where list_id = p_list_id and item_name = p_new_name;
    else
      insert into votes (list_id, item_name, score, updated_at)
        values (p_list_id, p_new_name, v_old_score, now());
    end if;
    delete from votes where list_id = p_list_id and item_name = p_old_name;
  end if;

  -- Move the extras row across if present.
  if exists (
    select 1 from extras where list_id = p_list_id and item_name = p_old_name
  ) then
    insert into extras (list_id, item_name, added_at)
      values (p_list_id, p_new_name, now())
      on conflict (list_id, item_name) do nothing;
    delete from extras where list_id = p_list_id and item_name = p_old_name;
  end if;
end;
$$;

grant execute on function rename_extra(text, text, text) to service_role;

-- =========================================================================
-- RPC function: rename a user-submitted extra item, moving any aggregated
-- vote score across (and merging if the new name already has votes).
-- Called by the admin /api/admin/extras/rename route via the service-role
-- key. NOT granted to anon.
-- =========================================================================
create or replace function rename_extra(
  p_list_id text,
  p_old_name text,
  p_new_name text
)
returns void
language plpgsql
security definer
as $$
declare
  v_old_score int;
  v_new_score int;
begin
  if p_list_id is null or p_old_name is null or p_new_name is null then
    raise exception 'rename_extra: arguments cannot be null';
  end if;
  if length(p_new_name) = 0 or length(p_new_name) > 100 then
    raise exception 'rename_extra: new name length must be 1-100';
  end if;
  if p_old_name = p_new_name then
    return;
  end if;

  -- Move vote score across.
  select score into v_old_score from votes
    where list_id = p_list_id and item_name = p_old_name;
  if v_old_score is not null then
    select score into v_new_score from votes
      where list_id = p_list_id and item_name = p_new_name;
    if v_new_score is not null then
      update votes set score = score + v_old_score, updated_at = now()
        where list_id = p_list_id and item_name = p_new_name;
    else
      insert into votes (list_id, item_name, score, updated_at)
        values (p_list_id, p_new_name, v_old_score, now());
    end if;
    delete from votes where list_id = p_list_id and item_name = p_old_name;
  end if;

  -- Move the extras row across if present.
  if exists (
    select 1 from extras where list_id = p_list_id and item_name = p_old_name
  ) then
    insert into extras (list_id, item_name, added_at)
      values (p_list_id, p_new_name, now())
      on conflict (list_id, item_name) do nothing;
    delete from extras where list_id = p_list_id and item_name = p_old_name;
  end if;
end;
$$;

grant execute on function rename_extra(text, text, text) to service_role;

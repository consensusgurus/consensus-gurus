-- Quiz leaderboard + accurate play counting.
-- Run in the Supabase SQL Editor.
--
-- quiz_users   : lightweight identity (username + email, no password, no
--                verification). One row per email (upsert on join).
-- quiz_results : one row per COMPLETED quiz game (anonymous OR signed-up).
--                Play count   = count(*) for a quiz_id.
--                Average correct = avg(score).
--                Signed-up rows (user_id not null) drive the per-quiz
--                leaderboard, ranked by score desc, then time_elapsed asc.
--
-- PII: emails live only in quiz_users, which has RLS enabled with NO policies
-- so the anon key cannot read it directly. All access is via the security-
-- definer RPCs below (which never return email) or the service-role key.

create table if not exists quiz_users (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  email text not null,
  created_at timestamptz not null default now()
);
create unique index if not exists quiz_users_email_key on quiz_users (lower(email));

create table if not exists quiz_results (
  id bigint generated always as identity primary key,
  quiz_id text not null,
  user_id uuid references quiz_users(id) on delete set null,
  username text,                       -- denormalized for fast leaderboard reads
  score int not null,
  total int not null,
  time_elapsed int not null,           -- seconds from Play to finish
  created_at timestamptz not null default now()
);
create index if not exists quiz_results_quiz on quiz_results (quiz_id);
create index if not exists quiz_results_quiz_user on quiz_results (quiz_id, user_id);

-- Lock direct anon access; all reads go through the definer RPCs below.
alter table quiz_users enable row level security;
alter table quiz_results enable row level security;

-- Upsert a leaderboard identity by email; returns the (possibly updated) row.
create or replace function quiz_join(p_username text, p_email text)
returns table(id uuid, username text, email text)
language plpgsql security definer as $$
begin
  return query
  insert into quiz_users (username, email)
  values (p_username, p_email)
  on conflict (lower(email))
  do update set username = excluded.username
  returning quiz_users.id, quiz_users.username, quiz_users.email;
end;
$$;

-- Accurate play count + average correct for a quiz (all completed games).
create or replace function quiz_stats(p_quiz_id text)
returns table(plays bigint, avg_score numeric)
language sql stable security definer as $$
  select count(*)::bigint as plays,
         round(avg(score)::numeric, 1) as avg_score
  from quiz_results
  where quiz_id = p_quiz_id;
$$;

-- Per-quiz leaderboard: each signed-up user's BEST attempt, ranked.
create or replace function quiz_leaderboard(p_quiz_id text, p_limit int default 25)
returns table(username text, score int, time_elapsed int)
language sql stable security definer as $$
  select b.username, b.score, b.time_elapsed
  from (
    select distinct on (user_id) user_id, username, score, time_elapsed
    from quiz_results
    where quiz_id = p_quiz_id and user_id is not null
    order by user_id, score desc, time_elapsed asc
  ) b
  order by b.score desc, b.time_elapsed asc
  limit p_limit;
$$;

grant execute on function quiz_join(text, text)          to anon, authenticated;
grant execute on function quiz_stats(text)               to anon, authenticated;
grant execute on function quiz_leaderboard(text, int)    to anon, authenticated;

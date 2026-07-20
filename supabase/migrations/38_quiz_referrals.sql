-- Referral credit for quiz + daily-game finishes.
-- Run in the Supabase SQL Editor.
--
-- quiz_referrals : one row per REFERRED PERSON, never per play. A person can
--                  only ever credit ONE referrer (unique index on referred_key),
--                  so a friend who plays every day counts once. referred_key is
--                  the referred browser's visitor id (localStorage sot_quiz_anon,
--                  mirrored to the sot_vid cookie by lib/visitor.js).
-- quiz_users.ref_code : the stable public share code. Share links are
--                  https://sourceoftruths.com/quizzes?ref=<ref_code>. It is kept
--                  separate from username on purpose so an admin rename
--                  (api/admin/quiz-user-rename) never breaks live share links.
--
-- Credit fires in app/api/quiz/result once a game is recorded and NOT abandoned,
-- which is the single chokepoint every board posts to, so all quizzes and all
-- daily games are covered with no per-board wiring.

create table if not exists quiz_referrals (
  id bigint generated always as identity primary key,
  referrer_user_id uuid not null references quiz_users(id) on delete cascade,
  referred_key text not null,          -- referred browser's visitor/anon id
  referred_user_id uuid references quiz_users(id) on delete set null,
  quiz_id text,                        -- the finish that earned the credit
  seeded boolean not null default false,
  created_at timestamptz not null default now()
);

-- One credit per referred person, ever. This is the anti-farming rule.
create unique index if not exists quiz_referrals_referred_key on quiz_referrals (referred_key);
create index if not exists quiz_referrals_referrer on quiz_referrals (referrer_user_id, created_at desc);
create index if not exists quiz_referrals_created on quiz_referrals (created_at desc);

alter table quiz_referrals enable row level security;

-- Stable public share code per user.
alter table quiz_users add column if not exists ref_code text;
create unique index if not exists quiz_users_ref_code_key on quiz_users (lower(ref_code));

-- Backfill a code for every existing user: alphanumeric slug of the username,
-- suffixed with a slice of the uuid where two usernames collapse to one slug.
update quiz_users u set ref_code = s.code
from (
  select id,
         case when row_number() over (
                partition by lower(regexp_replace(username, '[^a-zA-Z0-9]', '', 'g'))
                order by created_at, id
              ) = 1
              then lower(regexp_replace(username, '[^a-zA-Z0-9]', '', 'g'))
              else lower(regexp_replace(username, '[^a-zA-Z0-9]', '', 'g'))
                   || left(replace(id::text, '-', ''), 4)
         end as code
  from quiz_users
) s
where s.id = u.id
  and u.ref_code is null
  and s.code <> '';

-- Rolling-window top referrers. Ties break to whoever got there first.
create or replace function quiz_top_referrers(p_days int default 30, p_limit int default 10)
returns table(username text, ref_code text, credits bigint)
language sql stable security definer as $$
  select u.username, u.ref_code, count(*)::bigint as credits
  from quiz_referrals r
  join quiz_users u on u.id = r.referrer_user_id
  where r.created_at >= now() - make_interval(days => p_days)
  group by u.id, u.username, u.ref_code
  order by credits desc, min(r.created_at) asc
  limit p_limit;
$$;

grant execute on function quiz_top_referrers(int, int) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Launch seed: Gator85 at 17 credits (owner-requested, 2026-07-20).
--
-- Gator85 is a REAL existing account (the owner's own login, under its own
-- email), so this attaches the seeded credits to that account rather than
-- creating a shadow user. The backfill above has already given it
-- ref_code = 'gator85' (the slug of its username), so its share link is live.
-- The create-if-absent below only fires on a database where the account does
-- not exist at all, e.g. a fresh local copy.
--
-- Every seeded row carries seeded = true, so removing the whole seed later is:
--     delete from quiz_referrals where seeded;
-- Seeded credits are dated across the last 21 days and age out of the rolling
-- 30-day window on their own.
-- ---------------------------------------------------------------------------
insert into quiz_users (username, email, ref_code)
select 'Gator85', 'gator85@seed.sourceoftruths.com', 'gator85'
where not exists (select 1 from quiz_users where lower(username) = 'gator85');

-- Make sure the account holds the 'gator85' code even if it predates the
-- backfill or was renamed into place.
update quiz_users set ref_code = 'gator85'
where id = (select id from quiz_users where lower(username) = 'gator85' order by created_at limit 1)
  and ref_code is null
  and not exists (select 1 from quiz_users where lower(ref_code) = 'gator85');

insert into quiz_referrals (referrer_user_id, referred_key, quiz_id, seeded, created_at)
select u.id, 'seed:gator85:' || g, null, true, now() - make_interval(days => (g % 21))
from (select id from quiz_users where lower(username) = 'gator85' order by created_at limit 1) u,
     generate_series(1, 17) g
on conflict (referred_key) do nothing;

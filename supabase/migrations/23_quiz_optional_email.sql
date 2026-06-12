-- Make the quiz leaderboard email OPTIONAL: a player can join with just a
-- display name. The identity is then keyed by the browser's anon_id (the token
-- already stored on quiz_results by migration 22), and adding an email later
-- lets them reconnect on another device.
--
-- Run in the Supabase SQL Editor (after 22_quiz_anon_link.sql).
--
-- The existing unique index on lower(email) still holds: Postgres treats NULLs
-- as distinct, so any number of name-only (email-less) identities is allowed.

-- 1. Email is no longer required.
alter table quiz_users alter column email drop not null;

-- 2. Remember which browser created each identity, so a name-only signup can be
--    found again on the next visit, and so games already played from that
--    browser attach to it (one identity per browser via the partial unique index).
alter table quiz_users add column if not exists anon_id text;

create unique index if not exists quiz_users_anon_key
  on quiz_users (anon_id)
  where anon_id is not null;

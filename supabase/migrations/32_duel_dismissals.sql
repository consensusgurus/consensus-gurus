-- =========================================================================
-- Migration 32: quiz_duel_dismissals  (account-level "I dismissed this duel
-- notification", so a dismissed challenge / your-turn / result pop-up stays
-- gone across the player's devices -- not just the browser that dismissed it).
--
-- The duel notification bell on /quizzes previously hid dismissals only in
-- localStorage (per-browser). This table records each dismissal keyed by the
-- browser anon token + kind; /api/duel/notifications resolves the account's
-- full anon set (by email / shared user_id) and filters out any duel a member
-- anon has dismissed. Run in the Supabase SQL Editor after
-- 31_list_view_source_attribution.sql.
--   kind: 'later' = challenge / your-turn pop-up (the x / Maybe Later button)
--         'seen'  = completed/declined result pop-up (the Dismiss button)
-- =========================================================================

create table if not exists quiz_duel_dismissals (
  id          bigserial primary key,
  duel_token  text not null,
  anon_id     text not null,
  kind        text not null default 'later',   -- later | seen
  created_at  timestamptz not null default now(),
  unique (duel_token, anon_id, kind)
);

create index if not exists idx_duel_dismissals_anon  on quiz_duel_dismissals (anon_id);
create index if not exists idx_duel_dismissals_token on quiz_duel_dismissals (duel_token);

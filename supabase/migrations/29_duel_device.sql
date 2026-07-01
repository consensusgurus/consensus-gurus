-- =========================================================================
-- Migration 29: quiz_duels.device — device fairness for duels
-- Playing a quiz on desktop (big screen, keyboard) is a real advantage over a
-- phone. A duel can require both players use the same device class so the match
-- is fair. 'any' = no restriction (default), 'mobile' = both must play on a
-- phone, 'desktop' = both must play on a computer. Enforced at submit time
-- against quiz_results.is_mobile (migration 25). Run after 28_quiz_duels.sql.
-- =========================================================================
alter table quiz_duels add column if not exists device text not null default 'any';

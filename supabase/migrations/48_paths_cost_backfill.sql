-- Paths: convert the stored `guesses_used` from "over perfect" to raw COST.
-- Run in the Supabase SQL Editor. One-off, but written to be safe to re-run.
--
-- WHY: the daily leaderboard's `guesses_used` column is headed by each game's
-- own word (lib/daily-games.js). Paths headed it "Over" and stored cost minus
-- the board's perfect, so a reader had to already know the perfect to tell how
-- a run went, while the end card headline directly above it said "Linked for
-- <cost>". Commit d12cee750 (2026-08-08) changed the client to post the raw
-- spend and renamed the column to "Cost".
--
-- Ordering is NOT affected either way: `perfect` is a constant for a given
-- board, so sorting on cost and on cost-minus-perfect produce the identical
-- order, and nothing scores off this field (it is a leaderboard tiebreak and a
-- display value only). See lib/quiz-anon.js buildLeaderboard and
-- lib/daily-combined.js scoreGame, whose comparators must always agree.
--
-- WHAT IS LEFT INCONSISTENT WITHOUT THIS: the three boards played before that
-- deploy still hold "over" values, which under a "Cost" header read as absurdly
-- cheap networks (a 4 on a board whose perfect is 30). Worse, 2026-08-08 was
-- live at deploy time, so its rows are MIXED and its tiebreak among equal
-- scores is inverted until this runs.
--
--   quiz_id         live        perfect  step
--   paths-8-6-26    2026-08-06       30     4
--   paths-8-7-26    2026-08-07       36     5
--   paths-8-8-26    2026-08-08       33     4
--
-- (step = stepFor(perfect) from lib/par.js: cushion = max(4, 2*round(perfect*0.25/2)),
--  step = cushion/2. Score is max(1, min(10, 10 - floor(over/step))).)
--
-- HOW A ROW IS IDENTIFIED, so this cannot double-apply. A row is only touched
-- when BOTH hold:
--   1. it was written before the deploy cutoff, and
--   2. its stored score is what scoreFor() gives when the stored figure is read
--      as an OVER value.
-- After the update, condition 2 no longer holds for that row (the figure is now
-- ~perfect larger, which scores far lower), so re-running is a no-op.
--
-- Rows scoring exactly 1 are deliberately EXCLUDED: 1 is the score floor, so
-- both readings can produce it and the two cannot be told apart. Step 1 below
-- lists any such row for manual handling. On a board with perfect 33 that means
-- a player who finished 36+ over, so there are very probably none.

-- ---------------------------------------------------------------------------
-- STEP 1. Look before you leap. Run this first and read the output.
-- `reads_as` says which unit each row is already in. Expect every row created
-- before the deploy to say 'over' and every row after it to say 'cost'.
-- Anything in 'ambiguous (score floor)' needs a human decision.
-- ---------------------------------------------------------------------------
select
  r.id,
  r.quiz_id,
  r.created_at,
  r.score,
  r.guesses_used,
  coalesce(r.abandoned, false) as abandoned,
  case
    when coalesce(r.abandoned, false) then 'abandoned (figure will be cleared)'
    when r.guesses_used is null then 'no figure'
    when r.score = 1 then 'ambiguous (score floor) - REVIEW BY HAND'
    when r.score = greatest(1, least(10, 10 - floor(r.guesses_used::numeric / b.step)))
      then 'over  -> will become ' || (r.guesses_used + b.perfect)
    else 'cost  -> left alone'
  end as reads_as
from quiz_results r
join (values
  ('paths-8-6-26', 30, 4),
  ('paths-8-7-26', 36, 5),
  ('paths-8-8-26', 33, 4)
) as b(quiz_id, perfect, step) on b.quiz_id = r.quiz_id
order by r.quiz_id, r.created_at;

-- ---------------------------------------------------------------------------
-- STEP 2. The backfill. Run once STEP 1 looks right.
-- ---------------------------------------------------------------------------
begin;

-- Completed runs: add the board's perfect back so the figure is the real spend.
update quiz_results r
   set guesses_used = r.guesses_used + b.perfect
  from (values
    ('paths-8-6-26', 30, 4),
    ('paths-8-7-26', 36, 5),
    ('paths-8-8-26', 33, 4)
  ) as b(quiz_id, perfect, step)
 where r.quiz_id = b.quiz_id
   and r.created_at < timestamptz '2026-08-08T14:20:00Z'
   and coalesce(r.abandoned, false) = false
   and r.guesses_used is not null
   and r.score > 1
   and r.score = greatest(1, least(10, 10 - floor(r.guesses_used::numeric / b.step)));

-- Abandons posted a literal 0, which under a "Cost" header reads as a network
-- built for free. Clear it so the board renders a dash, matching what the
-- client now posts for an abandon (no figure at all). Idempotent: once null,
-- the `= 0` predicate no longer matches.
update quiz_results
   set guesses_used = null
 where quiz_id in ('paths-8-6-26', 'paths-8-7-26', 'paths-8-8-26')
   and coalesce(abandoned, false) = true
   and guesses_used = 0;

commit;

-- ---------------------------------------------------------------------------
-- STEP 3. Verify. Every completed row should now be >= its board's perfect,
-- because no network can be built for less than the proven cheapest one.
-- Any row listed here is wrong and should be reported before anything else.
-- ---------------------------------------------------------------------------
select r.id, r.quiz_id, r.score, r.guesses_used, b.perfect
from quiz_results r
join (values
  ('paths-8-6-26', 30),
  ('paths-8-7-26', 36),
  ('paths-8-8-26', 33)
) as b(quiz_id, perfect) on b.quiz_id = r.quiz_id
where coalesce(r.abandoned, false) = false
  and r.guesses_used is not null
  and r.guesses_used < b.perfect;

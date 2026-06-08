-- 19: Re-attribute consensus alerts wrongly blamed on votes.
--
-- Rows written before migration 16 carry cause NULL, and the ledgers used to
-- render any non-'edit' cause -- including NULL -- with a "Voting" chip. So
-- edit-caused ranking changes on lists where NO ONE has ever voted displayed
-- as vote-driven (e.g. the 2026-06-06 meyhane entries on dive-bars-istanbul,
-- which came from the rename/reseed deploy that morning). A list with no rows
-- in votes or vote_events cannot have a vote-caused ranking change; attribute
-- those rows to 'edit'.
update consensus_alerts a
set cause = 'edit'
where (a.cause is null or a.cause = 'votes')
  and not exists (select 1 from votes v where v.list_id = a.list_id)
  and not exists (select 1 from vote_events e where e.list_id = a.list_id);

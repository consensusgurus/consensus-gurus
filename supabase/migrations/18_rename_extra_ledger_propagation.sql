-- =========================================================================
-- Migration 18: propagate admin renames to the activity ledger.
--
-- rename_extra previously only moved the extras row and its aggregated
-- vote score. The activity ledgers read item names from vote_events and
-- consensus_alerts, and the daily consensus cron diffs against the stored
-- consensus_snapshots.top10 array — so a rename left the OLD name in every
-- ledger entry (and the next cron run could fire a spurious exited/entered
-- pair when the snapshot still held the old name). Trigger case: the Lulu
-- (Sag Harbor) rename showed on consensus/sources but not in the ledger.
--
-- This replaces rename_extra so a rename also updates:
--   1. vote_events.item_name        (per-list + universal ledger vote rows)
--   2. consensus_alerts.item_name   (ranking-change ledger entries)
--   3. consensus_snapshots.top10    (jsonb array; prevents spurious diffs)
--
-- Run this in the Supabase SQL Editor.
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

  -- No-op when names match
  if p_old_name = p_new_name then
    return;
  end if;

  -- 1. Move any aggregated vote score across.
  select score into v_old_score
    from votes
    where list_id = p_list_id and item_name = p_old_name;

  if v_old_score is not null then
    select score into v_new_score
      from votes
      where list_id = p_list_id and item_name = p_new_name;

    if v_new_score is not null then
      -- Merge: add old score onto existing new row
      update votes
        set score = score + v_old_score,
            updated_at = now()
        where list_id = p_list_id and item_name = p_new_name;
    else
      -- Create new vote row with the old score
      insert into votes (list_id, item_name, score, updated_at)
        values (p_list_id, p_new_name, v_old_score, now());
    end if;

    delete from votes
      where list_id = p_list_id and item_name = p_old_name;
  end if;

  -- 2. Move the extras row across, if it exists.
  if exists (
    select 1 from extras
      where list_id = p_list_id and item_name = p_old_name
  ) then
    insert into extras (list_id, item_name, added_at)
      values (p_list_id, p_new_name, now())
      on conflict (list_id, item_name) do nothing;

    delete from extras
      where list_id = p_list_id and item_name = p_old_name;
  end if;

  -- 3. Propagate the rename into the activity-ledger tables so past
  --    ledger entries show the new name site-wide.
  update vote_events
    set item_name = p_new_name
    where list_id = p_list_id and item_name = p_old_name;

  update consensus_alerts
    set item_name = p_new_name
    where list_id = p_list_id and item_name = p_old_name;

  -- 4. Replace the name inside the stored consensus snapshot so the next
  --    cron diff does not fire a spurious exited/entered pair.
  update consensus_snapshots
    set top10 = (
      select coalesce(
        jsonb_agg(
          case when elem.value = to_jsonb(p_old_name)
               then to_jsonb(p_new_name)
               else elem.value end
          order by elem.ordinality
        ),
        '[]'::jsonb
      )
      from jsonb_array_elements(top10) with ordinality as elem
    )
    where list_id = p_list_id
      and top10 @> jsonb_build_array(p_old_name);
end;
$$;

grant execute on function rename_extra(text, text, text) to service_role;

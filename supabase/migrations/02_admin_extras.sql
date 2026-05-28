-- =========================================================================
-- Migration: admin rename + delete for user-submitted extras
-- Adds an atomic rename_extra RPC that also moves any aggregated vote
-- score from the old item_name to the new one (merging if needed).
--
-- Run this in your Supabase SQL Editor.
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
end;
$$;

-- The admin routes call this via the service-role key, so anon does not
-- need execute. Grant explicitly anyway so the function is reachable for
-- ad-hoc SQL Editor use.
grant execute on function rename_extra(text, text, text) to service_role;

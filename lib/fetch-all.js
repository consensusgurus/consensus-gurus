// PostgREST (Supabase) caps any single select at 1000 rows, and the overflow
// is dropped SILENTLY: no error, the rows just never arrive. list_sources_seen
// crossed the cap on 2026-06-07 and quietly broke the consensus cron's
// first-sighting detection. Use this helper for any read that is meant to
// return a WHOLE table that grows with content (votes, views, extras,
// vote_events, list_sources_seen, comments...). It pages in stable key order
// until a short page arrives.
//
// Returns the familiar { data, error } shape so call sites written for a
// plain supabase select keep working: on a mid-pagination error you get the
// rows collected so far plus the error.
export async function fetchAllRows(client, table, cols, orderCols = [], filter) {
  const STEP = 1000;
  const out = [];
  for (let from = 0; ; from += STEP) {
    let q = client.from(table).select(cols);
    for (const o of orderCols) {
      const [col, ascending] = Array.isArray(o) ? o : [o, true];
      q = q.order(col, { ascending });
    }
    if (filter) q = filter(q);
    const { data, error } = await q.range(from, from + STEP - 1);
    if (error) return { data: out, error };
    out.push(...(data || []));
    if (!data || data.length < STEP) break;
  }
  return { data: out, error: null };
}

// Daily consensus check. Recomputes every list's consensus top 10 (the same
// math the list page uses: publications + live votes + extras), diffs it
// against the stored snapshot in consensus_snapshots, and records an alert
// for any item that newly entered the top 10 or the top 3. New top-10
// entrants need a description; new top-3 entrants need a hero photo.
//
// Wired to a daily Vercel cron (see vercel.json). If a CRON_SECRET env var
// is set, requests must carry "Authorization: Bearer <CRON_SECRET>"
// (Vercel sends this automatically for cron invocations).

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { LISTS } from '@/lib/data';
import { getSources } from '@/lib/helpers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function consensusTop10(list, votes, extras) {
  const mode = list.mode || 'both';
  if (mode === 'facts' || mode === 'scores' || mode === 'unranked') {
    return (list.sources?.ai?.items || []).slice(0, 10);
  }
  if (mode === 'votes') {
    return (list.vote?.items || []).slice(0, 10);
  }
  const sources = getSources(list, votes, extras[list.id] || []);
  const consensus = sources.find((s) => s.id === 'consensus');
  return (consensus?.items || list.sources?.ai?.items || []).slice(0, 10);
}

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization') || '';
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  try {
    const [votesRes, extrasRes, snapsRes, alertsRes, seenRes] = await Promise.all([
      supabaseAdmin.from('votes').select('list_id,item_name,score'),
      supabaseAdmin.from('extras').select('list_id,item_name'),
      supabaseAdmin.from('consensus_snapshots').select('list_id,top10'),
      supabaseAdmin
        .from('consensus_alerts')
        .select('list_id,item_name,change_type')
        .eq('resolved', false),
      supabaseAdmin.from('list_sources_seen').select('list_id,source_id'),
    ]);

    // Vote scores keyed as `${listId}::${itemNameLowerCase}` (matches voteKey).
    const votes = {};
    (votesRes.data || []).forEach((row) => {
      votes[`${row.list_id}::${row.item_name.toLowerCase().trim()}`] = Math.max(
        0,
        row.score
      );
    });

    const extras = {};
    (extrasRes.data || []).forEach((row) => {
      if (!extras[row.list_id]) extras[row.list_id] = [];
      extras[row.list_id].push(row.item_name);
    });

    const prevSnaps = new Map();
    (snapsRes.data || []).forEach((row) => {
      prevSnaps.set(row.list_id, row.top10 || []);
    });

    // Existing unresolved alerts, so re-detection never duplicates a row.
    const openAlerts = new Set(
      (alertsRes.data || []).map(
        (a) => `${a.list_id}::${a.item_name.toLowerCase()}::${a.change_type}`
      )
    );

    // Which sources are already stamped, per list. Used to date "source added"
    // events in the activity feed (list_sources_seen.first_seen_at).
    const seenByList = new Map();
    (seenRes.data || []).forEach((row) => {
      if (!seenByList.has(row.list_id)) seenByList.set(row.list_id, new Set());
      seenByList.get(row.list_id).add(row.source_id);
    });

    const newAlerts = [];
    const snapshotUpserts = [];
    const sourceSeenUpserts = [];
    const nowIso = new Date().toISOString();
    const norm = (s) => s.toLowerCase().trim();

    for (const list of LISTS) {
      const top10 = consensusTop10(list, votes, extras);
      snapshotUpserts.push({
        list_id: list.id,
        top10,
        updated_at: nowIso,
      });

      // Stamp any source not yet recorded. On a list's FIRST sighting (no rows
      // yet) every current source is backfilled to the list's launch date, so
      // they group as the "N sources at launch" batch. Once a list is already
      // tracked, a source that appears later is genuinely new and is stamped
      // now() -- which is what surfaces it as a dated "New source added" event.
      const seenSet = seenByList.get(list.id);
      const firstSighting = !seenSet || seenSet.size === 0;
      const launchIso = new Date(list.publishedAt || list.publishedDate || nowIso).toISOString();
      if (list.sources) {
        for (const [sid, s] of Object.entries(list.sources)) {
          if (sid === 'ai' || !s || !s.label) continue;
          if (seenSet && seenSet.has(sid)) continue;
          sourceSeenUpserts.push({
            list_id: list.id,
            source_id: sid,
            first_seen_at: firstSighting ? launchIso : nowIso,
          });
        }
      }

      const prev = prevSnaps.get(list.id);
      // First sighting of a list: seed the snapshot silently, no alerts.
      if (!prev) continue;

      const prev10 = new Set(prev.map(norm));
      const prev3 = new Set(prev.slice(0, 3).map(norm));

      top10.forEach((item, idx) => {
        const key = norm(item);
        const rank = idx + 1;
        if (!prev10.has(key)) {
          const k = `${list.id}::${key}::entered_top10`;
          if (!openAlerts.has(k)) {
            newAlerts.push({
              list_id: list.id,
              item_name: item,
              change_type: 'entered_top10',
              rank,
              resolved: false,
            });
            openAlerts.add(k);
          }
        }
        if (rank <= 3 && !prev3.has(key)) {
          const k = `${list.id}::${key}::entered_top3`;
          if (!openAlerts.has(k)) {
            newAlerts.push({
              list_id: list.id,
              item_name: item,
              change_type: 'entered_top3',
              rank,
              resolved: false,
            });
            openAlerts.add(k);
          }
        }
      });

      // Exits: items that left the top 10 entirely, or slipped out of the
      // top 3 while staying on the list. Stored resolved=true so they appear
      // in the public activity ledgers but never enter the research queue
      // (an exit needs no description or hero work). Snapshot-diff detection
      // fires each exit exactly once.
      const cur10 = new Set(top10.map(norm));
      const cur3 = new Set(top10.slice(0, 3).map(norm));
      prev.forEach((item, idx) => {
        const key = norm(item);
        if (!cur10.has(key)) {
          newAlerts.push({
            list_id: list.id,
            item_name: item,
            change_type: 'exited_top10',
            rank: null,
            resolved: true,
          });
        } else if (idx < 3 && !cur3.has(key)) {
          newAlerts.push({
            list_id: list.id,
            item_name: item,
            change_type: 'exited_top3',
            rank: null,
            resolved: true,
          });
        }
      });
    }

    if (newAlerts.length > 0) {
      const ins = await supabaseAdmin.from('consensus_alerts').insert(newAlerts);
      if (ins.error) throw ins.error;
    }

    // Stamp first_seen_at for any newly tracked source. ignoreDuplicates keeps
    // an existing first_seen_at from ever being overwritten, so a source is
    // dated exactly once.
    if (sourceSeenUpserts.length > 0) {
      const seenIns = await supabaseAdmin
        .from('list_sources_seen')
        .upsert(sourceSeenUpserts, { onConflict: 'list_id,source_id', ignoreDuplicates: true });
      if (seenIns.error) throw seenIns.error;
    }

    const up = await supabaseAdmin
      .from('consensus_snapshots')
      .upsert(snapshotUpserts, { onConflict: 'list_id' });
    if (up.error) throw up.error;

    return NextResponse.json({
      ok: true,
      listsChecked: LISTS.length,
      newAlerts: newAlerts.length,
      sourcesStamped: sourceSeenUpserts.length,
      alerts: newAlerts,
    });
  } catch (err) {
    console.error('consensus-check error', err);
    return NextResponse.json({ error: 'consensus check failed' }, { status: 500 });
  }
}

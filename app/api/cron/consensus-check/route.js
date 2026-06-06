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

    const newAlerts = [];
    const snapshotUpserts = [];
    const norm = (s) => s.toLowerCase().trim();

    for (const list of LISTS) {
      const top10 = consensusTop10(list, votes, extras);
      snapshotUpserts.push({
        list_id: list.id,
        top10,
        updated_at: new Date().toISOString(),
      });

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
            });
            openAlerts.add(k);
          }
        }
      });
    }

    if (newAlerts.length > 0) {
      const ins = await supabaseAdmin.from('consensus_alerts').insert(newAlerts);
      if (ins.error) throw ins.error;
    }

    const up = await supabaseAdmin
      .from('consensus_snapshots')
      .upsert(snapshotUpserts, { onConflict: 'list_id' });
    if (up.error) throw up.error;

    // Source-added tracking: stamp first_seen_at for any (list, source) not
    // yet recorded. ignoreDuplicates keeps existing timestamps untouched, so a
    // source is dated the first cron run after it was added.
    const seenKeys = new Set((seenRes.data || []).map((r) => `${r.list_id}::${r.source_id}`));
    const nowIso = new Date().toISOString();
    const sourceRows = [];
    for (const list of LISTS) {
      const sids = Object.keys(list.sources || {}).filter((sid) => sid !== 'ai');
      const tracked = sids.some((sid) => seenKeys.has(`${list.id}::${sid}`));
      const created = list.publishedAt || list.publishedDate;
      const initialIso = created && !isNaN(Date.parse(created)) ? new Date(created).toISOString() : nowIso;
      for (const sid of sids) {
        const k = `${list.id}::${sid}`;
        if (!seenKeys.has(k)) {
          sourceRows.push({ list_id: list.id, source_id: sid, first_seen_at: tracked ? nowIso : initialIso });
          seenKeys.add(k);
        }
      }
    }
    if (sourceRows.length > 0) {
      await supabaseAdmin
        .from('list_sources_seen')
        .upsert(sourceRows, { onConflict: 'list_id,source_id', ignoreDuplicates: true });
    }

    return NextResponse.json({
      ok: true,
      listsChecked: LISTS.length,
      newAlerts: newAlerts.length,
      alerts: newAlerts,
      newSourcesLogged: sourceRows.length,
    });
  } catch (err) {
    console.error('consensus-check error', err);
    return NextResponse.json({ error: 'consensus check failed' }, { status: 500 });
  }
}

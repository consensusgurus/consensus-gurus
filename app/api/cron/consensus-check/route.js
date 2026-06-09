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
import { getSources, SCORING_ENGINE_VERSION } from '@/lib/helpers';
import { DESCRIPTIONS } from '@/lib/descriptions';
import { HERO_IMAGES } from '@/lib/hero-images';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// PostgREST caps a single select at 1000 rows. list_sources_seen crossed that
// on 2026-06-07 (~1500 rows), which silently hid existing stamps from the cron
// and made already-tracked lists look like first sightings. Page every table
// read in stable key order until a short page arrives.
async function fetchAll(table, cols, orderCols, filter) {
  const STEP = 1000;
  const out = [];
  for (let from = 0; ; from += STEP) {
    let q = supabaseAdmin.from(table).select(cols);
    for (const c of orderCols) q = q.order(c, { ascending: true });
    if (filter) q = filter(q);
    const { data, error } = await q.range(from, from + STEP - 1);
    if (error) throw error;
    out.push(...(data || []));
    if (!data || data.length < STEP) break;
  }
  return out;
}

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

// Stable fingerprint of a list's source data (ids, labels, weights, flags,
// item order; the ai seed excluded). When this changes between cron runs, the
// list was EDITED in a deploy (source rework/reorder/item drop), so a ranking
// change detected in that window is attributed to the edit (cause='edit')
// rather than to votes. Plain djb2 over JSON; collisions are inconsequential.
function sourcesFingerprint(list) {
  const src = Object.entries(list.sources || {})
    .filter(([id, s]) => s && s.label)
    .map(([id, s]) => [id, s.label, s.weight || null, Boolean(s.unordered), Boolean(s.trueExpert), s.items || []]);
  src.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const str = SCORING_ENGINE_VERSION + ':' + JSON.stringify(src);
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
  return String(h);
}

export async function GET(request) {
  const sp = new URL(request.url).searchParams;
  // ?rebaseline=1 -> one-shot vote-trace backfill (see the per-list block).
  const REBASELINE = sp.get('rebaseline') === '1';
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization') || '';
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  // ?resolveSatisfied=1 -> one-shot maintenance: clear research-queue alerts
  // whose work is already done (entered_top10 for an item that already has a
  // description, entered_top3 for one that already has a hero photo). The
  // site-wide rebaseline inserts entered_* rows as resolved=false so genuinely
  // missing items surface in the Research tab; this resolves the ones already
  // satisfied (e.g. Casablanca already had its description) so they do not
  // clutter the queue. Idempotent.
  if (sp.get('resolveSatisfied') === '1') {
    try {
      const rows = await fetchAll('consensus_alerts', 'id,list_id,item_name,change_type', ['id'], (q) => q.eq('resolved', false));
      const ids = [];
      for (const a of rows) {
        const d = DESCRIPTIONS[a.list_id];
        const h = HERO_IMAGES[a.list_id];
        if (a.change_type === 'entered_top10' && d && d[a.item_name]) ids.push(a.id);
        else if (a.change_type === 'entered_top3' && h && h[a.item_name]) ids.push(a.id);
      }
      for (let i = 0; i < ids.length; i += 500) {
        const { error } = await supabaseAdmin.from('consensus_alerts').update({ resolved: true }).in('id', ids.slice(i, i + 500));
        if (error) throw error;
      }
      return NextResponse.json({ ok: true, resolved: ids.length });
    } catch (err) {
      console.error('resolveSatisfied error', err);
      return NextResponse.json({ error: 'resolveSatisfied failed' }, { status: 500 });
    }
  }

  // ?backfillVoteEvents=1 -> one-shot: synthesize the per-vote event log from
  // the aggregate `votes` table so the Activity Log shows "Someone voted X"
  // entries on lists whose scores were seeded directly (bypassing /api/votes,
  // which is what logs events). For each item it inserts events whose deltas
  // sum to the amount NOT already logged (each capped at 3, like a ballot
  // pick), with synthetic timestamps spread between the list's launch and now
  // (the originals were never recorded). Idempotent: a re-run sees the
  // now-logged events and inserts nothing more.
  if (sp.get('backfillVoteEvents') === '1') {
    try {
      const [vrows, erows] = await Promise.all([
        fetchAll('votes', 'list_id,item_name,score', ['list_id', 'item_name']),
        fetchAll('vote_events', 'list_id,item_name,delta', ['list_id', 'item_name']),
      ]);
      const logged = {};
      for (const e of erows) {
        const k = `${e.list_id}::${e.item_name.toLowerCase().trim()}`;
        logged[k] = (logged[k] || 0) + (e.delta || 0);
      }
      const listById = new Map(LISTS.map((l) => [l.id, l]));
      const now = Date.now();
      const inserts = [];
      for (const v of vrows) {
        if (!v.list_id || v.list_id.length > 100) continue;
        if (!v.item_name || v.item_name.length > 100) continue;
        const score = Math.max(0, v.score || 0);
        if (score <= 0) continue;
        const k = `${v.list_id}::${v.item_name.toLowerCase().trim()}`;
        let gap = Math.min(30, score - (logged[k] || 0));
        if (gap <= 0) continue;
        const list = listById.get(v.list_id);
        const launch = list && (list.publishedAt || list.publishedDate)
          ? new Date(list.publishedAt || list.publishedDate).getTime()
          : now - 7 * 86400000;
        const span = Math.max(1, now - launch);
        while (gap > 0) {
          const d = Math.min(3, gap);
          const ts = new Date(launch + Math.random() * span).toISOString();
          inserts.push({ list_id: v.list_id, item_name: v.item_name, delta: d, created_at: ts });
          gap -= d;
        }
      }
      let n = 0;
      for (let i = 0; i < inserts.length; i += 500) {
        const { error } = await supabaseAdmin.from('vote_events').insert(inserts.slice(i, i + 500));
        if (error) throw error;
        n += Math.min(500, inserts.length - i);
      }
      return NextResponse.json({ ok: true, inserted: n });
    } catch (err) {
      console.error('backfillVoteEvents error', err);
      return NextResponse.json({ error: 'backfillVoteEvents failed' }, { status: 500 });
    }
  }

  // ?purgeAlerts=1&from=<ISO>&to=<ISO>[&cause=votes] -> delete consensus_alerts
  // whose detected_at falls in [from, to). Used to remove a one-shot backfill
  // batch (e.g. the ?rebaseline=1 cards) once the live vote-replay reproduces
  // those movements attached to the actual votes, so the ledger does not show
  // the same movement twice. Both from and to are required (no open-ended
  // delete); cause is an optional extra filter.
  if (sp.get('purgeAlerts') === '1') {
    try {
      const from = sp.get('from');
      const to = sp.get('to');
      const cause = sp.get('cause');
      if (!from || !to) return NextResponse.json({ error: 'from and to (ISO) required' }, { status: 400 });
      let q = supabaseAdmin.from('consensus_alerts').delete().gte('detected_at', from).lt('detected_at', to);
      if (cause) q = q.eq('cause', cause);
      const { data, error } = await q.select('id');
      if (error) throw error;
      return NextResponse.json({ ok: true, deleted: (data || []).length });
    } catch (err) {
      console.error('purgeAlerts error', err);
      return NextResponse.json({ error: 'purgeAlerts failed' }, { status: 500 });
    }
  }

  // ?cleanupVoteKeys=1 -> tidy non-canonical aggregate vote keys. A vote whose
  // item_name does not EXACTLY match a canonical item in its list (sources +
  // vote.items + extras) is classified as either:
  //   - NEAR-MATCH: a canonical item exists whose name minus its trailing
  //     parenthetical equals the orphan (e.g. "the dark knight" ->
  //     "The Dark Knight (2008)"). Merged into the canonical item: score added,
  //     vote_events renamed, the stray row removed. Non-destructive (no votes
  //     lost; they just count toward the right item and start scoring).
  //   - TRUE ORPHAN: no canonical match at all (e.g. "Inception" on a list that
  //     does not carry it). These never score. Reported always; deleted only
  //     when &deleteOrphans=1.
  // Dry run by default (read-only). &apply=1 performs the merges; add
  // &deleteOrphans=1 to also remove true orphans. Idempotent.
  if (sp.get('cleanupVoteKeys') === '1') {
    try {
      const apply = sp.get('apply') === '1';
      const deleteOrphans = sp.get('deleteOrphans') === '1';
      const [vrows, erows] = await Promise.all([
        fetchAll('votes', 'list_id,item_name,score', ['list_id', 'item_name']),
        fetchAll('extras', 'list_id,item_name', ['list_id', 'item_name']),
      ]);
      const norm = (s) => String(s).toLowerCase().trim();
      const strip = (s) => norm(s).replace(/\s*\([^)]*\)\s*$/, '').trim();
      const extrasByList = {};
      for (const e of erows) {
        if (!extrasByList[e.list_id]) extrasByList[e.list_id] = [];
        extrasByList[e.list_id].push(e.item_name);
      }
      const uniByList = new Map();
      for (const list of LISTS) {
        const byNorm = new Map();
        const add = (name) => { if (name) byNorm.set(norm(name), name); };
        if (list.sources) for (const s of Object.values(list.sources)) if (s && Array.isArray(s.items)) s.items.forEach(add);
        if (list.vote && Array.isArray(list.vote.items)) list.vote.items.forEach(add);
        (extrasByList[list.id] || []).forEach(add);
        uniByList.set(list.id, byNorm);
      }
      const scoreByKey = {};
      for (const v of vrows) scoreByKey[`${v.list_id}::${norm(v.item_name)}`] = v.score || 0;
      const merges = [];
      const orphans = [];
      for (const v of vrows) {
        const byNorm = uniByList.get(v.list_id);
        if (!byNorm) continue;
        const nk = norm(v.item_name);
        if (byNorm.has(nk)) continue;
        const sk = strip(v.item_name);
        let target = null;
        for (const [cn, canonical] of byNorm) { if (cn !== nk && strip(canonical) === sk) { target = canonical; break; } }
        if (target) merges.push({ list_id: v.list_id, from: v.item_name, to: target, score: v.score || 0 });
        else orphans.push({ list_id: v.list_id, item_name: v.item_name, score: v.score || 0 });
      }
      if (!apply) return NextResponse.json({ ok: true, dryRun: true, mergeCount: merges.length, orphanCount: orphans.length, merges, orphans });
      let merged = 0, deleted = 0;
      for (const m of merges) {
        const tgtKey = `${m.list_id}::${norm(m.to)}`;
        const tgtScore = scoreByKey[tgtKey] || 0;
        const up = await supabaseAdmin.from('votes').upsert({ list_id: m.list_id, item_name: m.to, score: tgtScore + m.score }, { onConflict: 'list_id,item_name' });
        if (up.error) throw up.error;
        scoreByKey[tgtKey] = tgtScore + m.score;
        await supabaseAdmin.from('vote_events').update({ item_name: m.to }).eq('list_id', m.list_id).eq('item_name', m.from);
        await supabaseAdmin.from('votes').delete().eq('list_id', m.list_id).eq('item_name', m.from);
        merged++;
      }
      if (deleteOrphans) {
        for (const o of orphans) {
          await supabaseAdmin.from('vote_events').delete().eq('list_id', o.list_id).eq('item_name', o.item_name);
          await supabaseAdmin.from('votes').delete().eq('list_id', o.list_id).eq('item_name', o.item_name);
          deleted++;
        }
      }
      return NextResponse.json({ ok: true, merged, deleted, orphansRemaining: deleteOrphans ? 0 : orphans.length });
    } catch (err) {
      console.error('cleanupVoteKeys error', err);
      return NextResponse.json({ error: 'cleanupVoteKeys failed' }, { status: 500 });
    }
  }

  try {
    const [votesRows, extrasRows, snapsRows, alertsRows, seenRows] = await Promise.all([
      fetchAll('votes', 'list_id,item_name,score', ['list_id', 'item_name']),
      fetchAll('extras', 'list_id,item_name', ['list_id', 'item_name']),
      fetchAll('consensus_snapshots', 'list_id,top10,sources_hash', ['list_id']),
      fetchAll('consensus_alerts', 'list_id,item_name,change_type', ['id'], (q) => q.eq('resolved', false)),
      fetchAll('list_sources_seen', 'list_id,source_id,label,first_seen_at,removed_at,label_updated_at', ['list_id', 'source_id']),
    ]);

    // Vote scores keyed as `${listId}::${itemNameLowerCase}` (matches voteKey).
    const votes = {};
    votesRows.forEach((row) => {
      votes[`${row.list_id}::${row.item_name.toLowerCase().trim()}`] = Math.max(
        0,
        row.score
      );
    });

    const extras = {};
    extrasRows.forEach((row) => {
      if (!extras[row.list_id]) extras[row.list_id] = [];
      extras[row.list_id].push(row.item_name);
    });

    // Lists that have ever received a fan vote. A consensus change on a list
    // with no votes at all cannot be vote-caused (it came from a deploy the
    // fingerprint missed, e.g. an engine change), so 'votes' is never
    // attributed to these.
    const votedLists = new Set(votesRows.map((r) => r.list_id));

    const prevSnaps = new Map();
    snapsRows.forEach((row) => {
      prevSnaps.set(row.list_id, { top10: row.top10 || [], hash: row.sources_hash || null });
    });

    // Existing unresolved alerts, so re-detection never duplicates a row.
    const openAlerts = new Set(
      alertsRows.map(
        (a) => `${a.list_id}::${a.item_name.toLowerCase()}::${a.change_type}`
      )
    );

    // Which sources are already stamped, per list. Used to date "source added"
    // events in the activity feed (list_sources_seen.first_seen_at).
    const seenByList = new Map();
    seenRows.forEach((row) => {
      if (!seenByList.has(row.list_id)) seenByList.set(row.list_id, new Map());
      seenByList.get(row.list_id).set(row.source_id, row);
    });

    const newAlerts = [];
    const snapshotUpserts = [];
    const sourceSeenUpserts = [];
    const labelUpdateUpserts = [];
    const nowIso = new Date().toISOString();
    const norm = (s) => s.toLowerCase().trim();

    for (const list of LISTS) {
      const top10 = consensusTop10(list, votes, extras);
      const fingerprint = sourcesFingerprint(list);
      snapshotUpserts.push({
        list_id: list.id,
        top10,
        sources_hash: fingerprint,
        updated_at: nowIso,
      });

      // Stamp any source not yet recorded. On a list's FIRST sighting (no rows
      // yet) every current source is backfilled to the list's launch date, so
      // they group as the "N sources at launch" batch. Once a list is already
      // tracked, a source that appears later is genuinely new and is stamped
      // now() -- which is what surfaces it as a dated "New source added" event.
      const seenMap = seenByList.get(list.id);
      const firstSighting = !seenMap || seenMap.size === 0;
      const launchIso = new Date(list.publishedAt || list.publishedDate || nowIso).toISOString();
      if (list.sources) {
        for (const [sid, s] of Object.entries(list.sources)) {
          if (sid === 'ai' || !s || !s.label) continue;
          const row = seenMap && seenMap.get(sid);
          if (row) {
            // Already tracked. A changed label means the source was refreshed
            // (re-gathered ratings, a new year's edition) -- stamp it so the
            // feed can show a dated "Updated sources" event. A null stored
            // label (pre-migration-13/17 row) is backfilled with NO stamp so
            // the first run doesn't flood the ledger with fake events. A
            // removed source reappearing also counts as an update.
            const labelChanged = row.label != null && row.label !== s.label;
            const reAdded = Boolean(row.removed_at);
            if (labelChanged || reAdded || row.label == null) {
              labelUpdateUpserts.push({
                list_id: list.id,
                source_id: sid,
                first_seen_at: row.first_seen_at,
                label: s.label,
                removed_at: null,
                label_updated_at: labelChanged || reAdded ? nowIso : row.label_updated_at || null,
              });
            }
            continue;
          }
          sourceSeenUpserts.push({
            list_id: list.id,
            source_id: sid,
            first_seen_at: firstSighting ? launchIso : nowIso,
            label: s.label,
            removed_at: null,
            label_updated_at: null,
          });
        }
      }

      const prevSnap = prevSnaps.get(list.id);
      // One-shot vote-trace backfill (?rebaseline=1): instead of diffing
      // against the stored snapshot, diff the current consensus against this
      // list's PUBLICATION-ONLY ranking (getSources with no votes). Every
      // position that fan votes/extras shifted relative to the editorial
      // baseline is then recorded as a ledger trace, attributed to votes. The
      // snapshot is still upserted to the current consensus below, so the next
      // normal daily run sees no diff and behaves exactly as before. This
      // backfills the traces the edge-triggered detector missed on lists whose
      // baseline snapshot was first seeded AFTER votes had already moved the
      // consensus (so the original crossing was never observed). Run it ONCE:
      // resolved=true moved/exited rows are not deduped, so a second rebaseline
      // pass would duplicate them.
      let prev, cause;
      if (REBASELINE) {
        prev = consensusTop10(list, {}, extras);
        cause = 'votes';
      } else {
        // First sighting of a list: seed the snapshot silently, no alerts.
        if (!prevSnap) continue;
        prev = prevSnap.top10;

        // Attribute this run's changes: if the source fingerprint moved since
        // the last run, a deploy edited the list (cause 'edit'); otherwise only
        // votes/extras could have shifted the consensus (cause 'votes'). A null
        // stored hash (pre-migration-16 snapshot) leaves cause null = unknown.
        cause = prevSnap.hash
          ? prevSnap.hash !== fingerprint
            ? 'edit'
            : votedLists.has(list.id)
              ? 'votes'
              : 'edit'
          : null;
      }

      // Rank maps: positions 1-10 in the previous and current consensus.
      // Every alert row records the exact movement via prev_rank -> rank,
      // where 0 means "unranked" (outside the top 10). entered_top10 /
      // entered_top3 stay research alerts (resolved=false: description /
      // hero needed); exited_* and within-top10 'moved' rows are ledger-only
      // news (resolved=true). Snapshot-diff detection fires each movement
      // exactly once. All rows share the same keys (PostgREST bulk insert
      // requires uniform columns).
      const prevRankMap = new Map();
      prev.slice(0, 10).forEach((item, idx) => prevRankMap.set(norm(item), idx + 1));
      const curRankMap = new Map();
      top10.forEach((item, idx) => curRankMap.set(norm(item), idx + 1));

      top10.forEach((item, idx) => {
        const key = norm(item);
        const rank = idx + 1;
        const p = prevRankMap.get(key) || 0;
        if (p === rank) return;
        let isEntry = false;
        if (!p) {
          isEntry = true;
          const k = `${list.id}::${key}::entered_top10`;
          if (!openAlerts.has(k)) {
            newAlerts.push({
              list_id: list.id,
              item_name: item,
              change_type: 'entered_top10',
              rank,
              prev_rank: 0,
              cause,
              resolved: false,
            });
            openAlerts.add(k);
          }
        }
        if (rank <= 3 && (!p || p > 3)) {
          isEntry = true;
          const k = `${list.id}::${key}::entered_top3`;
          if (!openAlerts.has(k)) {
            newAlerts.push({
              list_id: list.id,
              item_name: item,
              change_type: 'entered_top3',
              rank,
              prev_rank: p,
              cause,
              resolved: false,
            });
            openAlerts.add(k);
          }
        }
        if (!isEntry && p) {
          // A shift within the top 10: dropping out of the top 3 keeps its
          // dedicated type, any other move is a plain 'moved'.
          newAlerts.push({
            list_id: list.id,
            item_name: item,
            change_type: p <= 3 && rank > 3 ? 'exited_top3' : 'moved',
            rank,
            prev_rank: p,
            cause,
            resolved: true,
          });
        }
      });

      // Items that left the top 10 entirely (rank 0 = now unranked).
      prev.slice(0, 10).forEach((item, idx) => {
        const key = norm(item);
        if (!curRankMap.has(key)) {
          newAlerts.push({
            list_id: list.id,
            item_name: item,
            change_type: 'exited_top10',
            rank: 0,
            prev_rank: idx + 1,
            cause,
            resolved: true,
          });
        }
      });

      // Self-healing (level-triggered) backstop for the snapshot-diff detection
      // above, which is edge-triggered: it only records an item the moment it
      // CROSSES into the top 10 (or top 3) between two daily snapshots, and the
      // stable-rank early-return (p === rank) skips an item that is already
      // settled. So an item that crossed in before this list's snapshot baseline
      // existed (e.g. fan votes moved it in before the alerting tables were
      // first seeded on 2026-06-07) was never observed crossing, so its
      // description/hero was never queued and never will be. Backfill that gap:
      // queue any item CURRENTLY in the top 10 that is missing its description,
      // or in the top 3 missing its hero photo. Scoped to lists whose
      // descriptions/heroes have already been built (DESCRIPTIONS[list.id] /
      // HERO_IMAGES[list.id] present) so partially-rolled-out lists are not
      // flooded, and deduped against open alerts so once the gap is filled and
      // the alert resolved it never re-fires. Rows are shaped exactly like the
      // genuine entry rows above (prev_rank 0 for top10, prior rank for top3).
      const listDescs = DESCRIPTIONS[list.id];
      const listHeroes = HERO_IMAGES[list.id];
      if (listDescs || listHeroes) {
        top10.forEach((item, idx) => {
          const key = norm(item);
          const rank = idx + 1;
          if (listDescs && !listDescs[item]) {
            const k = `${list.id}::${key}::entered_top10`;
            if (!openAlerts.has(k)) {
              newAlerts.push({
                list_id: list.id,
                item_name: item,
                change_type: 'entered_top10',
                rank,
                prev_rank: 0,
                cause,
                resolved: false,
              });
              openAlerts.add(k);
            }
          }
          if (rank <= 3 && listHeroes && !listHeroes[item]) {
            const k = `${list.id}::${key}::entered_top3`;
            if (!openAlerts.has(k)) {
              newAlerts.push({
                list_id: list.id,
                item_name: item,
                change_type: 'entered_top3',
                rank,
                prev_rank: prevRankMap.get(key) || 0,
                cause,
                resolved: false,
              });
              openAlerts.add(k);
            }
          }
        });
      }
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

    // Label refreshes / re-adds: these MUST overwrite the existing row (the
    // stored first_seen_at is preserved in the payload), so no ignoreDuplicates.
    if (labelUpdateUpserts.length > 0) {
      const updIns = await supabaseAdmin
        .from('list_sources_seen')
        .upsert(labelUpdateUpserts, { onConflict: 'list_id,source_id' });
      if (updIns.error) throw updIns.error;
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
      sourcesUpdated: labelUpdateUpserts.length,
      alerts: newAlerts,
    });
  } catch (err) {
    console.error('consensus-check error', err);
    return NextResponse.json({ error: 'consensus check failed' }, { status: 500 });
  }
}

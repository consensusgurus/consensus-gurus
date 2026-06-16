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
import { REENCODING_MOVEMENT_EVENTS } from '@/lib/reencoding-movement-backfill';

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
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization') || '';
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  const sp = new URL(request.url).searchParams;

  // ?backfillReEncodingMovements=1 -> rewrite cause='edit' alert rows for every
  // re-encoding deploy since 2026-06-01 with their COMPLETE consensus-movement
  // set. Built off lib/reencoding-movement-backfill.js, which walks lib/data.js
  // git history per commit, identifies per-list source-fingerprint changes
  // (added, removed, label/weight changed, items reordered), and recomputes the
  // before/after publication-only consensus per change with current
  // lib/helpers.js logic. Each event's movements are dated to the matching
  // list_sources_seen timestamp (label_updated_at for a re-encoding,
  // first_seen_at for a same-deploy addition, removed_at for a removal), with
  // the commit date as fallback, so each alert lands on the correct "Sources
  // Added" / "Sources Revisited" / "Source removed" activity-ledger card.
  // Replaces the prior ?backfillSourceMovements=1 set (commit 63ee447 wiped
  // re-encoding alerts when it ran). Idempotent: delete-then-replace per
  // affected list, only the post-2026-06-01 window.
  if (sp.get('backfillReEncodingMovements') === '1') {
    try {
      const seen = await fetchAll('list_sources_seen', 'list_id,source_id,first_seen_at,label_updated_at,removed_at', ['list_id', 'source_id']);
      const seenMap = new Map();
      for (const r of seen) seenMap.set(`${r.list_id}::${r.source_id}`, r);
      const affected = [...new Set(REENCODING_MOVEMENT_EVENTS.map((e) => e.listId))];
      // Clear existing post-2026-06-01 cause='edit' alerts for the affected
      // lists, since we're about to repopulate them.
      const SINCE = '2026-06-01T00:00:00Z';
      for (let i = 0; i < affected.length; i += 100) {
        const chunk = affected.slice(i, i + 100);
        const del = await supabaseAdmin
          .from('consensus_alerts')
          .delete()
          .in('list_id', chunk)
          .eq('cause', 'edit')
          .gte('detected_at', SINCE);
        if (del.error) throw del.error;
      }
      const rows = [];
      let snapErrors = 0;
      for (const e of REENCODING_MOVEMENT_EVENTS) {
        if (!e.movements || !e.movements.length) continue;
        // Determine detected_at by snapping to the matching list_sources_seen
        // timestamp. A re-encoding event has its sources in
        // sourceChanges.labels / weights / items (existing source labels or
        // items changed) -> use the latest label_updated_at among them. An
        // addition event has sourceChanges.added with newly-stamped sources ->
        // use the latest first_seen_at. A removal -> latest removed_at. If
        // none of those snap to a known row, fall back to the commit date.
        const candidates = [];
        const { sourceChanges } = e;
        const sIds = new Set([
          ...(sourceChanges.added || []),
          ...(sourceChanges.removed || []),
          ...(sourceChanges.labels || []),
          ...(sourceChanges.weights || []),
          ...(sourceChanges.items || []),
        ]);
        for (const sid of sIds) {
          if (sid === 'ai') continue;
          const row = seenMap.get(`${e.listId}::${sid}`);
          if (!row) continue;
          if (row.label_updated_at) candidates.push(row.label_updated_at);
          if (row.first_seen_at) candidates.push(row.first_seen_at);
          if (row.removed_at) candidates.push(row.removed_at);
        }
        // Of the snap candidates, pick the one closest to the commit date
        // (within +/- 12h) so a re-encoding picks its label_updated_at and an
        // addition picks its first_seen_at, even though they may both exist
        // on the same source.
        const commitMs = Date.parse(e.date);
        let bestSnap = null;
        let bestDist = Infinity;
        for (const c of candidates) {
          const ms = Date.parse(c);
          if (isNaN(ms)) continue;
          const dist = Math.abs(ms - commitMs);
          if (dist < bestDist) {
            bestDist = dist;
            bestSnap = c;
          }
        }
        const detectedAt = bestSnap && bestDist <= 12 * 3600 * 1000 ? bestSnap : e.date;
        if (!bestSnap || bestDist > 12 * 3600 * 1000) snapErrors++;
        for (const m of e.movements) {
          rows.push({
            list_id: e.listId,
            item_name: m.item,
            change_type: m.changeType,
            rank: m.rank,
            prev_rank: m.prevRank,
            cause: 'edit',
            // entered_top10 / entered_top3 stay research alerts (need
            // description/hero); moved / exited_* are ledger-only news.
            resolved: !(m.changeType === 'entered_top10' || m.changeType === 'entered_top3'),
            detected_at: detectedAt,
          });
        }
      }
      let inserted = 0;
      for (let i = 0; i < rows.length; i += 500) {
        const ins = await supabaseAdmin.from('consensus_alerts').insert(rows.slice(i, i + 500));
        if (ins.error) throw ins.error;
        inserted += Math.min(500, rows.length - i);
      }
      return NextResponse.json({
        ok: true,
        affectedLists: affected.length,
        events: REENCODING_MOVEMENT_EVENTS.length,
        inserted,
        snapsMissed: snapErrors,
      });
    } catch (err) {
      console.error('backfillReEncodingMovements error', err);
      return NextResponse.json({ error: 'backfillReEncodingMovements failed', detail: String(err) }, { status: 500 });
    }
  }

  try {
    const [votesRows, extrasRows, snapsRows, alertsRows, seenRows] = await Promise.all([
      fetchAll('votes', 'list_id,item_name,score', ['list_id', 'item_name']),
      fetchAll('extras', 'list_id,item_name', ['list_id', 'item_name']),
      fetchAll('consensus_snapshots', 'list_id,top10,sources_hash,updated_at', ['list_id']),
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
      prevSnaps.set(row.list_id, {
        top10: row.top10 || [],
        hash: row.sources_hash || null,
        updatedAt: row.updated_at || null,
      });
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
      // First sighting of a list: seed the snapshot silently, no alerts.
      if (!prevSnap) continue;
      const prev = prevSnap.top10;

      // Attribute this run's changes: if the source fingerprint moved since
      // the last run, a deploy edited the list (cause 'edit'); otherwise only
      // votes/extras could have shifted the consensus (cause 'votes'). A null
      // stored hash (pre-migration-16 snapshot) leaves cause null = unknown.
      const cause = prevSnap.hash
        ? prevSnap.hash !== fingerprint
          ? 'edit'
          : votedLists.has(list.id)
            ? 'votes'
            : 'edit'
        : null;

      // Anchor cause='edit' alerts to the actual deploy event so they pair
      // with the matching activity-ledger source-group card (added /
      // revisited / removed), not to now(). When the cron runs hours or days
      // after the deploy (the typical case for the daily Vercel cron),
      // detected_at = now() lands the alerts outside the 26h attribution
      // window and they render as orphan "Ranking change" cards instead of
      // attaching to the cause card. Pick the latest list_sources_seen event
      // (first_seen_at / label_updated_at / removed_at) since prev_snap's
      // updated_at, or now() if no source event landed in this window. Vote-
      // and null-cause runs continue to use now(), since vote-driven changes
      // accumulate continuously and have no single anchor moment.
      let detectedAtForList = nowIso;
      if (cause === 'edit' && seenMap) {
        const prevUpdatedMs = prevSnap.updatedAt ? Date.parse(prevSnap.updatedAt) : 0;
        let latestMs = 0;
        let latestIso = null;
        for (const row of seenMap.values()) {
          for (const ts of [row.first_seen_at, row.label_updated_at, row.removed_at]) {
            if (!ts) continue;
            const ms = Date.parse(ts);
            if (isNaN(ms)) continue;
            if (ms > prevUpdatedMs && ms > latestMs) {
              latestMs = ms;
              latestIso = ts;
            }
          }
        }
        // Also consider this run's own pending stamps (sources newly seen or
        // re-encoded this very pass), which are nowIso and may legitimately
        // be the anchor when the cron runs the same minute as the deploy.
        for (const u of sourceSeenUpserts) {
          if (u.list_id !== list.id) continue;
          const ms = Date.parse(u.first_seen_at);
          if (!isNaN(ms) && ms > prevUpdatedMs && ms > latestMs) { latestMs = ms; latestIso = u.first_seen_at; }
        }
        for (const u of labelUpdateUpserts) {
          if (u.list_id !== list.id) continue;
          if (u.label_updated_at) {
            const ms = Date.parse(u.label_updated_at);
            if (!isNaN(ms) && ms > prevUpdatedMs && ms > latestMs) { latestMs = ms; latestIso = u.label_updated_at; }
          }
        }
        if (latestIso) detectedAtForList = latestIso;
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
              detected_at: detectedAtForList,
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
              detected_at: detectedAtForList,
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
            detected_at: detectedAtForList,
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
            detected_at: detectedAtForList,
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
      // Self-healing rows always use now() since they're filler, not a genuine
      // new event.
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
                detected_at: nowIso,
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
                detected_at: nowIso,
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

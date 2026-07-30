import LegalLayout from '@/app/LegalLayout';
import SiteHeader from '../SiteHeader';
import Footer from '../Footer';
import FeedClient from './FeedClient';
import { supabaseAdmin } from '@/lib/supabase-server';
import { LISTS, COLORS } from '@/lib/data';
import { getSources, voteKey, autoSourceNote } from '@/lib/helpers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Activity Log | Source of Truths',
  description: 'Live activity across every Source of Truths list: new lists, reader requests, votes, comments, and ranking changes.',
};

export default async function FeedPage() {
  const titleMap = new Map(LISTS.map((l) => [l.id, l.title]));
  const titleOf = (id) => titleMap.get(id) || id;

  let reqRes = {}, voteRes = {}, comRes = {}, revRes = {}, resRes = {}, notesRes = {}, srcRes = {}, srcUpdRes = {};
  try {
    [reqRes, voteRes, comRes, revRes, resRes, notesRes, srcRes, srcUpdRes] = await Promise.all([
      supabaseAdmin.from('user_lists').select('id,title,category,published,submitted_at').order('submitted_at', { ascending: false }).limit(25),
      Promise.resolve({ data: [] }), // vote_events removed (2026-06-18)
      supabaseAdmin.from('list_comments').select('list_id,name,body,created_at,editor_response').eq('hidden', false).order('created_at', { ascending: false }).limit(40),
      supabaseAdmin.from('complaints').select('list_id,message,created_at,editor_response').eq('feed_hidden', false).order('created_at', { ascending: false }).limit(25),
      supabaseAdmin.from('consensus_alerts').select('id,list_id,item_name,change_type,rank,prev_rank,cause,detected_at').order('detected_at', { ascending: false }).order('id', { ascending: false }).limit(800),
      supabaseAdmin.from('list_editor_notes').select('list_id,note,created_at').order('created_at', { ascending: false }).limit(40),
      supabaseAdmin.from('list_sources_seen').select('list_id,source_id,first_seen_at,label,removed_at').order('first_seen_at', { ascending: false }).limit(400),
      supabaseAdmin.from('list_sources_seen').select('list_id,source_id,label,label_updated_at').not('label_updated_at', 'is', null).order('label_updated_at', { ascending: false }).limit(100),
    ]);
  } catch (e) {
    // Render whatever static data we have on a DB hiccup.
  }

  const events = [];

  const labelOf = new Map();
  const pubMs = new Map();
  LISTS.forEach((l) => {
    Object.entries(l.sources || {}).forEach(([sid, s]) => {
      if ((sid !== 'ai' || l.mode === 'facts') && s && s.label) labelOf.set(`${l.id}::${sid}`, s.label);
    });
    const ms = Date.parse(l.publishedAt || l.publishedDate || '');
    pubMs.set(l.id, ms);
    if (isNaN(ms)) return;
    const srcLabels = Object.entries(l.sources || {}).filter(([sid, s]) => (sid !== 'ai' || l.mode === 'facts') && s && s.label).map(([sid, s]) => s.label);
    events.push({ ts: ms, kind: 'list', id: l.id, title: l.title, category: l.category, sources: srcLabels });
  });

  // Per-source revision notes (list.sourceRevisions in lib/data.js): shown on
  // Sources Revisited cards to explain what a re-encode corrected.
  const revisionOf = new Map();
  LISTS.forEach((l) => {
    Object.entries(l.sourceRevisions || {}).forEach(([sid, note]) => revisionOf.set(`${l.id}::${sid}`, note));
  });

  (reqRes.data || []).forEach((r) => {
    const ms = Date.parse(r.submitted_at);
    events.push({ ts: isNaN(ms) ? 0 : ms, kind: 'request', id: r.id, title: r.title, category: r.category, published: r.published });
  });

  // Voting sessions per list (consecutive votes within 4h form one entry),
  // mirroring the per-list Activity tab, so the universal ledger shows each
  // ballot's picks plus the ranking impact those votes produced.
  const VOTE_GAP_MS = 4 * 3600 * 1000;
  const voteGroupsByList = new Map();
  (voteRes.data || []).forEach((v) => {
    const ms = Date.parse(v.created_at);
    if (isNaN(ms)) return;
    if (!voteGroupsByList.has(v.list_id)) voteGroupsByList.set(v.list_id, []);
    const groups = voteGroupsByList.get(v.list_id);
    const last = groups[groups.length - 1];
    if (last && last.minTs - ms <= VOTE_GAP_MS) {
      last.votes.push({ itemName: v.item_name, delta: v.delta, ts: ms });
      if (ms < last.minTs) last.minTs = ms;
    } else {
      groups.push({ ts: ms, minTs: ms, kind: 'vote', listId: v.list_id, listTitle: titleOf(v.list_id), votes: [{ itemName: v.item_name, delta: v.delta, ts: ms }], changes: [] });
    }
  });
  const voteGroups = [...voteGroupsByList.values()].flat();

  (comRes.data || []).forEach((c) => {
    const ms = Date.parse(c.created_at);
    events.push({ ts: isNaN(ms) ? 0 : ms, kind: 'comment', listId: c.list_id, listTitle: titleOf(c.list_id), name: (c.name && c.name.trim()) || null, body: c.body, editorResponse: (c.editor_response && c.editor_response.trim()) || null });
  });

  (revRes.data || []).forEach((r) => {
    const ms = Date.parse(r.created_at);
    events.push({ ts: isNaN(ms) ? 0 : ms, kind: 'review', listId: r.list_id, listTitle: titleOf(r.list_id), message: (r.message && r.message.trim()) || null, editorResponse: (r.editor_response && r.editor_response.trim()) || null });
  });

  // Same one-time changeover cutoff the per-list feed uses: hide the June 3-5
  // scoring-formula recompute artifacts (see /api/list-feed).
  const CHANGEOVER_CUTOFF = Date.parse('2026-06-05T12:00:00Z');
  const researchAll = (resRes.data || [])
    .map((a) => ({ ts: Date.parse(a.detected_at) || 0, kind: 'research', listId: a.list_id, listTitle: titleOf(a.list_id), itemName: a.item_name, changeType: a.change_type, rank: a.rank, prevRank: a.prev_rank, cause: a.cause }))
    .filter((e) => e.ts > CHANGEOVER_CUTOFF && e.cause !== 'votes');
  // An unranked item entering the top 3 fires entered_top10 AND entered_top3;
  // show the movement once.
  const t3Keys = new Set(researchAll.filter((e) => e.changeType === 'entered_top3').map((e) => `${e.listId}::${(e.itemName || '').toLowerCase()}::${e.ts}`));
  const researchEvents = researchAll.filter((e) => !(e.changeType === 'entered_top10' && t3Keys.has(`${e.listId}::${(e.itemName || '').toLowerCase()}::${e.ts}`)));

  // Post-launch source additions (first_seen well after the list's publish),
  // grouped by add-time per list. Launch-batch sources belong to the list card
  // (request 1), so they are excluded here.
  const RESEARCH_WINDOW_MS = 26 * 3600 * 1000;
  const srcGroupMap = new Map();
  const removalsByList = new Map();
  (srcRes.data || []).forEach((r) => {
    if (r.removed_at) {
      const rm = Date.parse(r.removed_at);
      if (!isNaN(rm)) {
        if (!removalsByList.has(r.list_id)) removalsByList.set(r.list_id, []);
        removalsByList.get(r.list_id).push(rm);
      }
    }
  });
  (srcRes.data || []).forEach((r) => {
    const ms = Date.parse(r.first_seen_at);
    if (isNaN(ms)) return;
    const pub = pubMs.get(r.list_id);
    if (!isNaN(pub) && ms - pub < 6 * 3600 * 1000) return; // launch batch (6h window; mirrors ActivityFeed.jsx)
    const key = `${r.list_id}::${r.first_seen_at}`;
    if (!srcGroupMap.has(key)) srcGroupMap.set(key, { ts: ms, kind: 'source', listId: r.list_id, listTitle: titleOf(r.list_id), labels: [], srcs: [], changes: [] });
    const lbl = labelOf.get(`${r.list_id}::${r.source_id}`) || r.label || r.source_id;
    srcGroupMap.get(key).labels.push(lbl);
    srcGroupMap.get(key).srcs.push({ label: lbl });
  });
  // Label refreshes (re-gathered ratings, a new year's edition): their own
  // dated "Updated sources" groups, keyed by update time per list.
  (srcUpdRes.data || []).forEach((r) => {
    const ms = Date.parse(r.label_updated_at);
    if (isNaN(ms)) return;
    const key = `${r.list_id}::upd::${r.label_updated_at}`;
    if (!srcGroupMap.has(key)) srcGroupMap.set(key, { ts: ms, kind: 'source', listId: r.list_id, listTitle: titleOf(r.list_id), labels: [], srcs: [], changes: [], updated: true });
    const lbl = labelOf.get(`${r.list_id}::${r.source_id}`) || r.label || r.source_id;
    srcGroupMap.get(key).labels.push(lbl);
    srcGroupMap.get(key).srcs.push({ label: lbl, refreshed: true, note: revisionOf.get(`${r.list_id}::${r.source_id}`) || autoSourceNote(lbl) });
  });
  const srcGroups = [...srcGroupMap.values()];
  // Merge a same-deploy refresh into its sibling source addition for the same
  // list (stamped seconds apart by the same cron run): ONE combined "Sources
  // Revisited" card. Mirrors ActivityFeed.jsx.
  const SR_MERGE_MS = 60 * 60 * 1000;
  for (let i = srcGroups.length - 1; i >= 0; i--) {
    const u = srcGroups[i];
    if (!u.updated) continue;
    const host = srcGroups.find((a) => a !== u && !a.updated && a.listId === u.listId && Math.abs(a.ts - u.ts) <= SR_MERGE_MS);
    if (host) {
      host.labels.push(...u.labels);
      host.srcs.push(...u.srcs);
      host.mixed = true;
      srcGroups.splice(i, 1);
    }
  }
  srcGroups.forEach((g) => {
    const rms = removalsByList.get(g.listId) || [];
    g.updated = g.updated || rms.some((rm) => Math.abs(rm - g.ts) <= RESEARCH_WINDOW_MS);
  });
  // A removal in the same deploy as additions/refreshes folds into that
  // list's Sources Revisited card by name (struck-through), so the universal
  // ledger names what was removed. Mirrors ActivityFeed.jsx.
  (srcRes.data || []).forEach((r) => {
    if (!r.removed_at) return;
    const rm = Date.parse(r.removed_at);
    if (isNaN(rm)) return;
    const host = srcGroups.find((a) => a.listId === r.list_id && Math.abs(a.ts - rm) <= 60 * 60 * 1000);
    if (host) {
      const lbl = r.label || r.source_id;
      host.labels.push(lbl);
      host.srcs.push({ label: lbl, removed: true, note: revisionOf.get(`${r.list_id}::${r.source_id}`) || null });
      host.mixed = true;
    }
  });

  // Attribute each ranking change to the source addition that caused it (same
  // list, within ~26h after, most recent). Unattributed = standalone change.
  researchEvents.forEach((ev) => {
    let best = null;
    if (ev.cause === 'votes') {
      // Vote-caused changes attach to the voting session that preceded them.
      voteGroups.forEach((g) => {
        if (g.listId === ev.listId && g.minTs <= ev.ts && ev.ts - g.ts <= RESEARCH_WINDOW_MS && (!best || g.ts > best.ts)) best = g;
      });
    } else {
      srcGroups.forEach((g) => {
        if (g.listId === ev.listId && g.ts <= ev.ts && ev.ts - g.ts <= RESEARCH_WINDOW_MS && (!best || g.ts > best.ts)) best = g;
      });
    }
    if (best) best.changes.push(ev);
    // Orphan changes with no source card or voting session to attach to are not
    // rendered: a bare ranking change with no shown cause is noise (a cron-
    // re-detected vote shift duplicating the replay, or a near-launch reseed).
    // (no else clause: orphan changes are intentionally dropped)
  });
  srcGroups.forEach((g) => events.push(g));

  // Live voting impact (mirrors ActivityFeed.jsx): replay each list's vote
  // sessions backwards from the current totals so every ballot shows its
  // before/after consensus diff immediately, without waiting for the daily
  // cron. Cron-recorded rows are authoritative and win on dedupe.
  if (voteGroupsByList.size > 0) {
    try {
      const listIds = [...voteGroupsByList.keys()];
      const [totRes, extRes] = await Promise.all([
        supabaseAdmin.from('votes').select('list_id,item_name,score').in('list_id', listIds),
        supabaseAdmin.from('extras').select('list_id,item_name').in('list_id', listIds),
      ]);
      const totalsByList = new Map();
      (totRes.data || []).forEach((r) => {
        if (!totalsByList.has(r.list_id)) totalsByList.set(r.list_id, {});
        totalsByList.get(r.list_id)[`${r.list_id}::${r.item_name.toLowerCase().trim()}`] = Math.max(0, r.score);
      });
      const extrasByList = new Map();
      (extRes.data || []).forEach((r) => {
        if (!extrasByList.has(r.list_id)) extrasByList.set(r.list_id, []);
        extrasByList.get(r.list_id).push(r.item_name);
      });
      voteGroupsByList.forEach((groups, listId) => {
        const list = LISTS.find((l) => l.id === listId);
        if (!list) return;
        const consensusTop10 = (totals) => {
          try {
            const c = (getSources(list, totals, extrasByList.get(listId) || []) || []).find((x) => x.id === 'consensus');
            return c ? c.items.slice(0, 10) : null;
          } catch {
            return null;
          }
        };
        const totals = { ...(totalsByList.get(listId) || {}) };
        groups.forEach((g) => {
          // Groups run newest-first; subtracting a session's votes from the
          // running totals gives the state just before that session.
          const after = consensusTop10(totals);
          g.votes.forEach((v) => {
            const k = voteKey(list.id, v.itemName || '');
            totals[k] = (totals[k] || 0) - (v.delta || 0);
          });
          const before = consensusTop10(totals);
          if (!after || !before) return;
          const logged = new Set(g.changes.map((c) => (c.itemName || '').toLowerCase()));
          const union = [...new Set([...before, ...after])];
          const votedKeys = new Set(g.votes.map((v) => (v.itemName || '').toLowerCase().trim()));
          g.liveChanges = union
            .flatMap((item) => {
              const prevRank = before.indexOf(item) + 1; // 0 = unranked
              const rank = after.indexOf(item) + 1;
              if (prevRank === rank || logged.has(item.toLowerCase())) return [];
              return [{ itemName: item, prevRank, rank, voted: votedKeys.has(item.toLowerCase().trim()) }];
            })
            .sort((a, b) => (b.voted - a.voted) || ((a.rank || 99) - (b.rank || 99)));
        });
      });
    } catch (e) {
      // Replay is best-effort; ballots render without movement rows on error.
    }
  }
  voteGroups.forEach((g) => events.push(g));

  (notesRes && notesRes.data || []).forEach((n) => {
    const ms = Date.parse(n.created_at);
    events.push({ ts: isNaN(ms) ? 0 : ms, kind: 'note', listId: n.list_id, listTitle: titleOf(n.list_id), note: n.note });
  });

  events.sort((a, b) => b.ts - a.ts);
  const top = events.slice(0, 120);

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', color: '#1c1e24', fontFamily: "'Manrope', system-ui, -apple-system, sans-serif" }}>
      <SiteHeader active="lists" />
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '12px 24px 70px' }}>
        <div style={{ borderBottom: '1px solid rgba(20,22,28,0.16)', paddingBottom: 22, marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#0e1d40', marginBottom: 12 }}>Live</div>
          <h1 style={{ fontSize: 'clamp(30px, 6vw, 46px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.04, margin: 0 }}>Activity log</h1>
          <p style={{ fontSize: 15, lineHeight: 1.5, margin: '12px 0 0', color: '#262b35', maxWidth: 720 }}>
            Everything happening across Source of Truths: new lists, reader requests, votes, comments, review requests, and ranking changes. Names and emails are never shown.
          </p>
        </div>
        <FeedClient events={top} />
      </div>
      <Footer />
    </div>
  );
}

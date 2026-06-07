import LegalLayout from '@/app/LegalLayout';
import FeedClient from './FeedClient';
import { supabaseAdmin } from '@/lib/supabase-server';
import { LISTS, COLORS } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Activity Ledger | Source of Truths',
  description: 'Live activity across every Source of Truths list: new lists, reader requests, votes, comments, and ranking changes.',
};

export default async function FeedPage() {
  const titleMap = new Map(LISTS.map((l) => [l.id, l.title]));
  const titleOf = (id) => titleMap.get(id) || id;

  let reqRes = {}, voteRes = {}, comRes = {}, revRes = {}, resRes = {}, notesRes = {}, srcRes = {};
  try {
    [reqRes, voteRes, comRes, revRes, resRes, notesRes, srcRes] = await Promise.all([
      supabaseAdmin.from('user_lists').select('id,title,category,published,submitted_at').order('submitted_at', { ascending: false }).limit(25),
      supabaseAdmin.from('vote_events').select('list_id,item_name,delta,created_at').order('created_at', { ascending: false }).limit(40),
      supabaseAdmin.from('list_comments').select('list_id,name,body,created_at,editor_response').eq('hidden', false).order('created_at', { ascending: false }).limit(40),
      supabaseAdmin.from('complaints').select('list_id,message,created_at,editor_response').eq('feed_hidden', false).order('created_at', { ascending: false }).limit(25),
      supabaseAdmin.from('consensus_alerts').select('list_id,item_name,change_type,rank,detected_at').order('detected_at', { ascending: false }).limit(25),
      supabaseAdmin.from('list_editor_notes').select('list_id,note,created_at').order('created_at', { ascending: false }).limit(40),
      supabaseAdmin.from('list_sources_seen').select('list_id,source_id,first_seen_at,label').order('first_seen_at', { ascending: false }).limit(400),
    ]);
  } catch (e) {
    // Render whatever static data we have on a DB hiccup.
  }

  const events = [];

  const labelOf = new Map();
  const pubMs = new Map();
  LISTS.forEach((l) => {
    Object.entries(l.sources || {}).forEach(([sid, s]) => {
      if (sid !== 'ai' && s && s.label) labelOf.set(`${l.id}::${sid}`, s.label);
    });
    const ms = Date.parse(l.publishedAt || l.publishedDate || '');
    pubMs.set(l.id, ms);
    if (isNaN(ms)) return;
    const srcLabels = Object.entries(l.sources || {}).filter(([sid, s]) => sid !== 'ai' && s && s.label).map(([sid, s]) => s.label);
    events.push({ ts: ms, kind: 'list', id: l.id, title: l.title, category: l.category, sources: srcLabels });
  });

  (reqRes.data || []).forEach((r) => {
    const ms = Date.parse(r.submitted_at);
    events.push({ ts: isNaN(ms) ? 0 : ms, kind: 'request', id: r.id, title: r.title, category: r.category, published: r.published });
  });

  (voteRes.data || []).forEach((v) => {
    const ms = Date.parse(v.created_at);
    events.push({ ts: isNaN(ms) ? 0 : ms, kind: 'vote', listId: v.list_id, listTitle: titleOf(v.list_id), itemName: v.item_name, delta: v.delta });
  });

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
  const researchEvents = (resRes.data || [])
    .map((a) => ({ ts: Date.parse(a.detected_at) || 0, kind: 'research', listId: a.list_id, listTitle: titleOf(a.list_id), itemName: a.item_name, changeType: a.change_type, rank: a.rank }))
    .filter((e) => e.ts > CHANGEOVER_CUTOFF);

  // Post-launch source additions (first_seen well after the list's publish),
  // grouped by add-time per list. Launch-batch sources belong to the list card
  // (request 1), so they are excluded here.
  const srcGroupMap = new Map();
  (srcRes.data || []).forEach((r) => {
    const ms = Date.parse(r.first_seen_at);
    if (isNaN(ms)) return;
    const pub = pubMs.get(r.list_id);
    if (!isNaN(pub) && ms - pub < 6 * 3600 * 1000) return; // launch batch (6h window; mirrors ActivityFeed.jsx)
    const key = `${r.list_id}::${r.first_seen_at}`;
    if (!srcGroupMap.has(key)) srcGroupMap.set(key, { ts: ms, kind: 'source', listId: r.list_id, listTitle: titleOf(r.list_id), labels: [], changes: [] });
    srcGroupMap.get(key).labels.push(labelOf.get(`${r.list_id}::${r.source_id}`) || r.label || r.source_id);
  });
  const srcGroups = [...srcGroupMap.values()];

  // Attribute each ranking change to the source addition that caused it (same
  // list, within ~26h after, most recent). Unattributed = standalone change.
  const RESEARCH_WINDOW_MS = 26 * 3600 * 1000;
  researchEvents.forEach((ev) => {
    let best = null;
    srcGroups.forEach((g) => {
      if (g.listId === ev.listId && g.ts <= ev.ts && ev.ts - g.ts <= RESEARCH_WINDOW_MS && (!best || g.ts > best.ts)) best = g;
    });
    if (best) best.changes.push(ev);
    else events.push(ev);
  });
  srcGroups.forEach((g) => events.push(g));

  (notesRes && notesRes.data || []).forEach((n) => {
    const ms = Date.parse(n.created_at);
    events.push({ ts: isNaN(ms) ? 0 : ms, kind: 'note', listId: n.list_id, listTitle: titleOf(n.list_id), note: n.note });
  });

  events.sort((a, b) => b.ts - a.ts);
  const top = events.slice(0, 120);

  return (
    <LegalLayout kicker="Live" title="Activity" italic="ledger">
      <p style={{ marginTop: -8, marginBottom: 28, color: COLORS.faded }}>
        Everything happening across Source of Truths: new lists, reader requests, votes, comments, review requests, and ranking changes. Names and emails are never shown.
      </p>
      <FeedClient events={top} />
    </LegalLayout>
  );
}

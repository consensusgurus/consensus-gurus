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

  let reqRes = {}, voteRes = {}, comRes = {}, revRes = {}, resRes = {}, notesRes = {};
  try {
    [reqRes, voteRes, comRes, revRes, resRes, notesRes] = await Promise.all([
      supabaseAdmin.from('user_lists').select('id,title,category,published,submitted_at').order('submitted_at', { ascending: false }).limit(25),
      supabaseAdmin.from('vote_events').select('list_id,item_name,delta,created_at').order('created_at', { ascending: false }).limit(40),
      supabaseAdmin.from('list_comments').select('list_id,name,body,created_at,editor_response').eq('hidden', false).order('created_at', { ascending: false }).limit(40),
      supabaseAdmin.from('complaints').select('list_id,message,created_at,editor_response').eq('feed_hidden', false).order('created_at', { ascending: false }).limit(25),
      supabaseAdmin.from('consensus_alerts').select('list_id,item_name,change_type,rank,detected_at').order('detected_at', { ascending: false }).limit(25),
      supabaseAdmin.from('list_editor_notes').select('list_id,note,created_at').order('created_at', { ascending: false }).limit(40),
    ]);
  } catch (e) {
    // Render whatever static data we have on a DB hiccup.
  }

  const events = [];

  LISTS.forEach((l) => {
    const ms = Date.parse(l.publishedAt || l.publishedDate || '');
    if (!isNaN(ms)) events.push({ ts: ms, kind: 'list', id: l.id, title: l.title, category: l.category });
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

  (resRes.data || []).forEach((a) => {
    const ms = Date.parse(a.detected_at);
    events.push({ ts: isNaN(ms) ? 0 : ms, kind: 'research', listId: a.list_id, listTitle: titleOf(a.list_id), itemName: a.item_name, changeType: a.change_type, rank: a.rank });
  });

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

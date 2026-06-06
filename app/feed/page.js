import LegalLayout from '@/app/LegalLayout';
import Link from 'next/link';
import { Flag, ListPlus, BarChart3, MessageSquare, PenLine, RefreshCw } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase-server';
import { LISTS, COLORS } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Newsfeed | Source of Truths',
  description: 'Live activity across every Source of Truths list: new lists, reader requests, votes, comments, and ranking changes.',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtDate(ms) {
  if (!ms) return '';
  const d = new Date(ms);
  if (isNaN(d)) return '';
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function rankWord(delta) {
  if (delta === 3) return '1st';
  if (delta === 2) return '2nd';
  if (delta === 1) return '3rd';
  return null;
}

function Event({ icon, color, kicker, date, children }) {
  return (
    <div style={{ position: 'relative', paddingLeft: 23, marginBottom: 20 }}>
      <span style={{ position: 'absolute', left: 5, top: 5, width: 11, height: 11, borderRadius: '50%', background: color, border: `2px solid ${COLORS.cream}` }} />
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon}
        <span>{kicker}</span>
        {date && <span style={{ opacity: 0.8 }}>· {date}</span>}
      </div>
      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: COLORS.ink, marginTop: 3, lineHeight: 1.45 }}>{children}</div>
    </div>
  );
}

function ListLink({ id, children }) {
  return (
    <Link href={`/list/${encodeURIComponent(id)}`} style={{ color: COLORS.ember, textDecoration: 'none', fontWeight: 500 }}>
      {children}
    </Link>
  );
}

export default async function FeedPage() {
  const titleMap = new Map(LISTS.map((l) => [l.id, l.title]));
  const titleOf = (id) => titleMap.get(id) || id;

  let reqRes = {}, voteRes = {}, comRes = {}, revRes = {}, resRes = {};
  try {
    [reqRes, voteRes, comRes, revRes, resRes] = await Promise.all([
      supabaseAdmin.from('user_lists').select('id,title,category,published,submitted_at').order('submitted_at', { ascending: false }).limit(25),
      supabaseAdmin.from('vote_events').select('list_id,item_name,delta,created_at').order('created_at', { ascending: false }).limit(40),
      supabaseAdmin.from('list_comments').select('list_id,name,body,created_at').eq('hidden', false).order('created_at', { ascending: false }).limit(40),
      supabaseAdmin.from('complaints').select('list_id,message,created_at').eq('feed_hidden', false).order('created_at', { ascending: false }).limit(25),
      supabaseAdmin.from('consensus_alerts').select('list_id,item_name,change_type,rank,detected_at').order('detected_at', { ascending: false }).limit(25),
    ]);
  } catch (e) {
    // Render whatever static data we have on a DB hiccup.
  }

  const events = [];

  // New lists published (from the live site data).
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
    events.push({ ts: isNaN(ms) ? 0 : ms, kind: 'vote', listId: v.list_id, itemName: v.item_name, delta: v.delta });
  });

  (comRes.data || []).forEach((c) => {
    const ms = Date.parse(c.created_at);
    events.push({ ts: isNaN(ms) ? 0 : ms, kind: 'comment', listId: c.list_id, name: (c.name && c.name.trim()) || null, body: c.body });
  });

  (revRes.data || []).forEach((r) => {
    const ms = Date.parse(r.created_at);
    events.push({ ts: isNaN(ms) ? 0 : ms, kind: 'review', listId: r.list_id, message: (r.message && r.message.trim()) || null });
  });

  (resRes.data || []).forEach((a) => {
    const ms = Date.parse(a.detected_at);
    events.push({ ts: isNaN(ms) ? 0 : ms, kind: 'research', listId: a.list_id, itemName: a.item_name, changeType: a.change_type, rank: a.rank });
  });

  events.sort((a, b) => b.ts - a.ts);
  const top = events.slice(0, 80);

  return (
    <LegalLayout kicker="Live" title="The" italic="newsfeed">
      <p style={{ marginTop: -8, marginBottom: 28, color: COLORS.faded }}>
        Everything happening across Source of Truths: new lists, reader requests, votes, comments, review requests, and ranking changes. Names and emails are never shown.
      </p>

      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 5, top: 6, bottom: 6, width: 2, background: COLORS.paper }} />

        {top.length === 0 && (
          <p style={{ fontStyle: 'italic', color: COLORS.faded }}>No activity yet.</p>
        )}

        {top.map((e, i) => {
          if (e.kind === 'list') {
            return (
              <Event key={i} icon={<Flag size={12} strokeWidth={2.5} />} color={COLORS.ink} kicker="New list" date={fmtDate(e.ts)}>
                <ListLink id={e.id}>{e.title}</ListLink>{e.category ? ` · ${e.category}` : ''}
              </Event>
            );
          }
          if (e.kind === 'request') {
            return (
              <Event key={i} icon={<ListPlus size={12} strokeWidth={2.5} />} color={COLORS.rust} kicker="List requested" date={fmtDate(e.ts)}>
                A reader requested <strong style={{ fontWeight: 500 }}>{e.title || 'a new list'}</strong>{e.category ? ` (${e.category})` : ''}.{e.published ? <> Now live: <ListLink id={e.id}>see it</ListLink>.</> : ' Pending review.'}
              </Event>
            );
          }
          if (e.kind === 'vote') {
            const rw = rankWord(e.delta);
            return (
              <Event key={i} icon={<BarChart3 size={12} strokeWidth={2.5} />} color={COLORS.forest} kicker="Vote" date={fmtDate(e.ts)}>
                Someone voted <strong style={{ fontWeight: 500 }}>{e.itemName}</strong>{rw ? ` ${rw} pick` : ''} on <ListLink id={e.listId}>{titleOf(e.listId)}</ListLink>.
              </Event>
            );
          }
          if (e.kind === 'comment') {
            return (
              <Event key={i} icon={<MessageSquare size={12} strokeWidth={2.5} />} color={COLORS.ember} kicker={`Comment · ${e.name || 'Guest'}`} date={fmtDate(e.ts)}>
                "{e.body}" on <ListLink id={e.listId}>{titleOf(e.listId)}</ListLink>
              </Event>
            );
          }
          if (e.kind === 'review') {
            return (
              <Event key={i} icon={<PenLine size={12} strokeWidth={2.5} />} color={COLORS.faded} kicker="Review request" date={fmtDate(e.ts)}>
                User submitted review request on <ListLink id={e.listId}>{titleOf(e.listId)}</ListLink>: {e.message ? `"${e.message}"` : 'No comment given.'}
              </Event>
            );
          }
          if (e.kind === 'research') {
            const tail = e.changeType === 'entered_top3' ? `entered the top 3 (#${e.rank || 3})` : e.changeType === 'entered_top10' ? 'entered the top 10' : 'moved in the rankings';
            return (
              <Event key={i} icon={<RefreshCw size={12} strokeWidth={2.5} />} color={COLORS.forest} kicker="Ranking change" date={fmtDate(e.ts)}>
                <strong style={{ fontWeight: 500 }}>{e.itemName}</strong> {tail} on <ListLink id={e.listId}>{titleOf(e.listId)}</ListLink>.
              </Event>
            );
          }
          return null;
        })}
      </div>
    </LegalLayout>
  );
}

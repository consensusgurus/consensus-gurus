'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Flag, ListPlus, BarChart3, MessageSquare, PenLine, RefreshCw } from 'lucide-react';
import { COLORS } from '@/lib/data';

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

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'list', label: 'New lists' },
  { key: 'request', label: 'Requests' },
  { key: 'vote', label: 'Votes' },
  { key: 'comment', label: 'Comments' },
  { key: 'review', label: 'Review requests' },
  { key: 'research', label: 'Ranking changes' },
];

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

function renderEvent(e, i) {
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
        Someone voted <strong style={{ fontWeight: 500 }}>{e.itemName}</strong>{rw ? ` ${rw} pick` : ''} on <ListLink id={e.listId}>{e.listTitle}</ListLink>.
      </Event>
    );
  }
  if (e.kind === 'comment') {
    return (
      <Event key={i} icon={<MessageSquare size={12} strokeWidth={2.5} />} color={COLORS.ember} kicker={`Comment · ${e.name || 'Guest'}`} date={fmtDate(e.ts)}>
        "{e.body}" on <ListLink id={e.listId}>{e.listTitle}</ListLink>
        {e.editorResponse && (<div style={{ marginTop: 5, paddingTop: 5, borderTop: `1px solid ${COLORS.paper}` }}><strong style={{ fontWeight: 700, color: COLORS.ember }}>Editor:</strong> {e.editorResponse}</div>)}
      </Event>
    );
  }
  if (e.kind === 'review') {
    return (
      <Event key={i} icon={<PenLine size={12} strokeWidth={2.5} />} color={COLORS.faded} kicker="Review request" date={fmtDate(e.ts)}>
        User submitted review request on <ListLink id={e.listId}>{e.listTitle}</ListLink>: {e.message ? `"${e.message}"` : 'No comment given.'}
        {e.editorResponse && (<div style={{ marginTop: 5, paddingTop: 5, borderTop: `1px solid ${COLORS.paper}` }}><strong style={{ fontWeight: 700, color: COLORS.ember }}>Editor:</strong> {e.editorResponse}</div>)}
      </Event>
    );
  }
  if (e.kind === 'research') {
    const tail = e.changeType === 'entered_top3' ? `entered the top 3 (#${e.rank || 3})` : e.changeType === 'entered_top10' ? 'entered the top 10' : 'moved in the rankings';
    return (
      <Event key={i} icon={<RefreshCw size={12} strokeWidth={2.5} />} color={COLORS.forest} kicker="Ranking change" date={fmtDate(e.ts)}>
        <strong style={{ fontWeight: 500 }}>{e.itemName}</strong> {tail} on <ListLink id={e.listId}>{e.listTitle}</ListLink>.
      </Event>
    );
  }
  return null;
}

export default function FeedClient({ events = [] }) {
  const [filter, setFilter] = useState('all');
  const counts = {};
  events.forEach((e) => { counts[e.kind] = (counts[e.kind] || 0) + 1; });
  const shown = filter === 'all' ? events : events.filter((e) => e.kind === filter);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        {CATEGORIES.map((c) => {
          const active = filter === c.key;
          const n = c.key === 'all' ? events.length : (counts[c.key] || 0);
          return (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              style={{
                background: active ? COLORS.ember : 'transparent',
                color: active ? COLORS.cream : COLORS.ember,
                border: `1.5px solid ${COLORS.ember}`,
                padding: '7px 13px',
                fontFamily: 'DM Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: 0,
              }}
            >
              {c.label} <span style={{ opacity: 0.6 }}>{n}</span>
            </button>
          );
        })}
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 5, top: 6, bottom: 6, width: 2, background: COLORS.paper }} />
        {shown.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: COLORS.faded, fontFamily: 'DM Sans, sans-serif' }}>Nothing in this category yet.</p>
        ) : (
          shown.map((e, i) => renderEvent(e, i))
        )}
      </div>
    </div>
  );
}

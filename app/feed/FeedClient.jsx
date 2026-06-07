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

// Each event kind gets its own distinct accent color + icon so categories
// read as separate blocks instead of running together.
const KIND = {
  list:     { color: '#2f4858', label: 'New list',       Icon: Flag },
  request:  { color: '#a44a26', label: 'List requested',  Icon: ListPlus },
  vote:     { color: '#3d4f2b', label: 'Vote',            Icon: BarChart3 },
  comment:  { color: '#c0392b', label: 'Comment',         Icon: MessageSquare },
  review:   { color: '#9a6a1f', label: 'Review request',  Icon: PenLine },
  research: { color: '#5a4a7a', label: 'Ranking change',  Icon: RefreshCw },
};

const CATEGORIES = [
  { key: 'all', label: 'All', color: COLORS.ink },
  { key: 'list', label: 'New lists', color: KIND.list.color },
  { key: 'request', label: 'Requests', color: KIND.request.color },
  { key: 'vote', label: 'Votes', color: KIND.vote.color },
  { key: 'comment', label: 'Comments', color: KIND.comment.color },
  { key: 'review', label: 'Review requests', color: KIND.review.color },
  { key: 'research', label: 'Ranking changes', color: KIND.research.color },
];

function Event({ kind, kicker, date, children }) {
  const { color, label, Icon } = KIND[kind] || {};
  return (
    <div
      style={{
        position: 'relative',
        marginBottom: 12,
        padding: '11px 15px 12px',
        background: `${color}12`,
        borderLeft: `3px solid ${color}`,
        borderRadius: '0 5px 5px 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            background: `${color}1f`,
            color,
            padding: '3px 8px',
            borderRadius: 3,
            fontFamily: 'DM Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          {Icon && <Icon size={11} strokeWidth={2.5} />}
          {kicker || label}
        </span>
        {date && (
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.faded }}>
            {date}
          </span>
        )}
      </div>
      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: COLORS.ink, marginTop: 6, lineHeight: 1.45 }}>{children}</div>
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
      <Event key={i} kind="list" date={fmtDate(e.ts)}>
        <ListLink id={e.id}>{e.title}</ListLink>{e.category ? ` · ${e.category}` : ''}
      </Event>
    );
  }
  if (e.kind === 'request') {
    return (
      <Event key={i} kind="request" date={fmtDate(e.ts)}>
        A reader requested <strong style={{ fontWeight: 500 }}>{e.title || 'a new list'}</strong>{e.category ? ` (${e.category})` : ''}.{e.published ? <> Now live: <ListLink id={e.id}>see it</ListLink>.</> : ' Pending review.'}
      </Event>
    );
  }
  if (e.kind === 'vote') {
    const rw = rankWord(e.delta);
    return (
      <Event key={i} kind="vote" date={fmtDate(e.ts)}>
        Someone voted <strong style={{ fontWeight: 500 }}>{e.itemName}</strong>{rw ? ` ${rw} pick` : ''} on <ListLink id={e.listId}>{e.listTitle}</ListLink>.
      </Event>
    );
  }
  if (e.kind === 'comment') {
    return (
      <Event key={i} kind="comment" kicker={`Comment · ${e.name || 'Guest'}`} date={fmtDate(e.ts)}>
        "{e.body}" on <ListLink id={e.listId}>{e.listTitle}</ListLink>
      </Event>
    );
  }
  if (e.kind === 'review') {
    return (
      <Event key={i} kind="review" date={fmtDate(e.ts)}>
        User submitted review request on <ListLink id={e.listId}>{e.listTitle}</ListLink>: {e.message ? `"${e.message}"` : 'No comment given.'}
      </Event>
    );
  }
  if (e.kind === 'research') {
    const tail = e.changeType === 'entered_top3' ? `entered the top 3 (#${e.rank || 3})` : e.changeType === 'entered_top10' ? 'entered the top 10' : 'moved in the rankings';
    return (
      <Event key={i} kind="research" date={fmtDate(e.ts)}>
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: active ? c.color : `${c.color}12`,
                color: active ? COLORS.cream : c.color,
                border: `1.5px solid ${c.color}`,
                padding: '7px 13px',
                fontFamily: 'DM Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: 3,
              }}
            >
              {c.key !== 'all' && (
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: active ? COLORS.cream : c.color }} />
              )}
              {c.label} <span style={{ opacity: 0.6 }}>{n}</span>
            </button>
          );
        })}
      </div>

      <div>
        {shown.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: COLORS.faded, fontFamily: 'DM Sans, sans-serif' }}>Nothing in this category yet.</p>
        ) : (
          shown.map((e, i) => renderEvent(e, i))
        )}
      </div>
    </div>
  );
}

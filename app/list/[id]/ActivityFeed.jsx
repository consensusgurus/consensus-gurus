'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Flag,
  BookMarked,
  RefreshCw,
  BarChart3,
  MessageSquare,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { COLORS } from '@/lib/data';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  } catch {
    return '';
  }
}

function fmtShort(iso) {
  try {
    const d = new Date(iso);
    return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  } catch {
    return '';
  }
}

// Relative time for the live streams: "12s ago", "4m ago", "3h ago", else date.
function fmtRelative(iso) {
  try {
    const then = new Date(iso).getTime();
    const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return fmtShort(iso);
  } catch {
    return '';
  }
}

function dayKey(iso) {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

// 1st pick = delta 3, 2nd = delta 2, 3rd = delta 1 (see DetailClient points map).
function rankWord(delta) {
  if (delta === 3) return '1st';
  if (delta === 2) return '2nd';
  if (delta === 1) return '3rd';
  return null;
}

function researchLabel(ev) {
  const item = ev.itemName || 'An item';
  if (ev.changeType === 'entered_top3') return { item, tail: `entered the top 3 (#${ev.rank || 3})` };
  if (ev.changeType === 'entered_top10') return { item, tail: 'entered the top 10' };
  return { item, tail: 'moved in the rankings' };
}

const MONO = "'DM Mono', monospace";
const SERIF = "'Fraunces', serif";
const SANS = "'DM Sans', sans-serif";

// Per-category accent colors, matching the global activity ledger (FeedClient).
const KC = {
  source: '#2f4858',   // slate  - sources on file / source added
  research: '#5a4a7a', // purple - re-researched / ranking changes
  vote: '#3d4f2b',     // forest - live votes
  review: '#9a6a1f',   // amber  - review requests
  created: '#1a1611',  // ink    - list created
  comment: '#c0392b',  // ember  - public comments
};

// Tinted card with a colored left border, one per activity category.
function cardStyle(color) {
  return {
    position: 'relative',
    marginBottom: 12,
    padding: '12px 15px 13px',
    background: `${color}12`,
    borderLeft: `3px solid ${color}`,
    borderRadius: '0 6px 6px 0',
  };
}

function Badge({ icon, color, children, live, date }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          background: `${color}24`,
          color,
          padding: '3px 8px',
          borderRadius: 3,
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
      >
        {icon}
        {children}
      </span>
      {date && (
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.faded }}>
          {date}
        </span>
      )}
      {live && (
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: color,
            display: 'inline-block',
            animation: 'sotpulse 1.6s ease-in-out infinite',
          }}
        />
      )}
    </div>
  );
}

function SourceCard({ s }) {
  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${COLORS.paper}`,
        borderRadius: 7,
        padding: '7px 11px',
        fontSize: 13,
        color: COLORS.ink,
      }}
    >
      {s.label}
      {s.trueExpert && (
        <span
          style={{
            fontSize: 10,
            background: '#f6e3cf',
            color: COLORS.rust,
            padding: '1px 7px',
            borderRadius: 10,
            marginLeft: 6,
            fontFamily: MONO,
          }}
        >
          True Expert
        </span>
      )}
    </div>
  );
}

// Per-list activity feed: created time, sources (dated), re-research, live
// votes, anonymized review requests, and public comments.
export default function ActivityFeed({ list }) {
  const [feed, setFeed] = useState({ votes: [], manager: [], research: [], comments: [], sources: [] });
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);

  async function load() {
    try {
      const res = await fetch(`/api/list-feed?listId=${encodeURIComponent(list.id)}`, { cache: 'no-store' });
      const data = await res.json();
      setFeed({
        votes: data.votes || [],
        manager: data.manager || [],
        research: data.research || [],
        comments: data.comments || [],
        sources: data.sources || [],
      });
    } catch {
      /* leave streams empty on error */
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.id]);

  async function postComment() {
    const text = body.trim();
    if (!text || posting) return;
    setPosting(true);
    const optimistic = { name: name.trim() || null, body: text, createdAt: new Date().toISOString() };
    setFeed((f) => ({ ...f, comments: [optimistic, ...f.comments] }));
    setBody('');
    setName('');
    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId: list.id, name: optimistic.name || '', body: text }),
      });
    } catch {
      /* optimistic entry stays; reconciles on next poll */
    }
    setPosting(false);
  }

  // Sources from the feed API (dated). Fall back to the static list data if the
  // API returned none (e.g. before the source-tracking migration is applied).
  const apiSources = feed.sources || [];
  const clientSources = Object.entries(list.sources || {})
    .filter(([id, s]) => id !== 'ai' && s && s.label)
    .map(([id, s]) => ({ id, label: s.label, trueExpert: Boolean(s.trueExpert), addedAt: list.publishedAt || list.publishedDate || null }));
  const sources = apiSources.length ? apiSources : clientSources;

  // Group sources by add-date: the earliest date is the "launch/backfill" batch
  // (shown as one entry); anything added later shows as its own news entry.
  let launchSources = sources;
  let laterSources = [];
  if (sources.length > 0) {
    const days = sources.map((s) => dayKey(s.addedAt)).filter(Boolean);
    const baseline = days.length ? days.sort()[0] : null;
    if (baseline) {
      launchSources = sources.filter((s) => dayKey(s.addedAt) <= baseline);
      laterSources = sources
        .filter((s) => dayKey(s.addedAt) > baseline)
        .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    }
  }
  const launchDate = launchSources.length ? launchSources[0].addedAt : null;

  const created = list.publishedAt || list.publishedDate;

  return (
    <div style={{ fontFamily: SANS, color: COLORS.ink, maxWidth: 640, paddingBottom: 40 }}>
      <style>{`@keyframes sotpulse{0%,100%{opacity:1}50%{opacity:.25}}`}</style>

      <div>
        {/* Later source additions: each its own news entry, newest first */}
        {laterSources.map((s, i) => (
          <section key={`later-${i}`} style={cardStyle(KC.source)}>
            <Badge color={KC.source} icon={<BookMarked size={11} strokeWidth={2.5} />} date={fmtDate(s.addedAt)}>
              Source added
            </Badge>
            <div style={{ fontFamily: SERIF, fontSize: 16, margin: '6px 0 8px' }}>New source on file</div>
            <SourceCard s={s} />
          </section>
        ))}

        {/* Re-research / consensus changes */}
        {feed.research.length > 0 && (
          <section style={cardStyle(KC.research)}>
            <Badge color={KC.research} icon={<RefreshCw size={11} strokeWidth={2.5} />}>Re-researched</Badge>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 9 }}>
              {feed.research.map((ev, i) => {
                const { item, tail } = researchLabel(ev);
                return (
                  <div key={i}>
                    <div style={{ fontSize: 13, color: COLORS.ink }}>
                      <strong style={{ fontWeight: 500, color: KC.research }}>{item}</strong> {tail}.
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 11, color: COLORS.faded, marginTop: 2 }}>{fmtDate(ev.detectedAt)}</div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Live votes */}
        <section style={cardStyle(KC.vote)}>
          <Badge color={KC.vote} icon={<BarChart3 size={11} strokeWidth={2.5} />} live>
            Live votes
          </Badge>
          {feed.votes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {feed.votes.slice(0, 8).map((v, i) => {
                const rw = rankWord(v.delta);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    {v.delta >= 0 ? (
                      <ArrowUp size={14} strokeWidth={2.5} color={COLORS.forest} />
                    ) : (
                      <ArrowDown size={14} strokeWidth={2.5} color={COLORS.ember} />
                    )}
                    <span>
                      Someone voted{' '}
                      <strong style={{ fontWeight: 500 }}>{v.itemName}</strong>
                      {rw && (
                        <span style={{ fontFamily: MONO, fontSize: 10, color: COLORS.rust, marginLeft: 6 }}>
                          {rw} pick
                        </span>
                      )}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: COLORS.faded, marginLeft: 'auto' }}>
                      {fmtRelative(v.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: COLORS.faded, marginTop: 6 }}>
              {loaded ? 'No votes yet. Be the first on the Vote tab.' : 'Loading…'}
            </div>
          )}
        </section>

        {/* Manager notes (anonymized) */}
        {feed.manager.length > 0 && (
          <section style={cardStyle(KC.review)}>
            <Badge color={KC.review} icon={<MessageSquare size={11} strokeWidth={2.5} />}>Review requests</Badge>
            <div style={{ fontSize: 12, color: COLORS.faded, marginTop: 4, fontStyle: 'italic' }}>
              Notes sent privately to the editors. No names or emails shown.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 9 }}>
              {feed.manager.map((m, i) => (
                <div
                  key={i}
                  style={{
                    background: '#fff',
                    borderLeft: `3px solid ${KC.review}`,
                    borderRadius: '0 7px 7px 0',
                    padding: '8px 11px',
                    fontSize: 13,
                  }}
                >
                  {m.message}
                  <span style={{ display: 'block', fontFamily: MONO, fontSize: 10, color: COLORS.faded, marginTop: 3 }}>
                    Anonymous · {fmtShort(m.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Launch / backfill source batch (oldest), and list created */}
        {launchSources.length > 0 && (
          <section style={cardStyle(KC.source)}>
            <Badge color={KC.source} icon={<BookMarked size={11} strokeWidth={2.5} />} date={launchDate ? fmtDate(launchDate) : undefined}>
              Sources
            </Badge>
            <div style={{ fontFamily: SERIF, fontSize: 16, margin: '6px 0 8px' }}>
              {launchSources.length} {launchSources.length === 1 ? 'source' : 'sources'} on file
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {launchSources.map((s, i) => (
                <SourceCard key={i} s={s} />
              ))}
            </div>
          </section>
        )}

        <section style={{ ...cardStyle(KC.created), marginBottom: 0 }}>
          <Badge color={KC.created} icon={<Flag size={11} strokeWidth={2.5} />} date={created ? fmtDate(created) : undefined}>
            List created
          </Badge>
          <div style={{ fontFamily: SERIF, fontSize: 16, marginTop: 6 }}>Published the ranking</div>
          <div style={{ fontSize: 13, color: COLORS.faded, marginTop: 2 }}>Seeded from expert sources and live fan voting.</div>
        </section>
      </div>

      {/* Public comments */}
      <div style={{ borderTop: `2px solid ${COLORS.ink}`, marginTop: 28, paddingTop: 16 }}>
        <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600 }}>Join the conversation</div>
        <div style={{ fontSize: 12, color: COLORS.faded, marginBottom: 12 }}>
          Public comment. Name is optional, posts as "Guest" if left blank.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
          {feed.comments.length === 0 && loaded && (
            <div style={{ fontSize: 13, color: COLORS.faded }}>No comments yet. Start the conversation.</div>
          )}
          {feed.comments.map((c, i) => {
            const guest = !c.name;
            return (
              <div key={c.id || i} style={{ display: 'flex', gap: 10 }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: guest ? COLORS.faded : COLORS.ember,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: MONO,
                    fontSize: 12,
                  }}
                >
                  {guest ? '?' : initials(c.name)}
                </div>
                <div style={{ background: '#fff', border: `1px solid ${COLORS.paper}`, borderRadius: 9, padding: '8px 12px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name || 'Guest'}</span>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: COLORS.faded }}>{fmtRelative(c.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: 13, marginTop: 2, whiteSpace: 'pre-wrap' }}>{c.body}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: '#fff', border: `1px solid ${COLORS.faded}`, borderRadius: 10, padding: 11 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            maxLength={120}
            style={{ width: '100%', boxSizing: 'border-box', border: 'none', borderBottom: `1px solid ${COLORS.paper}`, background: 'transparent', fontFamily: SANS, fontSize: 13, padding: '5px 2px', marginBottom: 8, outline: 'none', color: COLORS.ink }}
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a comment…"
            rows={2}
            maxLength={1000}
            style={{ width: '100%', boxSizing: 'border-box', border: 'none', background: 'transparent', fontFamily: SANS, fontSize: 13, padding: 2, resize: 'vertical', outline: 'none', color: COLORS.ink }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
            <button
              onClick={postComment}
              disabled={posting || !body.trim()}
              style={{ background: COLORS.ember, color: '#fff', border: 'none', fontFamily: MONO, fontSize: 12, letterSpacing: '0.08em', padding: '7px 16px', borderRadius: 7, cursor: posting || !body.trim() ? 'default' : 'pointer', opacity: posting || !body.trim() ? 0.5 : 1 }}
            >
              {posting ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

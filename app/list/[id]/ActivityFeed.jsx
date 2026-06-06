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
  Plus,
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

function initials(name) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
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

function Dot({ color }) {
  return (
    <span
      style={{
        position: 'absolute',
        left: -23,
        top: 4,
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: color,
        border: `2px solid ${COLORS.cream}`,
      }}
    />
  );
}

function Kicker({ icon, children, live }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: COLORS.faded,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {icon}
      <span>{children}</span>
      {live && (
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: COLORS.forest,
            display: 'inline-block',
            animation: 'sotpulse 1.6s ease-in-out infinite',
          }}
        />
      )}
    </div>
  );
}

export default function ActivityFeed({ list }) {
  const [feed, setFeed] = useState({ votes: [], manager: [], research: [], comments: [] });
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const commentsRef = useRef(null);

  async function load() {
    try {
      const res = await fetch(`/api/list-feed?listId=${encodeURIComponent(list.id)}`, { cache: 'no-store' });
      const data = await res.json();
      setFeed({
        votes: data.votes || [],
        manager: data.manager || [],
        research: data.research || [],
        comments: data.comments || [],
      });
    } catch {
      /* leave streams empty on error */
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    load();
    // Light polling so the live streams refresh while the tab is open.
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.id]);

  async function postComment() {
    const text = body.trim();
    if (!text || posting) return;
    setPosting(true);
    // Optimistic: show it immediately, then reconcile on next poll.
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

  // Sources from the list data (client-side), skipping the ai seed.
  const sources = Object.entries(list.sources || {})
    .filter(([id]) => id !== 'ai')
    .map(([, s]) => s)
    .filter((s) => s && s.label);

  const created = list.publishedAt || list.publishedDate;

  const cardStyle = {
    background: '#fff',
    border: `1px solid ${COLORS.paper}`,
    borderRadius: 7,
    padding: '7px 11px',
    fontSize: 13,
    color: COLORS.ink,
  };

  return (
    <div style={{ fontFamily: SANS, color: COLORS.ink, maxWidth: 640 }}>
      <style>{`@keyframes sotpulse{0%,100%{opacity:1}50%{opacity:.25}}`}</style>

      <div style={{ position: 'relative', paddingLeft: 23 }}>
        <div
          style={{
            position: 'absolute',
            left: 5,
            top: 6,
            bottom: 6,
            width: 2,
            background: COLORS.paper,
          }}
        />

        {/* 1. List created */}
        <section style={{ position: 'relative', marginBottom: 26 }}>
          <Dot color={COLORS.ink} />
          <Kicker icon={<Flag size={12} strokeWidth={2.5} />}>List created</Kicker>
          <div style={{ fontFamily: SERIF, fontSize: 16, marginTop: 3 }}>Published the ranking</div>
          <div style={{ fontSize: 13, color: COLORS.faded, marginTop: 2 }}>
            Seeded from {sources.length} {sources.length === 1 ? 'source' : 'sources'} and live fan voting.
          </div>
          {created && (
            <div style={{ fontFamily: MONO, fontSize: 11, color: COLORS.faded, marginTop: 4 }}>
              {fmtDate(created)}
            </div>
          )}
        </section>

        {/* 2. Sources + dates */}
        {sources.length > 0 && (
          <section style={{ position: 'relative', marginBottom: 26 }}>
            <Dot color={COLORS.forest} />
            <Kicker icon={<BookMarked size={12} strokeWidth={2.5} />}>Sources</Kicker>
            <div style={{ fontFamily: SERIF, fontSize: 16, marginTop: 3 }}>
              {sources.length} {sources.length === 1 ? 'source' : 'sources'} on file
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
              {sources.map((s, i) => (
                <div key={i} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ flex: 1 }}>
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
                    {s.unordered && (
                      <span style={{ fontSize: 11, color: COLORS.faded, marginLeft: 6 }}>unordered</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. Re-research / consensus changes */}
        {feed.research.length > 0 && (
          <section style={{ position: 'relative', marginBottom: 26 }}>
            <Dot color={COLORS.ember} />
            <Kicker icon={<RefreshCw size={12} strokeWidth={2.5} />}>Re-researched</Kicker>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {feed.research.map((ev, i) => {
                const { item, tail } = researchLabel(ev);
                return (
                  <div key={i}>
                    <div style={{ fontSize: 13, color: COLORS.ink }}>
                      <strong style={{ fontWeight: 500, color: COLORS.forest }}>{item}</strong> {tail}.
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 11, color: COLORS.faded, marginTop: 2 }}>
                      {fmtDate(ev.detectedAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. Live votes */}
        <section style={{ position: 'relative', marginBottom: 26 }}>
          <Dot color={COLORS.rust} />
          <Kicker icon={<BarChart3 size={12} strokeWidth={2.5} />} live>
            Live votes
          </Kicker>
          {feed.votes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {feed.votes.slice(0, 8).map((v, i) => {
                const up = v.delta >= 0;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    {up ? (
                      <ArrowUp size={14} strokeWidth={2.5} color={COLORS.forest} />
                    ) : (
                      <ArrowDown size={14} strokeWidth={2.5} color={COLORS.ember} />
                    )}
                    <span>
                      Someone {up ? 'upvoted' : 'downvoted'}{' '}
                      <strong style={{ fontWeight: 500 }}>{v.itemName}</strong>
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

        {/* 5. Manager notes (anonymized) */}
        {feed.manager.length > 0 && (
          <section style={{ position: 'relative', marginBottom: 8 }}>
            <Dot color="#7f77dd" />
            <Kicker icon={<MessageSquare size={12} strokeWidth={2.5} />}>From the suggestion box</Kicker>
            <div style={{ fontSize: 12, color: COLORS.faded, marginTop: 2, fontStyle: 'italic' }}>
              Notes sent privately to the editors. No names or emails shown.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 9 }}>
              {feed.manager.map((m, i) => (
                <div
                  key={i}
                  style={{
                    background: COLORS.paper,
                    borderLeft: '3px solid #7f77dd',
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
      </div>

      {/* 6. Public comments */}
      <div style={{ borderTop: `2px solid ${COLORS.ink}`, marginTop: 22, paddingTop: 16 }}>
        <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600 }}>Join the conversation</div>
        <div style={{ fontSize: 12, color: COLORS.faded, marginBottom: 12 }}>
          Public comment. Name is optional, posts as "Guest" if left blank.
        </div>

        <div ref={commentsRef} style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
          {feed.comments.length === 0 && loaded && (
            <div style={{ fontSize: 13, color: COLORS.faded }}>No comments yet. Start the conversation.</div>
          )}
          {feed.comments.map((c, i) => {
            const guest = !c.name;
            return (
              <div key={i} style={{ display: 'flex', gap: 10 }}>
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
                <div
                  style={{
                    background: '#fff',
                    border: `1px solid ${COLORS.paper}`,
                    borderRadius: 9,
                    padding: '8px 12px',
                    flex: 1,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name || 'Guest'}</span>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: COLORS.faded }}>
                      {fmtRelative(c.createdAt)}
                    </span>
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
            style={{
              width: '100%',
              boxSizing: 'border-box',
              border: 'none',
              borderBottom: `1px solid ${COLORS.paper}`,
              background: 'transparent',
              fontFamily: SANS,
              fontSize: 13,
              padding: '5px 2px',
              marginBottom: 8,
              outline: 'none',
              color: COLORS.ink,
            }}
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a comment…"
            rows={2}
            maxLength={1000}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              border: 'none',
              background: 'transparent',
              fontFamily: SANS,
              fontSize: 13,
              padding: 2,
              resize: 'vertical',
              outline: 'none',
              color: COLORS.ink,
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
            <button
              onClick={postComment}
              disabled={posting || !body.trim()}
              style={{
                background: COLORS.ember,
                color: '#fff',
                border: 'none',
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: '0.08em',
                padding: '7px 16px',
                borderRadius: 7,
                cursor: posting || !body.trim() ? 'default' : 'pointer',
                opacity: posting || !body.trim() ? 0.5 : 1,
              }}
            >
              {posting ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

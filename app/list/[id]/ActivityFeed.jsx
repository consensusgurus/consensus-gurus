'use client';
import React, { useState, useEffect } from 'react';
import {
  Flag,
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

function Kicker({ icon, children, live, date }) {
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
      {date && <span style={{ opacity: 0.8 }}>· {date}</span>}
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

function TrueExpertBadge() {
  return (
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
      {s.trueExpert && <TrueExpertBadge />}
    </div>
  );
}

// Per-list activity feed: live votes, research (later sources + consensus
// changes), anonymized review requests, public comments, and a List-created
// entry that lists the sources the ranking launched with.
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

  const apiSources = feed.sources || [];
  const clientSources = Object.entries(list.sources || {})
    .filter(([id, s]) => id !== 'ai' && s && s.label)
    .map(([id, s]) => ({ id, label: s.label, trueExpert: Boolean(s.trueExpert), addedAt: list.publishedAt || list.publishedDate || null }));
  const sources = apiSources.length ? apiSources : clientSources;

  // Earliest add-date = the launch batch (shown in "List created"); anything
  // added later surfaces as a bubble under "Research".
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

  const created = list.publishedAt || list.publishedDate;
  const hasResearch = laterSources.length > 0 || feed.research.length > 0;

  return (
    <div style={{ fontFamily: SANS, color: COLORS.ink, maxWidth: 640, paddingBottom: 40 }}>
      <style>{`@keyframes sotpulse{0%,100%{opacity:1}50%{opacity:.25}}`}</style>

      <div style={{ position: 'relative', paddingLeft: 23 }}>
        <div style={{ position: 'absolute', left: 5, top: 6, bottom: 6, width: 2, background: COLORS.paper }} />

        {/* Research: later-added sources + consensus changes, as bubbles */}
        {hasResearch && (
          <section style={{ position: 'relative', marginBottom: 26 }}>
            <Dot color={COLORS.ember} />
            <Kicker icon={<RefreshCw size={12} strokeWidth={2.5} />}>Research</Kicker>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 9 }}>
              {laterSources.map((s, i) => (
                <div key={`ls-${i}`} style={{ background: '#fff', border: `1px solid ${COLORS.paper}`, borderRadius: 7, padding: '8px 11px' }}>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.rust, marginBottom: 4 }}>
                    Source added{s.addedAt ? ` · ${fmtDate(s.addedAt)}` : ''}
                  </div>
                  <div style={{ fontSize: 13, color: COLORS.ink }}>
                    {s.label}
                    {s.trueExpert && <TrueExpertBadge />}
                  </div>
                </div>
              ))}
              {feed.research.map((ev, i) => {
                const { item, tail } = researchLabel(ev);
                return (
                  <div key={`rs-${i}`} style={{ background: '#fff', border: `1px solid ${COLORS.paper}`, borderRadius: 7, padding: '8px 11px' }}>
                    <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, marginBottom: 4 }}>
                      Consensus update{ev.detectedAt ? ` · ${fmtDate(ev.detectedAt)}` : ''}
                    </div>
                    <div style={{ fontSize: 13, color: COLORS.ink }}>
                      <strong style={{ fontWeight: 500, color: COLORS.forest }}>{item}</strong> {tail}.
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Live votes */}
        <section style={{ position: 'relative', marginBottom: 26 }}>
          <Dot color={COLORS.forest} />
          <Kicker icon={<BarChart3 size={12} strokeWidth={2.5} />} live>
            Live votes
          </Kicker>
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

        {/* Review requests (anonymized) */}
        {feed.manager.length > 0 && (
          <section style={{ position: 'relative', marginBottom: 26 }}>
            <Dot color={COLORS.faded} />
            <Kicker icon={<MessageSquare size={12} strokeWidth={2.5} />}>Review requests</Kicker>
            <div style={{ fontSize: 12, color: COLORS.faded, marginTop: 2, fontStyle: 'italic' }}>
              Notes sent privately to the editors. No names or emails shown.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 9 }}>
              {feed.manager.map((m, i) => (
                <div
                  key={i}
                  style={{
                    background: COLORS.paper,
                    borderLeft: `3px solid ${COLORS.faded}`,
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

        {/* List created — includes the sources the ranking launched with */}
        <section style={{ position: 'relative' }}>
          <Dot color={COLORS.ink} />
          <Kicker icon={<Flag size={12} strokeWidth={2.5} />} date={created ? fmtDate(created) : undefined}>
            List created
          </Kicker>
          <div style={{ fontFamily: SERIF, fontSize: 16, marginTop: 3 }}>Published the ranking</div>
          <div style={{ fontSize: 13, color: COLORS.faded, marginTop: 2 }}>
            Seeded from {launchSources.length} {launchSources.length === 1 ? 'source' : 'sources'} and live fan voting.
          </div>
          {launchSources.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 9 }}>
              {launchSources.map((s, i) => (
                <SourceCard key={i} s={s} />
              ))}
            </div>
          )}
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

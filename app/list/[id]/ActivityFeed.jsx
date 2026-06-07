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
  PenLine,
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
  // Rows with prev_rank recorded show the exact movement; 0 = unranked
  // (outside the top 10). Ranks shown never exceed 10 by construction.
  if (ev.prevRank !== null && ev.prevRank !== undefined) {
    const from = ev.prevRank > 0 ? `#${ev.prevRank}` : 'unranked';
    const to = ev.rank > 0 ? `#${ev.rank}` : 'unranked';
    return { item, tail: `moved from ${from} to ${to}` };
  }
  // Legacy rows (before prev_rank existed) keep the boundary phrasing.
  if (ev.changeType === 'entered_top3') return { item, tail: `entered the top 3 (#${ev.rank || 3})` };
  if (ev.changeType === 'entered_top10') return { item, tail: 'entered the top 10' };
  if (ev.changeType === 'exited_top3') return { item, tail: 'dropped out of the top 3' };
  if (ev.changeType === 'exited_top10') return { item, tail: 'dropped out of the top 10' };
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
  edit: '#8a3324',     // dark ember - deploy-side list edits
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

function chipStyle(color) {
  return {
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
  };
}

// Up to two category chips side by side: the primary (icon/color/children)
// plus an optional `extra` chip ({ icon, color, label }) for combined events.
function Badge({ icon, color, children, live, date, extra }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={chipStyle(color)}>
        {icon}
        {children}
      </span>
      {extra && (
        <span style={chipStyle(extra.color)}>
          {extra.icon}
          {extra.label}
        </span>
      )}
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
  const [feed, setFeed] = useState({ votes: [], manager: [], research: [], comments: [], sources: [], editorNotes: [], removedSources: [] });
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
        editorNotes: data.editorNotes || [],
        removedSources: data.removedSources || [],
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

  // Launch batch = sources first seen within 6h of the list's publish time
  // (the cron backfills genuinely-at-launch sources to the publish timestamp
  // exactly). Anything later is a dated post-launch addition shown as its own
  // entry. Mirrors the 6h window in app/feed/page.js -- keep the two in sync.
  const LAUNCH_WINDOW_MS = 6 * 3600 * 1000;
  const pubMsRef = Date.parse(list.publishedAt || list.publishedDate || '');
  let launchSources = sources;
  let laterSources = [];
  if (sources.length > 0 && !isNaN(pubMsRef)) {
    const isLaunch = (s) => {
      const t = Date.parse(s.addedAt || '');
      return isNaN(t) || t - pubMsRef < LAUNCH_WINDOW_MS;
    };
    launchSources = sources.filter(isLaunch);
    laterSources = sources.filter((s) => !isLaunch(s)).sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
  }
  const launchDate = launchSources.length ? launchSources[0].addedAt : null;

  const created = list.publishedAt || list.publishedDate;

  // Combine post-launch source additions with the ranking changes they caused:
  // a consensus change detected within ~26h after a source addition (and after
  // no newer addition) is attributed to it and shown in the SAME card. Changes
  // with no nearby source addition (vote-driven) stand on their own.
  const RESEARCH_WINDOW_MS = 26 * 3600 * 1000;
  const sourceGroups = [];
  {
    const byTs = new Map();
    laterSources.forEach((s) => {
      const k = s.addedAt || '';
      if (!byTs.has(k)) byTs.set(k, { addedAt: s.addedAt, ts: new Date(s.addedAt).getTime(), sources: [], changes: [] });
      byTs.get(k).sources.push(s);
    });
    sourceGroups.push(...byTs.values());
  }
  const looseChanges = [];
  (feed.research || []).forEach((ev) => {
    const t = ev.detectedAt ? new Date(ev.detectedAt).getTime() : 0;
    let best = null;
    sourceGroups.forEach((g) => {
      if (g.ts <= t && t - g.ts <= RESEARCH_WINDOW_MS && (!best || g.ts > best.ts)) best = g;
    });
    if (best) best.changes.push(ev);
    else looseChanges.push(ev);
  });
  const topEvents = [];
  sourceGroups.forEach((g) => topEvents.push({ ts: g.ts, type: 'sourceGroup', g }));
  looseChanges.forEach((ev) => topEvents.push({ ts: ev.detectedAt ? new Date(ev.detectedAt).getTime() : 0, type: 'change', ev }));
  topEvents.sort((a, b) => b.ts - a.ts);

  return (
    <div style={{ fontFamily: SANS, color: COLORS.ink, maxWidth: 640, paddingBottom: 40 }}>
      <style>{`@keyframes sotpulse{0%,100%{opacity:1}50%{opacity:.25}}`}</style>

      <div>
        {/* Post-launch source additions + the ranking changes they caused.
            A source add with attached changes renders as one combined
            "Re-researched" card; a vote-driven change with no nearby source
            add stands alone as a "Ranking change" card. */}
        {topEvents.map((te, i) => {
          if (te.type === 'sourceGroup') {
            const g = te.g;
            const hasChanges = g.changes.length > 0;
            return (
              <section key={`te-${i}`} style={cardStyle(hasChanges ? KC.research : KC.source)}>
                <Badge
                  color={KC.source}
                  icon={<BookMarked size={11} strokeWidth={2.5} />}
                  extra={hasChanges ? { icon: <RefreshCw size={11} strokeWidth={2.5} />, color: KC.research, label: 'Ranking change' } : undefined}
                  date={fmtDate(g.addedAt)}
                >
                  {g.sources.length === 1 ? 'Source added' : 'Sources added'}
                </Badge>
                <div style={{ fontFamily: SERIF, fontSize: 16, margin: '6px 0 8px' }}>
                  {hasChanges
                    ? `Added ${g.sources.length === 1 ? 'a source' : g.sources.length + ' sources'}, the ranking shifted`
                    : g.sources.length === 1 ? 'New source on file' : `${g.sources.length} new sources on file`}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {g.sources.map((s, k) => (<SourceCard key={k} s={s} />))}
                </div>
                {hasChanges && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                    {g.changes.map((ev, k) => {
                      const { item, tail } = researchLabel(ev);
                      return (
                        <div key={k} style={{ fontSize: 13, color: COLORS.ink }}>
                          <RefreshCw size={11} strokeWidth={2.5} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5, color: KC.research }} />
                          <strong style={{ fontWeight: 500, color: KC.research }}>{item}</strong> {tail}.
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          }
          const ev = te.ev;
          const { item, tail } = researchLabel(ev);
          return (
            <section key={`te-${i}`} style={cardStyle(KC.research)}>
              <Badge
                color={ev.cause === 'edit' ? KC.edit : KC.vote}
                icon={ev.cause === 'edit' ? <PenLine size={11} strokeWidth={2.5} /> : <BarChart3 size={11} strokeWidth={2.5} />}
                extra={{ icon: <RefreshCw size={11} strokeWidth={2.5} />, color: KC.research, label: 'Ranking change' }}
                date={fmtDate(ev.detectedAt)}
              >
                {ev.cause === 'edit' ? 'List edited' : 'Votes'}
              </Badge>
              <div style={{ fontSize: 13, color: COLORS.ink, marginTop: 8 }}>
                <strong style={{ fontWeight: 500, color: KC.research }}>{item}</strong> {tail}.
              </div>
            </section>
          );
        })}

        {/* Editor's notes posted from the admin desk */}
        {feed.editorNotes.length > 0 && (
          <section style={cardStyle(KC.comment)}>
            <Badge color={KC.comment} icon={<PenLine size={11} strokeWidth={2.5} />}>Editor's Note</Badge>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 9 }}>
              {feed.editorNotes.map((n, i) => (
                <div key={i} style={{ background: '#fff', borderLeft: `3px solid ${KC.comment}`, borderRadius: '0 7px 7px 0', padding: '8px 11px', fontSize: 13, whiteSpace: 'pre-wrap' }}>
                  {n.note}
                  <span style={{ display: 'block', fontFamily: MONO, fontSize: 10, color: COLORS.faded, marginTop: 3 }}>
                    Editor · {fmtDate(n.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sources removed from the list */}
        {feed.removedSources.length > 0 && (
          <section style={cardStyle(KC.source)}>
            <Badge color={KC.source} icon={<BookMarked size={11} strokeWidth={2.5} />}>
              {feed.removedSources.length === 1 ? 'Source removed' : 'Sources removed'}
            </Badge>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 9 }}>
              {feed.removedSources.map((s, i) => (
                <div key={i} style={{ background: '#fff', border: `1px solid ${COLORS.paper}`, borderRadius: 7, padding: '7px 11px', fontSize: 13 }}>
                  <span style={{ textDecoration: 'line-through', color: COLORS.faded }}>{s.label}</span>
                  {s.removedAt && (
                    <span style={{ fontFamily: MONO, fontSize: 10, color: COLORS.faded, marginLeft: 8 }}>{fmtDate(s.removedAt)}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Live votes — shown only once at least one vote exists */}
        {feed.votes.length > 0 && (
          <section style={cardStyle(KC.vote)}>
            <Badge color={KC.vote} icon={<BarChart3 size={11} strokeWidth={2.5} />} live>
              Live votes
            </Badge>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {[...feed.votes].sort((a, b) => b.delta - a.delta).slice(0, 8).map((v, i) => {
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
          </section>
        )}

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
                  {m.editorResponse && (
                    <div style={{ marginTop: 5, paddingTop: 5, borderTop: `1px solid ${COLORS.paper}` }}>
                      <strong style={{ fontWeight: 700, color: COLORS.ember }}>Editor:</strong> {m.editorResponse}
                    </div>
                  )}
                  <span style={{ display: 'block', fontFamily: MONO, fontSize: 10, color: COLORS.faded, marginTop: 3 }}>
                    Anonymous · {fmtShort(m.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Publishing of the ranking: list created + the launch sources, one card */}
        <section style={{ ...cardStyle(KC.created), marginBottom: 0 }}>
          <Badge
            color={KC.created}
            icon={<Flag size={11} strokeWidth={2.5} />}
            extra={launchSources.length > 0 ? { icon: <BookMarked size={11} strokeWidth={2.5} />, color: KC.source, label: 'Sources' } : undefined}
            date={created ? fmtDate(created) : undefined}
          >
            List created
          </Badge>
          <div style={{ fontFamily: SERIF, fontSize: 16, marginTop: 6 }}>Published the ranking</div>
          <div style={{ fontSize: 13, color: COLORS.faded, marginTop: 2 }}>Seeded from expert sources and live fan voting.</div>
          {launchSources.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.faded, marginBottom: 6 }}>
                {launchSources.length} {launchSources.length === 1 ? 'source' : 'sources'} at launch
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {launchSources.map((s, i) => (
                  <SourceCard key={i} s={s} />
                ))}
              </div>
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
                  {c.editorResponse && (
                    <div style={{ fontSize: 13, marginTop: 6, paddingTop: 6, borderTop: `1px solid ${COLORS.paper}` }}>
                      <strong style={{ fontWeight: 700, color: COLORS.ember }}>Editor:</strong> {c.editorResponse}
                    </div>
                  )}
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

'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, X, Eye, EyeOff, LogOut, Pencil, Trash2, MapPin } from 'lucide-react';
import { COLORS } from '@/lib/data';
import Grain from '@/app/Grain';

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

// Build a Google Maps "search" URL that resolves to a single place pin.
// Mirrors lib/helpers.js: strip the characters Maps reads as waypoint
// separators so a name like "Lucali (Carroll Gardens)" opens a location,
// not driving directions.
function mapsPlaceUrl(name) {
  const cleaned = String(name || '')
    .replace(/[()]/g, ' ')
    .replace(/[;,]/g, ' ')
    .replace(/&/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleaned)}`;
}

export default function AdminClient({ initialLists, initialExtras = [], initialComplaints = [], initialVoteStandings = [], initialVoteEvents = [], initialComments = [], initialAlerts = [], initialViews24h = [] }) {
  const router = useRouter();
  const [lists, setLists] = useState(initialLists);
  const [extras, setExtras] = useState(initialExtras);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [complaints, setComplaints] = useState(initialComplaints);
  const [voteStandings, setVoteStandings] = useState(initialVoteStandings);
  const [voteEvents, setVoteEvents] = useState(initialVoteEvents);
  const [comments, setComments] = useState(initialComments);
  const [views24h] = useState(initialViews24h);
  const [tab, setTab] = useState('pending');
  const [busy, setBusy] = useState({});

  const filtered = useMemo(() => {
    return lists.filter((l) => (tab === 'pending' ? !l.published : l.published));
  }, [lists, tab]);

  const pendingCount = useMemo(() => lists.filter((l) => !l.published).length, [lists]);
  const publishedCount = useMemo(() => lists.filter((l) => l.published).length, [lists]);
  const extrasCount = useMemo(
    () => extras.reduce((n, g) => n + g.items.length, 0),
    [extras]
  );
  const complaintsCount = complaints.length;
  const commentsCount = comments.length;
  const views24hTotal = useMemo(
    () => views24h.reduce((n, v) => n + (v.views24h || 0), 0),
    [views24h]
  );

  async function deleteComment(id) {
    const key = `cm-${id}`;
    if (busy[key]) return;
    setBusy((b) => ({ ...b, [key]: true }));
    const res = await fetch('/api/admin/comments/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setComments((prev) => prev.filter((c) => c.id !== id));
    else alert('Could not delete. Try again.');
    setBusy((b) => ({ ...b, [key]: false }));
  }

  async function deleteVote(listId, itemName) {
    const key = `v-${listId}::${itemName}`;
    if (busy[key]) return;
    if (!confirm(`Delete all votes for "${itemName}" on ${listId}?`)) return;
    setBusy((b) => ({ ...b, [key]: true }));
    const res = await fetch('/api/admin/votes/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listId, itemName }),
    });
    if (res.ok) {
      setVoteStandings((prev) => prev.filter((s) => !(s.listId === listId && s.itemName === itemName)));
      setVoteEvents((prev) => prev.filter((e) => !(e.listId === listId && e.itemName === itemName)));
    } else alert('Could not delete votes. Try again.');
    setBusy((b) => ({ ...b, [key]: false }));
  }

  async function dismissComplaint(id) {
    const key = `c-${id}`;
    if (busy[key]) return;
    setBusy((b) => ({ ...b, [key]: true }));
    const res = await fetch('/api/admin/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setComplaints((prev) => prev.filter((c) => c.id !== id));
    } else {
      alert('Could not dismiss. Try again.');
    }
    setBusy((b) => ({ ...b, [key]: false }));
  }

  async function doAction(id, endpoint, optimistic) {
    if (busy[id]) return;
    setBusy((b) => ({ ...b, [id]: true }));
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setLists((prev) => optimistic(prev));
    } else {
      alert('That action failed. Please try again.');
    }
    setBusy((b) => ({ ...b, [id]: false }));
  }

  function approve(id) {
    doAction(id, '/api/admin/approve', (prev) =>
      prev.map((l) => (l.id === id ? { ...l, published: true } : l))
    );
  }
  function unpublish(id) {
    doAction(id, '/api/admin/unpublish', (prev) =>
      prev.map((l) => (l.id === id ? { ...l, published: false } : l))
    );
  }
  function reject(id) {
    if (!confirm('Delete this submission? This cannot be undone.')) return;
    doAction(id, '/api/admin/reject', (prev) => prev.filter((l) => l.id !== id));
  }

  // ----- Extras (user-submitted items inside curated lists) -----

  async function renameExtra(listId, oldName, newName) {
    const key = `extra:${listId}:${oldName}`;
    if (busy[key]) return false;
    const trimmed = (newName || '').trim();
    if (!trimmed) return false;
    if (trimmed === oldName) return true;

    setBusy((b) => ({ ...b, [key]: true }));
    const res = await fetch('/api/admin/extras/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listId, oldName, newName: trimmed }),
    });
    setBusy((b) => ({ ...b, [key]: false }));

    if (!res.ok) {
      alert('Rename failed. Please try again.');
      return false;
    }

    // Update local state — merge if the new name already exists in the same list.
    setExtras((prev) =>
      prev
        .map((group) => {
          if (group.listId !== listId) return group;
          const oldItem = group.items.find((i) => i.name === oldName);
          const existing = group.items.find((i) => i.name === trimmed);
          let items;
          if (existing) {
            items = group.items
              .filter((i) => i.name !== oldName)
              .map((i) =>
                i.name === trimmed
                  ? { ...i, score: (i.score || 0) + (oldItem?.score || 0) }
                  : i
              );
          } else {
            items = group.items.map((i) =>
              i.name === oldName ? { ...i, name: trimmed } : i
            );
          }
          return { ...group, items };
        })
        .filter((g) => g.items.length > 0)
    );
    return true;
  }

  async function deleteExtra(listId, itemName) {
    if (!confirm(`Delete user-submitted item "${itemName}" from ${listId}? This also clears its votes.`)) {
      return;
    }
    const key = `extra:${listId}:${itemName}`;
    if (busy[key]) return;
    setBusy((b) => ({ ...b, [key]: true }));
    const res = await fetch('/api/admin/extras/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listId, itemName }),
    });
    setBusy((b) => ({ ...b, [key]: false }));

    if (!res.ok) {
      alert('Delete failed. Please try again.');
      return;
    }

    setExtras((prev) =>
      prev
        .map((group) =>
          group.listId === listId
            ? { ...group, items: group.items.filter((i) => i.name !== itemName) }
            : group
        )
        .filter((g) => g.items.length > 0)
    );
  }

  async function resolveAlert(id) {
    const key = `alert-${id}`;
    if (busy[key]) return;
    setBusy((b) => ({ ...b, [key]: true }));
    const res = await fetch('/api/admin/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } else {
      alert('Could not resolve. Try again.');
    }
    setBusy((b) => ({ ...b, [key]: false }));
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.cream,
        color: COLORS.ink,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Grain />
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 900,
          margin: '0 auto',
          padding: '32px 20px 80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: 11,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: COLORS.ember,
                marginBottom: 8,
              }}
            >
              Editorial
            </div>
            <h1
              style={{
                fontFamily: 'Fraunces, serif',
                fontWeight: 900,
                fontSize: 'clamp(36px, 8vw, 64px)',
                lineHeight: 0.92,
                letterSpacing: '-0.03em',
                margin: 0,
                color: COLORS.ink,
                fontVariationSettings: '"SOFT" 100',
              }}
            >
              Editor's
              <span style={{ fontStyle: 'italic', color: COLORS.ember }}> desk</span>
            </h1>
          </div>
          <button
            onClick={logout}
            style={{
              background: 'transparent',
              color: COLORS.ink,
              border: `1.5px solid ${COLORS.ink}`,
              padding: '8px 14px',
              fontFamily: 'DM Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <LogOut size={12} strokeWidth={2.5} />
            Sign out
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            marginBottom: 28,
            border: `1.5px solid ${COLORS.ink}`,
          }}
        >
          <TabButton active={tab === 'pending'} onClick={() => setTab('pending')}>
            Pending <span style={{ opacity: 0.6 }}>{pendingCount}</span>
          </TabButton>
          <TabButton active={tab === 'published'} onClick={() => setTab('published')}>
            Published <span style={{ opacity: 0.6 }}>{publishedCount}</span>
          </TabButton>
          <TabButton active={tab === 'extras'} onClick={() => setTab('extras')}>
            By the people <span style={{ opacity: 0.6 }}>{extrasCount}</span>
          </TabButton>
          <TabButton active={tab === 'complaints'} onClick={() => setTab('complaints')}>
            Notices <span style={{ opacity: 0.6 }}>{complaintsCount}</span>
          </TabButton>
          <TabButton active={tab === 'votes'} onClick={() => setTab('votes')}>
            Votes <span style={{ opacity: 0.6 }}>{voteStandings.length}</span>
          </TabButton>
          <TabButton active={tab === 'comments'} onClick={() => setTab('comments')}>
            Comments <span style={{ opacity: 0.6 }}>{commentsCount}</span>
          </TabButton>
          <TabButton active={tab === 'research'} onClick={() => setTab('research')}>
            Research <span style={{ opacity: 0.6 }}>{alerts.length}</span>
          </TabButton>
          <TabButton active={tab === 'views'} onClick={() => setTab('views')}>
            Views <span style={{ opacity: 0.6 }}>{views24hTotal}</span>
          </TabButton>
        </div>

        {tab === 'views' ? (
          <ViewsPanel views={views24h} total={views24hTotal} />
        ) : tab === 'research' ? (
          <ResearchPanel alerts={alerts} busy={busy} onResolve={resolveAlert} />
        ) : tab === 'comments' ? (
          <CommentsPanel comments={comments} busy={busy} onDelete={deleteComment} />
        ) : tab === 'votes' ? (
          <VotesPanel standings={voteStandings} events={voteEvents} busy={busy} onDelete={deleteVote} />
        ) : tab === 'complaints' ? (
          <ComplaintsPanel complaints={complaints} busy={busy} onDismiss={dismissComplaint} />
        ) : tab === 'extras' ? (
          <ExtrasPanel
            extras={extras}
            busy={busy}
            onRename={renameExtra}
            onDelete={deleteExtra}
          />
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              fontFamily: 'Fraunces, serif',
              fontStyle: 'italic',
              fontSize: 18,
              color: COLORS.faded,
              border: `1.5px dashed ${COLORS.ink}`,
            }}
          >
            {tab === 'pending'
              ? 'No submissions waiting for review.'
              : 'No published reader submissions yet.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map((list) => (
              <SubmissionCard
                key={list.id}
                list={list}
                busy={!!busy[list.id]}
                onApprove={() => approve(list.id)}
                onUnpublish={() => unpublish(list.id)}
                onReject={() => reject(list.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Views panel: per-list visitor counts over the rolling past 24 hours.
function ViewsPanel({ views, total }) {
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return views;
    return views.filter(
      (v) => v.title.toLowerCase().includes(q) || v.listId.toLowerCase().includes(q)
    );
  }, [views, query]);

  if (!views || views.length === 0) {
    return (
      <div
        style={{
          padding: '60px 20px',
          textAlign: 'center',
          fontFamily: 'Fraunces, serif',
          fontStyle: 'italic',
          fontSize: 18,
          color: COLORS.faded,
          border: `1.5px dashed ${COLORS.ink}`,
        }}
      >
        No view data yet.
      </div>
    );
  }

  const rowBorder = `1px solid ${COLORS.ink}22`;
  const activeLists = views.filter((v) => v.views24h > 0).length;

  return (
    <div>
      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: COLORS.faded, margin: '0 0 14px' }}>
        Visitor counts per list page over the rolling past 24 hours, busiest first.
        {' '}{total} view{total === 1 ? '' : 's'} across {activeLists} list{activeLists === 1 ? '' : 's'}.
        All-time totals shown for context.
      </p>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter by list title or id…"
        style={{
          width: '100%',
          padding: '10px 12px',
          background: COLORS.paper,
          border: `1.5px solid ${COLORS.ink}`,
          color: COLORS.ink,
          fontFamily: 'DM Mono, monospace',
          fontSize: 12,
          outline: 'none',
          marginBottom: 16,
          boxSizing: 'border-box',
        }}
      />
      {visible.length === 0 ? (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            fontFamily: 'Fraunces, serif',
            fontStyle: 'italic',
            fontSize: 16,
            color: COLORS.faded,
            border: `1.5px dashed ${COLORS.ink}`,
          }}
        >
          No matches.
        </div>
      ) : (
        <div style={{ border: `1.5px solid ${COLORS.ink}` }}>
          <div style={{ display: 'flex', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.faded, padding: '10px 14px', borderBottom: `1.5px solid ${COLORS.ink}` }}>
            <span style={{ flex: '0 0 36px' }}>#</span>
            <span style={{ flex: 3 }}>List</span>
            <span style={{ flex: '0 0 100px', textAlign: 'right' }}>Last 24h</span>
            <span style={{ flex: '0 0 100px', textAlign: 'right' }}>All time</span>
          </div>
          {visible.map((v, i) => (
            <div
              key={v.listId}
              style={{ display: 'flex', alignItems: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: COLORS.ink, padding: '9px 14px', borderBottom: i < visible.length - 1 ? rowBorder : 'none', opacity: v.views24h > 0 ? 1 : 0.55 }}
            >
              <span style={{ flex: '0 0 36px', fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded }}>
                {i + 1}
              </span>
              <span style={{ flex: 3, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <Link href={`/list/${encodeURIComponent(v.listId)}`} target="_blank" style={{ color: COLORS.ink, textDecoration: 'none' }}>
                  {v.title}
                </Link>
              </span>
              <span style={{ flex: '0 0 100px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontWeight: 700, color: v.views24h > 0 ? COLORS.ember : COLORS.faded }}>
                {v.views24h}
              </span>
              <span style={{ flex: '0 0 100px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded }}>
                {v.viewsTotal}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResearchPanel({ alerts, busy, onResolve }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div
        style={{
          padding: '60px 20px',
          textAlign: 'center',
          fontFamily: 'Fraunces, serif',
          fontStyle: 'italic',
          fontSize: 18,
          color: COLORS.faded,
          border: `1.5px dashed ${COLORS.ink}`,
        }}
      >
        No consensus changes awaiting research.
      </div>
    );
  }
  const rowBorder = `1px solid ${COLORS.ink}22`;
  return (
    <div>
      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: COLORS.faded, margin: '0 0 14px' }}>
        Items that newly entered a list's consensus top 10 (needs a description) or
        top 3 (needs a hero photo). Resolve once the research has shipped.
      </p>
      <div style={{ border: `1.5px solid ${COLORS.ink}` }}>
        <div style={{ display: 'flex', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.faded, padding: '10px 14px', borderBottom: `1.5px solid ${COLORS.ink}` }}>
          <span style={{ flex: 2 }}>List</span>
          <span style={{ flex: 2 }}>Item</span>
          <span style={{ flex: '0 0 110px' }}>Change</span>
          <span style={{ flex: '0 0 130px' }}>Needs</span>
          <span style={{ flex: '0 0 110px', textAlign: 'right' }}>Detected</span>
          <span style={{ flex: '0 0 80px' }} />
        </div>
        {alerts.map((a, i) => {
          const needs = [];
          if (a.changeType === 'entered_top10' && !a.hasDescription) needs.push('Description');
          if (a.changeType === 'entered_top3' && !a.hasHeroImage) needs.push('Hero photo');
          return (
            <div
              key={a.id}
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: COLORS.ink, padding: '9px 14px', borderBottom: i < alerts.length - 1 ? rowBorder : 'none' }}
            >
              <span style={{ flex: 2 }}>
                <Link href={`/list/${encodeURIComponent(a.listId)}`} style={{ color: COLORS.ink }}>
                  {a.listTitle}
                </Link>
              </span>
              <span style={{ flex: 2, fontWeight: 600 }}>
                {a.itemName}
                {a.rank ? <span style={{ color: COLORS.faded, fontWeight: 400 }}> · #{a.rank}</span> : null}
              </span>
              <span style={{ flex: '0 0 110px', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: a.changeType === 'entered_top3' ? COLORS.ember : COLORS.faded }}>
                {a.changeType === 'entered_top3' ? 'Into top 3' : 'Into top 10'}
              </span>
              <span style={{ flex: '0 0 130px', fontSize: 12, color: needs.length ? COLORS.ember : COLORS.faded }}>
                {needs.length ? needs.join(' + ') : 'Done, just resolve'}
              </span>
              <span style={{ flex: '0 0 110px', textAlign: 'right', fontSize: 11, color: COLORS.faded }}>
                {formatDate(a.detectedAt)}
              </span>
              <span style={{ flex: '0 0 80px', textAlign: 'right' }}>
                <button
                  onClick={() => onResolve(a.id)}
                  disabled={!!busy[`alert-${a.id}`]}
                  style={{
                    background: 'transparent',
                    color: COLORS.ink,
                    border: `1.5px solid ${COLORS.ink}`,
                    padding: '5px 10px',
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 9,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Resolve
                </button>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={{ background: COLORS.paper, borderRadius: 8, padding: '12px 18px', minWidth: 120 }}>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>{label}</div>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: COLORS.ink, lineHeight: 1.1, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function VotesPanel({ standings, events, busy, onDelete }) {
  const hasStandings = standings && standings.length > 0;
  const hasEvents = events && events.length > 0;
  const rowBorder = `1px solid ${COLORS.ink}22`;
  const totalVotes = (standings || []).reduce((n, s) => n + (Number(s.votes) || 0), 0);
  const netPoints = (standings || []).reduce((n, s) => n + (Number(s.score) || 0), 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Metric label="Total votes" value={totalVotes.toLocaleString()} />
        <Metric label="Net points" value={netPoints >= 0 ? `+${netPoints.toLocaleString()}` : netPoints.toLocaleString()} />
        <Metric label="Items with votes" value={(standings || []).length.toLocaleString()} />
      </div>
      <div>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 20, margin: '0 0 12px' }}>Current standings</h3>
        {hasStandings ? (
          <div style={{ border: `1.5px solid ${COLORS.ink}` }}>
            <div style={{ display: 'flex', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.faded, padding: '10px 14px', borderBottom: `1.5px solid ${COLORS.ink}` }}>
              <span style={{ flex: 2 }}>List</span>
              <span style={{ flex: 2 }}>Item</span>
              <span style={{ flex: '0 0 60px', textAlign: 'right' }}>Votes</span>
              <span style={{ flex: '0 0 60px', textAlign: 'right' }}>Net</span>
              <span style={{ flex: '0 0 120px', textAlign: 'right' }}>Updated</span>
              <span style={{ flex: '0 0 70px' }} />
            </div>
            {standings.map((s, i) => {
              const bkey = `v-${s.listId}::${s.itemName}`;
              return (
                <div key={`${s.listId}::${s.itemName}::${i}`} style={{ display: 'flex', alignItems: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: COLORS.ink, padding: '9px 14px', borderBottom: i < standings.length - 1 ? rowBorder : 'none' }}>
                  <span style={{ flex: 2, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Link href={`/list/${s.listId}`} style={{ color: COLORS.ember, textDecoration: 'none' }}>{s.listId}</Link>
                  </span>
                  <span style={{ flex: 2, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.itemName}</span>
                  <span style={{ flex: '0 0 60px', textAlign: 'right', fontFamily: 'DM Mono, monospace', color: COLORS.faded }}>{Number(s.votes) || 0}</span>
                  <span style={{ flex: '0 0 60px', textAlign: 'right', fontWeight: 700, fontFamily: 'DM Mono, monospace', color: s.score >= 0 ? COLORS.forest : COLORS.ember }}>{s.score >= 0 ? `+${s.score}` : s.score}</span>
                  <span style={{ flex: '0 0 120px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded }}>{s.updatedAt ? formatDate(s.updatedAt) : '—'}</span>
                  <span style={{ flex: '0 0 70px', textAlign: 'right' }}>
                    <button
                      onClick={() => onDelete && onDelete(s.listId, s.itemName)}
                      disabled={busy && busy[bkey]}
                      style={{ cursor: 'pointer', background: 'transparent', color: COLORS.ember, border: `1px solid ${COLORS.ember}`, padding: '4px 10px', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: busy && busy[bkey] ? 0.5 : 1 }}
                    >
                      Delete
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontStyle: 'italic', fontSize: 14, color: COLORS.faded }}>No votes recorded yet.</p>
        )}
      </div>
      <div>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 20, margin: '0 0 4px' }}>Recent vote log</h3>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: COLORS.faded, margin: '0 0 12px' }}>
          The {events.length} most recent vote events. A vote for 1st place is +3, 2nd is +2, 3rd is +1.
        </p>
        {hasEvents ? (
          <div style={{ border: `1.5px solid ${COLORS.ink}` }}>
            {events.map((e, i) => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: COLORS.ink, padding: '9px 14px', borderBottom: i < events.length - 1 ? rowBorder : 'none' }}>
                <span style={{ flex: '0 0 150px', fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded }}>{formatDate(e.createdAt)}</span>
                <span style={{ flex: '0 0 70px', fontWeight: 700, fontFamily: 'DM Mono, monospace', color: e.delta >= 0 ? COLORS.forest : COLORS.ember }}>{e.delta === 3 ? '1st' : e.delta === 2 ? '2nd' : e.delta === 1 ? '3rd' : e.delta > 0 ? `+${e.delta}` : e.delta}</span>
                <span style={{ flex: 2, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.itemName}</span>
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Link href={`/list/${e.listId}`} style={{ color: COLORS.ember, textDecoration: 'none' }}>{e.listId}</Link>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontStyle: 'italic', fontSize: 14, color: COLORS.faded }}>No vote events logged yet.</p>
        )}
      </div>
    </div>
  );
}

function CommentsPanel({ comments, busy, onDelete }) {
  if (!comments || comments.length === 0) {
    return <p style={{ fontFamily: 'DM Sans, sans-serif', fontStyle: 'italic', fontSize: 14, color: COLORS.faded }}>No public comments yet.</p>;
  }
  const rowBorder = `1px solid ${COLORS.ink}22`;
  return (
    <div style={{ border: `1.5px solid ${COLORS.ink}` }}>
      {comments.map((c, i) => {
        const bkey = `cm-${c.id}`;
        return (
          <div key={c.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px', borderBottom: i < comments.length - 1 ? rowBorder : 'none' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded }}>
                <Link href={`/list/${c.listId}`} style={{ color: COLORS.ember, textDecoration: 'none' }}>{c.listId}</Link>
                {' · '}{c.name || 'Guest'}{' · '}{formatDate(c.createdAt)}
              </div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: COLORS.ink, marginTop: 4, whiteSpace: 'pre-wrap' }}>{c.body}</div>
            </div>
            <button
              onClick={() => onDelete && onDelete(c.id)}
              disabled={busy && busy[bkey]}
              style={{ flexShrink: 0, cursor: 'pointer', background: 'transparent', color: COLORS.ember, border: `1px solid ${COLORS.ember}`, padding: '5px 12px', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: busy && busy[bkey] ? 0.5 : 1 }}
            >
              Delete
            </button>
          </div>
        );
      })}
    </div>
  );
}

function ComplaintsPanel({ complaints, busy, onDismiss }) {
  if (!complaints || complaints.length === 0) {
    return (
      <div
        style={{
          padding: '60px 20px',
          textAlign: 'center',
          fontFamily: 'Fraunces, serif',
          fontStyle: 'italic',
          fontSize: 18,
          color: COLORS.faded,
          border: `1.5px dashed ${COLORS.ink}`,
        }}
      >
        No reader notices right now.
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {complaints.map((c) => (
        <div key={c.id} style={{ border: `1.5px solid ${COLORS.ink}`, padding: 18, background: COLORS.paper }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: COLORS.faded, marginBottom: 4 }}>
                {formatDate(c.createdAt)}
              </div>
              <Link href={`/list/${c.listId}`} style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 18, color: COLORS.ink, textDecoration: 'none' }}>
                {c.listTitle || c.listId}
              </Link>
              {c.message ? (
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: COLORS.ink, margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>{c.message}</p>
              ) : (
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontStyle: 'italic', fontSize: 14, color: COLORS.faded, margin: '8px 0 0' }}>
                  Requested new research (no message left).
                </p>
              )}
              {(c.name || c.email) && (
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: COLORS.faded, margin: '10px 0 0' }}>
                  {c.name ? c.name : 'Anonymous'}
                  {c.email ? (
                    <> &middot; <a href={`mailto:${c.email}`} style={{ color: COLORS.rust, textDecoration: 'none' }}>{c.email}</a></>
                  ) : null}
                </p>
              )}
            </div>
            <button
              onClick={() => onDismiss(c.id)}
              disabled={!!busy[`c-${c.id}`]}
              style={{
                flexShrink: 0,
                cursor: 'pointer',
                background: 'transparent',
                border: `1.5px solid ${COLORS.ink}`,
                color: COLORS.ink,
                padding: '8px 14px',
                fontFamily: 'DM Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        background: active ? COLORS.ink : 'transparent',
        color: active ? COLORS.cream : COLORS.ink,
        border: 'none',
        padding: '14px 12px',
        fontFamily: 'DM Mono, monospace',
        fontSize: 11,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function SubmissionCard({ list, busy, onApprove, onUnpublish, onReject }) {
  return (
    <div
      style={{
        background: COLORS.paper,
        border: `1.5px solid ${COLORS.ink}`,
        padding: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          marginBottom: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 240 }}>
          <div
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: COLORS.faded,
              marginBottom: 6,
            }}
          >
            {list.category || 'Untagged'} · {list.type || 'other'} · {formatDate(list.submittedAt)}
          </div>
          <h3
            style={{
              fontFamily: 'Fraunces, serif',
              fontWeight: 700,
              fontSize: 24,
              lineHeight: 1.1,
              margin: '0 0 8px',
              color: COLORS.ink,
              fontVariationSettings: '"SOFT" 100',
              letterSpacing: '-0.01em',
            }}
          >
            {list.title}
          </h3>
          <p
            style={{
              fontFamily: 'Fraunces, serif',
              fontStyle: 'italic',
              fontSize: 15,
              color: COLORS.faded,
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {list.blurb}
          </p>
        </div>
        {list.published && (
          <Link
            href={`/list/${encodeURIComponent(list.id)}`}
            target="_blank"
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: COLORS.ink,
              border: `1.5px solid ${COLORS.ink}`,
              padding: '6px 10px',
              textDecoration: 'none',
            }}
          >
            View →
          </Link>
        )}
      </div>

      <details>
        <summary
          style={{
            cursor: 'pointer',
            fontFamily: 'DM Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: COLORS.faded,
            padding: '6px 0',
            userSelect: 'none',
          }}
        >
          Show {list.items.length} items
        </summary>
        <ol
          style={{
            margin: '10px 0 0 18px',
            padding: 0,
            fontFamily: 'Fraunces, serif',
            fontSize: 16,
            color: COLORS.ink,
            lineHeight: 1.6,
          }}
        >
          {list.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      </details>

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 16,
          paddingTop: 16,
          borderTop: `1px solid ${COLORS.ink}`,
          flexWrap: 'wrap',
        }}
      >
        {!list.published ? (
          <button
            onClick={onApprove}
            disabled={busy}
            style={{
              background: COLORS.forest,
              color: COLORS.cream,
              border: `1.5px solid ${COLORS.ink}`,
              padding: '10px 16px',
              fontFamily: 'DM Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 600,
              cursor: busy ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: busy ? 0.5 : 1,
            }}
          >
            <Check size={12} strokeWidth={3} />
            Publish
          </button>
        ) : (
          <button
            onClick={onUnpublish}
            disabled={busy}
            style={{
              background: 'transparent',
              color: COLORS.ink,
              border: `1.5px solid ${COLORS.ink}`,
              padding: '10px 16px',
              fontFamily: 'DM Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 600,
              cursor: busy ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: busy ? 0.5 : 1,
            }}
          >
            <EyeOff size={12} strokeWidth={2.5} />
            Unpublish
          </button>
        )}
        <button
          onClick={onReject}
          disabled={busy}
          style={{
            background: 'transparent',
            color: COLORS.ember,
            border: `1.5px solid ${COLORS.ember}`,
            padding: '10px 16px',
            fontFamily: 'DM Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 600,
            cursor: busy ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            opacity: busy ? 0.5 : 1,
          }}
        >
          <X size={12} strokeWidth={3} />
          Delete
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Extras panel — user-submitted items inside curated lists
// ============================================================================

function ExtrasPanel({ extras, busy, onRename, onDelete }) {
  const [query, setQuery] = useState('');

  const visibleGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return extras;
    return extras
      .map((group) => {
        if (group.listId.toLowerCase().includes(q)) return group;
        const items = group.items.filter((i) => i.name.toLowerCase().includes(q));
        return items.length ? { ...group, items } : null;
      })
      .filter(Boolean);
  }, [extras, query]);

  if (extras.length === 0) {
    return (
      <div
        style={{
          padding: '60px 20px',
          textAlign: 'center',
          fontFamily: 'Fraunces, serif',
          fontStyle: 'italic',
          fontSize: 18,
          color: COLORS.faded,
          border: `1.5px dashed ${COLORS.ink}`,
        }}
      >
        No reader-submitted items yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter by list id or item name…"
        style={{
          width: '100%',
          padding: '10px 12px',
          background: COLORS.paper,
          border: `1.5px solid ${COLORS.ink}`,
          color: COLORS.ink,
          fontFamily: 'DM Mono, monospace',
          fontSize: 12,
          outline: 'none',
        }}
      />

      {visibleGroups.length === 0 ? (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            fontFamily: 'Fraunces, serif',
            fontStyle: 'italic',
            fontSize: 16,
            color: COLORS.faded,
            border: `1.5px dashed ${COLORS.ink}`,
          }}
        >
          No matches.
        </div>
      ) : (
        visibleGroups.map((group) => (
          <ExtrasGroup
            key={group.listId}
            group={group}
            busy={busy}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
}

function ExtrasGroup({ group, busy, onRename, onDelete }) {
  return (
    <div
      style={{
        background: COLORS.paper,
        border: `1.5px solid ${COLORS.ink}`,
        padding: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: COLORS.faded,
              marginBottom: 4,
            }}
          >
            List
          </div>
          <h3
            style={{
              fontFamily: 'Fraunces, serif',
              fontWeight: 700,
              fontSize: 22,
              lineHeight: 1.1,
              margin: 0,
              color: COLORS.ink,
              letterSpacing: '-0.01em',
            }}
          >
            {group.listId}
          </h3>
        </div>
        <Link
          href={`/list/${encodeURIComponent(group.listId)}`}
          target="_blank"
          style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: COLORS.ink,
            border: `1.5px solid ${COLORS.ink}`,
            padding: '6px 10px',
            textDecoration: 'none',
          }}
        >
          View →
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {group.items.map((item) => (
          <ExtraRow
            key={item.name}
            listId={group.listId}
            item={item}
            busy={!!busy[`extra:${group.listId}:${item.name}`]}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

function ExtraRow({ listId, item, busy, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.name);

  async function commit() {
    const ok = await onRename(listId, item.name, draft);
    if (ok) setEditing(false);
  }

  function cancel() {
    setDraft(item.name);
    setEditing(false);
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        background: COLORS.cream,
        border: `1px solid ${COLORS.ink}`,
        flexWrap: 'wrap',
      }}
    >
      <div
        style={{
          minWidth: 44,
          fontFamily: 'DM Mono, monospace',
          fontSize: 11,
          letterSpacing: '0.1em',
          color: item.score >= 0 ? COLORS.forest : COLORS.ember,
          fontWeight: 700,
        }}
      >
        {item.score > 0 ? `+${item.score}` : item.score}
      </div>

      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') cancel();
          }}
          maxLength={100}
          style={{
            flex: 1,
            minWidth: 200,
            padding: '6px 8px',
            border: `1.5px solid ${COLORS.ink}`,
            background: COLORS.paper,
            color: COLORS.ink,
            fontFamily: 'Fraunces, serif',
            fontSize: 16,
            outline: 'none',
          }}
        />
      ) : (
        <div
          style={{
            flex: 1,
            minWidth: 200,
            fontFamily: 'Fraunces, serif',
            fontSize: 16,
            color: COLORS.ink,
          }}
        >
          {item.name}
        </div>
      )}

      {editing ? (
        <>
          <button
            onClick={commit}
            disabled={busy}
            style={iconButton(COLORS.forest, COLORS.cream, busy)}
            title="Save"
          >
            <Check size={12} strokeWidth={3} />
            Save
          </button>
          <button
            onClick={cancel}
            disabled={busy}
            style={iconButton('transparent', COLORS.ink, busy, COLORS.ink)}
            title="Cancel"
          >
            <X size={12} strokeWidth={3} />
            Cancel
          </button>
        </>
      ) : (
        <>
          <a
            href={mapsPlaceUrl(item.name)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...iconButton('transparent', COLORS.ink, false, COLORS.ink), textDecoration: 'none' }}
            title="View place on Google Maps"
          >
            <MapPin size={12} strokeWidth={2.5} />
            Map
          </a>
          <button
            onClick={() => setEditing(true)}
            disabled={busy}
            style={iconButton('transparent', COLORS.ink, busy, COLORS.ink)}
            title="Rename"
          >
            <Pencil size={12} strokeWidth={2.5} />
            Rename
          </button>
          <button
            onClick={() => onDelete(listId, item.name)}
            disabled={busy}
            style={iconButton('transparent', COLORS.ember, busy, COLORS.ember)}
            title="Delete"
          >
            <Trash2 size={12} strokeWidth={2.5} />
            Delete
          </button>
        </>
      )}
    </div>
  );
}

function iconButton(bg, color, busy, border) {
  return {
    background: bg,
    color,
    border: `1.5px solid ${border || color}`,
    padding: '6px 10px',
    fontFamily: 'DM Mono, monospace',
    fontSize: 10,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    fontWeight: 600,
    cursor: busy ? 'wait' : 'pointer',
    opacity: busy ? 0.5 : 1,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };
}

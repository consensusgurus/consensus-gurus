'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, X, Eye, EyeOff, LogOut, Pencil, Trash2, MapPin } from 'lucide-react';
import { LISTS } from '@/lib/data';
import Grain from '@/app/Grain';

// Local theme palette: the live-site look (Manrope + soft blue) applied to the
// admin desk. Shadows the magazine COLORS from lib/data so the public site is
// untouched; same keys the admin uses, remapped to the new theme.
const COLORS = {
  cream: '#f7f8fa',
  paper: '#ffffff',
  ink: '#1c1e24',
  faded: '#6b7280',
  ember: '#2563eb',
  forest: '#10b981',
  rust: '#b45309',
  line: 'rgba(20,22,28,0.09)',
};

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

// Seconds -> m:ss, for a quiz play's elapsed time.
function formatClock(secs) {
  const s = Number(secs);
  if (!Number.isFinite(s) || s < 0) return '—';
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

// Calendar-day key (local time) for a play timestamp. Distinct days played is
// the simplest robust proxy for "separate sessions" without per-session
// tracking: two games on the same day count as one session, games on different
// days count separately.
function dayKey(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toDateString();
  } catch {
    return String(iso);
  }
}

// Short date (no time) for the "last session" column.
function formatDay(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

// Compact date + time for the "last session" column, so same-day sessions are
// distinguishable and the time-based sort is visibly correct: "Jun 15, 2:23 PM".
function formatDayTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch {
    return iso;
  }
}

// Compact M/D/YY date for the analytics tables, where horizontal room is tight.
function fmtShort(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(-2)}`;
  } catch {
    return iso;
  }
}

// Compact M/D/YY + time-of-day, for the "last played" columns where the time of
// day matters (two sessions on the same day are distinguishable). e.g.
// "6/15/26 2:23 PM".
function fmtShortDateTime(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const date = `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(-2)}`;
    const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    return `${date} ${time}`;
  } catch {
    return iso;
  }
}

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Seconds -> "1m 23s" / "45s", for the avg-time-per-game stat.
function fmtDuration(secs) {
  const s = Number(secs);
  if (!Number.isFinite(s) || s < 0) return '—';
  const m = Math.floor(s / 60);
  const r = Math.round(s % 60);
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}

// 0-23 hour -> "8 PM".
function fmtHour(h) {
  if (h == null) return '—';
  const ap = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12} ${ap}`;
}

// A timestamp rendered in a given IANA timezone (the player's), so "last played"
// can be shown in THEIR local time, not just the admin's. Falls back to the
// admin-local compact format when no timezone is known.
function fmtLocalTime(iso, tz) {
  if (!iso) return '—';
  try {
    const opts = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
    if (tz) opts.timeZone = tz;
    return new Date(iso).toLocaleString(undefined, opts);
  } catch {
    return fmtShortDateTime(iso);
  }
}

// One labeled stat in the expanded player summary grid.
function Stat({ label, value }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded }}>{label}</div>
      <div style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 14, fontWeight: 700, color: COLORS.ink, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
    </div>
  );
}

// The per-player stat grid shown at the top of an expanded row: engagement,
// tenure, behavioral, and the full device/OS/browser/geo/timezone/language/
// traffic-source sets. Surfaces everything the columns can't fit.
function PlayerSummary({ stats }) {
  if (!stats) return null;
  const s = stats;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 28px', padding: '10px 12px 16px' }}>
      <Stat label="Plays" value={s.plays} />
      <Stat label="Quizzes" value={s.quizzes} />
      <Stat label="Accuracy" value={s.accuracy != null ? `${s.accuracy}%` : '—'} />
      <Stat label="Best score" value={s.bestScore != null ? s.bestScore : '—'} />
      <Stat label="Perfect" value={s.perfect} />
      <Stat label="Avg time" value={fmtDuration(s.avgTime)} />
      <Stat label="First seen" value={s.firstSeen ? fmtShort(s.firstSeen) : '—'} />
      <Stat label="Active days" value={s.activeDays} />
      <Stat label="Most played" value={s.mostPlayed ? `${s.mostPlayed.title} (${s.mostPlayed.count})` : '—'} />
      <Stat label="Peak time" value={s.peakHour != null ? `${fmtHour(s.peakHour)} · ${DOW[s.peakDow] || ''}` : '—'} />
    </div>
  );
}

// Group a player's plays into sessions (one per calendar day — the project's
// established "session" = a distinct day played) with per-day plays, quizzes,
// average score %, and total time. Newest day first.
function sessionsFromPlays(plays) {
  const byDay = new Map();
  for (const p of plays || []) {
    const d = new Date(p.createdAt);
    if (Number.isNaN(d.getTime())) continue;
    const key = d.toDateString();
    let g = byDay.get(key);
    if (!g) { g = { day: key, latest: p.createdAt, items: [] }; byDay.set(key, g); }
    g.items.push(p);
    if (String(p.createdAt) > String(g.latest)) g.latest = p.createdAt;
  }
  const distinct = (items, f) => {
    const seen = new Set();
    const out = [];
    for (const p of items) { const v = p[f]; if (v && !seen.has(v)) { seen.add(v); out.push(v); } }
    return out;
  };
  return [...byDay.values()].map((g) => {
    let scoreSum = 0, scoreN = 0, timeSum = 0;
    for (const p of g.items) {
      if (typeof p.score === 'number' && typeof p.total === 'number' && p.total > 0) { scoreSum += Math.min(1, p.score / p.total); scoreN += 1; }
      if (typeof p.timeElapsed === 'number' && p.timeElapsed >= 0) timeSum += p.timeElapsed;
    }
    return {
      day: g.day, latest: g.latest, plays: g.items.length,
      acc: scoreN ? Math.round((scoreSum / scoreN) * 100) : null, time: timeSum,
      devices: distinct(g.items, 'device'), oses: distinct(g.items, 'os'),
      browsers: distinct(g.items, 'browser'), geos: distinct(g.items, 'geo'),
      timezones: distinct(g.items, 'timezone'), languages: distinct(g.items, 'language'),
      referrers: distinct(g.items, 'referrer'),
    };
  }).sort((a, b) => String(b.latest).localeCompare(String(a.latest)));
}

// Per-session (per-day) table shown in an expanded player row, above the
// individual play history. Each session carries that day's context — device,
// OS, browser, location, timezone, language, traffic source — since those can
// change from one session to the next.
function SessionTable({ plays }) {
  const sessions = sessionsFromPlays(plays);
  if (!sessions.length) return null;
  const H = ({ label, flex, right }) => (
    <span style={{ flex, textAlign: right ? 'right' : 'left' }}>{label}</span>
  );
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded, margin: '2px 0 6px' }}>
        Sessions · {sessions.length} day{sessions.length === 1 ? '' : 's'}
      </div>
      <div style={{ border: `1px solid ${COLORS.ink}33`, background: COLORS.paper }}>
        <div style={{ display: 'flex', gap: 12, fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded, padding: '8px 12px', borderBottom: `1px solid ${COLORS.ink}33` }}>
          <H label="Day" flex="0 0 86px" />
          <H label="Plays" flex="0 0 38px" right />
          <H label="Avg %" flex="0 0 42px" right />
          <H label="Time" flex="0 0 54px" right />
          <H label="Device" flex="0 0 52px" />
          <H label="OS" flex="0 0 52px" />
          <H label="Browser" flex="0 0 60px" />
          <H label="Geo" flex="0 0 96px" />
          <H label="Timezone" flex="0 0 116px" />
          <H label="Lang" flex="0 0 50px" />
          <H label="Source" flex="0 0 84px" />
        </div>
        {sessions.map((s, j) => (
          <div key={s.day} style={{ display: 'flex', gap: 12, alignItems: 'center', fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 12, color: COLORS.ink, padding: '7px 12px', borderBottom: j < sessions.length - 1 ? `1px solid ${COLORS.ink}1a` : 'none' }}>
            <span style={{ flex: '0 0 86px', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{fmtShort(s.latest)}</span>
            <span style={{ flex: '0 0 38px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 11, fontWeight: 700, color: COLORS.ember }}>{s.plays}</span>
            <span style={{ flex: '0 0 42px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded }}>{s.acc != null ? `${s.acc}%` : '—'}</span>
            <span style={{ flex: '0 0 54px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded }}>{fmtDuration(s.time)}</span>
            <MultiCell values={s.devices} flex="0 0 52px" />
            <MultiCell values={s.oses} flex="0 0 52px" />
            <MultiCell values={s.browsers} flex="0 0 60px" />
            <MultiCell values={s.geos} flex="0 0 96px" />
            <MultiCell values={s.timezones} flex="0 0 116px" />
            <MultiCell values={s.languages} flex="0 0 50px" />
            <MultiCell values={s.referrers} flex="0 0 84px" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ----- Click-to-sort table infrastructure (shared by all analytics tables) ----
// A header cell click sorts by that column. Re-clicking the active column flips
// direction; switching columns picks a sensible default (descending for
// numbers, ascending for text). Numbers compare numerically, everything else by
// string; date columns expose a numeric accessor (Date.parse) so they sort
// chronologically.
function useSort(defaultKey, defaultDir = 'desc') {
  const [key, setKey] = useState(defaultKey);
  const [dir, setDir] = useState(defaultDir);
  const onSort = (k, type) => {
    if (k === key) {
      setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setKey(k);
      setDir(type === 'string' ? 'asc' : 'desc');
    }
  };
  return { key, dir, onSort };
}

function applySort(rows, key, dir, accessors) {
  const acc = accessors[key];
  if (!acc) return rows;
  const sign = dir === 'asc' ? 1 : -1;
  return rows.slice().sort((a, b) => {
    const av = acc(a);
    const bv = acc(b);
    if (typeof av === 'number' || typeof bv === 'number') {
      return sign * ((Number(av) || 0) - (Number(bv) || 0));
    }
    return sign * String(av ?? '').localeCompare(String(bv ?? ''));
  });
}

// A sortable header cell. `k` is the sort key, `type` 'num' (default) or
// 'string' decides the default direction when first clicked. Shows ▲/▼ on the
// active column and a faint ↕ otherwise; the active column is ember.
function SortHead({ label, k, sort, flex, align = 'left', type = 'num' }) {
  const active = sort.key === k;
  const caret = active ? (sort.dir === 'asc' ? '▲' : '▼') : '↕';
  return (
    <span
      onClick={() => sort.onSort(k, type)}
      title="Sort"
      style={{
        flex,
        cursor: 'pointer',
        userSelect: 'none',
        color: active ? COLORS.ember : COLORS.faded,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      {align === 'right' ? (
        <>
          {label}
          <span style={{ fontSize: 8, opacity: active ? 1 : 0.45 }}>{caret}</span>
        </>
      ) : (
        <>
          <span style={{ fontSize: 8, opacity: active ? 1 : 0.45 }}>{caret}</span>
          {label}
        </>
      )}
    </span>
  );
}

// A cell that shows a player's distinct values for a metadata field: the first
// (newest) value plus an ember "+N" badge when there are more, with the full
// set in a hover title. Empty -> a faded dash.
function MultiCell({ values, flex, align = 'left' }) {
  const arr = (values || []).filter(Boolean);
  const extra = arr.length - 1;
  return (
    <span
      title={arr.join(', ')}
      style={{
        flex,
        textAlign: align,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontFamily: 'DM Mono, monospace',
        fontSize: 11,
        color: arr.length ? COLORS.ink : COLORS.faded,
      }}
    >
      {arr.length ? arr[0] : '—'}
      {extra > 0 ? <span style={{ color: COLORS.ember, fontWeight: 700 }}> +{extra}</span> : null}
    </span>
  );
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

export default function AdminClient({ initialLists, initialExtras = [], initialComplaints = [], initialVoteStandings = [], initialVoteEvents = [], initialComments = [], initialAlerts = [], initialViews24h = [], initialEditorNotes = [], initialQuizSignups = [], initialQuizStats = [], initialAnonPlayers = [] }) {
  const router = useRouter();
  const [lists, setLists] = useState(initialLists);
  const [extras, setExtras] = useState(initialExtras);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [complaints, setComplaints] = useState(initialComplaints);
  const [voteStandings, setVoteStandings] = useState(initialVoteStandings);
  const [voteEvents, setVoteEvents] = useState(initialVoteEvents);
  const [comments, setComments] = useState(initialComments);
  const [editorNotes, setEditorNotes] = useState(initialEditorNotes);
  const [views24h] = useState(initialViews24h);
  const [quizSignups] = useState(initialQuizSignups);
  const [anonPlayers] = useState(initialAnonPlayers);
  const [quizStats] = useState(initialQuizStats);
  const [tab, setTab] = useState('analytics');
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
  const editorNotesCount = editorNotes.length;
  const views24hTotal = useMemo(
    () => views24h.reduce((n, v) => n + (v.views24h || 0), 0),
    [views24h]
  );
  const quizPlaysTotal = useMemo(
    () => quizStats.reduce((n, q) => n + (q.plays || 0), 0),
    [quizStats]
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

  async function respond(kind, id, current) {
    const text = window.prompt('Editor response (shown publicly as "Editor: ..."). Leave blank to clear:', current || '');
    if (text === null) return;
    const key = 'r-' + kind + '-' + id;
    if (busy[key]) return;
    setBusy((b) => ({ ...b, [key]: true }));
    const res = await fetch('/api/admin/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, id, response: text }),
    });
    if (res.ok) {
      const val = text.trim() || null;
      if (kind === 'comment') setComments((prev) => prev.map((c) => (c.id === id ? { ...c, editorResponse: val } : c)));
      else setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, editorResponse: val } : c)));
    } else {
      alert('Could not save response. Try again.');
    }
    setBusy((b) => ({ ...b, [key]: false }));
  }

  async function addNote(listId, note) {
    const lid = (listId || '').trim();
    const text = (note || '').trim();
    if (!lid || !text) { alert('Pick a list and write a note.'); return; }
    if (busy['note-add']) return;
    setBusy((b) => ({ ...b, ['note-add']: true }));
    const res = await fetch('/api/admin/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listId: lid, note: text }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.note) {
      setEditorNotes((prev) => [{ id: data.note.id, listId: data.note.list_id, note: data.note.note, createdAt: data.note.created_at }, ...prev]);
    } else {
      alert('Could not post note. Try again.');
    }
    setBusy((b) => ({ ...b, ['note-add']: false }));
  }

  async function deleteNote(id) {
    const key = 'note-' + id;
    if (busy[key]) return;
    setBusy((b) => ({ ...b, [key]: true }));
    const res = await fetch('/api/admin/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, remove: true }) });
    if (res.ok) setEditorNotes((prev) => prev.filter((n) => n.id !== id));
    else alert('Could not delete note.');
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
      className="adt"
      style={{
        minHeight: '100vh',
        background: COLORS.cream,
        color: COLORS.ink,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Manrope, system-ui, -apple-system, sans-serif',
      }}
    >
      <style>{`
        .adt [style*="border:"]{border-radius:10px;}
        .adt ::placeholder{color:${COLORS.faded};}
      `}</style>
      <Grain />
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 1180,
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
                fontFamily: 'Manrope, system-ui, -apple-system, sans-serif',
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
              border: `1px solid ${COLORS.line}`,
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
            border: `1px solid ${COLORS.line}`,
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
          <TabButton active={tab === 'feedback'} onClick={() => setTab('feedback')}>
            Feedback <span style={{ opacity: 0.6 }}>{complaintsCount + commentsCount}</span>
          </TabButton>
          <TabButton active={tab === 'research'} onClick={() => setTab('research')}>
            Research <span style={{ opacity: 0.6 }}>{alerts.length + editorNotesCount}</span>
          </TabButton>
          <TabButton active={tab === 'analytics'} onClick={() => setTab('analytics')}>
            Analytics <span style={{ opacity: 0.6 }}>{views24hTotal}</span>
          </TabButton>
        </div>

        {tab === 'analytics' ? (
          <AnalyticsPanel views={views24h} viewsTotal={views24hTotal} quizStats={quizStats} quizPlaysTotal={quizPlaysTotal} signups={quizSignups} anonPlayers={anonPlayers} />
        ) : tab === 'research' ? (
          <ResearchNotesPanel alerts={alerts} busy={busy} onResolve={resolveAlert} notes={editorNotes} lists={LISTS} onAddNote={addNote} onDeleteNote={deleteNote} />
        ) : tab === 'feedback' ? (
          <FeedbackPanel complaints={complaints} comments={comments} busy={busy} onDismiss={dismissComplaint} onDelete={deleteComment} onRespond={respond} />
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
              fontFamily: 'Manrope, system-ui, -apple-system, sans-serif',
              fontStyle: 'italic',
              fontSize: 18,
              color: COLORS.faded,
              border: `1px dashed ${COLORS.line}`,
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
// Cap long admin tables to roughly 25 visible rows, then scroll vertically.
const TABLE_MAX_H = 940;

// Page views: unified visitor counts for list pages and quiz pages over the
// rolling past 24 hours and all-time. `mode` switches the table between the
// combined feed ('all'), lists only, or quizzes only. Quiz rows also carry
// completed-game plays (all-time and last 24h), folded in from the former
// standalone Quiz Stats tab; lists have no play data, so those columns read an
// em-dash in the combined view.
function PageViewsPanel({ lists, quizzes, mode }) {
  const [query, setQuery] = useState('');
  const sort = useSort('views24h', 'desc');

  const rows = useMemo(() => {
    const L = (lists || []).map((v) => ({
      kind: 'list',
      id: v.listId,
      title: v.title || '',
      href: `/list/${encodeURIComponent(v.listId)}`,
      views24h: v.views24h || 0,
      viewsTotal: v.viewsTotal || 0,
      plays: null,
      plays24h: null,
    }));
    const Q = (quizzes || []).map((q) => ({
      kind: 'quiz',
      id: q.quizId,
      title: q.title || '',
      href: `/quiz/${encodeURIComponent(q.quizId)}`,
      views24h: q.views24h || 0,
      viewsTotal: q.viewsTotal || 0,
      plays: q.plays || 0,
      plays24h: q.plays24h || 0,
    }));
    if (mode === 'lists') return L;
    if (mode === 'quizzes') return Q;
    return [...L, ...Q];
  }, [lists, quizzes, mode]);

  const accessors = {
    title: (r) => r.title || '',
    type: (r) => r.kind,
    views24h: (r) => r.views24h || 0,
    viewsTotal: (r) => r.viewsTotal || 0,
    plays: (r) => (r.plays == null ? -1 : r.plays),
    plays24h: (r) => (r.plays24h == null ? -1 : r.plays24h),
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = !q
      ? rows
      : rows.filter(
          (r) => r.title.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
        );
    return applySort(filtered, sort.key, sort.dir, accessors);
  }, [rows, query, sort.key, sort.dir]);

  if (!rows || rows.length === 0) {
    return (
      <div
        style={{
          padding: '60px 20px',
          textAlign: 'center',
          fontFamily: 'Manrope, system-ui, -apple-system, sans-serif',
          fontStyle: 'italic',
          fontSize: 18,
          color: COLORS.faded,
          border: `1px dashed ${COLORS.line}`,
        }}
      >
        No view data yet.
      </div>
    );
  }

  const rowBorder = `1px solid ${COLORS.ink}22`;
  const total24h = rows.reduce((n, r) => n + (r.views24h || 0), 0);
  const activeCount = rows.filter((r) => r.views24h > 0).length;
  const plays24Total = rows.reduce((n, r) => n + (r.plays24h || 0), 0);
  const noun = mode === 'lists' ? 'list' : mode === 'quizzes' ? 'quiz' : 'page';
  const showType = mode === 'all';
  const showPlays = mode !== 'lists';
  const titleLabel = mode === 'lists' ? 'List' : mode === 'quizzes' ? 'Quiz' : 'Page';
  const blurb =
    mode === 'quizzes'
      ? `Per-quiz visitors over the rolling past 24 hours and all-time, plus completed-game plays. Busiest first. ${total24h} view${total24h === 1 ? '' : 's'} and ${plays24Total} play${plays24Total === 1 ? '' : 's'} in the last day.`
      : mode === 'lists'
      ? `Visitor counts per list page over the rolling past 24 hours, busiest first. ${total24h} view${total24h === 1 ? '' : 's'} across ${activeCount} list${activeCount === 1 ? '' : 's'}. All-time totals shown for context.`
      : `Page views across lists and quizzes over the rolling past 24 hours, busiest first. ${total24h} view${total24h === 1 ? '' : 's'} across ${activeCount} active page${activeCount === 1 ? '' : 's'} in the last day.`;

  return (
    <div>
      <p style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 13, color: COLORS.faded, margin: '0 0 14px' }}>
        {blurb}
      </p>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Filter by ${noun} title or id...`}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: COLORS.paper,
          border: `1px solid ${COLORS.line}`,
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
            fontFamily: 'Manrope, system-ui, -apple-system, sans-serif',
            fontStyle: 'italic',
            fontSize: 16,
            color: COLORS.faded,
            border: `1px dashed ${COLORS.line}`,
          }}
        >
          No matches.
        </div>
      ) : (
        <div style={{ border: `1px solid ${COLORS.line}`, background: COLORS.paper, borderRadius: 12 }}>
          <div style={{ display: 'flex', gap: 16, position: 'sticky', top: 0, zIndex: 1, background: COLORS.cream, fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.faded, padding: '10px 14px', borderBottom: `1px solid ${COLORS.line}` }}>
            <span style={{ flex: '0 0 36px' }}>#</span>
            {showType && <SortHead label="Type" k="type" sort={sort} flex="0 0 56px" type="string" />}
            <SortHead label={titleLabel} k="title" sort={sort} flex={3} type="string" />
            <SortHead label="Views 24h" k="views24h" sort={sort} flex="0 0 88px" align="right" />
            <SortHead label="Views all" k="viewsTotal" sort={sort} flex="0 0 88px" align="right" />
            {showPlays && <SortHead label="Plays 24h" k="plays24h" sort={sort} flex="0 0 84px" align="right" />}
            {showPlays && <SortHead label="Plays all" k="plays" sort={sort} flex="0 0 84px" align="right" />}
          </div>
          {visible.map((r, i) => {
            const active = r.views24h > 0 || (r.plays24h || 0) > 0;
            return (
              <div
                key={`${r.kind}:${r.id}`}
                style={{ display: 'flex', gap: 16, alignItems: 'center', fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 13, color: COLORS.ink, padding: '9px 14px', borderBottom: i < visible.length - 1 ? rowBorder : 'none', opacity: active ? 1 : 0.55 }}
              >
                <span style={{ flex: '0 0 36px', fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded }}>
                  {i + 1}
                </span>
                {showType && (
                  <span style={{ flex: '0 0 56px', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: r.kind === 'quiz' ? COLORS.ember : COLORS.faded }}>
                    {r.kind === 'quiz' ? 'Quiz' : 'List'}
                  </span>
                )}
                <span style={{ flex: 3, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Link href={r.href} target="_blank" style={{ color: COLORS.ink, textDecoration: 'none' }}>
                    {r.title || r.id}
                  </Link>
                </span>
                <span style={{ flex: '0 0 88px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontWeight: 700, color: r.views24h > 0 ? COLORS.ember : COLORS.faded }}>
                  {r.views24h}
                </span>
                <span style={{ flex: '0 0 88px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded }}>
                  {r.viewsTotal}
                </span>
                {showPlays && (
                  <span style={{ flex: '0 0 84px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontWeight: 700, color: (r.plays24h || 0) > 0 ? COLORS.ink : COLORS.faded }}>
                    {r.plays24h == null ? '—' : r.plays24h}
                  </span>
                )}
                {showPlays && (
                  <span style={{ flex: '0 0 84px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded }}>
                    {r.plays == null ? '—' : r.plays}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Quiz signups: the email leads captured by the /quiz "join the leaderboard"
// form. One row per email (username + email + date joined), newest first.
function QuizSignupsPanel({ signups }) {
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const sort = useSort('joined', 'desc');

  // Enrich each signup with its last-played timestamp and distinct days played
  // (its "sessions"). Plays arrive newest-first from the server.
  const enriched = useMemo(
    () =>
      (signups || []).map((s) => {
        const plays = s.plays || [];
        const playCount = s.playCount != null ? s.playCount : plays.length;
        const lastPlayedAt = plays.length
          ? plays.reduce(
              (max, p) => (String(p.createdAt || '') > max ? String(p.createdAt || '') : max),
              ''
            )
          : '';
        const daysPlayed = new Set(plays.map((p) => dayKey(p.createdAt)).filter(Boolean)).size;
        return { ...s, playCount, lastPlayedAt, daysPlayed };
      }),
    [signups]
  );

  const accessors = {
    name: (s) => s.username || '',
    email: (s) => s.email || '',
    plays: (s) => s.playCount || 0,
    acc: (s) => (s.stats && s.stats.accuracy != null ? s.stats.accuracy : -1),
    device: (s) => (s.devices && s.devices[0]) || '',
    os: (s) => (s.oses && s.oses[0]) || '',
    geo: (s) => (s.geos && s.geos[0]) || '',
    first: (s) => Date.parse((s.stats && s.stats.firstSeen) || '') || 0,
    recent: (s) => Date.parse(s.lastPlayedAt || '') || 0,
    joined: (s) => Date.parse(s.createdAt || '') || 0,
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = !q
      ? enriched
      : enriched.filter(
          (s) =>
            (s.username || '').toLowerCase().includes(q) ||
            (s.email || '').toLowerCase().includes(q)
        );
    return applySort(filtered, sort.key, sort.dir, accessors);
  }, [enriched, query, sort.key, sort.dir]);

  if (!signups || signups.length === 0) {
    return (
      <div
        style={{
          padding: '60px 20px',
          textAlign: 'center',
          fontFamily: 'Manrope, system-ui, -apple-system, sans-serif',
          fontStyle: 'italic',
          fontSize: 18,
          color: COLORS.faded,
          border: `1px dashed ${COLORS.line}`,
        }}
      >
        No quiz signups yet.
      </div>
    );
  }

  const rowBorder = `1px solid ${COLORS.ink}22`;
  const copyEmails = () => {
    const text = visible.map((s) => s.email).join('\n');
    if (navigator?.clipboard) navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div>
      <p style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 13, color: COLORS.faded, margin: '0 0 14px' }}>
        Email signups from the quiz leaderboard join form.
        {' '}{signups.length} signup{signups.length === 1 ? '' : 's'} total.
        {' '}Click a row for the player's full stats (best score, accuracy, timezone, traffic source, and more) and play history. Click a column header to sort.
      </p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by username or email…"
          style={{
            flex: 1,
            padding: '10px 12px',
            background: COLORS.paper,
            border: `1px solid ${COLORS.line}`,
            color: COLORS.ink,
            fontFamily: 'DM Mono, monospace',
            fontSize: 12,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={copyEmails}
          style={{
            padding: '10px 14px',
            background: COLORS.ink,
            border: `1px solid ${COLORS.line}`,
            color: COLORS.paper,
            fontFamily: 'DM Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Copy emails
        </button>
      </div>
      {visible.length === 0 ? (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            fontFamily: 'Manrope, system-ui, -apple-system, sans-serif',
            fontStyle: 'italic',
            fontSize: 16,
            color: COLORS.faded,
            border: `1px dashed ${COLORS.line}`,
          }}
        >
          No matches.
        </div>
      ) : (
        <div style={{ border: `1px solid ${COLORS.line}`, background: COLORS.paper, borderRadius: 12 }}>
          <div style={{ display: 'flex', gap: 16, position: 'sticky', top: 0, zIndex: 1, background: COLORS.cream, fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.faded, padding: '10px 14px', borderBottom: `1px solid ${COLORS.line}` }}>
            <span style={{ flex: '0 0 28px' }}>#</span>
            <SortHead label="Username" k="name" sort={sort} flex={2} type="string" />
            <SortHead label="Email" k="email" sort={sort} flex={2} type="string" />
            <SortHead label="Plays" k="plays" sort={sort} flex="0 0 42px" align="right" />
            <SortHead label="Device" k="device" sort={sort} flex="0 0 60px" type="string" />
            <SortHead label="OS" k="os" sort={sort} flex="0 0 56px" type="string" />
            <SortHead label="Geo" k="geo" sort={sort} flex="0 0 110px" type="string" />
            <SortHead label="First" k="first" sort={sort} flex="0 0 58px" align="right" />
            <SortHead label="Last" k="recent" sort={sort} flex="0 0 92px" align="right" />
            <SortHead label="Joined" k="joined" sort={sort} flex="0 0 56px" align="right" />
          </div>
          {visible.map((s, i) => {
            const plays = s.plays || [];
            const playCount = s.playCount != null ? s.playCount : plays.length;
            const daysPlayed = s.daysPlayed != null ? s.daysPlayed : new Set(plays.map((p) => dayKey(p.createdAt)).filter(Boolean)).size;
            const open = expandedId === s.id;
            return (
              <div key={s.id} style={{ borderBottom: i < visible.length - 1 ? rowBorder : 'none' }}>
                <div
                  onClick={() => setExpandedId(open ? null : s.id)}
                  style={{ display: 'flex', gap: 16, alignItems: 'center', fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 13, color: COLORS.ink, padding: '9px 14px', cursor: 'pointer', background: open ? `${COLORS.ink}0a` : 'transparent' }}
                >
                  <span style={{ flex: '0 0 28px', fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ display: 'inline-block', width: 8, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.12s' }}>▸</span>
                    {i + 1}
                  </span>
                  <span style={{ flex: 2, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, fontFamily: 'Manrope, system-ui, -apple-system, sans-serif' }}>
                    {s.username}
                  </span>
                  <span style={{ flex: 2, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'DM Mono, monospace', fontSize: 12 }}>
                    <a href={`mailto:${s.email}`} onClick={(e) => e.stopPropagation()} style={{ color: COLORS.ink, textDecoration: 'none' }}>{s.email}</a>
                  </span>
                  <span style={{ flex: '0 0 42px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 12, fontWeight: 700, color: playCount > 0 ? COLORS.ember : COLORS.faded }}>
                    {playCount}
                  </span>
                  <MultiCell values={s.devices} flex="0 0 60px" />
                  <MultiCell values={s.oses} flex="0 0 56px" />
                  <MultiCell values={s.geos} flex="0 0 110px" />
                  <span style={{ flex: '0 0 58px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded }}>
                    {s.stats && s.stats.firstSeen ? fmtShort(s.stats.firstSeen) : '—'}
                  </span>
                  <span style={{ flex: '0 0 92px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded }}>
                    {s.lastPlayedAt ? fmtShortDateTime(s.lastPlayedAt) : '—'}
                  </span>
                  <span style={{ flex: '0 0 56px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded }}>
                    {fmtShort(s.createdAt)}
                  </span>
                </div>
                {open && (
                  <div style={{ padding: '4px 14px 14px 48px', background: `${COLORS.ink}0a` }}>
                    <PlayerSummary stats={s.stats} />
                    <SessionTable plays={plays} />
                    {playCount === 0 ? (
                      <p style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontStyle: 'italic', fontSize: 14, color: COLORS.faded, margin: '8px 0' }}>
                        Signed up but hasn&apos;t completed a quiz yet.
                      </p>
                    ) : (
                      <div style={{ border: `1px solid ${COLORS.ink}33`, background: COLORS.paper }}>
                        <div style={{ display: 'flex', gap: 14, fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded, padding: '8px 12px', borderBottom: `1px solid ${COLORS.ink}33` }}>
                          <span style={{ flex: 3 }}>Quiz</span>
                          <span style={{ flex: '0 0 76px', textAlign: 'right' }}>Score</span>
                          <span style={{ flex: '0 0 56px', textAlign: 'right' }}>Time</span>
                          <span style={{ flex: '0 0 78px' }}>Device</span>
                          <span style={{ flex: '0 0 78px' }}>Geo</span>
                          <span style={{ flex: '0 0 130px', textAlign: 'right' }}>Played</span>
                        </div>
                        {plays.map((p, j) => (
                          <div
                            key={`${p.quizId}-${j}`}
                            style={{ display: 'flex', gap: 14, alignItems: 'center', fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 12, color: COLORS.ink, padding: '7px 12px', borderBottom: j < plays.length - 1 ? `1px solid ${COLORS.ink}1a` : 'none' }}
                          >
                            <span style={{ flex: 3, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <Link href={`/quiz/${encodeURIComponent(p.quizId)}`} target="_blank" style={{ color: COLORS.ink, textDecoration: 'none' }}>
                                {p.title}
                              </Link>
                            </span>
                            <span style={{ flex: '0 0 76px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>
                              {p.score}{p.total != null ? `/${p.total}` : ''}
                            </span>
                            <span style={{ flex: '0 0 56px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded }}>
                              {formatClock(p.timeElapsed)}
                            </span>
                            <span style={{ flex: '0 0 78px', fontFamily: 'DM Mono, monospace', fontSize: 10, color: p.device ? COLORS.ink : COLORS.faded }}>
                              {p.device || '—'}
                            </span>
                            <span style={{ flex: '0 0 78px', fontFamily: 'DM Mono, monospace', fontSize: 10, color: p.geo ? COLORS.ink : COLORS.faded }}>
                              {p.geo || '—'}
                            </span>
                            <span style={{ flex: '0 0 130px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 10, color: COLORS.faded }}>
                              {formatDayTime(p.createdAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
          fontFamily: 'Manrope, system-ui, -apple-system, sans-serif',
          fontStyle: 'italic',
          fontSize: 18,
          color: COLORS.faded,
          border: `1px dashed ${COLORS.line}`,
        }}
      >
        No consensus changes awaiting research.
      </div>
    );
  }
  const rowBorder = `1px solid ${COLORS.ink}22`;
  return (
    <div>
      <p style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 13, color: COLORS.faded, margin: '0 0 14px' }}>
        Items that newly entered a list's consensus top 10 (needs a description) or
        top 3 (needs a hero photo). Resolve once the research has shipped.
      </p>
      <div style={{ border: `1px solid ${COLORS.line}` }}>
        <div style={{ display: 'flex', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.faded, padding: '10px 14px', borderBottom: `1px solid ${COLORS.line}` }}>
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
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 13, color: COLORS.ink, padding: '9px 14px', borderBottom: i < alerts.length - 1 ? rowBorder : 'none' }}
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
                    border: `1px solid ${COLORS.line}`,
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
      <div style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 26, fontWeight: 700, color: COLORS.ink, lineHeight: 1.1, marginTop: 2 }}>{value}</div>
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
        <h3 style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontWeight: 700, fontSize: 20, margin: '0 0 12px' }}>Current standings</h3>
        {hasStandings ? (
          <div style={{ border: `1px solid ${COLORS.line}`, background: COLORS.paper, borderRadius: 12, maxHeight: TABLE_MAX_H, overflowY: 'auto' }}>
            <div style={{ display: 'flex', gap: 16, position: 'sticky', top: 0, zIndex: 1, background: COLORS.cream, fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.faded, padding: '10px 14px', borderBottom: `1px solid ${COLORS.line}` }}>
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
                <div key={`${s.listId}::${s.itemName}::${i}`} style={{ display: 'flex', alignItems: 'center', fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 13, color: COLORS.ink, padding: '9px 14px', borderBottom: i < standings.length - 1 ? rowBorder : 'none' }}>
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
          <p style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontStyle: 'italic', fontSize: 14, color: COLORS.faded }}>No votes recorded yet.</p>
        )}
      </div>
      <div>
        <h3 style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontWeight: 700, fontSize: 20, margin: '0 0 4px' }}>Recent vote log</h3>
        <p style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 13, color: COLORS.faded, margin: '0 0 12px' }}>
          The {events.length} most recent vote events. A vote for 1st place is +3, 2nd is +2, 3rd is +1.
        </p>
        {hasEvents ? (
          <div style={{ border: `1px solid ${COLORS.line}`, background: COLORS.paper, borderRadius: 12, maxHeight: TABLE_MAX_H, overflowY: 'auto' }}>
            {events.map((e, i) => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 13, color: COLORS.ink, padding: '9px 14px', borderBottom: i < events.length - 1 ? rowBorder : 'none' }}>
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
          <p style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontStyle: 'italic', fontSize: 14, color: COLORS.faded }}>No vote events logged yet.</p>
        )}
      </div>
    </div>
  );
}

function CommentsPanel({ comments, busy, onDelete, onRespond }) {
  if (!comments || comments.length === 0) {
    return <p style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontStyle: 'italic', fontSize: 14, color: COLORS.faded }}>No public comments yet.</p>;
  }
  const rowBorder = `1px solid ${COLORS.ink}22`;
  return (
    <div style={{ border: `1px solid ${COLORS.line}` }}>
      {comments.map((c, i) => {
        const bkey = `cm-${c.id}`;
        return (
          <div key={c.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px', borderBottom: i < comments.length - 1 ? rowBorder : 'none' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded }}>
                <Link href={`/list/${c.listId}`} style={{ color: COLORS.ember, textDecoration: 'none' }}>{c.listId}</Link>
                {' · '}{c.name || 'Guest'}{' · '}{formatDate(c.createdAt)}
              </div>
              <div style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 14, color: COLORS.ink, marginTop: 4, whiteSpace: 'pre-wrap' }}>{c.body}</div>
              {c.editorResponse && (
                <div style={{ marginTop: 6, fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 13, color: COLORS.ink, background: COLORS.cream, borderLeft: '3px solid ' + COLORS.ember, padding: '6px 10px' }}>
                  <strong style={{ fontWeight: 700 }}>Editor:</strong> {c.editorResponse}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
              <button
                onClick={() => onRespond && onRespond('comment', c.id, c.editorResponse)}
                style={{ cursor: 'pointer', background: 'transparent', color: COLORS.ink, border: '1px solid ' + COLORS.line, padding: '5px 12px', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}
              >
                {c.editorResponse ? 'Edit reply' : 'Reply'}
              </button>
              <button
                onClick={() => onDelete && onDelete(c.id)}
                disabled={busy && busy[bkey]}
                style={{ cursor: 'pointer', background: 'transparent', color: COLORS.ember, border: '1px solid ' + COLORS.ember, padding: '5px 12px', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: busy && busy[bkey] ? 0.5 : 1 }}
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NotesPanel({ notes, lists, busy, onAdd, onDelete }) {
  const [listId, setListId] = useState('');
  const [note, setNote] = useState('');
  const rowBorder = `1px solid ${COLORS.ink}22`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ border: `1px solid ${COLORS.line}`, padding: 16, background: COLORS.paper }}>
        <h3 style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontWeight: 700, fontSize: 18, margin: '0 0 10px' }}>Post an editor's note</h3>
        <input list="sot-all-lists" value={listId} onChange={(e) => setListId(e.target.value)} placeholder="List id (e.g. fast-food-fries)" style={{ width: '100%', boxSizing: 'border-box', padding: 10, border: `1px solid ${COLORS.line}`, background: '#fff', fontFamily: 'DM Mono, monospace', fontSize: 13, marginBottom: 8 }} />
        <datalist id="sot-all-lists">{lists.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}</datalist>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={1000} placeholder="Shown publicly as: Editor's Note: ..." style={{ width: '100%', boxSizing: 'border-box', padding: 10, border: `1px solid ${COLORS.line}`, background: '#fff', fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 14, resize: 'vertical', marginBottom: 8 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => { onAdd(listId, note); setNote(''); }} disabled={!!busy['note-add']} style={{ cursor: 'pointer', background: COLORS.ember, color: COLORS.cream, border: `1.5px solid ${COLORS.ember}`, padding: '9px 16px', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>Post note</button>
        </div>
      </div>
      {(!notes || notes.length === 0) ? (
        <p style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontStyle: 'italic', fontSize: 14, color: COLORS.faded }}>No editor notes yet.</p>
      ) : (
        <div style={{ border: `1px solid ${COLORS.line}` }}>
          {notes.map((n, i) => (
            <div key={n.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px', borderBottom: i < notes.length - 1 ? rowBorder : 'none' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded }}>
                  <Link href={`/list/${n.listId}`} style={{ color: COLORS.ember, textDecoration: 'none' }}>{n.listId}</Link>{' · '}{formatDate(n.createdAt)}
                </div>
                <div style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 14, color: COLORS.ink, marginTop: 4, whiteSpace: 'pre-wrap' }}>{n.note}</div>
              </div>
              <button onClick={() => onDelete(n.id)} disabled={!!busy['note-' + n.id]} style={{ flexShrink: 0, cursor: 'pointer', background: 'transparent', color: COLORS.ember, border: `1px solid ${COLORS.ember}`, padding: '5px 12px', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ComplaintsPanel({ complaints, busy, onDismiss, onRespond }) {
  if (!complaints || complaints.length === 0) {
    return (
      <div
        style={{
          padding: '60px 20px',
          textAlign: 'center',
          fontFamily: 'Manrope, system-ui, -apple-system, sans-serif',
          fontStyle: 'italic',
          fontSize: 18,
          color: COLORS.faded,
          border: `1px dashed ${COLORS.line}`,
        }}
      >
        No reader notices right now.
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {complaints.map((c) => (
        <div key={c.id} style={{ border: `1px solid ${COLORS.line}`, padding: 18, background: COLORS.paper }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: COLORS.faded, marginBottom: 4 }}>
                {formatDate(c.createdAt)}
              </div>
              <Link href={`${(c.listTitle || '').startsWith('[Quiz]') ? '/quiz/' : '/list/'}${c.listId}`} style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontWeight: 700, fontSize: 18, color: COLORS.ink, textDecoration: 'none' }}>
                {c.listTitle || c.listId}
              </Link>
              {c.message ? (
                <p style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 14, color: COLORS.ink, margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>{c.message}</p>
              ) : (
                <p style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontStyle: 'italic', fontSize: 14, color: COLORS.faded, margin: '8px 0 0' }}>
                  Requested new research (no message left).
                </p>
              )}
              {c.editorResponse && (
                <p style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 14, color: COLORS.ink, margin: '10px 0 0', background: COLORS.cream, borderLeft: '3px solid ' + COLORS.ember, padding: '8px 12px', whiteSpace: 'pre-wrap' }}>
                  <strong style={{ fontWeight: 700 }}>Editor:</strong> {c.editorResponse}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => onRespond && onRespond('review', c.id, c.editorResponse)}
                style={{ cursor: 'pointer', background: 'transparent', border: '1.5px solid ' + COLORS.ember, color: COLORS.ember, padding: '8px 14px', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}
              >
                {c.editorResponse ? 'Edit reply' : 'Reply'}
              </button>
              <button
                onClick={() => onDismiss(c.id)}
                disabled={!!busy['c-' + c.id]}
                style={{ cursor: 'pointer', background: 'transparent', border: '1px solid ' + COLORS.line, color: COLORS.ink, padding: '8px 14px', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: COLORS.ink, fontWeight: 700, paddingBottom: 10, marginBottom: 14, borderBottom: `1px solid ${COLORS.line}` }}>
      {children}
    </div>
  );
}

// Analytics tab: list page views and quiz views/plays, stacked into one view.
function AnonPlayersPanel({ players }) {
  const [query, setQuery] = useState('');
  const sort = useSort('plays', 'desc');
  const [expandedKey, setExpandedKey] = useState(null);
  const list = players || [];

  const accessors = {
    player: (p) => p.label || '',
    plays: (p) => p.plays || 0,
    acc: (p) => (p.stats && p.stats.accuracy != null ? p.stats.accuracy : -1),
    device: (p) => (p.devices && p.devices[0]) || '',
    os: (p) => (p.oses && p.oses[0]) || '',
    geo: (p) => (p.geos && p.geos[0]) || '',
    first: (p) => Date.parse((p.stats && p.stats.firstSeen) || '') || 0,
    recent: (p) => Date.parse(p.lastPlayed || '') || 0,
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const digits = q.replace(/[^0-9]/g, '');
    const arr = !q ? list : list.filter((p) => String(p.label || '').toLowerCase().includes(q) || (digits && String(p.num).includes(digits)));
    return applySort(arr, sort.key, sort.dir, accessors);
  }, [list, query, sort.key, sort.dir]);

  if (!list.length) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontStyle: 'italic', fontSize: 18, color: COLORS.faded, border: `1px dashed ${COLORS.line}` }}>
        No anonymous players yet.
      </div>
    );
  }
  const rowBorder = `1px solid ${COLORS.ink}22`;
  const totalPlays = list.reduce((n, p) => n + (p.plays || 0), 0);
  return (
    <div>
      <p style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 13, color: COLORS.faded, margin: '0 0 14px' }}>
        Players who completed quizzes without signing up, batched by browser and shown under a stable Guest handle.
        {' '}{list.length} anonymous player{list.length === 1 ? '' : 's'}, {totalPlays} play{totalPlays === 1 ? '' : 's'} total.
        {' '}Click a row to see every quiz that player played and when. Click a column header to sort.
      </p>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter by guest handle or number\u2026" style={{ width: '100%', padding: '10px 12px', background: COLORS.paper, border: `1px solid ${COLORS.line}`, color: COLORS.ink, fontFamily: 'DM Mono, monospace', fontSize: 12, outline: 'none', boxSizing: 'border-box', marginBottom: 16 }} />
      {visible.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontStyle: 'italic', fontSize: 16, color: COLORS.faded, border: `1px dashed ${COLORS.line}` }}>No matches.</div>
      ) : (
        <div style={{ border: `1px solid ${COLORS.line}`, background: COLORS.paper, borderRadius: 12 }}>
          <div style={{ display: 'flex', gap: 16, position: 'sticky', top: 0, zIndex: 1, background: COLORS.cream, fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.faded, padding: '10px 14px', borderBottom: `1px solid ${COLORS.line}` }}>
            <span style={{ flex: '0 0 28px' }}>#</span>
            <SortHead label="Player" k="player" sort={sort} flex={2} type="string" />
            <SortHead label="Plays" k="plays" sort={sort} flex="0 0 42px" align="right" />
            <SortHead label="Device" k="device" sort={sort} flex="0 0 62px" type="string" />
            <SortHead label="OS" k="os" sort={sort} flex="0 0 58px" type="string" />
            <SortHead label="Geo" k="geo" sort={sort} flex="0 0 118px" type="string" />
            <SortHead label="First" k="first" sort={sort} flex="0 0 60px" align="right" />
            <SortHead label="Last" k="recent" sort={sort} flex="0 0 92px" align="right" />
          </div>
          {visible.map((p, i) => {
            const open = expandedKey === p.key;
            const history = p.history || [];
            return (
              <div key={p.key} style={{ borderBottom: i < visible.length - 1 ? rowBorder : 'none' }}>
                <div onClick={() => setExpandedKey(open ? null : p.key)} style={{ display: 'flex', gap: 16, alignItems: 'center', fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 13, color: COLORS.ink, padding: '9px 14px', cursor: 'pointer', background: open ? `${COLORS.ink}0a` : 'transparent' }}>
                  <span style={{ flex: '0 0 32px', fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ display: 'inline-block', width: 8, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.12s' }}>&#9656;</span>
                    {i + 1}
                  </span>
                  <span style={{ flex: 2, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontWeight: 700 }}>{p.label}</span>
                  <span style={{ flex: '0 0 42px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 12, fontWeight: 700, color: p.plays > 0 ? COLORS.ember : COLORS.faded }}>{p.plays}</span>
                  <MultiCell values={p.devices} flex="0 0 62px" />
                  <MultiCell values={p.oses} flex="0 0 58px" />
                  <MultiCell values={p.geos} flex="0 0 118px" />
                  <span style={{ flex: '0 0 60px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded }}>{p.stats && p.stats.firstSeen ? fmtShort(p.stats.firstSeen) : '\u2014'}</span>
                  <span style={{ flex: '0 0 92px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded }}>{p.lastPlayed ? fmtShortDateTime(p.lastPlayed) : '\u2014'}</span>
                </div>
                {open && (
                  <div style={{ padding: '4px 14px 14px 48px', background: `${COLORS.ink}0a` }}>
                    <PlayerSummary stats={p.stats} />
                    <SessionTable plays={history} />
                    {history.length === 0 ? (
                      <p style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontStyle: 'italic', fontSize: 14, color: COLORS.faded, margin: '8px 0' }}>No completed games recorded.</p>
                    ) : (
                      <div style={{ border: `1px solid ${COLORS.ink}33`, background: COLORS.paper }}>
                        <div style={{ display: 'flex', gap: 14, fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded, padding: '8px 12px', borderBottom: `1px solid ${COLORS.ink}33` }}>
                          <span style={{ flex: 3 }}>Quiz</span>
                          <span style={{ flex: '0 0 76px', textAlign: 'right' }}>Score</span>
                          <span style={{ flex: '0 0 56px', textAlign: 'right' }}>Time</span>
                          <span style={{ flex: '0 0 78px' }}>Device</span>
                          <span style={{ flex: '0 0 78px' }}>Geo</span>
                          <span style={{ flex: '0 0 130px', textAlign: 'right' }}>Played</span>
                        </div>
                        {history.map((x, j) => (
                          <div key={`${x.quizId}-${j}`} style={{ display: 'flex', gap: 14, alignItems: 'center', fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 12, color: COLORS.ink, padding: '7px 12px', borderBottom: j < history.length - 1 ? `1px solid ${COLORS.ink}1a` : 'none' }}>
                            <span style={{ flex: 3, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <Link href={`/quiz/${encodeURIComponent(x.quizId)}`} target="_blank" style={{ color: COLORS.ink, textDecoration: 'none' }}>{x.title}</Link>
                            </span>
                            <span style={{ flex: '0 0 76px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{x.score}{x.total != null ? `/${x.total}` : ''}</span>
                            <span style={{ flex: '0 0 56px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded }}>{formatClock(x.timeElapsed)}</span>
                            <span style={{ flex: '0 0 78px', fontFamily: 'DM Mono, monospace', fontSize: 10, color: x.device ? COLORS.ink : COLORS.faded }}>{x.device || '—'}</span>
                            <span style={{ flex: '0 0 78px', fontFamily: 'DM Mono, monospace', fontSize: 10, color: x.geo ? COLORS.ink : COLORS.faded }}>{x.geo || '—'}</span>
                            <span style={{ flex: '0 0 130px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 10, color: COLORS.faded }}>{formatDayTime(x.createdAt)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// All players, registered AND anonymous, in one unified table. Registered rows
// carry the username/email; anonymous rows carry the stable Guest handle. The
// shared columns (plays, device/browser/geo, last played) line up so the whole
// audience can be ranked together, and each row still expands to its play
// history. This backs the "All" sub-view of Quiz Plays.
function AllPlayersPanel({ signups, anonPlayers }) {
  const [query, setQuery] = useState('');
  const [expandedKey, setExpandedKey] = useState(null);
  const sort = useSort('last', 'desc');

  const rows = useMemo(() => {
    const reg = (signups || []).map((s) => {
      const plays = s.plays || [];
      return {
        key: `u:${s.id}`,
        type: 'Registered',
        name: s.username || '(no name)',
        email: s.email || null,
        plays: s.playCount != null ? s.playCount : plays.length,
        lastAt: (plays[0] && plays[0].createdAt) || '',
        accuracy: s.stats ? s.stats.accuracy : null,
        firstSeen: s.stats ? s.stats.firstSeen : null,
        devices: s.devices,
        oses: s.oses,
        geos: s.geos,
        stats: s.stats,
        history: plays,
      };
    });
    const anon = (anonPlayers || []).map((p) => ({
      key: p.key,
      type: 'Anonymous',
      name: p.label,
      email: null,
      plays: p.plays || 0,
      lastAt: p.lastPlayed || '',
      accuracy: p.stats ? p.stats.accuracy : null,
      firstSeen: p.stats ? p.stats.firstSeen : null,
      devices: p.devices,
      oses: p.oses,
      geos: p.geos,
      stats: p.stats,
      history: p.history || [],
    }));
    return [...reg, ...anon];
  }, [signups, anonPlayers]);

  const accessors = {
    name: (r) => r.name || '',
    type: (r) => r.type || '',
    plays: (r) => r.plays || 0,
    acc: (r) => (r.accuracy == null ? -1 : r.accuracy),
    device: (r) => (r.devices && r.devices[0]) || '',
    os: (r) => (r.oses && r.oses[0]) || '',
    geo: (r) => (r.geos && r.geos[0]) || '',
    first: (r) => Date.parse(r.firstSeen || '') || 0,
    last: (r) => Date.parse(r.lastAt || '') || 0,
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = !q
      ? rows
      : rows.filter((r) => (r.name || '').toLowerCase().includes(q) || (r.email || '').toLowerCase().includes(q));
    return applySort(filtered, sort.key, sort.dir, accessors);
  }, [rows, query, sort.key, sort.dir]);

  if (!rows.length) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontStyle: 'italic', fontSize: 18, color: COLORS.faded, border: `1px dashed ${COLORS.line}` }}>
        No players yet.
      </div>
    );
  }

  const rowBorder = `1px solid ${COLORS.ink}22`;
  const totalPlays = rows.reduce((n, r) => n + (r.plays || 0), 0);
  const regCount = (signups || []).length;
  const anonCount = (anonPlayers || []).length;

  return (
    <div>
      <p style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 13, color: COLORS.faded, margin: '0 0 14px' }}>
        Every player, registered and anonymous, in one table.
        {' '}{rows.length} player{rows.length === 1 ? '' : 's'} ({regCount} registered, {anonCount} anonymous), {totalPlays} play{totalPlays === 1 ? '' : 's'} total.
        {' '}Click a row to see that player&apos;s games. Click a column header to sort.
      </p>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter by name or email…" style={{ width: '100%', padding: '10px 12px', background: COLORS.paper, border: `1px solid ${COLORS.line}`, color: COLORS.ink, fontFamily: 'DM Mono, monospace', fontSize: 12, outline: 'none', boxSizing: 'border-box', marginBottom: 16 }} />
      {visible.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontStyle: 'italic', fontSize: 16, color: COLORS.faded, border: `1px dashed ${COLORS.line}` }}>No matches.</div>
      ) : (
        <div style={{ border: `1px solid ${COLORS.line}`, background: COLORS.paper, borderRadius: 12 }}>
          <div style={{ display: 'flex', gap: 16, position: 'sticky', top: 0, zIndex: 1, background: COLORS.cream, fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.faded, padding: '10px 14px', borderBottom: `1px solid ${COLORS.line}` }}>
            <span style={{ flex: '0 0 28px' }}>#</span>
            <SortHead label="Player" k="name" sort={sort} flex={2} type="string" />
            <SortHead label="Type" k="type" sort={sort} flex="0 0 76px" type="string" />
            <SortHead label="Plays" k="plays" sort={sort} flex="0 0 42px" align="right" />
            <SortHead label="Device" k="device" sort={sort} flex="0 0 62px" type="string" />
            <SortHead label="OS" k="os" sort={sort} flex="0 0 58px" type="string" />
            <SortHead label="Geo" k="geo" sort={sort} flex="0 0 118px" type="string" />
            <SortHead label="First" k="first" sort={sort} flex="0 0 60px" align="right" />
            <SortHead label="Last" k="last" sort={sort} flex="0 0 92px" align="right" />
          </div>
          {visible.map((r, i) => {
            const open = expandedKey === r.key;
            const reg = r.type === 'Registered';
            const history = r.history || [];
            return (
              <div key={r.key} style={{ borderBottom: i < visible.length - 1 ? rowBorder : 'none' }}>
                <div onClick={() => setExpandedKey(open ? null : r.key)} style={{ display: 'flex', gap: 16, alignItems: 'center', fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 13, color: COLORS.ink, padding: '9px 14px', cursor: 'pointer', background: open ? `${COLORS.ink}0a` : 'transparent' }}>
                  <span style={{ flex: '0 0 28px', fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ display: 'inline-block', width: 8, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.12s' }}>&#9656;</span>
                    {i + 1}
                  </span>
                  <span style={{ flex: 2, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, fontFamily: 'Manrope, system-ui, -apple-system, sans-serif' }}>
                    {r.name}
                    {r.email ? <span style={{ color: COLORS.faded, fontWeight: 400, fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{' · '}{r.email}</span> : null}
                  </span>
                  <span style={{ flex: '0 0 76px', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: reg ? COLORS.ember : COLORS.faded }}>{reg ? 'Registered' : 'Anon'}</span>
                  <span style={{ flex: '0 0 42px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 12, fontWeight: 700, color: r.plays > 0 ? COLORS.ember : COLORS.faded }}>{r.plays}</span>
                  <MultiCell values={r.devices} flex="0 0 62px" />
                  <MultiCell values={r.oses} flex="0 0 58px" />
                  <MultiCell values={r.geos} flex="0 0 118px" />
                  <span style={{ flex: '0 0 60px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded }}>{r.firstSeen ? fmtShort(r.firstSeen) : '—'}</span>
                  <span style={{ flex: '0 0 92px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded }}>{r.lastAt ? fmtShortDateTime(r.lastAt) : '—'}</span>
                </div>
                {open && (
                  <div style={{ padding: '4px 14px 14px 48px', background: `${COLORS.ink}0a` }}>
                    <PlayerSummary stats={r.stats} />
                    <SessionTable plays={history} />
                    {history.length === 0 ? (
                      <p style={{ fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontStyle: 'italic', fontSize: 14, color: COLORS.faded, margin: '8px 0' }}>No completed games recorded.</p>
                    ) : (
                      <div style={{ border: `1px solid ${COLORS.ink}33`, background: COLORS.paper }}>
                        <div style={{ display: 'flex', gap: 14, fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded, padding: '8px 12px', borderBottom: `1px solid ${COLORS.ink}33` }}>
                          <span style={{ flex: 3 }}>Quiz</span>
                          <span style={{ flex: '0 0 76px', textAlign: 'right' }}>Score</span>
                          <span style={{ flex: '0 0 56px', textAlign: 'right' }}>Time</span>
                          <span style={{ flex: '0 0 78px' }}>Device</span>
                          <span style={{ flex: '0 0 78px' }}>Geo</span>
                          <span style={{ flex: '0 0 130px', textAlign: 'right' }}>Played</span>
                        </div>
                        {history.map((x, j) => (
                          <div key={`${x.quizId}-${j}`} style={{ display: 'flex', gap: 14, alignItems: 'center', fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 12, color: COLORS.ink, padding: '7px 12px', borderBottom: j < history.length - 1 ? `1px solid ${COLORS.ink}1a` : 'none' }}>
                            <span style={{ flex: 3, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <Link href={`/quiz/${encodeURIComponent(x.quizId)}`} target="_blank" style={{ color: COLORS.ink, textDecoration: 'none' }}>{x.title}</Link>
                            </span>
                            <span style={{ flex: '0 0 76px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{x.score}{x.total != null ? `/${x.total}` : ''}</span>
                            <span style={{ flex: '0 0 56px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 11, color: COLORS.faded }}>{formatClock(x.timeElapsed)}</span>
                            <span style={{ flex: '0 0 78px', fontFamily: 'DM Mono, monospace', fontSize: 10, color: x.device ? COLORS.ink : COLORS.faded }}>{x.device || '—'}</span>
                            <span style={{ flex: '0 0 78px', fontFamily: 'DM Mono, monospace', fontSize: 10, color: x.geo ? COLORS.ink : COLORS.faded }}>{x.geo || '—'}</span>
                            <span style={{ flex: '0 0 130px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 10, color: COLORS.faded }}>{fmtShortDateTime(x.createdAt)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Analytics tab: switched between Quiz Plays and Page Views. Quiz Plays has its
// own sub-toggle (All / Registered / Anonymous). Page Views has a sub-toggle
// (All / Lists / Quizzes) over the unified PageViewsPanel; quiz page views and
// the former Quiz Stats play columns are folded in there. Only one table is on
// screen at a time.
function AnalyticsPanel({ views, viewsTotal, quizStats, quizPlaysTotal, signups, anonPlayers }) {
  const [view, setView] = useState('plays');
  const [playsView, setPlaysView] = useState('all');
  const [pvView, setPvView] = useState('all');
  const regCount = (signups || []).length;
  const anonCount = (anonPlayers || []).length;
  const listCount = (views || []).length;
  const quizCount = (quizStats || []).length;
  const tabs = [
    ['plays', 'Quiz Plays', regCount + anonCount],
    ['pageviews', 'Page Views', listCount + quizCount],
  ];
  const playsSub = [
    ['all', 'All', regCount + anonCount],
    ['registered', 'Registered', regCount],
    ['anonymous', 'Anonymous', anonCount],
  ];
  const pvSub = [
    ['all', 'All', listCount + quizCount],
    ['lists', 'Lists', listCount],
    ['quizzes', 'Quizzes', quizCount],
  ];
  const subTabs = view === 'plays' ? playsSub : pvSub;
  const subActive = view === 'plays' ? playsView : pvView;
  const setSub = view === 'plays' ? setPlaysView : setPvView;
  const tabStyle = (on) => ({
    padding: '8px 14px',
    background: on ? COLORS.ember : 'transparent',
    border: `1px solid ${on ? COLORS.ember : COLORS.line}`,
    color: on ? COLORS.paper : COLORS.ink,
    fontFamily: 'DM Mono, monospace',
    fontSize: 11,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  });
  const subTabStyle = (on) => ({
    padding: '6px 12px',
    background: on ? `${COLORS.ember}1a` : 'transparent',
    border: `1px solid ${on ? COLORS.ember : COLORS.line}`,
    color: on ? COLORS.ember : COLORS.faded,
    fontFamily: 'DM Mono, monospace',
    fontSize: 10,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  });
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {tabs.map(([key, label, count]) => {
          const on = view === key;
          return (
            <button key={key} onClick={() => setView(key)} style={tabStyle(on)}>
              {label}
              <span style={{ opacity: 0.6 }}>{count}</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 22, paddingLeft: 2 }}>
        {subTabs.map(([key, label, count]) => {
          const on = subActive === key;
          return (
            <button key={key} onClick={() => setSub(key)} style={subTabStyle(on)}>
              {label}
              <span style={{ opacity: 0.6 }}>{count}</span>
            </button>
          );
        })}
      </div>
      {view === 'plays' ? (
        playsView === 'registered' ? (
          <QuizSignupsPanel signups={signups} />
        ) : playsView === 'anonymous' ? (
          <AnonPlayersPanel players={anonPlayers} />
        ) : (
          <AllPlayersPanel signups={signups} anonPlayers={anonPlayers} />
        )
      ) : (
        <PageViewsPanel lists={views} quizzes={quizStats} mode={pvView} />
      )}
    </div>
  );
}

// Research tab: the consensus-alert research queue plus editor notes, stacked.
function ResearchNotesPanel({ alerts, busy, onResolve, notes, lists, onAddNote, onDeleteNote }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      <div>
        <SectionHeading>Consensus Alerts</SectionHeading>
        <ResearchPanel alerts={alerts} busy={busy} onResolve={onResolve} />
      </div>
      <div>
        <SectionHeading>Editor Notes</SectionHeading>
        <NotesPanel notes={notes} lists={lists} busy={busy} onAdd={onAddNote} onDelete={onDeleteNote} />
      </div>
    </div>
  );
}

// Feedback tab: reader notices (complaints) and list comments, stacked.
function FeedbackPanel({ complaints, comments, busy, onDismiss, onDelete, onRespond }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      <div>
        <SectionHeading>Notices</SectionHeading>
        <ComplaintsPanel complaints={complaints} busy={busy} onDismiss={onDismiss} onRespond={onRespond} />
      </div>
      <div>
        <SectionHeading>Comments</SectionHeading>
        <CommentsPanel comments={comments} busy={busy} onDelete={onDelete} onRespond={onRespond} />
      </div>
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
        border: `1px solid ${COLORS.line}`,
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
              fontFamily: 'Manrope, system-ui, -apple-system, sans-serif',
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
              fontFamily: 'Manrope, system-ui, -apple-system, sans-serif',
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
              border: `1px solid ${COLORS.line}`,
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
            fontFamily: 'Manrope, system-ui, -apple-system, sans-serif',
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
          borderTop: `1px solid ${COLORS.line}`,
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
              border: `1px solid ${COLORS.line}`,
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
              border: `1px solid ${COLORS.line}`,
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
          fontFamily: 'Manrope, system-ui, -apple-system, sans-serif',
          fontStyle: 'italic',
          fontSize: 18,
          color: COLORS.faded,
          border: `1px dashed ${COLORS.line}`,
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
          border: `1px solid ${COLORS.line}`,
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
            fontFamily: 'Manrope, system-ui, -apple-system, sans-serif',
            fontStyle: 'italic',
            fontSize: 16,
            color: COLORS.faded,
            border: `1px dashed ${COLORS.line}`,
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
        border: `1px solid ${COLORS.line}`,
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
              fontFamily: 'Manrope, system-ui, -apple-system, sans-serif',
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
            border: `1px solid ${COLORS.line}`,
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
        border: `1px solid ${COLORS.line}`,
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
            border: `1px solid ${COLORS.line}`,
            background: COLORS.paper,
            color: COLORS.ink,
            fontFamily: 'Manrope, system-ui, -apple-system, sans-serif',
            fontSize: 16,
            outline: 'none',
          }}
        />
      ) : (
        <div
          style={{
            flex: 1,
            minWidth: 200,
            fontFamily: 'Manrope, system-ui, -apple-system, sans-serif',
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

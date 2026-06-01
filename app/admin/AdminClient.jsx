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

export default function AdminClient({ initialLists, initialExtras = [], initialComplaints = [] }) {
  const router = useRouter();
  const [lists, setLists] = useState(initialLists);
  const [extras, setExtras] = useState(initialExtras);
  const [complaints, setComplaints] = useState(initialComplaints);
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
        </div>

        {tab === 'complaints' ? (
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

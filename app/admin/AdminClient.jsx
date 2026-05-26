'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, X, Eye, EyeOff, LogOut } from 'lucide-react';
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

export default function AdminClient({ initialLists }) {
  const router = useRouter();
  const [lists, setLists] = useState(initialLists);
  const [tab, setTab] = useState('pending');
  const [busy, setBusy] = useState({});

  const filtered = useMemo(() => {
    return lists.filter((l) => (tab === 'pending' ? !l.published : l.published));
  }, [lists, tab]);

  const pendingCount = useMemo(() => lists.filter((l) => !l.published).length, [lists]);
  const publishedCount = useMemo(() => lists.filter((l) => l.published).length, [lists]);

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
        </div>

        {filtered.length === 0 ? (
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

'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SiteHeader from '../../SiteHeader';
import Grain from '../../Grain';
import Footer from '../../Footer';
import { QUIZZES } from '@/lib/quizzes';

const C = { bg: '#f7f8fa', surface: '#fff', ink: '#1c1e24', muted: '#6b7280', soft: '#9aa0ab', line: 'rgba(20,22,28,0.10)', accent: '#2563eb', accsoft: '#e8effb' };
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

function ensureAnon() {
  try {
    let a = localStorage.getItem('sot_quiz_anon');
    if (!a) { a = 'd' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36); localStorage.setItem('sot_quiz_anon', a); }
    return a;
  } catch { return null; }
}
function storedName() { try { const j = JSON.parse(localStorage.getItem('sot_quiz_identity')); return (j && j.username) || ''; } catch { return ''; } }

export default function NewDuelPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { setName(storedName()); }, []);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    const pool = QUIZZES.filter((x) => !x.unlisted);
    if (!s) return pool.slice(0, 40);
    return pool.filter((x) => (x.title || '').toLowerCase().includes(s) || (x.category || '').toLowerCase().includes(s)).slice(0, 60);
  }, [q]);

  async function start(quizId) {
    if (busy) return;
    setBusy(true);
    const anon = ensureAnon();
    const nm = (name || storedName() || 'Player').trim().slice(0, 40);
    try { const j = JSON.parse(localStorage.getItem('sot_quiz_identity')) || {}; localStorage.setItem('sot_quiz_identity', JSON.stringify({ ...j, username: nm })); } catch {}
    try {
      const r = await fetch('/api/duel/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quizId, anonId: anon, name: nm }) });
      const d = await r.json();
      if (d && d.token) { router.push(`/duel/${d.token}`); return; }
      if (d && d.error === 'duels_not_ready') { alert('Duels are being switched on. Check back shortly.'); }
    } catch {}
    setBusy(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, color: C.ink, position: 'relative' }}>
      <Grain />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <SiteHeader />
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '26px 18px 60px' }}>
          <Link href="/quizzes" style={{ fontSize: 13, fontWeight: 700, color: C.accent, textDecoration: 'none' }}>← Back to quizzes</Link>
          <div style={{ marginTop: 16, marginBottom: 4, fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: C.accent }}>Start a duel</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 6px' }}>Challenge someone to a quiz</h1>
          <p style={{ color: C.muted, fontSize: 15, margin: '0 0 20px' }}>Pick a quiz. You'll get a link to send. You both play the same quiz, and the higher score (fastest on a tie) wins.</p>

          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.soft, marginBottom: 6 }}>YOUR NAME</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={40}
            style={{ width: '100%', boxSizing: 'border-box', padding: '11px 13px', border: `1px solid ${C.line}`, borderRadius: 10, fontFamily: FONT, fontSize: 14, marginBottom: 16, outline: 'none' }} />

          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.soft, marginBottom: 6 }}>PICK A QUIZ</label>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search quizzes…" autoFocus
            style={{ width: '100%', boxSizing: 'border-box', padding: '11px 13px', border: `1px solid ${C.line}`, borderRadius: 10, fontFamily: FONT, fontSize: 14, marginBottom: 12, outline: 'none' }} />

          <div style={{ display: 'grid', gap: 8 }}>
            {results.map((x) => (
              <button key={x.id} onClick={() => start(x.id)} disabled={busy}
                style={{ textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, padding: '12px 14px', cursor: busy ? 'default' : 'pointer', fontFamily: FONT }}>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.title}</span>
                  <span style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: C.soft }}>{x.category || 'Quiz'}</span>
                </span>
                <span style={{ flex: 'none', fontSize: 12, fontWeight: 800, color: '#fff', background: C.accent, padding: '6px 12px', borderRadius: 999 }}>Challenge</span>
              </button>
            ))}
            {results.length === 0 && <div style={{ color: C.soft, fontSize: 14, padding: '8px 2px' }}>No quizzes match that search.</div>}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SiteHeader from '../../SiteHeader';
import QuizPlayerBar from '../../quiz/[id]/QuizPlayerBar';
import Grain from '../../Grain';
import Footer from '../../Footer';
import DuelSignup from '../DuelSignup';
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
  const [oppQ, setOppQ] = useState('');
  const [oppResults, setOppResults] = useState([]);
  const [opp, setOpp] = useState(null);
  const [myAnon, setMyAnon] = useState('');
  const [device, setDevice] = useState('any');
  const [signupOpen, setSignupOpen] = useState(false);
  const [pendingQuiz, setPendingQuiz] = useState(null);

  useEffect(() => {
    setMyAnon(ensureAnon() || '');
    const local = storedName();
    if (local) { setName(local); return; }
    // No local identity (new browser, or Safari evicted localStorage): restore it
    // from the durable server session so a returning player isn't re-prompted to
    // claim a name they already have.
    fetch('/api/quiz/session', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d && d.username) {
          try { const j = JSON.parse(localStorage.getItem('sot_quiz_identity')) || {}; localStorage.setItem('sot_quiz_identity', JSON.stringify({ ...j, username: d.username, email: d.email || j.email })); } catch (e) {}
          setName(d.username);
        }
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    try { const p = new URLSearchParams(window.location.search); const oa = p.get('opponent'); const on = p.get('oppName'); if (oa) setOpp({ anon: oa, name: on || 'Player' }); const qz = p.get('quiz'); if (qz) { const fq = QUIZZES.find((x) => x.id === qz); if (fq) setQ(fq.title || ''); } } catch {}
  }, []);
  useEffect(() => {
    let alive = true; const s = oppQ.trim(); if (opp) return;
    const t = setTimeout(() => {
      fetch(`/api/duel/players?q=${encodeURIComponent(s)}&exclude=${encodeURIComponent(myAnon)}`)
        .then((r) => r.json()).then((d) => { if (alive && d && Array.isArray(d.players)) setOppResults(d.players); }).catch(() => {});
    }, 220);
    return () => { alive = false; clearTimeout(t); };
  }, [oppQ, opp, myAnon]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    const pool = QUIZZES.filter((x) => !x.unlisted);
    if (!s) return pool.slice(0, 40);
    return pool.filter((x) => (x.title || '').toLowerCase().includes(s) || (x.category || '').toLowerCase().includes(s)).slice(0, 60);
  }, [q]);

  async function start(quizId) {
    if (busy) return;
    // A duel name is never free text: guests must claim a display name first.
    const nm = (name || storedName() || '').trim().slice(0, 40);
    if (!nm) { setPendingQuiz(quizId); setSignupOpen(true); return; }
    setBusy(true);
    const anon = ensureAnon();
    try {
      const body = { quizId, anonId: anon, name: nm, device };
      if (opp && opp.anon) { body.opponentAnon = opp.anon; body.opponentName = opp.name; }
      const r = await fetch('/api/duel/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json();
      if (d && d.token) { router.push(`/duel/${d.token}`); return; }
      if (d && d.error === 'duels_not_ready') { alert('Duels are being switched on. Check back shortly.'); }
    } catch {}
    setBusy(false);
  }

  const inp = { width: '100%', boxSizing: 'border-box', padding: '11px 13px', border: `1px solid ${C.line}`, borderRadius: 10, fontFamily: FONT, fontSize: 14, outline: 'none' };
  const devOpts = [{ v: 'any', l: 'Any Device' }, { v: 'mobile', l: 'Mobile Only' }, { v: 'desktop', l: 'Desktop Only' }];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, color: C.ink, position: 'relative' }}>
      <Grain />
      {signupOpen && <DuelSignup anonId={myAnon} onClose={() => { setSignupOpen(false); setPendingQuiz(null); }} onDone={(un) => { setName(un); setSignupOpen(false); const pq = pendingQuiz; setPendingQuiz(null); if (pq) start(pq); }} />}
      <SiteHeader active="quizzes" flush inlay={<QuizPlayerBar />} />
      <div className="qzf-w" style={{ maxWidth: 1180, margin: '0 auto', padding: '12px 38px 70px', position: 'relative' }}>
        <div className="qzf-line" aria-hidden="true" />
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <Link href="/quizzes" style={{ fontSize: 13, fontWeight: 700, color: C.accent, textDecoration: 'none' }}>← Back to Quizzes</Link>
          <div style={{ marginTop: 16, marginBottom: 4, fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: C.accent }}>Start a duel</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 6px' }}>Challenge Someone to a Quiz</h1>
          <p style={{ color: C.muted, fontSize: 15, margin: '0 0 20px' }}>Pick a quiz. Challenge a specific player by name, or just share the invite link with anyone. Higher score wins (fastest on a tie).</p>

          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.soft, marginBottom: 6 }}>YOUR NAME</label>
          {name ? (
            <div style={{ background: C.accsoft, border: `1px solid #cddffb`, borderRadius: 10, padding: '11px 14px', marginBottom: 16, fontSize: 14, color: C.ink }}>Dueling as <span style={{ fontWeight: 800, color: C.accent }}>{name}</span></div>
          ) : (
            <>
              <button onClick={() => setSignupOpen(true)} style={{ width: '100%', boxSizing: 'border-box', textAlign: 'left', background: '#fff', color: C.accent, border: `1.5px solid ${C.accent}`, borderRadius: 10, padding: '11px 14px', marginBottom: 6, fontFamily: FONT, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>Claim a display name to duel +</button>
              <p style={{ color: C.soft, fontSize: 12, margin: '0 0 16px' }}>Duels are not anonymous: claim a display name so no one can play under someone else{"'"}s name. Takes a moment, no password.</p>
            </>
          )}

          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.soft, marginBottom: 6 }}>CHALLENGE A SPECIFIC PLAYER (OPTIONAL)</label>
          {opp ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: C.accsoft, border: `1px solid #cddffb`, borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>Challenging <span style={{ color: C.accent }}>{opp.name}</span> — they get a pop-up to play</span>
              <button onClick={() => { setOpp(null); setOppQ(''); }} style={{ border: 'none', background: 'transparent', color: C.accent, fontWeight: 800, cursor: 'pointer', fontFamily: FONT, fontSize: 13 }}>Clear</button>
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <input value={oppQ} onChange={(e) => setOppQ(e.target.value)} placeholder="Search players by name (or leave blank for a shareable link)…" style={inp} />
              {oppQ.trim() && (
                <div style={{ marginTop: 6, border: `1px solid ${C.line}`, borderRadius: 10, overflow: 'hidden', maxHeight: 220, overflowY: 'auto' }}>
                  {oppResults.length === 0 && <div style={{ padding: '10px 14px', color: C.soft, fontSize: 13 }}>No players match. You can still share the invite link.</div>}
                  {oppResults.map((p) => (
                    <button key={p.anon} onClick={() => setOpp(p)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', borderBottom: `1px solid ${C.line}`, background: '#fff', cursor: 'pointer', fontFamily: FONT, fontSize: 14, fontWeight: 600, color: C.ink }}>{p.name}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.soft, marginBottom: 6 }}>DEVICE (KEEP IT FAIR)</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            {devOpts.map((o) => (
              <button key={o.v} onClick={() => setDevice(o.v)} style={{ flex: '1 1 120px', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${device === o.v ? C.accent : C.line}`, background: device === o.v ? C.accent : '#fff', color: device === o.v ? '#fff' : C.ink, fontFamily: FONT, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>{o.l}</button>
            ))}
          </div>
          <p style={{ color: C.soft, fontSize: 12, margin: '0 0 18px' }}>Playing on a computer is a big advantage on many quizzes. Require the same device so it{"'"}s a fair fight (for example, mobile vs mobile).</p>

          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.soft, marginBottom: 6 }}>PICK A QUIZ{opp ? ` TO CHALLENGE ${opp.name.toUpperCase()}` : ''}</label>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search quizzes…" style={{ ...inp, marginBottom: 12 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
            {results.map((x) => (
              <button key={x.id} onClick={() => start(x.id)} disabled={busy}
                style={{ textAlign: 'left', display: 'flex', minWidth: 0, alignItems: 'center', justifyContent: 'space-between', gap: 10, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, padding: '12px 14px', cursor: busy ? 'default' : 'pointer', fontFamily: FONT }}>
                <span style={{ minWidth: 0, overflow: 'hidden' }}>
                  <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: C.ink, overflowWrap: 'anywhere' }}>{x.title}</span>
                  <span style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: C.soft }}>{x.category || 'Quiz'}</span>
                </span>
                <span style={{ flex: 'none', fontSize: 12, fontWeight: 800, color: '#fff', background: C.accent, padding: '6px 12px', borderRadius: 999 }}>Click to Challenge</span>
              </button>
            ))}
            {results.length === 0 && <div style={{ color: C.soft, fontSize: 14, padding: '8px 2px' }}>No quizzes match that search.</div>}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

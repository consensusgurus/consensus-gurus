'use client';
import { useState, useEffect } from 'react';
import QuizCommandHeader from './QuizCommandHeader';

// Self-contained command-bar header for the inner quiz surfaces (individual
// quiz boards, Challenge, Duel, Business News, Stat Hub). Same full-bleed bar
// as the /quizzes home, minus the search box and the live ticker tape — those
// stay on the quizzes main page only. Fetches the player identity itself and
// hosts its own sign-up modal, so it drops straight in wherever the old
// SiteHeader + QuizPlayerBar casing used to live. Page content widths below it
// are unchanged; this only swaps the header chrome.
//
// The search box is hidden here with a scoped rule (`.qnh-wrap .qch-search`)
// rather than a QuizCommandHeader prop, so the shared header component stays
// untouched. No ticker is passed, so the ticker tape never renders.
const ACCENT = '#0e1d40', INK = '#1c1e24', MUTED = '#262b35', SOFT = '#aeb4bd', LINE = 'rgba(20,22,28,0.30)';
const MODAL_FONT = "'Manrope', system-ui, -apple-system, sans-serif";
const NOOP = () => {};

function getAnonId() { try { return localStorage.getItem('sot_quiz_anon'); } catch { return null; } }
function ensureAnonId() {
  try {
    let a = localStorage.getItem('sot_quiz_anon');
    if (!a) { a = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `a_${Date.now()}_${Math.random().toString(36).slice(2)}`; localStorage.setItem('sot_quiz_anon', a); }
    return a;
  } catch { return null; }
}
function getIdentity() { try { return JSON.parse(localStorage.getItem('sot_quiz_identity')); } catch { return null; } }

// Same join flow as QuizPlayerBar's modal: posts to /api/quiz/join, stores the
// identity, and reloads so every surface picks up the signed-in state.
function SignupModal({ onClose }) {
  const [u, setU] = useState('');
  const [em, setEm] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const inp = { width: '100%', boxSizing: 'border-box', border: `1px solid ${LINE}`, borderRadius: 10, padding: '11px 13px', fontFamily: 'inherit', fontSize: 15, color: INK, outline: 'none' };
  async function submit() {
    setErr('');
    if (!u.trim()) { setErr('Pick a display name'); return; }
    setBusy(true);
    try {
      const r = await fetch('/api/quiz/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u.trim(), email: em.trim() || undefined, anonId: ensureAnonId() }) });
      const d = await r.json();
      if (d && d.username) {
        try { localStorage.setItem('sot_quiz_identity', JSON.stringify({ username: d.username, email: d.email || undefined })); } catch (e) {}
        window.location.reload();
      } else { setErr((d && d.error) || 'Could not sign up. Try again.'); setBusy(false); }
    } catch (e) { setErr('Could not sign up. Try again.'); setBusy(false); }
  }
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(20,22,28,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 380, maxWidth: '100%', background: '#fff', borderRadius: 14, border: `1px solid ${LINE}`, padding: 22, fontFamily: MODAL_FONT }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: INK }}>Claim your name</div>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: SOFT, display: 'flex', fontSize: 20, lineHeight: 1 }}>&times;</button>
        </div>
        <p style={{ fontSize: 13, color: MUTED, margin: '0 0 16px', lineHeight: 1.5 }}>Pick a display name to appear on the leaderboards. Email is optional, only used to recover your name on another device. No password needed.</p>
        {err && <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.4)', color: '#c0392b', fontSize: 13 }}>{err}</div>}
        <input value={u} onChange={(e) => setU(e.target.value)} placeholder="Display name" maxLength={15} autoCapitalize="none" autoCorrect="off" spellCheck={false} style={inp} />
        <input value={em} onChange={(e) => setEm(e.target.value)} placeholder="Email (optional)" maxLength={120} type="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} style={{ ...inp, marginTop: 10 }} />
        <button onClick={submit} disabled={busy} style={{ marginTop: 16, width: '100%', background: ACCENT, color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontFamily: 'inherit', fontWeight: 700, fontSize: 14, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1 }}>{busy ? 'Joining…' : 'Join the leaderboard'}</button>
      </div>
    </div>
  );
}

export default function QuizNavHeader() {
  const [me, setMe] = useState(null);
  const [signupOpen, setSignupOpen] = useState(false);
  useEffect(() => {
    const ident = getIdentity();
    const anonId = getAnonId();
    const email = ident && ident.email ? ident.email : '';
    const params = new URLSearchParams();
    if (anonId) params.set('anonId', anonId);
    if (email) params.set('email', email);
    fetch(`/api/quiz/me?${params.toString()}`).then((r) => r.json()).then((d) => setMe(d || null)).catch(() => setMe(null));
  }, []);
  return (
    <>
      <div className="qnh-wrap">
        <style>{`.qnh-wrap .qch-search,.qnh-wrap .qch-searchbtn{display:none !important;}`}</style>
        <QuizCommandHeader me={me} search="" onSearch={NOOP} onSignup={() => setSignupOpen(true)} />
      </div>
      {signupOpen && <SignupModal onClose={() => setSignupOpen(false)} />}
    </>
  );
}

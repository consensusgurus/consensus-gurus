'use client';
import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';

// Shared "Join the Leaderboard" sign-up form for every quiz board. Self-manages
// its name/email fields (email optional, display name capped at 15). onJoined(id)
// fires after a successful join so the board can update its own identity and
// navigate; onViewLeaderboard switches to the leaderboard tab.
const C = { ember: '#0e1d40', ink: '#1c1e24', faded: '#6b7280', forest: '#10b981' };
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const labelStyle = { display: 'block', fontFamily: FONT, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.faded, marginBottom: 6 };
const fieldStyle = { width: '100%', fontFamily: FONT, fontSize: 16, padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.ink}`, background: '#fff', color: C.ink, boxSizing: 'border-box' };

function getAnonId() {
  if (typeof window === 'undefined') return null;
  try {
    let a = localStorage.getItem('sot_quiz_anon');
    if (!a) {
      a = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `a_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('sot_quiz_anon', a);
    }
    return a;
  } catch (e) { return null; }
}

export default function JoinLeaderboardForm({ identity, onJoined, onViewLeaderboard, heading = 'Join the Leaderboard', hideIcon = false }) {
  const [jName, setJName] = useState(identity ? identity.username || '' : '');
  const [jEmail, setJEmail] = useState(identity ? identity.email || '' : '');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (identity) { setJName(identity.username || ''); setJEmail(identity.email || ''); } }, [identity]);

  async function submit() {
    setErr(false);
    if (!jName.trim() || jName.trim().length > 15) { setErr(true); setMsg('Pick a display name (max 15 characters).'); return; }
    if (jEmail.trim() && !EMAIL_RE.test(jEmail.trim())) { setErr(true); setMsg('Enter a valid email or leave it blank.'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/quiz/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: jName.trim(), email: jEmail.trim() || undefined, anonId: getAnonId() }) });
      const d = await res.json();
      if (d.error) { setErr(true); setMsg(d.error); setBusy(false); return; }
      const id = { username: d.username, email: d.email };
      try { localStorage.setItem('sot_quiz_identity', JSON.stringify(id)); } catch (e) {}
      setErr(false);
      setMsg(`You're in. "${d.username}" is on the leaderboard, including any games you already finished.`);
      if (onJoined) onJoined(id);
      // On a daily-game page, loop the newly-registered player back to that
      // game's leaderboard so they see their score land. No-op elsewhere (the
      // /quiz join tab has no #daily-leaderboard; onJoined handles navigation).
      try {
        if (typeof document !== 'undefined') {
          const lb = document.getElementById('daily-leaderboard');
          if (lb) setTimeout(() => { lb.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
        }
      } catch (e) {}
    } catch (e) {
      setErr(true); setMsg('Could not join right now. Try again.');
    }
    setBusy(false);
  }

  return (
    <div id="daily-join" style={{ maxWidth: 440, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        {!hideIcon && <Trophy size={22} strokeWidth={2.2} style={{ color: C.ember }} />}
        <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 26, margin: 0, color: C.ink }}>{heading}</h2>
      </div>
      <p style={{ fontFamily: FONT, fontSize: 15, color: '#4a4339', margin: '0 0 6px' }}>
        Sign Up with a display name and it appears on the leaderboard after you finish a game. No password needed.
      </p>
      <p style={{ fontFamily: FONT, fontSize: 12, color: C.faded, margin: '0 0 22px' }}>
        Your display name is shown publicly. Email is optional, required only for prizes, and kept private.
      </p>
      <label style={labelStyle}>Display name</label>
      <input value={jName} onChange={(e) => setJName(e.target.value)} maxLength={15} placeholder="e.g. dealwatcher" autoCapitalize="none" autoCorrect="off" spellCheck={false} style={fieldStyle} />
      <label style={{ ...labelStyle, marginTop: 16 }}>Email (optional, required for prizes)</label>
      <input value={jEmail} onChange={(e) => setJEmail(e.target.value)} type="email" placeholder="you@email.com (optional)" autoCapitalize="none" autoCorrect="off" spellCheck={false} style={fieldStyle} />
      <button onClick={submit} disabled={busy} style={{ marginTop: 22, width: '100%', fontFamily: FONT, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, lineHeight: '48px', border: 'none', background: '#e8b43a', color: '#1c1e24', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1 }}>
        {busy ? 'Joining…' : identity ? 'Update my name' : 'Join the leaderboard'}
      </button>
      {msg && (<p style={{ fontFamily: FONT, fontSize: 12, marginTop: 14, color: err ? C.ember : C.forest }}>{msg}</p>)}
      {identity && !msg && (<p style={{ fontFamily: FONT, fontSize: 12, marginTop: 14, color: C.faded }}>You're signed up as "{identity.username}". Finish a game to post your score.</p>)}
      {onViewLeaderboard && (
        <button onClick={onViewLeaderboard} style={{ marginTop: 18, background: 'transparent', border: 'none', color: C.faded, cursor: 'pointer', fontFamily: FONT, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'underline', padding: 0 }}>
          View the leaderboard →
        </button>
      )}
    </div>
  );
}

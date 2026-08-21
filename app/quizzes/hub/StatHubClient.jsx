'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, BadgeCheck, User, ListChecks, Flame, FunctionSquare, Clock, Trophy, RefreshCw, Share2, Download, UserPlus, Play, X, Check, Star, Swords, ChevronDown, Crown, Target, ArrowUpRight, CalendarDays, Award,} from 'lucide-react';
import { QUIZZES, getQuiz } from '@/lib/quizzes';
import { DAILY_GAMES, DAILY_DATED_RE, dailyLabel, dailyDept } from '@/lib/daily-games';
import { quizDept as deptOf, DEPT_COLOR, DEPT_LABEL, DEPT_NAV } from '@/lib/quiz-departments';
import { CHALLENGES, getChallenge, DEFAULT_CHALLENGE_ID, challengeQuizIds, challengeColumns, dailyChallengeId, challengeMenu } from '@/lib/challenges';
import QuizNavHeader from '../QuizNavHeader';
import DailyCombinedLeaderboard from '../../quiz/[id]/DailyCombinedLeaderboard';
import Grain from '../../Grain';
import Footer from '../../Footer';
import { withRef } from '@/lib/referrals';
import { Metric, CategoryView, ActivityFeed, XpPanel, TrophyCase } from '../../player/ProfileShared';
import { T } from '@/lib/theme';
import SigninHelp, { isLockedOut } from '../../SigninHelp';
import MindLoftMark from '../../MindLoftMark';

const C = {
  bg: T.white, surface: T.white, ink: T.ink, muted: T.muted,
  soft: T.muted, line: 'rgba(20,22,28,0.30)', accent: T.accent,
  accsoft: '#e8effb', live: '#047857', danger: T.danger,
};
const MEDAL = [T.gold, '#b8bcc4', '#c8814b'];
const MEDAL_INK = ['#8a5300', '#5b6472', '#8a4f24'];
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";
const MEDAL_BG = ['#fbf2dc', '#eef0f2', '#f6e9df'];
// Rank bubble. #1/#2/#3 render in gold/silver/bronze; everything else accent blue.
// RankChip, Metric, ChipMetric, CAT_COLS, completedPct, CategoryView,
// ActivityFeed, XpPanel, and the new TrophyCase moved to
// app/player/ProfileShared.jsx (2026-07-31), shared with the public
// /player/[name] profile page. Imported above; edit them THERE.

function cleanTitle(t) { return (t || '').replace(/^Name (the )?/i, '').trim(); }
function getAnonId() { if (typeof window === 'undefined') return null; try { return localStorage.getItem('sot_quiz_anon'); } catch { return null; } }
function getIdentity() { if (typeof window === 'undefined') return null; try { return JSON.parse(localStorage.getItem('sot_quiz_identity')); } catch { return null; } }
function getEmail() { const j = getIdentity(); return (j && j.email) || ''; }
function mmss(s) { if (!Number.isFinite(s)) return '—'; const m = Math.floor(s / 60); const sec = Math.round(s % 60); return `${m}:${String(sec).padStart(2, '0')}`; }


// Brand mark (gradient ids suffixed per render so multiple instances stay unique).
let __logoSeq = 0;
// Aggregate play-time, big-number friendly: seconds -> "2mo 3d 5h 12m" (30-day
// months). Always shows at least minutes so it never renders empty.
function fmtPlayTime(totalSec) {
  let s = Math.max(0, Math.round(Number(totalSec) || 0));
  const mo = Math.floor(s / (30 * 86400)); s -= mo * 30 * 86400;
  const d = Math.floor(s / 86400); s -= d * 86400;
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60);
  const parts = [];
  if (mo) parts.push(`${mo}mo`);
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(' ');
}

function Logo({ size = 22 }) {
  return <MindLoftMark size={size} />;
}

// eslint-disable-next-line no-unused-vars -- size default kept at 22

const TABS = [
  { t: 'player', label: 'Player', Icon: User },
  { t: 'daily', label: 'Daily Puzzles', Icon: CalendarDays },
  { t: 'quizzes', label: 'Quizzes', Icon: ListChecks },
  { t: 'challenges', label: 'Challenges', Icon: Flame },
  { t: 'duels', label: 'Duels', Icon: Swords },];

// Share Stats: a shareable player card (overall rank, level + tier + IQ Points,
// completed/correct/accuracy with their ranks, top-3 categories) plus a copy
// link to this player's Stat Hub profile (?player=<key>).
// Sign-up popup (mirrors the Browse Quizzes one): claim a display name (email
// optional) so the player's name shows on the leaderboards.
function SignupModal({ onClose }) {
  const [u, setU] = useState('');
  const [em, setEm] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const inp = { width: '100%', boxSizing: 'border-box', border: `1px solid ${C.line}`, borderRadius: 10, padding: '11px 13px', fontFamily: FONT, fontSize: 15, color: C.ink, outline: 'none' };
  async function submit() {
    setErr('');
    if (!u.trim()) { setErr('Pick a display name'); return; }
    setBusy(true);
    try {
      const r = await fetch('/api/quiz/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u.trim(), email: em.trim() || undefined, anonId: getAnonId() }) });
      const d = await r.json();
      if (d && d.username) {
        try { localStorage.setItem('sot_quiz_identity', JSON.stringify({ username: d.username, email: d.email || undefined })); } catch (e) {}
        window.location.reload();
      } else { setErr((d && d.error) || 'Could not sign up. Try again.'); setBusy(false); }
    } catch (e) { setErr('Could not sign up. Try again.'); setBusy(false); }
  }
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(20,22,28,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: FONT }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 380, maxWidth: '100%', background: T.white, borderRadius: 14, border: `1px solid ${C.line}`, padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>Claim your name</div>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: C.soft, display: 'flex' }}><X size={18} /></button>
        </div>
        <p style={{ fontSize: 13, color: C.muted, margin: '0 0 16px', lineHeight: 1.5 }}>Pick a display name to appear on the leaderboards. Email is optional, only used to recover your name on another device. No password needed.</p>
        {err && <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.4)', color: T.danger, fontSize: 13 }}>{err}</div>}
        <input value={u} onChange={(e) => setU(e.target.value)} placeholder="Display name" maxLength={15} style={inp} />
        <input value={em} onChange={(e) => setEm(e.target.value)} placeholder="Email (optional)" maxLength={120} style={{ ...inp, marginTop: 10 }} />
        <button onClick={submit} disabled={busy} style={{ marginTop: 16, width: '100%', background: C.accent, color: T.white, border: 'none', borderRadius: 10, padding: '12px', fontFamily: FONT, fontWeight: 700, fontSize: 14, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1 }}>{busy ? 'Joining…' : 'Join the leaderboard'}</button>
        <SigninHelp name={u} email={em} prominent={isLockedOut(err)} />
      </div>
    </div>
  );
}

function ShareStatsModal({ profile, byKey, onClose }) {
  const [copied, setCopied] = useState(false);
  const a = profile.activity || {};
  const r = profile.ranks || {};
  const cats3 = Object.entries(profile.byCategory || {})
    .filter(([, v]) => (v.matches || 0) > 0)
    .sort((x, y) => (y[1].xp || 0) - (x[1].xp || 0))
    .slice(0, 3);
  const maxR = cats3.length ? Math.max(...cats3.map(([, v]) => v.xp || 0), 1) : 1;
  const label = (k) => (byKey && byKey[k] && byKey[k].label) || k;
  function copy() {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mindloftdaily.com';
    const url = withRef(!profile.isAnon && profile.name
      ? `${origin}/player/${encodeURIComponent(profile.name)}`
      : `${origin}/quizzes/hub?player=${encodeURIComponent(profile.userKey || '')}`);
    if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }).catch(() => {});
  }
  const cell = { background: C.bg, borderRadius: 12, padding: '12px 13px' };
  const lbl = { fontFamily: FONT, fontWeight: 700, fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase', color: C.muted };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(20,22,28,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: FONT }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 440, maxWidth: '100%', background: T.white, borderRadius: 16, border: `1px solid ${C.line}`, overflow: 'hidden', color: C.ink }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${C.line}` }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Logo size={20} /><span style={{ fontWeight: 800, fontSize: 14 }}>Mind Loft</span></span>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: C.soft, display: 'flex' }}><ArrowLeft size={0} /><span style={{ fontSize: 20, lineHeight: 1 }}>&times;</span></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 18px 12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.name}</div>
            <div style={{ marginTop: 5 }}><span style={{ background: profile.tierBg || C.bg, color: profile.tierFg || C.muted, fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>{(profile.tier || '').replace(/ Tier$/, '')}</span> <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Level {profile.level || 1} · {Number(profile.xp || 0).toLocaleString()} IQ</span></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={lbl}>Overall rank</div>
            <div style={{ fontSize: 38, fontWeight: 800, color: C.accent, lineHeight: 0.95 }}>{profile.rank ? `#${profile.rank}` : '—'}</div>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{profile.totalPlayers ? `of ${profile.totalPlayers.toLocaleString()} players` : ''}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9, padding: '0 18px 4px' }}>
          <div style={cell}><div style={lbl}>Completed</div><div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}><span style={{ fontSize: 21, fontWeight: 800 }}>{a.completed != null ? a.completed : '—'}</span>{r.completed ? <span style={{ background: C.accsoft, color: C.accent, fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 5 }}>#{r.completed}</span> : null}</div></div>
          <div style={cell}><div style={lbl}>Correct</div><div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}><span style={{ fontSize: 21, fontWeight: 800 }}>{a.correct != null ? a.correct.toLocaleString() : '—'}</span>{r.correct ? <span style={{ background: C.accsoft, color: C.accent, fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 5 }}>#{r.correct}</span> : null}</div></div>
          <div style={cell}><div style={lbl}>Accuracy</div><div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}><span style={{ fontSize: 21, fontWeight: 800 }}>{a.accuracy != null ? `${a.accuracy}%` : '—'}</span>{r.accuracy ? <span style={{ background: C.accsoft, color: C.accent, fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 5 }}>#{r.accuracy}</span> : null}</div></div>
        </div>
        {cats3.length ? (
          <div style={{ padding: '14px 18px 4px' }}>
            <div style={{ ...lbl, marginBottom: 10 }}>Top categories</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cats3.map(([k, v]) => (
                <div key={k}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}><span style={{ fontSize: 12.5, fontWeight: 700 }}>{label(k)}</span><span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>{Number(v.xp || 0).toLocaleString()} IQ</span></div>
                  <div style={{ height: 8, background: C.bg, borderRadius: 5, overflow: 'hidden' }}><div style={{ width: `${Math.round(((v.xp || 0) / maxR) * 100)}%`, height: '100%', background: C.accent }} /></div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div style={{ display: 'flex', gap: 9, padding: '16px 18px 18px' }}>
          <button onClick={copy} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: C.accent, color: T.white, border: 'none', borderRadius: 10, padding: '11px 14px', fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}><Share2 size={15} strokeWidth={2.4} /> {copied ? 'Link copied!' : 'Copy share link'}</button>
          <a href={`/api/quiz/share-card?key=${encodeURIComponent(profile.userKey || '')}`} target="_blank" rel="noopener noreferrer" download="source-of-truths-stats.png" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${C.line}`, background: T.white, color: C.ink, borderRadius: 10, padding: '11px 14px', fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: 'pointer', textDecoration: 'none' }}><Download size={15} strokeWidth={2.4} /> Image</a>
          <button onClick={onClose} style={{ border: `1px solid ${C.line}`, background: T.white, color: C.ink, borderRadius: 10, padding: '11px 16px', fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Duels tab ──────────────────────────────────────────────────────────────
// Shared bits for the Duel Arena: initials avatars, last-5 form dots, and the
// win-rate ring. All derive from data the ladder/list APIs already return.
function initialsOf(name) {
  const s = String(name || '').trim();
  if (!s) return '?';
  const parts = s.split(/[\s_-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return s.slice(0, 2).toUpperCase();
}
function duelStreakOf(matches) {
  const ms = matches || [];
  if (!ms.length || ms[0].result === 'tie') return null;
  let n = 0;
  for (const m of ms) { if (m.result === ms[0].result) n += 1; else break; }
  return { kind: ms[0].result, n };
}
function Avatar({ name, bg, fg, size = 34 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: Math.max(11, Math.round(size * 0.35)), flex: 'none' }}>{initialsOf(name)}</span>;
}
// Last-5 duel results as dots, oldest to newest left to right.
function FormDots({ results }) {
  const seq = (results || []).slice(0, 5).reverse();
  if (!seq.length) return null;
  return (
    <span title="Last 5 duels, oldest to newest" style={{ display: 'inline-flex', gap: 3, flex: 'none' }}>
      {seq.map((r, i) => <span key={i} className="fdot" style={{ background: r === 'win' ? C.live : r === 'loss' ? C.danger : '#cfd4dc' }} />)}
    </span>
  );
}
function WinRing({ pct, size = 40 }) {
  const r = size / 2 - 3.5;
  const circ = 2 * Math.PI * r;
  const on = (Math.max(0, Math.min(100, pct || 0)) / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ flex: 'none' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.accsoft} strokeWidth="5" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.accent} strokeWidth="5" strokeDasharray={`${on} ${circ - on}`} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>
  );
}

function DuelsPanel({ data, setData, ladder, loaded, onSelectPlayer }) {
  const [muteAll, setMuteAll] = useState(false);
  const [muted, setMuted] = useState({});
  const [openLadder, setOpenLadder] = useState(null); // anon of the expanded ladder row
  useEffect(() => {
    try { setMuteAll(localStorage.getItem('sot_duel_mute_all') === '1'); } catch {}
    try { setMuted(JSON.parse(localStorage.getItem('sot_duel_muted') || '{}') || {}); } catch {}
  }, []);
  function toggleMuteAll() { setMuteAll((v) => { const n = !v; try { localStorage.setItem('sot_duel_mute_all', n ? '1' : '0'); } catch {} return n; }); }
  function unmute(a) { setMuted((m) => { const n = { ...m }; delete n[a]; try { localStorage.setItem('sot_duel_muted', JSON.stringify(n)); } catch {} return n; }); }
  const anon = getAnonId();
  // A duel's subject is a quiz OR a dated daily puzzle, so fall through to the
  // daily label rather than printing a raw 'crux-8-15-26' at the reader.
  const qtitle = (id) => { const q = getQuiz(id); return (q && q.title) || dailyLabel(id) || id; };
  const mutedEntries = Object.entries(muted);
  const card = { background: C.surface, border: `1px solid ${C.line}`, borderRadius: 12, padding: 16, marginBottom: 14 };
  const hd = { fontSize: 13, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: C.soft, margin: '0 0 10px' };
  // The other player in a duel, from the current player's perspective.
  const iAmChallenger = (d) => (d.mine ? d.mine === 'challenger' : d.challenger_anon === anon);
  function foeName(d) { return (iAmChallenger(d) ? d.opponent_name : d.challenger_name) || null; }
  function foeAnonOf(d) { return iAmChallenger(d) ? d.opponent_anon : d.challenger_anon; }
  // Turn down an incoming challenge. Only the challenged player may decline
  // (the API rejects a challenger declining their own duel).
  async function decline(d) {
    const a = getAnonId();
    if (!a) return;
    if (typeof window !== 'undefined' && !window.confirm('Decline this duel?')) return;
    const ident = getIdentity();
    const nm = (ident && ident.username) || 'Player';
    try {
      const r = await fetch('/api/duel/decline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: d.token, anonId: a, name: nm, email: (ident && ident.email) || undefined }) });
      const j = await r.json();
      if (j && j.duel) {
        setData((prev) => ({
          yourMove: prev.yourMove.filter((x) => x.token !== d.token),
          awaiting: prev.awaiting.filter((x) => x.token !== d.token),
          completed: [j.duel, ...prev.completed],
        }));
      }
    } catch (e) {}
  }
  // Dismiss your OWN pending invite (you are the challenger). Removes it from
  // Your Move for good; the opponent turns a duel down via decline instead.
  async function cancel(d) {
    const a = getAnonId();
    if (!a) return;
    if (typeof window !== 'undefined' && !window.confirm('Dismiss this duel invite?')) return;
    try {
      const r = await fetch('/api/duel/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: d.token, anonId: a, email: getEmail() || undefined }) });
      const j = await r.json();
      if (j && j.duel) {
        setData((prev) => ({
          yourMove: prev.yourMove.filter((x) => x.token !== d.token),
          awaiting: prev.awaiting.filter((x) => x.token !== d.token),
          completed: prev.completed,
        }));
      }
    } catch (e) {}
  }
  // 'win' | 'loss' | 'tie' | 'declined-them' (they passed) | 'declined-me'
  function outcomeOf(d) {
    if (d.status === 'declined') return iAmChallenger(d) ? 'declined-them' : 'declined-me';
    if (d.winner === 'tie') return 'tie';
    return ((iAmChallenger(d) && d.winner === 'challenger') || (!iAmChallenger(d) && d.winner === 'opponent')) ? 'win' : 'loss';
  }
  function myScores(d) {
    return iAmChallenger(d) ? { my: d.challenger_score, their: d.opponent_score } : { my: d.opponent_score, their: d.challenger_score };
  }
  // My ladder entry plus what the arena hero derives from it: streak and rival.
  const mine = useMemo(() => ladder.find((p) => p.anon === anon) || null, [ladder, anon]);
  const myPos = useMemo(() => (mine ? ladder.indexOf(mine) + 1 : null), [ladder, mine]);
  const streak = useMemo(() => duelStreakOf(mine && mine.matches), [mine]);
  // Rival = the player I have faced most (2+ duels), with our head-to-head.
  const rival = useMemo(() => {
    const ms = (mine && mine.matches) || [];
    const by = new Map();
    for (const m of ms) {
      const k = m.vsAnon || `n:${m.vs}`;
      let g = by.get(k);
      if (!g) { g = { anon: m.vsAnon || null, name: m.vs, met: 0, w: 0, l: 0, t: 0 }; by.set(k, g); }
      g.met += 1;
      if (m.result === 'win') g.w += 1; else if (m.result === 'loss') g.l += 1; else g.t += 1;
    }
    let best = null;
    for (const g of by.values()) if (g.met >= 2 && (!best || g.met > best.met)) best = g;
    return best;
  }, [mine]);
  const rivalKey = useMemo(() => {
    if (!rival || !rival.anon) return null;
    const row = ladder.find((p) => p.anon === rival.anon);
    return (row && row.key) || `a:${rival.anon}`;
  }, [rival, ladder]);
  const rematchHref = (nm, a2, quizId) => (a2
    ? `/duel/new?opponent=${encodeURIComponent(a2)}&oppName=${encodeURIComponent(nm || 'Player')}${quizId ? `&quiz=${encodeURIComponent(quizId)}` : ''}`
    : '/duel/new');
  const smallBtn = (clr) => ({ background: 'transparent', border: `1px solid ${C.line}`, color: clr, borderRadius: 8, padding: '5px 12px', fontFamily: FONT, fontWeight: 700, fontSize: 12, cursor: 'pointer', flex: 'none' });
  const empty = loaded && !data.yourMove.length && !data.awaiting.length && !data.completed.length;

  // A pending duel as a VS matchup card. Cards in Your Move pulse gently.
  function MoveCard({ d, pulse }) {
    const foe = foeName(d);
    const iAmCh = iAmChallenger(d);
    return (
      <div className={pulse ? 'duelpulse' : undefined} style={{ ...card, marginBottom: 8, padding: '13px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 'none' }}>
            <Avatar name={(getIdentity() && getIdentity().username) || 'You'} bg={C.accsoft} fg={C.accent} />
            <span style={{ fontSize: 11, fontWeight: 800, color: C.soft }}>VS</span>
            <Avatar name={foe || '?'} bg="#fdeeee" fg={C.danger} />
          </span>
          <a href={`/duel/${d.token}`} style={{ flex: 1, minWidth: 150, textDecoration: 'none', color: C.ink }}>
            <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700 }}>{foe ? (iAmCh ? <>You challenged <span style={{ color: C.accent }}>{foe}</span></> : <><span style={{ color: C.accent }}>{foe}</span> challenged you</>) : 'Open invite'}</span>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{qtitle(d.quiz_id)}</span>
          </a>
          {pulse && !iAmCh ? <span style={{ flex: 'none', fontSize: 10, fontWeight: 800, letterSpacing: '.05em', background: C.accsoft, color: C.accent, borderRadius: 999, padding: '4px 10px' }}>YOUR TURN</span> : null}
          {pulse && !iAmCh ? <button onClick={() => decline(d)} style={smallBtn(C.danger)}>Decline</button> : null}
          {pulse && iAmCh ? <button onClick={() => cancel(d)} style={smallBtn(C.muted)}>Dismiss</button> : null}
          {pulse ? (
            <a href={`/duel/${d.token}`} style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, background: C.accent, color: T.white, borderRadius: 9, padding: '7px 14px', fontSize: 12.5, fontWeight: 800, textDecoration: 'none' }}><Play size={13} /> Play</a>
          ) : (
            <span style={{ flex: 'none', fontSize: 12, fontWeight: 700, color: C.soft }}>Pending</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 800 }}>Duel Arena</div>
        <a href="/duel/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.accent, color: T.white, padding: '10px 17px', borderRadius: 10, fontWeight: 800, fontSize: 13.5, textDecoration: 'none' }}><Swords size={16} /> Start a Duel</a>
      </div>

      {mine ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginBottom: 14 }}>
          <div style={{ ...card, marginBottom: 0, padding: '12px 14px' }}>
            <div className="lbl">Your Record</div>
            <div style={{ fontSize: 25, fontWeight: 800, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{mine.wins}<span style={{ color: C.soft }}>-</span>{mine.losses}{mine.ties ? <><span style={{ color: C.soft }}>-</span>{mine.ties}</> : null}</div>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginTop: 2 }}>#{myPos} on the ladder</div>
          </div>
          <div style={{ ...card, marginBottom: 0, padding: '12px 14px' }}>
            <div className="lbl">Win Rate</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <WinRing pct={mine.winPct} size={38} />
              <span>
                <span style={{ display: 'block', fontSize: 19, fontWeight: 800 }}>{mine.winPct}%</span>
                <span style={{ display: 'block', fontSize: 10.5, color: C.muted, fontWeight: 600 }}>{mine.played} duel{mine.played === 1 ? '' : 's'}</span>
              </span>
            </div>
          </div>
          <div style={{ ...card, marginBottom: 0, padding: '12px 14px' }}>
            <div className="lbl">Streak</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2 }}>
              {streak && streak.kind === 'win' && streak.n >= 2 ? <span className="flameon" style={{ display: 'inline-flex', color: '#f59008' }}><Flame size={21} /></span> : null}
              <span style={{ fontSize: 23, fontWeight: 800, color: streak ? (streak.kind === 'win' ? C.live : C.danger) : C.soft }}>{streak ? `${streak.kind === 'win' ? 'W' : 'L'}${streak.n}` : '-'}</span>
            </div>
            <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: C.soft, fontWeight: 800, letterSpacing: '.04em' }}>LAST 5</span>
              <FormDots results={(mine.matches || []).map((m) => m.result)} />
            </div>
          </div>
        </div>
      ) : (loaded && empty ? (
        <div style={{ ...card, padding: '14px 16px', color: C.muted, fontSize: 13.5, fontWeight: 600 }}>
          No duels yet. Challenge a friend or an open opponent, and your record, streak, and ladder spot show up here.
        </div>
      ) : null)}

      {rival ? (
        <div style={{ ...card, padding: '13px 14px', border: '1.5px solid #f0d9a8', background: '#fffdf5' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
              <Avatar name={rival.name} bg="#fbf2dc" fg="#a97b12" />
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 800 }}><span style={{ color: '#a97b12' }}>Your rival:</span>{' '}
                  {rivalKey ? <button onClick={() => onSelectPlayer && onSelectPlayer(rivalKey)} style={{ border: 'none', background: 'transparent', padding: 0, font: 'inherit', fontFamily: FONT, fontWeight: 800, color: C.accent, cursor: 'pointer' }}>{rival.name}</button> : rival.name}
                </span>
                <span style={{ display: 'block', fontSize: 12, color: C.muted, fontWeight: 600, marginTop: 1 }}>
                  {rival.w > rival.l ? `You lead ${rival.w}-${rival.l} all time. Keep it that way.` : rival.w < rival.l ? `You trail ${rival.w}-${rival.l} all time. One win closes the gap.` : `Dead even at ${rival.w}-${rival.l}. Next duel breaks the tie.`}
                </span>
              </span>
            </span>
            <a href={rematchHref(rival.name, rival.anon, null)} style={{ flex: 'none', fontSize: 12, fontWeight: 800, color: C.accent, border: `1px solid ${C.accent}`, borderRadius: 8, padding: '6px 13px', textDecoration: 'none' }}>Rematch</a>
          </div>
        </div>
      ) : null}

      {data.yourMove.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={hd}>Your Move · {data.yourMove.length}</div>
          {data.yourMove.map((d) => <MoveCard key={d.token} d={d} pulse />)}
        </div>
      )}
      {data.awaiting.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={hd}>Waiting on Opponent</div>
          {data.awaiting.map((d) => <MoveCard key={d.token} d={d} />)}
        </div>
      )}

      {data.completed.length > 0 && (
        <div>
          <div style={hd}>Latest Duels</div>
          <div style={{ ...card, padding: '4px 14px' }}>
            {data.completed.slice(0, 8).map((d, i, arr) => {
              const o = outcomeOf(d);
              const foe = foeName(d);
              const fa = foeAnonOf(d);
              const sc = myScores(d);
              const chip = o === 'win' ? { t: 'WON', bg: '#e6f7f0', fg: '#0b7a55' }
                : o === 'loss' ? { t: 'LOST', bg: '#fdeeee', fg: C.danger }
                : o === 'tie' ? { t: 'TIE', bg: '#eef0f2', fg: C.muted }
                : { t: 'DECLINED', bg: '#eef0f2', fg: C.soft };
              return (
                <div key={d.token} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : 'none' }}>
                  <span style={{ flex: 'none', width: 62, textAlign: 'center', fontSize: 10, fontWeight: 800, borderRadius: 6, padding: '3px 0', background: chip.bg, color: chip.fg }}>{chip.t}</span>
                  <a href={`/duel/${d.token}`} style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: C.ink }}>
                    <span style={{ flex: 'none', fontSize: 13, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                      {Number.isFinite(sc.my) && Number.isFinite(sc.their) ? <>You {sc.my} - {sc.their} </> : null}
                      <span style={{ color: C.accent }}>{foe || 'Open invite'}</span>
                    </span>
                    <span className="duelqt" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: C.soft, fontWeight: 600 }}>{qtitle(d.quiz_id)}</span>
                  </a>
                  {(o === 'win' || o === 'loss' || o === 'tie') && foe ? (
                    <a href={rematchHref(foe, fa, d.quiz_id)} style={{ flex: 'none', fontSize: 11.5, fontWeight: 800, color: C.accent, textDecoration: 'none' }}>{o === 'loss' ? 'Avenge' : 'Rematch'}</a>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {empty && (<div style={{ ...card, color: C.muted, fontSize: 14 }}>No duels yet. Challenge someone to get started.</div>)}

      <div style={card}>
        <div style={hd}>Duel Ladder</div>
        {ladder.length === 0 ? <div style={{ color: C.muted, fontSize: 13 }}>No completed duels yet.</div> : ladder.slice(0, 15).map((p, i) => {
          const matches = Array.isArray(p.matches) ? p.matches : [];
          const open = openLadder === p.anon;
          const canOpen = matches.length > 0;
          const isMe = p.anon === anon;
          const mi = i < 3 ? i : -1;
          return (
            <div key={p.anon} style={{ borderBottom: `1px solid ${C.line}`, ...(isMe ? { background: C.accsoft, margin: '0 -16px', padding: '0 16px' } : {}) }}>
              <div
                onClick={() => canOpen && setOpenLadder(open ? null : p.anon)}
                role={canOpen ? 'button' : undefined}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', cursor: canOpen ? 'pointer' : 'default' }}
              >
                <span style={{ flex: 'none', width: 25, height: 25, borderRadius: '50%', background: mi >= 0 ? MEDAL_BG[mi] : '#eef0f2', color: mi >= 0 ? MEDAL_INK[mi] : C.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11.5 }}>{i + 1}</span>
                <span
                  onClick={(e) => { e.stopPropagation(); if (onSelectPlayer) onSelectPlayer(p.key || `a:${p.anon}`); }}
                  title="View profile"
                  style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isMe ? 800 : 700, fontSize: 14, color: C.accent, cursor: 'pointer' }}
                >{p.name}{isMe ? <span style={{ fontSize: 9.5, color: C.accent, fontWeight: 800, marginLeft: 6 }}>YOU</span> : null}</span>
                <span style={{ flex: 'none', fontSize: 13, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{p.wins}-{p.losses}{p.ties ? `-${p.ties}` : ''}</span>
                <span className="lbar" style={{ flex: 'none', width: 86, height: 7, borderRadius: 999, background: isMe ? T.white : '#eef0f2', overflow: 'hidden' }}><span style={{ display: 'block', width: `${Math.max(3, Math.min(100, p.winPct || 0))}%`, height: '100%', background: C.accent, borderRadius: 999 }} /></span>
                <span style={{ flex: 'none', fontSize: 12, fontWeight: 800, color: C.muted, width: 38, textAlign: 'right' }}>{p.winPct}%</span>
                <span className="lform"><FormDots results={matches.map((m) => m.result)} /></span>
                <ChevronDown size={15} style={{ flex: 'none', color: C.soft, opacity: canOpen ? 1 : 0.25, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
              </div>
              {open && canOpen && (
                <div style={{ padding: '2px 0 10px 35px' }}>
                  {matches.map((m, j) => {
                    const won = m.result === 'win', tie = m.result === 'tie';
                    const clr = tie ? C.soft : won ? C.live : C.danger;
                    const lbl = tie ? 'Tie' : won ? 'Won' : 'Lost';
                    return (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: 12.5 }}>
                        <span style={{ flex: 'none', width: 34, fontWeight: 800, color: clr }}>{lbl}</span>
                        <span style={{ flex: 'none', color: C.muted }}>vs</span>
                        <span style={{ flex: 'none', fontWeight: 700, color: C.ink, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.vs}</span>
                        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: C.soft }}>{qtitle(m.quizId)}</span>
                        {m.my != null && m.their != null ? <span style={{ flex: 'none', fontWeight: 700, color: C.soft, fontVariantNumeric: 'tabular-nums' }}>{m.my}-{m.their}</span> : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={card}>
        <div style={hd}>Alert Settings</div>
        <label onClick={toggleMuteAll} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer', padding: '4px 0' }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Mute all duel alerts</span>
          <span style={{ width: 44, height: 26, borderRadius: 999, background: muteAll ? C.accent : '#cfd4dc', position: 'relative', flex: 'none' }}>
            <span style={{ position: 'absolute', top: 3, left: muteAll ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: T.white }} />
          </span>
        </label>
        <div style={{ fontSize: 12, color: C.soft, marginTop: 4 }}>When on, you won{"'"}t get any duel challenge pop-ups.</div>
        <div style={{ marginTop: 14, fontSize: 12, fontWeight: 800, color: C.soft, textTransform: 'uppercase', letterSpacing: '.04em' }}>Muted Players</div>
        {mutedEntries.length === 0 ? <div style={{ color: C.muted, fontSize: 13, marginTop: 6 }}>No muted players.</div> : mutedEntries.map(([a, nm]) => (
          <div key={a} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.line}` }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{nm || 'Player'}</span>
            <button onClick={() => unmute(a)} style={{ background: 'transparent', border: `1px solid ${C.accent}`, color: C.accent, borderRadius: 8, padding: '5px 12px', fontFamily: FONT, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Unmute</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StatHubClient() {
  const scope = 'all'; // category selector removed; Stat Hub always shows overall + per-category table
  const [tab, setTab] = useState('player');

  const [me, setMe] = useState(null);
  const [stats, setStats] = useState([]);     // /api/quiz/stats
  const [totals, setTotals] = useState({ byQuiz: {}, leaders: {}, leaderKeys: {}, total: 0, totalTime: 0 });
  const [shareOpen, setShareOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [board, setBoard] = useState(null); // IQ Points ranking, served top 2000 (incl. anon)
  const [boardTotal, setBoardTotal] = useState(0); // real player count; board itself is capped
  // Duel data lives at page level so the Duels nav tile can show the live
  // record, streak, and waiting-on-you badge before the tab is ever opened.
  const [duels, setDuels] = useState({ yourMove: [], awaiting: [], completed: [] });
  const [duelLadder, setDuelLadder] = useState([]);
  const [duelsLoaded, setDuelsLoaded] = useState(false);
  useEffect(() => {
    const anon = getAnonId();
    if (anon) fetch(`/api/duel/list?anonId=${encodeURIComponent(anon)}${getEmail() ? `&email=${encodeURIComponent(getEmail())}` : ''}`).then((r) => r.json()).then((d) => { if (d) setDuels({ yourMove: d.yourMove || [], awaiting: d.awaiting || [], completed: d.completed || [] }); }).catch(() => {}).finally(() => setDuelsLoaded(true));
    else setDuelsLoaded(true);
    fetch('/api/duel/ladder').then((r) => r.json()).then((d) => { if (d && Array.isArray(d.ladder)) setDuelLadder(d.ladder); }).catch(() => {});
  }, []);
  const myDuel = useMemo(() => { const a = getAnonId(); return duelLadder.find((p) => p.anon === a) || null; }, [duelLadder]);
  const myDuelStreak = useMemo(() => duelStreakOf(myDuel && myDuel.matches), [myDuel]);

  // Today's combined daily board lives at page level so the Daily Puzzles nav tile
  // can show a live number (my standing, or the field size) before the tab opens.
  const [dailyToday, setDailyToday] = useState(null);
  useEffect(() => {
    const qs = new URLSearchParams();
    const a = getAnonId(); if (a) qs.set('anonId', a);
    const em = getEmail(); if (em) qs.set('email', em);
    fetch('/api/quiz/daily-combined?' + qs.toString()).then((r) => r.json()).then((d) => { if (d && Array.isArray(d.overall)) setDailyToday(d); }).catch(() => {});
  }, []);

  const staticCatalog = useMemo(() => (QUIZZES || []).filter((q) => q && q.id).map((q) => ({
    id: q.id, title: q.navTitle || cleanTitle(q.title) || q.id, dept: deptOf(q),
  })), []);
  // Daily puzzles publish a fresh dated instance ('<key>-M-D-YY') each day. Those
  // days were hand-seeded into QUIZZES, and every game's seed eventually ran out
  // (crux stopped at 8/2/26, links at 7/25, and 15 games were never seeded at all).
  // Because this table joins FROM the catalog, a day past its cutoff vanished from
  // All Quizzes even though its plays were in /api/quiz/stats the whole time. So
  // derive any dated daily the catalog is missing from the stats payload instead:
  // each day keeps its own row, and the bank can never expire again.
  const catalog = useMemo(() => {
    const seen = new Set(staticCatalog.map((q) => q.id));
    const extra = [];
    for (const s of stats) {
      const id = s && s.quizId;
      if (!id || seen.has(id) || !DAILY_DATED_RE.test(id)) continue;
      seen.add(id);
      extra.push({ id, title: dailyLabel(id) || id, dept: dailyDept(id) });
    }
    return extra.length ? staticCatalog.concat(extra) : staticCatalog;
  }, [staticCatalog, stats]);
  const titleById = useMemo(() => Object.fromEntries(catalog.map((q) => [q.id, q.title])), [catalog]);

  const cats = useMemo(() => {
    const byDept = new Map();
    for (const q of catalog) { if (!byDept.has(q.dept)) byDept.set(q.dept, []); byDept.get(q.dept).push(q); }
    const list = [];
    for (const { id } of DEPT_NAV) if (byDept.has(id)) list.push(id);
    for (const k of byDept.keys()) if (!list.includes(k)) list.push(k);
    return list.map((key) => ({ key, label: DEPT_LABEL[key] || 'Quiz', c: (DEPT_COLOR[key] || DEPT_COLOR.misc).c, count: byDept.get(key).length }))
      .sort((a, b) => b.count - a.count);
  }, [catalog]);
  const byKey = useMemo(() => Object.fromEntries(cats.map((c) => [c.key, c])), [cats]);

  // Current player's identity, used to highlight their row in the User Base board.
  const myAnonKey = useMemo(() => { const a = getAnonId(); return a ? `a:${a}` : null; }, []);
  const myName = useMemo(() => { const id = getIdentity(); return (id && id.username) || null; }, []);

  // ── data loads ──
  useEffect(() => {
    const ident = getIdentity();
    const anonId = getAnonId();
    const email = ident && ident.email ? ident.email : '';
    if (anonId || email) {
      const params = new URLSearchParams();
      if (anonId) params.set('anonId', anonId);
      if (email) params.set('email', email);
      fetch(`/api/quiz/me?${params.toString()}`).then((r) => r.json()).then((d) => { if (d) setMe(d); }).catch(() => {});
    } else {
      setMe({ found: false });
    }
    fetch('/api/quiz/stats').then((r) => r.json()).then((d) => { if (d && Array.isArray(d.quizzes)) setStats(d.quizzes); }).catch(() => {});
    fetch('/api/quiz/totals').then((r) => r.json()).then((d) => { if (d && !d.error) setTotals({ byQuiz: d.byQuiz || {}, leaders: d.leaders || {}, leaderKeys: d.leaderKeys || {}, total: d.total || 0, totalTime: d.totalTime || 0 }); }).catch(() => {});
    fetch('/api/quiz/xp?full=1').then((r) => r.json()).then((d) => { if (d && Array.isArray(d.players)) { setBoard(d.players); setBoardTotal(d.total || d.players.length); } }).catch(() => {});
  }, []);

  // Inline player viewing: clicking a player in the ranking loads their full
  // profile in place (no page nav). null = my own stats.
  const [viewKey, setViewKey] = useState(null);
  // /quizzes/hub?tab=daily&game=<key> preselects that game's daily board.
  const [dailyGame, setDailyGame] = useState(null);
  const [viewProfile, setViewProfile] = useState(null);
  const [pview, setPview] = useState('ranking');
  useEffect(() => {
    if (!viewKey) { setViewProfile(null); return; }
    setViewProfile(null);
    let on = true;
    fetch(`/api/quiz/player?key=${encodeURIComponent(viewKey)}`).then((r) => r.json()).then((d) => { if (on) setViewProfile(d || { found: false }); }).catch(() => { if (on) setViewProfile({ found: false }); });
    return () => { on = false; };
  }, [viewKey]);
  // Deep link: /quizzes/hub?player=<key> opens that player's profile on load.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const pk = sp.get('player');
    if (pk) setViewKey(pk);
    const dg = sp.get('game');
    if (dg) setDailyGame(dg);
    const tb = sp.get('tab');
    if (tb && TABS.some((x) => x.t === tb)) setTab(tb);
    // Deep link to a sub-view of the Player tab, so a caller can land on the
    // thing its own label promised: /quizzes/hub?tab=player&pview=category is
    // where the home page's "Category mastery" link goes.
    const pv = sp.get('pview');
    if (pv && ['ranking', 'trophies', 'category', 'rating', 'activity'].includes(pv)) setPview(pv);
    // Deep link to a section within a tab (e.g. the daily-games Hall of Fame):
    // /quizzes/hub?tab=daily&section=champions scrolls the champion history in.
    // The daily leaderboard above it loads and grows after mount, so re-align a
    // few times until the section settles near the top instead of scrolling once.
    if (tb === 'daily' && sp.get('section') === 'champions') {
      let n = 0, stable = 0;
      const tick = () => {
        const el = document.getElementById('daily-champions');
        if (el) {
          el.scrollIntoView({ block: 'start' });
          if (Math.abs(el.getBoundingClientRect().top) < 44) { if (++stable >= 3) return; } else stable = 0;
        }
        if (n++ < 22) setTimeout(tick, 180);
      };
      setTimeout(tick, 220);
    }
  }, []);
  // Opening a player from any board: your own name collapses back to your
  // stats; a REGISTERED player navigates to their public /player/<name> page;
  // a guest (no public URL) opens in place, as before.
  const openPlayer = (k) => {
    const mine = (me && me.userKey && k === me.userKey) || (myAnonKey && k === myAnonKey);
    if (mine) { setViewKey(null); setPview('ranking'); setTab('player'); return; }
    const row = board && board.find((p) => p.userKey === k);
    if (row && !row.isAnon && row.name) { window.location.href = `/player/${encodeURIComponent(row.name)}`; return; }
    setViewKey(k); setPview('category'); setTab('player');
  };
  const viewing = !!viewKey;
  const profile = viewing ? viewProfile : me;
  const found = profile && profile.found;
  const statBarMe = profile == null ? undefined : (profile.found ? { ...profile, signed: !profile.isAnon } : { found: false });
  const bestCat = useMemo(() => {
    const bc = profile && profile.byCategory;
    if (!bc) return null;
    // Best category = where the player ranks highest on COMPLETED; ties break to
    // IQ Points rank in that category, then to played rank.
    let best = null;
    for (const k of Object.keys(bc)) {
      const c = bc[k];
      if (!c || !(c.matches > 0)) continue;
      const cand = { key: k, rank: c.completedRank ?? c.rank, catTotal: c.catTotal,
        cR: c.completedRank ?? Infinity, sR: c.rank ?? Infinity, pR: c.playedRank ?? Infinity };
      if (!best || cand.cR < best.cR
          || (cand.cR === best.cR && cand.sR < best.sR)
          || (cand.cR === best.cR && cand.sR === best.sR && cand.pR < best.pR)) best = cand;
    }
    return best;
  }, [profile]);
  const tierLabel = profile && profile.tier ? profile.tier : 'Unrated';
  const tierBg = profile && profile.tierBg ? profile.tierBg : T.paper;
  const tierFg = profile && profile.tierFg ? profile.tierFg : C.muted;

  const statsById = useMemo(() => Object.fromEntries(stats.map((s) => [s.quizId, s])), [stats]);
  const totalPlays = useMemo(() => stats.reduce((a, s) => a + (s.plays || 0), 0), [stats]);

  const playerBarRef = useRef(null);
  const bestCatRef = useRef(null);
  useEffect(() => {
    const bar = playerBarRef.current;
    if (!bar) return;
    let lastW = -1;
    const evaluate = () => {
      const w = bar.clientWidth;
      if (w === lastW) return;
      lastW = w;
      const el = bestCatRef.current;
      if (el) el.style.display = '';
      const maxRows = w <= 560 ? 2 : 1;
      // Count visual rows by each child's vertical CENTER: with align-items:center
      // all items on one flex line share a center, so this is robust to the
      // differing item heights that make raw offsetTop read as multiple rows.
      const rows = [];
      for (const child of bar.children) {
        if (child.offsetWidth === 0 && child.offsetHeight === 0) continue;
        const cen = child.offsetTop + child.offsetHeight / 2;
        if (!rows.some((x) => Math.abs(x - cen) <= 6)) rows.push(cen);
      }
      if (el) el.style.display = rows.length > maxRows ? 'none' : '';
      bar.classList.toggle('hub-bleed', rows.length === 1 && w > 560);
    };
    const ro = new ResizeObserver(evaluate);
    ro.observe(bar);
    evaluate();
    return () => ro.disconnect();
  }, [bestCat, profile, found]);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
    .qzhub{font-family:${FONT};color:${C.ink};}
    .qzhub .lbl{font-size:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:${C.muted};}
    .qzhub .card{background:${C.surface};border:1px solid ${C.line};border-radius:12px;overflow:hidden;min-width:0;}
    .qzhub .metric{background:${C.bg};border-radius:10px;padding:12px 14px;}
    .qzhub .metric .v{font-size:21px;font-weight:700;}
    .qzhub .rankchip{font-size:10px;font-weight:700;color:${C.accent};background:${C.accsoft};border-radius:5px;padding:1px 6px;letter-spacing:0;text-transform:none;margin-left:6px;}
    .qzhub .pvbtn{border:none;background:transparent;border-radius:6px;padding:5px 11px;font:inherit;font-family:${FONT};font-size:12px;color:${C.muted};cursor:pointer;}
    .qzhub .pvbtn.on{background:var(--white);color:${C.ink};font-weight:700;box-shadow:0 1px 2px rgba(20,22,28,0.06);}
    .qzhub .dd{position:relative;}
    .qzhub .ddbtn{display:flex;align-items:center;gap:8px;background:var(--white);border:1px solid ${C.line};border-radius:10px;padding:9px 12px;cursor:pointer;font:inherit;min-width:200px;}
    .qzhub .ddmenu{position:absolute;top:calc(100% + 6px);right:0;z-index:30;background:var(--white);border:1px solid ${C.line};border-radius:10px;box-shadow:0 8px 24px rgba(20,22,28,0.12);padding:6px;min-width:430px;display:grid;grid-template-columns:1fr 1fr;gap:1px 4px;}
    .qzhub .ddmenu .ddall{grid-column:1 / -1;}
    .qzhub .dditem{display:flex;align-items:center;gap:9px;padding:7px 9px;border-radius:7px;cursor:pointer;font-size:13px;}
    .qzhub .dditem:hover{background:${C.bg};}
    .qzhub .dot{width:9px;height:9px;border-radius:3px;flex:none;}
    .qzhub .tabs{display:flex;gap:4px;background:transparent;padding:0;margin:18px 0 16px;border-bottom:1px solid ${C.line};}
    .qzhub .tab{border:1px solid transparent;background:transparent;border-radius:10px 10px 0 0;padding:11px 20px;margin-bottom:-1px;font:inherit;font-family:${FONT};font-size:13.5px;font-weight:600;color:${C.muted};cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;}
    .qzhub .tabcue{display:none;}
    @media(max-width:680px){.qzhub .tabs{gap:2px;}.qzhub .tab{flex:1;font-size:12px;padding:10px 6px;gap:5px;}}
    .qzhub .tab.on{background:${C.surface};color:${C.ink};font-weight:700;border-color:${C.line};border-bottom-color:${C.surface};}
    .qzhub .tab.on svg{color:${C.accent};}
    .qzhub .hrow{display:flex;align-items:center;gap:10px;padding:7px 0;border-top:1px solid rgba(20,22,28,0.07);font-size:13px;}
    .qzhub .score{font-weight:700;color:${C.accent};font-variant-numeric:tabular-nums;}
    .qzhub table{width:100%;border-collapse:collapse;font-size:12.5px;}
    .qzhub th{text-align:left;font-size:10px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:${C.muted};padding:8px 10px;border-bottom:1px solid ${C.line};}
    .qzhub td{padding:8px 10px;border-bottom:1px solid rgba(20,22,28,0.06);}
    .qzhub .gtag{font-size:8.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:${C.soft};border:1px solid ${C.line};border-radius:4px;padding:1px 4px;}
    .qzhub .formula{background:${C.bg};border:1px solid ${C.line};border-radius:10px;padding:14px 16px;font-family:ui-monospace,Menlo,monospace;font-size:13px;line-height:1.9;}
    .qzhub .back{display:inline-flex;align-items:center;gap:6px;color:${C.muted};text-decoration:none;font-size:13px;}
    .qzhub .back:hover{color:${C.ink};}
    .qzhub .crumb1{font-size:18px;font-weight:800;letter-spacing:-0.02em;}
    .qzhub .crumb2{font-size:18px;font-weight:600;color:${C.accent};}
    .qzhub a.qlink{text-decoration:none;color:inherit;}
.qzhub .metric-lbl{display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:nowrap;}
    @media(max-width:600px){.qzhub .metric-lbl{flex-wrap:wrap;}}
    @media(max-width:680px){.qzhub .rgrid{grid-template-columns:1fr !important;}}
    @media(max-width:560px){.qzhub .shpbar{gap:8px 12px !important;padding:13px 14px !important;}.qzhub .shpbar-id{order:1;}.qzhub .shpbar-share{order:2;margin-left:auto !important;width:auto !important;padding:8px 13px !important;}.qzhub .shpbar-iddiv,.qzhub .shpbar-maindiv{display:none !important;}.qzhub .shpbar-main{order:3;flex-basis:100% !important;width:100% !important;gap:14px !important;}.qzhub .shpbar-main > div:nth-child(3){gap:14px !important;}.qzhub .sh-mext{display:none !important;}.qzhub .sh-rank{font-size:30px !important;}}
    .qzhub .lbl2{font-size:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:${C.muted};}
    .qzhub .hubbtn{display:flex;align-items:center;gap:7px;background:var(--white);color:${C.accent};border:1px solid var(--accent-border);border-right:3px solid ${C.accent};padding:10px 15px;border-radius:10px;font-family:${FONT};font-weight:700;font-size:13px;cursor:pointer;white-space:nowrap;}
    .qzhub .qz-playerbar.hub-bleed .hubbtn{align-self:stretch;padding:0 18px;margin:-11px -14px -11px 0;border-radius:0 11px 11px 0;border-top:none;border-bottom:none;border-left:none;}
    .qzhub .hubbtn:hover{background:${C.accsoft};}
    .qzhub .qz-srank{font-size:11px;font-weight:600;color:${C.soft};}
    .qzhub .qz-pname{max-width:160px;}
    @media(max-width:560px){.qzhub .qz-pname{max-width:120px;}}
    @media(max-width:560px){.qzhub .qz-srank{display:none !important;}}
    .qz-playerbar .qz-skill-empty{display:none !important;}
    @media(max-width:560px){.qz-playerbar{flex-wrap:wrap !important;align-items:center !important;gap:10px 14px !important;}.qz-playerbar .qz-div{display:none !important;}.qz-playerbar .qz-stats{order:9 !important;flex:1 1 100% !important;margin-left:0 !important;justify-content:space-between !important;gap:10px !important;}.qz-playerbar .qz-bestcat{order:3 !important;}.qz-playerbar .hubbtn{order:4 !important;margin-left:auto !important;flex:0 0 auto !important;}}
    @media(max-width:560px){.qzhub{padding-left:14px !important;padding-right:14px !important;}}
    .qzhub .fdot{width:9px;height:9px;border-radius:50%;display:inline-block;}
    .qzhub .duelpulse{animation:qzpulse 2s ease-in-out infinite;}
    .qzhub .flameon{animation:qzflame 1.4s ease-in-out infinite;}
    @keyframes qzpulse{0%,100%{box-shadow:0 0 0 0 rgba(14,29,64,.25);}50%{box-shadow:0 0 0 7px rgba(14,29,64,0);}}
    @keyframes qzflame{0%,100%{transform:scale(1);}50%{transform:scale(1.16);}}
    @media (prefers-reduced-motion: reduce){.qzhub .duelpulse,.qzhub .flameon{animation:none;}}
    @media(max-width:640px){.qzhub .lbar{display:none;}.qzhub .lform{display:none;}.qzhub .duelqt{display:none;}}
    .qzhub .tiles{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:18px 0 14px;}
    @media(max-width:900px){.qzhub .tiles{grid-template-columns:repeat(3,1fr);}}
    @media(max-width:680px){.qzhub .tiles{grid-template-columns:1fr 1fr;gap:8px;}}
    .qzhub .tile{position:relative;text-align:left;background:var(--white);border:1px solid rgba(20,22,28,0.30);border-radius:12px;padding:12px 14px;font-family:${FONT};cursor:pointer;min-width:0;transition:border-color .12s;}
    .qzhub .tile:hover{border-color:var(--accent-border);}
    .qzhub .tile.on{background:${C.accent};border-color:${C.accent};}
    .qzhub .tilebadge{position:absolute;top:9px;right:11px;background:${C.danger};color:var(--white);font-size:10px;font-weight:800;border-radius:999px;padding:2px 7px;}
    .qzhub .pill{display:inline-flex;align-items:center;gap:6px;background:var(--white);border:1px solid rgba(20,22,28,0.30);color:${C.muted};border-radius:999px;padding:7px 15px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:${FONT};}
    .qzhub .pill:hover{border-color:var(--accent-border);}
    .qzhub .pill.on{background:${C.accent};border-color:${C.accent};color:var(--white);font-weight:800;}
  `;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', position: 'relative' }}>
      <Grain />
      <style>{css}</style>
      <QuizNavHeader />
      <div className="qzhub qzf-w" style={{ maxWidth: 1180, margin: '0 auto', padding: '12px 38px 70px', position: 'relative' }}><div className="qzf-line" aria-hidden="true" />

        {viewing ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: C.accsoft, border: `1px solid ${C.line}`, borderRadius: 10, padding: '8px 14px', marginTop: 10 }}>
            <span style={{ fontSize: 13, color: C.ink }}>Viewing <b>{(viewProfile && viewProfile.name) || 'player'}</b>{"'"}s stats</span>
            <button onClick={() => { setViewKey(null); if (typeof window !== 'undefined' && window.history) window.history.replaceState(null, '', '/quizzes/hub'); }} style={{ border: `1px solid ${T.accentBorder}`, background: T.white, color: C.accent, borderRadius: 7, padding: '6px 13px', font: 'inherit', fontFamily: FONT, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Back to my stats</button>
          </div>
        ) : null}

        {!viewing && me && !(me.found && !me.isAnon) ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', background: C.accsoft, border: `1px solid ${C.line}`, borderRadius: 12, padding: '14px 18px', marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: C.accent, color: T.white, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><UserPlus size={20} /></div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, lineHeight: 1.2 }}>You{"'"}re playing as a guest</div>
                <div style={{ fontSize: 13, color: T.slate, lineHeight: 1.45, marginTop: 2 }}>Add a display name (email optional) to put your scores on the leaderboards and keep your stats across devices. No password needed.</div>
              </div>
            </div>
            <button onClick={() => setSignupOpen(true)} style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, background: C.accent, color: T.white, border: 'none', borderRadius: 10, padding: '11px 18px', fontFamily: FONT, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}><UserPlus size={15} /> Create name</button>
          </div>
        ) : null}

        {/* nav tiles: each main section is a live stat card */}
        <div className="tiles">
          {(() => {
            const meFound = me && me.found;
            const on = (t) => tab === t;
            const lblSt = (t) => ({ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 800, color: on(t) ? T.white : C.muted });
            const bigSt = (t) => ({ display: 'block', fontSize: 18, fontWeight: 800, marginTop: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: on(t) ? T.white : C.ink, fontVariantNumeric: 'tabular-nums' });
            const smSt = (t) => ({ fontSize: 11, fontWeight: 700, color: on(t) ? 'rgba(255,255,255,0.75)' : C.soft });
            const subSt = (t, warn) => ({ display: 'block', fontSize: 10.5, fontWeight: 700, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: warn ? (on(t) ? '#ffd9d3' : C.danger) : (on(t) ? 'rgba(255,255,255,0.75)' : C.soft) });
            const waiting = duels.yourMove.length;
            return (
              <>
                <button className={`tile${on('player') ? ' on' : ''}`} onClick={() => setTab('player')}>
                  <span style={lblSt('player')}><User size={15} /> {(profile && profile.found && profile.name) || 'Player'}</span>
                  <span style={bigSt('player')}>{profile && profile.found && profile.rank ? <>#{profile.rank} <span style={smSt('player')}>of {((me && me.totalPlayers) || 0).toLocaleString()}</span></> : '—'}</span>
                  <span style={subSt('player')}>{profile && profile.found ? `Level ${profile.level || 1} · ${(profile.xp || 0).toLocaleString()} IQ` : 'Play to get ranked'}</span>
                </button>
                <button className={`tile${on('daily') ? ' on' : ''}`} onClick={() => setTab('daily')}>
                  <span style={lblSt('daily')}><CalendarDays size={15} /> Daily Puzzles</span>
                  <span style={bigSt('daily')}>{dailyToday && dailyToday.me ? <>#{dailyToday.me.rank} <span style={smSt('daily')}>today</span></> : (dailyToday ? <>{dailyToday.gameCount} <span style={smSt('daily')}>live</span></> : '—')}</span>
                  <span style={subSt('daily')}>{dailyToday && dailyToday.me ? `${fmtPts1(dailyToday.me.total)}/${dailyToday.maxTotal} pts today` : (dailyToday ? `${dailyToday.gameCount === 1 ? 'puzzle' : 'puzzles'} live today` : "today's board is live")}</span>
                </button>
                <button className={`tile${on('duels') ? ' on' : ''}`} onClick={() => setTab('duels')}>
                  {waiting > 0 ? <span className="tilebadge">{waiting}</span> : null}
                  <span style={lblSt('duels')}><Swords size={15} /> Duels</span>
                  <span style={bigSt('duels')}>{myDuel ? <>{myDuel.wins}-{myDuel.losses}{myDuel.ties ? `-${myDuel.ties}` : ''}{myDuelStreak ? <span style={{ fontSize: 12, fontWeight: 800, marginLeft: 6, color: on('duels') ? T.white : (myDuelStreak.kind === 'win' ? C.live : C.danger) }}>{myDuelStreak.kind === 'win' ? 'W' : 'L'}{myDuelStreak.n}</span> : null}</> : '—'}</span>
                  <span style={subSt('duels', waiting > 0)}>{waiting > 0 ? `${waiting} waiting on you` : myDuel ? `${myDuel.winPct}% win rate` : 'Challenge someone'}</span>
                </button>
                <button className={`tile${on('challenges') ? ' on' : ''}`} onClick={() => setTab('challenges')}>
                  <span style={lblSt('challenges')}><Flame size={15} /> Challenges</span>
                  <span style={bigSt('challenges')}>Daily</span>
                  <span style={subSt('challenges')}>today{"'"}s board is live</span>
                </button>
                <button className={`tile${on('quizzes') ? ' on' : ''}`} onClick={() => setTab('quizzes')}>
                  <span style={lblSt('quizzes')}><ListChecks size={15} /> Quizzes</span>
                  <span style={bigSt('quizzes')}>{meFound ? (me.activity.played || 0).toLocaleString() : '0'} <span style={smSt('quizzes')}>played</span></span>
                  <span style={subSt('quizzes')}>{catalog.length.toLocaleString()} on the site</span>
                </button>
              </>
            );
          })()}
        </div>

        {tab === 'daily' && <DailyGamesView initialGame={dailyGame} onSelectPlayer={openPlayer} />}
        {tab === 'player' && <PlayerPanel me={profile} scope={scope} cats={cats} byKey={byKey} totalQuizzes={catalog.length} board={board} boardTotal={boardTotal} myName={myName} myAnonKey={myAnonKey} titleById={titleById} pview={pview} setPview={setPview} viewKey={viewKey} onSelectPlayer={openPlayer} />}
        {tab === 'quizzes' && <QuizzesPanel me={profile} myProfile={me} scope={scope} byKey={byKey} catalog={catalog} stats={statsById} totals={totals} totalPlays={totalPlays} onSelectPlayer={openPlayer} />}
        {tab === 'challenges' && <ChallengesPanel me={profile} />}
        {tab === 'duels' && <DuelsPanel data={duels} setData={setDuels} ladder={duelLadder} loaded={duelsLoaded} onSelectPlayer={openPlayer} />}      </div>

      {shareOpen && found && <ShareStatsModal profile={profile} byKey={byKey} onClose={() => setShareOpen(false)} />}
      {signupOpen && <SignupModal onClose={() => setSignupOpen(false)} />}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, flexWrap: 'wrap', margin: '30px 0 8px', fontSize: 12.5, color: C.muted, fontFamily: FONT }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Check size={14} strokeWidth={2.75} style={{ color: '#047857' }} /> Played</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Star size={14} strokeWidth={1.5} fill={T.gold} color={T.goldInk} /> Completed (100%)</span>
      </div>
      <Footer />
    </div>
  );
}

// ─── small helpers ──────────────────────────────────────────────────────────
// A compact metric for the profile header: label, value, and a "#rank" chip.


// Columns for the Category Detail table. `get(c, cr)` extracts the sort value
// from a category row's stats record (cr); `chip` names the per-category rank
// field on cr that renders as a #rank badge in that column.


// Share of a quiz pool a player has aced (completed / pool size). Used in the
// Category table's Completed column, scoped per-category (overall row uses the
// whole catalog, each category row uses that category's quiz count).


// ─── Player tab ─────────────────────────────────────────────────────────────


function PlayerPanel({ me, scope, cats, byKey, totalQuizzes, board, boardTotal, myName, myAnonKey, titleById, pview, setPview, viewKey, onSelectPlayer }) {
  const found = me && me.found;
  const viewing = !!viewKey;

  const toggle = (
    <div style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
      {[['ranking', 'Ranking', Trophy], ['trophies', 'Trophies', Award], ['category', 'Category', ListChecks], ['rating', 'IQ & Level', FunctionSquare], ['activity', 'Activity', Clock]].map(([v, lbl, Ic]) => (
        <button key={v} className={`pill${pview === v ? ' on' : ''}`} onClick={() => setPview(v)}><Ic size={14} /> {lbl}</button>
      ))}
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        {toggle}
        {!viewing && myName ? <Link href={`/player/${encodeURIComponent(myName)}`} style={{ flex: 'none', fontSize: 12.5, fontWeight: 800, color: C.accent, textDecoration: 'none' }}>Public profile →</Link> : null}
      </div>
      {pview === 'trophies' ? (
        <TrophyCase trophies={found ? me.trophies : null} viewing={viewing} />
      ) : pview === 'rating' ? (
        <XpPanel me={me} titleById={titleById} viewing={viewing} />
      ) : pview === 'activity' ? (
        <ActivityFeed recent={found ? me.recent : []} titleById={titleById} viewing={viewing} />
      ) : pview === 'category' ? (
        <CategoryView me={me} scope={scope} cats={cats} totalQuizzes={totalQuizzes} viewing={viewing} />
      ) : (
      <div className="card" style={{ padding: '14px 16px' }}>
        <UserBaseBody board={board} boardTotal={boardTotal} myName={myName} myAnonKey={myAnonKey} onSelectPlayer={onSelectPlayer} viewKey={viewKey} />
      </div>
      )}
    </div>
  );
}

// ─── Daily Puzzles view ───────────────────────────────────────────────────────
// Global (not player-scoped): the combined daily leaderboard, the day-by-day
// champion history, and an all-time stat line for each daily puzzle. Winner history
// and per-game aggregates come from /api/quiz/daily-history; today's per-game
// leaders come from /api/quiz/daily-combined (the same source the board uses).
const DAILY_GAME_META = Object.fromEntries(
  DAILY_GAMES.map((g) => [g.key, { name: g.name, c: g.color, href: g.href, tag: g.tag }])
);

function fmtPts1(n) {
  const v = Math.round(Number(n) * 10) / 10;
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

function DailyGamesView({ onSelectPlayer, initialGame = null }) {
  const [hist, setHist] = useState(null);   // /api/quiz/daily-history
  const [today, setToday] = useState(null); // /api/quiz/daily-combined (today's per-game boards)
  useEffect(() => {
    let alive = true;
    fetch('/api/quiz/daily-history')
      .then((r) => r.json()).then((d) => { if (alive) setHist(d || {}); })
      .catch(() => { if (alive) setHist({}); });
    let anonId = null, email = null;
    try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
    const qs = new URLSearchParams();
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    fetch('/api/quiz/daily-combined?' + qs.toString())
      .then((r) => r.json()).then((d) => { if (alive) setToday(d || {}); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const history = (hist && hist.history) || [];
  const champions = (hist && hist.champions) || [];
  const games = (hist && hist.games) || [];
  const topChamp = champions[0] || null;
  const todayGames = useMemo(() => {
    const map = {};
    for (const g of ((today && today.games) || [])) map[g.key] = g;
    return map;
  }, [today]);

  const openPlayer = (key) => { if (key && onSelectPlayer) onSelectPlayer(key); };
  const col = '68px 1fr 76px 60px 52px';
  const sub = { fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: C.muted };
  const nameBtn = (key, name, size) => (key
    ? <button onClick={() => openPlayer(key)} style={{ border: 'none', background: 'transparent', padding: 0, font: 'inherit', fontFamily: FONT, fontWeight: 700, fontSize: size, color: C.accent, cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{name}</button>
    : <span style={{ fontWeight: 700, fontSize: size, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>);

  return (
    <div>
      {/* 1. The combined daily leaderboard (full board + per-game tabs). */}
      <DailyCombinedLeaderboard light allTimeToggle initialTab={initialGame} key={initialGame || 'overall'} />

      {/* 2. Day-by-day champion history. */}
      <div id="daily-champions" className="card" style={{ padding: '16px 18px', marginTop: 16, scrollMarginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 800 }}><Crown size={17} style={{ color: T.goldInk }} /> Daily Champions</span>
          {hist == null ? null : <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{history.length} {history.length === 1 ? 'day' : 'days'} crowned</span>}
        </div>
        {topChamp && topChamp.wins > 1 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fffdf5', border: '1.5px solid #f0d9a8', borderRadius: 12, padding: '11px 14px', marginBottom: 12 }}>
            <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#fbf2dc', color: '#a97b12', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Crown size={17} /></span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 800 }}><span style={{ color: '#a97b12' }}>Most crowns:</span> {nameBtn(topChamp.userKey, topChamp.username, 13)}</span>
              <span style={{ display: 'block', fontSize: 12, color: C.muted, fontWeight: 600, marginTop: 1 }}>{topChamp.wins} daily wins across the last {history.length} days</span>
            </span>
          </div>
        ) : null}
        {hist == null ? (
          <div style={{ color: C.soft, fontSize: 13 }}>Loading champion history…</div>
        ) : history.length === 0 ? (
          <div style={{ color: C.muted, fontSize: 13 }}>No completed days yet. The first champion is crowned once today wraps up.</div>
        ) : (
          <div>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ minWidth: 480 }}>
            <div style={{ display: 'grid', gridTemplateColumns: col, gap: 8, padding: '0 4px 8px', ...sub }}>
              <span>Day</span><span>Champion</span><span style={{ textAlign: 'right' }}>Total</span><span style={{ textAlign: 'right' }}>Puzzles</span><span style={{ textAlign: 'right' }}>Field</span>
            </div>
            {history.map((h, i) => (
              <div key={h.date} style={{ display: 'grid', gridTemplateColumns: col, gap: 8, alignItems: 'center', padding: '9px 4px', borderTop: `1px solid ${C.line}` }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{h.label}</span>
                <span style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
                  {i === 0 ? <Crown size={13} style={{ color: T.goldInk, flex: 'none' }} /> : null}
                  {nameBtn(h.winner.userKey, h.winner.username, 13.5)}
                </span>
                <span style={{ textAlign: 'right', fontSize: 13, fontWeight: 800, color: C.accent, fontVariantNumeric: 'tabular-nums' }}>{fmtPts1(h.winner.total)}<span style={{ fontSize: 10.5, fontWeight: 600, color: C.soft }}>/{h.maxTotal}</span></span>
                <span style={{ textAlign: 'right', fontSize: 12.5, fontWeight: 600, color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{h.winner.gamesPlayed}/{h.gameCount}</span>
                <span style={{ textAlign: 'right', fontSize: 12.5, fontWeight: 600, color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{h.field}</span>
              </div>
            ))}
            </div>
            </div>
            <p style={{ fontSize: 11, color: C.soft, marginTop: 11, lineHeight: 1.5 }}>Each day{"'"}s champion is the #1 on that day{"'"}s combined board (best 10 of the day{"'"}s puzzles). Today is still live, so it{"'"}s not crowned yet. Field is the registered players who played any daily puzzle that day.</p>
          </div>
        )}
      </div>

      {/* 3. Individual game stats. */}
      <div className="card" style={{ padding: '16px 18px', marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, fontWeight: 800 }}>Puzzle Stats</span>
          {games.length ? <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>all-time, across {games.length} daily puzzles</span> : null}
        </div>
        {hist == null ? (
          <div style={{ color: C.soft, fontSize: 13 }}>Loading puzzle stats…</div>
        ) : games.length === 0 ? (
          <div style={{ color: C.muted, fontSize: 13 }}>No daily-puzzle plays recorded yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(215px,1fr))', gap: 10 }}>
            {games.map((g) => {
              const meta = DAILY_GAME_META[g.key] || { name: g.key, c: C.accent, href: `/${g.key}`, tag: '' };
              const tg = todayGames[g.key];
              const leader = tg && tg.board && tg.board[0];
              const stat = (v, l, clr) => (
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 18, fontWeight: 800, color: clr || C.ink, fontVariantNumeric: 'tabular-nums' }}>{v}</span>
                  <span style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: C.muted }}>{l}</span>
                </span>
              );
              return (
                <div key={g.key} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: '13px 14px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <a href={meta.href} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', minWidth: 0 }}>
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: meta.c, flex: 'none' }} />
                      <span style={{ fontSize: 14, fontWeight: 800, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meta.name}</span>
                    </a>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: C.soft, flex: 'none' }}>{g.days} {g.days === 1 ? 'day' : 'days'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                    {stat(g.plays.toLocaleString(), 'plays', C.accent)}
                    {stat(g.players.toLocaleString(), 'players')}
                    {stat(`${g.avgCompletionPct}%`, 'avg score')}
                  </div>
                  <div style={{ marginTop: 10, paddingTop: 9, borderTop: `1px solid ${C.line}`, fontSize: 11.5, color: C.muted, fontWeight: 600 }}>
                    {leader ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden' }}>
                        <span style={{ color: T.goldInk, flex: 'none', display: 'inline-flex' }}><Crown size={12} /></span>
                        <span style={{ color: C.soft, flex: 'none' }}>Today:</span>
                        {nameBtn(leader.userKey, leader.username, 11.5)}
                      </span>
                    ) : tg ? (
                      <span>Today: {(tg.field || 0).toLocaleString()} on the board</span>
                    ) : (
                      <span>Not live today</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Category view: cards by default, the classic table behind a toggle ─────


// Activity view: play-streak stats + a 12-week heatmap, milestone highlights
// (perfects, personal bests, big IQ Points hauls), then the full game log. All of
// it derives client-side from `recent`, which carries the player's FULL history.


// Full ranking BODY (no card chrome; the card, title, and toggle live in
// PlayerPanel). Podium + chase card on top, then every player registered +
// anonymous in the sortable table, current row highlighted.
const tierNameOf = (lvl) => (lvl >= 18 ? 'Master' : lvl >= 14 ? 'Diamond' : lvl >= 9 ? 'Gold' : lvl >= 5 ? 'Silver' : 'Bronze');
function UserBaseBody({ board, boardTotal, myName, myAnonKey, onSelectPlayer, viewKey }) {
  const [sort, setSort] = useState({ col: 'xp', dir: 'desc' });
  if (!board) return <div style={{ fontSize: 13, color: C.soft, padding: '6px 0' }}>Loading the full ranking…</div>;
  if (!board.length) return <div style={{ fontSize: 13, color: C.soft, padding: '6px 0' }}>No ranked players yet.</div>;
  const isMine = (p) => (myAnonKey && p.userKey === myAnonKey) || (myName && !p.isAnon && p.name === myName);
  const hasTrend = board.some((p) => p.trend7d !== undefined);
  const trendCell = (p) => {
    if (p.trend7d === undefined) return <span style={{ color: C.soft }}>—</span>;
    if (p.trend7d == null) return <span style={{ fontSize: 10.5, fontWeight: 800, color: C.soft, letterSpacing: '.03em' }}>NEW</span>;
    if (p.trend7d > 0) return <span style={{ fontWeight: 800, color: C.live }}>▲ {p.trend7d}</span>;
    if (p.trend7d < 0) return <span style={{ fontWeight: 800, color: C.danger }}>▼ {Math.abs(p.trend7d)}</span>;
    return <span style={{ fontWeight: 700, color: C.muted }}>±0</span>;
  };
  // Podium + chase read the board in its served (IQ Points) order regardless of
  // how the table below is sorted.
  const top3 = board.slice(0, 3);
  const myIdx = board.findIndex(isMine);
  const my = myIdx >= 0 ? board[myIdx] : null;
  let chase = null;
  if (my) {
    if (myIdx === 0) {
      const second = board[1];
      chase = { title: 'You hold #1', sub: second ? `${second.name} is ${Math.max(0, (my.xp || 0) - (second.xp || 0))} IQ Points behind you. Stay sharp.` : 'The board is yours.', pct: 100, cta: 'Defend #1' };
    } else {
      const ahead = board[myIdx - 1];
      const below = board[myIdx + 1];
      const gap = Math.max(0, (ahead.xp || 0) - (my.xp || 0));
      let sub = gap === 0 ? `You are tied with ${ahead.name} at ${(my.xp || 0).toLocaleString()} IQ Points.` : `${ahead.name} sits at ${(ahead.xp || 0).toLocaleString()} IQ Points.`;
      if (below) {
        const back = Math.max(0, (my.xp || 0) - (below.xp || 0));
        sub += back === 0 ? ` ${below.name} is tied right behind you.` : ` ${below.name} is ${back} IQ Points behind you.`;
      }
      chase = {
        title: gap === 0 ? `Tied for #${myIdx}: any game breaks it` : `The chase: ${gap} IQ Points to #${myIdx}`,
        sub,
        pct: Math.round(Math.max(6, Math.min(96, ((my.xp || 0) / Math.max(1, ahead.xp || 1)) * 100))),
        cta: `Chase #${myIdx}`,
      };
    }
  }
  const COLS = [
    { key: 'rank', label: 'Rank', w: 60, align: 'left' },
    { key: 'name', label: 'Player', align: 'left', get: (p) => (p.name || '').toLowerCase() },
    { key: 'xp', label: 'IQ', align: 'right', get: (p) => p.xp || 0 },
    ...(hasTrend ? [{ key: 'trend', label: '7-Day', align: 'right', get: (p) => (p.trend7d == null ? -1e9 : p.trend7d) }] : []),
    { key: 'correct', label: 'Correct', align: 'right', get: (p) => p.correct || 0 },
    { key: 'completed', label: 'Completed', align: 'right', get: (p) => p.completed || 0 },
    { key: 'daysPlayed', label: 'Days', align: 'right', get: (p) => p.daysPlayed || 0 },
    { key: 'accuracy', label: 'Accuracy', align: 'right', get: (p) => p.accuracy || 0 },
  ];
  const active = COLS.find((c) => c.key === sort.col) || COLS[2];
  const sorted = [...board].sort((a, b) => {
    const av = active.get ? active.get(a) : 0;
    const bv = active.get ? active.get(b) : 0;
    let cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
    if (sort.dir === 'desc') cmp = -cmp;
    return cmp || (a.rank || 0) - (b.rank || 0);
  });
  const clickSort = (c) => { if (!c.get) return; setSort((st) => st.col === c.key ? { col: c.key, dir: st.dir === 'desc' ? 'asc' : 'desc' } : { col: c.key, dir: c.key === 'name' ? 'asc' : 'desc' }); };
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, marginBottom: 12 }}>
        {top3.map((p, i) => {
          const mine = isMine(p);
          return (
            <div key={p.userKey} style={{ background: mine ? '#f3f7fe' : C.bg, border: `1px solid ${mine ? '#c6d8f5' : C.line}`, borderTop: `3px solid ${MEDAL[i]}`, borderRadius: '0 0 12px 12px', padding: '14px 12px 12px', textAlign: 'center', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
              <span style={{ position: 'relative', display: 'inline-flex', flex: 'none' }}>
                <Avatar name={p.name} bg={MEDAL_BG[i]} fg={MEDAL_INK[i]} size={40} />
                {i === 0 ? <span style={{ position: 'absolute', top: -7, right: -9, width: 19, height: 19, borderRadius: '50%', background: T.white, border: `1px solid ${C.line}`, color: MEDAL_INK[0], display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Crown size={11} /></span> : null}
              </span>
              <div style={{ marginTop: 7, fontSize: 13, fontWeight: 800, lineHeight: 1.2, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <button onClick={() => onSelectPlayer && onSelectPlayer(p.userKey)} style={{ border: 'none', background: 'transparent', padding: 0, font: 'inherit', fontFamily: FONT, fontWeight: 800, color: mine ? C.ink : C.accent, cursor: 'pointer' }}>{p.name}</button>
                {mine ? <span style={{ fontSize: 9.5, color: C.accent, fontWeight: 800, marginLeft: 5 }}>YOU</span> : null}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2, lineHeight: 1.15, fontVariantNumeric: 'tabular-nums' }}>{(p.xp || 0).toLocaleString()}</div>
              <div style={{ fontSize: 10, color: C.soft, fontWeight: 800, letterSpacing: '.05em', marginTop: 2 }}>{tierNameOf(p.level || 1).toUpperCase()} · {p.accuracy || 0}% ACC</div>
            </div>
          );
        })}
      </div>
      {chase ? (
        <div style={{ background: C.bg, borderRadius: 12, padding: '13px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ flex: 'none', color: C.accent, background: C.accsoft, borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={19} /></span>
          <span style={{ flex: 1, minWidth: 200 }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 800 }}>{chase.title}</span>
            <span style={{ display: 'block', fontSize: 12, color: C.muted, fontWeight: 600, marginTop: 1 }}>{chase.sub}</span>
            <span style={{ display: 'block', height: 6, borderRadius: 999, background: '#e4e7ec', marginTop: 8, overflow: 'hidden' }}><span style={{ display: 'block', width: `${chase.pct}%`, height: '100%', background: C.accent, borderRadius: 999 }} /></span>
          </span>
          <Link href="/quizzes" style={{ flex: 'none', fontSize: 12, fontWeight: 800, color: T.white, background: C.accent, borderRadius: 9, padding: '8px 14px', textDecoration: 'none' }}>{chase.cta}</Link>
        </div>
      ) : null}
      <div style={{ fontSize: 11, color: C.soft, marginBottom: 10 }}>Top {board.length.toLocaleString()} of {Math.max(boardTotal || 0, board.length).toLocaleString()} players, anonymous guests included. Tap a column to sort; your row is highlighted.{hasTrend ? ' 7-Day = IQ Points earned over the last week.' : ''}</div>
      <div style={{ overflow: 'auto', maxHeight: 600 }}>
        <table>
          <thead><tr>
            {COLS.map((c) => (
              <th key={c.key} onClick={() => clickSort(c)} style={{ width: c.w, textAlign: c.align, whiteSpace: 'nowrap', userSelect: 'none', cursor: c.get ? 'pointer' : 'default', color: c.get && sort.col === c.key ? C.accent : undefined }}>
                {c.label}{c.get && sort.col === c.key ? (sort.dir === 'desc' ? ' ↓' : ' ↑') : ''}
              </th>
            ))}
          </tr></thead>
          <tbody>
            {sorted.map((p, idx) => {
              const mine = isMine(p);
              const viewed = !!viewKey && p.userKey === viewKey && !mine;
              const mi = idx < 3 ? idx : -1;
              return (
                <tr key={p.userKey} style={mine ? { background: C.accsoft } : (viewed ? { background: '#fdf2e3' } : undefined)}>
                  <td style={{ fontWeight: 800, color: mi >= 0 ? MEDAL_INK[mi] : C.soft }}>{idx + 1}</td>
                  <td style={{ fontWeight: (mine || viewed) ? 800 : 600, whiteSpace: 'nowrap' }}><button onClick={() => onSelectPlayer && onSelectPlayer(p.userKey)} style={{ border: 'none', background: 'transparent', padding: 0, font: 'inherit', fontFamily: FONT, fontWeight: 'inherit', color: C.accent, cursor: 'pointer', textAlign: 'left' }}>{p.name}</button>{p.isAnon ? <span style={{ fontSize: 10, color: C.soft, fontWeight: 600, marginLeft: 6 }}>guest</span> : null}{mine ? <span style={{ fontSize: 10, color: C.accent, fontWeight: 700, marginLeft: 6 }}>you</span> : null}{viewed ? <span style={{ fontSize: 10, color: '#b5560f', fontWeight: 700, marginLeft: 6 }}>viewing</span> : null}</td>
                  <td className="score" style={{ textAlign: 'right', color: C.accent, fontWeight: 700 }}>{(p.xp || 0).toLocaleString()}</td>
                  {hasTrend ? <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{trendCell(p)}</td> : null}
                  <td style={{ textAlign: 'right' }}>{(p.correct || 0).toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>{p.completed || 0}</td>
                  <td style={{ textAlign: 'right' }}>{p.daysPlayed || 0}</td>
                  <td style={{ textAlign: 'right' }}>{p.accuracy || 0}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Quizzes tab ────────────────────────────────────────────────────────────
function QuizzesPanel({ me, myProfile, scope, byKey, catalog, stats, totals, totalPlays, onSelectPlayer }) {
  const found = me && me.found;
  const donePlayed = new Set((myProfile && myProfile.playedIds) || []);
  const doneCompleted = new Set((myProfile && myProfile.completedIds) || []);
  const pool = scope === 'all' ? catalog : catalog.filter((q) => q.dept === scope);
  const rows = pool.map((q) => ({ q, s: stats[q.id] || { plays: 0, avgScorePct: 0 }, leader: totals.leaders[q.id] || '', leaderKey: (totals.leaderKeys && totals.leaderKeys[q.id]) || '' }))
    .sort((a, b) => (b.s.plays || 0) - (a.s.plays || 0) || a.q.title.localeCompare(b.q.title));
  const totalCorrect = rows.reduce((acc, r) => acc + (r.s.correct || 0), 0);
  const totalPerfect = rows.reduce((acc, r) => acc + (r.s.perfect || 0), 0);
  const totalTime = totals.totalTime || 0;
  const [sort, setSort] = useState({ col: 'plays', dir: 'desc' });
  const QUIZ_COLS = [
    { key: 'title', label: 'Quiz', align: 'left', get: (r) => r.q.title.toLowerCase() },
    { key: 'plays', label: 'Plays', align: 'right', get: (r) => r.s.plays || 0 },
    { key: 'correct', label: 'Correct', align: 'right', get: (r) => r.s.correct || 0 },
    { key: 'perfect', label: 'Perfect', align: 'right', get: (r) => r.s.perfect || 0 },
    { key: 'time', label: 'Time', align: 'right', get: (r) => r.s.totalTime || 0 },
    { key: 'perPlay', label: 'Time / Play', align: 'right', get: (r) => ((r.s.plays || 0) > 0 ? (r.s.totalTime || 0) / r.s.plays : 0) },
    { key: 'leader', label: 'Top Scorer', align: 'left', get: null },
  ];
  const activeCol = QUIZ_COLS.find((c) => c.key === sort.col) || QUIZ_COLS[1];
  const sortedRows = [...rows].sort((a, b) => {
    const av = activeCol.get ? activeCol.get(a) : 0;
    const bv = activeCol.get ? activeCol.get(b) : 0;
    let cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
    if (sort.dir === 'desc') cmp = -cmp;
    return cmp || (b.s.plays || 0) - (a.s.plays || 0);
  });
  const clickSort = (c) => { if (!c.get) return; setSort((stt) => stt.col === c.key ? { col: c.key, dir: stt.dir === 'desc' ? 'asc' : 'desc' } : { col: c.key, dir: c.key === 'title' ? 'asc' : 'desc' }); };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, marginBottom: 16 }}>
        <Metric label="Total Plays" value={totalPlays.toLocaleString()} />
        <Metric label="Correct Answers" value={totalCorrect.toLocaleString()} />
        <Metric label="Perfect Quizzes" value={totalPerfect.toLocaleString()} />
        <Metric label="Time Spent" value={fmtPlayTime(totalTime)} />
      </div>
      <div className="card" style={{ padding: '4px 6px' }}>
        <div style={{ padding: '10px 10px 4px', fontSize: 13, fontWeight: 700 }}>All Quizzes <span style={{ fontWeight: 600, color: C.soft }}>({rows.length.toLocaleString()})</span></div>
        <div style={{ overflow: 'auto', maxHeight: 620 }}>
          <table>
            <thead><tr>
              {QUIZ_COLS.map((c) => (
                <th key={c.key} onClick={() => clickSort(c)} style={{ textAlign: c.align, whiteSpace: 'nowrap', userSelect: 'none', cursor: c.get ? 'pointer' : 'default', color: c.get && sort.col === c.key ? C.accent : undefined }}>{c.label}{c.get && sort.col === c.key ? (sort.dir === 'desc' ? ' ↓' : ' ↑') : ''}</th>
              ))}
            </tr></thead>
            <tbody>
              {sortedRows.map(({ q, s, leader, leaderKey }) => (
                <tr key={q.id}>
                  <td style={{ fontWeight: 600, maxWidth: 280 }}>
                    <span style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                      <Link href={`/quiz/${q.id}`} className="qlink" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{q.title}</Link>
                      {doneCompleted.has(q.id) ? <Star size={13} strokeWidth={1.5} fill={T.gold} color={T.goldInk} style={{ flex: 'none', marginLeft: 5 }} aria-label="Completed (100%)" /> : donePlayed.has(q.id) ? <Check size={13} strokeWidth={2.75} style={{ flex: 'none', color: '#047857', marginLeft: 5 }} aria-label="Played" /> : null}
                    </span>
                  </td>
                  <td className="score" style={{ textAlign: 'right' }}>{(s.plays || 0).toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>{(s.correct || 0).toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>{(s.perfect || 0).toLocaleString()}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{fmtPlayTime(s.totalTime || 0)}</td>
                  <td className="score" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{(s.plays || 0) > 0 ? mmss((s.totalTime || 0) / s.plays) : '—'}</td>
                  <td>{leader ? (leaderKey ? <button onClick={() => onSelectPlayer && onSelectPlayer(leaderKey)} style={{ border: 'none', background: 'transparent', padding: 0, font: 'inherit', fontFamily: FONT, color: C.accent, cursor: 'pointer', textAlign: 'left' }}>{leader}</button> : leader) : <span style={{ color: C.soft }}>Empty</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Challenges tab ─────────────────────────────────────────────────────────
const CH_MEDAL = { 1: T.gold, 2: '#b8bcc4', 3: '#c8814b' };
const CH_TINT = { 1: 'rgba(224,174,74,0.12)', 2: 'rgba(184,188,196,0.16)', 3: 'rgba(200,129,75,0.12)' };
function chMmss(s) { const n = Math.max(0, Math.round(Number(s) || 0)); return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`; }
function chUpdated(iso) { if (!iso) return ''; try { return new Date(iso).toLocaleString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) + ' ET'; } catch (e) { return ''; } }

// Winners' Circle: the #1 finisher of every challenge, dailies and events
// together, from /api/quiz/challenge-winners. Tapping a row opens that
// challenge's full leaderboard in place.
function WinnersCircle({ winners, loaded, onOpen }) {
  if (!loaded && !winners) return <div className="card" style={{ padding: '16px 18px', fontSize: 13, color: C.soft }}>Rounding up the winners…</div>;
  const list = winners || [];
  if (!list.length) return <div className="card" style={{ padding: '16px 18px', fontSize: 13, color: C.soft }}>No challenge results yet.</div>;
  const dailies = list.filter((w) => w.daily);
  const events = list.filter((w) => !w.daily);
  const hd = { fontSize: 11, fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', color: C.soft, margin: '14px 0 2px' };
  const Row = ({ w }) => (
    <button onClick={() => onOpen && onOpen(w.id)} title="Open the full board" style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', border: 'none', background: 'transparent', padding: '9px 0', borderBottom: `1px solid ${C.line}`, cursor: 'pointer', fontFamily: FONT }}>
      <span style={{ flex: 'none', width: 26, height: 26, borderRadius: '50%', background: w.winner ? '#fbf2dc' : '#eef0f2', color: w.winner ? T.gold : C.soft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trophy size={13} /></span>
      <span style={{ flex: '0 0 auto', width: 132, fontSize: 12, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.label}</span>
      <span style={{ flex: 1, minWidth: 60, fontSize: 13.5, fontWeight: 800, color: w.winner ? C.accent : C.soft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.winner ? w.winner.username : (w.closed ? 'No finishers' : 'No entries yet')}</span>
      {w.winner ? <span className="wc-score" style={{ flex: 'none', fontSize: 11.5, fontWeight: 700, color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{w.winner.totalCorrect} correct · {chMmss(w.winner.totalTime)}</span> : null}
      {!w.closed ? <span style={{ flex: 'none', fontSize: 9.5, fontWeight: 800, letterSpacing: '.04em', background: '#e6f7f0', color: '#0b7a55', borderRadius: 999, padding: '2px 7px' }}>LIVE</span> : null}
    </button>
  );
  return (
    <div className="card" style={{ padding: '16px 18px' }}>
      <style>{`@media(max-width:560px){.qzhub .wc-score{display:none;}}`}</style>
      <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>Winners{"'"} Circle</div>
      <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3, maxWidth: 700 }}>The top finisher of every challenge, dailies and events together. LIVE means the window is still open and the leader can still be caught. Tap a row for the full board.</div>
      <div style={hd}>Daily Challenges</div>
      {dailies.map((w) => <Row key={w.id} w={w} />)}
      {events.length > 0 ? (<>
        <div style={{ ...hd, marginTop: 16 }}>Events</div>
        {events.map((w) => <Row key={w.id} w={w} />)}
      </>) : null}
    </div>
  );
}

// Full challenge standings grid (mirrors the standalone leaderboard page),
// restyled to the Stat Hub theme. Self-fetches per selected challenge so the
// selector + refresh work in place; highlights the current player's row.
function ChallengesPanel({ me }) {
  const [chId, setChId] = useState(() => {
    if (typeof window !== 'undefined') {
      try { const c = new URLSearchParams(window.location.search).get('ch'); if (c) return c; } catch (e) {}
    }
    return dailyChallengeId();
  });
  const menu = useMemo(() => challengeMenu(), []);
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [shared, setShared] = useState(false);
  // Leaderboard vs Winners' Circle view; winners load once, on first open.
  const [view, setView] = useState('board');
  const [winners, setWinners] = useState(null);
  const [winLoaded, setWinLoaded] = useState(false);
  useEffect(() => {
    if (view !== 'winners' || winners) return;
    fetch('/api/quiz/challenge-winners').then((r) => r.json()).then((d) => { if (d && Array.isArray(d.winners)) setWinners(d.winners); }).catch(() => {}).finally(() => setWinLoaded(true));
  }, [view, winners]);

  const ch = getChallenge(chId) || CHALLENGES[0];
  const cols = challengeColumns(ch);
  const colLabel = (col) => { if (col.label) return col.label; const q = getQuiz(col.quizId); return (q && (q.navTitle || cleanTitle(q.title))) || col.quizId; };
  const colTotal = {};
  for (const c of cols) { const q = getQuiz(c.quizId); colTotal[c.quizId] = q && Array.isArray(q.answers) ? q.answers.length : 0; }
  const totalPossible = Object.values(colTotal).reduce((a, b) => a + b, 0);
  const pctOf = (n, d) => (d > 0 ? Math.round((Number(n) || 0) / d * 100) : 0);

  const load = (showSpin) => {
    if (showSpin) setRefreshing(true);
    fetch(`/api/quiz/challenge-leaderboard?id=${encodeURIComponent(ch.id)}`)
      .then((r) => r.json()).then((d) => { if (d && !d.error) setData(d); })
      .catch(() => {}).finally(() => { setLoaded(true); setRefreshing(false); });
  };
  useEffect(() => { setLoaded(false); setData(null); load(false); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [chId]);

  const doShare = () => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://mindloftdaily.com';
    const url = withRef(`${base}/quizzes/hub?tab=challenges&ch=${encodeURIComponent(ch.id)}`);
    const text = 'Can you beat my score?';
    if (typeof navigator !== 'undefined' && navigator.share) navigator.share({ title: ch.title, text, url }).catch(() => {});
    else if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(`${text} ${url}`).then(() => { setShared(true); setTimeout(() => setShared(false), 1800); }).catch(() => {});
  };

  const users = (data && data.users) || [];
  const myName = me && me.found ? (me.name || '').toLowerCase() : null;

  return (
    <div>
      <style>{`
        .chg-meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px 20px;font-size:12px;color:${C.muted};margin-top:14px;}
        .chg-meta b{color:${C.ink};font-weight:700;}
        .chg-btn{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:var(--white);border:1px solid ${C.line};border-radius:8px;font:inherit;font-family:${FONT};font-size:12px;font-weight:600;color:${C.ink};cursor:pointer;}
        .chg-btn:hover{background:${C.bg};}
        .chg-btn:disabled{opacity:0.55;cursor:default;}
        @keyframes chgspin{to{transform:rotate(360deg);}}
        .chg-scroll{overflow-x:auto;border:1px solid ${C.line};border-radius:12px;background:${C.surface};margin-top:14px;}
        .chg-table{border-collapse:separate;border-spacing:0;width:100%;font-variant-numeric:tabular-nums;font-size:10px;}
        .chg-table th,.chg-table td{white-space:nowrap;}
        .chg-table th.chg-sub{white-space:normal;vertical-align:middle;min-width:86px;line-height:1.35;word-break:normal;}
        .chg-grp{padding:6px 3px 4px;text-align:center;border-bottom:2px solid var(--ac);border-left:1px solid ${C.line};background:${C.bg};}
        .chg-grp-ico{font-size:13px;display:block;line-height:1;margin-bottom:2px;}
        .chg-grp-nm{font-weight:700;font-size:9.5px;color:${C.ink};}
        .chg-sub{padding:3px 3px 4px;text-align:center;font-size:8px;letter-spacing:.02em;text-transform:uppercase;color:var(--ac);font-weight:700;border-bottom:1px solid ${C.line};border-left:1px solid rgba(20,22,28,0.04);background:${C.bg};}
        .chg-sub a:hover{text-decoration:underline !important;}
        .chg-corner{position:sticky;left:0;z-index:2;background:${C.bg};text-align:left;padding:6px 10px;font-weight:700;font-size:10px;color:${C.ink};border-bottom:2px solid ${C.accent};border-right:2px solid ${C.line};}
        .chg-thc{padding:5px 5px;font-size:8px;letter-spacing:.02em;text-transform:uppercase;color:${C.muted};border-bottom:1px solid ${C.line};text-align:center;vertical-align:bottom;background:${C.bg};font-weight:700;}
        .chg-thc.chg-first{border-left:2px solid ${C.line};}
        .chg-player{position:sticky;left:0;z-index:1;background:${C.surface};text-align:left;padding:5px 10px;border-right:2px solid ${C.line};border-bottom:1px solid rgba(20,22,28,0.06);}
        .chg-rk{display:inline-flex;align-items:center;justify-content:center;width:17px;height:17px;border-radius:50%;border:1px solid ${C.line};font-size:9.5px;font-weight:700;margin-right:6px;vertical-align:middle;color:${C.ink};}
        .chg-nm{font-weight:700;font-size:11px;vertical-align:middle;}
        .chg-pl{font-size:8.5px;color:${C.soft};margin-left:6px;vertical-align:middle;}
        .chg-sc{text-align:center;padding:4px 3px;border-bottom:1px solid rgba(20,22,28,0.06);border-left:1px solid rgba(20,22,28,0.04);}
        .chg-v{font-weight:800;font-size:10.5px;color:var(--ac);}
        .chg-empty{color:${C.soft};font-size:11px;}
        .chg-zero .chg-v{color:${C.soft};font-weight:600;}
        .chg-totc{text-align:center;padding:4px 7px;border-left:2px solid ${C.line};border-bottom:1px solid rgba(20,22,28,0.06);}
        .chg-totc span{font-weight:800;font-size:11.5px;color:${C.accent};}
        .chg-tott{text-align:center;padding:4px 8px;font-size:9.5px;font-weight:600;color:${C.ink};border-bottom:1px solid rgba(20,22,28,0.06);}
        .chg-table tbody tr:hover td,.chg-table tbody tr:hover th.chg-player{background:${C.accsoft};}
        .chg-legend{display:flex;flex-wrap:wrap;gap:8px 16px;margin:14px 0 4px;font-size:11.5px;color:${C.muted};}
        .chg-chip{display:inline-flex;align-items:center;gap:6px;}
        .chg-sw{width:10px;height:10px;border-radius:3px;display:inline-block;}
        .chg-foot{font-size:11.5px;line-height:1.7;color:${C.soft};max-width:880px;margin-top:12px;}
        .chg-foot b{color:${C.muted};font-weight:700;}
        .chg-prize{display:inline-flex;align-items:center;gap:8px;margin-top:12px;padding:8px 13px;background:${C.accent};color:var(--white);font-size:12px;font-weight:700;border-radius:8px;}
        .chg-play{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;}
        .chg-playchip{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:${C.accent};color:var(--white);padding:8px 14px;border-radius:8px;font-family:${FONT};font-size:12px;font-weight:700;text-decoration:none;text-align:center;}
        @media(max-width:600px){.chg-play{display:grid;grid-template-columns:repeat(2,1fr);grid-auto-rows:1fr;}.chg-play:has(> :nth-child(4):last-child),.chg-play:has(> :nth-child(-n+3):last-child){grid-template-columns:1fr;}.chg-playchip{width:100%;box-sizing:border-box;}}
      `}</style>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <button className={`pill${view === 'board' ? ' on' : ''}`} onClick={() => setView('board')}><ListChecks size={14} /> Leaderboard</button>
        <button className={`pill${view === 'winners' ? ' on' : ''}`} onClick={() => setView('winners')}><Trophy size={14} /> Winners{"'"} Circle</button>
      </div>
      {view === 'winners' ? (
        <WinnersCircle winners={winners} loaded={winLoaded} onOpen={(id) => { setChId(id); setView('board'); }} />
      ) : (
      <div className="card" style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ background: C.accsoft, color: C.accent, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6 }}>{ch.kicker || 'Challenge'}</span>
          {(ch.until && Date.parse(ch.until) <= Date.now())
            ? <span style={{ fontSize: 11.5, color: C.danger, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}><Clock size={12} /> {ch.closedLabel || (ch.daily ? 'This day is over, results frozen' : 'Closed, results frozen')}</span>
            : ch.closesLabel
              ? <span style={{ fontSize: 11.5, color: C.muted, display: 'inline-flex', alignItems: 'center', gap: 5 }}><Clock size={12} /> {ch.closesLabel}</span>
              : <span style={{ fontSize: 11.5, color: C.muted, display: 'inline-flex', alignItems: 'center', gap: 5 }}><Clock size={12} /> {ch.daily ? 'Resets daily at midnight ET' : `opens ${ch.sinceLabel}`}</span>}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 8 }}>{ch.title}</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 3, maxWidth: 760 }}>{ch.blurb}</div>
        {ch.prize ? (<div className="chg-prize"><Trophy size={13} strokeWidth={2.4} /> {ch.prize}</div>) : null}

        {cols.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: C.soft }}>{ch.daily ? 'Play today' : 'Play the quizzes'}</span>
            <div className="chg-play">
              {cols.map((col) => (
                <Link key={col.quizId} href={`/quiz/${col.quizId}`} className="chg-playchip">{colLabel(col)} <ArrowLeft size={13} style={{ transform: 'rotate(180deg)', flex: 'none' }} /></Link>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: C.soft }}>Challenge</span>
          <select value={ch.id} onChange={(e) => setChId(e.target.value)} style={{ padding: '8px 12px', border: `1px solid ${C.line}`, borderRadius: 8, fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.ink, background: T.white, cursor: 'pointer', maxWidth: 280 }}>
            <optgroup label="Daily Challenge">
              {menu.filter((it) => it.daily).map((it) => (
                <option key={it.id} value={it.id}>{it.label}</option>
              ))}
            </optgroup>
            {menu.some((it) => !it.daily) && (
              <optgroup label="Events">
                {menu.filter((it) => !it.daily).map((it) => (
                  <option key={it.id} value={it.id}>{it.label}{it.closed ? ' (closed)' : ''}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        <div className="chg-meta">
          <span><b>{data ? data.totalRegisteredPlayers : '\u2014'}</b> registered players</span>
          <span>{ch.firstAttemptOnly ? 'First attempt only' : 'Best attempt per quiz'}</span>
          {data && data.generatedAt ? <span>Updated <b>{chUpdated(data.generatedAt)}</b></span> : null}
          <button className="chg-btn" onClick={() => load(true)} disabled={refreshing}><RefreshCw size={12} strokeWidth={2.4} style={{ animation: refreshing ? 'chgspin 0.8s linear infinite' : 'none' }} /> Refresh</button>
          <button className="chg-btn" onClick={doShare}><Share2 size={12} strokeWidth={2.4} /> {shared ? 'Copied!' : 'Share'}</button>
        </div>

        {!loaded ? (
          <div style={{ fontSize: 13, color: C.soft, padding: '24px 0' }}>Loading the standings…</div>
        ) : users.length === 0 ? (
          <div style={{ fontSize: 13, color: C.soft, padding: '24px 0' }}>No registered players have played yet. Sign Up before a quiz to put your name in the running.</div>
        ) : (
          <div className="chg-scroll">
            <table className="chg-table">
              <thead>
                <tr>
                  <th className="chg-corner" rowSpan={2}>Player</th>
                  {ch.groups.map((g) => (
                    <th key={g.key} className="chg-grp" colSpan={g.columns.length} style={{ '--ac': g.color }}>
                      <span className="chg-grp-ico">{g.emoji}</span><span className="chg-grp-nm">{g.label}</span>
                    </th>
                  ))}
                  <th className="chg-thc chg-first" rowSpan={2}>Percent<br />Complete</th>
                  <th className="chg-thc" rowSpan={2}>Total<br />Time</th>
                </tr>
                <tr>
                  {ch.groups.map((g) => g.columns.map((col) => (
                    <th key={col.quizId} className="chg-sub" style={{ '--ac': g.color }}><Link href={`/quiz/${col.quizId}`} style={{ color: 'inherit', textDecoration: 'none' }}>{col.icon} {col.label || colLabel(col)}</Link></th>
                  )))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const rank = i + 1; const medal = CH_MEDAL[rank]; const tint = CH_TINT[rank] || 'transparent';
                  const mine = myName && (u.username || '').toLowerCase() === myName;
                  return (
                    <tr key={u.username + i} style={{ background: mine ? C.accsoft : tint }}>
                      <th className="chg-player" style={mine ? { background: C.accsoft } : undefined}>
                        <span className="chg-rk" style={medal ? { background: medal, borderColor: medal, color: T.ink } : undefined}>{rank}</span>
                        <span className="chg-nm">{u.username}{mine ? <span style={{ color: C.accent, fontWeight: 700, marginLeft: 6, fontSize: 11 }}>you</span> : null}</span>
                        <span className="chg-pl">{u.quizzesPlayed}/{cols.length}</span>
                      </th>
                      {cols.map((col) => {
                        const sc = u.scores ? u.scores[col.quizId] : undefined;
                        if (sc === undefined || sc === null) return <td key={col.quizId} className="chg-sc chg-empty">·</td>;
                        const tm = u.times ? u.times[col.quizId] : null;
                        const tot = colTotal[col.quizId] || 0;
                        return <td key={col.quizId} className={`chg-sc${sc === 0 ? ' chg-zero' : ''}`} title={`${sc}/${tot} correct${tm != null ? ` · ${chMmss(tm)}` : ''} · ${ch.firstAttemptOnly ? 'first attempt' : 'best attempt'}`}><span className="chg-v" style={{ '--ac': col.group.color }}>{pctOf(sc, tot)}%</span></td>;
                      })}
                      <td className="chg-totc"><span>{pctOf(u.totalCorrect, totalPossible)}%</span></td>
                      <td className="chg-tott">{chMmss(u.totalTime)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="chg-legend">
          {ch.groups.map((g) => (<span key={g.key} className="chg-chip"><span className="chg-sw" style={{ background: g.color }} />{g.label} {g.emoji}</span>))}
        </div>
        <p className="chg-foot">Cells show how much of each quiz a player has completed (correct ÷ quiz total) on their {ch.firstAttemptOnly ? 'first attempt' : 'best attempt'} since the window opened; hover a cell for the raw count and time, a dot (·) means they haven{"'"}t taken that quiz yet. Ranking is by <b>total correct</b> across every quiz, ties broken by <b>least total time</b>. Only signed-up players appear. Hit Refresh for the latest.</p>
      </div>
      )}
    </div>
  );
}
// ─── IQ Points tab ────────────────────────────────────────────────────────────────
// IQ & Level view: the level, progress to the next level, and the cumulative
// IQ Points trend chart lead; the formula explainer collapses behind a "How this
// works" toggle. IQ Points are additive: they never go down and never decay.


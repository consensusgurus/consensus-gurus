'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, BadgeCheck, User, ListChecks, Flame, FunctionSquare, Clock, Trophy, RefreshCw, Share2, Download, UserPlus, X,
} from 'lucide-react';
import { QUIZZES, getQuiz } from '@/lib/quizzes';
import { quizDept as deptOf, DEPT_COLOR, DEPT_LABEL, DEPT_NAV } from '@/lib/quiz-departments';
import { CHALLENGES, getChallenge, DEFAULT_CHALLENGE_ID, challengeQuizIds, challengeColumns, dailyChallengeId, challengeMenu } from '@/lib/challenges';
import SiteHeader from '../../SiteHeader';
import Grain from '../../Grain';
import Footer from '../../Footer';

const C = {
  bg: '#f7f8fa', surface: '#fff', ink: '#1c1e24', muted: '#6b7280',
  soft: '#9aa0ab', line: 'rgba(20,22,28,0.09)', accent: '#2563eb',
  accsoft: '#e8effb', live: '#10b981', danger: '#c0392b',
};
const MEDAL = ['#e8b43a', '#b8bcc4', '#c8814b'];
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";
const MEDAL_BG = ['#fbf2dc', '#eef0f2', '#f6e9df'];
// Rank bubble. #1/#2/#3 render in gold/silver/bronze; everything else accent blue.
function RankChip({ rank, total }) {
  if (!rank) return null;
  const i = rank >= 1 && rank <= 3 ? rank - 1 : -1;
  const st = i >= 0 ? { color: MEDAL[i], background: MEDAL_BG[i] } : undefined;
  return <span className="rankchip" style={st}>#{rank}{total ? ` of ${total.toLocaleString()}` : ''}</span>;
}

function cleanTitle(t) { return (t || '').replace(/^Name (the )?/i, '').trim(); }
function getAnonId() { if (typeof window === 'undefined') return null; try { return localStorage.getItem('sot_quiz_anon'); } catch { return null; } }
function getIdentity() { if (typeof window === 'undefined') return null; try { return JSON.parse(localStorage.getItem('sot_quiz_identity')); } catch { return null; } }
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
  const uid = useMemo(() => `l${(__logoSeq += 1)}`, []);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flex: 'none' }} aria-hidden="true">
      <defs>
        <linearGradient id={`bh-${uid}`} x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3b74f0" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
        <radialGradient id={`gh-${uid}`} cx="0.5" cy="0.42" r="0.7">
          <stop offset="0" stopColor="#ffe24d" />
          <stop offset="0.55" stopColor="#fbb615" />
          <stop offset="1" stopColor="#f59008" />
        </radialGradient>
      </defs>
      <rect x="3" y="3" width="58" height="58" rx="17.5" fill={`url(#bh-${uid})`} />
      <circle cx="32" cy="32.5" r="16.4" stroke="#fff" strokeWidth="4.2" fill="none" />
      <circle cx="32" cy="32.5" r="9.6" stroke="#fff" strokeWidth="4.2" fill="none" strokeOpacity="0.9" />
      <path d="M 32 24.9 C 32.775 31.725 32.775 31.725 39.6 32.5 C 32.775 33.275 32.775 33.275 32 40.1 C 31.225 33.275 31.225 33.275 24.4 32.5 C 31.225 31.725 31.225 31.725 32 24.9 Z" fill={`url(#gh-${uid})`} />
    </svg>
  );
}

const TABS = [
  { t: 'player', label: 'Player', Icon: User },
  { t: 'quizzes', label: 'Quizzes', Icon: ListChecks },
  { t: 'challenges', label: 'Challenges', Icon: Flame },
];

// Share Stats: a shareable player card (overall rank, skill rating + tier,
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
      <div onClick={(e) => e.stopPropagation()} style={{ width: 380, maxWidth: '100%', background: '#fff', borderRadius: 14, border: `1px solid ${C.line}`, padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>Claim your name</div>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: C.soft, display: 'flex' }}><X size={18} /></button>
        </div>
        <p style={{ fontSize: 13, color: C.muted, margin: '0 0 16px', lineHeight: 1.5 }}>Pick a display name to appear on the leaderboards. Email is optional, only used to recover your name on another device. No password needed.</p>
        {err && <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.4)', color: '#c0392b', fontSize: 13 }}>{err}</div>}
        <input value={u} onChange={(e) => setU(e.target.value)} placeholder="Display name" maxLength={40} style={inp} />
        <input value={em} onChange={(e) => setEm(e.target.value)} placeholder="Email (optional)" maxLength={120} style={{ ...inp, marginTop: 10 }} />
        <button onClick={submit} disabled={busy} style={{ marginTop: 16, width: '100%', background: C.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontFamily: FONT, fontWeight: 700, fontSize: 14, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1 }}>{busy ? 'Joining…' : 'Join the leaderboard'}</button>
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
    .sort((x, y) => (y[1].rating || 0) - (x[1].rating || 0))
    .slice(0, 3);
  const maxR = cats3.length ? Math.max(...cats3.map(([, v]) => v.rating || 0), 1) : 1;
  const label = (k) => (byKey && byKey[k] && byKey[k].label) || k;
  function copy() {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sourceoftruths.com';
    const url = `${origin}/quizzes/hub?player=${encodeURIComponent(profile.userKey || '')}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }).catch(() => {});
  }
  const cell = { background: C.bg, borderRadius: 12, padding: '12px 13px' };
  const lbl = { fontFamily: FONT, fontWeight: 700, fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase', color: C.muted };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(20,22,28,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: FONT }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 440, maxWidth: '100%', background: '#fff', borderRadius: 16, border: `1px solid ${C.line}`, overflow: 'hidden', color: C.ink }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${C.line}` }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Logo size={20} /><span style={{ fontWeight: 800, fontSize: 14 }}>Source of Truths</span></span>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: C.soft, display: 'flex' }}><ArrowLeft size={0} /><span style={{ fontSize: 20, lineHeight: 1 }}>&times;</span></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 18px 12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.name}</div>
            <div style={{ marginTop: 5 }}><span style={{ background: profile.tierBg || C.bg, color: profile.tierFg || C.muted, fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>{(profile.tier || '').replace(/ Tier$/, '')}</span> <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Skill {Number(profile.rating || 0).toLocaleString()}</span></div>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}><span style={{ fontSize: 12.5, fontWeight: 700 }}>{label(k)}</span><span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>{Number(v.rating || 0).toLocaleString()}</span></div>
                  <div style={{ height: 8, background: C.bg, borderRadius: 5, overflow: 'hidden' }}><div style={{ width: `${Math.round(((v.rating || 0) / maxR) * 100)}%`, height: '100%', background: C.accent }} /></div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div style={{ display: 'flex', gap: 9, padding: '16px 18px 18px' }}>
          <button onClick={copy} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: C.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '11px 14px', fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}><Share2 size={15} strokeWidth={2.4} /> {copied ? 'Link copied!' : 'Copy share link'}</button>
          <a href={`/api/quiz/share-card?key=${encodeURIComponent(profile.userKey || '')}`} target="_blank" rel="noopener noreferrer" download="source-of-truths-stats.png" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${C.line}`, background: '#fff', color: C.ink, borderRadius: 10, padding: '11px 14px', fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: 'pointer', textDecoration: 'none' }}><Download size={15} strokeWidth={2.4} /> Image</a>
          <button onClick={onClose} style={{ border: `1px solid ${C.line}`, background: '#fff', color: C.ink, borderRadius: 10, padding: '11px 16px', fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function StatHubClient() {
  const scope = 'all'; // category selector removed; Stat Hub always shows overall + per-category table
  const [tab, setTab] = useState('player');

  const [me, setMe] = useState(null);
  const [stats, setStats] = useState([]);     // /api/quiz/stats
  const [totals, setTotals] = useState({ byQuiz: {}, leaders: {}, total: 0, totalTime: 0 });
  const [shareOpen, setShareOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [board, setBoard] = useState(null); // full Elo ranking of every player (incl. anon)

  const catalog = useMemo(() => (QUIZZES || []).filter((q) => q && q.id).map((q) => ({
    id: q.id, title: q.navTitle || cleanTitle(q.title) || q.id, dept: deptOf(q),
  })), []);
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
    fetch('/api/quiz/totals').then((r) => r.json()).then((d) => { if (d && !d.error) setTotals({ byQuiz: d.byQuiz || {}, leaders: d.leaders || {}, total: d.total || 0, totalTime: d.totalTime || 0 }); }).catch(() => {});
    fetch('/api/quiz/elo?full=1').then((r) => r.json()).then((d) => { if (d && Array.isArray(d.players)) setBoard(d.players); }).catch(() => {});
  }, []);

  // Inline player viewing: clicking a player in the ranking loads their full
  // profile in place (no page nav). null = my own stats.
  const [viewKey, setViewKey] = useState(null);
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
    const tb = sp.get('tab');
    if (tb && TABS.some((x) => x.t === tb)) setTab(tb);
  }, []);
  const viewing = !!viewKey;
  const profile = viewing ? viewProfile : me;
  const found = profile && profile.found;
  const rating = profile ? (profile.rating || 1500) : 1500;
  const bestCat = useMemo(() => {
    const bc = profile && profile.byCategory;
    if (!bc) return null;
    // Best category = where the player ranks highest on COMPLETED; ties break to
    // skill (rating) rank in that category, then to played rank.
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
  const tierBg = profile && profile.tierBg ? profile.tierBg : '#eceef1';
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
      if (!el) return;
      el.style.display = '';
      const maxRows = w <= 560 ? 2 : 1;
      const tops = [];
      for (const child of bar.children) {
        if (child.offsetWidth === 0 && child.offsetHeight === 0) continue;
        const t = child.offsetTop;
        if (!tops.some((x) => Math.abs(x - t) <= 2)) tops.push(t);
      }
      el.style.display = tops.length > maxRows ? 'none' : '';
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
    .qzhub .pvbtn.on{background:#fff;color:${C.ink};font-weight:700;box-shadow:0 1px 2px rgba(20,22,28,0.06);}
    .qzhub .dd{position:relative;}
    .qzhub .ddbtn{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid ${C.line};border-radius:10px;padding:9px 12px;cursor:pointer;font:inherit;min-width:200px;}
    .qzhub .ddmenu{position:absolute;top:calc(100% + 6px);right:0;z-index:30;background:#fff;border:1px solid ${C.line};border-radius:10px;box-shadow:0 8px 24px rgba(20,22,28,0.12);padding:6px;min-width:430px;display:grid;grid-template-columns:1fr 1fr;gap:1px 4px;}
    .qzhub .ddmenu .ddall{grid-column:1 / -1;}
    .qzhub .dditem{display:flex;align-items:center;gap:9px;padding:7px 9px;border-radius:7px;cursor:pointer;font-size:13px;}
    .qzhub .dditem:hover{background:${C.bg};}
    .qzhub .dot{width:9px;height:9px;border-radius:3px;flex:none;}
    .qzhub .tabs{display:flex;gap:6px;background:#eceef1;border-radius:10px;padding:4px;margin:16px 0;}
    .qzhub .tab{flex:1;border:none;background:transparent;border-radius:7px;padding:9px;font:inherit;font-family:${FONT};font-size:13px;color:${C.muted};cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;}
    .qzhub .tabcue{display:none;}
    @media(max-width:680px){.qzhub .tab{font-size:12px;padding:9px 4px;gap:4px;}}
    .qzhub .tab.on{background:#fff;color:${C.ink};font-weight:700;box-shadow:0 1px 2px rgba(20,22,28,0.06);}
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
    .qzhub .hubbtn{display:flex;align-items:center;gap:7px;background:${C.accent};color:#fff;padding:10px 15px;border-radius:10px;font-family:${FONT};font-weight:700;font-size:13px;border:none;cursor:pointer;white-space:nowrap;}
    .qzhub .hubbtn:hover{filter:brightness(1.06);}
    @media(max-width:560px){.qz-playerbar{flex-wrap:wrap !important;align-items:center !important;gap:10px 14px !important;}.qz-playerbar .qz-div{display:none !important;}.qz-playerbar .qz-stats{order:9 !important;flex:1 1 100% !important;margin-left:0 !important;justify-content:space-between !important;gap:10px !important;}.qz-playerbar .qz-bestcat{order:3 !important;}.qz-playerbar .hubbtn{order:4 !important;margin-left:auto !important;flex:0 0 auto !important;}}
  `;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', position: 'relative' }}>
      <Grain />
      <style>{css}</style>
      <div className="qzhub" style={{ maxWidth: 1180, margin: '0 auto', padding: '8px 24px 70px', position: 'relative' }}>

        {/* Shared site header on every page */}
        <SiteHeader active="quizzes" bare />

        {/* player bar — same layout as the main quiz page; Share Stats in place of Sort + Stat Hub */}
        <div ref={playerBarRef} className="card qz-playerbar" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 16, padding: '11px 14px', marginTop: 12, overflow: 'visible', position: 'relative', zIndex: 40 }}>
          {profile && profile.name ? (
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div className="lbl">Player</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 16, fontWeight: 800, color: C.ink, lineHeight: 1.15, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.name}{!profile.isAnon ? <BadgeCheck size={13} strokeWidth={2.5} style={{ color: C.accent, flex: 'none' }} /> : null}</div>
            </div>
          ) : (
            <button onClick={() => setSignupOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.accent, color: '#fff', border: 'none', borderRadius: 9, padding: '9px 14px', fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}><UserPlus size={15} /> Sign up</button>
          )}
          <div className="qz-div" style={{ width: 1, height: 34, background: C.line }} />
          <div>
            <div className="lbl">Skill rank</div>
            {found && profile.rank ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: C.accent, lineHeight: 1 }}>{`#${profile.rank}`}</span>
                {profile.totalPlayers ? <span style={{ fontSize: 11, color: C.muted }}>of {profile.totalPlayers.toLocaleString()}</span> : null}
              </div>
            ) : (
              <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, lineHeight: 1.2, marginTop: 2, maxWidth: 160 }}>Play your first quiz to populate</div>
            )}
          </div>
          <div className="qz-stats" style={{ display: 'flex', flex: '1 1 auto', justifyContent: 'space-evenly', gap: 12, marginLeft: 18, flexWrap: 'wrap' }}>
            <div><div style={{ fontSize: 17, fontWeight: 700 }}>{found ? profile.activity.played : '—'}</div><div className="lbl">played</div></div>
            <div><div style={{ fontSize: 17, fontWeight: 700 }}>{found ? profile.activity.correct.toLocaleString() : '—'}</div><div className="lbl">correct</div></div>
            <div><div style={{ fontSize: 17, fontWeight: 700 }}>{found ? `${profile.activity.accuracy}%` : '—'}</div><div className="lbl">accuracy</div></div>
            <div><div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}><span style={{ fontSize: 17, fontWeight: 700 }}>{found ? profile.activity.completed : '—'}</span>{found && catalog.length ? <span style={{ fontSize: 11, fontWeight: 600, color: C.soft }}>({profile.activity.completed > 0 && profile.activity.completed / catalog.length < 0.005 ? '<1' : Math.round((profile.activity.completed / catalog.length) * 100)}%)</span> : null}</div><div className="lbl">completed</div></div>
          </div>
          {bestCat ? (
            <div className="qz-bestcat" ref={bestCatRef}>
              <div className="lbl">Best category</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.ink, lineHeight: 1.2 }}>{DEPT_LABEL[bestCat.key] || bestCat.key}</span>
                {bestCat.rank ? <span style={{ fontSize: 11, color: C.muted }}>#{bestCat.rank}{bestCat.catTotal ? ` of ${bestCat.catTotal.toLocaleString()}` : ''}</span> : null}
              </div>
            </div>
          ) : null}
          {found ? (
            <button onClick={() => setShareOpen(true)} className="hubbtn"><Share2 size={15} strokeWidth={2.4} /> Share Stats</button>
          ) : null}
        </div>

        {viewing ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: C.accsoft, border: `1px solid ${C.line}`, borderRadius: 10, padding: '8px 14px', marginTop: 10 }}>
            <span style={{ fontSize: 13, color: C.ink }}>Viewing <b>{(viewProfile && viewProfile.name) || 'player'}</b>{"'"}s stats</span>
            <button onClick={() => { setViewKey(null); if (typeof window !== 'undefined' && window.history) window.history.replaceState(null, '', '/quizzes/hub'); }} style={{ border: 'none', background: C.accent, color: '#fff', borderRadius: 7, padding: '6px 13px', font: 'inherit', fontFamily: FONT, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Back to my stats</button>
          </div>
        ) : null}

        {/* tabs */}
        <div className="tabs">
          {TABS.map(({ t, label, Icon }) => (
            <button key={t} className={`tab${tab === t ? ' on' : ''}`} onClick={() => setTab(t)}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {tab === 'player' && <PlayerPanel me={profile} scope={scope} cats={cats} byKey={byKey} totalQuizzes={catalog.length} board={board} myName={myName} myAnonKey={myAnonKey} titleById={titleById} pview={pview} setPview={setPview} viewKey={viewKey} onSelectPlayer={(k) => { const mine = (me && me.userKey && k === me.userKey) || (myAnonKey && k === myAnonKey); setViewKey(mine ? null : k); setPview(mine ? 'ranking' : 'category'); }} />}
        {tab === 'quizzes' && <QuizzesPanel me={profile} scope={scope} byKey={byKey} catalog={catalog} stats={statsById} totals={totals} totalPlays={totalPlays} />}
        {tab === 'challenges' && <ChallengesPanel me={profile} />}
      </div>

      {shareOpen && found && <ShareStatsModal profile={profile} byKey={byKey} onClose={() => setShareOpen(false)} />}
      {signupOpen && <SignupModal onClose={() => setSignupOpen(false)} />}
      <Footer />
    </div>
  );
}

// ─── small helpers ──────────────────────────────────────────────────────────
// A compact metric for the profile header: label, value, and a "#rank" chip.
function ChipMetric({ label, value, rank, cls }) {
  return (
    <div className={cls}>
      <div className="lbl">{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{value}<RankChip rank={rank} /></div>
    </div>
  );
}

// Columns for the Category Detail table. `get(c, cr)` extracts the sort value
// from a category row's stats record (cr); `chip` names the per-category rank
// field on cr that renders as a #rank badge in that column.
const CAT_COLS = [
  { key: 'label', label: 'Category', align: 'left', get: (c) => (c.label || '').toLowerCase() },
  { key: 'correct', label: 'Correct', align: 'right', get: (c, cr) => cr.correct, chip: 'correctRank' },
  { key: 'played', label: 'Played', align: 'right', get: (c, cr) => (cr.played != null ? cr.played : cr.matches), chip: 'playedRank' },
  { key: 'completed', label: 'Completed', align: 'right', get: (c, cr) => cr.completed, chip: 'completedRank' },
  { key: 'accuracy', label: 'Accuracy', align: 'right', get: (c, cr) => cr.accuracy, chip: 'accuracyRank' },
  { key: 'days', label: 'Days', align: 'right', get: (c, cr) => cr.daysPlayed || 0, chip: 'daysRank' },
  { key: 'rating', label: 'Skill Rating', align: 'right', get: (c, cr) => cr.rating, chip: 'rank' },
];

// Share of a quiz pool a player has aced (completed / pool size). Used in the
// Category table's Completed column, scoped per-category (overall row uses the
// whole catalog, each category row uses that category's quiz count).
function completedPct(n, d) {
  if (!d || n == null) return '';
  if (n > 0 && n / d < 0.005) return '<1%';
  return `${Math.round((n / d) * 100)}%`;
}

// ─── Player tab ─────────────────────────────────────────────────────────────
function Metric({ label, value, sub, rank, total, avg }) {
  return (
    <div className="metric">
      <div className="lbl metric-lbl">
        <span style={{ whiteSpace: 'nowrap' }}>{label}</span><RankChip rank={rank} total={total} />
      </div>
      <div className="v">{value}</div>
      {avg != null ? <div style={{ fontSize: 10.5, color: C.muted, marginTop: 2 }}>avg {avg}</div> : null}
      {sub ? <div style={{ fontSize: 10.5, color: C.muted, marginTop: 2 }}>{sub}</div> : null}
    </div>
  );
}

function PlayerPanel({ me, scope, cats, byKey, totalQuizzes, board, myName, myAnonKey, titleById, pview, setPview, viewKey, onSelectPlayer }) {
  const found = me && me.found;
  const viewing = !!viewKey;
  const a = found ? me.activity : { correct: 0, answered: 0, played: 0, completed: 0, accuracy: 0, daysPlayed: 0 };
  const ranks = (found && me.ranks) || {};
  const base = (found && me.base) || {};
  const totalPlayers = (found && me.totalPlayers) || 0;
  const pctTotal = totalQuizzes ? Math.round((a.played / totalQuizzes) * 100) : 0;
  const pctCompleted = a.played ? Math.round((a.completed / a.played) * 100) : 0;
  const byCat = (found && me.byCategory) || {};
  const catRows = (scope === 'all' ? cats : cats.filter((c) => c.key === scope));

  // Column sort for the Category Detail table. The Overall row is rendered
  // separately and stays pinned on top; only these category rows get sorted.
  const [catSort, setCatSort] = useState({ col: null, dir: 'desc' });
  const sortedCatRows = useMemo(() => {
    if (!catSort.col) return catRows;
    const col = CAT_COLS.find((cc) => cc.key === catSort.col) || CAT_COLS[0];
    const arr = [...catRows];
    arr.sort((A, B) => {
      const crA = byCat[A.key], crB = byCat[B.key];
      if (col.key !== 'label') {
        // categories the player hasn't touched have no stats; always sink them.
        if (!crA && !crB) return A.label.localeCompare(B.label);
        if (!crA) return 1;
        if (!crB) return -1;
      }
      const av = col.get(A, crA || {});
      const bv = col.get(B, crB || {});
      let cmp = typeof av === 'string' ? av.localeCompare(bv) : ((av || 0) - (bv || 0));
      if (catSort.dir === 'desc') cmp = -cmp;
      return cmp;
    });
    return arr;
  }, [catRows, catSort, byCat]);
  const clickCatSort = (col) => setCatSort((st) => (st.col === col.key
    ? { col: col.key, dir: st.dir === 'desc' ? 'asc' : 'desc' }
    : { col: col.key, dir: col.key === 'label' ? 'asc' : 'desc' }));

  const toggle = (
    <div style={{ display: 'flex', gap: 3, background: '#eceef1', borderRadius: 9, padding: 3, flex: 1, width: '100%', boxSizing: 'border-box' }}>
      {[['ranking', 'Ranking'], ['category', 'Category'], ['rating', 'Skill Rating'], ['activity', 'Activity']].map(([v, lbl]) => (
        <button key={v} onClick={() => setPview(v)} style={{ flex: 1, textAlign: 'center', border: 'none', background: pview === v ? '#fff' : 'transparent', color: pview === v ? C.ink : C.muted, fontWeight: pview === v ? 700 : 600, boxShadow: pview === v ? '0 1px 2px rgba(20,22,28,0.06)' : 'none', borderRadius: 7, padding: '7px 6px', font: 'inherit', fontFamily: FONT, fontSize: 12.5, cursor: 'pointer' }}>{lbl}</button>
      ))}
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        {toggle}
      </div>
      {pview === 'rating' ? (
        <RatingPanel me={me} titleById={titleById} viewing={viewing} />
      ) : (
      <div className="card" style={{ padding: '14px 16px' }}>
        {pview === 'ranking' ? (
          <UserBaseBody board={board} myName={myName} myAnonKey={myAnonKey} onSelectPlayer={onSelectPlayer} viewKey={viewKey} />
        ) : pview === 'activity' ? (
          <ActivityFeed recent={found ? me.recent : []} titleById={titleById} viewing={viewing} />
        ) : !found ? (
          <div style={{ fontSize: 13, color: C.soft, padding: '6px 0' }}>Play a few quizzes and your breakdown shows up here.</div>
        ) : (
          <div style={{ overflow: 'auto' }}>
            <table>
              <thead><tr>
                {CAT_COLS.map((col) => (
                  <th key={col.key} onClick={() => clickCatSort(col)} style={{ textAlign: col.align, whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none', color: catSort.col === col.key ? C.accent : undefined }}>
                    {col.label}{catSort.col === col.key ? (catSort.dir === 'desc' ? ' \u2193' : ' \u2191') : ''}
                  </th>
                ))}
              </tr></thead>
              <tbody>
                {scope === 'all' ? (
                  <tr style={{ background: '#f3f7fe' }}>
                    <td style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>Overall</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}><b>{a.correct.toLocaleString()}</b><RankChip rank={ranks.correct} />{base.correct != null ? <div style={{ fontSize: 9.5, color: C.muted }}>avg {base.correct.toLocaleString()}</div> : null}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}><b>{a.played.toLocaleString()}</b><RankChip rank={ranks.played} />{base.played != null ? <div style={{ fontSize: 9.5, color: C.muted }}>avg {base.played.toLocaleString()}</div> : null}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}><b>{a.completed.toLocaleString()}</b>{totalQuizzes ? <span style={{ fontSize: 10, color: C.soft, marginLeft: 4 }}>({completedPct(a.completed, totalQuizzes)})</span> : null}<RankChip rank={ranks.completed} />{base.completed != null ? <div style={{ fontSize: 9.5, color: C.muted }}>avg {base.completed.toLocaleString()}</div> : null}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}><b>{a.accuracy}%</b><RankChip rank={ranks.accuracy} />{base.accuracy != null ? <div style={{ fontSize: 9.5, color: C.muted }}>avg {base.accuracy}%</div> : null}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}><b>{a.daysPlayed || 0}</b><RankChip rank={ranks.daysPlayed} />{base.daysPlayed != null ? <div style={{ fontSize: 9.5, color: C.muted }}>avg {base.daysPlayed.toLocaleString()}</div> : null}</td>
                    <td className="score" style={{ textAlign: 'right', color: C.accent, whiteSpace: 'nowrap' }}><b>{(me.rating || 1500).toLocaleString()}</b><RankChip rank={ranks.rating} total={totalPlayers} />{base.rating != null ? <div style={{ fontSize: 9.5, color: C.muted }}>avg {base.rating.toLocaleString()}</div> : null}</td>
                  </tr>
                ) : null}
                {sortedCatRows.map((c) => {
                  const cr = byCat[c.key];
                  const muted = !cr;
                  return (
                    <tr key={c.key}>
                      <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}><span className="dot" style={{ background: c.c, display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }} />{c.label}</td>
                      <td style={{ textAlign: 'right', color: muted ? C.soft : C.ink, whiteSpace: 'nowrap' }}>{cr ? cr.correct.toLocaleString() : '\u2014'}{cr && cr.correctRank ? <RankChip rank={cr.correctRank} /> : null}</td>
                      <td style={{ textAlign: 'right', color: muted ? C.soft : C.ink, whiteSpace: 'nowrap' }}>{cr ? (cr.played != null ? cr.played : cr.matches) : '\u2014'}{cr && cr.playedRank ? <RankChip rank={cr.playedRank} /> : null}</td>
                      <td style={{ textAlign: 'right', color: muted ? C.soft : C.ink, whiteSpace: 'nowrap' }}>{cr ? <>{cr.completed}{c.count ? <span style={{ fontSize: 10, color: C.soft, marginLeft: 4 }}>({completedPct(cr.completed, c.count)})</span> : null}</> : '\u2014'}{cr && cr.completedRank ? <RankChip rank={cr.completedRank} /> : null}</td>
                      <td style={{ textAlign: 'right', color: muted ? C.soft : C.ink, whiteSpace: 'nowrap' }}>{cr ? `${cr.accuracy}%` : '\u2014'}{cr && cr.accuracyRank ? <RankChip rank={cr.accuracyRank} /> : null}</td>
                      <td style={{ textAlign: 'right', color: muted ? C.soft : C.ink, whiteSpace: 'nowrap' }}>{cr ? (cr.daysPlayed || 0) : '\u2014'}{cr && cr.daysRank ? <RankChip rank={cr.daysRank} /> : null}</td>
                      <td className="score" style={{ textAlign: 'right', color: muted ? C.soft : C.accent, whiteSpace: 'nowrap' }}>{cr ? cr.rating.toLocaleString() : '\u2014'}{cr && cr.rank ? <RankChip rank={cr.rank} total={cr.catTotal} /> : null}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ fontSize: 10.5, color: C.soft, marginTop: 8 }}>The Overall row ranks you against all {totalPlayers.toLocaleString()} players on every metric (avg = player-base average) and stays pinned on top. Each #rank chip in a category row is your standing among the players active in that category. Tap any column header to sort.</div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}

// Per-quiz play feed: the current player's recent games, newest first, each
// linking to that quiz. Lives under the Player tab's "Activity Feed" view.
function ActivityFeed({ recent, titleById, viewing }) {
  if (!recent || !recent.length) return <div style={{ fontSize: 13, color: C.soft, padding: '6px 0' }}>No games on record yet. Play a quiz and it shows up here.</div>;
  return (
    <div style={{ overflow: 'auto', maxHeight: 600 }}>
      <table>
        <thead><tr>
          <th>Quiz</th>
          <th style={{ textAlign: 'right' }}>When</th>
          <th style={{ textAlign: 'right' }}>{viewing ? 'User %' : 'Your %'}</th>
          <th style={{ textAlign: 'right' }}>Rating &Delta;</th>
          <th style={{ textAlign: 'right' }}>Rank &Delta;</th>
          <th style={{ textAlign: 'right' }}>Cat. Rank &Delta;</th>
        </tr></thead>
        <tbody>
          {recent.map((m, i) => {
            const title = (titleById && titleById[m.quizId]) || m.quizId;
            const when = m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '\u2014';
            return (
              <tr key={i}>
                <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}><Link href={`/quiz/${m.quizId}`} style={{ color: C.ink, textDecoration: 'none' }}>{title}</Link></td>
                <td style={{ textAlign: 'right', color: C.muted, whiteSpace: 'nowrap' }}>{when}</td>
                <td style={{ textAlign: 'right' }}>{m.scorePct}%</td>
                <td className="score" style={{ textAlign: 'right', color: (m.delta >= 0) ? C.accent : C.danger, fontWeight: 700 }}>{m.delta >= 0 ? `+${m.delta}` : m.delta}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: m.rankDelta > 0 ? C.accent : m.rankDelta < 0 ? C.danger : C.muted }}>{m.rankDelta == null ? '\u2014' : m.rankDelta === 0 ? '\u00b10' : m.rankDelta > 0 ? `+${m.rankDelta}` : m.rankDelta}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: m.catRankDelta > 0 ? C.accent : m.catRankDelta < 0 ? C.danger : C.muted }}>{m.catRankDelta == null ? '\u2014' : m.catRankDelta === 0 ? '\u00b10' : m.catRankDelta > 0 ? `+${m.catRankDelta}` : m.catRankDelta}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Full ranking BODY (no card chrome; the card, title, and toggle live in
// PlayerPanel). Every player registered + anonymous, current row highlighted.
function UserBaseBody({ board, myName, myAnonKey, onSelectPlayer, viewKey }) {
  const [sort, setSort] = useState({ col: 'rating', dir: 'desc' });
  if (!board) return <div style={{ fontSize: 13, color: C.soft, padding: '6px 0' }}>Loading the full ranking…</div>;
  if (!board.length) return <div style={{ fontSize: 13, color: C.soft, padding: '6px 0' }}>No ranked players yet.</div>;
  const COLS = [
    { key: 'rank', label: '#', w: 44, align: 'left' },
    { key: 'name', label: 'Player', align: 'left', get: (p) => (p.name || '').toLowerCase() },
    { key: 'rating', label: 'Skill Rating', align: 'right', get: (p) => p.rating || 0 },
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
      <div style={{ fontSize: 11, color: C.soft, marginBottom: 10 }}>All {board.length.toLocaleString()} players, anonymous guests included. Tap a column to sort; your row is highlighted.</div>
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
              const mine = (myAnonKey && p.userKey === myAnonKey) || (myName && !p.isAnon && p.name === myName);
              const viewed = !!viewKey && p.userKey === viewKey && !mine;
              const mi = idx < 3 ? idx : -1;
              return (
                <tr key={p.userKey} style={mine ? { background: C.accsoft } : (viewed ? { background: '#fdf2e3' } : undefined)}>
                  <td style={{ fontWeight: 800, color: mi >= 0 ? MEDAL[mi] : C.soft }}>{idx + 1}</td>
                  <td style={{ fontWeight: (mine || viewed) ? 800 : 600, whiteSpace: 'nowrap' }}><button onClick={() => onSelectPlayer && onSelectPlayer(p.userKey)} style={{ border: 'none', background: 'transparent', padding: 0, font: 'inherit', fontFamily: FONT, fontWeight: 'inherit', color: C.accent, cursor: 'pointer', textAlign: 'left' }}>{p.name}</button>{p.isAnon ? <span style={{ fontSize: 10, color: C.soft, fontWeight: 600, marginLeft: 6 }}>guest</span> : null}{mine ? <span style={{ fontSize: 10, color: C.accent, fontWeight: 700, marginLeft: 6 }}>you</span> : null}{viewed ? <span style={{ fontSize: 10, color: '#b5560f', fontWeight: 700, marginLeft: 6 }}>viewing</span> : null}</td>
                  <td className="score" style={{ textAlign: 'right', color: C.accent, fontWeight: 700 }}>{(p.rating || 0).toLocaleString()}</td>
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
function QuizzesPanel({ me, scope, byKey, catalog, stats, totals, totalPlays }) {
  const found = me && me.found;
  const pool = scope === 'all' ? catalog : catalog.filter((q) => q.dept === scope);
  const rows = pool.map((q) => ({ q, s: stats[q.id] || { plays: 0, avgScorePct: 0 }, leader: totals.leaders[q.id] || '' }))
    .sort((a, b) => (b.s.plays || 0) - (a.s.plays || 0) || a.q.title.localeCompare(b.q.title));
  const playedTotal = found ? me.activity.played : 0;
  const avgScore = found ? me.activity.accuracy : 0;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, marginBottom: 16 }}>
        <Metric label="Quizzes" value={(scope === 'all' ? catalog.length : pool.length).toLocaleString()} />
        <Metric label="Total Plays" value={totalPlays.toLocaleString()} />
        <Metric label="Time Played" value={fmtPlayTime(totals.totalTime || 0)} />
        <Metric label="You've Played" value={found ? playedTotal : '—'} />
        <Metric label="Your Avg Accuracy" value={found ? `${avgScore}%` : '—'} />
      </div>
      <div className="card" style={{ padding: '4px 6px' }}>
        <div style={{ padding: '10px 10px 4px', fontSize: 13, fontWeight: 700 }}>All Quizzes <span style={{ fontWeight: 600, color: C.soft }}>({rows.length.toLocaleString()})</span></div>
        <div style={{ overflow: 'auto', maxHeight: 620 }}>
          <table>
            <thead><tr>
              <th>Quiz</th>
              <th style={{ textAlign: 'right' }}>Plays</th>
              <th style={{ textAlign: 'right' }}>Avg</th>
              <th>Top Scorer</th>
            </tr></thead>
            <tbody>
              {rows.map(({ q, s, leader }) => (
                <tr key={q.id}>
                  <td style={{ fontWeight: 600, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Link href={`/quiz/${q.id}`} className="qlink">{q.title}</Link>
                  </td>
                  <td className="score" style={{ textAlign: 'right' }}>{(s.plays || 0).toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>{s.avgScorePct || 0}%</td>
                  <td>{leader || <span style={{ color: C.soft }}>Empty</span>}</td>
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
const CH_MEDAL = { 1: '#e8b43a', 2: '#b8bcc4', 3: '#c8814b' };
const CH_TINT = { 1: 'rgba(232,180,58,0.12)', 2: 'rgba(184,188,196,0.16)', 3: 'rgba(200,129,75,0.12)' };
function chMmss(s) { const n = Math.max(0, Math.round(Number(s) || 0)); return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`; }
function chUpdated(iso) { if (!iso) return ''; try { return new Date(iso).toLocaleString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) + ' ET'; } catch (e) { return ''; } }

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
  const [menuSort, setMenuSort] = useState('new');
  const menu = useMemo(() => challengeMenu(), []);
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [shared, setShared] = useState(false);

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
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://sourceoftruths.com';
    const url = `${base}/quizzes/hub?tab=challenges&ch=${encodeURIComponent(ch.id)}`;
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
        .chg-btn{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#fff;border:1px solid ${C.line};border-radius:8px;font:inherit;font-family:${FONT};font-size:12px;font-weight:600;color:${C.ink};cursor:pointer;}
        .chg-btn:hover{background:${C.bg};}
        .chg-btn:disabled{opacity:0.55;cursor:default;}
        @keyframes chgspin{to{transform:rotate(360deg);}}
        .chg-scroll{overflow-x:auto;border:1px solid ${C.line};border-radius:12px;background:${C.surface};margin-top:14px;}
        .chg-table{border-collapse:separate;border-spacing:0;width:100%;font-variant-numeric:tabular-nums;font-size:10px;}
        .chg-table th,.chg-table td{white-space:nowrap;}
        .chg-grp{padding:6px 3px 4px;text-align:center;border-bottom:2px solid var(--ac);border-left:1px solid ${C.line};background:${C.bg};}
        .chg-grp-ico{font-size:13px;display:block;line-height:1;margin-bottom:2px;}
        .chg-grp-nm{font-weight:700;font-size:9.5px;color:${C.ink};}
        .chg-sub{padding:3px 3px 4px;text-align:center;font-size:8px;letter-spacing:.02em;text-transform:uppercase;color:var(--ac);font-weight:700;border-bottom:1px solid ${C.line};border-left:1px solid rgba(20,22,28,0.04);background:${C.bg};}
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
        .chg-prize{display:inline-flex;align-items:center;gap:8px;margin-top:12px;padding:8px 13px;background:${C.accent};color:#fff;font-size:12px;font-weight:700;border-radius:8px;}
        .chg-play{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;}
        .chg-playchip{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:${C.accent};color:#fff;padding:8px 14px;border-radius:8px;font-family:${FONT};font-size:12px;font-weight:700;text-decoration:none;text-align:center;}
        @media(max-width:600px){.chg-play{display:grid;grid-template-columns:1fr;grid-auto-rows:1fr;}.chg-playchip{width:100%;box-sizing:border-box;}}
      `}</style>

      <div className="card" style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ background: C.accsoft, color: C.accent, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6 }}>{ch.kicker || 'Challenge'}</span>
          {ch.closedLabel
            ? <span style={{ fontSize: 11.5, color: C.danger, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}><Clock size={12} /> {ch.closedLabel}</span>
            : <span style={{ fontSize: 11.5, color: C.muted, display: 'inline-flex', alignItems: 'center', gap: 5 }}><Clock size={12} /> {ch.daily ? 'Resets daily at midnight ET' : `opens ${ch.sinceLabel}`}</span>}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 8 }}>{ch.title}</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 3, maxWidth: 760 }}>{ch.blurb}</div>
        {ch.prize ? (<div className="chg-prize"><Trophy size={13} strokeWidth={2.4} /> {ch.prize}</div>) : null}

        {ch.daily && (
          <div style={{ marginTop: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: C.soft }}>Play today</span>
            <div className="chg-play">
              {cols.map((col) => (
                <Link key={col.quizId} href={`/quiz/${col.quizId}`} className="chg-playchip">{colLabel(col)} <ArrowLeft size={13} style={{ transform: 'rotate(180deg)', flex: 'none' }} /></Link>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: C.soft }}>Challenge</span>
          <select value={ch.id} onChange={(e) => setChId(e.target.value)} style={{ padding: '8px 12px', border: `1px solid ${C.line}`, borderRadius: 8, fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.ink, background: '#fff', cursor: 'pointer', maxWidth: 280 }}>
            <optgroup label="Daily Challenge">
              {(menuSort === 'new' ? menu.filter((it) => it.daily) : menu.filter((it) => it.daily).slice().reverse()).map((it) => (
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
          <button onClick={() => setMenuSort((x) => (x === 'new' ? 'old' : 'new'))} className="chg-btn">{menuSort === 'new' ? 'Newest first' : 'Oldest first'}</button>
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
          <div style={{ fontSize: 13, color: C.soft, padding: '24px 0' }}>No registered players have played yet. Sign up before a quiz to put your name in the running.</div>
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
                    <th key={col.quizId} className="chg-sub" style={{ '--ac': g.color }}>{col.icon} {col.label || colLabel(col)}</th>
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
                        <span className="chg-rk" style={medal ? { background: medal, borderColor: medal, color: '#1c1e24' } : undefined}>{rank}</span>
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
    </div>
  );
}
// ─── Rating tab ─────────────────────────────────────────────────────────────
function RatingPanel({ me, titleById, viewing }) {
  const found = me && me.found;
  const comp = found ? me.components : { start: 1500, k: 24, matches: 0, netDelta: 0, rating: 1500 };
  const recent = (found && me.recent) || [];

  return (
    <div>
      <div className="rgrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>How Your Skill Rating Works</div>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: '0 0 10px' }}>
            Every quiz you finish is a match against that quiz's difficulty. Beat the expected score and your rating rises; fall short and it dips. Heavier, harder quizzes move it more.
          </p>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: '0 0 10px' }}>
            <b style={{ color: C.ink }}>Inactivity decay:</b> when you stop playing, your rating drifts back toward the {comp.start.toLocaleString()} baseline, reaching it after three months away. Play any quiz to reset the clock.
          </p>
          <div className="formula">
            E = 1 / (1 + 10<sup>(Dq − R) / 400</sup>)<br />
            R′ = R + K · (S − E)
          </div>
          <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.8, marginTop: 10 }}>
            R = your rating · Dq = quiz difficulty · S = your result (score fraction, 0–1) · E = expected result · K = {comp.k} (volatility)
          </div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{viewing ? 'Components' : 'Your Components'}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div className="hrow" style={{ borderTop: 'none' }}><span style={{ flex: 1 }}>Season Start Rating</span><span style={{ fontWeight: 700 }}>{comp.start.toLocaleString()}</span></div>
            <div className="hrow"><span style={{ flex: 1 }}>K-Factor (Volatility)</span><span style={{ fontWeight: 700 }}>{comp.k}</span></div>
            <div className="hrow"><span style={{ flex: 1 }}>Matches Played</span><span style={{ fontWeight: 700 }}>{comp.matches}</span></div>
            <div className="hrow"><span style={{ flex: 1 }}>Net Rating From Results</span><span className="score" style={{ color: comp.netDelta >= 0 ? C.accent : C.danger }}>{comp.netDelta >= 0 ? `+${comp.netDelta}` : comp.netDelta}</span></div>
            <div className="hrow"><span style={{ flex: 1 }}>Inactivity Decay</span><span className="score" style={{ color: (comp.decayDelta || 0) < 0 ? C.danger : C.muted }}>{(comp.decayDelta || 0) === 0 ? '0' : comp.decayDelta}</span></div>
            <div className="hrow" style={{ borderTop: `2px solid ${C.ink}` }}><span style={{ flex: 1, fontWeight: 700 }}>Current Rating</span><span style={{ fontWeight: 800, color: C.accent }}>{comp.rating.toLocaleString()}</span></div>
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: '4px 6px' }}>
        <div style={{ padding: '12px 12px 4px', fontSize: 14, fontWeight: 700 }}>Recent Matches</div>
        <div style={{ overflow: 'auto' }}>
          <table>
            <thead><tr>
              <th>Quiz</th>
              <th style={{ textAlign: 'right' }}>Dq</th>
              <th style={{ textAlign: 'right' }}>{viewing ? 'User %' : 'Your %'}</th>
              <th style={{ textAlign: 'right' }}>S</th>
              <th style={{ textAlign: 'right' }}>E</th>
              <th style={{ textAlign: 'right' }}>ΔR</th>
            </tr></thead>
            <tbody>
              {recent.length === 0 && (
                <tr><td colSpan={6} style={{ color: C.soft }}>No matches yet. Finish a quiz to start your rating.</td></tr>
              )}
              {recent.map((m, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Link href={`/quiz/${m.quizId}`} className="qlink">{titleById[m.quizId] || cleanTitle(m.quizId)}</Link>
                  </td>
                  <td style={{ textAlign: 'right' }}>{m.dq.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>{m.scorePct}%</td>
                  <td style={{ textAlign: 'right' }}>{m.S.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{m.E.toFixed(2)}</td>
                  <td className="score" style={{ textAlign: 'right', color: m.delta >= 0 ? C.accent : C.danger }}>{m.delta >= 0 ? `+${m.delta}` : m.delta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

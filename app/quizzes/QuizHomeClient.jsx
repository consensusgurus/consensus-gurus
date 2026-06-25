'use client';
import React, { useState, useEffect, useMemo, useRef, createContext, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteHeader from '../SiteHeader';
import QuizPlayerBar from '../quiz/[id]/QuizPlayerBar';
import {
  Search, ChevronDown, ArrowRight, BarChart3, Crown, Sparkles, Flame,
  BadgeCheck, Clapperboard, Music, Gamepad2, Plane, Globe, Utensils,
  Briefcase, Leaf, Tv, BookOpen, Landmark, Trophy, UserPlus, Play, X,
  Check, Star,
} from 'lucide-react';
import { QUIZZES } from '@/lib/quizzes';
import {
  quizDept as deptOf, DEPT_COLOR, DEPT_LABEL, DEPT_NAV,
} from '@/lib/quiz-departments';
import { getDailyChallenge, dailyChallengeId, openChallenges, challengeQuizIds, DAILY_CHALLENGE_ON } from '@/lib/challenges';
import { isBusinessNewsHubQuiz } from '@/lib/business-news-hub';
import Grain from '../Grain';
import Footer from '../Footer';

// Brand mark (gradient ids suffixed per render so multiple instances stay unique).
let __logoSeq = 0;
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

// ─── palette / type ─────────────────────────────────────────────────────────
const C = {
  bg: '#f7f8fa', surface: '#fff', ink: '#1c1e24', muted: '#6b7280',
  soft: '#9aa0ab', line: 'rgba(20,22,28,0.09)', accent: '#2563eb',
  accsoft: '#e8effb', live: '#10b981',
};
const MEDAL = ['#e8b43a', '#b8bcc4', '#c8814b'];
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";
const STATUS_LABEL = { unplayed: 'Unplayed', played: 'Played', completed: 'Completed' };

// Per-quiz completion status for the CURRENT player, supplied once at the top of
// the tree so any quiz row can show a check (played) or a circled check (aced at
// 100%) without threading props. Visible only to that player (built from their
// own profile). Empty for signed-out/preview visitors.
const QuizDoneContext = createContext({ played: null, completed: null });
function DoneMark({ id, size = 13 }) {
  const { played, completed } = useContext(QuizDoneContext);
  if (!id || (!played && !completed)) return null;
  if (completed && completed.has(id)) {
    return <Star className="donemark" size={size} strokeWidth={1.5} fill="#e8b43a" color="#e8b43a" style={{ flex: 'none', marginLeft: 5, verticalAlign: '-2px' }} aria-label="Completed (100%)" />;
  }
  if (played && played.has(id)) {
    return <Check className="donemark" size={size} strokeWidth={2.75} style={{ color: C.live, flex: 'none', marginLeft: 5, verticalAlign: '-2px' }} aria-label="Played" />;
  }
  return null;
}

// One lucide icon per department (no global CSS / webfonts).
const DEPT_ICON = {
  movies: Clapperboard, music: Music, gaming: Gamepad2, travel: Plane,
  sports: Trophy, geography: Globe, food: Utensils, business: Briefcase,
  science: Leaf, entertainment: Tv, literature: BookOpen, history: Landmark,
  misc: Sparkles,
};

function seededShuffle(arr, seed) {
  const out = arr.slice();
  let s = (seed >>> 0) || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    const j = (s >>> 0) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function cleanTitle(t) { return (t || '').replace(/^Name (the )?/i, '').trim(); }
// Drop a leading action verb (and an optional the/all the/these) from a browse
// title for a tighter, scannable label. The FULL title is kept as the link's
// tooltip. e.g. "Click the Countries of Europe" -> "Countries of Europe",
// "Match the Slogan to the Company" -> "Slogan to the Company".
const VERB_RE = /^(Click|Name|Guess|Find|Identify|Locate|Pick|Select|Match|Pinpoint)\b\s*(all the|the|these)?\s*/i;
function stripVerb(t) {
  const out = (t || '').replace(VERB_RE, '').trim();
  return out || (t || '');
}
function relTime(iso) {
  if (!iso) return '';
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '';
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}
function getAnonId() {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem('sot_quiz_anon'); } catch { return null; }
}
function getIdentity() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('sot_quiz_identity')); } catch { return null; }
}

// ─── small presentational bits ──────────────────────────────────────────────
// Wraps a player name so clicking it opens that player on the Stat Hub
// (?player=<key>). Used inside quiz-row anchors, so it suppresses the parent
// link's navigation. No key (unattributable play) renders plain, unlinked.
function PlayerLink({ userKey, children }) {
  const router = useRouter();
  if (!userKey) return children;
  const go = (e) => { e.preventDefault(); e.stopPropagation(); router.push(`/quizzes/hub?player=${encodeURIComponent(userKey)}`); };
  return (
    <span role="link" tabIndex={0} onClick={go} onKeyDown={(e) => { if (e.key === 'Enter') go(e); }} style={{ cursor: 'pointer' }}>{children}</span>
  );
}

function WhoTag({ name, isAnon }) {
  if (isAnon) return (
    <span style={{ whiteSpace: 'nowrap' }}>
      <span style={{ fontWeight: 600, color: C.muted }}>{name}</span>{' '}
      <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: C.soft, border: `1px solid ${C.line}`, borderRadius: 4, padding: '1px 4px' }}>guest</span>
    </span>
  );
  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      <span style={{ fontWeight: 700 }}>{name}</span>{' '}
      <BadgeCheck size={12} strokeWidth={2.5} style={{ color: C.accent, verticalAlign: '-2px' }} aria-hidden="true" />
    </span>
  );
}

function Medal({ i }) {
  if (i < 3) return (
    <span className="medaldot" style={{ flex: 'none', width: 18, height: 18, borderRadius: '50%', background: MEDAL[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: C.ink }}>{i + 1}</span>
  );
  return <span style={{ flex: 'none', width: 18, textAlign: 'center', fontSize: 11, color: C.soft }}>{i + 1}</span>;
}

// Leaderboard row: medal + name + value, with a gold/silver/bronze (neutral
// for 4th+) progress bar under the name scaled to the top score.
function LbRow({ i, name, value, frac }) {
  const col = i < 3 ? MEDAL[i] : C.soft;
  const w = Math.max(4, Math.min(100, Math.round((frac || 0) * 100)));
  return (
    <div className="lrow">
      <Medal i={i} />
      <div style={{ flex: '1 1 auto', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="qtitle" style={{ flex: '1 1 auto' }}>{name}</span>
          <span style={{ flex: 'none', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        </div>
        <div style={{ height: 3, borderRadius: 3, background: '#eef1f5', marginTop: 4, overflow: 'hidden' }}><div className="lbbar" style={{ height: '100%', width: `${w}%`, background: col }} /></div>
      </div>
    </div>
  );
}

// Sign-up popup: claim a display name (email optional) so the player's name
// shows on the leaderboards. Posts to /api/quiz/join, stores identity, reloads.
function SignupModal({ onClose }) {
  const [u, setU] = useState('');
  const [em, setEm] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const inp = { width: '100%', boxSizing: 'border-box', border: `1px solid ${C.line}`, borderRadius: 10, padding: '11px 13px', fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontSize: 15, color: C.ink, outline: 'none' };
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
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(20,22,28,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 380, maxWidth: '100%', background: '#fff', borderRadius: 14, border: `1px solid ${C.line}`, padding: 22, fontFamily: 'Manrope, system-ui, -apple-system, sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>Claim your name</div>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: C.soft, display: 'flex' }}><X size={18} /></button>
        </div>
        <p style={{ fontSize: 13, color: C.muted, margin: '0 0 16px', lineHeight: 1.5 }}>Pick a display name to appear on the leaderboards. Email is optional, only used to recover your name on another device. No password needed.</p>
        {err && <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.4)', color: '#c0392b', fontSize: 13 }}>{err}</div>}
        <input value={u} onChange={(e) => setU(e.target.value)} placeholder="Display name" maxLength={15} style={inp} />
        <input value={em} onChange={(e) => setEm(e.target.value)} placeholder="Email (optional)" maxLength={120} style={{ ...inp, marginTop: 10 }} />
        <button onClick={submit} disabled={busy} style={{ marginTop: 16, width: '100%', background: C.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontFamily: 'Manrope, system-ui, -apple-system, sans-serif', fontWeight: 700, fontSize: 14, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1 }}>{busy ? 'Joining…' : 'Join the leaderboard'}</button>
      </div>
    </div>
  );
}

// ─── main ───────────────────────────────────────────────────────────────────
export default function QuizHomeClient() {
  const [scope, setScope] = useState('all');
  const [ddOpen, setDdOpen] = useState(false);
  const playerBarRef = useRef(null);
  const bestCatRef = useRef(null);
  const quizzesRef = useRef(null);
  const [search, setSearch] = useState('');
  const [listMode, setListMode] = useState(null); // null | 'newest' | 'mostplayed' | 'live' (View all expansions)
  const [doneFilter, setDoneFilter] = useState('all'); // 'all' | 'unplayed' | 'played' | 'completed' (my-progress filter)
  const [boardsExpanded, setBoardsExpanded] = useState(false); // header click expands both boards 5 -> 10
  const [mobileBoard, setMobileBoard] = useState(null); // mobile-only: null | 'lb' | 'live' (which board panel is shown)
  const lastTapRef = useRef({ k: null, t: 0 });
  const dblTapBoard = (k) => {
    const now = Date.now(); const last = lastTapRef.current;
    if (last.k === k && now - last.t < 400) { setMobileBoard((v) => (v === k ? null : k)); lastTapRef.current = { k: null, t: 0 }; }
    else { lastTapRef.current = { k, t: now }; }
  };

  const [totals, setTotals] = useState({ byQuiz: {}, leaders: {}, leaderKeys: {}, today: 0 });
  const [eloBoard, setEloBoard] = useState([]); // [{rank,name,isAnon,userKey}]
  const [eloScope, setEloScope] = useState('all');
  const [catBoards, setCatBoards] = useState({}); // { dept: [{rank,name,isAnon,userKey,rating}] } for the "Top Rated <Category>" slides
  const [recent, setRecent] = useState([]); // [{quizId,username,score,total,playedAt,isAnon,attempt}]
  const [me, setMe] = useState(null);
  const [lbIdx, setLbIdx] = useState(0); // which leaderboard stat is showing
  const [view, setView] = useState('compact'); // 'compact' | 'detailed' browse layout
  const [statsById, setStatsById] = useState({}); // /api/quiz/stats keyed by quizId
  const [signupOpen, setSignupOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [dailyLb, setDailyLb] = useState(null); // today's daily-challenge standings (registered players)
  const [chRun, setChRun] = useState(null); // local run-state for today's daily challenge (completion ticks)
  const [isMobile, setIsMobile] = useState(false);
  const [acc, setAcc] = useState({ lb: true }); // mobile-only: which accordion panels are open
  const toggleAcc = (k) => setAcc((o) => ({ ...o, [k]: !o[k] }));
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(max-width:560px)');
    const on = () => setIsMobile(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const [todayData, setTodayData] = useState({ byCorrect: [], byQuizzes: [] }); // /api/quiz/today leaders
  // Today's daily challenge (deterministic from the date; no server state needed).
  const daily = useMemo(() => getDailyChallenge(), []);
  const dailyCat = daily ? daily.accent : '';
  // Every challenge open right now (today's daily + open events like the Outline
  // Challenge). The header CTA rotates through these like the leaderboard slides.
  const openChs = useMemo(() => openChallenges(), []);
  // The header CTA also surfaces the Business News quiz hub as a rotating slide.
  const rotation = useMemo(() => [{ id: 'business-news', title: 'Business News', sub: 'Quiz Hub', href: '/quizzes/business-news' }], []);
  const [chSlide, setChSlide] = useState(0);
  useEffect(() => {
    if (rotation.length < 2) return;
    const id = setTimeout(() => setChSlide((i) => (i + 1) % rotation.length), 5000);
    return () => clearTimeout(id);
  }, [chSlide, rotation.length]);
  const curCh = rotation.length ? rotation[chSlide % rotation.length] : null;
  // Restore the saved browse-view preference once on mount.
  useEffect(() => {
    try { const v = localStorage.getItem('sot_quiz_browse_view'); if (v === 'detailed' || v === 'compact') setView(v); } catch {}
  }, []);
  function setBrowseView(v) { setView(v); try { localStorage.setItem('sot_quiz_browse_view', v); } catch {} }

  // Build the catalog once: every quiz, with its department + nav title.
  const catalog = useMemo(() => (QUIZZES || []).filter((q) => q && q.id && !q.unlisted).map((q) => ({
    id: q.id,
    title: q.navTitle || cleanTitle(q.title) || q.id,
    rawTitle: q.title || '',
    dept: deptOf(q),
    publishedAt: q.publishedAt || (q.publishedDate ? `${q.publishedDate}T12:00:00Z` : ''),
  })), []);

  const titleById = useMemo(() => Object.fromEntries(catalog.map((q) => [q.id, q.title])), [catalog]);

  // Today's daily challenge: ordered quiz ids + local completion (run-state).
  const dailyId = daily ? daily.id : null;
  const dailyIds = useMemo(() => (daily ? challengeQuizIds(daily) : []), [daily]);
  const chScores = (chRun && chRun.scores) || {};
  // Server-truth completion for the signed-in player (cross-device): the daily
  // challenge leaderboard carries each registered user's per-quiz scores today.
  const myDaily = useMemo(() => (dailyLb || []).find((u) => (me && me.userKey && u.userKey === me.userKey) || (me && me.username && u.username && u.username.toLowerCase() === me.username.toLowerCase())) || null, [dailyLb, me]);
  const serverScores = (myDaily && myDaily.scores) || {};
  const dailyIsDone = (id) => !!chScores[id] || serverScores[id] != null;
  const dailyDoneCount = dailyIds.filter(dailyIsDone).length;
  const dailyAllDone = dailyIds.length > 0 && dailyDoneCount === dailyIds.length;
  const dailyNextIdx = (() => { const k = dailyIds.findIndex((id) => !dailyIsDone(id)); return k < 0 ? 0 : k; })();
  const dailyEntryUrl = (dailyId && dailyIds.length) ? `/quiz/${dailyIds[dailyNextIdx]}?ch=${encodeURIComponent(dailyId)}&i=${dailyNextIdx}` : '/quizzes';
  const dailyDateLabel = daily ? (() => { try { return new Date(`${daily.date}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); } catch { return ''; } })() : '';

  // Departments present, with counts, ordered by size desc (mockup order).
  const cats = useMemo(() => {
    const byDept = new Map();
    for (const q of catalog) {
      if (!byDept.has(q.dept)) byDept.set(q.dept, []);
      byDept.get(q.dept).push(q);
    }
    const list = [];
    for (const { id } of DEPT_NAV) if (byDept.has(id)) list.push(id);
    for (const k of byDept.keys()) if (!list.includes(k)) list.push(k);
    return list.map((key) => {
      const color = DEPT_COLOR[key] || DEPT_COLOR.misc;
      return {
        key,
        label: DEPT_LABEL[key] || 'Quiz',
        c: color.c, t: color.t,
        Icon: DEPT_ICON[key] || Sparkles,
        quizzes: byDept.get(key),
        count: byDept.get(key).length,
      };
    }).sort((a, b) => b.count - a.count);
  }, [catalog]);
  const byKey = useMemo(() => Object.fromEntries(cats.map((c) => [c.key, c])), [cats]);

  const totalCount = catalog.length;
  const scopeCount = scope === 'all' ? totalCount : (byKey[scope]?.count || 0);
  // My-progress filter: split the catalog by the player's played/aced status,
  // matching the row icons (green check = played, gold star = aced at 100%).
  const statusSets = useMemo(() => ({
    played: new Set((me && me.found && me.playedIds) || []),
    completed: new Set((me && me.found && me.completedIds) || []),
  }), [me]);
  const statusCounts = useMemo(() => {
    const pl = statusSets.played, cp = statusSets.completed;
    const playedNotAced = [...pl].filter((id) => !cp.has(id)).length;
    return { unplayed: Math.max(0, totalCount - pl.size), played: playedNotAced, completed: cp.size };
  }, [statusSets, totalCount]);
  const statusList = useMemo(() => {
    if (doneFilter === 'all') return null;
    const pl = statusSets.played, cp = statusSets.completed;
    return catalog.filter((q) => {
      const p = pl.has(q.id), c = cp.has(q.id);
      if (doneFilter === 'completed') return c;
      if (doneFilter === 'played') return p && !c;
      return !p; // unplayed
    }).sort((a, b) => a.title.localeCompare(b.title));
  }, [doneFilter, catalog, statusSets]);

  // ── data loads ──
  useEffect(() => {
    fetch('/api/quiz/totals').then((r) => r.json()).then((d) => {
      if (d && !d.error) setTotals({ byQuiz: d.byQuiz || {}, leaders: d.leaders || {}, leaderKeys: d.leaderKeys || {}, today: d.today || 0 });
    }).catch(() => {});
    fetch('/api/quiz/recent').then((r) => r.json()).then((d) => {
      if (d && Array.isArray(d.plays)) setRecent(d.plays);
    }).catch(() => {});
    fetch('/api/quiz/stats').then((r) => r.json()).then((d) => {
      if (d && Array.isArray(d.quizzes)) setStatsById(Object.fromEntries(d.quizzes.map((q) => [q.quizId, q])));
    }).catch(() => {});
    if (DAILY_CHALLENGE_ON) fetch(`/api/quiz/challenge-leaderboard?id=${encodeURIComponent(dailyChallengeId())}`).then((r) => r.json()).then((d) => {
      if (d && Array.isArray(d.users)) setDailyLb(d.users);
    }).catch(() => {});
    fetch('/api/quiz/today').then((r) => r.json()).then((d) => {
      if (d) setTodayData({ byCorrect: Array.isArray(d.leaders) ? d.leaders : [], byQuizzes: Array.isArray(d.quizLeaders) ? d.quizLeaders : [] });
    }).catch(() => {});
  }, []);

  // Read today's daily-challenge run-state from localStorage (drives the box's
  // per-quiz completion ticks); refresh on focus so finishing a quiz updates it.
  useEffect(() => {
    if (!dailyId) return;
    const read = () => { try { setChRun(JSON.parse(localStorage.getItem(`sot_chrun_${dailyId}`) || 'null')); } catch { setChRun(null); } };
    read();
    const onVis = () => { if (!document.hidden) read(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', read);
    return () => { document.removeEventListener('visibilitychange', onVis); window.removeEventListener('focus', read); };
  }, [dailyId]);

  // Elo leaderboard re-loads when the scope changes.
  useEffect(() => {
    // Pull the FULL ranking (not just top-12-by-rating) so the cycling
    // leaderboard's non-rating slides (Most Correct, etc.) surface the true
    // per-metric leaders, not just whoever is already top by rating.
    const q = scope === 'all' ? '?full=1' : `?scope=${encodeURIComponent(scope)}&full=1`;
    let alive = true;
    fetch(`/api/quiz/elo${q}`).then((r) => r.json()).then((d) => {
      if (!alive) return;
      if (d && Array.isArray(d.players)) { setEloBoard(d.players); setEloScope(d.scope || scope); }
    }).catch(() => {});
    return () => { alive = false; };
  }, [scope]);

  // Per-category skill-rating boards (computed once) power the rotating
  // "Top Rated <Category>" leaderboard slides.
  useEffect(() => {
    fetch('/api/quiz/elo-categories').then((r) => r.json()).then((d) => {
      if (d && d.boards) setCatBoards(d.boards);
    }).catch(() => {});
  }, []);

  // Current player's stats (overall — used for the player bar + pinned "You").
  useEffect(() => {
    const ident = getIdentity();
    const anonId = getAnonId();
    const email = ident && ident.email ? ident.email : '';
    if (!anonId && !email) { setMe(null); return; }
    const params = new URLSearchParams();
    if (anonId) params.set('anonId', anonId);
    if (email) params.set('email', email);
    fetch(`/api/quiz/me?${params.toString()}`).then((r) => r.json()).then((d) => {
      if (d) setMe(d);
    }).catch(() => {});
  }, []);

  function plays(id) { return totals.byQuiz[id] || 0; }
  function leader(id) { return totals.leaders[id] || ''; }
  function leaderKey(id) { return (totals.leaderKeys && totals.leaderKeys[id]) || ''; }

  // Player-bar stats: overall by default; for a selected category, the player's
  // figures + rank WITHIN that category (from me.byCategory[scope]). Falls back
  // to overall / '—' when the player has no matches in the chosen category.
  const playerStats = useMemo(() => {
    if (!me || !me.found) return null;
    if (scope === 'all') {
      const a = me.activity || {};
      return {
        rank: (me.ranks && me.ranks.rating) || me.rank || null,
        denom: me.totalPlayers || 0,
        correct: a.correct ?? null,
        played: a.played ?? null,
        completed: a.completed ?? null,
        accuracy: a.accuracy ?? null,
        playedRank: (me.ranks && me.ranks.played) || null,
        correctRank: (me.ranks && me.ranks.correct) || null,
        completedRank: (me.ranks && me.ranks.completed) || null,
        accuracyRank: (me.ranks && me.ranks.accuracy) || null,
      };
    }
    const c = me.byCategory ? me.byCategory[scope] : null;
    if (!c) return { rank: null, denom: 0, correct: null, played: null, completed: null, accuracy: null };
    return {
      rank: c.rank || null,
      denom: c.catTotal || 0,
      correct: c.correct ?? null,
      played: c.played ?? null,
      completed: c.completed ?? null,
      accuracy: c.accuracy ?? null,
      playedRank: c.playedRank || null,
      correctRank: c.correctRank || null,
      completedRank: c.completedRank || null,
      accuracyRank: c.accuracyRank || null,
    };
  }, [me, scope]);

  // ── leaderboard: re-ranks per slide AND per category ──
  // Each slide sorts the board by that slide's metric (desc; ties by rating then
  // name), scoped to the selected category (the elo API already returns the
  // per-category metric values). The Skill Rating slide DOES show the rating.
  // Today's daily-challenge standings, ranked by total correct then least time.
  const dailyRows = useMemo(() => (dailyLb || []).slice()
    .sort((a, b) => (b.totalCorrect || 0) - (a.totalCorrect || 0) || (a.totalTime || 0) - (b.totalTime || 0) || (a.username || '').localeCompare(b.username || ''))
    .slice(0, boardsExpanded ? 10 : 5), [dailyLb, boardsExpanded]);
  const todayCorrectRows = useMemo(() => (todayData.byCorrect || []).slice(0, boardsExpanded ? 10 : 5), [todayData, boardsExpanded]);
  const todayQuizRows = useMemo(() => (todayData.byQuizzes || []).slice(0, boardsExpanded ? 10 : 5), [todayData, boardsExpanded]);
  const bestCat = useMemo(() => {
    if (!me || !me.byCategory) return null;
    // Best category = where the player ranks highest on COMPLETED; ties break to
    // skill (rating) rank in that category, then to played rank.
    let best = null;
    for (const k of Object.keys(me.byCategory)) {
      const c = me.byCategory[k];
      if (!c || !(c.matches > 0)) continue;
      const cand = { key: k, rank: c.completedRank ?? c.rank, catTotal: c.catTotal,
        cR: c.completedRank ?? Infinity, sR: c.rank ?? Infinity, pR: c.playedRank ?? Infinity };
      if (!best || cand.cR < best.cR
          || (cand.cR === best.cR && cand.sR < best.sR)
          || (cand.cR === best.cR && cand.sR === best.sR && cand.pR < best.pR)) best = cand;
    }
    return best;
  }, [me]);
  // The daily-challenge slide joins the rotation ONLY once >=2 registered
  // players have played today's challenge.
  const LB_METRICS = useMemo(() => {
    const base = [
      { key: 'rating', label: 'Top Skill Rating', fmt: (v) => (v || 0).toLocaleString(), ms: 7000 },
      { key: 'correct', label: 'Most Correct Answers', fmt: (v) => (v || 0).toLocaleString(), ms: 5000 },
      { key: 'completed', label: 'Most Quizzes Aced (100%)', fmt: (v) => (v || 0).toLocaleString(), ms: 5000 },
      { key: 'daysPlayed', label: 'Most Days Played', fmt: (v) => (v || 0).toLocaleString(), ms: 5000 },
      { key: 'accuracy', label: 'Highest Accuracy', fmt: (v) => `${v || 0}%`, ms: 5000 },
    ];
    if (DAILY_CHALLENGE_ON && dailyRows.length >= 2) base.splice(1, 0, { key: 'dailyChallenge', special: true, label: `Today's Challenge${dailyCat ? ` · ${dailyCat}` : ''}`, fmt: (v) => (v || 0).toLocaleString(), ms: 6000 });
    const extra = [];
    if (todayCorrectRows.length >= 1) extra.push({ key: 'correctToday', special: true, label: 'Correct Today', fmt: (v) => (v || 0).toLocaleString(), ms: 5000 });
    if (todayQuizRows.length >= 1) extra.push({ key: 'quizzesToday', special: true, label: 'Quizzes Today', fmt: (v) => (v || 0).toLocaleString(), ms: 5000 });
    if (extra.length) base.splice((DAILY_CHALLENGE_ON && dailyRows.length >= 2) ? 2 : 1, 0, ...extra);
    // Per-category "Top Rated <Category>" slides join the rotation only on the
    // overall view (Category: All), in DEPT_NAV order, skipping empty boards.
    const catSlides = scope === 'all'
      ? DEPT_NAV
          .filter((d) => Array.isArray(catBoards[d.id]) && catBoards[d.id].length > 0)
          .map((d) => ({ key: 'catRating', catKey: d.id, special: true, label: `Top Rated ${DEPT_LABEL[d.id] || d.label}`, fmt: (v) => (v || 0).toLocaleString(), ms: 5000 }))
      : [];
    return [...base, ...catSlides];
  }, [dailyRows.length, dailyCat, todayCorrectRows.length, todayQuizRows.length, scope, catBoards]);
  const lbMetric = LB_METRICS[Math.min(lbIdx, LB_METRICS.length - 1)];
  // Per-slide timeout: the ELO slide holds 7s, every other slide 5s.
  useEffect(() => {
    const id = setTimeout(() => setLbIdx((i) => (i + 1) % LB_METRICS.length), lbMetric.ms);
    return () => clearTimeout(id);
  }, [lbIdx, lbMetric.ms, LB_METRICS.length]);
  // Sort the displayed board by the active slide's metric, scoped to the current
  // category (eloBoard is already category-scoped via the /api/quiz/elo refetch).
  const leaderRows = useMemo(() => {
    const k = lbMetric.key;
    // Highest Accuracy needs a real sample: only players with >=3 unique
    // quizzes played qualify (a 100% from one quiz shouldn't top the board).
    const pool = k === 'accuracy' ? eloBoard.filter((p) => (p.played || 0) >= 3) : eloBoard;
    const sorted = pool.slice().sort((a, b) =>
      ((b[k] || 0) - (a[k] || 0))
      || ((b.rating || 0) - (a.rating || 0))
      || (a.name || '').localeCompare(b.name || '')
    );
    // Hide guests from the public board WHEN >=3 registered players can fill the
    // top three; otherwise keep guests so the board isn't sparse.
    const named = sorted.filter((p) => !p.isAnon);
    const list = named.length >= 3 ? named : sorted;
    return list.slice(0, boardsExpanded ? 10 : 5);
  }, [eloBoard, lbMetric.key, boardsExpanded]);

  // ── live feed (scoped by quiz department) ──
  const liveRows = useMemo(() => {
    const rows = recent.map((p) => ({ ...p, dept: deptOf({ id: p.quizId }), title: titleById[p.quizId] || cleanTitle(p.quizId) }));
    const scoped = scope === 'all' ? rows : rows.filter((r) => r.dept === scope);
    return scoped.slice(0, boardsExpanded ? 10 : 4);
  }, [recent, scope, titleById, boardsExpanded]);

  const playsToday = totals.today || 0;

  // ── browse columns ──
  // Newest first (so the dedupe sets below can reference it), then Most Played
  // excluding anything already in Newest, then each category column excluding
  // everything shown in Newest + Most Played. No quiz appears twice on the page.
  const newest = useMemo(() => catalog.slice()
    .filter((q) => !isBusinessNewsHubQuiz(q.id))
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0))
    .slice(0, 6), [catalog]);
  const newestIds = useMemo(() => new Set(newest.map((q) => q.id)), [newest]);
  const mostPlayed = useMemo(() => {
    let pool;
    if (scope === 'all') pool = catalog;
    else pool = byKey[scope] ? byKey[scope].quizzes : [];
    const exclude = scope === 'all' ? newestIds : new Set();
    return pool.map((q) => ({ ...q, p: plays(q.id) }))
      .filter((q) => q.p > 0 && !exclude.has(q.id))
      .sort((a, b) => b.p - a.p || a.title.localeCompare(b.title))
      .slice(0, 6);
  }, [catalog, byKey, scope, totals, newestIds]);
  // Ids already surfaced in the Newest + Most Played columns (all-scope only).
  const shownIds = useMemo(() => {
    if (scope !== 'all') return new Set();
    const set = new Set(newestIds);
    mostPlayed.forEach((q) => set.add(q.id));
    return set;
  }, [scope, newestIds, mostPlayed]);
  // Full "View all" lists (every quiz, not the 6-row column preview).
  const newestAll = useMemo(() => catalog.slice()
    .filter((q) => !isBusinessNewsHubQuiz(q.id))
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0)), [catalog]);
  const mostPlayedAll = useMemo(() => catalog.slice()
    .sort((a, b) => plays(b.id) - plays(a.id) || a.title.localeCompare(b.title)), [catalog, totals]);
  const liveAll = useMemo(() => recent.map((p) => ({ ...p, title: titleById[p.quizId] || cleanTitle(p.quizId) })), [recent, titleById]);

  function colRows(cat, lim, exclude) {
    // Business tile preview hides the whole Business News quiz hub (daily/weekly
    // recaps, company earnings, sector updates); they still show under View all.
    const base = cat.key === 'business' ? cat.quizzes.filter((q) => !isBusinessNewsHubQuiz(q.id)) : cat.quizzes;
    const sorted = base.slice()
      .sort((a, b) => plays(b.id) - plays(a.id) || a.title.localeCompare(b.title));
    if (!exclude) return sorted.slice(0, lim);
    const primary = sorted.filter((q) => !exclude.has(q.id));
    // Backfill short department columns (e.g. a small/new-heavy dept whose newest
    // quizzes are surfaced in the Newest column and thus excluded) so the card is
    // never left near-empty; big columns never run short and keep full de-dup.
    if (primary.length >= lim) return primary.slice(0, lim);
    const backfill = sorted.filter((q) => exclude.has(q.id));
    return primary.concat(backfill).slice(0, lim);
  }

  // Search across the whole catalog.
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return catalog.filter((c) => c.rawTitle.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)).slice(0, 80);
  }, [search, catalog]);

  // Hide "Best category" only when the player bar is forced to wrap to a new
  // row. Gated on width change so toggling the element (a height-only change)
  // can't cause a feedback loop. Below the mobile breakpoint CSS owns layout.
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
  }, [bestCat, playerStats, scope]);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
    .qzh{font-family:${FONT};color:${C.ink};}
    .qzh .lbl{font-size:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:${C.muted};}
    .qzh .card{background:${C.surface};border:1px solid ${C.line};border-radius:12px;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
    .qzh .boards .card{background:${C.surface};border-color:${C.line};}
    .qzh .head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 13px 9px;background:#f1f3f6;border-bottom:1px solid ${C.line};min-height:42px;cursor:pointer;}
    .qzh .head .lbl{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12.5px;}
    .qzh .head .qlink{flex:none;white-space:nowrap;}
    .qzh .lrow{display:flex;align-items:center;gap:9px;padding:5.5px 13px;font-size:12.5px;}
    .qzh .qtitle{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .qzh .att{font-size:9.5px;font-weight:700;color:${C.soft};}
    .qzh .score{flex:none;font-weight:700;color:${C.accent};font-variant-numeric:tabular-nums;}
    @media(max-width:680px){.qzh .lf-extra{display:none;}}
    @keyframes qzp{0%{opacity:1}50%{opacity:.35}100%{opacity:1}}
    .qzh .dd{position:relative;}
    .qzh .ddbtn{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid ${C.line};border-radius:10px;padding:9px 12px;cursor:pointer;font:inherit;}
    .qzh .ddmenu{position:absolute;top:calc(100% + 6px);right:0;z-index:30;background:#fff;border:1px solid ${C.line};border-radius:10px;box-shadow:0 8px 24px rgba(20,22,28,0.12);padding:6px;min-width:430px;display:grid;grid-template-columns:1fr 1fr;gap:1px 4px;}
    .qzh .ddmenu .ddall{grid-column:1 / -1;}
    @media(max-width:560px){.qzh .ddmenu{left:0;right:auto;width:88vw;min-width:0;max-width:88vw;grid-template-columns:1fr 1fr;max-height:60vh;overflow-y:auto;}}
    .qzh .dditem{display:flex;align-items:center;gap:9px;padding:7px 9px;border-radius:7px;cursor:pointer;font-size:13px;}
    .qzh .ddhead{display:none;}
    @media(max-width:560px){.qzh .ddhead{display:flex !important;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;margin:-6px -6px 5px;padding:10px 12px;border-bottom:1px solid ${C.line};z-index:3;font-weight:700;font-size:13px;color:${C.ink};}.qzh .ddhead .ddclose{background:#eef1f6;border:none;border-radius:8px;width:34px;height:34px;font-size:17px;line-height:1;cursor:pointer;color:${C.ink};display:flex;align-items:center;justify-content:center;flex:none;}}
    .qzh .dditem:hover{background:${C.bg};}
    .qzh .dot{width:9px;height:9px;border-radius:3px;flex:none;}
    .qzh .boards{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.5fr) minmax(0,1fr);gap:12px;align-items:stretch;margin-bottom:12px;}
    .qzh .qz-mobtoggle{display:none;}
    /* Ranking leaderboard (1st card) on the narrow LEFT track; the last-played
       feed (2nd card) on the wide RIGHT track. Natural source order, no reorder. */
    @media(max-width:680px){.qzh .boards{grid-template-columns:1fr;}}
    .qzh .qcols{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:6px 26px;}
    .qzh .qfull{column-count:2;column-gap:26px;}
    .qzh .qfull > a{display:flex;break-inside:avoid;-webkit-column-break-inside:avoid;}
    .qzh .qflow{column-width:310px;column-gap:26px;}
    .qzh .qflow > a{display:flex;break-inside:avoid;-webkit-column-break-inside:avoid;}
    @media(max-width:680px){.qzh .qfull{column-count:1;}}
    .qzh .colhead{display:flex;align-items:center;gap:9px;padding:8px 11px;border-bottom:2px solid ${C.ink};border-radius:8px 8px 0 0;margin-bottom:3px;}
    .qzh .viewall{margin-left:auto;font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;}
    .qzh .qrow{display:flex;align-items:baseline;gap:10px;padding:6px 0;border-bottom:1px solid rgba(20,22,28,0.07);text-decoration:none;color:${C.ink};min-width:0;overflow:hidden;}
    .qzh .qrow:hover .qtitle{color:${C.accent};}
    .qzh .qrow .qtitle{font-size:13px;font-weight:500;}
    .qzh .qmeta{flex:none;display:flex;align-items:center;gap:10px;font-size:10.5px;}
    .qzh .hubbtn{display:flex;align-items:center;gap:7px;background:#fff;color:${C.accent};border:1px solid #cddffb;border-right:3px solid ${C.accent};padding:10px 15px;border-radius:10px;font-weight:700;font-size:13px;text-decoration:none;white-space:nowrap;}
    .qzh .qz-playerbar.hub-bleed .hubbtn{align-self:stretch;padding:0 18px;margin:-11px -14px -11px 0;border-radius:0 11px 11px 0;border-top:none;border-bottom:none;border-left:none;}
    .qz-playerbar .qz-skill-empty{display:none !important;}
    .qz-playerbar .lbl{font-size:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#6b7280;margin-bottom:2px;}
    .qz-chev{display:none;}
    @media(max-width:560px){.qz-playerbar{flex-wrap:wrap !important;align-items:center !important;gap:10px 14px !important;}.qz-playerbar .qz-div{display:none !important;}.qz-playerbar:not(.open) .qz-stats{display:none !important;}.qz-playerbar.open .qz-stats{order:9 !important;flex:1 1 100% !important;margin-left:0 !important;justify-content:space-between !important;gap:10px !important;}.qz-playerbar{cursor:pointer;}.qz-chev{display:inline-flex !important;}.qz-playerbar .qz-bestcat{display:none !important;}.qz-playerbar .hubbtn{order:4 !important;margin-left:auto !important;flex:0 0 auto !important;}.qzh .boards{display:flex !important;flex-direction:column;gap:12px;}.qzh .boards .lb-card{order:1;}.qzh .boards .daily-card{order:2;}.qzh .boards .live-card{order:3;}.qz-submit{display:none !important;}.qzh{padding-left:14px !important;padding-right:14px !important;}}
    .qzh .hubbtn:hover{background:${C.accsoft};}
    .qzh .crumb1{font-size:18px;font-weight:800;letter-spacing:-0.02em;}
    .qzh .crumb2{font-size:18px;font-weight:600;color:${C.accent};}
    .qzh a.qlink{text-decoration:none;color:inherit;}
    .qzh .qz-catbtn .ddmenu{left:0;right:auto;}
    .qzh .qz-catbtn{align-self:stretch;}
    .qzh .qz-searchwrap{align-self:stretch;}
    .qzh .qz-searchwrap input{height:100%;box-sizing:border-box;}
    .qzh .qz-submit{align-self:stretch;}
    .qzh .qz-daily{align-self:stretch;}
    .qzh .qz-srank{font-size:9px;font-weight:600;color:${C.soft};}
    .qzh .qz-pname{max-width:160px;}
    @media(max-width:560px){.qzh .qz-pname{max-width:120px;}}
    @media(max-width:560px){.qzh .qz-srank{display:none !important;}}
    .qzh .qz-catbtn .ddbtn{height:100%;box-sizing:border-box;}
    @media(max-width:560px){.qzh .qz-browserow{align-items:stretch !important;gap:8px !important;}.qzh .qz-catbtn{flex:0 0 calc(50% - 4px) !important;max-width:calc(50% - 4px) !important;min-width:0;order:1 !important;}.qzh .qz-catbtn .ddbtn{width:100%;justify-content:center;height:100%;box-sizing:border-box;}.qzh .qz-daily{flex:0 0 calc(50% - 4px) !important;max-width:calc(50% - 4px) !important;min-width:0 !important;justify-content:center !important;align-self:stretch;order:2 !important;overflow:hidden !important;}.qzh .qz-searchwrap{flex:1 1 100% !important;order:3 !important;}}
    /* Mobile: the category menu can be taller than the space below its button,
       and the outside-click overlay freezes the page so the page itself can't
       scroll to reveal the rest. Anchor it as a viewport-bounded fixed sheet so
       every category is reachable via the menu's own internal scroll. */
    @media(max-width:560px){.qzh .qz-catbtn .ddmenu{position:fixed;z-index:60;left:50%;right:auto;transform:translateX(-50%);top:auto;bottom:12px;width:92vw;max-width:92vw;min-width:0;max-height:72vh;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;grid-template-columns:1fr 1fr;box-shadow:0 -8px 28px rgba(20,22,28,0.18);}}
    @media(max-width:560px){.qzh .qz-dd-overlay{z-index:55 !important;background:rgba(20,22,28,0.4);}}
    /* Mobile: surface the leaderboard + last-played boards (otherwise display:none on phones)
       as two side-by-side toggle buttons; tapping one expands its existing card full-width below. */
    @media(max-width:560px){
      .qzh .qz-mobtoggle{display:flex;gap:4px;margin-bottom:12px;background:#eef1f5;border-radius:12px;padding:4px;}
      .qzh .qz-mobtoggle .mtbtn{flex:1 1 0;min-width:0;display:flex;align-items:center;justify-content:center;gap:7px;background:transparent;border:none;border-radius:9px;padding:9px 12px;cursor:pointer;font:inherit;color:${C.soft};font-weight:700;font-size:12.5px;}
      .qzh .qz-mobtoggle .mtbtn.active{background:#fff;color:${C.ink};box-shadow:0 1px 2px rgba(20,22,28,0.06);}
      .qzh .qz-mobtoggle .mtbtn .mtlbl{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
      .qzh .qz-mobtoggle .mtbtn{justify-content:center !important;}
      .qzh .qz-mobtoggle .mtbtn svg:last-child{margin-left:0 !important;}
      .qzh .boards.show-lb .lb-card{display:flex !important;order:-1;}
      .qzh .boards.show-live .live-card{display:flex !important;order:-1;}
    }
    /* Mobile landscape (short viewport): keep the browse row on ONE line by letting the
       search field shrink, and stretch all four controls to a single shared height. */
    @media (orientation: landscape) and (max-height: 500px){
      .qzh .qz-browserow{flex-wrap:nowrap !important;align-items:stretch !important;gap:8px !important;}
      .qzh .qz-catbtn{flex:0 0 auto !important;align-self:stretch;}
      .qzh .qz-catbtn .ddbtn{height:100%;box-sizing:border-box;}
      .qzh .qz-searchwrap{flex:1 1 0 !important;min-width:90px !important;}
      .qzh .qz-searchwrap input{height:100%;box-sizing:border-box;}
      .qzh .qz-submit{flex:0 0 auto !important;align-self:stretch;box-sizing:border-box;}
      .qzh .qz-daily{flex:0 0 auto !important;align-self:stretch;box-sizing:border-box;}
    }
    .qzh .accchev{display:none;}
    @media(max-width:560px){
      .qzh .boards .head{cursor:pointer;}
      .qzh .accchev{display:inline-flex !important;transition:transform .15s;}
      .qzh .boards .card.mc-closed > div:not(.head){display:none !important;}
      .qzh section.mc-closed > .qrow{display:none !important;}
      .qzh .dailyicon{color:#374151 !important;}
      .qzh .livedot{background:#9aa1ab !important;animation:none !important;}
      .qzh .colhead{background:#fff !important;}
      .qzh .colhead .colicon{background:#eef2f7 !important;color:#374151 !important;}
      .qzh .colhead h3{color:#1c1e24 !important;}
      .qzh .colhead .viewall{color:#2563eb !important;}
      .qzh .donemark{color:#2563eb !important;fill:#2563eb !important;stroke:#2563eb !important;}
      .qzh .medaldot{background:#eef2f7 !important;color:#1c1e24 !important;}
      .qzh .lbbar{background:#2563eb !important;}
      .qzh .dot{background:#9aa1ab !important;}
      .qzh .scorebadge{background:#eef1f6 !important;color:#5f5e5a !important;}
      .qzh .daytick.done{background:#2563eb !important;}
    }
  `;

  const doneCtx = useMemo(() => ({
    played: (me && me.found && Array.isArray(me.playedIds)) ? new Set(me.playedIds) : null,
    completed: (me && me.found && Array.isArray(me.completedIds)) ? new Set(me.completedIds) : null,
  }), [me]);

  return (
    <QuizDoneContext.Provider value={doneCtx}>
    <div style={{ background: C.bg, minHeight: '100vh', position: 'relative' }}>
      <Grain />
      <style>{css}</style>
      <SiteHeader active="quizzes" flush inlay={<QuizPlayerBar />} />
      <div className="qzh qzf-w" style={{ maxWidth: 1180, margin: '0 auto', padding: '12px 38px 70px', position: 'relative' }}><div className="qzf-line" aria-hidden="true" />

        {signupOpen && <SignupModal onClose={() => setSignupOpen(false)} />}

        {/* boards */}
        <div className="boards">
          {/* leaderboard */}
          <div className={`card lb-card mc-${acc.lb ? 'open' : 'closed'}`}>
            <div className="head" onClick={() => { if (isMobile) toggleAcc('lb'); else setBoardsExpanded((v) => !v); }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                <Crown size={15} strokeWidth={2} style={{ color: C.ink, flex: 'none' }} />
                <span className="lbl" style={{ color: C.ink }}>{lbMetric.label}{lbMetric.special || scope === 'all' ? '' : ` · ${byKey[scope]?.label}`}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Link href={lbMetric.special && lbMetric.key !== 'catRating' ? '/quizzes/hub?tab=challenges' : '/quizzes/hub'} onClick={(e) => e.stopPropagation()} className="qlink"><span style={{ fontSize: 11, fontWeight: 700, color: C.accent }}>View all</span></Link>
                <ChevronDown className="accchev" size={16} strokeWidth={2.5} style={{ flex: 'none', color: C.soft, transform: acc.lb ? 'none' : 'rotate(-90deg)' }} />
              </span>
            </div>
            <div style={{ flex: 1, padding: '3px 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
              {lbMetric.special ? (
                (() => {
                  if (lbMetric.key === 'catRating') {
                    const rows = (catBoards[lbMetric.catKey] || []).slice(0, boardsExpanded ? 10 : 5);
                    if (rows.length === 0) return <div style={{ padding: '12px 13px', fontSize: 12, color: C.soft }}>No ranked players yet.</div>;
                    return rows.map((r, i) => (
                      <LbRow key={r.userKey || i} i={i}
                        name={r.userKey ? <Link href={`/quizzes/hub?player=${encodeURIComponent(r.userKey)}`} style={{ color: 'inherit', textDecoration: 'none' }}><WhoTag name={r.name} isAnon={r.isAnon} /></Link> : <WhoTag name={r.name} isAnon={r.isAnon} />}
                        value={lbMetric.fmt(r.rating)} frac={(r.rating || 0) / (rows[0]?.rating || 1)} />
                    ));
                  }
                  const rows = lbMetric.key === 'dailyChallenge' ? dailyRows : lbMetric.key === 'correctToday' ? todayCorrectRows : todayQuizRows;
                  const valOf = lbMetric.key === 'dailyChallenge' ? ((r) => r.totalCorrect) : lbMetric.key === 'correctToday' ? ((r) => r.correct) : ((r) => r.quizzes);
                  if (rows.length === 0) return <div style={{ padding: '12px 13px', fontSize: 12, color: C.soft }}>No plays yet today.</div>;
                  return rows.map((r, i) => (
                    <LbRow key={`s${i}`} i={i}
                      name={r.userKey ? <Link href={`/quizzes/hub?player=${encodeURIComponent(r.userKey)}`} style={{ color: 'inherit', textDecoration: 'none' }}><WhoTag name={r.username || 'Player'} isAnon={false} /></Link> : <WhoTag name={r.username || 'Player'} isAnon={false} />}
                      value={(valOf(r) || 0).toLocaleString()} frac={(valOf(r) || 0) / (valOf(rows[0]) || 1)} />
                  ));
                })()
              ) : (
                <>
                  {leaderRows.length === 0 && <div style={{ padding: '12px 13px', fontSize: 12, color: C.soft }}>No ranked players yet.</div>}
                  {leaderRows.map((r, i) => (
                    <LbRow key={r.userKey || i} i={i}
                      name={r.userKey ? <Link href={`/quizzes/hub?player=${encodeURIComponent(r.userKey)}`} style={{ color: 'inherit', textDecoration: 'none' }}><WhoTag name={r.name} isAnon={r.isAnon} /></Link> : <WhoTag name={r.name} isAnon={r.isAnon} />}
                      value={lbMetric.fmt(r[lbMetric.key])} frac={(r[lbMetric.key] || 0) / (leaderRows[0]?.[lbMetric.key] || 1)} />
                  ))}
                </>
              )}
            </div>
          </div>

          {/* live feed */}
          <div className={`card live-card mc-${acc.live ? 'open' : 'closed'}`}>
            <div className="head" onClick={() => { if (isMobile) toggleAcc('live'); else setBoardsExpanded((v) => !v); }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span className="livedot" style={{ width: 8, height: 8, borderRadius: '50%', background: C.live, animation: 'qzp 1.6s infinite' }} />
                <span className="lbl" style={{ color: C.ink }}>Live · Quizzes Played{scope === 'all' ? '' : ` · ${byKey[scope]?.label}`}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {playsToday ? <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: C.soft }}>{playsToday.toLocaleString()} Plays Today</span> : null}
                <button type="button" onClick={(e) => { e.stopPropagation(); setListMode('live'); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: C.accent, fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap' }}>View all</button>
                <ChevronDown className="accchev" size={16} strokeWidth={2.5} style={{ flex: 'none', color: C.soft, transform: acc.live ? 'none' : 'rotate(-90deg)' }} />
              </span>
            </div>
            <div style={{ flex: 1, padding: '3px 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
              {liveRows.length === 0 && <div style={{ padding: '12px 13px', fontSize: 12, color: C.soft }}>No recent plays{scope === 'all' ? '' : ' in this category'} yet.</div>}
              {liveRows.map((f, i) => (
                <Link href={`/quiz/${f.quizId}`} className="qlink" key={i}>
                  <div className="lrow" style={{ gap: 4, flexDirection: 'column', alignItems: 'stretch', padding: '7px 13px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                      <span className="qtitle" style={{ fontWeight: 600 }}>{f.title}</span>
                      {dailyIds.includes(f.quizId) ? <span style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 800, letterSpacing: '.03em', textTransform: 'uppercase', color: C.accent, background: C.accsoft, padding: '1px 6px', borderRadius: 6 }}><Flame size={10} />Daily</span> : null}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10.5, color: C.soft }}>
                      <PlayerLink userKey={f.userKey}><WhoTag name={f.name || 'Guest'} isAnon={f.isAnon} /></PlayerLink>
                      <span className="scorebadge" style={{ flex: 'none', fontWeight: 700, padding: '1px 6px', borderRadius: 6, fontVariantNumeric: 'tabular-nums', background: f.total && f.score / f.total >= 0.8 ? '#e7f7ed' : '#eef1f6', color: f.total && f.score / f.total >= 0.8 ? '#16a34a' : C.soft }}>{f.score}/{f.total}</span>
                      <span style={{ fontWeight: 700 }}>{f.attempt > 1 ? `attempt ${f.attempt}` : '1st try'}</span>
                      <span style={{ marginLeft: 'auto' }}>{relTime(f.playedAt)}</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* daily challenge */}
          {daily && DAILY_CHALLENGE_ON && (
            <div className={`card daily-card mc-${acc.daily ? 'open' : 'closed'}`}>
              <div className="head" onClick={() => { if (isMobile) toggleAcc('daily'); }} style={{ cursor: isMobile ? 'pointer' : 'default' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                  <Flame className="dailyicon" size={15} style={{ color: C.accent, flex: 'none' }} />
                  <span className="lbl" style={{ color: C.ink }}>Daily Challenge{dailyCat ? ` · ${dailyCat}` : ''}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Link href={`/challenge/${dailyId}`} className="qlink"><span style={{ fontSize: 11, fontWeight: 700, color: C.accent }}>{dailyAllDone ? 'Results' : 'View'}</span></Link>
                  <ChevronDown className="accchev" size={16} strokeWidth={2.5} style={{ flex: 'none', color: C.soft, transform: acc.daily ? 'none' : 'rotate(-90deg)' }} />
                </span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 13px 11px' }}>
                <div style={{ fontSize: 11, color: C.soft, fontWeight: 600, marginBottom: 7 }}>{dailyDateLabel}{dailyDateLabel ? ' · ' : ''}{dailyDoneCount}/{dailyIds.length} done</div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
                  {dailyIds.map((qid, k) => {
                    const done = dailyIsDone(qid);
                    return (
                      <Link key={qid} href={`/quiz/${qid}?ch=${encodeURIComponent(dailyId)}&i=${k}`} className="qlink">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 0', borderBottom: k < dailyIds.length - 1 ? '1px solid rgba(20,22,28,0.07)' : 'none' }}>
                          <span className={`daytick${done ? ' done' : ''}`} style={{ width: 19, height: 19, borderRadius: 6, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 700, background: done ? C.live : '#eef1f6', color: done ? '#fff' : C.soft }}>{done ? <Check size={12} strokeWidth={3} /> : k + 1}</span>
                          <span style={{ flex: '1 1 auto', minWidth: 0, fontSize: 12.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: C.ink }}>{stripVerb(titleById[qid] || qid)}</span>
                          {chScores[qid] ? <span style={{ flex: 'none', fontSize: 11, fontWeight: 700, color: C.live, fontVariantNumeric: 'tabular-nums' }}>{chScores[qid].score}/{chScores[qid].total}</span> : null}
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <Link href={dailyAllDone ? `/challenge/${dailyId}?done=1` : dailyEntryUrl} style={{ marginTop: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: C.accent, color: '#fff', borderRadius: 10, padding: '10px', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                  {dailyAllDone ? 'See your results' : dailyDoneCount > 0 ? 'Continue challenge' : 'Play today’s challenge'}
                  <ArrowRight size={15} style={{ flex: 'none' }} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* browse header + search */}
        <div ref={quizzesRef} className="qz-browserow" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          {(searchResults || listMode || doneFilter !== 'all') && (
            <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 10 }}>
              {(listMode || doneFilter !== 'all') && !searchResults && scope === 'all' && (
                <button type="button" onClick={() => { setListMode(null); setDoneFilter('all'); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: C.accent, fontWeight: 700, fontSize: 14 }}>‹ Back</button>
              )}
              {searchResults ? `Search Results · ${searchResults.length}`
                : doneFilter !== 'all' ? `${STATUS_LABEL[doneFilter]} Quizzes · ${(statusList || []).length}`
                : scope !== 'all' ? `${byKey[scope]?.label} Quizzes`
                : listMode === 'newest' ? `Newest Quizzes · ${newestAll.length}`
                : listMode === 'mostplayed' ? `Most Played · ${mostPlayedAll.length}`
                : 'Live · Quizzes Played'}
            </h2>
          )}
          <div className="dd qz-catbtn" onClick={(e) => e.stopPropagation()}>
            <button className="ddbtn" onClick={(e) => { e.stopPropagation(); setDdOpen((o) => !o); }}>
              <span className="dot" style={{ background: scope === 'all' ? C.ink : (byKey[scope]?.c || C.ink) }} />
              <span style={{ fontWeight: 600, fontSize: 13 }}>{doneFilter !== 'all' ? STATUS_LABEL[doneFilter] : (scope === 'all' ? 'Category: All' : byKey[scope]?.label)}</span>
              <ChevronDown size={16} style={{ color: C.muted }} />
            </button>
            {ddOpen && (
              <div className="ddmenu" onClick={(e) => e.stopPropagation()}>
                <div className="ddall ddhead"><span>Categories</span><button type="button" className="ddclose" aria-label="Close" onClick={() => setDdOpen(false)}>✕</button></div>
                {me && me.found && (
                  <>
                    <div className="ddall" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: C.soft, padding: '4px 9px 2px' }}>My progress</div>
                    {[['unplayed', 'Unplayed'], ['played', 'Played'], ['completed', 'Completed']].map(([k, lbl]) => (
                      <div key={k} className="dditem ddall" onClick={() => { setDoneFilter(k); setScope('all'); setDdOpen(false); setSearch(''); setListMode(null); }} style={doneFilter === k ? { background: C.accsoft } : undefined}>
                        {k === 'completed' ? <Star size={14} strokeWidth={1.5} fill="#e8b43a" color="#e8b43a" /> : k === 'played' ? <Check size={14} strokeWidth={2.75} style={{ color: C.live }} /> : <span style={{ width: 13, height: 13, borderRadius: '50%', border: `1.5px solid ${C.soft}`, display: 'inline-block' }} />}
                        <span style={{ flex: 1 }}>{lbl}</span>
                        <span style={{ fontSize: 11, color: C.soft }}>{statusCounts[k]}</span>
                      </div>
                    ))}
                    <div className="ddall" style={{ height: 1, background: C.line, margin: '5px 2px' }} />
                  </>
                )}
                {openChs.length > 0 && (
                  <>
                    <div className="ddall" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: C.soft, padding: '4px 9px 2px' }}>Active challenges</div>
                    {openChs.map((c) => (
                      <Link key={c.id} href={`/quizzes/hub?tab=challenges&ch=${encodeURIComponent(c.id)}`} className="dditem ddall" onClick={() => setDdOpen(false)} style={{ textDecoration: 'none', color: C.ink }}>
                        <Flame size={14} style={{ color: C.accent, flex: 'none' }} />
                        <span style={{ flex: 1 }}>{c.title}</span>
                        <span style={{ fontSize: 11, color: C.soft, whiteSpace: 'nowrap' }}>{c.sub}</span>
                      </Link>
                    ))}
                    <div className="ddall" style={{ height: 1, background: C.line, margin: '5px 2px' }} />
                  </>
                )}
                <div className="dditem ddall" onClick={() => { setScope('all'); setDoneFilter('all'); setDdOpen(false); setSearch(''); setListMode(null); }}>
                  <span className="dot" style={{ background: C.ink }} /><span style={{ flex: 1 }}>All Categories</span>
                  <span style={{ fontSize: 11, color: C.soft }}>{totalCount}</span>
                </div>
                {cats.map((c) => (
                  <div key={c.key} className="dditem" onClick={() => { setScope(c.key); setDoneFilter('all'); setDdOpen(false); setSearch(''); setListMode(null); }}>
                    <span className="dot" style={{ background: c.c }} /><span style={{ flex: 1 }}>{c.label}</span>
                    <span style={{ fontSize: 11, color: C.soft }}>{c.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="qz-searchwrap" style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.soft }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quizzes…"
              autoComplete="off"
              style={{ width: '100%', padding: '9px 12px 9px 36px', border: `1px solid ${C.line}`, borderRadius: 10, font: 'inherit', fontFamily: FONT, fontSize: 13.5, background: '#fff', color: C.ink, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          {(!searchResults && scope === 'all' && !listMode) && (
            <Link href="/submit?for=quiz" className="qz-submit" style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: C.soft, border: `1px solid ${C.line}`, padding: '8px 14px', borderRadius: 10, fontFamily: FONT, fontWeight: 500, fontSize: 12.5, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Submit a Quiz
            </Link>
          )}
          {curCh && (
            <Link key={curCh.id} href={curCh.href || `/quizzes/hub?tab=challenges&ch=${encodeURIComponent(curCh.id)}`} className="qz-daily" style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 9, background: C.accsoft, color: C.accent, border: '1px solid #cddffb', padding: '8px 14px', borderRadius: 10, textDecoration: 'none' }} title={curCh.title}>
              <Flame size={17} style={{ flex: 'none' }} />
              <span style={{ lineHeight: 1.15, display: 'grid' }}>
                {rotation.map((c, i) => (
                  <span key={c.id} style={{ gridArea: '1 / 1', visibility: i === (chSlide % rotation.length) ? 'visible' : 'hidden' }}>
                    <span style={{ display: 'block', fontSize: 13, fontWeight: 800 }}>{c.title}</span>
                    <span style={{ display: 'block', fontSize: 10, fontWeight: 600, opacity: 0.85 }}>{c.sub || 'Open now'}</span>
                  </span>
                ))}
              </span>
              {rotation.length > 1 ? (
                <span aria-hidden="true" style={{ display: 'flex', gap: 3, flex: 'none', marginLeft: 1 }}>
                  {rotation.map((_, i) => (
                    <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: C.accent, opacity: i === (chSlide % rotation.length) ? 1 : 0.4 }} />
                  ))}
                </span>
              ) : null}
              <ArrowRight size={15} style={{ flex: 'none' }} />
            </Link>
          )}
        </div>

        {/* lists */}
        {searchResults ? (
          searchResults.length === 0 ? (
            <div style={{ padding: '18px 2px', color: C.soft, fontSize: 14 }}>No quizzes match “{search}”.</div>
          ) : (
            <div className="qflow">
              {searchResults.map((r) => {
                const cc = (DEPT_COLOR[r.dept] || DEPT_COLOR.misc).c;
                return (
                  <Link href={`/quiz/${r.id}`} className="qrow" key={r.id} title={r.rawTitle || r.title}>
                    <span className="dot" style={{ background: cc, alignSelf: 'center' }} />
                    <span className="qtitle">{stripVerb(r.title)}</span><DoneMark id={r.id} />
                    <span className="qmeta" style={{ color: C.soft, fontSize: 10, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' }}>{DEPT_LABEL[r.dept]}</span>
                  </Link>
                );
              })}
            </div>
          )
        ) : doneFilter !== 'all' ? (
          (statusList && statusList.length) ? (
            <div className="qflow">
              {statusList.map((q) => {
                const cc = (DEPT_COLOR[q.dept] || DEPT_COLOR.misc).c;
                return (
                  <Link href={`/quiz/${q.id}`} className="qrow" key={q.id} title={q.rawTitle || q.title}>
                    <span className="dot" style={{ background: cc, alignSelf: 'center' }} />
                    <span className="qtitle">{stripVerb(q.title)}</span><DoneMark id={q.id} />
                    <span className="qmeta" style={{ color: C.soft, fontSize: 10, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' }}>{DEPT_LABEL[q.dept]}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '18px 2px', color: C.soft, fontSize: 14 }}>{doneFilter === 'unplayed' ? 'You have played every quiz. Nice.' : doneFilter === 'completed' ? 'No quizzes aced at 100% yet. Go get a perfect score.' : 'No quizzes in progress yet. Play one to start.'}</div>
          )
        ) : scope !== 'all' ? (
          <CategoryFull cat={byKey[scope]} plays={plays} leader={leader} leaderKey={leaderKey} />
        ) : listMode === 'live' ? (
          <div className="qfull">
            {liveAll.length === 0 ? (
              <div style={{ padding: '18px 2px', color: C.soft, fontSize: 14 }}>No recent plays yet.</div>
            ) : liveAll.map((f, i) => (
              <Link href={`/quiz/${f.quizId}`} className="qrow" key={i} title={f.title}>
                <span className="qtitle">{stripVerb(f.title)}</span>
                <span className="qmeta" style={{ gap: 8 }}>
                  <PlayerLink userKey={f.userKey}><WhoTag name={f.name || 'Guest'} isAnon={f.isAnon} /></PlayerLink>
                  <span className="lf-extra scorebadge" style={{ flex: 'none', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 7, fontVariantNumeric: 'tabular-nums', background: f.total && f.score / f.total >= 0.8 ? '#e7f7ed' : '#eef1f6', color: f.total && f.score / f.total >= 0.8 ? '#16a34a' : C.soft }}>{f.score}/{f.total}</span>
                  <span className="lf-extra" style={{ color: C.soft }}>{relTime(f.playedAt)}</span>
                </span>
              </Link>
            ))}
          </div>
        ) : listMode ? (
          <div className="qflow">
            {(listMode === 'newest' ? newestAll : mostPlayedAll).map((q) => {
              const cc = (DEPT_COLOR[q.dept] || DEPT_COLOR.misc).c;
              return (
                <Link href={`/quiz/${q.id}`} className="qrow" key={q.id} title={q.rawTitle || q.title}>
                  <span className="dot" style={{ background: cc, alignSelf: 'center' }} />
                  <span className="qtitle">{stripVerb(q.title)}</span><DoneMark id={q.id} />
                  <span className="qmeta">{listMode === 'newest' ? <NewRight q={q} /> : <PlaysRight id={q.id} plays={plays} leader={leader} leaderKey={leaderKey} color={C.accent} />}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="qcols">
            <BrowseColumn label="Most Played" Icon={Flame} color="#c2691c" tint="#f4e2cd"
              rows={mostPlayed.map((q) => ({ q, right: <PlaysRight id={q.id} plays={plays} leader={leader} leaderKey={leaderKey} color="#c2691c" hidePlays /> }))} cta="View all ›" onCta={() => setListMode('mostplayed')} open={!!acc.mostplayed} onToggle={() => toggleAcc('mostplayed')} isMobile={isMobile} />
            <BrowseColumn label="Newest" Icon={Sparkles} color={C.accent} tint={C.accsoft}
              rows={newest.map((q) => ({ q, right: <NewRight q={q} /> }))} cta="View all ›" onCta={() => setListMode('newest')} open={!!acc.newest} onToggle={() => toggleAcc('newest')} isMobile={isMobile} />
            {cats.map((c) => (
              <BrowseColumn key={c.key} label={c.label} Icon={c.Icon} color={c.c} tint={c.t}
                rows={colRows(c, 6, shownIds).map((q) => ({ q, right: <PlaysRight id={q.id} plays={plays} leader={leader} leaderKey={leaderKey} color={c.c} hidePlays /> }))}
                cta={`View all ${c.count} ›`} onCta={() => setScope(c.key)} open={!!acc[c.key]} onToggle={() => toggleAcc(c.key)} isMobile={isMobile} />
            ))}
          </div>
        )}
      </div>

      {/* close the dropdown on outside click */}
      {ddOpen && <div className="qz-dd-overlay" onClick={() => setDdOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 20 }} />}

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, flexWrap: 'wrap', margin: '30px 0 8px', fontSize: 12.5, color: C.muted, fontFamily: FONT }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Check className="donemark" size={14} strokeWidth={2.75} style={{ color: C.live }} /> Played</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Star className="donemark" size={14} strokeWidth={1.5} fill="#e8b43a" color="#e8b43a" /> Completed (100%)</span>
      </div>

      <Footer />
    </div>
    </QuizDoneContext.Provider>
  );
}

function fmtAvgTime(s, plays) {
  if (!plays || !Number.isFinite(s) || s <= 0) return '—';
  const avg = Math.round(s / plays);
  const m = Math.floor(avg / 60);
  const sec = avg % 60;
  return m ? `${m}m ${sec}s` : `${sec}s`;
}

// Detailed browse card: title + department dot, then plays / current leader /
// high score / avg time, sourced from /api/quiz/stats + the totals leaders map.
function DetailCard({ q, s, leader, color }) {
  const plays = s ? (s.plays || 0) : 0;
  const high = s ? (s.bestScore || 0) : 0;
  const avgTime = fmtAvgTime(s ? s.totalTime : 0, plays);
  const Stat = ({ label, value }) => (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: C.soft }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  );
  return (
    <Link href={`/quiz/${q.id}`} className="qlink" title={q.rawTitle || q.title}>
      <div className="card" style={{ padding: '12px 14px', gap: 10, height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="dot" style={{ background: color, flex: 'none' }} />
          <span style={{ fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stripVerb(q.title)}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
          <Stat label="Plays" value={plays ? plays.toLocaleString() : '0'} />
          <Stat label="Current Leader" value={leader || '—'} />
          <Stat label="High Score" value={plays ? high.toLocaleString() : '—'} />
          <Stat label="Avg Time" value={avgTime} />
        </div>
      </div>
    </Link>
  );
}

function PlaysRight({ id, plays, leader, leaderKey, color, hidePlays }) {
  const p = plays(id);
  const ld = leader(id);
  return (
    <>
      {!hidePlays && p > 0 ? <span className="score" style={{ fontSize: 11 }}>▶ {p.toLocaleString()}</span> : null}
      {ld ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Crown size={11} style={{ color }} /><PlayerLink userKey={leaderKey ? leaderKey(id) : ''}>{ld}</PlayerLink></span>
      ) : <span style={{ color: C.soft }}>Empty</span>}
    </>
  );
}

function NewRight({ q }) {
  const t = Date.parse(q.publishedAt);
  let when = '';
  if (Number.isFinite(t)) {
    const d = new Date(t);
    when = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return (
    <>
      <span style={{ color: C.soft }}>{when}</span>
    </>
  );
}

// Selected-category compact view: the WHOLE category, leader-only, laid out in
// two columns (single column under ~680px). Header shows the category icon +
// label + total count.
function CategoryFull({ cat, plays, leader, leaderKey }) {
  if (!cat) return null;
  const rows = cat.quizzes.slice()
    .sort((a, b) => plays(b.id) - plays(a.id) || a.title.localeCompare(b.title));
  const { Icon, c: color, t: tint } = cat;
  return (
    <section style={{ minWidth: 0 }}>
      <div className="colhead" style={{ borderColor: color, background: `color-mix(in srgb, ${color} 6%, #fff)` }}>
        <span style={{ width: 24, height: 24, borderRadius: 7, background: tint, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} />
        </span>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color }}>{cat.label}</h3>
        <span className="viewall" style={{ color }}>{cat.count} quizzes</span>
      </div>
      <div className="qfull">
        {rows.map((q) => (
          <Link href={`/quiz/${q.id}`} className="qrow" key={q.id} title={q.rawTitle || q.title}>
            <span className="qtitle">{stripVerb(q.title)}</span><DoneMark id={q.id} />
            <span className="qmeta"><PlaysRight id={q.id} plays={plays} leader={leader} leaderKey={leaderKey} color={color} hidePlays /></span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function BrowseColumn({ label, Icon, color, tint, rows, cta, onCta, open = true, onToggle, isMobile }) {
  return (
    <section className={`mc-${open ? 'open' : 'closed'}`} style={{ minWidth: 0 }}>
      <div className="colhead" onClick={() => { if (isMobile && onToggle) onToggle(); }} style={{ borderColor: color, background: `color-mix(in srgb, ${color} 6%, #fff)`, cursor: isMobile ? 'pointer' : 'default' }}>
        <span className="colicon" style={{ width: 24, height: 24, borderRadius: 7, background: tint, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          <Icon size={14} />
        </span>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color }}>{label}</h3>
        {onCta
          ? <button type="button" onClick={(e) => { e.stopPropagation(); onCta(); }} className="viewall" style={{ color, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, fontWeight: 700 }}>{cta}</button>
          : <span className="viewall" style={{ color }}>{cta}</span>}
        <ChevronDown className="accchev" size={16} strokeWidth={2.5} style={{ flex: 'none', color: C.soft, transform: open ? 'none' : 'rotate(-90deg)' }} />
      </div>
      {rows.map(({ q, right }) => (
        <Link href={`/quiz/${q.id}`} className="qrow" key={q.id} title={q.rawTitle || q.title}>
          <span className="qtitle">{stripVerb(q.title)}</span><DoneMark id={q.id} />
          <span className="qmeta">{right}</span>
        </Link>
      ))}
    </section>
  );
}

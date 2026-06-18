'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteHeader from '../SiteHeader';
import {
  Search, ChevronDown, ArrowRight, BarChart3, Crown, Sparkles, Flame,
  BadgeCheck, Clapperboard, Music, Gamepad2, Plane, Globe, Utensils,
  Briefcase, Leaf, Tv, BookOpen, Landmark, Trophy,
} from 'lucide-react';
import { QUIZZES } from '@/lib/quizzes';
import {
  quizDept as deptOf, DEPT_COLOR, DEPT_LABEL, DEPT_NAV,
} from '@/lib/quiz-departments';
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
    <span style={{ flex: 'none', width: 18, height: 18, borderRadius: '50%', background: MEDAL[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: C.ink }}>{i + 1}</span>
  );
  return <span style={{ flex: 'none', width: 18, textAlign: 'center', fontSize: 11, color: C.soft }}>{i + 1}</span>;
}

// ─── main ───────────────────────────────────────────────────────────────────
export default function QuizHomeClient() {
  const [scope, setScope] = useState('all');
  const [ddOpen, setDdOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [listMode, setListMode] = useState(null); // null | 'newest' | 'mostplayed' | 'live' (View all expansions)

  const [totals, setTotals] = useState({ byQuiz: {}, leaders: {}, leaderKeys: {}, today: 0 });
  const [eloBoard, setEloBoard] = useState([]); // [{rank,name,isAnon,userKey}]
  const [eloScope, setEloScope] = useState('all');
  const [recent, setRecent] = useState([]); // [{quizId,username,score,total,playedAt,isAnon,attempt}]
  const [me, setMe] = useState(null);
  const [lbIdx, setLbIdx] = useState(0); // which leaderboard stat is showing
  const [view, setView] = useState('compact'); // 'compact' | 'detailed' browse layout
  const [statsById, setStatsById] = useState({}); // /api/quiz/stats keyed by quizId
  // Restore the saved browse-view preference once on mount.
  useEffect(() => {
    try { const v = localStorage.getItem('sot_quiz_browse_view'); if (v === 'detailed' || v === 'compact') setView(v); } catch {}
  }, []);
  function setBrowseView(v) { setView(v); try { localStorage.setItem('sot_quiz_browse_view', v); } catch {} }

  // Build the catalog once: every quiz, with its department + nav title.
  const catalog = useMemo(() => (QUIZZES || []).filter((q) => q && q.id).map((q) => ({
    id: q.id,
    title: q.navTitle || cleanTitle(q.title) || q.id,
    rawTitle: q.title || '',
    dept: deptOf(q),
    publishedAt: q.publishedAt || (q.publishedDate ? `${q.publishedDate}T12:00:00Z` : ''),
  })), []);

  const titleById = useMemo(() => Object.fromEntries(catalog.map((q) => [q.id, q.title])), [catalog]);

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
  }, []);

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
    };
  }, [me, scope]);

  // ── leaderboard: re-ranks per slide AND per category ──
  // Each slide sorts the board by that slide's metric (desc; ties by rating then
  // name), scoped to the selected category (the elo API already returns the
  // per-category metric values). The Skill Rating slide DOES show the rating.
  const LB_METRICS = [
    { key: 'rating', label: 'Top Skill Rating', fmt: (v) => (v || 0).toLocaleString(), ms: 7000 },
    { key: 'correct', label: 'Most Correct Answers', fmt: (v) => (v || 0).toLocaleString(), ms: 5000 },
    { key: 'completed', label: 'Most Quizzes Aced (100%)', fmt: (v) => (v || 0).toLocaleString(), ms: 5000 },
    { key: 'daysPlayed', label: 'Most Days Played', fmt: (v) => (v || 0).toLocaleString(), ms: 5000 },
    { key: 'accuracy', label: 'Highest Accuracy', fmt: (v) => `${v || 0}%`, ms: 5000 },
  ];
  const lbMetric = LB_METRICS[lbIdx];
  // Per-slide timeout: the ELO slide holds 7s, every other slide 5s.
  useEffect(() => {
    const id = setTimeout(() => setLbIdx((i) => (i + 1) % LB_METRICS.length), lbMetric.ms);
    return () => clearTimeout(id);
  }, [lbIdx, lbMetric.ms]);
  // Sort the displayed board by the active slide's metric, scoped to the current
  // category (eloBoard is already category-scoped via the /api/quiz/elo refetch).
  const leaderRows = useMemo(() => {
    const k = lbMetric.key;
    // Highest Accuracy needs a real sample: only players with >=3 unique
    // quizzes played qualify (a 100% from one quiz shouldn't top the board).
    const pool = k === 'accuracy' ? eloBoard.filter((p) => (p.played || 0) >= 3) : eloBoard;
    return pool.slice().sort((a, b) =>
      ((b[k] || 0) - (a[k] || 0))
      || ((b.rating || 0) - (a.rating || 0))
      || (a.name || '').localeCompare(b.name || '')
    ).slice(0, 10);
  }, [eloBoard, lbMetric.key]);

  // ── live feed (scoped by quiz department) ──
  const liveRows = useMemo(() => {
    const rows = recent.map((p) => ({ ...p, dept: deptOf({ id: p.quizId }), title: titleById[p.quizId] || cleanTitle(p.quizId) }));
    const scoped = scope === 'all' ? rows : rows.filter((r) => r.dept === scope);
    return scoped.slice(0, 10);
  }, [recent, scope, titleById]);

  const playsToday = totals.today || 0;

  // ── browse columns ──
  // Newest first (so the dedupe sets below can reference it), then Most Played
  // excluding anything already in Newest, then each category column excluding
  // everything shown in Newest + Most Played. No quiz appears twice on the page.
  const newest = useMemo(() => catalog.slice()
    .filter((q) => !/daily-market|weekly-business|daily-business/.test(q.id))
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
    .filter((q) => !/daily-market|weekly-business|daily-business/.test(q.id))
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0)), [catalog]);
  const mostPlayedAll = useMemo(() => catalog.slice()
    .sort((a, b) => plays(b.id) - plays(a.id) || a.title.localeCompare(b.title)), [catalog, totals]);
  const liveAll = useMemo(() => recent.map((p) => ({ ...p, title: titleById[p.quizId] || cleanTitle(p.quizId) })), [recent, titleById]);

  function colRows(cat, lim, exclude) {
    return cat.quizzes.slice()
      .filter((q) => !exclude || !exclude.has(q.id))
      .sort((a, b) => plays(b.id) - plays(a.id) || a.title.localeCompare(b.title))
      .slice(0, lim);
  }

  // Search across the whole catalog.
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return catalog.filter((c) => c.rawTitle.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)).slice(0, 80);
  }, [search, catalog]);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
    .qzh{font-family:${FONT};color:${C.ink};}
    .qzh .lbl{font-size:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:${C.muted};}
    .qzh .card{background:${C.surface};border:1px solid ${C.line};border-radius:12px;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
    .qzh .head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 13px 9px;border-bottom:1px solid ${C.line};min-height:42px;}
    .qzh .lrow{display:flex;align-items:center;gap:9px;padding:5.5px 13px;font-size:12.5px;}
    .qzh .qtitle{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .qzh .att{font-size:9.5px;font-weight:700;color:${C.soft};}
    .qzh .score{flex:none;font-weight:700;color:${C.accent};font-variant-numeric:tabular-nums;}
    @media(max-width:680px){.qzh .lf-extra{display:none;}}
    @keyframes qzp{0%{opacity:1}50%{opacity:.35}100%{opacity:1}}
    .qzh .dd{position:relative;}
    .qzh .ddbtn{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid ${C.line};border-radius:10px;padding:9px 12px;cursor:pointer;font:inherit;min-width:200px;}
    .qzh .ddmenu{position:absolute;top:calc(100% + 6px);left:0;z-index:30;background:#fff;border:1px solid ${C.line};border-radius:10px;box-shadow:0 8px 24px rgba(20,22,28,0.12);padding:6px;min-width:430px;display:grid;grid-template-columns:1fr 1fr;gap:1px 4px;}
    .qzh .ddmenu .ddall{grid-column:1 / -1;}
    .qzh .dditem{display:flex;align-items:center;gap:9px;padding:7px 9px;border-radius:7px;cursor:pointer;font-size:13px;}
    .qzh .dditem:hover{background:${C.bg};}
    .qzh .dot{width:9px;height:9px;border-radius:3px;flex:none;}
    .qzh .boards{display:grid;grid-template-columns:1fr 2fr;gap:12px;align-items:stretch;margin-bottom:22px;}
    @media(max-width:680px){.qzh .boards{grid-template-columns:1fr;}}
    .qzh .qcols{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:6px 26px;}
    .qzh .qfull{display:grid;grid-template-columns:1fr 1fr;gap:0 26px;}
    @media(max-width:680px){.qzh .qfull{grid-template-columns:1fr;}}
    .qzh .colhead{display:flex;align-items:center;gap:9px;padding:7px 0;border-bottom:2px solid ${C.ink};margin-bottom:3px;}
    .qzh .viewall{margin-left:auto;font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;}
    .qzh .qrow{display:flex;align-items:baseline;gap:10px;padding:6px 0;border-bottom:1px solid rgba(20,22,28,0.07);text-decoration:none;color:${C.ink};min-width:0;overflow:hidden;}
    .qzh .qrow:hover .qtitle{color:${C.accent};}
    .qzh .qrow .qtitle{font-size:13px;font-weight:500;}
    .qzh .qmeta{flex:none;display:flex;align-items:center;gap:10px;font-size:10.5px;}
    .qzh .hubbtn{display:flex;align-items:center;gap:7px;background:${C.accent};color:#fff;padding:10px 15px;border-radius:10px;font-weight:700;font-size:13px;text-decoration:none;white-space:nowrap;}
    @media(max-width:560px){.qz-playerbar{flex-direction:column !important;align-items:stretch !important;gap:12px !important;}.qz-playerbar .qz-div{display:none !important;}.qz-playerbar .dd,.qz-playerbar .ddbtn{width:100% !important;min-width:0 !important;}.qz-playerbar .qz-stats{margin-left:0 !important;justify-content:space-between !important;gap:14px !important;}.qz-playerbar .hubbtn{width:100% !important;justify-content:center !important;}}
    .qzh .hubbtn:hover{filter:brightness(1.06);}
    .qzh .crumb1{font-size:18px;font-weight:800;letter-spacing:-0.02em;}
    .qzh .crumb2{font-size:18px;font-weight:600;color:${C.accent};}
    .qzh a.qlink{text-decoration:none;color:inherit;}
  `;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', position: 'relative' }}>
      <Grain />
      <style>{css}</style>
      <SiteHeader active="quizzes" />
      <div className="qzh" style={{ maxWidth: 1180, margin: '0 auto', padding: '20px 24px 70px', position: 'relative' }}>

        {/* player bar */}
        <div className="card qz-playerbar" style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 16, padding: '11px 14px', margin: '4px 0 12px', overflow: 'visible', position: 'relative', zIndex: 40 }}>
          <div className="dd">
            <button className="ddbtn" onClick={(e) => { e.stopPropagation(); setDdOpen((o) => !o); }}>
              <span className="dot" style={{ background: scope === 'all' ? C.ink : (byKey[scope]?.c || C.ink) }} />
              <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: 13 }}>{scope === 'all' ? 'All Categories' : byKey[scope]?.label}</span>
              <ChevronDown size={16} style={{ color: C.muted }} />
            </button>
            {ddOpen && (
              <div className="ddmenu" onClick={(e) => e.stopPropagation()}>
                <div className="dditem ddall" onClick={() => { setScope('all'); setDdOpen(false); setSearch(''); setListMode(null); }}>
                  <span className="dot" style={{ background: C.ink }} /><span style={{ flex: 1 }}>All Categories</span>
                  <span style={{ fontSize: 11, color: C.soft }}>{totalCount}</span>
                </div>
                {cats.map((c) => (
                  <div key={c.key} className="dditem" onClick={() => { setScope(c.key); setDdOpen(false); setSearch(''); setListMode(null); }}>
                    <span className="dot" style={{ background: c.c }} /><span style={{ flex: 1 }}>{c.label}</span>
                    <span style={{ fontSize: 11, color: C.soft }}>{c.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="qz-div" style={{ width: 1, height: 34, background: C.line }} />
          <div>
            <div className="lbl">Skill rank{scope === 'all' ? '' : ` · ${byKey[scope]?.label}`}</div>
            {playerStats && playerStats.rank ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: C.accent, lineHeight: 1 }}>{`#${playerStats.rank}`}</span>
                {playerStats.denom ? <span style={{ fontSize: 11, color: C.muted }}>of {playerStats.denom.toLocaleString()}</span> : null}
              </div>
            ) : (
              <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, lineHeight: 1.2, marginTop: 2, maxWidth: 160 }}>Play your first quiz to populate</div>
            )}
          </div>
          <div className="qz-stats" style={{ display: 'flex', gap: 22, marginLeft: 'auto', flexWrap: 'wrap' }}>
            <div><div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}><span style={{ fontSize: 17, fontWeight: 700 }}>{playerStats && playerStats.completed != null ? playerStats.completed : '—'}</span>{playerStats && playerStats.completed != null && totalCount ? <span style={{ fontSize: 11, fontWeight: 600, color: C.soft }}>({playerStats.completed > 0 && playerStats.completed / totalCount < 0.005 ? '<1' : Math.round((playerStats.completed / totalCount) * 100)}%)</span> : null}</div><div className="lbl">completed</div></div>
            <div><div style={{ fontSize: 17, fontWeight: 700 }}>{playerStats && playerStats.played != null ? playerStats.played : '—'}</div><div className="lbl">played</div></div>
            <div><div style={{ fontSize: 17, fontWeight: 700 }}>{playerStats && playerStats.correct != null ? playerStats.correct.toLocaleString() : '—'}</div><div className="lbl">correct</div></div>
            <div><div style={{ fontSize: 17, fontWeight: 700 }}>{playerStats && playerStats.accuracy != null ? `${playerStats.accuracy}%` : '—'}</div><div className="lbl">accuracy</div></div>
          </div>
          <Link className="hubbtn" href="/quizzes/hub"><BarChart3 size={16} /> Stat Hub <ArrowRight size={15} /></Link>
        </div>

        {/* boards */}
        <div className="boards">
          {/* leaderboard */}
          <div className="card">
            <div className="head">
              <span className="lbl" style={{ color: C.ink }}>{lbMetric.label}{scope === 'all' ? '' : ` · ${byKey[scope]?.label}`}</span>
              <Link href="/quizzes/hub" className="qlink"><span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: C.soft }}>Full →</span></Link>
            </div>
            <div style={{ flex: 1, padding: '3px 0' }}>
              {leaderRows.length === 0 && <div style={{ padding: '12px 13px', fontSize: 12, color: C.soft }}>No ranked players yet.</div>}
              {leaderRows.map((r, i) => (
                <div className="lrow" key={r.userKey || i}>
                  <Medal i={i} />
                  <span className="qtitle">{r.userKey ? <Link href={`/quizzes/hub?player=${encodeURIComponent(r.userKey)}`} style={{ color: 'inherit', textDecoration: 'none' }}><WhoTag name={r.name} isAnon={r.isAnon} /></Link> : <WhoTag name={r.name} isAnon={r.isAnon} />}</span>
                  <span style={{ flex: 'none', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{lbMetric.fmt(r[lbMetric.key])}</span>
                </div>
              ))}
            </div>
          </div>

          {/* live feed */}
          <div className="card">
            <div className="head">
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.live, animation: 'qzp 1.6s infinite' }} />
                <span className="lbl" style={{ color: C.ink }}>Live · Quizzes Played{scope === 'all' ? '' : ` · ${byKey[scope]?.label}`}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {playsToday ? <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: C.soft }}>{playsToday.toLocaleString()} Plays Today</span> : null}
                <button type="button" onClick={() => setListMode('live')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: C.accent, fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap' }}>View all ›</button>
              </span>
            </div>
            <div style={{ flex: 1, padding: '3px 0' }}>
              {liveRows.length === 0 && <div style={{ padding: '12px 13px', fontSize: 12, color: C.soft }}>No recent plays{scope === 'all' ? '' : ' in this category'} yet.</div>}
              {liveRows.map((f, i) => (
                <Link href={`/quiz/${f.quizId}`} className="qlink" key={i}>
                  <div className="lrow" style={{ gap: 9 }}>
                    <span className="qtitle" style={{ fontWeight: 600 }}>{f.title}</span>
                    <span className="qmeta" style={{ gap: 8 }}>
                      <PlayerLink userKey={f.userKey}><WhoTag name={f.name || (f.isAnon ? 'Guest' : 'Player')} isAnon={f.isAnon} /></PlayerLink>
                      <span className="score lf-extra">{f.score}/{f.total}</span>
                      <span className="att lf-extra">{f.attempt > 1 ? `attempt ${f.attempt}` : '1st try'}</span>
                      <span style={{ color: C.soft }}>{relTime(f.playedAt)}</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* browse header + search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
          {(!searchResults && scope === 'all' && !listMode) ? (
            <Link href="/submit?for=quiz" style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 6, background: C.ink, color: '#fff', padding: '9px 16px', borderRadius: 10, fontFamily: FONT, fontWeight: 700, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Submit a Quiz
            </Link>
          ) : (
            <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 10 }}>
              {listMode && !searchResults && scope === 'all' && (
                <button type="button" onClick={() => setListMode(null)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: C.accent, fontWeight: 700, fontSize: 14 }}>‹ Back</button>
              )}
              {searchResults ? `Search Results · ${searchResults.length}`
                : scope !== 'all' ? `${byKey[scope]?.label} Quizzes`
                : listMode === 'newest' ? `Newest Quizzes · ${newestAll.length}`
                : listMode === 'mostplayed' ? `Most Played · ${mostPlayedAll.length}`
                : 'Live · Quizzes Played'}
            </h2>
          )}
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.soft }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${scopeCount.toLocaleString()} quizzes`}
              autoComplete="off"
              style={{ width: '100%', padding: '9px 12px 9px 36px', border: `1px solid ${C.line}`, borderRadius: 10, font: 'inherit', fontFamily: FONT, fontSize: 13.5, background: '#fff', color: C.ink, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* lists */}
        {searchResults ? (
          searchResults.length === 0 ? (
            <div style={{ padding: '18px 2px', color: C.soft, fontSize: 14 }}>No quizzes match “{search}”.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(310px,1fr))', gap: '0 26px' }}>
              {searchResults.map((r) => {
                const cc = (DEPT_COLOR[r.dept] || DEPT_COLOR.misc).c;
                return (
                  <Link href={`/quiz/${r.id}`} className="qrow" key={r.id} title={r.rawTitle || r.title}>
                    <span className="dot" style={{ background: cc, alignSelf: 'center' }} />
                    <span className="qtitle">{stripVerb(r.title)}</span>
                    <span className="qmeta" style={{ color: C.soft, fontSize: 10, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' }}>{DEPT_LABEL[r.dept]}</span>
                  </Link>
                );
              })}
            </div>
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
                  <PlayerLink userKey={f.userKey}><WhoTag name={f.name || (f.isAnon ? 'Guest' : 'Player')} isAnon={f.isAnon} /></PlayerLink>
                  <span className="score lf-extra">{f.score}/{f.total}</span>
                  <span className="lf-extra" style={{ color: C.soft }}>{relTime(f.playedAt)}</span>
                </span>
              </Link>
            ))}
          </div>
        ) : listMode ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(310px,1fr))', gap: '0 26px' }}>
            {(listMode === 'newest' ? newestAll : mostPlayedAll).map((q) => {
              const cc = (DEPT_COLOR[q.dept] || DEPT_COLOR.misc).c;
              return (
                <Link href={`/quiz/${q.id}`} className="qrow" key={q.id} title={q.rawTitle || q.title}>
                  <span className="dot" style={{ background: cc, alignSelf: 'center' }} />
                  <span className="qtitle">{stripVerb(q.title)}</span>
                  <span className="qmeta">{listMode === 'newest' ? <NewRight q={q} /> : <PlaysRight id={q.id} plays={plays} leader={leader} leaderKey={leaderKey} color={C.accent} />}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="qcols">
            <BrowseColumn label="Newest" Icon={Sparkles} color={C.accent} tint={C.accsoft}
              rows={newest.map((q) => ({ q, right: <NewRight q={q} /> }))} cta="View all ›" onCta={() => setListMode('newest')} />
            <BrowseColumn label="Most Played" Icon={Flame} color="#c2691c" tint="#f4e2cd"
              rows={mostPlayed.map((q) => ({ q, right: <PlaysRight id={q.id} plays={plays} leader={leader} leaderKey={leaderKey} color="#c2691c" hidePlays /> }))} cta="View all ›" onCta={() => setListMode('mostplayed')} />
            {cats.map((c) => (
              <BrowseColumn key={c.key} label={c.label} Icon={c.Icon} color={c.c} tint={c.t}
                rows={colRows(c, 6, shownIds).map((q) => ({ q, right: <PlaysRight id={q.id} plays={plays} leader={leader} leaderKey={leaderKey} color={c.c} hidePlays /> }))}
                cta={`View all ${c.count} ›`} onCta={() => setScope(c.key)} />
            ))}
          </div>
        )}
      </div>

      {/* close the dropdown on outside click */}
      {ddOpen && <div onClick={() => setDdOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 20 }} />}

      <Footer />
    </div>
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
      <div className="colhead" style={{ borderColor: color }}>
        <span style={{ width: 24, height: 24, borderRadius: 7, background: tint, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} />
        </span>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{cat.label}</h3>
        <span className="viewall" style={{ color }}>{cat.count} quizzes</span>
      </div>
      <div className="qfull">
        {rows.map((q) => (
          <Link href={`/quiz/${q.id}`} className="qrow" key={q.id} title={q.rawTitle || q.title}>
            <span className="qtitle">{stripVerb(q.title)}</span>
            <span className="qmeta"><PlaysRight id={q.id} plays={plays} leader={leader} leaderKey={leaderKey} color={color} hidePlays /></span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function BrowseColumn({ label, Icon, color, tint, rows, cta, onCta }) {
  return (
    <section style={{ minWidth: 0 }}>
      <div className="colhead" style={{ borderColor: color }}>
        <span style={{ width: 24, height: 24, borderRadius: 7, background: tint, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} />
        </span>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{label}</h3>
        {onCta
          ? <button type="button" onClick={onCta} className="viewall" style={{ color, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, fontWeight: 700 }}>{cta}</button>
          : <span className="viewall" style={{ color }}>{cta}</span>}
      </div>
      {rows.map(({ q, right }) => (
        <Link href={`/quiz/${q.id}`} className="qrow" key={q.id} title={q.rawTitle || q.title}>
          <span className="qtitle">{stripVerb(q.title)}</span>
          <span className="qmeta">{right}</span>
        </Link>
      ))}
    </section>
  );
}

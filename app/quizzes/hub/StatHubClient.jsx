'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, User, ListChecks, Flame, FunctionSquare, Clock, Trophy, RefreshCw, Share2,
} from 'lucide-react';
import { QUIZZES, getQuiz } from '@/lib/quizzes';
import { quizDept as deptOf, DEPT_COLOR, DEPT_LABEL, DEPT_NAV } from '@/lib/quiz-departments';
import { CHALLENGES, getChallenge, DEFAULT_CHALLENGE_ID, challengeQuizIds, challengeColumns } from '@/lib/challenges';
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
  { t: 'rating', label: 'Rating', Icon: FunctionSquare },
  { t: 'quizzes', label: 'Quizzes', Icon: ListChecks },
  { t: 'challenges', label: 'Challenges', Icon: Flame },
];

export default function StatHubClient() {
  const scope = 'all'; // category selector removed; Stat Hub always shows overall + per-category table
  const [tab, setTab] = useState('player');

  const [me, setMe] = useState(null);
  const [stats, setStats] = useState([]);     // /api/quiz/stats
  const [totals, setTotals] = useState({ byQuiz: {}, leaders: {}, total: 0 });
  const [challenge, setChallenge] = useState(null); // /api/quiz/challenge-leaderboard
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
    fetch('/api/quiz/totals').then((r) => r.json()).then((d) => { if (d && !d.error) setTotals({ byQuiz: d.byQuiz || {}, leaders: d.leaders || {}, total: d.total || 0 }); }).catch(() => {});
    fetch('/api/quiz/challenge-leaderboard').then((r) => r.json()).then((d) => { if (d && !d.error) setChallenge(d); }).catch(() => {});
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
  const viewing = !!viewKey;
  const profile = viewing ? viewProfile : me;
  const found = profile && profile.found;
  const rating = profile ? (profile.rating || 1500) : 1500;
  const tierLabel = profile && profile.tier ? profile.tier : 'Unrated';
  const tierBg = profile && profile.tierBg ? profile.tierBg : '#eceef1';
  const tierFg = profile && profile.tierFg ? profile.tierFg : C.muted;

  const statsById = useMemo(() => Object.fromEntries(stats.map((s) => [s.quizId, s])), [stats]);
  const totalPlays = useMemo(() => stats.reduce((a, s) => a + (s.plays || 0), 0), [stats]);

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
    @media(max-width:680px){.qzhub .tabs{overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}.qzhub .tabs::-webkit-scrollbar{display:none;}.qzhub .tab{flex:0 0 auto;}.qzhub .tabcue{display:flex;align-items:center;position:sticky;right:0;flex:0 0 auto;padding:0 8px 0 16px;color:${C.muted};font-weight:800;font-size:15px;background:linear-gradient(to right,rgba(236,238,241,0),#eceef1 45%);pointer-events:none;}}
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
  `;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', position: 'relative' }}>
      <Grain />
      <style>{css}</style>
      <div className="qzhub" style={{ maxWidth: 1180, margin: '0 auto', padding: '20px 24px 70px', position: 'relative' }}>

        {/* Shared site header on every page */}
        <SiteHeader active="quizzes" />

        {/* profile header — leads with OVERALL RANK (largest element) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 18, padding: '15px 18px', marginTop: 16, overflow: 'visible', position: 'relative', zIndex: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            {found && profile.name ? <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: C.ink }}>{profile.name}</div> : null}
            {found && profile.name ? <div style={{ width: 1, height: 50, background: C.line }} /> : null}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="lbl">Overall Rank</span>
              <span style={{ fontSize: 42, fontWeight: 800, color: C.accent, lineHeight: 1 }}>{found && profile.rank ? `#${profile.rank}` : '—'}</span>
              <span style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>{found && profile.totalPlayers ? `of ${profile.totalPlayers.toLocaleString()} players` : 'No games on record yet'}</span>
            </div>
            <div style={{ width: 1, height: 50, background: C.line }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <div className="lbl">Skill Rating</div>
                <div style={{ fontSize: 21, fontWeight: 800, color: C.ink }}>{found ? rating.toLocaleString() : '—'}{found ? <span style={{ background: tierBg, color: tierFg, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, verticalAlign: 2, marginLeft: 6 }}>{(tierLabel || '').replace(/ Tier$/, '')}</span> : null}</div>
              </div>
              <ChipMetric label="Correct" value={found ? profile.activity.correct.toLocaleString() : '—'} rank={found && profile.ranks ? profile.ranks.correct : null} />
              <ChipMetric label="Completed" value={found ? profile.activity.completed : '—'} rank={found && profile.ranks ? profile.ranks.completed : null} />
              <ChipMetric label="Accuracy" value={found ? `${profile.activity.accuracy}%` : '—'} rank={found && profile.ranks ? profile.ranks.accuracy : null} />
            </div>
          </div>
        </div>

        {viewing ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: C.accsoft, border: `1px solid ${C.line}`, borderRadius: 10, padding: '8px 14px', marginTop: 10 }}>
            <span style={{ fontSize: 13, color: C.ink }}>Viewing <b>{(viewProfile && viewProfile.name) || 'player'}</b>{"'"}s stats</span>
            <button onClick={() => setViewKey(null)} style={{ border: 'none', background: C.accent, color: '#fff', borderRadius: 7, padding: '6px 13px', font: 'inherit', fontFamily: FONT, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Back to my stats</button>
          </div>
        ) : null}

        {/* tabs */}
        <div className="tabs">
          {TABS.map(({ t, label, Icon }) => (
            <button key={t} className={`tab${tab === t ? ' on' : ''}`} onClick={() => setTab(t)}>
              <Icon size={15} /> {label}
            </button>
          ))}
          <span className="tabcue" aria-hidden="true">{'\u203A'}</span>
        </div>

        {tab === 'player' && <PlayerPanel me={profile} scope={scope} cats={cats} byKey={byKey} totalQuizzes={catalog.length} board={board} myName={myName} myAnonKey={myAnonKey} titleById={titleById} pview={pview} setPview={setPview} onSelectPlayer={(k) => { const mine = (me && me.userKey && k === me.userKey) || (myAnonKey && k === myAnonKey); setViewKey(mine ? null : k); setPview(mine ? 'ranking' : 'category'); }} />}
        {tab === 'quizzes' && <QuizzesPanel me={profile} scope={scope} byKey={byKey} catalog={catalog} stats={statsById} totals={totals} totalPlays={totalPlays} />}
        {tab === 'challenges' && <ChallengesPanel me={profile} />}
        {tab === 'rating' && <RatingPanel me={profile} titleById={titleById} />}
      </div>

      <Footer />
    </div>
  );
}

// ─── small helpers ──────────────────────────────────────────────────────────
// A compact metric for the profile header: label, value, and a "#rank" chip.
function ChipMetric({ label, value, rank }) {
  return (
    <div>
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

function PlayerPanel({ me, scope, cats, byKey, totalQuizzes, board, myName, myAnonKey, titleById, pview, setPview, onSelectPlayer }) {
  const found = me && me.found;
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
    <div style={{ display: 'flex', gap: 3, background: '#eceef1', borderRadius: 9, padding: 3, flex: 'none' }}>
      {[['ranking', 'Ranking'], ['category', 'Category Detail'], ['activity', 'Activity Feed']].map(([v, lbl]) => (
        <button key={v} onClick={() => setPview(v)} style={{ border: 'none', background: pview === v ? '#fff' : 'transparent', color: pview === v ? C.ink : C.muted, fontWeight: pview === v ? 700 : 600, boxShadow: pview === v ? '0 1px 2px rgba(20,22,28,0.06)' : 'none', borderRadius: 7, padding: '7px 15px', font: 'inherit', fontFamily: FONT, fontSize: 12.5, cursor: 'pointer' }}>{lbl}</button>
      ))}
    </div>
  );

  return (
    <div>
      <div className="card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          {toggle}
        </div>
        {pview === 'ranking' ? (
          <UserBaseBody board={board} myName={myName} myAnonKey={myAnonKey} onSelectPlayer={onSelectPlayer} />
        ) : pview === 'activity' ? (
          <ActivityFeed recent={found ? me.recent : []} titleById={titleById} />
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
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}><b>{a.correct.toLocaleString()}</b><RankChip rank={ranks.correct} total={totalPlayers} />{base.correct != null ? <div style={{ fontSize: 9.5, color: C.muted }}>avg {base.correct.toLocaleString()}</div> : null}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}><b>{a.played.toLocaleString()}</b><RankChip rank={ranks.played} total={totalPlayers} />{base.played != null ? <div style={{ fontSize: 9.5, color: C.muted }}>avg {base.played.toLocaleString()}</div> : null}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}><b>{a.completed.toLocaleString()}</b><RankChip rank={ranks.completed} total={totalPlayers} />{base.completed != null ? <div style={{ fontSize: 9.5, color: C.muted }}>avg {base.completed.toLocaleString()}</div> : null}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}><b>{a.accuracy}%</b><RankChip rank={ranks.accuracy} total={totalPlayers} />{base.accuracy != null ? <div style={{ fontSize: 9.5, color: C.muted }}>avg {base.accuracy}%</div> : null}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}><b>{a.daysPlayed || 0}</b><RankChip rank={ranks.daysPlayed} total={totalPlayers} />{base.daysPlayed != null ? <div style={{ fontSize: 9.5, color: C.muted }}>avg {base.daysPlayed.toLocaleString()}</div> : null}</td>
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
                      <td style={{ textAlign: 'right', color: muted ? C.soft : C.ink, whiteSpace: 'nowrap' }}>{cr ? cr.completed : '\u2014'}{cr && cr.completedRank ? <RankChip rank={cr.completedRank} /> : null}</td>
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
    </div>
  );
}

// Per-quiz play feed: the current player's recent games, newest first, each
// linking to that quiz. Lives under the Player tab's "Activity Feed" view.
function ActivityFeed({ recent, titleById }) {
  if (!recent || !recent.length) return <div style={{ fontSize: 13, color: C.soft, padding: '6px 0' }}>No games on record yet. Play a quiz and it shows up here.</div>;
  return (
    <div style={{ overflow: 'auto', maxHeight: 600 }}>
      <table>
        <thead><tr>
          <th>Quiz</th>
          <th style={{ textAlign: 'right' }}>When</th>
          <th style={{ textAlign: 'right' }}>Your %</th>
          <th style={{ textAlign: 'right' }}>Rating &Delta;</th>
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
function UserBaseBody({ board, myName, myAnonKey, onSelectPlayer }) {
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
              const mi = idx < 3 ? idx : -1;
              return (
                <tr key={p.userKey} style={mine ? { background: C.accsoft } : undefined}>
                  <td style={{ fontWeight: 800, color: mi >= 0 ? MEDAL[mi] : C.soft }}>{idx + 1}</td>
                  <td style={{ fontWeight: mine ? 800 : 600, whiteSpace: 'nowrap' }}><button onClick={() => onSelectPlayer && onSelectPlayer(p.userKey)} style={{ border: 'none', background: 'transparent', padding: 0, font: 'inherit', fontFamily: FONT, fontWeight: 'inherit', color: C.accent, cursor: 'pointer', textAlign: 'left' }}>{p.name}</button>{p.isAnon ? <span style={{ fontSize: 10, color: C.soft, fontWeight: 600, marginLeft: 6 }}>guest</span> : null}{mine ? <span style={{ fontSize: 10, color: C.accent, fontWeight: 700, marginLeft: 6 }}>you</span> : null}</td>
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
  const [chId, setChId] = useState(DEFAULT_CHALLENGE_ID);
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [shared, setShared] = useState(false);

  const ch = getChallenge(chId) || CHALLENGES[0];
  const cols = challengeColumns(ch);
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
    const url = typeof window !== 'undefined' ? `${window.location.origin}/quizzes/leaderboard` : 'https://sourceoftruths.com/quizzes/leaderboard';
    const text = `${ch.title} on Source of Truths.${ch.prize ? ' There is a prize on the line for the winner.' : ''} Think you can top the leaderboard?`;
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
        .chg-table{border-collapse:separate;border-spacing:0;width:100%;font-variant-numeric:tabular-nums;font-size:12.5px;}
        .chg-table th,.chg-table td{white-space:nowrap;}
        .chg-grp{padding:10px 8px 8px;text-align:center;border-bottom:2px solid var(--ac);border-left:1px solid ${C.line};background:${C.bg};}
        .chg-grp-ico{font-size:18px;display:block;line-height:1;margin-bottom:3px;}
        .chg-grp-nm{font-weight:700;font-size:12.5px;color:${C.ink};}
        .chg-sub{padding:6px 8px 8px;text-align:center;font-size:10px;letter-spacing:.04em;text-transform:uppercase;color:var(--ac);font-weight:700;border-bottom:1px solid ${C.line};border-left:1px solid rgba(20,22,28,0.04);background:${C.bg};}
        .chg-corner{position:sticky;left:0;z-index:2;background:${C.bg};text-align:left;padding:10px 14px;font-weight:700;font-size:12.5px;color:${C.ink};border-bottom:2px solid ${C.accent};border-right:2px solid ${C.line};}
        .chg-thc{padding:8px 10px;font-size:10px;letter-spacing:.04em;text-transform:uppercase;color:${C.muted};border-bottom:1px solid ${C.line};text-align:center;vertical-align:bottom;background:${C.bg};font-weight:700;}
        .chg-thc.chg-first{border-left:2px solid ${C.line};}
        .chg-player{position:sticky;left:0;z-index:1;background:${C.surface};text-align:left;padding:9px 14px;border-right:2px solid ${C.line};border-bottom:1px solid rgba(20,22,28,0.06);}
        .chg-rk{display:inline-flex;align-items:center;justify-content:center;width:21px;height:21px;border-radius:50%;border:1px solid ${C.line};font-size:11px;font-weight:700;margin-right:9px;vertical-align:middle;color:${C.ink};}
        .chg-nm{font-weight:700;font-size:13.5px;vertical-align:middle;}
        .chg-pl{font-size:10.5px;color:${C.soft};margin-left:8px;vertical-align:middle;}
        .chg-sc{text-align:center;padding:8px;border-bottom:1px solid rgba(20,22,28,0.06);border-left:1px solid rgba(20,22,28,0.04);}
        .chg-v{font-weight:800;font-size:14px;color:var(--ac);}
        .chg-empty{color:${C.soft};font-size:13px;}
        .chg-zero .chg-v{color:${C.soft};font-weight:600;}
        .chg-totc{text-align:center;padding:8px 12px;border-left:2px solid ${C.line};border-bottom:1px solid rgba(20,22,28,0.06);}
        .chg-totc span{font-weight:800;font-size:16px;color:${C.accent};}
        .chg-tott{text-align:center;padding:8px 14px 8px 10px;font-size:12.5px;font-weight:600;color:${C.ink};border-bottom:1px solid rgba(20,22,28,0.06);}
        .chg-table tbody tr:hover td,.chg-table tbody tr:hover th.chg-player{background:${C.accsoft};}
        .chg-legend{display:flex;flex-wrap:wrap;gap:8px 16px;margin:14px 0 4px;font-size:11.5px;color:${C.muted};}
        .chg-chip{display:inline-flex;align-items:center;gap:6px;}
        .chg-sw{width:10px;height:10px;border-radius:3px;display:inline-block;}
        .chg-foot{font-size:11.5px;line-height:1.7;color:${C.soft};max-width:880px;margin-top:12px;}
        .chg-foot b{color:${C.muted};font-weight:700;}
        .chg-prize{display:inline-flex;align-items:center;gap:8px;margin-top:12px;padding:8px 13px;background:${C.accent};color:#fff;font-size:12px;font-weight:700;border-radius:8px;}
      `}</style>

      <div className="card" style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ background: C.accsoft, color: C.accent, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6 }}>{ch.kicker || 'Challenge'}</span>
          <span style={{ fontSize: 11.5, color: C.muted, display: 'inline-flex', alignItems: 'center', gap: 5 }}><Clock size={12} /> opens {ch.sinceLabel}</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 8 }}>{ch.title}</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 3, maxWidth: 760 }}>{ch.blurb}</div>
        {ch.prize ? (<div className="chg-prize"><Trophy size={13} strokeWidth={2.4} /> {ch.prize}</div>) : null}

        {CHALLENGES.length > 1 && (
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 14 }}>
            {CHALLENGES.map((c) => {
              const on = c.id === ch.id;
              return <button key={c.id} onClick={() => setChId(c.id)} style={{ padding: '7px 14px', background: on ? C.accent : '#fff', color: on ? '#fff' : C.ink, border: `1px solid ${on ? C.accent : C.line}`, borderRadius: 8, font: 'inherit', fontFamily: FONT, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{c.title.replace(/^The\s+/, '')}</button>;
            })}
          </div>
        )}

        <div className="chg-meta">
          <span><b>{data ? data.totalRegisteredPlayers : '\u2014'}</b> registered players</span>
          <span>Best attempt per quiz</span>
          {data && data.generatedAt ? <span>Updated <b>{chUpdated(data.generatedAt)}</b></span> : null}
          <button className="chg-btn" onClick={() => load(true)} disabled={refreshing}><RefreshCw size={12} strokeWidth={2.4} style={{ animation: refreshing ? 'chgspin 0.8s linear infinite' : 'none' }} /> Refresh</button>
          <button className="chg-btn" onClick={doShare}><Share2 size={12} strokeWidth={2.4} /> {shared ? 'Copied!' : 'Share'}</button>
        </div>

        {!loaded ? (
          <div style={{ fontSize: 13, color: C.soft, padding: '24px 0' }}>Loading the standings\u2026</div>
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
                    <th key={col.quizId} className="chg-sub" style={{ '--ac': g.color }}>{col.icon} {col.label}</th>
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
                        if (sc === undefined || sc === null) return <td key={col.quizId} className="chg-sc chg-empty">\u00b7</td>;
                        const tm = u.times ? u.times[col.quizId] : null;
                        const tot = colTotal[col.quizId] || 0;
                        return <td key={col.quizId} className={`chg-sc${sc === 0 ? ' chg-zero' : ''}`} title={`${sc}/${tot} correct${tm != null ? ` \u00b7 ${chMmss(tm)}` : ''} \u00b7 best attempt`}><span className="chg-v" style={{ '--ac': col.group.color }}>{pctOf(sc, tot)}%</span></td>;
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
        <p className="chg-foot">Cells show how much of each quiz a player has completed (correct \u00f7 quiz total) on their best attempt since the window opened; hover a cell for the raw count and time, a dot (\u00b7) means they haven{"'"}t taken that quiz yet. Ranking is by <b>total correct</b> across every quiz, ties broken by <b>least total time</b>. Only signed-up players appear. Hit Refresh for the latest.</p>
      </div>
    </div>
  );
}
// ─── Rating tab ─────────────────────────────────────────────────────────────
function RatingPanel({ me, titleById }) {
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
          <div className="formula">
            E = 1 / (1 + 10<sup>(Dq − R) / 400</sup>)<br />
            R′ = R + K · (S − E)
          </div>
          <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.8, marginTop: 10 }}>
            R = your rating · Dq = quiz difficulty · S = your result (score fraction, 0–1) · E = expected result · K = {comp.k} (volatility)
          </div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Your Components</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div className="hrow" style={{ borderTop: 'none' }}><span style={{ flex: 1 }}>Season Start Rating</span><span style={{ fontWeight: 700 }}>{comp.start.toLocaleString()}</span></div>
            <div className="hrow"><span style={{ flex: 1 }}>K-Factor (Volatility)</span><span style={{ fontWeight: 700 }}>{comp.k}</span></div>
            <div className="hrow"><span style={{ flex: 1 }}>Matches Played</span><span style={{ fontWeight: 700 }}>{comp.matches}</span></div>
            <div className="hrow"><span style={{ flex: 1 }}>Net Rating From Results</span><span className="score" style={{ color: comp.netDelta >= 0 ? C.accent : C.danger }}>{comp.netDelta >= 0 ? `+${comp.netDelta}` : comp.netDelta}</span></div>
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
              <th style={{ textAlign: 'right' }}>Your %</th>
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

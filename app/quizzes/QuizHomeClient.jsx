'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, ChevronDown, ArrowLeft } from 'lucide-react';
import { COLORS } from '@/lib/data';
import { QUIZZES } from '@/lib/quizzes';
import { fetchBootstrap } from '@/lib/api';
import { quizDept as deptOf, quizIcon as iconOf, DEPT_COLOR, DEPT_LABEL, DEPT_NAV } from '@/lib/quiz-departments';
import Grain from '../Grain';
import Footer from '../Footer';
import Count from '../Count';

function seededShuffle(arr, seed) {
  const out = arr.slice();
  let s = seed >>> 0 || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    const j = (s >>> 0) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const SORTS = [
  { id: 'discover', label: 'Discover', short: 'Discover' },
  { id: 'trending', label: 'Trending', short: 'Trending' },
  { id: 'popularity', label: 'Most Played', short: 'Most Played' },
  { id: 'recent', label: 'Most Recently Added', short: 'Recent' },
];

// Compact clock label for a quiz's total time budget (seconds -> '90 sec' / '2 min' / '3:15').
function fmtQuizTime(s) {
  if (!s || s <= 0) return '';
  if (s < 120) return `${s} sec`;
  if (s % 60 === 0) return `${s / 60} min`;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Strip the leading "Name (the) " verb from a quiz title for display.
function cleanTitle(t) {
  return (t || '').replace(/^Name (the )?/i, '').trim();
}

// Whole-word short form for the cramped Most-Played board: keep adding words
// until we'd exceed `max` characters, then stop — no ellipsis, no mid-word cut,
// and the board's CSS wraps anything still long instead of clipping it.
function shortTitle(t, max = 32) {
  const s = cleanTitle(t);
  if (s.length <= max) return s;
  const words = s.split(/\s+/);
  let out = '';
  for (const w of words) {
    const next = out ? `${out} ${w}` : w;
    if (next.length > max) break;
    out = next;
  }
  return out || words[0] || s;
}

function QuizTile({ quiz, plays }) {
  const [hover, setHover] = useState(false);
  const Icon = iconOf(quiz);
  const dept = deptOf(quiz);
  const accent = DEPT_COLOR[dept] || DEPT_COLOR.misc;
  const deptLabel = DEPT_LABEL[dept] || 'Quiz';
  const n = Array.isArray(quiz.answers) ? quiz.answers.length : Array.isArray(quiz.questions) ? quiz.questions.length : 10;
  const actionWord = ({ Name: 'name', Locate: 'locate', Click: 'click', Match: 'match', Find: 'find', Guess: 'guess', Identify: 'identify', Pinpoint: 'pinpoint' })[(quiz.title || '').trim().split(' ')[0]] || 'name';
  const base = quiz.format === 'timed-mcq' ? `${n} question${n === 1 ? '' : 's'}` : `${n} to ${actionWord}`;
  const clock = fmtQuizTime(quiz.timeLimit);
  const countLabel = clock ? `${base} in ${clock}` : base;
  const heading = quiz.title || '';
  return (
    <Link
      href={`/quiz/${quiz.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ cursor: 'pointer', textDecoration: 'none', display: 'flex', flexDirection: 'column', background: hover ? '#e4dbc8' : COLORS.paper, color: COLORS.ink, border: `1.5px solid ${COLORS.ink}`, overflow: 'hidden', transition: 'all 0.2s ease', transform: hover ? 'translate(-2px, -2px)' : 'none', boxShadow: hover ? `3px 3px 0 ${accent.c}` : 'none' }}
    >
      <div style={{ flex: '0 0 auto', height: 150, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, padding: '0 18px', background: accent.t, borderBottom: `1.5px solid ${COLORS.ink}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ flex: 'none', width: 46, height: 46, borderRadius: '50%', background: COLORS.cream, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={23} strokeWidth={2} aria-hidden="true" style={{ color: accent.c }} /></span>
          <span style={{ flex: 'none', fontFamily: 'DM Mono, monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.cream, background: accent.c, padding: '5px 10px' }}>{deptLabel}</span>
        </div>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, color: accent.c }}>{countLabel}</span>
      </div>
      <div style={{ padding: '16px 18px 18px', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 26, lineHeight: 1.05, letterSpacing: '-0.02em', margin: '0 0 12px', fontVariationSettings: '"SOFT" 100', color: COLORS.ink }}>{heading}</h3>
        {quiz.blurb && (<p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 14.5, lineHeight: 1.5, color: COLORS.faded, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{quiz.blurb}</p>)}
        <div style={{ marginTop: 'auto', paddingTop: 18, display: 'flex', alignItems: 'baseline', gap: 8, fontFamily: 'DM Mono, monospace', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: accent.c }}>
          <span>▶ Play</span>
          {plays > 0 && (<span style={{ color: COLORS.faded, fontWeight: 600, fontSize: 11, letterSpacing: '0.1em' }}>· <Count value={plays} /> plays</span>)}
        </div>
      </div>
    </Link>
  );
}

const MEDAL = ['#caa12e', '#9c968a', '#b1763f'];

// Shared card chrome for the two side-by-side boards below the ribbon: a
// paper panel with an ember drop-shadow that lifts on hover. Used as a Link
// (right/Top Players board) or as a clickable div (left/Most Played board,
// which contains its own per-quiz links and so can't be an anchor).
const boardCss = `
  .qz-boards{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;align-items:stretch;}
  @media(max-width:680px){.qz-boards{grid-template-columns:1fr;}}
  .qz-board{display:flex;flex-direction:column;text-decoration:none;background:${COLORS.paper};border:1.5px solid ${COLORS.ink};padding:10px 16px 12px;transition:all 0.2s ease;cursor:pointer;height:100%;box-sizing:border-box;}
  .qz-board:focus-visible{outline:2px solid ${COLORS.ember};outline-offset:2px;}
  .qz-board-eyebrow{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:3px;}
  .qz-board-kicker{font-family:'DM Mono',monospace;font-size:10.5px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${COLORS.ember};}
  .qz-board-cta{font-family:'DM Mono',monospace;font-size:9.5px;letter-spacing:0.14em;text-transform:uppercase;color:${COLORS.faded};white-space:nowrap;}
  .qz-board-rule1{border-bottom:1px solid ${COLORS.ink};}
  .qz-board-rule2{border-bottom:2px solid ${COLORS.ember};margin-bottom:8px;}
  .qz-board-rows{display:flex;flex-direction:column;flex:1 1 auto;}
  .qz-brow{display:flex;align-items:center;gap:10px;padding:7px 0;border-top:1px solid rgba(26,22,17,0.1);text-decoration:none;}
  .qz-brow:first-child{border-top:none;}
  .qz-brank{flex:none;width:20px;height:20px;border-radius:50%;border:1.25px solid ${COLORS.ink};display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:11px;font-weight:500;color:${COLORS.ink};}
  .qz-bname{flex:1 1 auto;min-width:0;font-family:'DM Mono',monospace;font-size:12px;font-weight:500;color:${COLORS.ink};line-height:1.25;white-space:normal;overflow-wrap:anywhere;}
  .qz-bval{flex:none;font-family:'Fraunces',serif;font-weight:700;font-size:15px;color:${COLORS.ink};white-space:nowrap;}
  .qz-bval small{font-family:'DM Mono',monospace;font-weight:500;font-size:9.5px;letter-spacing:0.1em;text-transform:uppercase;color:${COLORS.faded};margin-left:4px;}
  .qz-board a.qz-brow:hover .qz-bname{color:${COLORS.ember};}
  .qz-board-empty{font-family:'Fraunces',serif;font-style:italic;font-size:13px;color:${COLORS.faded};padding:12px 0;}
`;

// Left board: the three most-played quizzes. Each row links to its quiz; the
// surrounding card is itself clickable (and keyboard-focusable) to the full
// quiz-statistics page. A div, not an anchor, so the per-quiz links nest legally.
function MostPlayedBoard({ rows }) {
  const router = useRouter();
  const [hover, setHover] = useState(false);
  const go = () => router.push('/quizzes/stats');
  return (
    <div
      role="link"
      tabIndex={0}
      aria-label="View all quiz statistics"
      onClick={go}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="qz-board"
      style={{ boxShadow: hover ? `5px 5px 0 ${COLORS.ember}` : `3px 3px 0 ${COLORS.ember}`, transform: hover ? 'translate(-2px, -2px)' : 'none' }}
    >
      <div className="qz-board-eyebrow">
        <span className="qz-board-kicker">Most Played</span>
        <span className="qz-board-cta">All Quiz Stats {'›'}</span>
      </div>
      <div className="qz-board-rule1" />
      <div className="qz-board-rule2" />
      <div className="qz-board-rows">
        {rows.length > 0 ? rows.map((r, i) => (
          <Link key={r.id} href={`/quiz/${r.id}`} className="qz-brow" onClick={(e) => e.stopPropagation()} title={r.title}>
            <span className="qz-brank" style={{ background: i < 3 ? MEDAL[i] : 'transparent' }}>{i + 1}</span>
            <span className="qz-bname">{shortTitle(r.title)}</span>
            <span className="qz-bval"><Count value={r.plays} /><small>plays</small></span>
          </Link>
        )) : (<div className="qz-board-empty">No plays recorded yet.</div>)}
      </div>
    </div>
  );
}

// Right board: the top Accuracy-Weighted players. The whole card is one big
// link to the full leaderboard, so no nested links here.
function TopPlayersBoard({ players }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href="/leaderboard"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="qz-board"
      style={{ boxShadow: hover ? `5px 5px 0 ${COLORS.ember}` : `3px 3px 0 ${COLORS.ember}`, transform: hover ? 'translate(-2px, -2px)' : 'none', color: COLORS.ink }}
    >
      <div className="qz-board-eyebrow">
        <span className="qz-board-kicker">Top Players</span>
        <span className="qz-board-cta">View Leaderboard {'›'}</span>
      </div>
      <div className="qz-board-rule1" />
      <div className="qz-board-rule2" />
      <div className="qz-board-rows">
        {players.length > 0 ? players.map((p, i) => (
          <div key={i} className="qz-brow">
            <span className="qz-brank" style={{ background: i < 3 ? MEDAL[i] : 'transparent' }}>{i + 1}</span>
            <span className="qz-bname">{p.name}</span>
            <span className="qz-bval">{p.val}</span>
          </div>
        )) : (<div className="qz-board-empty">No ranked players yet.</div>)}
      </div>
    </Link>
  );
}

// Full-width, vertically-narrow banner spotlighting the latest Daily Market Moving News Quiz
// at the top of the page. Finds the most recent daily-market-news-quiz-* entry so it
// always points at today's edition without a hardcoded id.
function DailyNewsBanner({ totals }) {
  const [hover, setHover] = useState(null); // 'trend' | 'news' | null
  // Right button: the latest Daily Market Moving News Quiz edition.
  const newsQuiz = useMemo(() => {
    const cands = QUIZZES.filter((q) => /^(daily-market-news-quiz-|daily-business-quiz-)/.test(q.id || ''));
    cands.sort((a, b) => new Date(b.publishedAt || `${b.publishedDate || '1970-01-01'}T12:00:00Z`).getTime() - new Date(a.publishedAt || `${a.publishedDate || '1970-01-01'}T12:00:00Z`).getTime());
    return cands[0] || null;
  }, []);
  // Left button: the quiz with the most plays over the last 12 hours. News
  // quizzes are excluded (they have their own button), and we fall back to the
  // 7-day then all-time leader when no game has been played in the last 12h.
  const trendingQuiz = useMemo(() => {
    const isNews = (id) => /^(daily-market-news-quiz-|daily-business-quiz-|daily-news-quiz-|weekly-business-quiz-|weekly-news-quiz-|earnings-reporter-quiz-|earnings-quiz-)/.test(id || '');
    const pick = (counts) => {
      let best = null;
      let bestN = 0;
      for (const q of QUIZZES) {
        if (!q.id || isNews(q.id)) continue;
        const n = (counts || {})[q.id] || 0;
        if (n > bestN) { bestN = n; best = q; }
      }
      return bestN > 0 ? best : null;
    };
    return pick(totals.recent12h) || pick(totals.recent7) || pick(totals.byQuiz) || null;
  }, [totals]);

  if (!newsQuiz && !trendingQuiz) return null;
  const liftStyle = (active) => ({ boxShadow: active ? `5px 5px 0 ${COLORS.ink}` : `3px 3px 0 ${COLORS.ink}`, transform: active ? 'translate(-2px, -2px)' : 'none' });
  return (
    <div className="dn-wrap">
      <style>{`
        .dn-wrap{display:flex;gap:12px;margin-bottom:16px;}
        .dn-btn{flex:1 1 0;min-width:0;display:flex;align-items:center;justify-content:center;gap:10px;text-decoration:none;background:${COLORS.ember};color:${COLORS.cream};border:1.5px solid ${COLORS.ink};padding:13px 18px;transition:all 0.2s ease;}
        .dn-label{font-family:'DM Mono',monospace;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.cream};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        @media(max-width:640px){.dn-wrap{flex-direction:column;gap:9px;}.dn-label{white-space:normal;text-align:center;}}
      `}</style>
      {trendingQuiz && (
        <Link href={`/quiz/${trendingQuiz.id}`} className="dn-btn" onMouseEnter={() => setHover('trend')} onMouseLeave={() => setHover(null)} style={liftStyle(hover === 'trend')}>
          <span className="dn-label">{'▶'} Top Trending Quiz</span>
        </Link>
      )}
      {newsQuiz && (
        <Link href={`/quiz/${newsQuiz.id}`} className="dn-btn" onMouseEnter={() => setHover('news')} onMouseLeave={() => setHover(null)} style={liftStyle(hover === 'news')}>
          <span className="dn-label">{'▶'} Daily Market Moving News Quiz</span>
        </Link>
      )}
    </div>
  );
}

export default function QuizHomeClient() {
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('all');
  const [sortBy, setSortBy] = useState('discover');
  const [sortOpen, setSortOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [totals, setTotals] = useState({ total: 0, byQuiz: {}, recent7: {}, recent12h: {} });
  const [recent, setRecent] = useState([]);
  const [visitors, setVisitors] = useState(0);
  const [champions, setChampions] = useState({ completed: [], weighted: [], accuracy: [], anonymous: 0 });
  const seedRef = useRef((Date.now() & 0xffffffff) >>> 0);
  // Close the category / sort dropdowns on an outside click or Escape.
  const ribbonRef = useRef(null);
  useEffect(() => {
    const onDown = (e) => { if (ribbonRef.current && !ribbonRef.current.contains(e.target)) { setCatOpen(false); setSortOpen(false); } };
    const onKey = (e) => { if (e.key === 'Escape') { setCatOpen(false); setSortOpen(false); } };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, []);

  useEffect(() => {
    fetch('/api/quiz/totals').then((r) => r.json()).then((d) => { if (d && !d.error) setTotals({ total: d.total || 0, byQuiz: d.byQuiz || {}, recent7: d.recent7 || {}, recent12h: d.recent12h || {} }); }).catch(() => {});
    fetch('/api/quiz/recent').then((r) => r.json()).then((d) => { if (d && Array.isArray(d.plays)) setRecent(d.plays); }).catch(() => {});
    // Visitors on this page reflect quiz traffic only (the quiz home page +
    // individual quiz pages), not the whole site. Quiz-page views are merged
    // into bootstrap views under `quiz::<id>` keys; sum only those.
    fetchBootstrap().then((data) => { if (data && data.views) setVisitors(Object.entries(data.views).reduce((sum, [k, v]) => (k.startsWith('quiz::') ? sum + (Number(v) || 0) : sum), 0)); }).catch(() => {});
    fetch('/api/quiz/champions').then((r) => r.json()).then((d) => { if (d && !d.error) setChampions({ completed: d.completed || [], weighted: d.weighted || [], accuracy: d.accuracy || [], anonymous: d.anonymous || 0 }); }).catch(() => {});
  }, []);

  // Count quiz-home-page landings toward this page's visitor total, so it
  // reflects the quiz home page plus individual quiz pages. Logged under the
  // pseudo quiz id 'home' in quiz_views (bootstrap merges it as `quiz::home`),
  // deduped to once per browser session. Mirrors the site homepage's landing
  // tracking.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem('sot-quizhome-viewed') === '1';
      if (!seen) sessionStorage.setItem('sot-quizhome-viewed', '1');
    } catch (e) { /* sessionStorage unavailable: count this load */ }
    if (!seen) {
      fetch('/api/quiz/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: 'home' }),
      }).catch(() => {});
    }
  }, []);

  const titleById = useMemo(() => Object.fromEntries(QUIZZES.map((q) => [q.id, q.title])), []);
  const recentEntries = useMemo(() => recent.map((p) => {
    const t = (titleById[p.quizId] || '').replace(/^Name (the )?/, '');
    if (!t) return null;
    const who = p.username ? p.username : 'Anonymous User';
    return { quizId: p.quizId, text: `${who} scored ${p.score}/${p.total}: ${t}` };
  }).filter(Boolean), [recent, titleById]);

  const counts = useMemo(() => {
    const c = { all: QUIZZES.length };
    for (const q of QUIZZES) { const d = deptOf(q); c[d] = (c[d] || 0) + 1; }
    return c;
  }, []);

  // Category dropdown options: "All" first, then every department ordered by
  // how many quizzes it holds (most first), so the menu mirrors the old ribbon.
  const deptOptions = useMemo(() => {
    const ordered = DEPT_NAV.slice().sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0) || a.label.localeCompare(b.label));
    return [{ id: 'all', label: 'All' }, ...ordered];
  }, [counts]);
  const currentDeptLabel = dept === 'all' ? 'All' : (DEPT_LABEL[dept] || 'Category');

  // Left board data: the three quizzes with the most all-time plays.
  const topPlayed = useMemo(() => {
    return QUIZZES
      .map((q) => ({ id: q.id, title: cleanTitle(q.title), plays: totals.byQuiz[q.id] || 0 }))
      .filter((q) => q.plays > 0)
      .sort((a, b) => b.plays - a.plays || a.title.localeCompare(b.title))
      .slice(0, 3);
  }, [totals]);

  // Right board data: top Accuracy-Weighted players (whole-number weighted score).
  const topPlayers = useMemo(() => (champions.weighted || [])
    .map((u) => ({ name: u.username, val: Math.round(u.weighted || 0).toLocaleString() }))
    .slice(0, 3), [champions]);

  const sorted = useMemo(() => {
    const ql = query.trim().toLowerCase();
    // Match every word in the query, in any order (so "africa map" and
    // "map africa" both find the Africa map quiz), mirroring the homepage search.
    const tokens = ql.split(/\s+/).filter(Boolean);
    let list = QUIZZES.filter((q) => {
      if (dept !== 'all' && deptOf(q) !== dept) return false;
      if (!tokens.length) return true;
      const hay = `${q.title || ''} ${q.category || ''} ${q.blurb || ''}`.toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
    const plays = (id) => totals.byQuiz[id] || 0;
    const recent = (id) => totals.recent7[id] || 0;
    if (sortBy === 'discover') {
      // Default landing: the first two rows (8 tiles at the 4-column desktop
      // grid) are a random assortment of quizzes that have caught on (more than
      // 2 plays); after those, true discover takes over with a random shuffle of
      // everything else. Both halves are seeded so the order is stable per load.
      const shuffled = seededShuffle(list, seedRef.current);
      const FEATURED_SLOTS = 8;
      const featured = shuffled.filter((q) => plays(q.id) > 2).slice(0, FEATURED_SLOTS);
      if (featured.length) {
        const featuredIds = new Set(featured.map((q) => q.id));
        list = [...featured, ...shuffled.filter((q) => !featuredIds.has(q.id))];
      } else {
        list = shuffled;
      }
    } else if (sortBy === 'popularity') list = list.slice().sort((a, b) => plays(b.id) - plays(a.id) || a.title.localeCompare(b.title));
    else if (sortBy === 'trending') list = list.slice().sort((a, b) => recent(b.id) - recent(a.id) || plays(b.id) - plays(a.id) || a.title.localeCompare(b.title));
    else if (sortBy === 'recent') {
      const ts = (q) => new Date(q.publishedAt || `${q.publishedDate || '1970-01-01'}T12:00:00Z`).getTime();
      list = list.slice().sort((a, b) => ts(b) - ts(a) || a.title.localeCompare(b.title));
    }
    // Daily/weekly news quizzes always sink to the very bottom of every view (the
    // full grid and any department they file under); they are surfaced via the red
    // Daily News banner and direct URL, not promoted among the tiles.
    const isNewsQuiz = (q) => /^(daily-market-news-quiz-|daily-business-quiz-|daily-news-quiz-|weekly-business-quiz-|weekly-news-quiz-|earnings-reporter-quiz-|earnings-quiz-)/.test(q.id || '');
    list = [...list.filter((q) => !isNewsQuiz(q)), ...list.filter((q) => isNewsQuiz(q))];
    return list;
  }, [query, dept, sortBy, totals]);

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, color: COLORS.ink, position: 'relative', overflow: 'clip' }}>
      <Grain />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <header style={{ padding: '32px 24px 18px', maxWidth: 1200, margin: '0 auto' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, color: COLORS.ink, textDecoration: 'none', marginBottom: 18, padding: '8px 0' }}>
            <ArrowLeft size={14} strokeWidth={2.5} /> Top 10 Lists
          </Link>
          <div className="cg-head">
            <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 'clamp(40px, 9vw, 84px)', lineHeight: 0.9, letterSpacing: '-0.015em', margin: 0, fontVariationSettings: '"SOFT" 100', color: COLORS.ink, whiteSpace: 'nowrap' }}>
              Source<br /><span style={{ fontStyle: 'italic', fontWeight: 400, color: COLORS.ember }}>of</span> Truths
            </h1>
            <div className="cg-head-col">
              <div className="cg-tagline">The Quizzes</div>
              <div className="cg-blurb">Timed quizzes across film, music, sports, and beyond. Test what you actually know.</div>
              <div style={{ borderBottom: `1px solid ${COLORS.ink}`, marginBottom: 4 }} />
              <div style={{ borderBottom: `2px solid ${COLORS.ember}` }} />
            </div>
          </div>
          <style>{`
            .cg-head{display:flex;align-items:flex-end;gap:clamp(16px,4vw,28px);}
            .cg-head-col{flex:1;min-width:0;margin-bottom:clamp(8px,1.4vw,14px);}
            .cg-tagline{font-family:'DM Mono',monospace;font-size:clamp(9px,1.1vw,11px);letter-spacing:0.2em;text-transform:uppercase;font-weight:700;color:${COLORS.ink};text-align:right;margin-bottom:8px;line-height:1.4;}
            .cg-blurb{font-family:'DM Sans',sans-serif;font-size:clamp(11px,1.25vw,13px);line-height:1.5;color:${COLORS.ink};text-align:right;max-width:520px;margin-left:auto;margin-bottom:10px;}
            @media(max-width:640px){.cg-head{flex-direction:column;align-items:stretch;gap:14px;}.cg-head-col{margin-bottom:0;}.cg-tagline{text-align:left;}.cg-blurb{text-align:left;max-width:none;margin-left:0;font-size:14px;}}
            .qz-stats{margin-top:16px;display:flex;align-items:baseline;flex-wrap:nowrap;white-space:nowrap;gap:16px;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:${COLORS.faded};}
            .qz-tape{flex:1 1 auto;min-width:0;overflow:hidden;margin-left:8px;}
            .qz-tape-track{display:inline-block;white-space:nowrap;animation-name:qz-tape-scroll;animation-timing-function:linear;animation-iteration-count:infinite;will-change:transform;}
            .qz-tape-track:hover{animation-play-state:paused;}
            @keyframes qz-tape-scroll{from{transform:translateX(0);}to{transform:translateX(-50%);}}
            @media(max-width:760px){.qz-tape{display:none;}}
            .qz-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;}
            @media(max-width:1000px){.qz-grid{grid-template-columns:repeat(3,minmax(0,1fr));}}
            @media(max-width:760px){.qz-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}
            @media(max-width:480px){.qz-grid{grid-template-columns:1fr;}}
            ${boardCss}
            .qz-ribbon{display:flex;align-items:stretch;flex-wrap:wrap;background:${COLORS.ink};border-bottom:3px solid ${COLORS.ember};}
            .qz-rb-item{position:relative;display:flex;}
            .qz-rb-btn{display:flex;align-items:center;gap:8px;height:46px;background:transparent;color:${COLORS.cream};border:none;border-right:1px solid rgba(244,237,224,0.18);padding:0 18px;font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;cursor:pointer;white-space:nowrap;}
            .qz-rb-btn .qz-rb-chev{transition:transform 0.15s;}
            .qz-rb-search{flex:1 1 220px;min-width:160px;display:flex;align-items:center;position:relative;border-right:1px solid rgba(244,237,224,0.18);}
            .qz-rb-search input{width:100%;height:46px;box-sizing:border-box;padding:0 34px 0 40px;background:transparent;border:none;outline:none;font-family:'DM Sans',sans-serif;font-size:14px;color:${COLORS.cream};}
            .qz-rb-search input::placeholder{color:rgba(244,237,224,0.55);}
            .qz-rb-req{display:flex;align-items:center;justify-content:center;gap:6px;height:46px;background:${COLORS.ember};color:${COLORS.cream};padding:0 20px;font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;text-decoration:none;white-space:nowrap;}
            .qz-pop{position:absolute;top:calc(100% + 6px);left:0;z-index:40;background:${COLORS.cream};border:1.5px solid ${COLORS.ink};box-shadow:0 10px 24px rgba(26,22,17,0.25);}
            .qz-pop-sort{min-width:210px;}
            .qz-pop-cat{width:max(260px,100%);display:flex;flex-wrap:wrap;gap:8px;padding:14px 16px 16px;}
            .qz-pop-item{width:100%;display:flex;align-items:center;border:none;padding:10px 14px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;font-weight:600;cursor:pointer;text-align:left;background:transparent;color:${COLORS.ink};}
            .qz-chip{display:inline-flex;align-items:center;gap:7px;border:1.5px solid ${COLORS.ink};padding:8px 14px;font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;cursor:pointer;}
            @media(max-width:640px){
              .qz-rb-item{flex:1 1 50%;}
              .qz-rb-btn{flex:1 1 auto;justify-content:center;}
              .qz-rb-search{flex:1 1 100%;order:5;border-right:none;border-top:1px solid rgba(244,237,224,0.18);}
              .qz-rb-req{flex:1 1 100%;order:4;border-top:1px solid rgba(244,237,224,0.18);}
              .qz-rb-search input{font-size:16px;}
            }
          `}</style>
          <div className="qz-stats">
            <span>{QUIZZES.length} quizzes</span>
            <span><span style={{ opacity: 0.5 }}>·</span> <Count value={totals.total} /> plays</span>
            <span><span style={{ opacity: 0.5 }}>·</span> <Count value={visitors} /> visitors</span>
            {recentEntries.length > 0 && (
              <span className="qz-tape">
                <span className="qz-tape-track" style={{ animationDuration: `${Math.max(40, recentEntries.length * 9)}s` }}>
                  {[0, 1].map((dup) => (
                    <span key={dup} aria-hidden={dup === 1 ? 'true' : undefined}>
                      {recentEntries.map((e, i) => (
                        <Link key={`${dup}-${i}`} href={`/quiz/${e.quizId}`} style={{ color: COLORS.ember, textDecoration: 'none' }}>
                          {e.text}<span aria-hidden="true" style={{ color: COLORS.faded, padding: '0 14px' }}>{'◆'}</span>
                        </Link>
                      ))}
                    </span>
                  ))}
                </span>
              </span>
            )}
          </div>
        </header>

        <nav style={{ position: 'sticky', top: 0, zIndex: 25, background: COLORS.cream }}>
          <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.12, mixBlendMode: 'multiply' }}>
            <filter id="qz-nav-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" /><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0" /></filter>
            <rect width="100%" height="100%" filter="url(#qz-nav-grain)" />
          </svg>
          <div ref={ribbonRef} style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', position: 'relative' }}>
            <div className="qz-ribbon">
              <div className="qz-rb-item">
                <button type="button" className="qz-rb-btn" aria-haspopup="true" aria-expanded={catOpen} onClick={() => { setCatOpen((o) => !o); setSortOpen(false); }}>
                  <span><span style={{ opacity: 0.7 }}>Category:</span> {currentDeptLabel}</span>
                  <ChevronDown className="qz-rb-chev" size={14} strokeWidth={2.5} style={{ transform: catOpen ? 'rotate(180deg)' : 'none' }} />
                </button>
                {catOpen && (
                  <div className="qz-pop qz-pop-cat" role="menu">
                    {deptOptions.map((o) => {
                      const active = dept === o.id;
                      return (
                        <button key={o.id} role="menuitem" className="qz-chip" onClick={() => { setDept(o.id); setCatOpen(false); }} style={{ background: active ? COLORS.ember : COLORS.paper, color: active ? COLORS.cream : COLORS.ink }}>
                          {o.label}<span style={{ opacity: 0.55, marginLeft: 2 }}>{counts[o.id] || 0}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="qz-rb-item">
                <button type="button" className="qz-rb-btn" aria-haspopup="true" aria-expanded={sortOpen} onClick={() => { setSortOpen((o) => !o); setCatOpen(false); }}>
                  <span><span style={{ opacity: 0.7 }}>Sort:</span> {(SORTS.find((o) => o.id === sortBy) || {}).short || 'Discover'}</span>
                  <ChevronDown className="qz-rb-chev" size={14} strokeWidth={2.5} style={{ transform: sortOpen ? 'rotate(180deg)' : 'none' }} />
                </button>
                {sortOpen && (
                  <div className="qz-pop qz-pop-sort" role="menu">
                    {SORTS.map((opt, i) => {
                      const active = sortBy === opt.id;
                      return (<button key={opt.id} role="menuitem" className="qz-pop-item" onClick={() => { setSortBy(opt.id); setSortOpen(false); }} style={{ background: active ? COLORS.ink : 'transparent', color: active ? COLORS.cream : COLORS.ink, borderTop: i === 0 ? 'none' : `0.5px solid ${COLORS.paper}` }}>{opt.label}</button>);
                    })}
                  </div>
                )}
              </div>
              <div className="qz-rb-search">
                <Search size={16} strokeWidth={2.5} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(244,237,224,0.6)' }} />
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search quizzes" />
                {query && (<button onClick={() => setQuery('')} aria-label="Clear search" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'rgba(244,237,224,0.7)', cursor: 'pointer', padding: 6, display: 'flex' }}><X size={16} strokeWidth={2.5} /></button>)}
              </div>
              <Link href="/request" className="qz-rb-req">Request a Quiz</Link>
            </div>
          </div>
        </nav>

        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px 64px' }}>
          <div className="qz-boards">
            <MostPlayedBoard rows={topPlayed} />
            <TopPlayersBoard players={topPlayers} />
          </div>

          <DailyNewsBanner totals={totals} />

          {sorted.length > 0 ? (
            <div className="qz-grid">
              {sorted.map((q) => (<QuizTile key={q.id} quiz={q} plays={totals.byQuiz[q.id] || 0} />))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 24px', fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 18, color: COLORS.faded }}>No quizzes match that filter.</div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}

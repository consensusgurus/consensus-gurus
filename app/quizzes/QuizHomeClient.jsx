'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, ChevronDown, ArrowLeft, Trophy } from 'lucide-react';
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

// Quiz "type" classification for the Type filter. Primary type is one of
// name / match / locate; picture is an overlay flag (image-based quizzes,
// which also belong to name or match). Selecting Picture shows every image
// quiz; selecting Name/Match shows that primary type incl. its picture ones.
const MATCH_FORMATS = new Set(['matched', 'bank', 'pairs', 'type-it']);
const IMG_FORMATS = new Set(['photo', 'posters', 'logos', 'images']);
function quizPrimaryType(q) {
  if (q.format === 'map') return 'locate';
  if (MATCH_FORMATS.has(q.format) || /^match\b/i.test(q.title || '')) return 'match';
  return 'name';
}
function quizIsPicture(q) {
  if (IMG_FORMATS.has(q.format)) return true;
  if (Array.isArray(q.answers) && q.answers.some((a) => a && a.img)) return true;
  if (Array.isArray(q.pairs) && q.pairs.some((pr) => pr && (pr.img || (pr.left && pr.left.img) || (pr.right && pr.right.img)))) return true;
  return false;
}
function quizMatchesType(q, t) {
  if (t === 'all') return true;
  if (t === 'picture') return quizIsPicture(q);
  return quizPrimaryType(q) === t;
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
  .qz-boards{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;align-items:start;}
  @media(max-width:680px){.qz-boards{grid-template-columns:1fr;}}
  .lb-card{display:flex;flex-direction:column;background:${COLORS.paper};border:1.5px solid ${COLORS.ink};box-shadow:3px 3px 0 ${COLORS.ember};padding:10px 16px 10px;margin-bottom:16px;box-sizing:border-box;}
  .lb-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:3px;}
  .lb-kicker{font-family:'DM Mono',monospace;font-size:10.5px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${COLORS.ember};}
  .lb-cta{font-family:'DM Mono',monospace;font-size:9.5px;letter-spacing:0.14em;text-transform:uppercase;color:${COLORS.faded};white-space:nowrap;text-decoration:none;}
  .lb-cta:hover{color:${COLORS.ember};}
  .lb-rule1{border-bottom:1px solid ${COLORS.ink};}
  .lb-rule2{border-bottom:2px solid ${COLORS.ember};margin-bottom:4px;}
  .lb-cats{display:flex;flex-direction:column;}
  .lb-cat{border-top:1px solid rgba(26,22,17,0.1);}
  .lb-cat:first-child{border-top:none;}
  .lb-cat-head{display:flex;align-items:center;gap:8px;width:100%;background:transparent;border:none;cursor:pointer;padding:10px 0;font-family:'DM Mono',monospace;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${COLORS.ink};text-align:left;}
  .lb-cat-label{flex:1 1 auto;min-width:0;}
  .lb-cat-chev{flex:none;transition:transform 0.18s;color:${COLORS.faded};}
  .lb-cat.open .lb-cat-head{color:${COLORS.ember};}
  .lb-cat.open .lb-cat-chev{transform:rotate(180deg);color:${COLORS.ember};}
  .lb-list{display:flex;flex-direction:column;padding:0 0 8px;}
  .lb-list-2col{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(3,auto);grid-auto-flow:column;column-gap:20px;padding:0 0 8px;}
  .lb-row{display:flex;align-items:center;gap:10px;padding:5px 0;text-decoration:none;}
  .lb-rank{flex:none;width:19px;height:19px;border-radius:50%;border:1.25px solid ${COLORS.ink};display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:10.5px;font-weight:500;color:${COLORS.ink};}
  .lb-name{flex:1 1 auto;min-width:0;font-family:'DM Mono',monospace;font-size:12px;font-weight:500;color:${COLORS.ink};line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  a.lb-row:hover .lb-name{color:${COLORS.ember};}
  .lb-val{flex:none;font-family:'Fraunces',serif;font-weight:700;font-size:14px;color:${COLORS.ink};white-space:nowrap;}
  .lb-empty{font-family:'Fraunces',serif;font-style:italic;font-size:12.5px;color:${COLORS.faded};padding:2px 0 8px;}
  .qz-wide-cols{display:grid;grid-template-columns:repeat(3,1fr);}
  .qz-wide-col{min-width:0;padding:0 18px;}
  .qz-wide-col:first-child{padding-left:0;}
  .qz-wide-col:last-child{padding-right:0;}
  .qz-wide-col:not(:first-child){border-left:1px solid rgba(26,22,17,0.12);}
  .qz-wide-label{font-family:'DM Mono',monospace;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${COLORS.ink};padding:8px 0 8px;border-bottom:1px solid rgba(26,22,17,0.12);margin-bottom:4px;}
  .qz-wide-list{display:flex;flex-direction:column;}
  @media(max-width:680px){.lb-row-extra{display:none;}.lb-list-2col{display:flex;flex-direction:column;}.lb-name{white-space:normal;overflow:visible;text-overflow:clip;overflow-wrap:anywhere;}
    .qz-wide-cols{grid-template-columns:1fr;}.qz-wide-col{padding:0;border-left:none;}.qz-wide-col:not(:first-child){border-top:1px solid rgba(26,22,17,0.12);margin-top:8px;padding-top:2px;}}
`;

// One wide box holding the quiz boards (Most Played / Trending Now / Newest) as
// three distinct lists side by side. A kicker + CTA sit on top; each list shows
// its top three rows, every row a link to its quiz. On mobile the three lists
// stack into a single column with a divider between each.
function QuizBoardWide({ kicker, cta, ctaHref, categories }) {
  return (
    <div className="lb-card">
      <div className="lb-head">
        <span className="lb-kicker">{kicker}</span>
        <Link href={ctaHref} className="lb-cta">{cta} {'\u203A'}</Link>
      </div>
      <div className="lb-rule1" />
      <div className="lb-rule2" />
      <div className="qz-wide-cols">
        {categories.map((c) => (
          <div className="qz-wide-col" key={c.id}>
            <div className="qz-wide-label">{c.label}</div>
            <div className="qz-wide-list">
              {c.rows.length > 0 ? c.rows.map((r, i) => {
                const inner = (
                  <>
                    <span className="lb-rank" style={r.noRank ? { background: 'transparent', border: 'none' } : { background: i < 3 ? MEDAL[i] : 'transparent' }}>{r.noRank ? '' : i + 1}</span>
                    <span className="lb-name">{r.full}</span>
                    <span className="lb-val">{r.val}</span>
                  </>
                );
                return r.href
                  ? (<Link key={r.key} href={r.href} className="lb-row" title={r.full}>{inner}</Link>)
                  : (<div key={r.key} className="lb-row">{inner}</div>);
              }) : (<div className="lb-empty">{c.empty || 'No data yet.'}</div>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Full-width row of three buttons: a rotating Featured Quiz, the latest Daily
// Market Moving News Quiz, and the all-time player Leaderboard. The news button
// finds the most recent daily-market-news-quiz-* entry so it always points at
// today's edition without a hardcoded id. The Leaderboard button always shows.
function DailyNewsBanner({ totals }) {
  const [hover, setHover] = useState(null); // 'trend' | 'news' | 'lb' | null
  // Right button: the latest Daily Market Moving News Quiz edition.
  const newsQuiz = useMemo(() => {
    const cands = QUIZZES.filter((q) => /^(daily-market-news-quiz-|daily-business-quiz-)/.test(q.id || ''));
    cands.sort((a, b) => new Date(b.publishedAt || `${b.publishedDate || '1970-01-01'}T12:00:00Z`).getTime() - new Date(a.publishedAt || `${a.publishedDate || '1970-01-01'}T12:00:00Z`).getTime());
    return cands[0] || null;
  }, []);
  // Left button: a Featured Quiz that rotates among all quizzes with at least
  // three recorded plays (news quizzes excluded — they get their own button).
  // A fresh one is picked each time the data loads, so it changes per visit.
  const trendingQuiz = useMemo(() => {
    const isNews = (id) => /^(daily-market-news-quiz-|daily-business-quiz-|daily-news-quiz-|weekly-business-quiz-|weekly-news-quiz-|earnings-reporter-quiz-|earnings-quiz-)/.test(id || '');
    const cands = QUIZZES.filter((q) => q.id && !isNews(q.id) && (totals.byQuiz[q.id] || 0) >= 3);
    if (!cands.length) return null;
    return cands[Math.floor(Math.random() * cands.length)];
  }, [totals]);

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
          <span className="dn-label">{'▶'} Featured Quiz</span>
        </Link>
      )}
      {newsQuiz && (
        <Link href={`/quiz/${newsQuiz.id}`} className="dn-btn" onMouseEnter={() => setHover('news')} onMouseLeave={() => setHover(null)} style={liftStyle(hover === 'news')}>
          <span className="dn-label">{'▶'} Daily Market Moving News Quiz</span>
        </Link>
      )}
      <Link href="/leaderboard" className="dn-btn" onMouseEnter={() => setHover('lb')} onMouseLeave={() => setHover(null)} style={liftStyle(hover === 'lb')}>
        <Trophy size={15} strokeWidth={2.5} aria-hidden="true" style={{ flex: 'none' }} />
        <span className="dn-label">Leaderboard</span>
      </Link>
    </div>
  );
}

export default function QuizHomeClient() {
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('all');
  const [sortBy, setSortBy] = useState('discover');
  const [sortOpen, setSortOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [totals, setTotals] = useState({ total: 0, byQuiz: {}, recent7: {}, recent12h: {}, trendingByQuiz: {}, trendingWindowH: 0 });
  const [recent, setRecent] = useState([]);
  const [visitors, setVisitors] = useState(0);
  const [quizStats, setQuizStats] = useState([]);
  const seedRef = useRef((Date.now() & 0xffffffff) >>> 0);
  // Close the category / sort dropdowns on an outside click or Escape.
  const ribbonRef = useRef(null);
  const ribbonScrollRef = useRef(null);
  const [navScroll, setNavScroll] = useState({ left: false, right: false });
  // Anchor the open dropdown under its ribbon button (panels live outside the
  // horizontally-scrolling ribbon so they aren't clipped; mobile uses full width).
  const catBtnRef = useRef(null);
  const typeBtnRef = useRef(null);
  const sortBtnRef = useRef(null);
  const [panelLeft, setPanelLeft] = useState(16);
  useEffect(() => {
    const onDown = (e) => { if (ribbonRef.current && !ribbonRef.current.contains(e.target)) { setCatOpen(false); setSortOpen(false); setTypeOpen(false); } };
    const onKey = (e) => { if (e.key === 'Escape') { setCatOpen(false); setSortOpen(false); setTypeOpen(false); } };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, []);
  // Mobile ribbon is a horizontal scroller; track scroll position so the red
  // edge cues show when there's more to scroll left/right.
  useEffect(() => {
    const el = ribbonScrollRef.current;
    if (!el) return undefined;
    const update = () => {
      const more = el.scrollWidth - el.clientWidth;
      setNavScroll({ left: el.scrollLeft > 2, right: more > 2 && el.scrollLeft < more - 2 });
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);

  useEffect(() => {
    fetch('/api/quiz/totals').then((r) => r.json()).then((d) => { if (d && !d.error) setTotals({ total: d.total || 0, byQuiz: d.byQuiz || {}, recent7: d.recent7 || {}, recent12h: d.recent12h || {}, trendingByQuiz: d.trendingByQuiz || {}, trendingWindowH: d.trendingWindowH || 0 }); }).catch(() => {});
    fetch('/api/quiz/recent').then((r) => r.json()).then((d) => { if (d && Array.isArray(d.plays)) setRecent(d.plays); }).catch(() => {});
    // Visitors on this page reflect quiz traffic only (the quiz home page +
    // individual quiz pages), not the whole site. Quiz-page views are merged
    // into bootstrap views under `quiz::<id>` keys; sum only those.
    fetchBootstrap().then((data) => { if (data && data.views) setVisitors(Object.entries(data.views).reduce((sum, [k, v]) => (k.startsWith('quiz::') ? sum + (Number(v) || 0) : sum), 0)); }).catch(() => {});
    fetch('/api/quiz/stats').then((r) => r.json()).then((d) => { if (d && Array.isArray(d.quizzes)) setQuizStats(d.quizzes); }).catch(() => {});
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

  // Quiz-type filter options (with live counts). Picture overlaps name/match.
  const TYPE_LABELS = { all: 'All', name: 'Name', match: 'Match', locate: 'Locate', picture: 'Picture' };
  const typeOptions = useMemo(() => ['all', 'name', 'match', 'locate', 'picture'].map((id) => ({
    id,
    label: TYPE_LABELS[id],
    count: id === 'all' ? QUIZZES.length : QUIZZES.filter((q) => quizMatchesType(q, id)).length,
  })), []);
  const currentTypeLabel = TYPE_LABELS[typeFilter] || 'All';

  // Per-quiz aggregate stats (avg score etc.) for the Highest Scored ranking.
  const statById = useMemo(() => Object.fromEntries((quizStats || []).map((st) => [st.quizId, st])), [quizStats]);

  // Quiz-side leaderboard: Most Played / Trending Now / Highest Scored. Each
  // row links to its quiz and shows full title on desktop, short on mobile.
  const quizCats = useMemo(() => {
    const mk = (q, val) => ({ key: q.id, href: `/quiz/${q.id}`, full: cleanTitle(q.title), val });
    const plays = (id) => totals.byQuiz[id] || 0;
    // Trending here uses the dynamic, self-widening window from the totals API
    // (last 3h, widening by 3h until >= 3 quizzes have plays) so this board
    // reflects genuinely recent activity. The tiled grid's Trending sort below
    // is unaffected and still uses the 7-day `recent7` basis.
    const trend = (id) => (totals.trendingByQuiz || {})[id] || 0;
    const mostPlayed = QUIZZES.filter((q) => plays(q.id) > 0)
      .sort((a, b) => plays(b.id) - plays(a.id) || a.title.localeCompare(b.title))
      .slice(0, 3).map((q) => mk(q, <Count value={plays(q.id)} />));
    const trending = QUIZZES.filter((q) => trend(q.id) > 0)
      .sort((a, b) => trend(b.id) - trend(a.id) || plays(b.id) - plays(a.id) || a.title.localeCompare(b.title))
      .slice(0, 3).map((q) => mk(q, <Count value={trend(q.id)} />));
    const tsOf = (q) => new Date(q.publishedAt || `${q.publishedDate || '1970-01-01'}T12:00:00Z`).getTime();
    const isNewsQ = (q) => /^(daily-market-news-quiz-|daily-business-quiz-|daily-news-quiz-|weekly-business-quiz-|weekly-news-quiz-|earnings-reporter-quiz-|earnings-quiz-)/.test(q.id || '');
    const fmtDate = (q) => new Date(q.publishedAt || `${q.publishedDate || '1970-01-01'}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const newest = QUIZZES.filter((q) => !isNewsQ(q)).slice()
      .sort((a, b) => tsOf(b) - tsOf(a) || a.title.localeCompare(b.title))
      .slice(0, 3).map((q) => mk(q, fmtDate(q)));
    return [
      { id: 'played', label: 'Most Played', rows: mostPlayed, empty: 'No plays recorded yet.' },
      { id: 'trending', label: 'Trending Now', rows: trending, empty: 'No recent plays yet.' },
      { id: 'newest', label: 'Newest', rows: newest, empty: 'No quizzes yet.' },
    ];
  }, [totals, statById]);

  const sorted = useMemo(() => {
    const ql = query.trim().toLowerCase();
    // Match every word in the query, in any order (so "africa map" and
    // "map africa" both find the Africa map quiz), mirroring the homepage search.
    const tokens = ql.split(/\s+/).filter(Boolean);
    let list = QUIZZES.filter((q) => {
      if (dept !== 'all' && deptOf(q) !== dept) return false;
      if (typeFilter !== 'all' && !quizMatchesType(q, typeFilter)) return false;
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
  }, [query, dept, typeFilter, sortBy, totals]);

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
            .qz-ribbon{display:flex;align-items:stretch;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none;background:${COLORS.ink};border-bottom:3px solid ${COLORS.ember};}
            .qz-ribbon::-webkit-scrollbar{display:none;}
            .qz-rb-btn{flex:0 0 auto;display:flex;align-items:center;gap:8px;height:46px;background:transparent;color:${COLORS.cream};border:none;border-right:1px solid rgba(244,237,224,0.18);padding:0 18px;font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;cursor:pointer;white-space:nowrap;}
            .qz-rb-btn .qz-rb-chev{transition:transform 0.15s;}
            .qz-rb-search{flex:1 1 220px;min-width:170px;display:flex;align-items:center;position:relative;padding:6px 10px;}
            .qz-rb-search input{width:100%;height:34px;box-sizing:border-box;padding:0 32px 0 38px;background:#fff;border:1.5px solid ${COLORS.ink};outline:none;font-family:'DM Sans',sans-serif;font-size:14px;color:${COLORS.ink};}
            .qz-rb-search input::placeholder{color:${COLORS.faded};}
            .qz-rb-req{flex:0 0 auto;display:flex;align-items:center;justify-content:center;gap:6px;height:46px;background:${COLORS.ember};color:${COLORS.cream};padding:0 20px;font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;text-decoration:none;white-space:nowrap;}
            .qz-pop{position:absolute;top:100%;left:16px;z-index:40;background:${COLORS.cream};border:1.5px solid ${COLORS.ink};box-shadow:0 10px 24px rgba(26,22,17,0.25);}
            .qz-pop-sort{min-width:210px;}
            .qz-pop-cat{width:min(320px,calc(100vw - 40px));display:flex;flex-wrap:wrap;gap:8px;padding:14px 16px 16px;}
            .qz-pop-item{width:100%;display:flex;align-items:center;border:none;padding:10px 14px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;font-weight:600;cursor:pointer;text-align:left;background:transparent;color:${COLORS.ink};}
            .qz-chip{display:inline-flex;align-items:center;gap:7px;border:1.5px solid ${COLORS.ink};padding:8px 14px;font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;cursor:pointer;}
            @keyframes qzNavNudge{0%,100%{transform:translate(0,-50%);}50%{transform:translate(3px,-50%);}}
            @keyframes qzNavNudgeL{0%,100%{transform:translate(0,-50%);}50%{transform:translate(-3px,-50%);}}
            .qz-navcue{position:absolute;top:50%;z-index:30;display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:${COLORS.ember};color:${COLORS.cream};box-shadow:0 1px 4px rgba(26,22,17,0.45);pointer-events:none;font-size:15px;line-height:1;}
            .qz-navcue-r{right:6px;animation:qzNavNudge 1.4s ease-in-out infinite;}
            .qz-navcue-l{left:6px;animation:qzNavNudgeL 1.4s ease-in-out infinite;}
            @media(min-width:760px){.qz-navcue{display:none;}}
            @media(max-width:760px){
              .qz-rb-search{flex:0 0 auto;width:210px;}
              .qz-rb-search input{font-size:16px;}
              .qz-pop{left:8px !important;right:8px;}
              .qz-pop-cat{width:auto;}
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
            <div ref={ribbonScrollRef} className="qz-ribbon">
              <button ref={catBtnRef} type="button" className="qz-rb-btn" aria-haspopup="true" aria-expanded={catOpen} onClick={() => { const willOpen = !catOpen; if (willOpen && catBtnRef.current) setPanelLeft(catBtnRef.current.offsetLeft); setCatOpen(willOpen); setSortOpen(false); setTypeOpen(false); }}>
                <span><span style={{ opacity: 0.7 }}>Category:</span> {currentDeptLabel}</span>
                <ChevronDown className="qz-rb-chev" size={14} strokeWidth={2.5} style={{ transform: catOpen ? 'rotate(180deg)' : 'none' }} />
              </button>
              <button ref={typeBtnRef} type="button" className="qz-rb-btn" aria-haspopup="true" aria-expanded={typeOpen} onClick={() => { const willOpen = !typeOpen; if (willOpen && typeBtnRef.current) setPanelLeft(typeBtnRef.current.offsetLeft); setTypeOpen(willOpen); setCatOpen(false); setSortOpen(false); }}>
                <span><span style={{ opacity: 0.7 }}>Type:</span> {currentTypeLabel}</span>
                <ChevronDown className="qz-rb-chev" size={14} strokeWidth={2.5} style={{ transform: typeOpen ? 'rotate(180deg)' : 'none' }} />
              </button>
              <button ref={sortBtnRef} type="button" className="qz-rb-btn" aria-haspopup="true" aria-expanded={sortOpen} onClick={() => { const willOpen = !sortOpen; if (willOpen && sortBtnRef.current) setPanelLeft(sortBtnRef.current.offsetLeft); setSortOpen(willOpen); setCatOpen(false); setTypeOpen(false); }}>
                <span><span style={{ opacity: 0.7 }}>Sort:</span> {(SORTS.find((o) => o.id === sortBy) || {}).short || 'Discover'}</span>
                <ChevronDown className="qz-rb-chev" size={14} strokeWidth={2.5} style={{ transform: sortOpen ? 'rotate(180deg)' : 'none' }} />
              </button>
              <div className="qz-rb-search">
                <Search size={16} strokeWidth={2.5} style={{ position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)', color: COLORS.faded }} />
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search quizzes" />
                {query && (<button onClick={() => setQuery('')} aria-label="Clear search" style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: COLORS.faded, cursor: 'pointer', padding: 6, display: 'flex' }}><X size={16} strokeWidth={2.5} /></button>)}
              </div>
              <Link href="/request" className="qz-rb-req">Request a Quiz</Link>
            </div>
            {navScroll.left && <span aria-hidden="true" className="qz-navcue qz-navcue-l">&#8249;</span>}
            {navScroll.right && <span aria-hidden="true" className="qz-navcue qz-navcue-r">&#8250;</span>}
            {catOpen && (
              <div className="qz-pop qz-pop-cat" role="menu" style={{ left: panelLeft }}>
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
            {typeOpen && (
              <div className="qz-pop qz-pop-cat" role="menu" style={{ left: panelLeft }}>
                {typeOptions.map((o) => {
                  const active = typeFilter === o.id;
                  return (
                    <button key={o.id} role="menuitem" className="qz-chip" onClick={() => { setTypeFilter(o.id); setTypeOpen(false); }} style={{ background: active ? COLORS.ember : COLORS.paper, color: active ? COLORS.cream : COLORS.ink }}>
                      {o.label}<span style={{ opacity: 0.55, marginLeft: 2 }}>{o.count}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {sortOpen && (
              <div className="qz-pop qz-pop-sort" role="menu" style={{ left: panelLeft }}>
                {SORTS.map((opt, i) => {
                  const active = sortBy === opt.id;
                  return (<button key={opt.id} role="menuitem" className="qz-pop-item" onClick={() => { setSortBy(opt.id); setSortOpen(false); }} style={{ background: active ? COLORS.ink : 'transparent', color: active ? COLORS.cream : COLORS.ink, borderTop: i === 0 ? 'none' : `0.5px solid ${COLORS.paper}` }}>{opt.label}</button>);
                })}
              </div>
            )}
          </div>
        </nav>

        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 16px 64px' }}>
          <QuizBoardWide kicker="Quizzes" cta="All Quiz Stats" ctaHref="/quizzes/stats" categories={quizCats} />

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

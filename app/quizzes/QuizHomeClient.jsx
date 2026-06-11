'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Search, X, ChevronDown, Plane, FerrisWheel, Trees, Clapperboard, Music, Gamepad2, BookOpen, Car, Youtube, Instagram, GraduationCap, Drama, Trophy, Sparkles } from 'lucide-react';
import { COLORS } from '@/lib/data';
import { QUIZZES } from '@/lib/quizzes';
import Grain from '../Grain';
import Footer from '../Footer';

// Group each quiz into a homepage-style department for the nav ribbon.
function deptOf(q) {
  const id = q.id;
  if (/sports?|nfl|nba|mlb|nhl|fifa|olympic|super-bowl|world-cup|athlete|grand-slam/.test(id)) return 'sports';
  if (q.type === 'travel') return 'travel';
  if (/film|movie|box-office|director|actor|animated|franchise/.test(id)) return 'movies';
  if (/song|album|single|spotify|music-video|concert-tour|billboard|soundtrack/.test(id)) return 'music';
  if (/games|video-games/.test(id)) return 'gaming';
  if (/book/.test(id)) return 'literature';
  if (/youtube|instagram|broadway/.test(id)) return 'entertainment';
  return 'misc';
}
// Primary ribbon buttons (Sporcle's biggest categories + Travel + Sports).
const PRIMARY = [
  { id: 'all', label: 'All' },
  { id: 'movies', label: 'Movies' },
  { id: 'music', label: 'Music' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'travel', label: 'Travel' },
  { id: 'sports', label: 'Sports' },
];
// Additional categories, surfaced in the "More" dropdown rather than the ribbon.
const MORE_CATS = [
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'literature', label: 'Literature' },
  { id: 'misc', label: 'Miscellaneous' },
];
// Per-quiz category icon (finer than the nav department), shown on each tile.
function iconOf(q) {
  const id = q.id;
  if (/sports?|nfl|nba|mlb|nhl|fifa|olympic|super-bowl|world-cup|athlete|grand-slam/.test(id)) return Trophy;
  if (/airline/.test(id)) return Plane;
  if (/theme-park/.test(id)) return FerrisWheel;
  if (/national-park/.test(id)) return Trees;
  if (/best-selling-cars/.test(id)) return Car;
  if (/book/.test(id)) return BookOpen;
  if (/youtube/.test(id)) return Youtube;
  if (/instagram/.test(id)) return Instagram;
  if (/endowment|universit/.test(id)) return GraduationCap;
  if (/broadway/.test(id)) return Drama;
  if (/games|video-games/.test(id)) return Gamepad2;
  if (/song|album|single|spotify|music-video|concert-tour|billboard|soundtrack/.test(id)) return Music;
  if (/film|movie|box-office|director|actor|animated|franchise/.test(id)) return Clapperboard;
  return Sparkles;
}

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

function QuizTile({ quiz, plays }) {
  const [hover, setHover] = useState(false);
  const Icon = iconOf(quiz);
  return (
    <Link
      href={`/quiz/${quiz.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ cursor: 'pointer', textDecoration: 'none', display: 'flex', flexDirection: 'column', background: COLORS.paper, color: COLORS.ink, border: `1.5px solid ${COLORS.ink}`, overflow: 'hidden', transition: 'all 0.2s ease', transform: hover ? 'translate(-2px, -2px)' : 'none', boxShadow: hover ? `3px 3px 0 ${COLORS.ember}` : 'none' }}
    >
      <div style={{ padding: '16px 18px 14px', display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, minWidth: 0, fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: COLORS.ink, fontWeight: 700 }}><Icon size={14} strokeWidth={2} aria-hidden="true" style={{ color: COLORS.ember, flex: 'none' }} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{quiz.category || 'Quiz'} · Quiz</span></span>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded }}>{quiz.answers.length} to name</span>
        </div>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 22, lineHeight: 1.1, letterSpacing: '-0.01em', margin: 0, color: COLORS.ink }}>{quiz.title}</h3>
        {quiz.blurb && (<p style={{ margin: '10px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 13, lineHeight: 1.5, color: COLORS.faded, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{quiz.blurb}</p>)}
        <div style={{ marginTop: 'auto', paddingTop: 14, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 8, fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
          <span style={{ color: COLORS.ink }}>▶ Play</span>
          {plays > 0 && (<span style={{ color: COLORS.faded, fontWeight: 600, letterSpacing: '0.1em' }}>· {plays.toLocaleString()} plays</span>)}
        </div>
      </div>
    </Link>
  );
}

export default function QuizHomeClient() {
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('all');
  const [sortBy, setSortBy] = useState('discover');
  const [sortOpen, setSortOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [totals, setTotals] = useState({ total: 0, byQuiz: {}, recent7: {} });
  const [recent, setRecent] = useState([]);
  const seedRef = useRef((Date.now() & 0xffffffff) >>> 0);
  // Horizontal-scroll affordance for the department ribbon (mobile cue arrows).
  const deptNavRef = useRef(null);
  const [navScroll, setNavScroll] = useState({ left: false, right: false });
  useEffect(() => {
    const el = deptNavRef.current;
    if (!el) return undefined;
    const update = () => {
      const more = el.scrollWidth - el.clientWidth;
      setNavScroll({ left: el.scrollLeft > 2, right: more > 2 && el.scrollLeft < more - 2 });
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [dept]);

  useEffect(() => {
    fetch('/api/quiz/totals').then((r) => r.json()).then((d) => { if (d && !d.error) setTotals({ total: d.total || 0, byQuiz: d.byQuiz || {}, recent7: d.recent7 || {} }); }).catch(() => {});
    fetch('/api/quiz/recent').then((r) => r.json()).then((d) => { if (d && Array.isArray(d.plays)) setRecent(d.plays); }).catch(() => {});
  }, []);

  const titleById = useMemo(() => Object.fromEntries(QUIZZES.map((q) => [q.id, q.title])), []);
  const recentEntries = useMemo(() => recent.map((p) => {
    const t = (titleById[p.quizId] || '').replace(/^Name (the )?/, '');
    if (!t) return null;
    const who = p.username ? p.username : 'A player';
    return { quizId: p.quizId, text: `${who} named ${p.score}/${p.total}: ${t}` };
  }).filter(Boolean), [recent, titleById]);

  const counts = useMemo(() => {
    const c = { all: QUIZZES.length };
    for (const q of QUIZZES) { const d = deptOf(q); c[d] = (c[d] || 0) + 1; }
    return c;
  }, []);

  const sorted = useMemo(() => {
    const ql = query.trim().toLowerCase();
    let list = QUIZZES.filter((q) => {
      if (dept !== 'all' && deptOf(q) !== dept) return false;
      if (!ql) return true;
      return (q.title || '').toLowerCase().includes(ql) || (q.category || '').toLowerCase().includes(ql) || (q.blurb || '').toLowerCase().includes(ql);
    });
    const plays = (id) => totals.byQuiz[id] || 0;
    const recent = (id) => totals.recent7[id] || 0;
    if (sortBy === 'discover') list = seededShuffle(list, seedRef.current);
    else if (sortBy === 'popularity') list = list.slice().sort((a, b) => plays(b.id) - plays(a.id) || a.title.localeCompare(b.title));
    else if (sortBy === 'trending') list = list.slice().sort((a, b) => recent(b.id) - recent(a.id) || plays(b.id) - plays(a.id) || a.title.localeCompare(b.title));
    else if (sortBy === 'recent') {
      const ts = (q) => new Date(q.publishedAt || `${q.publishedDate || '1970-01-01'}T12:00:00Z`).getTime();
      list = list.slice().sort((a, b) => ts(b) - ts(a) || a.title.localeCompare(b.title));
    }
    return list;
  }, [query, dept, sortBy, totals]);

  const navBtn = (id, label, count) => {
    const active = dept === id;
    return (
      <button key={id} onClick={() => { setDept(id); setMoreOpen(false); }} style={{ flex: '1 0 auto', background: active ? COLORS.ember : 'transparent', color: COLORS.cream, border: 'none', borderRight: '1px solid rgba(244,237,224,0.18)', height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0 18px', fontFamily: 'DM Mono, monospace', fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
        {label}<span style={{ opacity: 0.6 }}>{count || 0}</span>
      </button>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, color: COLORS.ink, position: 'relative', overflow: 'clip' }}>
      <Grain />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <header style={{ padding: '48px 24px 18px', maxWidth: 1200, margin: '0 auto' }}>
          <div className="cg-head">
            <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 'clamp(40px, 9vw, 84px)', lineHeight: 0.9, letterSpacing: '-0.015em', margin: 0, fontVariationSettings: '"SOFT" 100', color: COLORS.ink, whiteSpace: 'nowrap' }}>
              Source<br /><span style={{ fontStyle: 'italic', fontWeight: 400, color: COLORS.ember }}>of</span> Truths
            </h1>
            <div className="cg-head-col">
              <div className="cg-tagline">The Quizzes</div>
              <div className="cg-blurb">Timed name-them-all quizzes. Beat the clock, then the leaderboard.</div>
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
            .cg-qcontrols{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px;}.cg-qcontrols>*{height:42px;min-width:0;}
            @media(max-width:760px){.cg-qcontrols{grid-template-columns:1fr 1fr;}.cg-q-search{grid-column:1 / -1;}.cg-q-sort{grid-column:1 / -1;}.cg-q-actions{grid-column:1 / -1;}.cg-q-search input{font-size:16px !important;}}
            .qz-stats{margin-top:16px;display:flex;align-items:baseline;flex-wrap:nowrap;white-space:nowrap;gap:16px;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:${COLORS.faded};}
            .qz-tape{flex:1 1 auto;min-width:0;overflow:hidden;margin-left:8px;}
            .qz-tape-track{display:inline-block;white-space:nowrap;animation-name:qz-tape-scroll;animation-timing-function:linear;animation-iteration-count:infinite;will-change:transform;}
            .qz-tape-track:hover{animation-play-state:paused;}
            @keyframes qz-tape-scroll{from{transform:translateX(0);}to{transform:translateX(-50%);}}
            @media(max-width:760px){.qz-tape{display:none;}}
            .qz-deptnav{scrollbar-width:none;-ms-overflow-style:none;}.qz-deptnav::-webkit-scrollbar{display:none;}
            @keyframes qzNavNudge{0%,100%{transform:translate(0,-50%);}50%{transform:translate(3px,-50%);}}
            @keyframes qzNavNudgeL{0%,100%{transform:translate(0,-50%);}50%{transform:translate(-3px,-50%);}}
            .qz-navcue{position:absolute;top:50%;z-index:2;display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:${COLORS.ember};color:${COLORS.cream};box-shadow:0 1px 4px rgba(26,22,17,0.45);pointer-events:none;font-size:15px;line-height:1;}
            .qz-navcue-r{right:18px;animation:qzNavNudge 1.4s ease-in-out infinite;}
            .qz-navcue-l{left:18px;animation:qzNavNudgeL 1.4s ease-in-out infinite;}
            @media(min-width:760px){.qz-navcue{display:none;}}
          `}</style>
          <div className="qz-stats">
            <span>{QUIZZES.length} quizzes</span>
            <span><span style={{ opacity: 0.5 }}>·</span> {totals.total.toLocaleString()} total plays</span>
            {recentEntries.length > 0 && (
              <span className="qz-tape">
                <span className="qz-tape-track" style={{ animationDuration: `${Math.max(40, recentEntries.length * 9)}s` }}>
                  {[0, 1].map((dup) => (
                    <span key={dup} aria-hidden={dup === 1 ? 'true' : undefined}>
                      {recentEntries.map((e, i) => (
                        <Link key={`${dup}-${i}`} href={`/quiz/${e.quizId}`} style={{ color: COLORS.ember, textDecoration: 'none' }}>
                          {e.text}<span aria-hidden="true" style={{ color: COLORS.faded, padding: '0 14px' }}>{'\u25C6'}</span>
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
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', position: 'relative' }}>
            <div ref={deptNavRef} className="qz-deptnav" style={{ display: 'flex', alignItems: 'stretch', overflowX: 'auto', background: COLORS.ink, borderBottom: `3px solid ${COLORS.ember}` }}>
              {PRIMARY.map((d) => navBtn(d.id, d.label, counts[d.id]))}
              {(() => {
                const moreActive = MORE_CATS.some((c) => c.id === dept);
                return (
                  <button key="more" onClick={() => { setMoreOpen((o) => !o); setSortOpen(false); }} aria-haspopup="true" aria-expanded={moreOpen} style={{ flex: '1 0 auto', background: moreActive ? COLORS.ember : 'transparent', color: COLORS.cream, border: 'none', borderRight: '1px solid rgba(244,237,224,0.18)', height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0 18px', fontFamily: 'DM Mono, monospace', fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    More <span style={{ opacity: 0.7 }}>{moreOpen ? '\u25B4' : '\u25BE'}</span>
                  </button>
                );
              })()}
            </div>
            {navScroll.left && <span aria-hidden="true" className="qz-navcue qz-navcue-l">&#8249;</span>}
            {navScroll.right && <span aria-hidden="true" className="qz-navcue qz-navcue-r">&#8250;</span>}
            {moreOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 16, right: 16, zIndex: 30, background: COLORS.cream, border: `1.5px solid ${COLORS.ink}`, borderTop: 'none', boxShadow: '0 10px 24px rgba(26,22,17,0.25)' }}>
                <div style={{ padding: '14px 18px 16px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {MORE_CATS.map((c) => {
                    const active = dept === c.id;
                    return (
                      <button key={c.id} onClick={() => { setDept(c.id); setMoreOpen(false); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: active ? COLORS.ember : COLORS.paper, color: active ? COLORS.cream : COLORS.ink, border: `1.5px solid ${COLORS.ink}`, padding: '8px 14px', fontFamily: 'DM Mono, monospace', fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}>
                        {c.label}<span style={{ opacity: 0.55, marginLeft: 2 }}>{counts[c.id] || 0}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>

        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px 64px' }}>
          <div className="cg-qcontrols">
            <div className="cg-q-search" style={{ position: 'relative', minWidth: 0 }}>
              <Search size={16} strokeWidth={2.5} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: COLORS.faded }} />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search quizzes" style={{ width: '100%', height: '100%', boxSizing: 'border-box', padding: '0 16px 0 42px', background: COLORS.paper, border: `1.5px solid ${COLORS.ink}`, fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: COLORS.ink, outline: 'none' }} />
              {query && (<button onClick={() => setQuery('')} aria-label="Clear search" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: COLORS.faded, cursor: 'pointer', padding: 6, display: 'flex' }}><X size={16} strokeWidth={2.5} /></button>)}
            </div>
            <div className="cg-q-sort" style={{ position: 'relative', minWidth: 0 }} onClick={(e) => e.stopPropagation()}>
              <button onClick={() => { setSortOpen((o) => !o); setMoreOpen(false); }} aria-haspopup="true" aria-expanded={sortOpen} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: COLORS.ink, color: COLORS.cream, border: `1.5px solid ${COLORS.ink}`, padding: '0 34px', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><span style={{ opacity: 0.8 }}>Sort:</span> {(SORTS.find((o) => o.id === sortBy) || {}).short || 'Discover'}</span>
                <ChevronDown size={14} strokeWidth={2.5} style={{ position: 'absolute', right: 14, top: '50%', transform: sortOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)', transition: 'transform 0.15s' }} />
              </button>
              {sortOpen && (
                <div role="menu" style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 30, minWidth: 200, background: COLORS.cream, border: `1.5px solid ${COLORS.ink}` }}>
                  {SORTS.map((opt, i) => {
                    const active = sortBy === opt.id;
                    return (<button key={opt.id} role="menuitem" onClick={() => { setSortBy(opt.id); setSortOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', border: 'none', padding: '10px 14px', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', textAlign: 'left', background: active ? COLORS.ink : 'transparent', color: active ? COLORS.cream : COLORS.ink, borderTop: i === 0 ? 'none' : `0.5px solid ${COLORS.paper}` }}>{opt.label}</button>);
                  })}
                </div>
              )}
            </div>
            <div className="cg-q-actions" style={{ display: 'flex', gap: 8, minWidth: 0 }}>
              <Link href="/request" style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: COLORS.ember, color: COLORS.cream, border: `1.5px solid ${COLORS.ink}`, padding: '0 8px', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', boxShadow: `3px 3px 0 ${COLORS.ink}` }}>
                Request a Quiz
              </Link>
              <Link href="/" style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: COLORS.ink, color: COLORS.cream, border: `1.5px solid ${COLORS.ink}`, padding: '0 8px', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', boxShadow: `3px 3px 0 ${COLORS.ink}` }}>
                Top 10 Lists
              </Link>
            </div>
          </div>

          {sorted.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
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

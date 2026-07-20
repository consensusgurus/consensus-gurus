'use client';

// Alibi — the daily whodunit logic puzzle.
//
// One case a day: four guests, each alone in a different room, each leaving at
// a different hour, each carrying one curious item. Every witness statement is
// true; together they pin down exactly one arrangement (every banked case is
// machine-verified unique, see scripts/verify-alibi.mjs). Work the three
// deduction boards — tap a cell to cycle blank → ✗ (impossible) → ● (confirmed)
// — then make your accusation.
//
// The client never receives the solution over the wire: the server page strips
// it, and this component re-derives the unique arrangement from the clues with
// a 4!³ brute-force (13,824 candidates, instant).
//
// Scoring: crack the case for max(1, 12 - 2×wrong accusations) out of 12 — a
// first-try accusation is a perfect 12. Ties on the daily board break by
// fewest wrong accusations, then fastest time. Revealing ends the day at 0.
//
// Same daily plumbing as Circa/Suds/Stet: banked cases gated by Eastern date
// on the server (app/alibi/page.js), per-puzzle localStorage saves, /alibi?p=N
// archive pinning, streaks + stats, and the shared /api/quiz/* board flow.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, X, Smartphone, Search, Eraser } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import useDuelContext, { DuelBanner } from '../quiz/[id]/useDuelContext';
import JoinLeaderboardForm from '../quiz/[id]/JoinLeaderboardForm';
import DailyGamesGrid from '../DailyGamesGrid';
import DailyEndCard from '../DailyEndCard';
import DailyTopNav from '../DailyTopNav';
import DailyCombinedLeaderboard from '../quiz/[id]/DailyCombinedLeaderboard';
import { isMobileDevice } from '@/lib/is-mobile';
import useAbandonFlush from '../quiz/[id]/useAbandonFlush';

const COLORS = {
  cream: '#f7f8fa',
  paper: '#eceef1',
  ink: '#1c1e24',
  ember: '#0e1d40',
  rust: '#c0392b',
  faded: '#6b7280',
  accent: '#8b1e2d',        // Alibi identity — drawing-room oxblood
  accentSoft: '#f6e3e5',
  green: '#15803d',
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const HELP_KEY = 'sot_alibi_help_seen';
const STATS_KEY = 'sot_alibi_stats';
const TOTAL = 12;
const CATS = ['room', 'time', 'obj'];

const isIosDevice = () =>
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent || '') ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

function etToday() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}
function pickPuzzle(puzzles, forceNum) {
  if (forceNum) { const p = puzzles.find((x) => x.num === forceNum); if (p) return p; }
  const today = etToday();
  const open = puzzles.filter((p) => p.live <= today);
  return open.length ? open[open.length - 1] : puzzles[0];
}
function fmtTime(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
function msToMidnightET() {
  try {
    const now = new Date();
    const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const next = new Date(et);
    next.setHours(24, 0, 0, 0);
    return next - et;
  } catch (e) {
    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 0, 0);
    return next - now;
  }
}
function fmtCountdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
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
const EMPTY_BOARD = { plays: 0, best: null, topTime: null, leaderboard: [], leaderboardAll: [], leaderboardMobile: [], leaderboardFirst: [], leaderboards: {} };

// ─── Solver: derive THE unique arrangement from the clues (no answer wire) ──
const PERMS4 = (() => {
  const out = [];
  const permute = (a, l) => {
    if (l === a.length) { out.push(a.slice()); return; }
    for (let i = l; i < a.length; i++) { [a[l], a[i]] = [a[i], a[l]]; permute(a, l + 1); [a[l], a[i]] = [a[i], a[l]]; }
  };
  permute([0, 1, 2, 3], 0);
  return out;
})();
function evalClue(c, room, time, obj) {
  switch (c.type) {
    case 'notRoom': return room[c.s] !== c.r;
    case 'notObj': return obj[c.s] !== c.o;
    case 'roomObj': { const s = room.indexOf(c.r); return obj[s] === c.o; }
    case 'roomTime': { const s = room.indexOf(c.r); return time[s] === c.t; }
    case 'before': return time[c.s1] < time[c.s2];
    case 'beforeRoom': { const s2 = room.indexOf(c.r); return c.s !== s2 && time[c.s] < time[s2]; }
    case 'hasObj': return obj[c.s] === c.o;
  }
  return false;
}
function solveCase(clues) {
  for (const room of PERMS4) for (const time of PERMS4) for (const obj of PERMS4) {
    let ok = true;
    for (const c of clues) { if (!evalClue(c, room, time, obj)) { ok = false; break; } }
    if (ok) return { room, time, obj }; // banked cases are verified unique
  }
  return null;
}

// ─── Personal stats + streak (localStorage), Circa/Suds pattern ─────────────
function getStats() {
  try {
    const s = JSON.parse(localStorage.getItem(STATS_KEY));
    if (s && s.v === 1 && s.rec) return s;
  } catch (e) {}
  return { v: 1, rec: {} };
}
function recordStat(num, entry) {
  const s = getStats();
  if (s.rec[num]) return s;
  const s2 = { ...s, rec: { ...s.rec, [num]: entry } };
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s2)); } catch (e) {}
  return s2;
}
function deriveStats(s, todayNum) {
  const rec = s && s.rec ? s.rec : {};
  const nums = Object.keys(rec).map(Number).sort((a, b) => a - b);
  const played = nums.length;
  const perfect = nums.filter((n) => rec[n].won).length;
  let max = 0, run = 0, prev = null;
  for (const n of nums) {
    run = prev != null && n === prev + 1 ? run + 1 : 1;
    if (run > max) max = run;
    prev = n;
  }
  let cur = 0, at = rec[todayNum] ? todayNum : todayNum - 1;
  while (rec[at]) { cur++; at--; }
  return { played, perfect, cur, max };
}
function mergeServerStats(s, recent, puzzles) {
  if (!s || !Array.isArray(recent) || !recent.length) return s;
  const byQuiz = {};
  for (const p of puzzles) byQuiz[p.quizId] = p;
  let rec = s.rec, changed = false;
  for (const m of recent) {
    const p = m && byQuiz[m.quizId];
    if (!p || m.attempt !== 1) continue;
    if (rec[p.num]) continue;
    const sc = Math.max(0, Math.min(TOTAL, Math.round(((m.scorePct || 0) / 100) * TOTAL)));
    if (!changed) { rec = { ...rec }; changed = true; }
    rec[p.num] = { s: sc, t: TOTAL, g: null, won: !!m.perfect };
  }
  if (!changed) return s;
  const s2 = { ...s, rec };
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s2)); } catch (e) {}
  return s2;
}

function freshMarks() {
  const m = {};
  for (const c of CATS) m[c] = Array.from({ length: 4 }, () => Array(4).fill(0));
  return m;
}
function freshState() {
  return {
    v: 1,
    marks: freshMarks(),        // marks[cat][suspect][value]: 0 blank | 1 x | 2 dot
    struck: [],                 // crossed-off clue indexes
    status: 'playing',          // playing | done | lost
    wrong: 0,                   // wrong accusations
    t0: null,
    tEnd: null,
  };
}

export default function AlibiClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const STORE_KEY = `sot_alibi_${PUZZLE.num}`;
  const SOLUTION = useMemo(() => solveCase(PUZZLE.clues), [PUZZLE]);
  const CAT_META = useMemo(() => ([
    { key: 'room', label: 'Rooms', vals: PUZZLE.rooms },
    { key: 'time', label: 'Departure times', vals: PUZZLE.times },
    { key: 'obj', label: 'Items carried', vals: PUZZLE.objects },
  ]), [PUZZLE]);

  const [g, setG] = useState(freshState);
  const [autoX, setAutoX] = useState(true);
  const [verdict, setVerdict] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [endClosed, setEndClosed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [identity, setIdentity] = useState(null);
  const [stats, setStats] = useState(null);
  const [player, setPlayer] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [installEvt, setInstallEvt] = useState(null);
  const [showA2hsHelp, setShowA2hsHelp] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [mobileUi, setMobileUi] = useState(false);
  const searchParams = useSearchParams();
  const { duelToken, duelInfo, duelSubmitted } = useDuelContext(PUZZLE.quizId, searchParams);
  const toastTimer = useRef(null);
  const viewedRef = useRef(false);

  const [showChrome, setShowChrome] = useState(false);
  const playing = g.status === 'playing';
  const focusMode = playing && !showChrome;
  const won = g.status === 'done' && g.wrong === 0;
  const score = g.status === 'done' ? Math.max(1, TOTAL - 2 * g.wrong) : 0;
  const placedCount = CATS.reduce((n, c) => n + g.marks[c].flat().filter((m) => m === 2).length, 0);

  useEffect(() => {
    try {
      setStandalone(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);
      setMobileUi(isMobileDevice());
    } catch {}
    const onBip = (e) => { e.preventDefault(); setInstallEvt(e); };
    const onInstalled = () => { setStandalone(true); setInstallEvt(null); };
    window.addEventListener('beforeinstallprompt', onBip);
    window.addEventListener('appinstalled', onInstalled);
    return () => { window.removeEventListener('beforeinstallprompt', onBip); window.removeEventListener('appinstalled', onInstalled); };
  }, []);
  const a2hsClick = () => { const e = installEvt; if (e) { setInstallEvt(null); e.prompt(); } else { setShowA2hsHelp(true); } };

  // ---- persistence ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.v === 1 && saved.marks) setG({ ...freshState(), ...saved });
      }
      if (!localStorage.getItem(HELP_KEY)) setShowHelp(true);
    } catch (e) {}
    try { setStats(getStats()); } catch (e) {}
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(g)); } catch (e) {}
    try {
      if (PUZZLE.num === pickPuzzle(puzzles, null).num) {
        localStorage.setItem('sot_alibi_day', JSON.stringify({ d: etToday(), done: g.status !== 'playing' }));
      }
    } catch (e) {}
  }, [g, hydrated, STORE_KEY, PUZZLE, puzzles]);

  useEffect(() => {
    if (g.status === 'playing') return;
    const tick = () => setCountdown(fmtCountdown(msToMidnightET()));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [g.status]);

  // ---- metrics + leaderboard (same /api/quiz/* flow as every other board) ----
  useEffect(() => {
    try {
      const id = JSON.parse(localStorage.getItem('sot_quiz_identity'));
      if (id && id.email) setIdentity(id);
    } catch (e) {}
    try {
      const anon = getAnonId();
      let em = '';
      try {
        const idj = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null');
        if (idj && idj.email) em = `&email=${encodeURIComponent(idj.email)}`;
      } catch (e) {}
      if (anon || em) {
        fetch(`/api/quiz/me?anonId=${encodeURIComponent(anon || '')}${em}`)
          .then((r) => r.json())
          .then((d) => {
            if (d && Array.isArray(d.recent)) {
              setStats((cur) => mergeServerStats(cur || getStats(), d.recent, puzzles));
            }
            if (d && d.found && d.name) setPlayer({ name: d.name, rank: (d.ranks && d.ranks.xp) || d.rank || null, key: d.userKey || null });
          })
          .catch(() => {});
      }
    } catch (e) {}
    fetch(`/api/quiz/board?quizId=${encodeURIComponent(PUZZLE.quizId)}`)
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
      .catch(() => {});
    if (!viewedRef.current) {
      viewedRef.current = true;
      fetch('/api/quiz/view', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quizId: PUZZLE.quizId }) }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function say(msg) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  const elapsed = g.t0 ? fmtTime((g.tEnd || Date.now()) - g.t0) : '0:00';
  const isTodays = PUZZLE.num === pickPuzzle(puzzles, null).num;
  const prevPuzzle = puzzles.find((x) => x.num === PUZZLE.num - 1) || null;
  const myStats = deriveStats(stats, pickPuzzle(puzzles, null).num);

  const REC_KEY = `sot_alibi_rec_${PUZZLE.num}`;
  const abandon = useAbandonFlush(() => {
    if (!g.t0 || g.status !== 'playing') return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - g.t0) / 1000)));
    try { localStorage.setItem(REC_KEY, '1'); } catch (e) {}
    return { quizId: PUZZLE.quizId, score: 0, total: TOTAL, correct: 0, guessesUsed: 0, timeElapsed: el, abandoned: true, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') };
  });

  function postResult(g2, sc) {
    abandon.markFlushed();
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    try { setStats(recordStat(PUZZLE.num, { s: sc, t: TOTAL, g: g2.wrong, won: sc === TOTAL })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        // guessesUsed = wrong accusations, so the daily board's ties break by
        // the surer detective.
        body: JSON.stringify({ quizId: PUZZLE.quizId, score: sc, total: TOTAL, correct: sc === TOTAL ? 1 : 0, guessesUsed: g2.wrong, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
      })
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
        .catch(() => {});
    } catch (e) {}
  }

  function tapCell(cat, s, v) {
    if (!playing) return;
    setG((cur) => {
      const marks = { ...cur.marks, [cat]: cur.marks[cat].map((row) => row.slice()) };
      const next = (marks[cat][s][v] + 1) % 3;
      marks[cat][s][v] = next;
      if (next === 2 && autoX) {
        for (let v2 = 0; v2 < 4; v2++) if (v2 !== v && marks[cat][s][v2] !== 2) marks[cat][s][v2] = 1;
        for (let s2 = 0; s2 < 4; s2++) if (s2 !== s && marks[cat][s2][v] !== 2) marks[cat][s2][v] = 1;
      }
      return { ...cur, marks, t0: cur.t0 || Date.now() };
    });
    setVerdict(null);
  }
  function toggleClue(i) {
    setG((cur) => {
      const struck = cur.struck.includes(i) ? cur.struck.filter((x) => x !== i) : [...cur.struck, i];
      return { ...cur, struck };
    });
  }
  function resetBoards() {
    if (!playing) return;
    setG((cur) => ({ ...cur, marks: freshMarks() }));
    setVerdict(null);
  }

  function accuse() {
    if (!playing || !SOLUTION) return;
    let placed = 0, wrong = 0;
    for (const cat of CATS) {
      for (let s = 0; s < 4; s++) for (let v = 0; v < 4; v++) {
        if (g.marks[cat][s][v] === 2) { placed++; if (SOLUTION[cat][s] !== v) wrong++; }
      }
    }
    if (placed < 12) { setVerdict({ soft: true, msg: `You've confirmed ${placed} of 12 facts — keep deducing before you accuse.` }); return; }
    if (wrong > 0) {
      setG((cur) => ({ ...cur, wrong: cur.wrong + 1, t0: cur.t0 || Date.now() }));
      setVerdict({ msg: `Not quite — ${wrong} of your ● marks ${wrong === 1 ? 'is' : 'are'} wrong.` });
      return;
    }
    const g2 = { ...g, status: 'done', tEnd: Date.now(), t0: g.t0 || Date.now() };
    setG(g2);
    setVerdict(null);
    setEndClosed(false);
    postResult(g2, Math.max(1, TOTAL - 2 * g2.wrong));
  }

  function reveal() {
    if (!playing || !SOLUTION) return;
    setG((cur) => {
      const marks = freshMarks();
      for (const cat of CATS) {
        for (let s = 0; s < 4; s++) for (let v = 0; v < 4; v++) marks[cat][s][v] = SOLUTION[cat][s] === v ? 2 : 1;
      }
      const g2 = { ...cur, marks, status: 'lost', tEnd: Date.now(), t0: cur.t0 || Date.now() };
      postResult(g2, 0);
      return g2;
    });
    setVerdict(null);
    setEndClosed(false);
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    setG(freshState()); setVerdict(null); setEndClosed(false);
  }

  function clueText(c) {
    const S = PUZZLE.suspects, R = PUZZLE.rooms, O = PUZZLE.objects, T = PUZZLE.times;
    switch (c.type) {
      case 'notRoom': return <><b>{S[c.s]}</b> was never in the {R[c.r]}.</>;
      case 'notObj': return <><b>{S[c.s]}</b> was not carrying the {O[c.o]}.</>;
      case 'roomObj': return <>Whoever was in the <b>{R[c.r]}</b> was carrying the {O[c.o]}.</>;
      case 'roomTime': return <>The guest in the <b>{R[c.r]}</b> left at {T[c.t]}.</>;
      case 'before': return <><b>{S[c.s1]}</b> left earlier than {S[c.s2]}.</>;
      case 'beforeRoom': return <><b>{S[c.s]}</b> left before the guest in the {R[c.r]}.</>;
      case 'hasObj': return <><b>{S[c.s]}</b> was carrying the {O[c.o]}.</>;
    }
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', position: 'relative' }}>
      <Grain />
      <div className="al-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.al-wrap{padding-left:12px !important;padding-right:12px !important;}}
          .al-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.ink};background:#fff;color:${COLORS.ink};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .al-btn:hover{background:${COLORS.paper};}
          .al-btn.primary{background:${COLORS.accent};border-color:${COLORS.accent};color:#fff;}
          .al-btn.primary:hover{background:#761a26;}
          .al-clue{background:#fff;border:1px solid rgba(28,30,36,0.14);border-left:3px solid ${COLORS.accent};border-radius:8px;padding:8px 11px;margin-bottom:6px;font-size:13.5px;font-weight:600;line-height:1.45;cursor:pointer;user-select:none;color:${COLORS.ink};}
          .al-clue b{color:${COLORS.accent};}
          .al-clue.done{opacity:0.42;text-decoration:line-through;}
          .al-tbl{border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);margin:0 auto 14px;width:auto;max-width:100%;}
          .al-tbl caption{font-family:${MONO};font-size:10.5px;font-weight:500;text-transform:uppercase;letter-spacing:0.1em;color:${COLORS.faded};text-align:left;padding:0 0 6px 2px;caption-side:top;}
          .al-tbl th{font-size:11px;padding:6px 4px;background:#efece6;font-weight:700;color:${COLORS.ink};}
          .al-tbl th.rowh{text-align:right;min-width:64px;padding-right:8px;}
          .al-td{width:40px;height:38px;border:1px solid rgba(28,30,36,0.12);text-align:center;font-size:16px;cursor:pointer;user-select:none;font-weight:800;padding:0;background:#fff;}
          .al-td:hover{background:#faf6ee;}
          .al-td.x{color:#b9b2a6;}
          .al-td.dot{color:${COLORS.accent};background:${COLORS.accentSoft};}
          .al-grids{display:grid;grid-template-columns:1fr;gap:0;}
          @media(min-width:900px){.al-cols{display:grid;grid-template-columns:330px 1fr;gap:20px;align-items:start;}}
        `}</style>

        <div style={{ maxWidth: 940, margin: '0 auto' }}>

        <div style={{ display: 'block' }}><DailyTopNav player={player} compact={playing} /></div>

        {/* masthead */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', position: 'relative', paddingRight: 28, marginBottom: 14, borderBottom: '2px solid rgba(28,30,36,0.8)', paddingBottom: 11 }}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
            {'ALIBI'.split('').map((ch, i) => (
              <div key={i} style={{ width: 40, height: 40, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 23, background: i === 0 ? COLORS.accent : COLORS.ink, color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontFamily: MONO, fontSize: 14, letterSpacing: '0.06em', fontWeight: 500, color: COLORS.ink }}>Case No. {PUZZLE.num}</h1>
            <span style={{ color: COLORS.faded }}>&middot;</span>
            <span style={{ fontFamily: SANS, fontStyle: 'italic', fontSize: 15, color: COLORS.faded }}>{PUZZLE.dateLabel}</span>
            {PUZZLE.sunday && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: '#fff', background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>Sunday Edition &middot; The Sunday Case</span>}
          </div>
          <button onClick={() => setShowHelp(true)} aria-label="How to play" title="How to play" style={{ position: 'absolute', top: 8, right: 2, background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded, padding: 0, display: 'flex' }}>
            <HelpCircle size={20} />
          </button>
        </div>

        {/* the story */}
        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14.5, lineHeight: 1.6, background: '#fff', border: '1px solid rgba(28,30,36,0.14)', borderLeft: `4px solid ${COLORS.accent}`, borderRadius: 8, padding: '12px 16px', margin: '0 0 12px', color: COLORS.ink }}>
          Last night at {PUZZLE.venue}, {PUZZLE.stolen} vanished. Four guests &mdash; {PUZZLE.suspects[0]}, {PUZZLE.suspects[1]}, {PUZZLE.suspects[2]} and {PUZZLE.suspects[3]} &mdash; were each alone in a different room, each left at a different hour, and each was carrying one curious item. Work out who was where, when they left, and what they carried. Every statement below is true.
        </div>

        {/* status bar */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.faded }}>
          <span>confirmed <b style={{ color: COLORS.ink, fontWeight: 500 }}>{placedCount}</b>/12</span>
          <span>wrong accusations <b style={{ color: g.wrong ? COLORS.rust : COLORS.ink, fontWeight: 500 }}>{g.wrong}</b></span>
          {playing && (
            <label style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: SANS, fontSize: 12, fontWeight: 700, textTransform: 'none', letterSpacing: 0 }}>
              <input type="checkbox" checked={autoX} onChange={(e) => setAutoX(e.target.checked)} style={{ accentColor: COLORS.accent }} />
              auto-✗ when you mark ●
            </label>
          )}
        </div>

        <div className="al-cols">
          {/* witness statements */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.faded, marginBottom: 8 }}>Witness statements</div>
            {PUZZLE.clues.map((c, i) => (
              <div key={i} className={`al-clue${g.struck.includes(i) ? ' done' : ''}`} onClick={() => toggleClue(i)} role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleClue(i); } }}>
                <b>{i + 1}.</b> {clueText(c)}
              </div>
            ))}
            <div style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.faded, lineHeight: 1.5, marginTop: 8 }}>
              Tap a statement to cross it off. Tap a board cell to cycle: blank &rarr; ✗ (impossible) &rarr; ● (confirmed). Each suspect gets exactly one ● per board.
            </div>
          </div>

          {/* detective's boards */}
          <div>
            <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.faded, marginBottom: 8 }}>Detective&rsquo;s board</div>
            <div className="al-grids">
              {CAT_META.map((cat) => (
                <table key={cat.key} className="al-tbl">
                  <caption>{cat.label}</caption>
                  <tbody>
                    <tr>
                      <th className="rowh" aria-hidden="true"></th>
                      {cat.vals.map((v) => <th key={v}>{v}</th>)}
                    </tr>
                    {PUZZLE.suspects.map((name, s) => (
                      <tr key={name}>
                        <th className="rowh">{name}</th>
                        {cat.vals.map((_, v) => {
                          const m = g.marks[cat.key][s][v];
                          return (
                            <td
                              key={v}
                              className={`al-td${m === 1 ? ' x' : m === 2 ? ' dot' : ''}`}
                              onClick={() => tapCell(cat.key, s, v)}
                              role="button"
                              aria-label={`${name} / ${cat.vals[v]}: ${m === 0 ? 'blank' : m === 1 ? 'impossible' : 'confirmed'}`}
                            >{m === 1 ? '✗' : m === 2 ? '●' : ''}</td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}
            </div>

            {verdict && (
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: verdict.soft ? COLORS.faded : COLORS.rust, marginBottom: 10, lineHeight: 1.45 }}>
                {verdict.msg}
              </div>
            )}
            {playing && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <button type="button" className="al-btn primary" onClick={accuse}><Search size={14} strokeWidth={2.6} /> Check my accusation</button>
                <button type="button" className="al-btn" onClick={resetBoards}><Eraser size={14} /> Reset boards</button>
                {g.wrong >= 3 && (
                  <button type="button" className="al-btn" style={{ borderColor: '#c3c8cf', color: COLORS.faded }} onClick={reveal}>Reveal (ends the day)</button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* result */}
        {!playing && (
          <>
            <div style={{ maxWidth: 472, margin: '8px 0 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1.5px solid rgba(28,30,36,0.18)', borderRadius: 10, padding: '12px 14px' }}>
                <span style={{ fontFamily: MONO, fontSize: 32, fontWeight: 500, color: won ? COLORS.green : g.status === 'done' ? COLORS.ink : COLORS.rust, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em', flex: '0 0 auto' }}>{score}/{TOTAL}</span>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.ink, lineHeight: 1.45 }}>
                  {g.status === 'done'
                    ? (won ? 'Case closed — a first-try accusation.' : `Case closed with ${g.wrong} wrong accusation${g.wrong === 1 ? '' : 's'}.`)
                    : 'The trail went cold — the culprit walks tonight.'}
                  {' '}<span style={{ color: COLORS.faded, fontWeight: 600 }}>{elapsed}</span>
                </span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
              {isTodays ? (
                <>
                  {countdown ? <>A new case opens in <b style={{ color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{countdown}</b>.</> : 'A new case opens at midnight Eastern.'}
                  {prevPuzzle && (
                    <>
                      {' '}Meanwhile:{' '}
                      <a href={`/alibi?p=${prevPuzzle.num}`} style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>
                        reopen yesterday&rsquo;s case &rarr;
                      </a>
                    </>
                  )}
                </>
              ) : (
                <>
                  You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                  <a href="/alibi" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s case &rarr;</a>
                  {' · '}
                  <a href="/daily" style={{ color: COLORS.faded, fontWeight: 700, textDecoration: 'underline' }}>All daily puzzles</a>
                </>
              )}
            </p>
          </>
        )}

        {focusMode && (
          <div style={{ maxWidth: 640, margin: '30px auto 0', textAlign: 'center' }}>
            <button onClick={() => setShowChrome(true)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: '0.03em', color: COLORS.ink, background: 'none', border: '1.5px solid rgba(28,30,36,0.28)', borderRadius: 9, padding: '10px 20px', cursor: 'pointer' }}>Show leaderboard &amp; more</button>
            <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.faded, fontWeight: 600, marginTop: 8 }}>Other games, challenge, share &amp; leaderboard</div>
          </div>
        )}
        <div style={{ display: focusMode ? 'none' : 'block', margin: '30px auto 0', maxWidth: 640 }}>
          <DailyGamesGrid
            self="alibi"
            maxWidth={640}
            challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`}
            share={{ label: copied ? 'Copied' : 'Share This Puzzle', onClick: copyShare }}
            divider
          />
          {mobileUi && !standalone && (
            <button onClick={a2hsClick} style={{ marginTop: 10, width: '100%', fontFamily: SANS, fontSize: 13.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 800, height: 54, borderRadius: 10, border: 'none', background: COLORS.accent, color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, whiteSpace: 'nowrap' }}>
              <Smartphone size={15} strokeWidth={2.5} /> Add to Home Screen
            </button>
          )}
        </div>
        {showA2hsHelp && (
          <div onClick={() => setShowA2hsHelp(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,22,28,0.55)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, maxWidth: 430, width: '100%', padding: '22px 22px 16px', fontFamily: SANS, border: '1.5px solid rgba(20,22,28,0.12)' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Alibi to your Home Screen</div>
              {isIosDevice() ? (
                <ol style={{ margin: '0 0 4px', paddingLeft: 20, color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  <li>Tap the <b>Share</b> button in Safari&apos;s toolbar.</li>
                  <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                  <li>Tap <b>Add</b> &mdash; the tile opens today&apos;s case, every day.</li>
                </ol>
              ) : (
                <p style={{ margin: '0 0 4px', color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  Open your browser&apos;s menu and choose <b>Add to Home Screen</b> (or <b>Install app</b>). The tile opens today&apos;s case, every day.
                </p>
              )}
              <button onClick={() => setShowA2hsHelp(false)} style={{ marginTop: 10, fontFamily: SANS, fontSize: 12.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700, height: 44, width: '100%', borderRadius: 10, border: 'none', background: COLORS.ink, color: '#fff', cursor: 'pointer' }}>Got it</button>
            </div>
          </div>
        )}
        {!focusMode && !identity && (
          <div style={{ margin: '18px auto 0', maxWidth: 640 }}>
            <JoinLeaderboardForm hideIcon heading="See your stats and join the leaderboard" identity={identity} onJoined={(id) => { setIdentity(id); if (id && id.username) setPlayer((p) => p || { name: id.username, rank: null }); }} />
          </div>
        )}

        {/* your stats — sits directly above the leaderboard */}
        {!focusMode && identity && (
        <div style={{ maxWidth: 640, margin: '20px auto 0' }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.faded, marginBottom: 9 }}>Your stats</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { n: myStats.cur, l: 'Streak' },
              { n: myStats.played, l: 'Played' },
              { n: myStats.played ? `${Math.round((myStats.perfect / myStats.played) * 100)}%` : '—', l: 'First Try' },
              { n: myStats.max, l: 'Best Streak' },
            ].map((st, i) => (
              <div key={i} style={{ flex: '1 1 0', minWidth: 54, background: '#fff', border: '1px solid rgba(28,30,36,0.12)', borderRadius: 7, padding: '6px 5px', textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.ink, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{st.n}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.faded, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>{st.l}</div>
              </div>
            ))}
          </div>
        </div>
        )}
        <div id="daily-leaderboard" style={{ display: focusMode ? 'none' : 'block', maxWidth: 640, margin: '26px auto 0', background: '#fff', border: '1.5px solid rgba(20,22,28,0.12)', borderRadius: 12, padding: '14px 16px' }}>
          <DailyCombinedLeaderboard todayKey="alibi" identity={identity} quizId={PUZZLE.quizId} />
        </div>
        </div>
      </div>

      {/* the end-of-game popup: the shared DailyEndCard as a dismissible modal */}
      {!playing && !endClosed && (
        <DailyEndCard
          modal
          self="alibi"
          won={won}
          headline={g.status === 'done' ? <>Case closed</> : <>The case went cold</>}
          subline={<>Alibi #{PUZZLE.num} &middot; {score}/{TOTAL} &middot; {g.wrong} wrong accusation{g.wrong === 1 ? '' : 's'} &middot; {elapsed}</>}
          onShare={copyShare}
          shareLabel={copied ? 'Copied' : 'Share Result'}
          onReplay={resetGame}
          onClose={() => setEndClosed(true)}
        />
      )}

      <DuelBanner token={duelToken} info={duelInfo} submitted={duelSubmitted} />

      {toast && (
        <div style={{ position: 'fixed', left: '50%', bottom: 26, transform: 'translateX(-50%)', background: COLORS.ink, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 13.5, padding: '10px 18px', borderRadius: 9, zIndex: 60, boxShadow: '0 6px 18px rgba(20,22,28,0.25)', maxWidth: '86vw', textAlign: 'center' }}>
          {toast}
        </div>
      )}

      {/* help modal */}
      {showHelp && (
        <div onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(20,22,28,0.55)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, background: COLORS.cream, borderRadius: 12, border: `2px solid ${COLORS.ink}`, padding: '20px 22px', fontFamily: SANS, maxHeight: '86vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 21, fontWeight: 800, color: COLORS.ink }}>How to play</div>
              <button onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} aria-label="Close" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded }}><X size={20} /></button>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
              <p style={{ margin: '0 0 9px' }}>Four guests, four rooms, four departure times, four items. Every witness statement is <b>true</b>, and together they pin down exactly one arrangement.</p>
              <p style={{ margin: '0 0 9px' }}>Work the three boards: tap a cell to cycle blank &rarr; <b>✗</b> (impossible) &rarr; <b>●</b> (confirmed). Each suspect gets exactly one ● per board. Leave auto-✗ on and marking a ● crosses off its row and column for you.</p>
              <p style={{ margin: '0 0 9px' }}>When all <b>12 facts</b> are confirmed, check your accusation. A first-try accusation is a perfect 12 &mdash; each wrong accusation costs 2.</p>
              <p style={{ margin: 0 }}>Ties on the daily board break by fewest wrong accusations, then fastest time. A new case opens at midnight Eastern.</p>
            </div>
            <button className="al-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: '#fff' }}>Play</button>
          </div>
        </div>
      )}

      {/* About Alibi — crawlable prose for search, server-rendered */}
      <section style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2, maxWidth: 640, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Alibi</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Alibi is a free daily logic puzzle from Source of Truths &mdash; an Einstein-style deduction game dressed as a nightly whodunit. Something has vanished from the manor, and four guests were each alone in a different room, each left at a different hour, and each carried one curious item. The witness statements are all true; the detective work is yours.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Fill the three deduction boards the way a pencil-and-paper logician would: cross off what a statement rules out, confirm what elimination forces, and let the ✗s corner the ●s. Every case is generated with a constraint solver and machine-verified to have exactly one solution, so a careful chain of inference always closes the case &mdash; no guessing, no leaps.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new case opens every day at midnight Eastern. No app, no signup &mdash; play free in your browser, keep a streak, and race the daily leaderboard. More dailies: <a href="/cipher" style={{ color: COLORS.ink, fontWeight: 800 }}>Cipher</a>, our daily cryptarithm, <a href="/links" style={{ color: COLORS.ink, fontWeight: 800 }}>Links</a>, our hidden-threads game, and <a href="/suds" style={{ color: COLORS.ink, fontWeight: 800 }}>Suds</a>, our daily sudoku.
        </p>
      </section>

      <div style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2 }}><Footer /></div>
    </div>
  );

  function copyShare() {
    const solvedBit = g.status === 'done'
      ? `🔎 Solved in ${elapsed} · ${g.wrong} wrong accusation${g.wrong === 1 ? '' : 's'}`
      : g.status === 'lost' ? '🕯️ The case went cold' : '🕵️ Still on the case…';
    const streakBit = isTodays && myStats.cur >= 2 && g.status !== 'playing' ? ` · streak ${myStats.cur}` : '';
    const text = playing
      ? `Alibi #${PUZZLE.num} — the nightly whodunit from Source of Truths.\nsourceoftruths.com/alibi${isTodays ? '' : `?p=${PUZZLE.num}`}`
      : `Alibi — Case #${PUZZLE.num}\n${solvedBit}${streakBit}\nsourceoftruths.com/alibi${isTodays ? '' : `?p=${PUZZLE.num}`}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.share && isMobileDevice()) {
        navigator.share({ text }).catch(() => {});
        return;
      }
    } catch (e) {}
    try {
      navigator.clipboard?.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    } catch (e) {}
  }
}

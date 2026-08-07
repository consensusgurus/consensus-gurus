'use client';

// Anon — the daily clueless acrostic, and the 50th game on the roster.
//
// A passage sits in the grid, one box per letter, and every box ALSO belongs to
// one answer in the bank below. So a letter typed in either half appears in the
// other at the same instant: the two halves are the same letters seen twice.
// There are no clues. What you get is a length and, on some answers, a category.
//
// THE BANK IS IN TWO PARTS, and that is the whole design.
//   spine  the first `spine` answers. Their FIRST letters spell the author, which
//          is the payoff and the reason the game is called Anon: the passage
//          arrives unattributed and you end by naming who wrote it.
//   free   the rest. No initial to obey, which is what leaves room for the
//          closed categories, and closed categories are the way into the board.
//
// WHY SOME ANSWERS HAVE NO CATEGORY. A category is only worth printing when a
// solver can enumerate it: every category here admits at most four words at that
// length, so 'planet, 5' is earth or venus and nothing else. Anything looser
// ('verb', 'noun') is noise dressed up as help, so those answers show no category
// at all rather than a fake one. Roughly half the board is open by design.
//
// WHY THERE IS NO CHECK BUTTON (owner, 2026-08-07). A wrong answer stops the
// passage reading as English, so the puzzle already tells you. A confirm button
// would make guess-and-check optimal on exactly the closed categories that
// provide the cold start: 'planet, 5' is a coin flip you could just flip. The
// game's own feedback is the feedback.
//
// Same daily plumbing as the rest of the roster: banked days gated by Eastern
// date on the server, per-day localStorage saves, /anon?p=N archive pinning,
// streaks and stats, and the shared /api/quiz/* board flow.

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, X, Flag, Delete } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import useDuelContext, { DuelBanner } from '../quiz/[id]/useDuelContext';
import useIsMobile from '../quiz/[id]/useIsMobile';
import DailyGamesGrid from '../DailyGamesGrid';
import DailyEndCard from '../DailyEndCard';
import DailyChrome from '../DailyChrome';
import DailyBoardPanel from '../quiz/[id]/DailyBoardPanel';
import useAbandonFlush from '../quiz/[id]/useAbandonFlush';
import DailyMasthead from '../DailyMasthead';
import DailyRules from '../DailyRules';
import { isMobileDevice } from '@/lib/is-mobile';
import { T } from '@/lib/theme';

const COLORS = {
  ink: T.ink,
  faded: T.muted,
  accent: '#8c2f39',        // Anon identity — book cloth
  accentSoft: '#fdf2f3',
  accentDeep: '#6d2029',
  green: T.successDeep,
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const HELP_KEY = 'sot_anon_help_seen';
const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

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
function getAnonId() {
  try {
    let a = localStorage.getItem('sot_quiz_anon');
    if (!a) { a = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('sot_quiz_anon', a); }
    return a;
  } catch (e) { return ''; }
}

const freshState = () => ({ v: 1, fill: null, t0: null, tEnd: null, status: 'playing' });
const EMPTY_BOARD = { plays: 0, best: null, leaderboard: [] };

// ── stats (same shape every daily uses) ──────────────────────────────────────
const STATS_KEY = 'sot_anon_stats';
function getStats() {
  try { const s = JSON.parse(localStorage.getItem(STATS_KEY)); return s && s.byNum ? s : { byNum: {} }; }
  catch (e) { return { byNum: {} }; }
}
function recordStat(num, rec) {
  const s = getStats();
  const s2 = { ...s, byNum: { ...s.byNum, [num]: rec } };
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s2)); } catch (e) {}
  return s2;
}
function deriveStats(stats, todayNum) {
  if (!stats) return { played: 0, wins: 0, cur: 0, max: 0 };
  const byNum = stats.byNum || {};
  const nums = Object.keys(byNum).map(Number).sort((a, b) => a - b);
  const played = nums.length;
  const wins = nums.filter((n) => byNum[n].won).length;
  let cur = 0;
  for (let n = todayNum; n >= 1; n--) {
    const r = byNum[n];
    if (!r) { if (n === todayNum) continue; break; }
    if (!r.won) break;
    cur++;
  }
  let max = 0, run = 0, prev = null;
  for (const n of nums) {
    if (!byNum[n].won) { run = 0; prev = n; continue; }
    run = prev !== null && n === prev + 1 ? run + 1 : 1;
    if (run > max) max = run;
    prev = n;
  }
  return { played, wins, cur, max: Math.max(max, cur) };
}

export default function AnonClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const A = PUZZLE.a;
  const TOTAL = A.length;
  const STORE_KEY = `sot_anon_${PUZZLE.num}`;
  const mobile = useIsMobile();

  // The passage's letter cells, and the map from a cell to the answer that owns
  // it. Both halves render from this one map, which is what keeps them in step.
  const { sol, owner, oidx, N, tokens } = useMemo(() => {
    const chars = [...PUZZLE.q];
    const sol = [], owner = [], oidx = [];
    A.forEach((a, ai) => a.c.forEach((n, k) => { sol[n] = a.w[k]; owner[n] = ai; oidx[n] = k; }));
    // tokens: the passage split into words, each a list of {cell} or {punc}
    const tokens = []; let word = null, ci = 0;
    for (const ch of chars) {
      if (ch === ' ') { word = null; continue; }
      if (!word) { word = []; tokens.push(word); }
      if (/[a-z]/i.test(ch)) word.push({ n: ci++ });
      else word.push({ p: ch });
    }
    return { sol, owner, oidx, N: sol.length, tokens };
  }, [PUZZLE, A]);

  const [g, setG] = useState(freshState);
  const [cur, setCur] = useState(A[0].c[0]);
  const [view, setView] = useState('q');          // mobile only: passage or bank
  const [showHelp, setShowHelp] = useState(false);
  const [gateRules, setGateRules] = useState(false);
  const [endClosed, setEndClosed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [identity, setIdentity] = useState(null);
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();
  const { duelToken, duelInfo, duelSubmitted } = useDuelContext(PUZZLE.quizId, searchParams);
  const viewedRef = useRef(false);
  const cellRefs = useRef({});

  const fill = g.fill || new Array(N).fill('');
  const playing = g.status === 'playing';
  const preStart = playing && !g.t0;
  const curAnswer = owner[cur];

  const solved = useMemo(
    () => A.map((a) => a.c.every((n, k) => fill[n] === a.w[k])),
    [A, fill]
  );
  const nSolved = solved.filter(Boolean).length;
  const filledCount = fill.filter(Boolean).length;
  const won = nSolved === TOTAL;

  // The spine reads out as you get first letters. This is the payoff, so it is
  // always on screen rather than tucked behind the bank.
  const spineLetters = useMemo(
    () => A.slice(0, PUZZLE.spine).map((a) => fill[a.c[0]] || ''),
    [A, PUZZLE.spine, fill]
  );

  // ---- persistence ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.v === 1 && Array.isArray(saved.fill) && saved.fill.length === N) {
          setG({ ...freshState(), ...saved });
        }
      }
      setGateRules(!localStorage.getItem(HELP_KEY));
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
        const done = g.status !== 'playing';
        if (done || g.t0) localStorage.setItem('sot_anon_day', JSON.stringify({ d: etToday(), done }));
        else localStorage.removeItem('sot_anon_day');
      }
    } catch (e) {}
  }, [g, hydrated, STORE_KEY, PUZZLE, puzzles]);

  // Live clock, ticked from state rather than read during render.
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    if (!playing || !g.t0 || g.tEnd) return undefined;
    setNowTick(Date.now());
    const iv = setInterval(() => setNowTick(Date.now()), 500);
    return () => clearInterval(iv);
  }, [playing, g.t0, g.tEnd]);
  const elapsed = g.t0 ? fmtTime((g.tEnd || nowTick) - g.t0) : '0:00';

  // ---- metrics + leaderboard ----
  useEffect(() => {
    try {
      const id = JSON.parse(localStorage.getItem('sot_quiz_identity'));
      if (id && id.email) setIdentity(id);
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

  const REC_KEY = `sot_anon_rec_${PUZZLE.num}`;
  const abandon = useAbandonFlush(() => {
    if (!playing || !g.t0 || !filledCount) return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - g.t0) / 1000)));
    try { localStorage.setItem(REC_KEY, '1'); } catch (e) {}
    return { quizId: PUZZLE.quizId, score: nSolved, total: TOTAL, correct: nSolved, guessesUsed: 0, timeElapsed: el, abandoned: true, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') };
  });

  const postResult = useCallback((g2, count) => {
    abandon.markFlushed();
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    try { setStats(recordStat(PUZZLE.num, { s: count, t: TOTAL, g: 0, won: count === TOTAL })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
        // guessesUsed is always 0: Anon has no checks and no hints, so two
        // players who both finish are separated by the clock alone.
        body: JSON.stringify({ quizId: PUZZLE.quizId, score: count, total: TOTAL, correct: count, guessesUsed: 0, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
      })
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
        .catch(() => {});
    } catch (e) {}
  }, [abandon, PUZZLE, TOTAL, identity]);

  function start() {
    setG((c) => (c.t0 ? c : { ...c, t0: Date.now(), fill: c.fill || new Array(N).fill('') }));
    try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {}
    setGateRules(false);
  }

  // ---- input ----
  const focusCell = useCallback((n) => {
    setCur(n);
    const el = cellRefs.current[`q${n}`];
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, []);

  const move = useCallback((n, d) => {
    const a = A[owner[n]];
    const i = oidx[n] + d;
    // Walking off the end of an answer steps along the PASSAGE, not into the
    // next bank row: you are reading a sentence, so that is the direction the
    // eye is already going.
    return (i >= 0 && i < a.c.length) ? a.c[i] : Math.max(0, Math.min(N - 1, n + d));
  }, [A, owner, oidx, N]);

  const type = useCallback((ch) => {
    if (!playing || !g.t0) return;
    setG((c) => {
      const f = (c.fill || new Array(N).fill('')).slice();
      f[cur] = ch;
      const next = { ...c, fill: f };
      const done = A.every((a) => a.c.every((n, k) => f[n] === a.w[k]));
      if (done) {
        next.status = 'done';
        next.tEnd = Date.now();
        postResult(next, TOTAL);
      }
      return next;
    });
    focusCell(move(cur, 1));
  }, [playing, g.t0, cur, N, A, TOTAL, postResult, focusCell, move]);

  const backspace = useCallback(() => {
    if (!playing || !g.t0) return;
    setG((c) => {
      const f = (c.fill || new Array(N).fill('')).slice();
      if (f[cur]) { f[cur] = ''; return { ...c, fill: f }; }
      return c;
    });
    if (!fill[cur]) focusCell(move(cur, -1));
  }, [playing, g.t0, cur, N, fill, focusCell, move]);

  useEffect(() => {
    const onKey = (e) => {
      if (!playing || !g.t0 || e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[a-zA-Z]$/.test(e.key)) { type(e.key.toUpperCase()); e.preventDefault(); }
      else if (e.key === 'Backspace') { backspace(); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { focusCell(move(cur, 1)); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { focusCell(move(cur, -1)); e.preventDefault(); }
      else if (e.key === 'Tab') {
        const d = e.shiftKey ? -1 : 1;
        focusCell(A[(owner[cur] + TOTAL + d) % TOTAL].c[0]); e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playing, g.t0, cur, type, backspace, focusCell, move, A, owner, TOTAL]);

  function giveUp() {
    setG((c) => {
      const next = { ...c, fill: sol.slice(), status: 'gaveup', tEnd: Date.now() };
      postResult(next, nSolved);
      return next;
    });
  }
  function resetGame() {
    setG({ ...freshState(), fill: new Array(N).fill('') });
    setEndClosed(false);
    setCur(A[0].c[0]);
    try { localStorage.removeItem(REC_KEY); } catch (e) {}
  }
  function copyShare() {
    const line = won
      ? `Anon #${PUZZLE.num} — the clueless acrostic\nNamed it in ${elapsed}`
      : `Anon #${PUZZLE.num} — the clueless acrostic\n${nSolved}/${TOTAL} answers`;
    try {
      navigator.clipboard.writeText(`${line}\nmindloftdaily.com/anon`);
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    } catch (e) {}
  }

  const isTodays = PUZZLE.num === pickPuzzle(puzzles, null).num;
  const myStats = deriveStats(stats, pickPuzzle(puzzles, null).num);

  // Cell size fitted to the viewport, like Strata's tiles: a 124-letter passage
  // has to lay out on a phone without becoming unreadable or overflowing.
  const [cw, setCw] = useState(26);
  useEffect(() => {
    const fit = () => {
      const avail = Math.min(window.innerWidth - 30, 720);
      setCw(Math.max(21, Math.min(27, Math.floor(avail / 14) - 3)));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  const ch = Math.round(cw * 1.26);

  const cellCls = (n) => {
    const c = ['an-cell'];
    if (owner[n] === curAnswer) c.push('mine');
    if (n === cur) c.push('on');
    if (!playing && fill[n] !== sol[n]) c.push('miss');
    return c.join(' ');
  };

  function Cell({ n, small }) {
    return (
      <div
        ref={(el) => { if (el) cellRefs.current[`q${n}`] = el; }}
        className={cellCls(n)}
        style={{ width: small ? cw - 2 : cw, height: small ? ch - 2 : ch }}
        onClick={() => focusCell(n)}
      >{fill[n] || ''}</div>
    );
  }

  function BankRow({ ai }) {
    const a = A[ai];
    const isSpine = ai < PUZZLE.spine;
    return (
      <div className={`an-row${owner[cur] === ai ? ' on' : ''}`}>
        <div className="an-rowhead">
          {isSpine && <span className="an-tag">{spineLetters[ai] || '?'}</span>}
          <span className={a.cat ? 'an-cat' : 'an-cat open'}>{a.cat || 'no category'}</span>
          <span className="an-len">{a.w.length}</span>
          {solved[ai] && <span className="an-ok">done</span>}
        </div>
        <div className="an-boxes">{a.c.map((n) => <Cell key={n} n={n} small />)}</div>
      </div>
    );
  }

  const passagePanel = (
    <div className="an-quote">
      {tokens.map((tk, i) => (
        <div className="an-word" key={i}>
          {tk.map((t, j) => (t.p ? <span className="an-punc" key={j}>{t.p}</span> : <Cell key={j} n={t.n} />))}
        </div>
      ))}
    </div>
  );

  const banksPanel = (
    <div className="an-banks">
      <div>
        <div className="an-bhead">The spine &middot; {PUZZLE.spine}<span>first letters spell who wrote it</span></div>
        {A.slice(0, PUZZLE.spine).map((a, i) => <BankRow key={i} ai={i} />)}
      </div>
      <div>
        <div className="an-bhead">The free bank &middot; {TOTAL - PUZZLE.spine}<span>no initial to obey</span></div>
        {A.slice(PUZZLE.spine).map((a, i) => <BankRow key={i + PUZZLE.spine} ai={i + PUZZLE.spine} />)}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: T.surface, position: 'relative' }}>
      <Grain />
      <DailyChrome slug="anon" name="Anon" collapsed={!!g.t0} />
      <div className="an-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.an-wrap{padding-left:10px !important;padding-right:10px !important;}}
          .an-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.accentDeep};background:var(--white);color:${COLORS.accentDeep};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .an-btn:hover{background:${COLORS.accentSoft};}
          .an-btn.primary{background:${COLORS.accent};border-color:${COLORS.accent};color:var(--white);}
          .an-btn.primary:hover{background:${COLORS.accentDeep};}
          .an-quote{display:flex;flex-wrap:wrap;gap:9px 13px;}
          .an-word{display:flex;gap:3px;}
          .an-cell{border:1px solid rgba(28,30,36,0.18);border-bottom-width:2px;border-radius:4px;background:var(--white);
            display:flex;align-items:center;justify-content:center;font-family:${SANS};font-weight:800;font-size:15px;
            color:${COLORS.ink};cursor:pointer;flex:none;transition:background 90ms,border-color 90ms;}
          .an-cell.mine{background:${COLORS.accentSoft};border-color:#e3b9be;}
          .an-cell.on{outline:2px solid ${COLORS.accent};outline-offset:-2px;background:#fbe4e6;}
          .an-cell.miss{background:#fee2e2;border-color:#dc2626;color:#7f1d1d;}
          .an-punc{align-self:center;color:#b6bcc7;font-weight:800;width:6px;text-align:center;}
          .an-banks{display:grid;grid-template-columns:1.25fr 1fr;gap:14px 26px;}
          @media(max-width:900px){.an-banks{grid-template-columns:1fr;}}
          .an-bhead{font-family:${MONO};font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:${COLORS.faded};
            margin:0 0 9px;display:flex;justify-content:space-between;gap:10px;}
          .an-bhead span{color:#c3c8d1;}
          .an-row{border:1px solid transparent;border-radius:8px;padding:4px 6px;margin-bottom:7px;}
          .an-row.on{border-color:#e3b9be;background:${COLORS.accentSoft};}
          .an-rowhead{display:flex;align-items:baseline;gap:8px;margin-bottom:3px;}
          .an-tag{font-weight:900;font-size:13px;color:${COLORS.accent};width:13px;}
          .an-cat{font-family:${MONO};font-size:10px;letter-spacing:0.07em;text-transform:uppercase;color:#4b5563;}
          .an-cat.open{color:#c3c8d1;font-style:italic;}
          .an-len{margin-left:auto;font-family:${MONO};font-size:10px;color:#c3c8d1;}
          .an-ok{font-family:${MONO};font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:${COLORS.green};}
          .an-boxes{display:flex;gap:3px;flex-wrap:wrap;}
          .an-seg{display:flex;border:1px solid rgba(28,30,36,0.14);border-radius:9px;overflow:hidden;margin-bottom:12px;}
          .an-seg button{flex:1;border:0;background:var(--white);padding:10px 0;font-family:${SANS};font-weight:800;font-size:13.5px;color:#8b93a1;cursor:pointer;}
          .an-seg button.on{background:${COLORS.accent};color:var(--white);}
          .an-dock{position:sticky;bottom:0;z-index:6;background:#0f1f2e;border-radius:10px 10px 0 0;padding:9px 11px 10px;margin-top:12px;}
          .an-dockhead{font-family:${MONO};font-size:10px;letter-spacing:0.09em;text-transform:uppercase;color:#8fa6cc;display:flex;align-items:center;gap:8px;}
          .an-nav{margin-left:auto;display:flex;gap:6px;}
          .an-nav button{width:26px;height:26px;border-radius:6px;border:1px solid #2b4675;background:#16294a;color:#dbe9ff;cursor:pointer;font-weight:800;}
          .an-dockbody{margin-top:7px;display:flex;gap:3px;overflow-x:auto;padding-bottom:2px;}
          .an-dcell{width:21px;height:26px;border-radius:4px;background:#16294a;border:1px solid #2b4675;display:flex;align-items:center;
            justify-content:center;font-weight:800;font-size:13px;color:var(--white);flex:none;}
          .an-dcell.on{background:${COLORS.accent};border-color:#b04a55;}
          .an-kb{display:flex;flex-direction:column;gap:5px;background:#e5e8ef;border-radius:0 0 10px 10px;padding:7px 4px 9px;}
          .an-kr{display:flex;gap:5px;justify-content:center;}
          .an-kr button{flex:1;max-width:34px;height:42px;border:0;border-radius:6px;background:var(--white);font-family:${SANS};
            font-weight:800;font-size:15px;box-shadow:0 1px 0 #b9bfcb;cursor:pointer;}
          .an-kr button.wide{max-width:54px;font-size:11px;background:#c9cfdb;}
          .an-spine{display:flex;gap:4px;align-items:center;flex-wrap:wrap;margin:0 0 14px;}
          .an-spine i{width:22px;height:28px;border-radius:4px;background:${COLORS.accentSoft};border:1px solid #e3b9be;
            display:flex;align-items:center;justify-content:center;font-style:normal;font-weight:900;font-size:15px;color:${COLORS.accent};}
          .an-spine i.blank{color:#dcc6c9;background:var(--white);border-color:rgba(28,30,36,0.1);}
        `}</style>

        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <DailyMasthead
            slug="anon"
            num={PUZZLE.num}
            dateLabel={PUZZLE.dateLabel}
            accent={COLORS.accent}
            blockGap={4}
            helpTop={8}
            onHelp={() => setShowHelp(true)}
            sunday={PUZZLE.sunday && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: T.white, background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>Sunday Edition &middot; Longer Passage</span>}
            blocks={'ANON'.split('').map((c, i) => (
              <div key={i} style={{ width: 34, height: 34, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 19, background: i === 0 ? COLORS.accent : COLORS.ink, color: T.white, boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{c}</div>
            ))}
          />

          {preStart && (
            <div style={{ background: T.white, border: '1px solid rgba(28,30,36,0.14)', borderRadius: 12, padding: '20px 22px', margin: '4px 0 14px' }}>
              <h2 style={{ fontSize: 19, fontWeight: 900, color: COLORS.ink, margin: '0 0 8px' }}>
                A passage nobody signed, in {N} letters.
              </h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: COLORS.faded, fontWeight: 600, margin: '0 0 12px' }}>
                Every box belongs to one answer below, so a letter you type appears in both halves at once.
                There are no clues. Finish it and the first letters of the spine will have spelled out
                <b style={{ color: COLORS.accentDeep }}> who wrote it</b>.
              </p>
              {gateRules && (
                <div style={{ marginBottom: 14 }}>
                  <DailyRules
                    accent={COLORS.accent} accentSoft={COLORS.accentSoft} accentDeep={COLORS.accentDeep}
                    lead="Fill the passage. The bank fills it, and it fills the bank."
                    steps={[
                      <>Type in either half. The same letter lands in the other one, because it is the same letter.</>,
                      <>Some answers carry a <b>category</b> you can list in your head: <i>planet, 5</i> is earth or venus. Those are the way in.</>,
                      <>About half carry <b>no category at all</b>. Those come from the passage reading as English.</>,
                      <>No checks and no hints. A wrong answer stops the passage making sense, which is the only tell you need.</>,
                    ]}
                    knack="Start with the sharpest category, not the passage. Eight letters land at once and the sentence opens up."
                    footer="Two players who both finish are separated by the clock."
                  />
                </div>
              )}
              <button className="an-btn primary" onClick={start}>Start</button>
              {!gateRules && <button className="an-btn" style={{ marginLeft: 8 }} onClick={() => setGateRules(true)}>Show instructions</button>}
            </div>
          )}

          {!preStart && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '2px 0 10px', flexWrap: 'wrap' }}>
                <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700, color: COLORS.faded }}>
                  {nSolved}/{TOTAL} answers &middot; {filledCount}/{N} letters &middot; {elapsed}
                </div>
              </div>

              <div className="an-spine">
                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded, marginRight: 4 }}>Signed</span>
                {spineLetters.map((c, i) => <i key={i} className={c ? '' : 'blank'}>{c || '·'}</i>)}
              </div>

              {mobile && (
                <div className="an-seg">
                  <button className={view === 'q' ? 'on' : ''} onClick={() => setView('q')}>Passage</button>
                  <button className={view === 'b' ? 'on' : ''} onClick={() => setView('b')}>Bank</button>
                </div>
              )}

              {(!mobile || view === 'q') && (
                <div style={{ background: T.white, border: '1px solid rgba(28,30,36,0.12)', borderRadius: 12, padding: '16px 16px 14px', marginBottom: 16 }}>
                  {passagePanel}
                </div>
              )}
              {(!mobile || view === 'b') && (
                <div style={{ background: T.white, border: '1px solid rgba(28,30,36,0.12)', borderRadius: 12, padding: '16px 18px', marginBottom: 16 }}>
                  {banksPanel}
                </div>
              )}

              {playing && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <button className="an-btn" style={{ marginLeft: 'auto' }} onClick={giveUp}><Flag size={15} />Give up</button>
                </div>
              )}

              {/* The dock is the other half of the puzzle, for the cell you are on.
                  On a phone the two halves cannot both be on screen, so this is
                  what keeps the loop alive. The keyboard is ours rather than the
                  OS one, which would resize the viewport under the dock. */}
              {mobile && playing && (
                <>
                  <div className="an-dock">
                    <div className="an-dockhead">
                      <span>{A[curAnswer].cat ? `${A[curAnswer].cat} · ${A[curAnswer].w.length}` : `no category · ${A[curAnswer].w.length}`}</span>
                      <span className="an-nav">
                        <button onClick={() => focusCell(A[(curAnswer + TOTAL - 1) % TOTAL].c[0])}>&lsaquo;</button>
                        <button onClick={() => focusCell(A[(curAnswer + 1) % TOTAL].c[0])}>&rsaquo;</button>
                      </span>
                    </div>
                    <div className="an-dockbody">
                      {A[curAnswer].c.map((n) => (
                        <div key={n} className={`an-dcell${n === cur ? ' on' : ''}`} onClick={() => focusCell(n)}>{fill[n] || ''}</div>
                      ))}
                    </div>
                  </div>
                  <div className="an-kb">
                    {ROWS.map((row, ri) => (
                      <div className="an-kr" key={ri}>
                        {ri === 2 && <button className="wide" onClick={backspace} aria-label="Delete"><Delete size={15} /></button>}
                        {[...row].map((c) => <button key={c} onClick={() => type(c.toUpperCase())}>{c.toUpperCase()}</button>)}
                        {ri === 2 && <button className="wide" onClick={() => focusCell(A[(curAnswer + 1) % TOTAL].c[0])}>NEXT</button>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          <div style={{ margin: '30px auto 0', maxWidth: 640 }}>
            <DailyGamesGrid
              self="anon"
              maxWidth={640}
              replay={!playing ? resetGame : null}
              challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`}
              share={{ label: copied ? 'Copied' : 'Share', onClick: copyShare }}
              light
              divider
              boardSlot={<DailyBoardPanel self="anon" quizId={PUZZLE.quizId} maxWidth={640} streak={{ current: myStats.cur, best: myStats.max }} />}
            />
          </div>
        </div>
      </div>

      {!playing && !endClosed && (
        <DailyEndCard
          modal
          self="anon"
          won={won}
          completed
          headline={won ? <>{PUZZLE.author}</> : <>{nSolved} of {TOTAL}</>}
          subline={<>Anon #{PUZZLE.num} &middot; {nSolved}/{TOTAL} answers &middot; {elapsed}</>}
          onShare={copyShare}
          shareLabel={copied ? 'Copied' : 'Share Result'}
          onReplay={resetGame}
          onClose={() => setEndClosed(true)}
        />
      )}

      <DuelBanner token={duelToken} info={duelInfo} submitted={duelSubmitted} />

      {showHelp && (
        <div onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(20,22,28,0.55)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: T.white, borderRadius: 13, padding: '20px 22px', maxWidth: 480, fontFamily: SANS }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
              <HelpCircle size={19} color={COLORS.accent} />
              <b style={{ fontSize: 17, color: COLORS.ink }}>How Anon works</b>
              <button onClick={() => setShowHelp(false)} aria-label="Close" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded }}><X size={20} /></button>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: COLORS.ink, margin: '0 0 10px' }}>
              The passage arrives unsigned. Every box in it belongs to exactly one answer in the bank,
              so the two halves are the same letters seen twice and a letter typed in either one shows up
              in the other. There are no clues at all.
            </p>
            <ul style={{ fontSize: 13.5, lineHeight: 1.7, color: COLORS.ink, margin: '0 0 12px', paddingLeft: 20 }}>
              <li>The <b>spine</b> is the first {PUZZLE.spine} answers. Their first letters spell the author.</li>
              <li>The <b>free bank</b> obeys no first letter, which is where most of the categories live.</li>
              <li>A printed category is always one you can recite: it admits four words at most at that length.</li>
              <li>An answer marked <i>no category</i> has none. It comes from the passage, not the bank.</li>
              <li>No checks, no hints. A wrong answer makes the passage stop reading as English.</li>
              <li>Click any box and type. Arrow keys walk the passage, Tab jumps to the next answer.</li>
            </ul>
            <button className="an-btn primary" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }}>Play</button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

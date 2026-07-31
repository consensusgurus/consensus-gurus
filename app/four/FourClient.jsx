'use client';

// Four — the daily Connect Four position.
//
// Each day: a real position with YOU to move and a forced win. Weekdays take
// four of your moves, Sundays five. Exactly ONE column still wins, and here is
// the part that makes it bite: a wrong drop is NOT refused. The game plays on
// against a perfect engine, so the win never comes back and you spend the rest
// of the board trying to hold a draw.
//
// The engine is app/four/c4.js, an exact solver (negamax, alpha-beta,
// transposition table). It answers every position, on or off the puzzle line,
// which is why a losing drop can be allowed to play out at all. Its replies are
// deterministic: among equally stubborn defences it breaks ties with an order
// derived from the puzzle id, so every player faces the same game and the
// leaderboard compares like with like.
//
// Score is the outcome: 10 for the win, 4 for a draw, 1 for a loss, 0 for
// giving up. Ties break on fewest wrong drops, then fastest time.
//
// Same daily plumbing as Mate/Etch/Hedge: banked boards gated by Eastern date on
// the server (app/four/page.js), per-puzzle localStorage saves, /four?p=N
// archive pinning, streaks + stats, and the shared /api/quiz/* board flow.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { X, Lightbulb, Eye, Smartphone } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import useDuelContext, { DuelBanner } from '../quiz/[id]/useDuelContext';
import JoinLeaderboardForm from '../quiz/[id]/JoinLeaderboardForm';
import DailyGamesGrid from '../DailyGamesGrid';
import DailyEndCard from '../DailyEndCard';
import DailyTopNav from '../DailyTopNav';
import DailyBoardPanel from '../quiz/[id]/DailyBoardPanel';
import { isMobileDevice } from '@/lib/is-mobile';
import useAbandonFlush from '../quiz/[id]/useAbandonFlush';
import { withRef } from '@/lib/referrals';
import { notifyShareCredit } from '../ShareCreditPop';
import DailyMasthead from '../DailyMasthead';
import {
  deserialize, play, legalMoves, winsAt, winningCells, scoreMoves, engineMove,
  idOrder, movesToWin, COLS, ROWS, SIZE,
} from './c4';

const COLORS = {
  cream: '#f7f8fa',
  paper: '#eceef1',
  ink: '#1c1e24',
  ember: '#0e1d40',
  rust: '#c0392b',
  faded: '#262b35',
  accent: '#1e3a8a',       // Four identity — the board blue
  accentSoft: '#e8eefc',
  green: '#15803d',
};
// The board itself, in the colours everyone already knows: a blue grid, red
// discs for you, yellow for the engine.
const BOARD_BLUE = '#1e3a8a';
const BOARD_BLUE_DARK = '#152a63';
const HOLE = '#f1f3f7';
const RED = '#d62828';
const RED_DARK = '#a11d1d';
const YELLOW = '#f4c02c';
const YELLOW_DARK = '#c08f0e';

const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const HELP_KEY = 'sot_four_help_seen';
const STATS_KEY = 'sot_four_stats';

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

// ─── Personal stats + streak (localStorage), the shared daily pattern ──────
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
    const sc = Math.max(0, Math.min(10, Math.round(((m.scorePct || 0) / 100) * 10)));
    if (!changed) { rec = { ...rec }; changed = true; }
    rec[p.num] = { s: sc, t: 10, g: null, won: !!m.perfect };
  }
  if (!changed) return s;
  const s2 = { ...s, rec };
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s2)); } catch (e) {}
  return s2;
}

// ─── position helpers ──────────────────────────────────────────────────────
// The live board is rebuilt from the banked start plus the column list, so a
// save is a handful of digits and can never drift out of step with the game.
function boardFrom(cells, moves) {
  const b = deserialize(cells);
  for (const c of moves) play(b, c);
  return b;
}
const outcomeOf = (score) => (score > 0 ? 1 : score < 0 ? -1 : 0);

// The two columns the hint puts out of play: losing drops, chosen by the
// puzzle's own order so the hint is the same for everyone and survives a reload.
function hintColumns(puzzle) {
  const b = deserialize(puzzle.cells);
  const open = legalMoves(b).filter((c) => c !== puzzle.key);
  const order = idOrder(puzzle.quizId).filter((c) => open.includes(c));
  return order.slice(0, 2).sort((a, b2) => a - b2);
}

const HAPT = { ok: [7], wrong: [0, 26, 34, 26], win: [10, 40, 20, 40, 20, 60] };
function vibrate(p) { try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(p); } catch (e) {} }

function freshState() {
  return { v: 1, moves: [], errors: 0, hintUsed: false, status: 'playing', t0: null, tEnd: null, val: null, pending: null };
}

export default function FourClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const STORE_KEY = `sot_four_${PUZZLE.num}`;

  const [g, setG] = useState(() => freshState());
  const gRef = useRef(g);
  const [hoverCol, setHoverCol] = useState(null);
  const [shake, setShake] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [gateRules, setGateRules] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [armReveal, setArmReveal] = useState(false);
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
  const [showChrome, setShowChrome] = useState(false);
  const searchParams = useSearchParams();
  const { duelToken, duelInfo, duelSubmitted } = useDuelContext(PUZZLE.quizId, searchParams);
  const toastTimer = useRef(null);
  const viewedRef = useRef(false);
  const replyTimer = useRef(null);

  const moves = g.moves;
  const playing = g.status === 'playing';
  const preStart = playing && !g.t0;
  const started = playing && !!g.t0;
  const focusMode = playing && !showChrome;
  const won = g.status === 'won';
  const drawn = g.status === 'drawn';
  const errors = g.errors;
  const finalScore = won ? 10 : drawn ? 4 : g.status === 'lost' ? 1 : 0;
  // An odd move count means the engine's reply is still in flight.
  const awaitingReply = moves.length % 2 === 1;

  const pos = useMemo(() => boardFrom(PUZZLE.cells, moves), [PUZZLE, moves]);
  const lastCol = moves.length ? moves[moves.length - 1] : null;
  const lastRow = useMemo(() => (lastCol == null ? null : pos.heights[lastCol] - 1), [pos, lastCol]);
  const myTurn = playing && started && !awaitingReply && !thinking;
  // The value of the position for you, carried in state so the header can say
  // how many moves the win still needs without re-solving on every render.
  const val = g.val == null ? PUZZLE.rootScore : g.val;
  const emptyNow = SIZE - pos.plies;
  // `val` is always your value at a position where YOU are to move, so while the
  // engine's disc is still in flight the count belongs to the board one drop
  // further on. Measuring it against the current board would land half a move
  // out and print a fraction.
  const winBasis = awaitingReply ? emptyNow - 1 : emptyNow;
  const winLeft = val > 0 ? movesToWin(winBasis, val) : 0;
  const hintCols = useMemo(() => (g.hintUsed ? hintColumns(PUZZLE) : []), [g.hintUsed, PUZZLE]);

  // The four cells to light up once somebody connects.
  const winLine = useMemo(() => {
    if (playing || lastCol == null || lastRow == null || lastRow < 0) return null;
    const who = pos.cells[lastCol * ROWS + lastRow];
    if (!who || !winsAt(pos, lastCol, lastRow, who)) return null;
    return winningCells(pos, lastCol, lastRow, who);
  }, [playing, pos, lastCol, lastRow]);

  useEffect(() => { gRef.current = g; }, [g]);
  useEffect(() => {
    if (!armReveal) return undefined;
    const t = setTimeout(() => setArmReveal(false), 3500);
    return () => clearTimeout(t);
  }, [armReveal]);
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
        if (saved && saved.v === 1 && Array.isArray(saved.moves)) {
          const next = { ...freshState(), ...saved };
          gRef.current = next;
          setG(next);
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
        if (done || g.t0) localStorage.setItem('sot_four_day', JSON.stringify({ d: etToday(), done }));
        else localStorage.removeItem('sot_four_day');
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

  // ---- metrics + leaderboard (shared /api/quiz/* flow) ----
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
            if (d && Array.isArray(d.recent)) setStats((cur) => mergeServerStats(cur || getStats(), d.recent, puzzles));
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
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

  const elapsed = g.t0 ? fmtTime((g.tEnd || Date.now()) - g.t0) : '0:00';
  const isTodays = PUZZLE.num === pickPuzzle(puzzles, null).num;
  const prevPuzzle = puzzles.find((x) => x.num === PUZZLE.num - 1) || null;
  const myStats = deriveStats(stats, pickPuzzle(puzzles, null).num);

  const REC_KEY = `sot_four_rec_${PUZZLE.num}`;
  const abandon = useAbandonFlush(() => {
    const cur = gRef.current;
    const acted = cur.moves.length > 0 || cur.hintUsed;
    if (!acted || cur.status !== 'playing') return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - (cur.t0 || Date.now())) / 1000)));
    try { localStorage.setItem(REC_KEY, '1'); } catch (e) {}
    return { quizId: PUZZLE.quizId, score: 0, total: 10, correct: 0, guessesUsed: cur.errors, timeElapsed: el, abandoned: true, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') };
  });

  function postResult(g2, score) {
    abandon.markFlushed();
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    try { setStats(recordStat(PUZZLE.num, { s: score, t: 10, g: g2.errors, won: g2.status === 'won' })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: PUZZLE.quizId, score, total: 10, correct: g2.status === 'won' ? 1 : 0, guessesUsed: g2.errors, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
      })
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
        .catch(() => {});
    } catch (e) {}
  }

  function commit(next) { gRef.current = next; setG(next); }

  function startGame() {
    const cur = gRef.current;
    if (cur.t0) return;
    commit({ ...cur, t0: Date.now() });
    try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {}
  }

  function finish(g2, status) {
    const done = { ...g2, status, tEnd: Date.now() };
    if (!done.t0) done.t0 = Date.now();
    vibrate(status === 'won' ? HAPT.win : HAPT.wrong);
    postResult(done, status === 'won' ? 10 : status === 'drawn' ? 4 : status === 'lost' ? 1 : 0);
    commit(done);
  }

  // The engine answers a beat after your disc lands. The solve runs INSIDE the
  // timeout, never in the click handler, so the browser paints your drop before
  // the search blocks the thread. The same single solve does three jobs: it
  // picks the reply, it re-values the position for you, and by comparing that
  // value with the one before your drop it decides whether the drop was a
  // mistake.
  function scheduleReply(afterMoves) {
    if (replyTimer.current) clearTimeout(replyTimer.current);
    setThinking(true);
    replyTimer.current = setTimeout(() => {
      const cur = gRef.current;
      if (cur.status !== 'playing' || cur.moves.length !== afterMoves.length) { setThinking(false); return; }
      const b = boardFrom(PUZZLE.cells, cur.moves);
      if (!legalMoves(b).length) { setThinking(false); finish(cur, 'drawn'); return; }
      const em = engineMove(b, PUZZLE.quizId);
      if (!em) { setThinking(false); return; }
      const before = cur.pending == null ? outcomeOf(cur.val == null ? PUZZLE.rootScore : cur.val) : cur.pending;
      const after = outcomeOf(-em.score);
      let next = { ...cur, moves: [...cur.moves, em.col], val: -em.score, pending: null };
      if (after < before) {
        next = { ...next, errors: next.errors + 1 };
        vibrate(HAPT.wrong);
        say(before > 0 && after === 0 ? 'That lets it slip. The win is gone, a draw is still there.'
          : before > 0 ? 'That drop loses the win, and the position with it.'
          : 'That gives the game away.');
      }
      const r = b.heights[em.col];
      const engineWins = winsAt(b, em.col, r, 2);
      setThinking(false);
      if (engineWins) { finish(next, 'lost'); return; }
      const b2 = boardFrom(PUZZLE.cells, next.moves);
      if (!legalMoves(b2).length) { finish(next, 'drawn'); return; }
      commit(next);
      if (after >= before) vibrate(HAPT.ok);
    }, 430);
  }
  // A save made inside that window would restore a half-finished turn, so the
  // reply is re-scheduled whenever the board is left waiting for one.
  useEffect(() => {
    if (!hydrated || !playing || !g.t0) return undefined;
    if (moves.length % 2 === 1) scheduleReply(moves);
    return () => { if (replyTimer.current) clearTimeout(replyTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, playing, g.t0, moves.length]);

  function drop(col) {
    const cur = gRef.current;
    if (cur.status !== 'playing' || cur.moves.length % 2 === 1) return;
    const b = boardFrom(PUZZLE.cells, cur.moves);
    if (b.heights[col] >= ROWS) { setShake((k) => k + 1); return; }
    const r = b.heights[col];
    const iWin = winsAt(b, col, r, 1);
    const nextMoves = [...cur.moves, col];
    // `pending` carries what the position was worth to you BEFORE this drop, so
    // the reply timeout can tell whether the drop cost anything without having
    // to solve twice.
    const g2 = { ...cur, moves: nextMoves, pending: outcomeOf(cur.val == null ? PUZZLE.rootScore : cur.val) };
    if (!g2.t0) g2.t0 = Date.now();
    if (iWin) { finish(g2, 'won'); return; }
    vibrate(HAPT.ok);
    commit(g2);
    scheduleReply(nextMoves);
  }

  function useHint() {
    const cur = gRef.current;
    if (cur.status !== 'playing' || cur.hintUsed) return;
    const g2 = { ...cur, hintUsed: true };
    if (!g2.t0) g2.t0 = Date.now();
    commit(g2);
    say('Two columns that do not win are now greyed out. The rest is on you.');
  }

  // Give up: if the win is still there, play it out so the answer is visible on
  // the board. Either way the puzzle ends and scores nothing.
  function revealEnd() {
    const cur = gRef.current;
    let ms = cur.moves.slice();
    let b = boardFrom(PUZZLE.cells, ms);
    if (ms.length % 2 === 1) {
      const em = engineMove(b, PUZZLE.quizId);
      if (em) { ms = [...ms, em.col]; b = boardFrom(PUZZLE.cells, ms); }
    }
    let guard = 0;
    while (guard++ < 24) {
      const scored = scoreMoves(b);
      if (!scored.length) break;
      let best = null;
      for (const s of scored) if (!best || s.score > best.score) best = s;
      if (best.score <= 0) break;                       // no win left to show
      const r = b.heights[best.col];
      const iWin = winsAt(b, best.col, r, 1);
      ms = [...ms, best.col];
      b = boardFrom(PUZZLE.cells, ms);
      if (iWin) break;
      const em = engineMove(b, PUZZLE.quizId);
      if (!em) break;
      ms = [...ms, em.col];
      b = boardFrom(PUZZLE.cells, ms);
    }
    if (replyTimer.current) clearTimeout(replyTimer.current);
    setThinking(false);
    const g2 = { ...cur, moves: ms, status: 'gaveup', tEnd: Date.now() };
    if (!g2.t0) g2.t0 = Date.now();
    postResult(g2, 0);
    commit(g2);
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    if (replyTimer.current) clearTimeout(replyTimer.current);
    setThinking(false);
    commit(freshState());
    setEndClosed(false);
  }

  function shareUrl() {
    return withRef(`sourceoftruths.com/four${isTodays ? '' : `?p=${PUZZLE.num}`}`);
  }
  function shareText() {
    const g5 = won ? 5 : drawn ? 2 : g.status === 'lost' ? 1 : 0;
    const squares = (won ? '\u{1F534}' : drawn ? '\u{1F7E1}' : '⬜').repeat(Math.max(1, g5)) + '⬜'.repeat(5 - Math.max(1, g5));
    const hintBit = g.hintUsed ? ' · \u{1F4A1}' : '';
    const streakBit = isTodays && myStats.cur >= 2 ? ` · streak ${myStats.cur}` : '';
    const verdict = won ? `won in ${PUZZLE.winIn}` : drawn ? 'held a draw' : g.status === 'lost' ? 'lost it' : 'gave up';
    const missBit = g.status === 'gaveup' ? '' : ` · ${errors === 0 ? 'no wrong drops' : `${errors} wrong drop${errors === 1 ? '' : 's'}`}`;
    return `Four #${PUZZLE.num}${PUZZLE.sunday ? ' · Sunday' : ''} · ${verdict}${missBit} · ${elapsed}${hintBit}${streakBit}\n${squares}\n${shareUrl()}`;
  }
  function copyShare() {
    const text = playing
      ? `Four #${PUZZLE.num} — the daily Connect Four position from Source of Truths.\n${shareUrl()}`
      : shareText();
    if (notifyShareCredit(text)) return;
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

  const rulesBody = (
    <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
      <p style={{ margin: '0 0 9px' }}>You are <b>red</b> and you drop first. The position is already won for you: there is a forced <b>win in {PUZZLE.winIn}</b> of your moves. <b>Tap a column</b> to drop a disc.</p>
      <p style={{ margin: '0 0 9px' }}>Exactly <b>one</b> column wins. Every other drop throws it away, and here is the sting: a wrong drop is <b>not taken back</b>. The engine plays on and it is perfect, so once the win is gone it never comes back and you are playing for a draw.</p>
      <p style={{ margin: '0 0 9px' }}>The engine always answers with its most stubborn defence, and the same one for everybody, so the game you play is the game everyone else plays. One free <b>hint</b> greys out two columns that do not win.</p>
      <p style={{ margin: 0 }}>The win scores <b>10</b>, a draw <b>4</b>, a loss <b>1</b>, and giving up nothing. Ties break on fewest wrong drops, then fastest time. Weekdays are a win in four, and <b>Sundays</b> step up to a win in five.</p>
    </div>
  );

  const statusLine = () => {
    if (!playing) {
      if (won) return 'Four in a row. That is the win.';
      if (drawn) return 'Board full. Drawn.';
      if (g.status === 'lost') return 'The engine got there first.';
      return 'The winning line is on the board.';
    }
    if (thinking || awaitingReply) return 'The engine is thinking...';
    if (val > 0) return winLeft <= 1 ? 'Drop the winner.' : `Your move. The win takes ${winLeft} more.`;
    if (val === 0) return 'Your move. The win is gone, a draw is still there.';
    return 'Your move. You are losing this now.';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', position: 'relative' }}>
      <Grain />
      <div className="fr-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.fr-wrap{padding-left:10px !important;padding-right:10px !important;}}
          .fr-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.ink};background:#fff;color:${COLORS.ink};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .fr-btn:hover{background:${COLORS.paper};}
          .fr-tool{font-family:${SANS};font-weight:800;font-size:12.5px;border:1.5px solid rgba(28,30,36,0.35);background:#fff;color:${COLORS.ink};border-radius:8px;padding:7px 11px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;}
          .fr-col{display:flex;flex-direction:column;gap:0;cursor:pointer;-webkit-tap-highlight-color:transparent;min-width:0;}
          .fr-col.dead{cursor:default;}
          .fr-cell{position:relative;aspect-ratio:1 / 1;display:flex;align-items:center;justify-content:center;min-width:0;}
          .fr-hole{width:82%;height:82%;border-radius:50%;background:${HOLE};box-shadow:inset 0 3px 5px rgba(0,0,0,0.28);}
          .fr-disc{width:82%;height:82%;border-radius:50%;box-shadow:inset 0 -3px 6px rgba(0,0,0,0.32), inset 0 3px 4px rgba(255,255,255,0.35);}
          .fr-disc.fresh{animation:frdrop .34s cubic-bezier(.35,.05,.55,1);}
          @keyframes frdrop{0%{transform:translateY(-420%);}70%{transform:translateY(0);}82%{transform:translateY(-9%);}100%{transform:translateY(0);}}
          .fr-disc.lit{animation:frlit 1.15s ease-in-out infinite;}
          @keyframes frlit{0%,100%{box-shadow:inset 0 -3px 6px rgba(0,0,0,0.32), 0 0 0 3px #fff, 0 0 0 6px rgba(255,255,255,0.55);}50%{box-shadow:inset 0 -3px 6px rgba(0,0,0,0.32), 0 0 0 3px #fff, 0 0 0 10px rgba(255,255,255,0.15);}}
          .fr-ghost{position:absolute;width:82%;height:82%;border-radius:50%;border:2px dashed rgba(255,255,255,0.72);}
          .fr-board.shake{animation:frshake .34s ease;}
          @keyframes frshake{0%,100%{transform:translateX(0);}22%{transform:translateX(-6px);}55%{transform:translateX(6px);}80%{transform:translateX(-3px);}}
          .fr-caps{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;margin-bottom:6px;padding:0 8px;}
          .fr-cap{height:7px;border-radius:4px;background:transparent;}
        `}</style>

        <div style={{ maxWidth: 660, margin: '0 auto' }}>

        <div style={{ display: 'block' }}><DailyTopNav player={player} compact={playing} /></div>

        <DailyMasthead
          slug="four"
          num={PUZZLE.num}
          dateLabel={PUZZLE.dateLabel}
          accent={COLORS.accent}
          blockGap={5}
          helpTop={13}
          marginBottom={16}
          onHelp={() => setShowHelp(true)}
          sunday={PUZZLE.sunday && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: '#fff', background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>Sunday Edition &middot; Win in 5</span>}
          blocks={'FOUR'.split('').map((ch, i) => (
              <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 26, background: i === 3 ? COLORS.accent : COLORS.ink, color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
            ))}
        />

        {preStart && (
          <div style={{ background: COLORS.cream, border: `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '22px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>{gateRules ? 'How to play' : 'Four is ready'}</div>
            {gateRules ? rulesBody : (
              <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
                <p style={{ margin: '0 0 6px' }}>You are red, and the position is won: there is a forced win in {PUZZLE.winIn}. Only one column keeps it. Drop the wrong one and the engine, which is perfect, will not give it back.</p>
              </div>
            )}
            <div style={{ marginTop: 18 }}>
              <button className="fr-btn" onClick={startGame} style={{ background: COLORS.ink, color: '#fff', fontSize: 15, padding: '11px 22px' }}>Start</button>
              <div style={{ marginTop: 10 }}>
                <button type="button" onClick={() => setGateRules((v) => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.faded, textDecoration: 'underline' }}>
                  {gateRules ? 'Hide detailed instructions' : 'Show detailed instructions'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!preStart && (
        <div style={{ background: '#fff', border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '13px 15px 15px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, borderBottom: '1px solid rgba(28,30,36,0.18)', paddingBottom: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ whiteSpace: 'nowrap' }}>wrong drops <b style={{ color: errors > 0 ? COLORS.rust : COLORS.ink, fontWeight: 500 }}>{errors}</b></span>
            <span style={{ whiteSpace: 'nowrap' }}>time <b style={{ color: COLORS.ink, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{elapsed}</b></span>
            <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
              {playing && val > 0
                ? <>win in <b style={{ color: COLORS.accent, fontWeight: 500 }}>{Math.max(1, winLeft)}</b></>
                : playing
                  ? <>win in <b style={{ color: COLORS.rust, fontWeight: 500 }}>gone</b></>
                  : <>win in <b style={{ color: COLORS.ink, fontWeight: 500 }}>{PUZZLE.winIn}</b></>}
            </span>
          </div>

          <div style={{ maxWidth: 430, margin: '0 auto' }}>
            {/* the lip above the board, so a hovered column reads before you commit */}
            <div className="fr-caps" aria-hidden="true">
              {Array.from({ length: COLS }).map((_, c) => (
                <div key={c} className="fr-cap" style={{ background: myTurn && hoverCol === c && pos.heights[c] < ROWS ? RED : 'transparent' }} />
              ))}
            </div>
            <div
              key={shake}
              className={`fr-board${shake ? ' shake' : ''}`}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6, background: `linear-gradient(180deg, ${BOARD_BLUE}, ${BOARD_BLUE_DARK})`, border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: 6, touchAction: 'manipulation' }}
            >
              {Array.from({ length: COLS }).map((_, c) => {
                const full = pos.heights[c] >= ROWS;
                const greyed = hintCols.includes(c) && playing;
                const landing = pos.heights[c];
                return (
                  <div
                    key={c}
                    className={`fr-col${full || !myTurn ? ' dead' : ''}`}
                    onMouseEnter={() => setHoverCol(c)}
                    onMouseLeave={() => setHoverCol((v) => (v === c ? null : v))}
                    onClick={() => { if (!gRef.current.t0) { startGame(); return; } if (myTurn && !full) drop(c); }}
                    role="button"
                    tabIndex={-1}
                    aria-label={`Column ${c + 1}${full ? ', full' : ''}`}
                    style={{ opacity: greyed ? 0.4 : 1 }}
                  >
                    {Array.from({ length: ROWS }).map((__, i) => {
                      const r = ROWS - 1 - i;                    // top row first
                      const idx = c * ROWS + r;
                      const v = pos.cells[idx];
                      const isLast = lastCol === c && lastRow === r;
                      const lit = winLine && winLine.includes(idx);
                      const ghost = myTurn && hoverCol === c && !full && r === landing;
                      return (
                        <div key={r} className="fr-cell">
                          {v === 0 && <div className="fr-hole" />}
                          {v !== 0 && (
                            <div
                              className={`fr-disc${isLast && playing ? ' fresh' : ''}${lit ? ' lit' : ''}`}
                              style={{ background: v === 1 ? `radial-gradient(circle at 34% 30%, ${RED}, ${RED_DARK})` : `radial-gradient(circle at 34% 30%, ${YELLOW}, ${YELLOW_DARK})` }}
                            />
                          )}
                          {ghost && <span className="fr-ghost" />}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 12, minHeight: 22, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color: playing ? (val > 0 ? COLORS.accent : COLORS.rust) : COLORS.faded }}>
              {statusLine()}
            </span>
            <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11, color: COLORS.faded, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: RED, display: 'inline-block' }} /> you
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: YELLOW, display: 'inline-block', marginLeft: 6 }} /> engine
            </span>
          </div>

          {playing && !g.hintUsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
              <button className="fr-tool" onClick={useHint} title="Grey out two losing columns (one hint per puzzle)" style={{ background: COLORS.accentSoft, borderColor: 'rgba(30,58,138,0.45)', color: '#1b3268' }}>
                <Lightbulb size={14} /> Hint
              </button>
            </div>
          )}
        </div>
        )}

        {started && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: COLORS.faded }}>
              Tap a column to drop. There is no take-back.
            </span>
            <button onClick={() => { if (armReveal) { setArmReveal(false); revealEnd(); } else { setArmReveal(true); } }}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS, fontWeight: 700, fontSize: 12, color: armReveal ? COLORS.rust : COLORS.faded, textDecoration: 'underline', textUnderlineOffset: 3, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Eye size={13} /> {armReveal ? 'Tap again — ends the game and scores nothing' : (val > 0 ? 'Reveal & end' : 'Give up')}
            </button>
          </div>
        )}

        {!playing && (
          <div style={{ maxWidth: 472, margin: '0 auto' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.ink, margin: '8px 0 0' }}>
              The key: <span style={{ color: COLORS.accent }}>column {PUZZLE.key + 1}</span>.
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.faded, margin: '6px 0 0', lineHeight: 1.5 }}>{PUZZLE.motif}</div>
            {PUZZLE.sunday && (
              <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.faded, fontStyle: 'italic', margin: '8px 0 0' }}>The Sunday Edition, a win in five.</div>
            )}
            {isTodays && myStats.cur >= 2 && (
              <div style={{ fontSize: 13, fontWeight: 800, margin: '12px 0 0', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ color: '#b45309' }}>{myStats.cur}-day streak</span>
              </div>
            )}
            <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
              {isTodays ? (
                <>
                  {countdown ? <>Next Four in <b style={{ color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{countdown}</b>.</> : 'A new position drops at midnight Eastern.'}
                  {prevPuzzle && (
                    <>
                      {' '}Meanwhile:{' '}
                      <a href={`/four?p=${prevPuzzle.num}`} style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>
                        play yesterday&rsquo;s Four &rarr;
                      </a>
                    </>
                  )}
                </>
              ) : (
                <>
                  You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                  <a href="/four" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s Four &rarr;</a>
                  {' · '}
                  <a href="/daily" style={{ color: COLORS.faded, fontWeight: 700, textDecoration: 'underline' }}>All daily puzzles</a>
                </>
              )}
            </p>
          </div>
        )}

        {focusMode && (
          <div style={{ maxWidth: 620, margin: '30px auto 0', textAlign: 'center' }}>
            <button onClick={() => setShowChrome(true)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: '0.03em', color: COLORS.ink, background: 'none', border: '1.5px solid rgba(28,30,36,0.28)', borderRadius: 9, padding: '10px 20px', cursor: 'pointer' }}>Show leaderboard &amp; more</button>
            <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.faded, fontWeight: 600, marginTop: 8 }}>Other puzzles, challenge, share &amp; leaderboard</div>
          </div>
        )}
        <div style={{ display: focusMode ? 'none' : 'block', margin: '30px auto 0' }}>
          <DailyGamesGrid replay={!playing ? resetGame : null}
            self="four"
            maxWidth={620}
            challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`}
            share={{ label: copied ? 'Copied' : 'Share', onClick: copyShare }}
            light
            boardSlot={<DailyBoardPanel self="four" quizId={PUZZLE.quizId} maxWidth={620} streak={{ current: myStats.cur, best: myStats.max }} />}
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
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Four to your Home Screen</div>
              {isIosDevice() ? (
                <ol style={{ margin: '0 0 4px', paddingLeft: 20, color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  <li>Tap the <b>Share</b> button in Safari&apos;s toolbar.</li>
                  <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                  <li>Tap <b>Add</b> &mdash; the tile opens today&apos;s position, every day.</li>
                </ol>
              ) : (
                <p style={{ margin: '0 0 4px', color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  Open your browser&apos;s menu and choose <b>Add to Home Screen</b> (or <b>Install app</b>). The tile opens today&apos;s position, every day.
                </p>
              )}
              <button onClick={() => setShowA2hsHelp(false)} style={{ marginTop: 10, fontFamily: SANS, fontSize: 12.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700, height: 44, width: '100%', borderRadius: 10, border: 'none', background: COLORS.ink, color: '#fff', cursor: 'pointer' }}>Got it</button>
            </div>
          </div>
        )}
        {!focusMode && !identity && (
          <div id="daily-join" style={{ margin: '18px auto 0' }}>
            <JoinLeaderboardForm hideIcon heading="See your stats and join the leaderboard" identity={identity} onJoined={(id) => { setIdentity(id); if (id && id.username) setPlayer((p) => p || { name: id.username, rank: null }); }} />
          </div>
        )}
        </div>
      </div>

      {!playing && !endClosed && (
        <DailyEndCard
          modal
          self="four"
          won={won}
          headline={won ? <>You found it.</> : drawn ? <>Drawn.</> : g.status === 'lost' ? <>You lost the win.</> : <>You scored 0%</>}
          subline={won
            ? <>10/10 &middot; {errors === 0 ? 'no wrong drops' : `${errors} wrong drop${errors === 1 ? '' : 's'}`} &middot; {elapsed}{g.hintUsed ? <> &middot; 1 hint</> : null}</>
            : drawn
              ? <>4/10 &middot; the win went, you held the draw</>
              : g.status === 'lost'
                ? <>1/10 &middot; column {PUZZLE.key + 1} was the one</>
                : <>0/10 &middot; the winning line is on the board</>}
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

      {showHelp && (
        <div onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(20,22,28,0.55)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, background: COLORS.cream, borderRadius: 12, border: `2px solid ${COLORS.ink}`, padding: '20px 22px', fontFamily: SANS, maxHeight: '86vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 21, fontWeight: 800, color: COLORS.ink }}>How to play</div>
              <button onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} aria-label="Close" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded }}><X size={20} /></button>
            </div>
            {rulesBody}
            <button className="fr-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: '#fff' }}>Play</button>
          </div>
        </div>
      )}

      <section style={{ position: 'relative', display: focusMode ? 'none' : 'block', zIndex: 2, maxWidth: 620, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Four</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Four is a free daily Connect Four puzzle from Source of Truths. Every position is a real, reachable board with you to move and a forced win already there, and your job is to find the one column that keeps it. Tap a column and the disc drops, so there is nothing to learn before you play.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Each board has exactly one winning column, checked by two independent solvers, and the win takes exactly the stated number of moves against the stiffest defence, never fewer. What makes it bite is that a wrong drop is not refused. The engine is perfect and it plays the game out, so a careless move costs the win for good and leaves you fighting for a draw.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new position drops every day at midnight Eastern, and Sundays step up to a win in five. No app, no signup, play free in your browser, keep a streak, and race the daily leaderboard. More dailies: <a href="/mate" style={{ color: COLORS.ink, fontWeight: 800 }}>Mate</a>, our daily chess endgame, <a href="/etch" style={{ color: COLORS.ink, fontWeight: 800 }}>Etch</a>, our daily nonogram, and <a href="/suds" style={{ color: COLORS.ink, fontWeight: 800 }}>Suds</a>, our daily sudoku.
        </p>
      </section>

      <div style={{ position: 'relative', zIndex: 2, display: focusMode ? 'none' : 'block' }}><Footer /></div>
    </div>
  );
}

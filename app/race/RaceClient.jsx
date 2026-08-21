'use client';

// Race — the daily pawn-race endgame.
//
// Each day: three pawns a side on a small board, White to move and winning in
// exactly `winIn` moves against perfect defence. A pawn moves ONE square
// straight forward onto an empty square, or one square DIAGONALLY forward onto
// an empty square or an enemy pawn (the capture; there are no straight
// captures). The first pawn to reach the far rank wins on the spot, and a side
// with no pawn left, or no legal move, loses. Every move advances a pawn, so
// the game always ends and there is NO DRAW of any kind: exactly one first
// move wins, and every other first move loses the race outright.
//
// Black's play is PERFECT, not heuristic: the position's whole game tree is
// solved exactly, in this browser, by ./breakthrough.js (every banked board is
// proven small enough). Nothing announces a mistake while you can still move
// (the End Game rule): every legal move is played, nothing is taken back, and
// the round ends only when a pawn crosses, a side is out of pawns, or a side
// is out of moves.
//
// Same daily plumbing as Mate/Suds/Etch: banked boards gated by Eastern date on
// the server (app/race/page.js), per-puzzle localStorage saves, /race?p=N
// archive pinning, streaks + stats, and the shared /api/quiz/* board flow.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { X, Lightbulb, Eye, Smartphone, RotateCcw } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import useDuelContext, { DuelBanner } from '../quiz/[id]/useDuelContext';
import JoinLeaderboardForm from '../quiz/[id]/JoinLeaderboardForm';
import DailyGamesGrid from '../DailyGamesGrid';
import DailyEndCard from '../DailyEndCard';
import useEndHold, { HOLD_SHORT, HOLD_LONG } from '../useEndHold';
import DailyChrome from '../DailyChrome';
import DailyRules from '../DailyRules';
import DailyBoardPanel from '../quiz/[id]/DailyBoardPanel';
import { isMobileDevice } from '@/lib/is-mobile';
import useAbandonFlush from '../quiz/[id]/useAbandonFlush';
import { withRef } from '@/lib/referrals';
import { notifyShareCredit } from '../ShareCreditPop';
import DailyMasthead from '../DailyMasthead';
import ReportIssue from '../ReportIssue';
import LoftCap from '../LoftCap';
import useIqStanding from '../useIqStanding';
import useNextUnplayed, { useUnplayedSimilar } from '../useNextUnplayed';
import useDailyBoard from '../useDailyBoard';
import useGameAllTime from '../useGameAllTime';
import useDayStats from '../useDayStats';
import useCategoryRank from '../useCategoryRank';
import LoftFinish from '../LoftFinish';
import { CONTEST, contestIsLive } from '@/lib/contest';
import { isLoft } from '@/lib/loft';
import { hintAllowed, spendHint } from '@/lib/hint-gate';
import {
  makePosition, makeSolver, raceMoves, raceApply, engineReply, raceSan, cellName,
} from './breakthrough';
import { T } from '@/lib/theme';
import { meRequest } from '@/app/quizMeClient';

const COLORS = {
  cream: T.surface,
  paper: T.paper,
  ink: T.ink,
  ember: T.accent,
  rust: T.danger,
  faded: T.muted,
  accent: '#1d4ed8',       // Race identity — starting-flag blue
  accentSoft: '#e8effc',
  green: T.successDeep,
};
// The board: cool steel blues, so it reads as its own game beside the walnut
// chess boards it shares a category with.
const LIGHT_SQ = '#dde5f2';
const DARK_SQ = '#9fb2d4';
const SEL_SQ = 'rgba(29,78,216,0.42)';
const LAST_SQ = 'rgba(122,162,245,0.6)';

const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const HELP_KEY = 'sot_race_help_seen';
const STATS_KEY = 'sot_race_stats';

// The pawn, as inline SVG on the conventional 45x45 grid (glyph fonts are not
// dependable; see MateClient, which established the rule and this path).
const PAWN_PATH = 'M22.5 8.4 a5.6 5.6 0 0 1 3.6 9.9 c2.4 1.5 4.1 4 4.1 7.1 c0 2.3 -0.9 4 -1.9 5.6 h-11.6 c-1 -1.6 -1.9 -3.3 -1.9 -5.6 c0 -3.1 1.7 -5.6 4.1 -7.1 a5.6 5.6 0 0 1 3.6 -9.9 z M11.6 35.7 h21.8 a2.6 2.6 0 0 1 2.6 2.6 v3.1 h-27 v-3.1 a2.6 2.6 0 0 1 2.6 -2.6 z';
function Pawn({ white }) {
  return (
    <svg className="rc-pc" viewBox="0 0 45 45" aria-hidden="true" focusable="false">
      <path
        d={PAWN_PATH}
        fill={white ? T.white : '#16181d'}
        stroke={white ? '#16181d' : T.white}
        strokeWidth={white ? 2 : 1.1}
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

// ─── Personal stats + streak (localStorage), Suds/Etch pattern ─────────────
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

const HAPT = { ok: [7], wrong: [0, 26, 34, 26], win: [10, 40, 20, 40, 20, 60] };
function vibrate(p) { try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(p); } catch (e) {} }

// Rebuild the live position from the move list. Every stored move, White's and
// Black's alike, is found in the legal set, so a save can never desync the
// board.
function replay(puzzle, moves) {
  let s = makePosition(puzzle.cols, puzzle.rows, puzzle.white, puzzle.black, 'w');
  const sans = [];
  let crossed = null; // 'w' | 'b' when the last move reached the far rank
  for (const m of moves) {
    const mv = raceMoves(s).find((x) => x.uci === m);
    if (!mv) break;
    sans.push(raceSan(mv, puzzle.cols, puzzle.rows));
    if (mv.goal) { crossed = s.stm; }
    s = raceApply(s, mv);
  }
  return { s, sans, crossed };
}

function freshState() {
  return { v: 1, moves: [], errors: 0, offAt: null, hintUsed: false, status: 'playing', t0: null, tEnd: null };
}

export default function RaceClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const STORE_KEY = `sot_race_${PUZZLE.num}`;

  const [g, setG] = useState(() => freshState());
  const gRef = useRef(g);
  const [sel, setSel] = useState(null);
  const [hintCell, setHintCell] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [gateRules, setGateRules] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [armReveal, setArmReveal] = useState(false);
  const [armRestart, setArmRestart] = useState(false);
  const [endClosed, setEndClosed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [shareCta, setShareCta] = useState('Share');
  useEffect(() => {
    if (contestIsLive()) setShareCta(`Share for ${CONTEST.prizeLabel}*`);
  }, []);
  const endHold = useEndHold(1200);
  const [hydrated, setHydrated] = useState(false);
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [identity, setIdentity] = useState(null);
  const [stats, setStats] = useState(null);
  const [hintOk, setHintOk] = useState(false);
  useEffect(() => { if (stats) setHintOk(hintAllowed('race', stats)); }, [stats]);
  useEffect(() => { if (g.hintUsed) spendHint('race'); }, [g.hintUsed]);
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
  // One exact solver per board, built lazily off the tap path (the reply timer
  // and the hint are the only callers). Memoized across the whole game, so
  // only the first consultation pays.
  const solverRef = useRef(null);
  const getSolver = () => {
    if (!solverRef.current) solverRef.current = makeSolver();
    return solverRef.current;
  };

  const moves = g.moves;
  const playing = g.status === 'playing';
  const preStart = playing && !g.t0;
  const started = playing && !!g.t0;
  const focusMode = playing && !showChrome;
  const LOFT = isLoft('race');
  const won = g.status === 'won';
  const errors = g.errors;
  const finalScore = won ? 10 : 0;
  const endScore = finalScore;
  const awaitingReply = playing && moves.length % 2 === 1;

  const view = useMemo(() => replay(PUZZLE, moves), [PUZZLE, moves]);
  const pos = view.s;
  const CELLS = PUZZLE.cols * PUZZLE.rows;
  const lastMove = moves.length
    ? (() => { const m = moves[moves.length - 1]; return { from: cellFrom(m.slice(0, 2)), to: cellFrom(m.slice(2, 4)) }; })()
    : null;
  function cellFrom(nm) {
    return (PUZZLE.rows - Number(nm.slice(1))) * PUZZLE.cols + (nm.charCodeAt(0) - 97);
  }
  const myTurn = playing && started && !awaitingReply;
  const sanList = view.sans;

  useEffect(() => { gRef.current = g; }, [g]);
  useEffect(() => {
    if (!armReveal) return undefined;
    const t = setTimeout(() => setArmReveal(false), 3500);
    return () => clearTimeout(t);
  }, [armReveal]);
  useEffect(() => {
    if (!armRestart) return undefined;
    const t = setTimeout(() => setArmRestart(false), 3500);
    return () => clearTimeout(t);
  }, [armRestart]);
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
        if (done || g.t0) localStorage.setItem('sot_race_day', JSON.stringify({ d: etToday(), done }));
        else localStorage.removeItem('sot_race_day');
      }
    } catch (e) {}
  }, [g, hydrated, STORE_KEY, PUZZLE, puzzles]);

  // Live game clock (ticked state, never Date.now() during render).
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    if (g.status !== 'playing' || !g.t0 || g.tEnd) return undefined;
    setNowTick(Date.now());
    const iv = setInterval(() => setNowTick(Date.now()), 500);
    return () => clearInterval(iv);
  }, [g.status, g.t0, g.tEnd]);

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
        meRequest(`/api/quiz/me?anonId=${encodeURIComponent(anon || '')}${em}&history=1`)
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
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  const elapsed = g.t0 ? fmtTime((g.tEnd || nowTick) - g.t0) : '0:00';
  const isTodays = PUZZLE.num === pickPuzzle(puzzles, null).num;
  const iq = useIqStanding({ game: 'race', quizId: PUZZLE.quizId, active: LOFT && !playing });
  const nextUp = useNextUnplayed({ self: 'race', active: LOFT && !playing });
  const upNext = useUnplayedSimilar({ self: 'race', active: LOFT && !playing });
  const dailyBoard = useDailyBoard({ quizId: PUZZLE.quizId, active: LOFT && !playing });
  const allTime = useGameAllTime({ game: 'race', active: LOFT && !playing });
  const dayStats = useDayStats();
  const catRank = useCategoryRank({ self: 'race', active: LOFT && !playing });
  const prevPuzzle = puzzles.find((x) => x.num === PUZZLE.num - 1) || null;
  const myStats = deriveStats(stats, pickPuzzle(puzzles, null).num);

  const REC_KEY = `sot_race_rec_${PUZZLE.num}`;
  const abandon = useAbandonFlush(() => {
    const cur = gRef.current;
    const acted = cur.moves.length > 0 || cur.errors > 0 || cur.hintUsed;
    if (!acted || cur.status !== 'playing') return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - (cur.t0 || Date.now())) / 1000)));
    try { localStorage.setItem(REC_KEY, '1'); } catch (e) {}
    return { quizId: PUZZLE.quizId, score: 0, total: 10, correct: 0, guessesUsed: 0, progress: progressOf(cur), timeElapsed: el, abandoned: true, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') };
  });

  // HOW FAR THIS RUN GOT (migration 51): the White moves played while the race
  // was still winning. `offAt` is stamped by the engine's reply the first time
  // the position it answers is already lost, so no solve is needed here.
  // Ranking term only, never score.
  function progressOf(g2) {
    if (g2.offAt != null) return g2.offAt;
    return Math.ceil((g2.moves || []).length / 2);
  }

  function postResult(g2, score) {
    abandon.markFlushed();
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    try { setStats(recordStat(PUZZLE.num, { s: score, t: 10, g: g2.errors, won: g2.status === 'won' })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: PUZZLE.quizId, score, total: 10, correct: g2.status === 'won' ? 1 : 0, guessesUsed: g2.errors, progress: progressOf(g2), timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
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

  function concludeWon(cur) {
    const done = { ...cur, status: 'won', tEnd: Date.now() };
    vibrate(HAPT.win);
    postResult(done, 10);
    endHold.hold(HOLD_SHORT);
    commit(done);
  }
  function concludeLost(cur) {
    const done = { ...cur, status: 'lost', tEnd: Date.now() };
    vibrate(HAPT.wrong);
    postResult(done, 0);
    endHold.hold(HOLD_LONG);
    commit(done);
  }

  // Black's perfect reply, a beat after White's move. The first consultation
  // solves the whole position (the banked boards are proven small enough that
  // this takes well under a couple of seconds); after that every reply is a
  // lookup, so "Black is thinking" is honest exactly once.
  function scheduleReply(afterMoves) {
    if (replyTimer.current) clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      const cur = gRef.current;
      if (cur.status !== 'playing' || cur.moves.length !== afterMoves.length) return;
      const v = replay(PUZZLE, cur.moves);
      const solver = getSolver();
      // Stamp how far the run stayed winning, the first time it stops being.
      let offAt = cur.offAt, errs = cur.errors;
      if (offAt == null) {
        const val = solver.solve(v.s); // Black to move
        if (val.win === 'b') {
          offAt = Math.ceil(cur.moves.length / 2) - 1;
          errs = cur.errors + 1;
        }
      }
      const mv = engineReply(v.s, solver);
      if (!mv) {
        // Black has no pawn or no move left: Black loses, the race is won.
        concludeWon({ ...cur, offAt, errors: errs });
        return;
      }
      const next = { ...cur, offAt, errors: errs, moves: [...cur.moves, mv.uci] };
      if (mv.goal) {
        // Black's pawn crosses: the race is lost, and you watched it happen.
        const done = { ...next, status: 'lost', tEnd: Date.now() };
        vibrate(HAPT.wrong);
        postResult(done, 0);
        endHold.hold(HOLD_LONG);
        commit(done);
        return;
      }
      commit(next);
      vibrate(HAPT.ok);
    }, 620);
  }
  useEffect(() => {
    if (!hydrated || !playing) return undefined;
    if (moves.length % 2 === 1) scheduleReply(moves);
    return () => { if (replyTimer.current) clearTimeout(replyTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, playing, moves.length]);

  // White out of pawns or out of moves loses on the spot. Both are real ends
  // of this game, and both land on the opponent's move.
  useEffect(() => {
    if (!hydrated || !playing || !started || awaitingReply) return;
    if (!pos.w.length || raceMoves(pos).length === 0) concludeLost(gRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, playing, started, awaitingReply, pos]);

  function tryMove(from, to) {
    const cur = gRef.current;
    if (cur.status !== 'playing' || cur.moves.length % 2 === 1) return;
    const v = replay(PUZZLE, cur.moves);
    const mv = raceMoves(v.s).find((x) => x.from === from && x.to === to);
    if (!mv) return;
    const nextMoves = [...cur.moves, mv.uci];
    const g2 = { ...cur, moves: nextMoves };
    if (!g2.t0) g2.t0 = Date.now();
    setSel(null);
    setHintCell(null);
    if (mv.goal) {
      g2.status = 'won';
      g2.tEnd = Date.now();
      vibrate(HAPT.win);
      postResult(g2, 10);
      endHold.hold(HOLD_SHORT);
      commit(g2);
      return;
    }
    vibrate(HAPT.ok);
    commit(g2);
    scheduleReply(nextMoves);
  }

  function onSquare(sq) {
    if (!playing) return;
    if (!gRef.current.t0) startGame();
    if (!myTurn) return;
    const isMine = pos.w.includes(sq);
    if (sel === sq) { setSel(null); return; }
    if (isMine) { setSel(sq); return; }
    if (sel != null) {
      const ts = raceMoves(pos).filter((m) => m.from === sel).map((m) => m.to);
      if (ts.includes(sq)) { tryMove(sel, sq); return; }
      setSel(null);
    }
  }

  const targets = useMemo(() => (sel != null && myTurn ? raceMoves(pos).filter((m) => m.from === sel).map((m) => m.to) : []), [sel, pos, myTurn]);

  // One free hint: names the pawn that moves (its file), never where it goes.
  function useHint() {
    if (!hintOk) return;
    const cur = gRef.current;
    if (cur.status !== 'playing' || cur.hintUsed) return;
    const v = replay(PUZZLE, cur.moves);
    if (v.s.stm !== 'w') return;
    const solver = getSolver();
    let best = null;
    for (const mv of raceMoves(v.s)) {
      const wins = mv.goal || solver.solve(raceApply(v.s, mv)).win === 'w';
      if (wins) { best = mv; break; }
    }
    if (!best) return;
    const g2 = { ...cur, hintUsed: true };
    if (!g2.t0) g2.t0 = Date.now();
    commit(g2);
    setHintCell(best.from);
    say(`It is the ${cellName(best.from, PUZZLE.cols, PUZZLE.rows)[0]}-pawn that moves.`);
  }

  function revealEnd() {
    const cur = gRef.current;
    if (cur.status !== 'playing') return;
    const g2 = { ...cur, status: 'revealed', tEnd: Date.now() };
    if (!g2.t0) g2.t0 = Date.now();
    postResult(g2, 0);
    endHold.hold(HOLD_SHORT);
    commit(g2);
    setSel(null);
  }

  function resetGame() {
    endHold.release();
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    if (replyTimer.current) clearTimeout(replyTimer.current);
    setArmReveal(false);
    setArmRestart(false);
    commit({ ...freshState(), t0: Date.now() });
    setSel(null); setHintCell(null); setEndClosed(false);
  }

  function restartGame() {
    const cur = gRef.current;
    if (cur.status === 'playing' && cur.t0) {
      if (replyTimer.current) clearTimeout(replyTimer.current);
      postResult({ ...cur, status: 'revealed', tEnd: Date.now() }, 0);
    }
    resetGame();
  }

  function shareUrl() {
    return withRef(`mindloftdaily.com/race${isTodays ? '' : `?p=${PUZZLE.num}`}`);
  }
  function shareText() {
    const g5 = won ? Math.max(1, Math.round(finalScore / 2)) : 0;
    const squares = '\u{1F7E9}'.repeat(g5) + '⬜'.repeat(5 - g5);
    const hintBit = g.hintUsed ? ' · \u{1F4A1}' : '';
    const streakBit = isTodays && myStats.cur >= 2 ? ` · streak ${myStats.cur}` : '';
    const head2 = won
      ? `Race #${PUZZLE.num}${PUZZLE.sunday ? ' · Sunday' : ''} · won in ${PUZZLE.winIn} · ${errors === 0 ? 'clean run' : `${errors} miss${errors === 1 ? '' : 'es'}`} · ${elapsed}${hintBit}${streakBit}`
      : g.status === 'lost'
        ? `Race #${PUZZLE.num}${PUZZLE.sunday ? ' · Sunday' : ''} · lost the race · ${elapsed}`
        : `Race #${PUZZLE.num} · gave up`;
    return `${head2}\n${squares}\n${shareUrl()}`;
  }
  function copyShare() {
    const text = playing
      ? `Race #${PUZZLE.num} — the daily pawn race from Mind Loft.\n${shareUrl()}`
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
    <DailyRules
      accent={COLORS.accent} accentSoft={COLORS.accentSoft}
      lead="Win the race."
      banner={<>A pawn moves <b>one square straight forward</b> onto an empty square, or <b>one square diagonally forward</b> onto an empty square or an enemy pawn, which is the capture. <b>First pawn to the far rank wins.</b></>}
      steps={[
        <><b>Tap one of your pawns</b> and the squares it can reach light up. <b>Tap one</b> to play the move. You are White, running up the board, and the defence never makes a mistake.</>,
        <>There are <b>no draws</b>. You are winning, in {PUZZLE.winIn} moves, and exactly <b>one first move keeps it</b>. Every other first move loses the race outright.</>,
        <>Running out of pawns, or out of moves, loses too. Straight ahead is blocked by anything; the diagonal is never blocked, only contested.</>,
      ]}
      knack={<>Count the race before you touch a pawn: whose runner queens first if everybody just pushes? Then find the tempo, the capture, or the block that changes the answer.</>}
      note={<>You may play <b>any legal move</b> and there is <b>no take-back</b>. Nothing is refused and nothing stops early: the defence keeps playing, and the round ends when a pawn crosses, a side is out of pawns, or a side is out of moves.</>}
      footer="Winning the race scores 10, and losing it scores nothing, the same as giving up. Ties break on fastest time. The race deepens through the week, and the Sunday Edition is the longest of all, a win in five."
    />
  );

  const fileLabels = 'abcdefgh'.split('');

  return (
    <div className={LOFT ? 'loft-page' : undefined} style={{ minHeight: '100vh', background: T.surface, position: 'relative', overflowX: LOFT ? 'hidden' : undefined }}>
      <Grain />
      <DailyChrome slug="race" name="Race" collapsed={started} loft={LOFT} />
      {/* END GAME: the cap shows exactly what the strip showed at that moment,
          no more. The tally is posted throughout but only APPEARS once the
          round is over. */}
      {LOFT && (
        <LoftCap
          name="Race"
          cat="End Game"
          outcome={playing ? null : (won ? 'won' : 'lost')}
          num={PUZZLE.num}
          tiles={playing ? null : upNext}
          dateLabel={playing ? PUZZLE.dateLabel : (won ? 'Solved' : 'Not solved')}
          onHelp={() => setShowHelp(true)}
          sunday={PUZZLE.sunday ? 'Sunday Edition' : null}
          figures={playing ? [
            { v: elapsed, k: 'time' },
            { v: PUZZLE.winIn, k: 'win in' },
          ] : [
            { v: endScore, k: 'score' },
            { v: errors, k: 'misses' },
            { v: PUZZLE.winIn, k: 'win in' },
            { v: elapsed, k: 'time' },
          ]}
        />
      )}
      <div className="rc-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.rc-wrap{padding-left:10px !important;padding-right:10px !important;}}
          .rc-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid var(--blue-deep);background:var(--white);color:var(--blue-deep);border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .rc-btn:hover{background:var(--accent-soft);}
          .rc-tool{font-family:${SANS};font-weight:800;font-size:12.5px;border:1.5px solid rgba(28,30,36,0.35);background:var(--white);color:${COLORS.ink};border-radius:8px;padding:7px 11px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;}
          .rc-sq{position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;min-width:0;min-height:0;}
          .rc-pc{display:block;width:86%;height:86%;pointer-events:none;filter:drop-shadow(0 1px 1px rgba(0,0,0,0.25));}
          .rc-dot{position:absolute;width:28%;height:28%;border-radius:50%;background:rgba(28,30,36,0.32);pointer-events:none;}
          .rc-ring{position:absolute;inset:6%;border-radius:50%;border:min(1.1vw,6px) solid rgba(28,30,36,0.3);pointer-events:none;}
          .rc-coord{position:absolute;font-family:${MONO};font-size:min(2vw,10px);font-weight:500;opacity:.62;pointer-events:none;}
        `}</style>

        <div style={{ maxWidth: 660, margin: '0 auto' }}>

        {!LOFT && (
        <DailyMasthead
          slug="race"
          num={PUZZLE.num}
          dateLabel={PUZZLE.dateLabel}
          accent={COLORS.accent}
          blockGap={5}
          helpTop={13}
          marginBottom={16}
          onHelp={() => setShowHelp(true)}
          sunday={PUZZLE.sunday && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: T.white, background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>Sunday Edition &middot; Win in 5</span>}
          blocks={'RACE'.split('').map((ch, i) => (
              <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 26, background: i === 0 ? COLORS.accent : COLORS.ink, color: T.white, boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
            ))}
        />
        )}

        <div className={LOFT ? 'loft-stage' : undefined}>
          <div className={LOFT && !playing && !endHold.held ? (revealed ? 'loft-flip' : 'loft-flip on') : undefined}>
          <div className={LOFT && !playing && !endHold.held ? 'loft-flip-in' : undefined}>
          <div className={LOFT && !playing && !endHold.held ? 'loft-face' : undefined}>

        {preStart && (
          <div style={{ background: COLORS.cream, border: `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '22px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>{gateRules ? 'How to play' : 'Race is ready'}</div>
            {gateRules ? rulesBody : (
              <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
                <p style={{ margin: '0 0 6px' }}>Three pawns a side and first one across wins. You are winning in {PUZZLE.winIn}, exactly one first move keeps it, and there is no take-back.</p>
              </div>
            )}
            <div style={{ marginTop: 18 }}>
              <button className="rc-btn" onClick={startGame} style={{ background: T.cta, color: T.white, fontSize: 15, padding: '11px 22px' }}>Start</button>
              <div style={{ marginTop: 10 }}>
                <button type="button" onClick={() => setGateRules((v) => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.faded, textDecoration: 'underline' }}>
                  {gateRules ? 'Hide detailed instructions' : 'Show detailed instructions'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!preStart && (
        <div className={LOFT ? 'loft-card' : undefined} style={{ background: T.white, border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '13px 15px 15px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}>
          {!LOFT && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, borderBottom: '1px solid rgba(28,30,36,0.18)', paddingBottom: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {!playing && <span style={{ whiteSpace: 'nowrap' }}>misses <b style={{ color: errors > 0 ? COLORS.rust : COLORS.ink, fontWeight: 500 }}>{errors}</b></span>}
            <span style={{ whiteSpace: 'nowrap' }}>time <b style={{ color: COLORS.ink, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{elapsed}</b></span>
            <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
              win in <b style={{ color: playing ? COLORS.accent : COLORS.ink, fontWeight: 500 }}>{PUZZLE.winIn}</b>
            </span>
          </div>
          )}

          <div style={{ maxWidth: PUZZLE.cols >= 7 ? 400 : 350, margin: '0 auto' }}>
            <div
              className="rc-board"
              style={{ display: 'grid', gridTemplateColumns: `repeat(${PUZZLE.cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${PUZZLE.rows}, minmax(0, 1fr))`, aspectRatio: `${PUZZLE.cols} / ${PUZZLE.rows}`, border: `2px solid ${COLORS.ink}`, borderRadius: 4, overflow: 'hidden', touchAction: 'manipulation' }}
            >
              {Array.from({ length: CELLS }).map((_, sq) => {
                const r = Math.floor(sq / PUZZLE.cols), f = sq % PUZZLE.cols;
                const dark = (r + f) % 2 === 1;
                const isW = pos.w.includes(sq);
                const isB = pos.b.includes(sq);
                const isSel = sel === sq;
                const isTarget = targets.includes(sq);
                const isLast = lastMove && (lastMove.from === sq || lastMove.to === sq);
                const isHint = hintCell === sq;
                let bg = dark ? DARK_SQ : LIGHT_SQ;
                if (isLast) bg = `linear-gradient(${LAST_SQ},${LAST_SQ}), ${bg}`;
                if (isSel) bg = `linear-gradient(${SEL_SQ},${SEL_SQ}), ${dark ? DARK_SQ : LIGHT_SQ}`;
                return (
                  <div
                    key={sq}
                    className="rc-sq"
                    onClick={() => onSquare(sq)}
                    role="button"
                    tabIndex={-1}
                    aria-label={cellName(sq, PUZZLE.cols, PUZZLE.rows) + (isW ? ' white pawn' : isB ? ' black pawn' : ' empty')}
                    style={{ background: bg, boxShadow: isHint ? `inset 0 0 0 3px ${T.successDeep}` : (r === 0 ? 'inset 0 3px 0 rgba(29,78,216,0.55)' : undefined) }}
                  >
                    {f === 0 && (
                      <span className="rc-coord" style={{ left: 2, top: 1, color: dark ? LIGHT_SQ : DARK_SQ }}>{PUZZLE.rows - r}</span>
                    )}
                    {r === PUZZLE.rows - 1 && (
                      <span className="rc-coord" style={{ right: 3, bottom: 1, color: dark ? LIGHT_SQ : DARK_SQ }}>{fileLabels[f]}</span>
                    )}
                    {(isW || isB) && <Pawn white={isW} />}
                    {isTarget && !isW && !isB && <span className="rc-dot" />}
                    {isTarget && isB && <span className="rc-ring" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 12, minHeight: 22, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: SANS, fontSize: endHold.held ? 15 : 13, fontWeight: 800, color: playing ? COLORS.accent : (endHold.held ? COLORS.ink : COLORS.faded) }}>
              {!playing
                ? (won ? 'Across. The race is yours.' : g.status === 'lost' ? 'The race went the other way. The win is still there.' : 'You ended it there. The win is still there.')
                : awaitingReply
                  ? 'Black is thinking...'
                  : 'Your move.'}
            </span>
            {sanList.length > 0 && (
              <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 12, color: COLORS.faded, fontWeight: 500 }}>
                {sanList.map((s, i) => (i % 2 === 0 ? `${i / 2 + 1}. ${s}` : s)).join(' ')}
              </span>
            )}
          </div>

          {playing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
              {hintOk && !g.hintUsed && (
                <button className="rc-tool" onClick={useHint} title="Name the pawn that moves (one hint, first play only)" style={{ background: COLORS.accentSoft, borderColor: 'rgba(29,78,216,0.5)', color: '#173ba3' }}>
                  <Lightbulb size={14} /> Hint
                </button>
              )}
            </div>
          )}

        {started && (
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(28,30,36,0.10)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: COLORS.faded }}>
                Tap a white pawn, then tap where it goes. There is no take-back.
              </span>
              <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <button onClick={() => { if (armReveal) { setArmReveal(false); revealEnd(); } else { setArmRestart(false); setArmReveal(true); } }}
                  title={armReveal ? 'Ends the puzzle and scores nothing' : 'End the puzzle now, scoring nothing'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS, fontWeight: 700, fontSize: 12, color: armReveal ? COLORS.rust : COLORS.faded, textDecoration: 'underline', textUnderlineOffset: 3, display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-start', gap: 5, minWidth: 104, padding: 0 }}>
                  <Eye size={13} style={{ flexShrink: 0 }} /> {armReveal ? 'Press again' : 'Give up'}
                </button>
                <button onClick={() => { if (armRestart) { setArmRestart(false); restartGame(); } else { setArmReveal(false); setArmRestart(true); } }}
                  title={armRestart ? 'Records a 0 and resets the board' : 'Record a 0 and reset the board'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS, fontWeight: 700, fontSize: 12, color: armRestart ? COLORS.rust : COLORS.faded, textDecoration: 'underline', textUnderlineOffset: 3, display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-start', gap: 5, minWidth: 104, padding: 0 }}>
                  <RotateCcw size={13} style={{ flexShrink: 0 }} /> {armRestart ? 'Press again' : 'Restart'}
                </button>
              </span>
            </div>
            {(armReveal || armRestart) && (
              <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 700, color: COLORS.rust, marginTop: 6, textAlign: 'right', lineHeight: 1.4 }}>
                {armReveal ? 'Ends the puzzle and scores nothing.' : 'Records a 0 and resets the board.'}
              </div>
            )}
          </div>
        )}
        </div>
      )}


          <div className="loft-sol">
          {!playing && !endHold.held && (
            <div style={{ maxWidth: 472, margin: '0 auto' }}>
              {/* keepsAnswer: the key move is shown to nobody, solver included.
                  The position is replayable and the race is the prize. */}
              {won ? (
                <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.ink, margin: '8px 0 0' }}>
                  Won in {PUZZLE.winIn}.{errors === 0 ? ' A clean run.' : ''}
                </div>
              ) : (
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.faded, margin: '8px 0 0', lineHeight: 1.5 }}>
                  We are not printing the move. The winning race is still there in the position, so take another run at it.
                </div>
              )}
              {PUZZLE.sunday && (
                <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.faded, fontStyle: 'italic', margin: '8px 0 0' }}>The Sunday Edition: the longest race of the week, a win in five.</div>
              )}
              {isTodays && myStats.cur >= 2 && (
                <div style={{ fontSize: 13, fontWeight: 800, margin: '12px 0 0', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ color: '#b45309' }}>{myStats.cur}-day streak</span>
                </div>
              )}
              <p className="loft-tailnote" style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
                {isTodays ? (
                  <>
                    {countdown ? <>Next Race in <b style={{ color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{countdown}</b>.</> : 'A new position drops at midnight Eastern.'}
                    {prevPuzzle && (
                      <>
                        {' '}Meanwhile:{' '}
                        <a href={`/race?p=${prevPuzzle.num}`} style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>
                          play yesterday&rsquo;s Race &rarr;
                        </a>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                    <a href="/race" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s Race &rarr;</a>
                    {' · '}
                    <a href="/daily" style={{ color: COLORS.faded, fontWeight: 700, textDecoration: 'underline' }}>All daily puzzles</a>
                  </>
                )}
              </p>
            </div>
          )}
          </div>
          {LOFT && !playing && !endHold.held && revealed && (
            <button className="loft-showopts" onClick={() => setRevealed(false)}>&#8630; Hide game board</button>
          )}
          </div>
          {LOFT && !playing && !endHold.held && (
            <LoftFinish
              name="Race"
              catRank={catRank}
              outcome={won ? 'won' : 'lost'}
              title={won ? 'Solved' : 'Not solved'}
              detail={`${endScore} · ${errors} misses · ${PUZZLE.winIn} win in · ${elapsed}`}
              iq={iq}
              board={dailyBoard}
              gameRank={allTime && allTime.ready
                ? { value: allTime.rank != null ? `#${Number(allTime.rank).toLocaleString()}` : '—',
                    label: allTime.field != null ? `of ${Number(allTime.field).toLocaleString()} Race all time` : 'all-time rank' }
                : null}
              day={dayStats}
              streak={isTodays ? myStats.cur : null}
              missLabel="Tries"
              archive={puzzles
                .filter((p) => p.live <= etToday() && p.num !== PUZZLE.num)
                .sort((x, y) => y.num - x.num)
                .map((p) => ({
                  num: p.num,
                  dateLabel: p.dateLabel,
                  sunday: !!p.sunday,
                  href: `/race?p=${p.num}`,
                  done: !!(stats && stats.rec && stats.rec[p.num]),
                  score: (stats && stats.rec && stats.rec[p.num]) ? stats.rec[p.num].s : null,
                }))}
              options={[
                { label: copied ? 'Copied' : (shareCta || 'Share'), sub: 'Your result, no spoilers', kind: 'gold', onClick: copyShare },
                { tone: 'board', label: 'Return to board', sub: 'Your finished board', onClick: () => setRevealed(true) },
              prevPuzzle && { tone: 'another', label: 'Play another Race', sub: `No. ${prevPuzzle.num}, yesterday’s puzzle`, href: `/race?p=${prevPuzzle.num}` },
                nextUp && { tone: 'similar', label: 'Play similar', sub: `${nextUp.name} · ${nextUp.tag}`, href: nextUp.href },
                { tone: 'replay', label: 'Replay', sub: 'This puzzle again, unscored', onClick: resetGame },
                { label: 'Back to main', sub: 'The day’s full board', tone: 'main', href: '/' },
              ]}
            />
          )}
          </div>
          </div>
      </div>


        {focusMode && (
          <div style={{ maxWidth: 620, margin: '30px auto 0', textAlign: 'center' }}>
            <button className="loft-showchrome" onClick={() => setShowChrome(true)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: '0.03em', color: T.blueDeep, background: 'none', border: '1.5px solid var(--accent-border)', borderRadius: 9, padding: '10px 20px', cursor: 'pointer' }}>Show overview and more</button>
          </div>
        )}
        <div style={{ display: focusMode ? 'none' : 'block', margin: '30px auto 0' }}>
          {LOFT && (
            <div className="loft-report">
              <ReportIssue self="race" name="Race" accent="#ffffff" align="center" />
            </div>
          )}
          {!LOFT && (
          <DailyGamesGrid replay={!playing ? resetGame : null}
            self="race"
            maxWidth={620}
            challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`}
            share={{ label: copied ? 'Copied' : 'Share', onClick: copyShare }}
            light
            boardSlot={<DailyBoardPanel self="race" quizId={PUZZLE.quizId} maxWidth={620} streak={{ current: myStats.cur, best: myStats.max }} />}
            divider
          />
          )}
          {mobileUi && !standalone && (
            <button onClick={a2hsClick} style={{ marginTop: 10, width: '100%', fontFamily: SANS, fontSize: 13.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 800, height: 54, borderRadius: 10, border: 'none', background: COLORS.accent, color: T.white, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, whiteSpace: 'nowrap' }}>
              <Smartphone size={15} strokeWidth={2.5} /> Add to Home Screen
            </button>
          )}
        </div>
        {showA2hsHelp && (
          <div onClick={() => setShowA2hsHelp(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,22,28,0.55)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: T.white, borderRadius: 14, maxWidth: 430, width: '100%', padding: '22px 22px 16px', fontFamily: SANS, border: '1.5px solid rgba(20,22,28,0.12)' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Race to your Home Screen</div>
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
              <button onClick={() => setShowA2hsHelp(false)} style={{ marginTop: 10, fontFamily: SANS, fontSize: 12.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700, height: 44, width: '100%', borderRadius: 10, border: 'none', background: COLORS.ink, color: T.white, cursor: 'pointer' }}>Got it</button>
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

      {!playing && !endClosed && !endHold.held && !LOFT && (
        <DailyEndCard
          modal
          self="race"
          won={won}
          headline={won ? <>Across first!</> : g.status === 'lost' ? <>You lost the race.</> : <>You scored 0%</>}
          subline={won
            ? <>10/10 &middot; won in {PUZZLE.winIn} &middot; {elapsed}{g.hintUsed ? <> &middot; 1 hint</> : null}</>
            : g.status === 'lost' ? <>0/10 &middot; the other runner got home</>
            : <>0/10 &middot; the win is still in the position</>}
          onShare={copyShare}
          shareLabel={copied ? 'Copied' : 'Share Result'}
          onReplay={resetGame}
          onClose={() => setEndClosed(true)}
        />
      )}

      <DuelBanner token={duelToken} info={duelInfo} submitted={duelSubmitted} />

      {toast && (
        <div style={{ position: 'fixed', left: '50%', bottom: 26, transform: 'translateX(-50%)', background: COLORS.ink, color: T.white, fontFamily: SANS, fontWeight: 800, fontSize: 13.5, padding: '10px 18px', borderRadius: 9, zIndex: 60, boxShadow: '0 6px 18px rgba(20,22,28,0.25)', maxWidth: '86vw', textAlign: 'center' }}>
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
            <button className="rc-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: T.white }}>Play</button>
          </div>
        </div>
      )}

      <section style={{ position: 'relative', display: focusMode ? 'none' : 'block', zIndex: 2, maxWidth: 620, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Race</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Race is a free daily pawn-race puzzle from Mind Loft. Three pawns a side on a small board: a pawn moves one square straight forward onto an empty square, or one square diagonally forward onto an empty square or an enemy pawn, and the first pawn to reach the far rank wins on the spot. The rules take ten seconds; the counting takes the rest.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Every position is proven, by two independent solvers, to be a win for you in exactly the stated number of moves against perfect defence, with exactly one first move that keeps it. There are no draws in this game at all, so every other first move genuinely loses, and the defence, which plays the position perfectly, will show you how.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new position drops every day at midnight Eastern, the race deepens through the week, and the Sunday Edition is the longest of all. No app, no signup, play free in your browser, keep a streak, and race the daily leaderboard. More endgame dailies: <a href="/four" style={{ color: COLORS.ink, fontWeight: 800 }}>Four</a>, one column wins, <a href="/queen" style={{ color: COLORS.ink, fontWeight: 800 }}>Queen</a>, walk the pawn home, and <a href="/turn" style={{ color: COLORS.ink, fontWeight: 800 }}>Turn</a>, ten squares left.
        </p>
      </section>

      <div style={{ position: 'relative', zIndex: 2, display: focusMode ? 'none' : 'block' }}><Footer /></div>
    </div>
  );
}

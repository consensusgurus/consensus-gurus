'use client';

// Mate — the daily chess endgame.
//
// Each day: a position with White to play and forced checkmate. Weekdays are
// mate in two, Sundays step up to a mate in three Edition. Tap one of your
// pieces, tap where it goes. There is exactly ONE first move that forces mate,
// and every other move on the board fails, so the puzzle is finding the key
// rather than trying things.
//
// You play the whole line, not just the key: after your first move Black
// answers with its stiffest defence and you have to finish the job. A move that
// is not the winning one is refused and costs an error, so the board never
// leaves the solution. Score is 10 minus two per error, floor 1, so a clean
// solve is a perfect 10 and ties break on fewest errors then fastest time.
//
// All chess rules live in ./chess.js, a small engine that skips castling, en
// passant and promotion because the bank guarantees none is ever legal (that
// file's header explains the guarantee). The engine was cross-checked against
// python-chess over 460,652 positions with zero disagreements.
//
// Same daily plumbing as Suds/Etch/Hedge: banked boards gated by Eastern date on
// the server (app/mate/page.js), per-puzzle localStorage saves, /mate?p=N
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
import DailyTopNav from '../DailyTopNav';
import DailyBoardPanel from '../quiz/[id]/DailyBoardPanel';
import { isMobileDevice } from '@/lib/is-mobile';
import useAbandonFlush from '../quiz/[id]/useAbandonFlush';
import { withRef } from '@/lib/referrals';
import { notifyShareCredit } from '../ShareCreditPop';
import DailyMasthead from '../DailyMasthead';
import { hintAllowed, spendHint } from '@/lib/hint-gate';
import {
  parseFen, applyMove, legalTargetsFrom, parseUci, uci,
  squareName, colorOf, inCheck, toSan, rowOf, fileOf,
} from './chess';
import { T } from '@/lib/theme';

const COLORS = {
  cream: T.surface,
  paper: T.paper,
  ink: T.ink,
  ember: T.accent,
  rust: T.danger,
  faded: T.muted,
  accent: '#6b4423',       // Mate identity — board walnut
  accentSoft: '#f6efe6',
  green: T.successDeep,
};
// The board itself. Warm walnut, the colours a chess player expects, so the
// game reads as chess before a word of copy is seen.
const LIGHT_SQ = '#efd9b5';
const DARK_SQ = '#b58863';
const SEL_SQ = 'rgba(107,68,35,0.55)';
const LAST_SQ = 'rgba(232,180,58,0.55)';

const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const HELP_KEY = 'sot_mate_help_seen';
const STATS_KEY = 'sot_mate_stats';

// The pieces are drawn as inline SVG rather than with the Unicode chess glyphs
// (\u2654-\u265f). Those glyphs are NOT present in every system font: on a machine
// without them the board renders six identical tofu boxes and the game is
// unplayable, which is exactly what happened on a test render here. Inline paths
// look the same everywhere and let each piece carry a contrasting outline, so a
// white piece reads on a light square and a black piece on a dark one.
// Drawn on the conventional 45x45 chess piece grid.
const PIECE_PATH = {
  K: 'M22.5 3.2 h4.6 v4.4 h4.4 v4.6 h-4.4 v3.1 a7.4 7.4 0 0 1 4.9 6.9 c0 2.6 -1.4 4.4 -3.1 6.6 l-1.9 2.4 h6.9 a3 3 0 0 1 3 3 v3.6 h-27 v-3.6 a3 3 0 0 1 3 -3 h6.9 l-1.9 -2.4 c-1.7 -2.2 -3.1 -4 -3.1 -6.6 a7.4 7.4 0 0 1 4.9 -6.9 v-3.1 h-4.4 v-4.6 h4.4 v-4.4 z',
  Q: 'M8.4 12.6 a2.7 2.7 0 1 1 2.7 2.7 l2.3 8.2 l3.4 -9.9 a2.7 2.7 0 1 1 3.1 -0.1 l3.6 10.4 l3.6 -10.4 a2.7 2.7 0 1 1 3.1 0.1 l3.4 9.9 l2.3 -8.2 a2.7 2.7 0 1 1 2.7 -2.7 a2.7 2.7 0 0 1 -1.6 2.5 l-3.4 12.4 h-19.6 l-3.4 -12.4 a2.7 2.7 0 0 1 -1.6 -2.5 z M12.8 30.5 h19.4 l0.9 3.2 h-21.2 z M10.5 35.6 h24 a2.6 2.6 0 0 1 2.6 2.6 v3.2 h-29.2 v-3.2 a2.6 2.6 0 0 1 2.6 -2.6 z',
  R: 'M10.2 8 h4.9 v3.4 h4.6 v-3.4 h5.6 v3.4 h4.6 v-3.4 h4.9 v8.4 l-3.2 3 v12.6 l3.2 3.1 v3.7 h-24.6 v-3.7 l3.2 -3.1 v-12.6 l-3.2 -3 z',
  B: 'M22.5 4.6 a2.9 2.9 0 0 1 1.9 5.1 c2.9 2.3 6.2 6.3 6.2 11 c0 2.8 -1.2 4.8 -2.6 6.6 h-11 c-1.4 -1.8 -2.6 -3.8 -2.6 -6.6 c0 -4.7 3.3 -8.7 6.2 -11 a2.9 2.9 0 0 1 1.9 -5.1 z M13.6 29.3 h17.8 a2 2 0 0 1 0 4 h-17.8 a2 2 0 0 1 0 -4 z M10 35.3 h25 a2.6 2.6 0 0 1 2.6 2.6 v3.5 h-30.2 v-3.5 a2.6 2.6 0 0 1 2.6 -2.6 z',
  N: 'M15.4 41.4 c0.6 -6.6 3.4 -10.2 7.4 -13.6 c2.1 -1.8 2.9 -3 2.8 -4.4 l-3.8 2.6 c-1.9 1.3 -3.6 1.6 -5 0.9 c-1.9 -1 -2.4 -3.3 -1.6 -5.6 l-2.4 0.7 c-1.2 0.3 -2.1 -0.6 -1.7 -1.8 c1.6 -4.9 4.6 -9 8.6 -11.6 l0.7 -2.9 a1.3 1.3 0 0 1 2.4 -0.2 l0.8 1.8 c4.3 0.3 8.3 2.6 10.6 6.6 c2 3.4 2.6 7.6 2.6 12.6 c0 6 -0.7 10.6 -1.4 14.9 z',
  P: 'M22.5 8.4 a5.6 5.6 0 0 1 3.6 9.9 c2.4 1.5 4.1 4 4.1 7.1 c0 2.3 -0.9 4 -1.9 5.6 h-11.6 c-1 -1.6 -1.9 -3.3 -1.9 -5.6 c0 -3.1 1.7 -5.6 4.1 -7.1 a5.6 5.6 0 0 1 3.6 -9.9 z M11.6 35.7 h21.8 a2.6 2.6 0 0 1 2.6 2.6 v3.1 h-27 v-3.1 a2.6 2.6 0 0 1 2.6 -2.6 z',
};
function Piece({ code }) {
  const white = code === code.toUpperCase();
  return (
    <svg className="mt-pc" viewBox="0 0 45 45" aria-hidden="true" focusable="false">
      <path
        d={PIECE_PATH[code.toUpperCase()]}
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

// ─── solution-tree navigation ──────────────────────────────────────────────
// `moves` alternates White, Black, White, ... so the node for the position after
// k full move pairs is reached by following each of Black's replies in turn.
function nodeAfter(solution, moves) {
  let node = solution;
  for (let i = 1; i < moves.length; i += 2) {
    node = node && node.lines ? node.lines[moves[i]] : null;
    if (!node) return null;
  }
  return node;
}
const expectedWhite = (node) => (node ? (node.key || node.move || node.mate || null) : null);
// How many White moves are still needed from this node. Counted from the tree
// rather than from (mateIn - moves played), because a mate in three can finish
// early down some defences and the board should say "deliver mate" when it is
// actually mate next move.
function mateDistance(node) {
  if (!node) return 0;
  if (node.mate) return 1;
  let deepest = 0;
  for (const k of Object.keys(node.lines || {})) deepest = Math.max(deepest, mateDistance(node.lines[k]));
  return 1 + deepest;
}

// Every player must face the SAME defence or the leaderboard is not comparing
// like with like, so Black's reply is chosen deterministically from the puzzle
// id rather than at random. Replies are sorted first so the choice never depends
// on object key order.
function pickReply(node, quizId) {
  const replies = Object.keys(node.lines).sort();
  let h = 2166136261;
  for (let i = 0; i < quizId.length; i++) { h ^= quizId.charCodeAt(i); h = Math.imul(h, 16777619); }
  return replies[Math.abs(h) % replies.length];
}

const HAPT = { ok: [7], wrong: [0, 26, 34, 26], win: [10, 40, 20, 40, 20, 60] };
function vibrate(p) { try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(p); } catch (e) {} }

function freshState() {
  return { v: 1, moves: [], errors: 0, hintUsed: false, status: 'playing', t0: null, tEnd: null };
}

export default function MateClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const STORE_KEY = `sot_mate_${PUZZLE.num}`;
  const START = useMemo(() => parseFen(PUZZLE.fen), [PUZZLE]);

  const [g, setG] = useState(() => freshState());
  const gRef = useRef(g);
  const [sel, setSel] = useState(null);           // selected square, or null
  const [shake, setShake] = useState(0);          // bumps to replay the refusal flash
  const [hintPiece, setHintPiece] = useState(null);
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
  // One free hint, first play only (see lib/hint-gate.js). Eligibility is
  // re-read whenever stats change, so the server-history merge can revoke it
  // for a returning player on a new device.
  const [hintOk, setHintOk] = useState(false);
  useEffect(() => { if (stats) setHintOk(hintAllowed('mate', stats)); }, [stats]);
  useEffect(() => { if (g.hintUsed) spendHint('mate'); }, [g.hintUsed]);
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
  const errors = g.errors;
  const finalScore = won ? Math.max(1, Math.min(10, 10 - errors * 2)) : 0;
  // Black's reply is appended a beat after White's move, so an odd move count
  // means the reply is still in flight and the board is not yours to touch.
  const awaitingReply = moves.length % 2 === 1;

  // The live position, rebuilt from the move list. Keeping only the moves in
  // state means a save is four short strings and can never drift from the board.
  const pos = useMemo(() => {
    let b = START.board;
    for (const m of moves) { const { from, to } = parseUci(m); b = applyMove(b, from, to); }
    return b;
  }, [START, moves]);
  const node = useMemo(() => nodeAfter(PUZZLE.solution, moves), [PUZZLE, moves]);
  const lastMove = moves.length ? parseUci(moves[moves.length - 1]) : null;
  const myTurn = playing && started && !awaitingReply;
  const whiteInCheck = useMemo(() => inCheck(pos, 'w'), [pos]);
  const blackInCheck = useMemo(() => inCheck(pos, 'b'), [pos]);
  // Moves left for White, for the "mate in N" line above the board. While
  // Black's reply is still in flight the count belongs to the position that
  // reply arrives at, which is one node deeper, so it is read off the node the
  // player will actually face.
  const movesLeft = awaitingReply ? Math.max(1, mateDistance(node) - 1) : Math.max(1, mateDistance(node));

  // SAN of everything played, for the move list under the board.
  const sanList = useMemo(() => {
    let b = START.board;
    const out = [];
    for (const m of moves) {
      const { from, to } = parseUci(m);
      out.push(toSan(b, from, to));
      b = applyMove(b, from, to);
    }
    return out;
  }, [START, moves]);

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
        if (done || g.t0) localStorage.setItem('sot_mate_day', JSON.stringify({ d: etToday(), done }));
        else localStorage.removeItem('sot_mate_day');
      }
    } catch (e) {}
  }, [g, hydrated, STORE_KEY, PUZZLE, puzzles]);

  // Live game clock. `elapsed` below is derived from the current time, and it
  // used to read Date.now() during render, so the displayed clock only advanced
  // when something else happened to re-render the board. This ticks a state
  // value while the game is actually running, so the readout moves on its own.
  // Display only: the elapsed time recorded on the result is still computed
  // from a real Date.now() delta at the moment the game ends.
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
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  const elapsed = g.t0 ? fmtTime((g.tEnd || nowTick) - g.t0) : '0:00';
  const isTodays = PUZZLE.num === pickPuzzle(puzzles, null).num;
  const prevPuzzle = puzzles.find((x) => x.num === PUZZLE.num - 1) || null;
  const myStats = deriveStats(stats, pickPuzzle(puzzles, null).num);

  const REC_KEY = `sot_mate_rec_${PUZZLE.num}`;
  const abandon = useAbandonFlush(() => {
    const cur = gRef.current;
    const acted = cur.moves.length > 0 || cur.errors > 0 || cur.hintUsed;
    if (!acted || cur.status !== 'playing') return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - (cur.t0 || Date.now())) / 1000)));
    try { localStorage.setItem(REC_KEY, '1'); } catch (e) {}
    return { quizId: PUZZLE.quizId, score: 0, total: 10, correct: 0, guessesUsed: 0, timeElapsed: el, abandoned: true, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') };
  });

  function postResult(g2, score) {
    abandon.markFlushed();
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    try { setStats(recordStat(PUZZLE.num, { s: score, t: 10, g: g2.errors, won: g2.status === 'won' && g2.errors === 0 })); } catch (e) {}
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

  // Append Black's scripted defence a beat after White's move, so the board
  // reads as a game rather than as two moves landing at once.
  function scheduleReply(afterMoves) {
    if (replyTimer.current) clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      const cur = gRef.current;
      if (cur.status !== 'playing' || cur.moves.length !== afterMoves.length) return;
      const n = nodeAfter(PUZZLE.solution, cur.moves);
      if (!n || !n.lines) return;
      commit({ ...cur, moves: [...cur.moves, pickReply(n, PUZZLE.quizId)] });
      vibrate(HAPT.ok);
    }, 620);
  }
  // A save made in that 620ms window would restore a half-finished move pair, so
  // the reply is re-scheduled whenever the board is left waiting for one.
  useEffect(() => {
    if (!hydrated || !playing) return undefined;
    if (moves.length % 2 === 1) scheduleReply(moves);
    return () => { if (replyTimer.current) clearTimeout(replyTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, playing, moves.length]);

  function tryMove(from, to) {
    const cur = gRef.current;
    if (cur.status !== 'playing' || cur.moves.length % 2 === 1) return;
    const move = uci(from, to);
    const n = nodeAfter(PUZZLE.solution, cur.moves);
    const want = expectedWhite(n);
    if (move !== want) {
      // Refused: the board does not move, because every position after a losing
      // move is off the solution tree and there would be nothing to play against.
      const g2 = { ...cur, errors: cur.errors + 1 };
      if (!g2.t0) g2.t0 = Date.now();
      commit(g2);
      setSel(null);
      setShake((k) => k + 1);
      vibrate(HAPT.wrong);
      say(n && n.mate ? 'Not mate. Look for the move that ends it now.' : 'Black escapes that one. Try another move.');
      return;
    }
    const nextMoves = [...cur.moves, move];
    const g2 = { ...cur, moves: nextMoves };
    if (!g2.t0) g2.t0 = Date.now();
    setSel(null);
    setHintPiece(null);
    if (n.mate) {
      g2.status = 'won';
      g2.tEnd = Date.now();
      vibrate(HAPT.win);
      postResult(g2, Math.max(1, Math.min(10, 10 - g2.errors * 2)));
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
    const piece = pos[sq];
    if (sel === sq) { setSel(null); return; }
    if (piece && colorOf(piece) === 'w') { setSel(sq); return; }
    if (sel != null) {
      const targets = legalTargetsFrom(pos, 'w', sel);
      if (targets.includes(sq)) { tryMove(sel, sq); return; }
      setSel(null);
    }
  }

  const targets = useMemo(() => (sel != null && myTurn ? legalTargetsFrom(pos, 'w', sel) : []), [sel, pos, myTurn]);

  // One free hint: names the piece to move, never the square, so the player
  // still has to find the move.
  function useHint() {
    if (!hintOk) return;
    const cur = gRef.current;
    if (cur.status !== 'playing' || cur.hintUsed) return;
    const n = nodeAfter(PUZZLE.solution, cur.moves);
    const want = expectedWhite(n);
    if (!want) return;
    const from = parseUci(want).from;
    const g2 = { ...cur, hintUsed: true };
    if (!g2.t0) g2.t0 = Date.now();
    commit(g2);
    setHintPiece(from);
    const names = { K: 'king', Q: 'queen', R: 'rook', B: 'bishop', N: 'knight', P: 'pawn' };
    say(`It is the ${names[(pos[from] || 'P').toUpperCase()]} that moves.`);
  }

  // Give up: play the rest of the solution out on the board, score 0.
  function revealEnd() {
    const cur = gRef.current;
    let ms = cur.moves.slice();
    let n = nodeAfter(PUZZLE.solution, ms);
    // Finish the pair first if Black's reply had not landed yet.
    if (ms.length % 2 === 1 && n && n.lines) { ms = [...ms, pickReply(n, PUZZLE.quizId)]; n = nodeAfter(PUZZLE.solution, ms); }
    let guard = 0;
    while (n && guard++ < 8) {
      const w = expectedWhite(n);
      if (!w) break;
      ms = [...ms, w];
      if (n.mate) break;
      const reply = pickReply(n, PUZZLE.quizId);
      ms = [...ms, reply];
      n = n.lines[reply];
    }
    const g2 = { ...cur, moves: ms, status: 'revealed', tEnd: Date.now() };
    if (!g2.t0) g2.t0 = Date.now();
    postResult(g2, 0);
    commit(g2);
    setSel(null);
  }

  function takeBack() {
    const cur = gRef.current;
    if (cur.status !== 'playing' || !cur.moves.length) return;
    if (replyTimer.current) clearTimeout(replyTimer.current);
    // Step back a whole move pair, so it is always White to move again.
    const keep = cur.moves.length - (cur.moves.length % 2 === 1 ? 1 : 2);
    commit({ ...cur, moves: cur.moves.slice(0, Math.max(0, keep)) });
    setSel(null);
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    if (replyTimer.current) clearTimeout(replyTimer.current);
    commit(freshState());
    setSel(null); setHintPiece(null); setEndClosed(false);
  }

  function shareUrl() {
    return withRef(`sourceoftruths.com/mate${isTodays ? '' : `?p=${PUZZLE.num}`}`);
  }
  function shareText() {
    const g5 = won ? Math.max(1, Math.round(finalScore / 2)) : 0;
    const squares = '\u{1F7E9}'.repeat(g5) + '⬜'.repeat(5 - g5);
    const hintBit = g.hintUsed ? ' · \u{1F4A1}' : '';
    const streakBit = isTodays && myStats.cur >= 2 ? ` · streak ${myStats.cur}` : '';
    const head2 = won
      ? `Mate #${PUZZLE.num}${PUZZLE.sunday ? ' · Sunday' : ''} · mate in ${PUZZLE.mateIn} · ${errors === 0 ? 'first try' : `${errors} miss${errors === 1 ? '' : 'es'}`} · ${elapsed}${hintBit}${streakBit}`
      : `Mate #${PUZZLE.num} · gave up`;
    return `${head2}\n${squares}\n${shareUrl()}`;
  }
  function copyShare() {
    const text = playing
      ? `Mate #${PUZZLE.num} — the daily chess endgame from Mind Loft.\n${shareUrl()}`
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
      <p style={{ margin: '0 0 9px' }}>You are <b>White</b>, and you move first. There is a forced <b>checkmate in {PUZZLE.mateIn}</b> moves on the board. <b>Tap one of your pieces</b>, and the squares it can legally reach light up. <b>Tap one</b> to play the move.</p>
      <p style={{ margin: '0 0 9px' }}>Exactly <b>one</b> first move forces mate. Every other move on the board, however forcing it looks, lets Black wriggle out, so the puzzle is finding the key rather than trying things. A move that is not the winning one is <b>refused</b>, the board stays put, and it costs you an error.</p>
      <p style={{ margin: '0 0 9px' }}>Play the whole line, not just the key. After your move Black answers with its best defence, and you have to <b>finish the job</b>{PUZZLE.mateIn > 2 ? ', twice over on a Sunday' : ''}. One free <b>hint</b>, on your first ever play, tells you which piece moves, never where it goes.</p>
      <p style={{ margin: 0 }}>A <b>clean solve scores 10</b>, and every miss costs two, down to a floor of one. Ties break on fewest misses, then fastest time. Weekdays are mate in two, and <b>Sundays</b> step up to mate in three.</p>
    </div>
  );

  const fileLabels = 'abcdefgh'.split('');

  return (
    <div style={{ minHeight: '100vh', background: T.surface, position: 'relative' }}>
      <Grain />
      <div className="mt-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.mt-wrap{padding-left:10px !important;padding-right:10px !important;}}
          .mt-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid var(--blue-deep);background:var(--white);color:var(--blue-deep);border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .mt-btn:hover{background:var(--accent-soft);}
          .mt-tool{font-family:${SANS};font-weight:800;font-size:12.5px;border:1.5px solid rgba(28,30,36,0.35);background:var(--white);color:${COLORS.ink};border-radius:8px;padding:7px 11px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;}
          .mt-sq{position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;min-width:0;min-height:0;}
          .mt-pc{display:block;width:86%;height:86%;pointer-events:none;filter:drop-shadow(0 1px 1px rgba(0,0,0,0.25));}
          .mt-dot{position:absolute;width:28%;height:28%;border-radius:50%;background:rgba(28,30,36,0.32);pointer-events:none;}
          .mt-ring{position:absolute;inset:6%;border-radius:50%;border:min(1.1vw,6px) solid rgba(28,30,36,0.3);pointer-events:none;}
          .mt-board.shake{animation:mtshake .34s ease;}
          @keyframes mtshake{0%,100%{transform:translateX(0);}22%{transform:translateX(-6px);}55%{transform:translateX(6px);}80%{transform:translateX(-3px);}}
          .mt-coord{position:absolute;font-family:${MONO};font-size:min(2vw,10px);font-weight:500;opacity:.62;pointer-events:none;}
        `}</style>

        <div style={{ maxWidth: 660, margin: '0 auto' }}>

        <div style={{ display: 'block' }}><DailyTopNav player={player} compact={playing} /></div>

        <DailyMasthead
          slug="mate"
          num={PUZZLE.num}
          dateLabel={PUZZLE.dateLabel}
          accent={COLORS.accent}
          blockGap={5}
          helpTop={13}
          marginBottom={16}
          onHelp={() => setShowHelp(true)}
          sunday={PUZZLE.sunday && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: T.white, background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>Sunday Edition &middot; Mate in 3</span>}
          blocks={'MATE'.split('').map((ch, i) => (
              <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 26, background: i === 3 ? COLORS.accent : COLORS.ink, color: T.white, boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
            ))}
        />

        {preStart && (
          <div style={{ background: COLORS.cream, border: `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '22px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>{gateRules ? 'How to play' : 'Mate is ready'}</div>
            {gateRules ? rulesBody : (
              <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
                <p style={{ margin: '0 0 6px' }}>White to play and force checkmate in {PUZZLE.mateIn}. Tap a piece, tap where it goes. Only one first move works.</p>
              </div>
            )}
            <div style={{ marginTop: 18 }}>
              <button className="mt-btn" onClick={startGame} style={{ background: T.cta, color: T.white, fontSize: 15, padding: '11px 22px' }}>Start</button>
              <div style={{ marginTop: 10 }}>
                <button type="button" onClick={() => setGateRules((v) => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.faded, textDecoration: 'underline' }}>
                  {gateRules ? 'Hide detailed instructions' : 'Show detailed instructions'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!preStart && (
        <div style={{ background: T.white, border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '13px 15px 15px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, borderBottom: '1px solid rgba(28,30,36,0.18)', paddingBottom: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ whiteSpace: 'nowrap' }}>misses <b style={{ color: errors > 0 ? COLORS.rust : COLORS.ink, fontWeight: 500 }}>{errors}</b></span>
            <span style={{ whiteSpace: 'nowrap' }}>time <b style={{ color: COLORS.ink, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{elapsed}</b></span>
            <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
              {playing ? <>mate in <b style={{ color: COLORS.accent, fontWeight: 500 }}>{Math.max(1, movesLeft)}</b></> : <>mate in <b style={{ color: COLORS.ink, fontWeight: 500 }}>{PUZZLE.mateIn}</b></>}
            </span>
          </div>

          <div style={{ maxWidth: 430, margin: '0 auto' }}>
            <div
              key={shake}
              className={`mt-board${shake ? ' shake' : ''}`}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(8, minmax(0, 1fr))', gridTemplateRows: 'repeat(8, minmax(0, 1fr))', aspectRatio: '1 / 1', border: `2px solid ${COLORS.ink}`, borderRadius: 4, overflow: 'hidden', touchAction: 'manipulation' }}
            >
              {Array.from({ length: 64 }).map((_, sq) => {
                const r = rowOf(sq), f = fileOf(sq);
                const dark = (r + f) % 2 === 1;
                const piece = pos[sq];
                const white = piece && colorOf(piece) === 'w';
                const isSel = sel === sq;
                const isTarget = targets.includes(sq);
                const isLast = lastMove && (lastMove.from === sq || lastMove.to === sq);
                const isHint = hintPiece === sq;
                const checked = piece && piece.toUpperCase() === 'K' &&
                  ((white && whiteInCheck) || (!white && blackInCheck));
                let bg = dark ? DARK_SQ : LIGHT_SQ;
                if (isLast) bg = `linear-gradient(${LAST_SQ},${LAST_SQ}), ${bg}`;
                if (isSel) bg = `linear-gradient(${SEL_SQ},${SEL_SQ}), ${dark ? DARK_SQ : LIGHT_SQ}`;
                if (checked) bg = `radial-gradient(circle, rgba(192,57,43,0.85) 12%, rgba(192,57,43,0.25) 62%, transparent 74%), ${dark ? DARK_SQ : LIGHT_SQ}`;
                return (
                  <div
                    key={sq}
                    className="mt-sq"
                    onClick={() => onSquare(sq)}
                    role="button"
                    tabIndex={-1}
                    aria-label={squareName(sq) + (piece ? ` ${white ? 'white' : 'black'} ${piece.toUpperCase()}` : ' empty')}
                    style={{ background: bg, boxShadow: isHint ? `inset 0 0 0 3px ${T.successDeep}` : undefined }}
                  >
                    {f === 0 && (
                      <span className="mt-coord" style={{ left: 2, top: 1, color: dark ? LIGHT_SQ : DARK_SQ }}>{8 - r}</span>
                    )}
                    {r === 7 && (
                      <span className="mt-coord" style={{ right: 3, bottom: 1, color: dark ? LIGHT_SQ : DARK_SQ }}>{fileLabels[f]}</span>
                    )}
                    {piece && <Piece code={piece} />}
                    {isTarget && !piece && <span className="mt-dot" />}
                    {isTarget && piece && <span className="mt-ring" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 12, minHeight: 22, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color: playing ? COLORS.accent : COLORS.faded }}>
              {!playing
                ? (won ? 'Checkmate.' : 'The solution is on the board.')
                : awaitingReply
                  ? 'Black is thinking...'
                  : movesLeft <= 1
                    ? 'Deliver mate.'
                    : `White to play, mate in ${movesLeft}.`}
            </span>
            {sanList.length > 0 && (
              <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 12, color: COLORS.faded, fontWeight: 500 }}>
                {sanList.map((s, i) => (i % 2 === 0 ? `${i / 2 + 1}. ${s}` : s)).join(' ')}
              </span>
            )}
          </div>

          {playing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
              <button className="mt-tool" onClick={takeBack} disabled={!moves.length} title="Step back to the start of the line" style={{ opacity: moves.length ? 1 : 0.4, cursor: moves.length ? 'pointer' : 'default' }}>
                <RotateCcw size={14} /> Take back
              </button>
              {hintOk && !g.hintUsed && (
                <button className="mt-tool" onClick={useHint} title="Name the piece that moves (one hint, first play only)" style={{ background: COLORS.accentSoft, borderColor: 'rgba(107,68,35,0.5)', color: '#5c3a1e' }}>
                  <Lightbulb size={14} /> Hint
                </button>
              )}
            </div>
          )}
        </div>
        )}

        {started && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: COLORS.faded }}>
              Tap a white piece, then tap where it goes. Only one move forces mate.
            </span>
            <button onClick={() => { if (armReveal) { setArmReveal(false); revealEnd(); } else { setArmReveal(true); } }}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS, fontWeight: 700, fontSize: 12, color: armReveal ? COLORS.rust : COLORS.faded, textDecoration: 'underline', textUnderlineOffset: 3, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Eye size={13} /> {armReveal ? 'Tap again — ends the puzzle and plays the answer' : 'Reveal & end'}
            </button>
          </div>
        )}

        {!playing && (
          <div style={{ maxWidth: 472, margin: '0 auto' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.ink, margin: '8px 0 0' }}>
              The key: <span style={{ color: COLORS.accent }}>{PUZZLE.keySan}</span>.
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.faded, margin: '6px 0 0', lineHeight: 1.5 }}>{PUZZLE.motif}.</div>
            {PUZZLE.sunday && (
              <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.faded, fontStyle: 'italic', margin: '8px 0 0' }}>The Sunday Edition &mdash; a mate in three.</div>
            )}
            {isTodays && myStats.cur >= 2 && (
              <div style={{ fontSize: 13, fontWeight: 800, margin: '12px 0 0', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ color: '#b45309' }}>{myStats.cur}-day streak</span>
              </div>
            )}
            <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
              {isTodays ? (
                <>
                  {countdown ? <>Next Mate in <b style={{ color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{countdown}</b>.</> : 'A new position drops at midnight Eastern.'}
                  {prevPuzzle && (
                    <>
                      {' '}Meanwhile:{' '}
                      <a href={`/mate?p=${prevPuzzle.num}`} style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>
                        play yesterday&rsquo;s Mate &rarr;
                      </a>
                    </>
                  )}
                </>
              ) : (
                <>
                  You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                  <a href="/mate" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s Mate &rarr;</a>
                  {' · '}
                  <a href="/daily" style={{ color: COLORS.faded, fontWeight: 700, textDecoration: 'underline' }}>All daily puzzles</a>
                </>
              )}
            </p>
          </div>
        )}

        {focusMode && (
          <div style={{ maxWidth: 620, margin: '30px auto 0', textAlign: 'center' }}>
            <button onClick={() => setShowChrome(true)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: '0.03em', color: T.blueDeep, background: 'none', border: '1.5px solid var(--accent-border)', borderRadius: 9, padding: '10px 20px', cursor: 'pointer' }}>Show leaderboard &amp; more</button>
            <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.faded, fontWeight: 600, marginTop: 8 }}>Leaderboards, share for credit &amp; the other daily puzzles</div>
          </div>
        )}
        <div style={{ display: focusMode ? 'none' : 'block', margin: '30px auto 0' }}>
          <DailyGamesGrid replay={!playing ? resetGame : null}
            self="mate"
            maxWidth={620}
            challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`}
            share={{ label: copied ? 'Copied' : 'Share', onClick: copyShare }}
            light
            boardSlot={<DailyBoardPanel self="mate" quizId={PUZZLE.quizId} maxWidth={620} streak={{ current: myStats.cur, best: myStats.max }} />}
            divider
          />
          {mobileUi && !standalone && (
            <button onClick={a2hsClick} style={{ marginTop: 10, width: '100%', fontFamily: SANS, fontSize: 13.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 800, height: 54, borderRadius: 10, border: 'none', background: COLORS.accent, color: T.white, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, whiteSpace: 'nowrap' }}>
              <Smartphone size={15} strokeWidth={2.5} /> Add to Home Screen
            </button>
          )}
        </div>
        {showA2hsHelp && (
          <div onClick={() => setShowA2hsHelp(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,22,28,0.55)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: T.white, borderRadius: 14, maxWidth: 430, width: '100%', padding: '22px 22px 16px', fontFamily: SANS, border: '1.5px solid rgba(20,22,28,0.12)' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Mate to your Home Screen</div>
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

      {!playing && !endClosed && (
        <DailyEndCard
          modal
          self="mate"
          won={won}
          headline={won ? <>Checkmate!</> : <>You scored {Math.round(((won ? finalScore : 0) / 10) * 100)}%</>}
          subline={won
            ? <>{finalScore}/10 &middot; {errors === 0 ? 'found it first try' : `${errors} miss${errors === 1 ? '' : 'es'}`} &middot; {elapsed}{g.hintUsed ? <> &middot; 1 hint</> : null}</>
            : <>0/10 &middot; the winning line is on the board</>}
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
            <button className="mt-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: T.white }}>Play</button>
          </div>
        </div>
      )}

      <section style={{ position: 'relative', display: focusMode ? 'none' : 'block', zIndex: 2, maxWidth: 620, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Mate</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Mate is a free daily chess puzzle from Mind Loft. Every position has White to play and a forced checkmate, and your job is to find it. Tap a piece and its legal squares light up, so you never need to know chess notation to play.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Each board has exactly one first move that works, verified by two independent solvers, and the mate is in exactly the stated number of moves, never fewer. You play the line out to the end: Black answers your key move with its best defence and you have to finish. A move that does not force mate is refused rather than punished with a lost position, so the puzzle stays a puzzle.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new position drops every day at midnight Eastern, and Sundays step up to a mate in three. No app, no signup, play free in your browser, keep a streak, and race the daily leaderboard. More dailies: <a href="/etch" style={{ color: COLORS.ink, fontWeight: 800 }}>Etch</a>, our daily nonogram, <a href="/suds" style={{ color: COLORS.ink, fontWeight: 800 }}>Suds</a>, our daily sudoku, and <a href="/crux" style={{ color: COLORS.ink, fontWeight: 800 }}>Crux</a>, our clueless crossword.
        </p>
      </section>

      <div style={{ position: 'relative', zIndex: 2, display: focusMode ? 'none' : 'block' }}><Footer /></div>
    </div>
  );
}

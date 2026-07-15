'use client';

// Crux — a clue-less mini crossword with letter-feedback guessing and
// hidden category pairs.
//
// Eight hidden words interlock in a mini crossword grid. There are no clues:
// the only hints are four categories, each owning exactly two of the eight
// words (which slots? that's the puzzle). Every slot is solved by guessing —
// type any letters, get locked/close feedback per letter — and locked
// letters stay in the grid, bleeding into crossing slots. The whole
// board shares one guess budget. Solved words are then filed under their
// category to finish. Filing is penalty-free — the categories' job is to be
// the clues (and the traps) during the guessing phase.
//
// Soft launch: this page is intentionally NOT linked from the homepage, the
// /quizzes hub, or the sitemap. Reachable only at /crux.

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, Share2, RotateCcw, X, ChevronLeft, ChevronRight, Swords, Smartphone, Lightbulb } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import DailyGamesPromo from '../DailyGamesPromo';
import useDuelContext, { DuelBanner } from '../quiz/[id]/useDuelContext';
import JoinLeaderboardForm from '../quiz/[id]/JoinLeaderboardForm';
import DailyGamesGrid from '../DailyGamesGrid';
import QuizLeaderboard from '../quiz/[id]/QuizLeaderboard';
import { isMobileDevice } from '@/lib/is-mobile';

const COLORS = {
  cream: '#f7f8fa',
  paper: '#eceef1',
  ink: '#1c1e24',
  ember: '#2563eb',
  rust: '#c0392b',
  faded: '#6b7280',
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
// Editorial ink-and-paper identity (owner-approved mockup, 2026-07-11).
// Fraunces + DM Mono are already loaded site-wide by app/layout.js.
const SERIF = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const PAPER = '#fbf9f4';
const TILE = '#ffffff';
const TILE_BORDER = 'rgba(28,30,36,0.42)';

// iOS/iPadOS never fires beforeinstallprompt — A2HS lives in Safari's share
// sheet, so the button opens instructions there instead.
const isIosDevice = () =>
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent || '') ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));


// Category palette, easiest -> trickiest: yellow, green, blue, RED — the
// fourth is red (owner call 2026-07-07) so the set isn't the familiar
// grouping-game quartet.
const CAT_COLORS = [
  { bg: '#e6b93f', tc: '#5c4a06', sq: '\u{1F7E8}' },
  { bg: '#5aa96a', tc: '#173f1f', sq: '\u{1F7E9}' },
  { bg: '#5a97dd', tc: '#0c3a66', sq: '\u{1F7E6}' },
  { bg: '#d96363', tc: '#571212', sq: '\u{1F7E5}' },
];

// ─── Puzzles ────────────────────────────────────────────────────────────────
// One entry per drop. `live` gates by Eastern date: /crux plays the newest
// puzzle whose live date has arrived, so future puzzles can be banked here
// and ship themselves at ET midnight. Each puzzle keys its own localStorage
// save (sot_crux_<num>), catalog id, and leaderboard. /crux?p=N pins an
// archived puzzle (the hub's dated tiles link that way).
const HELP_KEY = 'sot_crux_help_seen';
const STATS_KEY = 'sot_crux_stats';

// Every puzzle answer is always a legal guess, even the proper nouns that a
// Scrabble-style list omits (JUNO, MINERVA, URANUS...).
function buildAnswerWords(puzzles) {
  return new Set(puzzles.flatMap((pz) => pz.categories.flatMap((c) => c.words.map((w) => w.toLowerCase()))));
}

function etToday() {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  } catch (e) {
    return new Date().toISOString().slice(0, 10);
  }
}
function pickPuzzle(puzzles, forceNum) {
  if (forceNum) {
    const p = puzzles.find((x) => x.num === forceNum);
    if (p) return p;
  }
  const today = etToday();
  const open = puzzles.filter((p) => p.live <= today);
  return open.length ? open[open.length - 1] : puzzles[0];
}

function slotCells(s) {
  return s.word.split('').map((ch, i) => ({
    r: s.dir === 'A' ? s.row : s.row + i,
    c: s.dir === 'A' ? s.col + i : s.col,
    ch,
  }));
}

// key "r,c" -> { ch, slots: [slotIds] }
function buildCells(puzzle) {
  const m = new Map();
  for (const s of puzzle.slots) {
    for (const cl of slotCells(s)) {
      const k = `${cl.r},${cl.c}`;
      if (!m.has(k)) m.set(k, { ch: cl.ch, slots: [] });
      m.get(k).slots.push(s.id);
    }
  }
  return m;
}
function slotLabel(id) {
  return `${parseInt(id, 10)}-${id.endsWith('A') ? 'Across' : 'Down'}`;
}
function fmtTime(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ms until the next midnight Eastern — the next puzzle drop.
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

// ─── Personal stats + streak (localStorage) ────────────────────────────────
// One record per puzzle number, first completion only (replays don't rewrite
// history). Streak = consecutive puzzle numbers finished, ending at today's
// number (still alive if today isn't done yet). First run backfills from the
// per-puzzle saves that already exist in this browser.
function puzzleStoreKey(p) {
  return `sot_crux_${p.num}${p.rev ? `_r${p.rev}` : ''}`;
}
function backfillStats(puzzles) {
  const rec = {};
  for (const p of puzzles) {
    try {
      const raw = localStorage.getItem(puzzleStoreKey(p));
      if (!raw) continue;
      const sv = JSON.parse(raw);
      if (!sv || sv.status === 'playing') continue;
      const total = p.slots.length * 2;
      const score = sv.status === 'won' ? total : (sv.order || []).length + (sv.filedRight || 0);
      const guesses = Object.values(sv.slotGuesses || {}).reduce((a, b) => a + b, 0);
      rec[p.num] = { s: score, t: total, g: guesses, won: sv.status === 'won' };
    } catch (e) {}
  }
  return { v: 1, rec };
}
function getStats(puzzles) {
  try {
    const s = JSON.parse(localStorage.getItem(STATS_KEY));
    if (s && s.v === 1 && s.rec) return s;
  } catch (e) {}
  const s = backfillStats(puzzles);
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch (e) {}
  return s;
}
function recordStat(puzzles, num, entry) {
  const s = getStats(puzzles);
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
  // average guesses only over records that carry a guess count (server-merged
  // history from other devices doesn't)
  const withG = nums.filter((n) => typeof rec[n].g === 'number');
  const totG = withG.reduce((a, n) => a + rec[n].g, 0);
  return { played, perfect, cur, max, avgG: withG.length ? totG / withG.length : 0, avgN: withG.length };
}

// Local saves only know about games finished IN THIS BROWSER. The server has
// every completed play (quiz_results), so prior days and other devices come
// from /api/quiz/me `recent` history. First attempts only, and a local record
// wins over the server one (it carries the guess count).
function mergeServerStats(s, recent, puzzles) {
  if (!s || !Array.isArray(recent) || !recent.length) return s;
  const byQuiz = {};
  for (const p of puzzles) byQuiz[p.quizId] = p;
  let rec = s.rec, changed = false;
  for (const m of recent) {
    const p = m && byQuiz[m.quizId];
    if (!p || m.attempt !== 1) continue;
    if (rec[p.num]) continue;
    const t = p.slots.length * 2;
    const sc = Math.max(0, Math.min(t, Math.round(((m.scorePct || 0) / 100) * t)));
    if (!changed) { rec = { ...rec }; changed = true; }
    rec[p.num] = { s: sc, t, g: null, won: !!m.perfect };
  }
  if (!changed) return s;
  const s2 = { ...s, rec };
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s2)); } catch (e) {}
  return s2;
}

// Same anon identity the other quiz boards use, so plays attribute correctly
// and a later leaderboard join claims this browser's past results.
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

// Per-letter feedback marking with duplicate handling.
export function computeMarks(guess, answer) {
  const n = answer.length;
  const marks = Array(n).fill('x');
  const rem = {};
  for (let i = 0; i < n; i++) {
    if (guess[i] === answer[i]) marks[i] = 'g';
    else rem[answer[i]] = (rem[answer[i]] || 0) + 1;
  }
  for (let i = 0; i < n; i++) {
    if (marks[i] !== 'g' && rem[guess[i]] > 0) {
      marks[i] = 'y';
      rem[guess[i]] -= 1;
    }
  }
  return marks;
}

function freshState(puzzle) {
  return {
    v: 1,
    greens: {},          // "r,c" -> true (letter is locked correct)
    solved: {},          // slotId -> true
    slotGuesses: {},     // slotId -> guesses spent on that slot
    present: {},         // slotId -> "ABC" letters known in word
    absent: {},          // slotId -> "XYZ" letters known absent
    lastGuess: {},       // slotId -> { word, marks[] }
    assigned: {},        // WORD -> category index (correct filings only)
    order: [],           // slotIds in solve order
    filedRight: null,    // set by the single Lock-it-in: words correctly categorized
    hintUsed: false,     // the one free letter reveal
    left: puzzle.guesses,
    status: 'playing',   // playing | won | lost
    t0: null,
    tEnd: null,
  };
}

export default function CruxClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const ANSWER_WORDS = useMemo(() => buildAnswerWords(puzzles), [puzzles]);
  const ROWS = PUZZLE.rows;
  const COLS = PUZZLE.cols;
  const STORE_KEY = `sot_crux_${PUZZLE.num}${PUZZLE.rev ? `_r${PUZZLE.rev}` : ''}`;
  const SLOT = useMemo(() => Object.fromEntries(PUZZLE.slots.map((s) => [s.id, s])), [PUZZLE]);
  const CELLS = useMemo(() => buildCells(PUZZLE), [PUZZLE]);
  const [g, setG] = useState(() => freshState(PUZZLE));
  const [sel, setSel] = useState(PUZZLE.slots[0].id);
  const [typed, setTyped] = useState('');
  const [pick, setPick] = useState(null); // solved word chosen for filing
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [installEvt, setInstallEvt] = useState(null);
  const [showA2hsHelp, setShowA2hsHelp] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [mobileUi, setMobileUi] = useState(false); // effect-set so SSR/hydration match
  const [kbdOpen, setKbdOpen] = useState(false); // desktop: on-screen keyboard collapsed by default
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

  const [armLock, setArmLock] = useState(false);
  const [justWon, setJustWon] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [identity, setIdentity] = useState(null);
  const [stats, setStats] = useState(null);
  const [player, setPlayer] = useState(null); // { name, rank } for the top-strip chip
  const [anim, setAnim] = useState(null);        // { id, flip: {key->i}, pulse: {key->true} } for the last guess
  const [endAnim, setEndAnim] = useState(false); // category cascade, only on the live end transition
  const [countdown, setCountdown] = useState('');
  const animSeq = useRef(0);
  const animTimer = useRef(null);
  const searchParams = useSearchParams();
  const { duelToken, duelInfo, duelSubmitted } = useDuelContext(PUZZLE.quizId, searchParams);
  const toastTimer = useRef(null);
  const wordSetRef = useRef(null);
  const viewedRef = useRef(false);

  // ---- persistence ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.v === 1) setG({ ...freshState(PUZZLE), ...saved });
      }
      if (!localStorage.getItem(HELP_KEY)) setShowHelp(true);
    } catch (e) {}
    try { setStats(getStats(puzzles)); } catch (e) {}
    setHydrated(true);
  }, []);

  // live countdown to the next drop, shown once the game is over
  useEffect(() => {
    if (g.status === 'playing') return;
    const tick = () => setCountdown(fmtCountdown(msToMidnightET()));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [g.status]);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(g)); } catch (e) {}
    // same-device day breadcrumb for cross-game recommendations — only for
    // TODAY'S puzzle (archive replays must not mark today as played)
    try {
      if (PUZZLE.num === pickPuzzle(puzzles, null).num) {
        localStorage.setItem('sot_crux_day', JSON.stringify({ d: etToday(), done: g.status !== 'playing' }));
      }
    } catch (e) {}
  }, [g, hydrated, PUZZLE]);

  // ---- metrics + leaderboard (same /api/quiz/* flow as every other board) ----
  // Guess dictionary (lazy, cached, ~115k words). Fail-open: until it loads,
  // any letters are accepted — never block play on a fetch.
  useEffect(() => {
    fetch('/crux-words.txt')
      .then((r) => (r.ok ? r.text() : ''))
      .then((t) => { if (t) wordSetRef.current = new Set(t.split('\n')); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const id = JSON.parse(localStorage.getItem('sot_quiz_identity'));
      if (id && id.email) setIdentity(id);
    } catch (e) {}
    // cross-device stats: merge this player's server-side play history
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
              setStats((cur) => mergeServerStats(cur || getStats(puzzles), d.recent, puzzles));
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
  }, []);

  function say(msg) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1900);
  }

  const slot = SLOT[sel];
  const cells = useMemo(() => (slot ? slotCells(slot) : []), [slot]);
  const editable = cells.filter((cl) => !g.greens[`${cl.r},${cl.c}`]);
  const playing = g.status === 'playing';

  // ---- input ----
  const onKey = useCallback((k) => {
    if (g.status !== 'playing') return;
    if (g.left <= 0) return;
    if (!slot || g.solved[sel]) return;
    if (k === 'ENTER') submit();
    else if (k === 'BACK') setTyped((t) => t.slice(0, -1));
    else if (/^[A-Z]$/.test(k)) setTyped((t) => (t.length < editable.length ? t + k : t));
  }, [g, sel, slot, typed, editable.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onDown(e) {
      if (showHelp) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'Enter') { e.preventDefault(); onKey('ENTER'); }
      else if (e.key === 'Backspace') { e.preventDefault(); onKey('BACK'); }
      else if (/^[a-zA-Z]$/.test(e.key)) onKey(e.key.toUpperCase());
    }
    window.addEventListener('keydown', onDown);
    return () => window.removeEventListener('keydown', onDown);
  }, [onKey, showHelp]);

  function sweepAutoSolve(g2) {
    for (const s of PUZZLE.slots) {
      if (g2.solved[s.id]) continue;
      const full = slotCells(s).every((cl) => g2.greens[`${cl.r},${cl.c}`]);
      if (full) {
        g2.solved = { ...g2.solved, [s.id]: true };
        g2.order = [...g2.order, s.id];
      }
    }
  }

  function nextUnsolved(g2, fromId) {
    const ids = PUZZLE.slots.map((s) => s.id);
    const start = Math.max(0, ids.indexOf(fromId));
    for (let i = 1; i <= ids.length; i++) {
      const id = ids[(start + i) % ids.length];
      if (!g2.solved[id]) return id;
    }
    return fromId;
  }

  function submit() {
    if (!playing || !slot || g.solved[sel]) return;
    if (typed.length < editable.length) { say('Not enough letters'); return; }
    let ti = 0;
    const letters = cells.map((cl) => (g.greens[`${cl.r},${cl.c}`] ? cl.ch : typed[ti++]));
    const guess = letters.join('');
    if (guess !== slot.word && !ANSWER_WORDS.has(guess.toLowerCase())) {
      const ws = wordSetRef.current;
      if (ws && !ws.has(guess.toLowerCase())) {
        say('Not in the word list');
        return;
      }
    }
    const marks = computeMarks(guess, slot.word);

    const g2 = { ...g };
    if (!g2.t0) g2.t0 = Date.now();
    g2.left = g.left - 1;
    g2.slotGuesses = { ...g.slotGuesses, [sel]: (g.slotGuesses[sel] || 0) + 1 };
    const greens2 = { ...g.greens };
    cells.forEach((cl, i) => { if (marks[i] === 'g') greens2[`${cl.r},${cl.c}`] = true; });
    g2.greens = greens2;

    const pres = new Set((g.present[sel] || '').split('').filter(Boolean));
    const abs = new Set((g.absent[sel] || '').split('').filter(Boolean));
    marks.forEach((m, i) => {
      const L = guess[i];
      if (m === 'y') pres.add(L);
      else if (m === 'x') {
        const elsewhere = marks.some((mm, j) => j !== i && guess[j] === L && mm !== 'x');
        if (!elsewhere) abs.add(L);
      }
    });
    g2.present = { ...g.present, [sel]: [...pres].join('') };
    g2.absent = { ...g.absent, [sel]: [...abs].join('') };
    g2.lastGuess = { ...g.lastGuess, [sel]: { word: guess, marks } };

    // reveal animation: every cell of the guessed slot flips in sequence, and
    // newly locked letters that also sit in an unsolved crossing slot pulse —
    // the bleed is the signature mechanic, make it visible.
    const flip = {};
    const pulse = {};
    cells.forEach((cl, i) => {
      const k = `${cl.r},${cl.c}`;
      flip[k] = i;
      if (marks[i] === 'g' && !g.greens[k]) {
        const inf = CELLS.get(k);
        if (inf && inf.slots.some((id) => id !== sel && !g.solved[id])) pulse[k] = true;
      }
    });
    animSeq.current += 1;
    setAnim({ id: animSeq.current, flip, pulse });
    if (animTimer.current) clearTimeout(animTimer.current);
    animTimer.current = setTimeout(() => setAnim(null), cells.length * 60 + 1400);

    if (guess === slot.word) {
      g2.solved = { ...g2.solved, [sel]: true };
      g2.order = [...g2.order, sel];
      say(`${slot.word} — solved. File it under a category.`);
    }
    sweepAutoSolve(g2);

    const allSolved = PUZZLE.slots.every((s) => g2.solved[s.id]);
    if (!allSolved && g2.left <= 0) {
      if (g2.order.length === 0) {
        g2.status = 'lost';
        g2.filedRight = 0;
        g2.tEnd = Date.now();
        setEndAnim(true);
        postResult(g2, 0);
      } else {
        say('Out of guesses — place your solved words, then lock it in');
      }
    }
    setTyped('');
    if (g2.solved[sel] && g2.status === 'playing') {
      setSel(nextUnsolved(g2, sel));
      setPick(slot.word); // solved word arms for filing — one tap on a category files it
    }
    setG(g2);
  }

  // One completed game = one play (win or loss). Score = words solved of 8,
  // time is the tiebreak — same shape the connections-format boards report.
  // Only game-end transitions post, so resumed/saved games never double-count;
  // replays post again on their own completion, matching the site-wide metric.
  function postResult(g2, scoreOverride) {
    const sc = scoreOverride != null ? scoreOverride : g2.order.length;
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    const gu = Object.values(g2.slotGuesses || {}).reduce((a, b) => a + b, 0);
    const total = PUZZLE.slots.length * 2;
    // personal stats: first completion of this puzzle number only
    try { setStats(recordStat(puzzles, PUZZLE.num, { s: sc, t: total, g: gu, won: sc === total })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: PUZZLE.quizId, score: sc, total, correct: sc, guessesUsed: gu, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
      })
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
        .catch(() => {});
    } catch (e) {}
  }

  // Placements are PROVISIONAL and silent: no correctness feedback until the
  // player locks in the full board (owner decision 2026-07-07). The only
  // verdict is a count of misfiled words — never which ones.
  function fileWord(word, ci) {
    if (!playing) return;
    const occupants = Object.keys(g.assigned).filter((w) => g.assigned[w] === ci && w !== word);
    if (occupants.length >= PUZZLE.categories[ci].words.length) {
      say(`${PUZZLE.categories[ci].name} is already full — tap a word there to take it back`);
      return;
    }
    setG({ ...g, assigned: { ...g.assigned, [word]: ci } });
    setPick(null);
  }
  function unfile(word) {
    if (!playing) return;
    const assigned2 = { ...g.assigned };
    delete assigned2[word];
    setG({ ...g, assigned: assigned2 });
    setPick(null);
  }
  // ONE lock-in, and it concludes the game. Score is out of 16: a point per
  // word solved plus a point per word correctly categorized. Available at a
  // full solve, or once the guess budget is spent (place what you solved).
  // No lock-in, no score — abandoned games never post.
  function lockIn() {
    if (!playing) return;
    const solvedSlots = PUZZLE.slots.filter((s) => g.solved[s.id]);
    const allSolved = solvedSlots.length === PUZZLE.slots.length;
    const placedAll = solvedSlots.every((s) => g.assigned[s.word] !== undefined);
    if (!placedAll || solvedSlots.length === 0) return;
    if (!allSolved && g.left > 0) return;
    const right = solvedSlots.filter((s) => PUZZLE.categories[g.assigned[s.word]].words.includes(s.word)).length;
    const score = solvedSlots.length + right;
    const g2 = { ...g, filedRight: right, status: score === PUZZLE.slots.length * 2 ? 'won' : 'lost', tEnd: Date.now() };
    setEndAnim(true);
    postResult(g2, score);
    setG(g2);
    if (score === PUZZLE.slots.length * 2) setJustWon(true);
  }

  // The one free hint: reveal the next empty letter of the selected slot.
  // No guess cost, no score penalty — the share text carries a 💡 instead.
  function revealHint() {
    if (!playing || g.hintUsed || !slot || g.solved[sel]) return;
    const target = cells.find((cl) => !g.greens[`${cl.r},${cl.c}`]);
    if (!target) return;
    const k = `${target.r},${target.c}`;
    const g2 = { ...g, hintUsed: true, greens: { ...g.greens, [k]: true } };
    if (!g2.t0) g2.t0 = Date.now();
    sweepAutoSolve(g2);
    animSeq.current += 1;
    setAnim({ id: animSeq.current, flip: { [k]: 0 }, pulse: {} });
    if (animTimer.current) clearTimeout(animTimer.current);
    animTimer.current = setTimeout(() => setAnim(null), 1400);
    setTyped('');
    if (g2.solved[sel]) {
      say(`${slot.word} — solved. File it under a category.`);
      setSel(nextUnsolved(g2, sel));
      setPick(slot.word);
    } else {
      say('Hint used — that was the one.');
    }
    setG(g2);
  }

  function cellClick(r, c) {
    const info = CELLS.get(`${r},${c}`);
    if (!info || !playing) return;
    const unsolvedIds = info.slots.filter((id) => !g.solved[id]);
    // If any word through this cell is still unsolved, tapping selects it for
    // guessing (the original behaviour).
    if (unsolvedIds.length) {
      const pool = unsolvedIds;
      if (pool.length > 1 && pool.includes(sel)) setSel(pool.find((id) => id !== sel));
      else setSel(pool[0]);
      setTyped('');
      return;
    }
    // Otherwise every word here is solved — pick one up off the board to file
    // it (the word bank now lives on the grid itself). Prefer an unfiled word;
    // if two solved words cross here, repeated taps cycle between them. Tapping
    // a word that's already filed lifts it back out to move it.
    const words = info.slots.map((id) => SLOT[id].word);
    const unfiled = words.filter((w) => g.assigned[w] === undefined);
    let target;
    if (unfiled.length) {
      target = (pick && unfiled.includes(pick) && unfiled.length > 1) ? unfiled.find((w) => w !== pick) : unfiled[0];
    } else {
      target = (pick && words.includes(pick)) ? (words.find((w) => w !== pick) || words[0]) : words[0];
    }
    if (g.assigned[target] !== undefined) {
      const assigned2 = { ...g.assigned };
      delete assigned2[target];
      setG({ ...g, assigned: assigned2 });
      setPick(target);
    } else {
      setPick(pick === target ? null : target);
    }
    setTyped('');
  }

  function cycleSlot(dirn) {
    const ids = PUZZLE.slots.map((s) => s.id).filter((id) => !g.solved[id]);
    if (!ids.length) return;
    const i = Math.max(0, ids.indexOf(sel));
    setSel(ids[(i + (dirn === 1 ? 1 : ids.length - 1)) % ids.length]);
    setTyped('');
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    setG(freshState(PUZZLE)); setSel(PUZZLE.slots[0].id); setTyped(''); setPick(null);
  }

  const guessesUsed = Object.values(g.slotGuesses).reduce((a, b) => a + b, 0);
  const prevPuzzle = puzzles.find((x) => x.num === PUZZLE.num - 1) || null;
  const isTodays = PUZZLE.num === pickPuzzle(puzzles, null).num;
  const elapsed = g.t0 ? fmtTime((g.tEnd || Date.now()) - g.t0) : '0:00';
  const myStats = deriveStats(stats, pickPuzzle(puzzles, null).num);

  // Share of players this run beat, from the exact score distribution the
  // board API returns. Own attempt excluded; hidden under a small sample.
  const beatPct = (() => {
    if (g.status === 'playing') return null;
    const dist = board.scoreDist;
    if (!dist) return null;
    const my = g.status === 'won' ? PUZZLE.slots.length * 2 : g.order.length + (g.filedRight || 0);
    let below = 0, all = 0;
    for (const [k, v] of Object.entries(dist)) {
      const n = Number(v) || 0;
      all += n;
      if (Number(k) < my) below += n;
    }
    const others = all - 1;
    if (others < 10) return null;
    return Math.max(0, Math.min(100, Math.round((below / others) * 100)));
  })();

  // Copyable grid, one row GROUPED BY CATEGORY (yellow pair, green pair,
  // blue pair, red pair): color = that word solved AND filed right, black =
  // missed (unsolved or misfiled). No letters or words leak.
  function shareText() {
    const rows = PUZZLE.categories.map((cat, ci) =>
      cat.words.map((w) => (g.assigned[w] === ci ? CAT_COLORS[ci].sq : '⬛')).join(''));
    const score = g.status === 'won' ? PUZZLE.slots.length * 2 : g.order.length + (g.filedRight || 0);
    // Hint use is flagged, streak rides along.
    const guessBit = `${guessesUsed} guess${guessesUsed === 1 ? '' : 'es'}`;
    const hintBit = g.hintUsed ? ' · 💡' : '';
    const streakBit = isTodays && myStats.cur >= 2 ? ` · streak ${myStats.cur}` : '';
    const head = `Crux #${PUZZLE.num} · ${score}/${PUZZLE.slots.length * 2} · ${guessBit} · ${elapsed}${hintBit}${streakBit}`;
    return `${head}\n${rows.join('\n')}\n${shareUrl()}`;
  }
  // Archive results must link the puzzle they describe — a bare /crux would
  // hand the recipient a different board than the score they just saw.
  function shareUrl() {
    return `sourceoftruths.com/crux${isTodays ? '' : `?p=${PUZZLE.num}`}`;
  }
  function copyShare() {
    const text = playing
      ? `Crux #${PUZZLE.num} \u2014 a clueless crossword. Can you crack it?\n${shareUrl()}`
      : shareText();
    // Mobile: native share sheet (like the big daily games) — the receiving
    // app gets the text directly, line breaks intact, no clipboard quirks.
    // Desktop: clipboard with the Copied flip.
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

  // next editable cell (cursor) in the selected slot
  const cursorKey = (() => {
    if (!playing || !slot || g.solved[sel]) return null;
    const cl = editable[typed.length];
    return cl ? `${cl.r},${cl.c}` : null;
  })();

  // typed letters mapped onto cells
  const typedAt = {};
  if (slot && !g.solved[sel]) editable.forEach((cl, i) => { if (typed[i]) typedAt[`${cl.r},${cl.c}`] = typed[i]; });

  const selCellKeys = new Set(cells.map((cl) => `${cl.r},${cl.c}`));

  // keyboard letter states for the selected slot
  const keyState = {};
  if (slot) {
    const presStr = g.present[sel] || '';
    const absStr = g.absent[sel] || '';
    for (const ch of absStr) keyState[ch] = 'x';
    for (const ch of presStr) keyState[ch] = 'y';
    cells.forEach((cl) => { if (g.greens[`${cl.r},${cl.c}`]) keyState[cl.ch] = 'g'; });
  }

  const solvedUnfiled = PUZZLE.slots
    .filter((s) => g.solved[s.id] && g.assigned[s.word] === undefined)
    .map((s) => s.word);
  const readyToLock = playing
    && g.order.length > 0
    && PUZZLE.slots.filter((s) => g.solved[s.id]).every((s) => g.assigned[s.word] !== undefined)
    && (g.order.length === PUZZLE.slots.length || g.left <= 0);

  const lost = g.status === 'lost';
  const won = g.status === 'won';

  // Option A metrics: the game is one centered column sized to the board.
  const allWordsSolved = PUZZLE.slots.every((s) => g.solved[s.id]);
  const CS_FILL = Math.max(48, Math.min(58, Math.round((540 - (COLS - 1) * 3) / COLS))); // fill toward ~540px, leaving room for the keyboard
  const GRID_W = COLS * CS_FILL + (COLS - 1) * 3;
  const COLW = Math.max(560, GRID_W + 40);      // + card padding, floor for narrow puzzles

  // Board-driven filing overlays: the word you've picked up glows (cx-armed),
  // solved-but-unfiled words are underlined (cx-unfiled), and each filed word
  // marks its start square with a category-colour pip (your own provisional
  // grouping — the full colour reveal still waits for the end).
  const fileArmSlot = playing && pick ? PUZZLE.slots.find((s) => s.word === pick) : null;
  const fileArmKeys = new Set(fileArmSlot ? slotCells(fileArmSlot).map((cl) => `${cl.r},${cl.c}`) : []);
  const fileFiledPip = {};
  const fileUnfiledKeys = new Set();
  if (playing) {
    for (const s of PUZZLE.slots) {
      if (!g.solved[s.id]) continue;
      if (g.assigned[s.word] !== undefined) fileFiledPip[`${s.row},${s.col}`] = g.assigned[s.word];
      else if (s.word !== pick) for (const cl of slotCells(s)) fileUnfiledKeys.add(`${cl.r},${cl.c}`);
    }
  }

  function cellStyle(r, c, info) {
    const k = `${r},${c}`;
    const green = g.greens[k];
    // a cell owned by any solved+filed word takes that category's tint
    // Category tint only appears at game end (placements are secret while
    // playing), and always by TRUE category — the reveal moment.
    let cat = null;
    let catIdx = 0;
    if (!playing) {
      for (const id of info.slots) {
        if (g.solved[id]) {
          catIdx = PUZZLE.categories.findIndex((c) => c.words.includes(SLOT[id].word));
          cat = CAT_COLORS[catIdx];
          break;
        }
      }
    }
    const inSel = playing && selCellKeys.has(k) && !g.solved[sel];
    const base = {
      width: 'var(--cs)', height: 'var(--cs)', borderRadius: 4,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: SANS, fontWeight: 800, fontSize: 'calc(var(--cs) * 0.48)',
      cursor: playing ? 'pointer' : 'default', userSelect: 'none',
      gridRow: r + 1, gridColumn: c + 1, position: 'relative',
      transition: 'background .12s,border-color .12s',
    };
    // the reveal cascades category by category, only on the live transition
    // won: diagonal color sweep across the grid; lost: category-by-category reveal
    if (cat) return { ...base, background: cat.bg, color: cat.tc, border: `1.5px solid ${cat.bg}`, ...(endAnim ? { animation: won ? `cxcat .5s ease ${(r + c) * 55}ms backwards` : `cxcat .55s ease ${catIdx * 380}ms backwards` } : {}) };
    if (green) return { ...base, background: COLORS.ink, color: '#fff', border: `1.5px solid ${COLORS.ink}`, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.5)' };
    if (lost) return { ...base, background: TILE, color: COLORS.rust, border: '1.5px dashed rgba(192,57,43,0.55)' };
    if (inSel) {
      const isCursor = cursorKey === k;
      return {
        ...base,
        background: isCursor ? '#dce9ff' : '#edf3ff',
        color: COLORS.ember,
        border: `2px solid ${isCursor ? COLORS.ember : 'rgba(37,99,235,0.5)'}`,
      };
    }
    return { ...base, background: TILE, color: COLORS.ink, border: `1.5px solid ${TILE_BORDER}`, boxShadow: 'inset 0 1px 2px rgba(28,30,36,0.07)' };
  }

  function cellLetter(r, c, info) {
    const k = `${r},${c}`;
    if (g.greens[k]) return info.ch;
    if (lost) return info.ch;
    if (typedAt[k]) return typedAt[k];
    return '';
  }

  const startNum = {};
  PUZZLE.slots.forEach((s) => {
    const k = `${s.row},${s.col}`;
    if (!startNum[k]) startNum[k] = parseInt(s.id, 10);
  });

  const KB = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
  const kbColors = { g: { bg: COLORS.ink, fg: '#fff' }, y: { bg: '#e6b93f', fg: '#5c4a06' }, x: { bg: '#c9cdd4', fg: '#6b7280' } };

  const lastG = g.lastGuess[sel];
  const markColor = { g: { bg: COLORS.ink, fg: '#fff' }, y: { bg: '#e6b93f', fg: '#5c4a06' }, x: { bg: '#c9cdd4', fg: '#40434b' } };

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', position: 'relative' }}>
      <Grain />
      <div className="cx-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          .cx-a{margin:0 auto;}
          .cl-cats{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
          .cl-cat{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:0;}
          .cl-cat-nm{margin-bottom:0 !important;}
          .cl-grid{--cs:${CS_FILL}px;}
          @media (max-width:900px){.cl-grid{--cs:min(${CS_FILL}px, calc((100vw - ${88 + (COLS - 1) * 3}px)/${COLS}));}}
          @media (max-width:560px){.cx-wrap{padding-left:14px !important;padding-right:14px !important;}.cl-grid{--cs:min(46px, calc((100vw - ${52 + (COLS - 1) * 3}px)/${COLS}));}.cl-panel{padding:11px 11px 13px !important;}.cl-cat{flex-direction:column;align-items:flex-start;gap:5px;padding:9px 11px !important;}}
          @media (max-width:430px){.cl-cats{grid-template-columns:1fr;}}
          .cx-htp-s{display:none;}
          @media(max-width:520px){.cx-htp-f{display:none;}.cx-htp-s{display:inline;}}
          @media(max-width:560px){.cx-ttl{flex-direction:column;align-items:flex-start;gap:1px;}.cx-ttl h1{font-size:21px;letter-spacing:0.02em;}.cx-ttl .cx-ttl-dt{font-size:15px;}.cx-ttl-dot{display:none;}}
          .cx-pip{position:absolute;top:3px;right:3px;width:9px;height:9px;border-radius:3px;border:1px solid rgba(0,0,0,0.4);box-shadow:0 1px 0 rgba(255,255,255,0.35);}
          .cx-armed{box-shadow:inset 0 0 0 2px #dce9ff, 0 0 0 3px rgba(37,99,235,0.6) !important;z-index:2;}
          .cx-unfiled::after{content:'';position:absolute;left:20%;right:20%;bottom:5px;height:2px;border-radius:2px;background:rgba(150,185,255,0.9);}
          .cl-key{border:none;font-family:${SANS};font-weight:800;cursor:pointer;border-radius:6px;padding:0;touch-action:manipulation;}
          .cl-grid > div{touch-action:manipulation;}
          .cl-key:active{transform:scale(0.94);}
          .cl-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.ink};background:#fff;color:${COLORS.ink};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .cl-btn:hover{background:${COLORS.paper};}
          .cx-cur{position:relative;}
          .cx-cur::after{content:'';position:absolute;bottom:14%;left:22%;right:22%;height:2.5px;background:#2563eb;animation:cxcaret 1.1s step-end infinite;}
          @keyframes cxcaret{50%{opacity:0;}}
          @keyframes cxfade{from{opacity:0;}}
          @keyframes cxstamp{from{opacity:0;transform:scale(.94);}}
          @keyframes cxflipA{from{transform:rotateX(90deg);background:#fff;color:transparent;}}
          @keyframes cxflipB{from{transform:rotateX(90deg);background:#fff;color:transparent;}}
          @keyframes cxpulseA{0%{box-shadow:0 0 0 0 rgba(37,99,235,0);}45%{transform:scale(1.18);box-shadow:0 0 0 5px rgba(37,99,235,0.4);}100%{transform:scale(1);box-shadow:0 0 0 0 rgba(37,99,235,0);}}
          @keyframes cxpulseB{0%{box-shadow:0 0 0 0 rgba(37,99,235,0);}45%{transform:scale(1.18);box-shadow:0 0 0 5px rgba(37,99,235,0.4);}100%{transform:scale(1);box-shadow:0 0 0 0 rgba(37,99,235,0);}}
          @keyframes cxcat{from{background:#fff;color:transparent;transform:scale(.82);}}
        `}</style>

        {/* game content centered: the page column is 1180, the game column
            sizes to the board (Option A single-column layout) */}
        <div style={{ maxWidth: COLW, margin: '0 auto' }}>

        {/* Crux-native top strip: quiet nav out to the rest of the site,
            player name + rank on the right. The shared site header is gone —
            Crux stands as its own identity (owner ruling 2026-07-12). */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20, flexWrap: 'wrap' }}>
          <a href="/quizzes" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded, textDecoration: 'none', borderBottom: '1px solid rgba(28,30,36,0.25)', paddingBottom: 1 }}>Quizzes</a>
          <a href="/" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded, textDecoration: 'none', borderBottom: '1px solid rgba(28,30,36,0.25)', paddingBottom: 1 }}>Top 10 Lists</a>
          {player && (
            <a href={player.key ? `/quizzes/hub?player=${encodeURIComponent(player.key)}` : '/quizzes/hub'} title="Your Stat Hub"
              style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em', color: COLORS.ink, background: PAPER, border: '1.5px solid rgba(28,30,36,0.35)', borderRadius: 5, padding: '4px 10px', textDecoration: 'none' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150, fontWeight: 500 }}>{player.name}</span>
              {player.rank ? <span style={{ color: COLORS.ember, fontWeight: 500 }}>Rank #{player.rank}</span> : null}
            </a>
          )}
        </div>

        {/* masthead: pressed CRUX tiles with the issue no. + date on the same
            line, a single rule beneath (they stack on mobile) */}
        <div className="cx-mh" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', position: 'relative', paddingRight: 28, marginBottom: 16, borderBottom: '2px solid rgba(28,30,36,0.8)', paddingBottom: 11 }}>
          <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end' }}>
            {'CRUX'.split('').map((ch, i) => (
              <div key={i} style={{ width: 46, height: 46, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontWeight: 900, fontSize: 28, background: i === 2 ? COLORS.ember : COLORS.ink, color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
            ))}
          </div>
          <div className="cx-ttl" style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
            <h1 style={{ margin: 0, fontFamily: MONO, fontSize: 14, letterSpacing: '0.06em', fontWeight: 500, color: COLORS.ink }}>No. {PUZZLE.num}</h1>
            <span className="cx-ttl-dot" style={{ color: COLORS.faded }}>&middot;</span>
            <span className="cx-ttl-dt" style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 15, color: COLORS.faded }}>{PUZZLE.dateLabel}</span>
            {PUZZLE.categories[0].words.length === 3 && (
              <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', background: COLORS.ink, borderRadius: 3, padding: '2px 7px' }}>Sunday Edition</span>
            )}
          </div>
          <button onClick={() => setShowHelp(true)} aria-label="How to play" title="How to play" style={{ position: 'absolute', top: 13, right: 2, background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded, padding: 0, display: 'flex' }}>
            <HelpCircle size={20} />
          </button>
        </div>

        <div className="cx-a">
          {/* the puzzle, one card: guesses + category clues + the grid */}
          <div className="cl-panel" style={{ background: '#fff', border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '14px 16px 16px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, borderBottom: '1px solid rgba(28,30,36,0.18)', paddingBottom: 8, marginBottom: 12 }}>
              <span style={{ whiteSpace: 'nowrap' }}><b style={{ color: g.left <= 3 ? COLORS.rust : COLORS.ink, fontWeight: 500 }}>{g.left}</b> guesses</span>
              <span style={{ flex: 1, height: 5, background: 'rgba(28,30,36,0.1)', borderRadius: 3, overflow: 'hidden', minWidth: 36 }}>
                <span style={{ display: 'block', height: '100%', width: `${Math.max(0, Math.min(100, (g.left / PUZZLE.guesses) * 100))}%`, background: g.left <= 3 ? COLORS.rust : COLORS.ember, transition: 'width .2s' }} />
              </span>
              <span style={{ whiteSpace: 'nowrap' }}><b style={{ color: COLORS.ink, fontWeight: 500 }}>{g.order.length}</b>/{PUZZLE.slots.length} words</span>
            </div>

            {/* category clues — the headline turns into a filing prompt once
                there are solved words waiting to be placed */}
            <div style={{ fontSize: 12.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: COLORS.faded, marginBottom: 8 }}>
              {playing && solvedUnfiled.length > 0
                ? <>The categories &mdash; tap to file completed words</>
                : <>The categories &mdash; each hides {PUZZLE.categories[0].words.length === 3 ? 'three' : 'two'} of the {PUZZLE.slots.length === 12 ? 'twelve' : 'eight'} words</>}
            </div>
            <div className="cl-cats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {PUZZLE.categories.map((cat, ci) => {
                const cc = CAT_COLORS[ci];
                const filed = Object.keys(g.assigned).filter((w) => g.assigned[w] === ci);
                const clickable = playing && pick;
                return (
                  <div key={ci} className="cl-cat" onClick={clickable ? () => fileWord(pick, ci) : undefined}
                    style={{ background: cc.bg, borderRadius: 8, padding: '10px 12px', border: '1.5px solid rgba(28,30,36,0.35)', boxShadow: '2px 2px 0 rgba(28,30,36,0.10)', cursor: clickable ? 'pointer' : 'default', outline: clickable ? `2.5px dashed ${cc.tc}` : 'none', outlineOffset: 2 }}>
                    <div className="cl-cat-nm" style={{ color: cc.tc, fontWeight: 800, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: '.03em', lineHeight: 1.25, textShadow: '0 1px 0 rgba(255,255,255,0.35)' }}>{cat.name}</div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {cat.words.map((_, i) => {
                        const w = lost ? cat.words[i] : filed[i];
                        if (!w) return <span key={i} style={{ background: 'rgba(255,255,255,0.28)', color: cc.tc, borderRadius: 6, padding: '3px 14px', fontWeight: 800, fontSize: 12.5 }}>?</span>;
                        if (lost) return <span key={i} style={{ background: 'rgba(255,255,255,0.28)', color: cc.tc, borderRadius: 6, padding: '3px 8px', fontWeight: 700, fontSize: 12.5, opacity: 0.85 }}>{w}</span>;
                        return (
                          <button key={i} onClick={playing ? (e) => { e.stopPropagation(); unfile(w); } : undefined} title={playing ? 'Tap to take back' : undefined}
                            style={{ background: 'rgba(255,255,255,0.6)', color: cc.tc, border: 'none', borderRadius: 6, padding: '3px 8px', fontWeight: 800, fontSize: 12.5, fontFamily: SANS, cursor: playing ? 'pointer' : 'default' }}>
                            {w}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="cl-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, var(--cs))`, gridTemplateRows: `repeat(${ROWS}, var(--cs))`, gap: 3 }}>
              {[...CELLS.entries()].map(([k, info]) => {
                const [r, c] = k.split(',').map(Number);
                let st = cellStyle(r, c, info);
                if (anim) {
                  // alternate keyframe names so back-to-back guesses restart
                  const suf = anim.id % 2 ? 'B' : 'A';
                  const parts = [];
                  if (anim.flip[k] != null) parts.push(`cxflip${suf} .38s ease ${anim.flip[k] * 60}ms backwards`);
                  if (anim.pulse[k]) parts.push(`cxpulse${suf} .55s ease ${(anim.flip[k] || 0) * 60 + 380}ms`);
                  if (parts.length) st = { ...st, animation: parts.join(', ') };
                }
                const armed = fileArmKeys.has(k);
                const cls = [cursorKey === k ? 'cx-cur' : '', armed ? 'cx-armed' : '', (!armed && fileUnfiledKeys.has(k)) ? 'cx-unfiled' : ''].filter(Boolean).join(' ') || undefined;
                return (
                  <div key={k} className={cls} onClick={() => cellClick(r, c)} style={st}>
                    {startNum[k] ? <span style={{ position: 'absolute', top: 0, left: 3, fontSize: 'calc(var(--cs) * 0.24)', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, opacity: 0.55 }}>{startNum[k]}</span> : null}
                    {fileFiledPip[k] !== undefined ? <span className="cx-pip" style={{ background: CAT_COLORS[fileFiledPip[k]].bg }} /> : null}
                    {cellLetter(r, c, info)}
                  </div>
                );
              })}
              </div>
            </div>
          </div>

          {/* selected slot bar — only while there are still words to guess */}
          {playing && slot && !allWordsSolved && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <button className="cl-key" onClick={() => cycleSlot(-1)} aria-label="Previous word" style={{ background: COLORS.paper, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={17} /></button>
              <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.ink }}>
                {slotLabel(sel)} <span style={{ color: COLORS.faded, fontWeight: 700 }}>&middot; {slot.word.length} letters &middot; {(g.slotGuesses[sel] || 0)} guess{(g.slotGuesses[sel] || 0) === 1 ? '' : 'es'} spent</span>
              </div>
              <button className="cl-key" onClick={() => cycleSlot(1)} aria-label="Next word" style={{ background: COLORS.paper, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={17} /></button>
              {!g.hintUsed && (
                <button className="cl-key" onClick={revealHint} title="Reveal one letter in this word (one hint per puzzle)"
                  style={{ marginLeft: 'auto', background: '#fdf6e3', border: '1.5px solid rgba(230,185,63,0.7)', height: 30, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 800, color: '#8a6d1a' }}>
                  <Lightbulb size={14} /> Hint
                </button>
              )}
            </div>
          )}

          {/* last guess feedback for this slot */}
          {playing && lastG && !g.solved[sel] && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: COLORS.faded, marginRight: 4 }}>Last try</span>
              {lastG.word.split('').map((ch, i) => {
                const mc = markColor[lastG.marks[i]];
                return <span key={i} style={{ width: 26, height: 26, borderRadius: 5, background: mc.bg, color: mc.fg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>{ch}</span>;
              })}
              <span style={{ fontSize: 11.5, color: COLORS.faded, fontWeight: 700, marginLeft: 6 }}>
                {(g.present[sel] || '') ? <>in word: <b style={{ color: '#8a6d1a' }}>{(g.present[sel] || '').split('').join(' ')}</b></> : null}
              </span>
            </div>
          )}

          {/* desktop-only keyboard toggle — physical typing always works, so the
              on-screen keys are collapsed by default and expand on demand */}
          {playing && g.left > 0 && !allWordsSolved && !mobileUi && (
            <div style={{ textAlign: 'center', marginBottom: kbdOpen ? 8 : 0 }}>
              <button onClick={() => setKbdOpen((o) => !o)} style={{ background: 'none', border: '1.5px solid rgba(28,30,36,0.22)', borderRadius: 8, padding: '6px 13px', cursor: 'pointer', fontFamily: SANS, fontWeight: 700, fontSize: 12, color: COLORS.faded }}>
                {kbdOpen ? 'Hide keyboard' : 'Show keyboard'}
              </button>
            </div>
          )}
          {/* keyboard (hidden once solved/out of guesses; on desktop also waits for the toggle) */}
          {playing && g.left > 0 && !allWordsSolved && (mobileUi || kbdOpen) && (
            <div style={{ maxWidth: 470, margin: '0 auto' }}>
              {KB.map((row, ri) => (
                <div key={ri} style={{ display: 'flex', gap: 4, marginBottom: 5, justifyContent: 'center' }}>
                  {ri === 2 && (
                    <button className="cl-key" onClick={() => onKey('ENTER')} style={{ flex: '1.6 0 0', height: 44, background: COLORS.ember, color: '#fff', fontSize: 11.5 }}>ENTER</button>
                  )}
                  {row.split('').map((ch) => {
                    const st = keyState[ch];
                    const kc = st ? kbColors[st] : { bg: '#fff', fg: COLORS.ink };
                    return (
                      <button key={ch} className="cl-key" onClick={() => onKey(ch)} style={{ flex: '1 0 0', height: 44, background: kc.bg, color: kc.fg, fontSize: 15, border: st ? 'none' : '1.5px solid rgba(20,22,28,0.15)' }}>{ch}</button>
                    );
                  })}
                  {ri === 2 && (
                    <button className="cl-key" onClick={() => onKey('BACK')} aria-label="Delete" style={{ flex: '1.6 0 0', height: 44, background: COLORS.paper, color: COLORS.ink, fontSize: 16 }}>&#9003;</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* filing helper — the board is the word bank now, so this is just a
              nudge; the "Placing X" state mirrors the armed word on the grid */}
          {playing && solvedUnfiled.length > 0 && (
            <div style={{ margin: '2px 0 12px', fontSize: 13, fontWeight: 700, color: COLORS.faded, textAlign: 'center' }}>
              {pick
                ? <>Placing <span style={{ color: COLORS.ember, fontWeight: 800 }}>{pick}</span> &mdash; tap a category above</>
                : <>Tap a completed word on the board, then a category. <span style={{ opacity: .85 }}>Underlined words aren&rsquo;t filed yet.</span></>}
            </div>
          )}

          {/* lock it in: single shot, concludes the game — armed two-tap */}
          {readyToLock && (
            <button onClick={() => { if (armLock) { lockIn(); } else { setArmLock(true); setTimeout(() => setArmLock(false), 3500); } }}
              style={{ width: '100%', fontFamily: SANS, fontWeight: 800, fontSize: 15, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '15px 10px', borderRadius: 10, border: 'none', background: armLock ? COLORS.ink : COLORS.ember, color: '#fff', cursor: 'pointer', marginBottom: 14 }}>
              {armLock ? 'Tap again — this ends the game' : 'Submit answers'}
            </button>
          )}

          {/* result */}
          {!playing && (
            <div style={{ background: '#fff', border: `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '16px 16px 14px', marginBottom: 14 }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: won ? COLORS.ember : COLORS.rust, marginBottom: 4 }}>
                {Math.round(((won ? PUZZLE.slots.length * 2 : g.order.length + (g.filedRight || 0)) / (PUZZLE.slots.length * 2)) * 100)}% Complete
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.faded, marginBottom: (isTodays && myStats.cur >= 2) ? 6 : 12 }}>
                {won
                  ? <>{guessesUsed} guesses &middot; {elapsed}{g.hintUsed ? <> &middot; 1 hint</> : null}</>
                  : g.filedRight != null
                    ? <>{g.order.length}/{PUZZLE.slots.length} words &middot; {g.filedRight}/{PUZZLE.slots.length} placements &middot; the reveal is on the board</>
                    : <>{g.order.length} of {PUZZLE.slots.length} words &middot; the reveal is on the board</>}
              </div>
              {isTodays && myStats.cur >= 2 && (
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ color: '#b45309' }}>{myStats.cur}-day streak</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="cl-btn" onClick={copyShare}><Share2 size={15} /> {copied ? 'Copied' : 'Share result'}</button>
                <button className="cl-btn" onClick={resetGame} style={{ borderColor: '#c3c8cf', color: COLORS.faded }}><RotateCcw size={15} /> Replay</button>
              </div>
              <DailyGamesPromo self="crux" refresh={g.status} />
              <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
                {isTodays ? (
                  <>
                    {countdown ? <>Next Crux in <b style={{ color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{countdown}</b>.</> : 'A new puzzle drops at midnight Eastern.'}
                    {prevPuzzle && (
                      <>
                        {' '}Meanwhile:{' '}
                        <a href={`/crux?p=${prevPuzzle.num}`} style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>
                          play yesterday&rsquo;s Crux &rarr;
                        </a>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                    <a href="/crux" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s Crux &rarr;</a>
                    {' · '}
                    <a href="/daily" style={{ color: COLORS.faded, fontWeight: 700, textDecoration: 'underline' }}>All daily puzzles</a>
                  </>
                )}
              </p>
            </div>
          )}
        </div>
        </div>

        {/* standard quiz-page bottom: challenge + join + leaderboard (always) */}
        <div style={{ maxWidth: 640, margin: '36px auto 0' }}>
          <DailyGamesGrid
          self="crux"
          maxWidth={640}
          challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`}
          share={{ label: copied ? 'Copied' : 'Share This Puzzle', onClick: copyShare }}
          divider
        />

          {mobileUi && !standalone && (
            <button onClick={a2hsClick} style={{ marginTop: 10, width: '100%', fontFamily: SANS, fontSize: 13.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 800, height: 54, borderRadius: 10, border: 'none', background: '#21b45e', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, whiteSpace: 'nowrap' }}>
              <Smartphone size={15} strokeWidth={2.5} /> Add to Home Screen
            </button>
          )}
        </div>
        {showA2hsHelp && (
          <div onClick={() => setShowA2hsHelp(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,22,28,0.55)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, maxWidth: 430, width: '100%', padding: '22px 22px 16px', fontFamily: SANS, border: '1.5px solid rgba(20,22,28,0.12)' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Crux to your Home Screen</div>
              {isIosDevice() ? (
                <ol style={{ margin: '0 0 4px', paddingLeft: 20, color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  <li>Tap the <b>Share</b> button in Safari&apos;s toolbar.</li>
                  <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                  <li>Tap <b>Add</b> — the colored-crossword tile opens today&apos;s puzzle, every day.</li>
                </ol>
              ) : (
                <p style={{ margin: '0 0 4px', color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  Open your browser&apos;s menu and choose <b>Add to Home Screen</b> (or <b>Install app</b>). The colored-crossword tile opens today&apos;s puzzle, every day.
                </p>
              )}
              <button onClick={() => setShowA2hsHelp(false)} style={{ marginTop: 10, fontFamily: SANS, fontSize: 12.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700, height: 44, width: '100%', borderRadius: 10, border: 'none', background: COLORS.ink, color: '#fff', cursor: 'pointer' }}>Got it</button>
            </div>
          </div>
        )}
        {!identity && (
          <div style={{ maxWidth: 640, margin: '18px auto 0' }}>
            <JoinLeaderboardForm hideIcon heading="See your stats and join the leaderboard" identity={identity} onJoined={(id) => { setIdentity(id); if (id && id.username) setPlayer((p) => p || { name: id.username, rank: null }); }} />
          </div>
        )}
        {/* your stats: sits directly above the leaderboard */}
        {identity && (
        <div style={{ maxWidth: 640, margin: '20px auto 0' }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.faded, marginBottom: 9 }}>Your stats</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { n: myStats.cur, l: 'Streak' },
              { n: myStats.played, l: 'Played' },
              { n: myStats.played ? `${Math.round((myStats.perfect / myStats.played) * 100)}%` : '\u2014', l: 'Perfect' },
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
        <div style={{ maxWidth: 760, margin: '26px auto 0', background: '#fff', border: '1.5px solid rgba(20,22,28,0.12)', borderRadius: 12, padding: '14px 16px' }}>
          <QuizLeaderboard daily board={board} identity={identity} total={PUZZLE.slots.length * 2} />
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, fontStyle: 'italic', fontWeight: 600, color: COLORS.faded, margin: '34px 0 0' }}>For WMM, in memoriam.</p>
      </div>

      {/* the win moment: the category colors sweep the grid, then the keepsake
          card stamps in over it — delayed so the sweep plays out first */}
      {justWon && (
        <div onClick={() => setJustWon(false)} style={{ position: 'fixed', inset: 0, zIndex: 85, background: 'rgba(28,30,36,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: `cxfade .4s ease ${(ROWS + COLS) * 55 + 500}ms backwards` }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: PAPER, border: `3px double ${COLORS.ink}`, borderRadius: 6, padding: '26px 30px 20px', maxWidth: 360, width: '100%', textAlign: 'center', fontFamily: SANS, boxShadow: '6px 6px 0 rgba(28,30,36,0.18)', animation: `cxstamp .45s ease ${(ROWS + COLS) * 55 + 500}ms backwards` }}>
            <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginBottom: 12 }}>
              {'CRUX'.split('').map((ch, i) => (
                <span key={i} style={{ width: 24, height: 24, borderRadius: 3, background: i === 2 ? COLORS.ember : COLORS.ink, color: '#fff', fontFamily: SERIF, fontWeight: 900, fontSize: 15, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)' }}>{ch}</span>
              ))}
            </div>
            <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 34, color: COLORS.ink, letterSpacing: '-0.01em', margin: '2px 0 6px', lineHeight: 1.15 }}>Solved.</div>
            <div style={{ fontFamily: MONO, fontSize: 12.5, color: COLORS.faded, marginBottom: 14 }}>No. {PUZZLE.num} &middot; {PUZZLE.slots.length * 2}/{PUZZLE.slots.length * 2} &middot; {guessesUsed} guess{guessesUsed === 1 ? '' : 'es'} &middot; {elapsed}</div>
            <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginBottom: 16 }}>
              {PUZZLE.categories.map((cat, ci) => cat.words.map((w, wi) => (
                <span key={`${ci}-${wi}`} style={{ width: 15, height: 15, borderRadius: 3, background: CAT_COLORS[ci].bg, border: '1px solid rgba(28,30,36,0.25)' }} />
              )))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="cl-btn" onClick={copyShare} style={{ background: COLORS.ember, color: '#fff', borderColor: COLORS.ember }}><Share2 size={15} /> {copied ? 'Copied' : 'Share result'}</button>
              <button className="cl-btn" onClick={() => setJustWon(false)}>See the board</button>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', color: COLORS.faded, marginTop: 12 }}>sourceoftruths.com/crux</div>
          </div>
        </div>
      )}

      <DuelBanner token={duelToken} info={duelInfo} submitted={duelSubmitted} />

      {/* toast */}
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
              <p style={{ margin: '0 0 9px' }}><b>{PUZZLE.slots.length === 12 ? 'Twelve' : 'Eight'} words</b> interlock in the grid &mdash; no clues. The <b>four categories</b> are the only hints; each hides exactly {PUZZLE.categories[0].words.length === 3 ? 'three' : 'two'} of the words.</p>
              <p style={{ margin: '0 0 9px' }}><b>Guess to reveal:</b> tap a slot, type a real word, hit enter. <span style={{ background: COLORS.ink, color: '#fff', borderRadius: 4, padding: '1px 6px', fontWeight: 800 }}>Dark</span> = right letter, right square (locks in, crossings too). <span style={{ background: '#e6b93f', color: '#5c4a06', borderRadius: 4, padding: '1px 6px', fontWeight: 800 }}>Yellow</span> = in the word, different square. The whole board shares <b>{PUZZLE.guesses} guesses</b>.</p>
              <p style={{ margin: '0 0 9px' }}><b>File your solves:</b> tap a word, then a category &mdash; placements stay secret and movable. One <b>submit</b> ends the game. Score is out of {PUZZLE.slots.length * 2}: a point per solved word, a point per correct placement. No lock-in, no score.</p>
              <p style={{ margin: 0 }}>Stuck? One free <b>hint</b> per puzzle reveals a letter.</p>
            </div>
            <button className="cl-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: '#fff' }}>Play</button>
          </div>
        </div>
      )}

      {/* About Crux — crawlable prose for search, server-rendered into the initial HTML */}
      <section style={{ position: 'relative', zIndex: 2, maxWidth: 760, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Crux</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Crux is a free daily word game from Source of Truths &mdash; a clueless crossword. Eight hidden words (twelve in the Sunday Edition) interlock in a compact grid, and the only hints are four visible categories; working out which words belong to them is the puzzle.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Guess real words to reveal letters: dark tiles lock a letter into its square and every crossing, yellow tiles mean the letter belongs elsewhere in the word. The whole board shares one guess budget, and a single submit files each solved word under its category &mdash; a point per solve, a point per correct placement.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new Crux puzzle arrives every day, with a bigger Sunday Edition each week. No app, no signup &mdash; play free in your browser and compare score, guesses, and time on the daily leaderboard. Prefer scrambles? Try <a href="/garble" style={{ color: COLORS.ink, fontWeight: 800 }}>Garble</a>, our daily word scramble.
        </p>
      </section>

      <div style={{ position: 'relative', zIndex: 2 }}><Footer /></div>
    </div>
  );
}

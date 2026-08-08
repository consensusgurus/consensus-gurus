'use client';

// Strata — the daily word game you excavate.
//
// Every letter on the grid belongs to one of the day's hidden words, and all of
// them are members of one unstated category. Trace a word and it lifts out; the
// letters above it FALL, and the reshaped board is what lets you read the next
// word. A weekday grid is 5x5, a Sunday Edition is 6x7 and runs two threads at
// once rather than one.
//
// WHY THERE IS NO FAIL STATE. A wrong trace costs nothing and nothing is ever
// taken away from you, because scripts/verify-strata.mjs proves, per board, that
// no reachable state is a dead end. Whatever order you clear in, the board can
// still be finished, so there is no stranding to undo and no way to spoil a day.
// The only currency is the clock and the hints you spend.
//
// WHY THE COLLAPSE IS NOT DECORATION. The same verifier proves the gate: only
// one or two words can be read on the untouched grid, and at least one word
// cannot be read until several others have fallen out. So the board really does
// hand you the next word, and a solve is a sequence, not a word search.
//
// The client never receives the answer key's POSITIONS: app/strata/page.js
// strips `owners` (the cell to word map) and `pool`, so where each word sits has
// to be found by search, exactly as the player finds it. Placements are proved
// unique per board, which is why a traced set of cells is always the right set
// and a correct-looking trace is never refused.
//
// Same daily plumbing as the rest of the roster: banked days gated by Eastern
// date on the server, per-day localStorage saves, /strata?p=N archive pinning,
// streaks and stats, and the shared /api/quiz/* board flow.

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, X, Lightbulb, Flag } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import useDuelContext, { DuelBanner } from '../quiz/[id]/useDuelContext';
import DailyGamesGrid from '../DailyGamesGrid';
import DailyEndCard from '../DailyEndCard';
import DailyChrome from '../DailyChrome';
import DailyBoardPanel from '../quiz/[id]/DailyBoardPanel';
import useAbandonFlush from '../quiz/[id]/useAbandonFlush';
import DailyMasthead from '../DailyMasthead';
import DailyRules from '../DailyRules';
import { isMobileDevice } from '@/lib/is-mobile';
import { T } from '@/lib/theme';
import { makeCells, positions, adjacent, findOne, gridOf } from '@/lib/strata-core';

const COLORS = {
  ink: T.ink,
  faded: T.muted,
  accent: '#9a3412',        // Strata identity — oxide, for the sediment it is named after
  accentSoft: '#fdf0e7',
  accentDeep: '#7c2d12',
  green: T.successDeep,
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const HELP_KEY = 'sot_strata_help_seen';
const FALL_MS = 340;      // must match the CSS transition below
const LIFT_MS = 260;      // how long a found word sits lit before it drops out

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

const freshState = () => ({ v: 1, found: [], hints: 0, thread: false, t0: null, tEnd: null, status: 'playing' });
const EMPTY_BOARD = { plays: 0, best: null, leaderboard: [] };

// ── stats (same shape every daily uses) ──────────────────────────────────────
const STATS_KEY = 'sot_strata_stats';
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

export default function StrataClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const { rows, cols, words } = PUZZLE;
  const TOTAL = words.length;
  const STORE_KEY = `sot_strata_${PUZZLE.num}`;

  const { cells, columns } = useMemo(() => makeCells(PUZZLE), [PUZZLE]);

  const [g, setG] = useState(freshState);
  const [trace, setTrace] = useState([]);          // cell ids, in traced order
  const [lifting, setLifting] = useState(null);    // { ids, word } lit before it drops
  const [flash, setFlash] = useState(null);        // hint pulse: cell id
  const [bad, setBad] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [gateRules, setGateRules] = useState(false);
  const [endClosed, setEndClosed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [identity, setIdentity] = useState(null);
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);
  const press = useRef(null);
  const searchParams = useSearchParams();
  const { duelToken, duelInfo, duelSubmitted } = useDuelContext(PUZZLE.quizId, searchParams);
  const viewedRef = useRef(false);

  const playing = g.status === 'playing';
  // Focus mode: while the puzzle is live the leaderboard / share / other-games
  // block is folded away behind one button, the same arrangement every other
  // daily uses (owner rule, 2026-08-08). setShowChrome unfolds it for good.
  const [showChrome, setShowChrome] = useState(false);
  const focusMode = playing && !showChrome;
  const preStart = playing && !g.t0;
  const foundWords = g.found;
  const foundSet = useMemo(() => new Set(foundWords), [foundWords]);

  // Cells that have gone. `lifting` is still ON the board (lit up) so the drop
  // reads as a consequence of the find rather than happening at the same instant.
  const removed = useMemo(() => {
    const s = new Set();
    for (const rec of foundWords) for (const id of rec.ids) s.add(id);
    return s;
  }, [foundWords]);

  const at = useMemo(() => positions(rows, cols, columns, removed), [rows, cols, columns, removed]);
  const traceSet = useMemo(() => new Set(trace), [trace]);
  const liftSet = useMemo(() => new Set(lifting ? lifting.ids : []), [lifting]);
  const remaining = useMemo(() => words.filter((w) => !foundWords.some((f) => f.word === w)), [words, foundWords]);

  // ---- persistence ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.v === 1 && Array.isArray(saved.found)) setG({ ...freshState(), ...saved });
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
        if (done || g.t0) localStorage.setItem('sot_strata_day', JSON.stringify({ d: etToday(), done }));
        else localStorage.removeItem('sot_strata_day');
      }
    } catch (e) {}
  }, [g, hydrated, STORE_KEY, PUZZLE, puzzles]);

  // Live clock, ticked from state rather than read during render, so the readout
  // moves on its own instead of only when the board re-renders.
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

  const REC_KEY = `sot_strata_rec_${PUZZLE.num}`;
  const abandon = useAbandonFlush(() => {
    if (!playing || !g.t0 || !g.found.length) return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - g.t0) / 1000)));
    try { localStorage.setItem(REC_KEY, '1'); } catch (e) {}
    return { quizId: PUZZLE.quizId, score: g.found.length, total: TOTAL, correct: g.found.length, guessesUsed: g.hints, timeElapsed: el, abandoned: true, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') };
  });

  const postResult = useCallback((g2) => {
    abandon.markFlushed();
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    const sc = g2.found.length;
    try { setStats(recordStat(PUZZLE.num, { s: sc, t: TOTAL, g: g2.hints, won: sc === TOTAL })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
        // guessesUsed = hints spent. Nothing else can go wrong on a Strata board,
        // so hints are the only thing that separates two players who both cleared
        // it, ahead of the clock.
        body: JSON.stringify({ quizId: PUZZLE.quizId, score: sc, total: TOTAL, correct: sc, guessesUsed: g2.hints, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
      })
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
        .catch(() => {});
    } catch (e) {}
  }, [abandon, PUZZLE, TOTAL, identity]);

  function start() {
    setG((cur) => (cur.t0 ? cur : { ...cur, t0: Date.now() }));
    try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {}
    setGateRules(false);
  }

  // ---- tracing ----
  const commit = useCallback((ids) => {
    const word = ids.map((id) => cells[id].ch).join('');
    if (!remaining.includes(word)) {
      if (ids.length > 2) { setBad(true); setTimeout(() => setBad(false), 320); }
      setTrace([]);
      return;
    }
    setTrace([]);
    setLifting({ ids, word });
    setTimeout(() => {
      setLifting(null);
      setG((cur) => {
        if (cur.found.some((f) => f.word === word)) return cur;
        const next = { ...cur, found: cur.found.concat([{ word, ids }]) };
        if (next.found.length === TOTAL) {
          next.status = 'done';
          next.tEnd = Date.now();
          postResult(next);
        }
        return next;
      });
    }, LIFT_MS);
  }, [cells, remaining, TOTAL, postResult]);

  // TWO WAYS IN, ONE CODE PATH. Tap the letters one at a time, or hold and drag
  // through them. Tapping is the primary mode and is exact, which matters here
  // because diagonals are legal: a dragged path across a diagonal passes over
  // the corner of the orthogonal neighbour on its way, and that neighbour used
  // to get picked up, so a clean diagonal came out as a wrong word. Two fixes,
  // and tapping is the one that always works.
  //
  //   drag  the hit test ignores anything outside the middle of a tile, so
  //         clipping a corner in passing does nothing
  //   tap   nothing is in passing at all. Tap the last letter again to drop the
  //         whole trace, or tap any earlier letter to walk back to it.
  const extend = useCallback((id, fromDrag) => {
    if (!playing || lifting || !g.t0) return;
    setTrace((cur) => {
      if (!cur.length) return [id];
      const i = cur.indexOf(id);
      if (i >= 0) {
        // tapping the letter you are sitting on clears the trace; anything
        // earlier walks back to it. A drag only ever walks back.
        if (!fromDrag && i === cur.length - 1) return [];
        return cur.slice(0, i + 1);
      }
      const a = at.get(cur[cur.length - 1]);
      const b = at.get(id);
      if (!a || !b || !adjacent(a, b)) return fromDrag ? cur : [id];
      const next = cur.concat([id]);
      // Auto-accept the moment the trace spells an unfound word. There is no
      // Enter key here and no submit button: the house rule for a typed daily is
      // that a correct answer is taken as soon as it is correct, and a traced
      // one is no different.
      const w = next.map((x) => cells[x].ch).join('');
      if (remaining.includes(w)) { setTimeout(() => commit(next), 0); return next; }
      return next;
    });
  }, [playing, lifting, g.t0, at, cells, remaining, commit]);

  function onDown(id, e) {
    if (e && e.preventDefault) e.preventDefault();
    press.current = { id, last: id, moved: false };
    extend(id, false);
  }

  useEffect(() => {
    const move = (e) => {
      const p = press.current;
      if (!p) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const t = el && el.closest && el.closest('.st-tile');
      if (!t || t.dataset.cid === undefined) return;
      const r = t.getBoundingClientRect();
      const dx = e.clientX - (r.x + r.width / 2);
      const dy = e.clientY - (r.y + r.height / 2);
      if (Math.hypot(dx, dy) > r.width * 0.44) return;      // corner clip, not a pick
      const id = Number(t.dataset.cid);
      if (id === p.last) return;
      p.last = id; p.moved = true;
      extend(id, true);
    };
    const up = () => {
      const p = press.current;
      press.current = null;
      // A tap leaves the trace standing so the next tap can extend it. Only a
      // real drag commits on release.
      if (p && p.moved) setTrace((cur) => { if (cur.length > 1) setTimeout(() => commit(cur), 0); return cur; });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [commit, extend]);

  // ---- hints ----
  function revealThread() {
    if (!playing || g.thread) return;
    setG((cur) => ({ ...cur, thread: true, hints: cur.hints + 1 }));
  }
  function showStart() {
    if (!playing || !remaining.length) return;
    const grid = gridOf(rows, cols, columns, removed);
    for (const w of remaining) {
      const path = findOne(grid, w, cells, rows, cols);
      if (path) {
        setFlash(path[0]);
        setTimeout(() => setFlash(null), 1800);
        setG((cur) => ({ ...cur, hints: cur.hints + 1 }));
        return;
      }
    }
  }
  function giveUp() {
    if (!playing) return;
    setG((cur) => {
      const next = { ...cur, status: 'done', tEnd: Date.now() };
      postResult(next);
      return next;
    });
  }

  function resetGame() {
    setG(freshState());
    setTrace([]); setLifting(null); setEndClosed(false);
  }

  function copyShare() {
    // The pattern is a LINE, never a grid, and it says nothing about where any
    // word sat or what it was. Filled = found on your own, hollow = you took a
    // hint somewhere on the day.
    const marks = foundWords.map(() => '▪').join('') + '▫'.repeat(TOTAL - foundWords.length);
    const txt = `Strata #${PUZZLE.num}\n${foundWords.length}/${TOTAL} · ${elapsed}${g.hints ? ` · ${g.hints} hint${g.hints > 1 ? 's' : ''}` : ''}\n${marks}\nmindloftdaily.com/strata`;
    try {
      navigator.clipboard.writeText(txt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  }

  const isTodays = PUZZLE.num === pickPuzzle(puzzles, null).num;
  const myStats = deriveStats(stats, pickPuzzle(puzzles, null).num);
  const won = foundWords.length === TOTAL;
  const threadLabel = (PUZZLE.themes || []).join(' + ');

  // Tile size is a number fitted to the viewport rather than a CSS variable
  // stepped by breakpoints, so a 6x7 Sunday board fills a phone exactly instead
  // of landing on whichever of three fixed sizes happens to fit.
  //
  // CORRECTION, and it is worth writing down because it cost an hour: this was
  // first changed on the theory that Chrome could not transition a value of the
  // form calc(var(--x) * n + mpx), because the tiles' computed `top` was sitting
  // on the old row while the inline style already showed the new one, and the
  // top transition reported playState "running" at currentTime 0 forever. That
  // theory was WRONG. The tab being measured was a background tab, and Chrome
  // throttles CSS transitions in a hidden tab, so they never tick. The board was
  // falling correctly the whole time. calc(var()) would have been fine. Keeping
  // the px version on its own merits, not because the old one was broken.
  //
  // The lesson for the next person measuring a live daily through an automated
  // tab: check document.visibilityState before believing an animation is stuck,
  // or call el.getAnimations().forEach(a => a.finish()) and measure after.
  const gap = 6;
  const [tile, setTile] = useState(56);
  useEffect(() => {
    const fit = () => {
      const avail = Math.min(window.innerWidth - 34, 560);
      setTile(Math.max(30, Math.min(56, Math.floor((avail - gap * (cols - 1)) / cols))));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [cols]);
  const step = tile + gap;
  const boardW = cols * tile + gap * (cols - 1);
  const boardH = rows * tile + gap * (rows - 1);

  return (
    <div style={{ minHeight: '100vh', background: T.surface, position: 'relative' }}>
      <Grain />
      <DailyChrome slug="strata" name="Strata" collapsed={!!g.t0} />
      <div className="st-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.st-wrap{padding-left:12px !important;padding-right:12px !important;}}
          .st-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.accentDeep};background:var(--white);color:${COLORS.accentDeep};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .st-btn:hover{background:${COLORS.accentSoft};}
          .st-btn:disabled{opacity:0.4;cursor:default;}
          .st-btn.primary{background:${COLORS.accent};border-color:${COLORS.accent};color:var(--white);}
          .st-btn.primary:hover{background:${COLORS.accentDeep};}
          .st-board{position:relative;margin:0 auto;touch-action:none;user-select:none;-webkit-user-select:none;}
          .st-tile{position:absolute;display:flex;align-items:center;justify-content:center;
            font-family:${SANS};font-weight:800;border-radius:7px;cursor:pointer;
            background:var(--white);border:1px solid rgba(28,30,36,0.15);color:${COLORS.ink};
            transition:top ${FALL_MS}ms cubic-bezier(.4,.05,.35,1),left ${FALL_MS}ms cubic-bezier(.4,.05,.35,1),background 120ms,color 120ms,border-color 120ms,transform 160ms,opacity ${LIFT_MS}ms;}
          .st-tile.on{background:${COLORS.accent};border-color:${COLORS.accent};color:var(--white);transform:scale(1.04);}
          .st-tile.lift{background:${COLORS.green};border-color:${COLORS.green};color:var(--white);opacity:0.15;transform:scale(0.82);}
          .st-tile.bad{background:#fee2e2;border-color:#b91c1c;color:#7f1d1d;}
          .st-tile.flash{border-color:${COLORS.accent};box-shadow:0 0 0 3px ${COLORS.accentSoft};}
          .st-word{font-family:${MONO};font-size:13px;letter-spacing:0.08em;padding:5px 10px;border-radius:7px;background:#dcfce7;color:${COLORS.green};font-weight:700;}
          .st-slot{font-family:${MONO};font-size:13px;letter-spacing:0.28em;padding:5px 10px;border-radius:7px;background:rgba(28,30,36,0.05);color:${COLORS.faded};}
        `}</style>

        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <DailyMasthead
            slug="strata"
            num={PUZZLE.num}
            dateLabel={PUZZLE.dateLabel}
            accent={COLORS.accent}
            blockGap={4}
            helpTop={8}
            onHelp={() => setShowHelp(true)}
            sunday={PUZZLE.sunday && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: T.white, background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>Sunday Edition &middot; Two Threads</span>}
            blocks={'STRATA'.split('').map((ch, i) => (
              <div key={i} style={{ width: 34, height: 34, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 19, background: i === 0 ? COLORS.accent : COLORS.ink, color: T.white, boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
            ))}
          />

          {preStart && (
            <div style={{ background: T.white, border: '1px solid rgba(28,30,36,0.14)', borderRadius: 12, padding: '20px 22px', margin: '4px 0 14px' }}>
              <h2 style={{ fontSize: 19, fontWeight: 900, color: COLORS.ink, margin: '0 0 8px' }}>
                {TOTAL} words are buried in {rows * cols} letters.
              </h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: COLORS.faded, fontWeight: 600, margin: '0 0 12px' }}>
                Every letter belongs to one of them, and they are all members of{' '}
                {PUZZLE.sunday ? <b style={{ color: COLORS.accentDeep }}>two categories you are not told</b> : <b style={{ color: COLORS.accentDeep }}>one category you are not told</b>}.
                Trace a word and it lifts out. Then the letters above it fall, and the board you were reading is gone.
              </p>
              {gateRules && (
                <div style={{ marginBottom: 14 }}>
                  <DailyRules
                    accent={COLORS.accent} accentSoft={COLORS.accentSoft} accentDeep={COLORS.accentDeep}
                    steps={[
                      <>Tap the letters one at a time, or <b>hold and drag</b> through them. <b>Diagonals count</b>.</>,
                      <>Most of today&rsquo;s words cannot be read yet. They arrive when the board falls.</>,
                      <>A <b>wrong trace costs nothing</b>. You cannot get stuck, in any order.</>,
                    ]}
                    knack="Take whatever you can read now. Every word you lift drops the letters above it into the next one."
                    footer="Hints are the only thing that separates two players who both finish."
                  />
                </div>
              )}
              <button className="st-btn primary" onClick={start}>Start digging</button>
              {!gateRules && <button className="st-btn" style={{ marginLeft: 8 }} onClick={() => setGateRules(true)}>Show instructions</button>}
            </div>
          )}

          {!preStart && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '2px 0 12px', flexWrap: 'wrap' }}>
                <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700, color: COLORS.faded }}>
                  {foundWords.length}/{TOTAL} &middot; {elapsed}{g.hints ? ` · ${g.hints} hint${g.hints > 1 ? 's' : ''}` : ''}
                </div>
                <div style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11.5, fontWeight: 700, color: g.thread ? COLORS.accentDeep : 'transparent', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {g.thread ? threadLabel : '.'}
                </div>
              </div>

              <div className="st-board" style={{ width: boardW, height: boardH, marginBottom: 16 }}>
                {cells.map((cell) => {
                  const pos = at.get(cell.id);
                  const gone = removed.has(cell.id) && !liftSet.has(cell.id);
                  if (gone && !pos) return null;
                  const p = pos || at.get(cell.id);
                  const cls = ['st-tile'];
                  if (liftSet.has(cell.id)) cls.push('lift');
                  else if (traceSet.has(cell.id)) cls.push(bad ? 'bad' : 'on');
                  if (flash === cell.id) cls.push('flash');
                  if (!p) return null;
                  return (
                    <div
                      key={cell.id}
                      className={cls.join(' ')}
                      style={{
                        width: tile, height: tile, fontSize: Math.round(tile * 0.42),
                        top: p[0] * step, left: p[1] * step,
                      }}
                      data-cid={cell.id}
                      onPointerDown={(e) => onDown(cell.id, e)}
                    >{cell.ch}</div>
                  );
                })}
              </div>

              {/* What you have spelled so far. Tapping has no finger on the
                  board to look at, so the trace needs to be readable as text. */}
              <div style={{ minHeight: 26, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: MONO, fontSize: 16, letterSpacing: '0.22em', fontWeight: 700, color: bad ? '#b91c1c' : COLORS.accentDeep }}>
                  {trace.map((id) => cells[id].ch).join('')}
                </span>
                {trace.length > 0 && (
                  <button
                    onClick={() => setTrace([])}
                    style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: COLORS.faded, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >clear</button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {foundWords.map((f) => <span key={f.word} className="st-word">{f.word}</span>)}
                {playing && remaining.map((w) => <span key={w} className="st-slot">{'·'.repeat(w.length)}</span>)}
                {!playing && remaining.map((w) => <span key={w} className="st-slot" style={{ letterSpacing: '0.08em', color: '#b91c1c' }}>{w}</span>)}
              </div>

              {playing && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  <button className="st-btn" onClick={revealThread} disabled={g.thread}>
                    <Lightbulb size={15} />{g.thread ? 'Thread shown' : PUZZLE.sunday ? 'Name the threads' : 'Name the thread'}
                  </button>
                  <button className="st-btn" onClick={showStart}><Lightbulb size={15} />Show me a start</button>
                  <button className="st-btn" style={{ marginLeft: 'auto' }} onClick={giveUp}><Flag size={15} />Give up</button>
                </div>
              )}
            </>
          )}

        {focusMode && (
          <div style={{ maxWidth: 640, margin: '30px auto 0', textAlign: 'center' }}>
            <button onClick={() => setShowChrome(true)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: '0.03em', color: T.blueDeep, background: 'none', border: '1.5px solid var(--accent-border)', borderRadius: 9, padding: '10px 20px', cursor: 'pointer' }}>Show leaderboard &amp; more</button>
            <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.faded, fontWeight: 600, marginTop: 8 }}>Leaderboards, share for credit &amp; the other daily puzzles</div>
          </div>
        )}
          <div style={{ display: focusMode ? 'none' : 'block', margin: '30px auto 0', maxWidth: 640 }}>
            <DailyGamesGrid
              self="strata"
              maxWidth={640}
              replay={!playing ? resetGame : null}
              challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`}
              share={{ label: copied ? 'Copied' : 'Share', onClick: copyShare }}
              light
              divider
              boardSlot={<DailyBoardPanel self="strata" quizId={PUZZLE.quizId} maxWidth={640} streak={{ current: myStats.cur, best: myStats.max }} />}
            />
          </div>
        </div>
      </div>

      {!playing && !endClosed && (
        <DailyEndCard
          modal
          self="strata"
          won={won}
          completed
          headline={won ? <>Down to bedrock</> : <>{foundWords.length} of {TOTAL}</>}
          subline={<>Strata #{PUZZLE.num} &middot; {foundWords.length}/{TOTAL} &middot; {g.hints} hint{g.hints === 1 ? '' : 's'} &middot; {elapsed}</>}
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
          <div onClick={(e) => e.stopPropagation()} style={{ background: T.white, borderRadius: 13, padding: '20px 22px', maxWidth: 470, fontFamily: SANS }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
              <HelpCircle size={19} color={COLORS.accent} />
              <b style={{ fontSize: 17, color: COLORS.ink }}>How Strata works</b>
              <button onClick={() => setShowHelp(false)} aria-label="Close" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded }}><X size={20} /></button>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: COLORS.ink, margin: '0 0 10px' }}>
              Every letter on the grid belongs to one of today&rsquo;s hidden words, and the words are all
              members of {PUZZLE.sunday ? 'two categories' : 'a category'} you are not told. Trace a word through
              neighbouring letters and it lifts out. The letters above it then fall, which is the point:
              most of the words cannot be read until the board has collapsed under them.
            </p>
            <ul style={{ fontSize: 13.5, lineHeight: 1.7, color: COLORS.ink, margin: '0 0 12px', paddingLeft: 20 }}>
              <li>Tap the letters one at a time, or hold and drag through them. Diagonals count.</li>
              <li>Tapping the letter you are on drops the trace; tapping an earlier one walks back to it.</li>
              <li>A word is taken the moment your trace spells it. There is nothing to press.</li>
              <li>A wrong trace costs nothing, and there is no order that can strand you.</li>
              <li>Two hints are on offer: name the thread, or light up where a word starts.</li>
              <li>{TOTAL} words today{PUZZLE.sunday ? ', across two threads on a bigger grid' : ''}.</li>
            </ul>
            <button className="st-btn primary" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }}>Play</button>
          </div>
        </div>
      )}

      <div style={{ display: focusMode ? 'none' : 'block' }}><Footer /></div>
    </div>
  );
}

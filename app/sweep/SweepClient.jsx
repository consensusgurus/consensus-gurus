'use client';

// Sweep — the daily minesweeper with no bottom edge.
//
// The field runs 200 rows down and every one of them is PROVEN deducible before
// it ships (lib/sweep-field, and scripts/verify-sweep re-proves the whole bank
// through that same module). That guarantee is the whole design: a run is one
// life, so if a board could force a guess, a run would end through no fault of
// the player. It cannot. Every death here is a misread.
//
// Same field for everybody on the day, and, like Blocks, unlimited runs with
// your BEST one taking the board (see isArcade in lib/daily-games). Replaying a
// deduction puzzle you have already seen would normally be pointless, but the
// field is 1,800 cells deep and nobody memorises it: what a second run buys you
// is a cleaner read of the same evidence.
//
// Score is CELLS UNCOVERED, a raw count with no ceiling, which is why Sweep is
// a tally game (`unit: 'cells'`). Ties break on FEWEST DIGS, so a player who
// lets the cascades do the work outranks one who clicked every cell by hand.

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { X, RotateCcw, Flag, Pickaxe } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import useDuelContext, { DuelBanner } from '../quiz/[id]/useDuelContext';
import JoinLeaderboardForm from '../quiz/[id]/JoinLeaderboardForm';
import DailyGamesGrid from '../DailyGamesGrid';
import DailyEndCard from '../DailyEndCard';
import DailyChrome from '../DailyChrome';
import DailyRules from '../DailyRules';
import DailyBoardPanel from '../quiz/[id]/DailyBoardPanel';
import DailyMasthead from '../DailyMasthead';
import { isMobileDevice } from '@/lib/is-mobile';
import useAbandonFlush from '../quiz/[id]/useAbandonFlush';
import { notifyShareCredit } from '../ShareCreditPop';
import { T } from '@/lib/theme';
import { COLS, ROWS, decodeField, idx, neighbors, numberAt } from '@/lib/sweep-field';

const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const COLORS = {
  ink: T.ink, cream: '#f7f8fa', faded: '#3f4757', line: '#e5e7eb',
  accent: '#0f766e', accentSoft: '#e2f2f0', covered: '#c9d2e2', coveredHi: '#b7c2d6',
};
// The number palette. Eight steps that stay legible on white at 13px, and
// deliberately NOT a rainbow: the low numbers you read constantly are cool and
// quiet, the high ones you meet rarely are hot, so a 6 catches the eye.
const NUM_COLOR = ['', '#2563eb', '#15803d', '#c0392b', '#1e3a8a', '#a16207', '#0e7490', '#0b0c0e', '#6b7280'];
const HELP_KEY = 'sot_sweep_help_seen';
const STATS_KEY = 'sot_sweep_stats';
const VIEW_ROWS = 15;          // rows of field on screen at once
const LONG_PRESS_MS = 340;     // hold to flag, for a phone with no right button

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
const nf = (n) => Number(n || 0).toLocaleString('en-US');
function fmtTime(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ---- stats (identical shape to every other daily) --------------------------
function getStats() {
  try { const s = JSON.parse(localStorage.getItem(STATS_KEY)); if (s && s.v === 1 && s.rec) return s; } catch (e) {}
  return { v: 1, rec: {} };
}
function recordStat(num, entry) {
  const s = getStats();
  if (s.rec[num]) return s;      // never overwrite: the first run of the day is the record
  const s2 = { ...s, rec: { ...s.rec, [num]: entry } };
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s2)); } catch (e) {}
  return s2;
}
function deriveStats(s, todayNum) {
  const rec = (s && s.rec) || {};
  const nums = Object.keys(rec).map(Number).sort((a, b) => a - b);
  let max = 0, run = 0, prev = null;
  for (const n of nums) { run = prev != null && n === prev + 1 ? run + 1 : 1; if (run > max) max = run; prev = n; }
  let cur = 0, at = rec[todayNum] ? todayNum : todayNum - 1;
  while (rec[at]) { cur++; at--; }
  return { played: nums.length, perfect: nums.filter((n) => rec[n].won).length, cur, max };
}
// ---- run state -------------------------------------------------------------
// `open` and `flag` are stored as index arrays rather than a 1,800-cell grid,
// because a deep run touches a few hundred cells and the save has to be small
// enough to write on every click.
function freshState() {
  return { v: 1, open: [], flag: [], score: 0, digs: 0, boom: -1, status: 'playing', t0: null, tEnd: null, ms: 0 };
}

export default function SweepClient({ puzzles = [], forceNum = null }) {
  const searchParams = useSearchParams();
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const PAR = PUZZLE.par;
  const FIELD = useMemo(() => decodeField(PUZZLE.field), [PUZZLE.field]);
  const STORE_KEY = `sot_sweep_${PUZZLE.num}`;
  const REC_KEY = `sot_sweep_rec_${PUZZLE.num}`;
  const isTodays = PUZZLE.num === pickPuzzle(puzzles, null).num;

  const [g, setG] = useState(() => freshState());
  const gRef = useRef(g);
  const [hydrated, setHydrated] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [gateRules, setGateRules] = useState(true);
  const [endClosed, setEndClosed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [stats, setStats] = useState(null);
  const [flagMode, setFlagMode] = useState(false);
  const [armRestart, setArmRestart] = useState(false);
  const [showChrome, setShowChrome] = useState(false);
  const viewRef = useRef(null);
  const pressRef = useRef({ t: 0, i: -1, long: false, timer: null });
  const viewedRef = useRef(false);
  const { duelToken, duelInfo, duelSubmitted } = useDuelContext(PUZZLE.quizId, searchParams);

  // Sets are the working copy; the arrays in state are what gets saved.
  const openSet = useMemo(() => new Set(g.open), [g.open]);
  const flagSet = useMemo(() => new Set(g.flag), [g.flag]);

  const commit = useCallback((next) => {
    gRef.current = next;
    setG(next);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch (e) {}
  }, [STORE_KEY]);

  const playing = g.status === 'playing';
  const started = playing && !!g.t0;
  const preStart = playing && !g.t0;
  const over = g.status !== 'playing';
  const focusMode = playing && !showChrome;
  const won = over && g.score >= PAR;
  const myStats = useMemo(() => deriveStats(stats || { rec: {} }, PUZZLE.num), [stats, PUZZLE.num]);

  // How deep the dig has reached, which is what the viewport follows.
  const depth = useMemo(() => {
    let d = 0;
    for (const i of openSet) { const r = Math.floor(i / COLS); if (r + 1 > d) d = r + 1; }
    return d;
  }, [openSet]);

  // ---- hydrate -------------------------------------------------------------
  useEffect(() => {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) {}
    if (saved && saved.v === 1 && Array.isArray(saved.open)) {
      const s = { ...freshState(), ...saved };
      gRef.current = s; setG(s);
    }
    try { setGateRules(!localStorage.getItem(HELP_KEY)); } catch (e) {}
    setStats(getStats());
    try { setIdentity(JSON.parse(localStorage.getItem('sot_quiz_identity'))); } catch (e) {}
    setHydrated(true);
  }, [STORE_KEY]);

  // ---- board + view ping ---------------------------------------------------
  useEffect(() => {
    if (!hydrated) return;
    let em = '';
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity')); if (id && id.email) em = `&email=${encodeURIComponent(id.email)}`; } catch (e) {}
    const anon = getAnonId();
    fetch(`/api/quiz/board?quizId=${encodeURIComponent(PUZZLE.quizId)}${anon ? `&anonId=${encodeURIComponent(anon)}` : ''}${em}`)
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
      .catch(() => {});
    if (!viewedRef.current) {
      viewedRef.current = true;
      try {
        fetch('/api/quiz/view', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quizId: PUZZLE.quizId }) });
      } catch (e) {}
    }
  }, [hydrated, PUZZLE.quizId]);

  // The hub's "played today" flag, same key shape every daily uses.
  useEffect(() => {
    if (!hydrated || !isTodays) return;
    try {
      const done = g.status !== 'playing';
      if (done || g.t0) localStorage.setItem('sot_sweep_day', JSON.stringify({ d: etToday(), done }));
      else localStorage.removeItem('sot_sweep_day');
    } catch (e) {}
  }, [hydrated, isTodays, g.status, g.t0]);

  // Elapsed time, for the tiebreak only. There is no clock pressure in Sweep,
  // so this counts only while the tab is actually in front of the player.
  useEffect(() => {
    if (!started) return undefined;
    const iv = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      const cur = gRef.current;
      if (cur.status !== 'playing' || !cur.t0) return;
      commit({ ...cur, ms: (cur.ms || 0) + 1000 });
    }, 1000);
    return () => clearInterval(iv);
  }, [started, commit]);

  // ---- posting -------------------------------------------------------------
  const abandon = useAbandonFlush(() => {
    const cur = gRef.current;
    if (cur.status !== 'playing' || !cur.t0 || cur.score === 0) return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round(cur.ms / 1000)));
    try { localStorage.setItem(REC_KEY, '1'); } catch (e) {}
    return {
      quizId: PUZZLE.quizId, score: cur.score, total: PAR,
      correct: 0, guessesUsed: cur.digs, timeElapsed: el, abandoned: true,
      email: (identity && identity.email) || undefined, anonId: getAnonId(),
      isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : ''),
    };
  });

  const postResult = useCallback((g2) => {
    abandon.markFlushed();
    const el = Math.max(1, Math.round(g2.ms / 1000));
    try { setStats(recordStat(PUZZLE.num, { s: g2.score, t: PAR, won: g2.score >= PAR })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: PUZZLE.quizId, score: g2.score, total: PAR, correct: g2.score >= PAR ? 1 : 0,
          // DIGS. Ties break on FEWEST, because the same cells off fewer clicks
          // means the cascades were read rather than clicked through by hand.
          guessesUsed: g2.digs, timeElapsed: el,
          email: (identity && identity.email) || undefined, anonId: getAnonId(),
          isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : ''),
        }),
      }).then((r) => r.json()).then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); }).catch(() => {});
    } catch (e) {}
    try { window.dispatchEvent(new Event('sot:daily-updated')); } catch (e) {}
  }, [abandon, PUZZLE.quizId, PUZZLE.num, PAR, identity]);

  // ---- the dig -------------------------------------------------------------
  // Opening a zero cascades to its neighbors, which is where a good run gets
  // its cells: the field is 9 wide, so a well-chosen zero can peel four rows.
  const openFrom = useCallback((state, startIdx) => {
    const open = new Set(state.open);
    const flag = new Set(state.flag);
    const stack = [startIdx];
    let gained = 0;
    while (stack.length) {
      const i = stack.pop();
      if (i < 0 || i >= ROWS * COLS) continue;
      if (open.has(i) || flag.has(i)) continue;
      open.add(i); gained++;
      const r = Math.floor(i / COLS), c = i % COLS;
      if (numberAt(FIELD, r, c) === 0) {
        for (const [rr, cc] of neighbors(r, c)) stack.push(idx(rr, cc));
      }
    }
    return { open: [...open], gained };
  }, [FIELD]);

  const dig = useCallback((i) => {
    const cur = gRef.current;
    if (cur.status !== 'playing' || flagSet.has(i) || openSet.has(i)) return;
    const t0 = cur.t0 || Date.now();
    if (FIELD[i]) {
      // The one way a run ends. The field is proven deducible, so this was
      // always readable: no board on the bank has ever required a guess.
      const g2 = { ...cur, t0, open: [...cur.open, i], boom: i, digs: cur.digs + 1, status: 'over', tEnd: Date.now() };
      commit(g2); postResult(g2); return;
    }
    const { open, gained } = openFrom({ ...cur, t0 }, i);
    commit({ ...cur, t0, open, score: cur.score + gained, digs: cur.digs + 1 });
  }, [FIELD, flagSet, openSet, openFrom, commit, postResult]);

  // Clicking a number whose mines are all flagged opens the rest of its
  // neighbors at once. It is how an experienced player moves, and it is also
  // how an experienced player dies: the game trusts your flags, it does not
  // check them.
  const chord = useCallback((i) => {
    const cur = gRef.current;
    if (cur.status !== 'playing' || !openSet.has(i)) return;
    const r = Math.floor(i / COLS), c = i % COLS;
    const n = numberAt(FIELD, r, c);
    if (!n) return;
    let flags = 0; const rest = [];
    for (const [rr, cc] of neighbors(r, c)) {
      const j = idx(rr, cc);
      if (flagSet.has(j)) flags++;
      else if (!openSet.has(j)) rest.push(j);
    }
    if (flags !== n || !rest.length) return;
    const bomb = rest.find((j) => FIELD[j]);
    if (bomb != null) {
      const g2 = { ...cur, open: [...cur.open, bomb], boom: bomb, digs: cur.digs + 1, status: 'over', tEnd: Date.now() };
      commit(g2); postResult(g2); return;
    }
    let open = cur.open, gained = 0;
    let work = { ...cur };
    for (const j of rest) {
      const res = openFrom(work, j);
      work = { ...work, open: res.open };
      gained += res.gained;
      open = res.open;
    }
    commit({ ...cur, open, score: cur.score + gained, digs: cur.digs + 1 });
  }, [FIELD, openSet, flagSet, openFrom, commit, postResult]);

  const toggleFlag = useCallback((i) => {
    const cur = gRef.current;
    if (cur.status !== 'playing' || openSet.has(i)) return;
    const flag = new Set(cur.flag);
    if (flag.has(i)) flag.delete(i); else flag.add(i);
    commit({ ...cur, t0: cur.t0 || Date.now(), flag: [...flag] });
  }, [openSet, commit]);

  const startGame = useCallback(() => {
    const cur = gRef.current;
    const st = { ...cur, t0: Date.now() };
    commit(st);
    try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {}
  }, [commit]);

  // A fresh run on the SAME field. It clears nothing that records the day: the
  // stats entry and the posted rows stay, because every finished run posts and
  // the board keeps your best (arcade rule, lib/daily-games isArcade).
  const replayRun = useCallback(() => {
    try { localStorage.removeItem(REC_KEY); } catch (e) {}
    commit({ ...freshState(), t0: Date.now() });
    setArmRestart(false);
    setEndClosed(true);
    if (viewRef.current) viewRef.current.scrollTop = 0;
  }, [commit, REC_KEY]);

  // ---- the viewport follows the frontier ------------------------------------
  useEffect(() => {
    const el = viewRef.current;
    if (!el || !started) return;
    const cell = el.clientWidth / COLS;
    const want = Math.max(0, (depth - VIEW_ROWS + 4) * cell);
    if (want > el.scrollTop) el.scrollTo({ top: want, behavior: 'smooth' });
  }, [depth, started]);

  // ---- keyboard ------------------------------------------------------------
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'f' || e.key === 'F') setFlagMode((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ---- share ---------------------------------------------------------------
  function shareText() {
    const sun = PUZZLE.sunday ? ' · Sunday' : '';
    return `Sweep #${PUZZLE.num}${sun} · ${nf(g.score)} cell${g.score === 1 ? '' : 's'} · depth ${nf(depth)} · par ${nf(PAR)}\nmindloftdaily.com/sweep`;
  }
  function copyShare() {
    const txt = shareText();
    if (notifyShareCredit(txt)) return;
    try {
      if (isMobileDevice() && navigator.share) { navigator.share({ text: txt }).catch(() => {}); return; }
      navigator.clipboard.writeText(txt);
      setCopied(true); setTimeout(() => setCopied(false), 1600);
    } catch (e) {}
  }

  // ---- the live ladder -----------------------------------------------------
  const ladder = useMemo(() => {
    const rows = (board.leaderboard || []).slice(0, 40).map((r, i) => ({ rank: i + 1, name: r.username || 'player', score: r.score, me: false }));
    const mine = g.score;
    let at = rows.findIndex((r) => r.score < mine);
    if (at < 0) at = rows.length;
    const meRow = { rank: at + 1, name: 'You', score: mine, me: true };
    const out = rows.slice(0, at).concat([meRow], rows.slice(at)).map((r, i) => ({ ...r, rank: i + 1 }));
    const meAt = out.findIndex((r) => r.me);
    return { rows: out.slice(Math.max(0, meAt - 2), meAt + 3), rank: meAt + 1, field: out.length };
  }, [board.leaderboard, g.score]);

  // ---- rules ---------------------------------------------------------------
  const rulesBody = (
    <DailyRules
      accent={COLORS.accent}
      accentSoft={COLORS.accentSoft}
      lead="Uncover as much of the field as you can without touching a mine."
      banner={`Everyone digs the same field today${PUZZLE.sunday ? ', with more mines in it than a weekday' : ''}.`}
      sub="The top row is given to you already uncovered, so the first dig is a read and never a coin flip."
      steps={[
        <><b>Tap</b> a covered square to uncover it. A number counts the mines touching that square, and a blank clears everything around it.</>,
        <><b>Long press</b> (or right click, or the <b>Flag</b> button) to mark a mine. Flags cost nothing and score nothing.</>,
        <>Tap a <b>number</b> whose mines are all flagged to open the rest of its neighbours at once. Quick, and it trusts your flags without checking them.</>,
        <>There is no bottom. Keep going until you are wrong, then <b>play again</b> as many times as you like.</>,
      ]}
      knack="You never have to guess. Every field is checked before it ships and is solvable from the top row down with the two rules you already know, plus the one where a number's unknowns sit inside another number's. If you are stuck, the answer is on the board."
      footer={`Scored on CELLS UNCOVERED, and you can play the day as many times as you like, because Sweep keeps your BEST run rather than your first: your score IS the number of squares you uncover, with no ceiling on it, and ${nf(PAR)} is par for the day. Ties break on FEWEST DIGS, since the same cells off fewer clicks means you read the cascades rather than clicking through them. Sweep pays at most 1 IQ point a day however long the run goes and however many runs you play, so nobody can grind their way up the standings: the real competition is today’s leaderboard. Sundays put more mines in the same field.`}
    />
  );

  // ---- the field -----------------------------------------------------------
  const lastRow = Math.min(ROWS - 1, Math.max(VIEW_ROWS + 1, depth + 6));
  const cells = [];
  for (let r = 0; r <= lastRow; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = idx(r, c);
      const isOpen = openSet.has(i);
      const isFlag = flagSet.has(i);
      const isBoom = g.boom === i;
      const n = isOpen && !isBoom ? numberAt(FIELD, r, c) : 0;
      const showMine = over && FIELD[i] && !isBoom && isFlag;
      cells.push(
        <div
          key={i}
          onContextMenu={(e) => { e.preventDefault(); toggleFlag(i); }}
          // Long press is a TOUCH gesture only. A mouse that rests on the
          // button for half a second is still a click, and turning that into a
          // flag would make the desktop game feel haunted. Any movement cancels
          // it, or scrolling the field would drop flags as it went.
          onPointerDown={(e) => {
            if (e.pointerType === 'mouse') return;
            pressRef.current.long = false;
            pressRef.current.timer = setTimeout(() => { pressRef.current.long = true; toggleFlag(i); }, LONG_PRESS_MS);
          }}
          onPointerUp={() => { clearTimeout(pressRef.current.timer); }}
          onPointerMove={() => { clearTimeout(pressRef.current.timer); }}
          onPointerCancel={() => { clearTimeout(pressRef.current.timer); }}
          onPointerLeave={() => { clearTimeout(pressRef.current.timer); }}
          onClick={() => {
            if (pressRef.current.long) { pressRef.current.long = false; return; }
            if (isOpen) chord(i);
            else if (flagMode) toggleFlag(i);
            else dig(i);
          }}
          style={{
            aspectRatio: '1', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: SANS, fontWeight: 800, fontSize: 14, userSelect: 'none', WebkitUserSelect: 'none',
            WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
            cursor: over ? 'default' : 'pointer',
            background: isBoom ? '#dc2626' : showMine ? '#94a3b8' : isFlag ? '#fde68a' : isOpen ? '#fff' : COLORS.covered,
            color: isBoom ? '#fff' : NUM_COLOR[n] || COLORS.faded,
            boxShadow: isOpen && !isBoom ? 'none' : 'inset 0 -2px 0 rgba(15,23,42,0.10)',
          }}
        >
          {isBoom ? '✹' : isFlag ? '⚑' : showMine ? '✹' : (isOpen && n ? n : '')}
        </div>
      );
    }
  }

  const btn = { fontFamily: SANS, fontWeight: 800, fontSize: 14, border: `2px solid ${COLORS.accent}`, background: '#fff', color: COLORS.accent, borderRadius: 8, padding: '9px 16px', cursor: 'pointer' };

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, fontFamily: SANS }}>
      <Grain />
      <DailyChrome slug="sweep" name="Sweep" collapsed={started} />

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '18px 18px 40px', position: 'relative', zIndex: 2 }}>
        <DuelBanner token={duelToken} info={duelInfo} submitted={duelSubmitted} />

        <DailyMasthead
          slug="sweep"
          num={PUZZLE.num}
          dateLabel={PUZZLE.dateLabel}
          accent={COLORS.accent}
          helpTop={13}
          marginBottom={16}
          onHelp={() => setShowHelp(true)}
          sunday={PUZZLE.sunday && (
            <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: T.white, background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>
              Sunday Edition &middot; denser field
            </span>
          )}
        />

        {preStart && (
          <div style={{ background: COLORS.cream, border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '22px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>{gateRules ? 'How to play' : 'Sweep is ready'}</div>
            {gateRules ? rulesBody : (
              <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
                <p style={{ margin: '0 0 6px' }}>Uncover as much of the field as you can without hitting a mine. It never needs a guess, it has no bottom, and you can play the day again as often as you want. Your best run is the one that counts.</p>
              </div>
            )}
            <div style={{ marginTop: 18 }}>
              <button onClick={startGame} style={{ ...btn, background: T.cta, borderColor: T.cta, color: T.white, fontSize: 15, padding: '11px 22px' }}>Start</button>
              <div style={{ marginTop: 10 }}>
                <button type="button" onClick={() => setGateRules((v) => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.faded, textDecoration: 'underline' }}>
                  {gateRules ? 'Hide detailed instructions' : 'Show detailed instructions'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!preStart && (
          <div style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#94a3b8' }}>
                Depth <b style={{ color: COLORS.ink }}>{nf(depth)}</b>
              </span>
              <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#94a3b8' }}>
                Digs <b style={{ color: COLORS.ink }}>{nf(g.digs)}</b>
              </span>
              <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#94a3b8' }}>
                Flags <b style={{ color: COLORS.ink }}>{nf(g.flag.length)}</b>
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 10.5, fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#94a3b8' }}>{fmtTime(g.ms)}</span>
            </div>

            <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
              <div
                ref={viewRef}
                className="sw-view"
                style={{
                  flex: 1, minWidth: 0, maxWidth: 360, height: VIEW_ROWS * 38,
                  overflowY: 'auto', overflowX: 'hidden', background: '#eef1f6',
                  border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 3,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: 3 }}>{cells}</div>
              </div>

              <aside className="sw-ladder" style={{ width: 168, flex: 'none', display: 'flex', flexDirection: 'column', fontSize: 11.5, color: COLORS.faded }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 7 }}>Today &middot; you #{ladder.rank}</div>
                {ladder.rows.map((r) => (
                  <div key={`${r.rank}-${r.name}`} style={{ display: 'flex', gap: 6, padding: '3px 0', color: r.me ? COLORS.ink : COLORS.faded, fontWeight: r.me ? 800 : 600 }}>
                    <span style={{ fontSize: 9.5, fontWeight: 700, width: 30, flex: 'none', color: r.me ? COLORS.accent : '#9aa2b1' }}>#{r.rank}</span>
                    <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
                    <span style={{ fontWeight: 800 }}>{r.score}</span>
                  </div>
                ))}
                <div style={{ marginTop: 'auto', paddingTop: 9, borderTop: `1px solid ${COLORS.line}` }}>
                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>{nf(g.score)}<em style={{ fontStyle: 'normal', fontSize: 11, fontWeight: 700, color: '#94a3b8' }}> cell{g.score === 1 ? '' : 's'}</em></div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.04em', color: '#94a3b8', marginTop: 3 }}>par {nf(PAR)}</div>
                </div>
              </aside>
            </div>

            <div className="sw-strip" style={{ display: 'none', marginTop: 10, paddingTop: 9, borderTop: `1px solid ${COLORS.line}`, alignItems: 'center', gap: 10, fontSize: 11.5, color: COLORS.faded }}>
              <span style={{ fontWeight: 800, color: COLORS.accent }}>You #{ladder.rank}</span>
              <span>par {nf(PAR)} cells</span>
              <span style={{ marginLeft: 'auto', fontSize: 15, fontWeight: 800, color: COLORS.ink }}>{nf(g.score)}<em style={{ fontStyle: 'normal', fontSize: 10, color: '#94a3b8' }}> cell{g.score === 1 ? '' : 's'}</em></span>
            </div>

            {/* Dig or flag. A phone has no right button and a long press is a
                secret, so the mode is a visible switch as well. */}
            {!over && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                <div style={{ display: 'inline-flex', border: `1px solid ${COLORS.line}`, borderRadius: 10, overflow: 'hidden' }}>
                  {[[false, 'Dig', Pickaxe], [true, 'Flag', Flag]].map(([mode, label, Icon]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setFlagMode(mode)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7, fontFamily: SANS, fontWeight: 800, fontSize: 14,
                        padding: '11px 22px', border: 'none', cursor: 'pointer',
                        background: flagMode === mode ? COLORS.accent : '#fff',
                        color: flagMode === mode ? T.white : COLORS.faded,
                      }}
                    >
                      <Icon size={15} /> {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="sw-keys" style={{ textAlign: 'center', marginTop: 9, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.03em', color: '#9aa2b1' }}>
              click to dig &middot; right click or long press to flag &middot; F switches mode &middot; click a finished number to open its neighbours
            </div>

            {over && (
              <button
                onClick={replayRun}
                style={{
                  marginTop: 12, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontFamily: SANS, fontWeight: 800, fontSize: 15, color: T.white,
                  background: T.cta, border: `2px solid ${T.cta}`, borderRadius: 10, padding: '13px 18px', cursor: 'pointer',
                }}
              >
                <RotateCcw size={16} /> Play again
              </button>
            )}
            {!over && g.t0 && (
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => { if (armRestart) replayRun(); else setArmRestart(true); }}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: SANS, fontWeight: 700, fontSize: 12, color: armRestart ? COLORS.accent : '#9aa2b1', textDecoration: 'underline', textUnderlineOffset: 3, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                >
                  <RotateCcw size={13} /> {armRestart ? 'Press again to start over' : 'Restart run'}
                </button>
              </div>
            )}
          </div>
        )}

        {focusMode && (
          <div style={{ maxWidth: 620, margin: '30px auto 0', textAlign: 'center' }}>
            <button onClick={() => setShowChrome(true)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: '0.03em', color: T.blueDeep, background: 'none', border: '1.5px solid var(--accent-border)', borderRadius: 9, padding: '10px 20px', cursor: 'pointer' }}>Show leaderboard &amp; more</button>
            <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.faded, fontWeight: 600, marginTop: 8 }}>Leaderboards, share for credit &amp; the other daily puzzles</div>
          </div>
        )}

        {!focusMode && !identity && (
          <div id="daily-join" style={{ marginTop: 20 }}>
            <JoinLeaderboardForm hideIcon heading="Put your name on today&rsquo;s board" identity={identity} onJoined={(u) => setIdentity(u)} />
          </div>
        )}

        <div style={{ display: focusMode ? 'none' : 'block' }}>
          <DailyGamesGrid
            self="sweep"
            maxWidth={620}
            challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`}
            share={{ label: copied ? 'Copied' : 'Share', onClick: copyShare }}
            light
            divider
            boardSlot={<DailyBoardPanel self="sweep" quizId={PUZZLE.quizId} maxWidth={620} streak={{ current: myStats.cur, best: myStats.max }} />}
          />
        </div>

        <section style={{ display: focusMode ? 'none' : 'block', maxWidth: 620, margin: '26px auto 0', fontSize: 13.5, lineHeight: 1.6, color: COLORS.faded }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: COLORS.ink, margin: '0 0 8px' }}>About Sweep</h2>
          <p style={{ margin: '0 0 9px' }}>
            Sweep is a daily minesweeper with no bottom edge. Everyone digs the same field on the same day, so the
            leaderboard compares reading rather than luck, and the field is checked before it ships: every square on it
            can be worked out from the top row down, so a run never ends on a guess.
          </p>
          <p style={{ margin: '0 0 9px' }}>
            One life a run, and as many runs as you like. Your best one takes the board. However long you dig, Sweep pays
            at most 1 IQ point a day, so a long sitting cannot buy a place in the standings. On Sundays the same field
            carries more mines.
          </p>
          <p style={{ margin: 0 }}>
            More daily puzzles: <a href="/blocks" style={{ color: COLORS.accent }}>Blocks</a>,{' '}
            <a href="/crux" style={{ color: COLORS.accent }}>Crux</a>,{' '}
            <a href="/tally" style={{ color: COLORS.accent }}>Tally</a>.
          </p>
        </section>
      </div>

      {/* OUTSIDE the page column on purpose: the column is a stacking context,
          and this card's backdrop sits at z-index 85. Nested inside, it paints
          under the masthead. See the same note in BlocksClient. */}
      {!playing && !endClosed && (
        <DailyEndCard
          modal
          self="sweep"
          won={won}
          quizId={PUZZLE.quizId}
          completed
          score={<>{nf(g.score)} cell{g.score === 1 ? '' : 's'} uncovered &middot; par {nf(PAR)}</>}
          subline={<>depth {nf(depth)} &middot; {nf(g.digs)} dig{g.digs === 1 ? '' : 's'} &middot; {nf(g.flag.length)} flag{g.flag.length === 1 ? '' : 's'} &middot; {fmtTime(g.ms)}</>}
          onShare={copyShare}
          shareLabel={copied ? 'Copied' : 'Share Result'}
          onReplay={replayRun}
          onClose={() => setEndClosed(true)}
        />
      )}

      {showHelp && (
        <div
          onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(20,22,28,0.55)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, background: COLORS.cream, borderRadius: 12, border: `2px solid ${COLORS.ink}`, padding: '20px 22px', fontFamily: SANS, maxHeight: '86vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 21, fontWeight: 800, color: COLORS.ink }}>How to play</div>
              <button onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} aria-label="Close" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded }}><X size={20} /></button>
            </div>
            {rulesBody}
            <button onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ ...btn, marginTop: 14, background: COLORS.ink, borderColor: COLORS.ink, color: T.white }}>Play</button>
          </div>
        </div>
      )}

      <style>{`
        .sw-view::-webkit-scrollbar { width: 6px; }
        .sw-view::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
        @media (max-width: 640px) {
          .sw-ladder { display: none !important; }
          .sw-strip { display: flex !important; }
          .sw-keys { display: none !important; }
        }
      `}</style>

      <div style={{ display: focusMode ? 'none' : 'block' }}><Footer /></div>
    </div>
  );
}

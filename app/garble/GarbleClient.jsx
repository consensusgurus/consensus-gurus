'use client';

// Garble — five garbled words, one clued finale.
//
// Untangle each scrambled word using exactly the letters shown. The gold
// (marked) letters of every solution feed a final answer whose clue is
// printed from the start; solving the finale ends the puzzle. Score is out of
// 10: one point per word untangled, five for the finale. Wrong tries are
// misses — fewest misses breaks leaderboard ties, then time.
//
// Soft launch: standalone page, not linked from the hub or homepage.

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { HelpCircle, Share2, RotateCcw, X, Trophy, Eye, Smartphone } from 'lucide-react';
import Grain from '../Grain';
import DailyGamesPromo from '../DailyGamesPromo';
import DailyChrome from '../DailyChrome';
import DailyRules from '../DailyRules';
import Footer from '../Footer';
import DailyBoardPanel from '../quiz/[id]/DailyBoardPanel';
import JoinLeaderboardForm from '../quiz/[id]/JoinLeaderboardForm';
import DailyGamesGrid from '../DailyGamesGrid';
import DailyEndCard from '../DailyEndCard';
import { isMobileDevice } from '@/lib/is-mobile';
import useAbandonFlush from '../quiz/[id]/useAbandonFlush';
import { withRef } from '@/lib/referrals';
import { notifyShareCredit } from '../ShareCreditPop';
import DailyMasthead from '../DailyMasthead';
import { isLoft } from '@/lib/loft';
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
import { T } from '@/lib/theme';
import { meRequest } from '@/app/quizMeClient';

const COLORS = {
  cream: T.surface,
  paper: T.paper,
  ink: T.ink,
  ember: T.accent,
  rust: T.danger,
  faded: T.muted,
  gold: '#e6b93f',
  goldInk: '#5c4a06',
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const PAPER = '#fbf9f4';

// iOS/iPadOS never fires beforeinstallprompt — A2HS lives in Safari's share
// sheet, so the button opens instructions there instead.
const isIosDevice = () =>
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent || '') ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));


const HELP_KEY = 'sot_garble_help_seen';

const STATS_KEY = 'sot_garble_stats';

// Personal stats + streak (localStorage), same pattern as Links/Crux.
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
    const pz = m && byQuiz[m.quizId];
    if (!pz || m.attempt !== 1) continue;
    if (rec[pz.num]) continue;
    const sc = Math.max(0, Math.min(10, Math.round(((m.scorePct || 0) / 100) * 10)));
    if (!changed) { rec = { ...rec }; changed = true; }
    rec[pz.num] = { s: sc, t: 10, g: null, won: !!m.perfect };
  }
  if (!changed) return s;
  const s2 = { ...s, rec };
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s2)); } catch (e) {}
  return s2;
}

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
function sameLetters(a, b) {
  if (a.length !== b.length) return false;
  return a.split('').sort().join('') === b.split('').sort().join('');
}
const EMPTY_BOARD = { plays: 0, best: null, topTime: null, leaderboard: [], leaderboardAll: [], leaderboardMobile: [], leaderboardFirst: [], leaderboards: {} };

function freshState(puzzle) {
  return { v: 1, solved: {}, misses: 0, finalSolved: false, status: 'playing', t0: null, tEnd: null };
}

export default function GarbleClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const STORE_KEY = `sot_garble_${PUZZLE.num}`;
  const bank = useMemo(() => PUZZLE.words.flatMap((w, wi) => w.marks.map((mi) => ({ ch: w.answer[mi], wi }))), [PUZZLE]);
  const [g, setG] = useState(() => freshState(PUZZLE));
  const [sel, setSel] = useState(0); // 0..4 word rows, 'final'
  const [typed, setTyped] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [gateRules, setGateRules] = useState(false); // start tile: full rules (first-timer) vs compact card
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [armReveal, setArmReveal] = useState(false);
  useEffect(() => {
    if (!armReveal) return undefined;
    const t = setTimeout(() => setArmReveal(false), 3500);
    return () => clearTimeout(t);
  }, [armReveal]);
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

  const [justWon, setJustWon] = useState(false);
  const [endClosed, setEndClosed] = useState(false);
  // The finished board starts turned OVER, showing what to do next.
  const [revealed, setRevealed] = useState(false);
  const [shareCta, setShareCta] = useState('Share');
  useEffect(() => {
    if (contestIsLive()) setShareCta(`Share for ${CONTEST.prizeLabel}*`);
  }, []);
  const [hydrated, setHydrated] = useState(false);
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [identity, setIdentity] = useState(null);
  // eslint-disable-next-line no-unused-vars -- the player chip moved into
  // DailyChrome (QuizNavHeader fetches its own identity); the fetch below
  // stays for the cross-device stats merge.
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState(null);
  const toastTimer = useRef(null);
  const viewedRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.v === 1) setG({ ...freshState(PUZZLE), ...saved });
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
    // same-device day breadcrumb for cross-puzzle recommendations — only for
    // TODAY'S puzzle (archive replays must not mark today as played)
    try {
      if (PUZZLE.num === pickPuzzle(puzzles, null).num) {
        (function(){ var _dn = g.status !== 'playing'; if (_dn || g.t0) localStorage.setItem('sot_garble_day', JSON.stringify({ d: etToday(), done: _dn })); else localStorage.removeItem('sot_garble_day'); })();
      }
    } catch (e) {}
  }, [g, hydrated, STORE_KEY, PUZZLE, puzzles]);

  useEffect(() => {
    try {
      const id = JSON.parse(localStorage.getItem('sot_quiz_identity'));
      if (id && id.email) setIdentity(id);
    } catch (e) {}
    try {
      const anon = getAnonId();
      let em = '';
      try { const idj = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); if (idj && idj.email) em = `&email=${encodeURIComponent(idj.email)}`; } catch (e) {}
      if (anon || em) {
        meRequest(`/api/quiz/me?anonId=${encodeURIComponent(anon || '')}${em}&history=1`)
          .then((r) => r.json())
          .then((d) => { if (d && Array.isArray(d.recent)) setStats((cur) => mergeServerStats(cur || getStats(), d.recent, puzzles)); if (d && d.found && d.name) setPlayer({ name: d.name, rank: (d.ranks && d.ranks.xp) || d.rank || null, key: d.userKey || null }); })
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

  const [showChrome, setShowChrome] = useState(false);
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

  const playing = g.status === 'playing';
  const LOFT = isLoft('garble');
  const prevPuzzle = puzzles.find((x) => x.num === PUZZLE.num - 1) || null;
  const preStart = playing && !g.t0;   // not begun: show the start tile in place of the board
  const started = playing && !!g.t0;   // clock running: show the board
  const focusMode = playing && !showChrome;
  const solvedCount = Object.keys(g.solved).length;
  const myStats = deriveStats(stats, pickPuzzle(puzzles, null).num);
  const targetLen = sel === 'final' ? PUZZLE.final.length : PUZZLE.words[sel] ? PUZZLE.words[sel].answer.length : 0;
  const guessesUsed = g.misses;
  const elapsed = g.t0 ? fmtTime((g.tEnd || nowTick) - g.t0) : '0:00';

  const REC_KEY = `sot_garble_rec_${PUZZLE.num}`;
  const abandon = useAbandonFlush(() => {
    // A play counts only once the player acts: a word untangled or a miss.
    // Opening the puzzle and dismissing the start tile does not log a 0-score
    // attempt.
    const acted = Object.keys(g.solved).length > 0 || g.misses > 0;
    if (!acted || g.status !== 'playing') return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - (g.t0 || Date.now())) / 1000)));
    try { localStorage.setItem(REC_KEY, '1'); } catch (e) {}
    return { quizId: PUZZLE.quizId, score: 0, total: 10, correct: 0, guessesUsed: 0, timeElapsed: el, abandoned: true, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') };
  });

  function postResult(g2, score) {
    abandon.markFlushed();
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    try {
      fetch('/api/quiz/result', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: PUZZLE.quizId, score, total: 10, correct: Object.keys(g2.solved).length, guessesUsed: g2.misses, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
      })
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
        .catch(() => {});
    } catch (e) {}
  }

  function endGame(won) {
    const score = Object.keys(g.solved).length + (won ? 5 : 0);
    const g2 = { ...g, finalSolved: won, status: won ? 'won' : 'done', tEnd: Date.now() };
    if (won) g2.solvedAtEnd = true;
    try { setStats(recordStat(PUZZLE.num, { s: score, t: 10, g: g2.misses, won: g2.finalSolved && g2.misses === 0 })); } catch (e) {}
    postResult(g2, score);
    setG(g2);
    if (won) setJustWon(true);
  }

  function submit() {
    if (!playing) return;
    if (sel === 'final') {
      if (typed.length < PUZZLE.final.length) { say('Not enough letters'); return; }
      const g2 = { ...g };
      if (!g2.t0) g2.t0 = Date.now();
      if (typed === PUZZLE.final) {
        setTyped('');
        const score = Object.keys(g2.solved).length + 5;
        const g3 = { ...g2, finalSolved: true, status: 'won', tEnd: Date.now() };
        try { setStats(recordStat(PUZZLE.num, { s: score, t: 10, g: g3.misses, won: g3.finalSolved && g3.misses === 0 })); } catch (e) {}
        postResult(g3, score);
        setG(g3);
        setJustWon(true);
      } else {
        g2.misses = g.misses + 1;
        say('Not the finale — that’s a miss');
        setG(g2);
      }
      return;
    }
    const w = PUZZLE.words[sel];
    if (!w || g.solved[sel]) return;
    if (typed.length < w.answer.length) { say('Not enough letters'); return; }
    const g2 = { ...g };
    if (!g2.t0) g2.t0 = Date.now();
    if (!sameLetters(typed, w.answer)) {
      say('Use exactly the letters shown');
      setG(g2);
      return;
    }
    if (typed === w.answer) {
      g2.solved = { ...g.solved, [sel]: true };
      setTyped('');
      const next = PUZZLE.words.findIndex((_, i) => !g2.solved[i]);
      setSel(next === -1 ? 'final' : next);
      say(`${w.answer} — untangled`);
    } else {
      g2.misses = g.misses + 1;
      say('A real tangle — that’s a miss');
    }
    setG(g2);
  }

  const onKey = useCallback((k) => {
    if (!playing) return;
    if (k === 'ENTER') submit();
    else if (k === 'BACK') setTyped((t) => t.slice(0, -1));
    else if (/^[A-Z]$/.test(k)) setTyped((t) => (t.length < targetLen ? t + k : t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, sel, typed, targetLen, g]);

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

  // Dismissing the start tile begins the clock (sets t0) and marks rules seen.
  // No-op once started, so re-reading rules later never resets the timer.
  function startGame() {
    setG((cur) => (cur.t0 ? cur : { ...cur, t0: Date.now() }));
    try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {}
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    setG(freshState(PUZZLE)); setSel(0); setTyped(''); setJustWon(false); setEndClosed(false);
  }

  function shareText() {
    const row = PUZZLE.words.map((_, i) => (g.solved[i] ? '\u{1F7E6}' : '⬛')).join('');
    const star = g.finalSolved ? '⭐' : '⬛';
    const score = solvedCount + (g.finalSolved ? 5 : 0);
    return `Garble #${PUZZLE.num} · ${score}/10 · ${g.misses} miss${g.misses === 1 ? '' : 'es'} · ${elapsed}\n${row}${star}\n${withRef('mindloftdaily.com/garble')}`;
  }
  function copyShare() {
    const text = playing
      ? `Garble #${PUZZLE.num} — five garbled words, one clued finale. Can you untangle it?\n${withRef('mindloftdaily.com/garble')}`
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

  const ended = !playing;
  const won = g.status === 'won';
  const isTodays = PUZZLE.num === pickPuzzle(puzzles, null).num;
  const iq = useIqStanding({ game: 'garble', quizId: PUZZLE.quizId, active: LOFT && !playing });
  const nextUp = useNextUnplayed({ self: 'garble', active: LOFT && !playing });
  const upNext = useUnplayedSimilar({ self: 'garble', active: LOFT && !playing });
  const dailyBoard = useDailyBoard({ quizId: PUZZLE.quizId, active: LOFT && !playing });
  const allTime = useGameAllTime({ game: 'garble', active: LOFT && !playing });
  const dayStats = useDayStats();
  const catRank = useCategoryRank({ self: 'garble', active: LOFT && !playing });
  const score = solvedCount + (g.finalSolved ? 5 : 0);

  const cellBase = { display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, borderRadius: 6, userSelect: 'none' };

  function wordRow(w, i) {
    const isSel = playing && sel === i && !g.solved[i];
    const solvedRow = !!g.solved[i];
    return (
      <div key={i} onClick={() => { if (playing && !g.solved[i]) { setSel(i); setTyped(''); } }} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12, cursor: playing && !g.solved[i] ? 'pointer' : 'default', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {w.scramble.split('').map((ch, j) => (
            <span key={j} style={{ ...cellBase, width: 32, height: 32, fontSize: 16, background: COLORS.paper, color: COLORS.faded }}>{ch}</span>
          ))}
        </div>
        <span style={{ color: '#c3c8cf', fontWeight: 800 }}>&rarr;</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {w.answer.split('').map((ch, j) => {
            const marked = w.marks.includes(j);
            let bg = T.white, fg = COLORS.ink, border = '1.5px solid rgba(20,22,28,0.18)';
            let letter = '';
            if (solvedRow || ended) {
              letter = ch;
              if (marked) { bg = COLORS.gold; fg = COLORS.goldInk; border = `1.5px solid ${COLORS.gold}`; }
              else { bg = solvedRow ? COLORS.ink : T.white; fg = solvedRow ? T.white : COLORS.rust; border = solvedRow ? `1.5px solid ${COLORS.ink}` : '1.5px dashed rgba(192,57,43,0.55)'; }
            } else if (isSel) {
              letter = typed[j] || '';
              bg = typed.length === j ? '#dbe7ff' : '#eef4ff';
              fg = COLORS.ember;
              // marked cells keep their gold border even while the row is
              // selected — the blue fill carries selection, gold = finale feed
              border = marked ? `2.5px solid ${COLORS.gold}` : `2px solid ${typed.length === j ? COLORS.ember : 'rgba(14,29,64,0.55)'}`;
            } else if (marked) {
              border = `2px solid ${COLORS.gold}`;
            }
            return <span key={j} style={{ ...cellBase, width: 44, height: 44, fontSize: 21, background: bg, color: fg, border }}>{letter}</span>;
          })}
        </div>
      </div>
    );
  }

  // Keyboard rows — shared between the inline desktop keyboard and the mobile
  // keyboard. On mobile the keys are pinned to the bottom of the screen (see the
  // fixed bar near the end of the render) so the scramble rows and finale clue
  // above can scroll freely without the keys ever covering them.
  const keyboardRows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, ri) => (
    <div key={ri} style={{ display: 'flex', gap: 4, marginBottom: 5, justifyContent: 'center' }}>
      {ri === 2 && <button className="gb-key" onClick={() => onKey('ENTER')} style={{ flex: '1.6 0 0', height: 44, background: COLORS.ember, color: T.white, fontSize: 11.5 }}>ENTER</button>}
      {row.split('').map((ch) => (
        <button key={ch} className="gb-key" onClick={() => onKey(ch)} style={{ flex: '1 0 0', height: 44, background: T.white, color: COLORS.ink, fontSize: 15, border: '1.5px solid rgba(20,22,28,0.15)' }}>{ch}</button>
      ))}
      {ri === 2 && <button className="gb-key" onClick={() => onKey('BACK')} aria-label="Delete" style={{ flex: '1.6 0 0', height: 44, background: COLORS.paper, color: COLORS.ink, fontSize: 16 }}>&#9003;</button>}
    </div>
  ));

  // Shared rules body — rendered in both the how-to-play modal and the start tile.
  const rulesBody = (
    <DailyRules
      chips={[
        { label: 'Gold letters feed the finale', style: { background: COLORS.gold, border: `1.5px solid ${COLORS.goldInk}`, color: COLORS.goldInk } },
      ]}
      lead="Untangle five garbled words, then the finale they feed."
      steps={[
        <><b>Tap a row</b>, type the word using exactly the letters shown, and hit <b>enter</b>. A wrong word is a <b>miss</b>.</>,
        <>Each solved word donates its <b>gold letters</b> to <b>the finale</b>, a last answer with its clue printed up top.</>,
        <>Solve the finale whenever you see it. It <b>ends the puzzle</b>.</>,
      ]}
      knack="The finale is worth half the board, so a gold letter or two is often enough to call it before all five words are untangled."
      footer="Score is out of 10: one per word, five for the finale. Fewest misses breaks ties, then time."
    />
  );

  return (
    <div className={LOFT ? 'loft-page' : undefined} style={{ minHeight: '100vh', background: COLORS.cream, position: 'relative' , overflowX: LOFT ? 'hidden' : undefined }}>
      <Grain />
      {/* Shared daily chrome (app/DailyChrome.jsx): home masthead + stat bar +
          today's slate rail, collapsing to one line once the clock runs. Outside
          the page wrapper so the bands run full bleed; nothing here is pinned. */}
      <DailyChrome slug="garble" name="Garble" collapsed={started} loft={LOFT} />
      {LOFT && (
        <LoftCap
          name="Garble"
          cat="Word"
          outcome={playing ? null : (won ? 'won' : (score > 0 ? 'part' : 'lost'))}
          num={PUZZLE.num}
          tiles={playing ? null : upNext}
          dateLabel={playing ? PUZZLE.dateLabel : (won ? 'Solved' : (score > 0 ? 'Partly solved' : 'Not solved'))}
          onHelp={() => setShowHelp(true)}
          sunday={PUZZLE.sunday ? 'Sunday Edition' : null}
          figures={playing ? [
            { v: solvedCount, k: 'solved' },
            { v: elapsed, k: 'time' },
          ] : [
            { v: score, k: 'score' },
            { v: solvedCount, k: 'solved' },
            { v: elapsed, k: 'time' },
          ]}
        />
      )}
      <div className="gb-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: mobileUi && started ? '18px 38px calc(185px + env(safe-area-inset-bottom))' : '18px 38px 80px', fontFamily: SANS }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <style>{`
            .gb-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid var(--blue-deep);background:var(--white);color:var(--blue-deep);border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
            .gb-btn:hover{background:var(--accent-soft);}
            .gb-key{border:none;font-family:${SANS};font-weight:800;cursor:pointer;border-radius:6px;padding:0;touch-action:manipulation;}
            .gb-key:active{transform:scale(0.94);}
            @keyframes gbfall{0%{transform:translateY(-4vh) rotate(0deg);}100%{transform:translateY(108vh) rotate(680deg);}}
            .gb-conf{position:fixed;top:-3vh;z-index:86;pointer-events:none;border-radius:2px;animation:gbfall linear forwards;}
            @media(max-width:560px){.gb-wrap{padding-left:14px !important;padding-right:14px !important;}}
            .gb-htp-s{display:none;}
            @media(max-width:520px){.gb-htp-f{display:none;}.gb-htp-s{display:inline;}}
            @media(max-width:560px){.gb-ttl{flex-direction:column;align-items:flex-start;gap:1px;}.gb-ttl h1{font-size:21px;letter-spacing:0.02em;}.gb-ttl .gb-ttl-dt{font-size:15px;}.gb-ttl-dot{display:none;}}
          `}</style>


          {/* masthead: pressed GARBLE tiles with No./date inline, one rule beneath */}
          {!LOFT && (
          <DailyMasthead
            slug="garble"
            num={PUZZLE.num}
            dateLabel={PUZZLE.dateLabel}
            accent={COLORS.goldInk}
            blockGap={5}
            helpTop={13}
            marginBottom={16}
            onHelp={() => setShowHelp(true)}
            sunday={PUZZLE.sunday && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: T.white, background: COLORS.ember, borderRadius: 4, padding: '2px 6px' }}>Sunday Edition &middot; 6 letters</span>}
            blocks={'GARBLE'.split('').map((ch, i) => {
                const gold = i === 0 || i === 5;
                return (
                  <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 25, background: gold ? COLORS.gold : COLORS.ink, color: gold ? COLORS.goldInk : T.white, boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
                );
              })}
          />
          )}

        {/* LOFT: the play area sits on the navy stage, which runs full bleed
            and fills the first screen, so the board is the one lit object. */}
        <div className={LOFT ? 'loft-stage' : undefined}>
          <div className={LOFT && !playing ? (revealed ? 'loft-flip' : 'loft-flip on') : undefined}>
          <div className={LOFT && !playing ? 'loft-flip-in' : undefined}>
          <div className={LOFT && !playing ? 'loft-face' : undefined}>
          <div className={LOFT ? 'loft-sheet' : undefined}>

          {/* start tile — the words stay sealed until Start begins the clock */}
          {preStart && (
            <div className={LOFT ? 'loft-card' : undefined} style={{ background: COLORS.cream, border: `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '22px', display: 'flex', flexDirection: 'column', marginBottom: 16 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>{gateRules ? 'How to play' : 'Garble is ready'}</div>
              {gateRules ? rulesBody : (
                <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
                  <p style={{ margin: '0 0 6px' }}>Five scrambled words to untangle, each feeding a final clued answer.</p>
                </div>
              )}
              <div style={{ marginTop: 18 }}>
                <button className="gb-btn" onClick={startGame} style={{ background: T.cta, color: T.white, fontSize: 15, padding: '11px 22px' }}>Start</button>
                <div style={{ marginTop: 10 }}>
                  <button type="button" onClick={() => setGateRules((v) => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.faded, textDecoration: 'underline' }}>
                    {gateRules ? 'Hide detailed instructions' : 'Show detailed instructions'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!preStart && (<>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', marginBottom: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: COLORS.faded }}>
              Misses <span style={{ fontSize: 17, color: g.misses > 5 ? COLORS.rust : COLORS.ink, marginLeft: 4 }}>{g.misses}</span>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.faded }}>{solvedCount}/5 untangled {g.finalSolved ? '· finale solved' : ''}</div>
          </div>

          <div style={{ marginBottom: 6 }}>{PUZZLE.words.map((w, i) => wordRow(w, i))}</div>

          {/* the finale */}
          <div onClick={() => { if (playing) { setSel('final'); setTyped(''); } }} style={{ background: T.white, border: `2px solid ${playing && sel === 'final' ? COLORS.ember : 'rgba(20,22,28,0.14)'}`, borderRadius: 12, padding: '14px 16px', marginBottom: 16, cursor: playing ? 'pointer' : 'default' }}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: COLORS.goldInk, marginBottom: 4 }}>The finale</div>
            <div style={{ fontSize: 15.5, fontWeight: 700, fontStyle: 'italic', color: COLORS.ink, marginBottom: 10 }}>&ldquo;{PUZZLE.clue}&rdquo;</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
              {bank.map((b, i) => (
                <span key={i} style={{ ...cellBase, width: 26, height: 26, fontSize: 13, background: g.solved[b.wi] || ended ? COLORS.gold : COLORS.paper, color: g.solved[b.wi] || ended ? COLORS.goldInk : COLORS.faded }}>{g.solved[b.wi] || ended ? b.ch : '?'}</span>
              ))}
              <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.faded, alignSelf: 'center', marginLeft: 6 }}>your collected letters</span>
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {PUZZLE.final.split('').map((ch, j) => {
                const isSel = playing && sel === 'final';
                let letter = '', bg = T.white, fg = COLORS.ink, border = '1.5px solid rgba(20,22,28,0.18)';
                if (ended || g.finalSolved) {
                  letter = ch;
                  bg = g.finalSolved ? COLORS.gold : T.white;
                  fg = g.finalSolved ? COLORS.goldInk : COLORS.rust;
                  border = g.finalSolved ? `1.5px solid ${COLORS.gold}` : '1.5px dashed rgba(192,57,43,0.55)';
                } else if (isSel) {
                  letter = typed[j] || '';
                  bg = typed.length === j ? '#dbe7ff' : '#eef4ff';
                  fg = COLORS.ember;
                  border = `2px solid ${typed.length === j ? COLORS.ember : 'rgba(14,29,64,0.55)'}`;
                }
                return <span key={j} style={{ ...cellBase, width: 44, height: 44, fontSize: 21, background: bg, color: fg, border }}>{letter}</span>;
              })}
            </div>
          </div>
          </>)}

          {/* keyboard — desktop shows the keys inline here; on mobile the keys
              are pinned to the bottom of the screen (fixed bar below) and only
              the hint + reveal stay in the scroll flow */}
          {started && (
            <div style={{ maxWidth: 470 }}>
              {!mobileUi && (
                <div style={{ textAlign: 'left', marginBottom: kbdOpen ? 8 : 0 }}>
                  <button onClick={() => setKbdOpen((o) => !o)} style={{ background: 'none', border: '1.5px solid rgba(28,30,36,0.22)', borderRadius: 8, padding: '6px 13px', cursor: 'pointer', fontFamily: SANS, fontWeight: 700, fontSize: 12, color: COLORS.faded }}>
                    {kbdOpen ? 'Hide keyboard' : 'Show keyboard'}
                  </button>
                </div>
              )}
              {!mobileUi && kbdOpen && keyboardRows}
              <p style={{ fontSize: 11.5, color: COLORS.faded, fontWeight: 600, margin: mobileUi ? '0 0 2px' : '6px 0 0', textAlign: 'center' }}>
                Use exactly the letters shown. The finale is fair game at any time.
              </p>
              {/* Reveal is deliberately buried: below the puzzle, only once you have
                  a display name and have made progress, and it takes two taps. */}
              {identity && (solvedCount > 0 || g.misses > 0) && (
                <p style={{ margin: '12px 0 0', textAlign: 'center' }}>
                  <button onClick={() => { if (armReveal) { setArmReveal(false); endGame(false); } else { setArmReveal(true); } }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS, fontWeight: 700, fontSize: 12, color: armReveal ? COLORS.rust : COLORS.faded, textDecoration: 'underline', textUnderlineOffset: 3, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <Eye size={13} /> {armReveal ? 'Tap again — ends the puzzle and reveals the answers' : 'Reveal answers & end'}
                  </button>
                </p>
              )}
            </div>
          )}

          {/* result: the reveal is on the board above; the end popup is the
              DailyEndCard modal (below). Only the archive note stays inline. */}
          {ended && (
            <>
              {!isTodays && (
                <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
                  You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                  <a href="/garble" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s Garble &rarr;</a>
                  {' · '}
                  <a href="/daily" style={{ color: COLORS.faded, fontWeight: 700, textDecoration: 'underline' }}>All daily puzzles</a>
                </p>
              )}
            </>
          )}
        </div>


          </div>
          {LOFT && !playing && revealed && (
            <button className="loft-showopts" onClick={() => setRevealed(false)}>&#8630; Show options</button>
          )}
          </div>
          {LOFT && !playing && (
            <LoftFinish
              name="Garble"
              catRank={catRank}
              outcome={won ? 'won' : (score > 0 ? 'part' : 'lost')}
              title={won ? 'Solved' : (score > 0 ? 'Partly solved' : 'Not solved')}
              detail={`${score} \u00b7 ${solvedCount} solved \u00b7 ${elapsed}`}
              iq={iq}
              board={dailyBoard}
              gameRank={allTime && allTime.ready
                ? { value: allTime.rank != null ? `#${Number(allTime.rank).toLocaleString()}` : '\u2014',
                    label: allTime.field != null ? `of ${Number(allTime.field).toLocaleString()} Garble all time` : 'all-time rank' }
                : null}
              day={dayStats}
              streak={isTodays ? myStats.cur : null}
              missLabel="Miss"
              archive={puzzles
                .filter((p) => p.live <= etToday() && p.num !== PUZZLE.num)
                .sort((x, y) => y.num - x.num)
                .slice(0, 14)
                .map((p) => ({
                  num: p.num,
                  dateLabel: p.dateLabel,
                  sunday: !!p.sunday,
                  href: `/garble?p=${p.num}`,
                  done: !!(stats && stats.rec && stats.rec[p.num]),
                  score: (stats && stats.rec && stats.rec[p.num]) ? stats.rec[p.num].s : null,
                }))}
              options={[
                { label: copied ? 'Copied' : (shareCta || 'Share'), sub: 'Your result, no spoilers', kind: 'gold', onClick: copyShare },
                { tone: 'reveal', label: won ? 'Return to board' : 'Reveal answer',
                  sub: won ? 'Your finished board' : 'Show what you missed', onClick: () => setRevealed(true) },
                prevPuzzle && { tone: 'another', label: 'Play another Garble', sub: `No. ${prevPuzzle.num}, yesterday\u2019s puzzle`, href: `/garble?p=${prevPuzzle.num}` },
                nextUp && { tone: 'similar', label: 'Play similar', sub: `${nextUp.name} \u00b7 ${nextUp.tag}`, href: nextUp.href },
                { tone: 'replay', label: 'Replay', sub: 'This puzzle again, unscored', onClick: resetGame },
                { label: 'Back to main', sub: 'The day\u2019s full board', tone: 'main', href: '/' },
              ]}
            />
          )}
          </div>
          </div>
        {/* end of the navy play stage; everything below is the light tail */}
        </div>
        {focusMode && (
          <div style={{ maxWidth: 640, margin: '30px auto 0', textAlign: 'center' }}>
            <button className="loft-showchrome" onClick={() => setShowChrome(true)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: '0.03em', color: T.blueDeep, background: 'none', border: '1.5px solid var(--accent-border)', borderRadius: 9, padding: '10px 20px', cursor: 'pointer' }}>Show overview and more</button>
          </div>
        )}
        {/* daily-page bottom group: challenge + share + other puzzles + archive, divider below */}
        {LOFT && (
          <div className="loft-report">
            <ReportIssue self="garble" name="Garble" accent="#ffffff" align="center" />
          </div>
        )}
        {!focusMode && !LOFT && (<DailyGamesGrid replay={ended ? resetGame : null}
          self="garble"
          maxWidth={640}
          challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`}
          share={{ label: copied ? 'Copied' : 'Share', onClick: copyShare }}
          light
          boardSlot={<DailyBoardPanel self="garble" quizId={PUZZLE.quizId} maxWidth={640} streak={{ current: myStats.cur, best: myStats.max }} />}
          divider
        />)}
        {!focusMode && mobileUi && !standalone && (
          <div style={{ maxWidth: 640, margin: '16px auto 0' }}>
            <button onClick={a2hsClick} style={{ width: '100%', fontFamily: SANS, fontSize: 13.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 800, height: 54, borderRadius: 10, border: 'none', background: '#21b45e', color: T.white, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, whiteSpace: 'nowrap' }}>
              <Smartphone size={15} strokeWidth={2.5} /> Add to Home Screen
            </button>
          </div>
        )}
        {showA2hsHelp && (
          <div onClick={() => setShowA2hsHelp(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,22,28,0.55)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: T.white, borderRadius: 14, maxWidth: 430, width: '100%', padding: '22px 22px 16px', fontFamily: SANS, border: '1.5px solid rgba(20,22,28,0.12)' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Garble to your Home Screen</div>
              {isIosDevice() ? (
                <ol style={{ margin: '0 0 4px', paddingLeft: 20, color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  <li>Tap the <b>Share</b> button in Safari&apos;s toolbar.</li>
                  <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                  <li>Tap <b>Add</b> — the gold-tile tile opens today&apos;s puzzle, every day.</li>
                </ol>
              ) : (
                <p style={{ margin: '0 0 4px', color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  Open your browser&apos;s menu and choose <b>Add to Home Screen</b> (or <b>Install app</b>). The gold-tile tile opens today&apos;s puzzle, every day.
                </p>
              )}
              <button onClick={() => setShowA2hsHelp(false)} style={{ marginTop: 10, fontFamily: SANS, fontSize: 12.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700, height: 44, width: '100%', borderRadius: 10, border: 'none', background: COLORS.ink, color: T.white, cursor: 'pointer' }}>Got it</button>
            </div>
          </div>
        )}
        {!focusMode && !identity && (
          <div id="daily-join" style={{ maxWidth: 640, margin: '18px auto 0' }}>
            <JoinLeaderboardForm hideIcon heading="See your stats and join the leaderboard" identity={identity} onJoined={(id) => { setIdentity(id); if (id && id.username) setPlayer((p) => p || { name: id.username, rank: null }); }} />
          </div>
        )}
        {/* Personal stats wiring (myStats) is retained for the share string and
            streak logic; the on-page "Your stats" tile row is no longer shown.
            The daily leaderboard now renders in DailyGamesGrid's boardSlot,
            directly under the Challenge / Share actions (owner, 2026-07-23). */}
      </div>

      {/* Mobile: keyboard pinned to the bottom of the viewport. The puzzle
          content above scrolls independently (gb-wrap gets extra bottom padding
          while playing), so the word rows and finale clue are never hidden
          behind the keys — the fix for on-screen keys covering the top clues. */}
      {started && mobileUi && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40, background: COLORS.cream, borderTop: '1.5px solid rgba(20,22,28,0.12)', boxShadow: '0 -4px 16px rgba(20,22,28,0.10)', padding: '8px 8px calc(8px + env(safe-area-inset-bottom))' }}>
          <div style={{ maxWidth: 470, margin: '0 auto' }}>
            {keyboardRows}
          </div>
        </div>
      )}

      {/* confetti now lives in the shared DailyEndCard (win-only), so every daily puzzle gets it */}

      {/* the end-of-puzzle popup: the shared DailyEndCard as a dismissible modal (win or loss) */}
      {ended && !endClosed && !LOFT && (
        <DailyEndCard
          modal
          self="garble"
          won={won}
          headline={<>You scored {Math.round((score / 10) * 100)}%</>}
          subline={<>{score}/10 &middot; {g.misses} miss{g.misses === 1 ? '' : 'es'} &middot; {elapsed}</>}
          onShare={copyShare}
          shareLabel={copied ? 'Copied' : 'Share Result'}
          onReplay={resetGame}
          onClose={() => setEndClosed(true)}
        />
      )}

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
            <button className="gb-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: T.white }}>Play</button>
          </div>
        </div>
      )}

      {/* About Garble — crawlable prose for search, server-rendered into the initial HTML */}
      <section style={{ position: 'relative', display: focusMode ? 'none' : 'block', zIndex: 2, maxWidth: 640, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Garble</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Garble is a free daily word scramble puzzle from Mind Loft. Five garbled words &mdash; one more than the classic format &mdash; each untangle into a real word using exactly the letters shown, and every solution donates its gold letters to the finale.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          The finale is the sixth answer: a final word with its clue printed from the start. Solve it whenever you spot it &mdash; it ends the puzzle on the spot, so an early finale sprint is a real strategy. Wrong arrangements count as misses, and fewest misses breaks ties on the daily leaderboard.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new Garble arrives every day, and the Sunday Edition stretches every answer to six letters. No app, no signup &mdash; play free in your browser. Like interlocking grids more than scrambles? Try <a href="/crux" style={{ color: COLORS.ink, fontWeight: 800 }}>Crux</a>, our daily crossword-style word puzzle.
        </p>
      </section>

      <div style={{ position: 'relative', zIndex: 2, display: focusMode ? 'none' : 'block' }}><Footer /></div>
    </div>
  );
}

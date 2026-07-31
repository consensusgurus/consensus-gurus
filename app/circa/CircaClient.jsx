'use client';

// Circa — the daily year hunt.
//
// One historical moment a day. Type a year (1000 to now) and get hot-and-cold
// feedback: an arrow that says earlier or later, and a heat band that says how
// close you are. Six guesses. Land within three years and the moment is placed
// — that's "circa", and it counts. Hit the exact year for a dead-on finish.
// Score starts at 10 for a first-guess exact and drops one per extra guess
// (a circa finish costs one more); ties on the daily board break by fewest
// guesses, then fastest time. One free hint reveals the century.
//
// Same daily plumbing as Suds/Tally/Span: banked moments gated by Eastern date
// on the server (app/circa/page.js), per-puzzle localStorage saves, /circa?p=N
// archive pinning, streaks + stats, and the shared /api/quiz/* board flow.
// Sundays are the same hunt with a trickier moment to place.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, Share2, RotateCcw, X, Lightbulb, Eye, Smartphone, ArrowUp, ArrowDown, Target } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import DailyGamesPromo from '../DailyGamesPromo';
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

const COLORS = {
  cream: '#f7f8fa',
  paper: '#eceef1',
  ink: '#1c1e24',
  ember: '#0e1d40',
  rust: '#c0392b',
  faded: '#262b35',
  accent: '#0e7490',       // Circa identity — aged-ink teal
  accentSoft: '#e8f7fa',
  green: '#15803d',        // solved / dead on
  greenSoft: '#eefaf1',
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const PAPER = '#fbf9f4';
const HELP_KEY = 'sot_circa_help_seen';
const STATS_KEY = 'sot_circa_stats';

const YR_MIN = 1000;
const MAX_GUESSES = 6;
const SNAP = 3; // within this many years = "circa" — it counts as solved

// heat bands by |guess - year|, after the win checks (0 exact, <=SNAP circa)
const BANDS = [
  { max: 10, key: 'hot', label: 'within 10 years', color: '#9a3d0c', bg: '#ffedd5', border: 'rgba(234,88,12,0.55)', sq: '\u{1F7E7}' },
  { max: 50, key: 'warm', label: 'within 50 years', color: '#92610b', bg: '#fef3c7', border: 'rgba(217,119,6,0.5)', sq: '\u{1F7E8}' },
  { max: 200, key: 'cool', label: 'within 200 years', color: '#0a1730', bg: '#dbeafe', border: 'rgba(14,29,64,0.45)', sq: '\u{1F7E6}' },
  { max: Infinity, key: 'cold', label: 'over 200 years off', color: '#475569', bg: '#e2e8f0', border: 'rgba(71,85,105,0.4)', sq: '⬜' },
];
const bandOf = (diff) => BANDS.find((b) => diff <= b.max);

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

// ─── Personal stats + streak (localStorage), Suds/Tally pattern ─────────────
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

function freshState() {
  return {
    v: 1,
    guesses: [],                // years guessed, in order
    hintUsed: false,
    status: 'playing',          // playing | won | revealed
    started: false,             // false until Start is pressed — keeps the moment covered
    t0: null,
    tEnd: null,
  };
}

export default function CircaClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const YEAR = PUZZLE.year;
  const STORE_KEY = `sot_circa_${PUZZLE.num}`;
  const yrMax = useMemo(() => Number(etToday().slice(0, 4)), []);

  const [g, setG] = useState(freshState);
  const [val, setVal] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [armReveal, setArmReveal] = useState(false);
  const [justWon, setJustWon] = useState(false);
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
  const inputRef = useRef(null);

  const [showChrome, setShowChrome] = useState(false);
  const playing = g.status === 'playing';
  // idle = fresh puzzle, Start not yet pressed: the moment stays covered and the
  // clock is not running. Note an idle puzzle still has status 'playing', so the
  // end-of-puzzle branches below (which all key off !playing) are unaffected.
  const idle = playing && !g.started;
  const focusMode = playing && !showChrome;
  const won = g.status === 'won';
  const guesses = g.guesses;
  const lastGuess = guesses.length ? guesses[guesses.length - 1] : null;
  const exact = won && lastGuess === YEAR;

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
        if (saved && saved.v === 1 && Array.isArray(saved.guesses)) {
          const merged = { ...freshState(), ...saved };
          // A puzzle already underway — or any save written before the Start gate
          // shipped — resumes straight to the board. The gate is only ever shown
          // for a genuinely fresh start.
          if (!merged.started && (merged.guesses.length || merged.hintUsed || merged.t0 || merged.status !== 'playing')) merged.started = true;
          setG(merged);
        }
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
    // same-device day breadcrumb for cross-puzzle recs — TODAY'S puzzle only
    try {
      if (PUZZLE.num === pickPuzzle(puzzles, null).num) {
        (function(){ var _dn = g.status !== 'playing'; if (_dn || g.t0) localStorage.setItem('sot_circa_day', JSON.stringify({ d: etToday(), done: _dn })); else localStorage.removeItem('sot_circa_day'); })();
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
  // Retired (owner ruling 2026-07-20): once the final banked day (No. 7) is in
  // the past, no new puzzle drops — surface that before play, not just after.
  const gameRetired = pickPuzzle(puzzles, null).live < etToday();
  const prevPuzzle = puzzles.find((x) => x.num === PUZZLE.num - 1) || null;
  const myStats = deriveStats(stats, pickPuzzle(puzzles, null).num);
  const finalScore = won ? Math.max(1, (exact ? 11 : 10) - guesses.length) : 0;

  // known bounds from the misses so far (never derived from the win guess)
  const bounds = useMemo(() => {
    let lo = null, hi = null;
    for (const y of guesses) {
      if (y < YEAR && (lo == null || y > lo)) lo = y;
      if (y > YEAR && (hi == null || y < hi)) hi = y;
    }
    return { lo, hi };
  }, [guesses, YEAR]);

  const REC_KEY = `sot_circa_rec_${PUZZLE.num}`;
  const abandon = useAbandonFlush(() => {
    if (!g.t0 || g.status !== 'playing') return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - g.t0) / 1000)));
    try { localStorage.setItem(REC_KEY, '1'); } catch (e) {}
    return { quizId: PUZZLE.quizId, score: 0, total: 10, correct: 0, guessesUsed: 0, timeElapsed: el, abandoned: true, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') };
  });

  function postResult(g2, score) {
    abandon.markFlushed();
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    try { setStats(recordStat(PUZZLE.num, { s: score, t: 10, g: g2.guesses.length, won: score === 10 })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        // guessesUsed = guesses, so the daily leaderboard (score, then guesses,
        // then time) resolves ties by fewest guesses and then fastest finish.
        body: JSON.stringify({ quizId: PUZZLE.quizId, score, total: 10, correct: g2.status === 'won' ? 1 : 0, guessesUsed: g2.guesses.length, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
      })
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
        .catch(() => {});
    } catch (e) {}
  }

  // The Start gate. The moment is covered until this fires, and the clock starts
  // HERE rather than on the first guess — so time spent looking the answer up is
  // time on the board, which is what makes the gate worth having.
  function startGame() {
    if (!idle) return;
    setG({ ...g, started: true, t0: Date.now() });
    if (!mobileUi) setTimeout(() => { try { inputRef.current && inputRef.current.focus(); } catch (e) {} }, 0);
  }

  function submitGuess() {
    if (!playing) return;
    const y = parseInt(val, 10);
    if (!Number.isInteger(y) || String(val).trim().length < 3 || y < YR_MIN || y > yrMax) {
      say(`Enter a year between ${YR_MIN} and ${yrMax}.`);
      return;
    }
    if (guesses.includes(y)) { say(`You already tried ${y}.`); return; }
    if (bounds.lo != null && y <= bounds.lo) { say(`You know it's after ${bounds.lo}.`); return; }
    if (bounds.hi != null && y >= bounds.hi) { say(`You know it's before ${bounds.hi}.`); return; }
    const g2 = { ...g, guesses: [...guesses, y] };
    if (!g2.t0) g2.t0 = Date.now();
    setVal('');
    const diff = Math.abs(y - YEAR);
    if (diff <= SNAP) {
      g2.status = 'won';
      g2.tEnd = Date.now();
      postResult(g2, Math.max(1, (diff === 0 ? 11 : 10) - g2.guesses.length));
      setG(g2);
      setJustWon(true);
      return;
    }
    if (g2.guesses.length >= MAX_GUESSES) {
      g2.status = 'revealed';
      g2.tEnd = Date.now();
      postResult(g2, 0);
      setG(g2);
      return;
    }
    setG(g2);
    if (!mobileUi) { try { inputRef.current && inputRef.current.focus(); } catch (e) {} }
  }

  // one free hint: reveal the century
  const centuryLabel = `the ${Math.floor(YEAR / 100) * 100}s`;
  function useHint() {
    if (!playing || g.hintUsed) return;
    const g2 = { ...g, hintUsed: true };
    if (!g2.t0) g2.t0 = Date.now();
    setG(g2);
    say(`Hint: it happened in ${centuryLabel}.`);
  }

  function revealEnd() {
    const g2 = { ...g, status: 'revealed', tEnd: Date.now() };
    if (!g2.t0) g2.t0 = Date.now();
    postResult(g2, 0);
    setG(g2);
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    setG(freshState()); setVal(''); setJustWon(false); setEndClosed(false);
  }

  function rowFor(y, i) {
    const isWin = g.status !== 'playing' && i === guesses.length - 1 && Math.abs(y - YEAR) <= SNAP;
    const diff = Math.abs(y - YEAR);
    if (isWin) {
      return { win: true, exact: diff === 0, label: diff === 0 ? 'dead on!' : `circa — ${diff} year${diff === 1 ? '' : 's'} off`, color: '#166534', bg: COLORS.greenSoft, border: 'rgba(21,128,61,0.5)' };
    }
    const b = bandOf(diff);
    return { win: false, later: y < YEAR, label: b.label, color: b.color, bg: b.bg, border: b.border };
  }

  function shareText() {
    const squares = guesses.map((y, i) => {
      const diff = Math.abs(y - YEAR);
      if (g.status === 'won' && i === guesses.length - 1) return '\u{1F7E9}';
      return bandOf(diff).sq;
    }).join('');
    const hintBit = g.hintUsed ? ' · \u{1F4A1}' : '';
    const streakBit = isTodays && myStats.cur >= 2 ? ` · streak ${myStats.cur}` : '';
    const head2 = won
      ? `Circa #${PUZZLE.num} · ${exact ? 'dead on' : 'circa'} in ${guesses.length}/${MAX_GUESSES}${hintBit}${streakBit}`
      : `Circa #${PUZZLE.num} · stumped${hintBit}`;
    return `${head2}\n${squares}\n${shareUrl()}`;
  }
  function shareUrl() {
    return withRef(`sourceoftruths.com/circa${isTodays ? '' : `?p=${PUZZLE.num}`}`);
  }
  function copyShare() {
    const text = playing
      ? `Circa #${PUZZLE.num} — the daily year hunt from Source of Truths.\n${shareUrl()}`
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

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', position: 'relative' }}>
      <Grain />
      <div className="cc-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.cc-wrap{padding-left:12px !important;padding-right:12px !important;}}
          .cc-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.ink};background:#fff;color:${COLORS.ink};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .cc-btn:hover{background:${COLORS.paper};}
          @keyframes ccfade{from{opacity:0;}}
          @keyframes ccstamp{from{opacity:0;transform:scale(.94);}}
          @keyframes ccrow{from{opacity:0;transform:translateY(-4px);}}
          @media(max-width:560px){.cc-ttl{flex-direction:column;align-items:flex-start;gap:1px;}.cc-ttl h1{font-size:21px;letter-spacing:0.02em;}.cc-ttl .cc-ttl-dt{font-size:15px;}.cc-ttl-dot{display:none;}}
          .cc-inp{font-family:${MONO};font-weight:500;font-size:30px;letter-spacing:0.14em;text-align:center;width:150px;border:2px solid ${COLORS.ink};border-radius:9px;padding:9px 6px;background:#fff;color:${COLORS.ink};outline:none;}
          .cc-inp:focus{border-color:${COLORS.accent};box-shadow:0 0 0 3px rgba(14,116,144,0.18);}
          .cc-go{font-family:${SANS};font-weight:800;font-size:15px;letter-spacing:0.04em;text-transform:uppercase;border:2px solid ${COLORS.accent};background:${COLORS.accent};color:#fff;border-radius:9px;padding:0 22px;cursor:pointer;height:58px;}
          .cc-go:active{transform:translateY(1px);}
          .cc-tool{font-family:${SANS};font-weight:800;font-size:12.5px;border:1.5px solid rgba(28,30,36,0.35);background:#fff;color:${COLORS.ink};border-radius:8px;padding:7px 11px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;}
          @media(max-width:400px){.cc-inp{width:124px;font-size:26px;}.cc-go{padding:0 16px;}}
        `}</style>

        <div style={{ maxWidth: 620, margin: '0 auto' }}>

        {/* puzzle-native top strip: quiet nav + player chip (hidden in focus mode while playing) */}
        <div style={{ display: 'block' }}><DailyTopNav player={player} compact={playing} /></div>

        {/* masthead: pressed CIRCA tiles with No./date inline */}
        <DailyMasthead
          slug="circa"
          num={PUZZLE.num}
          dateLabel={PUZZLE.dateLabel}
          accent={COLORS.accent}
          blockGap={5}
          helpTop={13}
          marginBottom={16}
          onHelp={() => setShowHelp(true)}
          sunday={PUZZLE.sunday && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: '#fff', background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>Sunday Edition &middot; Tricky</span>}
          blocks={'CIRCA'.split('').map((ch, i) => (
              <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 26, background: i === 4 ? COLORS.accent : COLORS.ink, color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
            ))}
        />

        {gameRetired && (
          <div style={{ background: '#fff7ed', border: '1.5px solid rgba(180,83,9,0.4)', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: COLORS.ink, lineHeight: 1.5 }}>
            Circa has retired &mdash; this archive stays playable, but no new moments drop.{' '}
            Meet its successor: <a href="/outrank" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Outrank, the daily crowd-ranking puzzle &rarr;</a>
          </div>
        )}

        {/* the moment */}
        <div style={{ background: '#fff', border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '15px 17px 17px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, borderBottom: '1px solid rgba(28,30,36,0.18)', paddingBottom: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ whiteSpace: 'nowrap' }}>what year was this?</span>
            <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>guess <b style={{ color: COLORS.ink, fontWeight: 500 }}>{Math.min(guesses.length + (playing ? 1 : 0), MAX_GUESSES)}</b>/{MAX_GUESSES}</span>
          </div>

          {idle ? (
            <div style={{ margin: '2px 0 4px' }}>
              <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '5px 0 3px', userSelect: 'none' }}>
                <div style={{ height: 18, borderRadius: 5, background: 'rgba(28,30,36,0.12)', width: '94%' }} />
                <div style={{ height: 18, borderRadius: 5, background: 'rgba(28,30,36,0.12)', width: '56%' }} />
              </div>
              <button className="cc-go" onClick={startGame} style={{ width: '100%', marginTop: 16 }}>Start</button>
              <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: COLORS.faded, marginTop: 9, textAlign: 'center' }}>
                Today&rsquo;s moment appears when you start.
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: SANS, fontSize: 24, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink, lineHeight: 1.25, margin: '2px 0 4px' }}>
              {PUZZLE.title}
            </div>
          )}
          {g.hintUsed && playing && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: SANS, fontSize: 12.5, fontWeight: 800, color: '#9a3d0c', background: '#fff7ed', border: '1.5px solid rgba(234,88,12,0.4)', borderRadius: 7, padding: '4px 10px', marginTop: 6 }}>
              <Lightbulb size={13} /> It happened in {centuryLabel}.
            </div>
          )}

          {/* input row */}
          {playing && !idle && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', gap: 9, alignItems: 'stretch' }}>
                <input
                  ref={inputRef}
                  className="cc-inp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  placeholder="Year"
                  value={val}
                  autoFocus={!mobileUi}
                  onChange={(e) => setVal(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitGuess(); }}
                  aria-label="Your year guess"
                />
                <button className="cc-go" onClick={submitGuess}>Guess</button>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: COLORS.faded, marginTop: 8 }}>
                {bounds.lo != null || bounds.hi != null ? (
                  <>Narrowed to <b style={{ color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{bounds.lo != null ? bounds.lo + 1 : YR_MIN}&ndash;{bounds.hi != null ? bounds.hi - 1 : yrMax}</b> &middot; within {SNAP} years counts</>
                ) : (
                  <>Any year from {YR_MIN} to {yrMax} &middot; within {SNAP} years counts as circa</>
                )}
              </div>
            </div>
          )}

          {/* guess history */}
          {guesses.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14 }}>
              {guesses.map((y, i) => {
                const r = rowFor(y, i);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: r.bg, border: `1.5px solid ${r.border}`, borderRadius: 9, padding: '8px 12px', animation: i === guesses.length - 1 ? 'ccrow .25s ease' : undefined }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: COLORS.faded, width: 14, flex: '0 0 auto' }}>{i + 1}</span>
                    <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 500, color: COLORS.ink, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.06em', flex: '0 0 auto' }}>{y}</span>
                    <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: SANS, fontSize: 12.5, fontWeight: 800, color: r.color, textAlign: 'right' }}>
                      {r.win ? <Target size={14} strokeWidth={2.5} /> : (r.later ? <ArrowUp size={14} strokeWidth={2.5} /> : <ArrowDown size={14} strokeWidth={2.5} />)}
                      {r.win ? r.label : <>{r.later ? 'later' : 'earlier'} &middot; {r.label}</>}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* tools */}
          {playing && !idle && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 13, flexWrap: 'wrap' }}>
              {!identity && !g.hintUsed && (
                <button className="cc-tool" onClick={useHint} title="Reveal the century (one hint per day)" style={{ background: COLORS.accentSoft, borderColor: 'rgba(14,116,144,0.5)', color: '#155e70' }}>
                  <Lightbulb size={14} /> Hint: the century
                </button>
              )}
              {identity && guesses.length > 0 && (
                <button onClick={() => { if (armReveal) { setArmReveal(false); revealEnd(); } else { setArmReveal(true); } }}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS, fontWeight: 700, fontSize: 12, color: armReveal ? COLORS.rust : COLORS.faded, textDecoration: 'underline', textUnderlineOffset: 3, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Eye size={13} /> {armReveal ? 'Tap again — ends the puzzle and shows the year' : 'Reveal & end'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* result */}
        {!playing && (
          <>
            <div style={{ maxWidth: 472, margin: '0 auto 12px' }}>
              {/* the answer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: PAPER, border: '1.5px solid rgba(28,30,36,0.18)', borderRadius: 10, padding: '12px 14px' }}>
                <span style={{ fontFamily: MONO, fontSize: 32, fontWeight: 500, color: won ? COLORS.green : COLORS.ink, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em', flex: '0 0 auto' }}>{YEAR}</span>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.ink, lineHeight: 1.45 }}>
                  {PUZZLE.title}. <span style={{ color: COLORS.faded, fontWeight: 600 }}>{PUZZLE.d}</span>
                </span>
              </div>
              {PUZZLE.sunday && (
                <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.faded, fontStyle: 'italic', margin: '8px 0 0' }}>The Sunday Edition — a trickier moment to place.</div>
              )}
            </div>
            <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
              {isTodays ? (
                <>
                  Circa has retired &mdash; this was its final moment. Every past puzzle stays playable in{' '}
                  <a href="/daily" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>the archive</a>.
                  {' '}Meet its successor:{' '}
                  <a href="/outrank" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Outrank, the daily crowd-ranking puzzle &rarr;</a>
                </>
              ) : (
                <>
                  You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                  <a href="/circa" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s Circa &rarr;</a>
                  {' · '}
                  <a href="/daily" style={{ color: COLORS.faded, fontWeight: 700, textDecoration: 'underline' }}>All daily puzzles</a>
                </>
              )}
            </p>
          </>
        )}

        {focusMode && (
          <div style={{ maxWidth: 620, margin: '30px auto 0', textAlign: 'center' }}>
            <button onClick={() => setShowChrome(true)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: '0.03em', color: COLORS.ink, background: 'none', border: '1.5px solid rgba(28,30,36,0.28)', borderRadius: 9, padding: '10px 20px', cursor: 'pointer' }}>Show leaderboard &amp; more</button>
            <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.faded, fontWeight: 600, marginTop: 8 }}>Other puzzles, challenge, share &amp; leaderboard</div>
          </div>
        )}
        {/* standard quiz-page bottom: challenge + stats + join + leaderboard */}
        <div style={{ display: focusMode ? 'none' : 'block', margin: '30px auto 0' }}>
          <DailyGamesGrid replay={!playing ? resetGame : null}
            self="circa"
            maxWidth={620}
            challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`}
            share={{ label: copied ? 'Copied' : 'Share', onClick: copyShare }}
            light
            boardSlot={<DailyBoardPanel self="circa" quizId={PUZZLE.quizId} maxWidth={620} streak={{ current: myStats.cur, best: myStats.max }} />}
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
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Circa to your Home Screen</div>
              {isIosDevice() ? (
                <ol style={{ margin: '0 0 4px', paddingLeft: 20, color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  <li>Tap the <b>Share</b> button in Safari&apos;s toolbar.</li>
                  <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                  <li>Tap <b>Add</b> &mdash; the tile opens today&apos;s moment, every day.</li>
                </ol>
              ) : (
                <p style={{ margin: '0 0 4px', color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  Open your browser&apos;s menu and choose <b>Add to Home Screen</b> (or <b>Install app</b>). The tile opens today&apos;s moment, every day.
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

        {/* Personal stats wiring (myStats) is retained for the share string and
            streak logic; the on-page "Your stats" tile row is no longer shown.
            The daily leaderboard now renders in DailyGamesGrid's boardSlot,
            directly under the Challenge / Share actions (owner, 2026-07-23). */}
      </div>

      {/* the end-of-puzzle popup: the shared DailyEndCard as a dismissible modal (win or loss) */}
      {!playing && !endClosed && (
        <DailyEndCard
          modal
          self="circa"
          won={won}
          headline={<>You scored {Math.round((finalScore / 10) * 100)}%</>}
          subline={won
            ? <>{finalScore}/10 &middot; {exact ? 'dead on' : 'circa'} in {guesses.length} guess{guesses.length === 1 ? '' : 'es'} &middot; {elapsed}{g.hintUsed ? <> &middot; 1 hint</> : null}</>
            : <>0/10 &middot; out of guesses</>}
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
              <p style={{ margin: '0 0 9px' }}>One historical moment a day. <b>Guess the year</b> it happened &mdash; any year from {YR_MIN} to today &mdash; in six tries. The moment stays covered until you press <b>Start</b>.</p>
              <p style={{ margin: '0 0 9px' }}>Every miss tells you two things: whether the real year is <b>earlier or later</b> than your guess, and how close you are &mdash; from <b style={{ color: '#475569' }}>cold</b> (200+ years off) through <b style={{ color: '#0a1730' }}>cool</b> and <b style={{ color: '#92610b' }}>warm</b> to <b style={{ color: '#9a3d0c' }}>hot</b> (within 10).</p>
              <p style={{ margin: '0 0 9px' }}>Land <b>within {SNAP} years</b> and you&rsquo;ve placed it &mdash; that&rsquo;s circa, and it counts. Hitting the <b>exact year</b> is a dead-on finish. One free <b>hint</b> reveals the century.</p>
              <p style={{ margin: 0 }}>A dead-on first guess scores a perfect 10; every extra guess costs a point (a circa finish costs one more). Ties break on fewest guesses, then fastest time. Sundays bring a trickier moment.</p>
            </div>
            <button className="cc-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: '#fff' }}>Play</button>
          </div>
        </div>
      )}

      {/* About Circa — crawlable prose for search, server-rendered into the HTML */}
      <section style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2, maxWidth: 620, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Circa</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Circa is a free daily history puzzle from Source of Truths &mdash; the daily year hunt. Each day serves up one famous moment from the last thousand years: a battle, a disaster, a discovery, a first. Your job is to pin down the exact year it happened, in six guesses or fewer.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Every guess plays hot and cold: an arrow tells you whether the true year is earlier or later, and a heat band tells you how close you are. Get within three years and the moment is placed &mdash; that&rsquo;s circa, and it counts as a win. Know it cold and name the exact year on your first try for a perfect score.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new moment drops every day at midnight Eastern, with a trickier one on Sundays. No app, no signup &mdash; play free in your browser, keep a streak, and race the daily leaderboard. More dailies: <a href="/dating" style={{ color: COLORS.ink, fontWeight: 800 }}>Dating</a>, our history-ordering puzzle, <a href="/crux" style={{ color: COLORS.ink, fontWeight: 800 }}>Crux</a>, our clueless crossword, and <a href="/span" style={{ color: COLORS.ink, fontWeight: 800 }}>Span</a>, our geography puzzle.
        </p>
      </section>

      <div style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2 }}><Footer /></div>
    </div>
  );
}

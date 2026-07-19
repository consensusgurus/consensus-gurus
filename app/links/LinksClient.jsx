'use client';

// Links — sixteen words, four hidden threads.
//
// A 4x4 grid of sixteen words hides four groups of four. Select four tiles
// and submit: a right guess banks the group as a colored bar (yellow, green,
// blue, red — easiest to trickiest), a wrong guess costs one of four
// mistakes. "One away" is the only mercy shown. Solve all four before the
// mistakes run out.
//
// Same daily plumbing as Crux: banked puzzles gated by Eastern date on the
// server (app/links/page.js), per-puzzle localStorage saves, /links?p=N
// archive pinning, streaks + stats, and the shared /api/quiz/* board flow.

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, Share2, RotateCcw, X, Shuffle, Swords, Smartphone } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import DailyGamesPromo from '../DailyGamesPromo';
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
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const PAPER = '#fbf9f4';

// Category palette, easiest -> trickiest: yellow, green, blue, RED — the
// house quartet (same as Crux).
const CAT_COLORS = [
  { bg: '#e6b93f', tc: '#5c4a06', sq: '\u{1F7E8}' },
  { bg: '#5aa96a', tc: '#173f1f', sq: '\u{1F7E9}' },
  { bg: '#5a97dd', tc: '#0c3a66', sq: '\u{1F7E6}' },
  { bg: '#d96363', tc: '#571212', sq: '\u{1F7E5}' },
];
const MAX_MISTAKES = 4;
const HELP_KEY = 'sot_links_help_seen';
const STATS_KEY = 'sot_links_stats';

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

// ─── Personal stats + streak (localStorage), Crux pattern ──────────────────
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
    const sc = Math.max(0, Math.min(8, Math.round(((m.scorePct || 0) / 100) * 8)));
    if (!changed) { rec = { ...rec }; changed = true; }
    rec[p.num] = { s: sc, t: 8, g: null, won: !!m.perfect };
  }
  if (!changed) return s;
  const s2 = { ...s, rec };
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s2)); } catch (e) {}
  return s2;
}

// The INITIAL deal must be seeded by puzzle number: freshState runs during
// SSR and again on the client, and a Math.random layout would mismatch on
// hydration (it would also leak the answer if left unshuffled — the canonical
// order lists the groups row by row). Same seed -> same board for everyone.
function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffled(arr, rng = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function freshState(puzzle) {
  return {
    v: 1,
    order: shuffled(puzzle.groups.flatMap((g) => g.words), mulberry32(puzzle.num * 2654435761)), // tile layout
    solved: [],        // group indices in solve order
    tries: [],         // each submit: [{w, ci}, x4] — the share grid
    mistakes: 0,
    status: 'playing', // playing | won | lost
    t0: null,
    tEnd: null,
  };
}

export default function LinksClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const STORE_KEY = `sot_links_${PUZZLE.num}`;
  const wordCat = useMemo(() => {
    const m = {};
    PUZZLE.groups.forEach((g, ci) => g.words.forEach((w) => { m[w] = ci; }));
    return m;
  }, [PUZZLE]);
  const [g, setG] = useState(() => freshState(PUZZLE));
  const [selWords, setSelWords] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [shakeIds, setShakeIds] = useState(null);
  const [justSolved, setJustSolved] = useState(null); // ci of the group animating in
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
        if (saved && saved.v === 1 && Array.isArray(saved.order) && saved.order.length === 16) setG({ ...freshState(PUZZLE), ...saved });
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
    // same-device day breadcrumb for cross-game recommendations — only for
    // TODAY'S puzzle (archive replays must not mark today as played)
    try {
      if (PUZZLE.num === pickPuzzle(puzzles, null).num) {
        localStorage.setItem('sot_links_day', JSON.stringify({ d: etToday(), done: g.status !== 'playing' }));
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
    toastTimer.current = setTimeout(() => setToast(null), 2100);
  }

  const [showChrome, setShowChrome] = useState(false);
  const playing = g.status === 'playing';
  const focusMode = playing && !showChrome;
  const won = g.status === 'won';
  const lost = g.status === 'lost';
  const solvedWords = useMemo(() => new Set(g.solved.flatMap((ci) => PUZZLE.groups[ci].words)), [g.solved, PUZZLE]);
  const gridWords = g.order.filter((w) => !solvedWords.has(w));
  const elapsed = g.t0 ? fmtTime((g.tEnd || Date.now()) - g.t0) : '0:00';
  const isTodays = PUZZLE.num === pickPuzzle(puzzles, null).num;
  const prevPuzzle = puzzles.find((x) => x.num === PUZZLE.num - 1) || null;
  const myStats = deriveStats(stats, pickPuzzle(puzzles, null).num);

  const REC_KEY = `sot_links_rec_${PUZZLE.num}`;
  const abandon = useAbandonFlush(() => {
    if (!g.t0 || g.status !== 'playing') return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - g.t0) / 1000)));
    try { localStorage.setItem(REC_KEY, '1'); } catch (e) {}
    return { quizId: PUZZLE.quizId, score: 0, total: 8, correct: 0, guessesUsed: 0, timeElapsed: el, abandoned: true, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') };
  });

  function postResult(g2) {
    abandon.markFlushed();
    const sc = g2.solved.length * 2;
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    try { setStats(recordStat(PUZZLE.num, { s: sc, t: 8, g: g2.mistakes, won: g2.solved.length === 4 && g2.mistakes === 0 })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: PUZZLE.quizId, score: sc, total: 8, correct: g2.solved.length, guessesUsed: g2.mistakes, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
      })
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
        .catch(() => {});
    } catch (e) {}
  }

  function toggle(w) {
    if (!playing) return;
    setSelWords((cur) => (cur.includes(w) ? cur.filter((x) => x !== w) : cur.length < 4 ? [...cur, w] : cur));
  }

  function submit() {
    if (!playing || selWords.length !== 4) return;
    // duplicate-guess mercy: an already-tried set costs nothing
    const key = [...selWords].sort().join('|');
    if (g.tries.some((t) => t.map((x) => x.w).sort().join('|') === key)) { say('Already tried that four'); return; }
    const g2 = { ...g };
    if (!g2.t0) g2.t0 = Date.now();
    const row = selWords.map((w) => ({ w, ci: wordCat[w] }));
    g2.tries = [...g.tries, row];
    const cats = new Set(row.map((x) => x.ci));
    if (cats.size === 1) {
      const ci = row[0].ci;
      g2.solved = [...g.solved, ci];
      setSelWords([]);
      setJustSolved(ci);
      setTimeout(() => setJustSolved(null), 900);
      if (g2.solved.length === 4) {
        g2.status = 'won';
        g2.tEnd = Date.now();
        postResult(g2);
        setJustWon(true);
      } else {
        say(`${PUZZLE.groups[ci].name} — banked.`);
      }
    } else {
      g2.mistakes = g.mistakes + 1;
      setShakeIds(new Set(selWords));
      setTimeout(() => setShakeIds(null), 500);
      const counts = {};
      row.forEach((x) => { counts[x.ci] = (counts[x.ci] || 0) + 1; });
      const oneAway = Object.values(counts).some((n) => n === 3);
      if (g2.mistakes >= MAX_MISTAKES) {
        g2.status = 'lost';
        g2.tEnd = Date.now();
        setSelWords([]);
        postResult(g2);
      } else {
        say(oneAway ? 'One away…' : 'Not a thread.');
      }
    }
    setG(g2);
  }

  function doShuffle() {
    if (!playing) return;
    setG({ ...g, order: shuffled(g.order) });
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    setG(freshState(PUZZLE)); setSelWords([]); setJustWon(false); setEndClosed(false);
  }

  // groups to reveal at the bottom on a loss (unsolved ones, in color order)
  const unsolvedCis = PUZZLE.groups.map((_, ci) => ci).filter((ci) => !g.solved.includes(ci));

  // Share of players this run beat, from the exact score distribution.
  const beatPct = (() => {
    if (g.status === 'playing') return null;
    const dist = board.scoreDist;
    if (!dist) return null;
    const my = g.solved.length * 2;
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

  function shareText() {
    const rows = g.tries.map((t) => t.map((x) => CAT_COLORS[x.ci].sq).join('')).join('\n');
    const mBit = `${g.mistakes} mistake${g.mistakes === 1 ? '' : 's'}`;
    const streakBit = isTodays && myStats.cur >= 2 ? ` · streak ${myStats.cur}` : '';
    const head = `Links #${PUZZLE.num} · ${g.solved.length}/4 · ${mBit} · ${elapsed}${streakBit}`;
    return `${head}\n${rows}\n${shareUrl()}`;
  }
  function shareUrl() {
    return `sourceoftruths.com/links${isTodays ? '' : `?p=${PUZZLE.num}`}`;
  }
  function copyShare() {
    const text = playing
      ? `Links #${PUZZLE.num} — sixteen words, four hidden threads. Can you untangle them?\n${shareUrl()}`
      : shareText();
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

  function tileFont(w) {
    if (w.length >= 11) return 11;
    if (w.length >= 9) return 12.5;
    if (w.length >= 7) return 14;
    return 15.5;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', position: 'relative' }}>
      <Grain />
      <div className="lk-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.lk-wrap{padding-left:14px !important;padding-right:14px !important;}}
          .lk-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.ink};background:#fff;color:${COLORS.ink};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .lk-btn:hover{background:${COLORS.paper};}
          .lk-tile{font-family:${SANS};font-weight:800;border-radius:8px;cursor:pointer;border:1.5px solid rgba(28,30,36,0.42);background:#fff;color:${COLORS.ink};display:flex;align-items:center;justify-content:center;text-align:center;padding:4px 3px;min-height:58px;user-select:none;touch-action:manipulation;transition:background .1s,transform .1s;box-shadow:inset 0 1px 2px rgba(28,30,36,0.07);overflow:hidden;}
          .lk-tile:active{transform:scale(0.96);}
          .lk-tile.on{background:${COLORS.ink};color:#fff;border-color:${COLORS.ink};box-shadow:inset 0 2px 4px rgba(0,0,0,0.5);}
          @keyframes lkshake{0%,100%{transform:translateX(0);}20%,60%{transform:translateX(-4px);}40%,80%{transform:translateX(4px);}}
          .lk-tile.shake{animation:lkshake .45s ease;}
          @keyframes lkbank{from{opacity:0;transform:scale(.9);}}
          .lk-bank{animation:lkbank .5s ease backwards;}
          @keyframes lkfade{from{opacity:0;}}
          @keyframes lkstamp{from{opacity:0;transform:scale(.94);}}
          @media(max-width:520px){.lk-htp-f{display:none;}.lk-htp-s{display:inline;}}
          @media(max-width:560px){.lk-ttl{flex-direction:column;align-items:flex-start;gap:1px;}.lk-ttl h1{font-size:21px;letter-spacing:0.02em;}.lk-ttl .lk-ttl-dt{font-size:15px;}.lk-ttl-dot{display:none;}}
          .lk-htp-s{display:none;}
        `}</style>

        <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* game-native top strip (Crux pattern): quiet nav + player chip */}
        <div style={{ display: 'block' }}><DailyTopNav player={player} compact={playing} /></div>

        {/* masthead: pressed LINKS tiles with No./date inline, one rule beneath */}
        <div className="lk-mh" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', position: 'relative', paddingRight: 28, marginBottom: 16, borderBottom: '2px solid rgba(28,30,36,0.8)', paddingBottom: 11 }}>
          <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end' }}>
            {'LINKS'.split('').map((ch, i) => (
              <div key={i} style={{ width: 46, height: 46, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 28, background: i === 0 ? COLORS.ink : CAT_COLORS[i - 1].bg, color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
            ))}
          </div>
          <div className="lk-ttl" style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
            <h1 style={{ margin: 0, fontFamily: MONO, fontSize: 14, letterSpacing: '0.06em', fontWeight: 500, color: COLORS.ink }}>No. {PUZZLE.num}</h1>
            <span className="lk-ttl-dot" style={{ color: COLORS.faded }}>&middot;</span>
            <span className="lk-ttl-dt" style={{ fontFamily: SANS, fontStyle: 'italic', fontSize: 15, color: COLORS.faded }}>{PUZZLE.dateLabel}</span>
          </div>
          <button onClick={() => setShowHelp(true)} aria-label="How to play" title="How to play" style={{ position: 'absolute', top: 13, right: 2, background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded, padding: 0, display: 'flex' }}>
            <HelpCircle size={20} />
          </button>
        </div>

        {/* banked groups */}
        {g.solved.map((ci) => {
          const cc = CAT_COLORS[ci];
          return (
            <div key={ci} className={justSolved === ci ? 'lk-bank' : undefined} style={{ background: cc.bg, border: '1.5px solid rgba(28,30,36,0.35)', borderRadius: 10, padding: '10px 14px', marginBottom: 8, textAlign: 'center', boxShadow: '2px 2px 0 rgba(28,30,36,0.10)' }}>
              <div style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '.04em', color: cc.tc }}>{PUZZLE.groups[ci].name}</div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: cc.tc, marginTop: 2 }}>{PUZZLE.groups[ci].words.join(', ')}</div>
            </div>
          );
        })}

        {/* the grid */}
        {gridWords.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7, marginBottom: 12 }}>
            {gridWords.map((w) => (
              <button key={w} onClick={() => toggle(w)}
                className={`lk-tile${selWords.includes(w) ? ' on' : ''}${shakeIds && shakeIds.has(w) ? ' shake' : ''}`}
                style={{ fontSize: tileFont(w), letterSpacing: w.length >= 9 ? '-0.02em' : 0 }}>
                {w}
              </button>
            ))}
          </div>
        )}

        {/* loss reveal: the threads you missed */}
        {lost && unsolvedCis.map((ci) => {
          const cc = CAT_COLORS[ci];
          return (
            <div key={ci} style={{ background: '#fff', border: `1.5px dashed ${cc.bg}`, borderRadius: 10, padding: '10px 14px', marginBottom: 8, textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '.04em', color: cc.tc }}>{PUZZLE.groups[ci].name}</div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: COLORS.faded, marginTop: 2 }}>{PUZZLE.groups[ci].words.join(', ')}</div>
            </div>
          );
        })}

        {/* controls + mistake dots */}
        {playing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <button className="lk-btn" onClick={submit} disabled={selWords.length !== 4}
              style={selWords.length === 4 ? { background: COLORS.ember, color: '#fff', borderColor: COLORS.ember } : { opacity: 0.45, cursor: 'default' }}>
              Submit four
            </button>
            <button className="lk-btn" onClick={doShuffle} style={{ borderColor: '#c3c8cf', color: COLORS.faded }}><Shuffle size={14} /> Shuffle</button>
            {selWords.length > 0 && (
              <button className="lk-btn" onClick={() => setSelWords([])} style={{ borderColor: '#c3c8cf', color: COLORS.faded }}>Clear</button>
            )}
            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: MONO, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.faded }}>
              Mistakes
              {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
                <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i < g.mistakes ? COLORS.rust : 'rgba(28,30,36,0.15)' }} />
              ))}
            </span>
          </div>
        )}

        {/* result */}
        {!playing && (
          <>
            {isTodays && myStats.cur >= 2 && (
              <div style={{ fontSize: 13, fontWeight: 800, margin: '12px 0', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ color: '#b45309' }}>{myStats.cur}-day streak</span>
              </div>
            )}
            <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
              {isTodays ? (
                <>
                  {countdown ? <>Next Links in <b style={{ color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{countdown}</b>.</> : 'A new puzzle drops at midnight Eastern.'}
                  {prevPuzzle && (
                    <>
                      {' '}Meanwhile:{' '}
                      <a href={`/links?p=${prevPuzzle.num}`} style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>
                        play yesterday&rsquo;s Links &rarr;
                      </a>
                    </>
                  )}
                </>
              ) : (
                <>
                  You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                  <a href="/links" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s Links &rarr;</a>
                  {' · '}
                  <a href="/daily" style={{ color: COLORS.faded, fontWeight: 700, textDecoration: 'underline' }}>All daily puzzles</a>
                </>
              )}
            </p>
          </>
        )}

        {focusMode && (
          <div style={{ maxWidth: 560, margin: '30px auto 0', textAlign: 'center' }}>
            <button onClick={() => setShowChrome(true)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: '0.03em', color: COLORS.ink, background: 'none', border: '1.5px solid rgba(28,30,36,0.28)', borderRadius: 9, padding: '10px 20px', cursor: 'pointer' }}>Show leaderboard &amp; more</button>
            <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.faded, fontWeight: 600, marginTop: 8 }}>Other games, challenge, share &amp; leaderboard</div>
          </div>
        )}
        {/* standard quiz-page bottom: challenge + stats + join + leaderboard */}
        <div style={{ display: focusMode ? 'none' : 'block', margin: '30px auto 0' }}>
          <DailyGamesGrid
            self="links"
            maxWidth={560}
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
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Links to your Home Screen</div>
              {isIosDevice() ? (
                <ol style={{ margin: '0 0 4px', paddingLeft: 20, color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  <li>Tap the <b>Share</b> button in Safari&apos;s toolbar.</li>
                  <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                  <li>Tap <b>Add</b> &mdash; the four-color tile opens today&apos;s puzzle, every day.</li>
                </ol>
              ) : (
                <p style={{ margin: '0 0 4px', color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  Open your browser&apos;s menu and choose <b>Add to Home Screen</b> (or <b>Install app</b>). The four-color tile opens today&apos;s puzzle, every day.
                </p>
              )}
              <button onClick={() => setShowA2hsHelp(false)} style={{ marginTop: 10, fontFamily: SANS, fontSize: 12.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700, height: 44, width: '100%', borderRadius: 10, border: 'none', background: COLORS.ink, color: '#fff', cursor: 'pointer' }}>Got it</button>
            </div>
          </div>
        )}
        {!focusMode && !identity && (
          <div style={{ margin: '18px auto 0' }}>
            <JoinLeaderboardForm hideIcon heading="See your stats and join the leaderboard" identity={identity} onJoined={(id) => { setIdentity(id); if (id && id.username) setPlayer((p) => p || { name: id.username, rank: null }); }} />
          </div>
        )}
        </div>

        {/* your stats — sits directly above the leaderboard */}
        {!focusMode && identity && (
        <div style={{ maxWidth: 560, margin: '20px auto 0' }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.faded, marginBottom: 9 }}>Your stats</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { n: myStats.cur, l: 'Streak' },
              { n: myStats.played, l: 'Played' },
              { n: myStats.played ? `${Math.round((myStats.perfect / myStats.played) * 100)}%` : '—', l: 'Clean' },
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
        <div id="daily-leaderboard" style={{ display: focusMode ? 'none' : 'block', maxWidth: 560, margin: '26px auto 0', background: '#fff', border: '1.5px solid rgba(20,22,28,0.12)', borderRadius: 12, padding: '14px 16px' }}>
          <DailyCombinedLeaderboard todayKey="links" identity={identity} quizId={PUZZLE.quizId} />
        </div>
      </div>

      {/* the end-of-game popup: the shared DailyEndCard as a dismissible modal (win or loss) */}
      {!playing && !endClosed && (
        <DailyEndCard
          modal
          self="links"
          won={won}
          headline={<>You scored {Math.round((g.solved.length / 4) * 100)}%</>}
          subline={<>{g.solved.length}/4 groups &middot; {g.mistakes} mistake{g.mistakes === 1 ? '' : 's'} &middot; {elapsed}</>}
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
              <p style={{ margin: '0 0 9px' }}><b>Sixteen words hide four threads</b> of four &mdash; a shared category each. Tap four words, then <b>Submit</b>.</p>
              <p style={{ margin: '0 0 9px' }}>Right: the thread banks in its color, <span style={{ background: CAT_COLORS[0].bg, color: CAT_COLORS[0].tc, borderRadius: 4, padding: '1px 6px', fontWeight: 800 }}>yellow</span> easiest to <span style={{ background: CAT_COLORS[3].bg, color: '#fff', borderRadius: 4, padding: '1px 6px', fontWeight: 800 }}>red</span> trickiest. Wrong: one of your <b>four mistakes</b> is gone &mdash; &ldquo;one away&rdquo; is the only hint you get.</p>
              <p style={{ margin: 0 }}>The words that look like they belong together usually don&apos;t. That&apos;s the game.</p>
            </div>
            <button className="lk-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: '#fff' }}>Play</button>
          </div>
        </div>
      )}

      {/* About Links — crawlable prose for search, server-rendered into the initial HTML */}
      <section style={{ position: 'relative', display: focusMode ? 'none' : 'block', zIndex: 2, maxWidth: 560, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Links</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Links is a free daily word grouping game from Source of Truths. Sixteen words hide four threads of four &mdash; find each thread and bank it in its color, from the easy yellow group to the devious red one. Four mistakes and the board wins.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          The trick is the overlap: every puzzle plants words that look like they belong to one thread but pay off in another. Count carefully, eliminate boldly, and save the coin-flips for last. A &ldquo;one away&rdquo; nudge is the only mercy.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new Links arrives every day at midnight Eastern. No app, no signup &mdash; play free in your browser, keep a streak, and compare your grid on the daily leaderboard. More dailies: <a href="/crux" style={{ color: COLORS.ink, fontWeight: 800 }}>Crux</a>, our clueless crossword, <a href="/garble" style={{ color: COLORS.ink, fontWeight: 800 }}>Garble</a>, our word scramble, and <a href="/span" style={{ color: COLORS.ink, fontWeight: 800 }}>Span</a>, our border-hopping geography game.
        </p>
      </section>

      <div style={{ position: 'relative', zIndex: 2, display: focusMode ? 'none' : 'block' }}><Footer /></div>
    </div>
  );
}

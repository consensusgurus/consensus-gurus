'use client';

// Ping — the daily city hunt.
//
// One secret world city a day, no clues. Type any well-known city and each
// guess pings back two things: the great-circle distance in miles to the secret
// city, and a compass arrow pointing the way there. Keep guessing — there's no
// limit — and home in until you land on the exact city. Your score is how few
// guesses it took (a first-guess hit is a perfect 10; every extra guess trims a
// point, floor of 1 once you finally find it). Ties on the daily board break by
// fewest guesses, then fastest time. One free hint reveals the continent.
//
// Same daily plumbing as Circa/Span: banked cities gated by Eastern date on the
// server (app/ping/page.js), per-puzzle localStorage saves, /ping?p=N archive
// pinning, streaks + stats, and the shared /api/quiz/* board flow. Sundays hide
// a trickier, more out-of-the-way city. The full guessable atlas lives in
// lib/ping-cities.js; only TODAY's answer city ships to the browser.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, X, Lightbulb, Eye, Smartphone, ArrowUp, MapPin, Search } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import useDuelContext, { DuelBanner } from '../quiz/[id]/useDuelContext';
import JoinLeaderboardForm from '../quiz/[id]/JoinLeaderboardForm';
import DailyGamesGrid from '../DailyGamesGrid';
import DailyEndCard from '../DailyEndCard';
import DailyTopNav from '../DailyTopNav';
import DailyCombinedLeaderboard from '../quiz/[id]/DailyCombinedLeaderboard';
import { isMobileDevice } from '@/lib/is-mobile';
import { CITIES, findCity, suggestCities, haversineMiles, bearingDeg, compass8, continentOf, normCity } from '@/lib/ping-cities';

const COLORS = {
  cream: '#f7f8fa',
  paper: '#eceef1',
  ink: '#1c1e24',
  ember: '#0e1d40',
  rust: '#c0392b',
  faded: '#6b7280',
  accent: '#0284c7',       // Ping identity — signal/ocean azure
  accentSoft: '#e0f2fe',
  accentDeep: '#075985',
  green: '#15803d',        // found it
  greenSoft: '#eefaf1',
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const PAPER = '#fbf9f4';
const HELP_KEY = 'sot_ping_help_seen';
const STATS_KEY = 'sot_ping_stats';

// heat bands by distance in miles (after the win check at dist === 0)
const BANDS = [
  { max: 200, key: 'hot', label: 'within 200 mi', color: '#9a3d0c', bg: '#ffedd5', border: 'rgba(234,88,12,0.55)', sq: '\u{1F7E7}' },
  { max: 750, key: 'warm', label: 'within 750 mi', color: '#92610b', bg: '#fef3c7', border: 'rgba(217,119,6,0.5)', sq: '\u{1F7E8}' },
  { max: 2500, key: 'cool', label: 'within 2,500 mi', color: '#0a1730', bg: '#dbeafe', border: 'rgba(14,29,64,0.45)', sq: '\u{1F7E6}' },
  { max: Infinity, key: 'cold', label: 'over 2,500 mi', color: '#475569', bg: '#e2e8f0', border: 'rgba(71,85,105,0.4)', sq: '⬜' },
];
const bandOf = (mi) => BANDS.find((b) => mi <= b.max);
const fmtMi = (mi) => mi.toLocaleString('en-US');

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

// ─── Personal stats + streak (localStorage), Circa/Suds pattern ─────────────
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
  const solvedNums = nums.filter((n) => rec[n].won);
  const gVals = solvedNums.map((n) => rec[n].g).filter((g) => typeof g === 'number' && g > 0);
  const avg = gVals.length ? Math.round((gVals.reduce((a, b) => a + b, 0) / gVals.length) * 10) / 10 : null;
  let max = 0, run = 0, prev = null;
  for (const n of nums) {
    run = prev != null && n === prev + 1 ? run + 1 : 1;
    if (run > max) max = run;
    prev = n;
  }
  let cur = 0, at = rec[todayNum] ? todayNum : todayNum - 1;
  while (rec[at]) { cur++; at--; }
  return { played, avg, cur, max };
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
    const solved = (m.scorePct || 0) > 0;
    if (!changed) { rec = { ...rec }; changed = true; }
    rec[p.num] = { s: Math.max(0, Math.min(10, Math.round(((m.scorePct || 0) / 100) * 10))), t: 10, g: null, won: solved };
  }
  if (!changed) return s;
  const s2 = { ...s, rec };
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s2)); } catch (e) {}
  return s2;
}

function freshState() {
  return {
    v: 1,
    guesses: [],                // [{ name, country, mi, bearing }] in order
    hintUsed: false,
    status: 'playing',          // playing | won | revealed
    t0: null,
    tEnd: null,
  };
}

export default function PingClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const TARGET = useMemo(
    () => findCity(PUZZLE.city) || { name: PUZZLE.city, country: PUZZLE.country, lat: PUZZLE.lat, lng: PUZZLE.lng },
    [PUZZLE]
  );
  const STORE_KEY = `sot_ping_${PUZZLE.num}`;

  const [g, setG] = useState(freshState);
  const [val, setVal] = useState('');
  const [sugIdx, setSugIdx] = useState(-1);
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
  const focusMode = playing && !showChrome;
  const won = g.status === 'won';
  const guesses = g.guesses;

  // key of the secret city (name|country), for comparing guesses
  const targetKey = `${normCity(TARGET.name)}|${normCity(TARGET.country)}`;
  const guessedKeys = useMemo(() => new Set(guesses.map((x) => `${normCity(x.name)}|${normCity(x.country)}`)), [guesses]);

  // closest miss so far (never the winning guess)
  const closest = useMemo(() => {
    let best = null;
    for (const x of guesses) { if (x.mi > 0 && (best == null || x.mi < best.mi)) best = x; }
    return best;
  }, [guesses]);

  // live autocomplete suggestions (hide already-guessed + the exact-match echo)
  const suggestions = useMemo(() => {
    if (!playing) return [];
    const list = suggestCities(val, 8).filter((c) => !guessedKeys.has(`${normCity(c.name)}|${normCity(c.country)}`));
    // if the field already exactly names a city, don't show a 1-item echo
    if (list.length === 1 && normCity(list[0].name) === normCity(val)) return [];
    return list.slice(0, 6);
  }, [val, playing, guessedKeys]);

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
          setG({ ...freshState(), ...saved });
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
    try {
      if (PUZZLE.num === pickPuzzle(puzzles, null).num) {
        localStorage.setItem('sot_ping_day', JSON.stringify({ d: etToday(), done: g.status !== 'playing' }));
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
  const prevPuzzle = puzzles.find((x) => x.num === PUZZLE.num - 1) || null;
  const myStats = deriveStats(stats, pickPuzzle(puzzles, null).num);
  // score: first-guess hit = 10, each extra guess -1, floor 1 once found
  const scoreFor = (nGuesses) => Math.max(1, 11 - nGuesses);
  const finalScore = won ? scoreFor(guesses.length) : 0;

  function postResult(g2, score) {
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    const solved = g2.status === 'won';
    try { setStats(recordStat(PUZZLE.num, { s: score, t: 10, g: solved ? g2.guesses.length : null, won: solved })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        // guessesUsed = guesses so the daily board (score, then guesses, then
        // time) resolves ties by fewest guesses and then fastest finish.
        body: JSON.stringify({ quizId: PUZZLE.quizId, score, total: 10, correct: solved ? 1 : 0, guessesUsed: g2.guesses.length, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
      })
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
        .catch(() => {});
    } catch (e) {}
  }

  function commitGuess(city) {
    if (!playing || !city) return;
    const key = `${normCity(city.name)}|${normCity(city.country)}`;
    if (guessedKeys.has(key)) { say(`You already guessed ${city.name}.`); return; }
    const mi = haversineMiles(city, TARGET);
    const brng = mi === 0 ? null : Math.round(bearingDeg(city, TARGET));
    const entry = { name: city.name, country: city.country, mi, bearing: brng };
    const g2 = { ...g, guesses: [...guesses, entry] };
    if (!g2.t0) g2.t0 = Date.now();
    setVal('');
    setSugIdx(-1);
    if (key === targetKey || mi === 0) {
      g2.status = 'won';
      g2.tEnd = Date.now();
      postResult(g2, scoreFor(g2.guesses.length));
      setG(g2);
      setJustWon(true);
      return;
    }
    setG(g2);
    if (!mobileUi) { try { inputRef.current && inputRef.current.focus(); } catch (e) {} }
  }

  function submitTyped() {
    if (!playing) return;
    // a highlighted suggestion wins; otherwise resolve the typed text, else the
    // top suggestion, else complain.
    if (sugIdx >= 0 && suggestions[sugIdx]) { commitGuess(suggestions[sugIdx]); return; }
    const exact = findCity(val);
    if (exact) { commitGuess(exact); return; }
    if (suggestions.length) { commitGuess(suggestions[0]); return; }
    if (normCity(val).length) say('Not a city we know — try a major world city.');
  }

  // one free hint: reveal the continent (unregistered players only)
  const continent = continentOf(TARGET);
  function useHint() {
    if (!playing || g.hintUsed) return;
    const g2 = { ...g, hintUsed: true };
    if (!g2.t0) g2.t0 = Date.now();
    setG(g2);
    say(`Hint: the city is in ${continent}.`);
  }

  function revealEnd() {
    const g2 = { ...g, status: 'revealed', tEnd: Date.now() };
    if (!g2.t0) g2.t0 = Date.now();
    postResult(g2, 0);
    setG(g2);
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    setG(freshState()); setVal(''); setSugIdx(-1); setJustWon(false); setEndClosed(false);
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSugIdx((i) => Math.min((suggestions.length - 1), i + 1)); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSugIdx((i) => Math.max(-1, i - 1)); return; }
    if (e.key === 'Enter') { e.preventDefault(); submitTyped(); return; }
    if (e.key === 'Escape') { setSugIdx(-1); }
  }

  function shareText() {
    const squares = guesses.map((x, i) => {
      if (g.status === 'won' && i === guesses.length - 1) return '\u{1F7E9}';
      return bandOf(x.mi).sq;
    }).join('');
    const hintBit = g.hintUsed ? ' · \u{1F4A1}' : '';
    const streakBit = isTodays && myStats.cur >= 2 ? ` · streak ${myStats.cur}` : '';
    const head2 = won
      ? `Ping #${PUZZLE.num} · found in ${guesses.length} guess${guesses.length === 1 ? '' : 'es'}${hintBit}${streakBit}`
      : `Ping #${PUZZLE.num} · stumped${hintBit}`;
    return `${head2}\n${squares}\n${shareUrl()}`;
  }
  function shareUrl() {
    return `sourceoftruths.com/ping${isTodays ? '' : `?p=${PUZZLE.num}`}`;
  }
  function copyShare() {
    const text = playing
      ? `Ping #${PUZZLE.num} — the daily city hunt from Source of Truths.\n${shareUrl()}`
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

  // one guess-history row
  function GuessRow({ x, i, last }) {
    const solvedRow = g.status !== 'playing' && x.mi === 0;
    const b = bandOf(x.mi);
    const bg = solvedRow ? COLORS.greenSoft : b.bg;
    const border = solvedRow ? 'rgba(21,128,61,0.5)' : b.border;
    const color = solvedRow ? '#166534' : b.color;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: bg, border: `1.5px solid ${border}`, borderRadius: 9, padding: '8px 12px', animation: last ? ' pgrow .25s ease' : undefined }}>
        <span style={{ fontFamily: MONO, fontSize: 11, color: COLORS.faded, width: 14, flex: '0 0 auto' }}>{i + 1}</span>
        <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, color: COLORS.ink, flex: '1 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {x.name}<span style={{ color: COLORS.faded, fontWeight: 600, fontSize: 12.5 }}> · {x.country}</span>
        </span>
        {solvedRow ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: SANS, fontSize: 13, fontWeight: 800, color, flex: '0 0 auto' }}>
            <MapPin size={15} strokeWidth={2.5} /> found it!
          </span>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, flex: '0 0 auto' }}>
            <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 500, color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{fmtMi(x.mi)} mi</span>
            <span title={compass8(x.bearing)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 999, background: '#fff', border: `1.5px solid ${border}`, color, transform: `rotate(${x.bearing || 0}deg)` }}>
              <ArrowUp size={15} strokeWidth={2.8} />
            </span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', position: 'relative' }}>
      <Grain />
      <div className="pg-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.pg-wrap{padding-left:12px !important;padding-right:12px !important;}}
          .pg-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.ink};background:#fff;color:${COLORS.ink};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .pg-btn:hover{background:${COLORS.paper};}
          @keyframes pgfade{from{opacity:0;}}
          @keyframes pgrow{from{opacity:0;transform:translateY(-4px);}}
          @media(max-width:560px){.pg-ttl{flex-direction:column;align-items:flex-start;gap:1px;}.pg-ttl h1{font-size:21px;letter-spacing:0.02em;}.pg-ttl .pg-ttl-dt{font-size:15px;}.pg-ttl-dot{display:none;}}
          .pg-inp{font-family:${SANS};font-weight:700;font-size:18px;width:100%;border:2px solid ${COLORS.ink};border-radius:9px;padding:13px 14px 13px 42px;background:#fff;color:${COLORS.ink};outline:none;}
          .pg-inp:focus{border-color:${COLORS.accent};box-shadow:0 0 0 3px rgba(2,132,199,0.18);}
          .pg-go{font-family:${SANS};font-weight:800;font-size:15px;letter-spacing:0.04em;text-transform:uppercase;border:2px solid ${COLORS.accent};background:${COLORS.accent};color:#fff;border-radius:9px;padding:0 22px;cursor:pointer;height:52px;flex:0 0 auto;}
          .pg-go:active{transform:translateY(1px);}
          .pg-sug{position:absolute;left:0;right:0;top:calc(100% + 6px);background:#fff;border:2px solid ${COLORS.ink};border-radius:10px;box-shadow:0 12px 30px rgba(20,22,28,0.18);overflow:hidden;z-index:20;}
          .pg-sug button{display:flex;align-items:center;gap:8px;width:100%;text-align:left;font-family:${SANS};font-size:15px;font-weight:700;color:${COLORS.ink};background:#fff;border:none;border-bottom:1px solid rgba(28,30,36,0.08);padding:10px 13px;cursor:pointer;}
          .pg-sug button:last-child{border-bottom:none;}
          .pg-sug button:hover,.pg-sug button.on{background:${COLORS.accentSoft};}
          .pg-tool{font-family:${SANS};font-weight:800;font-size:12.5px;border:1.5px solid rgba(28,30,36,0.35);background:#fff;color:${COLORS.ink};border-radius:8px;padding:7px 11px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;}
        `}</style>

        <div style={{ maxWidth: 620, margin: '0 auto' }}>

        {/* game-native top strip: quiet nav + player chip (hidden in focus mode while playing) */}
        <div style={{ display: focusMode ? 'none' : 'block' }}><DailyTopNav player={player} compact={playing} /></div>

        {/* masthead: pressed PING tiles with No./date inline */}
        <div className="pg-mh" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', position: 'relative', paddingRight: 28, marginBottom: 16, borderBottom: '2px solid rgba(28,30,36,0.8)', paddingBottom: 11 }}>
          <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end' }}>
            {'PING'.split('').map((ch, i) => (
              <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 26, background: i === 3 ? COLORS.accent : COLORS.ink, color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
            ))}
          </div>
          <div className="pg-ttl" style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
            <h1 style={{ margin: 0, fontFamily: MONO, fontSize: 14, letterSpacing: '0.06em', fontWeight: 500, color: COLORS.ink }}>No. {PUZZLE.num}</h1>
            <span className="pg-ttl-dot" style={{ color: COLORS.faded }}>&middot;</span>
            <span className="pg-ttl-dt" style={{ fontFamily: SANS, fontStyle: 'italic', fontSize: 15, color: COLORS.faded }}>{PUZZLE.dateLabel}</span>
            {PUZZLE.sunday && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: '#fff', background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>Sunday &middot; Tricky</span>}
          </div>
          <button onClick={() => setShowHelp(true)} aria-label="How to play" title="How to play" style={{ position: 'absolute', top: 13, right: 2, background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded, padding: 0, display: 'flex' }}>
            <HelpCircle size={20} />
          </button>
        </div>

        {/* the hunt */}
        <div style={{ background: '#fff', border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '15px 17px 17px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, borderBottom: '1px solid rgba(28,30,36,0.18)', paddingBottom: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ whiteSpace: 'nowrap' }}>name the secret city</span>
            <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>guess <b style={{ color: COLORS.ink, fontWeight: 500 }}>{guesses.length}</b>{playing ? ' so far' : ''}</span>
          </div>

          <div style={{ fontFamily: SANS, fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', color: COLORS.ink, lineHeight: 1.4, margin: '2px 0 4px' }}>
            One city, no clues. Guess any world city and I&rsquo;ll tell you how far it is and which way to head.
          </div>
          {g.hintUsed && playing && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: SANS, fontSize: 12.5, fontWeight: 800, color: COLORS.accentDeep, background: COLORS.accentSoft, border: '1.5px solid rgba(2,132,199,0.4)', borderRadius: 7, padding: '4px 10px', marginTop: 8 }}>
              <Lightbulb size={13} /> It&rsquo;s in {continent}.
            </div>
          )}

          {/* input row */}
          {playing && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', gap: 9, alignItems: 'stretch', position: 'relative' }}>
                <div style={{ position: 'relative', flex: '1 1 auto' }}>
                  <Search size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: COLORS.faded, pointerEvents: 'none' }} />
                  <input
                    ref={inputRef}
                    className="pg-inp"
                    type="text"
                    placeholder="Guess a city…"
                    value={val}
                    autoFocus={!mobileUi}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    onChange={(e) => { setVal(e.target.value); setSugIdx(-1); }}
                    onKeyDown={onKeyDown}
                    aria-label="Your city guess"
                  />
                  {suggestions.length > 0 && (
                    <div className="pg-sug">
                      {suggestions.map((c, i) => (
                        <button
                          key={`${c.name}|${c.country}`}
                          className={i === sugIdx ? 'on' : ''}
                          onMouseEnter={() => setSugIdx(i)}
                          onClick={() => commitGuess(c)}
                        >
                          <MapPin size={14} style={{ color: COLORS.faded, flex: '0 0 auto' }} />
                          <span>{c.name}<span style={{ color: COLORS.faded, fontWeight: 600 }}> · {c.country}</span></span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button className="pg-go" onClick={submitTyped}>Guess</button>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: COLORS.faded, marginTop: 8 }}>
                {closest ? (
                  <>Closest so far: <b style={{ color: COLORS.ink }}>{closest.name}</b>, {fmtMi(closest.mi)} mi away &middot; no guess limit</>
                ) : (
                  <>Any major world city &middot; each guess shows miles + a compass arrow &middot; no guess limit</>
                )}
              </div>
            </div>
          )}

          {/* guess history — newest on top */}
          {guesses.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14 }}>
              {guesses.slice().reverse().map((x, ri) => {
                const i = guesses.length - 1 - ri;
                return <GuessRow key={i} x={x} i={i} last={ri === 0} />;
              })}
            </div>
          )}

          {/* tools */}
          {playing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 13, flexWrap: 'wrap' }}>
              {!identity && !g.hintUsed && (
                <button className="pg-tool" onClick={useHint} title="Reveal the continent (one hint per day)" style={{ background: COLORS.accentSoft, borderColor: 'rgba(2,132,199,0.5)', color: COLORS.accentDeep }}>
                  <Lightbulb size={14} /> Hint: the continent
                </button>
              )}
              {identity && guesses.length > 0 && (
                <button onClick={() => { if (armReveal) { setArmReveal(false); revealEnd(); } else { setArmReveal(true); } }}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS, fontWeight: 700, fontSize: 12, color: armReveal ? COLORS.rust : COLORS.faded, textDecoration: 'underline', textUnderlineOffset: 3, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Eye size={13} /> {armReveal ? 'Tap again — ends the game and shows the city' : 'Give up & reveal'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* result */}
        {!playing && (
          <>
            <div style={{ maxWidth: 472, margin: '0 auto 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: PAPER, border: '1.5px solid rgba(28,30,36,0.18)', borderRadius: 10, padding: '12px 14px' }}>
                <MapPin size={30} strokeWidth={2.2} style={{ color: won ? COLORS.green : COLORS.ink, flex: '0 0 auto' }} />
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.ink, lineHeight: 1.45 }}>
                  <b style={{ fontSize: 16 }}>{TARGET.name}, {TARGET.country}.</b> <span style={{ color: COLORS.faded, fontWeight: 600 }}>{PUZZLE.blurb}</span>
                </span>
              </div>
              {PUZZLE.sunday && (
                <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.faded, fontStyle: 'italic', margin: '8px 0 0' }}>The Sunday Edition — a trickier city to find.</div>
              )}
            </div>
            <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
              {isTodays ? (
                <>
                  {countdown ? <>Next Ping in <b style={{ color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{countdown}</b>.</> : 'A new city drops at midnight Eastern.'}
                  {prevPuzzle && (
                    <>
                      {' '}Meanwhile:{' '}
                      <a href={`/ping?p=${prevPuzzle.num}`} style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>
                        play yesterday&rsquo;s Ping &rarr;
                      </a>
                    </>
                  )}
                </>
              ) : (
                <>
                  You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                  <a href="/ping" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s Ping &rarr;</a>
                  {' · '}
                  <a href="/daily" style={{ color: COLORS.faded, fontWeight: 700, textDecoration: 'underline' }}>All daily puzzles</a>
                </>
              )}
            </p>
          </>
        )}

        {focusMode && (
          <div style={{ maxWidth: 620, margin: '30px auto 0', textAlign: 'center' }}>
            <button onClick={() => setShowChrome(true)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: '0.03em', color: COLORS.ink, background: 'none', border: '1.5px solid rgba(28,30,36,0.28)', borderRadius: 9, padding: '10px 20px', cursor: 'pointer' }}>Show navigation &amp; more</button>
            <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.faded, fontWeight: 600, marginTop: 8 }}>Other games, challenge, share &amp; leaderboard</div>
          </div>
        )}
        {/* standard quiz-page bottom: challenge + stats + join + leaderboard */}
        <div style={{ display: focusMode ? 'none' : 'block', margin: '30px auto 0' }}>
          <DailyGamesGrid
            self="ping"
            maxWidth={620}
            challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`}
            share={{ label: copied ? 'Copied' : 'Share This Puzzle', onClick: copyShare }}
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
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Ping to your Home Screen</div>
              {isIosDevice() ? (
                <ol style={{ margin: '0 0 4px', paddingLeft: 20, color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  <li>Tap the <b>Share</b> button in Safari&apos;s toolbar.</li>
                  <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                  <li>Tap <b>Add</b> &mdash; the tile opens today&apos;s city, every day.</li>
                </ol>
              ) : (
                <p style={{ margin: '0 0 4px', color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  Open your browser&apos;s menu and choose <b>Add to Home Screen</b> (or <b>Install app</b>). The tile opens today&apos;s city, every day.
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
        <div style={{ maxWidth: 620, margin: '20px auto 0' }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.faded, marginBottom: 9 }}>Your stats</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { n: myStats.cur, l: 'Streak' },
              { n: myStats.played, l: 'Played' },
              { n: myStats.avg != null ? myStats.avg : '—', l: 'Avg Guesses' },
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
        <div id="daily-leaderboard" style={{ display: focusMode ? 'none' : 'block', maxWidth: 620, margin: '26px auto 0', background: '#fff', border: '1.5px solid rgba(20,22,28,0.12)', borderRadius: 12, padding: '14px 16px' }}>
          <DailyCombinedLeaderboard todayKey="ping" identity={identity} quizId={PUZZLE.quizId} />
        </div>
      </div>

      {/* the end-of-game popup: the shared DailyEndCard as a dismissible modal (win or loss) */}
      {!playing && !endClosed && (
        <DailyEndCard
          modal
          self="ping"
          won={won}
          headline={won ? <>You found it!</> : <>Out of the running</>}
          subline={won
            ? <>{TARGET.name} &middot; found in {guesses.length} guess{guesses.length === 1 ? '' : 'es'} &middot; {elapsed}{g.hintUsed ? <> &middot; 1 hint</> : null}</>
            : <>You revealed {TARGET.name} without finding it</>}
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
              <p style={{ margin: '0 0 9px' }}>There&rsquo;s one secret city a day and <b>no clues</b>. <b>Guess any world city</b> to begin.</p>
              <p style={{ margin: '0 0 9px' }}>Every guess pings back two things: the <b>distance in miles</b> to the secret city, and a <b>compass arrow</b> pointing the way there. Follow the arrows and the shrinking distances to close in &mdash; from <b style={{ color: '#475569' }}>cold</b> (2,500+ mi) through <b style={{ color: '#0a1730' }}>cool</b> and <b style={{ color: '#92610b' }}>warm</b> to <b style={{ color: '#9a3d0c' }}>hot</b> (within 200).</p>
              <p style={{ margin: '0 0 9px' }}>There&rsquo;s <b>no guess limit</b> &mdash; keep going until you land on the city. Your <b>score is how few guesses it took</b>: a first-guess hit is a perfect 10, and each extra guess trims a point. One free <b>hint</b> reveals the continent.</p>
              <p style={{ margin: 0 }}>Ties on the daily board break on fewest guesses, then fastest time. Sundays hide a trickier city.</p>
            </div>
            <button className="pg-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: '#fff' }}>Play</button>
          </div>
        </div>
      )}

      {/* About Ping — crawlable prose for search, server-rendered into the HTML */}
      <section style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2, maxWidth: 620, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Ping</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Ping is a free daily geography game from Source of Truths &mdash; the daily city hunt. Each day there&rsquo;s one secret city somewhere in the world and not a single clue to start. Name any well-known city and Ping answers with the great-circle distance in miles and a compass arrow pointing toward the target.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          From there it&rsquo;s pure triangulation: chase the arrow, watch the miles fall, and close in on the answer. There&rsquo;s no limit on guesses, so everyone gets there in the end &mdash; the goal is to do it in as few guesses as you can. A first-guess hit is a perfect ten, and one free hint reveals the continent.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new city drops every day at midnight Eastern, with a trickier one on Sundays. No app, no signup &mdash; play free in your browser, keep a streak, and race the daily leaderboard. More dailies: <a href="/span" style={{ color: COLORS.ink, fontWeight: 800 }}>Span</a>, our geography game, <a href="/circa" style={{ color: COLORS.ink, fontWeight: 800 }}>Circa</a>, the daily year hunt, and <a href="/crux" style={{ color: COLORS.ink, fontWeight: 800 }}>Crux</a>, our clueless crossword.
        </p>
      </section>

      <div style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2 }}><Footer /></div>
    </div>
  );
}

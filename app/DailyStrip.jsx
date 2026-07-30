'use client';

// Daily Puzzles home block. REDESIGN (owner-approved mockup, 2026-07-28,
// "three columns, expanding game tiles" — Stage 1 of the quiz-home redesign):
// the old horizontal strip becomes a paper-and-ink TILE BOARD. An UP NEXT hero
// (navy block) sits on top; a filter row (All / Unplayed / Streak at risk) plus
// a "Daily leaderboard" toggle sits below it; then a white-tile grid of every
// daily. Clicking a tile expands it IN PLACE as an overlay: DailyTilePanel is
// rendered absolutely inside .dhome, covering the whole console (stats bar and
// grid alike, so only the panel's own Play button shows) rather than
// displacing it, so the board's height never changes and nothing below moves
// (owner request, 2026-07-29; it previously inserted a strip at the end of the
// selected tile's row, which pushed every later tile down the page). Nothing
// navigates until you hit Play. The panel carries the game's identity and a
// one-line how-to-play, today's record and standings (from the
// /api/quiz/daily-combined per-game board), and, from one lazy
// /api/quiz/daily-game fetch, the archive calendar, the game's all-time
// leaderboard, and the viewer's own all-time record. The OVERALL daily
// leaderboard (overall top 3, per-game minis, recent champions) is still
// reachable via the "Daily leaderboard" toggle so nothing is lost before Stage 2
// promotes the page into three columns.
//
// Palette: sits directly on the page ground (#f7f8fa). White tiles, navy
// (#ffffff) as a material for the hero + expand panel, gold (#e8b43a) reserved
// for daily identity, green for a finished game. Matches the live QuizHomeClient
// tokens (bg #f7f8fa / surface #fff / accent #0e1d40 / cta #e8b43a).
//
// Data wiring is unchanged from the strip: completion follows the signed-in
// player across devices via /api/quiz/daily-status (with the same-device
// localStorage sot_<key>_day breadcrumb + per-puzzle save detection for first
// paint), per-game streaks come from daily-status, and the leaderboard payload
// is the /api/quiz/daily-combined `board` prop. Adding a game to GAMES adds it
// to the board everywhere it's used.

import React, { useState, useEffect, useRef } from 'react';
import { Crown, ChevronDown, ChevronRight, ChevronLeft, Trophy, Play, Flame, Clock, ArrowRight, X } from 'lucide-react';
import useDailyOrder, { sortByDailyOrder } from './useDailyOrder';
import { hasSundayEdition, isSundayET, SUNDAY_SHORT } from '../lib/sunday-editions';
import DailyTilePanel from './DailyTilePanel';

const GAMES = [
  { key: 'crux', href: '/crux', name: 'Crux', img: '/games/btn-crux.png', store: 'sot_crux_day', tag: "A clueless crossword" , cat: 'Word' },
  { key: 'emcee', href: '/emcee', name: 'Emcee', img: '/games/btn-emcee.png', store: 'sot_emcee_day', tag: "The daily mini crossword" , cat: 'Word' },
  { key: 'shards', href: '/shards', name: 'Shards', img: '/games/btn-shards.png', store: 'sot_shards_day', tag: "Reassemble the crossword" , cat: 'Word' },
  { key: 'garble', href: '/garble', name: 'Garble', img: '/games/btn-garble.png', store: 'sot_garble_day', tag: "Untangle five words" , cat: 'Word' },
  { key: 'links', href: '/links', name: 'Links', img: '/games/btn-links.png', store: 'sot_links_day', tag: "Four hidden threads" , cat: 'Word' },
  { key: 'span', href: '/span', name: 'Span', img: '/games/btn-span.png', store: 'sot_span_day', tag: "Cross the map" , cat: 'Geography' },
  { key: 'dating', href: '/dating', name: 'Dating', img: '/games/btn-dating.png', store: 'sot_dating_day', tag: "Put history in order" , cat: 'History' },
  { key: 'tally', href: '/tally', name: 'Tally', img: '/games/btn-tally.png', store: 'sot_tally_day', tag: "Balance the books" , cat: 'Numbers' },
  { key: 'suds', href: '/suds', name: 'Suds', img: '/games/btn-suds.png', store: 'sot_suds_day', tag: "The daily sudoku" , cat: 'Numbers' },
  { key: 'carve', href: '/carve', name: 'Carve', img: '/games/btn-carve.png', store: 'sot_carve_day', tag: "Equal-sum blocks" , cat: 'Numbers' },
  { key: 'extra', href: '/extra', name: 'Extra', img: '/games/btn-extra.png', store: 'sot_extra_day', tag: "Name the story" , cat: 'History' },
  { key: 'stet', href: '/stet', name: 'Stet', img: '/games/btn-stet.png', store: 'sot_stet_day', tag: "Spot the error, fix the copy" , cat: 'Word' },
  { key: 'outwit', href: '/outwit', name: 'Outwit', img: '/games/btn-outwit.png', store: 'sot_outwit_day', tag: "Beat the crowd" , cat: 'Crowd Psychology' },
  { key: 'outrank', href: '/outrank', name: 'Outrank', img: '/games/btn-outrank.png', store: 'sot_outrank_day', tag: "Call the crowd's order" , cat: 'Crowd Psychology' },
  { key: 'tuck', href: '/tuck', name: 'Tuck', img: '/games/btn-tuck.png', store: 'sot_tuck_day', tag: "Same letters, highest score wins" , cat: 'Word' },
  { key: 'alibi', href: '/alibi', name: 'Alibi', img: '/games/btn-alibi.png', store: 'sot_alibi_day', tag: "Solve the nightly whodunit" , cat: 'Logic' },
  { key: 'cipher', href: '/cipher', name: 'Cipher', img: '/games/btn-cipher.png', store: 'sot_cipher_day', tag: "Crack the letter math" , cat: 'Numbers' },
  { key: 'ping', href: '/ping', name: 'Ping', img: '/games/btn-ping.png', store: 'sot_ping_day', tag: "Guess the secret city" , cat: 'Geography' },
  { key: 'warmer', href: '/warmer', name: 'Warmer', img: '/games/btn-warmer.png', store: 'sot_warmer_day', tag: "Hotter or colder" , cat: 'Word' },
  { key: 'jester', href: '/jester', name: 'Jesters', img: '/games/btn-jester.png', store: 'sot_jester_day', tag: "Seat the court" , cat: 'Logic' },
  { key: 'sworn', href: '/sworn', name: 'Sworn', img: '/games/btn-sworn.png', store: 'sot_sworn_day', tag: "Spot the liars" , cat: 'Logic' },
  { key: 'axiom', href: '/axiom', name: 'Axiom', img: '/games/btn-axiom.png', store: 'sot_axiom_day', tag: "Find the hidden rule" , cat: 'Logic' },
  { key: 'hearsay', href: '/hearsay', name: 'Hearsay', img: '/games/btn-hearsay.png', store: 'sot_hearsay_day', tag: "Deduce what they don't know" , cat: 'Logic' },
  { key: 'venn', href: '/venn', name: 'Venn', img: '/games/btn-venn.png', store: 'sot_venn_day', tag: "Sort the overlaps" , cat: 'Logic' },
  { key: 'stands', href: '/stands', name: 'Stands', img: '/games/btn-stands.png', store: 'sot_stands_day', tag: "Rebuild the results" , cat: 'Logic' },
  { key: 'bracket', href: '/bracket', name: 'Bracket', img: '/games/btn-bracket.png', store: 'sot_bracket_day', tag: "Name every winner" , cat: 'History' },
  { key: 'lode', href: '/lode', name: 'Lode', img: '/games/btn-lode.png', store: 'sot_lode_day', tag: "Seven letters, rare words pay" , cat: 'Word' },
  { key: 'etch', href: '/etch', name: 'Etch', img: '/games/btn-etch.png', store: 'sot_etch_day', tag: "A picture in the numbers" , cat: 'Logic' },
  { key: 'hedge', href: '/hedge', name: 'Hedge', img: '/games/btn-hedge.png', store: 'sot_hedge_day', tag: "Draw one closed loop" , cat: 'Numbers' },
  { key: 'listed', href: '/listed', name: 'Listed', img: '/games/btn-listed.png', store: 'sot_listed_day', tag: "Rank the list, top to bottom" , cat: 'History' },
];

const NAME_BY_KEY = GAMES.reduce((m, g) => { m[g.key] = g.name; return m; }, {});
// Recent Champions list length (yesterday plus the prior days), sized to fill
// the overall-leaderboard column beside the per-game minis.
const CHAMPION_DAYS = 8;
// Navy-legible per-game accents for the mini-board titles (match DailyCombinedLeaderboard).
const ACCENTS = { crux: '#5b9bff', emcee: '#e879f9', garble: '#f0c95a', links: '#4ca878', span: '#e06aa0', dating: '#a483f0', tally: '#4cb377', suds: '#f0894c', circa: '#38b6cf', extra: '#e06a6a', carve: '#a483f0', stet: '#41b1e8', outwit: '#c3cfe3', tuck: '#e0a568', alibi: '#ef8896', cipher: '#3fc9b8', ping: '#4cb3f0', warmer: '#f3705c', jester: '#7c3aed', outrank: '#8b8af5', sworn: '#f472b6', shards: '#2dd4bf', hearsay: '#c4b5fd', venn: '#e0a568', stands: '#6aa3ff', bracket: '#f0894c', lode: '#e0b34c', etch: '#8fbf5a', hedge: '#4cc0d4', listed: '#e07ad0', axiom: '#3fc9b8' };
// Saturated one-color-per-game identity for the tile accent + expand panel
// (the "one saturated color per game" system used on the live game pages).
const TCOL = { crux: '#2563eb', emcee: '#c026d3', shards: '#0d9488', garble: '#8a6d1a', links: '#166534', span: '#9d174d', dating: '#6d28d9', tally: '#15803d', suds: '#ea580c', carve: '#7c3aed', extra: '#b91c1c', stet: '#0369a1', outwit: '#1f2937', outrank: '#4338ca', tuck: '#92400e', alibi: '#8b1e2d', cipher: '#0f766e', ping: '#0284c7', warmer: '#dc2626', jester: '#7c3aed', sworn: '#be185d', axiom: '#0f766e', hearsay: '#5b21b6', venn: '#b45309', stands: '#1d4ed8', bracket: '#c2410c', lode: '#a16207', etch: '#4d7c0f', hedge: '#0891b2', listed: '#86198f' };
const tcol = (k) => TCOL[k] || '#2563eb';
// Faint tile tints (owner, 2026-07-29: "the colours should be more faint").
// Each game's saturated hue is mixed down into the board's own deep navy, so a
// tile is recognisably its game's colour while the board still reads as one
// calm surface. The saturated hue stays on the top rule for punch. Computed
// here rather than with CSS color-mix so it renders identically everywhere.
const TINT_BASE = '#ffffff';
function mixHex(hex, pct, base) {
  const h = (x) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16));
  const [r1, g1, b1] = h(hex), [r2, g2, b2] = h(base);
  const m = (a, b) => Math.round(a * pct + b * (1 - pct)).toString(16).padStart(2, '0');
  return '#' + m(r1, r2) + m(g1, g2) + m(b1, b2);
}

// The category chip is keyed to the CATEGORY, not the game (owner, 2026-07-29),
// so every Word chip matches every other Word chip and the grid gains a second,
// consistent layer of grouping. Navy-legible hues, one clearly distinct per
// category.
const CAT_COLOR = {
  Word: '#1d4ed8', Numbers: '#9a3412', Logic: '#9f0f31',
  History: '#6b21a8', Geography: '#166534', 'Crowd Psychology': '#854d0e',
};
const CAT_CHIP_BG = {}, CAT_BD = {};
for (const [k, v] of Object.entries(CAT_COLOR)) {
  CAT_CHIP_BG[k] = mixHex(v, 0.13, TINT_BASE);
  CAT_BD[k] = mixHex(v, 0.72, TINT_BASE);
}
const catCol = (cat) => CAT_COLOR[cat] || '#262b35';
// 'Crowd Psychology' is too long for a tile chip.
const CAT_SHORT = { 'Crowd Psychology': 'Crowd' };
// Consecutive ET days on which the player finished at least one daily, counted
// back from today. Today is optional (a live streak shows before you have played
// today); any earlier gap ends it. Derived from the played quiz ids that
// daily-status already returns, so it costs no extra request.
function computeDayStreak(playedIds) {
  const days = new Set();
  for (const id of (playedIds || [])) {
    const m = /^[a-z]+-(\d{1,2})-(\d{1,2})-(\d{2})$/.exec(id);
    if (m) days.add(`20${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`);
  }
  if (!days.size) return 0;
  const back = (iso) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - 1); return d.toISOString().slice(0, 10); };
  const today = etToday();
  let cur = days.has(today) ? today : back(today), n = 0;
  while (days.has(cur)) { n += 1; cur = back(cur); }
  return n;
}

function etToday() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

function fmtPts(x) { const v = Math.round(Number(x) * 10) / 10; return Number.isInteger(v) ? String(v) : v.toFixed(1); }

// A player's game-native score line for the panel's "Today" figure, from the
// daily-combined per-game board row. score/total when the game reports a total
// (e.g. 100/100, 10/10), otherwise the raw score, otherwise the daily points.
function todayScoreLine(row) {
  if (!row) return null;
  if (row.total != null && Number(row.total) > 0) return `${fmtPts(row.score)}/${fmtPts(row.total)}`;
  if (row.score != null) return fmtPts(row.score);
  if (row.points != null) return `${fmtPts(row.points)} pts`;
  return null;
}

export default function DailyStrip({ board = null }) {
  const [done, setDone] = useState(() => new Set());
  const [inprog, setInprog] = useState(() => new Set());
  const [streaks, setStreaks] = useState({}); // per-game consecutive-day streaks, from daily-status
  const [dayStreak, setDayStreak] = useState(0); // cross-game: days in a row with at least one daily played
  const [todayXp, setTodayXp] = useState(null);   // IQ Points earned today (ET), from daily-status
  const [sel, setSel] = useState(null); // selected game key (expanded tile), or null
  const [lbOpen, setLbOpen] = useState(false); // overall daily leaderboard toggle

  const [hist, setHist] = useState(null); // recent daily champions, from /api/quiz/daily-history
  // Sunday chip: Sundays (ET) only, and only on games that run a real Sunday
  // Edition. Set after mount so SSR and the first client render agree.
  const [isSunday, setIsSunday] = useState(false);
  useEffect(() => { setIsSunday(isSundayET()); }, []);
  const allSundayEditions = isSunday && GAMES.every(g => hasSundayEdition(g.key));
  // "resets in Xh Ym" countdown to ET midnight; set after mount (SSR-safe).
  const [resetLbl, setResetLbl] = useState('');
  useEffect(() => {
    const tick = () => {
      try {
        const et = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
        const mid = new Date(et); mid.setHours(24, 0, 0, 0);
        const ms = Math.max(0, mid - et);
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        setResetLbl(h > 0 ? `${h}h ${m}m` : `${m}m`);
      } catch (e) { setResetLbl(''); }
    };
    tick();
    const iv = setInterval(tick, 60000);
    return () => clearInterval(iv);
  }, []);
  // Display order = yesterday's popularity (canonical order until it loads).
  const dailyOrder = useDailyOrder();
  const games = sortByDailyOrder(GAMES, dailyOrder);

  // first paint: same-device breadcrumbs
  useEffect(() => {
    const today = etToday();
    const d = new Set();
    const ip = new Set();
    for (const g of GAMES) {
      try {
        const c = JSON.parse(localStorage.getItem(g.store) || 'null');
        if (c && c.d === today) { if (c.done) d.add(g.key); else ip.add(g.key); }
      } catch (e) {}
    }
    if (d.size) setDone(d);
    if (ip.size) setInprog(ip);
  }, []);

  // On a phone, default the board to the Unplayed filter (owner mockup).
  useEffect(() => {
    try { if (typeof window !== 'undefined' && window.innerWidth <= 560) setFilter('todo'); } catch (e) {}
  }, []);

  // cross-device: the signed-in player's finished-today set from the server
  useEffect(() => {
    let anonId = null, email = null;
    try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
    const qs = new URLSearchParams();
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    if (!qs.toString()) return;
    let alive = true;
    fetch('/api/quiz/daily-status?' + qs.toString())
      .then((r) => r.json())
      .then((data) => {
        if (!alive || !data) return;
        if (data.streaks && typeof data.streaks === 'object') setStreaks(data.streaks);
        if (typeof data.todayXp === 'number') setTodayXp(data.todayXp);
        setDayStreak(computeDayStreak(data.played));
        const [Y, M, D] = etToday().split('-').map(Number);
        const yy = Y % 100;
        const completed = new Set(data.completed || []);
        const played = new Set(data.played || []);
        const abandoned = new Set(data.abandoned || []);
        setDone((cur) => {
          const next = new Set(cur);
          for (const g of GAMES) {
            const id = `${g.key}-${M}-${D}-${yy}`;
            if (completed.has(id) || played.has(id)) next.add(g.key);
          }
          return next;
        });
        setInprog((cur) => {
          const next = new Set(cur);
          for (const g of GAMES) {
            const id = `${g.key}-${M}-${D}-${yy}`;
            if (abandoned.has(id) && !completed.has(id) && !played.has(id)) next.add(g.key);
          }
          return next;
        });
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const n = GAMES.filter((g) => done.has(g.key)).length;
  const pct = Math.round((n / GAMES.length) * 100);
  const left = GAMES.length - n;
  // Up Next = the first unfinished game in display order (an in-progress game
  // counts as unfinished, so it becomes a Resume target). It still renders as a
  // tile in the board too (owner mockup shows all 30 tiles).
  const nextGame = games.find((g) => !done.has(g.key)) || null;

  // ── leaderboard wiring (only when a board payload is provided) ──
  const bgames = board && Array.isArray(board.games) ? board.games : null;
  const byKey = {};
  if (bgames) for (const g of bgames) byKey[g.key] = g;
  const hasBoard = !!(bgames && bgames.length);
  const overall = board && Array.isArray(board.overall) ? board.overall : [];
  const maxTotal = (board && board.maxTotal) || 150;
  const gameCount = (board && board.gameCount) || (bgames ? bgames.length : 0);
  const bestN = board && board.bestN != null ? board.bestN : Math.min(10, gameCount || 10);
  const meKey = board && board.me ? board.me.userKey : null;
  const top3 = overall.slice(0, 3);
  const meShown = meKey && top3.some((r) => r.userKey === meKey);
  const uniquePlayers = board && typeof board.uniquePlayers === 'number' ? board.uniquePlayers : null;

  // Easiest board to climb: fewest players today among the games still open to
  // you. Ties keep the earlier game in daily order.
  const easiest = (() => {
    if (!nextGame) return null;
    const open = games.filter((g) => !done.has(g.key));
    let best = null, bestN = Infinity;
    for (const g of open) {
      const b = byKey[g.key];
      const cnt = b && typeof b.field === 'number' ? b.field : null;
      if (cnt == null) continue;
      if (cnt < bestN) { bestN = cnt; best = g; }
    }
    return best ? { game: best, players: bestN } : { game: nextGame, players: null };
  })();

  // The player's row on a game's per-game board (their score/rank today).
  const myRow = (key) => {
    if (!meKey) return null;
    const b = byKey[key] && byKey[key].board;
    const onBoard = b ? b.find((x) => x && x.userKey === meKey) : null;
    if (onBoard) return onBoard;
    const pg = board && board.me && board.me.perGame ? board.me.perGame[key] : null;
    if (!pg) return null;
    return { userKey: meKey, username: (board.me && board.me.username) || 'You', ...pg };
  };

  // Same-device in-progress/finished detection for TODAY via each game's own
  // per-puzzle save, keyed by the puzzle nums the daily-combined payload carries.
  useEffect(() => {
    if (!bgames || !bgames.length) return;
    const ip = new Set(); const dn = new Set();
    for (const g of bgames) {
      if (!g || g.num == null) continue;
      const saveKeys = [`sot_${g.key}_${g.num}`];
      if (g.key === 'crux' && g.rev) saveKeys.push(`sot_crux_${g.num}_r${g.rev}`);
      let playing = false, finished = false;
      for (const k of saveKeys) {
        try {
          const st = (JSON.parse(localStorage.getItem(k) || 'null') || {}).status;
          if (st === 'playing') playing = true; else if (st) finished = true;
        } catch (e) {}
      }
      if (finished) dn.add(g.key);
      else if (playing) ip.add(g.key);
    }
    if (dn.size) setDone((cur) => new Set([...cur, ...dn]));
    if (ip.size) setInprog((cur) => new Set([...cur, ...ip]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board]);

  // Recent champions only load once the overall board is opened.
  useEffect(() => {
    if (!lbOpen || !hasBoard || hist !== null) return;
    let alive = true;
    fetch('/api/quiz/daily-history')
      .then((r) => r.json())
      .then((d) => { if (alive && d && Array.isArray(d.history)) setHist(d.history.slice(0, CHAMPION_DAYS)); })
      .catch(() => {});
    return () => { alive = false; };
  }, [lbOpen, hasBoard, hist]);

  // Per-game archive + all-time record, fetched on first expand and cached by
  // game key (so re-opening a tile costs nothing). Shape: { allTime, drops, mine }.
  const [gameData, setGameData] = useState({});
  const fetchedRef = useRef(new Set());
  useEffect(() => {
    if (!sel || fetchedRef.current.has(sel)) return;
    fetchedRef.current.add(sel);
    let anonId = null, email = null;
    try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
    const qs = new URLSearchParams({ game: sel });
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    let alive = true;
    fetch('/api/quiz/daily-game?' + qs.toString())
      .then((r) => r.json())
      .then((d) => { if (alive && d && !d.error) setGameData((cur) => ({ ...cur, [sel]: d })); })
      .catch(() => { fetchedRef.current.delete(sel); });
    return () => { alive = false; };
  }, [sel]);

  // filtered tile set
  const list = games.filter((g) => !done.has(g.key)).concat(games.filter((g) => done.has(g.key)));
  const selGame = sel != null ? list.find((g) => g.key === sel) || games.find((g) => g.key === sel) || null : null;

  const pick = (key) => { setLbOpen(false); setSel((cur) => (cur === key ? null : key)); };

  // ── the per-game expand panel (overlays the board; see DailyTilePanel) ──
  const renderPanel = (g) => {
    const bg = byKey[g.key] || null;
    return (
      <DailyTilePanel
        key={'panel-' + g.key}
        game={g}
        accent={catCol(g.cat)}
        isDone={done.has(g.key)}
        inProgress={inprog.has(g.key)}
        streak={streaks[g.key] || 0}
        todayRow={myRow(g.key)}
        todayField={bg && typeof bg.field === 'number' ? bg.field : null}
        standings={bg && Array.isArray(bg.board) ? bg.board : []}
        meKey={meKey}
        data={gameData[g.key] || null}
        onClose={() => setSel(null)}
      />
    );
  };

  // Renders one group of tiles. `dim` marks the games a filter did not match:
  // they still render (so the board keeps its full height) but recede.
  const renderTiles = (arr, dim) => arr.map((g, i) => {
    const isDone = done.has(g.key);
            const st = streaks[g.key] >= 2 ? streaks[g.key] : 0;
            const sun = isSunday && !allSundayEditions && hasSundayEdition(g.key);
            const lead = hasBoard && byKey[g.key] && byKey[g.key].board && byKey[g.key].board[0] ? byKey[g.key].board[0].username : null;
            const row = isDone ? myRow(g.key) : null;
            const sl = row ? todayScoreLine(row) : null;
            const tile = (
              <button
                type="button"
                key={g.key}
                className={`dh-tile${isDone ? ' done' : ''}${!isDone && inprog.has(g.key) ? ' inprog' : ''}${sel === g.key ? ' sel' : ''}`}
              style={isDone ? undefined : { borderColor: CAT_BD[g.cat] }}
                onClick={() => pick(g.key)}
                aria-expanded={sel === g.key}
                aria-label={`${g.name} — ${g.tag}${isDone ? ' — done today' : ''}${st ? ` — ${st}-day streak` : ''}`}
              >
                <span className="dh-acc" style={{ background: catCol(g.cat) }} aria-hidden="true" />
                <span className="dh-tdot" style={{ background: isDone ? '#16a34a' : (inprog.has(g.key) ? '#e8b43a' : 'transparent') }} aria-hidden="true" />
                {sun ? <span className="dh-tsun" aria-hidden="true">{SUNDAY_SHORT}</span> : null}
                <span className="dh-tnm">{g.name}</span>
                <span className="dh-tcat" style={{ background: catCol(g.cat), color: '#fff' }}>
                  {CAT_SHORT[g.cat] || g.cat}
                </span>
                <span className="dh-tic"><img src={g.img} alt="" aria-hidden="true" /></span>
                <span className="dh-tmeta">
                  <span className="dh-mrow">
                    {isDone ? (
                      <span className="dh-msc"><svg viewBox="0 0 24 24" width="10" height="10" fill="none" aria-hidden="true"><path d="M4 12.5 L10 18.5 L20 6" stroke="#22c55e" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>{sl || 'Done'}</span>
                    ) : null}
                    <span className={`dh-mstrk${st ? '' : ' none'}`}><Flame size={9} strokeWidth={2.8} />{st || 0}</span>
                  </span>
                  <span className="dh-mlead">
                    {lead
                      ? <><Crown size={9} strokeWidth={2.6} /><span>{lead}</span></>
                      : <span className="dh-nolead">Be the first</span>}
                  </span>
                </span>
              </button>
            );
    return dim ? React.cloneElement(tile, { className: tile.props.className + ' dim' }) : tile;
  });

  return (
    <div className={'dhome' + (selGame ? ' open' : '')}>
      <style>{`
        .dhome{position:relative;margin-bottom:16px;font-family:'Manrope',system-ui,-apple-system,sans-serif;display:flex;flex-direction:column;min-height:100%;}
        /* ── stats bar, welded onto the grid ── */
        .dh-sbar{container-type:inline-size;position:relative;z-index:3;flex-wrap:nowrap;display:flex;align-items:center;gap:10px;background:#ffffff;border:1.5px solid #c3ccda;border-bottom:none;border-radius:13px 13px 0 0;padding:10px 12px;color:#1c1e24;border-bottom:1px solid #eef0f4;}
        .dh-bup{display:flex;align-items:center;gap:12px;flex:1 1 auto;min-width:0;padding-left:14px;border-left:1.5px solid #c3ccda;}
        .dh-bup .dh-play{flex:1 1 auto;min-width:96px;max-width:none;font-size:13.5px;padding:11px 18px;}
        .dh-bup>img{height:32px;width:auto;max-width:40px;object-fit:contain;flex:none;}
        /* Mobile: the easiest-leaderboard text collides with the Play button, so
           drop the game icon there to buy back the width (owner 2026-07-29). */
        @media(max-width:640px){.dh-bup>img{display:none;}}
        .dh-bupt{min-width:0;}
        .dh-bue{font-size:9px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#a16207;white-space:nowrap;}
        .dh-bun{font-size:17px;font-weight:800;letter-spacing:-.3px;line-height:1.1;white-space:nowrap;}
        .dh-busub{font-size:11px;font-weight:600;color:#262b35;line-height:1.2;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .dh-statlead{flex:none;display:flex;flex-direction:column;justify-content:center;font-size:15.5px;font-weight:800;line-height:1.06;color:#1c1e24;white-space:nowrap;padding-right:12px;letter-spacing:-.25px;}
        .dh-stats{display:flex;align-items:center;flex:none;min-width:0;overflow:hidden;}
        .dh-stat{padding:0 9px;white-space:nowrap;line-height:1.15;border-right:1px solid #eef0f4;}
        .dh-stat:last-child{border-right:none;}
        .dh-stat:last-child{border-right:none;}
        .dh-stat b{display:block;font-size:14px;font-weight:800;font-variant-numeric:tabular-nums;}
        .dh-stat span{font-family:'DM Mono',ui-monospace,monospace;font-size:10px;letter-spacing:.07em;text-transform:uppercase;color:#262b35;white-space:nowrap;}
        .dh-stat.g b{color:#15803d;}
        .dh-stat.y b{color:#a16207;}
        /* IQ Points reads blue, not green: Completed already owns green in this bar. */
        .dh-stat.iq b{color:#2563eb;}
        @container (max-width:900px){.dh-stat.opt{display:none;}}
        @container (max-width:760px){.dh-stat.opt2{display:none;}}
        /* Narrow bars swap the segmented filter for a hamburger and shed the
           remaining optional stats, so the topper never wraps to a second row. */
        @container (max-width:620px){.dh-stat.opt3{display:none;}
          .dh-sbar{justify-content:space-between;gap:8px;}
          .dh-statlead{font-size:13px;padding-right:7px;}
        .dh-stat{border-right:none;padding:0 5px;}
          .dh-bup{padding-left:8px;gap:9px;}
          .dh-busub{display:none;}
          .dh-wideonly{display:none;}
          .dh-bup .dh-play{flex:0 0 auto;min-width:0;font-size:12px;padding:9px 13px;margin-left:4px;}}
        @container (max-width:430px){.dh-stat.opt4{display:none;}}
        .dh-play{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:#e8b43a;color:#1c1e24;font-weight:800;font-size:13px;border-radius:9px;padding:10px 18px;text-decoration:none;border:none;cursor:pointer;transition:background .12s;}
        .dh-play:hover{background:#d49a2a;}
        .dh-ghostD{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid #2a4166;background:transparent;color:#46506a;font-weight:700;font-size:12px;border-radius:9px;padding:9px 14px;text-decoration:none;cursor:pointer;transition:background .12s;}
        .dh-ghostD:hover{background:#eef0f4;}
        /* daily leaderboard: always-visible Today's Top 3 + expand */
        @media(max-width:640px){.dh-dtop{gap:8px 10px;padding:8px 11px;}.dh-dtop-exp{font-size:11px;padding:6px 10px;}}
        /* ── tile board ── */
        .dh-boardwrap{position:relative;background:#ffffff;border:1.5px solid #c3ccda;border-top:none;border-radius:0 0 13px 13px;padding:10px;flex:1 1 auto;display:flex;flex-direction:column;min-height:0;}
        .dh-boardwrap.open{min-height:475px;}
        .dh-board{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;flex:1 1 auto;align-content:stretch;grid-auto-rows:minmax(118px,1fr);}
        /* Tile icon art is normalised to a dark-on-transparent set so it reads on the
       white tile with no plate. warmer, carve and suds resisted the recolour, so
       those three PNGs carry a baked navy plate instead (owner 2026-07-29). */
        .dh-tile{position:relative;overflow:hidden;background:#ffffff;border:1.5px solid #c3ccda;border-radius:11px;padding:10px 8px 9px;text-align:center;cursor:pointer;text-decoration:none;color:#1c1e24;transition:transform .12s,filter .12s,box-shadow .12s;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:0;font-family:inherit;min-height:118px;}
        .dh-tile:hover{transform:translateY(-2px);background:#f7f9fc;box-shadow:0 5px 14px rgba(20,22,28,0.12);}
        .dh-tile.sel{border-color:#a16207;box-shadow:0 0 0 2px #e8b43a;}
        .dh-tile.inprog{background:#fffaeb;}
        .dh-tile.done{background:#f0fdf4;border-color:#1f5537;}
        .dh-acc{position:absolute;top:0;left:0;right:0;height:3px;border-radius:12px 12px 0 0;opacity:.95;}
        .dh-tile.done .dh-acc{background:#22c55e !important;}
        .dh-tic{width:46px;height:30px;display:flex;align-items:center;justify-content:center;flex:none;margin:5px 0 6px;}
        .dh-tic img{height:24px;width:auto;max-width:30px;object-fit:contain;}
        .dh-tnm{font-size:15px;font-weight:800;letter-spacing:-.3px;line-height:1.15;color:#1c1e24;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;}
        .dh-tcat{margin-top:3px;font-family:'DM Mono',ui-monospace,monospace;font-size:9px;letter-spacing:.09em;text-transform:uppercase;border-radius:999px;padding:1px 6px;max-width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}
        .dh-tmeta{display:flex;flex-direction:column;align-items:center;gap:2px;width:100%;min-width:0;margin-top:auto;}
        .dh-mrow{display:flex;align-items:center;justify-content:center;flex-wrap:nowrap;gap:6px;max-width:100%;}
        .dh-nolead{color:#49525f;font-weight:600;}
        .dh-msc{display:inline-flex;align-items:center;gap:3px;font-size:9.5px;font-weight:800;color:#116932;flex:none;}
        .dh-mstrk{display:inline-flex;align-items:center;gap:2px;font-size:9.5px;font-weight:800;color:#8a5300;flex:none;}
        .dh-mstrk.none{color:#4d5872;}
        .dh-mlead{display:flex;align-items:center;justify-content:center;gap:3px;font-size:9.5px;font-weight:700;color:#262b35;min-width:0;max-width:100%;width:100%;}
        .dh-mlead svg{flex:none;color:#a16207;}
        .dh-mlead span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .dh-tdot{position:absolute;top:8px;right:9px;width:7px;height:7px;border-radius:50%;}
        .dh-tsun{position:absolute;top:7px;left:7px;font-family:'DM Mono',ui-monospace,monospace;font-size:8px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#2b1d00;background:#e8b43a;border-radius:3px;padding:0 3px;line-height:1.5;}
        /* ── expand panel (navy, full width) ── */
        /* ── overall daily leaderboard (toggled) ── */
        .dh-lbpanel{background:#ffffff;border:1.5px solid #c3ccda;;border:1px solid #e8c46a;border-radius:12px;padding:16px 16px 14px;margin-bottom:12px;color:#1c1e24;}
        .dsd-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px;}
        .dsd-l{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:#a16207;font-weight:800;}
        .dsd-r{font-size:10.5px;color:#262b35;font-weight:600;}
        .dsd-grid{display:grid;grid-template-columns:320px 1fr;gap:18px;align-items:start;}
        @media(max-width:900px){.dsd-grid{grid-template-columns:1fr;}}
        .dsd-sub{font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#262b35;font-weight:800;margin-bottom:8px;}
        .dsd-cols{display:grid;grid-template-columns:24px 1fr 46px 60px;gap:8px;padding:0 11px 6px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#262b35;}
        .dsd-row{display:grid;grid-template-columns:24px 1fr 46px 60px;gap:8px;align-items:center;padding:8px 11px;margin-bottom:5px;border-radius:10px;background:#fdf3dd;border:1px solid #fdf3dd;}
        .dsd-row.plain{background:#f7f8fa;border-color:#262b35;}
        .dsd-row.me{background:#fdf3dd;border-color:#8a5300;}
        .dsd-rk{font-weight:800;font-size:15px;color:#8a5300;font-variant-numeric:tabular-nums;}
        .dsd-row.plain .dsd-rk{color:#262b35;}
        .dsd-pn{font-size:13.5px;font-weight:500;color:#1c1e24;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .dsd-pn b{color:#a16207;font-weight:700;}
        .dsd-g{font-size:12px;color:#262b35;text-align:right;font-variant-numeric:tabular-nums;font-weight:600;}
        .dsd-tt{font-size:13.5px;font-weight:800;color:#8a5300;text-align:right;font-variant-numeric:tabular-nums;}
        .dsd-tt s{font-size:10px;font-weight:600;color:#262b35;text-decoration:none;}
        .dsd-empty{font-size:12.5px;color:#262b35;font-weight:600;padding:8px 2px;}
        .dsd-row.first{background:#fdf3dd;border-color:#8a5300;}
        .dsd-row.first .dsd-rk{font-size:17px;color:#8a5300;}
        .dsd-row.first .dsd-pn{font-weight:800;font-size:14.5px;color:#8a5300;display:flex;align-items:center;gap:5px;}
        .dsd-row.first .dsd-cr{color:#a16207;flex:none;}
        .dsd-row.first .dsd-tt{font-size:15px;}
        .dsd-past{margin-top:20px;padding-top:16px;border-top:1px solid #eef0f4;}
        .dsd-yest{display:flex;align-items:center;gap:7px;margin-top:6px;padding:7px 11px;border-radius:10px;background:#f7f8fa;border:1px solid #eef0f4;}
        .dsd-yest.top{padding:9px 11px;background:#f7f8fa;border-color:#262b35;}
        .dsd-yest .yl{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#262b35;font-weight:800;flex:none;min-width:56px;}
        .dsd-yest b{min-width:0;font-size:12px;color:#c9d6ee;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .dsd-yest.top b{font-size:13px;color:#1c1e24;font-weight:700;}
        .dsd-yest .yt{margin-left:auto;flex:none;font-size:11.5px;font-weight:700;color:#d8c489;font-variant-numeric:tabular-nums;}
        .dsd-yest.top .yt{font-size:12.5px;font-weight:800;color:#8a5300;}
        .dsd-yest .yt s{font-size:9.5px;font-weight:600;color:#262b35;text-decoration:none;}
        .dsd-yest .ynone{font-size:12px;color:#262b35;font-weight:600;}
        .dsd-hof{display:flex;align-items:center;gap:6px;padding:9px 11px;border-radius:10px;background:#fdf3dd;border:1px solid #e8c46a;color:#8a5300;font-size:12px;font-weight:800;text-decoration:none;transition:background .12s;}
        .dsd-hof:hover{background:#fdf3dd;}
        .dsd-hof svg{color:#a16207;flex:none;}
        .dsd-players{margin-top:9px;font-size:11.5px;color:#262b35;font-weight:600;}
        .dsd-players b{color:#1c1e24;font-size:14px;font-weight:800;font-variant-numeric:tabular-nums;}
        .dsd-players s{color:#262b35;text-decoration:none;font-size:10.5px;}
        .dsd-gt{font-size:11px;font-weight:800;margin-bottom:7px;display:flex;justify-content:space-between;align-items:baseline;text-decoration:none;}
        .dsd-gt span{font-size:9px;color:#262b35;font-weight:600;}
        .dsd-minis{display:grid;grid-template-columns:repeat(5,1fr);gap:9px;}
        @media(max-width:1200px){.dsd-minis{grid-template-columns:repeat(4,1fr);}}
        @media(max-width:900px){.dsd-minis{grid-template-columns:repeat(2,1fr);}}
        .dsd-mini{background:#f7f8fa;border:1px solid #eef0f4;border-radius:11px;padding:10px 11px;}
        .dsd-mr{display:flex;gap:6px;align-items:baseline;font-size:11.5px;padding:2px 0;}
        .dsd-k{width:11px;font-weight:800;color:#8a5300;font-variant-numeric:tabular-nums;flex:0 0 auto;}
        .dsd-n2{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#1c1e24;font-weight:500;}
        .dsd-n2 b{color:#a16207;font-weight:700;}
        .dsd-p{color:#262b35;font-variant-numeric:tabular-nums;font-weight:600;font-size:10.5px;}
        .dsd-none{color:#262b35;font-size:10.5px;padding:2px 0;}
        /* ── responsive ── */
        @media(max-width:1080px){.dh-board{grid-template-columns:repeat(5,minmax(0,1fr));}}
        @media(max-width:940px){.dh-bup{border-left:none;padding-left:4px;}}
        @media(max-width:860px){.dh-board{grid-template-columns:repeat(4,minmax(0,1fr));}.dh-boardwrap.open{min-height:560px;}}
        @media(max-width:640px){
          .dh-board{grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;grid-auto-rows:minmax(96px,1fr);}
          /* Phones drop the art entirely and spend the space on the name, the
             category and the day's leader instead (owner, 2026-07-29). */
          .dh-tile{padding:10px 5px 9px;border-radius:10px;min-height:96px;}
          .dh-tic{display:none;}
          .dh-tnm{font-size:14.5px;}
          .dh-tcat{font-size:8.5px;padding:1px 7px;margin-top:4px;}
          .dh-tmeta{gap:3px;}
          .dh-msc,.dh-mstrk,.dh-mlead{font-size:10px;}
        }
        @media(max-width:430px){.dh-board{grid-template-columns:repeat(3,minmax(0,1fr));}.dh-tnm{font-size:13px;}.dh-tcat{font-size:8px;}}
        @media(max-width:720px){.dh-boardwrap.open{min-height:620px;}}
        /* Small screens: the expanded panel is IN FLOW (see DailyTilePanel), so
           the grid hides beneath it and the wrapper takes the panel's own
           height. No min-height floor, no overlay, no nested scroller: the page
           scrolls normally wherever you drag. */
        @media(max-width:980px){
          .dh-boardwrap.open{min-height:0;}
          .dhome.open .dh-sbar{display:none;}
          .dhome.open .dh-boardwrap{display:none;}
        }
        /* Mobile "Your day" bar (owner 2026-07-29): the Play button was 68x35 and
           stopped 2px short of the tile grid, because .dh-sbar uses 12px side
           padding where .dh-boardwrap uses 10px. Matching the padding puts the
           button's right edge exactly on the grid's, and margin-left:auto anchors
           it there rather than letting it hug the leaderboard text. Selector matches the
           @container rule's .dh-bup .dh-play specificity, since a bare .dh-play loses
           to it regardless of source order. */
        @media(max-width:640px){
          .dh-sbar{padding-left:10px;padding-right:10px;}
          .dh-bup .dh-play{margin-left:auto;flex:0 0 auto;font-size:13.5px;padding:12px 18px;min-width:96px;}
          /* The wider button leaves the eyebrow 95px; at 9px/.09em it needs 119
             and, since .dh-bue is overflow:visible, it spilled under the button
             rather than truncating. 7.5px/.02em needs 89. Ellipsis is a safety net
             for the longer Sunday Edition variant of this label. */
          .dh-bue{font-size:7.5px;letter-spacing:.02em;overflow:hidden;text-overflow:ellipsis;}
        }
      `}</style>

      {/* Stats bar. This is welded directly onto the grid below (rounded top
          corners only, no margin), and the filters live inside it, so nothing
          sits between the bar and the tiles. */}
      <div className="dh-sbar">
        <div className="dh-stats">
          <div className="dh-statlead"><span>Your</span><span>day:</span></div>
          <div className="dh-stat g"><b>{n}/{GAMES.length}</b><span>Completed</span></div>
          {todayXp != null ? <div className="dh-stat iq opt4"><b>{todayXp.toLocaleString()}</b><span>IQ Points</span></div> : null}
          {board && board.me ? <div className="dh-stat opt3"><b>#{board.me.rank}</b><span>Daily rank</span></div> : null}
          {dayStreak >= 2 ? <div className="dh-stat y opt4"><b>{dayStreak}</b><span>Day streak</span></div> : null}
        </div>
        <div className="dh-bup">
          {easiest ? (
            <>
              <img src={easiest.game.img} alt="" aria-hidden="true" />
              <div className="dh-bupt">
                <div className="dh-bue">
                  Easiest leaderboard
                  {isSunday && !allSundayEditions && hasSundayEdition(easiest.game.key) ? ` · ${SUNDAY_SHORT}` : ''}
                </div>
                <div className="dh-bun">{easiest.game.name}</div>
                <div className="dh-busub">
                  {easiest.players != null
                    ? `Only ${easiest.players.toLocaleString()} ${easiest.players === 1 ? 'player' : 'players'} today`
                    : easiest.game.tag}
                </div>
              </div>
              <a href={easiest.game.href} className="dh-play">
                <Play size={11} fill="#1c1e24" strokeWidth={0} />{inprog.has(easiest.game.key) ? 'Resume' : 'Play'}
              </a>
            </>
          ) : (
            <>
              <Trophy size={22} color="#e8b43a" strokeWidth={2.2} />
              <div className="dh-bupt">
                <div className="dh-bue">Clean sweep</div>
                <div className="dh-bun">All {GAMES.length} done</div>
              </div>
              <a href="/daily" className="dh-ghostD"><Clock size={11} strokeWidth={2.4} />Archive</a>
            </>
          )}
        </div>
      </div>

      {/* overall daily leaderboard (toggled) */}
      {hasBoard && lbOpen ? (
        <div className="dh-lbpanel">
          <div className="dsd-head">
            <span className="dsd-l">Daily Leaderboard</span>
            <span className="dsd-r">Best {bestN} of {gameCount} · {maxTotal} pts max · resets at midnight</span>
          </div>
          <div className="dsd-grid">
            <div>
              <div className="dsd-sub">Overall · Top 3</div>
              <div className="dsd-cols"><span>#</span><span>Player</span><span style={{ textAlign: 'right' }}>Games</span><span style={{ textAlign: 'right' }}>Total</span></div>
              {top3.length ? top3.map((r) => {
                const mine = meKey && r.userKey === meKey;
                return (
                  <div key={r.userKey} className={`dsd-row${r.rank === 1 ? ' first' : ''}${mine ? ' me' : ''}`}>
                    <span className="dsd-rk">{r.rank}</span>
                    <span className="dsd-pn">{r.rank === 1 ? <Crown className="dsd-cr" size={13} /> : null}{r.username || 'Player'}{mine ? <b> (you)</b> : ''}</span>
                    <span className="dsd-g">{r.gamesPlayed}/{gameCount}</span>
                    <span className="dsd-tt">{fmtPts(r.total)}<s>/{maxTotal}</s></span>
                  </div>
                );
              }) : <div className="dsd-empty">No daily scores yet today. Be the first.</div>}
              {meKey && board.me && !meShown ? (
                <div className="dsd-row me" style={{ marginTop: 7 }}>
                  <span className="dsd-rk">{board.me.rank}</span>
                  <span className="dsd-pn">{board.me.username || 'You'} <b>(you)</b></span>
                  <span className="dsd-g">{board.me.gamesPlayed}/{gameCount}</span>
                  <span className="dsd-tt">{fmtPts(board.me.total)}<s>/{maxTotal}</s></span>
                </div>
              ) : null}
              <a href="/daily" className="dsd-gt" style={{ marginTop: 11, color: '#8a5300' }}>Full standings &amp; game boards →</a>
              {uniquePlayers != null ? (
                <div className="dsd-players" style={{ marginTop: 2 }}><b>{uniquePlayers.toLocaleString()}</b> {uniquePlayers === 1 ? 'player' : 'players'} today <s>· guests included</s></div>
              ) : null}
              <div className="dsd-past">
                <a href="/quizzes/hub?tab=daily&section=champions" className="dsd-hof"><Trophy size={12} /> Hall of Fame →</a>
                <div className="dsd-sub" style={{ marginTop: 13 }}>Recent Champions</div>
                {hist === null ? (
                  <div className="dsd-empty">Loading…</div>
                ) : hist.length ? hist.map((d, i) => (
                  <div key={d.date || i} className={`dsd-yest${i === 0 ? ' top' : ''}`}>
                    <Crown size={i === 0 ? 13 : 11} style={{ color: i === 0 ? '#e8b43a' : '#8d7c52', flex: 'none' }} />
                    <span className="yl">{i === 0 ? 'Yesterday' : d.label}</span>
                    {d.winner ? (
                      <>
                        <b>{d.winner.username || 'Champion'}</b>
                        <span className="yt">{fmtPts(d.winner.total)}<s>/{d.maxTotal}</s></span>
                      </>
                    ) : (
                      <span className="ynone">No champion</span>
                    )}
                  </div>
                )) : <div className="dsd-empty">No champions yet.</div>}
              </div>
            </div>
            <div>
              <div className="dsd-sub">Each Game · Top 3</div>
              <div className="dsd-minis">
                {sortByDailyOrder(bgames, dailyOrder).map((g) => {
                  const t3 = (g.board || []).slice(0, 3);
                  const acc = ACCENTS[g.key] || '#8a5300';
                  return (
                    <div key={g.key} className="dsd-mini">
                      <a href={g.href || `/${g.key}`} className="dsd-gt" style={{ color: acc }}>{NAME_BY_KEY[g.key] || g.key} →<span>top 3</span></a>
                      {t3.length ? t3.map((r, i) => {
                        const mine = meKey && r.userKey === meKey;
                        return (
                          <div key={r.userKey || i} className="dsd-mr"><span className="dsd-k">{i + 1}</span><span className="dsd-n2">{r.username || 'Player'}{mine ? <b> (you)</b> : ''}</span><span className="dsd-p">{fmtPts(r.points)}</span></div>
                        );
                      }) : <div className="dsd-none">No scores yet</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* tile board. The expand panel is absolutely positioned over the whole
          console (see below), so opening a tile covers this rather than
          displacing it. */}
      <div className={'dh-boardwrap' + (selGame ? ' open' : '')}>
        <div className="dh-board" role="navigation" aria-label="Daily puzzles" aria-hidden={selGame ? 'true' : undefined}>
          {renderTiles(list, false)}
        </div>
      </div>
      {/* The panel is a child of .dhome, not of the board, so it covers the
          stats bar as well as the grid: one expanded console, one Play button
          (owner, 2026-07-29). */}
      {selGame ? renderPanel(selGame) : null}
    </div>
  );
}



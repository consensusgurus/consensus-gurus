'use client';

// Daily Puzzles home block. REDESIGN (owner-approved mockup, 2026-07-28,
// "three columns, expanding game tiles" — Stage 1 of the quiz-home redesign):
// the old horizontal strip becomes a paper-and-ink TILE BOARD. An UP NEXT hero
// (navy block) sits on top; a filter row (All / Unplayed / Streak at risk) plus
// a "Daily leaderboard" toggle sits below it; then a white-tile grid of every
// daily. Clicking a tile expands it IN PLACE as an overlay: DailyTilePanel is
// rendered absolutely inside .dh-boardwrap, covering the grid rather than
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
// (#0e1d40) as a material for the hero + expand panel, gold (#e8b43a) reserved
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
const ACCENTS = { crux: '#5b9bff', emcee: '#e879f9', garble: '#f0c95a', links: '#4ca878', span: '#e06aa0', dating: '#a483f0', tally: '#4cb377', suds: '#f0894c', circa: '#38b6cf', extra: '#e06a6a', carve: '#a483f0', stet: '#41b1e8', outwit: '#c3cfe3', tuck: '#e0a568', alibi: '#ef8896', cipher: '#3fc9b8', ping: '#4cb3f0', warmer: '#f3705c', jester: '#a78bfa', outrank: '#8b8af5', sworn: '#f472b6', shards: '#2dd4bf', hearsay: '#c4b5fd', venn: '#e0a568', stands: '#6aa3ff', bracket: '#f0894c', lode: '#e0b34c', etch: '#8fbf5a', hedge: '#4cc0d4', listed: '#e07ad0', axiom: '#3fc9b8' };
// Saturated one-color-per-game identity for the tile accent + expand panel
// (the "one saturated color per game" system used on the live game pages).
const TCOL = { crux: '#2563eb', emcee: '#c026d3', shards: '#0d9488', garble: '#8a6d1a', links: '#166534', span: '#9d174d', dating: '#6d28d9', tally: '#15803d', suds: '#ea580c', carve: '#7c3aed', extra: '#b91c1c', stet: '#0369a1', outwit: '#1f2937', outrank: '#4338ca', tuck: '#92400e', alibi: '#8b1e2d', cipher: '#0f766e', ping: '#0284c7', warmer: '#dc2626', jester: '#7c3aed', sworn: '#be185d', axiom: '#0f766e', hearsay: '#5b21b6', venn: '#b45309', stands: '#1d4ed8', bracket: '#c2410c', lode: '#a16207', etch: '#4d7c0f', hedge: '#0891b2', listed: '#86198f' };
const tcol = (k) => TCOL[k] || '#2563eb';

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
  const [sel, setSel] = useState(null); // selected game key (expanded tile), or null
  const [lbOpen, setLbOpen] = useState(false); // overall daily leaderboard toggle
  const [filter, setFilter] = useState('all'); // all | todo | risk
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

  const nextLead = nextGame && hasBoard && byKey[nextGame.key] && byKey[nextGame.key].board && byKey[nextGame.key].board[0] ? byKey[nextGame.key].board[0] : null;

  // The player's row on a game's per-game board (their score/rank today).
  const myRow = (key) => {
    if (!meKey) return null;
    const b = byKey[key] && byKey[key].board;
    if (!b) return null;
    return b.find((x) => x && x.userKey === meKey) || null;
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
  const todoCount = GAMES.filter((g) => !done.has(g.key)).length;
  const riskCount = GAMES.filter((g) => !done.has(g.key) && (streaks[g.key] || 0) >= 2).length;
  const list = filter === 'todo'
    ? games.filter((g) => !done.has(g.key))
    : filter === 'risk'
      ? games.filter((g) => !done.has(g.key) && (streaks[g.key] || 0) >= 2)
      : games;
  const selGame = sel != null ? list.find((g) => g.key === sel) || games.find((g) => g.key === sel) || null : null;

  const pick = (key) => { setLbOpen(false); setSel((cur) => (cur === key ? null : key)); };
  const chip = (f, label) => (
    <button type="button" className={`dh-chip${filter === f ? ' on' : ''}`} onClick={() => { setFilter(f); setSel(null); }}>{label}</button>
  );

  // ── the per-game expand panel (overlays the board; see DailyTilePanel) ──
  const renderPanel = (g) => {
    const bg = byKey[g.key] || null;
    return (
      <DailyTilePanel
        key={'panel-' + g.key}
        game={g}
        accent={ACCENTS[g.key] || '#5b9bff'}
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

  return (
    <div className="dhome">
      <style>{`
        .dhome{margin-bottom:16px;font-family:'Manrope',system-ui,-apple-system,sans-serif;}
        /* ── Up Next hero (navy block) ── */
        .dh-hero{display:flex;align-items:center;gap:15px;background:#0e1d40;border:1px solid #0e1d40;border-radius:14px;padding:15px 18px;color:#eef3fb;margin-bottom:12px;}
        .dh-hero-ic{flex:none;width:52px;height:52px;border-radius:12px;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;}
        .dh-hero-ic img{height:36px;width:auto;max-width:44px;object-fit:contain;}
        .dh-hero-mid{flex:1;min-width:0;}
        .dh-eyebrow{font-size:10.5px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#e8b43a;display:flex;align-items:center;gap:7px;flex-wrap:wrap;}
        .dh-hero-nm{font-size:20px;font-weight:800;margin-top:1px;display:flex;align-items:center;gap:8px;letter-spacing:-.2px;}
        .dh-hero-tag{font-size:12px;color:#93a3bd;font-weight:600;margin-top:1px;}
        .dh-hflame{display:inline-flex;align-items:center;gap:3px;background:rgba(232,180,58,0.14);border:1px solid rgba(232,180,58,0.4);border-radius:999px;padding:1px 7px;font-size:10.5px;font-weight:800;color:#e8b43a;}
        .dh-hflame svg{flex:none;}
        .dh-hero-cta{flex:none;display:flex;align-items:center;gap:8px;}
        .dh-progress{flex:none;display:flex;flex-direction:column;gap:5px;min-width:118px;max-width:150px;}
        .dh-progtxt{font-size:10.5px;font-weight:700;color:#93a3bd;}
        .dh-progtxt b{color:#34d399;font-weight:800;}
        .dh-bar{height:6px;border-radius:99px;background:rgba(255,255,255,0.14);overflow:hidden;}
        .dh-bar>i{display:block;height:100%;background:#34d399;border-radius:99px;transition:width .4s ease;}
        .dh-play{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:#e8b43a;color:#1c1e24;font-weight:800;font-size:13px;border-radius:9px;padding:10px 18px;text-decoration:none;border:none;cursor:pointer;transition:background .12s;}
        .dh-play:hover{background:#d49a2a;}
        .dh-ghostD{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid #2a4166;background:transparent;color:#c3d2e8;font-weight:700;font-size:12px;border-radius:9px;padding:9px 14px;text-decoration:none;cursor:pointer;transition:background .12s;}
        .dh-ghostD:hover{background:rgba(255,255,255,0.06);}
        /* ── filter row ── */
        .dh-filters{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:11px;}
        .dh-lab{font-family:'DM Mono',ui-monospace,monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:#8b909d;font-weight:500;}
        .dh-chip{border:1px solid #cfd4de;background:#fff;color:#1c1e24;font-weight:700;font-size:12px;border-radius:9px;padding:7px 13px;cursor:pointer;font-family:inherit;transition:background .12s,border-color .12s;}
        .dh-chip:hover{border-color:#0e1d40;}
        .dh-chip.on{background:#0e1d40;color:#fff;border-color:#0e1d40;}
        .dh-hint{font-family:'DM Mono',ui-monospace,monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#8b909d;margin-left:auto;}
        /* daily leaderboard: always-visible Today's Top 3 + expand */
        .dh-dtop{display:flex;align-items:center;gap:9px 13px;flex-wrap:wrap;background:#fff;border:1px solid rgba(20,22,28,0.09);border-radius:12px;padding:9px 13px;margin-bottom:11px;}
        .dh-dtop-lab{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:800;color:#a16207;flex:none;}
        .dh-dtop-lab svg{color:#e8b43a;flex:none;}
        .dh-dtop-rows{display:flex;align-items:center;gap:7px;flex-wrap:wrap;min-width:0;}
        .dh-dtop-row{display:inline-flex;align-items:baseline;gap:5px;font-size:12px;background:#f7f8fa;border:1px solid rgba(20,22,28,0.07);border-radius:8px;padding:3px 9px;max-width:100%;}
        .dh-dtop-row b{color:#a16207;font-weight:800;font-variant-numeric:tabular-nums;}
        .dh-dtop-row .nm{font-weight:700;color:#1c1e24;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:130px;}
        .dh-dtop-row .pt{font-weight:700;color:#6b7280;font-variant-numeric:tabular-nums;}
        .dh-dtop-row.me{background:#fdf7ec;border-color:#f0dcae;}
        .dh-dtop-row.me .nm{color:#a16207;}
        .dh-dtop-none{font-size:12px;color:#6b7280;font-weight:600;}
        .dh-dtop-exp{margin-left:auto;display:inline-flex;align-items:center;gap:5px;border:1px solid #f0dcae;background:#fdf7ec;color:#a16207;font-weight:800;font-size:12px;border-radius:9px;padding:7px 13px;cursor:pointer;font-family:inherit;transition:background .12s;}
        .dh-dtop-exp:hover{background:#faedd2;}
        .dh-dtop-exp svg{flex:none;color:#e8b43a;}
        @media(max-width:640px){.dh-dtop{gap:8px 10px;padding:8px 11px;}.dh-dtop-exp{font-size:11px;padding:6px 10px;}}
        /* ── tile board ── */
        .dh-boardwrap{position:relative;}
        .dh-boardwrap.open{min-height:475px;}
        .dh-board{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:9px;}
        /* navy game tiles (owner 2026-07-29): the icon art was drawn for a navy
           field, so the whole tile is navy and the icon renders directly on it. */
        .dh-tile{position:relative;overflow:hidden;background:#0e1d40;border:1px solid #223353;border-radius:12px;padding:12px 8px 10px;text-align:center;cursor:pointer;text-decoration:none;color:#eef3fb;transition:transform .12s,border-color .12s,box-shadow .12s,background .12s;display:flex;flex-direction:column;align-items:center;gap:5px;font-family:inherit;}
        .dh-tile:hover{border-color:#3a557f;background:#13264c;transform:translateY(-2px);box-shadow:0 6px 16px rgba(6,12,26,0.45);}
        .dh-tile.sel{border-color:#e8b43a;box-shadow:0 0 0 2px #e8b43a;}
        .dh-tile.done{background:#0c2a1e;border-color:#245c3d;}
        .dh-tile.done:hover{background:#0f351f;}
        .dh-acc{position:absolute;top:0;left:0;right:0;height:3px;border-radius:12px 12px 0 0;opacity:.95;}
        .dh-tile.done .dh-acc{background:#22c55e !important;}
        .dh-tic{width:44px;height:38px;display:flex;align-items:center;justify-content:center;flex:none;}
        .dh-tic img{height:30px;width:auto;max-width:40px;object-fit:contain;}
        .dh-tile.done .dh-tic{opacity:.6;}
        .dh-tnm{font-size:12.5px;font-weight:800;letter-spacing:-.2px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;}
        .dh-tsub{font-size:10px;font-weight:700;color:#93a3bd;display:inline-flex;align-items:center;gap:3px;}
        .dh-tsub.done{color:#6ee7b7;}
        .dh-tsub.strk{color:#f0c95a;}
        .dh-tsub svg{flex:none;}
        .dh-tdot{position:absolute;top:8px;right:9px;width:7px;height:7px;border-radius:50%;}
        .dh-tsun{position:absolute;top:7px;left:7px;font-family:'DM Mono',ui-monospace,monospace;font-size:8px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#2b1d00;background:#e8b43a;border-radius:3px;padding:0 3px;line-height:1.5;}
        .dh-lead{font-size:10px;font-weight:700;color:#c3d2e8;display:inline-flex;align-items:center;gap:3px;max-width:100%;}
        .dh-lead svg{flex:none;color:#e8b43a;}
        .dh-lead span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        /* ── expand panel (navy, full width) ── */
        /* ── overall daily leaderboard (toggled) ── */
        .dh-lbpanel{background:#0b1733;border:1px solid rgba(232,180,58,0.28);border-radius:12px;padding:16px 16px 14px;margin-bottom:12px;color:#eef3fb;}
        .dsd-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px;}
        .dsd-l{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:#e8b43a;font-weight:800;}
        .dsd-r{font-size:10.5px;color:#93a7cc;font-weight:600;}
        .dsd-grid{display:grid;grid-template-columns:320px 1fr;gap:18px;align-items:start;}
        @media(max-width:900px){.dsd-grid{grid-template-columns:1fr;}}
        .dsd-sub{font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#8fa3cf;font-weight:800;margin-bottom:8px;}
        .dsd-cols{display:grid;grid-template-columns:24px 1fr 46px 60px;gap:8px;padding:0 11px 6px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#93a7cc;}
        .dsd-row{display:grid;grid-template-columns:24px 1fr 46px 60px;gap:8px;align-items:center;padding:8px 11px;margin-bottom:5px;border-radius:10px;background:rgba(232,180,58,.08);border:1px solid rgba(232,180,58,.22);}
        .dsd-row.plain{background:rgba(255,255,255,.045);border-color:rgba(255,255,255,.09);}
        .dsd-row.me{background:rgba(232,180,58,.16);border-color:rgba(232,180,58,.55);}
        .dsd-rk{font-weight:800;font-size:15px;color:#f5d878;font-variant-numeric:tabular-nums;}
        .dsd-row.plain .dsd-rk{color:#93a7cc;}
        .dsd-pn{font-size:13.5px;font-weight:500;color:#eaf0fb;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .dsd-pn b{color:#e8b43a;font-weight:700;}
        .dsd-g{font-size:12px;color:#93a7cc;text-align:right;font-variant-numeric:tabular-nums;font-weight:600;}
        .dsd-tt{font-size:13.5px;font-weight:800;color:#f5d878;text-align:right;font-variant-numeric:tabular-nums;}
        .dsd-tt s{font-size:10px;font-weight:600;color:#6a80a8;text-decoration:none;}
        .dsd-empty{font-size:12.5px;color:#93a7cc;font-weight:600;padding:8px 2px;}
        .dsd-row.first{background:rgba(232,180,58,.2);border-color:rgba(232,180,58,.55);}
        .dsd-row.first .dsd-rk{font-size:17px;color:#f5d878;}
        .dsd-row.first .dsd-pn{font-weight:800;font-size:14.5px;color:#f5d878;display:flex;align-items:center;gap:5px;}
        .dsd-row.first .dsd-cr{color:#e8b43a;flex:none;}
        .dsd-row.first .dsd-tt{font-size:15px;}
        .dsd-past{margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,.10);}
        .dsd-yest{display:flex;align-items:center;gap:7px;margin-top:6px;padding:7px 11px;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);}
        .dsd-yest.top{padding:9px 11px;background:rgba(255,255,255,.045);border-color:rgba(255,255,255,.09);}
        .dsd-yest .yl{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#8fa3cf;font-weight:800;flex:none;min-width:56px;}
        .dsd-yest b{min-width:0;font-size:12px;color:#c9d6ee;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .dsd-yest.top b{font-size:13px;color:#eaf0fb;font-weight:700;}
        .dsd-yest .yt{margin-left:auto;flex:none;font-size:11.5px;font-weight:700;color:#d8c489;font-variant-numeric:tabular-nums;}
        .dsd-yest.top .yt{font-size:12.5px;font-weight:800;color:#f5d878;}
        .dsd-yest .yt s{font-size:9.5px;font-weight:600;color:#6a80a8;text-decoration:none;}
        .dsd-yest .ynone{font-size:12px;color:#6a80a8;font-weight:600;}
        .dsd-hof{display:flex;align-items:center;gap:6px;padding:9px 11px;border-radius:10px;background:rgba(232,180,58,.1);border:1px solid rgba(232,180,58,.32);color:#f5d878;font-size:12px;font-weight:800;text-decoration:none;transition:background .12s;}
        .dsd-hof:hover{background:rgba(232,180,58,.2);}
        .dsd-hof svg{color:#e8b43a;flex:none;}
        .dsd-players{margin-top:9px;font-size:11.5px;color:#93a7cc;font-weight:600;}
        .dsd-players b{color:#eaf0fb;font-size:14px;font-weight:800;font-variant-numeric:tabular-nums;}
        .dsd-players s{color:#6a80a8;text-decoration:none;font-size:10.5px;}
        .dsd-gt{font-size:11px;font-weight:800;margin-bottom:7px;display:flex;justify-content:space-between;align-items:baseline;text-decoration:none;}
        .dsd-gt span{font-size:9px;color:#6a80a8;font-weight:600;}
        .dsd-minis{display:grid;grid-template-columns:repeat(5,1fr);gap:9px;}
        @media(max-width:1200px){.dsd-minis{grid-template-columns:repeat(4,1fr);}}
        @media(max-width:900px){.dsd-minis{grid-template-columns:repeat(2,1fr);}}
        .dsd-mini{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:11px;padding:10px 11px;}
        .dsd-mr{display:flex;gap:6px;align-items:baseline;font-size:11.5px;padding:2px 0;}
        .dsd-k{width:11px;font-weight:800;color:#f5d878;font-variant-numeric:tabular-nums;flex:0 0 auto;}
        .dsd-n2{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#eaf0fb;font-weight:500;}
        .dsd-n2 b{color:#e8b43a;font-weight:700;}
        .dsd-p{color:#93a7cc;font-variant-numeric:tabular-nums;font-weight:600;font-size:10.5px;}
        .dsd-none{color:#6a80a8;font-size:10.5px;padding:2px 0;}
        /* ── responsive ── */
        @media(max-width:1080px){.dh-board{grid-template-columns:repeat(5,minmax(0,1fr));}}
        @media(max-width:860px){.dh-board{grid-template-columns:repeat(4,minmax(0,1fr));}.dh-boardwrap.open{min-height:560px;}}
        @media(max-width:640px){
          .dh-hero{flex-wrap:wrap;gap:11px 14px;padding:13px 14px;}
          .dh-hero-mid{flex:1 1 60%;}
          .dh-progress{order:3;flex:1 1 100%;flex-direction:row;align-items:center;max-width:none;}
          .dh-progress .dh-bar{flex:1;}
          .dh-hero-cta{order:2;margin-left:auto;}
          .dh-board{grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;}
          .dh-tile{padding:11px 5px 9px;border-radius:11px;}
          .dh-tic{width:40px;height:34px;}
          .dh-tic img{height:23px;}
          .dh-tnm{font-size:11px;}
          .dh-filters{gap:6px;}
          .dh-chip{font-size:11px;padding:6px 10px;}
          .dh-hint{display:none;}
        }
        @media(max-width:430px){.dh-board{grid-template-columns:repeat(3,minmax(0,1fr));}}
        @media(max-width:720px){.dh-boardwrap.open{min-height:620px;}}
      `}</style>

      {/* Up Next hero */}
      {nextGame ? (
        <div className="dh-hero">
          <span className="dh-hero-ic"><img src={nextGame.img} alt="" aria-hidden="true" /></span>
          <div className="dh-hero-mid">
            <div className="dh-eyebrow">
              {inprog.has(nextGame.key) ? 'Pick it back up' : 'Up next'} · {nextGame.cat}{left > 0 ? ` · ${left} left` : ''}
              {isSunday && !allSundayEditions && hasSundayEdition(nextGame.key) ? <span className="dh-tsun" style={{ position: 'static' }}>{SUNDAY_SHORT}</span> : null}
            </div>
            <div className="dh-hero-nm">
              {nextGame.name}
              {streaks[nextGame.key] >= 2 ? <span className="dh-hflame"><Flame size={11} strokeWidth={2.6} />{streaks[nextGame.key]}</span> : null}
            </div>
            <div className="dh-hero-tag">{nextGame.tag}{nextLead ? ` · Leader: ${nextLead.username || 'Player'}` : ''}</div>
          </div>
          <div className="dh-progress">
            <span className="dh-progtxt">You: <b>{n}</b> of {GAMES.length} today</span>
            <span className="dh-bar"><i style={{ width: `${pct}%` }} /></span>
          </div>
          <div className="dh-hero-cta">
            <a href="/daily" className="dh-ghostD">Archive</a>
            <a href={nextGame.href} className="dh-play"><Play size={12} fill="#1c1e24" strokeWidth={0} />{inprog.has(nextGame.key) ? 'Resume' : 'Play'}</a>
          </div>
        </div>
      ) : (
        <div className="dh-hero">
          <span className="dh-hero-ic"><Trophy size={26} color="#e8b43a" strokeWidth={2.2} /></span>
          <div className="dh-hero-mid">
            <div className="dh-eyebrow">Clean sweep · all {GAMES.length} done</div>
            <div className="dh-hero-nm">Nicely done</div>
            <div className="dh-hero-tag">Fresh puzzles drop at midnight ET{resetLbl ? ` · new puzzles in ${resetLbl}` : ''}</div>
          </div>
          <div className="dh-hero-cta"><a href="/daily" className="dh-ghostD"><Clock size={12} strokeWidth={2.4} />Daily archive</a></div>
        </div>
      )}

      {/* Daily leaderboard now lives in the left "Leaderboards" element
          (QuizHomeClient); the board no longer renders it here. */}

      {/* filter row */}
      <div className="dh-filters">
        <span className="dh-lab">Daily puzzles</span>
        {chip('all', `All ${GAMES.length}`)}
        {chip('todo', `Unplayed · ${todoCount}`)}
        {riskCount > 0 ? chip('risk', `Streak at risk · ${riskCount}`) : null}
        <span className="dh-hint">Click a tile for stats</span>
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
              <a href="/daily" className="dsd-gt" style={{ marginTop: 11, color: '#f5d878' }}>Full standings &amp; game boards →</a>
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
                  const acc = ACCENTS[g.key] || '#f5d878';
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

      {/* tile board. The expand panel is absolutely positioned inside this
          wrapper, so opening a tile covers the grid rather than displacing it. */}
      <div className={'dh-boardwrap' + (selGame ? ' open' : '')}>
        <div className="dh-board" role="navigation" aria-label="Daily puzzles" aria-hidden={selGame ? 'true' : undefined}>
          {list.map((g, i) => {
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
                className={`dh-tile${isDone ? ' done' : ''}${sel === g.key ? ' sel' : ''}`}
                onClick={() => pick(g.key)}
                aria-expanded={sel === g.key}
                aria-label={`${g.name} — ${g.tag}${isDone ? ' — done today' : ''}${st ? ` — ${st}-day streak` : ''}`}
              >
                <span className="dh-acc" style={{ background: tcol(g.key) }} aria-hidden="true" />
                <span className="dh-tdot" style={{ background: isDone ? '#16a34a' : (inprog.has(g.key) ? '#e8b43a' : 'transparent') }} aria-hidden="true" />
                {sun ? <span className="dh-tsun" aria-hidden="true">{SUNDAY_SHORT}</span> : null}
                <span className="dh-tic"><img src={g.img} alt="" aria-hidden="true" /></span>
                <span className="dh-tnm">{g.name}</span>
                {isDone ? (
                  <span className="dh-tsub done"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" aria-hidden="true"><path d="M4 12.5 L10 18.5 L20 6" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>{sl || 'Done'}</span>
                ) : st ? (
                  <span className="dh-tsub strk"><Flame size={10} strokeWidth={2.6} />{st} day</span>
                ) : lead ? (
                  <span className="dh-lead"><Crown size={10} /><span>{lead}</span></span>
                ) : (
                  <span className="dh-tsub">Not played</span>
                )}
              </button>
            );
            return tile;
          })}
        </div>
        {selGame ? renderPanel(selGame) : null}
      </div>
    </div>
  );
}

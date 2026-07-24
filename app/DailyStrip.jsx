'use client';

// The unified daily-games tile: one horizontal strip that packages every daily
// into a single card, each game still its own link. A fixed left cap carries the
// DAILY GAMES label, a live progress bar with the played count and the ET reset
// countdown; each cell shows the game's motif + name, and a game finished TODAY
// gets a green wash + a large check watermark but never blocks the click (tap
// through to replay or review). Completion follows the signed-in player across
// devices via /api/quiz/daily-status, with the same-device localStorage
// breadcrumb (sot_<key>_day) driving the first paint. Adding a game to GAMES
// adds it to the strip everywhere it's used.
//
// REDESIGN (owner-approved mockup, 2026-07-23):
// - The cap gains a "You: n of N" count + "resets in Xh Ym" ET countdown under
//   the progress bar. The Today's Top 3 mini-board and Full board expander are
//   unchanged.
// - An UP NEXT hero column sits between the cap and the cells: the player's
//   first unfinished game (display order), its real /games icon, tag, today's
//   leader for that game, and Play now / Play all CTAs. When every game is done
//   it flips to an all-done state. The hero's game is EXCLUDED from the cell
//   grid so the grid stays 2 rows (its slot is taken by the trailing Play-all
//   cell).
// - Each cell carries a 3px top accent bar in the game's ACCENTS color. An
//   UNPLAYED cell keeps its game-leader chip; a FINISHED cell swaps the chip
//   for a RANK-OR-STREAK pill: a green "You #N" when the player finished in that
//   game's top 10 (trophy + "You #1" at the top), otherwise a muted flame
//   "{n} day streak" pill (owner mockup 2026-07-24; streak floors at 1 since
//   completing today always counts). Rank comes from the daily-combined per-game
//   board; the leader chip stays on cells not yet finished.
// - The cell streak badge is the FLAME ICON ONLY (owner 2026-07-23: a 100-day
//   number would eat the cell); the streak NUMBER lives in the desktop hover
//   tip, which also names the game's category above its tagline.
// - Mobile (<=1024px or short landscape): the strip stacks as rows — cap
//   (wordmark + bar + count on line one; on line two ONLY the overall leader
//   plate, given the full width, plus the Full board button — ranks 2-3 are
//   desktop-only, owner ruling 2026-07-23), hero row, then the cells in a
//   2-row horizontally scrolling rail.
// - STREAKS (owner request 2026-07-23): /api/quiz/daily-status now returns
//   per-game consecutive-day streaks (2+ only, today optional so a live streak
//   shows before today's play). Cells wear a small flame badge (top-left,
//   shifting under the Sunday chip when both render) and the hero adds a
//   "keep it alive" streak line for its game.
//
// TWO ROWS (owner ruling 2026-07-18, at 16 games): the cells lay out as a
// 2-row × 10-column grid, and the fixed left cap spans both rows.
//
// LEADERBOARD (optional): pass `board` (the /api/quiz/daily-combined payload)
// and the left cap becomes today's board in miniature — the overall TOP 3
// (rank, name, points) — plus the expand arrow. Expanding grows this SAME
// pill into the detail region with the overall top-5 and every game's top-3.
// Each cell ALSO keeps its own game leader chip (crown + name) while collapsed
// (owner: keep the game-specific leaders alongside the top-3 cap).

import React, { useState, useEffect } from 'react';
import { Crown, ChevronDown, Trophy, Play, Flame, Clock } from 'lucide-react';
import useDailyOrder, { sortByDailyOrder } from './useDailyOrder';
import { hasSundayEdition, isSundayET, SUNDAY_SHORT } from '../lib/sunday-editions';

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
];

const NAME_BY_KEY = GAMES.reduce((m, g) => { m[g.key] = g.name; return m; }, {});
// Navy-legible per-game accents for the mini-board titles (match DailyCombinedLeaderboard).
// Recent Champions list length (yesterday plus the prior days). Kept short so
// the left column never runs past the per-game minis beside it.
const CHAMPION_DAYS = 3;
const ACCENTS = { crux: '#5b9bff', emcee: '#e879f9', garble: '#f0c95a', links: '#4ca878', span: '#e06aa0', dating: '#a483f0', tally: '#4cb377', suds: '#f0894c', circa: '#38b6cf', extra: '#e06a6a', carve: '#a483f0', stet: '#41b1e8', outwit: '#c3cfe3', tuck: '#e0a568', alibi: '#ef8896', cipher: '#3fc9b8', ping: '#4cb3f0', warmer: '#f3705c', jester: '#a78bfa', outrank: '#8b8af5', sworn: '#f472b6', shards: '#2dd4bf' };

function etToday() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

function fmtPts(x) { const v = Math.round(Number(x) * 10) / 10; return Number.isInteger(v) ? String(v) : v.toFixed(1); }

export default function DailyStrip({ board = null }) {
  const [done, setDone] = useState(() => new Set());
  const [inprog, setInprog] = useState(() => new Set());
  const [streaks, setStreaks] = useState({}); // per-game consecutive-day streaks, from daily-status
  const [open, setOpen] = useState(false);
  const [hist, setHist] = useState(null); // recent daily champions, from /api/quiz/daily-history
  // Sunday chip: Sundays (ET) only, and only on games that run a real Sunday
  // Edition. Set after mount so SSR and the first client render agree.
  const [isSunday, setIsSunday] = useState(false);
  useEffect(() => { setIsSunday(isSundayET()); }, []);
  // "resets in Xh Ym" countdown to ET midnight; set after mount (SSR-safe) and
  // refreshed each minute.
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
  // counts as unfinished, so it becomes a Resume target). Its cell is pulled
  // from the grid; the trailing Play-all cell keeps the grid at full slots.
  const nextGame = games.find((g) => !done.has(g.key)) || null;
  const cellGames = nextGame ? games.filter((g) => g.key !== nextGame.key) : games;
  const cellCols = Math.max(1, Math.ceil(cellGames.length / 2));

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
  const top5 = overall.slice(0, 5);
  const top3 = overall.slice(0, 3);
  const meShown = meKey && top3.some((r) => r.userKey === meKey);
  const uniquePlayers = board && typeof board.uniquePlayers === 'number' ? board.uniquePlayers : null;

  const nextLead = nextGame && hasBoard && byKey[nextGame.key] && byKey[nextGame.key].board && byKey[nextGame.key].board[0] ? byKey[nextGame.key].board[0] : null;

  // The player's rank on a game's board (1-based position in the sorted
  // daily-combined per-game board), or null when they aren't in the payload.
  const myRank = (key) => {
    if (!meKey) return null;
    const b = byKey[key] && byKey[key].board;
    if (!b) return null;
    const i = b.findIndex((x) => x && x.userKey === meKey);
    return i >= 0 ? i + 1 : null;
  };

  // Same-device in-progress/finished detection for TODAY via each game's own
  // per-puzzle save (sot_<key>_<num>, crux also _r<rev>), keyed by the puzzle
  // nums the daily-combined payload now carries. Catches started-today games
  // that the day-breadcrumb and server abandon rows miss (owner 2026-07-23:
  // "bring back the in-progress icons").
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

  // Recent champions are only needed once the board is expanded; fetch them
  // lazily on first open so a collapsed homepage visit never pays for it. Capped
  // at CHAMPION_DAYS entries (yesterday plus the two days before it) so the left
  // column never grows taller than the per-game minis on the right.
  useEffect(() => {
    if (!open || !hasBoard || hist !== null) return;
    let alive = true;
    fetch('/api/quiz/daily-history')
      .then((r) => r.json())
      .then((d) => { if (alive && d && Array.isArray(d.history)) setHist(d.history.slice(0, CHAMPION_DAYS)); })
      .catch(() => {});
    return () => { alive = false; };
  }, [open, hasBoard, hist]);

  return (
    <div className="dstrip-wrap">
      <style>{`
        .dstrip-wrap{margin-bottom:14px;}
        .dstrip{display:flex;flex-direction:column;background:#0e1d40;border:1px solid rgba(20,22,28,0.14);border-radius:16px;overflow:hidden;}
        .dstrip.has-board{border-color:rgba(232,180,58,0.4);}
        .dstrip-main{display:flex;}
        .dstrip-main{scrollbar-width:thin;scrollbar-color:rgba(159,176,212,0.45) #0b1733;}
        .dstrip-main::-webkit-scrollbar{height:9px;}
        .dstrip-main::-webkit-scrollbar-track{background:#0b1733;}
        .dstrip-main::-webkit-scrollbar-thumb{background:rgba(159,176,212,0.4);border-radius:99px;border:2px solid #0b1733;}
        .dstrip-main::-webkit-scrollbar-thumb:hover{background:rgba(159,176,212,0.65);}
        .dstrip-main::-webkit-scrollbar-button{display:none;width:0;height:0;}
        .dstrip-cap{flex:0 0 auto;display:flex;flex-direction:column;justify-content:center;gap:5px;padding:12px 16px;background:#0b1733;border-right:1px solid rgba(255,255,255,0.07);min-width:104px;}
        .dstrip-cap.has-top3{min-width:168px;max-width:196px;}
        /* One-line wordmark: DAILY and GAMES share a size/weight (owner, 2026-07-20);
           the eyebrow is now just the gold half of the same line. */
        .dstrip-cap .ttl{display:block;font-size:15px;font-weight:800;letter-spacing:-.1px;line-height:1;color:#fff;white-space:nowrap;text-decoration:none;cursor:pointer;}
        a.dstrip-cap-ttl:hover .lab{color:#ffce6a;}
        a.dstrip-cap-ttl:hover{color:#dfe7f7;}
        .dstrip-cap .ttl .lab{color:#f8b84a;}
        .dstrip-progrow{display:flex;flex-direction:column;gap:3px;margin-top:5px;}
        .dstrip-bar{display:block;height:9px;width:100%;border-radius:99px;background:rgba(255,255,255,0.14);overflow:hidden;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.06);}
        .dstrip-fill{display:block;height:100%;width:0;background:#34d399;border-radius:99px;transition:width .4s ease;}
        .dstrip-count{display:flex;align-items:baseline;justify-content:space-between;gap:6px;font-size:9.5px;font-weight:700;color:#9fb0d4;}
        .dstrip-count b{color:#34d399;font-weight:800;}
        .dstrip-count .rst{color:#6a80a8;font-weight:600;}
        .dstrip-exp{margin-top:2px;align-self:stretch;width:100%;box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:4px;background:rgba(232,180,58,0.14);border:1px solid rgba(232,180,58,0.42);color:#f5d878;font-family:inherit;font-size:9.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;border-radius:7px;padding:3px 8px;cursor:pointer;transition:background .15s;}
        .dstrip-exp:hover{background:rgba(232,180,58,0.24);}
        /* the cap's miniature daily board: today's overall top 3 */
        .dstrip-t3{display:flex;flex-direction:column;gap:2px;margin-top:2px;min-width:0;}
        .dstrip-t3 .t3h{font-size:8.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#8fa3cf;margin-bottom:1px;}
        /* Today's leader gets the space freed by the one-line wordmark: own gold
           plate, crown, larger name and points. Ranks 2-3 stay compact below. */
        .dstrip-t1{display:flex;align-items:center;gap:5px;min-width:0;margin:1px 0 4px;padding:5px 7px;border-radius:9px;background:rgba(232,180,58,0.16);border:1px solid rgba(232,180,58,0.45);}
        /* Crown occupies the same 11px gutter the "2"/"3" numerals sit in, so the
           three rows share one left edge; the points share one right edge. */
        .dstrip-t1 svg{color:#e8b43a;flex:0 0 11px;}
        .dstrip-t1 .nm1{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:800;color:#f5d878;letter-spacing:-.2px;line-height:1.2;}
        .dstrip-t1 .pt1{flex:0 0 auto;font-size:11.5px;font-weight:800;color:#f5d878;font-variant-numeric:tabular-nums;}
        .dstrip-t1.me{background:rgba(232,180,58,0.28);border-color:rgba(232,180,58,0.72);}
        /* padding matches the #1 plate's 7px + 1px border so all three rows line up */
        .dstrip-t3r{display:flex;align-items:baseline;gap:5px;min-width:0;padding:0 8px;font-size:10.5px;font-weight:700;color:#eaf0fb;line-height:1.4;}
        .dstrip-t3r .rk{flex:0 0 11px;text-align:center;font-weight:800;color:#f5d878;font-variant-numeric:tabular-nums;}
        .dstrip-t3r .nm3{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .dstrip-t3r .pt{flex:0 0 auto;font-size:9.5px;color:#93a7cc;font-variant-numeric:tabular-nums;font-weight:600;}
        .dstrip-t3r.me .nm3{color:#f5d878;}
        .dstrip-t3 .t3none{font-size:10.5px;font-weight:600;color:#6a80a8;line-height:1.35;}
        /* UP NEXT hero column: the player's next unfinished game, promoted. */
        .dstrip-hero{flex:0 0 212px;display:flex;flex-direction:column;justify-content:center;gap:7px;padding:12px 15px;background:#13264b;border-right:1px solid rgba(255,255,255,0.09);min-width:0;}
        .dstrip-hero .hd-eb{display:flex;align-items:center;gap:6px;font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#f8b84a;}
        .dstrip-hero .hd-eb .dstrip-sun{position:static;}
        .dstrip-hero .hd-row{display:flex;align-items:center;gap:9px;min-width:0;text-decoration:none;}
        .dstrip-hero .hd-row img{height:36px;width:auto;max-width:44px;object-fit:contain;flex:none;}
        .dstrip-hero .hd-nm{display:block;font-size:18px;font-weight:800;color:#fff;line-height:1.1;letter-spacing:-.2px;}
        .dstrip-hero .hd-tag{display:block;font-size:10px;font-weight:600;color:#9fb0d4;margin-top:2px;}
        .dstrip-hero .hd-meta{display:flex;align-items:center;gap:4px;font-size:10px;font-weight:700;color:#93a7cc;min-width:0;}
        .dstrip-hero .hd-meta svg{color:#e8b43a;flex:none;}
        .dstrip-hero .hd-meta b{color:#eaf0fb;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .dstrip-hero .hd-streak{color:#93a7cc;}
        .dstrip-hero .hd-streak svg{color:#f8b84a;}
        .dstrip-hero .hd-streak b{color:#f5d878;flex:none;}
        .dstrip-hero .hd-ctas{display:flex;gap:6px;}
        .dstrip-hero .hd-play{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;background:#e8b43a;color:#1c1e24;font-size:11.5px;font-weight:800;border-radius:8px;padding:7px 6px;text-decoration:none;transition:background .12s;}
        .dstrip-hero .hd-play:hover{background:#d49a2a;}
        .dstrip-hero .hd-all{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;border:1px solid #2b4270;color:#eaf0fb;font-size:10.5px;font-weight:800;border-radius:8px;padding:7px 6px;text-decoration:none;transition:background .12s;}
        .dstrip-hero .hd-all:hover{background:rgba(91,139,255,0.14);}
        /* game tiles in a 2-row grid; columns scale with the game count, the cap and hero span both rows */
        .dstrip-cells{display:grid;grid-template-columns:repeat(${cellCols},minmax(72px,1fr));grid-auto-rows:1fr;flex:1 1 auto;min-width:0;}
        .dstrip-cell{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:13px 6px 9px;text-decoration:none;border-left:1px solid rgba(255,255,255,0.055);transition:background .12s;}
        .dstrip-cell:nth-child(${cellCols}n+1){border-left:none;}
        .dstrip-cell:nth-child(n+${cellCols + 1}){border-top:1px solid rgba(255,255,255,0.055);}
        .dstrip-cell:hover{background:rgba(91,139,255,0.14);}
        .dstrip-acc{position:absolute;top:0;left:0;right:0;height:3px;opacity:.85;pointer-events:none;}
        .dstrip-cell.done .dstrip-acc{opacity:0;}
        .dstrip-cell img{height:30px;width:auto;max-width:38px;object-fit:contain;}
        .dstrip-cell .nm{font-size:11px;font-weight:800;color:#fff;letter-spacing:-.2px;white-space:nowrap;}
        .dstrip-cell.done img{opacity:.85;}
        .dstrip-cell.done .nm{color:#c9f2df;position:relative;z-index:2;}
        /* completed cell: soft green wash + large check watermark + rank/streak pill (owner mockup 2026-07-24) */
        .dstrip-cell.done{background:linear-gradient(180deg,rgba(52,211,153,0.15),rgba(52,211,153,0.05));}
        .dstrip-cell.done:hover{background:linear-gradient(180deg,rgba(52,211,153,0.22),rgba(52,211,153,0.09));}
        .dstrip-wm{position:absolute;top:9px;left:0;right:0;display:flex;justify-content:center;z-index:1;pointer-events:none;opacity:.9;filter:drop-shadow(0 1px 2px rgba(4,18,31,0.6));}
        .dstrip-pill{margin-top:3px;position:relative;z-index:2;display:inline-flex;align-items:center;gap:3px;font-size:9.5px;font-weight:800;line-height:1;padding:3px 7px;border-radius:99px;white-space:nowrap;}
        .dstrip-pill svg{flex:none;}
        .dstrip-pill.rankp{background:rgba(52,211,153,0.2);border:1px solid rgba(52,211,153,0.5);color:#6ee7b7;}
        .dstrip-pill.rankp svg{color:#6ee7b7;}
        .dstrip-pill.rankp.first{background:rgba(245,216,120,0.18);border-color:rgba(245,216,120,0.55);color:#f5d878;}
        .dstrip-pill.rankp.first svg{color:#f5d878;}
        .dstrip-pill.streakp{background:rgba(148,167,204,0.12);border:1px solid rgba(148,167,204,0.3);color:#b9c6df;}
        .dstrip-pill.streakp svg{color:#f8b84a;}
        .dstrip-sun{position:absolute;top:7px;left:5px;font-family:'DM Mono',ui-monospace,monospace;font-size:8.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#04121f;background:#f8b84a;border-radius:3px;padding:0 3px;line-height:1.5;pointer-events:none;}
        .dstrip-check{position:absolute;top:7px;right:5px;width:16px;height:16px;border-radius:99px;background:#34d399;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px #0e1d40;pointer-events:none;}
        .dstrip-prog{position:absolute;top:7px;right:5px;width:16px;height:16px;border-radius:99px;background:#12233f;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px #0e1d40;pointer-events:none;}
        .dstrip-lead{margin-top:2px;display:flex;align-items:center;gap:3px;max-width:100%;min-width:0;font-size:10px;font-weight:700;color:#eaf0fb;}
        .dstrip-lead svg{color:#e8b43a;flex:none;}
        .dstrip-lead > span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .dstrip-lead.none{color:#6a80a8;font-weight:600;}
        /* active streak badge (2+ consecutive days), top-left corner; shifts
           below the Sunday chip when both render */
        .dstrip-flame{position:absolute;top:7px;left:5px;width:16px;height:16px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;color:#f8b84a;background:rgba(232,180,58,0.13);border:1px solid rgba(232,180,58,0.35);border-radius:99px;pointer-events:none;}
        .dstrip-flame svg{flex:none;}
        .dstrip-flame.shift{top:24px;}
        /* finished cell: the player's rank in that game replaces the leader chip */
        .dstrip-you{margin-top:2px;font-size:10px;font-weight:700;color:#9fb0d4;white-space:nowrap;}
        .dstrip-you b{color:#34d399;font-weight:800;}
        .dstrip-you.first b{color:#f5d878;}
        /* trailing Play-all cell fills the slot freed by the promoted hero game */
        .dstrip-cell.playall .pa-ic{width:30px;height:30px;border-radius:99px;border:1.5px dashed #3a537f;color:#9fb0d4;display:flex;align-items:center;justify-content:center;}
        .dstrip-cell.playall .nm{color:#f5d878;font-size:10px;white-space:normal;text-align:center;line-height:1.3;}
        /* hover blurb: the one-line description fades in over the cell */
        .dstrip-tip{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;gap:2px;align-items:center;justify-content:center;text-align:center;padding:6px 8px;background:rgba(11,23,51,0.96);color:#eaf0fb;font-size:10.5px;font-weight:700;line-height:1.35;opacity:0;transition:opacity .14s ease;pointer-events:none;}
        .dstrip-tip .tip-cat{font-size:8px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#8fa3cf;}
        .dstrip-tip .tip-fl{display:flex;align-items:center;gap:3px;color:#f8b84a;font-size:9.5px;font-weight:800;}
        .dstrip-cell:hover .dstrip-tip,.dstrip-cell:focus-visible .dstrip-tip{opacity:1;}
        @media (hover:none){.dstrip-tip{display:none;}}
        /* expanded detail: attached inside the same pill */
        .dsd{border-top:1px solid rgba(232,180,58,0.28);background:#0b1733;padding:16px 16px 14px;}
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
        /* #1 gets a bolder, slightly larger treatment (same row size, more emphasis) */
        .dsd-row.first{background:rgba(232,180,58,.2);border-color:rgba(232,180,58,.55);}
        .dsd-row.first .dsd-rk{font-size:17px;color:#f5d878;}
        .dsd-row.first .dsd-pn{font-weight:800;font-size:14.5px;color:#f5d878;display:flex;align-items:center;gap:5px;}
        .dsd-row.first .dsd-cr{color:#e8b43a;flex:none;}
        .dsd-row.first .dsd-tt{font-size:15px;}
        /* past champions block: sits below today's board, separated by a clear
           gap + rule so yesterday never reads as part of today's standings. */
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
        /* Hall of Fame link (Daily Champions on the Stat Hub) */
        .dsd-hof{display:flex;align-items:center;gap:6px;padding:9px 11px;border-radius:10px;background:rgba(232,180,58,.1);border:1px solid rgba(232,180,58,.32);color:#f5d878;font-size:12px;font-weight:800;text-decoration:none;transition:background .12s;}
        .dsd-hof:hover{background:rgba(232,180,58,.2);}
        .dsd-hof svg{color:#e8b43a;flex:none;}
        /* today's unique players (guests included) */
        .dsd-players{margin-top:9px;font-size:11.5px;color:#93a7cc;font-weight:600;}
        .dsd-players b{color:#eaf0fb;font-size:14px;font-weight:800;font-variant-numeric:tabular-nums;}
        .dsd-players s{color:#6a80a8;text-decoration:none;font-size:10.5px;}
        .dsd-minis{display:grid;grid-template-columns:repeat(5,1fr);gap:9px;}
        @media(max-width:1200px){.dsd-minis{grid-template-columns:repeat(4,1fr);}}
        @media(max-width:900px){.dsd-minis{grid-template-columns:repeat(2,1fr);}}
        .dsd-mini{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:11px;padding:10px 11px;}
        .dsd-gt{font-size:11px;font-weight:800;margin-bottom:7px;display:flex;justify-content:space-between;align-items:baseline;text-decoration:none;}
        .dsd-gt span{font-size:9px;color:#6a80a8;font-weight:600;}
        .dsd-mr{display:flex;gap:6px;align-items:baseline;font-size:11.5px;padding:2px 0;}
        .dsd-k{width:11px;font-weight:800;color:#f5d878;font-variant-numeric:tabular-nums;flex:0 0 auto;}
        .dsd-n2{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#eaf0fb;font-weight:500;}
        .dsd-n2 b{color:#e8b43a;font-weight:700;}
        .dsd-p{color:#93a7cc;font-variant-numeric:tabular-nums;font-weight:600;font-size:10.5px;}
        .dsd-none{color:#6a80a8;font-size:10.5px;padding:2px 0;}
        /* Stacked layout whenever the wide strip can't fit: narrow widths AND
           short landscape phones. The cap becomes a header row (wordmark + bar +
           count on line one, top-3 chips + expander on line two), the hero
           becomes a full-width row, and the cells keep BOTH rows inside one
           horizontally scrolling rail (grid auto-flow column). This replaces the
           old sticky-cap sideways-scroll layout, and keeps every game reachable
           (the "frozen strip" bug on landscape). */
        @media (max-width:1024px), (max-height:600px){
          .dstrip-main{flex-direction:column;}
          .dstrip-cap{flex-direction:row;flex-wrap:wrap;align-items:center;gap:7px 10px;border-right:none;border-bottom:1px solid rgba(255,255,255,0.07);padding:10px 13px;}
          .dstrip-cap.has-top3{min-width:0;max-width:none;}
          .dstrip-cap .ttl{font-size:14px;}
          .dstrip-progrow{flex:1 1 140px;flex-direction:row;align-items:center;gap:8px;margin-top:0;}
          .dstrip-bar{flex:1 1 auto;width:auto;height:8px;}
          .dstrip-count{flex:none;gap:5px;}
          .dstrip-count .rst{display:none;}
          .dstrip-t3{flex:1 1 65%;flex-direction:row;align-items:center;gap:8px;margin-top:0;overflow:hidden;}
          .dstrip-t3 .t3h{display:none;}
          .dstrip-t3r{display:none;}
          .dstrip-t1{margin:0;padding:5px 10px;flex:1 1 auto;min-width:0;}
          .dstrip-t1 .nm1{font-size:12.5px;}
          .dstrip-exp{margin:0;align-self:auto;width:auto;flex:none;}
          /* mobile hero: TWO columns to keep it short (owner 2026-07-23) —
             left: eyebrow, game identity, leader; right: streak line, then
             Play now and See all stacked. */
          .dstrip-hero{flex:none;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:5px 12px;align-items:center;border-right:none;border-bottom:1px solid rgba(255,255,255,0.09);padding:10px 13px;}
          .dstrip-hero .hd-eb{grid-column:1;grid-row:1;}
          .dstrip-hero .hd-row{grid-column:1;grid-row:2;}
          .dstrip-hero .hd-row img{height:32px;}
          .dstrip-hero .hd-nm{font-size:16px;}
          .dstrip-hero .hd-meta{grid-column:1;grid-row:3;}
          .dstrip-hero .hd-meta.hd-streak{grid-column:2;grid-row:1;justify-content:flex-end;}
          .dstrip-hero .hd-ctas{grid-column:2;grid-row:2 / span 2;flex-direction:column;align-items:stretch;gap:6px;min-width:118px;}
          .dstrip-hero .hd-play,.dstrip-hero .hd-all{flex:none;}
          .dstrip-cells{overflow-x:auto;-webkit-overflow-scrolling:touch;grid-template-columns:none;grid-template-rows:repeat(2,1fr);grid-auto-flow:column;grid-auto-columns:minmax(76px,1fr);min-width:0;}
          .dstrip-cell{border-top:none;border-left:1px solid rgba(255,255,255,0.055);padding:15px 5px 8px;}
          .dstrip-flame.shift{top:24px;}
          .dstrip-cell:nth-child(-n+2){border-left:none;}
          .dstrip-cell:nth-child(10n+1){border-left:1px solid rgba(255,255,255,0.055);}
          .dstrip-cell:first-child{border-left:none;}
          .dstrip-cell:nth-child(n+11){border-top:none;}
          .dstrip-cell:nth-child(2n){border-top:1px solid rgba(255,255,255,0.055);}
          .dstrip-cell img{height:26px;}
          .dstrip-cell .nm{font-size:10px;}
        }
      `}</style>
      <div className={`dstrip${hasBoard ? ' has-board' : ''}`} role="navigation" aria-label="Daily games">
        <div className="dstrip-main">
          <div className={`dstrip-cap${hasBoard ? ' has-top3' : ''}`}>
            <a href="/daily" className="ttl dstrip-cap-ttl" aria-label="All daily games"><span className="lab">Daily</span> Games</a>
            <span className="dstrip-progrow">
              <span className="dstrip-bar"><span className="dstrip-fill" style={{ width: `${pct}%` }} /></span>
              <span className="dstrip-count"><span>You: <b>{n}</b> of {GAMES.length}</span>{resetLbl ? <span className="rst">resets {resetLbl}</span> : null}</span>
            </span>
            {hasBoard ? (
              <span className="dstrip-t3">
                <span className="t3h"><Crown size={8} style={{ display: 'inline', verticalAlign: '-1px', color: '#e8b43a' }} /> Today&rsquo;s Top 3</span>
                {top5.length ? (
                  <>
                    <span className={`dstrip-t1${meKey && top5[0].userKey === meKey ? ' me' : ''}`}>
                      <Crown size={11} strokeWidth={2.4} />
                      <span className="nm1">{top5[0].username || 'Player'}</span>
                      <span className="pt1">{fmtPts(top5[0].total)}</span>
                    </span>
                    {top5.slice(1, 3).map((r) => {
                      const mine = meKey && r.userKey === meKey;
                      return (
                        <span key={r.userKey} className={`dstrip-t3r${mine ? ' me' : ''}`}>
                          <span className="rk">{r.rank}</span>
                          <span className="nm3">{r.username || 'Player'}</span>
                          <span className="pt">{fmtPts(r.total)}</span>
                        </span>
                      );
                    })}
                  </>
                ) : <span className="t3none">No scores yet — be the first.</span>}
              </span>
            ) : null}
            {hasBoard ? (
              <button type="button" className="dstrip-exp" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
                <ChevronDown size={11} strokeWidth={2.6} style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
                {open ? 'Hide' : 'Full board'}
              </button>
            ) : null}
          </div>
          {nextGame ? (
            <div className="dstrip-hero">
              <div className="hd-eb">
                {inprog.has(nextGame.key) ? 'Pick it back up' : 'Up next for you'}{left > 1 ? ` · ${left} left` : ''}
                {isSunday && hasSundayEdition(nextGame.key) ? <span className="dstrip-sun">{SUNDAY_SHORT}</span> : null}
              </div>
              <a href={nextGame.href} className="hd-row" aria-label={`${nextGame.name} — ${nextGame.tag} — up next`}>
                <img src={nextGame.img} alt="" aria-hidden="true" />
                <span><span className="hd-nm">{nextGame.name}</span><span className="hd-tag">{nextGame.tag}</span></span>
              </a>
              {nextLead ? (
                <div className="hd-meta"><Crown size={10} strokeWidth={2.4} /><span>Leader:</span><b>{nextLead.username || 'Player'} · {fmtPts(nextLead.points)}</b></div>
              ) : null}
              {streaks[nextGame.key] >= 2 ? (
                <div className="hd-meta hd-streak"><Flame size={10} strokeWidth={2.4} /><b>{streaks[nextGame.key]}-day streak</b><span>keep it alive</span></div>
              ) : null}
              <div className="hd-ctas">
                <a href={nextGame.href} className="hd-play"><Play size={11} fill="#1c1e24" strokeWidth={0} />{inprog.has(nextGame.key) ? 'Resume' : 'Play now'}</a>
                <a href="/daily" className="hd-all">See all {left}</a>
              </div>
            </div>
          ) : (
            <div className="dstrip-hero">
              <div className="hd-eb"><Trophy size={10} strokeWidth={2.4} /> All {GAMES.length} done today</div>
              <div className="hd-row"><span><span className="hd-nm">Clean sweep</span><span className="hd-tag">Fresh puzzles drop at midnight ET</span></span></div>
              <div className="hd-meta"><Clock size={10} strokeWidth={2.4} /><span>New games in</span><b>{resetLbl || 'midnight ET'}</b></div>
              <div className="hd-ctas"><a href="/daily" className="hd-play">Daily games archive</a></div>
            </div>
          )}
          <div className="dstrip-cells">
            {cellGames.map((g) => {
              const lead = hasBoard && byKey[g.key] && byKey[g.key].board && byKey[g.key].board[0] ? byKey[g.key].board[0].username : null;
              const rk = done.has(g.key) ? myRank(g.key) : null;
              const st = streaks[g.key] >= 2 ? streaks[g.key] : null;
              const sun = isSunday && hasSundayEdition(g.key);
              return (
                <a key={g.key} href={g.href} className={`dstrip-cell${done.has(g.key) ? ' done' : ''}`} title={`${g.name} — ${g.tag}`} aria-label={`${g.name} — ${g.tag}${sun ? ' — Sunday edition' : ''}${done.has(g.key) ? ' — done today' : ''}${!done.has(g.key) && inprog.has(g.key) ? ' — started, not finished' : ''}${st ? ` — ${st}-day streak` : ''} — daily game`}>
                  <span className="dstrip-acc" style={{ background: ACCENTS[g.key] || '#5b9bff' }} aria-hidden="true" />
                  {done.has(g.key) && (
                    <span className="dstrip-wm" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="40" height="40" fill="none"><path d="M4 12.5 L10 18.5 L20 6" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  )}
                  {!done.has(g.key) && inprog.has(g.key) && (
                    <span className="dstrip-prog" aria-hidden="true" title="Started, not finished — resume">
                      <svg viewBox="0 0 12 12" width="11" height="11" fill="none">
                        <circle cx="6" cy="6" r="4" stroke="#6b5a29" strokeWidth="1.8" />
                        <path d="M6 2 A4 4 0 0 1 6 10" stroke="#f8b84a" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </span>
                  )}
                  {sun ? (
                    <span className="dstrip-sun" aria-hidden="true">{SUNDAY_SHORT}</span>
                  ) : null}
                  {st && !done.has(g.key) ? (
                    <span className={`dstrip-flame${sun ? ' shift' : ''}`} aria-hidden="true"><Flame size={10} strokeWidth={2.6} /></span>
                  ) : null}
                  <img src={g.img} alt="" aria-hidden="true" />
                  <span className="nm">{g.name}</span>
                  <span className="dstrip-tip" aria-hidden="true">
                    <span className="tip-cat">{g.cat}</span>
                    <span>{g.tag}</span>
                    {st ? <span className="tip-fl"><Flame size={9} strokeWidth={2.6} />{st}-day streak</span> : null}
                  </span>
                  {!open ? (
                    done.has(g.key) ? (
                      (rk && rk <= 10)
                        ? <span className={`dstrip-pill rankp${rk === 1 ? ' first' : ''}`}>{rk === 1 ? <><Trophy size={9} strokeWidth={2.6} />You #1</> : `You #${rk}`}</span>
                        : <span className="dstrip-pill streakp"><Flame size={9} strokeWidth={2.6} />{Math.max(1, streaks[g.key] || 1)} day streak</span>
                    ) : hasBoard ? (
                      lead ? <span className="dstrip-lead"><Crown size={10} /><span>{lead}</span></span> : <span className="dstrip-lead none">—</span>
                    ) : null
                  ) : null}
                </a>
              );
            })}
            {/* The former "See all" tile is now a real game tile (Shards); every daily game renders in the grid. */}
          </div>
        </div>
        {hasBoard && open ? (
          <div className="dsd">
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
                {/* Full standings sits directly under today's top 3, with the
                    day's player count right beneath it. */}
                <a href="/daily" className="dsd-gt" style={{ marginTop: 11, color: '#f5d878' }}>Full standings &amp; game boards →</a>
                {uniquePlayers != null ? (
                  <div className="dsd-players" style={{ marginTop: 2 }}><b>{uniquePlayers.toLocaleString()}</b> {uniquePlayers === 1 ? 'player' : 'players'} today <s>· guests included</s></div>
                ) : null}
                {/* Past champions: Hall of Fame link on top, then yesterday and
                    the two days before it (CHAMPION_DAYS), so the column stays
                    inside the height of the per-game minis. */}
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
      </div>
    </div>
  );
}

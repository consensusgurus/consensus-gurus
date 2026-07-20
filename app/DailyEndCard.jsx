'use client';

// DailyEndCard — the shared end-of-game result popup for every daily game
// (Crux, Emcee, Garble, Links, Span, Dating, Tally, Suds, Circa, Extra,
// Carve, Stet, Outwit, Tuck, Alibi, Cipher, Ping, Warmer, Jesters, Sworn).
//
// One component, used by all daily clients. It renders, top to bottom:
//   1. a result header — the family type chip, "You finished <Game>", the
//      score/time detail, and the player's standing (this game's rank today,
//      the combined daily-board rank, and how many games are still left);
//   2. three result actions — Play a past <Game>, Leaderboard, and Share Result;
//   3. an "Up next" auto-advance — a 25s countdown ring that opens the closest
//      unplayed game of the SAME family (Crux -> Garble ...), cancelable;
//   4. a "Leaderboard most up for grabs" callout — the daily game with the
//      thinnest field so far, where a podium is easiest today;
//   5. "More of today's games" — the games still to play, grouped by family with
//      color-filled headers, plus a linked "Other quizzes" block.
//
// Each client passes only its result strings + handlers (unchanged API):
//   <DailyEndCard modal self="garble"
//     headline={`${pct}% Complete`}
//     subline={<>Garble #{PUZZLE.num} &middot; {score}/10 &middot; {elapsed}</>}
//     onShare={copyShare} shareLabel={copied ? 'Copied' : 'Share Result'}
//     onReplay={resetGame} onClose={() => setJustWon(false)} />
// The finish accent comes from `self` via GAME_META. To add a game: add it to
// GAME_META (accent) and to DAILY_GAMES (family + tile copy).

import React, { useState, useEffect } from 'react';
import {
  Type, Clock, Globe, Hash, Share2, BarChart3, RotateCcw, Check, X,
  Trophy, Link2, Flag, CalendarCheck, Scale, Grid3x3, LayoutGrid, Newspaper, FlagTriangleRight,
  Pencil, Users, ArrowRight, Puzzle, Fingerprint, KeyRound, Thermometer, Crown,
} from 'lucide-react';
import ReportIssue from './ReportIssue';

const RUST = '#c0392b';

// LAUNCH WINDOW (owner ruling 2026-07-18): brand-new daily games lead the
// "still to play" list for their first FOUR days so players actually meet
// them; after `until` (ET, inclusive) the canonical order resumes. Keep in
// sync with the same pin in app/api/quiz/daily-order/route.js.
const LAUNCH_PIN = { keys: ['jester', 'sworn', 'warmer', 'ping', 'tuck', 'alibi', 'cipher'], until: '2026-07-21' };
function etTodayEC() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const INK = '#1c1e24';
const SLATE = '#46506a';
const FADED = '#6b7280';
const BORD = '#e7eaf1';
const NAVY = '#0e1d40';
const GOLD = '#e8b43a';

// ---- per-game finish accent (keyed by self) --------------------------------
// accent = the game's brand color; used for the primary Share button.
export const GAME_META = {
  crux:   { accent: '#2563eb', badgeBg: '#2563eb', badgeInk: '#fff', Fin: LayoutGrid },
  emcee:  { accent: '#c026d3', badgeBg: '#c026d3', badgeInk: '#fff', Fin: Type },
  garble: { accent: '#b7791f', badgeBg: GOLD, badgeInk: '#5c4a06', Fin: Trophy },
  links:  { accent: '#166534', badgeBg: '#166534', badgeInk: '#fff', Fin: Link2 },
  span:   { accent: '#9d174d', badgeBg: '#9d174d', badgeInk: '#fff', Fin: Flag },
  dating: { accent: '#6d28d9', badgeBg: '#6d28d9', badgeInk: '#fff', Fin: CalendarCheck },
  circa:  { accent: '#0e7490', badgeBg: '#0e7490', badgeInk: '#fff', Fin: Clock },
  extra:  { accent: '#b91c1c', badgeBg: '#b91c1c', badgeInk: '#fff', Fin: Newspaper },
  tally:  { accent: '#15803d', badgeBg: '#15803d', badgeInk: '#fff', Fin: Scale },
  suds:   { accent: '#ea580c', badgeBg: '#ea580c', badgeInk: '#fff', Fin: Grid3x3 },
  carve:  { accent: '#7c3aed', badgeBg: '#7c3aed', badgeInk: '#fff', Fin: LayoutGrid },
  stet:   { accent: '#0369a1', badgeBg: '#0369a1', badgeInk: '#fff', Fin: Pencil },
  outwit: { accent: '#1f2937', badgeBg: '#1f2937', badgeInk: '#e8b43a', Fin: Users },
  tuck:   { accent: '#92400e', badgeBg: '#92400e', badgeInk: '#fff', Fin: Puzzle },
  alibi:  { accent: '#8b1e2d', badgeBg: '#8b1e2d', badgeInk: '#fff', Fin: Fingerprint },
  cipher: { accent: '#0f766e', badgeBg: '#0f766e', badgeInk: '#fff', Fin: KeyRound },
  ping:   { accent: '#0284c7', badgeBg: '#0284c7', badgeInk: '#fff', Fin: Globe },
  warmer: { accent: '#dc2626', badgeBg: '#dc2626', badgeInk: '#fff', Fin: Thermometer },
  jester: { accent: '#7c3aed', badgeBg: '#7c3aed', badgeInk: '#fff', Fin: Crown },
  sworn:  { accent: '#be185d', badgeBg: '#be185d', badgeInk: '#fff', Fin: Scale },
};

// ---- the five families (type label + color shown on each tile/header) -------
export const CAT_META = {
  word:      { name: 'Word',      color: '#2563eb', Icon: Type },
  history:   { name: 'History',   color: '#6d28d9', Icon: Clock },
  geography: { name: 'Geography', color: '#0e7c5a', Icon: Globe },
  numbers:   { name: 'Numbers',   color: '#ea580c', Icon: Hash },
  logic:     { name: 'Logic',     color: '#9f1239', Icon: Fingerprint },
};
// Family render order for the "more games" grid.
const CAT_ORDER = ['word', 'numbers', 'logic', 'history', 'geography'];

// ---- the daily slate (20 games) --------------------------------------------
// Canonical order = the order the "still to play" tiles appear in.
export const DAILY_GAMES = [
  { key: 'crux',   cat: 'word',      name: 'Crux',   tag: 'A clueless crossword',      href: '/crux' },
  { key: 'emcee',  cat: 'word',      name: 'Emcee',  tag: 'The daily mini crossword',  href: '/emcee' },
  { key: 'links',  cat: 'word',      name: 'Links',  tag: 'Four hidden threads',       href: '/links' },
  { key: 'garble', cat: 'word',      name: 'Garble', tag: 'Untangle five words',       href: '/garble' },
  { key: 'stet',   cat: 'word',      name: 'Stet',   tag: 'Spot the error, fix the copy',        href: '/stet' },
  { key: 'tuck',   cat: 'word',      name: 'Tuck',   tag: 'Build your own crossword',  href: '/tuck' },
  { key: 'dating', cat: 'history',   name: 'Dating', tag: 'Put five moments in order', href: '/dating' },
  { key: 'circa',  cat: 'history',   name: 'Circa',  tag: 'Pin the year it happened',  href: '/circa' },
  { key: 'extra',  cat: 'history',   name: 'Extra',  tag: 'Name the redacted front page', href: '/extra' },
  { key: 'span',   cat: 'geography', name: 'Span',   tag: 'Cross the map, border by border', href: '/span' },
  { key: 'ping',   cat: 'geography', name: 'Ping',   tag: 'Find the secret city',        href: '/ping' },
  { key: 'tally',  cat: 'numbers',   name: 'Tally',  tag: 'Balance every row and column', href: '/tally' },
  { key: 'suds',   cat: 'numbers',   name: 'Suds',   tag: 'The daily 9x9 sudoku',      href: '/suds' },
  { key: 'carve',  cat: 'numbers',   name: 'Carve',  tag: 'Carve equal-sum regions',   href: '/carve' },
  { key: 'outwit', cat: 'numbers',   name: 'Outwit', tag: 'Beat the crowd',            href: '/outwit' },
  { key: 'cipher', cat: 'numbers',   name: 'Cipher', tag: 'Crack the letter math',     href: '/cipher' },
  { key: 'alibi',  cat: 'logic',     name: 'Alibi',  tag: 'Solve the nightly whodunit', href: '/alibi' },
  { key: 'jester', cat: 'logic',     name: 'Jesters', tag: 'Seat the court',             href: '/jester' },
  { key: 'sworn',  cat: 'logic',     name: 'Sworn',  tag: 'Spot the liars',             href: '/sworn' },
  { key: 'warmer', cat: 'word',      name: 'Warmer', tag: 'Hotter or colder',           href: '/warmer' },
];

// A small hand-picked set of popular quizzes to keep players on the site once
// they finish the daily slate. Ids are real quiz slugs (/quiz/<id>).
const OTHER_POOL = [
  { id: 'europe-no-outline',               name: 'Countries of Europe',        tag: 'No outline' },
  { id: 'erase-europe-no-outline',         name: 'Erase Europe',               tag: 'No outline, no skips' },
  { id: 'find-the-lower-48-states',        name: 'US States',                  tag: 'No outline' },
  { id: 'countries-by-population',         name: 'Most Populous Countries',    tag: 'Rank by population' },
  { id: 'nyc-landmarks-geo-guesser',       name: 'NYC Landmarks',              tag: 'Geo Guesser' },
  { id: 'largest-cities-world-population',  name: 'Largest Cities in the World', tag: 'By population' },
  { id: 'africa-no-outline',               name: 'Countries of Africa',        tag: 'No outline' },
  { id: 'asia-no-outline',                 name: 'Countries of Asia',          tag: 'No outline' },
  { id: 'south-america-no-outline',        name: 'Countries of South America', tag: 'No outline' },
  { id: 'north-america-no-outline',        name: 'Countries of North America', tag: 'No outline' },
  { id: 'us-states-by-population',         name: 'Most Populous US States',    tag: 'Rank by population' },
  { id: 'countries-of-the-world-no-outline', name: 'Countries of the World',   tag: 'No outline' },
];
const OTHER_COLOR = '#5b6472';

const AUTO_SECONDS = 25;

/**
 * @param self          game key, e.g. "garble"
 * @param headline      node/string, e.g. `${pct}% Complete` (client computes pct)
 * @param subline       node, e.g. <>Garble #{num} · {score}/10 · {elapsed}</>
 * @param onShare / shareLabel   share handler + label
 * @param onReplay      replay handler (unused by the new layout, kept for API compat)
 * @param onClose       closes any celebration modal; run before scroll
 * @param boardId       leaderboard element id to scroll to (default "daily-leaderboard")
 * @param onLeaderboard optional override for the whole close+scroll behavior
 */
export default function DailyEndCard({
  self,
  won = true,
  modal = false,
  headline = 'You scored 100%',
  subline = null,
  answer = null,
  onShare, shareLabel = 'Share Result',
  onReplay,
  onClose,
  boardId = 'daily-leaderboard',
  onLeaderboard,
}) {
  const [dailyMe, setDailyMe] = useState(null);
  const [boardGames, setBoardGames] = useState(null); // per-game field/plays for "most up for grabs"
  const [secs, setSecs] = useState(AUTO_SECONDS);
  const [autoCancel, setAutoCancel] = useState(false);
  const [pastHref, setPastHref] = useState(null); // most-recent unplayed PAST drop of this game

  useEffect(() => {
    let anonId = null, email = null;
    try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
    const qs = new URLSearchParams();
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    let alive = true;
    fetch('/api/quiz/daily-combined?' + qs.toString())
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !d) return;
        if (d.me) setDailyMe({ ...d.me, maxTotal: d.maxTotal, gameCount: d.gameCount });
        if (Array.isArray(d.games)) setBoardGames(d.games);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // Resolve the most-recent unplayed PAST drop of this game so "Play a past" can
  // one-tap straight into it; the button hides when the player has done them all.
  useEffect(() => {
    if (!self) return undefined;
    let anonId = null, email = null;
    try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
    const qs = new URLSearchParams({ game: self });
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    let alive = true;
    fetch('/api/quiz/daily-unplayed?' + qs.toString())
      .then((r) => r.json())
      .then((d) => { if (alive && d && d.href) setPastHref(d.href); })
      .catch(() => {});
    return () => { alive = false; };
  }, [self]);

  const meta = GAME_META[self] || GAME_META.crux;
  const selfGame = DAILY_GAMES.find((g) => g.key === self) || null;
  const selfCat = selfGame ? selfGame.cat : 'word';
  const selfName = selfGame ? selfGame.name : (self || 'today’s game');
  const selfCatMeta = CAT_META[selfCat] || CAT_META.word;
  const headColor = won ? meta.accent : RUST;

  // Which daily games the viewer has completed today. The just-finished game is
  // always checked; dailyMe.perGame fills in every other game already played so
  // the whole day resolves, not just the leaf they came from.
  const completed = new Set();
  if (self) completed.add(self);
  if (dailyMe && dailyMe.perGame) {
    for (const k of Object.keys(dailyMe.perGame)) completed.add(k);
  }
  const total = DAILY_GAMES.length;
  const doneCount = DAILY_GAMES.filter((g) => completed.has(g.key)).length;

  // Still-to-play games, launch-pinned to the front during a new game's window.
  let todo = DAILY_GAMES.filter((g) => !completed.has(g.key));
  if (etTodayEC() <= LAUNCH_PIN.until) {
    todo = [
      ...todo.filter((g) => LAUNCH_PIN.keys.includes(g.key)),
      ...todo.filter((g) => !LAUNCH_PIN.keys.includes(g.key)),
    ];
  }

  // Up next = the closest unplayed game of the SAME family, else the next unplayed.
  const nextTarget = todo.find((g) => g.cat === selfCat) || todo[0] || null;

  // Standing figures (registered players only; guests see the subline instead).
  const gameRank = dailyMe && dailyMe.perGame && dailyMe.perGame[self] ? dailyMe.perGame[self].rank : null;
  const combinedRank = dailyMe ? dailyMe.rank : null;
  const leftToPlay = dailyMe ? Math.max(0, (dailyMe.gameCount || 0) - (dailyMe.gamesPlayed || 0)) : Math.max(0, total - doneCount);

  // Most up for grabs = the daily game with the thinnest field so far (prefer one
  // the viewer hasn't played). field = registered players; plays = total attempts.
  let grab = null;
  if (boardGames && boardGames.length) {
    const unplayed = boardGames.filter((g) => !completed.has(g.key));
    const pool = (unplayed.length ? unplayed : boardGames).slice();
    pool.sort((a, b) => (a.field - b.field) || (a.plays - b.plays));
    const g0 = pool[0];
    const gm = g0 && DAILY_GAMES.find((x) => x.key === g0.key);
    if (g0 && gm) grab = { ...gm, field: g0.field || 0, plays: g0.plays || 0, href: g0.href || gm.href };
  }

  // 25s auto-advance to the next game (win only; a loss shows the block without
  // the ticking clock so the player can retry or read the board first).
  const autoRun = won && !!nextTarget && !autoCancel;
  useEffect(() => {
    if (!autoRun) return undefined;
    if (secs <= 0) {
      if (typeof window !== 'undefined') window.location.href = nextTarget.href;
      return undefined;
    }
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [autoRun, secs, nextTarget]);

  // Leaderboard: close the popup, then smooth-scroll to the board below the card.
  const goBoard = () => {
    if (onLeaderboard) { onLeaderboard(); return; }
    if (onClose) onClose();
    if (typeof document !== 'undefined') {
      const el = document.getElementById(boardId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const RING_C = 150.8; // 2*pi*24
  const ringOffset = autoRun ? (RING_C * (AUTO_SECONDS - secs)) / AUTO_SECONDS : 0;

  // Build the "more games" family blocks (still-to-play), then bin-pack them into
  // 3 columns with an adaptively-sized "Other quizzes" block so the grid fills
  // evenly instead of leaving dead space under short families. Height is measured
  // in tile-units (header = 1, each row = 1); greedy largest-first packing plus a
  // sweep over the Other-quiz count picks the arrangement with the least dead space.
  const famBlocks = CAT_ORDER
    .map((cat) => ({ type: 'fam', cat, cm: CAT_META[cat], items: todo.filter((g) => g.cat === cat) }))
    .filter((b) => b.items.length > 0)
    .map((b) => ({ ...b, h: 1 + b.items.length }));

  // Balance the family blocks across 3 columns (greedy, largest first), then
  // order the columns tallest-first so the SHORTEST is last. "Other quizzes" is
  // appended to the bottom of that last column, so it can never appear before a
  // daily-games section (the columns stack in order on mobile, Other last).
  const showMore = famBlocks.length > 0;
  let packedCols = [[], [], []];
  if (showMore) {
    const cols = [[], [], []], hs = [0, 0, 0];
    for (const b of famBlocks.slice().sort((a, z) => z.h - a.h)) {
      let i = 0; for (let j = 1; j < 3; j++) if (hs[j] < hs[i]) i = j;
      cols[i].push(b); hs[i] += b.h;
    }
    const order = [0, 1, 2].sort((a, z) => hs[z] - hs[a]); // tallest first, shortest last
    const oc = [cols[order[0]], cols[order[1]], cols[order[2]]];
    const oh = [hs[order[0]], hs[order[1]], hs[order[2]]];
    let bestQ = Math.min(4, OTHER_POOL.length), bestDead = Infinity;
    const maxQ = OTHER_POOL.length, minQ = Math.min(4, maxQ);
    for (let Q = minQ; Q <= maxQ; Q++) {
      const h2 = oh[2] + 1 + Q;
      const dead = 3 * Math.max(oh[0], oh[1], h2) - (oh[0] + oh[1] + h2);
      if (dead < bestDead || (dead === bestDead && Q > bestQ)) { bestDead = dead; bestQ = Q; }
    }
    oc[2] = [...oc[2], { type: 'other', items: OTHER_POOL.slice(0, bestQ), h: 1 + bestQ }];
    packedCols = oc;
  }

  const inner = (
    <div className="dec-card" style={modal ? { position: 'relative', maxHeight: '92vh', overflowY: 'auto' } : undefined}>
      {modal && (
        <button type="button" className="dec-x" onClick={onClose} aria-label="Close">
          <X size={18} strokeWidth={2.4} />
        </button>
      )}
      <style>{`
        .dec-card{background:#fff;border:1px solid ${BORD};border-radius:16px;padding:20px 22px 16px;max-width:760px;width:100%;margin:0 auto;font-family:${SANS};color:${INK};}
        .dec-backdrop{position:fixed;inset:0;z-index:85;background:rgba(20,22,28,0.55);display:flex;align-items:flex-start;justify-content:center;padding:24px 16px;overflow-y:auto;}
        .dec-x{position:absolute;top:12px;right:12px;width:30px;height:30px;padding:0;display:flex;align-items:center;justify-content:center;border-radius:9px;background:#fff;border:1px solid ${BORD};color:${SLATE};cursor:pointer;z-index:2;}
        .dec-x:hover{color:${INK};background:#f7f8fa;}

        .dec-eyebrow{display:flex;align-items:center;gap:8px;padding-right:34px;}
        .dec-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;}
        .dec-cat{font-family:${MONO};font-size:10.5px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;}
        .dec-eb-sub{font-size:13px;color:${SLATE};}
        .dec-tagline{font-size:12px;color:#8a92a6;margin-left:auto;}
        .dec-titlerow{display:flex;align-items:baseline;flex-wrap:wrap;gap:3px 10px;margin:8px 0 6px;}
        .dec-title{font-size:25px;font-weight:800;letter-spacing:-.02em;}
        .dec-detail{font-size:13px;color:${SLATE};}
        .dec-answer{display:flex;align-items:baseline;gap:9px;margin:2px 0 12px;}
        .dec-answer-lbl{font-family:${MONO};font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:${SLATE};flex-shrink:0;}
        .dec-answer-word{font-size:23px;font-weight:800;letter-spacing:-.02em;color:${RUST};}
        .dec-rank{font-size:14.5px;font-weight:700;color:${SLATE};margin-bottom:14px;}
        .dec-rank b{font-weight:800;color:${INK};text-decoration:underline;text-underline-offset:2px;}
        .dec-rank .muted{color:#8a92a6;font-weight:600;}

        .dec-actions{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;}
        .dec-btn{font-family:${SANS};font-weight:700;font-size:12.5px;border:1px solid ${BORD};background:#fff;color:${SLATE};border-radius:10px;padding:9px 13px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;text-decoration:none;}
        .dec-btn:hover{background:#f7f8fa;}
        .dec-btn.primary{color:#fff;font-weight:800;border-color:transparent;}
        .dec-btn.primary:hover{filter:brightness(0.96);}

        .dec-upnext{display:flex;align-items:center;gap:14px;border:1px solid #d7e3f8;background:#eff4fd;border-radius:16px;padding:14px 16px;margin-bottom:12px;}
        .dec-up-main{display:flex;align-items:center;gap:14px;flex:1;min-width:0;}
        .dec-ring{position:relative;width:56px;height:56px;flex-shrink:0;}
        .dec-ring .num{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:${INK};}
        .dec-up-eye{font-family:${MONO};font-size:10px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:2px;}
        .dec-up-name{font-size:19px;font-weight:800;letter-spacing:-.01em;color:${INK};}
        .dec-up-tag{font-size:12px;color:${SLATE};margin-top:1px;}
        .dec-up-btns{display:flex;flex-direction:column;gap:7px;flex-shrink:0;}
        .dec-up-btns .dec-btn{justify-content:center;}

        .dec-grab{display:flex;align-items:center;gap:12px;background:${NAVY};border-radius:16px;padding:13px 16px;margin-bottom:4px;}
        .dec-grab-main{display:flex;align-items:center;gap:12px;flex:1;min-width:0;}
        .dec-grab-eye{font-family:${MONO};font-size:10px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:${GOLD};margin-bottom:2px;}
        .dec-grab-txt{font-size:14px;color:#eef2f9;display:flex;align-items:center;gap:6px;}
        .dec-grab-txt b{font-weight:800;}
        .dec-grab-btn{font-family:${SANS};font-weight:800;font-size:12.5px;color:${NAVY};background:${GOLD};border:none;border-radius:10px;padding:9px 15px;cursor:pointer;text-decoration:none;flex-shrink:0;white-space:nowrap;}

        .dec-morehd{display:flex;align-items:baseline;justify-content:space-between;margin:18px 2px 12px;}
        .dec-more-eye{font-family:${MONO};font-size:10.5px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:${SLATE};}
        .dec-more-count{font-size:12px;color:#8a92a6;}
        .dec-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;align-items:start;}
        .dec-col{min-width:0;display:flex;flex-direction:column;}
        .dec-group{margin-bottom:12px;}
        .dec-gh{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:10px;margin-bottom:8px;text-decoration:none;}
        .dec-gh .lbl{font-family:${MONO};font-size:10.5px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#fff;}
        .dec-gh .cnt{margin-left:auto;font-size:11px;color:rgba(255,255,255,.78);display:flex;align-items:center;}
        .dec-row{display:flex;align-items:center;gap:9px;padding:9px 11px;border:1px solid ${BORD};border-radius:11px;background:#fff;margin-bottom:7px;text-decoration:none;min-width:0;}
        .dec-row:hover{background:#f7f8fa;}
        .dec-row .nm{font-size:14px;font-weight:800;letter-spacing:-.01em;color:${INK};display:flex;align-items:center;gap:6px;min-width:0;}
        .dec-row .nm span.t{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .dec-row .tg{font-size:11px;color:#8a92a6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .dec-row .play{margin-left:auto;font-size:11px;font-weight:800;color:${SLATE};display:inline-flex;align-items:center;gap:2px;flex-shrink:0;}

        .dec-foot{text-align:center;margin-top:14px;}
        .dec-foot a{font-family:${MONO};font-size:11px;letter-spacing:.06em;text-transform:uppercase;font-weight:500;color:${NAVY};text-decoration:none;border-bottom:1px solid rgba(14,29,64,0.5);padding-bottom:1px;}

        @media(max-width:640px){
          .dec-card{padding:18px 16px 14px;}
          .dec-tagline{display:none;}
          .dec-grid{grid-template-columns:1fr;}
          .dec-upnext{flex-direction:column;align-items:stretch;}
          .dec-up-btns{flex-direction:row;width:100%;}
          .dec-up-btns .dec-btn{flex:1;}
          .dec-grab{flex-direction:column;align-items:stretch;}
          .dec-grab-btn{text-align:center;}
          .dec-rows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;}
          .dec-rows.one{grid-template-columns:1fr;}
          .dec-row{margin-bottom:0;padding:8px 9px;}
          .dec-row .pl{display:none;}
        }
      `}</style>

      {/* ---- result header ---- */}
      <div className="dec-eyebrow">
        <span className="dec-dot" style={{ background: selfCatMeta.color }} />
        <span className="dec-cat" style={{ color: selfCatMeta.color }}>{selfCatMeta.name}</span>
        {headline ? <span className="dec-eb-sub">&middot; {headline}</span> : null}
        {selfGame ? <span className="dec-tagline">{selfGame.tag}</span> : null}
      </div>
      <div className="dec-titlerow">
        <span className="dec-title">{won ? 'You finished' : 'You played'} {selfName}</span>
        {subline ? <span className="dec-detail">{subline}</span> : null}
      </div>
      {answer ? (
        <div className="dec-answer">
          <span className="dec-answer-lbl">Answer</span>
          <span className="dec-answer-word">{answer}</span>
        </div>
      ) : null}
      {dailyMe ? (
        <div className="dec-rank">
          {gameRank ? <>Rank <b>#{gameRank}</b> today in {selfName}</> : null}
          {gameRank && combinedRank ? ' · ' : null}
          {combinedRank ? <><b>#{combinedRank}</b> on the combined leaderboard</> : null}
          {leftToPlay > 0 ? <span className="muted"> &middot; {leftToPlay} game{leftToPlay === 1 ? '' : 's'} left</span> : null}
        </div>
      ) : null}

      {/* ---- result actions ---- */}
      <div className="dec-actions">
        {pastHref ? (
          <a className="dec-btn primary" style={{ background: INK, borderColor: INK }} href={pastHref}>
            <RotateCcw size={15} strokeWidth={2} /> Play a past {selfName}
          </a>
        ) : null}
        <button type="button" className="dec-btn" onClick={goBoard}>
          <BarChart3 size={15} strokeWidth={2} /> Leaderboard
        </button>
        <button type="button" className="dec-btn" onClick={onShare}>
          <Share2 size={15} strokeWidth={2} /> {shareLabel}
        </button>
      </div>

      {/* ---- up next auto-advance ---- */}
      {nextTarget ? (
        <div className="dec-upnext">
          <div className="dec-up-main">
            <div className="dec-ring">
              <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
                <circle cx="28" cy="28" r="24" fill="none" stroke="#dbe6f7" strokeWidth="5" />
                <circle cx="28" cy="28" r="24" fill="none" stroke="#2563eb" strokeWidth="5" strokeLinecap="round"
                  transform="rotate(-90 28 28)" strokeDasharray={RING_C} strokeDashoffset={ringOffset} />
              </svg>
              <span className="num">{autoRun ? secs : <ArrowRight size={18} strokeWidth={2.4} color="#2563eb" />}</span>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="dec-up-eye">Up next &middot; closest unplayed</div>
              <div className="dec-up-name">{nextTarget.name}</div>
              <div className="dec-up-tag">
                {nextTarget.tag}
                {autoRun ? <> &middot; {secs > 0 ? `opens in ${secs}s` : 'opening…'}</> : null}
              </div>
            </div>
          </div>
          <div className="dec-up-btns">
            <a className="dec-btn primary" style={{ background: '#dc2626' }} href={nextTarget.href}>Go to {nextTarget.name}</a>
            {autoRun ? (
              <button type="button" className="dec-btn" onClick={() => setAutoCancel(true)}>Not now</button>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* ---- leaderboard most up for grabs ---- */}
      {grab ? (
        <div className="dec-grab">
          <div className="dec-grab-main">
            <Trophy size={22} strokeWidth={2} color={GOLD} style={{ flexShrink: 0 }} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="dec-grab-eye">Leaderboard most up for grabs</div>
              <div className="dec-grab-txt">
                <span className="dec-dot" style={{ background: (CAT_META[grab.cat] || CAT_META.word).color }} />
                <span><b>{grab.name}</b> &middot; {grab.field > 0 ? <>only {grab.field} player{grab.field === 1 ? '' : 's'} so far, the board&rsquo;s wide open</> : <>no one&rsquo;s on the board yet</>}</span>
              </div>
            </div>
          </div>
          <a className="dec-grab-btn" href={grab.href}>Play {grab.name}</a>
        </div>
      ) : null}

      {/* ---- more of today's games ---- */}
      {showMore ? (
        <>
          <div className="dec-morehd">
            <span className="dec-more-eye">More of today&rsquo;s games</span>
            <span className="dec-more-count">{doneCount} of {total} played</span>
          </div>
          <div className="dec-grid">
            {packedCols.map((col, ci) => (
              <div className="dec-col" key={ci}>
                {col.map((block) => block.type === 'other' ? (
                  <div className="dec-group" key="other">
                    <a className="dec-gh" style={{ background: OTHER_COLOR }} href="/quizzes">
                      <span className="lbl">Other quizzes</span>
                      <span className="cnt"><ArrowRight size={14} strokeWidth={2.4} color="#fff" /></span>
                    </a>
                    <div className="dec-rows one">
                    {block.items.map((q) => (
                      <a className="dec-row" href={`/quiz/${q.id}`} key={q.id}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div className="nm"><span className="t">{q.name}</span></div>
                          <div className="tg">{q.tag}</div>
                        </div>
                        <span className="play"><span className="pl">Play</span><ArrowRight size={11} strokeWidth={2.6} /></span>
                      </a>
                    ))}
                    </div>
                  </div>
                ) : (
                  <div className="dec-group" key={block.cat}>
                    <div className="dec-gh" style={{ background: block.cm.color }}>
                      <span className="lbl">{block.cm.name}</span>
                      <span className="cnt">{block.items.length}</span>
                    </div>
                    <div className="dec-rows">
                    {block.items.map((g) => (
                      <a className="dec-row" href={g.href} key={g.key}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div className="nm"><span className="t">{g.name}</span></div>
                          <div className="tg">{g.tag}</div>
                        </div>
                        <span className="play"><span className="pl">Play</span><ArrowRight size={11} strokeWidth={2.6} /></span>
                      </a>
                    ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      ) : null}

      <div className="dec-foot"><a href="/daily">All daily games &amp; archive &rarr;</a></div>
      {self ? (
        <ReportIssue
          self={self}
          name={selfName}
          accent={meta.accent}
        />
      ) : null}
    </div>
  );

  if (!modal) return inner;
  return (
    <div className="dec-backdrop" onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 760, margin: 'auto' }} onClick={(e) => e.stopPropagation()}>
        {inner}
      </div>
    </div>
  );
}

'use client';

// DailyEndCard — the shared end-of-game result popup for every daily puzzle
// (Crux, Emcee, Garble, Links, Span, Dating, Tally, Suds, Circa, Extra,
// Carve, Stet, Outwit, Tuck, Alibi, Cipher, Ping, Warmer, Jesters, Sworn,
// Outrank, Axiom, Hearsay). One component, used by all daily clients.
//
// Layout, top to bottom (approved 2026-07 rework):
//   1. header — the family chip + "Completed!" (loss: "Played") + a subline of
//      "<Game> · <Family> · <score>", the answer, and a right-hand stack with the
//      player's username (or a "Sign up" link for guests) and the "Share result
//      (for credit)" button;
//   2. rank tiles — "IQ Points" (what this game paid, over the player's global
//      IQ standing; expands to their slot in the IQ ranking with two players
//      above and below), "This Puzzle" (today's drop of this game), "All Time"
//      (this game's cumulative points across every drop), and "Today's Puzzles"
//      (the combined board) — each with a field size and an enlarge control that
//      expands in place to that board's top 10. The internal view keys stay
//      'today' / 'alltime' / 'combined'; only the labels were reframed.
//   3. guest-only claim slip (ranks unclaimed until a username is chosen);
//   4. archive bar — a full-width button under the tiles (desktop and mobile
//      alike, owner 2026-07-30) showing "N/M played · P%" over a completion bar,
//      expanding to a month calendar of this game's past drops. It replaced a
//      desktop-only 5th "<Game> Archive" tile, which was a cramped duplicate of
//      the same control;
//   5. a two-card row — "Up next" (25s auto-advance) and "Easiest leaderboard"
//      (the thinnest field, a podium is easiest there);
//   6. "More of today's games" — the still-to-play games grouped by family;
//   7. a bottom actions row — Leaderboards, Play a past <Game>, and a right-hand
//      "Daily puzzle landing page" link.
//
// Each client passes only its result strings + handlers (unchanged API):
//   <DailyEndCard modal self="tuck" completed
//     score={<>{finalScore} pts &middot; par {PAR}</>}
//     onShare={copyShare} shareLabel={copied ? 'Copied' : 'Share Result'}
//     onReplay={resetGame} onClose={() => setJustWon(false)} />
// `completed` (default = `won`) drives the "Completed!"/"Played" title; pass a
// clean `score` node ONLY for variable-score games (Tuck/Outrank/Outwit) so every
// other game just reads its title with score/time/accuracy left to the board.
// `headline`/`subline` are deprecated and no longer rendered (kept for compat).
// The finish accent comes from `self` via GAME_META. To add a game: add it to
// GAME_META (accent) and to DAILY_GAMES (family + tile copy).

import React, { useState, useEffect } from 'react';
import {
  Type, Clock, Globe, Hash, Share2, BarChart3, RotateCcw, Check, X,
  Trophy, Link2, Flag, CalendarCheck, Scale, Grid3x3, LayoutGrid, Newspaper, FlagTriangleRight,
  Brain, Pencil, Users, ArrowRight, Puzzle, Blocks, Fingerprint, KeyRound, Thermometer, Crown, ListOrdered,
  FlaskConical, Ear, CircleDot, Disc, Car, Swords, Calculator, Gavel, MoveUp, Table2, Trophy as TrophyFin, Image as ImageIcon, Route,
  CalendarDays, ChevronLeft, ChevronRight, ChevronDown, CheckCircle2, UserPlus,
} from 'lucide-react';
import ReportIssue from './ReportIssue';
import shareDayCard from './shareDayCard';

const RUST = '#c0392b';

// LAUNCH WINDOW (owner ruling 2026-07-18): brand-new daily puzzles lead the
// "still to play" list for their first FOUR days so players actually meet
// them; after `until` (ET, inclusive) the canonical order resumes. Keep in
// sync with the same pin in app/api/quiz/daily-order/route.js.
const LAUNCH_PIN = { keys: ['rung', 'crunch', 'bid', 'park'], until: '2026-08-13' };
function etTodayEC() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const INK = '#1c1e24';
const SLATE = '#46506a';
const FADED = '#262b35';
const BORD = '#e7eaf1';
const NAVY = '#0e1d40';
const GOLD = '#e8b43a';
const BLUE = '#2563eb';

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
  outrank: { accent: '#4338ca', badgeBg: '#4338ca', badgeInk: '#fff', Fin: ListOrdered },
  shards: { accent: '#0d9488', badgeBg: '#0d9488', badgeInk: '#fff', Fin: Blocks },
  axiom:  { accent: '#0f766e', badgeBg: '#0f766e', badgeInk: '#fff', Fin: FlaskConical },
  hearsay: { accent: '#7c2d92', badgeBg: '#7c2d92', badgeInk: '#fff', Fin: Ear },
  venn:   { accent: '#b45309', badgeBg: '#b45309', badgeInk: '#fff', Fin: CircleDot },
  stands:  { accent: '#1d4ed8', badgeBg: '#1d4ed8', badgeInk: '#fff', Fin: Table2 },
  bracket: { accent: '#c2410c', badgeBg: '#c2410c', badgeInk: '#fff', Fin: TrophyFin },
  lode: { accent: '#a16207', badgeBg: '#a16207', badgeInk: '#fff', Fin: TrophyFin },
  etch: { accent: '#4d7c0f', badgeBg: '#4d7c0f', badgeInk: '#fff', Fin: ImageIcon },
  hedge: { accent: '#0891b2', badgeBg: '#0891b2', badgeInk: '#fff', Fin: Route },
  listed: { accent: '#86198f', badgeBg: '#86198f', badgeInk: '#fff', Fin: BarChart3 },
  mate: { accent: '#6b4423', badgeBg: '#6b4423', badgeInk: '#fff', Fin: Crown },
  four: { accent: '#1e3a8a', badgeBg: '#1e3a8a', badgeInk: '#fff', Fin: Disc },
  park: { accent: '#7c5c2e', badgeBg: '#7c5c2e', badgeInk: '#fff', Fin: Car },
  check: { accent: '#166e5a', badgeBg: '#166e5a', badgeInk: '#fff', Fin: Swords },
  rung: { accent: '#155e75', badgeBg: '#155e75', badgeInk: '#fff', Fin: MoveUp },
  crunch: { accent: '#b45309', badgeBg: '#b45309', badgeInk: '#fff', Fin: Calculator },
  bid: { accent: '#7c2d12', badgeBg: '#7c2d12', badgeInk: '#fff', Fin: Gavel },
};

// ---- the five families (type label + color shown on each tile/header) -------
export const CAT_META = {
  word:      { name: 'Word',      color: '#2563eb', Icon: Type },
  history:   { name: 'History',   color: '#6d28d9', Icon: Clock },
  geography: { name: 'Geography', color: '#0e7c5a', Icon: Globe },
  numbers:   { name: 'Numbers',   color: '#ea580c', Icon: Hash },
  logic:     { name: 'Logic',     color: '#9f1239', Icon: Fingerprint },
  crowd:     { name: 'Crowd Psychology', color: '#a16207', Icon: Users },
};
// Family render order for the "more games" grid.
const CAT_ORDER = ['word', 'numbers', 'crowd', 'logic', 'history', 'geography'];

// ---- the daily slate (31 games) --------------------------------------------
// Canonical order = the order the "still to play" tiles appear in.
export const DAILY_GAMES = [
  { key: 'crux',   cat: 'word',      name: 'Crux',   tag: 'A clueless crossword',      href: '/crux' },
  { key: 'emcee',  cat: 'word',      name: 'Emcee',  tag: 'The daily mini crossword',  href: '/emcee' },
  { key: 'shards', cat: 'word',      name: 'Shards', tag: 'Reassemble the crossword',   href: '/shards' },
  { key: 'links',  cat: 'word',      name: 'Links',  tag: 'Four hidden threads',       href: '/links' },
  { key: 'garble', cat: 'word',      name: 'Garble', tag: 'Untangle five words',       href: '/garble' },
  { key: 'stet',   cat: 'word',      name: 'Stet',   tag: 'Spot the error, fix the copy',        href: '/stet' },
  { key: 'tuck',   cat: 'word',      name: 'Tuck',   tag: 'Same letters, highest score wins',  href: '/tuck' },
  { key: 'dating', cat: 'history',   name: 'Dating', tag: 'Put five moments in order', href: '/dating' },
  { key: 'extra',  cat: 'history',   name: 'Extra',  tag: 'Name the redacted front page', href: '/extra' },
  { key: 'span',   cat: 'geography', name: 'Span',   tag: 'Cross the map, border by border', href: '/span' },
  { key: 'ping',   cat: 'geography', name: 'Ping',   tag: 'Find the secret city',        href: '/ping' },
  { key: 'tally',  cat: 'numbers',   name: 'Tally',  tag: 'Balance every row and column', href: '/tally' },
  { key: 'suds',   cat: 'numbers',   name: 'Suds',   tag: 'The daily 9x9 sudoku',      href: '/suds' },
  { key: 'carve',  cat: 'numbers',   name: 'Carve',  tag: 'Carve equal-sum regions',   href: '/carve' },
  { key: 'outwit', cat: 'crowd',     name: 'Outwit', tag: 'Beat the crowd',            href: '/outwit' },
  { key: 'outrank', cat: 'crowd',    name: 'Outrank', tag: "Call the crowd's order",   href: '/outrank' },
  { key: 'cipher', cat: 'numbers',   name: 'Cipher', tag: 'Crack the letter math',     href: '/cipher' },
  { key: 'alibi',  cat: 'logic',     name: 'Alibi',  tag: 'Solve the nightly whodunit', href: '/alibi' },
  { key: 'jester', cat: 'logic',     name: 'Jesters', tag: 'Seat the court',             href: '/jester' },
  { key: 'sworn',  cat: 'logic',     name: 'Sworn',  tag: 'Spot the liars',             href: '/sworn' },
  { key: 'warmer', cat: 'word',      name: 'Warmer', tag: 'Hotter or colder',           href: '/warmer' },
  { key: 'listed', cat: 'history',   name: 'Listed', tag: 'Rank the list, top to bottom', href: '/listed' },
  { key: 'mate',   cat: 'logic',     name: 'Mate',   tag: 'White to play and mate',      href: '/mate' },
  { key: 'four',   cat: 'logic',     name: 'Four',   tag: 'One column wins',             href: '/four' },
  { key: 'park',   cat: 'logic',     name: 'Park',   tag: 'Free the red block',          href: '/park' },
  { key: 'check',  cat: 'logic',     name: 'Check',  tag: 'Give a piece, take them all', href: '/check' },
  { key: 'rung',   cat: 'word',      name: 'Rung',   tag: 'One letter at a time',       href: '/rung' },
  { key: 'crunch', cat: 'numbers',   name: 'Crunch', tag: 'Six numbers, one target',    href: '/crunch' },
  { key: 'bid',    cat: 'crowd',     name: 'Bid',    tag: 'One purse, five lots',       href: '/bid' },
  { key: 'axiom',  cat: 'logic',     name: 'Axiom',  tag: 'Find the hidden rule',       href: '/axiom' },
  { key: 'hearsay', cat: 'logic',    name: 'Hearsay', tag: "Deduce what they don't know", href: '/hearsay' },
  { key: 'venn',   cat: 'logic',     name: 'Venn',   tag: 'Sort the overlaps',          href: '/venn' },
  { key: 'stands', cat: 'logic',     name: 'Stands', tag: 'Rebuild the results',       href: '/stands' },
  { key: 'bracket', cat: 'history',  name: 'Bracket', tag: 'Name every winner',        href: '/bracket' },
  { key: 'lode',    cat: 'word',     name: 'Lode',    tag: 'Seven letters, rare words pay',     href: '/lode' },
  { key: 'etch',    cat: 'logic',    name: 'Etch',    tag: 'A picture in the numbers',   href: '/etch' },
  { key: 'hedge',   cat: 'numbers',  name: 'Hedge',   tag: 'Draw one closed loop',       href: '/hedge' },
];

const AUTO_SECONDS = 30;
const REVEAL_MS = 2000; // win only: MIN time the finished board + confetti shows before the popup
const REVEAL_CAP_MS = 3000; // hard cap: pop even if data is slow (usually pops at REVEAL_MS = 2s)

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * @param self          game key, e.g. "garble"
 * @param completed      bool; true => "Completed!" title (default = won)
 * @param score          node; a clean score shown at top for variable-score games only
 * @param headline       DEPRECATED, no longer rendered
 * @param subline        DEPRECATED, no longer rendered
 * @param onShare / shareLabel   share handler + label
 * @param onReplay      replay handler (unused by the new layout, kept for API compat)
 * @param onClose       closes any celebration modal; run before scroll
 * @param boardId       leaderboard element id to scroll to (default "daily-leaderboard")
 * @param onLeaderboard optional override for the whole close+scroll behavior
 */
export default function DailyEndCard({
  self,
  won = true,
  completed = null,
  modal = false,
  headline = 'You scored 100%',
  subline = null,
  score = null,
  answer = null,
  onShare, shareLabel = 'Share Result',
  onReplay,
  onClose,
  boardId = 'daily-leaderboard',
  onLeaderboard,
  quizId = null,
}) {
  // "(for credit)" only for a registered viewer: every caller's share handler
  // builds its URL through withRef, so a registered sharer genuinely earns the
  // credit, while a signed-out one would be promised something they can't get.
  // If the completion fetch is very slow, stop showing the loading skeletons after
  // a beat and collapse those slots rather than lingering on a shimmer.
  useEffect(() => {
    const t = setTimeout(() => setSkelTimedOut(true), 1500);
    return () => clearTimeout(t);
  }, []);
  const [ident, setIdent] = useState(null);          // { email, username } from localStorage
  const [dailyMe, setDailyMe] = useState(null);
  const [dailyGuest, setDailyGuest] = useState(null); // provisional standing for an unregistered player
  const [boardGames, setBoardGames] = useState(null); // per-game field/plays/board for the day
  const [overallBoard, setOverallBoard] = useState(null); // combined top-10
  const [combinedField, setCombinedField] = useState(null); // full combined field (all players)
  const [allTime, setAllTime] = useState(null);       // { field, myRank, myPoints, board } for `self`
  const [allTimeResolved, setAllTimeResolved] = useState(false); // daily-game answered => all-time tile known
  const [drops, setDrops] = useState(null);           // this game's live drops (calendar)
  const [secs, setSecs] = useState(AUTO_SECONDS);
  const [autoCancel, setAutoCancel] = useState(false);
  const [combinedResolved, setCombinedResolved] = useState(false); // daily-combined answered => completion set is known
  const [skelTimedOut, setSkelTimedOut] = useState(false);          // collapse loading skeletons if the fetch is very slow
  const [popularCats, setPopularCats] = useState(null);             // popular quiz per category, once every daily is done
  const [pastHref, setPastHref] = useState(null);     // most-recent unplayed PAST drop of this game
  const [iq, setIq] = useState(null);                 // { gained, todayGained, rank, total, xp, level, window, provisional }
  const [iqResolved, setIqResolved] = useState(false); // iq-standing answered (or gave up retrying)
  const [openTile, setOpenTile] = useState(null);     // which rank tile is expanded: 'iq'|'today'|'alltime'|'combined'|null
  const [calOpen, setCalOpen] = useState(false);      // calendar slip expanded
  const [dayBusy, setDayBusy] = useState(false);      // 'Share my day' card is rendering
  const [calMonth, setCalMonth] = useState(() => etTodayEC().slice(0, 7)); // 'YYYY-MM'

  // Win reveal delay: on a win, hold the popup back ~2s so the player sees the
  // completed board with the confetti first (and the placement fetch has time to
  // land). Losses and reduced-motion viewers get the card immediately.
  const [revealed, setRevealed] = useState(() => {
    if (!(won && modal)) return true;
    try {
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    } catch (e) {}
    return false;
  });
  // Hold the reveal until the card's data has actually landed (the combined
  // standing that fills the tiles, and the all-time board), so the player never
  // sees the tiles pop in from "—" after the card appears. These refs are flipped
  // by the fetch callbacks below; the reveal poller reads their latest values.
  const standingReadyRef = React.useRef(false);
  const allTimeReadyRef = React.useRef(false);
  useEffect(() => {
    if (revealed) return undefined;
    const start = Date.now();
    let alive = true;
    let t = null;
    const tick = () => {
      if (!alive) return;
      const el = Date.now() - start;
      // Reveal once BOTH the minimum confetti window AND the data are ready, or at
      // the hard cap so a slow/failed fetch can never leave the card hidden.
      if ((el >= REVEAL_MS && standingReadyRef.current && allTimeReadyRef.current) || el >= REVEAL_CAP_MS) {
        setRevealed(true);
        return;
      }
      t = setTimeout(tick, 140);
    };
    t = setTimeout(tick, 140);
    return () => { alive = false; if (t) clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Identity (username / registered state) for the header right stack.
  useEffect(() => {
    try { setIdent(JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null')); } catch (e) {}
  }, []);

  useEffect(() => {
    let anonId = null, email = null;
    try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
    // After Part 3 guests appear in d.me once their rows land, so the retry
    // check covers both registered and guest players via d.me.perGame.
    const registered = !!email;
    let alive = true;
    let timer = null;
    // The result of the game just finished is POSTed to /api/quiz/result at the
    // same moment this card mounts, and the combined board reads a cached
    // snapshot (a ~5s in-process burst TTL plus an edge cache). So the FIRST read
    // here routinely predates our own row landing, which renders the player at the
    // bottom (as if they scored zero) until the write propagates. Re-fetch, cache-
    // busted, until our standing reflects the game we just finished (or we run out
    // of tries), so the end-card placement is never stale. delays are ms after
    // mount and cover the write commit + the 5s snapshot TTL.
    const delays = [0, 1500, 3500, 6000, 10000];
    let i = 0;
    let notified = false;
    // Once our own row is confirmed on the board, tell the on-page daily
    // leaderboard to reload fresh so it shows us at once. Fire twice (now + a
    // beat later) to cover the board mounting a tick after this fetch resolves.
    const notifyBoard = () => {
      try { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('sot:daily-updated', { detail: { game: self } })); } catch (e) {}
    };
    const run = () => {
      const qs = new URLSearchParams();
      if (anonId) qs.set('anonId', anonId);
      if (email) qs.set('email', email);
      qs.set('fresh', '1'); // force an authoritative, cache-bypassed read (server no-stores it)
      if (i > 0) qs.set('_', String(Date.now())); // distinct key -> also bust the edge cache on retries
      fetch('/api/quiz/daily-combined?' + qs.toString())
        .then((r) => r.json())
        .then((d) => {
          if (!alive || !d) return;
          setCombinedResolved(true); // the completion set is now as complete as it will get
          if (d.me) setDailyMe({ ...d.me, maxTotal: d.maxTotal, gameCount: d.gameCount });
          if (d.meProvisional) setDailyGuest(d.meProvisional);
          if (Array.isArray(d.games)) setBoardGames(d.games);
          if (Array.isArray(d.overall)) setOverallBoard(d.overall);
          if (typeof d.overallField === 'number') setCombinedField(d.uniquePlayers ?? d.overallField);
          // Does our standing already include the game we just finished? If so
          // (or we're a guest, or retries are exhausted), stop. Otherwise the
          // write hasn't propagated yet, so try again.
          const reflectsSelf = registered
            ? (!self || (d.me && d.me.perGame && d.me.perGame[self]))
            : !!(d.me && d.me.perGame && d.me.perGame[self]) || !!d.meProvisional;
          if (reflectsSelf && !notified) { notified = true; notifyBoard(); setTimeout(notifyBoard, 600); }
          if (reflectsSelf || i >= delays.length - 1) { standingReadyRef.current = true; return; }
          i += 1;
          timer = setTimeout(run, delays[i]);
        })
        .catch(() => {
          if (!alive) return;
          setCombinedResolved(true); // don't leave the loading skeletons up on a failed read
          if (i >= delays.length - 1) { standingReadyRef.current = true; return; }
          i += 1;
          timer = setTimeout(run, delays[i]);
        });
    };
    timer = setTimeout(run, delays[0]);
    return () => { alive = false; if (timer) clearTimeout(timer); };
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

  // The game's all-time (cumulative-points) leaderboard + its drop calendar.
  useEffect(() => {
    if (!self) return undefined;
    let anonId = null, email = null;
    try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
    const qs = new URLSearchParams({ game: self, fresh: '1' });
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    let alive = true;
    fetch('/api/quiz/daily-game?' + qs.toString())
      .then((r) => r.json())
      .then((d) => { if (alive && d) { if (d.allTime) setAllTime(d.allTime); if (Array.isArray(d.drops)) setDrops(d.drops); } if (alive) setAllTimeResolved(true); allTimeReadyRef.current = true; })
      .catch(() => { if (alive) setAllTimeResolved(true); allTimeReadyRef.current = true; });
    return () => { alive = false; };
  }, [self]);

  const meta = GAME_META[self] || GAME_META.crux;
  const selfGame = DAILY_GAMES.find((g) => g.key === self) || null;
  const selfCat = selfGame ? selfGame.cat : 'word';
  const selfName = selfGame ? selfGame.name : (self || 'today’s game');
  const selfCatMeta = CAT_META[selfCat] || CAT_META.word;
  const headColor = won ? meta.accent : RUST;
  const isCompleted = (completed == null ? won : completed);

  // The player's IQ Points standing: what this game paid, what they have banked
  // today, and their window of the global IQ ranking. Same write-propagation race
  // as the combined board above (our /api/quiz/result row is POSTed as this card
  // mounts), and the route reports gained:null until that row is visible, so
  // retry on the same schedule rather than render a stale number.
  useEffect(() => {
    let anonId = null, email = null;
    try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
    if (!anonId && !email) { setIqResolved(true); return undefined; }
    let alive = true;
    let timer = null;
    let i = 0;
    const delays = [0, 1500, 3500, 6000, 10000];
    const run = () => {
      const qs = new URLSearchParams();
      if (anonId) qs.set('anonId', anonId);
      if (email) qs.set('email', email);
      if (self) qs.set('game', self);
      if (quizId) qs.set('quizId', quizId);
      if (i > 0) qs.set('_', String(Date.now())); // bust the edge cache on retries
      fetch('/api/quiz/iq-standing?' + qs.toString())
        .then((r) => r.json())
        .then((d) => {
          if (!alive || !d) return;
          if (d.found) setIq(d);
          // Done when the row landed (gained known), the player has no profile at
          // all, or we are out of tries.
          if (!d.found || d.gained != null || i >= delays.length - 1) { setIqResolved(true); return; }
          i += 1;
          timer = setTimeout(run, delays[i] - delays[i - 1]);
        })
        .catch(() => { if (alive) setIqResolved(true); });
    };
    timer = setTimeout(run, delays[0]);
    return () => { alive = false; if (timer) clearTimeout(timer); };
  }, [self, quizId]);

  const hasEmail = !!(ident && ident.email);
  const username = ident && ident.username ? ident.username : null;

  // Which daily puzzles the viewer has completed today. The just-finished game is
  // always checked; dailyMe.perGame fills in every other game already played so
  // the whole day resolves, not just the leaf they came from.
  const doneKeys = new Set();
  const unfinished = new Set(); // started today but abandoned (not finished)
  if (self) doneKeys.add(self);
  // Registered players carry the day's completions on dailyMe.perGame; guests carry
  // them on the provisional standing, so read whichever we have (else the guest's
  // already-played games would look unplayed and skew "up next" / the grid).
  const perGameDone = (dailyMe && dailyMe.perGame) || (dailyGuest && dailyGuest.perGame) || null;
  if (perGameDone) {
    for (const [k, v] of Object.entries(perGameDone)) {
      if (v && v.abandoned) unfinished.add(k);
      else doneKeys.add(k);
    }
  }
  if (self) unfinished.delete(self); // the game just finished is never unfinished
  const total = DAILY_GAMES.length;
  const doneCount = DAILY_GAMES.filter((g) => doneKeys.has(g.key)).length;

  // Still-to-play games, launch-pinned to the front during a new game's window.
  let todo = DAILY_GAMES.filter((g) => !doneKeys.has(g.key));
  if (etTodayEC() <= LAUNCH_PIN.until) {
    todo = [
      ...todo.filter((g) => LAUNCH_PIN.keys.includes(g.key)),
      ...todo.filter((g) => !LAUNCH_PIN.keys.includes(g.key)),
    ];
  }

  // Up next = the closest unplayed game of the SAME family, else the next unplayed.
  const nextTarget = todo.find((g) => g.cat === selfCat) || todo[0] || null;

  // --- rank-tile figures ----------------------------------------------------
  // Today, this game: my rank of the game's registered field.
  const todayGame = boardGames ? boardGames.find((g) => g.key === self) : null;
  const gameTodayRank = (dailyMe && dailyMe.perGame && dailyMe.perGame[self] && dailyMe.perGame[self].rank)
    || (dailyGuest && dailyGuest.perGame && dailyGuest.perGame[self] && dailyGuest.perGame[self].rank)
    || null;
  const gameTodayField = (todayGame ? (todayGame.plays ?? todayGame.field) : null)
    || (dailyGuest && dailyGuest.perGame && dailyGuest.perGame[self] && dailyGuest.perGame[self].field)
    || null;
  // Combined today: my combined-board rank of the registered field.
  const combinedRank = (dailyMe && dailyMe.rank) || (dailyGuest && dailyGuest.rank) || null;
  // Provisional (guest) standings are marked so the tile can say so.
  const provisional = !dailyMe && !!dailyGuest;

  // Rankings still loading: neither the combined standing nor the all-time board
  // has answered yet. While loading, show a single "Loading your rankings…" banner
  // spanning the tiles row instead of empty dash tiles. Both fetches always resolve
  // or error (each sets its flag in .then AND .catch), so this can never spin
  // forever — a guest with no rank resolves fast and falls through to the tiles.
  const ranksLoading = !(combinedResolved && allTimeResolved);

  const myKey = dailyMe ? dailyMe.userKey : null;

  // IQ tile values. `gained` stays null until our result row is visible, so the
  // tile shows a placeholder rather than a wrong number. The "today" line only
  // appears once the day's total exceeds this game's gain (i.e. this is not the
  // player's first daily today), where it would otherwise just repeat it.
  const iqGained = (iq && typeof iq.gained === 'number') ? iq.gained : null;
  const showIqToday = !!(iq && typeof iq.todayGained === 'number' && iqGained != null && iq.todayGained > iqGained);

  // Most open leaderboard = the thinnest-field daily among the REMAINING unplayed
  // games, AFTER excluding the "closest" (up-next) pick. So the two cards are
  // always distinct: with two games left, one is the closest and the other is the
  // most-open of what's left (even if still fairly full). No fallback to
  // already-played games, so with 0 or 1 remaining there is simply no second card.
  // field = full pool (registered + guests); registered = named/registered
  // players only (what the public board shows); plays = total attempts.
  let grab = null;
  if (boardGames && boardGames.length) {
    const nextKey = nextTarget ? nextTarget.key : null;
    const pool = boardGames.filter((g) => !doneKeys.has(g.key) && g.key !== nextKey);
    pool.sort((a, b) => (a.registered - b.registered) || (a.field - b.field) || (a.plays - b.plays));
    const g0 = pool[0];
    const gm = g0 && DAILY_GAMES.find((x) => x.key === g0.key);
    if (g0 && gm) grab = { ...gm, field: g0.field || 0, plays: g0.plays || 0, registered: g0.registered || 0, href: g0.href || gm.href };
  }

  // Completion-derived UI (Up next, Easiest leaderboard, the still-to-play grid)
  // must wait for the daily-combined fetch: before it lands the only finished game
  // we know is `self`, so an ungated "up next" can point at a game already played
  // today (and the auto-advance would open it). Gate on combinedResolved, show a
  // skeleton meanwhile, and collapse the skeleton if the fetch is very slow.
  const completionKnown = combinedResolved;
  // Every daily finished today (none unplayed, none abandoned). In this state the
  // up-next / easiest-board duo has nothing to point at, so it collapses and the
  // grid below becomes a "try a quiz" block instead.
  const allDailiesDone = completionKnown && todo.length === 0;
  // Suggest quizzes once the player is down to half (or fewer) of the day's
  // puzzles, not only when they've cleared them all.
  const showPopular = completionKnown && (total - doneCount) <= total / 2;
  const nextReal = !allDailiesDone && completionKnown && !!nextTarget; // trustworthy up-next
  const nextSkel = !allDailiesDone && !completionKnown && !skelTimedOut; // still loading
  const grabSkel = !allDailiesDone && !boardGames && !skelTimedOut;   // easiest-board data still loading

  // Pull the most-played quiz in each category once the player is at half (or
  // fewer) dailies remaining, to suggest alongside (or, when all are done, in
  // place of) the still-to-play grid. Fetched lazily and once.
  useEffect(() => {
    if (!showPopular || popularCats) return undefined;
    let alive = true;
    fetch('/api/quiz/popular-by-category')
      .then((r) => r.json())
      .then((d) => { if (alive && d && Array.isArray(d.cats)) setPopularCats(d.cats); })
      .catch(() => {});
    return () => { alive = false; };
  }, [showPopular, popularCats]);

  // 25s auto-advance to the next game (win only; a loss shows the block without
  // the ticking clock so the player can retry or read the board first).
  const autoRun = revealed && won && completionKnown && !!nextTarget && !autoCancel;
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

  // "Full leaderboard": close the popup, tell the on-page DailyBoardPanel to
  // unfurl to the SAME view (Today / All-time / Combined) via a window event, and
  // scroll to it — so the reader lands on the full, expanded board, not the
  // collapsed tiles.
  const openPanel = (view) => {
    if (onLeaderboard) { onLeaderboard(); return; }
    if (onClose) onClose();
    if (typeof window !== 'undefined') { try { window.dispatchEvent(new CustomEvent('sot:open-daily-board', { detail: { view } })); } catch (e) {} }
    if (typeof document !== 'undefined') {
      const el = document.getElementById(boardId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Register CTA (guests): close the popup, then bring the on-page sign-up
  // form into view (falls back to the leaderboard, which sits just below it).
  const goRegister = () => {
    if (onClose) onClose();
    if (typeof document !== 'undefined') {
      const el = document.getElementById('daily-join') || document.getElementById(boardId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const RING_C = 150.8; // 2*pi*24
  const ringOffset = autoRun ? (RING_C * (AUTO_SECONDS - secs)) / AUTO_SECONDS : 0;

  // Build the "more games" family blocks (still-to-play), then bin-pack them into
  // up to 3 columns (greedy: each family, largest first, into the shortest column)
  // so the grid fills evenly. The "Other quizzes" block was dropped from the popup.
  const famBlocks = CAT_ORDER
    .map((cat) => ({ type: 'fam', cat, cm: CAT_META[cat], items: todo.filter((g) => g.cat === cat) }))
    .filter((b) => b.items.length > 0)
    .map((b) => ({ ...b, h: 1 + b.items.length }));
  const showMore = famBlocks.length > 0;
  let packedCols = [];
  if (showMore) {
    const sorted = famBlocks.slice().sort((a, z) => z.h - a.h);
    const cols = [[], [], []], hs = [0, 0, 0];
    for (const b of sorted) {
      let i = 0;
      for (let j = 1; j < 3; j++) { if (hs[j] < hs[i]) i = j; }
      cols[i].push(b); hs[i] += b.h;
    }
    packedCols = cols.filter((c) => c.length > 0);
  }

  // Win-only celebratory confetti (fires when the player fully completes the
  // game). Deterministic + reduced-motion aware; the shared card means every
  // daily puzzle gets the same burst on a finish, with no per-client wiring.
  const confetti = React.useMemo(() => {
    if (!won) return [];
    const cols = [meta.accent, GOLD, '#2563eb', '#15803d', '#c0392b', '#c026d3', '#0e7490'];
    return Array.from({ length: 96 }, (_, i) => {
      const w = 7 + ((i * 13) % 8);
      return {
        left: `${(i * 137) % 100}%`,
        w, h: Math.round(w * 1.6),
        color: cols[i % cols.length],
        dur: `${2.2 + ((i * 29) % 15) / 10}s`,
        delay: `${((i * 53) % 80) / 100}s`,
      };
    });
  }, [won, meta.accent]);

  // --- expanded-tile board rows ---------------------------------------------
  // Each rank tile expands in place to its board's top 10, the viewer's own row
  // highlighted, plus a "Full leaderboard" link to the on-page board below.
  function tileBoard(which) {
    if (which === 'iq') {
      const rows = (iq && Array.isArray(iq.window)) ? iq.window : [];
      return rows.map((r) => ({ rank: r.rank, name: r.name, val: `${(r.xp || 0).toLocaleString()} IQ`, me: !!r.me }));
    }
    if (which === 'today') {
      const rows = (todayGame && Array.isArray(todayGame.board)) ? todayGame.board : [];
      return rows.map((r) => ({ rank: r.rank, name: r.username, val: fmtPts(r.points), me: !!(myKey && r.userKey === myKey) }));
    }
    if (which === 'combined') {
      const rows = Array.isArray(overallBoard) ? overallBoard : [];
      return rows.map((r) => ({ rank: r.rank, name: r.username, val: fmtPts(r.total), me: !!(myKey && r.userKey === myKey) }));
    }
    if (which === 'alltime') {
      const rows = (allTime && Array.isArray(allTime.board)) ? allTime.board : [];
      return rows.map((r) => ({ rank: r.rank, name: r.username, val: fmtPts(r.points), me: !!r.isMe }));
    }
    return [];
  }
  const fmtPts = (x) => (x == null ? '' : `${Math.round(Number(x) * 10) / 10} pts`);

  // --- archive completion (this game's drops played) ------------------------
  const playedCount = (drops || []).filter((d) => d.played).length;
  const totalDrops = (drops || []).length;
  const archivePct = totalDrops ? Math.round((playedCount / totalDrops) * 100) : null;

  // --- calendar month cells -------------------------------------------------
  const dropByISO = new Map((drops || []).map((d) => [d.dateISO, d]));
  const todayISO = etTodayEC();
  const monthYMs = (drops && drops.length) ? {
    earliest: drops[0].dateISO.slice(0, 7),
    latest: todayISO.slice(0, 7),
  } : { earliest: todayISO.slice(0, 7), latest: todayISO.slice(0, 7) };
  const [calY, calM] = calMonth.split('-').map(Number);
  const monthLabel = `${MONTH_NAMES[(calM - 1) % 12]} ${calY}`;
  const firstWeekday = new Date(Date.UTC(calY, calM - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(calY, calM, 0)).getUTCDate();
  const calCells = [];
  for (let k = 0; k < firstWeekday; k++) calCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calCells.push(d);
  const shiftMonth = (delta) => {
    let y = calY, m = calM + delta;
    while (m < 1) { m += 12; y -= 1; }
    while (m > 12) { m -= 12; y += 1; }
    setCalMonth(`${y}-${String(m).padStart(2, '0')}`);
  };
  const canPrev = calMonth > monthYMs.earliest;
  const canNext = calMonth < monthYMs.latest;

  // Render one rank tile (plain helper, not a nested component). `prov` badges the
  // rank as provisional (a guest's would-be standing).
  const renderTile = (id, label, rank, field, dash, prov) => (
    <button
      type="button"
      className={`dec-tile${openTile === id ? ' open' : ''}`}
      key={id}
      aria-label={`Expand ${label} leaderboard`}
      aria-expanded={openTile === id}
      onClick={() => setOpenTile((o) => (o === id ? null : id))}
    >
      <div className="dec-tile-lbl">{label}</div>
      {dash ? (
        <div className="dec-tile-rk"><span className="dash">—</span></div>
      ) : rank ? (
        <div className="dec-tile-rk">#{rank}{prov ? <span className="prov"> prov.</span> : null}</div>
      ) : (
        <div className="dec-tile-rk"><span className="dash">·</span></div>
      )}
      <div className="dec-tile-of">{field ? <>of {field}</> : (dash ? 'registered only' : ' ')}</div>
      <span className="dec-tile-mx">
        <ChevronDown size={15} strokeWidth={2.4} style={{ transform: openTile === id ? 'rotate(180deg)' : 'none', transition: 'transform .15s ease' }} />
      </span>
    </button>
  );

  // The month calendar, shared by the desktop archive TILE (expands in place) and
  // the mobile archive SLIP (expands below). Only one is ever active at a time,
  // because the archive tile is hidden on mobile and the slip is hidden on
  // desktop (so the other's toggle can never fire).
  const calendarEl = (
    <div className="dec-cal">
      <div className="dec-cal-hd">
        <span className="dec-cal-mo">{monthLabel}</span>
        <div className="dec-cal-nav">
          <button type="button" onClick={() => shiftMonth(-1)} disabled={!canPrev} aria-label="Previous month"><ChevronLeft size={16} strokeWidth={2.4} /></button>
          <button type="button" onClick={() => shiftMonth(1)} disabled={!canNext} aria-label="Next month"><ChevronRight size={16} strokeWidth={2.4} /></button>
        </div>
      </div>
      <div className="dec-cal-grid">
        {WEEKDAYS.map((w, i) => <div className="dec-cal-wd" key={`wd${i}`}>{w}</div>)}
        {calCells.map((d, i) => {
          if (d == null) return <div className="dec-cal-cell empty" key={`e${i}`} />;
          const iso = `${calMonth}-${String(d).padStart(2, '0')}`;
          const drop = dropByISO.get(iso);
          const isToday = iso === todayISO;
          if (!drop) return <div className={`dec-cal-cell none${isToday ? ' today' : ''}`} key={iso}>{d}</div>;
          const cls = drop.played ? 'played' : 'unplayed';
          return <a className={`dec-cal-cell ${cls}${isToday ? ' today' : ''}`} href={drop.href} key={iso} title={drop.played ? 'Played' : 'Play this drop'}>{d}</a>;
        })}
      </div>
      <div className="dec-cal-key">
        <span><span className="dec-cal-sw" style={{ background: '#e8f5ec', border: '1px solid #bfe3ca' }} />Played</span>
        <span><span className="dec-cal-sw" style={{ background: '#fff', border: `1px solid ${BORD}` }} />Unplayed</span>
        <span><span className="dec-cal-sw" style={{ background: '#fff', boxShadow: `0 0 0 2px ${BLUE}` }} />Today</span>
      </div>
    </div>
  );

  // Share the whole day as one 1080x1080 card (brain meter filled by how much of
  // the slate is cleared, the day's IQ gain, the standing tiles). Native share
  // sheet where the browser takes files, download everywhere else. The credit
  // pop-up follows so the player has their referral link to post with the image.
  const shareDay = async () => {
    if (dayBusy) return;
    setDayBusy(true);
    try { await shareDayCard(); } catch (e) { /* nothing to show: the button just re-enables */ }
    setDayBusy(false);
  };

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
        .dec-x{position:absolute;top:12px;right:12px;width:30px;height:30px;padding:0;display:flex;align-items:center;justify-content:center;border-radius:9px;background:#fff;border:1px solid ${BORD};color:${SLATE};cursor:pointer;z-index:3;}
        .dec-x:hover{color:${INK};background:#f7f8fa;}

        .dec-head{margin-bottom:12px;}
        .dec-idrow{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px;}
        .dec-check{width:30px;height:30px;border-radius:50%;background:#e8f5ec;color:#15803d;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;}
        .dec-check.loss{background:#fdecec;color:${RUST};}
        .dec-titlerow{display:flex;align-items:center;flex-wrap:wrap;gap:4px 10px;margin-bottom:5px;}
        .dec-title{font-size:25px;font-weight:800;letter-spacing:-.02em;color:${INK};}
        .dec-detail{font-size:13px;font-weight:600;color:${SLATE};}
        .dec-sub{display:flex;align-items:center;gap:7px;font-size:13px;color:${SLATE};flex-wrap:wrap;}
        .dec-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;}
        .dec-sub b{font-weight:800;color:${INK};}
        .dec-sub .sc{color:${SLATE};}
        .dec-answer{display:flex;align-items:baseline;gap:9px;margin:9px 0 0;}
        .dec-answer-lbl{font-family:${MONO};font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:${SLATE};flex-shrink:0;}
        .dec-answer-word{font-size:21px;font-weight:800;letter-spacing:-.02em;color:${RUST};}
        .dec-idbox{display:inline-flex;align-items:center;gap:8px;font-family:${SANS};font-size:12.5px;font-weight:700;color:${INK};background:#f4f6fa;border:1px solid ${BORD};border-radius:999px;padding:5px 13px 5px 5px;max-width:100%;}
        .dec-idbox .av{width:23px;height:23px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;}
        .dec-idbox .nm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        button.dec-idbox{cursor:pointer;color:${BLUE};background:#eff4fd;border-color:#cfe0fb;padding:8px 15px;}
        button.dec-idbox:hover{background:#e4eefc;}
        .dec-share{font-family:${SANS};font-weight:800;font-size:12.5px;color:#fff;background:${INK};border:1px solid ${INK};border-radius:10px;padding:10px 16px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap;}
        .dec-share:hover{filter:brightness(1.12);}
        .dec-day{font-family:${SANS};font-weight:800;font-size:12.5px;color:${BLUE};background:#eff4fd;border:1px solid #d7e3f8;border-radius:10px;padding:10px 16px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap;}
        .dec-day:hover{background:#e4edfb;}
        .dec-day[disabled]{opacity:.6;cursor:default;}

        .dec-tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:10px;}
        .dec-tiles-loading{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;height:74px;margin-bottom:10px;border:1px solid ${BORD};border-radius:12px;background:#f7f8fa;font-family:${MONO};font-size:11px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:${SLATE};}
        .dec-tiles-loading::after{content:'';position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent);animation:dec-shim 1.15s ease-in-out infinite;}
        @media(prefers-reduced-motion:reduce){.dec-tiles-loading::after{animation:none;}}
        .dec-tile-cal{position:absolute;top:9px;right:8px;color:${SLATE};}
        .dec-tile{position:relative;display:block;width:100%;text-align:left;font-family:inherit;cursor:pointer;border:1px solid ${BORD};background:#f7f8fa;border-radius:12px;padding:11px 12px 10px;min-width:0;transition:background .12s ease,border-color .12s ease;}
        .dec-tile:hover{background:#fff;border-color:#cfd6e2;}
        .dec-tile.open{border-color:${BLUE};box-shadow:0 0 0 1px ${BLUE};background:#fff;}
        .dec-tile-lbl{font-family:${MONO};font-size:9.5px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:${SLATE};padding-right:22px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        /* Rank number and "of N" share ONE baseline-aligned line (of N to the
           right of the number) to reclaim vertical space and fill the tile width. */
        .dec-tile-rk{font-size:23px;font-weight:800;letter-spacing:-.02em;color:${INK};line-height:1.1;margin-top:3px;display:inline-block;vertical-align:baseline;}
        .dec-tile-rk .prov{font-size:11px;font-weight:700;color:${FADED};}
        /* IQ tile: the number is a GAIN, so it reads green, and it carries a
           second line for the day's running total (suppressed when this is the
           player's first daily of the day, where it would just repeat the gain). */
        .dec-tile-rk.gain{color:#15803d;}
        /* At five across the card is 760px wide, so a tile's inner width is only
           ~112px. "+96" plus a baseline-shared "#7 of 2,000" needs ~116px and
           would wrap, so the IQ tile puts its rank on its OWN line instead of
           sharing the number's baseline the way the rank tiles do. */
        .dec-tile-iq .dec-tile-of{display:block;margin-left:0;font-size:11px;margin-top:1px;}
        .dec-tile-of .prov{font-weight:700;color:${FADED};}
        .dec-tile-sub2{font-size:10.5px;font-weight:700;color:#15803d;margin-top:2px;line-height:1.2;}
        .dec-tile-rk .dash{color:#c2c8d2;}
        .dec-tile-of{font-size:11.5px;color:${FADED};display:inline-block;vertical-align:baseline;margin-left:6px;}
        .dec-tile-mx{position:absolute;top:7px;right:6px;width:20px;height:20px;display:flex;align-items:center;justify-content:center;color:${SLATE};pointer-events:none;}
        .dec-tile.open .dec-tile-mx,.dec-tile:hover .dec-tile-mx{color:${BLUE};}

        .dec-expand{border:1px solid ${BORD};border-radius:12px;padding:11px 13px 9px;margin:-2px 0 12px;background:#fff;}
        .dec-expand-hd{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:6px;}
        .dec-expand-ti{font-family:${MONO};font-size:10px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:${SLATE};}
        .dec-expand-full{font-size:11.5px;font-weight:800;color:${BLUE};background:none;border:none;padding:0;cursor:pointer;display:inline-flex;align-items:center;gap:3px;}
        .dec-lbrow{display:flex;align-items:center;gap:9px;font-size:13px;padding:4px 7px;border-radius:7px;}
        .dec-lbrow.me{background:#eff4fd;}
        .dec-lbrow .rk{font-family:${MONO};font-size:11px;color:${FADED};width:26px;flex-shrink:0;}
        .dec-lbrow .nm{font-weight:700;color:${INK};min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;}
        .dec-lbrow.me .nm{font-weight:800;}
        .dec-lbrow .vl{font-family:${MONO};font-size:11.5px;color:${SLATE};flex-shrink:0;}
        .dec-lbempty{font-size:12.5px;color:${FADED};padding:6px 2px;}

        .dec-slip{display:flex;align-items:center;gap:8px;font-size:12.5px;padding:9px 13px;border-radius:11px;margin-bottom:10px;width:100%;text-align:left;}
        .dec-slip.info{background:#eff4fd;border:1px solid #d7e3f8;color:${SLATE};}
        .dec-slip.info b{font-weight:800;color:${NAVY};}
        .dec-slip.neutral{background:#f7f8fa;border:1px solid ${BORD};color:${SLATE};cursor:pointer;font-family:${SANS};font-weight:600;}
        .dec-slip.neutral:hover{background:#eef0f4;}
        .dec-slip .clink{font:inherit;font-weight:800;color:${BLUE};background:none;border:none;padding:0;text-decoration:underline;text-underline-offset:2px;cursor:pointer;}
        .dec-slip .chev{margin-left:auto;display:inline-flex;color:${SLATE};}
        .dec-slip-archive{display:flex;flex-direction:column;align-items:stretch;gap:7px;}
        .dec-slip-right{margin-left:auto;display:inline-flex;align-items:center;gap:9px;flex:none;}
        .dec-slip-archive .chev{margin-left:0;}
        .dec-slip-pct{font-weight:800;color:${INK};white-space:nowrap;}
        /* Archive bar: the label row, then a completion bar spanning the
           button. The bar is aria-hidden because the row already states the same
           value in words ("8/13 played · 62%"). */
        .dec-arc-row{display:flex;align-items:center;gap:8px;width:100%;min-width:0;}
        .dec-arc-lbl{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .dec-arc-track{display:block;width:100%;height:5px;border-radius:999px;background:#e2e6ee;overflow:hidden;}
        .dec-arc-fill{display:block;height:100%;border-radius:999px;background:${BLUE};transition:width .3s ease;}

        .dec-cal{border:1px solid ${BORD};border-radius:12px;padding:12px 13px;margin:-2px 0 12px;background:#fff;}
        .dec-cal-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px;}
        .dec-cal-mo{font-size:14px;font-weight:800;color:${INK};}
        .dec-cal-nav{display:flex;gap:6px;}
        .dec-cal-nav button{width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid ${BORD};background:#fff;color:${SLATE};cursor:pointer;}
        .dec-cal-nav button:disabled{opacity:.4;cursor:default;}
        .dec-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;}
        .dec-cal-wd{font-family:${MONO};font-size:9.5px;color:${FADED};text-align:center;padding-bottom:2px;}
        .dec-cal-cell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border-radius:8px;color:#c2c8d2;}
        .dec-cal-cell.empty{background:transparent;}
        .dec-cal-cell.none{color:#c9cdd6;}
        a.dec-cal-cell{text-decoration:none;}
        a.dec-cal-cell.played{background:#e8f5ec;color:#15803d;border:1px solid #bfe3ca;}
        a.dec-cal-cell.unplayed{background:#fff;color:${SLATE};border:1px solid ${BORD};}
        a.dec-cal-cell.unplayed:hover{border-color:${BLUE};color:${BLUE};}
        a.dec-cal-cell.today{box-shadow:0 0 0 2px ${BLUE};}
        .dec-cal-key{display:flex;flex-wrap:wrap;gap:10px 14px;margin-top:10px;font-size:11px;color:${FADED};}
        .dec-cal-key span{display:inline-flex;align-items:center;gap:5px;}
        .dec-cal-sw{width:11px;height:11px;border-radius:3px;flex-shrink:0;}

        .dec-duo{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;}
        .dec-sk{position:relative;overflow:hidden;background:#dfe6f1;border-radius:6px;}
        .dec-sk::after{content:'';position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent);animation:dec-shim 1.15s ease-in-out infinite;}
        @keyframes dec-shim{100%{transform:translateX(100%);}}
        .dec-sk-ring{width:50px;height:50px;border-radius:50%;flex-shrink:0;}
        .dec-sk-line{height:11px;}
        .dec-sk-btn{height:34px;border-radius:10px;}
        .dec-fadein{animation:dec-fadein .32s ease both;}
        @keyframes dec-fadein{from{opacity:0;transform:translateY(3px);}to{opacity:1;transform:none;}}
        @media(prefers-reduced-motion:reduce){.dec-sk::after{animation:none;}.dec-fadein{animation:none;}}
        /* Popular-quiz suggestion rows only: let the full title wrap to a 2nd line
           (daily-game rows keep their single-line ellipsis), and give every tile
           the SAME height so the grid looks uniform regardless of title length. */
        .dec-row.dec-pop{align-items:flex-start;min-height:72px;box-sizing:border-box;}
        .dec-row.dec-pop .nm{white-space:normal;}
        .dec-row.dec-pop .nm span.t{white-space:normal;overflow:visible;text-overflow:clip;}
        .dec-row.dec-pop .play{align-self:center;}
        .dec-nx{border:1px solid #d7e3f8;background:#eff4fd;border-radius:14px;padding:13px 14px;display:flex;flex-direction:column;justify-content:space-between;gap:11px;min-width:0;}
        .dec-nx-top{display:flex;align-items:center;gap:12px;min-width:0;}
        .dec-ring{position:relative;width:50px;height:50px;flex-shrink:0;}
        .dec-ring .num{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:800;color:${INK};}
        .dec-eye{font-family:${MONO};font-size:10px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;margin-bottom:2px;}
        .dec-nx-name{font-size:18px;font-weight:800;letter-spacing:-.01em;color:${INK};}
        .dec-nx-tag{font-size:12px;color:${SLATE};margin-top:1px;}
        .dec-nx-btns{display:flex;gap:7px;}
        .dec-nx-btns .b{flex:1;justify-content:center;font-family:${SANS};font-weight:800;font-size:12.5px;border-radius:10px;padding:9px 12px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;text-decoration:none;border:1px solid ${BORD};background:#fff;color:${SLATE};}
        .dec-nx-btns .b.primary{background:${BLUE};border-color:${BLUE};color:#fff;}
        .dec-nx-btns .b:hover{filter:brightness(0.98);}

        .dec-ez{border:1px solid #f0e3bb;background:#fdf6e4;border-radius:14px;padding:13px 14px;display:flex;flex-direction:column;justify-content:space-between;gap:11px;min-width:0;}
        .dec-ez-top{display:flex;align-items:center;gap:11px;min-width:0;}
        .dec-ez-name{font-size:18px;font-weight:800;letter-spacing:-.01em;color:${INK};display:flex;align-items:center;gap:7px;}
        .dec-ez-tag{font-size:12px;color:#8a6d1c;margin-top:1px;}
        .dec-ez-btn{display:block;width:100%;box-sizing:border-box;text-align:center;font-family:${SANS};font-weight:800;font-size:12.5px;color:#5c4a06;background:${GOLD};border:none;border-radius:10px;padding:10px 15px;cursor:pointer;text-decoration:none;white-space:nowrap;}

        .dec-morehd{display:flex;align-items:baseline;justify-content:space-between;margin:18px 2px 12px;}
        .dec-more-eye{font-family:${MONO};font-size:10.5px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:${SLATE};}
        .dec-more-count{font-size:12px;color:#8a92a6;}
        .dec-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;align-items:start;}
        .dec-grid.cols-1{grid-template-columns:minmax(0,1fr);}
        .dec-grid.cols-2{grid-template-columns:repeat(2,minmax(0,1fr));}
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
        .dec-row .play.resume{color:#b9791a;}
        .dec-rz{display:inline-flex;align-items:center;margin-left:5px;vertical-align:-1px;}

        .dec-foot{display:flex;align-items:stretch;gap:8px;margin-top:16px;}
        .dec-foot .dec-btn{flex:1;justify-content:center;}
        .dec-btn{font-family:${SANS};font-weight:700;font-size:12.5px;border:1px solid ${BORD};background:#fff;color:${SLATE};border-radius:10px;padding:9px 13px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;text-decoration:none;}
        .dec-btn:hover{background:#f7f8fa;}
        .dec-btn.ink{background:${INK};border-color:${INK};color:#fff;font-weight:800;}
        .dec-btn.ink:hover{filter:brightness(1.12);background:${INK};}
        .dec-land-btn{display:block;width:100%;box-sizing:border-box;text-align:center;margin-top:12px;padding:11px 14px;border:1px solid ${BORD};border-radius:10px;background:#fff;font-family:${MONO};font-size:11px;letter-spacing:.06em;text-transform:uppercase;font-weight:500;color:${NAVY};text-decoration:none;}
        .dec-land-btn:hover{background:#f7f8fa;}

        @media(max-width:640px){
          .dec-card{padding:18px 16px 14px;}
          .dec-titlerow{padding-right:40px;}
          .dec-title{font-size:22px;}
          .dec-idrow{gap:8px;}
          .dec-idrow > *{flex:1;justify-content:center;}
          /* Mobile: the four rank tiles stay side by side, tighter. */
          .dec-tiles{grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;}
          /* Four across on a phone is tight, so the IQ tile drops its "of N"
             field size (the expander shows it). The tighter .dec-tile type sizes
             below apply here too. */
          .dec-tile-iq .ofn{display:none;}
          .dec-tile{padding:9px 7px 8px;}
          .dec-tile-lbl{font-size:8px;letter-spacing:.03em;padding-right:15px;}
          .dec-tile-rk{font-size:18px;}
          .dec-tile-rk .prov{font-size:8.5px;}
          .dec-tile-of{font-size:10px;}
          .dec-tile-mx{top:6px;right:5px;width:17px;height:17px;border-radius:5px;}
          .dec-duo{grid-template-columns:1fr;}
          .dec-grid,.dec-grid.cols-1,.dec-grid.cols-2,.dec-grid.cols-3{grid-template-columns:1fr;}
          .dec-rows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;}
          .dec-rows.one{grid-template-columns:1fr;}
          .dec-row{margin-bottom:0;padding:8px 9px;}
          .dec-row .pl{display:none;}
          .dec-foot{flex-wrap:wrap;}
        }
      `}</style>

      {/* ---- 1. header ---- */}
      <div className="dec-head">
        <div className="dec-titlerow">
          <span className={`dec-check${won ? '' : ' loss'}`}>
            {won ? <CheckCircle2 size={19} strokeWidth={2.4} /> : <Flag size={17} strokeWidth={2.4} />}
          </span>
          <span className="dec-title">{isCompleted ? <>Completed {selfName}!</> : <>Not quite there today</>}</span>
          {score ? <span className="dec-detail">{score}</span> : null}
        </div>
        {answer ? (
          <div className="dec-answer">
            <span className="dec-answer-lbl">Answer</span>
            <span className="dec-answer-word">{answer}</span>
          </div>
        ) : null}
        {/* share (left) + identity (right) on one line; both fill width on mobile */}
        <div className="dec-idrow">
          <button type="button" className="dec-share" onClick={onShare}>
            <Share2 size={14} strokeWidth={2.2} /> Share result{!/copied/i.test(shareLabel || '') ? ' (for credit)' : ''}
          </button>
          {doneCount >= 3 ? (
            <button type="button" className="dec-day" onClick={shareDay} disabled={dayBusy}>
              <Brain size={14} strokeWidth={2.2} /> {dayBusy ? 'Building\u2026' : 'Share my day'}
            </button>
          ) : null}
          {hasEmail && username ? (
            <span className="dec-idbox">
              <span className="av" style={{ background: meta.accent }}>{String(username).slice(0, 1).toUpperCase()}</span>
              <span className="nm">{username}</span>
            </span>
          ) : (
            <button type="button" className="dec-idbox guest" onClick={goRegister}>
              <UserPlus size={15} strokeWidth={2.2} /> Sign up
            </button>
          )}
        </div>
      </div>

      {/* ---- 2. rank tiles (four, identical on desktop and mobile) ---- */}
      {ranksLoading ? (
        <div className="dec-tiles-loading" role="status" aria-live="polite">Loading your rankings…</div>
      ) : null}
      <div className="dec-tiles" style={ranksLoading ? { display: 'none' } : undefined}>
        {/* IQ Points: what this game paid, with the player's global IQ standing
            underneath. First tile because it is the one number that carries across
            every game, not just this drop. */}
        <button type="button" className={`dec-tile dec-tile-iq${openTile === 'iq' ? ' open' : ''}`} key="iq" aria-label="Expand your IQ Points ranking" aria-expanded={openTile === 'iq'} onClick={() => setOpenTile((o) => (o === 'iq' ? null : 'iq'))}>
          <div className="dec-tile-lbl">IQ Points</div>
          {iqGained != null ? (
            <div className="dec-tile-rk gain">+{iqGained.toLocaleString()}</div>
          ) : (
            <div className="dec-tile-rk"><span className="dash">{iqResolved ? '\u2014' : '\u00b7'}</span></div>
          )}
          <div className="dec-tile-of">
            {iq && iq.rank ? (
              <>#{iq.rank.toLocaleString()}{iq.provisional ? <span className="prov"> prov.</span> : null}<span className="ofn"> of {(iq.total || 0).toLocaleString()}</span></>
            ) : ' '}
          </div>
          {showIqToday ? <div className="dec-tile-sub2">+{iq.todayGained.toLocaleString()} today</div> : null}
          <span className="dec-tile-mx">
            <ChevronDown size={15} strokeWidth={2.4} style={{ transform: openTile === 'iq' ? 'rotate(180deg)' : 'none', transition: 'transform .15s ease' }} />
          </span>
        </button>
        {renderTile('today', 'This Puzzle', gameTodayRank, gameTodayField, false, provisional)}
        {renderTile('alltime', 'All Time', allTime ? allTime.myRank : null, allTime ? (allTime.plays ?? allTime.field) : null, !(allTime && allTime.myRank != null), !!(allTime && allTime.provisional))}
        {renderTile('combined', "Today's Puzzles", combinedRank, combinedField, false, provisional)}
      </div>
      {openTile ? (() => {
        const rows = tileBoard(openTile);
        const ti = openTile === 'iq' ? 'Global IQ Points ranking'
          : openTile === 'today' ? `${selfName} · this puzzle`
          : openTile === 'alltime' ? `${selfName} · all time`
          : "Today’s Puzzles · combined";
        return (
          <div className="dec-expand">
            <div className="dec-expand-hd">
              <span className="dec-expand-ti">{ti}</span>
              {openTile === 'iq' ? (
                <a className="dec-expand-full" href="/quizzes/hub?tab=player">Full ranking <ArrowRight size={12} strokeWidth={2.4} /></a>
              ) : (
                <button type="button" className="dec-expand-full" onClick={() => openPanel(openTile)}>Full leaderboard <ArrowRight size={12} strokeWidth={2.4} /></button>
              )}
            </div>
            {rows.length ? rows.map((r, idx) => (
              <div className={`dec-lbrow${r.me ? ' me' : ''}`} key={idx}>
                <span className="rk">#{r.rank}</span>
                <span className="nm">{r.name || '—'}</span>
                <span className="vl">{r.val}</span>
              </div>
            )) : <div className="dec-lbempty">{openTile === 'iq' ? 'Your IQ ranking appears once this game is counted.' : 'No board yet. Be the first to post a score.'}</div>}
          </div>
        );
      })() : null}
      {/* ---- 3. guest claim slip ---- */}
      {!hasEmail ? (
        <div className="dec-slip info">
          Ranks are unclaimed &middot; <button type="button" className="clink" onClick={goRegister}>select a username to claim</button>
        </div>
      ) : null}

      {/* ---- 4. archive bar (desktop and mobile alike) ---- */}
      {drops && drops.length ? (
        <>
          <button type="button" className="dec-slip neutral dec-slip-archive" onClick={() => setCalOpen((v) => !v)} aria-expanded={calOpen}>
            <span className="dec-arc-row">
              <CalendarDays size={15} strokeWidth={2} style={{ flex: 'none' }} />
              <span className="dec-arc-lbl">See the full {selfName} archive</span>
              <span className="dec-slip-right">
                {archivePct != null ? <span className="dec-slip-pct">{playedCount}/{totalDrops} &middot; {archivePct}%</span> : null}
                <span className="chev">{calOpen ? <ChevronLeft size={15} strokeWidth={2.4} style={{ transform: 'rotate(90deg)' }} /> : <ChevronRight size={15} strokeWidth={2.4} style={{ transform: 'rotate(90deg)' }} />}</span>
              </span>
            </span>
            {archivePct != null ? (
              <span className="dec-arc-track" aria-hidden="true">
                {/* A 0% archive still shows a sliver so the track reads as a
                    progress bar rather than an empty rule. */}
                <span className="dec-arc-fill" style={{ width: `${Math.max(2, archivePct)}%` }} />
              </span>
            ) : null}
          </button>
          {calOpen ? calendarEl : null}
        </>
      ) : null}

      {/* ---- 5. up next + easiest leaderboard ---- */}
      {/* Both cards are completion-derived, so each shows a shimmer skeleton until
          its data lands (never a guessed game), fades the real card in on arrival,
          and collapses if the fetch stalls past the skeleton timeout. */}
      {(!allDailiesDone && (nextReal || nextSkel || grab || grabSkel)) ? (
        <div className="dec-duo">
          {nextSkel ? (
            <div className="dec-nx" aria-hidden="true">
              <div className="dec-nx-top">
                <div className="dec-sk dec-sk-ring" />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="dec-sk dec-sk-line" style={{ width: '58%', marginBottom: 8 }} />
                  <div className="dec-sk dec-sk-line" style={{ width: '82%', height: 15, marginBottom: 7 }} />
                  <div className="dec-sk dec-sk-line" style={{ width: '66%' }} />
                </div>
              </div>
              <div className="dec-nx-btns"><div className="dec-sk dec-sk-btn" style={{ flex: 1 }} /></div>
            </div>
          ) : nextReal ? (
            <div className="dec-nx dec-fadein">
              <div className="dec-nx-top">
                <div className="dec-ring">
                  <svg width="50" height="50" viewBox="0 0 56 56" aria-hidden="true">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#dbe6f7" strokeWidth="5" />
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#2563eb" strokeWidth="5" strokeLinecap="round"
                      transform="rotate(-90 28 28)" strokeDasharray={RING_C} strokeDashoffset={ringOffset} />
                  </svg>
                  <span className="num">{autoRun ? secs : <ArrowRight size={17} strokeWidth={2.4} color="#2563eb" />}</span>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="dec-eye" style={{ color: BLUE }}>Up next &middot; most similar unplayed</div>
                  <div className="dec-nx-name">{nextTarget.name}</div>
                  <div className="dec-nx-tag">{nextTarget.tag}{autoRun ? <> &middot; {secs > 0 ? `opens in ${secs}s` : 'opening…'}</> : null}</div>
                </div>
              </div>
              <div className="dec-nx-btns">
                <a className="b primary" href={nextTarget.href}>Play now</a>
                {autoRun ? <button type="button" className="b" onClick={() => setAutoCancel(true)}>Not now</button> : null}
              </div>
            </div>
          ) : null}
          {grabSkel ? (
            <div className="dec-ez" aria-hidden="true">
              <div className="dec-ez-top">
                <div className="dec-sk" style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0 }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="dec-sk dec-sk-line" style={{ width: '62%', marginBottom: 8 }} />
                  <div className="dec-sk dec-sk-line" style={{ width: '46%', height: 15, marginBottom: 7 }} />
                  <div className="dec-sk dec-sk-line" style={{ width: '72%' }} />
                </div>
              </div>
              <div className="dec-sk dec-sk-btn" style={{ width: '100%' }} />
            </div>
          ) : grab ? (
            <div className="dec-ez dec-fadein">
              <div className="dec-ez-top">
                <Trophy size={22} strokeWidth={2} color="#b7791f" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="dec-eye" style={{ color: '#b7791f' }}>Easiest leaderboard today</div>
                  <div className="dec-ez-name"><span className="dec-dot" style={{ background: (CAT_META[grab.cat] || CAT_META.word).color }} />{grab.name}</div>
                  <div className="dec-ez-tag">{grab.registered > 0 ? <>Only {grab.registered} player{grab.registered === 1 ? '' : 's'} so far</> : <>No one&rsquo;s on the board yet</>}</div>
                </div>
              </div>
              <a className="dec-ez-btn" href={grab.href}>Play {grab.name}</a>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ---- 6. more of today's games ---- */}
      {/* Held until the completion set is known so the grid never lists a game the
          player already finished today (or shows a wrong "N of M played" count). */}
      {completionKnown && showMore ? (
        <>
          <div className="dec-morehd">
            <span className="dec-more-eye">More of today&rsquo;s puzzles</span>
            <span className="dec-more-count">{doneCount} of {total} played</span>
          </div>
          <div className={`dec-grid cols-${packedCols.length}`}>
            {packedCols.map((col, ci) => (
              <div className="dec-col" key={ci}>
                {col.map((block) => (
                  <div className="dec-group" key={block.cat}>
                    <div className="dec-gh" style={{ background: block.cm.color }}>
                      <span className="lbl">{block.cm.name}</span>
                      <span className="cnt">{block.items.length}</span>
                    </div>
                    <div className="dec-rows">
                    {block.items.map((g) => (
                      <a className={`dec-row${unfinished.has(g.key) ? ' resume' : ''}`} href={g.href} key={g.key}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div className="nm"><span className="t">{g.name}</span>{unfinished.has(g.key) ? <span className="dec-rz" aria-hidden="true"><svg viewBox="0 0 12 12" width="10" height="10" fill="none"><circle cx="6" cy="6" r="4" stroke="#e0b866" strokeWidth="1.8" /><path d="M6 2 A4 4 0 0 1 6 10" stroke="#d98a1f" strokeWidth="1.8" strokeLinecap="round" /></svg></span> : null}</div>
                          <div className="tg">{unfinished.has(g.key) ? 'Started, not finished' : g.tag}</div>
                        </div>
                        <span className={`play${unfinished.has(g.key) ? ' resume' : ''}`}><span className="pl">{unfinished.has(g.key) ? 'Resume' : 'Play'}</span><ArrowRight size={11} strokeWidth={2.6} /></span>
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

      {/* ---- 6b. half or fewer dailies left: popular quizzes, one per category ---- */}
      {showPopular ? (
        <>
          <div className="dec-morehd">
            <span className="dec-more-eye">{allDailiesDone ? <>You&rsquo;ve cleared today&rsquo;s dailies &middot; try a quiz</> : <>While you&rsquo;re here &middot; try a quiz</>}</span>
            <span className="dec-more-count">{popularCats && popularCats.length ? 'one per category' : ''}</span>
          </div>
          {popularCats && popularCats.length ? (
            <div className={`dec-grid cols-${Math.min(3, popularCats.length)}`}>
              {(() => {
                const N = Math.min(3, popularCats.length);
                const cols = Array.from({ length: N }, () => []);
                popularCats.forEach((c, i) => cols[i % N].push(c));
                return cols.map((col, ci) => (
                  <div className="dec-col" key={ci}>
                    {col.map((c) => (
                      <div className="dec-group" key={c.dept}>
                        <div className="dec-gh" style={{ background: c.color }}>
                          <span className="lbl">{c.label}</span>
                        </div>
                        <div className="dec-rows one">
                          <a className="dec-row dec-pop dec-fadein" href={c.href}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div className="nm"><span className="t">{c.title}</span></div>
                              <div className="tg">{c.plays ? `${c.plays.toLocaleString()} plays` : 'Popular quiz'}</div>
                            </div>
                            <span className="play"><span className="pl">Play</span><ArrowRight size={11} strokeWidth={2.6} /></span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ));
              })()}
            </div>
          ) : (
            <div className="dec-grid cols-3" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div className="dec-col" key={i}>
                  <div className="dec-group">
                    <div className="dec-sk" style={{ height: 34, borderRadius: 10, marginBottom: 8 }} />
                    <div className="dec-sk" style={{ height: 48, borderRadius: 11 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}

      {/* ---- 7. bottom actions ---- */}
      <div className="dec-foot">
        <button type="button" className="dec-btn" onClick={() => openPanel('today')}>
          <BarChart3 size={15} strokeWidth={2} /> Leaderboards
        </button>
        {pastHref ? (
          <a className="dec-btn ink" href={pastHref}>
            <RotateCcw size={15} strokeWidth={2} /> Play a past {selfName}
          </a>
        ) : null}
      </div>

      <a className="dec-land-btn" href="/daily">Daily puzzle landing page &rarr;</a>

      {self ? (
        <ReportIssue
          self={self}
          name={selfName}
          accent={meta.accent}
        />
      ) : null}
    </div>
  );

  // Confetti is a fixed, pointer-events-off overlay rendered continuously so it
  // plays over the completed board during the reveal delay AND behind the popup.
  const confettiEl = confetti.length ? (
    <div aria-hidden="true">
      <style>{`
        .dec-conf{position:fixed;top:-6vh;z-index:120;pointer-events:none;border-radius:2px;will-change:transform,opacity;animation:dec-fall linear forwards;}
        @keyframes dec-fall{0%{transform:translateY(-6vh) rotate(0deg);opacity:1;}85%{opacity:1;}100%{transform:translateY(112vh) rotate(710deg);opacity:0;}}
        @media(prefers-reduced-motion:reduce){.dec-conf{display:none;}}
      `}</style>
      {confetti.map((c, i) => (
        <span
          key={i}
          className="dec-conf"
          style={{ left: c.left, width: c.w, height: c.h, background: c.color, animationDuration: c.dur, animationDelay: c.delay }}
        />
      ))}
    </div>
  ) : null;

  if (!modal) {
    return (<>{confettiEl}{revealed ? inner : null}</>);
  }
  return (
    <>
      {confettiEl}
      {revealed ? (
        <div className="dec-backdrop" onClick={onClose}>
          <div style={{ width: '100%', maxWidth: 760, margin: 'auto' }} onClick={(e) => e.stopPropagation()}>
            {inner}
          </div>
        </div>
      ) : null}
    </>
  );
}

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
// selected tile's row, which pushed every later tile down the page).
//
// CLICK MODEL (owner, 2026-07-31): the panel is no longer what a tile click
// does by default. A tile you have NOT finished today is a PLAIN LINK into the
// game, so the board is one tap from playing and nothing stands between the
// player and the puzzle; a small chart glyph in its bottom-right corner still
// opens the panel for anyone who wants the archive first. A FINISHED tile is
// where the panel lives: it turns solid green, sheds its icon and category
// chip, reads "Click for stats & archive", and the whole tile opens the panel.
// The panel carries the game's identity and a
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
// tokens (bg #f7f8fa / surface #fff / accent #1e3a8a / cta #2563eb).
//
// Data wiring is unchanged from the strip: completion follows the signed-in
// player across devices via /api/quiz/daily-status (with the same-device
// localStorage sot_<key>_day breadcrumb + per-puzzle save detection for first
// paint), per-game streaks come from daily-status, and the leaderboard payload
// is the /api/quiz/daily-combined `board` prop. Adding a game to GAMES adds it
// to the board everywhere it's used.

import React, { useState, useEffect, useRef } from 'react';
import { Crown, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Trophy, Play, Flame, ArrowRight, Users, X, BarChart3, Star } from 'lucide-react';
import useDailyOrder, { sortByDailyOrder } from './useDailyOrder';
import useMyGames, { sortByMyGames } from './useMyGames';
import DailyTilePanel from './DailyTilePanel';
import { T } from '@/lib/theme';
import { fetchDayStatus } from './useDayStats';
import { catBlue } from '@/lib/home-blues';
import { isSundayET } from '@/lib/sunday-editions';
import { isRetiredDaily, dailyScoreText, KEEPS_ANSWER } from '@/lib/daily-games';

const GAMES = [
  { key: 'crux', href: '/crux', name: 'Crux', img: '/games/btn-crux.png', store: 'sot_crux_day', tag: "A clueless crossword" , cat: 'Word' },
  { key: 'emcee', href: '/emcee', name: 'Emcee', img: '/games/btn-emcee.png', store: 'sot_emcee_day', tag: "The daily mini crossword" , cat: 'Word' },
  { key: 'shards', href: '/shards', name: 'Shards', img: '/games/btn-shards.png', store: 'sot_shards_day', tag: "Reassemble the crossword" , cat: 'Word' },
  { key: 'garble', href: '/garble', name: 'Garble', img: '/games/btn-garble.png', store: 'sot_garble_day', tag: "Untangle five words" , cat: 'Word' },
  { key: 'links', href: '/links', name: 'Links', img: '/games/btn-links.png', store: 'sot_links_day', tag: "Four hidden threads" , cat: 'Word' },
  { key: 'span', href: '/span', name: 'Span', img: '/games/btn-span.png', store: 'sot_span_day', tag: "Cross the map" , cat: 'Geography' },
  { key: 'dating', href: '/dating', name: 'Dating', img: '/games/btn-dating.png', store: 'sot_dating_day', tag: "Put history in order" , cat: 'Trivia' },
  { key: 'tally', href: '/tally', name: 'Tally', img: '/games/btn-tally.png', store: 'sot_tally_day', tag: "Balance the books" , cat: 'Numbers' },
  { key: 'suds', href: '/suds', name: 'Suds', img: '/games/btn-suds.png', store: 'sot_suds_day', tag: "The daily sudoku" , cat: 'Numbers' },
  { key: 'carve', href: '/carve', name: 'Carve', img: '/games/btn-carve.png', store: 'sot_carve_day', tag: "Equal-sum blocks" , cat: 'Numbers' },
  { key: 'extra', href: '/extra', name: 'Extra', img: '/games/btn-extra.png', store: 'sot_extra_day', tag: "Name the story" , cat: 'Trivia' },
  { key: 'stet', href: '/stet', name: 'Stet', img: '/games/btn-stet.png', store: 'sot_stet_day', tag: "Spot the error, fix the copy" , cat: 'Word' },
  { key: 'outwit', href: '/outwit', name: 'Outwit', img: '/games/btn-outwit.png', store: 'sot_outwit_day', tag: "Beat the crowd" , cat: 'Crowd Psychology' },
  { key: 'outrank', href: '/outrank', name: 'Outrank', img: '/games/btn-outrank.png', store: 'sot_outrank_day', tag: "Call the crowd's order" , cat: 'Crowd Psychology' },
  { key: 'tuck', href: '/tuck', name: 'Tuck', img: '/games/btn-tuck.png', store: 'sot_tuck_day', tag: "Same letters, highest score wins" , cat: 'Word' },
  { key: 'alibi', href: '/alibi', name: 'Alibi', img: '/games/btn-alibi.png', store: 'sot_alibi_day', tag: "Solve the nightly whodunit" , cat: 'Logic' },
  { key: 'cipher', href: '/cipher', name: 'Cipher', img: '/games/btn-cipher.png', store: 'sot_cipher_day', tag: "Crack the letter math" , cat: 'Numbers' },
  { key: 'ping', href: '/ping', name: 'Ping', img: '/games/btn-ping.png', store: 'sot_ping_day', tag: "Guess the secret city" , cat: 'Geography' },
  { key: 'warmer', href: '/warmer', name: 'Warmer', img: '/games/btn-warmer.png', store: 'sot_warmer_day', tag: "Hotter or colder" , cat: 'Word' },
  { key: 'jester', href: '/jesters', name: 'Jesters', img: '/games/btn-jester.png', store: 'sot_jester_day', tag: "Seat the court" , cat: 'Logic' },
  { key: 'sworn', href: '/sworn', name: 'Sworn', img: '/games/btn-sworn.png', store: 'sot_sworn_day', tag: "Spot the liars" , cat: 'Logic' },
  { key: 'axiom', href: '/axiom', name: 'Axiom', img: '/games/btn-axiom.png', store: 'sot_axiom_day', tag: "Find the hidden rule" , cat: 'Logic' },
  { key: 'hearsay', href: '/hearsay', name: 'Hearsay', img: '/games/btn-hearsay.png', store: 'sot_hearsay_day', tag: "Deduce what they don't know" , cat: 'Logic' },
  { key: 'venn', href: '/venn', name: 'Venn', img: '/games/btn-venn.png', store: 'sot_venn_day', tag: "Sort the overlaps" , cat: 'Logic' },
  { key: 'stands', href: '/stands', name: 'Stands', img: '/games/btn-stands.png', store: 'sot_stands_day', tag: "Rebuild the results" , cat: 'Logic' },
  { key: 'bracket', href: '/bracket', name: 'Bracket', img: '/games/btn-bracket.png', store: 'sot_bracket_day', tag: "Name every winner" , cat: 'Trivia' },
  { key: 'pricer', href: '/pricer', name: 'Pricer', img: '/games/btn-pricer.png', store: 'sot_pricer_day', tag: "Higher price wins" , cat: 'Numbers' },
  { key: 'lode', href: '/lode', name: 'Lode', img: '/games/btn-lode.png', store: 'sot_lode_day', tag: "Seven letters, rare words pay" , cat: 'Word' },
  { key: 'etch', href: '/etch', name: 'Etch', img: '/games/btn-etch.png', store: 'sot_etch_day', tag: "A picture in the numbers" , cat: 'Logic' },
  { key: 'glyph', href: '/glyph', name: 'Glyph', img: '/games/btn-glyph.png', store: 'sot_glyph_day', tag: "A crossword with no clues" , cat: 'Word' },
  { key: 'hedge', href: '/hedge', name: 'Hedge', img: '/games/btn-hedge.png', store: 'sot_hedge_day', tag: "Draw one closed loop" , cat: 'Logic' },
  { key: 'listed', href: '/listed', name: 'Listed', img: '/games/btn-listed.png', store: 'sot_listed_day', tag: "Rank the list, top to bottom" , cat: 'Trivia' },
  { key: 'mate', href: '/mate', name: 'Mate', img: '/games/btn-mate.png', store: 'sot_mate_day', tag: "White to play and mate" , cat: 'End Game' },
  { key: 'four', href: '/four', name: 'Four', img: '/games/btn-four.png', store: 'sot_four_day', tag: "One column wins" , cat: 'End Game' },
  { key: 'park', href: '/parker', name: 'Parker', img: '/games/btn-park.png', store: 'sot_park_day', tag: "Get the red one out" , cat: 'Logic' },
  { key: 'check', href: '/check', name: 'Check', img: '/games/btn-check.png', store: 'sot_check_day', tag: "Red to play and sweep" , cat: 'End Game' },
  { key: 'rung', href: '/rung', name: 'Rung', img: '/games/btn-rung.png', store: 'sot_rung_day', tag: "One letter at a time" , cat: 'Word' },
  { key: 'crunch', href: '/crunch', name: 'Crunch', img: '/games/btn-crunch.png', store: 'sot_crunch_day', tag: "Six numbers, one target" , cat: 'Numbers' },
  { key: 'taire', href: '/taire', name: 'Taire', img: '/games/btn-taire.png', store: 'sot_taire_day', tag: "The daily solitaire" , cat: 'Cards' },
  { key: 'fib', href: '/fib', name: 'Fib', img: '/games/btn-fib.png', store: 'sot_fib_day', tag: "One clue is lying" , cat: 'Logic' },
  { key: 'streak', href: '/streak', name: 'Streak', img: '/games/btn-streak.png', store: 'sot_streak_day', tag: "Forty questions, one life" , cat: 'Trivia' },
  { key: 'feud', href: '/feud', name: 'Feud', img: '/games/btn-feud.png', store: 'sot_feud_day', tag: "Match the crowd" , cat: 'Crowd Psychology' },
  { key: 'babel', href: '/babel', name: 'Babel', img: '/games/btn-babel.png', store: 'sot_babel_day', tag: "The bag is empty" , cat: 'End Game' },
  { key: 'hands', href: '/hands', name: 'Hands', img: '/games/btn-hands.png', store: 'sot_hands_day', tag: "The daily poker solitaire" , cat: 'Cards' },
  { key: 'chain', href: '/chain', name: 'Chain', img: '/games/btn-chain.png', store: 'sot_chain_day', tag: "Take them, or leave them" , cat: 'End Game' },
  { key: 'turn', href: '/turn', name: 'Turn', img: '/games/btn-turn.png', store: 'sot_turn_day', tag: "Ten squares left" , cat: 'End Game' },
  { key: 'suffice', href: '/suffice', name: 'Suffice', img: '/games/btn-suffice.png', store: 'sot_suffice_day', tag: "Decide what is enough" , cat: 'Logic' },
  { key: 'strata', href: '/strata', name: 'Strata', img: '/games/btn-strata.png', store: 'sot_strata_day', tag: "Dig the words out" , cat: 'Word' },
  { key: 'chomp', href: '/chomp', name: 'Chomp', img: '/games/btn-chomp.png', store: 'sot_chomp_day', tag: "Eat them in order" , cat: 'Logic' },
  { key: 'blocks', href: '/blocks', name: 'Blocks', img: '/games/btn-blocks.png', store: 'sot_blocks_day', tag: "Same shapes, same order" , cat: 'Arcade' },
  { key: 'sweep', href: '/sweep', name: 'Sweep', img: '/games/btn-sweep.png', store: 'sot_sweep_day', tag: "No bottom edge" , cat: 'Arcade' },
  { key: 'redact', href: '/redact', name: 'Redact', img: '/games/btn-redact.png', store: 'sot_redact_day', tag: "Uncover the story" , cat: 'Trivia' },
  { key: 'paths', href: '/paths', name: 'Paths', img: '/games/btn-paths.png', store: 'sot_paths_day', tag: "Link every town" , cat: 'Logic' },
  { key: 'deep', href: '/deep', name: 'Deep', img: '/games/btn-deep.png', store: 'sot_deep_day', tag: "One topic, fifteen questions" , cat: 'Trivia' },
  { key: 'anon', href: '/anon', name: 'Anon', img: '/games/btn-anon.png', store: 'sot_anon_day', tag: "A clueless acrostic" , cat: 'Word' },
// Retired games leave the board by themselves the morning after their bank's
// last drop (RETIRED_DAILY in lib/daily-games). Every count on this strip is
// derived from GAMES, so the "all N done" copy follows along.
].filter((g) => !isRetiredDaily(g.key));

const NAME_BY_KEY = GAMES.reduce((m, g) => { m[g.key] = g.name; return m; }, {});
// Recent Champions list length (yesterday plus the prior days), sized to fill
// the overall-leaderboard column beside the per-game minis.
const CHAMPION_DAYS = 8;
// How many tiles the board WINDOW shows before the rest have to be scrolled to.
// The grid is six columns wide on a full-width desktop, so thirty is exactly the
// five rows the board has always been, and the console keeps one height no matter
// how many dailies the site runs. At narrower desktop widths the column count
// drops and the window keeps showing thirty tiles, just in more rows.
const BOARD_WINDOW = 30;
// Navy-legible per-game accents for the mini-board titles (match DailyCombinedLeaderboard).
const ACCENTS = { crux: '#5b9bff', emcee: '#e879f9', garble: '#f0c95a', links: '#4ca878', span: '#e06aa0', dating: '#a483f0', tally: '#4cb377', suds: '#f0894c', circa: '#38b6cf', extra: '#e06a6a', carve: '#a483f0', stet: '#41b1e8', outwit: '#c3cfe3', tuck: '#e0a568', alibi: '#ef8896', cipher: '#3fc9b8', ping: '#4cb3f0', warmer: '#f3705c', jester: '#7c3aed', outrank: '#8b8af5', sworn: '#f472b6', shards: '#2dd4bf', hearsay: '#c4b5fd', venn: '#e0a568', stands: '#6aa3ff', bracket: '#f0894c', pricer: '#4ade80', lode: '#e0b34c', etch: '#8fbf5a', hedge: '#4cc0d4', listed: '#e07ad0', axiom: '#3fc9b8', mate: '#d9b38c', four: '#9db8ff', park: '#f0cf9a', check: '#5fd6b8', rung: '#7fd4e8', crunch: '#f0c07a', fib: '#c4b5fd', streak: '#fb7185', deep: '#7dd3fc', anon: '#e8969f', feud: '#fda4af', babel: '#6ee7b7', glyph: '#94a3b8', chain: '#f0abfc', turn: '#8cda81' };
// Saturated one-color-per-game identity for the tile accent + expand panel
// (the "one saturated color per game" system used on the live game pages).
const TCOL = { crux: T.blue, emcee: '#c026d3', shards: '#0d9488', garble: '#8a6d1a', links: '#166534', span: '#9d174d', dating: '#6d28d9', tally: T.successDeep, suds: '#ea580c', carve: '#7c3aed', extra: '#b91c1c', stet: '#0369a1', outwit: '#1f2937', outrank: '#4338ca', tuck: '#92400e', alibi: '#8b1e2d', cipher: '#0f766e', ping: '#0284c7', warmer: '#dc2626', jester: '#7c3aed', sworn: '#be185d', axiom: '#0f766e', hearsay: '#5b21b6', venn: '#b45309', stands: T.blueDeep, bracket: '#c2410c', pricer: '#15803d', lode: T.goldInk, etch: '#4d7c0f', hedge: '#0891b2', listed: '#86198f', mate: '#6b4423', four: T.blueDark, park: '#7c5c2e', check: '#166e5a', rung: '#155e75', crunch: '#b45309', fib: '#4c1d95', streak: '#e11d48', deep: '#0c4a6e', anon: '#8c2f39', feud: '#9f1239', babel: '#14532d', glyph: '#334155', chain: '#4a044e', turn: '#226218' };
const tcol = (k) => TCOL[k] || T.blue;

// Homepage-only blue tile art. The slate rows and the two cap tiles use a
// recolored copy of each game's button art (same drawing, mapped onto the
// brand blue ramp) so the table reads as one palette instead of forty-four.
// The original full-color PNGs stay in /games and are what every game page,
// end card, and share image still uses. A missing blue file falls back to the
// original rather than showing a broken image (owner, 2026-08-04).
const blueTile = (p) => (typeof p === 'string' ? p.replace('/games/btn-', '/games/blue/btn-') : p);
const tileFallback = (e) => {
  const el = e && e.currentTarget;
  if (el && el.src && el.src.indexOf('/games/blue/') !== -1) el.src = el.src.replace('/games/blue/btn-', '/games/btn-');
};
// Today's play count, rendered in the tile's top-left corner. The badge has
// roughly 30px before it reaches a long game name, so four figures collapse to
// "1.2k" rather than running under the title.
const fmtPlays = (v) => (v >= 10000 ? Math.round(v / 1000) + 'k' : v >= 1000 ? (Math.round(v / 100) / 10) + 'k' : String(v));
// Faint tile tints (owner, 2026-07-29: "the colours should be more faint").
// Each game's saturated hue is mixed down into the board's own deep navy, so a
// tile is recognisably its game's colour while the board still reads as one
// calm surface. The saturated hue stays on the top rule for punch. Computed
// here rather than with CSS color-mix so it renders identically everywhere.
const TINT_BASE = T.white;
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
// Recolored to the homepage blue family 2026-08-04. Each category still gets
// its OWN shade so the column stays scannable, they are just all blues now.
// Values live in lib/home-blues so the slate chips and the live feed chips
// cannot drift apart.
const CAT_COLOR = {
  Word: catBlue('word'), Numbers: catBlue('numbers'), Logic: catBlue('logic'),
  History: catBlue('history'), Geography: catBlue('geography'),
  'Crowd Psychology': catBlue('crowd'), Trivia: catBlue('trivia'),
  'End Game': catBlue('end game'), Cards: catBlue('cards'),
};
const CAT_CHIP_BG = {}, CAT_BD = {};
for (const [k, v] of Object.entries(CAT_COLOR)) {
  CAT_CHIP_BG[k] = mixHex(v, 0.13, TINT_BASE);
  CAT_BD[k] = mixHex(v, 0.72, TINT_BASE);
}
const catCol = (cat) => CAT_COLOR[cat] || T.muted;
// 'Crowd Psychology' is too long for a tile chip.
const CAT_SHORT = { 'Crowd Psychology': 'Crowd' };
// The PHONE peek: six UNPLAYED games, and only unplayed ones (owner,
// 2026-08-08). The collapsed slate is the "what should I play next" screen, so
// every line of it goes to a game you have NOT started. Paused games are already
// on the screen as cap cards directly above the board, so spending two of six
// lines restating them cost a third of the peek to say nothing new; they sit at
// the foot of Ready to play and appear when the group is expanded.
//
// Finished games peek NOTHING for the same reason, one step further along: you
// already know how you did, so the band plus its bar is the whole group until
// you ask.
//
// Desktop lists every unfinished row as before: the hide class and the bar are
// both inert above 900px.
// IN PROGRESS AND INCOMPLETE START SHUT ON A PHONE AND OPEN ON DESKTOP (owner,
// 2026-08-09). Both groups are already represented in the cap directly above the
// board, so on a phone, where the cap and the board cannot be seen at once,
// listing them again costs a screen to say what the hero cards just said. On
// desktop the cap and the board share the fold, so there is nothing to save and
// a collapsed group is just a lid over rows that had room anyway.
const PHONE_ROWS = 6;     // unplayed games visible while the group is collapsed
// From 641px the board runs TWO ACROSS (see the tablet tier in the stylesheet),
// so the same budget would peek half as many LINES: six games became three rows
// on an iPad mini in portrait. Doubled, so the peek is the same six lines deep
// it is on a phone (owner, 2026-08-08). Lines are what the reader counts.
const TABLET_ROWS = 12;
// The tablet tier: two columns, but still a touch device, so the row keeps the
// phone's whole-row-opens-the-drawer model. Portrait tablets (744, 768, 820) and
// the larger phones in landscape (844) all land here.
const TABLET_MQ = '(min-width:641px) and (max-width:900px)';
// ...and the tier ABOVE it, where the home page has ALREADY given up its three
// columns (owner, 2026-08-08). This is the same 901-1200px band the page grid
// uses: `.qzh .dhx` drops from `284px | 1fr | 300px` to two equal columns and
// `.dhx-center` takes order:-1, so the console runs FULL WIDTH with the rails
// stacked two-up beneath it rather than beside it. A slate listing every
// unfinished game is 46 rows there, which buries the leaderboard and the live
// feed under a screen and a half of scrolling. The peek belongs wherever the
// console is a block in a stack, which is exactly this band.
//
// It was briefly gated on `pointer:coarse` instead, on the reasoning that the
// devices landing here are tablets (iPad Pro 12.9" portrait is 1024, the 13" Air
// is 1024, an 11" in landscape is 1180). That was the wrong test twice over: an
// iPad carrying a Magic Keyboard reports pointer:FINE, and no device-preview
// tool emulates the pointer media feature at all, so the tier could not be seen
// in the one place it gets checked. The layout, not the input device, is what
// makes the long list wrong here.
const STACKED_MQ = '(min-width:901px) and (max-width:1200px)';
// The board runs TWO ACROSS in both tiers (the tablet grid below 900px and the
// desktop grid above it), so both double the peek budget to the same six LINES.
// A comma is an OR in a media query list, which is what matchMedia takes.
const TWO_UP_MQ = TABLET_MQ + ', ' + STACKED_MQ;
// How many PAUSED cards the cap shows before its expand bar takes over.
// ONE at both widths since 2026-08-09 (owner), down from two: the cap is a
// FOUR CARD grid now, and the fourth slot is the one a paused game rides in.
// The games this drops from the cap are not lost, they are listed in the slate
// directly below, at the foot of Ready to play, which is where every paused
// game has lived since 2026-08-08. The cut is CSS on the cards (.cap-hd /
// .cap-hm), not a slice in the JSX, so the server and the client render the
// same list at either width.
// The eyebrow each lower cap card carries. One line, so the three stay of a
// piece and none of them can drift into a second wording.
const CAP_LEAD_LABEL = { fav: 'Familiar favorite', fresh: 'New to you', crowd: 'Crowd favorite' };
// How many STATE cards the cap shows before its expander takes over: games you
// have already opened today, paused ones first and incomplete ones after. TWO at
// both widths (owner, 2026-08-09), which is exactly the cap's second row, and
// the pair share slots 3 and 4 with Familiar favorite giving way as they fill.
// So: nothing opened yet gives you favorite + New to you, one opened game gives
// favorite + that game, and two or more give the two games and an expander for
// the rest. The cards this leaves out are all still listed in the slate below.
const CAP_STATE_MAX = 2;
// EXPANDING THE PAUSED CARDS MUST NOT RESIZE THE CONSOLE (owner, 2026-08-08).
// The bar used to simply reveal every paused card, and with fifteen games open
// the cap grew past the whole window: the three-column row stretched, both
// rails stretched with it, and Ready to play was pushed clean off the fold. The
// open block is a SCROLLER instead. Its ceiling is measured in the fit effect
// so it takes exactly the room the board can spare, down to the board's own
// floor, and not a pixel more, which means the console's total height is
// IDENTICAL open or shut: the paused list borrows Ready to play's space rather
// than adding to the page. --cap-pmax carries the measurement, and the CSS
// fallback bounds the block on the first frame, before the effect has run, so
// it never flashes at full height.
const CAP_PMIN = 170;   // ...but always at least two rows of cards.
// The console is sized to leave this much of the page showing under it, so the
// three-column row ends just above the fold rather than at it or past it.
const FOLD_SLIVER = 34;
// ...but never squeeze the board below this, however tall the cap has grown.
const BOARD_MIN = 240;
// HELD SIDEWAYS, THE FLOOR IS EIGHT LINES (owner, 2026-08-08). A phone or tablet
// in landscape has a fraction of a laptop's height, so fitting the console to
// the fold left the slate showing five lines of Ready to play. In that one case
// the board keeps EIGHT and simply runs past the fold, scrolling inside itself
// for the rest exactly as it always has. LINES, not games: above 900px the board
// runs two across, so eight lines is sixteen games, which is what the reader is
// counting on the screen. The gate is a COARSE POINTER, never a height alone, so
// a short desktop window is untouched.
const LAND_LINES = 8;
const LAND_TOUCH = '(orientation:landscape) and (pointer:coarse) and (max-height:1100px)';

// The scroll-content height that shows exactly `lines` lines of the slate grid,
// its group band included, or 0 when the board has not laid out more than that
// (nothing to scroll to, so the ordinary fit should govern). Rows abut, so the
// TOP of line n+1 is the bottom of line n. Distinct tops rather than a row
// count: the grid runs two rows to a line, and DOM order is not visual order
// since the rows are placed by `order`. Measured off the laid-out rows rather
// than a hardcoded row height, which is 49.8px and cannot be multiplied safely.
function slateLineHeight(board, lines) {
  const base = board.getBoundingClientRect().top - board.scrollTop;
  const tops = [];
  board.querySelectorAll('.sl-row').forEach((r) => {
    // offsetParent is null for a row this width hides (a paused card that lives
    // in the cap) or a collapsed group hides, and those occupy no line.
    if (r.offsetParent === null) return;
    const t = Math.round(r.getBoundingClientRect().top - base);
    if (!tops.includes(t)) tops.push(t);
  });
  tops.sort((a, b) => a - b);
  return tops.length > lines ? tops[lines] : 0;
}

// How far back Up next looks when deciding which game this viewer plays the
// most. Long enough to survive a few skipped days, short enough that a habit
// dropped last month stops winning.
const RECENT_DAYS = 30;

// "Jul 27", from the ISO date a puzzle goes live on. Built by hand rather than
// through toLocaleDateString, which would read the VIEWER's timezone and can
// slide an ET date back a day for anyone west of it.
const SUN_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function sunDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  return m ? `${SUN_MON[Number(m[2]) - 1]} ${Number(m[3])}` : '';
}

function etToday() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

function etDateLabel() {
  const o = { timeZone: 'America/New_York' };
  try {
    return {
      long: new Date().toLocaleDateString('en-US', { ...o, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      short: new Date().toLocaleDateString('en-US', { ...o, weekday: 'short', month: 'short', day: 'numeric' }),
    };
  } catch (e) { return { long: '', short: '' }; }
}

function fmtPts(x) { const v = Math.round(Number(x) * 10) / 10; return Number.isInteger(v) ? String(v) : v.toFixed(1); }

// A player's game-native score line for the panel's "Today" figure, from the
// daily-combined per-game board row. score/total when the game reports a total
// (e.g. 100/100, 10/10), otherwise the raw score, otherwise the daily points.
// A TALLY game (Blocks) reads "7 rows" instead of a fraction: its total is a
// par, not a set of answers, so a fraction reads as a failure (daily-games).
function todayScoreLine(row, key) {
  if (!row) return null;
  if (row.score != null) {
    const t = dailyScoreText(key, fmtPts(row.score), row.total != null ? fmtPts(row.total) : null);
    if (t) return t;
  }
  if (row.points != null) return `${fmtPts(row.points)} pts`;
  return null;
}

export default function DailyStrip({ board = null, layout = 'tiles' }) {
  // 'slate' reflows the SAME tiles into a table of rows (owner-approved
  // scoreboard redesign, 2026-08-03). It is a layout switch only: the data,
  // the per-tile panel, the reset timer and every state flag are untouched,
  // so reverting is a one-word prop change.
  const slate = layout === 'slate';
  const [done, setDone] = useState(() => new Set());
  const [inprog, setInprog] = useState(() => new Set());
  // Finished today, never solved, on a game that did not show the answer. A
  // strict subset of `done`: these rows leave Complete today for the red group
  // above it, because the puzzle is still live for this player.
  const [unsolved, setUnsolved] = useState(() => new Set());
  // A finished game is one of two things now. `isFail` is the red group; note it
  // is ALWAYS a subset of `done`, so every existing done/!done test still reads
  // correctly and only the places that need the split have to know about it.
  //
  // Declared HERE, beside the state it reads, and NOT beside the slate code that
  // uses it most: the cap calls it some 240 lines earlier, so a const declared
  // at the slate sits in the temporal dead zone at that call site and the build
  // dies on "Cannot access 'isFail' before initialization". esbuild parses that
  // happily, which is why the deploy is the first thing that sees it.
  const isFail = (key) => done.has(key) && unsolved.has(key);
  const [streaks, setStreaks] = useState({}); // per-game consecutive-day streaks, from daily-status
  const [archive, setArchive] = useState({}); // per-game { played, total }, from the same payload
  // Per-game plays by THIS viewer over the last RECENT_DAYS ET days, derived
  // client side from the same daily-status payload (its `played` array is a
  // list of dated quiz ids). Drives Up next: the game you actually play most.
  const [recent, setRecent] = useState({});
  // NOTE the day figures this component used to own (IQ Points earned today,
  // the day's move on the IQ board, the cross-game day streak) moved into the
  // page header on 2026-08-03 and are read there from useDayStats. Do not
  // re-derive them here: the header is the one place they render.
  const [sel, setSel] = useState(null); // selected game key (expanded tile), or null
  const [lbOpen, setLbOpen] = useState(false); // overall daily leaderboard toggle

  const [hist, setHist] = useState(null); // recent daily champions, from /api/quiz/daily-history
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
  // -- board payload (per-game plays + standings) --
  // Read up here, ahead of the display order, because the order now keys off
  // today's play counts. The leaderboard wiring further down reuses these maps.
  const bgames = board && Array.isArray(board.games) ? board.games : null;
  const byKey = {};
  if (bgames) for (const g of bgames) byKey[g.key] = g;
  const hasBoard = !!(bgames && bgames.length);
  // Plays today for one game (everyone, guests included -- the same number the
  // tile badge shows). Null when no board payload has arrived.
  const playsOf = (key) => {
    const b = byKey[key];
    return b && typeof b.plays === 'number' ? b.plays : null;
  };

  // Display order = MOST PLAYED TODAY first (owner, 2026-07-31), so the board
  // matches the play count each tile now shows in its corner. Yesterday's
  // popularity (useDailyOrder) is the tiebreak, and carries the whole order
  // until the board payload lands, so first paint never janks and a fresh ET
  // morning -- when every count is still 0 -- falls back to yesterday rather
  // than to noise.
  const dailyOrder = useDailyOrder();
  // The viewer's pinned games, promoted above the global order (owner,
  // 2026-08-02). Pins are the ONLY personalization: the sort is (1) your stars,
  // (2) total plays on the day. An earlier version also promoted each player's
  // most-played games; the owner cut it, so do not reintroduce a derived tier
  // without asking. Empty for a guest, which makes sortByMyGames a no-op and
  // leaves the global order untouched. See app/useMyGames.js.
  const { favorites, orderFavorites, canPin, max: favMax, toggleFavorite } = useMyGames();
  // The star is offered only when it can actually WRITE: registered AND the
  // quiz_users.favorites column exists. Otherwise the board simply keeps the
  // global order and shows no control.
  const myGamesOn = canPin;
  const favSet = new Set(favorites);
  const favFull = favorites.length >= (favMax || 12);
  const games = (() => {
    const base = sortByDailyOrder(GAMES, dailyOrder);
    let out = base;
    if (hasBoard) {
      const rank = new Map(base.map((g, i) => [g.key, i]));
      out = [...base].sort((a, b) => (playsOf(b.key) || 0) - (playsOf(a.key) || 0)
        || rank.get(a.key) - rank.get(b.key));
    }
    return sortByMyGames(out, orderFavorites);
  })();

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

  // How many rows the sheet has been shifted up by, and the geometry needed to
  // shift it. `metrics` is null until measured AND on narrow screens, which is
  // what turns the whole mechanism off there.
  const [rowOffset, setRowOffset] = useState(0);
  const [metrics, setMetrics] = useState(null);
  // Phones open on the first eight tiles only (owner, 2026-07-31). This is the
  // toggle behind .dh-mall; the cut itself is CSS, see .dh-board.mcut below.
  const [showAll, setShowAll] = useState(false);
  // The two lead-in bars drop their game icon on a phone (they carry a white
  // rule instead). Hiding it in CSS still let the browser lay it out and paint
  // it for a frame, which read as a flicker, so it is not rendered at all.
  const [etLabel, setEtLabel] = useState({ long: '', short: '' });
  useEffect(() => { setEtLabel(etDateLabel()); }, []);
  const [phone, setPhone] = useState(false);
  // The Sundays tab. `sunToday` is computed in an effect, never during render:
  // the server has no idea what day it is in Eastern time and a mismatch is a
  // hydration error. It starts false, so the chip is present on the server's
  // markup and removed on the client if today IS Sunday, which is the safe
  // direction (a chip that vanishes beats one that appears).
  const [sunToday, setSunToday] = useState(false);
  const [sunRows, setSunRows] = useState(null);   // null = not fetched yet
  const [sunErr, setSunErr] = useState(false);
  // Incomplete cards the viewer has waved off TODAY. The red card is loud on
  // purpose, which is exactly why it needs a way out: a game you have decided
  // not to go back to should not keep shouting at you for the rest of the day.
  // Dismissing takes it out of the CAP only. The slate's Incomplete today group
  // still lists it, so nothing is actually hidden, it just stops being a hero.
  // Same-device and same-day by design: it is a mood, not a preference, and it
  // clears itself at midnight along with the state it is about.
  const [capDismiss, setCapDismiss] = useState(() => new Set());
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(max-width: 900px)');
    const on = () => setPhone(mq.matches);
    on();
    if (mq.addEventListener) { mq.addEventListener('change', on); return () => mq.removeEventListener('change', on); }
    mq.addListener(on); return () => mq.removeListener(on);
  }, []);
  // Two across from 641px (the tablet tier). Same shape as `phone` above: a
  // media query, resolved after mount, so the server and the client agree on the
  // first paint and the budget corrects itself a frame later.
  const [twoUp, setTwoUp] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia(TWO_UP_MQ);
    const on = () => setTwoUp(mq.matches);
    on();
    if (mq.addEventListener) { mq.addEventListener('change', on); return () => mq.removeEventListener('change', on); }
    mq.addListener(on); return () => mq.removeListener(on);
  }, []);
  const capIcon = !(slate && phone);
  // Board filter: 'all' | 'todo' | a category name. Defaults to 'all' on
  // every viewport; the phone-only Unplayed default was removed (owner rule).
  const [filter, setFilter] = useState('all');
  // Slate sort: null keeps the board's own order (unplayed first, then done).
  // Text columns default to A-Z, number columns to biggest first, because that
  // is what someone clicking "Players" or "Streak" is looking for.
  const [sort, setSort] = useState(null);
  // Which phone groups the reader has expanded. Collapsed is the default on
  // every load, deliberately: the point is what the FIRST screen shows.
  const [grpOpen, setGrpOpen] = useState({ prog: false, todo: false, fail: false, dn: false });
  useEffect(() => { setSunToday(isSundayET()); }, []);
  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem('sot_cap_dismiss') || 'null');
      if (c && c.d === etToday() && Array.isArray(c.keys)) setCapDismiss(new Set(c.keys));
    } catch (e) { /* no breadcrumb, nothing dismissed */ }
  }, []);
  // Fetched only when the tab is actually opened, and only once: the answer is
  // per-player and the route is force-dynamic, so there is no reason to spend
  // the request on the many more visitors who never touch the tab.
  useEffect(() => {
    if (filter !== 'sunday' || sunRows || sunErr) return undefined;
    let alive = true;
    let anonId = null, email = null;
    try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
    const qs = new URLSearchParams();
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    fetch('/api/quiz/sunday-slate' + (qs.toString() ? '?' + qs.toString() : ''))
      .then((r) => r.json())
      .then((d) => { if (alive) setSunRows((d && d.games) || []); })
      .catch(() => { if (alive) setSunErr(true); });
    return () => { alive = false; };
  }, [filter, sunRows, sunErr]);
  // Paused games ride in the CAP now, beside Up next and Easiest leaderboard
  // (owner, 2026-08-08), as cards of the cap's own shape in gold rather than a
  // group of rows inside the board. The board therefore opens on Ready to play,
  // which is what pulled the category strip down to sit directly above it.
  const [capOpen, setCapOpen] = useState(false);
  const vpRef = useRef(null);
  const boardRef = useRef(null);

  // cross-device: the signed-in player's finished-today set from the server.
  // Goes through the shared fetchDayStatus (app/useDayStats.js) rather than its
  // own fetch, because the page header now reads the same /api/quiz/daily-status
  // payload for its day chips and the two must not request it twice.
  useEffect(() => {
    let alive = true;
    fetchDayStatus()
      .then((data) => {
        if (!alive || !data) return;
        if (data.streaks && typeof data.streaks === 'object') setStreaks(data.streaks);
        if (data.archive && typeof data.archive === 'object') setArchive(data.archive);
        const [Y, M, D] = etToday().split('-').map(Number);
        const yy = Y % 100;
        const completed = new Set(data.completed || []);
        const played = new Set(data.played || []);
        const abandoned = new Set(data.abandoned || []);
        const unsolvedIds = new Set(data.unsolved || []);
        // REBUILT, not merged. `done` and `inprog` merge into what the
        // same-device breadcrumbs already put there, but nothing seeds this set
        // locally, and merging would make it one-way: solve a game on a retry
        // and the key it had already added could never leave again within the
        // session. Building it fresh from each payload lets it heal.
        setUnsolved(() => {
          const next = new Set();
          for (const g of GAMES) {
            const id = `${g.key}-${M}-${D}-${yy}`;
            if (unsolvedIds.has(id) && KEEPS_ANSWER.has(g.key)) next.add(g.key);
          }
          return next;
        });
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
        // Recent habit, for Up next. `played` holds every dated id this player
        // has finished, so counting the ones inside the last RECENT_DAYS ET days
        // costs one pass and no extra request. Today's own row is included and
        // harmless: a game played today is not an Up next candidate anyway.
        try {
          const days = new Set();
          const et = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
          for (let i = 0; i < RECENT_DAYS; i++) {
            const d = new Date(et); d.setDate(et.getDate() - i);
            days.add(`${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear() % 100}`);
          }
          const counts = {};
          for (const qid of played) {
            const m = /^([a-z]+)-(\d+-\d+-\d+)$/.exec(qid);
            if (m && days.has(m[2])) counts[m[1]] = (counts[m[1]] || 0) + 1;
          }
          setRecent(counts);
        } catch (e) {}
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const n = GAMES.filter((g) => done.has(g.key)).length;
  const pct = Math.round((n / GAMES.length) * 100);
  const left = GAMES.length - n;
  // Up Next = the unfinished game THIS VIEWER plays the most (owner, 2026-08-07).
  // It used to be simply the first unfinished game in board order, which is the
  // day's most played game globally, so a regular with three games they actually
  // play was pointed at whatever the crowd was doing. Ranked by plays over the
  // last RECENT_DAYS ET days (a changing habit beats an old one), all time days
  // played as the tiebreak, board order last, so the pick is stable within a day.
  // An in-progress game still counts as unfinished and becomes a Resume target.
  // A viewer with NO history on any open game (a guest, or a first visit) falls
  // back to the old behaviour: first unfinished in board order. It still renders
  // as a tile in the board too.
  // ONE ranking, read twice (owner, 2026-08-09). Up next takes the first game
  // and Familiar favorite the second, so the two cards can never disagree about
  // which game this viewer plays most. `games` is already in board order and the
  // index is the last tiebreak, so a tie keeps the game sitting higher on the
  // board, exactly as the strict comparisons it replaced did.
  const habitDays = (g) => (recent[g.key] || 0);
  const habitAllTime = (g) => ((archive[g.key] && archive[g.key].played) || 0);
  const hasHabit = (g) => (habitDays(g) > 0 || habitAllTime(g) > 0);
  const habitRank = games.filter((g) => !done.has(g.key))
    .map((g, i) => ({ g, i }))
    .sort((a, b) => (habitDays(b.g) - habitDays(a.g))
      || (habitAllTime(b.g) - habitAllTime(a.g))
      || (a.i - b.i))
    .map((x) => x.g);
  // A viewer with NO history on any open game (a guest, or a first visit) falls
  // back to the old behaviour: first unfinished in board order, which is what an
  // all-zero ranking sorts to.
  // A PAUSED GAME IS NOT UP NEXT (owner, 2026-08-09). Paused games have their
  // own card in the cap now, so pointing the first two cards at one as well both
  // says the same thing twice and forces those cards to read Resume, which is
  // not what they are for. Both cards therefore pick from games this viewer has
  // NOT started today, and both say Play. The fallback keeps them populated on a
  // day when every open game has been started.
  const habitFresh = habitRank.filter((g) => !inprog.has(g.key));
  const nextGame = habitFresh[0] || habitRank[0] || null;

  // ── leaderboard wiring (only when a board payload is provided) ──
  // bgames / byKey / hasBoard are built above, beside the display order.
  const overall = board && Array.isArray(board.overall) ? board.overall : [];
  const maxTotal = (board && board.maxTotal) || 150;
  const gameCount = (board && board.gameCount) || (bgames ? bgames.length : 0);
  const bestN = board && board.bestN != null ? board.bestN : Math.min(10, gameCount || 10);
  const meKey = board && board.me ? board.me.userKey : null;
  const top3 = overall.slice(0, 3);
  const meShown = meKey && top3.some((r) => r.userKey === meKey);
  const uniquePlayers = board && typeof board.uniquePlayers === 'number' ? board.uniquePlayers : null;

  // Easiest board to climb: fewest players today among the games still open to
  // you. Ties keep the earlier game in daily order. Since 2026-08-03 the cap's
  // left half is Up next, which already offers nextGame, so the easiest board is
  // chosen from the OTHER open games: a cap pointing at the same game twice
  // wastes half its width. A day with exactly one game left therefore has no
  // easiest card, and that half shows the almost-done note instead.
  const easiest = (() => {
    if (!nextGame) return null;
    const pool = games.filter((g) => !done.has(g.key) && g.key !== nextGame.key);
    // Same rule as Up next: skip the started games, unless that leaves nothing.
    const unstarted = pool.filter((g) => !inprog.has(g.key));
    const open = unstarted.length ? unstarted : pool;
    let best = null, bestN = Infinity;
    for (const g of open) {
      const b = byKey[g.key];
      const cnt = b && typeof b.field === 'number' ? b.field : null;
      if (cnt == null) continue;
      if (cnt < bestN) { bestN = cnt; best = g; }
    }
    return best ? { game: best, players: bestN } : (open[0] ? { game: open[0], players: null } : null);
  })();

  // The cap's two halves count DIFFERENT things, deliberately (owner ruling,
  // 2026-08-06). Up next prints PLAYS, the very figure the board's Players
  // column shows for that game, so the two can never contradict each other.
  // Easiest leaderboard keeps the FIELD, the number of scored entries, because
  // that is what "easiest to place on" actually measures: Jester ran 430 plays
  // today against a field of 38, and ranking it by plays would call the day's
  // busiest game an easy board. Its note is worded "on the leaderboard" so the
  // smaller number reads as a different measure rather than a wrong one.
  // Either note is dropped entirely when no board payload has arrived, rather
  // than rendering a zero.
  const playsNote = (n) => (n == null
    ? ''
    : ` \u00b7 ${n === 0 ? 'no players today' : `${n.toLocaleString()} ${n === 1 ? 'player' : 'players'} today`}`);
  const fieldNote = (n) => (n == null
    ? ''
    : ` \u00b7 ${n === 0 ? 'nobody on the leaderboard yet' : `${n.toLocaleString()} on the leaderboard`}`);
  const nextPlays = nextGame ? playsOf(nextGame.key) : null;

  // The paused cards, in board order. Up next and Easiest leaderboard are
  // frequently paused games themselves and already have a card of their own, so
  // they are excluded here rather than printed twice.
  const capProg = games.filter((g) => inprog.has(g.key) && !done.has(g.key)
    && !(nextGame && g.key === nextGame.key)
    && !(easiest && g.key === easiest.game.key));

  // ── the two lower cards (owner, 2026-08-09) ──────────────────────────────
  // The cap used to be two fixed halves with the paused cards dropped in after
  // them, which meant ONE paused game left an odd number of cards and the last
  // one spanned the whole width. A lone banner where a card should be reads as
  // a bug rather than a layout. Adding a third card would only move the odd
  // number along (3 with nothing paused, 5 with two), so the fix is parity, not
  // an extra card: the cap now fills FOUR slots and the count is always even.
  //
  //   1  Up next            the game you play most, unchanged
  //   2  Easiest board      the thinnest field today, unchanged
  //   3  Familiar favorite  second in the same ranking Up next uses
  //   4  a paused game      else New to you, a game with no history at all
  //
  // Familiar favorite skips in-progress games on purpose: a paused game belongs
  // in the gold card in slot 4, and a cap that named one game twice would waste
  // a quarter of itself.
  const favGame = habitRank.find((g) => hasHabit(g) && !inprog.has(g.key)
    && !(nextGame && g.key === nextGame.key)
    && !(easiest && g.key === easiest.game.key)) || null;
  // Games this viewer has never touched, in board order.
  const freshPool = games.filter((g) => !done.has(g.key) && !inprog.has(g.key) && !hasHabit(g));
  // What the CROWD is on today, most played first (`games` is already in that
  // order wherever a board payload has arrived). This is the card that keeps
  // BOTH ends of the roster honest (owner, 2026-08-09): a brand new account has
  // no habit, so slots 3 and 4 both fell to New to you and printed the same
  // eyebrow twice; someone who has played every game has nothing new left, so
  // both fell to Familiar favorite and did the same at the other extreme. Each
  // card TYPE may appear once, and the crowd is the one signal that is always
  // available, whoever is looking.
  const crowdPool = games.filter((g) => !done.has(g.key) && !inprog.has(g.key)
    && !(nextGame && g.key === nextGame.key)
    && !(easiest && g.key === easiest.game.key));
  // Whether this viewer's history is KNOWN, rather than merely empty.
  // /api/quiz/daily-status answers a signed-out request with no archive at all,
  // so every game reads as untouched for a guest who in fact plays daily. The
  // New to you card states "never played", and it may only state that where the
  // history exists to back it.
  const knowsHistory = Object.keys(archive).length > 0;
  // Slot 4 goes to a paused game first and an incomplete one second: both are
  // games you have already opened today, and the paused one still has a live
  // board to return to where the incomplete one has a spent score and a puzzle
  // you can still solve for yourself.
  // Everything you have already opened today, in one list. Paused leads
  // incomplete throughout: a paused board is still live where an incomplete one
  // is spent, so it is the better thing to hand back.
  // ONE OF EACH KIND BEFORE A SECOND OF EITHER (owner, 2026-08-09). Two paused
  // games and one incomplete used to fill both slots with paused and leave the
  // incomplete one to the expander, so a whole state could go unrepresented in
  // the cap. Interleaved, the two slots show one of each whenever both exist,
  // and only double up when one kind is all there is. Paused still leads, since
  // a paused board is live where an incomplete one is spent.
  const capState = (() => {
    const prog = capProg.map((g) => ({ game: g, kind: 'prog' }));
    const fail = games.filter((g) => isFail(g.key) && !capDismiss.has(g.key))
      .map((g) => ({ game: g, kind: 'fail' }));
    const out = [];
    for (let i = 0; i < Math.max(prog.length, fail.length); i += 1) {
      if (prog[i]) out.push(prog[i]);
      if (fail[i]) out.push(fail[i]);
    }
    return out;
  })();
  const capStateShown = capOpen ? capState : capState.slice(0, CAP_STATE_MAX);
  const dismissFail = (key) => setCapDismiss((cur) => {
    const next = new Set(cur);
    next.add(key);
    try { localStorage.setItem('sot_cap_dismiss', JSON.stringify({ d: etToday(), keys: [...next] })); } catch (e) {}
    return next;
  });
  const capLead = (() => {
    // Whatever the state cards leave of the two lower slots.
    const want = Math.max(0, 2 - capStateShown.length);
    const taken = new Set([nextGame && nextGame.key, easiest && easiest.game.key].filter(Boolean));
    const out = [];
    const pick = (pool) => pool.find((g) => !taken.has(g.key)) || null;
    const take = (g, kind) => { if (!g) return false; out.push({ game: g, kind }); taken.add(g.key); return true; };
    // Slot 3 is the habit card, and the crowd stands in for a viewer who has
    // not built one yet, which is every brand new account.
    take(favGame && !taken.has(favGame.key) ? favGame : null, 'fav') || take(pick(crowdPool), 'crowd');
    // Slot 4, whenever no paused game is taking it: something they have never
    // opened, and the crowd again for the viewer who has opened everything.
    if (out.length < want) take(pick(freshPool), 'fresh') || take(pick(crowdPool), 'crowd');
    return out.slice(0, want);
  })();
  // Expanding the paused list is a request to see paused games, so the cap hands
  // that block the room: the lead cards step aside, which also keeps the fixed
  // count even (two) while the block runs as its own full-width grid.
  // Open, `want` is already 0 (capStateShown is the whole list), so the lead
  // cards step aside on their own and the block gets the room.
  const capLeadShown = capLead;
  const capFixed = 2 + capLeadShown.length;
  // Which column a paused card lands in. SHUT the block is display:contents, so
  // its cards continue the cap's own grid and the fixed cards above them set the
  // parity; OPEN it is its own two-column grid and starts at column one. Only
  // column-one cards carry the divider, since two gold cards side by side have
  // no colour change between them. A class, not :nth-child, because the wrapper
  // makes the DOM position and the grid position disagree.
  const capCol1 = (i) => ((capOpen ? i : capFixed + i) % 2 === 0);
  const capShownN = capStateShown.length;
  // What the expander has left to offer, counted per kind off the same two
  // lists the cards are drawn from, so the bar can never disagree with them.
  const capHidden = capState.slice(CAP_STATE_MAX).reduce(
    (a, c) => { a[c.kind] += 1; return a; }, { prog: 0, fail: 0 });
  // Desktop runs the cap two cards to a row, so an ODD total would leave a
  // half-width hole beside the last card: it takes the full width instead. With
  // four cards this never fires; it is the backstop for the states that cannot
  // fill all four (a brand new viewer, or the open paused block).
  const capOddD = ((capOpen ? capShownN : capFixed + capShownN) % 2 === 1);
  const capWideAt = capOddD && capShownN > 0 ? capShownN - 1 : -1;
  const capLeadWideAt = capOddD && capShownN === 0 ? capLeadShown.length - 1 : -1;
  // The sub line each lower card carries. Familiar favorite prints the habit it
  // was chosen on, which is the one figure that explains why the card is there;
  // New to you says plainly that there is no history to print.
  // New to you says "never played" only where the history is known; a guest
  // gets the tagline alone rather than a claim nothing backs. Crowd favorite
  // prints the same plays figure Up next does, which is the whole point of it.
  const leadNote = (c) => (c.kind === 'fav' ? habitNote(c.game)
    : c.kind === 'crowd' ? playsNote(playsOf(c.game.key))
    : (knowsHistory ? ' \u00b7 never played' : ''));
  const habitNote = (g) => (habitDays(g) > 0
    ? ` \u00b7 played ${habitDays(g)} of the last ${RECENT_DAYS} days`
    : (habitAllTime(g) > 0 ? ` \u00b7 ${habitAllTime(g)} days played all time` : ''));

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

  // FIT THE CONSOLE TO THE FOLD (owner, 2026-08-08). The board used to take a
  // hardcoded calc(100vh - 300px), where 300 was the sum of everything above it
  // back when the cap was a single row of two cards. The cap carries the paused
  // games now, so that number went stale the moment it grew and the whole
  // three-column row (the rails stretch to the console, so all three) ran past
  // the bottom of the window. The board measures the room it actually has
  // instead: its own document top already accounts for whatever sits above it,
  // so the cap can grow or shrink and the row still ends FOLD_SLIVER above the
  // fold. Desktop only; the phone board is height:auto and scrolls with the
  // page. Never hardcode that sum again, in either direction.
  useEffect(() => {
    if (!slate || typeof window === 'undefined') return undefined;
    const board = boardRef.current;
    if (!board) return undefined;
    const con = board.closest('.dhome');
    let raf = 0;
    const fit = () => {
      raf = 0;
      const prog = con ? con.querySelector('.dh-cprog') : null;
      // The board is height:auto and scrolls with the page in BOTH peek tiers, so
      // there is no fixed port to size: the phone/tablet one under 900px, and the
      // stacked one above it (STACKED_MQ), which would otherwise get a fold-height
      // scroll port holding six rows and a lot of white.
      if (window.innerWidth <= 1200) {
        board.style.removeProperty('--dh-fit');
        // Where the board flows, the paused block is never bounded either: the
        // page absorbs its length, so it stacks out in full and never scrolls
        // inside itself.
        if (prog) prog.style.removeProperty('--cap-pmax');
        return;
      }
      // The floor is BOARD_MIN everywhere except a touch device in landscape,
      // where it is whatever eight lines actually measure (see LAND_LINES).
      let floor = BOARD_MIN;
      if (window.matchMedia && window.matchMedia(LAND_TOUCH).matches) {
        floor = Math.max(floor, slateLineHeight(board, LAND_LINES));
      }
      // Bound the open paused block FIRST, since it is one of the things
      // sitting above the board. Its ceiling is whatever room is left between
      // the top of the block and the fold once the board has been handed its
      // floor, so the block can only ever eat space the board could spare and
      // the console still ends FOLD_SLIVER above the fold either way.
      //
      // No feedback loop: the top measured here does not depend on the block's
      // own height. Open, the block is a scroller, so its box top is fixed and
      // the cards move inside it; shut, it is display:contents and has no box
      // at all, so the FIRST CARD stands in for it and sits at the same pixel.
      const bar = con ? con.querySelector('.dh-cmore') : null;
      if (prog && !bar) {
        // No bar means the block can never open, so there is nothing to bound.
        prog.style.removeProperty('--cap-pmax');
      } else if (prog) {
        const r = prog.getBoundingClientRect();
        const first = r.height ? null : prog.querySelector('.dh-cell.prog');
        const pTop = (first ? first.getBoundingClientRect().top : r.top) + window.scrollY;
        const barR = bar.getBoundingClientRect();
        const bdR = board.getBoundingClientRect();
        const conR = con.getBoundingClientRect();
        // MEASURE the furniture between the block and the fold, never model it.
        // The first version subtracted the bar and the board's floor and came
        // out 36px generous, because the board wrap's padding and the sticky
        // column header sit in between and were not in the sum, so the console
        // ran past the fold by exactly that much. HEAD is the bar plus
        // everything under it down to the board's top edge; TAIL is the wrap's
        // bottom edge under the board. Both are constant whatever height the
        // block settles at, which is what makes this one pass rather than an
        // iteration that visibly settles.
        const head = Math.round(barR.height) + Math.max(0, Math.round(bdR.top - barR.bottom));
        const tail = Math.max(0, Math.round(conR.bottom - bdR.bottom));
        const room = Math.round(window.innerHeight - pTop - head - tail - FOLD_SLIVER) - floor;
        prog.style.setProperty('--cap-pmax', Math.max(CAP_PMIN, room) + 'px');
      }
      // Document offset, not the viewport rect: the row is meant to fit the
      // fold as seen from the TOP of the page, wherever the reader has
      // scrolled to when a resize happens to fire. Read AFTER the block above
      // has been bounded, so this same pass sees the height it settled at.
      const top = board.getBoundingClientRect().top + window.scrollY;
      const h = Math.max(floor, Math.round(window.innerHeight - top - FOLD_SLIVER));
      board.style.setProperty('--dh-fit', h + 'px');
    };
    // requestAnimationFrame NEVER FIRES in a background tab, so a queued fit in
    // one would sit unmeasured until the reader looked at the page. Coalesce
    // with a frame when there are frames, and just measure when there are not.
    const q = () => {
      if (raf) return;
      if (typeof document !== 'undefined' && document.hidden) { fit(); return; }
      raf = requestAnimationFrame(fit);
    };
    // A HIDDEN DOCUMENT RUNS NO RENDERING STEPS, so a ResizeObserver in one
    // never DELIVERS, and the branch above never gets called. Plain timers do
    // still run, so two late re-fits are the safety net under the observer
    // (the same belt-and-braces the rails' own measure uses).
    const t1 = setTimeout(q, 450);
    const t2 = setTimeout(q, 1400);
    // The FIRST fit is direct, not queued: requestAnimationFrame never fires in
    // a background tab, so a page opened in one would have sat at the fallback
    // calc until it was looked at.
    fit();
    window.addEventListener('resize', q);
    // ...and re-measure when a tab that loaded in the background is finally
    // shown, since everything above it may have settled while it was hidden.
    document.addEventListener('visibilitychange', q);
    // The cap is the thing above the board whose height moves (expanding the
    // paused cards). Observe IT, never the console: the console's height is
    // driven by the board we are setting, which would loop.
    let ro = null;
    const cap = con && con.querySelector('.dh-sbar');
    if (cap && typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(q); ro.observe(cap); }
    return () => {
      window.removeEventListener('resize', q);
      document.removeEventListener('visibilitychange', q);
      clearTimeout(t1);
      clearTimeout(t2);
      if (ro) ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
    // Deps: everything that changes the CAP's height, since that is the only
    // thing above the board that moves it. This is the deterministic path; the
    // observer and the timers above are the backstop for a late data arrival.
  }, [slate, capOpen, phone, capProg.length, nextGame && nextGame.key, easiest && easiest.game.key]);

  // filtered tile set
  const list = games.filter((g) => !done.has(g.key)).concat(games.filter((g) => done.has(g.key)));
  // The slate filters for real (the tile board still dims rather than removes).
  const slateMatch = (g) => (filter === 'all' ? true : filter === 'todo' ? !done.has(g.key) : g.cat === filter);
  const SORT_NUMERIC = new Set(['players', 'streak', 'archive', 'status']);
  const sortVal = (g, key) => {
    if (key === 'game') return g.name || '';
    if (key === 'cat') return g.cat || '';
    if (key === 'players') return playsOf(g.key) || 0;
    if (key === 'streak') return streaks[g.key] || 0;
    if (key === 'leader') {
      const b = byKey[g.key];
      return (hasBoard && b && b.board && b.board[0] && b.board[0].username) || '';
    }
    // done (2) beats in progress (1) beats untouched (0)
    if (key === 'status') return done.has(g.key) ? 2 : (inprog.has(g.key) ? 1 : 0);
    if (key === 'archive') {
      const a = archive[g.key];
      return (a && a.total) ? (a.played / a.total) : -1;
    }
    return '';
  };
  const slateList = (() => {
    const rows = list.filter(slateMatch);
    if (!sort) return rows;
    const dir = sort.dir === 'asc' ? 1 : -1;
    // A blank leader sorts last either way rather than clumping at the top of
    // an ascending list.
    return rows.slice().sort((a, b) => {
      const x = sortVal(a, sort.key), y = sortVal(b, sort.key);
      if (typeof x === 'string' || typeof y === 'string') {
        const sx = String(x), sy = String(y);
        if (!sx !== !sy) return sx ? -1 : 1;
        return sx.localeCompare(sy) * dir || (a.name || '').localeCompare(b.name || '');
      }
      return (x - y) * dir || (a.name || '').localeCompare(b.name || '');
    });
  })();
  const toggleSort = (key) => setSort((cur) => (
    cur && cur.key === key
      ? { key, dir: cur.dir === 'asc' ? 'desc' : 'asc' }
      : { key, dir: SORT_NUMERIC.has(key) ? 'desc' : 'asc' }
  ));
  const slateCats = [];
  for (const g of games) if (!slateCats.includes(g.cat)) slateCats.push(g.cat);
  const shift = metrics ? Math.min(rowOffset, metrics.maxOffset) : 0;
  const selGame = sel != null ? list.find((g) => g.key === sel) || games.find((g) => g.key === sel) || null : null;

  // Measure the board window so the sheet can be shifted by exactly one row.
  //
  // The TILES decide the height here, never the column. An earlier version did
  // the opposite, deriving a row height from whatever vertical space the page
  // grid handed the board, which meant a tall right hand rail stretched every
  // tile (they came out at 154px instead of their natural ~127px). So the row
  // step is now READ OFF the laid out grid and the window is sized to exactly
  // `vis` of those rows. Rows keep their natural height, and any space the
  // column has left over simply sits under the board.
  //
  // No feedback loop: the grid is absolutely positioned, so its own row heights
  // are content driven and do not depend on the window height we write back.
  useEffect(() => {
    const vp = vpRef.current, bd = boardRef.current;
    if (!vp || !bd) return undefined;
    const GAP = 8;
    const measure = () => {
      // Below this width the board simply flows: the spare tiles take their own
      // row, no window, no arrow, no animation (owner, 2026-07-30).
      if (typeof window === 'undefined' || window.innerWidth < 861) { setMetrics(null); return; }
      const cols = (getComputedStyle(bd).gridTemplateColumns || '').split(' ').filter(Boolean).length || 6;
      const vis = Math.max(1, Math.ceil(BOARD_WINDOW / cols));
      const tiles = bd.children;
      if (!tiles.length) return;
      const totalRows = Math.ceil(tiles.length / cols);
      // Distance from one row to the next, gap included, for the shift.
      //
      // Read FRACTIONALLY off the grid's own box, not from offsetTop: a tile is
      // 127.09px tall on a 135.09px step, and offsetTop/offsetHeight round to
      // whole pixels, so an integer step drifted a tenth of a pixel per shifted
      // row (owner, 2026-07-31). The parent's rect is immune to a child tile's
      // :hover transform, which a per-tile rect is not.
      const bdH = bd.getBoundingClientRect().height;
      const rowStep = totalRows > 1 && bdH > 1
        ? (bdH + GAP) / totalRows
        : (tiles.length > cols
          ? tiles[cols].offsetTop - tiles[0].offsetTop
          : tiles[0].offsetHeight + GAP);
      if (!(rowStep > 1)) return;
      // The window height is taken from the BOTTOM OF THE LAST VISIBLE TILE
      // rather than from vis * rowStep. Row heights can settle a pixel or two
      // late (web fonts, tile art), and multiplying an early row step left the
      // last row clipped by the accumulated error.
      //
      // Plus two pixels of slack. The rounded measurement above came out under
      // a pixel short of the true row bottom, which was enough to shave the
      // last row's 1.5px bottom border and make the bottom row read as cut off.
      // The slack can only expose part of the 8px gap below the row, never a
      // tile.
      const last = tiles[Math.min(vis * cols, tiles.length) - 1];
      const windowH = last.offsetTop + last.offsetHeight - tiles[0].offsetTop + 2;
      if (!(windowH > 1)) return;
      const maxOffset = Math.max(0, Math.ceil(list.length / cols) - vis);
      setMetrics((cur) => (cur && cur.rowStep === rowStep && cur.windowH === windowH
        && cur.vis === vis && cur.maxOffset === maxOffset
        ? cur : { rowStep, windowH, vis, maxOffset }));
    };
    measure();
    // Re-measure once the first paint and any late web font have settled, so a
    // row height that arrives a frame later still produces an exact window.
    const raf = requestAnimationFrame(() => requestAnimationFrame(measure));
    const settle = setTimeout(measure, 500);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(vp);
    window.addEventListener('resize', measure);
    return () => {
      if (ro) ro.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(settle);
      window.removeEventListener('resize', measure);
    };
  }, [list.length]);

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
        canPin={myGamesOn}
        pinned={favSet.has(g.key)}
        onTogglePin={() => toggleFavorite(g.key)}
        onClose={() => setSel(null)}
      />
    );
  };

  // The slate: one row per game, with the per-game panel opening as a drawer
  // directly under its own row rather than as an overlay over the board.
  const renderSlate = (rows0, dim) => {
    const out = [];
    // A PAUSED GAME IS A READY-TO-PLAY ROW AT THE FOOT OF THAT GROUP (owner,
    // 2026-08-08). Paused games left the board for the cap earlier that day,
    // which left a game you had started findable in exactly one place, and only
    // while the cap still had a slot for it. They are back in the slate as
    // ordinary rows: same group as everything else you have not finished, sorted
    // BELOW the untouched ones, carrying the faint amber ground and gold left
    // rule that say the game is already open. The cap still promotes the first
    // couple of them; this is the copy you can always scroll to.
    //
    // So the slate holds TWO bands: Ready to play (untouched, then paused) and
    // Done today. There is no In progress band, its rows or its bar any more.
    // The partition is stable, so each of the three keeps the order the sort
    // handed it.
    // THE SUNDAYS TAB is its own view, not a filter over today's games: every
    // row points at an ARCHIVED puzzle, so none of today's state (played,
    // paused, incomplete) means anything here and none of the bands apply.
    if (filter === 'sunday') {
      const out = [<div className="sl-note" key="sun-note">
        This is a slate of your unplayed or oldest Sunday Editions of each game.
      </div>];
      if (sunErr) {
        out.push(<div className="sl-note dim" key="sun-e">That did not load. Try the tab again in a moment.</div>);
      } else if (!sunRows) {
        out.push(<div className="sl-note dim" key="sun-l">Finding your Sunday Editions&hellip;</div>);
      } else if (!sunRows.length) {
        out.push(<div className="sl-note dim" key="sun-0">No Sunday Editions have run yet.</div>);
      } else {
        for (const r of sunRows) {
          const g = GAMES.find((x) => x.key === r.key);
          if (!g) continue;
          out.push(
            <a className="sl-row sun" key={'sun-' + r.key} href={r.href}>
              <span className="sl-ic"><img src={blueTile(g.img)} alt="" aria-hidden="true" onError={tileFallback} /></span>
              <span className="sl-nm">
                <b>{g.name}</b><span className="sl-cm">{g.cat}</span>
                <span className="sl-sub">
                  <span className="sl-tg">{g.tag}</span>
                  <span className="sl-dot">&middot;</span>
                  <span className="sl-mld">{r.live ? sunDate(r.live) : `No. ${r.num}`}</span>
                </span>
              </span>
              <span className="sl-status"><span className="sl-btn play">{r.played ? 'Replay' : 'Play'}</span></span>
            </a>
          );
        }
      }
      return out;
    }
    const arr = rows0.filter((g) => !done.has(g.key) && !inprog.has(g.key))
      .concat(rows0.filter((g) => !done.has(g.key) && inprog.has(g.key)))
      .concat(rows0.filter((g) => isFail(g.key)))
      .concat(rows0.filter((g) => done.has(g.key) && !isFail(g.key)));
    // Phone layout groups the slate by state (owner-approved direction B,
    // 2026-08-07). The band headers are pushed FIRST and moved into place
    // by CSS `order` inside the <=900px block, NOT interleaved here, so the
    // DESKTOP source order is byte-identical to before and the sortable column
    // headers keep working exactly as they did. Above 900px the bands are
    // display:none. A row and its own drawer carry the same order value, and
    // equal-order flex items keep source order, so a drawer never leaves its
    // row. An empty group renders no band.
    let nProg = 0, nTodo = 0, nFail = 0, nDone = 0;
    arr.forEach((g) => {
      if (isFail(g.key)) nFail += 1;
      else if (done.has(g.key)) nDone += 1;
      else if (inprog.has(g.key)) nProg += 1;
      else nTodo += 1;
    });
    // Ready to play is BOTH sub-groups: the untouched rows and the paused ones
    // beneath them.
    const nReady = nTodo + nProg;
    // A band normally prints its own size on the right. Ready to play prints the
    // DAY instead (owner, 2026-08-08): how many of the whole slate are finished.
    // That figure used to be the third box in the phone header, where it competed
    // with the two IQ figures for a ~120px column; here it sits directly above the
    // rows it is counting. `n` is the GLOBAL done count, so a category filter
    // narrows the rows without rewriting the day's score. The ready count it
    // replaces is the same fact stated backwards, and the band only renders when
    // something is ready anyway.
    // One expand bar per group, ordered to the END of its own group by CSS,
    // exactly like the bands. A group with nothing hidden renders no bar, and a
    // group showing NOTHING renders no bar either: its band becomes the control
    // (see `band` below). The peek numbers are declared up here because the band
    // needs them.
    // The whole budget goes to UNPLAYED rows; paused rows peek zero and wait for
    // the bar. That is why the peek is measured against each sub-group's own
    // index below (`bucket`) rather than one running count.
    const todoPeek = twoUp ? TABLET_ROWS : PHONE_ROWS;
    // What the one Ready-to-play bar has to promise: the unplayed overflow PLUS
    // every paused row, and nothing at all under a filter, which shows every row
    // by itself.
    // Paused rows have their own band now, so they are no longer part of what
    // this figure has to promise.
    const readyHidden = filter === 'all' ? Math.max(0, nTodo - todoPeek) : 0;
    // A FILTER already is the reader asking to narrow the slate, so peeking
    // inside it would be answering that request with another lid (owner,
    // 2026-08-07): any filter other than All shows every paused and unplayed
    // row, with no bar. Finished games stay collapsed regardless, since the
    // reason they are collapsed is that you already know how you did.
    const peekOf = (grp) => {
      if (grp === 'dn') return 0;
      if (filter !== 'all') return Infinity;
      // Shut on a phone, open on desktop. Infinity rather than a count, so on
      // desktop no row carries sl-hid and the band renders as a plain label
      // instead of a chevron that would toggle nothing.
      if (grp === 'prog' || grp === 'fail') return phone ? 0 : Infinity;
      return todoPeek;
    };
    const toggle = (grp) => setGrpOpen((cur) => ({ ...cur, [grp]: !cur[grp] }));
    // A band normally prints its own size on the right. Ready to play prints the
    // DAY instead (owner, 2026-08-08): how many of the whole slate are finished.
    // That figure used to be the third box in the phone header, where it competed
    // with the two IQ figures for a ~120px column; here it sits directly above the
    // rows it is counting. `n` is the GLOBAL done count, so a category filter
    // narrows the rows without rewriting the day's score. The ready count it
    // replaces is the same fact stated backwards, and the band only renders when
    // something is ready anyway.
    //
    // THE BAND IS THE CONTROL WHEN ITS GROUP SHOWS NOTHING (owner, 2026-08-08).
    // Done today peeks zero rows, so a band saying "Done today 6" sat directly on
    // a bar saying "Show all 6": two full rows spent on one shut group. The band
    // takes a chevron and the click instead, and `more` drops the second row. A
    // group that peeks SOME rows keeps its bar, since there the bar counts what
    // is still hidden, which is not what the band says.
    const band = (grp, label, count, fig) => {
      if (!count) return null;
      const shut = count > peekOf(grp) && peekOf(grp) === 0;
      const inner = (
        <>
          <span className="sl-bt">{label}</span>
          <span className="sl-bc">{fig == null ? count : fig}</span>
          {shut ? (grpOpen[grp]
            ? <ChevronUp className="sl-bch" size={13} strokeWidth={2.8} />
            : <ChevronDown className="sl-bch" size={13} strokeWidth={2.8} />) : null}
        </>
      );
      return shut ? (
        <button
          type="button"
          className={`sl-band ${grp} tog`}
          key={`band-${grp}`}
          onClick={() => toggle(grp)}
          aria-expanded={grpOpen[grp]}
        >{inner}</button>
      ) : (
        <div className={`sl-band ${grp}`} key={`band-${grp}`}>{inner}</div>
      );
    };
    out.push(band('todo', 'Ready to play', nReady, `${n}/${GAMES.length} played`));
    // The two started groups sit between the untouched games and the finished
    // ones, in the order a game passes through them: still going, then over and
    // unsolved, then done.
    out.push(band('prog', 'In progress', nProg));
    out.push(band('fail', 'Incomplete today', nFail));
    out.push(band('dn', 'Complete today', nDone));
    // The bar names how many rows are HIDDEN, not how many the group holds
    // (owner, 2026-08-07): "Show all 38" made you do the subtraction against a
    // band that already printed the total.
    // PHONE ONLY, and one bar. Desktop lists every unfinished row (its .sl-hid
    // rule is scoped to the finished ones) and shuts Done today from the band
    // itself, so there is nothing left for a desktop bar to do: .sl-more is
    // display:none above 900px.
    const more = (grp, hidden) => (hidden > 0 ? (
      <button
        type="button"
        className={`sl-more ${grp}`}
        key={`more-${grp}`}
        onClick={(e) => {
          const el = e.currentTarget;
          const wasOpen = grpOpen[grp];
          toggle(grp);
          // COLLAPSING FOLLOWS THE READER (owner, 2026-08-07). Taking 34 rows
          // back out of the page leaves them wherever those rows used to be,
          // which is a long way from the bar they just pressed. Two frames, so
          // the re-render and its layout have both landed before we measure.
          if (wasOpen) {
            requestAnimationFrame(() => requestAnimationFrame(() => {
              try { el.scrollIntoView({ block: 'center' }); } catch (x) { /* older Safari */ }
            }));
          }
        }}
        aria-expanded={grpOpen[grp]}
      >
        {grpOpen[grp]
          ? <>Show fewer <ChevronUp size={12} strokeWidth={2.8} /></>
          : <>{`Show ${hidden} more`}<ChevronDown size={12} strokeWidth={2.8} /></>}
      </button>
    ) : null);
    // ONE BAR FOR EVERYTHING STILL UNDER A LID (owner, 2026-08-09). Now that it
    // sits at the FOOT of the board rather than between the groups, Ready to
    // play is no longer the only group above it, so opening just that one left
    // Complete today shut directly under a control that had said "show more".
    // It opens both and names the whole figure. Complete's own band keeps its
    // chevron, for opening that group by itself.
    const shutGroups = ['todo', 'prog', 'fail', 'dn'];
    const allOpen = shutGroups.every((g) => grpOpen[g]);
    const hiddenOf = { todo: readyHidden, prog: nProg, fail: nFail, dn: nDone };
    // Only a group a lid is actually ON counts toward the figure: on desktop the
    // two started groups peek Infinity, so nothing of theirs is hidden and the
    // bar must not offer to reveal it.
    const hiddenAll = shutGroups.reduce(
      (n, g) => n + (grpOpen[g] || peekOf(g) === Infinity ? 0 : hiddenOf[g]), 0);
    if (hiddenAll > 0 || allOpen) {
      out.push(
        <button
          type="button"
          className="sl-more todo"
          key="more-all"
          onClick={(e) => {
            const el = e.currentTarget;
            const next = !allOpen;
            setGrpOpen((cur) => ({ ...cur, todo: next, prog: next, fail: next, dn: next }));
            // Collapsing follows the reader, exactly as the per-group bar does:
            // taking dozens of rows back out of the page otherwise leaves them
            // wherever those rows used to be, a long way from what they pressed.
            if (!next) {
              requestAnimationFrame(() => requestAnimationFrame(() => {
                try { el.scrollIntoView({ block: 'center' }); } catch (x) { /* older Safari */ }
              }));
            }
          }}
          aria-expanded={allOpen}
        >
          {allOpen
            ? <>Show fewer <ChevronUp size={12} strokeWidth={2.8} /></>
            : <>{`Show all ${hiddenAll}`}<ChevronDown size={12} strokeWidth={2.8} /></>}
        </button>
      );
    }
    // Counted in DOM order, which IS the visual order WITHIN a group (equal
    // `order` values keep source order), so "the first two" means the same thing
    // to the reader as it does here.
    const seen = { prog: 0, todo: 0, fail: 0, dn: 0 };
    arr.forEach((g) => {
      const isDone = done.has(g.key);
      const fail = isFail(g.key);
      const ip = !isDone && inprog.has(g.key);
      // A paused row BELONGS to Ready to play (one band, one bar, one open
      // state) but is COUNTED against the paused half of the budget, since the
      // two halves peek different numbers of rows.
      const grp = fail ? 'fail' : (isDone ? 'dn' : (ip ? 'prog' : 'todo'));
      const bucket = fail ? 'fail' : (isDone ? 'dn' : (ip ? 'prog' : 'todo'));
      const gi = seen[bucket];
      seen[bucket] = gi + 1;
      const hid = !grpOpen[grp] && gi >= peekOf(bucket);
      const st = streaks[g.key] >= 2 ? streaks[g.key] : 0;
      const pl = playsOf(g.key);
      const bd = byKey[g.key];
      const lead = hasBoard && bd && bd.board && bd.board[0] ? bd.board[0].username : null;
      const row = isDone ? myRow(g.key) : null;
      const sl = row ? todayScoreLine(row, g.key) : null;
      const col = catCol(g.cat);
      const cat = CAT_SHORT[g.cat] || g.cat;
      const open = sel === g.key;
      const fav = favSet.has(g.key);
      out.push(
        <div
          key={g.key}
          className={`sl-row${isDone && !fail ? ' done' : ''}${fail ? ' fail' : ''}${ip ? ' inprog' : ''}${open ? ' open' : ''}${dim ? ' dim' : ''}${hid ? ' sl-hid' : ''}`}
          style={{ '--rc': col }}
          onClick={(e) => {
            // A click anywhere on the row, the emblem included, opens the stats
            // and archive drawer, and Play / Resume is the only control that
            // navigates into the game. This was phone-only behaviour from
            // 2026-08-07; desktop joined it 2026-08-08 when the row lost its
            // chevron along with the rest of its columns, so selecting the game
            // tile still expands exactly as it did.
            // The status cell holds the one control that leaves for the
            // game, so a click anywhere inside it follows that link rather than
            // expanding, even if it lands on the cell's padding instead of the
            // button itself (owner, 2026-08-08). Done rows are the exception by
            // construction: their chip is a static score with no link in it, so
            // there is nothing to follow and they expand like any other row.
            const st = e.target.closest && e.target.closest('.sl-status');
            const go = st && st.querySelector('a[href]');
            if (go) { e.preventDefault(); window.location.assign(go.getAttribute('href')); return; }
            if (e.target.closest && e.target.closest('.sl-btn.play,.sl-btn.prog,.sl-ab,.sl-favb')) return;
            e.preventDefault(); // swallow the name link's navigation
            pick(g.key);
          }}
        >
          {/* Pin. Restored to the row on 2026-08-07: the star used to live in a
              tile corner, and when the tile board was retired for the slate the
              only surviving control was the one inside the expanded drawer,
              which nobody found. Registered viewers only (a guest has no row to
              store the set on), so the column and its grid track both disappear
              for everyone else rather than leaving a dead gutter. */}
          {myGamesOn ? (
            <span className="sl-fav">
              <button
                type="button"
                className={`sl-favb${fav ? ' on' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // A tap leaves the button focused and phones keep painting it,
                  // which reads as a smudge stuck behind the star (same fix the
                  // tile star carried).
                  if (e.currentTarget && e.currentTarget.blur) e.currentTarget.blur();
                  toggleFavorite(g.key);
                }}
                disabled={!fav && favFull}
                aria-pressed={fav}
                aria-label={fav ? `Unpin ${g.name} from your games` : `Pin ${g.name} to the top of your board`}
                title={fav
                  ? 'One of your games. Unpin it here.'
                  : (favFull
                    ? `You have ${favMax} games pinned. Unpin one first.`
                    : 'Pin to your games. Your board reorders next visit.')}
              >
                <Star size={13} strokeWidth={2.4} fill={fav ? T.gold : 'none'} aria-hidden="true" />
              </button>
            </span>
          ) : null}
          <a className="sl-ic" href={g.href} aria-label={g.name}><img src={blueTile(g.img)} alt="" aria-hidden="true" onError={tileFallback} /></a>
          {/* Source order is now eyebrow, name, then the sub line that carries
              the leader. The desktop row is unaffected: .sl-cm and .sl-mld are
              both display:none above 900px, so it still renders exactly the
              name over its tagline. The phone's play count moved OUT of the sub
              line and into the .sl-pl figure on the right edge, which is why
              .sl-mpl is gone. */}
          <a className="sl-nm" href={g.href}>
            <i className="sl-cm" style={{ color: col }}>{cat}</i>
            {/* The count sits INSIDE the name line on a phone, small and quiet
                (owner, 2026-08-07): as a right-edge figure it cost a whole
                column and made every row taller. Desktop still reads it from
                the .sl-pl column below, which is why there are two of them and
                each is display:none at the other width. */}
            <b>{g.name}{pl != null ? <i className="sl-npl">{`${fmtPlays(pl)} playing`}</i> : null}</b>
            <span className="sl-sub">
              {/* The tagline is WRAPPED so it can be the flex item that yields.
                  As a bare text node the sub line's single ellipsis fell at the
                  end, which meant a long tagline (Emcee, Garble, Hands) ate the
                  leader chip instead of truncating itself. */}
              <i className="sl-tg">{g.tag}</i>
              <i className="sl-dot">{'\u00b7'}</i>
              <i className="sl-mld">{lead ? <><Crown size={9} strokeWidth={2.6} />{lead}</> : 'Be the first'}</i>
            </span>
          </a>
          <span className="sl-cat"><span style={{ background: `${col}1a`, color: col }}>{cat}</span></span>
          {/* One element, two readings: a bare centred number in the desktop
              Players column, a stacked figure on the phone. The <b>/<i> are
              neutralised above 900px (see .sl-pl b / .sl-pl i). */}
          <span className="sl-pl">{pl != null ? <><b>{fmtPlays(pl)}</b><i>playing</i></> : '\u2014'}</span>
          <span className={`sl-st${st ? '' : ' none'}`}>{st ? <><Flame size={10} strokeWidth={2.8} />{st}</> : '\u2013'}</span>
          <span className="sl-ld">{lead
            ? <><Crown size={10} strokeWidth={2.6} /><span>{lead}</span></>
            : <span className="sl-nl">Be the first</span>}</span>
          <span className="sl-status">
            {fail
              ? <a className="sl-btn fail" href={g.href} aria-label={`Retry ${g.name}`}>Retry</a>
              : isDone
              ? <span className="sl-btn done">{sl || 'Done'}</span>
              : ip
                ? <a className="sl-btn prog" href={g.href} aria-label={`Resume ${g.name}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5l11 7-11 7z" /></svg>
                    {/* The word rides with the triangle only where the paused
                        row is a cap-shaped card with a cap-sized button to put
                        it in; everywhere else the chip stays icon-only. */}
                    <i className="sl-rz">Resume</i>
                  </a>
                : <a className="sl-btn play" href={g.href}>Play</a>}
          </span>
          <span className="sl-arch">
            <button
              type="button"
              className={`sl-ab${open ? ' on' : ''}`}
              onClick={() => pick(g.key)}
              aria-expanded={open}
              aria-label={`${g.name} archive and stats`}
            >
              {(() => {
                const a = archive[g.key];
                const pct = (a && a.total) ? Math.round((a.played / a.total) * 100) : null;
                return pct == null ? <span className="sl-ab-pct">Archive</span> : (
                  <>
                    <span className="sl-ring" style={{ background: `conic-gradient(currentColor ${pct}%, rgba(20,22,28,0.14) 0)` }}><i /></span>
                    <span className="sl-ab-pct">{`${pct}%`}</span>
                  </>
                );
              })()}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </button>
          </span>
        </div>,
      );
      // The state class is what pairs the drawer with its row under the phone
      // `order` grouping; it has no effect above 900px.
      // The drawer inherits sl-hid, so collapsing a group takes an open drawer
      // with it rather than leaving a panel with no row above it.
      if (open) out.push(<div className={`sl-drawer${isDone && !fail ? ' done' : ''}${fail ? ' fail' : ''}${ip ? ' inprog' : ''}${hid ? ' sl-hid' : ''}`} key={`drawer-${g.key}`}>{renderPanel(g)}</div>);
    });
    return out;
  };

  // Renders one group of tiles. `dim` marks the games a filter did not match:
  // they still render (so the board keeps its full height) but recede.
  //
  // Two shapes, per the click model at the top of this file. UNFINISHED: a div
  // carrying a stretched <a> over the whole face (a real link, so middle-click
  // and open-in-new-tab work) plus the corner stats button. FINISHED: a single
  // button that opens the panel, green, with no icon or category chip.
  const renderTiles = (arr, dim) => arr.map((g) => {
    const isDone = done.has(g.key);
    const ip = !isDone && inprog.has(g.key);
    const st = streaks[g.key] >= 2 ? streaks[g.key] : 0;
    const pl = playsOf(g.key);
    const lead = hasBoard && byKey[g.key] && byKey[g.key].board && byKey[g.key].board[0] ? byKey[g.key].board[0].username : null;
    const row = isDone ? myRow(g.key) : null;
    const sl = row ? todayScoreLine(row, g.key) : null;
    const fav = favSet.has(g.key);
    const cls = `dh-tile${isDone ? ' done' : ''}${ip ? ' inprog' : ''}${sel === g.key ? ' sel' : ''}${dim ? ' dim' : ''}${myGamesOn || fav ? ' pinnable' : ''}${fav ? ' pinned' : ''}`;
    const face = (
      <>
        <span className="dh-acc" style={{ background: catCol(g.cat) }} aria-hidden="true" />
        {/* A finished tile is itself a <button> (it opens the panel), so its
            star is a static indicator, never a nested button. The pin control
            for a finished game lives in that panel. */}
        {isDone && fav ? (
          <span className="dh-tfav ind" aria-hidden="true">
            <Star size={10} strokeWidth={0} fill="currentColor" />
          </span>
        ) : null}
        <span className="dh-tdot" style={{ background: isDone ? '#16a34a' : (ip ? T.gold : 'transparent') }} aria-hidden="true" />
        {pl != null ? (
          <span className="dh-tcorner">
            <span className="dh-tplays" title={`${pl.toLocaleString()} ${pl === 1 ? 'play' : 'plays'} today`}>
              <Users size={9} strokeWidth={2.6} aria-hidden="true" />{fmtPlays(pl)}
            </span>
          </span>
        ) : null}
        <span className="dh-tnm">{g.name}</span>
        {isDone ? (
          <span className="dh-tcta">Click for stats &amp; archive</span>
        ) : null}
        {(!isDone || slate) ? (
          <>
            <span className="dh-tcat" style={{ background: catCol(g.cat), color: T.white }}>
              {CAT_SHORT[g.cat] || g.cat}
            </span>
            <span className="dh-tic"><img src={g.img} alt="" aria-hidden="true" /></span>
          </>
        ) : null}
        <span className="dh-tmeta">
          <span className="dh-mrow">
            {isDone ? (
              <span className="dh-msc"><svg viewBox="0 0 24 24" width="10" height="10" fill="none" aria-hidden="true"><path d="M4 12.5 L10 18.5 L20 6" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>{sl || 'Done'}</span>
            ) : null}
            <span className={`dh-mstrk${st ? '' : ' none'}`}><Flame size={9} strokeWidth={2.8} />{st || 0}</span>
          </span>
          <span className="dh-mlead">
            {lead
              ? <><Crown size={9} strokeWidth={2.6} /><span>{lead}</span></>
              : <span className="dh-nolead">Be the first</span>}
          </span>
        </span>
      </>
    );

    if (isDone) {
      return (
        <button
          type="button"
          key={g.key}
          className={cls}
          onClick={() => pick(g.key)}
          aria-expanded={sel === g.key}
          aria-label={`${g.name} — done today${sl ? `, ${sl}` : ''}${fav ? ' — one of your games' : ''} — open stats and archive`}
        >
          {face}
        </button>
      );
    }
    return (
      <div key={g.key} className={cls} style={{ borderColor: CAT_BD[g.cat] }}>
        <a
          className="dh-tfill"
          href={g.href}
          aria-label={`${ip ? 'Resume' : 'Play'} ${g.name} — ${g.tag}${st ? ` — ${st}-day streak` : ''}${pl != null ? ` — ${pl} ${pl === 1 ? 'play' : 'plays'} today` : ''}`}
        />
        {face}
        <button
          type="button"
          className="dh-tstats"
          onClick={() => pick(g.key)}
          aria-expanded={sel === g.key}
          aria-label={`${g.name} stats and archive`}
          title="Stats & archive"
        >
          <BarChart3 size={11} strokeWidth={2.6} aria-hidden="true" />
        </button>
        {/* Pin control. Registered viewers only: the set is stored on the
            account so it follows them across devices, and a guest has no row
            to store it on (owner ruling, 2026-08-02). It sits ABOVE the
            stretched .dh-tfill link (z-index 3, same as the stats glyph) and
            stops the click, so pinning never navigates into the game. */}
        {myGamesOn ? (
          <button
            type="button"
            className={`dh-tfav${fav ? ' on' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // A tap leaves the button focused, and on a phone the browser
              // keeps painting it until you tap something else, which read as a
              // faint block stuck behind the star after un-starring.
              if (e.currentTarget && e.currentTarget.blur) e.currentTarget.blur();
              toggleFavorite(g.key);
            }}
            disabled={!fav && favFull}
            aria-pressed={fav}
            aria-label={fav ? `Unpin ${g.name} from your games` : `Pin ${g.name} to the top of your board`}
            title={fav
              ? 'One of your games. Unpin it here.'
              : (favFull
                ? `You have ${favMax} games pinned. Unpin one first.`
                : 'Pin to your games. Your board reorders next visit.')}
          >
            <Star size={11} strokeWidth={2.4} fill={fav ? T.gold : 'none'} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    );
  });

  return (
    <div className={'dhome' + (selGame ? ' open' : '') + (slate ? ' slate' : '')}>
      {/* RAW, not a JSX text child: React escapes `>` in a text node, so as
          `{`...`}` every child-combinator selector in here reached the browser
          as `.dh-cell &gt; img` and was dropped as invalid until hydration
          replaced the node. Nine rules were dead on first paint, among them
          the two that hide the cap's tile art and the one that sizes it, so
          the cap flashed two full-size game tiles on every load (owner,
          2026-08-06). Nothing inside contains `</`, so raw insertion is safe. */}
      <style dangerouslySetInnerHTML={{ __html: `
        .dhome{position:relative;margin-bottom:16px;font-family:'Manrope',system-ui,-apple-system,sans-serif;display:flex;flex-direction:column;min-height:100%;}
        /* ── stats bar, welded onto the grid ── */
        .dh-sbar{container-type:inline-size;position:relative;z-index:3;flex-wrap:nowrap;display:flex;align-items:center;gap:10px;background:var(--white);border:1.5px solid var(--border);border-bottom:none;border-radius:13px 13px 0 0;padding:10px 12px;color:var(--ink);border-bottom:1px solid #eef0f4;}
        /* ── the cap: two equal halves ── (owner, 2026-08-03)
           The Your-day stat row and its phone-only variant moved OUT of this bar
           and up into the page header, where each figure pairs with its lifetime
           counterpart. What is left is a pure "where to go next" cap, split down
           the middle: Up next (the first unfinished daily in board order) on the
           left, Easiest leaderboard (fewest players today) on the right. Both
           halves are flex:1 1 0 so they hold exactly 50% each at every width,
           desktop and phone alike, rather than one growing to fit its text. */
        /* flex-basis 50%, not 0: with a 0 basis the right half's 14px padding
           and 1.5px divider are added OUTSIDE the equal share, so it came out
           ~15px wider than the left. A percentage basis is a border-box
           measurement, so the two halves come out exactly equal (each
           shrinking by half the gap), which is what the owner asked for. */
        .dh-cell{display:flex;align-items:center;gap:12px;flex:1 1 50%;min-width:0;box-sizing:border-box;}
        .dh-cell + .dh-cell{padding-left:14px;border-left:1.5px solid var(--border);}
        .dh-cell .dh-play{flex:0 0 auto;margin-left:auto;width:112px;min-width:0;font-size:13.5px;padding:11px 0;}
        .dh-cell>img{height:32px;width:auto;max-width:40px;object-fit:contain;flex:none;}
        .dh-bupt{min-width:0;}
        /* Both eyebrows read blue (owner, 2026-08-03). The easiest board used to
           own gold against Up next's blue; the cap now sits on the brand blue like
           the rest of the surface, so the .up modifier is a no-op kept for callers. */
        .dh-bue{font-size:9px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--blue);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .dh-bue.up{color:var(--blue);}
        .dh-bshort{display:none;}
        .dh-bun{font-size:17px;font-weight:800;letter-spacing:-.3px;line-height:1.3;padding-bottom:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .dh-busub{font-size:11px;font-weight:600;color:var(--muted);line-height:1.35;padding-bottom:1px;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        /* @container widths are the BAR's content box, not the viewport (.dh-sbar
           is border-box with 12px side padding), so a 390px phone queries at
           ~366px. Both halves shed furniture at the same width so neither wraps. */
        @container (max-width:620px){
          .dh-sbar{gap:8px;}
          .dh-cell{gap:9px;}
          .dh-cell + .dh-cell{padding-left:9px;}
          .dh-busub{display:none;}
          .dh-wideonly{display:none;}
          .dh-cell .dh-play{min-width:0;font-size:12px;padding:9px 13px;}
        }
        .dh-play{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:var(--cta);color:var(--cta-ink);font-weight:800;font-size:13px;border-radius:9px;padding:10px 18px;text-decoration:none;border:none;cursor:pointer;transition:background .12s;}
        .dh-play:hover{background:var(--cta-hover);}
        /* The cap's expand bar. Same object as the board's group bars, spanning
           the cap's columns at the foot of the paused cards. */
        .dh-cmore{grid-column:1/-1;display:flex;align-items:center;justify-content:center;gap:6px;width:100%;
          padding:7px 13px;border:0;border-top:2px solid #c2ccdc;border-bottom:2px solid #c2ccdc;border-radius:0;
          background:#e8edf5;font-family:inherit;font-size:10.5px;font-weight:800;letter-spacing:.08em;
          text-transform:uppercase;line-height:1.5;color:var(--ink);cursor:pointer;}
        .dh-cmore:hover{background:#dde5f0;}
        /* Each figure in its own card's colour, so the number and the kind it
           counts read as one piece. font-weight is already 800 on the bar, so
           the <b> adds colour only. */
        .dh-cmp{color:var(--gold-ink);font-weight:inherit;}
        .dh-cmf{color:#b91c1c;font-weight:inherit;}
        .dh-cmd{color:var(--slate);}
        /* Clicking the bar left the browser's own focus ring on it once it had
           been used: a hard dark box around a band that is otherwise all soft
           greys, so a bar that had been pressed no longer matched one that had
           not (owner, 2026-08-08). Pointer focus is silent; KEYBOARD focus keeps
           a ring, in the site blue, inset so it cannot widen the bar. Same
           treatment on the board's own group bars, which are the same object. */
        .dh-cmore:focus{outline:none;}
        .dh-cmore:focus-visible{outline:2px solid var(--blue);outline-offset:-2px;}
        /* The paused block. SHUT it is display:contents, so the cards are grid
           items of the cap exactly as they were before this wrapper existed and
           every rule addressing them (the two-up tracks, the odd-child hairline,
           the width cuts) behaves identically. OPEN, above 900px, it becomes its
           own two-up grid with a measured ceiling and scrolls inside itself: see
           CAP_PMIN and the fit effect. The phone board is height:auto and flows
           with the page, so there it stays display:contents at any length and
           the cards simply stack. */
        .dh-cprog{display:contents;}
        /* daily leaderboard: always-visible Today's Top 3 + expand */
        @media(max-width:640px){.dh-dtop{gap:8px 10px;padding:8px 11px;}.dh-dtop-exp{font-size:11px;padding:6px 10px;}}
        /* ── tile board ── */
        .dh-boardwrap{position:relative;background:var(--white);border:1.5px solid var(--border);border-top:none;border-radius:0 0 13px 13px;
          /* SLATE HAS NO SIDE BORDERS (owner, 2026-08-09): every band above the
             board runs the full width of the console, and a 1.5px border here
             insets the board, so each group band inside it started one pixel in
             from the strip directly above. The rule lives beside the shorthand
             it overrides so the two are read together. */padding:10px;flex:1 1 auto;display:flex;flex-direction:column;min-height:0;}
        .dh-boardwrap.open{min-height:475px;}
        .dh-board{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;flex:1 1 auto;align-content:stretch;grid-auto-rows:minmax(118px,1fr);}
/* The board window. Until it has been measured (and always below 861px) this is
           a plain passthrough, so the grid flows normally and nothing is ever clipped
           by a stylesheet the JS has not caught up with. The .on class is what arms it. */
        .dh-vpwrap{position:relative;flex:0 0 auto;}
        .dh-vp{position:relative;flex:1 1 auto;min-height:0;display:flex;flex-direction:column;}
        .dh-vp.on{flex:0 0 auto;}
        .dh-vp.on{overflow:hidden;}
        .dh-vp.on > .dh-board{position:absolute;top:0;left:0;right:0;transition:transform .32s cubic-bezier(.4,0,.2,1);}
        /* The arrow sits ON the window's bottom edge, centred, so it half-covers the
           bottom of the two middle tiles in the last visible row (owner, 2026-07-30).
           It lives outside .dh-vp because the window clips its own overflow. */
        .dh-more{position:absolute;left:50%;bottom:0;transform:translate(-50%,50%);z-index:5;width:38px;height:38px;padding:0;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--white);border:1.5px solid var(--border);box-shadow:0 3px 10px rgba(20,22,28,0.20);cursor:pointer;color:var(--accent);font-family:inherit;}
        .dh-more:hover{border-color:var(--accent);background:var(--surface);box-shadow:0 4px 13px rgba(20,22,28,0.26);}
        @media(max-width:860px){.dh-more{display:none;}}
        /* The phone "show all / show fewer" toggle under the board. Hidden
           everywhere but phones; see the 640px block for the reveal + the cut. */
        .dh-mall{display:none;width:100%;margin-top:8px;align-items:center;justify-content:center;gap:6px;background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:11px 14px;font-family:inherit;font-size:12.5px;font-weight:800;letter-spacing:-.1px;color:var(--accent);cursor:pointer;}
        .dh-mall:active{background:#eef1f6;border-color:var(--accent);}
        /* Tile icon art is normalised to a dark-on-transparent set so it reads on the
       white tile with no plate. warmer, carve and suds resisted the recolour, so
       those three PNGs carry a baked navy plate instead (owner 2026-07-29). */
        .dh-tile{container-type:inline-size;position:relative;overflow:hidden;background:var(--white);border:1.5px solid var(--border);border-radius:11px;padding:10px 8px 9px;text-align:center;cursor:pointer;text-decoration:none;color:var(--ink);transition:transform .12s,filter .12s,box-shadow .12s;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:0;font-family:inherit;min-height:118px;}
        .dh-tile:hover{transform:translateY(-2px);background:#f7f9fc;box-shadow:0 5px 14px rgba(20,22,28,0.12);}
        .dh-tile.sel{border-color:var(--gold-ink);box-shadow:0 0 0 2px var(--gold);}
        .dh-tile.inprog{background:#fffaeb;}
        /* A finished tile reads green (owner, 2026-07-31): the completed games
           sink to the end of the board, so the block of green is the day's
           progress read at a glance. It is also the only tile that opens the
           panel, hence the CTA line where its icon and chip used to be. The
           green is a FAINT wash with dark-green ink, not a solid fill: a solid
           #166534 tile shipped first and read far too heavy against the white
           board (owner, 2026-07-31). Keep any future change on the pale side. */
        .dh-tile.done{background:#dcfce7;border-color:#16a34a;color:#14532d;}
        .dh-tile.done:hover{background:#cdf5dc;}
        .dh-tile.done .dh-tnm{color:#14532d;}
        .dh-tile.done .dh-msc{color:var(--success-deep);}
        .dh-tile.done .dh-mstrk{color:#8a5300;}
        .dh-tile.done .dh-mstrk.none{color:#5d7a68;}
        .dh-tile.done .dh-mlead{color:#2f4a3a;}
        .dh-tile.done .dh-mlead svg{color:var(--gold-ink);}
        .dh-tile.done .dh-nolead{color:#5d7a68;}
        /* Replaces the icon + category chip on a finished tile. Wraps to two
           lines on a narrow tile, which is exactly the room those two freed. */
        .dh-tcta{margin:6px 2px 0;font-family:'DM Mono',ui-monospace,monospace;font-size:8.5px;line-height:1.35;letter-spacing:.05em;text-transform:uppercase;color:var(--success-deep);max-width:100%;}
        /* The play target on an unfinished tile: a real link stretched over the
           whole face, so the tile is one click from the game and still supports
           middle-click / open in new tab. It sits ABOVE the tile's own spans
           (which are decorative) and BELOW the stats button. */
        .dh-tfill{position:absolute;inset:0;z-index:2;border-radius:10px;text-decoration:none;}
        .dh-tile:focus-within{outline:2px solid var(--blue);outline-offset:1px;}
        /* Stats + archive, for a game you have not finished. Bottom-right
           rather than top-right: the top corners already carry the play count
           and the status dot, and a button up there would run
           under the centred game name on a six-across tile. .dh-mlead pads
           EQUALLY on both sides (owner, 2026-07-31): a right-only pad cleared
           the button but pushed the leader name visibly off centre, so the
           name now sits dead centre and simply ellipsizes 16px earlier. */
        .dh-tstats{position:absolute;right:3px;bottom:4px;z-index:3;width:17px;height:17px;padding:0;display:flex;align-items:center;justify-content:center;border:1px solid #d5dce6;border-radius:5px;background:var(--white);color:#6b7686;cursor:pointer;font-family:inherit;transition:color .12s,background .12s,border-color .12s;}
        .dh-tstats:hover{color:var(--accent);background:#eef1f6;border-color:var(--accent);}
        /* Pin control / pinned indicator. BOTTOM-LEFT, mirroring the stats
           glyph at bottom-right (owner, 2026-08-02). It sat top-right at first,
           which forced the centred game name to pad right and knocked it off
           centre; the bottom corners are the tile's control row and .dh-mlead
           already reserves 16px on both sides for exactly this. Unpinned it is
           a quiet outline that fills gold on hover, so it reads as an
           affordance without competing with the game art. .ind is the static
           span a finished tile shows, which has no hit area of its own. */
        .dh-tfav{position:absolute;left:3px;bottom:4px;z-index:3;width:17px;height:17px;padding:0;display:flex;align-items:center;justify-content:center;border:0;border-radius:5px;background:transparent;color:#798393;cursor:pointer;font-family:inherit;-webkit-tap-highlight-color:transparent;transition:color .12s,background .12s,transform .12s;}
        /* Hover is gated on a real pointer. A TAP applies :hover on a phone and
           the browser keeps it painted until you tap somewhere else, so
           star-then-unstar left a faint gold block sitting behind the star
           (owner, 2026-08-02). Same reason the tap highlight is cleared above. */
        @media(hover:hover){
          .dh-tfav:hover{color:var(--gold-ink);background:#fdf4dc;transform:scale(1.12);}
          .dh-tfav:disabled:hover{color:#798393;background:transparent;transform:none;}
        }
        .dh-tfav.on{color:var(--gold-ink);}
        .dh-tfav:disabled{cursor:default;opacity:.35;}
        .dh-tfav.ind{pointer-events:none;color:var(--gold-ink);}
        .dh-tile.done .dh-tfav.ind{color:var(--success-deep);}
        .dh-tfav:focus-visible{outline:2px solid var(--blue);outline-offset:1px;}
        /* A FINISHED tile has no stats glyph, so .dh-mlead there is unpadded and
           a long leader name would run under the star. Pad it only when a star
           is actually drawn (.pinned), so an unpinned tile keeps its leader
           line perfectly centred. Unfinished tiles already carry symmetric
           16px via the .dh-mlead rule below. */
        .dh-tile.done.pinned .dh-mlead{padding-left:16px;}
        .dh-tile:not(.done) .dh-mlead{padding:0 16px;}
        .dh-acc{position:absolute;top:0;left:0;right:0;height:3px;border-radius:12px 12px 0 0;opacity:.95;}
        .dh-tile.done .dh-acc{background:#22c55e !important;}
        .dh-tic{width:46px;height:30px;display:flex;align-items:center;justify-content:center;flex:none;margin:5px 0 6px;}
        .dh-tic img{height:24px;width:auto;max-width:30px;object-fit:contain;}
        .dh-tnm{font-size:15px;font-weight:800;letter-spacing:-.3px;line-height:1.34;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;}
        .dh-tcat{margin-top:3px;font-family:'DM Mono',ui-monospace,monospace;font-size:9px;letter-spacing:.09em;text-transform:uppercase;border-radius:999px;padding:1px 6px;max-width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}
        .dh-tmeta{display:flex;flex-direction:column;align-items:center;gap:2px;width:100%;min-width:0;margin-top:auto;}
        .dh-mrow{display:flex;align-items:center;justify-content:center;flex-wrap:nowrap;gap:6px;max-width:100%;}
        .dh-nolead{color:#49525f;font-weight:600;}
        .dh-msc{display:inline-flex;align-items:center;gap:3px;font-size:9.5px;font-weight:800;color:#116932;flex:none;}
        .dh-mstrk{display:inline-flex;align-items:center;gap:2px;font-size:9.5px;font-weight:800;color:#8a5300;flex:none;}
        .dh-mstrk.none{color:#4d5872;}
        .dh-mlead{display:flex;align-items:center;justify-content:center;gap:3px;font-size:9.5px;font-weight:700;color:var(--muted);min-width:0;max-width:100%;width:100%;}
        .dh-mlead svg{flex:none;color:var(--gold-ink);}
        .dh-mlead span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .dh-tdot{position:absolute;top:8px;right:9px;width:7px;height:7px;border-radius:50%;}
        /* Top-left corner row: today's play count. It sits opposite
           .dh-tdot and clears the centred game name on a 123px tile. */
        .dh-tcorner{position:absolute;top:7px;left:6px;display:flex;align-items:center;gap:4px;max-width:calc(100% - 22px);pointer-events:none;}
        /* The player glyph STACKS UNDER the number rather than sitting beside it
           (owner, 2026-08-02). Side by side it cost ~34px of the tile's top
           edge, which ran under the longest centred names on a six-across
           board, so a @container (max-width:117px) rule hid the glyph and the
           number was left unlabelled on every desktop tile (content box 105px).
           Stacked, the badge is only as wide as the number itself, 12px, so the
           glyph is free: measured on the live board it clears the longest name
           (Outrank) by 14px and the category chip below it by 5px vertically.
           column-reverse keeps the DOM order glyph-then-number, so the number
           still reads first to a screen reader while rendering on top. */
        .dh-tplays{display:inline-flex;flex-direction:column-reverse;align-items:center;gap:1px;font-size:9.5px;font-weight:800;line-height:1;color:#4d5872;font-variant-numeric:tabular-nums;flex:none;}
        .dh-tplays svg{flex:none;opacity:.85;}
        /* ── expand panel (navy, full width) ── */
        /* ── overall daily leaderboard (toggled) ── */
        .dh-lbpanel{background:var(--white);border:1.5px solid var(--border);;border:1px solid #e8c46a;border-radius:12px;padding:16px 16px 14px;margin-bottom:12px;color:var(--ink);}
        .dsd-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px;}
        .dsd-l{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold-ink);font-weight:800;}
        .dsd-r{font-size:10.5px;color:var(--muted);font-weight:600;}
        .dsd-grid{display:grid;grid-template-columns:320px 1fr;gap:18px;align-items:start;}
        @media(max-width:900px){.dsd-grid{grid-template-columns:1fr;}}
        .dsd-sub{font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:800;margin-bottom:8px;}
        .dsd-cols{display:grid;grid-template-columns:24px 1fr 46px 60px;gap:8px;padding:0 11px 6px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);}
        .dsd-row{display:grid;grid-template-columns:24px 1fr 46px 60px;gap:8px;align-items:center;padding:8px 11px;margin-bottom:5px;border-radius:10px;background:#fdf3dd;border:1px solid #fdf3dd;}
        .dsd-row.plain{background:var(--surface);border-color:var(--muted);}
        .dsd-row.me{background:#fdf3dd;border-color:#8a5300;}
        .dsd-rk{font-weight:800;font-size:15px;color:#8a5300;font-variant-numeric:tabular-nums;}
        .dsd-row.plain .dsd-rk{color:var(--muted);}
        .dsd-pn{font-size:13.5px;font-weight:500;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .dsd-pn b{color:var(--gold-ink);font-weight:700;}
        .dsd-g{font-size:12px;color:var(--muted);text-align:right;font-variant-numeric:tabular-nums;font-weight:600;}
        .dsd-tt{font-size:13.5px;font-weight:800;color:#8a5300;text-align:right;font-variant-numeric:tabular-nums;}
        .dsd-tt s{font-size:10px;font-weight:600;color:var(--muted);text-decoration:none;}
        .dsd-empty{font-size:12.5px;color:var(--muted);font-weight:600;padding:8px 2px;}
        .dsd-row.first{background:#fdf3dd;border-color:#8a5300;}
        .dsd-row.first .dsd-rk{font-size:17px;color:#8a5300;}
        .dsd-row.first .dsd-pn{font-weight:800;font-size:14.5px;color:#8a5300;display:flex;align-items:center;gap:5px;}
        .dsd-row.first .dsd-cr{color:var(--gold-ink);flex:none;}
        .dsd-row.first .dsd-tt{font-size:15px;}
        .dsd-past{margin-top:20px;padding-top:16px;border-top:1px solid #eef0f4;}
        .dsd-yest{display:flex;align-items:center;gap:7px;margin-top:6px;padding:7px 11px;border-radius:10px;background:var(--surface);border:1px solid #eef0f4;}
        .dsd-yest.top{padding:9px 11px;background:var(--surface);border-color:var(--muted);}
        .dsd-yest .yl{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:800;flex:none;min-width:56px;}
        .dsd-yest b{min-width:0;font-size:12px;color:#c9d6ee;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .dsd-yest.top b{font-size:13px;color:var(--ink);font-weight:700;}
        .dsd-yest .yt{margin-left:auto;flex:none;font-size:11.5px;font-weight:700;color:#d8c489;font-variant-numeric:tabular-nums;}
        .dsd-yest.top .yt{font-size:12.5px;font-weight:800;color:#8a5300;}
        .dsd-yest .yt s{font-size:9.5px;font-weight:600;color:var(--muted);text-decoration:none;}
        .dsd-yest .ynone{font-size:12px;color:var(--muted);font-weight:600;}
        .dsd-hof{display:flex;align-items:center;gap:6px;padding:9px 11px;border-radius:10px;background:#fdf3dd;border:1px solid #e8c46a;color:#8a5300;font-size:12px;font-weight:800;text-decoration:none;transition:background .12s;}
        .dsd-hof:hover{background:#fdf3dd;}
        .dsd-hof svg{color:var(--gold-ink);flex:none;}
        .dsd-players{margin-top:9px;font-size:11.5px;color:var(--muted);font-weight:600;}
        .dsd-players b{color:var(--ink);font-size:14px;font-weight:800;font-variant-numeric:tabular-nums;}
        .dsd-players s{color:var(--muted);text-decoration:none;font-size:10.5px;}
        .dsd-gt{font-size:11px;font-weight:800;margin-bottom:7px;display:flex;justify-content:space-between;align-items:baseline;text-decoration:none;}
        .dsd-gt span{font-size:9px;color:var(--muted);font-weight:600;}
        .dsd-minis{display:grid;grid-template-columns:repeat(5,1fr);gap:9px;}
        @media(max-width:1200px){.dsd-minis{grid-template-columns:repeat(4,1fr);}}
        @media(max-width:900px){.dsd-minis{grid-template-columns:repeat(2,1fr);}}
        .dsd-mini{background:var(--surface);border:1px solid #eef0f4;border-radius:11px;padding:10px 11px;}
        .dsd-mr{display:flex;gap:6px;align-items:baseline;font-size:11.5px;padding:2px 0;}
        .dsd-k{width:11px;font-weight:800;color:#8a5300;font-variant-numeric:tabular-nums;flex:0 0 auto;}
        .dsd-n2{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink);font-weight:500;}
        .dsd-n2 b{color:var(--gold-ink);font-weight:700;}
        .dsd-p{color:var(--muted);font-variant-numeric:tabular-nums;font-weight:600;font-size:10.5px;}
        .dsd-none{color:var(--muted);font-size:10.5px;padding:2px 0;}
        /* ── responsive ── */
        /* ── slate layout ──────────────────────────────────────────────
           A real table of rows, not the tile card reflowed: the tile's parts are
           absolutely positioned corner furniture and a finished tile swaps its
           category chip for a CTA line, so columns could never line up. This is
           its own markup (renderSlate) over the SAME data and the same pick(),
           and the per-game panel opens as a drawer under its own row. */
        .dh-boardwrap.slate{padding:0;}
        .dh-boardwrap.slate.open{min-height:0;}
        /* --dh-fit is measured (see the fit effect); the calc is only the value
           before the first measurement lands. min-height stays BELOW the
           measured floor so the measurement, not this rule, is what governs. */
        .dh-board.slate{display:block;grid-template-columns:none;grid-auto-rows:auto;height:var(--dh-fit,calc(100vh - 300px));min-height:240px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#d3d9e2 transparent;}
        .dh-board.slate::-webkit-scrollbar{width:6px;}
        .dh-board.slate::-webkit-scrollbar-track{background:transparent;}
        .dh-board.slate::-webkit-scrollbar-thumb{background:#dfe4ec;border-radius:3px;}
        .dh-board.slate:hover::-webkit-scrollbar-thumb{background:#c9d1dd;}
        /* Up next and Easiest leaderboard are a matched pair on the slate: two
           equal cells, same eyebrow, same button (owner, 2026-08-03). On a phone
           they stop being cells and become two full-width bars, one under the
           other, the way the mockup has them. */
        .dhome.slate .dh-cell{flex:1 1 50%;}
        .dhome.slate .dh-cell .dh-play{width:112px;}
        /* Desktop slate cap (owner, 2026-08-04): the phone's solid slabs, run
           side by side. The white bar carried five competing accents at once
           (two blue eyebrows, two blue button fills, a grey icon plate and a
           divider rule), so nothing led the eye. Each half now takes its own
           tone off the brand ramp, deep navy on the left and blue on the
           right, with white type and a white button: MORE pop from LESS colour
           variety. The phone block below (<=900px) keeps its own tones and its
           stacking, and is untouched. */
        @media(min-width:901px){
          /* A GRID, not a two-cell flex row (owner, 2026-08-08): the paused
             games are cards in this cap now, so it holds 2 + n cards two to a
             row rather than exactly two halves.
             border:none, not just border-bottom: the bar's 1.5px grey SIDE
             borders were the slight indentation against the title band above,
             whose own border is the colour of its fill and so reaches the
             console edge. Both bands now start on the same pixel. */
          .dhome.slate .dh-sbar{display:grid;grid-template-columns:1fr 1fr;align-items:stretch;padding:0;gap:0;background:transparent;border:none;}
          .dhome.slate .dh-cell{position:relative;padding:14px 16px 14px 26px;background:#2c4fa8;color:var(--white);min-width:0;}
          /* Cards are addressed by CLASS now: the adjacent-sibling rule
             used to mean "the Easiest half", and with paused cards in the same
             bar it would mean every card but the first. */
          .dhome.slate .dh-cell + .dh-cell{padding-left:26px;border-left:none;}
          .dhome.slate .dh-cell.easy{background:var(--blue-deep);}
          /* a white rule replaces the game icon, which is unreadable at 32px on
             a saturated ground */
          .dhome.slate .dh-cell > img{display:none;}
          .dhome.slate .dh-cell::before{content:'';position:absolute;left:13px;top:14px;bottom:14px;width:4px;border-radius:2px;background:rgba(255,255,255,.9);}
          .dhome.slate .dh-bue,.dhome.slate .dh-bue.up{color:var(--blue-200);font-size:9.5px;letter-spacing:.11em;}
          /* line-height 1.3 + a pixel of pad, NOT the shared 1.1: these lines
             are overflow:hidden for the ellipsis, so a 1.1 box clips the
             descender off a g/p/y in a game name or its tagline. */
          .dhome.slate .dh-bun{color:var(--white);font-size:20px;line-height:1.3;padding-bottom:1px;}
          .dhome.slate .dh-busub{display:block;color:var(--blue-200);font-weight:600;line-height:1.35;padding-bottom:1px;}
          .dhome.slate .dh-cell .dh-play{margin-left:auto;background:var(--white);color:var(--blue-deep);width:104px;min-width:0;font-size:12px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:11px 0;border-radius:8px;}
          .dhome.slate .dh-cell .dh-play:hover{background:var(--blue-200);}
          /* EVERY card's button is the same box, whatever the card says (owner,
             2026-08-08). A width alone left it a flexible item, so a long name
             or a long sub line squeezed its own control by a pixel or two and
             the two halves came out visibly unequal. A fixed basis cannot. */
          .dhome.slate .dh-cell .dh-play{flex:0 0 104px;box-sizing:border-box;}
          /* Paused cards: the cap's shape, in the gold the slate has always used
             for a game you have started. Hairlines between them, since two gold
             cards side by side have no colour change to divide them. */
          .dhome.slate .dh-cell.prog{background:var(--gold);color:#2a1f04;text-decoration:none;border-bottom:1px solid rgba(20,22,28,.12);}
          .dhome.slate .dh-cell.prog.capL,.dhome.slate .dh-cell.failc.capL{border-right:1px solid rgba(20,22,28,.12);}
          .dhome.slate .dh-cell.prog:hover{background:#e0a92c;}
          .dhome.slate .dh-cell.prog::before{background:rgba(42,31,4,.55);}
          .dhome.slate .dh-cell.prog .dh-bue{color:#7a5a10;}
          .dhome.slate .dh-cell.prog .dh-bun{color:#2a1f04;}
          .dhome.slate .dh-cell.prog .dh-busub{color:#6b5210;}
          .dhome.slate .dh-cell.prog .dh-play{background:var(--white);color:#8a5306;}
          .dhome.slate .dh-cell.prog:hover .dh-play{background:var(--white);}
          .dhome.slate .dh-cell.failc.capw{grid-column:1/-1;}
          .dhome.slate .dh-cell.prog.capw{grid-column:1/-1;border-right:none;}
          /* Familiar favorite and New to you: the third and fourth tones of the
             cap's blue ramp (owner, 2026-08-09). Hairlines above them the way
             the gold cards carry them, since two blues of one family sitting in
             the same row need a divider where the first two tones, far enough
             apart to divide themselves, do not. */
          .dhome.slate .dh-cell.fav{background:#3b6fd4;text-decoration:none;border-top:1px solid rgba(255,255,255,.18);}
          .dhome.slate .dh-cell.fresh{background:#16306e;text-decoration:none;border-top:1px solid rgba(255,255,255,.18);}
          .dhome.slate .dh-cell.crowd{background:#245edf;text-decoration:none;border-top:1px solid rgba(255,255,255,.18);}
          /* The incomplete card carries the Incomplete today band's red, so the
             cap and the group below it read as the same thing said twice. */
          .dhome.slate .dh-cell.failc{background:#dc2626;text-decoration:none;border-top:1px solid rgba(255,255,255,.18);}
          .dhome.slate .dh-cell.failc:hover{background:#e33f3f;}
          .dhome.slate .dh-cell.failc .dh-play{color:#b91c1c;}
          .dhome.slate .dh-cell.failc.capw{grid-column:1/-1;}
          .dhome.slate .dh-cell.crowd:hover{background:#3170ec;}
          .dhome.slate .dh-cell.crowd.capw{grid-column:1/-1;}
          .dhome.slate .dh-cell.fav:hover{background:#4a7ce0;}
          .dhome.slate .dh-cell.fresh:hover{background:#1d3d85;}
          .dhome.slate .dh-cell.fav.capw,.dhome.slate .dh-cell.fresh.capw{grid-column:1/-1;}
          /* Open: a scroller that borrows Ready to play's space instead of
             pushing the console past the fold. The ceiling is --cap-pmax,
             measured in the fit effect; the vh fallback only ever applies for
             the frame before that runs. Gold thumb on a gold ground, kept thin,
             so the scroller reads as a hint that there is more rather than as a
             piece of furniture. */
          .dhome.slate .dh-cprog.open{display:grid;grid-column:1/-1;grid-template-columns:1fr 1fr;align-items:stretch;min-width:0;
            max-height:var(--cap-pmax,46vh);overflow-y:auto;overscroll-behavior:contain;
            scrollbar-width:thin;scrollbar-color:#bb9226 transparent;}
          .dhome.slate .dh-cprog.open::-webkit-scrollbar{width:9px;}
          .dhome.slate .dh-cprog.open::-webkit-scrollbar-track{background:transparent;}
          .dhome.slate .dh-cprog.open::-webkit-scrollbar-thumb{background:rgba(42,31,4,.3);border-radius:5px;border:2px solid transparent;background-clip:content-box;}
          .dhome.slate .dh-cprog.open::-webkit-scrollbar-thumb:hover{background:rgba(42,31,4,.45);background-clip:content-box;}
          /* The desktop cut: four cards, two rows of two. */
          .dh-cell.cap-hd{display:none;}
          /* With exactly four paused games desktop shows them all, so its bar
             has nothing to say; the phone, showing three, still needs one. */
          .dh-cmore.mo{display:none;}
        }
        /* The Incomplete card's dismiss X. BASE SCOPE, NEVER inside a width
           query (owner, 2026-08-09): these rules used to live in the
           @media(min-width:901px) block above, so below 901px the button got no
           styling at all and fell back to a raw native control, a grey #f0f0f0
           chip with a 2px outset border, black icon, sitting STATIC in the
           card's flex row beside Retry rather than in its corner, which also ate
           the sub line's width. The card's top-right corner is free at both
           widths, so one rule serves both and there is nothing width-specific
           left to say. */
        .dh-cx{position:absolute;top:4px;right:5px;z-index:2;width:21px;height:21px;padding:0;
          display:flex;align-items:center;justify-content:center;border:0;border-radius:6px;
          background:transparent;color:rgba(255,255,255,.72);cursor:pointer;font-family:inherit;
          -webkit-tap-highlight-color:transparent;transition:background .12s,color .12s;}
        /* HOVER STAYS BEHIND @media(hover:hover), the file's own rule: at base
           scope a tap would otherwise leave the lit state stuck on the button. */
        @media(hover:hover){
          .dh-cx:hover{background:rgba(255,255,255,.2);color:var(--white);}
        }
        .dh-cx:focus{outline:none;}
        .dh-cx:focus-visible{outline:2px solid var(--white);outline-offset:-2px;}
        /* 21px is fine under a cursor and small under a thumb, so on a touch
           pointer the HIT BOX grows to 34 while the DRAWING stays 21: an
           ::after overlay centred on the button, which cannot move the icon or
           the corner it sits in the way a width change would. */
        @media(pointer:coarse){
          .dh-cx::after{content:'';position:absolute;top:50%;left:50%;width:34px;height:34px;
            transform:translate(-50%,-50%);}
        }
        @media(max-width:900px){
          /* edge to edge. Negative margins, NOT the 50%/translateX trick: a
             transform makes the console a containing block and kills the sticky
             strip bar and column header inside it. */
          .dhome.slate{margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);width:auto;max-width:none;border-radius:0;box-shadow:none;}
          .dhome.slate .sl-bar{border-left:none;border-right:none;border-radius:0;border-top:none;margin-top:0;}
          .dhome.slate .dh-boardwrap{border-left:none;border-right:none;border-radius:0;}
          /* THE PHONE ORDER MATCHES THE DESKTOP ONE (owner, 2026-08-09): the
             slate's title band leads, the hero cards sit under the band that
             names them, then the category strip, then the board. The cap used to
             carry order:-1 and lead the whole page, which put four cards above
             any label saying what they were. Source order is already title, cap,
             strip, board, so DROPPING the order off the cap is the entire
             change; the board keeps order:1 so it always lands last whatever
             else is added above it. */
          .dhome.slate .dh-sbar{flex-direction:column;align-items:stretch;gap:0;padding:0;background:transparent;border:none;}
          .dhome.slate .sl-bar{order:0;}
          .dhome.slate .dh-boardwrap{order:1;}
          .dhome.slate .dh-cell > img{display:none !important;}
          .dhome.slate .dh-cell{position:relative;flex:none;width:100%;padding:13px 14px 13px 22px;border:none;border-radius:0;background:var(--blue);color:var(--white);}
          .dhome.slate .dh-cell + .dh-cell{padding-left:22px;border-left:none;}
          .dhome.slate .dh-cell.easy{background:#4d84f3;}
          /* a white rule replaces the game icon, which is unreadable at this
             size on a saturated ground */
          .dhome.slate .dh-cell::before{content:'';position:absolute;left:10px;top:12px;bottom:12px;width:4px;border-radius:2px;background:rgba(255,255,255,.9);}
          .dhome.slate .dh-bue{color:#dbe8ff;font-size:9.5px;letter-spacing:.11em;}
          .dhome.slate .dh-bun{color:var(--white);font-size:19px;line-height:1.3;padding-bottom:1px;}
          .dhome.slate .dh-busub{display:block;color:#dbe8ff;font-weight:600;line-height:1.35;padding-bottom:1px;}
          .dhome.slate .dh-cell .dh-play{margin-left:auto;background:var(--white);color:var(--blue-deep);width:98px;min-width:0;font-size:12px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:10px 0;border-radius:8px;flex:0 0 98px;box-sizing:border-box;}
          /* Paused cards, stacked with the other two and inked gold. */
          .dhome.slate .dh-cell.prog{background:var(--gold);color:#2a1f04;text-decoration:none;border-bottom:1px solid rgba(20,22,28,.12);}
          .dhome.slate .dh-cell.prog::before{background:rgba(42,31,4,.55);}
          .dhome.slate .dh-cell.prog .dh-bue{color:#7a5a10;}
          .dhome.slate .dh-cell.prog .dh-bun{color:#2a1f04;}
          .dhome.slate .dh-cell.prog .dh-busub{color:#6b5210;}
          .dhome.slate .dh-cell.prog .dh-play{background:var(--white);color:#8a5306;}
          /* The other two cap cards, stacked with the rest. Same two tones the
             desktop cap uses, so the ramp reads the same at both widths. */
          .dhome.slate .dh-cell.fav{background:#3b6fd4;text-decoration:none;}
          .dhome.slate .dh-cell.fresh{background:#16306e;text-decoration:none;}
          .dhome.slate .dh-cell.crowd{background:#245edf;text-decoration:none;}
          .dhome.slate .dh-cell.failc{background:#dc2626;text-decoration:none;}
          .dhome.slate .dh-cell.failc .dh-play{color:#b91c1c;}
          /* The phone cut. */
          .dh-cell.cap-hm{display:none;}
        }
        /* 43px, matched to the rails' panel headers so the Up next bar below
           starts on the same line as each rail's first band (owner,
           2026-08-08). 43 rather than 42 because a rail panel has a 1px border
           ABOVE its header and this bar does not, and border-box so this bar's
           own 1.5px top border is counted inside the number. Moving .hr-ph's
           min-height in HomeRails.jsx means moving this one too. */
        .sl-bar{display:flex;align-items:center;gap:9px;padding:9px 13px;min-height:43px;box-sizing:border-box;background:var(--accent);border:1.5px solid var(--accent);border-bottom:none;border-radius:13px 13px 0 0;}
        .dhome.slate .dh-sbar{border-radius:0;border-top:none;}
        .dhome.slate .dh-boardwrap{border-left:none;border-right:none;}
        .dhome.slate{border-radius:13px;box-shadow:0 1px 2px rgba(16,24,40,.06),0 8px 20px -12px rgba(16,24,40,.28);}
        .sl-ttl{font-size:11.5px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--white);}
        .sl-count{margin-left:auto;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--blue-200);white-space:nowrap;}
        .sl-dt{font-style:normal;}
        .sl-dt.p{display:none;}
        /* The category strip and the expand bars were var(--surface) between two
           1px --border rules, which is the page's own background between two
           hairlines: at the console's edge they dissolved into it (owner,
           2026-08-08). Each takes the deeper --surface-alt fill and a darker
           rule top AND bottom now, so it reads as a band across the console
           rather than a gap in it. */
        .sl-filt{flex:none;display:flex;background:var(--accent);border-top:1.5px solid #16306e;border-bottom:2px solid #16306e;overflow-x:auto;scrollbar-width:none;}
        .sl-filt::-webkit-scrollbar{display:none;}
        .sl-filt button{border:0;border-radius:0;background:transparent;font-family:inherit;font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#b9cbec;padding:9px 13px;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;white-space:nowrap;}
        .sl-filt button:hover{color:var(--white);}
        /* Still an UNDERLINE, not a pill: navy simply changed what colour the
           tab and its rule have to be. -2px above pulls the rule down onto the
           strip's own 2px bottom border so the two read as one edge. */
        .sl-filt button.on{color:var(--white);border-bottom-color:var(--white);background:transparent;}
        .sl-head,.sl-row{display:grid;grid-template-columns:44px minmax(0,1fr) 74px 72px 64px 132px 88px 112px;align-items:center;gap:10px;padding:6px 14px;}
        .sl-head{background:var(--surface);border-bottom:1px solid var(--border);box-shadow:0 1px 0 var(--border);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--slate);font-weight:800;position:sticky;top:0;z-index:3;}
        /* Pinnable board: one 26px star column at the far left, 36px including
           its gap, taken back out of Category (-4), Players (-4), Streak (-6),
           Leader (-14) and Archive (-8). The 1fr name column is deliberately
           untouched, so adding the star costs the row nothing. */
        .dh-board.pins .sl-head,.dh-board.pins .sl-row{grid-template-columns:26px 44px minmax(0,1fr) 70px 68px 58px 118px 88px 104px;}
        .sl-fav{display:flex;align-items:center;justify-content:center;}
        .sl-favb{width:24px;height:24px;padding:0;display:flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:#c3c8d1;cursor:pointer;font-family:inherit;-webkit-tap-highlight-color:transparent;transition:color .12s,background .12s,transform .12s;}
        /* HOVER STAYS BEHIND @media(hover:hover). A tap applies :hover on a
           phone and the browser keeps painting it until you tap elsewhere, so
           an unstar left the gold #fdf4dc block sitting behind the star (owner,
           2026-08-07). Same rule the retired tile star carried; any new
           row-level control needs it too. */
        @media(hover:hover){
          .sl-favb:hover{color:var(--gold-ink);background:#fdf4dc;transform:scale(1.12);}
          .sl-favb:disabled:hover{color:#c3c8d1;background:transparent;transform:none;}
        }
        .sl-favb.on{color:var(--gold-ink);}
        .sl-favb:disabled{cursor:default;opacity:.3;}
        .sl-favb:focus-visible{outline:2px solid var(--blue);outline-offset:1px;}
        .sl-head .r,.sl-row .r{text-align:right;}
        .sl-head .c{display:flex;align-items:center;justify-content:center;text-align:center;}
        .sl-sort{display:inline-flex;align-items:center;gap:4px;border:0;border-radius:0;background:transparent;padding:0;font:inherit;color:inherit;letter-spacing:inherit;text-transform:inherit;cursor:pointer;white-space:nowrap;}
        .sl-sort svg{opacity:0;transition:opacity .12s;flex:none;}
        .sl-sort:hover{color:var(--accent);}
        .sl-sort:hover svg{opacity:.45;}
        .sl-sort.on{color:var(--blue-deep);}
        .sl-sort.on svg{opacity:1;}
        .sl-row{border-bottom:1px solid #f0f2f6;font-size:13px;}
        .sl-row:hover{background:var(--surface);}
        .sl-row.done{background:#f6fbf8;}
        /* Incomplete today: the red twin of the green finished row, and the same
           faint wash rather than a fill, so a screen of them still reads as a
           list. The Play chip is the one thing that separates it from a
           complete row at a glance, which is the point of the group. */
        .sl-row.fail{background:#fef4f3;}
        /* The Sundays tab's own row: a plain white row like Ready to play's,
           since nothing about today applies to it. */
        .sl-row.sun{background:var(--white);text-decoration:none;color:var(--ink);}
        .sl-row.sun:hover{background:var(--surface);}
        /* The line under the strip that says what the tab is showing. Full
           width in both grids, and quiet: it explains, it does not announce. */
        .sl-note{grid-column:1/-1;padding:10px 14px;font-size:12px;line-height:1.5;
          color:var(--muted);background:var(--surface);border-bottom:1px solid var(--border);}
        .sl-note.dim{color:var(--slate);background:var(--white);}
        .sl-row.inprog{background:#fffaeb;}
        .sl-row.open{background:var(--accent-soft);}
        /* An OPEN row keeps its STATE colour (owner, 2026-08-07). .open sits
           last in this list, so opening a paused or finished row repainted it
           blue and threw away the amber or green that says what the row IS.
           Open now DEEPENS the state tint instead of replacing it, and the left
           rule was already immune. Applies at every width: the same swap was
           happening on the desktop slate. */
        .sl-row.inprog.open{background:#fdf3d6;}
        .sl-row.done.open{background:#e6f6ee;}
        .sl-row.fail.open{background:#fde9e7;}
        .sl-ic{display:flex;align-items:center;justify-content:center;height:34px;background:var(--surface-alt);border-radius:8px;}
        .sl-ic img{height:24px;width:auto;max-width:30px;object-fit:contain;}
        .sl-nm{min-width:0;text-decoration:none;color:var(--ink);display:block;}
        .sl-nm b{display:block;font-size:15px;font-weight:800;letter-spacing:-.3px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .sl-nm .sl-sub{display:block;font-size:11.5px;color:var(--slate);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .sl-cm{display:none;}
        /* The tagline's wrapper. Desktop renders it as the plain inline text it
           has always been; only the phone makes it a shrinking flex item. */
        .sl-tg{font-style:normal;}
        /* Phone-only play count, inside the name line. Currently unused: the
           count went back to the .sl-pl figure at the row's right edge on
           2026-08-07. Kept because it has been swapped once already. */
        .sl-npl{display:none;font-style:normal;}
        /* Separator between the tagline and the leader chip; phone only. */
        .sl-dot{display:none;font-style:normal;}
        .sl-mld{display:none;font-style:normal;}
        .sl-cat{display:flex;justify-content:center;}
        .sl-cat > span{display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:3px 6px;border-radius:5px;max-width:100%;overflow:hidden;white-space:nowrap;}
        .sl-pl{font-size:12.5px;font-weight:700;font-variant-numeric:tabular-nums;text-align:center;color:var(--muted);}
        /* The Players cell now wraps its number in <b> and carries an <i> label
           for the phone figure. Both are neutralised here so the DESKTOP column
           renders the same bare centred number it always did. */
        .sl-pl b{font-weight:inherit;font-size:inherit;}
        .sl-pl i{display:none;}
        /* Group bands and their expand bars. Phone-only furniture: both are in
           the DOM at every width and only the <=900px block gives them a box,
           an order, and (for .sl-hid) any effect at all. */
        .sl-band{display:none;}
        /* A band that is also its group's toggle. It keeps every band rule (the
           selector is the same class); this only undoes the UA button styling
           and adds the chevron. */
        /* border-radius:0 is NOT redundant: globals.css rounds every button to
           8px, so the Done today band shipped with rounded corners in a stack
           of square ones (owner, 2026-08-08). Any future full-width band or
           bar built out of a <button> needs the same reset. */
        button.sl-band{width:100%;border:0;border-radius:0;font:inherit;text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent;}
        button.sl-band:hover{filter:brightness(1.14);}
        .sl-bch{flex:none;color:var(--white);opacity:.8;margin-left:1px;}
        .sl-more{display:none;}
        .sl-more:focus,button.sl-band:focus{outline:none;}
        .sl-more:focus-visible,button.sl-band:focus-visible{outline:2px solid var(--blue);outline-offset:-2px;}
        .sl-st{font-size:12px;font-weight:800;font-variant-numeric:tabular-nums;color:#a16207;display:flex;align-items:center;justify-content:center;gap:2px;}
        .sl-st.none{color:#c3c8d1;}
        .sl-ld{display:flex;align-items:center;justify-content:center;gap:4px;font-size:11.5px;color:var(--muted);min-width:0;}
        .sl-ld svg{flex:none;color:var(--gold-ink);}
        .sl-ld span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .sl-nl{color:#8a93a3;}
        .sl-status{display:flex;justify-content:center;}
        .sl-btn{display:inline-flex;align-items:center;justify-content:center;width:70px;padding:6px 0;border-radius:7px;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;border:1px solid var(--accent-border);background:var(--accent-soft);color:var(--blue-deep);cursor:pointer;font-family:inherit;}
        .sl-btn.play:hover{background:var(--blue);border-color:var(--blue);color:var(--white);}
        .sl-btn.done{border-color:#cfeadd;background:#f1faf5;color:var(--success-deep);cursor:default;}
        .sl-btn.fail{border-color:#f6c9c4;background:#fdeceb;color:#b91c1c;}
        .sl-btn.fail:hover{background:#dc2626;border-color:#dc2626;color:var(--white);}
        .sl-btn.prog{border-color:#f0d79a;background:#fdf2df;color:#a16207;}
        .sl-arch{display:flex;justify-content:center;}
        .sl-rz{display:none;font-style:normal;}
        .sl-ab{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--accent-border);background:var(--white);color:var(--blue-deep);border-radius:7px;padding:5px 9px;font-family:inherit;font-size:10.5px;font-weight:800;letter-spacing:.04em;cursor:pointer;white-space:nowrap;}
        .sl-ab:hover{background:var(--accent-soft);}
        .sl-ab.on{background:var(--blue);border-color:var(--blue);color:var(--white);}
        .sl-ab svg{flex:none;transition:transform .15s;}
        .sl-ab.on svg{transform:rotate(180deg);}
        .sl-ring{width:19px;height:19px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;}
        .sl-ring i{width:13px;height:13px;border-radius:50%;background:var(--white);display:block;}
        .sl-ab.on .sl-ring i{background:var(--blue);}
        .sl-drawer{border-bottom:1px solid var(--border);background:#fbfcfe;}
        /* ── desktop slate: the phone's grouping and its three-track row, in
           TWO columns (owner, 2026-08-08) ─────────────────────────────────
           The console keeps the height cap and the inner scroller it already
           had; two columns of a shorter row simply mean it holds roughly twice
           as many games before you reach for the scrollbar, so the panel is
           full rather than a tall thin ribbon.
           Nothing here is a second implementation of the row: the bands, the
           category eyebrow, the leader on the sub line and the stacked crowd
           figure are the same elements the phone renders, restated for this
           width. The two media queries are mutually exclusive, so the phone
           block below is untouched and neither can leak into the other.
           What leaves the row: the star, the Category, Streak, Leader and
           Archive columns, and the column header (and with it desktop column
           sorting, which the filter strip and the grouping now cover). Each was
           saying something the band above the group, the eyebrow beside the
           name or the sub line says already. Play fades in over the crowd
           figure on hover, so a mouse still starts a game in one click without
           forty blue buttons sitting on the page; where there is no hover,
           Play leads the drawer exactly as it does on a phone. */
        @media(min-width:901px){
          .dh-board.slate{display:grid;grid-template-columns:1fr 1fr;align-content:start;gap:0;
            background:linear-gradient(to right,transparent calc(50% - .5px),#eef0f4 calc(50% - .5px),#eef0f4 calc(50% + .5px),transparent calc(50% + .5px));}
          .dh-board.slate .sl-head{display:none;}
          /* Bands and the open drawer are the only full-width items. A band is
             sticky inside the scroll port, so the group you are reading always
             names itself. */
          .sl-band{display:flex;align-items:center;gap:9px;padding:8px 14px;background:#2c4fa8;grid-column:1/-1;position:sticky;top:0;z-index:3;order:4;}
          .sl-band .sl-bt{font-size:10.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--white);}
          .sl-band .sl-bc{margin-left:auto;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--blue-200);font-variant-numeric:tabular-nums;}
          /* In progress: the gold the slate has always used for a game you have
             started, and dark ink on it, since white on gold does not read. */
          .sl-band.prog{order:6;background:var(--gold);}
          .sl-band.prog .sl-bt{color:#2a1f04;}
          .sl-band.prog .sl-bc{color:#7a5a10;}
          .sl-band.prog .sl-bch{color:#2a1f04;opacity:.75;}
          .sl-band.fail{order:8;background:#dc2626;}
          .sl-band.fail .sl-bc{color:#ffe0dd;}
          .sl-band.dn{order:11;background:var(--success-deep);}
          .sl-drawer{grid-column:1/-1;}
          /* Same order scheme the phone uses, since grid honours it too: a row
             and its own drawer carry the same value and equal-order items keep
             source order, so a drawer never leaves its row. */
          .sl-row,.sl-drawer{order:5;}
          /* Paused rows sink to the FOOT of Ready to play (owner, 2026-08-08),
             above the group's bar and below every untouched row. */
          .sl-row.inprog,.sl-drawer.inprog{order:7;}
          .sl-row.fail,.sl-drawer.fail{order:9;}
          .sl-more.fail{order:10;}
          .sl-row.done,.sl-drawer.done{order:12;}
          /* THREE tracks: emblem, name, crowd size. Pins add no track, the same
             call the phone made: the star left the row and the pin control is
             the chip at the top of the drawer. */
          .dh-board.slate .sl-row,.dh-board.pins .sl-row{grid-template-columns:30px minmax(0,1fr) auto;gap:11px;padding:7px 14px;position:relative;cursor:pointer;box-shadow:inset 4px 0 0 var(--rc,#475b78);}
          .sl-fav,.sl-cat,.sl-st,.sl-ld,.sl-arch,.sl-npl{display:none;}
          .sl-row.inprog{box-shadow:inset 4px 0 0 var(--gold);}
          .sl-row.done{box-shadow:inset 4px 0 0 #16a34a;}
          .sl-row.fail{box-shadow:inset 4px 0 0 #dc2626;}
          .sl-ic{order:1;height:30px;background:transparent;border-radius:0;}
          .sl-ic img{height:26px;max-width:30px;}
          .sl-nm{order:2;display:flex;flex-direction:row;flex-wrap:wrap;align-items:baseline;column-gap:7px;}
          .sl-nm b{order:1;min-width:0;display:block;font-size:15px;line-height:1.2;}
          .sl-cm{order:2;flex:none;display:block;font-size:8.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;line-height:1.2;margin:0;}
          .sl-nm .sl-sub{order:3;flex:1 1 100%;min-width:0;display:flex;align-items:baseline;font-size:11px;line-height:1.35;margin-top:1px;}
          .sl-tg{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}
          .sl-dot{display:inline;flex:none;margin:0 5px;color:#c3c8d1;}
          .sl-mld{flex:none;display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:700;color:var(--muted);max-width:10vw;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}
          .sl-mld svg{flex:none;color:var(--gold-ink);}
          .sl-pl{order:3;display:block;text-align:right;line-height:1;min-width:38px;}
          .sl-pl b{display:block;font-size:13px;font-weight:800;color:var(--ink);}
          .sl-pl i{display:block;font-style:normal;font-size:8px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--slate);margin-top:3px;}
          /* A finished row has a score to report, so its chip is permanent and
             takes the figure's place rather than waiting for a hover. */
          /* An invisible button still takes clicks, so Play is inert until it
             is actually showing. */
          .sl-status{position:absolute;right:13px;top:50%;transform:translateY(-50%);z-index:2;opacity:0;pointer-events:none;}
          .sl-row.done .sl-status{opacity:1;pointer-events:auto;}
          /* DONE TODAY IS SHUT AT THIS WIDTH TOO (owner, 2026-08-08). Its band
             is the toggle, so the rows it hides have to actually hide here as
             well; until now sl-hid only meant anything below 900px and the
             desktop band's chevron did nothing. Scoped to done, because the
             same class also marks the Ready-to-play rows outside the PHONE's
             six-row budget, and desktop deliberately lists every one of those.
             Three classes, because the base sl-row display:grid rule sits later
             in this stylesheet and would otherwise win. */
          .dh-board.slate .sl-row.done.sl-hid,.dh-board.slate .sl-drawer.done.sl-hid{display:none;}
          /* Each width prints its own count on the CAP's expand bar (the board's
             own bar is phone-only now, so this pair serves the cap alone). */
          .sl-mtxt.p{display:none;}
          /* A PAUSED GAME IS A FAINTLY SHADED ROW (owner, 2026-08-08). It spent
             one deploy as a cap-shaped gold card at the top of the slate, which
             is the shape the CAP already uses for the same games directly above
             the board: the same card twice on one screen, and a row that shouted
             where the group it sits in is a quiet list. It keeps the ordinary
             row's shape and columns now, and says what it is with the base
             amber ground and the gold left rule instead. Its Resume chip is the
             one control that does NOT wait for a hover, since resuming is the
             reason you scrolled to it. */
          .sl-row.inprog .sl-status,.sl-row.fail .sl-status,.sl-row.sun .sl-status{opacity:1;pointer-events:auto;}
          .sl-row.inprog .sl-pl,.sl-row.done .sl-pl,.sl-row.fail .sl-pl{visibility:hidden;}
          /* The chip reads RESUME here rather than a bare triangle, so it sits
             in the same 64px shape as the Play chip on every row above it. */
          .sl-row.inprog .sl-rz{display:inline;}
          .sl-row.inprog .sl-btn.prog svg{display:none;}
          .sl-btn{width:64px;}
        }
        @media(min-width:901px) and (hover:hover){
          .sl-row:not(.done):hover .sl-status{opacity:1;pointer-events:auto;}
          .sl-row:not(.done):hover .sl-pl{opacity:0;pointer-events:none;}
        }
        /* ── phone slate: direction B (owner-approved 2026-08-07) ──────────
           Replaces the 2026-08-03 phone row (icon plate, category beside the
           name, play count in the subtitle, status button on the right edge).
           Everything below the two blue cap bars is rebuilt out of the four
           moves those bars already make: a solid ground, a 4px left rule where
           the icon used to be, a small uppercase eyebrow over a big name, and
           one control on the right edge. Rows group under solid state bands.
           NOTHING in here escapes the media query: the desktop slate keeps its
           icon plate, its eight sortable columns and its centred cells. */
        @media(max-width:900px){
          /* flex, so the bands and rows can be ordered into their groups.
             gap:0 IS LOAD-BEARING: the tile board sets gap:7px on .dh-board in
             the 640px block, and as a flex container the slate inherited it as a
             7px white band between every row (owner, 2026-08-07). The slate's
             rows separate with their own 1px bottom border and nothing else. */
          .dh-board.slate{height:auto;max-height:none;min-height:0;overflow:visible;display:flex;flex-direction:column;gap:0;}
          .sl-head{display:none;}
          /* Ordered slots, one group per band: Ready to play is 4 (band), 5
             (untouched rows), 6 (paused rows) and 7 (its expand bar); Done
             today is 8 (band) and 9 (rows), shut from its own band. A drawer
             shares its row's value, and equal-order items keep source order, so
             a drawer stays under its own row. */
          .sl-band{display:flex;align-items:center;gap:9px;padding:9px 13px;background:#2c4fa8;order:4;}
          .sl-band .sl-bt{font-size:10.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--white);}
          .sl-band .sl-bc{margin-left:auto;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--blue-200);font-variant-numeric:tabular-nums;}
          /* In progress: the gold the slate has always used for a game you have
             started, and dark ink on it, since white on gold does not read. */
          .sl-band.prog{order:6;background:var(--gold);}
          .sl-band.prog .sl-bt{color:#2a1f04;}
          .sl-band.prog .sl-bc{color:#7a5a10;}
          .sl-band.prog .sl-bch{color:#2a1f04;opacity:.75;}
          .sl-band.fail{order:8;background:#dc2626;}
          .sl-band.fail .sl-bc{color:#ffe0dd;}
          .sl-band.dn{order:11;background:var(--success-deep);}
          .sl-row,.sl-drawer{order:5;}
          .sl-row.inprog,.sl-drawer.inprog{order:7;}
          .sl-row.fail,.sl-drawer.fail{order:9;}
          .sl-row.done,.sl-drawer.done{order:12;}
          /* The rows a group is not peeking. Nothing else may set display on a
             .sl-row inside the slate without excluding this class, or the row
             comes back: see the :not(.sl-hid) on the .mcut rule in the 640px
             block, which is more specific AND later in source. */
          .sl-hid{display:none;}
          /* The expand bar: one full-width rectangle at the foot of its group,
             inked to its group's colour so the pair reads as one block. */
          .sl-more{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;
            padding:5px 13px;border:0;border-radius:0;border-top:2px solid #c2ccdc;border-bottom:2px solid #c2ccdc;background:#e8edf5;
            font-family:inherit;font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;
            line-height:1.5;color:var(--blue-deep);cursor:pointer;}
          .sl-more:active{background:#dde5f0;}
          /* READY TO PLAY'S BAR SITS AT THE FOOT OF THE WHOLE BOARD (owner,
             2026-08-09), below Complete today rather than between the groups.
             It was breaking the run of coloured bands in half: three bands that
             belong together, with a grey strip driven through the middle of
             them. At 13 it lands after every band and row (todo 4-6, incomplete
             8-10, complete 11-12), so the board ends on it and the rails start
             directly under. Incomplete's own bar keeps its place inside its
             group, since it is tinted to that group and reads as part of it. */
          .sl-more.todo{order:13;}
          /* The phone bar, tinted to its own band rather than the shared grey. */
          .sl-more.fail{order:10;border-top-color:#f3c2bd;border-bottom-color:#f3c2bd;background:#fdeceb;color:#b91c1c;}
          .sl-more.fail:active{background:#fbdedb;}
          .sl-mtxt.d{display:none;}
          /* THREE tracks: name, count, icon (owner, 2026-08-07, against a
             reference image). The row used to carry a star, a tile plate, the
             name, a Play button and a chevron, five things competing with the
             one that matters, on a 390px line. Everything that was a control
             has left: the WHOLE ROW expands the drawer, Play now lives at the
             top of that drawer with the other chips, and the pin lives there
             too. What is left is the name with room to breathe, the crowd size,
             and the game's own emblem on the right edge where the button was.
             a11y: with the chevron gone the row's focusable child is the name
             link, and activating it expands rather than navigating (the row's
             onClick preventDefaults). */
          .sl-row{grid-template-columns:minmax(0,1fr) auto 40px;gap:11px;padding:9px 13px 9px 16px;cursor:pointer;box-shadow:inset 4px 0 0 var(--rc,#475b78);}
          .sl-row.inprog{box-shadow:inset 4px 0 0 var(--gold);}
          .sl-row.done{box-shadow:inset 4px 0 0 #16a34a;}
          .sl-row.fail{box-shadow:inset 4px 0 0 #dc2626;}
          /* Pins no longer add a track: the star is one of the things that left
             the row, and the pin control is the full-width chip at the top of
             the drawer. Same grid either way. */
          .dh-board.pins .sl-row{grid-template-columns:minmax(0,1fr) auto 40px;gap:11px;padding:9px 13px 9px 16px;}
          .sl-fav,.sl-cat,.sl-st,.sl-ld,.sl-status,.sl-arch,.sl-npl{display:none;}
          /* Grid honours the order property, so the icon moves to the far right
             without the JSX changing: name, count, icon. */
          .sl-nm{order:1;}
          .sl-pl{order:2;}
          .sl-ic{order:3;}
          /* No plate on the icon here. At the right edge a filled, rounded box
             reads as the button that used to be there; bare art reads as the
             game's emblem. */
          .sl-ic{height:40px;background:transparent;border-radius:0;}
          .sl-ic img{height:34px;max-width:40px;}
          /* The crowd size goes BACK to a stacked right-edge figure. It rode
             inside the name line while the row still had a button and a chevron
             to make room for; with both gone the figure is the clearer read and
             the name keeps its own line. */
          .sl-pl{display:block;text-align:right;line-height:1;}
          .sl-pl b{display:block;font-size:13px;font-weight:800;color:var(--ink);}
          .sl-pl i{display:block;font-style:normal;font-size:8.5px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--slate);margin-top:3px;}
          .sl-dot{display:inline;flex:none;margin:0 5px;color:#c3c8d1;}
          /* No archive chevron on a phone any more: the whole row opens the
             drawer, so a control that does the same thing is just clutter. The
             .sl-ab rules stay for the desktop button's benefit only. */
          /* TITLE FIRST, category small to its right (owner, 2026-08-07). The
             category had a line of its own above the name; on its own line a
             three-word tagline underneath, it was a third line of type competing
             with the title for the row. Beside the title it is a footnote, the
             title gets 18px, and the row comes out SHORTER than the stacked
             version despite the bigger name.
             Row flex + wrap rather than a JSX change: the DOM order is category,
             name, sub, so the order property puts the name first and a 100% basis on the
             sub line breaks it onto its own line. Baselines align, so the tiny
             caps sit on the title's baseline. */
          .sl-nm{display:flex;flex-direction:row;flex-wrap:wrap;align-items:baseline;column-gap:7px;}
          .sl-nm b{order:1;min-width:0;display:block;font-size:18px;line-height:1.2;}
          .sl-cm{order:2;flex:none;display:block;font-size:8.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;line-height:1.2;margin:0;}
          /* The sub line is a flex row: the tagline shrinks and ellipsizes, the
             leader chip is flex:none, so the leader is never the thing that gets
             cut off. It still caps at 38vw and ellipsizes its own long names. */
          .sl-nm .sl-sub{order:3;flex:1 1 100%;min-width:0;display:flex;align-items:baseline;font-size:11.5px;line-height:1.4;margin-top:1px;}
          .sl-tg{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}
          .sl-mld{flex:none;display:inline-flex;align-items:center;gap:3px;font-size:11.5px;font-weight:700;color:var(--muted);max-width:42vw;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}
          .sl-mld svg{flex:none;color:var(--gold-ink);}
          .sl-btn{width:64px;}
          /* The category selector is a DARK strip of pills on a phone (owner,
             2026-08-07), so it belongs to the navy slate header above it rather
             than reading as a pale gap between the header and the first row.
             Desktop keeps its light underline tabs. */
          .sl-dt.d{display:none;}
          .sl-dt.p{display:inline;}
          .sl-filt{background:#2c4fa8;border-top:none;border-bottom:none;gap:6px;padding:7px 8px;}
          .sl-filt button{flex:none;background:rgba(255,255,255,.12);color:#c3d5f4;border-radius:999px;padding:6px 12px;font-size:10.5px;letter-spacing:.09em;border-bottom:0;margin-bottom:0;}
          .sl-filt button.on{border-bottom-color:transparent;}
          .sl-filt button:hover{color:var(--white);}
          .sl-filt button.on{background:var(--white);color:var(--blue-deep);border-bottom-color:transparent;}
        }
        /* ── TABLET AND LANDSCAPE PHONE: THE PHONE SLATE, TWO ACROSS ──────────
           (owner, 2026-08-08.) From 641px there is room for two of everything,
           and one game per full-width row left 300px of empty middle on an iPad
           mini in portrait (744) or an iPhone in landscape (844).
           The ROW ITSELF is untouched: same three tracks, same 18px name, same
           whole-row-opens-the-drawer model, because this tier is a touch device
           either way and the desktop row's hover-to-reveal Play would be
           unreachable. Only the CONTAINERS become two-column grids. The bands,
           the expand bars and an open drawer still span both columns, and the
           phone's ordered slots keep working because grid honours the order
           property exactly as flex does.
           Below 641 nothing changes: there the second column would be 170px. */
        @media(min-width:641px) and (max-width:900px){
          /* The cap: Up next | Easiest leaderboard, then the paused cards two to
             a row. The two blue cards carry different tones so they need no
             divider; two gold cards side by side do. Odd children are always
             column one here, which is the same trick the desktop cap uses. */
          .dhome.slate .dh-sbar{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);}
          .dhome.slate .dh-cell{width:auto;}
          .dhome.slate .dh-cell.prog.capL,.dhome.slate .dh-cell.failc.capL{border-right:1px solid rgba(20,22,28,.12);}
          .dhome.slate .dh-cell.failc.capw{grid-column:1/-1;}
          .dhome.slate .dh-cell.prog.capw{grid-column:1/-1;}
          .dhome.slate .dh-cell.fav.capw,.dhome.slate .dh-cell.fresh.capw{grid-column:1/-1;}
          /* The board. The centre hairline is the same painted gradient the
             desktop slate uses, so a column with fewer rows than its neighbour
             still shows the split all the way down. */
          .dh-board.slate{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-content:start;
            background:linear-gradient(to right,transparent calc(50% - .5px),#eef0f4 calc(50% - .5px),#eef0f4 calc(50% + .5px),transparent calc(50% + .5px));}
          .sl-band,.sl-more,.sl-drawer{grid-column:1/-1;}
          /* 42vw of leader chip is most of a 364px track, and the tagline is the
             item that should be shrinking, not the thing after it. */
          .sl-mld{max-width:19vw;}
        }
        /* -- the STACKED tier, 901-1200px: the desktop slate, with the phone's
           peek (owner, 2026-08-08) --------------------------------------------
           NO BACKTICKS IN HERE. This whole stylesheet is one template literal,
           so a backtick around a class name CLOSES it: the comment naming
           '.qzh .dhx' below shipped a pair of them, and the parser read the rest
           as a member access on the string, which prerendered as "Cannot read
           properties of undefined (reading 'dhx')" and failed the build. Quote a
           selector with apostrophes, never backticks.
           The width band where '.qzh .dhx' has already dropped to two equal
           columns and put '.dhx-center' first, so the console is full width with
           the rails BELOW it. 46 rows of slate there is a screen and a half
           between the reader and the leaderboard.
           This keeps everything the min-width:901px block just built (the
           two-column grid, the three-track row, the bands, the whole-row drawer)
           and adds only the lid. Four rules, and nothing here is a second
           implementation of anything.
           This block must stay AFTER the 901px block and after the base .sl-more
           rule: it wins on source order, not specificity. */
        @media(min-width:901px) and (max-width:1200px){
          /* Height first. The desktop board is a fixed scroll port sized to the
             fold (--dh-fit); with only six rows peeking, that port would be
             mostly white. It scrolls with the page here, exactly as it does on a
             phone, and the fit effect leaves --dh-fit unset to match. */
          .dh-board.slate{height:auto;max-height:none;min-height:0;overflow:visible;}
          /* ...which also means there is no scroll port for a band to stick
             inside, and a sticky band would pin itself to the VIEWPORT and ride
             over the page. The band goes back to sitting on its group. */
          .sl-band{position:static;}
          /* The lid itself. Desktop scopes this to .done, because it lists every
             unfinished row; here every hidden row hides, paused ones included.
             Three classes because the base .sl-row display rule sits later in
             this stylesheet, the same reason the desktop rule carries them. */
          .dh-board.slate .sl-row.sl-hid,.dh-board.slate .sl-drawer.sl-hid{display:none;}
          /* ...and the way back out, which is dead (display:none) at every other
             width above 900px. Same bar the phone renders, spanning both
             columns, at the foot of Ready to play. */
          .sl-more{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;grid-column:1/-1;
            padding:5px 13px;border:0;border-radius:0;border-top:2px solid #c2ccdc;border-bottom:2px solid #c2ccdc;background:#e8edf5;
            font-family:inherit;font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;
            line-height:1.5;color:var(--blue-deep);cursor:pointer;}
          .sl-more:active{background:#dde5f0;}
          /* READY TO PLAY'S BAR SITS AT THE FOOT OF THE WHOLE BOARD (owner,
             2026-08-09), below Complete today rather than between the groups.
             It was breaking the run of coloured bands in half: three bands that
             belong together, with a grey strip driven through the middle of
             them. At 13 it lands after every band and row (todo 4-6, incomplete
             8-10, complete 11-12), so the board ends on it and the rails start
             directly under. Incomplete's own bar keeps its place inside its
             group, since it is tinted to that group and reads as part of it. */
          .sl-more.todo{order:13;}
          /* The phone bar, tinted to its own band rather than the shared grey. */
          .sl-more.fail{order:10;border-top-color:#f3c2bd;border-bottom-color:#f3c2bd;background:#fdeceb;color:#b91c1c;}
          .sl-more.fail:active{background:#fbdedb;}
          /* ...and no bounded paused block either, for the same reason: with the
             board flowing there is no fixed console height for it to fit inside,
             so the cards stack out in full exactly as they do on a phone. */
          .dhome.slate .dh-cprog.open{display:contents;}
        }
        @media(max-width:1080px){.dh-board{grid-template-columns:repeat(5,minmax(0,1fr));}}
        @media(max-width:940px){.dh-cell + .dh-cell{padding-left:10px;}}
        @media(max-width:860px){.dh-board{grid-template-columns:repeat(4,minmax(0,1fr));}.dh-boardwrap.open{min-height:560px;}}
        @media(max-width:640px){
          .dh-board{grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;grid-auto-rows:minmax(122px,1fr);}
          /* Phones KEEP the game art (owner, 2026-07-30), reversing the 07-29
             decision to drop it: the tile is 26px taller instead, which is room
             for a smaller icon between the category chip and the day's leader. */
          .dh-tile{padding:9px 5px 8px;border-radius:10px;min-height:122px;}
          .dh-tic{display:flex;width:38px;height:26px;margin:4px 0 5px;}
          .dh-tic img{height:22px;max-width:26px;}
          .dh-tnm{font-size:14.5px;}
          .dh-tcat{font-size:8.5px;padding:1px 7px;margin-top:4px;}
          .dh-tmeta{gap:3px;}
          .dh-msc,.dh-mstrk,.dh-mlead{font-size:10px;}
          .dh-tcorner{top:6px;left:5px;gap:3px;}
          .dh-tplays{font-size:9px;}
          /* Eight tiles, then the toggle: exactly two rows at four across. The
             430px block below bumps it to nine, because eight across three
             columns leaves the bottom-right cell empty (owner, 2026-07-31). */
          .dh-board.mcut > .dh-tile:nth-child(n+9){display:none;}
          .dh-mall{display:flex;}
          /* the slate lists every game already, so it needs neither the row cut
             nor the show-all control */
          .dhome.slate .dh-mall{display:none;}
          /* :not(.sl-hid) is load-bearing. This rule undoes the tile board's
             eight-tile cut for slate rows, and it outranks .sl-hid on both
             specificity and source order, so without the guard every collapsed
             row reappears below 640px. */
          .dh-board.slate.mcut > .sl-row:not(.sl-hid){display:grid;}
        }
        @media(max-width:430px){
          .dh-board{grid-template-columns:repeat(3,minmax(0,1fr));}
          .dh-tnm{font-size:13px;}
          .dh-tcat{font-size:8px;}
          /* Three across, so the cut is NINE: three full rows with no hole in
             the corner. Same specificity as the rule above, later in source, so
             it simply re-shows the ninth tile. */
          .dh-board.mcut > .dh-tile:nth-child(9){display:flex;}
        }
        @media(max-width:720px){.dh-boardwrap.open{min-height:620px;}}
        /* Small screens: the expanded panel is IN FLOW (see DailyTilePanel), so
           the grid hides beneath it and the wrapper takes the panel's own
           height. No min-height floor, no overlay, no nested scroller: the page
           scrolls normally wherever you drag. */
        @media(max-width:980px){
          .dh-boardwrap.open{min-height:0;}
          .dhome.open:not(.slate) .dh-sbar{display:none;}
          .dhome.open:not(.slate) .dh-boardwrap{display:none;}
        }
        /* Phone cap (owner 2026-08-03). Both halves survive here, unlike the old
           bar where the Easiest CTA was hidden below 640px to make room for the
           stat row: with the stats gone there is room for two. Each half keeps
           50%, sheds its game icon and subtitle, and runs a compact Play button.
           .dh-sbar takes the grid's 10px side padding so the right button's edge
           lands exactly on the tile grid's. */
        @media(max-width:640px){
          .dh-sbar{padding-left:10px;padding-right:10px;gap:6px;}
          .dh-cell{gap:7px;}
          .dh-cell + .dh-cell{padding-left:8px;}
          .dh-cell>img{display:none;}
          .dh-busub{display:none;}
          /* Halving the bar leaves the right eyebrow ~63px (the Resume button
             takes 81 of the half's 160), where "EASIEST LEADERBOARD" clipped to
             "EASIEST LEAD...". Type size was not the binding constraint, so the
             LABEL shortens here instead: see .dh-bshort in the markup. */
          .dh-bue{font-size:7.5px;letter-spacing:.02em;}
          .dh-bwide{display:none;}
          .dh-bshort{display:inline;}
          .dh-bun{font-size:14px;}
          .dh-cell .dh-play{margin-left:auto;flex:0 0 auto;min-width:0;font-size:11.5px;padding:8px 10px;gap:4px;}
        }
        /* Under 375px the eyebrows clip first, so ease them down rather than let
           a game name wrap. */
        @media(max-width:374px){
          .dh-bue{font-size:7px;}
          .dh-bun{font-size:13px;}
          .dh-cell .dh-play{padding:8px 8px;font-size:11px;}
        }
        /* LANDSCAPE ON A TABLET (owner, 2026-08-08). The console's own furniture
           tightens so the eight lines the board now keeps (see LAND_LINES) land
           ABOVE the fold rather than an inch below it: on a 1024x768 iPad the
           title band, the two cap cards, the paused bar and the category strip
           spent 287px between the header and the first row, which is more than
           five of the lines they sit above. Nothing is hidden and nothing moves,
           each box is simply less padded and the cap's game names come down from
           20px to 17. LAST IN THIS SHEET on purpose: several of these selectors
           tie with the min-width:901px block above on specificity, so source
           order is what decides them.
           min-width:901px, because below it the cap is a stack of full-width
           bars and the board flows with the page: a landscape phone gets the
           header's own landscape treatment (QuizCommandHeader) and nothing
           here. pointer:coarse, never a height alone, so a short desktop window
           is untouched. */
        @media(min-width:901px) and (orientation:landscape) and (pointer:coarse) and (max-height:1100px){
          .dhome.slate .sl-bar{min-height:34px;padding:6px 13px;}
          .dhome.slate .dh-cell{padding:9px 14px 9px 24px;}
          .dhome.slate .dh-cell::before{top:9px;bottom:9px;}
          .dhome.slate .dh-bun{font-size:17px;}
          .dhome.slate .dh-cell .dh-play{padding:8px 0;}
          .dhome.slate .sl-filt button{padding:7px 13px;}
          .dhome.slate .dh-cmore{padding:4px 13px;}
        }
      ` }} />

      {/* The cap. Welded directly onto the grid below (rounded top corners only,
          no margin), split into two equal halves: Up next on the left, Easiest
          leaderboard on the right. The Your-day stats that used to live here
          moved into the page header on 2026-08-03. */}
      {slate ? (
        <div className="sl-bar">
          <span className="sl-ttl">Today&rsquo;s slate</span>
          <span className="sl-count">{games.length} games{etLabel.long ? <> &middot; <i className="sl-dt d">{etLabel.long}</i><i className="sl-dt p">{etLabel.short}</i></> : null}</span>
        </div>
      ) : null}
      <div className="dh-sbar">
        <div className="dh-cell up">
          {nextGame ? (
            <>
              {capIcon ? <img src={blueTile(nextGame.img)} alt="" aria-hidden="true" onError={tileFallback} /> : null}
              <div className="dh-bupt">
                <div className="dh-bue up">Up next</div>
                <div className="dh-bun">{nextGame.name}</div>
                <div className="dh-busub">{nextGame.tag}{playsNote(nextPlays)}</div>
              </div>
              <a href={nextGame.href} className="dh-play">
                <Play size={11} fill="currentColor" strokeWidth={0} />Play
              </a>
            </>
          ) : (
            <>
              <Trophy size={22} color={T.gold} strokeWidth={2.2} />
              <div className="dh-bupt">
                <div className="dh-bue">Clean sweep</div>
                <div className="dh-bun">All {GAMES.length} done</div>
                <div className="dh-busub">A fresh slate lands at midnight</div>
              </div>
            </>
          )}
        </div>
        <div className="dh-cell easy">
          {easiest ? (
            <>
              {capIcon ? <img src={blueTile(easiest.game.img)} alt="" aria-hidden="true" onError={tileFallback} /> : null}
              <div className="dh-bupt">
                <div className="dh-bue"><span className="dh-bwide">Easiest leaderboard</span><span className="dh-bshort">Easiest board</span></div>
                <div className="dh-bun">{easiest.game.name}</div>
                {/* The game's own description leads, the same as Up next, and
                    the field size follows it (owner, 2026-08-03). The count on
                    its own said nothing about what the game IS. This half counts
                    the leaderboard field, NOT plays: see playsNote/fieldNote. */}
                <div className="dh-busub">{easiest.game.tag}{fieldNote(easiest.players)}</div>
              </div>
              <a href={easiest.game.href} className="dh-play">
                <Play size={11} fill="currentColor" strokeWidth={0} />Play
              </a>
            </>
          ) : (
            <>
              <Trophy size={22} color={T.gold} strokeWidth={2.2} />
              <div className="dh-bupt">
                <div className="dh-bue">{nextGame ? 'Almost there' : 'Clean sweep'}</div>
                <div className="dh-bun">{nextGame ? 'One to go' : `All ${GAMES.length} done`}</div>
                <div className="dh-busub">{nextGame ? 'Finish the slate to sweep the day' : 'Every daily played today'}</div>
              </div>
            </>
          )}
        </div>
        {/* Familiar favorite, and New to you beside it when nothing is paused.
            Between them they hold the cap at four cards in every state, which is
            what retired the full-width lone paused card: with an even grid no
            card is ever left standing on its own row. Two more tones of the same
            blue ramp, and the WHOLE card is the link (the button is a span
            inside it, never a second anchor), exactly as the paused cards are. */}
        {capLeadShown.map((c, i) => (
          <a
            key={c.game.key}
            href={c.game.href}
            aria-label={`Play ${c.game.name}`}
            className={'dh-cell ' + c.kind + (i === capLeadWideAt ? ' capw' : '')}
          >
            <div className="dh-bupt">
              <div className="dh-bue">{CAP_LEAD_LABEL[c.kind]}</div>
              <div className="dh-bun">{c.game.name}</div>
              <div className="dh-busub">{c.game.tag}{leadNote(c)}</div>
            </div>
            <span className="dh-play">
              <Play size={11} fill="currentColor" strokeWidth={0} />Play
            </span>
          </a>
        ))}
        {/* The state cards: paused in gold, incomplete in red, in one block so
            one budget and one expander cover both. Each is a single link with
            the button as a span inside it, never a second anchor, because the
            one thing you want from a game you have already opened is to get
            back into it. The paused card says Resume because its board is still
            live; the incomplete one says Play because there is nothing to
            resume, only a puzzle this game never showed you the answer to. */}
        {capState.length ? (
          <div className={'dh-cprog' + (capOpen ? ' open' : '')}>
            {capStateShown.map((c, i) => {
              const paused = c.kind === 'prog';
              return (
                <a
                  key={c.game.key}
                  href={c.game.href}
                  aria-label={`${paused ? 'Resume' : 'Retry'} ${c.game.name}`}
                  className={'dh-cell ' + (paused ? 'prog' : 'failc')
                    + (capCol1(i) ? ' capL' : '')
                    + (i === capWideAt ? ' capw' : '')}
                >
                  <div className="dh-bupt">
                    <div className="dh-bue">{paused ? 'In progress' : 'Incomplete'}</div>
                    <div className="dh-bun">{c.game.name}</div>
                    <div className="dh-busub">
                      {c.game.tag}
                      {paused ? playsNote(playsOf(c.game.key)) : ' \u00b7 the answer is still yours to find'}
                    </div>
                  </div>
                  <span className="dh-play">
                    {/* RETRY, not Play: the run is over and the score is
                        banked, so this is another go at a puzzle you have not
                        seen the answer to, which is a different offer from
                        starting a game you have not touched. */}
                    <Play size={11} fill="currentColor" strokeWidth={0} />{paused ? 'Resume' : 'Retry'}
                  </span>
                  {/* The card is one big link, so the dismiss has to swallow the
                      click itself; without preventDefault it would open the game
                      on its way out. Offered on the red card only: a paused game
                      is a standing invitation with a live board behind it, where
                      an incomplete one is just a puzzle you may be done with. */}
                  {!paused ? (
                    <button
                      type="button"
                      className="dh-cx"
                      aria-label={`Dismiss ${c.game.name} for today`}
                      title="Dismiss for today. It stays in Incomplete today below."
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); dismissFail(c.game.key); }}
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  ) : null}
                </a>
              );
            })}
          </div>
        ) : null}
        {/* One bar for the whole cap, spanning both columns at the foot of the
            cards. One count now, not one per width: the cut is the same two at
            every width, so there is nothing left for the two labels to say
            differently. */}
        {capState.length > CAP_STATE_MAX ? (
          <button
            type="button"
            className="dh-cmore"
            onClick={() => setCapOpen((v) => !v)}
            aria-expanded={capOpen}
          >
            {capOpen
              ? <>Show fewer <ChevronUp size={12} strokeWidth={2.8} /></>
              : <>
                  {/* The bar NAMES what is still hidden rather than counting it
                      (owner, 2026-08-09): "1 more" told you nothing about what
                      kind of thing was under the lid. Each figure carries its
                      own card's colour, gold for paused and red for incomplete,
                      so the count and the word it belongs to read as one piece
                      and the word "Show" stays out of the way in ink. A kind
                      with nothing hidden is not named at all. */}
                  Show{' '}
                  {capHidden.prog ? (
                    <b className="dh-cmp">{capHidden.prog} in progress</b>
                  ) : null}
                  {capHidden.prog && capHidden.fail ? <span className="dh-cmd"> &middot; </span> : null}
                  {capHidden.fail ? (
                    <b className="dh-cmf">{capHidden.fail} incomplete</b>
                  ) : null}
                  <ChevronDown size={12} strokeWidth={2.8} />
                </>}
          </button>
        ) : null}
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
              <a href="/quizzes/hub?tab=daily" className="dsd-gt" style={{ marginTop: 11, color: '#8a5300' }}>Full standings &amp; game boards →</a>
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
                    <Crown size={i === 0 ? 13 : 11} style={{ color: i === 0 ? T.gold : '#8d7c52', flex: 'none' }} />
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
      {/* The category strip is a SIBLING of the board wrap, never a child of it
          (owner, 2026-08-09). Inside it, the wrap's 1.5px side borders inset the
          strip, so this navy band came out 3px narrower than the navy title band
          directly above it and a grey hairline ran down each side. Up here both
          navy bands span the console on the same pixel. It keeps no `order`, so
          the phone's order flip (bar -1, title 0, board 1) still lands it between
          the title band and the board on source order alone. */}
      {slate ? (
        <div className="sl-filt" role="tablist" aria-label="Filter the slate">
          {[['all', 'All'], ['todo', 'Unplayed']]
            .concat(slateCats.map((c) => [c, CAT_SHORT[c] || c]))
            // LAST in the strip, and absent on a Sunday: on the day itself the
            // Sunday Editions ARE the board, so a tab pointing at last week's
            // would only be competing with them.
            .concat(sunToday ? [] : [['sunday', 'Sundays']])
            .map(([k, label]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={filter === k}
              className={filter === k ? 'on' : undefined}
              onClick={() => setFilter(k)}
            >{label}</button>
          ))}
        </div>
      ) : null}
      <div className={'dh-boardwrap' + (selGame ? ' open' : '') + (slate ? ' slate' : '')}>
        <div className="dh-vpwrap">
        <div
          ref={vpRef}
          className={'dh-vp' + (!slate && metrics && metrics.maxOffset > 0 ? ' on' : '')}
          style={!slate && metrics && metrics.maxOffset > 0
            ? { height: metrics.windowH }
            : undefined}
          onScroll={(e) => { e.currentTarget.scrollTop = 0; }}
        >
          <div
            ref={boardRef}
            className={'dh-board' + (showAll ? '' : ' mcut') + (slate ? ' slate' : '') + (slate && myGamesOn ? ' pins' : '')}
            role="navigation"
            aria-label="Daily puzzles"
            aria-hidden={selGame && !slate ? 'true' : undefined}
            style={!slate && metrics && metrics.maxOffset > 0
              ? { transform: `translateY(-${shift * metrics.rowStep}px)` }
              : undefined}
          >
            {slate ? (
              <div className="sl-head" role="row">
                {myGamesOn ? <span /> : null}
                <span />
                {[['game', 'Game', ''], ['cat', 'Category', 'c'], ['players', 'Players', 'c'],
                  ['streak', 'Streak', 'c'], ['leader', 'Leader', 'c'], ['status', 'Status', 'c'],
                  ['archive', 'Archive & stats', 'c']].map(([key, label, cls]) => {
                  const on = sort && sort.key === key;
                  return (
                    <span key={key} className={cls || undefined}>
                      <button
                        type="button"
                        className={`sl-sort${on ? ' on' : ''}`}
                        onClick={() => toggleSort(key)}
                        aria-label={`Sort by ${label}`}
                        aria-sort={on ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        {label}
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" aria-hidden="true">
                          {on && sort.dir === 'asc' ? <path d="m6 15 6-6 6 6" /> : <path d="m6 9 6 6 6-6" />}
                        </svg>
                      </button>
                    </span>
                  );
                })}
              </div>
            ) : null}
            {slate ? renderSlate(slateList, false) : renderTiles(list, false)}
          </div>
        </div>
        {/* Row-window pager (the round chevron under the board). It belongs to
            the TILE board only: the viewport height and the translateY shift
            above are both gated on !slate, so on the slate it rendered a button
            that moved nothing (owner, 2026-08-07). Gated to match, rather than
            deleted, so it comes back on its own if the tile board ever returns.
            All wiring stays: rowOffset/metrics state, the measure effect, and
            the .dh-more CSS. */}
        {!slate && metrics && metrics.maxOffset > 0 && !selGame ? (
          <button
            type="button"
            className="dh-more"
            onClick={() => setRowOffset(shift < metrics.maxOffset ? shift + 1 : 0)}
            aria-label={shift < metrics.maxOffset ? 'Show more daily puzzles' : 'Back to the top of the daily puzzles'}
            title={shift < metrics.maxOffset ? 'More puzzles' : 'Back to the top'}
          >
            {shift < metrics.maxOffset
              ? <ChevronDown size={19} strokeWidth={2.8} />
              : <ChevronUp size={19} strokeWidth={2.8} />}
          </button>
        ) : null}
        </div>
        {/* Phone board cut (owner, 2026-07-31): eight tiles, then this toggle.
            The cut is CSS-only -- .mcut hides :nth-child(n+9) under 640px -- so
            the server renders the collapsed board and a phone never flashes all
            thirty-seven tiles before the JS makes up its mind. Above 640px the
            class does nothing and the button is display:none, so the desktop
            row window is untouched. */}
        <button
          type="button"
          className="dh-mall"
          onClick={() => setShowAll((v) => !v)}
          aria-expanded={showAll}
        >
          {showAll
            ? <>Show fewer <ChevronUp size={15} strokeWidth={2.8} /></>
            : <>Show all {list.length} games <ChevronDown size={15} strokeWidth={2.8} /></>}
        </button>
      </div>
      {/* The panel is a child of .dhome, not of the board, so it covers the
          stats bar as well as the grid: one expanded console, one Play button
          (owner, 2026-07-29). */}
      {selGame && !slate ? renderPanel(selGame) : null}
    </div>
  );
}



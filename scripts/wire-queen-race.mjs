#!/usr/bin/env node
// wire-queen-race — apply the Queen + Race registry edits to a FRESH copy of
// origin/main.
//
//   node scripts/wire-queen-race.mjs <dir-of-origin-checkout>
//
// Adding a daily game means new files under app/queen/ and app/race/ PLUS
// edits to about twenty registries, HALF of which fail SILENTLY when missed
// (scripts/wire-niche.mjs is the worked example this follows). Two properties,
// both enforced:
//   1. EVERY anchor must be found EXACTLY ONCE, or the script throws.
//   2. It runs against files read out of a same-step git export, never the
//      working tree (CLAUDE.md, the stale-base rule).
// Idempotent: a file that already names the new keys at an anchor is skipped.
//
// CIRCUITS (owner ruling, 2026-08-21, this launch): Shoe had already taken
// Table Games to five, so the owner split Chess & Board instead of forcing a
// bad fit. A NEW all-chess circuit (Defend, Mate, Queen) is created, and
// chess-board keeps its id but becomes Board Games (Check, Turn, Race). Two
// three-game circuits, sanctioned explicitly. trophy-defs gains the matching
// Grandmaster row; verify-circuits gains estimated medians for both games.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/wire-queen-race.mjs <dir>'); process.exit(2); }

const EDITS = [
  // 1. The registry rows, LAST after Shoe: the registry is in launch order.
  ['lib/daily-games.js',
    `colorNavy: '#7cc4ec' },
];`,
    `colorNavy: '#7cc4ec' },
  { key: 'queen', keepsAnswer: true, miss: 'Tries', name: 'Queen', cat: 'End Game', tag: 'White to play and promote', how: 'A king and pawn endgame you are already winning. One first move keeps the win, and then every move of the walk has to be exact against a perfect defence.', color: '#a16207', colorNavy: '#f2c14e' },
  { key: 'race', keepsAnswer: true, miss: 'Tries', name: 'Race', cat: 'End Game', tag: 'First pawn through wins', how: 'Pawns run one square at a time and capture on the diagonal, and the first one to the far rank ends it. You are winning, there are no draws, and exactly one move keeps it that way.', color: '#1d4ed8', colorNavy: '#93c5fd' },
];`],

  // 2. Sunday Editions: Queen's Sunday is the win-in-12 walk, Race's the
  //    win-in-5 race.
  ['lib/sunday-editions.js',
    `  'barter', 'plot', 'sixes', 'niche', 'shoe',`,
    `  'barter', 'plot', 'sixes', 'niche', 'shoe', 'queen', 'race',`],
  ['lib/sunday-editions.js',
    `//   shoe    seven hands of blackjack instead of five, dealt off the ENTIRE`,
    `//   queen   a win in twelve, the longest walk against the weekday five to
//           nine (from launch, 2026-08-21)
//   race    a win in five, the longest race against the weekday three and
//           four (from launch, 2026-08-21)
//   shoe    seven hands of blackjack instead of five, dealt off the ENTIRE`],

  // 3. The Loft format flag.
  ['lib/loft.js',
    `  'pricer', 'quilt', 'redact', 'rung', 'sando', 'shards',`,
    `  'pricer', 'queen', 'quilt', 'race', 'redact', 'rung', 'sando', 'shards',`],

  // 4. lib/daily-slate.js — daily-combined and daily-me read GAME_PUZZLES here.
  ['lib/daily-slate.js',
    `import { PUZZLES as P_shoe } from '@/app/shoe/puzzles';`,
    `import { PUZZLES as P_shoe } from '@/app/shoe/puzzles';
import { PUZZLES as P_queen } from '@/app/queen/puzzles';
import { PUZZLES as P_race } from '@/app/race/puzzles';`],
  ['lib/daily-slate.js',
    `  barter: P_barter, plot: P_plot, sixes: P_sixes, niche: P_niche, shoe: P_shoe,`,
    `  barter: P_barter, plot: P_plot, sixes: P_sixes, niche: P_niche, shoe: P_shoe, queen: P_queen, race: P_race,`],

  // 5. The end card: icon import, accent + finish icon, defeat wording, tile
  //    copy, and the launch pin.
  ['app/DailyEndCard.jsx',
    `  ArrowLeftRight,
} from 'lucide-react';`,
    `  ArrowLeftRight, Gem,
} from 'lucide-react';`],
  ['app/DailyEndCard.jsx',
    `  shoe:  { accent: '#0c4a6e', badgeBg: '#0c4a6e', badgeInk: T.white, Fin: Layers },`,
    `  shoe:  { accent: '#0c4a6e', badgeBg: '#0c4a6e', badgeInk: T.white, Fin: Layers },
  queen: { accent: '#a16207', badgeBg: '#a16207', badgeInk: T.white, Fin: Gem },
  race:  { accent: '#1d4ed8', badgeBg: '#1d4ed8', badgeInk: T.white, Fin: FlagTriangleRight },`],
  ['app/DailyEndCard.jsx',
    `const DEFEAT_GAMES = new Set(['four', 'mate', 'check', 'taire', 'chain', 'turn', 'defend']);`,
    `const DEFEAT_GAMES = new Set(['four', 'mate', 'check', 'taire', 'chain', 'turn', 'defend', 'queen', 'race']);`],
  ['app/DailyEndCard.jsx',
    `  { key: 'shoe',  cat: 'cards',     name: 'Shoe',  tag: 'The daily blackjack shoe', blurb: 'Five hands of blackjack off one fixed shoe, the same cards for everybody. Par is the book line, and the count is how you beat it.', href: '/shoe' },`,
    `  { key: 'shoe',  cat: 'cards',     name: 'Shoe',  tag: 'The daily blackjack shoe', blurb: 'Five hands of blackjack off one fixed shoe, the same cards for everybody. Par is the book line, and the count is how you beat it.', href: '/shoe' },
  { key: 'queen', cat: 'endgame',   name: 'Queen', tag: 'White to play and promote',   blurb: 'King and pawn against king, with a proven win. Walk the pawn to the eighth rank against a perfect defence, with every move exact.', href: '/queen' },
  { key: 'race',  cat: 'endgame',   name: 'Race',  tag: 'First pawn through wins',     blurb: 'A pawn race with no draws. One square at a time, captures on the diagonal, and exactly one first move keeps you in front.', href: '/race' },`],
  ['app/DailyEndCard.jsx',
    `const LAUNCH_PIN = { keys: ['shoe', 'niche', 'sixes',`,
    `const LAUNCH_PIN = { keys: ['queen', 'race', 'shoe', 'niche', 'sixes',`],

  // 6. The daily-order route mirrors that launch pin.
  ['app/api/quiz/daily-order/route.js',
    `const LAUNCH_PIN = { keys: ['shoe', 'niche', 'sixes',`,
    `const LAUNCH_PIN = { keys: ['queen', 'race', 'shoe', 'niche', 'sixes',`],

  // 7. The promo strip.
  ['app/DailyGamesPromo.jsx',
    `  { key: 'shoe', href: '/shoe', name: 'Shoe', tag: 'the daily blackjack shoe', store: 'sot_shoe_day', accent: '#0c4a6e', bg: '#e8f3fa', border: 'rgba(12,74,110,0.4)' },`,
    `  { key: 'shoe', href: '/shoe', name: 'Shoe', tag: 'the daily blackjack shoe', store: 'sot_shoe_day', accent: '#0c4a6e', bg: '#e8f3fa', border: 'rgba(12,74,110,0.4)' },
  { key: 'queen', href: '/queen', name: 'Queen', tag: 'white to play and promote', store: 'sot_queen_day', accent: '#a16207', bg: '#faf3e3', border: 'rgba(161,98,7,0.4)' },
  { key: 'race', href: '/race', name: 'Race', tag: 'first pawn through wins', store: 'sot_race_day', accent: '#1d4ed8', bg: '#e8effc', border: 'rgba(29,78,216,0.4)' },`],

  // 8. DailyGamesGrid — BOTH lists (a key in one and not the other drops
  //    silently).
  ['app/DailyGamesGrid.jsx',
    `  { key: 'shoe', href: '/shoe', name: 'Shoe', tag: 'The daily blackjack shoe', img: '/games/btn-shoe.png' },`,
    `  { key: 'shoe', href: '/shoe', name: 'Shoe', tag: 'The daily blackjack shoe', img: '/games/btn-shoe.png' },
  { key: 'queen', href: '/queen', name: 'Queen', tag: 'White to play and promote', img: '/games/btn-queen.png' },
  { key: 'race', href: '/race', name: 'Race', tag: 'First pawn through wins', img: '/games/btn-race.png' },`],
  ['app/DailyGamesGrid.jsx',
    `  { key: 'endgame', label: 'End Game', keys: ['mate', 'defend', 'four', 'check', 'chain', 'turn'] },`,
    `  { key: 'endgame', label: 'End Game', keys: ['mate', 'defend', 'queen', 'four', 'check', 'chain', 'turn', 'race'] },`],

  // 9. The slate row on every daily page.
  ['app/DailyStrip.jsx',
    `  { key: 'shoe', href: '/shoe', name: 'Shoe', img: '/games/btn-shoe.png', store: 'sot_shoe_day', tag: "The daily blackjack shoe" , cat: 'Cards' },`,
    `  { key: 'shoe', href: '/shoe', name: 'Shoe', img: '/games/btn-shoe.png', store: 'sot_shoe_day', tag: "The daily blackjack shoe" , cat: 'Cards' },
  { key: 'queen', href: '/queen', name: 'Queen', img: '/games/btn-queen.png', store: 'sot_queen_day', tag: "White to play and promote" , cat: 'End Game' },
  { key: 'race', href: '/race', name: 'Race', img: '/games/btn-race.png', store: 'sot_race_day', tag: "First pawn through wins" , cat: 'End Game' },`],

  // 10. The A-Z slate rail (missed by both Suffice and Docket; the rail's
  //     count is the fastest tell).
  ['app/DailySlateRail.jsx',
    `  'deep', 'anon', 'blocks', 'chomp', 'sweep', 'docket', 'blitz', 'defend', 'barter', 'plot', 'sixes', 'niche', 'shoe',`,
    `  'deep', 'anon', 'blocks', 'chomp', 'sweep', 'docket', 'blitz', 'defend', 'barter', 'plot', 'sixes', 'niche', 'shoe', 'queen', 'race',`],

  // 11. The /daily archive needs BOTH the import AND the stripped map.
  ['app/daily/page.js',
    `import { PUZZLES as SHOE_FULL } from '../shoe/puzzles';`,
    `import { PUZZLES as SHOE_FULL } from '../shoe/puzzles';
import { PUZZLES as QUEEN_FULL } from '../queen/puzzles';
import { PUZZLES as RACE_FULL } from '../race/puzzles';`],
  ['app/daily/page.js',
    `const SHOE = SHOE_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`,
    `const SHOE = SHOE_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));
const QUEEN = QUEEN_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));
const RACE = RACE_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`],
  ['app/daily/page.js',
    `  { key: 'shoe', name: 'Shoe', path: '/shoe', tag: 'The daily blackjack shoe', accent: '#0c4a6e', bg: '#e8f3fa', border: 'rgba(12,74,110,0.4)', src: SHOE },`,
    `  { key: 'queen', name: 'Queen', path: '/queen', tag: 'White to play and promote', accent: '#a16207', bg: '#faf3e3', border: 'rgba(161,98,7,0.4)', src: QUEEN },
  { key: 'race', name: 'Race', path: '/race', tag: 'First pawn through wins', accent: '#1d4ed8', bg: '#e8effc', border: 'rgba(29,78,216,0.4)', src: RACE },
  { key: 'shoe', name: 'Shoe', path: '/shoe', tag: 'The daily blackjack shoe', accent: '#0c4a6e', bg: '#e8f3fa', border: 'rgba(12,74,110,0.4)', src: SHOE },`],

  // 12. The archive client: category membership and the navy accents.
  ['app/daily/DailyArchiveClient.jsx',
    `  { key: 'endgame', label: 'End Game', keys: ['mate', 'defend', 'four', 'check', 'chain', 'turn'] },`,
    `  { key: 'endgame', label: 'End Game', keys: ['mate', 'defend', 'queen', 'four', 'check', 'chain', 'turn', 'race'] },`],
  ['app/daily/DailyArchiveClient.jsx',
    `  barter: '#fb7fa2', plot: '#e0a86a', sixes: '#7da2f5', niche: '#3ecfbd', shoe: '#7cc4ec',`,
    `  barter: '#fb7fa2', plot: '#e0a86a', sixes: '#7da2f5', niche: '#3ecfbd', shoe: '#7cc4ec', queen: '#f2c14e', race: '#93c5fd',`],

  // 13. Sitemap.
  ['lib/sitemap-entries.js',
    `  'docket', 'plot', 'barter', 'sixes', 'niche', 'shoe', 'defend', 'blitz', 'strata', 'blocks', 'chomp',`,
    `  'docket', 'plot', 'barter', 'sixes', 'niche', 'shoe', 'queen', 'race', 'defend', 'blitz', 'strata', 'blocks', 'chomp',`],

  // 14. The two routes that still own their own puzzle maps.
  ['app/api/quiz/daily-unplayed/route.js',
    `import { PUZZLES as P_shoe } from '@/app/shoe/puzzles';`,
    `import { PUZZLES as P_shoe } from '@/app/shoe/puzzles';
import { PUZZLES as P_queen } from '@/app/queen/puzzles';
import { PUZZLES as P_race } from '@/app/race/puzzles';`],
  ['app/api/quiz/daily-unplayed/route.js',
    `barter: P_barter, plot: P_plot, sixes: P_sixes, niche: P_niche, shoe: P_shoe };`,
    `barter: P_barter, plot: P_plot, sixes: P_sixes, niche: P_niche, shoe: P_shoe, queen: P_queen, race: P_race };`],
  ['app/api/quiz/daily-game/route.js',
    `import { PUZZLES as P_shoe } from '@/app/shoe/puzzles';`,
    `import { PUZZLES as P_shoe } from '@/app/shoe/puzzles';
import { PUZZLES as P_queen } from '@/app/queen/puzzles';
import { PUZZLES as P_race } from '@/app/race/puzzles';`],
  ['app/api/quiz/daily-game/route.js',
    `defend: P_defend, barter: P_barter, plot: P_plot, sixes: P_sixes, niche: P_niche, shoe: P_shoe,`,
    `defend: P_defend, barter: P_barter, plot: P_plot, sixes: P_sixes, niche: P_niche, shoe: P_shoe, queen: P_queen, race: P_race,`],

  // 14b. The Sunday slate route owns a THIRD copy of the puzzle map, and both
  //      games run real Sunday Editions.
  ['app/api/quiz/sunday-slate/route.js',
    `import { PUZZLES as P_shoe } from '@/app/shoe/puzzles';`,
    `import { PUZZLES as P_shoe } from '@/app/shoe/puzzles';
import { PUZZLES as P_queen } from '@/app/queen/puzzles';
import { PUZZLES as P_race } from '@/app/race/puzzles';`],
  ['app/api/quiz/sunday-slate/route.js',
    `barter: P_barter, plot: P_plot, sixes: P_sixes, niche: P_niche, shoe: P_shoe };`,
    `barter: P_barter, plot: P_plot, sixes: P_sixes, niche: P_niche, shoe: P_shoe, queen: P_queen, race: P_race };`],

  // 15. The two hardcoded quiz-id alternations.
  ['app/api/quiz/daily-status/route.js',
    `|barter|plot|sixes|niche|shoe)-\\d+-\\d+-\\d+$/;`,
    `|barter|plot|sixes|niche|shoe|queen|race)-\\d+-\\d+-\\d+$/;`],
  ['app/quizzes/QuizHomeClient.jsx',
    `|barter|plot|sixes|niche|shoe)-/;`,
    `|barter|plot|sixes|niche|shoe|queen|race)-/;`],

  // 16. The Sunday Editions table in CLAUDE.md.
  ['CLAUDE.md',
    `\n**Every daily on the roster runs a Sunday Edition.**`,
    `| Queen | a win in twelve, the longest walk against the weekday five to nine (from launch, 2026-08-21) |\n| Race | a win in five, the longest race against the weekday three and four (from launch, 2026-08-21) |\n\n**Every daily on the roster runs a Sunday Edition.**`],

  // 17. quiz-catalog's roster set (a no-op for a standalone daily, kept in
  //     step so the registry sweep stays clean).
  ['lib/quiz-catalog.js',
    `'barter', 'plot', 'sixes', 'niche', 'shoe']);`,
    `'barter', 'plot', 'sixes', 'niche', 'shoe', 'queen', 'race']);`],

  // 18. CIRCUITS — the chess split (owner ruling, 2026-08-21). Chess & Board
  //     becomes Board Games (Check, Turn, Race) and a NEW all-chess circuit
  //     (Defend, Mate, Queen) sits beside it. Same id, same trophy for the
  //     renamed one: the id is the URL and the trophy key.
  ['lib/circuits.js',
    `  {
    id: 'chess-board',
    name: 'Chess & Board',
    blurb: 'Won positions on a board, and one move that throws each of them away.',
    share: {
      invite: "Four positions already won, and one move that throws each of them away. The shortest circuit on the site, and the least forgiving.",
      result: "Four won positions, four chances to lose them.",
    },
    keys: ['check', 'turn', 'defend', 'mate'],                   // 21/23/28/41 = 113
    trophy: { name: 'Endgame Sweep', tier: 'bronze', icon: 'Swords' },
  },`,
    `  {
    id: 'chess-board',
    name: 'Board Games',
    blurb: 'Won positions on a board, and one move that throws each of them away.',
    share: {
      invite: "Three positions already won, and one move that throws each of them away. The shortest circuit on the site, and the least forgiving.",
      result: "Three won positions, three chances to lose them.",
    },
    // Renamed from Chess & Board on 2026-08-21, when the chess games moved out
    // into the all-chess circuit below (owner ruling) and Race arrived. The id
    // stays chess-board on purpose: it is the URL and the trophy key, and the
    // circuit boards already played hang off it.
    keys: ['check', 'turn', 'race'],                             // 21/23/~45 est = 89
    trophy: { name: 'Endgame Sweep', tier: 'bronze', icon: 'Swords' },
  },
  {
    id: 'chess',
    name: 'Chess',
    blurb: 'The chess table: save the king, mate the king, queen the pawn.',
    share: {
      invite: "Three games at the chess table: save the king, mate the king, and walk a pawn to its crown. Perfect play punishes everything else.",
      result: "Three games at the chess table.",
    },
    // The chess-only circuit (owner ruling, 2026-08-21). Three games sits
    // under the usual floor, and is sanctioned: chess is its own discipline,
    // and filing Queen in a circuit it does not belong to was the worse lie.
    keys: ['defend', 'mate', 'queen'],                           // 28/41/~75 est = 144
    trophy: { name: 'Grandmaster', tier: 'bronze', icon: 'Crown' },
  },`],
  ['lib/circuits.js',
    `// circuit, which is what makes "finish all fourteen" mean "play everything" and
// what stops a game paying into two skill boards at once. The count comes out
// at 65 games over 14 circuits, NINE OF FIVE AND FIVE OF FOUR (Niche made
// Recall the eighth five on 2026-08-20, Shoe made Table Games the ninth on
// 2026-08-21) — and the no-tiny-circuits floor is worth insisting on, because
// a circuit's whole score is 15 points per game and a three-game circuit would
// top out at 45 against everybody else's 75.
// Against the 67 in the registry:`,
    `// circuit, which is what makes "finish all fifteen" mean "play everything" and
// what stops a game paying into two skill boards at once. The count comes out
// at 67 games over 15 circuits, NINE OF FIVE, FOUR OF FOUR AND TWO OF THREE
// (Niche made Recall the eighth five on 2026-08-20, Shoe made Table Games the
// ninth on 2026-08-21, and the chess split of 2026-08-21 left Board Games and
// Chess a pair of threes). The no-tiny-circuits floor still holds in general,
// a circuit's whole score being 15 points per game, so a three tops out at 45
// against a five's 75; the owner sanctioned exactly these two threes on
// 2026-08-21, because chess is its own discipline and filing Queen or Race
// somewhere they do not belong was the worse lie.
// Against the 69 in the registry:`],
  ['lib/circuits.js',
    `// CIRCUITS — one family, fifteen members (owner, 2026-08-18).`,
    `// CIRCUITS — one family, sixteen members (owner, 2026-08-18; the chess split
// of 2026-08-21 added the sixteenth).`],
  ['lib/circuits.js',
    `// The other fourteen are SKILL circuits.`,
    `// The other fifteen are SKILL circuits.`],
  ['lib/circuits.js',
    `// the console band now has a way to reach the other fourteen.`,
    `// the console band now has a way to reach the other fifteen.`],
  ['lib/circuits.js',
    `//   fourteen cost no maintenance.`,
    `//   fifteen cost no maintenance.`],
  ['lib/circuits.js',
    `// These fourteen REPLACE the fourteen ad-hoc groups that used to live inline in`,
    `// These fifteen REPLACE the fourteen ad-hoc groups that used to live inline in`],
  ['lib/circuits.js',
    `// you can run are the same fourteen. Renamed on the way: Anagrams became`,
    `// you can run are the same fifteen. Renamed on the way: Anagrams became`],
  ['lib/circuits.js',
    `// Where a finished run LANDS. One page for all fifteen (owner, 2026-08-18):`,
    `// Where a finished run LANDS. One page for all sixteen (owner, 2026-08-18):`],
  ['lib/circuits.js',
    `// minutes of top-10 clock, silver to 20, gold beyond. Chess & Board is four
// games totalling under two minutes and Crosswords is five totalling`,
    `// minutes of top-10 clock, silver to 20, gold beyond. Board Games is three
// games totalling under two minutes and Crosswords is five totalling`],

  // 19. The trophy case rows (verify-circuits demands the 1:1 match).
  ['lib/trophy-defs.js',
    `  { id: 'circuit-chess-board', name: 'Endgame Sweep', desc: 'Finish every game in the Chess & Board circuit on the same day.', tier: 'bronze', group: 'circuits', icon: 'Swords' },`,
    `  { id: 'circuit-chess-board', name: 'Endgame Sweep', desc: 'Finish every game in the Board Games circuit on the same day.', tier: 'bronze', group: 'circuits', icon: 'Swords' },
  { id: 'circuit-chess', name: 'Grandmaster', desc: 'Finish every game in the Chess circuit on the same day.', tier: 'bronze', group: 'circuits', icon: 'Crown' },`],

  // 20. verify-circuits carries the median snapshot; the new games get
  //     estimated entries or their circuits' ascent goes unchecked.
  ['scripts/verify-circuits.mjs',
    `  shoe: 100,
};`,
    `  shoe: 100,
  // Queen and Race launched 2026-08-21 with no live clock data yet: estimated
  // from their shapes (Queen walks a 5-12 move line with replies between, so
  // past Mate; Race is a 3-5 move sprint, so past Four). Replace with measured
  // medians at the next snapshot re-measure.
  queen: 75, race: 45,
};`],
];

let changed = 0; let already = 0;
const touched = new Set();
for (const [file, anchor, replacement] of EDITS) {
  const path = join(dir, file);
  if (!existsSync(path)) throw new Error(`${file}: not in the checkout — did the fetch land?`);
  const src = readFileSync(path, 'utf8');
  if (src.includes(replacement)) { already++; continue; }
  const n = src.split(anchor).length - 1;
  if (n !== 1) throw new Error(`${file}: anchor found ${n} times, expected exactly 1 — the file moved under us:\n    ${anchor.slice(0, 120)}`);
  writeFileSync(path, src.replace(anchor, replacement));
  touched.add(file);
  changed++;
}

// og-brand-card: append renderQueenCard + renderRaceCard at the end.
{
  const OG_CARD = readFileSync(new URL('./queen-og-card.txt', import.meta.url), 'utf8');
  const path = join(dir, 'lib/og-brand-card.js');
  const src = readFileSync(path, 'utf8');
  if (src.includes('renderQueenCard')) already++;
  else {
    writeFileSync(path, `${src.replace(/\s*$/, '\n')}\n${OG_CARD}`);
    touched.add('lib/og-brand-card.js');
    changed++;
  }
}

console.log(`${changed} edit(s) applied, ${already} already in place`);
console.log([...touched].sort().map((f) => `  ${f}`).join('\n'));

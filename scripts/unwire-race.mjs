// unwire-race — remove the Race daily game from every registry it was wired
// into by scripts/wire-queen-race.mjs (2026-08-21), and shrink the Board Games
// circuit back to Check + Turn.
//
//   node scripts/unwire-race.mjs <rootdir>
//
// Owner ruling 2026-08-21: Race is deleted outright rather than retired. It
// launched the same morning, so there is no meaningful play history to protect
// and no reason to leave a dated retirement in place.
//
// Board Games keeps its id, its trophy and its two remaining games. Folding
// Check and Turn into Table Games was considered and is IMPOSSIBLE: verify-
// circuits caps a circuit at MAX = 5 and Table Games is already at five, and
// the exhaustive rule means the two cannot simply be dropped either. A pair is
// above the floor of 2, and is the same sanctioned exception Chess takes.
//
// Every edit is a literal anchor plus its replacement. An anchor that does not
// match EXACTLY ONCE throws, because half these registries fail SILENTLY when
// they drift (see the registries checklist in CLAUDE.md). Re-running after a
// partial apply is safe: an anchor already applied is reported as done, not as
// a failure.
import { readFileSync, writeFileSync, existsSync, rmSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = process.argv[2];
if (!ROOT) { console.error('usage: node unwire-race.mjs <rootdir>'); process.exit(1); }

let applied = 0, already = 0;
const problems = [];

// edit(file, from, to) — `from` must appear exactly once. `to` may be '' to cut.
const EDITS = [];
function edit(file, from, to) { EDITS.push({ file, from, to }); }

// ───────────────────────────────────────────────────────────────────────────
// 1. lib/daily-games.js — the single source of truth. Drop the row and Race
//    disappears from DAILY_KEYS, DAILY_DATED_RE, admin analytics, the board
//    panel, daily-combined and the canonical order all at once.
edit('lib/daily-games.js',
  `  { key: 'race', keepsAnswer: true, miss: 'Tries', name: 'Race', cat: 'End Game', tag: 'First pawn through wins', how: 'Pawns run one square at a time and capture on the diagonal, and the first one to the far rank ends it. You are winning, there are no draws, and exactly one move keeps it that way.', color: '#1d4ed8', colorNavy: '#93c5fd' },\n`,
  '');

// 2. lib/loft.js — the Loft roster.
edit('lib/loft.js',
  `  'pricer', 'queen', 'quilt', 'race', 'redact', 'rung', 'sando', 'shards',`,
  `  'pricer', 'queen', 'quilt', 'redact', 'rung', 'sando', 'shards',`);

// 3. lib/sunday-editions.js — Race authored Sundays; it no longer exists to.
edit('lib/sunday-editions.js',
  `  'barter', 'plot', 'sixes', 'niche', 'shoe', 'queen', 'race',`,
  `  'barter', 'plot', 'sixes', 'niche', 'shoe', 'queen',`);

// 4. lib/sitemap-entries.js — the /race url.
edit('lib/sitemap-entries.js',
  `  'docket', 'plot', 'barter', 'sixes', 'niche', 'shoe', 'queen', 'race', 'defend', 'blitz', 'strata', 'blocks', 'chomp',`,
  `  'docket', 'plot', 'barter', 'sixes', 'niche', 'shoe', 'queen', 'defend', 'blitz', 'strata', 'blocks', 'chomp',`);

// 5. lib/quiz-catalog.js — WORD_GAME_FORMATS. A no-op for a standalone daily,
//    but the set is kept matching the roster so the sweep stays clean.
edit('lib/quiz-catalog.js', `, 'queen', 'race']);`, `, 'queen']);`);

// 6. app/DailySlateRail.jsx — SLATE_KEYS, the A-Z rail on every daily page.
edit('app/DailySlateRail.jsx',
  `  'deep', 'anon', 'blocks', 'chomp', 'sweep', 'docket', 'blitz', 'defend', 'barter', 'plot', 'sixes', 'niche', 'shoe', 'queen', 'race',`,
  `  'deep', 'anon', 'blocks', 'chomp', 'sweep', 'docket', 'blitz', 'defend', 'barter', 'plot', 'sixes', 'niche', 'shoe', 'queen',`);

// 7. app/DailyStrip.jsx — the GAMES row behind the slate and both cap tiles.
edit('app/DailyStrip.jsx',
  `  { key: 'race', href: '/race', name: 'Race', img: '/games/btn-race.png', store: 'sot_race_day', tag: "First pawn through wins" , cat: 'End Game' },\n`,
  '');

// 8. app/DailyGamesGrid.jsx — BOTH lists. A key in CATEGORIES with no GAMES row
//    (or the reverse) is dropped with no error and no gap, so both go together.
edit('app/DailyGamesGrid.jsx',
  `  { key: 'race', href: '/race', name: 'Race', tag: 'First pawn through wins', img: '/games/btn-race.png' },\n`,
  '');
edit('app/DailyGamesGrid.jsx',
  `  { key: 'endgame', label: 'End Game', keys: ['mate', 'defend', 'queen', 'four', 'check', 'chain', 'turn', 'race'] },`,
  `  { key: 'endgame', label: 'End Game', keys: ['mate', 'defend', 'queen', 'four', 'check', 'chain', 'turn'] },`);

// 9. app/DailyGamesPromo.jsx — its own promo array.
edit('app/DailyGamesPromo.jsx',
  `  { key: 'race', href: '/race', name: 'Race', tag: 'first pawn through wins', store: 'sot_race_day', accent: '#1d4ed8', bg: '#e8effc', border: 'rgba(29,78,216,0.4)' },\n`,
  '');

// 10. app/DailyEndCard.jsx — DEFEAT_GAMES, the LAUNCH_PIN, and the tile copy.
edit('app/DailyEndCard.jsx',
  `const DEFEAT_GAMES = new Set(['four', 'mate', 'check', 'taire', 'chain', 'turn', 'defend', 'queen', 'race']);`,
  `const DEFEAT_GAMES = new Set(['four', 'mate', 'check', 'taire', 'chain', 'turn', 'defend', 'queen']);`);
edit('app/DailyEndCard.jsx', `const LAUNCH_PIN = { keys: ['queen', 'race', 'shoe',`, `const LAUNCH_PIN = { keys: ['queen', 'shoe',`);
edit('app/DailyEndCard.jsx',
  `  { key: 'race',  cat: 'endgame',   name: 'Race',  tag: 'First pawn through wins',     blurb: 'A pawn race with no draws. One square at a time, captures on the diagonal, and exactly one first move keeps you in front.', href: '/race' },\n`,
  '');

// 11. app/api/quiz/daily-order/route.js — the LAUNCH_PIN mirror.
edit('app/api/quiz/daily-order/route.js', `const LAUNCH_PIN = { keys: ['queen', 'race', 'shoe',`, `const LAUNCH_PIN = { keys: ['queen', 'shoe',`);

// 12. app/daily/DailyArchiveClient.jsx — the archive's End Game family.
edit('app/daily/DailyArchiveClient.jsx',
  `  { key: 'endgame', label: 'End Game', keys: ['mate', 'defend', 'queen', 'four', 'check', 'chain', 'turn', 'race'] },`,
  `  { key: 'endgame', label: 'End Game', keys: ['mate', 'defend', 'queen', 'four', 'check', 'chain', 'turn'] },`);

// 13. app/daily/page.js — the import, the field strip AND the card entry.
//     Removing only one of the three is a ReferenceError at build time.
edit('app/daily/page.js', `import { PUZZLES as RACE_FULL } from '../race/puzzles';\n`, '');
edit('app/daily/page.js',
  `const RACE = RACE_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));\n`,
  '');
edit('app/daily/page.js',
  `  { key: 'race', name: 'Race', path: '/race', tag: 'First pawn through wins', accent: '#1d4ed8', bg: '#e8effc', border: 'rgba(29,78,216,0.4)', src: RACE },\n`,
  '');

// 14. The FOUR copies of the puzzle-import list and its GAME_PUZZLES map. Three
//     routes plus lib/daily-slate.js, which daily-combined and daily-me read
//     rather than owning a copy. Miss one and that surface is simply one short.
for (const f of ['app/api/quiz/daily-game/route.js', 'app/api/quiz/daily-unplayed/route.js', 'app/api/quiz/sunday-slate/route.js']) {
  edit(f, `import { PUZZLES as P_race } from '@/app/race/puzzles';\n`, '');
}
edit('lib/daily-slate.js', `import { PUZZLES as P_race } from '@/app/race/puzzles';\n`, '');
edit('app/api/quiz/daily-game/route.js', `queen: P_queen, race: P_race,`, `queen: P_queen,`);
edit('app/api/quiz/daily-unplayed/route.js', `queen: P_queen, race: P_race };`, `queen: P_queen };`);
edit('app/api/quiz/sunday-slate/route.js', `queen: P_queen, race: P_race };`, `queen: P_queen };`);
edit('lib/daily-slate.js', `queen: P_queen, race: P_race,`, `queen: P_queen,`);

// 15. The two hardcoded regex alternations.
edit('app/api/quiz/daily-status/route.js', `|shoe|queen|race)-`, `|shoe|queen)-`);
edit('app/quizzes/QuizHomeClient.jsx', `|shoe|queen|race)-`, `|shoe|queen)-`);

// 16. lib/circuits.js — Board Games loses Race and keeps its id, its trophy and
//     its two remaining games. The copy has to come down from three to two: a
//     blurb that promises three positions is a lie the moment one leaves.
edit('lib/circuits.js',
  `      invite: "Three positions already won, and one move that throws each of them away. The shortest circuit on the site, and the least forgiving.",
      result: "Three won positions, three chances to lose them.",`,
  `      invite: "Two positions already won, and one move that throws each of them away. The shortest circuit on the site, and the least forgiving.",
      result: "Two won positions, two chances to lose them.",`);
edit('lib/circuits.js',
  `    // Renamed from Chess & Board on 2026-08-21, when the chess games moved out
    // into the all-chess circuit below (owner ruling) and Race arrived. The id
    // stays chess-board on purpose: it is the URL and the trophy key, and the
    // circuit boards already played hang off it.
    keys: ['check', 'turn', 'race'],                             // 21/23/~45 est = 89`,
  `    // Renamed from Chess & Board on 2026-08-21, when the chess games moved out
    // into the all-chess circuit below (owner ruling) and Race arrived. Race was
    // deleted from the roster later the same day, leaving a pair. The id stays
    // chess-board on purpose: it is the URL and the trophy key, and the circuit
    // boards already played hang off it. Folding these two into Table Games is
    // not available: verify-circuits caps a circuit at five and Table Games is
    // already at five, so the pair is the honest shape. It is above the floor
    // of two, and 44s still tiers bronze.
    keys: ['check', 'turn'],                                     // 21/23 = 44`);

// 17. The circuits header comment states the shape of the whole set, and it is
//     read as fact by the next session. Race leaving turns one of the two
//     threes into a two.
edit('lib/circuits.js',
  `// at 67 games over 15 circuits, NINE OF FIVE, FOUR OF FOUR AND TWO OF THREE
// (Niche made Recall the eighth five on 2026-08-20, Shoe made Table Games the
// ninth on 2026-08-21, and the chess split of 2026-08-21 left Board Games and
// Chess a pair of threes). The no-tiny-circuits floor still holds in general,
// a circuit's whole score being 15 points per game, so a three tops out at 45
// against a five's 75; the owner sanctioned exactly these two threes on
// 2026-08-21, because chess is its own discipline and filing Queen or Race
// somewhere they do not belong was the worse lie.
// Against the 69 in the registry:`,
  `// at 66 games over 15 circuits, NINE OF FIVE, FOUR OF FOUR, ONE OF THREE AND
// ONE PAIR (Niche made Recall the eighth five on 2026-08-20, Shoe made Table
// Games the ninth on 2026-08-21, the chess split of 2026-08-21 left Board Games
// and Chess a pair of threes, and Race's deletion later the same day took Board
// Games down to a pair). The no-tiny-circuits floor still holds in general, a
// circuit's whole score being 15 points per game, so a three tops out at 45 and
// a pair at 30 against a five's 75; the owner sanctioned the threes on
// 2026-08-21, because chess is its own discipline and filing Queen somewhere it
// does not belong was the worse lie, and sanctioned the pair when Race went,
// because Table Games was already at the cap of five with no room to take
// Check and Turn in.
// Against the 68 in the registry:`);

// 18. lib/og-brand-card.js — the Race share card and its board helpers. The
//     game's opengraph-image.js is the only importer and it goes with the game.
edit('lib/og-brand-card.js', { cutBetween: [
  `// ---------------------------------------------------------------------------\n// Race share card`,
  `  return new ImageResponse(buildRaceCard(), { ...size, fonts });\n}\n`,
] }, '');

// 19. scripts/verify-circuits.mjs — the measured-median snapshot names Race.
edit('scripts/verify-circuits.mjs',
  `  // Queen and Race launched 2026-08-21 with no live clock data yet: estimated
  // from their shapes (Queen walks a 5-12 move line with replies between, so
  // past Mate; Race is a 3-5 move sprint, so past Four). Replace with measured
  // medians at the next snapshot re-measure.
  queen: 75, race: 45,`,
  `  // Queen launched 2026-08-21 with no live clock data yet: estimated from its
  // shape (it walks a 5-12 move line with replies between, so past Mate).
  // Replace with the measured median at the next snapshot re-measure.
  queen: 75,`);

// ───────────────────────────────────────────────────────────────────────────
// Files that go entirely, and one that is rewritten to its Queen half.
const DELETE = [
  'app/race/RaceClient.jsx',
  'app/race/breakthrough.js',
  'app/race/opengraph-image.js',
  'app/race/page.js',
  'app/race/puzzles.js',
  'app/race/twitter-image.js',
  'public/games/btn-race.png',
  'public/games/blue/btn-race.png',
  'scripts/gen-race.mjs',
  'scripts/verify-race.mjs',
];

// ───────────────────────────────────────────────────────────────────────────
function applyEdit(e) {
  const p = join(ROOT, e.file);
  if (!existsSync(p)) { problems.push(`${e.file}: missing`); return; }
  const src = readFileSync(p, 'utf8');

  let from = e.from;
  if (typeof from === 'object' && from.cutBetween) {
    const [head, tail] = from.cutBetween;
    const i = src.indexOf(head);
    if (i < 0) { already += 1; console.log(`  · ${e.file}: block already gone`); return; }
    if (src.indexOf(head, i + 1) >= 0) { problems.push(`${e.file}: block head matches more than once`); return; }
    const j = src.indexOf(tail, i);
    if (j < 0) { problems.push(`${e.file}: block head found but tail did not follow it`); return; }
    const cut = src.slice(0, i) + src.slice(j + tail.length);
    writeFileSync(p, cut);
    applied += 1;
    console.log(`  ✓ ${e.file}: cut ${j + tail.length - i} chars`);
    return;
  }

  const n = src.split(from).length - 1;
  if (n === 0) {
    // Already applied is only credible when the replacement is present.
    if (e.to && src.includes(e.to)) { already += 1; console.log(`  · ${e.file}: already applied`); }
    else if (!e.to) { already += 1; console.log(`  · ${e.file}: already applied`); }
    else problems.push(`${e.file}: anchor not found and replacement not present\n      anchor: ${JSON.stringify(from.slice(0, 90))}`);
    return;
  }
  if (n > 1) { problems.push(`${e.file}: anchor matched ${n} times, must be exactly once\n      anchor: ${JSON.stringify(from.slice(0, 90))}`); return; }
  writeFileSync(p, src.replace(from, e.to));
  applied += 1;
  console.log(`  ✓ ${e.file}`);
}

console.log('edits:');
for (const e of EDITS) applyEdit(e);

console.log('deletions:');
for (const rel of DELETE) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) { already += 1; console.log(`  · ${rel}: already gone`); continue; }
  rmSync(p, { force: true });
  applied += 1;
  console.log(`  ✓ ${rel}`);
}

// The Queen+Race playout verifier keeps its Queen half. It IMPORTS app/race,
// so leaving it alone would break the moment the directory goes.
const QR = join(ROOT, 'scripts/verify-endgame-playout-qr.mjs');
const QONLY = join(ROOT, 'scripts/verify-endgame-playout-queen.mjs');
if (existsSync(QR)) {
  let s = readFileSync(QR, 'utf8');
  const cuts = [
    [`import { PUZZLES as RP } from '../app/race/puzzles.js';\n`, ''],
    [`// ─── Race: one round, White driven by \`policy\` ─────────────────────────────`, null],
  ];
  // Cut the Race import, the breakthrough import, the raceRound function and
  // the Race driver loop. Bounded by the section rules the file already uses.
  s = s.replace(/import \{ PUZZLES as RP \} from '\.\.\/app\/race\/puzzles\.js';\n/, '');
  s = s.replace(/import \{[^}]*\} from '\.\.\/app\/race\/breakthrough\.js';\n/, '');
  const start = s.indexOf('// ─── Race: one round');
  const end = s.indexOf("console.log('✓ queen");
  if (start < 0 || end < 0 || end < start) {
    problems.push('verify-endgame-playout-qr.mjs: could not bound the Race half — edit it by hand');
  } else {
    s = s.slice(0, start) + s.slice(end);
    s = s.replace("console.log('✓ queen + race playouts all conclude, all replies legal, all verdicts as banked');",
      "console.log('✓ queen playouts all conclude, all replies legal, all verdicts as banked');");
    s = s.replace('// verify-endgame-playout-qr — prove the LIVE PLAYOUT of Queen and Race: from',
      '// verify-endgame-playout-queen — prove the LIVE PLAYOUT of Queen: from');
    s = s.replace(`// applied to the two 2026-08-21 games. It drives the SAME modules the clients
// drive (app/queen/kpk.js, app/race/breakthrough.js), with White played by:`,
      `// applied to Queen, which launched 2026-08-21. It drives the SAME module the
// client drives (app/queen/kpk.js), with White played by:`);
    s = s.replace(`//     the loss concludes, within the budget for Queen and within the board's
//     structural move bound for Race), repeated over several seeds.`,
      `//     the loss concludes within the budget), repeated over several seeds.`);
    s = s.replace('// Run: node scripts/verify-endgame-playout-qr.mjs',
      '// Run: node scripts/verify-endgame-playout-queen.mjs');
    writeFileSync(QONLY, s);
    rmSync(QR, { force: true });
    applied += 1;
    console.log('  ✓ scripts/verify-endgame-playout-qr.mjs -> verify-endgame-playout-queen.mjs (Race half cut)');
  }
} else if (existsSync(QONLY)) {
  already += 1;
  console.log('  · verify-endgame-playout-queen.mjs: already renamed');
}

console.log(`\n${applied} applied, ${already} already done, ${problems.length} problem(s)`);
if (problems.length) { for (const p of problems) console.error('  ✗ ' + p); process.exit(1); }

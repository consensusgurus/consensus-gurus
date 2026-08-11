// One-shot fork of app/suds/SudsClient.jsx into app/quilt/QuiltClient.jsx.
//
//   node scripts/fork-quilt-client.mjs <path-to-SudsClient.jsx> <out>
//
// Quilt is Suds with the boxes redrawn, so the client is the same 1,000-line
// game with three real differences and a pile of renames. Doing it as a scripted
// transform rather than by hand keeps the two in step and makes the diff
// reviewable: every edit below is an exact string replacement that FAILS LOUDLY
// if the source moved under it, which is the point. A silent no-op replacement
// would ship a Quilt client that still drew 3x3 boxes.
//
// THE THREE REAL CHANGES
//   1. `boxOf(r, c)`, a pure function of the coordinates, becomes `REG[idx]`, a
//      lookup into the puzzle's own region map. Everything downstream (peer
//      highlighting, note scrubbing, the conflict test) is expressed in terms of
//      that one call in Suds, so this is genuinely the whole rule change.
//   2. Cell borders are drawn where the REGION changes rather than every third
//      column, and each region carries a soft tint so the shapes read at a
//      glance.
//   3. Copy: "3x3 box" becomes "region" everywhere a player can see it.
import fs from 'node:fs';

const [, , SRC = 'app/suds/SudsClient.jsx', OUT = 'app/quilt/QuiltClient.jsx'] = process.argv;
let s = fs.readFileSync(SRC, 'utf8');

let applied = 0;
function sub(from, to, opts = {}) {
  const { all = false, optional = false } = opts;
  const n = s.split(from).length - 1;
  if (n === 0) {
    if (optional) return;
    throw new Error(`PATTERN NOT FOUND (the source moved): ${JSON.stringify(from.slice(0, 90))}`);
  }
  if (!all && n > 1) throw new Error(`PATTERN MATCHED ${n} TIMES, expected 1: ${JSON.stringify(from.slice(0, 90))}`);
  s = all ? s.split(from).join(to) : s.replace(from, to);
  applied++;
}

// ── 1. the header ────────────────────────────────────────────────────────────
sub(`// Suds — the daily 9×9 sudoku.
//
// Each day: a 9×9 grid with printed clues. Fill every empty cell 1–9 so no
// digit repeats in any row, column, or 3×3 box. There is exactly one solution.`,
`// Quilt — the daily 9×9 jigsaw sudoku.
//
// Each day: a 9×9 grid with printed clues. Fill every empty cell 1–9 so no
// digit repeats in any row, column, or region. The nine 3×3 boxes of an ordinary
// sudoku are replaced by nine connected irregular regions of nine cells each,
// carried per puzzle in \`reg\` and drawn here as a tint plus a heavy outline.
// There is exactly one solution, and it is always reachable without guessing.`);

sub(`// server (app/suds/page.js), per-puzzle localStorage saves, /suds?p=N archive`,
    `// server (app/quilt/page.js), per-puzzle localStorage saves, /quilt?p=N archive`);

// ── 2. identity ──────────────────────────────────────────────────────────────
// Quilt's accent is fuchsia, deliberately nowhere near Suds's orange: the two
// games look alike at a glance and the colour is the fastest way to tell which
// one you opened.
sub(`  accent: '#ea580c',       // Suds identity — orange`,
    `  accent: '#a21caf',       // Quilt identity — fuchsia, well clear of Suds's orange`);
sub(`  accentSoft: '#fff5ed',`, `  accentSoft: '#fdf4ff',`);
sub(`box-shadow:0 2px 0 rgba(154,61,12,0.55)`, `box-shadow:0 2px 0 rgba(112,26,117,0.55)`);
sub(`.sd-pad.armed .sd-pad-n{color:#ffe0cc;}`, `.sd-pad.armed .sd-pad-n{color:#f6d9f4;}`);

sub(`export default function SudsClient(`, `export default function QuiltClient(`);
sub(`'sot_suds_help_seen'`, `'sot_quilt_help_seen'`);
sub(`'sot_suds_stats'`, `'sot_quilt_stats'`);
sub('`sot_suds_${PUZZLE.num}`', '`sot_quilt_${PUZZLE.num}`');
sub('`sot_suds_rec_${PUZZLE.num}`', '`sot_quilt_rec_${PUZZLE.num}`');
sub(`'sot_suds_day'`, `'sot_quilt_day'`, { all: true });
sub(`hintAllowed('suds', stats)`, `hintAllowed('quilt', stats)`);
sub(`spendHint('suds')`, `spendHint('quilt')`);
sub(`self="suds"`, `self="quilt"`, { all: true });
sub(`slug="suds"`, `slug="quilt"`, { all: true });
sub(`name="Suds"`, `name="Quilt"`);

// The masthead spells the game out in pressed tiles. QUILT is five letters to
// SUDS's four, so the accent tile moves from index 3 to index 4 (the last one).
sub(`{/* masthead: pressed SUDS tiles with No./date inline */}`, `{/* masthead: pressed QUILT tiles with No./date inline */}`);
sub(`blocks={'SUDS'.split('').map((ch, i) => (`, `blocks={'QUILT'.split('').map((ch, i) => (`);
sub(`background: i === 3 ? COLORS.accent : COLORS.ink`, `background: i === 4 ? COLORS.accent : COLORS.ink`);

// ── 3. player-facing copy ────────────────────────────────────────────────────
sub(`Sunday Edition &middot; Hard`, `Sunday Edition &middot; Fewer clues`);
sub(`? \`Suds #\${PUZZLE.num}\${PUZZLE.sunday ? ' · Sunday' : ''}`, `? \`Quilt #\${PUZZLE.num}\${PUZZLE.sunday ? ' · Sunday' : ''}`);
sub(`: \`Suds #\${PUZZLE.num} · gave up\``, `: \`Quilt #\${PUZZLE.num} · gave up\``);
sub('`mindloftdaily.com/suds${isTodays', '`mindloftdaily.com/quilt${isTodays');
sub('? `Suds #${PUZZLE.num} — the daily sudoku from Mind Loft.', '? `Quilt #${PUZZLE.num} — the daily jigsaw sudoku from Mind Loft.');
sub(`'Suds is ready'`, `'Quilt is ready'`);
sub(`Next Suds in `, `Next Quilt in `);
sub(`'A new sudoku drops at midnight Eastern.'`, `'A new jigsaw drops at midnight Eastern.'`);
sub('`/suds?p=${prevPuzzle.num}`', '`/quilt?p=${prevPuzzle.num}`');
sub(`play yesterday&rsquo;s Suds &rarr;`, `play yesterday&rsquo;s Quilt &rarr;`);
sub(`href="/suds"`, `href="/quilt"`);
sub(`Back to today&rsquo;s Suds &rarr;`, `Back to today&rsquo;s Quilt &rarr;`);
sub(`Add Suds to your Home Screen`, `Add Quilt to your Home Screen`);
sub(`{/* About Suds — crawlable prose for search, server-rendered into the HTML */}`,
    `{/* About Quilt — crawlable prose for search, server-rendered into the HTML */}`);
sub(`>About Suds</h2>`, `>About Quilt</h2>`);
sub(`          Suds is a free daily sudoku from Mind Loft. Each day gives you a fresh 9×9 grid with a handful of printed clues. Fill in the rest so that every row, every column, and every 3×3 box holds the digits 1 through 9 exactly once. There is always a single, logical solution &mdash; no guessing required.`,
    `          Quilt is a free daily jigsaw sudoku from Mind Loft. Each day gives you a fresh 9×9 grid, a handful of printed clues, and nine irregular regions in place of the usual 3×3 boxes. Fill in the rest so that every row, every column, and every region holds the digits 1 through 9 exactly once. There is always a single, logical solution &mdash; no guessing required.`);

sub(`      lead="Fill every empty square so each row, each column and each 3×3 box holds the digits 1–9 with no repeats."`,
    `      lead="Fill every empty square so each row, each column and each coloured region holds the digits 1–9 with no repeats."`);
sub(`        <p style={{ margin: '0 0 6px' }}>Fill the grid so every row, column, and 3×3 box holds the digits 1 to 9.</p>`,
    `        <p style={{ margin: '0 0 6px' }}>Fill the grid so every row, column, and coloured region holds the digits 1 to 9.</p>`);
sub(`      knack="Wrong entries are not flagged, just like paper sudoku, so it is on you to spot them before one bad digit poisons half the grid."`,
    `      knack="The regions are the whole game. They are the same nine cells an ordinary sudoku box would be, just not in a square, so scan along a shape rather than across a block. Wrong entries are not flagged, so it is on you to spot them."`);
sub(`      footer="Every board has exactly one solution. Solve the whole grid and you score a perfect 10, and the faster you finish, the higher you place on the daily leaderboard. One free hint, on your first ever play, fills a correct number. Sundays are a harder Edition with fewer clues."`,
    `      footer="Every board has exactly one solution and can always be reached by logic alone, never by guessing. Solve the whole grid and you score a perfect 10, and the faster you finish, the higher you place on the daily leaderboard. One free hint, on your first ever play, fills a correct number. Sundays are a harder Edition with fewer clues."`);
sub(`          {/* 9×9 grid with heavy 3×3 rules */}`, `          {/* 9×9 grid with heavy rules along the region borders */}`);

// ── 4. THE RULE CHANGE: regions replace boxes ────────────────────────────────
// boxOf was a pure function of the coordinates because a 3x3 box is implied by
// them. A region is not, so it has to be read off the puzzle. REG is built in
// the component below; this module-level helper goes away entirely so nothing
// can keep computing box membership by accident.
sub(`const boxOf = (r, c) => Math.floor(r / 3) * 3 + Math.floor(c / 3);`,
`// Nine soft tints, one per region index. They are pale on purpose: the digits
// have to stay the loudest thing in the cell, and the heavy border along each
// region edge is what actually carries the shape. Selection and match
// highlighting still paint over the tint, exactly as in Suds.
const REGION_TINT = ['#fdf2f8', '#eff6ff', '#f0fdf4', '#fefce8', '#faf5ff', '#ecfeff', '#fff7ed', '#f1f5f9', '#f7fee7'];`);

sub(`  const GIVEN = PUZZLE.given;`,
`  const GIVEN = PUZZLE.given;
  // The region map, flattened to cell index. Everything that used to ask
  // "which 3x3 box is this?" asks REG instead.
  const REG = useMemo(() => {
    const f = Array(81).fill(0);
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) f[r * 9 + c] = PUZZLE.reg[r][c];
    return f;
  }, [PUZZLE]);`);

sub(`    const r = Math.floor(idx / 9), c = idx % 9, b = boxOf(r, c), m = 1 << d;`,
    `    const r = Math.floor(idx / 9), c = idx % 9, b = REG[idx], m = 1 << d;`);
sub(`      if (rr === r || cc === c || boxOf(rr, cc) === b) { if (noteArr[j] & m) noteArr[j] = noteArr[j] & ~m; }`,
    `      if (rr === r || cc === c || REG[j] === b) { if (noteArr[j] & m) noteArr[j] = noteArr[j] & ~m; }`);
sub(`  const selB = sel >= 0 ? boxOf(selR, selC) : -1;`, `  const selB = sel >= 0 ? REG[sel] : -1;`);

// Borders follow the region edges. `c % 3 === 2` was a stand-in for "the box
// ends here"; the real test is whether the neighbour belongs to another region.
sub(`  function cellStyle(idx) {
    const r = Math.floor(idx / 9), c = idx % 9, b = boxOf(r, c);
    const isSel = idx === sel;
    const peer = sel >= 0 && !isSel && (r === selR || c === selC || b === selB);
    const val = givenFlat[idx] || cells[idx];
    const sameVal = hlVal && val === hlVal && !isSel;
    let bg = T.white;
    if (peer) bg = '#f3f5f8';
    if (sameVal) bg = '#ffe9d8';
    if (isSel) bg = '#ffd9bd';
    return {
      background: bg,
      boxShadow: isSel ? \`inset 0 0 0 2.5px \${COLORS.accent}\` : undefined,
      zIndex: isSel ? 1 : undefined,
      borderRight: \`\${c % 3 === 2 && c !== 8 ? 2.5 : 1}px solid \${c % 3 === 2 && c !== 8 ? 'rgba(28,30,36,0.85)' : 'rgba(28,30,36,0.18)'}\`,
      borderBottom: \`\${r % 3 === 2 && r !== 8 ? 2.5 : 1}px solid \${r % 3 === 2 && r !== 8 ? 'rgba(28,30,36,0.85)' : 'rgba(28,30,36,0.18)'}\`,
      borderLeft: c === 0 ? 'none' : undefined,
      borderTop: r === 0 ? 'none' : undefined,
    };
  }`,
`  function cellStyle(idx) {
    const r = Math.floor(idx / 9), c = idx % 9, b = REG[idx];
    const isSel = idx === sel;
    const peer = sel >= 0 && !isSel && (r === selR || c === selC || b === selB);
    const val = givenFlat[idx] || cells[idx];
    const sameVal = hlVal && val === hlVal && !isSel;
    // The region tint is the resting state; selection and match highlighting
    // paint over it, and the heavy border keeps the shape readable either way.
    let bg = REGION_TINT[b] || T.white;
    if (peer) bg = '#e9edf3';
    if (sameVal) bg = '#fbe3f7';
    if (isSel) bg = '#f6cdef';
    // A wall goes wherever the neighbour is in a different region. The last row
    // and column are the grid's own outer border, so they are left alone.
    const wallR = c !== 8 && REG[idx + 1] !== b;
    const wallB = r !== 8 && REG[idx + 9] !== b;
    return {
      background: bg,
      boxShadow: isSel ? \`inset 0 0 0 2.5px \${COLORS.accent}\` : undefined,
      zIndex: isSel ? 1 : undefined,
      borderRight: \`\${wallR ? 2.5 : 1}px solid \${wallR ? 'rgba(28,30,36,0.85)' : 'rgba(28,30,36,0.18)'}\`,
      borderBottom: \`\${wallB ? 2.5 : 1}px solid \${wallB ? 'rgba(28,30,36,0.85)' : 'rgba(28,30,36,0.18)'}\`,
      borderLeft: c === 0 ? 'none' : undefined,
      borderTop: r === 0 ? 'none' : undefined,
    };
  }`);

// ── 5. local class prefix, so a stray Suds rule can never apply here ─────────
sub('sd-', 'ql-', { all: true });

if (/boxOf|sot_suds|SudsClient|'suds'|"suds"/.test(s)) {
  throw new Error('a Suds reference survived the fork: ' + (s.match(/boxOf|sot_suds|SudsClient|'suds'|"suds"/) || [])[0]);
}
fs.writeFileSync(OUT, s);
console.log(`wrote ${OUT} (${applied} replacements, ${s.split('\n').length} lines)`);

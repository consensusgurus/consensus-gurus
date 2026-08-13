// One-shot fork of app/suds/SudsClient.jsx into app/cages/CagesClient.jsx.
//
//   node scripts/fork-cages-client.mjs [src] [out]
//
// Cages is KILLER SUDOKU: Suds with every printed digit taken away and replaced
// by arithmetic. The rows, columns and 3x3 boxes are untouched, which is why the
// fork starts from Suds rather than Quilt (Quilt is the one that redraws the
// boxes). Doing it as a scripted transform rather than by hand keeps the three
// sudokus in step and makes the diff reviewable: every edit below is an exact
// string replacement that FAILS LOUDLY if the source moved under it. A silent
// no-op would ship a Cages client that quietly behaved like Suds.
//
// THE REAL CHANGES
//   1. There are NO GIVENS. `givenFlat` becomes 81 zeros rather than a lookup
//      into a printed grid, so every guard that asked "is this a printed clue?"
//      still runs and is simply always false, and FREE becomes all 81 cells.
//      That is deliberate: rewriting those guards away would be a far larger and
//      riskier diff than letting them answer no.
//   2. A cage is a fourth kind of peer. No digit repeats inside one, so the note
//      scrubber, the peer highlight and the pad all learn about it alongside the
//      row, the column and the box.
//   3. The cage partition is drawn as a dashed outline inset inside the solid
//      sudoku grid, with each cage's printed total in its top-left cell. That is
//      the entire clue set, so it gets the most care.
//   4. Copy: "printed clues" becomes the cage totals, and the game says plainly
//      that it is a killer sudoku, in the rules, the SEO prose and the metadata.
import fs from 'node:fs';

const [, , SRC = 'app/suds/SudsClient.jsx', OUT = 'app/cages/CagesClient.jsx'] = process.argv;
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
// digit repeats in any row, column, or 3×3 box. There is exactly one solution.
// Classic sudoku: a wrong digit is NOT flagged — it looks like any other entry,
// and the grid is accepted only once every square is correct. A solve scores a
// perfect 10, and the daily leaderboard ranks solvers by fastest time.
// Notes let you pencil candidates; one free hint fills a correct cell.
//
// Same daily plumbing as Tally/Span: banked boards gated by Eastern date on the
// server (app/suds/page.js), per-puzzle localStorage saves, /suds?p=N archive
// pinning, streaks + stats, and the shared /api/quiz/* board flow. Weekdays are
// a standard board; Sundays step up to a harder Edition with fewer clues.`,
`// Cages — the daily KILLER SUDOKU.
//
// Killer sudoku is sudoku with the clues taken away and replaced by arithmetic.
// Rows, columns and 3×3 boxes still hold 1–9 exactly once, but NOT ONE DIGIT IS
// PRINTED. Instead the 81 cells are partitioned into connected "cages", each
// printed with the total of the digits inside it, and no digit may repeat within
// a cage. The sums are the only clues there are, so the board opens completely
// empty and the first move has to be argued for rather than read off.
//
// Classic sudoku conventions otherwise: a wrong digit is NOT flagged — it looks
// like any other entry, and the grid is accepted only once every square is
// correct. A solve scores a perfect 10, and the daily leaderboard ranks solvers
// by fastest time. Notes let you pencil candidates; one free hint fills a
// correct cell.
//
// Same daily plumbing as Suds and Quilt: banked boards gated by Eastern date on
// the server (app/cages/page.js), per-puzzle localStorage saves, /cages?p=N
// archive pinning, streaks + stats, and the shared /api/quiz/* board flow.
// Weekdays run 29–34 cages of at most four cells on a Monday-to-Saturday ramp;
// Sundays are a harder Edition at 27 cages, and are the only day that prints a
// five-cell cage.`);

// ── 2. identity: name, storage keys, class prefix, accent ────────────────────
sub(`  accent: '#ea580c',       // Suds identity — orange
  accentSoft: '#fff5ed',`,
`  accent: '#6b21a8',       // Cages identity — violet, clear of Suds's orange
  accentSoft: '#f5f3ff',   // and Quilt's fuchsia, the other two sudokus`);
sub(`const HELP_KEY = 'sot_suds_help_seen';
const STATS_KEY = 'sot_suds_stats';`,
`const HELP_KEY = 'sot_cages_help_seen';
const STATS_KEY = 'sot_cages_stats';`);
sub('export default function SudsClient(', 'export default function CagesClient(');
sub('const STORE_KEY = `sot_suds_${PUZZLE.num}`;', 'const STORE_KEY = `sot_cages_${PUZZLE.num}`;');
sub('sd-', 'cg-', { all: true });
sub('sdfade', 'cgfade', { all: true });
sub('sdstamp', 'cgstamp', { all: true });
sub(`box-shadow:0 2px 0 rgba(154,61,12,0.55);`, `box-shadow:0 2px 0 rgba(55,20,110,0.55);`);
sub(`.cg-pad.armed .cg-pad-n{color:#ffe0cc;}`, `.cg-pad.armed .cg-pad-n{color:#ded2fb;}`);

// ── 3. no givens, and the cage partition instead ─────────────────────────────
sub(`  const GIVEN = PUZZLE.given;
  const SOL = PUZZLE.sol;`,
`  const SOL = PUZZLE.sol;
  // The cage partition, flattened once: which cage each cell belongs to, the
  // cells of each cage, and the printed total. These ARE the clue set.
  const CAGE = useMemo(() => PUZZLE.cage.flat(), [PUZZLE]);
  const SUMS = PUZZLE.sums;
  const CAGE_CELLS = useMemo(() => {
    const out = SUMS.map(() => []);
    CAGE.forEach((k, i) => out[k].push(i));
    return out;
  }, [CAGE, SUMS]);
  // the cell each cage prints its total in: topmost, then leftmost
  const SUM_AT = useMemo(() => {
    const at = Array(81).fill(0);
    CAGE_CELLS.forEach((cells, k) => { at[Math.min(...cells)] = SUMS[k]; });
    return at;
  }, [CAGE_CELLS, SUMS]);`);
sub(`  // flat given lookup + list of the cells the player must fill
  const givenFlat = useMemo(() => {
    const f = Array(81).fill(0);
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) f[r * 9 + c] = GIVEN[r][c];
    return f;
  }, [GIVEN]);`,
`  // A killer board prints no digits at all, so there is no given lookup to
  // build: every one of the 81 squares is the player's to fill. The constant
  // stays rather than being deleted, because the guards downstream ("is this a
  // printed clue?") are load-bearing in Suds and simply answer no here.
  const givenFlat = useMemo(() => Array(81).fill(0), []);`);

// ── 4. a cage is a fourth kind of peer ───────────────────────────────────────
sub(`  // remove a candidate from the notes of a cell's row/column/box peers
  function scrubPeerNotes(noteArr, idx, d) {
    const r = Math.floor(idx / 9), c = idx % 9, b = boxOf(r, c), m = 1 << d;
    for (let j = 0; j < 81; j++) {
      const rr = Math.floor(j / 9), cc = j % 9;
      if (rr === r || cc === c || boxOf(rr, cc) === b) { if (noteArr[j] & m) noteArr[j] = noteArr[j] & ~m; }
    }
  }`,
`  // remove a candidate from the notes of a cell's row/column/box peers, and
  // from its CAGE, which is the fourth place a digit cannot repeat
  function scrubPeerNotes(noteArr, idx, d) {
    const r = Math.floor(idx / 9), c = idx % 9, b = boxOf(r, c), k = CAGE[idx], m = 1 << d;
    for (let j = 0; j < 81; j++) {
      const rr = Math.floor(j / 9), cc = j % 9;
      if (rr === r || cc === c || boxOf(rr, cc) === b || CAGE[j] === k) { if (noteArr[j] & m) noteArr[j] = noteArr[j] & ~m; }
    }
  }`);
sub(`  const selB = sel >= 0 ? boxOf(selR, selC) : -1;`,
`  const selB = sel >= 0 ? boxOf(selR, selC) : -1;
  const selK = sel >= 0 ? CAGE[sel] : -1;

  // How much of each cage is down, so a full cage can retire its printed total
  // the way a finished digit retires its pad key. It counts EVERY entry, right
  // or wrong: greying only on a correct total would quietly mark the answer.
  const cageFilled = useMemo(() => {
    const n = SUMS.map(() => 0);
    for (let i = 0; i < 81; i++) if (cells[i]) n[CAGE[i]]++;
    return n;
  }, [cells, CAGE, SUMS]);`);

// ── 5. the board: cage tint, dashed cage outline, printed totals ─────────────
sub(`  function cellStyle(idx) {
    const r = Math.floor(idx / 9), c = idx % 9, b = boxOf(r, c);
    const isSel = idx === sel;
    const peer = sel >= 0 && !isSel && (r === selR || c === selC || b === selB);`,
`  function cellStyle(idx) {
    const r = Math.floor(idx / 9), c = idx % 9, b = boxOf(r, c);
    const isSel = idx === sel;
    const peer = sel >= 0 && !isSel && (r === selR || c === selC || b === selB || CAGE[idx] === selK);`);
sub(`    let bg = T.white;
    if (peer) bg = '#f3f5f8';
    if (sameVal) bg = '#ffe9d8';
    if (isSel) bg = '#ffd9bd';`,
`    let bg = T.white;
    if (sel >= 0 && CAGE[idx] === selK && !isSel) bg = '#f0ecfd';  // the rest of your cage, a shade stronger than a peer
    else if (peer) bg = '#f3f5f8';
    if (sameVal) bg = '#e7dffb';
    if (isSel) bg = '#d6c9f7';`);

sub(`          {/* 9×9 grid with heavy 3×3 rules */}`,
`          {/* 9×9 grid: solid rules for the sudoku, a dashed outline for each
              cage, and every cage's total printed in its top-left square */}`);
sub(`                const given = givenFlat[idx];
                const val = given || cells[idx];
                const base = cellStyle(idx);
                const cls = \`cg-cell \${given ? 'cg-given' : val ? 'cg-user' : ''}\`;`,
`                const val = cells[idx];
                const base = cellStyle(idx);
                const cls = \`cg-cell \${val ? 'cg-user' : ''}\`;
                const r = Math.floor(idx / 9), c = idx % 9, k = CAGE[idx];
                // A cage wall goes wherever the neighbour belongs to a different
                // cage, or where the grid runs out, so every cage closes.
                const wall = {
                  borderTop: r === 0 || CAGE[idx - 9] !== k ? \`1.5px dashed \${COLORS.accent}\` : 'none',
                  borderLeft: c === 0 || CAGE[idx - 1] !== k ? \`1.5px dashed \${COLORS.accent}\` : 'none',
                  borderBottom: r === 8 || CAGE[idx + 9] !== k ? \`1.5px dashed \${COLORS.accent}\` : 'none',
                  borderRight: c === 8 || CAGE[idx + 1] !== k ? \`1.5px dashed \${COLORS.accent}\` : 'none',
                };
                const sum = SUM_AT[idx];
                const cageDone = cageFilled[k] === CAGE_CELLS[k].length;`);
sub(`                    {val ? (
                      <span style={{ fontSize: 'clamp(16px, 5vw, 23px)' }}>{val}</span>
                    ) : notes[idx] ? (
                      <div className="cg-notes">
                        {Array.from({ length: 9 }).map((__, k) => (
                          <span key={k} className="cg-note">{(notes[idx] & (1 << (k + 1))) ? k + 1 : ''}</span>
                        ))}
                      </div>
                    ) : null}`,
`                    <span className="cg-wall" style={wall} aria-hidden="true" />
                    {sum ? <span className={\`cg-sum\${cageDone ? ' done' : ''}\`}>{sum}</span> : null}
                    {val ? (
                      <span style={{ fontSize: 'clamp(16px, 5vw, 23px)' }}>{val}</span>
                    ) : notes[idx] ? (
                      <div className={\`cg-notes\${sum ? ' hassum' : ''}\`}>
                        {Array.from({ length: 9 }).map((__, j) => (
                          <span key={j} className="cg-note">{(notes[idx] & (1 << (j + 1))) ? j + 1 : ''}</span>
                        ))}
                      </div>
                    ) : null}`);
sub(`          .cg-note{display:flex;align-items:center;justify-content:center;font-family:\${MONO};font-size:9px;line-height:1;color:#8a93a3;}`,
`          .cg-note{display:flex;align-items:center;justify-content:center;font-family:\${MONO};font-size:9px;line-height:1;color:#8a93a3;}
          /* the cage outline sits INSIDE the cell, inset from the solid sudoku
             rules, so the two line systems read as two systems rather than one
             muddled one. It is a sibling rather than a border on the cell
             itself, which the 3x3 rules already own. */
          .cg-wall{position:absolute;inset:3px;pointer-events:none;box-sizing:border-box;}
          .cg-sum{position:absolute;top:1px;left:3px;font-family:\${SANS};font-size:10px;line-height:1;font-weight:800;color:\${COLORS.accent};pointer-events:none;letter-spacing:-0.02em;}
          .cg-sum.done{color:#b9b3c6;}
          .cg-notes.hassum{padding-top:10px;}
          .cg-notes.hassum .cg-note{font-size:8px;}
          @media(max-width:420px){.cg-sum{font-size:8.5px;top:0;left:2px;}.cg-wall{inset:2px;}.cg-notes.hassum{padding-top:8px;}}`);

// ── 6. copy: this is a killer sudoku, and the clues are totals ───────────────
sub(`      lead="Fill every empty square so each row, each column and each 3×3 box holds the digits 1–9 with no repeats."`,
`      lead="Killer sudoku. Fill every square so each row, each column and each 3×3 box holds the digits 1–9 with no repeats, and no digit is printed to start you off."`);
sub(`        <><b>Undo</b> (or Ctrl+Z) takes back your last move. <b>Clear</b> wipes every number you have entered and leaves the printed clues.</>,`,
`        <>The <b>dashed outlines</b> are cages. The small number in a cage's corner is the <b>total of the digits inside it</b>, and <b>no digit repeats within a cage</b>. A two-square cage totalling 4 can only be 1 and 3.</>,
        <><b>Undo</b> (or Ctrl+Z) takes back your last move. <b>Clear</b> wipes the whole grid, which on a killer board means all of it.</>,`);
sub(`      knack="Wrong entries are not flagged, just like paper sudoku, so it is on you to spot them before one bad digit poisons half the grid."`,
`      knack="Start with the cages that can only be made one way: 3 in two squares is 1 and 2, 24 in three is 7, 8 and 9. Then lean on the rule that every row, column and box totals 45, so a row whose cages account for 38 leaves a 7 sitting on its own."`);
sub(`      footer="Every board has exactly one solution. Solve the whole grid and you score a perfect 10, and the faster you finish, the higher you place on the daily leaderboard. One free hint, on your first ever play, fills a correct number. Sundays are a harder Edition with fewer clues."`,
`      footer="Every board has exactly one solution and can always be reached by logic alone, never by guessing. Solve the whole grid and you score a perfect 10, and the faster you finish, the higher you place on the daily leaderboard. One free hint, on your first ever play, fills a correct number. Sundays are a harder Edition with fewer, bigger cages."`);
sub(`    say('Board cleared, back to the printed clues. Undo brings it back.');`,
`    say('Board cleared, back to the cage totals. Undo brings it back.');`);
sub(`Sunday Edition &middot; Hard</span>}`, `Sunday Edition &middot; Fewer, bigger cages</span>}`);
sub(`                <p style={{ margin: '0 0 6px' }}>Fill the grid so every row, column, and 3×3 box holds the digits 1 to 9.</p>`,
`                <p style={{ margin: '0 0 6px' }}>Killer sudoku. Fill the grid so every row, column, and 3×3 box holds the digits 1 to 9, using only the cage totals: no digit is printed to start you off.</p>`);
sub(`>The Sunday Edition — a harder grid with fewer clues.</div>`,
`>The Sunday Edition — fewer, bigger cages, and the only day with a five-square one.</div>`);
sub(`? \`Suds #\${PUZZLE.num}\${PUZZLE.sunday ? ' · Sunday' : ''} · solved in \${elapsed}\${hintBit}\${streakBit}\``,
`? \`Cages #\${PUZZLE.num}\${PUZZLE.sunday ? ' · Sunday' : ''} · solved in \${elapsed}\${hintBit}\${streakBit}\``);
sub(`? \`Suds #\${PUZZLE.num} — the daily sudoku from Mind Loft.\\n\${shareUrl()}\``,
`? \`Cages #\${PUZZLE.num} — the daily killer sudoku from Mind Loft.\\n\${shareUrl()}\``);
sub(`{countdown ? <>Next Suds in `, `{countdown ? <>Next Cages in `);
sub(`: 'A new sudoku drops at midnight Eastern.'}`, `: 'A new killer sudoku drops at midnight Eastern.'}`);
sub(`<li>Tap <b>Add</b> &mdash; the tile opens today&apos;s sudoku, every day.</li>`,
`<li>Tap <b>Add</b> &mdash; the tile opens today&apos;s killer sudoku, every day.</li>`);
sub(`The tile opens today&apos;s sudoku, every day.`, `The tile opens today&apos;s killer sudoku, every day.`);
sub(`          Suds is a free daily sudoku from Mind Loft. Each day gives you a fresh 9×9 grid with a handful of printed clues. Fill in the rest so that every row, every column, and every 3×3 box holds the digits 1 through 9 exactly once. There is always a single, logical solution &mdash; no guessing required.`,
`          Cages is a free daily killer sudoku from Mind Loft. Killer sudoku takes the printed clues away and replaces them with arithmetic: the 81 squares are divided into dashed cages, each labelled with the total of the digits inside it, and no digit repeats within a cage. Fill the grid so that every row, every column, and every 3×3 box holds the digits 1 through 9 exactly once. The board starts completely empty, and there is always a single, logical solution &mdash; no guessing required.`);
sub(`          A new puzzle drops every day at midnight Eastern, and Sundays step up to a harder Edition with fewer clues. No app, no signup &mdash; play free in your browser, keep a streak, and race the daily leaderboard. More dailies: <a href="/crux" style={{ color: COLORS.ink, fontWeight: 800 }}>Crux</a>, our clueless crossword, <a href="/tally" style={{ color: COLORS.ink, fontWeight: 800 }}>Tally</a>, our number ledger, and <a href="/span" style={{ color: COLORS.ink, fontWeight: 800 }}>Span</a>, our geography puzzle.`,
`          A new puzzle drops every day at midnight Eastern, and Sundays step up to a harder Edition with fewer, bigger cages. No app, no signup &mdash; play free in your browser, keep a streak, and race the daily leaderboard. The other two sudokus: <a href="/suds" style={{ color: COLORS.ink, fontWeight: 800 }}>Suds</a>, the classic 9×9, and <a href="/quilt" style={{ color: COLORS.ink, fontWeight: 800 }}>Quilt</a>, the jigsaw one with the boxes redrawn.`);
sub(`          // Classic sudoku: the entry is never checked against the solution here, so a`,
`          // Killer sudoku, same convention: the entry is never checked against the solution here, so a`, { optional: true });

// ── 7. the chrome ────────────────────────────────────────────────────────────
sub(`      <DailyChrome slug="suds" name="Suds" collapsed={started} />`,
`      <DailyChrome slug="cages" name="Cages" collapsed={started} />`);
sub(`          slug="suds"`, `          slug="cages"`);
sub(`          blocks={'SUDS'.split('').map((ch, i) => (`, `          blocks={'CAGES'.split('').map((ch, i) => (`);
sub(`background: i === 3 ? COLORS.accent : COLORS.ink`, `background: i === 4 ? COLORS.accent : COLORS.ink`);

// the printed-clue style has nothing left to style, so it goes rather than
// sitting in the sheet implying a cell type this game does not have
sub(`          .cg-given{font-weight:700;color:\${COLORS.ink};}
`, '');
sub(`return; // no notes on a filled/given cell`, `return; // no notes on a filled cell`);

sub(`  // player digit per cell (0 = empty; givens live in GIVEN)`, `  // player digit per cell (0 = empty; a killer board has no printed digits)`);

// whatever "Suds" is left is prose or an aria label; sweep all three casings and
// fail if the sweep finds nothing, which would mean an earlier replacement ate
// them and this guard has quietly stopped guarding anything
const leftovers = (s.match(/Suds|suds|SUDS/g) || []).length;
if (!leftovers) throw new Error('expected some Suds/suds/SUDS left to sweep');
s = s.split('SUDS').join('CAGES').split('Suds').join('Cages').split('suds').join('cages');
applied++;

// givenFlat survives on purpose (see change 1); a BARE `given` identifier would
// be a leftover read of a printed clue, which a killer board does not have.
const bare = s.split('\n')
  .map((l, i) => [i + 1, l])
  .filter(([, l]) => !l.trim().startsWith('//'))
  .filter(([, l]) => /\bgiven\b/.test(l.replace(/givenFlat/g, '')));
if (bare.length) throw new Error(`a bare \`given\` survived the fork: killer boards have none\n${bare.map(([n, l]) => `  ${n}: ${l.trim()}`).join('\n')}`);

fs.mkdirSync('app/cages', { recursive: true });
fs.writeFileSync(OUT, s);
console.log(`fork-cages-client: ${applied} replacements -> ${OUT} (${s.split('\n').length} lines)`);

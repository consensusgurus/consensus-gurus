// One-shot fork of app/suds/SudsClient.jsx into app/sando/SandoClient.jsx.
//
//   node scripts/fork-sando-client.mjs [src] [out]
//
// Sando is SANDWICH SUDOKU: Suds with a number printed outside each row and
// column giving the total of the digits between that line's 1 and its 9. The
// grid, the boxes and the printed digits are all ordinary, so this is the
// gentlest of the three sudoku forks. Doing it as a scripted transform rather
// than by hand keeps the four sudokus in step and makes the diff reviewable:
// every edit below is an exact string replacement that FAILS LOUDLY if the
// source moved under it.
//
// THE REAL CHANGES
//   1. The board grows a GUTTER. It becomes a 10x10 grid whose first row and
//      first column hold the eighteen border sums, with the 9x9 sudoku in the
//      corner. The heavy outer rule moves off the container and onto the edge
//      cells, since the container now wraps the gutters too.
//   2. The sums track the selection: the row sum and column sum for whatever
//      square you are in light up, which is most of how you read the board.
//      A line whose squares are all filled greys its sum out, the way a
//      finished digit greys its key on the pad.
//   3. Nothing about the RULES changes in code. A sandwich clue constrains
//      which digits go where, but it never makes a digit repeat, so the note
//      scrubber, the peer highlight and the win check are all untouched.
//   4. Copy: the game says plainly that it is a sandwich sudoku, and explains
//      the crusts and the filling, in the rules, the SEO prose and the metadata.
import fs from 'node:fs';

const [, , SRC = 'app/suds/SudsClient.jsx', OUT = 'app/sando/SandoClient.jsx'] = process.argv;
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
`// Sando — the daily SANDWICH SUDOKU.
//
// Sandwich sudoku is ordinary sudoku plus border sums. The number printed
// outside a row or column is the total of the digits lying strictly BETWEEN
// that line's 1 and its 9. The 1 and the 9 are the crusts and everything
// between them is the filling, so a 0 says the crusts are next to each other
// and a 35 says they sit at the two ends with all of 2–8 in between. The clue
// never says WHERE the sandwich is, which is the whole game: you work out where
// two particular digits sit before you can place anything.
//
// Each day: a 9×9 grid with a handful of printed clues and all eighteen border
// sums. Fill every empty cell 1–9 so no digit repeats in any row, column, or
// 3×3 box, and so every line's sandwich totals its printed sum. There is
// exactly one solution.`);
sub(`// Same daily plumbing as Tally/Span: banked boards gated by Eastern date on the
// server (app/suds/page.js), per-puzzle localStorage saves, /suds?p=N archive
// pinning, streaks + stats, and the shared /api/quiz/* board flow. Weekdays are
// a standard board; Sundays step up to a harder Edition with fewer clues.`,
`// Same daily plumbing as Suds, Quilt and Cages: banked boards gated by Eastern
// date on the server (app/sando/page.js), per-puzzle localStorage saves,
// /sando?p=N archive pinning, streaks + stats, and the shared /api/quiz/* board
// flow. Weekdays run 20 printed digits down to 10 on a Monday-to-Saturday ramp;
// Sundays are a harder Edition printing just six, so nearly the whole grid has
// to come out of the sandwich clues.`);

// ── 2. identity ──────────────────────────────────────────────────────────────
sub(`  accent: '#ea580c',       // Suds identity — orange
  accentSoft: '#fff5ed',`,
`  accent: '#15616b',       // Sando identity — deep teal, clear of Suds's orange,
  accentSoft: '#eaf6f7',   // Quilt's fuchsia and Cages's violet`);
sub(`const HELP_KEY = 'sot_suds_help_seen';
const STATS_KEY = 'sot_suds_stats';`,
`const HELP_KEY = 'sot_sando_help_seen';
const STATS_KEY = 'sot_sando_stats';`);
sub('export default function SudsClient(', 'export default function SandoClient(');
sub('const STORE_KEY = `sot_suds_${PUZZLE.num}`;', 'const STORE_KEY = `sot_sando_${PUZZLE.num}`;');
sub('sd-', 'sn-', { all: true });
sub('sdfade', 'snfade', { all: true });
sub('sdstamp', 'snstamp', { all: true });
sub(`box-shadow:0 2px 0 rgba(154,61,12,0.55);`, `box-shadow:0 2px 0 rgba(9,58,64,0.55);`);
sub(`.sn-pad.armed .sn-pad-n{color:#ffe0cc;}`, `.sn-pad.armed .sn-pad-n{color:#c9e6e9;}`);

// ── 3. the border sums ───────────────────────────────────────────────────────
sub(`  const GIVEN = PUZZLE.given;
  const SOL = PUZZLE.sol;`,
`  const GIVEN = PUZZLE.given;
  const SOL = PUZZLE.sol;
  // The eighteen border sums: one per row down the left, one per column across
  // the top. These are the clue set the game is named for.
  const ROW_SUMS = PUZZLE.rowSums;
  const COL_SUMS = PUZZLE.colSums;`);
sub(`  const selB = sel >= 0 ? boxOf(selR, selC) : -1;`,
`  const selB = sel >= 0 ? boxOf(selR, selC) : -1;

  // A line whose nine squares are all filled retires its sum, the way a finished
  // digit greys out its key on the pad. It counts EVERY entry, right or wrong:
  // greying only when the sandwich actually totals the clue would quietly mark
  // the answer, which classic sudoku never does.
  const lineFull = useMemo(() => {
    const rows = [], cols = [];
    for (let k = 0; k < 9; k++) {
      let r = true, c = true;
      for (let j = 0; j < 9; j++) {
        if (!(givenFlat[k * 9 + j] || cells[k * 9 + j])) r = false;
        if (!(givenFlat[j * 9 + k] || cells[j * 9 + k])) c = false;
      }
      rows.push(r); cols.push(c);
    }
    return { rows, cols };
  }, [cells, givenFlat]);`);

// ── 3b. the selection tints follow the accent ───────────────────────────────
// Easy to miss on a fork: these two hexes are Suds's ORANGE, they are written as
// literals rather than derived from COLORS.accent, and a teal game wearing them
// looks broken. It shipped that way for one deploy.
sub(`    if (sameVal) bg = '#ffe9d8';
    if (isSel) bg = '#ffd9bd';`,
`    if (sameVal) bg = '#dcedef';
    if (isSel) bg = '#bde0e4';`);

// ── 4. the board becomes a 10x10 with the sums in the gutter ────────────────
// The heavy outer rule moves off the container and onto the edge cells, because
// the container now wraps the gutters too and a border there would box in the
// clues rather than the grid.
sub(`      borderLeft: c === 0 ? 'none' : undefined,
      borderTop: r === 0 ? 'none' : undefined,`,
`      borderLeft: c === 0 ? \`2.5px solid rgba(28,30,36,0.85)\` : undefined,
      borderTop: r === 0 ? \`2.5px solid rgba(28,30,36,0.85)\` : undefined,`);
sub(`      borderRight: \`\${c % 3 === 2 && c !== 8 ? 2.5 : 1}px solid \${c % 3 === 2 && c !== 8 ? 'rgba(28,30,36,0.85)' : 'rgba(28,30,36,0.18)'}\`,
      borderBottom: \`\${r % 3 === 2 && r !== 8 ? 2.5 : 1}px solid \${r % 3 === 2 && r !== 8 ? 'rgba(28,30,36,0.85)' : 'rgba(28,30,36,0.18)'}\`,`,
`      borderRight: \`\${c % 3 === 2 ? 2.5 : 1}px solid \${c % 3 === 2 ? 'rgba(28,30,36,0.85)' : 'rgba(28,30,36,0.18)'}\`,
      borderBottom: \`\${r % 3 === 2 ? 2.5 : 1}px solid \${r % 3 === 2 ? 'rgba(28,30,36,0.85)' : 'rgba(28,30,36,0.18)'}\`,`);

sub(`          {/* 9×9 grid with heavy 3×3 rules */}
          <div style={{ maxWidth: 468, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, minmax(0, 1fr))', gridTemplateRows: 'repeat(9, minmax(0, 1fr))', aspectRatio: '1', border: \`2.5px solid rgba(28,30,36,0.85)\`, borderRadius: 4, overflow: 'hidden' }}>
              {Array.from({ length: 81 }).map((_, idx) => {`,
`          {/* 10×10: the eighteen border sums in the first row and column, the
              9×9 sudoku in the corner. The gutter tracks are narrower than a
              square so the grid still reads as the subject and the clues as the
              margin. */}
          <div style={{ maxWidth: 508, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '0.66fr repeat(9, minmax(0, 1fr))', gridTemplateRows: '0.66fr repeat(9, minmax(0, 1fr))', aspectRatio: '1' }}>
              <div className="sn-corner" aria-hidden="true" />
              {Array.from({ length: 9 }).map((_, c) => (
                <div key={\`cs\${c}\`} className={\`sn-sum sn-col\${selC === c ? ' on' : ''}\${lineFull.cols[c] ? ' done' : ''}\`}
                  title={\`Column \${c + 1}: the digits between the 1 and the 9 total \${COL_SUMS[c]}\`}>{COL_SUMS[c]}</div>
              ))}
              {Array.from({ length: 81 }).map((_, idx) => {
                const gutter = idx % 9 === 0 ? (
                  <div key={\`rs\${idx / 9}\`} className={\`sn-sum sn-row\${selR === idx / 9 ? ' on' : ''}\${lineFull.rows[idx / 9] ? ' done' : ''}\`}
                    title={\`Row \${idx / 9 + 1}: the digits between the 1 and the 9 total \${ROW_SUMS[idx / 9]}\`}>{ROW_SUMS[idx / 9]}</div>
                ) : null;`);
sub(`                return (
                  <div key={idx} className={cls} style={base}
                    onClick={() => cellClick(idx)}`,
`                return (
                  <React.Fragment key={idx}>
                  {gutter}
                  <div className={cls} style={base}
                    onClick={() => cellClick(idx)}`);
sub(`                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>`,
`                      </div>
                    ) : null}
                  </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>`);
sub(`          .sn-cell{display:flex;`,
`          .sn-corner{}
          /* the gutter: mono, tight, and leaning toward the grid it labels */
          .sn-sum{display:flex;align-items:center;justify-content:center;font-family:\${MONO};font-weight:500;font-size:clamp(9px,2.7vw,14px);color:\${COLORS.ink};box-sizing:border-box;user-select:none;line-height:1;}
          .sn-sum.sn-row{justify-content:flex-end;padding-right:5px;}
          .sn-sum.sn-col{align-items:flex-end;padding-bottom:4px;}
          .sn-sum.on{color:\${COLORS.accent};font-weight:700;background:\${COLORS.accentSoft};border-radius:4px;}
          .sn-sum.done{color:#c3c8cf;}
          .sn-cell{display:flex;`);

// ── 5. the number pad row keeps the gutter's width, or it stops lining up ────
sub(`              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, minmax(0, 1fr))', gap: 5, maxWidth: 468, margin: '16px auto 0' }}>`,
`              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, minmax(0, 1fr))', gap: 5, maxWidth: 468, margin: '16px auto 0' }}>`);

// ── 6. copy ─────────────────────────────────────────────────────────────────
sub(`      lead="Fill every empty square so each row, each column and each 3×3 box holds the digits 1–9 with no repeats."`,
`      lead="Sandwich sudoku. Fill every empty square so each row, each column and each 3×3 box holds the digits 1–9 with no repeats, and so every line's sandwich adds up to the number printed beside it."`);
sub(`        <><b>Undo</b> (or Ctrl+Z) takes back your last move. <b>Clear</b> wipes every number you have entered and leaves the printed clues.</>,`,
`        <>The numbers down the left and across the top are <b>sandwich sums</b>: the total of the digits lying <b>between the 1 and the 9</b> in that line. A <b>0</b> means the 1 and the 9 are next to each other. A <b>35</b> means they are at the two ends with everything else between them.</>,
        <><b>Undo</b> (or Ctrl+Z) takes back your last move. <b>Clear</b> wipes every number you have entered and leaves the printed clues.</>,`);
sub(`      knack="Wrong entries are not flagged, just like paper sudoku, so it is on you to spot them before one bad digit poisons half the grid."`,
`      knack="Work on the extremes first. A 0 pins the 1 and the 9 together, a 35 throws them to the two ends, and a 1, 2 or 3 leaves so few ways to make the filling that the crusts have almost nowhere to sit. Everything in the middle of the range is the hard part, so leave it."`);
sub(`      footer="Every board has exactly one solution. Solve the whole grid and you score a perfect 10, and the faster you finish, the higher you place on the daily leaderboard. One free hint, on your first ever play, fills a correct number. Sundays are a harder Edition with fewer clues."`,
`      footer="Every board has exactly one solution and can always be reached by logic alone, never by guessing. Solve the whole grid and you score a perfect 10, and the faster you finish, the higher you place on the daily leaderboard. One free hint, on your first ever play, fills a correct number. Sundays are a harder Edition printing just six digits."`);
sub(`Sunday Edition &middot; Hard</span>}`, `Sunday Edition &middot; Six clues</span>}`);
sub(`                <p style={{ margin: '0 0 6px' }}>Fill the grid so every row, column, and 3×3 box holds the digits 1 to 9.</p>`,
`                <p style={{ margin: '0 0 6px' }}>Sandwich sudoku. Fill the grid so every row, column, and 3×3 box holds the digits 1 to 9, and so the digits between each line&apos;s 1 and 9 add up to the number printed beside it.</p>`);
sub(`>The Sunday Edition — a harder grid with fewer clues.</div>`,
`>The Sunday Edition — six printed digits, against ten on the hardest weekday.</div>`);
sub(`? \`Suds #\${PUZZLE.num}\${PUZZLE.sunday ? ' · Sunday' : ''} · solved in \${elapsed}\${hintBit}\${streakBit}\``,
`? \`Sando #\${PUZZLE.num}\${PUZZLE.sunday ? ' · Sunday' : ''} · solved in \${elapsed}\${hintBit}\${streakBit}\``);
sub(`? \`Suds #\${PUZZLE.num} — the daily sudoku from Mind Loft.\\n\${shareUrl()}\``,
`? \`Sando #\${PUZZLE.num} — the daily sandwich sudoku from Mind Loft.\\n\${shareUrl()}\``);
sub(`{countdown ? <>Next Suds in `, `{countdown ? <>Next Sando in `);
sub(`: 'A new sudoku drops at midnight Eastern.'}`, `: 'A new sandwich sudoku drops at midnight Eastern.'}`);
sub(`<li>Tap <b>Add</b> &mdash; the tile opens today&apos;s sudoku, every day.</li>`,
`<li>Tap <b>Add</b> &mdash; the tile opens today&apos;s sandwich sudoku, every day.</li>`);
sub(`The tile opens today&apos;s sudoku, every day.`, `The tile opens today&apos;s sandwich sudoku, every day.`);
sub(`          Suds is a free daily sudoku from Mind Loft. Each day gives you a fresh 9×9 grid with a handful of printed clues. Fill in the rest so that every row, every column, and every 3×3 box holds the digits 1 through 9 exactly once. There is always a single, logical solution &mdash; no guessing required.`,
`          Sando is a free daily sandwich sudoku from Mind Loft. Sandwich sudoku adds one rule to the ordinary game: the number printed outside each row and column is the total of the digits lying between that line&apos;s 1 and its 9. Fill the grid so that every row, every column, and every 3×3 box holds the digits 1 through 9 exactly once, and every sandwich adds up. There is always a single, logical solution &mdash; no guessing required.`);
sub(`          A new puzzle drops every day at midnight Eastern, and Sundays step up to a harder Edition with fewer clues. No app, no signup &mdash; play free in your browser, keep a streak, and race the daily leaderboard. More dailies: <a href="/crux" style={{ color: COLORS.ink, fontWeight: 800 }}>Crux</a>, our clueless crossword, <a href="/tally" style={{ color: COLORS.ink, fontWeight: 800 }}>Tally</a>, our number ledger, and <a href="/span" style={{ color: COLORS.ink, fontWeight: 800 }}>Span</a>, our geography puzzle.`,
`          A new puzzle drops every day at midnight Eastern, and Sundays step up to a harder Edition printing just six digits. No app, no signup &mdash; play free in your browser, keep a streak, and race the daily leaderboard. The other three sudokus: <a href="/suds" style={{ color: COLORS.ink, fontWeight: 800 }}>Suds</a>, the classic 9×9, <a href="/quilt" style={{ color: COLORS.ink, fontWeight: 800 }}>Quilt</a>, the jigsaw one, and <a href="/cages" style={{ color: COLORS.ink, fontWeight: 800 }}>Cages</a>, the killer.`);

// ── 7. the chrome ────────────────────────────────────────────────────────────
sub(`      <DailyChrome slug="suds" name="Suds" collapsed={started} />`,
`      <DailyChrome slug="sando" name="Sando" collapsed={started} />`);
sub(`          slug="suds"`, `          slug="sando"`);
sub(`          blocks={'SUDS'.split('').map((ch, i) => (`, `          blocks={'SANDO'.split('').map((ch, i) => (`);
sub(`background: i === 3 ? COLORS.accent : COLORS.ink`, `background: i === 4 ? COLORS.accent : COLORS.ink`);

const leftovers = (s.match(/Suds|suds|SUDS/g) || []).length;
if (!leftovers) throw new Error('expected some Suds/suds/SUDS left to sweep');
s = s.split('SUDS').join('SANDO').split('Suds').join('Sando').split('suds').join('sando');
applied++;

if (!/ROW_SUMS/.test(s) || !/COL_SUMS/.test(s)) throw new Error('the border sums did not make it into the render');
if (/gridTemplateColumns: 'repeat\(9, minmax\(0, 1fr\)\)', gridTemplateRows/.test(s)) {
  throw new Error('the board is still a 9-column grid: the gutter edit did not land');
}

fs.mkdirSync('app/sando', { recursive: true });
fs.writeFileSync(OUT, s);
console.log(`fork-sando-client: ${applied} replacements -> ${OUT} (${s.split('\n').length} lines)`);

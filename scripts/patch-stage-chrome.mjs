// GENERIC stage-chrome conversion. One script, any daily.
//
//   node scripts/patch-stage-chrome.mjs app/suds/SudsClient.jsx suds
//
// The eighty clients are far more uniform than they look: measured across ten
// of them, the root element, the DailyChrome mount, the LoftCap block, the
// GamePanel line and the Footer line are all byte-identical or vary in one
// known way. So the chrome half of a conversion is mechanical, and only the
// BOARD half is per-game. That split is the same one the Loft rollout found,
// where the finish card templated cleanly and the play stage did not.
//
// WHAT THIS DOES NOT DO. It does not touch the board, the ladder or the
// progress hairline, because those need to know what the game counts. A game
// converted by this script alone gets the dark ground, the one-line cap, the
// strip and the panel, and its board still renders in the light palette. That
// is a REVIEW state, which is why nothing here adds a key to STAGE_GAMES.
//
// EVERY ANCHOR MUST MATCH EXACTLY ONCE, except the two marked optional, which
// are allowed to be absent but never ambiguous.
import { readFileSync, writeFileSync } from 'node:fs';

const [, , path, key] = process.argv;
if (!path || !key) throw new Error('usage: patch-stage-chrome.mjs <Client.jsx> <registry key>');
let s = readFileSync(path, 'utf8');
let n = 0;

function edit(name, anchor, replacement, { optional = false } = {}) {
  // A non-global regex returns [match, ...groups] from String.match, so its
  // LENGTH is the capture count and not the hit count. Counting that way says
  // "2" for a single match with one group, which is exactly the sort of
  // miscount this whole function exists to prevent.
  const hits = typeof anchor === 'string'
    ? s.split(anchor).length - 1
    : (s.match(new RegExp(anchor.source, anchor.flags.includes('g') ? anchor.flags : anchor.flags + 'g')) || []).length;
  if (hits === 0 && optional) { console.log(`  - ${name}: absent, skipped`); return; }
  if (hits !== 1) throw new Error(`anchor "${name}" matched ${hits} times, expected exactly 1`);
  s = s.replace(anchor, replacement);
  n += 1;
}
function countedReplace(name, re, to) {
  const hits = (s.match(re) || []).length;
  if (hits) { s = s.replace(re, to); n += 1; }
  console.log(`  · ${name}: ${hits}`);
}

// 1. imports, hung off the LoftCap import every converted client already has
edit('imports', "import LoftCap from '../LoftCap';",
  "import LoftCap from '../LoftCap';\n"
  + "import StageChrome from '../StageChrome';\n"
  + "import { isStage } from '@/lib/stage';\n"
  + "import { gameColor, RAMP_INK, STAGE_GROUND } from '@/lib/category-ramp';");

// 2. the flag and the stage's palette, beside the Loft flag they will outlive.
//    TEXT and FILL are separate names on purpose: near-black text is invisible
//    on this ground and has to move, while a near-black fill is a perfectly
//    good object on it and stays. One restyled COLORS would conflate them.
// `searchParams` is referenced directly rather than guarded with `typeof`,
// because typeof on a `const` in its TEMPORAL DEAD ZONE THROWS. It reads as a
// safe existence check and is a live bomb in any client that declares
// searchParams BELOW the Loft flag: esbuild and eslint no-undef both pass it,
// and it fails only when it runs. This codebase has shipped that bug twice.
// So the ordering is asserted here instead, and a client that does not satisfy
// it fails the build rather than the render.
const spLine = s.split('\n').findIndex((l) => /^\s*const searchParams\s*=/.test(l));
const loftLine = s.split('\n').findIndex((l) => /^\s*const LOFT\s*=/.test(l));
if (spLine < 0) throw new Error('no `const searchParams` in this client; the stage flag has nothing to read');
if (loftLine < 0) throw new Error('no `const LOFT` in this client');
if (spLine > loftLine) {
  throw new Error(
    `searchParams is declared at line ${spLine + 1}, BELOW the Loft flag at ${loftLine + 1}. `
    + 'Reading it there is a temporal dead zone: move the declaration up before converting.');
}

edit('flag', /^(\s*const LOFT = .*;)$/m,
  `$1\n`
  + `  const STAGE = isStage('${key}', searchParams);\n`
  + `  const STAGE_C = gameColor('${key}');\n`
  + `  const INK = STAGE ? '#e9edf4' : COLORS.ink;\n`
  + `  const FADED = STAGE ? '#8b95a8' : COLORS.faded;\n`
  + `  const SURF = STAGE ? 'rgba(255,255,255,0.045)' : T.white;\n`
  + `  const SURF_B = STAGE ? 'rgba(255,255,255,0.13)' : 'rgba(28,30,36,0.42)';`);

// 3. the root: the stage paints its own near-black
edit('root',
  "    <div className={LOFT ? 'loft-page' : undefined} style={{ minHeight: '100vh', background: T.surface, position: 'relative', overflowX: LOFT ? 'hidden' : undefined }}>",
  "    <div className={STAGE ? 'stage-page' : (LOFT ? 'loft-page' : undefined)}\n"
  + "      style={{ minHeight: '100vh', background: STAGE ? STAGE_GROUND : T.surface, color: STAGE ? '#e9edf4' : undefined, position: 'relative', overflowX: (STAGE || LOFT) ? 'hidden' : undefined }}>");

edit('grain', "      <Grain />", "      {!STAGE && <Grain />}", { optional: true });

// 4. DailyChrome, matched as a whole element so a one-line and a four-line
//    mount are handled the same way.
edit('dailychrome', /( *)(<DailyChrome[\s\S]*?\/>)/,
  '$1{!STAGE && (\n$1$2\n$1)}');

// 5. THE CAP SWAP, and this is the whole trick of the generic conversion:
//    StageChrome takes LoftCap's own prop names, so the call site does not
//    move. Only the component behind it changes, plus the two things LoftCap
//    never needed to know, which game this is and which board to read.
edit('capswap', "      {LOFT && (\n        <LoftCap\n",
  "      {LOFT && (\n"
  + `        <Cap gameKey="${key}" quizId={PUZZLE.quizId}\n`);
edit('capconst', /^(\s*const STAGE_C = .*;)$/m,
  `$1\n  const Cap = STAGE ? StageChrome : LoftCap;`);

// 6. the tail: a stage ends where its content ends
edit('gamepanel', /^( *)<GamePanel (self=[\s\S]*?\/>)$/m,
  '$1{/* The strip in the cap answers what this opens, without being pressed. */}\n'
  + '$1{!STAGE && <GamePanel $2}');
edit('footer', /<div style=\{\{ ([^}]*?)display: focusMode \? 'none' : 'block'([^}]*?) \}\}><Footer \/><\/div>/,
  "<div style={{ $1display: (focusMode || STAGE) ? 'none' : 'block'$2 }}><Footer /></div>");
edit('about', /(<section style=\{\{[^}]*?)display: focusMode \? 'none' : 'block'/,
  "$1display: (focusMode || STAGE) ? 'none' : 'block'", { optional: true });

// 7. TEXT colour, inline and inside the client's own CSS template. Only
//    `color:`. A `background:` of the same token is left alone on purpose.
// THE LOOKBEHIND IS LOAD-BEARING. `border-color:` ends with `color:`, so a
// bare pattern converts border colours too, which are a FILL decision and not
// a text one. Caught on Suds, where .sd-tool.on had its border quietly moved.
countedReplace('inline ink text', /(?<![-\w])color: COLORS\.ink\b/g, 'color: INK');
countedReplace('inline faded text', /(?<![-\w])color: COLORS\.faded\b/g, 'color: FADED');
countedReplace('css ink text', /(?<![-\w])color:\$\{COLORS\.ink\}/g, 'color:${INK}');
countedReplace('css faded text', /(?<![-\w])color:\$\{COLORS\.faded\}/g, 'color:${FADED}');

writeFileSync(path, s);
console.log(`patched ${n} edits in ${path}`);

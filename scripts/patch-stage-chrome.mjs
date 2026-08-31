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
  // Emitted below as `const [stageTheme] = useStageTheme()`. Same lesson as
  // gameColorLight: an emitter that does not import what it emits ships a page
  // that throws on first render, for everyone, flag or no flag.
  + "import { useStageTheme } from '@/lib/stage-theme';\n"
  + "import { gameColor, gameColorLight, RAMP_INK, STAGE_GROUND } from '@/lib/category-ramp';");
// gameColorLight is NOT optional here. STAGE_ACC below emits a call to it, and
// an emitter that does not import what it emits produces a client that throws
// ReferenceError on its FIRST RENDER, live, for every player, whether or not
// they passed ?stage=1. Thirteen pages shipped that way. esbuild parses it
// happily; only rendering the page catches it.

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
  + `  const STAGE_C = STAGE ? 'var(--stg-acc)' : gameColor('${key}');\n`
  // Published on the root so every tint on the page can derive from the
  // accent instead of hardcoding one register's version of it.
  + `  const STAGE_ACC = { '--stg-acc-dk': gameColor('${key}'), '--stg-acc-lt': gameColorLight('${key}') };\n`
  + `  const [stageTheme] = useStageTheme();\n`
  + `  const INK = STAGE ? 'var(--stg-ink,#e9edf4)' : COLORS.ink;\n`
  + `  const FADED = STAGE ? 'var(--stg-mute,#8b95a8)' : COLORS.faded;\n`
  + `  const SURF = STAGE ? 'var(--stg-surf,rgba(255,255,255,0.045))' : T.white;\n`
  + `  const SURF_B = STAGE ? 'var(--stg-line,rgba(255,255,255,0.11))' : 'rgba(28,30,36,0.42)';\n`
  // A client's identity hue. Declared for EVERY client, including the ones
  // whose COLORS has no accent key: reading a missing key yields undefined,
  // which is harmless, while declaring these per board patch would leave
  // `color: ACC` undefined on any game whose board patch did not.
  + `  const ACC = STAGE ? STAGE_C : COLORS.accent;\n`
  + `  const ACC_DEEP = STAGE ? STAGE_C : COLORS.accentDeep;\n`
  + `  const ACC_SOFT = STAGE ? 'var(--stg-line,rgba(255,255,255,0.11))' : COLORS.accentSoft;\n`
  + `  const ON_ACC = STAGE ? RAMP_INK : 'var(--white)';`);

// 3. the root: the stage paints its own near-black
// The root is matched as a LINE rather than as an exact string, because the
// clients drift in whitespace: Anon writes `'relative' , overflowX` with a
// space before the comma, and an exact anchor refuses the whole file over it.
// The guard below is what keeps that loosening honest: the line has to be the
// one we think it is, or the patch stops rather than rewriting something else.
{
  const ROOT = /^ *<div className=\{LOFT \? 'loft-page' : undefined\} style=\{\{[^\n]*\}\}>$/m;
  const hit = (s.match(ROOT) || [])[0];
  if (!hit) throw new Error('no loft-page root element in this client');
  for (const must of ['minHeight', 'T.surface', 'overflowX']) {
    if (!hit.includes(must)) {
      throw new Error(`the root line is missing ${must}, so it is not the element this patch expects: ${hit.trim()}`);
    }
  }
  edit('root', ROOT,
    "    <div className={STAGE ? 'stage-page' : (LOFT ? 'loft-page' : undefined)}\n"
    // The ground is a VARIABLE, never the STAGE_GROUND constant: a constant
    // cannot repaint when the register changes, which is what made every
    // converted game dark-only.
    + "      data-stage-theme={STAGE ? stageTheme : undefined}\n"
    + "      style={{ ...(STAGE ? STAGE_ACC : null), minHeight: '100vh', background: STAGE ? 'var(--stg-ground)' : T.surface, color: STAGE ? 'var(--stg-ink,#e9edf4)' : undefined, position: 'relative', overflowX: (STAGE || LOFT) ? 'hidden' : undefined }}>");
}

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
// 8. THE CTA RULE (owner, 2026-08-30). A surface that belongs to a category
//    takes that category's ramp step with dark ink, and that is its primary.
//    T.cta was the only mid-tone saturated fill on a stage and the only fill
//    carrying WHITE ink, which is what made it read as a button borrowed from
//    another design. Measured across the roster, seven of eight clients write
//    the start button identically, so it converts generically; a client that
//    words it differently is reported rather than silently left blue.
countedReplace('start CTA', /background: T\.cta, color: T\.white/g,
  'background: STAGE ? STAGE_C : T.cta, color: STAGE ? RAMP_INK : T.white');

// 9. THE ACCENT AS TEXT. A client's identity hue reads as an off-palette
//    stray on the stage, where the only colour is the category step. It is
//    handled here and not per game because it is the same one-line residue
//    everywhere: caught on Anon, whose gate still said "who wrote it" in book
//    cloth red, and present on Mate too. Only `color:`; a `background:` of the
//    accent is a fill and each board decides that for itself.
//
//    ACC is declared by the board patch when a game has one, so this converts
//    ONLY where that name will exist. A client with no accent has none of
//    these and the count is zero.
if (/const ACC\b/.test(s) || /COLORS\.accent/.test(s)) {
  belowDecl('ACC', /(?<![-\w])color: COLORS\.accent\b/g, 'color: ACC');
  belowDecl('ACC_DEEP', /(?<![-\w])color: COLORS\.accentDeep\b/g, 'color: ACC_DEEP');
}

// THESE REPLACEMENTS ARE SCOPE-BOUND. INK / FADED / ACC are declared inside the
// main component, and several clients define helper components ABOVE it, where
// that const is not an ancestor scope at all. Rewriting a colour up there is not
// a dead zone, it is ReferenceError: FADED is not defined, and esbuild parses it
// happily. Etch had a gallery component reading two of them.
//
// So everything below only applies after the line that declares the name.
const belowDecl = (id, re, to) => {
  const at = s.split('\n').findIndex((l) => new RegExp('^\\s*const\\s+' + id + '\\s*=').test(l));
  if (at < 0) return;
  const lines = s.split('\n');
  let hits = 0;
  for (let i = at + 1; i < lines.length; i++) {
    const next = lines[i].replace(re, to);
    if (next !== lines[i]) { hits += 1; lines[i] = next; }
  }
  s = lines.join('\n');
  n += hits;
  console.log(`  · ${id} text (below decl): ${hits}`);
};
belowDecl('INK', /(?<![-\w])color: COLORS\.ink\b/g, 'color: INK');
belowDecl('FADED', /(?<![-\w])color: COLORS\.faded\b/g, 'color: FADED');
belowDecl('INK', /(?<![-\w])color:\$\{COLORS\.ink\}/g, 'color:${INK}');
belowDecl('FADED', /(?<![-\w])color:\$\{COLORS\.faded\}/g, 'color:${FADED}');

// 10. NO LOFT CLASS ON THE STAGE.
//
//     StageChrome renders LoftCap's entire .loft-* sheet, because LoftFinish
//     carries no rules of its own and rendered as naked HTML without it. A
//     converted client has LOFT TRUE as well as STAGE, so every loft className
//     it still renders comes alive under the stage and applies LOFT LAYOUT to
//     the board: .loft-stage went display:flex with a 640px max-width and
//     collapsed .cl-panel to width 0 across the whole first batch.
//
//     ORDER IS LOAD-BEARING. The guarded form runs FIRST; run the ternary form
//     first and its own output (LOFT && !STAGE ? ...) is then re-matched by the
//     guarded rule, which yields LOFT && !STAGE && !STAGE ??. The negative
//     lookahead is the second guard against exactly that.
//
//     The root's own LOFT ? 'loft-page' is rewritten back in step 3, so it is
//     already gone and correctly untouched here.
countedReplace('loft class (guarded)',
  /className=\{LOFT && (?!!STAGE)((?:[^{}]|\{[^{}]*\})*loft-(?:[^{}]|\{[^{}]*\})*)\}/g,
  'className={LOFT && !STAGE && $1}');
countedReplace('loft class (ternary)',
  /className=\{LOFT \?((?:[^{}]|\{[^{}]*\})*loft-(?:[^{}]|\{[^{}]*\})*)\}/g,
  'className={LOFT && !STAGE ?$1}');
countedReplace('loft class (bare)', /className="(loft-[a-z0-9- ]+)"/g,
  "className={STAGE ? undefined : '$1'}");

//     Anything the three shapes above did not reach is a NEW shape, and on the
//     stage it would be live. Look at it rather than ship it.
//
//     The invariant this is protecting, checkable in the browser rather than by
//     reading, is:
//       document.querySelectorAll('.stage-page [class*="loft-"]').length === 0
//     Anything left there belongs to LoftFinish, the subtree the sheet is for.
{
  const stray = s.match(/className=\{LOFT (?!&& !STAGE)[^{}]*loft-|className="loft-/g);
  if (stray) {
    throw new Error('ungated loft className(s) left, extend step 10: ' + [...new Set(stray)].join(' | '));
  }
}

writeFileSync(path, s);
console.log(`patched ${n} edits in ${path}`);

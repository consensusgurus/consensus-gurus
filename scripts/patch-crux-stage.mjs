// Puts Crux on the dark stage, as ANCHORED EDITS against a copy taken from a
// fetch in the SAME deploy step. Never the working tree: a direct push updates
// .git without fast-forwarding the checkout, so the file on disk is stale the
// moment anything else lands, and splicing into it silently reverts whatever
// landed in between. That has cost this codebase a truncated CLAUDE.md and a
// broken ActivityFeed already.
//
// EVERY ANCHOR MUST MATCH EXACTLY ONCE. Zero means origin moved under the
// patch; two means the anchor is not specific enough and the edit would land
// twice. Both throw rather than guess.
import { readFileSync, writeFileSync } from 'node:fs';

const path = process.argv[2];
if (!path) throw new Error('usage: node scripts/patch-crux-stage.mjs <CruxClient.jsx>');
let s = readFileSync(path, 'utf8');
let n = 0;

function edit(name, anchor, replacement) {
  const hits = s.split(anchor).length - 1;
  if (hits !== 1) throw new Error(`anchor "${name}" matched ${hits} times, expected exactly 1`);
  s = s.replace(anchor, replacement);
  n += 1;
}

// 1. imports
edit('imports',
  "import LoftFinish from '../LoftFinish';",
  "import LoftFinish from '../LoftFinish';\n"
  + "import StageChrome from '../StageChrome';\n"
  + "import StageLadder from '../StageLadder';\n"
  + "import { isStage } from '@/lib/stage';\n"
  + "import { gameColor, RAMP_INK, STAGE_GROUND } from '@/lib/category-ramp';");

// 2. the flag, beside the Loft one it will eventually replace
edit('flag',
  "  const LOFT = loft || isLoft('crux');",
  "  const LOFT = loft || isLoft('crux');\n"
  + "  // THE STAGE. When it is on, this page owns its ground and its chrome\n"
  + "  // outright: no Grain, no DailyChrome, no LoftCap, no footer and no tail.\n"
  + "  // See app/StageChrome.jsx for why a daily is a sitting rather than a page.\n"
  + "  const STAGE = isStage('crux', searchParams);\n"
  + "  const STAGE_C = gameColor('crux');");

// 3. the root: the stage paints its own near-black rather than T.surface
edit('root',
  "    <div className={LOFT ? 'loft-page' : undefined} style={{ minHeight: '100vh', background: T.surface, position: 'relative', overflowX: LOFT ? 'hidden' : undefined }}>\n      <Grain />",
  "    <div className={STAGE ? 'stage-page' : (LOFT ? 'loft-page' : undefined)}\n"
  + "      style={{ minHeight: '100vh', background: STAGE ? STAGE_GROUND : T.surface, color: STAGE ? '#e9edf4' : undefined, position: 'relative', overflowX: (STAGE || LOFT) ? 'hidden' : undefined }}>\n"
  + "      {!STAGE && <Grain />}");

// 4. the two chrome bands the stage replaces
edit('dailychrome',
  "      <DailyChrome slug=\"crux\" name=\"Crux\" collapsed={started} loft={LOFT}",
  "      {!STAGE && (\n"
  + "      <DailyChrome slug=\"crux\" name=\"Crux\" collapsed={started} loft={LOFT}");
edit('dailychrome-close',
  "                { k: 'Words', v: `${PUZZLE.slots.filter((s) => g.solved[s.id]).length}/${PUZZLE.slots.length}` }]} />\n      {LOFT && (",
  "                { k: 'Words', v: `${PUZZLE.slots.filter((s) => g.solved[s.id]).length}/${PUZZLE.slots.length}` }]} />\n"
  + "      )}\n"
  + "      {LOFT && !STAGE && (");

// 5. the stage itself, in their place
edit('stagechrome',
  "      <div className=\"cx-wrap\" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>",
  "      {/* THE STRIP COMES DOWN WHILE THE CLOCK RUNS. A live figure about other\n"
  + "          people does not belong over a board being worked, which is the run's\n"
  + "          own rule about what may sit over a clock. */}\n"
  + "      {STAGE && (\n"
  + "        <StageChrome\n"
  + "          gameKey=\"crux\"\n"
  + "          name=\"Crux\"\n"
  + "          dateLabel={PUZZLE.dateLabel}\n"
  + "          sunday={PUZZLE.sunday ? 'Sunday Edition' : null}\n"
  + "          quizId={PUZZLE.quizId}\n"
  + "          scoreWord={`of ${PUZZLE.slots.length * 2}`}\n"
  + "          progress={PUZZLE.slots.length ? g.order.length / PUZZLE.slots.length : 0}\n"
  + "          stripOn={!started || !playing}\n"
  + "          figures={playing ? [\n"
  + "            { v: `${g.order.length}/${PUZZLE.slots.length}`, k: 'words' },\n"
  + "            { v: g.left, k: 'guesses left' },\n"
  + "            { v: elapsed, k: 'time' },\n"
  + "          ] : [\n"
  + "            { v: `${endScore}/${PUZZLE.slots.length * 2}`, k: 'score' },\n"
  + "            { v: `${g.order.length}/${PUZZLE.slots.length}`, k: 'words' },\n"
  + "            { v: guessesUsed, k: 'guesses' },\n"
  + "            { v: elapsed, k: 'time' },\n"
  + "          ]}\n"
  + "          ladder={<StageLadder height={44} label=\"Words\" blocks={stageBlocks} />}\n"
  + "        />\n"
  + "      )}\n"
  + "      <div className=\"cx-wrap\" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: STAGE ? '10px 38px 40px' : '18px 38px 80px', fontFamily: SANS }}>");

// 6. the ladder's blocks, derived where the game state already is
edit('blocks',
  "  const allWordsSolved = PUZZLE.slots.every((s) => g.solved[s.id]);",
  "  // THE LADDER: one rung per word, one block per category, rung length the\n"
  + "  // word's length. A word scores TWICE in Crux, once for being found and\n"
  + "  // once for being filed under the right category, so a rung fills in two\n"
  + "  // segments rather than switching on: half-lit is found but not yet placed,\n"
  + "  // which is the one thing the figures cannot say. 6 of 12 words does not\n"
  + "  // tell you that two of them are still floating.\n"
  + "  const stageBlocks = PUZZLE.categories.map((cat, ci) => ({\n"
  + "    n: cat.words.length,\n"
  + "    c: STAGE_C,\n"
  + "    on: cat.words.map((w) => PUZZLE.slots.some((s) => s.word === w && g.solved[s.id]) && g.assigned[w] !== undefined),\n"
  + "    half: cat.words.map((w) => PUZZLE.slots.some((s) => s.word === w && g.solved[s.id]) && g.assigned[w] === undefined),\n"
  + "    w: cat.words.map((w) => 0.42 + (w.length - 4) * 0.1),\n"
  + "  }));\n"
  + "  const allWordsSolved = PUZZLE.slots.every((s) => g.solved[s.id]);");

// 7. THE CTA RULE. The stage's primary takes its own category step with dark
//    ink; every other surface keeps T.cta untouched.
edit('cta',
  "                <button className=\"cl-btn\" onClick={startGame} style={{ background: T.cta, color: T.white, fontSize: 15, padding: '11px 22px' }}>Start</button>",
  "                <button className=\"cl-btn\" onClick={startGame} style={{ background: STAGE ? STAGE_C : T.cta, color: STAGE ? RAMP_INK : T.white, fontSize: 15, padding: '11px 22px' }}>Start</button>");

// 8. the tail: a stage ends where its content ends
edit('about',
  "      <section style={{ position: 'relative', display: focusMode ? 'none' : 'block', zIndex: 2, maxWidth: 640, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>",
  "      <section style={{ position: 'relative', display: (focusMode || STAGE) ? 'none' : 'block', zIndex: 2, maxWidth: 640, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>");
edit('footer',
  "      <div style={{ position: 'relative', zIndex: 2, display: focusMode ? 'none' : 'block' }}><Footer /></div>",
  "      <div style={{ position: 'relative', zIndex: 2, display: (focusMode || STAGE) ? 'none' : 'block' }}><Footer /></div>");

writeFileSync(path, s);
console.log(`patched ${n} anchors`);

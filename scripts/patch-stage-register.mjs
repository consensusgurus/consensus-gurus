#!/usr/bin/env node
// THE ELEVEN WERE DARK-ONLY IN TWO PLACES, NOT ONE.
//
// The theme attribute was the obvious miss. The other two were in the chrome
// converter's own root emission, which is worse, because every future batch
// would have inherited them:
//
//   background: STAGE ? STAGE_GROUND : ...   a CONSTANT, so the light register
//                                            could never repaint the ground
//   no --stg-acc-dk / --stg-acc-lt           so var(--stg-acc) fell through to
//                                            globals.css's generic default and
//                                            every game wore the same accent
//
// Fixed here in the converter AND back-filled onto the eleven already run
// through it, so the switch in the cap moves the ground on all of them and
// each game keeps its own category accent in both registers.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
const GAMES = process.argv.slice(3);
if (!ROOT) { console.error('usage: patch-stage-register.mjs <repo-root> [game...]'); process.exit(1); }

let TOTAL = 0;
const PENDING = new Map();
const rd = (p) => (PENDING.has(p) ? PENDING.get(p) : fs.readFileSync(path.join(ROOT, p), 'utf8'));
const wr = (p, s) => PENDING.set(p, s);
function one(src, find, repl, label) {
  const n = src.split(find).length - 1;
  if (n !== 1) throw new Error(`${label}: matched ${n}, expected 1`);
  TOTAL++;
  return src.replace(find, repl);
}

// ------------------------------------------------------------ the converter
{
  const p = 'scripts/patch-stage-chrome.mjs';
  let s = rd(p);
  s = one(s, "  + `  const STAGE_C = gameColor('${key}');\\n`",
    "  + `  const STAGE_C = STAGE ? 'var(--stg-acc)' : gameColor('${key}');\\n`\n"
    + "  // Published on the root so every tint on the page can derive from the\n"
    + "  // accent instead of hardcoding one register's version of it.\n"
    + "  + `  const STAGE_ACC = { '--stg-acc-dk': gameColor('${key}'), '--stg-acc-lt': gameColorLight('${key}') };\\n`\n"
    + "  + `  const [stageTheme] = useStageTheme();\\n`", 'converter consts');

  s = one(s, `    "    <div className={STAGE ? 'stage-page' : (LOFT ? 'loft-page' : undefined)}\\n"
    + "      style={{ minHeight: '100vh', background: STAGE ? STAGE_GROUND : T.surface, color: STAGE ? 'var(--stg-ink,#e9edf4)' : undefined, position: 'relative', overflowX: (STAGE || LOFT) ? 'hidden' : undefined }}>");`,
    `    "    <div className={STAGE ? 'stage-page' : (LOFT ? 'loft-page' : undefined)}\\n"
    // The ground is a VARIABLE, never the STAGE_GROUND constant: a constant
    // cannot repaint when the register changes, which is what made every
    // converted game dark-only.
    + "      data-stage-theme={STAGE ? stageTheme : undefined}\\n"
    + "      style={{ ...(STAGE ? STAGE_ACC : null), minHeight: '100vh', background: STAGE ? 'var(--stg-ground)' : T.surface, color: STAGE ? 'var(--stg-ink,#e9edf4)' : undefined, position: 'relative', overflowX: (STAGE || LOFT) ? 'hidden' : undefined }}>");`,
    'converter root');
  wr(p, s);
}

// --------------------------------------------------------- the eleven games
for (const game of GAMES) {
  const dir = path.join(ROOT, 'app', game);
  const name = fs.readdirSync(dir).find((f) => /^[A-Z][A-Za-z]*Client\.jsx$/.test(f));
  const rel = path.join('app', game, name);
  let s = rd(rel);

  s = one(s, `  const STAGE_C = gameColor('${game}');`,
    `  const STAGE_C = STAGE ? 'var(--stg-acc)' : gameColor('${game}');
  const STAGE_ACC = { '--stg-acc-dk': gameColor('${game}'), '--stg-acc-lt': gameColorLight('${game}') };`,
    `${game} accent`);

  s = one(s, `      style={{ minHeight: '100vh', background: STAGE ? STAGE_GROUND : T.surface,`,
    `      style={{ ...(STAGE ? STAGE_ACC : null), minHeight: '100vh', background: STAGE ? 'var(--stg-ground)' : T.surface,`,
    `${game} root`);

  // gameColorLight has to be imported; STAGE_GROUND may now be unused, but an
  // unused import is not worth a second anchor and costs nothing.
  s = one(s, `import { gameColor, RAMP_INK, STAGE_GROUND } from '@/lib/category-ramp';`,
    `import { gameColor, gameColorLight, RAMP_INK, STAGE_GROUND } from '@/lib/category-ramp';`,
    `${game} import`);

  wr(rel, s);
  console.log(`  ${game}: register wired`);
}

for (const [p, s] of PENDING) fs.writeFileSync(path.join(ROOT, p), s);
console.log(`\npatch-stage-register: ${TOTAL} edits across ${PENDING.size} files`);

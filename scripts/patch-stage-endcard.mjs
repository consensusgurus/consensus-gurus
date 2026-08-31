#!/usr/bin/env node
// THE FINISHED GAME RENDERED AS NAKED HTML ON THE STAGE, on all fifteen
// converted dailies. Found by opening a game that was already over rather than
// one mid-play, which is the whole reason to look at more than one state.
//
// Cause: LoftCap carries the ENTIRE 870-line .loft-* stylesheet in one <style>
// block, and LoftFinish depends on it. StageChrome replaces LoftCap, so on the
// stage the card renders with no rules at all: bare stacked text, run-together
// labels, no card, no table.
//
// Fix: move that block into a LoftSheet export inside LoftCap.jsx and have both
// caps render it. Not a copy, a MOVE, so the two cannot drift.
//
// Safe to render on the stage because every selector in it is scoped to a
// .loft- or .lcap- class. Verified by extracting every selector in the block:
// there is not one bare element, :root, body or * rule, so none of it can match
// a .stage-page or .stg- class.
//
// This is the interim, not the ending the stage deserves. The stage pattern's
// last rule is that the ending is a CURTAIN, and the Loft card is a white panel
// tuned for a navy page. It reads as a deliberate change of state on the dark
// register and is plainly better than raw text; the light register is where it
// will look wrong first.
//
// Also wires the THEME into the chrome converter. It was only ever added by
// hand to the first four clients, so all eleven from the batch were dark-only:
// ?theme=light did nothing and the switch in their cap moved no ground.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
const GAMES = process.argv.slice(3);
if (!ROOT) { console.error('usage: patch-stage-endcard.mjs <repo-root> [game...]'); process.exit(1); }

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

// ------------------------------------------- 1. move the sheet out of LoftCap
{
  const p = 'app/LoftCap.jsx';
  const lines = rd(p).split('\n');
  const open = lines.findIndex((l) => l.trim() === '<style>{`');
  const close = lines.findIndex((l) => l.trim() === '`}</style>');
  if (open < 0 || close < 0 || close < open) throw new Error('LoftCap: could not find the style block');
  const block = lines.slice(open, close + 1);
  // Sanity: the block must be the big one, not some small nested style tag.
  if (block.length < 600) throw new Error(`LoftCap: style block is only ${block.length} lines, expected the full sheet`);

  const rest = [...lines.slice(0, open), '      <LoftSheet />', ...lines.slice(close + 1)];
  let s = rest.join('\n');

  // The component goes at the END of the file so it cannot land inside another
  // component's body, and is exported so StageChrome can render it too.
  s += `

// THE .loft-* STYLESHEET, exported so a page that does NOT render LoftCap can
// still style what depends on it. LoftFinish is the reason: it carries no rules
// of its own for its outer card, its table or its option rows, and on the stage
// (which swaps LoftCap for StageChrome) it was rendering as naked HTML.
//
// MOVED here, never copied. Two caps rendering two copies of an 870-line sheet
// is two sheets that drift.
//
// Every selector below is scoped to a .loft- or .lcap- class, with no bare
// element, :root, body or * rule anywhere in it, which is what makes it safe to
// mount on a page whose own classes are .stage-page and .stg-*.
export function LoftSheet() {
  return (
${block.map((l) => '  ' + l).join('\n')}
  );
}
`;
  wr(p, s);
  TOTAL++;
}

// --------------------------------------- 2. StageChrome renders it as well
{
  const p = 'app/StageChrome.jsx';
  let s = rd(p);
  s = one(s, `import { useStageTheme } from '@/lib/stage-theme';`,
    `import { useStageTheme } from '@/lib/stage-theme';
// The stage swaps LoftCap out, and LoftCap was carrying the whole .loft-*
// sheet that LoftFinish depends on, so the end card rendered unstyled.
import { LoftSheet } from './LoftCap';`, 'stagechrome import');
  s = one(s, `  const [panel, setPanel] = useState(false);`,
    `  const [panel, setPanel] = useState(false);`, 'stagechrome anchor probe');
  // Mount it at the top of the returned tree, beside the cap's own sheet.
  s = one(s, `.stg-home{padding:5px 8px;}`, `.stg-home{padding:5px 8px;}`, 'stagechrome css probe');
  s = one(s, `      <div className="stg-prog">`, `      <LoftSheet />\n      <div className="stg-prog">`, 'stagechrome mount');
  wr(p, s);
}

// ------------------------------------------ 3. theme wiring for the batch
for (const game of GAMES) {
  const dir = path.join(ROOT, 'app', game);
  const name = fs.readdirSync(dir).find((f) => /^[A-Z][A-Za-z]*Client\.jsx$/.test(f));
  if (!name) throw new Error(`${game}: no client`);
  const rel = path.join('app', game, name);
  let s = rd(rel);
  if (s.includes('useStageTheme')) { console.log(`  ${game}: theme already wired`); continue; }
  s = one(s, `import { isStage } from '@/lib/stage';`,
    `import { isStage } from '@/lib/stage';
import { useStageTheme } from '@/lib/stage-theme';`, `${game} import`);
  s = one(s, `  const STAGE = isStage('${game}', searchParams);`,
    `  const STAGE = isStage('${game}', searchParams);
  // The register comes from the shared store the switch in the cap writes.
  // Resolved in an effect: the server cannot know what is stored.
  const [stageTheme] = useStageTheme();`, `${game} state`);
  s = one(s, `    <div className={STAGE ? 'stage-page' : (LOFT ? 'loft-page' : undefined)}`,
    `    <div className={STAGE ? 'stage-page' : (LOFT ? 'loft-page' : undefined)}
      data-stage-theme={STAGE ? stageTheme : undefined}`, `${game} root attr`);
  wr(rel, s);
  console.log(`  ${game}: theme wired`);
}

for (const [p, s] of PENDING) fs.writeFileSync(path.join(ROOT, p), s);
console.log(`\npatch-stage-endcard: ${TOTAL} edits across ${PENDING.size} files`);

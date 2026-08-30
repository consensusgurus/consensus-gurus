// Anon's BOARD on the dark stage. The hardest of the four archetypes, because
// every letter is rendered TWICE, once in the passage and once in its bank row,
// so the board is the widest object on the site before anything is styled.
//
// WHAT IS NOT TOUCHED, and it is most of what makes Anon work on a phone: the
// Passage/Bank half-switch, the answer stepper, the dock and the game's own
// keyboard. Anon already solved narrow, and the OS keyboard is deliberately not
// used because it resizes the viewport under the board. The stage's whole
// contribution there is removing the page header, the card and the footer.
//
// THE DOCK WAS ALREADY DARK (#0f1f2e), which is a small vindication of the
// whole direction: the one part of this board that had to work under the thumb
// was built on a dark ground long before the stage existed.
//
// Anon gives up its book-cloth red for sky, because it is a Word game and the
// stage is near-black plus the category step. The red survives on the Loft page
// and everywhere else.
import { readFileSync, writeFileSync } from 'node:fs';

const path = process.argv[2];
if (!path) throw new Error('usage: patch-anon-board.mjs <AnonClient.jsx>');
let s = readFileSync(path, 'utf8');
let n = 0;
function edit(name, anchor, replacement) {
  const hits = typeof anchor === 'string'
    ? s.split(anchor).length - 1
    : (s.match(new RegExp(anchor.source, anchor.flags.includes('g') ? anchor.flags : anchor.flags + 'g')) || []).length;
  if (hits !== 1) throw new Error(`anchor "${name}" matched ${hits} times, expected exactly 1`);
  s = s.replace(anchor, replacement);
  n += 1;
}
function countedReplace(name, re, to, expect) {
  const hits = (s.match(re) || []).length;
  if (hits !== expect) throw new Error(`"${name}" matched ${hits} times, expected ${expect}`);
  s = s.replace(re, to);
  n += 1;
  console.log(`  · ${name}: ${hits}`);
}

// 1. the accent, one name for the whole client
// ACC, ACC_DEEP, ACC_SOFT and ON_ACC are declared by patch-stage-chrome.mjs
// for every client, so they exist even on a game whose board patch is a no-op.
edit('ladder derivation',
  /^(\s*)const Cap = STAGE \? StageChrome : LoftCap;$/m,
  "$1const Cap = STAGE ? StageChrome : LoftCap;\n"
  + "$1// THE LADDER: one rung per answer, two blocks, the SPINE and the free\n"
  + "$1// bank. The spine earns its own block because its initials spell the\n"
  + "$1// author, which is the payoff and the reason to keep going.\n"
  + "$1const stageBlocks = STAGE ? [[0, PUZZLE.spine], [PUZZLE.spine, A.length]].map(([from, to]) => ({\n"
  + "$1  n: to - from,\n"
  + "$1  c: STAGE_C,\n"
  + "$1  on: A.slice(from, to).map((a) => a.c.every((i) => !!fill[i])),\n"
  + "$1  w: A.slice(from, to).map((a) => 0.38 + (a.w.length - 4) * 0.12),\n"
  + "$1})) : [];");

countedReplace('accent', /\$\{COLORS\.accent\}/g, '${ACC}', 8);
countedReplace('accentDeep', /\$\{COLORS\.accentDeep\}/g, '${ACC_DEEP}', 3);
countedReplace('accentSoft', /\$\{COLORS\.accentSoft\}/g, '${ACC_SOFT}', 4);

// 2. the light surfaces, one rule at a time. A blanket var(--white) swap would
//    also hit .an-dcell, which sits on the ALREADY dark dock and is correct.
edit('btn', ".an-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${ACC_DEEP};background:var(--white);color:${ACC_DEEP};",
  ".an-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${ACC_DEEP};background:${STAGE ? 'transparent' : 'var(--white)'};color:${STAGE ? INK : ACC_DEEP};");
edit('btn primary', ".an-btn.primary{background:${ACC};border-color:${ACC};color:var(--white);}",
  ".an-btn.primary{background:${ACC};border-color:${ACC};color:${ON_ACC};}");
edit('cell', ".an-cell{border:1px solid rgba(28,30,36,0.18);border-bottom-width:2px;border-radius:4px;background:var(--white);",
  ".an-cell{border:1px solid ${STAGE ? 'rgba(255,255,255,0.14)' : 'rgba(28,30,36,0.18)'};border-bottom-width:2px;border-radius:4px;background:${SURF};");
edit('cell on', ".an-cell.on{outline:2px solid ${ACC};outline-offset:-2px;background:#fbe4e6;}",
  ".an-cell.on{outline:2px solid ${ACC};outline-offset:-2px;background:${ACC_SOFT};}");
edit('cell miss', ".an-cell.miss{background:#fee2e2;border-color:#dc2626;color:#7f1d1d;}",
  ".an-cell.miss{background:${STAGE ? 'rgba(220,38,38,0.22)' : '#fee2e2'};border-color:#dc2626;color:${STAGE ? '#ffc9c9' : '#7f1d1d'};}");
edit('seg', ".an-seg{display:flex;border:1px solid rgba(28,30,36,0.14);",
  ".an-seg{display:flex;border:1px solid ${STAGE ? 'rgba(255,255,255,0.14)' : 'rgba(28,30,36,0.14)'};");
edit('seg button', ".an-seg button{flex:1;border:0;background:var(--white);padding:10px 0;font-family:${SANS};font-weight:800;font-size:13.5px;color:#8b93a1;cursor:pointer;}",
  ".an-seg button{flex:1;border:0;background:${STAGE ? 'rgba(255,255,255,0.06)' : 'var(--white)'};padding:10px 0;font-family:${SANS};font-weight:800;font-size:13.5px;color:${STAGE ? '#8b95a8' : '#8b93a1'};cursor:pointer;}");
edit('seg button on', ".an-seg button.on{background:${ACC};color:var(--white);}",
  ".an-seg button.on{background:${ACC};color:${ON_ACC};}");
edit('segd on', ".an-segd button.on{background:${ACC};color:var(--white);}",
  ".an-segd button.on{background:${ACC};color:${ON_ACC};}");
edit('input rail', ".an-input{position:fixed;left:0;right:0;bottom:0;z-index:40;background:#e5e8ef;",
  ".an-input{position:fixed;left:0;right:0;bottom:0;z-index:40;background:${STAGE ? '#0e131f' : '#e5e8ef'};");
edit('kb', ".an-kb{display:flex;flex-direction:column;gap:5px;background:#e5e8ef;",
  ".an-kb{display:flex;flex-direction:column;gap:5px;background:${STAGE ? '#0e131f' : '#e5e8ef'};");
edit('kb keys', ".an-kr button{flex:1;max-width:34px;height:42px;border:0;border-radius:6px;background:var(--white);font-family:${SANS};",
  ".an-kr button{flex:1;max-width:34px;height:42px;border:0;border-radius:6px;background:${STAGE ? 'rgba(255,255,255,0.09)' : 'var(--white)'};color:${INK};font-family:${SANS};");
edit('kb wide', ".an-kr button.wide{max-width:54px;font-size:11px;background:#c9cfdb;}",
  ".an-kr button.wide{max-width:54px;font-size:11px;background:${STAGE ? 'rgba(255,255,255,0.05)' : '#c9cfdb'};}");
edit('kb active', ".an-kr button:active{background:#cfd6e2;}",
  ".an-kr button:active{background:${STAGE ? 'rgba(255,255,255,0.16)' : '#cfd6e2'};}");
edit('spine blank', ".an-spine i.blank{color:#dcc6c9;background:var(--white);border-color:rgba(28,30,36,0.1);}",
  ".an-spine i.blank{color:${STAGE ? '#5a657d' : '#dcc6c9'};background:${STAGE ? 'rgba(255,255,255,0.05)' : 'var(--white)'};border-color:${STAGE ? 'rgba(255,255,255,0.12)' : 'rgba(28,30,36,0.1)'};}");
edit('spine filled', ".an-spine i{width:22px;height:28px;border-radius:4px;background:${ACC_SOFT};border:1px solid #e3b9be;",
  ".an-spine i{width:22px;height:28px;border-radius:4px;background:${ACC_SOFT};border:1px solid ${STAGE ? 'rgba(125,211,252,0.45)' : '#e3b9be'};");

// 3. the gate card
edit('gate card',
  "            <div style={{ background: T.white, border: '1px solid rgba(28,30,36,0.14)', borderRadius: 12, padding: '20px 22px', margin: '4px 0 14px' }}>",
  "            <div style={{ background: STAGE ? 'rgba(255,255,255,0.045)' : T.white, border: STAGE ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(28,30,36,0.14)', borderRadius: 12, padding: '20px 22px', margin: '4px 0 14px' }}>");

// 4. the ladder onto the cap
edit('cap props',
  "        <Cap gameKey=\"anon\" quizId={PUZZLE.quizId}\n",
  "        <Cap gameKey=\"anon\" quizId={PUZZLE.quizId}\n"
  + "          progress={N ? filledCount / N : 0}\n"
  + "          ladder={STAGE ? <StageLadder height={44} label=\"Answers\" blocks={stageBlocks} /> : null}\n");
edit('ladder import', "import StageChrome from '../StageChrome';",
  "import StageChrome from '../StageChrome';\nimport StageLadder from '../StageLadder';");

writeFileSync(path, s);
console.log(`patched ${n} edits`);

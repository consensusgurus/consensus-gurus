// Suds's BOARD on the dark stage. The chrome half is generic
// (patch-stage-chrome.mjs); this is the half that has to know what the game is.
//
// SUDS GIVES UP ITS ORANGE HERE, and that is the rule rather than a preference:
// a stage is near-black plus ONE colour, and that colour is the category's ramp
// step. Suds is Numbers, so the player's own entries, the armed pad and the
// selected cell all take mint. The orange survives everywhere else on the site,
// including the Loft page this replaces.
//
// THE GRID KEEPS ITS FOUR STATES, because on a sudoku they are the whole
// interface: plain, peer (same row, column or box), same digit elsewhere, and
// selected. Flattened to one colour the board stops being playable, so each is
// converted rather than dropped.
import { readFileSync, writeFileSync } from 'node:fs';

const path = process.argv[2];
if (!path) throw new Error('usage: patch-suds-board.mjs <SudsClient.jsx>');
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

// 1. the grid's four states
edit('cell states',
  "    let bg = T.white;\n"
  + "    if (peer) bg = '#f3f5f8';\n"
  + "    if (sameVal) bg = '#ffe9d8';\n"
  + "    if (isSel) bg = '#ffd9bd';",
  "    // Plain, peer, same digit, selected. On the stage each is a lift of the\n"
  + "    // ground rather than a tint of white, and the two that MEAN something\n"
  + "    // (your digit elsewhere, and where you are) carry the category step.\n"
  + "    let bg = STAGE ? 'rgba(255,255,255,0.04)' : T.white;\n"
  + "    if (peer) bg = STAGE ? 'rgba(255,255,255,0.075)' : '#f3f5f8';\n"
  + "    if (sameVal) bg = STAGE ? 'rgba(110,231,183,0.16)' : '#ffe9d8';\n"
  + "    if (isSel) bg = STAGE ? 'rgba(110,231,183,0.28)' : '#ffd9bd';");

edit('cell rules',
  "      boxShadow: isSel ? `inset 0 0 0 2.5px ${COLORS.accent}` : undefined,\n"
  + "      zIndex: isSel ? 1 : undefined,\n"
  + "      borderRight: `${c % 3 === 2 && c !== 8 ? 2.5 : 1}px solid ${c % 3 === 2 && c !== 8 ? 'rgba(28,30,36,0.85)' : 'rgba(28,30,36,0.18)'}`,\n"
  + "      borderBottom: `${r % 3 === 2 && r !== 8 ? 2.5 : 1}px solid ${r % 3 === 2 && r !== 8 ? 'rgba(28,30,36,0.85)' : 'rgba(28,30,36,0.18)'}`,",
  "      boxShadow: isSel ? `inset 0 0 0 2.5px ${STAGE ? STAGE_C : COLORS.accent}` : undefined,\n"
  + "      zIndex: isSel ? 1 : undefined,\n"
  + "      // The box rules have to stay the STRONGEST line on the grid, or a\n"
  + "      // sudoku loses its nine boxes and becomes an 81 cell square.\n"
  + "      borderRight: `${c % 3 === 2 && c !== 8 ? 2.5 : 1}px solid ${c % 3 === 2 && c !== 8 ? (STAGE ? 'rgba(255,255,255,0.42)' : 'rgba(28,30,36,0.85)') : (STAGE ? 'rgba(255,255,255,0.12)' : 'rgba(28,30,36,0.18)')}`,\n"
  + "      borderBottom: `${r % 3 === 2 && r !== 8 ? 2.5 : 1}px solid ${r % 3 === 2 && r !== 8 ? (STAGE ? 'rgba(255,255,255,0.42)' : 'rgba(28,30,36,0.85)') : (STAGE ? 'rgba(255,255,255,0.12)' : 'rgba(28,30,36,0.18)')}`,");

// 2. the digit pad and the tool buttons, inside the client's own CSS template
edit('user digits', ".sd-user{font-weight:500;color:${COLORS.accent};}",
  ".sd-user{font-weight:500;color:${STAGE ? STAGE_C : COLORS.accent};}");
edit('pad', "background:var(--white);font-family:${MONO};font-weight:500;color:${INK};cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative;box-shadow:0 2px 0 rgba(28,30,36,0.4);}",
  "background:${STAGE ? 'rgba(255,255,255,0.08)' : 'var(--white)'};font-family:${MONO};font-weight:500;color:${INK};cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative;box-shadow:${STAGE ? 'none' : '0 2px 0 rgba(28,30,36,0.4)'};}");
edit('pad border', ".sd-pad{width:100%;aspect-ratio:1;border-radius:9px;border:1.5px solid rgba(28,30,36,0.5);",
  ".sd-pad{width:100%;aspect-ratio:1;border-radius:9px;border:1.5px solid ${STAGE ? 'rgba(255,255,255,0.16)' : 'rgba(28,30,36,0.5)'};");
edit('pad done', ".sd-pad.done{color:#c3c8cf;box-shadow:none;background:#f4f5f7;cursor:default;}",
  ".sd-pad.done{color:${STAGE ? '#5a657d' : '#c3c8cf'};box-shadow:none;background:${STAGE ? 'rgba(255,255,255,0.03)' : '#f4f5f7'};cursor:default;}");
edit('pad armed', ".sd-pad.armed{background:${COLORS.accent};color:var(--white);border-color:${COLORS.accent};box-shadow:0 2px 0 rgba(154,61,12,0.55);}",
  ".sd-pad.armed{background:${STAGE ? STAGE_C : COLORS.accent};color:${STAGE ? RAMP_INK : 'var(--white)'};border-color:${STAGE ? STAGE_C : COLORS.accent};box-shadow:${STAGE ? 'none' : '0 2px 0 rgba(154,61,12,0.55)'};}");
edit('pad armed count', ".sd-pad.armed .sd-pad-n{color:#ffe0cc;}",
  ".sd-pad.armed .sd-pad-n{color:${STAGE ? 'rgba(8,34,46,0.65)' : '#ffe0cc'};}");
edit('tool', ".sd-tool{font-family:${SANS};font-weight:800;font-size:12.5px;border:1.5px solid rgba(28,30,36,0.35);background:var(--white);color:${INK};",
  ".sd-tool{font-family:${SANS};font-weight:800;font-size:12.5px;border:1.5px solid ${STAGE ? 'rgba(255,255,255,0.16)' : 'rgba(28,30,36,0.35)'};background:${STAGE ? 'rgba(255,255,255,0.07)' : 'var(--white)'};color:${INK};");
edit('tool on', ".sd-tool.on{background:${COLORS.ink};color:var(--white);border-color:${COLORS.ink};}",
  ".sd-tool.on{background:${STAGE ? STAGE_C : COLORS.ink};color:${STAGE ? RAMP_INK : 'var(--white)'};border-color:${STAGE ? STAGE_C : COLORS.ink};}");

// 3. the two cards. The board's card is DELETED rather than restyled: the board
//    sits on the ground, and a dark panel is only a second ground.
edit('start card',
  "          <div style={{ background: COLORS.cream, border: `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '22px', display: 'flex', flexDirection: 'column' }}>",
  "          <div style={{ background: STAGE ? 'rgba(255,255,255,0.045)' : COLORS.cream, border: STAGE ? '1px solid rgba(255,255,255,0.10)' : `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '22px', display: 'flex', flexDirection: 'column' }}>");
edit('board card',
  "        <div className={LOFT ? 'loft-card' : undefined} style={{ background: T.white, border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '13px 15px 15px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}>",
  "        <div className={(LOFT && !STAGE) ? 'loft-card' : undefined} style={STAGE\n"
  + "          ? { background: 'transparent', border: 'none', borderRadius: 0, padding: 0, boxShadow: 'none', marginBottom: 12 }\n"
  + "          : { background: T.white, border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '13px 15px 15px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}>");
edit('stat divider', "borderBottom: '1px solid rgba(28,30,36,0.18)', paddingBottom: 8, marginBottom: 12, flexWrap: 'wrap' }}>",
  "borderBottom: `1px solid ${STAGE ? 'rgba(255,255,255,0.10)' : 'rgba(28,30,36,0.18)'}`, paddingBottom: 8, marginBottom: 12, flexWrap: 'wrap' }}>");

// 4. the progress hairline and the ladder: nine blocks, one per box, sized by
//    how many cells that box started empty. It answers the question a sudoku
//    player actually holds, WHICH CORNER IS STILL A HOLE, which "31 of 56"
//    cannot.
// 4. the ladder: nine blocks, one per box, sized by how many cells that box
//    started empty. It answers the question a sudoku player actually holds,
//    WHICH CORNER IS STILL A HOLE, which "31 of 56" cannot.
//
//    IT IS DERIVED HERE, beside `Cap`, and NOT beside `FREE` where it reads
//    more naturally: FREE is a useMemo further up and `cells` is declared
//    between them, so anything placed by FREE would reference `cells` inside
//    its own temporal dead zone. That fails at RUN time while passing both
//    esbuild and eslint no-undef, which is the exact trap the Loft rollout hit.
edit('ladder blocks',
  /^(\s*)const Cap = STAGE \? StageChrome : LoftCap;$/m,
  "$1const Cap = STAGE ? StageChrome : LoftCap;\n"
  + "$1const boxOf = (i) => Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor((i % 9) / 3);\n"
  + "$1const stageBlocks = Array.from({ length: 9 }, (_, b) => {\n"
  + "$1  const inBox = FREE.filter((i) => boxOf(i) === b);\n"
  + "$1  return { n: inBox.length, c: STAGE_C, on: inBox.map((i) => !!cells[i]) };\n"
  + "$1});");

edit('cap props',
  "        <Cap gameKey=\"suds\" quizId={PUZZLE.quizId}\n",
  "        <Cap gameKey=\"suds\" quizId={PUZZLE.quizId}\n"
  + "          progress={FREE.length ? filledCount / FREE.length : 0}\n"
  + "          ladder={STAGE ? <StageLadder height={44} label=\"Boxes\" blocks={stageBlocks} /> : null}\n");
edit('ladder import', "import StageChrome from '../StageChrome';",
  "import StageChrome from '../StageChrome';\nimport StageLadder from '../StageLadder';");

writeFileSync(path, s);
console.log(`patched ${n} edits`);

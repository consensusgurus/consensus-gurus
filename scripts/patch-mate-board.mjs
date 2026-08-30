// Mate's BOARD on the dark stage. The chrome half is generic
// (patch-stage-chrome.mjs); this is the End Game archetype's half.
//
// THE CHESSBOARD IS NOT RECOLOURED, and that is a finding rather than an
// omission. The stage rule is near-black plus ONE colour family, and Mate's
// squares are already in it: LIGHT_SQ #efd9b5 sits at hue 37 and DARK_SQ
// #b58863 at 27, against End Game's ramp step #e8b43a at 42. They were chosen
// as a chessboard and they land inside the category's own family, so repainting
// them would cost the most conventional object on the site to gain nothing.
//
// THE LADDER SHOWS DEPTH AND NOTHING ELSE. This is the rule the End Game family
// makes non-negotiable: nothing may tell a player the position is lost while
// they can still play it. So a rung lights when the ply has been PLAYED, never
// when it was played correctly, and `errors` is deliberately not read here even
// though it sits in the same state object. The ladder becomes a scorecard at
// the finish, not during. Do not "improve" this by reddening a rung.
import { readFileSync, writeFileSync } from 'node:fs';

const path = process.argv[2];
if (!path) throw new Error('usage: patch-mate-board.mjs <MateClient.jsx>');
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

// 1. the two cards. The board's card is DELETED rather than restyled: the board
//    sits on the ground, and a dark panel is only a second ground.
edit('start card',
  "          <div style={{ background: COLORS.cream, border: `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '22px', display: 'flex', flexDirection: 'column' }}>",
  "          <div style={{ background: STAGE ? 'rgba(255,255,255,0.045)' : COLORS.cream, border: STAGE ? '1px solid rgba(255,255,255,0.10)' : `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '22px', display: 'flex', flexDirection: 'column' }}>");

edit('board card',
  "        <div className={LOFT ? 'loft-card' : undefined} style={{ background: T.white, border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '13px 15px 15px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}>",
  "        <div className={(LOFT && !STAGE) ? 'loft-card' : undefined} style={STAGE\n"
  + "          ? { background: 'transparent', border: 'none', borderRadius: 0, padding: 0, boxShadow: 'none', marginBottom: 12 }\n"
  + "          : { background: T.white, border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '13px 15px 15px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}>");

// 2. THE LADDER: one rung per ply, one block per move of the line. Yours run
//    full width and Black's replies half, so the shape of the line reads at a
//    glance. `moves` is declared above the Loft flag in this client, so the
//    derivation is safe here beside `Cap`; check that before moving it.
edit('ladder blocks',
  /^(\s*)const Cap = STAGE \? StageChrome : LoftCap;$/m,
  "$1const Cap = STAGE ? StageChrome : LoftCap;\n"
  + "$1// DEPTH ONLY. A rung lights when its ply has been PLAYED. `errors` is in\n"
  + "$1// scope and is deliberately not read: nothing may tell a player the round\n"
  + "$1// is lost while they can still play it.\n"
  + "$1const stageBlocks = Array.from({ length: PUZZLE.mateIn }, (_, mv) => {\n"
  + "$1  const last = mv === PUZZLE.mateIn - 1;\n"
  + "$1  const count = last ? 1 : 2;\n"
  + "$1  const first = mv * 2;\n"
  + "$1  return {\n"
  + "$1    n: count,\n"
  + "$1    c: STAGE_C,\n"
  + "$1    on: Array.from({ length: count }, (_, i) => first + i < moves.length),\n"
  + "$1    w: Array.from({ length: count }, (_, i) => ((first + i) % 2 === 0 ? 1 : 0.5)),\n"
  + "$1  };\n"
  + "$1});");

edit('cap props',
  "        <Cap gameKey=\"mate\" quizId={PUZZLE.quizId}\n",
  "        <Cap gameKey=\"mate\" quizId={PUZZLE.quizId}\n"
  + "          progress={moves.length / Math.max(1, PUZZLE.mateIn * 2 - 1)}\n"
  + "          ladder={STAGE ? <StageLadder height={44} label=\"The line\" blocks={stageBlocks} /> : null}\n");

edit('ladder import', "import StageChrome from '../StageChrome';",
  "import StageChrome from '../StageChrome';\nimport StageLadder from '../StageLadder';");

writeFileSync(path, s);
console.log(`patched ${n} edits`);

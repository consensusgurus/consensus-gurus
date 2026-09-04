// THE CAP, THE ENDING AND THE TAKEOVER OF THE OLD HEADER, for the eleven
// full-page quiz clients.
//
//   node scripts/patch-quiz-stage-cap.mjs "app/quiz/[id]/TimedMcqClient.jsx"
//
// scripts/patch-quiz-stage.mjs converts the CHROME half of any quiz client: the
// ground, the tokens, the takeover. It deliberately stops before the cap,
// because a cap has to know what the quiz COUNTS and the eighty dailies each
// answered that by hand. This script is the answer for the eleven, and it can
// be generic where the daily one could not for one reason: measured across all
// eleven, they are the SAME PAGE with a different board in the middle. Same
// `({ quizId, mobile })` signature, same `phase` machine, same `<h1>` and
// `<LeaderboardStrip>` header block written byte-identically, same
// `<QuizResultModal quiz={quiz} board={board} identity={identity}
// lastElapsed={lastElapsed} onRegister={...}>` opening line, same
// `{/* ── STATS ── */}` marker closing the play block.
//
// WHY THIS IS NOT THE DAILY CAP SWAP. A daily already mounted LoftCap, so its
// converter could swap the component behind an existing call site and move
// nothing. These eleven never went onto the Loft format (app/useQuizLoft.js
// still lists all eleven as owed), so there is no call site to swap: the cap is
// MOUNTED here, and the page's own title and leaderboard strip are gated off in
// the same edit, or the page carries its heading twice.
//
// WHAT IT READS RATHER THAN GUESSES. The score and the maximum are not inferred
// from variable names -- they are read off the client's OWN QuizResultModal,
// which is the one place in each file that has already had to say "this is the
// number, this is what it is out of" and has been right in production for
// months. Guessing them twice from two different places is how a cap ends up
// disagreeing with the end card about the same round. The one thing the modal
// cannot supply is what the quiz's items ARE CALLED, so that is the whole of
// the table below.
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

// ── WHAT EACH QUIZ COUNTS ───────────────────────────────────────────────────
// `count` is the number of ITEMS the eyebrow reports, which is not always the
// same as the score's maximum: a timed multiple-choice is out of maxPoints but
// is made of `total` questions, and reading "1200 questions" off the points
// ceiling would be a lie in the one line a reader sees before they start.
// `word` is the strip's unit. Everything else is derived.
const COUNTS = {
  TimedMcqClient:    { count: 'total',      noun: 'question', word: 'points' },
  GeoAerialClient:   { count: 'total',      noun: 'place',    word: 'points' },
  MapPlaceClient:    { count: 'total',      noun: 'place',    word: 'points' },
  GlobePlaceClient:  { count: 'total',      noun: 'place',    word: 'points' },
  LogicGameClient:   { count: 'total',      noun: 'question', word: 'correct' },
  ConnectionsBoard:  { count: 'maxPoints',  noun: 'group',    word: 'correct' },
  SurviveStateBoard: { count: 'total',      noun: 'prompt',   word: 'correct' },
  CloserBoard:       { count: 'total',      noun: 'round',    word: 'correct' },
  HigherLowerBoard:  { count: 'maxScore',   noun: 'call',     word: 'correct' },
  LogicGridClient:   { count: 'total',      noun: 'cell',     word: 'correct' },
  GridFillBoard:     { count: 'totalCells', noun: 'cell',     word: 'correct' },
};

const [, , path] = process.argv;
if (!path) throw new Error('usage: patch-quiz-stage-cap.mjs <QuizClient.jsx>');
const CLIENT = basename(path).replace(/\.jsx?$/, '');
const CFG = COUNTS[CLIENT];
if (!CFG) throw new Error(`no count table entry for ${CLIENT}; add one rather than guessing what it counts`);

let s = readFileSync(path, 'utf8');
if (!/const QSTAGE = isQuizStage\(/.test(s)) {
  throw new Error('this client has not been through patch-quiz-stage.mjs yet; the chrome pass comes first');
}
if (/<StageChrome/.test(s)) throw new Error('already has a cap; nothing to do');
let n = 0;

// Buffer every write, flush once: a run that throws half way leaves a tree that
// is neither converted nor original, and the next run then fails on an edit it
// already applied, which reads exactly like origin having moved underneath.
function hits(a) {
  return typeof a === 'string' ? s.split(a).length - 1
    : (s.match(new RegExp(a.source, a.flags.includes('g') ? a.flags : a.flags + 'g')) || []).length;
}
function edit(name, anchor, to) {
  const h = hits(anchor);
  if (h !== 1) throw new Error(`anchor "${name}" matched ${h} times, expected exactly 1`);
  s = s.replace(anchor, to);
  n += 1;
  console.log(`  + ${name}`);
}

// ── 1. READ THE ROUND OFF THE CLIENT'S OWN END CARD ─────────────────────────
// A JSX prop's value is a BALANCED BRACE EXPRESSION, not "up to the next }".
// Half of these carry an arrow function or an IIFE, and a `[^}]*` read of
// `placement={(() => { ... })()}` stops inside the arrow body and hands back a
// fragment that parses as nothing. Count depth.
function prop(name, from) {
  const at = s.indexOf(`${name}={`, from);
  if (at < 0) return null;
  let i = at + name.length + 2, d = 1;
  for (; i < s.length && d; i++) {
    const c = s[i];
    if (c === '{') d++;
    else if (c === '}') d--;
  }
  return d ? null : s.slice(at + name.length + 2, i - 1);
}
const MODAL = '<QuizResultModal quiz={quiz} board={board} identity={identity} lastElapsed={lastElapsed}';
const modalAt = s.indexOf(MODAL);
if (modalAt < 0) throw new Error('no QuizResultModal opening in the shared shape; this is not one of the eleven');
if (s.indexOf(MODAL, modalAt + 1) >= 0) throw new Error('two QuizResultModal mounts; refusing to guess which one is the ending');
const SCORE = prop('score', modalAt);
const MAX = prop('total', modalAt);
const REPLAY = prop('onPlayAgain', modalAt);
const LB = prop('leaderboard', modalAt);
for (const [k, v] of Object.entries({ score: SCORE, total: MAX, onPlayAgain: REPLAY, leaderboard: LB })) {
  if (!v) throw new Error(`could not read ${k}={...} off this client's QuizResultModal`);
}
console.log(`  · reads its round as ${SCORE} of ${MAX}, replay ${REPLAY.slice(0, 40)}${REPLAY.length > 40 ? '…' : ''}`);

// ── 2. THE OLD HEADING COMES OFF ────────────────────────────────────────────
// The cap carries the quiz's name, so the page's own <h1> is the SAME STRING
// TWICE, forty pixels apart. Two of the eleven wrap the heading in a flex row,
// so the anchor is the heading line itself and the gate goes around it in
// place; the wrapper it leaves behind is an empty flex row with no height.
edit('page heading', /^( *)(<h1 style=\{\{[^\n]*\}\}>\{quiz\.title\}<\/h1>)$/m, '$1{!QSTAGE && $2}');

// The strip is the OLD page's way into the standings. On the stage the cap's
// Rankings chip is that way in, and two entry points to one leaderboard is the
// half-conversion that reads as broken rather than as unfinished.
edit('leaderboard strip', /^( *)\{tab !== 'stats' && phase !== 'playing' && (<LeaderboardStrip[^\n]*\/>)\}$/m,
  "$1{!QSTAGE && tab !== 'stats' && phase !== 'playing' && $2}");

// ── 3. THE CAP ──────────────────────────────────────────────────────────────
// Mounted where the masthead was, which patch-quiz-stage.mjs has already gated
// off, so the two never both occupy the top of the page in either branch.
//
// THE PROGRESS BAR TAKES A FRACTION, NOT A PERCENT. LoftCap drew its bar from a
// percent and StageChrome draws it from a fraction; handing a percent to this
// one pins the hairline at 100% from the first correct answer, and a full bar
// looks like a full bar, so nothing on the page says it is wrong.
//
// THE STRIP COMES DOWN WHILE THEY PLAY. A live figure about other people is the
// one thing that should not sit over a clock, or over a keyboard on a phone.
//
// WHAT THE RANKINGS CHIP OPENS is this page's own standings, not
// DailyBoardPanel: a quiz has no registry row, no archive and no day, and two
// leaderboards for one quiz can disagree about it. The body is the client's
// own leaderboard element, read off its end card above, for the same reason.
{
  const noun = CFG.noun;
  const cat = /DEPT_LABEL/.test(s)
    ? "DEPT_LABEL[deptOf(quiz)] || quiz.category || 'Quiz'"
    : "quiz.category || 'Quiz'";
  const cap = [
    "      {/* THE CAP. Comments live above the element because a JSX comment",
    "          between attributes parses in esbuild and not in SWC, which is the",
    "          compiler that matters. See scripts/patch-quiz-stage-cap.mjs for",
    "          why the score and the maximum are read off this client's own end",
    "          card rather than inferred from the names of its variables. */}",
    '      {QSTAGE && (',
    '        <StageChrome',
    '          name={quiz.title}',
    `          cat={${cat}}`,
    `          dateLabel={\`\${${CFG.count}} \${${CFG.count} === 1 ? '${noun}' : '${noun}s'}\`}`,
    `          outcome={phase === 'done' ? (${SCORE} === ${MAX} ? 'won' : ${SCORE} > 0 ? 'part' : 'lost') : null}`,
    `          figures={phase === 'done' ? [] : [{ v: \`\${${SCORE}}/\${${MAX}}\`, k: 'Score' }]}`,
    `          progress={${MAX} ? ${SCORE} / ${MAX} : 0}`,
    '          quizId={quiz.id}',
    `          scoreWord="${CFG.word}"`,
    "          stripOn={phase !== 'playing'}",
    `          panelBody={${LB}}`,
    '        />',
    '      )}',
  ].join('\n');
  edit('cap', /^( *)\{!QSTAGE && (<div style=\{\{ position: 'relative', zIndex: 3 \}\}>[^\n]*<\/div>)\}$/m,
    (m0) => `${m0}\n${cap}`);
}

// ── 4. THE ENDING IS A CURTAIN ──────────────────────────────────────────────
// The old ending is a POP-UP over the board. The stage's is LoftFinish's
// curtain, which floods and then collapses onto the cap band, and the two
// cannot both be the ending: a modal over a curtain is two endings arguing.
//
// The pop-up is closed by its own `open` prop rather than by unmounting it,
// because that prop is the only thing in the block that is not load-bearing --
// the same element also carries the report dialog's trigger and the play-again
// handler that the rest of the file wires up. Two spellings, `open` bare and
// `open={<expr>}`, and both appear among the eleven.
{
  const bare = new RegExp('(' + MODAL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^\\n]*\\n)( *)open$', 'm');
  const expr = new RegExp('(' + MODAL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^\\n]*\\n)( *)open=\\{([^\\n]*)\\}$', 'm');
  if (hits(expr) === 1) edit('pop-up gated (expression)', expr, '$1$2open={!QSTAGE && ($3)}');
  else edit('pop-up gated (bare)', bare, '$1$2open={!QSTAGE}');
}

// THE CURTAIN GOES INSIDE THE PAGE COLUMN, as a sibling of the board, and that
// placement is STRUCTURAL rather than cosmetic. app/globals.css collapses the
// ending with
//     .stage-page.stf-collapse *:has(> .stf) > *:not(.stf) { display: none; }
// so whichever element is the DIRECT PARENT of the card is the element whose
// other children disappear. Mounted at the root it would take the cap band down
// with the board and the curtain would have nothing to collapse onto; mounted
// here, inside the page column, it hides exactly the board and the stats.
{
  const finish = [
    '        {QSTAGE && phase === \'done\' && (',
    '          <QuizLoftFinish',
    '            stage={QSTAGE}',
    '            quiz={quiz}',
    `            score={${SCORE}}`,
    `            total={${MAX}}`,
    '            elapsed={lastElapsed}',
    '            board={board}',
    '            identity={identity}',
    '            topScore={isTopScore}',
    // The client's own replay handler, verbatim. Every one of the eleven
    // spells it as an expression already (a bare identifier, an arrow, or an
    // arrow with a body that resets the board), so it needs no wrapping.
    `            onReplay={${REPLAY}}`,
    "            onJoin={() => setTab('join')}",
    '          />',
    '        )}',
    '',
  ].join('\n');
  edit('curtain', /^( *)(\{\/\* ── STATS[^\n]*\*\/\})$/m, `${finish}$1$2`);
}

// ── 5. THE IMPORT ───────────────────────────────────────────────────────────
// An emitter that does not import what it emits ships a client that throws
// ReferenceError on its FIRST render, for every reader, flag or no flag.
// esbuild parses it happily and only loading the page catches it.
if (!/import QuizLoftFinish from/.test(s)) {
  edit('QuizLoftFinish import', /^import StageChrome from '[^']*';$/m,
    "$&\nimport QuizLoftFinish from './QuizLoftFinish';");
}

writeFileSync(path, s);
console.log(`capped ${n} edits in ${path} (client key: ${CLIENT})`);

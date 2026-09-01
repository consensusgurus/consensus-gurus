// The three SHARED components the quiz stage needs, patched in place.
//
//   node scripts/patch-quiz-stage-shared.mjs
//
// StageChrome, LoftFinish and QuizLoftFinish are used by the eighty dailies as
// well as by the quiz surface, so each change here is an OPTIONAL prop that
// defaults to today's behaviour. Not one of the eighty daily call sites moves,
// which is the property that makes this safe to run against origin at any time.
//
// It exists as a script rather than as three hand edits for the reason this
// codebase keeps relearning: origin moves under a long session (three times in
// one session, once), and a change that can be RE-DERIVED from whatever origin
// currently holds can be rebased in one command, while a hand edit has to be
// remembered and reapplied. Every anchor must match exactly once, so a run
// against a moved origin fails loudly rather than landing in the wrong place.
import { readFileSync, writeFileSync } from 'node:fs';

let total = 0;
function patch(path, edits) {
  let s = readFileSync(path, 'utf8');
  // ALREADY DONE IS NOT AN ERROR. The anchors below are exactly-once, so a
  // second run would throw on an edit it had already applied -- which reads
  // exactly like origin having moved, and sends you looking for the wrong bug.
  if (edits.some(([, , , mark]) => mark && s.includes(mark))) {
    console.log(`  = ${path}: already patched, skipped`);
    return;
  }
  for (const [name, anchor, to] of edits) {
    const hits = s.split(anchor).length - 1;
    if (hits !== 1) throw new Error(`${path}: anchor "${name}" matched ${hits} times, expected exactly 1`);
    s = s.replace(anchor, to);
    total += 1;
  }
  writeFileSync(path, s);
  console.log(`  + ${path}: ${edits.length} edits`);
}

// ── StageChrome: what the Rankings chip opens ───────────────────────────────
patch('app/StageChrome.jsx', [
  ['panelBody prop', `  homeHref = '/',
  ladder = null,
}) {`,
`  homeHref = '/',
  ladder = null,
  // WHAT THE RANKINGS CHIP OPENS, when it is not a daily's board.
  //
  // The panel's whole job is "show me the standings without taking the board
  // away", and on a daily the standings are DailyBoardPanel. A QUIZ has no
  // registry row, no archive and no day: handed a null gameKey that component
  // renders "null Archive" and asks the daily API a question about a game that
  // does not exist. It also already has standings of its own, on the page the
  // reader came from, and rebuilding those here would be two leaderboards that
  // can disagree about the same quiz.
  //
  // So the caller may hand in the body. Null keeps the daily behaviour exactly,
  // which is why none of the eighty call sites moved.
  panelBody = null,
}) {`, 'panelBody = null,'],

  ['panel body', `          <div className="stg-pin">
            {/* The panel's dark styling has to follow the REGISTER, not the stage. It
                    was hardcoded, so on the light stage it drew the dark register's
                    near-white ink and pale sky tabs onto a near-white panel. */}
            <DailyBoardPanel self={gameKey} quizId={quizId} maxWidth={720} stage dark={theme !== 'light'}
              onClose={() => setPanel(false)} />
          </div>`,
`          <div className="stg-pin">
            {/* The panel's dark styling has to follow the REGISTER, not the stage. It
                    was hardcoded, so on the light stage it drew the dark register's
                    near-white ink and pale sky tabs onto a near-white panel. */}
            {panelBody || (
              <DailyBoardPanel self={gameKey} quizId={quizId} maxWidth={720} stage dark={theme !== 'light'}
                onClose={() => setPanel(false)} />
            )}
          </div>`],

  ['accent lookup', `  const colour = gameColor(gameKey);`,
`  // A caller with no registry row (a quiz) has no category step to look up, and
  // does not need one: the ACCENT IS PUBLISHED BY THE ROOT as --stg-acc-dk /
  // --stg-acc-lt and read here as var(--stg-acc), which is the whole reason
  // this component stopped declaring it. Two publishers that can disagree is
  // how the --stg-ink name collision took the cap out.
  const colour = gameKey ? gameColor(gameKey) : null;`],
]);

// ── LoftFinish: which ending, said rather than guessed ──────────────────────
patch('app/LoftFinish.jsx', [
  ['onStage prop', `  dayTiles = null,     // [{ value, label }] replacing the four day tiles
}) {`,
`  dayTiles = null,     // [{ value, label }] replacing the four day tiles
  // ON THE STAGE, SAID RATHER THAN GUESSED (2026-08-31, for the quiz stage).
  //
  // The read below infers the register from the URL, which is exactly right
  // for a daily: the stage is sitewide there, so "on unless ?stage=0" is the
  // truth. It is NOT the truth on a quiz, where the stage is still a review
  // path and the same URL test would answer "yes" on a page that is painting
  // cream. So a caller that KNOWS may say, and the URL is the fallback for the
  // eighty that do not. null means "read the URL", exactly as before.
  onStage: onStageProp = null,
}) {`, 'onStage: onStageProp = null,'],

  ['url read', `  const [onStage, setOnStage] = useState(false);
  useEffect(() => {
    try { setOnStage(new URLSearchParams(window.location.search).get('stage') !== '0'); } catch (e) { setOnStage(true); }
  }, []);`,
`  const [urlStage, setUrlStage] = useState(false);
  useEffect(() => {
    try { setUrlStage(new URLSearchParams(window.location.search).get('stage') !== '0'); } catch (e) { setUrlStage(true); }
  }, []);
  const onStage = onStageProp == null ? urlStage : !!onStageProp;`],
]);

// ── QuizLoftFinish: pass the page's own answer through ──────────────────────
patch('app/quiz/[id]/QuizLoftFinish.jsx', [
  ['stage prop', `  onReveal,
  onReplay,
  onShare,
  onJoin,
}) {`,
`  onReveal,
  onReplay,
  onShare,
  onJoin,
  // WHICH ENDING. LoftFinish decides between its own card and the stage's
  // curtain, and on a daily it decides from the URL, which is correct there
  // because the stage is sitewide. On a quiz the stage is still a review path,
  // so the page SAYS which one it is rather than letting the card guess and
  // open a curtain at the foot of a cream page. Null hands the decision back.
  stage = null,
}) {`, 'stage = null,'],

  ['pass it down', `    <LoftFinish
      title={title}`,
`    <LoftFinish
      onStage={stage}
      title={title}`],
]);

console.log(`patched ${total} edits across the shared components`);

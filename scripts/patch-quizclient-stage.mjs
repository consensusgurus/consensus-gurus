// QuizClient's own half of the stage conversion: the cap, the ladder, the
// ending, and the three things the cap now says that the page was saying for
// itself.
//
//   node scripts/patch-quiz-stage.mjs "app/quiz/[id]/QuizClient.jsx"   # first
//   node scripts/patch-quizclient-stage.mjs                            # then this
//
// WHY THIS IS NOT IN THE GENERIC CONVERTER. Everything here needs to know what
// the client COUNTS and where its ending lives, and those are the two things
// that differ between the twelve quiz clients: a name-them-all quiz counts
// answers into a `found` array, a timed multiple-choice counts questions, a
// survival board counts prompts cleared. That is the same chrome/board split
// the daily rollout found and it held for eighty games.
//
// QuizClient is the widest of the twelve: roughly a thousand quizzes render
// through it (bank, type-it, photo, matched, map, word-scramble, posters,
// logos, order-bank, photo-match, street-map), which is why it is the pilot.
import { readFileSync, writeFileSync } from 'node:fs';

const path = process.argv[2] || 'app/quiz/[id]/QuizClient.jsx';
let s = readFileSync(path, 'utf8');
let n = 0;
function edit(name, anchor, to) {
  const hits = typeof anchor === 'string'
    ? s.split(anchor).length - 1
    : (s.match(new RegExp(anchor.source, anchor.flags.includes('g') ? anchor.flags : anchor.flags + 'g')) || []).length;
  if (hits !== 1) throw new Error(`anchor "${name}" matched ${hits} times, expected exactly 1`);
  s = s.replace(anchor, to);
  n += 1;
  console.log(`  + ${name}`);
}
if (!/const QSTAGE = isQuizStage\('QuizClient'/.test(s)) {
  throw new Error('run scripts/patch-quiz-stage.mjs on this file first: there is no QSTAGE flag to hang any of this off');
}

// ── 1. the ladder component ─────────────────────────────────────────────────
edit('import', "import StageChrome from '../../StageChrome';",
  "import StageChrome from '../../StageChrome';\nimport StageLadder from '../../StageLadder';");

// ── 2. WHICH CAP. StageChrome takes LoftCap's own prop names, which is the
//      whole trick of the conversion: the call site does not move, only the
//      component behind it changes plus the things LoftCap never needed to know.
edit('cap const', "  const ON_ACC = QSTAGE ? 'var(--stg-onramp,#08222e)' : T.white;",
  "  const ON_ACC = QSTAGE ? 'var(--stg-onramp,#08222e)' : T.white;\n"
  + "  const Cap = QSTAGE ? StageChrome : LoftCap;");

// ── 3. THE LADDER: one rung per answer, lit when it is found ────────────────
//      It reports PROGRESS, NOT IDENTITY. The rungs are in slot order, which is
//      the order the board already prints, so a lit rung says nothing the board
//      does not -- the rule Crux's ladder broke by lighting rungs in the order
//      words were solved and thereby leaking which category each belonged to.
edit('ladder blocks', /^(  return \(\n    <div className=\{QSTAGE \? 'stage-page')/m,
  `  // Neutral rather than the accent: the rail sits directly under the cap's
  // progress hairline, which is already drawn in the accent, and two accented
  // graphics an inch apart read as one broken one.
  const stageBlocks = [{
    n: total,
    c: 'var(--stg-ink2,#aab5c7)',
    on: Array.from({ length: total }, (_, i) => !!found[i]),
  }];
$1`);

// ── 4. THE CAP ITSELF ───────────────────────────────────────────────────────
edit('cap', `      {LOFT && (
        <LoftCap
          name={quiz.title}
          cat={DEPT_LABEL[deptOf(quiz)] || quiz.category || 'Quiz'}
          dateLabel={\`\${total} \${total === 1 ? 'answer' : 'answers'}\`}
          outcome={ended ? (dispScore === total ? 'won' : dispScore > 0 ? 'part' : 'lost') : null}
          figures={ended ? [] : [
            { v: \`\${dispScore}/\${total}\`, k: 'Score' },
            { v: clock, k: 'Time left' },
          ]}
          progress={total ? Math.round((dispScore / total) * 100) : null}
        />
      )}`,
`      {/* THE CAP SWAP, and this is the whole trick. StageChrome takes
          LoftCap's own prop names, so the call site does not move; only the
          component behind it changes, plus the four things LoftCap never
          needed to know -- which quiz's board to read, what the ladder draws,
          when the strip comes down, and what the Rankings chip opens.

          TWO SCALES, ONE PROP NAME: LoftCap draws its bar from a PERCENT and
          StageChrome from a FRACTION, so handing the same number to both pins
          the stage hairline at 100% from the first correct answer. Caught by
          reading StageChrome rather than by looking at the page, where a full
          bar looks like a full bar.

          THE STRIP COMES DOWN WHILE THEY WORK. A live figure about other
          people is the one thing that should not sit over a clock, or over a
          keyboard on a phone.

          WHAT THE RANKINGS CHIP OPENS is this page's own standings, not
          DailyBoardPanel: a quiz has no registry row, no archive and no day,
          and two leaderboards for one quiz can disagree about it.

          The comments are HERE rather than between the attributes because a
          JSX comment inside an opening tag does not parse. */}
      {(LOFT || QSTAGE) && (
        <Cap
          name={quiz.title}
          cat={DEPT_LABEL[deptOf(quiz)] || quiz.category || 'Quiz'}
          dateLabel={\`\${total} \${total === 1 ? 'answer' : 'answers'}\`}
          outcome={ended ? (dispScore === total ? 'won' : dispScore > 0 ? 'part' : 'lost') : null}
          figures={ended ? [] : [
            { v: \`\${dispScore}/\${total}\`, k: 'Score' },
            { v: clock, k: 'Time left' },
          ]}
          progress={QSTAGE
            ? (total ? dispScore / total : 0)
            : (total ? Math.round((dispScore / total) * 100) : null)}
          quizId={quiz.id}
          scoreWord="correct"
          stripOn={!started || ended}
          ladder={QSTAGE ? <StageLadder label={total === 1 ? 'Answer' : 'Answers'} blocks={stageBlocks} /> : null}
          panelBody={QSTAGE ? fullLeaderboard : null}
        />
      )}`);

// ── 5. WHAT THE CAP NOW SAYS, so the page stops saying it twice ─────────────
//      The title, the leaderboard teaser and the inline end screen all have a
//      home in the stage's own chrome. Leaving them renders each thing twice,
//      which is the specific way a half-converted page reads as broken rather
//      than as unfinished.
edit('page title', `          {!LOFT && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(16px, 4vw, 28px)' }}>`,
`          {!LOFT && !QSTAGE && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(16px, 4vw, 28px)' }}>`);
edit('leaderboard teaser', `          {!LOFT && tab !== 'stats' && !mAppPlay && (!started || ended) && <LeaderboardStrip`,
`          {!LOFT && !QSTAGE && tab !== 'stats' && !mAppPlay && (!started || ended) && <LeaderboardStrip`);
edit('inline end screen', `        {ended && tab === 'play' && !LOFT && (() => {`,
  `        {ended && tab === 'play' && !LOFT && !QSTAGE && (() => {`);

// ── 6. THE ENDING IS A CURTAIN ──────────────────────────────────────────────
//      LoftFinish picks between its own card and StageFinish's band, and on a
//      daily it picks from the URL because the stage is sitewide there. On a
//      quiz the stage is still a review path, so the page SAYS which it is
//      rather than letting the card guess and open a curtain on a cream page.
edit('finish', `        {LOFT && ended && (
          <QuizLoftFinish
            quiz={quiz}`,
`        {(LOFT || QSTAGE) && ended && (
          <QuizLoftFinish
            stage={QSTAGE}
            quiz={quiz}`);

// ── 7. THE WAY BACK TO THE BOARD ────────────────────────────────────────────
//      A finished stage page hides its own body (app/globals.css keys that on
//      the class StageFinish owns), and 'Return to board' takes the class off.
//      This is the inverse control, and on the stage it is stf-hideboard --
//      the class globals gives room and a border to. Left as loft-showopts it
//      renders as unstyled text in the middle of a near-black page.
edit('hide board', `          {LOFT && ended && boardShown && (
            <button type="button" className="loft-showopts" onClick={() => setBoardShown(false)}>&#8630; Hide game board</button>
          )}`,
`          {(LOFT || QSTAGE) && ended && boardShown && (
            <button type="button" className={QSTAGE ? 'stf-hideboard' : 'loft-showopts'} onClick={() => setBoardShown(false)}>&#8630; Hide game board</button>
          )}`);

writeFileSync(path, s);
console.log(`patched ${n} edits in ${path}`);

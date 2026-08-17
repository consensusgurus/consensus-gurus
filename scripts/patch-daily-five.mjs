#!/usr/bin/env node
// patch-daily-five.mjs — applies the Daily Five wiring to the three files it
// touches, as ANCHORED replacements rather than as whole-file writes.
//
// WHY ANCHORED. The deploy rule in CLAUDE.md is that any file being pushed must
// be spliced into a copy taken from a fetch performed in the SAME step, never
// the working tree, which the Edit tool reads and which is stale the moment
// anything else lands. DailyStrip.jsx is 4,769 lines, so re-writing it whole
// from a copy read earlier in a session is exactly how the CLAUDE.md
// "stale-base push erases data" incidents happened. These are three insertions
// totalling a dozen lines, so they are expressed as anchor + insertion and
// applied to whatever the current origin blob is.
//
// EVERY ANCHOR MUST MATCH EXACTLY ONCE. A zero match means origin moved and the
// patch is wrong; a double match means the anchor is not specific enough and
// the patch would land twice. Both throw rather than guessing, and the script
// exits non-zero so the deploy step around it stops.
//
// Usage: node scripts/patch-daily-five.mjs <srcDir> <outDir>
//   srcDir holds the ORIGIN copies, named with slashes turned into underscores
//   (app_DailyStrip.jsx), which is how the deploy step extracts them.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const [, , SRC, OUT] = process.argv;
if (!SRC || !OUT) {
  console.error('usage: node scripts/patch-daily-five.mjs <srcDir> <outDir>');
  process.exit(2);
}

const flat = (p) => p.replace(/\//g, '_');

const PATCHES = [
  {
    // The run's own documentation, spliced into the Daily Five section rather
    // than appended to the end of the file, so the section stays one thing.
    file: 'CLAUDE.md',
    applied: '### Inside a run you get ONE end card, at the end',
    edits: [
      {
        what: 'document the in-run end card and /daily-five',
        anchor: '### Wiring is applied by `scripts/patch-daily-five.mjs`, as anchored edits',
        before: `### Inside a run you get ONE end card, at the end (owner, 2026-08-17)

A player who opts into the Daily Five must **not** be handed five ordinary end cards. Each
one is a full page of furniture: an IQ hero, rank tiles, a share bar, "up next", "easiest
leaderboard", the whole of today's slate, a popular quiz per category, a footer. Five in a
row is the same page five times, and **every one of those blocks points AWAY from the run
the player is in the middle of**.

- **During a run** (\`?five=1\`, and this game is in today's five) \`DailyEndCard\` renders
  \`runInner\` instead of \`inner\`: the verdict, where you are in the five, and one control
  (\`Next · <game>\`). Nothing else.
- **On the fifth finish** it becomes "See how the run went" and auto-advances to
  \`/daily-five\` after six seconds, with a Stay here escape.
- **\`/daily-five\`** is where the summary arrives once: the board for the five, then one
  **abridged** result card per game. Abridged means the result and nothing else, no per-game
  next-up, play-similar, share bar, archive or back-to-main, because those are page-level
  things and this is one page. It is also the run's permalink, and a half-done run renders
  honestly with the unplayed games as empty cards. \`noindex\`: every word on it is either an
  hourly leaderboard or one viewer's own results.

**THE GENERIC AUTO-ADVANCE MUST BE SUPPRESSED IN A RUN.** \`autoRun\` in \`DailyEndCard\` sends
the player to the most similar unplayed daily after 30 seconds. Inside a run that walks them
out of it and into an unrelated game, so \`autoRun\` carries \`&& !runActive\` and the run has
its own hand-off. Anything else added to that card which navigates on a timer needs the same
gate.

Two implementation notes that will bite otherwise. The run block is computed **above**
\`autoRun\` in the file, because \`autoRun\` reads \`runActive\`. And \`runComplete\` is gated on
\`combinedResolved\`: until the day's completions land, \`doneKeys\` holds only the game just
finished, so an ungated test calls a one-game run complete and bounces the player to the
summary after their first game.

\`runInner\` carries **its own stylesheet**, including \`.dec-backdrop\` and \`.dec-x\`. The end
card's styles live INSIDE \`inner\`, so a branch that renders instead of it renders unstyled,
and in modal mode loses the backdrop and the close button with it.

### The band's right edge is a rule, not decoration

The console band's ground (\`--ground\` #14264f) is DARKER than the page behind the console
(\`--accent\` #1e3a8a), and every other part of that console is defined by contrast rather than
by a border: the title band is the page colour, the cap cards are blue, the board is white.
So the band's right edge met the page navy with nothing between them and the section read as
a hole in the card. It carries \`border-right:1.5px solid #2c437c\`, the same colour it draws
its own game cards in, which is lighter than both the band and the page and so reads against
either. Dropped on a phone, where the console is full-bleed and a right rule would be a stray
line down the screen.

`,
      },
    ],
  },
  {
    file: 'app/DailyChrome.jsx',
    applied: '<DailyFiveBar slug={slug} />',
    edits: [
      {
        what: 'import the run strip',
        anchor: "import DailySlateRail from './DailySlateRail';",
        after: "\nimport DailyFiveBar from './DailyFiveBar';",
      },
      {
        what: 'mount the run strip under the rail',
        anchor: '      {!loft && <DailySlateRail current={slug} />}',
        after: `
      {/* The Daily Five run strip. Mounted HERE rather than in each game
          client, which is the whole reason this component exists: one edit puts
          it on all 63 dailies. It renders on the LOFT branch too, deliberately.
          The rail above is a browse surface and dropping it on Loft was a
          choice about where CHOOSING another daily belongs; this is navigation
          for a run already in progress, which is a different thing and belongs
          above the board. It returns null unless the page was opened with
          ?five=1 AND this game is in today's run, so on every ordinary page
          load it costs one mounted component that renders nothing and asks for
          nothing. */}
      <DailyFiveBar slug={slug} />`,
      },
    ],
  },
  {
    file: 'app/DailyStrip.jsx',
    applied: '<DailyFiveBand />',
    edits: [
      {
        what: 'import the console band',
        anchor: "import DailyTilePanel from './DailyTilePanel';",
        after: "\nimport DailyFiveBand from './DailyFiveBand';",
      },
      {
        what: 'mount the console band above the cap',
        anchor: '      <div className="dh-sbar">',
        before: `      {/* THE DAILY FIVE, above the cap and below the title band (owner,
          2026-08-17). First thing on the console, because it is the thing a
          visitor should start with, and it takes no slot away from anything:
          the cap keeps all three of its cards. Returns null on any date with no
          entry in the bank, which is the correct degrade (see lib/daily-five
          rule 4), so the console is byte-identical to before on such a day. */}
      <DailyFiveBand />
`,
      },
    ],
  },
  {
    // THE END CARD, INSIDE A RUN (owner, 2026-08-17). A player who opted into
    // the Daily Five should not be handed five full end cards: each is an IQ
    // hero, rank tiles, a share bar, "up next", "easiest leaderboard", the whole
    // of today's slate and a footer, and every one of those points AWAY from the
    // run they are in the middle of. In a run the card collapses to a verdict
    // and a Next control; the summary arrives once, at /daily-five.
    //
    // Done as a SEPARATE `runInner` chosen at the two return sites, not by
    // gating twelve sections inside a 500-line JSX tree. The existing card is
    // untouched, so nothing about the ordinary path can regress, and the run
    // card is readable on its own.
    file: 'app/DailyEndCard.jsx',
    applied: 'const cardBody = runActive ? runInner : inner;',
    edits: [
      {
        what: 'import the run roster',
        anchor: "import { isRetiredDaily, DAILY_GAME_MAP, dailyAttemptRule } from '@/lib/daily-games';",
        after: "\nimport { fiveFor, fiveHref, readFiveParam, FIVE_NAME } from '@/lib/daily-five';",
      },
      {
        what: 'run state + the hand-off countdown',
        anchor: '  useEffect(() => { setContestLive(contestIsLive()); }, []);',
        after: `
  // Is this page part of a Daily Five run? Read in an effect for the same
  // reason contestLive above is: it reads window, so evaluating it during SSR
  // and again on the client can disagree across that boundary. False for the
  // first paint, which is also the correct answer for every ordinary page.
  const [inRun, setInRun] = useState(false);
  useEffect(() => { setInRun(readFiveParam()); }, []);
  const [runSecs, setRunSecs] = useState(6);
  const [runStay, setRunStay] = useState(false);`,
      },
      {
        what: 'the run block',
        anchor: '  const doneCount = DAILY_GAMES.filter((g) => doneKeys.has(g.key)).length;',
        after: `

  // ── the Daily Five run ────────────────────────────────────────────────────
  // Computed HERE, above autoRun, because autoRun has to be suppressed inside a
  // run: it navigates to the most similar unplayed daily after 30 seconds, which
  // in a run means walking the player out of it and into an unrelated game.
  const runDay = etTodayEC();
  const runMembers = inRun ? fiveFor(runDay) : [];
  // A stale or hand-typed ?five=1 must not put a game inside a run that does not
  // contain it.
  const runActive = runMembers.length >= 2 && runMembers.includes(self);
  const runDoneKeys = runMembers.filter((k) => doneKeys.has(k));
  // Gated on combinedResolved: until the day's completions land, doneKeys holds
  // only the game just finished, so an ungated test would call a run complete on
  // its first finish and bounce the player to the summary after one game.
  const runComplete = runActive && combinedResolved && runDoneKeys.length === runMembers.length;
  const runNextKey = runActive ? (runMembers.find((k) => k !== self && !doneKeys.has(k)) || null) : null;
  const runNext = runNextKey ? DAILY_GAME_MAP[runNextKey] : null;
  const runPoints = runMembers.reduce((s, k) => {
    const p = perGameDone && perGameDone[k];
    return s + (p && !p.abandoned ? (Number(p.points) || 0) : 0);
  }, 0);
  // Finishing the fifth TAKES you to the board rather than offering it, because
  // the board is the thing the run was for. Six seconds and an escape hatch, the
  // same shape as the card's own auto-advance.
  const runAuto = runComplete && revealed && !runStay;
  useEffect(() => {
    if (!runAuto) return undefined;
    if (runSecs <= 0) {
      if (typeof window !== 'undefined') window.location.href = '/daily-five';
      return undefined;
    }
    const t = setTimeout(() => setRunSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [runAuto, runSecs]);`,
      },
      {
        what: 'suppress the generic auto-advance inside a run',
        anchor: '  const autoRun = revealed && won && completionKnown && !!nextTarget && !autoCancel;',
        replace: '  const autoRun = revealed && won && completionKnown && !!nextTarget && !autoCancel && !runActive;',
      },
      {
        what: 'the compact run card',
        anchor: '  // Confetti is a fixed, pointer-events-off overlay rendered continuously so it',
        before: `  // THE RUN CARD. Verdict, where you are in the five, and one control. It
  // carries its own styles because the card's stylesheet lives INSIDE \`inner\`
  // (including .dec-backdrop and .dec-x, which the modal wrapper below needs),
  // so a branch that renders instead of \`inner\` renders unstyled without them.
  const runInner = (
    <div className="d5e-card" style={modal ? { position: 'relative' } : undefined}>
      {modal && (
        <button type="button" className="dec-x" onClick={onClose} aria-label="Close">
          <X size={14} strokeWidth={2.6} />
        </button>
      )}
      <style>{\`
        .dec-backdrop{position:fixed;inset:0;z-index:85;background:rgba(20,22,28,0.55);display:flex;align-items:flex-start;justify-content:center;padding:24px 16px;overflow-y:auto;}
        .dec-x{position:absolute;top:9px;right:11px;width:24px;height:24px;padding:0;display:flex;align-items:center;justify-content:center;border-radius:7px;background:rgba(255,255,255,.14);border:1px solid #2c437c;color:#cfe0ff;cursor:pointer;z-index:3;}
        .d5e-card{position:relative;background:var(--ground);color:#fff;border-radius:16px;padding:0;max-width:520px;width:100%;margin:0 auto;overflow:hidden;font-family:\${SANS};}
        .d5e-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--gold);z-index:2;}
        .d5e-card.done::before{background:var(--success);}
        .d5e-cap{display:flex;align-items:center;gap:8px;padding:9px 16px;background:rgba(0,0,0,.22);}
        .d5e-mk{display:inline-flex;width:19px;height:19px;border-radius:5px;background:#fff;align-items:center;justify-content:center;flex:none;}
        .d5e-wm{font-size:11.5px;font-weight:800;letter-spacing:-.2px;}
        .d5e-wm i{font-style:normal;font-weight:500;opacity:.85;}
        .d5e-gm{margin-left:auto;font-size:9.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#9fb6e8;}
        .d5e-body{padding:17px 18px 18px;}
        .d5e-vd{display:flex;align-items:center;gap:9px;}
        .d5e-ck{display:inline-flex;color:var(--success);flex:none;}
        .d5e-ck.loss{color:#ffb3ad;}
        .d5e-tt{font-size:22px;font-weight:800;letter-spacing:-.5px;}
        .d5e-sc{margin-left:auto;font-size:13px;font-weight:700;color:#cfe0ff;font-variant-numeric:tabular-nums;}
        .d5e-eye{font-size:9px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin-top:15px;}
        .d5e-card.done .d5e-eye{color:#7ff0c0;}
        .d5e-pips{display:flex;gap:5px;margin-top:8px;}
        .d5e-pips span{flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,.17);}
        .d5e-pips span.on{background:var(--success);}
        .d5e-pips span.now{background:var(--blue-400);}
        .d5e-go{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:14px;background:var(--gold);color:#3a2a05;border-radius:10px;padding:14px 16px;font-size:13px;font-weight:800;letter-spacing:.03em;text-decoration:none;}
        .d5e-go:hover{background:#f0c65c;}
        .d5e-go.done{background:var(--success);color:#04301f;}
        .d5e-cd{font-size:11px;font-weight:700;opacity:.75;}
        .d5e-alt{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:11px;}
        .d5e-alt a,.d5e-alt button{background:none;border:0;padding:0;font-family:inherit;font-size:11px;font-weight:800;letter-spacing:.04em;color:#93aae2;text-decoration:none;cursor:pointer;}
        .d5e-alt a:hover,.d5e-alt button:hover{color:#dbe6ff;}
      \`}</style>
      <div className="d5e-cap">
        <span className="d5e-mk" aria-hidden="true"><MindLoftMark size={15} ink="#1e3a8a" accent="#2563eb" title="Mind Loft" /></span>
        <span className="d5e-wm">Mind <i>Loft</i></span>
        <span className="d5e-gm">{FIVE_NAME}</span>
      </div>
      <div className="d5e-body">
        <div className="d5e-vd">
          <span className={\`d5e-ck\${isCompleted ? '' : ' loss'}\`}>
            {isCompleted ? <CheckCircle2 size={21} strokeWidth={2.4} /> : <Flag size={19} strokeWidth={2.4} />}
          </span>
          <span className="d5e-tt">{selfName} {isCompleted ? 'done' : 'finished'}</span>
          {score ? <span className="d5e-sc">{score}</span> : null}
        </div>

        <div className="d5e-eye">
          {runComplete
            ? \`All five done \${runPoints ? \`\\u00b7 \${Math.round(runPoints * 10) / 10} pts\` : ''}\`
            : \`\${runDoneKeys.length} of \${runMembers.length} \${runPoints ? \`\\u00b7 \${Math.round(runPoints * 10) / 10} pts banked\` : ''}\`}
        </div>
        <div className="d5e-pips">
          {runMembers.map((k) => (
            <span key={k} className={doneKeys.has(k) ? 'on' : (k === runNextKey ? 'now' : '')} />
          ))}
        </div>

        {runComplete ? (
          <a className="d5e-go done" href="/daily-five">
            <Trophy size={15} strokeWidth={2.4} />
            See how the run went
            {runAuto ? <span className="d5e-cd">{runSecs > 0 ? \`\${runSecs}s\` : '\\u2026'}</span> : null}
          </a>
        ) : runNext ? (
          <a className="d5e-go" href={fiveHref(runNextKey)}>
            Next {'\\u00b7'} {runNext.name}
            <ArrowRight size={15} strokeWidth={2.6} />
          </a>
        ) : (
          <a className="d5e-go" href="/daily-five">Run summary <ArrowRight size={15} strokeWidth={2.6} /></a>
        )}

        <div className="d5e-alt">
          {runAuto ? <button type="button" onClick={() => setRunStay(true)}>Stay here</button> : null}
          {!runComplete ? <a href="/daily-five">Run summary</a> : null}
          <a href={(DAILY_GAME_MAP[self] || {}).href || \`/\${self}\`}>Leave the run</a>
        </div>
      </div>
    </div>
  );

  // Which card this render is. The ordinary path is untouched.
  const cardBody = runActive ? runInner : inner;

`,
      },
      {
        what: 'return the run card, inline',
        anchor: '    return (<>{confettiEl}{revealed ? inner : null}</>);',
        replace: '    return (<>{confettiEl}{revealed ? cardBody : null}</>);',
      },
      {
        what: 'return the run card, modal',
        anchor: '            {inner}',
        replace: '            {cardBody}',
      },
    ],
  },
  {
    file: 'app/api/quiz/daily-combined/route.js',
    applied: "const fiveKeys = searchParams.get('five')",
    edits: [
      {
        what: 'import the run roster',
        anchor: "import { GAME_PUZZLES, etTodayServer, suffixOfDate, gamesForSuffix } from '@/lib/daily-slate';",
        after: "\nimport { fiveForSuffix, FIVE_SIZE } from '@/lib/daily-five';",
      },
      {
        what: 'narrow the slate to the day\'s five',
        anchor: '  const games = gamesForSuffix(DAILY_KEYS, suffix, today);',
        replace: `  // THE DAILY FIVE IS THIS SAME BOARD OVER A FIVE-GAME SLATE (owner,
  // 2026-08-17). ?five=1 narrows the day's games to lib/daily-five's roster and
  // drops best-N to five, and that is the ENTIRE difference. Everything else
  // here runs untouched: the same scoreGame, the same ladder, the same crowd
  // recomputes, the same guest provisional, the same day freeze. That is the
  // point of doing it here rather than in a route of its own, which would have
  // meant a second copy of a comparator this file's own comments say must never
  // be copied. An unbanked date has no roster, so the flag falls through to the
  // full slate rather than returning an empty board.
  const fiveKeys = searchParams.get('five') === '1' ? fiveForSuffix(suffix) : [];
  const fiveOnly = fiveKeys.length >= 2;
  const games = gamesForSuffix(fiveOnly ? fiveKeys : DAILY_KEYS, suffix, today);`,
      },
      {
        what: 'best-N of five for a run',
        anchor: '  const dayBestN = bestNForSuffix(suffix);',
        replace: '  const dayBestN = fiveOnly ? FIVE_SIZE : bestNForSuffix(suffix);',
      },
      {
        what: 'tell the client which board it is looking at (empty payload)',
        anchor: '  const empty = { date: suffix, frozen, maxTotal, gameMax: GAME_MAX, ladder, bestN: effBestN, gameCount,',
        replace: '  const empty = { date: suffix, five: fiveOnly, frozen, maxTotal, gameMax: GAME_MAX, ladder, bestN: effBestN, gameCount,',
      },
      {
        what: 'tell the client which board it is looking at (full payload)',
        anchor: '      date: suffix,\n',
        replace: '      date: suffix,\n      // Whether this payload is the five-game run or the full slate, so a\n      // client cannot mistake one for the other when both are in flight.\n      five: fiveOnly,\n',
        once: true,
      },
    ],
  },
];

let failed = 0;
for (const p of PATCHES) {
  const src = join(SRC, flat(p.file));
  if (!existsSync(src)) { console.error(`FAIL ${p.file}: no origin copy at ${src}`); failed++; continue; }
  let text = readFileSync(src, 'utf8');
  const before = text.length;

  // IDEMPOTENT BY DESIGN. This feature ships over several pushes, so most runs
  // find some files already carrying their patch on origin. That is the normal
  // case, not an error: each entry names a string that exists ONLY once the
  // patch has landed, and a file carrying it is skipped whole. Without this the
  // second deploy reports nine failures, eight of which are "this already
  // worked", and the one real signal is lost in them.
  if (p.applied && text.indexOf(p.applied) !== -1) {
    console.log(`skip ${p.file}  already applied on origin`);
    continue;
  }

  let ok = true;
  for (const e of p.edits) {
    const hits = text.split(e.anchor).length - 1;
    if (hits !== 1) {
      console.error(`FAIL ${p.file}: anchor for "${e.what}" matched ${hits} times, expected exactly 1`);
      ok = false; failed++; continue;
    }
    if (e.after) text = text.replace(e.anchor, e.anchor + e.after);
    else if (e.before) text = text.replace(e.anchor, e.before + e.anchor);
    else if (e.replace) text = text.replace(e.anchor, e.replace);
  }
  if (!ok) continue;
  writeFileSync(join(OUT, flat(p.file)), text);
  console.log(`ok   ${p.file}  ${before} -> ${text.length} chars (+${text.length - before})`);
}

process.exit(failed ? 1 : 0);

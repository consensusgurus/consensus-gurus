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
    // Phase 3's documentation. Its own entry with its own marker, so each phase
    // is independently skippable on a re-run.
    file: 'CLAUDE.md',
    applied: 'the run branch lives in `LoftFinish.jsx`, NOT `DailyEndCard.jsx`',
    edits: [
      {
        what: 'name the mirror the run branch actually lives in',
        anchor: '**THE GENERIC AUTO-ADVANCE MUST BE SUPPRESSED IN A RUN.**',
        before: `**THE SURFACE IS \`LoftFinish\`, NOT \`DailyEndCard\`.** Every one of the 65 dailies is on the
Loft format, so the run branch lives in \`LoftFinish.jsx\`, NOT \`DailyEndCard.jsx\`. The run
card was written into \`DailyEndCard\` first and never appeared once, on any game: it is the
component everything in this file is documented against, and it is not the one on screen.
This is the fifth-mirror trap already recorded above under LoftFinish. When changing what a
player sees after a daily, change \`LoftFinish\`, and **verify on the live page rather than on
the component you edited**. \`DailyEndCard\` keeps its own copy of the run branch for any
surface still rendering it, which is why both exist.

\`LoftFinish\` is handed a display \`name\`, not a key, so the run matches on it against
\`DAILY_GAMES\` (names are unique). The branch is an EARLY RETURN placed after every hook in
the component (showAll, openArchive, browse, the IQ ceiling effect, useDailyRoster, pickCat,
and the three the run adds), so the ordinary path is untouched and rules of hooks hold. Any
hook added to that component later must go ABOVE it.

`,
      },
    ],
  },
  {
    // THE FINISH SURFACE PLAYERS ACTUALLY SEE (owner, 2026-08-17).
    //
    // The run card was written into DailyEndCard first and never appeared,
    // because every one of the 65 dailies is on the LOFT format now and renders
    // LoftFinish instead. This is the fifth-mirror trap this file already warns
    // about under "LoftFinish is a FIFTH mirror": DailyEndCard is the component
    // everything is documented against, LoftFinish is the one on screen. When
    // changing what a player sees after a daily, change THIS ONE, and check the
    // live page rather than the component you edited.
    //
    // Done as an EARLY RETURN placed after every hook (showAll, openArchive,
    // browse, the IQ ceiling effect, useDailyRoster, pickCat, and the two added
    // here), so the ordinary path below is untouched and rules of hooks hold.
    file: 'app/LoftFinish.jsx',
    applied: 'const runActive = runMembers.length >= 2',
    edits: [
      {
        what: 'imports for the run',
        anchor: "import { Brain } from 'lucide-react';",
        after: "\nimport { fiveFor, fiveHref, readFiveParam, FIVE_NAME } from '@/lib/daily-five';\nimport { DAILY_GAMES, DAILY_GAME_MAP } from '@/lib/daily-games';\nimport { fetchDailyMe, dailyMeQuery, dailyMeIdentity } from './dailyMeClient';",
      },
      {
        what: 'run state, read after mount',
        anchor: '  const [showAll, setShowAll] = useState(false);',
        after: `
  // Is this finish part of a Daily Five run? Read in an effect, never during
  // render: the server has no window and no idea what today is in Eastern, so
  // deriving either during render makes the first client paint disagree with
  // the server's. False for the first paint, which is the correct answer for
  // every ordinary finish.
  const [inRun, setInRun] = useState(false);
  const [runDay, setRunDay] = useState(null);
  const [runPer, setRunPer] = useState(null);
  useEffect(() => {
    setInRun(readFiveParam());
    try { setRunDay(new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })); }
    catch (e) { setRunDay(new Date().toISOString().slice(0, 10)); }
  }, []);
  useEffect(() => {
    if (!inRun || !runDay) return undefined;
    const { anonId, email } = dailyMeIdentity();
    if (!anonId && !email) return undefined;
    let alive = true;
    // The shared client, so this joins the request the page is already making
    // rather than adding one. { fresh: true } because the row this finish just
    // wrote is the whole point of asking.
    const load = () => {
      fetchDailyMe(dailyMeQuery({ anonId, email }), { fresh: true })
        .then((d) => { if (alive && d && d.perGame) setRunPer(d.perGame); })
        .catch(() => {});
    };
    load();
    window.addEventListener('sot:daily-updated', load);
    return () => { alive = false; window.removeEventListener('sot:daily-updated', load); };
  }, [inRun, runDay]);`,
      },
      {
        what: 'the compact run finish',
        anchor: '  return (\n    <div className="loft-back">',
        before: `  // ── the Daily Five run ────────────────────────────────────────────────────
  // LoftFinish is handed a display \`name\`, not a key, so the roster is matched
  // on it. Names are unique across the registry.
  const runSelf = (DAILY_GAMES.find((g) => g.name === name) || {}).key || null;
  const runMembers = inRun && runDay ? fiveFor(runDay) : [];
  // A stale or hand-typed ?five=1 must not put a game inside a run that does
  // not contain it.
  const runActive = runMembers.length >= 2 && !!runSelf && runMembers.includes(runSelf);
  // PLAYED, not SOLVED, and the game just finished always counts: its row may
  // not be readable yet, but the player is looking at its result.
  const runDone = new Set(runActive ? [runSelf] : []);
  if (runActive && runPer) {
    for (const [k, v] of Object.entries(runPer)) if (!(v && v.abandoned)) runDone.add(k);
  }
  const runN = runMembers.filter((k) => runDone.has(k)).length;
  // Only call a run complete once the day's completions have actually landed,
  // or the first finish of the run reports 1 of 1 and sends the player to the
  // summary after one game.
  const runComplete = runActive && !!runPer && runN === runMembers.length;
  const runNextKey = runActive ? (runMembers.find((k) => k !== runSelf && !runDone.has(k)) || null) : null;
  const runNext = runNextKey ? DAILY_GAME_MAP[runNextKey] : null;

  // IN A RUN, THIS IS THE WHOLE CARD. No IQ bar, no day tiles, no leaderboard,
  // no options grid, no browse-every-puzzle: the verdict, where you are in the
  // five, and one control. Five ordinary finishes in a row is the same page of
  // furniture five times, and every block on it points away from the run the
  // player is in the middle of. The summary arrives once, at /daily-five.
  if (runActive) {
    return (
      <div className="loft-back">
        <div className="loft-backin">
          <style>{\`
            .d5f-run{display:flex;align-items:center;gap:10px;margin:12px 0 2px;}
            .d5f-eye{font-size:9.5px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:#a98a2e;white-space:nowrap;}
            .d5f-run.done .d5f-eye{color:#15803d;}
            .d5f-pips{display:flex;gap:4px;flex:1;min-width:0;}
            .d5f-pips span{flex:1;height:6px;border-radius:3px;background:#dbe2ee;}
            .d5f-pips span.on{background:#10b981;}
            .d5f-pips span.now{background:#2563eb;}
            .d5f-alt{display:flex;align-items:center;justify-content:center;gap:18px;margin-top:14px;}
            .d5f-alt a{font-size:11.5px;font-weight:800;letter-spacing:.03em;color:#646c7a;text-decoration:none;}
            .d5f-alt a:hover{color:#0b0c0e;}
          \`}</style>
          <div className={outcome ? \`loft-res loft-res-\${outcome}\` : 'loft-res'}><b>{name ? \`\${name} \${title.charAt(0).toLowerCase()}\${title.slice(1)}\` : title}</b><s>{detail}</s></div>

          <div className={runComplete ? 'd5f-run done' : 'd5f-run'}>
            <span className="d5f-eye">{FIVE_NAME} {'\\u00b7'} {runN} of {runMembers.length}</span>
            <span className="d5f-pips">
              {runMembers.map((k) => (
                <span key={k} className={runDone.has(k) ? 'on' : (k === runNextKey ? 'now' : '')} />
              ))}
            </span>
          </div>

          {runComplete ? (
            <a className="loft-next" href="/daily-five">
              <span className="t">
                <span className="eb">Run complete</span>
                <span className="nm">See how the run went</span>
                <span className="tg">The board for all five, and every result</span>
              </span>
              <span className="go">Open</span>
            </a>
          ) : runNext ? (
            <a className="loft-next" href={fiveHref(runNextKey)}>
              <span className="t">
                <span className="eb">Next in the run {'\\u00b7'} {runN + 1} of {runMembers.length}</span>
                <span className="nm">{runNext.name}</span>
                {runNext.tag ? <span className="tg">{runNext.tag}</span> : null}
              </span>
              <span className="go">Play</span>
            </a>
          ) : null}

          <div className="d5f-alt">
            {!runComplete ? <a href="/daily-five">Run summary</a> : null}
            <a href={(DAILY_GAME_MAP[runSelf] || {}).href || \`/\${runSelf}\`}>Leave the run</a>
          </div>
        </div>
      </div>
    );
  }

`,
      },
    ],
  },
  {
    // Phase 4: finishing the fifth TAKES you to the board rather than offering
    // it (owner, 2026-08-17). Its own entry so a re-run skips it independently.
    file: 'app/LoftFinish.jsx',
    applied: 'const runAuto = runComplete',
    edits: [
      {
        what: 'countdown state',
        anchor: '  const [runPer, setRunPer] = useState(null);',
        after: '\n  const [runSecs, setRunSecs] = useState(6);\n  const [runStay, setRunStay] = useState(false);',
      },
      {
        what: 'auto-advance to the summary once the run is complete',
        anchor: '  // IN A RUN, THIS IS THE WHOLE CARD.',
        before: `  // The board is the thing the run was FOR, so completing the fifth goes there
  // rather than offering a button and waiting. Six seconds with a visible count
  // and an escape hatch, the same shape as the card's own 30s auto-advance. The
  // effect sits here rather than beside the other hooks because it reads
  // runComplete, which is computed just above; it is still unconditional, which
  // is all rules of hooks asks.
  const runAuto = runComplete && !runStay;
  useEffect(() => {
    if (!runAuto) return undefined;
    if (runSecs <= 0) {
      if (typeof window !== 'undefined') window.location.href = '/daily-five';
      return undefined;
    }
    const t = setTimeout(() => setRunSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [runAuto, runSecs]);

`,
      },
      {
        what: 'show the countdown and the escape',
        anchor: `                <span className="nm">See how the run went</span>
                <span className="tg">The board for all five, and every result</span>
              </span>
              <span className="go">Open</span>`,
        replace: `                <span className="nm">See how the run went</span>
                <span className="tg">The board for all five, and every result</span>
              </span>
              <span className="go">{runAuto ? (runSecs > 0 ? \`Opening in \${runSecs}s\` : 'Opening\\u2026') : 'Open'}</span>`,
      },
      {
        what: 'the escape hatch beside Leave the run',
        anchor: `            {!runComplete ? <a href="/daily-five">Run summary</a> : null}`,
        replace: `            {!runComplete ? <a href="/daily-five">Run summary</a> : null}
            {runAuto ? <a href="#" onClick={(e) => { e.preventDefault(); setRunStay(true); }}>Stay here</a> : null}`,
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
  // CHAIN, don't clobber. Two entries may name the same file (CLAUDE.md gains a
  // section per phase of this feature), so a later one reads the earlier one's
  // OUTPUT where there is one. Reading SRC every time silently threw away the
  // first entry's work whenever both happened to be unapplied.
  const out = join(OUT, flat(p.file));
  const src = existsSync(out) ? out : join(SRC, flat(p.file));
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

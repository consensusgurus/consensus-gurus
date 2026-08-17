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
    file: 'app/DailyChrome.jsx',
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
    file: 'app/api/quiz/daily-combined/route.js',
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
  let ok = true;
  for (const e of p.edits) {
    const hits = text.split(e.anchor).length - 1;
    if (hits !== 1) {
      console.error(`FAIL ${p.file}: anchor for "${e.what}" matched ${hits} times, expected exactly 1`);
      ok = false; failed++; continue;
    }
    // Refuse to apply a patch twice: if the insertion is already present the
    // origin blob already carries this change and re-applying would duplicate
    // it. Cheap guard, and the one that makes a re-run of a half-finished
    // deploy safe.
    const marker = (e.after || e.before || e.replace || '').trim().split('\n')[0];
    if (marker && e.anchor.indexOf(marker) === -1 && text.indexOf(marker) !== -1) {
      console.error(`FAIL ${p.file}: "${e.what}" appears to be applied already`);
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

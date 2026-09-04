#!/usr/bin/env node
// THE DAY'S FIELD IS EVERYONE WHO PLAYED (owner, 2026-09-04).
//
// The cap read "#23/132 rank today" while the board three screens below read
// "Top 10 of 140 players", on one page load. Both true, and they measure
// different things, which is exactly the failure the same day's Gauntlet fix
// was about: two counts of one thing on one screen read as one broken count.
//
//   140  /api/quiz/totals -> todayPlayers: distinct players with ANY row filed
//        since ET midnight, guests included.
//   132  /api/quiz/daily-status -> dayField: distinct players whose IQ GAINED
//        today is above zero.
//
// The gap is everyone who played and banked nothing -- an abandoned run, a
// scoreless one -- plus the rows computeXp skips outright (it drops any row
// with total <= 0, so those players never enter its map at all). Deriving the
// field from the xp pass therefore CANNOT be made to agree with the board, and
// the fix is to count it off the same raw rows the board counts, by the same
// rule, so the two can never diverge again.
//
// It goes in dailyStandingCached because that is already memoized on the row
// set plus the ET day start, so the extra pass is paid once per row set rather
// than per request. And the denominator has to be the wide one on its own
// merits: the rank inside it is the registered board's number, and printing a
// narrow rank against the whole pool is the rule every "#N of M" on this site
// already follows.
//
//   node scripts/patch-day-field-counts-everyone.mjs <repo-root>

import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2];
if (!root) { console.error('usage: patch-day-field-counts-everyone.mjs <repo-root>'); process.exit(1); }

let cur = null; let src = ''; let n = 0;

function open(rel) {
  if (cur) fs.writeFileSync(cur, src);
  cur = path.join(root, rel);
  src = fs.readFileSync(cur, 'utf8');
  console.log(`\n${rel}`);
}
function close() { if (cur) fs.writeFileSync(cur, src); cur = null; }

function edit(label, anchor, build) {
  const hits = src.split(anchor).length - 1;
  if (hits !== 1) throw new Error(`anchor "${label}" matched ${hits} times, expected exactly 1`);
  src = src.replace(anchor, build(anchor));
  n += 1;
  console.log(`  ok  ${label}`);
}

/* ══ lib/quiz-derived-cache.js ══════════════════════════════════════════════ */
open('lib/quiz-derived-cache.js');

edit(
  'the day field counts everyone who played',
  `  const value = { gained, posNow, posThen, posDay, dayField, posDayReg, regDayGained };`,
  () => `  // THE FIELD IS EVERYONE WHO PLAYED TODAY, NOT EVERYONE WHO BANKED (owner,
  // 2026-09-04). dayField above is the size of the board this rank is taken on,
  // which is only the players whose gain is above zero; the home's own board
  // prints /api/quiz/totals.todayPlayers, which is every distinct player with a
  // row since ET midnight. On one page load that read "#23/132" in the cap and
  // "Top 10 of 140 players" below it.
  //
  // COUNTED OFF THE RAW ROWS, BY THE SAME RULE THAT ROUTE USES, and not derived
  // from the map above: computeXp drops every row with total <= 0, so a player
  // whose only play today is one of those never enters it, and an xp-derived
  // count could never be made to agree. Same shared rows, same ET cutoff, same
  // u:/a: keying, so the two figures now move together.
  //
  // It belongs here because this memo is already keyed on the row set and the
  // day start, so the pass is paid once per row set rather than per request.
  const dayPlayers = new Set();
  for (const r of rows || []) {
    if (!r || !r.created_at) continue;
    if (new Date(r.created_at).getTime() < dayStartMs) continue;
    if (r.user_id) dayPlayers.add(\`u:\${r.user_id}\`);
    else if (r.anon_id) dayPlayers.add(\`a:\${r.anon_id}\`);
  }
  const dayFieldAll = dayPlayers.size;

  const value = { gained, posNow, posThen, posDay, dayField, dayFieldAll, posDayReg, regDayGained };`,
);

/* ══ app/api/quiz/daily-status/route.js ═════════════════════════════════════ */
open('app/api/quiz/daily-status/route.js');

edit(
  'dayField is the wide count',
  `          // The field is the whole pool, guests included, which is the same
          // denominator every per-game "#N of M" on the site already prints.
          dayField = st.dayField || null;`,
  () => `          // The field is the whole pool, guests included, which is the same
          // denominator every per-game "#N of M" on the site already prints --
          // and it is the count of everyone who PLAYED today, the same figure
          // the home board prints as "of N players", not the smaller count of
          // players who banked IQ. Falls back to the banked count only if the
          // wide one is somehow unavailable.
          dayField = st.dayFieldAll || st.dayField || null;`,
);

close();
console.log(`\n${n} anchored edits applied under ${root}`);

#!/usr/bin/env node
// Extend a DETERMINISTIC generator's bank by regenerating the WHOLE bank for a
// longer run and appending only the tail. Every board that already existed must
// come back unchanged or the run aborts without writing anything, so a live
// board can never be rewritten (authoring standard rule 10).
//
//   node scripts/_extfull.mjs <game> <gen.mjs> <untilISO> '<argTemplate>'
//
// Template placeholders: {FROM} (the bank's FIRST live date) and {DAYS} (the
// total run length, not the number of new days). Set EXT_OUTFILE when the
// generator writes its bank to a file of its own rather than stdout (gen-plot).
//
// Banks are quoted two ways: hand-authored files write `live: '...'`, generated
// ones are JSON-stringified as `"live":"..."`. Match both, or half the roster
// parses as an empty bank and the run reports "0 boards" instead of failing.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const LIVE_SRC = '["\']?live["\']?\\s*:\\s*["\'](\\d{4}-\\d{2}-\\d{2})["\']';
const LIVE = new RegExp(LIVE_SRC);
const LIVE_G = new RegExp(LIVE_SRC, 'g');

const [game, gen, until, tpl = ''] = process.argv.slice(2);
const bankPath = `app/${game}/puzzles.js`;
const bank = fs.readFileSync(bankPath, 'utf8');
const dates = [...bank.matchAll(LIVE_G)].map((m) => m[1]).sort();
const first = dates[0], last = dates.at(-1);
const total = Math.round((new Date(until + 'T12:00:00Z') - new Date(first + 'T12:00:00Z')) / 864e5) + 1;
if (new Date(until) <= new Date(last)) { console.log(`${game}: already runs to ${last}`); process.exit(0); }

const args = tpl.split(/\s+/).filter(Boolean)
  .map((a) => a.replace('{FROM}', first).replace('{DAYS}', String(total)));
fs.mkdirSync('/tmp/build', { recursive: true });
// generators cache boards to /tmp/build/<game>-bank.jsonl and RESUME from it,
// so an earlier partial run bleeds into this output unless the cache is cleared
for (const f of fs.readdirSync('/tmp/build')) if (f.startsWith(game)) fs.unlinkSync(`/tmp/build/${f}`);

const OUTFILE = process.env.EXT_OUTFILE || '';
const ran = execFileSync('node', [`scripts/${gen}`, ...args],
  { maxBuffer: 1 << 30, stdio: ['ignore', OUTFILE ? 'inherit' : 'pipe', 'inherit'] });
const out = OUTFILE ? fs.readFileSync(OUTFILE, 'utf8') : ran.toString();

const marker = 'export const PUZZLES = [';
const body = out.slice(out.indexOf(marker) + marker.length).replace(/\s*\];\s*$/, '');
const lines = body.split('\n');
const marks = [];
lines.forEach((l, i) => { const m = l.match(LIVE); if (m) marks.push([i, m[1]]); });
if (marks.length !== total) { console.error(`${game}: generated ${marks.length} boards, expected ${total}`); process.exit(1); }

const cutAt = marks.findIndex(([, d]) => d === last);
if (cutAt < 0) { console.error(`${game}: the regenerated bank has no board for ${last}`); process.exit(1); }
let start = marks[cutAt + 1][0];
while (start > 0 && !/^\s*\{/.test(lines[start])) start--;   // back up to its opening brace

// Prove the frozen prefix came back unchanged, board by board. Whitespace and
// the trailing comma the last frozen board gains are the only allowed diffs.
const strip = (t) => t.replace(/[,\s]*$/, '').replace(/\s+/g, '');
const boardsOf = (text) => {
  const at = [];
  const re = new RegExp(LIVE_SRC, 'g');
  let m;
  while ((m = re.exec(text))) at.push([m.index, m[1]]);
  return at.map(([i, d], k) => [d, text.slice(i, at[k + 1] ? at[k + 1][0] : text.length)]);
};
const was = new Map(boardsOf(bank));
const now = new Map(boardsOf(lines.slice(0, start).join('\n')));
const drift = [...was].filter(([d, txt]) => {
  const n = now.get(d);
  return !n || !(strip(n) === strip(txt) || strip(n).startsWith(strip(txt)));
});
if (drift.length) {
  console.error(`${game}: ${drift.length} of ${was.size} frozen boards would change (${drift.slice(0, 3).map(([d]) => d).join(', ')}) - ABORT, nothing written`);
  process.exit(2);
}

const tail = lines.slice(start).join('\n');
const tailCount = (tail.match(LIVE_G) || []).length;
const close = bank.lastIndexOf('];');
const head = bank.slice(0, close).replace(/,?\s*$/, ',\n');
fs.writeFileSync(bankPath, head + tail + '\n' + bank.slice(close));
console.log(`${game}: +${tailCount} boards -> ${until} (bank now ${dates.length + tailCount}), ${was.size} frozen boards proved unchanged`);

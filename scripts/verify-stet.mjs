// Independent re-derivation checks for the Stet bank. Run after ANY edit:
//   node scripts/verify-stet.mjs
import { PUZZLES } from '../app/stet/puzzles.js';

const strip = (w) => w.toLowerCase().replace(/^[^a-z0-9'’-]+|[^a-z0-9'’-]+$/g, '');
let fail = 0;
const err = (m) => { console.error('FAIL:', m); fail++; };

const seenPairs = new Set();
let prev = 0;
for (const p of PUZZLES) {
  if (p.num !== prev + 1) err(`#${p.num}: nums not sequential`);
  prev = p.num;
  const [y, m, d] = p.live.split('-').map(Number);
  if (p.quizId !== `stet-${m}-${d}-${y % 100}`) err(`#${p.num}: quizId ${p.quizId} != live ${p.live}`);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const isSun = dt.getUTCDay() === 0;
  if (!!p.sunday !== isSun) err(`#${p.num}: sunday flag ${p.sunday} but ${p.live} getUTCDay=${dt.getUTCDay()}`);
  const want = p.sunday ? 7 : 5;
  if (p.items.length !== want) err(`#${p.num}: ${p.items.length} items, want ${want}`);
  const label = dt.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' });
  if (p.dateLabel !== label) err(`#${p.num}: dateLabel "${p.dateLabel}" != "${label}"`);
  p.items.forEach((it, i) => {
    const toks = it.text.split(/\s+/).map(strip).filter(Boolean);
    const hits = toks.filter((t) => t === it.wrong.toLowerCase()).length;
    if (hits !== 1) err(`#${p.num}.${i + 1}: wrong "${it.wrong}" appears ${hits}x in "${it.text}"`);
    if (!it.fix || strip(it.fix) === strip(it.wrong)) err(`#${p.num}.${i + 1}: bad fix "${it.fix}"`);
    if (/\s/.test(it.fix.trim())) err(`#${p.num}.${i + 1}: fix "${it.fix}" is multi-word`);
    if (!it.note || it.note.length < 15 || it.note.length > 140) err(`#${p.num}.${i + 1}: note length ${(it.note || '').length}`);
    const pair = `${strip(it.wrong)}>${strip(it.fix)}`;
    if (seenPairs.has(pair)) err(`#${p.num}.${i + 1}: duplicate pair ${pair}`);
    seenPairs.add(pair);
    // fix must NOT already appear in the sentence (would make the answer visible)
    if (toks.includes(strip(it.fix))) err(`#${p.num}.${i + 1}: fix "${it.fix}" already appears in text`);
  });
}
console.log(fail ? `${fail} failure(s)` : `OK — ${PUZZLES.length} puzzles, ${PUZZLES.reduce((s, p) => s + p.items.length, 0)} items, all checks passed`);
process.exit(fail ? 1 : 0);

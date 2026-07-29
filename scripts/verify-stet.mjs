// Independent re-derivation checks for the Stet bank (v2 format: per-sentence
// `errors` array of 0–2, clean sentences carry `cleanNote`). Run after ANY edit:
//   node scripts/verify-stet.mjs
import { PUZZLES } from '../app/stet/puzzles.js';

const strip = (w) => w.toLowerCase().replace(/^[^a-z0-9'’-]+|[^a-z0-9'’-]+$/g, '');
let fail = 0;
const GRAMMAR_FROM = '2026-08-11'; // every day on/after this must carry a kind:'grammar' error
let grammarErrors = 0;
const err = (m) => { console.error('FAIL:', m); fail++; };

const seenPairs = new Set();
let prev = 0, cleanDays = 0, totalErrors = 0, cleanItems = 0, doubles = 0;
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
  let dayClean = 0, dayErrors = 0, dayGrammar = 0;
  p.items.forEach((it, i) => {
    if (!Array.isArray(it.errors)) { err(`#${p.num}.${i + 1}: errors not an array`); return; }
    const maxErr = p.sunday ? 2 : 1;
    if (it.errors.length > maxErr) err(`#${p.num}.${i + 1}: ${it.errors.length} errors exceeds ${maxErr}`);
    const toks = it.text.split(/\s+/).map(strip).filter(Boolean);
    if (it.errors.length === 0) {
      dayClean++; cleanItems++;
      if (!it.cleanNote || it.cleanNote.length < 15 || it.cleanNote.length > 140) err(`#${p.num}.${i + 1}: clean item needs a cleanNote (15–140 chars)`);
      return;
    }
    if (it.errors.length === 2) doubles++;
    const wrongs = new Set();
    for (const [j, e] of it.errors.entries()) {
      dayErrors++; totalErrors++;
      if (e.kind !== undefined && e.kind !== 'grammar' && e.kind !== 'wordchoice' && e.kind !== 'spelling') err(`#${p.num}.${i + 1}.${j + 1}: bad kind "${e.kind}"`);
      if (e.kind === 'grammar') { dayGrammar++; grammarErrors++; }
      const w = strip(e.wrong);
      if (wrongs.has(w)) err(`#${p.num}.${i + 1}: duplicate wrong token "${e.wrong}" within sentence`);
      wrongs.add(w);
      const hits = toks.filter((t) => t === w).length;
      if (hits !== 1) err(`#${p.num}.${i + 1}.${j + 1}: wrong "${e.wrong}" appears ${hits}x in "${it.text}"`);
      if (!e.fix || strip(e.fix) === w) err(`#${p.num}.${i + 1}.${j + 1}: bad fix "${e.fix}"`);
      if (/\s/.test((e.fix || '').trim())) err(`#${p.num}.${i + 1}.${j + 1}: fix "${e.fix}" is multi-word`);
      if (!e.note || e.note.length < 15 || e.note.length > 140) err(`#${p.num}.${i + 1}.${j + 1}: note length ${(e.note || '').length}`);
      const pair = `${w}>${strip(e.fix)}`;
      if (seenPairs.has(pair)) err(`#${p.num}.${i + 1}.${j + 1}: duplicate pair ${pair}`);
      seenPairs.add(pair);
      if (toks.includes(strip(e.fix))) err(`#${p.num}.${i + 1}.${j + 1}: fix "${e.fix}" already appears in text`);
    }
  });
  if (dayClean) cleanDays++;
  if (dayErrors === 0) err(`#${p.num}: a day with NO errors at all`);
  if (p.live >= GRAMMAR_FROM && dayGrammar === 0) err(`#${p.num} (${p.live}): no kind:'grammar' error — every day on/after ${GRAMMAR_FROM} needs one`);
  if (!p.sunday && p.items.length - dayClean !== 5 - dayClean) { /* structural, covered above */ }
}
console.log(`stats: ${PUZZLES.length} puzzles, ${totalErrors} errors (${grammarErrors} grammar), ${cleanItems} clean sentences across ${cleanDays} days, ${doubles} two-error sentences`);
console.log(fail ? `${fail} failure(s)` : 'OK — all checks passed');
process.exit(fail ? 1 : 0);

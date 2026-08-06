// Verifier for the Redact bank (app/redact/puzzles.js). Run after ANY edit:
//   node scripts/verify-redact.mjs
// A parse is not a pass (CLAUDE-QUIZZES section 0): this gate re-derives the
// identity fields, the win targets, and the text-hygiene rules from the data.
import { PUZZLES } from '../app/redact/puzzles.js';
import { FREEBIES, norm, tokenize, titleTargets, guessMatches } from '../app/redact/words.js';

const CATS = new Set(['Person', 'Place', 'Thing', 'Event', 'Work']);
let bad = 0;
const err = (n, msg) => { bad++; console.error(`  #${n}: ${msg}`); };

const seenAnswers = new Set();
let prev = null;
for (const p of PUZZLES) {
  // identity fields agree (section 7e)
  if (prev && p.num !== prev.num + 1) err(p.num, `num not contiguous after ${prev.num}`);
  const d = new Date(p.live + 'T12:00:00Z');
  const expectId = `redact-${d.getUTCMonth() + 1}-${d.getUTCDate()}-${String(d.getUTCFullYear()).slice(2)}`;
  if (p.quizId !== expectId) err(p.num, `quizId ${p.quizId} != ${expectId}`);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const expectLabel = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  if (p.dateLabel !== expectLabel) err(p.num, `dateLabel ${p.dateLabel} != ${expectLabel}`);
  if (prev) {
    const gap = (d - new Date(prev.live + 'T12:00:00Z')) / 86400000;
    if (gap !== 1) err(p.num, `live date gap ${gap} days after #${prev.num}`);
  }
  const isSun = d.getUTCDay() === 0;
  if (!!p.sunday !== isSun) err(p.num, `sunday flag ${p.sunday} but ${p.live} is ${isSun ? '' : 'not '}a Sunday`);
  if (isSun && p.diff < 4) err(p.num, `Sunday diff ${p.diff} < 4`);

  // classification
  if (!CATS.has(p.cat)) err(p.num, `bad cat ${p.cat}`);
  if (!(p.diff >= 1 && p.diff <= 5)) err(p.num, `bad diff ${p.diff}`);

  // subject uniqueness
  const aN = norm(p.answer);
  if (seenAnswers.has(aN)) err(p.num, `duplicate answer ${p.answer}`);
  seenAnswers.add(aN);

  // text hygiene
  if (/[—–]/.test(p.text) || /[—–]/.test(p.answer)) err(p.num, 'em/en dash in copy');
  if (/[“”"]/.test(p.text)) err(p.num, 'double quotes in text');
  if (/[‘’]/.test(p.text)) err(p.num, 'smart apostrophe in text');
  const words = p.text.split(/\s+/).filter(Boolean).length;
  const [lo, hi] = p.sunday ? [250, 430] : [240, 360];
  if (words < lo || words > hi) err(p.num, `word count ${words} outside ${lo}-${hi}`);

  // win targets exist and are sane
  const targets = titleTargets(p.answer);
  if (!targets.length) err(p.num, 'no title targets');
  for (const t of targets) if (t.length < 3) err(p.num, `target too short: ${t}`);

  // aka aliases must point at a title target or a word in the text, and the
  // alias itself must not be a word that already appears in the text
  const tokens = tokenize(p.text);
  const textNorms = new Set(tokens.filter((t) => t.w).map((t) => t.n));
  for (const [alias, target] of Object.entries(p.aka || {})) {
    if (norm(alias) !== alias) err(p.num, `aka key not normalized: ${alias}`);
    if (!targets.includes(target) && !textNorms.has(target)) err(p.num, `aka target ${target} not in title or text`);
    if (textNorms.has(alias)) err(p.num, `aka alias ${alias} is a real word in the text`);
    if (FREEBIES.has(alias)) err(p.num, `aka alias ${alias} is a freebie`);
  }

  // the game must not name itself
  if (textNorms.has('redact') || textNorms.has('redacted')) err(p.num, 'text contains redact');

  // informational: freebie share + title presence in body + solvable reveal
  const wordToks = tokens.filter((t) => t.w);
  const free = wordToks.filter((t) => FREEBIES.has(t.n)).length;
  const share = Math.round((free / wordToks.length) * 100);
  if (share < 25 || share > 60) err(p.num, `freebie share ${share}% out of 25-60`);
  const inBody = targets.filter((t) => wordToks.some((tk) => guessMatches(t, tk.n)));
  console.log(`  #${String(p.num).padStart(2)} ${p.live}${p.sunday ? ' SUN' : '    '} d${p.diff} ${p.cat.padEnd(6)} ${String(words).padStart(3)}w free ${share}% targets [${targets.join(', ')}] inBody ${inBody.length}/${targets.length} · ${p.answer}`);
  prev = p;
}

if (PUZZLES.length !== 30) { bad++; console.error(`bank size ${PUZZLES.length} != 30`); }
if (bad) { console.error(`\nFAIL: ${bad} problems`); process.exit(1); }
console.log('\nverify-redact: PASS');

// Hero-coverage audit for the quiz hub. Run: node scripts/audit-quiz-heroes.mjs
// Verifies the Quiz-of-the-Day rotation, hero image formats, and that no hero id
// is orphaned. Category leaders and the newest tile also depend on LIVE play
// counts (fetched at runtime), so those can't be fully checked here.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { QUIZ_HEROES, QOTD_POOL, QOTD_OVERRIDES, qotdIdFor } from '../lib/quiz-heroes.js';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, '../lib/quizzes.js'), 'utf8');
const ids = new Set();
for (const m of src.matchAll(/(?<![A-Za-z0-9])["']?id["']?\s*:\s*["']([a-z0-9][a-z0-9-]*)["']/g)) ids.add(m[1]);

let problems = 0;
const heroIds = Object.keys(QUIZ_HEROES);
console.log(`\nQUIZ_HEROES: ${heroIds.length} heroed quizzes | quizzes.js ids parsed: ${ids.size}\n`);

// 1. Orphans
const orphans = heroIds.filter((id) => !ids.has(id));
if (orphans.length) { problems += orphans.length; console.log('ORPHAN hero ids (not in quizzes.js):'); orphans.forEach((id) => console.log('  - ' + id)); }
else console.log('OK  every hero id exists in quizzes.js');

// 2. Format (JPEG/PNG only)
// files.skimap.org serves extensionless hash URLs that are JPEG (content-type verified live
// 2026-07-03); it is the same host the trail-map quiz images use. Heroes render as CSS
// background-image, so the extension is a static heuristic only.
const EXTENSIONLESS_JPEG_HOSTS = /^https:\/\/files\.skimap\.org\//;
const bad = heroIds.filter((id) => !EXTENSIONLESS_JPEG_HOSTS.test(QUIZ_HEROES[id].src) && !/\.(jpe?g|png)$/i.test(QUIZ_HEROES[id].src.split('?')[0]));
if (bad.length) { problems += bad.length; console.log('\nBAD hero format (must be .jpg/.jpeg/.png, no webp/avif):'); bad.forEach((id) => console.log('  - ' + id + ' -> ' + QUIZ_HEROES[id].src)); }
else console.log('OK  every hero src is JPEG/PNG');

// 3. Pool sanity
const poolBad = QOTD_POOL.filter((id) => !QUIZ_HEROES[id]);
if (poolBad.length) { problems += poolBad.length; console.log('\nQOTD_POOL ids not in QUIZ_HEROES:', poolBad); }

// 4. QOTD schedule, next 14 Eastern days
const etYmd = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
console.log('\nQuiz of the Day, next 14 days (Eastern):');
const today = new Date();
for (let k = 0; k < 14; k++) {
  const ymd = etYmd(new Date(today.getTime() + k * 86400000));
  const id = qotdIdFor(ymd, ids);
  const pin = QOTD_OVERRIDES[ymd] ? '  [pinned]' : '';
  const heroed = id && QUIZ_HEROES[id] ? '' : '  <-- NO HERO';
  if (!id || !QUIZ_HEROES[id]) problems++;
  console.log(`  ${ymd}  ${id || '(none)'}${pin}${heroed}`);
}

console.log(problems ? `\nFAIL: ${problems} problem(s)\n` : '\nPASS: hero coverage healthy\n');
process.exit(problems ? 1 : 0);

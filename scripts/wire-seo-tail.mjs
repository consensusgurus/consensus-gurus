// SEO WIRING FOR THE DAILIES (Search Console audit, 2026-09-01). Run against a
// FRESH export of origin/main (git archive FETCH_HEAD), never the working tree:
//
//   node scripts/wire-seo-tail.mjs /tmp/src
//
// Every edit is an anchored replacement that must match EXACTLY ONCE per file
// (zero means origin moved, two means the anchor is too loose), and the script
// throws on either, per the patch-daily-five / wire-encore convention.
//
// What it does, and why (details in app/DailyRoster.jsx and app/StageTail.jsx):
//   1. Every daily's page.js mounts <StageTail> after its client, so a stage
//      page ends in the stage footer, which now carries the roster.
//   2. Every client's "About <Game>" section becomes visible on the stage. It
//      was display:none there, which is hidden text to Google and no text to a
//      reader deciding whether to press Start.
//   3. Titles lead with what a stranger searches for ("Free Daily Killer
//      Sudoku: Cages") instead of the name, and lose the em dash the copy rule
//      bans.
//   4. StageChrome's game name becomes the page's <h1>, same styling.
//   5. The home's game links drop ?stage=1 (the stage is the default).
//   6. Both footers render the roster.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
if (!ROOT) throw new Error('usage: node scripts/wire-seo-tail.mjs <export-root>');
const rd = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const wr = (p, s) => fs.writeFileSync(path.join(ROOT, p), s);
const count = (s, needle) => s.split(needle).length - 1;
function once(file, s, from, to) {
  const n = count(s, from);
  if (n !== 1) throw new Error(`${file}: anchor matched ${n} times: ${from.slice(0, 70)}`);
  return s.replace(from, () => to);
}
const touched = [];

// The roster, from the registry, so the set of page.js files is the set of
// live routes and nothing is guessed.
const reg = rd('lib/daily-games.js');
const rows = [...reg.matchAll(/^  \{ key: '([a-z]+)'(?:[^\n]*?href: '\/([a-z]+)')?/gm)].map((m) => ({ key: m[1], dir: m[2] || m[1] }));
if (rows.length < 70) throw new Error('registry parse found only ' + rows.length + ' rows');

// ── 1 + 3: page.js ─────────────────────────────────────────────────────────
for (const { key, dir } of rows) {
  const file = `app/${dir}/page.js`;
  let s = rd(file);
  if (s.includes('StageTail')) continue;
  const client = s.match(/^import (\w+Client) from '\.\/\w+Client';\n/m);
  if (!client) throw new Error(`${file}: no client import`);
  s = once(file, s, client[0], client[0] + "import StageTail from '../StageTail';\nimport { isStageServer } from '@/lib/stage';\n");
  s = once(file, s, '      </Suspense>\n', `      </Suspense>\n      <StageTail self="${key}" stage={isStageServer('${key}', searchParams)} />\n`);
  // Title: 'Name — Descriptor | Mind Loft'  ->  'Descriptor: Name | Mind Loft'.
  // A descriptor that already carries a colon keeps its clause with a comma so
  // the title has one colon, not two. Listed ('Name: Descriptor') and Shards
  // ('Name - Descriptor') are the two off-pattern titles.
  const t = s.match(/^  title: '([A-Za-z]+)(?: —| -|:) ([^'\n]+) \| Mind Loft',$/m);
  if (!t) throw new Error(`${file}: title pattern not found`);
  const name = t[1]; let desc = t[2];
  desc = desc.replace(': ', ', ');
  s = once(file, s, t[0], `  title: '${desc}: ${name} | Mind Loft',`);
  wr(file, s); touched.push(file);
}

// ── 2: the About section on every client ───────────────────────────────────
for (const { dir } of rows) {
  const d = fs.readdirSync(path.join(ROOT, 'app', dir)).find((f) => /Client\.jsx$/.test(f));
  if (!d) throw new Error(`app/${dir}: no client`);
  const file = `app/${dir}/${d}`;
  const s = rd(file);
  const lines = s.split('\n');
  let hits = 0;
  const out = lines.map((l) => {
    if (l.includes("(focusMode || STAGE) ? 'none' : 'block'") && /<section\b/.test(l)) {
      hits++;
      return l.replace("(focusMode || STAGE) ? 'none' : 'block'", "(focusMode && !STAGE) ? 'none' : 'block'");
    }
    return l;
  });
  if (hits > 1) throw new Error(`${file}: ${hits} about sections`);
  if (hits === 1) { wr(file, out.join('\n')); touched.push(file); }
}

// ── 4: h1 in the cap ───────────────────────────────────────────────────────
{
  const file = 'app/StageChrome.jsx';
  let s = rd(file);
  s = once(file, s, '          <b>\n            {name}\n            {sunday ? <u>{sunday}</u> : null}\n          </b>\n',
    '          <h1>\n            {name}\n            {sunday ? <u>{sunday}</u> : null}\n          </h1>\n');
  s = once(file, s, '.stg-id b{font-size:16px;font-weight:800;letter-spacing:-.01em;display:flex;align-items:center;gap:9px;}\n.stg-id b u{',
    '.stg-id h1{margin:0;font:inherit;font-size:16px;font-weight:800;letter-spacing:-.01em;display:flex;align-items:center;gap:9px;}\n.stg-id h1 u{');
  s = once(file, s, '  .stg-id b{font-size:15px;}', '  .stg-id h1{font-size:15px;}');
  wr(file, s); touched.push(file);
}

// ── 5: clean home links ────────────────────────────────────────────────────
{
  const file = 'app/today/StageToday.jsx';
  let s = rd(file);
  const n = count(s, '?stage=1${tq}');
  if (n !== 3) throw new Error(`${file}: expected 3 ?stage=1 links, found ${n}`);
  s = s.split('?stage=1${tq}').join("${tq ? '?' + tq.slice(1) : ''}");
  wr(file, s); touched.push(file);
}

// ── 6: both footers ────────────────────────────────────────────────────────
{
  const file = 'app/StageFooter.jsx';
  let s = rd(file);
  s = once(file, s, "import { FOOTER_COLS } from './Footer';\n", "import { FOOTER_COLS } from './Footer';\nimport DailyRoster from './DailyRoster';\n");
  s = once(file, s, '      <div className="stgf-base">', '      <DailyRoster variant="stage" />\n      <div className="stgf-base">');
  wr(file, s); touched.push(file);
}
{
  const file = 'app/Footer.jsx';
  let s = rd(file);
  s = once(file, s, "import { T } from '@/lib/theme';\n", "import { T } from '@/lib/theme';\nimport DailyRoster from './DailyRoster';\n");
  s = once(file, s, "      <div\n        style={{\n          maxWidth: 1040,\n          margin: '16px auto 0',",
    "      <div style={{ maxWidth: 1040, margin: '0 auto' }}><DailyRoster variant=\"light\" /></div>\n      <div\n        style={{\n          maxWidth: 1040,\n          margin: '16px auto 0',");
  wr(file, s); touched.push(file);
}
{
  const file = 'lib/stage.js';
  let s = rd(file);
  if (!s.includes('isStageServer')) {
    s += `
// The same decision on the SERVER, from the plain searchParams object a
// page.js receives. Mirrors isStage exactly by delegating to it.
export function isStageServer(key, searchParams) {
  const sp = searchParams || {};
  return isStage(key, { get: (k) => (sp[k] == null ? '' : String(sp[k])) });
}
`;
    wr(file, s); touched.push(file);
  }
}

fs.writeFileSync(path.join(ROOT, '.seo-tail-touched.txt'), [...new Set(touched)].sort().join('\n') + '\n');
console.log('patched', new Set(touched).size, 'files');

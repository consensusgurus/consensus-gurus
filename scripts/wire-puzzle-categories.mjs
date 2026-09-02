// WIRING FOR THE PUZZLE CATEGORY PAGES (2026-09-01). Run against a FRESH
// export of origin/main, never the working tree:
//
//   node scripts/wire-puzzle-categories.mjs /tmp/src
//
// Anchored, idempotent, throws on an anchor that matches other than once.
//   1. lib/sitemap-entries.js lists the eight category pages.
//   2. StageChrome's category label links to the game's category page.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
if (!ROOT) throw new Error('usage: node scripts/wire-puzzle-categories.mjs <export-root>');
const rd = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const wr = (p, s) => fs.writeFileSync(path.join(ROOT, p), s);
const count = (s, needle) => s.split(needle).length - 1;
function once(file, s, from, to) {
  const n = count(s, from);
  if (n !== 1) throw new Error(`${file}: anchor matched ${n} times: ${from.slice(0, 70)}`);
  return s.replace(from, () => to);
}
const touched = [];

{
  const file = 'lib/sitemap-entries.js';
  let s = rd(file);
  if (!s.includes('PUZZLE_CATEGORIES')) {
    s = once(file, s, "import { SOT_URL } from './site';\n", "import { SOT_URL } from './site';\nimport { PUZZLE_CATEGORIES } from './puzzle-categories.js';\n");
    s = once(file, s,
      "    { url: baseUrl, lastModified: newestQuiz, changeFrequency: 'daily', priority: 1.0 },\n",
      "    { url: baseUrl, lastModified: newestQuiz, changeFrequency: 'daily', priority: 1.0 },\n"
      + "    // The puzzle category landing pages (lib/puzzle-categories.js): the pages that can rank\n"
      + "    // for the generic terms, and a second crawl path into every daily.\n"
      + "    ...PUZZLE_CATEGORIES.map((c) => ({ url: `${baseUrl}/${c.slug}`, lastModified: newestQuiz, changeFrequency: 'weekly', priority: 0.8 })),\n");
    wr(file, s); touched.push(file);
  }
}

{
  const file = 'app/StageChrome.jsx';
  let s = rd(file);
  if (!s.includes('categoryHrefForGame')) {
    s = once(file, s, "import { gameStatsShort } from '@/lib/daily-row-stats';\n",
      "import { gameStatsShort } from '@/lib/daily-row-stats';\nimport { categoryHrefForGame } from '@/lib/puzzle-categories';\n");
    // The category word in the cap becomes a link to its landing page. Same
    // ink, no underline until hover, so nothing about the cap changes at rest.
    s = once(file, s, '            {category ? <span>{category}</span> : null}\n',
      '            {category ? (catHref ? <a className="stg-cat" href={catHref}>{category}</a> : <span>{category}</span>) : null}\n');
    s = once(file, s, '  const leader = board && board.leader;\n',
      "  const leader = board && board.leader;\n  const catHref = gameKey ? categoryHrefForGame(gameKey) : null;\n");
    s = once(file, s, '.stg-id i{font-family:${MONO};font-style:normal;font-size:9.5px;letter-spacing:.15em;\n',
      '.stg-id i{font-family:${MONO};font-style:normal;font-size:9.5px;letter-spacing:.15em;\n');
    s = once(file, s, '.stg-id h1{margin:0;font:inherit;',
      '.stg-cat{color:inherit;text-decoration:none;}\n.stg-cat:hover{text-decoration:underline;text-underline-offset:2px;}\n.stg-id h1{margin:0;font:inherit;');
    wr(file, s); touched.push(file);
  }
}

fs.writeFileSync(path.join(ROOT, '.puzzle-categories-touched.txt'), touched.join('\n') + (touched.length ? '\n' : ''));
console.log('patched', touched.length, 'files');

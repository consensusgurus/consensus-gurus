// AN APOSTROPHE IN A <style>{CSS}</style> IS ESCAPED ON THE SERVER AND KILLS
// THE RULE THAT CARRIES IT.
//
// React escapes text children, and <style> is an HTML RAW-TEXT element, so
// nothing decodes the entity back: the CSS parser is handed a literal &#x27;
// and drops the whole declaration. Everything that needs a quote goes with it:
//
//   content:''                      every ::before rule, so every left rule
//   [data-stage-theme='light'] ...  the entire light register of that sheet
//   grid-template-areas:'a b'       cannot be written without quotes at all
//   font-family:'JetBrains Mono'    the mono stack falls back to the sans
//
// It is REPAIRED ONLY IF REACT RE-RENDERS THAT SUBTREE ON THE CLIENT, which it
// does when a client parent renders the component and does not when a server
// page does. That is why this went unnoticed for so long and why it is worth a
// gate: the same component is correct on one route and broken on another, and
// the broken one is whichever page happens to be server rendered.
//
// Measured live on 2026-09-01: /circuits shipped 35 escaped quotes and
// getComputedStyle reported `grid-template-areas: none` on the phone cap, which
// collapsed its two rows into one; the same component on /circuits/<id>, which
// a client component renders, was correct.
//
// THE FIX IS ALWAYS THE SAME: <style dangerouslySetInnerHTML={{ __html: CSS }} />.
// That path does no escaping, so it is right at SSR and needs no repair.
//
// The KNOWN list below is the state of the tree on 2026-09-01: eighteen files
// that carry the hazard and get away with it because a client parent re-renders
// them. They are debt, not a licence — a file may be removed from this list
// when it is converted, and nothing may be added to it.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Measured on origin/main, 2026-09-01. Every one of these is a CLIENT component
// with a client parent, which is the only reason it renders: React rewrites the
// stylesheet's text on the client and the escaped SSR copy is replaced before
// anyone sees it. That makes them a race, not a working design. The four
// circuit-family files that were on this list were converted the day it was
// written, because two of them are rendered by SERVER pages, where there is no
// re-render and no repair.
const KNOWN = new Set([
  'app/DailyEndCard.jsx',
  'app/DailyTilePanel.jsx',
  'app/HomeRails.jsx',
  'app/StageWelcome.jsx',
  'app/circuits/[id]/run/RunClient.jsx',
  'app/crux/CruxClient.jsx',
  'app/daily/DailyArchiveClient.jsx',
  'app/jesters/JesterClient.jsx',
  'app/pricer/PricerClient.jsx',
  'app/quiz/[id]/DailyBoardPanel.jsx',
  'app/quiz/[id]/QuizStandings.jsx',
  'app/quizzes/QuizCommandHeader.jsx',
  'app/quizzes/QuizHomeClient.jsx',
  'app/shards/ShardsClient.jsx',
  'app/tally/TallyClient.jsx',
  'app/today/StageToday.jsx',
  'app/today/TodayClient.jsx',
]);

// THE THREE SHAPES THAT BREAK SOMETHING A READER CAN SEE, and no more.
//
// A quoted FONT STACK is affected too, but it degrades to the next family in
// the list rather than dropping a rule, and it is nearly always interpolated
// (font-family:${MONO}) where no source regex can see the quote anyway. Flagging
// it would put every file on the list and make the gate mean nothing. These
// three each take out a whole rule: the ::before that draws every left rule, the
// entire light register of that stylesheet, and a phone layout that cannot be
// written without quotes at all.
const CSS_QUOTE = /content:\s*'|\[data-stage-theme='|grid-template-areas:\s*'/;

const roots = process.argv.slice(2).length ? process.argv.slice(2) : ['app', 'lib'];
const files = [];
const walk = (dir) => {
  let entries;
  try { entries = readdirSync(dir); } catch (e) { return; }
  for (const e of entries) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) { if (e !== 'node_modules' && e !== '.next') walk(p); }
    else if (/\.(jsx|js)$/.test(e)) files.push(p);
  }
};
for (const r of roots) walk(r);

// COMMENTS ARE STRIPPED FIRST, because the fix is documented in prose that
// quotes the broken form verbatim: a file explaining why not to write
// <style>{CSS}</style> would otherwise report itself.
const decomment = (s) => s
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/^\s*\/\/.*$/gm, ' ');

const findings = [];
for (const f of files) {
  const src = decomment(readFileSync(f, 'utf8'));
  // The TEXT-CHILD form only. dangerouslySetInnerHTML is the fix and is fine.
  if (!/<style>\s*\{/.test(src)) continue;
  if (!CSS_QUOTE.test(src)) continue;
  findings.push(f.replace(/\\/g, '/'));
}

const fresh = findings.filter((f) => !KNOWN.has(f));
const seen = new Set(findings);
const fixed = [...KNOWN].filter((f) => !seen.has(f));

for (const f of findings.filter((x) => KNOWN.has(x))) console.log(`…   ${f} (known)`);
for (const f of fixed) console.log(`ok  ${f} no longer uses the text-child form - remove it from KNOWN`);
for (const f of fresh) console.log(`✗   ${f} renders <style>{CSS}</style> with a quoted rule - use dangerouslySetInnerHTML`);

console.log(`\n${findings.length} file(s) carry the hazard, ${fresh.length} of them new.`);
process.exit(fresh.length ? 1 : 0);

// THE QUIZ STAGE, MEASURED.
//
//   node scripts/verify-quiz-stage.mjs
//
// Two jobs, and they fail for two different reasons.
//
// 1. THE ONE QUIZ ACCENT is measured, not asserted. lib/quiz-stage.js picks a
//    single hue for the whole quiz half of the site, in two registers, and the
//    header of that file states the numbers it was chosen on. A comment stating
//    a contrast ratio is a claim; this is the check. Bands are the ones
//    scripts/verify-category-ramp.mjs holds the nine daily steps to, so the
//    quiz accent cannot be held to a lower standard than a category step.
//
// 2. A CONVERTED QUIZ CLIENT MUST IMPORT WHAT IT USES, and must not still be
//    rendering the furniture the stage takes away. esbuild parses an undefined
//    identifier without complaint, so a converter that emits a name it forgot
//    to import produces a page that throws ReferenceError on its FIRST render,
//    live, for every reader, flag or no flag. That has shipped on this codebase
//    (thirteen daily pages at once) and it is the reason this file exists.
//
//    scripts/verify-stage-imports.mjs does the daily half and cannot do this
//    one: it walks app/<dir>/*Client.jsx, one level deep, and every quiz client
//    lives two levels down in app/quiz/[id]/.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

let bad = 0;
const fail = (m) => { console.log('✗ ' + m); bad++; };
const note = (m) => console.log('… ' + m);

// ── 1. THE ACCENT ───────────────────────────────────────────────────────────
const src = readFileSync('lib/quiz-stage.js', 'utf8');
const pick = (name) => {
  const m = new RegExp('export const ' + name + " = '(#[0-9a-fA-F]{6})';").exec(src);
  if (!m) { fail(`lib/quiz-stage.js does not export ${name} as a six-digit hex`); return null; }
  return m[1].toLowerCase();
};
const ACC = pick('QUIZ_ACC');
const ACC_L = pick('QUIZ_ACC_LIGHT');
const ON = pick('QUIZ_ON_ACC');
const ON_L = pick('QUIZ_ON_ACC_LIGHT');

// The two grounds, read from app/globals.css rather than restated here: a
// checker that carries its own copy of the value it is checking against agrees
// with itself the day the stylesheet moves.
const css = readFileSync('app/globals.css', 'utf8');
const groundOf = (block) => {
  const at = css.indexOf(block);
  if (at < 0) return null;
  const m = /--stg-ground:\s*(#[0-9a-fA-F]{6})/.exec(css.slice(at, at + 900));
  return m ? m[1].toLowerCase() : null;
};
const GROUND = groundOf('.stage-page {');
const GROUND_L = groundOf(".stage-page[data-stage-theme='light'] {");
if (!GROUND || !GROUND_L) fail('could not read --stg-ground for one or both registers out of app/globals.css');

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lin = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const lum = (h) => { const [r, g, b] = rgb(h); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const contrast = (a, b) => {
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
const hue = (h) => {
  const [r, g, b] = rgb(h).map((v) => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (!d) return 0;
  let x;
  if (mx === r) x = ((g - b) / d) % 6;
  else if (mx === g) x = (b - r) / d + 2;
  else x = (r - g) / d + 4;
  return (x * 60 + 360) % 360;
};
const gap = (a, b) => { const d = Math.abs(a - b); return Math.min(d, 360 - d); };

const MIN_CR = 4.5;      // the floor every ramp step clears, in both registers
const MAX_DRIFT = 25;    // a light step that drifts in hue is a second colour
                         // system wearing the first one's names
const MIN_RAMP_GAP = 25; // clear of every daily category step

if (ACC && ON && GROUND) {
  const ink = contrast(ACC, ON), gnd = contrast(ACC, GROUND);
  note(`dark  ${ACC} on ${GROUND}: ink ${ink.toFixed(2)}:1, ground ${gnd.toFixed(2)}:1`);
  if (ink < MIN_CR) fail(`the dark accent carries its ink at ${ink.toFixed(2)}:1, under ${MIN_CR}`);
  if (gnd < MIN_CR) fail(`the dark accent sits on its ground at ${gnd.toFixed(2)}:1, under ${MIN_CR}`);
}
if (ACC_L && ON_L && GROUND_L) {
  const ink = contrast(ACC_L, ON_L), gnd = contrast(ACC_L, GROUND_L);
  note(`light ${ACC_L} on ${GROUND_L}: ink ${ink.toFixed(2)}:1, ground ${gnd.toFixed(2)}:1`);
  if (ink < MIN_CR) fail(`the light accent carries its ink at ${ink.toFixed(2)}:1, under ${MIN_CR}`);
  if (gnd < MIN_CR) fail(`the light accent sits on its ground at ${gnd.toFixed(2)}:1, under ${MIN_CR}`);
}
if (ACC && ACC_L) {
  const drift = gap(hue(ACC), hue(ACC_L));
  note(`hue drift between registers: ${drift.toFixed(0)} degrees`);
  if (drift > MAX_DRIFT) {
    fail(`the two registers are ${drift.toFixed(0)} degrees apart, over ${MAX_DRIFT}: a reader who flips `
      + 'the switch loses every association they built');
  }
}

// CLEAR OF THE NINE DAILY STEPS. A quiz wearing Word's sky says it is a Word
// game. Read out of lib/category-ramp.js, again so there is one copy.
{
  const ramp = readFileSync('lib/category-ramp.js', 'utf8');
  const block = (name) => {
    const at = ramp.indexOf('export const ' + name + ' = [');
    if (at < 0) return [];
    return [...ramp.slice(at, ramp.indexOf('];', at)).matchAll(/'(#[0-9a-fA-F]{6})'/g)].map((m) => m[1].toLowerCase());
  };
  const dark = block('CATEGORY_RAMP');
  const light = block('CATEGORY_RAMP_LIGHT');
  if (dark.length !== 9 || light.length !== 9) {
    fail(`read ${dark.length} dark and ${light.length} light ramp steps out of lib/category-ramp.js, expected 9 of each`);
  }
  const nearest = (c, steps) => steps.reduce((best, s) => Math.min(best, gap(hue(c), hue(s))), 999);
  if (ACC && dark.length) {
    const d = nearest(ACC, dark);
    note(`nearest DARK ramp step: ${d.toFixed(0)} degrees away`);
    if (d < MIN_RAMP_GAP) fail(`the dark quiz accent is ${d.toFixed(0)} degrees from a daily category step, under ${MIN_RAMP_GAP}`);
  }
  if (ACC_L && light.length) {
    const d = nearest(ACC_L, light);
    note(`nearest LIGHT ramp step: ${d.toFixed(0)} degrees away`);
    // A WARNING RATHER THAN A FAILURE, and the reason is on the record: the
    // light ramp is deep mid-tones where the dark one is pastels, so its own
    // steps already sit closer to each other than the dark set's (two pairs are
    // 15 and 22 degrees apart). A quiz page and a daily page are never on
    // screen together, so the association a reader builds is with the SURFACE,
    // not with a swatch beside another swatch.
    if (d < MIN_RAMP_GAP) note(`  (warning only: the light ramp's own steps are as close, and the two surfaces never share a screen)`);
  }
}

// ── 2. CONVERTED QUIZ CLIENTS ───────────────────────────────────────────────
const DIR = 'app/quiz/[id]';
const NEEDED = ['isQuizStage', 'QUIZ_ACC_VARS', 'useStageTheme', 'StageChrome', 'StageLadder'];
let checked = 0;
for (const f of readdirSync(DIR)) {
  if (!/\.jsx$/.test(f)) continue;
  const rel = join(DIR, f);
  const s = readFileSync(rel, 'utf8');
  if (!/const QSTAGE = isQuizStage\(/.test(s)) continue;   // unconverted
  checked++;

  // Everything it imports by name, plus everything it declares.
  const known = new Set();
  for (const m of s.matchAll(/import\s+(?:(\w+)\s*,\s*)?\{([^}]*)\}\s+from/g)) {
    if (m[1]) known.add(m[1]);
    for (const nm of m[2].split(',')) {
      const t = nm.trim().split(/\s+as\s+/).pop().trim();
      if (t) known.add(t);
    }
  }
  for (const m of s.matchAll(/^import\s+(\w+)\s+from/gm)) known.add(m[1]);
  for (const m of s.matchAll(/^\s*(?:const|let|function)\s+(\w+)/gm)) known.add(m[1]);
  for (const name of NEEDED) {
    if (!new RegExp('(?<![\\w$])' + name + '(?![\\w$])').test(s)) continue;   // unused
    if (!known.has(name)) fail(`${rel} uses ${name} and neither imports nor declares it`);
  }

  // THE ORDERING, asserted rather than guarded at runtime. typeof on a const in
  // its TEMPORAL DEAD ZONE THROWS, so a flag reading searchParams declared
  // below it is a live bomb that esbuild and eslint both pass and only a render
  // catches. This codebase has shipped that bug twice.
  const lines = s.split('\n');
  const spAt = lines.findIndex((l) => /^\s*const searchParams\s*=/.test(l));
  const flagAt = lines.findIndex((l) => /const QSTAGE = isQuizStage\(/.test(l));
  if (spAt < 0) fail(`${rel} has no \`const searchParams\` for the stage flag to read`);
  else if (spAt > flagAt) {
    fail(`${rel} declares searchParams at line ${spAt + 1}, BELOW the stage flag at ${flagAt + 1}: `
      + 'that is a temporal dead zone and it throws on render');
  }

  // THE TAKEOVER. The stage pattern's first rule is that the page is the thing:
  // no site masthead above it, no footer below it, no paper grain on a
  // near-black ground. An UNGATED one of those is a piece of the old page
  // rendering on the new one -- the half-conversion that reads as broken
  // rather than as unfinished.
  // Line-based, because the gate is not always immediately in front of the
  // element: QuizClient renders the masthead as one arm of a JSX ternary and
  // the whole ternary is gated, which a lookbehind on the element cannot see.
  // A check that cries wolf on every run is a check nobody reads.
  for (const [what, re] of [
    ['<Footer />', /<Footer \/>/],
    ['<Grain />', /<Grain \/>/],
    ['<QuizNavHeader />', /<QuizNavHeader \/>/],
  ]) {
    lines.forEach((l, i) => {
      if (!re.test(l)) return;
      if (l.includes('!QSTAGE') || l.includes('QSTAGE ?')) return;
      fail(`${rel}:${i + 1} renders ${what} with no QSTAGE gate on that line: `
        + 'the stage takes the page over, so a piece of the old page here is player-facing');
    });
  }
}
note(`${checked} converted quiz client${checked === 1 ? '' : 's'} checked`);
if (!checked) note('no converted quiz client found: nothing on the quiz surface is on the stage yet');

console.log(bad ? `✗ ${bad} problem${bad === 1 ? '' : 's'}` : '✓ quiz stage clean');
process.exit(bad ? 1 : 0);

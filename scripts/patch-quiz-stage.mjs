// GENERIC quiz-stage chrome conversion. One script, any quiz client.
//
//   node scripts/patch-quiz-stage.mjs "app/quiz/[id]/TimedMcqClient.jsx"
//
// The quiz twin of scripts/patch-stage-chrome.mjs, and it exists for the same
// reason: measured across the twelve clients that render a quiz page, the
// pieces that have to move are the SAME pieces in every one of them, written
// the same way. The default-exported component's signature, the page root, the
// Grain, the QuizNavHeader mount and the Footer are byte-identical or vary in
// one known way, so the chrome half of a conversion is mechanical.
//
// WHAT THIS DOES NOT DO. It does not mount the cap, draw the ladder or touch
// the board, because all three have to know what the quiz COUNTS: a
// name-them-all quiz counts answers, a timed multiple-choice counts questions,
// a survival board counts prompts cleared. A client converted by this script
// alone gets the stage ground, the tokens and the takeover (no masthead, no
// footer, no grain) and its board still renders in the light palette. That is a
// REVIEW state, which is why nothing here flips QUIZ_STAGE_ON.
//
// THE ROLLOUT KEY IS THE FILE'S BASENAME, not the exported function's name.
// GeoAerialClient.jsx exports `function MapPlaceClient` -- a copy-paste that
// has been there for months -- so keying off the export would put two different
// clients under one name and a holdout on either would silently take out both.
//
// EVERY ANCHOR MUST MATCH EXACTLY ONCE, except the ones marked optional, which
// may be absent but never ambiguous. An anchor that matches twice is refused
// rather than applied twice: that is the whole reason this is a script and not
// a find-and-replace.
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

const [, , path] = process.argv;
if (!path) throw new Error('usage: patch-quiz-stage.mjs <QuizClient.jsx>');
const CLIENT = basename(path).replace(/\.jsx?$/, '');

let s = readFileSync(path, 'utf8');
let n = 0;

// BUFFER EVERY WRITE, FLUSH ONCE. A run that throws half way leaves a tree that
// is neither converted nor original, and the next run then fails on an edit it
// already applied -- which reads exactly like origin having moved under you.
// Nothing is written until the last anchor has matched.
function hits(anchor) {
  return typeof anchor === 'string'
    ? s.split(anchor).length - 1
    : (s.match(new RegExp(anchor.source, anchor.flags.includes('g') ? anchor.flags : anchor.flags + 'g')) || []).length;
}
function edit(name, anchor, to, { optional = false, expect = 1 } = {}) {
  // A non-global regex returns [match, ...groups] from String.match, so its
  // LENGTH is the capture count and not the hit count.
  const h = hits(anchor);
  if (h === 0 && optional) { console.log(`  - ${name}: absent, skipped`); return; }
  if (h !== expect) throw new Error(`anchor "${name}" matched ${h} times, expected ${expect}`);
  s = expect === 1 ? s.replace(anchor, to) : s.replaceAll(anchor, to);
  n += h;
  console.log(`  + ${name}: ${h}`);
}

// ── 1. WHERE THE COMPONENT STARTS ───────────────────────────────────────────
// Every quiz client takes ({ quizId, ... }), which is also the guard: a file
// that does not is not a quiz client and this script has no business in it.
const COMP = /^export default function ([A-Za-z_$][\w$]*)\(\{ quizId[^\n]*\) \{$/m;
const compHit = (s.match(COMP) || [])[0];
if (!compHit) throw new Error('no `export default function X({ quizId ... })` in this file; not a quiz client');
if (hits(COMP) !== 1) throw new Error('more than one quiz-client component in this file');

// ── 2. IMPORTS, hung off the QuizNavHeader import all twelve carry ──────────
// EVERY NAME EMITTED BELOW IS IMPORTED HERE. An emitter that does not import
// what it emits ships a client that throws ReferenceError on its FIRST render,
// for every reader, flag or no flag -- esbuild parses it happily and only
// loading the page catches it. Thirteen daily pages shipped that way once.
{
  const NAV = /^import QuizNavHeader from '[^']*QuizNavHeader';$/m;
  if (hits(NAV) !== 1) throw new Error('no single QuizNavHeader import to hang the stage imports off');
  const up = path.includes('/quiz/[id]/') ? '../..' : '..';
  edit('imports', NAV,
    `$&\n`
    + `import StageChrome from '${up}/StageChrome';\n`
    + `import { isQuizStage, QUIZ_ACC_VARS } from '@/lib/quiz-stage';\n`
    + `import { useStageTheme } from '@/lib/stage-theme';`);
}

// ── 3. THE FLAG, declared FIRST THING IN THE COMPONENT ──────────────────────
// Placement is not cosmetic. `typeof` on a const in its TEMPORAL DEAD ZONE
// THROWS, so a guarded read of searchParams declared lower is a live bomb that
// esbuild and eslint both pass. Declaring the flag at the top of the component
// satisfies the ordering BY CONSTRUCTION rather than by luck.
//
// A client that already reads the query keeps its own declaration and the block
// goes directly below it, because two `const searchParams` in one scope is a
// SyntaxError.
{
  const lines = s.split('\n');
  const compAt = lines.findIndex((l) => COMP.test(l));
  const spAt = lines.findIndex((l, i) => i > compAt && /^\s*const searchParams\s*=/.test(l));
  const ownsSp = spAt > -1;
  if (!ownsSp && !/useSearchParams/.test(s)) {
    if (/from 'next\/navigation'/.test(s)) {
      s = s.replace(/^(import \{)([^}]*)(\} from 'next\/navigation';)$/m,
        (m0, a, names, c) => a + ' useSearchParams,' + names + c);
    } else {
      s = s.replace(/^(import QuizNavHeader from )/m,
        "import { useSearchParams } from 'next/navigation';\n$1");
    }
  }
  const block = [
    ownsSp ? null : '  const searchParams = useSearchParams();',
    '  // THE STAGE. Same three-way switch every daily uses, keyed by this file',
    '  // rather than by a registry key, because a quiz has no registry row and',
    '  // the unit of rollout is the CLIENT: see lib/quiz-stage.js.',
    `  const QSTAGE = isQuizStage('${CLIENT}', searchParams);`,
    '  const [stageTheme] = useStageTheme();',
    '  // TEXT and FILL are separate names on purpose. Near-black TEXT is',
    '  // invisible on this ground and has to move; a near-black FILL is a',
    '  // perfectly good object on it and stays. One restyled COLORS would',
    '  // conflate the two and turn every dark chip on the board pale.',
    "  const INK = QSTAGE ? 'var(--stg-ink,#e9edf4)' : COLORS.ink;",
    "  const FADED = QSTAGE ? 'var(--stg-mute,#8b95a8)' : COLORS.faded;",
    "  const SURF = QSTAGE ? 'var(--stg-surf,rgba(255,255,255,0.045))' : T.white;",
    "  const SURF_B = QSTAGE ? 'var(--stg-line,rgba(255,255,255,0.11))' : COLORS.line;",
    '  // THE ONE QUIZ ACCENT, read as the variable the root publishes rather',
    '  // than as a literal, so it follows the light switch. See lib/quiz-stage.js.',
    "  const QACC = QSTAGE ? 'var(--stg-acc)' : COLORS.ember;",
    "  const ON_ACC = QSTAGE ? 'var(--stg-onramp,#08222e)' : T.white;",
  ].filter(Boolean).join('\n');
  const at = ownsSp ? spAt : s.split('\n').findIndex((l) => COMP.test(l));
  const out = s.split('\n');
  out.splice(at + 1, 0, block);
  s = out.join('\n');
  n += 1;
  console.log(`  + flag block: after line ${at + 1}${ownsSp ? ' (kept the client\'s own searchParams)' : ''}`);
}

// ── 4. THE ROOT, transformed rather than replaced ───────────────────────────
// It keeps whatever background expression the client had for its non-stage
// branch, so a client spelling the page ground COLORS.cream and one spelling it
// T.surface both work. The guard is what keeps the loose line match honest: the
// line has to carry the two things that make it a page root, or the patch stops
// rather than rewriting an element it has not identified.
//
// BOTH roots convert where there are two. Eleven of the twelve render a "quiz
// not found" branch with a root of its own, and leaving it behind would put one
// cream page inside a converted client -- which is the half-conversion that is
// worse than none.
{
  const ROOT = /^( *)<div (className=\{[^\n]*?\} )?style=\{\{ (minHeight: '100vh'[^\n]*?) \}\}>$/gm;
  const found = s.match(ROOT) || [];
  if (!found.length) throw new Error('no page root element in this client');
  s = s.replace(ROOT, (m0, pad, cls, inner) => {
    for (const must of ['minHeight', 'background:']) {
      if (!m0.includes(must)) throw new Error(`root line missing ${must}: ${m0.trim()}`);
    }
    // The client's OWN background expression, kept for the non-stage branch. It
    // ends at the next comma at PAREN DEPTH ZERO, because rgba(28,30,36,0.5)
    // has three commas of its own.
    const bgAt = inner.indexOf('background:') + 'background:'.length;
    let depth = 0, bgEnd = inner.length;
    for (let i = bgAt; i < inner.length; i++) {
      const c = inner[i];
      if (c === '(' || c === '[' || c === '{') depth++;
      else if (c === ')' || c === ']' || c === '}') { if (depth === 0) { bgEnd = i; break; } depth--; }
      else if (c === ',' && depth === 0) { bgEnd = i; break; }
    }
    const bg = inner.slice(bgAt, bgEnd).trim();
    // Everything else, minus the three properties re-emitted below.
    const parts = [];
    let d = 0, start = 0;
    for (let i = 0; i <= inner.length; i++) {
      const c = inner[i];
      if (i === inner.length || (c === ',' && d === 0)) { parts.push(inner.slice(start, i)); start = i + 1; }
      else if (c === '(' || c === '[' || c === '{') d++;
      else if (c === ')' || c === ']' || c === '}') d--;
    }
    const kept = parts.map((p) => p.trim()).filter((t) =>
      t && !/^background\s*:/.test(t) && !/^color\s*:/.test(t));
    const style = ['...(QSTAGE ? QUIZ_ACC_VARS : null)', ...kept,
      `background: QSTAGE ? 'var(--stg-ground)' : ${bg}`,
      "color: QSTAGE ? 'var(--stg-ink,#e9edf4)' : COLORS.ink"].join(', ');
    // The existing className expression is kept and the stage class is put in
    // front of it, so a client already switching on the Loft keeps that branch.
    const keptCls = cls ? cls.trim().replace(/^className=\{/, '').replace(/\}$/, '') : 'undefined';
    n += 1;
    return `${pad}<div className={QSTAGE ? 'stage-page' : (${keptCls})}\n`
      + `${pad}  data-stage-theme={QSTAGE ? stageTheme : undefined}\n`
      + `${pad}  style={{ ${style} }}>`;
  });
  console.log(`  + root: ${found.length}`);
}

// ── 5. THE TAKEOVER ─────────────────────────────────────────────────────────
// The stage pattern's first rule: the page is the thing. No site masthead above
// it, no footer below it, and no paper grain on a near-black ground.
//
// The masthead is gated HERE rather than left to the :has() rule in
// app/globals.css that already hides it, because hiding it in CSS still pays
// for it: QuizNavHeader fetches the player identity on mount and hosts its own
// sign-up modal. A hidden header that still makes a request is a header.
edit('grain', '<Grain />', '{!QSTAGE && <Grain />}', { optional: true, expect: hits('<Grain />') });
{
  // THREE SHAPES, and the third one is why this is not a find-and-replace.
  // Eight clients wrap the header in a positioned div, two render it bare, and
  // QuizClient renders it as one arm of a JSX TERNARY -- where wrapping the
  // match in braces emits `{ ... : {!QSTAGE && <X/>}}`, which is an object
  // literal where an expression belongs and does not parse at all. So the
  // ternary is gated from OUTSIDE, at the container.
  const WRAPPED = /^( *)(<div style=\{\{ position: 'relative', zIndex: 3 \}\}>(?:(?!<\/div>).)*<QuizNavHeader \/><\/div>)$/m;
  const TERNARY = /\{(LOFT \? [^{}]*: <QuizNavHeader \/>)\}/;
  if (hits(WRAPPED) === 1) {
    edit('masthead (wrapped)', WRAPPED, '$1{!QSTAGE && $2}');
  } else if (hits(TERNARY) === 1) {
    edit('masthead (ternary)', TERNARY, '{!QSTAGE && ($1)}');
  } else {
    edit('masthead', /(?<!\{!QSTAGE && )<QuizNavHeader \/>/g, '{!QSTAGE && <QuizNavHeader />}',
      { expect: hits(/(?<!\{!QSTAGE && )<QuizNavHeader \/>/g) });
  }
}
edit('footer', /^( *)<Footer \/>$/gm, '$1{!QSTAGE && <Footer />}', { expect: hits(/^ *<Footer \/>$/gm) });

// ── 6. TEXT COLOUR, inline and inside the client's own CSS template ─────────
// ONLY `color:`. A `background:` of the same token is a fill decision and is
// left alone; each board decides those for itself.
//
// THE LOOKBEHIND IS LOAD-BEARING: `border-color:` ends with `color:`, so a bare
// pattern converts border colours too, which are fills. That bug quietly moved
// a border on the first daily this technique was used on.
//
// SCOPE-BOUND. INK and FADED are declared INSIDE the component, and several of
// these clients define helper components ABOVE it, where that const is not an
// ancestor scope at all. Rewriting a colour up there is not a dead zone, it is
// ReferenceError, and esbuild parses it happily.
function belowDecl(id, re, to) {
  const at = s.split('\n').findIndex((l) => new RegExp('^\\s*const\\s+' + id + '\\s*=').test(l));
  if (at < 0) return;
  const lines = s.split('\n');
  let h = 0;
  for (let i = at + 1; i < lines.length; i++) {
    const next = lines[i].replace(re, to);
    if (next !== lines[i]) { h += 1; lines[i] = next; }
  }
  s = lines.join('\n');
  n += h;
  console.log(`  · ${id} text (below decl): ${h}`);
}
belowDecl('INK', /(?<![-\w])color: COLORS\.ink\b/g, 'color: INK');
belowDecl('FADED', /(?<![-\w])color: COLORS\.faded\b/g, 'color: FADED');
belowDecl('FADED', /(?<![-\w])color: COLORS\.soft\b/g, 'color: FADED');
belowDecl('INK', /(?<![-\w])color:\$\{COLORS\.ink\}/g, 'color:${INK}');
belowDecl('FADED', /(?<![-\w])color:\$\{COLORS\.faded\}/g, 'color:${FADED}');

// ── 7. THE CTA RULE ─────────────────────────────────────────────────────────
// A surface on the stage takes the stage's accent with the ink that rides on
// it, and that is its primary. T.cta was the only mid-tone saturated fill on a
// stage and the only fill carrying WHITE ink, which is exactly what made it
// read as a button borrowed from another design.
// TWO SPELLINGS OF THE SAME BUTTON. Half the surface writes the CTA's ink as
// T.white and half as T.ctaInk, and a rule that knows only the first walks past
// every site in the other half in silence -- which is how the very first daily
// converted shipped with a brand-blue Start button for a deploy, caught by
// looking at the live page rather than by reading the diff.
{
  const CTA = /background: T\.cta, color: T\.(white|ctaInk)\b/g;
  const h = hits(CTA);
  if (h) {
    s = s.replace(CTA, (m0, ink) => `background: QSTAGE ? QACC : T.cta, color: QSTAGE ? ON_ACC : T.${ink}`);
    n += h;
  }
  console.log(`  · start CTA: ${h}`);
}

writeFileSync(path, s);
console.log(`patched ${n} edits in ${path} (client key: ${CLIENT})`);

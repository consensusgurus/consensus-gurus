// QuizClient's BOARD pass: the surfaces, hairlines and inks the chrome
// conversion deliberately leaves alone.
//
//   node scripts/patch-quizclient-board.mjs
//
// Run AFTER patch-quiz-stage.mjs and patch-quizclient-stage.mjs. The chrome
// conversion gives a client the stage ground and takes the old page's furniture
// away; what it leaves is every surface the board itself paints, and on a
// near-black ground those are twenty-four white rectangles and sixteen
// invisible hairlines. A page in that state is a HALF-CONVERSION, which reads
// as broken rather than as unfinished, so this is not optional follow-up work.
//
// ── THE TECHNIQUE: var() WITH THE ORIGINAL AS THE FALLBACK ──────────────────
//
// Every replacement here is `var(--stg-token, <the original expression>)`. The
// stage tokens are defined ONLY on .stage-page (app/globals.css), so off the
// stage every one of them is undefined and the fallback is what paints -- which
// makes '?stage=0' byte-identical rather than merely equivalent.
//
// It also solves the one thing the INK / FADED / SURF consts cannot. Those are
// declared INSIDE the component, and this file's module-level style objects
// (fieldStyle, StatBox, ghostBtn) are evaluated at import time where no such
// const is in scope -- rewriting one to read SURF is not a dead zone, it is
// ReferenceError, and esbuild parses it happily.
//
// ── AND THE ROLE RULE ───────────────────────────────────────────────────────
//
// A fill, a hairline and a page ground are three different objects and bucketing
// them by colour is how the last sweep of this kind walked past half its work:
//
//   a raised surface (a tile, a chip, a field)   --stg-surf
//   a more raised one (a tray, a track)          --stg-surf2
//   the PAGE's own ground (a sticky bar, a dock) --stg-ground
//   a modal sheet                                --stg-panel
//   a hairline, a rule, a border                 --stg-line
//
// A cream BUTTON and a cream STICKY BAR are the same literal and different
// objects, which is why the seven cream sites below are named one at a time
// rather than swept.
import { readFileSync, writeFileSync } from 'node:fs';

const path = process.argv[2] || 'app/quiz/[id]/QuizClient.jsx';
let s = readFileSync(path, 'utf8');
if (!/const QSTAGE = isQuizStage\('QuizClient'/.test(s)) {
  throw new Error('convert the chrome first: there is no QSTAGE flag in this file');
}
let n = 0;

// EXACTLY-ONCE anchors, for the sites whose ROLE cannot be read off the literal.
function one(name, anchor, to) {
  const hits = s.split(anchor).length - 1;
  if (hits !== 1) throw new Error(`anchor "${name}" matched ${hits} times, expected exactly 1`);
  s = s.replace(anchor, to); n += 1;
  console.log(`  + ${name}`);
}
// COUNTED sweeps, for the ones whose role the literal does settle.
function sweep(name, re, to, expect) {
  const hits = (s.match(re) || []).length;
  if (expect != null && hits !== expect) {
    throw new Error(`sweep "${name}" found ${hits} sites, expected ${expect}: origin has moved, look before you patch`);
  }
  s = s.replace(re, to); n += hits;
  console.log(`  · ${name}: ${hits}`);
}

// ── 1. THE PAGE'S OWN GROUND, three sites that are not surfaces ─────────────
// A sticky bar and a fixed dock are the page showing through, not a card on it.
// Painted --stg-surf they become a lighter band across the board, which is a
// rectangle nobody designed -- the same mistake the daily board card made.
one('sticky score bar', "style={{ position: 'sticky', top: 0, zIndex: 24, background: COLORS.cream }}",
  "style={{ position: 'sticky', top: 0, zIndex: 24, background: `var(--stg-ground,${COLORS.cream})` }}");
one('mobile answer dock', "zIndex: 40, background: COLORS.cream, borderTop:",
  "zIndex: 40, background: `var(--stg-ground,${COLORS.cream})`, borderTop:");
// A modal SHEET is its own register: it has to read as lifted off the page it
// covers, which is what --stg-panel is for.
one('modal sheet', "style={{ width: '100%', maxWidth: 480, background: COLORS.cream, borderRadius:",
  "style={{ width: '100%', maxWidth: 480, background: `var(--stg-panel,${COLORS.cream})`, borderRadius:");

// ── 2. THE FLAG PLATE STAYS WHITE, and this is a MEANING, not a style ───────
// It is the plate a flag PNG is shown on. Half the world's flags carry white,
// so on a near-black ground the plate is what makes them read as flags rather
// than as shapes floating in the page. Neutralising it to a surface would
// delete information. Marked here so the sweep below cannot take it.
one('flag plate (kept white)', "borderRadius: 3, background: T.white, display: 'block' }}",
  "borderRadius: 3, background: T.white /* stage: KEPT WHITE, see patch-quizclient-board.mjs */, display: 'block' }}");

// ── 3. RAISED SURFACES ──────────────────────────────────────────────────────
// The answer-progress track is the one paper site that is a TRACK rather than
// a card: it wants the more-raised step, so that the accent bar running along
// it has something to be brighter than. Named before the sweep below, or the
// sweep takes it.
one('progress track', "background: COLORS.paper, overflow: 'hid",
  "background: `var(--stg-surf2,${COLORS.paper})`, overflow: 'hid");
sweep('white surfaces', /background: T\.white\b(?! \/\* stage)/g,
  'background: `var(--stg-surf,${T.white})`', 9);
sweep('paper surfaces', /background: COLORS\.paper\b/g,
  'background: `var(--stg-surf,${COLORS.paper})`', 4);
sweep('trays', /background: T\.surfaceAlt\b/g,
  'background: `var(--stg-surf2,${T.surfaceAlt})`', 2);
// What is left of the cream literal is BUTTONS, now that the three page-ground
// sites above are named. A button is a raised surface.
sweep('cream buttons', /background: COLORS\.cream,/g,
  'background: `var(--stg-surf,${COLORS.cream})`,', 4);

// ── 4. HAIRLINES ────────────────────────────────────────────────────────────
// Near-black on near-black is not a subtle border, it is no border: sixteen
// element edges simply stop existing. This is the single biggest reason an
// unconverted board looks like a bug rather than like a light board.
sweep('ink borders', /(border(?:Top|Bottom|Left|Right)?: `1(?:\.5)?px solid )\$\{COLORS\.ink\}`/g,
  '$1var(--stg-line,${COLORS.ink})`', 16);
sweep('line borders', /(border(?:Top|Bottom|Left|Right)?: `1(?:\.5)?px solid )\$\{COLORS\.line\}`/g,
  '$1var(--stg-line,${COLORS.line})`', 6);
sweep('faded borders', /\$\{COLORS\.faded\}(33|55)`/g,
  'var(--stg-line,${COLORS.faded}$1)`', 5);

// ── 5. FILLS THAT CARRY MEANING, and the ink that rides on each ────────────
//
// Three different fills are left, and they are three different objects. Doing
// them by hue would put all three on the accent; doing them by ALPHA would put
// none of them anywhere. The pairing is what matters: a fill and its ink move
// together or the element becomes invisible in one register while looking fine
// in the other -- which is the exact bug the last accent sweep shipped, ink
// converted and ground not, unreadable in BOTH directions at once.
//
//   an ACCENT fill (the old ember, the brand cta)  -> --stg-acc  + --stg-onramp
//   a NEAR-BLACK fill (a dark chip)                -> --stg-surf2 + --stg-ink
//   a MEANING fill (right/wrong, the challenge     -> left exactly as it is
//     tint) 
//
// The near-black chip is the one the daily rule gets misread on. "A near-black
// FILL is a perfectly good object and stays" was written about a LIGHT page,
// where it is. On this ground it is the ground, so the chip disappears and its
// cream ink disappears with it. It becomes a raised surface instead, which is
// what a chip on a dark page is.
{
  const lines = s.split('\n');
  let acc = 0, chip = 0, tint = 0;
  const ACC_FILL = /background: (COLORS\.ember|T\.accent|T\.cta)\b/;
  for (let i = 0; i < lines.length; i++) {
    let l = lines[i];
    if (/--stg-/.test(l)) continue;
    if (ACC_FILL.test(l)) {
      l = l.replace(/background: (COLORS\.ember|T\.accent|T\.cta)\b/g, 'background: `var(--stg-acc,${$1})`');
      l = l.replace(/(?<![-\w])color: (T\.white|T\.ctaInk)\b/g, 'color: `var(--stg-onramp,${$1})`');
      acc++;
    } else if (/background: COLORS\.ink\b/.test(l)) {
      l = l.replace(/background: COLORS\.ink\b/g, 'background: `var(--stg-surf2,${COLORS.ink})`');
      l = l.replace(/(?<![-\w])color: (T\.white|COLORS\.cream)\b/g, 'color: `var(--stg-ink,${$1})`');
      chip++;
    }
    // A MEANING CHIP gives up its FILL on the stage and keeps its border and
    // its ink, so a warning stops being the brightest thing on a near-black
    // page. --stg-chip exists for exactly this and is deliberately undefined
    // off the stage, so the fallback keeps the old wash.
    if (/background: COLORS\.accSoft\b/.test(l)) {
      l = l.replace(/background: COLORS\.accSoft\b/g, 'background: `var(--stg-chip,${COLORS.accSoft})`');
      tint++;
    }
    lines[i] = l;
  }
  s = lines.join('\n');
  n += acc + chip + tint;
  console.log(`  · accent fills: ${acc}   dark chips: ${chip}   meaning tints: ${tint}`);
  if (!acc || !chip) throw new Error('expected both an accent fill and a dark chip in this client; origin has moved');
}

// ── 5b. A RAW HEX IS A PALETTE TOO ─────────────────────────────────────────
//
// Every sweep above matches a NAME (COLORS.x, T.x), so a colour written as a
// literal is invisible to all of them -- the same blind spot as a palette that
// is not called `accent`, wearing different clothes. Three of this client's
// most-read lines are one: the idle screen's rules paragraph, the result line
// and the reveal note all paint '#4a4339', a warm near-black chosen for cream,
// which on this ground is unreadable at 1.4:1 while every checker reports clean.
//
// It becomes the SECONDARY ink rather than the primary: these are three
// subordinate lines under a heading, and that relationship should survive the
// move.
sweep('raw-hex body ink', /color: '#4a4339'/g, "color: `var(--stg-ink2,#4a4339)`", 3);

// ── 5c. TERNARY ARMS: THE STATE YOU ONLY SEE WHILE PLAYING ─────────────────
//
// ⚠️ EVERY SWEEP ABOVE MATCHES `background: <name>` AT THE START OF THE VALUE,
// so a colour that is one ARM of a ternary is invisible to all of them. That is
// where a board keeps its STATES -- empty, active, found, revealed -- and a
// state is drawn only while somebody is playing, which is precisely the moment
// no at-rest scan is looking.
//
// It cost a deploy. The at-rest page reported ONE light surface (the accent
// bar); pressing Start put TEN white answer slots and a white input on the
// near-black ground, each carrying the stage's near-white ink, so the slots
// were unreadable in BOTH directions at once -- the exact shape of the bug the
// last accent sweep shipped, ground not moved while ink was.
//
// So this pass is VALUE-SEGMENT AWARE rather than prefix-anchored: it finds a
// `background:` or `color:`, walks to the end of that property's value (the
// next comma at PAREN DEPTH ZERO, because rgba(20,22,28,0.3) has three commas
// of its own), and converts the light names ANYWHERE inside it. A ternary, a
// nested ternary and a bare value are all the same shape to it.
//
// MEANING COLOURS ARE LEFT: '#fdecec' says "you missed this one" and '#fbb615'
// is a badge. Neutralising those to a surface deletes what they say.
{
  // EVERY LIGHT NAME THE THEME HAS, not the ones this file happened to use at
  // the top of a value. COLORS is an alias layer over T (cream: T.surface,
  // paper: T.paper), so a client mixes both spellings freely and a map holding
  // only one of each pair leaves the other arm of a ternary light -- which is
  // what left the answer input painting T.paper under near-white ink after the
  // first arm had already converted.
  const BG = {
    'T.white': '--stg-surf', 'T.paper': '--stg-surf', 'T.surface': '--stg-surf',
    'T.surfaceAlt': '--stg-surf2',
    'COLORS.cream': '--stg-surf', 'COLORS.paper': '--stg-surf',
    'COLORS.ink': '--stg-surf2',
    // A FOUND SLOT is a meaning chip: it gives up its pale accent WASH on the
    // stage and keeps its accent hairline and its tick, so it stops being the
    // brightest thing on a near-black page while still reading as found.
    // --stg-chip is defined only on .stage-page, so the fallback keeps the old
    // wash everywhere else.
    'COLORS.accSoft': '--stg-chip',
  };
  const FG = { 'COLORS.cream': '--stg-ink', 'COLORS.ink': '--stg-ink',
    'COLORS.faded': '--stg-mute', 'COLORS.soft': '--stg-mute' };
  let bgN = 0, fgN = 0;
  const valueEnd = (str, from) => {
    let d = 0;
    for (let i = from; i < str.length; i++) {
      const c = str[i];
      if (c === '(' || c === '[' || c === '{') d++;
      else if (c === ')' || c === ']' || c === '}') { if (d === 0) return i; d--; }
      else if (c === ',' && d === 0) return i;
    }
    return str.length;
  };
  const pass = (prop, map, onlyTernary) => {
    const lines = s.split('\n');
    let hits = 0;
    for (let i = 0; i < lines.length; i++) {
      let l = lines[i];
      let out = '', at = 0;
      const re = new RegExp('(?<![-\\w])' + prop + ': ', 'g');
      let m;
      while ((m = re.exec(l))) {
        const vs = m.index + m[0].length;
        const ve = valueEnd(l, vs);
        let seg = l.slice(vs, ve);
        // Already converted, or a bare value an earlier named pass owns.
        if (!seg.includes('var(--stg-') && (!onlyTernary || seg.includes('?'))) {
          for (const [name, token] of Object.entries(map)) {
            const nre = new RegExp('(?<![\\w$.])' + name.replace('.', '\\.') + '(?![\\w$])', 'g');
            if (nre.test(seg)) {
              seg = seg.replace(nre, '`var(' + token + ',${' + name + '})`');
              hits += 1;
            }
          }
        }
        out += l.slice(at, vs) + seg;
        at = ve;
        re.lastIndex = at;
      }
      if (at) { lines[i] = out + l.slice(at); }
    }
    s = lines.join('\n');
    return hits;
  };
  // BORDERS TOO, and for the same reason: a found slot's accent hairline and a
  // row's rule are both written as ternary arms. COLORS.line and COLORS.ink are
  // near-black on near-black here, which is not a subtle border, it is no
  // border at all -- element edges simply stop existing.
  const BD = { 'COLORS.accBorder': '--stg-acc', 'COLORS.line': '--stg-line', 'COLORS.ink': '--stg-line',
    'COLORS.faded': '--stg-line' };
  bgN = pass('background', BG, false);
  const bdN = pass('border', BD, true) + pass('borderColor', BD, false);
  n += bdN;
  console.log(`  · ternary borders: ${bdN}`);
  // `color:` is restricted to TERNARIES on purpose: the bare ones are already
  // owned by the INK / FADED consts the chrome pass declared, and converting
  // them again would be two mechanisms for one decision.
  fgN = pass('color', FG, true);
  n += bgN + fgN;
  console.log(`  · ternary-aware backgrounds: ${bgN}   ternary inks: ${fgN}`);
  if (!bgN) throw new Error('expected state-bearing background ternaries in this client; origin has moved');
}

// ── 6. THE MODULE-LEVEL HELPERS, which no const can reach ──────────────────
//
// ghostBtn, labelStyle, fieldStyle and StatBox sit at the FOOT of this file,
// past the component's closing brace, and they paint text too. The chrome
// converter deliberately cannot touch them: INK and FADED are declared inside
// the component, so a rewrite out here is `ReferenceError: FADED is not
// defined` -- which 500'd all ~1,200 quiz pages once, with the flag off,
// because a module-level style object is evaluated whatever the flag says.
//
// var() is the answer for exactly this reason: a custom property is resolved by
// the BROWSER against whatever element the style lands on, so it needs no
// lexical scope at all. Undefined off the stage, so the fallback paints and
// '?stage=0' stays byte-identical.
{
  const lines = s.split('\n');
  const start = lines.findIndex((l) => /^export default function [A-Za-z_$][\w$]*\(\{ quizId/.test(l));
  let end = lines.length - 1;
  for (let i = start + 1; i < lines.length; i++) { if (/^\}\s*$/.test(lines[i])) { end = i; break; } }
  let h = 0;
  for (let i = 0; i < lines.length; i++) {
    if (i > start && i <= end) continue;
    let l = lines[i];
    // NO `--stg-` SKIP HERE. The earlier sweeps have already converted these
    // same lines' BORDERS, so a guard that skips any line already carrying a
    // token skips exactly the lines that still need their text moved -- which
    // left three near-black inks on a near-black page and reported success.
    // The patterns below cannot double-convert, because each requires the bare
    // COLORS.x form that a converted site no longer has.
    const before = l;
    l = l.replace(/(?<![-\w])color: COLORS\.faded\b/g, 'color: `var(--stg-mute,${COLORS.faded})`');
    l = l.replace(/(?<![-\w])color: COLORS\.soft\b/g, 'color: `var(--stg-mute,${COLORS.soft})`');
    l = l.replace(/(?<![-\w])color: COLORS\.ink\b/g, 'color: `var(--stg-ink,${COLORS.ink})`');
    // A TERNARY ink, where the accent arm and the near-black arm both have to
    // move or the element is legible in one state and not the other.
    l = l.replace(/(?<![-\w])color: ([A-Za-z]+) \? COLORS\.ember : COLORS\.ink\b/g,
      'color: $1 ? `var(--stg-acc,${COLORS.ember})` : `var(--stg-ink,${COLORS.ink})`');
    if (l !== before) { lines[i] = l; h += 1; }
  }
  s = lines.join('\n');
  n += h;
  console.log(`  · module-level helper text: ${h}`);
  if (!h) throw new Error('expected module-level helpers painting text in this client; origin has moved');
}

writeFileSync(path, s);
console.log(`patched ${n} sites in ${path}`);

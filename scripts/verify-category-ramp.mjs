// Proves the category ramp rather than trusting its comments.
//
// Run: node scripts/verify-category-ramp.mjs
//
// Five checks, and the reason each exists:
//
//   1. EVERY REGISTRY CATEGORY MAPS. A category nobody remembered to add would
//      silently fall back to sky, which is Word's colour, so an unmapped
//      category does not look broken, it looks like Word. That is the failure
//      mode this exists to catch, and it is exactly what happened to the ramp
//      once already: the roster grew to nine categories against eight steps.
//   2. INK CONTRAST. Every step carries RAMP_INK at 4.5:1 or better. The whole
//      premise of a pastel ramp is that one dark ink works on all of it.
//   3. GROUND CONTRAST. Every step carries against the near-black stage, so a
//      lit rung and an unlit one are tellable at 3:1 or better.
//   4. NO DUPLICATE STEPS. Two categories sharing a hex is the collision the
//      ramp was created to end.
//   5. HUE SPACING, as a WARNING not a failure. Only one category is on screen
//      at a time on a stage, so neighbours may sit close there. It becomes a
//      hard rule the day the home's filled shelf bands adopt these values, and
//      lib/home-blues.js already documents that rule as >=30 degrees.

// The app's modules use the '@/' alias and extensionless relative imports,
// neither of which plain node resolves. Register the shared hook first, then
// import dynamically, because the hook has to be installed before the import
// is resolved. Same pattern as scripts/verify-endgame-board.mjs.
import { register } from 'node:module';
register('./alias-loader.mjs', import.meta.url);

const {
  RAMP_ORDER, CATEGORY_RAMP, RAMP_INK, STAGE_GROUND,
  rampIndexFor, gameColor,
} = await import('../lib/category-ramp.js');
const { DAILY_GAMES } = await import('../lib/daily-games.js');

const INK_MIN = 4.5;
const GROUND_MIN = 3;
const HUE_MIN = 30;

let fails = 0;
let warns = 0;
const fail = (m) => { console.error('✗ ' + m); fails += 1; };
const warn = (m) => { console.warn('… ' + m); warns += 1; };
const ok = (m) => console.log('ok    ' + m);

function rgb(hex) {
  const h = String(hex).replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}
function lum(hex) {
  const [r, g, b] = rgb(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
function hue(hex) {
  const [r, g, b] = rgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}
const apart = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

// ── 1. lengths and coverage ────────────────────────────────────────────────
if (RAMP_ORDER.length !== CATEGORY_RAMP.length) {
  fail(`RAMP_ORDER has ${RAMP_ORDER.length} categories and CATEGORY_RAMP has ${CATEGORY_RAMP.length} steps`);
} else {
  ok(`${RAMP_ORDER.length} categories, ${CATEGORY_RAMP.length} steps`);
}

const registryCats = [...new Set(DAILY_GAMES.map((g) => g.cat).filter(Boolean))];
for (const cat of registryCats) {
  if (rampIndexFor(cat) < 0) fail(`registry category "${cat}" maps to no ramp step, so it renders as Word`);
}
if (registryCats.every((c) => rampIndexFor(c) >= 0)) {
  ok(`all ${registryCats.length} registry categories map: ${registryCats.join(', ')}`);
}
for (const cat of RAMP_ORDER) {
  if (!registryCats.some((c) => c.toLowerCase() === cat.toLowerCase())) {
    warn(`ramp lists "${cat}" but no game carries it, so that step is unused`);
  }
}

// Every game resolves to a real step.
const bad = DAILY_GAMES.filter((g) => !CATEGORY_RAMP.includes(gameColor(g.key)));
if (bad.length) fail(`${bad.length} games resolve outside the ramp: ${bad.slice(0, 5).map((g) => g.key).join(', ')}`);
else ok(`all ${DAILY_GAMES.length} games resolve to a ramp step`);

// ── 2, 3, 4. contrast and collisions ───────────────────────────────────────
const seen = new Map();
CATEGORY_RAMP.forEach((hex, i) => {
  const cat = RAMP_ORDER[i] || `step ${i}`;
  const ink = contrast(hex, RAMP_INK);
  const gnd = contrast(hex, STAGE_GROUND);
  if (ink < INK_MIN) fail(`${cat} ${hex}: ink ${RAMP_INK} is ${ink.toFixed(2)}:1, under ${INK_MIN}`);
  if (gnd < GROUND_MIN) fail(`${cat} ${hex}: ground ${STAGE_GROUND} is ${gnd.toFixed(2)}:1, under ${GROUND_MIN}`);
  if (seen.has(hex)) fail(`${cat} repeats ${hex}, already used by ${seen.get(hex)}`);
  seen.set(hex, cat);
  if (ink >= INK_MIN && gnd >= GROUND_MIN) {
    ok(`${cat.padEnd(17)} ${hex}  ink ${ink.toFixed(2)}:1  ground ${gnd.toFixed(2)}:1  hue ${Math.round(hue(hex))}`);
  }
});

// ── 5. hue spacing between neighbours ──────────────────────────────────────
for (let i = 1; i < CATEGORY_RAMP.length; i += 1) {
  const d = apart(hue(CATEGORY_RAMP[i - 1]), hue(CATEGORY_RAMP[i]));
  if (d < HUE_MIN) {
    warn(`${RAMP_ORDER[i - 1]} and ${RAMP_ORDER[i]} are ${Math.round(d)} degrees apart, under ${HUE_MIN}. `
      + 'Fine while only one is on screen; fix before the home bands adopt these.');
  }
}

console.log(fails ? `\n${fails} failed, ${warns} warned` : `\nramp clean, ${warns} warned`);
process.exit(fails ? 1 : 0);

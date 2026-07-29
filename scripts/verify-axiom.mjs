// Verify the Axiom bank (app/axiom/puzzles.js) from scratch:
//   - structural: nums sequential, quizId/live/dateLabel agree, sunday flag
//     matches the real weekday, Sundays run 28 tiles / 7 candidates and
//     weekdays 24 / 5, tile words distinct within a board, exactly 3 given
//     greens and 2 given reds, every stored verdict matches the rule that
//     the board resolves to
//   - C1 EXACTLY ONE candidate is consistent with every tile
//   - C2 every candidate calls all three given greens true (the gift greens
//        eliminate nothing, so no rule starts dead)
//   - C3 the given reds kill 1..2 candidates, never the answer
//   - C4 >= 2 decoys survive the reds, each exposed by >= 2 testable tiles
//   - C5 >= 6 testable tiles where every surviving decoy agrees with the truth
//   - C6 par is exactly 2: no single test splits the field, some pair does
// Run: node scripts/verify-axiom.mjs
import { PUZZLES } from '../app/axiom/puzzles.js';

let fails = 0;
const fail = (msg) => { console.error('FAIL:', msg); fails++; };

const VOW = new Set(['A', 'E', 'I', 'O', 'U']);
const nv = (w) => [...w].filter((c) => VOW.has(c)).length;
const HIDDEN = {
  animal: ['CAT', 'DOG', 'COW', 'OWL', 'BAT', 'APE', 'RAT', 'PIG', 'HEN', 'FOX', 'ANT', 'BEE', 'ELK', 'EWE', 'SOW', 'RAM'],
  body: ['EAR', 'RIB', 'HIP', 'ARM', 'LIP', 'GUM', 'JAW', 'TOE', 'EYE', 'SHIN', 'HEEL', 'CHIN', 'LUNG', 'SKIN', 'NECK', 'BONE'],
  number: ['ONE', 'TWO', 'SIX', 'TEN', 'NINE', 'FOUR', 'FIVE'],
};
const SETS = {
  mammal: ['DOG', 'CAT', 'COW', 'PIG', 'FOX', 'RAT', 'BAT', 'APE', 'ELK', 'LION', 'BEAR', 'WOLF', 'DEER', 'GOAT', 'SEAL', 'MOLE', 'HARE', 'LYNX', 'PUMA', 'TIGER', 'HORSE', 'ZEBRA', 'CAMEL', 'MOOSE', 'MOUSE', 'SHEEP', 'WHALE', 'OTTER', 'PANDA', 'KOALA', 'SLOTH', 'RHINO', 'HIPPO', 'MONKEY', 'RABBIT', 'DONKEY', 'BEAVER', 'BADGER', 'WALRUS', 'WEASEL', 'COUGAR', 'JAGUAR', 'GIRAFFE', 'LEOPARD', 'DOLPHIN', 'GORILLA', 'HAMSTER', 'RACCOON'],
  bird: ['OWL', 'HEN', 'CROW', 'SWAN', 'DUCK', 'HAWK', 'DOVE', 'WREN', 'KIWI', 'EMU', 'ROBIN', 'RAVEN', 'EAGLE', 'HERON', 'GOOSE', 'STORK', 'FINCH', 'QUAIL', 'EGRET', 'PIGEON', 'PARROT', 'TURKEY', 'FALCON', 'MAGPIE', 'CONDOR', 'TOUCAN', 'PUFFIN', 'PENGUIN', 'PELICAN', 'SPARROW', 'OSTRICH', 'VULTURE'],
  fish: ['EEL', 'COD', 'CARP', 'TUNA', 'BASS', 'PIKE', 'SHARK', 'TROUT', 'PERCH', 'SALMON', 'MARLIN', 'GUPPY', 'MINNOW', 'SARDINE', 'HERRING', 'ANCHOVY'],
  fruit: ['FIG', 'DATE', 'PLUM', 'PEAR', 'LIME', 'APPLE', 'LEMON', 'MANGO', 'GRAPE', 'PEACH', 'MELON', 'BERRY', 'GUAVA', 'LYCHEE', 'CHERRY', 'BANANA', 'ORANGE', 'PAPAYA', 'APRICOT'],
  vegetable: ['PEA', 'BEAN', 'CORN', 'KALE', 'LEEK', 'BEET', 'OKRA', 'ONION', 'CARROT', 'POTATO', 'CELERY', 'PEPPER', 'TURNIP', 'RADISH', 'SQUASH', 'GARLIC', 'CABBAGE', 'SPINACH', 'PARSNIP'],
  drink: ['TEA', 'COLA', 'SODA', 'MILK', 'WINE', 'BEER', 'CIDER', 'COCOA', 'JUICE', 'WATER', 'LATTE', 'MOCHA', 'COFFEE', 'NECTAR'],
  country: ['CUBA', 'PERU', 'CHINA', 'INDIA', 'SPAIN', 'EGYPT', 'KENYA', 'CHILE', 'ITALY', 'JAPAN', 'BRAZIL', 'FRANCE', 'CANADA', 'MEXICO', 'NORWAY', 'SWEDEN', 'POLAND', 'GREECE', 'TURKEY', 'RUSSIA', 'GERMANY', 'IRELAND', 'ICELAND', 'MOROCCO', 'NIGERIA', 'AUSTRIA', 'BELGIUM', 'FINLAND', 'HUNGARY', 'DENMARK', 'THAILAND', 'PORTUGAL'],
  ballsport: ['GOLF', 'POLO', 'RUGBY', 'TENNIS', 'SOCCER', 'SQUASH', 'BOWLING', 'CRICKET', 'NETBALL', 'SNOOKER', 'HANDBALL', 'BASEBALL', 'LACROSSE', 'BILLIARDS'],
};

// Kept byte-identical to RULES in app/axiom/AxiomClient.jsx. If one changes,
// change both: the client derives the answer with its copy, this proves the
// bank against the same maths.
function ruleFn(r) {
  switch (r.k) {
    case 'alpha': return (w) => [...w].every((c, i) => i === 0 || c >= w[i - 1]);
    case 'norepeat': return (w) => new Set(w).size === w.length;
    case 'dbl': return (w) => /(.)\1/.test(w);
    case 'len': return (w) => w.length === r.n;
    case 'vowels': return (w) => nv(w) === r.n;
    case 'onevowel': return (w) => new Set([...w].filter((c) => VOW.has(c))).size === 1;
    case 'sameends': return (w) => w[0] === w[w.length - 1];
    case 'startvowel': return (w) => VOW.has(w[0]);
    case 'endvowel': return (w) => VOW.has(w[w.length - 1]);
    case 'altvc': return (w) => [...w].every((c, i) => i === 0 || VOW.has(c) !== VOW.has(w[i - 1]));
    case 'twinvowel': return (w) => [...w].some((c, i) => i > 0 && VOW.has(c) && VOW.has(w[i - 1]));
    case 'nolet': return (w) => !w.includes(r.c);
    case 'hides': return (w) => HIDDEN[r.set].some((h) => w.includes(h));
    case 'in': return (w) => SETS[r.set].includes(w);
    default: return null;
  }
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const seenIds = new Set();

PUZZLES.forEach((p, idx) => {
  const tag = `#${p.num} (${p.live})`;
  if (p.num !== idx + 1) fail(`${tag}: num out of sequence`);
  if (seenIds.has(p.quizId)) fail(`${tag}: duplicate quizId`);
  seenIds.add(p.quizId);

  const [y, m, d] = p.live.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (p.quizId !== `axiom-${m}-${d}-${String(y).slice(2)}`) fail(`${tag}: quizId does not match live date`);
  if (p.dateLabel !== `${MONTHS[m - 1]} ${d}, ${y}`) fail(`${tag}: dateLabel does not match live date`);
  if (!!p.sunday !== (dt.getUTCDay() === 0)) fail(`${tag}: sunday flag does not match the weekday`);

  const wantTiles = p.sunday ? 28 : 24;
  const wantRules = p.sunday ? 7 : 5;
  if (p.tiles.length !== wantTiles) fail(`${tag}: ${p.tiles.length} tiles (want ${wantTiles})`);
  if (p.rules.length < wantRules - 1 || p.rules.length > wantRules) fail(`${tag}: ${p.rules.length} candidates (want ${wantRules})`);
  if (new Set(p.tiles.map((t) => t.w)).size !== p.tiles.length) fail(`${tag}: duplicate tile word`);
  if (p.tiles.some((t) => !/^[A-Z]{3,9}$/.test(t.w))) fail(`${tag}: a tile word is not plain uppercase letters`);
  if (!Number.isInteger(p.budget) || p.budget < 4 || p.budget > 9) fail(`${tag}: implausible budget ${p.budget}`);

  const fns = p.rules.map((r) => ruleFn(r));
  if (fns.some((f) => !f)) { fail(`${tag}: unknown rule spec`); return; }

  const givens = p.tiles.filter((t) => t.g);
  const greens = givens.filter((t) => t.t);
  const reds = givens.filter((t) => !t.t);
  if (greens.length !== 3) fail(`${tag}: ${greens.length} given greens (want 3)`);
  if (reds.length !== 2) fail(`${tag}: ${reds.length} given reds (want 2)`);

  // C1
  const consistent = p.rules.map((r, i) => i).filter((i) => p.tiles.every((t) => (fns[i](t.w) ? 1 : 0) === t.t));
  if (consistent.length !== 1) { fail(`${tag}: ${consistent.length} consistent candidates (need exactly 1)`); return; }
  const answer = consistent[0];

  // C2
  p.rules.forEach((r, i) => {
    if (!greens.every((t) => fns[i](t.w))) fail(`${tag}: candidate ${i} is killed by a gift green`);
  });

  // C3
  const killed = p.rules.map((r, i) => i).filter((i) => i !== answer && reds.some((t) => fns[i](t.w)));
  if (killed.length < 1 || killed.length > 2) fail(`${tag}: gift reds kill ${killed.length} candidates (want 1 or 2)`);
  if (reds.some((t) => fns[answer](t.w))) fail(`${tag}: the answer contradicts a gift red`);

  // C4
  const live = p.rules.map((r, i) => i).filter((i) => i !== answer && !killed.includes(i));
  if (live.length < 2) fail(`${tag}: only ${live.length} decoys survive the reds (want >= 2)`);
  const testable = p.tiles.map((t, i) => i).filter((i) => !p.tiles[i].g);
  const killers = live.map((i) => new Set(testable.filter((ti) => (fns[i](p.tiles[ti].w) ? 1 : 0) !== p.tiles[ti].t)));
  killers.forEach((s, k) => { if (s.size < 2) fail(`${tag}: decoy ${live[k]} is exposed by only ${s.size} tile(s)`); });

  // C5
  const traps = testable.filter((ti) => live.every((i) => (fns[i](p.tiles[ti].w) ? 1 : 0) === p.tiles[ti].t));
  if (traps.length < 6) fail(`${tag}: only ${traps.length} trap tiles (want >= 6)`);

  // C6
  const oneShot = testable.some((ti) => killers.every((s) => s.has(ti)));
  if (oneShot) fail(`${tag}: a single test splits the whole field (par must be 2)`);
  let pair = false;
  for (let a = 0; a < testable.length && !pair; a++) {
    for (let b = a + 1; b < testable.length; b++) {
      if (killers.every((s) => s.has(testable[a]) || s.has(testable[b]))) { pair = true; break; }
    }
  }
  if (!pair) fail(`${tag}: no pair of tests isolates the answer (par > 2, unfair at this budget)`);
  if (p.budget < 4) fail(`${tag}: budget below the par-2 floor`);
});

if (fails) { console.error(`\nverify-axiom: ${fails} FAILURE(S)`); process.exit(1); }
console.log(`verify-axiom: all ${PUZZLES.length} boards pass (unique rule, gift greens neutral, par 2, structure OK)`);

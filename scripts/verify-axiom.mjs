// Verify the Axiom bank (app/axiom/puzzles.js) from scratch:
//   - structural: nums sequential, quizId/live/dateLabel agree, sunday flag
//     matches the real weekday, Sundays run 28 tiles / 7 candidates and
//     weekdays 24 / 5, tile words distinct within a board, exactly 3 given
//     greens and 2 given reds, every stored verdict matches the rule that
//     the board resolves to
//   - C1 EXACTLY ONE candidate is consistent with every tile
//   - C2 every candidate calls all three given greens true (the gift greens
//        eliminate nothing, so no rule starts dead)
//   - C3 the given reds kill 1..2 candidates (1..3 on Sunday), never the answer
//   - C4 >= 2 decoys survive the reds, each exposed by >= 2 testable tiles
//   - C5 >= 6 testable tiles where every surviving decoy agrees with the truth
//   - C6 perfect is exactly 2: no single test splits the field, some pair does
// and, for every board built under the v2 generator (num > LEGACY_THROUGH):
//   - C7 the filler kinds are capped: at most one "contains no letter X" (two
//     on a Sunday's wider field) and at most one "exactly N letters long", so
//     the field stops being padded with rules that are never the answer
//   - C8 enough tiles are informative that the deduction is findable by hand
//   - C9 perfect-2 pairs are at least 12% of all tile pairs (9% on Sunday), so a
//     thinking player is not hunting one needle in 171
//   - C10 bank-wide: the answer is spread across the candidate slots, and no
//     rule kind that appears often is a free cross-out
//   - C11 no near-miss tiles on a set or hidden-word board (see NEAR below).
//     The candidates stopped printing their array on 2026-08-08, so a player now
//     supplies the knowledge themselves. That is only fair while the board never
//     contains a word whose real-world classification disagrees with the array:
//     ANTELOPE under "it is a mammal" scored false and made correct reasoning
//     wrong. Boards live before NEAR_FROM are already played and are exempt.
// Run: node scripts/verify-axiom.mjs
import { PUZZLES } from '../app/axiom/puzzles.js';

let fails = 0;
const fail = (msg) => { console.error('FAIL:', msg); fails++; };

// Boards 1-6 shipped under the v1 generator and are already live or played, so
// they are frozen: structure and the uniqueness constraints still apply to them,
// the v2 quality floors do not.
const LEGACY_THROUGH = 6;
const bank = [];

const VOW = new Set(['A', 'E', 'I', 'O', 'U']);
const nv = (w) => [...w].filter((c) => VOW.has(c)).length;
const HIDDEN = {
  animal: ['CAT', 'DOG', 'COW', 'OWL', 'BAT', 'APE', 'RAT', 'PIG', 'HEN', 'FOX', 'ANT', 'BEE', 'ELK', 'EWE', 'SOW', 'RAM'],
  body: ['EAR', 'RIB', 'HIP', 'ARM', 'LIP', 'GUM', 'JAW', 'TOE', 'EYE', 'LEG', 'SHIN', 'HEEL', 'CHIN', 'LUNG', 'SKIN', 'NECK', 'BONE', 'FOOT', 'HAND', 'HEAD', 'NOSE', 'KNEE', 'ELBOW', 'WRIST', 'ANKLE', 'THUMB', 'THIGH', 'SPINE', 'HEART', 'BRAIN', 'LIVER', 'TOOTH', 'CHEST', 'THROAT', 'TONGUE'],
  number: ['ONE', 'TWO', 'SIX', 'TEN', 'NINE', 'FOUR', 'FIVE'],
};
const SETS = {
  mammal: ['DOG', 'CAT', 'COW', 'PIG', 'FOX', 'RAT', 'BAT', 'APE', 'ELK', 'YAK', 'LION', 'BEAR', 'WOLF', 'DEER', 'GOAT', 'SEAL', 'MOLE', 'HARE', 'LYNX', 'PUMA', 'ORCA', 'BOAR', 'TIGER', 'HORSE', 'ZEBRA', 'CAMEL', 'MOOSE', 'MOUSE', 'SHEEP', 'WHALE', 'OTTER', 'PANDA', 'KOALA', 'SLOTH', 'RHINO', 'HIPPO', 'BISON', 'HYENA', 'LLAMA', 'LEMUR', 'SKUNK', 'TAPIR', 'MONKEY', 'RABBIT', 'DONKEY', 'BEAVER', 'BADGER', 'WALRUS', 'WEASEL', 'COUGAR', 'JAGUAR', 'BABOON', 'ALPACA', 'COYOTE', 'FERRET', 'MARMOT', 'WOMBAT', 'GIRAFFE', 'LEOPARD', 'DOLPHIN', 'GORILLA', 'HAMSTER', 'RACCOON', 'BUFFALO', 'CHEETAH', 'GAZELLE', 'MEERKAT', 'OPOSSUM', 'PANTHER', 'WARTHOG', 'ANTELOPE', 'KANGAROO', 'PORPOISE', 'REINDEER', 'SQUIRREL', 'CHIPMUNK', 'HEDGEHOG', 'MONGOOSE', 'PLATYPUS', 'ARMADILLO', 'PORCUPINE'],
  bird: ['OWL', 'HEN', 'CROW', 'SWAN', 'DUCK', 'HAWK', 'DOVE', 'WREN', 'KIWI', 'EMU', 'ROBIN', 'RAVEN', 'EAGLE', 'HERON', 'GOOSE', 'STORK', 'FINCH', 'QUAIL', 'EGRET', 'PIGEON', 'PARROT', 'TURKEY', 'FALCON', 'MAGPIE', 'CONDOR', 'TOUCAN', 'PUFFIN', 'PENGUIN', 'PELICAN', 'SPARROW', 'OSTRICH', 'VULTURE'],
  fish: ['EEL', 'COD', 'CARP', 'TUNA', 'BASS', 'PIKE', 'SHARK', 'TROUT', 'PERCH', 'SALMON', 'MARLIN', 'GUPPY', 'MINNOW', 'SARDINE', 'HERRING', 'ANCHOVY'],
  fruit: ['FIG', 'DATE', 'PLUM', 'PEAR', 'LIME', 'APPLE', 'LEMON', 'MANGO', 'GRAPE', 'PEACH', 'MELON', 'BERRY', 'GUAVA', 'LYCHEE', 'CHERRY', 'BANANA', 'ORANGE', 'PAPAYA', 'APRICOT'],
  vegetable: ['PEA', 'BEAN', 'CORN', 'KALE', 'LEEK', 'BEET', 'OKRA', 'ONION', 'CARROT', 'POTATO', 'CELERY', 'PEPPER', 'TURNIP', 'RADISH', 'SQUASH', 'GARLIC', 'CABBAGE', 'SPINACH', 'PARSNIP'],
  drink: ['TEA', 'COLA', 'SODA', 'MILK', 'WINE', 'BEER', 'CIDER', 'COCOA', 'JUICE', 'WATER', 'LATTE', 'MOCHA', 'COFFEE', 'NECTAR'],
  country: [
   'CHAD', 'CUBA', 'FIJI', 'IRAN', 'IRAQ', 'LAOS', 'MALI', 'OMAN', 'PERU', 'TOGO', 'BENIN', 'CHILE', 'CHINA',
    'EGYPT', 'GABON', 'GHANA', 'HAITI', 'INDIA', 'ITALY', 'JAPAN', 'KENYA', 'LIBYA', 'MALTA', 'NAURU', 'NEPAL',
    'NIGER', 'PALAU', 'QATAR', 'SAMOA', 'SPAIN', 'SUDAN', 'SYRIA', 'TONGA', 'YEMEN', 'ANGOLA', 'BELIZE',
    'BHUTAN', 'BRAZIL', 'BRUNEI', 'CANADA', 'CYPRUS', 'FRANCE', 'GAMBIA', 'GREECE', 'GUINEA', 'GUYANA',
    'ISRAEL', 'JORDAN', 'KUWAIT', 'LATVIA', 'MALAWI', 'MEXICO', 'MONACO', 'NORWAY', 'PANAMA', 'POLAND',
    'RUSSIA', 'RWANDA', 'SERBIA', 'SWEDEN', 'TURKEY', 'TUVALU', 'UGANDA', 'ZAMBIA', 'ALBANIA', 'ALGERIA',
    'ANDORRA', 'ARMENIA', 'AUSTRIA', 'BAHRAIN', 'BELARUS', 'BELGIUM', 'BOLIVIA', 'BURUNDI', 'COMOROS',
    'CROATIA', 'DENMARK', 'ECUADOR', 'ERITREA', 'ESTONIA', 'FINLAND', 'GEORGIA', 'GERMANY', 'GRENADA',
    'HUNGARY', 'ICELAND', 'IRELAND', 'JAMAICA', 'LEBANON', 'LESOTHO', 'LIBERIA', 'MOLDOVA', 'MOROCCO',
    'MYANMAR', 'NAMIBIA', 'NIGERIA', 'ROMANIA', 'SENEGAL', 'SOMALIA', 'TUNISIA', 'UKRAINE', 'URUGUAY',
    'VANUATU', 'VIETNAM', 'BARBADOS', 'BOTSWANA', 'BULGARIA', 'CAMBODIA', 'CAMEROON', 'COLOMBIA', 'DJIBOUTI',
    'DOMINICA', 'ESWATINI', 'ETHIOPIA', 'HONDURAS', 'KIRIBATI', 'MALAYSIA', 'MALDIVES', 'MONGOLIA', 'PAKISTAN',
    'PARAGUAY', 'PORTUGAL', 'SLOVAKIA', 'SLOVENIA', 'SURINAME', 'TANZANIA', 'THAILAND', 'ZIMBABWE',
    'ARGENTINA', 'AUSTRALIA', 'GUATEMALA', 'INDONESIA', 'LITHUANIA', 'MAURITIUS', 'NICARAGUA', 'SINGAPORE',
    'VENEZUELA', 'AZERBAIJAN', 'BANGLADESH', 'KAZAKHSTAN', 'KYRGYZSTAN', 'LUXEMBOURG', 'MADAGASCAR',
    'MAURITANIA', 'MONTENEGRO', 'MOZAMBIQUE', 'SEYCHELLES', 'TAJIKISTAN', 'UZBEKISTAN', 'AFGHANISTAN',
    'NETHERLANDS', 'PHILIPPINES', 'SWITZERLAND', 'TURKMENISTAN', 'LIECHTENSTEIN'],
  ballsport: ['GOLF', 'POLO', 'RUGBY', 'BOCCE', 'BOWLS', 'PADEL', 'FUTSAL', 'PELOTA', 'BOULES', 'SHINTY', 'TENNIS', 'SOCCER', 'SQUASH', 'CROQUET', 'HURLING', 'BOWLING', 'CRICKET', 'NETBALL', 'SNOOKER', 'FOOTBALL', 'SOFTBALL', 'KICKBALL', 'FOOSBALL', 'KORFBALL', 'PETANQUE', 'HANDBALL', 'BASEBALL', 'LACROSSE', 'ROUNDERS', 'PINGPONG', 'WATERPOLO', 'DODGEBALL', 'BILLIARDS', 'STICKBALL', 'BASKETBALL', 'VOLLEYBALL', 'PICKLEBALL', 'TETHERBALL', 'WIFFLEBALL', 'RACQUETBALL', 'FIELDHOCKEY', 'TABLETENNIS'],
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
  if (killed.length < 1) fail(`${tag}: gift reds kill nothing`);
  if (reds.some((t) => fns[answer](t.w))) fail(`${tag}: the answer contradicts a gift red`);
  if (killed.length > (p.sunday ? 3 : 2)) fail(`${tag}: gift reds kill ${killed.length} candidates`);

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
  if (oneShot) fail(`${tag}: a single test splits the whole field (perfect must be 2)`);
  let pair = false;
  for (let a = 0; a < testable.length && !pair; a++) {
    for (let b = a + 1; b < testable.length; b++) {
      if (killers.every((s) => s.has(testable[a]) || s.has(testable[b]))) { pair = true; break; }
    }
  }
  if (!pair) fail(`${tag}: no pair of tests isolates the answer (perfect > 2, unfair at this budget)`);
  if (p.budget < 4) fail(`${tag}: budget below the perfect-2 floor`);

  if (p.num > LEGACY_THROUGH) {
    // C7 filler caps
    const nolet = p.rules.filter((r) => r.k === 'nolet').length;
    const lens = p.rules.filter((r) => r.k === 'len').length;
    if (nolet > (p.sunday ? 2 : 1)) fail(`${tag}: ${nolet} "no letter X" candidates (cap ${p.sunday ? 2 : 1})`);
    if (lens > 1) fail(`${tag}: ${lens} "exactly N letters" candidates (cap 1)`);

    // C8 informative-tile floor
    const inform = testable.length - traps.length;
    const informMin = p.sunday ? 10 : 8;
    if (inform < informMin) fail(`${tag}: only ${inform} informative tiles (want >= ${informMin})`);

    // C9 perfect-2 pairs have to be findable, not a needle
    let pairs = 0; let totPairs = 0;
    for (let a = 0; a < testable.length; a++) {
      for (let b = a + 1; b < testable.length; b++) {
        totPairs++;
        if (killers.every((s) => s.has(testable[a]) || s.has(testable[b]))) pairs++;
      }
    }
    const pct = pairs / totPairs;
    const pctMin = p.sunday ? 0.09 : 0.12;
    if (pct < pctMin) fail(`${tag}: only ${pairs}/${totPairs} perfect-2 pairs (${(100 * pct).toFixed(0)}%, want >= ${(100 * pctMin).toFixed(0)}%)`);
  }

  bank.push({ num: p.num, slot: answer, kinds: p.rules.map((r) => r.k), answerKind: p.rules[answer].k });
});

// C10 bank-wide balance. A single board can look fine while the BANK teaches a
// shortcut: before this check the topic and hidden-word rules were the answer
// every single time they appeared, and slot A held 44% of the answers, so a
// player could skip the board entirely and still be right most days. Only the
// v2 boards are measured, and only once there are enough of them to mean
// anything.
const v2 = bank.filter((b) => b.num > LEGACY_THROUGH);
if (v2.length >= 12) {
  const slots = {};
  v2.forEach((b) => { slots[b.slot] = (slots[b.slot] || 0) + 1; });
  const worstSlot = Math.max(...Object.values(slots));
  if (worstSlot / v2.length > 0.45) fail(`bank: one candidate slot holds ${worstSlot} of ${v2.length} answers (>45%), the answer order is not shuffled enough`);

  const seen = {};
  v2.forEach((b) => {
    b.kinds.forEach((k) => { seen[k] = seen[k] || [0, 0]; seen[k][0]++; });
    seen[b.answerKind][1]++;
  });
  Object.entries(seen).forEach(([k, [appears, isAnswer]]) => {
    if (appears < 4) return;                       // too rare to teach anything
    const rate = isAnswer / appears;
    if (rate < 0.08) fail(`bank: "${k}" appears ${appears} times and is the answer ${isAnswer} (${(100 * rate).toFixed(0)}%), so crossing it out on sight is a free win`);
    if (rate > 0.75) fail(`bank: "${k}" is the answer ${isAnswer} of the ${appears} times it appears (${(100 * rate).toFixed(0)}%), so picking it on sight is a free win`);
  });
}

// ─── C11: no near-miss tiles ────────────────────────────────────────────────
// Words a reasonable person puts in the set that the array leaves out. A tile
// like this makes correct real-world reasoning give the wrong answer, which is
// exactly what the printed roster used to paper over. Grow these lists whenever
// a set gains a board; a false positive here costs one tile swap, a miss costs a
// player their round. Note the gaps this encodes: SETS.ballsport has no
// volleyball or basketball, HIDDEN.body no foot/leg/hand/head, HIDDEN.animal no
// ass. Either add the word to the array or keep it off the board.
const NEAR_FROM = '2026-08-09';   // boards live before this are already played
const NEAR = {
  mammal: ['ANTEATER','CHIMP','CHIMPANZEE','MANATEE','NARWHAL','STOAT','MINK','POSSUM','IMPALA','ORYX','BULL','CALF','LAMB','PONY','MULE','KITTEN','PUPPY','HUMAN','BUCK','FAWN','STAG','JACKAL','DINGO','BOBCAT','OCELOT','GRIZZLY','CARIBOU','OKAPI','SHREW','VOLE','GERBIL','CHINCHILLA','LEMMING','MUSKRAT'],
  bird: ['SEAGULL','GULL','CANARY','BLUEJAY','JAY','CARDINAL','ORIOLE','STARLING','SWALLOW','THRUSH','LARK','NIGHTINGALE','WOODPECKER','KINGFISHER','FLAMINGO','PEACOCK','PHEASANT','PARTRIDGE','GROUSE','ALBATROSS','CORMORANT','SANDPIPER','PLOVER','CURLEW','BUZZARD','KESTREL','OSPREY','MACAW','COCKATOO','BUDGIE','CUCKOO','SWIFT','WAGTAIL','CHAFFINCH','GOLDFINCH','ROOSTER','CHICK','DUCKLING','GOSLING','CYGNET','RHEA','CASSOWARY','KOOKABURRA','HORNBILL','IBIS','CRANE','GREBE','COOT','MOORHEN','TERN','GANNET'],
  fish: ['RAY','SOLE','HAKE','SNAPPER','MACKEREL','HALIBUT','FLOUNDER','STURGEON','TILAPIA','CATFISH','GOLDFISH','SWORDFISH','BARRACUDA','PIRANHA','GROUPER','MULLET','BREAM','ROACH','TENCH','WHITING','HADDOCK','POLLOCK','PLAICE','TURBOT','MONKFISH','ANGLERFISH','MOLLY','TETRA','BETTA','KOI','WAHOO','TARPON','LAMPREY','MORAY','CONGER','SKATE','DOGFISH'],
  fruit: ['TOMATO','AVOCADO','CUCUMBER','PUMPKIN','OLIVE','COCONUT','PINEAPPLE','STRAWBERRY','RASPBERRY','BLUEBERRY','BLACKBERRY','CRANBERRY','WATERMELON','NECTARINE','POMEGRANATE','RHUBARB','TANGERINE','CLEMENTINE','SATSUMA','PERSIMMON','QUINCE','PLANTAIN','CANTALOUPE','HONEYDEW','STARFRUIT','JACKFRUIT','KUMQUAT','GOOSEBERRY','ELDERBERRY','MULBERRY','CURRANT','PRUNE','RAISIN','SULTANA','KIWI','PAWPAW','TAMARIND','POMELO'],
  vegetable: ['TOMATO','AVOCADO','CUCUMBER','MUSHROOM','LETTUCE','BROCCOLI','CAULIFLOWER','ASPARAGUS','ZUCCHINI','COURGETTE','EGGPLANT','AUBERGINE','ARTICHOKE','YAM','CHARD','ENDIVE','SHALLOT','SCALLION','CHIVE','FENNEL','SWEDE','RUTABAGA','PUMPKIN','MARROW','SPROUT','WATERCRESS','ARUGULA','ROCKET','CASSAVA','TARO','LENTIL','CHICKPEA','SOYBEAN','EDAMAME','KOHLRABI'],
  drink: ['SMOOTHIE','LEMONADE','WHISKEY','WHISKY','VODKA','RUM','GIN','ALE','PUNCH','BRANDY','SHERRY','ESPRESSO','CHAI','KEFIR','SAKE','MEAD','TONIC','SELTZER','BROTH','LIQUEUR','CHAMPAGNE','PROSECCO','BOURBON','SCOTCH','TEQUILA','MEZCAL','ABSINTHE','VERMOUTH','STOUT','LAGER','PILSNER','SHANDY','SANGRIA','MARTINI','MOJITO','MILKSHAKE','EGGNOG','HORCHATA','KOMBUCHA','LASSI','CORDIAL'],
  country: ['TAIWAN','WALES','SCOTLAND','ENGLAND','PALESTINE','KOSOVO','TIBET','GREENLAND','VATICAN','KOREA','CONGO','BRITAIN','ULSTER','MACAU','GIBRALTAR','BERMUDA','ARUBA','PERSIA','BURMA','SIAM','PRUSSIA','HOLLAND','EIRE','SCOTIA','CATALONIA','BAVARIA','QUEBEC','TEXAS'],
  ballsport: ['JAIALAI','CAMOGIE','POLOCROSSE','SEPAKTAKRAW','KABADDI','FRONTENIS'],
};
const HIDDEN_NEAR = {
  animal: ['ASS','DOE','KID','CUB','PUP','COD','EEL','ROE','TIT','JAY','GNU','YAK','BOA','ASP','FLY','BUG','CRAB','FROG','TOAD','WORM','MOTH','WASP','SEAL','LION','BEAR','WOLF','DEER','GOAT','MULE','FOAL','LAMB','CALF','CROW','DOVE','DUCK','SWAN','HAWK','MOLE','HARE','LYNX','PUMA','GOOSE','SHEEP','HORSE','MOUSE'],
  body: ['NAIL','HAIR','BACK','FACE','CHEEK','PALM','WAIST','BELLY','KIDNEY','MUSCLE'],
  number: ['THREE','SEVEN','EIGHT','ZERO','ELEVEN','TWELVE','TWENTY','HUNDRED','MILLION','BILLION','DOZEN','SCORE','ONCE','TWICE'],
};
PUZZLES.forEach((p) => {
  if (p.live < NEAR_FROM) return;
  p.rules.forEach((r) => {
    if (r.k === 'in') {
      const near = NEAR[r.set] || [];
      p.tiles.forEach((t) => {
        if (!SETS[r.set].includes(t.w) && near.includes(t.w))
          fail(`C11 #${p.num} ${p.live}: "${t.w}" reads as ${r.set} but SETS.${r.set} leaves it out, so the board scores it false and correct reasoning loses. Swap the tile or add the word to the set.`);
      });
    }
    if (r.k === 'hides') {
      const near = (HIDDEN_NEAR[r.set] || []).filter((w) => !HIDDEN[r.set].includes(w));
      p.tiles.forEach((t) => {
        if (HIDDEN[r.set].some((h) => t.w.includes(h))) return;
        const seems = near.filter((h) => t.w.includes(h));
        if (seems.length)
          fail(`C11 #${p.num} ${p.live}: "${t.w}" looks like it hides ${seems.join('/')} (${r.set}) but HIDDEN.${r.set} leaves that out, so the board scores it false. Swap the tile or add the word.`);
      });
    }
  });
});

if (fails) { console.error(`\nverify-axiom: ${fails} FAILURE(S)`); process.exit(1); }
console.log(`verify-axiom: all ${PUZZLES.length} boards pass (unique rule, gift greens neutral, perfect 2, structure OK)`);

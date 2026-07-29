// Puzzle data for Axiom, the daily rule-induction game. Imported ONLY by the
// server page (app/axiom/page.js), which filters live<=today before passing
// boards to the client, so future boards never ship to the browser bundle.
//
// A board is 24 word tiles (Sunday 28) and five candidate rules (Sunday seven).
// Exactly ONE candidate is consistent with every tile. Three tiles open green
// and two open red; the player spends a test budget flipping more, then names
// the rule.
//
// LEAK GUARD: no board stores which rule is the answer. Each tile carries its
// verdict (t) because the board has to answer a test locally, and the client
// derives the answer the same way the generator proved it unique: it evaluates
// every candidate spec against every tile and keeps the one that agrees
// everywhere. Rule specs are DATA ({ k: 'alpha' }, { k: 'len', n: 6 }); the
// evaluator and the human-readable labels both live in RULES in AxiomClient.
//
// Every board is machine-verified (scripts/verify-axiom.mjs) to satisfy:
//   C1 exactly one candidate is consistent with the whole board
//   C2 every candidate calls all three given greens true, so the gift greens
//      eliminate nothing and each rule starts alive
//   C3 the given reds kill one or two candidates, never the answer
//   C4 at least two live decoys remain after the reds, each exposed by >= 2
//      testable tiles
//   C5 at least six testable tiles where every live decoy agrees with the
//      truth (the traps: testing one teaches nothing)
//   C6 par is exactly 2, so no single tile can split the field on its own
// Validate with scripts/verify-axiom.mjs after ANY edit.
export const PUZZLES = [
  {
    num: 1, quizId: 'axiom-7-24-26', live: '2026-07-24', dateLabel: 'July 24, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'dbl' }, { k: 'len', n: 6 }, { k: 'startvowel' }, { k: 'vowels', n: 2 }, { k: 'alpha' }],
    tiles: [
      { w: 'BEER', t: 1 }, { w: 'VOLUMES', t: 0 }, { w: 'FACED', t: 0 }, { w: 'BANNED', t: 0 },
      { w: 'PREVIEW', t: 0, g: 1 }, { w: 'EFFORT', t: 1, g: 1 }, { w: 'TRASHCAN', t: 0 }, { w: 'BEGINS', t: 1 },
      { w: 'FILLS', t: 1 }, { w: 'PINCHES', t: 0 }, { w: 'IDIOM', t: 0 }, { w: 'ACCEPT', t: 1 },
      { w: 'FALSE', t: 0, g: 1 }, { w: 'LUNCH', t: 0 }, { w: 'QUARTER', t: 0 }, { w: 'FLOATING', t: 0 },
      { w: 'ACCENT', t: 1, g: 1 }, { w: 'ABORT', t: 1 }, { w: 'HATE', t: 0 }, { w: 'TRAIL', t: 0 },
      { w: 'LOSS', t: 1 }, { w: 'ACCESS', t: 1, g: 1 }, { w: 'RAISES', t: 0 }, { w: 'LOOP', t: 1 },
    ],
  },
  {
    num: 2, quizId: 'axiom-7-25-26', live: '2026-07-25', dateLabel: 'July 25, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'nolet', c: 'E' }, { k: 'onevowel' }, { k: 'nolet', c: 'A' }, { k: 'hides', set: 'animal' }, { k: 'norepeat' }],
    tiles: [
      { w: 'FANTASY', t: 1 }, { w: 'NULL', t: 0 }, { w: 'DREADING', t: 0, g: 1 }, { w: 'OPTIONAL', t: 0 },
      { w: 'IMAGINES', t: 0 }, { w: 'REPEATS', t: 0 }, { w: 'RELATED', t: 0 }, { w: 'RAPE', t: 1 },
      { w: 'STARTLED', t: 0 }, { w: 'RAMPANT', t: 1 }, { w: 'DREADED', t: 0 }, { w: 'GLASSES', t: 0 },
      { w: 'BOWL', t: 1, g: 1 }, { w: 'RATIOS', t: 1 }, { w: 'THEN', t: 1 }, { w: 'DISAGREE', t: 0 },
      { w: 'PIGS', t: 1, g: 1 }, { w: 'NETWORK', t: 0 }, { w: 'HEAVEN', t: 0 }, { w: 'COWS', t: 1, g: 1 },
      { w: 'CATS', t: 1 }, { w: 'TAPES', t: 1 }, { w: 'ATOM', t: 0 }, { w: 'CHANGING', t: 0, g: 1 },
    ],
  },
  {
    num: 3, quizId: 'axiom-7-26-26', live: '2026-07-26', dateLabel: 'July 26, 2026', sunday: true,
    budget: 7,
    rules: [{ k: 'vowels', n: 2 }, { k: 'alpha' }, { k: 'dbl' }, { k: 'nolet', c: 'S' }, { k: 'onevowel' }, { k: 'nolet', c: 'A' }, { k: 'nolet', c: 'E' }],
    tiles: [
      { w: 'PASSWORD', t: 1 }, { w: 'HEAR', t: 0, g: 1 }, { w: 'INERTIA', t: 0 }, { w: 'LOOP', t: 1, g: 1 },
      { w: 'WAIT', t: 0 }, { w: 'PROMPTED', t: 0 }, { w: 'REST', t: 0 }, { w: 'NEEDED', t: 1 },
      { w: 'CORRIDOR', t: 1 }, { w: 'SOONEST', t: 1 }, { w: 'WHEREAS', t: 0 }, { w: 'FLOOR', t: 1, g: 1 },
      { w: 'OFFICERS', t: 1 }, { w: 'WORRIED', t: 1 }, { w: 'AIMED', t: 0 }, { w: 'EGOS', t: 0 },
      { w: 'MALES', t: 0 }, { w: 'ATTRACTS', t: 1 }, { w: 'SPEED', t: 1 }, { w: 'FLOPPY', t: 1 },
      { w: 'READY', t: 0 }, { w: 'TAKEN', t: 0 }, { w: 'PLATE', t: 0 }, { w: 'CLAIMED', t: 0 },
      { w: 'SMASHED', t: 0 }, { w: 'DOOR', t: 1, g: 1 }, { w: 'MEANT', t: 0 }, { w: 'ARGUED', t: 0, g: 1 },
    ],
  },
  {
    num: 4, quizId: 'axiom-7-27-26', live: '2026-07-27', dateLabel: 'July 27, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'nolet', c: 'A' }, { k: 'onevowel' }, { k: 'len', n: 5 }, { k: 'vowels', n: 2 }, { k: 'alpha' }],
    tiles: [
      { w: 'STUCK', t: 1 }, { w: 'COLLATE', t: 0 }, { w: 'APPOINT', t: 0 }, { w: 'DOORS', t: 1, g: 1 },
      { w: 'FIRST', t: 1 }, { w: 'BEERS', t: 1, g: 1 }, { w: 'COPY', t: 1 }, { w: 'BELIEVES', t: 0 },
      { w: 'FLOOR', t: 1, g: 1 }, { w: 'FAIRLY', t: 0 }, { w: 'DIRTY', t: 1 }, { w: 'IMAGES', t: 0, g: 1 },
      { w: 'LORRY', t: 1 }, { w: 'DEEM', t: 1 }, { w: 'LOWERS', t: 0 }, { w: 'ALMOST', t: 0 },
      { w: 'TAKE', t: 0 }, { w: 'GUARD', t: 0 }, { w: 'WIVE', t: 0 }, { w: 'SWEARS', t: 0 },
      { w: 'INPUTS', t: 0 }, { w: 'QUOTED', t: 0 }, { w: 'BRICK', t: 1 }, { w: 'MINDLESS', t: 0, g: 1 },
    ],
  },
  {
    num: 5, quizId: 'axiom-7-28-26', live: '2026-07-28', dateLabel: 'July 28, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'vowels', n: 3 }, { k: 'endvowel' }, { k: 'nolet', c: 'A' }, { k: 'sameends' }, { k: 'len', n: 7 }],
    tiles: [
      { w: 'TRACING', t: 0 }, { w: 'EXPENSE', t: 1, g: 1 }, { w: 'EXPLODE', t: 1 }, { w: 'LENSES', t: 0 },
      { w: 'PERMITS', t: 0, g: 1 }, { w: 'CYCLIST', t: 0 }, { w: 'HASSLE', t: 0 }, { w: 'SPOILS', t: 0 },
      { w: 'DRAINED', t: 1 }, { w: 'ENFORCE', t: 1 }, { w: 'BECAME', t: 1 }, { w: 'IMMENSE', t: 1 },
      { w: 'JUST', t: 0 }, { w: 'ESSENCE', t: 1, g: 1 }, { w: 'NOTION', t: 1 }, { w: 'DUCKS', t: 0 },
      { w: 'PREDICT', t: 0 }, { w: 'GOLDEN', t: 0 }, { w: 'STOLEN', t: 0 }, { w: 'WORLDS', t: 0 },
      { w: 'AGENDA', t: 1 }, { w: 'EXCLUDE', t: 1, g: 1 }, { w: 'TRUCKS', t: 0, g: 1 }, { w: 'COPYING', t: 0 },
    ],
  },
  {
    num: 6, quizId: 'axiom-7-29-26', live: '2026-07-29', dateLabel: 'July 29, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'len', n: 5 }, { k: 'hides', set: 'body' }, { k: 'startvowel' }, { k: 'nolet', c: 'S' }, { k: 'vowels', n: 2 }],
    tiles: [
      { w: 'OBSERVES', t: 0 }, { w: 'COOKIES', t: 0 }, { w: 'MOMENT', t: 0 }, { w: 'RESTRICT', t: 0 },
      { w: 'HORRIFIC', t: 0, g: 1 }, { w: 'SWEAR', t: 1 }, { w: 'BREEZE', t: 0 }, { w: 'EARS', t: 1 },
      { w: 'EARLY', t: 1, g: 1 }, { w: 'PROFIT', t: 0 }, { w: 'EARNS', t: 1 }, { w: 'APPEARS', t: 1 },
      { w: 'GLOW', t: 0 }, { w: 'FIXED', t: 0 }, { w: 'EARTH', t: 1, g: 1 }, { w: 'CRAWLED', t: 0 },
      { w: 'PARSING', t: 0, g: 1 }, { w: 'ALARM', t: 1, g: 1 }, { w: 'LIVELY', t: 0 }, { w: 'MENTALLY', t: 0 },
      { w: 'WARMS', t: 1 }, { w: 'TACK', t: 0 }, { w: 'DEGRADE', t: 0 }, { w: 'ARMED', t: 1 },
    ],
  },
  {
    num: 7, quizId: 'axiom-7-30-26', live: '2026-07-30', dateLabel: 'July 30, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'dbl' }, { k: 'nolet', c: 'A' }, { k: 'sameends' }, { k: 'twinvowel' }, { k: 'len', n: 6 }],
    tiles: [
      { w: 'KNOWS', t: 0, g: 1 }, { w: 'DULY', t: 0 }, { w: 'GUTS', t: 0 }, { w: 'SEEKS', t: 1 },
      { w: 'COURAGE', t: 0 }, { w: 'MYSTIC', t: 0 }, { w: 'EAGLE', t: 1 }, { w: 'AMENDS', t: 0 },
      { w: 'MINUTE', t: 0, g: 1 }, { w: 'RECYCLED', t: 0 }, { w: 'SMELLS', t: 1 }, { w: 'SQUEEZES', t: 1 },
      { w: 'DERANGES', t: 0 }, { w: 'SESSIONS', t: 1 }, { w: 'ASSORTED', t: 0 }, { w: 'DREADED', t: 1 },
      { w: 'PLANS', t: 0 }, { w: 'ALIGNED', t: 0 }, { w: 'SHOOTS', t: 1, g: 1 }, { w: 'SCROLLS', t: 1 },
      { w: 'DOOMED', t: 1, g: 1 }, { w: 'SLEEPS', t: 1, g: 1 }, { w: 'FROM', t: 0 }, { w: 'EDITED', t: 0 },
    ],
  },
  {
    num: 8, quizId: 'axiom-7-31-26', live: '2026-07-31', dateLabel: 'July 31, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'onevowel' }, { k: 'len', n: 5 }, { k: 'altvc' }, { k: 'vowels', n: 2 }, { k: 'nolet', c: 'A' }],
    tiles: [
      { w: 'SQUASHES', t: 0 }, { w: 'ENDS', t: 0 }, { w: 'INVOKED', t: 0 }, { w: 'RESERVES', t: 0, g: 1 },
      { w: 'USELESS', t: 0 }, { w: 'TOURIST', t: 0 }, { w: 'ARISE', t: 1 }, { w: 'NAME', t: 1 },
      { w: 'FIFTY', t: 0 }, { w: 'VOWEL', t: 1 }, { w: 'LOGIC', t: 1 }, { w: 'DELUSION', t: 0 },
      { w: 'BOGUS', t: 1 }, { w: 'HIDING', t: 0 }, { w: 'HATE', t: 1 }, { w: 'GRAFFITI', t: 0 },
      { w: 'RIGID', t: 1, g: 1 }, { w: 'MIMIC', t: 1, g: 1 }, { w: 'ELITIST', t: 0 }, { w: 'CLEANEST', t: 0 },
      { w: 'HEAVENS', t: 0, g: 1 }, { w: 'GENES', t: 1, g: 1 }, { w: 'REACHES', t: 0 }, { w: 'AWARE', t: 1 },
    ],
  },
  {
    num: 9, quizId: 'axiom-8-1-26', live: '2026-08-01', dateLabel: 'August 1, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'norepeat' }, { k: 'nolet', c: 'E' }, { k: 'len', n: 5 }, { k: 'endvowel' }, { k: 'vowels', n: 3 }],
    tiles: [
      { w: 'WESTERN', t: 0 }, { w: 'ASIDE', t: 1 }, { w: 'CRIME', t: 1 }, { w: 'PLEASANT', t: 0 },
      { w: 'UNLIKE', t: 1 }, { w: 'LIFTING', t: 0 }, { w: 'REMEDY', t: 0 }, { w: 'CIRCLE', t: 0 },
      { w: 'NAMELESS', t: 0, g: 1 }, { w: 'SUMMER', t: 0 }, { w: 'QUOTA', t: 1, g: 1 }, { w: 'ORTHODOX', t: 0, g: 1 },
      { w: 'IGNORING', t: 0 }, { w: 'CONTAINS', t: 0 }, { w: 'PIANO', t: 1, g: 1 }, { w: 'PRESUMED', t: 0 },
      { w: 'SPATIAL', t: 0 }, { w: 'SOUNDS', t: 0 }, { w: 'RATIO', t: 1, g: 1 }, { w: 'NURSE', t: 1 },
      { w: 'NOTES', t: 1 }, { w: 'HILLS', t: 0 }, { w: 'FATE', t: 1 }, { w: 'PROUD', t: 1 },
    ],
  },
  {
    num: 10, quizId: 'axiom-8-2-26', live: '2026-08-02', dateLabel: 'August 2, 2026', sunday: true,
    budget: 7,
    rules: [{ k: 'dbl' }, { k: 'nolet', c: 'E' }, { k: 'nolet', c: 'A' }, { k: 'nolet', c: 'S' }, { k: 'onevowel' }, { k: 'alpha' }, { k: 'twinvowel' }],
    tiles: [
      { w: 'SHEETS', t: 1 }, { w: 'FLOOR', t: 1, g: 1 }, { w: 'DESTINES', t: 0, g: 1 }, { w: 'INDEXES', t: 0 },
      { w: 'NICE', t: 0 }, { w: 'DOOR', t: 1, g: 1 }, { w: 'FREEZING', t: 1 }, { w: 'TOUCHING', t: 1 },
      { w: 'BURNED', t: 0 }, { w: 'FUNCTION', t: 1 }, { w: 'BOOT', t: 1 }, { w: 'FILMS', t: 0 },
      { w: 'KEYWORD', t: 0 }, { w: 'COWS', t: 0 }, { w: 'MILE', t: 0 }, { w: 'AGREEING', t: 1 },
      { w: 'WHALE', t: 0 }, { w: 'RAIL', t: 1 }, { w: 'SUCCEEDS', t: 1 }, { w: 'ABOVE', t: 0 },
      { w: 'EXOTIC', t: 0 }, { w: 'ANGRY', t: 0 }, { w: 'CAKES', t: 0 }, { w: 'BEHAVES', t: 0 },
      { w: 'SELLING', t: 0 }, { w: 'QUEEN', t: 1 }, { w: 'FOOT', t: 1, g: 1 }, { w: 'POLICE', t: 0, g: 1 },
    ],
  },
  {
    num: 11, quizId: 'axiom-8-3-26', live: '2026-08-03', dateLabel: 'August 3, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'nolet', c: 'E' }, { k: 'endvowel' }, { k: 'norepeat' }, { k: 'twinvowel' }, { k: 'len', n: 5 }],
    tiles: [
      { w: 'TITLE', t: 0 }, { w: 'SILLIEST', t: 0 }, { w: 'BANNER', t: 0 }, { w: 'KILLER', t: 0, g: 1 },
      { w: 'AUDIO', t: 1, g: 1 }, { w: 'SLEPT', t: 0 }, { w: 'BALLET', t: 0 }, { w: 'NORMAL', t: 1 },
      { w: 'LIGHTEST', t: 0 }, { w: 'SOULS', t: 1 }, { w: 'PLATFORM', t: 1 }, { w: 'INVENTS', t: 0 },
      { w: 'QUOTA', t: 1, g: 1 }, { w: 'RATIO', t: 1, g: 1 }, { w: 'CANCER', t: 0 }, { w: 'OFFICER', t: 0 },
      { w: 'VISUAL', t: 1 }, { w: 'DECIDING', t: 0 }, { w: 'RELIED', t: 0, g: 1 }, { w: 'CALLED', t: 0 },
      { w: 'DISCO', t: 1 }, { w: 'TASKS', t: 1 }, { w: 'JEANS', t: 0 }, { w: 'TWIN', t: 1 },
    ],
  },
  {
    num: 12, quizId: 'axiom-8-4-26', live: '2026-08-04', dateLabel: 'August 4, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'endvowel' }, { k: 'onevowel' }, { k: 'vowels', n: 2 }, { k: 'twinvowel' }, { k: 'nolet', c: 'A' }],
    tiles: [
      { w: 'SENTENCE', t: 1 }, { w: 'THEE', t: 1, g: 1 }, { w: 'FREE', t: 1, g: 1 }, { w: 'KNEE', t: 1, g: 1 },
      { w: 'NEEDLE', t: 1 }, { w: 'ENTERING', t: 0 }, { w: 'VERSE', t: 1 }, { w: 'REACHES', t: 0 },
      { w: 'GLOVE', t: 1 }, { w: 'CONSIDER', t: 0 }, { w: 'ASSERTED', t: 0 }, { w: 'HAPPILY', t: 0 },
      { w: 'EDUCATES', t: 0 }, { w: 'ASSURING', t: 0 }, { w: 'COMPUTED', t: 0 }, { w: 'GENTLE', t: 1 },
      { w: 'HOUSED', t: 0, g: 1 }, { w: 'PERSONAL', t: 0 }, { w: 'REPAIRS', t: 0 }, { w: 'UNIFIED', t: 0 },
      { w: 'PREFIXES', t: 0, g: 1 }, { w: 'THREE', t: 1 }, { w: 'STRIKE', t: 1 }, { w: 'MUCH', t: 0 },
    ],
  },
  {
    num: 13, quizId: 'axiom-8-5-26', live: '2026-08-05', dateLabel: 'August 5, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'vowels', n: 2 }, { k: 'nolet', c: 'A' }, { k: 'nolet', c: 'S' }, { k: 'hides', set: 'number' }, { k: 'norepeat' }],
    tiles: [
      { w: 'DEFINES', t: 0 }, { w: 'NOTICES', t: 0 }, { w: 'STEERED', t: 0, g: 1 }, { w: 'TENDING', t: 1 },
      { w: 'BRUSH', t: 0 }, { w: 'PRETENDS', t: 1 }, { w: 'FIVER', t: 1, g: 1 }, { w: 'SENIOR', t: 0, g: 1 },
      { w: 'EXTENDED', t: 1 }, { w: 'RELIEVES', t: 0 }, { w: 'MONEY', t: 1, g: 1 }, { w: 'SHEEP', t: 0 },
      { w: 'STYLES', t: 0 }, { w: 'PATENT', t: 1 }, { w: 'EVERYONE', t: 1 }, { w: 'NETWORKS', t: 1 },
      { w: 'FRIGHTEN', t: 1 }, { w: 'ALIAS', t: 0 }, { w: 'TYPE', t: 0 }, { w: 'DISTANCE', t: 0 },
      { w: 'BELIEFS', t: 0 }, { w: 'DONE', t: 1, g: 1 }, { w: 'ANGUISH', t: 0 }, { w: 'REVERSE', t: 0 },
    ],
  },
  {
    num: 14, quizId: 'axiom-8-6-26', live: '2026-08-06', dateLabel: 'August 6, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'nolet', c: 'E' }, { k: 'startvowel' }, { k: 'vowels', n: 2 }, { k: 'len', n: 5 }, { k: 'nolet', c: 'S' }],
    tiles: [
      { w: 'BABY', t: 0 }, { w: 'AGONY', t: 1, g: 1 }, { w: 'WHEREAS', t: 0 }, { w: 'IDEAS', t: 1 },
      { w: 'HALVES', t: 0 }, { w: 'ARTISTIC', t: 1 }, { w: 'UNTO', t: 1 }, { w: 'PROCESS', t: 0, g: 1 },
      { w: 'PUDDING', t: 0 }, { w: 'IMPLY', t: 1 }, { w: 'CLASS', t: 0 }, { w: 'EDGES', t: 1 },
      { w: 'SENIOR', t: 0 }, { w: 'DIES', t: 0 }, { w: 'OWING', t: 1, g: 1 }, { w: 'LASERS', t: 0 },
      { w: 'DEVICES', t: 0 }, { w: 'SEXUALLY', t: 0 }, { w: 'JUSTICE', t: 0, g: 1 }, { w: 'ALIGN', t: 1, g: 1 },
      { w: 'ABSORB', t: 1 }, { w: 'TYPESET', t: 0 }, { w: 'AWAITED', t: 1 }, { w: 'BEHAVES', t: 0 },
    ],
  },
  {
    num: 15, quizId: 'axiom-8-7-26', live: '2026-08-07', dateLabel: 'August 7, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'in', set: 'mammal' }, { k: 'vowels', n: 3 }, { k: 'twinvowel' }, { k: 'nolet', c: 'C' }, { k: 'nolet', c: 'L' }],
    tiles: [
      { w: 'FALCON', t: 0 }, { w: 'PARROT', t: 0 }, { w: 'LYNX', t: 1 }, { w: 'WEASEL', t: 1 },
      { w: 'JAGUAR', t: 1 }, { w: 'OCTOPUS', t: 0 }, { w: 'MOOSE', t: 1, g: 1 }, { w: 'BEAR', t: 1 },
      { w: 'MONKEY', t: 1 }, { w: 'DEER', t: 1 }, { w: 'MOUSE', t: 1, g: 1 }, { w: 'FINCH', t: 0 },
      { w: 'TURKEY', t: 0 }, { w: 'LEOPARD', t: 1 }, { w: 'PELICAN', t: 0, g: 1 }, { w: 'CARP', t: 0 },
      { w: 'GECKO', t: 0 }, { w: 'ANCHOVY', t: 0 }, { w: 'SEAL', t: 1 }, { w: 'SHEEP', t: 1 },
      { w: 'DUCK', t: 0 }, { w: 'CRAB', t: 0, g: 1 }, { w: 'KOALA', t: 1 }, { w: 'BEAVER', t: 1, g: 1 },
    ],
  },
  {
    num: 16, quizId: 'axiom-8-8-26', live: '2026-08-08', dateLabel: 'August 8, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'in', set: 'fruit' }, { k: 'onevowel' }, { k: 'len', n: 6 }, { k: 'nolet', c: 'S' }, { k: 'nolet', c: 'P' }],
    tiles: [
      { w: 'SQUASH', t: 0 }, { w: 'STEAK', t: 0 }, { w: 'CABBAGE', t: 0 }, { w: 'PEA', t: 0, g: 1 },
      { w: 'COCOA', t: 0 }, { w: 'TOAST', t: 0 }, { w: 'CARROT', t: 0 }, { w: 'LYCHEE', t: 1, g: 1 },
      { w: 'MOCHA', t: 0 }, { w: 'ONION', t: 0 }, { w: 'BEER', t: 0 }, { w: 'JUICE', t: 0 },
      { w: 'RICE', t: 0 }, { w: 'BREAD', t: 0 }, { w: 'SUGAR', t: 0, g: 1 }, { w: 'CANDY', t: 0 },
      { w: 'CIDER', t: 0 }, { w: 'PAPAYA', t: 1 }, { w: 'SOUP', t: 0 }, { w: 'BANANA', t: 1, g: 1 },
      { w: 'KALE', t: 0 }, { w: 'LATTE', t: 0 }, { w: 'SPINACH', t: 0 }, { w: 'CHERRY', t: 1, g: 1 },
    ],
  },
  {
    num: 17, quizId: 'axiom-8-10-26', live: '2026-08-10', dateLabel: 'August 10, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'in', set: 'country' }, { k: 'vowels', n: 3 }, { k: 'twinvowel' }, { k: 'nolet', c: 'B' }, { k: 'nolet', c: 'O' }],
    tiles: [
      { w: 'BELGIUM', t: 1 }, { w: 'NIGERIA', t: 1 }, { w: 'GREECE', t: 1 }, { w: 'ROME', t: 0, g: 1 },
      { w: 'MADRID', t: 0 }, { w: 'IRELAND', t: 1 }, { w: 'OSLO', t: 0 }, { w: 'MUNICH', t: 0 },
      { w: 'DALLAS', t: 0 }, { w: 'PARIS', t: 0 }, { w: 'DENVER', t: 0 }, { w: 'BERLIN', t: 0, g: 1 },
      { w: 'TOKYO', t: 0 }, { w: 'RUSSIA', t: 1, g: 1 }, { w: 'NAPLES', t: 0 }, { w: 'ATHENS', t: 0 },
      { w: 'LISBON', t: 0 }, { w: 'LONDON', t: 0 }, { w: 'INDIA', t: 1, g: 1 }, { w: 'SPAIN', t: 1 },
      { w: 'THAILAND', t: 1, g: 1 }, { w: 'LIMA', t: 0 }, { w: 'BOSTON', t: 0 }, { w: 'CANADA', t: 1 },
    ],
  },
  {
    num: 18, quizId: 'axiom-8-11-26', live: '2026-08-11', dateLabel: 'August 11, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'in', set: 'ballsport' }, { k: 'dbl' }, { k: 'nolet', c: 'G' }, { k: 'nolet', c: 'D' }, { k: 'nolet', c: 'M' }],
    tiles: [
      { w: 'BILLIARDS', t: 1 }, { w: 'SOCCER', t: 1 }, { w: 'BOXING', t: 0 }, { w: 'CYCLING', t: 0 },
      { w: 'CURLING', t: 0 }, { w: 'DIVING', t: 0, g: 1 }, { w: 'KAYAKING', t: 0 }, { w: 'SAILING', t: 0 },
      { w: 'SKATING', t: 0 }, { w: 'JAVELIN', t: 0 }, { w: 'RUNNING', t: 0 }, { w: 'FENCING', t: 0 },
      { w: 'HIKING', t: 0 }, { w: 'BASEBALL', t: 1, g: 1 }, { w: 'HANDBALL', t: 1 }, { w: 'MARATHON', t: 0 },
      { w: 'YACHTING', t: 0 }, { w: 'WRESTLING', t: 0 }, { w: 'CLIMBING', t: 0, g: 1 }, { w: 'LACROSSE', t: 1, g: 1 },
      { w: 'SQUASH', t: 1 }, { w: 'CANOEING', t: 0 }, { w: 'SURFING', t: 0 }, { w: 'TENNIS', t: 1, g: 1 },
    ],
  },
];

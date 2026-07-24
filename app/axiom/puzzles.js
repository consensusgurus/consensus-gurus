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
    num: 1, quizId: 'axiom-7-25-26', live: '2026-07-25', dateLabel: 'July 25, 2026', sunday: false,
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
    num: 2, quizId: 'axiom-7-26-26', live: '2026-07-26', dateLabel: 'July 26, 2026', sunday: true,
    budget: 7,
    rules: [{ k: 'onevowel' }, { k: 'alpha' }, { k: 'dbl' }, { k: 'nolet', c: 'A' }, { k: 'vowels', n: 2 }, { k: 'twinvowel' }, { k: 'hides', set: 'animal' }],
    tiles: [
      { w: 'DISPLAYS', t: 0 }, { w: 'HANDLES', t: 0 }, { w: 'STARRING', t: 0 }, { w: 'GLOBAL', t: 0 },
      { w: 'ALGEBRA', t: 0 }, { w: 'BEEN', t: 1, g: 1 }, { w: 'BEST', t: 0 }, { w: 'NEWER', t: 1 },
      { w: 'BEEF', t: 1, g: 1 }, { w: 'CLAUSES', t: 0 }, { w: 'MESSAGE', t: 0 }, { w: 'PEASANTS', t: 1 },
      { w: 'INSANE', t: 0, g: 1 }, { w: 'EVILS', t: 0 }, { w: 'BEERS', t: 1 }, { w: 'ANTIQUE', t: 1 },
      { w: 'CRAMP', t: 1 }, { w: 'WARRANTY', t: 1 }, { w: 'SMALLER', t: 0, g: 1 }, { w: 'CRIMINAL', t: 0 },
      { w: 'SUBWAYS', t: 0 }, { w: 'DIAGRAM', t: 1 }, { w: 'CHANNELS', t: 0 }, { w: 'ASTERISK', t: 0 },
      { w: 'DOGS', t: 1 }, { w: 'VARIANT', t: 1 }, { w: 'STUFFS', t: 0 }, { w: 'BEER', t: 1, g: 1 },
    ],
  },
  {
    num: 3, quizId: 'axiom-7-27-26', live: '2026-07-27', dateLabel: 'July 27, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'alpha' }, { k: 'dbl' }, { k: 'onevowel' }, { k: 'nolet', c: 'A' }, { k: 'nolet', c: 'S' }],
    tiles: [
      { w: 'FALLS', t: 1 }, { w: 'PUZZLES', t: 1 }, { w: 'HAVE', t: 0, g: 1 }, { w: 'ORANGE', t: 0 },
      { w: 'LACKED', t: 0 }, { w: 'ANNOY', t: 1 }, { w: 'JACKETS', t: 0 }, { w: 'TAKES', t: 0 },
      { w: 'EARLIER', t: 0 }, { w: 'GLOSSY', t: 1 }, { w: 'BELL', t: 1, g: 1 }, { w: 'ENTRANCE', t: 0, g: 1 },
      { w: 'EGOS', t: 0 }, { w: 'POWDER', t: 0 }, { w: 'SEPARATE', t: 0 }, { w: 'FALLACY', t: 1 },
      { w: 'BEEF', t: 1, g: 1 }, { w: 'WAIT', t: 0 }, { w: 'RACES', t: 0 }, { w: 'DEAL', t: 0 },
      { w: 'CUMMING', t: 1 }, { w: 'SUFFER', t: 1 }, { w: 'FLOOR', t: 1, g: 1 }, { w: 'FELT', t: 0 },
    ],
  },
  {
    num: 4, quizId: 'axiom-7-28-26', live: '2026-07-28', dateLabel: 'July 28, 2026', sunday: false,
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
    num: 5, quizId: 'axiom-7-29-26', live: '2026-07-29', dateLabel: 'July 29, 2026', sunday: false,
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
    num: 6, quizId: 'axiom-7-30-26', live: '2026-07-30', dateLabel: 'July 30, 2026', sunday: false,
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
    num: 7, quizId: 'axiom-7-31-26', live: '2026-07-31', dateLabel: 'July 31, 2026', sunday: false,
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
    num: 8, quizId: 'axiom-8-1-26', live: '2026-08-01', dateLabel: 'August 1, 2026', sunday: false,
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
    num: 9, quizId: 'axiom-8-2-26', live: '2026-08-02', dateLabel: 'August 2, 2026', sunday: true,
    budget: 7,
    rules: [{ k: 'twinvowel' }, { k: 'nolet', c: 'E' }, { k: 'len', n: 5 }, { k: 'nolet', c: 'S' }, { k: 'vowels', n: 3 }, { k: 'endvowel' }, { k: 'norepeat' }],
    tiles: [
      { w: 'STATES', t: 0 }, { w: 'GOTTEN', t: 0 }, { w: 'ARCANE', t: 0 }, { w: 'TYPED', t: 1 },
      { w: 'NAIVE', t: 1 }, { w: 'LINED', t: 1 }, { w: 'MAKES', t: 1 }, { w: 'QUOTA', t: 1, g: 1 },
      { w: 'OCCUPY', t: 0, g: 1 }, { w: 'EVENTS', t: 0, g: 1 }, { w: 'CHALK', t: 1 }, { w: 'LIKELY', t: 0 },
      { w: 'EVOLVE', t: 0 }, { w: 'MERGED', t: 0 }, { w: 'SWING', t: 1 }, { w: 'WAKE', t: 1 },
      { w: 'PSEUDO', t: 1 }, { w: 'DROPPING', t: 0 }, { w: 'ASSESS', t: 0 }, { w: 'DEALERS', t: 0 },
      { w: 'PIANO', t: 1, g: 1 }, { w: 'FORMERLY', t: 0 }, { w: 'DOOMS', t: 0 }, { w: 'CRITIC', t: 0 },
      { w: 'ENDING', t: 0 }, { w: 'WIDTH', t: 1 }, { w: 'RATIO', t: 1, g: 1 }, { w: 'SPOTTED', t: 0 },
    ],
  },
  {
    num: 10, quizId: 'axiom-8-3-26', live: '2026-08-03', dateLabel: 'August 3, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'dbl' }, { k: 'nolet', c: 'A' }, { k: 'alpha' }, { k: 'nolet', c: 'S' }, { k: 'twinvowel' }],
    tiles: [
      { w: 'PHOENIX', t: 1 }, { w: 'BEER', t: 1 }, { w: 'AGREES', t: 1 }, { w: 'ADDS', t: 0 },
      { w: 'FIRES', t: 0 }, { w: 'BALLET', t: 0 }, { w: 'FOOT', t: 1, g: 1 }, { w: 'REPLIED', t: 1 },
      { w: 'EVIDENCE', t: 0 }, { w: 'DEDUCES', t: 0 }, { w: 'COMPARES', t: 0 }, { w: 'LOADED', t: 1 },
      { w: 'VIRUSES', t: 0 }, { w: 'THESE', t: 0, g: 1 }, { w: 'DEEP', t: 1, g: 1 }, { w: 'SAND', t: 0 },
      { w: 'SIGH', t: 0, g: 1 }, { w: 'DOOR', t: 1, g: 1 }, { w: 'DEALT', t: 1 }, { w: 'ALLIES', t: 1 },
      { w: 'DESTROYS', t: 0 }, { w: 'RECIPES', t: 0 }, { w: 'SHELVES', t: 0 }, { w: 'NUNS', t: 0 },
    ],
  },
  {
    num: 11, quizId: 'axiom-8-4-26', live: '2026-08-04', dateLabel: 'August 4, 2026', sunday: false,
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
    num: 12, quizId: 'axiom-8-5-26', live: '2026-08-05', dateLabel: 'August 5, 2026', sunday: false,
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
    num: 13, quizId: 'axiom-8-6-26', live: '2026-08-06', dateLabel: 'August 6, 2026', sunday: false,
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
    num: 14, quizId: 'axiom-8-7-26', live: '2026-08-07', dateLabel: 'August 7, 2026', sunday: false,
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
];

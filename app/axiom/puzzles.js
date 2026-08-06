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
//   C6 perfect is exactly 2, so no single tile can split the field on its own
// and, from board 7 on (the v2 generator, 2026-07-29):
//   C7 at most one "no letter X" candidate (two on Sunday) and one "exactly N
//      letters" candidate, so the field is not padded with rules that are never
//      the answer
//   C8 at least 8 informative tiles on a weekday, 10 on Sunday
//   C9 perfect-2 pairs are >= 12% of all tile pairs (9% Sunday), so the splitting
//      pair is findable rather than a needle
//   C10 across the bank: the answer is spread over the candidate slots, and no
//      common rule kind is a free cross-out. Candidate order is shuffled per
//      board, and the topic / hidden-word rules are decoys about as often as
//      they are the answer.
// Boards 1-6 predate these and are frozen; the verifier exempts them.
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
    rules: [{ k: 'nolet', c: 'C' }, { k: 'in', set: 'mammal' }, { k: 'norepeat' }, { k: 'vowels', n: 2 }, { k: 'endvowel' }],
    tiles: [
      { w: 'GUPPY', t: 0 }, { w: 'PANDA', t: 1 }, { w: 'EEL', t: 0 }, { w: 'PELICAN', t: 0 },
      { w: 'HAMSTER', t: 1 }, { w: 'MOLE', t: 1, g: 1 }, { w: 'TIGER', t: 1 }, { w: 'WREN', t: 0, g: 1 },
      { w: 'COD', t: 0 }, { w: 'WHALE', t: 1 }, { w: 'RABBIT', t: 1 }, { w: 'MINNOW', t: 0 },
      { w: 'WALRUS', t: 1 }, { w: 'CROW', t: 0 }, { w: 'CONDOR', t: 0 }, { w: 'HARE', t: 1, g: 1 },
      { w: 'DUCK', t: 0 }, { w: 'SPARROW', t: 0 }, { w: 'STORK', t: 0 }, { w: 'DEER', t: 1 },
      { w: 'TOUCAN', t: 0, g: 1 }, { w: 'GIRAFFE', t: 1 }, { w: 'RHINO', t: 1 }, { w: 'HORSE', t: 1, g: 1 },
    ],
  },
  {
    num: 8, quizId: 'axiom-7-31-26', live: '2026-07-31', dateLabel: 'July 31, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'norepeat' }, { k: 'vowels', n: 1 }, { k: 'hides', set: 'animal' }, { k: 'onevowel' }, { k: 'nolet', c: 'E' }],
    tiles: [
      { w: 'SNAIL', t: 1 }, { w: 'RATS', t: 1, g: 1 }, { w: 'GUILT', t: 1 }, { w: 'OFFENDERS', t: 0 },
      { w: 'ALIGNED', t: 0 }, { w: 'BLUE', t: 0 }, { w: 'WELFARE', t: 0 }, { w: 'SUBMIT', t: 1 },
      { w: 'CITIES', t: 0 }, { w: 'BALANCE', t: 0, g: 1 }, { w: 'PENNY', t: 0, g: 1 }, { w: 'DOING', t: 1 },
      { w: 'HOPELESS', t: 0 }, { w: 'PURPOSE', t: 0 }, { w: 'SQUAD', t: 1 }, { w: 'BACTERIUM', t: 0 },
      { w: 'UMBRELLA', t: 0 }, { w: 'RECYCLES', t: 0 }, { w: 'ADVERSELY', t: 0 }, { w: 'WANTS', t: 1, g: 1 },
      { w: 'GATES', t: 0 }, { w: 'QUIETLY', t: 0 }, { w: 'PANTS', t: 1, g: 1 }, { w: 'MATERIAL', t: 0 },
    ],
  },
  {
    num: 9, quizId: 'axiom-8-1-26', live: '2026-08-01', dateLabel: 'August 1, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'norepeat' }, { k: 'len', n: 7 }, { k: 'twinvowel' }, { k: 'vowels', n: 3 }, { k: 'nolet', c: 'S' }],
    tiles: [
      { w: 'OBEYS', t: 0 }, { w: 'KING', t: 0 }, { w: 'EQUIPS', t: 1 }, { w: 'FAINTER', t: 1 },
      { w: 'TELEPHONE', t: 0 }, { w: 'FORTH', t: 0 }, { w: 'EXPLAIN', t: 1, g: 1 }, { w: 'MERGING', t: 0 },
      { w: 'FORMERLY', t: 0 }, { w: 'HEARTS', t: 0 }, { w: 'MAKING', t: 0 }, { w: 'FREELY', t: 0 },
      { w: 'MATE', t: 0, g: 1 }, { w: 'GRADUATE', t: 0 }, { w: 'HEAR', t: 0 }, { w: 'PRODUCE', t: 1 },
      { w: 'BEATING', t: 1, g: 1 }, { w: 'THEREBY', t: 0 }, { w: 'FROGS', t: 0, g: 1 }, { w: 'CRUISING', t: 1 },
      { w: 'ECHOING', t: 1, g: 1 }, { w: 'SUMMED', t: 0 }, { w: 'JOURNAL', t: 1 }, { w: 'RETAIN', t: 1 },
    ],
  },
  {
    num: 10, quizId: 'axiom-8-2-26', live: '2026-08-02', dateLabel: 'August 2, 2026', sunday: true,
    budget: 7,
    rules: [{ k: 'dbl' }, { k: 'nolet', c: 'R' }, { k: 'vowels', n: 2 }, { k: 'len', n: 5 }, { k: 'nolet', c: 'G' }, { k: 'onevowel' }, { k: 'twinvowel' }],
    tiles: [
      { w: 'APART', t: 0 }, { w: 'INDUCING', t: 0 }, { w: 'QUEUING', t: 0 }, { w: 'DETECTOR', t: 0 },
      { w: 'ASCEND', t: 0 }, { w: 'OPEN', t: 0, g: 1 }, { w: 'INCHES', t: 0 }, { w: 'ENEMY', t: 0 },
      { w: 'UNDERTAKE', t: 0, g: 1 }, { w: 'STEEL', t: 1, g: 1 }, { w: 'VANISHED', t: 0 }, { w: 'INJURY', t: 0 },
      { w: 'CHEEK', t: 1, g: 1 }, { w: 'DIRECTOR', t: 0 }, { w: 'REQUESTS', t: 0 }, { w: 'RESPONDED', t: 0 },
      { w: 'MOTTO', t: 1 }, { w: 'SINKS', t: 0 }, { w: 'WORRY', t: 1 }, { w: 'SEEMS', t: 1, g: 1 },
      { w: 'WASHED', t: 0 }, { w: 'LOOSELY', t: 1 }, { w: 'INTEGRITY', t: 0 }, { w: 'SAID', t: 0 },
      { w: 'KEEPING', t: 1 }, { w: 'TRAVELING', t: 0 }, { w: 'KINDS', t: 0 }, { w: 'DRESS', t: 1 },
    ],
  },
  {
    num: 11, quizId: 'axiom-8-3-26', live: '2026-08-03', dateLabel: 'August 3, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'len', n: 6 }, { k: 'onevowel' }, { k: 'nolet', c: 'I' }, { k: 'endvowel' }, { k: 'in', set: 'fruit' }],
    tiles: [
      { w: 'GNOCCHI', t: 0 }, { w: 'PRESERVE', t: 1 }, { w: 'HONEY', t: 0, g: 1 }, { w: 'STEAK', t: 0 },
      { w: 'TURNIP', t: 0 }, { w: 'RADISH', t: 0 }, { w: 'THYME', t: 1 }, { w: 'LYCHEE', t: 1, g: 1 },
      { w: 'LEMON', t: 0 }, { w: 'NECTAR', t: 0 }, { w: 'SUSHI', t: 0 }, { w: 'BISCUIT', t: 0 },
      { w: 'PAPRIKA', t: 0 }, { w: 'PAPAYA', t: 1, g: 1 }, { w: 'PASTA', t: 1 }, { w: 'FIG', t: 1 },
      { w: 'APRICOT', t: 0 }, { w: 'DUMPLING', t: 0 }, { w: 'BANANA', t: 1, g: 1 }, { w: 'SOUP', t: 0 },
      { w: 'BREAD', t: 0 }, { w: 'MARZIPAN', t: 0 }, { w: 'RAVIOLI', t: 0 }, { w: 'SORBET', t: 0, g: 1 },
    ],
  },
  {
    num: 12, quizId: 'axiom-8-4-26', live: '2026-08-04', dateLabel: 'August 4, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'nolet', c: 'E' }, { k: 'onevowel' }, { k: 'hides', set: 'animal' }, { k: 'norepeat' }, { k: 'vowels', n: 1 }],
    tiles: [
      { w: 'DEGRADES', t: 0 }, { w: 'RAMPANT', t: 1 }, { w: 'WOOD', t: 0 }, { w: 'ETERNITY', t: 0 },
      { w: 'JUNIOR', t: 0, g: 1 }, { w: 'INJURED', t: 0, g: 1 }, { w: 'BATCH', t: 1, g: 1 }, { w: 'HELPLESS', t: 0 },
      { w: 'BASSES', t: 0 }, { w: 'MOTION', t: 0 }, { w: 'UNRELATED', t: 0 }, { w: 'PLANTS', t: 1, g: 1 },
      { w: 'DEPEND', t: 0 }, { w: 'AXIS', t: 0 }, { w: 'HENCE', t: 1 }, { w: 'STEER', t: 0 },
      { w: 'FEWER', t: 1 }, { w: 'FEVER', t: 0 }, { w: 'BATH', t: 1, g: 1 }, { w: 'CONGEST', t: 0 },
      { w: 'EMPTYING', t: 0 }, { w: 'BEER', t: 1 }, { w: 'BLATANT', t: 1 }, { w: 'ESTABLISH', t: 0 },
    ],
  },
  {
    num: 13, quizId: 'axiom-8-5-26', live: '2026-08-05', dateLabel: 'August 5, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'vowels', n: 1 }, { k: 'norepeat' }, { k: 'len', n: 5 }, { k: 'nolet', c: 'C' }, { k: 'onevowel' }],
    tiles: [
      { w: 'SEVEN', t: 1 }, { w: 'CLINIC', t: 0 }, { w: 'LISTING', t: 0 }, { w: 'RENDERED', t: 0 },
      { w: 'ATHEISM', t: 0 }, { w: 'REGIONAL', t: 0 }, { w: 'YOURSELF', t: 0 }, { w: 'ARRAY', t: 1 },
      { w: 'GRABS', t: 1 }, { w: 'DRIFT', t: 1, g: 1 }, { w: 'SITTING', t: 0 }, { w: 'PLANT', t: 1 },
      { w: 'INCURRING', t: 0 }, { w: 'TURNS', t: 1, g: 1 }, { w: 'DEEDS', t: 1 }, { w: 'SWING', t: 1, g: 1 },
      { w: 'LIBRARIAN', t: 0, g: 1 }, { w: 'WHERE', t: 1 }, { w: 'CASTING', t: 0, g: 1 }, { w: 'SINE', t: 0 },
      { w: 'NEVER', t: 1 }, { w: 'EVOLVED', t: 0 }, { w: 'SENTIMENT', t: 0 }, { w: 'ELEMENTS', t: 0 },
    ],
  },
  {
    num: 14, quizId: 'axiom-8-6-26', live: '2026-08-06', dateLabel: 'August 6, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'nolet', c: 'H' }, { k: 'norepeat' }, { k: 'vowels', n: 1 }, { k: 'len', n: 4 }, { k: 'onevowel' }],
    tiles: [
      { w: 'BATHROOM', t: 0 }, { w: 'CRYING', t: 1 }, { w: 'FIGHTER', t: 0 }, { w: 'DEAL', t: 1 },
      { w: 'REACHED', t: 0 }, { w: 'DRAW', t: 1, g: 1 }, { w: 'ADOPTS', t: 1 }, { w: 'DULL', t: 1 },
      { w: 'STAY', t: 1, g: 1 }, { w: 'VARIED', t: 1 }, { w: 'SOMEWHERE', t: 0, g: 1 }, { w: 'WORKINGS', t: 1 },
      { w: 'HOSTILE', t: 0 }, { w: 'SUIT', t: 1 }, { w: 'GRID', t: 1 }, { w: 'SAID', t: 1 },
      { w: 'SWITCHED', t: 0 }, { w: 'HOUSED', t: 0 }, { w: 'DARK', t: 1, g: 1 }, { w: 'DUMP', t: 1 },
      { w: 'LISP', t: 1 }, { w: 'TIME', t: 1 }, { w: 'CHECKS', t: 0, g: 1 }, { w: 'LIQUOR', t: 1 },
    ],
  },
  {
    num: 15, quizId: 'axiom-8-7-26', live: '2026-08-07', dateLabel: 'August 7, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'vowels', n: 2 }, { k: 'in', set: 'country' }, { k: 'norepeat' }, { k: 'nolet', c: 'M' }, { k: 'endvowel' }],
    tiles: [
      { w: 'HAMBURG', t: 1 }, { w: 'ROME', t: 1 }, { w: 'SEATTLE', t: 0, g: 1 }, { w: 'VERONA', t: 0 },
      { w: 'PERU', t: 1, g: 1 }, { w: 'CHILE', t: 1, g: 1 }, { w: 'FRESNO', t: 1 }, { w: 'SALZBURG', t: 1 },
      { w: 'HANOI', t: 0 }, { w: 'BOULDER', t: 0 }, { w: 'CHENNAI', t: 0 }, { w: 'OSAKA', t: 0 },
      { w: 'JAKARTA', t: 0 }, { w: 'OMAHA', t: 0 }, { w: 'BRISTOL', t: 1 }, { w: 'BORDEAUX', t: 0 },
      { w: 'COLOGNE', t: 0, g: 1 }, { w: 'HUNGARY', t: 1 }, { w: 'BRAZIL', t: 1 }, { w: 'PRAGUE', t: 0 },
      { w: 'HALIFAX', t: 0 }, { w: 'CUBA', t: 1, g: 1 }, { w: 'AUCKLAND', t: 0 }, { w: 'VALENCIA', t: 0 },
    ],
  },
  {
    num: 16, quizId: 'axiom-8-8-26', live: '2026-08-08', dateLabel: 'August 8, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'in', set: 'country' }, { k: 'nolet', c: 'L' }, { k: 'endvowel' }, { k: 'twinvowel' }, { k: 'vowels', n: 3 }],
    tiles: [
      { w: 'NEWARK', t: 0, g: 1 }, { w: 'CHENNAI', t: 1 }, { w: 'SAVANNAH', t: 0 }, { w: 'TUNIS', t: 0 },
      { w: 'GREECE', t: 1, g: 1 }, { w: 'DALLAS', t: 0 }, { w: 'ZURICH', t: 0 }, { w: 'BERLIN', t: 0 },
      { w: 'ITALY', t: 0, g: 1 }, { w: 'BUDAPEST', t: 0 }, { w: 'PERU', t: 0 }, { w: 'ACCRA', t: 0 },
      { w: 'RUSSIA', t: 1, g: 1 }, { w: 'POLAND', t: 0 }, { w: 'BRAZIL', t: 0 }, { w: 'CAIRO', t: 1 },
      { w: 'DETROIT', t: 1 }, { w: 'LIMA', t: 0 }, { w: 'EGYPT', t: 0 }, { w: 'ICELAND', t: 0 },
      { w: 'INDIA', t: 1, g: 1 }, { w: 'HALIFAX', t: 0 }, { w: 'CHINA', t: 0 }, { w: 'TOULOUSE', t: 1 },
    ],
  },
  {
    num: 17, quizId: 'axiom-8-9-26', live: '2026-08-09', dateLabel: 'August 9, 2026', sunday: true,
    budget: 7,
    rules: [{ k: 'nolet', c: 'P' }, { k: 'vowels', n: 2 }, { k: 'twinvowel' }, { k: 'dbl' }, { k: 'len', n: 4 }, { k: 'nolet', c: 'S' }, { k: 'onevowel' }],
    tiles: [
      { w: 'CIRCLES', t: 0 }, { w: 'UPGRADING', t: 0 }, { w: 'BEND', t: 1 }, { w: 'SPEEDS', t: 1 },
      { w: 'GAME', t: 0 }, { w: 'SPOOF', t: 1 }, { w: 'ORIGINALS', t: 0, g: 1 }, { w: 'PROOFS', t: 1 },
      { w: 'JACKET', t: 0 }, { w: 'TONES', t: 0 }, { w: 'GUYS', t: 1 }, { w: 'MAYOR', t: 0 },
      { w: 'KIDNAPS', t: 0 }, { w: 'NEEDLESS', t: 1 }, { w: 'POSTPONE', t: 0 }, { w: 'PARSE', t: 0 },
      { w: 'ITEMS', t: 0 }, { w: 'HABIT', t: 0, g: 1 }, { w: 'MUGS', t: 1 }, { w: 'VIRUSES', t: 0 },
      { w: 'WEDS', t: 1 }, { w: 'RUNS', t: 1 }, { w: 'MOOD', t: 1, g: 1 }, { w: 'COOL', t: 1, g: 1 },
      { w: 'DOOR', t: 1, g: 1 }, { w: 'EMULATE', t: 0 }, { w: 'MEETING', t: 0 }, { w: 'RAGE', t: 0 },
    ],
  },
  {
    num: 18, quizId: 'axiom-8-10-26', live: '2026-08-10', dateLabel: 'August 10, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'onevowel' }, { k: 'len', n: 4 }, { k: 'nolet', c: 'D' }, { k: 'norepeat' }, { k: 'hides', set: 'body' }],
    tiles: [
      { w: 'COMPETES', t: 0 }, { w: 'ARMY', t: 1, g: 1 }, { w: 'PITY', t: 1 }, { w: 'UNDERGONE', t: 0 },
      { w: 'BOBS', t: 0 }, { w: 'ENSURING', t: 0 }, { w: 'WIDE', t: 1 }, { w: 'KIDS', t: 1 },
      { w: 'BUSS', t: 0 }, { w: 'CONFLICTS', t: 0 }, { w: 'RESET', t: 0, g: 1 }, { w: 'AIDS', t: 1 },
      { w: 'SHIP', t: 1, g: 1 }, { w: 'SPOTTING', t: 0 }, { w: 'LIPS', t: 1 }, { w: 'SEES', t: 0 },
      { w: 'BOTHERED', t: 0 }, { w: 'BEER', t: 0 }, { w: 'LAKE', t: 1 }, { w: 'GENERATED', t: 0 },
      { w: 'MACHINERY', t: 1 }, { w: 'ARMS', t: 1, g: 1 }, { w: 'CLEVEREST', t: 0, g: 1 }, { w: 'FIXING', t: 0 },
    ],
  },
  {
    num: 19, quizId: 'axiom-8-11-26', live: '2026-08-11', dateLabel: 'August 11, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'len', n: 4 }, { k: 'onevowel' }, { k: 'norepeat' }, { k: 'nolet', c: 'C' }, { k: 'vowels', n: 1 }],
    tiles: [
      { w: 'ANCESTOR', t: 0, g: 1 }, { w: 'EXPLICIT', t: 0 }, { w: 'SARCASM', t: 0 }, { w: 'AGED', t: 1 },
      { w: 'RECORDED', t: 0 }, { w: 'PRODUCE', t: 0 }, { w: 'RIGHTLY', t: 1 }, { w: 'TIME', t: 1 },
      { w: 'COAL', t: 0 }, { w: 'COUNTING', t: 0 }, { w: 'TEND', t: 1, g: 1 }, { w: 'SYMPATHY', t: 1 },
      { w: 'CAGE', t: 0 }, { w: 'SORE', t: 1 }, { w: 'MUGS', t: 1, g: 1 }, { w: 'HACKS', t: 0 },
      { w: 'RECYCLE', t: 0 }, { w: 'POLITICS', t: 0 }, { w: 'CLEVER', t: 0, g: 1 }, { w: 'EXCEEDED', t: 0 },
      { w: 'HOLD', t: 1, g: 1 }, { w: 'LENDS', t: 1 }, { w: 'PATCH', t: 0 }, { w: 'SEARCH', t: 0 },
    ],
  },
  {
    num: 20, quizId: 'axiom-8-12-26', live: '2026-08-12', dateLabel: 'August 12, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'vowels', n: 3 }, { k: 'nolet', c: 'H' }, { k: 'in', set: 'ballsport' }, { k: 'twinvowel' }, { k: 'dbl' }],
    tiles: [
      { w: 'YACHTING', t: 0 }, { w: 'PETANQUE', t: 1 }, { w: 'FOOSBALL', t: 1, g: 1 }, { w: 'TUMBLING', t: 0 },
      { w: 'CANOEING', t: 0 }, { w: 'ROPING', t: 0 }, { w: 'ABSEILING', t: 0 }, { w: 'CROQUET', t: 1 },
      { w: 'JOGGING', t: 0 }, { w: 'SWIMMING', t: 0 }, { w: 'DISCUS', t: 0 }, { w: 'BOBSLEIGH', t: 0 },
      { w: 'DECATHLON', t: 0, g: 1 }, { w: 'KORFBALL', t: 1 }, { w: 'ROWING', t: 0 }, { w: 'SURFING', t: 0 },
      { w: 'CLIMBING', t: 0 }, { w: 'DIVING', t: 0 }, { w: 'BASEBALL', t: 1 }, { w: 'BOXING', t: 0, g: 1 },
      { w: 'ARCHERY', t: 0 }, { w: 'TREKKING', t: 0 }, { w: 'BILLIARDS', t: 1, g: 1 }, { w: 'SNOOKER', t: 1, g: 1 },
    ],
  },
  {
    num: 21, quizId: 'axiom-8-13-26', live: '2026-08-13', dateLabel: 'August 13, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'nolet', c: 'G' }, { k: 'vowels', n: 2 }, { k: 'altvc' }, { k: 'len', n: 5 }, { k: 'norepeat' }],
    tiles: [
      { w: 'PRESSURES', t: 0 }, { w: 'BONUS', t: 1, g: 1 }, { w: 'ARBITRARY', t: 0 }, { w: 'COMPILED', t: 0 },
      { w: 'BRANCH', t: 0 }, { w: 'METAPHOR', t: 0 }, { w: 'DONATION', t: 0 }, { w: 'DRAFTING', t: 1 },
      { w: 'ASSISTING', t: 0 }, { w: 'POSED', t: 1, g: 1 }, { w: 'CLOSER', t: 1 }, { w: 'SHONE', t: 1 },
      { w: 'INQUIRING', t: 0 }, { w: 'BLAST', t: 0 }, { w: 'PRACTICES', t: 0, g: 1 }, { w: 'LISTS', t: 0, g: 1 },
      { w: 'EXAMINED', t: 0 }, { w: 'MEASURED', t: 0 }, { w: 'DREADED', t: 0 }, { w: 'CELLS', t: 0 },
      { w: 'ORGAN', t: 1 }, { w: 'IGNORED', t: 0 }, { w: 'MALES', t: 1, g: 1 }, { w: 'NESTS', t: 0 },
    ],
  },
  {
    num: 22, quizId: 'axiom-8-14-26', live: '2026-08-14', dateLabel: 'August 14, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'onevowel' }, { k: 'alpha' }, { k: 'nolet', c: 'D' }, { k: 'vowels', n: 1 }, { k: 'len', n: 4 }],
    tiles: [
      { w: 'MOST', t: 1, g: 1 }, { w: 'DEEMS', t: 1 }, { w: 'DEPENDING', t: 0 }, { w: 'IRRITATE', t: 0, g: 1 },
      { w: 'STATES', t: 0 }, { w: 'STRANGE', t: 0 }, { w: 'BOOST', t: 1 }, { w: 'SHOUT', t: 0 },
      { w: 'HEEL', t: 0 }, { w: 'CREEP', t: 0 }, { w: 'IMPORTING', t: 0 }, { w: 'FEMALES', t: 0 },
      { w: 'RIDING', t: 0 }, { w: 'GLOW', t: 1, g: 1 }, { w: 'MANNING', t: 0 }, { w: 'DEEP', t: 1 },
      { w: 'BEER', t: 1 }, { w: 'COOKS', t: 0 }, { w: 'BILL', t: 1, g: 1 }, { w: 'BEATING', t: 0 },
      { w: 'LOOPS', t: 1 }, { w: 'FORTUNE', t: 0 }, { w: 'CONFRONT', t: 0 }, { w: 'CUBE', t: 0, g: 1 },
    ],
  },
  {
    num: 23, quizId: 'axiom-8-15-26', live: '2026-08-15', dateLabel: 'August 15, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'nolet', c: 'C' }, { k: 'vowels', n: 2 }, { k: 'len', n: 5 }, { k: 'in', set: 'mammal' }, { k: 'endvowel' }],
    tiles: [
      { w: 'HORSE', t: 1, g: 1 }, { w: 'PENGUIN', t: 0, g: 1 }, { w: 'PELICAN', t: 0 }, { w: 'CAMEL', t: 1 },
      { w: 'DOG', t: 0 }, { w: 'RAT', t: 0 }, { w: 'RHINO', t: 1, g: 1 }, { w: 'HERRING', t: 0 },
      { w: 'BADGER', t: 0 }, { w: 'ELK', t: 0, g: 1 }, { w: 'BASS', t: 0 }, { w: 'DONKEY', t: 0 },
      { w: 'EGRET', t: 1 }, { w: 'FALCON', t: 0 }, { w: 'WEASEL', t: 0 }, { w: 'TROUT', t: 1 },
      { w: 'MAGPIE', t: 0 }, { w: 'PANDA', t: 1, g: 1 }, { w: 'GIRAFFE', t: 0 }, { w: 'COD', t: 0 },
      { w: 'COW', t: 0 }, { w: 'MOOSE', t: 1 }, { w: 'WREN', t: 0 }, { w: 'LEOPARD', t: 0 },
    ],
  },
  {
    num: 24, quizId: 'axiom-8-16-26', live: '2026-08-16', dateLabel: 'August 16, 2026', sunday: true,
    budget: 7,
    rules: [{ k: 'len', n: 6 }, { k: 'vowels', n: 3 }, { k: 'twinvowel' }, { k: 'endvowel' }, { k: 'dbl' }, { k: 'nolet', c: 'H' }, { k: 'nolet', c: 'P' }],
    tiles: [
      { w: 'BLOB', t: 0 }, { w: 'VARIABLE', t: 1 }, { w: 'TWENTIETH', t: 1 }, { w: 'BAKED', t: 0 },
      { w: 'QUICKER', t: 1 }, { w: 'ACTOR', t: 0 }, { w: 'PREVAIL', t: 1 }, { w: 'RECEIVE', t: 1 },
      { w: 'PLANT', t: 0 }, { w: 'COFFEE', t: 1, g: 1 }, { w: 'CURRENT', t: 0 }, { w: 'COUPLES', t: 1 },
      { w: 'ACCORDS', t: 0 }, { w: 'UNITES', t: 0 }, { w: 'LESS', t: 0, g: 1 }, { w: 'SUITABLE', t: 1 },
      { w: 'TACKLING', t: 0 }, { w: 'HOLD', t: 0, g: 1 }, { w: 'BLACK', t: 0 }, { w: 'CUCKOO', t: 1, g: 1 },
      { w: 'BELL', t: 0 }, { w: 'TOLL', t: 0 }, { w: 'TEENAGE', t: 1 }, { w: 'BREEZE', t: 1, g: 1 },
      { w: 'DIAGRAMS', t: 1 }, { w: 'HEADLINE', t: 1 }, { w: 'CATTLE', t: 0 }, { w: 'MINDS', t: 0 },
    ],
  },
  {
    num: 25, quizId: 'axiom-8-17-26', live: '2026-08-17', dateLabel: 'August 17, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'nolet', c: 'O' }, { k: 'norepeat' }, { k: 'onevowel' }, { k: 'vowels', n: 1 }, { k: 'len', n: 4 }],
    tiles: [
      { w: 'UNSOUND', t: 0 }, { w: 'SCORING', t: 0, g: 1 }, { w: 'HOOKED', t: 0 }, { w: 'DOES', t: 0 },
      { w: 'SPIRIT', t: 1 }, { w: 'EXPECT', t: 1 }, { w: 'CAST', t: 1, g: 1 }, { w: 'PRODUCES', t: 0 },
      { w: 'GIFT', t: 1 }, { w: 'HALF', t: 1, g: 1 }, { w: 'JOKE', t: 0 }, { w: 'CRITIC', t: 1 },
      { w: 'BOARDS', t: 0 }, { w: 'EGOS', t: 0, g: 1 }, { w: 'PASS', t: 1 }, { w: 'LOGO', t: 0 },
      { w: 'FLOORS', t: 0 }, { w: 'ARCH', t: 1, g: 1 }, { w: 'DOORS', t: 0 }, { w: 'ROYALTIES', t: 0 },
      { w: 'DEEP', t: 1 }, { w: 'SHOOK', t: 0 }, { w: 'REPRESENT', t: 1 }, { w: 'POOL', t: 0 },
    ],
  },
  {
    num: 26, quizId: 'axiom-8-18-26', live: '2026-08-18', dateLabel: 'August 18, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'hides', set: 'number' }, { k: 'len', n: 6 }, { k: 'dbl' }, { k: 'nolet', c: 'L' }, { k: 'vowels', n: 2 }],
    tiles: [
      { w: 'DEDUCES', t: 0, g: 1 }, { w: 'CITE', t: 0 }, { w: 'LOGGED', t: 1 }, { w: 'TENNIS', t: 1, g: 1 },
      { w: 'SCHOOL', t: 1 }, { w: 'SELECTIVE', t: 0 }, { w: 'SHOWS', t: 0 }, { w: 'CEASES', t: 0 },
      { w: 'BLOCKS', t: 0 }, { w: 'LECTURES', t: 0 }, { w: 'WOODEN', t: 1 }, { w: 'ACCEPT', t: 1 },
      { w: 'BRAINS', t: 0 }, { w: 'CUTS', t: 0 }, { w: 'EATEN', t: 0 }, { w: 'EQUALITY', t: 0 },
      { w: 'FREQUENCY', t: 0 }, { w: 'DRAIN', t: 0, g: 1 }, { w: 'PROFIT', t: 0 }, { w: 'WETS', t: 0 },
      { w: 'ANGLES', t: 0 }, { w: 'ATTEND', t: 1, g: 1 }, { w: 'GOTTEN', t: 1, g: 1 }, { w: 'CHAPS', t: 0 },
    ],
  },
  {
    num: 27, quizId: 'axiom-8-19-26', live: '2026-08-19', dateLabel: 'August 19, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'nolet', c: 'I' }, { k: 'len', n: 4 }, { k: 'onevowel' }, { k: 'norepeat' }, { k: 'vowels', n: 1 }],
    tiles: [
      { w: 'STARTER', t: 0 }, { w: 'RAINING', t: 0 }, { w: 'RUMOR', t: 0 }, { w: 'LUXURY', t: 0 },
      { w: 'BANDS', t: 1 }, { w: 'TILE', t: 0 }, { w: 'NEXT', t: 1, g: 1 }, { w: 'PUNCH', t: 1 },
      { w: 'SUFFICE', t: 0 }, { w: 'POLLS', t: 1 }, { w: 'SHADOW', t: 0 }, { w: 'AGING', t: 0 },
      { w: 'CLINICAL', t: 0, g: 1 }, { w: 'TASK', t: 1, g: 1 }, { w: 'FREAK', t: 0, g: 1 }, { w: 'ATTENDING', t: 0 },
      { w: 'SHELTER', t: 0 }, { w: 'FREED', t: 0 }, { w: 'NUNS', t: 1 }, { w: 'PRINTING', t: 0 },
      { w: 'ANYWAY', t: 0 }, { w: 'PLUG', t: 1, g: 1 }, { w: 'JUDGMENTS', t: 0 }, { w: 'CLASH', t: 1 },
    ],
  },
  {
    num: 28, quizId: 'axiom-8-20-26', live: '2026-08-20', dateLabel: 'August 20, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'in', set: 'country' }, { k: 'norepeat' }, { k: 'endvowel' }, { k: 'vowels', n: 2 }, { k: 'nolet', c: 'T' }],
    tiles: [
      { w: 'JAPAN', t: 1 }, { w: 'BUFFALO', t: 0 }, { w: 'PERTH', t: 0 }, { w: 'AUCKLAND', t: 0, g: 1 },
      { w: 'EGYPT', t: 1 }, { w: 'DENVER', t: 0 }, { w: 'HALIFAX', t: 0 }, { w: 'BUDAPEST', t: 0 },
      { w: 'FRANCE', t: 1, g: 1 }, { w: 'ACCRA', t: 0 }, { w: 'SAVANNAH', t: 0 }, { w: 'SPAIN', t: 1 },
      { w: 'MARSEILLE', t: 0, g: 1 }, { w: 'GERMANY', t: 1 }, { w: 'ITALY', t: 1 }, { w: 'DENMARK', t: 1 },
      { w: 'KENYA', t: 1, g: 1 }, { w: 'SWEDEN', t: 1 }, { w: 'BRUSSELS', t: 0 }, { w: 'SEATTLE', t: 0 },
      { w: 'AUSTIN', t: 0 }, { w: 'MALMO', t: 0 }, { w: 'CHILE', t: 1, g: 1 }, { w: 'VALENCIA', t: 0 },
    ],
  },
  {
    num: 29, quizId: 'axiom-8-21-26', live: '2026-08-21', dateLabel: 'August 21, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'vowels', n: 2 }, { k: 'startvowel' }, { k: 'len', n: 4 }, { k: 'nolet', c: 'S' }, { k: 'norepeat' }],
    tiles: [
      { w: 'EDUCATING', t: 1 }, { w: 'INJURED', t: 1 }, { w: 'SCATTER', t: 0, g: 1 }, { w: 'SEPARATE', t: 0 },
      { w: 'DISAGREED', t: 0 }, { w: 'FUSION', t: 0 }, { w: 'AGENTS', t: 1 }, { w: 'FINDING', t: 0 },
      { w: 'COMPLAINT', t: 0 }, { w: 'CHOSEN', t: 0 }, { w: 'SPRINGING', t: 0 }, { w: 'ECHO', t: 1, g: 1 },
      { w: 'FOLLOW', t: 0 }, { w: 'OBJECT', t: 1 }, { w: 'GREATEST', t: 0 }, { w: 'DIALED', t: 0 },
      { w: 'GRAPHS', t: 0 }, { w: 'MILL', t: 0 }, { w: 'TACTICAL', t: 0 }, { w: 'UNDO', t: 1, g: 1 },
      { w: 'BLAMES', t: 0 }, { w: 'DISHONEST', t: 0 }, { w: 'DRIPPED', t: 0, g: 1 }, { w: 'EXAM', t: 1, g: 1 },
    ],
  },
  {
    num: 30, quizId: 'axiom-8-22-26', live: '2026-08-22', dateLabel: 'August 22, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'twinvowel' }, { k: 'vowels', n: 2 }, { k: 'nolet', c: 'S' }, { k: 'onevowel' }, { k: 'dbl' }],
    tiles: [
      { w: 'SCRAP', t: 0 }, { w: 'ARRIVAL', t: 1 }, { w: 'HORN', t: 1 }, { w: 'ERASED', t: 0, g: 1 },
      { w: 'GREEN', t: 1, g: 1 }, { w: 'STUPIDITY', t: 0 }, { w: 'OVERLOOKS', t: 0 }, { w: 'ABUSIVE', t: 0 },
      { w: 'SLIGHTLY', t: 0 }, { w: 'KEPT', t: 1 }, { w: 'ASSORTING', t: 0 }, { w: 'COBBLERS', t: 0 },
      { w: 'COURSES', t: 0 }, { w: 'BANS', t: 0 }, { w: 'SUES', t: 0 }, { w: 'ORIGINALS', t: 0 },
      { w: 'MONKEYS', t: 0 }, { w: 'STRAINS', t: 0, g: 1 }, { w: 'FOOT', t: 1, g: 1 }, { w: 'YOURS', t: 0 },
      { w: 'HOOK', t: 1, g: 1 }, { w: 'PRECISELY', t: 0 }, { w: 'ESTIMATE', t: 0 }, { w: 'COMMODITY', t: 1 },
    ],
  },
  {
    num: 31, quizId: 'axiom-8-23-26', live: '2026-08-23', dateLabel: 'August 23, 2026', sunday: true,
    budget: 7,
    rules: [{ k: 'nolet', c: 'C' }, { k: 'nolet', c: 'P' }, { k: 'vowels', n: 2 }, { k: 'altvc' }, { k: 'endvowel' }, { k: 'norepeat' }, { k: 'len', n: 4 }],
    tiles: [
      { w: 'MOVEMENT', t: 0 }, { w: 'TAIL', t: 1 }, { w: 'VACUUM', t: 0 }, { w: 'RECTIFIES', t: 0 },
      { w: 'BOOM', t: 0 }, { w: 'MOLECULE', t: 0 }, { w: 'MUSICAL', t: 1 }, { w: 'RESTRAINS', t: 0 },
      { w: 'GENERATED', t: 0 }, { w: 'DESPERATE', t: 0 }, { w: 'SIMULATES', t: 0 }, { w: 'MASSIVELY', t: 0 },
      { w: 'WEEK', t: 0 }, { w: 'MOON', t: 0 }, { w: 'COMMUNITY', t: 0 }, { w: 'BORE', t: 1, g: 1 },
      { w: 'MORE', t: 1, g: 1 }, { w: 'JOKE', t: 1, g: 1 }, { w: 'EDITOR', t: 1 }, { w: 'SMALL', t: 0 },
      { w: 'SEEKING', t: 0, g: 1 }, { w: 'STUPIDITY', t: 0 }, { w: 'LUNATIC', t: 1 }, { w: 'QUEUE', t: 0 },
      { w: 'CIVILIZES', t: 0 }, { w: 'AGREE', t: 0, g: 1 }, { w: 'DEFINES', t: 0 }, { w: 'SLASH', t: 0 },
    ],
  },
  {
    num: 32, quizId: 'axiom-8-24-26', live: '2026-08-24', dateLabel: 'August 24, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'nolet', c: 'I' }, { k: 'vowels', n: 1 }, { k: 'onevowel' }, { k: 'len', n: 4 }, { k: 'norepeat' }],
    tiles: [
      { w: 'SPRAY', t: 1 }, { w: 'PARTLY', t: 1 }, { w: 'WERE', t: 1 }, { w: 'BLACKMAIL', t: 0 },
      { w: 'ELIGIBLE', t: 0 }, { w: 'CLOG', t: 1, g: 1 }, { w: 'UNITE', t: 0 }, { w: 'VOTE', t: 0 },
      { w: 'SMALLISH', t: 0 }, { w: 'CLAUSE', t: 0 }, { w: 'HEAD', t: 0 }, { w: 'AMOUNT', t: 0, g: 1 },
      { w: 'HORDES', t: 0 }, { w: 'TACKLED', t: 0 }, { w: 'CONDENSE', t: 0, g: 1 }, { w: 'STATIONS', t: 0 },
      { w: 'POOL', t: 1 }, { w: 'STARVE', t: 0 }, { w: 'CRAP', t: 1, g: 1 }, { w: 'SEEN', t: 1 },
      { w: 'SUPPLY', t: 1 }, { w: 'FOOT', t: 1 }, { w: 'BEST', t: 1, g: 1 }, { w: 'FEES', t: 1 },
    ],
  },
  {
    num: 33, quizId: 'axiom-8-25-26', live: '2026-08-25', dateLabel: 'August 25, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'vowels', n: 2 }, { k: 'norepeat' }, { k: 'in', set: 'fruit' }, { k: 'len', n: 5 }, { k: 'nolet', c: 'S' }],
    tiles: [
      { w: 'MANGO', t: 1, g: 1 }, { w: 'JUICE', t: 1 }, { w: 'CHEESE', t: 0 }, { w: 'GINGER', t: 0 },
      { w: 'BUTTER', t: 0, g: 1 }, { w: 'PRESERVE', t: 0 }, { w: 'VENISON', t: 0 }, { w: 'OMELET', t: 0 },
      { w: 'CIDER', t: 1 }, { w: 'MUSTARD', t: 0 }, { w: 'MUFFIN', t: 0 }, { w: 'KETCHUP', t: 0 },
      { w: 'BROWNIE', t: 0 }, { w: 'GNOCCHI', t: 0 }, { w: 'RADISH', t: 0 }, { w: 'GRAPE', t: 1, g: 1 },
      { w: 'PORRIDGE', t: 0 }, { w: 'CABBAGE', t: 0, g: 1 }, { w: 'GRAVY', t: 1 }, { w: 'OMELETTE', t: 0 },
      { w: 'MOCHA', t: 1 }, { w: 'STEAK', t: 1 }, { w: 'LEMON', t: 1, g: 1 }, { w: 'BEAN', t: 0 },
    ],
  },
  {
    num: 34, quizId: 'axiom-8-26-26', live: '2026-08-26', dateLabel: 'August 26, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'vowels', n: 2 }, { k: 'len', n: 4 }, { k: 'endvowel' }, { k: 'nolet', c: 'B' }, { k: 'norepeat' }],
    tiles: [
      { w: 'DELIGHTED', t: 0 }, { w: 'COUNTRIES', t: 0 }, { w: 'HEARING', t: 0 }, { w: 'REQUIRED', t: 0, g: 1 },
      { w: 'OBJECTING', t: 0 }, { w: 'MOUNTAINS', t: 0 }, { w: 'PLAGUE', t: 1 }, { w: 'FORGIVE', t: 1 },
      { w: 'HIRE', t: 1, g: 1 }, { w: 'THOU', t: 1, g: 1 }, { w: 'SIMULATE', t: 1 }, { w: 'FROZE', t: 1 },
      { w: 'DRAINING', t: 0 }, { w: 'DRIFT', t: 0 }, { w: 'DECODING', t: 0 }, { w: 'PHONING', t: 0, g: 1 },
      { w: 'TIDIES', t: 0 }, { w: 'HARDSHIP', t: 0 }, { w: 'GLASS', t: 0 }, { w: 'CLEAR', t: 0 },
      { w: 'TYPESETS', t: 0 }, { w: 'TILE', t: 1, g: 1 }, { w: 'SCOPE', t: 1 }, { w: 'RESEMBLED', t: 0 },
    ],
  },
  {
    num: 35, quizId: 'axiom-8-27-26', live: '2026-08-27', dateLabel: 'August 27, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'len', n: 4 }, { k: 'nolet', c: 'P' }, { k: 'onevowel' }, { k: 'vowels', n: 1 }, { k: 'norepeat' }],
    tiles: [
      { w: 'SPONSOR', t: 0 }, { w: 'DISHONEST', t: 0 }, { w: 'THUS', t: 1, g: 1 }, { w: 'DISPLAYS', t: 0 },
      { w: 'CARRIED', t: 0, g: 1 }, { w: 'QUICK', t: 0 }, { w: 'FIBER', t: 0 }, { w: 'TOES', t: 0 },
      { w: 'SLIGHT', t: 1 }, { w: 'STICK', t: 1 }, { w: 'FLOW', t: 1, g: 1 }, { w: 'WINES', t: 0 },
      { w: 'RENEW', t: 0 }, { w: 'FRACTIONS', t: 0 }, { w: 'CLOTHED', t: 0 }, { w: 'STICKS', t: 1 },
      { w: 'TRUSTS', t: 1 }, { w: 'ANALYST', t: 0 }, { w: 'ISLANDS', t: 0 }, { w: 'COMPOSED', t: 0 },
      { w: 'FUDGE', t: 0, g: 1 }, { w: 'BURY', t: 1, g: 1 }, { w: 'EVENED', t: 0 }, { w: 'SERVED', t: 0 },
    ],
  },
  {
    num: 36, quizId: 'axiom-8-28-26', live: '2026-08-28', dateLabel: 'August 28, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'len', n: 8 }, { k: 'hides', set: 'animal' }, { k: 'nolet', c: 'N' }, { k: 'vowels', n: 4 }, { k: 'altvc' }],
    tiles: [
      { w: 'HUNDREDS', t: 0 }, { w: 'UNHEALTHY', t: 0 }, { w: 'CRAMPS', t: 1 }, { w: 'COUNTS', t: 0 },
      { w: 'BUYING', t: 0 }, { w: 'NOTES', t: 0 }, { w: 'OBEYED', t: 1 }, { w: 'NOMINATES', t: 0 },
      { w: 'EXECUTES', t: 1 }, { w: 'SCORING', t: 0 }, { w: 'EDUCATES', t: 1, g: 1 }, { w: 'BONES', t: 0 },
      { w: 'POINTED', t: 0 }, { w: 'JOKES', t: 1 }, { w: 'VISITING', t: 0, g: 1 }, { w: 'LITERATE', t: 1, g: 1 },
      { w: 'NODES', t: 0 }, { w: 'OPERATED', t: 1, g: 1 }, { w: 'MUNDANE', t: 0 }, { w: 'VISITED', t: 1 },
      { w: 'COPES', t: 1 }, { w: 'CHESTNUT', t: 0 }, { w: 'GUIDING', t: 0 }, { w: 'DETERMINE', t: 0, g: 1 },
    ],
  },
  {
    num: 37, quizId: 'axiom-8-29-26', live: '2026-08-29', dateLabel: 'August 29, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'altvc' }, { k: 'nolet', c: 'H' }, { k: 'norepeat' }, { k: 'len', n: 5 }, { k: 'vowels', n: 2 }],
    tiles: [
      { w: 'DATA', t: 1 }, { w: 'CHOSEN', t: 0 }, { w: 'PINT', t: 0 }, { w: 'THEREOF', t: 0 },
      { w: 'COMPOUND', t: 0 }, { w: 'FISHES', t: 0 }, { w: 'OPEN', t: 1 }, { w: 'DARES', t: 1 },
      { w: 'FAME', t: 1 }, { w: 'FILED', t: 1, g: 1 }, { w: 'PILOT', t: 1, g: 1 }, { w: 'CHEWED', t: 0 },
      { w: 'APPEARING', t: 0 }, { w: 'DIRECTLY', t: 0 }, { w: 'SATIRE', t: 1 }, { w: 'INHABITS', t: 0 },
      { w: 'MOVED', t: 1, g: 1 }, { w: 'HARM', t: 0 }, { w: 'ORTHODOX', t: 0 }, { w: 'SHORTEST', t: 0 },
      { w: 'MATCHES', t: 0, g: 1 }, { w: 'FUSE', t: 1 }, { w: 'SENTENCE', t: 0 }, { w: 'MONTHLY', t: 0, g: 1 },
    ],
  },
  {
    num: 38, quizId: 'axiom-8-30-26', live: '2026-08-30', dateLabel: 'August 30, 2026', sunday: true,
    budget: 7,
    rules: [{ k: 'nolet', c: 'D' }, { k: 'len', n: 4 }, { k: 'norepeat' }, { k: 'alpha' }, { k: 'onevowel' }, { k: 'nolet', c: 'C' }, { k: 'vowels', n: 1 }],
    tiles: [
      { w: 'CAUSES', t: 0 }, { w: 'ABORTED', t: 0 }, { w: 'BEERS', t: 1 }, { w: 'BAKES', t: 0 },
      { w: 'ENERGY', t: 0 }, { w: 'MOST', t: 1, g: 1 }, { w: 'CIVIL', t: 0 }, { w: 'FLOOR', t: 1 },
      { w: 'FLOORS', t: 1 }, { w: 'HOST', t: 1, g: 1 }, { w: 'EMERGE', t: 0 }, { w: 'CAUSAL', t: 0 },
      { w: 'DOORS', t: 1 }, { w: 'DOMINANT', t: 0 }, { w: 'ADHERES', t: 0 }, { w: 'POSTING', t: 0 },
      { w: 'GUARD', t: 0 }, { w: 'SEGMENTS', t: 0 }, { w: 'ENVY', t: 1, g: 1 }, { w: 'SELECT', t: 0 },
      { w: 'PHASED', t: 0, g: 1 }, { w: 'DEEMS', t: 1 }, { w: 'SUBTLETY', t: 0 }, { w: 'INTRINSIC', t: 0 },
      { w: 'COUGH', t: 0 }, { w: 'ACCORDED', t: 0 }, { w: 'BOOST', t: 1 }, { w: 'MAKERS', t: 0, g: 1 },
    ],
  },
  {
    num: 39, quizId: 'axiom-8-31-26', live: '2026-08-31', dateLabel: 'August 31, 2026', sunday: false,
    budget: 6,
    rules: [{ k: 'altvc' }, { k: 'in', set: 'fruit' }, { k: 'vowels', n: 2 }, { k: 'norepeat' }, { k: 'nolet', c: 'R' }],
    tiles: [
      { w: 'PRETZEL', t: 0, g: 1 }, { w: 'BURRITO', t: 0 }, { w: 'POTATO', t: 0 }, { w: 'SAUSAGE', t: 0 },
      { w: 'BUTTER', t: 0 }, { w: 'MELON', t: 1, g: 1 }, { w: 'RISOTTO', t: 0 }, { w: 'LEMON', t: 1, g: 1 },
      { w: 'OATMEAL', t: 0 }, { w: 'TOAST', t: 0 }, { w: 'WATER', t: 1 }, { w: 'BEET', t: 0 },
      { w: 'VINEGAR', t: 1 }, { w: 'CINNAMON', t: 0 }, { w: 'CUPCAKE', t: 0, g: 1 }, { w: 'BASIL', t: 1 },
      { w: 'CARAMEL', t: 0 }, { w: 'OMELET', t: 0 }, { w: 'SALAD', t: 0 }, { w: 'RICE', t: 1 },
      { w: 'PASTA', t: 0 }, { w: 'FALAFEL', t: 0 }, { w: 'DATE', t: 1, g: 1 }, { w: 'GELATO', t: 1 },
    ],
  },
];

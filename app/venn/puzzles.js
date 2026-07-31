// Puzzle data for Venn, the daily three-circle sorting game. Imported ONLY by
// the server page (app/venn/page.js), which filters live<=today before passing
// boards to the client.
//
// Three labelled circles, each a property of a word, and twelve items (fifteen
// on Sunday) that between them fill all seven regions. Every region prints how
// many items it holds, so a misfiled word is catchable by counting, and the
// board refuses to be submitted until the arrangement matches every count.
//
// LEAK GUARD: no board stores where the items go. A rule spec is DATA
// ({ k: 'dbl' }, { k: 'len', n: 5 }); the evaluator and the reader-facing
// labels both live in RULES in VennClient, and the client recomputes each
// item's region from the rules, exactly as the verifier does.
//
// Every board is machine-verified (scripts/verify-venn.mjs) to have all seven
// regions non-empty, a triple overlap of one or two, no region over the cap,
// and no item stranded outside all three circles. Sundays withhold two region
// counts (hiddenCounts), so two of the seven have to be reasoned out.
export const PUZZLES = [
  {
    num: 1, quizId: 'venn-7-24-26', live: '2026-07-24', dateLabel: 'July 24, 2026', sunday: false,
    rules: [{ k: 'sameends' }, { k: 'vowels', n: 2 }, { k: 'hides', set: 'animal' }],
    items: [
      'SUBMITS', 'LEGAL', 'CATCH', 'SERVANTS',
      'ESTATE', 'RATHER', 'SKIPS', 'SUPERB',
      'PEDANTRY', 'TOAST', 'KEEN', 'ESCAPE',
    ],
  },
  {
    num: 2, quizId: 'venn-7-25-26', live: '2026-07-25', dateLabel: 'July 25, 2026', sunday: false,
    rules: [{ k: 'len', n: 5 }, { k: 'onevowel' }, { k: 'dbl' }],
    items: [
      'HOLD', 'SLOTS', 'ARROW', 'ROLLS',
      'STOP', 'SHIPPING', 'STIRRING', 'COMMENT',
      'GIANT', 'LOBBY', 'SMART', 'BLESSED',
    ],
  },
  {
    num: 3, quizId: 'venn-7-26-26', live: '2026-07-26', dateLabel: 'July 26, 2026', sunday: true,
    rules: [{ k: 'onevowel' }, { k: 'hides', set: 'number' }, { k: 'len', n: 5 }],
    items: [
      'CLONE', 'WHEN', 'EXTENT', 'TRACK',
      'BEATEN', 'TENSE', 'EXTENTS', 'INTER',
      'HELPLESS', 'PROSE', 'TEND', 'SIXTY',
      'TEETH', 'LESSER', 'EXTENDED',
    ],
    hiddenCounts: [6, 1],
  },
  {
    num: 4, quizId: 'venn-7-27-26', live: '2026-07-27', dateLabel: 'July 27, 2026', sunday: false,
    rules: [{ k: 'vowels', n: 2 }, { k: 'hides', set: 'animal' }, { k: 'norepeat' }],
    items: [
      'PERSONS', 'SCREEN', 'NEAT', 'IRATE',
      'WHENCE', 'VARIANTS', 'FANTASY', 'RANTED',
      'CORN', 'IGNORANT', 'HEATING', 'GIANT',
    ],
  },
  {
    num: 5, quizId: 'venn-7-28-26', live: '2026-07-28', dateLabel: 'July 28, 2026', sunday: false,
    rules: [{ k: 'hides', set: 'body' }, { k: 'len', n: 5 }, { k: 'startvowel' }],
    items: [
      'GIANT', 'ALARMS', 'ARRAY', 'WARM',
      'EARNS', 'EARNING', 'ENTERING', 'INTENDS',
      'EXCUSES', 'YEARS', 'EDITS', 'HEARS',
    ],
  },
  {
    num: 6, quizId: 'venn-7-29-26', live: '2026-07-29', dateLabel: 'July 29, 2026', sunday: false,
    rules: [{ k: 'dbl' }, { k: 'startvowel' }, { k: 'len', n: 6 }],
    items: [
      'BRASS', 'OBJECT', 'TOOLS', 'ENABLE',
      'ABORTION', 'COMICS', 'OBSESS', 'APPLY',
      'ACTUAL', 'FLOODS', 'LOOKED', 'ERROR',
    ],
  },
  {
    num: 7, quizId: 'venn-7-30-26', live: '2026-07-30', dateLabel: 'July 30, 2026', sunday: false,
    rules: [{ k: 'vowels', n: 2 }, { k: 'lenGte', n: 6 }, { k: 'hides', set: 'animal' }],
    items: [
      'TRIVIAL', 'COMBAT', 'SUPPLIES', 'PANT',
      'RESIGNS', 'WARRANTY', 'TAPE', 'RAPE',
      'UNWANTED', 'PIGS', 'LOSES', 'WRATH',
    ],
  },
  {
    num: 8, quizId: 'venn-7-31-26', live: '2026-07-31', dateLabel: 'July 31, 2026', sunday: false,
    rules: [{ k: 'startvowel' }, { k: 'sameends' }, { k: 'lenGte', n: 6 }],
    items: [
      'GOING', 'EASE', 'BREACH', 'DINED',
      'SPIRITS', 'EAGLE', 'ALONG', 'INTIMATE',
      'THESIS', 'SMILES', 'AREA', 'EXPOSURE',
    ],
  },
  {
    num: 9, quizId: 'venn-8-1-26', live: '2026-08-01', dateLabel: 'August 1, 2026', sunday: false,
    rules: [{ k: 'hides', set: 'number' }, { k: 'nolet', c: 'S' }, { k: 'startvowel' }],
    items: [
      'POISONED', 'IGNORANT', 'EXTENT', 'ONESELF',
      'FOURTH', 'INTENDED', 'INTENDS', 'EXCEPTS',
      'SIXTY', 'INCLUDE', 'INTENSE', 'COOLED',
    ],
  },
  {
    num: 10, quizId: 'venn-8-2-26', live: '2026-08-02', dateLabel: 'August 2, 2026', sunday: true,
    rules: [{ k: 'nolet', c: 'E' }, { k: 'onevowel' }, { k: 'lenGte', n: 6 }],
    items: [
      'STUPID', 'PAIR', 'GULLIBLE', 'SETTLE',
      'NICKNAME', 'WITHIN', 'RASH', 'MYSELF',
      'MOOD', 'RECENT', 'UNIT', 'UNFAIR',
      'PUBLISH', 'DEEMS', 'HEREBY',
    ],
    hiddenCounts: [1, 2],
  },
  {
    num: 11, quizId: 'venn-8-3-26', live: '2026-08-03', dateLabel: 'August 3, 2026', sunday: false,
    rules: [{ k: 'onevowel' }, { k: 'hides', set: 'body' }, { k: 'startvowel' }],
    items: [
      'ALPHA', 'ALLY', 'SHINING', 'SHIP',
      'ACCUSE', 'LUNG', 'EYES', 'BEARS',
      'EARLIER', 'HANDS', 'ANYWAY', 'IMPOSING',
    ],
  },
  {
    num: 12, quizId: 'venn-8-4-26', live: '2026-08-04', dateLabel: 'August 4, 2026', sunday: false,
    rules: [{ k: 'startvowel' }, { k: 'len', n: 5 }, { k: 'nolet', c: 'E' }],
    items: [
      'CLASS', 'MAIZE', 'RAID', 'AGENT',
      'ACHIEVES', 'USUAL', 'ACROSS', 'AIDED',
      'ILLUSION', 'LEAVE', 'ACORN', 'INDUCE',
    ],
  },
  {
    num: 13, quizId: 'venn-8-5-26', live: '2026-08-05', dateLabel: 'August 5, 2026', sunday: false,
    rules: [{ k: 'len', n: 6 }, { k: 'hides', set: 'animal' }, { k: 'nolet', c: 'S' }],
    items: [
      'SYMBOL', 'SERVANTS', 'FEELING', 'WHENEVER',
      'DEBATE', 'ANTIQUE', 'ESCAPE', 'CONSTANT',
      'HONEST', 'GRANTS', 'PLANTS', 'FILMED',
    ],
  },
  {
    num: 14, quizId: 'venn-8-6-26', live: '2026-08-06', dateLabel: 'August 6, 2026', sunday: false,
    rules: [{ k: 'twinvowel' }, { k: 'hides', set: 'body' }, { k: 'len', n: 6 }],
    items: [
      'SHINED', 'SHIPS', 'READER', 'GAINING',
      'GEARED', 'BEARDS', 'ELECTION', 'FARM',
      'HATING', 'FEARING', 'WOMBAT', 'YEARS',
    ],
  },
  {
    num: 15, quizId: 'venn-8-7-26', live: '2026-08-07', dateLabel: 'August 7, 2026', sunday: false,
    rules: [{ k: 'startvowel' }, { k: 'sameends' }, { k: 'nolet', c: 'S' }],
    items: [
      'UNLESS', 'ENSURE', 'EPISODE', 'ENTRANCE',
      'ORDERS', 'ONCE', 'MORTGAGE', 'INNOCENT',
      'EDIT', 'TWIST', 'ENGAGE', 'KNOCK',
    ],
  },
  {
    num: 16, quizId: 'venn-8-8-26', live: '2026-08-08', dateLabel: 'August 8, 2026', sunday: false,
    rules: [{ k: 'len', n: 7 }, { k: 'nolet', c: 'R' }, { k: 'onevowel' }],
    items: [
      'GLOBE', 'TALK', 'RETURNS', 'FRESH',
      'BECOMES', 'WRITING', 'VICTIMS', 'PRESENT',
      'KICKING', 'FIGHTER', 'LARGEST', 'DEVELOP',
    ],
  },
  {
    num: 17, quizId: 'venn-8-9-26', live: '2026-08-09', dateLabel: 'August 9, 2026', sunday: true,
    rules: [{ k: 'len', n: 6 }, { k: 'nolet', c: 'E' }, { k: 'dbl' }],
    items: [
      'SHEET', 'FOLLOWS', 'CHANNEL', 'CHOICE',
      'SEEMED', 'ADDING', 'CHILL', 'STRAIN',
      'DEEPER', 'ACROSS', 'STREET', 'RULING',
      'TRYING', 'MISSED', 'FLIP',
    ],
    hiddenCounts: [3, 4],
  },
  {
    num: 18, quizId: 'venn-8-10-26', live: '2026-08-10', dateLabel: 'August 10, 2026', sunday: false,
    rules: [{ k: 'dbl' }, { k: 'vowels', n: 3 }, { k: 'hides', set: 'animal' }],
    items: [
      'BATHROOM', 'MARATHON', 'REFUGEES', 'GRAMMAR',
      'IGNORED', 'INSTANT', 'MORRIS', 'BEER',
      'MARRIED', 'FEEDBACK', 'BATTERY', 'CATCH',
    ],
  },
  {
    num: 19, quizId: 'venn-8-11-26', live: '2026-08-11', dateLabel: 'August 11, 2026', sunday: false,
    rules: [{ k: 'len', n: 4 }, { k: 'hides', set: 'body' }, { k: 'nolet', c: 'S' }],
    items: [
      'HEART', 'TEARS', 'ROSE', 'SHIP',
      'ARMY', 'TEACHING', 'FISHING', 'ARMS',
      'ENTIRELY', 'BROUGHT', 'MACHINES', 'GAVE',
    ],
  },
  {
    num: 20, quizId: 'venn-8-12-26', live: '2026-08-12', dateLabel: 'August 12, 2026', sunday: false,
    rules: [{ k: 'vowels', n: 3 }, { k: 'nolet', c: 'S' }, { k: 'endvowel' }],
    items: [
      'ARRESTED', 'REALITY', 'WHOLE', 'SHAME',
      'AIRCRAFT', 'CHAIRMAN', 'PREPARE', 'LICENSED',
      'LEASE', 'FENCE', 'LANDING', 'SNAKE',
    ],
  },
  {
    num: 21, quizId: 'venn-8-13-26', live: '2026-08-13', dateLabel: 'August 13, 2026', sunday: false,
    rules: [{ k: 'dbl' }, { k: 'len', n: 4 }, { k: 'vowels', n: 2 }],
    items: [
      'HELP', 'WEEK', 'WITNESS', 'OVER',
      'EXPAND', 'POPE', 'SIDE', 'POLL',
      'TRIGGER', 'BOTTLE', 'FOOTAGE', 'WEED',
    ],
  },
  {
    num: 22, quizId: 'venn-8-14-26', live: '2026-08-14', dateLabel: 'August 14, 2026', sunday: false,
    rules: [{ k: 'sameends' }, { k: 'startvowel' }, { k: 'len', n: 6 }],
    items: [
      'ADULTS', 'SAINTS', 'STEPS', 'ENABLE',
      'USELESS', 'HUMANS', 'REGULAR', 'EMPIRE',
      'EDGE', 'KILLER', 'STANDS', 'INTERNAL',
    ],
  },
  {
    num: 23, quizId: 'venn-8-15-26', live: '2026-08-15', dateLabel: 'August 15, 2026', sunday: false,
    rules: [{ k: 'len', n: 5 }, { k: 'endvowel' }, { k: 'nolet', c: 'R' }],
    items: [
      'DRUGS', 'REFUSE', 'LARGE', 'ANGLE',
      'TRULY', 'PAYMENTS', 'OUGHT', 'RESPONSE',
      'RESCUE', 'NERVE', 'UNIQUE', 'DIALOGUE',
    ],
  },
  {
    num: 24, quizId: 'venn-8-16-26', live: '2026-08-16', dateLabel: 'August 16, 2026', sunday: true,
    rules: [{ k: 'onevowel' }, { k: 'len', n: 5 }, { k: 'nolet', c: 'A' }],
    items: [
      'PROBLEMS', 'COMES', 'HELP', 'YARDS',
      'PARTY', 'WORD', 'WALL', 'WITNESS',
      'FEES', 'SOLO', 'LANDS', 'ASKED',
      'STARS', 'PRAY', 'TREES',
    ],
    hiddenCounts: [2, 5],
  },
  {
    num: 25, quizId: 'venn-8-17-26', live: '2026-08-17', dateLabel: 'August 17, 2026', sunday: false,
    rules: [{ k: 'hides', set: 'number' }, { k: 'nolet', c: 'E' }, { k: 'len', n: 6 }],
    items: [
      'GAINED', 'SOONER', 'FOUR', 'MEDIUM',
      'POUNDS', 'OPPONENT', 'SIXTH', 'LISTEN',
      'ANYONE', 'BOOK', 'FOURTH', 'NOBODY',
    ],
  },
  {
    num: 26, quizId: 'venn-8-18-26', live: '2026-08-18', dateLabel: 'August 18, 2026', sunday: false,
    rules: [{ k: 'endvowel' }, { k: 'lenGte', n: 7 }, { k: 'nolet', c: 'E' }],
    items: [
      'FORMULA', 'STUDYING', 'CULTURE', 'ALBUMS',
      'JUSTICE', 'TABLE', 'RESPONSE', 'TOBACCO',
      'AUDIO', 'REMEMBER', 'BLAME', 'BOMBS',
    ],
  },
  {
    num: 27, quizId: 'venn-8-19-26', live: '2026-08-19', dateLabel: 'August 19, 2026', sunday: false,
    rules: [{ k: 'hides', set: 'animal' }, { k: 'nolet', c: 'R' }, { k: 'vowels', n: 3 }],
    items: [
      'EDUCATED', 'RATED', 'FANTASY', 'REACHES',
      'DRAMATIC', 'PROGRAMS', 'QUIETLY', 'MUTUAL',
      'LOCATED', 'ESCAPED', 'WINGS', 'POSITIVE',
    ],
  },
  {
    num: 28, quizId: 'venn-8-20-26', live: '2026-08-20', dateLabel: 'August 20, 2026', sunday: false,
    rules: [{ k: 'nolet', c: 'A' }, { k: 'len', n: 4 }, { k: 'startvowel' }],
    items: [
      'UNIT', 'CHAT', 'EARL', 'CORN',
      'APPEAR', 'FAKE', 'ANYTHING', 'ENJOYED',
      'AUTO', 'ACTS', 'DEBT', 'WITNESS',
    ],
  },
  {
    num: 29, quizId: 'venn-8-21-26', live: '2026-08-21', dateLabel: 'August 21, 2026', sunday: false,
    rules: [{ k: 'hides', set: 'animal' }, { k: 'nolet', c: 'S' }, { k: 'lenGte', n: 7 }],
    items: [
      'BEEF', 'PLANTS', 'CARPET', 'EDUCATED',
      'BATTLES', 'CONCRETE', 'FILE', 'STRATEGY',
      'MEANT', 'VERSIONS', 'ALONG', 'PANTS',
    ],
  },
  {
    num: 30, quizId: 'venn-8-22-26', live: '2026-08-22', dateLabel: 'August 22, 2026', sunday: false,
    rules: [{ k: 'norepeat' }, { k: 'hides', set: 'body' }, { k: 'altvc' }],
    items: [
      'ROMAN', 'STAND', 'BONE', 'HEARD',
      'EYES', 'FLOATING', 'BONES', 'EARLIER',
      'CLEARED', 'DEFINE', 'RECIPE', 'YEAR',
    ],
  },
  {
    num: 31, quizId: 'venn-8-23-26', live: '2026-08-23', dateLabel: 'August 23, 2026', sunday: true,
    rules: [{ k: 'sameends' }, { k: 'hides', set: 'number' }, { k: 'nolet', c: 'S' }],
    items: [
      'ESTATE', 'POET', 'TENSION', 'DEFEND',
      'STREETS', 'PRISONER', 'EXPENSE', 'EVENING',
      'PHONES', 'TRIP', 'SOMEONE', 'STONES',
      'EVERYONE', 'COOK', 'BEATEN',
    ],
    hiddenCounts: [1, 6],
  },
  {
    num: 32, quizId: 'venn-8-24-26', live: '2026-08-24', dateLabel: 'August 24, 2026', sunday: false,
    rules: [{ k: 'nolet', c: 'R' }, { k: 'onevowel' }, { k: 'vowels', n: 2 }],
    items: [
      'CHOICE', 'FRAUD', 'WORST', 'COUSIN',
      'THREAD', 'THREE', 'WORDS', 'CLIP',
      'VOTED', 'ATHLETES', 'THEME', 'READ',
    ],
  },
  {
    num: 33, quizId: 'venn-8-25-26', live: '2026-08-25', dateLabel: 'August 25, 2026', sunday: false,
    rules: [{ k: 'lenGte', n: 8 }, { k: 'dbl' }, { k: 'endvowel' }],
    items: [
      'SESSION', 'HANDSOME', 'PRESSURE', 'HAHA',
      'MACHINES', 'STRESSED', 'CATTLE', 'COLORADO',
      'EXPENSE', 'PULLED', 'CHAMPION', 'BACTERIA',
    ],
  },
  {
    num: 34, quizId: 'venn-8-26-26', live: '2026-08-26', dateLabel: 'August 26, 2026', sunday: false,
    rules: [{ k: 'lenGte', n: 8 }, { k: 'sameends' }, { k: 'nolet', c: 'E' }],
    items: [
      'EXTREME', 'CAPACITY', 'SHOPPING', 'PASS',
      'SETS', 'MIND', 'SPIRITS', 'STATIONS',
      'CLASSIC', 'SUPPLIES', 'FEATURED', 'SAVINGS',
    ],
  },
  {
    num: 35, quizId: 'venn-8-27-26', live: '2026-08-27', dateLabel: 'August 27, 2026', sunday: false,
    rules: [{ k: 'len', n: 7 }, { k: 'hides', set: 'body' }, { k: 'norepeat' }],
    items: [
      'MISTAKE', 'HEAR', 'WRITTEN', 'NATURAL',
      'WARM', 'WELFARE', 'SHIPPING', 'BEARING',
      'FISHING', 'TEARS', 'ALARM', 'CHARGE',
    ],
  },
  {
    num: 36, quizId: 'venn-8-28-26', live: '2026-08-28', dateLabel: 'August 28, 2026', sunday: false,
    rules: [{ k: 'nolet', c: 'T' }, { k: 'hides', set: 'number' }, { k: 'len', n: 7 }],
    items: [
      'DONE', 'TENSION', 'COIN', 'DYNAMIC',
      'FEDERAL', 'SENTENCE', 'SOMEONE', 'RATINGS',
      'BENEATH', 'HOOK', 'INTENSE', 'WRITTEN',
    ],
  },
  {
    num: 37, quizId: 'venn-8-29-26', live: '2026-08-29', dateLabel: 'August 29, 2026', sunday: false,
    rules: [{ k: 'norepeat' }, { k: 'nolet', c: 'S' }, { k: 'lenGte', n: 8 }],
    items: [
      'HEARD', 'LOVELY', 'AWARD', 'BOMB',
      'OBSERVED', 'REPEATED', 'PROVINCE', 'MOREOVER',
      'PUSHED', 'PRODUCES', 'EQUALITY', 'AVIATION',
    ],
  },
  {
    num: 38, quizId: 'venn-8-30-26', live: '2026-08-30', dateLabel: 'August 30, 2026', sunday: true,
    rules: [{ k: 'nolet', c: 'R' }, { k: 'altvc' }, { k: 'onevowel' }],
    items: [
      'SEVEN', 'DAWN', 'SENDS', 'NAIL',
      'HATES', 'WALLS', 'COLOR', 'METRES',
      'EVEN', 'MAYOR', 'STARTS', 'REMOVAL',
      'SEVERE', 'CITED', 'SCENES',
    ],
    hiddenCounts: [1, 4],
  },
];

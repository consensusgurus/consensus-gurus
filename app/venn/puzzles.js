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
// KNOWLEDGE BOARDS (added 2026-08-05). A board may declare a `domain`
// ('country', 'state', 'element', 'president') and use `{ k: 'fact', p: ... }`
// rules, which ask something about the THING the item names rather than about
// its letters. The domains are closed tables in lib/venn-facts.js: every row
// carries every property true of it, and the verifier refuses any item that is
// not a row, so a knowledge board cannot be wrong by omission the way the
// `hides` member list could. House style is two knowledge rules plus one
// letter rule, and three knowledge rules is refused outright so a player who
// does not know the subject always has one circle they can still read.
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
      'RESIGNS', 'WARRANTY', 'TAPE', 'CATER',
      'UNWANTED', 'BOWL', 'LOSES', 'WRATH',
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
      'ACCUSE', 'CRIB', 'ITCHING', 'BEARS',
      'EARLIER', 'GRASP', 'ANYWAY', 'IMPOSING',
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
      'SYMBOL', 'SERVANTS', 'MEANING', 'WHENEVER',
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
      'ARMY', 'TEACHING', 'FISHING', 'SOLD',
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
      'GAINED', 'SOONER', 'ABOUT', 'MEDIUM',
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
      'BEEF', 'PLANTS', 'MARKET', 'EDUCATED',
      'BATTLES', 'CONCRETE', 'FILE', 'STRATEGY',
      'MEANT', 'VERSIONS', 'ALONG', 'PANTS',
    ],
  },
  {
    num: 30, quizId: 'venn-8-22-26', live: '2026-08-22', dateLabel: 'August 22, 2026', sunday: false,
    rules: [{ k: 'norepeat' }, { k: 'hides', set: 'body' }, { k: 'altvc' }],
    items: [
      'ROMAN', 'STAND', 'TULIP', 'HEARD',
      'EYELID', 'FLOATING', 'LEGIT', 'EARLIER',
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
  {
    num: 39, quizId: 'venn-8-31-26', live: '2026-08-31', dateLabel: 'August 31, 2026', sunday: false,
    rules: [{ k: 'nolet', c: 'T' }, { k: 'hides', set: 'body' }, { k: 'len', n: 7 }],
    items: [
      'WRITTEN', 'ENTERED', 'CLASSIC', 'YOUNGER',
      'TRIBUTE', 'RETURNS', 'HEARTS', 'EARL',
      'FARMERS', 'BIAS', 'REVIEWS', 'FARMER',
    ],
  },
  {
    num: 40, quizId: 'venn-9-1-26', live: '2026-09-01', dateLabel: 'September 1, 2026', sunday: false,
    rules: [{ k: 'len', n: 6 }, { k: 'norepeat' }, { k: 'nolet', c: 'E' }],
    items: [
      'THROAT', 'STRICT', 'HAHA', 'CARGO',
      'TURNED', 'DRIVES', 'FOOD', 'TOUR',
      'ENDING', 'JOURNEY', 'CAMPUS', 'GLOBAL',
    ],
  },
  {
    num: 41, quizId: 'venn-9-2-26', live: '2026-09-02', dateLabel: 'September 2, 2026', sunday: false,
    rules: [{ k: 'len', n: 7 }, { k: 'sameends' }, { k: 'vowels', n: 2 }],
    items: [
      'CHILDREN', 'SEATS', 'ILLNESS', 'STEPPED',
      'TARGETS', 'ACADEMY', 'SINGLES', 'VICE',
      'GOING', 'SHOPS', 'DIED', 'MAXIMUM',
    ],
  },
  {
    num: 42, quizId: 'venn-9-3-26', live: '2026-09-03', dateLabel: 'September 3, 2026', sunday: false,
    rules: [{ k: 'norepeat' }, { k: 'hides', set: 'body' }, { k: 'nolet', c: 'E' }],
    items: [
      'MODE', 'CUSTODY', 'COACHING', 'ARMY',
      'ARMED', 'PHYSICAL', 'AHEAD', 'PUSHING',
      'BEARD', 'REAR', 'DOWNLOAD', 'CATCHING',
    ],
  },
  {
    num: 43, quizId: 'venn-9-4-26', live: '2026-09-04', dateLabel: 'September 4, 2026', sunday: false,
    rules: [{ k: 'nolet', c: 'A' }, { k: 'lenGte', n: 8 }, { k: 'hides', set: 'number' }],
    items: [
      'ATTENDED', 'COMFORT', 'BEATEN', 'OPPONENT',
      'RELEVANT', 'WEED', 'EXISTING', 'POINTING',
      'ATTEND', 'NONE', 'SIMPLE', 'PHONE',
    ],
  },
  {
    num: 44, quizId: 'venn-9-5-26', live: '2026-09-05', dateLabel: 'September 5, 2026', sunday: false,
    rules: [{ k: 'len', n: 5 }, { k: 'nolet', c: 'E' }, { k: 'onevowel' }],
    items: [
      'LOVER', 'NEWLY', 'SHIFT', 'WELLS',
      'BANK', 'COOK', 'MEET', 'METAL',
      'WALKS', 'MARGIN', 'FACES', 'ROUND',
    ],
  },
  {
    num: 45, quizId: 'venn-9-6-26', live: '2026-09-06', dateLabel: 'September 6, 2026', sunday: true,
    rules: [{ k: 'lenGte', n: 7 }, { k: 'sameends' }, { k: 'vowels', n: 2 }],
    items: [
      'SUPPOSED', 'DEVOTED', 'SAMPLES', 'LIBRARY',
      'MAXIMUM', 'NATION', 'MEMBERS', 'DISABLED',
      'VETERANS', 'EVIDENCE', 'SURPRISE', 'LAYERS',
      'THOUGHT', 'HEALTH', 'WEAR',
    ],
    hiddenCounts: [2, 3],
  },
  {
    num: 46, quizId: 'venn-9-7-26', live: '2026-09-07', dateLabel: 'September 7, 2026', sunday: false,
    rules: [{ k: 'vowels', n: 3 }, { k: 'len', n: 4 }, { k: 'nolet', c: 'T' }],
    items: [
      'CARL', 'JEAN', 'AREA', 'EXCITED',
      'FOOTBALL', 'ROOT', 'TECH', 'AUTO',
      'REGIONAL', 'OPENING', 'SURPRISE', 'RICH',
    ],
  },
  {
    num: 47, quizId: 'venn-9-8-26', live: '2026-09-08', dateLabel: 'September 8, 2026', sunday: false,
    rules: [{ k: 'vowels', n: 2 }, { k: 'onevowel' }, { k: 'hides', set: 'body' }],
    items: [
      'SEEDS', 'SHIP', 'WHENEVER', 'PARTNER',
      'CHIPS', 'SHIPS', 'CROSS', 'WHEELS',
      'MACHINE', 'LEARNING', 'BATMAN', 'FARMER',
    ],
  },
  {
    num: 48, quizId: 'venn-9-9-26', live: '2026-09-09', dateLabel: 'September 9, 2026', sunday: false,
    rules: [{ k: 'onevowel' }, { k: 'len', n: 7 }, { k: 'nolet', c: 'A' }],
    items: [
      'DEFENCE', 'COLLEGE', 'LAZY', 'WRAPPED',
      'HIGHWAY', 'DROPS', 'MUSEUM', 'FOLLOW',
      'REFLECT', 'CEREMONY', 'ATTRACT', 'KILL',
    ],
  },
  {
    num: 49, quizId: 'venn-9-10-26', live: '2026-09-10', dateLabel: 'September 10, 2026', sunday: false,
    rules: [{ k: 'onevowel' }, { k: 'len', n: 4 }, { k: 'alpha' }],
    items: [
      'FIRST', 'AIMS', 'NAME', 'ACCESS',
      'BEGIN', 'STREET', 'CLIMB', 'HILLS',
      'LOST', 'ADOPT', 'CELLS', 'DUST',
    ],
  },
  {
    num: 50, quizId: 'venn-9-11-26', live: '2026-09-11', dateLabel: 'September 11, 2026', sunday: false,
    rules: [{ k: 'endvowel' }, { k: 'nolet', c: 'S' }, { k: 'len', n: 6 }],
    items: [
      'BECOME', 'GRAVITY', 'INDICATE', 'VERSE',
      'ENSURE', 'FATHER', 'DESIGN', 'SHAME',
      'DONE', 'LIKELY', 'VISIBLE', 'WOMAN',
    ],
  },
  {
    num: 51, quizId: 'venn-9-12-26', live: '2026-09-12', dateLabel: 'September 12, 2026', sunday: false,
    rules: [{ k: 'onevowel' }, { k: 'endvowel' }, { k: 'nolet', c: 'S' }],
    items: [
      'WALKED', 'HELPS', 'CRAZY', 'SENTENCE',
      'DEFENCE', 'WARS', 'EXCHANGE', 'ESCAPE',
      'TWELVE', 'SENSE', 'REVENUE', 'OPPOSITE',
    ],
  },
  {
    num: 52, quizId: 'venn-9-13-26', live: '2026-09-13', dateLabel: 'September 13, 2026', sunday: true,
    rules: [{ k: 'len', n: 5 }, { k: 'twinvowel' }, { k: 'nolet', c: 'A' }],
    items: [
      'BUNCH', 'EXPLAIN', 'NUCLEAR', 'FORCED',
      'TOTAL', 'EXIST', 'QUEST', 'FAULT',
      'RELEASE', 'COMPUTER', 'PRINTING', 'CONTAIN',
      'GOES', 'FEELS', 'SNAKE',
    ],
    hiddenCounts: [1, 2],
  },
  {
    num: 53, quizId: 'venn-9-14-26', live: '2026-09-14', dateLabel: 'September 14, 2026', sunday: false,
    rules: [{ k: 'vowels', n: 2 }, { k: 'startvowel' }, { k: 'nolet', c: 'E' }],
    items: [
      'HITTING', 'UPON', 'CHIP', 'GLASS',
      'ACTUAL', 'OWNERS', 'MINES', 'USELESS',
      'ECONOMIC', 'TWIN', 'UNITS', 'CONCERT',
    ],
  },
  {
    num: 54, quizId: 'venn-9-15-26', live: '2026-09-15', dateLabel: 'September 15, 2026', sunday: false,
    rules: [{ k: 'vowels', n: 2 }, { k: 'sameends' }, { k: 'startvowel' }],
    items: [
      'EMPLOYEE', 'ONTO', 'GARDENS', 'ENTIRE',
      'ALPHA', 'AUDIO', 'SIZES', 'ALWAYS',
      'SEEMS', 'SPORTS', 'LION', 'EVIDENCE',
    ],
  },
  {
    num: 55, quizId: 'venn-9-16-26', live: '2026-09-16', dateLabel: 'September 16, 2026', sunday: false,
    rules: [{ k: 'nolet', c: 'T' }, { k: 'startvowel' }, { k: 'endvowel' }],
    items: [
      'PICTURE', 'ITSELF', 'THEME', 'INTENSE',
      'PAGE', 'INVEST', 'ACTIVELY', 'AUDIENCE',
      'HORRIBLE', 'NATURE', 'ENGLISH', 'SENIOR',
    ],
  },
  {
    num: 56, quizId: 'venn-9-17-26', live: '2026-09-17', dateLabel: 'September 17, 2026', sunday: false,
    rules: [{ k: 'len', n: 5 }, { k: 'nolet', c: 'A' }, { k: 'altvc' }],
    items: [
      'SAFE', 'USED', 'TOPIC', 'JOKE',
      'PLACE', 'TRAIN', 'THIRD', 'MEDICINE',
      'KEEPING', 'GAMES', 'MAGIC', 'LOVES',
    ],
  },
  {
    num: 57, quizId: 'venn-9-18-26', live: '2026-09-18', dateLabel: 'September 18, 2026', sunday: false,
    rules: [{ k: 'hides', set: 'body' }, { k: 'nolet', c: 'S' }, { k: 'dbl' }],
    items: [
      'EARLY', 'FEARS', 'APPEAR', 'CARRIES',
      'TRIBUTE', 'FEELING', 'OFFICIAL', 'TERRIBLE',
      'SHIPPING', 'STOPPED', 'WORSHIP', 'CLUE',
    ],
  },
  {
    num: 58, quizId: 'venn-9-19-26', live: '2026-09-19', dateLabel: 'September 19, 2026', sunday: false,
    rules: [{ k: 'twinvowel' }, { k: 'norepeat' }, { k: 'lenGte', n: 7 }],
    items: [
      'YEAR', 'PARTIAL', 'CLAIMED', 'MEDIUM',
      'TOILET', 'SPEAKING', 'CAREFUL', 'PITCH',
      'CARRIED', 'PATTERN', 'HEADS', 'CULTURES',
    ],
  },
  {
    num: 59, quizId: 'venn-9-20-26', live: '2026-09-20', dateLabel: 'September 20, 2026', sunday: true,
    rules: [{ k: 'len', n: 5 }, { k: 'altvc' }, { k: 'nolet', c: 'E' }],
    items: [
      'UPON', 'TRICKS', 'MAYOR', 'ARENA',
      'TIRED', 'IDEAL', 'LEGAL', 'CHAIR',
      'YOURS', 'AWAY', 'NAMES', 'TUNE',
      'GRAPHICS', 'TERMS', 'BREAK',
    ],
    hiddenCounts: [1, 2],
  },
  {
    num: 60, quizId: 'venn-9-21-26', live: '2026-09-21', dateLabel: 'September 21, 2026', sunday: false,
    rules: [{ k: 'nolet', c: 'E' }, { k: 'vowels', n: 2 }, { k: 'hides', set: 'number' }],
    items: [
      'ANYONE', 'STAGES', 'FOURTH', 'ATTENDED',
      'SIXTH', 'COUNTY', 'WARD', 'ADULT',
      'EVERYONE', 'TOUGH', 'OBJECT', 'CLONE',
    ],
  },
  {
    num: 61, quizId: 'venn-9-22-26', live: '2026-09-22', dateLabel: 'September 22, 2026', sunday: false,
    rules: [{ k: 'startvowel' }, { k: 'norepeat' }, { k: 'vowels', n: 3 }],
    items: [
      'BLAME', 'ALLOW', 'ONES', 'YOURSELF',
      'INSTEAD', 'REVIEW', 'AFRAID', 'APPROVAL',
      'LABOUR', 'WELCOME', 'REVEALS', 'EXTREME',
    ],
  },
  {
    num: 62, quizId: 'venn-9-23-26', live: '2026-09-23', dateLabel: 'September 23, 2026', sunday: false,
    rules: [{ k: 'vowels', n: 2 }, { k: 'hides', set: 'animal' }, { k: 'dbl' }],
    items: [
      'WIRE', 'HARRY', 'GRANTS', 'HIDDEN',
      'BATHROOM', 'BEEN', 'ACCURATE', 'VILLAGE',
      'LOCATION', 'DRAMA', 'ROMANTIC', 'GRANTED',
    ],
  },
  {
    num: 63, quizId: 'venn-9-24-26', live: '2026-09-24', dateLabel: 'September 24, 2026', sunday: false,
    rules: [{ k: 'hides', set: 'animal' }, { k: 'onevowel' }, { k: 'endvowel' }],
    items: [
      'BATTLES', 'SKILL', 'DEFENCE', 'ENGINE',
      'HENCE', 'CATTLE', 'SLOWLY', 'WRAP',
      'STRATEGY', 'BECOME', 'BEER', 'WHENEVER',
    ],
  },
  {
    num: 64, quizId: 'venn-9-25-26', live: '2026-09-25', dateLabel: 'September 25, 2026', sunday: false,
    rules: [{ k: 'onevowel' }, { k: 'len', n: 6 }, { k: 'hides', set: 'number' }],
    items: [
      'LISTEN', 'FOURTH', 'EXTENDED', 'TEND',
      'EXTEND', 'FILMS', 'NETWORKS', 'CHURCH',
      'LANDS', 'PRESERVE', 'FAVOUR', 'EXTENT',
    ],
  },
  {
    num: 65, quizId: 'venn-9-26-26', live: '2026-09-26', dateLabel: 'September 26, 2026', sunday: false,
    rules: [{ k: 'hides', set: 'number' }, { k: 'endvowel' }, { k: 'lenGte', n: 8 }],
    items: [
      'OPPONENT', 'NOSE', 'SERVICE', 'INTENT',
      'SENTENCE', 'SCIENCES', 'HONEY', 'CONVINCE',
      'NONE', 'COVERING', 'EVERYONE', 'NETWORK',
    ],
  },
  {
    num: 66, quizId: 'venn-9-27-26', live: '2026-09-27', dateLabel: 'September 27, 2026', sunday: true,
    rules: [{ k: 'hides', set: 'body' }, { k: 'nolet', c: 'S' }, { k: 'vowels', n: 2 }],
    items: [
      'JUMPING', 'ARREST', 'APPEARS', 'EARL',
      'TERRIBLE', 'WALKER', 'FRENCH', 'BEARS',
      'SHIPPING', 'ASPECT', 'SERVES', 'LISTEN',
      'COOL', 'SLIP', 'TOUCHING',
    ],
    hiddenCounts: [3, 6],
  },
  {
    num: 67, quizId: 'venn-9-28-26', live: '2026-09-28', dateLabel: 'September 28, 2026', sunday: false,
    rules: [{ k: 'hides', set: 'body' }, { k: 'nolet', c: 'R' }, { k: 'len', n: 7 }],
    items: [
      'FOLLOW', 'LEVELS', 'CLIP', 'PUSHING',
      'EXPERTS', 'FARMERS', 'MACHINE', 'CRICKET',
      'CHANCES', 'RUNNING', 'EXISTED', 'HARM',
    ],
  },
  {
    num: 68, quizId: 'venn-9-29-26', live: '2026-09-29', dateLabel: 'September 29, 2026', sunday: false,
    rules: [{ k: 'lenGte', n: 8 }, { k: 'vowels', n: 2 }, { k: 'twinvowel' }],
    items: [
      'USES', 'FRIENDLY', 'ISSUE', 'CATHOLIC',
      'BELIEVES', 'STRAIGHT', 'MOOD', 'CONCERNS',
      'ATTACKED', 'TRAIN', 'RECORDED', 'TRANSIT',
    ],
  },
  {
    num: 69, quizId: 'venn-9-30-26', live: '2026-09-30', dateLabel: 'September 30, 2026', sunday: false,
    domain: 'country',
    rules: [{ k: 'fact', p: 'africa' }, { k: 'fact', p: 'landlocked' }, { k: 'nolet', c: 'H' }],
    items: [
      'GHANA', 'MOROCCO', 'SPAIN', 'SLOVAKIA',
      'HUNGARY', 'ALGERIA', 'CHAD', 'NIGER',
      'FRANCE', 'AUSTRIA', 'ETHIOPIA', 'MALI',
    ],
  },
  {
    num: 70, quizId: 'venn-10-1-26', live: '2026-10-01', dateLabel: 'October 1, 2026', sunday: false,
    domain: 'state',
    rules: [{ k: 'fact', p: 'mississippi' }, { k: 'startvowel' }, { k: 'endvowel' }],
    items: [
      'KENTUCKY', 'ARKANSAS', 'UTAH', 'ALABAMA',
      'WISCONSIN', 'ILLINOIS', 'COLORADO', 'ALASKA',
      'OREGON', 'LOUISIANA', 'DELAWARE', 'IOWA',
    ],
  },
  {
    num: 71, quizId: 'venn-10-2-26', live: '2026-10-02', dateLabel: 'October 2, 2026', sunday: false,
    rules: [{ k: 'lenGte', n: 8 }, { k: 'vowels', n: 3 }, { k: 'nolet', c: 'H' }],
    items: [
      'SHIPPING', 'WHENEVER', 'CHOICE', 'ESTATE',
      'HELPLESS', 'BATHROOM', 'SUBMITS', 'EXTENDED',
      'HEATING', 'SERVANTS', 'LEGAL', 'VARIANTS',
    ],
  },
  {
    num: 72, quizId: 'venn-10-3-26', live: '2026-10-03', dateLabel: 'October 3, 2026', sunday: false,
    domain: 'element',
    rules: [{ k: 'fact', p: 'radio' }, { k: 'len', n: 6 }, { k: 'nolet', c: 'C' }],
    items: [
      'FRANCIUM', 'CURIUM', 'COBALT', 'HELIUM',
      'AMERICIUM', 'RADON', 'HYDROGEN', 'OXYGEN',
      'CARBON', 'THORIUM', 'LITHIUM', 'RADIUM',
    ],
  },
  {
    num: 73, quizId: 'venn-10-4-26', live: '2026-10-04', dateLabel: 'October 4, 2026', sunday: true,
    domain: 'president',
    rules: [{ k: 'fact', p: 'vpfirst' }, { k: 'onevowel' }, { k: 'nolet', c: 'E' }],
    items: [
      'JEFFERSON', 'JACKSON', 'COOLIDGE', 'TRUMAN',
      'VAN BUREN', 'TAYLOR', 'KENNEDY', 'NIXON',
      'FILLMORE', 'TYLER', 'MADISON', 'POLK',
      'GRANT', 'TAFT', 'FORD',
    ],
    hiddenCounts: [1, 4],
  },
  {
    num: 74, quizId: 'venn-10-5-26', live: '2026-10-05', dateLabel: 'October 5, 2026', sunday: false,
    domain: 'country',
    rules: [{ k: 'fact', p: 'europe' }, { k: 'onevowel' }, { k: 'nolet', c: 'G' }],
    items: [
      'PORTUGAL', 'FRANCE', 'TUNISIA', 'CHAD',
      'GERMANY', 'SPAIN', 'LIBYA', 'SWEDEN',
      'GHANA', 'MOROCCO', 'GREECE', 'MALTA',
    ],
  },
  {
    num: 75, quizId: 'venn-10-6-26', live: '2026-10-06', dateLabel: 'October 6, 2026', sunday: false,
    rules: [{ k: 'endvowel' }, { k: 'len', n: 7 }, { k: 'nolet', c: 'U' }],
    items: [
      'EXPOSURE', 'INCLUDE', 'EXCUSES', 'COMMENT',
      'GULLIBLE', 'ANTIQUE', 'LEGAL', 'INTENSE',
      'SUBMITS', 'ESTATE', 'CATCH', 'EPISODE',
    ],
  },
  {
    num: 76, quizId: 'venn-10-7-26', live: '2026-10-07', dateLabel: 'October 7, 2026', sunday: false,
    domain: 'state',
    rules: [{ k: 'fact', p: 'capbig' }, { k: 'norepeat' }, { k: 'nolet', c: 'A' }],
    items: [
      'ARIZONA', 'IDAHO', 'MAINE', 'NEW YORK',
      'ARKANSAS', 'IOWA', 'ILLINOIS', 'VERMONT',
      'FLORIDA', 'OHIO', 'KENTUCKY', 'WYOMING',
    ],
  },
  {
    num: 77, quizId: 'venn-10-8-26', live: '2026-10-08', dateLabel: 'October 8, 2026', sunday: false,
    domain: 'element',
    rules: [{ k: 'fact', p: 'lo' }, { k: 'twinvowel' }, { k: 'nolet', c: 'U' }],
    items: [
      'ALUMINUM', 'HELIUM', 'TITANIUM', 'IODINE',
      'SULFUR', 'LITHIUM', 'MANGANESE', 'LEAD',
      'CALCIUM', 'HYDROGEN', 'IRON', 'NEON',
    ],
  },
  {
    num: 78, quizId: 'venn-10-9-26', live: '2026-10-09', dateLabel: 'October 9, 2026', sunday: false,
    rules: [{ k: 'dbl' }, { k: 'sameends' }, { k: 'vowels', n: 3 }],
    items: [
      'KEEN', 'STREETS', 'LEGAL', 'ESTATE',
      'ARROW', 'CLASSIC', 'BEATEN', 'ESCAPE',
      'SUBMITS', 'LOOKED', 'EXTENDED', 'SUPPLIES',
    ],
  },
  {
    num: 79, quizId: 'venn-10-10-26', live: '2026-10-10', dateLabel: 'October 10, 2026', sunday: false,
    domain: 'president',
    rules: [{ k: 'fact', p: 'general' }, { k: 'len', n: 6 }, { k: 'vowels', n: 2 }],
    items: [
      'GRANT', 'PIERCE', 'HOOVER', 'WILSON',
      'GARFIELD', 'JACKSON', 'LINCOLN', 'TRUMAN',
      'MONROE', 'HAYES', 'MCKINLEY', 'TAYLOR',
    ],
  },
  {
    num: 80, quizId: 'venn-10-11-26', live: '2026-10-11', dateLabel: 'October 11, 2026', sunday: true,
    domain: 'country',
    rules: [{ k: 'fact', p: 'landlocked' }, { k: 'twinvowel' }, { k: 'vowels', n: 3 }],
    items: [
      'HUNGARY', 'AUSTRIA', 'CROATIA', 'BELARUS',
      'CHAD', 'SLOVAKIA', 'PORTUGAL', 'GREECE',
      'SPAIN', 'MOLDOVA', 'IRELAND', 'LATVIA',
      'THAILAND', 'CZECHIA', 'SERBIA',
    ],
    hiddenCounts: [6, 1],
  },
  {
    num: 81, quizId: 'venn-10-12-26', live: '2026-10-12', dateLabel: 'October 12, 2026', sunday: false,
    rules: [{ k: 'norepeat' }, { k: 'endvowel' }, { k: 'lenGte', n: 6 }],
    items: [
      'HOLD', 'CLONE', 'EASE', 'ESTATE',
      'STOP', 'PROSE', 'SUBMITS', 'INCLUDE',
      'TENSE', 'SUPERB', 'SERVANTS', 'INDUCE',
    ],
  },
  {
    num: 82, quizId: 'venn-10-13-26', live: '2026-10-13', dateLabel: 'October 13, 2026', sunday: false,
    domain: 'state',
    rules: [{ k: 'fact', p: 'capbig' }, { k: 'endvowel' }, { k: 'vowels', n: 3 }],
    items: [
      'UTAH', 'ARIZONA', 'DELAWARE', 'ALASKA',
      'WYOMING', 'COLORADO', 'MICHIGAN', 'IDAHO',
      'ALABAMA', 'ARKANSAS', 'OREGON', 'IOWA',
    ],
  },
  {
    num: 83, quizId: 'venn-10-14-26', live: '2026-10-14', dateLabel: 'October 14, 2026', sunday: false,
    domain: 'element',
    rules: [{ k: 'fact', p: 'metal' }, { k: 'startvowel' }, { k: 'vowels', n: 4 }],
    items: [
      'LITHIUM', 'IRON', 'ARGON', 'IODINE',
      'SODIUM', 'INDIUM', 'FLUORINE', 'ALUMINUM',
      'OXYGEN', 'MAGNESIUM', 'SELENIUM', 'IRIDIUM',
    ],
  },
  {
    num: 84, quizId: 'venn-10-15-26', live: '2026-10-15', dateLabel: 'October 15, 2026', sunday: false,
    rules: [{ k: 'startvowel' }, { k: 'onevowel' }, { k: 'vowels', n: 2 }],
    items: [
      'ESTATE', 'EXTENDED', 'SKIPS', 'KEEN',
      'ESCAPE', 'APPLY', 'SUBMITS', 'EXTENT',
      'CATCH', 'ARROW', 'LEGAL', 'EXTENTS',
    ],
  },
  {
    num: 85, quizId: 'venn-10-16-26', live: '2026-10-16', dateLabel: 'October 16, 2026', sunday: false,
    domain: 'president',
    rules: [{ k: 'fact', p: 'vpfirst' }, { k: 'norepeat' }, { k: 'len', n: 5 }],
    items: [
      'JEFFERSON', 'FORD', 'JACKSON', 'HAYES',
      'FILLMORE', 'NIXON', 'OBAMA', 'TYLER',
      'MADISON', 'GRANT', 'TRUMAN', 'BIDEN',
    ],
  },
  {
    num: 86, quizId: 'venn-10-17-26', live: '2026-10-17', dateLabel: 'October 17, 2026', sunday: false,
    domain: 'country',
    rules: [{ k: 'fact', p: 'africa' }, { k: 'endvowel' }, { k: 'lenGte', n: 8 }],
    items: [
      'SUDAN', 'MOROCCO', 'AUSTRIA', 'SLOVAKIA',
      'CHAD', 'ALGERIA', 'PORTUGAL', 'ETHIOPIA',
      'FRANCE', 'CAMEROON', 'THAILAND', 'TANZANIA',
    ],
  },
  {
    num: 87, quizId: 'venn-10-18-26', live: '2026-10-18', dateLabel: 'October 18, 2026', sunday: true,
    domain: 'state',
    rules: [{ k: 'fact', p: 'atlantic' }, { k: 'norepeat' }, { k: 'twinvowel' }],
    items: [
      'DELAWARE', 'ILLINOIS', 'TEXAS', 'FLORIDA',
      'MARYLAND', 'INDIANA', 'UTAH', 'NEW YORK',
      'IDAHO', 'LOUISIANA', 'HAWAII', 'GEORGIA',
      'VIRGINIA', 'IOWA', 'MAINE',
    ],
    hiddenCounts: [4, 2],
  },
  {
    num: 88, quizId: 'venn-10-19-26', live: '2026-10-19', dateLabel: 'October 19, 2026', sunday: false,
    rules: [{ k: 'twinvowel' }, { k: 'onevowel' }, { k: 'lenGte', n: 7 }],
    items: [
      'TOAST', 'KEEN', 'SKIPS', 'SHIPPING',
      'GIANT', 'TEETH', 'SUBMITS', 'STIRRING',
      'CATCH', 'VARIANTS', 'SERVANTS', 'STREETS',
    ],
  },
  {
    num: 89, quizId: 'venn-10-20-26', live: '2026-10-20', dateLabel: 'October 20, 2026', sunday: false,
    domain: 'element',
    rules: [{ k: 'fact', p: 'metal' }, { k: 'fact', p: 'lo' }, { k: 'len', n: 6 }],
    items: [
      'CALCIUM', 'MAGNESIUM', 'NITROGEN', 'HELIUM',
      'TITANIUM', 'COBALT', 'IODINE', 'CARBON',
      'HYDROGEN', 'NICKEL', 'LITHIUM', 'SODIUM',
    ],
  },
  {
    num: 90, quizId: 'venn-10-21-26', live: '2026-10-21', dateLabel: 'October 21, 2026', sunday: false,
    domain: 'president',
    rules: [{ k: 'fact', p: 'twoterms' }, { k: 'fact', p: 'pre1900' }, { k: 'lenGte', n: 7 }],
    items: [
      'WILSON', 'MONROE', 'POLK', 'FILLMORE',
      'REAGAN', 'GRANT', 'HARDING', 'JEFFERSON',
      'TYLER', 'CLINTON', 'COOLIDGE', 'MADISON',
    ],
  },
  {
    num: 91, quizId: 'venn-10-22-26', live: '2026-10-22', dateLabel: 'October 22, 2026', sunday: false,
    rules: [{ k: 'dbl' }, { k: 'startvowel' }, { k: 'lenGte', n: 8 }],
    items: [
      'KEEN', 'ARROW', 'ESCAPE', 'EXTENDED',
      'ROLLS', 'ARRAY', 'SERVANTS', 'ILLUSION',
      'ESTATE', 'SHIPPING', 'PEDANTRY', 'INNOCENT',
    ],
  },
  {
    num: 92, quizId: 'venn-10-23-26', live: '2026-10-23', dateLabel: 'October 23, 2026', sunday: false,
    domain: 'country',
    rules: [{ k: 'fact', p: 'eu' }, { k: 'len', n: 7 }, { k: 'vowels', n: 4 }],
    items: [
      'FRANCE', 'GERMANY', 'MOLDOVA', 'ALBANIA',
      'SPAIN', 'HUNGARY', 'CAMEROON', 'AUSTRIA',
      'ICELAND', 'SLOVAKIA', 'TANZANIA', 'CROATIA',
    ],
  },
];

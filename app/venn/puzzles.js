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
];

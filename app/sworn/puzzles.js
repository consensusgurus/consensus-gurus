// Puzzle data for Sworn, the daily liars puzzle. Imported ONLY by the
// server page (app/sworn/page.js), which filters live<=today AND strips the
// solution before passing cases to the client — the client re-derives the
// unique (thief, liar-set) world from the testimony with its own brute-force
// solver, so the answer never ships over the wire.
//
// Every case was generated (seeded world -> one true-to-world statement per
// suspect -> uniqueness + §7a deducibility filters: parity propagation per
// candidate thief with a human-small case fan-out, NO search) and then
// independently re-verified. Weekdays seat 5 suspects; Sundays seat 6 for
// the Grand Inquest. Validate with scripts/verify-sworn.mjs after ANY edit.
//
// Statement schema (x = suspect index; speaker is the array position):
//   accuse {x}      "X is the thief."
//   innocent {x}    "X is innocent."
//   selfInnocent    "I am not the thief."
//   liar {x}        "X is lying."
//   honest {x}      "X is telling the truth."
//   thiefLiar       "The thief is lying."
//   thiefHonest     "The thief is telling the truth."
export const PUZZLES = [
  {
    num: 1, quizId: "sworn-7-18-26", live: "2026-07-18", dateLabel: "July 18, 2026", sunday: false,
    k: 2,
    suspects: ["Simon","Monty","Flora","Gideon","Rufus"],
    venue: "the Gilded Rooster tavern",
    stolen: "a purse of guineas",
    statements: [
      {"type":"innocent","x":4},
      {"type":"honest","x":3},
      {"type":"innocent","x":3},
      {"type":"accuse","x":4},
      {"type":"thiefLiar"},
    ],
    solution: {"thief":1,"liars":[1,3]},
  },
  {
    num: 2, quizId: "sworn-7-19-26", live: "2026-07-19", dateLabel: "July 19, 2026", sunday: true,
    k: 3,
    suspects: ["Winnie","Lottie","Vera","Hazel","Felix","Monty"],
    venue: "the Saltmarsh docks",
    stolen: "a crate of silk",
    statements: [
      {"type":"accuse","x":3},
      {"type":"liar","x":5},
      {"type":"innocent","x":0},
      {"type":"liar","x":5},
      {"type":"honest","x":2},
      {"type":"thiefLiar"},
    ],
    solution: {"thief":1,"liars":[0,1,3]},
  },
  {
    num: 3, quizId: "sworn-7-20-26", live: "2026-07-20", dateLabel: "July 20, 2026", sunday: false,
    k: 2,
    suspects: ["Monty","Pearl","Bruno","Barnaby","Ezra"],
    venue: "Fenwick's bakery",
    stolen: "the prize sourdough starter",
    statements: [
      {"type":"innocent","x":3},
      {"type":"innocent","x":2},
      {"type":"honest","x":1},
      {"type":"honest","x":2},
      {"type":"liar","x":1},
    ],
    solution: {"thief":3,"liars":[0,4]},
  },
  {
    num: 4, quizId: "sworn-7-21-26", live: "2026-07-21", dateLabel: "July 21, 2026", sunday: false,
    k: 3,
    suspects: ["Flora","Nell","Edmund","Percy","Jasper"],
    venue: "the Old Mill counting-house",
    stolen: "the week's wages",
    statements: [
      {"type":"innocent","x":2},
      {"type":"thiefHonest"},
      {"type":"honest","x":3},
      {"type":"accuse","x":0},
      {"type":"liar","x":0},
    ],
    solution: {"thief":1,"liars":[2,3,4]},
  },
  {
    num: 5, quizId: "sworn-7-22-26", live: "2026-07-22", dateLabel: "July 22, 2026", sunday: false,
    k: 2,
    suspects: ["Flora","Gideon","Winnie","Nell","Simon"],
    venue: "the Harbor Light inn",
    stolen: "a captain's sextant",
    statements: [
      {"type":"liar","x":4},
      {"type":"honest","x":4},
      {"type":"thiefLiar"},
      {"type":"liar","x":1},
      {"type":"innocent","x":3},
    ],
    solution: {"thief":0,"liars":[0,3]},
  },
  {
    num: 6, quizId: "sworn-7-23-26", live: "2026-07-23", dateLabel: "July 23, 2026", sunday: false,
    k: 3,
    suspects: ["Gideon","Winnie","Ezra","Victor","Felix"],
    venue: "the Penny Farthing playhouse",
    stolen: "the leading lady's tiara",
    statements: [
      {"type":"honest","x":1},
      {"type":"thiefLiar"},
      {"type":"accuse","x":1},
      {"type":"accuse","x":1},
      {"type":"selfInnocent"},
    ],
    solution: {"thief":4,"liars":[2,3,4]},
  },
  {
    num: 7, quizId: "sworn-7-24-26", live: "2026-07-24", dateLabel: "July 24, 2026", sunday: false,
    k: 2,
    suspects: ["Opal","Mabel","Rufus","Hazel","Delia"],
    venue: "the Copperfield apothecary",
    stolen: "a jar of rare saffron",
    statements: [
      {"type":"accuse","x":2},
      {"type":"honest","x":3},
      {"type":"innocent","x":4},
      {"type":"innocent","x":0},
      {"type":"honest","x":1},
    ],
    solution: {"thief":4,"liars":[0,2]},
  },
  {
    num: 8, quizId: "sworn-7-25-26", live: "2026-07-25", dateLabel: "July 25, 2026", sunday: false,
    k: 3,
    suspects: ["Simon","Delia","Mabel","Hazel","Cyrus"],
    venue: "the Drover's Arms",
    stolen: "a champion racing pigeon",
    statements: [
      {"type":"thiefLiar"},
      {"type":"liar","x":2},
      {"type":"liar","x":4},
      {"type":"innocent","x":2},
      {"type":"liar","x":2},
    ],
    solution: {"thief":3,"liars":[0,1,4]},
  },
  {
    num: 9, quizId: "sworn-7-26-26", live: "2026-07-26", dateLabel: "July 26, 2026", sunday: true,
    k: 3,
    suspects: ["Ezra","Gideon","Opal","Jasper","Cyrus","Nell"],
    venue: "the Lantern Street pawnshop",
    stolen: "a silver pocket watch",
    statements: [
      {"type":"accuse","x":2},
      {"type":"innocent","x":0},
      {"type":"accuse","x":3},
      {"type":"honest","x":5},
      {"type":"thiefHonest"},
      {"type":"liar","x":2},
    ],
    solution: {"thief":4,"liars":[0,2,4]},
  },
  {
    num: 10, quizId: "sworn-7-27-26", live: "2026-07-27", dateLabel: "July 27, 2026", sunday: false,
    k: 3,
    suspects: ["Iris","Mabel","Rosa","Amos","Percy"],
    venue: "the Wheatsheaf granary",
    stolen: "the harvest ledger",
    statements: [
      {"type":"honest","x":4},
      {"type":"innocent","x":4},
      {"type":"innocent","x":4},
      {"type":"liar","x":0},
      {"type":"liar","x":1},
    ],
    solution: {"thief":4,"liars":[1,2,3]},
  },
  {
    num: 11, quizId: "sworn-7-28-26", live: "2026-07-28", dateLabel: "July 28, 2026", sunday: false,
    k: 2,
    suspects: ["Clara","Hazel","Otis","Rosa","Lottie"],
    venue: "the Bellfound foundry",
    stolen: "the chapel's hand bell",
    statements: [
      {"type":"honest","x":2},
      {"type":"innocent","x":0},
      {"type":"accuse","x":3},
      {"type":"innocent","x":1},
      {"type":"accuse","x":2},
    ],
    solution: {"thief":2,"liars":[0,2]},
  },
  {
    num: 12, quizId: "sworn-7-29-26", live: "2026-07-29", dateLabel: "July 29, 2026", sunday: false,
    k: 3,
    suspects: ["Sadie","Simon","Rufus","Bruno","Felix"],
    venue: "the Quayside fish market",
    stolen: "the day's takings",
    statements: [
      {"type":"honest","x":2},
      {"type":"liar","x":2},
      {"type":"innocent","x":1},
      {"type":"innocent","x":0},
      {"type":"liar","x":2},
    ],
    solution: {"thief":0,"liars":[1,3,4]},
  },
  {
    num: 13, quizId: "sworn-7-30-26", live: "2026-07-30", dateLabel: "July 30, 2026", sunday: false,
    k: 2,
    suspects: ["Nell","Vera","Winnie","Gideon","Mabel"],
    venue: "the Tinker's Row workshop",
    stolen: "a walnut music box",
    statements: [
      {"type":"accuse","x":2},
      {"type":"accuse","x":0},
      {"type":"innocent","x":4},
      {"type":"honest","x":4},
      {"type":"innocent","x":1},
    ],
    solution: {"thief":3,"liars":[0,1]},
  },
  {
    num: 14, quizId: "sworn-7-31-26", live: "2026-07-31", dateLabel: "July 31, 2026", sunday: false,
    k: 3,
    suspects: ["Tessa","Rosa","Lottie","Gideon","Nell"],
    venue: "the Hollybush coaching inn",
    stolen: "the mail satchel",
    statements: [
      {"type":"honest","x":3},
      {"type":"thiefHonest"},
      {"type":"honest","x":4},
      {"type":"accuse","x":0},
      {"type":"innocent","x":1},
    ],
    solution: {"thief":3,"liars":[0,1,3]},
  },
];

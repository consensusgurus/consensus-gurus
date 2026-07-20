// Puzzle data for the daily game. Imported ONLY by the server page
// component, which filters to live<=today before passing puzzles to
// the client — so future puzzles (and their answers) never ship to the
// browser bundle.
//
// Groups are ordered easiest -> trickiest (yellow, green, blue, red — the
// Crux palette). Authoring rules: 16 unique words; every word fits EXACTLY
// one group once the whole board is considered (red herrings are the game,
// ambiguity is a bug — if a word could complete two groups, one of those
// groups must already be full of its own members). Run the validator after
// any edit.
// OWNER RULE (2026-07-15): every puzzle also needs AT LEAST TWO cross-
// category collisions — words that plausibly read as another group on the
// same board — ideally more, while keeping exactly ONE valid grouping.
export const PUZZLES = [
  {
    num: 1,
    quizId: 'links-7-12-26',
    live: '2026-07-12',
    dateLabel: 'July 12, 2026',
    groups: [
      { name: 'Ways to cook an egg', words: ['SCRAMBLE', 'POACH', 'FRY', 'DEVIL'] },
      { name: '___ market', words: ['STOCK', 'BLACK', 'FLEA', 'FARMERS'] },
      { name: 'Small fight', words: ['SCRAP', 'TUSSLE', 'SKIRMISH', 'DUSTUP'] },
      { name: '___fish', words: ['SWORD', 'CAT', 'JELLY', 'CUTTLE'] },
    ],
  },
  {
    num: 2,
    quizId: 'links-7-13-26',
    live: '2026-07-13',
    dateLabel: 'July 13, 2026',
    groups: [
      { name: 'NBA teams', words: ['HEAT', 'JAZZ', 'MAGIC', 'THUNDER'] },
      { name: 'Rough weather', words: ['HAIL', 'SLEET', 'GALE', 'SQUALL'] },
      { name: 'Music genres', words: ['FUNK', 'SOUL', 'SWING', 'BLUES'] },
      { name: '___storm', words: ['BRAIN', 'SAND', 'FIRE', 'SNOW'] },
    ],
  },
  {
    num: 3,
    quizId: 'links-7-14-26',
    live: '2026-07-14',
    dateLabel: 'July 14, 2026',
    groups: [
      { name: 'Coffee orders', words: ['LATTE', 'DRIP', 'AMERICANO', 'MACCHIATO'] },
      { name: 'Shades of brown', words: ['MOCHA', 'TAN', 'CHESTNUT', 'CARAMEL'] },
      { name: 'Boxing punches', words: ['JAB', 'HOOK', 'CROSS', 'UPPERCUT'] },
      { name: '___ roll', words: ['DRUM', 'BARREL', 'EGG', 'HONOR'] },
    ],
  },
  {
    num: 4,
    quizId: 'links-7-15-26',
    live: '2026-07-15',
    dateLabel: 'July 15, 2026',
    groups: [
      { name: 'Big cats', words: ['LION', 'TIGER', 'JAGUAR', 'LEOPARD'] },
      { name: 'Sneaker brands', words: ['PUMA', 'NIKE', 'ADIDAS', 'REEBOK'] },
      { name: 'Golf scores', words: ['EAGLE', 'BIRDIE', 'BOGEY', 'ALBATROSS'] },
      { name: 'Monkeys', words: ['HOWLER', 'SPIDER', 'CAPUCHIN', 'MANDRILL'] },
    ],
  },
  {
    num: 5,
    quizId: 'links-7-16-26',
    live: '2026-07-16',
    dateLabel: 'July 16, 2026',
    groups: [
      { name: 'Card games', words: ['BRIDGE', 'HEARTS', 'SOLITAIRE', 'RUMMY'] },
      { name: 'By the fireplace', words: ['POKER', 'LOG', 'GRATE', 'ASH'] },
      { name: 'Trees', words: ['OAK', 'ELM', 'BIRCH', 'CEDAR'] },
      { name: 'Keyboard keys', words: ['ENTER', 'SHIFT', 'TAB', 'ESCAPE'] },
    ],
  },
  {
    num: 6,
    quizId: 'links-7-17-26',
    live: '2026-07-17',
    dateLabel: 'July 17, 2026',
    groups: [
      { name: 'World capitals', words: ['OSLO', 'CAIRO', 'DUBLIN', 'QUITO'] },
      { name: 'Shades of blue', words: ['TEAL', 'COBALT', 'AZURE', 'INDIGO'] },
      { name: 'Organs', words: ['LIVER', 'SPLEEN', 'PANCREAS', 'BLADDER'] },
      { name: 'Beans', words: ['LIMA', 'KIDNEY', 'NAVY', 'PINTO'] },
    ],
  },
  {
    num: 7,
    quizId: 'links-7-18-26',
    live: '2026-07-18',
    dateLabel: 'July 18, 2026',
    // rev 2 (2026-07-15): CHICAGO and TITANIC were BOTH Broadway musicals AND
    // Best Picture winners — two valid solutions. TITANIC -> HAMILTON;
    // CHICAGO moves to Best Picture as the trap (musicals are full, and none
    // of CATS/RENT/WICKED/HAMILTON won Best Picture). HAIR reads musical too.
    groups: [
      { name: 'Tennis shots', words: ['LOB', 'VOLLEY', 'ACE', 'SMASH'] },
      { name: 'Broadway musicals', words: ['CATS', 'HAMILTON', 'RENT', 'WICKED'] },
      { name: 'Best Picture winners', words: ['GLADIATOR', 'CRASH', 'ARGO', 'CHICAGO'] },
      { name: '___ metal', words: ['HAIR', 'HEAVY', 'DEATH', 'PRECIOUS'] },
    ],
  },
  {
    num: 8,
    quizId: 'links-7-19-26',
    live: '2026-07-19',
    dateLabel: 'July 19, 2026',
    // rev 2 (2026-07-15): CIVIC -> EYE, STOP -> DELIVER for the two-collision
    // rule. EYE is a palindrome that reads body part (but the hiding group is
    // full and none of its four are palindromes); DELIVER reverses to REVILED
    // and hides LIVER (but ARMY/RIBBON/SHINE/HEARTH fill the hiding group and
    // none of them reverse to a word).
    groups: [
      { name: 'Palindromes', words: ['LEVEL', 'KAYAK', 'RADAR', 'EYE'] },
      { name: 'Body part hiding inside', words: ['ARMY', 'RIBBON', 'SHINE', 'HEARTH'] },
      { name: 'A new word backwards', words: ['STRESSED', 'DRAWER', 'STRAW', 'DELIVER'] },
      { name: 'Anagrams of countries', words: ['PAINS', 'CHAIN', 'RAIN', 'PURE'] },
    ],
  },
  {
    num: 9,
    quizId: 'links-7-20-26',
    live: '2026-07-20',
    dateLabel: 'July 20, 2026',
    groups: [
      { name: 'Herbs', words: ['BASIL', 'ROSEMARY', 'THYME', 'DILL'] },
      { name: 'Shades of green', words: ['SAGE', 'OLIVE', 'FOREST', 'MINT'] },
      { name: 'Money, slangily', words: ['CHEDDAR', 'DOUGH', 'BREAD', 'BACON'] },
      { name: 'Cheeses', words: ['BRIE', 'GOUDA', 'FETA', 'EDAM'] },
    ],
  },
  {
    num: 10,
    quizId: 'links-7-21-26',
    live: '2026-07-21',
    dateLabel: 'July 21, 2026',
    groups: [
      { name: 'US presidents', words: ['FORD', 'CARTER', 'GRANT', 'BUSH'] },
      { name: 'Car brands', words: ['DODGE', 'JEEP', 'TESLA', 'HONDA'] },
      { name: 'Avoid', words: ['DUCK', 'SKIRT', 'EVADE', 'PARRY'] },
      { name: 'NATO alphabet', words: ['TANGO', 'VICTOR', 'ROMEO', 'CHARLIE'] },
    ],
    collisions: [
      { word: 'FORD', reads: 'Car brands' },
      { word: 'DODGE', reads: 'Avoid' },
    ],
  },
  {
    num: 11,
    quizId: 'links-7-22-26',
    live: '2026-07-22',
    dateLabel: 'July 22, 2026',
    groups: [
      { name: 'Units of time', words: ['SECOND', 'MINUTE', 'DECADE', 'FORTNIGHT'] },
      { name: 'Tiny', words: ['TEENY', 'WEE', 'MICRO', 'DINKY'] },
      { name: 'Bond films', words: ['GOLDENEYE', 'SKYFALL', 'SPECTRE', 'THUNDERBALL'] },
      { name: '___glass', words: ['SPY', 'WINE', 'STAINED', 'HOUR'] },
    ],
    collisions: [
      { word: 'MINUTE', reads: 'Tiny' },
      { word: 'HOUR', reads: 'Units of time' },
      { word: 'SPY', reads: 'Bond films' },
    ],
  },
  {
    num: 12,
    quizId: 'links-7-23-26',
    live: '2026-07-23',
    dateLabel: 'July 23, 2026',
    // rev 2 (2026-07-15): Deserts -> Ancient Egypt for the two-collision rule.
    // NILE (river) now reads Egypt (Egypt is full — none of its four are
    // rivers) and AMAZON (tech) still reads river (rivers are full). ORACLE
    // gets a free ancient-world tease it can't cash in.
    groups: [
      { name: 'One-name singers', words: ['ADELE', 'DRAKE', 'SHAKIRA', 'BJORK'] },
      { name: 'Ancient Egypt', words: ['SPHINX', 'PYRAMID', 'PHARAOH', 'MUMMY'] },
      { name: 'Tech giants', words: ['AMAZON', 'APPLE', 'META', 'ORACLE'] },
      { name: 'Rivers', words: ['NILE', 'DANUBE', 'RHINE', 'VOLGA'] },
    ],
    collisions: [
      { word: 'AMAZON', reads: 'Rivers' },
      { word: 'NILE', reads: 'Ancient Egypt' },
    ],
  },
  {
    num: 13,
    quizId: 'links-7-24-26',
    live: '2026-07-24',
    dateLabel: 'July 24, 2026',
    groups: [
      { name: 'Dog breeds', words: ['PUG', 'POODLE', 'BEAGLE', 'CORGI'] },
      { name: 'Built big', words: ['HUSKY', 'BURLY', 'BEEFY', 'STOCKY'] },
      { name: 'Underwear', words: ['THONG', 'BIKINI', 'BOXER', 'TRUNKS'] },
      { name: 'Legal filings', words: ['BRIEF', 'TORT', 'APPEAL', 'MOTION'] },
    ],
    collisions: [
      { word: 'HUSKY', reads: 'Dog breeds' },
      { word: 'BOXER', reads: 'Dog breeds' },
      { word: 'BRIEF', reads: 'Underwear' },
    ],
  },
  {
    num: 14,
    quizId: 'links-7-25-26',
    live: '2026-07-25',
    dateLabel: 'July 25, 2026',
    groups: [
      { name: 'Planets', words: ['NEPTUNE', 'SATURN', 'URANUS', 'JUPITER'] },
      { name: 'Candy bars', words: ['MARS', 'TWIX', 'SNICKERS', 'BOUNTY'] },
      { name: 'Roman gods', words: ['VULCAN', 'JANUS', 'CUPID', 'MINERVA'] }, // was MERCURY (also a planet) -> MINERVA: kills the 4-way ambiguity
      { name: 'Famous sculptures', words: ['DAVID', 'PIETA', 'THINKER', 'VENUS'] },
    ],
    collisions: [
      { word: 'NEPTUNE', reads: 'Roman gods' },
      { word: 'SATURN', reads: 'Roman gods' },
      { word: 'JUPITER', reads: 'Roman gods' },
      { word: 'MARS', reads: 'Planets' },
      { word: 'MARS', reads: 'Roman gods' },
      { word: 'VENUS', reads: 'Planets' },
      { word: 'VENUS', reads: 'Roman gods' },
    ],
  },
  {
    num: 15,
    quizId: 'links-7-26-26',
    live: '2026-07-26',
    dateLabel: 'July 26, 2026',
    sunday: true,
    // SUNDAY EDITION: four cross-category collisions instead of the usual two.
    // The uniqueness argument is PINNING, and it is machine-checked: every
    // tempted group is full of words that fit nowhere else, so each collision
    // has to resolve back to its own group.
    //   ROOK  reads chess, but chess is already full (and CASTLE is its rook)
    //   KING  reads chess, but chess is full        -> must be a card
    //   QUEEN reads chess AND reads rock band, and BOTH are full -> card
    groups: [
      { name: 'Rock bands', words: ['KISS', 'RUSH', 'CREAM', 'JOURNEY'] },
      { name: 'Corvids', words: ['RAVEN', 'MAGPIE', 'JACKDAW', 'ROOK'] },
      { name: 'Deck of cards', words: ['ACE', 'JOKER', 'KING', 'QUEEN'] },
      { name: 'Chess pieces', words: ['BISHOP', 'KNIGHT', 'PAWN', 'CASTLE'] },
    ],
    collisions: [
      { word: 'ROOK', reads: 'Chess pieces' },
      { word: 'KING', reads: 'Chess pieces' },
      { word: 'QUEEN', reads: 'Chess pieces' },
      { word: 'QUEEN', reads: 'Rock bands' },
    ],
  },
  {
    num: 16,
    quizId: 'links-7-27-26',
    live: '2026-07-27',
    dateLabel: 'July 27, 2026',
    // collisions: RUBY reads gem (gems full) and CHERRY reads fruit (fruit full),
    // so both stay red. Exactly one valid grouping.
    groups: [
      { name: 'Fruits', words: ['LEMON', 'ORANGE', 'GRAPE', 'KIWI'] },
      { name: 'Shades of red', words: ['SCARLET', 'CRIMSON', 'RUBY', 'CHERRY'] },
      { name: 'Gemstones', words: ['PEARL', 'OPAL', 'SAPPHIRE', 'TOPAZ'] },
      { name: 'Metals', words: ['GOLD', 'SILVER', 'PLATINUM', 'BRONZE'] },
    ],
    collisions: [
      { word: 'CHERRY', reads: 'Fruits' },
      { word: 'RUBY', reads: 'Gemstones' },
    ],
  },
  {
    num: 17,
    quizId: 'links-7-28-26',
    live: '2026-07-28',
    dateLabel: 'July 28, 2026',
    // collisions: SALSA reads dip (dips full), SLIDE & SWING read baseball (full);
    // SEESAW & SANDBOX are playground-only, so they pull SLIDE & SWING in.
    groups: [
      { name: 'Dances', words: ['TANGO', 'SALSA', 'WALTZ', 'FOXTROT'] },
      { name: 'Party dips', words: ['GUACAMOLE', 'HUMMUS', 'QUESO', 'RANCH'] },
      { name: 'Playground fixtures', words: ['SLIDE', 'SEESAW', 'SANDBOX', 'SWING'] },
      { name: 'Baseball moves', words: ['BUNT', 'STEAL', 'PITCH', 'STRIKE'] },
    ],
    collisions: [
      { word: 'SALSA', reads: 'Party dips' },
      { word: 'SLIDE', reads: 'Baseball moves' },
      { word: 'SWING', reads: 'Baseball moves' },
    ],
  },
  {
    num: 18,
    quizId: 'links-7-29-26',
    live: '2026-07-29',
    dateLabel: 'July 29, 2026',
    // collisions resolve to one grouping: LIME & OLIVE read fruit (fruit full),
    // MINT & SAGE read green (herbs need them), PINE reads green (yearn needs it).
    groups: [
      { name: 'Fruits', words: ['MANGO', 'PAPAYA', 'PEACH', 'APRICOT'] },
      { name: 'Shades of green', words: ['OLIVE', 'LIME', 'FOREST', 'JADE'] },
      { name: 'Herbs', words: ['BASIL', 'MINT', 'SAGE', 'DILL'] },
      { name: 'Yearn for', words: ['PINE', 'ACHE', 'LONG', 'CRAVE'] },
    ],
    collisions: [
      { word: 'LIME', reads: 'Fruits' },
      { word: 'OLIVE', reads: 'Fruits' },
      { word: 'MINT', reads: 'Shades of green' },
      { word: 'SAGE', reads: 'Shades of green' },
      { word: 'PINE', reads: 'Shades of green' },
    ],
  },
  {
    num: 19,
    quizId: 'links-7-30-26',
    live: '2026-07-30',
    dateLabel: 'July 30, 2026',
    // collisions: POUND reads weight (weights full), CROWN reads tooth (teeth full),
    // STONE reads "___ Age" (ages full). PESO & RAND anchor currency.
    groups: [
      { name: 'Currencies', words: ['PESO', 'POUND', 'CROWN', 'RAND'] },
      { name: 'Units of weight', words: ['OUNCE', 'GRAM', 'TON', 'STONE'] },
      { name: 'Tooth parts', words: ['ROOT', 'ENAMEL', 'GUM', 'PLAQUE'] },
      { name: '___ Age', words: ['BRONZE', 'IRON', 'ICE', 'GOLDEN'] },
    ],
    collisions: [
      { word: 'POUND', reads: 'Units of weight' },
      { word: 'CROWN', reads: 'Tooth parts' },
    ],
  },
];

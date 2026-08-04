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
// OWNER RULE (2026-08-04): the uniqueness proof only sees the collisions you
// DECLARE, so an incomplete list proves nothing. When two or more words of
// group A read as group B and nothing in B is declared to read back, you are
// asserting that NO member of B could belong to A. State it: list the pair in
// `reverseChecked` as "A -> B". The verifier fails an unacknowledged one-way
// flow. This is the check that #24 needed: three planets were declared to read
// as Roman gods while JUPITER, sitting in the gods group, is itself a planet,
// so the board had five valid groupings and shipped anyway.
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
    reverseChecked: [
      "Planets -> Roman gods",
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
    reverseChecked: [
      "Deck of cards -> Chess pieces",
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
    reverseChecked: [
      "Playground fixtures -> Baseball moves",
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
    reverseChecked: [
      "Shades of green -> Fruits",
      "Herbs -> Shades of green",
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
  {
    num: 20,
    quizId: 'links-7-31-26',
    live: '2026-07-31',
    dateLabel: 'July 31, 2026',
    // collisions: TIDE & BOLD read detergent (detergents full: GAIN/ERA/ALL/CHEER),
    // STRIKE reads bowling (lanes full: SPARE/GUTTER/TURKEY/PIN). One grouping.
    groups: [
      { name: 'Text styles', words: ['ITALIC', 'UNDERLINE', 'STRIKE', 'BOLD'] },
      { name: 'Bowling terms', words: ['SPARE', 'GUTTER', 'TURKEY', 'PIN'] },
      { name: '___ pool', words: ['CAR', 'GENE', 'WHIRL', 'TIDE'] },
      { name: 'Laundry detergents', words: ['GAIN', 'ERA', 'ALL', 'CHEER'] },
    ],
    collisions: [
      { word: 'TIDE', reads: 'Laundry detergents' },
      { word: 'BOLD', reads: 'Laundry detergents' },
      { word: 'STRIKE', reads: 'Bowling terms' },
    ],
  },
  {
    num: 21,
    quizId: 'links-8-1-26',
    live: '2026-08-01',
    dateLabel: 'August 1, 2026',
    // collisions: IRIS reads flower (eyes full), JASMINE reads flower (princesses full),
    // ROSE reads flower (past-tense full). TULIP/DAHLIA/PANSY/PEONY anchor flowers.
    groups: [
      { name: 'Eye parts', words: ['PUPIL', 'RETINA', 'CORNEA', 'IRIS'] },
      { name: 'Disney princesses', words: ['BELLE', 'AURORA', 'MULAN', 'JASMINE'] },
      { name: 'Past-tense verbs', words: ['SANG', 'DREW', 'FLEW', 'ROSE'] },
      { name: 'Flowers', words: ['TULIP', 'DAHLIA', 'PANSY', 'PEONY'] },
    ],
    collisions: [
      { word: 'IRIS', reads: 'Flowers' },
      { word: 'JASMINE', reads: 'Flowers' },
      { word: 'ROSE', reads: 'Flowers' },
    ],
  },
  {
    num: 22,
    quizId: 'links-8-2-26',
    live: '2026-08-02',
    dateLabel: 'August 2, 2026',
    sunday: true,
    // SUNDAY EDITION: four cross-category collisions. Every shade of green also
    // reads as another group, but each tempted group is already full of its own
    // members, so all four resolve back to green. Exactly one valid grouping.
    //   EMERALD, JADE read gemstones (gems full: RUBY/SAPPHIRE/TOPAZ/OPAL)
    //   MINT reads herbs (herbs full: BASIL/PARSLEY/THYME/DILL)
    //   OLIVE reads pizza toppings (toppings full)
    groups: [
      { name: 'Pizza toppings', words: ['PEPPERONI', 'MUSHROOM', 'ONION', 'SAUSAGE'] },
      { name: 'Herbs', words: ['BASIL', 'PARSLEY', 'THYME', 'DILL'] },
      { name: 'Shades of green', words: ['OLIVE', 'JADE', 'EMERALD', 'MINT'] },
      { name: 'Gemstones', words: ['RUBY', 'SAPPHIRE', 'TOPAZ', 'OPAL'] },
    ],
    reverseChecked: [
      "Shades of green -> Gemstones",
    ],
    collisions: [
      { word: 'EMERALD', reads: 'Gemstones' },
      { word: 'JADE', reads: 'Gemstones' },
      { word: 'MINT', reads: 'Herbs' },
      { word: 'OLIVE', reads: 'Pizza toppings' },
    ],
  },
  {
    num: 23,
    quizId: 'links-8-3-26',
    live: '2026-08-03',
    dateLabel: 'August 3, 2026',
    // collisions: PYTHON reads programming languages (languages full), COBRA and
    // VIPER read muscle cars (cars full), so all three resolve back to snakes.
    groups: [
      { name: 'Board games', words: ['CHESS', 'RISK', 'CLUE', 'SORRY'] },
      { name: 'Snakes', words: ['PYTHON', 'COBRA', 'VIPER', 'MAMBA'] },
      { name: 'Programming languages', words: ['RUBY', 'JAVA', 'SWIFT', 'RUST'] },
      { name: 'Muscle cars', words: ['MUSTANG', 'CORVETTE', 'CAMARO', 'CHARGER'] },
    ],
    reverseChecked: [
      "Snakes -> Muscle cars",
    ],
    collisions: [
      { word: 'PYTHON', reads: 'Programming languages' },
      { word: 'COBRA', reads: 'Muscle cars' },
      { word: 'VIPER', reads: 'Muscle cars' },
    ],
  },
  {
    num: 24,
    quizId: 'links-8-4-26',
    live: '2026-08-04',
    dateLabel: 'August 4, 2026',
    // collisions: all four planets also read Roman gods, but the gods group is
    // full of gods that are NOT planets (MINERVA/APOLLO/JUNO/DIANA), so every
    // planet stays put. JUPITER was here and broke that: it is itself a planet,
    // which left the fourth god slot open to any of the five and gave the board
    // five valid groupings. Never seat a planet-named god in this group.
    groups: [
      { name: 'Planets', words: ['MARS', 'VENUS', 'SATURN', 'NEPTUNE'] },
      { name: 'Roman gods', words: ['MINERVA', 'APOLLO', 'JUNO', 'DIANA'] },
      { name: 'Car brands', words: ['HONDA', 'TOYOTA', 'FORD', 'TESLA'] },
      { name: 'Continents', words: ['ASIA', 'AFRICA', 'EUROPE', 'ANTARCTICA'] },
    ],
    reverseChecked: [
      "Planets -> Roman gods",
    ],
    collisions: [
      { word: 'MARS', reads: 'Roman gods' },
      { word: 'VENUS', reads: 'Roman gods' },
      { word: 'SATURN', reads: 'Roman gods' },
      { word: 'NEPTUNE', reads: 'Roman gods' },
      { word: 'SATURN', reads: 'Car brands' },
    ],
  },
  {
    num: 25,
    quizId: 'links-8-5-26',
    live: '2026-08-05',
    dateLabel: 'August 5, 2026',
    // collisions: RUBY & GARNET read gemstones (gems full), PYTHON reads snakes
    // (snakes full), so all resolve back to their home groups.
    groups: [
      { name: 'Shades of red', words: ['CRIMSON', 'SCARLET', 'RUBY', 'GARNET'] },
      { name: 'Gemstones', words: ['EMERALD', 'SAPPHIRE', 'DIAMOND', 'OPAL'] },
      { name: 'Programming languages', words: ['PYTHON', 'JAVA', 'SWIFT', 'RUST'] },
      { name: 'Snakes', words: ['COBRA', 'VIPER', 'MAMBA', 'ADDER'] },
    ],
    reverseChecked: [
      "Shades of red -> Gemstones",
    ],
    collisions: [
      { word: 'RUBY', reads: 'Gemstones' },
      { word: 'GARNET', reads: 'Gemstones' },
      { word: 'PYTHON', reads: 'Snakes' },
    ],
  },
  {
    num: 26,
    quizId: 'links-8-6-26',
    live: '2026-08-06',
    dateLabel: 'August 6, 2026',
    // collisions: ORANGE & LIME read colors (colors full), BASS reads fish
    // (fish full), so each stays in its home group.
    groups: [
      { name: 'Citrus fruits', words: ['LEMON', 'LIME', 'ORANGE', 'TANGERINE'] },
      { name: 'Colors', words: ['VIOLET', 'INDIGO', 'MAGENTA', 'CYAN'] },
      { name: 'Types of guitar', words: ['ACOUSTIC', 'ELECTRIC', 'BASS', 'CLASSICAL'] },
      { name: 'Fish', words: ['TROUT', 'SALMON', 'TUNA', 'COD'] },
    ],
    reverseChecked: [
      "Citrus fruits -> Colors",
    ],
    collisions: [
      { word: 'ORANGE', reads: 'Colors' },
      { word: 'LIME', reads: 'Colors' },
      { word: 'BASS', reads: 'Fish' },
    ],
  },
  {
    num: 27,
    quizId: 'links-8-7-26',
    live: '2026-08-07',
    dateLabel: 'August 7, 2026',
    // collisions: TEMPEST reads weather (Shakespeare needs it, weather full),
    // THUNDER reads NBA (NBA full), so both resolve to their home groups.
    groups: [
      { name: 'Shakespeare plays', words: ['HAMLET', 'MACBETH', 'OTHELLO', 'TEMPEST'] },
      { name: 'Weather phenomena', words: ['STORM', 'THUNDER', 'FOG', 'MIST'] },
      { name: 'NBA teams', words: ['HEAT', 'MAGIC', 'NETS', 'BUCKS'] },
      { name: 'Music genres', words: ['JAZZ', 'BLUES', 'SOUL', 'FUNK'] },
    ],
    collisions: [
      { word: 'TEMPEST', reads: 'Weather phenomena' },
      { word: 'THUNDER', reads: 'NBA teams' },
    ],
  },
  {
    num: 28,
    quizId: 'links-8-8-26',
    live: '2026-08-08',
    dateLabel: 'August 8, 2026',
    // collisions: SLOTH reads sins (sins full), PRIDE & ENVY read emotions
    // (emotions full), so each stays home.
    groups: [
      { name: 'Types of bears', words: ['POLAR', 'GRIZZLY', 'PANDA', 'SLOTH'] },
      { name: 'Seven deadly sins', words: ['GREED', 'WRATH', 'PRIDE', 'ENVY'] },
      { name: 'Ice cream flavors', words: ['VANILLA', 'CHOCOLATE', 'STRAWBERRY', 'PISTACHIO'] },
      { name: 'Emotions', words: ['JOY', 'FEAR', 'ANGER', 'LOVE'] },
    ],
    reverseChecked: [
      "Seven deadly sins -> Emotions",
    ],
    collisions: [
      { word: 'SLOTH', reads: 'Seven deadly sins' },
      { word: 'PRIDE', reads: 'Emotions' },
      { word: 'ENVY', reads: 'Emotions' },
    ],
  },
  {
    num: 29,
    quizId: 'links-8-9-26',
    live: '2026-08-09',
    dateLabel: 'August 9, 2026',
    sunday: true,
    // SUNDAY EDITION: four cross-category collisions. Every shade of pink also
    // reads as another group, but each tempted group is already full of its own
    // members, so all four resolve back to pink. Exactly one valid grouping.
    //   SALMON reads fish (fish full: TUNA/TROUT/BASS/COD)
    //   CORAL reads snakes (snakes full)
    //   BLUSH & ROUGE read makeup (makeup full)
    groups: [
      { name: 'Shades of pink', words: ['SALMON', 'CORAL', 'BLUSH', 'ROUGE'] },
      { name: 'Fish', words: ['TUNA', 'TROUT', 'BASS', 'COD'] },
      { name: 'Snakes', words: ['COBRA', 'VIPER', 'MAMBA', 'ADDER'] },
      { name: 'Makeup products', words: ['MASCARA', 'BRONZER', 'LINER', 'CONCEALER'] },
    ],
    reverseChecked: [
      "Shades of pink -> Makeup products",
    ],
    collisions: [
      { word: 'SALMON', reads: 'Fish' },
      { word: 'CORAL', reads: 'Snakes' },
      { word: 'BLUSH', reads: 'Makeup products' },
      { word: 'ROUGE', reads: 'Makeup products' },
    ],
  },
  {
    num: 30,
    quizId: 'links-8-10-26',
    live: '2026-08-10',
    dateLabel: 'August 10, 2026',
    // collisions: ASPEN reads Colorado ski towns (full), PINE reads candle
    // scents (full), so both stay in trees.
    groups: [
      { name: 'Trees', words: ['OAK', 'MAPLE', 'ASPEN', 'PINE'] },
      { name: 'Colorado ski towns', words: ['VAIL', 'BRECKENRIDGE', 'TELLURIDE', 'KEYSTONE'] },
      { name: 'Candle scents', words: ['LAVENDER', 'VANILLA', 'CITRUS', 'OCEAN'] },
      { name: 'Musical instruments', words: ['PIANO', 'VIOLIN', 'FLUTE', 'DRUMS'] },
    ],
    collisions: [
      { word: 'ASPEN', reads: 'Colorado ski towns' },
      { word: 'PINE', reads: 'Candle scents' },
    ],
  },
  {
    num: 31,
    quizId: 'links-8-11-26',
    live: '2026-08-11',
    dateLabel: 'August 11, 2026',
    groups: [
      { name: "Shades of blue", words: ['COBALT', 'AZURE', 'TEAL', 'NAVY'] },
      { name: "US military branches", words: ['ARMY', 'MARINES', 'AIR FORCE', 'COAST GUARD'] },
      { name: "Poker hands", words: ['FLUSH', 'STRAIGHT', 'PAIR', 'FULL HOUSE'] },
      { name: "Bathroom fixtures", words: ['SINK', 'TUB', 'MIRROR', 'TOILET'] },
    ],
    collisions: [
      { word: 'NAVY', reads: "US military branches" },
      { word: 'FLUSH', reads: "Bathroom fixtures" },
    ],
  },
  {
    num: 32,
    quizId: 'links-8-12-26',
    live: '2026-08-12',
    dateLabel: 'August 12, 2026',
    groups: [
      { name: "Types of bread", words: ['SOURDOUGH', 'PITA', 'NAAN', 'RYE'] },
      { name: "Whiskeys", words: ['BOURBON', 'SCOTCH', 'IRISH', 'JAPANESE'] },
      { name: "Dances", words: ['TANGO', 'WALTZ', 'SALSA', 'RUMBA'] },
      { name: "Condiments", words: ['KETCHUP', 'MUSTARD', 'RELISH', 'CHUTNEY'] },
    ],
    collisions: [
      { word: 'RYE', reads: "Whiskeys" },
      { word: 'SALSA', reads: "Condiments" },
    ],
  },
  {
    num: 33,
    quizId: 'links-8-13-26',
    live: '2026-08-13',
    dateLabel: 'August 13, 2026',
    groups: [
      { name: "Big cats", words: ['JAGUAR', 'PUMA', 'LYNX', 'OCELOT'] },
      { name: "Sportswear brands", words: ['ADIDAS', 'REEBOK', 'ASICS', 'FILA'] },
      { name: "Car makes", words: ['VOLVO', 'SUBARU', 'MAZDA', 'SKODA'] },
      { name: "Constellations", words: ['ORION', 'LYRA', 'DRACO', 'CYGNUS'] },
    ],
    collisions: [
      { word: 'JAGUAR', reads: "Car makes" },
      { word: 'PUMA', reads: "Sportswear brands" },
    ],
  },
  {
    num: 34,
    quizId: 'links-8-14-26',
    live: '2026-08-14',
    dateLabel: 'August 14, 2026',
    groups: [
      { name: "Herbs", words: ['BASIL', 'SAGE', 'ROSEMARY', 'THYME'] },
      { name: "Fictional detectives", words: ['POIROT', 'MARPLE', 'HOLMES', 'COLUMBO'] },
      { name: "Cocktails", words: ['NEGRONI', 'SIDECAR', 'GIMLET', 'SAZERAC'] },
      { name: "Pizza toppings", words: ['PEPPERONI', 'ANCHOVY', 'CAPERS', 'SALAMI'] },
    ],
    collisions: [
      { word: 'BASIL', reads: "Fictional detectives" },
      { word: 'THYME', reads: "Cocktails" },
    ],
  },
  {
    num: 35,
    quizId: 'links-8-15-26',
    live: '2026-08-15',
    dateLabel: 'August 15, 2026',
    groups: [
      // Roman gods must contain NO planet name, or the planet slots float:
      // JUPITER/MARS here left six planet-gods for four planet slots.
      { name: "Planets", words: ['MERCURY', 'VENUS', 'SATURN', 'NEPTUNE'] },
      { name: "Roman gods", words: ['MINERVA', 'BACCHUS', 'VULCAN', 'JANUS'] },
      { name: "Elements", words: ['CARBON', 'ARGON', 'COBALT', 'ZINC'] },
      { name: "Car models", words: ['CORSA', 'PASSAT', 'ASTRA', 'MONDEO'] },
    ],
    reverseChecked: [
      "Planets -> Roman gods",
    ],
    collisions: [
      { word: 'MERCURY', reads: "Roman gods" },
      { word: 'VENUS', reads: "Roman gods" },
      { word: 'SATURN', reads: "Roman gods" },
      { word: 'NEPTUNE', reads: "Roman gods" },
      { word: 'MERCURY', reads: "Elements" },
    ],
  },
  {
    num: 36,
    quizId: 'links-8-16-26',
    live: '2026-08-16',
    dateLabel: 'August 16, 2026',
    sunday: true,
    groups: [
      { name: "Shades of green", words: ['OLIVE', 'JADE', 'FERN', 'SAGE'] },
      { name: "Pizza toppings", words: ['PEPPERONI', 'ANCHOVY', 'CAPERS', 'SALAMI'] },
      // PERIDOT was here and is itself a shade of green, which opened a second
      // grouping against the Shades of green column. AMETHYST is not green.
      { name: "Gemstones", words: ['OPAL', 'GARNET', 'TOPAZ', 'AMETHYST'] },
      { name: "Girls' names", words: ['IRIS', 'RUBY', 'HAZEL', 'DAISY'] },
    ],
    reverseChecked: [
      "Shades of green -> Girls' names",
    ],
    collisions: [
      { word: 'OLIVE', reads: "Pizza toppings" },
      { word: 'JADE', reads: "Gemstones" },
      { word: 'FERN', reads: "Girls' names" },
      { word: 'SAGE', reads: "Girls' names" },
      { word: 'OLIVE', reads: "Girls' names" },
      { word: 'JADE', reads: "Girls' names" },
    ],
  },
  {
    num: 37,
    quizId: 'links-8-17-26',
    live: '2026-08-17',
    dateLabel: 'August 17, 2026',
    groups: [
      { name: "Chess pieces", words: ['BISHOP', 'ROOK', 'PAWN', 'KNIGHT'] },
      { name: "Church roles", words: ['VICAR', 'DEACON', 'CURATE', 'VERGER'] },
      { name: "Crows and kin", words: ['RAVEN', 'MAGPIE', 'JACKDAW', 'CHOUGH'] },
      { name: "Medieval jobs", words: ['COOPER', 'FLETCHER', 'REEVE', 'SMITH'] },
    ],
    collisions: [
      { word: 'BISHOP', reads: "Church roles" },
      { word: 'ROOK', reads: "Crows and kin" },
      { word: 'KNIGHT', reads: "Medieval jobs" },
    ],
  },
  {
    num: 38,
    quizId: 'links-8-18-26',
    live: '2026-08-18',
    dateLabel: 'August 18, 2026',
    groups: [
      { name: "Knots", words: ['BOWLINE', 'HITCH', 'CLOVE', 'REEF'] },
      { name: "Spices", words: ['CUMIN', 'ANISE', 'CARDAMOM', 'TURMERIC'] },
      { name: "Sails and rigging", words: ['JIB', 'BOOM', 'MAST', 'SHROUD'] },
      { name: "Weapons", words: ['MACE', 'HALBERD', 'FLAIL', 'PIKE'] },
    ],
    collisions: [
      { word: 'CLOVE', reads: "Spices" },
      { word: 'REEF', reads: "Sails and rigging" },
    ],
  },
  {
    num: 39,
    quizId: 'links-8-19-26',
    live: '2026-08-19',
    dateLabel: 'August 19, 2026',
    groups: [
      { name: "Pasta shapes", words: ['PENNE', 'FUSILLI', 'RIGATONI', 'ORZO'] },
      { name: "Opera terms", words: ['ARIA', 'TENOR', 'LIBRETTO', 'DIVA'] },
      { name: "Italian cities", words: ['SIENA', 'LUCCA', 'BARI', 'VERONA'] },
      { name: "Cheeses", words: ['PARMESAN', 'PECORINO', 'ASIAGO', 'TALEGGIO'] },
    ],
    collisions: [
      { word: 'ORZO', reads: "Italian cities" },
      { word: 'ASIAGO', reads: "Italian cities" },
    ],
  },
  {
    num: 40,
    quizId: 'links-8-20-26',
    live: '2026-08-20',
    dateLabel: 'August 20, 2026',
    groups: [
      { name: "Rivers of Europe", words: ['SEINE', 'LOIRE', 'ELBE', 'TAGUS'] },
      { name: "French words in English", words: ['CAFE', 'GENRE', 'MIRAGE', 'DEBUT'] },
      { name: "Bridge parts", words: ['SPAN', 'PIER', 'ARCH', 'PARAPET'] },
      { name: "Ship parts", words: ['HULL', 'KEEL', 'DECK', 'BOW'] },
    ],
    collisions: [
      { word: 'PIER', reads: "Ship parts" },
      { word: 'SEINE', reads: "French words in English" },
    ],
  },
  {
    num: 41,
    quizId: 'links-8-21-26',
    live: '2026-08-21',
    dateLabel: 'August 21, 2026',
    groups: [
      { name: "Card suits", words: ['HEARTS', 'CLUBS', 'SPADES', 'DIAMONDS'] },
      { name: "Garden tools", words: ['TROWEL', 'RAKE', 'HOE', 'DIBBER'] },
      { name: "London football clubs", words: ['ARSENAL', 'FULHAM', 'BRENTFORD', 'MILLWALL'] },
      { name: "Baseball verbs", words: ['STEAL', 'WALK', 'BUNT', 'SLIDE'] },
    ],
    collisions: [
      { word: 'SPADES', reads: "Garden tools" },
      { word: 'CLUBS', reads: "London football clubs" },
    ],
  },
  {
    num: 42,
    quizId: 'links-8-22-26',
    live: '2026-08-22',
    dateLabel: 'August 22, 2026',
    groups: [
      { name: "Coffee drinks", words: ['LATTE', 'MOCHA', 'CORTADO', 'RISTRETTO'] },
      { name: "Boxing punches", words: ['JAB', 'HOOK', 'UPPERCUT', 'CROSS'] },
      { name: "Sewing words", words: ['HEM', 'SEAM', 'BASTE', 'PLEAT'] },
      { name: "Darts terms", words: ['OCHE', 'BULL', 'TREBLE', 'LEG'] },
    ],
    reverseChecked: [
      "Boxing punches -> Sewing words",
    ],
    collisions: [
      { word: 'HOOK', reads: "Sewing words" },
      { word: 'CROSS', reads: "Sewing words" },
    ],
  },
  {
    num: 43,
    quizId: 'links-8-23-26',
    live: '2026-08-23',
    dateLabel: 'August 23, 2026',
    sunday: true,
    groups: [
      { name: "Types of cloud", words: ['CIRRUS', 'STRATUS', 'NIMBUS', 'CUMULUS'] },
      { name: "Halo words", words: ['AURA', 'CORONA', 'GLORY', 'RADIANCE'] },
      { name: "Beers", words: ['STELLA', 'PERONI', 'TIGER', 'ASAHI'] },
      { name: "Wild cats", words: ['LEOPARD', 'CARACAL', 'SERVAL', 'MARGAY'] },
    ],
    reverseChecked: [
      "Types of cloud -> Halo words",
    ],
    collisions: [
      { word: 'NIMBUS', reads: "Halo words" },
      { word: 'CORONA', reads: "Beers" },
      { word: 'TIGER', reads: "Wild cats" },
      { word: 'CIRRUS', reads: "Halo words" },
    ],
  },
  {
    num: 44,
    quizId: 'links-8-24-26',
    live: '2026-08-24',
    dateLabel: 'August 24, 2026',
    groups: [
      { name: "Musical keys", words: ['MINOR', 'MAJOR', 'SHARP', 'FLAT'] },
      { name: "Army ranks", words: ['COLONEL', 'CORPORAL', 'ENSIGN', 'BRIGADIER'] },
      { name: "Apartment words", words: ['STUDIO', 'LOFT', 'DUPLEX', 'MAISONETTE'] },
      { name: "Clever words", words: ['ASTUTE', 'KEEN', 'CANNY', 'SHREWD'] },
    ],
    collisions: [
      { word: 'MAJOR', reads: "Army ranks" },
      { word: 'FLAT', reads: "Apartment words" },
      { word: 'SHARP', reads: "Clever words" },
    ],
  },
  {
    num: 45,
    quizId: 'links-8-25-26',
    live: '2026-08-25',
    dateLabel: 'August 25, 2026',
    groups: [
      { name: "Poems", words: ['SONNET', 'HAIKU', 'ODE', 'ELEGY'] },
      { name: "Greek letters", words: ['DELTA', 'SIGMA', 'OMEGA', 'IOTA'] },
      { name: "River features", words: ['OXBOW', 'MEANDER', 'ESTUARY', 'SPIT'] },
      { name: "Watch brands", words: ['ROLEX', 'TISSOT', 'SEIKO', 'BREITLING'] },
    ],
    collisions: [
      { word: 'DELTA', reads: "River features" },
      { word: 'OMEGA', reads: "Watch brands" },
    ],
  },
  {
    num: 46,
    quizId: 'links-8-26-26',
    live: '2026-08-26',
    dateLabel: 'August 26, 2026',
    groups: [
      { name: "Fabrics", words: ['DENIM', 'TWEED', 'LINEN', 'SATIN'] },
      { name: "Irish counties", words: ['CLARE', 'KERRY', 'MAYO', 'SLIGO'] },
      { name: "Sandwich fillings", words: ['TUNA', 'HAM', 'PICKLE', 'CORNED BEEF'] },
      { name: "Girls' names", words: ['IRIS', 'RUBY', 'HAZEL', 'DAISY'] },
    ],
    reverseChecked: [
      "Irish counties -> Girls' names",
    ],
    collisions: [
      { word: 'MAYO', reads: "Sandwich fillings" },
      { word: 'CLARE', reads: "Girls' names" },
      { word: 'KERRY', reads: "Girls' names" },
    ],
  },
  {
    num: 47,
    quizId: 'links-8-27-26',
    live: '2026-08-27',
    dateLabel: 'August 27, 2026',
    groups: [
      { name: "Board games", words: ['RISK', 'CLUE', 'SORRY', 'TROUBLE'] },
      { name: "Words before WORD", words: ['BUZZ', 'CROSS', 'PASS', 'SWEAR'] },
      { name: "Insurance terms", words: ['PREMIUM', 'CLAIM', 'EXCESS', 'DEDUCTIBLE'] },
      { name: "Detective needs", words: ['MOTIVE', 'ALIBI', 'WITNESS', 'SUSPECT'] },
    ],
    collisions: [
      { word: 'RISK', reads: "Insurance terms" },
      { word: 'CLUE', reads: "Detective needs" },
    ],
  },
  {
    num: 48,
    quizId: 'links-8-28-26',
    live: '2026-08-28',
    dateLabel: 'August 28, 2026',
    groups: [
      { name: "Types of pepper", words: ['CAYENNE', 'PAPRIKA', 'CHIPOTLE', 'HABANERO'] },
      { name: "Wyoming towns", words: ['CHEYENNE', 'LARAMIE', 'CODY', 'SHERIDAN'] },
      { name: "Friendly ghosts", words: ['CASPER', 'SLIMER', 'BOO', 'BLINKY'] },
      { name: "US presidents", words: ['JACKSON', 'TAFT', 'POLK', 'HAYES'] },
    ],
    collisions: [
      { word: 'CASPER', reads: "Wyoming towns" },
      { word: 'JACKSON', reads: "Wyoming towns" },
    ],
  },
  {
    num: 49,
    quizId: 'links-8-29-26',
    live: '2026-08-29',
    dateLabel: 'August 29, 2026',
    groups: [
      { name: "Wind instruments", words: ['OBOE', 'CLARINET', 'BASSOON', 'PICCOLO'] },
      { name: "Ice cream flavours", words: ['VANILLA', 'RUM RAISIN', 'STRACCIATELLA', 'NEAPOLITAN'] },
      { name: "Nuts", words: ['PECAN', 'PISTACHIO', 'CASHEW', 'MACADAMIA'] },
      { name: "Italian greetings", words: ['CIAO', 'PRONTO', 'SALVE', 'ARRIVEDERCI'] },
    ],
    collisions: [
      { word: 'PISTACHIO', reads: "Ice cream flavours" },
      { word: 'PICCOLO', reads: "Italian greetings" },
    ],
  },
  {
    num: 50,
    quizId: 'links-8-30-26',
    live: '2026-08-30',
    dateLabel: 'August 30, 2026',
    sunday: true,
    groups: [
      { name: "Trees", words: ['ASH', 'LIME', 'PLANE', 'WILLOW'] },
      { name: "Citrus fruit", words: ['YUZU', 'POMELO', 'CITRON', 'BERGAMOT'] },
      { name: "Aircraft", words: ['GLIDER', 'BIPLANE', 'AIRSHIP', 'SEAPLANE'] },
      // HAZEL and HOLLY were here and are both trees, which let the Trees
      // column take any two of ASH/WILLOW/HAZEL/HOLLY: six valid groupings.
      { name: "Girls' names", words: ['IRIS', 'DAISY', 'POPPY', 'PEARL'] },
    ],
    reverseChecked: [
      "Trees -> Girls' names",
    ],
    collisions: [
      { word: 'LIME', reads: "Citrus fruit" },
      { word: 'PLANE', reads: "Aircraft" },
      { word: 'WILLOW', reads: "Girls' names" },
      { word: 'ASH', reads: "Girls' names" },
    ],
  },
  {
    num: 51,
    quizId: 'links-8-31-26',
    live: '2026-08-31',
    dateLabel: 'August 31, 2026',
    groups: [
      { name: "Deserts", words: ['GOBI', 'SAHARA', 'MOJAVE', 'ATACAMA'] },
      { name: "Nissan models", words: ['MICRA', 'QASHQAI', 'JUKE', 'LEAF'] },
      { name: "Tea types", words: ['OOLONG', 'ASSAM', 'MATCHA', 'ROOIBOS'] },
      { name: "Tree parts", words: ['BARK', 'ROOT', 'CANOPY', 'SAPWOOD'] },
    ],
    collisions: [
      { word: 'LEAF', reads: "Tree parts" },
      { word: 'ASSAM', reads: "Deserts" },
    ],
  },
  {
    num: 52,
    quizId: 'links-9-1-26',
    live: '2026-09-01',
    dateLabel: 'September 1, 2026',
    groups: [
      { name: "Types of bear", words: ['GRIZZLY', 'SLOTH', 'SUN', 'SPECTACLED'] },
      { name: "Slow movers", words: ['GLACIER', 'SNAIL', 'TORTOISE', 'SLUG'] },
      { name: "Deadly sins", words: ['GREED', 'ENVY', 'WRATH', 'PRIDE'] },
      { name: "Solar words", words: ['FLARE', 'ECLIPSE', 'CORONA', 'SUNSPOT'] },
    ],
    collisions: [
      { word: 'SLOTH', reads: "Slow movers" },
      { word: 'SLOTH', reads: "Deadly sins" },
      { word: 'SUN', reads: "Solar words" },
    ],
  },
  {
    num: 53,
    quizId: 'links-9-2-26',
    live: '2026-09-02',
    dateLabel: 'September 2, 2026',
    groups: [
      { name: "Golf scores", words: ['BIRDIE', 'BOGEY', 'EAGLE', 'ALBATROSS'] },
      { name: "Seabirds", words: ['GANNET', 'PETREL', 'SKUA', 'FULMAR'] },
      { name: "Basketball verbs", words: ['DUNK', 'ASSIST', 'REBOUND', 'BLOCK'] },
      { name: "Cinema words", words: ['SCREEN', 'USHER', 'TRAILER', 'MATINEE'] },
    ],
    reverseChecked: [
      "Golf scores -> Seabirds",
    ],
    collisions: [
      { word: 'ALBATROSS', reads: "Seabirds" },
      { word: 'EAGLE', reads: "Seabirds" },
    ],
  },
  {
    num: 54,
    quizId: 'links-9-3-26',
    live: '2026-09-03',
    dateLabel: 'September 3, 2026',
    groups: [
      { name: "Snakes", words: ['VIPER', 'MAMBA', 'ADDER', 'KRAIT'] },
      { name: "Dodge models", words: ['CHARGER', 'RAM', 'DART', 'DURANGO'] },
      { name: "Maths verbs", words: ['ADD', 'DIVIDE', 'SUM', 'FACTOR'] },
      { name: "Phone accessories", words: ['CASE', 'DOCK', 'LANYARD', 'POWERBANK'] },
    ],
    collisions: [
      { word: 'VIPER', reads: "Dodge models" },
      { word: 'CHARGER', reads: "Phone accessories" },
    ],
  },
  {
    num: 55,
    quizId: 'links-9-4-26',
    live: '2026-09-04',
    dateLabel: 'September 4, 2026',
    groups: [
      { name: "Weather fronts", words: ['WARM', 'COLD', 'STATIONARY', 'OCCLUDED'] },
      { name: "Types of war", words: ['CIVIL', 'TRADE', 'PROXY', 'GUERRILLA'] },
      { name: "Polite words", words: ['COURTEOUS', 'GRACIOUS', 'TACTFUL', 'DEFERENTIAL'] },
      { name: "Calls at sea", words: ['MAYDAY', 'AHOY', 'AVAST', 'BELAY'] },
    ],
    collisions: [
      { word: 'COLD', reads: "Types of war" },
      { word: 'CIVIL', reads: "Polite words" },
    ],
  },
  {
    num: 56,
    quizId: 'links-9-5-26',
    live: '2026-09-05',
    dateLabel: 'September 5, 2026',
    groups: [
      { name: "Egyptian gods", words: ['ISIS', 'OSIRIS', 'ANUBIS', 'HORUS'] },
      { name: "Hair styles", words: ['BOB', 'PIXIE', 'PERM', 'SHAG'] },
      { name: "Carpet types", words: ['PILE', 'BERBER', 'SISAL', 'AXMINSTER'] },
      { name: "Small fairies", words: ['SPRITE', 'ELF', 'IMP', 'BROWNIE'] },
    ],
    reverseChecked: [
      "Hair styles -> Small fairies",
    ],
    collisions: [
      { word: 'SHAG', reads: "Carpet types" },
      { word: 'PIXIE', reads: "Small fairies" },
      { word: 'BOB', reads: "Small fairies" },
    ],
  },
  {
    num: 57,
    quizId: 'links-9-6-26',
    live: '2026-09-06',
    dateLabel: 'September 6, 2026',
    sunday: true,
    groups: [
      { name: "Mountain ranges", words: ['ANDES', 'ATLAS', 'URALS', 'ROCKIES'] },
      { name: "Reference books", words: ['MEMOIR', 'THESAURUS', 'ALMANAC', 'GAZETTEER'] },
      { name: "Greek titans", words: ['CRONUS', 'RHEA', 'THEIA', 'HYPERION'] },
      // DIONE was here and is also a Titaness, which opened a third titan
      // candidate and gave the board three groupings. PANDORA is not a titan.
      { name: "Moons of Saturn", words: ['TITAN', 'PANDORA', 'MIMAS', 'ENCELADUS'] },
    ],
    reverseChecked: [
      "Greek titans -> Moons of Saturn",
    ],
    collisions: [
      { word: 'ATLAS', reads: "Reference books" },
      { word: 'ATLAS', reads: "Greek titans" },
      { word: 'ATLAS', reads: "Moons of Saturn" },
      { word: 'RHEA', reads: "Moons of Saturn" },
      { word: 'HYPERION', reads: "Moons of Saturn" },
    ],
  },
  {
    num: 58,
    quizId: 'links-9-7-26',
    live: '2026-09-07',
    dateLabel: 'September 7, 2026',
    groups: [
      { name: "Circus acts", words: ['TRAPEZE', 'JUGGLER', 'CLOWN', 'TIGHTROPE'] },
      { name: "Fish", words: ['BASS', 'SOLE', 'BREAM', 'DACE'] },
      { name: "Shoe parts", words: ['HEEL', 'TONGUE', 'LACE', 'INSOLE'] },
      { name: "Amp controls", words: ['TREBLE', 'GAIN', 'REVERB', 'VOLUME'] },
    ],
    collisions: [
      { word: 'SOLE', reads: "Shoe parts" },
      { word: 'BASS', reads: "Amp controls" },
    ],
  },
  {
    num: 59,
    quizId: 'links-9-8-26',
    live: '2026-09-08',
    dateLabel: 'September 8, 2026',
    groups: [
      { name: "Sherlock stories", words: ['SCANDAL', 'SPECKLED BAND', 'SILVER BLAZE', 'FINAL PROBLEM'] },
      { name: "Chess openings", words: ['SICILIAN', 'CARO-KANN', 'ENGLISH', 'BIRD'] },
      { name: "Birds", words: ['BITTERN', 'SHRIKE', 'WHEATEAR', 'GOLDCREST'] },
      { name: "Nationalities", words: ['DANISH', 'SWEDISH', 'POLISH', 'SPANISH'] },
    ],
    collisions: [
      { word: 'BIRD', reads: "Birds" },
      { word: 'ENGLISH', reads: "Nationalities" },
    ],
  },
  {
    num: 60,
    quizId: 'links-9-9-26',
    live: '2026-09-09',
    dateLabel: 'September 9, 2026',
    groups: [
      { name: "World currencies", words: ['PESO', 'DINAR', 'RAND', 'FORINT'] },
      { name: "South African words", words: ['BILTONG', 'VELDT', 'BRAAI', 'BAKKIE'] },
      { name: "Rugby nicknames", words: ['SPRINGBOK', 'WALLABY', 'ALL BLACK', 'PUMA'] },
      { name: "Tropical fruit", words: ['GUAVA', 'LYCHEE', 'PAPAYA', 'KIWI'] },
    ],
    collisions: [
      { word: 'RAND', reads: "South African words" },
      { word: 'KIWI', reads: "Rugby nicknames" },
    ],
  },
  {
    num: 61,
    quizId: 'links-9-10-26',
    live: '2026-09-10',
    dateLabel: 'September 10, 2026',
    groups: [
      { name: "Sausages", words: ['CHORIZO', 'BRATWURST', 'ANDOUILLE', 'MERGUEZ'] },
      { name: "Spanish loanwords", words: ['SIESTA', 'FIESTA', 'PLAZA', 'PATIO'] },
      { name: "Dog breeds", words: ['BASENJI', 'SALUKI', 'VIZSLA', 'BORZOI'] },
      { name: "Vodka brands", words: ['SMIRNOFF', 'BELUGA', 'KETEL', 'GREY GOOSE'] },
    ],
    collisions: [
      { word: 'CHORIZO', reads: "Spanish loanwords" },
      { word: 'BELUGA', reads: "Dog breeds" },
    ],
  },
  {
    num: 62,
    quizId: 'links-9-11-26',
    live: '2026-09-11',
    dateLabel: 'September 11, 2026',
    groups: [
      { name: "Sushi terms", words: ['NIGIRI', 'MAKI', 'SASHIMI', 'UNAGI'] },
      { name: "Martial arts", words: ['AIKIDO', 'JUDO', 'KENDO', 'SUMO'] },
      { name: "Japanese cities", words: ['OSAKA', 'KOBE', 'SENDAI', 'NARA'] },
      { name: "Beef cuts", words: ['SIRLOIN', 'BRISKET', 'FLANK', 'RUMP'] },
    ],
    collisions: [
      { word: 'KOBE', reads: "Beef cuts" },
      { word: 'SUMO', reads: "Japanese cities" },
    ],
  },
  {
    num: 63,
    quizId: 'links-9-12-26',
    live: '2026-09-12',
    dateLabel: 'September 12, 2026',
    groups: [
      { name: "Volcanoes", words: ['ETNA', 'FUJI', 'KRAKATOA', 'HEKLA'] },
      { name: "Camera brands", words: ['NIKON', 'LEICA', 'PENTAX', 'CANON'] },
      { name: "Icelandic words", words: ['GEYSIR', 'SKYR', 'SAGA', 'FJORD'] },
      { name: "Photography words", words: ['APERTURE', 'SHUTTER', 'BOKEH', 'EXPOSURE'] },
    ],
    collisions: [
      { word: 'FUJI', reads: "Camera brands" },
      { word: 'HEKLA', reads: "Icelandic words" },
      { word: 'CANON', reads: "Photography words" },
    ],
  },
  {
    num: 64,
    quizId: 'links-9-13-26',
    live: '2026-09-13',
    dateLabel: 'September 13, 2026',
    sunday: true,
    groups: [
      { name: "Cricket fielding spots", words: ['SLIP', 'GULLY', 'POINT', 'COVER'] },
      { name: "Book jacket parts", words: ['BLURB', 'SPINE', 'FLAP', 'ENDPAPER'] },
      { name: "Small valleys", words: ['RAVINE', 'GLEN', 'COOMBE', 'DELL'] },
      { name: "Body parts", words: ['SHIN', 'LOBE', 'SHOULDER', 'TEMPLE'] },
    ],
    reverseChecked: [
      "Cricket fielding spots -> Small valleys",
    ],
    collisions: [
      { word: 'COVER', reads: "Book jacket parts" },
      { word: 'GULLY', reads: "Small valleys" },
      { word: 'SPINE', reads: "Body parts" },
      { word: 'POINT', reads: "Small valleys" },
    ],
  },
  {
    num: 65,
    quizId: 'links-9-14-26',
    live: '2026-09-14',
    dateLabel: 'September 14, 2026',
    groups: [
      { name: "Poisonous plants", words: ['HEMLOCK', 'NIGHTSHADE', 'FOXGLOVE', 'OLEANDER'] },
      { name: "Conifers", words: ['LARCH', 'YEW', 'SPRUCE', 'CEDAR'] },
      { name: "Archery words", words: ['QUIVER', 'FLETCH', 'NOCK', 'BRACER'] },
      { name: "Shivering words", words: ['TREMBLE', 'SHUDDER', 'QUAKE', 'SHIVER'] },
    ],
    collisions: [
      { word: 'HEMLOCK', reads: "Conifers" },
      { word: 'QUIVER', reads: "Shivering words" },
      { word: 'YEW', reads: "Archery words" },
    ],
  },
  {
    num: 66,
    quizId: 'links-9-15-26',
    live: '2026-09-15',
    dateLabel: 'September 15, 2026',
    groups: [
      { name: "Types of tide", words: ['SPRING', 'NEAP', 'EBB', 'FLOOD'] },
      { name: "Seasons", words: ['SUMMER', 'AUTUMN', 'WINTER', 'MONSOON'] },
      { name: "Mattress parts", words: ['FOAM', 'TOPPER', 'SLAT', 'VALANCE'] },
      { name: "Disasters", words: ['FAMINE', 'DROUGHT', 'PLAGUE', 'WILDFIRE'] },
    ],
    reverseChecked: [
      "Types of tide -> Disasters",
    ],
    collisions: [
      { word: 'SPRING', reads: "Seasons" },
      { word: 'SPRING', reads: "Mattress parts" },
      { word: 'FLOOD', reads: "Disasters" },
      { word: 'EBB', reads: "Disasters" },
    ],
  },
  {
    num: 67,
    quizId: 'links-9-16-26',
    live: '2026-09-16',
    dateLabel: 'September 16, 2026',
    groups: [
      { name: "Wine faults", words: ['CORKED', 'OXIDISED', 'VOLATILE', 'MUSTY'] },
      { name: "Chemistry words", words: ['SOLUBLE', 'INERT', 'CATALYST', 'ISOTOPE'] },
      { name: "Bottle parts", words: ['CORK', 'NECK', 'PUNT', 'LABEL'] },
      { name: "Rugby kicks", words: ['CONVERSION', 'DROP', 'GRUBBER', 'GARRYOWEN'] },
    ],
    collisions: [
      { word: 'VOLATILE', reads: "Chemistry words" },
      { word: 'PUNT', reads: "Rugby kicks" },
    ],
  },
  {
    num: 68,
    quizId: 'links-9-17-26',
    live: '2026-09-17',
    dateLabel: 'September 17, 2026',
    groups: [
      { name: "Bee castes", words: ['DRONE', 'WORKER', 'QUEEN', 'NURSE'] },
      { name: "Aircraft types", words: ['GLIDER', 'BIPLANE', 'AIRSHIP', 'SEAPLANE'] },
      { name: "Music markings", words: ['TEMPO', 'REST', 'CODA', 'LEGATO'] },
      { name: "Chess endgame words", words: ['STALEMATE', 'PROMOTION', 'ZUGZWANG', 'OPPOSITION'] },
    ],
    collisions: [
      { word: 'DRONE', reads: "Aircraft types" },
      { word: 'QUEEN', reads: "Chess endgame words" },
      { word: 'DRONE', reads: "Music markings" },
    ],
  },
  {
    num: 69,
    quizId: 'links-9-18-26',
    live: '2026-09-18',
    dateLabel: 'September 18, 2026',
    groups: [
      { name: "Pastry types", words: ['CHOUX', 'FILO', 'PUFF', 'SHORTCRUST'] },
      { name: "Smoking words", words: ['DRAG', 'ASH', 'EMBER', 'STUB'] },
      { name: "Broadleaf trees", words: ['ELM', 'LIME', 'PLANE', 'BEECH'] },
      { name: "Citrus fruit", words: ['YUZU', 'POMELO', 'CITRON', 'BERGAMOT'] },
    ],
    collisions: [
      { word: 'PUFF', reads: "Smoking words" },
      { word: 'LIME', reads: "Citrus fruit" },
      { word: 'PLANE', reads: "Pastry types" },
    ],
  },
  {
    num: 70,
    quizId: 'links-9-19-26',
    live: '2026-09-19',
    dateLabel: 'September 19, 2026',
    groups: [
      { name: "Chicken dishes", words: ['KIEV', 'TIKKA', 'PICCATA', 'SATAY'] },
      { name: "Capital cities", words: ['LIMA', 'OSLO', 'DAKAR', 'SOFIA'] },
      { name: "Bank terms", words: ['CREDIT', 'DEBIT', 'LEDGER', 'OVERDRAFT'] },
      { name: "Film credit roles", words: ['GAFFER', 'BEST BOY', 'GRIP', 'FOLEY'] },
    ],
    collisions: [
      { word: 'KIEV', reads: "Capital cities" },
      { word: 'CREDIT', reads: "Film credit roles" },
    ],
  },
  {
    num: 71,
    quizId: 'links-9-20-26',
    live: '2026-09-20',
    dateLabel: 'September 20, 2026',
    sunday: true,
    groups: [
      { name: "Card suits", words: ['HEARTS', 'CLUBS', 'SPADES', 'DIAMONDS'] },
      { name: "Body organs", words: ['LIVER', 'KIDNEY', 'LUNG', 'SPLEEN'] },
      { name: "Garden tools", words: ['TROWEL', 'RAKE', 'HOE', 'DIBBER'] },
      { name: "Gemstones", words: ['OPAL', 'GARNET', 'TOPAZ', 'PERIDOT'] },
    ],
    reverseChecked: [
      "Card suits -> Gemstones",
    ],
    collisions: [
      { word: 'HEARTS', reads: "Body organs" },
      { word: 'SPADES', reads: "Garden tools" },
      { word: 'DIAMONDS', reads: "Gemstones" },
      { word: 'HEARTS', reads: "Gemstones" },
    ],
  },
  {
    num: 72,
    quizId: 'links-9-21-26',
    live: '2026-09-21',
    dateLabel: 'September 21, 2026',
    groups: [
      { name: "Ways to walk", words: ['AMBLE', 'SAUNTER', 'TRUDGE', 'STROLL'] },
      { name: "Open golf courses", words: ['TROON', 'MUIRFIELD', 'BIRKDALE', 'CARNOUSTIE'] },
      { name: "Lunch orders", words: ['SANDWICH', 'SOUP', 'WRAP', 'SALAD'] },
      { name: "Wrestling moves", words: ['SUPLEX', 'PIN', 'HEADLOCK', 'BODYSLAM'] },
    ],
    collisions: [
      { word: 'SANDWICH', reads: "Open golf courses" },
      { word: 'WRAP', reads: "Wrestling moves" },
    ],
  },
  {
    num: 73,
    quizId: 'links-9-22-26',
    live: '2026-09-22',
    dateLabel: 'September 22, 2026',
    groups: [
      { name: "Rain words", words: ['DRIZZLE', 'DOWNPOUR', 'SHOWER', 'SQUALL'] },
      { name: "Bathroom fittings", words: ['BASIN', 'TILE', 'GROUT', 'CISTERN'] },
      { name: "Party words", words: ['TOAST', 'FAVOUR', 'PINATA', 'STREAMER'] },
      { name: "Breakfast foods", words: ['PORRIDGE', 'KIPPER', 'CRUMPET', 'KEDGEREE'] },
    ],
    collisions: [
      { word: 'SHOWER', reads: "Bathroom fittings" },
      { word: 'SHOWER', reads: "Party words" },
      { word: 'TOAST', reads: "Breakfast foods" },
      { word: 'DRIZZLE', reads: "Breakfast foods" },
    ],
  },
  {
    num: 74,
    quizId: 'links-9-23-26',
    live: '2026-09-23',
    dateLabel: 'September 23, 2026',
    groups: [
      { name: "Fencing terms", words: ['FOIL', 'PARRY', 'LUNGE', 'RIPOSTE'] },
      { name: "Kitchen wraps", words: ['CLINGFILM', 'PARCHMENT', 'GREASEPROOF', 'BAKING PAPER'] },
      { name: "Gym moves", words: ['SQUAT', 'PLANK', 'BURPEE', 'CRUNCH'] },
      { name: "Sheet materials", words: ['PLYWOOD', 'VENEER', 'MDF', 'CHIPBOARD'] },
    ],
    collisions: [
      { word: 'FOIL', reads: "Kitchen wraps" },
      { word: 'PLANK', reads: "Sheet materials" },
      { word: 'LUNGE', reads: "Gym moves" },
    ],
  },
  {
    num: 75,
    quizId: 'links-9-24-26',
    live: '2026-09-24',
    dateLabel: 'September 24, 2026',
    groups: [
      { name: "Types of pen", words: ['BIRO', 'QUILL', 'FOUNTAIN', 'MARKER'] },
      { name: "Hedgehog and kin", words: ['SPINE', 'BRISTLE', 'BARB', 'PRICKLE'] },
      { name: "Town square features", words: ['PLAZA', 'PIAZZA', 'BANDSTAND', 'BENCH'] },
      { name: "Graveyard words", words: ['EPITAPH', 'PLOT', 'URN', 'HEADSTONE'] },
    ],
    collisions: [
      { word: 'QUILL', reads: "Hedgehog and kin" },
      { word: 'FOUNTAIN', reads: "Town square features" },
      { word: 'MARKER', reads: "Graveyard words" },
    ],
  },
  {
    num: 76,
    quizId: 'links-9-25-26',
    live: '2026-09-25',
    dateLabel: 'September 25, 2026',
    groups: [
      { name: "Pub games", words: ['DARTS', 'SKITTLES', 'DOMINOES', 'SHOVE HAPENNY'] },
      { name: "Sweets", words: ['HUMBUG', 'GOBSTOPPER', 'LIQUORICE', 'SHERBET'] },
      { name: "Swimming words", words: ['LANE', 'LENGTH', 'DIVE', 'TUMBLE TURN'] },
      { name: "Betting words", words: ['ODDS', 'STAKE', 'ACCA', 'PLACEPOT'] },
    ],
    collisions: [
      { word: 'SKITTLES', reads: "Sweets" },
      { word: 'DARTS', reads: "Betting words" },
    ],
  },
  {
    num: 77,
    quizId: 'links-9-26-26',
    live: '2026-09-26',
    dateLabel: 'September 26, 2026',
    groups: [
      { name: "Latin phrases", words: ['ERGO', 'IPSO FACTO', 'AD HOC', 'QUID PRO QUO'] },
      { name: "Money slang", words: ['DOSH', 'WONGA', 'QUID', 'READIES'] },
      { name: "Orchestra sections", words: ['BRASS', 'STRINGS', 'WOODWIND', 'PERCUSSION'] },
      { name: "Cheek words", words: ['GALL', 'NERVE', 'AUDACITY', 'TEMERITY'] },
    ],
    collisions: [
      { word: 'QUID', reads: "Latin phrases" },
      { word: 'BRASS', reads: "Cheek words" },
      { word: 'BRASS', reads: "Money slang" },
    ],
  },
  {
    num: 78,
    quizId: 'links-9-27-26',
    live: '2026-09-27',
    dateLabel: 'September 27, 2026',
    sunday: true,
    groups: [
      { name: "Thames bridges", words: ['TOWER', 'ALBERT', 'BATTERSEA', 'SOUTHWARK'] },
      { name: "Castle parts", words: ['KEEP', 'MOAT', 'BAILEY', 'PORTCULLIS'] },
      { name: "Power stations", words: ['DIDCOT', 'DRAX', 'SIZEWELL', 'RATCLIFFE'] },
      { name: "Prince consorts", words: ['PHILIP', 'FERDINAND', 'CLAUS', 'HENDRIK'] },
    ],
    reverseChecked: [
      "Thames bridges -> Castle parts",
    ],
    collisions: [
      { word: 'TOWER', reads: "Castle parts" },
      { word: 'BATTERSEA', reads: "Power stations" },
      { word: 'ALBERT', reads: "Prince consorts" },
      { word: 'SOUTHWARK', reads: "Castle parts" },
    ],
  },
  {
    num: 79,
    quizId: 'links-9-28-26',
    live: '2026-09-28',
    dateLabel: 'September 28, 2026',
    groups: [
      { name: "Potato dishes", words: ['MASH', 'ROAST', 'CHIP', 'DAUPHINOISE'] },
      { name: "Brewing words", words: ['WORT', 'SPARGE', 'HOPS', 'MALT'] },
      { name: "Startup words", words: ['PIVOT', 'UNICORN', 'RUNWAY', 'BURN RATE'] },
      { name: "Cricket deliveries", words: ['BOUNCER', 'YORKER', 'GOOGLY', 'SEAMER'] },
    ],
    collisions: [
      { word: 'MASH', reads: "Brewing words" },
      { word: 'CHIP', reads: "Startup words" },
    ],
  },
  {
    num: 80,
    quizId: 'links-9-29-26',
    live: '2026-09-29',
    dateLabel: 'September 29, 2026',
    groups: [
      { name: "Roof parts", words: ['EAVES', 'RIDGE', 'GABLE', 'SOFFIT'] },
      { name: "Mountain features", words: ['SCREE', 'ARETE', 'CIRQUE', 'COL'] },
      { name: "Camera kit", words: ['LENS', 'TRIPOD', 'FLASH', 'HOOD'] },
      { name: "Coffee gear", words: ['GRINDER', 'TAMPER', 'PORTAFILTER', 'FROTHER'] },
    ],
    collisions: [
      { word: 'RIDGE', reads: "Mountain features" },
      { word: 'HOOD', reads: "Roof parts" },
    ],
  },
];

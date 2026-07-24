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
    // collisions: MARS, VENUS, SATURN all read Roman gods, but that group is
    // full of its own members (JUPITER/APOLLO/JUNO/DIANA), so all stay planets.
    groups: [
      { name: 'Planets', words: ['MARS', 'VENUS', 'SATURN', 'NEPTUNE'] },
      { name: 'Roman gods', words: ['JUPITER', 'APOLLO', 'JUNO', 'DIANA'] },
      { name: 'Car brands', words: ['HONDA', 'TOYOTA', 'FORD', 'TESLA'] },
      { name: 'Continents', words: ['ASIA', 'AFRICA', 'EUROPE', 'ANTARCTICA'] },
    ],
    collisions: [
      { word: 'MARS', reads: 'Roman gods' },
      { word: 'VENUS', reads: 'Roman gods' },
      { word: 'SATURN', reads: 'Roman gods' },
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
];

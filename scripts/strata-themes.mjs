// Strata theme pools.
//
// Each pool is BOTH the source of a day's answers and the vocabulary the decoy
// check runs against: any pool word that is not an answer but can still be traced
// somewhere fails the bank, because that is the cruel case (a real member of the
// category, sitting right there, refused). Keep pools tight for that reason.
//
// TWO AXES OF DIFFICULTY, and they are deliberately separate (owner, 2026-08-06,
// after day one shipped GUSSET and BOBBIN and nobody knew them):
//
//   tier   how many people know the CATEGORY. 1 = everyday (weather, fruit,
//          furniture), 2 = general knowledge (gemstones, chess, herbs),
//          3 = specialist (sewing, knots, printing).
//   Zipf   how common each WORD is, scored from scripts/.lode-freq.json.
//
// A board can be easy on one axis and hard on the other, so the generator gates
// on both, by weekday: Monday takes tier 1 categories AND common words only, and
// the week loosens from there to Sunday. See DIFFICULTY in scripts/strata-gen.mjs.
//
// WORDS MUST BE 4 TO 8 LETTERS AND PRESENT IN THE FREQUENCY LIST. That list
// covers exactly 4-8 letter common nouns and no proper nouns, so the rule also
// quietly bars place names and brand names, which cannot be frequency-graded and
// were the other half of the day-one problem (RHINE and ORION are not obscure,
// they are simply unscorable). Anything below is filtered against the list at
// load, so an unscorable word in a pool is dropped rather than shipped.

export const THEMES = [
  // ── tier 1: everyday ──────────────────────────────────────────────────────
  [1, 'Weather', 'RAIN SNOW HAIL STORM FROST WIND CLOUD THUNDER BREEZE DRIZZLE GALE THAW MIST SLEET SHOWER SUNSHINE'],
  [1, 'Colors', 'BLUE GREEN BLACK WHITE BROWN PINK PURPLE ORANGE SILVER GOLDEN YELLOW SCARLET VIOLET CREAM CRIMSON'],
  [1, 'Fruit', 'APPLE ORANGE BANANA GRAPE PEACH PLUM LEMON CHERRY MELON BERRY MANGO PEAR LIME APRICOT'],
  [1, 'Furniture', 'CHAIR TABLE SOFA DESK SHELF STOOL BENCH LAMP MIRROR COUCH DRESSER CABINET CUPBOARD'],
  [1, 'Clothing', 'SHIRT DRESS COAT SKIRT JEANS SOCKS SCARF GLOVE BOOTS BELT JACKET SWEATER SHOES BLOUSE'],
  [1, 'In the kitchen', 'KNIFE SPOON PLATE BOWL KETTLE OVEN FRIDGE TOASTER BLENDER WHISK SAUCER TEAPOT'],
  [1, 'Body parts', 'ELBOW WRIST ANKLE THIGH SHOULDER FINGER THUMB KNEE HEART LIVER SPLEEN TEMPLE STOMACH'],
  [1, 'Farm animals', 'HORSE SHEEP GOAT DUCK GOOSE DONKEY RABBIT CHICKEN CATTLE LAMB CALF FOAL TURKEY'],
  [1, 'Rooms in a house', 'KITCHEN BEDROOM ATTIC CELLAR HALL PORCH STUDY PANTRY GARAGE LOUNGE LANDING'],
  [1, 'Ways to travel', 'TRUCK TRAIN PLANE BOAT BIKE SHIP TAXI FERRY WAGON SCOOTER TRACTOR SUBWAY CANOE'],
  [1, 'Sports', 'TENNIS SOCCER RUGBY BOXING SKIING HOCKEY DARTS GOLF CRICKET ROWING SQUASH CYCLING BASEBALL'],
  [1, 'Trees', 'PINE BIRCH MAPLE WILLOW CEDAR BEECH WALNUT POPLAR SPRUCE ASPEN ALDER LARCH'],
  [1, 'Instruments', 'PIANO GUITAR DRUMS VIOLIN FLUTE TRUMPET CELLO HARP BANJO ORGAN FIDDLE OBOE'],
  [1, 'Jobs', 'DOCTOR NURSE TEACHER FARMER BAKER LAWYER PILOT WRITER ARTIST DRIVER PLUMBER BUTCHER'],
  [1, 'Breakfast', 'TOAST BACON CEREAL COFFEE JUICE BUTTER YOGURT PANCAKE OATMEAL SAUSAGE HONEY MUFFIN'],
  [1, 'At the beach', 'SAND WAVES SHELL TOWEL SURF TIDE OCEAN PALM CRAB DUNE SHORE PEBBLE SEAWEED'],
  [1, 'School', 'PENCIL LESSON CLASS DESK CHALK RULER HOMEWORK LIBRARY STUDENT TEACHER RECESS ERASER'],
  [1, 'In the garden', 'FLOWER GRASS FENCE SHOVEL BUCKET HEDGE WEEDS SOIL SEEDS SPADE BLOSSOM COMPOST'],
  [1, 'Birds', 'ROBIN EAGLE SPARROW PIGEON FALCON RAVEN CROW SWAN GOOSE PARROT PENGUIN HERON'],
  [1, 'Drinks', 'WATER COFFEE JUICE CIDER LEMONADE COCOA BRANDY WHISKEY SHERRY VODKA WINE BEER'],
  [1, 'Tools', 'HAMMER WRENCH PLIERS CHISEL DRILL MALLET CLAMP SHOVEL SAW LADDER TROWEL'],
  [1, 'Bathroom', 'TOWEL SOAP MIRROR SHOWER BRUSH RAZOR SPONGE TOILET BASIN COMB SHAMPOO'],

  // ── tier 2: general knowledge ─────────────────────────────────────────────
  [2, 'Gemstones', 'RUBY OPAL JADE TOPAZ PEARL AMBER GARNET ZIRCON BERYL ONYX AGATE JASPER EMERALD'],
  [2, 'Fish', 'TROUT SALMON TUNA PERCH BASS PIKE CARP MULLET HERRING MACKEREL SARDINE HALIBUT'],
  [2, 'Boats', 'KAYAK CANOE FERRY YACHT SKIFF BARGE SLOOP TRAWLER DINGHY CUTTER GALLEY'],
  [2, 'Big cats', 'LION TIGER LEOPARD JAGUAR CHEETAH COUGAR PUMA LYNX OCELOT PANTHER BOBCAT'],
  [2, 'Reptiles', 'GECKO IGUANA COBRA VIPER PYTHON ADDER TURTLE MONITOR CAIMAN LIZARD SERPENT'],
  [2, 'Herbs and spices', 'BASIL THYME SAGE CUMIN ANISE CLOVE NUTMEG PAPRIKA OREGANO PARSLEY GINGER SAFFRON MINT'],
  [2, 'Fabrics', 'LINEN SILK DENIM VELVET SATIN TWEED COTTON CANVAS CHIFFON FLANNEL MUSLIN SUEDE WOOL'],
  [2, 'Theater', 'STAGE CURTAIN SCRIPT ACTOR WINGS PROPS USHER BALCONY ENCORE MATINEE CHORUS PROMPT'],
  [2, 'Golf', 'BIRDIE EAGLE BOGEY PUTT DRIVER WEDGE FAIRWAY BUNKER CADDIE IRON SLICE'],
  [2, 'Chess', 'ROOK BISHOP KNIGHT QUEEN GAMBIT FORK SKEWER CASTLE ENDGAME CHECK BOARD'],
  [2, 'Card games', 'HEARTS BRIDGE POKER RUMMY SPADES WHIST CANASTA SHUFFLE TRUMP DEALER'],
  [2, 'Dances', 'TANGO SALSA WALTZ RUMBA SAMBA MAMBO POLKA JIVE BOLERO FLAMENCO FOXTROT'],
  [2, 'Ancient Rome', 'TOGA FORUM LEGION SENATE COLUMN CHARIOT VILLA ARENA MOSAIC TUNIC EMPEROR'],
  [2, 'Shades of red', 'CRIMSON SCARLET RUBY CORAL CARMINE MAROON GARNET BRICK ROSE BLUSH CHERRY'],
  [2, 'Dog breeds', 'BEAGLE BOXER COLLIE POODLE TERRIER SPANIEL HUSKY SETTER MASTIFF WHIPPET'],
  [2, 'Sea creatures', 'OCTOPUS SQUID CORAL URCHIN MANTA WHALE WALRUS LOBSTER PRAWN MUSSEL OYSTER'],
  [2, 'Flowers', 'TULIP DAHLIA PEONY ORCHID LILAC IRIS ASTER POPPY DAISY AZALEA VIOLET JASMINE'],
  [2, 'Birds of prey', 'EAGLE HAWK FALCON KESTREL OSPREY HARRIER BUZZARD CONDOR VULTURE MERLIN'],
  [2, 'Weapons and armor', 'LANCE SABER RAPIER DAGGER MUSKET SHIELD HELMET VISOR ARROW QUIVER ARMOR'],
  [2, 'Castles', 'KEEP MOAT TOWER TURRET RAMPART BAILEY DUNGEON COURTYARD BATTLEMENT GATEHOUSE'],

  // ── tier 3: specialist ────────────────────────────────────────────────────
  [3, 'Sewing', 'THIMBLE BOBBIN SEAM PLEAT BASTE GUSSET NOTCH STITCH NEEDLE THREAD HEMLINE TAILOR'],
  [3, 'Bones', 'FEMUR TIBIA FIBULA RADIUS ULNA SCAPULA PATELLA SACRUM CARPAL SKULL STERNUM'],
  [3, 'Knots', 'BOWLINE CLOVE HITCH REEF GRANNY TIMBER PRUSIK BEND SPLICE LANYARD TETHER'],
  [3, 'Printing', 'SERIF KERNING GALLEY PLATEN QUOIN FOLIO QUARTO INKWELL PRESS TYPEFACE MARGIN'],
  [3, 'Kitchen tools', 'WHISK LADLE SPATULA GRATER PEELER SIEVE TONGS MASHER SKILLET CLEAVER MORTAR'],

  // ── added 2026-08-21, extending the bank to 2026-11-19 ────────────────────
  // The 46 pools above cannot cover a bank that long, and the arithmetic is
  // worth writing down because it is not obvious. A weekday board is 25 letters
  // in 5 to 7 words, so in practice 5 words averaging five letters, which means
  // a category needs several SHORT common members or it cannot seat a weekday
  // board at all (Sports has one 4-letter word, so its shortest legal five sum
  // to 27 and it is a Sunday-thread pool only). Layer the weekday tier caps on
  // top (Monday and Tuesday draw tier 1 ONLY) and the Zipf floor (Monday 4.0),
  // and exactly eight of the original pools could seat a Monday. Eight pools at
  // a ceiling of three is 24 Mondays for a bank that needs far more, and the
  // ceiling is what keeps the bank from repeating itself, so it is the pool that
  // had to grow, never the ceiling. Same US-spelling, 4-to-8-letter,
  // no-proper-noun, in-the-frequency-table rules as everything above; several
  // of these seat Sunday threads only, which is a real use, a Sunday runs two.
  [1, 'Space', 'STAR MOON COMET ORBIT PLANET GALAXY ROCKET METEOR CRATER SOLAR LUNAR SHUTTLE'],
  [1, 'Rivers and lakes', 'RIVER LAKE POND CREEK BROOK STREAM CANAL MARSH DELTA LAGOON RAPIDS'],
  [1, 'Money', 'COIN CASH LOAN WAGES RENT SALARY BUDGET CREDIT PROFIT CHANGE INCOME DEBT'],
  [1, 'Books', 'NOVEL PAGE CHAPTER TITLE COVER INDEX PREFACE AUTHOR LIBRARY POEM STORY'],
  [1, 'Telling time', 'HOUR WEEK YEAR MONTH MINUTE SECOND DECADE MOMENT SEASON DAWN DUSK NIGHT'],
  [1, 'Parts of a car', 'WHEEL ENGINE BRAKE TIRE DOOR TRUNK MIRROR CLUTCH PEDAL GEARS BUMPER HORN'],
  [1, 'Nighttime', 'MOON STARS DARK OWLS DREAM SLEEP PILLOW BLANKET LAMP CURTAIN'],
  [1, 'Shapes', 'CIRCLE SQUARE OVAL CONE CUBE PRISM SPHERE ARCH WEDGE ANGLE DIAMOND CURVE'],
  [1, 'Toys', 'BALL DOLL BLOCKS PUZZLE KITE MARBLE ROBOT TRAIN TEDDY WAGON YOYO'],
  [1, 'The office', 'DESK PHONE FOLDER STAPLER PRINTER MEMO REPORT BINDER PAPER LEDGER FILING'],
  [1, 'Zoo animals', 'BEAR WOLF ZEBRA CAMEL MONKEY GIRAFFE SEAL OTTER PANDA RHINO HIPPO ELEPHANT'],
  [1, 'Desserts', 'CAKE TART JELLY MOUSSE PUDDING SUNDAE COOKIE TRIFLE SORBET FUDGE WAFFLE CUSTARD'],
  [1, 'Winter', 'SNOW SLED SCARF FROST SKATE MITTEN CHILL PARKA SHIVER ICICLE SLEIGH BLIZZARD'],
  [1, 'Vegetables', 'ONION CARROT POTATO BEANS PEAS TURNIP CELERY LEEK CABBAGE SPINACH RADISH PEPPER'],
  [1, 'Family', 'MOTHER FATHER SISTER BROTHER UNCLE AUNT COUSIN NEPHEW NIECE PARENT'],
  [1, 'Pets', 'RABBIT HAMSTER PUPPY KITTEN PARROT GERBIL TURTLE GOLDFISH LEASH COLLAR'],
  [1, 'Footwear', 'BOOTS SANDAL SNEAKER LOAFER CLOG HEEL SLIPPER PUMPS LACES SOLES'],
  [1, 'In the city', 'STREET BRIDGE TOWER SUBWAY MARKET PLAZA ALLEY CORNER TRAFFIC SIDEWALK'],
  [1, 'Picnic', 'BASKET BLANKET SANDWICH SALAD NAPKIN THERMOS GRILL LEMONADE CRUMBS ANTS'],
  [2, 'Metals', 'IRON STEEL COPPER SILVER BRASS BRONZE NICKEL LEAD ZINC PEWTER COBALT ALLOY'],
  [2, 'Landscape', 'HILL CLIFF VALLEY RIDGE CANYON PLAIN DUNE MESA PLATEAU SUMMIT SLOPE MEADOW'],
  [2, 'Baking', 'FLOUR SUGAR YEAST DOUGH BATTER ICING CRUST KNEAD PASTRY SPONGE CRUMB GLAZE'],
  [2, 'Camping', 'TENT ROPE STOVE LANTERN TRAIL COMPASS MATCH FLASK BONFIRE HIKE BACKPACK'],
  [2, 'At the doctor', 'NURSE WARD PILL TABLET SYRINGE BANDAGE CLINIC SURGEON FEVER STITCH'],
  [2, 'Fasteners', 'NAIL SCREW BOLT RIVET STAPLE CLAMP HINGE BUCKLE ZIPPER LATCH'],
  [2, 'Bread', 'LOAF ROLL BAGEL TOAST CRUST SCONE MUFFIN BRIOCHE PITA DOUGH'],
  [2, 'Rocks', 'SLATE GRANITE MARBLE CHALK FLINT SHALE BASALT PUMICE QUARTZ GRAVEL PEBBLE'],
  [2, 'Insects', 'BEETLE MOTH WASP HORNET LOCUST APHID MANTIS FLEA MIDGE WEEVIL TERMITE'],
  [2, 'Hats', 'BERET BONNET FEDORA HELMET TURBAN VISOR CROWN HOOD DERBY BOWLER'],
  [2, 'Poetry', 'VERSE RHYME STANZA METER SONNET LYRIC BALLAD REFRAIN COUPLET'],
  [2, 'Circus', 'CLOWN TRAPEZE JUGGLER ACROBAT STILTS TENT RING PARADE COSTUME'],
];

// Words are scored against the Lode frequency table (Zipf, log10 per billion:
// 4.7 = "apple", 3.5 = "seam", 2.5 = "bobbin"). A word with no score cannot be
// graded and is dropped, which is what keeps proper nouns and 3-letter words out.
export function loadThemes(freq) {
  return THEMES.map(([tier, name, list]) => {
    const pool = [...new Set(list.split(/\s+/))]
      .filter((w) => /^[A-Z]{4,8}$/.test(w))
      .filter((w) => freq[w.toLowerCase()] !== undefined);
    return { tier, name, pool, zipf: (w) => freq[w.toLowerCase()] };
  }).filter((t) => t.pool.length >= 8);
}

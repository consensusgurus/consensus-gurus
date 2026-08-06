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
  [2, 'Weapons and armor', 'LANCE SABRE RAPIER DAGGER MUSKET SHIELD HELMET VISOR ARROW QUIVER ARMOR'],
  [2, 'Castles', 'KEEP MOAT TOWER TURRET RAMPART BAILEY DUNGEON COURTYARD BATTLEMENT GATEHOUSE'],

  // ── tier 3: specialist ────────────────────────────────────────────────────
  [3, 'Sewing', 'THIMBLE BOBBIN SEAM PLEAT BASTE GUSSET NOTCH STITCH NEEDLE THREAD HEMLINE TAILOR'],
  [3, 'Bones', 'FEMUR TIBIA FIBULA RADIUS ULNA SCAPULA PATELLA SACRUM CARPAL SKULL STERNUM'],
  [3, 'Knots', 'BOWLINE CLOVE HITCH REEF GRANNY TIMBER PRUSIK BEND SPLICE LANYARD TETHER'],
  [3, 'Printing', 'SERIF KERNING GALLEY PLATEN QUOIN FOLIO QUARTO INKWELL PRESS TYPEFACE MARGIN'],
  [3, 'Kitchen tools', 'WHISK LADLE SPATULA GRATER PEELER SIEVE TONGS MASHER SKILLET CLEAVER MORTAR'],
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

// Crux authoring pool: the categories a board may be built from, and the
// cross-readings that make a board a puzzle rather than a vocabulary test.
//
// WHY THIS FILE EXISTS. The Aug 11 to Sep 29 2026 bank was produced by an
// ad-hoc script that was never committed, so nobody could re-run it and nobody
// could see what it was optimizing for. It optimized for the collision floor
// and nothing else, and collapsed onto the handful of categories that collide
// most easily: Colors landed on 25 of those 50 boards, Metals on 23, BRONZE on
// 19, and 30 category+word pairs repeated outright (Metals: BRONZE/SILVER ran
// nine times, twice on consecutive days). Every one of those was mechanically
// checkable and nobody had written the check. See scripts/gen-crux.mjs for the
// generator and the crux section of scripts/verify-daily-banks.mjs for the
// checks that now gate the bank.
//
// SHAPE. Each entry is { name, words }. A word belongs to exactly ONE category
// in this pool (the generator asserts it), because a word that is genuinely a
// member of two categories on the same board has no answer.
//
// READS is the collision map: word -> the OTHER pool categories that word
// plausibly reads as. It is the entire semantic model the generator has, so it
// carries two jobs at once and both matter:
//
//   1. It supplies the traps. A collision only counts when the fake reading is
//      a category ON THE SAME BOARD (an off-board reading can never tempt
//      anybody), so the generator scores each candidate board against READS
//      and rejects one that cannot clear the floor: 2 collisions on a weekday,
//      3 on a Sunday Edition.
//   2. It is what uniqueness is proved against. A word's plausible homes are
//      its true category plus every READS entry that is on the board; the
//      generator counts the filings of the words into the categories under
//      those memberships and requires EXACTLY ONE. That is the same counting
//      proof Links uses, and it is why an under-annotated word is dangerous:
//      a real reading left out of READS is a second solution the check cannot
//      see. Annotate honestly, including readings that make a board harder.
//
// A reading has to be one an ordinary player would actually entertain. BRONZE
// reads as a colour; SOFFIT does not read as anything. Do not pad READS to
// clear the floor, add a better category instead.
export const CATEGORIES = [
  { name: 'Chess pieces', words: ['KING', 'QUEEN', 'BISHOP', 'KNIGHT', 'ROOK', 'PAWN'] },
  { name: 'Corvids', words: ['RAVEN', 'MAGPIE', 'JACKDAW', 'CHOUGH', 'NUTCRACKER'] },
  { name: 'Church roles', words: ['DEACON', 'CURATE', 'VERGER', 'PRIEST', 'PRIMATE', 'ABBOT'] },
  { name: 'Medieval ranks', words: ['SQUIRE', 'BARON', 'VASSAL', 'HERALD', 'REEVE', 'SERF'] },
  { name: 'Cathedral parts', words: ['NAVE', 'APSE', 'TRANSEPT', 'CRYPT', 'SPIRE', 'VESTRY'] },
  { name: 'Castle parts', words: ['KEEP', 'MOAT', 'TURRET', 'BAILEY', 'RAMPART', 'BARBICAN'] },

  { name: 'Birds of prey', words: ['KESTREL', 'OSPREY', 'MERLIN', 'BUZZARD', 'GOSHAWK', 'HARRIER'] },
  { name: 'Wartime aircraft', words: ['SPITFIRE', 'MOSQUITO', 'WELLINGTON', 'HURRICANE', 'TYPHOON', 'SWORDFISH'] },
  { name: 'Insects', words: ['EARWIG', 'WEEVIL', 'APHID', 'LOCUST', 'MAYFLY', 'CRICKET'] },
  { name: 'Cricket terms', words: ['WICKET', 'CREASE', 'GULLY', 'MAIDEN', 'DUCK', 'SLIP'] },
  { name: 'Waterfowl', words: ['TEAL', 'EIDER', 'MALLARD', 'WIGEON', 'GADWALL', 'POCHARD'] },
  { name: 'Golf scores', words: ['BIRDIE', 'EAGLE', 'BOGEY', 'ALBATROSS', 'CONDOR'] },
  { name: 'Seabirds', words: ['FULMAR', 'PETREL', 'GANNET', 'SKUA', 'PUFFIN', 'GUILLEMOT'] },

  { name: 'Pottery steps', words: ['GLAZE', 'KILN', 'THROW', 'WEDGE', 'BISQUE', 'BURNISH'] },
  { name: 'Golf clubs', words: ['PUTTER', 'NIBLICK', 'MASHIE', 'BRASSIE', 'CLEEK'] },
  { name: 'Baking steps', words: ['BATTER', 'PROOF', 'KNEAD', 'CREAM', 'SIFT', 'CRIMP'] },
  { name: 'Cookware', words: ['SKILLET', 'KETTLE', 'LADLE', 'COLANDER', 'RAMEKIN', 'PITCHER'] },
  { name: 'Baseball roles', words: ['CATCHER', 'SLUGGER', 'UMPIRE', 'SHORTSTOP', 'RELIEVER'] },
  { name: 'Hand tools', words: ['MALLET', 'RASP', 'BRADAWL', 'CHISEL', 'HANDSAW', 'SPOKESHAVE'] },
  { name: 'Fasteners', words: ['RIVET', 'GROMMET', 'DOWEL', 'WASHER', 'TOGGLE', 'STAPLE'] },
  { name: 'Sewing kit', words: ['BOBBIN', 'THIMBLE', 'PINKING', 'BODKIN', 'TACKING'] },
  { name: 'Knitting terms', words: ['PURL', 'SKEIN', 'GARTER', 'CASTOFF', 'YARN'] },

  { name: 'Plumbing fittings', words: ['ELBOW', 'UNION', 'COUPLING', 'GASKET', 'STOPCOCK', 'TRAP', 'VALVE'] },
  { name: 'Body joints', words: ['KNUCKLE', 'WRIST', 'ANKLE', 'SHOULDER', 'JAWBONE'] },
  { name: 'Drum kit', words: ['SNARE', 'CYMBAL', 'CRASH', 'TIMBALE', 'RIMSHOT'] },
  { name: 'Trapping gear', words: ['DEADFALL', 'PITFALL', 'SPRINGE', 'NOOSE', 'BIRDLIME'] },
  { name: 'Fishing tackle', words: ['LURE', 'REEL', 'SINKER', 'GAFF', 'SPINNER', 'HOOK'] },
  { name: 'Folk dances', words: ['JIG', 'POLKA', 'HORNPIPE', 'MAZURKA', 'GALLIARD'] },
  { name: 'Brass instruments', words: ['CORNET', 'TUBA', 'TROMBONE', 'BUGLE', 'FLUGELHORN'] },
  { name: 'Music notation', words: ['CLEF', 'CROTCHET', 'MINIM', 'QUAVER', 'STAVE', 'CODA'] },
  { name: 'Snooker terms', words: ['BAULK', 'CANNON', 'SCREW', 'REST', 'POT', 'BREAK'] },
  { name: 'Tennis terms', words: ['DEUCE', 'FAULT', 'VOLLEY', 'TIEBREAK', 'ADVANTAGE'] },
  { name: 'Laundry appliances', words: ['DRYER', 'MANGLE', 'IRON', 'WRINGER', 'AIRER'] },
  { name: 'Glassware', words: ['TUMBLER', 'GOBLET', 'CARAFE', 'DECANTER', 'SNIFTER', 'FLUTE'] },
  { name: 'Lock parts', words: ['HASP', 'LATCH', 'WARD', 'KEYHOLE', 'DEADBOLT', 'BOLT'] },
  { name: 'Woodwind instruments', words: ['OBOE', 'BASSOON', 'PICCOLO', 'CLARINET', 'RECORDER'] },
  { name: 'Court roles', words: ['BAILIFF', 'JUROR', 'USHER', 'ADVOCATE', 'MAGISTRATE'] },
  { name: 'Fabric lengths', words: ['REMNANT', 'SWATCH', 'SELVEDGE', 'YARDAGE', 'OFFCUT'] },

  { name: 'Geology features', words: ['STRATA', 'SCARP', 'MORAINE', 'OUTCROP', 'BATHOLITH'] },
  { name: 'Landforms', words: ['MESA', 'BUTTE', 'FJORD', 'TOMBOLO', 'ESKER', 'DRUMLIN'] },
  { name: 'Cloud types', words: ['CIRRUS', 'STRATUS', 'NIMBUS', 'CUMULUS', 'ANVIL', 'MACKEREL'] },
  { name: 'Sailing gear', words: ['HALYARD', 'KEEL', 'CLEAT', 'TILLER', 'SPINNAKER', 'BOOM'] },
  { name: 'Film crew kit', words: ['CLAPPER', 'GAFFER', 'GRIP', 'DOLLY', 'SLATE'] },
  { name: 'Farm implements', words: ['HARROW', 'SEEDER', 'BALER', 'SCYTHE', 'COULTER'] },
  { name: 'Sheep breeds', words: ['MERINO', 'CHEVIOT', 'KARAKUL', 'RAMBOUILLET', 'DORPER', 'HERDWICK'] },

  { name: 'Ear bones', words: ['STIRRUP', 'MALLEUS', 'INCUS', 'STAPES', 'HAMMER'] },
  { name: 'Horse tack', words: ['BRIDLE', 'GIRTH', 'HALTER', 'CRUPPER', 'SADDLE', 'BIT'] },
  { name: 'Bicycle parts', words: ['SPROCKET', 'PEDAL', 'DERAILLEUR', 'CRANK', 'MUDGUARD', 'FREEWHEEL'] },
  { name: 'Organs', words: ['SPLEEN', 'PANCREAS', 'KIDNEY', 'THYMUS', 'GALLBLADDER', 'TONGUE'] },
  { name: 'Shoe parts', words: ['INSTEP', 'WELT', 'EYELET', 'SHANK', 'VAMP', 'SOLE'] },
  { name: 'Fish', words: ['BREAM', 'PLAICE', 'TENCH', 'GUDGEON', 'BARBEL', 'ROACH'] },
  { name: 'Boxing punches', words: ['JAB', 'UPPERCUT', 'HAYMAKER', 'CROSS', 'OVERHAND'] },
  { name: 'Mushroom parts', words: ['GILL', 'VOLVA', 'MYCELIUM', 'SPORE', 'CAP', 'STIPE'] },
  { name: 'Bank things', words: ['TELLER', 'OVERDRAFT', 'MORTGAGE', 'DEBIT', 'VAULT', 'LEDGER'] },
  { name: 'Gymnastics apparatus', words: ['POMMEL', 'BEAM', 'RINGS', 'TRAMPOLINE', 'PARALLELS'] },
  { name: 'Timber', words: ['JOIST', 'BATTEN', 'VENEER', 'PLANK', 'LINTEL', 'RAFTER'] },
  { name: 'Bar drinks', words: ['SPRITZ', 'HIGHBALL', 'NEGRONI', 'SIDECAR', 'SHANDY'] },
  { name: 'Spy trade', words: ['MOLE', 'HANDLER', 'SLEEPER', 'CUTOUT', 'LEGEND', 'PLANT'] },
  { name: 'Rodents', words: ['VOLE', 'GERBIL', 'CAPYBARA', 'DORMOUSE', 'CHINCHILLA', 'MOUSE'] },
  { name: 'Computer parts', words: ['MOTHERBOARD', 'PROCESSOR', 'KEYBOARD', 'TRACKPAD', 'CHIPSET'] },
  { name: 'Lizards', words: ['SKINK', 'GECKO', 'IGUANA', 'CHAMELEON', 'AGAMA', 'MONITOR'] },
];

// word -> the other pool categories it plausibly reads as
export const READS = {
  ROOK: ['Corvids'],
  BISHOP: ['Church roles'],
  KNIGHT: ['Medieval ranks'],
  QUEEN: ['Medieval ranks'],
  PRIMATE: ['Church roles'],
  NUTCRACKER: ['Hand tools'],
  KEEP: ['Castle parts'],
  CRYPT: ['Castle parts'],
  SPIRE: ['Castle parts'],
  TURRET: ['Cathedral parts'],
  HARRIER: ['Wartime aircraft'],
  MOSQUITO: ['Insects'],
  SPITFIRE: ['Birds of prey'],
  SWORDFISH: ['Fish'],
  SLATE: ['Geology features'],
  CRICKET: ['Cricket terms'],
  DUCK: ['Waterfowl'],
  GULLY: ['Landforms'],
  SLIP: ['Pottery steps'],
  MAIDEN: ['Medieval ranks'],
  EAGLE: ['Birds of prey'],
  BIRDIE: ['Seabirds', 'Waterfowl'],
  ALBATROSS: ['Seabirds'],
  CONDOR: ['Birds of prey'],
  WEDGE: ['Golf clubs'],
  GLAZE: ['Baking steps'],
  BISQUE: ['Cookware'],
  THROW: ['Boxing punches'],
  BATTER: ['Baking steps', 'Baseball roles'],
  CREAM: ['Baking steps'],
  PITCHER: ['Baseball roles'],
  KETTLE: ['Landforms'],
  MALLET: ['Ear bones'],
  HAMMER: ['Hand tools'],
  ANVIL: ['Hand tools'],
  STIRRUP: ['Horse tack'],
  SADDLE: ['Bicycle parts', 'Landforms'],
  BIT: ['Hand tools'],
  CRANK: ['Bicycle parts'],
  PEDAL: ['Bicycle parts'],
  WASHER: ['Laundry appliances'],
  STAPLE: ['Fasteners'],
  TOGGLE: ['Fasteners'],
  ELBOW: ['Body joints', 'Plumbing fittings'],
  SHOULDER: ['Body joints'],
  TRAP: ['Drum kit', 'Trapping gear', 'Plumbing fittings'],
  SNARE: ['Trapping gear', 'Drum kit'],
  NOOSE: ['Trapping gear'],
  LURE: ['Trapping gear'],
  HOOK: ['Boxing punches', 'Fishing tackle'],
  REEL: ['Folk dances'],
  SPINNER: ['Cricket terms'],
  JIG: ['Folk dances'],
  VALVE: ['Brass instruments'],
  CORNET: ['Cookware'],
  QUAVER: ['Music notation'],
  STAVE: ['Timber'],
  CODA: ['Music notation'],
  REST: ['Music notation', 'Snooker terms'],
  BREAK: ['Tennis terms', 'Snooker terms'],
  SCREW: ['Fasteners'],
  POT: ['Cookware'],
  CANNON: ['Snooker terms'],
  FAULT: ['Geology features', 'Tennis terms'],
  VOLLEY: ['Boxing punches'],
  IRON: ['Golf clubs'],
  MANGLE: ['Laundry appliances'],
  TUMBLER: ['Lock parts', 'Glassware'],
  FLUTE: ['Woodwind instruments', 'Glassware'],
  RECORDER: ['Court roles'],
  ADVOCATE: ['Court roles'],
  BOLT: ['Fabric lengths', 'Fasteners', 'Lock parts'],
  WARD: ['Court roles'],
  REMNANT: ['Fabric lengths'],
  STRATA: ['Cloud types'],
  STRATUS: ['Geology features'],
  MESA: ['Landforms'],
  MACKEREL: ['Fish', 'Cloud types'],
  NIMBUS: ['Cloud types'],
  BOOM: ['Film crew kit', 'Sailing gear'],
  TILLER: ['Farm implements', 'Sailing gear'],
  KEEL: ['Sailing gear'],
  DOLLY: ['Sheep breeds', 'Film crew kit'],
  GRIP: ['Film crew kit'],
  CLAPPER: ['Film crew kit'],
  HALTER: ['Horse tack'],
  GIRTH: ['Horse tack'],
  TONGUE: ['Shoe parts', 'Organs'],
  SOLE: ['Fish', 'Shoe parts'],
  VAMP: ['Shoe parts'],
  SHANK: ['Golf scores', 'Shoe parts'],
  ROACH: ['Insects', 'Fish'],
  CROSS: ['Boxing punches'],
  GILL: ['Fish', 'Mushroom parts'],
  CAP: ['Mushroom parts'],
  SPORE: ['Mushroom parts'],
  VAULT: ['Gymnastics apparatus', 'Bank things'],
  BEAM: ['Timber', 'Gymnastics apparatus'],
  RINGS: ['Gymnastics apparatus'],
  POMMEL: ['Horse tack'],
  LEDGER: ['Timber'],
  PLANK: ['Timber'],
  JOIST: ['Timber'],
  BATTEN: ['Sailing gear'],
  LINTEL: ['Timber'],
  SIDECAR: ['Bicycle parts'],
  MOLE: ['Rodents', 'Spy trade'],
  PLANT: ['Spy trade'],
  SLEEPER: ['Spy trade'],
  LEGEND: ['Spy trade'],
  MOUSE: ['Computer parts', 'Rodents'],
  MONITOR: ['Computer parts', 'Lizards'],
  KEYBOARD: ['Music notation'],
};

// word -> the ONE category that owns it. Asserted unique by the generator.
export const HOME = Object.fromEntries(
  CATEGORIES.flatMap((c) => c.words.map((w) => [w, c.name])),
);

// The readings that count. A word's own home is filtered out rather than
// treated as an error: annotating TUMBLER as reading "Lock parts, Glassware"
// when one of those IS its home is the natural way to write the pair down, and
// a self-reading can never be a trap, so silently dropping it is right.
export function readsOf(word) {
  return (READS[word] || []).filter((r) => r !== HOME[word]);
}

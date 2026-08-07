// The closed-category lexicon behind Anon.
//
// A category earns its place by being SMALL, not by being closed. "Animal" is closed
// in principle and useless in practice: animal-6 admits forty words, so it tells the
// solver nothing. What works is a set you can recite in full, where category plus
// length lands on four candidates or fewer, which is the cap scripts/verify-anon.mjs
// enforces. So this is deliberately a long list of tiny sets rather than a short list
// of big ones. US spellings only, per authoring rule 8.
export const CLOSED = {
  "planet": "mercury venus earth mars jupiter saturn uranus neptune",
  "ocean": "atlantic pacific arctic indian southern",
  "continent": "africa asia europe antarctica australia",
  "chess piece": "pawn rook knight bishop queen king",
  "card suit": "hearts spades clubs diamonds",
  "compass point": "north south east west northeast northwest southeast southwest",
  "season": "spring summer autumn winter",
  "month": "january february march april may june july august september october november december",
  "weekday": "monday tuesday wednesday thursday friday saturday sunday",
  "zodiac sign": "aries taurus gemini cancer leo virgo libra scorpio sagittarius capricorn aquarius pisces",
  "great lake": "superior michigan huron erie ontario",
  "us coin": "penny nickel dime quarter dollar",
  "primary color": "red yellow blue",
  "rainbow color": "red orange yellow green blue indigo violet",
  "state of matter": "solid liquid gas plasma",
  "blood type": "positive negative",
  "musical note": "treble tonic octave chord scale",
  "chess outcome": "checkmate stalemate draw",
  "color": "scarlet crimson maroon navy teal olive amber ivory beige coral silver bronze lilac lavender turquoise magenta",
  "metal": "iron steel copper bronze silver gold lead tin zinc nickel cobalt platinum brass pewter",
  "gem": "diamond ruby emerald sapphire opal pearl topaz amber jade garnet amethyst",
  "shape": "circle square triangle oval sphere cube cone spiral hexagon diamond",
  "element": "hydrogen helium lithium boron carbon nitrogen oxygen neon sodium silicon sulfur argon calcium titanium chromium cobalt arsenic selenium iodine xenon barium radium uranium",
  "body part": "head neck chest elbow wrist ankle shoulder throat skull thumb finger thigh knee shin heel liver heart lung kidney tongue cheek chin tooth waist nostril tendon artery stomach",
  "relative": "mother father sister brother uncle aunt cousin nephew niece daughter",
  "sense": "sight hearing smell taste touch",
  "limb": "arm leg hand foot",
  "tree": "oak elm ash cedar birch willow maple pine spruce alder beech aspen walnut chestnut hazel holly larch sycamore",
  "flower": "rose tulip daisy lily orchid violet iris lilac aster peony dahlia poppy carnation lotus jasmine",
  "bird": "robin raven eagle heron finch swallow sparrow crow hawk falcon stork crane wren thrush vulture osprey condor pigeon parrot",
  "fish": "salmon trout tuna cod bass herring haddock sardine anchovy carp perch shark eel halibut",
  "insect": "beetle wasp hornet moth locust weevil termite aphid cicada mantis",
  "weather": "rain snow sleet hail frost thunder lightning drizzle blizzard breeze gale storm fog mist cloud shower",
  "landform": "valley canyon plateau ridge summit glacier delta dune marsh fjord isthmus",
  "instrument": "violin cello flute oboe clarinet trumpet trombone tuba harp piano organ banjo fiddle viola lute guitar",
  "tool": "hammer chisel wrench pliers drill anvil shovel rake trowel ladder clamp",
  "garment": "trousers jacket coat blouse dress skirt scarf glove sweater vest apron cloak shawl",
  "furniture": "chair table stool bench couch dresser cabinet wardrobe bureau",
  "vehicle": "wagon carriage bicycle tractor trolley scooter chariot sledge",
  "boat": "canoe yacht ferry barge trawler schooner tanker raft dinghy",
  "building": "castle cottage cathedral tavern barn mill chapel palace stable",
  "room": "kitchen cellar attic study library lounge pantry hallway bedroom",
  "occupation": "doctor nurse lawyer teacher farmer sailor tailor butcher baker barber welder dentist chemist author editor waiter janitor cashier architect historian librarian",
  "military rank": "soldier sergeant colonel admiral captain corporal general private cadet marine",
  "sport": "tennis soccer cricket rugby hockey golf boxing rowing sailing archery fencing curling",
  "dance": "waltz tango salsa rumba ballet polka",
  "crime": "theft arson fraud burglary robbery forgery treason bribery assault perjury larceny murder",
  "fruit": "apple orange banana cherry lemon lime peach pear plum grape melon apricot avocado fig berry",
  "vegetable": "carrot potato onion celery turnip parsnip cabbage spinach lettuce radish pumpkin",
  "drink": "water coffee juice cider wine beer brandy lemonade cocoa ale",
  "spice": "pepper cinnamon nutmeg clove ginger saffron paprika vanilla",
  "meal": "breakfast lunch dinner supper brunch",
};

export function catCandidates(cat, n) {
  return (CLOSED[cat] || '').split(' ').filter((w) => w.length === n);
}

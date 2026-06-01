// Auto-generated data file for Consensus Gurus

/* =========================================================================
   AFFILIATE CONFIGURATION
   ========================================================================= */
const AMAZON_AFFILIATE_TAG = 'cgurus-20';
const BOOKING_AFFILIATE_AID = '';
const TRIPADVISOR_PARTNER = '';

/* =========================================================================
   TYPES (for filtering chips)
   A list can match multiple types via its `tags` array.
   ========================================================================= */
const TYPES = [
  { id: 'all', label: 'All' },
  { id: 'food', label: 'Food & Drink' },
  { id: 'bars', label: 'Bars' },
  { id: 'nightlife', label: 'Nightlife' },
  { id: 'stores', label: 'Places & Stores' },
  { id: 'travel', label: 'Travel' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'tech', label: 'Tech' },
  { id: 'product', label: 'Products' },
  { id: 'other', label: 'Other' },
];

const COLORS = {
  cream: '#f4ede0',
  paper: '#ebe2d0',
  ink: '#1a1611',
  ember: '#c0392b',
  rust: '#a44a26',
  forest: '#3d4f2b',
  faded: '#7a6f5e',
};

/* =========================================================================
   LISTS
   - publishedAt / publishedDate: use the ACTUAL current timestamp when adding a
     list (e.g. `date -u +"%Y-%m-%dT%H:%M:%SZ"`), not a rounded or guessed time.
     The home page sorts newest-first by publishedAt, so a timestamp earlier than
     an existing list makes a brand-new list show up behind it.
   - type: primary category (used for legacy code paths)
   - tags (optional): array of all categories this list belongs to. If absent,
     falls back to [type]. The filter chips on the home page use tags.
   - mode (optional): 'facts' (bare list + its source, no other chips, no voting), 'scores' (composite ranking + source chips e.g. Google/Yelp, no voting), 'votes' (no source tab)
     For 'scores' lists: if only ONE platform source backs the composite (just
     'google' OR just 'yelp'), the UI collapses to a single chip since the composite
     and that platform are identical. Add both google+yelp only for a real blend.
   - sources: expert source lists can have any number of items (not limited to 10)
     Consensus will always be exactly 10 items (top 10 by Borda scoring)
   ========================================================================= */

const LISTS = [
  {
    id: 'best-breweries-atlanta',
    publishedDate: '2026-05-31',
    publishedAt: '2026-05-31T15:05:00Z',
    title: 'Best Breweries in Atlanta',
    category: 'Atlanta',
    type: 'food',
    tags: ['food-drink', 'bars', 'stores', 'entertainment'],
    linkType: 'mapsCity',
    blurb: 'Vast taprooms, Victorian brewpubs, and a Beltline beer garden that became a neighborhood anchor. Atlanta\'s craft brewing scene is one of the most distinctive in the South.',
    defaultSource: 'ai',
    links: {
      'Monday Night Brewing (West Midtown)': 'https://www.google.com/maps/search/?api=1&query=Monday%20Night%20Brewing%20West%20Midtown%20Atlanta',
      'Wrecking Bar Brewpub (Little Five Points)': 'https://www.google.com/maps/search/?api=1&query=Wrecking%20Bar%20Brewpub%20Little%20Five%20Points%20Atlanta',
      'Bold Monk Brewing (Upper Westside)': 'https://www.google.com/maps/search/?api=1&query=Bold%20Monk%20Brewing%20Upper%20Westside%20Atlanta',
      'Scofflaw Brewing (Upper Westside)': 'https://www.google.com/maps/search/?api=1&query=Scofflaw%20Brewing%20Upper%20Westside%20Atlanta',
      'New Realm Brewing (Old Fourth Ward)': 'https://www.google.com/maps/search/?api=1&query=New%20Realm%20Brewing%20Old%20Fourth%20Ward%20Atlanta',
      'Fire Maker Brewing (East Atlanta Village)': 'https://www.google.com/maps/search/?api=1&query=Fire%20Maker%20Brewing%20East%20Atlanta%20Village',
      'Atlantucky Brewing (Castleberry Hill)': 'https://www.google.com/maps/search/?api=1&query=Atlantucky%20Brewing%20Castleberry%20Hill%20Atlanta',
      'SweetWater Brewing Company (Armour)': 'https://www.google.com/maps/search/?api=1&query=SweetWater%20Brewing%20Company%20Armour%20Atlanta',
      'Three Taverns Imaginarium (Reynoldstown)': 'https://www.google.com/maps/search/?api=1&query=Three%20Taverns%20Imaginarium%20Reynoldstown%20Atlanta',
      'Arches Brewing (East Point)': 'https://www.google.com/maps/search/?api=1&query=Arches%20Brewing%20East%20Point%20Atlanta',
    },
    "itemLinks": {
      "Monday Night Brewing (West Midtown)": "https://mondaynightbrewing.com",
      "Wrecking Bar Brewpub (Little Five Points)": "https://wreckingbarbrewpub.com",
      "Bold Monk Brewing (Upper Westside)": "https://boldmonkbrewingco.com",
      "Scofflaw Brewing (Upper Westside)": "https://scofflawbeer.com",
      "New Realm Brewing (Old Fourth Ward)": "https://newrealmbrewing.com",
      "Fire Maker Brewing (East Atlanta Village)": "https://firemakerbeer.com",
      "Atlantucky Brewing (Castleberry Hill)": "https://atlantucky.com",
      "SweetWater Brewing Company (Armour)": "https://sweetwaterbrew.com",
      "Three Taverns Imaginarium (Reynoldstown)": "https://threetavernsbrewery.com",
      "Arches Brewing (East Point)": "https://archesbrewing.com"
    },
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          'Monday Night Brewing (West Midtown)',
          'Wrecking Bar Brewpub (Little Five Points)',
          'Bold Monk Brewing (Upper Westside)',
          'Scofflaw Brewing (Upper Westside)',
          'New Realm Brewing (Old Fourth Ward)',
          'Fire Maker Brewing (East Atlanta Village)',
          'Atlantucky Brewing (Castleberry Hill)',
          'SweetWater Brewing Company (Armour)',
          'Three Taverns Imaginarium (Reynoldstown)',
          'Arches Brewing (East Point)',
        ],
      },
      beerconnoisseur: {
        label: 'Beer Connoisseur · 7 Best Breweries in Atlanta 2025',
        url: 'https://beerconnoisseur.com/blogs/seven-best-breweries-atlanta',
        items: [
          'Monday Night Brewing (West Midtown)',
          'Bold Monk Brewing (Upper Westside)',
          'Scofflaw Brewing (Upper Westside)',
          'New Realm Brewing (Old Fourth Ward)',
          'Fire Maker Brewing (East Atlanta Village)',
          'SweetWater Brewing Company (Armour)',
        ],
      },
      infatuation: {
        label: 'The Infatuation Atlanta · Best Breweries 2026 (by score)',
        url: 'https://www.theinfatuation.com/atlanta/guides/best-atlanta-breweries',
        items: [
          'Wrecking Bar Brewpub (Little Five Points)',
          'New Realm Brewing (Old Fourth Ward)',
          'Monday Night Brewing (West Midtown)',
          'Scofflaw Brewing (Upper Westside)',
          'Bold Monk Brewing (Upper Westside)',
          'Three Taverns Imaginarium (Reynoldstown)',
          'Arches Brewing (East Point)',
          'Atlantucky Brewing (Castleberry Hill)',
        ],
      },
      yelp: {
        label: 'Yelp · Ranked by Rating (May 2026)',
        url: 'https://www.yelp.com/search?find_desc=breweries&find_loc=Atlanta%2C+GA&sortby=rating',
        items: [
          'Fire Maker Brewing (East Atlanta Village)',
          'Atlantucky Brewing (Castleberry Hill)',
          'Arches Brewing (East Point)',
          'Three Taverns Imaginarium (Reynoldstown)',
          'Monday Night Brewing (West Midtown)',
          'Scofflaw Brewing (Upper Westside)',
          'Wrecking Bar Brewpub (Little Five Points)',
        ],
      },
      google: {
        label: 'Google Reviews · Ranked by Rating (May 2026)',
        url: 'https://www.google.com/maps/search/breweries+Atlanta+GA',
        items: [
          'Monday Night Brewing (West Midtown)',
          'SweetWater Brewing Company (Armour)',
        ],
      },
    },
    vote: {
      items: [
        'Monday Night Brewing (West Midtown)',
        'Wrecking Bar Brewpub (Little Five Points)',
        'Bold Monk Brewing (Upper Westside)',
        'Scofflaw Brewing (Upper Westside)',
        'New Realm Brewing (Old Fourth Ward)',
        'Fire Maker Brewing (East Atlanta Village)',
        'Atlantucky Brewing (Castleberry Hill)',
        'SweetWater Brewing Company (Armour)',
        'Three Taverns Imaginarium (Reynoldstown)',
        'Arches Brewing (East Point)',
      ],
    },
  },
  {
    id: 'best-dive-bars-san-diego',
    publishedDate: '2026-05-31',
    publishedAt: '2026-05-31T15:10:00Z',
    title: 'Best Dive Bars in San Diego',
    category: 'San Diego',
    type: 'food',
    tags: ['bars', 'nightlife', 'food-drink', 'stores'],
    linkType: 'mapsCity',
    blurb: 'Cash-only, no-frills, and proudly unchanged. San Diego\'s dive bars have been pouring cheap drinks since 1933 and have no plans to update the jukebox.',
    defaultSource: 'ai',
    links: {
      'Aero Club Bar (Middletown)': 'https://www.google.com/maps/search/?api=1&query=Aero%20Club%20Bar%20Middletown%20San%20Diego',
      'Waterfront Bar & Grill (Little Italy)': 'https://www.google.com/maps/search/?api=1&query=Waterfront%20Bar%20%20Grill%20Little%20Italy%20San%20Diego',
      'Silver Fox (Pacific Beach)': 'https://www.google.com/maps/search/?api=1&query=Silver%20Fox%20Pacific%20Beach%20San%20Diego',
      'High Dive (Bay Park)': 'https://www.google.com/maps/search/?api=1&query=High%20Dive%20Bay%20Park%20San%20Diego',
      'Live Wire (North Park)': 'https://www.google.com/maps/search/?api=1&query=Live%20Wire%20North%20Park%20San%20Diego',
      'Star Bar (Gaslamp)': 'https://www.google.com/maps/search/?api=1&query=Star%20Bar%20Gaslamp%20San%20Diego',
      'The Kraken (Cardiff-by-the-Sea)': 'https://www.google.com/maps/search/?api=1&query=The%20Kraken%20Cardiff-by-the-Sea%20San%20Diego',
      'The Lamplighter (Mission Hills)': 'https://www.google.com/maps/search/?api=1&query=The%20Lamplighter%20Mission%20Hills%20San%20Diego',
      'Pacific Shores (Ocean Beach)': 'https://www.google.com/maps/search/?api=1&query=Pacific%20Shores%20Ocean%20Beach%20San%20Diego',
      'The Beachcomber (Mission Beach)': 'https://www.google.com/maps/search/?api=1&query=The%20Beachcomber%20Mission%20Beach%20San%20Diego',
    },
    "itemLinks": {
      "Aero Club Bar (Middletown)": "https://aeroclubbar.com",
      "Waterfront Bar & Grill (Little Italy)": "https://waterfrontbarandgrill.com",
      "Silver Fox (Pacific Beach)": "https://silverfoxloungepb.com",
      "High Dive (Bay Park)": "https://highdivesd.com",
      "Star Bar (Gaslamp)": "https://starbarsd.com",
      "The Kraken (Cardiff-by-the-Sea)": "https://krakencardiff.com",
      "The Lamplighter (Mission Hills)": "https://thelamplightersd.com"
    },
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          'Aero Club Bar (Middletown)',
          'Waterfront Bar & Grill (Little Italy)',
          'Silver Fox (Pacific Beach)',
          'High Dive (Bay Park)',
          'Live Wire (North Park)',
          'Star Bar (Gaslamp)',
          'The Kraken (Cardiff-by-the-Sea)',
          'The Lamplighter (Mission Hills)',
          'Pacific Shores (Ocean Beach)',
          'The Beachcomber (Mission Beach)',
        ],
      },
      secretsandiego: {
        label: 'Secret San Diego · 10 Best Dive Bars 2025',
        url: 'https://secretsandiego.com/san-diego-dive-bar/',
        items: [
          'Aero Club Bar (Middletown)',
          'High Dive (Bay Park)',
          'Star Bar (Gaslamp)',
          'The Kraken (Cardiff-by-the-Sea)',
          'Silver Fox (Pacific Beach)',
          'Live Wire (North Park)',
          'Waterfront Bar & Grill (Little Italy)',
        ],
      },
      theresandiego: {
        label: 'There San Diego · Best Hole-in-the-Wall Bars (unordered) 2026',
        url: 'https://theresandiego.com/must-try-san-diego-hole-in-the-wall-bars/',
        unordered: true,
        items: [
          'The Lamplighter (Mission Hills)',
          'The Kraken (Cardiff-by-the-Sea)',
          'High Dive (Bay Park)',
          'Silver Fox (Pacific Beach)',
          'The Beachcomber (Mission Beach)',
          'Pacific Shores (Ocean Beach)',
          'Waterfront Bar & Grill (Little Italy)',
          'Star Bar (Gaslamp)',
          'Live Wire (North Park)',
        ],
      },
      yelp: {
        label: 'Yelp · Ranked by Rating (May 2026)',
        url: 'https://www.yelp.com/search?find_desc=dive+bars&find_loc=San+Diego%2C+CA&sortby=rating',
        items: [
          'Aero Club Bar (Middletown)',
          'Waterfront Bar & Grill (Little Italy)',
          'High Dive (Bay Park)',
          'Silver Fox (Pacific Beach)',
        ],
      },
      google: {
        label: 'Google Reviews · Ranked by Rating (May 2026)',
        url: 'https://www.google.com/maps/search/dive+bars+San+Diego+CA',
        items: [
          'Aero Club Bar (Middletown)',
          'Waterfront Bar & Grill (Little Italy)',
        ],
      },
    },
    vote: {
      items: [
        'Aero Club Bar (Middletown)',
        'Waterfront Bar & Grill (Little Italy)',
        'Silver Fox (Pacific Beach)',
        'High Dive (Bay Park)',
        'Live Wire (North Park)',
        'Star Bar (Gaslamp)',
        'The Kraken (Cardiff-by-the-Sea)',
        'The Lamplighter (Mission Hills)',
        'Pacific Shores (Ocean Beach)',
        'The Beachcomber (Mission Beach)',
      ],
    },
  },
  {
    id: 'best-hotels-tulum',
    publishedDate: '2026-05-31',
    publishedAt: '2026-05-31T15:15:00Z',
    title: 'Best Hotels in Tulum',
    category: 'Tulum',
    type: 'travel',
    tags: ['travel', 'luxury', 'stores'],
    linkType: 'mapsCity',
    blurb: 'Palapa rooftops, cenote pools, and zero Wi-Fi by design. Tulum\'s hotels are as distinctive as the jungle they\'re built from.',
    defaultSource: 'ai',
    links: {
      'Olas Tulum (Tulum Beach)': 'https://www.google.com/maps/search/?api=1&query=Olas%20Tulum%20Beach',
      'Papaya Playa Project (Tulum Beach)': 'https://www.google.com/maps/search/?api=1&query=Papaya%20Playa%20Project%20Tulum%20Beach',
      'Azulik (Tulum Beach)': 'https://www.google.com/maps/search/?api=1&query=Azulik%20Tulum%20Beach',
      'Ahau Tulum (Tulum Beach)': 'https://www.google.com/maps/search/?api=1&query=Ahau%20Tulum%20Beach',
      'Be Tulum (Tulum Beach)': 'https://www.google.com/maps/search/?api=1&query=Be%20Tulum%20Beach',
      'Jashita Hotel Tulum (Soliman Bay)': 'https://www.google.com/maps/search/?api=1&query=Jashita%20Hotel%20Tulum%20Soliman%20Bay',
      'La Valise Tulum (Tulum Beach)': 'https://www.google.com/maps/search/?api=1&query=La%20Valise%20Tulum%20Beach',
      'Mezzanine (North Beach)': 'https://www.google.com/maps/search/?api=1&query=Mezzanine%20Tulum%20North%20Beach',
      'La Zebra (South Beach)': 'https://www.google.com/maps/search/?api=1&query=La%20Zebra%20Tulum%20South%20Beach',
      'Nomade (Tulum Beach)': 'https://www.google.com/maps/search/?api=1&query=Nomade%20Tulum%20Beach',
    },
    "itemLinks": {
      "Olas Tulum (Tulum Beach)": "https://olastulum.com",
      "Papaya Playa Project (Tulum Beach)": "https://papayaplayaproject.com",
      "Azulik (Tulum Beach)": "https://azulik.com",
      "Ahau Tulum (Tulum Beach)": "https://ahaucollection.com",
      "Be Tulum (Tulum Beach)": "https://betulum.com",
      "Jashita Hotel Tulum (Soliman Bay)": "https://jashitahotel.com",
      "La Valise Tulum (Tulum Beach)": "https://lavalisetulum.com",
      "La Zebra (South Beach)": "https://lazebratulum.com",
      "Nomade (Tulum Beach)": "https://nomadetulum.com"
    },
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          'Olas Tulum (Tulum Beach)',
          'Papaya Playa Project (Tulum Beach)',
          'Azulik (Tulum Beach)',
          'Ahau Tulum (Tulum Beach)',
          'Be Tulum (Tulum Beach)',
          'Jashita Hotel Tulum (Soliman Bay)',
          'La Valise Tulum (Tulum Beach)',
          'Mezzanine (North Beach)',
          'La Zebra (South Beach)',
          'Nomade (Tulum Beach)',
        ],
      },
      timeout: {
        label: 'Time Out · 11 Best Hotels in Tulum 2025',
        url: 'https://www.timeout.com/tulum/hotels/best-hotels-in-tulum',
        items: [
          'Olas Tulum (Tulum Beach)',
          'Papaya Playa Project (Tulum Beach)',
          'Azulik (Tulum Beach)',
        ],
      },
      upgradedpoints: {
        label: 'Upgraded Points · 13 Best Hotels in Tulum 2025',
        url: 'https://upgradedpoints.com/travel/hotels/best-hotels-in-tulum/',
        items: [
          'Ahau Tulum (Tulum Beach)',
          'Be Tulum (Tulum Beach)',
          'Jashita Hotel Tulum (Soliman Bay)',
          'La Valise Tulum (Tulum Beach)',
          'Mezzanine (North Beach)',
          'La Zebra (South Beach)',
        ],
      },
      mexicodave: {
        label: 'Mexico Dave · Best Hotels in Tulum (unordered) 2026',
        url: 'https://mexicodave.com/best-hotels-tulum',
        unordered: true,
        items: [
          'Mezzanine (North Beach)',
          'La Valise Tulum (Tulum Beach)',
          'Jashita Hotel Tulum (Soliman Bay)',
          'Nomade (Tulum Beach)',
          'Ahau Tulum (Tulum Beach)',
          'Azulik (Tulum Beach)',
          'La Zebra (South Beach)',
        ],
      },
    },
    vote: {
      items: [
        'Olas Tulum (Tulum Beach)',
        'Papaya Playa Project (Tulum Beach)',
        'Azulik (Tulum Beach)',
        'Ahau Tulum (Tulum Beach)',
        'Be Tulum (Tulum Beach)',
        'Jashita Hotel Tulum (Soliman Bay)',
        'La Valise Tulum (Tulum Beach)',
        'Mezzanine (North Beach)',
        'La Zebra (South Beach)',
        'Nomade (Tulum Beach)',
      ],
    },
  },
  {
    id: 'south-shore-bar-pies-boston',
    publishedDate: '2026-05-31',
    publishedAt: '2026-05-31T14:05:00Z',
    title: 'Best South Shore Bar Pies in Greater Boston',
    category: 'Boston',
    type: 'food',
    tags: ['food', 'food-drink', 'stores'],
    linkType: 'mapsCity',
    blurb: 'Cracker-thin crust, laced edges, one pie per person. From legends in Randolph and Stoughton to a garage in Bridgewater, this is Greater Boston\'s most specific and beloved pizza tradition.',
    defaultSource: 'ai',
    links: {
      'Town Spa Pizza (Stoughton)': 'https://www.google.com/maps/search/?api=1&query=Town%20Spa%20Pizza%20Stoughton',
      'Lynwood Cafe (Randolph)': 'https://www.google.com/maps/search/?api=1&query=Lynwood%20Cafe%20Randolph',
      'Cape Cod Cafe (Brockton)': 'https://www.google.com/maps/search/?api=1&query=Cape%20Cod%20Cafe%20Brockton',
      "J's Flying Pizza (Bridgewater)": 'https://www.google.com/maps/search/?api=1&query=J%27s%20Flying%20Pizza%20Bridgewater',
      "Hoey's Pizza (Randolph)": 'https://www.google.com/maps/search/?api=1&query=Hoey%27s%20Pizza%20Randolph',
      'Venus Cafe (Whitman)': 'https://www.google.com/maps/search/?api=1&query=Venus%20Cafe%20Whitman',
      "Poopsie's (Pembroke)": 'https://www.google.com/maps/search/?api=1&query=Poopsie%27s%20Pembroke',
      'Tinrays Family Restaurant (Brockton)': 'https://www.google.com/maps/search/?api=1&query=Tinrays%20Family%20Restaurant%20Brockton',
      'Alumni Pizza (Quincy)': 'https://www.google.com/maps/search/?api=1&query=Alumni%20Pizza%20Quincy',
      'The Next Page Cafe (Weymouth)': 'https://www.google.com/maps/search/?api=1&query=The%20Next%20Page%20Cafe%20Weymouth',
    },
    "itemLinks": {
      "Cape Cod Cafe (Brockton)": "https://capecodcafepizza.com",
      "Town Spa Pizza (Stoughton)": "https://townspapizza.com",
      "The Next Page Cafe (Weymouth)": "https://thenextpagecafe.com"
    },
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          "J's Flying Pizza (Bridgewater)",
          'Lynwood Cafe (Randolph)',
          'Cape Cod Cafe (Brockton)',
          'Tinrays Family Restaurant (Brockton)',
          'Town Spa Pizza (Stoughton)',
          "Hoey's Pizza (Randolph)",
          'Venus Cafe (Whitman)',
          "Poopsie's (Pembroke)",
          'Alumni Pizza (Quincy)',
          'The Next Page Cafe (Weymouth)',
        ],
      },
      bostonmag: {
        label: 'Boston Magazine · Best Bar Pizza (unordered roundup) 2024',
        url: 'https://www.bostonmagazine.com/restaurants/best-south-shore-bar-pizza/',
        unordered: true,
        items: [
          'Alumni Pizza (Quincy)',
          'Cape Cod Cafe (Brockton)',
          "Hoey's Pizza (Randolph)",
          "J's Flying Pizza (Bridgewater)",
          'Lynwood Cafe (Randolph)',
          'The Next Page Cafe (Weymouth)',
          "Poopsie's (Pembroke)",
          'Tinrays Family Restaurant (Brockton)',
          'Town Spa Pizza (Stoughton)',
          'Venus Cafe (Whitman)',
        ],
      },
      onebite: {
        label: 'One Bite / Dave Portnoy · Ranked by Score 2024',
        url: 'https://onebite.app/reviews/dave',
        items: [
          'Town Spa Pizza (Stoughton)',
          'Cape Cod Cafe (Brockton)',
          "J's Flying Pizza (Bridgewater)",
          'Venus Cafe (Whitman)',
          'Lynwood Cafe (Randolph)',
          "Poopsie's (Pembroke)",
          "Hoey's Pizza (Randolph)",
          'Tinrays Family Restaurant (Brockton)',
        ],
      },
      yelp: {
        label: 'Yelp · Ranked by Rating (May 2026)',
        url: 'https://www.yelp.com/search?find_desc=bar+pizza&find_loc=South+Shore%2C+MA',
        items: [
          "J's Flying Pizza (Bridgewater)",
          'Tinrays Family Restaurant (Brockton)',
          'Lynwood Cafe (Randolph)',
          'Cape Cod Cafe (Brockton)',
          "Poopsie's (Pembroke)",
          'Venus Cafe (Whitman)',
          'Town Spa Pizza (Stoughton)',
        ],
      },
      google: {
        label: 'Google Reviews · Ranked by Rating (May 2026)',
        url: 'https://www.google.com/maps/search/bar+pizza+South+Shore+MA',
        items: [
          "J's Flying Pizza (Bridgewater)",
          'Lynwood Cafe (Randolph)',
          'Tinrays Family Restaurant (Brockton)',
          'Cape Cod Cafe (Brockton)',
          "Hoey's Pizza (Randolph)",
          'Town Spa Pizza (Stoughton)',
          "Poopsie's (Pembroke)",
          'Venus Cafe (Whitman)',
        ],
      },
    },
    vote: {
      items: [
        "J's Flying Pizza (Bridgewater)",
        'Lynwood Cafe (Randolph)',
        'Cape Cod Cafe (Brockton)',
        'Tinrays Family Restaurant (Brockton)',
        'Town Spa Pizza (Stoughton)',
        "Hoey's Pizza (Randolph)",
        'Venus Cafe (Whitman)',
        "Poopsie's (Pembroke)",
        'Alumni Pizza (Quincy)',
        'The Next Page Cafe (Weymouth)',
      ],
    },
  },
  {
    "id": "top-grossing-realtors-2025",
    "publishedDate": "2026-05-27",
    "publishedAt": "2026-05-27T09:00:00Z",
    "title": "Top-Grossing Realtors in 2025",
    "category": "Real Estate",
    "type": "other",
    "tags": [
      "other"
    ],
    "linkType": "google",
    "mode": "facts",
    "blurb": "The highest-volume residential real estate agents in America in 2025, ranked by verified sales volume.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "RealTrends Verified",
        "items": [
          "Ben Caballero (Dallas; $3.9B)",
          "Deborah Kern (New York City; $1.1B)",
          "Christian Angle (Palm Beach; $792.4M)",
          "Jonathan Minerick (San Diego; $764.8M)",
          "Drew Fenton (Beverly Hills; $750.0M)",
          "Steven Koleno (Chicago; $703.7M)",
          "Thomas Ullrich (Englewood; $665.1M)",
          "David Roberts (Boca Raton; $623.9M)",
          "Chris Cortazzo (Malibu; $596.9M)",
          "Tracy Campion (Boston; $528.2M)"
        ]
      }
    },
    "vote": {
      "items": [
        "Ben Caballero (Dallas; $3.9B)",
        "Deborah Kern (New York City; $1.1B)",
        "Christian Angle (Palm Beach; $792.4M)",
        "Jonathan Minerick (San Diego; $764.8M)",
        "Drew Fenton (Beverly Hills; $750.0M)",
        "Steven Koleno (Chicago; $703.7M)",
        "Thomas Ullrich (Englewood; $665.1M)",
        "David Roberts (Boca Raton; $623.9M)",
        "Chris Cortazzo (Malibu; $596.9M)",
        "Tracy Campion (Boston; $528.2M)"
      ]
    },
    "links": {
      "Ben Caballero (Dallas; $3.9B)": "https://www.google.com/search?q=Ben+Caballero+Dallas+realtor",
      "Deborah Kern (New York City; $1.1B)": "https://www.google.com/search?q=Deborah+Kern+New+York+City+realtor",
      "Christian Angle (Palm Beach; $792.4M)": "https://www.google.com/search?q=Christian+Angle+Palm+Beach+realtor",
      "Jonathan Minerick (San Diego; $764.8M)": "https://www.google.com/search?q=Jonathan+Minerick+San+Diego+realtor",
      "Drew Fenton (Beverly Hills; $750.0M)": "https://www.google.com/search?q=Drew+Fenton+Beverly+Hills+realtor",
      "Steven Koleno (Chicago; $703.7M)": "https://www.google.com/search?q=Steven+Koleno+Chicago+realtor",
      "Thomas Ullrich (Englewood; $665.1M)": "https://www.google.com/search?q=Thomas+Ullrich+Englewood+realtor",
      "David Roberts (Boca Raton; $623.9M)": "https://www.google.com/search?q=David+Roberts+Boca+Raton+realtor",
      "Chris Cortazzo (Malibu; $596.9M)": "https://www.google.com/search?q=Chris+Cortazzo+Malibu+realtor",
      "Tracy Campion (Boston; $528.2M)": "https://www.google.com/search?q=Tracy+Campion+Boston+realtor"
    }
  },
  {
    "id": "miami-beach-hotels",
    "publishedDate": "2026-05-24",
    "publishedAt": "2026-05-24T09:00:00Z",
    "title": "Best Miami Beach Hotels",
    "category": "Miami Beach",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Faena Hotel Miami Beach (Mid-Beach)": "https://www.google.com/maps/search/?api=1&query=Faena%20Hotel%20Miami%20Beach%20Mid-Beach",
      "The Setai (South Beach)": "https://www.google.com/maps/search/?api=1&query=The%20Setai%20South%20Beach",
      "Four Seasons Hotel at The Surf Club (Surfside)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Hotel%20at%20The%20Surf%20Club%20Surfside",
      "1 Hotel South Beach (South Beach)": "https://www.google.com/maps/search/?api=1&query=1%20Hotel%20South%20Beach%20South%20Beach",
      "The Miami Beach EDITION (Mid-Beach)": "https://www.google.com/maps/search/?api=1&query=The%20Miami%20Beach%20EDITION%20Mid-Beach",
      "Nobu Hotel Miami Beach (Mid-Beach)": "https://www.google.com/maps/search/?api=1&query=Nobu%20Hotel%20Miami%20Beach%20Mid-Beach",
      "W South Beach (South Beach)": "https://www.google.com/maps/search/?api=1&query=W%20South%20Beach%20South%20Beach",
      "St. Regis Bal Harbour Resort (Bal Harbour)": "https://www.google.com/maps/search/?api=1&query=St.%20Regis%20Bal%20Harbour%20Resort%20Bal%20Harbour",
      "The Ritz-Carlton (South Beach)": "https://www.google.com/maps/search/?api=1&query=The%20Ritz-Carlton%20South%20Beach",
      "Loews Miami Beach Hotel (South Beach)": "https://www.google.com/maps/search/?api=1&query=Loews%20Miami%20Beach%20Hotel%20South%20Beach",
      "The Ritz-Carlton (Key Biscayne)": "https://www.google.com/maps/search/?api=1&query=The%20Ritz-Carlton%20Key%20Biscayne",
      "Eden Roc Miami Beach (Mid-Beach)": "https://www.google.com/maps/search/?api=1&query=Eden%20Roc%20Miami%20Beach%20Mid-Beach",
      "Acqualina Resort & Spa (Sunny Isles Beach)": "https://www.google.com/maps/search/?api=1&query=Acqualina%20Resort%20Spa%20Sunny%20Isles%20Beach",
      "The Gabriel South Beach (South Beach)": "https://www.google.com/maps/search/?api=1&query=The%20Gabriel%20South%20Beach%20South%20Beach"
    },
    "blurb": "Ocean Drive icons, Art Deco glamour, and the resorts that anchor South Beach.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Faena Hotel Miami Beach (Mid-Beach)",
          "The Setai (South Beach)",
          "Four Seasons Hotel at The Surf Club (Surfside)",
          "1 Hotel South Beach (South Beach)",
          "The Miami Beach EDITION (Mid-Beach)",
          "Nobu Hotel Miami Beach (Mid-Beach)",
          "W South Beach (South Beach)",
          "St. Regis Bal Harbour Resort (Bal Harbour)",
          "The Ritz-Carlton (South Beach)",
          "Loews Miami Beach Hotel (South Beach)"
        ]
      },
      "tlleisure": {
        "label": "Travel + Leisure Readers",
        "items": [
          "Four Seasons Hotel at The Surf Club (Surfside)",
          "St. Regis Bal Harbour Resort (Bal Harbour)",
          "The Setai (South Beach)",
          "Faena Hotel Miami Beach (Mid-Beach)",
          "The Ritz-Carlton (Key Biscayne)",
          "1 Hotel South Beach (South Beach)",
          "The Miami Beach EDITION (Mid-Beach)",
          "Nobu Hotel Miami Beach (Mid-Beach)",
          "W South Beach (South Beach)",
          "Eden Roc Miami Beach (Mid-Beach)"
        ],
        "url": "https://www.travelandleisure.com/wba-2024-resorts-greater-miami-8660188"
      },
      "forbes": {
        "label": "Forbes Travel Guide 5-Star",
        "items": [
          "Acqualina Resort & Spa (Sunny Isles Beach)",
          "Faena Hotel Miami Beach (Mid-Beach)",
          "Four Seasons Hotel at The Surf Club (Surfside)",
          "The Ritz-Carlton (South Beach)",
          "The Setai (South Beach)",
          "St. Regis Bal Harbour Resort (Bal Harbour)",
          "Nobu Hotel Miami Beach (Mid-Beach)",
          "The Miami Beach EDITION (Mid-Beach)",
          "1 Hotel South Beach (South Beach)",
          "W South Beach (South Beach)"
        ],
        "url": "https://www.forbestravelguide.com/destinations/miami-florida"
      },
      "tripadvisor": {
        "label": "Tripadvisor Travelers Choice",
        "items": [
          "The Setai (South Beach)",
          "Faena Hotel Miami Beach (Mid-Beach)",
          "Four Seasons Hotel at The Surf Club (Surfside)",
          "1 Hotel South Beach (South Beach)",
          "Acqualina Resort & Spa (Sunny Isles Beach)",
          "The Gabriel South Beach (South Beach)",
          "Nobu Hotel Miami Beach (Mid-Beach)",
          "The Miami Beach EDITION (Mid-Beach)",
          "Loews Miami Beach Hotel (South Beach)",
          "Eden Roc Miami Beach (Mid-Beach)"
        ],
        "url": "https://www.tripadvisor.com/Hotels-g34439-Miami_Beach_Florida-Hotels.html"
      }
    },
    "vote": {
      "items": [
        "Faena Hotel Miami Beach (Mid-Beach)",
        "The Setai (South Beach)",
        "Four Seasons Hotel at The Surf Club (Surfside)",
        "1 Hotel South Beach (South Beach)",
        "Nobu Hotel Miami Beach (Mid-Beach)",
        "The Miami Beach EDITION (Mid-Beach)",
        "St. Regis Bal Harbour Resort (Bal Harbour)",
        "Acqualina Resort & Spa (Sunny Isles Beach)",
        "W South Beach (South Beach)",
        "The Ritz-Carlton (South Beach)"
      ]
    }
  },
  {
    "id": "pacific-ocean-resorts",
    "publishedDate": "2026-05-24",
    "publishedAt": "2026-05-24T11:00:00Z",
    "title": "Best Pacific Ocean Island Resorts",
    "category": "South Pacific",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Four Seasons Resort Bora Bora (French Polynesia)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Resort%20Bora%20Bora%20French%20Polynesia",
      "The St. Regis Bora Bora Resort (French Polynesia)": "https://www.google.com/maps/search/?api=1&query=The%20St.%20Regis%20Bora%20Bora%20Resort%20French%20Polynesia",
      "The Brando (Tetiaroa, French Polynesia)": "https://www.google.com/maps/search/?api=1&query=The%20Brando%20Tetiaroa%20French%20Polynesia",
      "COMO Laucala Island (Fiji)": "https://www.google.com/maps/search/?api=1&query=COMO%20Laucala%20Island%20Fiji",
      "Conrad Bora Bora Nui (French Polynesia)": "https://www.google.com/maps/search/?api=1&query=Conrad%20Bora%20Bora%20Nui%20French%20Polynesia",
      "Kokomo Private Island Fiji (Kadavu, Fiji)": "https://www.google.com/maps/search/?api=1&query=Kokomo%20Private%20Island%20Fiji%20Kadavu%20Fiji",
      "Le Taha'a by Pearl Resorts (French Polynesia)": "https://www.google.com/maps/search/?api=1&query=Le%20Taha%20a%20by%20Pearl%20Resorts%20French%20Polynesia",
      "Six Senses Fiji (Malolo Island, Fiji)": "https://www.google.com/maps/search/?api=1&query=Six%20Senses%20Fiji%20Malolo%20Island%20Fiji",
      "InterContinental Bora Bora Resort & Thalasso Spa (French Polynesia)": "https://www.google.com/maps/search/?api=1&query=InterContinental%20Bora%20Bora%20Resort%20Thalasso%20Spa%20French%20Polynesia",
      "Likuliku Lagoon Resort (Malolo Island, Fiji)": "https://www.google.com/maps/search/?api=1&query=Likuliku%20Lagoon%20Resort%20Malolo%20Island%20Fiji",
      "Wakaya Island Resort (Fiji)": "https://www.google.com/maps/search/?api=1&query=Wakaya%20Island%20Resort%20Fiji",
      "Namale Resort & Spa (Savusavu, Fiji)": "https://www.google.com/maps/search/?api=1&query=Namale%20Resort%20Spa%20Savusavu%20Fiji",
      "Jean-Michel Cousteau Resort (Savusavu, Fiji)": "https://www.google.com/maps/search/?api=1&query=Jean-Michel%20Cousteau%20Resort%20Savusavu%20Fiji",
      "Tokoriki Island Resort (Fiji)": "https://www.google.com/maps/search/?api=1&query=Tokoriki%20Island%20Resort%20Fiji",
      "Royal Davui Island Resort (Fiji)": "https://www.google.com/maps/search/?api=1&query=Royal%20Davui%20Island%20Resort%20Fiji",
      "VOMO Island Resort (Fiji)": "https://www.google.com/maps/search/?api=1&query=VOMO%20Island%20Resort%20Fiji",
      "Nanuku Resort (Pacific Harbour, Fiji)": "https://www.google.com/maps/search/?api=1&query=Nanuku%20Resort%20Pacific%20Harbour%20Fiji",
      "The Westin Bora Bora (French Polynesia)": "https://www.google.com/maps/search/?api=1&query=The%20Westin%20Bora%20Bora%20French%20Polynesia"
    },
    "blurb": "Overwater villas in French Polynesia and private-island sanctuaries in Fiji, from Bora Bora’s lagoons to the Mamanucas, Kadavu, and Vanua Levu. The Pacific’s most coveted luxury island resorts, by consensus.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Four Seasons Resort Bora Bora (French Polynesia)",
          "The St. Regis Bora Bora Resort (French Polynesia)",
          "The Brando (Tetiaroa, French Polynesia)",
          "COMO Laucala Island (Fiji)",
          "Conrad Bora Bora Nui (French Polynesia)",
          "Kokomo Private Island Fiji (Kadavu, Fiji)",
          "Le Taha'a by Pearl Resorts (French Polynesia)",
          "Six Senses Fiji (Malolo Island, Fiji)",
          "InterContinental Bora Bora Resort & Thalasso Spa (French Polynesia)",
          "Likuliku Lagoon Resort (Malolo Island, Fiji)"
        ]
      },
      "cntraveler": {
        "label": "Condé Nast Traveler · Readers’ Choice 2024 (Australia & the South Pacific, Fiji)",
        "url": "https://www.cntraveler.com/readers-choice-awards",
        "items": [
          "Wakaya Island Resort (Fiji)",
          "Namale Resort & Spa (Savusavu, Fiji)",
          "Kokomo Private Island Fiji (Kadavu, Fiji)",
          "Jean-Michel Cousteau Resort (Savusavu, Fiji)",
          "Likuliku Lagoon Resort (Malolo Island, Fiji)",
          "Tokoriki Island Resort (Fiji)",
          "Royal Davui Island Resort (Fiji)",
          "COMO Laucala Island (Fiji)",
          "VOMO Island Resort (Fiji)",
          "Nanuku Resort (Pacific Harbour, Fiji)"
        ]
      },
      "resortscollection": {
        "label": "The Resorts Collection · Best Resorts in Bora Bora 2026",
        "url": "https://theresortscollection.com/best-hotels-resorts-bora-bora/",
        "items": [
          "The St. Regis Bora Bora Resort (French Polynesia)",
          "Four Seasons Resort Bora Bora (French Polynesia)",
          "Conrad Bora Bora Nui (French Polynesia)",
          "The Westin Bora Bora (French Polynesia)",
          "InterContinental Bora Bora Resort & Thalasso Spa (French Polynesia)"
        ]
      },
      "placeswithpalms": {
        "label": "Places With Palms · Best Resorts in French Polynesia 2025 (luxury picks, editorial order)",
        "url": "https://www.placeswithpalms.com/hotels/best-resort-french-polynesia",
        "items": [
          "The Brando (Tetiaroa, French Polynesia)",
          "Le Taha'a by Pearl Resorts (French Polynesia)",
          "Four Seasons Resort Bora Bora (French Polynesia)",
          "The St. Regis Bora Bora Resort (French Polynesia)",
          "Conrad Bora Bora Nui (French Polynesia)",
          "InterContinental Bora Bora Resort & Thalasso Spa (French Polynesia)",
          "The Westin Bora Bora (French Polynesia)"
        ]
      }
    },
    "vote": {
      "items": [
        "Four Seasons Resort Bora Bora (French Polynesia)",
        "The St. Regis Bora Bora Resort (French Polynesia)",
        "The Brando (Tetiaroa, French Polynesia)",
        "COMO Laucala Island (Fiji)",
        "Conrad Bora Bora Nui (French Polynesia)",
        "Kokomo Private Island Fiji (Kadavu, Fiji)",
        "Le Taha'a by Pearl Resorts (French Polynesia)",
        "Six Senses Fiji (Malolo Island, Fiji)",
        "Likuliku Lagoon Resort (Malolo Island, Fiji)",
        "Wakaya Island Resort (Fiji)"
      ]
    }
  },
  {
    "id": "cabo-hotels",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T11:18:46Z",
    "title": "Best Cabo San Lucas Hotels",
    "category": "Cabo San Lucas",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "One&Only Palmilla (San José del Cabo)": "https://www.google.com/maps/search/?api=1&query=One%20Only%20Palmilla%20San%20Jos%C3%A9%20del%20Cabo%20Los%20Cabos%20Mexico",
      "Esperanza, Auberge Resorts Collection (Cabo San Lucas)": "https://www.google.com/maps/search/?api=1&query=Esperanza%20Auberge%20Resorts%20Collection%20Cabo%20San%20Lucas%20Los%20Cabos%20Mexico",
      "Waldorf Astoria Los Cabos Pedregal (Cabo San Lucas)": "https://www.google.com/maps/search/?api=1&query=Waldorf%20Astoria%20Los%20Cabos%20Pedregal%20Cabo%20San%20Lucas%20Los%20Cabos%20Mexico",
      "Las Ventanas al Paraíso, a Rosewood Resort (Tourist Corridor)": "https://www.google.com/maps/search/?api=1&query=Las%20Ventanas%20al%20Para%C3%ADso%20a%20Rosewood%20Resort%20Tourist%20Corridor%20Los%20Cabos%20Mexico",
      "Chileno Bay Resort, Auberge Resorts Collection (Tourist Corridor)": "https://www.google.com/maps/search/?api=1&query=Chileno%20Bay%20Resort%20Auberge%20Resorts%20Collection%20Tourist%20Corridor%20Los%20Cabos%20Mexico",
      "Grand Velas Los Cabos (Tourist Corridor)": "https://www.google.com/maps/search/?api=1&query=Grand%20Velas%20Los%20Cabos%20Tourist%20Corridor%20Los%20Cabos%20Mexico",
      "Montage Los Cabos (Tourist Corridor)": "https://www.google.com/maps/search/?api=1&query=Montage%20Los%20Cabos%20Tourist%20Corridor%20Los%20Cabos%20Mexico",
      "The Cape, a Thompson Hotel (Cabo San Lucas)": "https://www.google.com/maps/search/?api=1&query=The%20Cape%20a%20Thompson%20Hotel%20Cabo%20San%20Lucas%20Los%20Cabos%20Mexico",
      "JW Marriott Los Cabos Beach Resort & Spa (San José del Cabo)": "https://www.google.com/maps/search/?api=1&query=JW%20Marriott%20Los%20Cabos%20Beach%20Resort%20Spa%20San%20Jos%C3%A9%20del%20Cabo%20Los%20Cabos%20Mexico",
      "Hacienda Beach Club & Residences (Cabo San Lucas)": "https://www.google.com/maps/search/?api=1&query=Hacienda%20Beach%20Club%20Residences%20Cabo%20San%20Lucas%20Los%20Cabos%20Mexico",
      "Secrets Puerto Los Cabos (San José del Cabo)": "https://www.google.com/maps/search/?api=1&query=Secrets%20Puerto%20Los%20Cabos%20San%20Jos%C3%A9%20del%20Cabo%20Los%20Cabos%20Mexico",
      "Montecristo Estates Luxury Villas (Cabo San Lucas)": "https://www.google.com/maps/search/?api=1&query=Montecristo%20Estates%20Luxury%20Villas%20Cabo%20San%20Lucas%20Los%20Cabos%20Mexico",
      "Viceroy Los Cabos (San José del Cabo)": "https://www.google.com/maps/search/?api=1&query=Viceroy%20Los%20Cabos%20San%20Jos%C3%A9%20del%20Cabo%20Los%20Cabos%20Mexico",
      "Le Blanc Spa Resort Los Cabos (Tourist Corridor)": "https://www.google.com/maps/search/?api=1&query=Le%20Blanc%20Spa%20Resort%20Los%20Cabos%20Tourist%20Corridor%20Los%20Cabos%20Mexico",
      "Four Seasons Resort Cabo San Lucas at Cabo Del Sol (Tourist Corridor)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Resort%20Cabo%20San%20Lucas%20at%20Cabo%20Del%20Sol%20Tourist%20Corridor%20Los%20Cabos%20Mexico",
      "Zadún, a Ritz-Carlton Reserve (San José del Cabo)": "https://www.google.com/maps/search/?api=1&query=Zad%C3%BAn%20a%20Ritz-Carlton%20Reserve%20San%20Jos%C3%A9%20del%20Cabo%20Los%20Cabos%20Mexico",
      "Pueblo Bonito Pacifica Golf & Spa Resort (Cabo San Lucas)": "https://www.google.com/maps/search/?api=1&query=Pueblo%20Bonito%20Pacifica%20Golf%20Spa%20Resort%20Cabo%20San%20Lucas%20Los%20Cabos%20Mexico",
      "Solaz, a Luxury Collection Resort (Tourist Corridor)": "https://www.google.com/maps/search/?api=1&query=Solaz%20a%20Luxury%20Collection%20Resort%20Tourist%20Corridor%20Los%20Cabos%20Mexico",
      "Four Seasons Resort Los Cabos at Costa Palmas (East Cape)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Resort%20Los%20Cabos%20at%20Costa%20Palmas%20East%20Cape%20Los%20Cabos%20Mexico",
      "Pueblo Bonito Sunset Beach Golf & Spa Resort (Cabo San Lucas)": "https://www.google.com/maps/search/?api=1&query=Pueblo%20Bonito%20Sunset%20Beach%20Golf%20Spa%20Resort%20Cabo%20San%20Lucas%20Los%20Cabos%20Mexico",
      "Amanvari (East Cape)": "https://www.google.com/maps/search/?api=1&query=Amanvari%20East%20Cape%20Los%20Cabos%20Mexico",
      "Marquis Los Cabos (Tourist Corridor)": "https://www.google.com/maps/search/?api=1&query=Marquis%20Los%20Cabos%20Tourist%20Corridor%20Los%20Cabos%20Mexico",
      "Nobu Hotel Los Cabos (Tourist Corridor)": "https://www.google.com/maps/search/?api=1&query=Nobu%20Hotel%20Los%20Cabos%20Tourist%20Corridor%20Los%20Cabos%20Mexico"
    },
    "blurb": "Cliffside suites, Corridor beach resorts, and Pedregal hideaways: the Los Cabos hotels that top the luxury rankings.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Esperanza, Auberge Resorts Collection (Cabo San Lucas)",
          "Waldorf Astoria Los Cabos Pedregal (Cabo San Lucas)",
          "One&Only Palmilla (San José del Cabo)",
          "Las Ventanas al Paraíso, a Rosewood Resort (Tourist Corridor)",
          "Chileno Bay Resort, Auberge Resorts Collection (Tourist Corridor)",
          "Four Seasons Resort Cabo San Lucas at Cabo Del Sol (Tourist Corridor)",
          "Four Seasons Resort Los Cabos at Costa Palmas (East Cape)",
          "Zadún, a Ritz-Carlton Reserve (San José del Cabo)",
          "Grand Velas Los Cabos (Tourist Corridor)",
          "Montage Los Cabos (Tourist Corridor)"
        ]
      },
      "oyster": {
        "label": "Oyster · 14 Best Luxury Hotels in Los Cabos",
        "url": "https://www.oyster.com/los-cabos/hotels/roundups/best-luxury-hotels-in-los-cabos/",
        "items": [
          "One&Only Palmilla (San José del Cabo)",
          "Esperanza, Auberge Resorts Collection (Cabo San Lucas)",
          "Waldorf Astoria Los Cabos Pedregal (Cabo San Lucas)",
          "Las Ventanas al Paraíso, a Rosewood Resort (Tourist Corridor)",
          "Chileno Bay Resort, Auberge Resorts Collection (Tourist Corridor)",
          "Grand Velas Los Cabos (Tourist Corridor)",
          "Montage Los Cabos (Tourist Corridor)",
          "The Cape, a Thompson Hotel (Cabo San Lucas)",
          "JW Marriott Los Cabos Beach Resort & Spa (San José del Cabo)",
          "Hacienda Beach Club & Residences (Cabo San Lucas)",
          "Secrets Puerto Los Cabos (San José del Cabo)",
          "Montecristo Estates Luxury Villas (Cabo San Lucas)",
          "Viceroy Los Cabos (San José del Cabo)",
          "Le Blanc Spa Resort Los Cabos (Tourist Corridor)"
        ]
      },
      "cnt": {
        "label": "Condé Nast Traveler · Readers' Choice 2025 (Western Mexico)",
        "url": "https://www.cntraveler.com/gallery/mexico-western-top-resorts",
        "items": [
          "Waldorf Astoria Los Cabos Pedregal (Cabo San Lucas)",
          "Chileno Bay Resort, Auberge Resorts Collection (Tourist Corridor)",
          "Viceroy Los Cabos (San José del Cabo)",
          "Esperanza, Auberge Resorts Collection (Cabo San Lucas)",
          "Four Seasons Resort Cabo San Lucas at Cabo Del Sol (Tourist Corridor)",
          "The Cape, a Thompson Hotel (Cabo San Lucas)",
          "One&Only Palmilla (San José del Cabo)",
          "Las Ventanas al Paraíso, a Rosewood Resort (Tourist Corridor)",
          "Zadún, a Ritz-Carlton Reserve (San José del Cabo)",
          "Pueblo Bonito Pacifica Golf & Spa Resort (Cabo San Lucas)",
          "Solaz, a Luxury Collection Resort (Tourist Corridor)",
          "Four Seasons Resort Los Cabos at Costa Palmas (East Cape)",
          "Pueblo Bonito Sunset Beach Golf & Spa Resort (Cabo San Lucas)"
        ]
      },
      "ltd": {
        "label": "Luxury Travel Diary · Best Luxury Hotels in Los Cabos 2025",
        "url": "https://www.luxurytraveldiary.com/2025/07/top-10-best-luxury-hotels-in-los-cabos-mexico/",
        "items": [
          "Four Seasons Resort Cabo San Lucas at Cabo Del Sol (Tourist Corridor)",
          "Four Seasons Resort Los Cabos at Costa Palmas (East Cape)",
          "Amanvari (East Cape)",
          "Las Ventanas al Paraíso, a Rosewood Resort (Tourist Corridor)",
          "Esperanza, Auberge Resorts Collection (Cabo San Lucas)",
          "One&Only Palmilla (San José del Cabo)",
          "Zadún, a Ritz-Carlton Reserve (San José del Cabo)",
          "Waldorf Astoria Los Cabos Pedregal (Cabo San Lucas)",
          "The Cape, a Thompson Hotel (Cabo San Lucas)",
          "Montage Los Cabos (Tourist Corridor)",
          "Grand Velas Los Cabos (Tourist Corridor)"
        ]
      },
      "mnd": {
        "label": "Mexico News Daily · Best Hotels in Los Cabos 2025 (AAA/Forbes/TripAdvisor) (unranked)",
        "url": "https://mexiconewsdaily.com/travel/what-are-the-best-hotels-in-los-cabos-in-2025/",
        "items": [
          "Four Seasons Resort Los Cabos at Costa Palmas (East Cape)",
          "Grand Velas Los Cabos (Tourist Corridor)",
          "Las Ventanas al Paraíso, a Rosewood Resort (Tourist Corridor)",
          "Le Blanc Spa Resort Los Cabos (Tourist Corridor)",
          "Montage Los Cabos (Tourist Corridor)",
          "One&Only Palmilla (San José del Cabo)",
          "Waldorf Astoria Los Cabos Pedregal (Cabo San Lucas)",
          "Zadún, a Ritz-Carlton Reserve (San José del Cabo)",
          "Chileno Bay Resort, Auberge Resorts Collection (Tourist Corridor)",
          "Esperanza, Auberge Resorts Collection (Cabo San Lucas)",
          "Marquis Los Cabos (Tourist Corridor)",
          "Nobu Hotel Los Cabos (Tourist Corridor)"
        ],
        "unordered": true
      }
    },
    "vote": {
      "items": [
        "Esperanza, Auberge Resorts Collection (Cabo San Lucas)",
        "Waldorf Astoria Los Cabos Pedregal (Cabo San Lucas)",
        "One&Only Palmilla (San José del Cabo)",
        "Las Ventanas al Paraíso, a Rosewood Resort (Tourist Corridor)",
        "Chileno Bay Resort, Auberge Resorts Collection (Tourist Corridor)",
        "Four Seasons Resort Cabo San Lucas at Cabo Del Sol (Tourist Corridor)",
        "Four Seasons Resort Los Cabos at Costa Palmas (East Cape)",
        "Zadún, a Ritz-Carlton Reserve (San José del Cabo)",
        "Grand Velas Los Cabos (Tourist Corridor)",
        "Montage Los Cabos (Tourist Corridor)"
      ]
    }
  },
  {
    "id": "european-ski-resorts",
    "publishedDate": "2026-05-25",
    "publishedAt": "2026-05-25T09:00:00Z",
    "title": "Best European Ski Resorts",
    "category": "Alps",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "entertainment",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Verbier (Valais, Switzerland)": "https://www.google.com/maps/search/?api=1&query=Verbier%20Valais%20Switzerland",
      "Zermatt (Valais, Switzerland)": "https://www.google.com/maps/search/?api=1&query=Zermatt%20Valais%20Switzerland",
      "St. Moritz (Graubünden, Switzerland)": "https://www.google.com/maps/search/?api=1&query=St.%20Moritz%20Graub%C3%BCnden%20Switzerland",
      "Courchevel (Savoie, France)": "https://www.google.com/maps/search/?api=1&query=Courchevel%20Savoie%20France",
      "Val d'Isère (Savoie, France)": "https://www.google.com/maps/search/?api=1&query=Val%20d%20Is%C3%A8re%20Savoie%20France",
      "Cortina d'Ampezzo (Veneto, Italy)": "https://www.google.com/maps/search/?api=1&query=Cortina%20d%20Ampezzo%20Veneto%20Italy",
      "Chamonix-Mont Blanc (Haute-Savoie, France)": "https://www.google.com/maps/search/?api=1&query=Chamonix-Mont%20Blanc%20Haute-Savoie%20France",
      "Kitzbühel (Tyrol, Austria)": "https://www.google.com/maps/search/?api=1&query=Kitzb%C3%BChel%20Tyrol%20Austria",
      "Val Thorens (Savoie, France)": "https://www.google.com/maps/search/?api=1&query=Val%20Thorens%20Savoie%20France",
      "Gstaad (Bernese Oberland, Switzerland)": "https://www.google.com/maps/search/?api=1&query=Gstaad%20Bernese%20Oberland%20Switzerland",
      "Levi (Lapland, Finland)": "https://www.google.com/maps/search/?api=1&query=Levi%20Lapland%20Finland",
      "Crans-Montana (Valais, Switzerland)": "https://www.google.com/maps/search/?api=1&query=Crans-Montana%20Valais%20Switzerland",
      "Innsbruck (Tyrol, Austria)": "https://www.google.com/maps/search/?api=1&query=Innsbruck%20Tyrol%20Austria",
      "Corvara - Alta Badia (South Tyrol, Italy)": "https://www.google.com/maps/search/?api=1&query=Corvara%20-%20Alta%20Badia%20South%20Tyrol%20Italy",
      "Arosa Lenzerheide (Graubünden, Switzerland)": "https://www.google.com/maps/search/?api=1&query=Arosa%20Lenzerheide%20Graub%C3%BCnden%20Switzerland",
      "Sölden (Tyrol, Austria)": "https://www.google.com/maps/search/?api=1&query=S%C3%B6lden%20Tyrol%20Austria",
      "SkiWelt Wilder Kaiser-Brixental (Tyrol, Austria)": "https://www.google.com/maps/search/?api=1&query=SkiWelt%20Wilder%20Kaiser-Brixental%20Tyrol%20Austria",
      "Saalbach Hinterglemm Leogang Fieberbrunn (Salzburg, Austria)": "https://www.google.com/maps/search/?api=1&query=Saalbach%20Hinterglemm%20Leogang%20Fieberbrunn%20Salzburg%20Austria",
      "St. Anton am Arlberg (Tyrol, Austria)": "https://www.google.com/maps/search/?api=1&query=St.%20Anton%20am%20Arlberg%20Tyrol%20Austria",
      "Val Gardena (South Tyrol, Italy)": "https://www.google.com/maps/search/?api=1&query=Val%20Gardena%20South%20Tyrol%20Italy",
      "Lech (Vorarlberg, Austria)": "https://www.google.com/maps/search/?api=1&query=Lech%20Vorarlberg%20Austria"
    },
    "blurb": "From Verbier glamour to Zermatt views to the Dolomites. Where the lifts are long and the apres-ski is legendary.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Verbier (Valais, Switzerland)",
          "Zermatt (Valais, Switzerland)",
          "St. Moritz (Graubünden, Switzerland)",
          "Courchevel (Savoie, France)",
          "Val d'Isère (Savoie, France)",
          "Cortina d'Ampezzo (Veneto, Italy)",
          "Chamonix-Mont Blanc (Haute-Savoie, France)",
          "Kitzbühel (Tyrol, Austria)",
          "Val Thorens (Savoie, France)",
          "Gstaad (Bernese Oberland, Switzerland)"
        ]
      },
      "cntraveler": {
        "label": "Conde Nast Traveler Readers Choice 2025",
        "items": [
          "Verbier (Valais, Switzerland)",
          "Zermatt (Valais, Switzerland)",
          "St. Moritz (Graubünden, Switzerland)",
          "Courchevel (Savoie, France)",
          "Cortina d'Ampezzo (Veneto, Italy)",
          "Levi (Lapland, Finland)",
          "Crans-Montana (Valais, Switzerland)",
          "Val d'Isère (Savoie, France)",
          "Innsbruck (Tyrol, Austria)",
          "Corvara - Alta Badia (South Tyrol, Italy)"
        ],
        "url": "https://www.cntraveler.com/galleries/2015-01-06/best-ski-resorts-in-europe-alps-readers-choice-awards-2014"
      },
      "timeout": {
        "label": "Time Out · Omio Data",
        "items": [
          "Arosa Lenzerheide (Graubünden, Switzerland)",
          "Sölden (Tyrol, Austria)",
          "SkiWelt Wilder Kaiser-Brixental (Tyrol, Austria)",
          "Saalbach Hinterglemm Leogang Fieberbrunn (Salzburg, Austria)",
          "Zermatt (Valais, Switzerland)",
          "Val Thorens (Savoie, France)",
          "Chamonix-Mont Blanc (Haute-Savoie, France)",
          "Kitzbühel (Tyrol, Austria)",
          "St. Anton am Arlberg (Tyrol, Austria)",
          "Val Gardena (South Tyrol, Italy)"
        ],
        "url": "https://www.timeout.com/news/this-european-ski-resort-has-been-crowned-the-best-in-the-world-101824"
      },
      "worldskiawards": {
        "label": "World Ski Awards",
        "items": [
          "Val Thorens (Savoie, France)",
          "Zermatt (Valais, Switzerland)",
          "Verbier (Valais, Switzerland)",
          "St. Anton am Arlberg (Tyrol, Austria)",
          "Courchevel (Savoie, France)",
          "Chamonix-Mont Blanc (Haute-Savoie, France)",
          "Kitzbühel (Tyrol, Austria)",
          "Val d'Isère (Savoie, France)",
          "Cortina d'Ampezzo (Veneto, Italy)",
          "Lech (Vorarlberg, Austria)"
        ],
        "url": "https://worldskiawards.com/winners/2025"
      }
    },
    "vote": {
      "items": [
        "Verbier (Valais, Switzerland)",
        "Zermatt (Valais, Switzerland)",
        "Chamonix-Mont Blanc (Haute-Savoie, France)",
        "St. Moritz (Graubünden, Switzerland)",
        "Courchevel (Savoie, France)",
        "Val d'Isère (Savoie, France)",
        "Cortina d'Ampezzo (Veneto, Italy)",
        "Kitzbühel (Tyrol, Austria)",
        "St. Anton am Arlberg (Tyrol, Austria)",
        "Val Thorens (Savoie, France)"
      ]
    }
  },
  {
    "id": "greek-isles-hotels",
    "publishedDate": "2026-05-25",
    "publishedAt": "2026-05-25T10:00:00Z",
    "title": "Best Hotels in the Greek Isles",
    "category": "Greek Islands",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Perivolas (Oia, Santorini)": "https://www.google.com/maps/search/?api=1&query=Perivolas%20Oia%20Santorini",
      "Grace Hotel Santorini, Auberge Resorts Collection (Imerovigli, Santorini)": "https://www.google.com/maps/search/?api=1&query=Grace%20Hotel%20Santorini%20Auberge%20Resorts%20Collection%20Imerovigli%20Santorini",
      "Kalesma Mykonos (Aleomandra, Mykonos)": "https://www.google.com/maps/search/?api=1&query=Kalesma%20Mykonos%20Aleomandra%20Mykonos",
      "Cavo Tagoo Mykonos (Tagoo, Mykonos)": "https://www.google.com/maps/search/?api=1&query=Cavo%20Tagoo%20Mykonos%20Tagoo%20Mykonos",
      "Bill & Coo Mykonos (Megali Ammos, Mykonos)": "https://www.google.com/maps/search/?api=1&query=Bill%20Coo%20Mykonos%20Megali%20Ammos%20Mykonos",
      "Kivotos Santorini (Imerovigli, Santorini)": "https://www.google.com/maps/search/?api=1&query=Kivotos%20Santorini%20Imerovigli%20Santorini",
      "Mystique, a Luxury Collection Hotel (Oia, Santorini)": "https://www.google.com/maps/search/?api=1&query=Mystique%20a%20Luxury%20Collection%20Hotel%20Oia%20Santorini",
      "Myconian Naia (Mykonos Town, Mykonos)": "https://www.google.com/maps/search/?api=1&query=Myconian%20Naia%20Mykonos%20Town%20Mykonos",
      "Canaves Oia (Oia, Santorini)": "https://www.google.com/maps/search/?api=1&query=Canaves%20Oia%20Oia%20Santorini",
      "Santa Marina, a Luxury Collection Resort (Ornos, Mykonos)": "https://www.google.com/maps/search/?api=1&query=Santa%20Marina%20a%20Luxury%20Collection%20Resort%20Ornos%20Mykonos",
      "Voreina Gallery Suites Santorini (Pyrgos, Santorini)": "https://www.google.com/maps/search/?api=1&query=Voreina%20Gallery%20Suites%20Santorini%20Pyrgos%20Santorini",
      "Kove Mykonos (Ornos, Mykonos)": "https://www.google.com/maps/search/?api=1&query=Kove%20Mykonos%20Ornos%20Mykonos",
      "Anemelia Mykonos (Elia, Mykonos)": "https://www.google.com/maps/search/?api=1&query=Anemelia%20Mykonos%20Elia%20Mykonos",
      "Mystique (Oia, Santorini)": "https://www.google.com/maps/search/?api=1&query=Mystique%20Oia%20Santorini",
      "Aeonic Suites and Spa (Ornos, Mykonos)": "https://www.google.com/maps/search/?api=1&query=Aeonic%20Suites%20and%20Spa%20Ornos%20Mykonos",
      "Santa Marina (Ornos, Mykonos)": "https://www.google.com/maps/search/?api=1&query=Santa%20Marina%20Ornos%20Mykonos",
      "Panoptis Escape (Elia, Mykonos)": "https://www.google.com/maps/search/?api=1&query=Panoptis%20Escape%20Elia%20Mykonos",
      "Aristide Hotel (Ermoupoli, Syros)": "https://www.google.com/maps/search/?api=1&query=Aristide%20Hotel%20Ermoupoli%20Syros",
      "Odera Hotel (Kionia, Tinos)": "https://www.google.com/maps/search/?api=1&query=Odera%20Hotel%20Kionia%20Tinos"
    },
    "blurb": "Cave suites in Oia, Cycladic whitewash in Mykonos, and the boutique hideouts that earn the Aegean its reputation.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Perivolas (Oia, Santorini)",
          "Grace Hotel Santorini, Auberge Resorts Collection (Imerovigli, Santorini)",
          "Kalesma Mykonos (Aleomandra, Mykonos)",
          "Cavo Tagoo Mykonos (Tagoo, Mykonos)",
          "Bill & Coo Mykonos (Megali Ammos, Mykonos)",
          "Kivotos Santorini (Imerovigli, Santorini)",
          "Mystique, a Luxury Collection Hotel (Oia, Santorini)",
          "Myconian Naia (Mykonos Town, Mykonos)",
          "Canaves Oia (Oia, Santorini)",
          "Santa Marina, a Luxury Collection Resort (Ornos, Mykonos)"
        ]
      },
      "timeout": {
        "label": "Time Out Greece",
        "items": [
          "Kivotos Santorini (Imerovigli, Santorini)",
          "Grace Hotel Santorini, Auberge Resorts Collection (Imerovigli, Santorini)",
          "Voreina Gallery Suites Santorini (Pyrgos, Santorini)",
          "Kalesma Mykonos (Aleomandra, Mykonos)",
          "Kove Mykonos (Ornos, Mykonos)",
          "Anemelia Mykonos (Elia, Mykonos)",
          "Perivolas (Oia, Santorini)",
          "Mystique (Oia, Santorini)",
          "Canaves Oia (Oia, Santorini)",
          "Bill & Coo Mykonos (Megali Ammos, Mykonos)"
        ],
        "url": "https://www.timeout.com/greece/hotels/best-hotels-in-greece"
      },
      "trip": {
        "label": "Trip.com Luxury Rankings",
        "items": [
          "Kalesma Mykonos (Aleomandra, Mykonos)",
          "Aeonic Suites and Spa (Ornos, Mykonos)",
          "Myconian Naia (Mykonos Town, Mykonos)",
          "Cavo Tagoo Mykonos (Tagoo, Mykonos)",
          "Mystique (Oia, Santorini)",
          "Grace Hotel Santorini, Auberge Resorts Collection (Imerovigli, Santorini)",
          "Canaves Oia (Oia, Santorini)",
          "Bill & Coo Mykonos (Megali Ammos, Mykonos)",
          "Santa Marina (Ornos, Mykonos)",
          "Perivolas (Oia, Santorini)"
        ],
        "url": "https://www.trip.com/toplist/tripbest/greece-best-luxury-hotels-100200444874/"
      },
      "findus": {
        "label": "Find Us Lost Editor Picks",
        "items": [
          "Perivolas (Oia, Santorini)",
          "Panoptis Escape (Elia, Mykonos)",
          "Aristide Hotel (Ermoupoli, Syros)",
          "Odera Hotel (Kionia, Tinos)",
          "Kalesma Mykonos (Aleomandra, Mykonos)",
          "Canaves Oia (Oia, Santorini)",
          "Mystique (Oia, Santorini)",
          "Grace Hotel Santorini, Auberge Resorts Collection (Imerovigli, Santorini)",
          "Bill & Coo Mykonos (Megali Ammos, Mykonos)",
          "Cavo Tagoo Mykonos (Tagoo, Mykonos)"
        ],
        "url": "https://finduslost.com/best-hotels-in-greece/"
      }
    },
    "vote": {
      "items": [
        "Perivolas (Oia, Santorini)",
        "Kalesma Mykonos (Aleomandra, Mykonos)",
        "Mystique (Oia, Santorini)",
        "Bill & Coo Mykonos (Megali Ammos, Mykonos)",
        "Canaves Oia (Oia, Santorini)",
        "Cavo Tagoo Mykonos (Tagoo, Mykonos)",
        "Grace Hotel Santorini, Auberge Resorts Collection (Imerovigli, Santorini)",
        "Santa Marina (Ornos, Mykonos)",
        "Kivotos Santorini (Imerovigli, Santorini)",
        "Myconian Naia (Mykonos Town, Mykonos)"
      ]
    }
  },
  {
    "id": "boston-hotels",
    "publishedDate": "2026-05-26",
    "publishedAt": "2026-05-26T09:00:00Z",
    "title": "Best Boston Hotels",
    "category": "Boston",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Mandarin Oriental Boston (Back Bay)": "https://www.google.com/maps/search/?api=1&query=Mandarin%20Oriental%20Boston%20Back%20Bay",
      "InterContinental Boston (Waterfront)": "https://www.google.com/maps/search/?api=1&query=InterContinental%20Boston%20Waterfront",
      "Four Seasons Hotel Boston (Back Bay)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Hotel%20Boston%20Back%20Bay",
      "The Ritz-Carlton Boston (Theater District)": "https://www.google.com/maps/search/?api=1&query=The%20Ritz-Carlton%20Boston%20Theater%20District",
      "Raffles Boston (Back Bay)": "https://www.google.com/maps/search/?api=1&query=Raffles%20Boston%20Back%20Bay",
      "The Newbury Boston (Back Bay)": "https://www.google.com/maps/search/?api=1&query=The%20Newbury%20Boston%20Back%20Bay",
      "Boston Harbor Hotel (Waterfront)": "https://www.google.com/maps/search/?api=1&query=Boston%20Harbor%20Hotel%20Waterfront",
      "The Langham Boston (Financial District)": "https://www.google.com/maps/search/?api=1&query=The%20Langham%20Boston%20Financial%20District",
      "Hotel AKA Boston Common (Downtown Crossing)": "https://www.google.com/maps/search/?api=1&query=Hotel%20AKA%20Boston%20Common%20Downtown%20Crossing",
      "XV Beacon (Beacon Hill)": "https://www.google.com/maps/search/?api=1&query=XV%20Beacon%20Beacon%20Hill",
      "Four Seasons Hotel One Dalton Street (Back Bay)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Hotel%20One%20Dalton%20Street%20Back%20Bay",
      "Hyatt Regency Boston (Downtown Crossing)": "https://www.google.com/maps/search/?api=1&query=Hyatt%20Regency%20Boston%20Downtown%20Crossing"
    },
    "blurb": "Back Bay luxury at Mandarin Oriental, harbor views at InterContinental, Public Garden frontage at Four Seasons. The hotels that anchor a city built on bricks and history.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Mandarin Oriental Boston (Back Bay)",
          "InterContinental Boston (Waterfront)",
          "Four Seasons Hotel Boston (Back Bay)",
          "The Ritz-Carlton Boston (Theater District)",
          "Raffles Boston (Back Bay)",
          "The Newbury Boston (Back Bay)",
          "Boston Harbor Hotel (Waterfront)",
          "The Langham Boston (Financial District)",
          "Hotel AKA Boston Common (Downtown Crossing)",
          "XV Beacon (Beacon Hill)"
        ]
      },
      "usnews": {
        "label": "U.S. News 25 Best 2026",
        "items": [
          "Mandarin Oriental Boston (Back Bay)",
          "Four Seasons Hotel Boston (Back Bay)",
          "The Ritz-Carlton Boston (Theater District)",
          "Raffles Boston (Back Bay)",
          "The Newbury Boston (Back Bay)",
          "Boston Harbor Hotel (Waterfront)",
          "InterContinental Boston (Waterfront)",
          "XV Beacon (Beacon Hill)",
          "The Langham Boston (Financial District)",
          "Four Seasons Hotel One Dalton Street (Back Bay)"
        ],
        "url": "https://travel.usnews.com/hotels/boston_ma/"
      },
      "cntraveler": {
        "label": "Conde Nast Readers' Choice",
        "items": [
          "InterContinental Boston (Waterfront)",
          "Mandarin Oriental Boston (Back Bay)",
          "Hotel AKA Boston Common (Downtown Crossing)",
          "Hyatt Regency Boston (Downtown Crossing)",
          "Four Seasons Hotel Boston (Back Bay)",
          "The Ritz-Carlton Boston (Theater District)",
          "The Langham Boston (Financial District)",
          "Boston Harbor Hotel (Waterfront)",
          "Raffles Boston (Back Bay)",
          "The Newbury Boston (Back Bay)"
        ],
        "url": "https://www.cntraveler.com/gallery/best-hotels-in-boston"
      },
      "forbes": {
        "label": "Forbes Travel Guide",
        "items": [
          "Mandarin Oriental Boston (Back Bay)",
          "Four Seasons Hotel Boston (Back Bay)",
          "The Ritz-Carlton Boston (Theater District)",
          "Boston Harbor Hotel (Waterfront)",
          "The Langham Boston (Financial District)",
          "Raffles Boston (Back Bay)",
          "The Newbury Boston (Back Bay)",
          "InterContinental Boston (Waterfront)",
          "Four Seasons Hotel One Dalton Street (Back Bay)",
          "XV Beacon (Beacon Hill)"
        ],
        "url": "https://www.forbestravelguide.com/destinations/boston-massachusetts"
      }
    },
    "vote": {
      "items": [
        "Mandarin Oriental Boston (Back Bay)",
        "Four Seasons Hotel Boston (Back Bay)",
        "InterContinental Boston (Waterfront)",
        "The Ritz-Carlton Boston (Theater District)",
        "Raffles Boston (Back Bay)",
        "The Newbury Boston (Back Bay)",
        "Boston Harbor Hotel (Waterfront)",
        "The Langham Boston (Financial District)",
        "XV Beacon (Beacon Hill)",
        "Hotel AKA Boston Common (Downtown Crossing)"
      ]
    }
  },
  {
    "id": "vegas-casino-hotels",
    "publishedDate": "2026-05-25",
    "publishedAt": "2026-05-25T11:00:00Z",
    "title": "Best Hotel Casinos in Las Vegas",
    "category": "Las Vegas",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "entertainment",
      "nightlife",
      "bars",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Wynn Las Vegas (North Strip)": "https://www.google.com/maps/search/?api=1&query=Wynn%20Las%20Vegas%20North%20Strip",
      "Bellagio (Center Strip)": "https://www.google.com/maps/search/?api=1&query=Bellagio%20Center%20Strip",
      "The Venetian Resort Las Vegas (Center Strip)": "https://www.google.com/maps/search/?api=1&query=The%20Venetian%20Resort%20Las%20Vegas%20Center%20Strip",
      "Encore at Wynn Las Vegas (North Strip)": "https://www.google.com/maps/search/?api=1&query=Encore%20at%20Wynn%20Las%20Vegas%20North%20Strip",
      "Aria Resort & Casino (Center Strip)": "https://www.google.com/maps/search/?api=1&query=Aria%20Resort%20Casino%20Center%20Strip",
      "The Cosmopolitan of Las Vegas (Center Strip)": "https://www.google.com/maps/search/?api=1&query=The%20Cosmopolitan%20of%20Las%20Vegas%20Center%20Strip",
      "Caesars Palace (Center Strip)": "https://www.google.com/maps/search/?api=1&query=Caesars%20Palace%20Center%20Strip",
      "Fontainebleau Las Vegas (North Strip)": "https://www.google.com/maps/search/?api=1&query=Fontainebleau%20Las%20Vegas%20North%20Strip",
      "MGM Grand (South Strip)": "https://www.google.com/maps/search/?api=1&query=MGM%20Grand%20South%20Strip",
      "Resorts World Las Vegas (North Strip)": "https://www.google.com/maps/search/?api=1&query=Resorts%20World%20Las%20Vegas%20North%20Strip",
      "Four Seasons Hotel Las Vegas (South Strip)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Hotel%20Las%20Vegas%20South%20Strip",
      "Mandalay Bay (South Strip)": "https://www.google.com/maps/search/?api=1&query=Mandalay%20Bay%20South%20Strip",
      "Vdara Hotel & Spa (Center Strip)": "https://www.google.com/maps/search/?api=1&query=Vdara%20Hotel%20Spa%20Center%20Strip",
      "Waldorf Astoria Las Vegas (Center Strip)": "https://www.google.com/maps/search/?api=1&query=Waldorf%20Astoria%20Las%20Vegas%20Center%20Strip",
      "NoMad Las Vegas (Center Strip)": "https://www.google.com/maps/search/?api=1&query=NoMad%20Las%20Vegas%20Center%20Strip",
      "Aria Sky Suites (Center Strip)": "https://www.google.com/maps/search/?api=1&query=Aria%20Sky%20Suites%20Center%20Strip",
      "Skylofts at MGM Grand (South Strip)": "https://www.google.com/maps/search/?api=1&query=Skylofts%20at%20MGM%20Grand%20South%20Strip"
    },
    "blurb": "The Strip's heaviest hitters, where the fountains dance, the suites overlook the desert, and the casino floors never close.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Wynn Las Vegas (North Strip)",
          "Bellagio (Center Strip)",
          "The Venetian Resort Las Vegas (Center Strip)",
          "Encore at Wynn Las Vegas (North Strip)",
          "Aria Resort & Casino (Center Strip)",
          "The Cosmopolitan of Las Vegas (Center Strip)",
          "Caesars Palace (Center Strip)",
          "Fontainebleau Las Vegas (North Strip)",
          "MGM Grand (South Strip)",
          "Resorts World Las Vegas (North Strip)"
        ]
      },
      "tlleisure": {
        "label": "Travel + Leisure World's Best",
        "items": [
          "Wynn Las Vegas (North Strip)",
          "Bellagio (Center Strip)",
          "Encore at Wynn Las Vegas (North Strip)",
          "The Venetian Resort Las Vegas (Center Strip)",
          "Four Seasons Hotel Las Vegas (South Strip)",
          "Aria Resort & Casino (Center Strip)",
          "The Cosmopolitan of Las Vegas (Center Strip)",
          "Mandalay Bay (South Strip)",
          "Caesars Palace (Center Strip)",
          "Resorts World Las Vegas (North Strip)"
        ],
        "url": "https://www.travelandleisure.com/worlds-best-awards-2025-hotels-las-vegas-11736562"
      },
      "usnews": {
        "label": "U.S. News Best Hotels",
        "items": [
          "Wynn Las Vegas (North Strip)",
          "Bellagio (Center Strip)",
          "The Venetian Resort Las Vegas (Center Strip)",
          "Aria Resort & Casino (Center Strip)",
          "Four Seasons Hotel Las Vegas (South Strip)",
          "Encore at Wynn Las Vegas (North Strip)",
          "The Cosmopolitan of Las Vegas (Center Strip)",
          "Vdara Hotel & Spa (Center Strip)",
          "Waldorf Astoria Las Vegas (Center Strip)",
          "NoMad Las Vegas (Center Strip)"
        ],
        "url": "https://travel.usnews.com/hotels/las_vegas_nv/"
      },
      "forbes": {
        "label": "Forbes Travel Guide",
        "items": [
          "Wynn Las Vegas (North Strip)",
          "Encore at Wynn Las Vegas (North Strip)",
          "Bellagio (Center Strip)",
          "The Venetian Resort Las Vegas (Center Strip)",
          "Four Seasons Hotel Las Vegas (South Strip)",
          "Aria Sky Suites (Center Strip)",
          "Waldorf Astoria Las Vegas (Center Strip)",
          "The Cosmopolitan of Las Vegas (Center Strip)",
          "Caesars Palace (Center Strip)",
          "Skylofts at MGM Grand (South Strip)"
        ],
        "url": "https://www.forbestravelguide.com/destinations/las-vegas-nevada"
      }
    },
    "vote": {
      "items": [
        "Wynn Las Vegas (North Strip)",
        "Bellagio (Center Strip)",
        "The Venetian Resort Las Vegas (Center Strip)",
        "The Cosmopolitan of Las Vegas (Center Strip)",
        "Caesars Palace (Center Strip)",
        "Encore at Wynn Las Vegas (North Strip)",
        "Aria Resort & Casino (Center Strip)",
        "Fontainebleau Las Vegas (North Strip)",
        "Mandalay Bay (South Strip)",
        "MGM Grand (South Strip)"
      ]
    }
  },
  {
    "id": "f1-fan-experience",
    "publishedDate": "2026-05-25",
    "publishedAt": "2026-05-25T12:00:00Z",
    "title": "Best F1 Races for Fan Experience",
    "category": "Formula 1",
    "type": "travel",
    "tags": [
      "travel",
      "entertainment"
    ],
    "linkType": "wiki",
    "blurb": "Where the atmosphere outshines the cars. Tifosi in Monza, festival vibes at Zandvoort, and the unrivaled pageantry of Monaco.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Monaco Grand Prix (Monte Carlo, Monaco)",
          "British Grand Prix (Silverstone, England)",
          "Italian Grand Prix (Monza, Italy)",
          "Belgian Grand Prix (Spa-Francorchamps, Belgium)",
          "Mexico City Grand Prix (Mexico)",
          "Japanese Grand Prix (Suzuka, Japan)",
          "São Paulo Grand Prix (Brazil)",
          "Dutch Grand Prix (Zandvoort, Netherlands)",
          "Singapore Grand Prix (Marina Bay, Singapore)",
          "Las Vegas Grand Prix (USA)"
        ]
      },
      "f1experiences": {
        "label": "F1 Experiences",
        "items": [
          "Italian Grand Prix (Monza, Italy)",
          "British Grand Prix (Silverstone, England)",
          "Monaco Grand Prix (Monte Carlo, Monaco)",
          "Belgian Grand Prix (Spa-Francorchamps, Belgium)",
          "Japanese Grand Prix (Suzuka, Japan)",
          "Australian Grand Prix (Melbourne, Australia)",
          "Canadian Grand Prix (Montreal, Canada)",
          "United States Grand Prix (Austin, USA)",
          "São Paulo Grand Prix (Brazil)",
          "Hungarian Grand Prix (Budapest, Hungary)"
        ],
        "url": "https://f1experiences.com/blog/ranked-top-10-classic-f1-circuits-to-experience"
      },
      "motorsport": {
        "label": "Motorsport.com",
        "items": [
          "Monaco Grand Prix (Monte Carlo, Monaco)",
          "Dutch Grand Prix (Zandvoort, Netherlands)",
          "British Grand Prix (Silverstone, England)",
          "Mexico City Grand Prix (Mexico)",
          "Italian Grand Prix (Monza, Italy)",
          "Belgian Grand Prix (Spa-Francorchamps, Belgium)",
          "Japanese Grand Prix (Suzuka, Japan)",
          "São Paulo Grand Prix (Brazil)",
          "Singapore Grand Prix (Marina Bay, Singapore)",
          "United States Grand Prix (Austin, USA)"
        ],
        "url": "https://www.motorsport.com/f1/news/our-f1-writers-rank-their-favourite-f1-circuits/10790604/"
      },
      "grandprix247": {
        "label": "GrandPrix247",
        "items": [
          "Monaco Grand Prix (Monte Carlo, Monaco)",
          "British Grand Prix (Silverstone, England)",
          "Belgian Grand Prix (Spa-Francorchamps, Belgium)",
          "Italian Grand Prix (Monza, Italy)",
          "Japanese Grand Prix (Suzuka, Japan)",
          "Mexico City Grand Prix (Mexico)",
          "São Paulo Grand Prix (Brazil)",
          "Australian Grand Prix (Melbourne, Australia)",
          "Singapore Grand Prix (Marina Bay, Singapore)",
          "Canadian Grand Prix (Montreal, Canada)"
        ],
        "url": "https://www.grandprix247.com/f1-opinion/top-formula-1-grand-prix-circuits-every-motorsport-fan-must-visit"
      }
    },
    "vote": {
      "items": [
        "Monaco Grand Prix (Monte Carlo, Monaco)",
        "British Grand Prix (Silverstone, England)",
        "Italian Grand Prix (Monza, Italy)",
        "Belgian Grand Prix (Spa-Francorchamps, Belgium)",
        "Japanese Grand Prix (Suzuka, Japan)",
        "São Paulo Grand Prix (Brazil)",
        "Mexico City Grand Prix (Mexico)",
        "Dutch Grand Prix (Zandvoort, Netherlands)",
        "Singapore Grand Prix (Marina Bay, Singapore)",
        "Las Vegas Grand Prix (USA)"
      ]
    }
  },
  {
    "id": "exclusive-golf-clubs",
    "publishedDate": "2026-05-26",
    "publishedAt": "2026-05-26T10:00:00Z",
    "title": "Most Exclusive Golf Clubs in the World",
    "category": "Golf",
    "type": "entertainment",
    "tags": [
      "entertainment",
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "wiki",
    "blurb": "Invitation only. No application process. Fewer than 300 members at most. The clubs where Augusta National looks almost accessible by comparison.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Augusta National Golf Club (Augusta, USA)",
          "Pine Valley Golf Club (Pine Valley, USA)",
          "Cypress Point Club (Pebble Beach, USA)",
          "Muirfield (Gullane, Scotland)",
          "Royal Melbourne Golf Club (Black Rock, Australia)",
          "Shinnecock Hills Golf Club (Southampton, USA)",
          "Seminole Golf Club (Juno Beach, USA)",
          "National Golf Links of America (Southampton, USA)",
          "Hirono Golf Club (Miki, Japan)",
          "Loch Lomond Golf Club (Luss, Scotland)"
        ]
      },
      "golfmag": {
        "label": "GOLF Magazine 14 Most Exclusive",
        "items": [
          "Pine Valley Golf Club (Pine Valley, USA)",
          "Seminole Golf Club (Juno Beach, USA)",
          "Chicago Golf Club (Wheaton, USA)",
          "Cypress Point Club (Pebble Beach, USA)",
          "Nanea Golf Club (Kailua-Kona, USA)",
          "Augusta National Golf Club (Augusta, USA)",
          "Shinnecock Hills Golf Club (Southampton, USA)",
          "National Golf Links of America (Southampton, USA)",
          "San Francisco Golf Club (San Francisco, USA)",
          "Merion Golf Club (Ardmore, USA)"
        ],
        "url": "https://golf.com/travel/most-exclusive-clubs-2024-top-100/"
      },
      "billionaire": {
        "label": "Billionaire.com Top 10",
        "items": [
          "Cypress Point Club (Pebble Beach, USA)",
          "National Golf Links of America (Southampton, USA)",
          "Augusta National Golf Club (Augusta, USA)",
          "Golf de Morfontaine (Mortefontaine, France)",
          "Loch Lomond Golf Club (Luss, Scotland)",
          "Los Angeles Country Club (Los Angeles, USA)",
          "Royal Melbourne Golf Club (Black Rock, Australia)",
          "Hirono Golf Club (Miki, Japan)",
          "Swinley Forest Golf Club (Ascot, England)",
          "Gleneagles (Auchterarder, Scotland)"
        ]
      },
      "yourgolftravel": {
        "label": "Your Golf Travel · Fairway Tours",
        "items": [
          "Augusta National Golf Club (Augusta, USA)",
          "Pine Valley Golf Club (Pine Valley, USA)",
          "Muirfield (Gullane, Scotland)",
          "Royal Melbourne Golf Club (Black Rock, Australia)",
          "Royal County Down Golf Club (Newcastle, Northern Ireland)",
          "Hirono Golf Club (Miki, Japan)",
          "Loch Lomond Golf Club (Luss, Scotland)",
          "Cypress Point Club (Pebble Beach, USA)",
          "Shinnecock Hills Golf Club (Southampton, USA)",
          "Swinley Forest Golf Club (Ascot, England)"
        ],
        "url": "https://www.yourgolftravel.com/19th-hole/top-10-exclusive-golf-clubs/"
      }
    },
    "vote": {
      "items": [
        "Augusta National Golf Club (Augusta, USA)",
        "Pine Valley Golf Club (Pine Valley, USA)",
        "Cypress Point Club (Pebble Beach, USA)",
        "Shinnecock Hills Golf Club (Southampton, USA)",
        "Muirfield (Gullane, Scotland)",
        "Seminole Golf Club (Juno Beach, USA)",
        "Royal Melbourne Golf Club (Black Rock, Australia)",
        "National Golf Links of America (Southampton, USA)",
        "Loch Lomond Golf Club (Luss, Scotland)",
        "Hirono Golf Club (Miki, Japan)"
      ]
    }
  },
  {
    "id": "movies",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T11:18:46Z",
    "title": "Best Movies of All Time",
    "category": "Cinema",
    "type": "entertainment",
    "tags": [
      "entertainment"
    ],
    "linkType": "imdb",
    "blurb": "From Kane to The Godfather to modern blockbusters: the films that top the canon, ranked across AFI, Sight & Sound, TSPDT, Empire, and IMDb.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "The Godfather (1972)",
          "Citizen Kane (1941)",
          "Vertigo (1958)",
          "The Shawshank Redemption (1994)",
          "The Dark Knight (2008)",
          "Tokyo Story (1953)",
          "2001: A Space Odyssey (1968)",
          "Jeanne Dielman, 23 quai du Commerce, 1080 Bruxelles (1975)",
          "Star Wars: Episode V – The Empire Strikes Back (1980)",
          "Pulp Fiction (1994)"
        ]
      },
      "afi": {
        "label": "AFI · 100 Years…100 Movies (10th Anniversary)",
        "url": "https://www.afi.com/afis-100-years-100-movies-10th-anniversary-edition/",
        "items": [
          "Citizen Kane (1941)",
          "The Godfather (1972)",
          "Casablanca (1942)",
          "Raging Bull (1980)",
          "Singin' in the Rain (1952)",
          "Gone with the Wind (1939)",
          "Lawrence of Arabia (1962)",
          "Schindler's List (1993)",
          "Vertigo (1958)",
          "The Wizard of Oz (1939)"
        ]
      },
      "sightsound": {
        "label": "BFI Sight & Sound Critics' Poll 2022",
        "url": "https://www.bfi.org.uk/sight-and-sound/greatest-films-all-time",
        "items": [
          "Jeanne Dielman, 23 quai du Commerce, 1080 Bruxelles (1975)",
          "Vertigo (1958)",
          "Citizen Kane (1941)",
          "Tokyo Story (1953)",
          "In the Mood for Love (2000)",
          "2001: A Space Odyssey (1968)",
          "Beau Travail (1998)",
          "Mulholland Drive (2001)",
          "Man with a Movie Camera (1929)",
          "Singin' in the Rain (1952)"
        ]
      },
      "tspdt": {
        "label": "They Shoot Pictures Don't They · 1,000 Greatest Films 2026",
        "url": "https://theyshootpictures.com/gf1000_rank1-1000.htm",
        "items": [
          "Citizen Kane (1941)",
          "Vertigo (1958)",
          "2001: A Space Odyssey (1968)",
          "Tokyo Story (1953)",
          "The Rules of the Game (1939)",
          "The Godfather (1972)",
          "8½ (1963)",
          "Sunrise: A Song of Two Humans (1927)",
          "The Searchers (1956)",
          "Seven Samurai (1954)"
        ]
      },
      "empire": {
        "label": "Empire · The 100 Greatest Movies 2017",
        "url": "https://www.empireonline.com/movies/features/best-movies-2/",
        "items": [
          "The Godfather (1972)",
          "Star Wars: Episode V – The Empire Strikes Back (1980)",
          "The Dark Knight (2008)",
          "The Shawshank Redemption (1994)",
          "Pulp Fiction (1994)",
          "Goodfellas (1990)",
          "Raiders of the Lost Ark (1981)",
          "Jaws (1975)",
          "Star Wars: Episode IV – A New Hope (1977)",
          "The Lord of the Rings: The Fellowship of the Ring (2001)"
        ]
      },
      "imdb": {
        "label": "IMDb Top 250 (2026)",
        "url": "https://www.imdb.com/chart/top/",
        "items": [
          "The Shawshank Redemption (1994)",
          "The Godfather (1972)",
          "The Dark Knight (2008)",
          "The Godfather Part II (1974)",
          "12 Angry Men (1957)",
          "The Lord of the Rings: The Return of the King (2003)",
          "Schindler's List (1993)",
          "The Lord of the Rings: The Fellowship of the Ring (2001)",
          "Pulp Fiction (1994)",
          "The Good, the Bad and the Ugly (1966)"
        ]
      }
    },
    "vote": {
      "items": [
        "The Godfather (1972)",
        "Citizen Kane (1941)",
        "Vertigo (1958)",
        "The Shawshank Redemption (1994)",
        "The Dark Knight (2008)",
        "Tokyo Story (1953)",
        "2001: A Space Odyssey (1968)",
        "Jeanne Dielman, 23 quai du Commerce, 1080 Bruxelles (1975)",
        "Star Wars: Episode V – The Empire Strikes Back (1980)",
        "Pulp Fiction (1994)"
      ]
    }
  },
  {
    "id": "top-grossing-films-1990",
    "publishedDate": "2026-05-25",
    "publishedAt": "2026-05-25T13:00:00Z",
    "title": "Top-Grossing Films of 1990",
    "category": "Movies · 1990",
    "type": "entertainment",
    "tags": [
      "entertainment"
    ],
    "linkType": "imdb",
    "mode": "facts",
    "blurb": "The box office champions of 1990, ranked by worldwide gross. Ghost led the year, Home Alone became a Christmas institution, and Dances With Wolves swept the Oscars.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Box Office Mojo · Worldwide Gross",
        "items": [
          "Ghost",
          "Home Alone",
          "Pretty Woman",
          "Dances with Wolves",
          "Total Recall",
          "Back to the Future Part III",
          "Die Hard 2",
          "Presumed Innocent",
          "Teenage Mutant Ninja Turtles",
          "Kindergarten Cop"
        ]
      }
    }
  },
  {
    "id": "pizza-nyc",
    "publishedDate": "2026-05-29",
    "publishedAt": "2026-05-29T12:09:40Z",
    "title": "Best Pizza in NYC",
    "category": "New York",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "Williamsburg slice-shop royalty, Carroll Gardens coal-oven legends, and Lower East Side Neapolitan icons. New York's best pizza, by consensus across the critics and One Bite.",
    "defaultSource": "ai",
    "links": {
      "Angelo's Coal Oven Pizzeria (Midtown)": "https://www.google.com/maps/search/?api=1&query=Angelo%20s%20Coal%20Oven%20Pizzeria%20Midtown%20New%20York%20NY",
      "Audace (Hell's Kitchen)": "https://www.google.com/maps/search/?api=1&query=Audace%20Hell%20s%20Kitchen%20New%20York%20NY",
      "Best Pizza (Williamsburg)": "https://www.google.com/maps/search/?api=1&query=Best%20Pizza%20Williamsburg%20New%20York%20NY",
      "Brooklyn DOP (Park Slope)": "https://www.google.com/maps/search/?api=1&query=Brooklyn%20DOP%20Park%20Slope%20New%20York%20NY",
      "Ceres (Nolita)": "https://www.google.com/maps/search/?api=1&query=Ceres%20Nolita%20New%20York%20NY",
      "Chrissy's Pizza (Greenpoint)": "https://www.google.com/maps/search/?api=1&query=Chrissy%20s%20Pizza%20Greenpoint%20New%20York%20NY",
      "Denino's Greenwich Village (Greenwich Village)": "https://www.google.com/maps/search/?api=1&query=Denino%20s%20Greenwich%20Village%20Greenwich%20Village%20New%20York%20NY",
      "Di Fara Pizza (Midwood)": "https://www.google.com/maps/search/?api=1&query=Di%20Fara%20Pizza%20Midwood%20New%20York%20NY",
      "Don Antonio (Midtown West)": "https://www.google.com/maps/search/?api=1&query=Don%20Antonio%20Midtown%20West%20New%20York%20NY",
      "F&F Pizzeria (Carroll Gardens)": "https://www.google.com/maps/search/?api=1&query=F%20F%20Pizzeria%20Carroll%20Gardens%20New%20York%20NY",
      "Joe & Pat's (Staten Island)": "https://www.google.com/maps/search/?api=1&query=Joe%20Pat%20s%20Staten%20Island%20New%20York%20NY",
      "Joe's Pizza (Greenwich Village)": "https://www.google.com/maps/search/?api=1&query=Joe%20s%20Pizza%20Greenwich%20Village%20New%20York%20NY",
      "John's of Bleecker Street (Greenwich Village)": "https://www.google.com/maps/search/?api=1&query=John%20s%20of%20Bleecker%20Street%20Greenwich%20Village%20New%20York%20NY",
      "Keste (Greenwich Village)": "https://www.google.com/maps/search/?api=1&query=Keste%20Greenwich%20Village%20New%20York%20NY",
      "L&B Spumoni Gardens (Gravesend)": "https://www.google.com/maps/search/?api=1&query=L%20B%20Spumoni%20Gardens%20Gravesend%20New%20York%20NY",
      "L'Industrie Pizzeria (Williamsburg)": "https://www.google.com/maps/search/?api=1&query=L%20Industrie%20Pizzeria%20Williamsburg%20New%20York%20NY",
      "Lazzara's Pizza (Midtown)": "https://www.google.com/maps/search/?api=1&query=Lazzara%20s%20Pizza%20Midtown%20New%20York%20NY",
      "Lucali (Carroll Gardens)": "https://www.google.com/maps/search/?api=1&query=Lucali%20Carroll%20Gardens%20New%20York%20NY",
      "Lucia Pizza of Avenue X (Sheepshead Bay)": "https://www.google.com/maps/search/?api=1&query=Lucia%20Pizza%20of%20Avenue%20X%20Sheepshead%20Bay%20New%20York%20NY",
      "Mama's Too (Upper West Side)": "https://www.google.com/maps/search/?api=1&query=Mama%20s%20Too%20Upper%20West%20Side%20New%20York%20NY",
      "Mano's Pizzeria (Ridgewood)": "https://www.google.com/maps/search/?api=1&query=Mano%20s%20Pizzeria%20Ridgewood%20New%20York%20NY",
      "Ops (Bushwick)": "https://www.google.com/maps/search/?api=1&query=Ops%20Bushwick%20New%20York%20NY",
      "Pasquale Jones (Nolita)": "https://www.google.com/maps/search/?api=1&query=Pasquale%20Jones%20Nolita%20New%20York%20NY",
      "Patsy's Pizzeria (East Harlem)": "https://www.google.com/maps/search/?api=1&query=Patsy%20s%20Pizzeria%20East%20Harlem%20New%20York%20NY",
      "Pizza Secret (Midtown)": "https://www.google.com/maps/search/?api=1&query=Pizza%20Secret%20Midtown%20New%20York%20NY",
      "Ribalta (Greenwich Village)": "https://www.google.com/maps/search/?api=1&query=Ribalta%20Greenwich%20Village%20New%20York%20NY",
      "Roberta's (Bushwick)": "https://www.google.com/maps/search/?api=1&query=Roberta%20s%20Bushwick%20New%20York%20NY",
      "Rubirosa (Nolita)": "https://www.google.com/maps/search/?api=1&query=Rubirosa%20Nolita%20New%20York%20NY",
      "Sauce Pizzeria (Lower East Side)": "https://www.google.com/maps/search/?api=1&query=Sauce%20Pizzeria%20Lower%20East%20Side%20New%20York%20NY",
      "Scarr's Pizza (Lower East Side)": "https://www.google.com/maps/search/?api=1&query=Scarr%20s%20Pizza%20Lower%20East%20Side%20New%20York%20NY",
      "Speedy Romeo (Clinton Hill)": "https://www.google.com/maps/search/?api=1&query=Speedy%20Romeo%20Clinton%20Hill%20New%20York%20NY",
      "Stretch Pizza (Flatiron)": "https://www.google.com/maps/search/?api=1&query=Stretch%20Pizza%20Flatiron%20New%20York%20NY",
      "Una Pizza Napoletana (Lower East Side)": "https://www.google.com/maps/search/?api=1&query=Una%20Pizza%20Napoletana%20Lower%20East%20Side%20New%20York%20NY"
    },
    "itemLinks": {
        "Angelo's Coal Oven Pizzeria (Midtown)": "https://angelospizzany.com/",
        "Audace (Hell's Kitchen)": "https://audacenyc.com/",
        "Best Pizza (Williamsburg)": "https://www.bestpizzawilliamsburg.com/",
        "Brooklyn DOP (Park Slope)": "https://brooklyndop.com/",
        "Ceres (Nolita)": "https://ceres-100824.square.site/",
        "Chrissy's Pizza (Greenpoint)": "https://chrissys-pizza.square.site/",
        "Denino's Greenwich Village (Greenwich Village)": "https://www.deninosgreenwichvillage.com/",
        "Di Fara Pizza (Midwood)": "https://www.difarapizzany.com/",
        "Don Antonio (Midtown West)": "https://www.donantoniopizza.com/",
        "F&F Pizzeria (Carroll Gardens)": "https://www.fnfpizzeria.com/",
        "Joe & Pat's (Staten Island)": "https://www.joeandpatsny.com/",
        "Joe's Pizza (Greenwich Village)": "https://www.joespizzanyc.com/",
        "John's of Bleecker Street (Greenwich Village)": "https://johnsofbleecker.com/",
        "Keste (Greenwich Village)": "https://kestepizzeria.com/",
        "L&B Spumoni Gardens (Gravesend)": "https://spumonigardens.com/",
        "L'Industrie Pizzeria (Williamsburg)": "https://www.lindustriebk.com/",
        "Lazzara's Pizza (Midtown)": "https://www.lazzaraspizza.com/",
        "Lucali (Carroll Gardens)": "https://www.lucali.com/",
        "Lucia Pizza of Avenue X (Sheepshead Bay)": "https://lucia.pizza/",
        "Mama's Too (Upper West Side)": "https://www.mamastoo.com/",
        "Mano's Pizzeria (Ridgewood)": "https://www.manospizzeria.nyc/",
        "Ops (Bushwick)": "https://www.opsbk.com/",
        "Pasquale Jones (Nolita)": "https://www.pasqualejones.com/",
        "Patsy's Pizzeria (East Harlem)": "https://www.patsyspizzerianyc.com/",
        "Pizza Secret (Midtown)": "https://pizzasecretnyc.com/",
        "Ribalta (Greenwich Village)": "https://ribaltanyc.com/",
        "Roberta's (Bushwick)": "https://www.robertaspizza.com/",
        "Rubirosa (Nolita)": "https://www.rubirosanyc.com/",
        "Sauce Pizzeria (Lower East Side)": "https://www.saucepizzeria.com/",
        "Scarr's Pizza (Lower East Side)": "https://www.scarrspizza.com/",
        "Speedy Romeo (Clinton Hill)": "https://www.speedyromeo.com/",
        "Stretch Pizza (Flatiron)": "https://www.stretchpizzanyc.com/",
        "Una Pizza Napoletana (Lower East Side)": "https://unapizza.com/"
      },
      "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "L'Industrie Pizzeria (Williamsburg)",
          "Una Pizza Napoletana (Lower East Side)",
          "Lucali (Carroll Gardens)",
          "Mama's Too (Upper West Side)",
          "Ops (Bushwick)",
          "Di Fara Pizza (Midwood)",
          "Scarr's Pizza (Lower East Side)",
          "L&B Spumoni Gardens (Gravesend)",
          "Ceres (Nolita)",
          "Joe & Pat's (Staten Island)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation · 23 Best Pizza in NYC (by score) 2025",
        "url": "https://www.theinfatuation.com/new-york/guides/best-pizza-nyc",
        "items": [
          "L'Industrie Pizzeria (Williamsburg)",
          "L&B Spumoni Gardens (Gravesend)",
          "Lucali (Carroll Gardens)",
          "Una Pizza Napoletana (Lower East Side)",
          "Mama's Too (Upper West Side)",
          "Chrissy's Pizza (Greenpoint)",
          "Di Fara Pizza (Midwood)",
          "Ops (Bushwick)",
          "Joe & Pat's (Staten Island)",
          "Lucia Pizza of Avenue X (Sheepshead Bay)",
          "Rubirosa (Nolita)",
          "Scarr's Pizza (Lower East Side)"
        ]
      },
      "timeout": {
        "label": "Time Out New York · Best Pizza in NYC 2025",
        "url": "https://www.timeout.com/newyork/restaurants/best-new-york-pizza",
        "items": [
          "Mama's Too (Upper West Side)",
          "L'Industrie Pizzeria (Williamsburg)",
          "Lucali (Carroll Gardens)",
          "Ops (Bushwick)",
          "Scarr's Pizza (Lower East Side)",
          "F&F Pizzeria (Carroll Gardens)",
          "Roberta's (Bushwick)",
          "Una Pizza Napoletana (Lower East Side)",
          "Rubirosa (Nolita)",
          "Speedy Romeo (Clinton Hill)"
        ]
      },
      "topusa": {
        "label": "50 Top Pizza · USA 2025 (NYC entries)",
        "url": "https://www.50toppizza.it/en/50-top-pizza-usa-2025-una-pizza-napoletana-in-new-york-is-confirmed-as-the-best-pizzeria-in-the-usa/",
        "items": [
          "Una Pizza Napoletana (Lower East Side)",
          "Ribalta (Greenwich Village)",
          "Don Antonio (Midtown West)",
          "Keste (Greenwich Village)",
          "Ops (Bushwick)",
          "Pizza Secret (Midtown)",
          "Audace (Hell's Kitchen)",
          "Pasquale Jones (Nolita)",
          "Stretch Pizza (Flatiron)"
        ]
      },
      "onebite": {
        "label": "One Bite Pizza Rankings · NYC by Barstool/One Bite score 2026",
        "url": "https://www.onebitepizzarankings.com/",
        "items": [
          "Di Fara Pizza (Midwood)",
          "Lucali (Carroll Gardens)",
          "John's of Bleecker Street (Greenwich Village)",
          "Angelo's Coal Oven Pizzeria (Midtown)",
          "Lazzara's Pizza (Midtown)",
          "Ceres (Nolita)",
          "Best Pizza (Williamsburg)",
          "Sauce Pizzeria (Lower East Side)",
          "Denino's Greenwich Village (Greenwich Village)",
          "Patsy's Pizzeria (East Harlem)"
        ]
      },
      "topslice": {
        "label": "50 Top Pizza · Slice USA 2025 (NYC entries)",
        "url": "https://www.50toppizza.it/en/best-pizza-slice-in-the-usa-2025/",
        "items": [
          "L'Industrie Pizzeria (Williamsburg)",
          "Mama's Too (Upper West Side)",
          "Brooklyn DOP (Park Slope)",
          "Mano's Pizzeria (Ridgewood)",
          "Scarr's Pizza (Lower East Side)"
        ]
      }
    },
    "vote": {
      "items": [
        "L'Industrie Pizzeria (Williamsburg)",
        "Lucali (Carroll Gardens)",
        "Una Pizza Napoletana (Lower East Side)",
        "Mama's Too (Upper West Side)",
        "Joe's Pizza (Greenwich Village)",
        "Di Fara Pizza (Midwood)",
        "Scarr's Pizza (Lower East Side)",
        "Rubirosa (Nolita)",
        "Roberta's (Bushwick)",
        "L&B Spumoni Gardens (Gravesend)"
      ]
    }
  },
  {
    "id": "tacos-la",
    "publishedDate": "2026-05-24",
    "publishedAt": "2026-05-24T14:00:00Z",
    "title": "Best Tacos in Los Angeles",
    "category": "Los Angeles",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "A taqueria capital. Awards on one side, taco truck loyalty on the other.",
    "defaultSource": "ai",
    "links": {
      "Angel's Tijuana Tacos (multiple locations)": "https://www.google.com/maps/search/?api=1&query=Angel%20s%20Tijuana%20Tacos%20multiple%20locations",
      "Asadero Chikali (Inglewood)": "https://www.google.com/maps/search/?api=1&query=Asadero%20Chikali%20Inglewood",
      "Carnitas El Artista (Inglewood)": "https://www.google.com/maps/search/?api=1&query=Carnitas%20El%20Artista%20Inglewood",
      "Carnitas El Momo (Boyle Heights)": "https://www.google.com/maps/search/?api=1&query=Carnitas%20El%20Momo%20Boyle%20Heights",
      "Carnitas Los Gabrieles (Downtown)": "https://www.google.com/maps/search/?api=1&query=Carnitas%20Los%20Gabrieles%20Downtown",
      "Chichen Itza (South Los Angeles)": "https://www.google.com/maps/search/?api=1&query=Chichen%20Itza%20South%20Los%20Angeles",
      "Holbox (South Los Angeles)": "https://www.google.com/maps/search/?api=1&query=Holbox%20South%20Los%20Angeles",
      "Leo's Taco Truck (multiple locations)": "https://www.google.com/maps/search/?api=1&query=Leo%20s%20Taco%20Truck%20multiple%20locations",
      "Los Cinco Puntos (Boyle Heights)": "https://www.google.com/maps/search/?api=1&query=Los%20Cinco%20Puntos%20Boyle%20Heights",
      "Los Originales Tacos Arabes de Puebla (East Los Angeles)": "https://www.google.com/maps/search/?api=1&query=Los%20Originales%20Tacos%20Arabes%20de%20Puebla%20East%20Los%20Angeles",
      "Mariscos Jalisco (Boyle Heights)": "https://www.google.com/maps/search/?api=1&query=Mariscos%20Jalisco%20Boyle%20Heights",
      "Simon (Echo Park)": "https://www.google.com/maps/search/?api=1&query=Simon%20Echo%20Park",
      "Sonoratown (Downtown)": "https://www.google.com/maps/search/?api=1&query=Sonoratown%20Downtown",
      "Tacos Don Cuco (East Los Angeles)": "https://www.google.com/maps/search/?api=1&query=Tacos%20Don%20Cuco%20East%20Los%20Angeles",
      "Tacos La Carreta (Whittier)": "https://www.google.com/maps/search/?api=1&query=Tacos%20La%20Carreta%20Whittier",
      "Tacos La Rueda (Bellflower)": "https://www.google.com/maps/search/?api=1&query=Tacos%20La%20Rueda%20Bellflower",
      "Tacos Los Cholos (Huntington Park)": "https://www.google.com/maps/search/?api=1&query=Tacos%20Los%20Cholos%20Huntington%20Park",
      "Tacos Los Guichos (South Los Angeles)": "https://www.google.com/maps/search/?api=1&query=Tacos%20Los%20Guichos%20South%20Los%20Angeles",
      "Tacos Los Poblanos (South Los Angeles)": "https://www.google.com/maps/search/?api=1&query=Tacos%20Los%20Poblanos%20South%20Los%20Angeles",
      "Tacos Y Birria La Unica (Boyle Heights)": "https://www.google.com/maps/search/?api=1&query=Tacos%20Y%20Birria%20La%20Unica%20Boyle%20Heights",
      "Tijuanazo (East Los Angeles)": "https://www.google.com/maps/search/?api=1&query=Tijuanazo%20East%20Los%20Angeles",
      "Tire Shop Taqueria (Historic South Central)": "https://www.google.com/maps/search/?api=1&query=Tire%20Shop%20Taqueria%20Historic%20South%20Central"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Mariscos Jalisco (Boyle Heights)",
          "Tacos Los Cholos (Huntington Park)",
          "Carnitas El Momo (Boyle Heights)",
          "Sonoratown (Downtown)",
          "Chichen Itza (South Los Angeles)",
          "Tacos Los Guichos (South Los Angeles)",
          "Asadero Chikali (Inglewood)",
          "Tacos La Rueda (Bellflower)",
          "Leo's Taco Truck (multiple locations)",
          "Holbox (South Los Angeles)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation · 25 Best Tacos in LA, Ranked 2025",
        "url": "https://www.theinfatuation.com/los-angeles/guides/the-best-tacos-in-los-angeles",
        "items": [
          "Tacos Los Cholos (Huntington Park)",
          "Carnitas Los Gabrieles (Downtown)",
          "Los Cinco Puntos (Boyle Heights)",
          "Tacos Los Poblanos (South Los Angeles)",
          "Mariscos Jalisco (Boyle Heights)",
          "Carnitas El Momo (Boyle Heights)",
          "Sonoratown (Downtown)",
          "Tacos Don Cuco (East Los Angeles)",
          "Simon (Echo Park)",
          "Chichen Itza (South Los Angeles)",
          "Tacos Los Guichos (South Los Angeles)",
          "Tacos La Carreta (Whittier)",
          "Tacos La Rueda (Bellflower)",
          "Tacos Y Birria La Unica (Boyle Heights)"
        ]
      },
      "timeout": {
        "label": "Time Out Los Angeles · 32 Best Tacos 2025",
        "url": "https://www.timeout.com/los-angeles/restaurants/best-tacos-in-los-angeles",
        "items": [
          "Mariscos Jalisco (Boyle Heights)",
          "Leo's Taco Truck (multiple locations)",
          "Holbox (South Los Angeles)",
          "Tacos Los Cholos (Huntington Park)",
          "Asadero Chikali (Inglewood)",
          "Tacos Los Guichos (South Los Angeles)",
          "Chichen Itza (South Los Angeles)",
          "Carnitas El Momo (Boyle Heights)",
          "Tacos La Rueda (Bellflower)",
          "Tijuanazo (East Los Angeles)",
          "Tire Shop Taqueria (Historic South Central)",
          "Los Originales Tacos Arabes de Puebla (East Los Angeles)",
          "Angel's Tijuana Tacos (multiple locations)",
          "Carnitas El Artista (Inglewood)"
        ]
      }
    },
    "vote": {
      "items": [
        "Mariscos Jalisco (Boyle Heights)",
        "Tacos Los Cholos (Huntington Park)",
        "Carnitas El Momo (Boyle Heights)",
        "Sonoratown (Downtown)",
        "Leo's Taco Truck (multiple locations)",
        "Holbox (South Los Angeles)",
        "Chichen Itza (South Los Angeles)",
        "Tijuanazo (East Los Angeles)",
        "Tacos Los Guichos (South Los Angeles)",
        "Carnitas Los Gabrieles (Downtown)"
      ]
    }
  },
  {
    "id": "burritos-san-diego",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T11:18:46Z",
    "title": "Best Burritos in San Diego",
    "category": "San Diego",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Ortiz's Taco Shop (Point Loma)": "https://www.google.com/maps/search/?api=1&query=Ortiz%27s%20Taco%20Shop%20Point%20Loma%20San%20Diego%20CA",
      "Adalberto's Mexican Food (Point Loma)": "https://www.google.com/maps/search/?api=1&query=Adalberto%27s%20Mexican%20Food%20Point%20Loma%20San%20Diego%20CA",
      "Cotija's (Point Loma)": "https://www.google.com/maps/search/?api=1&query=Cotija%27s%20Point%20Loma%20San%20Diego%20CA",
      "Don Tommy's (Ocean Beach)": "https://www.google.com/maps/search/?api=1&query=Don%20Tommy%27s%20Ocean%20Beach%20San%20Diego%20CA",
      "La Perla Cocina Mexicana (Point Loma)": "https://www.google.com/maps/search/?api=1&query=La%20Perla%20Cocina%20Mexicana%20Point%20Loma%20San%20Diego%20CA",
      "Lucha Libre Taco Shop (Mission Hills)": "https://www.google.com/maps/search/?api=1&query=Lucha%20Libre%20Taco%20Shop%20Mission%20Hills%20San%20Diego%20CA",
      "Miguel's Cocina (Point Loma)": "https://www.google.com/maps/search/?api=1&query=Miguel%27s%20Cocina%20Point%20Loma%20San%20Diego%20CA",
      "Nico's Mexican Food (Ocean Beach)": "https://www.google.com/maps/search/?api=1&query=Nico%27s%20Mexican%20Food%20Ocean%20Beach%20San%20Diego%20CA",
      "Mike's Taco Club (Ocean Beach)": "https://www.google.com/maps/search/?api=1&query=Mike%27s%20Taco%20Club%20Ocean%20Beach%20San%20Diego%20CA",
      "Tony's (Point Loma)": "https://www.google.com/maps/search/?api=1&query=Tony%27s%20Point%20Loma%20San%20Diego%20CA",
      "Loma Bonita (Point Loma)": "https://www.google.com/maps/search/?api=1&query=Loma%20Bonita%20Point%20Loma%20San%20Diego%20CA",
      "Las Cuatro Milpas (Barrio Logan)": "https://www.google.com/maps/search/?api=1&query=Las%20Cuatro%20Milpas%20Barrio%20Logan%20San%20Diego%20CA",
      "El Zarape (University Heights)": "https://www.google.com/maps/search/?api=1&query=El%20Zarape%20University%20Heights%20San%20Diego%20CA",
      "Lolita's Taco Shop (Chula Vista)": "https://www.google.com/maps/search/?api=1&query=Lolita%27s%20Taco%20Shop%20Chula%20Vista%20San%20Diego%20CA",
      "Taco Surf (Pacific Beach)": "https://www.google.com/maps/search/?api=1&query=Taco%20Surf%20Pacific%20Beach%20San%20Diego%20CA",
      "Rigoberto's Taco Shop (La Jolla)": "https://www.google.com/maps/search/?api=1&query=Rigoberto%27s%20Taco%20Shop%20La%20Jolla%20San%20Diego%20CA",
      "The Taco Stand (La Jolla)": "https://www.google.com/maps/search/?api=1&query=The%20Taco%20Stand%20La%20Jolla%20San%20Diego%20CA",
      "Jose's Court Room (La Jolla)": "https://www.google.com/maps/search/?api=1&query=Jose%27s%20Court%20Room%20La%20Jolla%20San%20Diego%20CA",
      "Taco Villa (La Jolla)": "https://www.google.com/maps/search/?api=1&query=Taco%20Villa%20La%20Jolla%20San%20Diego%20CA",
      "Verdes El Ranchero (La Jolla)": "https://www.google.com/maps/search/?api=1&query=Verdes%20El%20Ranchero%20La%20Jolla%20San%20Diego%20CA",
      "Pokez (East Village)": "https://www.google.com/maps/search/?api=1&query=Pokez%20East%20Village%20San%20Diego%20CA",
      "Valentine's Mexican Restaurant (Gaslamp Quarter)": "https://www.google.com/maps/search/?api=1&query=Valentine%27s%20Mexican%20Restaurant%20Gaslamp%20Quarter%20San%20Diego%20CA",
      "La Puerta (Gaslamp Quarter)": "https://www.google.com/maps/search/?api=1&query=La%20Puerta%20Gaslamp%20Quarter%20San%20Diego%20CA",
      "Tacos El Cabrón (Gaslamp Quarter)": "https://www.google.com/maps/search/?api=1&query=Tacos%20El%20Cabr%C3%B3n%20Gaslamp%20Quarter%20San%20Diego%20CA",
      "Cafe Coyote (Old Town)": "https://www.google.com/maps/search/?api=1&query=Cafe%20Coyote%20Old%20Town%20San%20Diego%20CA"
    },
    "blurb": "Carne asada, California, surf-and-turf: the taco-shop counters San Diego argues over, ranked by consensus.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Ortiz's Taco Shop (Point Loma)",
          "Nico's Mexican Food (Ocean Beach)",
          "La Perla Cocina Mexicana (Point Loma)",
          "Lucha Libre Taco Shop (Mission Hills)",
          "Adalberto's Mexican Food (Point Loma)",
          "Cotija's (Point Loma)",
          "El Zarape (University Heights)",
          "Don Tommy's (Ocean Beach)",
          "Lolita's Taco Shop (Chula Vista)",
          "Cafe Coyote (Old Town)"
        ]
      },
      "plnu": {
        "label": "Point Loma Nazarene University · Great Burrito Bracket",
        "url": "https://www.pointloma.edu/resources/undergraduate-studies/12-best-burritos-shops-san-diego",
        "items": [
          "Ortiz's Taco Shop (Point Loma)",
          "Adalberto's Mexican Food (Point Loma)",
          "Cotija's (Point Loma)",
          "Don Tommy's (Ocean Beach)",
          "La Perla Cocina Mexicana (Point Loma)",
          "Lucha Libre Taco Shop (Mission Hills)",
          "Miguel's Cocina (Point Loma)",
          "Nico's Mexican Food (Ocean Beach)",
          "Mike's Taco Club (Ocean Beach)",
          "Tony's (Point Loma)",
          "Loma Bonita (Point Loma)",
          "Las Cuatro Milpas (Barrio Logan)"
        ]
      },
      "dailymeal": {
        "label": "The Daily Meal · 50 Best Burritos in America (SD picks)",
        "url": "https://www.10news.com/lifestyle/exploring-san-diego/seven-san-diego-burritos-may-be-the-best-in-the-us-new-ranking-says",
        "items": [
          "Nico's Mexican Food (Ocean Beach)",
          "Ortiz's Taco Shop (Point Loma)",
          "El Zarape (University Heights)",
          "Lolita's Taco Shop (Chula Vista)",
          "Lucha Libre Taco Shop (Mission Hills)",
          "La Perla Cocina Mexicana (Point Loma)",
          "Taco Surf (Pacific Beach)"
        ]
      },
      "lajolla": {
        "label": "LaJolla.com · Best California Burrito Spots (unranked)",
        "url": "https://lajolla.com/article/best-california-burrito-san-diego/",
        "items": [
          "Rigoberto's Taco Shop (La Jolla)",
          "The Taco Stand (La Jolla)",
          "Jose's Court Room (La Jolla)",
          "Taco Villa (La Jolla)",
          "Verdes El Ranchero (La Jolla)",
          "Pokez (East Village)",
          "Valentine's Mexican Restaurant (Gaslamp Quarter)",
          "La Puerta (Gaslamp Quarter)",
          "Tacos El Cabrón (Gaslamp Quarter)",
          "Cafe Coyote (Old Town)"
        ],
        "unordered": true
      }
    },
    "vote": {
      "items": [
        "Ortiz's Taco Shop (Point Loma)",
        "Nico's Mexican Food (Ocean Beach)",
        "La Perla Cocina Mexicana (Point Loma)",
        "Lucha Libre Taco Shop (Mission Hills)",
        "Adalberto's Mexican Food (Point Loma)",
        "Cotija's (Point Loma)",
        "El Zarape (University Heights)",
        "Don Tommy's (Ocean Beach)",
        "Lolita's Taco Shop (Chula Vista)",
        "Cafe Coyote (Old Town)"
      ]
    }
  },
  {
    "id": "burritos-nyc",
    "publishedDate": "2026-05-27",
    "publishedAt": "2026-05-27T12:00:00Z",
    "title": "Best Burritos in NYC",
    "category": "New York",
    "type": "stores",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "B'Klyn Burro (Clinton Hill)": "https://www.google.com/maps/search/?api=1&query=B%20Klyn%20Burro%20Clinton%20Hill%20New%20York%20NY",
      "Calexico (multiple locations)": "https://www.google.com/maps/search/?api=1&query=Calexico%20New%20York%20NY",
      "Chipotle (multiple locations)": "https://www.google.com/maps/search/?api=1&query=Chipotle%20New%20York%20NY",
      "Dos Toros Taqueria (multiple locations)": "https://www.google.com/maps/search/?api=1&query=Dos%20Toros%20Taqueria%20New%20York%20NY",
      "Downtown Burritos (East Village)": "https://www.google.com/maps/search/?api=1&query=Downtown%20Burritos%20East%20Village%20New%20York%20NY",
      "Electric Burrito (multiple locations)": "https://www.google.com/maps/search/?api=1&query=Electric%20Burrito%20New%20York%20NY",
      "La Taq (Park Slope)": "https://www.google.com/maps/search/?api=1&query=La%20Taq%20Park%20Slope%20New%20York%20NY",
      "Los Burritos Juárez (Fort Greene)": "https://www.google.com/maps/search/?api=1&query=Los%20Burritos%20Ju%C3%A1rez%20Fort%20Greene%20New%20York%20NY",
      "Mission Cantina (Lower East Side)": "https://www.google.com/maps/search/?api=1&query=Mission%20Cantina%20Lower%20East%20Side%20New%20York%20NY",
      "Plaza Ortega (Bushwick)": "https://www.google.com/maps/search/?api=1&query=Plaza%20Ortega%20Bushwick%20New%20York%20NY",
      "Son Del North (Lower East Side)": "https://www.google.com/maps/search/?api=1&query=Son%20Del%20North%20Lower%20East%20Side%20New%20York%20NY",
      "Super Burrito (Rockaway)": "https://www.google.com/maps/search/?api=1&query=Super%20Burrito%20Rockaway%20New%20York%20NY",
      "Super Burrito (Williamsburg)": "https://www.google.com/maps/search/?api=1&query=Super%20Burrito%20Williamsburg%20New%20York%20NY",
      "Taqueria Tlaxcalli (Parkchester)": "https://www.google.com/maps/search/?api=1&query=Taqueria%20Tlaxcalli%20Parkchester%20New%20York%20NY",
      "Tres Carnes (multiple locations)": "https://www.google.com/maps/search/?api=1&query=Tres%20Carnes%20New%20York%20NY"
    },
    "blurb": "Mission-style transplants, Sonoran imports, and the Fort Greene shop hand-rolling lard tortillas to order. Where NYC's burrito scene actually lives.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "B'Klyn Burro (Clinton Hill)",
          "Plaza Ortega (Bushwick)",
          "Super Burrito (Williamsburg)",
          "Son Del North (Lower East Side)",
          "Los Burritos Juárez (Fort Greene)",
          "La Taq (Park Slope)",
          "Taqueria Tlaxcalli (Parkchester)",
          "Electric Burrito (multiple locations)",
          "Calexico (multiple locations)",
          "Dos Toros Taqueria (multiple locations)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation · 16 Best Burritos in NYC",
        "url": "https://www.theinfatuation.com/new-york/guides/best-burritos-nyc",
        "items": [
          "Plaza Ortega (Bushwick)",
          "Son Del North (Lower East Side)",
          "Los Burritos Juárez (Fort Greene)",
          "B'Klyn Burro (Clinton Hill)",
          "Taqueria Tlaxcalli (Parkchester)",
          "La Taq (Park Slope)",
          "Electric Burrito (multiple locations)",
          "Super Burrito (Williamsburg)",
          "Downtown Burritos (East Village)",
          "Super Burrito (Rockaway)"
        ]
      },
      "timeout": {
        "label": "Time Out New York",
        "items": [
          "Los Burritos Juárez (Fort Greene)",
          "B'Klyn Burro (Clinton Hill)",
          "Plaza Ortega (Bushwick)",
          "Son Del North (Lower East Side)",
          "La Taq (Park Slope)",
          "Super Burrito (Williamsburg)",
          "Taqueria Tlaxcalli (Parkchester)",
          "Electric Burrito (multiple locations)",
          "Calexico (multiple locations)",
          "Dos Toros Taqueria (multiple locations)"
        ],
        "url": "https://www.timeout.com/newyork/restaurants/best-burritos-in-nyc"
      },
      "fivethirtyeight": {
        "label": "FiveThirtyEight Burrito Bracket",
        "items": [
          "Taqueria Tlaxcalli (Parkchester)",
          "Mission Cantina (Lower East Side)",
          "B'Klyn Burro (Clinton Hill)",
          "Calexico (multiple locations)",
          "Dos Toros Taqueria (multiple locations)",
          "Tres Carnes (multiple locations)",
          "La Taq (Park Slope)",
          "Chipotle (multiple locations)",
          "Plaza Ortega (Bushwick)",
          "Son Del North (Lower East Side)"
        ],
        "url": "https://fivethirtyeight.com/burrito/"
      }
    },
    "vote": {
      "items": [
        "B'Klyn Burro (Clinton Hill)",
        "Plaza Ortega (Bushwick)",
        "Super Burrito (Williamsburg)",
        "Son Del North (Lower East Side)",
        "Los Burritos Juárez (Fort Greene)",
        "La Taq (Park Slope)",
        "Taqueria Tlaxcalli (Parkchester)",
        "Electric Burrito (multiple locations)",
        "Calexico (multiple locations)",
        "Dos Toros Taqueria (multiple locations)"
      ]
    }
  },
  {
    "id": "caesar-wraps-nyc",
    "publishedDate": "2026-05-26",
    "publishedAt": "2026-05-26T11:00:00Z",
    "title": "Best Chicken Caesar Wraps in NYC",
    "category": "New York",
    "type": "stores",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Bobwhite Counter (multiple locations)": "https://www.google.com/maps/search/?api=1&query=Bobwhite%20Counter%20New%20York%20NY",
      "Brown Bag Sandwich (multiple locations)": "https://www.google.com/maps/search/?api=1&query=Brown%20Bag%20Sandwich%20New%20York%20NY",
      "Compton's (multiple locations)": "https://www.google.com/maps/search/?api=1&query=Compton%20s%20New%20York%20NY",
      "Edith's (Williamsburg)": "https://www.google.com/maps/search/?api=1&query=Edith%20s%20Williamsburg%20New%20York%20NY",
      "Heavenly Market (multiple locations)": "https://www.google.com/maps/search/?api=1&query=Heavenly%20Market%20New%20York%20NY",
      "Jacob's Pickles (Upper West Side)": "https://www.google.com/maps/search/?api=1&query=Jacob%20s%20Pickles%20Upper%20West%20Side%20New%20York%20NY",
      "La Villa Pizzeria (multiple locations)": "https://www.google.com/maps/search/?api=1&query=La%20Villa%20Pizzeria%20New%20York%20NY",
      "Lenwich (multiple locations)": "https://www.google.com/maps/search/?api=1&query=Lenwich%20New%20York%20NY",
      "Milano Market (multiple locations)": "https://www.google.com/maps/search/?api=1&query=Milano%20Market%20New%20York%20NY",
      "Smith Gourmet Deli (Cobble Hill)": "https://www.google.com/maps/search/?api=1&query=Smith%20Gourmet%20Deli%20Cobble%20Hill%20New%20York%20NY",
      "Sunny and Annie's (East Village)": "https://www.google.com/maps/search/?api=1&query=Sunny%20and%20Annie%20s%20East%20Village%20New%20York%20NY",
      "The Arch Cafe (Greenpoint)": "https://www.google.com/maps/search/?api=1&query=The%20Arch%20Cafe%20Greenpoint%20New%20York%20NY"
    },
    "blurb": "The viral lunch of the decade. Crisp romaine, parmesan, grilled or fried chicken bundled in a tortilla. The shops that built the cult.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Milano Market (multiple locations)",
          "Lenwich (multiple locations)",
          "Bobwhite Counter (multiple locations)",
          "Jacob's Pickles (Upper West Side)",
          "Heavenly Market (multiple locations)",
          "La Villa Pizzeria (multiple locations)",
          "Compton's (multiple locations)",
          "Brown Bag Sandwich (multiple locations)",
          "Edith's (Williamsburg)",
          "Smith Gourmet Deli (Cobble Hill)"
        ]
      },
      "modernluxury": {
        "label": "Modern Luxury · Gotham",
        "items": [
          "Milano Market (multiple locations)",
          "Lenwich (multiple locations)",
          "Heavenly Market (multiple locations)",
          "La Villa Pizzeria (multiple locations)",
          "Bobwhite Counter (multiple locations)",
          "Jacob's Pickles (Upper West Side)",
          "The Arch Cafe (Greenpoint)",
          "Compton's (multiple locations)",
          "Brown Bag Sandwich (multiple locations)",
          "Edith's (Williamsburg)"
        ],
        "url": "https://www.modernluxury.com/best-chicken-caesar-salad-wrap-nyc-tik-tok/"
      },
      "infatuation": {
        "label": "The Infatuation",
        "items": [
          "Milano Market (multiple locations)",
          "Lenwich (multiple locations)",
          "Bobwhite Counter (multiple locations)",
          "Jacob's Pickles (Upper West Side)",
          "Compton's (multiple locations)",
          "Brown Bag Sandwich (multiple locations)",
          "Edith's (Williamsburg)",
          "Smith Gourmet Deli (Cobble Hill)",
          "Heavenly Market (multiple locations)",
          "La Villa Pizzeria (multiple locations)"
        ]
      },
      "yelp": {
        "label": "Yelp Top 10",
        "items": [
          "Brown Bag Sandwich (multiple locations)",
          "Bobwhite Counter (multiple locations)",
          "Edith's (Williamsburg)",
          "Jacob's Pickles (Upper West Side)",
          "Sunny and Annie's (East Village)",
          "Milano Market (multiple locations)",
          "Smith Gourmet Deli (Cobble Hill)",
          "Compton's (multiple locations)",
          "Lenwich (multiple locations)",
          "Heavenly Market (multiple locations)"
        ],
        "url": "https://www.yelp.com/search?find_desc=Chicken+Caesar+Wrap&find_loc=New+York,+NY"
      }
    },
    "vote": {
      "items": [
        "Milano Market (multiple locations)",
        "Lenwich (multiple locations)",
        "Bobwhite Counter (multiple locations)",
        "Jacob's Pickles (Upper West Side)",
        "Edith's (Williamsburg)",
        "Heavenly Market (multiple locations)",
        "Compton's (multiple locations)",
        "La Villa Pizzeria (multiple locations)",
        "Brown Bag Sandwich (multiple locations)",
        "Smith Gourmet Deli (Cobble Hill)"
      ]
    }
  },
  {
    "id": "caesar-wraps-la",
    "publishedDate": "2026-05-26",
    "publishedAt": "2026-05-26T12:00:00Z",
    "title": "Best Chicken Caesar Wraps in LA",
    "category": "Los Angeles",
    "type": "stores",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Aroma Coffee & Tea (Studio City)": "https://www.google.com/maps/search/?api=1&query=Aroma%20Coffee%20Tea%20Studio%20City",
      "Black Rabbit Cafe (Valley Village)": "https://www.google.com/maps/search/?api=1&query=Black%20Rabbit%20Cafe%20Valley%20Village",
      "Cafe Bizou (Sherman Oaks)": "https://www.google.com/maps/search/?api=1&query=Cafe%20Bizou%20Sherman%20Oaks",
      "Garden Cafe (Sherman Oaks)": "https://www.google.com/maps/search/?api=1&query=Garden%20Cafe%20Sherman%20Oaks",
      "Ggiata (Melrose Hill)": "https://www.google.com/maps/search/?api=1&query=Ggiata%20Melrose%20Hill",
      "Ggiata West Hollywood (West Hollywood)": "https://www.google.com/maps/search/?api=1&query=Ggiata%20West%20Hollywood%20West%20Hollywood",
      "Goop Kitchen (multiple locations)": "https://www.google.com/maps/search/?api=1&query=Goop%20Kitchen%20multiple%20locations",
      "Il Tramezzino (Studio City)": "https://www.google.com/maps/search/?api=1&query=Il%20Tramezzino%20Studio%20City",
      "Joan's on Third (Beverly Grove)": "https://www.google.com/maps/search/?api=1&query=Joan%20s%20on%20Third%20Beverly%20Grove",
      "Leora Cafe (Beverly Hills)": "https://www.google.com/maps/search/?api=1&query=Leora%20Cafe%20Beverly%20Hills",
      "Uncle Paulie's Deli (Beverly Grove)": "https://www.google.com/maps/search/?api=1&query=Uncle%20Paulie%20s%20Deli%20Beverly%20Grove"
    },
    "blurb": "Ggiata started a movement and the rest of the city followed. Crispy chicken, romaine, parmesan. The only debate is the dressing.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Ggiata (Melrose Hill)",
          "Uncle Paulie's Deli (Beverly Grove)",
          "Goop Kitchen (multiple locations)",
          "Garden Cafe (Sherman Oaks)",
          "Aroma Coffee & Tea (Studio City)",
          "Il Tramezzino (Studio City)",
          "Joan's on Third (Beverly Grove)",
          "Cafe Bizou (Sherman Oaks)",
          "Black Rabbit Cafe (Valley Village)",
          "Leora Cafe (Beverly Hills)"
        ]
      },
      "yelp": {
        "label": "Yelp Top 10",
        "items": [
          "Ggiata (Melrose Hill)",
          "Uncle Paulie's Deli (Beverly Grove)",
          "Garden Cafe (Sherman Oaks)",
          "Aroma Coffee & Tea (Studio City)",
          "Goop Kitchen (multiple locations)",
          "Ggiata West Hollywood (West Hollywood)",
          "Il Tramezzino (Studio City)",
          "Black Rabbit Cafe (Valley Village)",
          "Joan's on Third (Beverly Grove)",
          "Leora Cafe (Beverly Hills)"
        ],
        "url": "https://www.yelp.com/search?find_desc=Chicken+Caesar+Wrap&find_loc=Los+Angeles,+CA"
      },
      "latimes": {
        "label": "LA Times · Eater LA",
        "items": [
          "Ggiata (Melrose Hill)",
          "Uncle Paulie's Deli (Beverly Grove)",
          "Cafe Bizou (Sherman Oaks)",
          "Joan's on Third (Beverly Grove)",
          "Goop Kitchen (multiple locations)",
          "Il Tramezzino (Studio City)",
          "Garden Cafe (Sherman Oaks)",
          "Aroma Coffee & Tea (Studio City)",
          "Black Rabbit Cafe (Valley Village)",
          "Leora Cafe (Beverly Hills)"
        ]
      },
      "timeout": {
        "label": "Time Out Los Angeles",
        "items": [
          "Ggiata (Melrose Hill)",
          "Goop Kitchen (multiple locations)",
          "Uncle Paulie's Deli (Beverly Grove)",
          "Joan's on Third (Beverly Grove)",
          "Garden Cafe (Sherman Oaks)",
          "Leora Cafe (Beverly Hills)",
          "Cafe Bizou (Sherman Oaks)",
          "Aroma Coffee & Tea (Studio City)",
          "Il Tramezzino (Studio City)",
          "Black Rabbit Cafe (Valley Village)"
        ]
      }
    },
    "vote": {
      "items": [
        "Ggiata (Melrose Hill)",
        "Uncle Paulie's Deli (Beverly Grove)",
        "Goop Kitchen (multiple locations)",
        "Joan's on Third (Beverly Grove)",
        "Garden Cafe (Sherman Oaks)",
        "Il Tramezzino (Studio City)",
        "Aroma Coffee & Tea (Studio City)",
        "Cafe Bizou (Sherman Oaks)",
        "Leora Cafe (Beverly Hills)",
        "Black Rabbit Cafe (Valley Village)"
      ]
    }
  },
  {
    "id": "caesar-wraps-miami",
    "publishedDate": "2026-05-26",
    "publishedAt": "2026-05-26T13:00:00Z",
    "title": "Best Chicken Caesar Wraps in Miami",
    "category": "Miami",
    "type": "stores",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Cafe Papillon By The Beach (North Beach)": "https://www.google.com/maps/search/?api=1&query=Cafe%20Papillon%20By%20The%20Beach%20North%20Beach",
      "Carrot Express (multiple locations)": "https://www.google.com/maps/search/?api=1&query=Carrot%20Express%20multiple%20locations",
      "Giardino (multiple locations)": "https://www.google.com/maps/search/?api=1&query=Giardino%20multiple%20locations",
      "High Tide (South Beach)": "https://www.google.com/maps/search/?api=1&query=High%20Tide%20South%20Beach",
      "Mister O1 South Beach (South Beach)": "https://www.google.com/maps/search/?api=1&query=Mister%20O1%20South%20Beach%20South%20Beach",
      "Pane e Vino (South Beach)": "https://www.google.com/maps/search/?api=1&query=Pane%20e%20Vino%20South%20Beach",
      "Pura Vida Miami (multiple locations)": "https://www.google.com/maps/search/?api=1&query=Pura%20Vida%20Miami%20multiple%20locations",
      "Tap 42 (Midtown)": "https://www.google.com/maps/search/?api=1&query=Tap%2042%20Midtown",
      "The Brightside (Coral Way)": "https://www.google.com/maps/search/?api=1&query=The%20Brightside%20Coral%20Way",
      "Vinny's Cafe (Boca Raton)": "https://www.google.com/maps/search/?api=1&query=Vinny%20s%20Cafe%20Boca%20Raton"
    },
    "blurb": "Boca's Vinny's Cafe set Florida on fire. The Miami spots that followed bring beach-town twists to the viral wrap.",
    "defaultSource": "ai",
    "itemLinks": {
      "Tap 42 (Midtown)": "https://tap42.com",
      "Vinny's Cafe (Boca Raton)": "https://vinnyscafe.net",
      "The Brightside (Coral Way)": "https://brightsidemiami.com",
      "Carrot Express (multiple locations)": "https://carrotexpress.com",
      "Pura Vida Miami (multiple locations)": "https://puravidamiami.com",
      "Mister O1 South Beach (South Beach)": "https://mistero1.com",
      "Pane e Vino (South Beach)": "https://paneevinomia.com",
      "Cafe Papillon By The Beach (North Beach)": "https://thecafepapillon.com",
      "Giardino (multiple locations)": "https://giardinosalads.com"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Tap 42 (Midtown)",
          "Vinny's Cafe (Boca Raton)",
          "The Brightside (Coral Way)",
          "Carrot Express (multiple locations)",
          "Pura Vida Miami (multiple locations)",
          "Mister O1 South Beach (South Beach)",
          "Pane e Vino (South Beach)",
          "Cafe Papillon By The Beach (North Beach)",
          "Giardino (multiple locations)",
          "High Tide (South Beach)"
        ]
      },
      "miaminewtimes": {
        "label": "Miami New Times",
        "items": [
          "Vinny's Cafe (Boca Raton)",
          "Tap 42 (Midtown)",
          "The Brightside (Coral Way)",
          "Pura Vida Miami (multiple locations)",
          "Carrot Express (multiple locations)",
          "Giardino (multiple locations)",
          "Mister O1 South Beach (South Beach)",
          "Pane e Vino (South Beach)",
          "High Tide (South Beach)",
          "Cafe Papillon By The Beach (North Beach)"
        ]
      },
      "yelp": {
        "label": "Yelp Top 10",
        "items": [
          "Carrot Express (multiple locations)",
          "The Brightside (Coral Way)",
          "Pura Vida Miami (multiple locations)",
          "Mister O1 South Beach (South Beach)",
          "Pane e Vino (South Beach)",
          "Cafe Papillon By The Beach (North Beach)",
          "High Tide (South Beach)",
          "Tap 42 (Midtown)",
          "Giardino (multiple locations)",
          "Vinny's Cafe (Boca Raton)"
        ],
        "url": "https://www.yelp.com/search?find_desc=Chicken+Caesar+Wrap&find_loc=Miami,+FL"
      },
      "timeout": {
        "label": "Time Out Miami",
        "items": [
          "Tap 42 (Midtown)",
          "Vinny's Cafe (Boca Raton)",
          "Pura Vida Miami (multiple locations)",
          "Carrot Express (multiple locations)",
          "The Brightside (Coral Way)",
          "Giardino (multiple locations)",
          "Pane e Vino (South Beach)",
          "Mister O1 South Beach (South Beach)",
          "High Tide (South Beach)",
          "Cafe Papillon By The Beach (North Beach)"
        ]
      }
    },
    "vote": {
      "items": [
        "Tap 42 (Midtown)",
        "Vinny's Cafe (Boca Raton)",
        "Carrot Express (multiple locations)",
        "The Brightside (Coral Way)",
        "Pura Vida Miami (multiple locations)",
        "Giardino (multiple locations)",
        "Mister O1 South Beach (South Beach)",
        "Pane e Vino (South Beach)",
        "High Tide (South Beach)",
        "Cafe Papillon By The Beach (North Beach)"
      ]
    }
  },
  {
    "id": "caesar-wraps-chicago",
    "publishedDate": "2026-05-26",
    "publishedAt": "2026-05-26T14:00:00Z",
    "title": "Best Chicken Caesar Wraps in Chicago",
    "category": "Chicago",
    "type": "stores",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Buttermilk Fry (Wicker Park)": "https://www.google.com/maps/search/?api=1&query=Buttermilk%20Fry%20Wicker%20Park",
      "D'Amato's Bakery (West Town)": "https://www.google.com/maps/search/?api=1&query=D%20Amato%20s%20Bakery%20West%20Town",
      "GG's Chicken Shop (Lakeview)": "https://www.google.com/maps/search/?api=1&query=GG%20s%20Chicken%20Shop%20Lakeview",
      "Little Victories (Wicker Park)": "https://www.google.com/maps/search/?api=1&query=Little%20Victories%20Wicker%20Park",
      "Moonwalker (Avondale)": "https://www.google.com/maps/search/?api=1&query=Moonwalker%20Avondale",
      "Nohea Cafe (West Loop)": "https://www.google.com/maps/search/?api=1&query=Nohea%20Cafe%20West%20Loop",
      "Pompeii (Little Italy)": "https://www.google.com/maps/search/?api=1&query=Pompeii%20Little%20Italy",
      "Punky's Pizza & Pasta (Bridgeport)": "https://www.google.com/maps/search/?api=1&query=Punky%20s%20Pizza%20Pasta%20Bridgeport",
      "Spilt Milk (Logan Square)": "https://www.google.com/maps/search/?api=1&query=Spilt%20Milk%20Logan%20Square",
      "Village Tap (Roscoe Village)": "https://www.google.com/maps/search/?api=1&query=Village%20Tap%20Roscoe%20Village"
    },
    "blurb": "From Bridgeport flatbread originals to Wicker Park fried chicken collabs. The CCW capital of the Midwest.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Punky's Pizza & Pasta (Bridgeport)",
          "Little Victories (Wicker Park)",
          "Nohea Cafe (West Loop)",
          "Village Tap (Roscoe Village)",
          "Moonwalker (Avondale)",
          "GG's Chicken Shop (Lakeview)",
          "D'Amato's Bakery (West Town)",
          "Pompeii (Little Italy)",
          "Buttermilk Fry (Wicker Park)",
          "Spilt Milk (Logan Square)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation 8 Best",
        "items": [
          "Punky's Pizza & Pasta (Bridgeport)",
          "Little Victories (Wicker Park)",
          "Nohea Cafe (West Loop)",
          "Village Tap (Roscoe Village)",
          "Moonwalker (Avondale)",
          "Buttermilk Fry (Wicker Park)",
          "GG's Chicken Shop (Lakeview)",
          "D'Amato's Bakery (West Town)",
          "Spilt Milk (Logan Square)",
          "Pompeii (Little Italy)"
        ],
        "url": "https://www.theinfatuation.com/chicago/guides/best-caesar-wraps-chicago"
      },
      "tribune": {
        "label": "Chicago Tribune",
        "items": [
          "Punky's Pizza & Pasta (Bridgeport)",
          "Nohea Cafe (West Loop)",
          "Village Tap (Roscoe Village)",
          "Moonwalker (Avondale)",
          "Little Victories (Wicker Park)",
          "GG's Chicken Shop (Lakeview)",
          "Buttermilk Fry (Wicker Park)",
          "D'Amato's Bakery (West Town)",
          "Pompeii (Little Italy)",
          "Spilt Milk (Logan Square)"
        ]
      },
      "yelp": {
        "label": "Yelp Top 10",
        "items": [
          "Little Victories (Wicker Park)",
          "Punky's Pizza & Pasta (Bridgeport)",
          "Nohea Cafe (West Loop)",
          "GG's Chicken Shop (Lakeview)",
          "Village Tap (Roscoe Village)",
          "D'Amato's Bakery (West Town)",
          "Moonwalker (Avondale)",
          "Buttermilk Fry (Wicker Park)",
          "Pompeii (Little Italy)",
          "Spilt Milk (Logan Square)"
        ],
        "url": "https://www.yelp.com/search?find_desc=Chicken+Caesar+Wrap&find_loc=Chicago,+IL"
      }
    },
    "vote": {
      "items": [
        "Punky's Pizza & Pasta (Bridgeport)",
        "Little Victories (Wicker Park)",
        "Nohea Cafe (West Loop)",
        "Village Tap (Roscoe Village)",
        "Moonwalker (Avondale)",
        "GG's Chicken Shop (Lakeview)",
        "Buttermilk Fry (Wicker Park)",
        "D'Amato's Bakery (West Town)",
        "Pompeii (Little Italy)",
        "Spilt Milk (Logan Square)"
      ]
    }
  },
  {
    "id": "cocktails-williamsburg",
    "publishedDate": "2026-05-25",
    "publishedAt": "2026-05-25T14:00:00Z",
    "title": "Best Cocktail Bars in Williamsburg",
    "category": "Williamsburg, Brooklyn",
    "type": "stores",
    "tags": [
      "bars",
      "nightlife",
      "food-drink",
      "stores",
      "entertainment"
    ],
    "linkType": "mapsCity",
    "blurb": "Oyster-bar standards, rooftop skyline pours, and the no-menu mixology rooms that put Brooklyn on the cocktail map.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Maison Premiere",
          "Fresh Kills Bar",
          "Bar Blondeau",
          "Westlight",
          "Rose Marie",
          "Bar Madonna",
          "Sauced",
          "Layla",
          "Pokito",
          "Le Crocodile"
        ]
      },
      "infatuation": {
        "label": "The Infatuation 22 Best",
        "items": [
          "Maison Premiere",
          "Rose Marie",
          "Bar Blondeau",
          "Sauced",
          "Layla",
          "Fresh Kills Bar",
          "Bar Madonna",
          "Westlight",
          "Mo's General",
          "Le Crocodile"
        ],
        "url": "https://www.theinfatuation.com/new-york/guides/the-best-williamsburg-bars"
      },
      "timeout": {
        "label": "Time Out New York",
        "items": [
          "Maison Premiere",
          "Bar Madonna",
          "Velvet Brooklyn",
          "The Twenty Bar",
          "Fresh Kills Bar",
          "Pokito",
          "Westlight",
          "Bar Blondeau",
          "Bar Milagro",
          "Layla"
        ],
        "url": "https://www.timeout.com/newyork/bars/best-bars-in-williamsburg"
      },
      "worlds50best": {
        "label": "World's 50 Best Bars (NA)",
        "items": [
          "Maison Premiere",
          "Fresh Kills Bar",
          "Bar Blondeau",
          "Rose Marie",
          "Le Crocodile",
          "Westlight",
          "Bar Madonna",
          "Layla",
          "Sauced",
          "Pokito"
        ],
        "url": "https://www.theworlds50best.com/bars/northamerica/list/"
      }
    },
    "vote": {
      "items": [
        "Maison Premiere",
        "Fresh Kills Bar",
        "Bar Blondeau",
        "Westlight",
        "Rose Marie",
        "Bar Madonna",
        "Le Crocodile",
        "Layla",
        "Sauced",
        "Pokito"
      ]
    }
  },
  {
    "id": "live-music-nyc",
    "publishedDate": "2026-05-25",
    "publishedAt": "2026-05-25T15:00:00Z",
    "title": "Best Live Music Bars in NYC",
    "category": "New York",
    "type": "stores",
    "tags": [
      "bars",
      "nightlife",
      "food-drink",
      "stores",
      "entertainment"
    ],
    "linkType": "mapsCity",
    "links": {
      "Arlene's Grocery (Lower East Side)": "https://www.google.com/maps/search/?api=1&query=Arlene%20s%20Grocery%20Lower%20East%20Side%20New%20York%20NY",
      "Baby's All Right (Williamsburg)": "https://www.google.com/maps/search/?api=1&query=Baby%20s%20All%20Right%20Williamsburg%20New%20York%20NY",
      "Birdland Jazz Club (Theater District)": "https://www.google.com/maps/search/?api=1&query=Birdland%20Jazz%20Club%20Theater%20District%20New%20York%20NY",
      "Blue Note Jazz Club (Greenwich Village)": "https://www.google.com/maps/search/?api=1&query=Blue%20Note%20Jazz%20Club%20Greenwich%20Village%20New%20York%20NY",
      "Bowery Ballroom (Lower East Side)": "https://www.google.com/maps/search/?api=1&query=Bowery%20Ballroom%20Lower%20East%20Side%20New%20York%20NY",
      "Bowery Electric (East Village)": "https://www.google.com/maps/search/?api=1&query=Bowery%20Electric%20East%20Village%20New%20York%20NY",
      "Highline Ballroom (Chelsea)": "https://www.google.com/maps/search/?api=1&query=Highline%20Ballroom%20Chelsea%20New%20York%20NY",
      "Mercury Lounge (Lower East Side)": "https://www.google.com/maps/search/?api=1&query=Mercury%20Lounge%20Lower%20East%20Side%20New%20York%20NY",
      "Music Hall of Williamsburg (Williamsburg)": "https://www.google.com/maps/search/?api=1&query=Music%20Hall%20of%20Williamsburg%20Williamsburg%20New%20York%20NY",
      "Pete's Candy Store (Williamsburg)": "https://www.google.com/maps/search/?api=1&query=Pete%20s%20Candy%20Store%20Williamsburg%20New%20York%20NY",
      "Pianos (Lower East Side)": "https://www.google.com/maps/search/?api=1&query=Pianos%20Lower%20East%20Side%20New%20York%20NY",
      "Rockwood Music Hall (Lower East Side)": "https://www.google.com/maps/search/?api=1&query=Rockwood%20Music%20Hall%20Lower%20East%20Side%20New%20York%20NY",
      "Slake (Midtown West)": "https://www.google.com/maps/search/?api=1&query=Slake%20Midtown%20West%20New%20York%20NY",
      "Terra Blues (Greenwich Village)": "https://www.google.com/maps/search/?api=1&query=Terra%20Blues%20Greenwich%20Village%20New%20York%20NY",
      "The Bitter End (Greenwich Village)": "https://www.google.com/maps/search/?api=1&query=The%20Bitter%20End%20Greenwich%20Village%20New%20York%20NY",
      "The Django (Tribeca)": "https://www.google.com/maps/search/?api=1&query=The%20Django%20Tribeca%20New%20York%20NY",
      "Village Vanguard (West Village)": "https://www.google.com/maps/search/?api=1&query=Village%20Vanguard%20West%20Village%20New%20York%20NY"
    },
    "blurb": "The rooms where Vampire Weekend, The Strokes, and a thousand more got their break. Indie, jazz, and the rising acts you'll claim you saw first.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Bowery Ballroom (Lower East Side)",
          "Mercury Lounge (Lower East Side)",
          "Music Hall of Williamsburg (Williamsburg)",
          "Rockwood Music Hall (Lower East Side)",
          "Arlene's Grocery (Lower East Side)",
          "Blue Note Jazz Club (Greenwich Village)",
          "Village Vanguard (West Village)",
          "Birdland Jazz Club (Theater District)",
          "Baby's All Right (Williamsburg)",
          "The Bitter End (Greenwich Village)"
        ]
      },
      "timeout": {
        "label": "Time Out New York",
        "items": [
          "Bowery Ballroom (Lower East Side)",
          "Music Hall of Williamsburg (Williamsburg)",
          "Mercury Lounge (Lower East Side)",
          "Baby's All Right (Williamsburg)",
          "Rockwood Music Hall (Lower East Side)",
          "Village Vanguard (West Village)",
          "Blue Note Jazz Club (Greenwich Village)",
          "Birdland Jazz Club (Theater District)",
          "Pete's Candy Store (Williamsburg)",
          "The Django (Tribeca)"
        ],
        "url": "https://www.timeout.com/newyork/music/best-live-music-venues-in-new-york-city"
      },
      "happyhour": {
        "label": "Happy Hour NYC Guide",
        "items": [
          "Baby's All Right (Williamsburg)",
          "Birdland Jazz Club (Theater District)",
          "Blue Note Jazz Club (Greenwich Village)",
          "Bowery Ballroom (Lower East Side)",
          "Mercury Lounge (Lower East Side)",
          "Pete's Candy Store (Williamsburg)",
          "Rockwood Music Hall (Lower East Side)",
          "Terra Blues (Greenwich Village)",
          "The Django (Tribeca)",
          "Village Vanguard (West Village)"
        ],
        "url": "https://happy-hour.nyc/deals/live-music-bars-nyc"
      },
      "gwepa": {
        "label": "GWEPA 55 Best Venues",
        "items": [
          "Bowery Ballroom (Lower East Side)",
          "Mercury Lounge (Lower East Side)",
          "Rockwood Music Hall (Lower East Side)",
          "Bowery Electric (East Village)",
          "Arlene's Grocery (Lower East Side)",
          "Highline Ballroom (Chelsea)",
          "Music Hall of Williamsburg (Williamsburg)",
          "Pianos (Lower East Side)",
          "The Bitter End (Greenwich Village)",
          "Slake (Midtown West)"
        ],
        "url": "https://www.gwepa.com/the-55-best-live-music-venues-in-nyc/"
      }
    },
    "vote": {
      "items": [
        "Bowery Ballroom (Lower East Side)",
        "Mercury Lounge (Lower East Side)",
        "Village Vanguard (West Village)",
        "Music Hall of Williamsburg (Williamsburg)",
        "Blue Note Jazz Club (Greenwich Village)",
        "Rockwood Music Hall (Lower East Side)",
        "Baby's All Right (Williamsburg)",
        "Birdland Jazz Club (Theater District)",
        "Arlene's Grocery (Lower East Side)",
        "The Bitter End (Greenwich Village)"
      ]
    }
  },
  {
    "id": "dive-bars-williamsburg",
    "publishedDate": "2026-05-26",
    "publishedAt": "2026-05-26T15:00:00Z",
    "title": "Best Dive Bars in Williamsburg",
    "category": "Williamsburg, Brooklyn",
    "type": "stores",
    "tags": [
      "bars",
      "nightlife",
      "food-drink",
      "stores",
      "entertainment"
    ],
    "linkType": "mapsCity",
    "blurb": "Sticky floors, cheap beer, classic rock jukeboxes. The bars that resisted the gentrification or learned to coexist with it.",
    "defaultSource": "ai",
    "itemLinks": {
      "The Commodore": "https://thecommodorebars.com",
      "Skinny Dennis": "https://skinnydennisbrooklyn.com",
      "Duff's Brooklyn": "https://duffsbrooklyn.com",
      "Pete's Candy Store": "https://petescandystore.com",
      "Boobie Trap": "https://boobietrapbrooklyn.com"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "The Commodore",
          "Rocka Rolla",
          "Turkey's Nest",
          "Skinny Dennis",
          "Sharlene's",
          "Duff's Brooklyn",
          "R Bar",
          "Clem's",
          "Pete's Candy Store",
          "Boobie Trap"
        ]
      },
      "infatuation": {
        "label": "The Infatuation",
        "items": [
          "Rocka Rolla",
          "The Commodore",
          "Turkey's Nest",
          "Clem's",
          "R Bar",
          "Duff's Brooklyn",
          "Skinny Dennis",
          "Sharlene's",
          "Pete's Candy Store",
          "Boobie Trap"
        ],
        "url": "https://www.theinfatuation.com/new-york/guides/the-best-williamsburg-bars"
      },
      "timeout": {
        "label": "Time Out New York",
        "items": [
          "The Commodore",
          "Skinny Dennis",
          "Turkey's Nest",
          "Rocka Rolla",
          "R Bar",
          "Duff's Brooklyn",
          "Sharlene's",
          "Clem's",
          "Boobie Trap",
          "Pete's Candy Store"
        ],
        "url": "https://www.timeout.com/newyork/bars/best-bars-in-williamsburg"
      },
      "vinepair": {
        "label": "VinePair 20 Best",
        "items": [
          "Duff's Brooklyn",
          "The Commodore",
          "Turkey's Nest",
          "Skinny Dennis",
          "Rocka Rolla",
          "Sharlene's",
          "Clem's",
          "Pete's Candy Store",
          "R Bar",
          "Boobie Trap"
        ],
        "url": "https://vinepair.com/articles/best-dive-bars-new-york-city/"
      }
    },
    "vote": {
      "items": [
        "The Commodore",
        "Turkey's Nest",
        "Skinny Dennis",
        "Rocka Rolla",
        "Duff's Brooklyn",
        "Sharlene's",
        "Clem's",
        "Pete's Candy Store",
        "R Bar",
        "Boobie Trap"
      ]
    }
  },
  {
    "id": "dive-bars-greenpoint",
    "publishedDate": "2026-05-26",
    "publishedAt": "2026-05-26T16:00:00Z",
    "title": "Best Dive Bars in Greenpoint",
    "category": "Greenpoint, Brooklyn",
    "type": "stores",
    "tags": [
      "bars",
      "nightlife",
      "food-drink",
      "stores",
      "entertainment"
    ],
    "linkType": "mapsCity",
    "blurb": "Pinball machines, jello shots, and the Polish bar crawls that put Greenpoint on the map. Where the G train regulars roost.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Black Rabbit",
          "Sunshine Laundromat & Pinball",
          "Lake Street",
          "The Drift",
          "Temkin's Bar",
          "Broken Land",
          "The Capri Social Club",
          "Palace Cafe",
          "The Moonlight Mile",
          "Connie O's Pub"
        ]
      },
      "infatuation": {
        "label": "The Infatuation",
        "items": [
          "Lake Street",
          "Sunshine Laundromat & Pinball",
          "Black Rabbit",
          "Broken Land",
          "The Drift",
          "Temkin's Bar",
          "Palace Cafe",
          "Connie O's Pub",
          "The Capri Social Club",
          "The Moonlight Mile"
        ],
        "url": "https://www.theinfatuation.com/new-york/guides/greenpoint-bars"
      },
      "yelp": {
        "label": "Yelp Top 10",
        "items": [
          "Temkin's Bar",
          "A Bar",
          "Broken Land",
          "Lake Street",
          "The Drift",
          "The Capri Social Club",
          "Sunshine Laundromat & Pinball",
          "The Moonlight Mile",
          "Oak and Iron",
          "Black Rabbit"
        ]
      },
      "timeout": {
        "label": "Time Out New York",
        "items": [
          "Black Rabbit",
          "Sunshine Laundromat & Pinball",
          "The Drift",
          "Lake Street",
          "Temkin's Bar",
          "Palace Cafe",
          "Broken Land",
          "Connie O's Pub",
          "The Capri Social Club",
          "The Moonlight Mile"
        ]
      }
    },
    "vote": {
      "items": [
        "Black Rabbit",
        "Sunshine Laundromat & Pinball",
        "Lake Street",
        "Temkin's Bar",
        "The Drift",
        "Broken Land",
        "Palace Cafe",
        "The Capri Social Club",
        "Connie O's Pub",
        "The Moonlight Mile"
      ]
    }
  },
  {
    "id": "dive-bars-east-village",
    "publishedDate": "2026-05-26",
    "publishedAt": "2026-05-26T17:00:00Z",
    "title": "Best Dive Bars in the East Village",
    "category": "East Village",
    "type": "stores",
    "tags": [
      "bars",
      "nightlife",
      "food-drink",
      "stores",
      "entertainment"
    ],
    "linkType": "mapsCity",
    "blurb": "McSorley's since 1854. Lucy's reborn. The grit and grime that gave New York nightlife its reputation.",
    "defaultSource": "ai",
    "itemLinks": {
      "McSorley's Old Ale House": "https://mcsorleysoldalehouse.nyc",
      "Holiday Cocktail Lounge": "https://holidaycocktaillounge.bar",
      "Cherry Tavern": "https://cherrytavern.com",
      "Milano's Bar": "https://milanosbar.com"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "McSorley's Old Ale House",
          "Lucy's",
          "Holiday Cocktail Lounge",
          "Tile Bar",
          "Sophie's",
          "KGB Bar",
          "Blue & Gold Tavern",
          "Cherry Tavern",
          "Mona's",
          "Milano's Bar"
        ]
      },
      "infatuation": {
        "label": "The Infatuation",
        "items": [
          "Lucy's",
          "Holiday Cocktail Lounge",
          "McSorley's Old Ale House",
          "Tile Bar",
          "Sophie's",
          "KGB Bar",
          "Blue & Gold Tavern",
          "Mona's",
          "Cherry Tavern",
          "Milano's Bar"
        ],
        "url": "https://www.theinfatuation.com/new-york/guides/the-best-bars-in-the-east-village"
      },
      "vinepair": {
        "label": "VinePair 20 Best",
        "items": [
          "Sophie's",
          "McSorley's Old Ale House",
          "Holiday Cocktail Lounge",
          "Lucy's",
          "Blue & Gold Tavern",
          "Tile Bar",
          "KGB Bar",
          "Mona's",
          "Milano's Bar",
          "Cherry Tavern"
        ],
        "url": "https://vinepair.com/articles/best-dive-bars-new-york-city/"
      },
      "timeout": {
        "label": "Time Out New York",
        "items": [
          "McSorley's Old Ale House",
          "Holiday Cocktail Lounge",
          "Lucy's",
          "Tile Bar",
          "Sophie's",
          "Blue & Gold Tavern",
          "KGB Bar",
          "Milano's Bar",
          "Mona's",
          "Cherry Tavern"
        ],
        "url": "https://www.timeout.com/newyork/bars/best-bars-in-east-village"
      }
    },
    "vote": {
      "items": [
        "McSorley's Old Ale House",
        "Lucy's",
        "Holiday Cocktail Lounge",
        "Tile Bar",
        "Sophie's",
        "KGB Bar",
        "Blue & Gold Tavern",
        "Mona's",
        "Milano's Bar",
        "Cherry Tavern"
      ]
    }
  },
  {
    "id": "dive-bars-greenwich-village",
    "publishedDate": "2026-05-26",
    "publishedAt": "2026-05-26T18:00:00Z",
    "title": "Best Dive Bars in Greenwich Village",
    "category": "Greenwich Village",
    "type": "stores",
    "tags": [
      "bars",
      "nightlife",
      "food-drink",
      "stores",
      "entertainment"
    ],
    "linkType": "mapsCity",
    "blurb": "Where the Beats drank. Where Dylan sang. Time-capsule bars on the same blocks as Bleecker Street tourists.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Kettle of Fish",
          "Down the Hatch",
          "Johnny's Bar",
          "Julius'",
          "The Four-Faced Liar",
          "Peculier Pub",
          "Bleecker Street Bar",
          "The Library",
          "PubKey",
          "Fish Bar"
        ]
      },
      "eater": {
        "label": "Eater NY 25 Best",
        "items": [
          "Johnny's Bar",
          "Julius'",
          "Kettle of Fish",
          "Down the Hatch",
          "The Four-Faced Liar",
          "Bleecker Street Bar",
          "Peculier Pub",
          "The Library",
          "PubKey",
          "Fish Bar"
        ]
      },
      "yelp": {
        "label": "Yelp Top 10",
        "items": [
          "124 Old Rabbit Club",
          "The Four-Faced Liar",
          "PubKey",
          "Wide Shut",
          "Beltane",
          "The Library",
          "Peculier Pub",
          "Park Bar",
          "Johnny's Bar",
          "Bleecker Street Bar"
        ]
      },
      "timeout": {
        "label": "Time Out New York",
        "items": [
          "Kettle of Fish",
          "Johnny's Bar",
          "Julius'",
          "Down the Hatch",
          "The Four-Faced Liar",
          "Bleecker Street Bar",
          "The Library",
          "Peculier Pub",
          "PubKey",
          "Fish Bar"
        ],
        "url": "https://www.timeout.com/newyork/bars/bars-in-greenwich-village-where-to-go-out-and-drink"
      }
    },
    "vote": {
      "items": [
        "Kettle of Fish",
        "Johnny's Bar",
        "Down the Hatch",
        "Julius'",
        "The Four-Faced Liar",
        "Peculier Pub",
        "Bleecker Street Bar",
        "The Library",
        "PubKey",
        "Fish Bar"
      ]
    }
  },
  {
    "id": "dive-bars-cape-cod",
    "publishedDate": "2026-05-26",
    "publishedAt": "2026-05-26T19:00:00Z",
    "title": "Best Dive Bars on Cape Cod",
    "category": "Cape Cod",
    "type": "stores",
    "tags": [
      "bars",
      "nightlife",
      "food-drink",
      "stores",
      "entertainment",
      "travel"
    ],
    "linkType": "mapsCity",
    "links": {
      "Old Colony Tap (Provincetown)": "https://www.google.com/maps/search/?api=1&query=Old%20Colony%20Tap%20Provincetown",
      "19th Hole Tavern (Hyannis)": "https://www.google.com/maps/search/?api=1&query=19th%20Hole%20Tavern%20Hyannis",
      "The Fox Hole (Osterville)": "https://www.google.com/maps/search/?api=1&query=The%20Fox%20Hole%20Osterville",
      "Bomb Shelter (Wellfleet)": "https://www.google.com/maps/search/?api=1&query=Bomb%20Shelter%20Wellfleet",
      "The Underground (Provincetown)": "https://www.google.com/maps/search/?api=1&query=The%20Underground%20Provincetown",
      "Chatham Squire (Chatham)": "https://www.google.com/maps/search/?api=1&query=Chatham%20Squire%20Chatham",
      "Sundancer's (West Dennis)": "https://www.google.com/maps/search/?api=1&query=Sundancer%27s%20West%20Dennis",
      "Quarterdeck Lounge (Hyannis)": "https://www.google.com/maps/search/?api=1&query=Quarterdeck%20Lounge%20Hyannis",
      "Duck Inn Pub (Hyannis)": "https://www.google.com/maps/search/?api=1&query=Duck%20Inn%20Pub%20Hyannis",
      "Four Point Tavern (Hyannis)": "https://www.google.com/maps/search/?api=1&query=Four%20Point%20Tavern%20Hyannis"
    },
    "blurb": "Where the locals drink when the summer crowds clear out. Old Colony in P-town, the 19th Hole in Hyannis since 1930, and the Fox Hole patron saint of Osterville.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Old Colony Tap (Provincetown)",
          "19th Hole Tavern (Hyannis)",
          "The Fox Hole (Osterville)",
          "Bomb Shelter (Wellfleet)",
          "The Underground (Provincetown)",
          "Chatham Squire (Chatham)",
          "Sundancer's (West Dennis)",
          "Quarterdeck Lounge (Hyannis)",
          "Duck Inn Pub (Hyannis)",
          "Four Point Tavern (Hyannis)"
        ]
      },
      "capecodchamber": {
        "label": "Cape Cod Chamber",
        "items": [
          "Old Colony Tap (Provincetown)",
          "19th Hole Tavern (Hyannis)",
          "The Fox Hole (Osterville)",
          "Bomb Shelter (Wellfleet)",
          "Sundancer's (West Dennis)",
          "Chatham Squire (Chatham)",
          "The Underground (Provincetown)",
          "Quarterdeck Lounge (Hyannis)",
          "Duck Inn Pub (Hyannis)",
          "Four Point Tavern (Hyannis)"
        ],
        "url": "https://www.capecodchamber.org/articles/stories/post/best-dive-bars-on-cape-cod/"
      },
      "yelp": {
        "label": "Yelp Top Picks",
        "items": [
          "Old Colony Tap (Provincetown)",
          "The Underground (Provincetown)",
          "19th Hole Tavern (Hyannis)",
          "Bomb Shelter (Wellfleet)",
          "The Fox Hole (Osterville)",
          "Chatham Squire (Chatham)",
          "Sundancer's (West Dennis)",
          "Quarterdeck Lounge (Hyannis)",
          "Duck Inn Pub (Hyannis)",
          "Four Point Tavern (Hyannis)"
        ],
        "url": "https://www.yelp.com/search?cflt=divebars&find_loc=Cape+Cod+Bay,+MA"
      },
      "vacationcapecod": {
        "label": "Vacation Cape Cod",
        "items": [
          "Old Colony Tap (Provincetown)",
          "The Underground (Provincetown)",
          "Chatham Squire (Chatham)",
          "The Fox Hole (Osterville)",
          "19th Hole Tavern (Hyannis)",
          "Bomb Shelter (Wellfleet)",
          "Sundancer's (West Dennis)",
          "Quarterdeck Lounge (Hyannis)",
          "Duck Inn Pub (Hyannis)",
          "Four Point Tavern (Hyannis)"
        ]
      }
    },
    "vote": {
      "items": [
        "Old Colony Tap (Provincetown)",
        "19th Hole Tavern (Hyannis)",
        "The Fox Hole (Osterville)",
        "The Underground (Provincetown)",
        "Bomb Shelter (Wellfleet)",
        "Chatham Squire (Chatham)",
        "Sundancer's (West Dennis)",
        "Quarterdeck Lounge (Hyannis)",
        "Duck Inn Pub (Hyannis)",
        "Four Point Tavern (Hyannis)"
      ]
    }
  },
  {
    "id": "cocktails-west-village",
    "publishedDate": "2026-05-26",
    "publishedAt": "2026-05-26T20:00:00Z",
    "title": "Best Cocktail Bars in the West Village",
    "category": "West Village",
    "type": "stores",
    "tags": [
      "bars",
      "nightlife",
      "food-drink",
      "stores",
      "entertainment"
    ],
    "linkType": "mapsCity",
    "blurb": "Dante set the standard when it was named World's Best. Bandits, Little Branch, and Katana Kitten kept the pressure on.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Dante",
          "Bandits",
          "Little Branch",
          "Katana Kitten",
          "Employees Only",
          "Bar Pisellino",
          "Angel's Share",
          "Sip & Guzzle",
          "Bobo",
          "Analogue"
        ]
      },
      "infatuation": {
        "label": "The Infatuation 20 Best",
        "items": [
          "Dante",
          "Katana Kitten",
          "Angel's Share",
          "Sip & Guzzle",
          "Bar Pisellino",
          "Little Branch",
          "Employees Only",
          "Bandits",
          "Bobo",
          "Binx"
        ],
        "url": "https://www.theinfatuation.com/new-york/guides/best-west-village-bars"
      },
      "timeout": {
        "label": "Time Out 14 Best",
        "items": [
          "Dante",
          "Bandits",
          "Little Branch",
          "Employees Only",
          "Bar Pisellino",
          "Katana Kitten",
          "Angel's Share",
          "Analogue",
          "Bobo",
          "Sip & Guzzle"
        ],
        "url": "https://www.timeout.com/newyork/bars/best-bars-in-west-village"
      },
      "worlds50best": {
        "label": "World's 50 Best Bars",
        "items": [
          "Dante",
          "Angel's Share",
          "Katana Kitten",
          "Sip & Guzzle",
          "Employees Only",
          "Little Branch",
          "Bar Pisellino",
          "Bandits",
          "Analogue",
          "Bobo"
        ]
      }
    },
    "vote": {
      "items": [
        "Dante",
        "Bandits",
        "Little Branch",
        "Katana Kitten",
        "Employees Only",
        "Bar Pisellino",
        "Angel's Share",
        "Sip & Guzzle",
        "Analogue",
        "Bobo"
      ]
    }
  },
  {
    "id": "cocktails-soho",
    "publishedDate": "2026-05-26",
    "publishedAt": "2026-05-26T21:00:00Z",
    "title": "Best Cocktail Bars in SoHo",
    "category": "SoHo",
    "type": "stores",
    "tags": [
      "bars",
      "nightlife",
      "food-drink",
      "stores",
      "entertainment"
    ],
    "linkType": "mapsCity",
    "links": {
      "South Soho Bar": "https://www.google.com/maps/search/?api=1&query=South%20Soho%20Bar"
    },
    "blurb": "Hotel hideouts, micro bars tucked above home goods stores, and the speakeasies that survived the neighborhood's gallery-to-luxury pivot.",
    "defaultSource": "ai",
    "itemLinks": {
      "South Soho Bar": "https://sosos.nyc",
      "Sloane's": "https://sloanes.nyc",
      "Milady's": "https://miladysnyc.com",
      "La Compagnie des Vins Surnaturels": "https://compagniewinebar.com",
      "Kabin": "https://kabin.nyc",
      "Foxtail": "https://foxtailnyc.com",
      "Grand Bar": "https://sohogrand.com"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "South Soho Bar",
          "Sloane's",
          "Milady's",
          "Guild Bar",
          "La Compagnie des Vins Surnaturels",
          "Kabin",
          "Foxtail",
          "The Ship",
          "Grand Bar",
          "Broome Street Bar"
        ]
      },
      "infatuation": {
        "label": "The Infatuation 12 Best",
        "items": [
          "South Soho Bar",
          "Milady's",
          "Guild Bar",
          "La Compagnie des Vins Surnaturels",
          "Broome Street Bar",
          "Kabin",
          "Sloane's",
          "Foxtail",
          "The Ship",
          "Grand Bar"
        ],
        "url": "https://www.theinfatuation.com/new-york/guides/soho-nolita-bars-nyc"
      },
      "timeout": {
        "label": "Time Out New York",
        "items": [
          "Sloane's",
          "Kabin",
          "South Soho Bar",
          "Milady's",
          "Grand Bar",
          "Foxtail",
          "Guild Bar",
          "La Compagnie des Vins Surnaturels",
          "The Ship",
          "Broome Street Bar"
        ],
        "url": "https://www.timeout.com/newyork/bars/best-bars-in-soho"
      },
      "sohoweekly": {
        "label": "SoHo Weekly 15 Best",
        "items": [
          "Sloane's",
          "Grand Bar",
          "South Soho Bar",
          "Milady's",
          "Kabin",
          "Guild Bar",
          "Foxtail",
          "La Compagnie des Vins Surnaturels",
          "The Ship",
          "Broome Street Bar"
        ]
      }
    },
    "vote": {
      "items": [
        "South Soho Bar",
        "Sloane's",
        "Milady's",
        "Kabin",
        "Guild Bar",
        "Grand Bar",
        "Foxtail",
        "La Compagnie des Vins Surnaturels",
        "The Ship",
        "Broome Street Bar"
      ]
    }
  },
  {
    "id": "ramen-tokyo",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T11:18:46Z",
    "title": "Best Ramen Shops in Tokyo",
    "category": "Tokyo",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Karashibi Miso Ramen Kikanbo (Kanda)": "https://www.google.com/maps/search/?api=1&query=Karashibi%20Miso%20Ramen%20Kikanbo%20Kanda%20Tokyo%20Japan",
      "Kagura-ya (Suidobashi)": "https://www.google.com/maps/search/?api=1&query=Kagura-ya%20Suidobashi%20Tokyo%20Japan",
      "Haruchan Ramen (Shimbashi)": "https://www.google.com/maps/search/?api=1&query=Haruchan%20Ramen%20Shimbashi%20Tokyo%20Japan",
      "Menya Hyottoko (Yurakucho)": "https://www.google.com/maps/search/?api=1&query=Menya%20Hyottoko%20Yurakucho%20Tokyo%20Japan",
      "Ramen Jiro Mita Honten (Mita)": "https://www.google.com/maps/search/?api=1&query=Ramen%20Jiro%20Mita%20Honten%20Mita%20Tokyo%20Japan",
      "Mensouan Sunada (Sugamo)": "https://www.google.com/maps/search/?api=1&query=Mensouan%20Sunada%20Sugamo%20Tokyo%20Japan",
      "Ramen Machikado (Ebisu)": "https://www.google.com/maps/search/?api=1&query=Ramen%20Machikado%20Ebisu%20Tokyo%20Japan",
      "Ten To Sen (Shimokitazawa)": "https://www.google.com/maps/search/?api=1&query=Ten%20To%20Sen%20Shimokitazawa%20Tokyo%20Japan",
      "Menya Itto (Shin-Koiwa)": "https://www.google.com/maps/search/?api=1&query=Menya%20Itto%20Shin-Koiwa%20Tokyo%20Japan",
      "Nara Seimen (Yoyogi)": "https://www.google.com/maps/search/?api=1&query=Nara%20Seimen%20Yoyogi%20Tokyo%20Japan",
      "Iruca Tokyo (Roppongi)": "https://www.google.com/maps/search/?api=1&query=Iruca%20Tokyo%20Roppongi%20Tokyo%20Japan",
      "Ginza Hachigou (Ginza)": "https://www.google.com/maps/search/?api=1&query=Ginza%20Hachigou%20Ginza%20Tokyo%20Japan",
      "Menya Nukaji (Shibuya)": "https://www.google.com/maps/search/?api=1&query=Menya%20Nukaji%20Shibuya%20Tokyo%20Japan",
      "Kiraku (Shibuya)": "https://www.google.com/maps/search/?api=1&query=Kiraku%20Shibuya%20Tokyo%20Japan",
      "Sugoi Niboshi Ramen Nagi (Shinjuku)": "https://www.google.com/maps/search/?api=1&query=Sugoi%20Niboshi%20Ramen%20Nagi%20Shinjuku%20Tokyo%20Japan",
      "Konjiki Hototogisu (Shinjuku)": "https://www.google.com/maps/search/?api=1&query=Konjiki%20Hototogisu%20Shinjuku%20Tokyo%20Japan",
      "Tsukemen Gonokami Seisakusho (Shinjuku)": "https://www.google.com/maps/search/?api=1&query=Tsukemen%20Gonokami%20Seisakusho%20Shinjuku%20Tokyo%20Japan",
      "Takano (Shinagawa)": "https://www.google.com/maps/search/?api=1&query=Takano%20Shinagawa%20Tokyo%20Japan",
      "Ramenya Toy Box (Minowa)": "https://www.google.com/maps/search/?api=1&query=Ramenya%20Toy%20Box%20Minowa%20Tokyo%20Japan",
      "Sasaki Seimenjo (Nishi-Ogikubo)": "https://www.google.com/maps/search/?api=1&query=Sasaki%20Seimenjo%20Nishi-Ogikubo%20Tokyo%20Japan",
      "Yakumo (Higashiyama)": "https://www.google.com/maps/search/?api=1&query=Yakumo%20Higashiyama%20Tokyo%20Japan",
      "Chukasoba Kotetsu (Shimokitazawa)": "https://www.google.com/maps/search/?api=1&query=Chukasoba%20Kotetsu%20Shimokitazawa%20Tokyo%20Japan",
      "There Is Ramen (Ogikubo)": "https://www.google.com/maps/search/?api=1&query=There%20Is%20Ramen%20Ogikubo%20Tokyo%20Japan",
      "Motenashi Kuroki (Asakusabashi)": "https://www.google.com/maps/search/?api=1&query=Motenashi%20Kuroki%20Asakusabashi%20Tokyo%20Japan",
      "Jun Teuchi Men to Mirai (Shimokitazawa)": "https://www.google.com/maps/search/?api=1&query=Jun%20Teuchi%20Men%20to%20Mirai%20Shimokitazawa%20Tokyo%20Japan",
      "Kagari (Ginza)": "https://www.google.com/maps/search/?api=1&query=Kagari%20Ginza%20Tokyo%20Japan",
      "Yamaguchi (Nishi-Waseda)": "https://www.google.com/maps/search/?api=1&query=Yamaguchi%20Nishi-Waseda%20Tokyo%20Japan",
      "Mensho Gotokuji (Otowa)": "https://www.google.com/maps/search/?api=1&query=Mensho%20Gotokuji%20Otowa%20Tokyo%20Japan",
      "Toripota Ramen THANK (Shiba-Daimon)": "https://www.google.com/maps/search/?api=1&query=Toripota%20Ramen%20THANK%20Shiba-Daimon%20Tokyo%20Japan",
      "Ramen Jazzy Beats (Kamimeguro)": "https://www.google.com/maps/search/?api=1&query=Ramen%20Jazzy%20Beats%20Kamimeguro%20Tokyo%20Japan",
      "Menya Shichisai (Hatchobori)": "https://www.google.com/maps/search/?api=1&query=Menya%20Shichisai%20Hatchobori%20Tokyo%20Japan",
      "Matador (Kitasenju)": "https://www.google.com/maps/search/?api=1&query=Matador%20Kitasenju%20Tokyo%20Japan",
      "Fuunji (Shinjuku)": "https://www.google.com/maps/search/?api=1&query=Fuunji%20Shinjuku%20Tokyo%20Japan",
      "Musashiya (Kichijoji)": "https://www.google.com/maps/search/?api=1&query=Musashiya%20Kichijoji%20Tokyo%20Japan",
      "Tsuta (Yoyogi-Uehara)": "https://www.google.com/maps/search/?api=1&query=Tsuta%20Yoyogi-Uehara%20Tokyo%20Japan",
      "Nakiryu (Minami-Otsuka)": "https://www.google.com/maps/search/?api=1&query=Nakiryu%20Minami-Otsuka%20Tokyo%20Japan",
      "Rairaiken (Asakusa)": "https://www.google.com/maps/search/?api=1&query=Rairaiken%20Asakusa%20Tokyo%20Japan"
    },
    "blurb": "Tonkotsu, shio, tsukemen, spicy miso: the Tokyo ramen counters most worth the queue, by consensus across critics and guides.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Konjiki Hototogisu (Shinjuku)",
          "Ramenya Toy Box (Minowa)",
          "Karashibi Miso Ramen Kikanbo (Kanda)",
          "Ginza Hachigou (Ginza)",
          "Haruchan Ramen (Shimbashi)",
          "Yakumo (Higashiyama)",
          "Kagari (Ginza)",
          "Menya Shichisai (Hatchobori)",
          "Matador (Kitasenju)",
          "Chukasoba Kotetsu (Shimokitazawa)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation Tokyo 2024 (unranked)",
        "url": "https://www.theinfatuation.com/tokyo/guides/best-ramen-tokyo",
        "items": [
          "Karashibi Miso Ramen Kikanbo (Kanda)",
          "Kagura-ya (Suidobashi)",
          "Haruchan Ramen (Shimbashi)",
          "Menya Hyottoko (Yurakucho)",
          "Ramen Jiro Mita Honten (Mita)",
          "Mensouan Sunada (Sugamo)",
          "Ramen Machikado (Ebisu)",
          "Ten To Sen (Shimokitazawa)",
          "Menya Itto (Shin-Koiwa)",
          "Nara Seimen (Yoyogi)"
        ],
        "unordered": true
      },
      "timeout": {
        "label": "Time Out Tokyo 2024 (unranked)",
        "url": "https://www.timeout.com/tokyo/restaurants/20-best-ramen-in-tokyo",
        "items": [
          "Iruca Tokyo (Roppongi)",
          "Ginza Hachigou (Ginza)",
          "Menya Nukaji (Shibuya)",
          "Kiraku (Shibuya)",
          "Sugoi Niboshi Ramen Nagi (Shinjuku)",
          "Konjiki Hototogisu (Shinjuku)",
          "Tsukemen Gonokami Seisakusho (Shinjuku)",
          "Takano (Shinagawa)",
          "Ramenya Toy Box (Minowa)",
          "Karashibi Miso Ramen Kikanbo (Kanda)"
        ],
        "unordered": true
      },
      "michelin": {
        "label": "Michelin Guide · Best Ramen in Tokyo 2024 (unranked)",
        "url": "https://guide.michelin.com/us/en/best-of/ramen-in-tokyo-en",
        "items": [
          "Sasaki Seimenjo (Nishi-Ogikubo)",
          "Yakumo (Higashiyama)",
          "Chukasoba Kotetsu (Shimokitazawa)",
          "Haruchan Ramen (Shimbashi)",
          "Ramenya Toy Box (Minowa)",
          "There Is Ramen (Ogikubo)"
        ],
        "unordered": true
      },
      "iamafoodblog": {
        "label": "i am a food blog 2026 (unranked)",
        "url": "https://iamafoodblog.com/tokyo-ramen/",
        "items": [
          "Ginza Hachigou (Ginza)",
          "Motenashi Kuroki (Asakusabashi)",
          "Konjiki Hototogisu (Shinjuku)",
          "Jun Teuchi Men to Mirai (Shimokitazawa)",
          "Kagari (Ginza)",
          "Yamaguchi (Nishi-Waseda)",
          "Mensho Gotokuji (Otowa)",
          "Yakumo (Higashiyama)",
          "Toripota Ramen THANK (Shiba-Daimon)",
          "Ramen Jazzy Beats (Kamimeguro)"
        ],
        "unordered": true
      },
      "goingawesome": {
        "label": "Going Awesome Places (ordered)",
        "url": "https://goingawesomeplaces.com/best-ramen-in-tokyo-japan/",
        "items": [
          "Konjiki Hototogisu (Shinjuku)",
          "Ramenya Toy Box (Minowa)",
          "Menya Shichisai (Hatchobori)",
          "Karashibi Miso Ramen Kikanbo (Kanda)",
          "Matador (Kitasenju)",
          "Fuunji (Shinjuku)",
          "Kagari (Ginza)",
          "Musashiya (Kichijoji)"
        ]
      },
      "tokyocheapo": {
        "label": "Tokyo Cheapo · Ramen Guide (unranked)",
        "url": "https://tokyocheapo.com/food-and-drink/ramen/",
        "items": [
          "Tsuta (Yoyogi-Uehara)",
          "Nakiryu (Minami-Otsuka)",
          "Konjiki Hototogisu (Shinjuku)",
          "Ginza Hachigou (Ginza)",
          "Rairaiken (Asakusa)"
        ],
        "unordered": true
      }
    },
    "vote": {
      "items": [
        "Konjiki Hototogisu (Shinjuku)",
        "Ramenya Toy Box (Minowa)",
        "Karashibi Miso Ramen Kikanbo (Kanda)",
        "Ginza Hachigou (Ginza)",
        "Haruchan Ramen (Shimbashi)",
        "Yakumo (Higashiyama)",
        "Kagari (Ginza)",
        "Menya Shichisai (Hatchobori)",
        "Matador (Kitasenju)",
        "Chukasoba Kotetsu (Shimokitazawa)"
      ]
    }
  },
  {
    "id": "breakfast-sandwiches-hamptons",
    "publishedDate": "2026-05-26",
    "publishedAt": "2026-05-26T22:00:00Z",
    "title": "Best Breakfast Sandwiches in the Hamptons",
    "category": "The Hamptons",
    "type": "stores",
    "tags": [
      "food",
      "food-drink",
      "stores",
      "travel"
    ],
    "linkType": "mapsCity",
    "links": {
      "Carissa's The Bakery (East Hampton)": "https://www.google.com/maps/search/?api=1&query=Carissa%27s%20The%20Bakery%20East%20Hampton",
      "Goldberg's Famous Bagels (Multiple Locations)": "https://www.google.com/maps/search/?api=1&query=Goldberg%27s%20Famous%20Bagels%20Multiple%20Locations",
      "Cove Delicatessen (Sag Harbor)": "https://www.google.com/maps/search/?api=1&query=Cove%20Delicatessen%20Sag%20Harbor",
      "Bonfire Coffeehouse (East Hampton)": "https://www.google.com/maps/search/?api=1&query=Bonfire%20Coffeehouse%20East%20Hampton",
      "Cromer's Market (Noyac)": "https://www.google.com/maps/search/?api=1&query=Cromer%27s%20Market%20Noyac",
      "Hampton Kitchen Delicatessen (Water Mill)": "https://www.google.com/maps/search/?api=1&query=Hampton%20Kitchen%20Delicatessen%20Water%20Mill",
      "Golden Pear Cafe (Multiple Locations)": "https://www.google.com/maps/search/?api=1&query=Golden%20Pear%20Cafe%20Multiple%20Locations",
      "Harbor Market & Kitchen (Sag Harbor)": "https://www.google.com/maps/search/?api=1&query=Harbor%20Market%20Kitchen%20Sag%20Harbor",
      "John Papas Cafe (East Hampton)": "https://www.google.com/maps/search/?api=1&query=John%20Papas%20Cafe%20East%20Hampton",
      "Damark's Market (East Hampton)": "https://www.google.com/maps/search/?api=1&query=Damark%27s%20Market%20East%20Hampton",
      "Sant Ambroeus (Southampton)": "https://www.google.com/maps/search/?api=1&query=Sant%20Ambroeus%20Southampton",
      "Hampton Chutney (East Hampton)": "https://www.google.com/maps/search/?api=1&query=Hampton%20Chutney%20East%20Hampton"
    },
    "blurb": "The BEC reigns from Montauk to Westhampton. Goldberg's hobo, Carissa's sourdough upgrade, and Cove's triple bypass. Where the East End starts its mornings.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Carissa's The Bakery (East Hampton)",
          "Goldberg's Famous Bagels (Multiple Locations)",
          "Cove Delicatessen (Sag Harbor)",
          "Bonfire Coffeehouse (East Hampton)",
          "Cromer's Market (Noyac)",
          "Hampton Kitchen Delicatessen (Water Mill)",
          "Golden Pear Cafe (Multiple Locations)",
          "Harbor Market & Kitchen (Sag Harbor)",
          "John Papas Cafe (East Hampton)",
          "Damark's Market (East Hampton)"
        ]
      },
      "southforker": {
        "label": "Southforker",
        "items": [
          "Bonfire Coffeehouse (East Hampton)",
          "Goldberg's Famous Bagels (Multiple Locations)",
          "Cove Delicatessen (Sag Harbor)",
          "Hampton Kitchen Delicatessen (Water Mill)",
          "Carissa's The Bakery (East Hampton)",
          "Cromer's Market (Noyac)",
          "Harbor Market & Kitchen (Sag Harbor)",
          "Damark's Market (East Hampton)",
          "Golden Pear Cafe (Multiple Locations)",
          "John Papas Cafe (East Hampton)"
        ],
        "url": "https://southforker.com/2025/05/07/brake-for-the-bec-the-best-hamptons-breakfast-sandwiches/"
      },
      "purewow": {
        "label": "PureWow",
        "items": [
          "Carissa's The Bakery (East Hampton)",
          "Goldberg's Famous Bagels (Multiple Locations)",
          "Harbor Market & Kitchen (Sag Harbor)",
          "Golden Pear Cafe (Multiple Locations)",
          "Bonfire Coffeehouse (East Hampton)",
          "Sant Ambroeus (Southampton)",
          "Cromer's Market (Noyac)",
          "Cove Delicatessen (Sag Harbor)",
          "Hampton Kitchen Delicatessen (Water Mill)",
          "John Papas Cafe (East Hampton)"
        ]
      },
      "yelp": {
        "label": "Yelp Top 10",
        "items": [
          "Bonfire Coffeehouse (East Hampton)",
          "Goldberg's Famous Bagels (Multiple Locations)",
          "Carissa's The Bakery (East Hampton)",
          "Cove Delicatessen (Sag Harbor)",
          "John Papas Cafe (East Hampton)",
          "Damark's Market (East Hampton)",
          "Hampton Chutney (East Hampton)",
          "Golden Pear Cafe (Multiple Locations)",
          "Cromer's Market (Noyac)",
          "Harbor Market & Kitchen (Sag Harbor)"
        ]
      }
    },
    "vote": {
      "items": [
        "Carissa's The Bakery (East Hampton)",
        "Goldberg's Famous Bagels (Multiple Locations)",
        "Bonfire Coffeehouse (East Hampton)",
        "Cove Delicatessen (Sag Harbor)",
        "Cromer's Market (Noyac)",
        "Hampton Kitchen Delicatessen (Water Mill)",
        "Golden Pear Cafe (Multiple Locations)",
        "Harbor Market & Kitchen (Sag Harbor)",
        "John Papas Cafe (East Hampton)",
        "Damark's Market (East Hampton)"
      ]
    }
  },
  {
    "id": "headphones-overear",
    "publishedDate": "2026-05-27",
    "publishedAt": "2026-05-27T13:00:00Z",
    "title": "Best Over-Ear Bluetooth Headphones",
    "category": "Audio",
    "type": "product",
    "tags": [
      "tech",
      "product"
    ],
    "linkType": "amazon",
    "blurb": "The flagship wireless cans: class-leading ANC, audiophile-grade drivers, and the kind of build quality that justifies the price. Ranked on sound, silence, and craft, not value.",
    "defaultSource": "ai",
    "links": {
      "Sony WH-1000XM6": "https://www.amazon.com/s?k=Sony+WH-1000XM6&tag=cgurus-20",
      "Sennheiser HDB 630": "https://www.amazon.com/s?k=Sennheiser+HDB+630&tag=cgurus-20",
      "Bose QuietComfort Ultra Headphones (2nd Gen)": "https://www.amazon.com/s?k=Bose+QuietComfort+Ultra+Headphones+%282nd+Gen%29&tag=cgurus-20",
      "Apple AirPods Max": "https://www.amazon.com/s?k=Apple+AirPods+Max&tag=cgurus-20",
      "Apple AirPods Max 2": "https://www.amazon.com/s?k=Apple+AirPods+Max+2&tag=cgurus-20",
      "Focal Bathys": "https://www.amazon.com/s?k=Focal+Bathys&tag=cgurus-20",
      "Focal Bathys Mg": "https://www.amazon.com/s?k=Focal+Bathys+Mg&tag=cgurus-20",
      "Bowers & Wilkins Px7 S3": "https://www.amazon.com/s?k=Bowers+%26+Wilkins+Px7+S3&tag=cgurus-20",
      "Bowers & Wilkins Px8 S2 McLaren Edition": "https://www.amazon.com/s?k=Bowers+%26+Wilkins+Px8+S2+McLaren+Edition&tag=cgurus-20",
      "Sennheiser MOMENTUM 4 Wireless": "https://www.amazon.com/s?k=Sennheiser+MOMENTUM+4+Wireless&tag=cgurus-20",
      "Sonos Ace": "https://www.amazon.com/s?k=Sonos+Ace&tag=cgurus-20",
      "JBL Tour One M3": "https://www.amazon.com/s?k=JBL+Tour+One+M3&tag=cgurus-20",
      "Cambridge P100 SE": "https://www.amazon.com/s?k=Cambridge+P100+SE&tag=cgurus-20",
      "Beyerdynamic Aventho 100": "https://www.amazon.com/s?k=Beyerdynamic+Aventho+100&tag=cgurus-20"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Sony WH-1000XM6",
          "Sennheiser HDB 630",
          "Bose QuietComfort Ultra Headphones (2nd Gen)",
          "Focal Bathys Mg",
          "Bowers & Wilkins Px7 S3",
          "Apple AirPods Max",
          "Sennheiser MOMENTUM 4 Wireless",
          "Sonos Ace",
          "JBL Tour One M3",
          "Bowers & Wilkins Px8 S2 McLaren Edition"
        ]
      },
      "whathifi": {
        "label": "What Hi-Fi? 2026",
        "items": [
          "Sony WH-1000XM6",
          "Focal Bathys Mg",
          "Sennheiser HDB 630",
          "Bose QuietComfort Ultra Headphones (2nd Gen)",
          "Bowers & Wilkins Px7 S3",
          "Apple AirPods Max 2"
        ],
        "url": "https://www.whathifi.com/best-buys/headphones/best-over-ear-headphones"
      },
      "soundguys": {
        "label": "SoundGuys 2026",
        "items": [
          "Sony WH-1000XM6",
          "Sennheiser HDB 630",
          "Bose QuietComfort Ultra Headphones (2nd Gen)",
          "Apple AirPods Max",
          "Focal Bathys",
          "Sennheiser MOMENTUM 4 Wireless",
          "Sonos Ace",
          "JBL Tour One M3"
        ],
        "url": "https://www.soundguys.com/best-over-ear-headphones-18379/"
      },
      "rollingstone": {
        "label": "Rolling Stone Audio Awards 2026",
        "items": [
          "Sony WH-1000XM6",
          "Bose QuietComfort Ultra Headphones (2nd Gen)",
          "Sennheiser HDB 630",
          "Cambridge P100 SE",
          "Bowers & Wilkins Px8 S2 McLaren Edition",
          "Beyerdynamic Aventho 100"
        ],
        "url": "https://www.rollingstone.com/product-recommendations/electronics/best-headphones-2026-rolling-stone-audio-awards-1235515424/"
      }
    },
    "vote": {
      "items": [
        "Sony WH-1000XM6",
        "Sennheiser HDB 630",
        "Bose QuietComfort Ultra Headphones (2nd Gen)",
        "Focal Bathys Mg",
        "Bowers & Wilkins Px7 S3",
        "Apple AirPods Max",
        "Sennheiser MOMENTUM 4 Wireless",
        "Sonos Ace",
        "JBL Tour One M3",
        "Bowers & Wilkins Px8 S2 McLaren Edition"
      ]
    }
  },
  {
    "id": "home-espresso-machines",
    "publishedDate": "2026-05-27",
    "publishedAt": "2026-05-27T14:00:00Z",
    "title": "Best Home Espresso Machines",
    "category": "Coffee",
    "type": "product",
    "tags": [
      "tech",
      "product"
    ],
    "linkType": "amazon",
    "blurb": "The dream machines. Hand-built dual boilers, saturated commercial groups, and the prosumer flagships that turn a kitchen counter into a proper cafe bar. Ranked by which is nicest, not which is the best deal.",
    "defaultSource": "ai",
    "links": {
      "Rancilio Silvia Pro X": "https://amzn.to/3RxwVzp",
      "Breville Oracle Dual Boiler": "https://amzn.to/4fIkivi"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "La Marzocco GS3",
          "La Marzocco Linea Mini",
          "Slayer Single Group",
          "ECM Synchronika",
          "Rocket R58",
          "Lelit Bianca V3",
          "Profitec Pro 700",
          "Breville Oracle Dual Boiler",
          "Rancilio Silvia Pro X",
          "Rocket Appartamento"
        ]
      },
      "seattlecoffeegear": {
        "label": "Seattle Coffee Gear High-End 2026",
        "items": [
          "La Marzocco Linea Mini",
          "La Marzocco GS3",
          "ECM Synchronika",
          "Profitec Pro 700",
          "Lelit Bianca V3",
          "Rocket R58",
          "Slayer Single Group",
          "Profitec Pro 600",
          "Rocket Appartamento",
          "Lelit Elizabeth"
        ],
        "url": "https://www.seattlecoffeegear.com/blogs/scg-blog/the-best-high-end-espresso-machines-for-home-a-buyers-guide-to-prosumer-level-coffee"
      },
      "cliffandpebble": {
        "label": "Cliff & Pebble Prosumer 2026",
        "items": [
          "Lelit Bianca V3",
          "Rocket R58",
          "Profitec Pro 700",
          "ECM Synchronika",
          "La Marzocco Linea Mini",
          "La Marzocco GS3",
          "Slayer Single Group",
          "LUCCA A53 Mini",
          "Rancilio Silvia Pro X",
          "Profitec Pro 600"
        ],
        "url": "https://cliffandpebble.com/blogs/our-blog/best-prosumer-espresso-machines-for-home-2026-guide"
      },
      "homegrounds": {
        "label": "HomeGrounds 2026",
        "items": [
          "La Marzocco GS3",
          "Slayer Single Group",
          "ECM Synchronika",
          "Lelit Bianca V3",
          "Rocket R58",
          "La Marzocco Linea Mini",
          "Profitec Pro 700",
          "Rancilio Silvia Pro X",
          "Rocket Appartamento",
          "Breville Oracle Dual Boiler"
        ],
        "url": "https://www.homegrounds.co/best-espresso-machines/"
      },
      "wholelattelove": {
        "label": "Whole Latte Love 2026",
        "items": [
          "ECM Synchronika",
          "Profitec Pro 700",
          "La Marzocco GS3",
          "Rocket R58",
          "Lelit Bianca V3",
          "La Marzocco Linea Mini",
          "Slayer Single Group",
          "ECM Mechanika",
          "Rocket Mozzafiato",
          "Profitec Pro 600"
        ],
        "url": "https://www.wholelattelove.com/blogs/reviews/the-best-espresso-machine"
      }
    },
    "vote": {
      "items": [
        "La Marzocco Linea Mini",
        "La Marzocco GS3",
        "Lelit Bianca V3",
        "ECM Synchronika",
        "Rocket R58",
        "Profitec Pro 700",
        "Slayer Single Group",
        "Rocket Appartamento",
        "Rancilio Silvia Pro X",
        "Breville Oracle Dual Boiler"
      ]
    }
  },
  {
    "id": "alani-nu-flavors",
    "publishedDate": "2026-05-25",
    "publishedAt": "2026-05-25T16:00:00Z",
    "title": "Best Alani Nu Energy Flavors",
    "category": "Drinks",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "product"
    ],
    "linkType": "amazon",
    "mode": "votes",
    "blurb": "Every Alani Nu energy flavor, ranked by you. Loose expert order to start, your votes take it from there.",
    "defaultSource": "ai",
    "vote": {
      "items": [
        "Witch's Brew",
        "Breezeberry",
        "Cosmic Stardust",
        "Hawaiian Shaved Ice",
        "Juicy Peach",
        "Mimosa",
        "Tropsicle",
        "Watermelon Wave",
        "Cherry Slush",
        "Munchies"
      ]
    }
  },
  {
    "id": "prestigious-boarding-schools",
    "publishedDate": "2026-05-26",
    "publishedAt": "2026-05-26T22:04:00Z",
    "title": "Most Prestigious Boarding Schools in the US",
    "category": "Education",
    "type": "other",
    "tags": [
      "luxury",
      "other"
    ],
    "linkType": "wiki",
    "blurb": "The schools that feed the Ivy League, shape future presidents, and charge $70K a year for the privilege. Harkness tables, Gothic quads, and admissions rates that rival Harvard.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Phillips Exeter Academy (Exeter, New Hampshire)",
          "Phillips Academy Andover (Andover, Massachusetts)",
          "The Hotchkiss School (Lakeville, Connecticut)",
          "Groton School (Groton, Massachusetts)",
          "St. Paul's School (Concord, New Hampshire)",
          "Choate Rosemary Hall (Wallingford, Connecticut)",
          "The Lawrenceville School (Lawrenceville, New Jersey)",
          "Deerfield Academy (Deerfield, Massachusetts)",
          "Milton Academy (Milton, Massachusetts)",
          "Cate School (Carpinteria, California)"
        ]
      },
      "niche": {
        "label": "Niche 2026 Best Boarding Schools",
        "items": [
          "The Hotchkiss School (Lakeville, Connecticut)",
          "Phillips Exeter Academy (Exeter, New Hampshire)",
          "Choate Rosemary Hall (Wallingford, Connecticut)",
          "The Lawrenceville School (Lawrenceville, New Jersey)",
          "Groton School (Groton, Massachusetts)",
          "Phillips Academy Andover (Andover, Massachusetts)",
          "St. Paul's School (Concord, New Hampshire)",
          "Cate School (Carpinteria, California)",
          "Deerfield Academy (Deerfield, Massachusetts)",
          "Milton Academy (Milton, Massachusetts)"
        ],
        "url": "https://www.niche.com/blog/2026-best-boarding-high-schools-in-america/"
      },
      "admissionsight": {
        "label": "AdmissionSight Top 10",
        "items": [
          "Phillips Exeter Academy (Exeter, New Hampshire)",
          "Phillips Academy Andover (Andover, Massachusetts)",
          "Choate Rosemary Hall (Wallingford, Connecticut)",
          "The Lawrenceville School (Lawrenceville, New Jersey)",
          "Groton School (Groton, Massachusetts)",
          "St. Paul's School (Concord, New Hampshire)",
          "Deerfield Academy (Deerfield, Massachusetts)",
          "Cate School (Carpinteria, California)",
          "The Hotchkiss School (Lakeville, Connecticut)",
          "Milton Academy (Milton, Massachusetts)"
        ],
        "url": "https://admissionsight.com/best-boarding-schools-in-the-us/"
      },
      "findingschool": {
        "label": "FindingSchool 2026",
        "items": [
          "Phillips Academy Andover (Andover, Massachusetts)",
          "Phillips Exeter Academy (Exeter, New Hampshire)",
          "The Lawrenceville School (Lawrenceville, New Jersey)",
          "Deerfield Academy (Deerfield, Massachusetts)",
          "Choate Rosemary Hall (Wallingford, Connecticut)",
          "The Hotchkiss School (Lakeville, Connecticut)",
          "St. Paul's School (Concord, New Hampshire)",
          "Groton School (Groton, Massachusetts)",
          "Middlesex School (Concord, Massachusetts)",
          "The Taft School (Watertown, Connecticut)"
        ],
        "url": "https://www.findingschool.com/ranking/fs-boarding-ranking"
      }
    },
    "vote": {
      "items": [
        "Phillips Exeter Academy (Exeter, New Hampshire)",
        "Phillips Academy Andover (Andover, Massachusetts)",
        "Groton School (Groton, Massachusetts)",
        "The Hotchkiss School (Lakeville, Connecticut)",
        "St. Paul's School (Concord, New Hampshire)",
        "Choate Rosemary Hall (Wallingford, Connecticut)",
        "Deerfield Academy (Deerfield, Massachusetts)",
        "The Lawrenceville School (Lawrenceville, New Jersey)",
        "Milton Academy (Milton, Massachusetts)",
        "Cate School (Carpinteria, California)"
      ]
    }
  },
  {
    "id": "three-martini-lunch-manhattan",
    "publishedDate": "2026-05-26",
    "publishedAt": "2026-05-26T22:08:00Z",
    "title": "Best Three-Martini Weekday Lunches in Manhattan",
    "category": "New York",
    "type": "stores",
    "tags": [
      "food",
      "food-drink",
      "bars",
      "stores",
      "luxury"
    ],
    "linkType": "mapsCity",
    "links": {
      "Avra Estiatorio (Midtown)": "https://www.google.com/maps/search/?api=1&query=Avra%20Estiatorio%20Midtown",
      "Balthazar (SoHo)": "https://www.google.com/maps/search/?api=1&query=Balthazar%20SoHo",
      "Carbone (Greenwich Village)": "https://www.google.com/maps/search/?api=1&query=Carbone%20Greenwich%20Village",
      "Ci Siamo (Hudson Yards)": "https://www.google.com/maps/search/?api=1&query=Ci%20Siamo%20Hudson%20Yards",
      "Coco's (Midtown)": "https://www.google.com/maps/search/?api=1&query=Coco%20s%20Midtown",
      "Dowling's at The Carlyle (Upper East Side)": "https://www.google.com/maps/search/?api=1&query=Dowling%20s%20at%20The%20Carlyle%20Upper%20East%20Side",
      "King (Hudson Square)": "https://www.google.com/maps/search/?api=1&query=King%20Hudson%20Square",
      "L'Artusi (West Village)": "https://www.google.com/maps/search/?api=1&query=L%20Artusi%20West%20Village",
      "La Marchande (Financial District)": "https://www.google.com/maps/search/?api=1&query=La%20Marchande%20Financial%20District",
      "Le Coucou (SoHo)": "https://www.google.com/maps/search/?api=1&query=Le%20Coucou%20SoHo",
      "Manuela (SoHo)": "https://www.google.com/maps/search/?api=1&query=Manuela%20SoHo",
      "Michael's (Midtown)": "https://www.google.com/maps/search/?api=1&query=Michael%20s%20Midtown",
      "Raf's (Nolita)": "https://www.google.com/maps/search/?api=1&query=Raf%20s%20Nolita",
      "Raoul's (SoHo)": "https://www.google.com/maps/search/?api=1&query=Raoul%20s%20SoHo",
      "Smith & Wollensky (Midtown East)": "https://www.google.com/maps/search/?api=1&query=Smith%20Wollensky%20Midtown%20East",
      "The Grill (Midtown)": "https://www.google.com/maps/search/?api=1&query=The%20Grill%20Midtown",
      "The Polo Bar (Midtown)": "https://www.google.com/maps/search/?api=1&query=The%20Polo%20Bar%20Midtown",
      "Torrisi Bar & Restaurant (Nolita)": "https://www.google.com/maps/search/?api=1&query=Torrisi%20Bar%20Restaurant%20Nolita"
    },
    "blurb": "The power lunch never died, it just moved tables. Where to order a gin martini at noon on a Tuesday and nobody blinks. Steak, tablecloths, and a cab home.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "The Grill (Midtown)",
          "Torrisi Bar & Restaurant (Nolita)",
          "Dowling's at The Carlyle (Upper East Side)",
          "La Marchande (Financial District)",
          "Carbone (Greenwich Village)",
          "Balthazar (SoHo)",
          "The Polo Bar (Midtown)",
          "Ci Siamo (Hudson Yards)",
          "Smith & Wollensky (Midtown East)",
          "King (Hudson Square)"
        ]
      },
      "resy": {
        "label": "Resy Power Lunch Guide 2025",
        "items": [
          "Dowling's at The Carlyle (Upper East Side)",
          "Le Coucou (SoHo)",
          "King (Hudson Square)",
          "L'Artusi (West Village)",
          "Ci Siamo (Hudson Yards)",
          "La Marchande (Financial District)",
          "Avra Estiatorio (Midtown)",
          "Manuela (SoHo)"
        ],
        "url": "https://blog.resy.com/2025/03/the-resy-guide-to-power-lunches-in-new-york/"
      },
      "infatuation": {
        "label": "The Infatuation",
        "items": [
          "Torrisi Bar & Restaurant (Nolita)",
          "Ci Siamo (Hudson Yards)",
          "Carbone (Greenwich Village)",
          "The Grill (Midtown)",
          "Balthazar (SoHo)",
          "Raoul's (SoHo)",
          "King (Hudson Square)",
          "Dowling's at The Carlyle (Upper East Side)",
          "L'Artusi (West Village)",
          "Smith & Wollensky (Midtown East)"
        ],
        "url": "https://www.theinfatuation.com/new-york/guides/midtown-lunch"
      },
      "robbreport": {
        "label": "Robb Report · Gentleman's Journal",
        "items": [
          "The Grill (Midtown)",
          "Coco's (Midtown)",
          "Raf's (Nolita)",
          "Torrisi Bar & Restaurant (Nolita)",
          "Carbone (Greenwich Village)",
          "Michael's (Midtown)",
          "La Marchande (Financial District)",
          "The Polo Bar (Midtown)",
          "Balthazar (SoHo)",
          "Dowling's at The Carlyle (Upper East Side)"
        ],
        "url": "https://robbreport.com/food-drink/dining/power-lunch-new-york-city-1235642855/"
      }
    },
    "vote": {
      "items": [
        "Torrisi Bar & Restaurant (Nolita)",
        "The Grill (Midtown)",
        "Carbone (Greenwich Village)",
        "Balthazar (SoHo)",
        "Dowling's at The Carlyle (Upper East Side)",
        "Smith & Wollensky (Midtown East)",
        "La Marchande (Financial District)",
        "The Polo Bar (Midtown)",
        "Ci Siamo (Hudson Yards)",
        "King (Hudson Square)"
      ]
    }
  },
  {
    "id": "travel-monitors",
    "publishedDate": "2026-05-27",
    "publishedAt": "2026-05-27T15:00:00Z",
    "title": "Best Travel Computer Monitors",
    "category": "Tech",
    "type": "product",
    "tags": [
      "tech",
      "product"
    ],
    "linkType": "amazon",
    "blurb": "The nicest portable displays you can pack in a laptop bag. OLED panels, true 4K resolution, and aircraft-grade aluminum builds, ranked by outright quality rather than price.",
    "defaultSource": "ai",
    "links": {
      "Espresso Display 15 Touch": "https://amzn.to/4uwq87F",
      "INNOCN 13K1F (13.3\" OLED)": "https://amzn.to/3PEJEQn",
      "INNOCN PU15-Pre": "https://amzn.to/3RwQbx2",
      "LG gram + View": "https://amzn.to/4vbOBPy",
      "ASUS ROG Strix XG17AHPE": "https://amzn.to/4e8K6zu",
      "ViewSonic VX1655-4K-OLED": "https://amzn.to/3RoR0bg",
      "ASUS ZenScreen Touch (MB16AMT)": "https://amzn.to/3PRb1GK",
      "Espresso 17 Pro": "https://amzn.to/4u3E4Fk",
      "Lenovo ThinkVision M14t": "https://amzn.to/4vb7UZl"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "ViewSonic VX1655-4K-OLED",
          "ViewSonic VP16-OLED",
          "Espresso Display 15 Touch",
          "Espresso 17 Pro",
          "INNOCN 13K1F (13.3\" OLED)",
          "INNOCN PU15-Pre",
          "ASUS ROG Strix XG17AHPE",
          "LG gram + View",
          "Lenovo ThinkVision M14t",
          "ASUS ZenScreen Touch (MB16AMT)"
        ]
      },
      "rtings": {
        "label": "RTINGS 2026",
        "items": [
          "ViewSonic VX1655-4K-OLED",
          "Espresso Display 15 Touch",
          "INNOCN 13K1F (13.3\" OLED)",
          "ViewSonic VP16-OLED",
          "ASUS ROG Strix XG17AHPE",
          "Espresso 17 Pro",
          "INNOCN PU15-Pre"
        ],
        "url": "https://www.rtings.com/monitor/reviews/best/by-size/portable"
      },
      "tomshardware": {
        "label": "Tom's Hardware 2026",
        "items": [
          "Espresso 17 Pro",
          "ViewSonic VX1655-4K-OLED",
          "INNOCN PU15-Pre",
          "Espresso Display 15 Touch",
          "ViewSonic VP16-OLED",
          "ASUS ZenScreen Touch (MB16AMT)",
          "INNOCN 13K1F (13.3\" OLED)",
          "LG gram + View"
        ],
        "url": "https://www.tomshardware.com/best-picks/best-portable-monitors"
      },
      "pcworld": {
        "label": "PCWorld 2026",
        "items": [
          "ViewSonic VX1655-4K-OLED",
          "Espresso Display 15 Touch",
          "ViewSonic VP16-OLED",
          "INNOCN 13K1F (13.3\" OLED)",
          "Espresso 17 Pro",
          "LG gram + View",
          "ASUS ROG Strix XG17AHPE"
        ],
        "url": "https://www.pcworld.com/article/1787210/best-portable-monitors.html"
      },
      "engadget": {
        "label": "Engadget 2026",
        "items": [
          "Espresso Display 15 Touch",
          "ViewSonic VX1655-4K-OLED",
          "INNOCN PU15-Pre",
          "ViewSonic VP16-OLED",
          "Espresso 17 Pro",
          "ASUS ZenScreen Touch (MB16AMT)",
          "Lenovo ThinkVision M14t"
        ],
        "url": "https://www.engadget.com/computing/accessories/best-portable-monitor-120050851.html"
      }
    },
    "vote": {
      "items": [
        "ViewSonic VX1655-4K-OLED",
        "Espresso Display 15 Touch",
        "ViewSonic VP16-OLED",
        "INNOCN 13K1F (13.3\" OLED)",
        "Espresso 17 Pro",
        "INNOCN PU15-Pre",
        "ASUS ROG Strix XG17AHPE",
        "LG gram + View",
        "Lenovo ThinkVision M14t",
        "ASUS ZenScreen Touch (MB16AMT)"
      ]
    }
  },
  {
    "id": "thailand-beachfront-hotels",
    "publishedDate": "2026-05-27",
    "publishedAt": "2026-05-27T16:00:00Z",
    "title": "Best Beachfront Hotels and Resorts in Thailand",
    "category": "Travel",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Amanpuri (Pansea Beach, Phuket)": "https://www.google.com/maps/search/?api=1&query=Amanpuri%20Pansea%20Beach%20Phuket",
      "Trisara (Nai Thon, Phuket)": "https://www.google.com/maps/search/?api=1&query=Trisara%20Nai%20Thon%20Phuket",
      "Six Senses Yao Noi (Koh Yao Noi, Phang Nga)": "https://www.google.com/maps/search/?api=1&query=Six%20Senses%20Yao%20Noi%20Koh%20Yao%20Noi%20Phang%20Nga",
      "Phulay Bay, a Ritz-Carlton Reserve (Nong Thale, Krabi)": "https://www.google.com/maps/search/?api=1&query=Phulay%20Bay%20a%20Ritz-Carlton%20Reserve%20Nong%20Thale%20Krabi",
      "Rosewood Phuket (Emerald Bay, Phuket)": "https://www.google.com/maps/search/?api=1&query=Rosewood%20Phuket%20Emerald%20Bay%20Phuket",
      "Four Seasons Resort Koh Samui (Laem Yai, Koh Samui)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Resort%20Koh%20Samui%20Laem%20Yai%20Koh%20Samui",
      "Rayavadee (Railay Beach, Krabi)": "https://www.google.com/maps/search/?api=1&query=Rayavadee%20Railay%20Beach%20Krabi",
      "Soneva Kiri (Koh Kood, Trat)": "https://www.google.com/maps/search/?api=1&query=Soneva%20Kiri%20Koh%20Kood%20Trat",
      "Six Senses Samui (Choeng Mon, Koh Samui)": "https://www.google.com/maps/search/?api=1&query=Six%20Senses%20Samui%20Choeng%20Mon%20Koh%20Samui",
      "Keemala (Kamala, Phuket)": "https://www.google.com/maps/search/?api=1&query=Keemala%20Kamala%20Phuket",
      "Andara Resort & Villas (Kamala, Phuket)": "https://www.google.com/maps/search/?api=1&query=Andara%20Resort%20Villas%20Kamala%20Phuket",
      "Sri Panwa (Cape Panwa, Phuket)": "https://www.google.com/maps/search/?api=1&query=Sri%20Panwa%20Cape%20Panwa%20Phuket",
      "Banyan Tree Krabi (Tubkaek Beach, Krabi)": "https://www.google.com/maps/search/?api=1&query=Banyan%20Tree%20Krabi%20Tubkaek%20Beach%20Krabi",
      "Banyan Tree Samui (Lamai, Koh Samui)": "https://www.google.com/maps/search/?api=1&query=Banyan%20Tree%20Samui%20Lamai%20Koh%20Samui",
      "Samujana Villas (Choeng Mon, Koh Samui)": "https://www.google.com/maps/search/?api=1&query=Samujana%20Villas%20Choeng%20Mon%20Koh%20Samui",
      "The Sarojin (Khao Lak, Phang Nga)": "https://www.google.com/maps/search/?api=1&query=The%20Sarojin%20Khao%20Lak%20Phang%20Nga",
      "Napasai (Mae Nam, Koh Samui)": "https://www.google.com/maps/search/?api=1&query=Napasai%20Mae%20Nam%20Koh%20Samui",
      "Cape Fahn Hotel (Choeng Mon, Koh Samui)": "https://www.google.com/maps/search/?api=1&query=Cape%20Fahn%20Hotel%20Choeng%20Mon%20Koh%20Samui",
      "Anantara Rasananda (Thong Nai Pan, Koh Phangan)": "https://www.google.com/maps/search/?api=1&query=Anantara%20Rasananda%20Thong%20Nai%20Pan%20Koh%20Phangan"
    },
    "blurb": "Private pools, limestone karsts, and turquoise waters. The Andaman Sea and Gulf of Siam are home to Thailand's most coveted beachfront sanctuaries.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Amanpuri (Pansea Beach, Phuket)",
          "Trisara (Nai Thon, Phuket)",
          "Six Senses Yao Noi (Koh Yao Noi, Phang Nga)",
          "Phulay Bay, a Ritz-Carlton Reserve (Nong Thale, Krabi)",
          "Rosewood Phuket (Emerald Bay, Phuket)",
          "Four Seasons Resort Koh Samui (Laem Yai, Koh Samui)",
          "Rayavadee (Railay Beach, Krabi)",
          "Soneva Kiri (Koh Kood, Trat)",
          "Six Senses Samui (Choeng Mon, Koh Samui)",
          "Keemala (Kamala, Phuket)"
        ]
      },
      "tripcom": {
        "label": "Trip.com Best Luxury Hotels",
        "items": [
          "Four Seasons Resort Koh Samui (Laem Yai, Koh Samui)",
          "Amanpuri (Pansea Beach, Phuket)",
          "Trisara (Nai Thon, Phuket)",
          "Six Senses Yao Noi (Koh Yao Noi, Phang Nga)",
          "Rosewood Phuket (Emerald Bay, Phuket)",
          "Andara Resort & Villas (Kamala, Phuket)",
          "Keemala (Kamala, Phuket)",
          "Phulay Bay, a Ritz-Carlton Reserve (Nong Thale, Krabi)",
          "Sri Panwa (Cape Panwa, Phuket)",
          "Banyan Tree Krabi (Tubkaek Beach, Krabi)"
        ],
        "url": "https://www.trip.com/toplist/tripbest/thailand-best-luxury-hotels-100200444638/"
      },
      "michelin": {
        "label": "Michelin Key Hotels",
        "items": [
          "Amanpuri (Pansea Beach, Phuket)",
          "Phulay Bay, a Ritz-Carlton Reserve (Nong Thale, Krabi)",
          "Six Senses Yao Noi (Koh Yao Noi, Phang Nga)",
          "Six Senses Samui (Choeng Mon, Koh Samui)",
          "Banyan Tree Samui (Lamai, Koh Samui)",
          "Keemala (Kamala, Phuket)",
          "Samujana Villas (Choeng Mon, Koh Samui)",
          "The Sarojin (Khao Lak, Phang Nga)",
          "Napasai (Mae Nam, Koh Samui)",
          "Cape Fahn Hotel (Choeng Mon, Koh Samui)"
        ],
        "url": "https://guide.michelin.com/us/en/article/travel/all-the-key-hotels-thailand-michelin-guide"
      },
      "luxuryexpert": {
        "label": "Luxury Travel Expert",
        "items": [
          "Soneva Kiri (Koh Kood, Trat)",
          "Six Senses Yao Noi (Koh Yao Noi, Phang Nga)",
          "Rayavadee (Railay Beach, Krabi)",
          "Trisara (Nai Thon, Phuket)",
          "Amanpuri (Pansea Beach, Phuket)",
          "Banyan Tree Samui (Lamai, Koh Samui)",
          "Four Seasons Resort Koh Samui (Laem Yai, Koh Samui)",
          "Anantara Rasananda (Thong Nai Pan, Koh Phangan)",
          "Cape Fahn Hotel (Choeng Mon, Koh Samui)",
          "Rosewood Phuket (Emerald Bay, Phuket)"
        ],
        "url": "https://theluxurytravelexpert.com/top-10-best-luxury-hotels-resorts-in-thailand/"
      },
      "hotelguru": {
        "label": "The Hotel Guru",
        "items": [
          "Trisara (Nai Thon, Phuket)",
          "Amanpuri (Pansea Beach, Phuket)",
          "Six Senses Yao Noi (Koh Yao Noi, Phang Nga)",
          "Rosewood Phuket (Emerald Bay, Phuket)",
          "Keemala (Kamala, Phuket)",
          "Sri Panwa (Cape Panwa, Phuket)",
          "Six Senses Samui (Choeng Mon, Koh Samui)",
          "Rayavadee (Railay Beach, Krabi)",
          "Cape Fahn Hotel (Choeng Mon, Koh Samui)",
          "Soneva Kiri (Koh Kood, Trat)"
        ],
        "url": "https://www.thehotelguru.com/best-hotels/thailand/beach-hotels"
      }
    },
    "vote": {
      "items": [
        "Amanpuri (Pansea Beach, Phuket)",
        "Trisara (Nai Thon, Phuket)",
        "Six Senses Yao Noi (Koh Yao Noi, Phang Nga)",
        "Phulay Bay, a Ritz-Carlton Reserve (Nong Thale, Krabi)",
        "Rosewood Phuket (Emerald Bay, Phuket)",
        "Four Seasons Resort Koh Samui (Laem Yai, Koh Samui)",
        "Rayavadee (Railay Beach, Krabi)",
        "Soneva Kiri (Koh Kood, Trat)",
        "Six Senses Samui (Choeng Mon, Koh Samui)",
        "Keemala (Kamala, Phuket)"
      ]
    }
  },
  {
    "id": "sec-dive-bars",
    "publishedDate": "2026-05-27",
    "publishedAt": "2026-05-27T17:00:00Z",
    "title": "Best SEC Dive Bars",
    "category": "Travel",
    "type": "travel",
    "tags": [
      "bars",
      "nightlife",
      "food-drink",
      "stores",
      "entertainment",
      "travel"
    ],
    "blurb": "Game day tradition in the South. Cheap wings, neon beer signs, and decades of Gator, Tiger, and Bulldog memories.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "The Houndstooth (Alabama)",
          "SkyBar Cafe (Auburn)",
          "Sideways (Arkansas)",
          "Fred's Bar (LSU)",
          "The Chimes (LSU)",
          "The Globe (Georgia)",
          "Two Keys Tavern (Kentucky)",
          "Dixie Chicken (Texas A&M)",
          "The Half Barrel (Tennessee)",
          "Walk-On's Sports Bistreaux (LSU)"
        ]
      },
      "secrant": {
        "label": "SEC Rant",
        "items": [
          "The Houndstooth (Alabama)",
          "Sideways (Arkansas)",
          "Dave's Dark Horse Tavern (Mississippi State)",
          "The Chimes (LSU)",
          "Flying Saucer (Vanderbilt)",
          "The Whig (South Carolina)",
          "Chimy's (Texas A&M)",
          "The Globe (Georgia)",
          "Two Keys Tavern (Kentucky)",
          "Harry's Bar (Alabama)"
        ],
        "url": "https://www.secrant.com/rant/sec-football/best-sec-bars-and-bar-scene/90624690/"
      },
      "saturdaydownsouth": {
        "label": "Saturday Down South",
        "items": [
          "The Houndstooth (Alabama)",
          "Sideways (Arkansas)",
          "The Chimes (LSU)",
          "Dave's Dark Horse Tavern (Mississippi State)",
          "The Globe (Georgia)",
          "Two Keys Tavern (Kentucky)",
          "Shiloh Bar & Grill (Missouri)",
          "Flying Saucer (Vanderbilt)",
          "Chimy's (Texas A&M)"
        ],
        "url": "https://www.saturdaydownsouth.com/news/college-football/ranking-best-college-bars-in-the-sec/"
      },
      "fanbuzz": {
        "label": "FanBuzz",
        "items": [
          "The Houndstooth (Alabama)",
          "Quixote's (Auburn)",
          "Fred's Bar (LSU)",
          "The Chimes (LSU)",
          "Cool Beans (Tennessee)",
          "Chimy's (Texas A&M)",
          "Piranha's Bar and Grill (Vanderbilt)",
          "The Half Barrel (Tennessee)",
          "Sideways (Arkansas)"
        ],
        "url": "https://fanbuzz.com/college-football/sec/best-sec-bars/"
      },
      "campussports": {
        "label": "Campus Sports",
        "items": [
          "SkyBar Cafe (Auburn)",
          "The Houndstooth (Alabama)",
          "Fred's Bar (LSU)",
          "Dave's Dark Horse Tavern (Mississippi State)",
          "The Half Barrel (Tennessee)",
          "Bogie's Bar (LSU)",
          "Bin 612 (Mississippi State)",
          "The Chimes (LSU)"
        ],
        "url": "https://campussports.net/2015/05/20/the-best-bar-at-each-sec-school/"
      },
      "thetakeout": {
        "label": "The Takeout",
        "items": [
          "SkyBar Cafe (Auburn)",
          "Kings Live Music (Auburn)",
          "The Houndstooth (Alabama)",
          "The Chimes (LSU)",
          "Sideways (Arkansas)",
          "The Globe (Georgia)",
          "Two Keys Tavern (Kentucky)",
          "Chimy's (Texas A&M)"
        ],
        "url": "https://www.thetakeout.com/2046571/best-college-bars-in-us/"
      }
    },
    "vote": {
      "items": [
        "The Houndstooth (Alabama)",
        "SkyBar Cafe (Auburn)",
        "Sideways (Arkansas)",
        "Fred's Bar (LSU)",
        "The Chimes (LSU)",
        "The Globe (Georgia)",
        "Two Keys Tavern (Kentucky)",
        "Dixie Chicken (Texas A&M)",
        "The Half Barrel (Tennessee)",
        "Walk-On's Sports Bistreaux (LSU)"
      ]
    }
  },
  {
    "id": "ivy-league-dive-bars",
    "publishedDate": "2026-05-27",
    "publishedAt": "2026-05-27T18:00:00Z",
    "title": "Best Ivy League Dive Bars",
    "category": "Travel",
    "type": "travel",
    "tags": [
      "bars",
      "nightlife",
      "food-drink",
      "stores",
      "entertainment",
      "travel"
    ],
    "blurb": "Cheap pitchers, sticky floors, and decades of student tradition. The bars that defined every Ivy campus.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Charlie's Kitchen (Harvard)",
          "Smokey Joe's Tavern (Penn)",
          "1020 Bar (Columbia)",
          "Ivy Inn (Princeton)",
          "Graduate Center Bar (Brown)",
          "The Anchor Spa (Yale)",
          "Toad's Place (Yale)",
          "Chapter House (Cornell)",
          "Murphy's on the Green (Dartmouth)",
          "Salt Hill Pub (Dartmouth)"
        ]
      },
      "yelp": {
        "label": "Yelp Top Picks Near Campus",
        "items": [
          "Charlie's Kitchen (Harvard)",
          "The Dugout (Harvard)",
          "Sligo Pub (Harvard)",
          "1020 Bar (Columbia)",
          "Broadway Dive Bar (Columbia)",
          "Smokey Joe's Tavern (Penn)",
          "New Deck Tavern (Penn)",
          "Ivy Inn (Princeton)",
          "Toad's Place (Yale)",
          "Chanticleer (Cornell)"
        ]
      },
      "campusvoices": {
        "label": "Campus Newspapers · Alumni Reflections",
        "items": [
          "Charlie's Kitchen (Harvard)",
          "Smokey Joe's Tavern (Penn)",
          "1020 Bar (Columbia)",
          "Ivy Inn (Princeton)",
          "Graduate Center Bar (Brown)",
          "The Anchor Spa (Yale)",
          "Chapter House (Cornell)",
          "Chanticleer (Cornell)",
          "Murphy's on the Green (Dartmouth)",
          "Salt Hill Pub (Dartmouth)"
        ]
      },
      "tripadvisor": {
        "label": "Tripadvisor Top-Rated",
        "items": [
          "Charlie's Kitchen (Harvard)",
          "Ivy Inn (Princeton)",
          "Toad's Place (Yale)",
          "The Anchor Spa (Yale)",
          "Smokey Joe's Tavern (Penn)",
          "Murphy's on the Green (Dartmouth)",
          "Salt Hill Pub (Dartmouth)",
          "Sligo Pub (Harvard)",
          "The Dugout (Harvard)"
        ]
      },
      "timeout": {
        "label": "Time Out · The Infatuation · Boston Mag",
        "items": [
          "Charlie's Kitchen (Harvard)",
          "Model Cafe (Harvard)",
          "1020 Bar (Columbia)",
          "Smokey Joe's Tavern (Penn)",
          "Ivy Inn (Princeton)",
          "Graduate Center Bar (Brown)",
          "The Anchor Spa (Yale)",
          "Toad's Place (Yale)",
          "Chapter House (Cornell)"
        ]
      }
    },
    "vote": {
      "items": [
        "Charlie's Kitchen (Harvard)",
        "Smokey Joe's Tavern (Penn)",
        "1020 Bar (Columbia)",
        "Ivy Inn (Princeton)",
        "Graduate Center Bar (Brown)",
        "The Anchor Spa (Yale)",
        "Toad's Place (Yale)",
        "Chapter House (Cornell)",
        "Murphy's on the Green (Dartmouth)",
        "Salt Hill Pub (Dartmouth)"
      ]
    }
  },
  {
    "id": "best-aman-resorts-world",
    "publishedDate": "2026-05-27",
    "publishedAt": "2026-05-27T19:00:00Z",
    "title": "Best Aman Resorts in the World",
    "category": "Travel",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Amangiri (Canyon Point, Utah)": "https://www.google.com/maps/search/?api=1&query=Amangiri%20Canyon%20Point%20Utah",
      "Amanoi (Vinh Hy Bay, Vietnam)": "https://www.google.com/maps/search/?api=1&query=Amanoi%20Vinh%20Hy%20Bay%20Vietnam",
      "Amanzoe (Porto Heli, Greece)": "https://www.google.com/maps/search/?api=1&query=Amanzoe%20Porto%20Heli%20Greece",
      "Amanpuri (Phuket, Thailand)": "https://www.google.com/maps/search/?api=1&query=Amanpuri%20Phuket%20Thailand",
      "Aman Tokyo (Japan)": "https://www.google.com/maps/search/?api=1&query=Aman%20Tokyo%20Japan",
      "Amankila (Bali, Indonesia)": "https://www.google.com/maps/search/?api=1&query=Amankila%20Bali%20Indonesia",
      "Aman Venice (Italy)": "https://www.google.com/maps/search/?api=1&query=Aman%20Venice%20Italy",
      "Amanyara (Turks & Caicos)": "https://www.google.com/maps/search/?api=1&query=Amanyara%20Turks%20Caicos",
      "Aman New York (United States)": "https://www.google.com/maps/search/?api=1&query=Aman%20New%20York%20United%20States",
      "Amanpulo (Pamalican Island, Philippines)": "https://www.google.com/maps/search/?api=1&query=Amanpulo%20Pamalican%20Island%20Philippines",
      "Amanera (Dominican Republic)": "https://www.google.com/maps/search/?api=1&query=Amanera%20Dominican%20Republic",
      "Amanbagh (Rajasthan, India)": "https://www.google.com/maps/search/?api=1&query=Amanbagh%20Rajasthan%20India",
      "Amanjiwo (Central Java, Indonesia)": "https://www.google.com/maps/search/?api=1&query=Amanjiwo%20Central%20Java%20Indonesia",
      "Amankora (Paro, Bhutan)": "https://www.google.com/maps/search/?api=1&query=Amankora%20Paro%20Bhutan",
      "Aman-i-Khas (Ranthambore, India)": "https://www.google.com/maps/search/?api=1&query=Aman-i-Khas%20Ranthambore%20India",
      "Aman Sveti Stefan (Montenegro)": "https://www.google.com/maps/search/?api=1&query=Aman%20Sveti%20Stefan%20Montenegro",
      "Amansara (Siem Reap, Cambodia)": "https://www.google.com/maps/search/?api=1&query=Amansara%20Siem%20Reap%20Cambodia",
      "Amanemu (Mie, Japan)": "https://www.google.com/maps/search/?api=1&query=Amanemu%20Mie%20Japan",
      "Aman Kyoto (Japan)": "https://www.google.com/maps/search/?api=1&query=Aman%20Kyoto%20Japan"
    },
    "blurb": "Pavilions carved into red-rock canyons, palazzos on the Grand Canal, villas above lotus-filled bays. Aman built the template for understated, off-the-grid luxury, and these are the retreats its devotees chase around the planet.",
    "defaultSource": "ai",
    "itemLinks": {
      "Amangiri (Canyon Point, Utah)": "https://www.aman.com/resorts/amangiri",
      "Amanoi (Vinh Hy Bay, Vietnam)": "https://www.aman.com/resorts/amanoi",
      "Amanzoe (Porto Heli, Greece)": "https://www.aman.com/resorts/amanzoe",
      "Amanpuri (Phuket, Thailand)": "https://www.aman.com/resorts/amanpuri",
      "Aman Tokyo (Japan)": "https://www.aman.com/hotels/aman-tokyo",
      "Amankila (Bali, Indonesia)": "https://www.aman.com/resorts/amankila",
      "Aman Venice (Italy)": "https://www.aman.com/hotels/aman-venice",
      "Amanyara (Turks & Caicos)": "https://www.aman.com/resorts/amanyara",
      "Aman New York (United States)": "https://www.aman.com/hotels/aman-new-york",
      "Amanpulo (Pamalican Island, Philippines)": "https://www.aman.com/resorts/amanpulo",
      "Amanera (Dominican Republic)": "https://www.aman.com/resorts/amanera",
      "Amanbagh (Rajasthan, India)": "https://www.aman.com/resorts/amanbagh",
      "Amanjiwo (Central Java, Indonesia)": "https://www.aman.com/resorts/amanjiwo",
      "Amankora (Paro, Bhutan)": "https://www.aman.com/resorts/amankora",
      "Aman-i-Khas (Ranthambore, India)": "https://www.aman.com/resorts/aman-i-khas",
      "Aman Sveti Stefan (Montenegro)": "https://www.aman.com/resorts/aman-sveti-stefan",
      "Amansara (Siem Reap, Cambodia)": "https://www.aman.com/resorts/amansara",
      "Amanemu (Mie, Japan)": "https://www.aman.com/resorts/amanemu",
      "Aman Kyoto (Japan)": "https://www.aman.com/resorts/aman-kyoto"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Amangiri (Canyon Point, Utah)",
          "Amanoi (Vinh Hy Bay, Vietnam)",
          "Amanzoe (Porto Heli, Greece)",
          "Amanpuri (Phuket, Thailand)",
          "Aman Tokyo (Japan)",
          "Amankila (Bali, Indonesia)",
          "Aman Venice (Italy)",
          "Amanyara (Turks & Caicos)",
          "Aman New York (United States)",
          "Amanpulo (Pamalican Island, Philippines)"
        ]
      },
      "luxetravelexpert": {
        "label": "The Luxury Travel Expert 2024",
        "items": [
          "Amangiri (Canyon Point, Utah)",
          "Amanoi (Vinh Hy Bay, Vietnam)",
          "Amanzoe (Porto Heli, Greece)",
          "Amanera (Dominican Republic)",
          "Aman Tokyo (Japan)",
          "Aman Venice (Italy)",
          "Amanyara (Turks & Caicos)",
          "Amanpuri (Phuket, Thailand)",
          "Amankila (Bali, Indonesia)",
          "Aman New York (United States)"
        ],
        "url": "https://theluxurytravelexpert.com/top-10-best-aman-resorts-hotels/"
      },
      "upgradedpoints": {
        "label": "Upgraded Points 2025",
        "items": [
          "Amanoi (Vinh Hy Bay, Vietnam)",
          "Amanpulo (Pamalican Island, Philippines)",
          "Amanbagh (Rajasthan, India)",
          "Amanzoe (Porto Heli, Greece)",
          "Amankila (Bali, Indonesia)",
          "Amanjiwo (Central Java, Indonesia)",
          "Amankora (Paro, Bhutan)",
          "Aman-i-Khas (Ranthambore, India)",
          "Aman Sveti Stefan (Montenegro)",
          "Amangiri (Canyon Point, Utah)",
          "Amanera (Dominican Republic)",
          "Amansara (Siem Reap, Cambodia)",
          "Amanpuri (Phuket, Thailand)",
          "Amanemu (Mie, Japan)",
          "Amanyara (Turks & Caicos)",
          "Aman New York (United States)"
        ],
        "url": "https://upgradedpoints.com/travel/hotels/best-aman-hotels-and-resorts/"
      },
      "pursuitist": {
        "label": "Pursuitist 2026",
        "items": [
          "Amangiri (Canyon Point, Utah)",
          "Aman Kyoto (Japan)",
          "Aman Sveti Stefan (Montenegro)",
          "Amanyara (Turks & Caicos)",
          "Aman Venice (Italy)"
        ],
        "url": "https://pursuitist.com/the-worlds-best-aman-hotels-and-resorts/"
      }
    },
    "vote": {
      "items": [
        "Amangiri (Canyon Point, Utah)",
        "Amanoi (Vinh Hy Bay, Vietnam)",
        "Amanzoe (Porto Heli, Greece)",
        "Amanpuri (Phuket, Thailand)",
        "Aman Tokyo (Japan)",
        "Amankila (Bali, Indonesia)",
        "Aman Venice (Italy)",
        "Amanyara (Turks & Caicos)",
        "Aman New York (United States)",
        "Amanpulo (Pamalican Island, Philippines)"
      ]
    }
  },
  {
    "id": "best-breweries-nyc-subway",
    "publishedDate": "2026-05-27",
    "publishedAt": "2026-05-27T20:00:00Z",
    "title": "Best Breweries on the NYC Subway System",
    "category": "New York",
    "type": "food",
    "tags": [
      "bars",
      "nightlife",
      "food-drink",
      "stores",
      "food",
      "entertainment"
    ],
    "linkType": "mapsCity",
    "blurb": "Hazy double IPAs, mixed-culture saisons, and crisp lagers poured a short walk from the turnstiles. Every taproom here sits within easy reach of a subway stop, so you can ride the rails from Gowanus to Astoria and never need a designated driver.",
    "defaultSource": "ai",
    "links": {
      "Other Half Brewing (Gowanus)": "https://www.google.com/maps/search/?api=1&query=Other%20Half%20Brewing%20Gowanus%20Brooklyn",
      "Grimm Artisanal Ales (East Williamsburg)": "https://www.google.com/maps/search/?api=1&query=Grimm%20Artisanal%20Ales%20990%20Metropolitan%20Ave%20Brooklyn",
      "Threes Brewing (Gowanus)": "https://www.google.com/maps/search/?api=1&query=Threes%20Brewing%20333%20Douglass%20St%20Brooklyn",
      "Finback Brewery (Glendale)": "https://www.google.com/maps/search/?api=1&query=Finback%20Brewery%207801%2077th%20Ave%20Queens",
      "Evil Twin Brewing (Ridgewood)": "https://www.google.com/maps/search/?api=1&query=Evil%20Twin%20Brewing%201616%20George%20St%20Ridgewood%20Queens",
      "Talea Beer Co. (Williamsburg)": "https://www.google.com/maps/search/?api=1&query=Talea%20Beer%20Co%2087%20Richardson%20St%20Brooklyn",
      "Kings County Brewers Collective (Bushwick)": "https://www.google.com/maps/search/?api=1&query=Kings%20County%20Brewers%20Collective%20381%20Troutman%20St%20Brooklyn",
      "Fifth Hammer Brewing Company (Long Island City)": "https://www.google.com/maps/search/?api=1&query=Fifth%20Hammer%20Brewing%2010-28%2046th%20Ave%20Long%20Island%20City%20Queens",
      "SingleCut Beersmiths (Astoria)": "https://www.google.com/maps/search/?api=1&query=SingleCut%20Beersmiths%2019-33%2037th%20St%20Astoria%20Queens",
      "Brooklyn Brewery (Williamsburg)": "https://www.google.com/maps/search/?api=1&query=Brooklyn%20Brewery%2079%20N%2011th%20St%20Brooklyn",
      "Transmitter Brewing (Brooklyn Navy Yard)": "https://www.google.com/maps/search/?api=1&query=Transmitter%20Brewing%20141%20Flushing%20Ave%20Brooklyn%20Navy%20Yard",
      "Wild East Brewing Co. (Gowanus)": "https://www.google.com/maps/search/?api=1&query=Wild%20East%20Brewing%20Co%20623%20Sackett%20St%20Brooklyn",
      "Torch & Crown Brewing Company (SoHo)": "https://www.google.com/maps/search/?api=1&query=Torch%20and%20Crown%20Brewing%2012%20Vandam%20St%20New%20York",
      "Greenpoint Beer & Ale Co. (Greenpoint)": "https://www.google.com/maps/search/?api=1&query=Greenpoint%20Beer%20and%20Ale%20Co%201150%20Manhattan%20Ave%20Brooklyn",
      "Focal Point Beer Co. (Long Island City)": "https://www.google.com/maps/search/?api=1&query=Focal%20Point%20Beer%20Co%2043-50%2012th%20St%20Long%20Island%20City%20Queens",
      "Eckhart Beer Co. (Bushwick)": "https://www.google.com/maps/search/?api=1&query=Eckhart%20Beer%20Co%20Brooklyn%20brewery",
      "Forever Brewing (Gowanus)": "https://www.google.com/maps/search/?api=1&query=Forever%20Brewing%20574%20President%20St%20Brooklyn",
      "Strong Rope Brewery (Red Hook)": "https://www.google.com/maps/search/?api=1&query=Strong%20Rope%20Brewery%20185%20Van%20Dyke%20St%20Brooklyn",
      "Rockaway Brewing Company (Long Island City)": "https://www.google.com/maps/search/?api=1&query=Rockaway%20Brewing%20Company%2046-01%20Fifth%20St%20Long%20Island%20City",
      "Big aLICe Brewing (Sunset Park)": "https://www.google.com/maps/search/?api=1&query=Big%20aLICe%20Brewing%2052%2034th%20St%20Brooklyn",
      "Alewife Brewing (Sunnyside)": "https://www.google.com/maps/search/?api=1&query=Alewife%20Brewing%2041-11%2039th%20St%20Queens",
      "Bronx Brewery (Port Morris)": "https://www.google.com/maps/search/?api=1&query=The%20Bronx%20Brewery%20856%20E%20136th%20St%20Bronx",
      "Gun Hill Brewing Co. (Williamsbridge)": "https://www.google.com/maps/search/?api=1&query=Gun%20Hill%20Brewing%203227%20Laconia%20Ave%20Bronx",
      "LIC Beer Project (Long Island City)": "https://www.google.com/maps/search/?api=1&query=LIC%20Beer%20Project%2039-28%2023rd%20St%20Queens",
      "Randolph Beer (DUMBO)": "https://www.google.com/maps/search/?api=1&query=Randolph%20Beer%2082%20Prospect%20St%20Brooklyn",
      "Coney Island Brewing Company (Coney Island)": "https://www.google.com/maps/search/?api=1&query=Coney%20Island%20Brewing%201904%20Surf%20Ave%20Brooklyn",
      "Flagship Brewing Company (Tompkinsville)": "https://www.google.com/maps/search/?api=1&query=Flagship%20Brewing%2040%20Minthorne%20St%20Staten%20Island"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Other Half Brewing (Gowanus)",
          "Grimm Artisanal Ales (East Williamsburg)",
          "Threes Brewing (Gowanus)",
          "Evil Twin Brewing (Ridgewood)",
          "Finback Brewery (Glendale)",
          "Talea Beer Co. (Williamsburg)",
          "Kings County Brewers Collective (Bushwick)",
          "Fifth Hammer Brewing Company (Long Island City)",
          "SingleCut Beersmiths (Astoria)",
          "Brooklyn Brewery (Williamsburg)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation NYC 2026",
        "items": [
          "Eckhart Beer Co. (Bushwick)",
          "SingleCut Beersmiths (Astoria)",
          "Grimm Artisanal Ales (East Williamsburg)",
          "Finback Brewery (Glendale)",
          "Other Half Brewing (Gowanus)",
          "Forever Brewing (Gowanus)",
          "Wild East Brewing Co. (Gowanus)",
          "Strong Rope Brewery (Red Hook)",
          "Threes Brewing (Gowanus)",
          "Evil Twin Brewing (Ridgewood)",
          "Rockaway Brewing Company (Long Island City)",
          "Kings County Brewers Collective (Bushwick)",
          "Fifth Hammer Brewing Company (Long Island City)",
          "Talea Beer Co. (Williamsburg)",
          "Transmitter Brewing (Brooklyn Navy Yard)",
          "Focal Point Beer Co. (Long Island City)"
        ],
        "url": "https://www.theinfatuation.com/new-york/guides/best-breweries-nyc"
      },
      "newyorkspork": {
        "label": "New York Spork 2026",
        "items": [
          "Threes Brewing (Gowanus)",
          "Other Half Brewing (Gowanus)",
          "Evil Twin Brewing (Ridgewood)",
          "Fifth Hammer Brewing Company (Long Island City)",
          "Talea Beer Co. (Williamsburg)",
          "Kings County Brewers Collective (Bushwick)",
          "Grimm Artisanal Ales (East Williamsburg)",
          "Wild East Brewing Co. (Gowanus)",
          "Torch & Crown Brewing Company (SoHo)",
          "Brooklyn Brewery (Williamsburg)",
          "Big aLICe Brewing (Sunset Park)",
          "Focal Point Beer Co. (Long Island City)",
          "Greenpoint Beer & Ale Co. (Greenpoint)",
          "Alewife Brewing (Sunnyside)",
          "Transmitter Brewing (Brooklyn Navy Yard)"
        ],
        "url": "https://newyorkspork.com/best-breweries-nyc/"
      },
      "secretnyc": {
        "label": "Secret NYC 2023",
        "items": [
          "SingleCut Beersmiths (Astoria)",
          "Evil Twin Brewing (Ridgewood)",
          "Brooklyn Brewery (Williamsburg)",
          "Talea Beer Co. (Williamsburg)",
          "Fifth Hammer Brewing Company (Long Island City)",
          "Bronx Brewery (Port Morris)",
          "Randolph Beer (DUMBO)",
          "LIC Beer Project (Long Island City)",
          "Torch & Crown Brewing Company (SoHo)",
          "Gun Hill Brewing Co. (Williamsbridge)",
          "Kings County Brewers Collective (Bushwick)",
          "Other Half Brewing (Gowanus)",
          "Coney Island Brewing Company (Coney Island)",
          "Flagship Brewing Company (Tompkinsville)",
          "Greenpoint Beer & Ale Co. (Greenpoint)"
        ],
        "url": "https://secretnyc.co/best-breweries-in-nyc/"
      }
    },
    "vote": {
      "items": [
        "Other Half Brewing (Gowanus)",
        "Grimm Artisanal Ales (East Williamsburg)",
        "Threes Brewing (Gowanus)",
        "Evil Twin Brewing (Ridgewood)",
        "Finback Brewery (Glendale)",
        "Talea Beer Co. (Williamsburg)",
        "Kings County Brewers Collective (Bushwick)",
        "Fifth Hammer Brewing Company (Long Island City)",
        "SingleCut Beersmiths (Astoria)",
        "Brooklyn Brewery (Williamsburg)"
      ]
    }
  },
  {
    "id": "best-beach-clubs-mediterranean",
    "publishedDate": "2026-05-27",
    "publishedAt": "2026-05-27T21:00:00Z",
    "title": "Best Beach Clubs on the Mediterranean",
    "category": "Travel",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "food-drink",
      "food",
      "bars",
      "nightlife",
      "stores",
      "entertainment"
    ],
    "linkType": "mapsCity",
    "blurb": "Tamarisk-shaded lunches above Pampelonne, plunge pools carved into the Faraglioni rocks, and sunset rituals on the Aegean. From Saint-Tropez to Mykonos, these are the Mediterranean addresses where the setting, the seafood, and the service all live up to the view.",
    "defaultSource": "ai",
    "links": {
      "Club 55 (Saint-Tropez, France)": "https://www.google.com/maps/search/?api=1&query=Club%2055%20Pampelonne%20Beach%20Saint-Tropez%20France",
      "La Guérite (Cannes, France)": "https://www.google.com/maps/search/?api=1&query=La%20Guerite%20Ile%20Sainte-Marguerite%20Cannes%20France",
      "La Fontelina (Capri, Italy)": "https://www.google.com/maps/search/?api=1&query=La%20Fontelina%20Beach%20Club%20Faraglioni%20Capri%20Italy",
      "Nammos (Mykonos, Greece)": "https://www.google.com/maps/search/?api=1&query=Nammos%20Psarou%20Beach%20Mykonos%20Greece",
      "Scorpios (Mykonos, Greece)": "https://www.google.com/maps/search/?api=1&query=Scorpios%20Paraga%20Beach%20Mykonos%20Greece",
      "Phi Beach (Sardinia, Italy)": "https://www.google.com/maps/search/?api=1&query=Phi%20Beach%20Baja%20Sardinia%20Italy",
      "Bonj Les Bains (Hvar, Croatia)": "https://www.google.com/maps/search/?api=1&query=Bonj%20Les%20Bains%20Beach%20Club%20Hvar%20Croatia",
      "Maçakızı (Bodrum, Turkey)": "https://www.google.com/maps/search/?api=1&query=Macakizi%20Hotel%20Turkbuku%20Bodrum%20Turkey",
      "Monte Carlo Beach Club (Monaco)": "https://www.google.com/maps/search/?api=1&query=Monte-Carlo%20Beach%20Club%20Roquebrune-Cap-Martin%20Monaco",
      "Cotton Beach Club (Ibiza, Spain)": "https://www.google.com/maps/search/?api=1&query=Cotton%20Beach%20Club%20Cala%20Tarida%20Ibiza%20Spain",
      "Purobeach Illetas (Mallorca, Spain)": "https://www.google.com/maps/search/?api=1&query=Purobeach%20Illetas%20Mallorca%20Spain",
      "Blue Marlin (Ibiza, Spain)": "https://www.google.com/maps/search/?api=1&query=Blue%20Marlin%20Ibiza%20Cala%20Jondal%20Spain",
      "Gran Folies (Mallorca, Spain)": "https://www.google.com/maps/search/?api=1&query=Gran%20Folies%20Beach%20Club%20Cala%20Llamp%20Mallorca%20Spain",
      "Beachouse (Ibiza, Spain)": "https://www.google.com/maps/search/?api=1&query=Beachouse%20Ibiza%20Playa%20den%20Bossa%20Spain",
      "Ushuaïa (Ibiza, Spain)": "https://www.google.com/maps/search/?api=1&query=Ushuaia%20Ibiza%20Beach%20Club%20Playa%20den%20Bossa%20Spain",
      "Chiringuito Puente Romano (Marbella, Spain)": "https://www.google.com/maps/search/?api=1&query=Chiringuito%20Puente%20Romano%20Beach%20Resort%20Marbella%20Spain",
      "Carpe Diem (Hvar, Croatia)": "https://www.google.com/maps/search/?api=1&query=Carpe%20Diem%20Beach%20Hvar%20Croatia",
      "Gecko Beach Club (Formentera, Spain)": "https://www.google.com/maps/search/?api=1&query=Gecko%20Beach%20Club%20Migjorn%20Formentera%20Spain",
      "Alemagou (Mykonos, Greece)": "https://www.google.com/maps/search/?api=1&query=Alemagou%20Ftelia%20Beach%20Mykonos%20Greece",
      "Missoni Beach Club at Verdura (Sicily, Italy)": "https://www.google.com/maps/search/?api=1&query=Missoni%20Beach%20Club%20Verdura%20Resort%20Sciacca%20Sicily%20Italy",
      "Dukley Beach Club (Budva, Montenegro)": "https://www.google.com/maps/search/?api=1&query=Dukley%20Beach%20Club%20Budva%20Montenegro",
      "Folie Marine (Jal, Albania)": "https://www.google.com/maps/search/?api=1&query=Folie%20Marine%20Jal%20Himare%20Albania",
      "Callao (Corfu, Greece)": "https://www.google.com/maps/search/?api=1&query=Callao%20Corfu%20Kalami%20Bay%20Greece",
      "Faragas Beach (Paros, Greece)": "https://www.google.com/maps/search/?api=1&query=Faragas%20Beach%20Paros%20Greece",
      "Castello Hydra (Hydra, Greece)": "https://www.google.com/maps/search/?api=1&query=Castello%20Hydra%20Kamini%20Beach%20Hydra%20Greece",
      "La Scogliera (Positano, Italy)": "https://www.google.com/maps/search/?api=1&query=La%20Scogliera%20Positano%20Amalfi%20Coast%20Italy"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Club 55 (Saint-Tropez, France)",
          "La Fontelina (Capri, Italy)",
          "Nammos (Mykonos, Greece)",
          "Scorpios (Mykonos, Greece)",
          "Bonj Les Bains (Hvar, Croatia)",
          "La Guérite (Cannes, France)",
          "Phi Beach (Sardinia, Italy)",
          "Maçakızı (Bodrum, Turkey)",
          "Beachouse (Ibiza, Spain)",
          "Cotton Beach Club (Ibiza, Spain)"
        ]
      },
      "sybarite": {
        "label": "The Sybarite 2026",
        "items": [
          "Maçakızı (Bodrum, Turkey)",
          "Alemagou (Mykonos, Greece)",
          "Club 55 (Saint-Tropez, France)",
          "Scorpios (Mykonos, Greece)",
          "Bonj Les Bains (Hvar, Croatia)",
          "La Fontelina (Capri, Italy)",
          "Dukley Beach Club (Budva, Montenegro)",
          "Missoni Beach Club at Verdura (Sicily, Italy)",
          "Folie Marine (Jal, Albania)",
          "Monte Carlo Beach Club (Monaco)",
          "Chiringuito Puente Romano (Marbella, Spain)",
          "Ushuaïa (Ibiza, Spain)",
          "Blue Marlin (Ibiza, Spain)",
          "Nammos (Mykonos, Greece)"
        ],
        "url": "https://thesybarite.co/best-beach-clubs-europe"
      },
      "talamare": {
        "label": "Talamare Yacht Charter 2026",
        "items": [
          "Club 55 (Saint-Tropez, France)",
          "La Guérite (Cannes, France)",
          "La Fontelina (Capri, Italy)",
          "Phi Beach (Sardinia, Italy)",
          "Cotton Beach Club (Ibiza, Spain)",
          "Purobeach Illetas (Mallorca, Spain)",
          "Gecko Beach Club (Formentera, Spain)",
          "Bonj Les Bains (Hvar, Croatia)",
          "Carpe Diem (Hvar, Croatia)",
          "Nammos (Mykonos, Greece)",
          "Scorpios (Mykonos, Greece)"
        ],
        "url": "https://www.talamare.com/the-best-beach-clubs-to-visit-on-a-mediterranean-yacht-charter-b12.php"
      },
      "luxurytravelbook": {
        "label": "The Luxury Travel Book 2026",
        "items": [
          "Nammos (Mykonos, Greece)",
          "Beachouse (Ibiza, Spain)",
          "Club 55 (Saint-Tropez, France)",
          "Gran Folies (Mallorca, Spain)",
          "Callao (Corfu, Greece)",
          "Faragas Beach (Paros, Greece)",
          "Castello Hydra (Hydra, Greece)",
          "La Fontelina (Capri, Italy)",
          "La Scogliera (Positano, Italy)"
        ],
        "url": "https://theluxurytravelbook.com/luxury-travel-journals/10-of-the-best-beach-clubs-in-europe/"
      }
    },
    "vote": {
      "items": [
        "Club 55 (Saint-Tropez, France)",
        "La Fontelina (Capri, Italy)",
        "Nammos (Mykonos, Greece)",
        "Scorpios (Mykonos, Greece)",
        "Bonj Les Bains (Hvar, Croatia)",
        "La Guérite (Cannes, France)",
        "Phi Beach (Sardinia, Italy)",
        "Maçakızı (Bodrum, Turkey)",
        "Beachouse (Ibiza, Spain)",
        "Cotton Beach Club (Ibiza, Spain)"
      ]
    }
  },
  {
    "id": "best-burgers-outside-usa",
    "publishedDate": "2026-05-27",
    "publishedAt": "2026-05-27T22:00:00Z",
    "title": "Best Burgers in the World Outside the US",
    "category": "World",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "Dry-aged Rubia Gallega in Valencia, gochujang-glazed smash patties in Stockholm, Wagyu cheeseburgers outside Osaka. The world has been quietly out-burgering America for years, and these are the addresses where the proof is on the bun.",
    "defaultSource": "ai",
    "links": {
      "Hundred Burgers (Valencia, Spain)": "https://www.google.com/maps/search/?api=1&query=Hundred%20Burgers%20Valencia%20Spain",
      "Bleecker (London, UK)": "https://www.google.com/maps/search/?api=1&query=Bleecker%20Burger%20London",
      "Black Bear Burger (London, UK)": "https://www.google.com/maps/search/?api=1&query=Black%20Bear%20Burger%20London",
      "Popl Burger (Copenhagen, Denmark)": "https://www.google.com/maps/search/?api=1&query=Popl%20Burger%20Copenhagen%20Denmark",
      "Funky Chicken Food Truck (Stockholm, Sweden)": "https://www.google.com/maps/search/?api=1&query=Funky%20Chicken%20Food%20Truck%20Stockholm%20Sweden",
      "Gasoline Grill (Copenhagen, Denmark)": "https://www.google.com/maps/search/?api=1&query=Gasoline%20Grill%20Copenhagen%20Denmark",
      "La Birra Bar (Buenos Aires, Argentina)": "https://www.google.com/maps/search/?api=1&query=La%20Birra%20Bar%20Buenos%20Aires%20Argentina",
      "Hawksmoor (London, UK)": "https://www.google.com/maps/search/?api=1&query=Hawksmoor%20Restaurant%20London",
      "Burger & Beyond (London, UK)": "https://www.google.com/maps/search/?api=1&query=Burger%20and%20Beyond%20London",
      "Next Door (Sydney, Australia)": "https://www.google.com/maps/search/?api=1&query=Next%20Door%20Burger%20Sydney%20Australia",
      "Dove (London, UK)": "https://www.google.com/maps/search/?api=1&query=Dove%20Notting%20Hill%20London",
      "The Gidley (Sydney, Australia)": "https://www.google.com/maps/search/?api=1&query=The%20Gidley%20restaurant%20Sydney%20Australia",
      "Charrd (Melbourne, Australia)": "https://www.google.com/maps/search/?api=1&query=Charrd%20Burger%20Melbourne%20Australia",
      "All or Nothing Burger (Alicante, Spain)": "https://www.google.com/maps/search/?api=1&query=All%20or%20Nothing%20Burger%20Alicante%20Spain",
      "Gui's Burger (Osaka, Japan)": "https://www.google.com/maps/search/?api=1&query=Guis%20Burger%20Ashiya%20Osaka%20Japan",
      "11 Woodfire (Dubai, UAE)": "https://www.google.com/maps/search/?api=1&query=11%20Woodfire%20Dubai%20UAE",
      "Salt Shed (Brighton, UK)": "https://www.google.com/maps/search/?api=1&query=Salt%20Shed%20Brighton%20UK",
      "Reburger (Florence, Italy)": "https://www.google.com/maps/search/?api=1&query=Reburger%20Florence%20Oltrarno%20Italy",
      "Heard (London, UK)": "https://www.google.com/maps/search/?api=1&query=Heard%20restaurant%20London%20UK",
      "Holy Burger (São Paulo, Brazil)": "https://www.google.com/maps/search/?api=1&query=Holy%20Burger%20Sao%20Paulo%20Brazil",
      "Grindhouse Braserito (São Paulo, Brazil)": "https://www.google.com/maps/search/?api=1&query=Grindhouse%20Braserito%20Pinheiros%20Sao%20Paulo%20Brazil",
      "Soul Coffee Beer (Valencia, Spain)": "https://www.google.com/maps/search/?api=1&query=Soul%20Coffee%20Beer%20Paiporta%20Valencia%20Spain",
      "Briochef (Madrid, Spain)": "https://www.google.com/maps/search/?api=1&query=Briochef%20Madrid%20Spain",
      "BDP Burger (Madrid, Spain)": "https://www.google.com/maps/search/?api=1&query=BDP%20Burger%20Madrid%20Spain",
      "MeatCastles (Retford, UK)": "https://www.google.com/maps/search/?api=1&query=MeatCastles%20Burger%20Retford%20England",
      "Goldieboy (Melbourne, Australia)": "https://www.google.com/maps/search/?api=1&query=Goldieboy%20burger%20Brighton%20Melbourne%20Australia",
      "Will's (Sydney, Australia)": "https://www.google.com/maps/search/?api=1&query=Wills%20Burger%20Coogee%20Beach%20Sydney%20Australia",
      "Black Cactus (London, UK)": "https://www.google.com/maps/search/?api=1&query=Black%20Cactus%20BBQ%20Walthamstow%20London",
      "The Food Truck Store (Buenos Aires, Argentina)": "https://www.google.com/maps/search/?api=1&query=The%20Food%20Truck%20Store%20Buenos%20Aires%20Argentina",
      "Rekas Burgers (Malmö, Sweden)": "https://www.google.com/maps/search/?api=1&query=Rekas%20Burgers%20Malmo%20Sweden",
      "Franky's (Stockholm, Sweden)": "https://www.google.com/maps/search/?api=1&query=Frankys%20Burgers%20Stockholm%20Sweden",
      "Huxtaburger (Melbourne, Australia)": "https://www.google.com/maps/search/?api=1&query=Huxtaburger%20Melbourne%20Australia",
      "Burger & Lobster (London, UK)": "https://www.google.com/maps/search/?api=1&query=Burger%20and%20Lobster%20London",
      "Encarnado Burger (Rio de Janeiro, Brazil)": "https://www.google.com/maps/search/?api=1&query=Encarnado%20Burger%20Rio%20de%20Janeiro%20Brazil",
      "Goldies (Berlin, Germany)": "https://www.google.com/maps/search/?api=1&query=Goldies%20Smash%20Burger%20Berlin%20Germany",
      "OddBird (St. Catharines, Canada)": "https://www.google.com/maps/search/?api=1&query=OddBird%20St%20Catharines%20Niagara%20Canada",
      "Paul's Famous Hamburgers (Sylvania, Australia)": "https://www.google.com/maps/search/?api=1&query=Pauls%20Famous%20Hamburgers%20Sylvania%20Sydney%20Australia",
      "Olympus Burger (Port Hope, Canada)": "https://www.google.com/maps/search/?api=1&query=Olympus%20Burger%20Port%20Hope%20Ontario%20Canada",
      "The Carnivan Superbar (León, Spain)": "https://www.google.com/maps/search/?api=1&query=The%20Carnivan%20Superbar%20Leon%20Spain",
      "Fat Broder (Buenos Aires, Argentina)": "https://www.google.com/maps/search/?api=1&query=Fat%20Broder%20Palermo%20Buenos%20Aires%20Argentina",
      "Flippin' Burgers (Stockholm, Sweden)": "https://www.google.com/maps/search/?api=1&query=Flippin%20Burgers%20Stockholm%20Sweden",
      "PNY (Paris, France)": "https://www.google.com/maps/search/?api=1&query=PNY%20Burger%20Paris%20France",
      "Henry's Burger (Tokyo, Japan)": "https://www.google.com/maps/search/?api=1&query=Henrys%20Burger%20Tokyo%20Japan",
      "Frankie Fenner Meat Merchants (Cape Town, South Africa)": "https://www.google.com/maps/search/?api=1&query=Frankie%20Fenner%20Meat%20Merchants%20Cape%20Town%20South%20Africa",
      "Sold Out Burger (Paris, France)": "https://www.google.com/maps/search/?api=1&query=Sold%20Out%20Burger%20Paris%20France",
      "One Fattened Calf (Singapore)": "https://www.google.com/maps/search/?api=1&query=One%20Fattened%20Calf%20Galaxis%20Singapore",
      "All In (Berlin, Germany)": "https://www.google.com/maps/search/?api=1&query=All%20In%20Burger%20Berlin%20Germany",
      "Shed (Verbier, Switzerland)": "https://www.google.com/maps/search/?api=1&query=Shed%20Burgers%20Verbier%20Switzerland",
      "8Cuts Burgers (Manila, Philippines)": "https://www.google.com/maps/search/?api=1&query=8Cuts%20Burgers%20Metro%20Manila%20Philippines",
      "Fergburger (Queenstown, New Zealand)": "https://www.google.com/maps/search/?api=1&query=Fergburger%20Queenstown%20New%20Zealand",
      "Whole Beast (London, UK)": "https://www.google.com/maps/search/?api=1&query=Whole%20Beast%20The%20Montpelier%20Peckham%20London"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Hundred Burgers (Valencia, Spain)",
          "Bleecker (London, UK)",
          "Black Bear Burger (London, UK)",
          "Holy Burger (São Paulo, Brazil)",
          "Burger & Beyond (London, UK)",
          "Gui's Burger (Osaka, Japan)",
          "Funky Chicken Food Truck (Stockholm, Sweden)",
          "Gasoline Grill (Copenhagen, Denmark)",
          "The Gidley (Sydney, Australia)",
          "Whole Beast (London, UK)"
        ]
      },
      "worldsbeststeaks": {
        "label": "World's 25 Best Burgers 2025",
        "items": [
          "Hundred Burgers (Valencia, Spain)",
          "Bleecker (London, UK)",
          "Black Bear Burger (London, UK)",
          "Popl Burger (Copenhagen, Denmark)",
          "Funky Chicken Food Truck (Stockholm, Sweden)",
          "Gasoline Grill (Copenhagen, Denmark)",
          "La Birra Bar (Buenos Aires, Argentina)",
          "Hawksmoor (London, UK)",
          "Burger & Beyond (London, UK)",
          "Next Door (Sydney, Australia)",
          "Dove (London, UK)",
          "The Gidley (Sydney, Australia)",
          "Charrd (Melbourne, Australia)",
          "All or Nothing Burger (Alicante, Spain)",
          "Gui's Burger (Osaka, Japan)",
          "11 Woodfire (Dubai, UAE)",
          "Salt Shed (Brighton, UK)",
          "Reburger (Florence, Italy)",
          "Heard (London, UK)"
        ],
        "url": "https://www.worldbeststeaks.com/top-10-burger/01"
      },
      "burgerdudes": {
        "label": "Burgerdudes 2026",
        "items": [
          "Hundred Burgers (Valencia, Spain)",
          "Holy Burger (São Paulo, Brazil)",
          "Funky Chicken Food Truck (Stockholm, Sweden)",
          "Burger & Beyond (London, UK)",
          "Gui's Burger (Osaka, Japan)",
          "MeatCastles (Retford, UK)",
          "Soul Coffee Beer (Valencia, Spain)",
          "Grindhouse Braserito (São Paulo, Brazil)",
          "Bleecker (London, UK)",
          "Goldieboy (Melbourne, Australia)",
          "Briochef (Madrid, Spain)",
          "Black Cactus (London, UK)",
          "Franky's (Stockholm, Sweden)",
          "BDP Burger (Madrid, Spain)",
          "Will's (Sydney, Australia)",
          "Rekas Burgers (Malmö, Sweden)",
          "Dove (London, UK)",
          "The Food Truck Store (Buenos Aires, Argentina)"
        ],
        "url": "https://www.burgerdudes.se/the-worlds-best-burgers/"
      },
      "lovefood": {
        "label": "LoveFood 2025",
        "items": [
          "Hundred Burgers (Valencia, Spain)",
          "Black Bear Burger (London, UK)",
          "Whole Beast (London, UK)",
          "Holy Burger (São Paulo, Brazil)",
          "Burger & Beyond (London, UK)",
          "Bleecker (London, UK)",
          "Soul Coffee Beer (Valencia, Spain)",
          "Gasoline Grill (Copenhagen, Denmark)",
          "Briochef (Madrid, Spain)",
          "Huxtaburger (Melbourne, Australia)",
          "Burger & Lobster (London, UK)",
          "Encarnado Burger (Rio de Janeiro, Brazil)",
          "Goldies (Berlin, Germany)",
          "The Gidley (Sydney, Australia)",
          "OddBird (St. Catharines, Canada)",
          "Paul's Famous Hamburgers (Sylvania, Australia)",
          "Olympus Burger (Port Hope, Canada)",
          "The Carnivan Superbar (León, Spain)",
          "Fat Broder (Buenos Aires, Argentina)",
          "Flippin' Burgers (Stockholm, Sweden)",
          "PNY (Paris, France)",
          "Henry's Burger (Tokyo, Japan)",
          "Frankie Fenner Meat Merchants (Cape Town, South Africa)",
          "Sold Out Burger (Paris, France)",
          "One Fattened Calf (Singapore)",
          "All In (Berlin, Germany)",
          "Shed (Verbier, Switzerland)",
          "8Cuts Burgers (Manila, Philippines)",
          "Hawksmoor (London, UK)",
          "Fergburger (Queenstown, New Zealand)"
        ],
        "url": "https://www.lovefood.com/gallerylist/339503/ranked-the-worlds-best-burgers"
      }
    },
    "vote": {
      "items": [
        "Hundred Burgers (Valencia, Spain)",
        "Bleecker (London, UK)",
        "Black Bear Burger (London, UK)",
        "Holy Burger (São Paulo, Brazil)",
        "Burger & Beyond (London, UK)",
        "Gui's Burger (Osaka, Japan)",
        "Funky Chicken Food Truck (Stockholm, Sweden)",
        "Gasoline Grill (Copenhagen, Denmark)",
        "The Gidley (Sydney, Australia)",
        "Whole Beast (London, UK)"
      ]
    }
  },
  {
    "id": "croissants-montreal",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-28T09:00:00Z",
    "title": "Best Croissants in Montreal",
    "category": "Montreal",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "Lamination is a religion in Montreal. From Mile End icons to Plateau pâtisseries to Outremont classics, these are the bakeries where the crackle, butter, and crumb actually live up to the hype.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Hof Kelsten (Mile End)",
          "Le Paltoquet (Outremont)",
          "Au Kouign Amann (Plateau)",
          "Olive et Gourmando (Old Montreal)",
          "Le Saint Louis Café (Plateau)",
          "Les Co'pains d'abord (Plateau)",
          "Fous Desserts (Plateau)",
          "Boulangerie Jarry (Villeray)",
          "La Bête à Pain (Griffintown)",
          "Croissant Croissant (Plateau)"
        ]
      },
      "tastet": {
        "label": "Tastet 2026",
        "items": [
          "Hof Kelsten (Mile End)",
          "Le Paltoquet (Outremont)",
          "Au Kouign Amann (Plateau)",
          "Les Co'pains d'abord (Plateau)",
          "Le Pain dans les Voiles (Villeray)",
          "La Petite Boulangerie (Ahuntsic)",
          "Olive et Gourmando (Old Montreal)",
          "La Croissanterie Figaro (Outremont)",
          "Fous Desserts (Plateau)",
          "Automne Boulangerie (Rosemont)",
          "La Bête à Pain (Griffintown)",
          "Helico (Hochelaga)",
          "Brioche à Tête (Mile End)",
          "Croissant Croissant (Plateau)",
          "Le Saint Louis Café (Plateau)",
          "Louise Boulangerie (Little Italy)",
          "Joe la Croûte (Jean-Talon Market)",
          "Le Toledo (Plateau)"
        ],
        "url": "https://tastet.ca/en/lists/best-croissants-in-montreal/"
      },
      "timeout": {
        "label": "Time Out Montreal 2024",
        "items": [
          "Le Saint Louis Café (Plateau)",
          "Hof Kelsten (Mile End)",
          "Olive et Gourmando (Old Montreal)",
          "Boulangerie Jarry (Villeray)",
          "Au Kouign Amann (Plateau)",
          "Rhubarbe (Pointe-Saint-Charles)",
          "La Bête à Pain (Griffintown)",
          "Automne Boulangerie (Rosemont)",
          "La Croissanterie Figaro (Outremont)",
          "Le Pain dans les Voiles (Villeray)",
          "Chez Fred (Monkland)",
          "Mamie Clafoutis (Plateau)",
          "L'Amour du Pain (Griffintown)",
          "Croissant Croissant (Plateau)",
          "Les Co'pains d'abord (Plateau)",
          "Le Paltoquet (Outremont)",
          "Farine & Vanille (Mile End)",
          "Joe la Croûte (Jean-Talon Market)",
          "De Froment et de Sève (Rosemont)",
          "Ô Petit Paris (Plateau)",
          "Fous Desserts (Plateau)"
        ],
        "url": "https://www.timeout.com/montreal/restaurants/best-croissant-montreal"
      },
      "tourismemontreal": {
        "label": "Tourisme Montréal 2026",
        "items": [
          "Les Co'pains d'abord (Plateau)",
          "Fous Desserts (Plateau)",
          "Croissant Croissant (Plateau)",
          "Au Kouign Amann (Plateau)",
          "Le Toledo (Plateau)",
          "Mamie Clafoutis (Plateau)",
          "Le Saint Louis Café (Plateau)",
          "De Froment et de Sève (Rosemont)",
          "Le Paltoquet (Outremont)",
          "Hof Kelsten (Mile End)",
          "Brioche à Tête (Mile End)",
          "Boulangerie Guillaume (Mile End)",
          "Farine & Vanille (Mile End)",
          "Chez Fred (Monkland)",
          "Aube Boulangerie (Hochelaga)",
          "Olive et Gourmando (Old Montreal)",
          "La Bête à Pain (Griffintown)"
        ]
      }
    },
    "vote": {
      "items": [
        "Hof Kelsten (Mile End)",
        "Le Paltoquet (Outremont)",
        "Au Kouign Amann (Plateau)",
        "Olive et Gourmando (Old Montreal)",
        "Le Saint Louis Café (Plateau)",
        "Les Co'pains d'abord (Plateau)",
        "Fous Desserts (Plateau)",
        "Boulangerie Jarry (Villeray)",
        "La Bête à Pain (Griffintown)",
        "Croissant Croissant (Plateau)"
      ]
    },
    "links": {
      "Hof Kelsten (Mile End)": "https://www.google.com/maps/search/?api=1&query=Hof%20Kelsten%20Mile%20End%20Montreal",
      "Le Paltoquet (Outremont)": "https://www.google.com/maps/search/?api=1&query=Le%20Paltoquet%20Outremont%20Montreal",
      "Au Kouign Amann (Plateau)": "https://www.google.com/maps/search/?api=1&query=Au%20Kouign%20Amann%20Plateau%20Montreal",
      "Les Co'pains d'abord (Plateau)": "https://www.google.com/maps/search/?api=1&query=Les%20Copains%20dabord%20Plateau%20Montreal",
      "Le Pain dans les Voiles (Villeray)": "https://www.google.com/maps/search/?api=1&query=Le%20Pain%20dans%20les%20Voiles%20Villeray%20Montreal",
      "La Petite Boulangerie (Ahuntsic)": "https://www.google.com/maps/search/?api=1&query=La%20Petite%20Boulangerie%20Fleury%20Ahuntsic%20Montreal",
      "Olive et Gourmando (Old Montreal)": "https://www.google.com/maps/search/?api=1&query=Olive%20et%20Gourmando%20Old%20Montreal",
      "La Croissanterie Figaro (Outremont)": "https://www.google.com/maps/search/?api=1&query=La%20Croissanterie%20Figaro%20Outremont%20Montreal",
      "Fous Desserts (Plateau)": "https://www.google.com/maps/search/?api=1&query=Fous%20Desserts%20Laurier%20Montreal",
      "Automne Boulangerie (Rosemont)": "https://www.google.com/maps/search/?api=1&query=Automne%20Boulangerie%20Rosemont%20Montreal",
      "La Bête à Pain (Griffintown)": "https://www.google.com/maps/search/?api=1&query=La%20Bete%20a%20Pain%20Griffintown%20Montreal",
      "Helico (Hochelaga)": "https://www.google.com/maps/search/?api=1&query=Helico%20Hochelaga%20Montreal",
      "Brioche à Tête (Mile End)": "https://www.google.com/maps/search/?api=1&query=Brioche%20a%20Tete%20Fairmount%20Mile%20End%20Montreal",
      "Croissant Croissant (Plateau)": "https://www.google.com/maps/search/?api=1&query=Croissant%20Croissant%20Mont%20Royal%20Montreal",
      "Le Saint Louis Café (Plateau)": "https://www.google.com/maps/search/?api=1&query=Le%20Saint%20Louis%20Cafe%20Plateau%20Montreal",
      "Louise Boulangerie (Little Italy)": "https://www.google.com/maps/search/?api=1&query=Louise%20Boulangerie%20Saint%20Laurent%20Montreal",
      "Joe la Croûte (Jean-Talon Market)": "https://www.google.com/maps/search/?api=1&query=Joe%20la%20Croute%20Jean%20Talon%20Market%20Montreal",
      "Le Toledo (Plateau)": "https://www.google.com/maps/search/?api=1&query=Le%20Toledo%20Mont%20Royal%20Montreal",
      "Boulangerie Jarry (Villeray)": "https://www.google.com/maps/search/?api=1&query=Boulangerie%20Jarry%20Villeray%20Montreal",
      "Rhubarbe (Pointe-Saint-Charles)": "https://www.google.com/maps/search/?api=1&query=Patisserie%20Rhubarbe%20Pointe%20Saint%20Charles%20Montreal",
      "Chez Fred (Monkland)": "https://www.google.com/maps/search/?api=1&query=Chez%20Fred%20Monkland%20Montreal",
      "Mamie Clafoutis (Plateau)": "https://www.google.com/maps/search/?api=1&query=Mamie%20Clafoutis%20Saint%20Denis%20Montreal",
      "L'Amour du Pain (Griffintown)": "https://www.google.com/maps/search/?api=1&query=Lamour%20du%20Pain%20Griffintown%20Montreal",
      "Farine & Vanille (Mile End)": "https://www.google.com/maps/search/?api=1&query=Farine%20et%20Vanille%20Parc%20Avenue%20Montreal",
      "De Froment et de Sève (Rosemont)": "https://www.google.com/maps/search/?api=1&query=De%20Froment%20et%20de%20Seve%20Beaubien%20Montreal",
      "Ô Petit Paris (Plateau)": "https://www.google.com/maps/search/?api=1&query=O%20Petit%20Paris%20Mont%20Royal%20Montreal",
      "Boulangerie Guillaume (Mile End)": "https://www.google.com/maps/search/?api=1&query=Boulangerie%20Guillaume%20Mile%20End%20Montreal",
      "Aube Boulangerie (Hochelaga)": "https://www.google.com/maps/search/?api=1&query=Aube%20Boulangerie%20Hochelaga%20Montreal"
    }
  },
  {
    "id": "bakeries-nyc",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-28T10:00:00Z",
    "title": "Best Bakeries in NYC",
    "category": "New York",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "From Greenpoint laminated obsessives to Arthur Avenue cannoli institutions to East Village third-culture pastry rooms, the bakeries that have New Yorkers lining up at sunrise.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Radio Bakery (Greenpoint)",
          "Dolly's (Bed-Stuy)",
          "Hani's Bakery (East Village)",
          "Librae Bakery (East Village)",
          "Supermoon Bakehouse (Lower East Side)",
          "Veniero's Pasticceria (East Village)",
          "La Cabra (East Village)",
          "Elbow Bread (Chinatown)",
          "Patisserie Tomoko (Williamsburg)",
          "Win Son Bakery (East Williamsburg)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation NYC 2025",
        "items": [
          "Radio Bakery (Greenpoint)",
          "Dolly's (Bed-Stuy)",
          "Hani's Bakery (East Village)",
          "Kora (Long Island City)",
          "Veniero's Pasticceria (East Village)",
          "Elbow Bread (Chinatown)",
          "Red Gate Bakery (East Village)",
          "Saint Street Cakes (Crown Heights)",
          "Otway Bakery (Clinton Hill)",
          "Supermoon Bakehouse (Lower East Side)",
          "Masa Madre (Lower East Side)",
          "ACQ Bread Co (Williamsburg)",
          "La Cabra (East Village)",
          "Librae Bakery (East Village)",
          "Lady Wong (East Village)",
          "Lee Lee's Baked Goods (Harlem)",
          "William Greenberg Desserts (Upper East Side)",
          "Villabate Alba (Bensonhurst)",
          "Artion Bakery (Astoria)",
          "Xin Fa Bakery (Sunset Park)",
          "La Flor De Izucar Café (East Harlem)",
          "La Bicyclette Bakery (Hell's Kitchen)"
        ],
        "url": "https://www.theinfatuation.com/new-york/guides/best-bakeries-nyc"
      },
      "timeout": {
        "label": "Time Out New York 2026",
        "items": [
          "Dolly's (Bed-Stuy)",
          "Miolin Bakery (Park Slope)",
          "Radio Bakery (Greenpoint)",
          "Patisserie Tomoko (Williamsburg)",
          "Supermoon Bakehouse (Lower East Side)",
          "Gino's Pastry Shop (Belmont, Bronx)",
          "Lloyd's Carrot Cake (East Harlem)",
          "Baked (Red Hook)",
          "Four & Twenty Blackbirds (Gowanus)",
          "Veniero's Pasticceria (East Village)",
          "Petee's Pie Company (Lower East Side)",
          "Win Son Bakery (East Williamsburg)",
          "Levain Bakery (Upper West Side)",
          "Sugar Sweet Sunshine (Lower East Side)",
          "Orwashers Bakery (Upper East Side)"
        ],
        "url": "https://www.timeout.com/newyork/restaurants/best-bakeries-in-nyc"
      },
      "resy": {
        "label": "Resy 2025",
        "items": [
          "Agi's Counter (Crown Heights)",
          "The Bakery at Greywind (Hudson Yards)",
          "Birdee (Williamsburg)",
          "Cafe Mado (Prospect Heights)",
          "Bánh by Lauren (Two Bridges)",
          "Café Sabarsky (Upper East Side)",
          "Elbow Bread (Chinatown)",
          "Hani's Bakery (East Village)",
          "K'Far Brooklyn (Williamsburg)",
          "La Cabra (East Village)",
          "Le Crocodile (Williamsburg)",
          "Librae Bakery (East Village)",
          "Lilia Caffé (Williamsburg)",
          "Lysée (Gramercy Park)",
          "Mah-Ze-Dahr (West Village)",
          "Pan Pan (Greenpoint)",
          "Patisserie Tomoko (Williamsburg)",
          "Patti Ann's (Prospect Heights)",
          "Radio Bakery (Greenpoint)",
          "Raf's (NoHo)",
          "Rigor Hill Market (Tribeca)",
          "Smør Bakery (East Village)",
          "Thea (Fort Greene)",
          "Win Son Bakery (East Williamsburg)"
        ],
        "url": "https://blog.resy.com/2025/04/best-bakeries-nyc/"
      }
    },
    "vote": {
      "items": [
        "Radio Bakery (Greenpoint)",
        "Dolly's (Bed-Stuy)",
        "Hani's Bakery (East Village)",
        "Librae Bakery (East Village)",
        "Supermoon Bakehouse (Lower East Side)",
        "Veniero's Pasticceria (East Village)",
        "La Cabra (East Village)",
        "Elbow Bread (Chinatown)",
        "Patisserie Tomoko (Williamsburg)",
        "Levain Bakery (Upper West Side)"
      ]
    },
    "links": {
      "Radio Bakery (Greenpoint)": "https://www.google.com/maps/search/?api=1&query=Radio%20Bakery%20Greenpoint%20Brooklyn",
      "Dolly's (Bed-Stuy)": "https://www.google.com/maps/search/?api=1&query=Dollys%20Coffee%20Shop%20Bed%20Stuy%20Brooklyn",
      "Hani's Bakery (East Village)": "https://www.google.com/maps/search/?api=1&query=Hanis%20Bakery%20East%20Village%20NYC",
      "Kora (Long Island City)": "https://www.google.com/maps/search/?api=1&query=Kora%20Bakery%20Long%20Island%20City",
      "Veniero's Pasticceria (East Village)": "https://www.google.com/maps/search/?api=1&query=Venieros%20Pasticceria%20East%2011th%20Street%20NYC",
      "Elbow Bread (Chinatown)": "https://www.google.com/maps/search/?api=1&query=Elbow%20Bread%20Ludlow%20NYC",
      "Red Gate Bakery (East Village)": "https://www.google.com/maps/search/?api=1&query=Red%20Gate%20Bakery%20East%20Village%20NYC",
      "Saint Street Cakes (Crown Heights)": "https://www.google.com/maps/search/?api=1&query=Saint%20Street%20Cakes%20Crown%20Heights%20Brooklyn",
      "Otway Bakery (Clinton Hill)": "https://www.google.com/maps/search/?api=1&query=Otway%20Bakery%20Clinton%20Hill%20Brooklyn",
      "Supermoon Bakehouse (Lower East Side)": "https://www.google.com/maps/search/?api=1&query=Supermoon%20Bakehouse%20Rivington%20NYC",
      "Masa Madre (Lower East Side)": "https://www.google.com/maps/search/?api=1&query=Masa%20Madre%20Lower%20East%20Side%20NYC",
      "ACQ Bread Co (Williamsburg)": "https://www.google.com/maps/search/?api=1&query=ACQ%20Bread%20Co%20Williamsburg%20Brooklyn",
      "La Cabra (East Village)": "https://www.google.com/maps/search/?api=1&query=La%20Cabra%20Bakery%20East%20Village%20NYC",
      "Librae Bakery (East Village)": "https://www.google.com/maps/search/?api=1&query=Librae%20Bakery%20East%20Village%20NYC",
      "Lady Wong (East Village)": "https://www.google.com/maps/search/?api=1&query=Lady%20Wong%20Pastry%20East%20Village%20NYC",
      "Lee Lee's Baked Goods (Harlem)": "https://www.google.com/maps/search/?api=1&query=Lee%20Lees%20Baked%20Goods%20Harlem%20NYC",
      "William Greenberg Desserts (Upper East Side)": "https://www.google.com/maps/search/?api=1&query=William%20Greenberg%20Desserts%20Upper%20East%20Side%20NYC",
      "Villabate Alba (Bensonhurst)": "https://www.google.com/maps/search/?api=1&query=Villabate%20Alba%20Bensonhurst%20Brooklyn",
      "Artion Bakery (Astoria)": "https://www.google.com/maps/search/?api=1&query=Artion%20Bakery%20Astoria%20Queens",
      "Xin Fa Bakery (Sunset Park)": "https://www.google.com/maps/search/?api=1&query=Xin%20Fa%20Bakery%20Sunset%20Park%20Brooklyn",
      "La Flor De Izucar Café (East Harlem)": "https://www.google.com/maps/search/?api=1&query=La%20Flor%20de%20Izucar%20East%20Harlem%20NYC",
      "La Bicyclette Bakery (Hell's Kitchen)": "https://www.google.com/maps/search/?api=1&query=La%20Bicyclette%20Bakery%20Hells%20Kitchen%20NYC",
      "Miolin Bakery (Park Slope)": "https://www.google.com/maps/search/?api=1&query=Miolin%20Bakery%207th%20Avenue%20Park%20Slope%20Brooklyn",
      "Patisserie Tomoko (Williamsburg)": "https://www.google.com/maps/search/?api=1&query=Patisserie%20Tomoko%20Union%20Avenue%20Williamsburg",
      "Gino's Pastry Shop (Belmont, Bronx)": "https://www.google.com/maps/search/?api=1&query=Ginos%20Pastry%20Shop%20Arthur%20Avenue%20Bronx",
      "Lloyd's Carrot Cake (East Harlem)": "https://www.google.com/maps/search/?api=1&query=Lloyds%20Carrot%20Cake%20Lexington%20Avenue%20Harlem",
      "Baked (Red Hook)": "https://www.google.com/maps/search/?api=1&query=Baked%20NYC%20Van%20Brunt%20Red%20Hook%20Brooklyn",
      "Four & Twenty Blackbirds (Gowanus)": "https://www.google.com/maps/search/?api=1&query=Four%20and%20Twenty%20Blackbirds%203rd%20Avenue%20Brooklyn",
      "Petee's Pie Company (Lower East Side)": "https://www.google.com/maps/search/?api=1&query=Petees%20Pie%20Company%20Delancey%20NYC",
      "Win Son Bakery (East Williamsburg)": "https://www.google.com/maps/search/?api=1&query=Win%20Son%20Bakery%20Graham%20Avenue%20Brooklyn",
      "Levain Bakery (Upper West Side)": "https://www.google.com/maps/search/?api=1&query=Levain%20Bakery%20West%2074th%20Street%20NYC",
      "Sugar Sweet Sunshine (Lower East Side)": "https://www.google.com/maps/search/?api=1&query=Sugar%20Sweet%20Sunshine%20Grand%20Street%20NYC",
      "Orwashers Bakery (Upper East Side)": "https://www.google.com/maps/search/?api=1&query=Orwashers%20Bakery%2078th%20Street%20NYC",
      "Agi's Counter (Crown Heights)": "https://www.google.com/maps/search/?api=1&query=Agis%20Counter%20Crown%20Heights%20Brooklyn",
      "The Bakery at Greywind (Hudson Yards)": "https://www.google.com/maps/search/?api=1&query=Bakery%20at%20Greywind%20Hudson%20Yards%20NYC",
      "Birdee (Williamsburg)": "https://www.google.com/maps/search/?api=1&query=Birdee%20Bakery%20Domino%20Williamsburg%20Brooklyn",
      "Cafe Mado (Prospect Heights)": "https://www.google.com/maps/search/?api=1&query=Cafe%20Mado%20Prospect%20Heights%20Brooklyn",
      "Bánh by Lauren (Two Bridges)": "https://www.google.com/maps/search/?api=1&query=Banh%20by%20Lauren%20Market%20Street%20NYC",
      "Café Sabarsky (Upper East Side)": "https://www.google.com/maps/search/?api=1&query=Cafe%20Sabarsky%20Neue%20Galerie%20NYC",
      "K'Far Brooklyn (Williamsburg)": "https://www.google.com/maps/search/?api=1&query=KFar%20Brooklyn%20Hoxton%20Williamsburg",
      "Le Crocodile (Williamsburg)": "https://www.google.com/maps/search/?api=1&query=Le%20Crocodile%20Wythe%20Hotel%20Williamsburg",
      "Lilia Caffé (Williamsburg)": "https://www.google.com/maps/search/?api=1&query=Lilia%20Caffe%20Williamsburg%20Brooklyn",
      "Lysée (Gramercy Park)": "https://www.google.com/maps/search/?api=1&query=Lysee%20Bakery%20Flatiron%20NYC",
      "Mah-Ze-Dahr (West Village)": "https://www.google.com/maps/search/?api=1&query=Mah%20Ze%20Dahr%20Bakery%20West%20Village%20NYC",
      "Pan Pan (Greenpoint)": "https://www.google.com/maps/search/?api=1&query=Pan%20Pan%20Bakery%20Greenpoint%20Brooklyn",
      "Patti Ann's (Prospect Heights)": "https://www.google.com/maps/search/?api=1&query=Patti%20Anns%20Prospect%20Heights%20Brooklyn",
      "Raf's (NoHo)": "https://www.google.com/maps/search/?api=1&query=Rafs%20Bakery%20NoHo%20NYC",
      "Rigor Hill Market (Tribeca)": "https://www.google.com/maps/search/?api=1&query=Rigor%20Hill%20Market%20Tribeca%20NYC",
      "Smør Bakery (East Village)": "https://www.google.com/maps/search/?api=1&query=Smor%20Bakery%20East%20Village%20NYC",
      "Thea (Fort Greene)": "https://www.google.com/maps/search/?api=1&query=Thea%20Bakery%20Fort%20Greene%20Brooklyn"
    }
  },
  {
    "id": "breweries-day-trip-boston",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-28T11:00:00Z",
    "title": "Best Breweries Within a Day Trip of Boston",
    "category": "Boston",
    "type": "food",
    "tags": [
      "food-drink",
      "bars",
      "stores",
      "travel"
    ],
    "linkType": "mapsCity",
    "blurb": "Hazy IPA temples, Czech-style lager rooms, South Shore taprooms with a sea view, and farmhouse campuses worth the drive. The breweries every Boston beer lover should make a pilgrimage to.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Tree House Brewing (Charlton)",
          "Trillium Brewing (Canton)",
          "Night Shift Brewing (Everett)",
          "Lamplighter Brewing (Cambridge)",
          "Jack's Abby Craft Lagers (Framingham)",
          "Notch Brewing (Brighton)",
          "Vitamin Sea Brewing (Weymouth)",
          "Widowmaker Brewing (Braintree)",
          "Mighty Squirrel Brewing (Waltham)",
          "Bent Water Brewing (Lynn)"
        ]
      },
      "bostondotcom": {
        "label": "Boston.com 2025",
        "items": [
          "Tree House Brewing (Charlton)",
          "Trillium Brewing (Canton)",
          "Mighty Squirrel Brewing (Waltham)",
          "Lamplighter Brewing (Cambridge)",
          "Aeronaut Brewing (Somerville)",
          "Bent Water Brewing (Lynn)",
          "Castle Island Brewing (Boston)",
          "Dorchester Brewing (Boston)",
          "Faces Brewing (Malden)",
          "Harpoon Brewery (Boston)",
          "Idle Hands Craft Ales (Malden)",
          "Jack's Abby Craft Lagers (Framingham)",
          "Lord Hobo (Boston)",
          "Long Live Beerworks (Roxbury)",
          "Mayflower Brewing (Plymouth)",
          "Night Shift Brewing (Everett)",
          "Notch Brewing (Brighton)",
          "Remnant Brewing (Somerville)",
          "Sam Adams (Jamaica Plain)",
          "Second Wind Brewing (Plymouth)",
          "Untold Brewing (Scituate)",
          "Vitamin Sea Brewing (Weymouth)",
          "Wachusett Brewing (Westminster)",
          "Widowmaker Brewing (Braintree)",
          "Wormtown Brewery (Worcester)"
        ]
      },
      "hopculture": {
        "label": "Hop Culture Greater Boston",
        "items": [
          "Night Shift Brewing (Everett)",
          "Widowmaker Brewing (Braintree)",
          "Idle Hands Craft Ales (Malden)",
          "Faces Brewing (Malden)",
          "Bent Water Brewing (Lynn)",
          "Tree House Brewing (Charlton)",
          "Trillium Brewing (Canton)",
          "Untold Brewing (Scituate)",
          "Vitamin Sea Brewing (Weymouth)",
          "Notch Brewing (Brighton)",
          "Long Live Beerworks (Roxbury)"
        ],
        "url": "https://www.hopculture.com/best-breweries-greater-boston/"
      },
      "backyardroadtrips": {
        "label": "Backyard Road Trips 2025",
        "items": [
          "Tree House Brewing (Charlton)",
          "Night Shift Brewing (Everett)",
          "Jack's Abby Craft Lagers (Framingham)",
          "Trillium Brewing (Canton)",
          "Widowmaker Brewing (Braintree)",
          "Untold Brewing (Scituate)",
          "Vitamin Sea Brewing (Weymouth)",
          "Mayflower Brewing (Plymouth)",
          "Second Wind Brewing (Plymouth)"
        ],
        "url": "https://backyardroadtrips.com/2025/07/02/best-breweries-near-boston/"
      }
    },
    "vote": {
      "items": [
        "Tree House Brewing (Charlton)",
        "Trillium Brewing (Canton)",
        "Night Shift Brewing (Everett)",
        "Lamplighter Brewing (Cambridge)",
        "Jack's Abby Craft Lagers (Framingham)",
        "Notch Brewing (Brighton)",
        "Vitamin Sea Brewing (Weymouth)",
        "Widowmaker Brewing (Braintree)",
        "Mighty Squirrel Brewing (Waltham)",
        "Untold Brewing (Scituate)"
      ]
    },
    "links": {
      "Tree House Brewing (Charlton)": "https://www.google.com/maps/search/?api=1&query=Tree%20House%20Brewing%20Charlton%20MA",
      "Trillium Brewing (Canton)": "https://www.google.com/maps/search/?api=1&query=Trillium%20Brewing%20Canton%20MA",
      "Night Shift Brewing (Everett)": "https://www.google.com/maps/search/?api=1&query=Night%20Shift%20Brewing%20Everett%20MA",
      "Lamplighter Brewing (Cambridge)": "https://www.google.com/maps/search/?api=1&query=Lamplighter%20Brewing%20Cambridge%20MA",
      "Jack's Abby Craft Lagers (Framingham)": "https://www.google.com/maps/search/?api=1&query=Jacks%20Abby%20Craft%20Lagers%20Framingham%20MA",
      "Notch Brewing (Brighton)": "https://www.google.com/maps/search/?api=1&query=Notch%20Brewing%20Brighton%20MA",
      "Vitamin Sea Brewing (Weymouth)": "https://www.google.com/maps/search/?api=1&query=Vitamin%20Sea%20Brewing%20Weymouth%20MA",
      "Widowmaker Brewing (Braintree)": "https://www.google.com/maps/search/?api=1&query=Widowmaker%20Brewing%20Braintree%20MA",
      "Mighty Squirrel Brewing (Waltham)": "https://www.google.com/maps/search/?api=1&query=Mighty%20Squirrel%20Brewing%20Waltham%20MA",
      "Bent Water Brewing (Lynn)": "https://www.google.com/maps/search/?api=1&query=Bent%20Water%20Brewing%20Lynn%20MA",
      "Aeronaut Brewing (Somerville)": "https://www.google.com/maps/search/?api=1&query=Aeronaut%20Brewing%20Somerville%20MA",
      "Castle Island Brewing (Boston)": "https://www.google.com/maps/search/?api=1&query=Castle%20Island%20Brewing%20Boston%20MA",
      "Dorchester Brewing (Boston)": "https://www.google.com/maps/search/?api=1&query=Dorchester%20Brewing%20Massachusetts%20Avenue%20Boston",
      "Faces Brewing (Malden)": "https://www.google.com/maps/search/?api=1&query=Faces%20Brewing%20Pleasant%20Street%20Malden%20MA",
      "Harpoon Brewery (Boston)": "https://www.google.com/maps/search/?api=1&query=Harpoon%20Brewery%20Northern%20Avenue%20Boston",
      "Idle Hands Craft Ales (Malden)": "https://www.google.com/maps/search/?api=1&query=Idle%20Hands%20Craft%20Ales%20Commercial%20Street%20Malden%20MA",
      "Lord Hobo (Boston)": "https://www.google.com/maps/search/?api=1&query=Lord%20Hobo%20Brewing%20Drydock%20Boston",
      "Long Live Beerworks (Roxbury)": "https://www.google.com/maps/search/?api=1&query=Long%20Live%20Beerworks%20Hampden%20Roxbury%20Boston",
      "Mayflower Brewing (Plymouth)": "https://www.google.com/maps/search/?api=1&query=Mayflower%20Brewing%20Resnik%20Plymouth%20MA",
      "Remnant Brewing (Somerville)": "https://www.google.com/maps/search/?api=1&query=Remnant%20Brewing%20Bow%20Market%20Somerville%20MA",
      "Sam Adams (Jamaica Plain)": "https://www.google.com/maps/search/?api=1&query=Samuel%20Adams%20Brewery%20Germania%20Jamaica%20Plain%20Boston",
      "Second Wind Brewing (Plymouth)": "https://www.google.com/maps/search/?api=1&query=Second%20Wind%20Brewing%20Howland%20Plymouth%20MA",
      "Untold Brewing (Scituate)": "https://www.google.com/maps/search/?api=1&query=Untold%20Brewing%20Old%20Country%20Way%20Scituate%20MA",
      "Wachusett Brewing (Westminster)": "https://www.google.com/maps/search/?api=1&query=Wachusett%20Brewing%20State%20Road%20Westminster%20MA",
      "Wormtown Brewery (Worcester)": "https://www.google.com/maps/search/?api=1&query=Wormtown%20Brewery%20Shrewsbury%20Worcester%20MA"
    }
  },
  {
    "id": "travel-strollers-single",
    "publishedDate": "2026-05-28",
    "title": "Best Travel Strollers (Single)",
    "category": "Strollers",
    "type": "product",
    "tags": [
      "product",
      "travel"
    ],
    "linkType": "amazon",
    "blurb": "Carry-on folds, one-handed collapses, and frames built for jet bridges and cobblestones. The strollers that actually make a flight with a baby feel possible.",
    "defaultSource": "ai",
    "links": {
      "Joolz Aer 2": "https://www.amazon.com/s?k=Joolz+Aer+2&tag=cgurus-20",
      "UPPAbaby Minu V3": "https://www.amazon.com/s?k=UPPAbaby+Minu+V3&tag=cgurus-20",
      "Stokke YOYO3": "https://www.amazon.com/s?k=Stokke+YOYO3&tag=cgurus-20",
      "Bugaboo Butterfly 2": "https://www.amazon.com/s?k=Bugaboo+Butterfly+2&tag=cgurus-20",
      "Nuna TRVL": "https://www.amazon.com/s?k=Nuna+TRVL&tag=cgurus-20",
      "gb Pockit+ All City": "https://www.amazon.com/s?k=gb+Pockit%2B+All+City&tag=cgurus-20",
      "Zoe Traveler": "https://www.amazon.com/s?k=Zoe+Traveler&tag=cgurus-20",
      "Baby Jogger City Tour 2": "https://www.amazon.com/s?k=Baby+Jogger+City+Tour+2&tag=cgurus-20",
      "Bombi Bebee V3": "https://www.amazon.com/s?k=Bombi+Bebee+V3&tag=cgurus-20",
      "Inglesina Quid": "https://www.amazon.com/s?k=Inglesina+Quid&tag=cgurus-20",
      "Colugo Compact+": "https://www.amazon.com/s?k=Colugo+Compact%2B&tag=cgurus-20",
      "MamaZing Ultra Air X": "https://www.amazon.com/s?k=MamaZing+Ultra+Air+X&tag=cgurus-20",
      "UPPAbaby G-Luxe": "https://www.amazon.com/s?k=UPPAbaby+G-Luxe&tag=cgurus-20",
      "Kolcraft Cloud Plus": "https://www.amazon.com/s?k=Kolcraft+Cloud+Plus&tag=cgurus-20",
      "Summer Infant 3D Lite": "https://www.amazon.com/s?k=Summer+Infant+3D+Lite&tag=cgurus-20",
      "Ingenuity 3Dlite Convenience Stroller": "https://www.amazon.com/s?k=Ingenuity+3Dlite+Convenience+Stroller&tag=cgurus-20"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Joolz Aer 2",
          "UPPAbaby Minu V3",
          "Stokke YOYO3",
          "Bugaboo Butterfly 2",
          "Nuna TRVL",
          "gb Pockit+ All City",
          "Zoe Traveler",
          "Baby Jogger City Tour 2",
          "Bombi Bebee V3",
          "Colugo Compact+"
        ]
      },
      "babylist": {
        "label": "Babylist Best Travel Strollers 2026",
        "items": [
          "Joolz Aer 2",
          "Bugaboo Butterfly 2",
          "UPPAbaby Minu V3",
          "Bombi Bebee V3",
          "Ingenuity 3Dlite Convenience Stroller",
          "Nuna TRVL"
        ],
        "url": "https://www.babylist.com/hello-baby/best-travel-strollers"
      },
      "babygearlab": {
        "label": "BabyGearLab Best Travel Strollers 2025",
        "items": [
          "Joolz Aer 2",
          "UPPAbaby Minu V3",
          "Stokke YOYO3",
          "Nuna TRVL",
          "gb Pockit+ All City",
          "Zoe Traveler",
          "Baby Jogger City Tour 2",
          "Inglesina Quid",
          "UPPAbaby G-Luxe",
          "Kolcraft Cloud Plus",
          "Summer Infant 3D Lite"
        ],
        "url": "https://www.babygearlab.com/topics/getting-around/best-travel-stroller"
      },
      "fathercraft": {
        "label": "Fathercraft Best Travel Strollers 2026",
        "items": [
          "Joolz Aer 2",
          "UPPAbaby Minu V3",
          "MamaZing Ultra Air X",
          "Colugo Compact+"
        ],
        "url": "https://fathercraft.com/best-travel-strollers/"
      }
    },
    "vote": {
      "items": [
        "Joolz Aer 2",
        "UPPAbaby Minu V3",
        "Stokke YOYO3",
        "Bugaboo Butterfly 2",
        "Nuna TRVL",
        "gb Pockit+ All City",
        "Zoe Traveler",
        "Bombi Bebee V3",
        "Colugo Compact+",
        "Baby Jogger City Tour 2"
      ]
    }
  },
  {
    "id": "travel-strollers-double",
    "publishedDate": "2026-05-28",
    "title": "Best Travel Strollers (Double)",
    "category": "Strollers",
    "type": "product",
    "tags": [
      "product",
      "travel"
    ],
    "linkType": "amazon",
    "blurb": "Two seats, one parent, a tight fold, and a frame that still clears a hotel doorway. The double strollers worth flying with: twins, two under two, or a baby and a runner.",
    "defaultSource": "ai",
    "links": {
      "Mountain Buggy Nano Duo": "https://www.amazon.com/s?k=Mountain+Buggy+Nano+Duo&tag=cgurus-20",
      "Zoe Twin+": "https://www.amazon.com/s?k=Zoe+Twin%2B&tag=cgurus-20",
      "UPPAbaby G-Link V2": "https://www.amazon.com/s?k=UPPAbaby+G-Link+V2&tag=cgurus-20",
      "Summer Infant 3DPac CS+ Double": "https://www.amazon.com/s?k=Summer+Infant+3DPac+CS%2B+Double&tag=cgurus-20",
      "Joovy Kooper X2": "https://www.amazon.com/s?k=Joovy+Kooper+X2&tag=cgurus-20",
      "Delta Children LX Side-by-Side": "https://www.amazon.com/s?k=Delta+Children+LX+Side-by-Side&tag=cgurus-20",
      "Kolcraft Cloud Plus Double": "https://www.amazon.com/s?k=Kolcraft+Cloud+Plus+Double&tag=cgurus-20",
      "Baby Jogger City Tour 2 Double": "https://www.amazon.com/s?k=Baby+Jogger+City+Tour+2+Double&tag=cgurus-20",
      "Joovy Caboose Too Ultralight Sit-and-Stand": "https://www.amazon.com/s?k=Joovy+Caboose+Too+Ultralight+Sit-and-Stand&tag=cgurus-20",
      "Joovy Caboose Ultralight": "https://www.amazon.com/s?k=Joovy+Caboose+Ultralight&tag=cgurus-20",
      "Mompush Lithe Double": "https://www.amazon.com/s?k=Mompush+Lithe+Double&tag=cgurus-20",
      "Graco Ready2Grow LX 2.0": "https://www.amazon.com/s?k=Graco+Ready2Grow+LX+2.0&tag=cgurus-20",
      "Valco Baby Slim Twin": "https://www.amazon.com/s?k=Valco+Baby+Slim+Twin&tag=cgurus-20",
      "Valco Baby Snap Duo Trend": "https://www.amazon.com/s?k=Valco+Baby+Snap+Duo+Trend&tag=cgurus-20"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Mountain Buggy Nano Duo",
          "Zoe Twin+",
          "UPPAbaby G-Link V2",
          "Summer Infant 3DPac CS+ Double",
          "Joovy Kooper X2",
          "Delta Children LX Side-by-Side",
          "Kolcraft Cloud Plus Double",
          "Baby Jogger City Tour 2 Double",
          "Joovy Caboose Too Ultralight Sit-and-Stand",
          "Mompush Lithe Double"
        ]
      },
      "babygearlab": {
        "label": "BabyGearLab Best Double Travel Strollers 2024",
        "items": [
          "Zoe Twin+",
          "Mountain Buggy Nano Duo",
          "UPPAbaby G-Link V2",
          "Delta Children LX Side-by-Side",
          "Joovy Caboose Ultralight"
        ],
        "url": "https://www.babygearlab.com/topics/getting-around/best-double-travel-stroller"
      },
      "babycantravel": {
        "label": "Baby Can Travel Top 10 Double Travel Strollers 2026",
        "items": [
          "Summer Infant 3DPac CS+ Double",
          "Zoe Twin+",
          "Joovy Kooper X2",
          "Joovy Caboose Too Ultralight Sit-and-Stand",
          "Mountain Buggy Nano Duo",
          "Mompush Lithe Double",
          "Graco Ready2Grow LX 2.0",
          "Kolcraft Cloud Plus Double",
          "Delta Children LX Side-by-Side",
          "UPPAbaby G-Link V2"
        ],
        "url": "https://www.babycantravel.com/best-double-travel-strollers/"
      },
      "lucieslist": {
        "label": "Lucie's List Best Double Travel Strollers 2024",
        "items": [
          "Delta Children LX Side-by-Side",
          "UPPAbaby G-Link V2",
          "Summer Infant 3DPac CS+ Double",
          "Joovy Kooper X2",
          "Mountain Buggy Nano Duo",
          "Kolcraft Cloud Plus Double",
          "Zoe Twin+",
          "Baby Jogger City Tour 2 Double",
          "Valco Baby Slim Twin",
          "Valco Baby Snap Duo Trend"
        ],
        "url": "https://www.lucieslist.com/guides/best-double-stroller/best-double-strollers-travel/"
      }
    },
    "vote": {
      "items": [
        "Mountain Buggy Nano Duo",
        "Zoe Twin+",
        "UPPAbaby G-Link V2",
        "Summer Infant 3DPac CS+ Double",
        "Joovy Kooper X2",
        "Delta Children LX Side-by-Side",
        "Kolcraft Cloud Plus Double",
        "Baby Jogger City Tour 2 Double",
        "Joovy Caboose Too Ultralight Sit-and-Stand",
        "Mompush Lithe Double"
      ]
    }
  },
  {
    "id": "kids-board-games-skill",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-28T16:05:09Z",
    "title": "Best Board Games for Kids with a Skill Element",
    "category": "Kids Games",
    "type": "product",
    "tags": [
      "product",
      "entertainment"
    ],
    "linkType": "amazon",
    "blurb": "Strategy, memory, deduction, early math, and pattern recognition packed into 15-minute sessions that hold a four-year-old's attention. The preschool games that actually teach something while still feeling like a game.",
    "defaultSource": "ai",
    "links": {
      "Outfoxed!": "https://www.amazon.com/s?k=Outfoxed+board+game&tag=cgurus-20",
      "Hoot Owl Hoot!": "https://www.amazon.com/s?k=Hoot+Owl+Hoot&tag=cgurus-20",
      "Hi Ho! Cherry-O": "https://www.amazon.com/s?k=Hi+Ho+Cherry-O&tag=cgurus-20",
      "Zingo!": "https://www.amazon.com/s?k=Zingo+game&tag=cgurus-20",
      "Richard Scarry's Busytown: Eye Found It!": "https://www.amazon.com/s?k=Richard+Scarry+Busytown+Eye+Found+It&tag=cgurus-20",
      "The Sneaky, Snacky Squirrel Game": "https://www.amazon.com/s?k=Sneaky+Snacky+Squirrel+Game&tag=cgurus-20",
      "Sequence for Kids": "https://www.amazon.com/s?k=Sequence+for+Kids&tag=cgurus-20",
      "Memory": "https://www.amazon.com/s?k=Hasbro+Memory+matching+game&tag=cgurus-20",
      "My First Carcassonne": "https://www.amazon.com/s?k=My+First+Carcassonne&tag=cgurus-20",
      "Spot It! Jr. Animals": "https://www.amazon.com/s?k=Spot+It+Jr+Animals&tag=cgurus-20",
      "Sum Swamp": "https://www.amazon.com/s?k=Sum+Swamp&tag=cgurus-20",
      "Robot Turtles": "https://www.amazon.com/s?k=Robot+Turtles&tag=cgurus-20",
      "Rush Hour Jr.": "https://www.amazon.com/s?k=Rush+Hour+Jr&tag=cgurus-20",
      "Sequence Letters": "https://www.amazon.com/s?k=Sequence+Letters&tag=cgurus-20",
      "Count Your Chickens!": "https://www.amazon.com/s?k=Count+Your+Chickens&tag=cgurus-20",
      "Peaceable Kingdom Dinosaur Escape": "https://www.amazon.com/s?k=Peaceable+Kingdom+Dinosaur+Escape&tag=cgurus-20",
      "Connect 4": "https://www.amazon.com/s?k=Connect+4&tag=cgurus-20",
      "Guess Who?": "https://www.amazon.com/s?k=Guess+Who+board+game&tag=cgurus-20",
      "Sleeping Queens": "https://www.amazon.com/s?k=Sleeping+Queens+card+game&tag=cgurus-20",
      "Pete the Cat: The Missing Cupcakes Game": "https://www.amazon.com/s?k=Pete+the+Cat+Missing+Cupcakes+Game&tag=cgurus-20",
      "Frankie's Food Truck Fiasco": "https://www.amazon.com/s?k=Frankie+Food+Truck+Fiasco&tag=cgurus-20",
      "Trouble": "https://www.amazon.com/s?k=Trouble+board+game&tag=cgurus-20",
      "First Orchard": "https://www.amazon.com/s?k=HABA+First+Orchard&tag=cgurus-20",
      "Race to the Treasure!": "https://www.amazon.com/s?k=Race+to+the+Treasure+game&tag=cgurus-20"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Outfoxed!",
          "Hoot Owl Hoot!",
          "Hi Ho! Cherry-O",
          "Zingo!",
          "Richard Scarry's Busytown: Eye Found It!",
          "The Sneaky, Snacky Squirrel Game",
          "Sequence for Kids",
          "Memory",
          "My First Carcassonne",
          "Spot It! Jr. Animals"
        ]
      },
      "weareteachers": {
        "label": "We Are Teachers 50 Best Board Games for Preschoolers 2024",
        "items": [
          "Memory",
          "Zingo!",
          "Hoot Owl Hoot!",
          "Richard Scarry's Busytown: Eye Found It!",
          "Guess Who?",
          "Connect 4",
          "Frankie's Food Truck Fiasco",
          "Pete the Cat: The Missing Cupcakes Game",
          "Hi Ho! Cherry-O",
          "Count Your Chickens!",
          "Race to the Treasure!",
          "Outfoxed!"
        ],
        "url": "https://www.weareteachers.com/best-board-games-for-preschoolers/"
      },
      "momlovesbest": {
        "label": "Mom Loves Best 25 Best Board Games for Preschoolers 2026",
        "items": [
          "The Sneaky, Snacky Squirrel Game",
          "Zingo!",
          "Richard Scarry's Busytown: Eye Found It!",
          "Hoot Owl Hoot!",
          "Sequence for Kids",
          "Hi Ho! Cherry-O",
          "Outfoxed!",
          "My First Carcassonne",
          "Peaceable Kingdom Dinosaur Escape",
          "Pete the Cat: The Missing Cupcakes Game",
          "Frankie's Food Truck Fiasco",
          "Robot Turtles"
        ],
        "url": "https://momlovesbest.com/preschool-board-games"
      },
      "treehouseschoolhouse": {
        "label": "Treehouse Schoolhouse 25 Best Preschool Games 2026",
        "items": [
          "The Sneaky, Snacky Squirrel Game",
          "Sequence Letters",
          "Outfoxed!",
          "Sleeping Queens",
          "Sum Swamp",
          "Spot It! Jr. Animals",
          "Hoot Owl Hoot!",
          "Hi Ho! Cherry-O",
          "Richard Scarry's Busytown: Eye Found It!",
          "Connect 4",
          "Count Your Chickens!"
        ],
        "url": "https://treehouseschoolhouse.com/blog/best-preschool-board-card-games-for-kids-children"
      },
      "splashlearn": {
        "label": "SplashLearn 20 Best Board Games for Preschoolers 2024",
        "items": [
          "Hoot Owl Hoot!",
          "First Orchard",
          "The Sneaky, Snacky Squirrel Game",
          "Richard Scarry's Busytown: Eye Found It!",
          "Spot It! Jr. Animals",
          "Peaceable Kingdom Dinosaur Escape",
          "My First Carcassonne",
          "Zingo!",
          "Outfoxed!",
          "Guess Who?",
          "Hi Ho! Cherry-O",
          "Memory"
        ],
        "url": "https://www.splashlearn.com/blog/board-games-for-preschoolers/"
      },
      "dayswithgrey": {
        "label": "Days With Grey Best Board Games for Kids 2026",
        "items": [
          "Rush Hour Jr.",
          "Outfoxed!",
          "Memory",
          "Sequence for Kids",
          "Zingo!"
        ],
        "url": "https://dayswithgrey.com/board-games-for-kids/"
      },
      "empoweredparents": {
        "label": "Empowered Parents 10 Best Board Games for Preschoolers 2025",
        "items": [
          "Sequence for Kids",
          "Outfoxed!",
          "Hoot Owl Hoot!",
          "Hi Ho! Cherry-O",
          "Trouble"
        ],
        "url": "https://empoweredparents.co/board-games-for-preschoolers/"
      }
    },
    "vote": {
      "items": [
        "Outfoxed!",
        "Hoot Owl Hoot!",
        "Hi Ho! Cherry-O",
        "Zingo!",
        "Richard Scarry's Busytown: Eye Found It!",
        "The Sneaky, Snacky Squirrel Game",
        "Sequence for Kids",
        "Memory",
        "My First Carcassonne",
        "Spot It! Jr. Animals"
      ]
    }
  },
  {
    "id": "beach-clubs-croatia",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-28T16:47:58Z",
    "title": "Best Beach Clubs in Croatia",
    "category": "Croatia",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "food-drink",
      "bars",
      "nightlife",
      "stores",
      "entertainment"
    ],
    "linkType": "mapsCity",
    "blurb": "Pine-shaded coves on the Pakleni Islands, white-stone bathing platforms outside Hvar town, and clifftop terraces above the Adriatic. Croatia’s beach club scene runs from full-moon parties to long champagne lunches.",
    "defaultSource": "ai",
    "links": {
      "Carpe Diem Beach (Pakleni Islands, Hvar)": "https://www.google.com/maps/search/?api=1&query=Carpe%20Diem%20Beach%20Pakleni%20Islands%20Hvar",
      "Hula Hula (Hvar)": "https://www.google.com/maps/search/?api=1&query=Hula%20Hula%20Hvar",
      "Bonj Les Bains (Hvar)": "https://www.google.com/maps/search/?api=1&query=Bonj%20Les%20Bains%20Hvar",
      "Banje Beach Club (Dubrovnik)": "https://www.google.com/maps/search/?api=1&query=Banje%20Beach%20Club%20Dubrovnik",
      "Mulini Beach Bar (Rovinj)": "https://www.google.com/maps/search/?api=1&query=Mulini%20Beach%20Bar%20Rovinj",
      "Falko Beach Bar (Hvar)": "https://www.google.com/maps/search/?api=1&query=Falko%20Beach%20Bar%20Hvar",
      "Laganini Lounge Bar (Pakleni Islands)": "https://www.google.com/maps/search/?api=1&query=Laganini%20Lounge%20Bar%20Pakleni%20Islands",
      "Coral Beach Club (Dubrovnik)": "https://www.google.com/maps/search/?api=1&query=Coral%20Beach%20Club%20Dubrovnik",
      "Cave Bar More (Dubrovnik)": "https://www.google.com/maps/search/?api=1&query=Cave%20Bar%20More%20Dubrovnik",
      "Zlatni Rat Beach Bar (Bol, Brac)": "https://www.google.com/maps/search/?api=1&query=Zlatni%20Rat%20Beach%20Bar%20Bol%20Brac",
      "Auro Beach Bar (Sibenik)": "https://www.google.com/maps/search/?api=1&query=Auro%20Beach%20Bar%20Sibenik",
      "Lone Beach Club (Rovinj)": "https://www.google.com/maps/search/?api=1&query=Lone%20Beach%20Club%20Rovinj"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Carpe Diem Beach (Pakleni Islands, Hvar)",
          "Hula Hula (Hvar)",
          "Bonj Les Bains (Hvar)",
          "Banje Beach Club (Dubrovnik)",
          "Mulini Beach Bar (Rovinj)",
          "Falko Beach Bar (Hvar)",
          "Laganini Lounge Bar (Pakleni Islands)",
          "Coral Beach Club (Dubrovnik)",
          "Cave Bar More (Dubrovnik)",
          "Zlatni Rat Beach Bar (Bol, Brac)"
        ]
      },
      "bespoke": {
        "label": "Bespoke Yacht Charter Croatia 2024",
        "items": [
          "Carpe Diem Beach (Pakleni Islands, Hvar)",
          "Hula Hula (Hvar)",
          "Bonj Les Bains (Hvar)",
          "Banje Beach Club (Dubrovnik)",
          "Falko Beach Bar (Hvar)",
          "Coral Beach Club (Dubrovnik)",
          "Laganini Lounge Bar (Pakleni Islands)",
          "Auro Beach Bar (Sibenik)"
        ],
        "url": "https://bespokeyachtcharter.com/best-beach-clubs-in-croatia/"
      },
      "greenvoyage": {
        "label": "The Green Voyage Croatia 2024",
        "items": [
          "Carpe Diem Beach (Pakleni Islands, Hvar)",
          "Hula Hula (Hvar)",
          "Bonj Les Bains (Hvar)",
          "Banje Beach Club (Dubrovnik)",
          "Mulini Beach Bar (Rovinj)",
          "Falko Beach Bar (Hvar)",
          "Coral Beach Club (Dubrovnik)",
          "Cave Bar More (Dubrovnik)",
          "Lone Beach Club (Rovinj)",
          "Laganini Lounge Bar (Pakleni Islands)",
          "Zlatni Rat Beach Bar (Bol, Brac)"
        ],
        "url": "https://thegreenvoyage.com/beach-clubs-croatia/"
      },
      "yachtin": {
        "label": "Yacht-In Croatia 2024",
        "items": [
          "Carpe Diem Beach (Pakleni Islands, Hvar)",
          "Banje Beach Club (Dubrovnik)",
          "Hula Hula (Hvar)",
          "Mulini Beach Bar (Rovinj)",
          "Bonj Les Bains (Hvar)",
          "Coral Beach Club (Dubrovnik)",
          "Laganini Lounge Bar (Pakleni Islands)",
          "Falko Beach Bar (Hvar)",
          "Auro Beach Bar (Sibenik)",
          "Cave Bar More (Dubrovnik)"
        ],
        "url": "https://www.yacht-in.com/article/10-best-beach-clubs-in-croatia/73"
      },
      "travelmemo": {
        "label": "Travel Memo Croatia Beach Clubs Guide 2024",
        "items": [
          "Carpe Diem Beach (Pakleni Islands, Hvar)",
          "Mulini Beach Bar (Rovinj)",
          "Bonj Les Bains (Hvar)",
          "Hula Hula (Hvar)",
          "Banje Beach Club (Dubrovnik)",
          "Lone Beach Club (Rovinj)",
          "Falko Beach Bar (Hvar)",
          "Laganini Lounge Bar (Pakleni Islands)",
          "Coral Beach Club (Dubrovnik)"
        ],
        "url": "https://travelmemo.com/croatia/croatia-beach-clubs-guide"
      }
    },
    "vote": {
      "items": [
        "Carpe Diem Beach (Pakleni Islands, Hvar)",
        "Hula Hula (Hvar)",
        "Bonj Les Bains (Hvar)",
        "Banje Beach Club (Dubrovnik)",
        "Mulini Beach Bar (Rovinj)",
        "Falko Beach Bar (Hvar)",
        "Laganini Lounge Bar (Pakleni Islands)",
        "Coral Beach Club (Dubrovnik)",
        "Cave Bar More (Dubrovnik)",
        "Lone Beach Club (Rovinj)"
      ]
    }
  },
  {
    "id": "beach-clubs-italy",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-28T16:47:58Z",
    "title": "Best Beach Clubs in Italy",
    "category": "Italy",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "food-drink",
      "bars",
      "nightlife",
      "stores",
      "entertainment"
    ],
    "linkType": "mapsCity",
    "blurb": "Stabilimenti from Versilia to the Costa Smeralda. Striped umbrellas, vongole at the water’s edge, sunset aperitivo on granite rocks. The Italian beach club is a daylong ritual, and these are the ones that do it best.",
    "defaultSource": "ai",
    "links": {
      "Alpemare (Forte dei Marmi)": "https://www.google.com/maps/search/?api=1&query=Alpemare%20Forte%20dei%20Marmi",
      "Twiga Beach Club (Marina di Pietrasanta)": "https://www.google.com/maps/search/?api=1&query=Twiga%20Beach%20Club%20Marina%20di%20Pietrasanta",
      "La Fontelina (Capri)": "https://www.google.com/maps/search/?api=1&query=La%20Fontelina%20Capri",
      "Il Riccio Beach Club by Dior (Anacapri)": "https://www.google.com/maps/search/?api=1&query=Il%20Riccio%20Beach%20Club%20by%20Dior%20Anacapri",
      "Phi Beach (Porto Cervo, Sardinia)": "https://www.google.com/maps/search/?api=1&query=Phi%20Beach%20Porto%20Cervo%20Sardinia",
      "Nikki Beach Costa Smeralda (Sardinia)": "https://www.google.com/maps/search/?api=1&query=Nikki%20Beach%20Costa%20Smeralda%20Sardinia",
      "Arienzo Beach Club (Positano)": "https://www.google.com/maps/search/?api=1&query=Arienzo%20Beach%20Club%20Positano",
      "La Scogliera (Positano)": "https://www.google.com/maps/search/?api=1&query=La%20Scogliera%20Positano",
      "Bagni Fiore by Langosteria (Paraggi, Liguria)": "https://www.google.com/maps/search/?api=1&query=Bagni%20Fiore%20by%20Langosteria%20Paraggi%20Liguria",
      "Bagno Piero (Forte dei Marmi)": "https://www.google.com/maps/search/?api=1&query=Bagno%20Piero%20Forte%20dei%20Marmi",
      "One Fire Beach (Praiano)": "https://www.google.com/maps/search/?api=1&query=One%20Fire%20Beach%20Praiano",
      "Da Adolfo (Positano)": "https://www.google.com/maps/search/?api=1&query=Da%20Adolfo%20Positano",
      "Tao Beach (Taormina, Sicily)": "https://www.google.com/maps/search/?api=1&query=Tao%20Beach%20Taormina%20Sicily",
      "Il Gabbiano (Stintino, Sardinia)": "https://www.google.com/maps/search/?api=1&query=Il%20Gabbiano%20Stintino%20Sardinia"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Alpemare (Forte dei Marmi)",
          "Twiga Beach Club (Marina di Pietrasanta)",
          "La Fontelina (Capri)",
          "Il Riccio Beach Club by Dior (Anacapri)",
          "Phi Beach (Porto Cervo, Sardinia)",
          "Nikki Beach Costa Smeralda (Sardinia)",
          "Arienzo Beach Club (Positano)",
          "La Scogliera (Positano)",
          "Bagni Fiore by Langosteria (Paraggi, Liguria)",
          "Bagno Piero (Forte dei Marmi)"
        ]
      },
      "saltandwind": {
        "label": "Salt and Wind 14 Best Beach Clubs in Italy 2025",
        "items": [
          "La Fontelina (Capri)",
          "Il Riccio Beach Club by Dior (Anacapri)",
          "Twiga Beach Club (Marina di Pietrasanta)",
          "Phi Beach (Porto Cervo, Sardinia)",
          "Nikki Beach Costa Smeralda (Sardinia)",
          "Arienzo Beach Club (Positano)",
          "La Scogliera (Positano)",
          "One Fire Beach (Praiano)",
          "Alpemare (Forte dei Marmi)",
          "Bagni Fiore by Langosteria (Paraggi, Liguria)",
          "Da Adolfo (Positano)",
          "Tao Beach (Taormina, Sicily)"
        ],
        "url": "https://saltandwind.com/best-beach-clubs-in-italy/"
      },
      "homeinitaly": {
        "label": "Home In Italy Magazine 2024",
        "items": [
          "Twiga Beach Club (Marina di Pietrasanta)",
          "Nikki Beach Costa Smeralda (Sardinia)",
          "Phi Beach (Porto Cervo, Sardinia)",
          "Il Riccio Beach Club by Dior (Anacapri)",
          "Arienzo Beach Club (Positano)",
          "Il Gabbiano (Stintino, Sardinia)",
          "Bagni Fiore by Langosteria (Paraggi, Liguria)"
        ],
        "url": "https://www.homeinitaly.com/magazine/post.php?post_id=374"
      },
      "sorrentovibes": {
        "label": "Sorrento Vibes Most Luxurious Beach Clubs 2024",
        "items": [
          "Il Riccio Beach Club by Dior (Anacapri)",
          "La Fontelina (Capri)",
          "Arienzo Beach Club (Positano)",
          "One Fire Beach (Praiano)",
          "La Scogliera (Positano)"
        ],
        "url": "https://sorrentovibes.com/luxurious-beach-clubs-sorrento-capri-amalfi-coast/"
      },
      "amaselections": {
        "label": "AmaSelections Amalfi Coast Beach Clubs 2024",
        "items": [
          "La Fontelina (Capri)",
          "Arienzo Beach Club (Positano)",
          "La Scogliera (Positano)",
          "One Fire Beach (Praiano)",
          "Il Riccio Beach Club by Dior (Anacapri)",
          "Da Adolfo (Positano)"
        ],
        "url": "https://amaselections.com/magazine/amalfi-coast-best-beach-clubs-italy-guide"
      },
      "fillyourhome": {
        "label": "Fill Your Home With Love Italy Beach Clubs 2024",
        "items": [
          "Alpemare (Forte dei Marmi)",
          "Bagno Piero (Forte dei Marmi)",
          "Twiga Beach Club (Marina di Pietrasanta)",
          "Phi Beach (Porto Cervo, Sardinia)",
          "Nikki Beach Costa Smeralda (Sardinia)",
          "Il Gabbiano (Stintino, Sardinia)",
          "Bagni Fiore by Langosteria (Paraggi, Liguria)",
          "Tao Beach (Taormina, Sicily)"
        ],
        "url": "https://fillyourhomewithlove.com/en/guide-to-the-best-Italian-beach-clubs/"
      }
    },
    "vote": {
      "items": [
        "La Fontelina (Capri)",
        "Alpemare (Forte dei Marmi)",
        "Twiga Beach Club (Marina di Pietrasanta)",
        "Il Riccio Beach Club by Dior (Anacapri)",
        "Phi Beach (Porto Cervo, Sardinia)",
        "Nikki Beach Costa Smeralda (Sardinia)",
        "Arienzo Beach Club (Positano)",
        "La Scogliera (Positano)",
        "Bagni Fiore by Langosteria (Paraggi, Liguria)",
        "One Fire Beach (Praiano)"
      ]
    }
  },
  {
    "id": "beach-clubs-france",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-28T16:47:58Z",
    "title": "Best Beach Clubs in France",
    "category": "France",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "food-drink",
      "bars",
      "nightlife",
      "stores",
      "entertainment"
    ],
    "linkType": "mapsCity",
    "blurb": "Pampelonne in full bloom. Rosé on ice, rattan loungers in formation, and tenders pulling up at the shoreline. From Club 55’s sixty-year stronghold to the Riviera’s quieter coves, this is the French beach club at its sharpest.",
    "defaultSource": "ai",
    "links": {
      "Club 55 (Ramatuelle)": "https://www.google.com/maps/search/?api=1&query=Club%2055%20Ramatuelle",
      "Nikki Beach Saint-Tropez (Ramatuelle)": "https://www.google.com/maps/search/?api=1&query=Nikki%20Beach%20Saint-Tropez%20Ramatuelle",
      "La Reserve a la Plage (Ramatuelle)": "https://www.google.com/maps/search/?api=1&query=La%20Reserve%20a%20la%20Plage%20Ramatuelle",
      "Verde Beach (Ramatuelle)": "https://www.google.com/maps/search/?api=1&query=Verde%20Beach%20Ramatuelle",
      "Moorea Plage (Ramatuelle)": "https://www.google.com/maps/search/?api=1&query=Moorea%20Plage%20Ramatuelle",
      "Paloma Beach (Saint-Jean-Cap-Ferrat)": "https://www.google.com/maps/search/?api=1&query=Paloma%20Beach%20Saint-Jean-Cap-Ferrat",
      "Bagatelle Beach (Ramatuelle)": "https://www.google.com/maps/search/?api=1&query=Bagatelle%20Beach%20Ramatuelle",
      "Z Plage (Cannes)": "https://www.google.com/maps/search/?api=1&query=Z%20Plage%20Cannes",
      "Plage Keller (Cap d Antibes)": "https://www.google.com/maps/search/?api=1&query=Plage%20Keller%20Cap%20d%20Antibes",
      "Tahiti Beach (Ramatuelle)": "https://www.google.com/maps/search/?api=1&query=Tahiti%20Beach%20Ramatuelle",
      "Casa Amor by Dolce and Gabbana (Ramatuelle)": "https://www.google.com/maps/search/?api=1&query=Casa%20Amor%20by%20Dolce%20and%20Gabbana%20Ramatuelle",
      "La Serena (Ramatuelle)": "https://www.google.com/maps/search/?api=1&query=La%20Serena%20Ramatuelle",
      "Gigi Beach Club (Saint-Tropez)": "https://www.google.com/maps/search/?api=1&query=Gigi%20Beach%20Club%20Saint-Tropez"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Club 55 (Ramatuelle)",
          "Nikki Beach Saint-Tropez (Ramatuelle)",
          "La Reserve a la Plage (Ramatuelle)",
          "Verde Beach (Ramatuelle)",
          "Moorea Plage (Ramatuelle)",
          "Paloma Beach (Saint-Jean-Cap-Ferrat)",
          "Bagatelle Beach (Ramatuelle)",
          "Z Plage (Cannes)",
          "Plage Keller (Cap d Antibes)",
          "Tahiti Beach (Ramatuelle)"
        ]
      },
      "yachtcharterfleet": {
        "label": "Yacht Charter Fleet Best St Tropez Beach Clubs 2024",
        "items": [
          "Club 55 (Ramatuelle)",
          "Verde Beach (Ramatuelle)",
          "La Reserve a la Plage (Ramatuelle)",
          "Nikki Beach Saint-Tropez (Ramatuelle)",
          "Moorea Plage (Ramatuelle)",
          "Casa Amor by Dolce and Gabbana (Ramatuelle)",
          "Bagatelle Beach (Ramatuelle)",
          "La Serena (Ramatuelle)",
          "Tahiti Beach (Ramatuelle)"
        ],
        "url": "https://www.yachtcharterfleet.com/destination/article/the-best-st-tropez-beach-clubs-2026-15635.htm"
      },
      "robbreportmonaco": {
        "label": "Robb Report Monaco Best Beach Clubs Cote d Azur 2024",
        "items": [
          "Club 55 (Ramatuelle)",
          "Paloma Beach (Saint-Jean-Cap-Ferrat)",
          "La Reserve a la Plage (Ramatuelle)",
          "Nikki Beach Saint-Tropez (Ramatuelle)",
          "Plage Keller (Cap d Antibes)"
        ],
        "url": "https://robbreportmonaco.com/lifestyle/5-of-the-best-beach-clubs-in-the-cote-dazur/"
      },
      "superyachtcontent": {
        "label": "Superyacht Content 10 Must-Visit Cote d Azur Beach Clubs 2024",
        "items": [
          "Club 55 (Ramatuelle)",
          "Nikki Beach Saint-Tropez (Ramatuelle)",
          "Plage Keller (Cap d Antibes)",
          "Paloma Beach (Saint-Jean-Cap-Ferrat)",
          "La Reserve a la Plage (Ramatuelle)",
          "Z Plage (Cannes)",
          "Verde Beach (Ramatuelle)",
          "Bagatelle Beach (Ramatuelle)",
          "Moorea Plage (Ramatuelle)",
          "Gigi Beach Club (Saint-Tropez)"
        ],
        "url": "https://www.superyachtcontent.com/the-crew-mess/the-10-must-visit-beach-clubs-along-the-cote-dazur/"
      },
      "indagare": {
        "label": "Indagare St Tropez Top Beach Clubs 2024",
        "items": [
          "Club 55 (Ramatuelle)",
          "La Reserve a la Plage (Ramatuelle)",
          "Verde Beach (Ramatuelle)",
          "Moorea Plage (Ramatuelle)",
          "Nikki Beach Saint-Tropez (Ramatuelle)",
          "Gigi Beach Club (Saint-Tropez)",
          "Casa Amor by Dolce and Gabbana (Ramatuelle)"
        ],
        "url": "https://indagare.com/article/st-tropezs-top-beach-clubs"
      },
      "villasud": {
        "label": "VillaSud Best Beach Clubs Cote d Azur 2024",
        "items": [
          "Club 55 (Ramatuelle)",
          "Paloma Beach (Saint-Jean-Cap-Ferrat)",
          "Plage Keller (Cap d Antibes)",
          "Nikki Beach Saint-Tropez (Ramatuelle)",
          "Z Plage (Cannes)",
          "La Reserve a la Plage (Ramatuelle)"
        ],
        "url": "https://www.villasud.com/blog/item/163/best-beach-clubs-on-the-cote-d-azur"
      }
    },
    "vote": {
      "items": [
        "Club 55 (Ramatuelle)",
        "Nikki Beach Saint-Tropez (Ramatuelle)",
        "La Reserve a la Plage (Ramatuelle)",
        "Verde Beach (Ramatuelle)",
        "Paloma Beach (Saint-Jean-Cap-Ferrat)",
        "Moorea Plage (Ramatuelle)",
        "Plage Keller (Cap d Antibes)",
        "Casa Amor by Dolce and Gabbana (Ramatuelle)",
        "Z Plage (Cannes)",
        "Bagatelle Beach (Ramatuelle)"
      ]
    }
  },
  {
    "id": "pizza-boston",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-28T17:57:08Z",
    "title": "Best Pizza in Boston",
    "category": "Boston",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Regina Pizzeria (North End)": "https://www.google.com/maps/search/?api=1&query=Regina%20Pizzeria%20North%20End",
      "Santarpio's Pizza (East Boston)": "https://www.google.com/maps/search/?api=1&query=Santarpio%27s%20Pizza%20East%20Boston",
      "Galleria Umberto (North End)": "https://www.google.com/maps/search/?api=1&query=Galleria%20Umberto%20North%20End",
      "Florina Pizzeria (Beacon Hill)": "https://www.google.com/maps/search/?api=1&query=Florina%20Pizzeria%20Beacon%20Hill",
      "Quattro (North End)": "https://www.google.com/maps/search/?api=1&query=Quattro%20North%20End",
      "Picco (South End)": "https://www.google.com/maps/search/?api=1&query=Picco%20South%20End",
      "Si Cara (Cambridge)": "https://www.google.com/maps/search/?api=1&query=Si%20Cara%20Cambridge",
      "Posto (Somerville)": "https://www.google.com/maps/search/?api=1&query=Posto%20Somerville",
      "Bardo's Pizza (South Boston)": "https://www.google.com/maps/search/?api=1&query=Bardo%27s%20Pizza%20South%20Boston",
      "Stoked Pizza (Brookline)": "https://www.google.com/maps/search/?api=1&query=Stoked%20Pizza%20Brookline",
      "Area Four (Cambridge)": "https://www.google.com/maps/search/?api=1&query=Area%20Four%20Cambridge",
      "Mortadella Head (Somerville)": "https://www.google.com/maps/search/?api=1&query=Mortadella%20Head%20Somerville",
      "Dragon Pizza (Somerville)": "https://www.google.com/maps/search/?api=1&query=Dragon%20Pizza%20Somerville",
      "HotBox (Somerville)": "https://www.google.com/maps/search/?api=1&query=HotBox%20Somerville",
      "Brewer's Fork (Charlestown)": "https://www.google.com/maps/search/?api=1&query=Brewer%27s%20Fork%20Charlestown",
      "Ciao Pizza & Pasta (Chelsea)": "https://www.google.com/maps/search/?api=1&query=Ciao%20Pizza%20Pasta%20Chelsea",
      "Armando's Pizza (Cambridge)": "https://www.google.com/maps/search/?api=1&query=Armando%27s%20Pizza%20Cambridge",
      "Night Shift Brewing (Lovejoy Wharf)": "https://www.google.com/maps/search/?api=1&query=Night%20Shift%20Brewing%20Lovejoy%20Wharf",
      "Da LaPosta (Newton)": "https://www.google.com/maps/search/?api=1&query=Da%20LaPosta%20Newton",
      "Parziale's Bakery (North End)": "https://www.google.com/maps/search/?api=1&query=Parziale%27s%20Bakery%20North%20End",
      "Pinocchio's Pizza (Harvard Square)": "https://www.google.com/maps/search/?api=1&query=Pinocchio%27s%20Pizza%20Harvard%20Square",
      "Mast (Downtown Boston)": "https://www.google.com/maps/search/?api=1&query=Mast%20Downtown%20Boston",
      "Source Restaurant (Harvard Square)": "https://www.google.com/maps/search/?api=1&query=Source%20Restaurant%20Harvard%20Square",
      "Jinny's Pizzeria (Newton)": "https://www.google.com/maps/search/?api=1&query=Jinny%27s%20Pizzeria%20Newton",
      "Avenue Kitchen and Bar (Somerville)": "https://www.google.com/maps/search/?api=1&query=Avenue%20Kitchen%20and%20Bar%20Somerville",
      "Pastoral (Seaport)": "https://www.google.com/maps/search/?api=1&query=Pastoral%20Seaport",
      "Ducali Pizzeria (North End)": "https://www.google.com/maps/search/?api=1&query=Ducali%20Pizzeria%20North%20End",
      "Coppa (South End)": "https://www.google.com/maps/search/?api=1&query=Coppa%20South%20End",
      "All Star Pizza Bar (Inman Square)": "https://www.google.com/maps/search/?api=1&query=All%20Star%20Pizza%20Bar%20Inman%20Square",
      "Ernesto's (North End)": "https://www.google.com/maps/search/?api=1&query=Ernesto%27s%20North%20End"
    },
    "blurb": "From century-old brick-oven institutions in the North End to tangy sourdough canotto pies in Cambridge, these are the pies Boston argues about. Ranked by consensus across the city's most trusted critics.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Regina Pizzeria (North End)",
          "Santarpio's Pizza (East Boston)",
          "Galleria Umberto (North End)",
          "Florina Pizzeria (Beacon Hill)",
          "Quattro (North End)",
          "Picco (South End)",
          "Si Cara (Cambridge)",
          "Posto (Somerville)",
          "Bardo's Pizza (South Boston)",
          "Stoked Pizza (Brookline)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation Boston 2024",
        "items": [
          "Bardo's Pizza (South Boston)",
          "Galleria Umberto (North End)",
          "Florina Pizzeria (Beacon Hill)",
          "Area Four (Cambridge)",
          "Santarpio's Pizza (East Boston)",
          "Regina Pizzeria (North End)",
          "Willie's",
          "Mortadella Head (Somerville)",
          "Picco (South End)",
          "Quattro (North End)",
          "Dragon Pizza (Somerville)",
          "HotBox (Somerville)",
          "Brewer's Fork (Charlestown)",
          "Stoked Pizza (Brookline)",
          "Ciao Pizza & Pasta (Chelsea)",
          "Posto (Somerville)",
          "Armando's Pizza (Cambridge)",
          "Night Shift Brewing (Lovejoy Wharf)",
          "Da LaPosta (Newton)"
        ],
        "url": "https://www.theinfatuation.com/boston/guides/the-best-boston-pizza"
      },
      "globe": {
        "label": "Boston Globe Magazine Best of the Best 2025",
        "items": [
          "Regina Pizzeria (North End)",
          "Florina Pizzeria (Beacon Hill)",
          "Galleria Umberto (North End)",
          "Parziale's Bakery (North End)",
          "Picco (South End)",
          "Pinocchio's Pizza (Harvard Square)",
          "Quattro (North End)",
          "Santarpio's Pizza (East Boston)",
          "Si Cara (Cambridge)"
        ],
        "url": "https://www.bostonglobe.com/2025/07/09/magazine/best-pizza-and-brew-in-boston-greater-area/"
      },
      "timeout": {
        "label": "Time Out Boston 2023",
        "items": [
          "Quattro (North End)",
          "Galleria Umberto (North End)",
          "Regina Pizzeria (North End)",
          "Santarpio's Pizza (East Boston)",
          "Mast (Downtown Boston)",
          "Florina Pizzeria (Beacon Hill)",
          "Source Restaurant (Harvard Square)",
          "Jinny's Pizzeria (Newton)",
          "Picco (South End)",
          "Avenue Kitchen and Bar (Somerville)",
          "Posto (Somerville)",
          "Pastoral (Seaport)",
          "Ducali Pizzeria (North End)",
          "Coppa (South End)",
          "All Star Pizza Bar (Inman Square)",
          "Ciao Pizza & Pasta (Chelsea)",
          "Stoked Pizza (Brookline)",
          "Brewer's Fork (Charlestown)",
          "Ernesto's (North End)",
          "HotBox (Somerville)"
        ],
        "url": "https://www.timeout.com/boston/restaurants/best-pizza-in-boston"
      }
    },
    "vote": {
      "items": [
        "Regina Pizzeria (North End)",
        "Santarpio's Pizza (East Boston)",
        "Galleria Umberto (North End)",
        "Florina Pizzeria (Beacon Hill)",
        "Quattro (North End)",
        "Picco (South End)",
        "Si Cara (Cambridge)",
        "Bardo's Pizza (South Boston)",
        "Brewer's Fork (Charlestown)",
        "Posto (Somerville)"
      ]
    }
  },
  {
    "id": "dive-bars-boston",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-28T18:06:23Z",
    "title": "Best Dive Bars in Boston",
    "category": "Boston",
    "type": "food",
    "tags": [
      "bars",
      "nightlife",
      "food-drink",
      "stores",
      "entertainment"
    ],
    "linkType": "mapsCity",
    "links": {
      "Biddy Early's (Downtown)": "https://www.google.com/maps/search/?api=1&query=Biddy%20Early%27s%20Downtown",
      "Emmet's Irish Pub (Beacon Hill)": "https://www.google.com/maps/search/?api=1&query=Emmet%27s%20Irish%20Pub%20Beacon%20Hill",
      "Model Café (Allston)": "https://www.google.com/maps/search/?api=1&query=Model%20Caf%C3%A9%20Allston",
      "Sevens Ale House (Beacon Hill)": "https://www.google.com/maps/search/?api=1&query=Sevens%20Ale%20House%20Beacon%20Hill",
      "Silhouette Lounge (Allston)": "https://www.google.com/maps/search/?api=1&query=Silhouette%20Lounge%20Allston",
      "Bukowski Tavern (Back Bay)": "https://www.google.com/maps/search/?api=1&query=Bukowski%20Tavern%20Back%20Bay",
      "Delux Café (South End)": "https://www.google.com/maps/search/?api=1&query=Delux%20Caf%C3%A9%20South%20End",
      "Charlie's Kitchen (Harvard Square)": "https://www.google.com/maps/search/?api=1&query=Charlie%27s%20Kitchen%20Harvard%20Square",
      "The Cantab Lounge (Central Square)": "https://www.google.com/maps/search/?api=1&query=The%20Cantab%20Lounge%20Central%20Square",
      "Sullivan's Tap (West End)": "https://www.google.com/maps/search/?api=1&query=Sullivan%27s%20Tap%20West%20End",
      "Croke Park (South Boston)": "https://www.google.com/maps/search/?api=1&query=Croke%20Park%20South%20Boston",
      "Anchovies (South End)": "https://www.google.com/maps/search/?api=1&query=Anchovies%20South%20End",
      "L Street Tavern (South Boston)": "https://www.google.com/maps/search/?api=1&query=L%20Street%20Tavern%20South%20Boston",
      "Warren Tavern (Charlestown)": "https://www.google.com/maps/search/?api=1&query=Warren%20Tavern%20Charlestown",
      "Eire Pub (Dorchester)": "https://www.google.com/maps/search/?api=1&query=Eire%20Pub%20Dorchester",
      "Coolidge Corner Clubhouse (Brookline)": "https://www.google.com/maps/search/?api=1&query=Coolidge%20Corner%20Clubhouse%20Brookline",
      "The Quiet Few (East Boston)": "https://www.google.com/maps/search/?api=1&query=The%20Quiet%20Few%20East%20Boston",
      "Small Victories (South Boston)": "https://www.google.com/maps/search/?api=1&query=Small%20Victories%20South%20Boston",
      "The Tam (Downtown)": "https://www.google.com/maps/search/?api=1&query=The%20Tam%20Downtown",
      "State Park (Cambridge)": "https://www.google.com/maps/search/?api=1&query=State%20Park%20Cambridge",
      "Green Dragon (Downtown)": "https://www.google.com/maps/search/?api=1&query=Green%20Dragon%20Downtown",
      "Polish American Citizens Club (Dorchester)": "https://www.google.com/maps/search/?api=1&query=Polish%20American%20Citizens%20Club%20Dorchester",
      "Irish Village (Brighton)": "https://www.google.com/maps/search/?api=1&query=Irish%20Village%20Brighton"
    },
    "blurb": "No-frills, cash-friendly, and gloriously unbothered by trends. These are the storied neighborhood holdouts where the drinks are cheap, the regulars are loyal, and the character is earned over decades.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Biddy Early's (Downtown)",
          "Delux Café (South End)",
          "The Tam (Downtown)",
          "Silhouette Lounge (Allston)",
          "Sullivan's Tap (West End)",
          "Bukowski Tavern (Back Bay)",
          "State Park (Cambridge)",
          "Model Café (Allston)",
          "Sevens Ale House (Beacon Hill)",
          "Croke Park (South Boston)"
        ]
      },
      "timeout": {
        "label": "Time Out Boston 2022",
        "items": [
          "Biddy Early's (Downtown)",
          "Emmet's Irish Pub (Beacon Hill)",
          "Model Café (Allston)",
          "Sevens Ale House (Beacon Hill)",
          "Silhouette Lounge (Allston)",
          "Bukowski Tavern (Back Bay)",
          "Delux Café (South End)",
          "Charlie's Kitchen (Harvard Square)",
          "The Cantab Lounge (Central Square)",
          "Sullivan's Tap (West End)",
          "Croke Park (South Boston)"
        ],
        "url": "https://www.timeout.com/boston/bars/best-dive-bars-in-boston"
      },
      "do617": {
        "label": "Do617 2025",
        "items": [
          "Anchovies (South End)",
          "Delux Café (South End)",
          "L Street Tavern (South Boston)",
          "Warren Tavern (Charlestown)",
          "Eire Pub (Dorchester)",
          "Coolidge Corner Clubhouse (Brookline)",
          "The Quiet Few (East Boston)",
          "Small Victories (South Boston)",
          "The Tam (Downtown)",
          "Biddy Early's (Downtown)",
          "Sullivan's Tap (West End)",
          "State Park (Cambridge)",
          "Bukowski Tavern (Back Bay)",
          "Green Dragon (Downtown)",
          "Polish American Citizens Club (Dorchester)"
        ],
        "url": "https://do617.com/p/bostons-best-dive-bars"
      },
      "foodlens": {
        "label": "The Food Lens 2022",
        "items": [
          "Delux Café (South End)",
          "The Tam (Downtown)",
          "Silhouette Lounge (Allston)",
          "State Park (Cambridge)",
          "Biddy Early's (Downtown)",
          "Irish Village (Brighton)"
        ],
        "url": "https://www.thefoodlens.com/boston/guides/bostons-best-dive-bars/"
      }
    },
    "vote": {
      "items": [
        "Biddy Early's (Downtown)",
        "Delux Café (South End)",
        "The Tam (Downtown)",
        "Silhouette Lounge (Allston)",
        "Sullivan's Tap (West End)",
        "Bukowski Tavern (Back Bay)",
        "State Park (Cambridge)",
        "The Cantab Lounge (Central Square)",
        "L Street Tavern (South Boston)",
        "Croke Park (South Boston)"
      ]
    }
  },
  {
    "id": "burgers-boston",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-28T18:06:23Z",
    "title": "Best Burgers in Boston",
    "category": "Boston",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Little Donkey (Central Square)": "https://www.google.com/maps/search/?api=1&query=Little%20Donkey%20Central%20Square",
      "Hojoko (Fenway)": "https://www.google.com/maps/search/?api=1&query=Hojoko%20Fenway",
      "Seamark Seafood & Cocktails (Everett)": "https://www.google.com/maps/search/?api=1&query=Seamark%20Seafood%20Cocktails%20Everett",
      "jm Curley (Downtown)": "https://www.google.com/maps/search/?api=1&query=jm%20Curley%20Downtown",
      "The Quiet Few (East Boston)": "https://www.google.com/maps/search/?api=1&query=The%20Quiet%20Few%20East%20Boston",
      "Bred Gourmet (Dorchester)": "https://www.google.com/maps/search/?api=1&query=Bred%20Gourmet%20Dorchester",
      "Bistro du Midi (Back Bay)": "https://www.google.com/maps/search/?api=1&query=Bistro%20du%20Midi%20Back%20Bay",
      "Neptune Oyster (North End)": "https://www.google.com/maps/search/?api=1&query=Neptune%20Oyster%20North%20End",
      "The Publick House (Brookline)": "https://www.google.com/maps/search/?api=1&query=The%20Publick%20House%20Brookline",
      "Lincoln Tavern (South Boston)": "https://www.google.com/maps/search/?api=1&query=Lincoln%20Tavern%20South%20Boston",
      "Moonshine 152 (South Boston)": "https://www.google.com/maps/search/?api=1&query=Moonshine%20152%20South%20Boston",
      "Shojo (Chinatown)": "https://www.google.com/maps/search/?api=1&query=Shojo%20Chinatown",
      "Tasty Burger (Fenway)": "https://www.google.com/maps/search/?api=1&query=Tasty%20Burger%20Fenway",
      "Mr. Bartley's (Harvard Square)": "https://www.google.com/maps/search/?api=1&query=Mr.%20Bartley%27s%20Harvard%20Square",
      "Foundry on Elm (Somerville)": "https://www.google.com/maps/search/?api=1&query=Foundry%20on%20Elm%20Somerville",
      "Roxy's Grilled Cheese (Allston)": "https://www.google.com/maps/search/?api=1&query=Roxy%27s%20Grilled%20Cheese%20Allston",
      "Alden & Harlow (Harvard Square)": "https://www.google.com/maps/search/?api=1&query=Alden%20Harlow%20Harvard%20Square",
      "Black Lamb (South End)": "https://www.google.com/maps/search/?api=1&query=Black%20Lamb%20South%20End",
      "A&B Kitchen & Bar (West End)": "https://www.google.com/maps/search/?api=1&query=A%20B%20Kitchen%20Bar%20West%20End",
      "Gray's Hall (South Boston)": "https://www.google.com/maps/search/?api=1&query=Gray%27s%20Hall%20South%20Boston",
      "The Capital Burger (Back Bay)": "https://www.google.com/maps/search/?api=1&query=The%20Capital%20Burger%20Back%20Bay",
      "DW French (Fenway)": "https://www.google.com/maps/search/?api=1&query=DW%20French%20Fenway",
      "Highland Kitchen (Somerville)": "https://www.google.com/maps/search/?api=1&query=Highland%20Kitchen%20Somerville",
      "Veggie Galaxy (Central Square)": "https://www.google.com/maps/search/?api=1&query=Veggie%20Galaxy%20Central%20Square"
    },
    "blurb": "Griddled smashburgers, dry-aged chuck-and-short-rib stacks, and a few cult patties hiding inside seafood joints and cocktail bars. These are the burgers Boston lines up for.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Little Donkey (Central Square)",
          "jm Curley (Downtown)",
          "Neptune Oyster (North End)",
          "Hojoko (Fenway)",
          "Mr. Bartley's (Harvard Square)",
          "Tasty Burger (Fenway)",
          "Roxy's Grilled Cheese (Allston)",
          "Alden & Harlow (Harvard Square)",
          "The Quiet Few (East Boston)",
          "Bred Gourmet (Dorchester)"
        ]
      },
      "timeout": {
        "label": "Time Out Boston 2024",
        "items": [
          "Little Donkey (Central Square)",
          "Hojoko (Fenway)",
          "Seamark Seafood & Cocktails (Everett)",
          "jm Curley (Downtown)",
          "The Quiet Few (East Boston)",
          "Bred Gourmet (Dorchester)",
          "Bistro du Midi (Back Bay)",
          "Neptune Oyster (North End)",
          "The Publick House (Brookline)",
          "Lincoln Tavern (South Boston)",
          "Moonshine 152 (South Boston)",
          "Shojo (Chinatown)",
          "Tasty Burger (Fenway)",
          "Mr. Bartley's (Harvard Square)",
          "Foundry on Elm (Somerville)",
          "Roxy's Grilled Cheese (Allston)",
          "Alden & Harlow (Harvard Square)"
        ],
        "url": "https://www.timeout.com/boston/restaurants/best-burgers-in-boston"
      },
      "infatuation": {
        "label": "The Infatuation Boston 2026",
        "items": [
          "Neptune Oyster (North End)",
          "Tasty Burger (Fenway)",
          "jm Curley (Downtown)",
          "Black Lamb (South End)",
          "A&B Kitchen & Bar (West End)",
          "Roxy's Grilled Cheese (Allston)",
          "Mr. Bartley's (Harvard Square)",
          "Gray's Hall (South Boston)",
          "The Quiet Few (East Boston)",
          "Alden & Harlow (Harvard Square)"
        ],
        "url": "https://www.theinfatuation.com/boston/guides/the-best-burgers-in-boston"
      },
      "globe": {
        "label": "Boston Globe Magazine Best of the Best 2024",
        "items": [
          "Bred Gourmet (Dorchester)",
          "The Capital Burger (Back Bay)",
          "DW French (Fenway)",
          "Highland Kitchen (Somerville)",
          "Hojoko (Fenway)",
          "Little Donkey (Central Square)",
          "Mr. Bartley's (Harvard Square)",
          "Veggie Galaxy (Central Square)"
        ],
        "url": "https://www.bostonglobe.com/2024/07/11/magazine/good-burger-meal-8-delish-cant-miss-boston-eateries/"
      }
    },
    "vote": {
      "items": [
        "Little Donkey (Central Square)",
        "jm Curley (Downtown)",
        "Neptune Oyster (North End)",
        "Hojoko (Fenway)",
        "Mr. Bartley's (Harvard Square)",
        "Tasty Burger (Fenway)",
        "Black Lamb (South End)",
        "Roxy's Grilled Cheese (Allston)",
        "Alden & Harlow (Harvard Square)",
        "Gray's Hall (South Boston)"
      ]
    }
  },
  {
    "id": "cocktail-bars-boston",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-28T18:06:23Z",
    "title": "Best Cocktail Bars in Boston",
    "category": "Boston",
    "type": "food",
    "tags": [
      "bars",
      "nightlife",
      "food-drink",
      "stores",
      "entertainment"
    ],
    "linkType": "mapsCity",
    "links": {
      "Hecate (Back Bay)": "https://www.google.com/maps/search/?api=1&query=Hecate%20Back%20Bay",
      "Estella (Downtown)": "https://www.google.com/maps/search/?api=1&query=Estella%20Downtown",
      "Next Door (East Boston)": "https://www.google.com/maps/search/?api=1&query=Next%20Door%20East%20Boston",
      "Yvonne's (Downtown)": "https://www.google.com/maps/search/?api=1&query=Yvonne%27s%20Downtown",
      "Mahaniyom (Brookline)": "https://www.google.com/maps/search/?api=1&query=Mahaniyom%20Brookline",
      "OAK Long Bar & Kitchen (Back Bay)": "https://www.google.com/maps/search/?api=1&query=OAK%20Long%20Bar%20Kitchen%20Back%20Bay",
      "Blossom Bar (Brookline)": "https://www.google.com/maps/search/?api=1&query=Blossom%20Bar%20Brookline",
      "The Longfellow Bar (Harvard Square)": "https://www.google.com/maps/search/?api=1&query=The%20Longfellow%20Bar%20Harvard%20Square",
      "The Baldwin Bar (Woburn)": "https://www.google.com/maps/search/?api=1&query=The%20Baldwin%20Bar%20Woburn",
      "Parla (North End)": "https://www.google.com/maps/search/?api=1&query=Parla%20North%20End",
      "Brick & Mortar (Central Square)": "https://www.google.com/maps/search/?api=1&query=Brick%20Mortar%20Central%20Square",
      "Backbar (Somerville)": "https://www.google.com/maps/search/?api=1&query=Backbar%20Somerville",
      "Shore Leave (South End)": "https://www.google.com/maps/search/?api=1&query=Shore%20Leave%20South%20End",
      "Trina's Starlite Lounge (Somerville)": "https://www.google.com/maps/search/?api=1&query=Trina%27s%20Starlite%20Lounge%20Somerville",
      "Earnest Drinks at Gracie's (Somerville)": "https://www.google.com/maps/search/?api=1&query=Earnest%20Drinks%20at%20Gracie%27s%20Somerville",
      "jm Curley (Downtown)": "https://www.google.com/maps/search/?api=1&query=jm%20Curley%20Downtown",
      "Bar Lunette (Brookline)": "https://www.google.com/maps/search/?api=1&query=Bar%20Lunette%20Brookline",
      "Hue (Back Bay)": "https://www.google.com/maps/search/?api=1&query=Hue%20Back%20Bay",
      "Merai (Brookline)": "https://www.google.com/maps/search/?api=1&query=Merai%20Brookline",
      "Temple Records (Downtown)": "https://www.google.com/maps/search/?api=1&query=Temple%20Records%20Downtown",
      "Vera's (Somerville)": "https://www.google.com/maps/search/?api=1&query=Vera%27s%20Somerville",
      "The Wig Shop (Downtown)": "https://www.google.com/maps/search/?api=1&query=The%20Wig%20Shop%20Downtown",
      "My Girl (Downtown)": "https://www.google.com/maps/search/?api=1&query=My%20Girl%20Downtown",
      "Desnuda (South End)": "https://www.google.com/maps/search/?api=1&query=Desnuda%20South%20End",
      "Darling (Cambridge)": "https://www.google.com/maps/search/?api=1&query=Darling%20Cambridge",
      "Roxanne's (Beacon Hill)": "https://www.google.com/maps/search/?api=1&query=Roxanne%27s%20Beacon%20Hill",
      "Long Bar (Back Bay)": "https://www.google.com/maps/search/?api=1&query=Long%20Bar%20Back%20Bay",
      "State Park Bar (Cambridge)": "https://www.google.com/maps/search/?api=1&query=State%20Park%20Bar%20Cambridge",
      "Saloon (Davis Square)": "https://www.google.com/maps/search/?api=1&query=Saloon%20Davis%20Square"
    },
    "blurb": "Hidden speakeasies, hotel-bar grandeur, Japanese listening rooms, and tiki escapes. Boston's cocktail scene has grown up, and these are the rooms doing it best.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Hecate (Back Bay)",
          "Next Door (East Boston)",
          "Yvonne's (Downtown)",
          "Parla (North End)",
          "Backbar (Somerville)",
          "Estella (Downtown)",
          "Mahaniyom (Brookline)",
          "OAK Long Bar & Kitchen (Back Bay)",
          "Temple Records (Downtown)",
          "Brick & Mortar (Central Square)"
        ]
      },
      "timeout": {
        "label": "Time Out Boston 2023",
        "items": [
          "Hecate (Back Bay)",
          "Estella (Downtown)",
          "Next Door (East Boston)",
          "Yvonne's (Downtown)",
          "Mahaniyom (Brookline)",
          "OAK Long Bar & Kitchen (Back Bay)",
          "Blossom Bar (Brookline)",
          "The Longfellow Bar (Harvard Square)",
          "The Baldwin Bar (Woburn)",
          "Parla (North End)",
          "Brick & Mortar (Central Square)",
          "Backbar (Somerville)",
          "Shore Leave (South End)",
          "Trina's Starlite Lounge (Somerville)",
          "Earnest Drinks at Gracie's (Somerville)",
          "jm Curley (Downtown)"
        ],
        "url": "https://www.timeout.com/boston/bars/best-cocktail-bars-in-boston"
      },
      "globe": {
        "label": "Boston Globe Magazine Best of the Best 2025",
        "items": [
          "Backbar (Somerville)",
          "Bar Lunette (Brookline)",
          "Hue (Back Bay)",
          "Merai (Brookline)",
          "Next Door (East Boston)",
          "Parla (North End)",
          "Temple Records (Downtown)",
          "Vera's (Somerville)",
          "The Wig Shop (Downtown)"
        ],
        "url": "https://www.bostonglobe.com/2025/07/09/magazine/drink-spots-best-cocktail-bars-boston/"
      },
      "infatuation": {
        "label": "The Infatuation Boston 2026",
        "items": [
          "My Girl (Downtown)",
          "Desnuda (South End)",
          "Darling (Cambridge)",
          "Roxanne's (Beacon Hill)",
          "Long Bar (Back Bay)",
          "Yvonne's (Downtown)",
          "Parla (North End)",
          "State Park Bar (Cambridge)",
          "Saloon (Davis Square)"
        ]
      }
    },
    "vote": {
      "items": [
        "Hecate (Back Bay)",
        "Next Door (East Boston)",
        "Yvonne's (Downtown)",
        "Parla (North End)",
        "Backbar (Somerville)",
        "Estella (Downtown)",
        "The Baldwin Bar (Woburn)",
        "Temple Records (Downtown)",
        "Desnuda (South End)",
        "The Wig Shop (Downtown)"
      ]
    }
  },
  {
    "id": "florida-college-dive-bars",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-28T19:02:14Z",
    "title": "Best Florida College Dive Bars",
    "category": "Florida",
    "type": "travel",
    "tags": [
      "bars",
      "nightlife",
      "food-drink",
      "stores",
      "entertainment",
      "travel"
    ],
    "linkType": "mapsCity",
    "blurb": "Cheap pitchers and sticky floors from Gainesville to Tallahassee to the Grove. The bars that fueled UF, FSU, USF, UCF and Miami students for generations.",
    "defaultSource": "ai",
    "links": {
      "Balls (UF)": "https://www.google.com/maps/search/?api=1&query=Balls%20Bar%20Gainesville%20FL",
      "Bullwinkle's Saloon (FSU)": "https://www.google.com/maps/search/?api=1&query=Bullwinkle%27s%20Saloon%20Tallahassee%20FL",
      "Copper Top Pub (USF)": "https://www.google.com/maps/search/?api=1&query=Copper%20Top%20Pub%20Temple%20Terrace%20FL",
      "Ken's Tavern (FSU)": "https://www.google.com/maps/search/?api=1&query=Ken%27s%20Tavern%20Tallahassee%20FL",
      "Knight's Pub (UCF)": "https://www.google.com/maps/search/?api=1&query=Knight%27s%20Pub%20Orlando%20FL",
      "Loosey's (UF)": "https://www.google.com/maps/search/?api=1&query=Loosey%27s%20Gainesville%20FL",
      "O'Brian's Irish Pub (FAU)": "https://www.google.com/maps/search/?api=1&query=O%27Brian%27s%20Irish%20Pub%20Boca%20Raton%20FL",
      "Potbelly's (FSU)": "https://www.google.com/maps/search/?api=1&query=Potbelly%27s%20Tallahassee%20FL",
      "Salty Dog Saloon (UF)": "https://www.google.com/maps/search/?api=1&query=Salty%20Dog%20Saloon%20Gainesville%20FL",
      "Sandbar Sports Grill (UM)": "https://www.google.com/maps/search/?api=1&query=Sandbar%20Sports%20Grill%20Coconut%20Grove%20Miami%20FL",
      "Stagger Inn (UCF)": "https://www.google.com/maps/search/?api=1&query=Stagger%20Inn%20Orlando%20FL",
      "Tavern in the Grove (UM)": "https://www.google.com/maps/search/?api=1&query=Tavern%20in%20the%20Grove%20Coconut%20Grove%20Miami%20FL",
      "The Knight Library (UCF)": "https://www.google.com/maps/search/?api=1&query=Knight%20Library%20Bar%20Orlando%20FL",
      "The Study Ale House (USF)": "https://www.google.com/maps/search/?api=1&query=The%20Study%20Ale%20House%20Tampa%20FL"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Salty Dog Saloon (UF)",
          "Bullwinkle's Saloon (FSU)",
          "Potbelly's (FSU)",
          "Balls (UF)",
          "Loosey's (UF)",
          "Copper Top Pub (USF)",
          "Knight's Pub (UCF)",
          "The Knight Library (UCF)",
          "Sandbar Sports Grill (UM)",
          "Tavern in the Grove (UM)"
        ]
      },
      "orlandoweekly": {
        "label": "Orlando Weekly · Best FL College Bars",
        "url": "https://www.orlandoweekly.com/food-drink/the-20-best-college-bars-at-every-florida-university-30946345/",
        "items": [
          "Salty Dog Saloon (UF)",
          "Balls (UF)",
          "Potbelly's (FSU)",
          "Copper Top Pub (USF)",
          "The Study Ale House (USF)",
          "Knight's Pub (UCF)",
          "The Knight Library (UCF)",
          "Stagger Inn (UCF)",
          "Sandbar Sports Grill (UM)",
          "Tavern in the Grove (UM)",
          "O'Brian's Irish Pub (FAU)"
        ]
      },
      "alligator": {
        "label": "The Independent Florida Alligator 2024",
        "url": "https://www.alligator.org/article/2024/08/ave-roundtable-gainesvilles-best-bars",
        "items": [
          "Salty Dog Saloon (UF)",
          "Balls (UF)",
          "Loosey's (UF)"
        ]
      },
      "famuan": {
        "label": "The Famuan · FSU Nightlife 2025",
        "url": "https://www.thefamuanonline.com/2025/04/01/best-tallahassee-nightlife-spots-for-students-on-a-budget/",
        "items": [
          "Bullwinkle's Saloon (FSU)",
          "Potbelly's (FSU)",
          "Ken's Tavern (FSU)"
        ]
      },
      "yelp": {
        "label": "Yelp · Florida Campus Dive Bars 2026",
        "url": "https://www.yelp.com/search?find_desc=Dive+Bars&find_loc=Gainesville,+FL",
        "items": [
          "Salty Dog Saloon (UF)",
          "Bullwinkle's Saloon (FSU)",
          "Copper Top Pub (USF)",
          "Knight's Pub (UCF)",
          "Sandbar Sports Grill (UM)",
          "Balls (UF)",
          "Potbelly's (FSU)",
          "Tavern in the Grove (UM)"
        ]
      }
    },
    "vote": {
      "items": [
        "Salty Dog Saloon (UF)",
        "Bullwinkle's Saloon (FSU)",
        "Potbelly's (FSU)",
        "Balls (UF)",
        "Copper Top Pub (USF)",
        "Knight's Pub (UCF)",
        "Sandbar Sports Grill (UM)",
        "Tavern in the Grove (UM)",
        "Loosey's (UF)",
        "O'Brian's Irish Pub (FAU)"
      ]
    }
  },
  {
    "id": "texas-college-dive-bars",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-28T19:03:14Z",
    "title": "Best Texas College Dive Bars",
    "category": "Texas",
    "type": "travel",
    "tags": [
      "bars",
      "nightlife",
      "food-drink",
      "stores",
      "entertainment",
      "travel"
    ],
    "linkType": "mapsCity",
    "blurb": "Longnecks, neon, and Friday-night tradition from Austin to Aggieland to Lubbock. The dives that defined UT, A&M, Texas Tech and UNT nights out.",
    "defaultSource": "ai",
    "links": {
      "Bash Riprock's (Texas Tech)": "https://www.google.com/maps/search/?api=1&query=Bash%20Riprock%27s%20Lubbock%20TX",
      "Cain & Abel's (UT Austin)": "https://www.google.com/maps/search/?api=1&query=Cain%20and%20Abel%27s%20Austin%20TX",
      "Chimy's (Texas Tech)": "https://www.google.com/maps/search/?api=1&query=Chimy%27s%20Cerveceria%20Lubbock%20TX",
      "Cool Beans (UNT)": "https://www.google.com/maps/search/?api=1&query=Cool%20Beans%20Denton%20TX",
      "Crown & Anchor Pub (UT Austin)": "https://www.google.com/maps/search/?api=1&query=Crown%20and%20Anchor%20Pub%20Austin%20TX",
      "Dirty Bill's (UT Austin)": "https://www.google.com/maps/search/?api=1&query=Dirty%20Bill%27s%20Austin%20TX",
      "Dixie Chicken (Texas A&M)": "https://www.google.com/maps/search/?api=1&query=Dixie%20Chicken%20College%20Station%20TX",
      "Duddley's Draw (Texas A&M)": "https://www.google.com/maps/search/?api=1&query=Duddley%27s%20Draw%20College%20Station%20TX",
      "Hole in the Wall (UT Austin)": "https://www.google.com/maps/search/?api=1&query=Hole%20in%20the%20Wall%20Bar%20Austin%20TX",
      "Lucky Lou's (UNT)": "https://www.google.com/maps/search/?api=1&query=Lucky%20Lou%27s%20Denton%20TX",
      "Mockingbird Saloon (UT Austin)": "https://www.google.com/maps/search/?api=1&query=Mockingbird%20Saloon%20Austin%20TX",
      "The Dry Bean Saloon (Texas A&M)": "https://www.google.com/maps/search/?api=1&query=Dry%20Bean%20Saloon%20College%20Station%20TX"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Dixie Chicken (Texas A&M)",
          "Hole in the Wall (UT Austin)",
          "Bash Riprock's (Texas Tech)",
          "Crown & Anchor Pub (UT Austin)",
          "Duddley's Draw (Texas A&M)",
          "Cool Beans (UNT)",
          "Cain & Abel's (UT Austin)",
          "Chimy's (Texas Tech)",
          "Lucky Lou's (UNT)",
          "The Dry Bean Saloon (Texas A&M)"
        ]
      },
      "austinstaysweird": {
        "label": "Austin Stays Weird · Best College Bars",
        "url": "https://austinstaysweird.com/best-college-bars-in-austin",
        "items": [
          "Hole in the Wall (UT Austin)",
          "Crown & Anchor Pub (UT Austin)",
          "Cain & Abel's (UT Austin)",
          "Dirty Bill's (UT Austin)",
          "Mockingbird Saloon (UT Austin)"
        ]
      },
      "scoundrels": {
        "label": "Scoundrel's Field Guide · Lubbock",
        "url": "https://scoundrelsfieldguide.com/lubbock-dive-bar-travel-guide/",
        "items": [
          "Bash Riprock's (Texas Tech)",
          "Chimy's (Texas Tech)"
        ]
      },
      "discoverdenton": {
        "label": "Discover Denton · Bars & Pubs",
        "url": "https://www.discoverdenton.com/food-drink/bars-and-pubs/",
        "items": [
          "Cool Beans (UNT)",
          "Lucky Lou's (UNT)"
        ]
      },
      "yelpcs": {
        "label": "Yelp · College Station Dive Bars 2025",
        "url": "https://www.yelp.com/search?cflt=divebars&find_loc=College+Station,+TX+77845",
        "items": [
          "Dixie Chicken (Texas A&M)",
          "Duddley's Draw (Texas A&M)",
          "The Dry Bean Saloon (Texas A&M)"
        ]
      },
      "yelptx": {
        "label": "Yelp · Texas Campus Dive Bars 2026",
        "url": "https://www.yelp.com/search?find_desc=College+Bars&find_loc=Austin,+TX",
        "items": [
          "Dixie Chicken (Texas A&M)",
          "Bash Riprock's (Texas Tech)",
          "Hole in the Wall (UT Austin)",
          "Cool Beans (UNT)",
          "Crown & Anchor Pub (UT Austin)",
          "Duddley's Draw (Texas A&M)",
          "Chimy's (Texas Tech)",
          "Lucky Lou's (UNT)",
          "Cain & Abel's (UT Austin)"
        ]
      }
    },
    "vote": {
      "items": [
        "Dixie Chicken (Texas A&M)",
        "Hole in the Wall (UT Austin)",
        "Bash Riprock's (Texas Tech)",
        "Crown & Anchor Pub (UT Austin)",
        "Cool Beans (UNT)",
        "Chimy's (Texas Tech)",
        "Duddley's Draw (Texas A&M)",
        "Cain & Abel's (UT Austin)",
        "Lucky Lou's (UNT)",
        "Dirty Bill's (UT Austin)"
      ]
    }
  },
  {
    "id": "ohio-college-dive-bars",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-28T19:04:14Z",
    "title": "Best Ohio College Dive Bars",
    "category": "Ohio",
    "type": "travel",
    "tags": [
      "bars",
      "nightlife",
      "food-drink",
      "stores",
      "entertainment",
      "travel"
    ],
    "linkType": "mapsCity",
    "blurb": "Carved-up wood booths, cheap drafts, and decades of game-day memories from Columbus to Athens to Oxford. The Buckeye State's essential campus dives.",
    "defaultSource": "ai",
    "links": {
      "Bier Stube (Ohio State)": "https://www.google.com/maps/search/?api=1&query=Bier%20Stube%20Columbus%20OH",
      "Brick Street Bar (Miami University)": "https://www.google.com/maps/search/?api=1&query=Brick%20Street%20Bar%20Oxford%20OH",
      "Howard's Club H (BGSU)": "https://www.google.com/maps/search/?api=1&query=Howard%27s%20Club%20H%20Bowling%20Green%20OH",
      "Mac & Joe's (Miami University)": "https://www.google.com/maps/search/?api=1&query=Mac%20and%20Joe%27s%20Oxford%20OH",
      "Out-R-Inn (Ohio State)": "https://www.google.com/maps/search/?api=1&query=Out-R-Inn%20Columbus%20OH",
      "Pawpurr's (Ohio University)": "https://www.google.com/maps/search/?api=1&query=Pawpurr%27s%20Athens%20OH",
      "Skipper's Pub (Miami University)": "https://www.google.com/maps/search/?api=1&query=Skipper%27s%20Pub%20Oxford%20OH",
      "Smiling Skull Saloon (Ohio University)": "https://www.google.com/maps/search/?api=1&query=Smiling%20Skull%20Saloon%20Athens%20OH",
      "The Pigskin Bar & Grill (Ohio University)": "https://www.google.com/maps/search/?api=1&query=Pigskin%20Bar%20and%20Grill%20Athens%20OH",
      "The Union Bar & Grill (Ohio University)": "https://www.google.com/maps/search/?api=1&query=Union%20Bar%20and%20Grill%20Athens%20OH",
      "Thirsty Scholar (Ohio State)": "https://www.google.com/maps/search/?api=1&query=Thirsty%20Scholar%20Columbus%20OH",
      "Tony's Tavern (Ohio University)": "https://www.google.com/maps/search/?api=1&query=Tony%27s%20Tavern%20Athens%20OH"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Out-R-Inn (Ohio State)",
          "Smiling Skull Saloon (Ohio University)",
          "Bier Stube (Ohio State)",
          "The Pigskin Bar & Grill (Ohio University)",
          "Brick Street Bar (Miami University)",
          "Mac & Joe's (Miami University)",
          "Tony's Tavern (Ohio University)",
          "Howard's Club H (BGSU)",
          "The Union Bar & Grill (Ohio University)",
          "Skipper's Pub (Miami University)"
        ]
      },
      "scoundrelsosu": {
        "label": "Scoundrel's Field Guide · OSU Campus",
        "url": "https://scoundrelsfieldguide.com/bar-crawls/ohio-state-campus-dive-bar-crawl/",
        "items": [
          "Out-R-Inn (Ohio State)",
          "Bier Stube (Ohio State)",
          "Thirsty Scholar (Ohio State)"
        ]
      },
      "columbusmonthly": {
        "label": "Columbus Monthly · Essential Dives 2023",
        "url": "https://www.columbusmonthly.com/story/lifestyle/food/2023/11/17/columbus-top-bars-11-essential-dives-neighborhood-bars-to-try/71607798007/",
        "items": [
          "Out-R-Inn (Ohio State)",
          "Bier Stube (Ohio State)"
        ]
      },
      "bricksofathens": {
        "label": "Bricks of Athens · Uptown Guide",
        "url": "https://bricksofathens.com/lets-shuffle/",
        "items": [
          "Smiling Skull Saloon (Ohio University)",
          "The Pigskin Bar & Grill (Ohio University)",
          "Tony's Tavern (Ohio University)",
          "The Union Bar & Grill (Ohio University)",
          "Pawpurr's (Ohio University)"
        ]
      },
      "miamistudent": {
        "label": "The Miami Student 2025",
        "url": "https://www.miamistudent.net/article/2025/08/best-bars-oxford-miami-university-brick-street-sidebar-drinks-going-out",
        "items": [
          "Brick Street Bar (Miami University)",
          "Mac & Joe's (Miami University)",
          "Skipper's Pub (Miami University)"
        ]
      },
      "yelpoh": {
        "label": "Yelp · Ohio Campus Dive Bars 2026",
        "url": "https://www.yelp.com/search?find_desc=Dive+Bars&find_loc=Athens,+OH+45701",
        "items": [
          "Out-R-Inn (Ohio State)",
          "Smiling Skull Saloon (Ohio University)",
          "The Pigskin Bar & Grill (Ohio University)",
          "Brick Street Bar (Miami University)",
          "Mac & Joe's (Miami University)",
          "Howard's Club H (BGSU)",
          "Tony's Tavern (Ohio University)",
          "Bier Stube (Ohio State)"
        ]
      }
    },
    "vote": {
      "items": [
        "Out-R-Inn (Ohio State)",
        "Smiling Skull Saloon (Ohio University)",
        "Bier Stube (Ohio State)",
        "The Pigskin Bar & Grill (Ohio University)",
        "Brick Street Bar (Miami University)",
        "Mac & Joe's (Miami University)",
        "Tony's Tavern (Ohio University)",
        "Howard's Club H (BGSU)",
        "Thirsty Scholar (Ohio State)",
        "Skipper's Pub (Miami University)"
      ]
    }
  },
  {
    "id": "tacos-austin",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-28T19:23:45Z",
    "title": "Best Tacos in Austin",
    "category": "Austin",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "From migas at dawn to suadero at midnight. Austin's taco obsession runs from Michelin-recognized kitchens to trompo-spinning trailers.",
    "defaultSource": "ai",
    "links": {
      "Autenticos Michoacanos (South Austin)": "https://www.google.com/maps/search/?api=1&query=Autenticos%20Michoacanos%20South%20Austin",
      "Carnitas El Guero (South Austin)": "https://www.google.com/maps/search/?api=1&query=Carnitas%20El%20Guero%20South%20Austin",
      "Comadre Panaderia (East Austin)": "https://www.google.com/maps/search/?api=1&query=Comadre%20Panaderia%20East%20Austin",
      "Cuantos Tacos (East Austin)": "https://www.google.com/maps/search/?api=1&query=Cuantos%20Tacos%20East%20Austin",
      "De Nada Cantina (East Austin)": "https://www.google.com/maps/search/?api=1&query=De%20Nada%20Cantina%20East%20Austin",
      "Discada (East Austin)": "https://www.google.com/maps/search/?api=1&query=Discada%20East%20Austin",
      "El Buen Taquero (Windsor Park)": "https://www.google.com/maps/search/?api=1&query=El%20Buen%20Taquero%20Windsor%20Park",
      "El Naranjo (South Lamar)": "https://www.google.com/maps/search/?api=1&query=El%20Naranjo%20South%20Lamar",
      "El Perrito ATX (South Austin)": "https://www.google.com/maps/search/?api=1&query=El%20Perrito%20ATX%20South%20Austin",
      "El Primo (South Austin)": "https://www.google.com/maps/search/?api=1&query=El%20Primo%20South%20Austin",
      "Este (East Austin)": "https://www.google.com/maps/search/?api=1&query=Este%20East%20Austin",
      "Granny's Tacos (East Austin)": "https://www.google.com/maps/search/?api=1&query=Granny%20s%20Tacos%20East%20Austin",
      "La Santa Barbacha (Cherrywood)": "https://www.google.com/maps/search/?api=1&query=La%20Santa%20Barbacha%20Cherrywood",
      "Las Trancas (East Austin)": "https://www.google.com/maps/search/?api=1&query=Las%20Trancas%20East%20Austin",
      "Los Galanes (Bouldin)": "https://www.google.com/maps/search/?api=1&query=Los%20Galanes%20Bouldin",
      "Nixta Taqueria (East Austin)": "https://www.google.com/maps/search/?api=1&query=Nixta%20Taqueria%20East%20Austin",
      "Paprika ATX (North Lamar)": "https://www.google.com/maps/search/?api=1&query=Paprika%20ATX%20North%20Lamar",
      "Pueblo Viejo (multiple locations)": "https://www.google.com/maps/search/?api=1&query=Pueblo%20Viejo%20multiple%20locations",
      "Sana Sana Taqueria (Downtown)": "https://www.google.com/maps/search/?api=1&query=Sana%20Sana%20Taqueria%20Downtown",
      "Suerte (East Austin)": "https://www.google.com/maps/search/?api=1&query=Suerte%20East%20Austin",
      "Taco Master (East Riverside)": "https://www.google.com/maps/search/?api=1&query=Taco%20Master%20East%20Riverside",
      "Vaquero Taquero (Hyde Park)": "https://www.google.com/maps/search/?api=1&query=Vaquero%20Taquero%20Hyde%20Park",
      "Veracruz All Natural (multiple locations)": "https://www.google.com/maps/search/?api=1&query=Veracruz%20All%20Natural%20multiple%20locations"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Nixta Taqueria (East Austin)",
          "Cuantos Tacos (East Austin)",
          "Paprika ATX (North Lamar)",
          "Discada (East Austin)",
          "Veracruz All Natural (multiple locations)",
          "Vaquero Taquero (Hyde Park)",
          "La Santa Barbacha (Cherrywood)",
          "Suerte (East Austin)",
          "Granny's Tacos (East Austin)",
          "De Nada Cantina (East Austin)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation · 25 Best Austin Tacos, Ranked 2025",
        "url": "https://www.theinfatuation.com/austin/guides/best-austin-tacos",
        "items": [
          "Paprika ATX (North Lamar)",
          "Nixta Taqueria (East Austin)",
          "Cuantos Tacos (East Austin)",
          "Carnitas El Guero (South Austin)",
          "Discada (East Austin)",
          "Taco Master (East Riverside)",
          "El Buen Taquero (Windsor Park)",
          "Autenticos Michoacanos (South Austin)",
          "La Santa Barbacha (Cherrywood)",
          "De Nada Cantina (East Austin)",
          "Vaquero Taquero (Hyde Park)",
          "Veracruz All Natural (multiple locations)"
        ]
      },
      "texasmonthly": {
        "label": "Texas Monthly · 22 Best Taco Spots (unranked) 2026",
        "unordered": true,
        "url": "https://www.texasmonthly.com/food/the-austin-taco-trail/",
        "items": [
          "Comadre Panaderia (East Austin)",
          "Cuantos Tacos (East Austin)",
          "De Nada Cantina (East Austin)",
          "Discada (East Austin)",
          "El Naranjo (South Lamar)",
          "El Perrito ATX (South Austin)",
          "Este (East Austin)",
          "Granny's Tacos (East Austin)",
          "La Santa Barbacha (Cherrywood)",
          "Nixta Taqueria (East Austin)",
          "Paprika ATX (North Lamar)",
          "Sana Sana Taqueria (Downtown)",
          "Suerte (East Austin)",
          "Vaquero Taquero (Hyde Park)"
        ]
      },
      "austinfoodmag": {
        "label": "Austin Food Magazine · Best Tacos 2025",
        "url": "https://austinfoodmagazine.com/best-tacos-austin-2025/",
        "items": [
          "Nixta Taqueria (East Austin)",
          "Cuantos Tacos (East Austin)",
          "Veracruz All Natural (multiple locations)",
          "Las Trancas (East Austin)",
          "Suerte (East Austin)",
          "Paprika ATX (North Lamar)",
          "Discada (East Austin)",
          "El Primo (South Austin)",
          "Granny's Tacos (East Austin)",
          "Pueblo Viejo (multiple locations)",
          "Los Galanes (Bouldin)",
          "Vaquero Taquero (Hyde Park)"
        ]
      }
    },
    "vote": {
      "items": [
        "Nixta Taqueria (East Austin)",
        "Cuantos Tacos (East Austin)",
        "Paprika ATX (North Lamar)",
        "Veracruz All Natural (multiple locations)",
        "Discada (East Austin)",
        "Suerte (East Austin)",
        "La Santa Barbacha (Cherrywood)",
        "Vaquero Taquero (Hyde Park)",
        "Granny's Tacos (East Austin)",
        "El Primo (South Austin)"
      ]
    }
  },
  {
    "id": "tacos-atlanta",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-28T19:24:15Z",
    "title": "Best Tacos in Atlanta",
    "category": "Atlanta",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "Buford Highway taquerias, Southern-Mexican mashups, and late-night trompo. Atlanta's taco scene rewards anyone willing to leave the perimeter.",
    "defaultSource": "ai",
    "links": {
      "Bartaco (Inman Park)": "https://www.google.com/maps/search/?api=1&query=Bartaco%20Inman%20Park",
      "Carniceria Ramirez (Bolton)": "https://www.google.com/maps/search/?api=1&query=Carniceria%20Ramirez%20Bolton",
      "Carnitas Michoacan (Buford Highway)": "https://www.google.com/maps/search/?api=1&query=Carnitas%20Michoacan%20Buford%20Highway",
      "Da Cocinita (Kirkwood)": "https://www.google.com/maps/search/?api=1&query=Da%20Cocinita%20Kirkwood",
      "Don Chon (Hapeville)": "https://www.google.com/maps/search/?api=1&query=Don%20Chon%20Hapeville",
      "El Progreso (Benteen Park)": "https://www.google.com/maps/search/?api=1&query=El%20Progreso%20Benteen%20Park",
      "El Rey del Taco (Doraville)": "https://www.google.com/maps/search/?api=1&query=El%20Rey%20del%20Taco%20Doraville",
      "El Santo Gallo (West Midtown)": "https://www.google.com/maps/search/?api=1&query=El%20Santo%20Gallo%20West%20Midtown",
      "El Taco Veloz (Buford Highway)": "https://www.google.com/maps/search/?api=1&query=El%20Taco%20Veloz%20Buford%20Highway",
      "El Tesoro (Edgewood)": "https://www.google.com/maps/search/?api=1&query=El%20Tesoro%20Edgewood",
      "Hankook Taqueria (Westside)": "https://www.google.com/maps/search/?api=1&query=Hankook%20Taqueria%20Westside",
      "Holy Taco (East Atlanta)": "https://www.google.com/maps/search/?api=1&query=Holy%20Taco%20East%20Atlanta",
      "La Pastorcita (Buford Highway)": "https://www.google.com/maps/search/?api=1&query=La%20Pastorcita%20Buford%20Highway",
      "Little Rey (Piedmont Heights)": "https://www.google.com/maps/search/?api=1&query=Little%20Rey%20Piedmont%20Heights",
      "Pappasito's Cantina (Marietta)": "https://www.google.com/maps/search/?api=1&query=Pappasito%20s%20Cantina%20Marietta",
      "Supremo Taco (Reynoldstown)": "https://www.google.com/maps/search/?api=1&query=Supremo%20Taco%20Reynoldstown",
      "Taco Cantina Smyrna (Smyrna)": "https://www.google.com/maps/search/?api=1&query=Taco%20Cantina%20Smyrna%20Smyrna",
      "Tacos & Tequilas (Buckhead)": "https://www.google.com/maps/search/?api=1&query=Tacos%20Tequilas%20Buckhead",
      "Tacos La Villa (Smyrna)": "https://www.google.com/maps/search/?api=1&query=Tacos%20La%20Villa%20Smyrna",
      "Taqueria del Sol (multiple locations)": "https://www.google.com/maps/search/?api=1&query=Taqueria%20del%20Sol%20multiple%20locations",
      "Verde Taqueria (Brookhaven)": "https://www.google.com/maps/search/?api=1&query=Verde%20Taqueria%20Brookhaven",
      "Vice Taco Truck (Reynoldstown)": "https://www.google.com/maps/search/?api=1&query=Vice%20Taco%20Truck%20Reynoldstown"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "El Rey del Taco (Doraville)",
          "Taqueria del Sol (multiple locations)",
          "El Tesoro (Edgewood)",
          "Little Rey (Piedmont Heights)",
          "La Pastorcita (Buford Highway)",
          "Holy Taco (East Atlanta)",
          "El Progreso (Benteen Park)",
          "Supremo Taco (Reynoldstown)",
          "Hankook Taqueria (Westside)",
          "Carnitas Michoacan (Buford Highway)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation · 10 Best Tacos Atlanta 2026",
        "url": "https://www.theinfatuation.com/atlanta/guides/best-tacos-atlanta",
        "items": [
          "El Rey del Taco (Doraville)",
          "El Tesoro (Edgewood)",
          "Tacos La Villa (Smyrna)",
          "El Santo Gallo (West Midtown)",
          "El Progreso (Benteen Park)",
          "Da Cocinita (Kirkwood)",
          "Vice Taco Truck (Reynoldstown)",
          "Taqueria del Sol (multiple locations)",
          "Hankook Taqueria (Westside)",
          "El Taco Veloz (Buford Highway)"
        ]
      },
      "atlantaeats": {
        "label": "Atlanta Eats · Best Street Tacos 2026",
        "url": "https://www.atlantaeats.com/blog/atl-street-tacos/",
        "items": [
          "Carnitas Michoacan (Buford Highway)",
          "El Rey del Taco (Doraville)",
          "El Tesoro (Edgewood)",
          "Supremo Taco (Reynoldstown)",
          "La Pastorcita (Buford Highway)",
          "Little Rey (Piedmont Heights)",
          "Taco Cantina Smyrna (Smyrna)",
          "Taqueria del Sol (multiple locations)",
          "Carniceria Ramirez (Bolton)"
        ]
      },
      "atlantafi": {
        "label": "AtlantaFi · Best Taco Spots 2025",
        "url": "https://atlantafi.com/best-tacos-atlanta/",
        "items": [
          "Don Chon (Hapeville)",
          "Holy Taco (East Atlanta)",
          "Little Rey (Piedmont Heights)",
          "Bartaco (Inman Park)",
          "Tacos & Tequilas (Buckhead)",
          "Taqueria del Sol (multiple locations)",
          "El Rey del Taco (Doraville)",
          "Pappasito's Cantina (Marietta)",
          "Verde Taqueria (Brookhaven)"
        ]
      }
    },
    "vote": {
      "items": [
        "El Rey del Taco (Doraville)",
        "Taqueria del Sol (multiple locations)",
        "El Tesoro (Edgewood)",
        "Little Rey (Piedmont Heights)",
        "Holy Taco (East Atlanta)",
        "La Pastorcita (Buford Highway)",
        "El Progreso (Benteen Park)",
        "Supremo Taco (Reynoldstown)",
        "Hankook Taqueria (Westside)",
        "Don Chon (Hapeville)"
      ]
    }
  },
  {
    "id": "tacos-miami",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-28T19:24:45Z",
    "title": "Best Tacos in Miami",
    "category": "Miami",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "Nixtamalized blue corn, Wynwood al pastor, and Doral's hidden gems. Miami's tacos pull from Mexico City by way of South Florida.",
    "defaultSource": "ai",
    "links": {
      "Antojitos Mexicanos Tenorio (Kendall)": "https://www.google.com/maps/search/?api=1&query=Antojitos%20Mexicanos%20Tenorio%20Kendall",
      "Bakan (Wynwood)": "https://www.google.com/maps/search/?api=1&query=Bakan%20Wynwood",
      "Bodega Taqueria y Tequila (Miami Beach)": "https://www.google.com/maps/search/?api=1&query=Bodega%20Taqueria%20y%20Tequila%20Miami%20Beach",
      "Cha Cha Cha (Wynwood)": "https://www.google.com/maps/search/?api=1&query=Cha%20Cha%20Cha%20Wynwood",
      "Chito's Red Tacos (Wynwood)": "https://www.google.com/maps/search/?api=1&query=Chito%20s%20Red%20Tacos%20Wynwood",
      "Coyo Taco (Wynwood)": "https://www.google.com/maps/search/?api=1&query=Coyo%20Taco%20Wynwood",
      "El Primo Red Tacos (Downtown)": "https://www.google.com/maps/search/?api=1&query=El%20Primo%20Red%20Tacos%20Downtown",
      "Jacalito Taqueria Mexicana (Allapattah)": "https://www.google.com/maps/search/?api=1&query=Jacalito%20Taqueria%20Mexicana%20Allapattah",
      "La Pasadita (Homestead)": "https://www.google.com/maps/search/?api=1&query=La%20Pasadita%20Homestead",
      "La Santa Taqueria (Little River)": "https://www.google.com/maps/search/?api=1&query=La%20Santa%20Taqueria%20Little%20River",
      "Lolo's Surf Cantina (Miami Beach)": "https://www.google.com/maps/search/?api=1&query=Lolo%20s%20Surf%20Cantina%20Miami%20Beach",
      "Los Felix (Coconut Grove)": "https://www.google.com/maps/search/?api=1&query=Los%20Felix%20Coconut%20Grove",
      "Mezquite Taqueria (Coral Way)": "https://www.google.com/maps/search/?api=1&query=Mezquite%20Taqueria%20Coral%20Way",
      "Mi Rinconcito Mexicano (Little Havana)": "https://www.google.com/maps/search/?api=1&query=Mi%20Rinconcito%20Mexicano%20Little%20Havana",
      "No Manches Que Rico (Flagami)": "https://www.google.com/maps/search/?api=1&query=No%20Manches%20Que%20Rico%20Flagami",
      "Pilo's Street Tacos (Brickell)": "https://www.google.com/maps/search/?api=1&query=Pilo%20s%20Street%20Tacos%20Brickell",
      "Tacombi (Wynwood)": "https://www.google.com/maps/search/?api=1&query=Tacombi%20Wynwood",
      "Tacos Maria (Little River)": "https://www.google.com/maps/search/?api=1&query=Tacos%20Maria%20Little%20River",
      "Taqueria El Mexicano (Little Havana)": "https://www.google.com/maps/search/?api=1&query=Taqueria%20El%20Mexicano%20Little%20Havana",
      "Taqueria Morelia (Florida City)": "https://www.google.com/maps/search/?api=1&query=Taqueria%20Morelia%20Florida%20City",
      "Taqueria Viva Mexico (Little Havana)": "https://www.google.com/maps/search/?api=1&query=Taqueria%20Viva%20Mexico%20Little%20Havana",
      "Taquiza (Miami Beach)": "https://www.google.com/maps/search/?api=1&query=Taquiza%20Miami%20Beach",
      "The Taco Stand (Wynwood)": "https://www.google.com/maps/search/?api=1&query=The%20Taco%20Stand%20Wynwood",
      "Uptown 66 (MiMo)": "https://www.google.com/maps/search/?api=1&query=Uptown%2066%20MiMo",
      "Wolf of Tacos (Downtown)": "https://www.google.com/maps/search/?api=1&query=Wolf%20of%20Tacos%20Downtown"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "The Taco Stand (Wynwood)",
          "Taquiza (Miami Beach)",
          "Coyo Taco (Wynwood)",
          "Wolf of Tacos (Downtown)",
          "Bodega Taqueria y Tequila (Miami Beach)",
          "Uptown 66 (MiMo)",
          "Taqueria Viva Mexico (Little Havana)",
          "Mi Rinconcito Mexicano (Little Havana)",
          "La Pasadita (Homestead)",
          "Taqueria Morelia (Florida City)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation · Best Tacos Miami 2026",
        "url": "https://www.theinfatuation.com/miami/guides/best-tacos-miami",
        "items": [
          "La Pasadita (Homestead)",
          "Chito's Red Tacos (Wynwood)",
          "Cha Cha Cha (Wynwood)",
          "Taqueria Morelia (Florida City)",
          "Taqueria Viva Mexico (Little Havana)",
          "The Taco Stand (Wynwood)",
          "Antojitos Mexicanos Tenorio (Kendall)",
          "No Manches Que Rico (Flagami)",
          "Mezquite Taqueria (Coral Way)",
          "Wolf of Tacos (Downtown)",
          "Tacos Maria (Little River)"
        ]
      },
      "newtimes": {
        "label": "Miami New Times · 10 Best Tacos (unranked) 2025",
        "unordered": true,
        "url": "https://www.miaminewtimes.com/food-drink/best-tacos-in-miami-23936123/",
        "items": [
          "Bodega Taqueria y Tequila (Miami Beach)",
          "Coyo Taco (Wynwood)",
          "Jacalito Taqueria Mexicana (Allapattah)",
          "La Santa Taqueria (Little River)",
          "Mi Rinconcito Mexicano (Little Havana)",
          "The Taco Stand (Wynwood)",
          "Taqueria Viva Mexico (Little Havana)",
          "Taquiza (Miami Beach)",
          "Uptown 66 (MiMo)",
          "Wolf of Tacos (Downtown)"
        ]
      },
      "timeout": {
        "label": "Time Out Miami · 20 Best Tacos 2024",
        "url": "https://www.timeout.com/miami/restaurants/best-tacos-miami",
        "items": [
          "Taquiza (Miami Beach)",
          "Los Felix (Coconut Grove)",
          "Wolf of Tacos (Downtown)",
          "Bakan (Wynwood)",
          "Uptown 66 (MiMo)",
          "Coyo Taco (Wynwood)",
          "Lolo's Surf Cantina (Miami Beach)",
          "Tacombi (Wynwood)",
          "The Taco Stand (Wynwood)",
          "El Primo Red Tacos (Downtown)",
          "Taqueria El Mexicano (Little Havana)",
          "Mi Rinconcito Mexicano (Little Havana)",
          "Pilo's Street Tacos (Brickell)"
        ]
      }
    },
    "vote": {
      "items": [
        "The Taco Stand (Wynwood)",
        "Taquiza (Miami Beach)",
        "Coyo Taco (Wynwood)",
        "Wolf of Tacos (Downtown)",
        "Bodega Taqueria y Tequila (Miami Beach)",
        "Uptown 66 (MiMo)",
        "Taqueria Viva Mexico (Little Havana)",
        "La Santa Taqueria (Little River)",
        "Cha Cha Cha (Wynwood)",
        "Bakan (Wynwood)"
      ]
    }
  },
  {
    "id": "tacos-boston",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-28T19:25:15Z",
    "title": "Best Tacos in Boston",
    "category": "Boston",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "Birria in East Boston, street-style at the Common, and a Waltham institution worth the drive. Proof Boston's taco game beats its reputation.",
    "defaultSource": "ai",
    "links": {
      "Chilacates (Jamaica Plain)": "https://www.google.com/maps/search/?api=1&query=Chilacates%20Jamaica%20Plain",
      "Chivo Taqueria (Cambridge)": "https://www.google.com/maps/search/?api=1&query=Chivo%20Taqueria%20Cambridge",
      "Cosmica (South End)": "https://www.google.com/maps/search/?api=1&query=Cosmica%20South%20End",
      "Dora Taqueria (Dorchester)": "https://www.google.com/maps/search/?api=1&query=Dora%20Taqueria%20Dorchester",
      "El Jefe's Taqueria (Cambridge)": "https://www.google.com/maps/search/?api=1&query=El%20Jefe%20s%20Taqueria%20Cambridge",
      "El Pelon Taqueria (Brighton)": "https://www.google.com/maps/search/?api=1&query=El%20Pelon%20Taqueria%20Brighton",
      "La Brasa (East Somerville)": "https://www.google.com/maps/search/?api=1&query=La%20Brasa%20East%20Somerville",
      "Loco Taqueria & Oyster Bar (South Boston)": "https://www.google.com/maps/search/?api=1&query=Loco%20Taqueria%20Oyster%20Bar%20South%20Boston",
      "Lolita Cocina (Back Bay)": "https://www.google.com/maps/search/?api=1&query=Lolita%20Cocina%20Back%20Bay",
      "Lone Star Taco Bar (Allston)": "https://www.google.com/maps/search/?api=1&query=Lone%20Star%20Taco%20Bar%20Allston",
      "Naco Taco (Central Square)": "https://www.google.com/maps/search/?api=1&query=Naco%20Taco%20Central%20Square",
      "Orale (Cambridge)": "https://www.google.com/maps/search/?api=1&query=Orale%20Cambridge",
      "Rincon Mexicano (East Somerville)": "https://www.google.com/maps/search/?api=1&query=Rincon%20Mexicano%20East%20Somerville",
      "Rosa Mexicano (Seaport)": "https://www.google.com/maps/search/?api=1&query=Rosa%20Mexicano%20Seaport",
      "Taqueria El Amigo (Waltham)": "https://www.google.com/maps/search/?api=1&query=Taqueria%20El%20Amigo%20Waltham",
      "Taqueria Jalisco (East Boston)": "https://www.google.com/maps/search/?api=1&query=Taqueria%20Jalisco%20East%20Boston",
      "Tenoch Mexican (North End)": "https://www.google.com/maps/search/?api=1&query=Tenoch%20Mexican%20North%20End",
      "Yellow Door Taqueria (Dorchester)": "https://www.google.com/maps/search/?api=1&query=Yellow%20Door%20Taqueria%20Dorchester"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Taqueria Jalisco (East Boston)",
          "Tenoch Mexican (North End)",
          "El Pelon Taqueria (Brighton)",
          "El Jefe's Taqueria (Cambridge)",
          "Lolita Cocina (Back Bay)",
          "Loco Taqueria & Oyster Bar (South Boston)",
          "Rincon Mexicano (East Somerville)",
          "Cosmica (South End)",
          "Taqueria El Amigo (Waltham)",
          "Naco Taco (Central Square)"
        ]
      },
      "timeout": {
        "label": "Time Out Boston · Best Tacos 2022",
        "url": "https://www.timeout.com/boston/restaurants/best-tacos-in-boston",
        "items": [
          "Taqueria Jalisco (East Boston)",
          "Taqueria El Amigo (Waltham)",
          "Tenoch Mexican (North End)",
          "Rosa Mexicano (Seaport)",
          "Yellow Door Taqueria (Dorchester)",
          "La Brasa (East Somerville)",
          "Rincon Mexicano (East Somerville)",
          "Lone Star Taco Bar (Allston)",
          "El Pelon Taqueria (Brighton)",
          "Naco Taco (Central Square)"
        ]
      },
      "sachaeats": {
        "label": "Sacha Eats · Best Tacos in Boston 2023",
        "url": "https://sachaeats.com/best-tacos-in-boston/",
        "items": [
          "El Pelon Taqueria (Brighton)",
          "Tenoch Mexican (North End)",
          "Taqueria Jalisco (East Boston)",
          "Rincon Mexicano (East Somerville)",
          "Orale (Cambridge)",
          "Lolita Cocina (Back Bay)",
          "Loco Taqueria & Oyster Bar (South Boston)",
          "Chilacates (Jamaica Plain)",
          "Dora Taqueria (Dorchester)",
          "Chivo Taqueria (Cambridge)"
        ]
      },
      "bostonnewscafe": {
        "label": "Boston News Cafe · Best Tacos 2025",
        "url": "https://bostonnewscafe.com/best-tacos-in-boston/",
        "items": [
          "El Jefe's Taqueria (Cambridge)",
          "Lolita Cocina (Back Bay)",
          "Taqueria Jalisco (East Boston)",
          "El Pelon Taqueria (Brighton)",
          "Cosmica (South End)",
          "Loco Taqueria & Oyster Bar (South Boston)",
          "Tenoch Mexican (North End)"
        ]
      }
    },
    "vote": {
      "items": [
        "Taqueria Jalisco (East Boston)",
        "Tenoch Mexican (North End)",
        "El Pelon Taqueria (Brighton)",
        "El Jefe's Taqueria (Cambridge)",
        "Lolita Cocina (Back Bay)",
        "Loco Taqueria & Oyster Bar (South Boston)",
        "Rincon Mexicano (East Somerville)",
        "Cosmica (South End)",
        "Taqueria El Amigo (Waltham)",
        "Orale (Cambridge)"
      ]
    }
  },
  {
    "id": "tacos-nyc",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-28T19:25:45Z",
    "title": "Best Tacos in NYC",
    "category": "New York",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "Chelsea Market lines, Greenpoint suadero, and birria trucks in Queens. Five boroughs, every regional style, often $5 a taco.",
    "defaultSource": "ai",
    "links": {
      "Alta Calidad (Prospect Heights)": "https://www.google.com/maps/search/?api=1&query=Alta%20Calidad%20Prospect%20Heights",
      "Amaranto (Bushwick)": "https://www.google.com/maps/search/?api=1&query=Amaranto%20Bushwick",
      "Atla (NoHo)": "https://www.google.com/maps/search/?api=1&query=Atla%20NoHo",
      "Birria-Landia (Jackson Heights)": "https://www.google.com/maps/search/?api=1&query=Birria-Landia%20Jackson%20Heights",
      "Border Town (Greenpoint)": "https://www.google.com/maps/search/?api=1&query=Border%20Town%20Greenpoint",
      "Cafe Habana (Nolita)": "https://www.google.com/maps/search/?api=1&query=Cafe%20Habana%20Nolita",
      "Carnitas Ramirez (East Village)": "https://www.google.com/maps/search/?api=1&query=Carnitas%20Ramirez%20East%20Village",
      "Casa Enrique (Long Island City)": "https://www.google.com/maps/search/?api=1&query=Casa%20Enrique%20Long%20Island%20City",
      "Cosme (Flatiron)": "https://www.google.com/maps/search/?api=1&query=Cosme%20Flatiron",
      "El Diablito Taqueria (East Village)": "https://www.google.com/maps/search/?api=1&query=El%20Diablito%20Taqueria%20East%20Village",
      "Empellon (Midtown)": "https://www.google.com/maps/search/?api=1&query=Empellon%20Midtown",
      "Empellon al Pastor (East Village)": "https://www.google.com/maps/search/?api=1&query=Empellon%20al%20Pastor%20East%20Village",
      "La Esquina (Nolita)": "https://www.google.com/maps/search/?api=1&query=La%20Esquina%20Nolita",
      "Los Mariscos (Chelsea)": "https://www.google.com/maps/search/?api=1&query=Los%20Mariscos%20Chelsea",
      "Los Tacos No. 1 (Chelsea)": "https://www.google.com/maps/search/?api=1&query=Los%20Tacos%20No.%201%20Chelsea",
      "Nenes Taqueria (Gowanus)": "https://www.google.com/maps/search/?api=1&query=Nenes%20Taqueria%20Gowanus",
      "Plaza Ortega (Bushwick)": "https://www.google.com/maps/search/?api=1&query=Plaza%20Ortega%20Bushwick",
      "Ricos Tacos (Sunset Park)": "https://www.google.com/maps/search/?api=1&query=Ricos%20Tacos%20Sunset%20Park",
      "Santo Taco (Nolita)": "https://www.google.com/maps/search/?api=1&query=Santo%20Taco%20Nolita",
      "Taco Mix (East Harlem)": "https://www.google.com/maps/search/?api=1&query=Taco%20Mix%20East%20Harlem",
      "Tacombi (Nolita)": "https://www.google.com/maps/search/?api=1&query=Tacombi%20Nolita",
      "Tacos El Bronco (Sunset Park)": "https://www.google.com/maps/search/?api=1&query=Tacos%20El%20Bronco%20Sunset%20Park",
      "Tacos Matamoros (Sunset Park)": "https://www.google.com/maps/search/?api=1&query=Tacos%20Matamoros%20Sunset%20Park",
      "Tacos Morelos (East Village)": "https://www.google.com/maps/search/?api=1&query=Tacos%20Morelos%20East%20Village",
      "Tacoway Beach (Rockaway Beach)": "https://www.google.com/maps/search/?api=1&query=Tacoway%20Beach%20Rockaway%20Beach",
      "Taqueria Al Pastor (Bushwick)": "https://www.google.com/maps/search/?api=1&query=Taqueria%20Al%20Pastor%20Bushwick",
      "Taqueria Diana (East Village)": "https://www.google.com/maps/search/?api=1&query=Taqueria%20Diana%20East%20Village",
      "Taqueria El Chato (Greenpoint)": "https://www.google.com/maps/search/?api=1&query=Taqueria%20El%20Chato%20Greenpoint",
      "Taqueria Nixtamal (Corona)": "https://www.google.com/maps/search/?api=1&query=Taqueria%20Nixtamal%20Corona",
      "Taqueria Ramirez (Greenpoint)": "https://www.google.com/maps/search/?api=1&query=Taqueria%20Ramirez%20Greenpoint",
      "Taqueria Sinaloense (Marble Hill)": "https://www.google.com/maps/search/?api=1&query=Taqueria%20Sinaloense%20Marble%20Hill",
      "Taqueria St. Marks Place (East Village)": "https://www.google.com/maps/search/?api=1&query=Taqueria%20St.%20Marks%20Place%20East%20Village",
      "Tortilleria Mexicana Los Hermanos (Bushwick)": "https://www.google.com/maps/search/?api=1&query=Tortilleria%20Mexicana%20Los%20Hermanos%20Bushwick",
      "Wayne & Sons (Williamsburg)": "https://www.google.com/maps/search/?api=1&query=Wayne%20Sons%20Williamsburg",
      "Yellow Rose (East Village)": "https://www.google.com/maps/search/?api=1&query=Yellow%20Rose%20East%20Village"
    },
    "itemLinks": {
      "Los Tacos No. 1 (Chelsea)": "https://lostacos1.com",
      "Taqueria Ramirez (Greenpoint)": "https://taqueriaramirezbk.com",
      "Birria-Landia (Jackson Heights)": "https://birrialandia.com",
      "Carnitas Ramirez (East Village)": "https://carnitasramirez.com",
      "Taqueria Diana (East Village)": "https://taqueriadiana.com",
      "Plaza Ortega (Bushwick)": "https://plazaortega.com",
      "Yellow Rose (East Village)": "https://yellowrosenyc.com",
      "Taqueria Al Pastor (Bushwick)": "https://taqueriaalpastor.com",
      "Santo Taco (Nolita)": "https://eatsantotaco.com",
      "Wayne & Sons (Williamsburg)": "https://wayneandsonsnyc.com",
      "Alta Calidad (Prospect Heights)": "https://altacalidadbk.com",
      "La Esquina (Nolita)": "https://esquinanyc.com",
      "Tacombi (Nolita)": "https://tacombi.com",
      "Empellon al Pastor (East Village)": "https://empellon.com",
      "Taco Mix (East Harlem)": "https://tacomixnewyork.com",
      "Tacos Matamoros (Sunset Park)": "https://tacosmatamoros.shop",
      "Tortilleria Mexicana Los Hermanos (Bushwick)": "https://eatrealfoodnyc.com",
      "Nenes Taqueria (Gowanus)": "https://nenestaqueriausa.com",
      "Amaranto (Bushwick)": "https://amarantobklyn.com",
      "Tacos Morelos (East Village)": "https://tacosmorelosny.com",
      "Cafe Habana (Nolita)": "https://cafehabana.com",
      "Empellon (Midtown)": "https://empellon.com",
      "Taqueria Sinaloense (Marble Hill)": "https://taqueriasinaloa.com",
      "Ricos Tacos (Sunset Park)": "https://losricostacos.com",
      "Taqueria Nixtamal (Corona)": "https://nixtamal.nyc",
      "Casa Enrique (Long Island City)": "https://casaenriquelic.com"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Los Tacos No. 1 (Chelsea)",
          "Taqueria Ramirez (Greenpoint)",
          "Birria-Landia (Jackson Heights)",
          "Tacos El Bronco (Sunset Park)",
          "Tacoway Beach (Rockaway Beach)",
          "Carnitas Ramirez (East Village)",
          "Taqueria Diana (East Village)",
          "El Diablito Taqueria (East Village)",
          "Plaza Ortega (Bushwick)",
          "Los Mariscos (Chelsea)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation · Best Tacos NYC 2026",
        "url": "https://www.theinfatuation.com/new-york/guides/best-tacos-nyc",
        "items": [
          "Taqueria Ramirez (Greenpoint)",
          "Carnitas Ramirez (East Village)",
          "Birria-Landia (Jackson Heights)",
          "Yellow Rose (East Village)",
          "Plaza Ortega (Bushwick)",
          "Taqueria Al Pastor (Bushwick)",
          "Los Mariscos (Chelsea)",
          "Santo Taco (Nolita)",
          "Tacoway Beach (Rockaway Beach)",
          "Los Tacos No. 1 (Chelsea)",
          "Taqueria El Chato (Greenpoint)",
          "Wayne & Sons (Williamsburg)",
          "Border Town (Greenpoint)",
          "Tacos El Bronco (Sunset Park)"
        ]
      },
      "timeout": {
        "label": "Time Out New York · 20 Best Tacos 2024",
        "url": "https://www.timeout.com/newyork/restaurants/best-tacos-in-nyc",
        "items": [
          "Cosme (Flatiron)",
          "Alta Calidad (Prospect Heights)",
          "Tacoway Beach (Rockaway Beach)",
          "Los Tacos No. 1 (Chelsea)",
          "Tacos El Bronco (Sunset Park)",
          "La Esquina (Nolita)",
          "Taqueria Diana (East Village)",
          "Tacombi (Nolita)",
          "Empellon al Pastor (East Village)",
          "El Diablito Taqueria (East Village)",
          "Carnitas Ramirez (East Village)",
          "Taco Mix (East Harlem)",
          "Tacos Matamoros (Sunset Park)"
        ]
      },
      "purewow": {
        "label": "PureWow · 32 Best Tacos in NYC 2023",
        "url": "https://www.purewow.com/food/best-tacos-nyc",
        "items": [
          "Tortilleria Mexicana Los Hermanos (Bushwick)",
          "Taqueria Ramirez (Greenpoint)",
          "Nenes Taqueria (Gowanus)",
          "Amaranto (Bushwick)",
          "Taqueria St. Marks Place (East Village)",
          "Tacos Morelos (East Village)",
          "Cafe Habana (Nolita)",
          "Empellon (Midtown)",
          "Taqueria Sinaloense (Marble Hill)",
          "Taqueria Diana (East Village)",
          "Tacoway Beach (Rockaway Beach)",
          "Ricos Tacos (Sunset Park)",
          "Atla (NoHo)",
          "Taqueria Nixtamal (Corona)",
          "El Diablito Taqueria (East Village)",
          "Birria-Landia (Jackson Heights)",
          "Los Tacos No. 1 (Chelsea)",
          "Casa Enrique (Long Island City)"
        ]
      }
    },
    "vote": {
      "items": [
        "Los Tacos No. 1 (Chelsea)",
        "Taqueria Ramirez (Greenpoint)",
        "Birria-Landia (Jackson Heights)",
        "Tacos El Bronco (Sunset Park)",
        "Tacoway Beach (Rockaway Beach)",
        "Carnitas Ramirez (East Village)",
        "Taqueria Diana (East Village)",
        "Yellow Rose (East Village)",
        "Casa Enrique (Long Island City)",
        "Border Town (Greenpoint)"
      ]
    }
  },
  {
    "id": "ski-resort-bars-world",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-28T22:04:51Z",
    "title": "Best Mountaintop Ski Resort Bars in the World",
    "category": "Travel",
    "type": "travel",
    "tags": [
      "bars",
      "nightlife",
      "food-drink",
      "stores",
      "entertainment",
      "travel"
    ],
    "linkType": "mapsCity",
    "blurb": "No town bars, no base lodges: only the perches you have to ride a lift or ski to reach. Summit terraces and mid-mountain huts where the party starts at altitude, from the top of the Cloud Nine lift to a glacier descent into Zermatt.",
    "defaultSource": "ai",
    "links": {
      "Cloud Nine Alpine Bistro (Aspen Highlands, USA)": "https://www.google.com/maps/search/?api=1&query=Cloud%20Nine%20Alpine%20Bistro%20Aspen%20Highlands%20Colorado",
      "Elk Camp (Snowmass, USA)": "https://www.google.com/maps/search/?api=1&query=Elk%20Camp%20Restaurant%20Snowmass%20Colorado",
      "Gorrono Ranch (Telluride, USA)": "https://www.google.com/maps/search/?api=1&query=Gorrono%20Ranch%20Telluride%20Colorado",
      "Hennu Stall (Zermatt, Switzerland)": "https://www.google.com/maps/search/?api=1&query=Hennu%20Stall%20Zermatt%20Switzerland",
      "La Folie Douce (Val d'Isère, France)": "https://www.google.com/maps/search/?api=1&query=La%20Folie%20Douce%20Val%20d%27Isere%20France",
      "Merry-Go-Round (Aspen Highlands, USA)": "https://www.google.com/maps/search/?api=1&query=Merry%20Go%20Round%20Restaurant%20Aspen%20Highlands%20Colorado",
      "Pano Bar (Les 2 Alpes, France)": "https://www.google.com/maps/search/?api=1&query=Pano%20Bar%20Les%202%20Alpes%20France",
      "Paznauer Taja (Ischgl, Austria)": "https://www.google.com/maps/search/?api=1&query=Paznauer%20Taja%20Ischgl%20Austria",
      "Schirmbar (Sölden, Austria)": "https://www.google.com/maps/search/?api=1&query=Schirmbar%20Giggijoch%20Solden%20Austria",
      "Schnapshans Bar (Zell am See, Austria)": "https://www.google.com/maps/search/?api=1&query=Schnapshans%20Bar%20Schmittenhohe%20Zell%20am%20See%20Austria",
      "The Ice Bar at Uley's Cabin (Crested Butte, USA)": "https://www.google.com/maps/search/?api=1&query=Uley%27s%20Cabin%20Crested%20Butte%20Colorado",
      "The Sundeck (Aspen, USA)": "https://www.google.com/maps/search/?api=1&query=Sundeck%20Aspen%20Mountain%20Colorado",
      "Tio Bob's (Portillo, Chile)": "https://www.google.com/maps/search/?api=1&query=Tio%20Bob%27s%20Portillo%20Chile",
      "Unbuckle at Tamarack Lodge (Heavenly, USA)": "https://www.google.com/maps/search/?api=1&query=Tamarack%20Lodge%20Unbuckle%20Apres%20Heavenly%20California"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "La Folie Douce (Val d'Isère, France)",
          "Cloud Nine Alpine Bistro (Aspen Highlands, USA)",
          "Hennu Stall (Zermatt, Switzerland)",
          "Tio Bob's (Portillo, Chile)",
          "The Ice Bar at Uley's Cabin (Crested Butte, USA)",
          "The Sundeck (Aspen, USA)",
          "Elk Camp (Snowmass, USA)",
          "Gorrono Ranch (Telluride, USA)",
          "Schnapshans Bar (Zell am See, Austria)",
          "Paznauer Taja (Ischgl, Austria)"
        ]
      },
      "snowtrex": {
        "label": "SnowTrex · Top 20 Après Ski Bars in the Alps 2024 (on-mountain only)",
        "url": "https://www.snowtrex.co.uk/magazine/apres-ski/apres-ski-bars/",
        "items": [
          "Schnapshans Bar (Zell am See, Austria)",
          "Paznauer Taja (Ischgl, Austria)",
          "La Folie Douce (Val d'Isère, France)",
          "Hennu Stall (Zermatt, Switzerland)",
          "Pano Bar (Les 2 Alpes, France)",
          "Schirmbar (Sölden, Austria)"
        ]
      },
      "scout": {
        "label": "Scout Ski · World's Best Ski Resort Bars 2020 (on-mountain only)",
        "url": "https://scoutski.com/worlds-best-ski-resort-bars",
        "items": [
          "Tio Bob's (Portillo, Chile)",
          "Cloud Nine Alpine Bistro (Aspen Highlands, USA)",
          "La Folie Douce (Val d'Isère, France)",
          "Hennu Stall (Zermatt, Switzerland)"
        ]
      },
      "mensjournal": {
        "label": "Men's Journal · 10 Best Ski-In Ski-Out Bars 2020 (on-mountain only)",
        "url": "https://www.mensjournal.com/travel/the-10-best-ski-in-ski-out-bars-in-the-world-for-the-wildest-apres-ski",
        "items": [
          "The Ice Bar at Uley's Cabin (Crested Butte, USA)",
          "Cloud Nine Alpine Bistro (Aspen Highlands, USA)",
          "La Folie Douce (Val d'Isère, France)",
          "Gorrono Ranch (Telluride, USA)",
          "Hennu Stall (Zermatt, Switzerland)",
          "Unbuckle at Tamarack Lodge (Heavenly, USA)"
        ]
      },
      "onthesnow": {
        "label": "OnTheSnow · Best Après-Ski in the World 2025 (on-mountain only)",
        "url": "https://www.onthesnow.co.uk/news/best-apres-ski-in-the-world/",
        "items": [
          "La Folie Douce (Val d'Isère, France)",
          "Cloud Nine Alpine Bistro (Aspen Highlands, USA)",
          "Elk Camp (Snowmass, USA)",
          "The Sundeck (Aspen, USA)",
          "Merry-Go-Round (Aspen Highlands, USA)"
        ],
        "unordered": true
      }
    },
    "vote": {
      "items": [
        "La Folie Douce (Val d'Isère, France)",
        "Cloud Nine Alpine Bistro (Aspen Highlands, USA)",
        "Hennu Stall (Zermatt, Switzerland)",
        "Tio Bob's (Portillo, Chile)",
        "The Ice Bar at Uley's Cabin (Crested Butte, USA)",
        "The Sundeck (Aspen, USA)",
        "Elk Camp (Snowmass, USA)",
        "Gorrono Ranch (Telluride, USA)",
        "Schnapshans Bar (Zell am See, Austria)",
        "Paznauer Taja (Ischgl, Austria)"
      ]
    }
  },
  {
    "id": "best-business-leader-biopics",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-28T23:01:40Z",
    "title": "Best Business Leader Biopics",
    "category": "Film",
    "type": "entertainment",
    "tags": [
      "entertainment"
    ],
    "linkType": "imdb",
    "blurb": "Boardrooms, betrayals, and billion-dollar bets. These films and documentaries chronicle the real figures who built the companies, brands, and fortunes that shaped the modern world, from Silicon Valley garages to fast-food franchises to Wall Street trading floors.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "The Social Network",
          "The Founder",
          "Steve Jobs",
          "BlackBerry (2023)",
          "Air (2023)",
          "Tetris (2023)",
          "Pirates of Silicon Valley",
          "Moneyball",
          "Joy (2015)",
          "Flash of Genius"
        ]
      },
      "collider": {
        "label": "Collider · Brand Biopics 2023",
        "url": "https://collider.com/best-brand-biopics/",
        "items": [
          "BlackBerry (2023)",
          "The Social Network",
          "Air (2023)",
          "Pirates of Silicon Valley",
          "Steve Jobs",
          "Tetris (2023)",
          "The Founder"
        ]
      },
      "byvi": {
        "label": "BYVI · Best Entrepreneur Movies 2024",
        "url": "https://byvi.co/2024/01/23/movies-about-entrepreneurs-and-startups/",
        "items": [
          "The Social Network",
          "Tetris (2023)",
          "The Founder",
          "Joy (2015)",
          "BlackBerry (2023)",
          "Moneyball",
          "Steve Jobs",
          "Pirates of Silicon Valley",
          "The Inventor: Out for Blood in Silicon Valley"
        ]
      },
      "growthnavigate": {
        "label": "Growth Navigate · Best Business Movies 2024",
        "url": "https://www.growthnavigate.com/best-business-movies-for-entrepreneurs",
        "items": [
          "The Founder",
          "The Social Network",
          "Pirates of Silicon Valley",
          "Flash of Genius"
        ]
      }
    },
    "vote": {
      "items": [
        "The Social Network",
        "The Founder",
        "Steve Jobs",
        "BlackBerry (2023)",
        "Air (2023)",
        "Tetris (2023)",
        "Pirates of Silicon Valley",
        "Moneyball",
        "Joy (2015)",
        "Flash of Genius"
      ]
    }
  },
  {
    "id": "best-business-leader-biographies",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-28T23:16:43Z",
    "title": "Best Business Leader Biographies",
    "category": "Books",
    "type": "product",
    "tags": [
      "entertainment",
      "product"
    ],
    "linkType": "amazon",
    "blurb": "From bootstrapped startups to trillion-dollar empires, these are the stories of the founders, CEOs, and moguls who remade industries from scratch. The books business leaders keep recommending to each other.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Shoe Dog (Phil Knight)",
          "Steve Jobs (Walter Isaacson)",
          "The Everything Store (Brad Stone)",
          "Elon Musk (Ashlee Vance)",
          "Sam Walton: Made in America",
          "The Ride of a Lifetime (Bob Iger)",
          "Titan: The Life of John D. Rockefeller",
          "Bad Blood (Elizabeth Holmes)",
          "Delivering Happiness (Tony Hsieh)",
          "The Snowball (Warren Buffett)",
          "Grinding It Out (Ray Kroc)",
          "Pour Your Heart Into It (Howard Schultz)"
        ]
      },
      "failory": {
        "label": "Failory Best Business Biographies 2026",
        "url": "https://www.failory.com/blog/business-biographies",
        "items": [
          "Alibaba: The House That Jack Ma Built",
          "Onward (Howard Schultz)",
          "Steve Jobs (Walter Isaacson)",
          "Shoe Dog (Phil Knight)",
          "Titan: The Life of John D. Rockefeller",
          "Made in Japan: Akio Morita and Sony",
          "The Everything Store (Brad Stone)",
          "Sam Walton: Made in America",
          "Elon Musk (Ashlee Vance)",
          "The Snowball (Warren Buffett)",
          "Morgan: American Financier",
          "Bloomberg by Bloomberg",
          "Carnegie (Andrew Carnegie)",
          "iWoz (Steve Wozniak)",
          "My Life and Work (Henry Ford)",
          "Commodore: The Life of Cornelius Vanderbilt",
          "Jack: Straight from the Gut (Jack Welch)",
          "Delivering Happiness (Tony Hsieh)",
          "Iacocca: An Autobiography",
          "American Icon: Alan Mulally",
          "The Man Who Solved the Market (Jim Simons)",
          "The Animated Man: A Life of Walt Disney",
          "The Ride of a Lifetime (Bob Iger)"
        ]
      },
      "shortform": {
        "label": "Shortform 100 Best Business Biographies 2025",
        "url": "https://www.shortform.com/best-books/genre/best-business-biography-books-of-all-time",
        "items": [
          "Shoe Dog (Phil Knight)",
          "Elon Musk (Ashlee Vance)",
          "Steve Jobs (Walter Isaacson)",
          "The Everything Store (Brad Stone)",
          "Sam Walton: Made in America"
        ]
      },
      "damianqualter": {
        "label": "Damian Qualter Top Business Autobiographies 2023",
        "url": "https://damianqualter.com/infusionsoft/top-10-business-autobiographies/",
        "items": [
          "Shoe Dog (Phil Knight)",
          "Elon Musk (Ashlee Vance)",
          "The Everything Store (Brad Stone)",
          "Losing My Virginity (Richard Branson)",
          "Pour Your Heart Into It (Howard Schultz)",
          "Sam Walton: Made in America",
          "Steve Jobs (Walter Isaacson)",
          "Grinding It Out (Ray Kroc)",
          "Creativity, Inc. (Ed Catmull)"
        ]
      }
    },
    "vote": {
      "items": [
        "Shoe Dog (Phil Knight)",
        "Steve Jobs (Walter Isaacson)",
        "The Everything Store (Brad Stone)",
        "Elon Musk (Ashlee Vance)",
        "Sam Walton: Made in America",
        "The Ride of a Lifetime (Bob Iger)",
        "Titan: The Life of John D. Rockefeller",
        "Bad Blood (Elizabeth Holmes)",
        "Delivering Happiness (Tony Hsieh)",
        "The Snowball (Warren Buffett)"
      ]
    }
  },
  {
    "id": "burgers-atlanta",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-29T03:12:53Z",
    "title": "Best Burgers in Atlanta",
    "category": "Atlanta",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "Smash patties in Dunwoody, dry-aged blends in Midtown, and griddle classics from Decatur to Cabbagetown. Atlanta's most acclaimed burgers, by consensus.",
    "defaultSource": "ai",
    "links": {
      "Burger Crush (Smyrna)": "https://www.google.com/maps/search/?api=1&query=Burger%20Crush%20Smyrna%20Atlanta%20GA",
      "Che Butter Jonez (Brookhaven)": "https://www.google.com/maps/search/?api=1&query=Che%20Butter%20Jonez%20Brookhaven%20Atlanta%20GA",
      "Evergreen Butcher + Baker (Kirkwood)": "https://www.google.com/maps/search/?api=1&query=Evergreen%20Butcher%20%2B%20Baker%20Kirkwood%20Atlanta%20GA",
      "Foundation Social Eatery (Alpharetta)": "https://www.google.com/maps/search/?api=1&query=Foundation%20Social%20Eatery%20Alpharetta%20Atlanta%20GA",
      "Fred's Meat & Bread (Inman Park)": "https://www.google.com/maps/search/?api=1&query=Fred%20s%20Meat%20Bread%20Inman%20Park%20Atlanta%20GA",
      "Grindhouse Killer Burgers (Grant Park)": "https://www.google.com/maps/search/?api=1&query=Grindhouse%20Killer%20Burgers%20Grant%20Park%20Atlanta%20GA",
      "Holeman & Finch (Midtown)": "https://www.google.com/maps/search/?api=1&query=Holeman%20Finch%20Midtown%20Atlanta%20GA",
      "Hopdoddy Burger Bar (Buckhead)": "https://www.google.com/maps/search/?api=1&query=Hopdoddy%20Burger%20Bar%20Buckhead%20Atlanta%20GA",
      "LOL Burger Bar (Westside)": "https://www.google.com/maps/search/?api=1&query=LOL%20Burger%20Bar%20Westside%20Atlanta%20GA",
      "Little's Food Store (Cabbagetown)": "https://www.google.com/maps/search/?api=1&query=Little%20s%20Food%20Store%20Cabbagetown%20Atlanta%20GA",
      "Mister Burger (Buckhead)": "https://www.google.com/maps/search/?api=1&query=Mister%20Burger%20Buckhead%20Atlanta%20GA",
      "NFA Burger (Dunwoody)": "https://www.google.com/maps/search/?api=1&query=NFA%20Burger%20Dunwoody%20Atlanta%20GA",
      "Slutty Vegan (Westview)": "https://www.google.com/maps/search/?api=1&query=Slutty%20Vegan%20Westview%20Atlanta%20GA",
      "Smiley's Burger Club (Decatur)": "https://www.google.com/maps/search/?api=1&query=Smiley%20s%20Burger%20Club%20Decatur%20Atlanta%20GA",
      "Sugar Loaf Bakery & Cafe (Reynoldstown)": "https://www.google.com/maps/search/?api=1&query=Sugar%20Loaf%20Bakery%20Cafe%20Reynoldstown%20Atlanta%20GA",
      "The Chastain (Buckhead)": "https://www.google.com/maps/search/?api=1&query=The%20Chastain%20Buckhead%20Atlanta%20GA",
      "The Vortex (Little Five Points)": "https://www.google.com/maps/search/?api=1&query=The%20Vortex%20Little%20Five%20Points%20Atlanta%20GA",
      "Trap Wingz (Westside)": "https://www.google.com/maps/search/?api=1&query=Trap%20Wingz%20Westside%20Atlanta%20GA",
      "Wahoo Grill (Decatur)": "https://www.google.com/maps/search/?api=1&query=Wahoo%20Grill%20Decatur%20Atlanta%20GA"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "NFA Burger (Dunwoody)",
          "Fred's Meat & Bread (Inman Park)",
          "Smiley's Burger Club (Decatur)",
          "Che Butter Jonez (Brookhaven)",
          "Holeman & Finch (Midtown)",
          "The Chastain (Buckhead)",
          "Evergreen Butcher + Baker (Kirkwood)",
          "Grindhouse Killer Burgers (Grant Park)",
          "Little's Food Store (Cabbagetown)",
          "LOL Burger Bar (Westside)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation · 13 Best Burgers in Atlanta 2026",
        "url": "https://www.theinfatuation.com/atlanta/guides/best-burgers-atlanta",
        "items": [
          "Smiley's Burger Club (Decatur)",
          "NFA Burger (Dunwoody)",
          "Che Butter Jonez (Brookhaven)",
          "Sugar Loaf Bakery & Cafe (Reynoldstown)",
          "Wahoo Grill (Decatur)",
          "LOL Burger Bar (Westside)",
          "The Chastain (Buckhead)",
          "Holeman & Finch (Midtown)",
          "Foundation Social Eatery (Alpharetta)",
          "Fred's Meat & Bread (Inman Park)",
          "Evergreen Butcher + Baker (Kirkwood)",
          "Grindhouse Killer Burgers (Grant Park)",
          "Little's Food Store (Cabbagetown)"
        ]
      },
      "infatuationsmash": {
        "label": "The Infatuation · Best Smashburgers in Atlanta (by score) 2026",
        "url": "https://www.theinfatuation.com/atlanta/guides/best-smashburgers-atlanta",
        "items": [
          "NFA Burger (Dunwoody)",
          "Fred's Meat & Bread (Inman Park)",
          "Smiley's Burger Club (Decatur)",
          "Che Butter Jonez (Brookhaven)",
          "Burger Crush (Smyrna)",
          "Trap Wingz (Westside)",
          "Mister Burger (Buckhead)"
        ]
      },
      "atlantaeats": {
        "label": "Atlanta Eats · Steak Shapiro's Top Burgers (unranked) 2024",
        "unordered": true,
        "url": "https://www.atlantaeats.com/blog/top-fifteen-burgers-in-atlanta/",
        "items": [
          "The Chastain (Buckhead)",
          "Evergreen Butcher + Baker (Kirkwood)",
          "Fred's Meat & Bread (Inman Park)",
          "Grindhouse Killer Burgers (Grant Park)",
          "Holeman & Finch (Midtown)",
          "Hopdoddy Burger Bar (Buckhead)",
          "NFA Burger (Dunwoody)",
          "Slutty Vegan (Westview)",
          "The Vortex (Little Five Points)"
        ]
      }
    },
    "vote": {
      "items": [
        "NFA Burger (Dunwoody)",
        "Fred's Meat & Bread (Inman Park)",
        "Smiley's Burger Club (Decatur)",
        "Holeman & Finch (Midtown)",
        "The Chastain (Buckhead)",
        "Che Butter Jonez (Brookhaven)",
        "Evergreen Butcher + Baker (Kirkwood)",
        "Grindhouse Killer Burgers (Grant Park)",
        "The Vortex (Little Five Points)",
        "Little's Food Store (Cabbagetown)"
      ]
    }
  },
  {
    "id": "burgers-miami",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-29T03:12:54Z",
    "title": "Best Burgers in Miami",
    "category": "Miami",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "Smash stacks in Little River, diner classics in the Grove, and wagyu blends downtown. Miami's most-praised burgers, by consensus.",
    "defaultSource": "ai",
    "links": {
      "Are You Hungry Grill (West Kendall)": "https://www.google.com/maps/search/?api=1&query=Are%20You%20Hungry%20Grill%20West%20Kendall%20Miami%20FL",
      "Babe's Meat & Counter (Miami Shores)": "https://www.google.com/maps/search/?api=1&query=Babe%20s%20Meat%20Counter%20Miami%20Shores%20Miami%20FL",
      "Blue Collar (MiMo)": "https://www.google.com/maps/search/?api=1&query=Blue%20Collar%20MiMo%20Miami%20FL",
      "Burgermeister (Brickell)": "https://www.google.com/maps/search/?api=1&query=Burgermeister%20Brickell%20Miami%20FL",
      "Chug's Diner (Coconut Grove)": "https://www.google.com/maps/search/?api=1&query=Chug%20s%20Diner%20Coconut%20Grove%20Miami%20FL",
      "Cowy Burger (Wynwood)": "https://www.google.com/maps/search/?api=1&query=Cowy%20Burger%20Wynwood%20Miami%20FL",
      "Cuento Sandwiches (Doral)": "https://www.google.com/maps/search/?api=1&query=Cuento%20Sandwiches%20Doral%20Miami%20FL",
      "Daniel's Miami (Coral Gables)": "https://www.google.com/maps/search/?api=1&query=Daniel%20s%20Miami%20Coral%20Gables%20Miami%20FL",
      "Edan Bistro (Coral Gables)": "https://www.google.com/maps/search/?api=1&query=Edan%20Bistro%20Coral%20Gables%20Miami%20FL",
      "El Mago de las Fritas (Westchester)": "https://www.google.com/maps/search/?api=1&query=El%20Mago%20de%20las%20Fritas%20Westchester%20Miami%20FL",
      "Gramps Getaway (Wynwood)": "https://www.google.com/maps/search/?api=1&query=Gramps%20Getaway%20Wynwood%20Miami%20FL",
      "La Birra Bar (North Miami Beach)": "https://www.google.com/maps/search/?api=1&query=La%20Birra%20Bar%20North%20Miami%20Beach%20Miami%20FL",
      "Le Chick (Wynwood)": "https://www.google.com/maps/search/?api=1&query=Le%20Chick%20Wynwood%20Miami%20FL",
      "Le Tub Saloon (Hollywood)": "https://www.google.com/maps/search/?api=1&query=Le%20Tub%20Saloon%20Hollywood%20Miami%20FL",
      "Motek Cafe (Downtown)": "https://www.google.com/maps/search/?api=1&query=Motek%20Cafe%20Downtown%20Miami%20FL",
      "No Seasons (Little River)": "https://www.google.com/maps/search/?api=1&query=No%20Seasons%20Little%20River%20Miami%20FL",
      "Over Under (Downtown)": "https://www.google.com/maps/search/?api=1&query=Over%20Under%20Downtown%20Miami%20FL",
      "Pinch Kitchen (MiMo)": "https://www.google.com/maps/search/?api=1&query=Pinch%20Kitchen%20MiMo%20Miami%20FL",
      "Pincho Factory (Coral Gables)": "https://www.google.com/maps/search/?api=1&query=Pincho%20Factory%20Coral%20Gables%20Miami%20FL",
      "Proper Sausages (Miami Shores)": "https://www.google.com/maps/search/?api=1&query=Proper%20Sausages%20Miami%20Shores%20Miami%20FL",
      "Silverlake Bistro (Miami Beach)": "https://www.google.com/maps/search/?api=1&query=Silverlake%20Bistro%20Miami%20Beach%20Miami%20FL",
      "Skinny Louie (Wynwood)": "https://www.google.com/maps/search/?api=1&query=Skinny%20Louie%20Wynwood%20Miami%20FL",
      "Smoke and Dough (West Kendall)": "https://www.google.com/maps/search/?api=1&query=Smoke%20and%20Dough%20West%20Kendall%20Miami%20FL",
      "Ted's Burgers (Wynwood)": "https://www.google.com/maps/search/?api=1&query=Ted%20s%20Burgers%20Wynwood%20Miami%20FL",
      "The Gibson Room (Miami Beach)": "https://www.google.com/maps/search/?api=1&query=The%20Gibson%20Room%20Miami%20Beach%20Miami%20FL",
      "United States Burger Service (Little River)": "https://www.google.com/maps/search/?api=1&query=United%20States%20Burger%20Service%20Little%20River%20Miami%20FL",
      "ViceVersa (Downtown)": "https://www.google.com/maps/search/?api=1&query=ViceVersa%20Downtown%20Miami%20FL"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "United States Burger Service (Little River)",
          "Over Under (Downtown)",
          "Blue Collar (MiMo)",
          "Silverlake Bistro (Miami Beach)",
          "Cuento Sandwiches (Doral)",
          "Cowy Burger (Wynwood)",
          "Chug's Diner (Coconut Grove)",
          "ViceVersa (Downtown)",
          "Pinch Kitchen (MiMo)",
          "La Birra Bar (North Miami Beach)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation · Best Burgers in Miami (by score) 2026",
        "url": "https://www.theinfatuation.com/miami/guides/best-burgers-miami",
        "items": [
          "ViceVersa (Downtown)",
          "Cowy Burger (Wynwood)",
          "Silverlake Bistro (Miami Beach)",
          "Over Under (Downtown)",
          "Cuento Sandwiches (Doral)",
          "Daniel's Miami (Coral Gables)",
          "Gramps Getaway (Wynwood)",
          "Pinch Kitchen (MiMo)",
          "The Gibson Room (Miami Beach)",
          "No Seasons (Little River)",
          "Blue Collar (MiMo)",
          "United States Burger Service (Little River)",
          "Babe's Meat & Counter (Miami Shores)",
          "Edan Bistro (Coral Gables)"
        ]
      },
      "timeout": {
        "label": "Time Out Miami · 15 Best Burgers 2024",
        "url": "https://www.timeout.com/miami/restaurants/best-burgers-in-miami",
        "items": [
          "United States Burger Service (Little River)",
          "Over Under (Downtown)",
          "Chug's Diner (Coconut Grove)",
          "Blue Collar (MiMo)",
          "No Seasons (Little River)",
          "La Birra Bar (North Miami Beach)",
          "Motek Cafe (Downtown)",
          "Proper Sausages (Miami Shores)",
          "El Mago de las Fritas (Westchester)",
          "Le Tub Saloon (Hollywood)",
          "Le Chick (Wynwood)",
          "Silverlake Bistro (Miami Beach)",
          "Skinny Louie (Wynwood)",
          "Pinch Kitchen (MiMo)",
          "Pincho Factory (Coral Gables)"
        ]
      },
      "burgerbeast": {
        "label": "Burger Beast · Best Burgers in Miami (unranked) 2026",
        "unordered": true,
        "url": "https://burgerbeast.com/best-burgers-miami/",
        "items": [
          "Are You Hungry Grill (West Kendall)",
          "Babe's Meat & Counter (Miami Shores)",
          "Chug's Diner (Coconut Grove)",
          "La Birra Bar (North Miami Beach)",
          "Burgermeister (Brickell)",
          "Cuento Sandwiches (Doral)",
          "Smoke and Dough (West Kendall)",
          "Ted's Burgers (Wynwood)",
          "United States Burger Service (Little River)"
        ]
      }
    },
    "vote": {
      "items": [
        "United States Burger Service (Little River)",
        "Blue Collar (MiMo)",
        "Ted's Burgers (Wynwood)",
        "Over Under (Downtown)",
        "Cuento Sandwiches (Doral)",
        "Chug's Diner (Coconut Grove)",
        "La Birra Bar (North Miami Beach)",
        "Cowy Burger (Wynwood)",
        "Pinch Kitchen (MiMo)",
        "El Mago de las Fritas (Westchester)"
      ]
    }
  },
  {
    "id": "burgers-nyc",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-29T03:12:55Z",
    "title": "Best Burgers in NYC",
    "category": "New York",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "Dry-aged tavern burgers in the West Village, smash classics on the Lower East Side, and steakhouse legends in Midtown. New York's best burgers, by consensus.",
    "defaultSource": "ai",
    "links": {
      "4 Charles Prime Rib (West Village)": "https://www.google.com/maps/search/?api=1&query=4%20Charles%20Prime%20Rib%20West%20Village%20New%20York%20NY",
      "7th Street Burger (East Village)": "https://www.google.com/maps/search/?api=1&query=7th%20Street%20Burger%20East%20Village%20New%20York%20NY",
      "BK Jani (Williamsburg)": "https://www.google.com/maps/search/?api=1&query=BK%20Jani%20Williamsburg%20New%20York%20NY",
      "Blue Collar Burger (Bushwick)": "https://www.google.com/maps/search/?api=1&query=Blue%20Collar%20Burger%20Bushwick%20New%20York%20NY",
      "Brindle Room (East Village)": "https://www.google.com/maps/search/?api=1&query=Brindle%20Room%20East%20Village%20New%20York%20NY",
      "Burger By Day (Chinatown)": "https://www.google.com/maps/search/?api=1&query=Burger%20By%20Day%20Chinatown%20New%20York%20NY",
      "Cervo's (Lower East Side)": "https://www.google.com/maps/search/?api=1&query=Cervo%20s%20Lower%20East%20Side%20New%20York%20NY",
      "Cozy Royale (Williamsburg)": "https://www.google.com/maps/search/?api=1&query=Cozy%20Royale%20Williamsburg%20New%20York%20NY",
      "Crane Club (Chelsea)": "https://www.google.com/maps/search/?api=1&query=Crane%20Club%20Chelsea%20New%20York%20NY",
      "Deux Luxe (Nolita)": "https://www.google.com/maps/search/?api=1&query=Deux%20Luxe%20Nolita%20New%20York%20NY",
      "Diner (Williamsburg)": "https://www.google.com/maps/search/?api=1&query=Diner%20Williamsburg%20New%20York%20NY",
      "Gertrude's (Prospect Heights)": "https://www.google.com/maps/search/?api=1&query=Gertrude%20s%20Prospect%20Heights%20New%20York%20NY",
      "Gotham Burger Social Club (Lower East Side)": "https://www.google.com/maps/search/?api=1&query=Gotham%20Burger%20Social%20Club%20Lower%20East%20Side%20New%20York%20NY",
      "Hamburger America (Soho)": "https://www.google.com/maps/search/?api=1&query=Hamburger%20America%20Soho%20New%20York%20NY",
      "Harlem Shake (Harlem)": "https://www.google.com/maps/search/?api=1&query=Harlem%20Shake%20Harlem%20New%20York%20NY",
      "J.G. Melon (Upper East Side)": "https://www.google.com/maps/search/?api=1&query=J%20G%20Melon%20Upper%20East%20Side%20New%20York%20NY",
      "Keens Steakhouse (Midtown)": "https://www.google.com/maps/search/?api=1&query=Keens%20Steakhouse%20Midtown%20New%20York%20NY",
      "L'Artusi (West Village)": "https://www.google.com/maps/search/?api=1&query=L%20Artusi%20West%20Village%20New%20York%20NY",
      "Lord's (Greenwich Village)": "https://www.google.com/maps/search/?api=1&query=Lord%20s%20Greenwich%20Village%20New%20York%20NY",
      "Lovely's Old Fashioned (Hell's Kitchen)": "https://www.google.com/maps/search/?api=1&query=Lovely%20s%20Old%20Fashioned%20Hell%20s%20Kitchen%20New%20York%20NY",
      "Manhatta (Financial District)": "https://www.google.com/maps/search/?api=1&query=Manhatta%20Financial%20District%20New%20York%20NY",
      "Milady's (Soho)": "https://www.google.com/maps/search/?api=1&query=Milady%20s%20Soho%20New%20York%20NY",
      "Minetta Tavern (Greenwich Village)": "https://www.google.com/maps/search/?api=1&query=Minetta%20Tavern%20Greenwich%20Village%20New%20York%20NY",
      "Nowon (East Village)": "https://www.google.com/maps/search/?api=1&query=Nowon%20East%20Village%20New%20York%20NY",
      "Peter Luger (Williamsburg)": "https://www.google.com/maps/search/?api=1&query=Peter%20Luger%20Williamsburg%20New%20York%20NY",
      "Raoul's (Soho)": "https://www.google.com/maps/search/?api=1&query=Raoul%20s%20Soho%20New%20York%20NY",
      "Red Hook Tavern (Red Hook)": "https://www.google.com/maps/search/?api=1&query=Red%20Hook%20Tavern%20Red%20Hook%20New%20York%20NY",
      "Saigon Social (Lower East Side)": "https://www.google.com/maps/search/?api=1&query=Saigon%20Social%20Lower%20East%20Side%20New%20York%20NY",
      "Sip & Guzzle (West Village)": "https://www.google.com/maps/search/?api=1&query=Sip%20Guzzle%20West%20Village%20New%20York%20NY",
      "Smacking Burger (West Village)": "https://www.google.com/maps/search/?api=1&query=Smacking%20Burger%20West%20Village%20New%20York%20NY",
      "Smashed (West Village)": "https://www.google.com/maps/search/?api=1&query=Smashed%20West%20Village%20New%20York%20NY",
      "The Long Island Bar (Cobble Hill)": "https://www.google.com/maps/search/?api=1&query=The%20Long%20Island%20Bar%20Cobble%20Hill%20New%20York%20NY",
      "Rolo's (Ridgewood)": "https://www.google.com/maps/search/?api=1&query=Rolo%27s%20Ridgewood%20Queens%20New%20York%20NY",
      "Virginia's (East Village)": "https://www.google.com/maps/search/?api=1&query=Virginia%27s%20East%20Village%20New%20York%20NY",
      "The Lions Bar & Grill (East Village)": "https://www.google.com/maps/search/?api=1&query=The%20Lions%20Bar%20Grill%20East%20Village%20New%20York%20NY",
      "Fairfax (West Village)": "https://www.google.com/maps/search/?api=1&query=Fairfax%20West%20Village%20New%20York%20NY"
    },
    "itemLinks": {
      "Red Hook Tavern (Red Hook)": "https://redhooktavern.com",
      "4 Charles Prime Rib (West Village)": "https://nycprimerib.com",
      "Nowon (East Village)": "https://nowonusa.com",
      "Rolo's (Ridgewood)": "https://rolosnyc.com",
      "Hamburger America (Soho)": "https://hamburgeramerica.com",
      "Sip & Guzzle (West Village)": "https://sipandguzzlenyc.com",
      "Gotham Burger Social Club (Lower East Side)": "https://gbsc.nyc",
      "Deux Luxe (Nolita)": "https://deuxluxeny.com",
      "Minetta Tavern (Greenwich Village)": "https://minettatavernny.com",
      "Crane Club (Chelsea)": "https://www.taogroup.com/venues/crane-club-restaurant-new-york/",
      "Keens Steakhouse (Midtown)": "https://keens.com",
      "Cervo's (Lower East Side)": "https://cervosnyc.com",
      "Raoul's (Soho)": "https://raouls.com",
      "BK Jani (Williamsburg)": "https://bkjani.com",
      "L'Artusi (West Village)": "https://lartusi.com",
      "Saigon Social (Lower East Side)": "https://saigonsocialnyc.com",
      "Lord's (Greenwich Village)": "https://lordsenglish.com",
      "Brindle Room (East Village)": "https://brindleroomny.com",
      "Smashed (West Village)": "https://smashednyc.com",
      "Harlem Shake (Harlem)": "https://harlemshake.com",
      "Diner (Williamsburg)": "https://dinernyc.com",
      "Lovely's Old Fashioned (Hell's Kitchen)": "https://lovelysoldfashioned.com",
      "Cozy Royale (Williamsburg)": "https://cozyroyale.com",
      "Manhatta (Financial District)": "https://manhattarestaurant.com",
      "Smacking Burger (West Village)": "https://smackingburger.com",
      "The Long Island Bar (Cobble Hill)": "https://thelongislandbar.com",
      "Gertrude's (Prospect Heights)": "https://gertrudes.nyc",
      "J.G. Melon (Upper East Side)": "https://jgmelon-nyc.com",
      "Milady's (Soho)": "https://miladysnyc.com",
      "Peter Luger (Williamsburg)": "https://peterluger.com",
      "Virginia's (East Village)": "https://virginiasnyc.com",
      "The Lions Bar & Grill (East Village)": "https://thelionsbar.com",
      "Fairfax (West Village)": "https://fairfax.nyc"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Red Hook Tavern (Red Hook)",
          "4 Charles Prime Rib (West Village)",
          "Nowon (East Village)",
          "Rolo's (Ridgewood)",
          "Hamburger America (Soho)",
          "Sip & Guzzle (West Village)",
          "Gotham Burger Social Club (Lower East Side)",
          "Deux Luxe (Nolita)",
          "Minetta Tavern (Greenwich Village)",
          "Crane Club (Chelsea)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation · 20 Best Burgers in NYC (by score) 2026",
        "url": "https://www.theinfatuation.com/new-york/guides/best-burger-nyc",
        "items": [
          "Red Hook Tavern (Red Hook)",
          "Keens Steakhouse (Midtown)",
          "Cervo's (Lower East Side)",
          "Minetta Tavern (Greenwich Village)",
          "Raoul's (Soho)",
          "4 Charles Prime Rib (West Village)",
          "BK Jani (Williamsburg)",
          "L'Artusi (West Village)",
          "Nowon (East Village)",
          "Gotham Burger Social Club (Lower East Side)",
          "Saigon Social (Lower East Side)",
          "Burger By Day (Chinatown)",
          "Lord's (Greenwich Village)",
          "Brindle Room (East Village)",
          "Smashed (West Village)",
          "Harlem Shake (Harlem)",
          "Diner (Williamsburg)",
          "Lovely's Old Fashioned (Hell's Kitchen)",
          "Cozy Royale (Williamsburg)",
          "Manhatta (Financial District)"
        ]
      },
      "timeout": {
        "label": "Time Out New York · 16 Best Burgers 2025",
        "url": "https://www.timeout.com/newyork/restaurants/best-burgers-nyc",
        "items": [
          "Deux Luxe (Nolita)",
          "Crane Club (Chelsea)",
          "Smacking Burger (West Village)",
          "Hamburger America (Soho)",
          "Sip & Guzzle (West Village)",
          "The Long Island Bar (Cobble Hill)",
          "Red Hook Tavern (Red Hook)",
          "7th Street Burger (East Village)",
          "Minetta Tavern (Greenwich Village)",
          "Nowon (East Village)",
          "Gertrude's (Prospect Heights)",
          "J.G. Melon (Upper East Side)",
          "Blue Collar Burger (Bushwick)",
          "Raoul's (Soho)",
          "Milady's (Soho)",
          "Peter Luger (Williamsburg)"
        ]
      },
      "worldsbest": {
        "label": "Time Out · World's Best Burgers, NYC entries 2025",
        "url": "https://www.timeout.com/newyork/news/four-of-the-best-burgers-in-the-world-are-officially-in-nyc-091825",
        "items": [
          "Sip & Guzzle (West Village)",
          "Nowon (East Village)",
          "Red Hook Tavern (Red Hook)",
          "4 Charles Prime Rib (West Village)"
        ]
      },
      "johnnynovo": {
        "label": "Johnny Novo · NYC Burgers Ranked (by rating) 2026",
        "url": "https://www.johnnynovo.com/rankings/fa78a034-31bb-4ba1-8894-2f0e9de41a58",
        "trueExpert": true,
        "items": [
          "Red Hook Tavern (Red Hook)",
          "Rolo's (Ridgewood)",
          "4 Charles Prime Rib (West Village)",
          "Nowon (East Village)",
          "Gotham Burger Social Club (Lower East Side)",
          "Hamburger America (Soho)",
          "Virginia's (East Village)",
          "The Lions Bar & Grill (East Village)",
          "Fairfax (West Village)"
        ]
      }
    },
    "vote": {
      "items": [
        "Red Hook Tavern (Red Hook)",
        "4 Charles Prime Rib (West Village)",
        "Nowon (East Village)",
        "Rolo's (Ridgewood)",
        "Hamburger America (Soho)",
        "Sip & Guzzle (West Village)",
        "Gotham Burger Social Club (Lower East Side)",
        "Deux Luxe (Nolita)",
        "Minetta Tavern (Greenwich Village)",
        "Crane Club (Chelsea)"
      ]
    }
  },
  {
    "id": "burgers-austin",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-29T03:12:56Z",
    "title": "Best Burgers in Austin",
    "category": "Austin",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "Oklahoma-onion smashers in South Austin, wood-grilled patties from the barbecue crowd, and Sixth Street late-night legends. Austin's best burgers, by consensus.",
    "defaultSource": "ai",
    "links": {
      "Bad Larry Burger Club (East Austin)": "https://www.google.com/maps/search/?api=1&query=Bad%20Larry%20Burger%20Club%20East%20Austin%20Austin%20TX",
      "Bar Toti (Cherrywood)": "https://www.google.com/maps/search/?api=1&query=Bar%20Toti%20Cherrywood%20Austin%20TX",
      "Bill's Oyster (Downtown)": "https://www.google.com/maps/search/?api=1&query=Bill%20s%20Oyster%20Downtown%20Austin%20TX",
      "Buddy's Burger (Windsor Hills)": "https://www.google.com/maps/search/?api=1&query=Buddy%20s%20Burger%20Windsor%20Hills%20Austin%20TX",
      "Casino El Camino (Downtown)": "https://www.google.com/maps/search/?api=1&query=Casino%20El%20Camino%20Downtown%20Austin%20TX",
      "Clark's Oyster Bar (Clarksville)": "https://www.google.com/maps/search/?api=1&query=Clark%20s%20Oyster%20Bar%20Clarksville%20Austin%20TX",
      "Crown & Anchor Pub (West Campus)": "https://www.google.com/maps/search/?api=1&query=Crown%20Anchor%20Pub%20West%20Campus%20Austin%20TX",
      "Dai Due (Cherrywood)": "https://www.google.com/maps/search/?api=1&query=Dai%20Due%20Cherrywood%20Austin%20TX",
      "Delray Cafe (East Austin)": "https://www.google.com/maps/search/?api=1&query=Delray%20Cafe%20East%20Austin%20Austin%20TX",
      "Dirty Martin's Place (West Campus)": "https://www.google.com/maps/search/?api=1&query=Dirty%20Martin%20s%20Place%20West%20Campus%20Austin%20TX",
      "Frazier's Long & Low (East Riverside)": "https://www.google.com/maps/search/?api=1&query=Frazier%20s%20Long%20Low%20East%20Riverside%20Austin%20TX",
      "Gimme Burger (South Austin)": "https://www.google.com/maps/search/?api=1&query=Gimme%20Burger%20South%20Austin%20Austin%20TX",
      "Golden Tiger (East Austin)": "https://www.google.com/maps/search/?api=1&query=Golden%20Tiger%20East%20Austin%20Austin%20TX",
      "Hold Out Brewing (Clarksville)": "https://www.google.com/maps/search/?api=1&query=Hold%20Out%20Brewing%20Clarksville%20Austin%20TX",
      "JABS Burgers & Fries (Downtown)": "https://www.google.com/maps/search/?api=1&query=JABS%20Burgers%20Fries%20Downtown%20Austin%20TX",
      "Jeffrey's (Clarksville)": "https://www.google.com/maps/search/?api=1&query=Jeffrey%20s%20Clarksville%20Austin%20TX",
      "JewBoy Burgers (North Loop)": "https://www.google.com/maps/search/?api=1&query=JewBoy%20Burgers%20North%20Loop%20Austin%20TX",
      "June's All Day (South Congress)": "https://www.google.com/maps/search/?api=1&query=June%20s%20All%20Day%20South%20Congress%20Austin%20TX",
      "Justine's (East Austin)": "https://www.google.com/maps/search/?api=1&query=Justine%20s%20East%20Austin%20Austin%20TX",
      "Lao'd Bar (East Austin)": "https://www.google.com/maps/search/?api=1&query=Lao%20d%20Bar%20East%20Austin%20Austin%20TX",
      "Launderette (East Austin)": "https://www.google.com/maps/search/?api=1&query=Launderette%20East%20Austin%20Austin%20TX",
      "Le Beef (South Austin)": "https://www.google.com/maps/search/?api=1&query=Le%20Beef%20South%20Austin%20Austin%20TX",
      "LeRoy and Lewis Barbecue (South Austin)": "https://www.google.com/maps/search/?api=1&query=LeRoy%20and%20Lewis%20Barbecue%20South%20Austin%20Austin%20TX",
      "Mission Burger Co. (South Lamar)": "https://www.google.com/maps/search/?api=1&query=Mission%20Burger%20Co%20South%20Lamar%20Austin%20TX",
      "Moreno Burger Co. (Garrison Park)": "https://www.google.com/maps/search/?api=1&query=Moreno%20Burger%20Co%20Garrison%20Park%20Austin%20TX",
      "NADC Burger (East Austin)": "https://www.google.com/maps/search/?api=1&query=NADC%20Burger%20East%20Austin%20Austin%20TX",
      "Odd Duck (South Lamar)": "https://www.google.com/maps/search/?api=1&query=Odd%20Duck%20South%20Lamar%20Austin%20TX",
      "Patty Palace (South Austin)": "https://www.google.com/maps/search/?api=1&query=Patty%20Palace%20South%20Austin%20Austin%20TX",
      "Thunder Chief (South Lamar)": "https://www.google.com/maps/search/?api=1&query=Thunder%20Chief%20South%20Lamar%20Austin%20TX",
      "Top Notch (Crestview)": "https://www.google.com/maps/search/?api=1&query=Top%20Notch%20Crestview%20Austin%20TX",
      "Uptown Sports Club (East Austin)": "https://www.google.com/maps/search/?api=1&query=Uptown%20Sports%20Club%20East%20Austin%20Austin%20TX",
      "VanHorn's (Downtown)": "https://www.google.com/maps/search/?api=1&query=VanHorn%20s%20Downtown%20Austin%20TX",
      "Wholly Cow (Austin)": "https://www.google.com/maps/search/?api=1&query=Wholly%20Cow%20Austin%20Austin%20TX"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Clark's Oyster Bar (Clarksville)",
          "LeRoy and Lewis Barbecue (South Austin)",
          "Odd Duck (South Lamar)",
          "Patty Palace (South Austin)",
          "Uptown Sports Club (East Austin)",
          "Bar Toti (Cherrywood)",
          "Gimme Burger (South Austin)",
          "Golden Tiger (East Austin)",
          "NADC Burger (East Austin)",
          "Casino El Camino (Downtown)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation · Best Burgers in Austin (by score) 2026",
        "url": "https://www.theinfatuation.com/austin/guides/best-burgers-austin",
        "items": [
          "Odd Duck (South Lamar)",
          "Dai Due (Cherrywood)",
          "LeRoy and Lewis Barbecue (South Austin)",
          "VanHorn's (Downtown)",
          "Clark's Oyster Bar (Clarksville)",
          "Lao'd Bar (East Austin)",
          "Bar Toti (Cherrywood)",
          "Patty Palace (South Austin)",
          "Gimme Burger (South Austin)",
          "Uptown Sports Club (East Austin)",
          "Casino El Camino (Downtown)",
          "Crown & Anchor Pub (West Campus)",
          "Frazier's Long & Low (East Riverside)",
          "Golden Tiger (East Austin)",
          "Delray Cafe (East Austin)",
          "Dirty Martin's Place (West Campus)",
          "Top Notch (Crestview)"
        ]
      },
      "infatuationsmash": {
        "label": "The Infatuation · Austin Smashburger Power Rankings 2026",
        "url": "https://www.theinfatuation.com/austin/guides/smashburgers-austin",
        "items": [
          "Patty Palace (South Austin)",
          "Gimme Burger (South Austin)",
          "Frazier's Long & Low (East Riverside)",
          "Moreno Burger Co. (Garrison Park)",
          "Bar Toti (Cherrywood)",
          "Thunder Chief (South Lamar)",
          "Golden Tiger (East Austin)",
          "JABS Burgers & Fries (Downtown)",
          "Mission Burger Co. (South Lamar)",
          "Buddy's Burger (Windsor Hills)",
          "Hold Out Brewing (Clarksville)",
          "NADC Burger (East Austin)",
          "JewBoy Burgers (North Loop)",
          "Bill's Oyster (Downtown)"
        ]
      },
      "reichek": {
        "label": "Austin's Best Food Guides · 12 Best Burgers 2025",
        "url": "https://alexreichek.com/best-burgers-austin/",
        "items": [
          "Le Beef (South Austin)",
          "June's All Day (South Congress)",
          "Jeffrey's (Clarksville)",
          "Launderette (East Austin)",
          "Clark's Oyster Bar (Clarksville)",
          "NADC Burger (East Austin)",
          "Uptown Sports Club (East Austin)",
          "Bill's Oyster (Downtown)",
          "Bad Larry Burger Club (East Austin)",
          "JewBoy Burgers (North Loop)",
          "Wholly Cow (Austin)",
          "Justine's (East Austin)"
        ]
      }
    },
    "vote": {
      "items": [
        "Clark's Oyster Bar (Clarksville)",
        "LeRoy and Lewis Barbecue (South Austin)",
        "Casino El Camino (Downtown)",
        "NADC Burger (East Austin)",
        "Patty Palace (South Austin)",
        "JewBoy Burgers (North Loop)",
        "Dirty Martin's Place (West Campus)",
        "Top Notch (Crestview)",
        "Uptown Sports Club (East Austin)",
        "Buddy's Burger (Windsor Hills)"
      ]
    }
  },
  {
    "id": "burgers-la",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-29T03:12:57Z",
    "title": "Best Burgers in Los Angeles",
    "category": "Los Angeles",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "Bistro burgers in Hollywood, griddled classics from West LA institutions, and smash newcomers across the Eastside. LA's best burgers, by consensus.",
    "defaultSource": "ai",
    "links": {
      "Amboy (Chinatown)": "https://www.google.com/maps/search/?api=1&query=Amboy%20Chinatown%20Los%20Angeles%20CA",
      "Ban Ban Burger (Sawtelle)": "https://www.google.com/maps/search/?api=1&query=Ban%20Ban%20Burger%20Sawtelle%20Los%20Angeles%20CA",
      "Bar 109 (Melrose Hill)": "https://www.google.com/maps/search/?api=1&query=Bar%20109%20Melrose%20Hill%20Los%20Angeles%20CA",
      "Bill's Hamburgers (Van Nuys)": "https://www.google.com/maps/search/?api=1&query=Bill%20s%20Hamburgers%20Van%20Nuys%20Los%20Angeles%20CA",
      "Burger She Wrote (Mid-City)": "https://www.google.com/maps/search/?api=1&query=Burger%20She%20Wrote%20Mid-City%20Los%20Angeles%20CA",
      "Burgers Never Say Die (Silver Lake)": "https://www.google.com/maps/search/?api=1&query=Burgers%20Never%20Say%20Die%20Silver%20Lake%20Los%20Angeles%20CA",
      "Camelia (Arts District)": "https://www.google.com/maps/search/?api=1&query=Camelia%20Arts%20District%20Los%20Angeles%20CA",
      "Camphor (Arts District)": "https://www.google.com/maps/search/?api=1&query=Camphor%20Arts%20District%20Los%20Angeles%20CA",
      "Connie & Ted's (West Hollywood)": "https://www.google.com/maps/search/?api=1&query=Connie%20Ted%20s%20West%20Hollywood%20Los%20Angeles%20CA",
      "Doto (Silver Lake)": "https://www.google.com/maps/search/?api=1&query=Doto%20Silver%20Lake%20Los%20Angeles%20CA",
      "Doubting Thomas (Historic Filipinotown)": "https://www.google.com/maps/search/?api=1&query=Doubting%20Thomas%20Historic%20Filipinotown%20Los%20Angeles%20CA",
      "Dudley Market (Venice)": "https://www.google.com/maps/search/?api=1&query=Dudley%20Market%20Venice%20Los%20Angeles%20CA",
      "Ercole's 1101 (Manhattan Beach)": "https://www.google.com/maps/search/?api=1&query=Ercole%20s%201101%20Manhattan%20Beach%20Los%20Angeles%20CA",
      "Everson Royce Bar (Arts District)": "https://www.google.com/maps/search/?api=1&query=Everson%20Royce%20Bar%20Arts%20District%20Los%20Angeles%20CA",
      "Father's Office (Santa Monica)": "https://www.google.com/maps/search/?api=1&query=Father%20s%20Office%20Santa%20Monica%20Los%20Angeles%20CA",
      "For The Win (Hollywood)": "https://www.google.com/maps/search/?api=1&query=For%20The%20Win%20Hollywood%20Los%20Angeles%20CA",
      "Goldburger (Highland Park)": "https://www.google.com/maps/search/?api=1&query=Goldburger%20Highland%20Park%20Los%20Angeles%20CA",
      "Hawkins House of Burgers (Watts)": "https://www.google.com/maps/search/?api=1&query=Hawkins%20House%20of%20Burgers%20Watts%20Los%20Angeles%20CA",
      "Heavy Handed (Santa Monica)": "https://www.google.com/maps/search/?api=1&query=Heavy%20Handed%20Santa%20Monica%20Los%20Angeles%20CA",
      "Hermon's (Highland Park)": "https://www.google.com/maps/search/?api=1&query=Hermon%20s%20Highland%20Park%20Los%20Angeles%20CA",
      "HiHo Cheeseburger (Santa Monica)": "https://www.google.com/maps/search/?api=1&query=HiHo%20Cheeseburger%20Santa%20Monica%20Los%20Angeles%20CA",
      "Hinano Cafe (Venice)": "https://www.google.com/maps/search/?api=1&query=Hinano%20Cafe%20Venice%20Los%20Angeles%20CA",
      "Hudson House (West Hollywood)": "https://www.google.com/maps/search/?api=1&query=Hudson%20House%20West%20Hollywood%20Los%20Angeles%20CA",
      "In-N-Out Burger (multiple locations)": "https://www.google.com/maps/search/?api=1&query=In-N-Out%20Burger%20Los%20Angeles%20CA",
      "Irv's Burgers (West Hollywood)": "https://www.google.com/maps/search/?api=1&query=Irv%20s%20Burgers%20West%20Hollywood%20Los%20Angeles%20CA",
      "Love Hour (Koreatown)": "https://www.google.com/maps/search/?api=1&query=Love%20Hour%20Koreatown%20Los%20Angeles%20CA",
      "Marty's Hamburger Stand (Culver City)": "https://www.google.com/maps/search/?api=1&query=Marty%20s%20Hamburger%20Stand%20Culver%20City%20Los%20Angeles%20CA",
      "Melanie Wine Bar (East Hollywood)": "https://www.google.com/maps/search/?api=1&query=Melanie%20Wine%20Bar%20East%20Hollywood%20Los%20Angeles%20CA",
      "Monty's Good Burger (Koreatown)": "https://www.google.com/maps/search/?api=1&query=Monty%20s%20Good%20Burger%20Koreatown%20Los%20Angeles%20CA",
      "Moo's Craft Barbecue (Lincoln Heights)": "https://www.google.com/maps/search/?api=1&query=Moo%20s%20Craft%20Barbecue%20Lincoln%20Heights%20Los%20Angeles%20CA",
      "Mr. Charlie's (Highland Park)": "https://www.google.com/maps/search/?api=1&query=Mr%20Charlie%20s%20Highland%20Park%20Los%20Angeles%20CA",
      "Original Tommy's (Rampart)": "https://www.google.com/maps/search/?api=1&query=Original%20Tommy%20s%20Rampart%20Los%20Angeles%20CA",
      "Oy Bar (Studio City)": "https://www.google.com/maps/search/?api=1&query=Oy%20Bar%20Studio%20City%20Los%20Angeles%20CA",
      "Pasjoli (Santa Monica)": "https://www.google.com/maps/search/?api=1&query=Pasjoli%20Santa%20Monica%20Los%20Angeles%20CA",
      "Petit Trois (Hollywood)": "https://www.google.com/maps/search/?api=1&query=Petit%20Trois%20Hollywood%20Los%20Angeles%20CA",
      "Proudly Serving (Hermosa Beach)": "https://www.google.com/maps/search/?api=1&query=Proudly%20Serving%20Hermosa%20Beach%20Los%20Angeles%20CA",
      "Softies (University Park)": "https://www.google.com/maps/search/?api=1&query=Softies%20University%20Park%20Los%20Angeles%20CA",
      "The Apple Pan (West LA)": "https://www.google.com/maps/search/?api=1&query=The%20Apple%20Pan%20West%20LA%20Los%20Angeles%20CA",
      "The Benjamin (Hollywood)": "https://www.google.com/maps/search/?api=1&query=The%20Benjamin%20Hollywood%20Los%20Angeles%20CA",
      "The Mulberry (Sawtelle)": "https://www.google.com/maps/search/?api=1&query=The%20Mulberry%20Sawtelle%20Los%20Angeles%20CA",
      "The Win-Dow (Venice)": "https://www.google.com/maps/search/?api=1&query=The%20Win-Dow%20Venice%20Los%20Angeles%20CA"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Petit Trois (Hollywood)",
          "Camphor (Arts District)",
          "The Apple Pan (West LA)",
          "Goldburger (Highland Park)",
          "Heavy Handed (Santa Monica)",
          "Bar 109 (Melrose Hill)",
          "Father's Office (Santa Monica)",
          "Moo's Craft Barbecue (Lincoln Heights)",
          "Everson Royce Bar (Arts District)",
          "For The Win (Hollywood)"
        ]
      },
      "timeout": {
        "label": "Time Out Los Angeles · Best Burgers, Ranked 2025",
        "url": "https://www.timeout.com/los-angeles/restaurants/the-best-burgers-in-los-angeles",
        "items": [
          "Petit Trois (Hollywood)",
          "The Apple Pan (West LA)",
          "Camphor (Arts District)",
          "Bill's Hamburgers (Van Nuys)",
          "Hinano Cafe (Venice)",
          "Bar 109 (Melrose Hill)",
          "Father's Office (Santa Monica)",
          "Amboy (Chinatown)",
          "Moo's Craft Barbecue (Lincoln Heights)",
          "Goldburger (Highland Park)",
          "In-N-Out Burger (multiple locations)",
          "Everson Royce Bar (Arts District)",
          "Doubting Thomas (Historic Filipinotown)",
          "Heavy Handed (Santa Monica)",
          "Camelia (Arts District)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation · Best Burgers in LA 2026",
        "url": "https://www.theinfatuation.com/los-angeles/guides/best-burger-la",
        "items": [
          "Hermon's (Highland Park)",
          "The Mulberry (Sawtelle)",
          "Bar 109 (Melrose Hill)",
          "Pasjoli (Santa Monica)",
          "Doto (Silver Lake)",
          "The Benjamin (Hollywood)",
          "Softies (University Park)",
          "Dudley Market (Venice)",
          "Ban Ban Burger (Sawtelle)",
          "For The Win (Hollywood)",
          "Moo's Craft Barbecue (Lincoln Heights)",
          "Goldburger (Highland Park)",
          "Everson Royce Bar (Arts District)",
          "Camphor (Arts District)",
          "Oy Bar (Studio City)",
          "Hawkins House of Burgers (Watts)",
          "Ercole's 1101 (Manhattan Beach)",
          "Father's Office (Santa Monica)",
          "The Apple Pan (West LA)",
          "Proudly Serving (Hermosa Beach)"
        ]
      },
      "tastingtable": {
        "label": "Tasting Table · 20 Best Burgers in LA, Ranked 2023",
        "url": "https://www.tastingtable.com/1301060/best-burgers-los-angeles-ranked/",
        "items": [
          "Melanie Wine Bar (East Hollywood)",
          "Heavy Handed (Santa Monica)",
          "Love Hour (Koreatown)",
          "Mr. Charlie's (Highland Park)",
          "The Win-Dow (Venice)",
          "Camphor (Arts District)",
          "Petit Trois (Hollywood)",
          "Goldburger (Highland Park)",
          "Monty's Good Burger (Koreatown)",
          "Burger She Wrote (Mid-City)",
          "Burgers Never Say Die (Silver Lake)",
          "Irv's Burgers (West Hollywood)",
          "For The Win (Hollywood)",
          "Connie & Ted's (West Hollywood)",
          "Marty's Hamburger Stand (Culver City)",
          "Original Tommy's (Rampart)",
          "Hudson House (West Hollywood)",
          "In-N-Out Burger (multiple locations)",
          "HiHo Cheeseburger (Santa Monica)"
        ]
      }
    },
    "vote": {
      "items": [
        "In-N-Out Burger (multiple locations)",
        "Petit Trois (Hollywood)",
        "The Apple Pan (West LA)",
        "Camphor (Arts District)",
        "Goldburger (Highland Park)",
        "Father's Office (Santa Monica)",
        "Heavy Handed (Santa Monica)",
        "For The Win (Hollywood)",
        "Original Tommy's (Rampart)",
        "Burgers Never Say Die (Silver Lake)"
      ]
    }
  },
  {
    "id": "burgers-sf",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-29T03:12:58Z",
    "title": "Best Burgers in San Francisco",
    "category": "San Francisco",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "Cole Valley pub patties, SoMa smash standouts, and North Beach old-school classics. San Francisco's best burgers, by consensus.",
    "defaultSource": "ai",
    "links": {
      "ABV (Mission)": "https://www.google.com/maps/search/?api=1&query=ABV%20Mission%20San%20Francisco%20CA",
      "Beep's Burgers (Ingleside)": "https://www.google.com/maps/search/?api=1&query=Beep%20s%20Burgers%20Ingleside%20San%20Francisco%20CA",
      "Causwells (Marina)": "https://www.google.com/maps/search/?api=1&query=Causwells%20Marina%20San%20Francisco%20CA",
      "Flats Burgers (Excelsior)": "https://www.google.com/maps/search/?api=1&query=Flats%20Burgers%20Excelsior%20San%20Francisco%20CA",
      "Grumpy's (Embarcadero)": "https://www.google.com/maps/search/?api=1&query=Grumpy%20s%20Embarcadero%20San%20Francisco%20CA",
      "Hamburger Project (NoPa)": "https://www.google.com/maps/search/?api=1&query=Hamburger%20Project%20NoPa%20San%20Francisco%20CA",
      "Hamburguesa Bar (SoMa)": "https://www.google.com/maps/search/?api=1&query=Hamburguesa%20Bar%20SoMa%20San%20Francisco%20CA",
      "Hillstone (Fisherman's Wharf)": "https://www.google.com/maps/search/?api=1&query=Hillstone%20Fisherman%20s%20Wharf%20San%20Francisco%20CA",
      "In-N-Out (Fisherman's Wharf)": "https://www.google.com/maps/search/?api=1&query=In-N-Out%20Fisherman%20s%20Wharf%20San%20Francisco%20CA",
      "Lovely's (Cole Valley)": "https://www.google.com/maps/search/?api=1&query=Lovely%20s%20Cole%20Valley%20San%20Francisco%20CA",
      "Maillards (Sunset)": "https://www.google.com/maps/search/?api=1&query=Maillards%20Sunset%20San%20Francisco%20CA",
      "Marlowe (SoMa)": "https://www.google.com/maps/search/?api=1&query=Marlowe%20SoMa%20San%20Francisco%20CA",
      "Native Burger (Richmond)": "https://www.google.com/maps/search/?api=1&query=Native%20Burger%20Richmond%20San%20Francisco%20CA",
      "Nopa (Alamo Square)": "https://www.google.com/maps/search/?api=1&query=Nopa%20Alamo%20Square%20San%20Francisco%20CA",
      "Pearl's Deluxe Burgers (Lower Nob Hill)": "https://www.google.com/maps/search/?api=1&query=Pearl%20s%20Deluxe%20Burgers%20Lower%20Nob%20Hill%20San%20Francisco%20CA",
      "RT Bistro (Hayes Valley)": "https://www.google.com/maps/search/?api=1&query=RT%20Bistro%20Hayes%20Valley%20San%20Francisco%20CA",
      "Roam (Marina)": "https://www.google.com/maps/search/?api=1&query=Roam%20Marina%20San%20Francisco%20CA",
      "Sam's (North Beach)": "https://www.google.com/maps/search/?api=1&query=Sam%20s%20North%20Beach%20San%20Francisco%20CA",
      "Shmash'd (Bernal Heights)": "https://www.google.com/maps/search/?api=1&query=Shmash%20d%20Bernal%20Heights%20San%20Francisco%20CA",
      "Side A (Mission)": "https://www.google.com/maps/search/?api=1&query=Side%20A%20Mission%20San%20Francisco%20CA",
      "Smish Smash (SoMa)": "https://www.google.com/maps/search/?api=1&query=Smish%20Smash%20SoMa%20San%20Francisco%20CA",
      "Spruce (Presidio Heights)": "https://www.google.com/maps/search/?api=1&query=Spruce%20Presidio%20Heights%20San%20Francisco%20CA",
      "The Butcher Shop by Niku (Design District)": "https://www.google.com/maps/search/?api=1&query=The%20Butcher%20Shop%20by%20Niku%20Design%20District%20San%20Francisco%20CA",
      "The Laundromat (Richmond)": "https://www.google.com/maps/search/?api=1&query=The%20Laundromat%20Richmond%20San%20Francisco%20CA",
      "The Rabbit Hole (Mission)": "https://www.google.com/maps/search/?api=1&query=The%20Rabbit%20Hole%20Mission%20San%20Francisco%20CA",
      "True Laurel (Mission)": "https://www.google.com/maps/search/?api=1&query=True%20Laurel%20Mission%20San%20Francisco%20CA",
      "Wayfare Tavern (Union Square)": "https://www.google.com/maps/search/?api=1&query=Wayfare%20Tavern%20Union%20Square%20San%20Francisco%20CA",
      "Wes Burger (Mission)": "https://www.google.com/maps/search/?api=1&query=Wes%20Burger%20Mission%20San%20Francisco%20CA",
      "Wildseed (Cow Hollow)": "https://www.google.com/maps/search/?api=1&query=Wildseed%20Cow%20Hollow%20San%20Francisco%20CA",
      "Wiz Burgers (Mission)": "https://www.google.com/maps/search/?api=1&query=Wiz%20Burgers%20Mission%20San%20Francisco%20CA",
      "Zuni Cafe (Hayes Valley)": "https://www.google.com/maps/search/?api=1&query=Zuni%20Cafe%20Hayes%20Valley%20San%20Francisco%20CA"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Lovely's (Cole Valley)",
          "The Laundromat (Richmond)",
          "Smish Smash (SoMa)",
          "Beep's Burgers (Ingleside)",
          "Maillards (Sunset)",
          "Side A (Mission)",
          "RT Bistro (Hayes Valley)",
          "Nopa (Alamo Square)",
          "Zuni Cafe (Hayes Valley)",
          "Sam's (North Beach)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation · Best Burgers in SF (by score) 2026",
        "url": "https://www.theinfatuation.com/san-francisco/guides/best-burgers-san-francisco",
        "items": [
          "Lovely's (Cole Valley)",
          "The Laundromat (Richmond)",
          "Side A (Mission)",
          "RT Bistro (Hayes Valley)",
          "Beep's Burgers (Ingleside)",
          "Sam's (North Beach)",
          "Native Burger (Richmond)",
          "Wildseed (Cow Hollow)",
          "Pearl's Deluxe Burgers (Lower Nob Hill)",
          "Spruce (Presidio Heights)",
          "The Rabbit Hole (Mission)",
          "Hamburguesa Bar (SoMa)",
          "Grumpy's (Embarcadero)",
          "Zuni Cafe (Hayes Valley)",
          "Causwells (Marina)"
        ]
      },
      "infatuationsmash": {
        "label": "The Infatuation · Best Smashburgers in SF (by score) 2026",
        "url": "https://www.theinfatuation.com/san-francisco/guides/best-smashburgers-sf",
        "items": [
          "Smish Smash (SoMa)",
          "Maillards (Sunset)",
          "Lovely's (Cole Valley)",
          "The Laundromat (Richmond)",
          "Flats Burgers (Excelsior)",
          "The Butcher Shop by Niku (Design District)",
          "Shmash'd (Bernal Heights)",
          "Hamburger Project (NoPa)"
        ]
      },
      "sfstandard": {
        "label": "The San Francisco Standard · 12 Best, Pro Survey (unranked) 2024",
        "url": "https://sfstandard.com/2024/09/30/best-burgers-san-francisco/",
        "items": [
          "Beep's Burgers (Ingleside)",
          "Nopa (Alamo Square)",
          "Zuni Cafe (Hayes Valley)",
          "Roam (Marina)",
          "Hillstone (Fisherman's Wharf)",
          "In-N-Out (Fisherman's Wharf)",
          "Wes Burger (Mission)",
          "Wiz Burgers (Mission)",
          "Marlowe (SoMa)",
          "True Laurel (Mission)",
          "Wayfare Tavern (Union Square)",
          "ABV (Mission)"
        ],
        "unordered": true
      }
    },
    "vote": {
      "items": [
        "Nopa (Alamo Square)",
        "Lovely's (Cole Valley)",
        "Beep's Burgers (Ingleside)",
        "Smish Smash (SoMa)",
        "Marlowe (SoMa)",
        "Causwells (Marina)",
        "Maillards (Sunset)",
        "Zuni Cafe (Hayes Valley)",
        "Wes Burger (Mission)",
        "ABV (Mission)"
      ]
    }
  },
  {
    "id": "burgers-chicago",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-29T03:12:59Z",
    "title": "Best Burgers in Chicago",
    "category": "Chicago",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "West Loop griddle icons, Logan Square smash spots, and tavern classics across the North Side. Chicago's best burgers, by consensus.",
    "defaultSource": "ai",
    "links": {
      "Au Cheval (West Loop)": "https://www.google.com/maps/search/?api=1&query=Au%20Cheval%20West%20Loop%20Chicago%20IL",
      "Best Intentions (Logan Square)": "https://www.google.com/maps/search/?api=1&query=Best%20Intentions%20Logan%20Square%20Chicago%20IL",
      "Bitter Pops (Lake View)": "https://www.google.com/maps/search/?api=1&query=Bitter%20Pops%20Lake%20View%20Chicago%20IL",
      "Boonie's Filipino Restaurant (North Center)": "https://www.google.com/maps/search/?api=1&query=Boonie%20s%20Filipino%20Restaurant%20North%20Center%20Chicago%20IL",
      "Cash's Kitchen (Lakeview)": "https://www.google.com/maps/search/?api=1&query=Cash%20s%20Kitchen%20Lakeview%20Chicago%20IL",
      "Cerdito Muerto (Pilsen)": "https://www.google.com/maps/search/?api=1&query=Cerdito%20Muerto%20Pilsen%20Chicago%20IL",
      "Charly's Burgers (Hermosa)": "https://www.google.com/maps/search/?api=1&query=Charly%20s%20Burgers%20Hermosa%20Chicago%20IL",
      "Chubby Boys (Logan Square)": "https://www.google.com/maps/search/?api=1&query=Chubby%20Boys%20Logan%20Square%20Chicago%20IL",
      "Community Tavern (Portage Park)": "https://www.google.com/maps/search/?api=1&query=Community%20Tavern%20Portage%20Park%20Chicago%20IL",
      "Crushed by Giants (Magnificent Mile)": "https://www.google.com/maps/search/?api=1&query=Crushed%20by%20Giants%20Magnificent%20Mile%20Chicago%20IL",
      "Diego (West Town)": "https://www.google.com/maps/search/?api=1&query=Diego%20West%20Town%20Chicago%20IL",
      "Fatso's Last Stand (Ukrainian Village)": "https://www.google.com/maps/search/?api=1&query=Fatso%20s%20Last%20Stand%20Ukrainian%20Village%20Chicago%20IL",
      "Forbidden Root (Ukrainian Village)": "https://www.google.com/maps/search/?api=1&query=Forbidden%20Root%20Ukrainian%20Village%20Chicago%20IL",
      "Gretel (Logan Square)": "https://www.google.com/maps/search/?api=1&query=Gretel%20Logan%20Square%20Chicago%20IL",
      "Izakaya at Momotaro (West Loop)": "https://www.google.com/maps/search/?api=1&query=Izakaya%20at%20Momotaro%20West%20Loop%20Chicago%20IL",
      "JT's Genuine Sandwich Shop (Irving Park)": "https://www.google.com/maps/search/?api=1&query=JT%20s%20Genuine%20Sandwich%20Shop%20Irving%20Park%20Chicago%20IL",
      "Little Bad Wolf (Andersonville)": "https://www.google.com/maps/search/?api=1&query=Little%20Bad%20Wolf%20Andersonville%20Chicago%20IL",
      "Mott St. (Wicker Park)": "https://www.google.com/maps/search/?api=1&query=Mott%20St%20Wicker%20Park%20Chicago%20IL",
      "NADC Burger (West Town)": "https://www.google.com/maps/search/?api=1&query=NADC%20Burger%20West%20Town%20Chicago%20IL",
      "Odge's (West Town)": "https://www.google.com/maps/search/?api=1&query=Odge%20s%20West%20Town%20Chicago%20IL",
      "Patty Please (Avondale)": "https://www.google.com/maps/search/?api=1&query=Patty%20Please%20Avondale%20Chicago%20IL",
      "Ragadan (Uptown)": "https://www.google.com/maps/search/?api=1&query=Ragadan%20Uptown%20Chicago%20IL",
      "Red Hot Ranch (Logan Square)": "https://www.google.com/maps/search/?api=1&query=Red%20Hot%20Ranch%20Logan%20Square%20Chicago%20IL",
      "Smash Jibarito (Humboldt Park)": "https://www.google.com/maps/search/?api=1&query=Smash%20Jibarito%20Humboldt%20Park%20Chicago%20IL",
      "The Leavitt Street Inn & Tavern (Bucktown)": "https://www.google.com/maps/search/?api=1&query=The%20Leavitt%20Street%20Inn%20Tavern%20Bucktown%20Chicago%20IL",
      "The Loyalist (West Loop)": "https://www.google.com/maps/search/?api=1&query=The%20Loyalist%20West%20Loop%20Chicago%20IL",
      "The Region (Lakeview)": "https://www.google.com/maps/search/?api=1&query=The%20Region%20Lakeview%20Chicago%20IL",
      "The StopAlong (Bucktown)": "https://www.google.com/maps/search/?api=1&query=The%20StopAlong%20Bucktown%20Chicago%20IL",
      "Tribecca's Sandwich Shop (Avondale)": "https://www.google.com/maps/search/?api=1&query=Tribecca%20s%20Sandwich%20Shop%20Avondale%20Chicago%20IL",
      "bopNgrill (Rogers Park)": "https://www.google.com/maps/search/?api=1&query=bopNgrill%20Rogers%20Park%20Chicago%20IL"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Au Cheval (West Loop)",
          "The Leavitt Street Inn & Tavern (Bucktown)",
          "Mott St. (Wicker Park)",
          "Red Hot Ranch (Logan Square)",
          "Little Bad Wolf (Andersonville)",
          "Ragadan (Uptown)",
          "The Loyalist (West Loop)",
          "NADC Burger (West Town)",
          "Best Intentions (Logan Square)",
          "Diego (West Town)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation · Best Burgers in Chicago (by score) 2026",
        "url": "https://www.theinfatuation.com/chicago/guides/best-burger-chicago",
        "items": [
          "Diego (West Town)",
          "Au Cheval (West Loop)",
          "Boonie's Filipino Restaurant (North Center)",
          "Cerdito Muerto (Pilsen)",
          "Best Intentions (Logan Square)",
          "Tribecca's Sandwich Shop (Avondale)",
          "Chubby Boys (Logan Square)",
          "Cash's Kitchen (Lakeview)",
          "Charly's Burgers (Hermosa)",
          "Patty Please (Avondale)",
          "Ragadan (Uptown)",
          "Gretel (Logan Square)",
          "Mott St. (Wicker Park)",
          "Smash Jibarito (Humboldt Park)",
          "The Region (Lakeview)",
          "Red Hot Ranch (Logan Square)",
          "The StopAlong (Bucktown)",
          "Community Tavern (Portage Park)",
          "bopNgrill (Rogers Park)",
          "The Loyalist (West Loop)"
        ]
      },
      "timeout": {
        "label": "Time Out Chicago · 14 Best Burgers 2026",
        "url": "https://www.timeout.com/chicago/restaurants/best-burgers-in-chicago",
        "items": [
          "Little Bad Wolf (Andersonville)",
          "Au Cheval (West Loop)",
          "The Loyalist (West Loop)",
          "Red Hot Ranch (Logan Square)",
          "Mott St. (Wicker Park)",
          "JT's Genuine Sandwich Shop (Irving Park)",
          "The Leavitt Street Inn & Tavern (Bucktown)",
          "Ragadan (Uptown)",
          "NADC Burger (West Town)",
          "Fatso's Last Stand (Ukrainian Village)",
          "The StopAlong (Bucktown)",
          "Gretel (Logan Square)",
          "Community Tavern (Portage Park)",
          "Izakaya at Momotaro (West Loop)"
        ]
      },
      "chicagomag": {
        "label": "Chicago Magazine · The Great Chicago Burger Quest 2024",
        "url": "https://www.chicagomag.com/chicago-magazine/may-2024/the-great-chicago-burger-quest/",
        "items": [
          "The Leavitt Street Inn & Tavern (Bucktown)",
          "Best Intentions (Logan Square)",
          "Red Hot Ranch (Logan Square)",
          "Mott St. (Wicker Park)",
          "NADC Burger (West Town)",
          "Bitter Pops (Lake View)",
          "Ragadan (Uptown)",
          "Forbidden Root (Ukrainian Village)",
          "Odge's (West Town)",
          "Crushed by Giants (Magnificent Mile)"
        ]
      }
    },
    "vote": {
      "items": [
        "Au Cheval (West Loop)",
        "Little Bad Wolf (Andersonville)",
        "The Loyalist (West Loop)",
        "Mott St. (Wicker Park)",
        "The Leavitt Street Inn & Tavern (Bucktown)",
        "Red Hot Ranch (Logan Square)",
        "NADC Burger (West Town)",
        "Diego (West Town)",
        "Ragadan (Uptown)",
        "Best Intentions (Logan Square)"
      ]
    }
  },
  {
    "id": "resorts-caribbean",
    "publishedDate": "2026-06-01",
    "publishedAt": "2026-06-01T04:21:29Z",
    "title": "Best Resorts in the Caribbean",
    "category": "Travel",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "Forbes five-star landmarks, both Aman escapes, and island originals from St. Barths to Barbados. The Caribbean's most acclaimed luxury resorts, by consensus.",
    "defaultSource": "ai",
    "links": {
      "Amanera (Playa Grande, Dominican Republic)": "https://www.google.com/maps/search/?api=1&query=Amanera%20Playa%20Grande%20Dominican%20Republic",
      "Amanyara (Providenciales, Turks & Caicos)": "https://www.google.com/maps/search/?api=1&query=Amanyara%20Providenciales%20Turks%20Caicos",
      "Baoase Luxury Resort (Willemstad, Curacao)": "https://www.google.com/maps/search/?api=1&query=Baoase%20Luxury%20Resort%20Willemstad%20Curacao",
      "Belmond Cap Juluca (Anguilla)": "https://www.google.com/maps/search/?api=1&query=Belmond%20Cap%20Juluca%20Anguilla",
      "COMO Parrot Cay (Parrot Cay, Turks & Caicos)": "https://www.google.com/maps/search/?api=1&query=COMO%20Parrot%20Cay%20Turks%20Caicos",
      "Cheval Blanc (St. Barths)": "https://www.google.com/maps/search/?api=1&query=Cheval%20Blanc%20St%20Barths",
      "Curtain Bluff (Antigua)": "https://www.google.com/maps/search/?api=1&query=Curtain%20Bluff%20Antigua",
      "Dorado Beach, a Ritz-Carlton Reserve (Dorado, Puerto Rico)": "https://www.google.com/maps/search/?api=1&query=Dorado%20Beach%20Ritz-Carlton%20Reserve%20Dorado%20Puerto%20Rico",
      "Eden Roc Cap Cana (Cap Cana, Dominican Republic)": "https://www.google.com/maps/search/?api=1&query=Eden%20Roc%20Cap%20Cana%20Dominican%20Republic",
      "Eden Rock (St. Barths)": "https://www.google.com/maps/search/?api=1&query=Eden%20Rock%20St%20Barths",
      "Four Seasons Resort Anguilla (Barnes Bay, Anguilla)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Resort%20Anguilla%20Barnes%20Bay",
      "Jade Mountain (Soufrière, St. Lucia)": "https://www.google.com/maps/search/?api=1&query=Jade%20Mountain%20Soufriere%20St%20Lucia",
      "Jumby Bay Island (Antigua)": "https://www.google.com/maps/search/?api=1&query=Jumby%20Bay%20Island%20Oetker%20Collection",
      "Kimpton Seafire Resort & Spa (Seven Mile Beach, Grand Cayman)": "https://www.google.com/maps/search/?api=1&query=Kimpton%20Seafire%20Resort%20Seven%20Mile%20Beach%20Grand%20Cayman",
      "Le Barthelemy Hotel & Spa (St. Barths)": "https://www.google.com/maps/search/?api=1&query=Le%20Barthelemy%20Hotel%20Spa%20St%20Barths",
      "Montpelier Plantation & Beach (Charlestown, Nevis)": "https://www.google.com/maps/search/?api=1&query=Montpelier%20Plantation%20Beach%20Charlestown%20Nevis",
      "Rosewood Little Dix Bay (Virgin Gorda, British Virgin Islands)": "https://www.google.com/maps/search/?api=1&query=Rosewood%20Little%20Dix%20Bay%20Virgin%20Gorda%20British%20Virgin%20Islands",
      "Sandy Lane (St. James, Barbados)": "https://www.google.com/maps/search/?api=1&query=Sandy%20Lane%20St%20James%20Barbados",
      "Secret Bay (Dominica)": "https://www.google.com/maps/search/?api=1&query=Secret%20Bay%20Dominica",
      "St. Regis Bahia Beach Resort (Río Grande, Puerto Rico)": "https://www.google.com/maps/search/?api=1&query=St%20Regis%20Bahia%20Beach%20Resort%20Rio%20Grande%20Puerto%20Rico",
      "The Ritz-Carlton, Grand Cayman (Seven Mile Beach, Grand Cayman)": "https://www.google.com/maps/search/?api=1&query=Ritz-Carlton%20Grand%20Cayman%20Seven%20Mile%20Beach"
    },
    "prices": {
        "Jumby Bay Island (Antigua)": "$3,357/n",
        "Amanera (Playa Grande, Dominican Republic)": "$2,600/n",
        "Le Barthelemy Hotel & Spa (St. Barths)": "$2,279/n",
        "Amanyara (Providenciales, Turks & Caicos)": "$2,150/n",
        "Sandy Lane (St. James, Barbados)": "$1,900/n",
        "Belmond Cap Juluca (Anguilla)": "$1,595/n",
        "Cheval Blanc (St. Barths)": "$2,037/n",
        "Eden Rock (St. Barths)": "rate on request",
        "Montpelier Plantation & Beach (Charlestown, Nevis)": "$244/n",
        "St. Regis Bahia Beach Resort (Río Grande, Puerto Rico)": "rate on request",
        "COMO Parrot Cay (Parrot Cay, Turks & Caicos)": "$1,679/n",
        "Dorado Beach, a Ritz-Carlton Reserve (Dorado, Puerto Rico)": "$1,895/n",
        "Jade Mountain (Soufrière, St. Lucia)": "$1,605/n",
        "Curtain Bluff (Antigua)": "$1,345/n",
        "Secret Bay (Dominica)": "$1,283/n",
        "Rosewood Little Dix Bay (Virgin Gorda, British Virgin Islands)": "$1,153/n",
        "Eden Roc Cap Cana (Cap Cana, Dominican Republic)": "$1,000/n",
        "Baoase Luxury Resort (Willemstad, Curacao)": "$3,968/n",
        "Four Seasons Resort Anguilla (Barnes Bay, Anguilla)": "$995/n",
        "The Ritz-Carlton, Grand Cayman (Seven Mile Beach, Grand Cayman)": "$723/n",
        "Kimpton Seafire Resort & Spa (Seven Mile Beach, Grand Cayman)": "$698/n"
      },
      "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Jade Mountain (Soufrière, St. Lucia)",
          "Jumby Bay Island (Antigua)",
          "Eden Rock (St. Barths)",
          "Rosewood Little Dix Bay (Virgin Gorda, British Virgin Islands)",
          "Sandy Lane (St. James, Barbados)",
          "Kimpton Seafire Resort & Spa (Seven Mile Beach, Grand Cayman)",
          "Dorado Beach, a Ritz-Carlton Reserve (Dorado, Puerto Rico)",
          "Cheval Blanc (St. Barths)",
          "Amanera (Playa Grande, Dominican Republic)",
          "Secret Bay (Dominica)"
        ]
      },
      "usnews": {
        "label": "U.S. News · Best Resorts in the Caribbean 2026",
        "url": "https://travel.usnews.com/hotels/best-resorts-in-caribbean/",
        "items": [
          "Jade Mountain (Soufrière, St. Lucia)",
          "Baoase Luxury Resort (Willemstad, Curacao)",
          "Kimpton Seafire Resort & Spa (Seven Mile Beach, Grand Cayman)",
          "Dorado Beach, a Ritz-Carlton Reserve (Dorado, Puerto Rico)",
          "St. Regis Bahia Beach Resort (Río Grande, Puerto Rico)",
          "Sandy Lane (St. James, Barbados)",
          "Jumby Bay Island (Antigua)",
          "Four Seasons Resort Anguilla (Barnes Bay, Anguilla)"
        ]
      },
      "cntraveler": {
        "label": "Condé Nast Traveller · Readers' Choice, Caribbean & Atlantic 2025",
        "url": "https://www.cntraveller.com/gallery/best-resorts-caribbean-central-america-2025",
        "items": [
          "Eden Rock (St. Barths)",
          "Jade Mountain (Soufrière, St. Lucia)",
          "Eden Roc Cap Cana (Cap Cana, Dominican Republic)",
          "The Ritz-Carlton, Grand Cayman (Seven Mile Beach, Grand Cayman)",
          "Rosewood Little Dix Bay (Virgin Gorda, British Virgin Islands)",
          "Le Barthelemy Hotel & Spa (St. Barths)",
          "Montpelier Plantation & Beach (Charlestown, Nevis)",
          "Sandy Lane (St. James, Barbados)",
          "Cheval Blanc (St. Barths)",
          "Jumby Bay Island (Antigua)"
        ]
      },
      "travelleisure": {
        "label": "Travel + Leisure · World's Best Awards, Caribbean 2025",
        "url": "https://www.travelandleisure.com/worlds-best-awards-2025-resorts-caribbean-11738938",
        "items": [
          "Baoase Luxury Resort (Willemstad, Curacao)",
          "Secret Bay (Dominica)",
          "Jade Mountain (Soufrière, St. Lucia)",
          "Rosewood Little Dix Bay (Virgin Gorda, British Virgin Islands)",
          "Jumby Bay Island (Antigua)",
          "Cheval Blanc (St. Barths)",
          "Curtain Bluff (Antigua)",
          "Belmond Cap Juluca (Anguilla)"
        ]
      },
      "pricing": {
        "label": "Live Pricing · Cheapest Room, Nov 17-18 2026 (no-rate properties ranked in upper half)",
        "items": [
          "Baoase Luxury Resort (Willemstad, Curacao)",
          "Jumby Bay Island (Antigua)",
          "Amanera (Playa Grande, Dominican Republic)",
          "Le Barthelemy Hotel & Spa (St. Barths)",
          "Amanyara (Providenciales, Turks & Caicos)",
          "Cheval Blanc (St. Barths)",
          "Sandy Lane (St. James, Barbados)",
          "Dorado Beach, a Ritz-Carlton Reserve (Dorado, Puerto Rico)",
          "COMO Parrot Cay (Parrot Cay, Turks & Caicos)",
          "Jade Mountain (Soufrière, St. Lucia)",
          "Eden Rock (St. Barths)",
          "St. Regis Bahia Beach Resort (Río Grande, Puerto Rico)",
          "Belmond Cap Juluca (Anguilla)",
          "Curtain Bluff (Antigua)",
          "Secret Bay (Dominica)",
          "Rosewood Little Dix Bay (Virgin Gorda, British Virgin Islands)",
          "Eden Roc Cap Cana (Cap Cana, Dominican Republic)",
          "Four Seasons Resort Anguilla (Barnes Bay, Anguilla)",
          "The Ritz-Carlton, Grand Cayman (Seven Mile Beach, Grand Cayman)",
          "Kimpton Seafire Resort & Spa (Seven Mile Beach, Grand Cayman)",
          "Montpelier Plantation & Beach (Charlestown, Nevis)"
        ]
      },
      "forbes": {
        "label": "Forbes Travel Guide 2025 · Five-Star Caribbean Hotels (unordered)",
        "url": "https://www.forbestravelguide.com/",
        "unordered": true,
        "items": [
          "Belmond Cap Juluca (Anguilla)",
          "Cheval Blanc (St. Barths)",
          "Dorado Beach, a Ritz-Carlton Reserve (Dorado, Puerto Rico)",
          "Eden Rock (St. Barths)",
          "Four Seasons Resort Anguilla (Barnes Bay, Anguilla)",
          "Kimpton Seafire Resort & Spa (Seven Mile Beach, Grand Cayman)",
          "The Ritz-Carlton, Grand Cayman (Seven Mile Beach, Grand Cayman)",
          "Rosewood Little Dix Bay (Virgin Gorda, British Virgin Islands)",
          "Sandy Lane (St. James, Barbados)",
          "St. Regis Bahia Beach Resort (Río Grande, Puerto Rico)"
        ]
      },
      "pointsguy": {
        "label": "The Points Guy · Best Caribbean Resorts 2025 (unordered roundup)",
        "url": "https://thepointsguy.com/hotel/best-caribbean-resorts/",
        "unordered": true,
        "items": [
          "Amanyara (Providenciales, Turks & Caicos)",
          "Amanera (Playa Grande, Dominican Republic)",
          "Jade Mountain (Soufrière, St. Lucia)",
          "Eden Rock (St. Barths)",
          "Secret Bay (Dominica)",
          "Rosewood Little Dix Bay (Virgin Gorda, British Virgin Islands)",
          "Dorado Beach, a Ritz-Carlton Reserve (Dorado, Puerto Rico)",
          "Sandy Lane (St. James, Barbados)",
          "Jumby Bay Island (Antigua)",
          "Kimpton Seafire Resort & Spa (Seven Mile Beach, Grand Cayman)"
        ]
      },
      "afar": {
        "label": "AFAR · 31 Best Luxury Caribbean Resorts (alphabetical)",
        "url": "https://www.afar.com/magazine/best-luxury-caribbean-resorts",
        "unordered": true,
        "items": [
          "Amanera (Playa Grande, Dominican Republic)",
          "Belmond Cap Juluca (Anguilla)",
          "Cheval Blanc (St. Barths)",
          "COMO Parrot Cay (Parrot Cay, Turks & Caicos)",
          "Eden Rock (St. Barths)",
          "Four Seasons Resort Anguilla (Barnes Bay, Anguilla)",
          "Jade Mountain (Soufrière, St. Lucia)",
          "Jumby Bay Island (Antigua)",
          "Kimpton Seafire Resort & Spa (Seven Mile Beach, Grand Cayman)",
          "Montpelier Plantation & Beach (Charlestown, Nevis)",
          "Dorado Beach, a Ritz-Carlton Reserve (Dorado, Puerto Rico)",
          "Rosewood Little Dix Bay (Virgin Gorda, British Virgin Islands)",
          "Secret Bay (Dominica)"
        ]
      }
    },
    "vote": {
      "items": [
        "Jade Mountain (Soufrière, St. Lucia)",
        "Jumby Bay Island (Antigua)",
        "Amanera (Playa Grande, Dominican Republic)",
        "Amanyara (Providenciales, Turks & Caicos)",
        "Sandy Lane (St. James, Barbados)",
        "Secret Bay (Dominica)",
        "Rosewood Little Dix Bay (Virgin Gorda, British Virgin Islands)",
        "Dorado Beach, a Ritz-Carlton Reserve (Dorado, Puerto Rico)",
        "Eden Roc Cap Cana (Cap Cana, Dominican Republic)",
        "Le Barthelemy Hotel & Spa (St. Barths)"
      ]
    }
  },
  {
    "id": "resorts-turkey",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-29T03:13:01Z",
    "title": "Best Resorts in Turkey",
    "category": "Turkey",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "Aegean hideaways above Bodrum's bays, Barbaros Bay grandeur, and Bosphorus palace hotels in Istanbul. Turkey's most acclaimed luxury resorts, by consensus.",
    "defaultSource": "ai",
    "links": {
      "Amanruya (Demir, Bodrum)": "https://www.google.com/maps/search/?api=1&query=Amanruya%20Demir%20Bodrum",
      "Avantgarde Yalikavak (Yalikavak, Bodrum)": "https://www.google.com/maps/search/?api=1&query=Avantgarde%20Yalikavak%20Yalikavak%20Bodrum",
      "Bodrum Loft (Golturkbuku, Bodrum)": "https://www.google.com/maps/search/?api=1&query=Bodrum%20Loft%20Golturkbuku%20Bodrum",
      "Caresse, a Luxury Collection Resort & Spa (Gumbet, Bodrum)": "https://www.google.com/maps/search/?api=1&query=Caresse%20a%20Luxury%20Collection%20Resort%20Spa%20Gumbet%20Bodrum",
      "Casa Dell'Arte The Residence (Torba, Bodrum)": "https://www.google.com/maps/search/?api=1&query=Casa%20Dell%20Arte%20The%20Residence%20Torba%20Bodrum",
      "Ciragan Palace Kempinski Istanbul (Besiktas, Istanbul)": "https://www.google.com/maps/search/?api=1&query=Ciragan%20Palace%20Kempinski%20Istanbul%20Besiktas%20Istanbul",
      "D Maris Bay (Hisaronu, Marmaris)": "https://www.google.com/maps/search/?api=1&query=D%20Maris%20Bay%20Hisaronu%20Marmaris",
      "Four Seasons Hotel Istanbul at the Bosphorus (Besiktas, Istanbul)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Hotel%20Istanbul%20at%20the%20Bosphorus%20Besiktas%20Istanbul",
      "Kempinski Hotel Barbaros Bay Bodrum (Yaliciftlik, Bodrum)": "https://www.google.com/maps/search/?api=1&query=Kempinski%20Hotel%20Barbaros%20Bay%20Bodrum%20Yaliciftlik%20Bodrum",
      "METT Hotel & Beach Resort Bodrum (Haremtan, Bodrum)": "https://www.google.com/maps/search/?api=1&query=METT%20Hotel%20Beach%20Resort%20Bodrum%20Haremtan%20Bodrum",
      "Macakizi (Turkbuku, Bodrum)": "https://www.google.com/maps/search/?api=1&query=Macakizi%20Turkbuku%20Bodrum",
      "Mandarin Oriental Bodrum (Golturkbuku, Bodrum)": "https://www.google.com/maps/search/?api=1&query=Mandarin%20Oriental%20Bodrum%20Golturkbuku%20Bodrum",
      "Maxx Royal Bodrum (Golkoy, Bodrum)": "https://www.google.com/maps/search/?api=1&query=Maxx%20Royal%20Bodrum%20Golkoy%20Bodrum",
      "OKU Bodrum (Golturkbuku, Bodrum)": "https://www.google.com/maps/search/?api=1&query=OKU%20Bodrum%20Golturkbuku%20Bodrum",
      "Park Hyatt Istanbul Macka Palas (Nisantasi, Istanbul)": "https://www.google.com/maps/search/?api=1&query=Park%20Hyatt%20Istanbul%20Macka%20Palas%20Nisantasi%20Istanbul",
      "Scorpios Bodrum (Golturkbuku, Bodrum)": "https://www.google.com/maps/search/?api=1&query=Scorpios%20Bodrum%20Golturkbuku%20Bodrum",
      "Six Senses Kaplankaya (Kaplankaya, Bodrum)": "https://www.google.com/maps/search/?api=1&query=Six%20Senses%20Kaplankaya%20Kaplankaya%20Bodrum",
      "Susona Bodrum, LXR Hotels & Resorts (Torba, Bodrum)": "https://www.google.com/maps/search/?api=1&query=Susona%20Bodrum%20LXR%20Hotels%20Resorts%20Torba%20Bodrum",
      "Swissotel Resort Bodrum Beach (Turgutreis, Bodrum)": "https://www.google.com/maps/search/?api=1&query=Swissotel%20Resort%20Bodrum%20Beach%20Turgutreis%20Bodrum",
      "The Bodrum EDITION (Yalikavak, Bodrum)": "https://www.google.com/maps/search/?api=1&query=The%20Bodrum%20EDITION%20Yalikavak%20Bodrum",
      "The Marmara Bodrum (Yokusbasi, Bodrum)": "https://www.google.com/maps/search/?api=1&query=The%20Marmara%20Bodrum%20Yokusbasi%20Bodrum",
      "The Peninsula Istanbul (Karakoy, Istanbul)": "https://www.google.com/maps/search/?api=1&query=The%20Peninsula%20Istanbul%20Karakoy%20Istanbul"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Kempinski Hotel Barbaros Bay Bodrum (Yaliciftlik, Bodrum)",
          "Mandarin Oriental Bodrum (Golturkbuku, Bodrum)",
          "Amanruya (Demir, Bodrum)",
          "Susona Bodrum, LXR Hotels & Resorts (Torba, Bodrum)",
          "The Bodrum EDITION (Yalikavak, Bodrum)",
          "Six Senses Kaplankaya (Kaplankaya, Bodrum)",
          "Ciragan Palace Kempinski Istanbul (Besiktas, Istanbul)",
          "Four Seasons Hotel Istanbul at the Bosphorus (Besiktas, Istanbul)",
          "The Peninsula Istanbul (Karakoy, Istanbul)",
          "Caresse, a Luxury Collection Resort & Spa (Gumbet, Bodrum)"
        ]
      },
      "luxurytraveldiary": {
        "label": "Luxury Travel Diary · Top Luxury Hotels in Turkey 2025",
        "url": "https://www.luxurytraveldiary.com/2025/06/top-10-best-luxury-hotels-in-turkey/",
        "items": [
          "Kempinski Hotel Barbaros Bay Bodrum (Yaliciftlik, Bodrum)",
          "The Peninsula Istanbul (Karakoy, Istanbul)",
          "Susona Bodrum, LXR Hotels & Resorts (Torba, Bodrum)",
          "Park Hyatt Istanbul Macka Palas (Nisantasi, Istanbul)",
          "Four Seasons Hotel Istanbul at the Bosphorus (Besiktas, Istanbul)",
          "Ciragan Palace Kempinski Istanbul (Besiktas, Istanbul)",
          "Avantgarde Yalikavak (Yalikavak, Bodrum)",
          "Amanruya (Demir, Bodrum)",
          "Mandarin Oriental Bodrum (Golturkbuku, Bodrum)",
          "Six Senses Kaplankaya (Kaplankaya, Bodrum)",
          "The Bodrum EDITION (Yalikavak, Bodrum)"
        ]
      },
      "travelplusstyle": {
        "label": "TravelPlusStyle · Best 5-Star Bodrum Resorts 2025",
        "url": "https://www.travelplusstyle.com/magazine/top-best-exclusive-5-star-luxury-beach-hotels-resorts-bodrum-turkey-travelplusstyle",
        "items": [
          "Amanruya (Demir, Bodrum)",
          "Mandarin Oriental Bodrum (Golturkbuku, Bodrum)",
          "Scorpios Bodrum (Golturkbuku, Bodrum)",
          "The Bodrum EDITION (Yalikavak, Bodrum)",
          "Six Senses Kaplankaya (Kaplankaya, Bodrum)",
          "Maxx Royal Bodrum (Golkoy, Bodrum)",
          "METT Hotel & Beach Resort Bodrum (Haremtan, Bodrum)",
          "Macakizi (Turkbuku, Bodrum)",
          "Bodrum Loft (Golturkbuku, Bodrum)",
          "Caresse, a Luxury Collection Resort & Spa (Gumbet, Bodrum)",
          "OKU Bodrum (Golturkbuku, Bodrum)"
        ]
      },
      "luxurytraveldiarybodrum": {
        "label": "Luxury Travel Diary · Best Luxury Hotels in Bodrum 2025",
        "url": "https://www.luxurytraveldiary.com/2025/07/10-best-luxury-hotels-in-bodrum/",
        "items": [
          "Kempinski Hotel Barbaros Bay Bodrum (Yaliciftlik, Bodrum)",
          "Susona Bodrum, LXR Hotels & Resorts (Torba, Bodrum)",
          "Amanruya (Demir, Bodrum)",
          "Mandarin Oriental Bodrum (Golturkbuku, Bodrum)",
          "Caresse, a Luxury Collection Resort & Spa (Gumbet, Bodrum)",
          "The Bodrum EDITION (Yalikavak, Bodrum)",
          "D Maris Bay (Hisaronu, Marmaris)",
          "Swissotel Resort Bodrum Beach (Turgutreis, Bodrum)",
          "Casa Dell'Arte The Residence (Torba, Bodrum)",
          "Avantgarde Yalikavak (Yalikavak, Bodrum)",
          "The Marmara Bodrum (Yokusbasi, Bodrum)"
        ]
      }
    },
    "vote": {
      "items": [
        "Ciragan Palace Kempinski Istanbul (Besiktas, Istanbul)",
        "Mandarin Oriental Bodrum (Golturkbuku, Bodrum)",
        "Amanruya (Demir, Bodrum)",
        "Six Senses Kaplankaya (Kaplankaya, Bodrum)",
        "Kempinski Hotel Barbaros Bay Bodrum (Yaliciftlik, Bodrum)",
        "Four Seasons Hotel Istanbul at the Bosphorus (Besiktas, Istanbul)",
        "The Peninsula Istanbul (Karakoy, Istanbul)",
        "The Bodrum EDITION (Yalikavak, Bodrum)",
        "Maxx Royal Bodrum (Golkoy, Bodrum)",
        "Caresse, a Luxury Collection Resort & Spa (Gumbet, Bodrum)"
      ]
    }
  },
  {
    "id": "resorts-abu-dhabi",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-29T03:13:02Z",
    "title": "Best Resorts in Abu Dhabi",
    "category": "Abu Dhabi",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "Saadiyat Island beachfront palaces, a Corniche icon, and a dune-fringed desert retreat in the Liwa. Abu Dhabi's most acclaimed luxury resorts, by consensus.",
    "defaultSource": "ai",
    "links": {
      "Al Wathba, a Luxury Collection Desert Resort & Spa (Al Wathba)": "https://www.google.com/maps/search/?api=1&query=Al%20Wathba%20a%20Luxury%20Collection%20Desert%20Resort%20Spa%20Al%20Wathba",
      "Anantara Sir Bani Yas Island Resort (Sir Bani Yas Island)": "https://www.google.com/maps/search/?api=1&query=Anantara%20Sir%20Bani%20Yas%20Island%20Resort%20Sir%20Bani%20Yas%20Island",
      "Conrad Abu Dhabi Etihad Towers (Corniche)": "https://www.google.com/maps/search/?api=1&query=Conrad%20Abu%20Dhabi%20Etihad%20Towers%20Corniche",
      "Emirates Palace Mandarin Oriental (Corniche)": "https://www.google.com/maps/search/?api=1&query=Emirates%20Palace%20Mandarin%20Oriental%20Corniche",
      "Fairmont Bab Al Bahr (Bain Al Jessrain)": "https://www.google.com/maps/search/?api=1&query=Fairmont%20Bab%20Al%20Bahr%20Bain%20Al%20Jessrain",
      "Four Seasons Hotel Abu Dhabi (Al Maryah Island)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Hotel%20Abu%20Dhabi%20Al%20Maryah%20Island",
      "Grand Hyatt Abu Dhabi (Corniche)": "https://www.google.com/maps/search/?api=1&query=Grand%20Hyatt%20Abu%20Dhabi%20Corniche",
      "Jumeirah at Saadiyat Island Resort (Saadiyat Island)": "https://www.google.com/maps/search/?api=1&query=Jumeirah%20at%20Saadiyat%20Island%20Resort%20Saadiyat%20Island",
      "Park Hyatt Abu Dhabi (Saadiyat Island)": "https://www.google.com/maps/search/?api=1&query=Park%20Hyatt%20Abu%20Dhabi%20Saadiyat%20Island",
      "Qasr Al Sarab Desert Resort by Anantara (Liwa Desert)": "https://www.google.com/maps/search/?api=1&query=Qasr%20Al%20Sarab%20Desert%20Resort%20by%20Anantara%20Liwa%20Desert",
      "Rosewood Abu Dhabi (Al Maryah Island)": "https://www.google.com/maps/search/?api=1&query=Rosewood%20Abu%20Dhabi%20Al%20Maryah%20Island",
      "Saadiyat Rotana Resort & Villas (Saadiyat Island)": "https://www.google.com/maps/search/?api=1&query=Saadiyat%20Rotana%20Resort%20Villas%20Saadiyat%20Island",
      "Shangri-La Qaryat Al Beri (Al Maqta)": "https://www.google.com/maps/search/?api=1&query=Shangri-La%20Qaryat%20Al%20Beri%20Al%20Maqta",
      "The Abu Dhabi EDITION (Al Bateen)": "https://www.google.com/maps/search/?api=1&query=The%20Abu%20Dhabi%20EDITION%20Al%20Bateen",
      "The Ritz-Carlton Abu Dhabi, Grand Canal (Grand Canal)": "https://www.google.com/maps/search/?api=1&query=The%20Ritz-Carlton%20Abu%20Dhabi%20Grand%20Canal%20Grand%20Canal",
      "The St. Regis Abu Dhabi (Corniche)": "https://www.google.com/maps/search/?api=1&query=The%20St%20Regis%20Abu%20Dhabi%20Corniche",
      "The St. Regis Saadiyat Island Resort (Saadiyat Island)": "https://www.google.com/maps/search/?api=1&query=The%20St%20Regis%20Saadiyat%20Island%20Resort%20Saadiyat%20Island",
      "Zaya Nurai Island (Nurai Island)": "https://www.google.com/maps/search/?api=1&query=Zaya%20Nurai%20Island%20Nurai%20Island"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Emirates Palace Mandarin Oriental (Corniche)",
          "The St. Regis Saadiyat Island Resort (Saadiyat Island)",
          "Park Hyatt Abu Dhabi (Saadiyat Island)",
          "Four Seasons Hotel Abu Dhabi (Al Maryah Island)",
          "The Ritz-Carlton Abu Dhabi, Grand Canal (Grand Canal)",
          "Rosewood Abu Dhabi (Al Maryah Island)",
          "Jumeirah at Saadiyat Island Resort (Saadiyat Island)",
          "The Abu Dhabi EDITION (Al Bateen)",
          "Shangri-La Qaryat Al Beri (Al Maqta)",
          "Fairmont Bab Al Bahr (Bain Al Jessrain)"
        ]
      },
      "luxurytraveldiary": {
        "label": "Luxury Travel Diary · Top Luxury Beach Hotels in Abu Dhabi 2025",
        "url": "https://www.luxurytraveldiary.com/2023/06/top-10-best-luxury-beach-hotels-in-abu-dhabi/",
        "items": [
          "Park Hyatt Abu Dhabi (Saadiyat Island)",
          "The St. Regis Saadiyat Island Resort (Saadiyat Island)",
          "Jumeirah at Saadiyat Island Resort (Saadiyat Island)",
          "The Ritz-Carlton Abu Dhabi, Grand Canal (Grand Canal)",
          "Emirates Palace Mandarin Oriental (Corniche)",
          "Fairmont Bab Al Bahr (Bain Al Jessrain)",
          "Grand Hyatt Abu Dhabi (Corniche)",
          "Anantara Sir Bani Yas Island Resort (Sir Bani Yas Island)",
          "Zaya Nurai Island (Nurai Island)",
          "Four Seasons Hotel Abu Dhabi (Al Maryah Island)"
        ]
      },
      "timeout": {
        "label": "Time Out Abu Dhabi · Best Hotels (area-grouped, unranked) 2025",
        "url": "https://www.timeoutabudhabi.com/hotels/best-hotels-in-abu-dhabi",
        "items": [
          "The St. Regis Saadiyat Island Resort (Saadiyat Island)",
          "Park Hyatt Abu Dhabi (Saadiyat Island)",
          "Emirates Palace Mandarin Oriental (Corniche)",
          "Conrad Abu Dhabi Etihad Towers (Corniche)",
          "The St. Regis Abu Dhabi (Corniche)",
          "The Abu Dhabi EDITION (Al Bateen)",
          "Fairmont Bab Al Bahr (Bain Al Jessrain)",
          "Shangri-La Qaryat Al Beri (Al Maqta)",
          "The Ritz-Carlton Abu Dhabi, Grand Canal (Grand Canal)",
          "Four Seasons Hotel Abu Dhabi (Al Maryah Island)",
          "Rosewood Abu Dhabi (Al Maryah Island)",
          "Al Wathba, a Luxury Collection Desert Resort & Spa (Al Wathba)",
          "Qasr Al Sarab Desert Resort by Anantara (Liwa Desert)"
        ],
        "unordered": true
      },
      "theluxuryeditor": {
        "label": "The Luxury Editor · Best Luxury Hotels in Abu Dhabi (unranked) 2026",
        "url": "https://theluxuryeditor.com/best-hotels-in-abu-dhabi/",
        "items": [
          "Rosewood Abu Dhabi (Al Maryah Island)",
          "Emirates Palace Mandarin Oriental (Corniche)",
          "Four Seasons Hotel Abu Dhabi (Al Maryah Island)",
          "The Abu Dhabi EDITION (Al Bateen)",
          "Park Hyatt Abu Dhabi (Saadiyat Island)",
          "Shangri-La Qaryat Al Beri (Al Maqta)",
          "The Ritz-Carlton Abu Dhabi, Grand Canal (Grand Canal)",
          "The St. Regis Saadiyat Island Resort (Saadiyat Island)",
          "Jumeirah at Saadiyat Island Resort (Saadiyat Island)",
          "Grand Hyatt Abu Dhabi (Corniche)",
          "Saadiyat Rotana Resort & Villas (Saadiyat Island)",
          "Al Wathba, a Luxury Collection Desert Resort & Spa (Al Wathba)"
        ],
        "unordered": true
      }
    },
    "vote": {
      "items": [
        "Emirates Palace Mandarin Oriental (Corniche)",
        "The St. Regis Saadiyat Island Resort (Saadiyat Island)",
        "Qasr Al Sarab Desert Resort by Anantara (Liwa Desert)",
        "Park Hyatt Abu Dhabi (Saadiyat Island)",
        "Jumeirah at Saadiyat Island Resort (Saadiyat Island)",
        "Zaya Nurai Island (Nurai Island)",
        "Rosewood Abu Dhabi (Al Maryah Island)",
        "Four Seasons Hotel Abu Dhabi (Al Maryah Island)",
        "The Abu Dhabi EDITION (Al Bateen)",
        "Saadiyat Rotana Resort & Villas (Saadiyat Island)"
      ]
    }
  },
  {
    "id": "private-schools-florida",
    "publishedDate": "2026-05-29",
    "publishedAt": "2026-05-29T12:09:37Z",
    "title": "Best Private Schools in Florida",
    "category": "Florida",
    "type": "other",
    "tags": [
      "other"
    ],
    "linkType": "mapsCity",
    "blurb": "College-prep powerhouses from Coconut Grove to Tampa Bay, ranked by selectivity and elite-college matriculation. Florida's most prestigious private schools, by consensus.",
    "defaultSource": "ai",
    "links": {
      "American Heritage School (Delray Beach, West Palm Beach)": "https://www.google.com/maps/search/?api=1&query=American%20Heritage%20School%20Delray%20Beach%20West%20Palm%20Beach%20FL",
      "American Heritage School (Plantation, Fort Lauderdale)": "https://www.google.com/maps/search/?api=1&query=American%20Heritage%20School%20Plantation%20Fort%20Lauderdale%20FL",
      "Belen Jesuit Preparatory School (Tamiami, Miami)": "https://www.google.com/maps/search/?api=1&query=Belen%20Jesuit%20Preparatory%20School%20Tamiami%20Miami%20FL",
      "Berkeley Preparatory School (Town 'n' Country, Tampa)": "https://www.google.com/maps/search/?api=1&query=Berkeley%20Preparatory%20School%20Town%20n%20Country%20Tampa%20FL",
      "Carrollton School of the Sacred Heart (Coconut Grove, Miami)": "https://www.google.com/maps/search/?api=1&query=Carrollton%20School%20of%20the%20Sacred%20Heart%20Coconut%20Grove%20Miami%20FL",
      "David Posnack Jewish Day School (Davie, Fort Lauderdale)": "https://www.google.com/maps/search/?api=1&query=David%20Posnack%20Jewish%20Day%20School%20Davie%20Fort%20Lauderdale%20FL",
      "Donna Klein Jewish Academy (Boca Raton, West Palm Beach)": "https://www.google.com/maps/search/?api=1&query=Donna%20Klein%20Jewish%20Academy%20Boca%20Raton%20West%20Palm%20Beach%20FL",
      "Dwight Global Online School (Downtown, West Palm Beach)": "https://www.google.com/maps/search/?api=1&query=Dwight%20Global%20Online%20School%20Downtown%20West%20Palm%20Beach%20FL",
      "Episcopal School of Jacksonville (Empire Point, Jacksonville)": "https://www.google.com/maps/search/?api=1&query=Episcopal%20School%20of%20Jacksonville%20Empire%20Point%20Jacksonville%20FL",
      "Gulliver Preparatory School (Pinecrest, Miami)": "https://www.google.com/maps/search/?api=1&query=Gulliver%20Preparatory%20School%20Pinecrest%20Miami%20FL",
      "Miami Country Day School (Miami Shores, Miami)": "https://www.google.com/maps/search/?api=1&query=Miami%20Country%20Day%20School%20Miami%20Shores%20Miami%20FL",
      "NSU University School (Davie, Fort Lauderdale)": "https://www.google.com/maps/search/?api=1&query=NSU%20University%20School%20Davie%20Fort%20Lauderdale%20FL",
      "North Broward Preparatory School (Coconut Creek, Fort Lauderdale)": "https://www.google.com/maps/search/?api=1&query=North%20Broward%20Preparatory%20School%20Coconut%20Creek%20Fort%20Lauderdale%20FL",
      "Oxbridge Academy (Roosevelt Estates, West Palm Beach)": "https://www.google.com/maps/search/?api=1&query=Oxbridge%20Academy%20Roosevelt%20Estates%20West%20Palm%20Beach%20FL",
      "Palmer Trinity School (Palmetto Bay, Miami)": "https://www.google.com/maps/search/?api=1&query=Palmer%20Trinity%20School%20Palmetto%20Bay%20Miami%20FL",
      "Pine Crest School (Imperial Point, Fort Lauderdale)": "https://www.google.com/maps/search/?api=1&query=Pine%20Crest%20School%20Imperial%20Point%20Fort%20Lauderdale%20FL",
      "Ransom Everglades School (Coconut Grove, Miami)": "https://www.google.com/maps/search/?api=1&query=Ransom%20Everglades%20School%20Coconut%20Grove%20Miami%20FL",
      "Saint Andrew's School (Boca Raton, West Palm Beach)": "https://www.google.com/maps/search/?api=1&query=Saint%20Andrew%20s%20School%20Boca%20Raton%20West%20Palm%20Beach%20FL",
      "St. Edward's School (Central Beach, Vero Beach)": "https://www.google.com/maps/search/?api=1&query=St.%20Edward%20s%20School%20Central%20Beach%20Vero%20Beach%20FL",
      "St. John Paul II Academy (Boca Raton, West Palm Beach)": "https://www.google.com/maps/search/?api=1&query=St.%20John%20Paul%20II%20Academy%20Boca%20Raton%20West%20Palm%20Beach%20FL",
      "The Benjamin School (Palm Beach Gardens, West Palm Beach)": "https://www.google.com/maps/search/?api=1&query=The%20Benjamin%20School%20Palm%20Beach%20Gardens%20West%20Palm%20Beach%20FL",
      "The Bolles School (San Jose, Jacksonville)": "https://www.google.com/maps/search/?api=1&query=The%20Bolles%20School%20San%20Jose%20Jacksonville%20FL",
      "The King's Academy (Golden Lakes, West Palm Beach)": "https://www.google.com/maps/search/?api=1&query=The%20King%20s%20Academy%20Golden%20Lakes%20West%20Palm%20Beach%20FL",
      "Trinity Preparatory School (Winter Park, Orlando)": "https://www.google.com/maps/search/?api=1&query=Trinity%20Preparatory%20School%20Winter%20Park%20Orlando%20FL"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Ransom Everglades School (Coconut Grove, Miami)",
          "American Heritage School (Plantation, Fort Lauderdale)",
          "Pine Crest School (Imperial Point, Fort Lauderdale)",
          "Berkeley Preparatory School (Town 'n' Country, Tampa)",
          "Gulliver Preparatory School (Pinecrest, Miami)",
          "American Heritage School (Delray Beach, West Palm Beach)",
          "The Bolles School (San Jose, Jacksonville)",
          "Saint Andrew's School (Boca Raton, West Palm Beach)",
          "The Benjamin School (Palm Beach Gardens, West Palm Beach)",
          "Belen Jesuit Preparatory School (Tamiami, Miami)"
        ]
      },
      "niche": {
        "label": "Niche · 2026 Best Private High Schools in Florida",
        "url": "https://www.niche.com/k12/search/best-private-high-schools/s/florida/",
        "items": [
          "Dwight Global Online School (Downtown, West Palm Beach)",
          "Ransom Everglades School (Coconut Grove, Miami)",
          "American Heritage School (Plantation, Fort Lauderdale)",
          "Berkeley Preparatory School (Town 'n' Country, Tampa)",
          "David Posnack Jewish Day School (Davie, Fort Lauderdale)",
          "Gulliver Preparatory School (Pinecrest, Miami)",
          "NSU University School (Davie, Fort Lauderdale)",
          "Pine Crest School (Imperial Point, Fort Lauderdale)",
          "American Heritage School (Delray Beach, West Palm Beach)",
          "Donna Klein Jewish Academy (Boca Raton, West Palm Beach)"
        ]
      },
      "polaris": {
        "label": "PolarisList · Best Private High Schools in Florida (HYPSM matriculation) 2025",
        "url": "https://www.polarislist.com/best-private-high-schools-in-florida",
        "items": [
          "Ransom Everglades School (Coconut Grove, Miami)",
          "Pine Crest School (Imperial Point, Fort Lauderdale)",
          "American Heritage School (Plantation, Fort Lauderdale)",
          "American Heritage School (Delray Beach, West Palm Beach)",
          "Gulliver Preparatory School (Pinecrest, Miami)",
          "The Bolles School (San Jose, Jacksonville)",
          "Berkeley Preparatory School (Town 'n' Country, Tampa)",
          "Trinity Preparatory School (Winter Park, Orlando)",
          "St. Edward's School (Central Beach, Vero Beach)",
          "Episcopal School of Jacksonville (Empire Point, Jacksonville)"
        ]
      },
      "sapneil": {
        "label": "SapNeil Tutoring · Florida's Most Competitive Private Schools 2025",
        "url": "https://www.sapneiltutoring.com/post/florida-most-competitive-private-schools",
        "items": [
          "Ransom Everglades School (Coconut Grove, Miami)",
          "Pine Crest School (Imperial Point, Fort Lauderdale)",
          "Berkeley Preparatory School (Town 'n' Country, Tampa)",
          "Gulliver Preparatory School (Pinecrest, Miami)",
          "American Heritage School (Plantation, Fort Lauderdale)",
          "Saint Andrew's School (Boca Raton, West Palm Beach)",
          "The Benjamin School (Palm Beach Gardens, West Palm Beach)",
          "Carrollton School of the Sacred Heart (Coconut Grove, Miami)",
          "Oxbridge Academy (Roosevelt Estates, West Palm Beach)",
          "Miami Country Day School (Miami Shores, Miami)",
          "The King's Academy (Golden Lakes, West Palm Beach)",
          "Belen Jesuit Preparatory School (Tamiami, Miami)",
          "Palmer Trinity School (Palmetto Bay, Miami)",
          "North Broward Preparatory School (Coconut Creek, Fort Lauderdale)",
          "St. John Paul II Academy (Boca Raton, West Palm Beach)"
        ]
      }
    },
    "vote": {
      "items": [
        "Ransom Everglades School (Coconut Grove, Miami)",
        "Pine Crest School (Imperial Point, Fort Lauderdale)",
        "American Heritage School (Plantation, Fort Lauderdale)",
        "Berkeley Preparatory School (Town 'n' Country, Tampa)",
        "Gulliver Preparatory School (Pinecrest, Miami)",
        "The Bolles School (San Jose, Jacksonville)",
        "Saint Andrew's School (Boca Raton, West Palm Beach)",
        "The Benjamin School (Palm Beach Gardens, West Palm Beach)",
        "Belen Jesuit Preparatory School (Tamiami, Miami)",
        "Carrollton School of the Sacred Heart (Coconut Grove, Miami)"
      ]
    }
  },
  {
    "id": "kirkland-signature-costco",
    "publishedDate": "2026-05-29",
    "publishedAt": "2026-05-29T12:09:38Z",
    "title": "Best Kirkland Signature Products at Costco",
    "category": "Costco",
    "type": "product",
    "tags": [
      "product",
      "food",
      "food-drink"
    ],
    "linkType": "google",
    "blurb": "The cult Costco store-brand staples worth the membership, from the near-unanimous olive oil to the famous rotisserie chicken. Kirkland Signature's best, by consensus.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Kirkland Signature Extra Virgin Olive Oil",
          "Kirkland Signature Imported Basil Pesto",
          "Kirkland Signature Super Premium Vanilla Ice Cream",
          "Kirkland Signature Organic Maple Syrup",
          "Kirkland Signature Fancy Whole Cashews",
          "Kirkland Signature Cauliflower Crust Pizza",
          "Kirkland Signature Rotisserie Chicken",
          "Kirkland Signature Toilet Paper",
          "Kirkland Signature Paper Towels",
          "Kirkland Signature French Vodka"
        ]
      },
      "etnt25": {
        "label": "Eat This, Not That! · 11 Best Kirkland Products Ranked 2025",
        "url": "https://www.eatthis.com/best-costco-kirkland-products-ranked/",
        "items": [
          "Kirkland Signature Extra Virgin Olive Oil",
          "Kirkland Signature Kitchen Trash Bags",
          "Kirkland Signature Stretch-Tite Plastic Wrap",
          "Kirkland Signature Paper Towels",
          "Kirkland Signature Chocolate-Covered Almonds",
          "Kirkland Signature Walnut Halves",
          "Kirkland Signature Toilet Paper",
          "Kirkland Signature Organic Almond Milk",
          "Kirkland Signature Green Tea",
          "Kirkland Signature Medium Roast Coffee",
          "Kirkland Signature Glucosamine Chondroitin"
        ]
      },
      "ttpop": {
        "label": "Tasting Table · 10 Most Popular Kirkland Products 2025",
        "url": "https://www.tastingtable.com/1942943/most-popular-costco-kirkland-signature-products/",
        "items": [
          "Kirkland Signature Extra Virgin Olive Oil",
          "Kirkland Signature Organic Peanut Butter",
          "Kirkland Signature Organic Maple Syrup",
          "Kirkland Signature Imported Basil Pesto",
          "Kirkland Signature Super Premium Vanilla Ice Cream",
          "Kirkland Signature Cauliflower Crust Pizza",
          "Kirkland Signature Rotisserie Chicken",
          "Kirkland Signature Premium Bottled Water",
          "Kirkland Signature Fancy Whole Cashews",
          "Kirkland Signature French Vodka"
        ]
      },
      "ttworth": {
        "label": "Tasting Table · Best Kirkland Products Worth the Membership 2025",
        "url": "https://www.tastingtable.com/2025116/best-kirkland-products-worth-costco-membership/",
        "items": [
          "Kirkland Signature Super Premium Vanilla Ice Cream",
          "Kirkland Signature Rotisserie Chicken",
          "Kirkland Signature Toilet Paper",
          "Kirkland Signature Imported Basil Pesto",
          "Kirkland Signature Paper Towels",
          "Kirkland Signature Extra Virgin Olive Oil",
          "Kirkland Signature Fancy Whole Cashews",
          "Kirkland Signature Single Barrel Bourbon",
          "Kirkland Signature Organic Maple Syrup",
          "Kirkland Signature Cauliflower Crust Pizza"
        ]
      },
      "dailymeal": {
        "label": "The Daily Meal · Kirkland Items You Should Always Grab 2025",
        "url": "https://www.thedailymeal.com/1734145/kirkland-items-costco-always-grab-leave-shelf/",
        "items": [
          "Kirkland Signature Extra Virgin Olive Oil",
          "Kirkland Signature Organic Frozen Blueberries",
          "Kirkland Signature Organic Maple Syrup",
          "Kirkland Signature Parmigiano Reggiano",
          "Kirkland Signature French Vodka",
          "Kirkland Signature Fancy Whole Cashews",
          "Kirkland Signature Organic Balsamic Vinegar"
        ]
      },
      "etnt24": {
        "label": "Eat This, Not That! · 16 Best Kirkland Products 2024",
        "url": "https://www.eatthis.com/best-kirkland-products-costco/",
        "items": [
          "Kirkland Signature Extra Virgin Olive Oil",
          "Kirkland Signature Imported Basil Pesto",
          "Kirkland Signature French Vodka",
          "Kirkland Signature Breakfast Sandwiches",
          "Kirkland Signature Caramel S'Mores Clusters",
          "Kirkland Signature Super Premium Vanilla Ice Cream",
          "Kirkland Signature Breaded Chicken Breast Chunks",
          "Kirkland Signature Coastal Cheddar Cheese",
          "Kirkland Signature Cream Cheese",
          "Kirkland Signature Chocolate Chip Cookies",
          "Kirkland Signature Praline Pecans",
          "Kirkland Signature Nut Bars",
          "Kirkland Signature Sriracha Seasoning",
          "Kirkland Signature Beef Lasagna",
          "Kirkland Signature Cauliflower Crust Pizza",
          "Kirkland Signature Chicken Wings"
        ]
      }
    },
    "vote": {
      "items": [
        "Kirkland Signature Extra Virgin Olive Oil",
        "Kirkland Signature Rotisserie Chicken",
        "Kirkland Signature Super Premium Vanilla Ice Cream",
        "Kirkland Signature Imported Basil Pesto",
        "Kirkland Signature Organic Maple Syrup",
        "Kirkland Signature Fancy Whole Cashews",
        "Kirkland Signature Cauliflower Crust Pizza",
        "Kirkland Signature French Vodka",
        "Kirkland Signature Paper Towels",
        "Kirkland Signature Chocolate Chip Cookies"
      ]
    }
  },
  {
    "id": "midtown-happy-hour",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T11:18:46Z",
    "title": "Best Happy Hour Spots in Midtown Manhattan",
    "category": "New York",
    "type": "food",
    "tags": [
      "bars",
      "nightlife",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "The Dynamo Room (Midtown East)": "https://www.google.com/maps/search/?api=1&query=The%20Dynamo%20Room%20Midtown%20East%20Midtown%20New%20York%20NY",
      "Double Knot (NoMad)": "https://www.google.com/maps/search/?api=1&query=Double%20Knot%20NoMad%20Midtown%20New%20York%20NY",
      "Russian Vodka Room (Theater District)": "https://www.google.com/maps/search/?api=1&query=Russian%20Vodka%20Room%20Theater%20District%20Midtown%20New%20York%20NY",
      "Hofbräu Bierhaus NYC (Midtown East)": "https://www.google.com/maps/search/?api=1&query=Hofbr%C3%A4u%20Bierhaus%20NYC%20Midtown%20East%20Midtown%20New%20York%20NY",
      "The Friki Tiki (Theater District)": "https://www.google.com/maps/search/?api=1&query=The%20Friki%20Tiki%20Theater%20District%20Midtown%20New%20York%20NY",
      "RPM Underground (Midtown West)": "https://www.google.com/maps/search/?api=1&query=RPM%20Underground%20Midtown%20West%20Midtown%20New%20York%20NY",
      "Valerie (Midtown West)": "https://www.google.com/maps/search/?api=1&query=Valerie%20Midtown%20West%20Midtown%20New%20York%20NY",
      "Beer Authority (Garment District)": "https://www.google.com/maps/search/?api=1&query=Beer%20Authority%20Garment%20District%20Midtown%20New%20York%20NY",
      "Castell Rooftop Lounge (Garment District)": "https://www.google.com/maps/search/?api=1&query=Castell%20Rooftop%20Lounge%20Garment%20District%20Midtown%20New%20York%20NY",
      "Peter Dillon's Pub (Midtown East)": "https://www.google.com/maps/search/?api=1&query=Peter%20Dillon%27s%20Pub%20Midtown%20East%20Midtown%20New%20York%20NY",
      "Playwright Irish Pub (Theater District)": "https://www.google.com/maps/search/?api=1&query=Playwright%20Irish%20Pub%20Theater%20District%20Midtown%20New%20York%20NY",
      "The Rum House (Theater District)": "https://www.google.com/maps/search/?api=1&query=The%20Rum%20House%20Theater%20District%20Midtown%20New%20York%20NY",
      "Ardesia (Hell's Kitchen)": "https://www.google.com/maps/search/?api=1&query=Ardesia%20Hell%27s%20Kitchen%20Midtown%20New%20York%20NY",
      "The Stag's Head (Midtown East)": "https://www.google.com/maps/search/?api=1&query=The%20Stag%27s%20Head%20Midtown%20East%20Midtown%20New%20York%20NY",
      "Draught 55 (Midtown East)": "https://www.google.com/maps/search/?api=1&query=Draught%2055%20Midtown%20East%20Midtown%20New%20York%20NY",
      "The Palm (Theater District)": "https://www.google.com/maps/search/?api=1&query=The%20Palm%20Theater%20District%20Midtown%20New%20York%20NY",
      "Marseille (Hell's Kitchen)": "https://www.google.com/maps/search/?api=1&query=Marseille%20Hell%27s%20Kitchen%20Midtown%20New%20York%20NY",
      "Bobby Van's Grill Times Square (Theater District)": "https://www.google.com/maps/search/?api=1&query=Bobby%20Van%27s%20Grill%20Times%20Square%20Theater%20District%20Midtown%20New%20York%20NY",
      "Mermaid Oyster Bar (Theater District)": "https://www.google.com/maps/search/?api=1&query=Mermaid%20Oyster%20Bar%20Theater%20District%20Midtown%20New%20York%20NY",
      "Boqueria West 40th Street (Midtown West)": "https://www.google.com/maps/search/?api=1&query=Boqueria%20West%2040th%20Street%20Midtown%20West%20Midtown%20New%20York%20NY",
      "Sicily Osteria (Theater District)": "https://www.google.com/maps/search/?api=1&query=Sicily%20Osteria%20Theater%20District%20Midtown%20New%20York%20NY",
      "Rosevale Kitchen + Cocktail Room (Theater District)": "https://www.google.com/maps/search/?api=1&query=Rosevale%20Kitchen%20%2B%20Cocktail%20Room%20Theater%20District%20Midtown%20New%20York%20NY",
      "RT60 Rooftop Bar (Theater District)": "https://www.google.com/maps/search/?api=1&query=RT60%20Rooftop%20Bar%20Theater%20District%20Midtown%20New%20York%20NY",
      "5 Napkin Burger (Hell's Kitchen)": "https://www.google.com/maps/search/?api=1&query=5%20Napkin%20Burger%20Hell%27s%20Kitchen%20Midtown%20New%20York%20NY",
      "Lady Blue (Theater District)": "https://www.google.com/maps/search/?api=1&query=Lady%20Blue%20Theater%20District%20Midtown%20New%20York%20NY",
      "Jimmy's Corner (Theater District)": "https://www.google.com/maps/search/?api=1&query=Jimmy%27s%20Corner%20Theater%20District%20Midtown%20New%20York%20NY",
      "The Pony Bar (Hell's Kitchen)": "https://www.google.com/maps/search/?api=1&query=The%20Pony%20Bar%20Hell%27s%20Kitchen%20Midtown%20New%20York%20NY",
      "Réunion (Hell's Kitchen)": "https://www.google.com/maps/search/?api=1&query=R%C3%A9union%20Hell%27s%20Kitchen%20Midtown%20New%20York%20NY",
      "Calle Dão (Midtown West)": "https://www.google.com/maps/search/?api=1&query=Calle%20D%C3%A3o%20Midtown%20West%20Midtown%20New%20York%20NY",
      "Tavern29 (Midtown East)": "https://www.google.com/maps/search/?api=1&query=Tavern29%20Midtown%20East%20Midtown%20New%20York%20NY",
      "Parker & Quinn (Garment District)": "https://www.google.com/maps/search/?api=1&query=Parker%20Quinn%20Garment%20District%20Midtown%20New%20York%20NY",
      "La Biblioteca (Midtown East)": "https://www.google.com/maps/search/?api=1&query=La%20Biblioteca%20Midtown%20East%20Midtown%20New%20York%20NY"
    },
    "blurb": "Where to drink well for less between Times Square and Grand Central: Midtown's best happy hours, by consensus.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Ardesia (Hell's Kitchen)",
          "Castell Rooftop Lounge (Garment District)",
          "Jimmy's Corner (Theater District)",
          "The Palm (Theater District)",
          "Marseille (Hell's Kitchen)",
          "The Rum House (Theater District)",
          "Bobby Van's Grill Times Square (Theater District)",
          "The Pony Bar (Hell's Kitchen)",
          "The Stag's Head (Midtown East)",
          "Mermaid Oyster Bar (Theater District)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation · Best Midtown Happy Hours (unranked)",
        "url": "https://www.theinfatuation.com/new-york/guides/best-midtown-happy-hour-nyc",
        "items": [
          "The Dynamo Room (Midtown East)",
          "Double Knot (NoMad)",
          "Russian Vodka Room (Theater District)",
          "Hofbräu Bierhaus NYC (Midtown East)",
          "The Friki Tiki (Theater District)",
          "RPM Underground (Midtown West)",
          "Valerie (Midtown West)",
          "Beer Authority (Garment District)",
          "Castell Rooftop Lounge (Garment District)",
          "Peter Dillon's Pub (Midtown East)",
          "Playwright Irish Pub (Theater District)",
          "The Rum House (Theater District)",
          "Ardesia (Hell's Kitchen)",
          "The Stag's Head (Midtown East)",
          "Draught 55 (Midtown East)"
        ],
        "unordered": true
      },
      "timeout_td": {
        "label": "Time Out · 12 Best Happy Hours in the Theater District 2025",
        "url": "https://www.timeout.com/newyork/best-happy-hours-theater-district-nyc",
        "items": [
          "The Palm (Theater District)",
          "Marseille (Hell's Kitchen)",
          "Bobby Van's Grill Times Square (Theater District)",
          "Mermaid Oyster Bar (Theater District)",
          "Boqueria West 40th Street (Midtown West)",
          "Castell Rooftop Lounge (Garment District)",
          "Sicily Osteria (Theater District)",
          "The Rum House (Theater District)",
          "Rosevale Kitchen + Cocktail Room (Theater District)",
          "RT60 Rooftop Bar (Theater District)",
          "5 Napkin Burger (Hell's Kitchen)",
          "Lady Blue (Theater District)"
        ]
      },
      "timeout_mid": {
        "label": "Time Out · Best Happy Hour Midtown Bars",
        "url": "https://www.timeout.com/newyork/bars/best-happy-hour-midtown-bars-in-nyc",
        "items": [
          "Jimmy's Corner (Theater District)",
          "Ardesia (Hell's Kitchen)",
          "The Pony Bar (Hell's Kitchen)",
          "Réunion (Hell's Kitchen)",
          "Calle Dão (Midtown West)",
          "Tavern29 (Midtown East)",
          "Parker & Quinn (Garment District)",
          "La Biblioteca (Midtown East)",
          "The Stag's Head (Midtown East)"
        ]
      }
    },
    "vote": {
      "items": [
        "Ardesia (Hell's Kitchen)",
        "Castell Rooftop Lounge (Garment District)",
        "Jimmy's Corner (Theater District)",
        "The Palm (Theater District)",
        "Marseille (Hell's Kitchen)",
        "The Rum House (Theater District)",
        "Bobby Van's Grill Times Square (Theater District)",
        "The Pony Bar (Hell's Kitchen)",
        "The Stag's Head (Midtown East)",
        "Mermaid Oyster Bar (Theater District)"
      ]
    }
  },
  {
    "id": "dive-bars-atlanta",
    "publishedDate": "2026-05-29",
    "publishedAt": "2026-05-29T12:09:41Z",
    "title": "Best Dive Bars in Atlanta",
    "category": "Atlanta",
    "type": "food",
    "tags": [
      "bars",
      "nightlife",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "Cheap pours, jukebox grit, and decades of stories from West Midtown to Cabbagetown. Atlanta's most authentic dive bars, by consensus.",
    "defaultSource": "ai",
    "links": {
      "97 Estoria (Cabbagetown)": "https://www.google.com/maps/search/?api=1&query=97%20Estoria%20Cabbagetown%20Atlanta%20GA",
      "Black Bear Tavern (Buckhead)": "https://www.google.com/maps/search/?api=1&query=Black%20Bear%20Tavern%20Buckhead%20Atlanta%20GA",
      "Blind Willie's (Virginia-Highland)": "https://www.google.com/maps/search/?api=1&query=Blind%20Willie%20s%20Virginia-Highland%20Atlanta%20GA",
      "Bob & Harriet's Home Bar (Kirkwood)": "https://www.google.com/maps/search/?api=1&query=Bob%20Harriet%20s%20Home%20Bar%20Kirkwood%20Atlanta%20GA",
      "Clermont Lounge (Poncey-Highland)": "https://www.google.com/maps/search/?api=1&query=Clermont%20Lounge%20Poncey-Highland%20Atlanta%20GA",
      "Eleventh Street Pub (Midtown)": "https://www.google.com/maps/search/?api=1&query=Eleventh%20Street%20Pub%20Midtown%20Atlanta%20GA",
      "Elmyr (Little Five Points)": "https://www.google.com/maps/search/?api=1&query=Elmyr%20Little%20Five%20Points%20Atlanta%20GA",
      "Euclid Avenue Yacht Club (Little Five Points)": "https://www.google.com/maps/search/?api=1&query=Euclid%20Avenue%20Yacht%20Club%20Little%20Five%20Points%20Atlanta%20GA",
      "Five Paces Inn (Buckhead)": "https://www.google.com/maps/search/?api=1&query=Five%20Paces%20Inn%20Buckhead%20Atlanta%20GA",
      "Friends on Ponce (Poncey-Highland)": "https://www.google.com/maps/search/?api=1&query=Friends%20on%20Ponce%20Poncey-Highland%20Atlanta%20GA",
      "Johnny's Hideaway (Buckhead)": "https://www.google.com/maps/search/?api=1&query=Johnny%20s%20Hideaway%20Buckhead%20Atlanta%20GA",
      "Joystick Gamebar (Edgewood)": "https://www.google.com/maps/search/?api=1&query=Joystick%20Gamebar%20Edgewood%20Atlanta%20GA",
      "Manny's (Grant Park)": "https://www.google.com/maps/search/?api=1&query=Manny%20s%20Grant%20Park%20Atlanta%20GA",
      "Moe's & Joe's Tavern (Virginia-Highland)": "https://www.google.com/maps/search/?api=1&query=Moe%20s%20Joe%20s%20Tavern%20Virginia-Highland%20Atlanta%20GA",
      "Mr. C's (Upper Westside)": "https://www.google.com/maps/search/?api=1&query=Mr%20C%20s%20Upper%20Westside%20Atlanta%20GA",
      "Northside Tavern (West Midtown)": "https://www.google.com/maps/search/?api=1&query=Northside%20Tavern%20West%20Midtown%20Atlanta%20GA",
      "Red Door Tavern (Buckhead)": "https://www.google.com/maps/search/?api=1&query=Red%20Door%20Tavern%20Buckhead%20Atlanta%20GA",
      "Sister Louisa's Church (Edgewood)": "https://www.google.com/maps/search/?api=1&query=Sister%20Louisa%20s%20Church%20Edgewood%20Atlanta%20GA",
      "Smith's Olde Bar (Midtown)": "https://www.google.com/maps/search/?api=1&query=Smith%20s%20Olde%20Bar%20Midtown%20Atlanta%20GA",
      "The Earl (East Atlanta Village)": "https://www.google.com/maps/search/?api=1&query=The%20Earl%20East%20Atlanta%20Village%20Atlanta%20GA",
      "The Independent (Midtown)": "https://www.google.com/maps/search/?api=1&query=The%20Independent%20Midtown%20Atlanta%20GA",
      "The Local (Old Fourth Ward)": "https://www.google.com/maps/search/?api=1&query=The%20Local%20Old%20Fourth%20Ward%20Atlanta%20GA",
      "The North Highland Pub (Inman Park)": "https://www.google.com/maps/search/?api=1&query=The%20North%20Highland%20Pub%20Inman%20Park%20Atlanta%20GA",
      "The Righteous Room (Poncey-Highland)": "https://www.google.com/maps/search/?api=1&query=The%20Righteous%20Room%20Poncey-Highland%20Atlanta%20GA"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Northside Tavern (West Midtown)",
          "Moe's & Joe's Tavern (Virginia-Highland)",
          "The Local (Old Fourth Ward)",
          "The Earl (East Atlanta Village)",
          "The Righteous Room (Poncey-Highland)",
          "Eleventh Street Pub (Midtown)",
          "97 Estoria (Cabbagetown)",
          "Mr. C's (Upper Westside)",
          "Euclid Avenue Yacht Club (Little Five Points)",
          "Clermont Lounge (Poncey-Highland)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation · 17 Best Dive Bars in Atlanta 2026",
        "url": "https://www.theinfatuation.com/atlanta/guides/the-best-dive-bars-in-atlanta",
        "items": [
          "Moe's & Joe's Tavern (Virginia-Highland)",
          "Bob & Harriet's Home Bar (Kirkwood)",
          "97 Estoria (Cabbagetown)",
          "Northside Tavern (West Midtown)",
          "Elmyr (Little Five Points)",
          "The Local (Old Fourth Ward)",
          "The Earl (East Atlanta Village)",
          "The Righteous Room (Poncey-Highland)",
          "Euclid Avenue Yacht Club (Little Five Points)",
          "Mr. C's (Upper Westside)",
          "Eleventh Street Pub (Midtown)",
          "The Independent (Midtown)",
          "Black Bear Tavern (Buckhead)",
          "Red Door Tavern (Buckhead)",
          "Five Paces Inn (Buckhead)",
          "Manny's (Grant Park)",
          "The North Highland Pub (Inman Park)"
        ]
      },
      "diningout": {
        "label": "DiningOut · Atlanta's Best Dive Bars 2026",
        "url": "https://diningout.com/atlanta/atlantas-best-dive-bars-where-to-find-cheap-drinks-strong-pours-and-real-atlanta-grit/",
        "items": [
          "Johnny's Hideaway (Buckhead)",
          "Mr. C's (Upper Westside)",
          "Northside Tavern (West Midtown)",
          "Smith's Olde Bar (Midtown)",
          "Clermont Lounge (Poncey-Highland)",
          "97 Estoria (Cabbagetown)",
          "The Local (Old Fourth Ward)",
          "The Earl (East Atlanta Village)",
          "The Righteous Room (Poncey-Highland)",
          "Red Door Tavern (Buckhead)",
          "Euclid Avenue Yacht Club (Little Five Points)",
          "Eleventh Street Pub (Midtown)",
          "Moe's & Joe's Tavern (Virginia-Highland)",
          "The North Highland Pub (Inman Park)",
          "Friends on Ponce (Poncey-Highland)"
        ]
      },
      "atlantaeats": {
        "label": "Atlanta Eats · Iconic Dive Bars (unranked) 2024",
        "unordered": true,
        "url": "https://www.atlantaeats.com/blog/atlantas-iconic-dive-bars/",
        "items": [
          "Blind Willie's (Virginia-Highland)",
          "Eleventh Street Pub (Midtown)",
          "Joystick Gamebar (Edgewood)",
          "Moe's & Joe's Tavern (Virginia-Highland)",
          "Northside Tavern (West Midtown)",
          "Sister Louisa's Church (Edgewood)",
          "Smith's Olde Bar (Midtown)",
          "The Earl (East Atlanta Village)",
          "The Local (Old Fourth Ward)",
          "The Righteous Room (Poncey-Highland)"
        ]
      }
    },
    "vote": {
      "items": [
        "Northside Tavern (West Midtown)",
        "Moe's & Joe's Tavern (Virginia-Highland)",
        "Clermont Lounge (Poncey-Highland)",
        "The Earl (East Atlanta Village)",
        "The Local (Old Fourth Ward)",
        "The Righteous Room (Poncey-Highland)",
        "Euclid Avenue Yacht Club (Little Five Points)",
        "97 Estoria (Cabbagetown)",
        "Smith's Olde Bar (Midtown)",
        "Blind Willie's (Virginia-Highland)"
      ]
    }
  },
  {
    "id": "best-run-chipotle-manhattan",
    "publishedDate": "2026-05-29",
    "publishedAt": "2026-05-29T21:45:18Z",
    "title": "Best-Run Chipotles in Manhattan",
    "category": "New York",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores",
      "other"
    ],
    "linkType": "mapsCity",
    "mode": "scores",
    "blurb": "Not all Chipotles are created equal. Every Manhattan location ranked by a volume-weighted composite of its Google and Yelp ratings (May 2026). The 48th Street shop runs cleanest.",
    "defaultSource": "ai",
    "links": {
      "129 W 48th St (Midtown)": "https://www.google.com/maps/search/?api=1&query=Chipotle%20129%20W%2048th%20St%20New%20York",
      "350 5th Ave (Midtown)": "https://www.google.com/maps/search/?api=1&query=Chipotle%20350%205th%20Ave%20New%20York",
      "504 6th Ave (Greenwich Village)": "https://www.google.com/maps/search/?api=1&query=Chipotle%20504%206th%20Ave%20New%20York",
      "1020 3rd Ave (Lenox Hill)": "https://www.google.com/maps/search/?api=1&query=Chipotle%201020%203rd%20Ave%20New%20York",
      "805 Columbus Ave (Upper West Side)": "https://www.google.com/maps/search/?api=1&query=Chipotle%20805%20Columbus%20Ave%20New%20York",
      "2843 Broadway (Morningside Heights)": "https://www.google.com/maps/search/?api=1&query=Chipotle%202843%20Broadway%20New%20York",
      "304 W 34th St (Midtown West)": "https://www.google.com/maps/search/?api=1&query=Chipotle%20304%20W%2034th%20St%20New%20York",
      "2 Broadway (Financial District)": "https://www.google.com/maps/search/?api=1&query=Chipotle%202%20Broadway%20New%20York",
      "1379 6th Ave (Midtown)": "https://www.google.com/maps/search/?api=1&query=Chipotle%201379%206th%20Ave%20New%20York",
      "111 Fulton St (Financial District)": "https://www.google.com/maps/search/?api=1&query=Chipotle%20111%20Fulton%20St%20New%20York"
    },
    "scores": {
        "129 W 48th St (Midtown)": "7.8",
        "350 5th Ave (Midtown)": "7.7",
        "504 6th Ave (Greenwich Village)": "7.6",
        "1020 3rd Ave (Lenox Hill)": "7.6",
        "805 Columbus Ave (Upper West Side)": "7.6",
        "2843 Broadway (Morningside Heights)": "7.5",
        "304 W 34th St (Midtown West)": "7.5",
        "2 Broadway (Financial District)": "7.4",
        "1379 6th Ave (Midtown)": "7.4",
        "111 Fulton St (Financial District)": "7.3"
      },
      "sources": {
      "ai": {
        "label": "Composite Score · Google + Yelp, volume-weighted (May 2026)",
        "items": [
          "129 W 48th St (Midtown)",
          "350 5th Ave (Midtown)",
          "504 6th Ave (Greenwich Village)",
          "1020 3rd Ave (Lenox Hill)",
          "805 Columbus Ave (Upper West Side)",
          "2843 Broadway (Morningside Heights)",
          "304 W 34th St (Midtown West)",
          "2 Broadway (Financial District)",
          "1379 6th Ave (Midtown)",
          "111 Fulton St (Financial District)"
        ]
      },
      "google": {
        "label": "Google Maps Ratings (May 2026)",
        "url": "https://www.google.com/maps/search/Chipotle+Manhattan",
        "items": [
          "129 W 48th St (Midtown)",
          "304 W 34th St (Midtown West)",
          "350 5th Ave (Midtown)",
          "2843 Broadway (Morningside Heights)",
          "504 6th Ave (Greenwich Village)",
          "1020 3rd Ave (Lenox Hill)",
          "805 Columbus Ave (Upper West Side)",
          "2 Broadway (Financial District)",
          "1379 6th Ave (Midtown)",
          "111 Fulton St (Financial District)"
        ]
      },
      "yelp": {
        "label": "Yelp Ratings (May 2026)",
        "url": "https://www.yelp.com/search?find_desc=Chipotle&find_loc=Manhattan%2C+NY",
        "items": [
          "350 5th Ave (Midtown)",
          "2 Broadway (Financial District)",
          "2843 Broadway (Morningside Heights)",
          "304 W 34th St (Midtown West)",
          "129 W 48th St (Midtown)",
          "111 Fulton St (Financial District)",
          "805 Columbus Ave (Upper West Side)",
          "504 6th Ave (Greenwich Village)",
          "1379 6th Ave (Midtown)",
          "1020 3rd Ave (Lenox Hill)"
        ]
      }
    },
    "vote": {
      "items": [
        "129 W 48th St (Midtown)",
        "350 5th Ave (Midtown)",
        "504 6th Ave (Greenwich Village)",
        "1020 3rd Ave (Lenox Hill)",
        "805 Columbus Ave (Upper West Side)",
        "2843 Broadway (Morningside Heights)",
        "304 W 34th St (Midtown West)",
        "2 Broadway (Financial District)",
        "1379 6th Ave (Midtown)",
        "111 Fulton St (Financial District)"
      ]
    }
  },
  {
    "id": "best-luxury-hotel-brands-world",
    "publishedDate": "2026-05-29",
    "publishedAt": "2026-05-29T22:20:57Z",
    "title": "Best Luxury Hotel Brands in the World",
    "category": "Travel",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "search",
    "blurb": "From Aman's hushed hideaways to Four Seasons' faultless polish, these are the houses that set the global standard for hospitality. Ranked by consensus across the major luxury-hotel-brand rankings.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Aman",
          "Four Seasons",
          "Mandarin Oriental",
          "Rosewood",
          "Capella",
          "Oetker Collection",
          "Belmond",
          "Shangri-La",
          "One&Only",
          "Six Senses"
        ]
      },
      "lti": {
        "label": "LTI – Luxury Travel Intelligence 2025",
        "url": "https://www.hospitalitynet.org/news/4128968.html",
        "items": [
          "Mandarin Oriental",
          "Aman",
          "Bulgari",
          "Oetker Collection",
          "Rosewood",
          "Four Seasons",
          "Six Senses",
          "Auberge Resorts Collection",
          "Rocco Forte",
          "One&Only",
          "Belmond",
          "Dorchester Collection",
          "The Peninsula",
          "Banyan Tree",
          "Raffles"
        ]
      },
      "luxetravelexpert": {
        "label": "The Luxury Travel Expert 2026",
        "url": "https://theluxurytravelexpert.com/best-luxury-hotel-brands-in-the-world/",
        "items": [
          "Aman",
          "Capella",
          "Rosewood",
          "One&Only",
          "Four Seasons",
          "Mandarin Oriental",
          "Belmond",
          "Six Senses",
          "Waldorf Astoria",
          "St. Regis"
        ]
      },
      "pursuitist": {
        "label": "Pursuitist 2025",
        "url": "https://pursuitist.com/the-best-luxury-hotel-brands-of-2025/",
        "items": [
          "Four Seasons",
          "Aman",
          "Ritz-Carlton",
          "Mandarin Oriental",
          "Rosewood",
          "The Peninsula",
          "Belmond",
          "One&Only",
          "Six Senses",
          "St. Regis"
        ]
      },
      "hotelminder": {
        "label": "HotelMinder 2025",
        "url": "https://www.hotelminder.com/top-15-best-luxury-hotel-brands-in-the-world",
        "items": [
          "Aman",
          "Mandarin Oriental",
          "Oetker Collection",
          "Four Seasons",
          "St. Regis",
          "Rosewood",
          "Belmond",
          "Six Senses",
          "One&Only",
          "Oberoi",
          "Auberge Resorts Collection",
          "Banyan Tree",
          "Park Hyatt",
          "Shangri-La",
          "Pan Pacific"
        ]
      },
      "businesstraveller": {
        "label": "Business Traveller Readers' Poll 2025",
        "url": "https://aviationa2z.com/index.php/2026/01/02/best-luxury-hotel-brands-as-per-travellers-2025/",
        "items": [
          "Four Seasons",
          "Aman",
          "Park Hyatt",
          "Shangri-La",
          "Mandarin Oriental"
        ]
      },
      "traveleisure": {
        "label": "Travel + Leisure World's Best Awards 2025",
        "url": "https://www.travelandleisure.com/worlds-best-awards-2025-hotel-brands-11751883",
        "items": [
          "Capella",
          "Oberoi",
          "Regent",
          "Shangri-La",
          "The Peninsula",
          "Taj",
          "Auberge Resorts Collection",
          "Anantara",
          "Belmond",
          "Banyan Tree",
          "Raffles",
          "Six Senses",
          "Nayara Resorts",
          "Mandarin Oriental",
          "Noble House Hotels & Resorts",
          "St. Regis",
          "One&Only",
          "Montage",
          "Rosewood",
          "Opal Collection",
          "Four Seasons",
          "Waldorf Astoria",
          "Ritz-Carlton Reserve",
          "Aman",
          "Thompson Hotels"
        ]
      }
    },
    "vote": {
      "items": [
        "Aman",
        "Four Seasons",
        "Mandarin Oriental",
        "Rosewood",
        "Capella",
        "Oetker Collection",
        "Belmond",
        "Shangri-La",
        "One&Only",
        "Six Senses"
      ]
    }
  },
  {
    "id": "best-four-seasons-hotels-world",
    "publishedDate": "2026-05-29",
    "publishedAt": "2026-05-29T22:21:00Z",
    "title": "Best Four Seasons Hotels in the World",
    "category": "Travel",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Four Seasons Resort Seychelles (Mahé, Seychelles)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Resort%20Seychelles%20Mah%C3%A9%20Seychelles",
      "Four Seasons Hotel Astir Palace (Athens, Greece)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Hotel%20Astir%20Palace%20Athens%20Greece",
      "Four Seasons Resort Maldives at Landaa Giraavaru (Baa Atoll, Maldives)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Resort%20Maldives%20at%20Landaa%20Giraavaru%20Baa%20Atoll%20Maldives",
      "Grand-Hôtel du Cap-Ferrat, a Four Seasons Hotel (French Riviera, France)": "https://www.google.com/maps/search/?api=1&query=Grand-H%C3%B4tel%20du%20Cap-Ferrat%20a%20Four%20Seasons%20Hotel%20French%20Riviera%20France",
      "Four Seasons Resort Bora Bora (French Polynesia)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Resort%20Bora%20Bora%20French%20Polynesia",
      "San Domenico Palace, a Four Seasons Hotel (Taormina, Italy)": "https://www.google.com/maps/search/?api=1&query=San%20Domenico%20Palace%20a%20Four%20Seasons%20Hotel%20Taormina%20Italy",
      "Four Seasons Resort The Nam Hai (Hoi An, Vietnam)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Resort%20The%20Nam%20Hai%20Hoi%20An%20Vietnam",
      "Four Seasons Resort Lanai (Hawaii, United States)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Resort%20Lanai%20Hawaii%20United%20States",
      "Four Seasons Hotel Istanbul at the Bosphorus (Turkey)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Hotel%20Istanbul%20at%20the%20Bosphorus%20Turkey",
      "Four Seasons Tented Camp Golden Triangle (Chiang Rai, Thailand)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Tented%20Camp%20Golden%20Triangle%20Chiang%20Rai%20Thailand",
      "Four Seasons Safari Lodge Serengeti (Tanzania)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Safari%20Lodge%20Serengeti%20Tanzania",
      "Four Seasons Hotel Gresham Palace Budapest (Hungary)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Hotel%20Gresham%20Palace%20Budapest%20Hungary",
      "Four Seasons Resort Maui at Wailea (Hawaii, United States)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Resort%20Maui%20at%20Wailea%20Hawaii%20United%20States",
      "Four Seasons Hotel Kyoto (Japan)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Hotel%20Kyoto%20Japan",
      "Four Seasons Hotel Bangkok at Chao Phraya River (Thailand)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Hotel%20Bangkok%20at%20Chao%20Phraya%20River%20Thailand",
      "Four Seasons Hotel Firenze (Florence, Italy)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Hotel%20Firenze%20Florence%20Italy",
      "Four Seasons Hotel Madrid (Spain)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Hotel%20Madrid%20Spain",
      "Four Seasons Hotel at The Surf Club (Miami, United States)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Hotel%20at%20The%20Surf%20Club%20Miami%20United%20States",
      "Four Seasons Resort Costa Rica at Peninsula Papagayo (Guanacaste, Costa Rica)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Resort%20Costa%20Rica%20at%20Peninsula%20Papagayo%20Guanacaste%20Costa%20Rica",
      "Four Seasons Hotel Milano (Milan, Italy)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Hotel%20Milano%20Milan%20Italy",
      "Four Seasons Resort Hualalai (Hawaii, United States)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Resort%20Hualalai%20Hawaii%20United%20States",
      "Four Seasons Hotel Hampshire (England, United Kingdom)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Hotel%20Hampshire%20England%20United%20Kingdom",
      "Four Seasons Hotel One Dalton Street, Boston (United States)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Hotel%20One%20Dalton%20Street%20Boston%20United%20States",
      "Four Seasons Resort Los Cabos at Costa Palmas (Mexico)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Resort%20Los%20Cabos%20at%20Costa%20Palmas%20Mexico",
      "Naviva, A Four Seasons Resort (Punta Mita, Mexico)": "https://www.google.com/maps/search/?api=1&query=Naviva%20A%20Four%20Seasons%20Resort%20Punta%20Mita%20Mexico",
      "Four Seasons Resort Bali at Sayan (Bali, Indonesia)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Resort%20Bali%20at%20Sayan%20Bali%20Indonesia",
      "Four Seasons Hotel Casa Medina Bogotá (Colombia)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Hotel%20Casa%20Medina%20Bogot%C3%A1%20Colombia",
      "Four Seasons Hotel Tokyo at Otemachi (Japan)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Hotel%20Tokyo%20at%20Otemachi%20Japan",
      "The Ocean Club, A Four Seasons Resort (Paradise Island, Bahamas)": "https://www.google.com/maps/search/?api=1&query=The%20Ocean%20Club%20A%20Four%20Seasons%20Resort%20Paradise%20Island%20Bahamas",
      "Four Seasons Resort Seychelles at Desroches Island (Seychelles)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Resort%20Seychelles%20at%20Desroches%20Island%20Seychelles",
      "Four Seasons Resort and Residences Jackson Hole (Wyoming, United States)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Resort%20and%20Residences%20Jackson%20Hole%20Wyoming%20United%20States",
      "Four Seasons Hotel George V (Paris, France)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Hotel%20George%20V%20Paris%20France"
    },
    "blurb": "Polished service from Bora Bora's overwater bungalows to Florence's Renaissance cloisters. These are the Four Seasons properties that critics and regulars rank above the rest.",
    "defaultSource": "ai",
    "itemLinks": {
      "Four Seasons Resort Bora Bora (French Polynesia)": "https://www.fourseasons.com/borabora/",
      "Four Seasons Hotel Bangkok at Chao Phraya River (Thailand)": "https://www.fourseasons.com/bangkok/",
      "Four Seasons Hotel Firenze (Florence, Italy)": "https://www.fourseasons.com/florence/",
      "Four Seasons Hotel Astir Palace (Athens, Greece)": "https://www.fourseasons.com/athens/",
      "Grand-Hôtel du Cap-Ferrat, a Four Seasons Hotel (French Riviera, France)": "https://www.fourseasons.com/capferrat/",
      "Four Seasons Safari Lodge Serengeti (Tanzania)": "https://www.fourseasons.com/serengeti/",
      "Four Seasons Hotel Gresham Palace Budapest (Hungary)": "https://www.fourseasons.com/budapest/",
      "Four Seasons Resort Maldives at Landaa Giraavaru (Baa Atoll, Maldives)": "https://www.fourseasons.com/maldiveslg/",
      "Four Seasons Resort Maui at Wailea (Hawaii, United States)": "https://www.fourseasons.com/maui/",
      "Four Seasons Resort Lanai (Hawaii, United States)": "https://www.fourseasons.com/lanai/",
      "Four Seasons Resort Seychelles (Mahé, Seychelles)": "https://www.fourseasons.com/seychelles/",
      "San Domenico Palace, a Four Seasons Hotel (Taormina, Italy)": "https://www.fourseasons.com/taormina/",
      "Four Seasons Resort The Nam Hai (Hoi An, Vietnam)": "https://www.fourseasons.com/hoian/",
      "Four Seasons Hotel Istanbul at the Bosphorus (Turkey)": "https://www.fourseasons.com/bosphorus/",
      "Four Seasons Tented Camp Golden Triangle (Chiang Rai, Thailand)": "https://www.fourseasons.com/goldentriangle/",
      "Four Seasons Hotel Kyoto (Japan)": "https://www.fourseasons.com/kyoto/",
      "Four Seasons Hotel Madrid (Spain)": "https://www.fourseasons.com/madrid/",
      "Four Seasons Hotel at The Surf Club (Miami, United States)": "https://www.fourseasons.com/surfside/",
      "Four Seasons Resort Costa Rica at Peninsula Papagayo (Guanacaste, Costa Rica)": "https://www.fourseasons.com/costarica/",
      "Four Seasons Hotel Milano (Milan, Italy)": "https://www.fourseasons.com/milan/",
      "Four Seasons Resort Hualalai (Hawaii, United States)": "https://www.fourseasons.com/hualalai/",
      "Four Seasons Hotel Hampshire (England, United Kingdom)": "https://www.fourseasons.com/hampshire/",
      "Four Seasons Hotel One Dalton Street, Boston (United States)": "https://www.fourseasons.com/onedalton/",
      "Four Seasons Resort Los Cabos at Costa Palmas (Mexico)": "https://www.fourseasons.com/loscabos/",
      "Naviva, A Four Seasons Resort (Punta Mita, Mexico)": "https://www.fourseasons.com/naviva/",
      "Four Seasons Resort Bali at Sayan (Bali, Indonesia)": "https://www.fourseasons.com/sayan/",
      "Four Seasons Hotel Casa Medina Bogotá (Colombia)": "https://www.fourseasons.com/casamedina/",
      "Four Seasons Hotel Tokyo at Otemachi (Japan)": "https://www.fourseasons.com/otemachi/",
      "The Ocean Club, A Four Seasons Resort (Paradise Island, Bahamas)": "https://www.fourseasons.com/oceanclub/",
      "Four Seasons Resort Seychelles at Desroches Island (Seychelles)": "https://www.fourseasons.com/seychellesdesroches/",
      "Four Seasons Resort and Residences Jackson Hole (Wyoming, United States)": "https://www.fourseasons.com/jacksonhole/",
      "Four Seasons Hotel George V (Paris, France)": "https://www.fourseasons.com/paris/"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Four Seasons Resort Bora Bora (French Polynesia)",
          "Four Seasons Hotel Bangkok at Chao Phraya River (Thailand)",
          "Four Seasons Hotel Firenze (Florence, Italy)",
          "Four Seasons Hotel Astir Palace (Athens, Greece)",
          "Grand-Hôtel du Cap-Ferrat, a Four Seasons Hotel (French Riviera, France)",
          "Four Seasons Safari Lodge Serengeti (Tanzania)",
          "Four Seasons Hotel Gresham Palace Budapest (Hungary)",
          "Four Seasons Resort Maldives at Landaa Giraavaru (Baa Atoll, Maldives)",
          "Four Seasons Resort Maui at Wailea (Hawaii, United States)",
          "Four Seasons Resort Lanai (Hawaii, United States)"
        ]
      },
      "luxetravelexpert": {
        "label": "The Luxury Travel Expert",
        "url": "https://theluxurytravelexpert.com/top-10-best-four-seasons-hotels-resorts/",
        "items": [
          "Four Seasons Resort Seychelles (Mahé, Seychelles)",
          "Four Seasons Hotel Astir Palace (Athens, Greece)",
          "Four Seasons Resort Maldives at Landaa Giraavaru (Baa Atoll, Maldives)",
          "Grand-Hôtel du Cap-Ferrat, a Four Seasons Hotel (French Riviera, France)",
          "Four Seasons Resort Bora Bora (French Polynesia)",
          "San Domenico Palace, a Four Seasons Hotel (Taormina, Italy)",
          "Four Seasons Resort The Nam Hai (Hoi An, Vietnam)",
          "Four Seasons Resort Lanai (Hawaii, United States)",
          "Four Seasons Hotel Istanbul at the Bosphorus (Turkey)",
          "Four Seasons Tented Camp Golden Triangle (Chiang Rai, Thailand)"
        ]
      },
      "pursuitist": {
        "label": "Pursuitist 2026",
        "url": "https://pursuitist.com/the-worlds-best-four-seasons-hotels-and-resorts/",
        "items": [
          "Four Seasons Safari Lodge Serengeti (Tanzania)",
          "Four Seasons Resort Bora Bora (French Polynesia)",
          "Four Seasons Hotel Gresham Palace Budapest (Hungary)",
          "Four Seasons Resort Maui at Wailea (Hawaii, United States)",
          "Four Seasons Hotel Kyoto (Japan)"
        ]
      },
      "worlds50best2025": {
        "label": "World's 50 Best Hotels 2025",
        "url": "https://www.theworlds50best.com/hotels/",
        "items": [
          "Four Seasons Hotel Bangkok at Chao Phraya River (Thailand)",
          "Four Seasons Hotel Firenze (Florence, Italy)",
          "Four Seasons Hotel Astir Palace (Athens, Greece)"
        ]
      },
      "worlds50best2024": {
        "label": "World's 50 Best Hotels 2024",
        "url": "https://www.theworlds50best.com/hotels/",
        "items": [
          "Four Seasons Hotel Bangkok at Chao Phraya River (Thailand)",
          "Four Seasons Hotel Firenze (Florence, Italy)",
          "Four Seasons Hotel Madrid (Spain)",
          "Four Seasons Hotel at The Surf Club (Miami, United States)"
        ]
      },
      "luxurytraveldiary": {
        "label": "Luxury Travel Diary 2024",
        "url": "https://www.luxurytraveldiary.com/2024/08/top-10-best-four-seasons-hotels-resorts-in-the-world/",
        "items": [
          "Grand-Hôtel du Cap-Ferrat, a Four Seasons Hotel (French Riviera, France)",
          "Four Seasons Resort Lanai (Hawaii, United States)",
          "Four Seasons Resort Costa Rica at Peninsula Papagayo (Guanacaste, Costa Rica)",
          "Four Seasons Hotel Milano (Milan, Italy)",
          "Four Seasons Resort Hualalai (Hawaii, United States)",
          "Four Seasons Hotel Hampshire (England, United Kingdom)",
          "Four Seasons Hotel One Dalton Street, Boston (United States)",
          "Four Seasons Resort Los Cabos at Costa Palmas (Mexico)",
          "Four Seasons Hotel at The Surf Club (Miami, United States)",
          "Naviva, A Four Seasons Resort (Punta Mita, Mexico)"
        ]
      },
      "thepointsguy": {
        "label": "The Points Guy (unranked roundup)",
        "url": "https://thepointsguy.com/hotel/best-four-seasons-in-world/",
        "items": [
          "Four Seasons Resort Bali at Sayan (Bali, Indonesia)",
          "San Domenico Palace, a Four Seasons Hotel (Taormina, Italy)",
          "Four Seasons Safari Lodge Serengeti (Tanzania)",
          "Four Seasons Resort The Nam Hai (Hoi An, Vietnam)",
          "Four Seasons Resort Bora Bora (French Polynesia)",
          "Four Seasons Hotel Casa Medina Bogotá (Colombia)",
          "Four Seasons Resort Maldives at Landaa Giraavaru (Baa Atoll, Maldives)",
          "Four Seasons Hotel Tokyo at Otemachi (Japan)",
          "The Ocean Club, A Four Seasons Resort (Paradise Island, Bahamas)",
          "Naviva, A Four Seasons Resort (Punta Mita, Mexico)",
          "Four Seasons Hotel Gresham Palace Budapest (Hungary)",
          "Four Seasons Resort Seychelles at Desroches Island (Seychelles)",
          "Four Seasons Tented Camp Golden Triangle (Chiang Rai, Thailand)",
          "Four Seasons Resort and Residences Jackson Hole (Wyoming, United States)",
          "Four Seasons Hotel George V (Paris, France)",
          "Four Seasons Resort Maui at Wailea (Hawaii, United States)"
        ],
        "unordered": true
      }
    },
    "vote": {
      "items": [
        "Four Seasons Resort Bora Bora (French Polynesia)",
        "Four Seasons Hotel Bangkok at Chao Phraya River (Thailand)",
        "Four Seasons Hotel Firenze (Florence, Italy)",
        "Four Seasons Hotel Astir Palace (Athens, Greece)",
        "Grand-Hôtel du Cap-Ferrat, a Four Seasons Hotel (French Riviera, France)",
        "Four Seasons Safari Lodge Serengeti (Tanzania)",
        "Four Seasons Hotel Gresham Palace Budapest (Hungary)",
        "Four Seasons Resort Maldives at Landaa Giraavaru (Baa Atoll, Maldives)",
        "Four Seasons Resort Maui at Wailea (Hawaii, United States)",
        "Four Seasons Resort Lanai (Hawaii, United States)"
      ]
    }
  },
  {
    "id": "best-mandarin-oriental-hotels-world",
    "publishedDate": "2026-05-29",
    "publishedAt": "2026-05-29T22:22:00Z",
    "title": "Best Mandarin Oriental Hotels in the World",
    "category": "Travel",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Mandarin Oriental Costa Navarino (Messinia, Greece)": "https://www.google.com/maps/search/?api=1&query=Mandarin%20Oriental%20Costa%20Navarino%20Messinia%20Greece",
      "Mandarin Oriental Canouan (St. Vincent and the Grenadines)": "https://www.google.com/maps/search/?api=1&query=Mandarin%20Oriental%20Canouan%20St.%20Vincent%20and%20the%20Grenadines",
      "Mandarin Oriental Marrakech (Morocco)": "https://www.google.com/maps/search/?api=1&query=Mandarin%20Oriental%20Marrakech%20Morocco",
      "Mandarin Oriental Lake Como (Italy)": "https://www.google.com/maps/search/?api=1&query=Mandarin%20Oriental%20Lake%20Como%20Italy",
      "Mandarin Oriental Ritz Madrid (Spain)": "https://www.google.com/maps/search/?api=1&query=Mandarin%20Oriental%20Ritz%20Madrid%20Spain",
      "Emirates Palace Mandarin Oriental (Abu Dhabi, UAE)": "https://www.google.com/maps/search/?api=1&query=Emirates%20Palace%20Mandarin%20Oriental%20Abu%20Dhabi%20UAE",
      "Mandarin Oriental Bangkok (Thailand)": "https://www.google.com/maps/search/?api=1&query=Mandarin%20Oriental%20Bangkok%20Thailand",
      "Mandarin Oriental Bodrum (Turkey)": "https://www.google.com/maps/search/?api=1&query=Mandarin%20Oriental%20Bodrum%20Turkey",
      "Mandarin Oriental New York (United States)": "https://www.google.com/maps/search/?api=1&query=Mandarin%20Oriental%20New%20York%20United%20States",
      "Mandarin Oriental Hyde Park (London, United Kingdom)": "https://www.google.com/maps/search/?api=1&query=Mandarin%20Oriental%20Hyde%20Park%20London%20United%20Kingdom",
      "Mandarin Oriental Shanghai (China)": "https://www.google.com/maps/search/?api=1&query=Mandarin%20Oriental%20Shanghai%20China",
      "Mandarin Oriental Paris (France)": "https://www.google.com/maps/search/?api=1&query=Mandarin%20Oriental%20Paris%20France",
      "Mandarin Oriental Wangfujing (Beijing, China)": "https://www.google.com/maps/search/?api=1&query=Mandarin%20Oriental%20Wangfujing%20Beijing%20China",
      "Mandarin Oriental Jumeira (Dubai, UAE)": "https://www.google.com/maps/search/?api=1&query=Mandarin%20Oriental%20Jumeira%20Dubai%20UAE",
      "Mandarin Oriental Guangzhou (China)": "https://www.google.com/maps/search/?api=1&query=Mandarin%20Oriental%20Guangzhou%20China",
      "Mandarin Oriental Milan (Italy)": "https://www.google.com/maps/search/?api=1&query=Mandarin%20Oriental%20Milan%20Italy",
      "Mandarin Oriental Hong Kong (China)": "https://www.google.com/maps/search/?api=1&query=Mandarin%20Oriental%20Hong%20Kong%20China",
      "Mandarin Oriental Jakarta (Indonesia)": "https://www.google.com/maps/search/?api=1&query=Mandarin%20Oriental%20Jakarta%20Indonesia",
      "Mandarin Oriental Macau (China)": "https://www.google.com/maps/search/?api=1&query=Mandarin%20Oriental%20Macau%20China",
      "Mandarin Oriental Prague (Czech Republic)": "https://www.google.com/maps/search/?api=1&query=Mandarin%20Oriental%20Prague%20Czech%20Republic",
      "Mandarin Oriental Sanya (China)": "https://www.google.com/maps/search/?api=1&query=Mandarin%20Oriental%20Sanya%20China",
      "Mandarin Oriental Qianmen (Beijing, China)": "https://www.google.com/maps/search/?api=1&query=Mandarin%20Oriental%20Qianmen%20Beijing%20China"
    },
    "blurb": "Fan-emblazoned service, landmark addresses, and some of the finest spas in hospitality. The Mandarin Oriental hotels that top the rankings, from Bangkok's riverbanks to a Messinian hillside.",
    "defaultSource": "ai",
    "itemLinks": {
      "Mandarin Oriental Bangkok (Thailand)": "https://www.mandarinoriental.com/en/bangkok/chao-phraya-river",
      "Emirates Palace Mandarin Oriental (Abu Dhabi, UAE)": "https://www.mandarinoriental.com/en/abu-dhabi/emirates-palace",
      "Mandarin Oriental Canouan (St. Vincent and the Grenadines)": "https://www.mandarinoriental.com/en/canouan/caribbean",
      "Mandarin Oriental Costa Navarino (Messinia, Greece)": "https://www.mandarinoriental.com/en/costa-navarino/messenia",
      "Mandarin Oriental Hyde Park (London, United Kingdom)": "https://www.mandarinoriental.com/en/london/hyde-park",
      "Mandarin Oriental Qianmen (Beijing, China)": "https://www.mandarinoriental.com/en/beijing/qianmen",
      "Mandarin Oriental Shanghai (China)": "https://www.mandarinoriental.com/en/shanghai/pudong",
      "Mandarin Oriental Hong Kong (China)": "https://www.mandarinoriental.com/en/hong-kong/victoria-harbour",
      "Mandarin Oriental Marrakech (Morocco)": "https://www.mandarinoriental.com/en/marrakech/la-medina",
      "Mandarin Oriental Lake Como (Italy)": "https://www.mandarinoriental.com/en/lake-como/blevio",
      "Mandarin Oriental Ritz Madrid (Spain)": "https://www.mandarinoriental.com/en/madrid/hotel-ritz",
      "Mandarin Oriental Bodrum (Turkey)": "https://www.mandarinoriental.com/en/bodrum/paradise-bay",
      "Mandarin Oriental New York (United States)": "https://www.mandarinoriental.com/en/new-york/manhattan",
      "Mandarin Oriental Paris (France)": "https://www.mandarinoriental.com/en/paris/place-vendome",
      "Mandarin Oriental Wangfujing (Beijing, China)": "https://www.mandarinoriental.com/en/beijing/wangfujing",
      "Mandarin Oriental Jumeira (Dubai, UAE)": "https://www.mandarinoriental.com/en/dubai/jumeira-beach",
      "Mandarin Oriental Guangzhou (China)": "https://www.mandarinoriental.com/en/guangzhou/tianhe",
      "Mandarin Oriental Milan (Italy)": "https://www.mandarinoriental.com/en/milan/la-scala",
      "Mandarin Oriental Jakarta (Indonesia)": "https://www.mandarinoriental.com/en/jakarta/jalan-mh-thamrin",
      "Mandarin Oriental Macau (China)": "https://www.mandarinoriental.com/en/macau/one-central",
      "Mandarin Oriental Prague (Czech Republic)": "https://www.mandarinoriental.com/en/prague/mala-strana",
      "Mandarin Oriental Sanya (China)": "https://www.mandarinoriental.com/en/sanya/dadonghai"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Mandarin Oriental Bangkok (Thailand)",
          "Emirates Palace Mandarin Oriental (Abu Dhabi, UAE)",
          "Mandarin Oriental Canouan (St. Vincent and the Grenadines)",
          "Mandarin Oriental Costa Navarino (Messinia, Greece)",
          "Mandarin Oriental Hyde Park (London, United Kingdom)",
          "Mandarin Oriental Qianmen (Beijing, China)",
          "Mandarin Oriental Shanghai (China)",
          "Mandarin Oriental Hong Kong (China)",
          "Mandarin Oriental Marrakech (Morocco)",
          "Mandarin Oriental Lake Como (Italy)"
        ]
      },
      "luxetravelexpert": {
        "label": "The Luxury Travel Expert",
        "url": "https://theluxurytravelexpert.com/best-mandarin-oriental-hotels-resorts/",
        "items": [
          "Mandarin Oriental Costa Navarino (Messinia, Greece)",
          "Mandarin Oriental Canouan (St. Vincent and the Grenadines)",
          "Mandarin Oriental Marrakech (Morocco)",
          "Mandarin Oriental Lake Como (Italy)",
          "Mandarin Oriental Ritz Madrid (Spain)",
          "Emirates Palace Mandarin Oriental (Abu Dhabi, UAE)",
          "Mandarin Oriental Bangkok (Thailand)",
          "Mandarin Oriental Bodrum (Turkey)",
          "Mandarin Oriental New York (United States)",
          "Mandarin Oriental Hyde Park (London, United Kingdom)"
        ]
      },
      "upgradedpoints": {
        "label": "Upgraded Points 2026",
        "url": "https://upgradedpoints.com/travel/hotels/best-mandarin-oriental-hotels-resorts/",
        "items": [
          "Emirates Palace Mandarin Oriental (Abu Dhabi, UAE)",
          "Mandarin Oriental Shanghai (China)",
          "Mandarin Oriental Hyde Park (London, United Kingdom)",
          "Mandarin Oriental Bangkok (Thailand)",
          "Mandarin Oriental Paris (France)",
          "Mandarin Oriental Wangfujing (Beijing, China)",
          "Mandarin Oriental Canouan (St. Vincent and the Grenadines)",
          "Mandarin Oriental Jumeira (Dubai, UAE)",
          "Mandarin Oriental Guangzhou (China)",
          "Mandarin Oriental Milan (Italy)",
          "Mandarin Oriental Hong Kong (China)",
          "Mandarin Oriental Jakarta (Indonesia)",
          "Mandarin Oriental Macau (China)",
          "Mandarin Oriental Prague (Czech Republic)",
          "Mandarin Oriental Sanya (China)"
        ]
      },
      "worlds50best": {
        "label": "World's 50 Best Hotels 2025",
        "url": "https://www.theworlds50best.com/hotels/",
        "items": [
          "Mandarin Oriental Bangkok (Thailand)",
          "Mandarin Oriental Qianmen (Beijing, China)",
          "Mandarin Oriental Hong Kong (China)"
        ]
      }
    },
    "vote": {
      "items": [
        "Mandarin Oriental Bangkok (Thailand)",
        "Emirates Palace Mandarin Oriental (Abu Dhabi, UAE)",
        "Mandarin Oriental Canouan (St. Vincent and the Grenadines)",
        "Mandarin Oriental Costa Navarino (Messinia, Greece)",
        "Mandarin Oriental Hyde Park (London, United Kingdom)",
        "Mandarin Oriental Qianmen (Beijing, China)",
        "Mandarin Oriental Shanghai (China)",
        "Mandarin Oriental Hong Kong (China)",
        "Mandarin Oriental Marrakech (Morocco)",
        "Mandarin Oriental Lake Como (Italy)"
      ]
    }
  },
  {
    "id": "best-rosewood-hotels-world",
    "publishedDate": "2026-05-29",
    "publishedAt": "2026-05-29T22:23:00Z",
    "title": "Best Rosewood Hotels in the World",
    "category": "Travel",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Las Ventanas al Paraíso, a Rosewood Resort (Los Cabos, Mexico)": "https://www.google.com/maps/search/?api=1&query=Las%20Ventanas%20al%20Para%C3%ADso%20a%20Rosewood%20Resort%20Los%20Cabos%20Mexico",
      "Rosewood Hong Kong (China)": "https://www.google.com/maps/search/?api=1&query=Rosewood%20Hong%20Kong%20China",
      "Hôtel de Crillon, a Rosewood Hotel (Paris, France)": "https://www.google.com/maps/search/?api=1&query=H%C3%B4tel%20de%20Crillon%20a%20Rosewood%20Hotel%20Paris%20France",
      "Rosewood Castiglion del Bosco (Tuscany, Italy)": "https://www.google.com/maps/search/?api=1&query=Rosewood%20Castiglion%20del%20Bosco%20Tuscany%20Italy",
      "Rosewood Little Dix Bay (Virgin Gorda, British Virgin Islands)": "https://www.google.com/maps/search/?api=1&query=Rosewood%20Little%20Dix%20Bay%20Virgin%20Gorda%20British%20Virgin%20Islands",
      "Rosewood Mayakoba (Riviera Maya, Mexico)": "https://www.google.com/maps/search/?api=1&query=Rosewood%20Mayakoba%20Riviera%20Maya%20Mexico",
      "The Carlyle, a Rosewood Hotel (New York, United States)": "https://www.google.com/maps/search/?api=1&query=The%20Carlyle%20a%20Rosewood%20Hotel%20New%20York%20United%20States",
      "Rosewood São Paulo (Brazil)": "https://www.google.com/maps/search/?api=1&query=Rosewood%20S%C3%A3o%20Paulo%20Brazil",
      "Rosewood Phuket (Thailand)": "https://www.google.com/maps/search/?api=1&query=Rosewood%20Phuket%20Thailand",
      "Rosewood London (United Kingdom)": "https://www.google.com/maps/search/?api=1&query=Rosewood%20London%20United%20Kingdom",
      "Rosewood Hotel Georgia (Vancouver, Canada)": "https://www.google.com/maps/search/?api=1&query=Rosewood%20Hotel%20Georgia%20Vancouver%20Canada",
      "Rosewood Sanya (China)": "https://www.google.com/maps/search/?api=1&query=Rosewood%20Sanya%20China",
      "Rosewood San Miguel de Allende (Mexico)": "https://www.google.com/maps/search/?api=1&query=Rosewood%20San%20Miguel%20de%20Allende%20Mexico",
      "Rosewood Luang Prabang (Laos)": "https://www.google.com/maps/search/?api=1&query=Rosewood%20Luang%20Prabang%20Laos",
      "Rosewood Baha Mar (Nassau, Bahamas)": "https://www.google.com/maps/search/?api=1&query=Rosewood%20Baha%20Mar%20Nassau%20Bahamas",
      "Rosewood Phnom Penh (Cambodia)": "https://www.google.com/maps/search/?api=1&query=Rosewood%20Phnom%20Penh%20Cambodia",
      "Rosewood Miramar Beach (Santa Barbara, United States)": "https://www.google.com/maps/search/?api=1&query=Rosewood%20Miramar%20Beach%20Santa%20Barbara%20United%20States"
    },
    "blurb": "A sense of place raised to an art. Rosewood Hong Kong was named the world's best hotel for 2025. These are the brand's most celebrated houses and resorts.",
    "defaultSource": "ai",
    "itemLinks": {
      "Hôtel de Crillon, a Rosewood Hotel (Paris, France)": "https://www.rosewoodhotels.com/en/hotel-de-crillon",
      "Las Ventanas al Paraíso, a Rosewood Resort (Los Cabos, Mexico)": "https://www.rosewoodhotels.com/en/las-ventanas-los-cabos",
      "Rosewood Hong Kong (China)": "https://www.rosewoodhotels.com/en/hong-kong",
      "Rosewood Castiglion del Bosco (Tuscany, Italy)": "https://www.rosewoodhotels.com/en/castiglion-del-bosco",
      "Rosewood São Paulo (Brazil)": "https://www.rosewoodhotels.com/en/sao-paulo",
      "Rosewood Mayakoba (Riviera Maya, Mexico)": "https://www.rosewoodhotels.com/en/mayakoba-riviera-maya",
      "Rosewood Hotel Georgia (Vancouver, Canada)": "https://www.rosewoodhotels.com/en/hotel-georgia-vancouver",
      "Rosewood London (United Kingdom)": "https://www.rosewoodhotels.com/en/london",
      "Rosewood Little Dix Bay (Virgin Gorda, British Virgin Islands)": "https://www.rosewoodhotels.com/en/little-dix-bay-virgin-gorda",
      "Rosewood Sanya (China)": "https://www.rosewoodhotels.com/en/sanya",
      "The Carlyle, a Rosewood Hotel (New York, United States)": "https://www.rosewoodhotels.com/en/the-carlyle-new-york/default",
      "Rosewood Phuket (Thailand)": "https://www.rosewoodhotels.com/en/phuket",
      "Rosewood San Miguel de Allende (Mexico)": "https://www.rosewoodhotels.com/en/san-miguel-de-allende",
      "Rosewood Luang Prabang (Laos)": "https://www.rosewoodhotels.com/en/luang-prabang",
      "Rosewood Baha Mar (Nassau, Bahamas)": "https://www.rosewoodhotels.com/en/baha-mar",
      "Rosewood Phnom Penh (Cambodia)": "https://www.rosewoodhotels.com/en/phnom-penh",
      "Rosewood Miramar Beach (Santa Barbara, United States)": "https://www.rosewoodhotels.com/en/miramar-beach-montecito"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Hôtel de Crillon, a Rosewood Hotel (Paris, France)",
          "Las Ventanas al Paraíso, a Rosewood Resort (Los Cabos, Mexico)",
          "Rosewood Hong Kong (China)",
          "Rosewood Castiglion del Bosco (Tuscany, Italy)",
          "Rosewood São Paulo (Brazil)",
          "Rosewood Mayakoba (Riviera Maya, Mexico)",
          "Rosewood Hotel Georgia (Vancouver, Canada)",
          "Rosewood London (United Kingdom)",
          "Rosewood Little Dix Bay (Virgin Gorda, British Virgin Islands)",
          "Rosewood Sanya (China)"
        ]
      },
      "luxetravelexpert": {
        "label": "The Luxury Travel Expert",
        "url": "https://theluxurytravelexpert.com/top-10-best-rosewood-hotels-resorts/",
        "items": [
          "Las Ventanas al Paraíso, a Rosewood Resort (Los Cabos, Mexico)",
          "Rosewood Hong Kong (China)",
          "Hôtel de Crillon, a Rosewood Hotel (Paris, France)",
          "Rosewood Castiglion del Bosco (Tuscany, Italy)",
          "Rosewood Little Dix Bay (Virgin Gorda, British Virgin Islands)",
          "Rosewood Mayakoba (Riviera Maya, Mexico)",
          "The Carlyle, a Rosewood Hotel (New York, United States)",
          "Rosewood São Paulo (Brazil)",
          "Rosewood Phuket (Thailand)",
          "Rosewood London (United Kingdom)"
        ]
      },
      "upgradedpoints": {
        "label": "Upgraded Points 2026",
        "url": "https://upgradedpoints.com/travel/hotels/best-rosewood-hotels-resorts/",
        "items": [
          "Hôtel de Crillon, a Rosewood Hotel (Paris, France)",
          "Rosewood Castiglion del Bosco (Tuscany, Italy)",
          "Las Ventanas al Paraíso, a Rosewood Resort (Los Cabos, Mexico)",
          "Rosewood Hotel Georgia (Vancouver, Canada)",
          "Rosewood Sanya (China)",
          "Rosewood London (United Kingdom)",
          "Rosewood Mayakoba (Riviera Maya, Mexico)",
          "Rosewood Hong Kong (China)",
          "Rosewood San Miguel de Allende (Mexico)",
          "Rosewood Luang Prabang (Laos)",
          "Rosewood Baha Mar (Nassau, Bahamas)",
          "Rosewood Phnom Penh (Cambodia)",
          "Rosewood Miramar Beach (Santa Barbara, United States)"
        ]
      },
      "worlds50best": {
        "label": "World's 50 Best Hotels 2025",
        "url": "https://www.theworlds50best.com/hotels/",
        "items": [
          "Rosewood Hong Kong (China)",
          "Hôtel de Crillon, a Rosewood Hotel (Paris, France)",
          "Rosewood São Paulo (Brazil)",
          "Las Ventanas al Paraíso, a Rosewood Resort (Los Cabos, Mexico)"
        ]
      }
    },
    "vote": {
      "items": [
        "Hôtel de Crillon, a Rosewood Hotel (Paris, France)",
        "Las Ventanas al Paraíso, a Rosewood Resort (Los Cabos, Mexico)",
        "Rosewood Hong Kong (China)",
        "Rosewood Castiglion del Bosco (Tuscany, Italy)",
        "Rosewood São Paulo (Brazil)",
        "Rosewood Mayakoba (Riviera Maya, Mexico)",
        "Rosewood Hotel Georgia (Vancouver, Canada)",
        "Rosewood London (United Kingdom)",
        "Rosewood Little Dix Bay (Virgin Gorda, British Virgin Islands)",
        "Rosewood Sanya (China)"
      ]
    }
  },
  {
    "id": "best-one-and-only-resorts-world",
    "publishedDate": "2026-05-29",
    "publishedAt": "2026-05-29T22:24:00Z",
    "title": "Best One&Only Resorts in the World",
    "category": "Travel",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "One&Only Reethi Rah (Maldives)": "https://www.google.com/maps/search/?api=1&query=One%20Only%20Reethi%20Rah%20Maldives",
      "One&Only Mandarina (Riviera Nayarit, Mexico)": "https://www.google.com/maps/search/?api=1&query=One%20Only%20Mandarina%20Riviera%20Nayarit%20Mexico",
      "One&Only Le Saint Géran (Mauritius)": "https://www.google.com/maps/search/?api=1&query=One%20Only%20Le%20Saint%20G%C3%A9ran%20Mauritius",
      "One&Only Nyungwe House (Rwanda)": "https://www.google.com/maps/search/?api=1&query=One%20Only%20Nyungwe%20House%20Rwanda",
      "One&Only Portonovi (Montenegro)": "https://www.google.com/maps/search/?api=1&query=One%20Only%20Portonovi%20Montenegro",
      "One&Only Palmilla (Los Cabos, Mexico)": "https://www.google.com/maps/search/?api=1&query=One%20Only%20Palmilla%20Los%20Cabos%20Mexico",
      "One&Only Aesthesis (Athens, Greece)": "https://www.google.com/maps/search/?api=1&query=One%20Only%20Aesthesis%20Athens%20Greece",
      "One&Only Desaru Coast (Malaysia)": "https://www.google.com/maps/search/?api=1&query=One%20Only%20Desaru%20Coast%20Malaysia",
      "One&Only The Palm (Dubai, UAE)": "https://www.google.com/maps/search/?api=1&query=One%20Only%20The%20Palm%20Dubai%20UAE",
      "One&Only Cape Town (South Africa)": "https://www.google.com/maps/search/?api=1&query=One%20Only%20Cape%20Town%20South%20Africa",
      "One&Only Royal Mirage (Dubai, UAE)": "https://www.google.com/maps/search/?api=1&query=One%20Only%20Royal%20Mirage%20Dubai%20UAE",
      "Emirates One&Only Wolgan Valley (New South Wales, Australia)": "https://www.google.com/maps/search/?api=1&query=Emirates%20One%20Only%20Wolgan%20Valley%20New%20South%20Wales%20Australia"
    },
    "blurb": "High-design, all-out resorts built for blowout escapes, from a Maldivian atoll to a Rwandan rainforest. The One&Only properties the luxury press ranks first.",
    "defaultSource": "ai",
    "itemLinks": {
      "One&Only Palmilla (Los Cabos, Mexico)": "https://www.oneandonlyresorts.com/palmilla",
      "One&Only Reethi Rah (Maldives)": "https://www.oneandonlyresorts.com/reethi-rah",
      "One&Only Nyungwe House (Rwanda)": "https://www.oneandonlyresorts.com/nyungwe-house",
      "One&Only Mandarina (Riviera Nayarit, Mexico)": "https://www.oneandonlyresorts.com/mandarina",
      "One&Only Portonovi (Montenegro)": "https://www.oneandonlyresorts.com/portonovi",
      "One&Only The Palm (Dubai, UAE)": "https://www.oneandonlyresorts.com/the-palm",
      "One&Only Cape Town (South Africa)": "https://www.oneandonlyresorts.com/cape-town",
      "One&Only Royal Mirage (Dubai, UAE)": "https://www.oneandonlyresorts.com/royal-mirage",
      "One&Only Le Saint Géran (Mauritius)": "https://www.oneandonlyresorts.com/le-saint-geran",
      "One&Only Aesthesis (Athens, Greece)": "https://www.oneandonlyresorts.com/aesthesis",
      "One&Only Desaru Coast (Malaysia)": "https://www.oneandonlyresorts.com/desaru-coast"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "One&Only Palmilla (Los Cabos, Mexico)",
          "One&Only Reethi Rah (Maldives)",
          "One&Only Nyungwe House (Rwanda)",
          "One&Only Mandarina (Riviera Nayarit, Mexico)",
          "One&Only Portonovi (Montenegro)",
          "One&Only The Palm (Dubai, UAE)",
          "One&Only Cape Town (South Africa)",
          "One&Only Royal Mirage (Dubai, UAE)",
          "One&Only Le Saint Géran (Mauritius)",
          "Emirates One&Only Wolgan Valley (New South Wales, Australia)"
        ]
      },
      "luxetravelexpert": {
        "label": "The Luxury Travel Expert",
        "url": "https://theluxurytravelexpert.com/top-10-best-oneonly-resorts-in-the-world/",
        "items": [
          "One&Only Reethi Rah (Maldives)",
          "One&Only Mandarina (Riviera Nayarit, Mexico)",
          "One&Only Le Saint Géran (Mauritius)",
          "One&Only Nyungwe House (Rwanda)",
          "One&Only Portonovi (Montenegro)",
          "One&Only Palmilla (Los Cabos, Mexico)",
          "One&Only Aesthesis (Athens, Greece)",
          "One&Only Desaru Coast (Malaysia)",
          "One&Only The Palm (Dubai, UAE)",
          "One&Only Cape Town (South Africa)"
        ]
      },
      "upgradedpoints": {
        "label": "Upgraded Points 2026",
        "url": "https://upgradedpoints.com/travel/hotels/best-oneonly-hotels-resorts/",
        "items": [
          "One&Only Palmilla (Los Cabos, Mexico)",
          "One&Only Royal Mirage (Dubai, UAE)",
          "One&Only Nyungwe House (Rwanda)",
          "One&Only Portonovi (Montenegro)",
          "One&Only Mandarina (Riviera Nayarit, Mexico)",
          "Emirates One&Only Wolgan Valley (New South Wales, Australia)",
          "One&Only Reethi Rah (Maldives)",
          "One&Only Cape Town (South Africa)",
          "One&Only The Palm (Dubai, UAE)"
        ]
      },
      "pursuitist": {
        "label": "Pursuitist 2024",
        "url": "https://pursuitist.com/the-worlds-best-oneonly-resorts/",
        "items": [
          "One&Only Palmilla (Los Cabos, Mexico)",
          "One&Only Reethi Rah (Maldives)",
          "One&Only The Palm (Dubai, UAE)",
          "One&Only Nyungwe House (Rwanda)",
          "One&Only Cape Town (South Africa)"
        ]
      }
    },
    "vote": {
      "items": [
        "One&Only Palmilla (Los Cabos, Mexico)",
        "One&Only Reethi Rah (Maldives)",
        "One&Only Nyungwe House (Rwanda)",
        "One&Only Mandarina (Riviera Nayarit, Mexico)",
        "One&Only Portonovi (Montenegro)",
        "One&Only The Palm (Dubai, UAE)",
        "One&Only Cape Town (South Africa)",
        "One&Only Royal Mirage (Dubai, UAE)",
        "One&Only Le Saint Géran (Mauritius)",
        "Emirates One&Only Wolgan Valley (New South Wales, Australia)"
      ]
    }
  },
  {
    "id": "best-belmond-hotels-world",
    "publishedDate": "2026-05-29",
    "publishedAt": "2026-05-29T22:25:00Z",
    "title": "Best Belmond Hotels in the World",
    "category": "Travel",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Belmond Hotel Caruso (Ravello, Italy)": "https://www.google.com/maps/search/?api=1&query=Belmond%20Hotel%20Caruso%20Ravello%20Italy",
      "Belmond Eagle Island Lodge (Okavango Delta, Botswana)": "https://www.google.com/maps/search/?api=1&query=Belmond%20Eagle%20Island%20Lodge%20Okavango%20Delta%20Botswana",
      "Belmond Cap Juluca (Anguilla)": "https://www.google.com/maps/search/?api=1&query=Belmond%20Cap%20Juluca%20Anguilla",
      "Belmond Hotel Rio Sagrado (Sacred Valley, Peru)": "https://www.google.com/maps/search/?api=1&query=Belmond%20Hotel%20Rio%20Sagrado%20Sacred%20Valley%20Peru",
      "Belmond Hotel Splendido (Portofino, Italy)": "https://www.google.com/maps/search/?api=1&query=Belmond%20Hotel%20Splendido%20Portofino%20Italy",
      "Maroma, a Belmond Hotel (Riviera Maya, Mexico)": "https://www.google.com/maps/search/?api=1&query=Maroma%20a%20Belmond%20Hotel%20Riviera%20Maya%20Mexico",
      "Belmond La Samanna (St. Martin)": "https://www.google.com/maps/search/?api=1&query=Belmond%20La%20Samanna%20St.%20Martin",
      "Belmond El Encanto (Santa Barbara, United States)": "https://www.google.com/maps/search/?api=1&query=Belmond%20El%20Encanto%20Santa%20Barbara%20United%20States",
      "Belmond Reid's Palace (Madeira, Portugal)": "https://www.google.com/maps/search/?api=1&query=Belmond%20Reid%27s%20Palace%20Madeira%20Portugal",
      "Belmond Hotel das Cataratas (Iguassu Falls, Brazil)": "https://www.google.com/maps/search/?api=1&query=Belmond%20Hotel%20das%20Cataratas%20Iguassu%20Falls%20Brazil",
      "Copacabana Palace, a Belmond Hotel (Rio de Janeiro, Brazil)": "https://www.google.com/maps/search/?api=1&query=Copacabana%20Palace%20a%20Belmond%20Hotel%20Rio%20de%20Janeiro%20Brazil",
      "Belmond Hotel Cipriani (Venice, Italy)": "https://www.google.com/maps/search/?api=1&query=Belmond%20Hotel%20Cipriani%20Venice%20Italy",
      "Mount Nelson, a Belmond Hotel (Cape Town, South Africa)": "https://www.google.com/maps/search/?api=1&query=Mount%20Nelson%20a%20Belmond%20Hotel%20Cape%20Town%20South%20Africa",
      "Palacio Nazarenas, a Belmond Hotel (Cusco, Peru)": "https://www.google.com/maps/search/?api=1&query=Palacio%20Nazarenas%20a%20Belmond%20Hotel%20Cusco%20Peru"
    },
    "blurb": "Legendary addresses: a Venetian palazzo on the lagoon, a cliffside hideaway in Ravello, a palace above Iguassu Falls. The most storied hotels in the Belmond collection.",
    "defaultSource": "ai",
    "itemLinks": {
      "Maroma, a Belmond Hotel (Riviera Maya, Mexico)": "https://www.belmond.com/hotels/north-america/mexico/riviera-maya/belmond-maroma-resort-and-spa/",
      "Belmond Hotel Splendido (Portofino, Italy)": "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/",
      "Belmond Hotel Caruso (Ravello, Italy)": "https://www.belmond.com/hotels/europe/italy/amalfi-coast/belmond-hotel-caruso/",
      "Copacabana Palace, a Belmond Hotel (Rio de Janeiro, Brazil)": "https://www.belmond.com/hotels/south-america/brazil/rio-de-janeiro/belmond-copacabana-palace/",
      "Belmond Eagle Island Lodge (Okavango Delta, Botswana)": "https://www.belmond.com/safaris/africa/botswana/belmond-eagle-island-lodge/",
      "Belmond Cap Juluca (Anguilla)": "https://www.belmond.com/hotels/north-america/caribbean/anguilla/belmond-cap-juluca/",
      "Belmond Hotel Cipriani (Venice, Italy)": "https://www.belmond.com/hotels/europe/italy/venice/belmond-hotel-cipriani/",
      "Belmond Hotel das Cataratas (Iguassu Falls, Brazil)": "https://www.belmond.com/hotels/south-america/brazil/iguassu-falls/belmond-hotel-das-cataratas/",
      "Belmond Hotel Rio Sagrado (Sacred Valley, Peru)": "https://www.belmond.com/hotels/south-america/peru/sacred-valley/belmond-hotel-rio-sagrado/",
      "Mount Nelson, a Belmond Hotel (Cape Town, South Africa)": "https://www.belmond.com/hotels/africa/south-africa/cape-town/belmond-mount-nelson-hotel/",
      "Belmond La Samanna (St. Martin)": "https://www.belmond.com/hotels/north-america/caribbean/st-martin/belmond-la-samanna/",
      "Belmond El Encanto (Santa Barbara, United States)": "https://www.belmond.com/hotels/north-america/usa/ca/santa-barbara/belmond-el-encanto",
      "Belmond Reid's Palace (Madeira, Portugal)": "https://www.belmond.com/hotels/europe/portugal/madeira/belmond-reids-palace/",
      "Palacio Nazarenas, a Belmond Hotel (Cusco, Peru)": "https://www.belmond.com/hotels/south-america/peru/cusco/belmond-palacio-nazarenas/"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Maroma, a Belmond Hotel (Riviera Maya, Mexico)",
          "Belmond Hotel Splendido (Portofino, Italy)",
          "Belmond Hotel Caruso (Ravello, Italy)",
          "Copacabana Palace, a Belmond Hotel (Rio de Janeiro, Brazil)",
          "Belmond Eagle Island Lodge (Okavango Delta, Botswana)",
          "Belmond Cap Juluca (Anguilla)",
          "Belmond Hotel Cipriani (Venice, Italy)",
          "Belmond Hotel das Cataratas (Iguassu Falls, Brazil)",
          "Belmond Hotel Rio Sagrado (Sacred Valley, Peru)",
          "Mount Nelson, a Belmond Hotel (Cape Town, South Africa)"
        ]
      },
      "luxetravelexpert": {
        "label": "The Luxury Travel Expert",
        "url": "https://theluxurytravelexpert.com/best-belmond-hotels-resorts/",
        "items": [
          "Belmond Hotel Caruso (Ravello, Italy)",
          "Belmond Eagle Island Lodge (Okavango Delta, Botswana)",
          "Belmond Cap Juluca (Anguilla)",
          "Belmond Hotel Rio Sagrado (Sacred Valley, Peru)",
          "Belmond Hotel Splendido (Portofino, Italy)",
          "Maroma, a Belmond Hotel (Riviera Maya, Mexico)",
          "Belmond La Samanna (St. Martin)",
          "Belmond El Encanto (Santa Barbara, United States)",
          "Belmond Reid's Palace (Madeira, Portugal)",
          "Belmond Hotel das Cataratas (Iguassu Falls, Brazil)"
        ]
      },
      "worlds50best": {
        "label": "World's 50 Best Hotels 2025",
        "url": "https://www.theworlds50best.com/hotels/",
        "items": [
          "Copacabana Palace, a Belmond Hotel (Rio de Janeiro, Brazil)",
          "Maroma, a Belmond Hotel (Riviera Maya, Mexico)",
          "Belmond Hotel Cipriani (Venice, Italy)",
          "Mount Nelson, a Belmond Hotel (Cape Town, South Africa)",
          "Belmond Hotel das Cataratas (Iguassu Falls, Brazil)",
          "Belmond Hotel Splendido (Portofino, Italy)",
          "Palacio Nazarenas, a Belmond Hotel (Cusco, Peru)"
        ]
      }
    },
    "vote": {
      "items": [
        "Maroma, a Belmond Hotel (Riviera Maya, Mexico)",
        "Belmond Hotel Splendido (Portofino, Italy)",
        "Belmond Hotel Caruso (Ravello, Italy)",
        "Copacabana Palace, a Belmond Hotel (Rio de Janeiro, Brazil)",
        "Belmond Eagle Island Lodge (Okavango Delta, Botswana)",
        "Belmond Cap Juluca (Anguilla)",
        "Belmond Hotel Cipriani (Venice, Italy)",
        "Belmond Hotel das Cataratas (Iguassu Falls, Brazil)",
        "Belmond Hotel Rio Sagrado (Sacred Valley, Peru)",
        "Mount Nelson, a Belmond Hotel (Cape Town, South Africa)"
      ]
    }
  },
  {
    "id": "best-six-senses-resorts-world",
    "publishedDate": "2026-05-29",
    "publishedAt": "2026-05-29T22:26:00Z",
    "title": "Best Six Senses Resorts in the World",
    "category": "Travel",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Six Senses Fiji (Malolo Island, Fiji)": "https://www.google.com/maps/search/?api=1&query=Six%20Senses%20Fiji%20Malolo%20Island%20Fiji",
      "Six Senses Zighy Bay (Musandam, Oman)": "https://www.google.com/maps/search/?api=1&query=Six%20Senses%20Zighy%20Bay%20Musandam%20Oman",
      "Six Senses Laamu (Maldives)": "https://www.google.com/maps/search/?api=1&query=Six%20Senses%20Laamu%20Maldives",
      "Six Senses Zil Pasyon (Seychelles)": "https://www.google.com/maps/search/?api=1&query=Six%20Senses%20Zil%20Pasyon%20Seychelles",
      "Six Senses Krabey Island (Cambodia)": "https://www.google.com/maps/search/?api=1&query=Six%20Senses%20Krabey%20Island%20Cambodia",
      "Six Senses Bhutan": "https://www.google.com/maps/search/?api=1&query=Six%20Senses%20Bhutan",
      "Six Senses Yao Noi (Phang Nga Bay, Thailand)": "https://www.google.com/maps/search/?api=1&query=Six%20Senses%20Yao%20Noi%20Phang%20Nga%20Bay%20Thailand",
      "Six Senses Ninh Van Bay (Nha Trang, Vietnam)": "https://www.google.com/maps/search/?api=1&query=Six%20Senses%20Ninh%20Van%20Bay%20Nha%20Trang%20Vietnam",
      "Six Senses Rome (Italy)": "https://www.google.com/maps/search/?api=1&query=Six%20Senses%20Rome%20Italy",
      "Six Senses Douro Valley (Portugal)": "https://www.google.com/maps/search/?api=1&query=Six%20Senses%20Douro%20Valley%20Portugal",
      "Six Senses Thimphu (Bhutan)": "https://www.google.com/maps/search/?api=1&query=Six%20Senses%20Thimphu%20Bhutan",
      "Six Senses Uluwatu (Bali, Indonesia)": "https://www.google.com/maps/search/?api=1&query=Six%20Senses%20Uluwatu%20Bali%20Indonesia",
      "Six Senses Samui (Thailand)": "https://www.google.com/maps/search/?api=1&query=Six%20Senses%20Samui%20Thailand",
      "Six Senses Kaplankaya (Bodrum, Türkiye)": "https://www.google.com/maps/search/?api=1&query=Six%20Senses%20Kaplankaya%20Bodrum%20T%C3%BCrkiye",
      "Six Senses Con Dao (Vietnam)": "https://www.google.com/maps/search/?api=1&query=Six%20Senses%20Con%20Dao%20Vietnam"
    },
    "blurb": "Barefoot luxury and serious wellness, from a Maldivian atoll to the Omani desert coast. The Six Senses resorts that consistently top the rankings.",
    "defaultSource": "ai",
    "itemLinks": {
      "Six Senses Fiji (Malolo Island, Fiji)": "https://www.sixsenses.com/en/hotels-resorts/asia-the-pacific/fiji/fiji/",
      "Six Senses Laamu (Maldives)": "https://www.sixsenses.com/en/hotels-resorts/asia-the-pacific/maldives/laamu/",
      "Six Senses Zighy Bay (Musandam, Oman)": "https://www.sixsenses.com/en/hotels-resorts/middle-east-africa/oman/zighy-bay/",
      "Six Senses Yao Noi (Phang Nga Bay, Thailand)": "https://www.sixsenses.com/en/hotels-resorts/asia-the-pacific/thailand/yao-noi/",
      "Six Senses Ninh Van Bay (Nha Trang, Vietnam)": "https://www.sixsenses.com/en/hotels-resorts/asia-the-pacific/vietnam/ninh-van-bay/",
      "Six Senses Zil Pasyon (Seychelles)": "https://www.sixsenses.com/en/hotels-resorts/middle-east-africa/seychelles/zil-pasyon/",
      "Six Senses Douro Valley (Portugal)": "https://www.sixsenses.com/en/hotels-resorts/europe/portugal/douro-valley/",
      "Six Senses Krabey Island (Cambodia)": "https://www.sixsenses.com/en/hotels-resorts/asia-the-pacific/cambodia/krabey-island/",
      "Six Senses Bhutan": "https://www.sixsenses.com/en/hotels-resorts/asia-the-pacific/bhutan/bhutan/lodges/",
      "Six Senses Thimphu (Bhutan)": "https://www.sixsenses.com/en/hotels-resorts/asia-the-pacific/bhutan/bhutan/lodges/six-senses-thimphu/",
      "Six Senses Rome (Italy)": "https://www.sixsenses.com/en/hotels-resorts/europe/italy/rome/",
      "Six Senses Uluwatu (Bali, Indonesia)": "https://www.sixsenses.com/en/hotels-resorts/asia-the-pacific/indonesia/uluwatu-bali/",
      "Six Senses Samui (Thailand)": "https://www.sixsenses.com/en/hotels-resorts/asia-the-pacific/thailand/samui/",
      "Six Senses Kaplankaya (Bodrum, Türkiye)": "https://www.sixsenses.com/en/hotels-resorts/europe/turkey/kaplankaya/",
      "Six Senses Con Dao (Vietnam)": "https://www.sixsenses.com/en/hotels-resorts/asia-the-pacific/vietnam/con-dao/"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Six Senses Fiji (Malolo Island, Fiji)",
          "Six Senses Laamu (Maldives)",
          "Six Senses Zighy Bay (Musandam, Oman)",
          "Six Senses Yao Noi (Phang Nga Bay, Thailand)",
          "Six Senses Ninh Van Bay (Nha Trang, Vietnam)",
          "Six Senses Zil Pasyon (Seychelles)",
          "Six Senses Douro Valley (Portugal)",
          "Six Senses Krabey Island (Cambodia)",
          "Six Senses Bhutan",
          "Six Senses Thimphu (Bhutan)"
        ]
      },
      "luxetravelexpert": {
        "label": "The Luxury Travel Expert 2026",
        "url": "https://theluxurytravelexpert.com/best-six-senses-hotels-resorts-world/",
        "items": [
          "Six Senses Fiji (Malolo Island, Fiji)",
          "Six Senses Zighy Bay (Musandam, Oman)",
          "Six Senses Laamu (Maldives)",
          "Six Senses Zil Pasyon (Seychelles)",
          "Six Senses Krabey Island (Cambodia)",
          "Six Senses Bhutan",
          "Six Senses Yao Noi (Phang Nga Bay, Thailand)",
          "Six Senses Ninh Van Bay (Nha Trang, Vietnam)",
          "Six Senses Rome (Italy)",
          "Six Senses Douro Valley (Portugal)"
        ]
      },
      "upgradedpoints": {
        "label": "Upgraded Points 2025",
        "url": "https://upgradedpoints.com/travel/hotels/best-six-senses-hotels-resorts/",
        "items": [
          "Six Senses Laamu (Maldives)",
          "Six Senses Fiji (Malolo Island, Fiji)",
          "Six Senses Yao Noi (Phang Nga Bay, Thailand)",
          "Six Senses Ninh Van Bay (Nha Trang, Vietnam)",
          "Six Senses Zighy Bay (Musandam, Oman)",
          "Six Senses Douro Valley (Portugal)",
          "Six Senses Thimphu (Bhutan)",
          "Six Senses Uluwatu (Bali, Indonesia)",
          "Six Senses Samui (Thailand)",
          "Six Senses Kaplankaya (Bodrum, Türkiye)",
          "Six Senses Con Dao (Vietnam)"
        ]
      }
    },
    "vote": {
      "items": [
        "Six Senses Fiji (Malolo Island, Fiji)",
        "Six Senses Laamu (Maldives)",
        "Six Senses Zighy Bay (Musandam, Oman)",
        "Six Senses Yao Noi (Phang Nga Bay, Thailand)",
        "Six Senses Ninh Van Bay (Nha Trang, Vietnam)",
        "Six Senses Zil Pasyon (Seychelles)",
        "Six Senses Douro Valley (Portugal)",
        "Six Senses Krabey Island (Cambodia)",
        "Six Senses Bhutan",
        "Six Senses Thimphu (Bhutan)"
      ]
    }
  },
  {
    "id": "best-st-regis-hotels-world",
    "publishedDate": "2026-05-29",
    "publishedAt": "2026-05-29T22:27:00Z",
    "title": "Best St. Regis Hotels in the World",
    "category": "Travel",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "The St. Regis Maldives Vommuli Resort (Dhaalu Atoll, Maldives)": "https://www.google.com/maps/search/?api=1&query=The%20St.%20Regis%20Maldives%20Vommuli%20Resort%20Dhaalu%20Atoll%20Maldives",
      "The St. Regis Bora Bora Resort (French Polynesia)": "https://www.google.com/maps/search/?api=1&query=The%20St.%20Regis%20Bora%20Bora%20Resort%20French%20Polynesia",
      "The St. Regis Bali Resort (Nusa Dua, Indonesia)": "https://www.google.com/maps/search/?api=1&query=The%20St.%20Regis%20Bali%20Resort%20Nusa%20Dua%20Indonesia",
      "The St. Regis Kanai Resort (Riviera Maya, Mexico)": "https://www.google.com/maps/search/?api=1&query=The%20St.%20Regis%20Kanai%20Resort%20Riviera%20Maya%20Mexico",
      "The St. Regis Istanbul (Turkey)": "https://www.google.com/maps/search/?api=1&query=The%20St.%20Regis%20Istanbul%20Turkey",
      "The St. Regis Aspen Resort (Colorado, United States)": "https://www.google.com/maps/search/?api=1&query=The%20St.%20Regis%20Aspen%20Resort%20Colorado%20United%20States",
      "The St. Regis Venice (Italy)": "https://www.google.com/maps/search/?api=1&query=The%20St.%20Regis%20Venice%20Italy",
      "The St. Regis New York (United States)": "https://www.google.com/maps/search/?api=1&query=The%20St.%20Regis%20New%20York%20United%20States",
      "The St. Regis Saadiyat Island Resort (Abu Dhabi, UAE)": "https://www.google.com/maps/search/?api=1&query=The%20St.%20Regis%20Saadiyat%20Island%20Resort%20Abu%20Dhabi%20UAE",
      "The St. Regis Mardavall Mallorca Resort (Spain)": "https://www.google.com/maps/search/?api=1&query=The%20St.%20Regis%20Mardavall%20Mallorca%20Resort%20Spain",
      "The St. Regis Red Sea Resort (Saudi Arabia)": "https://www.google.com/maps/search/?api=1&query=The%20St.%20Regis%20Red%20Sea%20Resort%20Saudi%20Arabia",
      "The St. Regis Florence (Italy)": "https://www.google.com/maps/search/?api=1&query=The%20St.%20Regis%20Florence%20Italy",
      "The St. Regis San Francisco (United States)": "https://www.google.com/maps/search/?api=1&query=The%20St.%20Regis%20San%20Francisco%20United%20States",
      "The St. Regis Punta Mita Resort (Mexico)": "https://www.google.com/maps/search/?api=1&query=The%20St.%20Regis%20Punta%20Mita%20Resort%20Mexico",
      "The St. Regis Bangkok (Thailand)": "https://www.google.com/maps/search/?api=1&query=The%20St.%20Regis%20Bangkok%20Thailand",
      "The St. Regis Langkawi (Malaysia)": "https://www.google.com/maps/search/?api=1&query=The%20St.%20Regis%20Langkawi%20Malaysia",
      "The St. Regis Deer Valley (Utah, United States)": "https://www.google.com/maps/search/?api=1&query=The%20St.%20Regis%20Deer%20Valley%20Utah%20United%20States",
      "The St. Regis Hong Kong (China)": "https://www.google.com/maps/search/?api=1&query=The%20St.%20Regis%20Hong%20Kong%20China",
      "The St. Regis Cairo (Egypt)": "https://www.google.com/maps/search/?api=1&query=The%20St.%20Regis%20Cairo%20Egypt",
      "The St. Regis Bal Harbour Resort (Miami, United States)": "https://www.google.com/maps/search/?api=1&query=The%20St.%20Regis%20Bal%20Harbour%20Resort%20Miami%20United%20States"
    },
    "blurb": "Butler service and grande-dame glamour across overwater villas and landmark city hotels. The St. Regis properties that rank above the rest, from the Maldives to Mallorca.",
    "defaultSource": "ai",
    "itemLinks": {
      "The St. Regis Maldives Vommuli Resort (Dhaalu Atoll, Maldives)": "https://www.marriott.com/en-us/hotels/mlexr-the-st-regis-maldives-vommuli-resort/overview/",
      "The St. Regis Bora Bora Resort (French Polynesia)": "https://www.marriott.com/en-us/hotels/bobxr-the-st-regis-bora-bora-resort/overview/",
      "The St. Regis Venice (Italy)": "https://www.marriott.com/en-us/hotels/vcexr-the-st-regis-venice/overview/",
      "The St. Regis New York (United States)": "https://www.marriott.com/en-us/hotels/nycxr-the-st-regis-new-york/overview/",
      "The St. Regis Aspen Resort (Colorado, United States)": "https://www.marriott.com/en-us/hotels/asexr-the-st-regis-aspen-resort/overview/",
      "The St. Regis Mardavall Mallorca Resort (Spain)": "https://www.marriott.com/en-us/hotels/pmixr-the-st-regis-mardavall-mallorca-resort/overview/",
      "The St. Regis Red Sea Resort (Saudi Arabia)": "https://www.marriott.com/en-us/hotels/ejhxr-the-st-regis-red-sea-resort/overview/",
      "The St. Regis Bali Resort (Nusa Dua, Indonesia)": "https://www.marriott.com/en-us/hotels/dpsxr-the-st-regis-bali-resort/overview/",
      "The St. Regis Bangkok (Thailand)": "https://www.marriott.com/en-us/hotels/bkkxr-the-st-regis-bangkok/overview/",
      "The St. Regis Kanai Resort (Riviera Maya, Mexico)": "https://www.marriott.com/en-us/hotels/cunxr-the-st-regis-kanai-resort-riviera-maya/overview/",
      "The St. Regis Istanbul (Turkey)": "https://www.marriott.com/en-us/hotels/istxr-the-st-regis-istanbul/overview/",
      "The St. Regis Saadiyat Island Resort (Abu Dhabi, UAE)": "https://www.marriott.com/en-us/hotels/auhxr-the-st-regis-saadiyat-island-resort-abu-dhabi/overview/",
      "The St. Regis Florence (Italy)": "https://www.marriott.com/en-us/hotels/flrxr-the-st-regis-florence/overview/",
      "The St. Regis San Francisco (United States)": "https://www.marriott.com/en-us/hotels/sfoxr-the-st-regis-san-francisco/overview/",
      "The St. Regis Punta Mita Resort (Mexico)": "https://www.marriott.com/en-us/hotels/pvrxr-the-st-regis-punta-mita-resort/overview/",
      "The St. Regis Langkawi (Malaysia)": "https://www.marriott.com/en-us/hotels/lgkxr-the-st-regis-langkawi/overview/",
      "The St. Regis Deer Valley (Utah, United States)": "https://www.marriott.com/en-us/hotels/slcxr-the-st-regis-deer-valley/overview/",
      "The St. Regis Hong Kong (China)": "https://www.marriott.com/en-us/hotels/hkgxr-the-st-regis-hong-kong/overview/",
      "The St. Regis Cairo (Egypt)": "https://www.marriott.com/en-us/hotels/caixr-the-st-regis-cairo/overview/",
      "The St. Regis Bal Harbour Resort (Miami, United States)": "https://www.marriott.com/en-us/hotels/miaxr-the-st-regis-bal-harbour-resort/overview/"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "The St. Regis Maldives Vommuli Resort (Dhaalu Atoll, Maldives)",
          "The St. Regis Bora Bora Resort (French Polynesia)",
          "The St. Regis Venice (Italy)",
          "The St. Regis New York (United States)",
          "The St. Regis Aspen Resort (Colorado, United States)",
          "The St. Regis Mardavall Mallorca Resort (Spain)",
          "The St. Regis Red Sea Resort (Saudi Arabia)",
          "The St. Regis Bali Resort (Nusa Dua, Indonesia)",
          "The St. Regis Bangkok (Thailand)",
          "The St. Regis Kanai Resort (Riviera Maya, Mexico)"
        ]
      },
      "luxetravelexpert": {
        "label": "The Luxury Travel Expert",
        "url": "https://theluxurytravelexpert.com/top-10-best-st-regis-resorts-hotels/",
        "items": [
          "The St. Regis Maldives Vommuli Resort (Dhaalu Atoll, Maldives)",
          "The St. Regis Bora Bora Resort (French Polynesia)",
          "The St. Regis Bali Resort (Nusa Dua, Indonesia)",
          "The St. Regis Kanai Resort (Riviera Maya, Mexico)",
          "The St. Regis Istanbul (Turkey)",
          "The St. Regis Aspen Resort (Colorado, United States)",
          "The St. Regis Venice (Italy)",
          "The St. Regis New York (United States)",
          "The St. Regis Saadiyat Island Resort (Abu Dhabi, UAE)",
          "The St. Regis Mardavall Mallorca Resort (Spain)"
        ]
      },
      "luxurytraveldiary": {
        "label": "Luxury Travel Diary 2024",
        "url": "https://www.luxurytraveldiary.com/2024/09/top-10-best-st-regis-hotels-in-the-world/",
        "items": [
          "The St. Regis Mardavall Mallorca Resort (Spain)",
          "The St. Regis Red Sea Resort (Saudi Arabia)",
          "The St. Regis Bora Bora Resort (French Polynesia)",
          "The St. Regis Aspen Resort (Colorado, United States)",
          "The St. Regis Florence (Italy)",
          "The St. Regis Venice (Italy)",
          "The St. Regis New York (United States)",
          "The St. Regis Maldives Vommuli Resort (Dhaalu Atoll, Maldives)",
          "The St. Regis San Francisco (United States)",
          "The St. Regis Punta Mita Resort (Mexico)"
        ]
      },
      "thepointsguy": {
        "label": "The Points Guy 2023 (curated)",
        "url": "https://thepointsguy.com/hotel/best-st-regis-hotel/",
        "items": [
          "The St. Regis Maldives Vommuli Resort (Dhaalu Atoll, Maldives)",
          "The St. Regis Venice (Italy)",
          "The St. Regis Bangkok (Thailand)",
          "The St. Regis New York (United States)",
          "The St. Regis Langkawi (Malaysia)",
          "The St. Regis Deer Valley (Utah, United States)",
          "The St. Regis Bora Bora Resort (French Polynesia)",
          "The St. Regis Hong Kong (China)",
          "The St. Regis Cairo (Egypt)",
          "The St. Regis Bal Harbour Resort (Miami, United States)"
        ]
      }
    },
    "vote": {
      "items": [
        "The St. Regis Maldives Vommuli Resort (Dhaalu Atoll, Maldives)",
        "The St. Regis Bora Bora Resort (French Polynesia)",
        "The St. Regis Venice (Italy)",
        "The St. Regis New York (United States)",
        "The St. Regis Aspen Resort (Colorado, United States)",
        "The St. Regis Mardavall Mallorca Resort (Spain)",
        "The St. Regis Red Sea Resort (Saudi Arabia)",
        "The St. Regis Bali Resort (Nusa Dua, Indonesia)",
        "The St. Regis Bangkok (Thailand)",
        "The St. Regis Kanai Resort (Riviera Maya, Mexico)"
      ]
    }
  },
  {
    "id": "best-oetker-collection-hotels-world",
    "publishedDate": "2026-05-29",
    "publishedAt": "2026-05-29T22:28:00Z",
    "title": "Best Oetker Collection Hotels in the World",
    "category": "Travel",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Hôtel du Cap-Eden-Roc (Antibes, France)": "https://www.google.com/maps/search/?api=1&query=H%C3%B4tel%20du%20Cap-Eden-Roc%20Antibes%20France",
      "Le Bristol Paris (France)": "https://www.google.com/maps/search/?api=1&query=Le%20Bristol%20Paris%20France",
      "Eden Rock - St Barths (Saint Barthélemy)": "https://www.google.com/maps/search/?api=1&query=Eden%20Rock%20-%20St%20Barths%20Saint%20Barth%C3%A9lemy",
      "The Lanesborough (London, United Kingdom)": "https://www.google.com/maps/search/?api=1&query=The%20Lanesborough%20London%20United%20Kingdom",
      "Jumby Bay Island (Antigua and Barbuda)": "https://www.google.com/maps/search/?api=1&query=Jumby%20Bay%20Island%20Oetker%20Collection",
      "Hotel La Palma (Capri, Italy)": "https://www.google.com/maps/search/?api=1&query=Hotel%20La%20Palma%20Capri%20Italy",
      "L'Apogée Courchevel (France)": "https://www.google.com/maps/search/?api=1&query=L%27Apog%C3%A9e%20Courchevel%20France",
      "Château Saint-Martin & Spa (Vence, France)": "https://www.google.com/maps/search/?api=1&query=Ch%C3%A2teau%20Saint-Martin%20Spa%20Vence%20France",
      "Brenners Park-Hotel & Spa (Baden-Baden, Germany)": "https://www.google.com/maps/search/?api=1&query=Brenners%20Park-Hotel%20Spa%20Baden-Baden%20Germany",
      "Palácio Tangará (São Paulo, Brazil)": "https://www.google.com/maps/search/?api=1&query=Pal%C3%A1cio%20Tangar%C3%A1%20S%C3%A3o%20Paulo%20Brazil"
    },
    "blurb": "The grande dames of European luxury: Le Bristol's Paris elegance, Hôtel du Cap's Riviera legend, Eden Rock's Caribbean cool. The standout houses of the Oetker Collection.",
    "defaultSource": "ai",
    "itemLinks": {
      "Le Bristol Paris (France)": "https://www.oetkerhotels.com/hotels/le-bristol-paris/",
      "Hôtel du Cap-Eden-Roc (Antibes, France)": "https://www.oetkerhotels.com/hotels/hotel-du-cap-eden-roc/",
      "Eden Rock - St Barths (Saint Barthélemy)": "https://www.oetkerhotels.com/hotels/eden-rock-st-barths/",
      "The Lanesborough (London, United Kingdom)": "https://www.oetkerhotels.com/hotels/the-lanesborough/",
      "Jumby Bay Island (Antigua and Barbuda)": "https://www.oetkerhotels.com/hotels/jumby-bay-island/",
      "Hotel La Palma (Capri, Italy)": "https://www.oetkerhotels.com/hotels/hotel-la-palma/",
      "L'Apogée Courchevel (France)": "https://www.oetkerhotels.com/hotels/lapogee-courchevel/",
      "Château Saint-Martin & Spa (Vence, France)": "https://www.oetkerhotels.com/hotels/chateau-saint-martin/",
      "Brenners Park-Hotel & Spa (Baden-Baden, Germany)": "https://www.oetkerhotels.com/hotels/brenners-park-hotel-spa/",
      "Palácio Tangará (São Paulo, Brazil)": "https://www.oetkerhotels.com/hotels/palacio-tangara/"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Le Bristol Paris (France)",
          "Hôtel du Cap-Eden-Roc (Antibes, France)",
          "Eden Rock - St Barths (Saint Barthélemy)",
          "The Lanesborough (London, United Kingdom)",
          "Jumby Bay Island (Antigua and Barbuda)",
          "Hotel La Palma (Capri, Italy)",
          "L'Apogée Courchevel (France)",
          "Château Saint-Martin & Spa (Vence, France)",
          "Brenners Park-Hotel & Spa (Baden-Baden, Germany)",
          "Palácio Tangará (São Paulo, Brazil)"
        ]
      },
      "onemileatatime": {
        "label": "One Mile at a Time 2025 (by popularity)",
        "url": "https://onemileatatime.com/guides/oetker-hotels/",
        "items": [
          "Hôtel du Cap-Eden-Roc (Antibes, France)",
          "Le Bristol Paris (France)",
          "Eden Rock - St Barths (Saint Barthélemy)",
          "The Lanesborough (London, United Kingdom)",
          "Jumby Bay Island (Antigua and Barbuda)",
          "Hotel La Palma (Capri, Italy)",
          "L'Apogée Courchevel (France)",
          "Château Saint-Martin & Spa (Vence, France)",
          "Brenners Park-Hotel & Spa (Baden-Baden, Germany)",
          "Palácio Tangará (São Paulo, Brazil)"
        ]
      },
      "worlds50best2024": {
        "label": "World's 50 Best Hotels 2024",
        "url": "https://www.theworlds50best.com/hotels/",
        "items": [
          "Hôtel du Cap-Eden-Roc (Antibes, France)",
          "Eden Rock - St Barths (Saint Barthélemy)",
          "Le Bristol Paris (France)"
        ]
      },
      "worlds50best2025": {
        "label": "World's 50 Best Hotels 2025",
        "url": "https://www.theworlds50best.com/hotels/",
        "items": [
          "Le Bristol Paris (France)"
        ]
      }
    },
    "vote": {
      "items": [
        "Le Bristol Paris (France)",
        "Hôtel du Cap-Eden-Roc (Antibes, France)",
        "Eden Rock - St Barths (Saint Barthélemy)",
        "The Lanesborough (London, United Kingdom)",
        "Jumby Bay Island (Antigua and Barbuda)",
        "Hotel La Palma (Capri, Italy)",
        "L'Apogée Courchevel (France)",
        "Château Saint-Martin & Spa (Vence, France)",
        "Brenners Park-Hotel & Spa (Baden-Baden, Germany)",
        "Palácio Tangará (São Paulo, Brazil)"
      ]
    }
  },
  {
    "id": "best-capella-hotels-world",
    "publishedDate": "2026-05-29",
    "publishedAt": "2026-05-29T22:29:00Z",
    "title": "Best Capella Hotels in the World",
    "category": "Travel",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Capella Bangkok (Thailand)": "https://www.google.com/maps/search/?api=1&query=Capella%20Bangkok%20Thailand",
      "Capella Sydney (Australia)": "https://www.google.com/maps/search/?api=1&query=Capella%20Sydney%20Australia",
      "Capella Singapore (Sentosa Island, Singapore)": "https://www.google.com/maps/search/?api=1&query=Capella%20Singapore%20Sentosa%20Island%20Singapore",
      "Capella Hanoi (Vietnam)": "https://www.google.com/maps/search/?api=1&query=Capella%20Hanoi%20Vietnam",
      "Capella Shanghai (China)": "https://www.google.com/maps/search/?api=1&query=Capella%20Shanghai%20China",
      "Capella Taipei (Taiwan)": "https://www.google.com/maps/search/?api=1&query=Capella%20Taipei%20Taiwan"
    },
    "blurb": "Capella Bangkok was crowned the world's best hotel in 2024. Across Asia-Pacific, the brand pairs design-forward rooms with intuitive service. These are its most acclaimed addresses.",
    "defaultSource": "ai",
    "itemLinks": {
      "Capella Bangkok (Thailand)": "https://capellahotels.com/en/capella-bangkok",
      "Capella Sydney (Australia)": "https://capellahotels.com/en/capella-sydney",
      "Capella Hanoi (Vietnam)": "https://capellahotels.com/en/capella-hanoi",
      "Capella Shanghai (China)": "https://capellahotels.com/en/capella-shanghai",
      "Capella Singapore (Sentosa Island, Singapore)": "https://capellahotels.com/en/capella-singapore",
      "Capella Taipei (Taiwan)": "https://capellahotels.com/en/capella-taipei"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Capella Bangkok (Thailand)",
          "Capella Sydney (Australia)",
          "Capella Hanoi (Vietnam)",
          "Capella Shanghai (China)",
          "Capella Singapore (Sentosa Island, Singapore)",
          "Capella Taipei (Taiwan)"
        ]
      },
      "worlds50best": {
        "label": "World's 50 Best Hotels 2024–2025",
        "url": "https://www.theworlds50best.com/hotels/",
        "items": [
          "Capella Bangkok (Thailand)",
          "Capella Sydney (Australia)",
          "Capella Singapore (Sentosa Island, Singapore)"
        ]
      },
      "onemileatatime": {
        "label": "One Mile at a Time 2026 · best-in-city standouts (unranked)",
        "unordered": true,
        "url": "https://onemileatatime.com/guides/capella-hotels-resorts/",
        "items": [
          "Capella Bangkok (Thailand)",
          "Capella Hanoi (Vietnam)",
          "Capella Shanghai (China)",
          "Capella Sydney (Australia)",
          "Capella Taipei (Taiwan)"
        ]
      }
    },
    "vote": {
      "items": [
        "Capella Bangkok (Thailand)",
        "Capella Sydney (Australia)",
        "Capella Hanoi (Vietnam)",
        "Capella Shanghai (China)",
        "Capella Singapore (Sentosa Island, Singapore)",
        "Capella Taipei (Taiwan)"
      ]
    }
  },
  {
    "id": "best-shangri-la-hotels-world",
    "publishedDate": "2026-05-29",
    "publishedAt": "2026-05-29T22:30:00Z",
    "title": "Best Shangri-La Hotels in the World",
    "category": "Travel",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Shangri-La Paris (France)": "https://www.google.com/maps/search/?api=1&query=Shangri-La%20Paris%20France",
      "Shangri-La The Shard (London, United Kingdom)": "https://www.google.com/maps/search/?api=1&query=Shangri-La%20The%20Shard%20London%20United%20Kingdom",
      "Shangri-La Bosphorus (Istanbul, Turkey)": "https://www.google.com/maps/search/?api=1&query=Shangri-La%20Bosphorus%20Istanbul%20Turkey",
      "Shangri-La Toronto (Canada)": "https://www.google.com/maps/search/?api=1&query=Shangri-La%20Toronto%20Canada",
      "Shangri-La Vancouver (Canada)": "https://www.google.com/maps/search/?api=1&query=Shangri-La%20Vancouver%20Canada",
      "Shangri-La's Fijian Resort (Yanuca Island, Fiji)": "https://www.google.com/maps/search/?api=1&query=Shangri-La%27s%20Fijian%20Resort%20Yanuca%20Island%20Fiji",
      "Shangri-La Chengdu (China)": "https://www.google.com/maps/search/?api=1&query=Shangri-La%20Chengdu%20China",
      "Shangri-La Surabaya (Indonesia)": "https://www.google.com/maps/search/?api=1&query=Shangri-La%20Surabaya%20Indonesia",
      "Island Shangri-La (Hong Kong, China)": "https://www.google.com/maps/search/?api=1&query=Island%20Shangri-La%20Hong%20Kong%20China",
      "Shangri-La Shenzhen (China)": "https://www.google.com/maps/search/?api=1&query=Shangri-La%20Shenzhen%20China",
      "Shangri-La Jinan (China)": "https://www.google.com/maps/search/?api=1&query=Shangri-La%20Jinan%20China",
      "Shangri-La Bangkok (Thailand)": "https://www.google.com/maps/search/?api=1&query=Shangri-La%20Bangkok%20Thailand",
      "Shangri-La Chiang Mai (Thailand)": "https://www.google.com/maps/search/?api=1&query=Shangri-La%20Chiang%20Mai%20Thailand",
      "Pudong Shangri-La (Shanghai, China)": "https://www.google.com/maps/search/?api=1&query=Pudong%20Shangri-La%20Shanghai%20China",
      "Shangri-La Kuala Lumpur (Malaysia)": "https://www.google.com/maps/search/?api=1&query=Shangri-La%20Kuala%20Lumpur%20Malaysia"
    },
    "blurb": "From a Paris rooftop framing the Eiffel Tower to a glass eyrie atop London's Shard, Shangri-La pairs Asian hospitality with landmark addresses. These are its most celebrated hotels.",
    "defaultSource": "ai",
    "itemLinks": {
      "Shangri-La Paris (France)": "https://www.shangri-la.com/paris/shangrila/",
      "Shangri-La The Shard (London, United Kingdom)": "https://www.shangri-la.com/london/shangrila/",
      "Shangri-La Toronto (Canada)": "https://www.shangri-la.com/toronto/shangrila/",
      "Shangri-La Bosphorus (Istanbul, Turkey)": "https://www.shangri-la.com/istanbul/shangrila/",
      "Shangri-La Vancouver (Canada)": "https://www.shangri-la.com/shangrila/city/vancouver/",
      "Island Shangri-La (Hong Kong, China)": "https://www.shangri-la.com/hongkong/islandshangrila/",
      "Shangri-La Bangkok (Thailand)": "https://www.shangri-la.com/bangkok/shangrila/",
      "Shangri-La's Fijian Resort (Yanuca Island, Fiji)": "https://www.shangri-la.com/yanucaisland/fijianresort/",
      "Shangri-La Chengdu (China)": "https://www.shangri-la.com/chengdu/shangrila/",
      "Shangri-La Chiang Mai (Thailand)": "https://www.shangri-la.com/chiangmai/shangrila/",
      "Shangri-La Surabaya (Indonesia)": "https://www.shangri-la.com/surabaya/shangrila/",
      "Shangri-La Shenzhen (China)": "https://www.shangri-la.com/shenzhen/shangrila/",
      "Shangri-La Jinan (China)": "https://www.shangri-la.com/jinan/shangrila/",
      "Pudong Shangri-La (Shanghai, China)": "https://www.shangri-la.com/shanghai/pudongshangrila/",
      "Shangri-La Kuala Lumpur (Malaysia)": "https://www.shangri-la.com/kualalumpur/shangrila/"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Shangri-La Paris (France)",
          "Shangri-La The Shard (London, United Kingdom)",
          "Shangri-La Toronto (Canada)",
          "Shangri-La Bosphorus (Istanbul, Turkey)",
          "Shangri-La Vancouver (Canada)",
          "Island Shangri-La (Hong Kong, China)",
          "Shangri-La Bangkok (Thailand)",
          "Shangri-La's Fijian Resort (Yanuca Island, Fiji)",
          "Shangri-La Chengdu (China)",
          "Shangri-La Chiang Mai (Thailand)"
        ]
      },
      "luxurytraveldiary": {
        "label": "Luxury Travel Diary 2023",
        "url": "https://www.luxurytraveldiary.com/2021/02/top-10-best-shangri-la-hotels-in-the-world/",
        "items": [
          "Shangri-La Paris (France)",
          "Shangri-La The Shard (London, United Kingdom)",
          "Shangri-La Bosphorus (Istanbul, Turkey)",
          "Shangri-La Toronto (Canada)",
          "Shangri-La Vancouver (Canada)",
          "Shangri-La's Fijian Resort (Yanuca Island, Fiji)",
          "Shangri-La Chengdu (China)",
          "Shangri-La Surabaya (Indonesia)",
          "Island Shangri-La (Hong Kong, China)",
          "Shangri-La Shenzhen (China)",
          "Shangri-La Jinan (China)"
        ]
      },
      "travelseason": {
        "label": "Travel Season 2026",
        "url": "https://travelseason.com/hotels/best-shangri-la-hotels/",
        "items": [
          "Shangri-La Paris (France)",
          "Shangri-La The Shard (London, United Kingdom)",
          "Shangri-La Bangkok (Thailand)",
          "Shangri-La Toronto (Canada)",
          "Island Shangri-La (Hong Kong, China)",
          "Shangri-La Bosphorus (Istanbul, Turkey)",
          "Shangri-La Vancouver (Canada)",
          "Shangri-La Chiang Mai (Thailand)",
          "Pudong Shangri-La (Shanghai, China)",
          "Shangri-La Kuala Lumpur (Malaysia)"
        ]
      }
    },
    "vote": {
      "items": [
        "Shangri-La Paris (France)",
        "Shangri-La The Shard (London, United Kingdom)",
        "Shangri-La Toronto (Canada)",
        "Shangri-La Bosphorus (Istanbul, Turkey)",
        "Shangri-La Vancouver (Canada)",
        "Island Shangri-La (Hong Kong, China)",
        "Shangri-La Bangkok (Thailand)",
        "Shangri-La's Fijian Resort (Yanuca Island, Fiji)",
        "Shangri-La Chengdu (China)",
        "Shangri-La Chiang Mai (Thailand)"
      ]
    }
  },
  {
    "id": "best-run-mcdonalds-manhattan",
    "publishedDate": "2026-05-29",
    "publishedAt": "2026-05-29T23:55:22Z",
    "title": "Best-Run McDonald's in Manhattan",
    "category": "New York",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores",
      "other"
    ],
    "linkType": "mapsCity",
    "mode": "scores",
    "blurb": "Manhattan has dozens of Golden Arches, and they are not equal. Every location ranked by a volume-weighted composite of its Google and Yelp ratings (May 2026). The 3rd Avenue spot near 58th runs cleanest.",
    "defaultSource": "ai",
    "links": {
      "966 3rd Ave (Midtown East)": "https://www.google.com/maps/search/?api=1&query=McDonald%27s%20966%203rd%20Ave%20New%20York",
      "1651 Broadway (Theater District)": "https://www.google.com/maps/search/?api=1&query=McDonald%27s%201651%20Broadway%20New%20York",
      "14 E 47th St (Midtown East)": "https://www.google.com/maps/search/?api=1&query=McDonald%27s%2014%20E%2047th%20St%20New%20York",
      "160 Broadway (Financial District)": "https://www.google.com/maps/search/?api=1&query=McDonald%27s%20160%20Broadway%20New%20York",
      "946 8th Ave (Hell's Kitchen)": "https://www.google.com/maps/search/?api=1&query=McDonald%27s%20946%208th%20Ave%20New%20York",
      "2049 Broadway (Upper West Side)": "https://www.google.com/maps/search/?api=1&query=McDonald%27s%202049%20Broadway%20New%20York",
      "1499 3rd Ave (Upper East Side)": "https://www.google.com/maps/search/?api=1&query=McDonald%27s%201499%203rd%20Ave%20New%20York",
      "490 8th Ave (Penn Station)": "https://www.google.com/maps/search/?api=1&query=McDonald%27s%20490%208th%20Ave%20New%20York",
      "18 E 42nd St (Midtown)": "https://www.google.com/maps/search/?api=1&query=McDonald%27s%2018%20E%2042nd%20St%20New%20York",
      "824 3rd Ave (Midtown East)": "https://www.google.com/maps/search/?api=1&query=McDonald%27s%20824%203rd%20Ave%20New%20York"
    },
    "scores": {
        "966 3rd Ave (Midtown East)": "7.7",
        "1651 Broadway (Theater District)": "7.5",
        "14 E 47th St (Midtown East)": "7.5",
        "160 Broadway (Financial District)": "7.5",
        "946 8th Ave (Hell's Kitchen)": "7.5",
        "2049 Broadway (Upper West Side)": "7.3",
        "1499 3rd Ave (Upper East Side)": "7.3",
        "490 8th Ave (Penn Station)": "7.2",
        "18 E 42nd St (Midtown)": "7.1",
        "824 3rd Ave (Midtown East)": "6.7"
      },
      "sources": {
      "ai": {
        "label": "Composite Score · Google + Yelp, volume-weighted (May 2026)",
        "items": [
          "966 3rd Ave (Midtown East)",
          "1651 Broadway (Theater District)",
          "14 E 47th St (Midtown East)",
          "160 Broadway (Financial District)",
          "946 8th Ave (Hell's Kitchen)",
          "2049 Broadway (Upper West Side)",
          "1499 3rd Ave (Upper East Side)",
          "490 8th Ave (Penn Station)",
          "18 E 42nd St (Midtown)",
          "824 3rd Ave (Midtown East)"
        ]
      },
      "google": {
        "label": "Google Maps Ratings (May 2026)",
        "url": "https://www.google.com/maps/search/McDonalds+Manhattan",
        "items": [
          "966 3rd Ave (Midtown East)",
          "160 Broadway (Financial District)",
          "1651 Broadway (Theater District)",
          "946 8th Ave (Hell's Kitchen)",
          "14 E 47th St (Midtown East)",
          "2049 Broadway (Upper West Side)",
          "1499 3rd Ave (Upper East Side)",
          "490 8th Ave (Penn Station)",
          "18 E 42nd St (Midtown)",
          "824 3rd Ave (Midtown East)"
        ]
      },
      "yelp": {
        "label": "Yelp Ratings (May 2026)",
        "url": "https://www.yelp.com/search?find_desc=McDonalds&find_loc=Manhattan%2C+NY",
        "items": [
          "160 Broadway (Financial District)",
          "966 3rd Ave (Midtown East)",
          "946 8th Ave (Hell's Kitchen)",
          "2049 Broadway (Upper West Side)",
          "1651 Broadway (Theater District)",
          "490 8th Ave (Penn Station)",
          "1499 3rd Ave (Upper East Side)",
          "824 3rd Ave (Midtown East)",
          "18 E 42nd St (Midtown)",
          "14 E 47th St (Midtown East)"
        ]
      }
    },
    "vote": {
      "items": [
        "966 3rd Ave (Midtown East)",
        "1651 Broadway (Theater District)",
        "14 E 47th St (Midtown East)",
        "160 Broadway (Financial District)",
        "946 8th Ave (Hell's Kitchen)",
        "2049 Broadway (Upper West Side)",
        "1499 3rd Ave (Upper East Side)",
        "490 8th Ave (Penn Station)",
        "18 E 42nd St (Midtown)",
        "824 3rd Ave (Midtown East)"
      ]
    }
  },
  {
    "id": "unique-time-saving-kitchen-gadgets",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T11:27:08Z",
    "title": "Most Unique Single-Purpose Kitchen Gadgets",
    "category": "Kitchen",
    "type": "product",
    "tags": [
      "product",
      "stores"
    ],
    "linkType": "amazon",
    "mode": "unranked",
    "blurb": "No consensus math here, just a handpicked set of clever, genuinely useful single-purpose gadgets that earn their drawer space. Unranked on purpose. Affiliate links may earn a commission.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Our handpicked set",
        "items": [
          "Thaw Claw Rapid Defrosting Weight",
          "Souper Cubes Freezer Portion Tray",
          "Dash Rapid Egg Cooker",
          "Automatic Hands-Free Pot Stirrer",
          "Herb Stripping Tool Leaf Stripper",
          "5-Blade Herb Scissors",
          "3-in-1 Avocado Slicer",
          "Corn Stripper Kernel Remover",
          "Strawberry Huller",
          "Onion Holder Slicing Fork",
          "Meat Shredder Claws",
          "Clip-On Silicone Pot Strainer",
          "Adjustable Rolling Pin with Thickness Rings",
          "Egg Yolk Separator Squeeze Bulb"
        ]
      }
    },
    "vote": {
      "items": [
        "Thaw Claw Rapid Defrosting Weight",
        "Souper Cubes Freezer Portion Tray",
        "Dash Rapid Egg Cooker",
        "Automatic Hands-Free Pot Stirrer",
        "Herb Stripping Tool Leaf Stripper",
        "5-Blade Herb Scissors",
        "3-in-1 Avocado Slicer",
        "Corn Stripper Kernel Remover",
        "Strawberry Huller",
        "Onion Holder Slicing Fork",
        "Meat Shredder Claws",
        "Clip-On Silicone Pot Strainer",
        "Adjustable Rolling Pin with Thickness Rings",
        "Egg Yolk Separator Squeeze Bulb"
      ]
    }
  },
  {
    "id": "best-wings-buffalo",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T04:03:06Z",
    "title": "Best Wings in Buffalo",
    "category": "Buffalo",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Bar-Bill Tavern (East Aurora)": "https://www.google.com/maps/search/?api=1&query=Bar-Bill%20Tavern%20East%20Aurora%20Buffalo%20NY",
      "Gabriel's Gate (Allentown)": "https://www.google.com/maps/search/?api=1&query=Gabriel%27s%20Gate%20Allentown%20Buffalo%20NY",
      "Nine-Eleven Tavern (South Buffalo)": "https://www.google.com/maps/search/?api=1&query=Nine-Eleven%20Tavern%20South%20Buffalo%20Buffalo%20NY",
      "Duff's Famous Wings (Amherst)": "https://www.google.com/maps/search/?api=1&query=Duff%27s%20Famous%20Wings%20Amherst%20Buffalo%20NY",
      "Elmo's Restaurant & Bar (Getzville)": "https://www.google.com/maps/search/?api=1&query=Elmo%27s%20Restaurant%20Bar%20Getzville%20Buffalo%20NY",
      "Adolf's Old First Ward Tavern (First Ward)": "https://www.google.com/maps/search/?api=1&query=Adolf%27s%20Old%20First%20Ward%20Tavern%20First%20Ward%20Buffalo%20NY",
      "Doc Sullivan's (South Buffalo)": "https://www.google.com/maps/search/?api=1&query=Doc%20Sullivan%27s%20South%20Buffalo%20Buffalo%20NY",
      "Gene McCarthy's (First Ward)": "https://www.google.com/maps/search/?api=1&query=Gene%20McCarthy%27s%20First%20Ward%20Buffalo%20NY",
      "Wingnutz Bar & Grill (Williamsville)": "https://www.google.com/maps/search/?api=1&query=Wingnutz%20Bar%20Grill%20Williamsville%20Buffalo%20NY",
      "Anchor Bar (Downtown)": "https://www.google.com/maps/search/?api=1&query=Anchor%20Bar%20Downtown%20Buffalo%20NY",
      "Mammoser's Tavern (Hamburg)": "https://www.google.com/maps/search/?api=1&query=Mammoser%27s%20Tavern%20Hamburg%20Buffalo%20NY",
      "Blackthorn Restaurant & Pub (South Buffalo)": "https://www.google.com/maps/search/?api=1&query=Blackthorn%20Restaurant%20Pub%20South%20Buffalo%20Buffalo%20NY",
      "Sportsmen's Tavern (Black Rock)": "https://www.google.com/maps/search/?api=1&query=Sportsmen%27s%20Tavern%20Black%20Rock%20Buffalo%20NY",
      "Glen Park Tavern (Williamsville)": "https://www.google.com/maps/search/?api=1&query=Glen%20Park%20Tavern%20Williamsville%20Buffalo%20NY",
      "Cole's (Elmwood Village)": "https://www.google.com/maps/search/?api=1&query=Cole%27s%20Elmwood%20Village%20Buffalo%20NY",
      "O'Neill's Stadium Inn (Orchard Park)": "https://www.google.com/maps/search/?api=1&query=O%27Neill%27s%20Stadium%20Inn%20Orchard%20Park%20Buffalo%20NY",
      "Kelly's Korner (North Buffalo)": "https://www.google.com/maps/search/?api=1&query=Kelly%27s%20Korner%20North%20Buffalo%20Buffalo%20NY",
      "La Nova (West Side)": "https://www.google.com/maps/search/?api=1&query=La%20Nova%20West%20Side%20Buffalo%20NY",
      "Mister Pizza (Elmwood Village)": "https://www.google.com/maps/search/?api=1&query=Mister%20Pizza%20Elmwood%20Village%20Buffalo%20NY"
    },
    "blurb": "The birthplace of the Buffalo wing, where arguing over the best plate is a civic duty. Drums, flats, and blue cheese, ranked by consensus.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Bar-Bill Tavern (East Aurora)",
          "Duff's Famous Wings (Amherst)",
          "Gabriel's Gate (Allentown)",
          "Anchor Bar (Downtown)",
          "Nine-Eleven Tavern (South Buffalo)",
          "Elmo's Restaurant & Bar (Getzville)",
          "Mammoser's Tavern (Hamburg)",
          "Doc Sullivan's (South Buffalo)",
          "Gene McCarthy's (First Ward)",
          "Blackthorn Restaurant & Pub (South Buffalo)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation Buffalo 2025",
        "url": "https://www.theinfatuation.com/buffalo/guides/best-chicken-wings-buffalo-ny",
        "items": [
          "Bar-Bill Tavern (East Aurora)",
          "Gabriel's Gate (Allentown)",
          "Nine-Eleven Tavern (South Buffalo)",
          "Duff's Famous Wings (Amherst)",
          "Elmo's Restaurant & Bar (Getzville)",
          "Adolf's Old First Ward Tavern (First Ward)",
          "Doc Sullivan's (South Buffalo)",
          "Gene McCarthy's (First Ward)",
          "Wingnutz Bar & Grill (Williamsville)"
        ]
      },
      "mantripping": {
        "label": "ManTripping · Best Wings in Buffalo 2025",
        "url": "https://www.mantripping.com/food-and-drink/where-to-get-the-best-wings-in-buffalo.html",
        "items": [
          "Anchor Bar (Downtown)",
          "Duff's Famous Wings (Amherst)",
          "Bar-Bill Tavern (East Aurora)",
          "Nine-Eleven Tavern (South Buffalo)",
          "Elmo's Restaurant & Bar (Getzville)",
          "Gabriel's Gate (Allentown)",
          "Doc Sullivan's (South Buffalo)",
          "Mammoser's Tavern (Hamburg)",
          "Blackthorn Restaurant & Pub (South Buffalo)",
          "Sportsmen's Tavern (Black Rock)"
        ]
      },
      "ubspectrum": {
        "label": "UB Spectrum Student Poll 2023",
        "url": "https://www.ubspectrum.com/article/2023/11/best-wings-in-buffalo-ub-students",
        "items": [
          "Duff's Famous Wings (Amherst)",
          "Bar-Bill Tavern (East Aurora)",
          "Anchor Bar (Downtown)",
          "Gabriel's Gate (Allentown)",
          "Elmo's Restaurant & Bar (Getzville)"
        ]
      },
      "visitbuffalo": {
        "label": "Visit Buffalo Niagara · Buffalo Wing Trail (unranked)",
        "url": "https://visitbuffalo.com/crawl/buffalo-wing-trail/",
        "items": [
          "Elmo's Restaurant & Bar (Getzville)",
          "Duff's Famous Wings (Amherst)",
          "Glen Park Tavern (Williamsville)",
          "Cole's (Elmwood Village)",
          "Anchor Bar (Downtown)",
          "Gabriel's Gate (Allentown)",
          "Gene McCarthy's (First Ward)",
          "Blackthorn Restaurant & Pub (South Buffalo)",
          "Doc Sullivan's (South Buffalo)",
          "Bar-Bill Tavern (East Aurora)",
          "Mammoser's Tavern (Hamburg)",
          "Nine-Eleven Tavern (South Buffalo)",
          "O'Neill's Stadium Inn (Orchard Park)",
          "Kelly's Korner (North Buffalo)"
        ],
        "unordered": true
      },
      "stepout": {
        "label": "Step Out Buffalo · Must-Visit Wings (unranked)",
        "url": "https://stepoutbuffalo.com/top-10-must-visit-places-for-chicken-wings/",
        "items": [
          "Anchor Bar (Downtown)",
          "Bar-Bill Tavern (East Aurora)",
          "Duff's Famous Wings (Amherst)",
          "Gabriel's Gate (Allentown)",
          "La Nova (West Side)",
          "Mammoser's Tavern (Hamburg)",
          "Mister Pizza (Elmwood Village)",
          "Nine-Eleven Tavern (South Buffalo)"
        ],
        "unordered": true
      }
    },
    "vote": {
      "items": [
        "Bar-Bill Tavern (East Aurora)",
        "Duff's Famous Wings (Amherst)",
        "Gabriel's Gate (Allentown)",
        "Anchor Bar (Downtown)",
        "Nine-Eleven Tavern (South Buffalo)",
        "Elmo's Restaurant & Bar (Getzville)",
        "Mammoser's Tavern (Hamburg)",
        "Doc Sullivan's (South Buffalo)",
        "Gene McCarthy's (First Ward)",
        "Blackthorn Restaurant & Pub (South Buffalo)"
      ]
    }
  },
  {
    "id": "best-wings-boston",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T04:03:13Z",
    "title": "Best Wings in Boston",
    "category": "Boston",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Buff's Pub (Newton)": "https://www.google.com/maps/search/?api=1&query=Buff%27s%20Pub%20Newton%20Boston%20MA",
      "Mahaniyom (Brookline)": "https://www.google.com/maps/search/?api=1&query=Mahaniyom%20Brookline%20Boston%20MA",
      "Fiya Chicken (Allston)": "https://www.google.com/maps/search/?api=1&query=Fiya%20Chicken%20Allston%20Boston%20MA",
      "Slade's Bar & Grill (Roxbury)": "https://www.google.com/maps/search/?api=1&query=Slade%27s%20Bar%20Grill%20Roxbury%20Boston%20MA",
      "Horse Thieves Tavern (Dedham)": "https://www.google.com/maps/search/?api=1&query=Horse%20Thieves%20Tavern%20Dedham%20Boston%20MA",
      "Monument Restaurant & Tavern (Charlestown)": "https://www.google.com/maps/search/?api=1&query=Monument%20Restaurant%20Tavern%20Charlestown%20Boston%20MA",
      "Grace by Nia (Seaport)": "https://www.google.com/maps/search/?api=1&query=Grace%20by%20Nia%20Seaport%20Boston%20MA",
      "Pantry Pizza & Kitchen (Dorchester)": "https://www.google.com/maps/search/?api=1&query=Pantry%20Pizza%20Kitchen%20Dorchester%20Boston%20MA",
      "Teddy's on the Hill (Beacon Hill)": "https://www.google.com/maps/search/?api=1&query=Teddy%27s%20on%20the%20Hill%20Beacon%20Hill%20Boston%20MA",
      "Bonchon (Allston)": "https://www.google.com/maps/search/?api=1&query=Bonchon%20Allston%20Boston%20MA",
      "Fat Cat (Quincy)": "https://www.google.com/maps/search/?api=1&query=Fat%20Cat%20Quincy%20Boston%20MA",
      "Mario's Pizzeria (Dorchester)": "https://www.google.com/maps/search/?api=1&query=Mario%27s%20Pizzeria%20Dorchester%20Boston%20MA",
      "Maxine's on Saint James (Roxbury)": "https://www.google.com/maps/search/?api=1&query=Maxine%27s%20on%20Saint%20James%20Roxbury%20Boston%20MA",
      "Scorpion Bar (Seaport)": "https://www.google.com/maps/search/?api=1&query=Scorpion%20Bar%20Seaport%20Boston%20MA",
      "Silvertone Bar & Grill (Downtown Crossing)": "https://www.google.com/maps/search/?api=1&query=Silvertone%20Bar%20Grill%20Downtown%20Crossing%20Boston%20MA",
      "Wingz and Tingz (Dorchester)": "https://www.google.com/maps/search/?api=1&query=Wingz%20and%20Tingz%20Dorchester%20Boston%20MA",
      "Woody's Grill & Tap (Fenway)": "https://www.google.com/maps/search/?api=1&query=Woody%27s%20Grill%20Tap%20Fenway%20Boston%20MA",
      "Firefly's BBQ (Marlborough)": "https://www.google.com/maps/search/?api=1&query=Firefly%27s%20BBQ%20Marlborough%20Boston%20MA",
      "The Smoke Shop BBQ (Kendall Square)": "https://www.google.com/maps/search/?api=1&query=The%20Smoke%20Shop%20BBQ%20Kendall%20Square%20Boston%20MA",
      "Lincoln Tavern (South Boston)": "https://www.google.com/maps/search/?api=1&query=Lincoln%20Tavern%20South%20Boston%20Boston%20MA",
      "Galway House (Jamaica Plain)": "https://www.google.com/maps/search/?api=1&query=Galway%20House%20Jamaica%20Plain%20Boston%20MA",
      "Coreanos (Allston)": "https://www.google.com/maps/search/?api=1&query=Coreanos%20Allston%20Boston%20MA",
      "The Longfellow Bar (Harvard Square)": "https://www.google.com/maps/search/?api=1&query=The%20Longfellow%20Bar%20Harvard%20Square%20Boston%20MA",
      "Picco (South End)": "https://www.google.com/maps/search/?api=1&query=Picco%20South%20End%20Boston%20MA",
      "Suya Joint (Roxbury)": "https://www.google.com/maps/search/?api=1&query=Suya%20Joint%20Roxbury%20Boston%20MA",
      "Shine Square Pub (Cambridge)": "https://www.google.com/maps/search/?api=1&query=Shine%20Square%20Pub%20Cambridge%20Boston%20MA"
    },
    "blurb": "From Newton dive-bar legends to Allston's Korean-fried newcomers, the wing plates Boston actually lines up for.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Buff's Pub (Newton)",
          "Mahaniyom (Brookline)",
          "Lincoln Tavern (South Boston)",
          "The Smoke Shop BBQ (Kendall Square)",
          "Fiya Chicken (Allston)",
          "Teddy's on the Hill (Beacon Hill)",
          "Slade's Bar & Grill (Roxbury)",
          "Horse Thieves Tavern (Dedham)",
          "Coreanos (Allston)",
          "Fat Cat (Quincy)"
        ]
      },
      "timeout": {
        "label": "Time Out Boston 2024",
        "url": "https://www.timeout.com/boston/restaurants/the-best-wings-in-boston",
        "items": [
          "Buff's Pub (Newton)",
          "Mahaniyom (Brookline)",
          "Fiya Chicken (Allston)",
          "Slade's Bar & Grill (Roxbury)",
          "Horse Thieves Tavern (Dedham)",
          "Monument Restaurant & Tavern (Charlestown)",
          "Grace by Nia (Seaport)",
          "Pantry Pizza & Kitchen (Dorchester)",
          "Teddy's on the Hill (Beacon Hill)",
          "Bonchon (Allston)"
        ]
      },
      "bostonmag": {
        "label": "Boston Magazine · Best Buffalo Wings (unranked)",
        "url": "https://www.bostonmagazine.com/restaurants/best-buffalo-wings-boston/",
        "items": [
          "Buff's Pub (Newton)",
          "Fat Cat (Quincy)",
          "Mario's Pizzeria (Dorchester)",
          "Maxine's on Saint James (Roxbury)",
          "Scorpion Bar (Seaport)",
          "Silvertone Bar & Grill (Downtown Crossing)",
          "Wingz and Tingz (Dorchester)",
          "Woody's Grill & Tap (Fenway)"
        ],
        "unordered": true
      },
      "bostoncom": {
        "label": "Boston.com Readers' Poll 2024 (unranked)",
        "url": "https://www.boston.com/community/readers-say/where-to-get-the-best-wings-in-greater-boston/",
        "items": [
          "Firefly's BBQ (Marlborough)",
          "Buff's Pub (Newton)",
          "The Smoke Shop BBQ (Kendall Square)",
          "Teddy's on the Hill (Beacon Hill)",
          "Lincoln Tavern (South Boston)",
          "Galway House (Jamaica Plain)"
        ],
        "unordered": true
      },
      "foodlens": {
        "label": "The Food Lens · Best Wings in Boston (unranked)",
        "url": "https://www.thefoodlens.com/boston/guides/best-chicken-wings-in-boston/",
        "items": [
          "The Smoke Shop BBQ (Kendall Square)",
          "Buff's Pub (Newton)",
          "Lincoln Tavern (South Boston)",
          "Coreanos (Allston)",
          "The Longfellow Bar (Harvard Square)",
          "Picco (South End)",
          "Mahaniyom (Brookline)",
          "Suya Joint (Roxbury)",
          "Shine Square Pub (Cambridge)"
        ],
        "unordered": true
      }
    },
    "vote": {
      "items": [
        "Buff's Pub (Newton)",
        "Mahaniyom (Brookline)",
        "Lincoln Tavern (South Boston)",
        "The Smoke Shop BBQ (Kendall Square)",
        "Fiya Chicken (Allston)",
        "Teddy's on the Hill (Beacon Hill)",
        "Slade's Bar & Grill (Roxbury)",
        "Horse Thieves Tavern (Dedham)",
        "Coreanos (Allston)",
        "Fat Cat (Quincy)"
      ]
    }
  },
  {
    "id": "best-wings-nyc",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T04:03:20Z",
    "title": "Best Wings in NYC",
    "category": "New York",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Old Town Bar (Flatiron)": "https://www.google.com/maps/search/?api=1&query=Old%20Town%20Bar%20Flatiron%20New%20York%20NY",
      "Croxley Ales (East Village)": "https://www.google.com/maps/search/?api=1&query=Croxley%20Ales%20East%20Village%20New%20York%20NY",
      "Distilled NY (Tribeca)": "https://www.google.com/maps/search/?api=1&query=Distilled%20NY%20Tribeca%20New%20York%20NY",
      "Pok Pok NY (Cobble Hill)": "https://www.google.com/maps/search/?api=1&query=Pok%20Pok%20NY%20Cobble%20Hill%20New%20York%20NY",
      "Blind Tiger Ale House (West Village)": "https://www.google.com/maps/search/?api=1&query=Blind%20Tiger%20Ale%20House%20West%20Village%20New%20York%20NY",
      "Dinosaur Bar-B-Que (Harlem)": "https://www.google.com/maps/search/?api=1&query=Dinosaur%20Bar-B-Que%20Harlem%20New%20York%20NY",
      "Pelicana Chicken (Koreatown)": "https://www.google.com/maps/search/?api=1&query=Pelicana%20Chicken%20Koreatown%20New%20York%20NY",
      "Madame Vo (East Village)": "https://www.google.com/maps/search/?api=1&query=Madame%20Vo%20East%20Village%20New%20York%20NY",
      "Dan and John's Wings (Murray Hill)": "https://www.google.com/maps/search/?api=1&query=Dan%20and%20John%27s%20Wings%20439%20Third%20Ave%20Murray%20Hill%20New%20York%20NY",
      "Namkeen (Williamsburg)": "https://www.google.com/maps/search/?api=1&query=Namkeen%20Williamsburg%20New%20York%20NY",
      "Little Dokebi (Greenpoint)": "https://www.google.com/maps/search/?api=1&query=Little%20Dokebi%20Greenpoint%20New%20York%20NY",
      "Bar Goto (Lower East Side)": "https://www.google.com/maps/search/?api=1&query=Bar%20Goto%20Lower%20East%20Side%20New%20York%20NY",
      "Mekelburg's (Clinton Hill)": "https://www.google.com/maps/search/?api=1&query=Mekelburg%27s%20Clinton%20Hill%20New%20York%20NY",
      "Bar Coastal (Upper East Side)": "https://www.google.com/maps/search/?api=1&query=Bar%20Coastal%20Upper%20East%20Side%20New%20York%20NY",
      "Bonnie's Grill (Park Slope)": "https://www.google.com/maps/search/?api=1&query=Bonnie%27s%20Grill%20Park%20Slope%20New%20York%20NY",
      "Amy Ruth's (Harlem)": "https://www.google.com/maps/search/?api=1&query=Amy%20Ruth%27s%20Harlem%20New%20York%20NY",
      "Blondies (Upper West Side)": "https://www.google.com/maps/search/?api=1&query=Blondies%20Upper%20West%20Side%20New%20York%20NY",
      "Lolo's Seafood Shack (Harlem)": "https://www.google.com/maps/search/?api=1&query=Lolo%27s%20Seafood%20Shack%20Harlem%20New%20York%20NY",
      "Berber Street Food (West Village)": "https://www.google.com/maps/search/?api=1&query=Berber%20Street%20Food%20West%20Village%20New%20York%20NY",
      "Jeju Noodle Bar (West Village)": "https://www.google.com/maps/search/?api=1&query=Jeju%20Noodle%20Bar%20West%20Village%20New%20York%20NY",
      "Blackbird's (Astoria)": "https://www.google.com/maps/search/?api=1&query=Blackbird%27s%20Astoria%20New%20York%20NY",
      "Blue Smoke (Gramercy)": "https://www.google.com/maps/search/?api=1&query=Blue%20Smoke%20Gramercy%20New%20York%20NY",
      "Little Mo (Bushwick)": "https://www.google.com/maps/search/?api=1&query=Little%20Mo%20Bushwick%20New%20York%20NY",
      "Hometown Barbecue (Red Hook)": "https://www.google.com/maps/search/?api=1&query=Hometown%20Barbecue%20Red%20Hook%20New%20York%20NY",
      "Wogies (West Village)": "https://www.google.com/maps/search/?api=1&query=Wogies%20West%20Village%20New%20York%20NY",
      "Mudville 9 (Tribeca)": "https://www.google.com/maps/search/?api=1&query=Mudville%209%20Tribeca%20New%20York%20NY",
      "Scruffy Duffy's (Hell's Kitchen)": "https://www.google.com/maps/search/?api=1&query=Scruffy%20Duffy%27s%20Hell%27s%20Kitchen%20New%20York%20NY",
      "Brooklyn Ice House (Red Hook)": "https://www.google.com/maps/search/?api=1&query=Brooklyn%20Ice%20House%20Red%20Hook%20New%20York%20NY",
      "Plug Uglies (Upper East Side)": "https://www.google.com/maps/search/?api=1&query=Plug%20Uglies%20Upper%20East%20Side%20New%20York%20NY",
      "Reservoir (Greenwich Village)": "https://www.google.com/maps/search/?api=1&query=Reservoir%20Greenwich%20Village%20New%20York%20NY",
      "Forest Hills Station House (Forest Hills)": "https://www.google.com/maps/search/?api=1&query=Forest%20Hills%20Station%20House%20Forest%20Hills%20New%20York%20NY",
      "Clara's (Bushwick)": "https://www.google.com/maps/search/?api=1&query=Clara%27s%20Bushwick%20New%20York%20NY",
      "The Kettle Black (Bay Ridge)": "https://www.google.com/maps/search/?api=1&query=The%20Kettle%20Black%20Bay%20Ridge%20New%20York%20NY",
      "Brooklyn Wing House (Crown Heights)": "https://www.google.com/maps/search/?api=1&query=Brooklyn%20Wing%20House%20Crown%20Heights%20New%20York%20NY",
      "Mission Chinese Food (Lower East Side)": "https://www.google.com/maps/search/?api=1&query=Mission%20Chinese%20Food%20Lower%20East%20Side%20New%20York%20NY",
      "Daddy-O (West Village)": "https://www.google.com/maps/search/?api=1&query=Daddy-O%20West%20Village%20New%20York%20NY",
      "Emily (Clinton Hill)": "https://www.google.com/maps/search/?api=1&query=Emily%20Clinton%20Hill%20New%20York%20NY",
      "Skinflints (Bay Ridge)": "https://www.google.com/maps/search/?api=1&query=Skinflints%20Bay%20Ridge%20New%20York%20NY",
      "Chick Chick (Upper West Side)": "https://www.google.com/maps/search/?api=1&query=Chick%20Chick%20Upper%20West%20Side%20New%20York%20NY",
      "Bodega 88 (Upper West Side)": "https://www.google.com/maps/search/?api=1&query=Bodega%2088%20Upper%20West%20Side%20New%20York%20NY",
      "Jasmine's Caribbean Cuisine (Hell's Kitchen)": "https://www.google.com/maps/search/?api=1&query=Jasmine%27s%20Caribbean%20Cuisine%20Hell%27s%20Kitchen%20New%20York%20NY",
      "Fish Cheeks (NoHo)": "https://www.google.com/maps/search/?api=1&query=Fish%20Cheeks%20NoHo%20New%20York%20NY",
      "Luther's at TV Eye (Ridgewood)": "https://www.google.com/maps/search/?api=1&query=Luther%27s%20at%20TV%20Eye%20Ridgewood%20New%20York%20NY",
      "Hometown Bar-B-Que (Red Hook)": "https://www.google.com/maps/search/?api=1&query=Hometown%20Bar-B-Que%20Red%20Hook%20New%20York%20NY"
    },
    "blurb": "Buffalo wings, Korean wings, dive-bar wings: the five boroughs' best plates, ranked across the city's food critics.",
    "defaultSource": "ai",
    "itemLinks": {
      "Blackbird's (Astoria)": "https://blackbirdsbar.com",
      "Dan and John's Wings (Murray Hill)": "https://danandjohns.com",
      "Bonnie's Grill (Park Slope)": "https://eatatbonnies.com",
      "Brooklyn Ice House (Red Hook)": "https://brooklynicehouse.shop",
      "Madame Vo (East Village)": "https://madamevo.com",
      "Plug Uglies (Upper East Side)": "https://plugugliesnyc.com",
      "Old Town Bar (Flatiron)": "https://oldtownbarnyc.com",
      "Wogies (West Village)": "https://wogies.com",
      "Mudville 9 (Tribeca)": "https://mudvilleny.com",
      "Reservoir (Greenwich Village)": "https://reservoirny.com",
      "Scruffy Duffy's (Hell's Kitchen)": "https://scruffyduffys.com",
      "Forest Hills Station House (Forest Hills)": "https://fhstationhouse.com",
      "Little Dokebi (Greenpoint)": "https://littledokebi.com",
      "Bar Goto (Lower East Side)": "https://bargoto.com",
      "Dinosaur Bar-B-Que (Harlem)": "https://dinosaurbarbque.com",
      "Chick Chick (Upper West Side)": "https://chickchicknyc.com",
      "Bodega 88 (Upper West Side)": "https://bodega88nyc.com",
      "Jasmine's Caribbean Cuisine (Hell's Kitchen)": "https://jasminecaribbeancuisine.com",
      "Fish Cheeks (NoHo)": "https://fishcheeksnyc.com",
      "Luther's at TV Eye (Ridgewood)": "https://tveyenyc.com",
      "Hometown Bar-B-Que (Red Hook)": "https://hometownbbq.com"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Blackbird's (Astoria)",
          "Dan and John's Wings (Murray Hill)",
          "Bonnie's Grill (Park Slope)",
          "Brooklyn Ice House (Red Hook)",
          "Madame Vo (East Village)",
          "Plug Uglies (Upper East Side)",
          "Old Town Bar (Flatiron)",
          "Blondies (Upper West Side)",
          "Pelicana Chicken (Koreatown)",
          "Wogies (West Village)"
        ]
      },
      "yelp": {
        "label": "Yelp \u00b7 Ranked by Rating (May 2026)",
        "url": "https://www.yelp.com/search?cflt=chicken_wings&find_loc=New+York%2C+NY&sortby=rating",
        "items": [
          "Brooklyn Ice House (Red Hook)",
          "Madame Vo (East Village)",
          "Blackbird's (Astoria)",
          "Plug Uglies (Upper East Side)",
          "Bonnie's Grill (Park Slope)",
          "Wogies (West Village)",
          "Pelicana Chicken (Koreatown)",
          "Blondies (Upper West Side)",
          "Old Town Bar (Flatiron)",
          "Mudville 9 (Tribeca)",
          "Reservoir (Greenwich Village)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation NYC 2025 \u00b7 Best Buffalo Wings (by score)",
        "url": "https://www.theinfatuation.com/new-york/guides/best-buffalo-wings-in-nyc",
        "items": [
          "Blackbird's (Astoria)",
          "Dan and John's Wings (Murray Hill)",
          "Bonnie's Grill (Park Slope)",
          "Old Town Bar (Flatiron)",
          "Mudville 9 (Tribeca)",
          "Blondies (Upper West Side)",
          "Scruffy Duffy's (Hell's Kitchen)",
          "Brooklyn Ice House (Red Hook)",
          "Plug Uglies (Upper East Side)",
          "Reservoir (Greenwich Village)",
          "Wogies (West Village)",
          "Forest Hills Station House (Forest Hills)",
          "Clara's (Bushwick)"
        ]
      },
      "secretnyc": {
        "label": "Secret NYC \u00b7 Best Chicken Wings 2023",
        "url": "https://secretnyc.co/best-chicken-wings-in-nyc/",
        "items": [
          "Pelicana Chicken (Koreatown)",
          "Madame Vo (East Village)",
          "Dan and John's Wings (Murray Hill)",
          "Namkeen (Williamsburg)",
          "Little Dokebi (Greenpoint)",
          "Bar Goto (Lower East Side)",
          "Dinosaur Bar-B-Que (Harlem)",
          "Mekelburg's (Clinton Hill)"
        ]
      },
      "eater": {
        "label": "Eater NY 2025 \u00b7 Where to Eat Wings in NYC (unranked)",
        "url": "https://ny.eater.com/maps/best-chicken-wings-nyc",
        "items": [
          "Chick Chick (Upper West Side)",
          "Bodega 88 (Upper West Side)",
          "Blondies (Upper West Side)",
          "Jasmine's Caribbean Cuisine (Hell's Kitchen)",
          "Dan and John's Wings (Murray Hill)",
          "Old Town Bar (Flatiron)",
          "Madame Vo (East Village)",
          "Fish Cheeks (NoHo)",
          "Bar Goto (Lower East Side)",
          "Luther's at TV Eye (Ridgewood)",
          "Hometown Bar-B-Que (Red Hook)",
          "Bonnie's Grill (Park Slope)"
        ],
        "unordered": true
      }
    },
    "vote": {
      "items": [
        "Blackbird's (Astoria)",
        "Dan and John's Wings (Murray Hill)",
        "Bonnie's Grill (Park Slope)",
        "Brooklyn Ice House (Red Hook)",
        "Madame Vo (East Village)",
        "Plug Uglies (Upper East Side)",
        "Old Town Bar (Flatiron)",
        "Blondies (Upper West Side)",
        "Pelicana Chicken (Koreatown)",
        "Wogies (West Village)"
      ]
    }
  },
  {
    "id": "best-wings-atlanta",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T04:03:27Z",
    "title": "Best Wings in Atlanta",
    "category": "Atlanta",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Delbar (Inman Park)": "https://www.google.com/maps/search/?api=1&query=Delbar%20Inman%20Park%20Atlanta%20GA",
      "B&L Wings (Midtown)": "https://www.google.com/maps/search/?api=1&query=B%20L%20Wings%20Midtown%20Atlanta%20GA",
      "Tom, Dick & Hank (College Park)": "https://www.google.com/maps/search/?api=1&query=Tom%20Dick%20Hank%20College%20Park%20Atlanta%20GA",
      "Wing Depot (Southwest Atlanta)": "https://www.google.com/maps/search/?api=1&query=Wing%20Depot%20Southwest%20Atlanta%20Atlanta%20GA",
      "Smokehouse ATL (Riverdale)": "https://www.google.com/maps/search/?api=1&query=Smokehouse%20ATL%20Riverdale%20Atlanta%20GA",
      "Pit Boss BBQ (Hapeville)": "https://www.google.com/maps/search/?api=1&query=Pit%20Boss%20BBQ%20Hapeville%20Atlanta%20GA",
      "Magic City (Downtown)": "https://www.google.com/maps/search/?api=1&query=Magic%20City%20Downtown%20Atlanta%20GA",
      "The Local (Poncey-Highland)": "https://www.google.com/maps/search/?api=1&query=The%20Local%20Poncey-Highland%20Atlanta%20GA",
      "The Bando (Westside)": "https://www.google.com/maps/search/?api=1&query=The%20Bando%20Westside%20Atlanta%20GA",
      "Das BBQ (Grant Park)": "https://www.google.com/maps/search/?api=1&query=Das%20BBQ%20Grant%20Park%20Atlanta%20GA",
      "Taco Pete (East Point)": "https://www.google.com/maps/search/?api=1&query=Taco%20Pete%20East%20Point%20Atlanta%20GA",
      "Hungry AF (College Park)": "https://www.google.com/maps/search/?api=1&query=Hungry%20AF%20College%20Park%20Atlanta%20GA",
      "American Deli (West End)": "https://www.google.com/maps/search/?api=1&query=American%20Deli%20West%20End%20Atlanta%20GA",
      "Clay's Sports Cafe (Sandy Springs)": "https://www.google.com/maps/search/?api=1&query=Clay%27s%20Sports%20Cafe%20Sandy%20Springs%20Atlanta%20GA",
      "J.R. Crickets (Midtown)": "https://www.google.com/maps/search/?api=1&query=J.R.%20Crickets%20Midtown%20Atlanta%20GA",
      "G Town Wings & Fish (Southwest Atlanta)": "https://www.google.com/maps/search/?api=1&query=G%20Town%20Wings%20Fish%20Southwest%20Atlanta%20Atlanta%20GA",
      "Wing Factory (Metro Atlanta)": "https://www.google.com/maps/search/?api=1&query=Wing%20Factory%20Metro%20Atlanta%20Atlanta%20GA",
      "International Cafe (Decatur)": "https://www.google.com/maps/search/?api=1&query=International%20Cafe%20Decatur%20Atlanta%20GA",
      "Tandoori Pizza & Wing Co. (Metro Atlanta)": "https://www.google.com/maps/search/?api=1&query=Tandoori%20Pizza%20Wing%20Co.%20Metro%20Atlanta%20Atlanta%20GA",
      "Sunnyside Pizzeria (Decatur)": "https://www.google.com/maps/search/?api=1&query=Sunnyside%20Pizzeria%20Decatur%20Atlanta%20GA",
      "Nam Phuong (Buford Highway)": "https://www.google.com/maps/search/?api=1&query=Nam%20Phuong%20Buford%20Highway%20Atlanta%20GA",
      "The Albert (Inman Park)": "https://www.google.com/maps/search/?api=1&query=The%20Albert%20Inman%20Park%20Atlanta%20GA",
      "Fox Bros. Bar-B-Q (Inman Park)": "https://www.google.com/maps/search/?api=1&query=Fox%20Bros.%20Bar-B-Q%20Inman%20Park%20Atlanta%20GA",
      "Heirloom Market BBQ (Smyrna)": "https://www.google.com/maps/search/?api=1&query=Heirloom%20Market%20BBQ%20Smyrna%20Atlanta%20GA",
      "LT's Wings (Southwest Atlanta)": "https://www.google.com/maps/search/?api=1&query=LT%27s%20Wings%20Southwest%20Atlanta%20Atlanta%20GA",
      "Wing Bar (East Atlanta Village)": "https://www.google.com/maps/search/?api=1&query=Wing%20Bar%20East%20Atlanta%20Village%20Atlanta%20GA",
      "Chase's Wingery (Norcross)": "https://www.google.com/maps/search/?api=1&query=Chase%27s%20Wingery%20Norcross%20Atlanta%20GA",
      "Atlanta's Best Wings (Southwest Atlanta)": "https://www.google.com/maps/search/?api=1&query=Atlanta%27s%20Best%20Wings%20Southwest%20Atlanta%20Atlanta%20GA",
      "StrikeOut Wingz (Downtown)": "https://www.google.com/maps/search/?api=1&query=StrikeOut%20Wingz%20Downtown%20Atlanta%20GA",
      "Firepit Pizza Tavern (Grant Park)": "https://www.google.com/maps/search/?api=1&query=Firepit%20Pizza%20Tavern%20Grant%20Park%20Atlanta%20GA",
      "Three Dollar Cafe (Metro Atlanta)": "https://www.google.com/maps/search/?api=1&query=Three%20Dollar%20Cafe%20Metro%20Atlanta%20Atlanta%20GA",
      "Wings 101 (Metro Atlanta)": "https://www.google.com/maps/search/?api=1&query=Wings%20101%20Metro%20Atlanta%20Atlanta%20GA",
      "DBA Barbeque (Virginia-Highland)": "https://www.google.com/maps/search/?api=1&query=DBA%20Barbeque%20Virginia-Highland%20Atlanta%20GA",
      "Taco Mac (Midtown)": "https://www.google.com/maps/search/?api=1&query=Taco%20Mac%20Midtown%20Atlanta%20GA",
      "The Sleepy Potato (Candler Road)": "https://www.google.com/maps/search/?api=1&query=The%20Sleepy%20Potato%20Candler%20Road%20Atlanta%20GA",
      "A Town Wings (Metro Atlanta)": "https://www.google.com/maps/search/?api=1&query=A%20Town%20Wings%20Metro%20Atlanta%20Atlanta%20GA",
      "Hudson Grille (Midtown)": "https://www.google.com/maps/search/?api=1&query=Hudson%20Grille%20Midtown%20Atlanta%20GA",
      "Torched Hop (Midtown)": "https://www.google.com/maps/search/?api=1&query=Torched%20Hop%20Midtown%20Atlanta%20GA"
    },
    "blurb": "Lemon pepper, dry rub, and saucy: the ATL wing canon, ranked across the city's critics and taste tests.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "The Local (Poncey-Highland)",
          "J.R. Crickets (Midtown)",
          "Magic City (Downtown)",
          "The Bando (Westside)",
          "Pit Boss BBQ (Hapeville)",
          "Nam Phuong (Buford Highway)",
          "Hungry AF (College Park)",
          "B&L Wings (Midtown)",
          "Three Dollar Cafe (Metro Atlanta)",
          "Delbar (Inman Park)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation Atlanta 2026 (by score)",
        "url": "https://www.theinfatuation.com/atlanta/guides/the-best-wings-in-atlanta",
        "items": [
          "Delbar (Inman Park)",
          "B&L Wings (Midtown)",
          "Tom, Dick & Hank (College Park)",
          "Wing Depot (Southwest Atlanta)",
          "Smokehouse ATL (Riverdale)",
          "Pit Boss BBQ (Hapeville)",
          "Magic City (Downtown)",
          "The Local (Poncey-Highland)",
          "The Bando (Westside)",
          "Das BBQ (Grant Park)",
          "Taco Pete (East Point)",
          "Hungry AF (College Park)",
          "American Deli (West End)",
          "Clay's Sports Cafe (Sandy Springs)",
          "J.R. Crickets (Midtown)"
        ]
      },
      "ajc": {
        "label": "Atlanta Journal-Constitution Taste Test 2026",
        "url": "https://www.ajc.com/food-and-dining/2026/03/if-youre-looking-for-atlantas-best-lemon-pepper-wings-weve-found-them/",
        "items": [
          "J.R. Crickets (Midtown)",
          "G Town Wings & Fish (Southwest Atlanta)",
          "Wing Factory (Metro Atlanta)",
          "International Cafe (Decatur)",
          "Magic City (Downtown)",
          "Hungry AF (College Park)",
          "Tandoori Pizza & Wing Co. (Metro Atlanta)",
          "Sunnyside Pizzeria (Decatur)"
        ]
      },
      "creativeloafing": {
        "label": "Creative Loafing · Wing Smackdown (scored)",
        "url": "https://creativeloafing.com/content-266191-the-ultimate-wing-smackdown",
        "items": [
          "Nam Phuong (Buford Highway)",
          "The Local (Poncey-Highland)",
          "J.R. Crickets (Midtown)",
          "Pit Boss BBQ (Hapeville)",
          "Magic City (Downtown)",
          "The Albert (Inman Park)",
          "Fox Bros. Bar-B-Q (Inman Park)",
          "Heirloom Market BBQ (Smyrna)",
          "LT's Wings (Southwest Atlanta)",
          "Wing Bar (East Atlanta Village)",
          "Chase's Wingery (Norcross)",
          "Atlanta's Best Wings (Southwest Atlanta)"
        ]
      },
      "islands": {
        "label": "Islands · 5 Best Wing Spots by Reviews 2026",
        "url": "https://www.islands.com/2138026/hands-down-5-best-wing-spots-atlanta-georgia-reviews/",
        "items": [
          "Hungry AF (College Park)",
          "The Local (Poncey-Highland)",
          "StrikeOut Wingz (Downtown)",
          "Magic City (Downtown)",
          "The Bando (Westside)"
        ]
      },
      "atlantaeats": {
        "label": "Atlanta Eats · Wings Roundup (unranked)",
        "url": "https://www.atlantaeats.com/restaurants/wings/where-to-find-mouthwatering-wings-in-atlanta/",
        "items": [
          "B&L Wings (Midtown)",
          "The Bando (Westside)",
          "Clay's Sports Cafe (Sandy Springs)",
          "Firepit Pizza Tavern (Grant Park)",
          "Fox Bros. Bar-B-Q (Inman Park)",
          "J.R. Crickets (Midtown)",
          "The Local (Poncey-Highland)",
          "Magic City (Downtown)",
          "Nam Phuong (Buford Highway)",
          "Pit Boss BBQ (Hapeville)",
          "Three Dollar Cafe (Metro Atlanta)",
          "Wings 101 (Metro Atlanta)"
        ],
        "unordered": true
      },
      "secretatlanta": {
        "label": "Secret Atlanta · Best Lemon Pepper Wings (reader poll)",
        "url": "https://secretatlanta.co/best-lemon-pepper-wings-atlanta/",
        "items": [
          "J.R. Crickets (Midtown)",
          "DBA Barbeque (Virginia-Highland)",
          "Taco Mac (Midtown)",
          "The Local (Poncey-Highland)",
          "The Sleepy Potato (Candler Road)",
          "Three Dollar Cafe (Metro Atlanta)",
          "A Town Wings (Metro Atlanta)",
          "The Bando (Westside)",
          "Hudson Grille (Midtown)",
          "Torched Hop (Midtown)",
          "American Deli (West End)"
        ],
        "unordered": true
      }
    },
    "vote": {
      "items": [
        "The Local (Poncey-Highland)",
        "J.R. Crickets (Midtown)",
        "Magic City (Downtown)",
        "The Bando (Westside)",
        "Pit Boss BBQ (Hapeville)",
        "Nam Phuong (Buford Highway)",
        "Hungry AF (College Park)",
        "B&L Wings (Midtown)",
        "Three Dollar Cafe (Metro Atlanta)",
        "Delbar (Inman Park)"
      ]
    }
  },
  {
    "id": "best-wings-miami",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T04:03:34Z",
    "title": "Best Wings in Miami",
    "category": "Miami",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Tâm Tâm (Downtown)": "https://www.google.com/maps/search/?api=1&query=T%C3%A2m%20T%C3%A2m%20Downtown%20Miami%20FL",
      "Soi Thai Street Food (Sweetwater)": "https://www.google.com/maps/search/?api=1&query=Soi%20Thai%20Street%20Food%20Sweetwater%20Miami%20FL",
      "Shadow Wagyu (Coral Gables)": "https://www.google.com/maps/search/?api=1&query=Shadow%20Wagyu%20Coral%20Gables%20Miami%20FL",
      "Korean Kitchen (North Miami Beach)": "https://www.google.com/maps/search/?api=1&query=Korean%20Kitchen%20North%20Miami%20Beach%20Miami%20FL",
      "Hometown Barbecue (Allapattah)": "https://www.google.com/maps/search/?api=1&query=Hometown%20Barbecue%20Allapattah%20Miami%20FL",
      "Slab Daddy BBQ (Allapattah)": "https://www.google.com/maps/search/?api=1&query=Slab%20Daddy%20BBQ%20Allapattah%20Miami%20FL",
      "No Seasons (Little River)": "https://www.google.com/maps/search/?api=1&query=No%20Seasons%20Little%20River%20Miami%20FL",
      "Apocalypse BBQ (Kendall)": "https://www.google.com/maps/search/?api=1&query=Apocalypse%20BBQ%20Kendall%20Miami%20FL",
      "Fatboy's Wings & Tings (North Miami Beach)": "https://www.google.com/maps/search/?api=1&query=Fatboy%27s%20Wings%20Tings%20North%20Miami%20Beach%20Miami%20FL",
      "House of Wings (Overtown)": "https://www.google.com/maps/search/?api=1&query=House%20of%20Wings%20Overtown%20Miami%20FL",
      "Taste of R Cuisine (Edgewater)": "https://www.google.com/maps/search/?api=1&query=Taste%20of%20R%20Cuisine%20Edgewater%20Miami%20FL",
      "Urban Rrasoi (Kendall)": "https://www.google.com/maps/search/?api=1&query=Urban%20Rrasoi%20Kendall%20Miami%20FL",
      "World Famous House of Mac (Allapattah)": "https://www.google.com/maps/search/?api=1&query=World%20Famous%20House%20of%20Mac%20Allapattah%20Miami%20FL",
      "Sports Grill (South Miami)": "https://www.google.com/maps/search/?api=1&query=Sports%20Grill%20South%20Miami%20Miami%20FL",
      "Keg South (Pinecrest)": "https://www.google.com/maps/search/?api=1&query=Keg%20South%20Pinecrest%20Miami%20FL",
      "Hole in the Wall (Palmetto Bay)": "https://www.google.com/maps/search/?api=1&query=Hole%20in%20the%20Wall%20Palmetto%20Bay%20Miami%20FL",
      "Old Tom's Sports Bar (Miami Springs)": "https://www.google.com/maps/search/?api=1&query=Old%20Tom%27s%20Sports%20Bar%20Miami%20Springs%20Miami%20FL",
      "Bryson's Irish Pub (Virginia Gardens)": "https://www.google.com/maps/search/?api=1&query=Bryson%27s%20Irish%20Pub%20Virginia%20Gardens%20Miami%20FL",
      "Anthony's Coal Fired Pizza & Wings (Metro Miami)": "https://www.google.com/maps/search/?api=1&query=Anthony%27s%20Coal%20Fired%20Pizza%20Wings%20Metro%20Miami%20Miami%20FL",
      "Flanigan's (Metro Miami)": "https://www.google.com/maps/search/?api=1&query=Flanigan%27s%20Metro%20Miami%20Miami%20FL",
      "Titanic Brewery & Restaurant (Coral Gables)": "https://www.google.com/maps/search/?api=1&query=Titanic%20Brewery%20Restaurant%20Coral%20Gables%20Miami%20FL"
    },
    "blurb": "Vietnamese fish-sauce wings to backyard barbecue: Miami's most-praised plates across the local food press.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "House of Wings (Overtown)",
          "Sports Grill (South Miami)",
          "Keg South (Pinecrest)",
          "Taste of R Cuisine (Edgewater)",
          "Tâm Tâm (Downtown)",
          "Hole in the Wall (Palmetto Bay)",
          "Soi Thai Street Food (Sweetwater)",
          "Urban Rrasoi (Kendall)",
          "Apocalypse BBQ (Kendall)",
          "Shadow Wagyu (Coral Gables)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation Miami 2026 (by score)",
        "url": "https://www.theinfatuation.com/miami/guides/best-chicken-wings-miami",
        "items": [
          "Tâm Tâm (Downtown)",
          "Soi Thai Street Food (Sweetwater)",
          "Shadow Wagyu (Coral Gables)",
          "Korean Kitchen (North Miami Beach)",
          "Hometown Barbecue (Allapattah)",
          "Slab Daddy BBQ (Allapattah)",
          "No Seasons (Little River)",
          "Apocalypse BBQ (Kendall)",
          "Fatboy's Wings & Tings (North Miami Beach)",
          "House of Wings (Overtown)"
        ]
      },
      "stacker": {
        "label": "Stacker · Highest-Rated Wings by Diners 2025",
        "url": "https://stacker.com/stories/florida/miami/highest-rated-restaurants-chicken-wings-miami-according-yelp",
        "items": [
          "Taste of R Cuisine (Edgewater)",
          "Urban Rrasoi (Kendall)",
          "House of Wings (Overtown)",
          "World Famous House of Mac (Allapattah)",
          "Sports Grill (South Miami)",
          "Keg South (Pinecrest)",
          "Hole in the Wall (Palmetto Bay)",
          "Old Tom's Sports Bar (Miami Springs)",
          "Bryson's Irish Pub (Virginia Gardens)"
        ]
      },
      "miaminewtimes": {
        "label": "Miami New Times · 10 Best Wings (unranked)",
        "url": "https://www.miaminewtimes.com/food-drink/best-chicken-wings-in-miami-florida-21033751/",
        "items": [
          "Anthony's Coal Fired Pizza & Wings (Metro Miami)",
          "Apocalypse BBQ (Kendall)",
          "Bryson's Irish Pub (Virginia Gardens)",
          "Fatboy's Wings & Tings (North Miami Beach)",
          "Flanigan's (Metro Miami)",
          "Hole in the Wall (Palmetto Bay)",
          "House of Wings (Overtown)",
          "Keg South (Pinecrest)",
          "Sports Grill (South Miami)",
          "Titanic Brewery & Restaurant (Coral Gables)"
        ],
        "unordered": true
      }
    },
    "vote": {
      "items": [
        "House of Wings (Overtown)",
        "Sports Grill (South Miami)",
        "Keg South (Pinecrest)",
        "Taste of R Cuisine (Edgewater)",
        "Tâm Tâm (Downtown)",
        "Hole in the Wall (Palmetto Bay)",
        "Soi Thai Street Food (Sweetwater)",
        "Urban Rrasoi (Kendall)",
        "Apocalypse BBQ (Kendall)",
        "Shadow Wagyu (Coral Gables)"
      ]
    }
  },
  {
    "id": "best-wings-austin",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T04:03:41Z",
    "title": "Best Wings in Austin",
    "category": "Austin",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Măm Măm (East Austin)": "https://www.google.com/maps/search/?api=1&query=M%C4%83m%20M%C4%83m%20East%20Austin%20Austin%20TX",
      "Lao'd Bar (East Austin)": "https://www.google.com/maps/search/?api=1&query=Lao%27d%20Bar%20East%20Austin%20Austin%20TX",
      "Sazan (Highland)": "https://www.google.com/maps/search/?api=1&query=Sazan%20Highland%20Austin%20TX",
      "The Marylander (East Austin)": "https://www.google.com/maps/search/?api=1&query=The%20Marylander%20East%20Austin%20Austin%20TX",
      "Hold Out Brewing (Clarksville)": "https://www.google.com/maps/search/?api=1&query=Hold%20Out%20Brewing%20Clarksville%20Austin%20TX",
      "Tommy Want Wingy (South Lamar)": "https://www.google.com/maps/search/?api=1&query=Tommy%20Want%20Wingy%20South%20Lamar%20Austin%20TX",
      "Wingzup (Hancock)": "https://www.google.com/maps/search/?api=1&query=Wingzup%20Hancock%20Austin%20TX",
      "The Potluck (South Austin)": "https://www.google.com/maps/search/?api=1&query=The%20Potluck%20South%20Austin%20Austin%20TX",
      "Delray Cafe (East Austin)": "https://www.google.com/maps/search/?api=1&query=Delray%20Cafe%20East%20Austin%20Austin%20TX",
      "The Cavalier (East Austin)": "https://www.google.com/maps/search/?api=1&query=The%20Cavalier%20East%20Austin%20Austin%20TX",
      "The Tavern (Downtown)": "https://www.google.com/maps/search/?api=1&query=The%20Tavern%20Downtown%20Austin%20TX",
      "Stiles Switch BBQ & Brew (Brentwood)": "https://www.google.com/maps/search/?api=1&query=Stiles%20Switch%20BBQ%20Brew%20Brentwood%20Austin%20TX",
      "Cover 3 (Northwest Austin)": "https://www.google.com/maps/search/?api=1&query=Cover%203%20Northwest%20Austin%20Austin%20TX",
      "Loro (South Lamar)": "https://www.google.com/maps/search/?api=1&query=Loro%20South%20Lamar%20Austin%20TX",
      "Roots Chicken Shak (Mueller)": "https://www.google.com/maps/search/?api=1&query=Roots%20Chicken%20Shak%20Mueller%20Austin%20TX",
      "Black Sheep Lodge (South Lamar)": "https://www.google.com/maps/search/?api=1&query=Black%20Sheep%20Lodge%20South%20Lamar%20Austin%20TX",
      "Pluckers Wing Bar (Metro Austin)": "https://www.google.com/maps/search/?api=1&query=Pluckers%20Wing%20Bar%20Metro%20Austin%20Austin%20TX",
      "CM Smokehouse (East Cesar Chavez)": "https://www.google.com/maps/search/?api=1&query=CM%20Smokehouse%20East%20Cesar%20Chavez%20Austin%20TX",
      "Spicy Boys Fried Chicken (St. Elmo)": "https://www.google.com/maps/search/?api=1&query=Spicy%20Boys%20Fried%20Chicken%20St.%20Elmo%20Austin%20TX",
      "Hi Wings (Allandale)": "https://www.google.com/maps/search/?api=1&query=Hi%20Wings%20Allandale%20Austin%20TX",
      "Komè (Highland)": "https://www.google.com/maps/search/?api=1&query=Kom%C3%A8%20Highland%20Austin%20TX",
      "Le Bleu (Northwest Austin)": "https://www.google.com/maps/search/?api=1&query=Le%20Bleu%20Northwest%20Austin%20Austin%20TX",
      "Arpeggio Grill (North Austin)": "https://www.google.com/maps/search/?api=1&query=Arpeggio%20Grill%20North%20Austin%20Austin%20TX",
      "The Jackalope (Downtown)": "https://www.google.com/maps/search/?api=1&query=The%20Jackalope%20Downtown%20Austin%20TX",
      "Chi'Lantro (Metro Austin)": "https://www.google.com/maps/search/?api=1&query=Chi%27Lantro%20Metro%20Austin%20Austin%20TX",
      "Green Mesquite (Zilker)": "https://www.google.com/maps/search/?api=1&query=Green%20Mesquite%20Zilker%20Austin%20TX",
      "Wing Toss (Downtown)": "https://www.google.com/maps/search/?api=1&query=Wing%20Toss%20Downtown%20Austin%20TX",
      "Wings 'N More (North Austin)": "https://www.google.com/maps/search/?api=1&query=Wings%20%27N%20More%20North%20Austin%20Austin%20TX",
      "Buffalo Wild Wings (South Austin)": "https://www.google.com/maps/search/?api=1&query=Buffalo%20Wild%20Wings%20South%20Austin%20Austin%20TX",
      "The G Spot Wangs And Thangs (East Austin)": "https://www.google.com/maps/search/?api=1&query=The%20G%20Spot%20Wangs%20And%20Thangs%20East%20Austin%20Austin%20TX"
    },
    "blurb": "Vietnamese, Lao, and classic bar wings: the spots that top Austin's wing rankings.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Tommy Want Wingy (South Lamar)",
          "Wingzup (Hancock)",
          "Pluckers Wing Bar (Metro Austin)",
          "Delray Cafe (East Austin)",
          "Hi Wings (Allandale)",
          "Lao'd Bar (East Austin)",
          "Sazan (Highland)",
          "The Tavern (Downtown)",
          "Black Sheep Lodge (South Lamar)",
          "CM Smokehouse (East Cesar Chavez)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation Austin 2026 (by score)",
        "url": "https://www.theinfatuation.com/austin/guides/best-chicken-wings-austin",
        "items": [
          "Măm Măm (East Austin)",
          "Lao'd Bar (East Austin)",
          "Sazan (Highland)",
          "The Marylander (East Austin)",
          "Hold Out Brewing (Clarksville)",
          "Tommy Want Wingy (South Lamar)",
          "Wingzup (Hancock)",
          "The Potluck (South Austin)",
          "Delray Cafe (East Austin)",
          "The Cavalier (East Austin)",
          "The Tavern (Downtown)",
          "Stiles Switch BBQ & Brew (Brentwood)"
        ]
      },
      "austinfood": {
        "label": "Austin Food Magazine 2025 (unranked)",
        "url": "https://austinfoodmagazine.com/best-chicken-wings-austin/",
        "items": [
          "Stiles Switch BBQ & Brew (Brentwood)",
          "Tommy Want Wingy (South Lamar)",
          "Cover 3 (Northwest Austin)",
          "Wingzup (Hancock)",
          "Loro (South Lamar)",
          "Roots Chicken Shak (Mueller)",
          "The Cavalier (East Austin)",
          "Lao'd Bar (East Austin)",
          "Black Sheep Lodge (South Lamar)",
          "Delray Cafe (East Austin)",
          "Sazan (Highland)",
          "Pluckers Wing Bar (Metro Austin)",
          "CM Smokehouse (East Cesar Chavez)"
        ],
        "unordered": true
      },
      "austinot": {
        "label": "The Austinot · Best Wings 2026 (unranked)",
        "url": "https://austinot.com/best-wings-in-austin",
        "items": [
          "Tommy Want Wingy (South Lamar)",
          "Delray Cafe (East Austin)",
          "Spicy Boys Fried Chicken (St. Elmo)",
          "Hi Wings (Allandale)",
          "Pluckers Wing Bar (Metro Austin)",
          "Wingzup (Hancock)",
          "The Tavern (Downtown)"
        ],
        "unordered": true
      },
      "do512": {
        "label": "Do512 · Best Chicken Wings in Austin (unranked)",
        "url": "https://do512.com/p/wings-in-austin",
        "items": [
          "Tommy Want Wingy (South Lamar)",
          "CM Smokehouse (East Cesar Chavez)",
          "Wingzup (Hancock)",
          "Hi Wings (Allandale)",
          "Komè (Highland)",
          "Delray Cafe (East Austin)",
          "The Tavern (Downtown)",
          "Le Bleu (Northwest Austin)",
          "Black Sheep Lodge (South Lamar)",
          "Arpeggio Grill (North Austin)",
          "The Jackalope (Downtown)",
          "Pluckers Wing Bar (Metro Austin)",
          "Chi'Lantro (Metro Austin)",
          "Green Mesquite (Zilker)"
        ],
        "unordered": true
      },
      "austinstaysweird": {
        "label": "Austin Stays Weird · Best Chicken Wings (unranked)",
        "url": "https://austinstaysweird.com/best-chicken-wings-in-austin",
        "items": [
          "Wing Toss (Downtown)",
          "Tommy Want Wingy (South Lamar)",
          "Wings 'N More (North Austin)",
          "Hi Wings (Allandale)",
          "Pluckers Wing Bar (Metro Austin)",
          "Wingzup (Hancock)",
          "Buffalo Wild Wings (South Austin)",
          "The G Spot Wangs And Thangs (East Austin)"
        ],
        "unordered": true
      }
    },
    "vote": {
      "items": [
        "Tommy Want Wingy (South Lamar)",
        "Wingzup (Hancock)",
        "Pluckers Wing Bar (Metro Austin)",
        "Delray Cafe (East Austin)",
        "Hi Wings (Allandale)",
        "Lao'd Bar (East Austin)",
        "Sazan (Highland)",
        "The Tavern (Downtown)",
        "Black Sheep Lodge (South Lamar)",
        "CM Smokehouse (East Cesar Chavez)"
      ]
    }
  },
  {
    "id": "best-wings-chicago",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T04:03:48Z",
    "title": "Best Wings in Chicago",
    "category": "Chicago",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Great Sea (Albany Park)": "https://www.google.com/maps/search/?api=1&query=Great%20Sea%20Albany%20Park%20Chicago%20IL",
      "Mott St. (West Town)": "https://www.google.com/maps/search/?api=1&query=Mott%20St.%20West%20Town%20Chicago%20IL",
      "Cleo's Southern Cuisine (Bronzeville)": "https://www.google.com/maps/search/?api=1&query=Cleo%27s%20Southern%20Cuisine%20Bronzeville%20Chicago%20IL",
      "Crisp (Lakeview)": "https://www.google.com/maps/search/?api=1&query=Crisp%20Lakeview%20Chicago%20IL",
      "The Fifty/50 (Wicker Park)": "https://www.google.com/maps/search/?api=1&query=The%20Fifty%2F50%20Wicker%20Park%20Chicago%20IL",
      "Dak (Edgewater)": "https://www.google.com/maps/search/?api=1&query=Dak%20Edgewater%20Chicago%20IL",
      "Landbirds (Logan Square)": "https://www.google.com/maps/search/?api=1&query=Landbirds%20Logan%20Square%20Chicago%20IL",
      "HaiSous (Pilsen)": "https://www.google.com/maps/search/?api=1&query=HaiSous%20Pilsen%20Chicago%20IL",
      "Jake Melnick's Corner Tap (River North)": "https://www.google.com/maps/search/?api=1&query=Jake%20Melnick%27s%20Corner%20Tap%20River%20North%20Chicago%20IL",
      "Ms. T's Southern Fried Chicken (Lakeview)": "https://www.google.com/maps/search/?api=1&query=Ms.%20T%27s%20Southern%20Fried%20Chicken%20Lakeview%20Chicago%20IL",
      "Bronzeville Wings (Bronzeville)": "https://www.google.com/maps/search/?api=1&query=Bronzeville%20Wings%20Bronzeville%20Chicago%20IL",
      "Soulé (West Town)": "https://www.google.com/maps/search/?api=1&query=Soul%C3%A9%20West%20Town%20Chicago%20IL",
      "Mini Mott (Logan Square)": "https://www.google.com/maps/search/?api=1&query=Mini%20Mott%20Logan%20Square%20Chicago%20IL",
      "Output (West Town)": "https://www.google.com/maps/search/?api=1&query=Output%20West%20Town%20Chicago%20IL",
      "Chicago Wings Around the World (The Loop)": "https://www.google.com/maps/search/?api=1&query=Chicago%20Wings%20Around%20the%20World%20The%20Loop%20Chicago%20IL",
      "We're Winging It (Wicker Park)": "https://www.google.com/maps/search/?api=1&query=We%27re%20Winging%20It%20Wicker%20Park%20Chicago%20IL",
      "Uncle Remus (Austin)": "https://www.google.com/maps/search/?api=1&query=Uncle%20Remus%20Austin%20Chicago%20IL",
      "Chicago Pickle Eatery (Avondale)": "https://www.google.com/maps/search/?api=1&query=Chicago%20Pickle%20Eatery%20Avondale%20Chicago%20IL",
      "EaThai (Avondale)": "https://www.google.com/maps/search/?api=1&query=EaThai%20Avondale%20Chicago%20IL",
      "MiMi's Craft Kitchen (Little Italy)": "https://www.google.com/maps/search/?api=1&query=MiMi%27s%20Craft%20Kitchen%20Little%20Italy%20Chicago%20IL",
      "Hangry's (Belmont Cragin)": "https://www.google.com/maps/search/?api=1&query=Hangry%27s%20Belmont%20Cragin%20Chicago%20IL",
      "Autea Sweets & Eats (Chinatown)": "https://www.google.com/maps/search/?api=1&query=Autea%20Sweets%20Eats%20Chinatown%20Chicago%20IL",
      "Flame On Peri Peri Grill (Niles)": "https://www.google.com/maps/search/?api=1&query=Flame%20On%20Peri%20Peri%20Grill%20Niles%20Chicago%20IL",
      "The Warbler (Lincoln Square)": "https://www.google.com/maps/search/?api=1&query=The%20Warbler%20Lincoln%20Square%20Chicago%20IL",
      "Tsaocaa (Niles)": "https://www.google.com/maps/search/?api=1&query=Tsaocaa%20Niles%20Chicago%20IL",
      "Bobijoa (Pilsen)": "https://www.google.com/maps/search/?api=1&query=Bobijoa%20Pilsen%20Chicago%20IL",
      "Shorty's (Wicker Park)": "https://www.google.com/maps/search/?api=1&query=Shorty%27s%20Wicker%20Park%20Chicago%20IL",
      "Diego (West Town)": "https://www.google.com/maps/search/?api=1&query=Diego%20West%20Town%20Chicago%20IL",
      "Zaab E Lee (Albany Park)": "https://www.google.com/maps/search/?api=1&query=Zaab%20E%20Lee%20Albany%20Park%20Chicago%20IL",
      "Oiistar (Wicker Park)": "https://www.google.com/maps/search/?api=1&query=Oiistar%20Wicker%20Park%20Chicago%20IL",
      "Harold's Chicken Shack (South Loop)": "https://www.google.com/maps/search/?api=1&query=Harold%27s%20Chicken%20Shack%20South%20Loop%20Chicago%20IL",
      "Broken Barrel Bar (Lincoln Park)": "https://www.google.com/maps/search/?api=1&query=Broken%20Barrel%20Bar%20Lincoln%20Park%20Chicago%20IL",
      "B-Square Pizza (Wheeling)": "https://www.google.com/maps/search/?api=1&query=B-Square%20Pizza%20Wheeling%20Chicago%20IL",
      "RJ Grunts (Lincoln Park)": "https://www.google.com/maps/search/?api=1&query=RJ%20Grunts%20Lincoln%20Park%20Chicago%20IL",
      "Offshore (Streeterville)": "https://www.google.com/maps/search/?api=1&query=Offshore%20Streeterville%20Chicago%20IL",
      "Bird's Nest (Lincoln Park)": "https://www.google.com/maps/search/?api=1&query=Bird%27s%20Nest%20Lincoln%20Park%20Chicago%20IL",
      "The Rambler Kitchen & Tap (North Center)": "https://www.google.com/maps/search/?api=1&query=The%20Rambler%20Kitchen%20Tap%20North%20Center%20Chicago%20IL",
      "Mr. Brown's Lounge (Ukrainian Village)": "https://www.google.com/maps/search/?api=1&query=Mr.%20Brown%27s%20Lounge%20Ukrainian%20Village%20Chicago%20IL",
      "Surf's Up (South Shore)": "https://www.google.com/maps/search/?api=1&query=Surf%27s%20Up%20South%20Shore%20Chicago%20IL",
      "The Aberdeen Tap (Fulton Market)": "https://www.google.com/maps/search/?api=1&query=The%20Aberdeen%20Tap%20Fulton%20Market%20Chicago%20IL",
      "The Barn (West Loop)": "https://www.google.com/maps/search/?api=1&query=The%20Barn%20West%20Loop%20Chicago%20IL",
      "Mullen's Sports Bar (Rogers Park)": "https://www.google.com/maps/search/?api=1&query=Mullen%27s%20Sports%20Bar%20Rogers%20Park%20Chicago%20IL",
      "Brehon Pub (River North)": "https://www.google.com/maps/search/?api=1&query=Brehon%20Pub%20River%20North%20Chicago%20IL",
      "Reggies (South Loop)": "https://www.google.com/maps/search/?api=1&query=Reggies%20South%20Loop%20Chicago%20IL",
      "Dante's (Logan Square)": "https://www.google.com/maps/search/?api=1&query=Dante%27s%20Logan%20Square%20Chicago%20IL",
      "Wild Goose (Lincoln Square)": "https://www.google.com/maps/search/?api=1&query=Wild%20Goose%20Lincoln%20Square%20Chicago%20IL",
      "Buffalo Wings & Rings (Bridgeport)": "https://www.google.com/maps/search/?api=1&query=Buffalo%20Wings%20Rings%20Bridgeport%20Chicago%20IL",
      "Peach's (Bronzeville)": "https://www.google.com/maps/search/?api=1&query=Peach%27s%20Bronzeville%20Chicago%20IL",
      "Bonchon (West Town)": "https://www.google.com/maps/search/?api=1&query=Bonchon%20West%20Town%20Chicago%20IL",
      "Woodie's Flat (Old Town)": "https://www.google.com/maps/search/?api=1&query=Woodie%27s%20Flat%20Old%20Town%20Chicago%20IL"
    },
    "blurb": "Crispy, saucy, and globe-spanning: Chicago's most-acclaimed wings, ranked across the city's critics.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Crisp (Lakeview)",
          "The Fifty/50 (Wicker Park)",
          "Cleo's Southern Cuisine (Bronzeville)",
          "Jake Melnick's Corner Tap (River North)",
          "Output (West Town)",
          "Great Sea (Albany Park)",
          "Dak (Edgewater)",
          "Uncle Remus (Austin)",
          "Bird's Nest (Lincoln Park)",
          "Chicago Pickle Eatery (Avondale)"
        ]
      },
      "timeout": {
        "label": "Time Out Chicago",
        "url": "https://www.timeout.com/chicago/restaurants/best-chicken-wings-in-chicago",
        "items": [
          "Great Sea (Albany Park)",
          "Mott St. (West Town)",
          "Cleo's Southern Cuisine (Bronzeville)",
          "Crisp (Lakeview)",
          "The Fifty/50 (Wicker Park)",
          "Dak (Edgewater)",
          "Landbirds (Logan Square)",
          "HaiSous (Pilsen)",
          "Jake Melnick's Corner Tap (River North)",
          "Ms. T's Southern Fried Chicken (Lakeview)",
          "Bronzeville Wings (Bronzeville)",
          "Soulé (West Town)",
          "Mini Mott (Logan Square)",
          "Output (West Town)",
          "Chicago Wings Around the World (The Loop)",
          "We're Winging It (Wicker Park)",
          "Uncle Remus (Austin)"
        ]
      },
      "chicagomag": {
        "label": "Chicago Magazine · Ruby's Top 3",
        "url": "https://www.chicagomag.com/Chicago-Magazine/January-2017/Chicken-Wings/",
        "items": [
          "Dak (Edgewater)",
          "The Fifty/50 (Wicker Park)",
          "Crisp (Lakeview)"
        ]
      },
      "stacker": {
        "label": "Stacker · Highest-Rated Wings by Diners 2025",
        "url": "https://stacker.com/stories/illinois/chicago/highest-rated-chicken-wings-chicago-diners",
        "items": [
          "Chicago Pickle Eatery (Avondale)",
          "EaThai (Avondale)",
          "MiMi's Craft Kitchen (Little Italy)",
          "Hangry's (Belmont Cragin)",
          "Autea Sweets & Eats (Chinatown)",
          "Flame On Peri Peri Grill (Niles)",
          "The Warbler (Lincoln Square)",
          "Tsaocaa (Niles)",
          "Bobijoa (Pilsen)",
          "Crisp (Lakeview)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation Chicago 2026 (unranked)",
        "url": "https://www.theinfatuation.com/chicago/guides/best-chicken-wings-chicago",
        "items": [
          "Shorty's (Wicker Park)",
          "Diego (West Town)",
          "Zaab E Lee (Albany Park)",
          "Output (West Town)",
          "Crisp (Lakeview)",
          "Great Sea (Albany Park)",
          "Cleo's Southern Cuisine (Bronzeville)",
          "Jake Melnick's Corner Tap (River North)",
          "Soulé (West Town)",
          "Uncle Remus (Austin)",
          "Oiistar (Wicker Park)",
          "Harold's Chicken Shack (South Loop)"
        ],
        "unordered": true
      },
      "urbanmatter": {
        "label": "UrbanMatter · Best Chicken Wings (unranked)",
        "url": "https://urbanmatter.com/chicago/8-best-chicken-wings-chicago/",
        "items": [
          "Broken Barrel Bar (Lincoln Park)",
          "B-Square Pizza (Wheeling)",
          "RJ Grunts (Lincoln Park)",
          "Offshore (Streeterville)",
          "Bird's Nest (Lincoln Park)",
          "The Rambler Kitchen & Tap (North Center)",
          "Jake Melnick's Corner Tap (River North)",
          "Output (West Town)",
          "Chicago Wings Around the World (The Loop)",
          "The Fifty/50 (Wicker Park)",
          "Mr. Brown's Lounge (Ukrainian Village)",
          "Crisp (Lakeview)",
          "Surf's Up (South Shore)"
        ],
        "unordered": true
      },
      "do312": {
        "label": "Do312 · Best Chicken Wings (unranked)",
        "url": "https://do312.com/p/the-best-chicken-wings-in-chicago",
        "items": [
          "Output (West Town)",
          "The Aberdeen Tap (Fulton Market)",
          "The Barn (West Loop)",
          "Mullen's Sports Bar (Rogers Park)",
          "Brehon Pub (River North)",
          "The Fifty/50 (Wicker Park)",
          "Reggies (South Loop)",
          "Jake Melnick's Corner Tap (River North)",
          "Dante's (Logan Square)",
          "Wild Goose (Lincoln Square)",
          "Crisp (Lakeview)",
          "Buffalo Wings & Rings (Bridgeport)",
          "Bird's Nest (Lincoln Park)",
          "Uncle Remus (Austin)",
          "Peach's (Bronzeville)",
          "Bonchon (West Town)",
          "Woodie's Flat (Old Town)",
          "Cleo's Southern Cuisine (Bronzeville)"
        ],
        "unordered": true
      }
    },
    "vote": {
      "items": [
        "Crisp (Lakeview)",
        "The Fifty/50 (Wicker Park)",
        "Cleo's Southern Cuisine (Bronzeville)",
        "Jake Melnick's Corner Tap (River North)",
        "Output (West Town)",
        "Great Sea (Albany Park)",
        "Dak (Edgewater)",
        "Uncle Remus (Austin)",
        "Bird's Nest (Lincoln Park)",
        "Chicago Pickle Eatery (Avondale)"
      ]
    }
  },
  {
    "id": "best-italian-restaurants-boston",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T04:12:27Z",
    "title": "Best Italian Restaurants in Boston",
    "category": "Boston",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Bricco (North End)": "https://www.google.com/maps/search/?api=1&query=Bricco%20North%20End%20Boston%20MA",
      "Geppetto (Cambridge)": "https://www.google.com/maps/search/?api=1&query=Geppetto%20Cambridge%20Boston%20MA",
      "Capri Italian Steakhouse (South End)": "https://www.google.com/maps/search/?api=1&query=Capri%20Italian%20Steakhouse%20South%20End%20Boston%20MA",
      "Giulia (Cambridge)": "https://www.google.com/maps/search/?api=1&query=Giulia%20Cambridge%20Boston%20MA",
      "Quattro (North End)": "https://www.google.com/maps/search/?api=1&query=Quattro%20North%20End%20Boston%20MA",
      "Pammy's (Cambridge)": "https://www.google.com/maps/search/?api=1&query=Pammy%27s%20Cambridge%20Boston%20MA",
      "Fox & the Knife (South Boston)": "https://www.google.com/maps/search/?api=1&query=Fox%20the%20Knife%20South%20Boston%20Boston%20MA",
      "SRV (South End)": "https://www.google.com/maps/search/?api=1&query=SRV%20South%20End%20Boston%20MA",
      "Bar Volpe (South Boston)": "https://www.google.com/maps/search/?api=1&query=Bar%20Volpe%20South%20Boston%20Boston%20MA",
      "Prezza (North End)": "https://www.google.com/maps/search/?api=1&query=Prezza%20North%20End%20Boston%20MA",
      "Aqua Pazza (North End)": "https://www.google.com/maps/search/?api=1&query=Aqua%20Pazza%20North%20End%20Boston%20MA",
      "Contessa (Back Bay)": "https://www.google.com/maps/search/?api=1&query=Contessa%20Back%20Bay%20Boston%20MA",
      "La Padrona (Back Bay)": "https://www.google.com/maps/search/?api=1&query=La%20Padrona%20Back%20Bay%20Boston%20MA",
      "Coppa (South End)": "https://www.google.com/maps/search/?api=1&query=Coppa%20South%20End%20Boston%20MA",
      "Via Cannuccia (Dorchester)": "https://www.google.com/maps/search/?api=1&query=Via%20Cannuccia%20Dorchester%20Boston%20MA",
      "Prima (Charlestown)": "https://www.google.com/maps/search/?api=1&query=Prima%20Charlestown%20Boston%20MA",
      "Tony & Elaine's (North End)": "https://www.google.com/maps/search/?api=1&query=Tony%20Elaine%27s%20North%20End%20Boston%20MA",
      "Little Sage (South End)": "https://www.google.com/maps/search/?api=1&query=Little%20Sage%20South%20End%20Boston%20MA",
      "The Red Fox (North End)": "https://www.google.com/maps/search/?api=1&query=The%20Red%20Fox%20North%20End%20Boston%20MA",
      "Petula's (South Boston)": "https://www.google.com/maps/search/?api=1&query=Petula%27s%20South%20Boston%20Boston%20MA",
      "Rino's Place (East Boston)": "https://www.google.com/maps/search/?api=1&query=Rino%27s%20Place%20East%20Boston%20Boston%20MA",
      "Delfino (Roslindale)": "https://www.google.com/maps/search/?api=1&query=Delfino%20Roslindale%20Boston%20MA",
      "Table (North End)": "https://www.google.com/maps/search/?api=1&query=Table%20North%20End%20Boston%20MA",
      "Tonino (Jamaica Plain)": "https://www.google.com/maps/search/?api=1&query=Tonino%20Jamaica%20Plain%20Boston%20MA",
      "Trattoria Il Panino (North End)": "https://www.google.com/maps/search/?api=1&query=Trattoria%20Il%20Panino%20North%20End%20Boston%20MA",
      "Carmelina's (North End)": "https://www.google.com/maps/search/?api=1&query=Carmelina%27s%20North%20End%20Boston%20MA",
      "Carlo's Cucina Italiana (Allston)": "https://www.google.com/maps/search/?api=1&query=Carlo%27s%20Cucina%20Italiana%20Allston%20Boston%20MA",
      "MIDA (South End)": "https://www.google.com/maps/search/?api=1&query=MIDA%20South%20End%20Boston%20MA",
      "Bar Mezzana (South End)": "https://www.google.com/maps/search/?api=1&query=Bar%20Mezzana%20South%20End%20Boston%20MA",
      "La Famiglia Giorgio's (North End)": "https://www.google.com/maps/search/?api=1&query=La%20Famiglia%20Giorgio%27s%20North%20End%20Boston%20MA",
      "La Morra (Brookline Village)": "https://www.google.com/maps/search/?api=1&query=La%20Morra%20Brookline%20Village%20Boston%20MA",
      "Sorellina (Back Bay)": "https://www.google.com/maps/search/?api=1&query=Sorellina%20Back%20Bay%20Boston%20MA",
      "Tavolo (Dorchester)": "https://www.google.com/maps/search/?api=1&query=Tavolo%20Dorchester%20Boston%20MA",
      "Arya Trattoria (North End)": "https://www.google.com/maps/search/?api=1&query=Arya%20Trattoria%20North%20End%20Boston%20MA",
      "The Daily Catch (North End)": "https://www.google.com/maps/search/?api=1&query=The%20Daily%20Catch%20North%20End%20Boston%20MA",
      "Giacomo's (North End)": "https://www.google.com/maps/search/?api=1&query=Giacomo%27s%20North%20End%20Boston%20MA",
      "Lucca (North End)": "https://www.google.com/maps/search/?api=1&query=Lucca%20North%20End%20Boston%20MA",
      "Lucia Ristorante (North End)": "https://www.google.com/maps/search/?api=1&query=Lucia%20Ristorante%20North%20End%20Boston%20MA",
      "Mamma Maria (North End)": "https://www.google.com/maps/search/?api=1&query=Mamma%20Maria%20North%20End%20Boston%20MA",
      "Parla (North End)": "https://www.google.com/maps/search/?api=1&query=Parla%20North%20End%20Boston%20MA",
      "Strega (North End)": "https://www.google.com/maps/search/?api=1&query=Strega%20North%20End%20Boston%20MA"
    },
    "blurb": "From North End red-sauce institutions to South End tasting menus and Cambridge trattorias, the Italian tables Boston critics keep returning to.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Tonino (Jamaica Plain)",
          "SRV (South End)",
          "Carmelina's (North End)",
          "Giulia (Cambridge)",
          "Mamma Maria (North End)",
          "Coppa (South End)",
          "Pammy's (Cambridge)",
          "Rino's Place (East Boston)",
          "Prezza (North End)",
          "Delfino (Roslindale)"
        ]
      },
      "timeout": {
        "label": "Time Out Boston 2025",
        "url": "https://www.timeout.com/boston/restaurants/best-italian-restaurants-in-boston",
        "items": [
          "Bricco (North End)",
          "Geppetto (Cambridge)",
          "Capri Italian Steakhouse (South End)",
          "Giulia (Cambridge)",
          "Quattro (North End)",
          "Pammy's (Cambridge)",
          "Fox & the Knife (South Boston)",
          "SRV (South End)",
          "Bar Volpe (South Boston)",
          "Prezza (North End)",
          "Aqua Pazza (North End)",
          "Contessa (Back Bay)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation Boston · Best Italian 2026 (by 0–10 score)",
        "url": "https://www.theinfatuation.com/boston/guides/bostons-best-italian-restaurants",
        "items": [
          "Giulia (Cambridge)",
          "Fox & the Knife (South Boston)",
          "SRV (South End)",
          "Prima (Charlestown)",
          "Table (North End)",
          "Trattoria Il Panino (North End)",
          "Little Sage (South End)",
          "Geppetto (Cambridge)",
          "La Padrona (Back Bay)",
          "The Red Fox (North End)",
          "Petula's (South Boston)",
          "Rino's Place (East Boston)",
          "Coppa (South End)",
          "Delfino (Roslindale)",
          "Tony & Elaine's (North End)",
          "Tonino (Jamaica Plain)",
          "Via Cannuccia (Dorchester)"
        ]
      },
      "globe": {
        "label": "Boston Globe Magazine · Best of the Best 2025 (unranked)",
        "url": "https://www.bostonglobe.com/2025/07/09/magazine/best-italian-food-greater-boston/",
        "items": [
          "Carmelina's (North End)",
          "Carlo's Cucina Italiana (Allston)",
          "Coppa (South End)",
          "Delfino (Roslindale)",
          "Giulia (Cambridge)",
          "La Padrona (Back Bay)",
          "MIDA (South End)",
          "Pammy's (Cambridge)",
          "SRV (South End)",
          "Tonino (Jamaica Plain)"
        ],
        "unordered": true
      },
      "bostonmag": {
        "label": "Boston Magazine · Best Italian Restaurants (unranked)",
        "url": "https://www.bostonmagazine.com/restaurants/best-italian-restaurants-boston/",
        "items": [
          "Bar Mezzana (South End)",
          "Carlo's Cucina Italiana (Allston)",
          "Contessa (Back Bay)",
          "Coppa (South End)",
          "Delfino (Roslindale)",
          "Geppetto (Cambridge)",
          "La Famiglia Giorgio's (North End)",
          "Fox & the Knife (South Boston)",
          "Giulia (Cambridge)",
          "La Morra (Brookline Village)",
          "MIDA (South End)",
          "Pammy's (Cambridge)",
          "Prezza (North End)",
          "Rino's Place (East Boston)",
          "Sorellina (Back Bay)",
          "SRV (South End)",
          "Tavolo (Dorchester)"
        ],
        "unordered": true
      },
      "bostonmagne": {
        "label": "Boston Magazine · Best North End Restaurants (unranked)",
        "url": "https://www.bostonmagazine.com/restaurants/best-north-end-restaurants/",
        "items": [
          "Arya Trattoria (North End)",
          "Bricco (North End)",
          "Carmelina's (North End)",
          "The Daily Catch (North End)",
          "La Famiglia Giorgio's (North End)",
          "Giacomo's (North End)",
          "Lucca (North End)",
          "Lucia Ristorante (North End)",
          "Mamma Maria (North End)",
          "Parla (North End)",
          "Prezza (North End)",
          "The Red Fox (North End)",
          "Strega (North End)",
          "Table (North End)",
          "Tony & Elaine's (North End)"
        ],
        "unordered": true
      },
      "yelp": {
        "label": "Yelp · Ranked by Rating (May 2026)",
        "url": "https://www.yelp.com/search?find_desc=italian&find_loc=Boston%2C%20MA",
        "items": [
          "Tonino (Jamaica Plain)",
          "Carmelina's (North End)",
          "SRV (South End)",
          "Giulia (Cambridge)",
          "Mamma Maria (North End)",
          "Fox & the Knife (South Boston)",
          "Pammy's (Cambridge)",
          "Geppetto (Cambridge)",
          "Prezza (North End)",
          "Delfino (Roslindale)",
          "Bricco (North End)",
          "Coppa (South End)"
        ]
      },
      "googlereviews": {
        "label": "Google Reviews · Ranked by Rating (May 2026)",
        "url": "https://www.google.com/maps/search/best+italian+restaurants+boston",
        "items": [
          "Mamma Maria (North End)",
          "Giulia (Cambridge)",
          "Delfino (Roslindale)",
          "Tonino (Jamaica Plain)",
          "Carmelina's (North End)",
          "Rino's Place (East Boston)",
          "SRV (South End)",
          "Pammy's (Cambridge)",
          "Prezza (North End)",
          "Fox & the Knife (South Boston)",
          "Bricco (North End)",
          "Coppa (South End)",
          "Bar Mezzana (South End)",
          "Prima (Charlestown)",
          "Geppetto (Cambridge)",
          "La Padrona (Back Bay)"
        ]
      }
    },
    "vote": {
      "items": [
        "Tonino (Jamaica Plain)",
        "SRV (South End)",
        "Carmelina's (North End)",
        "Giulia (Cambridge)",
        "Mamma Maria (North End)",
        "Coppa (South End)",
        "Pammy's (Cambridge)",
        "Rino's Place (East Boston)",
        "Prezza (North End)",
        "Delfino (Roslindale)"
      ]
    }
  },
  {
    "id": "savannah-dive-bars",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T11:21:55Z",
    "title": "Best Dive Bars in Savannah",
    "category": "Savannah",
    "type": "food",
    "tags": [
      "bars",
      "nightlife",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "The Original Pinkie Masters (Historic District)": "https://www.google.com/maps/search/?api=1&query=The%20Original%20Pinkie%20Masters%20Historic%20District%20Savannah%20GA",
      "Abe's on Lincoln (Historic District)": "https://www.google.com/maps/search/?api=1&query=Abe%27s%20on%20Lincoln%20Historic%20District%20Savannah%20GA",
      "Totally Awesome Bar (Historic District)": "https://www.google.com/maps/search/?api=1&query=Totally%20Awesome%20Bar%20Historic%20District%20Savannah%20GA",
      "McDonough's (Historic District)": "https://www.google.com/maps/search/?api=1&query=McDonough%27s%20Historic%20District%20Savannah%20GA",
      "American Legion Post 135 (Historic District)": "https://www.google.com/maps/search/?api=1&query=American%20Legion%20Post%20135%20Historic%20District%20Savannah%20GA",
      "Portal Arcade, Cafe & Bar (Historic District)": "https://www.google.com/maps/search/?api=1&query=Portal%20Arcade%20Cafe%20Bar%20Historic%20District%20Savannah%20GA",
      "Bay Street Blues (Historic District)": "https://www.google.com/maps/search/?api=1&query=Bay%20Street%20Blues%20Historic%20District%20Savannah%20GA",
      "O'Connell's Irish Pub (Historic District)": "https://www.google.com/maps/search/?api=1&query=O%27Connell%27s%20Irish%20Pub%20Historic%20District%20Savannah%20GA",
      "The Rail Pub (Historic District)": "https://www.google.com/maps/search/?api=1&query=The%20Rail%20Pub%20Historic%20District%20Savannah%20GA",
      "The Wormhole (Starland District)": "https://www.google.com/maps/search/?api=1&query=The%20Wormhole%20Starland%20District%20Savannah%20GA"
    },
    "blurb": "Pinkie's, Abe's, the Rail: Savannah's well-worn watering holes, by consensus across local guides.",
    "defaultSource": "ai",
    "itemLinks": {
      "The Original Pinkie Masters (Historic District)": "https://theoriginalpinkies.com",
      "The Rail Pub (Historic District)": "https://therailpub.com",
      "Portal Arcade, Cafe & Bar (Historic District)": "https://savannahsarcade.com",
      "Bay Street Blues (Historic District)": "https://savannahjams.com",
      "The Wormhole (Starland District)": "https://wormholebar.com",
      "McDonough's (Historic District)": "https://mcdonoughslounge.com"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "The Original Pinkie Masters (Historic District)",
          "Abe's on Lincoln (Historic District)",
          "O'Connell's Irish Pub (Historic District)",
          "American Legion Post 135 (Historic District)",
          "The Rail Pub (Historic District)",
          "Portal Arcade, Cafe & Bar (Historic District)",
          "Bay Street Blues (Historic District)",
          "Totally Awesome Bar (Historic District)",
          "The Wormhole (Starland District)",
          "McDonough's (Historic District)"
        ]
      },
      "narcity": {
        "label": "Narcity · Best Dive Bars in Downtown Savannah 2022 (unranked)",
        "url": "https://www.narcity.com/savannah/the-best-dive-bars-in-savannah-according-to-a-bartender-who-grew-up-there",
        "items": [
          "The Original Pinkie Masters (Historic District)",
          "Abe's on Lincoln (Historic District)",
          "Totally Awesome Bar (Historic District)",
          "McDonough's (Historic District)",
          "American Legion Post 135 (Historic District)",
          "Portal Arcade, Cafe & Bar (Historic District)"
        ],
        "unordered": true
      },
      "eatitlikeit": {
        "label": "Eat It & Like It · Savannah Dive Bar Guide (unranked)",
        "url": "https://eatitandlikeit.com/category/drink-it-and-like-it/dive-bar-guide/",
        "items": [
          "American Legion Post 135 (Historic District)",
          "Abe's on Lincoln (Historic District)",
          "Bay Street Blues (Historic District)",
          "The Original Pinkie Masters (Historic District)",
          "O'Connell's Irish Pub (Historic District)",
          "The Rail Pub (Historic District)",
          "The Wormhole (Starland District)"
        ],
        "unordered": true
      },
      "yelp": {
        "label": "Yelp · Ranked by Rating (May 2026)",
        "url": "https://www.yelp.com/search?find_desc=dive+bars&find_loc=Savannah%2C%20GA",
        "items": [
          "The Original Pinkie Masters (Historic District)",
          "O'Connell's Irish Pub (Historic District)",
          "Abe's on Lincoln (Historic District)",
          "The Rail Pub (Historic District)",
          "Bay Street Blues (Historic District)",
          "American Legion Post 135 (Historic District)",
          "Portal Arcade, Cafe & Bar (Historic District)",
          "The Wormhole (Starland District)",
          "McDonough's (Historic District)",
          "Totally Awesome Bar (Historic District)"
        ]
      },
      "googlereviews": {
        "label": "Google Reviews · Ranked by Rating (May 2026)",
        "url": "https://www.google.com/maps/search/dive+bars+savannah+ga",
        "items": [
          "The Original Pinkie Masters (Historic District)",
          "Abe's on Lincoln (Historic District)",
          "O'Connell's Irish Pub (Historic District)",
          "American Legion Post 135 (Historic District)",
          "The Rail Pub (Historic District)",
          "Portal Arcade, Cafe & Bar (Historic District)",
          "Totally Awesome Bar (Historic District)",
          "Bay Street Blues (Historic District)",
          "The Wormhole (Starland District)",
          "McDonough's (Historic District)"
        ]
      }
    },
    "vote": {
      "items": [
        "The Original Pinkie Masters (Historic District)",
        "Abe's on Lincoln (Historic District)",
        "O'Connell's Irish Pub (Historic District)",
        "American Legion Post 135 (Historic District)",
        "The Rail Pub (Historic District)",
        "Portal Arcade, Cafe & Bar (Historic District)",
        "Bay Street Blues (Historic District)",
        "Totally Awesome Bar (Historic District)",
        "The Wormhole (Starland District)",
        "McDonough's (Historic District)"
      ]
    }
  },
  {
    "id": "savannah-cocktail-bars",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T11:21:55Z",
    "title": "Best Cocktail Bars in Savannah",
    "category": "Savannah",
    "type": "food",
    "tags": [
      "bars",
      "nightlife",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Bar Julian (Eastern Wharf)": "https://www.google.com/maps/search/?api=1&query=Bar%20Julian%20Eastern%20Wharf%20Savannah%20GA",
      "Wexford Irish Pub (Historic District)": "https://www.google.com/maps/search/?api=1&query=Wexford%20Irish%20Pub%20Historic%20District%20Savannah%20GA",
      "The Peregrin (Historic District)": "https://www.google.com/maps/search/?api=1&query=The%20Peregrin%20Historic%20District%20Savannah%20GA",
      "Baobab Lounge (Plant Riverside District)": "https://www.google.com/maps/search/?api=1&query=Baobab%20Lounge%20Plant%20Riverside%20District%20Savannah%20GA",
      "Congress Street Up (Historic District)": "https://www.google.com/maps/search/?api=1&query=Congress%20Street%20Up%20Historic%20District%20Savannah%20GA",
      "The Common (Historic District)": "https://www.google.com/maps/search/?api=1&query=The%20Common%20Historic%20District%20Savannah%20GA",
      "Artillery Bar (Historic District)": "https://www.google.com/maps/search/?api=1&query=Artillery%20Bar%20Historic%20District%20Savannah%20GA",
      "Smol (Starland District)": "https://www.google.com/maps/search/?api=1&query=Smol%20Starland%20District%20Savannah%20GA",
      "Peacock Lounge (Historic District)": "https://www.google.com/maps/search/?api=1&query=Peacock%20Lounge%20Historic%20District%20Savannah%20GA",
      "Sorry Charlie's (Historic District)": "https://www.google.com/maps/search/?api=1&query=Sorry%20Charlie%27s%20Historic%20District%20Savannah%20GA",
      "Alley Cat Lounge (Historic District)": "https://www.google.com/maps/search/?api=1&query=Alley%20Cat%20Lounge%20Historic%20District%20Savannah%20GA",
      "Lone Wolf Lounge (Starland District)": "https://www.google.com/maps/search/?api=1&query=Lone%20Wolf%20Lounge%20Starland%20District%20Savannah%20GA",
      "Savoy Society (Historic District)": "https://www.google.com/maps/search/?api=1&query=Savoy%20Society%20Historic%20District%20Savannah%20GA",
      "The Fitzroy (Historic District)": "https://www.google.com/maps/search/?api=1&query=The%20Fitzroy%20Historic%20District%20Savannah%20GA",
      "Repeal 33 (Historic District)": "https://www.google.com/maps/search/?api=1&query=Repeal%2033%20Historic%20District%20Savannah%20GA",
      "Electric Moon Skytop Lounge (Plant Riverside District)": "https://www.google.com/maps/search/?api=1&query=Electric%20Moon%20Skytop%20Lounge%20Plant%20Riverside%20District%20Savannah%20GA"
    },
    "blurb": "Speakeasies, rooftops, and craft-cocktail rooms: where Savannah drinks well, by consensus.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Artillery Bar (Historic District)",
          "Alley Cat Lounge (Historic District)",
          "The Fitzroy (Historic District)",
          "The Peregrin (Historic District)",
          "Lone Wolf Lounge (Starland District)",
          "Baobab Lounge (Plant Riverside District)",
          "Congress Street Up (Historic District)",
          "Bar Julian (Eastern Wharf)",
          "Peacock Lounge (Historic District)",
          "Savoy Society (Historic District)"
        ]
      },
      "culinary": {
        "label": "Culinary Travels Magazine · 10 Cocktail Bars 2024 (unranked)",
        "url": "https://culinarytravelsmagazine.com/10-cocktail-bars-in-savannah-that-are-shaking-things-up/",
        "items": [
          "Bar Julian (Eastern Wharf)",
          "Wexford Irish Pub (Historic District)",
          "The Peregrin (Historic District)",
          "Baobab Lounge (Plant Riverside District)",
          "Congress Street Up (Historic District)",
          "The Common (Historic District)",
          "Artillery Bar (Historic District)",
          "Smol (Starland District)",
          "Peacock Lounge (Historic District)",
          "Sorry Charlie's (Historic District)"
        ],
        "unordered": true
      },
      "nightflow": {
        "label": "Nightflow · Best Cocktail Bars in Savannah 2026 (unranked)",
        "url": "https://www.nightflow.com/the-best-cocktail-bars-in-savannah/",
        "items": [
          "Alley Cat Lounge (Historic District)",
          "Lone Wolf Lounge (Starland District)",
          "Artillery Bar (Historic District)",
          "Peacock Lounge (Historic District)",
          "Savoy Society (Historic District)",
          "The Peregrin (Historic District)",
          "The Fitzroy (Historic District)"
        ],
        "unordered": true
      },
      "visitsavannah": {
        "label": "Visit Savannah · Where to Find Craft Cocktails 2025 (unranked)",
        "url": "https://visitsavannah.com/article/where-to-find-craft-cocktails-savannah",
        "items": [
          "Artillery Bar (Historic District)",
          "Alley Cat Lounge (Historic District)",
          "The Peregrin (Historic District)",
          "The Fitzroy (Historic District)",
          "Repeal 33 (Historic District)",
          "Electric Moon Skytop Lounge (Plant Riverside District)"
        ],
        "unordered": true
      },
      "yelp": {
        "label": "Yelp · Ranked by Rating (May 2026)",
        "url": "https://www.yelp.com/search?find_desc=cocktail+bars&find_loc=Savannah%2C%20GA",
        "items": [
          "Smol (Starland District)",
          "Lone Wolf Lounge (Starland District)",
          "Alley Cat Lounge (Historic District)",
          "Baobab Lounge (Plant Riverside District)",
          "Artillery Bar (Historic District)",
          "Bar Julian (Eastern Wharf)",
          "Savoy Society (Historic District)",
          "Congress Street Up (Historic District)",
          "Repeal 33 (Historic District)",
          "The Fitzroy (Historic District)",
          "Wexford Irish Pub (Historic District)",
          "Peacock Lounge (Historic District)",
          "Sorry Charlie's (Historic District)",
          "The Peregrin (Historic District)",
          "Electric Moon Skytop Lounge (Plant Riverside District)"
        ]
      },
      "googlereviews": {
        "label": "Google Reviews · Ranked by Rating (May 2026)",
        "url": "https://www.google.com/maps/search/cocktail+bars+savannah+ga",
        "items": [
          "Smol (Starland District)",
          "Lone Wolf Lounge (Starland District)",
          "Congress Street Up (Historic District)",
          "Baobab Lounge (Plant Riverside District)",
          "Alley Cat Lounge (Historic District)",
          "Artillery Bar (Historic District)",
          "Repeal 33 (Historic District)",
          "Wexford Irish Pub (Historic District)",
          "The Fitzroy (Historic District)",
          "Bar Julian (Eastern Wharf)",
          "Savoy Society (Historic District)",
          "Sorry Charlie's (Historic District)",
          "The Common (Historic District)",
          "The Peregrin (Historic District)",
          "Peacock Lounge (Historic District)",
          "Electric Moon Skytop Lounge (Plant Riverside District)"
        ]
      }
    },
    "vote": {
      "items": [
        "Artillery Bar (Historic District)",
        "Alley Cat Lounge (Historic District)",
        "The Fitzroy (Historic District)",
        "The Peregrin (Historic District)",
        "Lone Wolf Lounge (Starland District)",
        "Baobab Lounge (Plant Riverside District)",
        "Congress Street Up (Historic District)",
        "Bar Julian (Eastern Wharf)",
        "Peacock Lounge (Historic District)",
        "Savoy Society (Historic District)"
      ]
    }
  },
  {
    "id": "savannah-coffee-shops",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T11:21:55Z",
    "title": "Best Coffee Shops in Savannah",
    "category": "Savannah",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Gallery Espresso (Historic District)": "https://www.google.com/maps/search/?api=1&query=Gallery%20Espresso%20Historic%20District%20Savannah%20GA",
      "The Paris Market Cafe (Historic District)": "https://www.google.com/maps/search/?api=1&query=The%20Paris%20Market%20Cafe%20Historic%20District%20Savannah%20GA",
      "Foxy Loxy Cafe (Starland District)": "https://www.google.com/maps/search/?api=1&query=Foxy%20Loxy%20Cafe%20Starland%20District%20Savannah%20GA",
      "The Collins Quarter (Historic District)": "https://www.google.com/maps/search/?api=1&query=The%20Collins%20Quarter%20Historic%20District%20Savannah%20GA",
      "Savannah Coffee Roasters (Historic District)": "https://www.google.com/maps/search/?api=1&query=Savannah%20Coffee%20Roasters%20Historic%20District%20Savannah%20GA",
      "The Sentient Bean (Forsyth Park)": "https://www.google.com/maps/search/?api=1&query=The%20Sentient%20Bean%20Forsyth%20Park%20Savannah%20GA",
      "Mirabelle Savannah (Historic District)": "https://www.google.com/maps/search/?api=1&query=Mirabelle%20Savannah%20Historic%20District%20Savannah%20GA",
      "The Coffee Fox (Historic District)": "https://www.google.com/maps/search/?api=1&query=The%20Coffee%20Fox%20Historic%20District%20Savannah%20GA",
      "The Drayton (Historic District)": "https://www.google.com/maps/search/?api=1&query=The%20Drayton%20Historic%20District%20Savannah%20GA",
      "PERC Coffee (Thomas Square)": "https://www.google.com/maps/search/?api=1&query=PERC%20Coffee%20Thomas%20Square%20Savannah%20GA",
      "Henny Penny Art Space & Cafe (Historic District)": "https://www.google.com/maps/search/?api=1&query=Henny%20Penny%20Art%20Space%20Cafe%20Historic%20District%20Savannah%20GA",
      "Bitty & Beau's Coffee (Historic District)": "https://www.google.com/maps/search/?api=1&query=Bitty%20Beau%27s%20Coffee%20Historic%20District%20Savannah%20GA",
      "Blends a Coffee Boutique (Historic District)": "https://www.google.com/maps/search/?api=1&query=Blends%20a%20Coffee%20Boutique%20Historic%20District%20Savannah%20GA",
      "Vic's Coffee Bar (Historic District)": "https://www.google.com/maps/search/?api=1&query=Vic%27s%20Coffee%20Bar%20Historic%20District%20Savannah%20GA",
      "Maté Factor (Midtown)": "https://www.google.com/maps/search/?api=1&query=Mat%C3%A9%20Factor%20Midtown%20Savannah%20GA",
      "Franklin's (Historic District)": "https://www.google.com/maps/search/?api=1&query=Franklin%27s%20Historic%20District%20Savannah%20GA",
      "Origin Coffee Bar (Historic District)": "https://www.google.com/maps/search/?api=1&query=Origin%20Coffee%20Bar%20Historic%20District%20Savannah%20GA"
    },
    "blurb": "From Gallery Espresso to PERC: the Savannah cafes that turn up on every local list, by consensus.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "The Collins Quarter (Historic District)",
          "The Coffee Fox (Historic District)",
          "Bitty & Beau's Coffee (Historic District)",
          "Foxy Loxy Cafe (Starland District)",
          "The Paris Market Cafe (Historic District)",
          "PERC Coffee (Thomas Square)",
          "Maté Factor (Midtown)",
          "Gallery Espresso (Historic District)",
          "Henny Penny Art Space & Cafe (Historic District)",
          "Savannah Coffee Roasters (Historic District)"
        ]
      },
      "lowcountry": {
        "label": "Lowcountry Style & Living · 15 Best Coffee Shops 2022 (unranked)",
        "url": "https://lowcountrystyleandliving.com/the-15-best-coffee-shops-in-savannah-georgia/",
        "items": [
          "Gallery Espresso (Historic District)",
          "The Paris Market Cafe (Historic District)",
          "Foxy Loxy Cafe (Starland District)",
          "The Collins Quarter (Historic District)",
          "Savannah Coffee Roasters (Historic District)",
          "The Sentient Bean (Forsyth Park)",
          "Mirabelle Savannah (Historic District)",
          "The Coffee Fox (Historic District)",
          "The Drayton (Historic District)",
          "PERC Coffee (Thomas Square)",
          "Henny Penny Art Space & Cafe (Historic District)",
          "Bitty & Beau's Coffee (Historic District)",
          "Blends a Coffee Boutique (Historic District)",
          "Vic's Coffee Bar (Historic District)",
          "Maté Factor (Midtown)"
        ],
        "unordered": true
      },
      "gracelightness": {
        "label": "Grace & Lightness Magazine · 8 Best Coffee Shops 2026 (unranked)",
        "url": "https://graceandlightness.com/best-coffee-savannah/",
        "items": [
          "The Paris Market Cafe (Historic District)",
          "The Coffee Fox (Historic District)",
          "The Sentient Bean (Forsyth Park)",
          "Henny Penny Art Space & Cafe (Historic District)",
          "The Collins Quarter (Historic District)",
          "Gallery Espresso (Historic District)",
          "The Drayton (Historic District)",
          "Foxy Loxy Cafe (Starland District)"
        ],
        "unordered": true
      },
      "beourgaston": {
        "label": "Be Our Gaston · Best Coffee Shops in Savannah 2026 (unranked)",
        "url": "https://www.beourgaston.com/coffee-shops-savannah",
        "items": [
          "Savannah Coffee Roasters (Historic District)",
          "The Collins Quarter (Historic District)",
          "Franklin's (Historic District)",
          "The Coffee Fox (Historic District)",
          "Gallery Espresso (Historic District)",
          "Origin Coffee Bar (Historic District)"
        ],
        "unordered": true
      },
      "yelp": {
        "label": "Yelp · Ranked by Rating (May 2026)",
        "url": "https://www.yelp.com/search?find_desc=coffee&find_loc=Savannah%2C%20GA",
        "items": [
          "Bitty & Beau's Coffee (Historic District)",
          "Maté Factor (Midtown)",
          "PERC Coffee (Thomas Square)",
          "Origin Coffee Bar (Historic District)",
          "Foxy Loxy Cafe (Starland District)",
          "The Paris Market Cafe (Historic District)",
          "Franklin's (Historic District)",
          "The Coffee Fox (Historic District)",
          "The Collins Quarter (Historic District)",
          "Henny Penny Art Space & Cafe (Historic District)",
          "Mirabelle Savannah (Historic District)",
          "Savannah Coffee Roasters (Historic District)",
          "Vic's Coffee Bar (Historic District)",
          "The Sentient Bean (Forsyth Park)",
          "Gallery Espresso (Historic District)"
        ]
      },
      "googlereviews": {
        "label": "Google Reviews · Ranked by Rating (May 2026)",
        "url": "https://www.google.com/maps/search/coffee+shops+savannah+ga",
        "items": [
          "Bitty & Beau's Coffee (Historic District)",
          "The Collins Quarter (Historic District)",
          "Maté Factor (Midtown)",
          "PERC Coffee (Thomas Square)",
          "Origin Coffee Bar (Historic District)",
          "Foxy Loxy Cafe (Starland District)",
          "Mirabelle Savannah (Historic District)",
          "The Paris Market Cafe (Historic District)",
          "Franklin's (Historic District)",
          "Savannah Coffee Roasters (Historic District)",
          "The Coffee Fox (Historic District)",
          "Gallery Espresso (Historic District)",
          "Blends a Coffee Boutique (Historic District)",
          "Henny Penny Art Space & Cafe (Historic District)",
          "Vic's Coffee Bar (Historic District)",
          "The Sentient Bean (Forsyth Park)",
          "The Drayton (Historic District)"
        ]
      }
    },
    "vote": {
      "items": [
        "The Collins Quarter (Historic District)",
        "The Coffee Fox (Historic District)",
        "Bitty & Beau's Coffee (Historic District)",
        "Foxy Loxy Cafe (Starland District)",
        "The Paris Market Cafe (Historic District)",
        "PERC Coffee (Thomas Square)",
        "Maté Factor (Midtown)",
        "Gallery Espresso (Historic District)",
        "Henny Penny Art Space & Cafe (Historic District)",
        "Savannah Coffee Roasters (Historic District)"
      ]
    }
  },
  {
    "id": "best-hamptons-towns",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T13:06:45Z",
    "title": "Most Exclusive Hamptons Towns",
    "category": "Hamptons",
    "type": "travel",
    "tags": [
      "travel",
      "luxury"
    ],
    "linkType": "mapsCity",
    "links": {
      "Sagaponack (Southampton Town)": "https://www.google.com/maps/search/?api=1&query=Sagaponack%20NY",
      "East Hampton Village (East Hampton Town)": "https://www.google.com/maps/search/?api=1&query=East%20Hampton%20NY%2011937",
      "Water Mill (Southampton Town)": "https://www.google.com/maps/search/?api=1&query=Water%20Mill%20NY",
      "Bridgehampton (Southampton Town)": "https://www.google.com/maps/search/?api=1&query=Bridgehampton%20NY",
      "Southampton Village (Southampton Town)": "https://www.google.com/maps/search/?api=1&query=Southampton%20NY%2011968",
      "Amagansett (East Hampton Town)": "https://www.google.com/maps/search/?api=1&query=Amagansett%20NY",
      "North Haven (Southampton Town)": "https://www.google.com/maps/search/?api=1&query=North%20Haven%20NY%2011963",
      "Sag Harbor (Southampton Town)": "https://www.google.com/maps/search/?api=1&query=Sag%20Harbor%20NY",
      "Wainscott (East Hampton Town)": "https://www.google.com/maps/search/?api=1&query=Wainscott%20NY",
      "Quogue (Southampton Town)": "https://www.google.com/maps/search/?api=1&query=Quogue%20NY",
      "Montauk (East Hampton Town)": "https://www.google.com/maps/search/?api=1&query=Montauk%20NY",
      "Noyac (Southampton Town)": "https://www.google.com/maps/search/?api=1&query=Noyac%20NY",
      "Westhampton Beach (Southampton Town)": "https://www.google.com/maps/search/?api=1&query=Westhampton%20Beach%20NY",
      "Westhampton Dunes (Southampton Town)": "https://www.google.com/maps/search/?api=1&query=West%20Hampton%20Dunes%20NY",
      "North Sea (Southampton Town)": "https://www.google.com/maps/search/?api=1&query=North%20Sea%20NY%20Southampton",
      "Shinnecock Hills (Southampton Town)": "https://www.google.com/maps/search/?api=1&query=Shinnecock%20Hills%20NY",
      "Springs (East Hampton Town)": "https://www.google.com/maps/search/?api=1&query=Springs%20NY%20East%20Hampton",
      "East Quogue (Southampton Town)": "https://www.google.com/maps/search/?api=1&query=East%20Quogue%20NY",
      "Remsenburg (Southampton Town)": "https://www.google.com/maps/search/?api=1&query=Remsenburg%20NY",
      "Westhampton (Southampton Town)": "https://www.google.com/maps/search/?api=1&query=Westhampton%20NY",
      "Hampton Bays (Southampton Town)": "https://www.google.com/maps/search/?api=1&query=Hampton%20Bays%20NY"
    },
    "blurb": "The South Fork ranked by sheer cachet: exclusivity plus median home price. From Sagaponack's record-setting oceanfront estates to the storied 'Behind the Hedges' villages south of the highway, these are the most coveted addresses in the Hamptons.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Sagaponack (Southampton Town)",
          "East Hampton Village (East Hampton Town)",
          "Water Mill (Southampton Town)",
          "Bridgehampton (Southampton Town)",
          "Southampton Village (Southampton Town)",
          "Amagansett (East Hampton Town)",
          "North Haven (Southampton Town)",
          "Sag Harbor (Southampton Town)",
          "Wainscott (East Hampton Town)",
          "Quogue (Southampton Town)"
        ]
      },
      "propertyshark": {
        "label": "PropertyShark · Most Expensive U.S. ZIP Codes 2024 (Hamptons)",
        "url": "https://www.propertyshark.com/mason/text/most-expensive-zip-codes/",
        "items": [
          "Sagaponack (Southampton Town)",
          "Water Mill (Southampton Town)",
          "Bridgehampton (Southampton Town)",
          "East Hampton Village (East Hampton Town)",
          "Wainscott (East Hampton Town)",
          "Amagansett (East Hampton Town)"
        ]
      },
      "raveis": {
        "label": "William Raveis · Median Home Price by Hamlet 2025",
        "url": "https://www.raveis.com/local-life/blog/median-price-the-hamptons/",
        "items": [
          "Sagaponack (Southampton Town)",
          "East Hampton Village (East Hampton Town)",
          "Water Mill (Southampton Town)",
          "Bridgehampton (Southampton Town)",
          "Southampton Village (Southampton Town)",
          "Amagansett (East Hampton Town)",
          "North Haven (Southampton Town)",
          "Quogue (Southampton Town)",
          "Sag Harbor (Southampton Town)",
          "Montauk (East Hampton Town)",
          "Noyac (Southampton Town)",
          "North Sea (Southampton Town)",
          "Westhampton Beach (Southampton Town)",
          "East Quogue (Southampton Town)",
          "Westhampton (Southampton Town)",
          "Remsenburg (Southampton Town)",
          "Shinnecock Hills (Southampton Town)",
          "Springs (East Hampton Town)",
          "Hampton Bays (Southampton Town)"
        ]
      },
      "suburbs101": {
        "label": "Suburbs 101 · 7 Richest Towns in the Hamptons 2025",
        "url": "https://suburbs101.com/richest-towns-in-the-hamptons/",
        "items": [
          "Sagaponack (Southampton Town)",
          "North Haven (Southampton Town)",
          "Southampton Village (Southampton Town)",
          "Sag Harbor (Southampton Town)",
          "Westhampton Dunes (Southampton Town)",
          "Westhampton Beach (Southampton Town)",
          "Quogue (Southampton Town)"
        ]
      }
    },
    "vote": {
      "items": [
        "Sagaponack (Southampton Town)",
        "East Hampton Village (East Hampton Town)",
        "Water Mill (Southampton Town)",
        "Bridgehampton (Southampton Town)",
        "Southampton Village (Southampton Town)",
        "Amagansett (East Hampton Town)",
        "North Haven (Southampton Town)",
        "Sag Harbor (Southampton Town)",
        "Wainscott (East Hampton Town)",
        "Quogue (Southampton Town)"
      ]
    }
  },
  {
    "id": "best-netflix-shows",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T13:12:00Z",
    "title": "Best Netflix Shows",
    "category": "TV",
    "type": "entertainment",
    "tags": [
      "entertainment"
    ],
    "linkType": "imdb",
    "blurb": "Netflix originals only: the prestige dramas, animation, and crime sagas critics and IMDb users keep at the top, from Dark to BoJack Horseman to Arcane.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Arcane",
          "Dark",
          "BoJack Horseman",
          "Black Mirror",
          "When They See Us",
          "Stranger Things",
          "Narcos",
          "Mindhunter",
          "The Queen's Gambit",
          "Squid Game"
        ]
      },
      "collider": {
        "label": "Collider · 30 Best Netflix Series Ranked by IMDb 2026",
        "url": "https://collider.com/best-netflix-series-of-all-time-ranked-imdb/",
        "items": [
          "Arcane",
          "When They See Us",
          "BoJack Horseman",
          "Dark",
          "Narcos",
          "Stranger Things",
          "Black Mirror",
          "Mindhunter",
          "Ozark",
          "Cobra Kai",
          "Castlevania",
          "Love, Death & Robots"
        ]
      },
      "slashfilm": {
        "label": "SlashFilm · 15 Best Netflix Original Shows Ranked",
        "url": "https://www.slashfilm.com/2080320/best-netflix-original-shows-ranked/",
        "items": [
          "BoJack Horseman",
          "Stranger Things",
          "Black Mirror",
          "Dark",
          "Mindhunter",
          "The Crown",
          "Master of None",
          "Narcos",
          "Unbelievable",
          "When They See Us",
          "Russian Doll",
          "The Queen's Gambit"
        ]
      },
      "cordcutting": {
        "label": "CordCutting · Best Netflix Series by IMDb",
        "url": "https://cordcutting.com/blog/best-netflix-original-series/",
        "items": [
          "Arcane",
          "Dark",
          "BoJack Horseman",
          "Black Mirror",
          "Mindhunter",
          "Narcos",
          "When They See Us",
          "The Queen's Gambit",
          "Stranger Things",
          "Squid Game"
        ]
      }
    },
    "vote": {
      "items": [
        "Arcane",
        "Dark",
        "BoJack Horseman",
        "Black Mirror",
        "When They See Us",
        "Stranger Things",
        "Narcos",
        "Mindhunter",
        "The Queen's Gambit",
        "Squid Game"
      ]
    }
  },
  {
    "id": "best-hbo-shows",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T13:14:00Z",
    "title": "Best HBO Shows",
    "category": "TV",
    "type": "entertainment",
    "tags": [
      "entertainment"
    ],
    "linkType": "imdb",
    "blurb": "The network that defined prestige television. From The Wire and The Sopranos to Succession and Chernobyl, the HBO series critics rank among the greatest ever made.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "The Wire",
          "The Sopranos",
          "Chernobyl",
          "Succession",
          "Band of Brothers",
          "Game of Thrones",
          "Six Feet Under",
          "Barry",
          "Curb Your Enthusiasm",
          "True Detective"
        ]
      },
      "rottentomatoes": {
        "label": "Rotten Tomatoes · Best HBO Series Ranked by Tomatometer 2026",
        "url": "https://editorial.rottentomatoes.com/guide/best-hbo-series-of-all-time-ranked/",
        "items": [
          "I May Destroy You",
          "Chernobyl",
          "Succession",
          "Watchmen",
          "The Leftovers",
          "Band of Brothers",
          "The Wire",
          "Barry",
          "The Sopranos",
          "Six Feet Under"
        ]
      },
      "collider": {
        "label": "Collider · Best HBO Shows Ranked by IMDb",
        "url": "https://collider.com/best-hbo-shows-ranked-imdb/",
        "items": [
          "Band of Brothers",
          "The Wire",
          "Chernobyl",
          "The Sopranos",
          "Game of Thrones",
          "Succession",
          "True Detective",
          "Six Feet Under",
          "Curb Your Enthusiasm",
          "Barry"
        ]
      },
      "indiewire": {
        "label": "IndieWire · The Best HBO Series of All Time, Ranked",
        "url": "https://www.indiewire.com/features/best-of/best-hbo-series-all-time-ranked-shows-1201859391/",
        "items": [
          "The Wire",
          "The Sopranos",
          "Six Feet Under",
          "Deadwood",
          "Succession",
          "Band of Brothers",
          "Curb Your Enthusiasm",
          "Game of Thrones",
          "Barry",
          "Chernobyl"
        ]
      }
    },
    "vote": {
      "items": [
        "The Wire",
        "The Sopranos",
        "Chernobyl",
        "Succession",
        "Band of Brothers",
        "Game of Thrones",
        "Six Feet Under",
        "Barry",
        "Curb Your Enthusiasm",
        "True Detective"
      ]
    }
  },
  {
    "id": "best-documentaries",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T13:16:00Z",
    "title": "Best Documentaries",
    "category": "Film",
    "type": "entertainment",
    "tags": [
      "entertainment"
    ],
    "linkType": "imdb",
    "blurb": "The nonfiction films that changed minds and freed the wrongly convicted. Critics' picks for the greatest documentaries ever made, from The Thin Blue Line to Hoop Dreams to 13th.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Hoop Dreams (1994)",
          "The Thin Blue Line (1988)",
          "13th (2016)",
          "Free Solo (2018)",
          "Man on Wire (2008)",
          "Citizenfour (2014)",
          "Won't You Be My Neighbor? (2018)",
          "The Act of Killing (2012)",
          "Grizzly Man (2005)",
          "Searching for Sugar Man (2012)"
        ]
      },
      "rottentomatoes": {
        "label": "Rotten Tomatoes · 100 Best Documentaries of All Time",
        "url": "https://editorial.rottentomatoes.com/guide/100-best-documentaries/",
        "items": [
          "Won't You Be My Neighbor? (2018)",
          "13th (2016)",
          "I Am Not Your Negro (2016)",
          "Hoop Dreams (1994)",
          "Free Solo (2018)",
          "Honeyland (2019)",
          "Man on Wire (2008)",
          "Apollo 11 (2019)",
          "Citizenfour (2014)",
          "The Act of Killing (2012)"
        ]
      },
      "timeout": {
        "label": "Time Out · Best Documentaries of All Time, Ranked",
        "url": "https://www.timeout.com/film/best-documentaries-of-all-time",
        "items": [
          "Shoah (1985)",
          "Hoop Dreams (1994)",
          "Sans Soleil (1983)",
          "The Thin Blue Line (1988)",
          "Grey Gardens (1975)",
          "Night and Fog (1956)",
          "The Act of Killing (2012)",
          "Man on Wire (2008)",
          "Grizzly Man (2005)",
          "Bowling for Columbine (2002)"
        ]
      },
      "collider": {
        "label": "Collider · 35 Best Documentaries of All Time, Ranked",
        "url": "https://collider.com/best-documentaries-all-time-ranked/",
        "items": [
          "The Thin Blue Line (1988)",
          "13th (2016)",
          "Free Solo (2018)",
          "Citizenfour (2014)",
          "Man on Wire (2008)",
          "Grizzly Man (2005)",
          "Searching for Sugar Man (2012)",
          "Won't You Be My Neighbor? (2018)",
          "Apollo 11 (2019)",
          "The Act of Killing (2012)"
        ]
      }
    },
    "vote": {
      "items": [
        "Hoop Dreams (1994)",
        "The Thin Blue Line (1988)",
        "13th (2016)",
        "Free Solo (2018)",
        "Man on Wire (2008)",
        "Citizenfour (2014)",
        "Won't You Be My Neighbor? (2018)",
        "The Act of Killing (2012)",
        "Grizzly Man (2005)",
        "Searching for Sugar Man (2012)"
      ]
    }
  },
  {
    "id": "best-finance-novels",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T13:18:00Z",
    "title": "Best Finance Novels",
    "category": "Books",
    "type": "entertainment",
    "tags": [
      "entertainment"
    ],
    "linkType": "amazon",
    "blurb": "Greed, ambition, and the trading floor as literature. The definitive works of Wall Street fiction, from Tom Wolfe's Masters of the Universe to the cold ledger of American Psycho.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "The Bonfire of the Vanities (Tom Wolfe)",
          "American Psycho (Bret Easton Ellis)",
          "Reminiscences of a Stock Operator (Edwin Lefevre)",
          "The Financier (Theodore Dreiser)",
          "The Fear Index (Robert Harris)",
          "Cosmopolis (Don DeLillo)",
          "Bombardiers (Po Bronson)",
          "Bond Girl (Erin Duffy)",
          "Nest of Vipers (Linda Davies)",
          "The Takeover (Stephen Frey)"
        ]
      },
      "explorethearchive": {
        "label": "Explore the Archive · Wall Street Books",
        "url": "https://explorethearchive.com/wall-street-books",
        "items": [
          "The Bonfire of the Vanities (Tom Wolfe)",
          "Reminiscences of a Stock Operator (Edwin Lefevre)",
          "American Psycho (Bret Easton Ellis)",
          "The Financier (Theodore Dreiser)",
          "Bombardiers (Po Bronson)"
        ]
      },
      "crimereads": {
        "label": "CrimeReads · Financial Thrillers and Wall Street Noirs",
        "url": "https://crimereads.com/financial-thrillers-and-wall-street-noirs/",
        "items": [
          "American Psycho (Bret Easton Ellis)",
          "The Fear Index (Robert Harris)",
          "Cosmopolis (Don DeLillo)",
          "The Bonfire of the Vanities (Tom Wolfe)",
          "Nest of Vipers (Linda Davies)"
        ]
      },
      "goodreads": {
        "label": "Goodreads · Great Finance Novels (Fiction)",
        "url": "https://www.goodreads.com/list/show/89237.Great_finance_novels_fiction",
        "items": [
          "The Bonfire of the Vanities (Tom Wolfe)",
          "Nest of Vipers (Linda Davies)",
          "The Takeover (Stephen Frey)",
          "Bond Girl (Erin Duffy)",
          "Bombardiers (Po Bronson)"
        ]
      }
    },
    "vote": {
      "items": [
        "The Bonfire of the Vanities (Tom Wolfe)",
        "American Psycho (Bret Easton Ellis)",
        "Reminiscences of a Stock Operator (Edwin Lefevre)",
        "The Financier (Theodore Dreiser)",
        "The Fear Index (Robert Harris)",
        "Cosmopolis (Don DeLillo)",
        "Bombardiers (Po Bronson)",
        "Bond Girl (Erin Duffy)",
        "Nest of Vipers (Linda Davies)",
        "The Takeover (Stephen Frey)"
      ]
    }
  },
  {
    id: 'best-non-toxic-air-fryers',
    publishedDate: '2026-05-31',
    publishedAt: '2026-05-31T17:40:30Z',
    title: 'Best Non-Toxic Air Fryers',
    category: 'Kitchen',
    type: 'product',
    tags: ['product', 'tech'],
    linkType: 'amazon',
    blurb: 'Teflon-free and PFAS-free, with glass, ceramic, and stainless steel throughout. The air fryers that independent safety reviewers recommend without reservation.',
    defaultSource: 'ai',
    links: {
      'Ninja Crispi Pro': 'https://www.amazon.com/dp/B0FPPJBKLS?tag=cgurus-20',
      'Our Place Wonder Oven': 'https://www.amazon.com/s?k=Our+Place+Wonder+Oven&tag=cgurus-20',
      'Typhur Dome 2': 'https://www.amazon.com/dp/B0CKP6Y6KB?tag=cgurus-20',
      'Our Place Wonder Oven Pro': 'https://www.amazon.com/s?k=Our+Place+Wonder+Oven+Pro&tag=cgurus-20',
      'COSORI Iconic Air Fryer': 'https://www.amazon.com/dp/B0FJYK886N?tag=cgurus-20',
      'Typhur Sync Air Fryer': 'https://www.amazon.com/s?k=Typhur+Sync+Air+Fryer&tag=cgurus-20',
      'GreenPan Elite Convection Air Fryer Oven': 'https://www.amazon.com/s?k=GreenPan+Elite+Convection+Air+Fryer&tag=cgurus-20',
      'Aria AAO-890 10Qt Air Fryer': 'https://www.amazon.com/s?k=Aria+AAO-890+Air+Fryer&tag=cgurus-20',
      'Magnifique Glass Air Fryer': 'https://www.amazon.com/s?k=Magnifique+Glass+Air+Fryer&tag=cgurus-20',
      "BLACK+DECKER Crisp' N Bake Air Fryer Toaster Oven": 'https://www.amazon.com/s?k=BLACK%2BDECKER+Crisp+N+Bake+Air+Fryer&tag=cgurus-20',
      'Fritaire Self-Cleaning Glass Air Fryer': 'https://www.amazon.com/s?k=Fritaire+Glass+Air+Fryer&tag=cgurus-20',
      'Kalorik MAXX Air Fryer Oven Grill': 'https://www.amazon.com/s?k=Kalorik+MAXX+Air+Fryer&tag=cgurus-20',
      'bella 4Qt Slim Air Fryer': 'https://www.amazon.com/s?k=bella+4Qt+Slim+Air+Fryer&tag=cgurus-20',
    },
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          'Ninja Crispi Pro',
          'Our Place Wonder Oven',
          'Typhur Dome 2',
          'Typhur Sync Air Fryer',
          'Our Place Wonder Oven Pro',
          'COSORI Iconic Air Fryer',
          'GreenPan Elite Convection Air Fryer Oven',
          'Aria AAO-890 10Qt Air Fryer',
          'Magnifique Glass Air Fryer',
          'Fritaire Self-Cleaning Glass Air Fryer',
        ],
      },
      amazon: {
        label: 'Amazon Reviews · Ranked by Rating (May 2026)',
        url: 'https://www.amazon.com/s?k=non+toxic+air+fryer&tag=cgurus-20',
        items: [
          'COSORI Iconic Air Fryer',
          'Ninja Crispi Pro',
          'Typhur Dome 2',
        ],
      },
      theroundup: {
        label: 'TheRoundup · 7 Safest Non-Toxic Air Fryers 2026',
        url: 'https://theroundup.org/safest-non-toxic-air-fryers/',
        items: [
          'Our Place Wonder Oven',
          'Our Place Wonder Oven Pro',
          'Ninja Crispi Pro',
          'Aria AAO-890 10Qt Air Fryer',
          "BLACK+DECKER Crisp' N Bake Air Fryer Toaster Oven",
          'Typhur Dome 2',
          'bella 4Qt Slim Air Fryer',
        ],
      },
      healnourishgrow: {
        label: 'Heal Nourish Grow Best Non-Toxic Air Fryer 2026',
        url: 'https://healnourishgrow.com/best-non-toxic-air-fryer/',
        items: [
          'Typhur Dome 2',
          'Typhur Sync Air Fryer',
          'Ninja Crispi Pro',
          'Our Place Wonder Oven',
          'GreenPan Elite Convection Air Fryer Oven',
          'Magnifique Glass Air Fryer',
          'Kalorik MAXX Air Fryer Oven Grill',
          'Fritaire Self-Cleaning Glass Air Fryer',
        ],
      },
    },
    vote: {
      items: [
        'Ninja Crispi Pro',
        'Our Place Wonder Oven',
        'Typhur Dome 2',
        'Typhur Sync Air Fryer',
        'Our Place Wonder Oven Pro',
        'COSORI Iconic Air Fryer',
        'GreenPan Elite Convection Air Fryer Oven',
        'Aria AAO-890 10Qt Air Fryer',
        'Magnifique Glass Air Fryer',
        'Fritaire Self-Cleaning Glass Air Fryer',
      ],
    },
  },
  {
    "id": "best-air-fryer-cookbooks",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T13:22:00Z",
    "title": "Best Air Fryer Cookbooks",
    "category": "Cookbooks",
    "type": "product",
    "tags": [
      "product",
      "stores"
    ],
    "linkType": "amazon",
    "blurb": "Beyond frozen fries. The most trusted air fryer cookbooks, from America's Test Kitchen's science to Skinnytaste's lighter takes, ranked by editors and Amazon buyers.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Air Fryer Perfection (America's Test Kitchen)",
          "The Skinnytaste Air Fryer Cookbook (Gina Homolka)",
          "The I Love My Air Fryer Recipe Book (Robin Donovan)",
          "Every Day Easy Air Fryer (Urvashi Pitre)",
          "Air Fry Everything (Ben Mims)",
          "The Essential Air Fryer Cookbook for Beginners",
          "The Complete Air Fryer Cookbook (Linda Larsen)",
          "Air Fryer Revolution (Urvashi Pitre)"
        ]
      },
      "foodnetwork": {
        "label": "Food Network · 18 Best Air Fryer Cookbooks",
        "url": "https://www.foodnetwork.com/how-to/packages/shopping/articles/best-air-fryer-cookbooks",
        "items": [
          "Air Fryer Perfection (America's Test Kitchen)",
          "The Skinnytaste Air Fryer Cookbook (Gina Homolka)",
          "The I Love My Air Fryer Recipe Book (Robin Donovan)",
          "Every Day Easy Air Fryer (Urvashi Pitre)",
          "Air Fry Everything (Ben Mims)"
        ]
      },
      "sixstoreys": {
        "label": "Six Storeys · 10 Best Air Fryer Cookbooks 2026",
        "url": "https://sixstoreys.com/best-air-fryer-cookbooks/",
        "items": [
          "The Skinnytaste Air Fryer Cookbook (Gina Homolka)",
          "Air Fryer Perfection (America's Test Kitchen)",
          "The Essential Air Fryer Cookbook for Beginners",
          "The Complete Air Fryer Cookbook (Linda Larsen)",
          "The I Love My Air Fryer Recipe Book (Robin Donovan)"
        ]
      },
      "amazonreviews": {
        "label": "Amazon Reviews · Ranked by Rating (May 2026)",
        "url": "https://www.amazon.com/s?k=air+fryer+cookbook&tag=cgurus-20",
        "items": [
          "The Skinnytaste Air Fryer Cookbook (Gina Homolka)",
          "Air Fryer Perfection (America's Test Kitchen)",
          "The I Love My Air Fryer Recipe Book (Robin Donovan)"
        ]
      }
    },
    "vote": {
      "items": [
        "Air Fryer Perfection (America's Test Kitchen)",
        "The Skinnytaste Air Fryer Cookbook (Gina Homolka)",
        "The I Love My Air Fryer Recipe Book (Robin Donovan)",
        "Every Day Easy Air Fryer (Urvashi Pitre)",
        "Air Fry Everything (Ben Mims)",
        "The Essential Air Fryer Cookbook for Beginners",
        "The Complete Air Fryer Cookbook (Linda Larsen)",
        "Air Fryer Revolution (Urvashi Pitre)"
      ]
    }
  },
  {
    "id": "best-airport-lounges",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T13:24:00Z",
    "title": "Best Airport Lounges",
    "category": "Travel",
    "type": "travel",
    "tags": [
      "travel",
      "luxury"
    ],
    "linkType": "mapsCity",
    "links": {
      "Qatar Airways Al Mourjan Business Lounge (Doha DOH)": "https://www.google.com/maps/search/?api=1&query=Qatar%20Airways%20Al%20Mourjan%20Business%20Lounge%20Hamad%20International%20Airport%20Doha",
      "Singapore Airlines The Private Room (Singapore SIN)": "https://www.google.com/maps/search/?api=1&query=Singapore%20Airlines%20The%20Private%20Room%20Changi%20Airport%20Terminal%203",
      "Cathay Pacific The Pier First Class Lounge (Hong Kong HKG)": "https://www.google.com/maps/search/?api=1&query=Cathay%20Pacific%20The%20Pier%20First%20Class%20Lounge%20Hong%20Kong%20International%20Airport",
      "Lufthansa First Class Terminal (Frankfurt FRA)": "https://www.google.com/maps/search/?api=1&query=Lufthansa%20First%20Class%20Terminal%20Frankfurt%20Airport",
      "Qantas First Lounge (Sydney SYD)": "https://www.google.com/maps/search/?api=1&query=Qantas%20First%20Lounge%20Sydney%20International%20Airport",
      "Swiss First Class Lounge (Zurich ZRH)": "https://www.google.com/maps/search/?api=1&query=Swiss%20First%20Class%20Lounge%20Zurich%20Airport",
      "Emirates First Class Lounge (Dubai DXB)": "https://www.google.com/maps/search/?api=1&query=Emirates%20First%20Class%20Lounge%20Dubai%20International%20Airport%20Concourse%20A",
      "Air France La Premiere Lounge (Paris CDG)": "https://www.google.com/maps/search/?api=1&query=Air%20France%20La%20Premiere%20Lounge%20Paris%20Charles%20de%20Gaulle%20Terminal%202E",
      "American Express Centurion Lounge (New York JFK)": "https://www.google.com/maps/search/?api=1&query=American%20Express%20Centurion%20Lounge%20JFK%20Airport%20Terminal%204",
      "Plaza Premium Lounge (Rome FCO)": "https://www.google.com/maps/search/?api=1&query=Plaza%20Premium%20Lounge%20Rome%20Fiumicino%20Airport",
      "ANA Suite Lounge (Tokyo HND)": "https://www.google.com/maps/search/?api=1&query=ANA%20Suite%20Lounge%20Tokyo%20Haneda%20Airport%20Terminal%203",
      "Virgin Atlantic Clubhouse (London LHR)": "https://www.google.com/maps/search/?api=1&query=Virgin%20Atlantic%20Clubhouse%20London%20Heathrow%20Terminal%203"
    },
    "blurb": "Caviar, spa suites, and à-la-carte dining before you even board. The world's best airport lounges, led by Skytrax's annual winners from Doha to Zurich.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Qatar Airways Al Mourjan Business Lounge (Doha DOH)",
          "Singapore Airlines The Private Room (Singapore SIN)",
          "Cathay Pacific The Pier First Class Lounge (Hong Kong HKG)",
          "Lufthansa First Class Terminal (Frankfurt FRA)",
          "Qantas First Lounge (Sydney SYD)",
          "Swiss First Class Lounge (Zurich ZRH)",
          "Emirates First Class Lounge (Dubai DXB)",
          "Air France La Premiere Lounge (Paris CDG)",
          "American Express Centurion Lounge (New York JFK)",
          "Plaza Premium Lounge (Rome FCO)"
        ]
      },
      "skytraxfirst": {
        "label": "Skytrax · World's Best First Class Lounges 2024",
        "url": "https://www.worldairlineawards.com/worlds-best-first-class-airline-lounges-2024/",
        "items": [
          "Swiss First Class Lounge (Zurich ZRH)",
          "Air France La Premiere Lounge (Paris CDG)",
          "Singapore Airlines The Private Room (Singapore SIN)",
          "Lufthansa First Class Terminal (Frankfurt FRA)",
          "Cathay Pacific The Pier First Class Lounge (Hong Kong HKG)",
          "Emirates First Class Lounge (Dubai DXB)",
          "ANA Suite Lounge (Tokyo HND)",
          "Qantas First Lounge (Sydney SYD)"
        ]
      },
      "skytraxbusiness": {
        "label": "Skytrax · World's Best Business Class Lounges 2024",
        "url": "https://www.worldairlineawards.com/worlds-best-business-class-airline-lounges-2024/",
        "items": [
          "Qatar Airways Al Mourjan Business Lounge (Doha DOH)",
          "Singapore Airlines The Private Room (Singapore SIN)",
          "Virgin Atlantic Clubhouse (London LHR)"
        ]
      },
      "skytraxindependent": {
        "label": "Skytrax · World's Best Independent Airport Lounges 2024",
        "url": "https://www.worldairlineawards.com/worlds-best-independent-airport-lounges-2024/",
        "items": [
          "Plaza Premium Lounge (Rome FCO)",
          "American Express Centurion Lounge (New York JFK)"
        ]
      }
    },
    "vote": {
      "items": [
        "Qatar Airways Al Mourjan Business Lounge (Doha DOH)",
        "Singapore Airlines The Private Room (Singapore SIN)",
        "Cathay Pacific The Pier First Class Lounge (Hong Kong HKG)",
        "Lufthansa First Class Terminal (Frankfurt FRA)",
        "Qantas First Lounge (Sydney SYD)",
        "Swiss First Class Lounge (Zurich ZRH)",
        "Emirates First Class Lounge (Dubai DXB)",
        "Air France La Premiere Lounge (Paris CDG)",
        "American Express Centurion Lounge (New York JFK)",
        "Plaza Premium Lounge (Rome FCO)"
      ]
    }
  },
  {
    "id": "best-run-sweetgreen-nyc",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T13:50:00Z",
    "title": "Best-Run Sweetgreens in NYC",
    "category": "New York",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores",
      "other"
    ],
    "linkType": "mapsCity",
    "mode": "scores",
    "blurb": "Not all Sweetgreens are created equal. Every NYC location scored on a 0–10 scale from its live Google customer rating (May 2026). The Meatpacking District shop on Gansevoort runs cleanest.",
    "defaultSource": "ai",
    "links": {
      "32 Gansevoort St (Meatpacking District)": "https://www.google.com/maps/search/?api=1&query=Sweetgreen%2032%20Gansevoort%20St%20New%20York",
      "60 E 55th St (Midtown)": "https://www.google.com/maps/search/?api=1&query=Sweetgreen%2060%20E%2055th%20St%20New%20York",
      "100 Kenmare St (Nolita)": "https://www.google.com/maps/search/?api=1&query=Sweetgreen%20100%20Kenmare%20St%20New%20York",
      "1384 Broadway (Garment District)": "https://www.google.com/maps/search/?api=1&query=Sweetgreen%201384%20Broadway%20New%20York",
      "347 Bowery (NoHo)": "https://www.google.com/maps/search/?api=1&query=Sweetgreen%20347%20Bowery%20New%20York",
      "101 University Pl (Greenwich Village)": "https://www.google.com/maps/search/?api=1&query=Sweetgreen%20101%20University%20Pl%20New%20York",
      "27 E 23rd St (Flatiron)": "https://www.google.com/maps/search/?api=1&query=Sweetgreen%2027%20E%2023rd%20St%20New%20York",
      "2937 Broadway (Morningside Heights)": "https://www.google.com/maps/search/?api=1&query=Sweetgreen%202937%20Broadway%20New%20York",
      "606 1st Ave (Kips Bay)": "https://www.google.com/maps/search/?api=1&query=Sweetgreen%20606%201st%20Ave%20New%20York",
      "7 Pennsylvania Plaza (Midtown)": "https://www.google.com/maps/search/?api=1&query=Sweetgreen%207%20Pennsylvania%20Plaza%20New%20York"
    },
    "scores": {
        "32 Gansevoort St (Meatpacking District)": "8.6",
        "60 E 55th St (Midtown)": "8.4",
        "100 Kenmare St (Nolita)": "8.2",
        "1384 Broadway (Garment District)": "8.0",
        "347 Bowery (NoHo)": "8.0",
        "101 University Pl (Greenwich Village)": "7.8",
        "27 E 23rd St (Flatiron)": "7.8",
        "2937 Broadway (Morningside Heights)": "7.6",
        "606 1st Ave (Kips Bay)": "7.6",
        "7 Pennsylvania Plaza (Midtown)": "7.6"
      },
      "sources": {
      "ai": {
        "label": "Composite Score · Google Maps Ratings (May 2026)",
        "items": [
          "32 Gansevoort St (Meatpacking District)",
          "60 E 55th St (Midtown)",
          "100 Kenmare St (Nolita)",
          "1384 Broadway (Garment District)",
          "347 Bowery (NoHo)",
          "101 University Pl (Greenwich Village)",
          "27 E 23rd St (Flatiron)",
          "2937 Broadway (Morningside Heights)",
          "606 1st Ave (Kips Bay)",
          "7 Pennsylvania Plaza (Midtown)"
        ]
      },
      "google": {
        "label": "Google Maps Ratings (May 2026)",
        "url": "https://www.google.com/maps/search/sweetgreen+new+york",
        "items": [
          "32 Gansevoort St (Meatpacking District)",
          "60 E 55th St (Midtown)",
          "100 Kenmare St (Nolita)",
          "1384 Broadway (Garment District)",
          "347 Bowery (NoHo)",
          "101 University Pl (Greenwich Village)",
          "27 E 23rd St (Flatiron)",
          "2937 Broadway (Morningside Heights)",
          "606 1st Ave (Kips Bay)",
          "7 Pennsylvania Plaza (Midtown)"
        ]
      }
    },
    "vote": {
      "items": [
        "32 Gansevoort St (Meatpacking District)",
        "60 E 55th St (Midtown)",
        "100 Kenmare St (Nolita)",
        "1384 Broadway (Garment District)",
        "347 Bowery (NoHo)",
        "101 University Pl (Greenwich Village)",
        "27 E 23rd St (Flatiron)",
        "2937 Broadway (Morningside Heights)",
        "606 1st Ave (Kips Bay)",
        "7 Pennsylvania Plaza (Midtown)"
      ]
    }
  },
  {
    "id": "best-run-cava-nyc",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T13:52:00Z",
    "title": "Best-Run Cavas in NYC",
    "category": "New York",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores",
      "other"
    ],
    "linkType": "mapsCity",
    "mode": "scores",
    "blurb": "Some CAVAs just hit different. Every NYC location scored on a 0–10 scale from its live Google customer rating (May 2026). The Columbus Circle and Hudson Square shops lead a remarkably well-run chain.",
    "defaultSource": "ai",
    "links": {
      "1000 8th Ave (Midtown West)": "https://www.google.com/maps/search/?api=1&query=CAVA%201000%208th%20Ave%20New%20York",
      "350 Hudson St (Hudson Square)": "https://www.google.com/maps/search/?api=1&query=CAVA%20350%20Hudson%20St%20New%20York",
      "307 7th Ave (Chelsea)": "https://www.google.com/maps/search/?api=1&query=CAVA%20307%207th%20Ave%20New%20York",
      "325 Park Ave S (Flatiron)": "https://www.google.com/maps/search/?api=1&query=CAVA%20325%20Park%20Ave%20South%20New%20York",
      "1385 Broadway (Garment District)": "https://www.google.com/maps/search/?api=1&query=CAVA%201385%20Broadway%20New%20York",
      "708 3rd Ave (Midtown East)": "https://www.google.com/maps/search/?api=1&query=CAVA%20708%203rd%20Ave%20New%20York",
      "280 Madison Ave (Midtown)": "https://www.google.com/maps/search/?api=1&query=CAVA%20280%20Madison%20Ave%20New%20York",
      "678 6th Ave (Chelsea)": "https://www.google.com/maps/search/?api=1&query=CAVA%20678%206th%20Ave%20New%20York",
      "11 W 42nd St (Midtown)": "https://www.google.com/maps/search/?api=1&query=CAVA%2011%20W%2042nd%20St%20New%20York",
      "63 Wall St (Financial District)": "https://www.google.com/maps/search/?api=1&query=CAVA%2063%20Wall%20St%20New%20York"
    },
    "scores": {
        "1000 8th Ave (Midtown West)": "9.6",
        "350 Hudson St (Hudson Square)": "9.6",
        "307 7th Ave (Chelsea)": "9.4",
        "325 Park Ave S (Flatiron)": "9.2",
        "1385 Broadway (Garment District)": "9.2",
        "708 3rd Ave (Midtown East)": "9.2",
        "280 Madison Ave (Midtown)": "9.2",
        "678 6th Ave (Chelsea)": "9.2",
        "11 W 42nd St (Midtown)": "9.0",
        "63 Wall St (Financial District)": "9.0"
      },
      "sources": {
      "ai": {
        "label": "Composite Score · Google Maps Ratings (May 2026)",
        "items": [
          "1000 8th Ave (Midtown West)",
          "350 Hudson St (Hudson Square)",
          "307 7th Ave (Chelsea)",
          "325 Park Ave S (Flatiron)",
          "1385 Broadway (Garment District)",
          "708 3rd Ave (Midtown East)",
          "280 Madison Ave (Midtown)",
          "678 6th Ave (Chelsea)",
          "11 W 42nd St (Midtown)",
          "63 Wall St (Financial District)"
        ]
      },
      "google": {
        "label": "Google Maps Ratings (May 2026)",
        "url": "https://www.google.com/maps/search/cava+new+york",
        "items": [
          "1000 8th Ave (Midtown West)",
          "350 Hudson St (Hudson Square)",
          "307 7th Ave (Chelsea)",
          "325 Park Ave S (Flatiron)",
          "1385 Broadway (Garment District)",
          "708 3rd Ave (Midtown East)",
          "280 Madison Ave (Midtown)",
          "678 6th Ave (Chelsea)",
          "11 W 42nd St (Midtown)",
          "63 Wall St (Financial District)"
        ]
      }
    },
    "vote": {
      "items": [
        "1000 8th Ave (Midtown West)",
        "350 Hudson St (Hudson Square)",
        "307 7th Ave (Chelsea)",
        "325 Park Ave S (Flatiron)",
        "1385 Broadway (Garment District)",
        "708 3rd Ave (Midtown East)",
        "280 Madison Ave (Midtown)",
        "678 6th Ave (Chelsea)",
        "11 W 42nd St (Midtown)",
        "63 Wall St (Financial District)"
      ]
    }
  },
  {
    "id": "best-bottomless-brunch-lower-manhattan",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T13:58:00Z",
    "title": "Best Bottomless Brunch in Lower Manhattan",
    "category": "New York",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "bars",
      "nightlife",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "From Stone Street to the East Village, downtown does brunch the boozy way. The Lower Manhattan spots for bottomless mimosas and spritzes, ranked by reputation and live Google ratings (May 2026).",
    "defaultSource": "ai",
    "links": {
      "Toro Loco (Financial District)": "https://www.google.com/maps/search/?api=1&query=Toro%20Loco%20Stone%20Street%20Financial%20District%20New%20York",
      "Boqueria (SoHo)": "https://www.google.com/maps/search/?api=1&query=Boqueria%20Soho%20Spring%20St%20New%20York",
      "Poco (East Village)": "https://www.google.com/maps/search/?api=1&query=Poco%20Avenue%20B%20East%20Village%20New%20York",
      "Freemans (Lower East Side)": "https://www.google.com/maps/search/?api=1&query=Freemans%20Restaurant%20Freeman%20Alley%20New%20York",
      "Dudley's (Lower East Side)": "https://www.google.com/maps/search/?api=1&query=Dudleys%2085%20Orchard%20St%20New%20York",
      "Sweet Chick (Lower East Side)": "https://www.google.com/maps/search/?api=1&query=Sweet%20Chick%20Ludlow%20St%20New%20York",
      "Añejo (Tribeca)": "https://www.google.com/maps/search/?api=1&query=Anejo%20Tribeca%20Church%20St%20New%20York",
      "The Mayfly (Lower East Side)": "https://www.google.com/maps/search/?api=1&query=The%20Mayfly%20Lower%20East%20Side%20New%20York",
      "Filé Gumbo Bar (Tribeca)": "https://www.google.com/maps/search/?api=1&query=File%20Gumbo%20Bar%20Tribeca%20New%20York",
      "North Fork (West Village)": "https://www.google.com/maps/search/?api=1&query=North%20Fork%20Bar%20Grill%20West%20Village%20New%20York"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Toro Loco (Financial District)",
          "Boqueria (SoHo)",
          "Poco (East Village)",
          "Freemans (Lower East Side)",
          "Dudley's (Lower East Side)",
          "Sweet Chick (Lower East Side)",
          "Añejo (Tribeca)",
          "The Mayfly (Lower East Side)",
          "Filé Gumbo Bar (Tribeca)",
          "North Fork (West Village)"
        ]
      },
      "google": {
        "label": "Google Maps Ratings (May 2026)",
        "url": "https://www.google.com/maps/search/bottomless+brunch+lower+manhattan",
        "items": [
          "Boqueria (SoHo)",
          "Toro Loco (Financial District)",
          "The Mayfly (Lower East Side)",
          "Freemans (Lower East Side)",
          "Dudley's (Lower East Side)",
          "Añejo (Tribeca)",
          "Filé Gumbo Bar (Tribeca)",
          "Sweet Chick (Lower East Side)",
          "Poco (East Village)",
          "North Fork (West Village)"
        ]
      },
      "yelp": {
        "label": "Yelp · Best Bottomless Brunch, Lower East Side 2025 (unranked)",
        "url": "https://www.yelp.com/search?find_desc=bottomless+brunch&find_loc=Lower+East+Side%2C+Manhattan%2C+NY",
        "items": [
          "Dudley's (Lower East Side)",
          "The Mayfly (Lower East Side)",
          "Freemans (Lower East Side)",
          "Sweet Chick (Lower East Side)"
        ],
        "unordered": true
      }
    },
    "vote": {
      "items": [
        "Toro Loco (Financial District)",
        "Boqueria (SoHo)",
        "Poco (East Village)",
        "Freemans (Lower East Side)",
        "Dudley's (Lower East Side)",
        "Sweet Chick (Lower East Side)",
        "Añejo (Tribeca)",
        "The Mayfly (Lower East Side)",
        "Filé Gumbo Bar (Tribeca)",
        "North Fork (West Village)"
      ]
    }
  },
  {
    "id": "best-sushi-in-tokyo",
    "publishedDate": "2026-05-30",
    "publishedAt": "2026-05-30T23:06:50Z",
    "title": "Best Sushi in Tokyo",
    "category": "Tokyo",
    "type": "food",
    "tags": [
      "food",
      "food-drink",
      "stores",
      "travel",
      "luxury"
    ],
    "linkType": "mapsCity",
    "blurb": "Pristine Edomae technique, premium seafood, and intimate counter service. Tokyo's best sushi spans legendary three-star establishments and overlooked neighborhood gems.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Sushi Saito (Ginza)",
          "Harutaka (Ginza)",
          "Udatsu Sushi (Nakameguro)",
          "Kanesaka (Ginza)",
          "Yoshino Sushi Honten (Nihonbashi)",
          "Kobikicho Tomoki (Ginza)",
          "Sushi Murase (Roppongi)",
          "Nishiazabu Sushi Shin (Nishiazabu)",
          "Sushi Rin (Kagurazaka)",
          "Ichikawa (Setagaya)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation Tokyo · Sushi 2025",
        "url": "https://www.theinfatuation.com/tokyo/cuisines/sushi",
        "items": [
          "Udatsu Sushi (Nakameguro)",
          "Yoshino Sushi Honten (Nihonbashi)",
          "Sushi Murase (Roppongi)",
          "Sushi Rin (Kagurazaka)",
          "Mawashizushi Katsu (Meguro)",
          "Sushi Ishii (Akasaka)",
          "Ikina Sushidokoro Abe (Toranomon)",
          "Magurodonya Miura Misakiko (Ueno)",
          "Sushi Anjo (Nishi-Azabu)",
          "Umi (Minami-Aoyama)"
        ]
      },
      "michelin": {
        "label": "Michelin Guide Tokyo 2025-2026 · Sushi Restaurants",
        "url": "https://guide.michelin.com/en/jp/tokyo-region/restaurants/sushi",
        "items": [
          "Sushi Saito (Ginza)",
          "Harutaka (Ginza)",
          "Kanesaka (Ginza)",
          "Kobikicho Tomoki (Ginza)",
          "Nishiazabu Sushi Shin (Nishiazabu)",
          "Umi (Minami-Aoyama)",
          "Sushi Murase (Roppongi)",
          "Sushi Rin (Kagurazaka)"
        ],
        "unordered": true
      },
      "timeout": {
        "label": "Time Out Tokyo · Best Sushi for Every Budget 2026",
        "url": "https://www.timeout.com/tokyo/restaurants/best-sushi-in-tokyo-10-top-picks",
        "items": [
          "Ichikawa (Setagaya)",
          "Udatsu Sushi (Nakameguro)",
          "Sushi Tokyo Ten Shibuya (Shibuya)",
          "Sushi Restaurant Issekisancho (Shinbashi)",
          "Uogashi Nihon-Ichi (Shibuya)",
          "Yoshino Sushi Honten (Nihonbashi)",
          "Sushi Dai (Toyosu)",
          "Toriton (Oshiage)"
        ],
        "unordered": true
      },
      "tabelog": {
        "label": "Tabelog Gold 2026 · Tokyo Sushi",
        "url": "https://award.tabelog.com/en",
        "items": [
          "Sushi Saito (Ginza)",
          "Nihonbashi Kakigaracho Sugita (Nihonbashi)",
          "Higashiazabu Amamoto (Higashi-Azabu)",
          "Mitani (Yotsuya)",
          "Namba (Hibiya)",
          "Sushi Arai (Ginza)"
        ],
        "unordered": true
      }
    },
    "vote": {
      "items": [
        "Sushi Saito (Ginza)",
        "Harutaka (Ginza)",
        "Udatsu Sushi (Nakameguro)",
        "Kanesaka (Ginza)",
        "Yoshino Sushi Honten (Nihonbashi)",
        "Sushi Murase (Roppongi)",
        "Ichikawa (Setagaya)",
        "Sushi Rin (Kagurazaka)",
        "Umi (Minami-Aoyama)",
        "Nishiazabu Sushi Shin (Nishiazabu)"
      ]
    },
    "links": {
      "Sushi Saito (Ginza)": "https://www.google.com/maps/search/?api=1&query=Sushi%20Saito%20Ginza%20Tokyo",
      "Harutaka (Ginza)": "https://www.google.com/maps/search/?api=1&query=Harutaka%20Ginza%20Tokyo",
      "Udatsu Sushi (Nakameguro)": "https://www.google.com/maps/search/?api=1&query=Udatsu%20Sushi%20Nakameguro%20Tokyo",
      "Kanesaka (Ginza)": "https://www.google.com/maps/search/?api=1&query=Kanesaka%20Ginza%20Tokyo",
      "Yoshino Sushi Honten (Nihonbashi)": "https://www.google.com/maps/search/?api=1&query=Yoshino%20Sushi%20Honten%20Nihonbashi%20Tokyo",
      "Kobikicho Tomoki (Ginza)": "https://www.google.com/maps/search/?api=1&query=Kobikicho%20Tomoki%20Ginza%20Tokyo",
      "Sushi Murase (Roppongi)": "https://www.google.com/maps/search/?api=1&query=Sushi%20Murase%20Roppongi%20Tokyo",
      "Nishiazabu Sushi Shin (Nishiazabu)": "https://www.google.com/maps/search/?api=1&query=Nishiazabu%20Sushi%20Shin%20Tokyo",
      "Sushi Rin (Kagurazaka)": "https://www.google.com/maps/search/?api=1&query=Sushi%20Rin%20Kagurazaka%20Tokyo",
      "Ichikawa (Setagaya)": "https://www.google.com/maps/search/?api=1&query=Ichikawa%20Setagaya%20Tokyo",
      "Mawashizushi Katsu (Meguro)": "https://www.google.com/maps/search/?api=1&query=Mawashizushi%20Katsu%20Meguro%20Tokyo",
      "Sushi Ishii (Akasaka)": "https://www.google.com/maps/search/?api=1&query=Sushi%20Ishii%20Akasaka%20Tokyo",
      "Ikina Sushidokoro Abe (Toranomon)": "https://www.google.com/maps/search/?api=1&query=Ikina%20Sushidokoro%20Abe%20Toranomon%20Tokyo",
      "Magurodonya Miura Misakiko (Ueno)": "https://www.google.com/maps/search/?api=1&query=Magurodonya%20Miura%20Misakiko%20Ueno%20Tokyo",
      "Sushi Anjo (Nishi-Azabu)": "https://www.google.com/maps/search/?api=1&query=Sushi%20Anjo%20Nishi-Azabu%20Tokyo",
      "Umi (Minami-Aoyama)": "https://www.google.com/maps/search/?api=1&query=Umi%20sushi%20Minami-Aoyama%20Tokyo",
      "Sushi Tokyo Ten Shibuya (Shibuya)": "https://www.google.com/maps/search/?api=1&query=Sushi%20Tokyo%20Ten%20Shibuya%20Tokyo",
      "Sushi Restaurant Issekisancho (Shinbashi)": "https://www.google.com/maps/search/?api=1&query=Sushi%20Issekisancho%20Shinbashi%20Tokyo",
      "Uogashi Nihon-Ichi (Shibuya)": "https://www.google.com/maps/search/?api=1&query=Uogashi%20Nihon-Ichi%20Shibuya%20Tokyo",
      "Sushi Dai (Toyosu)": "https://www.google.com/maps/search/?api=1&query=Sushi%20Dai%20Toyosu%20Tokyo",
      "Toriton (Oshiage)": "https://www.google.com/maps/search/?api=1&query=Toriton%20Oshiage%20Tokyo",
      "Nihonbashi Kakigaracho Sugita (Nihonbashi)": "https://www.google.com/maps/search/?api=1&query=Nihonbashi%20Kakigaracho%20Sugita%20Tokyo",
      "Higashiazabu Amamoto (Higashi-Azabu)": "https://www.google.com/maps/search/?api=1&query=Higashiazabu%20Amamoto%20Tokyo",
      "Mitani (Yotsuya)": "https://www.google.com/maps/search/?api=1&query=Mitani%20sushi%20Yotsuya%20Tokyo",
      "Namba (Hibiya)": "https://www.google.com/maps/search/?api=1&query=Namba%20sushi%20Hibiya%20Tokyo",
      "Sushi Arai (Ginza)": "https://www.google.com/maps/search/?api=1&query=Sushi%20Arai%20Ginza%20Tokyo"
    }
  },
  {
    "id": "best-red-light-therapy-mask",
    "publishedDate": "2026-05-31",
    "publishedAt": "2026-05-31T03:06:00Z",
    "title": "Best Red Light Therapy Masks",
    "category": "Skincare",
    "type": "product",
    "tags": [
      "product",
      "tech"
    ],
    "linkType": "amazon",
    "blurb": "At-home LED light therapy went mainstream, and the field is crowded. These are the red light masks dermatologists, beauty editors, and Amazon buyers keep coming back to, led by Omnilux's medical-grade silicone and Dr. Dennis Gross's three-minute gold standard.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Omnilux Contour Face",
          "Dr. Dennis Gross DRx SpectraLite FaceWare Pro",
          "CurrentBody Skin LED Face Mask Series 2",
          "Shark CryoGlow LED Face Mask",
          "HigherDOSE Red Light Face Mask",
          "Solawave Wrinkle Retreat Pro LED Face Mask",
          "TheraFace Mask (Therabody)",
          "iRESTORE Illumina Face Mask",
          "MZ Skin LightMAX Supercharged LED Mask 2.0",
          "Sun Home Radiant Face Mask"
        ]
      },
      "marieclaire": {
        "label": "Marie Claire · 14 Best LED Masks (Tested)",
        "url": "https://www.marieclaire.com/beauty/g32894063/led-light-therapy-masks/",
        "items": [
          "Dr. Dennis Gross DRx SpectraLite FaceWare Pro",
          "Shark CryoGlow LED Face Mask",
          "Omnilux Contour Face",
          "MZ Skin LightMAX Supercharged LED Mask 2.0",
          "Shani Darden by Déesse Pro LED Light Mask",
          "CurrentBody Skin LED Face Mask Series 2",
          "TheraFace Mask (Therabody)",
          "HigherDOSE Red Light Face Mask",
          "The Light Salon Boost LED Mask"
        ]
      },
      "fortune": {
        "label": "Fortune · Best Red Light Therapy Masks 2026",
        "url": "https://fortune.com/article/best-red-light-therapy-mask/",
        "items": [
          "Sun Home Radiant Face Mask",
          "Omnilux Contour Face",
          "HigherDOSE Red Light Face Mask",
          "iRESTORE Illumina Face Mask",
          "Solawave Wrinkle Retreat Pro LED Face Mask"
        ]
      },
      "wareable": {
        "label": "Wareable · Best Red Light Therapy Masks 2026 (Tested)",
        "url": "https://www.wareable.com/health-tech/best-red-light-therapy-mask",
        "items": [
          "Omnilux Contour Face",
          "Infraredi LED Light Therapy Mask"
        ]
      },
      "amazonreviews": {
        "label": "Amazon Reviews · Ranked by Rating (May 2026)",
        "url": "https://www.amazon.com/s?k=red+light+therapy+mask&tag=cgurus-20",
        "items": [
          "Dr. Dennis Gross DRx SpectraLite FaceWare Pro",
          "CurrentBody Skin LED Face Mask Series 2",
          "Solawave Wrinkle Retreat Pro LED Face Mask",
          "TheraFace Mask (Therabody)"
        ]
      }
    },
    "vote": {
      "items": [
        "Omnilux Contour Face",
        "Dr. Dennis Gross DRx SpectraLite FaceWare Pro",
        "CurrentBody Skin LED Face Mask Series 2",
        "Shark CryoGlow LED Face Mask",
        "HigherDOSE Red Light Face Mask",
        "Solawave Wrinkle Retreat Pro LED Face Mask",
        "TheraFace Mask (Therabody)",
        "iRESTORE Illumina Face Mask",
        "MZ Skin LightMAX Supercharged LED Mask 2.0",
        "Sun Home Radiant Face Mask"
      ]
    }
  },
  {
    "id": "best-daniel-day-lewis-movies",
    "publishedDate": "2026-05-31",
    "publishedAt": "2026-05-31T03:26:30Z",
    "title": "Best Daniel Day-Lewis Movies",
    "category": "Film",
    "type": "entertainment",
    "tags": [
      "entertainment"
    ],
    "linkType": "imdb",
    "blurb": "Three Best Actor Oscars and a near-mythical commitment to every role. From the oil-soaked fury of There Will Be Blood to the quiet command of Lincoln, the small but towering filmography of cinema's most exacting actor, by consensus.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "There Will Be Blood",
          "My Left Foot",
          "Lincoln",
          "Gangs of New York",
          "The Last of the Mohicans",
          "Phantom Thread",
          "In the Name of the Father",
          "The Age of Innocence",
          "My Beautiful Laundrette",
          "The Boxer"
        ]
      },
      "rottentomatoes": {
        "label": "Rotten Tomatoes · Ranked by Tomatometer",
        "url": "https://editorial.rottentomatoes.com/guide/daniel-day-lewis/",
        "items": [
          "My Left Foot",
          "My Beautiful Laundrette",
          "In the Name of the Father",
          "Phantom Thread",
          "There Will Be Blood",
          "Lincoln",
          "The Last of the Mohicans",
          "The Age of Innocence",
          "The Boxer",
          "Gangs of New York"
        ]
      },
      "indiewire": {
        "label": "IndieWire · The 10 Best Daniel Day-Lewis Movies",
        "url": "https://www.indiewire.com/lists/best-daniel-day-lewis-movies/",
        "items": [
          "Phantom Thread",
          "There Will Be Blood",
          "The Age of Innocence",
          "Lincoln",
          "My Beautiful Laundrette",
          "Gangs of New York",
          "The Last of the Mohicans",
          "My Left Foot",
          "The Unbearable Lightness of Being",
          "A Room with a View"
        ]
      }
    },
    "vote": {
      "items": [
        "There Will Be Blood",
        "My Left Foot",
        "Lincoln",
        "Gangs of New York",
        "The Last of the Mohicans",
        "Phantom Thread",
        "In the Name of the Father",
        "The Age of Innocence",
        "My Beautiful Laundrette",
        "The Boxer"
      ]
    }
  },
  {
    "id": "best-tom-cruise-movies",
    "publishedDate": "2026-05-31",
    "publishedAt": "2026-05-31T03:27:30Z",
    "title": "Best Tom Cruise Movies",
    "category": "Film",
    "type": "entertainment",
    "tags": [
      "entertainment"
    ],
    "linkType": "imdb",
    "blurb": "The last true movie star, running flat-out for four decades. From Maverick and Ethan Hunt's death-defying stunts to the dramatic heights of Magnolia and Born on the Fourth of July, Tom Cruise's best films, by consensus.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Top Gun: Maverick",
          "Magnolia",
          "Eyes Wide Shut",
          "Jerry Maguire",
          "A Few Good Men",
          "Minority Report",
          "Edge of Tomorrow",
          "Rain Man",
          "Mission: Impossible - Fallout",
          "Mission: Impossible - Rogue Nation"
        ]
      },
      "rottentomatoes": {
        "label": "Rotten Tomatoes · Ranked by Tomatometer",
        "url": "https://editorial.rottentomatoes.com/guide/all-tom-cruise-movies-ranked/",
        "items": [
          "Mission: Impossible - Fallout",
          "Top Gun: Maverick",
          "Mission: Impossible - Rogue Nation",
          "Mission: Impossible - Ghost Protocol",
          "Risky Business",
          "Edge of Tomorrow",
          "Minority Report",
          "Rain Man",
          "The Color of Money",
          "Collateral",
          "Born on the Fourth of July",
          "A Few Good Men",
          "Jerry Maguire",
          "Magnolia"
        ]
      },
      "empire": {
        "label": "Empire · Tom Cruise's 10 Best Movies Ranked",
        "url": "https://www.empireonline.com/movies/features/tom-cruise-best-movies/",
        "items": [
          "Jerry Maguire",
          "Edge of Tomorrow",
          "Magnolia",
          "A Few Good Men",
          "Mission: Impossible - Fallout",
          "Top Gun: Maverick",
          "Collateral",
          "The Color of Money",
          "Minority Report",
          "Mission: Impossible"
        ]
      },
      "manofmany": {
        "label": "Man of Many · 20 Best Tom Cruise Movies Ranked (2025)",
        "url": "https://manofmany.com/entertainment/movies-tv/best-tom-cruise-movies-ranked",
        "items": [
          "Eyes Wide Shut",
          "Magnolia",
          "Top Gun: Maverick",
          "A Few Good Men",
          "The Last Samurai",
          "Minority Report",
          "The Color of Money",
          "War of the Worlds",
          "Tropic Thunder",
          "The Firm",
          "Edge of Tomorrow",
          "Mission: Impossible",
          "Valkyrie",
          "Top Gun",
          "Born on the Fourth of July",
          "Rain Man",
          "Vanilla Sky",
          "Jerry Maguire",
          "Risky Business",
          "Days of Thunder"
        ]
      },
      "themanual": {
        "label": "The Manual · The 13 Best Tom Cruise Movies, Ranked (2026)",
        "url": "https://www.themanual.com/culture/best-tom-cruise-movies-ranked/",
        "items": [
          "Rain Man",
          "Jerry Maguire",
          "Top Gun: Maverick",
          "Eyes Wide Shut",
          "Mission: Impossible - Rogue Nation",
          "Born on the Fourth of July",
          "Tropic Thunder",
          "War of the Worlds",
          "Magnolia",
          "The Firm",
          "Vanilla Sky",
          "Jack Reacher",
          "Minority Report"
        ]
      },
      "digitaltrends": {
        "label": "Digital Trends · 10 Best Tom Cruise Movies, Ranked (2025)",
        "url": "https://www.digitaltrends.com/movies/tom-cruise-best-movies-ranked/",
        "items": [
          "Eyes Wide Shut",
          "A Few Good Men",
          "Magnolia",
          "Minority Report",
          "Collateral",
          "Tropic Thunder",
          "Jerry Maguire",
          "Rain Man",
          "Edge of Tomorrow",
          "Top Gun: Maverick"
        ]
      }
    },
    "vote": {
      "items": [
        "Top Gun: Maverick",
        "Magnolia",
        "Eyes Wide Shut",
        "Jerry Maguire",
        "A Few Good Men",
        "Minority Report",
        "Edge of Tomorrow",
        "Rain Man",
        "Mission: Impossible - Fallout",
        "Mission: Impossible - Rogue Nation"
      ]
    }
  },
  {
    "id": "best-resorts-bali",
    "publishedDate": "2026-05-31",
    "publishedAt": "2026-05-31T04:18:59Z",
    "title": "Best Resorts in Bali",
    "category": "Bali",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "Clifftop villas above the Indian Ocean, riverside pavilions deep in the Ubud jungle, and butler-served pool suites on Nusa Dua's white sand. Bali's most acclaimed luxury resorts, by consensus.",
    "defaultSource": "ai",
    "links": {
      "Alila Villas Uluwatu (Uluwatu)": "https://www.google.com/maps/search/?api=1&query=Alila%20Villas%20Uluwatu%20Bali",
      "COMO Shambhala Estate (Ubud)": "https://www.google.com/maps/search/?api=1&query=COMO%20Shambhala%20Estate%20Ubud%20Bali",
      "Soori Bali (Tabanan)": "https://www.google.com/maps/search/?api=1&query=Soori%20Bali%20Tabanan",
      "Amankila (Manggis)": "https://www.google.com/maps/search/?api=1&query=Amankila%20Manggis%20Bali",
      "The Mulia (Nusa Dua)": "https://www.google.com/maps/search/?api=1&query=The%20Mulia%20Nusa%20Dua%20Bali",
      "Four Seasons Resort Bali at Jimbaran Bay (Jimbaran)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Resort%20Bali%20at%20Jimbaran%20Bay",
      "Buahan, a Banyan Tree Escape (Ubud)": "https://www.google.com/maps/search/?api=1&query=Buahan%20a%20Banyan%20Tree%20Escape%20Ubud%20Bali",
      "Mandapa, a Ritz-Carlton Reserve (Ubud)": "https://www.google.com/maps/search/?api=1&query=Mandapa%20a%20Ritz-Carlton%20Reserve%20Ubud%20Bali",
      "Bvlgari Resort Bali (Uluwatu)": "https://www.google.com/maps/search/?api=1&query=Bvlgari%20Resort%20Bali%20Uluwatu",
      "Four Seasons Resort Bali at Sayan (Ubud)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Resort%20Bali%20at%20Sayan%20Ubud",
      "Amanusa (Nusa Dua)": "https://www.google.com/maps/search/?api=1&query=Amanusa%20Nusa%20Dua%20Bali",
      "Capella Ubud (Ubud)": "https://www.google.com/maps/search/?api=1&query=Capella%20Ubud%20Bali",
      "Raffles Bali (Jimbaran)": "https://www.google.com/maps/search/?api=1&query=Raffles%20Bali%20Jimbaran",
      "Amandari (Ubud)": "https://www.google.com/maps/search/?api=1&query=Amandari%20Ubud%20Bali",
      "Viceroy Bali (Ubud)": "https://www.google.com/maps/search/?api=1&query=Viceroy%20Bali%20Ubud",
      "Jumeirah Bali (Uluwatu)": "https://www.google.com/maps/search/?api=1&query=Jumeirah%20Bali%20Uluwatu",
      "The Legian Bali (Seminyak)": "https://www.google.com/maps/search/?api=1&query=The%20Legian%20Bali%20Seminyak",
      "Alila Seminyak (Seminyak)": "https://www.google.com/maps/search/?api=1&query=Alila%20Seminyak%20Bali",
      "The St. Regis Bali Resort (Nusa Dua)": "https://www.google.com/maps/search/?api=1&query=The%20St.%20Regis%20Bali%20Resort%20Nusa%20Dua",
      "The Apurva Kempinski Bali (Nusa Dua)": "https://www.google.com/maps/search/?api=1&query=The%20Apurva%20Kempinski%20Bali%20Nusa%20Dua",
      "InterContinental Bali Sanur Resort (Sanur)": "https://www.google.com/maps/search/?api=1&query=InterContinental%20Bali%20Sanur%20Resort",
      "Andaz Bali (Sanur)": "https://www.google.com/maps/search/?api=1&query=Andaz%20Bali%20Sanur",
      "The Oberoi Beach Resort Bali (Seminyak)": "https://www.google.com/maps/search/?api=1&query=The%20Oberoi%20Beach%20Resort%20Bali%20Seminyak",
      "Jimbaran Puri (Jimbaran)": "https://www.google.com/maps/search/?api=1&query=Jimbaran%20Puri%20Bali",
      "Hanging Gardens of Bali (Ubud)": "https://www.google.com/maps/search/?api=1&query=Hanging%20Gardens%20of%20Bali%20Ubud",
      "Alila Ubud (Ubud)": "https://www.google.com/maps/search/?api=1&query=Alila%20Ubud%20Bali",
      "The Bale (Nusa Dua)": "https://www.google.com/maps/search/?api=1&query=The%20Bale%20Nusa%20Dua%20Bali",
      "Desa Potato Head (Seminyak)": "https://www.google.com/maps/search/?api=1&query=Desa%20Potato%20Head%20Seminyak%20Bali",
      "Bisma Eight (Ubud)": "https://www.google.com/maps/search/?api=1&query=Bisma%20Eight%20Ubud%20Bali",
      "Samsara Ubud (Ubud)": "https://www.google.com/maps/search/?api=1&query=Samsara%20Ubud%20Bali",
      "Ayana Resort Bali (Jimbaran)": "https://www.google.com/maps/search/?api=1&query=Ayana%20Resort%20Bali%20Jimbaran",
      "COMO Uma Ubud (Ubud)": "https://www.google.com/maps/search/?api=1&query=COMO%20Uma%20Ubud%20Bali"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Alila Villas Uluwatu (Uluwatu)",
          "COMO Shambhala Estate (Ubud)",
          "Amankila (Manggis)",
          "Soori Bali (Tabanan)",
          "Capella Ubud (Ubud)",
          "The Mulia (Nusa Dua)",
          "Bvlgari Resort Bali (Uluwatu)",
          "Mandapa, a Ritz-Carlton Reserve (Ubud)",
          "Four Seasons Resort Bali at Jimbaran Bay (Jimbaran)",
          "Four Seasons Resort Bali at Sayan (Ubud)"
        ]
      },
      "lte": {
        "label": "The Luxury Travel Expert · Top 10 Best Luxury Resorts in Bali (2025)",
        "url": "https://theluxurytravelexpert.com/best-luxury-resorts-bali/",
        "items": [
          "Alila Villas Uluwatu (Uluwatu)",
          "COMO Shambhala Estate (Ubud)",
          "Soori Bali (Tabanan)",
          "Amankila (Manggis)",
          "The Mulia (Nusa Dua)",
          "Four Seasons Resort Bali at Jimbaran Bay (Jimbaran)",
          "Buahan, a Banyan Tree Escape (Ubud)",
          "Mandapa, a Ritz-Carlton Reserve (Ubud)",
          "Bvlgari Resort Bali (Uluwatu)",
          "Four Seasons Resort Bali at Sayan (Ubud)"
        ]
      },
      "tripcom": {
        "label": "Trip.com · Top 10 Luxury Hotels in Bali (2026)",
        "url": "https://www.trip.com/hot/top-10-bali-hotels/",
        "items": [
          "Amanusa (Nusa Dua)",
          "Bvlgari Resort Bali (Uluwatu)",
          "Mandapa, a Ritz-Carlton Reserve (Ubud)",
          "Amankila (Manggis)",
          "Capella Ubud (Ubud)",
          "Raffles Bali (Jimbaran)",
          "Soori Bali (Tabanan)",
          "Amandari (Ubud)",
          "Buahan, a Banyan Tree Escape (Ubud)",
          "Four Seasons Resort Bali at Sayan (Ubud)"
        ]
      },
      "honeycombers": {
        "label": "Honeycombers Bali · 16 Best Luxury Hotels (by area, 2026)",
        "url": "https://thehoneycombers.com/bali/luxury-hotels-resorts-in-bali/",
        "unordered": true,
        "items": [
          "Mandapa, a Ritz-Carlton Reserve (Ubud)",
          "Four Seasons Resort Bali at Sayan (Ubud)",
          "COMO Shambhala Estate (Ubud)",
          "Capella Ubud (Ubud)",
          "Viceroy Bali (Ubud)",
          "Alila Villas Uluwatu (Uluwatu)",
          "Jumeirah Bali (Uluwatu)",
          "Bvlgari Resort Bali (Uluwatu)",
          "Four Seasons Resort Bali at Jimbaran Bay (Jimbaran)",
          "The Legian Bali (Seminyak)",
          "Alila Seminyak (Seminyak)",
          "The St. Regis Bali Resort (Nusa Dua)",
          "The Apurva Kempinski Bali (Nusa Dua)",
          "The Mulia (Nusa Dua)",
          "InterContinental Bali Sanur Resort (Sanur)",
          "Andaz Bali (Sanur)"
        ]
      },
      "hotelguru": {
        "label": "The Hotel Guru · 20 Best 5-Star Luxury Hotels in Bali (unordered roundup, 2025)",
        "url": "https://www.thehotelguru.com/best-hotels/indonesia/bali-best-luxury-resort-hotels",
        "unordered": true,
        "items": [
          "The Oberoi Beach Resort Bali (Seminyak)",
          "Jimbaran Puri (Jimbaran)",
          "COMO Shambhala Estate (Ubud)",
          "Soori Bali (Tabanan)",
          "Alila Villas Uluwatu (Uluwatu)",
          "Four Seasons Resort Bali at Jimbaran Bay (Jimbaran)",
          "Hanging Gardens of Bali (Ubud)",
          "Alila Ubud (Ubud)",
          "The Bale (Nusa Dua)",
          "The Legian Bali (Seminyak)",
          "The Mulia (Nusa Dua)",
          "Four Seasons Resort Bali at Sayan (Ubud)",
          "Desa Potato Head (Seminyak)",
          "Bisma Eight (Ubud)",
          "Viceroy Bali (Ubud)",
          "Samsara Ubud (Ubud)",
          "Ayana Resort Bali (Jimbaran)",
          "Amankila (Manggis)",
          "Capella Ubud (Ubud)",
          "COMO Uma Ubud (Ubud)"
        ]
      }
    },
    "vote": {
      "items": [
        "Alila Villas Uluwatu (Uluwatu)",
        "COMO Shambhala Estate (Ubud)",
        "Amankila (Manggis)",
        "Soori Bali (Tabanan)",
        "Capella Ubud (Ubud)",
        "The Mulia (Nusa Dua)",
        "Bvlgari Resort Bali (Uluwatu)",
        "Mandapa, a Ritz-Carlton Reserve (Ubud)",
        "Four Seasons Resort Bali at Jimbaran Bay (Jimbaran)",
        "Four Seasons Resort Bali at Sayan (Ubud)"
      ]
    }
  },
  {
    "id": "best-canned-seltzer-waters",
    "publishedDate": "2026-05-31",
    "publishedAt": "2026-05-31T12:24:50Z",
    "title": "Best Canned Seltzer Waters",
    "category": "Seltzer",
    "type": "product",
    "tags": [
      "product",
      "food-drink",
      "other"
    ],
    "linkType": "amazon",
    "blurb": "Real-fruit fizz, zero sugar, and a cult following in every office fridge. The canned sparkling waters and seltzers worth buying by the case, ranked by taste-test consensus.",
    "defaultSource": "ai",
    "links": {
      "Spindrift": "https://www.amazon.com/s?k=Spindrift+sparkling+water&tag=cgurus-20",
      "LaCroix": "https://www.amazon.com/s?k=LaCroix+sparkling+water&tag=cgurus-20",
      "Waterloo": "https://www.amazon.com/s?k=Waterloo+sparkling+water&tag=cgurus-20",
      "Bubly": "https://www.amazon.com/s?k=Bubly+sparkling+water&tag=cgurus-20",
      "AHA": "https://www.amazon.com/s?k=AHA+sparkling+water&tag=cgurus-20",
      "Aura Bora": "https://www.amazon.com/s?k=Aura+Bora+sparkling+water&tag=cgurus-20",
      "Sanzo": "https://www.amazon.com/s?k=Sanzo+sparkling+water&tag=cgurus-20",
      "Nixie": "https://www.amazon.com/s?k=Nixie+sparkling+water&tag=cgurus-20",
      "Polar Seltzer": "https://www.amazon.com/s?k=Polar+Seltzer+sparkling+water&tag=cgurus-20",
      "Perrier": "https://www.amazon.com/s?k=Perrier+sparkling+water&tag=cgurus-20",
      "Liquid Death": "https://www.amazon.com/s?k=Liquid+Death+sparkling+water&tag=cgurus-20",
      "San Pellegrino": "https://www.amazon.com/s?k=San+Pellegrino+sparkling+water&tag=cgurus-20"
    },
    "sources": {
      "ai": {
        "label": "Consensus Seed",
        "items": [
          "Spindrift",
          "Waterloo",
          "LaCroix",
          "Bubly",
          "Perrier",
          "AHA",
          "Sanzo",
          "Polar Seltzer",
          "Liquid Death",
          "Nixie"
        ]
      },
      "studyfinds": {
        "label": "StudyFinds · Best Seltzers, consensus of 9 expert sites (2024)",
        "url": "https://studyfinds.org/best-seltzers/",
        "items": [
          "Spindrift",
          "LaCroix",
          "Waterloo",
          "Bubly",
          "AHA",
          "Aura Bora"
        ]
      },
      "sporked": {
        "label": "Sporked · Best Sparkling Water and Seltzer Taste Test (2024)",
        "url": "https://sporked.com/article/best-seltzer/",
        "items": [
          "Spindrift",
          "Sanzo",
          "Waterloo",
          "Nixie",
          "Bubly",
          "LaCroix",
          "Polar Seltzer"
        ]
      },
      "uproxx": {
        "label": "Uproxx · 18 Flavored Sparkling Waters Blind Taste Test (2023)",
        "url": "https://uproxx.com/life/best-sparkling-waters-blind-taste-test/",
        "items": [
          "Waterloo",
          "Perrier",
          "Liquid Death",
          "LaCroix",
          "AHA",
          "Spindrift",
          "Polar Seltzer",
          "Bubly"
        ]
      },
      "mashed": {
        "label": "Mashed · Sparkling Water Brands Ranked Worst to Best (2023)",
        "url": "https://www.mashed.com/289244/sparkling-water-brands-ranked-worst-to-best/",
        "items": [
          "Bubly",
          "LaCroix",
          "Spindrift",
          "Perrier",
          "San Pellegrino",
          "Waterloo"
        ]
      }
    },
    "vote": {
      "items": [
        "Spindrift",
        "Waterloo",
        "LaCroix",
        "Bubly",
        "Perrier",
        "AHA",
        "Sanzo",
        "Polar Seltzer",
        "Liquid Death",
        "Nixie"
      ]
    }
  },
  {
    id: 'best-breakfast-sandwiches-boston',
    publishedDate: '2026-05-31',
    publishedAt: '2026-05-31T17:23:03Z',
    title: 'Best Breakfast Sandwiches in Boston',
    category: 'Boston',
    type: 'food',
    tags: ['food', 'food-drink', 'stores'],
    linkType: 'mapsCity',
    blurb: 'Egg on a bagel, brioche, English muffin, or scallion pancake: Boston\'s breakfast sandwich obsession runs deep, from Union Square bakeries to South End morning institutions.',
    defaultSource: 'ai',
    links: {
      "Mike & Patty's (Bay Village, Boston)": 'https://www.google.com/maps/search/?api=1&query=Mike%20Patty%27s%20Bay%20Village%20Boston',
      'Sofra Bakery & Cafe (Cambridge)': 'https://www.google.com/maps/search/?api=1&query=Sofra%20Bakery%20Cafe%20Cambridge',
      'Vinal Bakery (Somerville)': 'https://www.google.com/maps/search/?api=1&query=Vinal%20Bakery%20Somerville',
      'Brassica Kitchen & Cafe (Jamaica Plain, Boston)': 'https://www.google.com/maps/search/?api=1&query=Brassica%20Kitchen%20Cafe%20Jamaica%20Plain%20Boston',
      'Blunch (South End, Boston)': 'https://www.google.com/maps/search/?api=1&query=Blunch%20South%20End%20Boston',
      'Café Beatrice (East Cambridge, Cambridge)': 'https://www.google.com/maps/search/?api=1&query=Caf%C3%A9%20Beatrice%20East%20Cambridge%20Cambridge',
      'Bagelsaurus (Porter Square, Cambridge)': 'https://www.google.com/maps/search/?api=1&query=Bagelsaurus%20Porter%20Square%20Cambridge',
      'Flour Bakery & Cafe (Back Bay, Boston)': 'https://www.google.com/maps/search/?api=1&query=Flour%20Bakery%20Cafe%20Back%20Bay%20Boston',
      'Jadu (Jamaica Plain, Boston)': 'https://www.google.com/maps/search/?api=1&query=Jadu%20Jamaica%20Plain%20Boston',
      'Turenne Bagels (Union Square, Somerville)': 'https://www.google.com/maps/search/?api=1&query=Turenne%20Bagels%20Union%20Square%20Somerville',
      "Sally's Sandwiches (South End, Boston)": 'https://www.google.com/maps/search/?api=1&query=Sally%27s%20Sandwiches%20South%20End%20Boston',
    },
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          "Mike & Patty's (Bay Village, Boston)",
          'Sofra Bakery & Cafe (Cambridge)',
          'Vinal Bakery (Somerville)',
          'Brassica Kitchen & Cafe (Jamaica Plain, Boston)',
          'Blunch (South End, Boston)',
          'Café Beatrice (East Cambridge, Cambridge)',
          'Bagelsaurus (Porter Square, Cambridge)',
          'Flour Bakery & Cafe (Back Bay, Boston)',
          'Jadu (Jamaica Plain, Boston)',
          'Turenne Bagels (Union Square, Somerville)',
        ],
      },
      yelp: {
        label: 'Yelp · Ranked by Rating (May 2026)',
        url: 'https://www.yelp.com/search?find_desc=Breakfast+Sandwich&find_loc=Boston%2C+MA&sortby=rating',
        items: [
          'Vinal Bakery (Somerville)',
          'Brassica Kitchen & Cafe (Jamaica Plain, Boston)',
          "Mike & Patty's (Bay Village, Boston)",
          'Blunch (South End, Boston)',
          'Bagelsaurus (Porter Square, Cambridge)',
          'Sofra Bakery & Cafe (Cambridge)',
        ],
      },
      bostonmag: {
        label: 'Boston Magazine Best Breakfast Sandwiches 2025 (unordered)',
        url: 'https://www.bostonmagazine.com/restaurants/best-breakfast-sandwiches-boston/',
        unordered: true,
        items: [
          'Bagelsaurus (Porter Square, Cambridge)',
          'Blunch (South End, Boston)',
          'Brassica Kitchen & Cafe (Jamaica Plain, Boston)',
          'Café Beatrice (East Cambridge, Cambridge)',
          "Mike & Patty's (Bay Village, Boston)",
          "Sally's Sandwiches (South End, Boston)",
          'Sofra Bakery & Cafe (Cambridge)',
          'Turenne Bagels (Union Square, Somerville)',
          'Vinal Bakery (Somerville)',
        ],
      },
      timeout: {
        label: 'Time Out Boston Best Breakfast 2025',
        url: 'https://www.timeout.com/boston/restaurants/best-breakfast-in-boston',
        items: [
          "Mike & Patty's (Bay Village, Boston)",
          'Flour Bakery & Cafe (Back Bay, Boston)',
          'Sofra Bakery & Cafe (Cambridge)',
          'Jadu (Jamaica Plain, Boston)',
          'Café Beatrice (East Cambridge, Cambridge)',
        ],
      },
    },
    vote: {
      items: [
        "Mike & Patty's (Bay Village, Boston)",
        'Sofra Bakery & Cafe (Cambridge)',
        'Vinal Bakery (Somerville)',
        'Brassica Kitchen & Cafe (Jamaica Plain, Boston)',
        'Blunch (South End, Boston)',
        'Café Beatrice (East Cambridge, Cambridge)',
        'Bagelsaurus (Porter Square, Cambridge)',
        'Flour Bakery & Cafe (Back Bay, Boston)',
        'Jadu (Jamaica Plain, Boston)',
        'Turenne Bagels (Union Square, Somerville)',
      ],
    },
  },

  {
    id: 'best-breweries-austin',
    publishedDate: '2026-05-31',
    publishedAt: '2026-05-31T18:14:24Z',
    title: 'Best Breweries in Austin',
    category: 'Austin',
    type: 'food',
    tags: ['bars', 'food-drink', 'stores', 'entertainment'],
    linkType: 'mapsCity',
    blurb: 'From lager-focused stalwarts in South Austin to wild ale trailblazers in the Hill Country, Austin\'s brewery scene produces world-class beer in every direction.',
    defaultSource: 'ai',
    links: {
      'Meanwhile Brewing (South Austin)': 'https://www.google.com/maps/search/?api=1&query=Meanwhile%20Brewing%20South%20Austin',
      'Oddwood Brewing (East Austin)': 'https://www.google.com/maps/search/?api=1&query=Oddwood%20Brewing%20East%20Austin',
      'Hold Out Brewing (West Austin)': 'https://www.google.com/maps/search/?api=1&query=Hold%20Out%20Brewing%20West%20Austin',
      'Live Oak Brewing (Del Valle)': 'https://www.google.com/maps/search/?api=1&query=Live%20Oak%20Brewing%20Del%20Valle',
      'Zilker Brewing (East Austin)': 'https://www.google.com/maps/search/?api=1&query=Zilker%20Brewing%20East%20Austin',
      'Pinthouse Brewing (North Loop)': 'https://www.google.com/maps/search/?api=1&query=Pinthouse%20Brewing%20North%20Loop',
      'Vista Brewing (Driftwood)': 'https://www.google.com/maps/search/?api=1&query=Vista%20Brewing%20Driftwood',
      'St. Elmo Brewing (South Austin)': 'https://www.google.com/maps/search/?api=1&query=St.%20Elmo%20Brewing%20South%20Austin',
      'The ABGB (South Austin)': 'https://www.google.com/maps/search/?api=1&query=The%20ABGB%20South%20Austin',
      'Jester King Brewery (Dripping Springs)': 'https://www.google.com/maps/search/?api=1&query=Jester%20King%20Brewery%20Dripping%20Springs',
      'Lazarus Brewing (East Austin)': 'https://www.google.com/maps/search/?api=1&query=Lazarus%20Brewing%20East%20Austin',
      'Austin Beerworks (North Loop)': 'https://www.google.com/maps/search/?api=1&query=Austin%20Beerworks%20North%20Loop',
    },
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          'Meanwhile Brewing (South Austin)',
          'Oddwood Brewing (East Austin)',
          'Hold Out Brewing (West Austin)',
          'Live Oak Brewing (Del Valle)',
          'Zilker Brewing (East Austin)',
          'Pinthouse Brewing (North Loop)',
          'Vista Brewing (Driftwood)',
          'St. Elmo Brewing (South Austin)',
          'The ABGB (South Austin)',
          'Jester King Brewery (Dripping Springs)',
        ],
      },
      yelp: {
        label: 'Yelp · Ranked by Rating (May 2026)',
        url: 'https://www.yelp.com/search?cflt=breweries&find_loc=Austin%2C+TX&sortby=rating',
        items: [
          'Meanwhile Brewing (South Austin)',
          'Lazarus Brewing (East Austin)',
          'Zilker Brewing (East Austin)',
          'Pinthouse Brewing (North Loop)',
          'Oddwood Brewing (East Austin)',
          'Hold Out Brewing (West Austin)',
          'The ABGB (South Austin)',
        ],
      },
      austinchronicle: {
        label: 'Austin Chronicle Top of the Hops IX 2024',
        url: 'https://www.austinchronicle.com/food/austins-best-breweries-of-2024-power-ranked-13286523/',
        items: [
          'Meanwhile Brewing (South Austin)',
          'Oddwood Brewing (East Austin)',
          'Hold Out Brewing (West Austin)',
          'St. Elmo Brewing (South Austin)',
          'Live Oak Brewing (Del Valle)',
          'Zilker Brewing (East Austin)',
          'The ABGB (South Austin)',
          'Pinthouse Brewing (North Loop)',
          'Vista Brewing (Driftwood)',
          'Jester King Brewery (Dripping Springs)',
        ],
      },
      craftbeeraustin: {
        label: 'CraftBeerAustin 10 Best Must-Visit Breweries 2025 (unordered)',
        url: 'https://craftbeeraustin.com/10best-breweries-in-austin',
        unordered: true,
        items: [
          'The ABGB (South Austin)',
          'Austin Beerworks (North Loop)',
          'Hold Out Brewing (West Austin)',
          'Jester King Brewery (Dripping Springs)',
          'Live Oak Brewing (Del Valle)',
          'Meanwhile Brewing (South Austin)',
          'Oddwood Brewing (East Austin)',
          'Pinthouse Brewing (North Loop)',
          'Vista Brewing (Driftwood)',
          'Zilker Brewing (East Austin)',
        ],
      },
    },
    vote: {
      items: [
        'Meanwhile Brewing (South Austin)',
        'Oddwood Brewing (East Austin)',
        'Hold Out Brewing (West Austin)',
        'Live Oak Brewing (Del Valle)',
        'Zilker Brewing (East Austin)',
        'Pinthouse Brewing (North Loop)',
        'Vista Brewing (Driftwood)',
        'St. Elmo Brewing (South Austin)',
        'The ABGB (South Austin)',
        'Jester King Brewery (Dripping Springs)',
      ],
    },
  },
  {
    id: 'best-breweries-miami',
    publishedDate: '2026-05-31',
    publishedAt: '2026-05-31T18:14:24Z',
    title: 'Best Breweries in Miami',
    category: 'Miami',
    type: 'food',
    tags: ['bars', 'food-drink', 'stores', 'entertainment'],
    linkType: 'mapsCity',
    blurb: 'From Latin-inspired lagers in Wynwood to experimental sours in Kendall and Doral, Miami\'s brewing scene reflects the city: tropical, eclectic, and relentlessly creative.',
    defaultSource: 'ai',
    links: {
      'Tripping Animals Brewing (Doral)': 'https://www.google.com/maps/search/?api=1&query=Tripping%20Animals%20Brewing%20Doral',
      'No Seasons (Little River)': 'https://www.google.com/maps/search/?api=1&query=No%20Seasons%20Little%20River',
      'Cerveceria La Tropical (Wynwood)': 'https://www.google.com/maps/search/?api=1&query=Cerveceria%20La%20Tropical%20Wynwood',
      'Spanish Marie Brewery (Kendall)': 'https://www.google.com/maps/search/?api=1&query=Spanish%20Marie%20Brewery%20Kendall',
      'Casa La Rubia (Wynwood)': 'https://www.google.com/maps/search/?api=1&query=Casa%20La%20Rubia%20Wynwood',
      'Strange Beast (Kendall)': 'https://www.google.com/maps/search/?api=1&query=Strange%20Beast%20Kendall',
      "Lincoln's Beard Brewing (Bird Road)": 'https://www.google.com/maps/search/?api=1&query=Lincoln%27s%20Beard%20Brewing%20Bird%20Road',
      'Unseen Creatures Brewing (Bird Road)': 'https://www.google.com/maps/search/?api=1&query=Unseen%20Creatures%20Brewing%20Bird%20Road',
      'Biscayne Bay Brewing (Downtown)': 'https://www.google.com/maps/search/?api=1&query=Biscayne%20Bay%20Brewing%20Downtown',
      'M.I.A. Beer Company (Doral)': 'https://www.google.com/maps/search/?api=1&query=M.I.A.%20Beer%20Company%20Doral',
      'Prison Pals Brewing (Doral)': 'https://www.google.com/maps/search/?api=1&query=Prison%20Pals%20Brewing%20Doral',
      'The Tank Brewing (Doral)': 'https://www.google.com/maps/search/?api=1&query=The%20Tank%20Brewing%20Doral',
      'Lost City Brewing (North Miami)': 'https://www.google.com/maps/search/?api=1&query=Lost%20City%20Brewing%20North%20Miami',
    },
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          'Casa La Rubia (Wynwood)',
          'Tripping Animals Brewing (Doral)',
          'The Tank Brewing (Doral)',
          'Prison Pals Brewing (Doral)',
          'M.I.A. Beer Company (Doral)',
          "Lincoln's Beard Brewing (Bird Road)",
          'Spanish Marie Brewery (Kendall)',
          'No Seasons (Little River)',
          'Biscayne Bay Brewing (Downtown)',
          'Lost City Brewing (North Miami)',
        ],
      },
      yelp: {
        label: 'Yelp · Ranked by Rating (May 2026)',
        url: 'https://www.yelp.com/search?cflt=breweries&find_loc=Miami%2C+FL&sortby=rating',
        items: [
          'Spanish Marie Brewery (Kendall)',
          'Casa La Rubia (Wynwood)',
          'Strange Beast (Kendall)',
          'Tripping Animals Brewing (Doral)',
          "Lincoln's Beard Brewing (Bird Road)",
          'Unseen Creatures Brewing (Bird Road)',
        ],
      },
      infatuation: {
        label: 'The Infatuation Miami Best Breweries 2024 (by score)',
        url: 'https://www.theinfatuation.com/miami/guides/best-miami-breweries-with-food',
        items: [
          'Tripping Animals Brewing (Doral)',
          'No Seasons (Little River)',
          'Cerveceria La Tropical (Wynwood)',
          'Strange Beast (Kendall)',
          'Unseen Creatures Brewing (Bird Road)',
        ],
      },
      miaminewtimes: {
        label: 'Miami New Times 10 Best Breweries 2023 (alphabetical)',
        url: 'https://www.miaminewtimes.com/food-drink/miamis-ten-best-breweries-15234977/',
        unordered: true,
        items: [
          'Biscayne Bay Brewing (Downtown)',
          'Lincoln\'s Beard Brewing (Bird Road)',
          'M.I.A. Beer Company (Doral)',
          'Prison Pals Brewing (Doral)',
          'Spanish Marie Brewery (Kendall)',
          'The Tank Brewing (Doral)',
          'Tripping Animals Brewing (Doral)',
          'Casa La Rubia (Wynwood)',
        ],
      },
      hopculture: {
        label: 'Hop Culture 12 Best Miami Breweries 2023 (unordered)',
        url: 'https://www.hopculture.com/best-craft-breweries-miami-florida/',
        unordered: true,
        items: [
          'Tripping Animals Brewing (Doral)',
          'Prison Pals Brewing (Doral)',
          "Lincoln's Beard Brewing (Bird Road)",
          'Unseen Creatures Brewing (Bird Road)',
          'No Seasons (Little River)',
          'Lost City Brewing (North Miami)',
          'The Tank Brewing (Doral)',
          'M.I.A. Beer Company (Doral)',
          'Casa La Rubia (Wynwood)',
        ],
      },
    },
    vote: {
      items: [
        'Casa La Rubia (Wynwood)',
        'Tripping Animals Brewing (Doral)',
        'The Tank Brewing (Doral)',
        'Prison Pals Brewing (Doral)',
        'M.I.A. Beer Company (Doral)',
        "Lincoln's Beard Brewing (Bird Road)",
        'Spanish Marie Brewery (Kendall)',
        'No Seasons (Little River)',
        'Biscayne Bay Brewing (Downtown)',
        'Lost City Brewing (North Miami)',
      ],
    },
  },
  {
    id: 'best-breweries-dallas',
    publishedDate: '2026-05-31',
    publishedAt: '2026-05-31T18:14:24Z',
    title: 'Best Breweries in Dallas',
    category: 'Dallas',
    type: 'food',
    tags: ['bars', 'food-drink', 'stores', 'entertainment'],
    linkType: 'mapsCity',
    blurb: 'Dallas punches above its weight in craft beer, from the technically flawless ales at Peticolas to the hop-forward obsessives at Celestial and the boundary-pushing styles at Vector and Odd Muse.',
    defaultSource: 'ai',
    links: {
      'Celestial Beerworks (Oak Lawn)': 'https://www.google.com/maps/search/?api=1&query=Celestial%20Beerworks%20Oak%20Lawn',
      'Peticolas Brewing (Design District)': 'https://www.google.com/maps/search/?api=1&query=Peticolas%20Brewing%20Design%20District',
      'Outfit Brewing (Northwest Dallas)': 'https://www.google.com/maps/search/?api=1&query=Outfit%20Brewing%20Northwest%20Dallas',
      'Community Beer Co. (Love Field)': 'https://www.google.com/maps/search/?api=1&query=Community%20Beer%20Co.%20Love%20Field',
      'Vector Brewing (Lake Highlands)': 'https://www.google.com/maps/search/?api=1&query=Vector%20Brewing%20Lake%20Highlands',
      'Manhattan Project Beer Co. (Design District)': 'https://www.google.com/maps/search/?api=1&query=Manhattan%20Project%20Beer%20Co.%20Design%20District',
      'Turning Point Beer (Bedford)': 'https://www.google.com/maps/search/?api=1&query=Turning%20Point%20Beer%20Bedford',
      'Lakewood Brewing (Garland)': 'https://www.google.com/maps/search/?api=1&query=Lakewood%20Brewing%20Garland',
      'Four Corners Brewing (South Dallas)': 'https://www.google.com/maps/search/?api=1&query=Four%20Corners%20Brewing%20South%20Dallas',
      'Odd Muse Brewing (Farmers Branch)': 'https://www.google.com/maps/search/?api=1&query=Odd%20Muse%20Brewing%20Farmers%20Branch',
      'Oak Cliff Brewing (Oak Cliff)': 'https://www.google.com/maps/search/?api=1&query=Oak%20Cliff%20Brewing%20Oak%20Cliff',
      'White Rock Alehouse (East Dallas)': 'https://www.google.com/maps/search/?api=1&query=White%20Rock%20Alehouse%20East%20Dallas',
      'Four Bullets Brewery (Richardson)': 'https://www.google.com/maps/search/?api=1&query=Four%20Bullets%20Brewery%20Richardson',
    },
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          'Celestial Beerworks (Oak Lawn)',
          'Peticolas Brewing (Design District)',
          'Outfit Brewing (Northwest Dallas)',
          'Community Beer Co. (Love Field)',
          'Vector Brewing (Lake Highlands)',
          'Manhattan Project Beer Co. (Design District)',
          'Turning Point Beer (Bedford)',
          'Lakewood Brewing (Garland)',
          'Four Corners Brewing (South Dallas)',
          'Odd Muse Brewing (Farmers Branch)',
        ],
      },
      yelp: {
        label: 'Yelp · Ranked by Rating (May 2026)',
        url: 'https://www.yelp.com/search?cflt=breweries&find_loc=Dallas%2C+TX&sortby=rating',
        items: [
          'Celestial Beerworks (Oak Lawn)',
          'Odd Muse Brewing (Farmers Branch)',
          'Peticolas Brewing (Design District)',
          'Oak Cliff Brewing (Oak Cliff)',
          'Four Corners Brewing (South Dallas)',
        ],
      },
      dmagazine: {
        label: 'D Magazine Best Dallas Breweries 2024 (unordered)',
        url: 'https://www.dmagazine.com/guides/our-guide-to-the-best-breweries-in-dallas-fort-worth/',
        unordered: true,
        items: [
          'Peticolas Brewing (Design District)',
          'Vector Brewing (Lake Highlands)',
          'Celestial Beerworks (Oak Lawn)',
          'Odd Muse Brewing (Farmers Branch)',
          'Four Corners Brewing (South Dallas)',
          'Four Bullets Brewery (Richardson)',
          'Manhattan Project Beer Co. (Design District)',
          'Outfit Brewing (Northwest Dallas)',
        ],
      },
      dallasobserver: {
        label: 'Dallas Observer Essential Breweries 2024 (unordered)',
        url: 'https://www.dallasobserver.com/food-drink/best-breweries-dallas-13950038/',
        unordered: true,
        items: [
          'Celestial Beerworks (Oak Lawn)',
          'Community Beer Co. (Love Field)',
          'Four Corners Brewing (South Dallas)',
          'Lakewood Brewing (Garland)',
          'Oak Cliff Brewing (Oak Cliff)',
          'Outfit Brewing (Northwest Dallas)',
          'Peticolas Brewing (Design District)',
          'White Rock Alehouse (East Dallas)',
          'Turning Point Beer (Bedford)',
        ],
      },
      hopculture: {
        label: 'Hop Culture 9 Best Dallas Breweries 2025 (unordered)',
        url: 'https://www.hopculture.com/best-breweries-dallas/',
        unordered: true,
        items: [
          'Celestial Beerworks (Oak Lawn)',
          'Turning Point Beer (Bedford)',
          'Outfit Brewing (Northwest Dallas)',
          'Vector Brewing (Lake Highlands)',
          'Peticolas Brewing (Design District)',
          'Manhattan Project Beer Co. (Design District)',
        ],
      },
    },
    vote: {
      items: [
        'Celestial Beerworks (Oak Lawn)',
        'Peticolas Brewing (Design District)',
        'Outfit Brewing (Northwest Dallas)',
        'Community Beer Co. (Love Field)',
        'Vector Brewing (Lake Highlands)',
        'Manhattan Project Beer Co. (Design District)',
        'Turning Point Beer (Bedford)',
        'Lakewood Brewing (Garland)',
        'Four Corners Brewing (South Dallas)',
        'Odd Muse Brewing (Farmers Branch)',
      ],
    },
  },

  {
    id: 'best-restaurants-seaport-boston',
    publishedDate: '2026-05-31',
    publishedAt: '2026-05-31T18:25:48Z',
    title: "Best Restaurants in Boston's Seaport",
    category: 'Boston',
    type: 'food',
    tags: ['food', 'food-drink', 'stores'],
    linkType: 'mapsCity',
    blurb: 'Warehouses became waterfront dining destinations. From farm-to-table fine dining at Pier 4 to seafood shacks and fusion kitchens, the Seaport is Boston\'s most ambitious neighborhood for restaurants.',
    defaultSource: 'ai',
    links: {
      'Chickadee': 'https://www.google.com/maps/search/?api=1&query=Chickadee%20Boston',
      'Committee': 'https://www.google.com/maps/search/?api=1&query=Committee%20Boston',
      'Woods Hill Pier 4': 'https://www.google.com/maps/search/?api=1&query=Woods%20Hill%20Pier%204%20Boston',
      'Nautilus Pier 4': 'https://www.google.com/maps/search/?api=1&query=Nautilus%20Pier%204%20Boston',
      'Row 34': 'https://www.google.com/maps/search/?api=1&query=Row%2034%20Boston',
      'Empire': 'https://www.google.com/maps/search/?api=1&query=Empire%20Boston',
      'The Smoke Shop BBQ': 'https://www.google.com/maps/search/?api=1&query=The%20Smoke%20Shop%20BBQ%20Boston',
      'Mr. H': 'https://www.google.com/maps/search/?api=1&query=Mr.%20H%20Boston',
      'Yume Ga Arukara': 'https://www.google.com/maps/search/?api=1&query=Yume%20Ga%20Arukara%20Boston',
      'Mooo': 'https://www.google.com/maps/search/?api=1&query=Mooo%20Boston',
      'Nowon': 'https://www.google.com/maps/search/?api=1&query=Nowon%20Boston',
      'Trillium Brewing': 'https://www.google.com/maps/search/?api=1&query=Trillium%20Brewing%20Boston',
      'Yankee Lobster': 'https://www.google.com/maps/search/?api=1&query=Yankee%20Lobster%20Boston',
      'Boqueria': 'https://www.google.com/maps/search/?api=1&query=Boqueria%20Boston',
      'Grace By Nia': 'https://www.google.com/maps/search/?api=1&query=Grace%20By%20Nia%20Boston',
      "Lucky's Lounge": 'https://www.google.com/maps/search/?api=1&query=Lucky%27s%20Lounge%20Boston',
      'Alma Gaucha': 'https://www.google.com/maps/search/?api=1&query=Alma%20Gaucha%20Boston',
      'Legal Harborside': 'https://www.google.com/maps/search/?api=1&query=Legal%20Harborside%20Boston',
      'Lolita Fort Point': 'https://www.google.com/maps/search/?api=1&query=Lolita%20Fort%20Point%20Boston',
      'Limani Grille': 'https://www.google.com/maps/search/?api=1&query=Limani%20Grille%20Boston',
      "Davio's": 'https://www.google.com/maps/search/?api=1&query=Davio%27s%20Boston',
      'Ocean Prime': 'https://www.google.com/maps/search/?api=1&query=Ocean%20Prime%20Boston',
      "Morton's The Steakhouse": 'https://www.google.com/maps/search/?api=1&query=Morton%27s%20The%20Steakhouse%20Boston',
      "Del Frisco's Double Eagle": 'https://www.google.com/maps/search/?api=1&query=Del%20Frisco%27s%20Double%20Eagle%20Boston',
      'Outlook Kitchen': 'https://www.google.com/maps/search/?api=1&query=Outlook%20Kitchen%20Boston',
      'Lola 42': 'https://www.google.com/maps/search/?api=1&query=Lola%2042%20Boston',
      'The Barking Crab': 'https://www.google.com/maps/search/?api=1&query=The%20Barking%20Crab%20Boston',
      'Temazcal': 'https://www.google.com/maps/search/?api=1&query=Temazcal%20Boston',
      'bartaco': 'https://www.google.com/maps/search/?api=1&query=bartaco%20Boston',
      'Aceituna Grill': 'https://www.google.com/maps/search/?api=1&query=Aceituna%20Grill%20Boston',
      'Borrachito': 'https://www.google.com/maps/search/?api=1&query=Borrachito%20Boston',
      'Citrus & Salt': 'https://www.google.com/maps/search/?api=1&query=Citrus%20Salt%20Boston',
      'Coquette': 'https://www.google.com/maps/search/?api=1&query=Coquette%20Boston',
      "Marcelino's": 'https://www.google.com/maps/search/?api=1&query=Marcelino%27s%20Boston',
      'Para Maria': 'https://www.google.com/maps/search/?api=1&query=Para%20Maria%20Boston',
      'Pastoral': 'https://www.google.com/maps/search/?api=1&query=Pastoral%20Boston',
    },
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          'Chickadee',
          'Woods Hill Pier 4',
          'Row 34',
          'Committee',
          'Nautilus Pier 4',
          'Mr. H',
          'Yume Ga Arukara',
          'Empire',
          'The Smoke Shop BBQ',
          'Mooo',
        ],
      },
      yelp: {
        label: 'Yelp · Ranked by Rating (May 2026)',
        url: 'https://www.yelp.com/search?cflt=restaurants&find_loc=Seaport+Boston+MA&sortby=rating',
        items: [
          'Chickadee',
          'Row 34',
          'Woods Hill Pier 4',
        ],
      },
      infatuation: {
        label: 'The Infatuation Boston Seaport & Fort Point Guide 2025 (by score)',
        url: 'https://www.theinfatuation.com/boston/guides/best-seaport-restaurants-boston',
        items: [
          'Chickadee',
          'Woods Hill Pier 4',
          'Row 34',
          'Mr. H',
          'Yume Ga Arukara',
          'Nowon',
          'Nautilus Pier 4',
          'Mooo',
          'Trillium Brewing',
          'Yankee Lobster',
          'Boqueria',
          'Grace By Nia',
          "Lucky's Lounge",
          'Alma Gaucha',
          'Legal Harborside',
        ],
      },
      bostonmag: {
        label: 'Boston Magazine Best Seaport Restaurants 2025 (unordered)',
        url: 'https://www.bostonmagazine.com/restaurants/best-restaurants-in-boston-seaport-and-fort-point/',
        unordered: true,
        items: [
          'Aceituna Grill',
          'The Barking Crab',
          'Borrachito',
          'Chickadee',
          'Citrus & Salt',
          'Committee',
          'Coquette',
          'Empire',
          'Grace By Nia',
          'Legal Harborside',
          "Marcelino's",
          'Mooo',
          'Mr. H',
          'Nautilus Pier 4',
          'Para Maria',
          'Pastoral',
          'Row 34',
          'The Smoke Shop BBQ',
          'Trillium Brewing',
          'Woods Hill Pier 4',
          'Yankee Lobster',
          'Yume Ga Arukara',
        ],
      },
      timeout: {
        label: 'Time Out Boston 19 Best Seaport Restaurants 2024',
        url: 'https://www.timeout.com/boston/restaurants/best-seaport-district-restaurants',
        items: [
          'Chickadee',
          'Committee',
          'Woods Hill Pier 4',
          'Nautilus Pier 4',
          'Row 34',
          'Empire',
          'The Smoke Shop BBQ',
          'Lolita Fort Point',
          'Limani Grille',
          "Davio's",
          'Ocean Prime',
          "Morton's The Steakhouse",
          "Del Frisco's Double Eagle",
          'Outlook Kitchen',
          'Legal Harborside',
          'Lola 42',
          'The Barking Crab',
          'Temazcal',
          'bartaco',
        ],
      },
    },
    vote: {
      items: [
        'Chickadee',
        'Woods Hill Pier 4',
        'Row 34',
        'Committee',
        'Nautilus Pier 4',
        'Mr. H',
        'Yume Ga Arukara',
        'Empire',
        'The Smoke Shop BBQ',
        'Mooo',
      ],
    },
  },
  {
    id: 'best-sub-chains',
    publishedDate: '2026-05-31',
    publishedAt: '2026-05-31T19:23:06Z',
    title: 'Best Sub Chains in America',
    category: 'Food',
    type: 'food',
    tags: ['food', 'food-drink', 'stores'],
    linkType: 'google',
    blurb: 'Hand-sliced meat, seasoned oil, and a fresh-baked roll. The best sub chains have figured out a formula that makes the others look lazy by comparison.',
    defaultSource: 'ai',
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          "Jersey Mike's",
          'Potbelly',
          'Firehouse Subs',
          "Jimmy John's",
          'Penn Station East Coast Subs',
          "Capriotti's Sandwich Shop",
          'Which Wich',
          "Schlotzsky's",
          'PrimoHoagies',
          'Subway',
        ],
      },
      tastingtable: {
        label: 'Tasting Table · Best Sandwich Chains 2024',
        url: 'https://www.tastingtable.com/1206376/popular-sandwich-chains-ranked/',
        items: [
          'Potbelly',
          'Firehouse Subs',
          "Jersey Mike's",
          "Capriotti's Sandwich Shop",
          'Penn Station East Coast Subs',
          "Schlotzsky's",
          'Which Wich',
          "Jimmy John's",
          'Subway',
        ],
      },
      cheapism: {
        label: 'Cheapism · Best Sandwich Chains 2026',
        url: 'https://www.cheapism.com/best-sandwich-chains-ranked/',
        items: [
          'Potbelly',
          "Jersey Mike's",
          'Which Wich',
          "Jimmy John's",
          'Subway',
          'Firehouse Subs',
        ],
      },
      parade: {
        label: 'Parade · Best Sandwich Shops 2024',
        url: 'https://parade.com/food/best-sandwich-shops',
        items: [
          "Jersey Mike's",
          'Potbelly',
          "Jimmy John's",
          "Schlotzsky's",
          'Firehouse Subs',
          'Which Wich',
          'Subway',
        ],
      },
      lovefood: {
        label: 'LoveFood · Best American Sandwich Chains 2025',
        url: 'https://www.lovefood.com/galleries/379372/ranked-americas-best-sandwich-chains-of-all-time',
        items: [
          'PrimoHoagies',
          'Which Wich',
          "Schlotzsky's",
          'Penn Station East Coast Subs',
          'Firehouse Subs',
          "Capriotti's Sandwich Shop",
          'Potbelly',
          "Jersey Mike's",
          "Jimmy John's",
          'Subway',
        ],
      },
    },
    vote: {
      items: [
        "Jersey Mike's",
        'Potbelly',
        'Firehouse Subs',
        "Jimmy John's",
        'Penn Station East Coast Subs',
        "Capriotti's Sandwich Shop",
        'Which Wich',
        "Schlotzsky's",
        'PrimoHoagies',
        'Subway',
      ],
    },
  },
  {
    id: 'breweries-denver',
    publishedDate: '2026-05-31',
    publishedAt: '2026-05-31T20:02:51Z',
    title: 'Best Breweries in Denver',
    category: 'Denver',
    type: 'food',
    tags: ['bars', 'food-drink', 'stores', 'entertainment'],
    linkType: 'mapsCity',
    blurb: 'Denver ranks among the most celebrated beer cities in America, with more breweries per capita than almost anywhere in the country. From Czech lagers to hazy IPAs, the Mile High City rewards the curious drinker.',
    defaultSource: 'ai',
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          'Cerebral Brewing (City Park)',
          'Bierstadt Lagerhaus (RiNo)',
          'Ratio Beerworks (RiNo)',
          'Black Shirt Brewing (Cole)',
          'Cohesion Brewing (RiNo)',
          'Great Divide Brewing Company (Ballpark)',
          'Spangalang Brewery (Curtis Park)',
          'Wynkoop Brewing Company (LoDo)',
          'Our Mutual Friend Brewing (Five Points)',
          'Comrade Brewing Company (Lowry)',
        ],
      },
      westword: {
        label: 'Westword Denver Beer Guide 2025 (unordered roundup)',
        url: 'https://www.westword.com/food-drink/best-breweries-denver-colorado16613630-16613630/',
        unordered: true,
        items: [
          'Ratio Beerworks (RiNo)',
          'Bierstadt Lagerhaus (RiNo)',
          'River North Brewery (RiNo)',
          'Black Shirt Brewing (Cole)',
          'Great Divide Brewing Company (Ballpark)',
          'Bruz Beers (Tennyson)',
          'Wynkoop Brewing Company (LoDo)',
          'Comrade Brewing Company (Lowry)',
        ],
      },
      axios: {
        label: 'Axios Denver Best of 2025 (unordered roundup)',
        url: 'https://www.axios.com/local/denver/2025/12/22/colorados-best-breweries-beers-2025',
        unordered: true,
        items: [
          'Cerebral Brewing (City Park)',
          'Comrade Brewing Company (Lowry)',
        ],
      },
      yelp: {
        label: 'Yelp · Ranked by Rating (May 2026)',
        url: 'https://www.yelp.com/search?find_desc=Breweries&find_loc=Denver%2C+CO&sortby=rating',
        items: [
          'Cohesion Brewing (RiNo)',
          'Black Shirt Brewing (Cole)',
          'Spangalang Brewery (Curtis Park)',
          'Ratio Beerworks (RiNo)',
          'Cerebral Brewing (City Park)',
          'Our Mutual Friend Brewing (Five Points)',
        ],
      },
    },
    vote: {
      items: [
          'Cerebral Brewing (City Park)',
          'Bierstadt Lagerhaus (RiNo)',
          'Ratio Beerworks (RiNo)',
          'Black Shirt Brewing (Cole)',
          'Cohesion Brewing (RiNo)',
          'Great Divide Brewing Company (Ballpark)',
          'Spangalang Brewery (Curtis Park)',
          'Wynkoop Brewing Company (LoDo)',
          'Our Mutual Friend Brewing (Five Points)',
          'Comrade Brewing Company (Lowry)',
      ],
    },
    links: {
      'Bierstadt Lagerhaus (RiNo)': 'https://www.google.com/maps/search/?api=1&query=Bierstadt%20Lagerhaus%20RiNo',
      'Black Shirt Brewing (Cole)': 'https://www.google.com/maps/search/?api=1&query=Black%20Shirt%20Brewing%20Cole',
      'Bruz Beers (Tennyson)': 'https://www.google.com/maps/search/?api=1&query=Bruz%20Beers%20Tennyson',
      'Cerebral Brewing (City Park)': 'https://www.google.com/maps/search/?api=1&query=Cerebral%20Brewing%20City%20Park',
      'Cohesion Brewing (RiNo)': 'https://www.google.com/maps/search/?api=1&query=Cohesion%20Brewing%20RiNo',
      'Comrade Brewing Company (Lowry)': 'https://www.google.com/maps/search/?api=1&query=Comrade%20Brewing%20Company%20Lowry',
      'Great Divide Brewing Company (Ballpark)': 'https://www.google.com/maps/search/?api=1&query=Great%20Divide%20Brewing%20Company%20Ballpark',
      'Our Mutual Friend Brewing (Five Points)': 'https://www.google.com/maps/search/?api=1&query=Our%20Mutual%20Friend%20Brewing%20Five%20Points',
      'Ratio Beerworks (RiNo)': 'https://www.google.com/maps/search/?api=1&query=Ratio%20Beerworks%20RiNo',
      'River North Brewery (RiNo)': 'https://www.google.com/maps/search/?api=1&query=River%20North%20Brewery%20RiNo',
      'Spangalang Brewery (Curtis Park)': 'https://www.google.com/maps/search/?api=1&query=Spangalang%20Brewery%20Curtis%20Park',
      'Wynkoop Brewing Company (LoDo)': 'https://www.google.com/maps/search/?api=1&query=Wynkoop%20Brewing%20Company%20LoDo',
    },
  },
  {
    id: 'breweries-chicago',
    publishedDate: '2026-05-31',
    publishedAt: '2026-05-31T20:02:51Z',
    title: 'Best Breweries in Chicago',
    category: 'Chicago',
    type: 'food',
    tags: ['bars', 'food-drink', 'stores', 'entertainment'],
    linkType: 'mapsCity',
    blurb: 'With more than 160 breweries inside city limits, Chicago has quietly become one of the best beer cities in the country. Every neighborhood has its own taproom worth finding.',
    defaultSource: 'ai',
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          'Goose Island Beer Co. (Fulton Market)',
          'Revolution Brewing (Logan Square)',
          'Half Acre Beer Company (Andersonville)',
          'Off Color Brewing (Lincoln Park)',
          'Dovetail Brewery (Ravenswood)',
          'Pilot Project Brewing (Logan Square)',
          'Hop Butcher For The World (North Center)',
          'Lake Effect Brewing Company (Avondale)',
          'Begyle Brewing (Ravenswood)',
          'Solemn Oath Brewery (Logan Square)',
        ],
      },
      infatuation: {
        label: 'The Infatuation Chicago 2025 (unordered roundup)',
        url: 'https://www.theinfatuation.com/chicago/guides/breweries-chicago',
        unordered: true,
        items: [
          'Goose Island Beer Co. (Fulton Market)',
          'Pilot Project Brewing (Logan Square)',
          'Off Color Brewing (Lincoln Park)',
          'Dovetail Brewery (Ravenswood)',
          'Begyle Brewing (Ravenswood)',
          'Half Acre Beer Company (Andersonville)',
          'Maplewood Brewery & Distillery (Bucktown)',
          'Alulu Brewpub (Pilsen)',
          'Piece Brewery & Pizzeria (Wicker Park)',
          'Hopewell Brewing Co. (Logan Square)',
        ],
      },
      timeout: {
        label: 'Time Out Chicago Best Breweries 2025 (unordered roundup)',
        url: 'https://www.timeout.com/chicago/bars/best-chicago-breweries',
        unordered: true,
        items: [
          'Revolution Brewing (Logan Square)',
          'Goose Island Beer Co. (Fulton Market)',
          'Half Acre Beer Company (Andersonville)',
          'Off Color Brewing (Lincoln Park)',
          'Dovetail Brewery (Ravenswood)',
          'Pilot Project Brewing (Logan Square)',
          'Begyle Brewing (Ravenswood)',
          'Solemn Oath Brewery (Logan Square)',
        ],
      },
      yelp: {
        label: 'Yelp · Ranked by Rating (May 2026)',
        url: 'https://www.yelp.com/search?find_desc=Breweries&find_loc=Chicago%2C+IL&sortby=rating',
        items: [
          'Hop Butcher For The World (North Center)',
          'Lake Effect Brewing Company (Avondale)',
          'Solemn Oath Brewery (Logan Square)',
        ],
      },
    },
    vote: {
      items: [
          'Goose Island Beer Co. (Fulton Market)',
          'Revolution Brewing (Logan Square)',
          'Half Acre Beer Company (Andersonville)',
          'Off Color Brewing (Lincoln Park)',
          'Dovetail Brewery (Ravenswood)',
          'Pilot Project Brewing (Logan Square)',
          'Hop Butcher For The World (North Center)',
          'Lake Effect Brewing Company (Avondale)',
          'Begyle Brewing (Ravenswood)',
          'Solemn Oath Brewery (Logan Square)',
      ],
    },
    links: {
      'Alulu Brewpub (Pilsen)': 'https://www.google.com/maps/search/?api=1&query=Alulu%20Brewpub%20Pilsen',
      'Begyle Brewing (Ravenswood)': 'https://www.google.com/maps/search/?api=1&query=Begyle%20Brewing%20Ravenswood',
      'Dovetail Brewery (Ravenswood)': 'https://www.google.com/maps/search/?api=1&query=Dovetail%20Brewery%20Ravenswood',
      'Goose Island Beer Co. (Fulton Market)': 'https://www.google.com/maps/search/?api=1&query=Goose%20Island%20Beer%20Co.%20Fulton%20Market',
      'Half Acre Beer Company (Andersonville)': 'https://www.google.com/maps/search/?api=1&query=Half%20Acre%20Beer%20Company%20Andersonville',
      'Hop Butcher For The World (North Center)': 'https://www.google.com/maps/search/?api=1&query=Hop%20Butcher%20For%20The%20World%20North%20Center',
      'Hopewell Brewing Co. (Logan Square)': 'https://www.google.com/maps/search/?api=1&query=Hopewell%20Brewing%20Co.%20Logan%20Square',
      'Lake Effect Brewing Company (Avondale)': 'https://www.google.com/maps/search/?api=1&query=Lake%20Effect%20Brewing%20Company%20Avondale',
      'Maplewood Brewery & Distillery (Bucktown)': 'https://www.google.com/maps/search/?api=1&query=Maplewood%20Brewery%20Distillery%20Bucktown',
      'Off Color Brewing (Lincoln Park)': 'https://www.google.com/maps/search/?api=1&query=Off%20Color%20Brewing%20Lincoln%20Park',
      'Piece Brewery & Pizzeria (Wicker Park)': 'https://www.google.com/maps/search/?api=1&query=Piece%20Brewery%20Pizzeria%20Wicker%20Park',
      'Pilot Project Brewing (Logan Square)': 'https://www.google.com/maps/search/?api=1&query=Pilot%20Project%20Brewing%20Logan%20Square',
      'Revolution Brewing (Logan Square)': 'https://www.google.com/maps/search/?api=1&query=Revolution%20Brewing%20Logan%20Square',
      'Solemn Oath Brewery (Logan Square)': 'https://www.google.com/maps/search/?api=1&query=Solemn%20Oath%20Brewery%20Logan%20Square',
    },
  },
  {
    id: 'breweries-charlotte',
    publishedDate: '2026-05-31',
    publishedAt: '2026-05-31T20:02:51Z',
    title: 'Best Breweries in Charlotte',
    category: 'Charlotte',
    type: 'food',
    tags: ['bars', 'food-drink', 'stores', 'entertainment'],
    linkType: 'mapsCity',
    blurb: 'The Queen City has become one of the South\'s premier craft beer destinations, with breweries earning national recognition at competitions like the World Beer Cup. South End, NoDa, and Plaza Midwood are the places to start.',
    defaultSource: 'ai',
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          'Resident Culture (Plaza Midwood)',
          'Burial Beer Co. (Plaza Midwood)',
          'NoDa Brewing Company (NoDa)',
          'Birdsong Brewing Co. (Villa Heights)',
          'Divine Barrel Brewing (NoDa)',
          'Wooden Robot Brewery (South End)',
          'Petty Thieves Brewing Co. (North End)',
          'Sycamore Brewing (South End)',
          'Sugar Creek Brewing Company (South End)',
          'Olde Mecklenburg Brewery (Lower South End)',
        ],
      },
      charlottecharm: {
        label: 'Charlotte Charm Best Breweries 2026',
        url: 'https://charlottecharm.com/best-breweries-in-charlotte-north-carolina',
        items: [
          'Lost Worlds Brewing (Myers Park)',
          'Birdsong Brewing Co. (Villa Heights)',
          'Divine Barrel Brewing (NoDa)',
          'NoDa Brewing Company (NoDa)',
          'Town Brewing Company (Enderly Park)',
          'Petty Thieves Brewing Co. (North End)',
        ],
      },
      axios: {
        label: 'Axios Charlotte Best Breweries 2024 (unordered roundup)',
        url: 'https://www.axios.com/local/charlotte/2024/12/02/best-breweries-charlotte-north-carolina',
        unordered: true,
        items: [
          'Sycamore Brewing (South End)',
          'Petty Thieves Brewing Co. (North End)',
          'Wooden Robot Brewery (South End)',
          'Burial Beer Co. (Plaza Midwood)',
          'NoDa Brewing Company (NoDa)',
          'Olde Mecklenburg Brewery (Lower South End)',
          'Salud Cerveceria (NoDa)',
          'Resident Culture (Plaza Midwood)',
          'Birdsong Brewing Co. (Villa Heights)',
          'Divine Barrel Brewing (NoDa)',
          'Heist Brewery (NoDa)',
        ],
      },
      hopculture: {
        label: 'Hop Culture Best Breweries Charlotte (unordered roundup)',
        url: 'https://www.hopculture.com/best-craft-breweries-charlotte-nc/',
        unordered: true,
        items: [
          'Resident Culture (Plaza Midwood)',
          'Salud Cerveceria (NoDa)',
          'Heist Brewery (NoDa)',
          'Wooden Robot Brewery (South End)',
          'Divine Barrel Brewing (NoDa)',
        ],
      },
      yelp: {
        label: 'Yelp · Ranked by Rating (May 2026)',
        url: 'https://www.yelp.com/search?find_desc=Breweries&find_loc=Charlotte%2C+NC&sortby=rating',
        items: [
          'Petty Thieves Brewing Co. (North End)',
          'Lost Worlds Brewing (Myers Park)',
          'Sugar Creek Brewing Company (South End)',
          'Birdsong Brewing Co. (Villa Heights)',
          'Town Brewing Company (Enderly Park)',
        ],
      },
    },
    vote: {
      items: [
          'Resident Culture (Plaza Midwood)',
          'Burial Beer Co. (Plaza Midwood)',
          'NoDa Brewing Company (NoDa)',
          'Birdsong Brewing Co. (Villa Heights)',
          'Divine Barrel Brewing (NoDa)',
          'Wooden Robot Brewery (South End)',
          'Petty Thieves Brewing Co. (North End)',
          'Sycamore Brewing (South End)',
          'Sugar Creek Brewing Company (South End)',
          'Olde Mecklenburg Brewery (Lower South End)',
      ],
    },
    links: {
      'Birdsong Brewing Co. (Villa Heights)': 'https://www.google.com/maps/search/?api=1&query=Birdsong%20Brewing%20Co.%20Villa%20Heights',
      'Burial Beer Co. (Plaza Midwood)': 'https://www.google.com/maps/search/?api=1&query=Burial%20Beer%20Co.%20Plaza%20Midwood',
      'Divine Barrel Brewing (NoDa)': 'https://www.google.com/maps/search/?api=1&query=Divine%20Barrel%20Brewing%20NoDa',
      'Heist Brewery (NoDa)': 'https://www.google.com/maps/search/?api=1&query=Heist%20Brewery%20NoDa',
      'Lost Worlds Brewing (Myers Park)': 'https://www.google.com/maps/search/?api=1&query=Lost%20Worlds%20Brewing%20Myers%20Park',
      'NoDa Brewing Company (NoDa)': 'https://www.google.com/maps/search/?api=1&query=NoDa%20Brewing%20Company%20NoDa',
      'Olde Mecklenburg Brewery (Lower South End)': 'https://www.google.com/maps/search/?api=1&query=Olde%20Mecklenburg%20Brewery%20Lower%20South%20End',
      'Petty Thieves Brewing Co. (North End)': 'https://www.google.com/maps/search/?api=1&query=Petty%20Thieves%20Brewing%20Co.%20North%20End',
      'Resident Culture (Plaza Midwood)': 'https://www.google.com/maps/search/?api=1&query=Resident%20Culture%20Plaza%20Midwood',
      'Salud Cerveceria (NoDa)': 'https://www.google.com/maps/search/?api=1&query=Salud%20Cerveceria%20NoDa',
      'Sugar Creek Brewing Company (South End)': 'https://www.google.com/maps/search/?api=1&query=Sugar%20Creek%20Brewing%20Company%20South%20End',
      'Sycamore Brewing (South End)': 'https://www.google.com/maps/search/?api=1&query=Sycamore%20Brewing%20South%20End',
      'Town Brewing Company (Enderly Park)': 'https://www.google.com/maps/search/?api=1&query=Town%20Brewing%20Company%20Enderly%20Park',
      'Wooden Robot Brewery (South End)': 'https://www.google.com/maps/search/?api=1&query=Wooden%20Robot%20Brewery%20South%20End',
    },
  },
  {
    id: 'breweries-orlando',
    publishedDate: '2026-05-31',
    publishedAt: '2026-05-31T20:02:51Z',
    title: 'Best Breweries in Orlando',
    category: 'Orlando',
    type: 'food',
    tags: ['bars', 'food-drink', 'stores', 'entertainment'],
    linkType: 'mapsCity',
    blurb: 'Beyond the theme parks, Orlando has built a genuine craft brewery scene with dozens of taprooms across the city and surrounding areas. From the Milk District to Winter Garden, there is always a cold pint waiting.',
    defaultSource: 'ai',
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          'Ten10 Brewing Company (Mills 50)',
          'Ivanhoe Park Brewing Co. (Ivanhoe Village)',
          'RockPit Brewing (SODO)',
          'Sideward Brewing Co. (Milk District)',
          'Redlight Redlight (Audubon Park)',
          'Twelve Talons Beerworks (Milk District)',
          'Crooked Can Brewing Company (Winter Garden)',
          'Ellipsis Brewing (Conway)',
          'Park Pizza & Brewing Company (Lake Nona)',
          'Ravenous Pig Brewing Company (Winter Park)',
        ],
      },
      floridatravelgirl: {
        label: 'The Florida Travel Girl Best Orlando Breweries 2025',
        url: 'https://thefloridatravelgirl.com/best-breweries-in-orlando/',
        items: [
          'Ten10 Brewing Company (Mills 50)',
          'Ravenous Pig Brewing Company (Winter Park)',
          'Ellipsis Brewing (Conway)',
          'RockPit Brewing (SODO)',
          'Park Pizza & Brewing Company (Lake Nona)',
          'Persimmon Hollow Brewing (Lake Eola)',
          'Sideward Brewing Co. (Milk District)',
          'Ivanhoe Park Brewing Co. (Ivanhoe Village)',
          'Crooked Can Brewing Company (Winter Garden)',
          'Deviant Wolfe Brewing (Sanford)',
        ],
      },
      visitorlando: {
        label: 'Visit Orlando Best Breweries 2025 (unordered roundup)',
        url: 'https://www.visitorlando.com/blog/post/orlando-breweries/',
        unordered: true,
        items: [
          'Ivanhoe Park Brewing Co. (Ivanhoe Village)',
          'Park Pizza & Brewing Company (Lake Nona)',
          'Twelve Talons Beerworks (Milk District)',
          'Redlight Redlight (Audubon Park)',
          'RockPit Brewing (SODO)',
          'Sideward Brewing Co. (Milk District)',
          'Ten10 Brewing Company (Mills 50)',
          'Crooked Can Brewing Company (Winter Garden)',
          'Half Barrel Beer Project (International Drive)',
        ],
      },
      yelp: {
        label: 'Yelp · Ranked by Rating (May 2026)',
        url: 'https://www.yelp.com/search?find_desc=Breweries&find_loc=Orlando%2C+FL&sortby=rating',
        items: [
          'Half Barrel Beer Project (International Drive)',
          'Twelve Talons Beerworks (Milk District)',
        ],
      },
    },
    vote: {
      items: [
          'Ten10 Brewing Company (Mills 50)',
          'Ivanhoe Park Brewing Co. (Ivanhoe Village)',
          'RockPit Brewing (SODO)',
          'Sideward Brewing Co. (Milk District)',
          'Redlight Redlight (Audubon Park)',
          'Twelve Talons Beerworks (Milk District)',
          'Crooked Can Brewing Company (Winter Garden)',
          'Ellipsis Brewing (Conway)',
          'Park Pizza & Brewing Company (Lake Nona)',
          'Ravenous Pig Brewing Company (Winter Park)',
      ],
    },
    links: {
      'Crooked Can Brewing Company (Winter Garden)': 'https://www.google.com/maps/search/?api=1&query=Crooked%20Can%20Brewing%20Company%20Winter%20Garden',
      'Deviant Wolfe Brewing (Sanford)': 'https://www.google.com/maps/search/?api=1&query=Deviant%20Wolfe%20Brewing%20Sanford',
      'Ellipsis Brewing (Conway)': 'https://www.google.com/maps/search/?api=1&query=Ellipsis%20Brewing%20Conway',
      'Half Barrel Beer Project (International Drive)': 'https://www.google.com/maps/search/?api=1&query=Half%20Barrel%20Beer%20Project%20International%20Drive',
      'Ivanhoe Park Brewing Co. (Ivanhoe Village)': 'https://www.google.com/maps/search/?api=1&query=Ivanhoe%20Park%20Brewing%20Co.%20Ivanhoe%20Village',
      'Park Pizza & Brewing Company (Lake Nona)': 'https://www.google.com/maps/search/?api=1&query=Park%20Pizza%20Brewing%20Company%20Lake%20Nona',
      'Persimmon Hollow Brewing (Lake Eola)': 'https://www.google.com/maps/search/?api=1&query=Persimmon%20Hollow%20Brewing%20Lake%20Eola',
      'Ravenous Pig Brewing Company (Winter Park)': 'https://www.google.com/maps/search/?api=1&query=Ravenous%20Pig%20Brewing%20Company%20Winter%20Park',
      'Redlight Redlight (Audubon Park)': 'https://www.google.com/maps/search/?api=1&query=Redlight%20Redlight%20Audubon%20Park',
      'RockPit Brewing (SODO)': 'https://www.google.com/maps/search/?api=1&query=RockPit%20Brewing%20SODO',
      'Sideward Brewing Co. (Milk District)': 'https://www.google.com/maps/search/?api=1&query=Sideward%20Brewing%20Co.%20Milk%20District',
      'Ten10 Brewing Company (Mills 50)': 'https://www.google.com/maps/search/?api=1&query=Ten10%20Brewing%20Company%20Mills%2050',
      'Twelve Talons Beerworks (Milk District)': 'https://www.google.com/maps/search/?api=1&query=Twelve%20Talons%20Beerworks%20Milk%20District',
    },
  },
  {
    id: 'breweries-washington-dc',
    publishedDate: '2026-05-31',
    publishedAt: '2026-05-31T20:02:51Z',
    title: 'Best Breweries in Washington DC',
    category: 'Washington DC',
    type: 'food',
    tags: ['bars', 'food-drink', 'stores', 'entertainment'],
    linkType: 'mapsCity',
    blurb: 'Washington, D.C.\'s brewery scene exploded after DC Brau opened in 2011, and the capital now punches well above its weight in craft beer. Ivy City, NoMa, and Brookland are the neighborhoods leading the charge.',
    defaultSource: 'ai',
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          'Other Half Brewing (Ivy City)',
          'Right Proper Brewing Company (Brookland)',
          'DC Brau (Woodridge)',
          'Atlas Brew Works (Ivy City)',
          'Red Bear Brewing (NoMa)',
          'City-State Brewing Company (Edgewood)',
          'Lost Generation Brewing Company (Eckington)',
          'Crooked Run Fermentation (Union Market)',
          'Bluejacket (Navy Yard)',
          'Aslin Beer Company (Logan Circle)',
        ],
      },
      infatuation: {
        label: 'The Infatuation DC Best Breweries 2025 (unordered roundup)',
        url: 'https://www.theinfatuation.com/washington-dc/guides/best-breweries-dc',
        unordered: true,
        items: [
          'Aslin Beer Company (Logan Circle)',
          'Right Proper Brewing Company (Brookland)',
          'Lost Generation Brewing Company (Eckington)',
          'Other Half Brewing (Ivy City)',
          'DC Brau (Woodridge)',
          'City-State Brewing Company (Edgewood)',
          'Crooked Run Fermentation (Union Market)',
          'Red Bear Brewing (NoMa)',
        ],
      },
      axios: {
        label: 'Axios DC Top Breweries by Sales 2025',
        url: 'https://www.axios.com/local/washington-dc/2025/06/27/dc-brau-craft-brewing',
        items: [
          'DC Brau (Woodridge)',
          'Atlas Brew Works (Ivy City)',
          'Right Proper Brewing Company (Brookland)',
        ],
      },
      yelp: {
        label: 'Yelp · Ranked by Rating (May 2026)',
        url: 'https://www.yelp.com/search?find_desc=Breweries&find_loc=Washington%2C+DC&sortby=rating',
        items: [
          'Other Half Brewing (Ivy City)',
          'Lost Generation Brewing Company (Eckington)',
          'Right Proper Brewing Company (Brookland)',
        ],
      },
    },
    vote: {
      items: [
          'Other Half Brewing (Ivy City)',
          'Right Proper Brewing Company (Brookland)',
          'DC Brau (Woodridge)',
          'Atlas Brew Works (Ivy City)',
          'Red Bear Brewing (NoMa)',
          'City-State Brewing Company (Edgewood)',
          'Lost Generation Brewing Company (Eckington)',
          'Crooked Run Fermentation (Union Market)',
          'Bluejacket (Navy Yard)',
          'Aslin Beer Company (Logan Circle)',
      ],
    },
    links: {
      'Aslin Beer Company (Logan Circle)': 'https://www.google.com/maps/search/?api=1&query=Aslin%20Beer%20Company%20Logan%20Circle',
      'Atlas Brew Works (Ivy City)': 'https://www.google.com/maps/search/?api=1&query=Atlas%20Brew%20Works%20Ivy%20City',
      'Bluejacket (Navy Yard)': 'https://www.google.com/maps/search/?api=1&query=Bluejacket%20Navy%20Yard',
      'City-State Brewing Company (Edgewood)': 'https://www.google.com/maps/search/?api=1&query=City-State%20Brewing%20Company%20Edgewood',
      'Crooked Run Fermentation (Union Market)': 'https://www.google.com/maps/search/?api=1&query=Crooked%20Run%20Fermentation%20Union%20Market',
      'DC Brau (Woodridge)': 'https://www.google.com/maps/search/?api=1&query=DC%20Brau%20Woodridge',
      'Lost Generation Brewing Company (Eckington)': 'https://www.google.com/maps/search/?api=1&query=Lost%20Generation%20Brewing%20Company%20Eckington',
      'Other Half Brewing (Ivy City)': 'https://www.google.com/maps/search/?api=1&query=Other%20Half%20Brewing%20Ivy%20City',
      'Red Bear Brewing (NoMa)': 'https://www.google.com/maps/search/?api=1&query=Red%20Bear%20Brewing%20NoMa',
      'Right Proper Brewing Company (Brookland)': 'https://www.google.com/maps/search/?api=1&query=Right%20Proper%20Brewing%20Company%20Brookland',
    },
  },  {
    id: 'pool-table-bars-lower-manhattan',
    publishedDate: '2026-05-31',
    publishedAt: '2026-05-31T22:04:15Z',
    title: 'Best Bars with a Pool Table in Lower Manhattan',
    category: 'New York',
    type: 'food',
    tags: ['bars', 'nightlife', 'food-drink', 'stores'],
    linkType: 'mapsCity',
    blurb: 'Chalk the cue and find a table. From Financial District game rooms to East Village honkytonks, these are the Lower Manhattan bars where pool is the main reason to stay.',
    defaultSource: 'ai',
    links: {
      'Sadie\'s Ward (Lower East Side)': 'https://www.google.com/maps/search/?api=1&query=Sadie%27s%20Ward%20Lower%20East%20Side',
      'Toad Hall (SoHo)': 'https://www.google.com/maps/search/?api=1&query=Toad%20Hall%20SoHo',
      'The Irish American (Financial District)': 'https://www.google.com/maps/search/?api=1&query=The%20Irish%20American%20Financial%20District',
      'Cellar Dog (West Village)': 'https://www.google.com/maps/search/?api=1&query=Cellar%20Dog%20West%20Village',
      'Parkside Lounge (Lower East Side)': 'https://www.google.com/maps/search/?api=1&query=Parkside%20Lounge%20Lower%20East%20Side',
      'Double Down Saloon (East Village)': 'https://www.google.com/maps/search/?api=1&query=Double%20Down%20Saloon%20East%20Village',
      'Doc Holliday\'s (East Village)': 'https://www.google.com/maps/search/?api=1&query=Doc%20Holliday%27s%20East%20Village',
      '169 Bar (Two Bridges)': 'https://www.google.com/maps/search/?api=1&query=169%20Bar%20Two%20Bridges',
      'Amsterdam Billiards Club (East Village)': 'https://www.google.com/maps/search/?api=1&query=Amsterdam%20Billiards%20Club%20East%20Village',
      'Kingston Hall (East Village)': 'https://www.google.com/maps/search/?api=1&query=Kingston%20Hall%20East%20Village',
    },
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          'Sadie\'s Ward (Lower East Side)',
          'The Irish American (Financial District)',
          'Toad Hall (SoHo)',
          'Cellar Dog (West Village)',
          'Double Down Saloon (East Village)',
          'Amsterdam Billiards Club (East Village)',
          'Parkside Lounge (Lower East Side)',
          'Kingston Hall (East Village)',
          '169 Bar (Two Bridges)',
          'Doc Holliday\'s (East Village)',
        ],
      },
      yelp: {
        label: 'Yelp · Ranked by Rating (May 2026)',
        url: 'https://www.yelp.com/search?find_desc=Bars+With+Pool+Tables&find_loc=Lower+Manhattan%2C+New+York%2C+NY',
        items: [
          'Sadie\'s Ward (Lower East Side)',
          'Toad Hall (SoHo)',
          'The Irish American (Financial District)',
          'Cellar Dog (West Village)',
          'Parkside Lounge (Lower East Side)',
          'Double Down Saloon (East Village)',
          'Doc Holliday\'s (East Village)',
          '169 Bar (Two Bridges)',
          'Kingston Hall (East Village)',
          'Amsterdam Billiards Club (East Village)',
        ],
      },
      google: {
        label: 'Google Reviews · Ranked by Rating (May 2026)',
        url: 'https://www.google.com/maps/search/bars+with+pool+tables+lower+manhattan',
        items: [
          'Sadie\'s Ward (Lower East Side)',
          'The Irish American (Financial District)',
          'Toad Hall (SoHo)',
          'Amsterdam Billiards Club (East Village)',
          'Cellar Dog (West Village)',
          'Double Down Saloon (East Village)',
          'Kingston Hall (East Village)',
          'Parkside Lounge (Lower East Side)',
          '169 Bar (Two Bridges)',
          'Doc Holliday\'s (East Village)',
        ],
      },
      timeout: {
        label: 'Time Out New York · Best Pool Halls NYC 2025',
        url: 'https://www.timeout.com/newyork/things-to-do/best-pool-hall-nyc',
        items: [
          'Amsterdam Billiards Club (East Village)',
          'Cellar Dog (West Village)',
        ],
      },
      secretnyc: {
        label: 'Secret NYC · Best Pool Halls NYC 2023',
        url: 'https://secretnyc.co/best-pool-halls-in-nyc/',
        items: [
          'Amsterdam Billiards Club (East Village)',
          'Cellar Dog (West Village)',
        ],
      },
    },
    vote: {
      items: [
        'Sadie\'s Ward (Lower East Side)',
        'The Irish American (Financial District)',
        'Toad Hall (SoHo)',
        'Cellar Dog (West Village)',
        'Double Down Saloon (East Village)',
        'Amsterdam Billiards Club (East Village)',
        'Parkside Lounge (Lower East Side)',
        'Kingston Hall (East Village)',
        '169 Bar (Two Bridges)',
        'Doc Holliday\'s (East Village)',
      ],
    },
  },
  {
    id: 'pool-table-bars-boston',
    publishedDate: '2026-05-31',
    publishedAt: '2026-05-31T22:53:23Z',
    title: 'Best Bars with a Pool Table in Boston',
    category: 'Boston',
    type: 'food',
    tags: ['bars', 'nightlife', 'food-drink', 'stores'],
    linkType: 'mapsCity',
    blurb: 'The cue is chalked, the table is free, and the beer is cold. Boston\'s best pool table bars run from South Boston neighborhood gems to Allston dives and the Cambridge institutions that started it all.',
    defaultSource: 'ai',
    links: {
      'Croke Park (South Boston)': 'https://www.google.com/maps/search/?api=1&query=Croke%20Park%20South%20Boston',
      'Harry\'s Bar & Grill (Brighton)': 'https://www.google.com/maps/search/?api=1&query=Harry%27s%20Bar%20Grill%20Brighton%20Boston',
      'The Shannon Tavern (South Boston)': 'https://www.google.com/maps/search/?api=1&query=The%20Shannon%20Tavern%20South%20Boston',
      'Silhouette Lounge (Allston)': 'https://www.google.com/maps/search/?api=1&query=Silhouette%20Lounge%20Allston%20Boston',
      'Tom English\'s Cottage (South Boston)': 'https://www.google.com/maps/search/?api=1&query=Tom%20English%27s%20Cottage%20South%20Boston',
      'Flat Top Johnny\'s (Kendall Square, Cambridge)': 'https://www.google.com/maps/search/?api=1&query=Flat%20Top%20Johnny%27s%20Kendall%20Square%20Cambridge',
      'State Park (Kendall Square, Cambridge)': 'https://www.google.com/maps/search/?api=1&query=State%20Park%20Kendall%20Square%20Cambridge',
      'Sullivan\'s Tap (West End)': 'https://www.google.com/maps/search/?api=1&query=Sullivan%27s%20Tap%20West%20End%20Boston',
      'Cornwall\'s (Kenmore)': 'https://www.google.com/maps/search/?api=1&query=Cornwall%27s%20Kenmore%20Boston',
      'The Tam (Downtown)': 'https://www.google.com/maps/search/?api=1&query=The%20Tam%20Downtown%20Boston',
    },
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          'Croke Park (South Boston)',
          'Harry\'s Bar & Grill (Brighton)',
          'The Shannon Tavern (South Boston)',
          'Silhouette Lounge (Allston)',
          'Tom English\'s Cottage (South Boston)',
          'Flat Top Johnny\'s (Kendall Square, Cambridge)',
          'State Park (Kendall Square, Cambridge)',
          'Sullivan\'s Tap (West End)',
          'Cornwall\'s (Kenmore)',
          'The Tam (Downtown)',
        ],
      },
      yelp: {
        label: 'Yelp · Ranked by Rating (May 2026)',
        url: 'https://www.yelp.com/search?find_desc=Bars+With+Pool+Tables&find_loc=Boston%2C+MA&sortby=rating',
        items: [
          'Croke Park (South Boston)',
          'The Shannon Tavern (South Boston)',
          'Harry\'s Bar & Grill (Brighton)',
          'Tom English\'s Cottage (South Boston)',
          'State Park (Kendall Square, Cambridge)',
          'Cornwall\'s (Kenmore)',
          'Silhouette Lounge (Allston)',
          'The Tam (Downtown)',
          'Sullivan\'s Tap (West End)',
          'Flat Top Johnny\'s (Kendall Square, Cambridge)',
        ],
      },
      google: {
        label: 'Google Reviews · Ranked by Rating (May 2026)',
        url: 'https://www.google.com/maps/search/bars+with+pool+table+Boston',
        items: [
          'The Shannon Tavern (South Boston)',
          'Croke Park (South Boston)',
          'Tom English\'s Cottage (South Boston)',
          'State Park (Kendall Square, Cambridge)',
          'Cornwall\'s (Kenmore)',
          'The Tam (Downtown)',
          'Harry\'s Bar & Grill (Brighton)',
          'Flat Top Johnny\'s (Kendall Square, Cambridge)',
          'Silhouette Lounge (Allston)',
          'Sullivan\'s Tap (West End)',
        ],
      },
      timeout: {
        label: 'Time Out Boston · Best Dive Bars in Boston 2022',
        url: 'https://www.timeout.com/boston/bars/best-dive-bars-in-boston',
        items: [
          'Silhouette Lounge (Allston)',
          'Sullivan\'s Tap (West End)',
          'Croke Park (South Boston)',
        ],
      },
      wokewaves: {
        label: 'Woke Waves · Best Spots to Play Pool in Boston',
        url: 'https://www.wokewaves.com/posts/bostons-best-spots-to-play-pool',
        items: [
          'Croke Park (South Boston)',
          'Harry\'s Bar & Grill (Brighton)',
        ],
      },
      blacklabel: {
        label: 'Black Label Billiards · Best Billiards Halls in Boston (January 2025)',
        url: 'https://blacklabelbilliards.com/blogs/blog/the-best-billiards-halls-in-boston',
        items: [
          'Flat Top Johnny\'s (Kendall Square, Cambridge)',
        ],
      },
    },
    vote: {
      items: [
        'Croke Park (South Boston)',
        'Harry\'s Bar & Grill (Brighton)',
        'The Shannon Tavern (South Boston)',
        'Silhouette Lounge (Allston)',
        'Tom English\'s Cottage (South Boston)',
        'Flat Top Johnny\'s (Kendall Square, Cambridge)',
        'State Park (Kendall Square, Cambridge)',
        'Sullivan\'s Tap (West End)',
        'Cornwall\'s (Kenmore)',
        'The Tam (Downtown)',
      ],
    },
  },

  {
    id: 'burgers-london',
    publishedDate: '2026-05-31',
    publishedAt: '2026-05-31T23:25:21Z',
    title: 'Best Burgers in London',
    category: 'London',
    type: 'food',
    tags: ['food', 'food-drink', 'stores'],
    linkType: 'mapsCity',
    blurb: 'Dexter beef at a Finsbury Park pub, 50-day dry-aged patties in Notting Hill, and a French smash burger that arrived in Shoreditch to instant queues. London\'s burger scene has quietly become world-class.',
    defaultSource: 'ai',
    links: {
      'The Plimsoll (Finsbury Park)': 'https://www.google.com/maps/search/?api=1&query=The%20Plimsoll%20Finsbury%20Park%20London',
      'Dove (Notting Hill)': 'https://www.google.com/maps/search/?api=1&query=Dove%2031%20Kensington%20Park%20Road%20Notting%20Hill%20London',
      'Jupiter Burger (London Fields)': 'https://www.google.com/maps/search/?api=1&query=Jupiter%20Burger%20London%20Fields%20London',
      'Hanbaagaasuuteeki (Victoria)': 'https://www.google.com/maps/search/?api=1&query=Hanbaagaasuuteeki%20Victoria%20London',
      'One Club Row (Shoreditch)': 'https://www.google.com/maps/search/?api=1&query=One%20Club%20Row%20Shoreditch%20London',
      'Bleecker (Spitalfields)': 'https://www.google.com/maps/search/?api=1&query=Bleecker%20Spitalfields%20London',
      'Dover Street Counter (Mayfair)': 'https://www.google.com/maps/search/?api=1&query=Dover%20Street%20Counter%20Mayfair%20London',
      'Black Bear Burger (Brixton)': 'https://www.google.com/maps/search/?api=1&query=Black%20Bear%20Burger%20Brixton%20London',
      "Chuck's (Fitzrovia)": 'https://www.google.com/maps/search/?api=1&query=Chuck%27s%2023%20Charlotte%20Street%20Fitzrovia%20London',
      'Dumbo (Shoreditch)': 'https://www.google.com/maps/search/?api=1&query=Dumbo%20119%20Bethnal%20Green%20Road%20Shoreditch%20London',
      'Burnt Smokehouse (Leyton)': 'https://www.google.com/maps/search/?api=1&query=Burnt%20Smokehouse%20Leyton%20London',
      'Bun & Sum (Mile End)': 'https://www.google.com/maps/search/?api=1&query=Bun%20%26%20Sum%20Mile%20End%20London',
      'Bake Street (Stoke Newington)': 'https://www.google.com/maps/search/?api=1&query=Bake%20Street%2058%20Evering%20Road%20Stoke%20Newington%20London',
      'Manna (Bloomsbury)': 'https://www.google.com/maps/search/?api=1&query=Manna%20103%20New%20Oxford%20Street%20London',
      'Buk (Camden)': 'https://www.google.com/maps/search/?api=1&query=Buk%20Hawley%20Wharf%20Camden%20London',
      'GOAT Burger (Knightsbridge)': 'https://www.google.com/maps/search/?api=1&query=GOAT%20Burger%20146%20Brompton%20Road%20Knightsbridge%20London',
      'Supernova (Soho)': 'https://www.google.com/maps/search/?api=1&query=Supernova%2025%20Peter%20Street%20Soho%20London',
      'Heard Burger (Soho)': 'https://www.google.com/maps/search/?api=1&query=Heard%20Burger%2031%20Foubert%27s%20Place%20Soho%20London',
      'Burger & Beyond (Shoreditch)': 'https://www.google.com/maps/search/?api=1&query=Burger%20%26%20Beyond%20Shoreditch%20London',
      'Blacklock (Shoreditch)': 'https://www.google.com/maps/search/?api=1&query=Blacklock%2028%20Rivington%20Street%20Shoreditch%20London',
      'Honest Burgers (Brixton)': 'https://www.google.com/maps/search/?api=1&query=Honest%20Burgers%20Brixton%20London',
      'Lagom (Hackney)': 'https://www.google.com/maps/search/?api=1&query=Lagom%20Hackney%20Church%20Brew%20Co%20London',
      'Lucky Chip (Hackney Wick)': 'https://www.google.com/maps/search/?api=1&query=Lucky%20Chip%20Hackney%20Wick%20London',
      'MEATliquor (Marylebone)': 'https://www.google.com/maps/search/?api=1&query=MEATliquor%20Marylebone%20London',
      'Mother Flipper (Brockley)': 'https://www.google.com/maps/search/?api=1&query=Mother%20Flipper%20Brockley%20London',
      "Baba G's (Brixton)": 'https://www.google.com/maps/search/?api=1&query=Baba%20G%27s%20Brixton%20London',
    },
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          'The Plimsoll (Finsbury Park)',
          'Dove (Notting Hill)',
          'Jupiter Burger (London Fields)',
          'Hanbaagaasuuteeki (Victoria)',
          'One Club Row (Shoreditch)',
          'Bleecker (Spitalfields)',
          'Dover Street Counter (Mayfair)',
          'Black Bear Burger (Brixton)',
          "Chuck's (Fitzrovia)",
          'Dumbo (Shoreditch)',
        ],
      },
      infatuation: {
        label: 'The Infatuation London · Best Burgers 2026 (by 0-10 score)',
        url: 'https://www.theinfatuation.com/london/guides/best-burgers-london',
        items: [
          'One Club Row (Shoreditch)',
          'Dover Street Counter (Mayfair)',
          'The Plimsoll (Finsbury Park)',
          'Burnt Smokehouse (Leyton)',
          'Dove (Notting Hill)',
          'Jupiter Burger (London Fields)',
          'Bun & Sum (Mile End)',
          'Bake Street (Stoke Newington)',
          "Chuck's (Fitzrovia)",
          'Manna (Bloomsbury)',
          'Buk (Camden)',
          'GOAT Burger (Knightsbridge)',
          'Supernova (Soho)',
        ],
      },
      timeout: {
        label: 'Time Out London · Best Burgers January 2026',
        url: 'https://www.timeout.com/london/food-and-drink/londons-best-burger-restaurants-1',
        items: [
          'Hanbaagaasuuteeki (Victoria)',
          'The Plimsoll (Finsbury Park)',
          'Dumbo (Shoreditch)',
          'Heard Burger (Soho)',
          "Chuck's (Fitzrovia)",
          'Dove (Notting Hill)',
          'Bleecker (Spitalfields)',
          'Black Bear Burger (Brixton)',
          'Jupiter Burger (London Fields)',
          'Manna (Bloomsbury)',
          'Burger & Beyond (Shoreditch)',
          'Blacklock (Shoreditch)',
          'Honest Burgers (Brixton)',
        ],
      },
      hotdinners: {
        label: 'Hot Dinners London · Best Burgers 2025 (unordered)',
        url: 'https://www.hot-dinners.com/Features/Hot-Dinners-recommends/london-best-burgers-restaurants',
        unordered: true,
        items: [
          'Dove (Notting Hill)',
          'Jupiter Burger (London Fields)',
          'Bleecker (Spitalfields)',
          'Supernova (Soho)',
          'Black Bear Burger (Brixton)',
          'Lagom (Hackney)',
          'The Plimsoll (Finsbury Park)',
          'Burger & Beyond (Shoreditch)',
          'Lucky Chip (Hackney Wick)',
          'MEATliquor (Marylebone)',
          'Mother Flipper (Brockley)',
          "Baba G's (Brixton)",
        ],
      },
    },
    vote: {
      items: [
        'The Plimsoll (Finsbury Park)',
        'Dove (Notting Hill)',
        'Jupiter Burger (London Fields)',
        'Hanbaagaasuuteeki (Victoria)',
        'One Club Row (Shoreditch)',
        'Bleecker (Spitalfields)',
        'Dover Street Counter (Mayfair)',
        'Black Bear Burger (Brixton)',
        "Chuck's (Fitzrovia)",
        'Dumbo (Shoreditch)',
      ],
    },
  },
  {
    id: 'non-pretentious-bars-hamptons',
    publishedDate: '2026-05-31',
    publishedAt: '2026-06-01T00:28:23Z',
    title: 'Best Non-Pretentious Bars in the Hamptons',
    category: 'Hamptons',
    type: 'food',
    tags: ['bars', 'nightlife', 'food-drink', 'stores', 'entertainment'],
    linkType: 'mapsCity',
    blurb: "No door policy, no cover, no bottle service. While the summer crowd queues for the scene, these are the year-round taverns and dive bars where Hamptons locals actually drink.",
    defaultSource: 'ai',
    links: {
      "Murf's BackStreet Tavern (Sag Harbor)": 'https://www.google.com/maps/search/?api=1&query=Murf%27s%20BackStreet%20Tavern%20Sag%20Harbor%20NY',
      'The Dock (Montauk)': 'https://www.google.com/maps/search/?api=1&query=The%20Dock%20Montauk%20NY',
      'Springs Tavern (Springs)': 'https://www.google.com/maps/search/?api=1&query=Springs%20Tavern%20and%20Grill%20East%20Hampton%20NY',
      'Stephen Talkhouse (Amagansett)': 'https://www.google.com/maps/search/?api=1&query=Stephen%20Talkhouse%20Amagansett%20NY',
      "Buckley's Inn Between (Hampton Bays)": 'https://www.google.com/maps/search/?api=1&query=Buckley%27s%20Inn%20Between%20Hampton%20Bays%20NY',
      'The Montauket (Montauk)': 'https://www.google.com/maps/search/?api=1&query=The%20Montauket%20Montauk%20NY',
      'Rowdy Hall (Amagansett)': 'https://www.google.com/maps/search/?api=1&query=Rowdy%20Hall%20Amagansett%20NY',
      'North Sea Tavern (North Sea)': 'https://www.google.com/maps/search/?api=1&query=North%20Sea%20Tavern%20Southampton%20NY',
      'Southampton Publick House (Southampton)': 'https://www.google.com/maps/search/?api=1&query=Southampton%20Publick%20House%20Southampton%20NY',
      'Shagwong Tavern (Montauk)': 'https://www.google.com/maps/search/?api=1&query=Shagwong%20Tavern%20Montauk%20NY',
      'The Blue Parrot (East Hampton)': 'https://www.google.com/maps/search/?api=1&query=The%20Blue%20Parrot%20East%20Hampton%20NY',
      'Memory Motel (Montauk)': 'https://www.google.com/maps/search/?api=1&query=Memory%20Motel%20Montauk%20NY',
    },
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          "Murf's BackStreet Tavern (Sag Harbor)",
          'The Dock (Montauk)',
          'Springs Tavern (Springs)',
          'Stephen Talkhouse (Amagansett)',
          "Buckley's Inn Between (Hampton Bays)",
          'The Montauket (Montauk)',
          'Rowdy Hall (Amagansett)',
          'North Sea Tavern (North Sea)',
          'Southampton Publick House (Southampton)',
          'Shagwong Tavern (Montauk)',
        ],
      },
      yelp: {
        label: 'Yelp · Ranked by Rating (May 2026)',
        url: 'https://www.yelp.com/search?cflt=divebars%2Cbars&find_loc=The+Hamptons%2C+NY',
        items: [
          "Murf's BackStreet Tavern (Sag Harbor)",
          'Springs Tavern (Springs)',
          'The Dock (Montauk)',
          "Buckley's Inn Between (Hampton Bays)",
          'Rowdy Hall (Amagansett)',
          'North Sea Tavern (North Sea)',
          'Stephen Talkhouse (Amagansett)',
          'Southampton Publick House (Southampton)',
          'The Montauket (Montauk)',
          'Shagwong Tavern (Montauk)',
          'The Blue Parrot (East Hampton)',
          'Memory Motel (Montauk)',
        ],
      },
      google: {
        label: 'Google Reviews · Ranked by Rating (May 2026)',
        url: 'https://www.google.com/maps/search/bars+hamptons+ny',
        items: [
          'Stephen Talkhouse (Amagansett)',
          'The Dock (Montauk)',
          'Springs Tavern (Springs)',
          "Buckley's Inn Between (Hampton Bays)",
          "Murf's BackStreet Tavern (Sag Harbor)",
          'The Montauket (Montauk)',
          'Southampton Publick House (Southampton)',
          'Rowdy Hall (Amagansett)',
          'North Sea Tavern (North Sea)',
          'Shagwong Tavern (Montauk)',
          'The Blue Parrot (East Hampton)',
          'Memory Motel (Montauk)',
        ],
      },
      dans: {
        label: "Dan's Papers · 8 Hamptons Bars & Pubs 2023 (unordered roundup)",
        url: 'https://www.danspapers.com/2023/09/hamptons-bars-and-pubs-beer-burger/',
        unordered: true,
        items: [
          'Shagwong Tavern (Montauk)',
          'Rowdy Hall (Amagansett)',
          'North Sea Tavern (North Sea)',
          "Buckley's Inn Between (Hampton Bays)",
          'Southampton Publick House (Southampton)',
        ],
      },
      hamptons: {
        label: 'Hamptons.com · Best Bars 2025 (unordered roundup)',
        url: 'https://hamptons.com/toast-to-the-summer-the-best-bars-in-the-hamptons/',
        unordered: true,
        items: [
          "Murf's BackStreet Tavern (Sag Harbor)",
          'The Blue Parrot (East Hampton)',
          'Springs Tavern (Springs)',
          'Stephen Talkhouse (Amagansett)',
          'The Montauket (Montauk)',
        ],
      },
      lordslane: {
        label: 'Lords Lane · Best Hamptons Bars 2024 (unordered roundup)',
        url: 'https://lordslane.com/best-hamptons-bars/',
        unordered: true,
        items: [
          "Murf's BackStreet Tavern (Sag Harbor)",
          'The Blue Parrot (East Hampton)',
          'Springs Tavern (Springs)',
          'The Montauket (Montauk)',
          'Shagwong Tavern (Montauk)',
        ],
      },
      timeout: {
        label: 'Time Out NY · Best Montauk Bars 2024 (unordered roundup)',
        url: 'https://www.timeout.com/newyork/bars/best-montauk-bars',
        unordered: true,
        items: [
          'The Montauket (Montauk)',
          'Memory Motel (Montauk)',
        ],
      },
    },
    vote: {
      items: [
        "Murf's BackStreet Tavern (Sag Harbor)",
        'The Dock (Montauk)',
        'The Montauket (Montauk)',
        'Shagwong Tavern (Montauk)',
        'Springs Tavern (Springs)',
        'Stephen Talkhouse (Amagansett)',
        'Memory Motel (Montauk)',
        'Rowdy Hall (Amagansett)',
        "Buckley's Inn Between (Hampton Bays)",
        'The Blue Parrot (East Hampton)',
      ],
    },
  },
  {
    id: 'cocktail-bars-tampa-bay',
    publishedDate: '2026-05-31',
    publishedAt: '2026-06-01T01:09:30Z',
    title: 'Best Cocktail Bars in Tampa Bay',
    category: 'Tampa Bay',
    type: 'food',
    tags: ['bars', 'nightlife', 'food-drink', 'stores', 'entertainment'],
    linkType: 'mapsCity',
    blurb: 'Password-entry speakeasies, Ybor rum dens, and downtown St. Pete craft rooms. From Tampa across the bay to St. Petersburg, this is where Tampa Bay takes its cocktails seriously.',
    defaultSource: 'ai',
    links: {
    "CW's Gin Joint (Downtown, Tampa)": 'https://www.google.com/maps/search/?api=1&query=CW%27s%20Gin%20Joint%20Tampa',
    "Hotel Bar (Downtown, Tampa)": 'https://www.google.com/maps/search/?api=1&query=Hotel%20Bar%20Downtown%20Tampa',
    "Morgan's Cove (Downtown, Tampa)": 'https://www.google.com/maps/search/?api=1&query=Morgan%27s%20Cove%20Tampa',
    "Mandarin Heights (Seminole Heights, Tampa)": 'https://www.google.com/maps/search/?api=1&query=Mandarin%20Heights%20Seminole%20Heights%20Tampa',
    "Copper Shaker (Ybor City, Tampa)": 'https://www.google.com/maps/search/?api=1&query=Copper%20Shaker%20Ybor%20City%20Tampa',
    "Mandarin Hide (Downtown, St. Petersburg)": 'https://www.google.com/maps/search/?api=1&query=Mandarin%20Hide%20St%20Petersburg',
    "Copper Shaker (Downtown, St. Petersburg)": 'https://www.google.com/maps/search/?api=1&query=Copper%20Shaker%20St%20Petersburg',
    "In Between Days (Midtown, St. Petersburg)": 'https://www.google.com/maps/search/?api=1&query=In%20Between%20Days%20St%20Petersburg',
    "Ruby's Elixir (Downtown, St. Petersburg)": 'https://www.google.com/maps/search/?api=1&query=Ruby%27s%20Elixir%20St%20Petersburg',
    "Red Thread (Downtown, St. Petersburg)": 'https://www.google.com/maps/search/?api=1&query=Red%20Thread%20St%20Petersburg',
    "Bar Mezzo (Downtown, St. Petersburg)": 'https://www.google.com/maps/search/?api=1&query=Bar%20Mezzo%20St%20Petersburg',
    "COCKtail St. Pete (Grand Central District, St. Petersburg)": 'https://www.google.com/maps/search/?api=1&query=COCKtail%20St%20Pete',
    },
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          "Bar Mezzo (Downtown, St. Petersburg)",
          "In Between Days (Midtown, St. Petersburg)",
          "Copper Shaker (Ybor City, Tampa)",
          "Mandarin Hide (Downtown, St. Petersburg)",
          "Hotel Bar (Downtown, Tampa)",
          "Ruby's Elixir (Downtown, St. Petersburg)",
          "Morgan's Cove (Downtown, Tampa)",
          "Copper Shaker (Downtown, St. Petersburg)",
          "CW's Gin Joint (Downtown, Tampa)",
          "Red Thread (Downtown, St. Petersburg)",
        ],
      },
      yelp: {
        label: 'Yelp \u00b7 Ranked by Rating (May 2026)',
        items: [
          "Bar Mezzo (Downtown, St. Petersburg)",
          "In Between Days (Midtown, St. Petersburg)",
          "Copper Shaker (Ybor City, Tampa)",
          "Morgan's Cove (Downtown, Tampa)",
          "Red Thread (Downtown, St. Petersburg)",
          "Mandarin Hide (Downtown, St. Petersburg)",
          "Hotel Bar (Downtown, Tampa)",
          "Mandarin Heights (Seminole Heights, Tampa)",
          "Copper Shaker (Downtown, St. Petersburg)",
          "CW's Gin Joint (Downtown, Tampa)",
          "Ruby's Elixir (Downtown, St. Petersburg)",
          "COCKtail St. Pete (Grand Central District, St. Petersburg)",
        ],
      },
      google: {
        label: 'Google Reviews \u00b7 Ranked by Rating (May 2026)',
        items: [
          "Bar Mezzo (Downtown, St. Petersburg)",
          "Ruby's Elixir (Downtown, St. Petersburg)",
          "In Between Days (Midtown, St. Petersburg)",
          "Mandarin Hide (Downtown, St. Petersburg)",
          "Hotel Bar (Downtown, Tampa)",
          "Copper Shaker (Downtown, St. Petersburg)",
          "Copper Shaker (Ybor City, Tampa)",
          "CW's Gin Joint (Downtown, Tampa)",
          "Mandarin Heights (Seminole Heights, Tampa)",
          "Morgan's Cove (Downtown, Tampa)",
          "Red Thread (Downtown, St. Petersburg)",
          "COCKtail St. Pete (Grand Central District, St. Petersburg)",
        ],
      },
      tampamag: {
        label: 'Tampa Magazine \u00b7 Best of the City 2025 (Best Cocktails)',
        items: [
          "CW's Gin Joint (Downtown, Tampa)",
          "Mandarin Heights (Seminole Heights, Tampa)",
          "Hotel Bar (Downtown, Tampa)",
          "Mandarin Hide (Downtown, St. Petersburg)",
        ],
      },
      cltampa: {
        label: 'Creative Loafing \u00b7 Best of the Bay 2025 (Best Bar)',
        items: [
          "CW's Gin Joint (Downtown, Tampa)",
          "COCKtail St. Pete (Grand Central District, St. Petersburg)",
          "Copper Shaker (Ybor City, Tampa)",
        ],
      },
    },
    vote: {
      items: [
          "Bar Mezzo (Downtown, St. Petersburg)",
          "In Between Days (Midtown, St. Petersburg)",
          "Copper Shaker (Ybor City, Tampa)",
          "Mandarin Hide (Downtown, St. Petersburg)",
          "Hotel Bar (Downtown, Tampa)",
          "Ruby's Elixir (Downtown, St. Petersburg)",
          "Morgan's Cove (Downtown, Tampa)",
          "Copper Shaker (Downtown, St. Petersburg)",
          "CW's Gin Joint (Downtown, Tampa)",
          "Red Thread (Downtown, St. Petersburg)",
      ],
    },
  },
  {
    id: 'best-indian-restaurants-london',
    publishedDate: '2026-06-01',
    publishedAt: '2026-06-01T01:28:23Z',
    title: 'Best Indian Restaurants in London',
    category: 'London',
    type: 'food',
    tags: ['food', 'food-drink', 'stores'],
    linkType: 'mapsCity',
    blurb: 'Two Michelin stars, decades of critical accolades, and a diaspora that has shaped the city\'s food culture. London is the Indian dining capital of the world outside the subcontinent.',
    defaultSource: 'ai',
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          'Gymkhana (Mayfair)',
          'Bibi (Mayfair)',
          'Trishna (Marylebone)',
          'Brigadiers (City)',
          'Dishoom (Covent Garden)',
          'Darjeeling Express (Soho)',
          'Jamavar (Mayfair)',
          'Veeraswamy (Regent Street)',
          'Amaya (Belgravia)',
          'Ambassadors Clubhouse (Mayfair)',
        ],
      },
      infatuation: {
        label: 'The Infatuation London · Best Indian 2026 (by 0–10 score)',
        items: [
          'Bibi (Mayfair)',
          'Gymkhana (Mayfair)',
          'Shankeys (Hackney)',
          'Ambassadors Clubhouse (Mayfair)',
          'Darjeeling Express (Soho)',
          'Brigadiers (City)',
          'The Tamil Prince (Islington)',
          'Trishna (Marylebone)',
          'Kokum (East Dulwich)',
          'Bombay Bustle (Mayfair)',
          'Jamavar (Mayfair)',
        ],
      },
      timeout: {
        label: 'Time Out London 2026',
        items: [
          'Rasa (Stoke Newington)',
          'Brigadiers (City)',
          'Kokum (East Dulwich)',
          'Darjeeling Express (Soho)',
          'Dishoom (Covent Garden)',
          'Trishna (Marylebone)',
          'Veeraswamy (Regent Street)',
          'Bibi (Mayfair)',
        ],
      },
      michelin_starred: {
        label: 'Michelin Guide 2025 · Starred Indian Restaurants London',
        items: [
          'Gymkhana (Mayfair)',
          'Amaya (Belgravia)',
          'Ambassadors Clubhouse (Mayfair)',
          'Benares (Mayfair)',
          'Jamavar (Mayfair)',
          'Quilon (Victoria)',
          'Trishna (Marylebone)',
          'Veeraswamy (Regent Street)',
        ],
      },
      michelin_bestof: {
        label: 'Michelin Guide · Best Indian London 2023 (unordered)',
        unordered: true,
        items: [
          'Amaya (Belgravia)',
          'Bombay Bustle (Mayfair)',
          'Brigadiers (City)',
          "Chutney Mary (St James's)",
          'Gunpowder (Spitalfields)',
          'Heritage Dulwich (Dulwich)',
          'Kahani (Chelsea)',
          'Pahli Hill (Marylebone)',
          'Quilon (Victoria)',
          'Tamarind (Mayfair)',
        ],
      },
    },
    vote: {
      items: [
        'Gymkhana (Mayfair)',
        'Bibi (Mayfair)',
        'Trishna (Marylebone)',
        'Brigadiers (City)',
        'Dishoom (Covent Garden)',
        'Darjeeling Express (Soho)',
        'Jamavar (Mayfair)',
        'Veeraswamy (Regent Street)',
        'Amaya (Belgravia)',
        'Ambassadors Clubhouse (Mayfair)',
      ],
    },
    links: {
      'Gymkhana (Mayfair)': 'https://www.google.com/maps/search/?api=1&query=Gymkhana%20Mayfair%20London',
      'Bibi (Mayfair)': 'https://www.google.com/maps/search/?api=1&query=Bibi%20Mayfair%20London',
      'Shankeys (Hackney)': 'https://www.google.com/maps/search/?api=1&query=Shankeys%20Hackney%20London',
      'Ambassadors Clubhouse (Mayfair)': 'https://www.google.com/maps/search/?api=1&query=Ambassadors%20Clubhouse%20Mayfair%20London',
      'Darjeeling Express (Soho)': 'https://www.google.com/maps/search/?api=1&query=Darjeeling%20Express%20Soho%20London',
      'Brigadiers (City)': 'https://www.google.com/maps/search/?api=1&query=Brigadiers%20Bloomberg%20Arcade%20London',
      'The Tamil Prince (Islington)': 'https://www.google.com/maps/search/?api=1&query=The%20Tamil%20Prince%20Islington%20London',
      'Trishna (Marylebone)': 'https://www.google.com/maps/search/?api=1&query=Trishna%20Marylebone%20London',
      'Kokum (East Dulwich)': 'https://www.google.com/maps/search/?api=1&query=Kokum%20East%20Dulwich%20London',
      'Bombay Bustle (Mayfair)': 'https://www.google.com/maps/search/?api=1&query=Bombay%20Bustle%20Mayfair%20London',
      'Jamavar (Mayfair)': 'https://www.google.com/maps/search/?api=1&query=Jamavar%20Mayfair%20London',
      'Rasa (Stoke Newington)': 'https://www.google.com/maps/search/?api=1&query=Rasa%20Stoke%20Newington%20London',
      'Dishoom (Covent Garden)': 'https://www.google.com/maps/search/?api=1&query=Dishoom%20Covent%20Garden%20London',
      'Veeraswamy (Regent Street)': 'https://www.google.com/maps/search/?api=1&query=Veeraswamy%20Regent%20Street%20London',
      'Amaya (Belgravia)': 'https://www.google.com/maps/search/?api=1&query=Amaya%20Belgravia%20London',
      'Benares (Mayfair)': 'https://www.google.com/maps/search/?api=1&query=Benares%20Mayfair%20London',
      'Quilon (Victoria)': 'https://www.google.com/maps/search/?api=1&query=Quilon%20Victoria%20London',
      "Chutney Mary (St James's)": 'https://www.google.com/maps/search/?api=1&query=Chutney%20Mary%20St%20James%27s%20London',
      'Gunpowder (Spitalfields)': 'https://www.google.com/maps/search/?api=1&query=Gunpowder%20Spitalfields%20London',
      'Heritage Dulwich (Dulwich)': 'https://www.google.com/maps/search/?api=1&query=Heritage%20Dulwich%20London',
      'Kahani (Chelsea)': 'https://www.google.com/maps/search/?api=1&query=Kahani%20Chelsea%20London',
      'Pahli Hill (Marylebone)': 'https://www.google.com/maps/search/?api=1&query=Pahli%20Hill%20Marylebone%20London',
      'Tamarind (Mayfair)': 'https://www.google.com/maps/search/?api=1&query=Tamarind%20Mayfair%20London',
    },
  },
  {
    id: 'best-pizza-london',
    publishedDate: '2026-06-01',
    publishedAt: '2026-06-01T01:28:24Z',
    title: 'Best Pizza in London',
    category: 'London',
    type: 'food',
    tags: ['food', 'food-drink', 'stores'],
    linkType: 'mapsCity',
    blurb: 'Neapolitan masters, New York slice shops, and blistered pub residencies: London\'s pizza scene now rivals any city in the world. These are the places worth the wait.',
    defaultSource: 'ai',
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          'Crisp Pizza (Mayfair)',
          "Vincenzo's (Shoreditch)",
          'Napoli on the Road (Soho)',
          'Short Road Pizza (Leyton)',
          'Dough Hands (Hackney)',
          'Bad Boy Pizzeria (Bethnal Green)',
          'Spring Street Pizza (Southwark)',
          'Alley Cats Pizza (Marylebone)',
          'Breadstall (Soho)',
          "Carmela's Pizzeria (Islington)",
        ],
      },
      infatuation: {
        label: 'The Infatuation London · Best Pizza 2026 (by 0–10 score)',
        items: [
          "Vincenzo's (Shoreditch)",
          'Crisp Pizza (Mayfair)',
          'Alley Cats Pizza (Marylebone)',
          'Short Road Pizza (Leyton)',
          "Theo's Pizzeria (Camberwell)",
          'Dough Hands (Hackney)',
          "Lauretta's Pizzeria (Hackney)",
          '67 Sourdough (East Finchley)',
          'Detroit Pizza (Spitalfields)',
          'Breadstall (Soho)',
          "Ria's (Notting Hill)",
          'Vasiniko (Covent Garden)',
          'Yard Sale Pizza (Clapton)',
          'Bar D4100 (Nunhead)',
          'Spring Street Pizza (Southwark)',
          "L'Antica Pizzeria da Michele (Soho)",
          'Pizzeria Pappagone (Finsbury Park)',
        ],
      },
      timeout: {
        label: 'Time Out London 2026',
        items: [
          'Short Road Pizza (Leyton)',
          'Dough Hands (Hackney)',
          'Bad Boy Pizzeria (Bethnal Green)',
          'Spring Street Pizza (Southwark)',
          'Hot Saint Pizza (Islington)',
          'Ace Pizza (Victoria Park)',
          "Vincenzo's (Shoreditch)",
          'Bar Etna (Newington Green)',
          "Berberè (Kentish Town)",
          "Carmela's Pizzeria (Islington)",
          'Napoli on the Road (Soho)',
          'Breadstall (Soho)',
          'Bing Bong Pizza (Hackney)',
          "Rudy's (Soho)",
          'Little Earthquakes (Dalston)',
          'Yard Sale Pizza (Clapton)',
          'Crisp Pizza (Mayfair)',
          'Japes (Soho)',
          "Lauretta's Pizzeria (Hackney)",
          'Sodo Pizza (Clapton)',
          "Ria's (Notting Hill)",
          'Alley Cats Pizza (Marylebone)',
        ],
      },
      hotdinners: {
        label: 'Hot Dinners · Top 20 London Pizza 2026 (unordered)',
        unordered: true,
        items: [
          'Crisp Pizza (Mayfair)',
          "Vincenzo's (Shoreditch)",
          'Bad Boy Pizzeria (Bethnal Green)',
          "Carmela's Pizzeria (Islington)",
          "Lauretta's Pizzeria (Hackney)",
          'Napoli on the Road (Soho)',
          "Gracey's (Battersea)",
          "Sarv's Slice (Ealing)",
          'Spring Street Pizza (Southwark)',
          'Patio Pizza (Kingston)',
          'Short Road Pizza (Leyton)',
          'Breadstall (Soho)',
          'Dough Hands (Hackney)',
          'Detroit Pizza (Spitalfields)',
          'Ace Pizza (Victoria Park)',
          "World Famous Gordo's (London Fields)",
          'Alley Cats Pizza (Marylebone)',
          '50 Kalò di Ciro Salvo (Westminster)',
          "L'Antica Pizzeria da Michele (Soho)",
          'Made of Dough (Crystal Palace)',
        ],
      },
    },
    vote: {
      items: [
        'Crisp Pizza (Mayfair)',
        "Vincenzo's (Shoreditch)",
        'Napoli on the Road (Soho)',
        'Short Road Pizza (Leyton)',
        'Dough Hands (Hackney)',
        'Bad Boy Pizzeria (Bethnal Green)',
        'Spring Street Pizza (Southwark)',
        'Alley Cats Pizza (Marylebone)',
        'Breadstall (Soho)',
        "Carmela's Pizzeria (Islington)",
      ],
    },
    links: {
      'Crisp Pizza (Mayfair)': 'https://www.google.com/maps/search/?api=1&query=Crisp%20Pizza%20Mayfair%20London',
      "Vincenzo's (Shoreditch)": 'https://www.google.com/maps/search/?api=1&query=Vincenzo%27s%20Shoreditch%20London',
      'Napoli on the Road (Soho)': 'https://www.google.com/maps/search/?api=1&query=Napoli%20on%20the%20Road%20Soho%20London',
      'Short Road Pizza (Leyton)': 'https://www.google.com/maps/search/?api=1&query=Short%20Road%20Pizza%20Leyton%20London',
      'Dough Hands (Hackney)': 'https://www.google.com/maps/search/?api=1&query=Dough%20Hands%20Hackney%20London',
      'Bad Boy Pizzeria (Bethnal Green)': 'https://www.google.com/maps/search/?api=1&query=Bad%20Boy%20Pizzeria%20Bethnal%20Green%20London',
      'Spring Street Pizza (Southwark)': 'https://www.google.com/maps/search/?api=1&query=Spring%20Street%20Pizza%20Southwark%20London',
      'Alley Cats Pizza (Marylebone)': 'https://www.google.com/maps/search/?api=1&query=Alley%20Cats%20Pizza%20Marylebone%20London',
      'Breadstall (Soho)': 'https://www.google.com/maps/search/?api=1&query=Breadstall%20Soho%20London',
      "Carmela's Pizzeria (Islington)": 'https://www.google.com/maps/search/?api=1&query=Carmela%27s%20Pizzeria%20Islington%20London',
      'Alley Cats Pizza (Marylebone)': 'https://www.google.com/maps/search/?api=1&query=Alley%20Cats%20Pizza%20Marylebone%20London',
      "Theo's Pizzeria (Camberwell)": 'https://www.google.com/maps/search/?api=1&query=Theo%27s%20Pizzeria%20Camberwell%20London',
      "Lauretta's Pizzeria (Hackney)": 'https://www.google.com/maps/search/?api=1&query=Lauretta%27s%20Pizzeria%20Hackney%20London',
      '67 Sourdough (East Finchley)': 'https://www.google.com/maps/search/?api=1&query=67%20Sourdough%20East%20Finchley%20London',
      'Detroit Pizza (Spitalfields)': 'https://www.google.com/maps/search/?api=1&query=Detroit%20Pizza%20Spitalfields%20London',
      "Ria's (Notting Hill)": 'https://www.google.com/maps/search/?api=1&query=Ria%27s%20Notting%20Hill%20London',
      'Vasiniko (Covent Garden)': 'https://www.google.com/maps/search/?api=1&query=Vasiniko%20Covent%20Garden%20London',
      'Yard Sale Pizza (Clapton)': 'https://www.google.com/maps/search/?api=1&query=Yard%20Sale%20Pizza%20Clapton%20London',
      'Bar D4100 (Nunhead)': 'https://www.google.com/maps/search/?api=1&query=Bar%20D4100%20Nunhead%20London',
      "L'Antica Pizzeria da Michele (Soho)": 'https://www.google.com/maps/search/?api=1&query=L%27Antica%20Pizzeria%20da%20Michele%20Soho%20London',
      'Pizzeria Pappagone (Finsbury Park)': 'https://www.google.com/maps/search/?api=1&query=Pizzeria%20Pappagone%20Finsbury%20Park%20London',
      'Hot Saint Pizza (Islington)': 'https://www.google.com/maps/search/?api=1&query=Hot%20Saint%20Pizza%20Islington%20London',
      'Ace Pizza (Victoria Park)': 'https://www.google.com/maps/search/?api=1&query=Ace%20Pizza%20Victoria%20Park%20London',
      'Bar Etna (Newington Green)': 'https://www.google.com/maps/search/?api=1&query=Bar%20Etna%20Newington%20Green%20London',
      "Berberè (Kentish Town)": 'https://www.google.com/maps/search/?api=1&query=Berber%C3%A8%20Kentish%20Town%20London',
      'Bing Bong Pizza (Hackney)': 'https://www.google.com/maps/search/?api=1&query=Bing%20Bong%20Pizza%20Hackney%20London',
      "Rudy's (Soho)": 'https://www.google.com/maps/search/?api=1&query=Rudy%27s%20Soho%20London',
      'Little Earthquakes (Dalston)': 'https://www.google.com/maps/search/?api=1&query=Little%20Earthquakes%20Dalston%20London',
      'Japes (Soho)': 'https://www.google.com/maps/search/?api=1&query=Japes%20Soho%20London',
      'Sodo Pizza (Clapton)': 'https://www.google.com/maps/search/?api=1&query=Sodo%20Pizza%20Clapton%20London',
      "Gracey's (Battersea)": 'https://www.google.com/maps/search/?api=1&query=Gracey%27s%20Battersea%20London',
      "Sarv's Slice (Ealing)": 'https://www.google.com/maps/search/?api=1&query=Sarv%27s%20Slice%20Ealing%20London',
      'Patio Pizza (Kingston)': 'https://www.google.com/maps/search/?api=1&query=Patio%20Pizza%20Kingston%20London',
      "World Famous Gordo's (London Fields)": 'https://www.google.com/maps/search/?api=1&query=World%20Famous%20Gordo%27s%20London%20Fields',
      '50 Kalò di Ciro Salvo (Westminster)': 'https://www.google.com/maps/search/?api=1&query=50%20Kal%C3%B2%20di%20Ciro%20Salvo%20Westminster%20London',
      'Made of Dough (Crystal Palace)': 'https://www.google.com/maps/search/?api=1&query=Made%20of%20Dough%20Crystal%20Palace%20London',
    },
  },
  {
    id: 'best-sushi-tampa-bay',
    publishedDate: '2026-06-01',
    publishedAt: '2026-06-01T03:20:27Z',
    title: 'Best Sushi in Tampa Bay',
    category: 'Tampa Bay',
    type: 'food',
    tags: ['food', 'food-drink', 'stores'],
    linkType: 'mapsCity',
    blurb: 'Michelin-starred omakase counters, Toyosu-direct fish, and neighborhood sushi-ya that have won every local poll for years. Tampa Bay has quietly become one of the best cities in the South for serious sushi.',
    defaultSource: 'ai',
    sources: {
      ai: {
        label: 'Consensus Seed',
        items: [
          'Kōsen (Tampa Heights, Tampa)',
          'Koya (Hyde Park, Tampa)',
          'Sushi Sho Rexley (Downtown, St. Petersburg)',
          'Izakaya Tori (South Tampa, Tampa)',
          'SoHo Sushi (South Tampa, Tampa)',
          'Kelp Sushi Joint (Palma Ceia, Tampa)',
          'Sunda New Asian (Midtown, Tampa)',
          'Nori Nori Craft Handrolls (Seminole Heights, Tampa)',
          'Sushark (Interbay, Tampa)',
          "Yoko's (South Tampa, Tampa)",
        ],
      },
      yelp: {
        label: 'Yelp · Ranked by Rating (June 2026)',
        items: [
          'Koya (Hyde Park, Tampa)',
          'Nori Nori Craft Handrolls (Seminole Heights, Tampa)',
          'Izakaya Tori (South Tampa, Tampa)',
          'Sunda New Asian (Midtown, Tampa)',
          'Sushi Sho Rexley (Downtown, St. Petersburg)',
          'SoHo Sushi (South Tampa, Tampa)',
          'Kōsen (Tampa Heights, Tampa)',
          "Yoko's (South Tampa, Tampa)",
          'Kelp Sushi Joint (Palma Ceia, Tampa)',
          'Sushark (Interbay, Tampa)',
        ],
      },
      michelin: {
        label: 'Michelin Guide Florida 2025 · Tampa Bay Sushi',
        items: [
          'Kōsen (Tampa Heights, Tampa)',
          'Koya (Hyde Park, Tampa)',
          'Sushi Sho Rexley (Downtown, St. Petersburg)',
        ],
      },
      tampa_mag_2026: {
        label: 'Tampa Magazine Best Sushi 2026 (unordered)',
        unordered: true,
        items: [
          'Izakaya Tori (South Tampa, Tampa)',
          'Kelp Sushi Joint (Palma Ceia, Tampa)',
          'SoHo Sushi (South Tampa, Tampa)',
          'Kōsen (Tampa Heights, Tampa)',
          'Sunda New Asian (Midtown, Tampa)',
        ],
      },
      tampa_mag_2025: {
        label: 'Tampa Magazine Best Sushi 2025 (unordered)',
        unordered: true,
        items: [
          'SoHo Sushi (South Tampa, Tampa)',
          'Sushark (Interbay, Tampa)',
          'Sunda New Asian (Midtown, Tampa)',
          'The Lure (Downtown, St. Petersburg)',
          "Yoko's (South Tampa, Tampa)",
          'Samurai Blue (Ybor City, Tampa)',
        ],
      },
    },
    vote: {
      items: [
        'Kōsen (Tampa Heights, Tampa)',
        'Koya (Hyde Park, Tampa)',
        'Sushi Sho Rexley (Downtown, St. Petersburg)',
        'Izakaya Tori (South Tampa, Tampa)',
        'SoHo Sushi (South Tampa, Tampa)',
        'Kelp Sushi Joint (Palma Ceia, Tampa)',
        'Sunda New Asian (Midtown, Tampa)',
        'Nori Nori Craft Handrolls (Seminole Heights, Tampa)',
        'Sushark (Interbay, Tampa)',
        "Yoko's (South Tampa, Tampa)",
      ],
    },
    links: {
      'Kōsen (Tampa Heights, Tampa)': 'https://www.google.com/maps/search/?api=1&query=K%C5%8Dsen%20Tampa%20Heights%20Tampa',
      'Koya (Hyde Park, Tampa)': 'https://www.google.com/maps/search/?api=1&query=Koya%20Hyde%20Park%20Tampa',
      'Sushi Sho Rexley (Downtown, St. Petersburg)': 'https://www.google.com/maps/search/?api=1&query=Sushi%20Sho%20Rexley%20Downtown%20St%20Petersburg',
      'Izakaya Tori (South Tampa, Tampa)': 'https://www.google.com/maps/search/?api=1&query=Izakaya%20Tori%20South%20Tampa%20Tampa',
      'SoHo Sushi (South Tampa, Tampa)': 'https://www.google.com/maps/search/?api=1&query=SoHo%20Sushi%20South%20Tampa%20Tampa',
      'Kelp Sushi Joint (Palma Ceia, Tampa)': 'https://www.google.com/maps/search/?api=1&query=Kelp%20Sushi%20Joint%20Palma%20Ceia%20Tampa',
      'Sunda New Asian (Midtown, Tampa)': 'https://www.google.com/maps/search/?api=1&query=Sunda%20New%20Asian%20Midtown%20Tampa',
      'Nori Nori Craft Handrolls (Seminole Heights, Tampa)': 'https://www.google.com/maps/search/?api=1&query=Nori%20Nori%20Craft%20Handrolls%20Seminole%20Heights%20Tampa',
      'Sushark (Interbay, Tampa)': 'https://www.google.com/maps/search/?api=1&query=Sushark%20Interbay%20Tampa',
      "Yoko's (South Tampa, Tampa)": 'https://www.google.com/maps/search/?api=1&query=Yoko%27s%20South%20Tampa%20Tampa',
      'The Lure (Downtown, St. Petersburg)': 'https://www.google.com/maps/search/?api=1&query=The%20Lure%20Downtown%20St%20Petersburg',
      'Samurai Blue (Ybor City, Tampa)': 'https://www.google.com/maps/search/?api=1&query=Samurai%20Blue%20Ybor%20City%20Tampa',
    },
  },
];

export { LISTS, TYPES, COLORS, AMAZON_AFFILIATE_TAG, BOOKING_AFFILIATE_AID, TRIPADVISOR_PARTNER };

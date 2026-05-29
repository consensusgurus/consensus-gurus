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
   - type: primary category (used for legacy code paths)
   - tags (optional): array of all categories this list belongs to. If absent,
     falls back to [type]. The filter chips on the home page use tags.
   - mode (optional): 'facts' (no voting), 'votes' (no source tab)
   - sources: expert source lists can have any number of items (not limited to 10)
     Consensus will always be exactly 10 items (top 10 by Borda scoring)
   ========================================================================= */

const LISTS = [
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
    "publishedDate": "2026-05-24",
    "publishedAt": "2026-05-24T12:00:00Z",
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
      "Waldorf Astoria Los Cabos Pedregal (Pedregal)": "https://www.google.com/maps/search/?api=1&query=Waldorf%20Astoria%20Los%20Cabos%20Pedregal%20Pedregal",
      "Esperanza, Auberge Collection (Punta Ballena)": "https://www.google.com/maps/search/?api=1&query=Esperanza%20Auberge%20Collection%20Punta%20Ballena",
      "One&Only Palmilla (Palmilla)": "https://www.google.com/maps/search/?api=1&query=One%20Only%20Palmilla%20Palmilla",
      "Las Ventanas al Paraiso, A Rosewood Resort (Tourist Corridor)": "https://www.google.com/maps/search/?api=1&query=Las%20Ventanas%20al%20Paraiso%20A%20Rosewood%20Resort%20Tourist%20Corridor",
      "Grand Velas Los Cabos (Tourist Corridor)": "https://www.google.com/maps/search/?api=1&query=Grand%20Velas%20Los%20Cabos%20Tourist%20Corridor",
      "Nobu Hotel Los Cabos (Diamante)": "https://www.google.com/maps/search/?api=1&query=Nobu%20Hotel%20Los%20Cabos%20Diamante",
      "Montage Los Cabos (Santa Maria Bay)": "https://www.google.com/maps/search/?api=1&query=Montage%20Los%20Cabos%20Santa%20Maria%20Bay",
      "Four Seasons Resort Los Cabos at Costa Palmas (East Cape)": "https://www.google.com/maps/search/?api=1&query=Four%20Seasons%20Resort%20Los%20Cabos%20at%20Costa%20Palmas%20East%20Cape",
      "Chileno Bay Resort, Auberge Collection (Chileno Bay)": "https://www.google.com/maps/search/?api=1&query=Chileno%20Bay%20Resort%20Auberge%20Collection%20Chileno%20Bay",
      "Hotel El Ganzo (Puerto Los Cabos)": "https://www.google.com/maps/search/?api=1&query=Hotel%20El%20Ganzo%20Puerto%20Los%20Cabos",
      "Grand Solmar Pacific Dunes (Rancho San Lucas)": "https://www.google.com/maps/search/?api=1&query=Grand%20Solmar%20Pacific%20Dunes%20Rancho%20San%20Lucas",
      "Garza Blanca Resort & Spa Los Cabos (Tourist Corridor)": "https://www.google.com/maps/search/?api=1&query=Garza%20Blanca%20Resort%20Spa%20Los%20Cabos%20Tourist%20Corridor",
      "Pueblo Bonito Sunset Beach (Pacific Side)": "https://www.google.com/maps/search/?api=1&query=Pueblo%20Bonito%20Sunset%20Beach%20Pacific%20Side",
      "Hyatt Ziva Los Cabos (San Jose del Cabo)": "https://www.google.com/maps/search/?api=1&query=Hyatt%20Ziva%20Los%20Cabos%20San%20Jose%20del%20Cabo",
      "1 Homes Preview Cabo (Medano Beach)": "https://www.google.com/maps/search/?api=1&query=1%20Homes%20Preview%20Cabo%20Medano%20Beach"
    },
    "blurb": "Where the Sea of Cortez meets the Pacific. Cliffside suites, infinity pools, and El Arco views.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Waldorf Astoria Los Cabos Pedregal (Pedregal)",
          "Esperanza, Auberge Collection (Punta Ballena)",
          "One&Only Palmilla (Palmilla)",
          "Las Ventanas al Paraiso, A Rosewood Resort (Tourist Corridor)",
          "Grand Velas Los Cabos (Tourist Corridor)",
          "Nobu Hotel Los Cabos (Diamante)",
          "Montage Los Cabos (Santa Maria Bay)",
          "Four Seasons Resort Los Cabos at Costa Palmas (East Cape)",
          "Chileno Bay Resort, Auberge Collection (Chileno Bay)",
          "Hotel El Ganzo (Puerto Los Cabos)"
        ]
      },
      "tripadvisor": {
        "label": "Tripadvisor Travelers Choice",
        "items": [
          "Grand Solmar Pacific Dunes (Rancho San Lucas)",
          "Esperanza, Auberge Collection (Punta Ballena)",
          "Waldorf Astoria Los Cabos Pedregal (Pedregal)",
          "Garza Blanca Resort & Spa Los Cabos (Tourist Corridor)",
          "Pueblo Bonito Sunset Beach (Pacific Side)",
          "One&Only Palmilla (Palmilla)",
          "Chileno Bay Resort, Auberge Collection (Chileno Bay)",
          "Las Ventanas al Paraiso, A Rosewood Resort (Tourist Corridor)",
          "Nobu Hotel Los Cabos (Diamante)",
          "Hyatt Ziva Los Cabos (San Jose del Cabo)"
        ],
        "url": "https://www.tripadvisor.com/Hotels-g152515-Cabo_San_Lucas_Los_Cabos_Baja_California-Hotels.html"
      },
      "trip": {
        "label": "Trip.com Popular",
        "items": [
          "Waldorf Astoria Los Cabos Pedregal (Pedregal)",
          "1 Homes Preview Cabo (Medano Beach)",
          "Esperanza, Auberge Collection (Punta Ballena)",
          "One&Only Palmilla (Palmilla)",
          "Grand Velas Los Cabos (Tourist Corridor)",
          "Montage Los Cabos (Santa Maria Bay)",
          "Nobu Hotel Los Cabos (Diamante)",
          "Chileno Bay Resort, Auberge Collection (Chileno Bay)",
          "Las Ventanas al Paraiso, A Rosewood Resort (Tourist Corridor)",
          "Four Seasons Resort Los Cabos at Costa Palmas (East Cape)"
        ]
      }
    },
    "vote": {
      "items": [
        "Waldorf Astoria Los Cabos Pedregal (Pedregal)",
        "Esperanza, Auberge Collection (Punta Ballena)",
        "One&Only Palmilla (Palmilla)",
        "Las Ventanas al Paraiso, A Rosewood Resort (Tourist Corridor)",
        "Montage Los Cabos (Santa Maria Bay)",
        "Four Seasons Resort Los Cabos at Costa Palmas (East Cape)",
        "Grand Velas Los Cabos (Tourist Corridor)",
        "Nobu Hotel Los Cabos (Diamante)",
        "Chileno Bay Resort, Auberge Collection (Chileno Bay)",
        "Grand Solmar Pacific Dunes (Rancho San Lucas)"
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
          "Monaco Grand Prix",
          "British Grand Prix",
          "Italian Grand Prix",
          "Belgian Grand Prix",
          "Mexico City Grand Prix",
          "Japanese Grand Prix",
          "São Paulo Grand Prix",
          "Dutch Grand Prix",
          "Singapore Grand Prix",
          "Las Vegas Grand Prix"
        ]
      },
      "f1experiences": {
        "label": "F1 Experiences",
        "items": [
          "Italian Grand Prix",
          "British Grand Prix",
          "Monaco Grand Prix",
          "Belgian Grand Prix",
          "Japanese Grand Prix",
          "Australian Grand Prix",
          "Canadian Grand Prix",
          "United States Grand Prix",
          "São Paulo Grand Prix",
          "Hungarian Grand Prix"
        ],
        "url": "https://f1experiences.com/blog/ranked-top-10-classic-f1-circuits-to-experience"
      },
      "motorsport": {
        "label": "Motorsport.com",
        "items": [
          "Monaco Grand Prix",
          "Dutch Grand Prix",
          "British Grand Prix",
          "Mexico City Grand Prix",
          "Italian Grand Prix",
          "Belgian Grand Prix",
          "Japanese Grand Prix",
          "São Paulo Grand Prix",
          "Singapore Grand Prix",
          "United States Grand Prix"
        ],
        "url": "https://www.motorsport.com/f1/news/our-f1-writers-rank-their-favourite-f1-circuits/10790604/"
      },
      "grandprix247": {
        "label": "GrandPrix247",
        "items": [
          "Monaco Grand Prix",
          "British Grand Prix",
          "Belgian Grand Prix",
          "Italian Grand Prix",
          "Japanese Grand Prix",
          "Mexico City Grand Prix",
          "São Paulo Grand Prix",
          "Australian Grand Prix",
          "Singapore Grand Prix",
          "Canadian Grand Prix"
        ],
        "url": "https://www.grandprix247.com/f1-opinion/top-formula-1-grand-prix-circuits-every-motorsport-fan-must-visit"
      }
    },
    "vote": {
      "items": [
        "Monaco Grand Prix",
        "British Grand Prix",
        "Italian Grand Prix",
        "Belgian Grand Prix",
        "Japanese Grand Prix",
        "São Paulo Grand Prix",
        "Mexico City Grand Prix",
        "Dutch Grand Prix",
        "Singapore Grand Prix",
        "Las Vegas Grand Prix"
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
          "Augusta National Golf Club",
          "Pine Valley Golf Club",
          "Cypress Point Club",
          "Muirfield (Honourable Company of Edinburgh Golfers)",
          "Royal Melbourne Golf Club (West)",
          "Shinnecock Hills Golf Club",
          "Seminole Golf Club",
          "National Golf Links of America",
          "Hirono Golf Club",
          "Loch Lomond Golf Club"
        ]
      },
      "golfmag": {
        "label": "GOLF Magazine 14 Most Exclusive",
        "items": [
          "Pine Valley Golf Club",
          "Seminole Golf Club",
          "Chicago Golf Club",
          "Cypress Point Club",
          "Nanea Golf Club",
          "Augusta National Golf Club",
          "Shinnecock Hills Golf Club",
          "National Golf Links of America",
          "San Francisco Golf Club",
          "Merion Golf Club"
        ],
        "url": "https://golf.com/travel/most-exclusive-clubs-2024-top-100/"
      },
      "billionaire": {
        "label": "Billionaire.com Top 10",
        "items": [
          "Cypress Point Club",
          "National Golf Links of America",
          "Augusta National Golf Club",
          "Golf de Morfontaine",
          "Loch Lomond Golf Club",
          "Los Angeles Country Club",
          "Royal Melbourne Golf Club (West)",
          "Hirono Golf Club",
          "Swinley Forest Golf Club",
          "Gleneagles"
        ]
      },
      "yourgolftravel": {
        "label": "Your Golf Travel · Fairway Tours",
        "items": [
          "Augusta National Golf Club",
          "Pine Valley Golf Club",
          "Muirfield (Honourable Company of Edinburgh Golfers)",
          "Royal Melbourne Golf Club (West)",
          "Royal County Down Golf Club",
          "Hirono Golf Club",
          "Loch Lomond Golf Club",
          "Cypress Point Club",
          "Shinnecock Hills Golf Club",
          "Swinley Forest Golf Club"
        ],
        "url": "https://www.yourgolftravel.com/19th-hole/top-10-exclusive-golf-clubs/"
      }
    },
    "vote": {
      "items": [
        "Augusta National Golf Club",
        "Pine Valley Golf Club",
        "Cypress Point Club",
        "Shinnecock Hills Golf Club",
        "Muirfield (Honourable Company of Edinburgh Golfers)",
        "Seminole Golf Club",
        "Royal Melbourne Golf Club (West)",
        "National Golf Links of America",
        "Loch Lomond Golf Club",
        "Hirono Golf Club"
      ]
    }
  },
  {
    "id": "movies",
    "publishedDate": "2026-05-24",
    "publishedAt": "2026-05-24T13:00:00Z",
    "title": "Best Movies of All Time",
    "category": "Cinema",
    "type": "entertainment",
    "tags": [
      "entertainment"
    ],
    "linkType": "imdb",
    "blurb": "The films that defined the medium and the ones the public refuses to forget.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "The Godfather",
          "Citizen Kane",
          "Casablanca",
          "The Shawshank Redemption",
          "Schindler's List",
          "Pulp Fiction",
          "2001: A Space Odyssey",
          "Vertigo",
          "Seven Samurai",
          "Lawrence of Arabia",
          "The Godfather Part II",
          "Goodfellas"
        ]
      },
      "imdb": {
        "label": "IMDB Top Rated",
        "items": [
          "The Shawshank Redemption",
          "The Godfather",
          "The Dark Knight",
          "The Godfather Part II",
          "12 Angry Men",
          "Schindler's List",
          "The Lord of the Rings: The Return of the King",
          "Pulp Fiction",
          "The Lord of the Rings: The Fellowship of the Ring",
          "The Good, the Bad and the Ugly",
          "Forrest Gump",
          "Fight Club"
        ],
        "url": "https://www.imdb.com/chart/top/"
      },
      "rotten": {
        "label": "Rotten Tomatoes 100 Best",
        "items": [
          "Citizen Kane",
          "Casablanca",
          "The Wizard of Oz",
          "Modern Times",
          "Black Panther",
          "Parasite",
          "Avengers: Endgame",
          "It Happened One Night",
          "Get Out",
          "The Cabinet of Dr. Caligari",
          "Singin' in the Rain",
          "All About Eve"
        ],
        "url": "https://editorial.rottentomatoes.com/guide/best-movies-of-all-time/"
      }
    },
    "vote": {
      "items": [
        "The Dark Knight",
        "Inception",
        "Forrest Gump",
        "Goodfellas",
        "The Matrix",
        "Spirited Away",
        "Parasite",
        "Fight Club",
        "Back to the Future",
        "Interstellar"
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
      "Brooklyn DOP (Williamsburg)": "https://www.google.com/maps/search/?api=1&query=Brooklyn%20DOP%20Williamsburg%20New%20York%20NY",
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
          "Brooklyn DOP (Williamsburg)",
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
    "publishedDate": "2026-05-27",
    "publishedAt": "2026-05-27T11:00:00Z",
    "title": "Best Burritos in San Diego",
    "category": "San Diego",
    "type": "stores",
    "tags": [
      "food",
      "food-drink",
      "stores"
    ],
    "linkType": "mapsCity",
    "links": {
      "Lolita's Mexican Food": "https://www.google.com/maps/search/?api=1&query=Lolita%27s%20Mexican%20Food",
      "Lucha Libre Gourmet Taco Shop": "https://www.google.com/maps/search/?api=1&query=Lucha%20Libre%20Gourmet%20Taco%20Shop",
      "El Zarape": "https://www.google.com/maps/search/?api=1&query=El%20Zarape",
      "Taco Stand (La Jolla)": "https://www.google.com/maps/search/?api=1&query=Taco%20Stand%20La%20Jolla",
      "Adalberto's Mexican Food": "https://www.google.com/maps/search/?api=1&query=Adalberto%27s%20Mexican%20Food",
      "Nico's Mexican Food": "https://www.google.com/maps/search/?api=1&query=Nico%27s%20Mexican%20Food",
      "Roberto's Taco Shop": "https://www.google.com/maps/search/?api=1&query=Roberto%27s%20Taco%20Shop",
      "Don Carlos Taco Shop": "https://www.google.com/maps/search/?api=1&query=Don%20Carlos%20Taco%20Shop",
      "La Puerta": "https://www.google.com/maps/search/?api=1&query=La%20Puerta",
      "Las Cuatro Milpas": "https://www.google.com/maps/search/?api=1&query=Las%20Cuatro%20Milpas",
      "La Perla Cocina": "https://www.google.com/maps/search/?api=1&query=La%20Perla%20Cocina",
      "Taco Surf": "https://www.google.com/maps/search/?api=1&query=Taco%20Surf"
    },
    "blurb": "Carne asada, no beans, no rice. The California burrito was invented here and the surf shops defend it. Every spot below makes a burrito worth ordering, even when 'Taco Shop' is on the sign.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Lolita's Mexican Food",
          "Lucha Libre Gourmet Taco Shop",
          "El Zarape",
          "Taco Stand (La Jolla)",
          "Adalberto's Mexican Food",
          "Nico's Mexican Food",
          "Roberto's Taco Shop",
          "Don Carlos Taco Shop",
          "La Puerta",
          "Las Cuatro Milpas"
        ]
      },
      "thrillist": {
        "label": "Thrillist · The Daily Meal",
        "items": [
          "Lucha Libre Gourmet Taco Shop",
          "Lolita's Mexican Food",
          "Taco Stand (La Jolla)",
          "El Zarape",
          "La Perla Cocina",
          "Nico's Mexican Food",
          "Adalberto's Mexican Food",
          "Taco Surf",
          "Don Carlos Taco Shop",
          "Roberto's Taco Shop"
        ],
        "url": "https://www.thedailymeal.com/best-burritos-america-gallery/"
      },
      "plnu": {
        "label": "PLNU Great Burrito Bracket",
        "items": [
          "Adalberto's Mexican Food",
          "El Zarape",
          "Las Cuatro Milpas",
          "Lolita's Mexican Food",
          "Taco Stand (La Jolla)",
          "Roberto's Taco Shop",
          "Lucha Libre Gourmet Taco Shop",
          "La Puerta",
          "Taco Surf",
          "Nico's Mexican Food"
        ],
        "url": "https://www.pointloma.edu/resources/undergraduate-studies/12-best-burritos-shops-san-diego"
      }
    },
    "vote": {
      "items": [
        "Lolita's Mexican Food",
        "Lucha Libre Gourmet Taco Shop",
        "El Zarape",
        "Taco Stand (La Jolla)",
        "Adalberto's Mexican Food",
        "Nico's Mexican Food",
        "Roberto's Taco Shop",
        "La Puerta",
        "Don Carlos Taco Shop",
        "Las Cuatro Milpas"
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
      "Ggiata": "https://www.google.com/maps/search/?api=1&query=Ggiata",
      "Uncle Paulie's Deli": "https://www.google.com/maps/search/?api=1&query=Uncle%20Paulie%27s%20Deli",
      "Goop Kitchen": "https://www.google.com/maps/search/?api=1&query=Goop%20Kitchen",
      "Garden Cafe": "https://www.google.com/maps/search/?api=1&query=Garden%20Cafe",
      "Aroma Coffee & Tea": "https://www.google.com/maps/search/?api=1&query=Aroma%20Coffee%20Tea",
      "Il Tramezzino": "https://www.google.com/maps/search/?api=1&query=Il%20Tramezzino",
      "Joan's on Third": "https://www.google.com/maps/search/?api=1&query=Joan%27s%20on%20Third",
      "Cafe Bizou": "https://www.google.com/maps/search/?api=1&query=Cafe%20Bizou",
      "Black Rabbit Cafe": "https://www.google.com/maps/search/?api=1&query=Black%20Rabbit%20Cafe",
      "Leora Cafe": "https://www.google.com/maps/search/?api=1&query=Leora%20Cafe",
      "Ggiata West Hollywood": "https://www.google.com/maps/search/?api=1&query=Ggiata%20West%20Hollywood"
    },
    "blurb": "Ggiata started a movement and the rest of the city followed. Crispy chicken, romaine, parmesan. The only debate is the dressing.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Ggiata",
          "Uncle Paulie's Deli",
          "Goop Kitchen",
          "Garden Cafe",
          "Aroma Coffee & Tea",
          "Il Tramezzino",
          "Joan's on Third",
          "Cafe Bizou",
          "Black Rabbit Cafe",
          "Leora Cafe"
        ]
      },
      "yelp": {
        "label": "Yelp Top 10",
        "items": [
          "Ggiata",
          "Uncle Paulie's Deli",
          "Garden Cafe",
          "Aroma Coffee & Tea",
          "Goop Kitchen",
          "Ggiata West Hollywood",
          "Il Tramezzino",
          "Black Rabbit Cafe",
          "Joan's on Third",
          "Leora Cafe"
        ],
        "url": "https://www.yelp.com/search?find_desc=Chicken+Caesar+Wrap&find_loc=Los+Angeles,+CA"
      },
      "latimes": {
        "label": "LA Times · Eater LA",
        "items": [
          "Ggiata",
          "Uncle Paulie's Deli",
          "Cafe Bizou",
          "Joan's on Third",
          "Goop Kitchen",
          "Il Tramezzino",
          "Garden Cafe",
          "Aroma Coffee & Tea",
          "Black Rabbit Cafe",
          "Leora Cafe"
        ]
      },
      "timeout": {
        "label": "Time Out Los Angeles",
        "items": [
          "Ggiata",
          "Goop Kitchen",
          "Uncle Paulie's Deli",
          "Joan's on Third",
          "Garden Cafe",
          "Leora Cafe",
          "Cafe Bizou",
          "Aroma Coffee & Tea",
          "Il Tramezzino",
          "Black Rabbit Cafe"
        ]
      }
    },
    "vote": {
      "items": [
        "Ggiata",
        "Uncle Paulie's Deli",
        "Goop Kitchen",
        "Joan's on Third",
        "Garden Cafe",
        "Il Tramezzino",
        "Aroma Coffee & Tea",
        "Cafe Bizou",
        "Leora Cafe",
        "Black Rabbit Cafe"
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
      "Tap 42": "https://www.google.com/maps/search/?api=1&query=Tap%2042",
      "Vinny's Cafe (Boca)": "https://www.google.com/maps/search/?api=1&query=Vinny%27s%20Cafe%20Boca",
      "The Brightside": "https://www.google.com/maps/search/?api=1&query=The%20Brightside",
      "Carrot Express": "https://www.google.com/maps/search/?api=1&query=Carrot%20Express",
      "Pura Vida Miami": "https://www.google.com/maps/search/?api=1&query=Pura%20Vida%20Miami",
      "Mister O1 South Beach": "https://www.google.com/maps/search/?api=1&query=Mister%20O1%20South%20Beach",
      "Pane e Vino": "https://www.google.com/maps/search/?api=1&query=Pane%20e%20Vino",
      "Cafe Papillon By The Beach": "https://www.google.com/maps/search/?api=1&query=Cafe%20Papillon%20By%20The%20Beach",
      "Giardino": "https://www.google.com/maps/search/?api=1&query=Giardino",
      "High Tide": "https://www.google.com/maps/search/?api=1&query=High%20Tide"
    },
    "blurb": "Boca's Vinny's Cafe set Florida on fire. The Miami spots that followed bring beach-town twists to the viral wrap.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Tap 42",
          "Vinny's Cafe (Boca)",
          "The Brightside",
          "Carrot Express",
          "Pura Vida Miami",
          "Mister O1 South Beach",
          "Pane e Vino",
          "Cafe Papillon By The Beach",
          "Giardino",
          "High Tide"
        ]
      },
      "miaminewtimes": {
        "label": "Miami New Times",
        "items": [
          "Vinny's Cafe (Boca)",
          "Tap 42",
          "The Brightside",
          "Pura Vida Miami",
          "Carrot Express",
          "Giardino",
          "Mister O1 South Beach",
          "Pane e Vino",
          "High Tide",
          "Cafe Papillon By The Beach"
        ]
      },
      "yelp": {
        "label": "Yelp Top 10",
        "items": [
          "Carrot Express",
          "The Brightside",
          "Pura Vida Miami",
          "Mister O1 South Beach",
          "Pane e Vino",
          "Cafe Papillon By The Beach",
          "High Tide",
          "Tap 42",
          "Giardino",
          "Vinny's Cafe (Boca)"
        ],
        "url": "https://www.yelp.com/search?find_desc=Chicken+Caesar+Wrap&find_loc=Miami,+FL"
      },
      "timeout": {
        "label": "Time Out Miami",
        "items": [
          "Tap 42",
          "Vinny's Cafe (Boca)",
          "Pura Vida Miami",
          "Carrot Express",
          "The Brightside",
          "Giardino",
          "Pane e Vino",
          "Mister O1 South Beach",
          "High Tide",
          "Cafe Papillon By The Beach"
        ]
      }
    },
    "vote": {
      "items": [
        "Tap 42",
        "Vinny's Cafe (Boca)",
        "Carrot Express",
        "The Brightside",
        "Pura Vida Miami",
        "Giardino",
        "Mister O1 South Beach",
        "Pane e Vino",
        "High Tide",
        "Cafe Papillon By The Beach"
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
      "Punky's Pizza & Pasta": "https://www.google.com/maps/search/?api=1&query=Punky%27s%20Pizza%20Pasta",
      "Little Victories": "https://www.google.com/maps/search/?api=1&query=Little%20Victories",
      "Nohea Cafe": "https://www.google.com/maps/search/?api=1&query=Nohea%20Cafe",
      "Village Tap": "https://www.google.com/maps/search/?api=1&query=Village%20Tap",
      "Moonwalker": "https://www.google.com/maps/search/?api=1&query=Moonwalker",
      "GG's Chicken Shop": "https://www.google.com/maps/search/?api=1&query=GG%27s%20Chicken%20Shop",
      "D'Amato's Bakery": "https://www.google.com/maps/search/?api=1&query=D%27Amato%27s%20Bakery",
      "Pompeii": "https://www.google.com/maps/search/?api=1&query=Pompeii",
      "Buttermilk Fry": "https://www.google.com/maps/search/?api=1&query=Buttermilk%20Fry",
      "Spilt Milk": "https://www.google.com/maps/search/?api=1&query=Spilt%20Milk"
    },
    "blurb": "From Bridgeport flatbread originals to Wicker Park fried chicken collabs. The CCW capital of the Midwest.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Punky's Pizza & Pasta",
          "Little Victories",
          "Nohea Cafe",
          "Village Tap",
          "Moonwalker",
          "GG's Chicken Shop",
          "D'Amato's Bakery",
          "Pompeii",
          "Buttermilk Fry",
          "Spilt Milk"
        ]
      },
      "infatuation": {
        "label": "The Infatuation 8 Best",
        "items": [
          "Punky's Pizza & Pasta",
          "Little Victories",
          "Nohea Cafe",
          "Village Tap",
          "Moonwalker",
          "Buttermilk Fry",
          "GG's Chicken Shop",
          "D'Amato's Bakery",
          "Spilt Milk",
          "Pompeii"
        ],
        "url": "https://www.theinfatuation.com/chicago/guides/best-caesar-wraps-chicago"
      },
      "tribune": {
        "label": "Chicago Tribune",
        "items": [
          "Punky's Pizza & Pasta",
          "Nohea Cafe",
          "Village Tap",
          "Moonwalker",
          "Little Victories",
          "GG's Chicken Shop",
          "Buttermilk Fry",
          "D'Amato's Bakery",
          "Pompeii",
          "Spilt Milk"
        ]
      },
      "yelp": {
        "label": "Yelp Top 10",
        "items": [
          "Little Victories",
          "Punky's Pizza & Pasta",
          "Nohea Cafe",
          "GG's Chicken Shop",
          "Village Tap",
          "D'Amato's Bakery",
          "Moonwalker",
          "Buttermilk Fry",
          "Pompeii",
          "Spilt Milk"
        ],
        "url": "https://www.yelp.com/search?find_desc=Chicken+Caesar+Wrap&find_loc=Chicago,+IL"
      }
    },
    "vote": {
      "items": [
        "Punky's Pizza & Pasta",
        "Little Victories",
        "Nohea Cafe",
        "Village Tap",
        "Moonwalker",
        "GG's Chicken Shop",
        "Buttermilk Fry",
        "D'Amato's Bakery",
        "Pompeii",
        "Spilt Milk"
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
    "links": {
      "Maison Premiere": "https://www.google.com/maps/search/?api=1&query=Maison%20Premiere",
      "Fresh Kills Bar": "https://www.google.com/maps/search/?api=1&query=Fresh%20Kills%20Bar",
      "Bar Blondeau": "https://www.google.com/maps/search/?api=1&query=Bar%20Blondeau",
      "Westlight": "https://www.google.com/maps/search/?api=1&query=Westlight",
      "Rose Marie": "https://www.google.com/maps/search/?api=1&query=Rose%20Marie",
      "Bar Madonna": "https://www.google.com/maps/search/?api=1&query=Bar%20Madonna",
      "Sauced": "https://www.google.com/maps/search/?api=1&query=Sauced",
      "Layla": "https://www.google.com/maps/search/?api=1&query=Layla",
      "Pokito": "https://www.google.com/maps/search/?api=1&query=Pokito",
      "Le Crocodile": "https://www.google.com/maps/search/?api=1&query=Le%20Crocodile",
      "Mo's General": "https://www.google.com/maps/search/?api=1&query=Mo%27s%20General",
      "Velvet Brooklyn": "https://www.google.com/maps/search/?api=1&query=Velvet%20Brooklyn",
      "The Twenty Bar": "https://www.google.com/maps/search/?api=1&query=The%20Twenty%20Bar",
      "Bar Milagro": "https://www.google.com/maps/search/?api=1&query=Bar%20Milagro"
    },
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
    "links": {
      "The Commodore": "https://www.google.com/maps/search/?api=1&query=The%20Commodore",
      "Rocka Rolla": "https://www.google.com/maps/search/?api=1&query=Rocka%20Rolla",
      "Turkey's Nest": "https://www.google.com/maps/search/?api=1&query=Turkey%27s%20Nest",
      "Skinny Dennis": "https://www.google.com/maps/search/?api=1&query=Skinny%20Dennis",
      "Sharlene's": "https://www.google.com/maps/search/?api=1&query=Sharlene%27s",
      "Duff's Brooklyn": "https://www.google.com/maps/search/?api=1&query=Duff%27s%20Brooklyn",
      "R Bar": "https://www.google.com/maps/search/?api=1&query=R%20Bar",
      "Clem's": "https://www.google.com/maps/search/?api=1&query=Clem%27s",
      "Pete's Candy Store": "https://www.google.com/maps/search/?api=1&query=Pete%27s%20Candy%20Store",
      "Boobie Trap": "https://www.google.com/maps/search/?api=1&query=Boobie%20Trap"
    },
    "blurb": "Sticky floors, cheap beer, classic rock jukeboxes. The bars that resisted the gentrification or learned to coexist with it.",
    "defaultSource": "ai",
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
    "links": {
      "Black Rabbit": "https://www.google.com/maps/search/?api=1&query=Black%20Rabbit",
      "Sunshine Laundromat & Pinball": "https://www.google.com/maps/search/?api=1&query=Sunshine%20Laundromat%20Pinball",
      "Lake Street": "https://www.google.com/maps/search/?api=1&query=Lake%20Street",
      "The Drift": "https://www.google.com/maps/search/?api=1&query=The%20Drift",
      "Temkin's Bar": "https://www.google.com/maps/search/?api=1&query=Temkin%27s%20Bar",
      "Broken Land": "https://www.google.com/maps/search/?api=1&query=Broken%20Land",
      "The Capri Social Club": "https://www.google.com/maps/search/?api=1&query=The%20Capri%20Social%20Club",
      "Palace Cafe": "https://www.google.com/maps/search/?api=1&query=Palace%20Cafe",
      "The Moonlight Mile": "https://www.google.com/maps/search/?api=1&query=The%20Moonlight%20Mile",
      "Connie O's Pub": "https://www.google.com/maps/search/?api=1&query=Connie%20O%27s%20Pub",
      "A Bar": "https://www.google.com/maps/search/?api=1&query=A%20Bar",
      "Oak and Iron": "https://www.google.com/maps/search/?api=1&query=Oak%20and%20Iron"
    },
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
    "links": {
      "McSorley's Old Ale House": "https://www.google.com/maps/search/?api=1&query=McSorley%27s%20Old%20Ale%20House",
      "Lucy's": "https://www.google.com/maps/search/?api=1&query=Lucy%27s",
      "Holiday Cocktail Lounge": "https://www.google.com/maps/search/?api=1&query=Holiday%20Cocktail%20Lounge",
      "Tile Bar": "https://www.google.com/maps/search/?api=1&query=Tile%20Bar",
      "Sophie's": "https://www.google.com/maps/search/?api=1&query=Sophie%27s",
      "KGB Bar": "https://www.google.com/maps/search/?api=1&query=KGB%20Bar",
      "Blue & Gold Tavern": "https://www.google.com/maps/search/?api=1&query=Blue%20Gold%20Tavern",
      "Cherry Tavern": "https://www.google.com/maps/search/?api=1&query=Cherry%20Tavern",
      "Mona's": "https://www.google.com/maps/search/?api=1&query=Mona%27s",
      "Milano's Bar": "https://www.google.com/maps/search/?api=1&query=Milano%27s%20Bar"
    },
    "blurb": "McSorley's since 1854. Lucy's reborn. The grit and grime that gave New York nightlife its reputation.",
    "defaultSource": "ai",
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
    "links": {
      "Kettle of Fish": "https://www.google.com/maps/search/?api=1&query=Kettle%20of%20Fish",
      "Down the Hatch": "https://www.google.com/maps/search/?api=1&query=Down%20the%20Hatch",
      "Johnny's Bar": "https://www.google.com/maps/search/?api=1&query=Johnny%27s%20Bar",
      "Julius'": "https://www.google.com/maps/search/?api=1&query=Julius%27",
      "The Four-Faced Liar": "https://www.google.com/maps/search/?api=1&query=The%20Four-Faced%20Liar",
      "Peculier Pub": "https://www.google.com/maps/search/?api=1&query=Peculier%20Pub",
      "Bleecker Street Bar": "https://www.google.com/maps/search/?api=1&query=Bleecker%20Street%20Bar",
      "The Library": "https://www.google.com/maps/search/?api=1&query=The%20Library",
      "PubKey": "https://www.google.com/maps/search/?api=1&query=PubKey",
      "Fish Bar": "https://www.google.com/maps/search/?api=1&query=Fish%20Bar",
      "124 Old Rabbit Club": "https://www.google.com/maps/search/?api=1&query=124%20Old%20Rabbit%20Club",
      "Wide Shut": "https://www.google.com/maps/search/?api=1&query=Wide%20Shut",
      "Beltane": "https://www.google.com/maps/search/?api=1&query=Beltane",
      "Park Bar": "https://www.google.com/maps/search/?api=1&query=Park%20Bar"
    },
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
    "links": {
      "Dante": "https://www.google.com/maps/search/?api=1&query=Dante",
      "Bandits": "https://www.google.com/maps/search/?api=1&query=Bandits",
      "Little Branch": "https://www.google.com/maps/search/?api=1&query=Little%20Branch",
      "Katana Kitten": "https://www.google.com/maps/search/?api=1&query=Katana%20Kitten",
      "Employees Only": "https://www.google.com/maps/search/?api=1&query=Employees%20Only",
      "Bar Pisellino": "https://www.google.com/maps/search/?api=1&query=Bar%20Pisellino",
      "Angel's Share": "https://www.google.com/maps/search/?api=1&query=Angel%27s%20Share",
      "Sip & Guzzle": "https://www.google.com/maps/search/?api=1&query=Sip%20Guzzle",
      "Bobo": "https://www.google.com/maps/search/?api=1&query=Bobo",
      "Analogue": "https://www.google.com/maps/search/?api=1&query=Analogue",
      "Binx": "https://www.google.com/maps/search/?api=1&query=Binx"
    },
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
      "South Soho Bar": "https://www.google.com/maps/search/?api=1&query=South%20Soho%20Bar",
      "Sloane's": "https://www.google.com/maps/search/?api=1&query=Sloane%27s",
      "Milady's": "https://www.google.com/maps/search/?api=1&query=Milady%27s",
      "Guild Bar": "https://www.google.com/maps/search/?api=1&query=Guild%20Bar",
      "La Compagnie des Vins Surnaturels": "https://www.google.com/maps/search/?api=1&query=La%20Compagnie%20des%20Vins%20Surnaturels",
      "Kabin": "https://www.google.com/maps/search/?api=1&query=Kabin",
      "Foxtail": "https://www.google.com/maps/search/?api=1&query=Foxtail",
      "The Ship": "https://www.google.com/maps/search/?api=1&query=The%20Ship",
      "Grand Bar": "https://www.google.com/maps/search/?api=1&query=Grand%20Bar",
      "Broome Street Bar": "https://www.google.com/maps/search/?api=1&query=Broome%20Street%20Bar"
    },
    "blurb": "Hotel hideouts, micro bars tucked above home goods stores, and the speakeasies that survived the neighborhood's gallery-to-luxury pivot.",
    "defaultSource": "ai",
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
    "publishedDate": "2026-05-24",
    "publishedAt": "2026-05-24T15:00:00Z",
    "title": "Best Ramen Shops in Tokyo",
    "category": "Tokyo",
    "type": "stores",
    "tags": [
      "food",
      "food-drink",
      "stores",
      "travel"
    ],
    "linkType": "mapsCity",
    "links": {
      "Tsuta": "https://www.google.com/maps/search/?api=1&query=Tsuta",
      "Nakiryu": "https://www.google.com/maps/search/?api=1&query=Nakiryu",
      "Konjiki Hototogisu": "https://www.google.com/maps/search/?api=1&query=Konjiki%20Hototogisu",
      "Afuri": "https://www.google.com/maps/search/?api=1&query=Afuri",
      "Rokurinsha": "https://www.google.com/maps/search/?api=1&query=Rokurinsha",
      "Mensho": "https://www.google.com/maps/search/?api=1&query=Mensho",
      "Menya Musashi": "https://www.google.com/maps/search/?api=1&query=Menya%20Musashi",
      "Ginza Kagari": "https://www.google.com/maps/search/?api=1&query=Ginza%20Kagari",
      "Ippudo": "https://www.google.com/maps/search/?api=1&query=Ippudo",
      "Ramen Jiro": "https://www.google.com/maps/search/?api=1&query=Ramen%20Jiro",
      "Soranoiro": "https://www.google.com/maps/search/?api=1&query=Soranoiro",
      "Menya Itto": "https://www.google.com/maps/search/?api=1&query=Menya%20Itto",
      "Ramen Tatsunoya": "https://www.google.com/maps/search/?api=1&query=Ramen%20Tatsunoya",
      "Ichiran": "https://www.google.com/maps/search/?api=1&query=Ichiran"
    },
    "blurb": "Michelin-starred broth versus the bowls locals queue an hour for.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Tsuta",
          "Nakiryu",
          "Konjiki Hototogisu",
          "Afuri",
          "Rokurinsha",
          "Mensho",
          "Menya Musashi",
          "Ginza Kagari",
          "Ippudo",
          "Ramen Jiro"
        ]
      },
      "michelin": {
        "label": "Michelin Guide Tokyo",
        "items": [
          "Nakiryu",
          "Tsuta",
          "Konjiki Hototogisu",
          "Ginza Kagari",
          "Soranoiro",
          "Mensho",
          "Afuri",
          "Menya Itto",
          "Ramen Tatsunoya",
          "Rokurinsha"
        ],
        "url": "https://guide.michelin.com/en/best-of/ramen-in-tokyo-en"
      },
      "timeout": {
        "label": "Time Out Tokyo",
        "items": [
          "Afuri",
          "Ichiran",
          "Mensho",
          "Konjiki Hototogisu",
          "Rokurinsha",
          "Tsuta",
          "Ramen Jiro",
          "Menya Musashi",
          "Ippudo",
          "Ginza Kagari"
        ],
        "url": "https://www.timeout.com/tokyo/restaurants/20-best-ramen-in-tokyo"
      }
    },
    "vote": {
      "items": [
        "Ichiran",
        "Konjiki Hototogisu",
        "Afuri",
        "Tsuta",
        "Mensho",
        "Ginza Kagari",
        "Rokurinsha",
        "Ippudo",
        "Nakiryu",
        "Menya Musashi"
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
    "blurb": "The flagship wireless cans: class-leading ANC, audiophile-grade drivers, and the kind of build quality that justifies the price. Ranked on sound, silence, and craft — not value.",
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
          "Phillips Exeter Academy",
          "Phillips Academy Andover",
          "The Hotchkiss School",
          "Groton School",
          "St. Paul's School",
          "Choate Rosemary Hall",
          "The Lawrenceville School",
          "Deerfield Academy",
          "Milton Academy",
          "Cate School"
        ]
      },
      "niche": {
        "label": "Niche 2026 Best Boarding Schools",
        "items": [
          "The Hotchkiss School",
          "Phillips Exeter Academy",
          "Choate Rosemary Hall",
          "The Lawrenceville School",
          "Groton School",
          "Phillips Academy Andover",
          "St. Paul's School",
          "Cate School",
          "Deerfield Academy",
          "Milton Academy"
        ],
        "url": "https://www.niche.com/blog/2026-best-boarding-high-schools-in-america/"
      },
      "admissionsight": {
        "label": "AdmissionSight Top 10",
        "items": [
          "Phillips Exeter Academy",
          "Phillips Academy Andover",
          "Choate Rosemary Hall",
          "The Lawrenceville School",
          "Groton School",
          "St. Paul's School",
          "Deerfield Academy",
          "Cate School",
          "The Hotchkiss School",
          "Milton Academy"
        ],
        "url": "https://admissionsight.com/best-boarding-schools-in-the-us/"
      },
      "findingschool": {
        "label": "FindingSchool 2026",
        "items": [
          "Phillips Academy Andover",
          "Phillips Exeter Academy",
          "The Lawrenceville School",
          "Deerfield Academy",
          "Choate Rosemary Hall",
          "The Hotchkiss School",
          "St. Paul's School",
          "Groton School",
          "Middlesex School",
          "The Taft School"
        ],
        "url": "https://www.findingschool.com/ranking/fs-boarding-ranking"
      }
    },
    "vote": {
      "items": [
        "Phillips Exeter Academy",
        "Phillips Academy Andover",
        "Groton School",
        "The Hotchkiss School",
        "St. Paul's School",
        "Choate Rosemary Hall",
        "Deerfield Academy",
        "The Lawrenceville School",
        "Milton Academy",
        "Cate School"
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
      "The Grill": "https://www.google.com/maps/search/?api=1&query=The%20Grill",
      "Torrisi Bar & Restaurant": "https://www.google.com/maps/search/?api=1&query=Torrisi%20Bar%20Restaurant",
      "Dowling's at The Carlyle": "https://www.google.com/maps/search/?api=1&query=Dowling%27s%20at%20The%20Carlyle",
      "La Marchande": "https://www.google.com/maps/search/?api=1&query=La%20Marchande",
      "Carbone": "https://www.google.com/maps/search/?api=1&query=Carbone",
      "Balthazar": "https://www.google.com/maps/search/?api=1&query=Balthazar",
      "The Polo Bar": "https://www.google.com/maps/search/?api=1&query=The%20Polo%20Bar",
      "Ci Siamo": "https://www.google.com/maps/search/?api=1&query=Ci%20Siamo",
      "Smith & Wollensky": "https://www.google.com/maps/search/?api=1&query=Smith%20Wollensky",
      "King": "https://www.google.com/maps/search/?api=1&query=King",
      "Time and Tide": "https://www.google.com/maps/search/?api=1&query=Time%20and%20Tide",
      "Le Coucou": "https://www.google.com/maps/search/?api=1&query=Le%20Coucou",
      "L'Artusi": "https://www.google.com/maps/search/?api=1&query=L%27Artusi",
      "Avra Estiatorio": "https://www.google.com/maps/search/?api=1&query=Avra%20Estiatorio",
      "Le Crocodile": "https://www.google.com/maps/search/?api=1&query=Le%20Crocodile",
      "Manuela": "https://www.google.com/maps/search/?api=1&query=Manuela",
      "Raoul's": "https://www.google.com/maps/search/?api=1&query=Raoul%27s",
      "Coco's": "https://www.google.com/maps/search/?api=1&query=Coco%27s",
      "Raf's": "https://www.google.com/maps/search/?api=1&query=Raf%27s",
      "Michael's": "https://www.google.com/maps/search/?api=1&query=Michael%27s"
    },
    "blurb": "The power lunch never died, it just moved tables. Where to order a gin martini at noon on a Tuesday and nobody blinks. Steak, tablecloths, and a cab home.",
    "defaultSource": "ai",
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "The Grill",
          "Torrisi Bar & Restaurant",
          "Dowling's at The Carlyle",
          "La Marchande",
          "Carbone",
          "Balthazar",
          "The Polo Bar",
          "Ci Siamo",
          "Smith & Wollensky",
          "King"
        ]
      },
      "resy": {
        "label": "Resy Power Lunch Guide 2025",
        "items": [
          "Dowling's at The Carlyle",
          "Time and Tide",
          "Le Coucou",
          "King",
          "L'Artusi",
          "Ci Siamo",
          "La Marchande",
          "Avra Estiatorio",
          "Le Crocodile",
          "Manuela"
        ],
        "url": "https://blog.resy.com/2025/03/the-resy-guide-to-power-lunches-in-new-york/"
      },
      "infatuation": {
        "label": "The Infatuation",
        "items": [
          "Torrisi Bar & Restaurant",
          "Ci Siamo",
          "Carbone",
          "The Grill",
          "Balthazar",
          "Raoul's",
          "King",
          "Dowling's at The Carlyle",
          "L'Artusi",
          "Smith & Wollensky"
        ],
        "url": "https://www.theinfatuation.com/new-york/guides/midtown-lunch"
      },
      "robbreport": {
        "label": "Robb Report · Gentleman's Journal",
        "items": [
          "The Grill",
          "Coco's",
          "Raf's",
          "Torrisi Bar & Restaurant",
          "Carbone",
          "Michael's",
          "La Marchande",
          "The Polo Bar",
          "Balthazar",
          "Dowling's at The Carlyle"
        ],
        "url": "https://robbreport.com/food-drink/dining/power-lunch-new-york-city-1235642855/"
      }
    },
    "vote": {
      "items": [
        "Torrisi Bar & Restaurant",
        "The Grill",
        "Carbone",
        "Balthazar",
        "Dowling's at The Carlyle",
        "Smith & Wollensky",
        "La Marchande",
        "The Polo Bar",
        "Ci Siamo",
        "King"
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
    "blurb": "Two seats, one parent, a tight fold, and a frame that still clears a hotel doorway. The double strollers worth flying with — twins, two under two, or a baby and a runner.",
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
      "Willie's": "https://www.google.com/maps/search/?api=1&query=Willie%27s",
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
      "Fat Daddy's (UF)": "https://www.google.com/maps/search/?api=1&query=Fat%20Daddy%27s%20Bar%20Gainesville%20FL",
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
          "Fat Daddy's (UF)",
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
          "Fat Daddy's (UF)",
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
          "Loosey's (UF)",
          "Fat Daddy's (UF)"
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
          "Tavern in the Grove (UM)",
          "Fat Daddy's (UF)"
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
        "Fat Daddy's (UF)",
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
      "Autenticos Michoacanos": "https://www.google.com/maps/search/?api=1&query=Autenticos%20Michoacanos%20Austin%20TX",
      "Carnitas El Guero": "https://www.google.com/maps/search/?api=1&query=Carnitas%20El%20Guero%20Austin%20TX",
      "Comadre Panaderia": "https://www.google.com/maps/search/?api=1&query=Comadre%20Panaderia%20Austin%20TX",
      "Con Todo": "https://www.google.com/maps/search/?api=1&query=Con%20Todo%20Austin%20TX",
      "Cuantos Tacos": "https://www.google.com/maps/search/?api=1&query=Cuantos%20Tacos%20Austin%20TX",
      "De Nada Cantina": "https://www.google.com/maps/search/?api=1&query=De%20Nada%20Cantina%20Austin%20TX",
      "Discada": "https://www.google.com/maps/search/?api=1&query=Discada%20Austin%20TX",
      "El Buen Taquero": "https://www.google.com/maps/search/?api=1&query=El%20Buen%20Taquero%20Austin%20TX",
      "El Naranjo": "https://www.google.com/maps/search/?api=1&query=El%20Naranjo%20Austin%20TX",
      "El Perrito ATX": "https://www.google.com/maps/search/?api=1&query=El%20Perrito%20ATX%20Austin%20TX",
      "El Primo": "https://www.google.com/maps/search/?api=1&query=El%20Primo%20Tacos%20Austin%20TX",
      "Este": "https://www.google.com/maps/search/?api=1&query=Este%20Restaurant%20Austin%20TX",
      "Granny's Tacos": "https://www.google.com/maps/search/?api=1&query=Granny%27s%20Tacos%20Austin%20TX",
      "La Santa Barbacha": "https://www.google.com/maps/search/?api=1&query=La%20Santa%20Barbacha%20Austin%20TX",
      "Las Trancas": "https://www.google.com/maps/search/?api=1&query=Las%20Trancas%20Tacos%20Austin%20TX",
      "Los Galanes": "https://www.google.com/maps/search/?api=1&query=Los%20Galanes%20Birrias%20Tacos%20Austin%20TX",
      "Nixta Taqueria": "https://www.google.com/maps/search/?api=1&query=Nixta%20Taqueria%20Austin%20TX",
      "Paprika ATX": "https://www.google.com/maps/search/?api=1&query=Paprika%20ATX%20Austin%20TX",
      "Pueblo Viejo": "https://www.google.com/maps/search/?api=1&query=Pueblo%20Viejo%20Tacos%20Austin%20TX",
      "Sana Sana Taqueria": "https://www.google.com/maps/search/?api=1&query=Sana%20Sana%20Taqueria%20Austin%20TX",
      "Suerte": "https://www.google.com/maps/search/?api=1&query=Suerte%20Austin%20TX",
      "Taco Master": "https://www.google.com/maps/search/?api=1&query=Taco%20Master%20Austin%20TX",
      "Vaquero Taquero": "https://www.google.com/maps/search/?api=1&query=Vaquero%20Taquero%20Austin%20TX",
      "Veracruz All Natural": "https://www.google.com/maps/search/?api=1&query=Veracruz%20All%20Natural%20Austin%20TX"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Nixta Taqueria",
          "Cuantos Tacos",
          "Paprika ATX",
          "Discada",
          "Veracruz All Natural",
          "Vaquero Taquero",
          "La Santa Barbacha",
          "Suerte",
          "Granny's Tacos",
          "De Nada Cantina"
        ]
      },
      "infatuation": {
        "label": "The Infatuation · 25 Best Austin Tacos, Ranked 2025",
        "url": "https://www.theinfatuation.com/austin/guides/best-austin-tacos",
        "items": [
          "Paprika ATX",
          "Nixta Taqueria",
          "Cuantos Tacos",
          "Carnitas El Guero",
          "Discada",
          "Taco Master",
          "El Buen Taquero",
          "Autenticos Michoacanos",
          "La Santa Barbacha",
          "De Nada Cantina",
          "Vaquero Taquero",
          "Veracruz All Natural"
        ]
      },
      "texasmonthly": {
        "label": "Texas Monthly · 22 Best Taco Spots (alphabetical) 2026",
        "url": "https://www.texasmonthly.com/food/the-austin-taco-trail/",
        "items": [
          "Comadre Panaderia",
          "Cuantos Tacos",
          "De Nada Cantina",
          "Discada",
          "El Naranjo",
          "El Perrito ATX",
          "Este",
          "Granny's Tacos",
          "La Santa Barbacha",
          "Nixta Taqueria",
          "Paprika ATX",
          "Sana Sana Taqueria",
          "Suerte",
          "Vaquero Taquero"
        ]
      },
      "austinfoodmag": {
        "label": "Austin Food Magazine · Best Tacos 2025",
        "url": "https://austinfoodmagazine.com/best-tacos-austin-2025/",
        "items": [
          "Nixta Taqueria",
          "Cuantos Tacos",
          "Veracruz All Natural",
          "Las Trancas",
          "Suerte",
          "Paprika ATX",
          "Discada",
          "El Primo",
          "Con Todo",
          "Granny's Tacos",
          "Pueblo Viejo",
          "Los Galanes",
          "Vaquero Taquero"
        ]
      }
    },
    "vote": {
      "items": [
        "Nixta Taqueria",
        "Cuantos Tacos",
        "Paprika ATX",
        "Veracruz All Natural",
        "Discada",
        "Suerte",
        "La Santa Barbacha",
        "Vaquero Taquero",
        "Granny's Tacos",
        "El Primo"
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
      "Bartaco": "https://www.google.com/maps/search/?api=1&query=Bartaco%20Atlanta%20GA",
      "Carniceria Ramirez": "https://www.google.com/maps/search/?api=1&query=Carniceria%20Ramirez%20Bolton%20Road%20Atlanta%20GA",
      "Carnitas Michoacan": "https://www.google.com/maps/search/?api=1&query=Carnitas%20Michoacan%20Plaza%20Fiesta%20Atlanta%20GA",
      "Da Cocinita": "https://www.google.com/maps/search/?api=1&query=Da%20Cocinita%20Magic%20Taco%20Atlanta%20GA",
      "Don Chon": "https://www.google.com/maps/search/?api=1&query=Don%20Chon%20Atlanta%20GA",
      "El Progreso": "https://www.google.com/maps/search/?api=1&query=El%20Progreso%20Market%20Atlanta%20GA",
      "El Rey del Taco": "https://www.google.com/maps/search/?api=1&query=El%20Rey%20del%20Taco%20Doraville%20GA",
      "El Santo Gallo": "https://www.google.com/maps/search/?api=1&query=El%20Santo%20Gallo%20Taqueria%20Atlanta%20GA",
      "El Taco Veloz": "https://www.google.com/maps/search/?api=1&query=El%20Taco%20Veloz%20Atlanta%20GA",
      "El Tesoro": "https://www.google.com/maps/search/?api=1&query=El%20Tesoro%20Tacos%20Edgewood%20Atlanta%20GA",
      "Hankook Taqueria": "https://www.google.com/maps/search/?api=1&query=Hankook%20Taqueria%20Atlanta%20GA",
      "Holy Taco": "https://www.google.com/maps/search/?api=1&query=Holy%20Taco%20Atlanta%20GA",
      "La Pastorcita": "https://www.google.com/maps/search/?api=1&query=La%20Pastorcita%20Atlanta%20GA",
      "Little Rey": "https://www.google.com/maps/search/?api=1&query=Little%20Rey%20Atlanta%20GA",
      "Pappasito's Cantina": "https://www.google.com/maps/search/?api=1&query=Pappasito%27s%20Cantina%20Atlanta%20GA",
      "Supremo Taco": "https://www.google.com/maps/search/?api=1&query=Supremo%20Taco%20Memorial%20Drive%20Atlanta%20GA",
      "Taco Cantina Smyrna": "https://www.google.com/maps/search/?api=1&query=Taco%20Cantina%20Smyrna%20GA",
      "Tacos & Tequilas": "https://www.google.com/maps/search/?api=1&query=Tacos%20and%20Tequilas%20Atlanta%20GA",
      "Tacos La Villa": "https://www.google.com/maps/search/?api=1&query=Tacos%20La%20Villa%20Atlanta%20GA",
      "Taqueria del Sol": "https://www.google.com/maps/search/?api=1&query=Taqueria%20del%20Sol%20Atlanta%20GA",
      "Verde Taqueria": "https://www.google.com/maps/search/?api=1&query=Verde%20Taqueria%20Atlanta%20GA",
      "Vice Taco Truck": "https://www.google.com/maps/search/?api=1&query=Vice%20Taco%20Truck%20Atlanta%20GA"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "El Rey del Taco",
          "Taqueria del Sol",
          "El Tesoro",
          "Little Rey",
          "La Pastorcita",
          "Holy Taco",
          "El Progreso",
          "Supremo Taco",
          "Hankook Taqueria",
          "Carnitas Michoacan"
        ]
      },
      "infatuation": {
        "label": "The Infatuation · 10 Best Tacos Atlanta 2026",
        "url": "https://www.theinfatuation.com/atlanta/guides/best-tacos-atlanta",
        "items": [
          "El Rey del Taco",
          "El Tesoro",
          "Tacos La Villa",
          "El Santo Gallo",
          "El Progreso",
          "Da Cocinita",
          "Vice Taco Truck",
          "Taqueria del Sol",
          "Hankook Taqueria",
          "El Taco Veloz"
        ]
      },
      "atlantaeats": {
        "label": "Atlanta Eats · Best Street Tacos 2026",
        "url": "https://www.atlantaeats.com/blog/atl-street-tacos/",
        "items": [
          "Carnitas Michoacan",
          "El Rey del Taco",
          "El Tesoro",
          "Supremo Taco",
          "La Pastorcita",
          "Little Rey",
          "Taco Cantina Smyrna",
          "Taqueria del Sol",
          "Carniceria Ramirez"
        ]
      },
      "atlantafi": {
        "label": "AtlantaFi · Best Taco Spots 2025",
        "url": "https://atlantafi.com/best-tacos-atlanta/",
        "items": [
          "Don Chon",
          "Holy Taco",
          "Little Rey",
          "Bartaco",
          "Tacos & Tequilas",
          "Taqueria del Sol",
          "El Rey del Taco",
          "Pappasito's Cantina",
          "Verde Taqueria"
        ]
      }
    },
    "vote": {
      "items": [
        "El Rey del Taco",
        "Taqueria del Sol",
        "El Tesoro",
        "Little Rey",
        "Holy Taco",
        "La Pastorcita",
        "El Progreso",
        "Supremo Taco",
        "Hankook Taqueria",
        "Don Chon"
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
      "Antojitos Mexicanos Tenorio": "https://www.google.com/maps/search/?api=1&query=Antojitos%20Mexicanos%20Tenorio%20Miami%20FL",
      "Bakan": "https://www.google.com/maps/search/?api=1&query=Bakan%20Wynwood%20Miami%20FL",
      "Bodega Taqueria y Tequila": "https://www.google.com/maps/search/?api=1&query=Bodega%20Taqueria%20y%20Tequila%20Miami%20Beach%20FL",
      "Cha Cha Cha": "https://www.google.com/maps/search/?api=1&query=Cha%20Cha%20Cha%20Taqueria%20Miami%20FL",
      "Chito's Red Tacos": "https://www.google.com/maps/search/?api=1&query=Chitos%20Red%20Tacos%20Miami%20FL",
      "Coyo Taco": "https://www.google.com/maps/search/?api=1&query=Coyo%20Taco%20Wynwood%20Miami%20FL",
      "El Primo Red Tacos": "https://www.google.com/maps/search/?api=1&query=El%20Primo%20Red%20Tacos%20Miami%20FL",
      "Jacalito Taqueria Mexicana": "https://www.google.com/maps/search/?api=1&query=Jacalito%20Taqueria%20Mexicana%20Miami%20FL",
      "La Pasadita": "https://www.google.com/maps/search/?api=1&query=La%20Pasadita%20Miami%20FL",
      "La Santa Taqueria": "https://www.google.com/maps/search/?api=1&query=La%20Santa%20Taqueria%20Miami%20FL",
      "Lolo's Surf Cantina": "https://www.google.com/maps/search/?api=1&query=Lolos%20Surf%20Cantina%20Miami%20Beach%20FL",
      "Los Felix": "https://www.google.com/maps/search/?api=1&query=Los%20Felix%20Coconut%20Grove%20Miami%20FL",
      "Mezquite Taqueria": "https://www.google.com/maps/search/?api=1&query=Mezquite%20Taqueria%20Michelada%20Bar%20Miami%20FL",
      "Mi Rinconcito Mexicano": "https://www.google.com/maps/search/?api=1&query=Mi%20Rinconcito%20Mexicano%20Miami%20FL",
      "No Manches Que Rico": "https://www.google.com/maps/search/?api=1&query=No%20Manches%20Que%20Rico%20Miami%20FL",
      "Pilo's Street Tacos": "https://www.google.com/maps/search/?api=1&query=Pilos%20Street%20Tacos%20Miami%20FL",
      "Tacombi": "https://www.google.com/maps/search/?api=1&query=Tacombi%20Miami%20FL",
      "Tacos Maria": "https://www.google.com/maps/search/?api=1&query=Tacos%20Maria%20Miami%20FL",
      "Tacos el Porky": "https://www.google.com/maps/search/?api=1&query=Tacos%20el%20Porky%20Miami%20FL",
      "Taqueria El Mexicano": "https://www.google.com/maps/search/?api=1&query=Taqueria%20El%20Mexicano%20Little%20Havana%20Miami%20FL",
      "Taqueria Morelia": "https://www.google.com/maps/search/?api=1&query=Taqueria%20Morelia%20Miami%20FL",
      "Taqueria Viva Mexico": "https://www.google.com/maps/search/?api=1&query=Taqueria%20Viva%20Mexico%20Miami%20FL",
      "Taquiza": "https://www.google.com/maps/search/?api=1&query=Taquiza%20Miami%20Beach%20FL",
      "The Taco Stand": "https://www.google.com/maps/search/?api=1&query=The%20Taco%20Stand%20Wynwood%20Miami%20FL",
      "Uptown 66": "https://www.google.com/maps/search/?api=1&query=Uptown%2066%20Taqueria%20Miami%20FL",
      "Wolf of Tacos": "https://www.google.com/maps/search/?api=1&query=Wolf%20of%20Tacos%20Miami%20FL"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "The Taco Stand",
          "Taquiza",
          "Coyo Taco",
          "Wolf of Tacos",
          "Bodega Taqueria y Tequila",
          "Uptown 66",
          "Taqueria Viva Mexico",
          "Mi Rinconcito Mexicano",
          "La Pasadita",
          "Taqueria Morelia"
        ]
      },
      "infatuation": {
        "label": "The Infatuation · Best Tacos Miami 2026",
        "url": "https://www.theinfatuation.com/miami/guides/best-tacos-miami",
        "items": [
          "La Pasadita",
          "Chito's Red Tacos",
          "Cha Cha Cha",
          "Taqueria Morelia",
          "Taqueria Viva Mexico",
          "The Taco Stand",
          "Antojitos Mexicanos Tenorio",
          "No Manches Que Rico",
          "Mezquite Taqueria",
          "Wolf of Tacos",
          "Tacos Maria"
        ]
      },
      "newtimes": {
        "label": "Miami New Times · 10 Best Tacos (alphabetical) 2025",
        "url": "https://www.miaminewtimes.com/food-drink/best-tacos-in-miami-23936123/",
        "items": [
          "Bodega Taqueria y Tequila",
          "Coyo Taco",
          "Jacalito Taqueria Mexicana",
          "La Santa Taqueria",
          "Mi Rinconcito Mexicano",
          "The Taco Stand",
          "Taqueria Viva Mexico",
          "Taquiza",
          "Uptown 66",
          "Wolf of Tacos"
        ]
      },
      "timeout": {
        "label": "Time Out Miami · 20 Best Tacos 2024",
        "url": "https://www.timeout.com/miami/restaurants/best-tacos-miami",
        "items": [
          "Taquiza",
          "Los Felix",
          "Wolf of Tacos",
          "Bakan",
          "Uptown 66",
          "Coyo Taco",
          "Tacos el Porky",
          "Lolo's Surf Cantina",
          "Tacombi",
          "The Taco Stand",
          "El Primo Red Tacos",
          "Taqueria El Mexicano",
          "Mi Rinconcito Mexicano",
          "Pilo's Street Tacos"
        ]
      }
    },
    "vote": {
      "items": [
        "The Taco Stand",
        "Taquiza",
        "Coyo Taco",
        "Wolf of Tacos",
        "Bodega Taqueria y Tequila",
        "Uptown 66",
        "Taqueria Viva Mexico",
        "La Santa Taqueria",
        "Cha Cha Cha",
        "Bakan"
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
      "Chilacates": "https://www.google.com/maps/search/?api=1&query=Chilacates%20Boston%20MA",
      "Chivo Taqueria": "https://www.google.com/maps/search/?api=1&query=Chivo%20Taqueria%20Cambridge%20MA",
      "Cosmica": "https://www.google.com/maps/search/?api=1&query=Cosmica%20Boston%20MA",
      "Dora Taqueria": "https://www.google.com/maps/search/?api=1&query=Dora%20Taqueria%20Dorchester%20Boston%20MA",
      "El Jefe's Taqueria": "https://www.google.com/maps/search/?api=1&query=El%20Jefes%20Taqueria%20Boston%20MA",
      "El Pelon Taqueria": "https://www.google.com/maps/search/?api=1&query=El%20Pelon%20Taqueria%20Boston%20MA",
      "La Brasa": "https://www.google.com/maps/search/?api=1&query=La%20Brasa%20Somerville%20MA",
      "Loco Taqueria & Oyster Bar": "https://www.google.com/maps/search/?api=1&query=Loco%20Taqueria%20Oyster%20Bar%20South%20Boston%20MA",
      "Lolita Cocina": "https://www.google.com/maps/search/?api=1&query=Lolita%20Cocina%20Tequila%20Bar%20Boston%20MA",
      "Lone Star Taco Bar": "https://www.google.com/maps/search/?api=1&query=Lone%20Star%20Taco%20Bar%20Allston%20Boston%20MA",
      "Naco Taco": "https://www.google.com/maps/search/?api=1&query=Naco%20Taco%20Cambridge%20MA",
      "Orale": "https://www.google.com/maps/search/?api=1&query=Orale%20Mexican%20Grill%20Chelsea%20MA",
      "Rincon Mexicano": "https://www.google.com/maps/search/?api=1&query=Rincon%20Mexicano%20Somerville%20MA",
      "Rosa Mexicano": "https://www.google.com/maps/search/?api=1&query=Rosa%20Mexicano%20Seaport%20Boston%20MA",
      "Taqueria El Amigo": "https://www.google.com/maps/search/?api=1&query=Taqueria%20El%20Amigo%20Waltham%20MA",
      "Taqueria Jalisco": "https://www.google.com/maps/search/?api=1&query=Taqueria%20Jalisco%20East%20Boston%20MA",
      "Tenoch Mexican": "https://www.google.com/maps/search/?api=1&query=Tenoch%20Mexican%20Boston%20MA",
      "Yellow Door Taqueria": "https://www.google.com/maps/search/?api=1&query=Yellow%20Door%20Taqueria%20South%20End%20Boston%20MA"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Taqueria Jalisco",
          "Tenoch Mexican",
          "El Pelon Taqueria",
          "El Jefe's Taqueria",
          "Lolita Cocina",
          "Loco Taqueria & Oyster Bar",
          "Rincon Mexicano",
          "Cosmica",
          "Taqueria El Amigo",
          "Naco Taco"
        ]
      },
      "timeout": {
        "label": "Time Out Boston · Best Tacos 2022",
        "url": "https://www.timeout.com/boston/restaurants/best-tacos-in-boston",
        "items": [
          "Taqueria Jalisco",
          "Taqueria El Amigo",
          "Tenoch Mexican",
          "Rosa Mexicano",
          "Yellow Door Taqueria",
          "La Brasa",
          "Rincon Mexicano",
          "Lone Star Taco Bar",
          "El Pelon Taqueria",
          "Naco Taco"
        ]
      },
      "sachaeats": {
        "label": "Sacha Eats · Best Tacos in Boston 2023",
        "url": "https://sachaeats.com/best-tacos-in-boston/",
        "items": [
          "El Pelon Taqueria",
          "Tenoch Mexican",
          "Taqueria Jalisco",
          "Rincon Mexicano",
          "Orale",
          "Lolita Cocina",
          "Loco Taqueria & Oyster Bar",
          "Chilacates",
          "Dora Taqueria",
          "Chivo Taqueria"
        ]
      },
      "bostonnewscafe": {
        "label": "Boston News Cafe · Best Tacos 2025",
        "url": "https://bostonnewscafe.com/best-tacos-in-boston/",
        "items": [
          "El Jefe's Taqueria",
          "Lolita Cocina",
          "Taqueria Jalisco",
          "El Pelon Taqueria",
          "Cosmica",
          "Loco Taqueria & Oyster Bar",
          "Tenoch Mexican"
        ]
      }
    },
    "vote": {
      "items": [
        "Taqueria Jalisco",
        "Tenoch Mexican",
        "El Pelon Taqueria",
        "El Jefe's Taqueria",
        "Lolita Cocina",
        "Loco Taqueria & Oyster Bar",
        "Rincon Mexicano",
        "Cosmica",
        "Taqueria El Amigo",
        "Orale"
      ]
    }
  },
  {
    "id": "tacos-nyc",
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-28T19:25:45Z",
    "title": "Best Tacos in New York",
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
    "blurb": "Ski boots on, beers up, the Alps and Rockies at your feet. The legendary slopeside huts and summit bars where the party starts at altitude.",
    "defaultSource": "ai",
    "links": {
      "360 Bar (Val Thorens, France)": "https://www.google.com/maps/search/?api=1&query=360%20Bar%20Val%20Thorens%20France",
      "Black Bull Snowbar (Saas-Fee, Switzerland)": "https://www.google.com/maps/search/?api=1&query=Black%20Bull%20Snowbar%20Saas-Fee%20Switzerland",
      "Cloud Nine Alpine Bistro (Aspen Highlands, USA)": "https://www.google.com/maps/search/?api=1&query=Cloud%20Nine%20Alpine%20Bistro%20Aspen%20Highlands%20Colorado",
      "Dusty's (Whistler, Canada)": "https://www.google.com/maps/search/?api=1&query=Dusty%27s%20Bar%20BBQ%20Whistler%20Creekside%20BC%20Canada",
      "Elk Camp (Snowmass, USA)": "https://www.google.com/maps/search/?api=1&query=Elk%20Camp%20Restaurant%20Snowmass%20Colorado",
      "Gorrono Ranch (Telluride, USA)": "https://www.google.com/maps/search/?api=1&query=Gorrono%20Ranch%20Telluride%20Colorado",
      "Hennu Stall (Zermatt, Switzerland)": "https://www.google.com/maps/search/?api=1&query=Hennu%20Stall%20Zermatt%20Switzerland",
      "Hinterhag Alm (Saalbach, Austria)": "https://www.google.com/maps/search/?api=1&query=Hinterhag%20Alm%20Saalbach%20Austria",
      "Krazy Kanguruh (St. Anton, Austria)": "https://www.google.com/maps/search/?api=1&query=Krazy%20Kanguruh%20St%20Anton%20am%20Arlberg%20Austria",
      "La Folie Douce (Val d'Isère, France)": "https://www.google.com/maps/search/?api=1&query=La%20Folie%20Douce%20Val%20d%27Isere%20France",
      "Le Rond-Point (Méribel, France)": "https://www.google.com/maps/search/?api=1&query=Le%20Rond%20Point%20Bar%20Meribel%20France",
      "Lürzer Alm (Obertauern, Austria)": "https://www.google.com/maps/search/?api=1&query=Lurzer%20Alm%20Obertauern%20Austria",
      "Mangy Moose (Jackson Hole, USA)": "https://www.google.com/maps/search/?api=1&query=Mangy%20Moose%20Teton%20Village%20Wyoming",
      "Merlin's (Whistler, Canada)": "https://www.google.com/maps/search/?api=1&query=Merlin%27s%20Bar%20Whistler%20Blackcomb%20BC%20Canada",
      "Merry-Go-Round (Aspen Highlands, USA)": "https://www.google.com/maps/search/?api=1&query=Merry%20Go%20Round%20Restaurant%20Aspen%20Highlands%20Colorado",
      "Mooserwirt (St. Anton, Austria)": "https://www.google.com/maps/search/?api=1&query=Mooserwirt%20St%20Anton%20am%20Arlberg%20Austria",
      "Pano Bar (Les 2 Alpes, France)": "https://www.google.com/maps/search/?api=1&query=Pano%20Bar%20Les%202%20Alpes%20France",
      "Paznauer Taja (Ischgl, Austria)": "https://www.google.com/maps/search/?api=1&query=Paznauer%20Taja%20Ischgl%20Austria",
      "Rafters (Red Mountain, Canada)": "https://www.google.com/maps/search/?api=1&query=Rafters%20Bar%20Red%20Mountain%20Resort%20Rossland%20BC%20Canada",
      "Schirmbar (Sölden, Austria)": "https://www.google.com/maps/search/?api=1&query=Schirmbar%20Giggijoch%20Solden%20Austria",
      "Schnapshans Bar (Zell am See, Austria)": "https://www.google.com/maps/search/?api=1&query=Schnapshans%20Bar%20Schmittenhohe%20Zell%20am%20See%20Austria",
      "T-Bar (Steamboat, USA)": "https://www.google.com/maps/search/?api=1&query=T%20Bar%20Steamboat%20Springs%20Colorado",
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
          "Mooserwirt (St. Anton, Austria)",
          "Cloud Nine Alpine Bistro (Aspen Highlands, USA)",
          "Hennu Stall (Zermatt, Switzerland)",
          "Le Rond-Point (Méribel, France)",
          "Krazy Kanguruh (St. Anton, Austria)",
          "Tio Bob's (Portillo, Chile)",
          "Mangy Moose (Jackson Hole, USA)",
          "Dusty's (Whistler, Canada)",
          "The Sundeck (Aspen, USA)"
        ]
      },
      "snowtrex": {
        "label": "SnowTrex · Top 20 Après Ski Bars in the Alps 2024",
        "url": "https://www.snowtrex.co.uk/magazine/apres-ski/apres-ski-bars/",
        "items": [
          "Mooserwirt (St. Anton, Austria)",
          "Schnapshans Bar (Zell am See, Austria)",
          "Paznauer Taja (Ischgl, Austria)",
          "La Folie Douce (Val d'Isère, France)",
          "Lürzer Alm (Obertauern, Austria)",
          "Le Rond-Point (Méribel, France)",
          "Hennu Stall (Zermatt, Switzerland)",
          "Pano Bar (Les 2 Alpes, France)",
          "Schirmbar (Sölden, Austria)",
          "Hinterhag Alm (Saalbach, Austria)",
          "360 Bar (Val Thorens, France)",
          "Black Bull Snowbar (Saas-Fee, Switzerland)"
        ]
      },
      "scout": {
        "label": "Scout Ski · World's Best Ski Resort Bars 2020",
        "url": "https://scoutski.com/worlds-best-ski-resort-bars",
        "items": [
          "Tio Bob's (Portillo, Chile)",
          "Cloud Nine Alpine Bistro (Aspen Highlands, USA)",
          "Mangy Moose (Jackson Hole, USA)",
          "La Folie Douce (Val d'Isère, France)",
          "Mooserwirt (St. Anton, Austria)",
          "T-Bar (Steamboat, USA)",
          "Dusty's (Whistler, Canada)",
          "Rafters (Red Mountain, Canada)",
          "Hennu Stall (Zermatt, Switzerland)"
        ]
      },
      "mensjournal": {
        "label": "Men's Journal · 10 Best Ski-In Ski-Out Bars 2020",
        "url": "https://www.mensjournal.com/travel/the-10-best-ski-in-ski-out-bars-in-the-world-for-the-wildest-apres-ski",
        "items": [
          "The Ice Bar at Uley's Cabin (Crested Butte, USA)",
          "Le Rond-Point (Méribel, France)",
          "Cloud Nine Alpine Bistro (Aspen Highlands, USA)",
          "La Folie Douce (Val d'Isère, France)",
          "Gorrono Ranch (Telluride, USA)",
          "Hennu Stall (Zermatt, Switzerland)",
          "Unbuckle at Tamarack Lodge (Heavenly, USA)",
          "Mooserwirt (St. Anton, Austria)"
        ]
      },
      "onthesnow": {
        "label": "OnTheSnow · Best Après-Ski in the World 2025 (unranked)",
        "url": "https://www.onthesnow.co.uk/news/best-apres-ski-in-the-world/",
        "items": [
          "La Folie Douce (Val d'Isère, France)",
          "Krazy Kanguruh (St. Anton, Austria)",
          "Mooserwirt (St. Anton, Austria)",
          "Cloud Nine Alpine Bistro (Aspen Highlands, USA)",
          "Elk Camp (Snowmass, USA)",
          "The Sundeck (Aspen, USA)",
          "Merry-Go-Round (Aspen Highlands, USA)",
          "Dusty's (Whistler, Canada)",
          "Merlin's (Whistler, Canada)"
        ]
      }
    },
    "vote": {
      "items": [
        "La Folie Douce (Val d'Isère, France)",
        "Mooserwirt (St. Anton, Austria)",
        "Cloud Nine Alpine Bistro (Aspen Highlands, USA)",
        "Hennu Stall (Zermatt, Switzerland)",
        "Le Rond-Point (Méribel, France)",
        "Krazy Kanguruh (St. Anton, Austria)",
        "Tio Bob's (Portillo, Chile)",
        "Mangy Moose (Jackson Hole, USA)",
        "Gorrono Ranch (Telluride, USA)",
        "The Ice Bar at Uley's Cabin (Crested Butte, USA)"
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
    "blurb": "Boardrooms, betrayals, and billion-dollar bets. These films and documentaries chronicle the real figures who built the companies, brands, and fortunes that shaped the modern world — from Silicon Valley garages to fast-food franchises to Wall Street trading floors.",
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
        "label": "Atlanta Eats · Steak Shapiro's Top Burgers (alphabetical) 2024",
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
        "label": "Burger Beast · Best Burgers in Miami (alphabetical) 2026",
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
      "The Long Island Bar (Cobble Hill)": "https://www.google.com/maps/search/?api=1&query=The%20Long%20Island%20Bar%20Cobble%20Hill%20New%20York%20NY"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Red Hook Tavern (Red Hook)",
          "Minetta Tavern (Greenwich Village)",
          "Sip & Guzzle (West Village)",
          "Nowon (East Village)",
          "4 Charles Prime Rib (West Village)",
          "Raoul's (Soho)",
          "Keens Steakhouse (Midtown)",
          "Cervo's (Lower East Side)",
          "Crane Club (Chelsea)",
          "Hamburger America (Soho)"
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
      }
    },
    "vote": {
      "items": [
        "Red Hook Tavern (Red Hook)",
        "Minetta Tavern (Greenwich Village)",
        "7th Street Burger (East Village)",
        "J.G. Melon (Upper East Side)",
        "Peter Luger (Williamsburg)",
        "Hamburger America (Soho)",
        "Nowon (East Village)",
        "Smacking Burger (West Village)",
        "Raoul's (Soho)",
        "4 Charles Prime Rib (West Village)"
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
      "In-N-Out Burger": "https://www.google.com/maps/search/?api=1&query=In-N-Out%20Burger%20Los%20Angeles%20CA",
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
          "In-N-Out Burger",
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
          "In-N-Out Burger",
          "HiHo Cheeseburger (Santa Monica)"
        ]
      }
    },
    "vote": {
      "items": [
        "In-N-Out Burger",
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
        ]
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
    "publishedDate": "2026-05-28",
    "publishedAt": "2026-05-29T03:13:00Z",
    "title": "Best Resorts in the Caribbean",
    "category": "Travel",
    "type": "travel",
    "tags": [
      "travel",
      "luxury",
      "stores"
    ],
    "linkType": "mapsCity",
    "blurb": "Volcanic peaks over the bay in St. Lucia, blufftop villas in Dominica, and barefoot grandeur from St. Barths to the Bahamas. The Caribbean's most acclaimed luxury resorts, by consensus.",
    "defaultSource": "ai",
    "links": {
      "Amanyara (Turks & Caicos)": "https://www.google.com/maps/search/?api=1&query=Amanyara%20Turks%20Caicos",
      "Baoase Luxury Resort (Curacao)": "https://www.google.com/maps/search/?api=1&query=Baoase%20Luxury%20Resort%20Curacao",
      "COMO Parrot Cay (Turks & Caicos)": "https://www.google.com/maps/search/?api=1&query=COMO%20Parrot%20Cay%20Turks%20Caicos",
      "Casa de Campo Resort & Villas (Dominican Republic)": "https://www.google.com/maps/search/?api=1&query=Casa%20de%20Campo%20Resort%20Villas%20Dominican%20Republic",
      "Curtain Bluff (Antigua)": "https://www.google.com/maps/search/?api=1&query=Curtain%20Bluff%20Antigua",
      "Dorado Beach, a Ritz-Carlton Reserve (Puerto Rico)": "https://www.google.com/maps/search/?api=1&query=Dorado%20Beach%20a%20Ritz-Carlton%20Reserve%20Puerto%20Rico",
      "Eden Roc Cap Cana (Dominican Republic)": "https://www.google.com/maps/search/?api=1&query=Eden%20Roc%20Cap%20Cana%20Dominican%20Republic",
      "Jade Mountain (St. Lucia)": "https://www.google.com/maps/search/?api=1&query=Jade%20Mountain%20St%20Lucia",
      "Le Barthelemy Hotel & Spa (St. Barths)": "https://www.google.com/maps/search/?api=1&query=Le%20Barthelemy%20Hotel%20Spa%20St%20Barths",
      "Rosewood Little Dix Bay (Virgin Gorda)": "https://www.google.com/maps/search/?api=1&query=Rosewood%20Little%20Dix%20Bay%20Virgin%20Gorda",
      "Secret Bay (Dominica)": "https://www.google.com/maps/search/?api=1&query=Secret%20Bay%20Dominica",
      "Tensing Pen (Negril, Jamaica)": "https://www.google.com/maps/search/?api=1&query=Tensing%20Pen%20Negril%20Jamaica",
      "The Ritz-Carlton, Grand Cayman (Cayman Islands)": "https://www.google.com/maps/search/?api=1&query=The%20Ritz-Carlton%20Grand%20Cayman%20Cayman%20Islands"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "Eden Roc Cap Cana (Dominican Republic)",
          "Secret Bay (Dominica)",
          "Jade Mountain (St. Lucia)",
          "Rosewood Little Dix Bay (Virgin Gorda)",
          "Dorado Beach, a Ritz-Carlton Reserve (Puerto Rico)",
          "Casa de Campo Resort & Villas (Dominican Republic)",
          "Curtain Bluff (Antigua)",
          "The Ritz-Carlton, Grand Cayman (Cayman Islands)",
          "Tensing Pen (Negril, Jamaica)",
          "Baoase Luxury Resort (Curacao)"
        ]
      },
      "usnews": {
        "label": "U.S. News · Best Hotels in the Caribbean (Top 5) 2025",
        "url": "https://travel.usnews.com/rankings/best-caribbean-hotels/",
        "items": [
          "Jade Mountain (St. Lucia)",
          "Dorado Beach, a Ritz-Carlton Reserve (Puerto Rico)",
          "The Ritz-Carlton, Grand Cayman (Cayman Islands)",
          "Curtain Bluff (Antigua)",
          "Rosewood Little Dix Bay (Virgin Gorda)"
        ]
      },
      "travelleisure": {
        "label": "Travel + Leisure · World's Best Awards, Caribbean (Top 3) 2024",
        "url": "https://www.travelandleisure.com/worlds-best/resorts-caribbean-bermuda-bahamas",
        "items": [
          "Secret Bay (Dominica)",
          "Tensing Pen (Negril, Jamaica)",
          "Baoase Luxury Resort (Curacao)"
        ]
      },
      "cntraveler": {
        "label": "Conde Nast Traveller · Readers' Choice, Caribbean 2024",
        "url": "https://www.cntraveller.com/gallery/best-resorts-caribbean-central-america-2024",
        "items": [
          "Eden Roc Cap Cana (Dominican Republic)",
          "Casa de Campo Resort & Villas (Dominican Republic)"
        ]
      }
    },
    "vote": {
      "items": [
        "Jade Mountain (St. Lucia)",
        "Eden Roc Cap Cana (Dominican Republic)",
        "Secret Bay (Dominica)",
        "Rosewood Little Dix Bay (Virgin Gorda)",
        "Amanyara (Turks & Caicos)",
        "COMO Parrot Cay (Turks & Caicos)",
        "Le Barthelemy Hotel & Spa (St. Barths)",
        "Dorado Beach, a Ritz-Carlton Reserve (Puerto Rico)",
        "Curtain Bluff (Antigua)",
        "Casa de Campo Resort & Villas (Dominican Republic)"
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
        ]
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
        ]
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
    "publishedDate": "2026-05-29",
    "publishedAt": "2026-05-29T12:09:39Z",
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
    "blurb": "Rockefeller Center bargains, Theater District pre-show deals, and Grand Central institutions. Midtown Manhattan's best happy hours, by consensus.",
    "defaultSource": "ai",
    "links": {
      "5 Napkin Burger (Hell's Kitchen)": "https://www.google.com/maps/search/?api=1&query=5%20Napkin%20Burger%20Hell%20s%20Kitchen%20New%20York%20NY",
      "Beer Authority (Garment District)": "https://www.google.com/maps/search/?api=1&query=Beer%20Authority%20Garment%20District%20New%20York%20NY",
      "Bobby Van's Grill Times Square (Times Square)": "https://www.google.com/maps/search/?api=1&query=Bobby%20Van%20s%20Grill%20Times%20Square%20Times%20Square%20New%20York%20NY",
      "Boqueria (Times Square)": "https://www.google.com/maps/search/?api=1&query=Boqueria%20Times%20Square%20New%20York%20NY",
      "Castell Rooftop Lounge (Midtown West)": "https://www.google.com/maps/search/?api=1&query=Castell%20Rooftop%20Lounge%20Midtown%20West%20New%20York%20NY",
      "Double Knot (Midtown)": "https://www.google.com/maps/search/?api=1&query=Double%20Knot%20Midtown%20New%20York%20NY",
      "Golden HOF (Rockefeller Center)": "https://www.google.com/maps/search/?api=1&query=Golden%20HOF%20Rockefeller%20Center%20New%20York%20NY",
      "Hofbrau Bierhaus NYC (Grand Central)": "https://www.google.com/maps/search/?api=1&query=Hofbrau%20Bierhaus%20NYC%20Grand%20Central%20New%20York%20NY",
      "Juniper (Garment District)": "https://www.google.com/maps/search/?api=1&query=Juniper%20Garment%20District%20New%20York%20NY",
      "La Cava (Midtown East)": "https://www.google.com/maps/search/?api=1&query=La%20Cava%20Midtown%20East%20New%20York%20NY",
      "Lady Blue (Restaurant Row)": "https://www.google.com/maps/search/?api=1&query=Lady%20Blue%20Restaurant%20Row%20New%20York%20NY",
      "Marseille (Hell's Kitchen)": "https://www.google.com/maps/search/?api=1&query=Marseille%20Hell%20s%20Kitchen%20New%20York%20NY",
      "Mermaid Oyster Bar (Times Square)": "https://www.google.com/maps/search/?api=1&query=Mermaid%20Oyster%20Bar%20Times%20Square%20New%20York%20NY",
      "Musaek (Koreatown)": "https://www.google.com/maps/search/?api=1&query=Musaek%20Koreatown%20New%20York%20NY",
      "RPM Underground (Midtown West)": "https://www.google.com/maps/search/?api=1&query=RPM%20Underground%20Midtown%20West%20New%20York%20NY",
      "RT60 Rooftop (Times Square)": "https://www.google.com/maps/search/?api=1&query=RT60%20Rooftop%20Times%20Square%20New%20York%20NY",
      "Rosevale Kitchen + Cocktail Room (Hell's Kitchen)": "https://www.google.com/maps/search/?api=1&query=Rosevale%20Kitchen%20%2B%20Cocktail%20Room%20Hell%20s%20Kitchen%20New%20York%20NY",
      "Russian Vodka Room (Midtown West)": "https://www.google.com/maps/search/?api=1&query=Russian%20Vodka%20Room%20Midtown%20West%20New%20York%20NY",
      "Sicily Osteria (Restaurant Row)": "https://www.google.com/maps/search/?api=1&query=Sicily%20Osteria%20Restaurant%20Row%20New%20York%20NY",
      "The Dynamo Room (Midtown West)": "https://www.google.com/maps/search/?api=1&query=The%20Dynamo%20Room%20Midtown%20West%20New%20York%20NY",
      "The Friki Tiki (Hell's Kitchen)": "https://www.google.com/maps/search/?api=1&query=The%20Friki%20Tiki%20Hell%20s%20Kitchen%20New%20York%20NY",
      "The Palm (Theater District)": "https://www.google.com/maps/search/?api=1&query=The%20Palm%20Theater%20District%20New%20York%20NY",
      "The Rum House (Times Square)": "https://www.google.com/maps/search/?api=1&query=The%20Rum%20House%20Times%20Square%20New%20York%20NY",
      "The Shakespeare (Bryant Park)": "https://www.google.com/maps/search/?api=1&query=The%20Shakespeare%20Bryant%20Park%20New%20York%20NY",
      "The Stag's Head (Midtown East)": "https://www.google.com/maps/search/?api=1&query=The%20Stag%20s%20Head%20Midtown%20East%20New%20York%20NY",
      "Valerie (Bryant Park)": "https://www.google.com/maps/search/?api=1&query=Valerie%20Bryant%20Park%20New%20York%20NY"
    },
    "sources": {
      "ai": {
        "label": "Consensus AI",
        "items": [
          "The Rum House (Times Square)",
          "Castell Rooftop Lounge (Midtown West)",
          "Golden HOF (Rockefeller Center)",
          "The Dynamo Room (Midtown West)",
          "Russian Vodka Room (Midtown West)",
          "Double Knot (Midtown)",
          "The Palm (Theater District)",
          "Marseille (Hell's Kitchen)",
          "Mermaid Oyster Bar (Times Square)",
          "Valerie (Bryant Park)"
        ]
      },
      "infatuation": {
        "label": "The Infatuation · Best Midtown Happy Hours 2026",
        "url": "https://www.theinfatuation.com/new-york/guides/best-midtown-happy-hour-nyc",
        "items": [
          "Golden HOF (Rockefeller Center)",
          "The Dynamo Room (Midtown West)",
          "Russian Vodka Room (Midtown West)",
          "Double Knot (Midtown)",
          "Musaek (Koreatown)",
          "Hofbrau Bierhaus NYC (Grand Central)",
          "The Friki Tiki (Hell's Kitchen)",
          "The Shakespeare (Bryant Park)",
          "RPM Underground (Midtown West)",
          "Valerie (Bryant Park)",
          "La Cava (Midtown East)",
          "Juniper (Garment District)",
          "Beer Authority (Garment District)",
          "Castell Rooftop Lounge (Midtown West)"
        ]
      },
      "timeout": {
        "label": "Time Out New York · 12 Best Happy Hours in the Theater District 2025",
        "url": "https://www.timeout.com/newyork/best-happy-hours-theater-district-nyc",
        "items": [
          "The Palm (Theater District)",
          "Marseille (Hell's Kitchen)",
          "Bobby Van's Grill Times Square (Times Square)",
          "Mermaid Oyster Bar (Times Square)",
          "Boqueria (Times Square)",
          "Castell Rooftop Lounge (Midtown West)",
          "Sicily Osteria (Restaurant Row)",
          "The Rum House (Times Square)",
          "Rosevale Kitchen + Cocktail Room (Hell's Kitchen)",
          "RT60 Rooftop (Times Square)",
          "5 Napkin Burger (Hell's Kitchen)",
          "Lady Blue (Restaurant Row)"
        ]
      }
    },
    "vote": {
      "items": [
        "The Rum House (Times Square)",
        "Golden HOF (Rockefeller Center)",
        "The Dynamo Room (Midtown West)",
        "Double Knot (Midtown)",
        "Russian Vodka Room (Midtown West)",
        "Castell Rooftop Lounge (Midtown West)",
        "The Palm (Theater District)",
        "Valerie (Bryant Park)",
        "Marseille (Hell's Kitchen)",
        "The Stag's Head (Midtown East)"
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
        "label": "Atlanta Eats · Iconic Dive Bars (alphabetical) 2024",
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
  }
];

export { LISTS, TYPES, COLORS, AMAZON_AFFILIATE_TAG, BOOKING_AFFILIATE_AID, TRIPADVISOR_PARTNER };

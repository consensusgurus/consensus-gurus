// =========================================================================
// CENTRAL RATING-DATA STORE
//
// The canonical archive of every rating reading gathered for a review-count
// rating source (Yelp, Google, TripAdvisor, Amazon, Goodreads, regional
// platforms). HARD RULE (owner, 2026-06-10): whenever you gather or re-gather
// a venue's rating + review count for ANY rating source, stamp it here in the
// SAME deploy, as RATING_DATA[listId][itemName][platform] = { rating, count, date }.
// 'date' is the YYYY-MM-DD you read it. Item-name keys are byte-for-byte the
// canonical names used in lib/data.js (parentheticals and all).
//
// Why: review counts and the as-read rating are otherwise NOT stored anywhere,
// which forces a live re-gather for every re-ordering. With this archive, the
// sub-25-review floor, the planned source-recency multiplier, re-seeds, and
// audits can run from stored data. Newest reading per platform overwrites the
// previous one (keep the latest date).
// =========================================================================

export const RATING_DATA = {
  "best-restaurants-nantucket": {
    "Cru (Straight Wharf)": {
      "yelp": {
        "rating": 4,
        "count": 363,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 720,
        "date": "2026-06-13"
      }
    },
    "Straight Wharf (Harbor Square)": {
      "yelp": {
        "rating": 4,
        "count": 219,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 360,
        "date": "2026-06-13"
      }
    },
    "Topper's at The Wauwinet (Wauwinet)": {
      "yelp": {
        "rating": 4,
        "count": 129,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 320,
        "date": "2026-06-13"
      }
    },
    "The Nautilus (Downtown)": {
      "yelp": {
        "rating": 4.5,
        "count": 145,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 520,
        "date": "2026-06-13"
      }
    },
    "Oran Mor Bistro (Downtown)": {
      "yelp": {
        "rating": 4.5,
        "count": 251,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 400,
        "date": "2026-06-13"
      }
    },
    "Company of the Cauldron (Downtown)": {
      "yelp": {
        "rating": 4,
        "count": 84,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 220,
        "date": "2026-06-13"
      }
    },
    "Lola 41 (Downtown)": {
      "yelp": {
        "rating": 4,
        "count": 203,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 470,
        "date": "2026-06-13"
      }
    },
    "American Seasons (Downtown)": {
      "yelp": {
        "rating": 4,
        "count": 170,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 330,
        "date": "2026-06-13"
      }
    },
    "Ventuno (Downtown)": {
      "yelp": {
        "rating": 4,
        "count": 154,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 350,
        "date": "2026-06-13"
      }
    },
    "Galley Beach (Brant Point)": {
      "yelp": {
        "rating": 4,
        "count": 264,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 480,
        "date": "2026-06-13"
      }
    },
    "Proprietors Bar & Table (Downtown)": {
      "yelp": {
        "rating": 4,
        "count": 239,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 360,
        "date": "2026-06-13"
      }
    },
    "Breeze (Downtown)": {
      "yelp": {
        "rating": 4,
        "count": 200,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 410,
        "date": "2026-06-13"
      }
    },
    "Black-Eyed Susan's (Downtown)": {
      "yelp": {
        "rating": 4,
        "count": 284,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 520,
        "date": "2026-06-13"
      }
    }
  },
  "best-restaurants-marthas-vineyard": {
    "State Road (West Tisbury)": {
      "yelp": {
        "rating": 4.1,
        "count": 226,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 520,
        "date": "2026-06-13"
      }
    },
    "l'etoile (Edgartown)": {
      "yelp": {
        "rating": 4.3,
        "count": 162,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 300,
        "date": "2026-06-13"
      }
    },
    "Detente (Edgartown)": {
      "yelp": {
        "rating": 4.4,
        "count": 115,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 280,
        "date": "2026-06-13"
      }
    },
    "Atria (Edgartown)": {
      "yelp": {
        "rating": 4,
        "count": 298,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "The Covington (Edgartown)": {
      "yelp": {
        "rating": 4.3,
        "count": 158,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 250,
        "date": "2026-06-13"
      }
    },
    "Alchemy (Edgartown)": {
      "yelp": {
        "rating": 3.9,
        "count": 150,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 400,
        "date": "2026-06-13"
      }
    },
    "The Sweet Life Cafe (Oak Bluffs)": {
      "yelp": {
        "rating": 4.3,
        "count": 161,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 350,
        "date": "2026-06-13"
      }
    },
    "The Red Cat Kitchen (Oak Bluffs)": {
      "yelp": {
        "rating": 4.2,
        "count": 391,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 450,
        "date": "2026-06-13"
      }
    },
    "Beach Road (Vineyard Haven)": {
      "yelp": {
        "rating": 4,
        "count": 114,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 320,
        "date": "2026-06-13"
      }
    },
    "Garde East (Vineyard Haven)": {
      "yelp": {
        "rating": 4,
        "count": 120,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 250,
        "date": "2026-06-13"
      }
    },
    "The Ocean Club (Vineyard Haven)": {
      "yelp": {
        "rating": 4.3,
        "count": 30,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 90,
        "date": "2026-06-13"
      }
    },
    "Bettini (Edgartown)": {
      "yelp": {
        "rating": 4,
        "count": 89,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 300,
        "date": "2026-06-13"
      }
    },
    "The Beach Plum Inn (Chilmark/Menemsha)": {
      "yelp": {
        "rating": 4,
        "count": 102,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 180,
        "date": "2026-06-13"
      }
    },
    "Chilmark Tavern (Chilmark)": {
      "yelp": {
        "rating": 4.1,
        "count": 119,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 200,
        "date": "2026-06-13"
      }
    }
  },
  "best-italian-restaurants-nyc": {
    "Rezdora (Flatiron)": {
      "yelp": {
        "rating": 4.3,
        "count": 911,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.2,
        "count": 1646,
        "date": "2026-06-13"
      }
    },
    "Torrisi (Nolita)": {
      "yelp": {
        "rating": 4.4,
        "count": 435,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 1800,
        "date": "2026-06-13"
      }
    },
    "Via Carota (West Village)": {
      "yelp": {
        "rating": 4.4,
        "count": 1226,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 3000,
        "date": "2026-06-13"
      }
    },
    "Lilia (Williamsburg)": {
      "yelp": {
        "rating": 4.3,
        "count": 1430,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 2500,
        "date": "2026-06-13"
      }
    },
    "Misi (Williamsburg)": {
      "yelp": {
        "rating": 4.1,
        "count": 949,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 1200,
        "date": "2026-06-13"
      }
    },
    "Carbone (Greenwich Village)": {
      "yelp": {
        "rating": 4,
        "count": 2099,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 4500,
        "date": "2026-06-13"
      }
    },
    "Don Angie (West Village)": {
      "yelp": {
        "rating": 4.6,
        "count": 1144,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 2200,
        "date": "2026-06-13"
      }
    },
    "Roscioli NYC (SoHo)": {
      "yelp": {
        "rating": 4.4,
        "count": 197,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 800,
        "date": "2026-06-13"
      }
    },
    "L'Artusi (West Village)": {
      "yelp": {
        "rating": 4.3,
        "count": 2713,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 3500,
        "date": "2026-06-13"
      }
    },
    "Ci Siamo (Hudson Yards)": {
      "yelp": {
        "rating": 4.1,
        "count": 846,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 2000,
        "date": "2026-06-13"
      }
    },
    "Marea (Central Park South)": {
      "yelp": {
        "rating": 4.1,
        "count": 2545,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 3000,
        "date": "2026-06-13"
      }
    },
    "Emilio's Ballato (Nolita)": {
      "yelp": {
        "rating": 4.2,
        "count": 800,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 2500,
        "date": "2026-06-13"
      }
    }
  },
  "best-italian-restaurants-los-angeles": {
    "Osteria Mozza (Hancock Park)": {
      "yelp": {
        "rating": 4.2,
        "count": 3583,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 1500,
        "date": "2026-06-13"
      }
    },
    "Bestia (Arts District)": {
      "yelp": {
        "rating": 4.2,
        "count": 8079,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 6000,
        "date": "2026-06-13"
      }
    },
    "Felix Trattoria (Venice)": {
      "yelp": {
        "rating": 4.2,
        "count": 1552,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1500,
        "date": "2026-06-13"
      }
    },
    "Antico Nuovo (East Hollywood)": {
      "yelp": {
        "rating": 4.4,
        "count": 445,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 500,
        "date": "2026-06-13"
      }
    },
    "Mother Wolf (Hollywood)": {
      "yelp": {
        "rating": 4,
        "count": 1412,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.2,
        "count": 1800,
        "date": "2026-06-13"
      }
    },
    "Funke (Beverly Hills)": {
      "yelp": {
        "rating": 4,
        "count": 526,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "Chi Spacca (Hancock Park)": {
      "yelp": {
        "rating": 4.1,
        "count": 797,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 900,
        "date": "2026-06-13"
      }
    },
    "Angelini Osteria (Beverly Grove)": {
      "yelp": {
        "rating": 4.2,
        "count": 2314,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 1500,
        "date": "2026-06-13"
      }
    },
    "Dan Tana's (West Hollywood)": {
      "yelp": {
        "rating": 3.9,
        "count": 1388,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.1,
        "count": 1500,
        "date": "2026-06-13"
      }
    },
    "Rossoblu (Downtown)": {
      "yelp": {
        "rating": 4.4,
        "count": 1025,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 1100,
        "date": "2026-06-13"
      }
    },
    "Giorgio Baldi (Santa Monica)": {
      "yelp": {
        "rating": 4.3,
        "count": 626,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 800,
        "date": "2026-06-13"
      }
    },
    "Union (Pasadena)": {
      "yelp": {
        "rating": 4.4,
        "count": 500,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 900,
        "date": "2026-06-13"
      }
    }
  },
  "best-italian-restaurants-chicago": {
    "Monteverde (West Loop)": {
      "yelp": {
        "rating": 4.5,
        "count": 1543,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 2400,
        "date": "2026-06-13"
      }
    },
    "Tre Dita (Lakeshore East)": {
      "yelp": {
        "rating": 4.3,
        "count": 355,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 400,
        "date": "2026-06-13"
      }
    },
    "Il Carciofo (Fulton Market)": {
      "yelp": {
        "rating": 4.5,
        "count": 144,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 200,
        "date": "2026-06-13"
      }
    },
    "Ciccio Mio (River North)": {
      "yelp": {
        "rating": 4.7,
        "count": 637,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "Daisies (Logan Square)": {
      "yelp": {
        "rating": 4.5,
        "count": 778,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 800,
        "date": "2026-06-13"
      }
    },
    "Tortello (Wicker Park)": {
      "yelp": {
        "rating": 4.5,
        "count": 611,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "Osteria Langhe (Logan Square)": {
      "yelp": {
        "rating": 4.5,
        "count": 459,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 500,
        "date": "2026-06-13"
      }
    },
    "Piccolo Sogno (River West)": {
      "yelp": {
        "rating": 4.5,
        "count": 1603,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1500,
        "date": "2026-06-13"
      }
    },
    "Alla Vita (West Loop)": {
      "yelp": {
        "rating": 4.3,
        "count": 831,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 800,
        "date": "2026-06-13"
      }
    },
    "RPM Italian (River North)": {
      "yelp": {
        "rating": 4,
        "count": 3815,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 3000,
        "date": "2026-06-13"
      }
    },
    "Fioretta (Fulton Market)": {
      "yelp": {
        "rating": 4.2,
        "count": 251,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 300,
        "date": "2026-06-13"
      }
    }
  },
  "best-italian-restaurants-houston": {
    "Da Marco (Montrose)": {
      "yelp": {
        "rating": 4.4,
        "count": 382,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 1000,
        "date": "2026-06-13"
      }
    },
    "Milton's (Rice Village)": {
      "yelp": {
        "rating": 4.5,
        "count": 91,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 300,
        "date": "2026-06-13"
      }
    },
    "Coltivare (The Heights)": {
      "yelp": {
        "rating": 4.3,
        "count": 1309,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 1500,
        "date": "2026-06-13"
      }
    },
    "Giacomo's Cibo e Vino (Upper Kirby)": {
      "yelp": {
        "rating": 4,
        "count": 760,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 800,
        "date": "2026-06-13"
      }
    },
    "Amalfi Ristorante (Galleria)": {
      "yelp": {
        "rating": 4.3,
        "count": 336,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 400,
        "date": "2026-06-13"
      }
    },
    "Coppa Osteria (Rice Village)": {
      "yelp": {
        "rating": 4.2,
        "count": 811,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 900,
        "date": "2026-06-13"
      }
    },
    "Rosalie Italian Soul (Downtown)": {
      "yelp": {
        "rating": 4.1,
        "count": 275,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.2,
        "count": 400,
        "date": "2026-06-13"
      }
    },
    "Trattoria Sofia (The Heights)": {
      "yelp": {
        "rating": 4.4,
        "count": 555,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "Amore Italian (Upper Kirby)": {
      "yelp": {
        "rating": 4.5,
        "count": 155,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 200,
        "date": "2026-06-13"
      }
    },
    "Tiny Champions (EaDo)": {
      "yelp": {
        "rating": 4.4,
        "count": 300,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 350,
        "date": "2026-06-13"
      }
    },
    "Potente (Downtown)": {
      "yelp": {
        "rating": 4.2,
        "count": 506,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 600,
        "date": "2026-06-13"
      }
    }
  },
  "best-italian-restaurants-phoenix": {
    "Tratto (Biltmore)": {
      "yelp": {
        "rating": 4.3,
        "count": 474,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 350,
        "date": "2026-06-13"
      }
    },
    "Andreoli Italian Grocer (Scottsdale)": {
      "yelp": {
        "rating": 4.5,
        "count": 937,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 1956,
        "date": "2026-06-13"
      }
    },
    "Fat Ox (Scottsdale)": {
      "yelp": {
        "rating": 4.3,
        "count": 928,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 800,
        "date": "2026-06-13"
      }
    },
    "The Italiano (Scottsdale)": {
      "yelp": {
        "rating": 4.5,
        "count": 532,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 500,
        "date": "2026-06-13"
      }
    },
    "Marcellino Ristorante (Old Town Scottsdale)": {
      "yelp": {
        "rating": 4.3,
        "count": 635,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "Franco's Italian Caffe (Scottsdale)": {
      "yelp": {
        "rating": 4.4,
        "count": 368,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 1759,
        "date": "2026-06-13"
      }
    },
    "The Parlor (Phoenix)": {
      "yelp": {
        "rating": 4.4,
        "count": 2040,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 1800,
        "date": "2026-06-13"
      }
    },
    "Avanti (Phoenix)": {
      "yelp": {
        "rating": 4,
        "count": 390,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.2,
        "count": 500,
        "date": "2026-06-13"
      }
    },
    "Tutti Santi by Nina (Phoenix)": {
      "yelp": {
        "rating": 4.4,
        "count": 609,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1017,
        "date": "2026-06-13"
      }
    },
    "L'Amore Italian (Phoenix)": {
      "yelp": {
        "rating": 4.4,
        "count": 588,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "Forno 301 (Phoenix)": {
      "yelp": {
        "rating": 4.2,
        "count": 1008,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 1000,
        "date": "2026-06-13"
      }
    }
  },
  "best-italian-restaurants-philadelphia": {
    "Emilia (Kensington)": {
      "yelp": {
        "rating": 4.4,
        "count": 202,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 200,
        "date": "2026-06-13"
      }
    },
    "Vetri Cucina (Center City)": {
      "yelp": {
        "rating": 4.5,
        "count": 588,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.8,
        "count": 590,
        "date": "2026-06-13"
      }
    },
    "Ambra (Queen Village)": {
      "yelp": {
        "rating": 4.6,
        "count": 71,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.8,
        "count": 160,
        "date": "2026-06-13"
      }
    },
    "Irwin's (South Philly)": {
      "yelp": {
        "rating": 4.5,
        "count": 234,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 250,
        "date": "2026-06-13"
      }
    },
    "Fiorella (Bella Vista)": {
      "yelp": {
        "rating": 4.5,
        "count": 402,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 450,
        "date": "2026-06-13"
      }
    },
    "Palizzi Social Club (South Philly)": {
      "yelp": {
        "rating": 4.6,
        "count": 29,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.8,
        "count": 200,
        "date": "2026-06-13"
      }
    },
    "Dante and Luigi's (Bella Vista)": {
      "yelp": {
        "rating": 4.4,
        "count": 598,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "Ralph's Italian (Italian Market)": {
      "yelp": {
        "rating": 4,
        "count": 877,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 900,
        "date": "2026-06-13"
      }
    },
    "Le Virtu (East Passyunk)": {
      "yelp": {
        "rating": 4.4,
        "count": 470,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 500,
        "date": "2026-06-13"
      }
    },
    "Osteria (North Broad)": {
      "yelp": {
        "rating": 4,
        "count": 1124,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 1100,
        "date": "2026-06-13"
      }
    },
    "Cicala at the Divine Lorraine (North Broad)": {
      "yelp": {
        "rating": 4.5,
        "count": 150,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 250,
        "date": "2026-06-13"
      }
    }
  },
  "best-italian-restaurants-san-antonio": {
    "Nonna Osteria (Downtown)": {
      "yelp": {
        "rating": 4,
        "count": 805,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 900,
        "date": "2026-06-13"
      }
    },
    "Battalion (Southtown)": {
      "yelp": {
        "rating": 4.5,
        "count": 797,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 900,
        "date": "2026-06-13"
      }
    },
    "Paesanos Riverwalk (Downtown)": {
      "yelp": {
        "rating": 3.5,
        "count": 1438,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 3.9,
        "count": 1500,
        "date": "2026-06-13"
      }
    },
    "Aldo's Ristorante (Northwest)": {
      "yelp": {
        "rating": 4.5,
        "count": 349,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 500,
        "date": "2026-06-13"
      }
    },
    "Tre Trattoria (Midtown)": {
      "yelp": {
        "rating": 3.8,
        "count": 767,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 800,
        "date": "2026-06-13"
      }
    },
    "Piatti (Alamo Heights)": {
      "yelp": {
        "rating": 3.6,
        "count": 577,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "Aldino at the Vineyard (North Central)": {
      "yelp": {
        "rating": 4,
        "count": 291,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 350,
        "date": "2026-06-13"
      }
    },
    "La Focaccia Italian Grill (Southtown)": {
      "yelp": {
        "rating": 4,
        "count": 386,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 400,
        "date": "2026-06-13"
      }
    },
    "Guillermo's (Downtown)": {
      "yelp": {
        "rating": 4,
        "count": 1038,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 1000,
        "date": "2026-06-13"
      }
    },
    "Capparelli's On Main (Monte Vista)": {
      "yelp": {
        "rating": 3.7,
        "count": 203,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.1,
        "count": 300,
        "date": "2026-06-13"
      }
    },
    "Volare (Olmos Park)": {
      "yelp": {
        "rating": 4,
        "count": 187,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 250,
        "date": "2026-06-13"
      }
    }
  },
  "best-italian-restaurants-san-diego": {
    "Cesarina (Point Loma)": {
      "yelp": {
        "rating": 4.5,
        "count": 3527,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 2000,
        "date": "2026-06-13"
      }
    },
    "Ciccia Osteria (Barrio Logan)": {
      "yelp": {
        "rating": 4.5,
        "count": 792,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "Cucina Urbana (Bankers Hill)": {
      "yelp": {
        "rating": 4.4,
        "count": 4916,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 4800,
        "date": "2026-06-13"
      }
    },
    "Marisi (La Jolla)": {
      "yelp": {
        "rating": 4.4,
        "count": 935,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 800,
        "date": "2026-06-13"
      }
    },
    "Catania (La Jolla)": {
      "yelp": {
        "rating": 4.3,
        "count": 1404,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 1100,
        "date": "2026-06-13"
      }
    },
    "Roman Wolves (Little Italy)": {
      "yelp": {
        "rating": 4.5,
        "count": 848,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "Barbusa (Little Italy)": {
      "yelp": {
        "rating": 4.3,
        "count": 3756,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 3500,
        "date": "2026-06-13"
      }
    },
    "Bencotto (Little Italy)": {
      "yelp": {
        "rating": 4.4,
        "count": 3589,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 3000,
        "date": "2026-06-13"
      }
    },
    "Civico 1845 (Little Italy)": {
      "yelp": {
        "rating": 4.3,
        "count": 3480,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 3000,
        "date": "2026-06-13"
      }
    },
    "Piacere Mio (South Park)": {
      "yelp": {
        "rating": 4.4,
        "count": 2262,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1900,
        "date": "2026-06-13"
      }
    },
    "Buona Forchetta (South Park)": {
      "yelp": {
        "rating": 4.4,
        "count": 3778,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 3500,
        "date": "2026-06-13"
      }
    }
  },
  "best-italian-restaurants-dallas": {
    "Lucia (Bishop Arts)": {
      "yelp": {
        "rating": 4.4,
        "count": 626,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "Nonna (Park Cities)": {
      "yelp": {
        "rating": 4.8,
        "count": 382,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1726,
        "date": "2026-06-13"
      }
    },
    "The Charles (Design District)": {
      "yelp": {
        "rating": 4.5,
        "count": 500,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.8,
        "count": 495,
        "date": "2026-06-13"
      }
    },
    "La Stella Cucina Verace (Arts District)": {
      "yelp": {
        "rating": 4.5,
        "count": 259,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.8,
        "count": 1500,
        "date": "2026-06-13"
      }
    },
    "Carbone (Design District)": {
      "yelp": {
        "rating": 3.7,
        "count": 440,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "Partenope Ristorante (Downtown)": {
      "yelp": {
        "rating": 4.5,
        "count": 621,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "Via Triozzi (Lower Greenville)": {
      "yelp": {
        "rating": 4.5,
        "count": 158,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 200,
        "date": "2026-06-13"
      }
    },
    "Barsotti's (Oak Lawn)": {
      "yelp": {
        "rating": 4.4,
        "count": 106,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 400,
        "date": "2026-06-13"
      }
    },
    "Monarch (Downtown)": {
      "yelp": {
        "rating": 4.3,
        "count": 999,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 1000,
        "date": "2026-06-13"
      }
    },
    "Fachini (Highland Park)": {
      "yelp": {
        "rating": 4.2,
        "count": 266,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.2,
        "count": 300,
        "date": "2026-06-13"
      }
    },
    "Radici Wood Fired Grill (Farmers Branch)": {
      "yelp": {
        "rating": 4.3,
        "count": 105,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 102,
        "date": "2026-06-13"
      }
    }
  },
  "best-italian-restaurants-atlanta": {
    "Gigi's Italian Kitchen (Candler Park)": {
      "yelp": {
        "rating": 4.5,
        "count": 200,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 250,
        "date": "2026-06-13"
      }
    },
    "BoccaLupo (Inman Park)": {
      "yelp": {
        "rating": 4.5,
        "count": 756,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "No. 246 (Decatur)": {
      "yelp": {
        "rating": 4.4,
        "count": 1104,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1100,
        "date": "2026-06-13"
      }
    },
    "Sotto Sotto (Inman Park)": {
      "yelp": {
        "rating": 4.3,
        "count": 871,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 900,
        "date": "2026-06-13"
      }
    },
    "Lyla Lila (Midtown)": {
      "yelp": {
        "rating": 4.4,
        "count": 340,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 300,
        "date": "2026-06-13"
      }
    },
    "Il Premio (Old Fourth Ward)": {
      "yelp": {
        "rating": 4.4,
        "count": 150,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 200,
        "date": "2026-06-13"
      }
    },
    "Storico Fresco (Buckhead)": {
      "yelp": {
        "rating": 4.4,
        "count": 703,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1000,
        "date": "2026-06-13"
      }
    },
    "A Mano (Old Fourth Ward)": {
      "yelp": {
        "rating": 4.3,
        "count": 400,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 450,
        "date": "2026-06-13"
      }
    },
    "La Grotta (Buckhead)": {
      "yelp": {
        "rating": 4.4,
        "count": 473,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 1349,
        "date": "2026-06-13"
      }
    },
    "Pricci (Buckhead)": {
      "yelp": {
        "rating": 4.3,
        "count": 524,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "La Tavola Trattoria (Virginia-Highland)": {
      "yelp": {
        "rating": 4.4,
        "count": 712,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "Antica Posta (Buckhead)": {
      "yelp": {
        "rating": 4.4,
        "count": 278,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 300,
        "date": "2026-06-13"
      }
    }
  },
  "best-restaurants-charlotte": {
  "Counter- (Wesley Heights)": {
    "yelp": {
      "rating": 4.5,
      "count": 77,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.8,
      "count": 262,
      "date": "2026-06-13"
    }
  },
  "L'Ostrica (Montford)": {
    "yelp": {
      "rating": 5,
      "count": 25,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.8,
      "count": 120,
      "date": "2026-06-13"
    }
  },
  "Restaurant Constance (Wesley Heights)": {
    "yelp": {
      "rating": 4.5,
      "count": 113,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.8,
      "count": 298,
      "date": "2026-06-13"
    }
  },
  "Lang Van (Plaza Shamrock)": {
    "yelp": {
      "rating": 4.5,
      "count": 784,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.7,
      "count": 2304,
      "date": "2026-06-13"
    }
  },
  "Yunta (South End)": {
    "yelp": {
      "rating": 4.5,
      "count": 539,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.7,
      "count": 1518,
      "date": "2026-06-13"
    }
  },
  "Rada (Myers Park)": {
    "yelp": {
      "rating": 4,
      "count": 32,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.3,
      "count": 181,
      "date": "2026-06-13"
    }
  },
  "Supperland (Plaza Midwood)": {
    "yelp": {
      "rating": 4.5,
      "count": 557,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.5,
      "count": 1078,
      "date": "2026-06-13"
    }
  },
  "Omakase by Prime Fish (Providence Park)": {
    "yelp": {
      "rating": 4.5,
      "count": 23,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.8,
      "count": 73,
      "date": "2026-06-13"
    }
  },
  "Customshop (Elizabeth)": {
    "yelp": {
      "rating": 4,
      "count": 325,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.5,
      "count": 477,
      "date": "2026-06-13"
    }
  },
  "Bird Pizzeria (Optimist Park)": {
    "yelp": {
      "rating": 4,
      "count": 227,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.5,
      "count": 961,
      "date": "2026-06-13"
    }
  },
  "Ever Andalo (NoDa)": {
    "yelp": {
      "rating": 4.5,
      "count": 275,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.6,
      "count": 489,
      "date": "2026-06-13"
    }
  },
  "The Fig Tree (Elizabeth)": {
    "yelp": {
      "rating": 4.5,
      "count": 665,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.7,
      "count": 1129,
      "date": "2026-06-13"
    }
  },
  "Fin & Fino (Uptown)": {
    "yelp": {
      "rating": 4.5,
      "count": 591,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.6,
      "count": 1222,
      "date": "2026-06-13"
    }
  },
  "Albertine (Uptown)": {
    "yelp": {
      "rating": 4,
      "count": 70,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.5,
      "count": 245,
      "date": "2026-06-13"
    }
  },
  "Stagioni (Eastover)": {
    "yelp": {
      "rating": 4,
      "count": 354,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.5,
      "count": 550,
      "date": "2026-06-13"
    }
  },
  "Barrington's (SouthPark)": {
    "yelp": {
      "rating": 4,
      "count": 167,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.5,
      "count": 217,
      "date": "2026-06-13"
    }
  }
},
  "best-restaurants-minneapolis": {
  "Bûcheron (Kingfield)": {
    "yelp": {
      "rating": 5,
      "count": 86,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.8,
      "count": 346,
      "date": "2026-06-13"
    }
  },
  "Diane's Place (Northeast)": {
    "yelp": {
      "rating": 4.5,
      "count": 325,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.7,
      "count": 1152,
      "date": "2026-06-13"
    }
  },
  "Demi (North Loop)": {
    "yelp": {
      "rating": 4.5,
      "count": 123,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.9,
      "count": 484,
      "date": "2026-06-13"
    }
  },
  "112 Eatery (North Loop)": {
    "yelp": {
      "rating": 4.5,
      "count": 1444,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.7,
      "count": 1517,
      "date": "2026-06-13"
    }
  },
  "Spoon and Stable (North Loop)": {
    "yelp": {
      "rating": 4.5,
      "count": 1400,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.7,
      "count": 3066,
      "date": "2026-06-13"
    }
  },
  "Vinai (Northeast)": {
    "yelp": {
      "rating": 4.5,
      "count": 151,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.7,
      "count": 458,
      "date": "2026-06-13"
    }
  },
  "All Saints (Northeast)": {
    "yelp": {
      "rating": 4.5,
      "count": 121,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.8,
      "count": 570,
      "date": "2026-06-13"
    }
  },
  "Kado no Mise (North Loop)": {
    "yelp": {
      "rating": 4,
      "count": 284,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.7,
      "count": 735,
      "date": "2026-06-13"
    }
  },
  "P.S. Steak (Loring Park)": {
    "yelp": {
      "rating": 4.5,
      "count": 182,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.7,
      "count": 871,
      "date": "2026-06-13"
    }
  },
  "Gai Noi (Loring Park)": {
    "yelp": {
      "rating": 4.5,
      "count": 625,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.4,
      "count": 1816,
      "date": "2026-06-13"
    }
  },
  "Oro by Nixta (Northeast)": {
    "yelp": {
      "rating": 4.5,
      "count": 111,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.7,
      "count": 607,
      "date": "2026-06-13"
    }
  },
  "Myriel (St. Paul)": {
    "yelp": {
      "rating": 4.5,
      "count": 85,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.6,
      "count": 305,
      "date": "2026-06-13"
    }
  },
  "Alma (Marcy-Holmes)": {
    "yelp": {
      "rating": 4.5,
      "count": 722,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.6,
      "count": 2104,
      "date": "2026-06-13"
    }
  },
  "Hyacinth (St. Paul)": {
    "yelp": {
      "rating": 4.5,
      "count": 124,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.7,
      "count": 362,
      "date": "2026-06-13"
    }
  },
  "Meritage (St. Paul)": {
    "yelp": {
      "rating": 4,
      "count": 542,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.6,
      "count": 1012,
      "date": "2026-06-13"
    }
  },
  "St. Pierre Steak & Seafood (North Loop)": {
    "yelp": {
      "rating": 4,
      "count": 29,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.7,
      "count": 86,
      "date": "2026-06-13"
    }
  }
},
  "best-restaurants-phoenix": {
  "Bacanora (Grand Ave)": {
    "yelp": {
      "rating": 4,
      "count": 416,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.4,
      "count": 683,
      "date": "2026-06-13"
    }
  },
  "Tratto (East Phoenix)": {
    "yelp": {
      "rating": 4.5,
      "count": 475,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.6,
      "count": 656,
      "date": "2026-06-13"
    }
  },
  "FnB (Scottsdale)": {
    "yelp": {
      "rating": 4.5,
      "count": 839,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.6,
      "count": 686,
      "date": "2026-06-13"
    }
  },
  "Lom Wong (Downtown)": {
    "yelp": {
      "rating": 4.5,
      "count": 502,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.5,
      "count": 692,
      "date": "2026-06-13"
    }
  },
  "Restaurant Progress (Melrose)": {
    "yelp": {
      "rating": 4.5,
      "count": 362,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.7,
      "count": 531,
      "date": "2026-06-13"
    }
  },
  "Valentine (Melrose)": {
    "yelp": {
      "rating": 4.5,
      "count": 581,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.5,
      "count": 860,
      "date": "2026-06-13"
    }
  },
  "Pretty Penny (Roosevelt Row)": {
    "yelp": {
      "rating": 5,
      "count": 90,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.9,
      "count": 192,
      "date": "2026-06-13"
    }
  },
  "Sottise (Downtown)": {
    "yelp": {
      "rating": 4,
      "count": 211,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.5,
      "count": 349,
      "date": "2026-06-13"
    }
  },
  "Hush Public House (Scottsdale)": {
    "yelp": {
      "rating": 4.5,
      "count": 534,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.6,
      "count": 471,
      "date": "2026-06-13"
    }
  },
  "Beckett's Table (Arcadia)": {
    "yelp": {
      "rating": 4,
      "count": 1100,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.6,
      "count": 1051,
      "date": "2026-06-13"
    }
  },
  "Indibar (Paradise Valley)": {
    "yelp": {
      "rating": 4.5,
      "count": 162,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.6,
      "count": 418,
      "date": "2026-06-13"
    }
  },
  "Maeva (Gilbert)": {
    "yelp": {
      "rating": 4,
      "count": 59,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.5,
      "count": 133,
      "date": "2026-06-13"
    }
  },
  "The Ends (Scottsdale)": {
    "yelp": {
      "rating": 4,
      "count": 330,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.6,
      "count": 686,
      "date": "2026-06-13"
    }
  },
  "Glai Baan (Phoenix)": {
    "yelp": {
      "rating": 4.5,
      "count": 1500,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.7,
      "count": 1881,
      "date": "2026-06-13"
    }
  },
  "Feringhee (Chandler)": {
    "yelp": {
      "rating": 4.5,
      "count": 411,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.4,
      "count": 880,
      "date": "2026-06-13"
    }
  },
  "Persepshen (Uptown)": {
    "yelp": {
      "rating": 4.5,
      "count": 270,
      "date": "2026-06-13"
    },
    "google": {
      "rating": 4.5,
      "count": 378,
      "date": "2026-06-13"
    }
  }
},
  "best-restaurants-philadelphia": {
    "Provenance (Society Hill)": {
      "yelp": {
        "rating": 5,
        "count": 34,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 155,
        "date": "2026-06-13"
      }
    },
    "Friday Saturday Sunday (Rittenhouse)": {
      "yelp": {
        "rating": 4.5,
        "count": 423,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 868,
        "date": "2026-06-13"
      }
    },
    "Her Place Supper Club (Rittenhouse)": {
      "yelp": {
        "rating": 4.5,
        "count": 97,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 245,
        "date": "2026-06-13"
      }
    },
    "Kalaya (Fishtown)": {
      "yelp": {
        "rating": 4.5,
        "count": 615,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1929,
        "date": "2026-06-13"
      }
    },
    "Honeysuckle (Poplar)": {
      "yelp": {
        "rating": 4,
        "count": 43,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 165,
        "date": "2026-06-13"
      }
    },
    "Mawn (Bella Vista)": {
      "yelp": {
        "rating": 4.5,
        "count": 256,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.8,
        "count": 506,
        "date": "2026-06-13"
      }
    },
    "Ambra (Queen Village)": {
      "yelp": {
        "rating": 5,
        "count": 71,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 135,
        "date": "2026-06-13"
      }
    },
    "Emmett (Fishtown)": {
      "yelp": {
        "rating": 4.5,
        "count": 48,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.9,
        "count": 212,
        "date": "2026-06-13"
      }
    },
    "Illata (Graduate Hospital)": {
      "yelp": {
        "rating": 4.5,
        "count": 63,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.9,
        "count": 226,
        "date": "2026-06-13"
      }
    },
    "Vetri Cucina (Midtown Village)": {
      "yelp": {
        "rating": 4.5,
        "count": 588,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.8,
        "count": 840,
        "date": "2026-06-13"
      }
    },
    "Royal Sushi & Izakaya (Queen Village)": {
      "yelp": {
        "rating": 4.5,
        "count": 430,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1125,
        "date": "2026-06-13"
      }
    },
    "Zahav (Society Hill)": {
      "yelp": {
        "rating": 4.5,
        "count": 3600,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 3065,
        "date": "2026-06-13"
      }
    },
    "Roxanne (Queen Village)": {
      "yelp": {
        "rating": 4,
        "count": 17,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 62,
        "date": "2026-06-13"
      }
    },
    "Laser Wolf (Kensington)": {
      "yelp": {
        "rating": 4.5,
        "count": 580,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1117,
        "date": "2026-06-13"
      }
    },
    "My Loup (Rittenhouse)": {
      "yelp": {
        "rating": 4.5,
        "count": 115,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 258,
        "date": "2026-06-13"
      }
    },
    "Vernick Fish (Center City)": {
      "yelp": {
        "rating": 4.5,
        "count": 307,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 618,
        "date": "2026-06-13"
      }
    }
  },
  "best-restaurants-denver": {
    "The Wolf's Tailor (Sunnyside)": {
      "yelp": {
        "rating": 4.5,
        "count": 329,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 944,
        "date": "2026-06-13"
      }
    },
    "Beckon (RiNo)": {
      "yelp": {
        "rating": 4.5,
        "count": 168,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 529,
        "date": "2026-06-13"
      }
    },
    "Brutø (Dairy Block)": {
      "yelp": {
        "rating": 4.5,
        "count": 145,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 377,
        "date": "2026-06-13"
      }
    },
    "Kizaki (Platt Park)": {
      "yelp": {
        "rating": 5,
        "count": 21,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.9,
        "count": 98,
        "date": "2026-06-13"
      }
    },
    "Margot (Platt Park)": {
      "yelp": {
        "rating": 4.5,
        "count": 49,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.8,
        "count": 184,
        "date": "2026-06-13"
      }
    },
    "Mezcaleria Alma (LoHi)": {
      "yelp": {
        "rating": 5,
        "count": 96,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.9,
        "count": 373,
        "date": "2026-06-13"
      }
    },
    "Alma Fonda Fina (LoHi)": {
      "yelp": {
        "rating": 4.5,
        "count": 274,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.8,
        "count": 1036,
        "date": "2026-06-13"
      }
    },
    "Tavernetta (Union Station)": {
      "yelp": {
        "rating": 4.5,
        "count": 941,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 2547,
        "date": "2026-06-13"
      }
    },
    "Hop Alley (RiNo)": {
      "yelp": {
        "rating": 4,
        "count": 611,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1175,
        "date": "2026-06-13"
      }
    },
    "Carne (RiNo)": {
      "yelp": {
        "rating": 4.5,
        "count": 104,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 311,
        "date": "2026-06-13"
      }
    },
    "Sắp Sửa (East Colfax)": {
      "yelp": {
        "rating": 4.3,
        "count": 236,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 608,
        "date": "2026-06-13"
      }
    },
    "Restaurant Olivia (Wash Park)": {
      "yelp": {
        "rating": 4.5,
        "count": 298,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 848,
        "date": "2026-06-13"
      }
    },
    "Brasserie Brixton (Cole)": {
      "yelp": {
        "rating": 4.5,
        "count": 162,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 550,
        "date": "2026-06-13"
      }
    },
    "Barolo Grill (Cherry Creek)": {
      "yelp": {
        "rating": 4,
        "count": 484,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 1130,
        "date": "2026-06-13"
      }
    },
    "A5 Steakhouse (LoDo)": {
      "yelp": {
        "rating": 4.5,
        "count": 302,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1066,
        "date": "2026-06-13"
      }
    },
    "Rougarou (Five Points)": {
      "yelp": {
        "rating": 4.5,
        "count": 43,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.9,
        "count": 246,
        "date": "2026-06-13"
      }
    }
  },
  "best-restaurants-san-diego": {
    "Addison (Carmel Valley)": {
      "yelp": {
        "rating": 4.5,
        "count": 807,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 511,
        "date": "2026-06-13"
      }
    },
    "Soichi Sushi (University Heights)": {
      "yelp": {
        "rating": 5,
        "count": 548,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 448,
        "date": "2026-06-13"
      }
    },
    "Wolf in the Woods (Mission Hills)": {
      "yelp": {
        "rating": 4.5,
        "count": 524,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 395,
        "date": "2026-06-13"
      }
    },
    "Animae (Downtown)": {
      "yelp": {
        "rating": 4.5,
        "count": 1700,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1002,
        "date": "2026-06-13"
      }
    },
    "Callie (East Village)": {
      "yelp": {
        "rating": 4.5,
        "count": 992,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1134,
        "date": "2026-06-13"
      }
    },
    "Kingfisher (Golden Hill)": {
      "yelp": {
        "rating": 4.5,
        "count": 692,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 506,
        "date": "2026-06-13"
      }
    },
    "Nine-Ten (La Jolla)": {
      "yelp": {
        "rating": 4,
        "count": 862,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 525,
        "date": "2026-06-13"
      }
    },
    "A.R. Valentien (Torrey Pines)": {
      "yelp": {
        "rating": 4,
        "count": 431,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 339,
        "date": "2026-06-13"
      }
    },
    "Trust (Hillcrest)": {
      "yelp": {
        "rating": 4.5,
        "count": 1600,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1425,
        "date": "2026-06-13"
      }
    },
    "Kettner Exchange (Little Italy)": {
      "yelp": {
        "rating": 4,
        "count": 2500,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 2284,
        "date": "2026-06-13"
      }
    },
    "Cowboy Star (East Village)": {
      "yelp": {
        "rating": 4.5,
        "count": 2400,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1053,
        "date": "2026-06-13"
      }
    },
    "Lucien (La Jolla)": {
      "yelp": {
        "rating": 4.5,
        "count": 36,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.8,
        "count": 57,
        "date": "2026-06-13"
      }
    },
    "Cori Pastificio Trattoria (North Park)": {
      "yelp": {
        "rating": 4.5,
        "count": 641,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 486,
        "date": "2026-06-13"
      }
    },
    "Mister A's (Banker's Hill)": {
      "yelp": {
        "rating": 4,
        "count": 3000,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 2394,
        "date": "2026-06-13"
      }
    },
    "Kinme Omakase (Banker's Hill)": {
      "yelp": {
        "rating": 5,
        "count": 163,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.9,
        "count": 109,
        "date": "2026-06-13"
      }
    },
    "Fleurette (UTC)": {
      "yelp": {
        "rating": 4,
        "count": 88,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 88,
        "date": "2026-06-13"
      }
    }
  },
  "best-restaurants-houston": {
    "March (Montrose)": {
      "yelp": {
        "rating": 4.5,
        "count": 88,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 230,
        "date": "2026-06-13"
      }
    },
    "Tatemó (Northwest)": {
      "yelp": {
        "rating": 4.5,
        "count": 70,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.2,
        "count": 184,
        "date": "2026-06-13"
      }
    },
    "Musaafer (Galleria)": {
      "yelp": {
        "rating": 4.5,
        "count": 1000,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 4222,
        "date": "2026-06-13"
      }
    },
    "BCN Taste & Tradition (Montrose)": {
      "yelp": {
        "rating": 4.5,
        "count": 566,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 1260,
        "date": "2026-06-13"
      }
    },
    "Le Jardinier (Museum District)": {
      "yelp": {
        "rating": 4.5,
        "count": 304,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 679,
        "date": "2026-06-13"
      }
    },
    "Katami (Montrose)": {
      "yelp": {
        "rating": 4.5,
        "count": 306,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 483,
        "date": "2026-06-13"
      }
    },
    "Nancy's Hustle (EaDo)": {
      "yelp": {
        "rating": 4.5,
        "count": 1200,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 2218,
        "date": "2026-06-13"
      }
    },
    "Milton's (Rice Village)": {
      "yelp": {
        "rating": 4.5,
        "count": 91,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.8,
        "count": 208,
        "date": "2026-06-13"
      }
    },
    "Little's Oyster Bar (Upper Kirby)": {
      "yelp": {
        "rating": 4.5,
        "count": 216,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.8,
        "count": 426,
        "date": "2026-06-13"
      }
    },
    "Bludorn (Montrose)": {
      "yelp": {
        "rating": 4.5,
        "count": 757,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1392,
        "date": "2026-06-13"
      }
    },
    "Credence (Memorial)": {
      "yelp": {
        "rating": 4.5,
        "count": 255,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 543,
        "date": "2026-06-13"
      }
    },
    "Maximo (West University)": {
      "yelp": {
        "rating": 4.5,
        "count": 159,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 344,
        "date": "2026-06-13"
      }
    },
    "Jūn (Heights)": {
      "yelp": {
        "rating": 4,
        "count": 234,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 564,
        "date": "2026-06-13"
      }
    },
    "Squable (Heights)": {
      "yelp": {
        "rating": 4.5,
        "count": 660,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1085,
        "date": "2026-06-13"
      }
    },
    "Xochi (Downtown)": {
      "yelp": {
        "rating": 4.5,
        "count": 1300,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 4151,
        "date": "2026-06-13"
      }
    },
    "Theodore Rex (Warehouse District)": {
      "yelp": {
        "rating": 4.5,
        "count": 301,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 656,
        "date": "2026-06-13"
      }
    }
  },
  "best-restaurants-austin": {
    "Craft Omakase (Rosedale)": {
      "yelp": {
        "rating": 5,
        "count": 97,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 5,
        "count": 483,
        "date": "2026-06-13"
      }
    },
    "Barley Swine (Burnet Road)": {
      "yelp": {
        "rating": 4.5,
        "count": 1300,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 1412,
        "date": "2026-06-13"
      }
    },
    "Hestia (Downtown)": {
      "yelp": {
        "rating": 4.5,
        "count": 437,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 997,
        "date": "2026-06-13"
      }
    },
    "Olamaie (Downtown)": {
      "yelp": {
        "rating": 4,
        "count": 640,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 946,
        "date": "2026-06-13"
      }
    },
    "Uchiko (Triangle State)": {
      "yelp": {
        "rating": 4.5,
        "count": 2300,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 3435,
        "date": "2026-06-13"
      }
    },
    "Suerte (East Austin)": {
      "yelp": {
        "rating": 4.5,
        "count": 1400,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 3099,
        "date": "2026-06-13"
      }
    },
    "Canje (East Austin)": {
      "yelp": {
        "rating": 4.5,
        "count": 627,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1441,
        "date": "2026-06-13"
      }
    },
    "Jeffrey's (Clarksville)": {
      "yelp": {
        "rating": 4,
        "count": 584,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 1171,
        "date": "2026-06-13"
      }
    },
    "Foreign & Domestic (Hyde Park)": {
      "yelp": {
        "rating": 4,
        "count": 951,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1174,
        "date": "2026-06-13"
      }
    },
    "Dai Due (Cherrywood)": {
      "yelp": {
        "rating": 4.5,
        "count": 816,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 1438,
        "date": "2026-06-13"
      }
    },
    "Intero (East Cesar Chavez)": {
      "yelp": {
        "rating": 4.5,
        "count": 657,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 1250,
        "date": "2026-06-13"
      }
    },
    "Justine's Brasserie (Govalle)": {
      "yelp": {
        "rating": 4,
        "count": 1400,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 1888,
        "date": "2026-06-13"
      }
    },
    "Odd Duck (South Lamar)": {
      "yelp": {
        "rating": 4.5,
        "count": 2400,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 3725,
        "date": "2026-06-13"
      }
    },
    "Emmer & Rye (Rainey Street)": {
      "yelp": {
        "rating": 4,
        "count": 1000,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 1823,
        "date": "2026-06-13"
      }
    },
    "Este (Cherrywood)": {
      "yelp": {
        "rating": 4.5,
        "count": 427,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1136,
        "date": "2026-06-13"
      }
    },
    "Lutie's (Commodore Perry Estate)": {
      "yelp": {
        "rating": 4,
        "count": 278,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 477,
        "date": "2026-06-13"
      }
    }
  },
  "ski-resort-bars-world": {
    "La Folie Douce (Val d'Isère, France)": {
      "google": {
        "rating": 4.4,
        "count": 2953,
        "date": "2026-06-10"
      }
    },
    "Cloud Nine Alpine Bistro (Aspen Highlands, USA)": {
      "google": {
        "rating": 4.4,
        "count": 287,
        "date": "2026-06-10"
      }
    },
    "Hennu Stall (Zermatt, Switzerland)": {
      "google": {
        "rating": 4.6,
        "count": 400,
        "date": "2026-06-10"
      }
    },
    "Tio Bob's (Portillo, Chile)": {
      "google": {
        "rating": 4.8,
        "count": 21,
        "date": "2026-06-10"
      }
    },
    "The Ice Bar at Uley's Cabin (Crested Butte, USA)": {
      "google": {
        "rating": 3.6,
        "count": 25,
        "date": "2026-06-10"
      }
    },
    "The Sundeck (Aspen, USA)": {
      "google": {
        "rating": 4.7,
        "count": 1269,
        "date": "2026-06-10"
      }
    },
    "Elk Camp (Snowmass, USA)": {
      "google": {
        "rating": 4.6,
        "count": 395,
        "date": "2026-06-10"
      }
    },
    "Gorrono Ranch (Telluride, USA)": {
      "google": {
        "rating": 4.4,
        "count": 191,
        "date": "2026-06-10"
      }
    },
    "Schnapshans Bar (Zell am See, Austria)": {
      "google": {
        "rating": 2.7,
        "count": 243,
        "date": "2026-06-10"
      }
    },
    "Paznauer Taja (Ischgl, Austria)": {
      "google": {
        "rating": 4.5,
        "count": 1862,
        "date": "2026-06-10"
      }
    },
    "Pano Bar (Les 2 Alpes, France)": {
      "google": {
        "rating": 4.3,
        "count": 3926,
        "date": "2026-06-10"
      }
    },
    "Merry-Go-Round (Aspen Highlands, USA)": {
      "google": {
        "rating": 4.3,
        "count": 154,
        "date": "2026-06-10"
      }
    },
    "Unbuckle at Tamarack Lodge (Heavenly, USA)": {
      "google": {
        "rating": 4.2,
        "count": 1428,
        "date": "2026-06-10"
      }
    }
  },
  "croissants-montreal": {
    "Au Kouign Amann (Plateau)": {
      "yelp": {
        "rating": 4.7,
        "count": 543,
        "date": "2026-06-10"
      }
    },
    "Le Saint Louis Café (Plateau)": {
      "yelp": {
        "rating": 4.6,
        "count": 8,
        "date": "2026-06-10"
      }
    },
    "Hof Kelsten (Mile End)": {
      "yelp": {
        "rating": 4.2,
        "count": 119,
        "date": "2026-06-10"
      }
    },
    "Les Co'pains d'abord (Plateau)": {
      "yelp": {
        "rating": 4.6,
        "count": 67,
        "date": "2026-06-10"
      }
    },
    "Fous Desserts (Plateau)": {
      "yelp": {
        "rating": 4.5,
        "count": 54,
        "date": "2026-06-10"
      }
    },
    "Olive et Gourmando (Old Montreal)": {
      "yelp": {
        "rating": 4.4,
        "count": 1786,
        "date": "2026-06-10"
      }
    },
    "Le Paltoquet (Outremont)": {
      "yelp": {
        "rating": 4.2,
        "count": 23,
        "date": "2026-06-10"
      }
    },
    "Boulangerie Jarry (Villeray)": {
      "yelp": {
        "rating": 3,
        "count": 3,
        "date": "2026-06-10"
      }
    },
    "Croissant Croissant (Plateau)": {
      "yelp": {
        "rating": 4.6,
        "count": 44,
        "date": "2026-06-10"
      }
    },
    "Aube Boulangerie (Hochelaga)": {
      "yelp": {
        "rating": 5,
        "count": 1,
        "date": "2026-06-10"
      }
    },
    "Le Pain dans les Voiles (Villeray)": {
      "yelp": {
        "rating": 4.3,
        "count": 50,
        "date": "2026-06-10"
      }
    },
    "La Petite Boulangerie (Ahuntsic)": {
      "yelp": {
        "rating": 4.8,
        "count": 9,
        "date": "2026-06-10"
      }
    },
    "La Croissanterie Figaro (Outremont)": {
      "yelp": {
        "rating": 3.8,
        "count": 137,
        "date": "2026-06-10"
      }
    },
    "Automne Boulangerie (Rosemont)": {
      "yelp": {
        "rating": 4.4,
        "count": 38,
        "date": "2026-06-10"
      }
    },
    "La Bête à Pain (Griffintown)": {
      "yelp": {
        "rating": 4.3,
        "count": 71,
        "date": "2026-06-10"
      }
    },
    "Helico (Hochelaga)": {
      "yelp": {
        "rating": 4.5,
        "count": 13,
        "date": "2026-06-10"
      }
    },
    "Brioche à Tête (Mile End)": {
      "yelp": {
        "rating": 4.5,
        "count": 33,
        "date": "2026-06-10"
      }
    },
    "Louise Boulangerie (Little Italy)": {
      "yelp": {
        "rating": 4.5,
        "count": 23,
        "date": "2026-06-10"
      }
    },
    "Joe la Croûte (Jean-Talon Market)": {
      "yelp": {
        "rating": 4.4,
        "count": 20,
        "date": "2026-06-10"
      }
    },
    "Le Toledo (Plateau)": {
      "yelp": {
        "rating": 4.4,
        "count": 68,
        "date": "2026-06-10"
      }
    },
    "Rhubarbe (Pointe-Saint-Charles)": {
      "yelp": {
        "rating": 4.6,
        "count": 69,
        "date": "2026-06-10"
      }
    },
    "Chez Fred (Monkland)": {
      "yelp": {
        "rating": 4.4,
        "count": 57,
        "date": "2026-06-10"
      }
    },
    "Mamie Clafoutis (Plateau)": {
      "yelp": {
        "rating": 4.4,
        "count": 339,
        "date": "2026-06-10"
      }
    },
    "L'Amour du Pain (Griffintown)": {
      "yelp": {
        "rating": 4.4,
        "count": 26,
        "date": "2026-06-10"
      }
    },
    "Farine & Vanille (Mile End)": {
      "yelp": {
        "rating": 4.8,
        "count": 22,
        "date": "2026-06-10"
      }
    },
    "De Froment et de Sève (Rosemont)": {
      "yelp": {
        "rating": 4.1,
        "count": 35,
        "date": "2026-06-10"
      }
    },
    "Ô Petit Paris (Plateau)": {
      "yelp": {
        "rating": 4.6,
        "count": 8,
        "date": "2026-06-10"
      }
    },
    "Boulangerie Guillaume (Mile End)": {
      "yelp": {
        "rating": 4.7,
        "count": 120,
        "date": "2026-06-10"
      }
    }
  }
};

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

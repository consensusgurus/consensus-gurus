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

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

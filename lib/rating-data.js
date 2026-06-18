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
  "best-steakhouses-nyc": {
    "Cote (Flatiron)": {
      "yelp": {
        "rating": 4.5,
        "count": 2057,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.6,
        "count": 3986,
        "date": "2026-06-17"
      }
    },
    "Keens Steakhouse (Herald Square)": {
      "yelp": {
        "rating": 4.5,
        "count": 3584,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.6,
        "count": 6500,
        "date": "2026-06-17"
      }
    },
    "Peter Luger Steak House (Williamsburg)": {
      "yelp": {
        "rating": 4,
        "count": 7465,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 11000,
        "date": "2026-06-17"
      }
    },
    "4 Charles Prime Rib (West Village)": {
      "yelp": {
        "rating": 4.5,
        "count": 600,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.7,
        "count": 950,
        "date": "2026-06-17"
      }
    },
    "Hawksmoor (Gramercy)": {
      "yelp": {
        "rating": 4.2,
        "count": 614,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 2200,
        "date": "2026-06-17"
      }
    },
    "Gallaghers Steakhouse (Times Square)": {
      "yelp": {
        "rating": 4,
        "count": 2248,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.4,
        "count": 6200,
        "date": "2026-06-17"
      }
    },
    "Delmonico's (Financial District)": {
      "yelp": {
        "rating": 4,
        "count": 1462,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.3,
        "count": 2800,
        "date": "2026-06-17"
      }
    },
    "La Tete d'Or (Flatiron)": {
      "yelp": {
        "rating": 4,
        "count": 137,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.4,
        "count": 600,
        "date": "2026-06-17"
      }
    },
    "Gage & Tollner (Downtown Brooklyn)": {
      "yelp": {
        "rating": 4,
        "count": 360,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.3,
        "count": 1312,
        "date": "2026-06-17"
      }
    },
    "St. Anselm (Williamsburg)": {
      "yelp": {
        "rating": 4.3,
        "count": 1059,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 1800,
        "date": "2026-06-17"
      }
    },
    "The Dynamo Room (Midtown West)": {
      "yelp": {
        "rating": 4,
        "count": 39,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.4,
        "count": 200,
        "date": "2026-06-17"
      }
    },
    "Golden Steer (Greenwich Village)": {
      "yelp": {
        "rating": 4,
        "count": 37,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.4,
        "count": 150,
        "date": "2026-06-17"
      }
    },
    "Old Homestead Steakhouse (Meatpacking)": {
      "yelp": {
        "rating": 4,
        "count": 1434,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.2,
        "count": 3570,
        "date": "2026-06-17"
      }
    },
    "Christos Steakhouse (Astoria)": {
      "yelp": {
        "rating": 4.5,
        "count": 509,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 1100,
        "date": "2026-06-17"
      }
    },
    "Cuerno (Midtown West)": {
      "yelp": {
        "rating": 4,
        "count": 98,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.4,
        "count": 300,
        "date": "2026-06-17"
      }
    }
  },
  "best-steakhouses-boston": {
    "Grill 23 & Bar (Back Bay)": {
      "yelp": {
        "rating": 4,
        "count": 1412,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 4200,
        "date": "2026-06-17"
      }
    },
    "Abe & Louie's (Back Bay)": {
      "yelp": {
        "rating": 4.5,
        "count": 1873,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 2944,
        "date": "2026-06-17"
      }
    },
    "Mooo (Beacon Hill)": {
      "yelp": {
        "rating": 4.5,
        "count": 1182,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 5000,
        "date": "2026-06-17"
      }
    },
    "Mooo Seaport (Fort Point)": {
      "yelp": {
        "rating": 4.5,
        "count": 159,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.6,
        "count": 700,
        "date": "2026-06-17"
      }
    },
    "Prima (Charlestown)": {
      "yelp": {
        "rating": 4.5,
        "count": 202,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 800,
        "date": "2026-06-17"
      }
    },
    "Bogie's Place (Downtown Crossing)": {
      "yelp": {
        "rating": 4,
        "count": 141,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 300,
        "date": "2026-06-17"
      }
    },
    "Vermilion (Downtown)": {
      "yelp": {
        "rating": 4,
        "count": 61,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.4,
        "count": 400,
        "date": "2026-06-17"
      }
    },
    "Rochambeau (Back Bay)": {
      "yelp": {
        "rating": 4,
        "count": 389,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.3,
        "count": 2500,
        "date": "2026-06-17"
      }
    },
    "Davio's (Seaport)": {
      "yelp": {
        "rating": 4,
        "count": 250,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.4,
        "count": 1800,
        "date": "2026-06-17"
      }
    },
    "The Stockyard (Brighton)": {
      "yelp": {
        "rating": 4,
        "count": 557,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 2455,
        "date": "2026-06-17"
      }
    },
    "Rare Steakhouse (Everett)": {
      "yelp": {
        "rating": 4,
        "count": 257,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.4,
        "count": 900,
        "date": "2026-06-17"
      }
    },
    "Masons Steakhouse (Quincy)": {
      "yelp": {
        "rating": 4.5,
        "count": 122,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.7,
        "count": 762,
        "date": "2026-06-17"
      }
    },
    "Pellana Prime Steakhouse (Peabody)": {
      "yelp": {
        "rating": 4.5,
        "count": 386,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.6,
        "count": 1800,
        "date": "2026-06-17"
      }
    },
    "Capricho Colombian Steakhouse (Brookline)": {
      "yelp": {
        "rating": 4.5,
        "count": 18,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.7,
        "count": 90,
        "date": "2026-06-17"
      }
    }
  },
  "best-steakhouses-chicago": {
    "Tre Dita (Loop)": {
      "yelp": {
        "rating": 4,
        "count": 356,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.3,
        "count": 700,
        "date": "2026-06-17"
      }
    },
    "Bavette's Bar & Boeuf (River North)": {
      "yelp": {
        "rating": 4.4,
        "count": 3525,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.6,
        "count": 6000,
        "date": "2026-06-17"
      }
    },
    "Asador Bastian (River North)": {
      "yelp": {
        "rating": 4.3,
        "count": 167,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.6,
        "count": 300,
        "date": "2026-06-17"
      }
    },
    "Gibsons Bar & Steakhouse (Gold Coast)": {
      "yelp": {
        "rating": 4.1,
        "count": 2854,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 7500,
        "date": "2026-06-17"
      }
    },
    "El Che Steakhouse & Bar (West Loop)": {
      "yelp": {
        "rating": 4.2,
        "count": 546,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 1500,
        "date": "2026-06-17"
      }
    },
    "Gene & Georgetti (River North)": {
      "yelp": {
        "rating": 4,
        "count": 1233,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 2500,
        "date": "2026-06-17"
      }
    },
    "Maple & Ash (Gold Coast)": {
      "yelp": {
        "rating": 4.2,
        "count": 2521,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 4100,
        "date": "2026-06-17"
      }
    },
    "Swift & Sons (West Loop)": {
      "yelp": {
        "rating": 4.3,
        "count": 963,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.6,
        "count": 2000,
        "date": "2026-06-17"
      }
    },
    "RPM Steak (River North)": {
      "yelp": {
        "rating": 4.3,
        "count": 1884,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 2500,
        "date": "2026-06-17"
      }
    },
    "Boeufhaus (Humboldt Park)": {
      "yelp": {
        "rating": 4.2,
        "count": 504,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.6,
        "count": 850,
        "date": "2026-06-17"
      }
    },
    "Bonyeon (West Loop)": {
      "yelp": {
        "rating": 4.7,
        "count": 14,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.6,
        "count": 76,
        "date": "2026-06-17"
      }
    },
    "The Alston (River North)": {
      "yelp": {
        "rating": 4.1,
        "count": 90,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.4,
        "count": 250,
        "date": "2026-06-17"
      }
    },
    "Prime & Provisions (Loop)": {
      "yelp": {
        "rating": 4.3,
        "count": 1710,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 3000,
        "date": "2026-06-17"
      }
    },
    "Chicago Cut Steakhouse (River North)": {
      "yelp": {
        "rating": 4.2,
        "count": 2061,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.4,
        "count": 4000,
        "date": "2026-06-17"
      }
    }
  },
  "best-steakhouses-dallas": {
    "Pappas Bros. Steakhouse (Northwest Dallas)": {
      "yelp": {
        "rating": 4.4,
        "count": 1401,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.7,
        "count": 4200,
        "date": "2026-06-17"
      }
    },
    "Nick & Sam's (Uptown)": {
      "yelp": {
        "rating": 4,
        "count": 2110,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 3500,
        "date": "2026-06-17"
      }
    },
    "Town Hearth (Design District)": {
      "yelp": {
        "rating": 4.2,
        "count": 1028,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.6,
        "count": 2400,
        "date": "2026-06-17"
      }
    },
    "Al Biernat's (Oak Lawn)": {
      "yelp": {
        "rating": 4.2,
        "count": 1228,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 3200,
        "date": "2026-06-17"
      }
    },
    "Bob's Steak & Chop House (Oak Lawn)": {
      "yelp": {
        "rating": 4.2,
        "count": 615,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 1800,
        "date": "2026-06-17"
      }
    },
    "Brass Ram (Downtown)": {
      "yelp": {
        "rating": 4.5,
        "count": 104,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.7,
        "count": 520,
        "date": "2026-06-17"
      }
    },
    "Nuri Steakhouse (Uptown)": {
      "yelp": {
        "rating": 4.2,
        "count": 123,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.7,
        "count": 620,
        "date": "2026-06-17"
      }
    },
    "Stillwell's (Harwood District)": {
      "yelp": {
        "rating": 4.3,
        "count": 97,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.6,
        "count": 480,
        "date": "2026-06-17"
      }
    },
    "Dakota's Steakhouse (Downtown)": {
      "yelp": {
        "rating": 4,
        "count": 763,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 1900,
        "date": "2026-06-17"
      }
    },
    "Tango Room (Design District)": {
      "yelp": {
        "rating": 4.5,
        "count": 96,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.7,
        "count": 410,
        "date": "2026-06-17"
      }
    },
    "SER Steak + Spirits (Design District)": {
      "yelp": {
        "rating": 4.2,
        "count": 482,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 1400,
        "date": "2026-06-17"
      }
    },
    "III Forks (Addison)": {
      "yelp": {
        "rating": 4.2,
        "count": 600,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.4,
        "count": 1500,
        "date": "2026-06-17"
      }
    },
    "Chamberlain's Steak & Chop House (Addison)": {
      "yelp": {
        "rating": 4.3,
        "count": 828,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 1300,
        "date": "2026-06-17"
      }
    },
    "Y.O. Ranch Steakhouse (West End)": {
      "yelp": {
        "rating": 4.4,
        "count": 1283,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.8,
        "count": 12000,
        "date": "2026-06-17"
      }
    }
  },
  "best-steakhouses-atlanta": {
    "Bone's Restaurant (Buckhead)": {
      "yelp": {
        "rating": 4.3,
        "count": 1360,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.6,
        "count": 2461,
        "date": "2026-06-17"
      }
    },
    "Marcel (West Midtown)": {
      "yelp": {
        "rating": 4.2,
        "count": 1020,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 2400,
        "date": "2026-06-17"
      }
    },
    "Chops Lobster Bar (Buckhead)": {
      "yelp": {
        "rating": 4.4,
        "count": 1061,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 2900,
        "date": "2026-06-17"
      }
    },
    "Hal's The Steakhouse (Buckhead)": {
      "yelp": {
        "rating": 4.4,
        "count": 1033,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 2100,
        "date": "2026-06-17"
      }
    },
    "Kevin Rathbun Steak (Inman Park)": {
      "yelp": {
        "rating": 4.4,
        "count": 1141,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.6,
        "count": 2000,
        "date": "2026-06-17"
      }
    },
    "New York Prime (Buckhead)": {
      "yelp": {
        "rating": 4.1,
        "count": 443,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.4,
        "count": 1400,
        "date": "2026-06-17"
      }
    },
    "Little Alley Steak (Buckhead)": {
      "yelp": {
        "rating": 4.4,
        "count": 757,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 3200,
        "date": "2026-06-17"
      }
    },
    "Il Premio (Old Fourth Ward)": {
      "yelp": {
        "rating": 4.3,
        "count": 53,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 320,
        "date": "2026-06-17"
      }
    },
    "KR SteakBar (Peachtree Hills)": {
      "yelp": {
        "rating": 4.2,
        "count": 366,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 900,
        "date": "2026-06-17"
      }
    },
    "McKendrick's Steak House (Dunwoody)": {
      "yelp": {
        "rating": 4.2,
        "count": 416,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.4,
        "count": 1100,
        "date": "2026-06-17"
      }
    },
    "101 Steak (Vinings)": {
      "yelp": {
        "rating": 4.3,
        "count": 347,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.6,
        "count": 1500,
        "date": "2026-06-17"
      }
    },
    "LowCountry Steak (Midtown)": {
      "yelp": {
        "rating": 4.1,
        "count": 248,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 700,
        "date": "2026-06-17"
      }
    },
    "Nowak's Steakhouse (Sandy Springs)": {
      "yelp": {
        "rating": 4.4,
        "count": 62,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.6,
        "count": 300,
        "date": "2026-06-17"
      }
    },
    "H&W Steakhouse (Peachtree Corners)": {
      "yelp": {
        "rating": 4.5,
        "count": 220,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.6,
        "count": 600,
        "date": "2026-06-17"
      }
    }
  },
  "best-steakhouses-us": {
    "Peter Luger Steak House (Brooklyn)": {
      "yelp": {
        "rating": 3.5,
        "count": 7465,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.4,
        "count": 6500,
        "date": "2026-06-17"
      }
    },
    "Cote (New York)": {
      "yelp": {
        "rating": 4.3,
        "count": 2057,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.6,
        "count": 3200,
        "date": "2026-06-17"
      }
    },
    "Keens Steakhouse (New York)": {
      "yelp": {
        "rating": 4.4,
        "count": 3584,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.6,
        "count": 6800,
        "date": "2026-06-17"
      }
    },
    "Gibsons Bar & Steakhouse (Chicago)": {
      "yelp": {
        "rating": 4.1,
        "count": 2854,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 7800,
        "date": "2026-06-17"
      }
    },
    "Bavette's Bar & Boeuf (Chicago)": {
      "yelp": {
        "rating": 4.4,
        "count": 3525,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.6,
        "count": 5200,
        "date": "2026-06-17"
      }
    },
    "Pappas Bros. Steakhouse (Houston)": {
      "yelp": {
        "rating": 4.5,
        "count": 1315,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.7,
        "count": 2010,
        "date": "2026-06-17"
      }
    },
    "Bern's Steak House (Tampa)": {
      "yelp": {
        "rating": 4.3,
        "count": 4134,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.7,
        "count": 8500,
        "date": "2026-06-17"
      }
    },
    "St. Elmo Steak House (Indianapolis)": {
      "yelp": {
        "rating": 4.4,
        "count": 2968,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.6,
        "count": 7600,
        "date": "2026-06-17"
      }
    },
    "CUT by Wolfgang Puck (Beverly Hills)": {
      "yelp": {
        "rating": 4,
        "count": 1916,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 2400,
        "date": "2026-06-17"
      }
    },
    "House of Prime Rib (San Francisco)": {
      "yelp": {
        "rating": 4.4,
        "count": 10152,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.7,
        "count": 6772,
        "date": "2026-06-17"
      }
    },
    "Gallaghers Steakhouse (New York)": {
      "yelp": {
        "rating": 4,
        "count": 2248,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 4500,
        "date": "2026-06-17"
      }
    },
    "4 Charles Prime Rib (New York)": {
      "yelp": {
        "rating": 4.5,
        "count": 600,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.7,
        "count": 950,
        "date": "2026-06-17"
      }
    },
    "Gene & Georgetti (Chicago)": {
      "yelp": {
        "rating": 4,
        "count": 1233,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 2200,
        "date": "2026-06-17"
      }
    },
    "Killen's Steakhouse (Pearland)": {
      "yelp": {
        "rating": 4.3,
        "count": 540,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.7,
        "count": 4200,
        "date": "2026-06-17"
      }
    },
    "Mastro's Steakhouse (Beverly Hills)": {
      "yelp": {
        "rating": 4.2,
        "count": 1432,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.5,
        "count": 3600,
        "date": "2026-06-17"
      }
    },
    "The Grill on the Alley (Beverly Hills)": {
      "yelp": {
        "rating": 4,
        "count": 637,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.6,
        "count": 4448,
        "date": "2026-06-17"
      }
    },
    "Old Homestead Steakhouse (New York)": {
      "yelp": {
        "rating": 4,
        "count": 1434,
        "date": "2026-06-17"
      },
      "google": {
        "rating": 4.2,
        "count": 3570,
        "date": "2026-06-17"
      }
    }
  },
  "best-ski-resorts-northeast": {
    "Killington Resort (Vt.)": {
      "google": {
        "rating": 4.7,
        "count": 4399,
        "date": "2026-06-17"
      }
    },
    "Bretton Woods (N.H.)": {
      "google": {
        "rating": 4.7,
        "count": 1712,
        "date": "2026-06-17"
      }
    },
    "Sugarloaf (Maine)": {
      "google": {
        "rating": 4.8,
        "count": 336,
        "date": "2026-06-17"
      }
    },
    "Saddleback Mountain (Maine)": {
      "google": {
        "rating": 4.7,
        "count": 88,
        "date": "2026-06-17"
      }
    },
    "Smugglers' Notch (Vt.)": {
      "google": {
        "rating": 4.5,
        "count": 4077,
        "date": "2026-06-17"
      }
    },
    "Holiday Valley (N.Y.)": {
      "google": {
        "rating": 4.6,
        "count": 5235,
        "date": "2026-06-17"
      }
    },
    "Loon Mountain (N.H.)": {
      "google": {
        "rating": 4.6,
        "count": 4618,
        "date": "2026-06-17"
      }
    },
    "Whiteface Mountain (N.Y.)": {
      "google": {
        "rating": 4.6,
        "count": 2218,
        "date": "2026-06-17"
      }
    },
    "Jay Peak (Vt.)": {
      "google": {
        "rating": 4.5,
        "count": 4172,
        "date": "2026-06-17"
      }
    },
    "Stowe Mountain Resort (Vt.)": {
      "google": {
        "rating": 4.2,
        "count": 1007,
        "date": "2026-06-17"
      }
    },
    "Sunday River (Maine)": {
      "google": {
        "rating": 4.6,
        "count": 3084,
        "date": "2026-06-17"
      }
    },
    "Cannon Mountain (N.H.)": {
      "google": {
        "rating": 4.8,
        "count": 334,
        "date": "2026-06-17"
      }
    },
    "Sugarbush (Vt.)": {
      "google": {
        "rating": 4.6,
        "count": 1543,
        "date": "2026-06-17"
      }
    },
    "Mad River Glen (Vt.)": {
      "google": {
        "rating": 4.6,
        "count": 532,
        "date": "2026-06-17"
      }
    },
    "Stratton Mountain (Vt.)": {
      "google": {
        "rating": 4.5,
        "count": 2913,
        "date": "2026-06-17"
      }
    },
    "Okemo Mountain Resort (Vt.)": {
      "google": {
        "rating": 4.5,
        "count": 3910,
        "date": "2026-06-17"
      }
    },
    "Mount Snow (Vt.)": {
      "google": {
        "rating": 4.5,
        "count": 612,
        "date": "2026-06-17"
      }
    },
    "Waterville Valley (N.H.)": {
      "google": {
        "rating": 4.4,
        "count": 1275,
        "date": "2026-06-17"
      }
    },
    "Gore Mountain (N.Y.)": {
      "google": {
        "rating": 4.6,
        "count": 2400,
        "date": "2026-06-17"
      }
    },
    "Jiminy Peak (Mass.)": {
      "google": {
        "rating": 4.4,
        "count": 1741,
        "date": "2026-06-17"
      }
    }
  },
  "wwii-novels": {
    "All the Light We Cannot See (Anthony Doerr)": { "amazon": { "rating": 4.4, "count": 239700, "date": "2026-06-16" } },
    "The Book Thief (Markus Zusak)": { "amazon": { "rating": 4.6, "count": 76600, "date": "2026-06-16" } },
    "Catch-22 (Joseph Heller)": { "amazon": { "rating": 4.2, "count": 1300, "date": "2026-06-16" } },
    "Slaughterhouse-Five (Kurt Vonnegut)": { "amazon": { "rating": 4.4, "count": 39700, "date": "2026-06-16" } },
    "The Nightingale (Kristin Hannah)": { "amazon": { "rating": 4.7, "count": 411900, "date": "2026-06-16" } },
    "Atonement (Ian McEwan)": { "amazon": { "rating": 4.3, "count": 10900, "date": "2026-06-16" } },
    "The Winds of War (Herman Wouk)": { "amazon": { "rating": 4.7, "count": 5700, "date": "2026-06-16" } },
    "City of Thieves (David Benioff)": { "amazon": { "rating": 4.6, "count": 19700, "date": "2026-06-16" } },
    "Sophie's Choice (William Styron)": { "amazon": { "rating": 4.2, "count": 3500, "date": "2026-06-16" } },
    "The English Patient (Michael Ondaatje)": { "amazon": { "rating": 4.2, "count": 4300, "date": "2026-06-16" } },
    "The Naked and the Dead (Norman Mailer)": { "amazon": { "rating": 4.2, "count": 1600, "date": "2026-06-16" } },
    "Suite Française (Irène Némirovsky)": { "amazon": { "rating": 4.2, "count": 4200, "date": "2026-06-16" } },
  },
  "sports-memoirs": {
    "Open (Andre Agassi)": { "amazon": { "rating": 4.6, "count": 25400, "date": "2026-06-16" } },
    "Shoe Dog (Phil Knight)": { "amazon": { "rating": 4.7, "count": 63200, "date": "2026-06-16" } },
    "Ali: A Life (Jonathan Eig)": { "amazon": { "rating": 4.7, "count": 1200, "date": "2026-06-16" } },
    "Tiger Woods (Jeff Benedict & Armen Keteyian)": { "amazon": { "rating": 4.6, "count": 4500, "date": "2026-06-16" } },
    "Ball Four (Jim Bouton)": { "amazon": { "rating": 4.5, "count": 2900, "date": "2026-06-16" } },
    "The Mamba Mentality (Kobe Bryant)": { "amazon": { "rating": 4.8, "count": 30400, "date": "2026-06-16" } },
    "Eleven Rings (Phil Jackson)": { "amazon": { "rating": 4.6, "count": 5400, "date": "2026-06-16" } },
    "All In (Billie Jean King)": { "amazon": { "rating": 4.6, "count": 1400, "date": "2026-06-16" } },
    "Michael Jordan: The Life (Roland Lazenby)": { "amazon": { "rating": 4.6, "count": 2500, "date": "2026-06-16" } },
    "I Am Zlatan (Zlatan Ibrahimović)": { "amazon": { "rating": 4.6, "count": 793, "date": "2026-06-16" } },
    "Sweetness (Jeff Pearlman)": { "amazon": { "rating": 4.6, "count": 554, "date": "2026-06-16" } },
    "Days of Grace (Arthur Ashe)": { "amazon": { "rating": 4.5, "count": 253, "date": "2026-06-16" } },
  },
  "best-wings-dc": {
    "KoChix (Truxton Circle)": {
      "yelp": {
        "rating": 4.6,
        "count": 435,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.5,
        "count": 1400,
        "date": "2026-06-16"
      }
    },
    "Wingo's (Glover Park)": {
      "yelp": {
        "rating": 4.2,
        "count": 223,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.3,
        "count": 600,
        "date": "2026-06-16"
      }
    },
    "Bonchon (Navy Yard)": {
      "yelp": {
        "rating": 4.4,
        "count": 616,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.3,
        "count": 900,
        "date": "2026-06-16"
      }
    },
    "Maketto (H Street)": {
      "yelp": {
        "rating": 4.2,
        "count": 1356,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 1800,
        "date": "2026-06-16"
      }
    },
    "DCity Smokehouse (Bloomingdale)": {
      "yelp": {
        "rating": 4.3,
        "count": 934,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 1500,
        "date": "2026-06-16"
      }
    },
    "Roaming Rooster (U Street)": {
      "yelp": {
        "rating": 4.3,
        "count": 171,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.6,
        "count": 3000,
        "date": "2026-06-16"
      }
    },
    "Federalist Pig (Adams Morgan)": {
      "yelp": {
        "rating": 4.3,
        "count": 947,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 1600,
        "date": "2026-06-16"
      }
    },
    "Stan's Restaurant & Bar (Downtown)": {
      "yelp": {
        "rating": 3.9,
        "count": 677,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.5,
        "count": 1200,
        "date": "2026-06-16"
      }
    },
    "Boundary Stone (Bloomingdale)": {
      "yelp": {
        "rating": 4,
        "count": 534,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.3,
        "count": 900,
        "date": "2026-06-16"
      }
    },
    "CHIKO (Dupont Circle)": {
      "yelp": {
        "rating": 4.4,
        "count": 422,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 700,
        "date": "2026-06-16"
      }
    },
    "The Green Zone (Adams Morgan)": {
      "yelp": {
        "rating": 4.3,
        "count": 260,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 700,
        "date": "2026-06-16"
      }
    },
    "Oohh's & Aahh's (U Street)": {
      "yelp": {
        "rating": 4.1,
        "count": 1686,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.3,
        "count": 2500,
        "date": "2026-06-16"
      }
    },
    "Upstate FTW (U Street)": {
      "yelp": {
        "rating": 4.5,
        "count": 6,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 50,
        "date": "2026-06-16"
      }
    }
  },
  "best-burgers-dc": {
    "Duke's Grocery (Dupont Circle)": {
      "yelp": {
        "rating": 4,
        "count": 1378,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 2500,
        "date": "2026-06-16"
      }
    },
    "Lucky Buns (Adams Morgan)": {
      "yelp": {
        "rating": 4.1,
        "count": 639,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 1131,
        "date": "2026-06-16"
      }
    },
    "Good Stuff Eatery (Georgetown)": {
      "yelp": {
        "rating": 4,
        "count": 835,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.2,
        "count": 2000,
        "date": "2026-06-16"
      }
    },
    "Joia Burger (Mount Pleasant)": {
      "yelp": {
        "rating": 4,
        "count": 105,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.3,
        "count": 150,
        "date": "2026-06-16"
      }
    },
    "Hill East Burger (Capitol Hill)": {
      "yelp": {
        "rating": 4.4,
        "count": 60,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.5,
        "count": 200,
        "date": "2026-06-16"
      }
    },
    "Ghostburger (Shaw)": {
      "yelp": {
        "rating": 3.9,
        "count": 260,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.2,
        "count": 750,
        "date": "2026-06-16"
      }
    },
    "Le Diplomate (Logan Circle)": {
      "yelp": {
        "rating": 4.4,
        "count": 5769,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.5,
        "count": 6000,
        "date": "2026-06-16"
      }
    },
    "7th Street Burger (Georgetown)": {
      "yelp": {
        "rating": 4,
        "count": 192,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.3,
        "count": 300,
        "date": "2026-06-16"
      }
    },
    "The Capital Burger (Mt Vernon Square)": {
      "yelp": {
        "rating": 4.3,
        "count": 1147,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.6,
        "count": 2000,
        "date": "2026-06-16"
      }
    },
    "The Big Board (H Street)": {
      "yelp": {
        "rating": 4,
        "count": 429,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 913,
        "date": "2026-06-16"
      }
    },
    "Tune Inn (Capitol Hill)": {
      "yelp": {
        "rating": 4,
        "count": 577,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 968,
        "date": "2026-06-16"
      }
    },
    "Thunder Burger & Bar (Georgetown)": {
      "yelp": {
        "rating": 3.9,
        "count": 920,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.2,
        "count": 600,
        "date": "2026-06-16"
      }
    },
    "Stoney's On P (Logan Circle)": {
      "yelp": {
        "rating": 3.8,
        "count": 502,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.3,
        "count": 700,
        "date": "2026-06-16"
      }
    },
    "Ben's Chili Bowl (U Street)": {
      "yelp": {
        "rating": 4,
        "count": 4373,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 10000,
        "date": "2026-06-16"
      }
    },
    "Any Day Now (Navy Yard)": {
      "yelp": {
        "rating": 4.3,
        "count": 150,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.5,
        "count": 400,
        "date": "2026-06-16"
      }
    },
    "Melange (Shaw)": {
      "yelp": {
        "rating": 4.3,
        "count": 90,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.5,
        "count": 200,
        "date": "2026-06-16"
      }
    }
  },
  "best-dive-bars-dc": {
    "The Raven Grill (Mount Pleasant)": {
      "yelp": {
        "rating": 3.8,
        "count": 149,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.3,
        "count": 600,
        "date": "2026-06-16"
      }
    },
    "Dan's Cafe (Adams Morgan)": {
      "yelp": {
        "rating": 4,
        "count": 252,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 500,
        "date": "2026-06-16"
      }
    },
    "Tune Inn (Capitol Hill)": {
      "yelp": {
        "rating": 4,
        "count": 577,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 968,
        "date": "2026-06-16"
      }
    },
    "The Pug (H Street)": {
      "yelp": {
        "rating": 4.4,
        "count": 238,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.6,
        "count": 300,
        "date": "2026-06-16"
      }
    },
    "Showtime Lounge (Bloomingdale)": {
      "yelp": {
        "rating": 4.3,
        "count": 106,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 400,
        "date": "2026-06-16"
      }
    },
    "Red Derby (Columbia Heights)": {
      "yelp": {
        "rating": 4.1,
        "count": 574,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 800,
        "date": "2026-06-16"
      }
    },
    "Solly's U Street Tavern (U Street)": {
      "yelp": {
        "rating": 3.8,
        "count": 215,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.3,
        "count": 700,
        "date": "2026-06-16"
      }
    },
    "Ivy and Coney (Shaw)": {
      "yelp": {
        "rating": 4,
        "count": 200,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 500,
        "date": "2026-06-16"
      }
    },
    "Looking Glass Lounge (Park View)": {
      "yelp": {
        "rating": 3.7,
        "count": 243,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.1,
        "count": 500,
        "date": "2026-06-16"
      }
    },
    "Wonderland Ballroom (Columbia Heights)": {
      "yelp": {
        "rating": 3.6,
        "count": 547,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.2,
        "count": 1500,
        "date": "2026-06-16"
      }
    },
    "Little Miss Whiskey's Golden Dollar (H Street)": {
      "yelp": {
        "rating": 4,
        "count": 351,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.5,
        "count": 1500,
        "date": "2026-06-16"
      }
    },
    "Trusty's (Hill East)": {
      "yelp": {
        "rating": 4,
        "count": 205,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.5,
        "count": 600,
        "date": "2026-06-16"
      }
    },
    "The Dew Drop Inn (Edgewood)": {
      "yelp": {
        "rating": 4.2,
        "count": 136,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.6,
        "count": 700,
        "date": "2026-06-16"
      }
    },
    "Stoney's (Logan Circle)": {
      "yelp": {
        "rating": 3.8,
        "count": 502,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.3,
        "count": 1200,
        "date": "2026-06-16"
      }
    },
    "Snappy's Small Bar (Petworth)": {
      "yelp": {
        "rating": 4.5,
        "count": 60,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.6,
        "count": 200,
        "date": "2026-06-16"
      }
    }
  },
  "best-cocktail-bars-dc": {
    "Service Bar (U Street)": {
      "yelp": {
        "rating": 4.5,
        "count": 340,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.6,
        "count": 1100,
        "date": "2026-06-16"
      }
    },
    "Allegory (Downtown)": {
      "yelp": {
        "rating": 4,
        "count": 238,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.6,
        "count": 700,
        "date": "2026-06-16"
      }
    },
    "Silver Lyan (Penn Quarter)": {
      "yelp": {
        "rating": 4,
        "count": 227,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 850,
        "date": "2026-06-16"
      }
    },
    "The Green Zone (Adams Morgan)": {
      "yelp": {
        "rating": 4.3,
        "count": 260,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.6,
        "count": 600,
        "date": "2026-06-16"
      }
    },
    "barmini by Jose Andres (Penn Quarter)": {
      "yelp": {
        "rating": 4,
        "count": 432,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.7,
        "count": 600,
        "date": "2026-06-16"
      }
    },
    "Causa / Amazonia (Shaw)": {
      "yelp": {
        "rating": 4.5,
        "count": 354,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.6,
        "count": 1000,
        "date": "2026-06-16"
      }
    },
    "Providencia (H Street)": {
      "yelp": {
        "rating": 4.5,
        "count": 90,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.7,
        "count": 250,
        "date": "2026-06-16"
      }
    },
    "McClellan's Retreat (Dupont Circle)": {
      "yelp": {
        "rating": 4,
        "count": 233,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.5,
        "count": 450,
        "date": "2026-06-16"
      }
    },
    "Off the Record (Downtown)": {
      "yelp": {
        "rating": 4,
        "count": 445,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.5,
        "count": 600,
        "date": "2026-06-16"
      }
    },
    "Round Robin Bar (Downtown)": {
      "yelp": {
        "rating": 4,
        "count": 225,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.5,
        "count": 400,
        "date": "2026-06-16"
      }
    },
    "Quill (Downtown)": {
      "yelp": {
        "rating": 4.5,
        "count": 80,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.6,
        "count": 250,
        "date": "2026-06-16"
      }
    },
    "Jane Jane (Logan Circle)": {
      "yelp": {
        "rating": 4,
        "count": 179,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.5,
        "count": 350,
        "date": "2026-06-16"
      }
    },
    "Death & Co DC (Shaw)": {
      "yelp": {
        "rating": 4,
        "count": 113,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.5,
        "count": 350,
        "date": "2026-06-16"
      }
    },
    "Dauphine's (Downtown)": {
      "yelp": {
        "rating": 4,
        "count": 200,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.5,
        "count": 700,
        "date": "2026-06-16"
      }
    },
    "Medina (Logan Circle)": {
      "yelp": {
        "rating": 4.5,
        "count": 90,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.6,
        "count": 200,
        "date": "2026-06-16"
      }
    }
  },
  "best-bars-for-live-music-dc": {
    "9:30 Club (U Street)": {
      "yelp": {
        "rating": 4,
        "count": 792,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.7,
        "count": 3400,
        "date": "2026-06-16"
      }
    },
    "Black Cat (Logan Circle)": {
      "yelp": {
        "rating": 3.7,
        "count": 428,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.5,
        "count": 1100,
        "date": "2026-06-16"
      }
    },
    "The Hamilton Live (Penn Quarter)": {
      "yelp": {
        "rating": 3.9,
        "count": 200,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 600,
        "date": "2026-06-16"
      }
    },
    "Pearl Street Warehouse (The Wharf)": {
      "yelp": {
        "rating": 4.4,
        "count": 116,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.6,
        "count": 700,
        "date": "2026-06-16"
      }
    },
    "Union Stage (The Wharf)": {
      "yelp": {
        "rating": 4.3,
        "count": 106,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.5,
        "count": 500,
        "date": "2026-06-16"
      }
    },
    "DC9 Nightclub (U Street)": {
      "yelp": {
        "rating": 3.9,
        "count": 272,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 700,
        "date": "2026-06-16"
      }
    },
    "Blues Alley (Georgetown)": {
      "yelp": {
        "rating": 3.9,
        "count": 364,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 1200,
        "date": "2026-06-16"
      }
    },
    "JoJo Restaurant and Bar (U Street)": {
      "yelp": {
        "rating": 3.9,
        "count": 950,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.3,
        "count": 900,
        "date": "2026-06-16"
      }
    },
    "Mr. Henry's (Capitol Hill)": {
      "yelp": {
        "rating": 3.6,
        "count": 361,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 900,
        "date": "2026-06-16"
      }
    },
    "Madam's Organ (Adams Morgan)": {
      "yelp": {
        "rating": 3.5,
        "count": 525,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.2,
        "count": 1500,
        "date": "2026-06-16"
      }
    },
    "Bossa Bistro and Lounge (Adams Morgan)": {
      "yelp": {
        "rating": 3.8,
        "count": 142,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.2,
        "count": 400,
        "date": "2026-06-16"
      }
    },
    "Pie Shop (H Street)": {
      "yelp": {
        "rating": 4.2,
        "count": 99,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.5,
        "count": 300,
        "date": "2026-06-16"
      }
    },
    "Songbyrd Music House (Union Market)": {
      "yelp": {
        "rating": 4.2,
        "count": 230,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 600,
        "date": "2026-06-16"
      }
    },
    "The Pocket (Bloomingdale)": {
      "yelp": {
        "rating": 4.5,
        "count": 12,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.7,
        "count": 50,
        "date": "2026-06-16"
      }
    },
    "The Atlantis (U Street)": {
      "yelp": {
        "rating": 4.4,
        "count": 80,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.7,
        "count": 500,
        "date": "2026-06-16"
      }
    },
    "Hill Country Barbecue Market (Penn Quarter)": {
      "yelp": {
        "rating": 3.8,
        "count": 600,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.2,
        "count": 3000,
        "date": "2026-06-16"
      }
    }
  },
  "best-happy-hour-dc": {
    "Old Ebbitt Grill (Downtown)": {
      "yelp": {
        "rating": 4.2,
        "count": 11686,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 14000,
        "date": "2026-06-16"
      }
    },
    "Jack Rose Dining Saloon (Adams Morgan)": {
      "yelp": {
        "rating": 4.6,
        "count": 2392,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.5,
        "count": 2400,
        "date": "2026-06-16"
      }
    },
    "Bar Charley (Dupont Circle)": {
      "yelp": {
        "rating": 4.5,
        "count": 900,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.5,
        "count": 1500,
        "date": "2026-06-16"
      }
    },
    "Pearl Dive Oyster Palace (Logan Circle)": {
      "yelp": {
        "rating": 4.2,
        "count": 1134,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 2500,
        "date": "2026-06-16"
      }
    },
    "Hank's Oyster Bar (Dupont Circle)": {
      "yelp": {
        "rating": 4,
        "count": 1553,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.3,
        "count": 2000,
        "date": "2026-06-16"
      }
    },
    "Whiskey Charlie (The Wharf)": {
      "yelp": {
        "rating": 4,
        "count": 250,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.5,
        "count": 600,
        "date": "2026-06-16"
      }
    },
    "El Chucho (Columbia Heights)": {
      "yelp": {
        "rating": 4.2,
        "count": 700,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 1800,
        "date": "2026-06-16"
      }
    },
    "The Salt Line (Navy Yard)": {
      "yelp": {
        "rating": 3.9,
        "count": 623,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.3,
        "count": 1900,
        "date": "2026-06-16"
      }
    },
    "Boqueria (Dupont Circle)": {
      "yelp": {
        "rating": 4,
        "count": 1654,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 2000,
        "date": "2026-06-16"
      }
    },
    "Service Bar (U Street)": {
      "yelp": {
        "rating": 4.5,
        "count": 340,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.6,
        "count": 700,
        "date": "2026-06-16"
      }
    },
    "The Hamilton (Downtown)": {
      "yelp": {
        "rating": 3.9,
        "count": 4016,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.2,
        "count": 4500,
        "date": "2026-06-16"
      }
    },
    "El Techo (Shaw)": {
      "yelp": {
        "rating": 4,
        "count": 400,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.3,
        "count": 1500,
        "date": "2026-06-16"
      }
    },
    "Dirty Habit (Penn Quarter)": {
      "yelp": {
        "rating": 3.8,
        "count": 350,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.1,
        "count": 1200,
        "date": "2026-06-16"
      }
    },
    "Jaleo (Penn Quarter)": {
      "yelp": {
        "rating": 4,
        "count": 2500,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 5000,
        "date": "2026-06-16"
      }
    },
    "Wunder Garten (NoMa)": {
      "yelp": {
        "rating": 4,
        "count": 270,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.3,
        "count": 1100,
        "date": "2026-06-16"
      }
    },
    "Dacha Beer Garden (Shaw)": {
      "yelp": {
        "rating": 4,
        "count": 508,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.5,
        "count": 3500,
        "date": "2026-06-16"
      }
    }
  },
  "best-sports-bars-dc": {
    "Walters Sports Bar (Navy Yard)": {
      "yelp": {
        "rating": 4,
        "count": 217,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.5,
        "count": 1000,
        "date": "2026-06-16"
      }
    },
    "Penn Quarter Sports Tavern (Penn Quarter)": {
      "yelp": {
        "rating": 4,
        "count": 651,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.3,
        "count": 1500,
        "date": "2026-06-16"
      }
    },
    "Tom's Watch Bar (Navy Yard)": {
      "yelp": {
        "rating": 3.9,
        "count": 193,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4,
        "count": 600,
        "date": "2026-06-16"
      }
    },
    "Mission Navy Yard (Navy Yard)": {
      "yelp": {
        "rating": 4.3,
        "count": 819,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.2,
        "count": 2000,
        "date": "2026-06-16"
      }
    },
    "Penn Social (Penn Quarter)": {
      "yelp": {
        "rating": 3.5,
        "count": 508,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4,
        "count": 2500,
        "date": "2026-06-16"
      }
    },
    "Sports & Social DC (U Street)": {
      "yelp": {
        "rating": 3.5,
        "count": 99,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4,
        "count": 300,
        "date": "2026-06-16"
      }
    },
    "Nellie's Sports Bar (U Street)": {
      "yelp": {
        "rating": 3.8,
        "count": 610,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.2,
        "count": 2000,
        "date": "2026-06-16"
      }
    },
    "Ivy and Coney (Shaw)": {
      "yelp": {
        "rating": 3.9,
        "count": 193,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.3,
        "count": 700,
        "date": "2026-06-16"
      }
    },
    "Exiles Bar (U Street)": {
      "yelp": {
        "rating": 4.2,
        "count": 131,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 300,
        "date": "2026-06-16"
      }
    },
    "Public Bar Live (Dupont Circle)": {
      "yelp": {
        "rating": 3.5,
        "count": 53,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 3.8,
        "count": 700,
        "date": "2026-06-16"
      }
    },
    "Franklin Hall (U Street)": {
      "yelp": {
        "rating": 4,
        "count": 246,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.2,
        "count": 1000,
        "date": "2026-06-16"
      }
    },
    "The Blaguard (Adams Morgan)": {
      "yelp": {
        "rating": 4,
        "count": 142,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.3,
        "count": 400,
        "date": "2026-06-16"
      }
    },
    "TallBoy (Shaw)": {
      "yelp": {
        "rating": 3.9,
        "count": 105,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.2,
        "count": 300,
        "date": "2026-06-16"
      }
    },
    "The Brig Beergarden (Capitol Hill)": {
      "yelp": {
        "rating": 3.9,
        "count": 179,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.4,
        "count": 1500,
        "date": "2026-06-16"
      }
    },
    "Union Pub (Capitol Hill)": {
      "yelp": {
        "rating": 4.2,
        "count": 818,
        "date": "2026-06-16"
      },
      "google": {
        "rating": 4.2,
        "count": 1500,
        "date": "2026-06-16"
      }
    }
  },
  "mattress-brands": {
    "Casper": { "amazon": { "rating": 4.4, "count": 5900, "date": "2026-06-16" } },
    "Tuft & Needle": { "amazon": { "rating": 4.4, "count": 4500, "date": "2026-06-16" } },
    "Sealy": { "amazon": { "rating": 4.4, "count": 864, "date": "2026-06-16" } },
    "Layla": { "amazon": { "rating": 4.5, "count": 266, "date": "2026-06-16" } },
    "DreamCloud": { "amazon": { "rating": 4.3, "count": 295, "date": "2026-06-16" } },
    "Beautyrest": { "amazon": { "rating": 4.3, "count": 277, "date": "2026-06-16" } },
    "Serta": { "amazon": { "rating": 4, "count": 82, "date": "2026-06-16" } },
    "Bear": { "amazon": { "rating": 4.7, "count": 69, "date": "2026-06-16" } },
    "Purple": { "amazon": { "rating": 3.7, "count": 44, "date": "2026-06-16" } },
    "Saatva": { "amazon": { "rating": 4.1, "count": 247, "date": "2026-06-16" } },
  },
  "best-prebiotic-soda": {
    "Olipop": { "amazon": { "rating": 4.8, "count": 128, "date": "2026-06-16" } },
    "Poppi": { "amazon": { "rating": 4.5, "count": 1500, "date": "2026-06-16" } },
    "Pepsi Prebiotic": { "amazon": { "rating": 4.6, "count": 3700, "date": "2026-06-16" } },
    "Evolution Fresh": { "amazon": { "rating": 4.8, "count": 461, "date": "2026-06-16" } },
    "Popwell": { "amazon": { "rating": 4.6, "count": 170, "date": "2026-06-16" } },
    "Bloom Pop": { "amazon": { "rating": 4.6, "count": 164, "date": "2026-06-16" } },
    "Wildwonder": { "amazon": { "rating": 4.5, "count": 133, "date": "2026-06-16" } },
    "Simply Pop": { "amazon": { "rating": 4.1, "count": 99, "date": "2026-06-16" } },
    "Health-Ade SunSip": { "amazon": { "rating": 4.1, "count": 6, "date": "2026-06-16" } },
  },
  "best-energy-drink": {
    "Celsius": { "amazon": { "rating": 4.7, "count": 10400, "date": "2026-06-16" } },
    "Red Bull": { "amazon": { "rating": 4.7, "count": 44600, "date": "2026-06-16" } },
    "Monster": { "amazon": { "rating": 4.7, "count": 35100, "date": "2026-06-16" } },
    "C4": { "amazon": { "rating": 4.6, "count": 6700, "date": "2026-06-16" } },
    "Ghost": { "amazon": { "rating": 4.6, "count": 13800, "date": "2026-06-16" } },
    "Guayaki Yerba Mate": { "amazon": { "rating": 4.6, "count": 1700, "date": "2026-06-16" } },
    "Rockstar": { "amazon": { "rating": 4.5, "count": 5000, "date": "2026-06-16" } },
    "Alani Nu": { "amazon": { "rating": 4.6, "count": 3800, "date": "2026-06-16" } },
    "Bang": { "amazon": { "rating": 4.6, "count": 4700, "date": "2026-06-16" } },
    "Zevia": { "amazon": { "rating": 4.1, "count": 290, "date": "2026-06-16" } },
    "NOS": { "amazon": { "rating": 4.6, "count": 1200, "date": "2026-06-16" } },
    "Reign": { "amazon": { "rating": 4.7, "count": 14800, "date": "2026-06-16" } },
    "Prime": { "amazon": { "rating": 4.5, "count": 357, "date": "2026-06-16" } },
  },
  "best-coconut-water": {
    "Harmless Harvest": { "amazon": { "rating": 4.5, "count": 2400, "date": "2026-06-16" } },
    "Taste Nirvana": { "amazon": { "rating": 4.4, "count": 1700, "date": "2026-06-16" } },
    "Vita Coco": { "amazon": { "rating": 4.5, "count": 9300, "date": "2026-06-16" } },
    "Real Coco": { "amazon": { "rating": 4.6, "count": 6100, "date": "2026-06-16" } },
    "C2O": { "amazon": { "rating": 4.7, "count": 62, "date": "2026-06-16" } },
    "Coco Joy": { "amazon": { "rating": 4.6, "count": 1000, "date": "2026-06-16" } },
    "Once Upon a Coconut": { "amazon": { "rating": 4.6, "count": 8100, "date": "2026-06-16" } },
    "Goya": { "amazon": { "rating": 4.6, "count": 133, "date": "2026-06-16" } },
    "Copra": { "amazon": { "rating": 4.6, "count": 6100, "date": "2026-06-16" } },
    "Grace": { "amazon": { "rating": 4, "count": 42, "date": "2026-06-16" } },
    "Amy & Brian": { "amazon": { "rating": 4.4, "count": 1000, "date": "2026-06-16" } },
    "Zico": { "amazon": { "rating": 4.5, "count": 9600, "date": "2026-06-16" } },
  },
  "best-stroller": {
    "UPPAbaby Cruz": { "amazon": { "rating": 4.6, "count": 153, "date": "2026-06-16" } },
    "UPPAbaby Vista": { "amazon": { "rating": 4.7, "count": 502, "date": "2026-06-16" } },
    "Mockingbird": { "amazon": { "rating": 4.5, "count": 90, "date": "2026-06-16" } },
    "Thule Shine": { "amazon": { "rating": 4.1, "count": 38, "date": "2026-06-16" } },
    "Bugaboo Fox": { "amazon": { "rating": 4.9, "count": 18, "date": "2026-06-16" } },
    "Baby Trend Expedition": { "amazon": { "rating": 4.7, "count": 5500, "date": "2026-06-16" } },
    "Graco Modes Pramette": { "amazon": { "rating": 4.6, "count": 6900, "date": "2026-06-16" } },
  },
  "best-car-seat": {
    "Graco Extend2Fit": { "amazon": { "rating": 4.8, "count": 2200, "date": "2026-06-16" } },
    "Graco 4Ever": { "amazon": { "rating": 4.8, "count": 2100, "date": "2026-06-16" } },
    "Graco SlimFit": { "amazon": { "rating": 4.8, "count": 1500, "date": "2026-06-16" } },
    "Chicco Fit360": { "amazon": { "rating": 4.8, "count": 557, "date": "2026-06-16" } },
    "Cybex Callisto G": { "amazon": { "rating": 4.7, "count": 62, "date": "2026-06-16" } },
    "Chicco OneFit MAX": { "amazon": { "rating": 4.7, "count": 31, "date": "2026-06-16" } },
    "Graco Turn2Me": { "amazon": { "rating": 4.7, "count": 1200, "date": "2026-06-16" } },
    "Diono Radian 3QX": { "amazon": { "rating": 4.7, "count": 8100, "date": "2026-06-16" } },
    "Diono Radian 3RXT": { "amazon": { "rating": 4.7, "count": 8100, "date": "2026-06-16" } },
    "Baby Jogger City Turn": { "amazon": { "rating": 4.7, "count": 300, "date": "2026-06-16" } },
    "Britax One4Life": { "amazon": { "rating": 4.4, "count": 60, "date": "2026-06-16" } },
  },
  "best-travel-car-seat": {
    "Doona": { "amazon": { "rating": 4.8, "count": 15300, "date": "2026-06-16" } },
    "Chicco GoFit": { "amazon": { "rating": 4.8, "count": 8200, "date": "2026-06-16" } },
    "Cosco Topside": { "amazon": { "rating": 4.7, "count": 14800, "date": "2026-06-16" } },
    "Graco Tranzitions": { "amazon": { "rating": 4.7, "count": 1700, "date": "2026-06-16" } },
    "Evenflo Maestro": { "amazon": { "rating": 4.5, "count": 2900, "date": "2026-06-16" } },
    "Evenflo Sonus 65": { "amazon": { "rating": 4.5, "count": 6500, "date": "2026-06-16" } },
    "Cosco Scenera": { "amazon": { "rating": 4.5, "count": 1000, "date": "2026-06-16" } },
    "Cosco Finale": { "amazon": { "rating": 4.5, "count": 75, "date": "2026-06-16" } },
    "WAYB Pico": { "amazon": { "rating": 4.4, "count": 762, "date": "2026-06-16" } },
    "Maxi-Cosi Romi": { "amazon": { "rating": 4.4, "count": 54, "date": "2026-06-16" } },
    "BubbleBum": { "amazon": { "rating": 4.3, "count": 6700, "date": "2026-06-16" } },
  },
  "best-coolers": {
    "Yeti Roadie": { "amazon": { "rating": 4.8, "count": 8000, "date": "2026-06-16" } },
    "Yeti Tundra": { "amazon": { "rating": 4.8, "count": 4700, "date": "2026-06-16" } },
    "RTIC Ultra-Light": { "amazon": { "rating": 4.7, "count": 1900, "date": "2026-06-16" } },
    "Xspec 60": { "amazon": { "rating": 4.7, "count": 389, "date": "2026-06-16" } },
    "Igloo ECOCOOL": { "amazon": { "rating": 4.6, "count": 443, "date": "2026-06-16" } },
    "Canyon Outfitter": { "amazon": { "rating": 4.6, "count": 16, "date": "2026-06-16" } },
    "Coleman Steel Belted": { "amazon": { "rating": 4.5, "count": 4400, "date": "2026-06-16" } },
    "Igloo Marine": { "amazon": { "rating": 4.4, "count": 2800, "date": "2026-06-16" } },
    "RovR RollR": { "amazon": { "rating": 4.4, "count": 42, "date": "2026-06-16" } },
  },
  "best-cordless-vacuum": {
    "Dyson V11": { "amazon": { "rating": 4.4, "count": 3600, "date": "2026-06-16" } },
    "Shark Stratos": { "amazon": { "rating": 4.4, "count": 113, "date": "2026-06-16" } },
    "Dyson V15 Detect": { "amazon": { "rating": 4.3, "count": 1900, "date": "2026-06-16" } },
    "Bissell PowerClean": { "amazon": { "rating": 4.2, "count": 1682, "date": "2026-06-16" } },
    "Dyson Gen5 Detect": { "amazon": { "rating": 4.2, "count": 905, "date": "2026-06-16" } },
    "Shark PowerDetect": { "amazon": { "rating": 4.1, "count": 147, "date": "2026-06-16" } },
  },
  "best-greek-restaurants-nyc": {
    "Estiatorio Milos": {
      "yelp": {
        "rating": 4,
        "count": 1189,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 2100,
        "date": "2026-06-15"
      }
    },
    "Avra Madison": {
      "yelp": {
        "rating": 4,
        "count": 570,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.6,
        "count": 3000,
        "date": "2026-06-15"
      }
    },
    "Kyma Flatiron": {
      "yelp": {
        "rating": 3.9,
        "count": 470,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.4,
        "count": 1500,
        "date": "2026-06-15"
      }
    },
    "Pylos": {
      "yelp": {
        "rating": 4.2,
        "count": 1296,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 1400,
        "date": "2026-06-15"
      }
    },
    "Loi Estiatorio": {
      "yelp": {
        "rating": 4.6,
        "count": 552,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.6,
        "count": 800,
        "date": "2026-06-15"
      }
    },
    "Molyvos": {
      "yelp": {
        "rating": 4,
        "count": 147,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.4,
        "count": 600,
        "date": "2026-06-15"
      }
    },
    "Elea": {
      "yelp": {
        "rating": 4.5,
        "count": 406,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.6,
        "count": 900,
        "date": "2026-06-15"
      }
    },
    "Taverna Kyclades": {
      "yelp": {
        "rating": 4.4,
        "count": 2972,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.6,
        "count": 5000,
        "date": "2026-06-15"
      }
    },
    "Telly's Taverna": {
      "yelp": {
        "rating": 4.3,
        "count": 510,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 1500,
        "date": "2026-06-15"
      }
    },
    "Agnanti": {
      "yelp": {
        "rating": 4.3,
        "count": 612,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 1400,
        "date": "2026-06-15"
      }
    },
    "Astoria Seafood": {
      "yelp": {
        "rating": 4.3,
        "count": 1078,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 2500,
        "date": "2026-06-15"
      }
    },
    "Gregory's 26 Corner Taverna": {
      "yelp": {
        "rating": 4.4,
        "count": 270,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 800,
        "date": "2026-06-15"
      }
    },
    "Loukoumi Taverna": {
      "yelp": {
        "rating": 4.3,
        "count": 616,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 900,
        "date": "2026-06-15"
      }
    },
    "Yefsi Estiatorio": {
      "yelp": {
        "rating": 4.2,
        "count": 404,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.4,
        "count": 700,
        "date": "2026-06-15"
      }
    },
    "Mythos Authentic Greek Cuisine": {
      "yelp": {
        "rating": 4.2,
        "count": 172,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 600,
        "date": "2026-06-15"
      }
    },
    "Nisi Estiatorio": {
      "yelp": {
        "rating": 4,
        "count": 99,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 400,
        "date": "2026-06-15"
      }
    }
  },
  "best-french-restaurants-nyc": {
    "Le Bernardin": {
      "yelp": {
        "rating": 4,
        "count": 3230,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.6,
        "count": 4800,
        "date": "2026-06-15"
      }
    },
    "Daniel": {
      "yelp": {
        "rating": 4.4,
        "count": 2000,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.6,
        "count": 3200,
        "date": "2026-06-15"
      }
    },
    "Jean-Georges": {
      "yelp": {
        "rating": 4.3,
        "count": 2072,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 3000,
        "date": "2026-06-15"
      }
    },
    "Per Se": {
      "yelp": {
        "rating": 4.1,
        "count": 2023,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 1900,
        "date": "2026-06-15"
      }
    },
    "Gabriel Kreuther": {
      "yelp": {
        "rating": 4.4,
        "count": 685,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.6,
        "count": 900,
        "date": "2026-06-15"
      }
    },
    "Le Coucou": {
      "yelp": {
        "rating": 4,
        "count": 868,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 1400,
        "date": "2026-06-15"
      }
    },
    "Frenchette": {
      "yelp": {
        "rating": 4,
        "count": 449,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.4,
        "count": 900,
        "date": "2026-06-15"
      }
    },
    "Balthazar": {
      "yelp": {
        "rating": 4,
        "count": 3965,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 6000,
        "date": "2026-06-15"
      }
    },
    "Raoul's": {
      "yelp": {
        "rating": 4.3,
        "count": 792,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.4,
        "count": 1300,
        "date": "2026-06-15"
      }
    },
    "Minetta Tavern": {
      "yelp": {
        "rating": 4.2,
        "count": 2672,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 3400,
        "date": "2026-06-15"
      }
    },
    "Le Crocodile": {
      "yelp": {
        "rating": 4.2,
        "count": 390,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 800,
        "date": "2026-06-15"
      }
    },
    "Buvette": {
      "yelp": {
        "rating": 4.3,
        "count": 2420,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.6,
        "count": 2800,
        "date": "2026-06-15"
      }
    },
    "Le Veau d'Or": {
      "yelp": {
        "rating": 4.2,
        "count": 150,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 250,
        "date": "2026-06-15"
      }
    },
    "Cafe Boulud": {
      "yelp": {
        "rating": 4.2,
        "count": 60,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.4,
        "count": 300,
        "date": "2026-06-15"
      }
    },
    "Pastis": {
      "yelp": {
        "rating": 4,
        "count": 759,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.4,
        "count": 2500,
        "date": "2026-06-15"
      }
    },
    "La Mercerie": {
      "yelp": {
        "rating": 4.3,
        "count": 482,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 900,
        "date": "2026-06-15"
      }
    }
  },
  "best-greek-restaurants-boston": {
    "Krasi": {
      "yelp": {
        "rating": 4.6,
        "count": 581,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.6,
        "count": 1300,
        "date": "2026-06-15"
      }
    },
    "Bar Vlaha": {
      "yelp": {
        "rating": 4.5,
        "count": 172,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.7,
        "count": 265,
        "date": "2026-06-15"
      }
    },
    "Kaia": {
      "yelp": {
        "rating": 4.3,
        "count": 78,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.6,
        "count": 200,
        "date": "2026-06-15"
      }
    },
    "Committee": {
      "yelp": {
        "rating": 4.3,
        "count": 978,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.4,
        "count": 2400,
        "date": "2026-06-15"
      }
    },
    "Kava Neo-Taverna": {
      "yelp": {
        "rating": 4.5,
        "count": 564,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.6,
        "count": 900,
        "date": "2026-06-15"
      }
    },
    "GreCo": {
      "yelp": {
        "rating": 4.2,
        "count": 675,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 1500,
        "date": "2026-06-15"
      }
    },
    "Saloniki Greek": {
      "yelp": {
        "rating": 4.2,
        "count": 557,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.4,
        "count": 1000,
        "date": "2026-06-15"
      }
    },
    "Greek Corner": {
      "yelp": {
        "rating": 4,
        "count": 753,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.4,
        "count": 1200,
        "date": "2026-06-15"
      }
    },
    "Esperia Grill": {
      "yelp": {
        "rating": 4.5,
        "count": 545,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 700,
        "date": "2026-06-15"
      }
    },
    "Opa Greek Yeeros": {
      "yelp": {
        "rating": 4.6,
        "count": 249,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.8,
        "count": 680,
        "date": "2026-06-15"
      }
    },
    "Desfina": {
      "yelp": {
        "rating": 3.9,
        "count": 311,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.3,
        "count": 600,
        "date": "2026-06-15"
      }
    },
    "Effie's Kitchen": {
      "yelp": {
        "rating": 4.5,
        "count": 102,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.6,
        "count": 300,
        "date": "2026-06-15"
      }
    },
    "Zo Greek": {
      "yelp": {
        "rating": 4,
        "count": 296,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 1300,
        "date": "2026-06-15"
      }
    },
    "Porto": {
      "yelp": {
        "rating": 4.2,
        "count": 500,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.4,
        "count": 900,
        "date": "2026-06-15"
      }
    }
  },
  "best-ramen-boston": {
    "Tsurumen": {
      "yelp": {
        "rating": 4.7,
        "count": 249,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.7,
        "count": 620,
        "date": "2026-06-15"
      }
    },
    "Ganko Ittetsu Ramen": {
      "yelp": {
        "rating": 4.6,
        "count": 1288,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.6,
        "count": 1400,
        "date": "2026-06-15"
      }
    },
    "Santouka Back Bay": {
      "yelp": {
        "rating": 4.2,
        "count": 845,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.3,
        "count": 1100,
        "date": "2026-06-15"
      }
    },
    "Yume Wo Katare": {
      "yelp": {
        "rating": 4,
        "count": 1069,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.4,
        "count": 1300,
        "date": "2026-06-15"
      }
    },
    "Hojoko": {
      "yelp": {
        "rating": 4.1,
        "count": 562,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.4,
        "count": 900,
        "date": "2026-06-15"
      }
    },
    "Pagu": {
      "yelp": {
        "rating": 4.3,
        "count": 591,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 900,
        "date": "2026-06-15"
      }
    },
    "Bosso Ramen Tavern": {
      "yelp": {
        "rating": 4.3,
        "count": 180,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.4,
        "count": 300,
        "date": "2026-06-15"
      }
    },
    "Tora Ramen": {
      "yelp": {
        "rating": 4.5,
        "count": 301,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 400,
        "date": "2026-06-15"
      }
    },
    "Isshindo Ramen": {
      "yelp": {
        "rating": 4.5,
        "count": 252,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 400,
        "date": "2026-06-15"
      }
    },
    "RedWhite Boneless Ramen": {
      "yelp": {
        "rating": 4.4,
        "count": 570,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.5,
        "count": 700,
        "date": "2026-06-15"
      }
    },
    "Mecha Noodle Bar": {
      "yelp": {
        "rating": 4,
        "count": 252,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.2,
        "count": 500,
        "date": "2026-06-15"
      }
    },
    "Waku Waku Ramen": {
      "yelp": {
        "rating": 4.3,
        "count": 234,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.3,
        "count": 500,
        "date": "2026-06-15"
      }
    },
    "Ruckus": {
      "yelp": {
        "rating": 4.2,
        "count": 238,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.3,
        "count": 350,
        "date": "2026-06-15"
      }
    },
    "Totto Ramen": {
      "yelp": {
        "rating": 4.1,
        "count": 200,
        "date": "2026-06-15"
      },
      "google": {
        "rating": 4.2,
        "count": 400,
        "date": "2026-06-15"
      }
    }
  },
  "best-coffee-shops-manhattan": {
    "La Cabra (East Village)": {
      "yelp": {
        "rating": 4.5,
        "count": 495,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1950,
        "date": "2026-06-13"
      }
    },
    "Devocion (Flatiron)": {
      "yelp": {
        "rating": 4.5,
        "count": 266,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1000,
        "date": "2026-06-13"
      }
    },
    "Abraco (East Village)": {
      "yelp": {
        "rating": 4.5,
        "count": 991,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "Culture Espresso (Garment District)": {
      "yelp": {
        "rating": 4.6,
        "count": 1435,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 3600,
        "date": "2026-06-13"
      }
    },
    "Felix Roasting Co (Flatiron)": {
      "yelp": {
        "rating": 4.2,
        "count": 382,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "Coffee Project NY (East Village)": {
      "yelp": {
        "rating": 4.5,
        "count": 823,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 1630,
        "date": "2026-06-13"
      }
    },
    "Ralph's Coffee (UES)": {
      "yelp": {
        "rating": 4.5,
        "count": 317,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 900,
        "date": "2026-06-13"
      }
    },
    "Joe Coffee (West Village)": {
      "yelp": {
        "rating": 4.3,
        "count": 385,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 800,
        "date": "2026-06-13"
      }
    },
    "Stumptown Coffee (Greenwich Village)": {
      "yelp": {
        "rating": 4.2,
        "count": 200,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "Birch Coffee (Greenwich Village)": {
      "yelp": {
        "rating": 4.4,
        "count": 196,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 500,
        "date": "2026-06-13"
      }
    },
    "Partners Coffee (West Village)": {
      "yelp": {
        "rating": 4.4,
        "count": 171,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "Hi-Collar (East Village)": {
      "yelp": {
        "rating": 4.4,
        "count": 400,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 1300,
        "date": "2026-06-13"
      }
    },
    "Gasoline Alley Coffee (NoHo)": {
      "yelp": {
        "rating": 4.4,
        "count": 301,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 850,
        "date": "2026-06-13"
      }
    },
    "Maman (SoHo)": {
      "yelp": {
        "rating": 4.3,
        "count": 897,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 1800,
        "date": "2026-06-13"
      }
    }
  },
  "best-coffee-shops-brooklyn": {
    "Sey Coffee (Bushwick)": {
      "yelp": {
        "rating": 4.5,
        "count": 279,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 1500,
        "date": "2026-06-13"
      }
    },
    "Devocion (Williamsburg)": {
      "yelp": {
        "rating": 4.3,
        "count": 666,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 2700,
        "date": "2026-06-13"
      }
    },
    "Partners Coffee (Williamsburg)": {
      "yelp": {
        "rating": 4.2,
        "count": 572,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1400,
        "date": "2026-06-13"
      }
    },
    "Variety Coffee Roasters (Bushwick)": {
      "yelp": {
        "rating": 4.3,
        "count": 161,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "La Cabra (Bushwick)": {
      "yelp": {
        "rating": 4.4,
        "count": 42,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 400,
        "date": "2026-06-13"
      }
    },
    "Qahwah House (Williamsburg)": {
      "yelp": {
        "rating": 4.5,
        "count": 537,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1200,
        "date": "2026-06-13"
      }
    },
    "Villager (Crown Heights)": {
      "yelp": {
        "rating": 4.7,
        "count": 48,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 480,
        "date": "2026-06-13"
      }
    },
    "Sweetleaf (Greenpoint)": {
      "yelp": {
        "rating": 4.3,
        "count": 150,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 500,
        "date": "2026-06-13"
      }
    },
    "Cafe Grumpy (Greenpoint)": {
      "yelp": {
        "rating": 4.4,
        "count": 297,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "Konditori (Park Slope)": {
      "yelp": {
        "rating": 4,
        "count": 190,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 500,
        "date": "2026-06-13"
      }
    },
    "Kos Kaffe (Park Slope)": {
      "yelp": {
        "rating": 4.2,
        "count": 242,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 460,
        "date": "2026-06-13"
      }
    },
    "Cafe Regular du Nord (Park Slope)": {
      "yelp": {
        "rating": 4.4,
        "count": 175,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 300,
        "date": "2026-06-13"
      }
    },
    "Butler (Williamsburg)": {
      "yelp": {
        "rating": 4.2,
        "count": 177,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "Hungry Ghost (Fort Greene)": {
      "yelp": {
        "rating": 4,
        "count": 201,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 500,
        "date": "2026-06-13"
      }
    },
    "Brooklyn Roasting Company (Navy Yard)": {
      "yelp": {
        "rating": 4,
        "count": 100,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 744,
        "date": "2026-06-13"
      }
    },
    "Parlor Coffee (Navy Yard)": {
      "yelp": {
        "rating": 4.5,
        "count": 19,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 120,
        "date": "2026-06-13"
      }
    }
  },
  "best-coffee-shops-miami": {
    "Panther Coffee (Wynwood)": {
      "yelp": {
        "rating": 4.4,
        "count": 1155,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 3400,
        "date": "2026-06-13"
      }
    },
    "Suite Habana Cafe (Little Havana)": {
      "yelp": {
        "rating": 4.8,
        "count": 261,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.8,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "Vice City Bean (Arts District)": {
      "yelp": {
        "rating": 4.3,
        "count": 284,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 900,
        "date": "2026-06-13"
      }
    },
    "Imperial Moto Cafe (Little River)": {
      "yelp": {
        "rating": 4.6,
        "count": 111,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "Tinta y Cafe (Coral Gables)": {
      "yelp": {
        "rating": 4.3,
        "count": 1091,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1200,
        "date": "2026-06-13"
      }
    },
    "Per'La Specialty Roasters (Coral Gables)": {
      "yelp": {
        "rating": 4.5,
        "count": 13,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 200,
        "date": "2026-06-13"
      }
    },
    "Las Olas Cafe (Miami Beach)": {
      "yelp": {
        "rating": 4.3,
        "count": 1271,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 4000,
        "date": "2026-06-13"
      }
    },
    "Versailles (Little Havana)": {
      "yelp": {
        "rating": 4,
        "count": 419,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 9000,
        "date": "2026-06-13"
      }
    },
    "Macondo Coffee Roasters (Doral)": {
      "yelp": {
        "rating": 4.5,
        "count": 1039,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1500,
        "date": "2026-06-13"
      }
    },
    "Madruga Bakery (Coral Gables)": {
      "yelp": {
        "rating": 4.4,
        "count": 241,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 800,
        "date": "2026-06-13"
      }
    },
    "Cafe Demetrio (Coral Gables)": {
      "yelp": {
        "rating": 4.3,
        "count": 480,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 1400,
        "date": "2026-06-13"
      }
    },
    "Zak the Baker (Wynwood)": {
      "yelp": {
        "rating": 4.4,
        "count": 1215,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 2500,
        "date": "2026-06-13"
      }
    },
    "Pasion del Cielo (Brickell)": {
      "yelp": {
        "rating": 4.2,
        "count": 109,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 700,
        "date": "2026-06-13"
      }
    }
  },
  "best-restaurants-vancouver": {
    "Published on Main (Mount Pleasant)": {
      "yelp": {
        "rating": 4.3,
        "count": 198,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 1400,
        "date": "2026-06-13"
      }
    },
    "AnnaLena (Kitsilano)": {
      "yelp": {
        "rating": 4.7,
        "count": 403,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 1100,
        "date": "2026-06-13"
      }
    },
    "St. Lawrence (Railtown)": {
      "yelp": {
        "rating": 4.6,
        "count": 193,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 1200,
        "date": "2026-06-13"
      }
    },
    "Kissa Tanto (Chinatown)": {
      "yelp": {
        "rating": 4.4,
        "count": 344,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1000,
        "date": "2026-06-13"
      }
    },
    "Burdock & Co (Mount Pleasant)": {
      "yelp": {
        "rating": 4,
        "count": 215,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "Elisa (Yaletown)": {
      "yelp": {
        "rating": 4.3,
        "count": 285,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 900,
        "date": "2026-06-13"
      }
    },
    "Hawksworth (Downtown)": {
      "yelp": {
        "rating": 4.2,
        "count": 722,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 2000,
        "date": "2026-06-13"
      }
    },
    "Botanist (Coal Harbour)": {
      "yelp": {
        "rating": 4.3,
        "count": 467,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 2300,
        "date": "2026-06-13"
      }
    },
    "Osteria Savio Volpe (Mount Pleasant)": {
      "yelp": {
        "rating": 4.3,
        "count": 499,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 3300,
        "date": "2026-06-13"
      }
    },
    "Maenam (Kitsilano)": {
      "yelp": {
        "rating": 4.2,
        "count": 429,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1300,
        "date": "2026-06-13"
      }
    },
    "Bao Bei (Chinatown)": {
      "yelp": {
        "rating": 4.2,
        "count": 475,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1300,
        "date": "2026-06-13"
      }
    },
    "Phnom Penh (Chinatown)": {
      "yelp": {
        "rating": 3.8,
        "count": 1931,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 3500,
        "date": "2026-06-13"
      }
    },
    "Tojo's (Fairview)": {
      "yelp": {
        "rating": 3.9,
        "count": 421,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "Boulevard Kitchen & Oyster Bar (Downtown)": {
      "yelp": {
        "rating": 4.2,
        "count": 329,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 2800,
        "date": "2026-06-13"
      }
    }
  },
  "best-restaurants-whistler": {
    "Araxi (Whistler Village)": {
      "yelp": {
        "rating": 4.4,
        "count": 912,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 3200,
        "date": "2026-06-13"
      }
    },
    "Wild Blue Restaurant + Bar (Whistler Village)": {
      "yelp": {
        "rating": 4.3,
        "count": 137,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 900,
        "date": "2026-06-13"
      }
    },
    "Il Caminetto (Whistler Village)": {
      "yelp": {
        "rating": 4.4,
        "count": 239,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 800,
        "date": "2026-06-13"
      }
    },
    "Rimrock Cafe (Creekside)": {
      "yelp": {
        "rating": 4.5,
        "count": 521,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1400,
        "date": "2026-06-13"
      }
    },
    "Bearfoot Bistro (Whistler Village)": {
      "yelp": {
        "rating": 4.2,
        "count": 265,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1200,
        "date": "2026-06-13"
      }
    },
    "SIDECUT Steakhouse (Four Seasons, Upper Village)": {
      "yelp": {
        "rating": 4.3,
        "count": 109,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "Alta Bistro (Whistler Village)": {
      "yelp": {
        "rating": 4.5,
        "count": 325,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "Red Door Bistro (Creekside)": {
      "yelp": {
        "rating": 4.6,
        "count": 142,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 400,
        "date": "2026-06-13"
      }
    },
    "Quattro at Whistler (Whistler Village)": {
      "yelp": {
        "rating": 4.2,
        "count": 144,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 500,
        "date": "2026-06-13"
      }
    },
    "Bar Oso (Whistler Village)": {
      "yelp": {
        "rating": 4.4,
        "count": 252,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 500,
        "date": "2026-06-13"
      }
    },
    "Hy's Steakhouse (Whistler Village)": {
      "yelp": {
        "rating": 4,
        "count": 191,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "Lorette Brasserie (Whistler Village)": {
      "yelp": {
        "rating": 4.4,
        "count": 19,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 120,
        "date": "2026-06-13"
      }
    }
  },
  "best-restaurants-park-city": {
    "Riverhorse on Main (Old Town)": {
      "yelp": {
        "rating": 4.5,
        "count": 977,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1900,
        "date": "2026-06-13"
      }
    },
    "Handle (Old Town)": {
      "yelp": {
        "rating": 4.5,
        "count": 847,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1100,
        "date": "2026-06-13"
      }
    },
    "Tupelo (Old Town)": {
      "yelp": {
        "rating": 4.4,
        "count": 443,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 900,
        "date": "2026-06-13"
      }
    },
    "Yuki Yama Sushi (Old Town)": {
      "yelp": {
        "rating": 4.5,
        "count": 1034,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1300,
        "date": "2026-06-13"
      }
    },
    "Le Depot Brasserie (Old Town)": {
      "yelp": {
        "rating": 4.1,
        "count": 98,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 200,
        "date": "2026-06-13"
      }
    },
    "Courchevel Bistro (Old Town)": {
      "yelp": {
        "rating": 4.5,
        "count": 134,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 300,
        "date": "2026-06-13"
      }
    },
    "Firewood (Old Town)": {
      "yelp": {
        "rating": 4.4,
        "count": 362,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "Edge Steakhouse (Canyons)": {
      "yelp": {
        "rating": 4.3,
        "count": 261,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 500,
        "date": "2026-06-13"
      }
    },
    "Glitretind (Deer Valley)": {
      "yelp": {
        "rating": 4.4,
        "count": 253,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "Apex (Deer Valley)": {
      "yelp": {
        "rating": 4.2,
        "count": 131,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 400,
        "date": "2026-06-13"
      }
    },
    "Powder (Canyons)": {
      "yelp": {
        "rating": 4.3,
        "count": 188,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 500,
        "date": "2026-06-13"
      }
    },
    "Hearth and Hill (Kimball Junction)": {
      "yelp": {
        "rating": 4.5,
        "count": 476,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1300,
        "date": "2026-06-13"
      }
    },
    "Shabu (Old Town)": {
      "yelp": {
        "rating": 4.3,
        "count": 428,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "350 Main Brasserie (Old Town)": {
      "yelp": {
        "rating": 4,
        "count": 272,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.2,
        "count": 800,
        "date": "2026-06-13"
      }
    }
  },
  "best-restaurants-montreal": {
    "Joe Beef (Little Burgundy)": {
      "yelp": {
        "rating": 4.3,
        "count": 877,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 2400,
        "date": "2026-06-13"
      }
    },
    "Vin Mon Lapin (Little Italy)": {
      "yelp": {
        "rating": 4.5,
        "count": 77,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "Toque (Quartier International)": {
      "yelp": {
        "rating": 4,
        "count": 318,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1600,
        "date": "2026-06-13"
      }
    },
    "Au Pied de Cochon (Plateau)": {
      "yelp": {
        "rating": 4,
        "count": 1500,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 3500,
        "date": "2026-06-13"
      }
    },
    "Le Vin Papillon (Little Burgundy)": {
      "yelp": {
        "rating": 4.3,
        "count": 167,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 900,
        "date": "2026-06-13"
      }
    },
    "Liverpool House (Little Burgundy)": {
      "yelp": {
        "rating": 4.4,
        "count": 354,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1100,
        "date": "2026-06-13"
      }
    },
    "Damas (Outremont)": {
      "yelp": {
        "rating": 4.4,
        "count": 503,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1700,
        "date": "2026-06-13"
      }
    },
    "Nora Gray (Griffintown)": {
      "yelp": {
        "rating": 4,
        "count": 127,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "L'Express (Plateau)": {
      "yelp": {
        "rating": 4,
        "count": 746,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 2200,
        "date": "2026-06-13"
      }
    },
    "Schwartz's Deli (Plateau)": {
      "yelp": {
        "rating": 4.4,
        "count": 3505,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 14000,
        "date": "2026-06-13"
      }
    },
    "Beba (Verdun)": {
      "yelp": {
        "rating": 4.5,
        "count": 37,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 500,
        "date": "2026-06-13"
      }
    },
    "Le Mousso (Centre-Sud)": {
      "yelp": {
        "rating": 4,
        "count": 61,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "Elena (Saint-Henri)": {
      "yelp": {
        "rating": 4,
        "count": 77,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 900,
        "date": "2026-06-13"
      }
    },
    "Bouillon Bilk (Quartier des Spectacles)": {
      "yelp": {
        "rating": 4,
        "count": 534,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1100,
        "date": "2026-06-13"
      }
    },
    "Park (Westmount)": {
      "yelp": {
        "rating": 4,
        "count": 250,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1000,
        "date": "2026-06-13"
      }
    }
  },
  "best-coffee-shops-boston": {
    "George Howell Coffee (Downtown)": {
      "yelp": {
        "rating": 4.4,
        "count": 368,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 800,
        "date": "2026-06-13"
      }
    },
    "Gracenote Coffee (Leather District)": {
      "yelp": {
        "rating": 4.6,
        "count": 258,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "Ogawa Coffee (Downtown)": {
      "yelp": {
        "rating": 4.4,
        "count": 906,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1600,
        "date": "2026-06-13"
      }
    },
    "Thinking Cup (Downtown)": {
      "yelp": {
        "rating": 4.3,
        "count": 1374,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 2500,
        "date": "2026-06-13"
      }
    },
    "Broadsheet Coffee Roasters (Cambridge)": {
      "yelp": {
        "rating": 4.5,
        "count": 151,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 500,
        "date": "2026-06-13"
      }
    },
    "Pavement Coffeehouse (Back Bay)": {
      "yelp": {
        "rating": 4.2,
        "count": 282,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "Tatte Bakery & Cafe (Beacon Hill)": {
      "yelp": {
        "rating": 4.2,
        "count": 749,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1500,
        "date": "2026-06-13"
      }
    },
    "Caffe Vittoria (North End)": {
      "yelp": {
        "rating": 3.9,
        "count": 1378,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 2000,
        "date": "2026-06-13"
      }
    },
    "Jaho Coffee Roaster & Wine Bar (Chinatown)": {
      "yelp": {
        "rating": 4.2,
        "count": 525,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 900,
        "date": "2026-06-13"
      }
    },
    "1369 Coffee House (Cambridge)": {
      "yelp": {
        "rating": 3.7,
        "count": 405,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "Barismo (Cambridge)": {
      "yelp": {
        "rating": 3.7,
        "count": 288,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 400,
        "date": "2026-06-13"
      }
    },
    "Diesel Cafe (Somerville)": {
      "yelp": {
        "rating": 4.1,
        "count": 1031,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 1500,
        "date": "2026-06-13"
      }
    },
    "Recreo Coffee & Roasterie (West Roxbury)": {
      "yelp": {
        "rating": 4.7,
        "count": 205,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.8,
        "count": 300,
        "date": "2026-06-13"
      }
    },
    "3 Little Figs (Somerville)": {
      "yelp": {
        "rating": 4.6,
        "count": 725,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 800,
        "date": "2026-06-13"
      }
    }
  },
  "best-restaurants-aspen": {
    "Bosq (Downtown Aspen)": {
      "yelp": {
        "rating": 4.5,
        "count": 163,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 360,
        "date": "2026-06-13"
      }
    },
    "Element 47 (The Little Nell)": {
      "yelp": {
        "rating": 4.2,
        "count": 101,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 400,
        "date": "2026-06-13"
      }
    },
    "Matsuhisa Aspen (Main St)": {
      "yelp": {
        "rating": 4.3,
        "count": 478,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "Betula (Downtown Aspen)": {
      "yelp": {
        "rating": 4.2,
        "count": 114,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 320,
        "date": "2026-06-13"
      }
    },
    "White House Tavern (Downtown Aspen)": {
      "yelp": {
        "rating": 4.4,
        "count": 1207,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1400,
        "date": "2026-06-13"
      }
    },
    "Casa Tua (Downtown Aspen)": {
      "yelp": {
        "rating": 4,
        "count": 206,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.2,
        "count": 280,
        "date": "2026-06-13"
      }
    },
    "Steakhouse No. 316 (Downtown Aspen)": {
      "yelp": {
        "rating": 4.3,
        "count": 303,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 400,
        "date": "2026-06-13"
      }
    },
    "Clark's Oyster Bar (Downtown Aspen)": {
      "yelp": {
        "rating": 4.2,
        "count": 276,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 350,
        "date": "2026-06-13"
      }
    },
    "Ellina (Downtown Aspen)": {
      "yelp": {
        "rating": 4.1,
        "count": 276,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 320,
        "date": "2026-06-13"
      }
    },
    "French Alpine Bistro (Downtown Aspen)": {
      "yelp": {
        "rating": 4.4,
        "count": 630,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "The Wild Fig (Downtown Aspen)": {
      "yelp": {
        "rating": 4,
        "count": 216,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 280,
        "date": "2026-06-13"
      }
    },
    "Meat & Cheese (Restaurant Row)": {
      "yelp": {
        "rating": 4.2,
        "count": 582,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "Mawa's Kitchen (Airport Business Center)": {
      "yelp": {
        "rating": 4.4,
        "count": 194,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 456,
        "date": "2026-06-13"
      }
    }
  },
  "best-restaurants-vail": {
    "Sweet Basil (Vail Village)": {
      "yelp": {
        "rating": 4.4,
        "count": 922,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1400,
        "date": "2026-06-13"
      }
    },
    "Matsuhisa Vail (Vail Village)": {
      "yelp": {
        "rating": 4.2,
        "count": 421,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 800,
        "date": "2026-06-13"
      }
    },
    "Mountain Standard (Vail Village)": {
      "yelp": {
        "rating": 4.4,
        "count": 1037,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1300,
        "date": "2026-06-13"
      }
    },
    "La Tour (Vail Village)": {
      "yelp": {
        "rating": 4,
        "count": 462,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "The Left Bank (Vail Village)": {
      "yelp": {
        "rating": 4.2,
        "count": 90,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 250,
        "date": "2026-06-13"
      }
    },
    "Elway's Vail (Vail Village)": {
      "yelp": {
        "rating": 4,
        "count": 275,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "Pepi's (Hotel Gasthof Gramshammer)": {
      "yelp": {
        "rating": 4,
        "count": 449,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "AlmResi (Vail Village)": {
      "yelp": {
        "rating": 4.5,
        "count": 318,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 400,
        "date": "2026-06-13"
      }
    },
    "Russell's (Vail Village)": {
      "yelp": {
        "rating": 4.2,
        "count": 155,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 300,
        "date": "2026-06-13"
      }
    },
    "Lancelot (Vail Village)": {
      "yelp": {
        "rating": 4.2,
        "count": 295,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 500,
        "date": "2026-06-13"
      }
    },
    "Vintage (Vail Village)": {
      "yelp": {
        "rating": 4.4,
        "count": 469,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 500,
        "date": "2026-06-13"
      }
    },
    "Tavernetta Vail (Four Seasons)": {
      "yelp": {
        "rating": 4.2,
        "count": 60,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 250,
        "date": "2026-06-13"
      }
    },
    "Osaki's (Vail Village)": {
      "yelp": {
        "rating": 4.5,
        "count": 104,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 200,
        "date": "2026-06-13"
      }
    },
    "Splendido at the Chateau (Beaver Creek)": {
      "yelp": {
        "rating": 4.5,
        "count": 192,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 300,
        "date": "2026-06-13"
      }
    }
  },
  "best-restaurants-palm-springs": {
    "Workshop Kitchen + Bar (Uptown)": {
      "yelp": {
        "rating": 4,
        "count": 1604,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 2400,
        "date": "2026-06-13"
      }
    },
    "Bar Cecil (South Palm Canyon)": {
      "yelp": {
        "rating": 4.4,
        "count": 547,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1500,
        "date": "2026-06-13"
      }
    },
    "Mr. Lyons Steakhouse (South Palm Canyon)": {
      "yelp": {
        "rating": 4.2,
        "count": 798,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1400,
        "date": "2026-06-13"
      }
    },
    "Le Vallauris (Downtown)": {
      "yelp": {
        "rating": 4.1,
        "count": 802,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 900,
        "date": "2026-06-13"
      }
    },
    "Spencer's Restaurant (Downtown)": {
      "yelp": {
        "rating": 4.2,
        "count": 1900,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 2600,
        "date": "2026-06-13"
      }
    },
    "Copley's on Palm Canyon (Uptown)": {
      "yelp": {
        "rating": 4.2,
        "count": 1079,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1100,
        "date": "2026-06-13"
      }
    },
    "Johannes (Downtown)": {
      "yelp": {
        "rating": 4.3,
        "count": 705,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 900,
        "date": "2026-06-13"
      }
    },
    "Sandfish Sushi & Whiskey (Uptown)": {
      "yelp": {
        "rating": 4.4,
        "count": 1365,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 1300,
        "date": "2026-06-13"
      }
    },
    "Tac/Quila (Uptown)": {
      "yelp": {
        "rating": 4.4,
        "count": 2943,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 2800,
        "date": "2026-06-13"
      }
    },
    "Rooster and the Pig (Downtown)": {
      "yelp": {
        "rating": 4.5,
        "count": 1753,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1700,
        "date": "2026-06-13"
      }
    },
    "Trio Restaurant (Uptown)": {
      "yelp": {
        "rating": 4.3,
        "count": 3938,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 4000,
        "date": "2026-06-13"
      }
    },
    "Eight4Nine Restaurant & Lounge (Uptown)": {
      "yelp": {
        "rating": 4.4,
        "count": 2089,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 2700,
        "date": "2026-06-13"
      }
    },
    "4 Saints (Kimpton Rowan Rooftop)": {
      "yelp": {
        "rating": 4.2,
        "count": 600,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 800,
        "date": "2026-06-13"
      }
    }
  },
  "best-restaurants-key-west": {
    "Blue Heaven (Bahama Village)": {
      "yelp": {
        "rating": 4.2,
        "count": 5456,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 11000,
        "date": "2026-06-13"
      }
    },
    "Nine One Five (915 Duval)": {
      "yelp": {
        "rating": 4.5,
        "count": 956,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 1700,
        "date": "2026-06-13"
      }
    },
    "Louie's Backyard (Waddell Ave)": {
      "yelp": {
        "rating": 4.2,
        "count": 1506,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 2600,
        "date": "2026-06-13"
      }
    },
    "Cafe Marquesa (Old Town)": {
      "yelp": {
        "rating": 4.5,
        "count": 271,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "Latitudes (Sunset Key)": {
      "yelp": {
        "rating": 4.3,
        "count": 1580,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 2400,
        "date": "2026-06-13"
      }
    },
    "Santiago's Bodega (Bahama Village)": {
      "yelp": {
        "rating": 4.5,
        "count": 2742,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 3500,
        "date": "2026-06-13"
      }
    },
    "Seven Fish (Truman Ave)": {
      "yelp": {
        "rating": 4.4,
        "count": 979,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1400,
        "date": "2026-06-13"
      }
    },
    "A&B Lobster House (Historic Seaport)": {
      "yelp": {
        "rating": 3.8,
        "count": 786,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 2000,
        "date": "2026-06-13"
      }
    },
    "Conch Republic Seafood Co (Seaport)": {
      "yelp": {
        "rating": 4,
        "count": 1945,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 4000,
        "date": "2026-06-13"
      }
    },
    "El Siboney (Old Town)": {
      "yelp": {
        "rating": 4.4,
        "count": 2236,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 4000,
        "date": "2026-06-13"
      }
    },
    "El Meson de Pepe (Mallory Square)": {
      "yelp": {
        "rating": 4,
        "count": 1015,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 5500,
        "date": "2026-06-13"
      }
    },
    "Banana Cafe (Duval St)": {
      "yelp": {
        "rating": 4.3,
        "count": 1417,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 2000,
        "date": "2026-06-13"
      }
    },
    "Cafe Sole (Old Town)": {
      "yelp": {
        "rating": 4.5,
        "count": 688,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1100,
        "date": "2026-06-13"
      }
    },
    "La Trattoria (Duval St)": {
      "yelp": {
        "rating": 4.3,
        "count": 558,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 1300,
        "date": "2026-06-13"
      }
    },
    "Better Than Sex (Simonton St)": {
      "yelp": {
        "rating": 4.5,
        "count": 1696,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.7,
        "count": 5700,
        "date": "2026-06-13"
      }
    }
  },
  "best-restaurants-st-barts": {
    "Bonito St Barth (Gustavia)": {
      "yelp": {
        "rating": 4.5,
        "count": 35,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 1100,
        "date": "2026-06-13"
      }
    },
    "L'Esprit Jean-Claude Dufour (Saline)": {
      "yelp": {
        "rating": 4.6,
        "count": 20,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.6,
        "count": 360,
        "date": "2026-06-13"
      }
    },
    "Shellona Beach (Shell Beach, Gustavia)": {
      "yelp": {
        "rating": 4.3,
        "count": 30,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 950,
        "date": "2026-06-13"
      }
    },
    "Le Tamarin (Saline)": {
      "yelp": {
        "rating": 4.4,
        "count": 25,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 800,
        "date": "2026-06-13"
      }
    },
    "Sand Bar - Eden Rock (St-Jean)": {
      "yelp": {
        "rating": 4.2,
        "count": 25,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "L'Isola (Gustavia)": {
      "yelp": {
        "rating": 4.4,
        "count": 25,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 700,
        "date": "2026-06-13"
      }
    },
    "Bagatelle St Barth (Gustavia)": {
      "yelp": {
        "rating": 4.2,
        "count": 20,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 550,
        "date": "2026-06-13"
      }
    },
    "Nikki Beach St Barth (St-Jean)": {
      "yelp": {
        "rating": 4,
        "count": 30,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.2,
        "count": 1000,
        "date": "2026-06-13"
      }
    },
    "La Guerite (Gustavia)": {
      "yelp": {
        "rating": 4.2,
        "count": 20,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 600,
        "date": "2026-06-13"
      }
    },
    "Black Ginger (Gustavia)": {
      "yelp": {
        "rating": 4.3,
        "count": 20,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 450,
        "date": "2026-06-13"
      }
    },
    "Gyp Sea Beach (St-Jean)": {
      "yelp": {
        "rating": 4.2,
        "count": 15,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.3,
        "count": 400,
        "date": "2026-06-13"
      }
    },
    "Al Mare - Le Sereno (Grand Cul-de-Sac)": {
      "yelp": {
        "rating": 4.5,
        "count": 15,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.5,
        "count": 250,
        "date": "2026-06-13"
      }
    },
    "Le Ti St Barth (Pointe Milou)": {
      "yelp": {
        "rating": 4,
        "count": 20,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.2,
        "count": 500,
        "date": "2026-06-13"
      }
    },
    "Santa Fe (Lurin)": {
      "yelp": {
        "rating": 4.3,
        "count": 15,
        "date": "2026-06-13"
      },
      "google": {
        "rating": 4.4,
        "count": 400,
        "date": "2026-06-13"
      }
    }
  },
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

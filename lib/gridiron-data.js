// The published week's ranking snapshot.
//
// Written by the weekly job (see CLAUDE-RANKINGS.md). Every number here came
// from a live fetch on `fetchedAt`; nothing in this file is written by hand or
// recalled from memory. `asOf` is the date the SOURCE reports, not the date we
// fetched it, and it is what the 30-day age gate in lib/gridiron.js reads.
//
// Shape: { fetchedAt, season, <sport>: { sport, sources: { <id>: source } } }.
// The sources live under an explicit `sources` key rather than directly on the
// sport so a sport can carry its own metadata (week number, phase) later
// without colliding with a source id.
export const GRIDIRON = {
  "fetchedAt": "2026-08-28",
  "season": 2026,
  "cfb": {
    "sport": "cfb",
    "sources": {
      "ap": {
        "label": "AP Top 25",
        "short": "AP",
        "tier": "official",
        "asOf": "2026-08-17",
        "kind": "poll",
        "url": "https://sports.core.api.espn.com/v2/sports/football/leagues/college-football/seasons/2026/types/1/weeks/1/rankings/1",
        "ranked": [
          [
            "Ohio State",
            1672
          ],
          [
            "Oregon",
            1597
          ],
          [
            "Georgia",
            1513
          ],
          [
            "Notre Dame",
            1510
          ],
          [
            "Texas",
            1483
          ],
          [
            "Indiana",
            1440
          ],
          [
            "Miami",
            1379
          ],
          [
            "Texas A&M",
            1131
          ],
          [
            "Ole Miss",
            1102
          ],
          [
            "Oklahoma",
            1047
          ],
          [
            "LSU",
            988
          ],
          [
            "Texas Tech",
            983
          ],
          [
            "Alabama",
            904
          ],
          [
            "USC",
            839
          ],
          [
            "BYU",
            839
          ],
          [
            "Michigan",
            718
          ],
          [
            "Washington",
            501
          ],
          [
            "Penn State",
            482
          ],
          [
            "SMU",
            434
          ],
          [
            "Tennessee",
            394
          ],
          [
            "Utah",
            304
          ],
          [
            "Iowa",
            260
          ],
          [
            "Houston",
            252
          ],
          [
            "Louisville",
            194
          ],
          [
            "Missouri",
            117
          ]
        ],
        "others": [
          [
            "Clemson",
            112
          ],
          [
            "Florida",
            51
          ],
          [
            "Boise State",
            43
          ],
          [
            "Arizona",
            32
          ],
          [
            "TCU",
            11
          ],
          [
            "South Carolina",
            10
          ],
          [
            "Navy",
            10
          ],
          [
            "Illinois",
            9
          ],
          [
            "Vanderbilt",
            8
          ],
          [
            "Oklahoma State",
            8
          ],
          [
            "Pittsburgh",
            7
          ],
          [
            "Virginia Tech",
            6
          ],
          [
            "Minnesota",
            5
          ],
          [
            "UNLV",
            4
          ],
          [
            "Louisiana",
            4
          ],
          [
            "New Mexico",
            4
          ],
          [
            "Georgia Tech",
            4
          ],
          [
            "James Madison",
            3
          ],
          [
            "Auburn",
            3
          ],
          [
            "Memphis",
            2
          ],
          [
            "California",
            2
          ],
          [
            "Western Michigan",
            1
          ],
          [
            "Tulane",
            1
          ],
          [
            "Liberty",
            1
          ],
          [
            "Virginia",
            1
          ]
        ]
      },
      "coaches": {
        "label": "AFCA Coaches Poll",
        "short": "Coaches",
        "tier": "official",
        "asOf": "2026-08-04",
        "kind": "poll",
        "url": "https://sports.core.api.espn.com/v2/sports/football/leagues/college-football/seasons/2026/types/1/weeks/1/rankings/2",
        "ranked": [
          [
            "Ohio State",
            1741
          ],
          [
            "Oregon",
            1637
          ],
          [
            "Georgia",
            1591
          ],
          [
            "Texas",
            1544
          ],
          [
            "Notre Dame",
            1524
          ],
          [
            "Indiana",
            1522
          ],
          [
            "Miami",
            1409
          ],
          [
            "Texas A&M",
            1174
          ],
          [
            "Oklahoma",
            1104
          ],
          [
            "Ole Miss",
            1096
          ],
          [
            "Alabama",
            1050
          ],
          [
            "Texas Tech",
            1034
          ],
          [
            "LSU",
            951
          ],
          [
            "USC",
            838
          ],
          [
            "BYU",
            781
          ],
          [
            "Michigan",
            719
          ],
          [
            "Penn State",
            463
          ],
          [
            "Tennessee",
            428
          ],
          [
            "Washington",
            406
          ],
          [
            "SMU",
            378
          ],
          [
            "Utah",
            313
          ],
          [
            "Iowa",
            291
          ],
          [
            "Clemson",
            235
          ],
          [
            "Houston",
            194
          ],
          [
            "Missouri",
            158
          ]
        ],
        "others": [
          [
            "Louisville",
            153
          ],
          [
            "Florida",
            147
          ],
          [
            "TCU",
            63
          ],
          [
            "Illinois",
            62
          ],
          [
            "South Carolina",
            50
          ],
          [
            "Arizona",
            50
          ],
          [
            "Virginia",
            40
          ],
          [
            "Vanderbilt",
            37
          ],
          [
            "Auburn",
            29
          ],
          [
            "Georgia Tech",
            26
          ],
          [
            "Boise State",
            24
          ],
          [
            "Oklahoma State",
            22
          ],
          [
            "UNLV",
            17
          ],
          [
            "NC State",
            13
          ],
          [
            "Florida State",
            13
          ],
          [
            "Virginia Tech",
            12
          ],
          [
            "Nebraska",
            12
          ],
          [
            "Memphis",
            9
          ],
          [
            "Arizona State",
            8
          ],
          [
            "James Madison",
            6
          ],
          [
            "Duke",
            6
          ],
          [
            "Pittsburgh",
            4
          ],
          [
            "New Mexico",
            4
          ],
          [
            "Western Michigan",
            3
          ],
          [
            "Navy",
            3
          ],
          [
            "San Diego State",
            2
          ],
          [
            "Kansas State",
            1
          ],
          [
            "Hawai'i",
            1
          ],
          [
            "Jacksonville State",
            1
          ],
          [
            "California",
            1
          ]
        ]
      },
      "fpi": {
        "label": "ESPN FPI",
        "short": "FPI",
        "tier": "model",
        "asOf": "2026-07-21",
        "kind": "ordered",
        "url": "https://sports.core.api.espn.com/v2/sports/football/leagues/college-football/seasons/2026/powerindex",
        "teams": [
          "Ohio State",
          "Texas",
          "Notre Dame",
          "Oregon",
          "Georgia",
          "Indiana",
          "Miami",
          "Alabama",
          "LSU",
          "Texas Tech",
          "Texas A&M",
          "Oklahoma",
          "USC",
          "Ole Miss",
          "Michigan",
          "Tennessee",
          "Penn State",
          "Florida",
          "Clemson",
          "BYU",
          "Missouri",
          "Auburn",
          "South Carolina",
          "SMU",
          "Iowa",
          "Washington",
          "Louisville",
          "Florida State",
          "Vanderbilt",
          "Nebraska",
          "Utah",
          "Virginia",
          "Virginia Tech",
          "Arizona",
          "Houston",
          "Pittsburgh",
          "Baylor",
          "TCU",
          "Illinois",
          "Kentucky",
          "Kansas State",
          "North Carolina",
          "Wisconsin",
          "Arizona State",
          "Colorado",
          "Cincinnati",
          "Arkansas",
          "Georgia Tech",
          "Mississippi State",
          "Boise State"
        ]
      },
      "sagarin": {
        "label": "Sagarin Ratings",
        "short": "Sagarin",
        "tier": "model",
        "asOf": "2026 preseason",
        "kind": "ordered",
        "url": "https://sagarin.com/sports/cfsend.htm",
        "teams": [
          "Ohio State",
          "Oregon",
          "Notre Dame",
          "Indiana",
          "Texas",
          "Georgia",
          "Miami-Florida",
          "Texas A&M",
          "Oklahoma",
          "LSU",
          "Southern California",
          "Texas Tech",
          "Michigan",
          "Alabama",
          "Mississippi",
          "Florida",
          "Tennessee",
          "Penn State",
          "Washington",
          "Iowa",
          "Missouri",
          "Auburn",
          "South Carolina",
          "BYU",
          "SMU",
          "Wisconsin",
          "Louisville",
          "Clemson",
          "Utah",
          "Illinois",
          "Nebraska",
          "Vanderbilt",
          "Kentucky",
          "Minnesota",
          "UCLA",
          "Pittsburgh",
          "Houston",
          "Mississippi State",
          "Kansas State",
          "Florida State",
          "Arizona",
          "Virginia Tech",
          "Northwestern",
          "Virginia",
          "Arizona State",
          "TCU",
          "Georgia Tech",
          "Arkansas",
          "NC State",
          "Baylor"
        ]
      },
      "fplus": {
        "label": "BCF Toys F+",
        "short": "F+",
        "tier": "model",
        "asOf": "2026 preseason",
        "kind": "ordered",
        "url": "https://bcftoys.com/2026-fplus",
        "teams": [
          "Ohio State",
          "Oregon",
          "Georgia",
          "Notre Dame",
          "Indiana",
          "Texas",
          "Miami",
          "Texas Tech",
          "Alabama",
          "Texas A&M",
          "Ole Miss",
          "Michigan",
          "Oklahoma",
          "Penn State",
          "USC",
          "Tennessee",
          "Washington",
          "LSU",
          "Utah",
          "Iowa",
          "BYU",
          "Missouri",
          "Clemson",
          "Florida",
          "Vanderbilt",
          "Auburn",
          "Kansas State",
          "South Carolina",
          "Louisville",
          "Illinois",
          "SMU",
          "Florida State",
          "TCU",
          "Arizona",
          "Nebraska",
          "Pittsburgh",
          "NC State",
          "Virginia",
          "Arkansas",
          "Kentucky",
          "Arizona State",
          "Minnesota",
          "Georgia Tech",
          "Houston",
          "Wisconsin",
          "Mississippi State",
          "Kansas",
          "Duke",
          "Boise State",
          "Iowa State"
        ]
      },
      "dratings": {
        "label": "DRatings",
        "short": "DRatings",
        "tier": "model",
        "asOf": "2026-08-26",
        "kind": "ordered",
        "url": "https://www.dratings.com/sports/ncaa-fbs-football-ratings/",
        "teams": [
          "Indiana Hoosiers",
          "Oregon Ducks",
          "Ohio State Buckeyes",
          "Notre Dame Fighting Irish",
          "Texas Longhorns",
          "Miami Hurricanes",
          "Texas Tech Red Raiders",
          "Georgia Bulldogs",
          "Ole Miss Rebels",
          "Oklahoma Sooners",
          "Alabama Crimson Tide",
          "BYU Cougars",
          "LSU Tigers",
          "USC Trojans",
          "Texas A&M Aggies",
          "Michigan Wolverines",
          "Utah Utes",
          "Washington Huskies",
          "Iowa Hawkeyes",
          "Florida Gators",
          "SMU Mustangs",
          "Penn State Nittany Lions",
          "Tennessee Volunteers",
          "Louisville Cardinals",
          "Kansas State Wildcats",
          "Virginia Cavaliers",
          "Arizona Wildcats",
          "Illinois Fighting Illini",
          "TCU Horned Frogs",
          "Missouri Tigers",
          "Nebraska Cornhuskers",
          "Houston Cougars",
          "Auburn Tigers",
          "Virginia Tech Hokies",
          "Arizona State Sun Devils",
          "Clemson Tigers",
          "Wisconsin Badgers",
          "NC State Wolfpack",
          "Pittsburgh Panthers",
          "Minnesota Golden Gophers",
          "Vanderbilt Commodores",
          "UCLA Bruins",
          "Northwestern Wildcats",
          "Georgia Tech Yellow Jackets",
          "Wake Forest Demon Deacons",
          "California Golden Bears",
          "Tulane Green Wave",
          "UNLV Rebels",
          "Duke Blue Devils",
          "Kentucky Wildcats"
        ]
      },
      "futures": {
        "label": "Title Futures",
        "short": "Futures",
        "tier": "market",
        "asOf": "2026-08-28",
        "kind": "priced",
        "lowerIsBetter": true,
        "url": "https://sports.core.api.espn.com/v2/sports/football/leagues/college-football/seasons/2026/futures/2758",
        "values": [
          [
            "Ohio State Buckeyes",
            600
          ],
          [
            "Notre Dame Fighting Irish",
            600
          ],
          [
            "Texas Longhorns",
            650
          ],
          [
            "Oregon Ducks",
            750
          ],
          [
            "Georgia Bulldogs",
            850
          ],
          [
            "Indiana Hoosiers",
            900
          ],
          [
            "Miami Hurricanes",
            1000
          ],
          [
            "LSU Tigers",
            1700
          ],
          [
            "Texas Tech Red Raiders",
            2200
          ],
          [
            "Texas A&M Aggies",
            2500
          ],
          [
            "Alabama Crimson Tide",
            2500
          ],
          [
            "Ole Miss Rebels",
            3000
          ],
          [
            "Oklahoma Sooners",
            3000
          ],
          [
            "USC Trojans",
            3500
          ],
          [
            "Michigan Wolverines",
            4000
          ],
          [
            "Penn State Nittany Lions",
            6500
          ],
          [
            "Florida Gators",
            7000
          ],
          [
            "Tennessee Volunteers",
            7000
          ],
          [
            "Auburn Tigers",
            8000
          ],
          [
            "BYU Cougars",
            9000
          ],
          [
            "Missouri Tigers",
            10000
          ],
          [
            "SMU Mustangs",
            10000
          ],
          [
            "Utah Utes",
            11000
          ],
          [
            "Washington Huskies",
            12000
          ],
          [
            "South Carolina Gamecocks",
            12000
          ],
          [
            "Louisville Cardinals",
            12000
          ],
          [
            "Clemson Tigers",
            13000
          ],
          [
            "Iowa Hawkeyes",
            14000
          ],
          [
            "Vanderbilt Commodores",
            25000
          ],
          [
            "TCU Horned Frogs",
            25000
          ],
          [
            "Houston Cougars",
            30000
          ],
          [
            "Arizona State Sun Devils",
            30000
          ],
          [
            "Florida State Seminoles",
            35000
          ],
          [
            "Virginia Tech Hokies",
            35000
          ],
          [
            "Arizona Wildcats",
            35000
          ],
          [
            "Virginia Cavaliers",
            40000
          ],
          [
            "Kansas State Wildcats",
            40000
          ],
          [
            "Pittsburgh Panthers",
            40000
          ],
          [
            "Georgia Tech Yellow Jackets",
            40000
          ],
          [
            "Oklahoma State Cowboys",
            40000
          ],
          [
            "Kentucky Wildcats",
            45000
          ],
          [
            "Illinois Fighting Illini",
            50000
          ],
          [
            "NC State Wolfpack",
            50000
          ],
          [
            "Mississippi State Bulldogs",
            50000
          ],
          [
            "Nebraska Cornhuskers",
            60000
          ],
          [
            "Wisconsin Badgers",
            60000
          ],
          [
            "Baylor Bears",
            70000
          ],
          [
            "Arkansas Razorbacks",
            70000
          ],
          [
            "Colorado Buffaloes",
            70000
          ],
          [
            "Boise State Broncos",
            70000
          ]
        ]
      }
    }
  },
  "nfl": {
    "sport": "nfl",
    "sources": {
      "fpi": {
        "label": "ESPN FPI",
        "short": "FPI",
        "tier": "model",
        "asOf": "2026-06-02",
        "stale": true,
        "kind": "ordered",
        "url": "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2026/powerindex",
        "teams": [
          "Los Angeles Rams",
          "Buffalo Bills",
          "Baltimore Ravens",
          "Seattle Seahawks",
          "San Francisco 49ers",
          "Green Bay Packers",
          "Los Angeles Chargers",
          "Detroit Lions",
          "Kansas City Chiefs",
          "Philadelphia Eagles",
          "Dallas Cowboys",
          "Cincinnati Bengals",
          "Houston Texans",
          "New England Patriots",
          "Denver Broncos",
          "Chicago Bears",
          "Jacksonville Jaguars",
          "Tampa Bay Buccaneers",
          "Minnesota Vikings",
          "Indianapolis Colts",
          "Washington Commanders",
          "Pittsburgh Steelers",
          "New York Giants",
          "Atlanta Falcons",
          "New Orleans Saints",
          "Carolina Panthers",
          "Tennessee Titans",
          "Las Vegas Raiders",
          "Arizona Cardinals",
          "Cleveland Browns",
          "New York Jets",
          "Miami Dolphins"
        ]
      },
      "dratings": {
        "label": "DRatings",
        "short": "DRatings",
        "tier": "model",
        "asOf": "2026-07-29",
        "stale": true,
        "kind": "ordered",
        "url": "https://www.dratings.com/sports/nfl-football-ratings/",
        "teams": [
          "Los Angeles Rams",
          "Seattle Seahawks",
          "Buffalo Bills",
          "Baltimore Ravens",
          "San Francisco 49ers",
          "New England Patriots",
          "Los Angeles Chargers",
          "Kansas City Chiefs",
          "Detroit Lions",
          "Denver Broncos",
          "Jacksonville Jaguars",
          "Philadelphia Eagles",
          "Dallas Cowboys",
          "Houston Texans",
          "Green Bay Packers",
          "Cincinnati Bengals",
          "Chicago Bears",
          "Minnesota Vikings",
          "Tampa Bay Buccaneers",
          "Indianapolis Colts",
          "Washington Commanders",
          "Pittsburgh Steelers",
          "Carolina Panthers",
          "New York Giants",
          "Atlanta Falcons",
          "New Orleans Saints",
          "Tennessee Titans",
          "Las Vegas Raiders",
          "New York Jets",
          "Cleveland Browns",
          "Arizona Cardinals",
          "Miami Dolphins"
        ]
      },
      "sagarin": {
        "label": "Sagarin Ratings",
        "short": "Sagarin",
        "tier": "model",
        "asOf": "2026-02-08",
        "stale": true,
        "kind": "ordered",
        "url": "https://sagarin.com/sports/nflsend.htm",
        "teams": [
          "Seattle Seahawks",
          "Los Angeles Rams",
          "Houston Texans",
          "Jacksonville Jaguars",
          "New England Patriots",
          "Buffalo Bills",
          "Denver Broncos",
          "San Francisco 49ers",
          "Philadelphia Eagles",
          "Detroit Lions",
          "Baltimore Ravens",
          "Chicago Bears",
          "Minnesota Vikings",
          "Green Bay Packers",
          "Indianapolis Colts",
          "Los Angeles Chargers",
          "Kansas City Chiefs",
          "Pittsburgh Steelers",
          "Tampa Bay Buccaneers",
          "Atlanta Falcons",
          "Cincinnati Bengals",
          "Carolina Panthers",
          "Washington Redskins",
          "New York Giants",
          "New Orleans Saints",
          "Dallas Cowboys",
          "Cleveland Browns",
          "Miami Dolphins",
          "Arizona Cardinals",
          "Tennessee Titans",
          "Las Vegas Raiders",
          "New York Jets"
        ]
      },
      "sharp": {
        "label": "Sharp Football Analysis",
        "short": "Sharp",
        "tier": "media",
        "asOf": "2026-08-24",
        "kind": "ordered",
        "url": "https://www.sharpfootballanalysis.com/analysis/nfl-power-rankings/",
        "teams": [
          "Los Angeles Rams",
          "Buffalo Bills",
          "Seattle Seahawks",
          "Green Bay Packers",
          "Los Angeles Chargers",
          "Denver Broncos",
          "Houston Texans",
          "Baltimore Ravens",
          "Philadelphia Eagles",
          "New England Patriots",
          "Cincinnati Bengals",
          "San Francisco 49ers",
          "Kansas City Chiefs",
          "Detroit Lions",
          "Jacksonville Jaguars",
          "Dallas Cowboys",
          "Chicago Bears",
          "Tampa Bay Buccaneers",
          "Minnesota Vikings",
          "Pittsburgh Steelers",
          "Indianapolis Colts",
          "Carolina Panthers",
          "Washington Commanders",
          "New York Giants",
          "New Orleans Saints",
          "Tennessee Titans",
          "New York Jets",
          "Atlanta Falcons",
          "Las Vegas Raiders",
          "Arizona Cardinals",
          "Cleveland Browns",
          "Miami Dolphins"
        ]
      },
      "cbs": {
        "label": "CBS Sports",
        "short": "CBS",
        "tier": "media",
        "asOf": "2026-04-28",
        "stale": true,
        "kind": "ordered",
        "url": "https://www.cbssports.com/nfl/powerrankings/",
        "teams": [
          "Seahawks",
          "Rams",
          "Bills",
          "Broncos",
          "Jaguars",
          "49ers",
          "Packers",
          "Cowboys",
          "Chargers",
          "Bears",
          "Patriots",
          "Chiefs",
          "Eagles",
          "Ravens",
          "Texans",
          "Buccaneers",
          "Bengals",
          "Lions",
          "Vikings",
          "Colts",
          "Steelers",
          "Panthers",
          "Saints",
          "Falcons",
          "Giants",
          "Commanders",
          "Jets",
          "Raiders",
          "Titans",
          "Browns",
          "Dolphins",
          "Cardinals"
        ]
      },
      "vegas": {
        "label": "Sportsbook Futures",
        "short": "Vegas",
        "tier": "market",
        "asOf": "2026-08-27",
        "kind": "ordered",
        "url": "https://www.vegasinsider.com/nfl/odds/futures/",
        "teams": [
          "Los Angeles Rams",
          "Buffalo Bills",
          "Baltimore Ravens",
          "Seattle Seahawks",
          "Kansas City Chiefs",
          "Philadelphia Eagles",
          "Los Angeles Chargers",
          "New England Patriots",
          "Detroit Lions",
          "Houston Texans",
          "San Francisco 49ers",
          "Green Bay Packers",
          "Denver Broncos",
          "Cincinnati Bengals",
          "Dallas Cowboys",
          "Chicago Bears",
          "Jacksonville Jaguars",
          "Minnesota Vikings",
          "Tampa Bay Buccaneers",
          "Indianapolis Colts",
          "Pittsburgh Steelers",
          "Washington Commanders",
          "New York Giants",
          "New Orleans Saints",
          "Carolina Panthers",
          "Atlanta Falcons",
          "Tennessee Titans",
          "Las Vegas Raiders",
          "Cleveland Browns",
          "New York Jets",
          "Miami Dolphins",
          "Arizona Cardinals"
        ]
      },
      "kalshi": {
        "label": "Kalshi Prediction Market",
        "short": "Kalshi",
        "tier": "market",
        "asOf": "2026-08-27",
        "kind": "ordered",
        "url": "https://kalshi.com/nfl/power-rankings",
        "teams": [
          "Los Angeles Rams",
          "Buffalo Bills",
          "Seattle Seahawks",
          "Baltimore Ravens",
          "Kansas City Chiefs",
          "Los Angeles Chargers",
          "New England Patriots",
          "Denver Broncos",
          "Houston Texans",
          "Cincinnati Bengals",
          "San Francisco 49ers",
          "Philadelphia Eagles",
          "Jacksonville Jaguars",
          "Dallas Cowboys",
          "Detroit Lions",
          "Chicago Bears",
          "Green Bay Packers",
          "Pittsburgh Steelers",
          "Minnesota Vikings",
          "Tampa Bay Buccaneers",
          "Washington Commanders",
          "Atlanta Falcons",
          "Carolina Panthers",
          "Indianapolis Colts",
          "Las Vegas Raiders",
          "New York Giants",
          "Tennessee Titans",
          "New Orleans Saints",
          "New York Jets",
          "Cleveland Browns",
          "Miami Dolphins",
          "Arizona Cardinals"
        ]
      },
      "wintotals": {
        "label": "Market Win Totals",
        "short": "Win Totals",
        "tier": "market",
        "asOf": "2026 season",
        "kind": "ordered",
        "url": "https://www.nfeloapp.com/nfl-power-ratings/nfl-win-totals/",
        "teams": [
          "LAR",
          "BAL",
          "BUF",
          "SEA",
          "DET",
          "PHI",
          "CIN",
          "NE",
          "KC",
          "HOU",
          "SF",
          "LAC",
          "GB",
          "DEN",
          "CHI",
          "DAL",
          "JAX",
          "MIN",
          "PIT",
          "TB",
          "IND",
          "NO",
          "NYG",
          "WAS",
          "CAR",
          "ATL",
          "TEN",
          "OAK",
          "CLE",
          "NYJ",
          "MIA",
          "ARI"
        ]
      }
    }
  }
};

export default GRIDIRON;

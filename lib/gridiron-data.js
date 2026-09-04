// The published week's ranking snapshot.
//
// Written by the weekly build (see CLAUDE-RANKINGS.md). Every number here came
// from a live fetch; nothing in this file is written by hand or recalled from
// memory. `asOf` on a source is the date the SOURCE reports and is what the
// 30-day age gate in lib/gridiron.js reads.
//
// Shape (v2, 2026-09-01): { fetchedAt, season, <sport>: { sport, week, gamesAt,
// linesAt, sources, games, lines } }.
//   week    the ESPN week whose games are NEXT (so week-1 games are complete)
//   games   every completed game this season: { w, id, d, hid, aid, n, hs, as,
//           hy, ay, hto, ato } (n = 1 on a neutral field; ids are ESPN team ids;
//           hy/ay total yards and hto/ato turnovers from the ESPN summary
//           endpoint, `boxscore.teams[].statistics` totalYards / turnovers;
//           a game without them falls back to its raw margin)
//   lines   one closing or current point spread per game, home-team spread,
//           for the current week and the two before it: { w, id, hid, aid, n, sp }
//   sources only 'market' and 'model' tiers are scored; there are no media or
//           poll sources in the composite (owner rule, 2026-09-01)
export const GRIDIRON = {
  "fetchedAt": "2026-09-04",
  "season": 2026,
  "cfb": {
    "sport": "cfb",
    "week": 1,
    "gamesAt": "2026-09-01",
    "linesAt": "2026-09-01",
    "sources": {
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
    },
    "games": [
      {
        "w": 1,
        "id": "401864494",
        "d": "2026-08-29",
        "hid": "30",
        "aid": "23",
        "n": 0,
        "hs": 42,
        "as": 26,
        "hy": 505,
        "ay": 336,
        "hto": 1,
        "ato": 0
      },
      {
        "w": 1,
        "id": "401856766",
        "d": "2026-08-29",
        "hid": "2628",
        "aid": "153",
        "n": 1,
        "hs": 10,
        "as": 15,
        "hy": 281,
        "ay": 322,
        "hto": 1,
        "ato": 2
      },
      {
        "w": 1,
        "id": "401858202",
        "d": "2026-08-29",
        "hid": "258",
        "aid": "152",
        "n": 0,
        "hs": 34,
        "as": 8,
        "hy": 413,
        "ay": 168,
        "hto": 0,
        "ato": 2
      },
      {
        "w": 1,
        "id": "401864577",
        "d": "2026-08-29",
        "hid": "2449",
        "aid": "55",
        "n": 0,
        "hs": 33,
        "as": 7,
        "hy": 373,
        "ay": 170,
        "hto": 1,
        "ato": 2
      },
      {
        "w": 1,
        "id": "401866408",
        "d": "2026-08-29",
        "hid": "2199",
        "aid": "16",
        "n": 0,
        "hs": 28,
        "as": 17,
        "hy": 348,
        "ay": 268,
        "hto": 1,
        "ato": 2
      },
      {
        "w": 1,
        "id": "401858201",
        "d": "2026-08-29",
        "hid": "24",
        "aid": "62",
        "n": 0,
        "hs": 37,
        "as": 27,
        "hy": 483,
        "ay": 322,
        "hto": 0,
        "ato": 1
      },
      {
        "w": 1,
        "id": "401864570",
        "d": "2026-08-29",
        "hid": "52",
        "aid": "166",
        "n": 0,
        "hs": 34,
        "as": 17,
        "hy": 419,
        "ay": 319,
        "hto": 1,
        "ato": 1
      },
      {
        "w": 1,
        "id": "401862693",
        "d": "2026-08-30",
        "hid": "2439",
        "aid": "235",
        "n": 0,
        "hs": 21,
        "as": 27,
        "hy": 460,
        "ay": 418,
        "hto": 0,
        "ato": 1
      }
    ],
    "lines": [
      {
        "w": 1,
        "id": "401864494",
        "hid": "30",
        "aid": "23",
        "n": 0,
        "sp": -37.5
      },
      {
        "w": 1,
        "id": "401856766",
        "hid": "2628",
        "aid": "153",
        "n": 1,
        "sp": -7.5
      },
      {
        "w": 1,
        "id": "401858202",
        "hid": "258",
        "aid": "152",
        "n": 0,
        "sp": -4
      },
      {
        "w": 1,
        "id": "401864577",
        "hid": "2449",
        "aid": "55",
        "n": 0,
        "sp": -6.5
      },
      {
        "w": 1,
        "id": "401866408",
        "hid": "2199",
        "aid": "16",
        "n": 0,
        "sp": -9.5
      },
      {
        "w": 1,
        "id": "401858201",
        "hid": "24",
        "aid": "62",
        "n": 0,
        "sp": -4.5
      },
      {
        "w": 1,
        "id": "401864570",
        "hid": "52",
        "aid": "166",
        "n": 0,
        "sp": -30.5
      },
      {
        "w": 1,
        "id": "401862693",
        "hid": "2439",
        "aid": "235",
        "n": 0,
        "sp": -4.5
      },
      {
        "w": 1,
        "id": "401858423",
        "hid": "164",
        "aid": "113",
        "n": 0,
        "sp": -28.5
      },
      {
        "w": 1,
        "id": "401856767",
        "hid": "2116",
        "aid": "2065",
        "n": 0,
        "sp": -42.5
      },
      {
        "w": 1,
        "id": "401858204",
        "hid": "154",
        "aid": "2006",
        "n": 0,
        "sp": -23.5
      },
      {
        "w": 1,
        "id": "401864424",
        "hid": "48",
        "aid": "2771",
        "n": 0,
        "sp": -28.5
      },
      {
        "w": 1,
        "id": "401864425",
        "hid": "338",
        "aid": "2698",
        "n": 0,
        "sp": -23.5
      },
      {
        "w": 1,
        "id": "401866409",
        "hid": "2084",
        "aid": "399",
        "n": 0,
        "sp": -18.5
      },
      {
        "w": 1,
        "id": "401856663",
        "hid": "142",
        "aid": "2029",
        "n": 0,
        "sp": -54.5
      },
      {
        "w": 1,
        "id": "401856776",
        "hid": "59",
        "aid": "38",
        "n": 0,
        "sp": -6.5
      },
      {
        "w": 1,
        "id": "401858422",
        "hid": "135",
        "aid": "2197",
        "n": 0,
        "sp": -42.5
      },
      {
        "w": 1,
        "id": "401856768",
        "hid": "254",
        "aid": "70",
        "n": 0,
        "sp": -35.5
      },
      {
        "w": 1,
        "id": "401858424",
        "hid": "356",
        "aid": "5",
        "n": 0,
        "sp": -27.5
      },
      {
        "w": 1,
        "id": "401864495",
        "hid": "2199",
        "aid": "23",
        "n": 0,
        "sp": -3
      },
      {
        "w": 1,
        "id": "401858435",
        "hid": "2509",
        "aid": "282",
        "n": 0,
        "sp": -35.5
      },
      {
        "w": 1,
        "id": "401866623",
        "hid": "2247",
        "aid": "2448",
        "n": 0,
        "sp": -28.5
      },
      {
        "w": 1,
        "id": "401856664",
        "hid": "201",
        "aid": "2638",
        "n": 0,
        "sp": -41.5
      },
      {
        "w": 1,
        "id": "401856769",
        "hid": "2305",
        "aid": "2341",
        "n": 0,
        "sp": -41.5
      },
      {
        "w": 1,
        "id": "401858429",
        "hid": "127",
        "aid": "2649",
        "n": 0,
        "sp": -9.5
      },
      {
        "w": 1,
        "id": "401858206",
        "hid": "24",
        "aid": "2390",
        "n": 0,
        "sp": 24.5
      },
      {
        "w": 1,
        "id": "401858436",
        "hid": "30",
        "aid": "278",
        "n": 0,
        "sp": -22.5
      },
      {
        "w": 1,
        "id": "401858425",
        "hid": "84",
        "aid": "249",
        "n": 0,
        "sp": -39.5
      },
      {
        "w": 1,
        "id": "401856634",
        "hid": "333",
        "aid": "151",
        "n": 0,
        "sp": -27.5
      },
      {
        "w": 1,
        "id": "401856778",
        "hid": "248",
        "aid": "204",
        "n": 0,
        "sp": -20.5
      },
      {
        "w": 1,
        "id": "401856780",
        "hid": "277",
        "aid": "324",
        "n": 0,
        "sp": -21
      },
      {
        "w": 1,
        "id": "401858208",
        "hid": "183",
        "aid": "160",
        "n": 0,
        "sp": -33.5
      },
      {
        "w": 1,
        "id": "401858430",
        "hid": "158",
        "aid": "195",
        "n": 0,
        "sp": -23.5
      },
      {
        "w": 1,
        "id": "401861962",
        "hid": "41",
        "aid": "322",
        "n": 0,
        "sp": -19.5
      },
      {
        "w": 1,
        "id": "401862701",
        "hid": "349",
        "aid": "2803",
        "n": 0,
        "sp": -36.5
      },
      {
        "w": 1,
        "id": "401866410",
        "hid": "189",
        "aid": "2627",
        "n": 0,
        "sp": -2.5
      },
      {
        "w": 1,
        "id": "401869960",
        "hid": "256",
        "aid": "2335",
        "n": 0,
        "sp": -6.5
      },
      {
        "w": 1,
        "id": "401858432",
        "hid": "194",
        "aid": "2050",
        "n": 0,
        "sp": -50.5
      },
      {
        "w": 1,
        "id": "401858207",
        "hid": "221",
        "aid": "193",
        "n": 0,
        "sp": -16.5
      },
      {
        "w": 1,
        "id": "401856665",
        "hid": "2579",
        "aid": "2309",
        "n": 0,
        "sp": -35.5
      },
      {
        "w": 1,
        "id": "401856659",
        "hid": "96",
        "aid": "2754",
        "n": 0,
        "sp": -23.5
      },
      {
        "w": 1,
        "id": "401856779",
        "hid": "66",
        "aid": "2546",
        "n": 0,
        "sp": -29.5
      },
      {
        "w": 1,
        "id": "401864496",
        "hid": "2005",
        "aid": "2184",
        "n": 0,
        "sp": -28.5
      },
      {
        "w": 1,
        "id": "401862698",
        "hid": "218",
        "aid": "227",
        "n": 0,
        "sp": -14.5
      },
      {
        "w": 1,
        "id": "401856658",
        "hid": "61",
        "aid": "2634",
        "n": 0,
        "sp": -46.5
      },
      {
        "w": 1,
        "id": "401858433",
        "hid": "2483",
        "aid": "68",
        "n": 0,
        "sp": -24.5
      },
      {
        "w": 1,
        "id": "401856667",
        "hid": "251",
        "aid": "326",
        "n": 0,
        "sp": -29.5
      },
      {
        "w": 1,
        "id": "401858434",
        "hid": "213",
        "aid": "276",
        "n": 0,
        "sp": -23.5
      },
      {
        "w": 1,
        "id": "401856666",
        "hid": "2633",
        "aid": "231",
        "n": 0,
        "sp": -46.5
      },
      {
        "w": 1,
        "id": "401856636",
        "hid": "2",
        "aid": "239",
        "n": 1,
        "sp": -7.5
      },
      {
        "w": 1,
        "id": "401856777",
        "hid": "2132",
        "aid": "103",
        "n": 0,
        "sp": -7.5
      },
      {
        "w": 1,
        "id": "401858209",
        "hid": "150",
        "aid": "2655",
        "n": 0,
        "sp": -7.5
      },
      {
        "w": 1,
        "id": "401862694",
        "hid": "2429",
        "aid": "2643",
        "n": 0,
        "sp": -20.5
      },
      {
        "w": 1,
        "id": "401862696",
        "hid": "2426",
        "aid": "119",
        "n": 0,
        "sp": -30.5
      },
      {
        "w": 1,
        "id": "401862700",
        "hid": "2636",
        "aid": "292",
        "n": 0,
        "sp": -28.5
      },
      {
        "w": 1,
        "id": "401864499",
        "hid": "2449",
        "aid": "2230",
        "n": 0,
        "sp": -39.5
      },
      {
        "w": 1,
        "id": "401866627",
        "hid": "2026",
        "aid": "311",
        "n": 0,
        "sp": -18.5
      },
      {
        "w": 1,
        "id": "401856772",
        "hid": "202",
        "aid": "197",
        "n": 0,
        "sp": 13.5
      },
      {
        "w": 1,
        "id": "401858426",
        "hid": "2294",
        "aid": "2459",
        "n": 0,
        "sp": -31.5
      },
      {
        "w": 1,
        "id": "401856635",
        "hid": "8",
        "aid": "2453",
        "n": 0,
        "sp": -40.5
      },
      {
        "w": 1,
        "id": "401868356",
        "hid": "2572",
        "aid": "2016",
        "n": 0,
        "sp": -20.5
      },
      {
        "w": 1,
        "id": "401860878",
        "hid": "36",
        "aid": "2751",
        "n": 0,
        "sp": -3
      },
      {
        "w": 1,
        "id": "401867973",
        "hid": "295",
        "aid": "2450",
        "n": 0,
        "sp": -40.5
      },
      {
        "w": 1,
        "id": "401856668",
        "hid": "245",
        "aid": "2623",
        "n": 0,
        "sp": -40.5
      },
      {
        "w": 1,
        "id": "401856770",
        "hid": "2641",
        "aid": "2000",
        "n": 0,
        "sp": -42.5
      },
      {
        "w": 1,
        "id": "401856669",
        "hid": "238",
        "aid": "2046",
        "n": 0,
        "sp": -29.5
      },
      {
        "w": 1,
        "id": "401856771",
        "hid": "2306",
        "aid": "2447",
        "n": 0,
        "sp": -40.5
      },
      {
        "w": 1,
        "id": "401860880",
        "hid": "328",
        "aid": "304",
        "n": 0,
        "sp": -13.5
      },
      {
        "w": 1,
        "id": "401862695",
        "hid": "235",
        "aid": "2032",
        "n": 0,
        "sp": -11.5
      },
      {
        "w": 1,
        "id": "401862697",
        "hid": "242",
        "aid": "2277",
        "n": 0,
        "sp": -22.5
      },
      {
        "w": 1,
        "id": "401862699",
        "hid": "58",
        "aid": "2229",
        "n": 0,
        "sp": -14
      },
      {
        "w": 1,
        "id": "401867866",
        "hid": "2393",
        "aid": "93",
        "n": 0,
        "sp": -20.5
      },
      {
        "w": 1,
        "id": "401868140",
        "hid": "55",
        "aid": "2198",
        "n": 0,
        "sp": -20.5
      },
      {
        "w": 1,
        "id": "401868170",
        "hid": "290",
        "aid": "2127",
        "n": 0,
        "sp": -25.5
      },
      {
        "w": 1,
        "id": "401868316",
        "hid": "6",
        "aid": "2545",
        "n": 0,
        "sp": -12.5
      },
      {
        "w": 1,
        "id": "401870763",
        "hid": "2653",
        "aid": "2534",
        "n": 0,
        "sp": -16.5
      },
      {
        "w": 1,
        "id": "401856660",
        "hid": "99",
        "aid": "228",
        "n": 0,
        "sp": -10
      },
      {
        "w": 1,
        "id": "401858428",
        "hid": "130",
        "aid": "2711",
        "n": 0,
        "sp": -27.5
      },
      {
        "w": 1,
        "id": "401856662",
        "hid": "344",
        "aid": "2433",
        "n": 0,
        "sp": -28.5
      },
      {
        "w": 1,
        "id": "401858211",
        "hid": "259",
        "aid": "2678",
        "n": 0,
        "sp": -55.5
      },
      {
        "w": 1,
        "id": "401869129",
        "hid": "2348",
        "aid": "2466",
        "n": 0,
        "sp": -44.5
      },
      {
        "w": 1,
        "id": "401856637",
        "hid": "57",
        "aid": "2226",
        "n": 0,
        "sp": -26.5
      },
      {
        "w": 1,
        "id": "401856775",
        "hid": "252",
        "aid": "3101",
        "n": 0,
        "sp": -51.5
      },
      {
        "w": 1,
        "id": "401858427",
        "hid": "120",
        "aid": "2261",
        "n": 0,
        "sp": -45.5
      },
      {
        "w": 1,
        "id": "401858431",
        "hid": "77",
        "aid": "2571",
        "n": 0,
        "sp": -12.5
      },
      {
        "w": 1,
        "id": "401869142",
        "hid": "309",
        "aid": "2320",
        "n": 0,
        "sp": -20.5
      },
      {
        "w": 1,
        "id": "401870790",
        "hid": "166",
        "aid": "2385",
        "n": 0,
        "sp": -28.5
      },
      {
        "w": 1,
        "id": "401856773",
        "hid": "12",
        "aid": "2464",
        "n": 0,
        "sp": -31.5
      },
      {
        "w": 1,
        "id": "401860879",
        "hid": "21",
        "aid": "2502",
        "n": 0,
        "sp": -40.5
      },
      {
        "w": 1,
        "id": "401856774",
        "hid": "9",
        "aid": "2415",
        "n": 0,
        "sp": -43.5
      },
      {
        "w": 1,
        "id": "401864497",
        "hid": "62",
        "aid": "2439",
        "n": 0,
        "sp": 3
      },
      {
        "w": 1,
        "id": "401864498",
        "hid": "167",
        "aid": "2117",
        "n": 0,
        "sp": -10
      },
      {
        "w": 1,
        "id": "401866411",
        "hid": "16",
        "aid": "2400",
        "n": 0,
        "sp": -37.5
      },
      {
        "w": 1,
        "id": "401858210",
        "hid": "25",
        "aid": "26",
        "n": 0,
        "sp": 2.5
      },
      {
        "w": 1,
        "id": "401864432",
        "hid": "2440",
        "aid": "98",
        "n": 0,
        "sp": 2.5
      },
      {
        "w": 1,
        "id": "401858437",
        "hid": "264",
        "aid": "265",
        "n": 0,
        "sp": -23.5
      },
      {
        "w": 1,
        "id": "401858438",
        "hid": "87",
        "aid": "275",
        "n": 1,
        "sp": -20.5
      },
      {
        "w": 1,
        "id": "401856661",
        "hid": "145",
        "aid": "97",
        "n": 1,
        "sp": -7
      },
      {
        "w": 1,
        "id": "401858212",
        "hid": "52",
        "aid": "2567",
        "n": 0,
        "sp": 3
      },
      {
        "w": 2,
        "id": "401856678",
        "hid": "2305",
        "aid": "142",
        "n": 0,
        "sp": 7
      },
      {
        "w": 2,
        "id": "401856782",
        "hid": "197",
        "aid": "2483",
        "n": 0,
        "sp": 18.5
      },
      {
        "w": 2,
        "id": "401856683",
        "hid": "245",
        "aid": "9",
        "n": 0,
        "sp": -14.5
      },
      {
        "w": 2,
        "id": "401856679",
        "hid": "130",
        "aid": "201",
        "n": 0,
        "sp": -1.5
      },
      {
        "w": 2,
        "id": "401856682",
        "hid": "251",
        "aid": "194",
        "n": 0,
        "sp": -1.5
      },
      {
        "w": 2,
        "id": "401856788",
        "hid": "2294",
        "aid": "66",
        "n": 0,
        "sp": -11.5
      },
      {
        "w": 2,
        "id": "401856670",
        "hid": "254",
        "aid": "8",
        "n": 0,
        "sp": -9.5
      }
    ]
  },
  "nfl": {
    "sport": "nfl",
    "week": 1,
    "gamesAt": "2026-09-04",
    "linesAt": "2026-09-04",
    "sources": {
      "fpi": {
        "label": "ESPN FPI",
        "short": "FPI",
        "tier": "model",
        "asOf": "2026-08-31",
        "kind": "ordered",
        "url": "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2026/powerindex",
        "teams": [
          "Los Angeles Rams",
          "Buffalo Bills",
          "Seattle Seahawks",
          "Baltimore Ravens",
          "San Francisco 49ers",
          "Los Angeles Chargers",
          "Green Bay Packers",
          "Detroit Lions",
          "Kansas City Chiefs",
          "Philadelphia Eagles",
          "Dallas Cowboys",
          "Cincinnati Bengals",
          "Houston Texans",
          "New England Patriots",
          "Denver Broncos",
          "Jacksonville Jaguars",
          "Chicago Bears",
          "Tampa Bay Buccaneers",
          "Indianapolis Colts",
          "Minnesota Vikings",
          "Pittsburgh Steelers",
          "Washington Commanders",
          "New York Giants",
          "Atlanta Falcons",
          "New Orleans Saints",
          "Carolina Panthers",
          "Tennessee Titans",
          "Las Vegas Raiders",
          "New York Jets",
          "Cleveland Browns",
          "Arizona Cardinals",
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
        "asOf": "2026 starting ratings",
        "kind": "ordered",
        "url": "https://sagarin.com/sports/nflsend.htm",
        "teams": [
          "Los Angeles Rams",
          "Seattle Seahawks",
          "Buffalo Bills",
          "Baltimore Ravens",
          "Los Angeles Chargers",
          "Kansas City Chiefs",
          "San Francisco 49ers",
          "Philadelphia Eagles",
          "New England Patriots",
          "Detroit Lions",
          "Houston Texans",
          "Denver Broncos",
          "Dallas Cowboys",
          "Green Bay Packers",
          "Cincinnati Bengals",
          "Jacksonville Jaguars",
          "Chicago Bears",
          "Minnesota Vikings",
          "Tampa Bay Buccaneers",
          "Pittsburgh Steelers",
          "Indianapolis Colts",
          "Washington Redskins",
          "New York Giants",
          "Carolina Panthers",
          "Atlanta Falcons",
          "New Orleans Saints",
          "Tennessee Titans",
          "Las Vegas Raiders",
          "Cleveland Browns",
          "New York Jets",
          "Arizona Cardinals",
          "Miami Dolphins"
        ]
      },
      "vegas": {
        "label": "Sportsbook Futures",
        "short": "Vegas",
        "tier": "market",
        "asOf": "2026-09-04",
        "kind": "ordered",
        "url": "https://www.vegasinsider.com/nfl/odds/futures/",
        "teams": [
          "Los Angeles Rams",
          "Buffalo Bills",
          "Baltimore Ravens",
          "Seattle Seahawks",
          "Kansas City Chiefs",
          "Los Angeles Chargers",
          "Philadelphia Eagles",
          "New England Patriots",
          "Houston Texans",
          "San Francisco 49ers",
          "Detroit Lions",
          "Denver Broncos",
          "Cincinnati Bengals",
          "Green Bay Packers",
          "Dallas Cowboys",
          "Chicago Bears",
          "Jacksonville Jaguars",
          "Minnesota Vikings",
          "Tampa Bay Buccaneers",
          "Indianapolis Colts",
          "Pittsburgh Steelers",
          "New York Giants",
          "Washington Commanders",
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
        "asOf": "2026-09-04",
        "kind": "ordered",
        "url": "https://kalshi.com/nfl/power-rankings",
        "teams": [
          "Los Angeles Rams",
          "Buffalo Bills",
          "Baltimore Ravens",
          "Seattle Seahawks",
          "Kansas City Chiefs",
          "Houston Texans",
          "Detroit Lions",
          "Cincinnati Bengals",
          "Los Angeles Chargers",
          "New England Patriots",
          "Philadelphia Eagles",
          "Denver Broncos",
          "San Francisco 49ers",
          "Dallas Cowboys",
          "Green Bay Packers",
          "Chicago Bears",
          "Jacksonville Jaguars",
          "Minnesota Vikings",
          "Tampa Bay Buccaneers",
          "Indianapolis Colts",
          "New Orleans Saints",
          "Pittsburgh Steelers",
          "New York Giants",
          "Washington Commanders",
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
    },
    "games": [],
    "lines": [
      {
        "w": 1,
        "id": "401872656",
        "hid": "26",
        "aid": "17",
        "n": 0,
        "sp": -3.5
      },
      {
        "w": 1,
        "id": "401872657",
        "hid": "14",
        "aid": "25",
        "n": 1,
        "sp": -3.5
      },
      {
        "w": 1,
        "id": "401872925",
        "hid": "4",
        "aid": "27",
        "n": 0,
        "sp": -3.5
      },
      {
        "w": 1,
        "id": "401872923",
        "hid": "8",
        "aid": "18",
        "n": 0,
        "sp": -7
      },
      {
        "w": 1,
        "id": "401872924",
        "hid": "10",
        "aid": "20",
        "n": 0,
        "sp": -1.5
      },
      {
        "w": 1,
        "id": "401872659",
        "hid": "11",
        "aid": "33",
        "n": 0,
        "sp": 3.5
      },
      {
        "w": 1,
        "id": "401872658",
        "hid": "23",
        "aid": "1",
        "n": 0,
        "sp": -3.5
      },
      {
        "w": 1,
        "id": "401872661",
        "hid": "29",
        "aid": "3",
        "n": 0,
        "sp": 2.5
      },
      {
        "w": 1,
        "id": "401872922",
        "hid": "30",
        "aid": "5",
        "n": 0,
        "sp": -7.5
      },
      {
        "w": 1,
        "id": "401872660",
        "hid": "34",
        "aid": "2",
        "n": 0,
        "sp": 1.5
      },
      {
        "w": 1,
        "id": "401872928",
        "hid": "13",
        "aid": "15",
        "n": 0,
        "sp": -3.5
      },
      {
        "w": 1,
        "id": "401872927",
        "hid": "16",
        "aid": "9",
        "n": 0,
        "sp": -1.5
      },
      {
        "w": 1,
        "id": "401872929",
        "hid": "21",
        "aid": "28",
        "n": 0,
        "sp": -5.5
      },
      {
        "w": 1,
        "id": "401872926",
        "hid": "24",
        "aid": "22",
        "n": 0,
        "sp": -10.5
      },
      {
        "w": 1,
        "id": "401872930",
        "hid": "19",
        "aid": "6",
        "n": 0,
        "sp": 2.5
      },
      {
        "w": 1,
        "id": "401872931",
        "hid": "12",
        "aid": "7",
        "n": 0,
        "sp": -3
      },
      {
        "w": 2,
        "id": "401872932",
        "hid": "2",
        "aid": "8",
        "n": 0,
        "sp": -3
      },
      {
        "w": 2,
        "id": "401872933",
        "hid": "1",
        "aid": "29",
        "n": 0,
        "sp": -1.5
      },
      {
        "w": 2,
        "id": "401872937",
        "hid": "3",
        "aid": "16",
        "n": 0,
        "sp": -3.5
      },
      {
        "w": 2,
        "id": "401872939",
        "hid": "10",
        "aid": "21",
        "n": 0,
        "sp": 4.5
      },
      {
        "w": 2,
        "id": "401872946",
        "hid": "17",
        "aid": "23",
        "n": 0,
        "sp": -4.5
      },
      {
        "w": 2,
        "id": "401872936",
        "hid": "20",
        "aid": "9",
        "n": 0,
        "sp": 5.5
      },
      {
        "w": 2,
        "id": "401872935",
        "hid": "27",
        "aid": "5",
        "n": 0,
        "sp": -6.5
      },
      {
        "w": 2,
        "id": "401872938",
        "hid": "33",
        "aid": "18",
        "n": 0,
        "sp": -7.5
      },
      {
        "w": 2,
        "id": "401872934",
        "hid": "34",
        "aid": "4",
        "n": 0,
        "sp": -2.5
      },
      {
        "w": 2,
        "id": "401872940",
        "hid": "7",
        "aid": "30",
        "n": 0,
        "sp": -3
      },
      {
        "w": 2,
        "id": "401872941",
        "hid": "24",
        "aid": "13",
        "n": 0,
        "sp": -8.5
      },
      {
        "w": 2,
        "id": "401872944",
        "hid": "6",
        "aid": "28",
        "n": 0,
        "sp": -4.5
      },
      {
        "w": 2,
        "id": "401872943",
        "hid": "22",
        "aid": "26",
        "n": 0,
        "sp": 10
      },
      {
        "w": 2,
        "id": "401872942",
        "hid": "25",
        "aid": "15",
        "n": 0,
        "sp": -10.5
      },
      {
        "w": 2,
        "id": "401872945",
        "hid": "12",
        "aid": "11",
        "n": 0,
        "sp": -6.5
      },
      {
        "w": 2,
        "id": "401872947",
        "hid": "14",
        "aid": "19",
        "n": 0,
        "sp": -8.5
      }
    ]
  }
};

// Puzzle data for Bracket, the daily bracket of facts. Imported ONLY by the
// server page (app/bracket/page.js), which filters live<=today before passing
// boards to the client.
//
// Sixteen real things (thirty-two on Sunday), ONE comparison metric for the
// whole day, and a single-elimination bracket. The player makes every pick with
// no feedback, and picks propagate exactly like a real pool: advance the wrong
// thing in round one and everything it touches downstream is poisoned.
//
// The item ORDER is the bracket: items 0 and 1 meet, 2 and 3 meet, and their
// winners meet, all the way up. Items are laid out so that first-round matchups
// are routs and the true final is a coin flip, then the tree is scrambled by
// swapping siblings, which preserves who-meets-whom while making sure a slot's
// position never hints at the answer.
//
// LEAK GUARD: no board stores its winners. Every value is public and the client
// recomputes each matchup, exactly as scripts/verify-bracket.mjs does.
//
// Every value was verified against Wikidata with unit normalisation (their
// height field mixes metres and feet) and, for box office, by taking the
// largest statement, since that field sometimes holds a domestic figure.
export const PUZZLES = [
  {
    num: 1, quizId: 'bracket-7-24-26', live: '2026-07-24', dateLabel: 'July 24, 2026', sunday: false,
    metric: 'Which grossed MORE worldwide?', metricShort: 'Bigger box office wins', unit: 'usdm', dir: 'max',
    items: [
      { name: 'Barbie', value: 1345 }, { name: 'Casino Royale', value: 609 },
      { name: 'Mission: Impossible - Fallout', value: 792 }, { name: 'Avengers: Endgame', value: 2798 },
      { name: 'Titanic', value: 1850 }, { name: 'The Sixth Sense', value: 673 },
      { name: 'Gladiator', value: 461 }, { name: 'Joker', value: 1074 },
      { name: 'Avatar', value: 2847 }, { name: 'The Dark Knight', value: 1006 },
      { name: 'The Incredibles', value: 632 }, { name: 'Black Panther', value: 1348 },
      { name: 'Frozen', value: 1282 }, { name: 'Home Alone', value: 477 },
      { name: 'Star Wars: The Force Awakens', value: 2068 }, { name: 'Interstellar', value: 702 },
    ],
  },
  {
    num: 2, quizId: 'bracket-7-25-26', live: '2026-07-25', dateLabel: 'July 25, 2026', sunday: false,
    metric: 'Which is TALLER?', metricShort: 'Taller wins', unit: 'm', dir: 'max',
    items: [
      { name: 'Eiffel Tower', value: 324 }, { name: 'Big Ben', value: 96 },
      { name: 'Hoover Dam', value: 221 }, { name: 'Colosseum', value: 48 },
      { name: 'Sagrada Familia', value: 173 }, { name: 'Ostankino Tower', value: 540 },
      { name: 'Brooklyn Bridge', value: 84 }, { name: 'The Shard', value: 244 },
      { name: 'Petronas Towers', value: 452 }, { name: 'Saturn V', value: 111 },
      { name: 'Leaning Tower of Pisa', value: 58 }, { name: 'Golden Gate Bridge', value: 227 },
      { name: 'Lotte World Tower', value: 556 }, { name: 'Gateway Arch', value: 192 },
      { name: 'Flatiron Building', value: 94 }, { name: 'Transamerica Pyramid', value: 260 },
    ],
  },
  {
    num: 3, quizId: 'bracket-7-26-26', live: '2026-07-26', dateLabel: 'July 26, 2026', sunday: true,
    metric: 'Which is BIGGER by area?', metricShort: 'Bigger wins', unit: 'km2', dir: 'max',
    items: [
      { name: 'Finland', value: 305396 }, { name: 'Belgium', value: 30528 },
      { name: 'Baffin Island', value: 507451 }, { name: 'Ireland', value: 84421 },
      { name: 'California', value: 423970 }, { name: 'Sri Lanka', value: 65610 },
      { name: 'Colombia', value: 1141748 }, { name: 'Bulgaria', value: 110994 },
      { name: 'Germany', value: 357588 }, { name: 'Netherlands', value: 41543 },
      { name: 'Hungary', value: 93036 }, { name: 'France', value: 643801 },
      { name: 'Mongolia', value: 1564116 }, { name: 'Bangladesh', value: 147570 },
      { name: 'Sweden', value: 447425 }, { name: 'Tasmania', value: 68401 },
      { name: 'Switzerland', value: 41285 }, { name: 'Vietnam', value: 331690 },
      { name: 'Portugal', value: 92225 }, { name: 'Thailand', value: 513120 },
      { name: 'South Africa', value: 1221037 }, { name: 'Nepal', value: 147181 },
      { name: 'Iraq', value: 437072 }, { name: 'Lake Victoria', value: 68100 },
      { name: 'Montana', value: 381154 }, { name: 'Croatia', value: 56594 },
      { name: 'South Korea', value: 100295 }, { name: 'Turkey', value: 783562 },
      { name: 'Sumatra', value: 473481 }, { name: 'Hispaniola', value: 77900 },
      { name: 'Italy', value: 302068 }, { name: 'Indonesia', value: 1904570 },
    ],
  },
  {
    num: 4, quizId: 'bracket-7-27-26', live: '2026-07-27', dateLabel: 'July 27, 2026', sunday: false,
    metric: 'Which is FARTHER NORTH?', metricShort: 'Northern wins', unit: 'lat', dir: 'max',
    items: [
      { name: 'Lisbon', value: 38.71 }, { name: 'Singapore', value: 1.3 },
      { name: 'Cairo', value: 30.04 }, { name: 'Auckland', value: -36.85 },
      { name: 'Oslo', value: 59.91 }, { name: 'Kolkata', value: 22.57 },
      { name: 'Cape Town', value: -33.93 }, { name: 'San Francisco', value: 37.78 },
      { name: 'Helsinki', value: 60.17 }, { name: 'Karachi', value: 24.86 },
      { name: 'Athens', value: 37.98 }, { name: 'Lima', value: -12.06 },
      { name: 'Moscow', value: 55.75 }, { name: 'Manila', value: 14.6 },
      { name: 'Buenos Aires', value: -34.6 }, { name: 'Casablanca', value: 33.6 },
    ],
  },
  {
    num: 5, quizId: 'bracket-7-28-26', live: '2026-07-28', dateLabel: 'July 28, 2026', sunday: false,
    metric: 'Which grossed MORE worldwide?', metricShort: 'Bigger box office wins', unit: 'usdm', dir: 'max',
    items: [
      { name: 'Star Wars: The Force Awakens', value: 2068 }, { name: 'The Hunger Games', value: 695 },
      { name: 'Skyfall', value: 1109 }, { name: 'Dune (2021)', value: 402 },
      { name: 'Titanic', value: 1850 }, { name: 'The Incredibles', value: 632 },
      { name: 'Inception', value: 837 }, { name: 'Back to the Future', value: 383 },
      { name: 'Twilight', value: 395 }, { name: 'The Dark Knight', value: 1006 },
      { name: 'Moana', value: 691 }, { name: 'Avengers: Infinity War', value: 2048 },
      { name: 'Beauty and the Beast (1991)', value: 425 }, { name: 'Harry Potter and the Deathly Hallows Part 2', value: 1342 },
      { name: 'Top Gun', value: 357 }, { name: 'Mission: Impossible - Fallout', value: 792 },
    ],
  },
  {
    num: 6, quizId: 'bracket-7-29-26', live: '2026-07-29', dateLabel: 'July 29, 2026', sunday: false,
    metric: 'Which is TALLER?', metricShort: 'Taller wins', unit: 'm', dir: 'max',
    items: [
      { name: 'Sydney Harbour Bridge', value: 134 }, { name: 'Oriental Pearl Tower', value: 468 },
      { name: 'Notre-Dame de Paris', value: 69 }, { name: 'Transamerica Pyramid', value: 260 },
      { name: 'Hoover Dam', value: 221 }, { name: 'Lotte World Tower', value: 556 },
      { name: 'Flatiron Building', value: 94 }, { name: 'John Hancock Center', value: 344 },
      { name: 'Taipei 101', value: 508 }, { name: 'Washington Monument', value: 169 },
      { name: 'Brooklyn Bridge', value: 84 }, { name: 'Eiffel Tower', value: 324 },
      { name: 'Golden Gate Bridge', value: 227 }, { name: 'Shanghai Tower', value: 632 },
      { name: 'Empire State Building', value: 453 }, { name: 'Big Ben', value: 96 },
    ],
  },
  {
    num: 7, quizId: 'bracket-7-30-26', live: '2026-07-30', dateLabel: 'July 30, 2026', sunday: false,
    metric: 'Which is BIGGER by area?', metricShort: 'Bigger wins', unit: 'km2', dir: 'max',
    items: [
      { name: 'Malaysia', value: 330803 }, { name: 'Egypt', value: 1010408 },
      { name: 'Cuba', value: 109884 }, { name: 'Afghanistan', value: 652230 },
      { name: 'Pakistan', value: 881913 }, { name: 'Romania', value: 238397 },
      { name: 'Ireland', value: 84421 }, { name: 'Sweden', value: 447425 },
      { name: 'Ukraine', value: 603550 }, { name: 'Iceland', value: 103004 },
      { name: 'Finland', value: 305396 }, { name: 'Venezuela', value: 912050 },
      { name: 'Montana', value: 381154 }, { name: 'Colombia', value: 1141748 },
      { name: 'Bangladesh', value: 147570 }, { name: 'Chile', value: 756102 },
    ],
  },
  {
    num: 8, quizId: 'bracket-7-31-26', live: '2026-07-31', dateLabel: 'July 31, 2026', sunday: false,
    metric: 'Which is FARTHER NORTH?', metricShort: 'Northern wins', unit: 'lat', dir: 'max',
    items: [
      { name: 'Edinburgh', value: 55.95 }, { name: 'Karachi', value: 24.86 },
      { name: 'Denver', value: 39.74 }, { name: 'Nairobi', value: -1.29 },
      { name: 'Paris', value: 48.86 }, { name: 'Mumbai', value: 19.08 },
      { name: 'Osaka', value: 34.69 }, { name: 'Cape Town', value: -33.93 },
      { name: 'Tunis', value: 36.8 }, { name: 'Perth', value: -31.96 },
      { name: 'Moscow', value: 55.75 }, { name: 'Mexico City', value: 19.35 },
      { name: 'Melbourne', value: -37.81 }, { name: 'Tel Aviv', value: 32.08 },
      { name: 'Bogota', value: 4.61 }, { name: 'New York City', value: 40.71 },
    ],
  },
  {
    num: 9, quizId: 'bracket-8-1-26', live: '2026-08-01', dateLabel: 'August 1, 2026', sunday: false,
    metric: 'Which grossed MORE worldwide?', metricShort: 'Bigger box office wins', unit: 'usdm', dir: 'max',
    items: [
      { name: 'The Matrix', value: 467 }, { name: 'Harry Potter and the Deathly Hallows Part 2', value: 1342 },
      { name: 'Back to the Future', value: 383 }, { name: 'Inception', value: 837 },
      { name: 'Zootopia', value: 1024 }, { name: 'Twilight', value: 395 },
      { name: 'Forrest Gump', value: 678 }, { name: 'Top Gun: Maverick', value: 1444 },
      { name: 'Dune (2021)', value: 402 }, { name: 'Joker', value: 1074 },
      { name: 'Deadpool', value: 783 }, { name: 'The Godfather', value: 270 },
      { name: 'The Sixth Sense', value: 673 }, { name: 'Black Panther', value: 1348 },
      { name: 'Toy Story', value: 394 }, { name: 'Shrek 2', value: 923 },
    ],
  },
  {
    num: 10, quizId: 'bracket-8-2-26', live: '2026-08-02', dateLabel: 'August 2, 2026', sunday: true,
    metric: 'Which is FARTHER NORTH?', metricShort: 'Northern wins', unit: 'lat', dir: 'max',
    items: [
      { name: 'Quito', value: -0.22 }, { name: 'Madrid', value: 40.42 },
      { name: 'Dubai', value: 25.27 }, { name: 'Warsaw', value: 52.23 },
      { name: 'Mumbai', value: 19.08 }, { name: 'Toronto', value: 43.67 },
      { name: 'Buenos Aires', value: -34.6 }, { name: 'Seoul', value: 37.56 },
      { name: 'Kolkata', value: 22.57 }, { name: 'Vancouver', value: 49.26 },
      { name: 'Lisbon', value: 38.71 }, { name: 'Sydney', value: -33.87 },
      { name: 'Accra', value: 5.56 }, { name: 'Chicago', value: 41.88 },
      { name: 'Delhi', value: 28.67 }, { name: 'Stockholm', value: 59.33 },
      { name: 'Vladivostok', value: 43.12 }, { name: 'Manila', value: 14.6 },
      { name: 'Shanghai', value: 31.23 }, { name: 'Reykjavik', value: 64.15 },
      { name: 'Riyadh', value: 24.65 }, { name: 'Kyiv', value: 50.45 },
      { name: 'Beijing', value: 39.9 }, { name: 'Nairobi', value: -1.29 },
      { name: 'San Francisco', value: 37.78 }, { name: 'Cape Town', value: -33.93 },
      { name: 'Mexico City', value: 19.35 }, { name: 'Paris', value: 48.86 },
      { name: 'Moscow', value: 55.75 }, { name: 'Miami', value: 25.78 },
      { name: 'New York City', value: 40.71 }, { name: 'Singapore', value: 1.3 },
    ],
  },
  {
    num: 11, quizId: 'bracket-8-3-26', live: '2026-08-03', dateLabel: 'August 3, 2026', sunday: false,
    metric: 'Which is TALLER?', metricShort: 'Taller wins', unit: 'm', dir: 'max',
    items: [
      { name: 'Ulm Minster', value: 162 }, { name: 'Empire State Building', value: 453 },
      { name: 'Leaning Tower of Pisa', value: 58 }, { name: 'The Shard', value: 244 },
      { name: 'John Hancock Center', value: 344 }, { name: 'Saturn V', value: 111 },
      { name: 'Space Needle', value: 184 }, { name: 'CN Tower', value: 553 },
      { name: 'Willis Tower', value: 442 }, { name: 'London Eye', value: 135 },
      { name: 'Christ the Redeemer', value: 30 }, { name: 'Hoover Dam', value: 221 },
      { name: 'Washington Monument', value: 169 }, { name: 'One World Trade Center', value: 546 },
      { name: 'Chrysler Building', value: 319 }, { name: 'Atomium', value: 102 },
    ],
  },
  {
    num: 12, quizId: 'bracket-8-4-26', live: '2026-08-04', dateLabel: 'August 4, 2026', sunday: false,
    metric: 'Which is BIGGER by area?', metricShort: 'Bigger wins', unit: 'km2', dir: 'max',
    items: [
      { name: 'New Zealand', value: 268021 }, { name: 'Ukraine', value: 603550 },
      { name: 'Hokkaido', value: 77984 }, { name: 'Montana', value: 381154 },
      { name: 'Iran', value: 1648195 }, { name: 'Philippines', value: 343448 },
      { name: 'Greece', value: 131957 }, { name: 'Sumatra', value: 473481 },
      { name: 'California', value: 423970 }, { name: 'Ireland', value: 84421 },
      { name: 'Egypt', value: 1010408 }, { name: 'Poland', value: 312683 },
      { name: 'Germany', value: 357588 }, { name: 'Mexico', value: 1972550 },
      { name: 'Spain', value: 505990 }, { name: 'Nepal', value: 147181 },
    ],
  },
  {
    num: 13, quizId: 'bracket-8-5-26', live: '2026-08-05', dateLabel: 'August 5, 2026', sunday: false,
    metric: 'Which is FARTHER NORTH?', metricShort: 'Northern wins', unit: 'lat', dir: 'max',
    items: [
      { name: 'Athens', value: 37.98 }, { name: 'Mumbai', value: 19.08 },
      { name: 'Delhi', value: 28.67 }, { name: 'Berlin', value: 52.52 },
      { name: 'Jakarta', value: -6.18 }, { name: 'Seoul', value: 37.56 },
      { name: 'Seattle', value: 47.61 }, { name: 'Hong Kong', value: 22.28 },
      { name: 'Kuala Lumpur', value: 3.15 }, { name: 'San Francisco', value: 37.78 },
      { name: 'Kolkata', value: 22.57 }, { name: 'Paris', value: 48.86 },
      { name: 'Santiago', value: -33.44 }, { name: 'Houston', value: 29.76 },
      { name: 'Mexico City', value: 19.35 }, { name: 'Rome', value: 41.89 },
    ],
  },
  {
    num: 14, quizId: 'bracket-8-6-26', live: '2026-08-06', dateLabel: 'August 6, 2026', sunday: false,
    metric: 'Which is BIGGER by area?', metricShort: 'Bigger wins', unit: 'km2', dir: 'max',
    items: [
      { name: 'Greenland', value: 2166086 }, { name: 'Malaysia', value: 330803 },
      { name: 'Texas', value: 696241 }, { name: 'Hokkaido', value: 77984 },
      { name: 'Iceland', value: 103004 }, { name: 'South Africa', value: 1221037 },
      { name: 'Iraq', value: 437072 }, { name: 'Denmark', value: 42925 },
      { name: 'Nigeria', value: 923768 }, { name: 'Austria', value: 83858 },
      { name: 'Montana', value: 381154 }, { name: 'Netherlands', value: 41543 },
      { name: 'Morocco', value: 446550 }, { name: 'Lake Michigan', value: 57750 },
      { name: 'Alaska', value: 1717856 }, { name: 'Bangladesh', value: 147570 },
    ],
  },
];

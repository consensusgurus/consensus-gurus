// Puzzle data for Cipher, the daily cryptarithm. Imported ONLY by the server
// page (app/cipher/page.js), which filters live<=today before passing puzzles
// to the client — future equations never ship early.
//
// Each puzzle carries an `op`: "add" (WORD + WORD = WORD) or "sub"
// (WORD - WORD = WORD). Both are solvable by pure column logic with no
// guessing; multiplication was removed for exactly that reason (a word product
// cannot be cracked by columns alone). VARIETY RULE (from 2026-07-25): the
// operation never repeats two days in a row, which with two ops means strict
// daily add/sub alternation. The Sunday Edition is a bigger three-term puzzle
// in whichever op the day lands on: three-addend addition (SNOW + MOON + NOON
// = STORM) or three-term subtraction (SLEET - SNOW - NOON = SOON). Drops before
// 2026-07-25 are all addition and grandfathered (already live and played).
//
// Every equation here is MACHINE-VERIFIED to have exactly one solution
// (distinct digits per letter, leading letters nonzero). The solution is not
// stored anywhere — the client checks the arithmetic directly. Validate with
// scripts/verify-cipher.mjs after ANY edit: it brute-forces every equation and
// fails unless each has exactly one solution, <= 10 distinct letters, the op is
// add or sub (never mul), and the op never repeats on consecutive days (from
// the variety-launch date on).
export const PUZZLES = [
  { num: 1, quizId: "cipher-7-18-26", live: "2026-07-18", dateLabel: "July 18, 2026", sunday: false, op: "add", lhs: ["SEND","MORE"], rhs: "MONEY" },
  { num: 2, quizId: "cipher-7-19-26", live: "2026-07-19", dateLabel: "July 19, 2026", sunday: false, op: "add", lhs: ["FIFTY","STATES"], rhs: "AMERICA" },
  { num: 3, quizId: "cipher-7-20-26", live: "2026-07-20", dateLabel: "July 20, 2026", sunday: false, op: "add", lhs: ["EAT","THAT"], rhs: "APPLE" },
  { num: 4, quizId: "cipher-7-21-26", live: "2026-07-21", dateLabel: "July 21, 2026", sunday: false, op: "add", lhs: ["BASE","BALL"], rhs: "GAMES" },
  { num: 5, quizId: "cipher-7-22-26", live: "2026-07-22", dateLabel: "July 22, 2026", sunday: false, op: "add", lhs: ["SEA","REEF"], rhs: "WHALE" },
  { num: 6, quizId: "cipher-7-23-26", live: "2026-07-23", dateLabel: "July 23, 2026", sunday: false, op: "add", lhs: ["COCA","COLA"], rhs: "OASIS" },
  { num: 7, quizId: "cipher-7-24-26", live: "2026-07-24", dateLabel: "July 24, 2026", sunday: false, op: "add", lhs: ["BEAR","DEER"], rhs: "ZEBRA" },
  { num: 8, quizId: "cipher-7-25-26", live: "2026-07-25", dateLabel: "July 25, 2026", sunday: false, op: "sub", lhs: ["GRAPE","APPLE"], rhs: "PEAR" },
  { num: 9, quizId: "cipher-7-26-26", live: "2026-07-26", dateLabel: "July 26, 2026", sunday: true, op: "add", lhs: ["SNOW","MOON","NOON"], rhs: "STORM" },
  { num: 10, quizId: "cipher-7-27-26", live: "2026-07-27", dateLabel: "July 27, 2026", sunday: false, op: "sub", lhs: ["EAGLE","GRAPE"], rhs: "ZEBRA" },
  { num: 11, quizId: "cipher-7-28-26", live: "2026-07-28", dateLabel: "July 28, 2026", sunday: false, op: "add", lhs: ["CROSS","ROADS"], rhs: "DANGER" },
  { num: 12, quizId: "cipher-7-29-26", live: "2026-07-29", dateLabel: "July 29, 2026", sunday: false, op: "sub", lhs: ["TIGER","GRAPE"], rhs: "EARTH" },
  { num: 13, quizId: "cipher-7-30-26", live: "2026-07-30", dateLabel: "July 30, 2026", sunday: false, op: "add", lhs: ["MIST","FROST"], rhs: "WINTER" },
  { num: 14, quizId: "cipher-7-31-26", live: "2026-07-31", dateLabel: "July 31, 2026", sunday: false, op: "sub", lhs: ["BREAD","APPLE"], rhs: "PLAZA" },
  { num: 15, quizId: "cipher-8-1-26", live: "2026-08-01", dateLabel: "August 1, 2026", sunday: false, op: "add", lhs: ["HONEY","MELON"], rhs: "CREAM" },
  { num: 16, quizId: "cipher-8-2-26", live: "2026-08-02", dateLabel: "August 2, 2026", sunday: true, op: "sub", lhs: ["SLEET","SNOW","NOON"], rhs: "SOON" },
  { num: 17, quizId: "cipher-8-3-26", live: "2026-08-03", dateLabel: "August 3, 2026", sunday: false, op: "add", lhs: ["GREEN","ORANGE"], rhs: "COLORS" },
  { num: 18, quizId: "cipher-8-4-26", live: "2026-08-04", dateLabel: "August 4, 2026", sunday: false, op: "sub", lhs: ["MANGO","LIME"], rhs: "MILE" },
  { num: 19, quizId: "cipher-8-5-26", live: "2026-08-05", dateLabel: "August 5, 2026", sunday: false, op: "add", lhs: ["PARK","PLAZA"], rhs: "STREET" },
  { num: 20, quizId: "cipher-8-6-26", live: "2026-08-06", dateLabel: "August 6, 2026", sunday: false, op: "sub", lhs: ["SHORE","FISH"], rhs: "FRIES" },
  { num: 21, quizId: "cipher-8-7-26", live: "2026-08-07", dateLabel: "August 7, 2026", sunday: false, op: "add", lhs: ["OLIVE","ROCK"], rhs: "RIVER" },
  { num: 22, quizId: "cipher-8-8-26", live: "2026-08-08", dateLabel: "August 8, 2026", sunday: false, op: "sub", lhs: ["WHALE","SALAD"], rhs: "SEED" },
  { num: 23, quizId: "cipher-8-9-26", live: "2026-08-09", dateLabel: "August 9, 2026", sunday: true, op: "add", lhs: ["SNOW","MOSS","TREE"], rhs: "ROOTS" },
  { num: 24, quizId: "cipher-8-10-26", live: "2026-08-10", dateLabel: "August 10, 2026", sunday: false, op: "sub", lhs: ["SHARK","BREAD"], rhs: "HORSE" },
  { num: 25, quizId: "cipher-8-11-26", live: "2026-08-11", dateLabel: "August 11, 2026", sunday: false, op: "add", lhs: ["APPLE","GRAPE"], rhs: "CHERRY" },
  { num: 26, quizId: "cipher-8-12-26", live: "2026-08-12", dateLabel: "August 12, 2026", sunday: false, op: "sub", lhs: ["SUGAR","TOAST"], rhs: "SONG" },
  { num: 27, quizId: "cipher-8-13-26", live: "2026-08-13", dateLabel: "August 13, 2026", sunday: false, op: "add", lhs: ["SATURN","URANUS"], rhs: "PLANETS" },
  { num: 28, quizId: "cipher-8-14-26", live: "2026-08-14", dateLabel: "August 14, 2026", sunday: false, op: "sub", lhs: ["MONEY","LEMON"], rhs: "WOLF" },
  { num: 29, quizId: "cipher-8-15-26", live: "2026-08-15", dateLabel: "August 15, 2026", sunday: false, op: "add", lhs: ["CRAB","RACE"], rhs: "BACON" },
  { num: 30, quizId: "cipher-8-16-26", live: "2026-08-16", dateLabel: "August 16, 2026", sunday: true, op: "sub", lhs: ["GEESE","SNOW","SOON"], rhs: "SEEN" },
  { num: 31, quizId: "cipher-8-17-26", live: "2026-08-17", dateLabel: "August 17, 2026", sunday: false, op: "add", lhs: ["TUNE","SONG"], rhs: "NOTES" },
  { num: 32, quizId: "cipher-8-18-26", live: "2026-08-18", dateLabel: "August 18, 2026", sunday: false, op: "sub", lhs: ["ONION","APPLE"], rhs: "LANE" },
  { num: 33, quizId: "cipher-8-19-26", live: "2026-08-19", dateLabel: "August 19, 2026", sunday: false, op: "add", lhs: ["SPOON","STAIR"], rhs: "HEARTH" },
  { num: 34, quizId: "cipher-8-20-26", live: "2026-08-20", dateLabel: "August 20, 2026", sunday: false, op: "sub", lhs: ["HEARTH","SHELF"], rhs: "CELLAR" },
  { num: 35, quizId: "cipher-8-21-26", live: "2026-08-21", dateLabel: "August 21, 2026", sunday: false, op: "add", lhs: ["ATTIC","CHAIR"], rhs: "HEARTH" },
  { num: 36, quizId: "cipher-8-22-26", live: "2026-08-22", dateLabel: "August 22, 2026", sunday: false, op: "sub", lhs: ["CANDLE","CLOTH"], rhs: "LINEN" },
  { num: 37, quizId: "cipher-8-23-26", live: "2026-08-23", dateLabel: "August 23, 2026", sunday: true, op: "add", lhs: ["HOUR","SUMMER","MONTH"], rhs: "MINUTE" },
  { num: 38, quizId: "cipher-8-24-26", live: "2026-08-24", dateLabel: "August 24, 2026", sunday: false, op: "sub", lhs: ["OTTER","HARE"], rhs: "STOAT" },
  { num: 39, quizId: "cipher-8-25-26", live: "2026-08-25", dateLabel: "August 25, 2026", sunday: false, op: "add", lhs: ["DEER","OTTER"], rhs: "HORSE" },
  { num: 40, quizId: "cipher-8-26-26", live: "2026-08-26", dateLabel: "August 26, 2026", sunday: false, op: "sub", lhs: ["WINTER","MONTH"], rhs: "NIGHT" },
  { num: 41, quizId: "cipher-8-27-26", live: "2026-08-27", dateLabel: "August 27, 2026", sunday: false, op: "add", lhs: ["GLASS","STOVE"], rhs: "HEARTH" },
  { num: 42, quizId: "cipher-8-28-26", live: "2026-08-28", dateLabel: "August 28, 2026", sunday: false, op: "sub", lhs: ["HEARTH","GLASS"], rhs: "STAIR" },
  { num: 43, quizId: "cipher-8-29-26", live: "2026-08-29", dateLabel: "August 29, 2026", sunday: false, op: "add", lhs: ["PEAR","GRAPE"], rhs: "ONION" },
  { num: 44, quizId: "cipher-8-30-26", live: "2026-08-30", dateLabel: "August 30, 2026", sunday: true, op: "sub", lhs: ["SOLAR","DAWN","SNOW"], rhs: "SUN" },
  { num: 45, quizId: "cipher-8-31-26", live: "2026-08-31", dateLabel: "August 31, 2026", sunday: false, op: "add", lhs: ["STAIR","GLASS"], rhs: "HEARTH" },
  { num: 46, quizId: "cipher-9-1-26", live: "2026-09-01", dateLabel: "September 1, 2026", sunday: false, op: "sub", lhs: ["HEARTH","STAIR"], rhs: "SPOON" },
  { num: 47, quizId: "cipher-9-2-26", live: "2026-09-02", dateLabel: "September 2, 2026", sunday: false, op: "add", lhs: ["MIST","ORBIT"], rhs: "STORM" },
  { num: 48, quizId: "cipher-9-3-26", live: "2026-09-03", dateLabel: "September 3, 2026", sunday: false, op: "sub", lhs: ["HORSE","DEER"], rhs: "OTTER" },
  { num: 49, quizId: "cipher-9-4-26", live: "2026-09-04", dateLabel: "September 4, 2026", sunday: false, op: "add", lhs: ["GOOSE","HARE"], rhs: "BADGER" },
  { num: 50, quizId: "cipher-9-5-26", live: "2026-09-05", dateLabel: "September 5, 2026", sunday: false, op: "sub", lhs: ["HEARTH","BROOM"], rhs: "DOOR" },
  { num: 51, quizId: "cipher-9-6-26", live: "2026-09-06", dateLabel: "September 6, 2026", sunday: true, op: "add", lhs: ["THORN","CEDAR","ACORN"], rhs: "SHOOT" },
  { num: 52, quizId: "cipher-9-7-26", live: "2026-09-07", dateLabel: "September 7, 2026", sunday: false, op: "sub", lhs: ["WINTER","NIGHT"], rhs: "MONTH" },
  { num: 53, quizId: "cipher-9-8-26", live: "2026-09-08", dateLabel: "September 8, 2026", sunday: false, op: "add", lhs: ["LINEN","SHELF"], rhs: "HEARTH" },
  { num: 54, quizId: "cipher-9-9-26", live: "2026-09-09", dateLabel: "September 9, 2026", sunday: false, op: "sub", lhs: ["CREAM","HONEY"], rhs: "MELON" },
  { num: 55, quizId: "cipher-9-10-26", live: "2026-09-10", dateLabel: "September 10, 2026", sunday: false, op: "add", lhs: ["CANDLE","LINEN"], rhs: "HEARTH" },
  { num: 56, quizId: "cipher-9-11-26", live: "2026-09-11", dateLabel: "September 11, 2026", sunday: false, op: "sub", lhs: ["GOOSE","OTTER"], rhs: "BEAR" },
  { num: 57, quizId: "cipher-9-12-26", live: "2026-09-12", dateLabel: "September 12, 2026", sunday: false, op: "add", lhs: ["TOWER","CLOCK"], rhs: "MARKET" },
  { num: 58, quizId: "cipher-9-13-26", live: "2026-09-13", dateLabel: "September 13, 2026", sunday: true, op: "sub", lhs: ["BRIDGE","LANE","BARN"], rhs: "ALLEY" },
  { num: 59, quizId: "cipher-9-14-26", live: "2026-09-14", dateLabel: "September 14, 2026", sunday: false, op: "add", lhs: ["GUIDE","RIDGE"], rhs: "VALLEY" },
  { num: 60, quizId: "cipher-9-15-26", live: "2026-09-15", dateLabel: "September 15, 2026", sunday: false, op: "sub", lhs: ["CHURCH","SHOP"], rhs: "TOWER" },
  { num: 61, quizId: "cipher-9-16-26", live: "2026-09-16", dateLabel: "September 16, 2026", sunday: false, op: "add", lhs: ["DAWN","SNOW"], rhs: "SOLAR" },
  { num: 62, quizId: "cipher-9-17-26", live: "2026-09-17", dateLabel: "September 17, 2026", sunday: false, op: "sub", lhs: ["MINUTE","HOUR"], rhs: "SUMMER" },
  { num: 63, quizId: "cipher-9-18-26", live: "2026-09-18", dateLabel: "September 18, 2026", sunday: false, op: "add", lhs: ["SEED","TREE"], rhs: "ROOT" },
  { num: 64, quizId: "cipher-9-19-26", live: "2026-09-19", dateLabel: "September 19, 2026", sunday: false, op: "sub", lhs: ["MARKET","TOWER"], rhs: "CLOCK" },
  { num: 65, quizId: "cipher-9-20-26", live: "2026-09-20", dateLabel: "September 20, 2026", sunday: true, op: "add", lhs: ["MINUTE","SUMMER","NOON"], rhs: "AUTUMN" },
  { num: 66, quizId: "cipher-9-21-26", live: "2026-09-21", dateLabel: "September 21, 2026", sunday: false, op: "sub", lhs: ["HEARTH","STAIR"], rhs: "GLASS" },
  { num: 67, quizId: "cipher-9-22-26", live: "2026-09-22", dateLabel: "September 22, 2026", sunday: false, op: "add", lhs: ["STOVE","HEARTH"], rhs: "CELLAR" },
  { num: 68, quizId: "cipher-9-23-26", live: "2026-09-23", dateLabel: "September 23, 2026", sunday: false, op: "sub", lhs: ["CHEESE","APPLE"], rhs: "GRAPE" },
  { num: 69, quizId: "cipher-9-24-26", live: "2026-09-24", dateLabel: "September 24, 2026", sunday: false, op: "add", lhs: ["WINTER","AGES"], rhs: "SPRING" },
  { num: 70, quizId: "cipher-9-25-26", live: "2026-09-25", dateLabel: "September 25, 2026", sunday: false, op: "sub", lhs: ["HEARTH","CANDLE"], rhs: "PLATE" },
  { num: 71, quizId: "cipher-9-26-26", live: "2026-09-26", dateLabel: "September 26, 2026", sunday: false, op: "add", lhs: ["STOVE","CELLAR"], rhs: "HEARTH" },
  { num: 72, quizId: "cipher-9-27-26", live: "2026-09-27", dateLabel: "September 27, 2026", sunday: true, op: "sub", lhs: ["MINUTE","ALARM","AUTUMN"], rhs: "LATER" },
  { num: 73, quizId: "cipher-9-28-26", live: "2026-09-28", dateLabel: "September 28, 2026", sunday: false, op: "add", lhs: ["ROOM","BROOM"], rhs: "KETTLE" },
  { num: 74, quizId: "cipher-9-29-26", live: "2026-09-29", dateLabel: "September 29, 2026", sunday: false, op: "sub", lhs: ["HEARTH","SPOON"], rhs: "STAIR" },
];

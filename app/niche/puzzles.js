// Puzzle data for Niche, the daily trivia grid. Imported ONLY by the server
// page (app/niche/page.js), which filters live<=today before handing puzzles
// to the client, so future boards never reach a browser.
//
// A board is three row attributes and three column attributes (four each on
// the Sunday Edition) from one universe in app/niche/facts.js; the ids here
// resolve against that file's attribute registry, which is also what the
// client judges picks by. The universe follows the day of the week: Sunday
// Countries (the 4x4 Edition), Monday US States, Tuesday Animals, Wednesday
// Movies, Thursday TV Shows, Friday Pro Sports Teams, Saturday Musicians.
//
// EVERY board is proven before banking: each cell holds at least 3 valid
// answers, the whole board admits a full set of DISTINCT answers, at least
// one cell is tight (2+ on Sunday), at most 2 attributes carry over from that
// universe's previous board, and none appears more than 3 times per universe
// across the bank.
//
// Do NOT hand-edit a board here. Regenerate with scripts/gen-niche.mjs and
// re-run scripts/verify-niche.mjs.
export const PUZZLES = [
  {"num":1,"quizId":"niche-8-20-26","live":"2026-08-20","dateLabel":"August 20, 2026","sunday":false,"universe":"tv","rows":["nyc","emmy","n-h"],"cols":["one","dec-10s","str"]},
  {"num":2,"quizId":"niche-8-21-26","live":"2026-08-21","dateLabel":"August 21, 2026","sunday":false,"universe":"teams","rows":["lg-nfl","animal","lg-nba"],"cols":["champ","old","ca"]},
  {"num":3,"quizId":"niche-8-22-26","live":"2026-08-22","dateLabel":"August 22, 2026","sunday":false,"universe":"musicians","rows":["us","aoty","band"],"cols":["n-s","one","hall"]},
  {"num":4,"quizId":"niche-8-23-26","live":"2026-08-23","dateLabel":"August 23, 2026","sunday":true,"universe":"countries","rows":["ll","oly","eu","cont-eu"],"cols":["b-france","b-germany","b5","cap-b"]},
  {"num":5,"quizId":"niche-8-24-26","live":"2026-08-24","dateLabel":"August 24, 2026","sunday":false,"universe":"states","rows":["cap-s","can","dbl"],"cols":["pop5","inland","west"]},
  {"num":6,"quizId":"niche-8-25-26","live":"2026-08-25","dateLabel":"August 25, 2026","sunday":false,"universe":"animals","rows":["sea","dom","fly"],"cols":["eggs","hunt","afr"]},
  {"num":7,"quizId":"niche-8-26-26","live":"2026-08-26","dateLabel":"August 26, 2026","sunday":false,"universe":"movies","rows":["dec-90s","one","dec-20s"],"cols":["fr","bp","r"]},
  {"num":8,"quizId":"niche-8-27-26","live":"2026-08-27","dateLabel":"August 27, 2026","sunday":false,"universe":"tv","rows":["ten","n-s","nyc"],"cols":["emmy","dec-90s","dec-00s"]},
  {"num":9,"quizId":"niche-8-28-26","live":"2026-08-28","dateLabel":"August 28, 2026","sunday":false,"universe":"teams","rows":["n-t","lg-mlb","n-s"],"cols":["animal","champ","city2"]},
  {"num":10,"quizId":"niche-8-29-26","live":"2026-08-29","dateLabel":"August 29, 2026","sunday":false,"universe":"musicians","rows":["solo","n-b","n-d"],"cols":["uk","fem","hall"]},
  {"num":11,"quizId":"niche-8-30-26","live":"2026-08-30","dateLabel":"August 30, 2026","sunday":true,"universe":"countries","rows":["n-m","isl","cap-p","ll"],"cols":["cont-as","cont-eu","cont-af","tiny"]},
  {"num":12,"quizId":"niche-8-31-26","live":"2026-08-31","dateLabel":"August 31, 2026","sunday":false,"universe":"states","rows":["dbl","pop2","multi"],"cols":["west","oc","col"]},
  {"num":13,"quizId":"niche-9-1-26","live":"2026-09-01","dateLabel":"September 1, 2026","sunday":false,"universe":"animals","rows":["bird","legs4","aqua"],"cols":["n-c","dom","hunt"]},
  {"num":14,"quizId":"niche-9-2-26","live":"2026-09-02","dateLabel":"September 2, 2026","sunday":false,"universe":"movies","rows":["n-b","n-c","bil"],"cols":["fr","dec-00s","dec-10s"]},
  {"num":15,"quizId":"niche-9-3-26","live":"2026-09-03","dateLabel":"September 3, 2026","sunday":false,"universe":"tv","rows":["dec-old","dec-20s","dec-10s"],"cols":["one","n-s","emmy"]},
  {"num":16,"quizId":"niche-9-4-26","live":"2026-09-04","dateLabel":"September 4, 2026","sunday":false,"universe":"teams","rows":["city2","nos","old"],"cols":["champ","lg-nba","lg-nhl"]},
  {"num":17,"quizId":"niche-9-5-26","live":"2026-09-05","dateLabel":"September 5, 2026","sunday":false,"universe":"musicians","rows":["n-n","n-a","us"],"cols":["one","band","solo"]},
  {"num":18,"quizId":"niche-9-6-26","live":"2026-09-06","dateLabel":"September 6, 2026","sunday":true,"universe":"countries","rows":["cont-af","oly","isl","b5"],"cols":["cap-m","pop100","multi","n-s"]},
  {"num":19,"quizId":"niche-9-7-26","live":"2026-09-07","dateLabel":"September 7, 2026","sunday":false,"universe":"states","rows":["endsa","y1700s","inland"],"cols":["pop2","pop5","can"]},
  {"num":20,"quizId":"niche-9-8-26","live":"2026-09-08","dateLabel":"September 8, 2026","sunday":false,"universe":"animals","rows":["afr","eggs","legs4"],"cols":["n-a","n-g","aqua"]},
  {"num":21,"quizId":"niche-9-9-26","live":"2026-09-09","dateLabel":"September 9, 2026","sunday":false,"universe":"movies","rows":["n-t","n-s","dec-00s"],"cols":["ani","fr","r"]},
  {"num":22,"quizId":"niche-9-10-26","live":"2026-09-10","dateLabel":"September 10, 2026","sunday":false,"universe":"tv","rows":["dec-90s","dec-old","dec-00s"],"cols":["one","nyc","ten"]},
  {"num":23,"quizId":"niche-9-11-26","live":"2026-09-11","dateLabel":"September 11, 2026","sunday":false,"universe":"teams","rows":["old","n-m","ca"],"cols":["lg-mlb","animal","lg-nba"]},
  {"num":24,"quizId":"niche-9-12-26","live":"2026-09-12","dateLabel":"September 12, 2026","sunday":false,"universe":"musicians","rows":["n-k","aoty","n-b"],"cols":["solo","fem","us"]},
  {"num":25,"quizId":"niche-9-13-26","live":"2026-09-13","dateLabel":"September 13, 2026","sunday":true,"universe":"countries","rows":["eu","tiny","cont-as","south"],"cols":["isl","cap-b","ll","n-s"]},
  {"num":26,"quizId":"niche-9-14-26","live":"2026-09-14","dateLabel":"September 14, 2026","sunday":false,"universe":"states","rows":["col","lakes","riv"],"cols":["endsa","pop5","dbl"]},
  {"num":27,"quizId":"niche-9-15-26","live":"2026-09-15","dateLabel":"September 15, 2026","sunday":false,"universe":"animals","rows":["bug","n-c","dom"],"cols":["fly","eggs","hunt"]},
  {"num":28,"quizId":"niche-9-16-26","live":"2026-09-16","dateLabel":"September 16, 2026","sunday":false,"universe":"movies","rows":["dec-10s","n-m","n-d"],"cols":["one","fr","r"]},
  {"num":29,"quizId":"niche-9-17-26","live":"2026-09-17","dateLabel":"September 17, 2026","sunday":false,"universe":"tv","rows":["dec-90s","dec-20s","str"],"cols":["emmy","one","n-s"]},
  {"num":30,"quizId":"niche-9-18-26","live":"2026-09-18","dateLabel":"September 18, 2026","sunday":false,"universe":"teams","rows":["n-t","fl","ca"],"cols":["animal","city2","champ"]},
  {"num":31,"quizId":"niche-9-19-26","live":"2026-09-19","dateLabel":"September 19, 2026","sunday":false,"universe":"musicians","rows":["uk","band","aoty"],"cols":["one","hall","n-b"]},
  {"num":32,"quizId":"niche-9-20-26","live":"2026-09-20","dateLabel":"September 20, 2026","sunday":true,"universe":"countries","rows":["n-c","b-russia","cap-s","hasz"],"cols":["ll","b5","cont-as","cont-eu"]},
  {"num":33,"quizId":"niche-9-21-26","live":"2026-09-21","dateLabel":"September 21, 2026","sunday":false,"universe":"states","rows":["n-m","endsa","inland"],"cols":["can","west","pop5"]},
  {"num":34,"quizId":"niche-9-22-26","live":"2026-09-22","dateLabel":"September 22, 2026","sunday":false,"universe":"animals","rows":["dom","afr","n-w"],"cols":["hunt","big","legs4"]},
  {"num":35,"quizId":"niche-9-23-26","live":"2026-09-23","dateLabel":"September 23, 2026","sunday":false,"universe":"movies","rows":["dec-old","dec-90s","r"],"cols":["one","bp","n-g"]},
  {"num":36,"quizId":"niche-9-24-26","live":"2026-09-24","dateLabel":"September 24, 2026","sunday":false,"universe":"tv","rows":["str","dec-00s","ten"],"cols":["nyc","n-s","n-b"]},
  {"num":37,"quizId":"niche-9-25-26","live":"2026-09-25","dateLabel":"September 25, 2026","sunday":false,"universe":"teams","rows":["n-s","lg-nba","old"],"cols":["allit","ca","city2"]},
  {"num":38,"quizId":"niche-9-26-26","live":"2026-09-26","dateLabel":"September 26, 2026","sunday":false,"universe":"musicians","rows":["fem","n-c","n-r"],"cols":["one","hall","us"]},
  {"num":39,"quizId":"niche-9-27-26","live":"2026-09-27","dateLabel":"September 27, 2026","sunday":true,"universe":"countries","rows":["n-s","oly","multi","cap-b"],"cols":["isl","cont-eu","cont-na","cont-as"]},
];

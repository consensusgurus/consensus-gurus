# Source of Truths — Quiz Creation Rules

Companion to CLAUDE.md. That file governs **lists** (the Borda-consensus system in `lib/data.js`).
This file governs **quizzes** (`lib/quizzes.js` and the `/quiz/[id]` boards). If you are adding,
editing, or fixing a quiz, the rules below apply. When the two files disagree about quizzes, this file wins.

---

## 0. The one rule that matters most: never ship generated data you have not verified

Quizzes are full of data that is easy to fabricate plausibly and get wrong silently: map coordinates,
answer strings, capitals, aerial framings, image URLs. A wrong list entry looks wrong in review; a wrong
quiz coordinate renders a confident, broken question that no player can answer.

**Do not trust from-memory coordinates, capitals, or place data. Verify before shipping.** Specifically:

- Any quiz that renders a **map, aerial, satellite image, or geographic pin** must have every coordinate
  visually confirmed before it is staged for push. Geocode from an authoritative source (OpenStreetMap /
  Nominatim, Overpass), then **look at the actual rendered image for every item**, not a sample.
- Facts like capitals, "which major is hosted here," years, and rankings must come from a checked source,
  not recall. If you would not bet the deploy on it, look it up.

This rule exists because it was learned the hard way: a 62-course aerial quiz shipped with ~15 coordinates
that landed on water, farmland, or the wrong city, because they were set from memory and never eyeballed.

### How to visually verify map/aerial coordinates (the proven workflow)

1. **Geocode.** For each place, query Nominatim
   (`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=...`) for an authoritative
   lat/lon. Prefer results whose `type` is the thing you want (e.g. `golf_course`). Nominatim can still
   mismatch (return a same-named place elsewhere), so sanity-check the distance from your rough guess and
   discard wild outliers.
2. **Render a contact sheet.** Build the real image URLs and view them. The container sandbox usually
   cannot reach the imagery host, and fetching URLs with curl/python is disallowed, so use the connected
   Chrome: navigate to any ordinary https page, then inject the grid of `<img>` tags with
   `javascript_tool` (Chrome blocks `file://` and top-level `data:` navigation). Screenshot and read it.
3. **Eyeball every tile.** Confirm each one actually shows the subject (a golf course, not a marina).
   Coastal/links courses legitimately include sand and water; a tile that is *mostly* water or city is wrong.
4. **Fix and re-render** the failures with corrected coordinates until the whole sheet is right. Only then
   stage the file. Keep the coordinates in the generator so a future nudge is one line.

Esri World Imagery is the house satellite source (the `geo-aerial` quizzes already use it). A single
straight-down image for a bbox comes from its `export` endpoint:
`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=<xmin,ymin,xmax,ymax>&bboxSR=3857&imageSR=3857&size=1000,1000&format=jpg&f=image`.
Use Web Mercator (3857) with a square bbox for an undistorted image; frame a championship course at roughly
1.5–1.8 km across and widen for sprawling or multi-course sites.

---

## 1. Where quizzes live and how they ship

- **Definitions:** `lib/quizzes.js` (one big `QUIZZES` array, `getQuiz()` at the bottom). Insert new quiz
  objects immediately before the closing `];` marker.
- **Boards:** `app/quiz/[id]/*Board.jsx` / `QuizClient.jsx`, keyed off each quiz's `format`.
- **Deploy path (this environment):** the cloud sandbox **cannot push to GitHub** (proxy blocks it). Build
  and validate in the cloud clone, then stage the changed files onto the user's GitHub Desktop clone at
  `C:\dev\sot-live` (via SendUserFile + `device_commit_files`); the user commits and pushes there. Vercel
  builds on push. Do not attempt PAT/token pushes from the sandbox; they are dead here.
- Local commits in the cloud clone are only for a clean working tree. The stop-hook may flag an older
  owner commit (e.g. `consensusgurus@gmail.com`) as "unverified" — that is the user's own pushed commit;
  **do not rewrite it.**

## 2. The registration checklist (every NEW quiz, every time)

1. **Department:** add an id → dept entry in `lib/quiz-departments.js` (usually `'geography'`, `'sports'`,
   etc.). The id-heuristic fallback is not a substitute; add the explicit entry.
2. **Hero image:** the **newest** quiz (latest `publishedAt`) must have a hero in `lib/quiz-heroes.js`, or
   the featured slots fall back to a department photo. Register a hero for anything that could be newest or
   land in a featured slot. Every hero `src` must be a JPEG or PNG (never WebP/AVIF).
3. **`publishedAt` and newest-order:** stamp `publishedAt` with a real `date -u` captured at build time,
   in the past relative to now (a future timestamp hides the quiz until then). Give each quiz in a batch a
   distinct time. If you intend a quiz to be the newest, confirm no existing quiz has a later `publishedAt`.
4. **Validate:** `node --check lib/quizzes.js`; then load it
   (`node --input-type=module -e "import('./lib/quizzes.js')..."`) and confirm the new ids resolve, counts
   are right, and there are **no holes** (`undefined` array elements from a botched edit). If you touched a
   `.jsx` board, validate it with esbuild via stdin (`esbuild --loader=jsx --format=esm < file`), since
   `node --check` cannot parse JSX.
5. **Stage** the changed files to `C:\dev\sot-live` and tell the user exactly which files to commit.

## 3. Answer-key hygiene (keys are substring-matched)

The board matchers treat a key as a hit if the typed guess **contains** the normalized key
(`guess.includes(key)`), and a run can end if a typed value exactly equals a *different* item's candidate.
So:

- **No generic or ultra-short keys.** `tpc`, `riv`, `old`, bare `stadium course` collide across items.
- **No key shared by two answers** in the same quiz.
- After building a quiz, run a programmatic collision scan: for every key, list which answers it matches;
  fail the build if any key maps to more than one answer or is a substring of another answer's name/key.

## 4. Format quick-reference (`format` field → board)

- `type-it` / `bank` — name-them-all; `answers:[{t,keys}]` (+ `pairs`/`leftLabel` for matched banks).
- `photo` — one image per answer; `answers:[{t,keys,img,landmark}]`. Board uses a plain `<img>` (no Next
  optimizer, so any https host works). `landmark` shows **only on reveal**, so it is safe to put the
  location/answer there without spoiling play. Good fit for "name the X from an aerial/photo": set `img`
  to an Esri `export` URL per item and let players type the name. `photoAspect` controls the frame
  (`"1 / 1"` for square satellite tiles).
- `map` — click-the-region on `lib/<region>-geo.js` geometry; flags `noBorders` (blank silhouette),
  `erase` (wipe on click), `suddenDeath`, `mapImgPrompt` (flag prompt), `mapCapitalPrompt` (show a capital,
  click its country; each answer carries `cap`). New regions need a `lib/<region>-geo.js` and a `LOADERS`
  entry in `MapQuizBoard.jsx`.
- `geo-aerial` — pin-drop over a **single shared** live Esri tile basemap; `cities:[{name,lon,lat}]` plus a
  `basemap` block. Only works for places clustered in one area (a city, a resort). It does **not** fit
  subjects scattered worldwide — use `photo` with per-item aerials for those.
- Others: `timed-mcq`, `connections`, `word-scramble`, `matched`, `crux`, `logic-game`, `place-map`,
  `higher-lower`, `closer`, etc. Copy an existing quiz of the same format as the template.

## 5. Scoring and grandfathering

Scoring lives in `lib/quiz-scoring.js` / `lib/quiz-anon.js`. "Perfect" is `row.score === row.total`, and
each leaderboard row stores its own `total`. Because of that, **adding a new answer to an existing quiz
does not break prior perfect scores** — they were graded against the old total and stay perfect
automatically. No migration code is needed when you extend a quiz's answer set.

### IQ Points is the USER-FACING name; `xp` is the CODE name (owner rule, 2026-07-30)

The progression metric is called **IQ Points** everywhere a reader can see it. It was previously
called "XP"; the rename was display-only. Two vocabularies now coexist on purpose, do NOT
"clean this up" by unifying them:

- **Reader-facing copy says IQ Points.** Use the full "IQ Points" in prose, labels, headings, and
  empty states ("IQ Points earned", "Total IQ Points", "How IQ Points Work", "start earning IQ
  Points"). Use the bare short form **"IQ"** only where the full phrase would wrap or overflow:
  table column headers, chips, tab labels, and values sitting immediately after a number
  ("Level 7 · 1,240 IQ", "+96 IQ", the "IQ & Level" tab). Never write "XP" in reader-facing copy.
- **Code keeps `xp`.** Every identifier, prop, API response field, query param, route and DB column
  stays `xp` / `xp7d` / `xp30d` / `xpForLevel` / `xpTier` / `XP_REPLAY_FACTOR` /
  `XpTile` / `.xp-*` CSS classes / `/api/quiz/xp` / `?sort=xp30d`. Renaming any of those
  would need a migration and would break live rows for no reader benefit.
- **Grammar changed with the noun.** "XP" was a mass noun ("XP only goes up", "No XP this week");
  "IQ Points" is plural, so verbs and pronouns must agree ("IQ Points only go up", "there is no way
  to lose them and they never decay"). Watch this when writing new copy.
- Code COMMENTS use the reader vocabulary (IQ Points) even though the identifiers beside them say
  `xp`, so the two stay legible together.

### Points games vs answer games (read before touching a result payload)

Player stats (Completed, Accuracy, Correct, IQ Points) are computed in ANSWER terms, never in points.
`correctAnswersOf(row)` and `answeredOf(row)` in `lib/quiz-scoring.js` are the single place that
converts a stored row into that pair, and everything downstream (`lib/quiz-xp.js`, the champions
route, the anon board) must go through them rather than reading `score / total` directly. Three
kinds of row exist:

- **Answer games** (the default): `score` is already a correct-answer count and `total` the
  question count. Nothing to convert.
- **Points quizzes** (`timed-mcq`, `place-map`, `globe`, `geo-aerial`, anything with
  `maxPerQuestion > 1`): `score` is a time- or proximity-decayed points total. Correct is the
  recorded `correct_count`, else estimated as `round(score / total * questions)`.
- **Daily games** (every `<key>-M-D-YY` id, keys from `DAILY_KEYS`): `total` is the point maximum
  and `correct` is a 0/1 SOLVED flag, or an item count for the multi-part ones. Answered is
  therefore **1** for the binary games, **total / 2** for `links` / `garble` / `outrank` (2 points
  an item), and **total** for `crux` (whose `correct` IS the point score).

The daily branch was added 2026-07-21. Before it, `answeredOf` fell back to `total` for a daily, so
a solved Warmer scored 1 correct out of 100 answered: it read as 1% accuracy, dragged down every
daily player's average, and made a perfect daily impossible, which is why no daily had ever counted
toward the Completed star. **When you add a new daily game, add its key to `DAILY_KEYS` and, if it
is not a plain solved/not-solved game, to the `DAILY_HALF` set or the `crux` case in
`dailyAnswered`.** A daily whose payload does not fit either shape needs its own case, not a
`total` fallback.

IQ Points pay per correct answer, so a one-question daily would earn 1-2 IQ Points against 50+ for a large
name-them-all quiz. `XP_DAILY_ANSWERS` in `lib/quiz-xp.js` (currently 12) gives each daily a flat
answer-equivalent instead, pro-rated by solve share and scaled by difficulty like any other game.
Tune that constant to reprice the daily slate; it is the only knob.

## 6. Definition of done for a quiz change

- [ ] Facts/coordinates/images verified against a real source (visually, for anything geographic).
- [ ] Dept entry added; newest quiz has a hero; `publishedAt` stamped and newest-order confirmed.
- [ ] Key-collision scan clean.
- [ ] `node --check` + load passes with no holes; any edited board passes esbuild.
- [ ] Files staged to `C:\dev\sot-live`; user told which files to commit and what to spot-check on preview.

---

## 7. Daily game puzzle banks (`app/<game>/puzzles.js`)

The 20 daily games (crux, emcee, garble, links, span, dating, tally, suds, circa,
extra, carve, stet, outwit, tuck, alibi, cipher, ping, warmer, jester, sworn) each keep a dated `PUZZLES` array. These have failure modes a
`node --check` / "it parses" pass does **not** catch. **A puzzle that parses is not a puzzle
that is correct.** Before staging ANY daily puzzle — new or edited — run the checks below for
its game. Do not author a batch and ship on structural validation alone: that is exactly how
multi-solution and factual bugs reach players (learned the hard way — a Links board shipped
with four valid groupings, a Crux board with two, and three Span notes with false geography,
all of which "passed" structural checks).

**The solvers ARE in the repo now** (restored 2026-07-18). Run them after ANY bank edit:
- `node scripts/verify-daily-banks.mjs [game ...]` — suds/tally/carve (full uniqueness
  re-derivation + stored-sol match), garble (anagram + alternate-anagram scan), emcee
  (slot/grid consistency + dictionary review), links/crux (mechanical structure +
  crossing consistency; the SEMANTIC double-solution audit below stays manual), span
  (par = BFS incl. Sunday via/avoid), dating (strict ascending), circa/extra/outwit
  (structural; extra uses the client's own resolveHidden), outrank (structural PLUS
  the crowd-order uniqueness check in §7a: all house favorite-vote counts must be
  DISTINCT, hard-failed on editable boards). ~6s for everything.
- `node scripts/verify-alibi.mjs` / `verify-cipher.mjs` / `verify-tuck.mjs` /
  `verify-stet.mjs` / `verify-ping.mjs` / `verify-warmer.mjs` / `verify-jester.mjs` /
  `verify-sworn.mjs` — the per-game verifiers for the newer dailies.

### 7a. Solution uniqueness — the #1 rule for logic games

Every board of a logic game MUST have **exactly one** valid solution. "All the words are
unique" or "the grid geometry is valid" does NOT prove this — you must solve it.

- **Links & Crux (category filing):** the deadly bug is two words that each plausibly belong
  to the SAME two categories — they swap, yielding ≥2 valid groupings (a Connections-style
  double solution). A 3-cycle of collisions (A reads cat1/cat2, B reads cat2/cat3, C reads
  cat3/cat1) is almost always ambiguous. RULE: pin every trap word by elimination — its
  decoy category must ALREADY be full of that category's own true members, so the trap
  cannot actually be filed there. VERIFY with a solver, never by eye: build a *generous*
  membership matrix (for each word, EVERY category on the board it could plausibly read as),
  then count the partitions into the declared group shapes. The count MUST be 1. Classic
  traps that have bitten us: planet-names that are also Roman gods (Neptune/Saturn/Jupiter/
  Mercury), a gem that is also a shade (ruby/garnet), a word that is both a tree and a shade
  of green (olive/pine), boxing/dance/fishing overlaps (swing/hook/reel).
- **Suds / Tally / Carve (number games):** each board must have exactly one solution given
  its clues / rack / anchors. `scripts/verify-daily-banks.mjs` re-derives all three
  exhaustively and asserts the stored `sol` matches (Suds = standard sudoku; Tally =
  place the `bank` multiset to hit `rowT`/`colT`; Carve = connected equal-sum regions
  from the `seeds`).
- **UNIQUE IS NOT ENOUGH — verify DEDUCIBILITY (learned 2026-07-18):** a puzzle can have
  exactly one solution that is only reachable by guess-and-backtrack. Any game whose copy
  promises pure logic (Alibi, Cipher) must be solvable by human-standard moves with NO
  trial-and-error. `scripts/verify-alibi.mjs` enforces this with a propagation solver
  (eliminations, room↔object/time links, before-chain bounds, permutation singles/pairs) —
  9 of the first 14 Alibi cases were unique but guessy and 2 had to be regenerated. When
  banking a new logic game, build the equivalent no-guessing check FIRST.
- **Outrank (crowd order):** the house crowd (40 favorite votes) IS the answer key — the
  order the player must call. crowdOrderOf sorts `count desc, then DISPLAY INDEX`, and the
  display order is hand-mixed and carries NO signal, so any TIE in the house vote counts
  makes that boundary of the answer arbitrary: a pure-luck 2-point swing, the crowd analog
  of a Links/Crux double solution. RULE: every item's house count must be DISTINCT (exactly
  one unambiguous crowd order). `scripts/verify-daily-banks.mjs outrank` hard-fails a tie on
  any EDITABLE (live >= today) board; an already-live FROZEN board with a tie is grandfathered
  as a note (never edit a played day). Fix a tie by nudging single votes between the tied items
  to break it while PRESERVING the intended order and keeping the house at 40 with no zero-vote
  item. (23 of the first 30 boards shipped tied before this check existed; the 21 editable ones
  were repaired 2026-07-23, the 2 past boards left frozen.)

### 7b. Factual accuracy — verify, never recall (extends §0)

- **Span notes:** every geographic claim in a `note` must be checked against
  `app/span/borders.js`. NEVER write "X is the only country that borders Y" without listing
  Y's full neighbour set from `PAIRS` (Panama borders Costa Rica AND Colombia; Chile borders
  Argentina, Bolivia AND Peru). Every `par` must equal `shortestHops` BFS — and the
  *constrained* BFS for Sunday via/avoid. Recompute every route claim ("one road", "+1 hop")
  with the BFS helpers (`shortestHops`, `distancesFrom`) before writing it.
- **Dating / Circa / Extra:** every year/date must be web-verified, not recalled. Dating
  events MUST be in strictly ascending true chronological order — array index is the answer key.

### 7c. Word / content validity

- **Emcee / Crux:** every across/down (or grid) answer must be a real dictionary word; clues
  accurate and breakfast-table fair.
- **Garble:** each `scramble` must be a true anagram of its `answer` (and not equal to it),
  and the letters at each word's `marks` must together anagram to `final`. The client is
  EXACT-MATCH, so no answer may have an alternate anagram that is a COMMON word (MELON vs
  LEMON would wrongly reject a fair unscramble) — verify-daily-banks flags alternates;
  obscure-dictionary alternates are fine, common ones are not.
- **Tuck:** every rack 14 letters / 4-6 vowels, and the stored `par` must be ACHIEVABLE —
  verify-tuck re-runs the ladder solver and fails otherwise. The dictionary asset
  (public/tuck-dict.txt) is player-facing validation: re-apply the slur blocklist any time
  it is regenerated from the npm word-list source (20 were scrubbed 2026-07-18).
- **Cipher:** every equation machine-verified to EXACTLY ONE solution, ≤10 letters,
  rhs length in [max(lhs), max(lhs)+1] — verify-cipher brute-forces all of it. Curate
  themes; random word combos read ugly.
- **Alibi:** unique solution AND pure-deduction solvable (see §7a); the stored solution
  must match the derived one; clue counts 8-11; venues/stolen items distinct across the
  bank. The client never receives the solution — page.js strips it (keep it that way).
- **Jester:** every board an n×n partition into n contiguous regions (min size 2),
  EXACTLY ONE seating by exhaustive count, matching the stored solution, AND solvable
  by the human-move propagation solver (singles, confinement, single-placement
  lookahead — no trial-and-error). 8×8 weekdays, 9×9 Sundays. verify-jester runs all
  of it. Solutions are stripped by page.js — keep it that way.
- **Sworn:** every case EXACTLY ONE consistent (thief, liar-set) world by brute force,
  matching the stored solution, AND §7a-deducible: per candidate thief, parity
  propagation + the liar-count bound must settle the branch with a human-small case
  fan-out (≤4) and no search. 5 suspects weekdays, 6 Sundays; venues/stolen distinct
  across the bank. verify-sworn runs all of it. Solutions stripped by page.js.

### 7d. Definition of done for a daily puzzle change

- [ ] Ran the game's uniqueness/validity solver; every affected board returns exactly ONE
      solution (logic games), all-distinct house counts / one unambiguous crowd order (Outrank),
      or passes its content checks (word/anagram validity).
- [ ] All facts (Span borders/pars/notes; Dating/Circa/Extra dates) verified against a real
      source or `borders.js`, never memory.
- [ ] `quizId` matches `live`; `dateLabel` matches; the `sunday` flag matches the real weekday.
- [ ] Applied on-device durably and re-verified ON the device — a container re-stage can serve
      a stale cached copy of a file you just overwrote.

### 7e. Banking a new daily puzzle - shared mechanics (EVERY game)

Every daily lives in `app/<game>/puzzles.js` as an entry in the exported `PUZZLES` array. To add a
day, APPEND the new object just before the array's closing `];`, matching the file's existing code
style byte for byte. The server page (`app/<game>/page.js`) filters `live <= today` before sending
puzzles to the client, and the logic games additionally STRIP the solution, so future answers never
ship to the browser.

Four identity fields must all agree (verifiers cross-check them):
- `num`: previous entry's num + 1 (contiguous, 1-based; never skip or reuse).
- `quizId`: `'<game>-M-D-YY'`, month/day with NO leading zero, two-digit year (e.g. `garble-8-1-26`).
- `live`: ISO `'YYYY-MM-DD'`.
- `dateLabel`: `'Month D, YYYY'` (e.g. `'August 1, 2026'`).

`sunday` flag: TRUE only when the drop's real Eastern-time weekday is Sunday AND the game runs a
Sunday Edition (registry: `lib/sunday-editions.js`). A Sunday board uses that game's bigger/harder
variant (see §7f); a weekday board uses the standard size. A game NOT in the registry never sets
`sunday: true`. The puzzle-level `sunday` flag plus `isSundayET` are the ONLY truth; never infer a
Sunday from board size or guess count.

Run the game's verifier after ANY edit (a parse is NOT a pass, per §0/§7a):
- `node scripts/verify-daily-banks.mjs [game...]` covers crux, emcee, garble, links, span, dating,
  tally, suds, carve, circa, extra, outwit, outrank.
- Standalone: `verify-alibi.mjs`, `verify-cipher.mjs`, `verify-jester.mjs`, `verify-ping.mjs`,
  `verify-sworn.mjs`, `verify-stet.mjs`, `verify-tuck.mjs`, `verify-warmer.mjs`.

GOTCHA - two verifiers hardcode the expected bank size: `verify-jester.mjs` and `verify-sworn.mjs`
contain `if (PUZZLES.length !== N)`. When you add a board to jester or sworn you MUST bump that `N`
in the SAME commit, or the verifier fails on an otherwise-correct board. The other verifiers count
dynamically and need no bump.

Deploy: dailies are NOT lists, so NO consensus-check cron and NO IndexNow ping. Ship the changed
`app/<game>/puzzles.js` files (plus any verifier count bump) as ONE multi-file commit, spliced onto a
fresh origin blob per the stale-base rule in the main CLAUDE.md.

### 7f. Per-game creation reference (all 20 daily games)

Each entry: concept | weekday shape (-> Sunday Edition variant, if any) | key authoring rules |
verifier. All obey §7e (identity fields, append-before-`];`, sunday flag) and §7a-§7c.

WORD / CROSSWORD
- crux - clueless crossword: place category words into a grid. Weekday 8 hidden words -> Sunday 12
  (27 guesses). Every grid answer a real word; EXACTLY ONE valid filing (the §7a double-solution trap
  applies). verify-daily-banks crux (structure + crossings; the semantic double-solution audit is MANUAL).
- emcee - daily mini crossword. Weekday 5x5 / 10 words -> Sunday 7x7 pinwheel / 22 words. `grid` uses
  '#' for a block else the solution letter; `across`/`down` are {n,r,c,len,clue} with standard
  numbering; EVERY across/down run must be a real, common (breakfast-table) word. verify-daily-banks emcee.
- garble - unscramble five words; the letters at each answer's `marks`, concatenated in order,
  anagram to `final`. Weekday five 5-letter answers + a 10-letter `final` -> Sunday six-letter answers.
  Each `scramble` is a true anagram of its answer and NOT equal to it; NO answer may have an alternate
  COMMON-word anagram (obscure ones are fine); `clue` riddles the `final`. verify-daily-banks garble.
- links - Connections. Four groups of four, ordered easiest -> trickiest. Weekday >= 2 cross-category
  collisions -> Sunday four. EXACTLY ONE valid grouping (pin every trap word: its decoy group must
  already be full of true members). MANDATORY manual proof: build a generous membership matrix and
  brute-force that the partition count == 1. verify-daily-banks links + manual audit.
- tuck - tile-tucking: a 14-letter rack (Sunday 15), 4-6 vowels; `par` must be a score the ladder
  solver actually achieves AND >= 45. verify-tuck.mjs (recomputes par from public/tuck-dict.txt).
- warmer - semantic hotter/colder. `order` is a full permutation of the 32,300-word VOCAB by
  GloVe-6B-100d cosine similarity to the secret word, most-similar first, so `order[0]` is the
  answer's index. Weekday answer is a common word (historical vocab rank ~450-3500) -> Sunday a rarer
  word (rank > 5000). No answer may repeat across the bank. Build `order` from REAL GloVe-6B-100d
  vectors (npm `wink-embeddings-sg-100d`, or gensim `glove-wiki-gigaword-100`) - never a fake or
  random order. verify-warmer.mjs.

LOGIC (must be UNIQUE and human-deducible with NO trial-and-error; page.js strips the solution)
- alibi - whodunit grid. Weekday 4 suspects/rooms/objects/times -> Sunday 5 (15 facts). 8-11 clues
  (types: notRoom, notObj, roomObj, roomTime, before, beforeRoom, hasObj); stored `solution` matches
  the unique, purely-deducible answer. Fresh suspects/venue/stolen. verify-alibi.mjs.
- jester - Star Battle (one jester per row, column, and region). Weekday 8x8 -> Sunday 9x9 Jubilee.
  `regions[r][c]` = region id; `solution[r]` = column; contiguous regions, EXACTLY ONE placement,
  human-deducible. verify-jester.mjs. (Bump its hardcoded count per §7e.)
- sworn - liars. Weekday 5 suspects -> Sunday 6. One statement per suspect (array position = speaker);
  an honest speaker's statement is TRUE, a liar's is FALSE; EXACTLY ONE (thief, liar-set) world,
  §7a-deducible. Fresh suspects/venue/stolen. verify-sworn.mjs. (Bump its hardcoded count per §7e.)
- cipher - cryptarithm. Weekday 2 addends -> Sunday 3. `lhs` words + `rhs` sum; distinct digit per
  letter, nonzero leading letters, EXACTLY ONE solution, <= 10 distinct letters, rhs length in
  [max(lhs word length), that + 1]. Curate a THEMED equation, not letter soup. verify-cipher.mjs
  (brute-forces every equation).

NUMBERS (exactly one solution given the clues)
- tally - balance the books: place the `bank` multiset to hit each `rowT`/`colT`. Weekday 5x5 ->
  Sunday 6x6. verify-daily-banks tally (re-derives the unique solution).
- suds - daily sudoku; the givens admit exactly one solution. Sunday harder, fewer givens.
  verify-daily-banks suds.
- carve - partition the grid into connected equal-sum regions, one `seed` each. Sunday 7x7 in nine
  blocks. verify-daily-banks carve.

GEOGRAPHY
- span - cross the map by border hops. `start`/`end`/`par`/`note`; `par` = BFS-minimum border hops on
  `app/span/borders.js` (COMPUTE it, never guess). Weekday no twist -> Sunday a `via`/`avoid` twist
  scored by CONSTRAINED BFS. Every `note` claim must be checked against borders.js (list Y's full
  neighbor set before any "only country bordering Y"). verify-daily-banks span.
- ping - find the secret city. City drawn from `lib/ping-cities.js`; `lat`/`lng` MUST match that
  file's entry (verifier enforces); never reuse a banked city. Weekday a well-known city -> Sunday a
  trickier, out-of-the-way one. verify-ping.mjs.

HISTORY
- dating - order events in time. Five events (Sunday six) authored in TRUE ascending order (array
  index is the answer key); `when` is the numeric year (negative = BC) and every year must be
  WEB-VERIFIED; `theme` spoiler-free; per-event `d` story; end `note`. verify-daily-banks dating.
- extra - name the story. RETIRING at No. 77 on 2026-09-29, the end of its bank; never bank
  another day (see 7g). Hidden specs resolve via the client's `resolveHidden`; every date
  web-verified; Sunday a trickier story. verify-daily-banks extra.

COPY-DESK
- stet - spot the error. Five sentences (Sunday seven), 0-1 errors each (Sunday 0-2). Each error is a
  REAL word so spellcheck passes (eggcorn, homophone, malaprop, grammar slip); `wrong` appears exactly
  once; `fix` is a single token, != wrong, not already in the sentence; a clean sentence (errors: [])
  carries a bait `cleanNote`; every `wrong`->`fix` pair is unique across the bank. verify-stet.mjs.

CROWD PSYCHOLOGY (a pre-written house crowd seeds the pool until >10 real players; see main CLAUDE.md)
- outwit - beat the crowd. Five prompts in FIXED order least, herd, match, unique, twothirds (Sunday
  six, the extra a second Rare Bird). Each choice/unique prompt carries a ~48-index `house` crowd;
  herd carries `truth`/`truthNote`; the twothirds "Undercut" runs LAST and carries the day's `frac`
  + `fracLabel` (from 1/3, 2/5, 1/2, 3/5, 2/3, 7/10, 3/4, 4/5, never repeating on back-to-back days).
  verify-daily-banks outwit.
- outrank - call the crowd's order. Weekday 6 items -> Sunday 7. `house` = 40 favorite votes (item
  indices); every item's vote count must be DISTINCT so the crowd order is unambiguous (§7a); themes
  never reused. verify-daily-banks outrank.

(circa is RETIRED - the archive stays playable, but no new drops are banked. extra retires
2026-09-29 on the same terms. See 7g.)

### 7g. Retired daily games - NEVER bank new inventory for these

A retired daily keeps scoring every archived day and stays playable at its own route and in the
Retired section of `/daily`, but it runs no new puzzles. The roster and each game's FINAL live
date are `RETIRED_DAILY` in `lib/daily-games.js`; `isRetiredDaily(key)` compares that date to
Eastern today, so the retirement lands by itself on the morning after the last drop, with no
deploy on the day. Every hub surface (games grid, home strip, slate rail, promo, end-card slate,
the day roster in `app/useDayStats.js`, and the Completionist count in `lib/quiz-trophies.js`)
already reads that helper, so retiring a game is one row in `RETIRED_DAILY` plus a retired banner
in its own client.

| game | last drop | ruling | successor |
|---|---|---|---|
| circa | 2026-07-20 | owner, 2026-07-20; bank capped at No. 7 | Outrank |
| extra | 2026-09-29 | owner, 2026-08-07; bank ends at No. 77 | Redact |

**HARD RULE: "grow all game inventory" NEVER includes a retired game.** When the owner asks to
grow, extend, top up, refill or backfill the daily banks - however it is phrased, whichever games
are named, and however far ahead the other banks are being pushed - a game in `RETIRED_DAILY` is
NOT part of that instruction. Do not append a single entry to `app/circa/puzzles.js` or
`app/extra/puzzles.js`. Do not "add a few to keep it alive", do not treat its short bank as a gap
to close, and do not let a bulk-extension pass walk it just because it appears in `DAILY_KEYS`
(it stays there so its archive keeps scoring). Any script that iterates the games MUST skip every
key in `RETIRED_DAILY`. Extending a retired bank un-retires the game, which is the owner's call
alone, so ask before adding even one day.
